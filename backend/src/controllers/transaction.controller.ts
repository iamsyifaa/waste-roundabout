import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as transactionService from '../services/transaction.service';

/**
 * POST /api/v1/transactions
 * Creates a new transaction (COLLECTOR buys waste).
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.createTransaction(req.user!.id, req.user!.role, req.body);
  res.status(201).json({ success: true, data: transaction });
});

/**
 * PATCH /api/v1/transactions/:id/complete
 * Completes a transaction. Awards points to the Farmer.
 */
export const completeTransaction = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.completeTransaction(req.user!.id, req.params.id);
  res.json({ success: true, message: 'Transaksi berhasil diselesaikan!', data: result });
});

/**
 * PATCH /api/v1/transactions/:id/cancel
 * Cancels a pending transaction.
 */
export const cancelTransaction = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.cancelTransaction(req.user!.id, req.params.id);
  res.json({ success: true, message: 'Transaksi berhasil dibatalkan.', data: result });
});

/**
 * GET /api/v1/transactions/me
 * Gets all transactions for the logged-in user.
 */
export const getMyTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await transactionService.getMyTransactions(req.user!.id, req.user!.role);
  res.json({ success: true, data: transactions });
});

/**
 * GET /api/v1/transactions/:id
 * Gets a single transaction by ID.
 */
export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.getTransactionById(req.user!.id, req.params.id);
  res.json({ success: true, data: transaction });
});