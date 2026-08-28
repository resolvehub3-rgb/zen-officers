import { Router, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';

export const userRouter = Router();

const createUserSchema = z.object({
  stationId: z.string().nullable().optional(),
  employeeId: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  role: z.enum(['SECURITY_OFFICER', 'STATION_MANAGER', 'STATION_SUPERVISOR', 'HEAD_OFFICE']),
  password: z.string().min(6),
  profileImage: z.string().optional(),
});

// GET /api/v1/users
userRouter.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const stationId = req.query.stationId as string | undefined;

  // Station managers can only see users at their station
  if (req.user!.role !== 'HEAD_OFFICE') {
    const users = dbStore.getAllUsers(orgId, req.user!.stationId || undefined);
    return res.json({ success: true, data: users });
  }

  const users = dbStore.getAllUsers(orgId, stationId);
  return res.json({ success: true, data: users });
});

// POST /api/v1/users (Head Office only)
userRouter.post('/', authenticate, requireRole('HEAD_OFFICE'), (req: AuthRequest, res: Response) => {
  const parse = createUserSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  // Check email uniqueness
  const existingEmail = dbStore.getUserByEmail(parse.data.email);
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
  }

  const newUser = dbStore.createUser(
    {
      organizationId: req.user!.organizationId,
      stationId: parse.data.stationId,
      employeeId: parse.data.employeeId,
      firstName: parse.data.firstName,
      lastName: parse.data.lastName,
      email: parse.data.email,
      phone: parse.data.phone,
      role: parse.data.role,
      password: parse.data.password,
      profileImage: parse.data.profileImage,
    },
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    req.user!.role
  );

  return res.status(201).json({ success: true, data: newUser });
});

// PATCH /api/v1/users/:id (Head Office or self profile update)
userRouter.patch('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const targetId = req.params.id;
  const isSelf = req.user!.id === targetId;
  const isHeadOffice = req.user!.role === 'HEAD_OFFICE';

  if (!isSelf && !isHeadOffice) {
    return res.status(403).json({ success: false, message: 'Unauthorized to modify this user account.' });
  }

  // Only Head Office can change station or role or status
  const updates: any = {};
  if (req.body.firstName) updates.firstName = req.body.firstName;
  if (req.body.lastName) updates.lastName = req.body.lastName;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.profileImage) updates.profileImage = req.body.profileImage;
  if (req.body.password) updates.password = req.body.password;

  if (isHeadOffice) {
    if (req.body.stationId !== undefined) updates.stationId = req.body.stationId;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.status) updates.status = req.body.status;
    if (req.body.employeeId) updates.employeeId = req.body.employeeId;
  }

  const updated = dbStore.updateUser(
    targetId,
    updates,
    req.user!.id,
    `${req.user!.firstName} ${req.user!.lastName}`,
    req.user!.role
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, data: updated });
});
