import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Footprints, 
  MapPin, 
  Camera, 
  Mic, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Fuel
} from 'lucide-react';
import { VoiceRecorderModal } from './VoiceRecorderModal.tsx';

export const PatrolModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeDuty: any;
  onSuccess: (report: any) => void;
}> = ({ isOpen, onClose, activeDuty, onSuccess }) => {
  const { user } = useAuth();
  const [locationTag, setLocationTag] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | undefined>();
  const [voiceTranscription, setVoiceTranscription] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const fuelStationCheckpoints = [
    'Forecourt & Dispenser Pumps',
    'Underground Fuel Storage Tanks',
    'Cashier Booth & Mini-Mart',
    'Tanker Discharge Bay',
    'Rear Perimeter Fence & Wall',
    'Air / Water Service Island',
    'Generator & Electrical Bay',
    'Vehicle Ingress & Egress Lanes',
  ];

  const quickObservationSnippets = [
    'All pump dispenser nozzle locks secure & in place.',
    'Underground tank dip caps locked; no fuel leaks detected.',
    'Forecourt canopy lights and boundary floodlights fully lit.',
    'Cashier booth & mart entrance locked; area quiet.',
    'Perimeter wall intact with no unauthorized persons or loitering.',
    'Emergency shut-off switch and fire extinguishers clear & accessible.',
  ];

  const handleSnippetClick = (snippet: string) => {
    setDescription((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDuty) {
      setError('You must have an active duty session to submit a patrol inspection report.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide patrol observation details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = await api.submitPatrolReport({
        patrolSessionId: 'patrol-' + Date.now(),
        dutySessionId: activeDuty.id,
        stationId: activeDuty.stationId || user?.stationId,
        locationTag: locationTag || 'Fuel Station Forecourt & Perimeter Patrol',
        description,
        photoUrl: photoUrl || undefined,
        voiceNoteUrl: voiceAudioUrl,
        transcription: voiceTranscription,
      });

      onSuccess(report);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit patrol report.');
    } finally {
      setLoading(false);
    }
  };

  const handleSamplePhotoUpload = () => {
    setPhotoUrl('https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=600&auto=format&fit=crop&q=80');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Log Fuel Station Patrol Sweep</h3>
                <p className="text-xs text-slate-400">Record rounds across dispenser pumps, underground tanks & perimeter</p>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Checkpoint sector suggestions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fuel Station Checkpoint Sector
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {fuelStationCheckpoints.map((cp) => (
                  <button
                    key={cp}
                    type="button"
                    onClick={() => setLocationTag(cp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      locationTag === cp
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {cp}
                  </button>
                ))}
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="Or enter custom fuel station location..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-slate-100 text-xs"
                />
              </div>
            </div>

            {/* Quick Observation Snippets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Quick Observation Templates (Click to add)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickObservationSnippets.map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSnippetClick(snippet)}
                    className="px-2 py-1 rounded-lg text-[10px] text-slate-300 bg-slate-950 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 transition-colors text-left"
                  >
                    + {snippet}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Patrol Findings & Observations <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Voice Dictate
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the status of fuel pumps, tank locks, forecourt lighting, vehicle traffic, or perimeter condition..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
              />
            </div>

            {voiceTranscription && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300">
                <p className="font-semibold text-[11px] text-purple-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  🎙️ Transcribed Voice Note:
                </p>
                <p className="italic">"{voiceTranscription}"</p>
              </div>
            )}

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Station Checkpoint Photo (Optional)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSamplePhotoUpload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-purple-400" />
                  {photoUrl ? 'Change Photo' : 'Attach Checkpoint Photo'}
                </button>
                {photoUrl && (
                  <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <img src={photoUrl} alt="Patrol photo" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-slate-300">Photo attached</span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Footprints className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Log Patrol Sweep'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Dictate Fuel Station Patrol Sweep"
        onTranscriptionComplete={(text, audioUrl) => {
          setDescription((prev) => (prev ? `${prev} ${text}` : text));
          setVoiceTranscription(text);
          if (audioUrl) setVoiceAudioUrl(audioUrl);
        }}
      />
    </>
  );
};
