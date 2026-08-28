import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { initSocketIO } from './src/server/sockets/index.ts';
import { authRouter } from './src/server/routes/authRoutes.ts';
import { stationRouter } from './src/server/routes/stationRoutes.ts';
import { userRouter } from './src/server/routes/userRoutes.ts';
import { dutyRouter } from './src/server/routes/dutyRoutes.ts';
import { patrolRouter } from './src/server/routes/patrolRoutes.ts';
import { checkRouter } from './src/server/routes/checkRoutes.ts';
import { occurrenceRouter } from './src/server/routes/occurrenceRoutes.ts';
import { reportRouter } from './src/server/routes/reportRoutes.ts';
import { analyticsRouter } from './src/server/routes/analyticsRoutes.ts';
import { auditRouter } from './src/server/routes/auditRoutes.ts';
import { notificationRouter } from './src/server/routes/notificationRoutes.ts';
import { voiceRouter } from './src/server/routes/voiceRoutes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocketIO(server);

  // Express middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // REST API Endpoints
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/stations', stationRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/duties', dutyRouter);
  app.use('/api/v1/patrols', patrolRouter);
  app.use('/api/v1/checks', checkRouter);
  app.use('/api/v1/occurrences', occurrenceRouter);
  app.use('/api/v1/reports', reportRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/audit-logs', auditRouter);
  app.use('/api/v1/notifications', notificationRouter);
  app.use('/api/v1/voice', voiceRouter);

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR',
    });
  });

  // Vite middleware in dev or static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ Zen Security SaaS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
