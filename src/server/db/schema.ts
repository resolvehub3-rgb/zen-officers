/**
 * Drizzle ORM Schema definitions for PostgreSQL database
 */
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'SECURITY_OFFICER',
  'STATION_MANAGER',
  'STATION_SUPERVISOR',
  'HEAD_OFFICE'
]);

export const dutyStatusEnum = pgEnum('duty_status', [
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
]);

export const occurrenceSeverityEnum = pgEnum('occurrence_severity', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
]);

export const occurrenceStatusEnum = pgEnum('occurrence_status', [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'CLOSED'
]);

export const finalReportStatusEnum = pgEnum('final_report_status', [
  'DRAFT',
  'SUBMITTED',
  'CORRECTION_REQUIRED',
  'RESUBMITTED',
  'APPROVED',
  'SIGNED'
]);

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  logo: text('logo'),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const stations = pgTable('stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  address: text('address').notNull(),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  stationId: uuid('station_id').references(() => stations.id),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('SECURITY_OFFICER'),
  profileImage: text('profile_image'),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const dutySessions = pgTable('duty_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'),
  status: dutyStatusEnum('status').notNull().default('ACTIVE'),
  arrivalNotes: text('arrival_notes'),
  arrivalAudioUrl: text('arrival_audio_url'),
  arrivalTranscription: text('arrival_transcription'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const patrolSessions = pgTable('patrol_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  dutySessionId: uuid('duty_session_id').notNull().references(() => dutySessions.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  status: varchar('status', { length: 50 }).notNull().default('IN_PROGRESS'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const patrolReports = pgTable('patrol_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  patrolSessionId: uuid('patrol_session_id').notNull().references(() => patrolSessions.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  description: text('description').notNull(),
  locationTag: varchar('location_tag', { length: 255 }),
  photoUrl: text('photo_url'),
  videoUrl: text('video_url'),
  voiceNoteUrl: text('voice_note_url'),
  transcription: text('transcription'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const routineChecks = pgTable('routine_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  dutySessionId: uuid('duty_session_id').notNull().references(() => dutySessions.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  checklist: jsonb('checklist').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PASSED'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const occurrences = pgTable('occurrences', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  dutySessionId: uuid('duty_session_id').notNull().references(() => dutySessions.id),
  occurrenceNumber: varchar('occurrence_number', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  severity: occurrenceSeverityEnum('severity').notNull().default('LOW'),
  location: varchar('location', { length: 255 }).notNull(),
  description: text('description').notNull(),
  immediateAction: text('immediate_action'),
  personsInvolved: text('persons_involved'),
  witnesses: text('witnesses'),
  additionalRemarks: text('additional_remarks'),
  voiceNoteUrl: text('voice_note_url'),
  transcription: text('transcription'),
  status: occurrenceStatusEnum('status').notNull().default('OPEN'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  occurrenceId: uuid('occurrence_id').notNull().references(() => occurrences.id),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  cloudinaryPublicId: text('cloudinary_public_id'),
  url: text('url').notNull(),
  secureUrl: text('secure_url').notNull(),
  duration: integer('duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const finalReports = pgTable('final_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  dutySessionId: uuid('duty_session_id').notNull().references(() => dutySessions.id),
  officerId: uuid('officer_id').notNull().references(() => users.id),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  reportDate: varchar('report_date', { length: 50 }).notNull(),
  summary: text('summary').notNull(),
  finalCondition: varchar('final_condition', { length: 50 }).notNull().default('NORMAL'),
  outstandingIssues: text('outstanding_issues'),
  status: finalReportStatusEnum('status').notNull().default('SUBMITTED'),
  verificationCode: varchar('verification_code', { length: 100 }).notNull().unique(),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportSignatures = pgTable('report_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  finalReportId: uuid('final_report_id').notNull().references(() => finalReports.id),
  signedBy: uuid('signed_by').notNull().references(() => users.id),
  role: varchar('role', { length: 50 }).notNull(),
  signatureData: text('signature_data').notNull(),
  signedAt: timestamp('signed_at').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 100 }),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  stationId: uuid('station_id').references(() => stations.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  relatedEntityType: varchar('related_entity_type', { length: 50 }),
  relatedEntityId: uuid('related_entity_id'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
