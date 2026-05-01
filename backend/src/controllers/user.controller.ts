import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';

/**
 * GET /api/v1/users/me
 * Gets the profile of the currently logged-in user.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getProfile(req.user!.id);
  res.json({ success: true, data: profile });
});

/**
 * GET /api/v1/users/leaderboard
 * Gets the top farmers ranked by points.
 */
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const leaderboard = await userService.getLeaderboard(limit);
  res.json({ success: true, data: leaderboard });
});

/**
 * GET /api/v1/users/stats
 * Gets dashboard statistics (public).
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await userService.getDashboardStats();
  res.json({ success: true, data: stats });
});
