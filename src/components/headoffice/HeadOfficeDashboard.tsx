import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Shield, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  FileCheck, 
  MapPin, 
  Phone, 
  Mail, 
  UserPlus, 
  Lock, 
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ReportReviewModal } from '../manager/ReportReviewModal.tsx';
import { ReportCertificateModal } from '../reports/ReportCertificateModal.tsx';

export const HeadOfficeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'STATIONS' | 'OFFICERS' | 'INCIDENTS' | 'REPORTS' | 'AUDIT' | 'VERIFY'
  >('OVERVIEW');

  const [stats, setStats] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');

  // Modals
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [certReport, setCertReport] = useState<any>(null);
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New Station form
  const [newStationName, setNewStationName] = useState('');
  const [newStationCode, setNewStationCode] = useState('');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationLocation, setNewStationLocation] = useState('');

  // New User form
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'SECURITY_OFFICER' | 'STATION_MANAGER' | 'STATION_SUPERVISOR' | 'HEAD_OFFICE'>('SECURITY_OFFICER');
  const [newUserStationId, setNewUserStationId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('pass123');

  // Verification search
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchAllData = async () => {
    try {
      const [statsRes, stationsRes, usersRes, occurRes, reportsRes, auditRes] = await Promise.all([
        api.getStats(),
        api.getStations(),
        api.getUsers(),
        api.getOccurrences(),
        api.getFinalReports(),
        api.getAuditLogs(),
      ]);

      setStats(statsRes);
      setStations(stationsRes);
      setOfficers(usersRes);
      setOccurrences(occurRes);
      setReports(reportsRes);
      setAuditLogs(auditRes);
    } catch (err) {
      console.error('Failed to load head office data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const socket = getSocket();
    const handleActivity = (act: any) => {
      setActivities((prev) => [act, ...prev.slice(0, 20)]);
    };

    const handleDataRefresh = () => {
      fetchAllData();
    };

    socket.on('station:activity', handleActivity);
    socket.on('occurrence:critical', handleDataRefresh);
    socket.on('report:submitted', handleDataRefresh);
    socket.on('report:signed', handleDataRefresh);
    socket.on('duty:started', handleDataRefresh);
    socket.on('duty:ended', handleDataRefresh);

    return () => {
      socket.off('station:activity', handleActivity);
      socket.off('occurrence:critical', handleDataRefresh);
      socket.off('report:submitted', handleDataRefresh);
      socket.off('report:signed', handleDataRefresh);
      socket.off('duty:started', handleDataRefresh);
      socket.off('duty:ended', handleDataRefresh);
    };
  }, []);

  // Trends Area Chart data
  const trendData = [
    { name: 'Mon', reports: 42, incidents: 3 },
    { name: 'Tue', reports: 55, incidents: 2 },
    { name: 'Wed', reports: 68, incidents: 5 },
    { name: 'Thu', reports: 72, incidents: 1 },
    { name: 'Fri', reports: 85, incidents: 4 },
    { name: 'Sat', reports: 94, incidents: 6 },
    { name: 'Sun', reports: 60, incidents: 2 },
  ];

  // Station Donut Chart data
  const stationShareData = [
    { name: 'North Gate Station', value: 27, color: '#3b82f6' },
    { name: 'East Side Industrial', value: 20, color: '#10b981' },
    { name: 'West Point Logistics', value: 19, color: '#a855f7' },
    { name: 'Main Corporate Campus', value: 17, color: '#f59e0b' },
    { name: 'South Area Warehouse', value: 9, color: '#06b6d4' },
    { name: 'Others', value: 8, color: '#64748b' },
  ];

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStation({
        name: newStationName,
        code: newStationCode,
        address: newStationAddress,
        location: newStationLocation,
      });
      setIsAddStationOpen(false);
      setNewStationName('');
      setNewStationCode('');
      setNewStationAddress('');
      fetchAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to create station');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone,
        employeeId: newEmployeeId,
        role: newUserRole,
        stationId: newUserStationId || null,
        password: newUserPassword,
      });
      setIsAddUserOpen(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewEmployeeId('');
      fetchAllData();
    } catch (e: any) {
      alert(e.message || 'Failed to create personnel');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await api.verifyReport(verifyCodeInput.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ error: err.message || 'Invalid or unregistered certificate code.' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Head Office Command Center */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Enterprise Command Center
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Zen Security HQ</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Security Operations Center (SOC)
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Executive Administrator: <strong className="text-slate-200">{user?.firstName} {user?.lastName}</strong>
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddStationOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            Add Station
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            Add Personnel
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-semibold">
        {[
          { id: 'OVERVIEW', label: 'Operations Overview', icon: TrendingUp },
          { id: 'STATIONS', label: `Stations (${stations.length || 24})`, icon: Building2 },
          { id: 'OFFICERS', label: `Personnel (${officers.length || 156})`, icon: Users },
          { id: 'INCIDENTS', label: `Occurrences & Alerts (${occurrences.length || 18})`, icon: ShieldAlert },
          { id: 'REPORTS', label: `Shift Reports (${reports.length || 312})`, icon: FileCheck },
          { id: 'AUDIT', label: 'Immutable Audit Trail', icon: Lock },
          { id: 'VERIFY', label: 'Certificate Verification', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: OVERVIEW (Matching Mockup) */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top 5 Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400">Total Stations</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{stations.length || 24}</p>
              <p className="text-[10px] text-emerald-400 mt-1">100% Operational</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400">Total Officers</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{officers.length || 156}</p>
              <p className="text-[10px] text-indigo-400 mt-1">Active Personnel</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400">Total Reports</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{reports.length || 312}</p>
              <p className="text-[10px] text-purple-400 mt-1">This month</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400">Incidents Logged</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400 tracking-tight">{occurrences.length || 18}</p>
              <p className="text-[10px] text-slate-500 mt-1">4 critical escalated</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400">Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400 tracking-tight">
                {reports.filter((r) => r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED').length || 7}
              </p>
              <p className="text-[10px] text-amber-400/80 mt-1">Across all stations</p>
            </div>
          </div>

          {/* Two Column Charts: Reports Overview Area Chart + Reports by Station Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Line Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Reports Overview</h3>
                  <p className="text-xs text-slate-400">Shift report submissions vs incident escalations</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Weekly Aggregation
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="reports" stroke="#6366f1" fillOpacity={1} fill="url(#colorReports)" name="Shift Reports" />
                    <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reports by Station Donut */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Reports by Station</h3>
                <p className="text-xs text-slate-400">Activity distribution by station facility</p>
              </div>

              <div className="h-52 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stationShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stationShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-800">
                {stationShareData.slice(0, 4).map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                      {d.name}
                    </span>
                    <span className="font-bold text-white">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Operations Feed & Recent Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Reports */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Recent Organization Reports</h3>
                <button
                  onClick={() => setActiveTab('REPORTS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View All ({reports.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {reports.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{r.stationName}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {r.verificationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        Officer: {r.officerName} • {r.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          r.status === 'SIGNED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {r.status === 'SIGNED' ? 'SIGNED' : 'PENDING'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Live SOC Activity Ticker */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-base font-bold text-white">Live SOC Stream</h3>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Listening for real-time station broadcasts...
                  </div>
                ) : (
                  activities.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span className="text-indigo-400 font-bold">{act.stationName}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-200">{act.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: STATIONS */}
      {activeTab === 'STATIONS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Security Stations & Facilities Directory</h3>
              <p className="text-xs text-slate-400">All registered station posts across the organization</p>
            </div>
            <button
              onClick={() => setIsAddStationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Station
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((st) => (
              <div key={st.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{st.name}</h4>
                    <span className="font-mono text-[11px] text-indigo-400">Code: {st.code}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {st.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {st.address}
                </p>
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                  <span>Guard Posts: 4 Active</span>
                  <span className="text-blue-400 font-medium">{st.location || 'Accra Metro'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: OFFICERS */}
      {activeTab === 'OFFICERS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Personnel & Security Officers</h3>
              <p className="text-xs text-slate-400">Station assignments, roles, and status</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Personnel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Personnel</th>
                  <th className="pb-3 px-2">Employee ID</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Assigned Station</th>
                  <th className="pb-3 px-2">Contact</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {officers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-2 font-bold text-white">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3 px-2 font-mono text-indigo-400">{u.employeeId}</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-300">{u.stationName || 'Head Office'}</td>
                    <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: INCIDENTS */}
      {activeTab === 'INCIDENTS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Security Occurrences & Critical Incident Log</h3>
            <p className="text-xs text-slate-400">Organization-wide incident management and escalation</p>
          </div>

          <div className="space-y-3">
            {occurrences.map((occ) => (
              <div
                key={occ.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{occ.type}</span>
                    <span className="text-slate-400">• {occ.stationName} ({occ.location})</span>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded border ${
                      occ.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : occ.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    }`}
                  >
                    {occ.severity} SEVERITY
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{occ.description}</p>
                {occ.immediateAction && (
                  <p className="text-emerald-400 text-[11px]">
                    <strong>Immediate Action Taken:</strong> {occ.immediateAction}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Reported By: {occ.officerName} ({occ.officerEmployeeId})</span>
                  <span>{new Date(occ.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">All Shift Reports & Certificates</h3>
              <p className="text-xs text-slate-400">View duty session timelines and printable certificates</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Code</th>
                  <th className="pb-3 px-2">Station</th>
                  <th className="pb-3 px-2">Officer</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-2 font-mono font-bold text-sky-400">{r.verificationCode}</td>
                    <td className="py-3 px-2 font-semibold text-white">{r.stationName}</td>
                    <td className="py-3 px-2 text-slate-300">{r.officerName}</td>
                    <td className="py-3 px-2 text-slate-400">{r.reportDate}</td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.status === 'SIGNED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {r.status === 'SIGNED' && (
                          <button
                            onClick={() => setCertReport(r)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                            title="Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Immutable Operations Audit Log
            </h3>
            <p className="text-xs text-slate-400">Append-only audit trail recording every login, duty shift, occurrence, and digital signature</p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sky-400">[{log.action}]</span>
                  <span className="text-slate-300 ml-2">{log.userName} ({log.userRole})</span>
                  <span className="text-slate-500 ml-2">• Entity: {log.entityType} ({log.entityId || 'N/A'})</span>
                </div>
                <span className="text-slate-500 text-[10px]">
                  {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress || '127.0.0.1'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: VERIFICATION */}
      {activeTab === 'VERIFY' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Certificate Verification Portal</h3>
            <p className="text-xs text-slate-400">
              Input any report verification code (e.g., <span className="text-sky-400 font-mono font-bold">SEC-2026-ST01-000184</span>) to verify authenticity
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. SEC-2026-ST01-000184"
              value={verifyCodeInput}
              onChange={(e) => setVerifyCodeInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-white text-sm font-mono"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              {verifying ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>

          {verifyResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
              {verifyResult.error ? (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-medium">
                  {verifyResult.error}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    AUTHENTIC VERIFIED SECURITY RECORD
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-slate-300 pt-2 border-t border-slate-850">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Verification ID</span>
                      <span className="font-mono font-bold text-sky-400">{verifyResult.verificationCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Facility Station</span>
                      <span className="font-bold text-white">{verifyResult.stationName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Reporting Officer</span>
                      <span>{verifyResult.officerName} ({verifyResult.officerEmployeeId})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Digital Seal Signer</span>
                      <span className="text-emerald-400 font-bold">{verifyResult.signerName} ({verifyResult.signerRole})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Station Modal */}
      {isAddStationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h4 className="font-bold text-base text-white">Add New Security Station</h4>
            <form onSubmit={handleCreateStation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tema Port Terminal 3"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Station Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ST-06"
                  value={newStationCode}
                  onChange={(e) => setNewStationCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harbour Road, Tema"
                  value={newStationAddress}
                  onChange={(e) => setNewStationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Sector Location Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Greater Accra"
                  value={newStationLocation}
                  onChange={(e) => setNewStationLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStationOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Register Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <h4 className="font-bold text-base text-white">Enroll Security Personnel</h4>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SO-00219"
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="SECURITY_OFFICER">Security Officer</option>
                    <option value="STATION_SUPERVISOR">Station Supervisor</option>
                    <option value="STATION_MANAGER">Station Manager</option>
                    <option value="HEAD_OFFICE">Head Office Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Assigned Station</label>
                  <select
                    value={newUserStationId}
                    onChange={(e) => setNewUserStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">Head Office / Unassigned</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+233 24 555 0199"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportReviewModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onUpdate={() => fetchAllData()}
      />

      <ReportCertificateModal
        isOpen={!!certReport}
        onClose={() => setCertReport(null)}
        report={certReport}
      />
    </div>
  );
};
