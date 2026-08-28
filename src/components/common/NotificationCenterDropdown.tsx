import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { NotificationItem } from '../../types/index.ts';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  Filter,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

interface NotificationCenterDropdownProps {
  onSelectOccurrence?: (occurrenceId: string) => void;
  onSelectReport?: (reportId: string) => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  onSelectOccurrence,
  onSelectReport,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('zen_notif_sound') !== 'false';
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Play audio chime for urgent alerts if sound is enabled
  const playAlertSound = (type: string) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'CRITICAL' || type === 'HIGH') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('zen_notif_sound', String(next));
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen to live socket events
  useEffect(() => {
    const socket = getSocket();

    const handleNewNotif = (notif: NotificationItem) => {
      setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
      playAlertSound(notif.type);
    };

    const handleCritical = () => {
      fetchNotifications();
      playAlertSound('CRITICAL');
    };

    const handleGenericRefresh = () => {
      fetchNotifications();
    };

    socket.on('notification:created', handleNewNotif);
    socket.on('occurrence:critical', handleCritical);
    socket.on('report:submitted', handleGenericRefresh);
    socket.on('report:signed', handleGenericRefresh);

    return () => {
      socket.off('notification:created', handleNewNotif);
      socket.off('occurrence:critical', handleCritical);
      socket.off('report:submitted', handleGenericRefresh);
      socket.off('report:signed', handleGenericRefresh);
    };
  }, [soundEnabled]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || now })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications in your inbox?')) return;
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const criticalCount = notifications.filter(n => n.type === 'CRITICAL' && !n.readAt).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.readAt;
    if (filter === 'CRITICAL') return n.type === 'CRITICAL';
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-center-button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Security Notification Center"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all duration-150 border ${
          isOpen
            ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/10'
            : unreadCount > 0
            ? 'bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
            : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
        }`}
        title="Real-Time Alerts & Operations Feed"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white shadow-md shadow-red-600/30 border border-slate-900 animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-red-500 opacity-75 animate-ping" />
        )}
      </button>

      {/* Dropdown Menu Box */}
      {isOpen && (
        <div 
          id="notification-center-dropdown"
          className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </h4>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={soundEnabled ? 'Alert sounds active (click to mute)' : 'Alert sounds muted (click to enable)'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Clear all alerts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills & Mark All Read */}
          <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  filter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  filter === 'UNREAD'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  filter === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-red-300 hover:bg-slate-800'
                }`}
              >
                Critical ({criticalCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline whitespace-nowrap"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications Scroll Area */}
          <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-2 divide-y divide-slate-800/40">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Loading security notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500/80" />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {filter === 'UNREAD' ? 'No unread notifications' : filter === 'CRITICAL' ? 'No critical incidents' : 'No alerts recorded'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Station security feeds and shift alerts will appear here in real time.
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const isUnread = !notif.readAt;
                const isCritical = notif.type === 'CRITICAL';
                const isWarning = notif.type === 'WARNING';
                const isSuccess = notif.type === 'SUCCESS';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (isUnread) handleMarkRead(notif.id);
                      if (notif.relatedEntityType === 'OCCURRENCE' && notif.relatedEntityId && onSelectOccurrence) {
                        onSelectOccurrence(notif.relatedEntityId);
                        setIsOpen(false);
                      } else if (notif.relatedEntityType === 'REPORT' && notif.relatedEntityId && onSelectReport) {
                        onSelectReport(notif.relatedEntityId);
                        setIsOpen(false);
                      }
                    }}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                      isCritical
                        ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/30 hover:bg-amber-950/30'
                        : isSuccess
                        ? 'bg-emerald-950/15 border-emerald-500/25 hover:bg-emerald-950/25'
                        : isUnread
                        ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {isCritical ? (
                          <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                        ) : isWarning ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : isSuccess ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${isCritical ? 'text-red-200' : isUnread ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>

                        {/* Interactive hint if item is linked */}
                        {(notif.relatedEntityType === 'OCCURRENCE' || notif.relatedEntityType === 'REPORT') && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-400 font-semibold">
                            <FileText className="w-3 h-3" />
                            <span>View linked {notif.relatedEntityType.toLowerCase()} record</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </div>
                        )}
                      </div>

                      {/* Right action controls */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkRead(notif.id, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-700/80 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notif.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700/80 transition-opacity"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="p-2.5 px-3.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live socket sync active
            </span>
            <span className="font-mono text-[10px] text-slate-500">GMT (Africa/Accra)</span>
          </div>
        </div>
      )}
    </div>
  );
};
