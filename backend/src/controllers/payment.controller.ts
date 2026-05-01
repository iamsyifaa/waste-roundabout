import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as paymentService from '../services/payment.service';

/**
 * POST /api/v1/payments/:transactionId/pay
 * Initiates payment via Midtrans Snap. Returns a snap token.
 * Protected route, only for Collector.
 */
export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentToken(req.user!.id, req.params.transactionId);
  res.json({
    success: true,
    message: 'Payment token generated successfully',
    data: result,
  });
});

/**
 * POST /api/v1/payments/notification
 * Webhook endpoint for Midtrans to send payment status updates.
 * Public route (no auth), but validates signature internally.
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  // Pass the raw body (JSON) to the service
  await paymentService.handlePaymentNotification(req.body);
  
  // Always return 200 OK so Midtrans knows we received it
  res.status(200).send('OK');
});
