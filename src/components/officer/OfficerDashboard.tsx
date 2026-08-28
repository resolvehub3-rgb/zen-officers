import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { 
  Shield, 
  FileText, 
  Footprints, 
  Mic, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  FileCheck, 
  AlertCircle,
  Play,
  Square,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

import { StartDutyModal } from './StartDutyModal.tsx';
import { OccurrenceModal } from './OccurrenceModal.tsx';
import { PatrolModal } from './PatrolModal.tsx';
import { VoiceRecorderModal } from './VoiceRecorderModal.tsx';
import { FinalReportModal } from './FinalReportModal.tsx';
import { ReportCertificateModal } from '../reports/ReportCertificateModal.tsx';
import { OffDutyView } from './OffDutyView.tsx';

export const OfficerDashboard: React.FC = () => {
  const { user, activeDuty, setActiveDuty } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStartDutyOpen, setIsStartDutyOpen] = useState(false);
  const [isOccurrenceOpen, setIsOccurrenceOpen] = useState(false);
  const [isPatrolOpen, setIsPatrolOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isFinalReportOpen, setIsFinalReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Active shift ticking stopwatch
  const [shiftDuration, setShiftDuration] = useState<string>('00:00:00');

  const fetchData = async () => {
    try {
      const [dutyRes, reportsRes, occurRes] = await Promise.all([
        api.getActiveDuty(),
        api.getFinalReports(),
        api.getOccurrences(),
      ]);
      setActiveDuty(dutyRes || null);
      setReports(reportsRes || []);
      setOccurrences(occurRes || []);
    } catch (e) {
      console.error('Failed to load officer data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    const handleDutyUpdate = () => fetchData();
    const handleReportSigned = () => fetchData();

    socket.on('duty:started', handleDutyUpdate);
    socket.on('duty:ended', handleDutyUpdate);
    socket.on('report:signed', handleReportSigned);
    socket.on('report:returned', handleReportSigned);

    return () => {
      socket.off('duty:started', handleDutyUpdate);
      socket.off('duty:ended', handleDutyUpdate);
      socket.off('report:signed', handleReportSigned);
      socket.off('report:returned', handleReportSigned);
    };
  }, []);

  // Timer calculation
  useEffect(() => {
    if (!activeDuty || !activeDuty.startTime) {
      setShiftDuration('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeDuty.startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - start) / 1000));

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setShiftDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDuty]);

  // If security officer is off-duty, show the dedicated Off-Duty Standby & Shift Reporting UI
  if (!activeDuty) {
    return (
      <OffDutyView
        onDutyStarted={(duty) => {
          setActiveDuty(duty);
          fetchData();
        }}
        reports={reports}
        onRefreshData={fetchData}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Officer Welcome & Station Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Security Officer Terminal
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            Assigned Station: <strong className="text-slate-200">{user?.stationName || 'North Gate Station'}</strong>
          </p>
        </div>

        {/* Quick Shift Trigger */}
        <div>
          {activeDuty ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFinalReportOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
              >
                <Square className="w-4 h-4 fill-white" />
                End Shift & Submit Final Report
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsStartDutyOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Duty Shift
            </button>
          )}
        </div>
      </div>

      {/* Main Duty Status Hero Card (Mobile-First / High Contrast) */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          activeDuty
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                activeDuty
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeDuty ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {activeDuty ? 'CURRENTLY ON DUTY' : 'CURRENTLY OFF DUTY'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeDuty
                  ? `Shift commenced at ${new Date(activeDuty.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Recording operational telemetry`
                  : 'Ready to commence scheduled shift. Click Start Duty to register arrival.'}
              </p>
            </div>
          </div>

          {activeDuty && (
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Shift Elapsed Time</p>
                <p className="text-base font-mono font-bold text-emerald-400 tracking-wider">
                  {shiftDuration}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Touch Cards (4-Grid Clean Night Ops) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Operational Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: Night Occurrence Log */}
          <button
            onClick={() => {
              if (!activeDuty) setIsStartDutyOpen(true);
              else setIsOccurrenceOpen(true);
            }}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 shadow-lg text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Night Occurrence
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Log vehicle activity, delivery, unusual event, or safety notice
              </p>
            </div>
          </button>

          {/* Action 2: Patrol Sweep */}
          <button
            onClick={() => {
              if (!activeDuty) setIsStartDutyOpen(true);
              else setIsPatrolOpen(true);
            }}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 shadow-lg text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Patrol Sweep
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Log rounds on pumps, underground tanks & perimeter
              </p>
            </div>
          </button>

          {/* Action 3: Voice Report */}
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 shadow-lg text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Voice Report
                </h4>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Dictate station findings with voice transcription
              </p>
            </div>
          </button>

          {/* Action 4: My Shift Reports & Signatures */}
          <button
            onClick={() => {
              if (reports.length > 0) setSelectedReport(reports[0]);
            }}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 shadow-lg text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                My Reports ({reports.length})
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Review verified shift reports & manager signatures
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Activity + Security Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Shift Reports & Occurrences */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Shift Reports & Duty Records
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time sync</span>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No previous shift reports on record yet.</p>
              </div>
            ) : (
              reports.slice(0, 5).map((r) => {
                const isSigned = r.status === 'SIGNED';
                const isPending = r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED';
                const isReturned = r.status === 'RETURNED_FOR_CORRECTION';

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                          isSigned
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isReturned
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {isSigned ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : isReturned ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <FileCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{r.stationName}</p>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {r.verificationCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-1">{r.summary}</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">
                          Date: {r.reportDate} • {r.patrolsCount || 0} Patrols • {r.occurrencesCount || 0} Occurrences
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isSigned
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isReturned
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isSigned ? 'SIGNED & SEALED' : isReturned ? 'RETURNED' : 'PENDING APPROVAL'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Quick Guidelines & Safety Protocol */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Standard Operating Protocols
          </h3>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h5 className="text-xs font-bold text-white">Fuel Forecourt Arrival</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Log online at 17:50 (5:50 PM) for the night shift. Add initial arrival status notes on fuel forecourt and storage tanks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h5 className="text-xs font-bold text-white">Station Patrol Rounds</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Conduct regular sweeps around dispenser pumps, underground storage tanks, marts, and tanker discharge bays.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h5 className="text-xs font-bold text-white">Fuel Hazard & Occurrence Logging</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Immediately log fuel leaks, unauthorized entry, fire hazards, or suspicious persons for immediate Head Office alert.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <h5 className="text-xs font-bold text-white">Shift Conclusion</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Conclude night duty at 06:00, generate the sealed shift report, and submit for Station Manager digital verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StartDutyModal
        isOpen={isStartDutyOpen}
        onClose={() => setIsStartDutyOpen(false)}
        onSuccess={(duty) => {
          setActiveDuty(duty);
          fetchData();
        }}
      />

      <OccurrenceModal
        isOpen={isOccurrenceOpen}
        onClose={() => setIsOccurrenceOpen(false)}
        activeDuty={activeDuty}
        onSuccess={() => fetchData()}
      />

      <PatrolModal
        isOpen={isPatrolOpen}
        onClose={() => setIsPatrolOpen(false)}
        activeDuty={activeDuty}
        onSuccess={() => fetchData()}
      />

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Security Voice Report Dictation"
        onTranscriptionComplete={(text, audioUrl) => {
          if (!activeDuty) {
            setIsStartDutyOpen(true);
          } else {
            setIsOccurrenceOpen(true);
          }
        }}
      />

      <FinalReportModal
        isOpen={isFinalReportOpen}
        onClose={() => setIsFinalReportOpen(false)}
        activeDuty={activeDuty}
        onSuccess={() => {
          setActiveDuty(null);
          fetchData();
        }}
      />

      <ReportCertificateModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};
