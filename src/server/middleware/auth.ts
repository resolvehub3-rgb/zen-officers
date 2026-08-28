import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store.ts';
import { User, UserRole } from '../../types/index.ts';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'zen_security_jwt_access_secret_super_secure_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zen_security_jwt_refresh_secret_super_secure_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateTokens(user: User) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      organizationId: user.organizationId,
      stationId: user.stationId,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing or invalid.',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userRecord = dbStore.getUserById(payload.id);

    if (!userRecord || userRecord.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account not found or suspended.',
        code: 'USER_INACTIVE',
      });
    }

    const { passwordHash: _, ...safeUser } = userRecord;
    req.user = safeUser;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token.',
      code: 'TOKEN_EXPIRED',
    });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}`,
        code: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
}

export function requireStationAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Head Office has organization-wide access to all stations
  if (req.user.role === 'HEAD_OFFICE') {
    return next();
  }

  const targetStationId = req.params.stationId || req.body.stationId || req.query.stationId;

  if (targetStationId && req.user.stationId && req.user.stationId !== targetStationId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You are not authorized to view or modify records from another station.',
      code: 'UNAUTHORIZED_STATION_ACCESS',
    });
  }

  next();
}
