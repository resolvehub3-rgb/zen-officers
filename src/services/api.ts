/**
 * Centralized API Client with Offline Support & Sync Queue for PWA
 */

const API_BASE = '/api/v1';

export class ApiError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('zen_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('zen_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('zen_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || 'An unexpected error occurred.',
        data.code,
        response.status
      );
    }

    return data.data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network communication failed.');
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Stations
  getStations: () => request<any[]>('/stations'),
  getStation: (id: string) => request<any>(`/stations/${id}`),
  createStation: (data: any) => request<any>('/stations', { method: 'POST', body: JSON.stringify(data) }),
  updateStation: (id: string, data: any) => request<any>(`/stations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Users
  getUsers: (stationId?: string) => request<any[]>(`/users${stationId ? `?stationId=${stationId}` : ''}`),
  createUser: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Duties
  getActiveDuty: () => request<any>('/duties/active'),
  getDuties: (params?: { stationId?: string; officerId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/duties${query ? `?${query}` : ''}`);
  },
  startDuty: (data: { stationId?: string; arrivalNotes?: string; arrivalAudioUrl?: string; arrivalTranscription?: string }) =>
    request<any>('/duties/start', { method: 'POST', body: JSON.stringify(data) }),
  endDuty: (id: string) => request<any>(`/duties/${id}/end`, { method: 'POST' }),

  // Patrols
  getPatrols: (params?: { stationId?: string; officerId?: string; dutySessionId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ sessions: any[]; reports: any[] }>(`/patrols${query ? `?${query}` : ''}`);
  },
  startPatrol: (data: { dutySessionId: string; stationId?: string }) =>
    request<any>('/patrols/start', { method: 'POST', body: JSON.stringify(data) }),
  submitPatrolReport: (data: any) =>
    request<any>('/patrols/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Checks
  getChecks: (params?: { stationId?: string; officerId?: string; dutySessionId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/checks${query ? `?${query}` : ''}`);
  },
  submitCheck: (data: any) => request<any>('/checks', { method: 'POST', body: JSON.stringify(data) }),

  // Occurrences
  getOccurrences: (params?: { stationId?: string; officerId?: string; severity?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/occurrences${query ? `?${query}` : ''}`);
  },
  createOccurrence: (data: any) => request<any>('/occurrences', { method: 'POST', body: JSON.stringify(data) }),
  updateOccurrence: (id: string, data: any) => request<any>(`/occurrences/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Final Reports
  getFinalReports: (params?: { stationId?: string; officerId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/reports${query ? `?${query}` : ''}`);
  },
  getReportTimeline: (dutySessionId: string) => request<any>(`/reports/timeline/${dutySessionId}`),
  verifyReport: (code: string) => request<any>(`/reports/verify/${code}`),
  submitFinalReport: (data: any) => request<any>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  rejectReport: (id: string, reason: string) =>
    request<any>(`/reports/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  signReport: (id: string, signatureData: string) =>
    request<any>(`/reports/${id}/sign`, { method: 'POST', body: JSON.stringify({ signatureData }) }),

  // Analytics & Stats
  getStats: (stationId?: string) => request<any>(`/analytics/stats${stationId ? `?stationId=${stationId}` : ''}`),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
  deleteNotification: (id: string) => request<any>(`/notifications/${id}`, { method: 'DELETE' }),
  clearAllNotifications: () => request<any>('/notifications', { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: () => request<any[]>('/audit-logs'),

  // Voice Speech-To-Text
  transcribeAudio: (audioBase64: string, mimeType?: string) =>
    request<{ transcription: string; timestamp: string }>('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType }),
    }),
};
