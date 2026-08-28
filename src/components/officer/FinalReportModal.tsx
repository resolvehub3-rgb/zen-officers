import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  FileCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Footprints, 
  UserCheck, 
  X, 
  AlertCircle,
  Lock
} from 'lucide-react';
import { FinalCondition } from '../../types/index.ts';

export const FinalReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeDuty: any;
  onSuccess: (report: any) => void;
}> = ({ isOpen, onClose, activeDuty, onSuccess }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [finalCondition, setFinalCondition] = useState<FinalCondition>('NORMAL');
  const [outstandingIssues, setOutstandingIssues] = useState('');
  const [handoverOfficerName, setHandoverOfficerName] = useState('');
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeDuty) {
      setLoading(true);
      api.getReportTimeline(activeDuty.id)
        .then((res) => {
          setTimeline(res);
          // Set intelligent default summary based on duty records
          const patrolsCount = res.patrolReports?.length || 0;
          const occurrencesCount = res.occurrences?.length || 0;

          setSummary(
            `Completed night security shift at ${activeDuty.stationName}. Conducted ${patrolsCount} patrol sweeps across fuel forecourt, underground tanks, and perimeter. Handled ${occurrencesCount} occurrence logs.`
          );
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, activeDuty]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide a shift summary.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const now = new Date();
    const reportDate = now.toISOString().split('T')[0];

    try {
      const report = await api.submitFinalReport({
        dutySessionId: activeDuty.id,
        stationId: activeDuty.stationId || user?.stationId,
        reportDate,
        shiftStartTime: activeDuty.startTime,
        shiftEndTime: now.toISOString(),
        summary,
        finalCondition,
        outstandingIssues: outstandingIssues || undefined,
        handoverOfficerName: handoverOfficerName || undefined,
      });

      onSuccess(report);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit final shift report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">End Shift & Submit Final Report</h3>
              <p className="text-xs text-slate-400">Compile shift operations for Station Manager sign-off</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shift Statistics Summary Cards */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-850">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Station
              </span>
              <span className="font-bold text-white">{activeDuty?.stationName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Footprints className="w-3.5 h-3.5 text-purple-400" />
                  <span>Patrol Sweeps</span>
                </div>
                <p className="text-lg font-bold text-white">{timeline?.patrolReports?.length || 0}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                  <span>Night Occurrences</span>
                </div>
                <p className="text-lg font-bold text-white">{timeline?.occurrences?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Final Station Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Final Station / Post Condition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  value: 'NORMAL',
                  label: 'Normal & Secure',
                  color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                  desc: 'All clear, no open security threats',
                },
                {
                  value: 'MAINTENANCE_REQUIRED',
                  label: 'Maintenance Required',
                  color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
                  desc: 'Facility or equipment fault noted',
                },
                {
                  value: 'SECURITY_ATTENTION_NEEDED',
                  label: 'Security Attention Needed',
                  color: 'bg-red-500/20 border-red-500/40 text-red-300',
                  desc: 'Unresolved safety or security issue',
                },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFinalCondition(c.value as FinalCondition)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    finalCondition === c.value
                      ? `${c.color} ring-1 ring-white/20`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{c.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Shift Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Comprehensive Shift Summary <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide clear executive summary of the entire shift operations..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-100 text-xs placeholder:text-slate-600 resize-none font-normal"
            />
          </div>

          {/* Outstanding issues / Fuel station notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Outstanding Issues / Fuel Station Notes (If Any)
            </label>
            <input
              type="text"
              value={outstandingIssues}
              onChange={(e) => setOutstandingIssues(e.target.value)}
              placeholder="e.g. Dispenser 3 nozzle locked, forecourt floodlight 2 flickering..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submitting Notice */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-300 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white">Immutable Lock Notice</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Submitting this report completes your current active duty session and generates an official audit report. Station Manager will review and apply digital cryptographic signature.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Submitting Final Report...' : 'Submit Final Shift Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
