import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, generateTokens, AuthRequest } from '../middleware/auth.ts';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/v1/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email and password.',
      errors: parse.error.format(),
    });
  }

  const { email, password } = parse.data;
  const user = dbStore.getUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'This user account is suspended or inactive. Please contact Head Office.',
      code: 'ACCOUNT_INACTIVE',
    });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  const { passwordHash: _, ...safeUser } = user;
  const tokens = generateTokens(safeUser);

  // Update last login
  dbStore.updateUser(user.id, { lastLoginAt: new Date().toISOString() }, user.id, `${user.firstName} ${user.lastName}`, user.role);

  dbStore.logAudit({
    organizationId: user.organizationId,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    userRole: user.role,
    action: 'USER_LOGIN',
    entityType: 'AUTH',
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json({
    success: true,
    data: {
      user: safeUser,
      tokens,
    },
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: req.user,
  });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user) {
    dbStore.logAudit({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      action: 'USER_LOGOUT',
      entityType: 'AUTH',
      entityId: req.user.id,
    });
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});
