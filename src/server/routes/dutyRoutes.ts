import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { realtimeBroadcaster } from '../sockets/index.ts';

export const dutyRouter = Router();

const startDutySchema = z.object({
  stationId: z.string().optional(),
  arrivalNotes: z.string().optional(),
  arrivalAudioUrl: z.string().optional(),
  arrivalTranscription: z.string().optional(),
});

// GET /api/v1/duties/active (Current user active duty session)
dutyRouter.get('/active', authenticate, (req: AuthRequest, res: Response) => {
  const activeDuty = dbStore.getActiveDutyForOfficer(req.user!.id);
  return res.json({ success: true, data: activeDuty || null });
});

// GET /api/v1/duties (List duties with filters)
dutyRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stationId = req.user!.role === 'HEAD_OFFICE' 
    ? (req.query.stationId as string | undefined) 
    : req.user!.stationId || undefined;
  
  const officerId = req.user!.role === 'SECURITY_OFFICER' 
    ? req.user!.id 
    : (req.query.officerId as string | undefined);

  const status = req.query.status as string | undefined;

  const duties = dbStore.getDuties({
    organizationId: orgId,
    stationId,
    officerId,
    status,
  });

  return res.json({ success: true, data: duties });
});

// POST /api/v1/duties/start (Start duty + Arrival report)
dutyRouter.post('/start', authenticate, (req: AuthRequest, res: Response) => {
  const parse = startDutySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const stationId = parse.data.stationId || req.user!.stationId;
  if (!stationId) {
    return res.status(400).json({
      success: false,
      message: 'No assigned station specified for this duty session.',
    });
  }

  const result = dbStore.startDuty({
    organizationId: req.user!.organizationId,
    stationId,
    officerId: req.user!.id,
    officerName: `${req.user!.firstName} ${req.user!.lastName}`,
    officerEmployeeId: req.user!.employeeId,
    arrivalNotes: parse.data.arrivalNotes,
    arrivalAudioUrl: parse.data.arrivalAudioUrl,
    arrivalTranscription: parse.data.arrivalTranscription,
  });

  if (result.error) {
    return res.status(400).json({ success: false, message: result.error, data: result.duty });
  }

  // Real-time broadcast
  realtimeBroadcaster.dutyStarted(result.duty);

  return res.status(201).json({
    success: true,
    message: 'Duty started successfully. Arrival report registered.',
    data: result.duty,
  });
});

// POST /api/v1/duties/:id/end (End duty session)
dutyRouter.post('/:id/end', authenticate, (req: AuthRequest, res: Response) => {
  const ended = dbStore.endDuty(req.params.id, req.user!.id, `${req.user!.firstName} ${req.user!.lastName}`);
  if (!ended) {
    return res.status(404).json({ success: false, message: 'Active duty session not found.' });
  }

  realtimeBroadcaster.dutyEnded(ended);

  return res.json({
    success: true,
    message: 'Duty completed successfully.',
    data: ended,
  });
});
