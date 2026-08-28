import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Radio, 
  Mic, 
  Calendar, 
  AlertCircle, 
  Play, 
  FileText, 
  Sparkles, 
  Fuel,
  Moon, 
  RotateCw,
} from 'lucide-react';
import { VoiceRecorderModal } from './VoiceRecorderModal.tsx';
import { ReportCertificateModal } from '../reports/ReportCertificateModal.tsx';

interface OffDutyViewProps {
  onDutyStarted: (duty: any) => void;
  reports: any[];
  onRefreshData: () => void;
}

export const OffDutyView: React.FC<OffDutyViewProps> = ({
  onDutyStarted,
  reports,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | undefined>();
  const [voiceTranscription, setVoiceTranscription] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated time window override toggle for easy testing
  const [forceReportWindow, setForceReportWindow] = useState<boolean>(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  // Target reporting time: 5:50 PM (17:50) for night shift
  // In 24h format, 5:50 PM is 17:50
  const isExactReportTimeOrPast = forceReportWindow || (hours > 17 || (hours === 17 && minutes >= 50));

  const handleStartDuty = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const duty = await api.startDuty({
        stationId: user?.stationId || undefined,
        arrivalNotes: arrivalNotes || 'Night shift check-in recorded for fuel station security post.',
        arrivalAudioUrl: voiceAudioUrl,
        arrivalTranscription: voiceTranscription,
      });
      onDutyStarted(duty);
      onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to report on duty.');
    } finally {
      setLoading(false);
    }
  };

  const formattedTimeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDateStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Off-Duty Status & Fuel Station Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Fuel Station Security Terminal • Standby
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Badge ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, Officer {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
            <Fuel className="w-4 h-4 text-amber-400 shrink-0" />
            Assigned Station: <strong className="text-slate-200">{user?.stationName || 'North Gate Fuel Station'}</strong>
          </p>
        </div>

        {/* Live Standby Clock */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Current Station Clock</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
              {formattedTimeStr}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">{formattedDateStr}</p>
          </div>
        </div>
      </div>

      {/* 5:50 PM Reporting Window Trigger Box */}
      <div 
        id="reporting-window-banner"
        className={`p-6 rounded-2xl border transition-all ${
          isExactReportTimeOrPast
            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-blue-950/40 border-emerald-500/50 shadow-2xl shadow-emerald-950/30'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isExactReportTimeOrPast
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 animate-pulse'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              {isExactReportTimeOrPast ? (
                <Radio className="w-7 h-7" />
              ) : (
                <Moon className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isExactReportTimeOrPast
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                }`}>
                  {isExactReportTimeOrPast ? '🟢 5:50 PM Reporting Window Active' : '🌙 Night Shift Check-In (18:00 - 06:00)'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Reporting Target: <strong className="text-slate-200">5:50 PM (17:50)</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isExactReportTimeOrPast ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 inline" />
                    Night Shift Online Reporting Window Open
                  </span>
                ) : (
                  'Night Shift Scheduled (18:00 - 06:00)'
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isExactReportTimeOrPast
                  ? 'The 5:50 PM pre-shift reporting window is now open. Enter your arrival notes below and click "Report Online & Start Duty" to enter the active terminal.'
                  : 'Night shift schedule: 18:00 - 06:00. The official reporting window activates at 5:50 PM (17:50). You can enter arrival notes and check in below.'}
              </p>
            </div>
          </div>

          {/* Quick Simulation / Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!isExactReportTimeOrPast && (
              <button
                type="button"
                onClick={() => setForceReportWindow(!forceReportWindow)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                title="Toggle 5:50 PM Reporting Window simulation"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate 5:50 PM Window</span>
              </button>
            )}

            <button
              onClick={() => handleStartDuty()}
              disabled={loading}
              className={`flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 ${
                isExactReportTimeOrPast
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40 ring-2 ring-emerald-400/40 animate-bounce sm:animate-none'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? 'Connecting...' : 'Report Online & Start Duty'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Check-in & Standby Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive "Report On Duty" Check-in Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Night Shift Check-In</h3>
                  <p className="text-xs text-slate-400">Scheduled: 18:00 – 06:00 • 5:50 PM reporting window</p>
                </div>
              </div>

              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                Night Shift Only
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Night Shift Info Banner */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Night Shift Fuel Station Security</p>
                  <p className="text-[11px] text-slate-400 font-mono">18:00 - 06:00 (Online Reporting at 17:50 / 5:50 PM)</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Active Schedule
              </span>
            </div>

            {/* Arrival Status Notes & Voice Dictation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Arrival Status Notes:
                </label>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Voice Note
                </button>
              </div>
              <textarea
                rows={4}
                value={arrivalNotes}
                onChange={(e) => setArrivalNotes(e.target.value)}
                placeholder="E.g., Arrived on station at 17:50. Main fuel forecourt, dispenser pumps, storage tank area, and cashier booth secure."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
              />

              {voiceTranscription && (
                <div className="mt-2 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300">
                  <p className="font-semibold text-[11px] text-blue-400 uppercase tracking-wider mb-0.5">
                    🎙️ Attached Voice Transcription:
                  </p>
                  <p className="italic">"{voiceTranscription}"</p>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleStartDuty()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{loading ? 'Registering On Duty...' : 'Report Online & Start Duty'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Station Summary & Past Reports Archive */}
        <div className="space-y-6">
          {/* Post Information Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              Fuel Station Security Post
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Fuel Station</span>
                <span className="font-semibold text-white">{user?.stationName || 'North Gate Fuel Station'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Station Code</span>
                <span className="font-mono text-blue-400 font-semibold">{user?.stationId || 'ST-01'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Supervisor in Charge</span>
                <span className="font-semibold text-slate-200">Insp. Samuel Adams</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Radio Frequency</span>
                <span className="font-mono text-emerald-400 font-bold">CH-04 (156.800 MHz)</span>
              </div>
            </div>
          </div>

          {/* Past Shift Reports Archive */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                My Shift Reports ({reports.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {reports.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950 text-center text-slate-500 text-xs">
                  No previous shift reports on record yet.
                </div>
              ) : (
                reports.slice(0, 4).map((r) => {
                  const isSigned = r.status === 'SIGNED';
                  const isReturned = r.status === 'RETURNED_FOR_CORRECTION';
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{r.stationName}</p>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-850 px-1.5 py-0.5 rounded">
                            {r.verificationCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.reportDate}</p>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        isSigned
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isReturned
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {isSigned ? 'SIGNED' : isReturned ? 'RETURNED' : 'PENDING'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Night Shift Arrival Voice Dictation"
        onTranscriptionComplete={(text, audioUrl) => {
          setVoiceTranscription(text);
          setVoiceAudioUrl(audioUrl);
          setArrivalNotes((prev) => (prev ? `${prev} ${text}` : text));
        }}
      />

      {/* Report Certificate Modal */}
      <ReportCertificateModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};
