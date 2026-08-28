import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthPage } from './components/auth/AuthPage.tsx';
import { Header } from './components/common/Header.tsx';
import { OfficerDashboard } from './components/officer/OfficerDashboard.tsx';
import { ManagerDashboard } from './components/manager/ManagerDashboard.tsx';
import { HeadOfficeDashboard } from './components/headoffice/HeadOfficeDashboard.tsx';
import { api } from './services/api.ts';
import { Shield, ShieldAlert, CheckCircle2, MapPin, Building2 } from 'lucide-react';

const PublicVerificationView: React.FC<{ code: string; onBack: () => void }> = ({ code, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.verifyReport(code)
      .then((res) => setData(res))
      .catch((e) => setError(e.message || 'Report not found'))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Zen Security Certificate Registry</h1>
          <p className="text-xs font-mono text-sky-400 font-bold">{code}</p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400 text-xs">Verifying cryptographic hash on Zen SOC Registry...</div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold">Official Certified Security Shift Report</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Station / Facility</span>
                <span className="font-bold text-white">{data.stationName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Duty Security Officer</span>
                <span className="font-semibold text-slate-200">{data.officerName} ({data.officerEmployeeId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Shift Date</span>
                <span className="text-slate-300">{data.reportDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Signer Authority</span>
                <span className="text-emerald-400 font-bold">{data.signerName} ({data.signerRole})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Post Handover State</span>
                <span className="font-bold text-emerald-400">{data.finalCondition}</span>
              </div>
              <div className="flex justify-between pt-1 font-mono text-[11px]">
                <span className="text-slate-500">Patrols / Occurrences</span>
                <span className="text-sky-400">{data.patrolsCompleted} Patrols • {data.occurrencesReported} Incidents</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          Return to Operations Portal
        </button>
      </div>
    </div>
  );
};

const MainDashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [verifyCode, setVerifyCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if path is /verify/<code>
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const code = path.replace('/verify/', '');
      if (code) setVerifyCode(code);
    }
  }, []);

  if (verifyCode) {
    return <PublicVerificationView code={verifyCode} onBack={() => {
      window.history.pushState({}, '', '/');
      setVerifyCode(null);
    }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <p className="font-semibold tracking-wide text-slate-200">Loading Zen Security Operations Engine...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="flex-1 pb-16">
        {user?.role === 'SECURITY_OFFICER' && <OfficerDashboard />}
        {(user?.role === 'STATION_MANAGER' || user?.role === 'STATION_SUPERVISOR') && <ManagerDashboard />}
        {user?.role === 'HEAD_OFFICE' && <HeadOfficeDashboard />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zen Security Operations SaaS • Production Grade SOC</span>
          </div>
          <p className="font-mono text-slate-400">
            Encrypted End-to-End • Multi-Role RBAC • Real-time Socket Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboardRouter />
    </AuthProvider>
  );
}
