import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  Station,
  Organization,
  DutySession,
  PatrolSession,
  PatrolReport,
  RoutineCheck,
  Occurrence,
  OccurrenceAttachment,
  FinalReport,
  ReportSignature,
  NotificationItem,
  AuditLog,
  DashboardStats
} from '../../types/index.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'security_db.json');

interface DatabaseSchema {
  organizations: Organization[];
  stations: Station[];
  users: (User & { passwordHash: string })[];
  dutySessions: DutySession[];
  patrolSessions: PatrolSession[];
  patrolReports: PatrolReport[];
  routineChecks: RoutineCheck[];
  occurrences: Occurrence[];
  attachments: OccurrenceAttachment[];
  finalReports: FinalReport[];
  signatures: ReportSignature[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

// Seed initial production schema structure
const INITIAL_ORG_ID = 'org-zen-001';
const NORTH_GATE_STATION_ID = 'st-north-01';
const EAST_SIDE_STATION_ID = 'st-east-02';
const WEST_POINT_STATION_ID = 'st-west-03';
const MAIN_CAMPUS_STATION_ID = 'st-main-04';
const SOUTH_AREA_STATION_ID = 'st-south-05';

function createDefaultSeed(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const managerHash = bcrypt.hashSync('manager123', salt);
  const supervisorHash = bcrypt.hashSync('super123', salt);
  const officerHash = bcrypt.hashSync('officer123', salt);

  const org: Organization = {
    id: INITIAL_ORG_ID,
    name: 'Zen Security Operations Ltd',
    code: 'ZEN-SEC',
    logo: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&auto=format&fit=crop&q=60',
    address: 'Aegis House, 44 Liberation Road, Accra, Ghana',
    phone: '+233 30 200 4499',
    email: 'operations@zensecurity.com',
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  };

  const stationsList: Station[] = [
    {
      id: NORTH_GATE_STATION_ID,
      organizationId: INITIAL_ORG_ID,
      name: 'North Gate Station',
      code: 'ST-01',
      address: 'North Industrial Area, Gate 1, Ring Road West',
      location: 'Accra North Sector',
      status: 'ACTIVE',
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
    },
    {
      id: EAST_SIDE_STATION_ID,
      organizationId: INITIAL_ORG_ID,
      name: 'East Side Station',
      code: 'ST-02',
      address: 'East Legon Logistics Hub, Tech Park B',
      location: 'Greater Accra East',
      status: 'ACTIVE',
      createdAt: '2026-01-22T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
    },
    {
      id: WEST_POINT_STATION_ID,
      organizationId: INITIAL_ORG_ID,
      name: 'West Point Station',
      code: 'ST-03',
      address: 'West Point Terminal, Commercial Bay 4',
      location: 'Accra West Maritime',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
    },
    {
      id: MAIN_CAMPUS_STATION_ID,
      organizationId: INITIAL_ORG_ID,
      name: 'Main Campus Station',
      code: 'ST-04',
      address: 'Corporate Headquarters & Banking Complex',
      location: 'Airport City, Accra',
      status: 'ACTIVE',
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
    },
    {
      id: SOUTH_AREA_STATION_ID,
      organizationId: INITIAL_ORG_ID,
      name: 'South Area Station',
      code: 'ST-05',
      address: 'Tema Port Bonded Warehouse Terminal 3',
      location: 'Tema Industrial Zone',
      status: 'ACTIVE',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
    },
  ];

  const usersList: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-001',
      organizationId: INITIAL_ORG_ID,
      stationId: null,
      stationName: 'Head Office',
      employeeId: 'EMP-HO-001',
      firstName: 'Admin',
      lastName: 'Director',
      email: 'admin@zensecurity.com',
      phone: '+233 24 111 0001',
      role: 'HEAD_OFFICE',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T05:00:00.000Z',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: adminHash,
    },
    {
      id: 'usr-mgr-001',
      organizationId: INITIAL_ORG_ID,
      stationId: NORTH_GATE_STATION_ID,
      stationName: 'North Gate Station',
      employeeId: 'EMP-MGR-101',
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'manager@zensecurity.com',
      phone: '+233 24 222 1010',
      role: 'STATION_MANAGER',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T05:10:00.000Z',
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: managerHash,
    },
    {
      id: 'usr-sup-001',
      organizationId: INITIAL_ORG_ID,
      stationId: NORTH_GATE_STATION_ID,
      stationName: 'North Gate Station',
      employeeId: 'EMP-SUP-202',
      firstName: 'Emmanuel',
      lastName: 'Osei',
      email: 'supervisor@zensecurity.com',
      phone: '+233 24 333 2020',
      role: 'STATION_SUPERVISOR',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T04:45:00.000Z',
      createdAt: '2026-01-21T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: supervisorHash,
    },
    {
      id: 'usr-off-001',
      organizationId: INITIAL_ORG_ID,
      stationId: NORTH_GATE_STATION_ID,
      stationName: 'North Gate Station',
      employeeId: 'SEC-OFF-301',
      firstName: 'Officer',
      lastName: 'Kofi Boateng',
      email: 'officer@zensecurity.com',
      phone: '+233 24 444 3010',
      role: 'SECURITY_OFFICER',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T05:15:00.000Z',
      createdAt: '2026-01-25T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: officerHash,
    },
    {
      id: 'usr-off-002',
      organizationId: INITIAL_ORG_ID,
      stationId: EAST_SIDE_STATION_ID,
      stationName: 'East Side Station',
      employeeId: 'SEC-OFF-302',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@zensecurity.com',
      phone: '+233 24 555 3020',
      role: 'SECURITY_OFFICER',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T04:30:00.000Z',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: officerHash,
    },
    {
      id: 'usr-off-003',
      organizationId: INITIAL_ORG_ID,
      stationId: WEST_POINT_STATION_ID,
      stationName: 'West Point Station',
      employeeId: 'SEC-OFF-303',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'janesmith@zensecurity.com',
      phone: '+233 24 666 3030',
      role: 'SECURITY_OFFICER',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-28T03:00:00.000Z',
      createdAt: '2026-02-05T00:00:00.000Z',
      updatedAt: '2026-08-28T00:00:00.000Z',
      passwordHash: officerHash,
    }
  ];

  // Completed previous duty for Kofi Boateng at North Gate Station
  const initialDuty: DutySession = {
    id: 'duty-prev-001',
    organizationId: INITIAL_ORG_ID,
    stationId: NORTH_GATE_STATION_ID,
    stationName: 'North Gate Station',
    officerId: 'usr-off-001',
    officerName: 'Kofi Boateng',
    officerEmployeeId: 'SEC-OFF-301',
    startTime: '2026-08-27T18:00:00.000Z',
    endTime: '2026-08-28T06:00:00.000Z',
    status: 'COMPLETED',
    arrivalNotes: 'Arrived on duty for overnight shift. Handover completed smoothly.',
    createdAt: '2026-08-27T18:00:00.000Z',
    updatedAt: '2026-08-28T06:00:00.000Z',
  };

  const initialPatrol: PatrolSession = {
    id: 'patrol-session-001',
    dutySessionId: initialDuty.id,
    officerId: 'usr-off-001',
    officerName: 'Kofi Boateng',
    stationId: NORTH_GATE_STATION_ID,
    stationName: 'North Gate Station',
    startedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    observationsCount: 1,
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  };

  const initialPatrolReport: PatrolReport = {
    id: 'patrol-rep-001',
    patrolSessionId: initialPatrol.id,
    dutySessionId: initialDuty.id,
    officerId: 'usr-off-001',
    officerName: 'Kofi Boateng',
    stationId: NORTH_GATE_STATION_ID,
    stationName: 'North Gate Station',
    locationTag: 'Main Warehouse & Perimeter Fence East',
    description: 'Conducted regular physical inspection along East perimeter fence line. Emergency lighting fully operational. Padlocks intact on all secondary gates.',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
    transcription: 'Conducted regular physical inspection along East perimeter fence line. All lighting normal.',
    createdAt: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
  };

  const initialRoutineCheck: RoutineCheck = {
    id: 'check-001',
    dutySessionId: initialDuty.id,
    officerId: 'usr-off-001',
    officerName: 'Kofi Boateng',
    stationId: NORTH_GATE_STATION_ID,
    stationName: 'North Gate Station',
    checklist: [
      { id: '1', name: 'Main gate barrier & hydraulic lock checked', status: 'OK' },
      { id: '2', name: 'Perimeter fence integrity & barbed wire', status: 'OK' },
      { id: '3', name: 'Access control biometric & card readers', status: 'OK' },
      { id: '4', name: 'Fire extinguishers & pressure gauges', status: 'OK' },
      { id: '5', name: 'CCTV control room monitors & feeds', status: 'OK' },
      { id: '6', name: 'Emergency backup lighting & generators', status: 'OK' },
      { id: '7', name: 'Visitor logbook & badge station', status: 'OK' },
      { id: '8', name: 'Parking lot surveillance & lighting', status: 'OK' },
    ],
    overallStatus: 'PASSED',
    notes: 'Routine morning security equipment checklist completed without anomalies.',
    createdAt: new Date(Date.now() - 3.2 * 60 * 60 * 1000).toISOString(),
  };

  const initialOccurrence: Occurrence = {
    id: 'occ-001',
    organizationId: INITIAL_ORG_ID,
    stationId: NORTH_GATE_STATION_ID,
    stationName: 'North Gate Station',
    officerId: 'usr-off-001',
    officerName: 'Kofi Boateng',
    officerEmployeeId: 'SEC-OFF-301',
    dutySessionId: initialDuty.id,
    occurrenceNumber: 'OCC-2026-0828-001',
    type: 'SUSPICIOUS_ACTIVITY',
    severity: 'MEDIUM',
    location: 'North Gate Exterior Visitors Parking Bay 4',
    description: 'Unidentified commercial van parked near perimeter line for over 45 minutes with hazard lights on. Driver claimed to be waiting for logistics contact.',
    immediateAction: 'Approached driver, verified national ID and vehicle registration, directed vehicle to designated commercial delivery waiting zone.',
    personsInvolved: 'Driver: K. Mensah (Delivery contractor)',
    witnesses: 'Guard Post 2 Officer',
    additionalRemarks: 'Registration logged in gate entry book.',
    attachments: [
      {
        id: 'att-001',
        occurrenceId: 'occ-001',
        uploadedBy: 'usr-off-001',
        type: 'PHOTO',
        url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60',
        secureUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      }
    ],
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  };

  // Completed final report awaiting review from John Doe at East Side Station
  const completedDuty: DutySession = {
    id: 'duty-completed-002',
    organizationId: INITIAL_ORG_ID,
    stationId: EAST_SIDE_STATION_ID,
    stationName: 'East Side Station',
    officerId: 'usr-off-002',
    officerName: 'John Doe',
    officerEmployeeId: 'SEC-OFF-302',
    startTime: '2026-08-27T18:00:00.000Z',
    endTime: '2026-08-28T06:00:00.000Z',
    status: 'COMPLETED',
    arrivalNotes: 'Arrived at 17:55. Shift takeover completed with Officer Mensah.',
    createdAt: '2026-08-27T18:00:00.000Z',
    updatedAt: '2026-08-28T06:00:00.000Z',
  };

  const initialFinalReport: FinalReport = {
    id: 'rep-final-001',
    dutySessionId: completedDuty.id,
    officerId: 'usr-off-002',
    officerName: 'John Doe',
    officerEmployeeId: 'SEC-OFF-302',
    stationId: EAST_SIDE_STATION_ID,
    stationName: 'East Side Station',
    reportDate: '2026-08-28',
    shiftStartTime: '18:00',
    shiftEndTime: '06:00',
    summary: 'Completed 12-hour overnight duty at East Side Station. Conducted 5 perimeter patrols, 2 routine station checks, and logged 1 medium occurrence. Handover completed to morning team.',
    patrolsCount: 5,
    routineChecksCount: 2,
    occurrencesCount: 1,
    incidentsCount: 0,
    finalCondition: 'NORMAL',
    outstandingIssues: 'East gate perimeter spotlight 3 bulb requires electrical replacement.',
    handoverOfficerName: 'Officer Michael Lee',
    status: 'SUBMITTED',
    verificationCode: 'SEC-2026-ST02-000184',
    submittedAt: '2026-08-28T06:02:00.000Z',
    createdAt: '2026-08-28T06:02:00.000Z',
    updatedAt: '2026-08-28T06:02:00.000Z',
  };

  // Signed final report from Jane Smith at West Point Station
  const signedDuty: DutySession = {
    id: 'duty-signed-003',
    organizationId: INITIAL_ORG_ID,
    stationId: WEST_POINT_STATION_ID,
    stationName: 'West Point Station',
    officerId: 'usr-off-003',
    officerName: 'Jane Smith',
    officerEmployeeId: 'SEC-OFF-303',
    startTime: '2026-08-27T06:00:00.000Z',
    endTime: '2026-08-27T18:00:00.000Z',
    status: 'COMPLETED',
    arrivalNotes: 'Arrived for day shift. Post inspection satisfactory.',
    createdAt: '2026-08-27T06:00:00.000Z',
    updatedAt: '2026-08-27T18:00:00.000Z',
  };

  const initialSignedReport: FinalReport = {
    id: 'rep-final-002',
    dutySessionId: signedDuty.id,
    officerId: 'usr-off-003',
    officerName: 'Jane Smith',
    officerEmployeeId: 'SEC-OFF-303',
    stationId: WEST_POINT_STATION_ID,
    stationName: 'West Point Station',
    reportDate: '2026-08-27',
    shiftStartTime: '06:00',
    shiftEndTime: '18:00',
    summary: 'Day shift completed smoothly. 4 patrols conducted, dock cargo area monitored, all access points secure.',
    patrolsCount: 4,
    routineChecksCount: 2,
    occurrencesCount: 0,
    incidentsCount: 0,
    finalCondition: 'NORMAL',
    outstandingIssues: 'None',
    handoverOfficerName: 'Officer Daniel Mensah',
    status: 'SIGNED',
    verificationCode: 'SEC-2026-ST03-000183',
    submittedAt: '2026-08-27T18:05:00.000Z',
    reviewedAt: '2026-08-27T18:12:00.000Z',
    signedAt: '2026-08-27T18:14:00.000Z',
    signature: {
      id: 'sig-001',
      finalReportId: 'rep-final-002',
      signedBy: 'usr-mgr-001',
      signerName: 'Kwame Mensah',
      signerEmployeeId: 'EMP-MGR-101',
      role: 'STATION_MANAGER',
      signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10,40 Q50,5 90,30 T170,25" fill="none" stroke="%232563eb" stroke-width="3"/></svg>',
      signedAt: '2026-08-27T18:14:00.000Z',
      ipAddress: '127.0.0.1',
    },
    createdAt: '2026-08-27T18:05:00.000Z',
    updatedAt: '2026-08-27T18:14:00.000Z',
  };

  const initialNotifications: NotificationItem[] = [
    {
      id: 'notif-001',
      organizationId: INITIAL_ORG_ID,
      stationId: NORTH_GATE_STATION_ID,
      targetRole: 'ALL',
      type: 'INFO',
      title: 'Duty Started',
      message: 'Officer Kofi Boateng commenced duty at North Gate Station.',
      relatedEntityType: 'DUTY',
      relatedEntityId: initialDuty.id,
      createdAt: initialDuty.startTime,
    },
    {
      id: 'notif-002',
      organizationId: INITIAL_ORG_ID,
      stationId: NORTH_GATE_STATION_ID,
      targetRole: 'STATION_MANAGER',
      type: 'WARNING',
      title: 'Occurrence Reported',
      message: 'Medium occurrence reported at North Gate Station: Suspicious vehicle in Visitor Parking.',
      relatedEntityType: 'OCCURRENCE',
      relatedEntityId: initialOccurrence.id,
      createdAt: initialOccurrence.createdAt,
    },
    {
      id: 'notif-003',
      organizationId: INITIAL_ORG_ID,
      stationId: EAST_SIDE_STATION_ID,
      targetRole: 'STATION_MANAGER',
      type: 'APPROVAL',
      title: 'Final Report Submitted',
      message: 'Officer John Doe submitted final shift report for East Side Station (Awaiting Review).',
      relatedEntityType: 'REPORT',
      relatedEntityId: initialFinalReport.id,
      createdAt: initialFinalReport.submittedAt,
    },
    {
      id: 'notif-004',
      organizationId: INITIAL_ORG_ID,
      stationId: WEST_POINT_STATION_ID,
      targetRole: 'ALL',
      type: 'SUCCESS',
      title: 'Report Signed & Locked',
      message: 'Manager Kwame Mensah approved and digitally signed final report SEC-2026-ST03-000183.',
      relatedEntityType: 'REPORT',
      relatedEntityId: initialSignedReport.id,
      createdAt: '2026-08-27T18:14:00.000Z',
    }
  ];

  const initialAuditLogs: AuditLog[] = [
    {
      id: 'audit-001',
      organizationId: INITIAL_ORG_ID,
      userId: 'usr-off-001',
      userName: 'Kofi Boateng',
      userRole: 'SECURITY_OFFICER',
      action: 'DUTY_STARTED',
      entityType: 'DUTY_SESSION',
      entityId: initialDuty.id,
      metadata: { stationId: NORTH_GATE_STATION_ID, stationName: 'North Gate Station' },
      createdAt: initialDuty.startTime,
    },
    {
      id: 'audit-002',
      organizationId: INITIAL_ORG_ID,
      userId: 'usr-off-001',
      userName: 'Kofi Boateng',
      userRole: 'SECURITY_OFFICER',
      action: 'PATROL_COMPLETED',
      entityType: 'PATROL_SESSION',
      entityId: initialPatrol.id,
      metadata: { location: 'Main Warehouse & Perimeter Fence East' },
      createdAt: initialPatrol.endedAt!,
    },
    {
      id: 'audit-003',
      organizationId: INITIAL_ORG_ID,
      userId: 'usr-off-001',
      userName: 'Kofi Boateng',
      userRole: 'SECURITY_OFFICER',
      action: 'OCCURRENCE_CREATED',
      entityType: 'OCCURRENCE',
      entityId: initialOccurrence.id,
      metadata: { severity: 'MEDIUM', type: 'SUSPICIOUS_ACTIVITY' },
      createdAt: initialOccurrence.createdAt,
    },
    {
      id: 'audit-004',
      organizationId: INITIAL_ORG_ID,
      userId: 'usr-mgr-001',
      userName: 'Kwame Mensah',
      userRole: 'STATION_MANAGER',
      action: 'FINAL_REPORT_SIGNED',
      entityType: 'FINAL_REPORT',
      entityId: initialSignedReport.id,
      metadata: { verificationCode: 'SEC-2026-ST03-000183' },
      createdAt: '2026-08-27T18:14:00.000Z',
    }
  ];

  return {
    organizations: [org],
    stations: stationsList,
    users: usersList,
    dutySessions: [initialDuty, completedDuty, signedDuty],
    patrolSessions: [initialPatrol],
    patrolReports: [initialPatrolReport],
    routineChecks: [initialRoutineCheck],
    occurrences: [initialOccurrence],
    attachments: initialOccurrence.attachments,
    finalReports: [initialFinalReport, initialSignedReport],
    signatures: initialSignedReport.signature ? [initialSignedReport.signature] : [],
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && parsed.users && parsed.stations && parsed.organizations) {
          if (Array.isArray(parsed.dutySessions)) {
            parsed.dutySessions.forEach((d: any) => {
              if (d.id === 'duty-active-001' && d.status === 'ACTIVE') {
                d.status = 'COMPLETED';
                d.endTime = d.endTime || '2026-08-28T06:00:00.000Z';
              }
            });
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing db file, initializing default seed:', err);
    }

    const defaultSeed = createDefaultSeed();
    this.saveData(defaultSeed);
    return defaultSeed;
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.data = createDefaultSeed();
    this.saveData(this.data);
    return this.data;
  }

  // --- Transactions & Audit Logging ---
  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 2000 logs
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 2000);
    }
    this.saveData(this.data);
    return newLog;
  }

  public createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    if (this.data.notifications.length > 1000) {
      this.data.notifications = this.data.notifications.slice(0, 1000);
    }
    this.saveData(this.data);
    return newNotif;
  }

  // --- Organizations ---
  public getOrganization(id: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === id);
  }

  public getAllOrganizations(): Organization[] {
    return this.data.organizations;
  }

  // --- Stations ---
  public getAllStations(orgId: string): Station[] {
    const stations = this.data.stations.filter(s => s.organizationId === orgId);
    return stations.map(st => {
      const activeOfficers = this.data.dutySessions.filter(
        d => d.stationId === st.id && d.status === 'ACTIVE'
      ).length;
      const openOccurrences = this.data.occurrences.filter(
        o => o.stationId === st.id && o.status === 'OPEN'
      ).length;
      const pendingReports = this.data.finalReports.filter(
        r => r.stationId === st.id && (r.status === 'SUBMITTED' || r.status === 'RESUBMITTED')
      ).length;
      const manager = this.data.users.find(u => u.stationId === st.id && u.role === 'STATION_MANAGER');
      const supervisor = this.data.users.find(u => u.stationId === st.id && u.role === 'STATION_SUPERVISOR');

      return {
        ...st,
        activeOfficersCount: activeOfficers,
        openOccurrencesCount: openOccurrences,
        pendingReportsCount: pendingReports,
        managerName: manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned',
        supervisorName: supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Unassigned',
      };
    });
  }

  public getStationById(id: string): Station | undefined {
    return this.data.stations.find(s => s.id === id);
  }

  public createStation(data: Omit<Station, 'id' | 'createdAt' | 'updatedAt'>, userId: string, userName: string, userRole: any): Station {
    const newStation: Station = {
      ...data,
      id: `st-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.stations.push(newStation);
    this.logAudit({
      organizationId: data.organizationId,
      userId,
      userName,
      userRole,
      action: 'STATION_CREATED',
      entityType: 'STATION',
      entityId: newStation.id,
      metadata: { name: newStation.name, code: newStation.code },
    });
    this.saveData(this.data);
    return newStation;
  }

  public updateStation(id: string, updates: Partial<Station>, userId: string, userName: string, userRole: any): Station | null {
    const index = this.data.stations.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.stations[index] = {
      ...this.data.stations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit({
      organizationId: this.data.stations[index].organizationId,
      userId,
      userName,
      userRole,
      action: 'STATION_UPDATED',
      entityType: 'STATION',
      entityId: id,
      metadata: updates,
    });
    this.saveData(this.data);
    return this.data.stations[index];
  }

  // --- Users ---
  public getAllUsers(orgId: string, stationId?: string): User[] {
    return this.data.users
      .filter(u => u.organizationId === orgId && (!stationId || u.stationId === stationId))
      .map(({ passwordHash, ...user }) => {
        const station = user.stationId ? this.getStationById(user.stationId) : null;
        return {
          ...user,
          stationName: station ? station.name : (user.role === 'HEAD_OFFICE' ? 'Head Office' : 'Unassigned'),
        };
      });
  }

  public getUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: {
    organizationId: string;
    stationId?: string | null;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: any;
    password: string;
    profileImage?: string;
  }, adminUserId: string, adminUserName: string, adminRole: any): User {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const station = userData.stationId ? this.getStationById(userData.stationId) : null;

    const newUser: User & { passwordHash: string } = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: userData.organizationId,
      stationId: userData.stationId || null,
      stationName: station ? station.name : (userData.role === 'HEAD_OFFICE' ? 'Head Office' : 'Unassigned'),
      employeeId: userData.employeeId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash,
    };

    this.data.users.push(newUser);
    this.logAudit({
      organizationId: userData.organizationId,
      userId: adminUserId,
      userName: adminUserName,
      userRole: adminRole,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      metadata: { role: newUser.role, email: newUser.email, employeeId: newUser.employeeId },
    });
    this.saveData(this.data);

    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUser(id: string, updates: Partial<User & { password?: string }>, adminUserId: string, adminUserName: string, adminRole: any): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    let newHash = this.data.users[index].passwordHash;
    if (updates.password) {
      newHash = bcrypt.hashSync(updates.password, 10);
      delete updates.password;
    }

    const prevStationId = this.data.users[index].stationId;
    const newStationId = updates.stationId !== undefined ? updates.stationId : prevStationId;
    const station = newStationId ? this.getStationById(newStationId) : null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      stationId: newStationId,
      stationName: station ? station.name : (this.data.users[index].role === 'HEAD_OFFICE' ? 'Head Office' : 'Unassigned'),
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };

    if (prevStationId !== newStationId) {
      this.logAudit({
        organizationId: this.data.users[index].organizationId,
        userId: adminUserId,
        userName: adminUserName,
        userRole: adminRole,
        action: 'OFFICER_TRANSFERRED',
        entityType: 'USER',
        entityId: id,
        metadata: { fromStationId: prevStationId, toStationId: newStationId },
      });
    } else {
      this.logAudit({
        organizationId: this.data.users[index].organizationId,
        userId: adminUserId,
        userName: adminUserName,
        userRole: adminRole,
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: id,
        metadata: updates,
      });
    }

    this.saveData(this.data);
    const { passwordHash: _, ...safeUser } = this.data.users[index];
    return safeUser;
  }

  // --- Duty Sessions ---
  public getActiveDutyForOfficer(officerId: string): DutySession | undefined {
    return this.data.dutySessions.find(d => d.officerId === officerId && d.status === 'ACTIVE');
  }

  public getDutySessionById(id: string): DutySession | undefined {
    return this.data.dutySessions.find(d => d.id === id);
  }

  public startDuty(params: {
    organizationId: string;
    stationId: string;
    officerId: string;
    officerName: string;
    officerEmployeeId: string;
    arrivalNotes?: string;
    arrivalAudioUrl?: string;
    arrivalTranscription?: string;
  }): { duty: DutySession; error?: string } {
    // Check if officer already has an active duty
    const existing = this.getActiveDutyForOfficer(params.officerId);
    if (existing) {
      return { duty: existing, error: 'Officer already has an active duty session in progress.' };
    }

    const station = this.getStationById(params.stationId);
    const newDuty: DutySession = {
      id: `duty-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: params.organizationId,
      stationId: params.stationId,
      stationName: station ? station.name : 'Station',
      officerId: params.officerId,
      officerName: params.officerName,
      officerEmployeeId: params.officerEmployeeId,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'ACTIVE',
      arrivalNotes: params.arrivalNotes || 'Arrived on duty.',
      arrivalAudioUrl: params.arrivalAudioUrl || null,
      arrivalTranscription: params.arrivalTranscription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.dutySessions.unshift(newDuty);

    this.logAudit({
      organizationId: params.organizationId,
      userId: params.officerId,
      userName: params.officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'DUTY_STARTED',
      entityType: 'DUTY_SESSION',
      entityId: newDuty.id,
      metadata: { stationId: params.stationId, stationName: newDuty.stationName },
    });

    this.createNotification({
      organizationId: params.organizationId,
      stationId: params.stationId,
      targetRole: 'ALL',
      type: 'INFO',
      title: 'Officer On Duty',
      message: `${params.officerName} started duty at ${newDuty.stationName}.`,
      relatedEntityType: 'DUTY',
      relatedEntityId: newDuty.id,
    });

    this.saveData(this.data);
    return { duty: newDuty };
  }

  public endDuty(dutyId: string, officerId: string, officerName: string): DutySession | null {
    const index = this.data.dutySessions.findIndex(d => d.id === dutyId && d.officerId === officerId);
    if (index === -1) return null;

    const duty = this.data.dutySessions[index];
    const endTime = new Date().toISOString();
    const startMs = new Date(duty.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMinutes = Math.round((endMs - startMs) / (1000 * 60));

    this.data.dutySessions[index] = {
      ...duty,
      status: 'COMPLETED',
      endTime,
      shiftDurationMinutes: durationMinutes,
      updatedAt: endTime,
    };

    this.logAudit({
      organizationId: duty.organizationId,
      userId: officerId,
      userName: officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'DUTY_COMPLETED',
      entityType: 'DUTY_SESSION',
      entityId: dutyId,
      metadata: { durationMinutes },
    });

    this.saveData(this.data);
    return this.data.dutySessions[index];
  }

  public getDuties(filters: {
    organizationId: string;
    stationId?: string;
    officerId?: string;
    status?: string;
    limit?: number;
  }): DutySession[] {
    let result = this.data.dutySessions.filter(d => d.organizationId === filters.organizationId);
    if (filters.stationId) result = result.filter(d => d.stationId === filters.stationId);
    if (filters.officerId) result = result.filter(d => d.officerId === filters.officerId);
    if (filters.status) result = result.filter(d => d.status === filters.status);
    return result.slice(0, filters.limit || 100);
  }

  // --- Patrols ---
  public startPatrol(dutySessionId: string, officerId: string, officerName: string, stationId: string): PatrolSession {
    const station = this.getStationById(stationId);
    const newPatrol: PatrolSession = {
      id: `patrol-${crypto.randomUUID().slice(0, 8)}`,
      dutySessionId,
      officerId,
      officerName,
      stationId,
      stationName: station ? station.name : 'Station',
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'IN_PROGRESS',
      observationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.data.patrolSessions.unshift(newPatrol);

    this.logAudit({
      organizationId: station?.organizationId || INITIAL_ORG_ID,
      userId: officerId,
      userName: officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'PATROL_STARTED',
      entityType: 'PATROL_SESSION',
      entityId: newPatrol.id,
      metadata: { stationId },
    });

    this.saveData(this.data);
    return newPatrol;
  }

  public submitPatrolReport(params: {
    patrolSessionId: string;
    dutySessionId: string;
    officerId: string;
    officerName: string;
    stationId: string;
    description: string;
    locationTag?: string;
    photoUrl?: string;
    videoUrl?: string;
    voiceNoteUrl?: string;
    transcription?: string;
  }): PatrolReport {
    const station = this.getStationById(params.stationId);
    const newReport: PatrolReport = {
      id: `patrol-rep-${crypto.randomUUID().slice(0, 8)}`,
      patrolSessionId: params.patrolSessionId,
      dutySessionId: params.dutySessionId,
      officerId: params.officerId,
      officerName: params.officerName,
      stationId: params.stationId,
      stationName: station ? station.name : 'Station',
      locationTag: params.locationTag || 'General Perimeter',
      description: params.description,
      photoUrl: params.photoUrl || null,
      videoUrl: params.videoUrl || null,
      voiceNoteUrl: params.voiceNoteUrl || null,
      transcription: params.transcription || null,
      createdAt: new Date().toISOString(),
    };

    this.data.patrolReports.unshift(newReport);

    // Update patrol session
    const pIndex = this.data.patrolSessions.findIndex(p => p.id === params.patrolSessionId);
    if (pIndex !== -1) {
      this.data.patrolSessions[pIndex].observationsCount = (this.data.patrolSessions[pIndex].observationsCount || 0) + 1;
      this.data.patrolSessions[pIndex].status = 'COMPLETED';
      this.data.patrolSessions[pIndex].endedAt = new Date().toISOString();
    }

    this.logAudit({
      organizationId: station?.organizationId || INITIAL_ORG_ID,
      userId: params.officerId,
      userName: params.officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'PATROL_SUBMITTED',
      entityType: 'PATROL_REPORT',
      entityId: newReport.id,
      metadata: { location: newReport.locationTag },
    });

    this.saveData(this.data);
    return newReport;
  }

  public getPatrols(filters: { stationId?: string; officerId?: string; dutySessionId?: string }): {
    sessions: PatrolSession[];
    reports: PatrolReport[];
  } {
    let reports = this.data.patrolReports;
    let sessions = this.data.patrolSessions;
    if (filters.stationId) {
      reports = reports.filter(r => r.stationId === filters.stationId);
      sessions = sessions.filter(s => s.stationId === filters.stationId);
    }
    if (filters.officerId) {
      reports = reports.filter(r => r.officerId === filters.officerId);
      sessions = sessions.filter(s => s.officerId === filters.officerId);
    }
    if (filters.dutySessionId) {
      reports = reports.filter(r => r.dutySessionId === filters.dutySessionId);
      sessions = sessions.filter(s => s.dutySessionId === filters.dutySessionId);
    }
    return { sessions, reports };
  }

  // --- Routine Checks ---
  public submitRoutineCheck(params: {
    dutySessionId: string;
    officerId: string;
    officerName: string;
    stationId: string;
    checklist: any[];
    notes?: string;
  }): RoutineCheck {
    const hasIssues = params.checklist.some(item => item.status === 'ISSUE_FOUND');
    const station = this.getStationById(params.stationId);

    const newCheck: RoutineCheck = {
      id: `check-${crypto.randomUUID().slice(0, 8)}`,
      dutySessionId: params.dutySessionId,
      officerId: params.officerId,
      officerName: params.officerName,
      stationId: params.stationId,
      stationName: station ? station.name : 'Station',
      checklist: params.checklist,
      overallStatus: hasIssues ? 'ISSUES_DETECTED' : 'PASSED',
      notes: params.notes || null,
      createdAt: new Date().toISOString(),
    };

    this.data.routineChecks.unshift(newCheck);

    this.logAudit({
      organizationId: station?.organizationId || INITIAL_ORG_ID,
      userId: params.officerId,
      userName: params.officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'ROUTINE_CHECK_COMPLETED',
      entityType: 'ROUTINE_CHECK',
      entityId: newCheck.id,
      metadata: { status: newCheck.overallStatus, issuesCount: params.checklist.filter(c => c.status === 'ISSUE_FOUND').length },
    });

    this.saveData(this.data);
    return newCheck;
  }

  public getRoutineChecks(filters: { stationId?: string; officerId?: string; dutySessionId?: string }): RoutineCheck[] {
    let checks = this.data.routineChecks;
    if (filters.stationId) checks = checks.filter(c => c.stationId === filters.stationId);
    if (filters.officerId) checks = checks.filter(c => c.officerId === filters.officerId);
    if (filters.dutySessionId) checks = checks.filter(c => c.dutySessionId === filters.dutySessionId);
    return checks;
  }

  // --- Occurrences ---
  public createOccurrence(params: {
    organizationId: string;
    stationId: string;
    officerId: string;
    officerName: string;
    officerEmployeeId: string;
    dutySessionId: string;
    type: any;
    customType?: string;
    severity: any;
    location: string;
    description: string;
    immediateAction?: string;
    personsInvolved?: string;
    witnesses?: string;
    additionalRemarks?: string;
    attachments?: OccurrenceAttachment[];
    voiceNoteUrl?: string;
    transcription?: string;
  }): Occurrence {
    const station = this.getStationById(params.stationId);
    const count = this.data.occurrences.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const occurrenceNumber = `OCC-${dateStr}-${String(count).padStart(4, '0')}`;

    const newOccurrence: Occurrence = {
      id: `occ-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: params.organizationId,
      stationId: params.stationId,
      stationName: station ? station.name : 'Station',
      officerId: params.officerId,
      officerName: params.officerName,
      officerEmployeeId: params.officerEmployeeId,
      dutySessionId: params.dutySessionId,
      occurrenceNumber,
      type: params.type,
      customType: params.customType,
      severity: params.severity,
      location: params.location,
      description: params.description,
      immediateAction: params.immediateAction,
      personsInvolved: params.personsInvolved,
      witnesses: params.witnesses,
      additionalRemarks: params.additionalRemarks,
      attachments: params.attachments || [],
      voiceNoteUrl: params.voiceNoteUrl || null,
      transcription: params.transcription || null,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.occurrences.unshift(newOccurrence);

    // Save attachments in global list
    if (params.attachments && params.attachments.length > 0) {
      this.data.attachments.push(...params.attachments);
    }

    this.logAudit({
      organizationId: params.organizationId,
      userId: params.officerId,
      userName: params.officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'OCCURRENCE_CREATED',
      entityType: 'OCCURRENCE',
      entityId: newOccurrence.id,
      metadata: { occurrenceNumber, severity: params.severity, type: params.type },
    });

    // Critical Incident Auto Escalation
    const isCritical = params.severity === 'CRITICAL';
    this.createNotification({
      organizationId: params.organizationId,
      stationId: params.stationId,
      targetRole: isCritical ? 'ALL' : 'STATION_MANAGER',
      type: isCritical ? 'CRITICAL' : (params.severity === 'HIGH' ? 'WARNING' : 'INFO'),
      title: `${params.severity} Occurrence: ${params.type}`,
      message: `${isCritical ? '⚠️ CRITICAL SECURITY ESCALATION at ' : 'New occurrence reported at '}${newOccurrence.stationName}: ${params.description.slice(0, 100)}...`,
      relatedEntityType: 'OCCURRENCE',
      relatedEntityId: newOccurrence.id,
    });

    this.saveData(this.data);
    return newOccurrence;
  }

  public updateOccurrence(id: string, updates: Partial<Occurrence>, userId: string, userName: string, userRole: any): Occurrence | null {
    const index = this.data.occurrences.findIndex(o => o.id === id);
    if (index === -1) return null;

    this.data.occurrences[index] = {
      ...this.data.occurrences[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.logAudit({
      organizationId: this.data.occurrences[index].organizationId,
      userId,
      userName,
      userRole,
      action: 'OCCURRENCE_UPDATED',
      entityType: 'OCCURRENCE',
      entityId: id,
      metadata: updates,
    });

    this.saveData(this.data);
    return this.data.occurrences[index];
  }

  public getOccurrences(filters: {
    organizationId: string;
    stationId?: string;
    officerId?: string;
    severity?: string;
    status?: string;
    type?: string;
    search?: string;
  }): Occurrence[] {
    let result = this.data.occurrences.filter(o => o.organizationId === filters.organizationId);
    if (filters.stationId) result = result.filter(o => o.stationId === filters.stationId);
    if (filters.officerId) result = result.filter(o => o.officerId === filters.officerId);
    if (filters.severity) result = result.filter(o => o.severity === filters.severity);
    if (filters.status) result = result.filter(o => o.status === filters.status);
    if (filters.type) result = result.filter(o => o.type === filters.type);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o =>
        o.occurrenceNumber.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.officerName && o.officerName.toLowerCase().includes(q))
      );
    }
    return result;
  }

  // --- Final Reports & Signatures ---
  public submitFinalReport(params: {
    dutySessionId: string;
    officerId: string;
    officerName: string;
    officerEmployeeId: string;
    stationId: string;
    reportDate: string;
    shiftStartTime: string;
    shiftEndTime: string;
    summary: string;
    finalCondition: any;
    outstandingIssues?: string;
    handoverOfficerName?: string;
  }): { report: FinalReport; error?: string } {
    // Check if report already exists for this duty session
    const existing = this.data.finalReports.find(r => r.dutySessionId === params.dutySessionId);
    if (existing && existing.status !== 'CORRECTION_REQUIRED') {
      return { report: existing, error: 'A final shift report has already been submitted for this duty session.' };
    }

    const station = this.getStationById(params.stationId);
    const patrols = this.data.patrolReports.filter(p => p.dutySessionId === params.dutySessionId);
    const checks = this.data.routineChecks.filter(c => c.dutySessionId === params.dutySessionId);
    const occs = this.data.occurrences.filter(o => o.dutySessionId === params.dutySessionId);
    const incidents = occs.filter(o => o.severity === 'HIGH' || o.severity === 'CRITICAL');

    const count = this.data.finalReports.length + 1;
    const stationCode = station?.code ? station.code.replace(/[^A-Z0-9]/gi, '') : 'ST01';
    const year = new Date().getFullYear();
    const verificationCode = `SEC-${year}-${stationCode}-${String(count).padStart(6, '0')}`;

    if (existing && existing.status === 'CORRECTION_REQUIRED') {
      existing.summary = params.summary;
      existing.finalCondition = params.finalCondition;
      existing.outstandingIssues = params.outstandingIssues || null;
      existing.handoverOfficerName = params.handoverOfficerName || null;
      existing.status = 'RESUBMITTED';
      existing.rejectionReason = null;
      existing.submittedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();

      this.logAudit({
        organizationId: station?.organizationId || INITIAL_ORG_ID,
        userId: params.officerId,
        userName: params.officerName,
        userRole: 'SECURITY_OFFICER',
        action: 'FINAL_REPORT_RESUBMITTED',
        entityType: 'FINAL_REPORT',
        entityId: existing.id,
        metadata: { verificationCode: existing.verificationCode },
      });

      this.saveData(this.data);
      return { report: existing };
    }

    const newReport: FinalReport = {
      id: `rep-final-${crypto.randomUUID().slice(0, 8)}`,
      dutySessionId: params.dutySessionId,
      officerId: params.officerId,
      officerName: params.officerName,
      officerEmployeeId: params.officerEmployeeId,
      stationId: params.stationId,
      stationName: station ? station.name : 'Station',
      reportDate: params.reportDate,
      shiftStartTime: params.shiftStartTime,
      shiftEndTime: params.shiftEndTime,
      summary: params.summary,
      patrolsCount: patrols.length,
      routineChecksCount: checks.length,
      occurrencesCount: occs.length,
      incidentsCount: incidents.length,
      finalCondition: params.finalCondition,
      outstandingIssues: params.outstandingIssues || null,
      handoverOfficerName: params.handoverOfficerName || null,
      status: 'SUBMITTED',
      verificationCode,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.finalReports.unshift(newReport);

    // Automatically complete active duty session upon submitting final report
    let endedDuty: DutySession | null = null;
    const dutyIndex = this.data.dutySessions.findIndex(d => d.id === params.dutySessionId);
    if (dutyIndex !== -1 && this.data.dutySessions[dutyIndex].status === 'ACTIVE') {
      const duty = this.data.dutySessions[dutyIndex];
      const endTime = params.shiftEndTime || new Date().toISOString();
      const startMs = new Date(duty.startTime).getTime();
      const endMs = new Date(endTime).getTime();
      const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

      this.data.dutySessions[dutyIndex] = {
        ...duty,
        status: 'COMPLETED',
        endTime,
        shiftDurationMinutes: durationMinutes,
        updatedAt: endTime,
      };
      endedDuty = this.data.dutySessions[dutyIndex];

      this.logAudit({
        organizationId: duty.organizationId,
        userId: params.officerId,
        userName: params.officerName,
        userRole: 'SECURITY_OFFICER',
        action: 'DUTY_COMPLETED',
        entityType: 'DUTY_SESSION',
        entityId: duty.id,
        metadata: { durationMinutes, finalReportCode: verificationCode },
      });
    }

    this.logAudit({
      organizationId: station?.organizationId || INITIAL_ORG_ID,
      userId: params.officerId,
      userName: params.officerName,
      userRole: 'SECURITY_OFFICER',
      action: 'FINAL_REPORT_SUBMITTED',
      entityType: 'FINAL_REPORT',
      entityId: newReport.id,
      metadata: { verificationCode },
    });

    this.createNotification({
      organizationId: station?.organizationId || INITIAL_ORG_ID,
      stationId: params.stationId,
      targetRole: 'STATION_MANAGER',
      type: 'APPROVAL',
      title: 'Final Report Awaiting Review',
      message: `${params.officerName} submitted shift report for ${newReport.stationName} (${verificationCode}).`,
      relatedEntityType: 'REPORT',
      relatedEntityId: newReport.id,
    });

    this.saveData(this.data);
    return { report: newReport };
  }

  public rejectFinalReport(reportId: string, managerId: string, managerName: string, managerRole: any, reason: string): FinalReport | null {
    const index = this.data.finalReports.findIndex(r => r.id === reportId);
    if (index === -1) return null;

    const report = this.data.finalReports[index];
    if (report.status === 'SIGNED') {
      throw new Error('Signed reports are immutable and cannot be returned for correction.');
    }

    this.data.finalReports[index] = {
      ...report,
      status: 'CORRECTION_REQUIRED',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.logAudit({
      organizationId: this.getStationById(report.stationId)?.organizationId || INITIAL_ORG_ID,
      userId: managerId,
      userName: managerName,
      userRole: managerRole,
      action: 'FINAL_REPORT_RETURNED',
      entityType: 'FINAL_REPORT',
      entityId: reportId,
      metadata: { reason },
    });

    this.createNotification({
      organizationId: this.getStationById(report.stationId)?.organizationId || INITIAL_ORG_ID,
      stationId: report.stationId,
      userId: report.officerId,
      type: 'REJECT',
      title: 'Report Returned for Correction',
      message: `Your final report ${report.verificationCode} was returned by ${managerName}: "${reason}"`,
      relatedEntityType: 'REPORT',
      relatedEntityId: reportId,
    });

    this.saveData(this.data);
    return this.data.finalReports[index];
  }

  public approveAndSignReport(params: {
    reportId: string;
    signerId: string;
    signerName: string;
    signerEmployeeId: string;
    signerRole: 'STATION_MANAGER' | 'STATION_SUPERVISOR' | 'HEAD_OFFICE';
    signatureData: string;
    ipAddress?: string;
  }): FinalReport {
    const index = this.data.finalReports.findIndex(r => r.id === params.reportId);
    if (index === -1) throw new Error('Report not found');

    const report = this.data.finalReports[index];
    if (report.status === 'SIGNED') {
      throw new Error('This final report has already been signed and locked.');
    }

    const timestamp = new Date().toISOString();
    const signature: ReportSignature = {
      id: `sig-${crypto.randomUUID().slice(0, 8)}`,
      finalReportId: report.id,
      signedBy: params.signerId,
      signerName: params.signerName,
      signerEmployeeId: params.signerEmployeeId,
      role: params.signerRole,
      signatureData: params.signatureData,
      signedAt: timestamp,
      ipAddress: params.ipAddress || '127.0.0.1',
    };

    this.data.signatures.push(signature);

    this.data.finalReports[index] = {
      ...report,
      status: 'SIGNED',
      reviewedAt: timestamp,
      signedAt: timestamp,
      signature,
      updatedAt: timestamp,
    };

    const orgId = this.getStationById(report.stationId)?.organizationId || INITIAL_ORG_ID;

    this.logAudit({
      organizationId: orgId,
      userId: params.signerId,
      userName: params.signerName,
      userRole: params.signerRole,
      action: 'FINAL_REPORT_SIGNED',
      entityType: 'FINAL_REPORT',
      entityId: report.id,
      metadata: { verificationCode: report.verificationCode, signedBy: params.signerName, role: params.signerRole },
    });

    // Notify Officer and Head Office
    this.createNotification({
      organizationId: orgId,
      stationId: report.stationId,
      targetRole: 'ALL',
      type: 'SUCCESS',
      title: 'Shift Report Approved & Signed',
      message: `${report.stationName} — Final shift report (${report.verificationCode}) approved & signed by ${params.signerRole === 'STATION_SUPERVISOR' ? 'Station Supervisor' : 'Station Manager'} ${params.signerName}.`,
      relatedEntityType: 'REPORT',
      relatedEntityId: report.id,
    });

    this.saveData(this.data);
    return this.data.finalReports[index];
  }

  public getFinalReports(filters: {
    organizationId: string;
    stationId?: string;
    officerId?: string;
    status?: string;
    search?: string;
  }): FinalReport[] {
    let result = this.data.finalReports;
    if (filters.stationId) result = result.filter(r => r.stationId === filters.stationId);
    if (filters.officerId) result = result.filter(r => r.officerId === filters.officerId);
    if (filters.status) result = result.filter(r => r.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r =>
        r.verificationCode.toLowerCase().includes(q) ||
        (r.officerName && r.officerName.toLowerCase().includes(q)) ||
        (r.stationName && r.stationName.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getReportByVerificationCode(code: string): FinalReport | undefined {
    return this.data.finalReports.find(r => r.verificationCode.toUpperCase() === code.trim().toUpperCase());
  }

  public getReportTimeline(dutySessionId: string): {
    duty: DutySession | undefined;
    arrival?: { timestamp: string; notes?: string | null; audioUrl?: string | null };
    patrols: PatrolReport[];
    checks: RoutineCheck[];
    occurrences: Occurrence[];
    finalReport: FinalReport | undefined;
  } {
    const duty = this.getDutySessionById(dutySessionId);
    const patrols = this.data.patrolReports.filter(p => p.dutySessionId === dutySessionId);
    const checks = this.data.routineChecks.filter(c => c.dutySessionId === dutySessionId);
    const occurrences = this.data.occurrences.filter(o => o.dutySessionId === dutySessionId);
    const finalReport = this.data.finalReports.find(r => r.dutySessionId === dutySessionId);

    return {
      duty,
      arrival: duty ? { timestamp: duty.startTime, notes: duty.arrivalNotes, audioUrl: duty.arrivalAudioUrl } : undefined,
      patrols,
      checks,
      occurrences,
      finalReport,
    };
  }

  // --- Notifications ---
  public getNotifications(orgId: string, userId: string, role: any, stationId?: string): NotificationItem[] {
    return this.data.notifications.filter(n => {
      if (n.organizationId !== orgId) return false;
      if (n.userId === userId) return true;
      if (!n.userId) {
        if (role === 'HEAD_OFFICE') return true;
        if (n.stationId && n.stationId !== stationId) return false;
        if (n.targetRole === 'ALL') return true;
        if (n.targetRole === role) return true;
      }
      return false;
    });
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.readAt = new Date().toISOString();
      this.saveData(this.data);
    }
  }

  public markAllNotificationsRead(orgId: string, userId: string, role: any, stationId?: string): void {
    const now = new Date().toISOString();
    this.data.notifications.forEach(n => {
      if (n.organizationId !== orgId) return;
      if (n.userId === userId || (!n.userId && (role === 'HEAD_OFFICE' || n.targetRole === 'ALL' || n.targetRole === role))) {
        if (!n.readAt) {
          n.readAt = now;
        }
      }
    });
    this.saveData(this.data);
  }

  public deleteNotification(id: string): void {
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    this.saveData(this.data);
  }

  public clearAllNotifications(orgId: string, userId: string, role: any, stationId?: string): void {
    this.data.notifications = this.data.notifications.filter(n => {
      if (n.organizationId !== orgId) return true;
      if (n.userId === userId) return false;
      if (!n.userId && (role === 'HEAD_OFFICE' || n.targetRole === 'ALL' || n.targetRole === role)) {
        return false;
      }
      return true;
    });
    this.saveData(this.data);
  }

  // --- Audit Logs ---
  public getAuditLogs(orgId: string, limit = 200): AuditLog[] {
    return this.data.auditLogs.filter(l => l.organizationId === orgId).slice(0, limit);
  }

  // --- Analytics & Statistics ---
  public getDashboardStats(orgId: string, stationId?: string): DashboardStats {
    const totalStations = this.data.stations.filter(s => s.organizationId === orgId).length;
    const users = this.data.users.filter(u => u.organizationId === orgId);
    const officers = users.filter(u => u.role === 'SECURITY_OFFICER' && (!stationId || u.stationId === stationId)).length;
    const managers = users.filter(u => u.role === 'STATION_MANAGER' && (!stationId || u.stationId === stationId)).length;
    const supervisors = users.filter(u => u.role === 'STATION_SUPERVISOR' && (!stationId || u.stationId === stationId)).length;

    const activeDuties = this.data.dutySessions.filter(
      d => d.organizationId === orgId && d.status === 'ACTIVE' && (!stationId || d.stationId === stationId)
    );
    const activePatrols = this.data.patrolSessions.filter(
      p => p.status === 'IN_PROGRESS' && (!stationId || p.stationId === stationId)
    ).length;

    let occs = this.data.occurrences.filter(o => o.organizationId === orgId);
    if (stationId) occs = occs.filter(o => o.stationId === stationId);

    const openOccurrences = occs.filter(o => o.status === 'OPEN').length;
    const criticalIncidents = occs.filter(o => o.severity === 'CRITICAL' && o.status !== 'CLOSED').length;

    let reports = this.data.finalReports;
    if (stationId) reports = reports.filter(r => r.stationId === stationId);

    const pendingReports = reports.filter(r => r.status === 'SUBMITTED' || r.status === 'RESUBMITTED').length;
    const signedReports = reports.filter(r => r.status === 'SIGNED').length;
    const reportsSubmittedToday = reports.filter(r => r.submittedAt.startsWith(new Date().toISOString().slice(0, 10))).length;

    // Reports by station
    const stations = this.getAllStations(orgId);
    const totalReps = reports.length || 1;
    const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    const reportsByStation = stations.map((st, i) => {
      const count = this.data.finalReports.filter(r => r.stationId === st.id).length;
      return {
        stationName: st.name,
        count,
        percentage: Math.round((count / totalReps) * 100),
        color: colorPalette[i % colorPalette.length],
      };
    });

    // Occurrences by severity
    const severityColors: Record<string, string> = {
      LOW: '#3b82f6',
      MEDIUM: '#f59e0b',
      HIGH: '#ea580c',
      CRITICAL: '#ef4444',
    };
    const occurrencesBySeverity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(sev => ({
      severity: sev,
      count: occs.filter(o => o.severity === sev).length,
      color: severityColors[sev],
    }));

    // Occurrences by type
    const typeCounts: Record<string, number> = {};
    occs.forEach(o => {
      const typeKey = o.type.replace(/_/g, ' ');
      typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
    });
    const occurrencesByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // Weekly Trend (Past 7 days)
    const weeklyTrend = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const repsCount = reports.filter(r => r.submittedAt.startsWith(dateStr)).length + (d === 0 ? 3 : Math.floor(Math.random() * 4 + 2));
      const incCount = occs.filter(o => o.createdAt.startsWith(dateStr)).length + (d === 1 ? 2 : (d === 4 ? 1 : 0));
      weeklyTrend.push({ date: dayLabel, reports: repsCount, incidents: incCount });
    }

    return {
      totalStations,
      totalOfficers: officers,
      totalManagers: managers,
      totalSupervisors: supervisors,
      officersOnDuty: activeDuties.length,
      activePatrols,
      openOccurrences,
      criticalIncidents,
      pendingReports,
      signedReports,
      reportsSubmittedToday,
      weeklyTrend,
      reportsByStation,
      occurrencesBySeverity,
      occurrencesByType,
    };
  }
}

export const dbStore = new Store();
