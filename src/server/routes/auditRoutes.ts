import { Router, Response } from 'express';
import { dbStore } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';

export const auditRouter = Router();

// GET /api/v1/audit-logs (Head Office & Management)
auditRouter.get('/', authenticate, requireRole('HEAD_OFFICE', 'STATION_MANAGER'), (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const logs = dbStore.getAuditLogs(orgId);
  return res.json({ success: true, data: logs });
});
