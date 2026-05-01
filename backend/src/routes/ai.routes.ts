import { Router } from 'express';
import { classifyWasteHandler } from '../controllers/ai.controller';
import { protect } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../utils/errors';

const router = Router();

// Middleware to restrict to FARMER role
const restrictToFarmer = (req: any, _res: any, next: any) => {
  if (req.user?.role !== Role.FARMER) {
    return next(new ForbiddenError('Hanya Farmer yang bisa menggunakan fitur AI ini.'));
  }
  next();
};

// Protected routes
router.post('/classify', protect, restrictToFarmer, classifyWasteHandler);

export default router;
