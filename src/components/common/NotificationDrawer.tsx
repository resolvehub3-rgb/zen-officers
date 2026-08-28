import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { getSocket } from '../../services/socket.ts';
import { NotificationItem } from '../../types/index.ts';
import { Bell, X, CheckCircle2, AlertTriangle, AlertCircle, Info, ShieldCheck, Check } from 'lucide-react';

export const NotificationDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    const handleNewNotif = (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('notification:created', handleNewNotif);
    socket.on('occurrence:critical', () => {
      fetchNotifs();
    });
    socket.on('report:signed', () => {
      fetchNotifs();
    });

    return () => {
      socket.off('notification:created', handleNewNotif);
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100">Live Security Alerts</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                {notifications.filter((n) => !n.readAt).length} new
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">All clear</p>
                <p className="text-xs">No active security alerts</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                const isCritical = notif.type === 'CRITICAL';
                const isWarning = notif.type === 'WARNING';
                const isSuccess = notif.type === 'SUCCESS';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all relative ${
                      isCritical
                        ? 'bg-red-950/30 border-red-500/40 text-red-100'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                        : isSuccess
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                    } ${isUnread ? 'ring-1 ring-blue-500/40' : 'opacity-80'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCritical ? (
                          <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                      </div>

                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
