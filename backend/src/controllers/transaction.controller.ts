import { Request, Response } from 'express';
import { Role, WastePostStatus, TransactionStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export const createTransaction = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.COLLECTOR) {
    return res.status(403).json({ message: 'Forbidden: Hanya Collector yang bisa membeli.' });
  }

  const { waste_post_id } = req.body;

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const wastePost = await tx.wastePost.findUnique({
        where: { id: waste_post_id },
        include: { category: true },
      });

      if (!wastePost) throw new Error('Postingan limbah tidak ditemukan.');
      if (wastePost.status !== WastePostStatus.AVAILABLE) throw new Error('Limbah sudah tidak tersedia.');
      
      // VALIDASI: Farmer dilarang beli limbahnya sendiri
      if (wastePost.postedById === req.user?.id) {
        throw new Error('Anda tidak bisa membeli limbah Anda sendiri.');
      }

      const finalPrice = wastePost.weight * wastePost.category.basePricePerKg;

      const newTransaction = await tx.transaction.create({
        data: {
          collectorId: req.user!.id,
          wastePostId: waste_post_id,
          pointsAwarded: 0,
          finalPrice: finalPrice,
          status: TransactionStatus.PENDING,
        },
      });

      await tx.wastePost.update({
        where: { id: waste_post_id },
        data: { status: WastePostStatus.BOOKED },
      });

      return newTransaction;
    });

    res.status(201).json(transactionResult);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Gagal membuat transaksi.' });
  }
};

export const completeTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { wastePost: true },
      });

      if (!transaction) throw new Error('Transaksi tidak ditemukan.');
      
      // VALIDASI: Authorization check
      if (req.user?.id !== transaction.collectorId && req.user?.id !== transaction.wastePost.postedById) {
        throw new Error('Forbidden: Anda tidak memiliki akses untuk menyelesaikan transaksi ini.');
      }
      
      // VALIDASI: Hanya bisa selesaikan jika status masih PENDING
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Transaksi ini sudah selesai atau dibatalkan.');
      }

      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.COMPLETED, pointsAwarded: 10 },
      });

      await tx.wastePost.update({
        where: { id: transaction.wastePostId },
        data: { status: WastePostStatus.SOLD },
      });

      await tx.user.update({
        where: { id: transaction.wastePost.postedById },
        data: { points: { increment: 10 } },
      });

      await tx.pointLog.create({
        data: {
          userId: transaction.wastePost.postedById,
          points: 10,
          description: `Poin dari transaksi ${transaction.id}`,
        },
      });

      return updatedTransaction;
    });

    res.status(200).json({ message: 'Transaksi Selesai!', data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Gagal menyelesaikan transaksi.' });
  }
};