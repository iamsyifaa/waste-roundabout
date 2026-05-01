import { Router } from 'express';
import { initiatePayment, handleWebhook } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Public route for Midtrans webhook
router.post('/notification', handleWebhook);

// Protected routes
router.post('/:transactionId/pay', protect, initiatePayment);

export default router;
