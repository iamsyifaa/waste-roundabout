import { Request, Response } from 'express';
import { PrismaClient, Role, WastePostStatus, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Only COLLECTORs can initiate transactions
export const createTransaction = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.COLLECTOR) {
    return res.status(403).json({ message: 'Forbidden: Only collectors can create transactions.' });
  }

  const { wastePostId } = req.body;
  if (!wastePostId) {
    return res.status(400).json({ message: 'wastePostId is required' });
  }

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch the WastePost and its category, and lock the row for update
      const wastePost = await tx.wastePost.findUnique({
        where: { id: wastePostId },
        include: { category: true },
      });

      // 2. Check if the waste is available for transaction
      if (!wastePost) {
        throw new Error('Waste post not found.');
      }
      if (wastePost.status !== WastePostStatus.AVAILABLE) {
        throw new Error(`Waste is already ${wastePost.status}.`);
      }

      // 3. Calculate final price
      const finalPrice = wastePost.weight * wastePost.category.basePricePerKg;

      // 4. Create the transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          collectorId: req.user.id,
          wastePostId: wastePostId,
          pointsAwarded: 0, // Points are awarded upon completion
          finalPrice: finalPrice,
          status: TransactionStatus.PENDING,
        },
      });

      // 5. Update the waste post status to BOOKED
      await tx.wastePost.update({
        where: { id: wastePostId },
        data: { status: WastePostStatus.BOOKED },
      });

      return newTransaction;
    });

    res.status(201).json(transactionResult);
  } catch (error: any) {
    console.error('Transaction failed:', error);
    res.status(400).json({ message: error.message || 'Could not create transaction.' });
  }
};

// COLLECTORs or ADMINs can complete transactions
export const completeTransaction = async (req: Request, res: Response) => {
  if (!req.user || (req.user.role !== Role.COLLECTOR && req.user.role !== Role.ADMIN)) {
    return res.status(403).json({ message: 'Forbidden: Only collectors or admins can complete transactions.' });
  }

  const { id: transactionId } = req.params;

  try {
    const pointsToAward = 10;
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the transaction and the associated farmer
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { wastePost: { include: { postedBy: true } } },
      });

      // 2. Validate the transaction
      if (!transaction) {
        throw new Error('Transaction not found.');
      }
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error(`Transaction is already ${transaction.status}.`);
      }

      const farmer = transaction.wastePost.postedBy;

      // 3. Update Transaction status to COMPLETED
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.COMPLETED, pointsAwarded: pointsToAward },
      });

      // 4. Update WastePost status to SOLD
      await tx.wastePost.update({
        where: { id: transaction.wastePostId },
        data: { status: WastePostStatus.SOLD },
      });

      // 5. Award points to the farmer
      const updatedFarmer = await tx.user.update({
        where: { id: farmer.id },
        data: { points: { increment: pointsToAward } },
      });

      // 6. Create a PointLog entry for audit
      const pointLog = await tx.pointLog.create({
        data: {
          userId: farmer.id,
          points: pointsToAward,
          description: `+${pointsToAward} points from transaction ${transaction.id}`,
        },
      });

      return { updatedTransaction, updatedFarmer, pointLog };
    });

    res.status(200).json({ message: 'Transaction completed successfully.', data: result });
  } catch (error: any) {
    console.error('Transaction completion failed:', error);
    res.status(400).json({ message: error.message || 'Could not complete transaction.' });
  }
};