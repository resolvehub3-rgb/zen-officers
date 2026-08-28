import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'zen_security_jwt_access_secret_super_secure_key_2026';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(); // allow unauthenticated or handshake connection, client will join rooms on auth
    }
    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as any;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;

    socket.on('join', (data: { organizationId?: string; stationId?: string; userId?: string }) => {
      if (data.organizationId) {
        socket.join(`org:${data.organizationId}`);
      }
      if (data.stationId) {
        socket.join(`station:${data.stationId}`);
      }
      if (data.userId) {
        socket.join(`user:${data.userId}`);
      }
    });

    if (user) {
      if (user.organizationId) {
        socket.join(`org:${user.organizationId}`);
      }
      if (user.stationId) {
        socket.join(`station:${user.stationId}`);
      }
      if (user.id) {
        socket.join(`user:${user.id}`);
      }
    }

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export const realtimeBroadcaster = {
  dutyStarted(duty: any) {
    if (!ioInstance) return;
    ioInstance.to(`org:${duty.organizationId}`).emit('duty:started', duty);
    ioInstance.to(`station:${duty.stationId}`).emit('duty:started', duty);
    ioInstance.emit('station:activity', {
      type: 'DUTY_STARTED',
      stationId: duty.stationId,
      stationName: duty.stationName,
      officerName: duty.officerName,
      timestamp: duty.startTime,
      message: `${duty.officerName} started duty at ${duty.stationName}.`,
    });
  },

  dutyEnded(duty: any) {
    if (!ioInstance) return;
    ioInstance.to(`org:${duty.organizationId}`).emit('duty:ended', duty);
    ioInstance.to(`station:${duty.stationId}`).emit('duty:ended', duty);
    ioInstance.emit('station:activity', {
      type: 'DUTY_ENDED',
      stationId: duty.stationId,
      stationName: duty.stationName,
      officerName: duty.officerName,
      timestamp: duty.endTime,
      message: `${duty.officerName} completed duty at ${duty.stationName}.`,
    });
  },

  patrolStarted(patrol: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${patrol.stationId}`).emit('patrol:started', patrol);
  },

  patrolSubmitted(report: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${report.stationId}`).emit('patrol:submitted', report);
    ioInstance.emit('station:activity', {
      type: 'PATROL_COMPLETED',
      stationId: report.stationId,
      stationName: report.stationName,
      officerName: report.officerName,
      timestamp: report.createdAt,
      message: `Patrol check completed at ${report.locationTag || report.stationName} by ${report.officerName}.`,
    });
  },

  checkSubmitted(check: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${check.stationId}`).emit('check:submitted', check);
  },

  occurrenceCreated(occurrence: any) {
    if (!ioInstance) return;
    ioInstance.to(`org:${occurrence.organizationId}`).emit('occurrence:created', occurrence);
    ioInstance.to(`station:${occurrence.stationId}`).emit('occurrence:created', occurrence);

    if (occurrence.severity === 'CRITICAL' || occurrence.severity === 'HIGH') {
      ioInstance.to(`org:${occurrence.organizationId}`).emit('occurrence:critical', occurrence);
    }

    ioInstance.emit('station:activity', {
      type: 'OCCURRENCE_REPORTED',
      stationId: occurrence.stationId,
      stationName: occurrence.stationName,
      officerName: occurrence.officerName,
      severity: occurrence.severity,
      timestamp: occurrence.createdAt,
      message: `${occurrence.severity} Occurrence (${occurrence.type}) reported at ${occurrence.stationName}: ${occurrence.description.slice(0, 70)}...`,
    });
  },

  reportSubmitted(report: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${report.stationId}`).emit('report:submitted', report);
    ioInstance.to(`org:${report.organizationId || 'org-zen-001'}`).emit('report:submitted', report);
    ioInstance.emit('report:submitted', report);
    ioInstance.emit('station:activity', {
      type: 'FINAL_REPORT_SUBMITTED',
      stationId: report.stationId,
      stationName: report.stationName,
      officerName: report.officerName,
      timestamp: report.submittedAt,
      message: `Final shift report submitted by ${report.officerName} for ${report.stationName} (${report.verificationCode || 'Locked'}).`,
    });
  },

  reportReturned(report: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${report.stationId}`).emit('report:returned', report);
    ioInstance.to(`user:${report.officerId}`).emit('report:returned', report);
  },

  reportApprovedAndSigned(report: any) {
    if (!ioInstance) return;
    ioInstance.to(`station:${report.stationId}`).emit('report:signed', report);
    ioInstance.to(`user:${report.officerId}`).emit('report:signed', report);
    ioInstance.to(`org:${report.organizationId || 'org-zen-001'}`).emit('report:signed', report);

    ioInstance.emit('station:activity', {
      type: 'FINAL_REPORT_SIGNED',
      stationId: report.stationId,
      stationName: report.stationName,
      officerName: report.officerName,
      signerName: report.signature?.signerName,
      timestamp: report.signedAt,
      message: `${report.stationName} — Final shift report (${report.verificationCode}) signed by ${report.signature?.signerName || 'Station Manager'}.`,
    });
  },

  notificationCreated(notification: any) {
    if (!ioInstance) return;
    if (notification.userId) {
      ioInstance.to(`user:${notification.userId}`).emit('notification:created', notification);
    } else {
      if (notification.stationId) {
        ioInstance.to(`station:${notification.stationId}`).emit('notification:created', notification);
      }
      ioInstance.to(`org:${notification.organizationId}`).emit('notification:created', notification);
    }
  }
};
