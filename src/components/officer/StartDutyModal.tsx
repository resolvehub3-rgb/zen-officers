import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Clock, MapPin, Mic, Check, X, AlertCircle } from 'lucide-react';
import { VoiceRecorderModal } from './VoiceRecorderModal.tsx';

export const StartDutyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (duty: any) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [arrivalNotes, setArrivalNotes] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | undefined>();
  const [voiceTranscription, setVoiceTranscription] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const duty = await api.startDuty({
        stationId: user?.stationId || undefined,
        arrivalNotes: arrivalNotes || 'Arrived on station on time. Uniform, gear, and duty post verified.',
        arrivalAudioUrl: voiceAudioUrl,
        arrivalTranscription: voiceTranscription,
      });
      onSuccess(duty);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start duty.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Commence Duty Shift</h3>
                <p className="text-xs text-slate-400">Record arrival and start operational logging</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Station and Officer Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Assigned Station
                </span>
                <span className="font-bold text-white">{user?.stationName || 'Main Station'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Officer on Duty
                </span>
                <span className="font-bold text-white">
                  {user?.firstName} {user?.lastName} ({user?.employeeId})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Shift Start Time
                </span>
                <span className="font-mono font-semibold text-blue-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Server UTC)
                </span>
              </div>
            </div>

            {/* Arrival Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Arrival Status & Handover Observations
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
                rows={3}
                value={arrivalNotes}
                onChange={(e) => setArrivalNotes(e.target.value)}
                placeholder="E.g., Arrived at station on time. Took over post from previous shift. Security equipment in order..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
              />
            </div>

            {voiceTranscription && (
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300">
                <p className="font-semibold text-[11px] text-blue-400 uppercase tracking-wider mb-0.5">
                  🎙️ Attached Voice Transcription:
                </p>
                <p className="italic">"{voiceTranscription}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Starting Shift...' : 'Confirm Arrival & Start Duty'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Record Arrival Voice Report"
        onTranscriptionComplete={(text, audioUrl) => {
          setArrivalNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
          setVoiceTranscription(text);
          if (audioUrl) setVoiceAudioUrl(audioUrl);
        }}
      />
    </>
  );
};
