import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';

/**
 * POST /api/v1/auth/register
 * Registers a new user (FARMER or COLLECTOR).
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: user });
});

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns JWT token.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.json({ success: true, data: result });
});
