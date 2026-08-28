import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';

export const stationRouter = Router();

const createStationSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  address: z.string().min(3),
  location: z.string().optional(),
});

// GET /api/v1/stations
stationRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stations = dbStore.getAllStations(orgId);
  return res.json({ success: true, data: stations });
});

// GET /api/v1/stations/:id
stationRouter.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const station = dbStore.getStationById(req.params.id);
  if (!station || station.organizationId !== req.user!.organizationId) {
    return res.status(404).json({ success: false, message: 'Station not found.' });
  }
  return res.json({ success: true, data: station });
});

// POST /api/v1/stations (Head office only)
stationRouter.post('/', authenticate, requireRole('HEAD_OFFICE'), (req: AuthRequest, res: Response) => {
  const parse = createStationSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  const station = dbStore.createStation(
    {
      organizationId: req.user!.organizationId,
      name: parse.data.name,
      code: parse.data.code,
      address: parse.data.address,
      location: parse.data.location,
      status: 'ACTIVE',
    },
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    req.user!.role
  );

  return res.status(201).json({ success: true, data: station });
});

// PATCH /api/v1/stations/:id (Head office only)
stationRouter.patch('/:id', authenticate, requireRole('HEAD_OFFICE'), (req: AuthRequest, res: Response) => {
  const updated = dbStore.updateStation(
    req.params.id,
    req.body,
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    req.user!.role
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Station not found.' });
  }
  return res.json({ success: true, data: updated });
});
