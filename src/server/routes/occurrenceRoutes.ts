import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { realtimeBroadcaster } from '../sockets/index.ts';

export const occurrenceRouter = Router();

const createOccurrenceSchema = z.object({
  dutySessionId: z.string(),
  stationId: z.string().optional(),
  type: z.string().min(1),
  customType: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.string().min(2),
  description: z.string().min(5),
  immediateAction: z.string().optional(),
  personsInvolved: z.string().optional(),
  witnesses: z.string().optional(),
  additionalRemarks: z.string().optional(),
  attachments: z.array(
    z.object({
      id: z.string().optional(),
      occurrenceId: z.string().optional(),
      uploadedBy: z.string().optional(),
      type: z.enum(['PHOTO', 'VIDEO', 'VOICE_NOTE', 'DOCUMENT']),
      url: z.string(),
      secureUrl: z.string(),
      duration: z.number().optional(),
      createdAt: z.string().optional(),
    })
  ).optional(),
  voiceNoteUrl: z.string().optional(),
  transcription: z.string().optional(),
});

// GET /api/v1/occurrences
occurrenceRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stationId = req.user!.role === 'HEAD_OFFICE'
    ? (req.query.stationId as string | undefined)
    : req.user!.stationId || undefined;

  const officerId = req.user!.role === 'SECURITY_OFFICER'
    ? req.user!.id
    : (req.query.officerId as string | undefined);

  const severity = req.query.severity as string | undefined;
  const status = req.query.status as string | undefined;
  const type = req.query.type as string | undefined;
  const search = req.query.search as string | undefined;

  const occurrences = dbStore.getOccurrences({
    organizationId: orgId,
    stationId,
    officerId,
    severity,
    status,
    type,
    search,
  });

  return res.json({ success: true, data: occurrences });
});

// POST /api/v1/occurrences (Report occurrence)
occurrenceRouter.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const parse = createOccurrenceSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({ success: false, message: 'Station ID is required.' });
  }

  const occurrence = dbStore.createOccurrence({
    organizationId: req.user!.organizationId,
    stationId,
    officerId: req.user!.id,
    officerName: `${req.user!.firstName} ${req.user!.lastName}`,
    officerEmployeeId: req.user!.employeeId,
    dutySessionId: parse.data.dutySessionId,
    type: parse.data.type as any,
    customType: parse.data.customType,
    severity: parse.data.severity,
    location: parse.data.location,
    description: parse.data.description,
    immediateAction: parse.data.immediateAction,
    personsInvolved: parse.data.personsInvolved,
    witnesses: parse.data.witnesses,
    additionalRemarks: parse.data.additionalRemarks,
    attachments: (parse.data.attachments as any) || [],
    voiceNoteUrl: parse.data.voiceNoteUrl,
    transcription: parse.data.transcription,
  });

  realtimeBroadcaster.occurrenceCreated(occurrence);

  return res.status(201).json({
    success: true,
    message: occurrence.severity === 'CRITICAL' 
      ? 'CRITICAL Occurrence logged and escalated to Management & Head Office.' 
      : 'Security occurrence reported successfully.',
    data: occurrence,
  });
});

// PATCH /api/v1/occurrences/:id (Update status / resolution notes)
occurrenceRouter.patch('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const updated = dbStore.updateOccurrence(
    req.params.id,
    req.body,
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    req.user!.role
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Occurrence not found.' });
  }

  return res.json({ success: true, data: updated });
});
