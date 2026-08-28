import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { realtimeBroadcaster } from '../sockets/index.ts';

export const checkRouter = Router();

const submitRoutineCheckSchema = z.object({
  dutySessionId: z.string(),
  stationId: z.string().optional(),
  checklist: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(['OK', 'ISSUE_FOUND', 'NOT_APPLICABLE']),
      description: z.string().optional(),
      photoUrl: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
});

// GET /api/v1/checks
checkRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const stationId = req.user!.role === 'HEAD_OFFICE'
    ? (req.query.stationId as string | undefined)
    : req.user!.stationId || undefined;

  const officerId = req.user!.role === 'SECURITY_OFFICER'
    ? req.user!.id
    : (req.query.officerId as string | undefined);

  const dutySessionId = req.query.dutySessionId as string | undefined;

  const checks = dbStore.getRoutineChecks({ stationId, officerId, dutySessionId });
  return res.json({ success: true, data: checks });
});

// POST /api/v1/checks
checkRouter.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const parse = submitRoutineCheckSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({ success: false, message: 'Station ID is required.' });
  }

  const check = dbStore.submitRoutineCheck({
    dutySessionId: parse.data.dutySessionId,
    officerId: req.user!.id,
    officerName: `${req.user!.firstName} ${req.user!.lastName}`,
    stationId,
    checklist: parse.data.checklist,
    notes: parse.data.notes,
  });

  realtimeBroadcaster.checkSubmitted(check);

  return res.status(201).json({
    success: true,
    message: 'Routine check submitted successfully.',
    data: check,
  });
});
