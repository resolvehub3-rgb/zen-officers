import { Router, Response } from 'express';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

export const analyticsRouter = Router();

// GET /api/v1/analytics/stats
analyticsRouter.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stationId = req.user!.role === 'HEAD_OFFICE' 
    ? (req.query.stationId as string | undefined)
    : req.user!.stationId || undefined;

  const stats = dbStore.getDashboardStats(orgId, stationId);
  return res.json({ success: true, data: stats });
});
