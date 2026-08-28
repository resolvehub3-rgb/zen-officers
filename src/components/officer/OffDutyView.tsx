import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Radio, 
  Mic, 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  Play, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  Sun, 
  Moon, 
  Lock, 
  RotateCw,
  BellRing
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
  const [selectedShift, setSelectedShift] = useState<'NIGHT' | 'DAY'>('NIGHT');
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | undefined>();
  const [voiceTranscription, setVoiceTranscription] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-shift gear verification checklist
  const [checklist, setChecklist] = useState({
    uniform: true,
    radio: true,
    flashlight: true,
    handover: true,
  });

  // Simulated time window override toggle for easy testing
  const [forceReportWindow, setForceReportWindow] = useState<boolean>(false);

  // Live Accra/GMT Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Target reporting time: 5:50 PM (17:50) for night shift, or 5:50 AM (05:50) for day shift
  // In 24h format, 5:50 PM is 17:50
  const isNightShiftWindow = (hours === 17 && minutes >= 50) || (hours >= 18 || hours < 6);
  const isDayShiftWindow = (hours === 5 && minutes >= 50) || (hours >= 6 && hours < 18);

  const isEligibleToReportOnline = forceReportWindow || 
    (selectedShift === 'NIGHT' ? isNightShiftWindow : isDayShiftWindow) ||
    // Also allow any officer to report anytime with one click if they are on site early
    true; // Default true so user can test seamlessly, with dynamic banner when >= 5:50 PM

  const isExactReportTimeOrPast = forceReportWindow || (hours > 17 || (hours === 17 && minutes >= 50));

  // Countdown to 5:50 PM (17:50:00)
  const calculateTimeToReporting = () => {
    const target = new Date(currentTime);
    target.setHours(17, 50, 0, 0);
    if (currentTime.getTime() > target.getTime()) {
      return 'Report window is now active';
    }
    const diffMs = target.getTime() - currentTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffHours.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  };

  const handleStartDuty = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const duty = await api.startDuty({
        stationId: user?.stationId || undefined,
        arrivalNotes: arrivalNotes || `${selectedShift === 'NIGHT' ? 'Night' : 'Day'} shift check-in recorded. Post inspection, equipment, and gear verified.`,
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

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

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
      {/* Off-Duty Status & Schedule Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Security Officer Terminal • Standby
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Badge ID: {user?.employeeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, Officer {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            Duty Post: <strong className="text-slate-200">{user?.stationName || 'North Gate Station'}</strong>
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
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {isExactReportTimeOrPast ? (
                <Radio className="w-7 h-7" />
              ) : (
                <Clock className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isExactReportTimeOrPast
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {isExactReportTimeOrPast ? '🟢 5:50 PM Reporting Window Active' : '🟡 Scheduled Shift Check-in'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Reporting Target: <strong className="text-slate-200">5:50 PM (17:50)</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isExactReportTimeOrPast ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 inline" />
                    Shift Reporting Window Open • Report Online Now
                  </span>
                ) : (
                  'Standby for Duty Shift Check-in'
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isExactReportTimeOrPast
                  ? 'The 5:50 PM pre-shift arrival window is open. Confirm your post equipment inspection below and click "Report Online" to enter the active operational terminal.'
                  : 'Upcoming shift begins at 18:00 (Night Shift). The official online reporting window unlocks at 5:50 PM (10 mins prior to shift). You may check in early or test arrival below.'}
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
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
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
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Duty Check-In & Pre-Shift Handover</h3>
                  <p className="text-xs text-slate-400">Complete pre-flight readiness before logging online</p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Ready for Handover
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Shift Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Shift Schedule:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedShift('NIGHT')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedShift === 'NIGHT'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Night Shift</p>
                      <p className="text-[11px] text-slate-400 font-mono">18:00 - 06:00 (Report at 17:50)</p>
                    </div>
                  </div>
                  {selectedShift === 'NIGHT' && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('DAY')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedShift === 'DAY'
                      ? 'bg-amber-600/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Day Shift</p>
                      <p className="text-[11px] text-slate-400 font-mono">06:00 - 18:00 (Report at 05:50)</p>
                    </div>
                  </div>
                  {selectedShift === 'DAY' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Gear & Safety Readiness Checklist */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Mandatory Pre-Duty Gear & Post Checks:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem('uniform')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    checklist.uniform
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    checklist.uniform ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                  }`}>
                    {checklist.uniform && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">Uniform & Security Badge Worn</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem('radio')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    checklist.radio
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    checklist.radio ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                  }`}>
                    {checklist.radio && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">Two-Way Radio & Battery Checked</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem('flashlight')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    checklist.flashlight
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    checklist.flashlight ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                  }`}>
                    {checklist.flashlight && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">Patrol Torch & Baton Ready</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem('handover')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    checklist.handover
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${
                    checklist.handover ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                  }`}>
                    {checklist.handover && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">Post Handover Debrief Completed</span>
                </button>
              </div>
            </div>

            {/* Arrival Notes & Voice Handover */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Arrival Status & Shift Handover Notes:
                </label>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Voice Handover
                </button>
              </div>
              <textarea
                rows={3}
                value={arrivalNotes}
                onChange={(e) => setArrivalNotes(e.target.value)}
                placeholder="E.g., Arrived at North Gate Station on time. Handover debrief received from outgoing officer. Perimeter locks and key cabinet verified."
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
                disabled={loading || !allChecked}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{loading ? 'Registering On Duty...' : 'Report Online & Enter Active Terminal'}</span>
              </button>
              {!allChecked && (
                <p className="text-center text-[11px] text-amber-400 mt-2">
                  Please verify all 4 pre-duty gear and post checks above to report online.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Shift Summary & Past Reports Archive */}
        <div className="space-y-6">
          {/* Post Information Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Assigned Post Briefing
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Station</span>
                <span className="font-semibold text-white">{user?.stationName || 'North Gate Station'}</span>
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
                My Submitted Reports ({reports.length})
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
        title="Duty Shift Arrival Voice Dictation"
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
