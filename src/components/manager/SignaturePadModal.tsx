import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Lock,
  Building2,
  Calendar
} from 'lucide-react';

export const SignaturePadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: any;
  onSignedSuccess: (signedReport: any) => void;
}> = ({ isOpen, onClose, report, onSignedSuccess }) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#38bdf8'; // bright cyan/sky pen
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
        }
        setHasSignature(false);
        setError(null);
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      setError('Please draw your digital signature before approving.');
      return;
    }

    setLoading(true);
    setError(null);

    const signatureData = canvas.toDataURL('image/png');

    try {
      const signed = await api.signReport(report.id, signatureData);
      onSignedSuccess(signed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Manager Digital Approval & Seal</h3>
              <p className="text-xs text-slate-400">Apply legally binding cryptographic signature to lock shift report</p>
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
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Report Metadata */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Report Code:</span>
              <span className="font-mono font-bold text-sky-400">{report.verificationCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Reporting Officer:</span>
              <span className="font-semibold text-white">{report.officerName} ({report.officerEmployeeId})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Station / Date:</span>
              <span className="text-slate-300">{report.stationName} • {report.reportDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Signer Authority:</span>
              <span className="font-bold text-emerald-400">
                {user?.firstName} {user?.lastName} ({user?.role === 'HEAD_OFFICE' ? 'Head Office Executive' : 'Station Manager'})
              </span>
            </div>
          </div>

          {/* Signature Canvas Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                Draw Digital Signature (Mouse / Touch)
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={460}
                height={160}
                className="w-full h-40 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-600">
                  Sign here with cursor or finger
                </div>
              )}
            </div>
          </div>

          {/* Immutable Seal Notice */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Permanent Lock & Seal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Applying your signature permanently locks this record against tampering, generates an audit certificate, and dispatches approval confirmation to Head Office.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={!hasSignature || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Sealing & Signing...' : 'Approve & Digitally Sign Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
