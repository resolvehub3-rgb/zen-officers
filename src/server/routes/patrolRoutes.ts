import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { realtimeBroadcaster } from '../sockets/index.ts';

export const patrolRouter = Router();

const startPatrolSchema = z.object({
  dutySessionId: z.string(),
  stationId: z.string().optional(),
});

const submitPatrolReportSchema = z.object({
  patrolSessionId: z.string(),
  dutySessionId: z.string(),
  stationId: z.string().optional(),
  description: z.string().min(3),
  locationTag: z.string().optional(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  voiceNoteUrl: z.string().optional(),
  transcription: z.string().optional(),
});

// GET /api/v1/patrols
patrolRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const stationId = req.user!.role === 'HEAD_OFFICE' 
    ? (req.query.stationId as string | undefined) 
    : req.user!.stationId || undefined;

  const officerId = req.user!.role === 'SECURITY_OFFICER' 
    ? req.user!.id 
    : (req.query.officerId as string | undefined);

  const dutySessionId = req.query.dutySessionId as string | undefined;

  const result = dbStore.getPatrols({ stationId, officerId, dutySessionId });
  return res.json({ success: true, data: result });
});

// POST /api/v1/patrols/start
patrolRouter.post('/start', authenticate, (req: AuthRequest, res: Response) => {
  const parse = startPatrolSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({ success: false, message: 'Station ID is required.' });
  }

  const patrol = dbStore.startPatrol(
    parse.data.dutySessionId,
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    stationId
  );

  realtimeBroadcaster.patrolStarted(patrol);

  return res.status(201).json({
    success: true,
    message: 'Patrol session started.',
    data: patrol,
  });
});

// POST /api/v1/patrols/submit
patrolRouter.post('/submit', authenticate, (req: AuthRequest, res: Response) => {
  const parse = submitPatrolReportSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({ success: false, message: 'Station ID is required.' });
  }

  const report = dbStore.submitPatrolReport({
    patrolSessionId: parse.data.patrolSessionId,
    dutySessionId: parse.data.dutySessionId,
    officerId: req.user!.id,
    officerName: `${req.user!.firstName} ${req.user!.lastName}`,
    stationId,
    description: parse.data.description,
    locationTag: parse.data.locationTag,
    photoUrl: parse.data.photoUrl,
    videoUrl: parse.data.videoUrl,
    voiceNoteUrl: parse.data.voiceNoteUrl,
    transcription: parse.data.transcription,
  });

  realtimeBroadcaster.patrolSubmitted(report);

  return res.status(201).json({
    success: true,
    message: 'Patrol report submitted successfully.',
    data: report,
  });
});
