export type UserRole = 
  | 'SECURITY_OFFICER' 
  | 'STATION_MANAGER' 
  | 'HEAD_OFFICE';

export type DutyStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type PatrolStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type OccurrenceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OccurrenceType = 
  | 'THEFT'
  | 'ATTEMPTED_THEFT'
  | 'UNAUTHORIZED_ACCESS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'PROPERTY_DAMAGE'
  | 'ACCIDENT'
  | 'FIRE_SMOKE'
  | 'SAFETY_ISSUE'
  | 'VIOLENCE'
  | 'MISSING_PROPERTY'
  | 'EQUIPMENT_FAILURE'
  | 'ACCESS_CONTROL'
  | 'INCIDENT'
  | 'OCCURRENCE'
  | 'DAMAGE'
  | 'MAINTENANCE_CONCERN'
  | 'UNUSUAL_OBSERVATION'
  | 'TRESPASSING'
  | 'OTHER';

export type FinalCondition = 'NORMAL' | 'MAINTENANCE_REQUIRED' | 'SECURITY_ATTENTION_NEEDED';

export interface RoutineCheckItem {
  id: string;
  name: string;
  status: 'OK' | 'ISSUE_FOUND' | 'NOT_APPLICABLE';
  description?: string;
  photoUrl?: string;
}

export type OccurrenceStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export type FinalReportStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CORRECTION_REQUIRED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'SIGNED';

export interface User {
  id: string;
  organizationId: string;
  stationId?: string | null;
  stationName?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeOfficersCount?: number;
  openOccurrencesCount?: number;
  pendingReportsCount?: number;
  managerName?: string;
  supervisorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface DutySession {
  id: string;
  organizationId: string;
  stationId: string;
  stationName?: string;
  officerId: string;
  officerName?: string;
  officerEmployeeId?: string;
  startTime: string;
  endTime?: string | null;
  status: DutyStatus;
  arrivalNotes?: string | null;
  arrivalAudioUrl?: string | null;
  arrivalTranscription?: string | null;
  shiftDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatrolSession {
  id: string;
  dutySessionId: string;
  officerId: string;
  officerName?: string;
  stationId: string;
  stationName?: string;
  startedAt: string;
  endedAt?: string | null;
  status: PatrolStatus;
  observationsCount?: number;
  createdAt: string;
}

export interface PatrolReport {
  id: string;
  patrolSessionId: string;
  dutySessionId?: string;
  officerId: string;
  officerName?: string;
  stationId: string;
  stationName?: string;
  locationTag?: string;
  description: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  voiceNoteUrl?: string | null;
  transcription?: string | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: 'OK' | 'ISSUE_FOUND' | 'NOT_APPLICABLE';
  description?: string;
  photoUrl?: string;
}

export interface RoutineCheck {
  id: string;
  dutySessionId: string;
  officerId: string;
  officerName?: string;
  stationId: string;
  stationName?: string;
  checklist: ChecklistItem[];
  overallStatus: 'PASSED' | 'ISSUES_DETECTED';
  notes?: string | null;
  createdAt: string;
}

export interface OccurrenceAttachment {
  id: string;
  occurrenceId: string;
  uploadedBy: string;
  type: 'PHOTO' | 'VIDEO' | 'VOICE_NOTE' | 'DOCUMENT';
  url: string;
  secureUrl: string;
  cloudinaryPublicId?: string;
  duration?: number;
  createdAt: string;
}

export interface Occurrence {
  id: string;
  organizationId: string;
  stationId: string;
  stationName?: string;
  officerId: string;
  officerName?: string;
  officerEmployeeId?: string;
  dutySessionId: string;
  occurrenceNumber: string; // e.g. OCC-2026-0828-001
  type: OccurrenceType;
  customType?: string;
  severity: OccurrenceSeverity;
  location: string;
  description: string;
  immediateAction?: string;
  personsInvolved?: string;
  witnesses?: string;
  additionalRemarks?: string;
  attachments: OccurrenceAttachment[];
  voiceNoteUrl?: string | null;
  transcription?: string | null;
  status: OccurrenceStatus;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinalReport {
  id: string;
  dutySessionId: string;
  officerId: string;
  officerName?: string;
  officerEmployeeId?: string;
  stationId: string;
  stationName?: string;
  reportDate: string;
  shiftStartTime: string;
  shiftEndTime: string;
  summary: string;
  patrolsCount: number;
  routineChecksCount: number;
  occurrencesCount: number;
  incidentsCount: number;
  finalCondition: 'NORMAL' | 'MAINTENANCE_REQUIRED' | 'SECURITY_ATTENTION_NEEDED';
  outstandingIssues?: string | null;
  handoverOfficerName?: string | null;
  status: FinalReportStatus;
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  signedAt?: string | null;
  signature?: ReportSignature | null;
  verificationCode: string; // e.g. SEC-2026-ST01-000184
  createdAt: string;
  updatedAt: string;
}

export interface ReportSignature {
  id: string;
  finalReportId: string;
  signedBy: string;
  signerName: string;
  signerEmployeeId: string;
  role: 'STATION_MANAGER' | 'HEAD_OFFICE';
  signatureData: string; // base64 canvas signature or digital seal
  signedAt: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string | null;
  targetRole?: UserRole | 'ALL';
  organizationId: string;
  stationId?: string | null;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'APPROVAL' | 'REJECT';
  title: string;
  message: string;
  relatedEntityType?: 'DUTY' | 'PATROL' | 'OCCURRENCE' | 'REPORT' | 'CHECK';
  relatedEntityId?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStations: number;
  totalOfficers: number;
  totalManagers: number;
  totalSupervisors: number;
  officersOnDuty: number;
  activePatrols: number;
  openOccurrences: number;
  criticalIncidents: number;
  pendingReports: number;
  signedReports: number;
  reportsSubmittedToday: number;
  weeklyTrend: { date: string; reports: number; incidents: number }[];
  reportsByStation: { stationName: string; count: number; percentage: number; color: string }[];
  occurrencesBySeverity: { severity: string; count: number; color: string }[];
  occurrencesByType: { type: string; count: number }[];
}
