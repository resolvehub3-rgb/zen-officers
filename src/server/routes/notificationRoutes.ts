import { Router, Response } from 'express';
import { dbStore } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

export const notificationRouter = Router();

// GET /api/v1/notifications
notificationRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const notifications = dbStore.getNotifications(
    req.user!.organizationId,
    req.user!.id,
    req.user!.role,
    req.user!.stationId || undefined
  );
  return res.json({ success: true, data: notifications });
});

// POST /api/v1/notifications/:id/read
notificationRouter.post('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  dbStore.markNotificationRead(req.params.id);
  return res.json({ success: true, message: 'Notification marked as read.' });
});

// POST /api/v1/notifications/read-all
notificationRouter.post('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  dbStore.markAllNotificationsRead(
    req.user!.organizationId,
    req.user!.id,
    req.user!.role,
    req.user!.stationId || undefined
  );
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

// DELETE /api/v1/notifications/:id
notificationRouter.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  dbStore.deleteNotification(req.params.id);
  return res.json({ success: true, message: 'Notification deleted.' });
});

// DELETE /api/v1/notifications
notificationRouter.delete('/', authenticate, (req: AuthRequest, res: Response) => {
  dbStore.clearAllNotifications(
    req.user!.organizationId,
    req.user!.id,
    req.user!.role,
    req.user!.stationId || undefined
  );
  return res.json({ success: true, message: 'All notifications cleared.' });
});
