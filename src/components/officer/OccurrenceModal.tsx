import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  AlertTriangle, 
  UploadCloud, 
  Mic, 
  MapPin, 
  ShieldAlert, 
  Check, 
  X, 
  AlertCircle,
  Camera,
  Film
} from 'lucide-react';
import { OccurrenceSeverity, OccurrenceType } from '../../types/index.ts';
import { VoiceRecorderModal } from './VoiceRecorderModal.tsx';

export const OccurrenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeDuty: any;
  onSuccess: (occurrence: any) => void;
}> = ({ isOpen, onClose, activeDuty, onSuccess }) => {
  const { user } = useAuth();
  const [type, setType] = useState<OccurrenceType>('SUSPICIOUS_ACTIVITY');
  const [severity, setSeverity] = useState<OccurrenceSeverity>('MEDIUM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [personsInvolved, setPersonsInvolved] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | undefined>();
  const [voiceTranscription, setVoiceTranscription] = useState<string | undefined>();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { type: OccurrenceType; label: string; icon: string }[] = [
    { type: 'INCIDENT', label: 'Security Incident', icon: '🚨' },
    { type: 'OCCURRENCE', label: 'Routine Occurrence', icon: '📋' },
    { type: 'DAMAGE', label: 'Property Damage', icon: '🔨' },
    { type: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: '👁️' },
    { type: 'SAFETY_ISSUE', label: 'Safety / Health Hazard', icon: '⚠️' },
    { type: 'MAINTENANCE_CONCERN', label: 'Maintenance / Fault', icon: '🔧' },
    { type: 'UNUSUAL_OBSERVATION', label: 'Unusual Observation', icon: '🔍' },
    { type: 'TRESPASSING', label: 'Unauthorized Access / Trespass', icon: '🚫' },
    { type: 'OTHER', label: 'Other Security Matter', icon: '📌' },
  ];

  const severities: { level: OccurrenceSeverity; label: string; color: string; desc: string }[] = [
    { level: 'LOW', label: 'Low', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', desc: 'Minor observation, no immediate threat' },
    { level: 'MEDIUM', label: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', desc: 'Notable situation requiring attention' },
    { level: 'HIGH', label: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', desc: 'Serious occurrence, escalation needed' },
    { level: 'CRITICAL', label: 'Critical / Red Alert', color: 'bg-red-500/20 text-red-400 border-red-500/40 font-bold', desc: 'Urgent emergency, immediate Head Office notification' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDuty) {
      setError('You must have an active duty session to file a security occurrence.');
      return;
    }
    if (!location.trim() || !description.trim()) {
      setError('Please provide specific location and detailed description.');
      return;
    }

    setLoading(true);
    setError(null);

    const attachments: any[] = [];
    if (photoUrl) {
      attachments.push({
        id: 'att-' + Date.now(),
        type: 'PHOTO',
        url: photoUrl,
        secureUrl: photoUrl,
        createdAt: new Date().toISOString(),
      });
    }
    if (videoUrl) {
      attachments.push({
        id: 'att-v-' + Date.now(),
        type: 'VIDEO',
        url: videoUrl,
        secureUrl: videoUrl,
        createdAt: new Date().toISOString(),
      });
    }

    try {
      const occurrence = await api.createOccurrence({
        dutySessionId: activeDuty.id,
        stationId: activeDuty.stationId || user?.stationId,
        type,
        severity,
        location,
        description,
        immediateAction: immediateAction || undefined,
        personsInvolved: personsInvolved || undefined,
        witnesses: witnesses || undefined,
        attachments,
        voiceNoteUrl: voiceAudioUrl,
        transcription: voiceTranscription,
      });

      onSuccess(occurrence);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit occurrence.');
    } finally {
      setLoading(false);
    }
  };

  const handleSamplePhotoUpload = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=600&auto=format&fit=crop&q=80',
    ];
    setPhotoUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Record Security Occurrence / Incident</h3>
                <p className="text-xs text-slate-400">Official log entry with time, photos & severity ranking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Occurrence Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Occurrence Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => setType(c.type)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                      type === c.type
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Severity Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severities.map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setSeverity(s.level)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      severity === s.level
                        ? `${s.color} ring-1 ring-white/20`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Exact Location / Sector <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. West Perimeter Fence, Gate 3, Vault A"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reporting Duty Session</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
                  {activeDuty?.stationName} • Active since {new Date(activeDuty?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Description <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
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
                placeholder="State chronological facts: what was observed, vehicle plates, suspect descriptions, damage detected..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
              />
            </div>

            {voiceTranscription && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300">
                <p className="font-semibold text-[11px] text-blue-400 uppercase tracking-wider mb-0.5">
                  🎙️ Spoken Voice Note Transcribed:
                </p>
                <p className="italic">"{voiceTranscription}"</p>
              </div>
            )}

            {/* Immediate Action Taken */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Immediate Action Taken</label>
              <input
                type="text"
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                placeholder="e.g. Challenged trespasser, reinforced gate latch, contacted Station Supervisor..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs"
              />
            </div>

            {/* Persons Involved & Witnesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Persons Involved / Suspects</label>
                <input
                  type="text"
                  value={personsInvolved}
                  onChange={(e) => setPersonsInvolved(e.target.value)}
                  placeholder="Names, IDs, or physical descriptions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Witnesses</label>
                <input
                  type="text"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  placeholder="Co-workers, visitors, bystanders"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
            </div>

            {/* Photo / Video Attachments */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Evidence Media Attachments</label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSamplePhotoUpload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-blue-400" />
                  {photoUrl ? 'Change Photo Evidence' : 'Attach Photo Evidence'}
                </button>

                {photoUrl && (
                  <div className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <img src={photoUrl} alt="Evidence" className="w-8 h-8 rounded-lg object-cover" />
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

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all ${
                  severity === 'CRITICAL'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                {loading ? 'Submitting Occurrence...' : severity === 'CRITICAL' ? 'SUBMIT CRITICAL OCCURRENCE' : 'Log Occurrence'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Dictate Incident / Occurrence"
        onTranscriptionComplete={(text, audioUrl) => {
          setDescription((prev) => (prev ? `${prev} ${text}` : text));
          setVoiceTranscription(text);
          if (audioUrl) setVoiceAudioUrl(audioUrl);
        }}
      />
    </>
  );
};
