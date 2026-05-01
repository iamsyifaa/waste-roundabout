import { Router } from 'express';
import {
  createTransaction,
  completeTransaction,
  cancelTransaction,
  getMyTransactions,
  getTransactionById,
} from '../controllers/transaction.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// All transaction routes are protected
router.use(protect);

// List my transactions
router.get('/me', getMyTransactions);

// Get single transaction
router.get('/:id', getTransactionById);

// Create a transaction (COLLECTOR buys waste)
router.post('/', createTransaction);

// Complete a transaction
router.patch('/:id/complete', completeTransaction);

// Cancel a transaction
router.patch('/:id/cancel', cancelTransaction);

export default router;
