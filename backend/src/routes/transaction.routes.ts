import { Router } from 'express';
import { createTransaction, completeTransaction } from '../controllers/transaction.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// All transaction routes are protected
router.use(protect);

// Route for a buyer (collector) to create a transaction
router.post('/', createTransaction);

// Route for a buyer (collector) or admin to mark a transaction as complete
router.patch('/:id/complete', completeTransaction);

export default router;
