import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Building, 
  Building2, 
  FileBadge, 
  Radio, 
  Sparkles,
  CheckCircle2,
  KeyRound,
  HelpCircle,
  X
} from 'lucide-react';

interface DemoAccount {
  role: UserRole;
  title: string;
  subtitle: string;
  name: string;
  email: string;
  pass: string;
  badge: string;
  color: string;
  bgLight: string;
  borderHover: string;
  icon: React.ReactNode;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'HEAD_OFFICE',
    title: 'Head Office Director',
    subtitle: 'Full SOC command, stations overview, audits & user administration',
    name: 'Admin Director',
    email: 'admin@zensecurity.com',
    pass: 'admin123',
    badge: 'HQ Commander',
    color: 'text-purple-400',
    bgLight: 'bg-purple-500/10',
    borderHover: 'hover:border-purple-500/50',
    icon: <Building2 className="w-4 h-4 text-purple-400" />
  },
  {
    role: 'STATION_MANAGER',
    title: 'Station Manager',
    subtitle: 'Shift report signing, station analytics & incident resolution',
    name: 'Kwame Mensah',
    email: 'manager@zensecurity.com',
    pass: 'manager123',
    badge: 'North Gate Station',
    color: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    borderHover: 'hover:border-blue-500/50',
    icon: <Building className="w-4 h-4 text-blue-400" />
  },
  {
    role: 'STATION_SUPERVISOR',
    title: 'Station Supervisor',
    subtitle: 'Shift handovers, live occurrence reviews & officer supervision',
    name: 'Emmanuel Osei',
    email: 'supervisor@zensecurity.com',
    pass: 'super123',
    badge: 'North Gate Station',
    color: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    borderHover: 'hover:border-amber-500/50',
    icon: <FileBadge className="w-4 h-4 text-amber-400" />
  },
  {
    role: 'SECURITY_OFFICER',
    title: 'Security Officer',
    subtitle: 'Occurrence logging, QR patrol checkpoints & shift reporting',
    name: 'Officer Kofi Boateng',
    email: 'officer@zensecurity.com',
    pass: 'officer123',
    badge: 'SEC-OFF-301',
    color: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderHover: 'hover:border-emerald-500/50',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
  }
];

export const AuthPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState<string>('officer@zensecurity.com');
  const [password, setPassword] = useState<string>('officer123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both your work email and security password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demo: DemoAccount) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await switchDemoRole(demo.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">ZEN SECURITY</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SOC v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Security Operations & Occurrence SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Security Operations Center Online</span>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Help & SOC Access Support"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Center Auth Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Main Login Form Box */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
              
              {/* Box Heading */}
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                  <KeyRound className="w-3.5 h-3.5" />
                  Secure Officer & Dispatch Gateway
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sign in to your station
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Authenticate with your registered security badge credentials or select a verified demo perspective.
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="text-[11px] text-red-400/80 mt-0.5">Please check your email formatting or pick a one-click demo role below.</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Work Email Address / Badge ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      id="auth-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@zensecurity.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline"
                    >
                      Forgot code?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="auth-password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Guard Protocol */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500/40 rounded-sm"
                    />
                    <span className="text-xs text-slate-300 font-medium">Keep session active on this terminal</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="auth-submit-button"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Security Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Security Operations Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Encryption & SOC Tagline */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit SOC Protocol</span>
                </span>
                <span>Port 3000 • TLS Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right / Demo Roles Quick-Switch Section */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Quick One-Click Demo Access
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any role below to instantly authenticate and evaluate workflows:
                  </p>
                </div>
              </div>

              {/* Role Cards List */}
              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_ACCOUNTS.map((demo) => {
                  const isCurrentSelection = email === demo.email;
                  return (
                    <div
                      key={demo.role}
                      onClick={() => handleQuickLogin(demo)}
                      className={`group p-3.5 rounded-2xl border transition-all cursor-pointer bg-slate-950/60 ${
                        isCurrentSelection
                          ? 'border-blue-500/60 bg-blue-950/20 shadow-md shadow-blue-500/10'
                          : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl ${demo.bgLight} border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5`}>
                            {demo.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                                {demo.title}
                              </h4>
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {demo.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {demo.subtitle}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-slate-400">
                              <span>User: <strong className="text-slate-300">{demo.email}</strong></span>
                              <span>Pass: <strong className="text-slate-300">{demo.pass}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-[11px] font-semibold text-slate-300 group-hover:text-white transition-all shrink-0 mt-1"
                        >
                          Login as
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Station coverage footnote */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Multi-station coverage:</span>
                <span className="text-slate-300 font-semibold">North Gate, East Side, West Point, Campus & South Port</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-900/80 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Zen Security Operations Group. All rights reserved.</p>
        <p className="font-mono text-[11px]">Certified ISO/IEC 27001 Security Management • Ghana SOC Operations</p>
      </footer>

      {/* Help / Password Reset Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Security Access Support</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                To maintain cryptographic chain-of-custody for all occurrences and shift handover certificates, user accounts are centrally provisioned by Head Office.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <p className="font-semibold text-white">Default Demo Passwords:</p>
                <p className="font-mono text-slate-400">• Head Office: <span className="text-sky-400 font-bold">admin123</span></p>
                <p className="font-mono text-slate-400">• Station Manager: <span className="text-sky-400 font-bold">manager123</span></p>
                <p className="font-mono text-slate-400">• Station Supervisor: <span className="text-sky-400 font-bold">super123</span></p>
                <p className="font-mono text-slate-400">• Security Officer: <span className="text-sky-400 font-bold">officer123</span></p>
              </div>
              <p className="text-[11px] text-slate-400">
                For lost physical security NFC badges or biometric resets, please contact your Station Manager or radio Head Office SOC Dispatch.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
