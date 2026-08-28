import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { 
  Shield, 
  Bell, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Clock, 
  Building2, 
  Activity,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';
import { NotificationCenterDropdown } from './NotificationCenterDropdown.tsx';

export const Header: React.FC<{
  onOpenReportModal?: () => void;
  activeDuty?: any;
  onSelectOccurrence?: (id: string) => void;
  onSelectReport?: (id: string) => void;
}> = ({ activeDuty: propActiveDuty, onSelectOccurrence, onSelectReport }) => {
  const { user, activeDuty: authActiveDuty, switchDemoRole, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState<boolean>(false);

  const effectiveActiveDuty = propActiveDuty !== undefined ? propActiveDuty : authActiveDuty;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Africa/Accra format
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Accra',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          timeZone: 'Africa/Accra',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'SECURITY_OFFICER', label: 'Security Officer', desc: 'Mobile-first duty reporting, patrols & voice logs', color: 'bg-blue-600' },
    { role: 'STATION_MANAGER', label: 'Station Manager', desc: 'Station monitoring, report review & digital signatures', color: 'bg-emerald-600' },
    { role: 'STATION_SUPERVISOR', label: 'Station Supervisor', desc: 'Field supervision, approvals & occurrence review', color: 'bg-teal-600' },
    { role: 'HEAD_OFFICE', label: 'Head Office Admin', desc: 'Organization-wide operations & analytics control', color: 'bg-indigo-600' },
  ];

  const currentRoleConfig = roles.find(r => r.role === user?.role) || roles[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Zen Security</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Ops SaaS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {user?.role === 'HEAD_OFFICE' 
                ? 'Head Office Management' 
                : (user?.stationName || 'Security Operations Platform')}
            </p>
          </div>
        </div>

        {/* Center: Live Station Clock & Duty Indicator */}
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentDate}</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-semibold">{currentTime} (GMT)</span>
          </div>

          {user?.role === 'SECURITY_OFFICER' && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="flex h-2 w-2 relative">
                {effectiveActiveDuty ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                )}
              </span>
              <span className={`text-xs font-bold tracking-wide uppercase ${effectiveActiveDuty ? 'text-emerald-400' : 'text-slate-400'}`}>
                {effectiveActiveDuty ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Role Switcher (Hidden for Security Officers) + Notification Bell + Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Dropdown - Only for Managers/Supervisors/Head Office */}
          {user?.role !== 'SECURITY_OFFICER' && (
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                title="Switch user perspective"
              >
                <span className={`w-2 h-2 rounded-full ${currentRoleConfig.color}`}></span>
                <span className="hidden sm:inline">{currentRoleConfig.label}</span>
                <span className="sm:hidden">{user?.role === 'STATION_MANAGER' ? 'Manager' : user?.role === 'STATION_SUPERVISOR' ? 'Supervisor' : 'Admin'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Switch Role View</p>
                    <p className="text-xs text-slate-500">Evaluate full multi-level RBAC workflows</p>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchDemoRole(r.role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                        user?.role === r.role ? 'bg-blue-600/15 border border-blue-500/30' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mt-1 ${r.color}`}></div>
                      <div>
                        <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {r.label}
                          {user?.role === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notification Center Dropdown */}
          <NotificationCenterDropdown
            onSelectOccurrence={onSelectOccurrence}
            onSelectReport={onSelectReport}
          />

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'}
              alt={user?.firstName}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">{user?.employeeId}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
