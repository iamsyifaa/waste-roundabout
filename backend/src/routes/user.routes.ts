import { Router } from 'express';
import { getMe, getLeaderboard, getDashboardStats } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getDashboardStats);

// Protected routes
router.get('/me', protect, getMe);

export default router;
