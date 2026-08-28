import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api.ts';
import { refreshSocketAuth, getSocket } from '../services/socket.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeDuty: any;
  setActiveDuty: React.Dispatch<React.SetStateAction<any>>;
  refreshDuty: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDuty, setActiveDuty] = useState<any>(null);

  const refreshDuty = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setActiveDuty(null);
      return;
    }
    try {
      const duty = await api.getActiveDuty();
      setActiveDuty(duty || null);
    } catch {
      setActiveDuty(null);
    }
  }, []);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setActiveDuty(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.getMe();
      setUser(me);
      if (me?.role === 'SECURITY_OFFICER') {
        const duty = await api.getActiveDuty();
        setActiveDuty(duty || null);
      } else {
        setActiveDuty(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid, removing token...');
      removeAuthToken();
      setUser(null);
      setActiveDuty(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Central socket subscription for duty lifecycle
  useEffect(() => {
    const socket = getSocket();

    const handleDutyStarted = (duty: any) => {
      if (user?.role === 'SECURITY_OFFICER') {
        if (!duty.officerId || duty.officerId === user.id) {
          setActiveDuty(duty);
        }
      }
    };

    const handleDutyEnded = (duty: any) => {
      if (user?.role === 'SECURITY_OFFICER') {
        if (!duty.officerId || duty.officerId === user.id) {
          setActiveDuty(null);
        }
      }
    };

    const handleReportSubmitted = () => {
      if (user?.role === 'SECURITY_OFFICER') {
        refreshDuty();
      }
    };

    socket.on('duty:started', handleDutyStarted);
    socket.on('duty:ended', handleDutyEnded);
    socket.on('report:submitted', handleReportSubmitted);

    return () => {
      socket.off('duty:started', handleDutyStarted);
      socket.off('duty:ended', handleDutyEnded);
      socket.off('report:submitted', handleReportSubmitted);
    };
  }, [user, refreshDuty]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, tokens } = await api.login({ email, password: pass });
      setAuthToken(tokens.accessToken);
      setUser(loggedInUser);
      refreshSocketAuth();
      if (loggedInUser?.role === 'SECURITY_OFFICER') {
        const duty = await api.getActiveDuty();
        setActiveDuty(duty || null);
      } else {
        setActiveDuty(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      let email = 'officer@zensecurity.com';
      let pass = 'officer123';

      if (role === 'HEAD_OFFICE') {
        email = 'admin@zensecurity.com';
        pass = 'admin123';
      } else if (role === 'STATION_MANAGER') {
        email = 'manager@zensecurity.com';
        pass = 'manager123';
      } else if (role === 'STATION_SUPERVISOR') {
        email = 'supervisor@zensecurity.com';
        pass = 'super123';
      }

      const { user: loggedInUser, tokens } = await api.login({ email, password: pass });
      setAuthToken(tokens.accessToken);
      setUser(loggedInUser);
      refreshSocketAuth();
      if (loggedInUser?.role === 'SECURITY_OFFICER') {
        const duty = await api.getActiveDuty();
        setActiveDuty(duty || null);
      } else {
        setActiveDuty(null);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    removeAuthToken();
    setUser(null);
    setActiveDuty(null);
    refreshSocketAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, activeDuty, setActiveDuty, refreshDuty, login, switchDemoRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
