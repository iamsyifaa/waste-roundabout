import { Router } from 'express';
import { createWaste, getAllWastes, getCategories, getWasteById, updateWaste, deleteWaste } from '../controllers/waste.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllWastes);
router.get('/categories', getCategories);
router.get('/:id', getWasteById);

// Protected routes (FARMER only)
router.post('/', protect, createWaste);
router.put('/:id', protect, updateWaste);
router.delete('/:id', protect, deleteWaste);

export default router;
