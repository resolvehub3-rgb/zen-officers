import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  FileText, 
  MapPin, 
  Mic, 
  Check, 
  X, 
  AlertCircle,
  Camera,
  Shield,
  Fuel,
  Sparkles
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
  const [type, setType] = useState<OccurrenceType>('OCCURRENCE');
  const [severity, setSeverity] = useState<OccurrenceSeverity>('LOW');
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

  const categories: { type: OccurrenceType; label: string; icon: string; fuelHint: string }[] = [
    { type: 'OCCURRENCE', label: 'Routine Night Log', icon: '📋', fuelHint: 'Overnight parked vehicles, delivery arrivals, general observations' },
    { type: 'UNUSUAL_OBSERVATION', label: 'Unusual Observation', icon: '🔍', fuelHint: 'Unfamiliar vehicle near pump, strange sound, unusual activity' },
    { type: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: '👁️', fuelHint: 'Loitering near storage tanks, boundary inspection, suspicious persons' },
    { type: 'SAFETY_ISSUE', label: 'Fuel & Safety Hazard', icon: '⚠️', fuelHint: 'Fuel drip/spill, fire equipment blockage, smoking attempt' },
    { type: 'MAINTENANCE_CONCERN', label: 'Maintenance / Fault', icon: '🔧', fuelHint: 'Canopy lamp out, dispenser nozzle leak, generator issue' },
    { type: 'DAMAGE', label: 'Station Property Damage', icon: '🔨', fuelHint: 'Pump guard damage, curb scrape, broken lock or light' },
    { type: 'TRESPASSING', label: 'Unauthorized Access', icon: '🚫', fuelHint: 'Entering closed mart, climbing perimeter fence, tank farm intrusion' },
    { type: 'INCIDENT', label: 'Security Incident', icon: '🚨', fuelHint: 'Customer confrontation, attempted theft, active disturbance' },
    { type: 'OTHER', label: 'Other Station Matter', icon: '📌', fuelHint: 'Any other fuel station night security note' },
  ];

  const severities: { level: OccurrenceSeverity; label: string; color: string; desc: string }[] = [
    { level: 'LOW', label: 'Low / Standard', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', desc: 'Routine nightly observation, no immediate threat' },
    { level: 'MEDIUM', label: 'Medium', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', desc: 'Station matter requiring supervisor awareness' },
    { level: 'HIGH', label: 'High', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', desc: 'Notable hazard or security issue requiring prompt action' },
    { level: 'CRITICAL', label: 'Critical Alert', color: 'bg-red-500/20 text-red-300 border-red-500/50 font-bold', desc: 'Active emergency, immediate Head Office alarm' },
  ];

  const quickStationSectors = [
    'Forecourt & Dispenser Pumps',
    'Underground Tank Storage Area',
    'Cashier Booth & Mini-Mart',
    'Tanker Discharge Bay',
    'Main Entry / Exit Driveway',
    'Rear Perimeter Wall',
    'Generator & Compressor Room',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDuty) {
      setError('You must have an active duty session to record a station occurrence.');
      return;
    }
    if (!location.trim() || !description.trim()) {
      setError('Please provide station location/sector and observation description.');
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
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Record Fuel Station Occurrence / Night Log</h3>
                <p className="text-xs text-slate-400">Log nightly station happenings, vehicle activities, safety notices, or events</p>
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
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Occurrence Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => setType(c.type)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex flex-col justify-between ${
                      type === c.type
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{c.icon}</span>
                      <span className="font-semibold truncate">{c.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {c.fuelHint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Log Priority / Severity
              </label>
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
                    <p className="text-[10px] opacity-80 mt-0.5 line-clamp-2 leading-tight">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Quick Sector Tags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Station Sector / Location <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500">Select tag or type</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickStationSectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setLocation(sector)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      location === sector
                        ? 'bg-blue-600/30 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pump Island 3, Underground Tank Manhole 2, Forecourt Ingress..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Night Occurrence Description <span className="text-red-400">*</span>
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
                placeholder="State chronological facts: e.g. Commercial taxi GT-442-21 parked near air pump at 02:15, driver resting. Inspected vehicle, driver departed at 02:45. Area quiet and secure."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
              />
            </div>

            {voiceTranscription && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300">
                <p className="font-semibold text-[11px] text-blue-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  🎙️ Attached Voice Transcription:
                </p>
                <p className="italic">"{voiceTranscription}"</p>
              </div>
            )}

            {/* Immediate Action Taken */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Action Taken by Security Officer (Optional)
              </label>
              <input
                type="text"
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                placeholder="e.g. Conducted physical sweep, verified credentials, ensured fuel nozzle locked, recorded in station log..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs"
              />
            </div>

            {/* Persons / Vehicles Involved & Witnesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vehicles / Persons Involved
                </label>
                <input
                  type="text"
                  value={personsInvolved}
                  onChange={(e) => setPersonsInvolved(e.target.value)}
                  placeholder="e.g. Vehicle Reg: GE-8921-20, Driver / Customer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Witnesses / Staff on Site
                </label>
                <input
                  type="text"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  placeholder="e.g. Cashier Kwame, Night Attendant"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                />
              </div>
            </div>

            {/* Photo Evidence */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Photo Evidence (Optional)</label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSamplePhotoUpload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-blue-400" />
                  {photoUrl ? 'Change Attached Photo' : 'Attach Photo Evidence'}
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
                <FileText className="w-4 h-4" />
                <span>{loading ? 'Saving Log...' : severity === 'CRITICAL' ? 'SUBMIT CRITICAL ALERT' : 'Save Night Occurrence Log'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        title="Dictate Night Station Occurrence"
        onTranscriptionComplete={(text, audioUrl) => {
          setDescription((prev) => (prev ? `${prev} ${text}` : text));
          setVoiceTranscription(text);
          if (audioUrl) setVoiceAudioUrl(audioUrl);
        }}
      />
    </>
  );
};
