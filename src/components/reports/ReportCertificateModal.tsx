import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  Download, 
  MapPin, 
  Clock, 
  User, 
  FileText,
  Building2,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ReportCertificateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: any;
}> = ({ isOpen, onClose, report }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && report) {
      const verifyUrl = `${window.location.origin}/verify/${report.verificationCode}`;
      QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((e) => console.error(e));
    }
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Official Security Shift Certificate</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
              {report.verificationCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Certificate Canvas */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          <div
            ref={printContentRef}
            className="max-w-2xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-300 space-y-6 font-sans"
          >
            {/* Certificate Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                    🛡️
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                      Zen Security Operations
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                      Centralized Occurrence & Shift Operations Certificate
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Security Certificate ID</p>
                <p className="font-mono font-bold text-sm text-blue-800">{report.verificationCode}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Issued: {new Date(report.signedAt || report.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Station & Shift Summary Block */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Station / Facility</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{report.stationName}</p>
                <p className="text-slate-600 text-[11px]">Station Code: {report.stationId}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Duty Officer</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{report.officerName}</p>
                <p className="text-slate-600 text-[11px]">Employee ID: {report.officerEmployeeId}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Shift Timespan</span>
                <p className="font-mono font-semibold text-slate-800 mt-0.5">
                  {report.reportDate} • {new Date(report.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(report.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Post Handover Condition</span>
                <p className="font-bold text-emerald-700 mt-0.5">{report.finalCondition}</p>
              </div>
            </div>

            {/* Shift Operations Statistics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Patrols Completed</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{report.patrolsCount || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Routine Checks</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{report.routineChecksCount || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Occurrences Logged</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{report.occurrencesCount || 0}</p>
              </div>
            </div>

            {/* Officer Remarks */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500">Executive Shift Summary</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                "{report.summary}"
              </p>
            </div>

            {/* Signatures & Seal Section */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between gap-6">
              {/* QR Verification */}
              <div className="flex items-center gap-3">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 border border-slate-300 p-1 rounded" />
                )}
                <div className="text-[10px] text-slate-500 max-w-[150px]">
                  <p className="font-bold text-slate-800">Scan to Verify</p>
                  <p className="mt-0.5">Instant tamper verification on Zen Cloud Registry.</p>
                </div>
              </div>

              {/* Manager Digital Signature Seal */}
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500">Manager Authorization & Seal</span>
                <div className="mt-1 h-14 flex items-center justify-end">
                  {report.signature?.signatureData ? (
                    <img
                      src={report.signature.signatureData}
                      alt="Manager Signature"
                      className="h-12 object-contain"
                    />
                  ) : (
                    <div className="text-xs italic text-slate-400">[Pending Digital Sign]</div>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-xs mt-1">
                  {report.signature?.signerName || 'Station Manager'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {report.signature?.role || 'STATION_MANAGER'} • IP: {report.signature?.ipAddress || '127.0.0.1'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
