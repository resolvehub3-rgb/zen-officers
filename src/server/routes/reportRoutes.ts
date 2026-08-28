import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';
import { realtimeBroadcaster } from '../sockets/index.ts';

export const reportRouter = Router();

const submitFinalReportSchema = z.object({
  dutySessionId: z.string(),
  stationId: z.string().optional(),
  reportDate: z.string(),
  shiftStartTime: z.string(),
  shiftEndTime: z.string(),
  summary: z.string().min(5),
  finalCondition: z.enum(['NORMAL', 'MAINTENANCE_REQUIRED', 'SECURITY_ATTENTION_NEEDED']),
  outstandingIssues: z.string().optional(),
  handoverOfficerName: z.string().optional(),
});

const rejectReportSchema = z.object({
  reason: z.string().min(3),
});

const signReportSchema = z.object({
  signatureData: z.string().min(10), // Base64 signature image/SVG
});

// GET /api/v1/reports
reportRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stationId = req.user!.role === 'HEAD_OFFICE'
    ? (req.query.stationId as string | undefined)
    : req.user!.stationId || undefined;

  const officerId = req.user!.role === 'SECURITY_OFFICER'
    ? req.user!.id
    : (req.query.officerId as string | undefined);

  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const reports = dbStore.getFinalReports({
    organizationId: orgId,
    stationId,
    officerId,
    status,
    search,
  });

  return res.json({ success: true, data: reports });
});

// GET /api/v1/reports/timeline/:dutySessionId
reportRouter.get('/timeline/:dutySessionId', authenticate, (req: AuthRequest, res: Response) => {
  const timeline = dbStore.getReportTimeline(req.params.dutySessionId);
  return res.json({ success: true, data: timeline });
});

// GET /api/v1/reports/verify/:code (Public verification for certificate / QR code)
reportRouter.get('/verify/:code', (req, res) => {
  const report = dbStore.getReportByVerificationCode(req.params.code);
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Verification failed: No official security report found matching this verification code.',
      code: 'VERIFICATION_NOT_FOUND',
    });
  }

  // Return verified certificate details (safe for public verification)
  return res.json({
    success: true,
    data: {
      verificationCode: report.verificationCode,
      status: report.status,
      stationName: report.stationName,
      officerName: report.officerName,
      officerEmployeeId: report.officerEmployeeId,
      reportDate: report.reportDate,
      shiftStartTime: report.shiftStartTime,
      shiftEndTime: report.shiftEndTime,
      submittedAt: report.submittedAt,
      signedAt: report.signedAt,
      signerName: report.signature?.signerName,
      signerRole: report.signature?.role,
      finalCondition: report.finalCondition,
      patrolsCompleted: report.patrolsCount,
      routineChecksCompleted: report.routineChecksCount,
      occurrencesReported: report.occurrencesCount,
      isAuthentic: true,
    },
  });
});

// POST /api/v1/reports (Submit final shift report - Officer only)
reportRouter.post('/', authenticate, requireRole('SECURITY_OFFICER'), (req: AuthRequest, res: Response) => {
  const parse = submitFinalReportSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({ success: false, message: 'Station ID is required.' });
  }

  const result = dbStore.submitFinalReport({
    dutySessionId: parse.data.dutySessionId,
    officerId: req.user!.id,
    officerName: `${req.user!.firstName} ${req.user!.lastName}`,
    officerEmployeeId: req.user!.employeeId,
    stationId,
    reportDate: parse.data.reportDate,
    shiftStartTime: parse.data.shiftStartTime,
    shiftEndTime: parse.data.shiftEndTime,
    summary: parse.data.summary,
    finalCondition: parse.data.finalCondition,
    outstandingIssues: parse.data.outstandingIssues,
    handoverOfficerName: parse.data.handoverOfficerName,
  });

  if (result.error && !result.report) {
    return res.status(400).json({ success: false, message: result.error });
  }

  const dutySession = dbStore.getDutySessionById(parse.data.dutySessionId);
  if (dutySession) {
    realtimeBroadcaster.dutyEnded(dutySession);
  }
  realtimeBroadcaster.reportSubmitted(result.report);

  return res.status(201).json({
    success: true,
    message: 'Final shift report submitted successfully. Awaiting Manager / Supervisor review.',
    data: result.report,
  });
});

// POST /api/v1/reports/:id/reject (Return report for correction - Manager / Supervisor only)
reportRouter.post('/:id/reject', authenticate, requireRole('STATION_MANAGER', 'STATION_SUPERVISOR', 'HEAD_OFFICE'), (req: AuthRequest, res: Response) => {
  const parse = rejectReportSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  try {
    const rejected = dbStore.rejectFinalReport(
      req.params.id,
      req.user!.id,
      `${req.user!.firstName} ${req.user!.lastName}`,
      req.user!.role,
      parse.data.reason
    );

    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    realtimeBroadcaster.reportReturned(rejected);

    return res.json({
      success: true,
      message: 'Report returned to officer for correction.',
      data: rejected,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/reports/:id/sign (Approve & Digitally Sign Report - Manager / Supervisor only)
reportRouter.post('/:id/sign', authenticate, requireRole('STATION_MANAGER', 'STATION_SUPERVISOR', 'HEAD_OFFICE'), (req: AuthRequest, res: Response) => {
  const parse = signReportSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  try {
    const signed = dbStore.approveAndSignReport({
      reportId: req.params.id,
      signerId: req.user!.id,
      signerName: `${req.user!.firstName} ${req.user!.lastName}`,
      signerEmployeeId: req.user!.employeeId,
      signerRole: req.user!.role as any,
      signatureData: parse.data.signatureData,
      ipAddress: req.ip,
    });

    realtimeBroadcaster.reportApprovedAndSigned(signed);

    return res.json({
      success: true,
      message: 'Final shift report approved and digitally signed. Report is now permanently locked.',
      data: signed,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});
