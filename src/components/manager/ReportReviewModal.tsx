import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { 
  FileText, 
  MapPin, 
  Clock, 
  User, 
  Footprints, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  PenTool, 
  RotateCcw,
  Printer,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal.tsx';

export const ReportReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: any;
  onUpdate: () => void;
}> = ({ isOpen, onClose, report, onUpdate }) => {
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      setLoading(true);
      api.getReportTimeline(report.dutySessionId)
        .then((res) => setTimeline(res))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const handleReturnReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;

    setSubmittingReturn(true);
    try {
      await api.rejectReport(report.id, returnReason);
      setIsReturnModalOpen(false);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to return report.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const isSigned = report.status === 'SIGNED';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${isSigned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {isSigned ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">Shift Inspection Review</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    {report.verificationCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {report.stationName} • {report.reportDate} • Officer {report.officerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Executive Status Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Report Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`font-bold text-sm px-2.5 py-0.5 rounded-full border ${
                      isSigned
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : report.status === 'RETURNED_FOR_CORRECTION'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isSigned ? 'APPROVED & SIGNED' : report.status === 'RETURNED_FOR_CORRECTION' ? 'RETURNED FOR CORRECTION' : 'PENDING MANAGER APPROVAL'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Shift Start</p>
                  <p className="font-mono font-semibold">{new Date(report.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Shift End</p>
                  <p className="font-mono font-semibold">{new Date(report.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Final Post Condition</p>
                  <p className="font-bold text-white">{report.finalCondition}</p>
                </div>
              </div>
            </div>

            {/* Officer Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Officer Shift Summary</h4>
              <p className="text-slate-200 leading-relaxed text-sm">{report.summary}</p>
              {report.outstandingIssues && (
                <div className="pt-2 border-t border-slate-850 text-amber-300">
                  <strong className="text-amber-400">Outstanding Issues:</strong> {report.outstandingIssues}
                </div>
              )}
              {report.handoverOfficerName && (
                <div className="pt-1 text-slate-400">
                  <strong className="text-slate-300">Relieving Officer:</strong> {report.handoverOfficerName}
                </div>
              )}
            </div>

            {/* Timeline Breakdown Sections */}
            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading duty shift records...</div>
            ) : (
              <div className="space-y-4">
                {/* 1. Patrols Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-purple-400" />
                      Patrol Observations ({timeline?.patrolReports?.length || 0})
                    </h5>
                  </div>

                  {timeline?.patrolReports?.length === 0 ? (
                    <p className="text-slate-500 italic">No patrol checkpoints recorded during this shift.</p>
                  ) : (
                    <div className="space-y-2">
                      {timeline?.patrolReports?.map((p: any) => (
                        <div key={p.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{p.locationTag}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1">{p.description}</p>
                            {p.transcription && (
                              <p className="text-purple-300 text-[11px] mt-1 italic">🎙️ "{p.transcription}"</p>
                            )}
                          </div>
                          {p.photoUrl && (
                            <img src={p.photoUrl} alt="Patrol" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Occurrences Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Security Occurrences & Incidents ({timeline?.occurrences?.length || 0})
                  </h5>

                  {timeline?.occurrences?.length === 0 ? (
                    <p className="text-slate-500 italic">No security incidents logged during shift.</p>
                  ) : (
                    <div className="space-y-2">
                      {timeline?.occurrences?.map((occ: any) => (
                        <div key={occ.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{occ.type}</span>
                              <span className="text-slate-400">• {occ.location}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              occ.severity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                : occ.severity === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            }`}>
                              {occ.severity}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1.5">{occ.description}</p>
                          {occ.immediateAction && (
                            <p className="text-[11px] text-emerald-400 mt-1">
                              <strong>Action Taken:</strong> {occ.immediateAction}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If Signed -> Display Signature Seal */}
            {isSigned && report.signature && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {report.signature.signatureData && (
                    <img
                      src={report.signature.signatureData}
                      alt="Digital Signature"
                      className="h-14 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 object-contain"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      Approved & Cryptographically Signed
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Signer: <strong>{report.signature.signerName}</strong> ({report.signature.role})
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Signed At: {new Date(report.signedAt).toLocaleString()} • IP: {report.signature.ipAddress || '127.0.0.1'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Verification Seal</span>
                  <p className="font-mono font-bold text-xs text-sky-400">{report.verificationCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Review Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            {!isSigned && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
                >
                  Return for Correction
                </button>
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <PenTool className="w-4 h-4" />
                  Approve & Digitally Sign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return For Correction Dialog */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" />
              Return Report for Correction
            </h4>
            <p className="text-xs text-slate-400">
              Provide feedback to Officer {report.officerName} detailing what corrections or additions are required before approval.
            </p>
            <textarea
              rows={3}
              required
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Please clarify damage observations on West Fence and attach missing checkpoint photo..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-red-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnReport}
                disabled={submittingReturn || !returnReason.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                {submittingReturn ? 'Returning...' : 'Confirm & Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        report={report}
        onSignedSuccess={() => {
          onUpdate();
          onClose();
        }}
      />
    </>
  );
};
