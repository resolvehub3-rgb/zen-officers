import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  MinusCircle, 
  X, 
  AlertCircle,
  Camera,
  Send
} from 'lucide-react';
import { RoutineCheckItem } from '../../types/index.ts';

export const RoutineCheckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeDuty: any;
  onSuccess: (check: any) => void;
}> = ({ isOpen, onClose, activeDuty, onSuccess }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<RoutineCheckItem[]>([
    { id: 'item-1', name: 'Main Entry Gates & Turnstiles Locking Mechanisms', status: 'OK' },
    { id: 'item-2', name: 'CCTV Feeds & Monitoring Station Coverage', status: 'OK' },
    { id: 'item-3', name: 'Perimeter Security Lighting & Floodlights', status: 'OK' },
    { id: 'item-4', name: 'Fire Extinguishers & Emergency Exit Pathways', status: 'OK' },
    { id: 'item-5', name: 'Visitor Logbook & Access Control Badge Terminal', status: 'OK' },
    { id: 'item-6', name: 'Backup Power Generator & Security Comms Radio', status: 'OK' },
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, status: 'OK' | 'ISSUE_FOUND' | 'NOT_APPLICABLE') => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it))
    );
  };

  const handleDescriptionChange = (id: string, description: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, description } : it))
    );
  };

  const handleAttachPhoto = (id: string) => {
    const sample = 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80';
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, photoUrl: sample } : it))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDuty) {
      setError('You must have an active duty session to conduct routine inspections.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const check = await api.submitCheck({
        dutySessionId: activeDuty.id,
        stationId: activeDuty.stationId || user?.stationId,
        checklist: items,
        notes: notes || 'Station routine inspection complete. All checked posts inspected as noted.',
      });

      onSuccess(check);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit routine check.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Station Routine Security Inspection</h3>
              <p className="text-xs text-slate-400">Step-by-step physical and electronic security inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.status === 'ISSUE_FOUND'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : item.status === 'OK'
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/60 border-slate-850 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-500">0{idx + 1}</span>
                    <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'OK')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        item.status === 'OK'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'ISSUE_FOUND')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        item.status === 'ISSUE_FOUND'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Issue
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'NOT_APPLICABLE')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        item.status === 'NOT_APPLICABLE'
                          ? 'bg-slate-700 text-slate-200'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      N/A
                    </button>
                  </div>
                </div>

                {/* If Issue Found -> show issue note & photo input */}
                {item.status === 'ISSUE_FOUND' && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Specify issue detected (e.g. Broken latch on North gate, camera 4 feed flickering)..."
                      value={item.description || ''}
                      onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-amber-200 focus:outline-none placeholder:text-slate-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAttachPhoto(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        {item.photoUrl ? 'Photo Attached' : 'Attach Photo'}
                      </button>
                      {item.photoUrl && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Evidence attached
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General Inspection Summary Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              General Inspection Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any overall observations during routine inspection rounds..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 resize-none font-normal"
            />
          </div>

          {/* Footer */}
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting Checklist...' : 'Submit Routine Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
