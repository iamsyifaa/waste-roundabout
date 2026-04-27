import { Router } from 'express';
import { createWaste, getAllWastes, getCategories } from '../controllers/waste.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, createWaste);
router.get('/', getAllWastes);
router.get('/categories', getCategories);

export default router;
