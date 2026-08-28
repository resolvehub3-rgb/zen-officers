import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { 
  Users, 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  PenTool, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  Search, 
  Filter, 
  Eye, 
  Building2,
  Calendar,
  ChevronRight,
  Shield,
  Radio,
  FileText
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ReportReviewModal } from './ReportReviewModal.tsx';
import { ReportCertificateModal } from '../reports/ReportCertificateModal.tsx';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [certReport, setCertReport] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes, officersRes] = await Promise.all([
        api.getStats(user?.stationId || undefined),
        api.getFinalReports({ stationId: user?.stationId || undefined }),
        api.getUsers(user?.stationId || undefined),
      ]);
      setStats(statsRes);
      setReports(reportsRes);
      setOfficers(officersRes);
    } catch (e) {
      console.error('Failed to load manager data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    const handleActivity = (act: any) => {
      setActivities((prev) => [act, ...prev.slice(0, 15)]);
    };

    const handleDataRefresh = () => {
      fetchData();
    };

    socket.on('station:activity', handleActivity);
    socket.on('report:submitted', handleDataRefresh);
    socket.on('report:signed', handleDataRefresh);
    socket.on('duty:started', handleDataRefresh);
    socket.on('duty:ended', handleDataRefresh);

    return () => {
      socket.off('station:activity', handleActivity);
      socket.off('report:submitted', handleDataRefresh);
      socket.off('report:signed', handleDataRefresh);
      socket.off('duty:started', handleDataRefresh);
      socket.off('duty:ended', handleDataRefresh);
    };
  }, [user]);

  const pendingReports = reports.filter((r) => r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED');

  // Chart data for Reports Summary Donut Chart
  const chartData = [
    { name: 'Patrol Sweeps', value: 48, color: '#a855f7' },
    { name: 'Occurrences Logged', value: 31, color: '#3b82f6' },
    { name: 'Verified Final Reports', value: 21, color: '#10b981' },
  ];

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isSupervisor = user?.role === 'STATION_SUPERVISOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Station Manager / Supervisor Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {isSupervisor ? 'Station Supervisor Dashboard' : 'Station Management Dashboard'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Station Code: {user?.stationId || 'ST-01'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {user?.stationName || 'North Gate Station'} Operations
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Duty {isSupervisor ? 'Station Supervisor' : 'Station Manager'}: <strong className="text-slate-200">{user?.firstName} {user?.lastName} ({user?.employeeId})</strong>
          </p>
        </div>

        {/* Pending approvals badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              {pendingReports.length}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Pending Approvals</p>
              <p className="text-xs font-semibold text-white">
                {pendingReports.length > 0 ? 'Requires Sign-Off' : 'All Reports Cleared'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards (Matching Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Officers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Officers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {stats?.activeOfficersCount || officers.length || 18}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Active on station
          </p>
        </div>

        {/* Reports Submitted */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Reports Submitted</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalReportsCount || reports.length || 48}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">This shift cycle</p>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">
            {pendingReports.length}
          </p>
          <p className="text-[11px] text-amber-400/80 mt-1">Awaiting digital signature</p>
        </div>

        {/* Incidents Reported */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Incidents Reported</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {stats?.criticalOccurrencesCount || 6}
          </p>
          <p className="text-[11px] text-red-400 mt-1">Resolved & logged</p>
        </div>
      </div>

      {/* Two Column Layout: Reports Summary Chart + Pending Approvals Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Reports Summary */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Reports Summary</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of station operational reports</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-400 truncate">{d.name}</span>
                <span className="font-bold text-white ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Quick Queue */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-400" />
                  Pending Shift Approvals ({pendingReports.length})
                </h3>
                <p className="text-xs text-slate-400">Review full duty timeline and apply digital signature</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {pendingReports.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs font-semibold text-slate-300">All Shift Reports Approved</p>
                  <p className="text-[11px] text-slate-500">No shift reports awaiting manager signature</p>
                </div>
              ) : (
                pendingReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{r.officerName}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {r.verificationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{r.summary}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        Shift: {new Date(r.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.shiftEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {r.patrolsCount || 0} Patrols
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedReport(r)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0 hover:scale-105"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Review & Sign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Cryptographic integrity enforced by SHA-256 hash</span>
            <span className="text-emerald-400 font-semibold">Ready for Review</span>
          </div>
        </div>
      </div>

      {/* Recent Reports Table Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Shift Reports</h3>
            <p className="text-xs text-slate-400">Complete audit log of submitted and signed station reports</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search officer or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-none w-44 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SIGNED">Signed & Sealed</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="RETURNED_FOR_CORRECTION">Returned</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Verification Code</th>
                <th className="pb-3 px-2">Officer</th>
                <th className="pb-3 px-2">Date & Time</th>
                <th className="pb-3 px-2">Condition</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching shift reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const isSigned = r.status === 'SIGNED';
                  return (
                    <tr key={r.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-sky-400">{r.verificationCode}</td>
                      <td className="py-3 px-2 font-semibold text-white">
                        {r.officerName}
                        <span className="block text-[10px] font-mono text-slate-500">{r.officerEmployeeId}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {r.reportDate}
                        <span className="block text-[10px] text-slate-500">
                          {new Date(r.shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.finalCondition === 'NORMAL'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {r.finalCondition}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isSigned
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.status === 'RETURNED_FOR_CORRECTION'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {isSigned ? 'SIGNED' : r.status === 'RETURNED_FOR_CORRECTION' ? 'RETURNED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Review Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isSigned && (
                            <button
                              onClick={() => setCertReport(r)}
                              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors"
                              title="Print Certificate"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ReportReviewModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onUpdate={() => fetchData()}
      />

      <ReportCertificateModal
        isOpen={!!certReport}
        onClose={() => setCertReport(null)}
        report={certReport}
      />
    </div>
  );
};
