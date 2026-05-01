import { Role, WastePostStatus, TransactionStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { createTransactionSchema } from '../utils/zod.schema';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

const POINTS_PER_TRANSACTION = 10;

/**
 * Creates a new transaction (Collector buys waste from Farmer).
 * Atomic operation: creates transaction + updates waste post status.
 */
export const createTransaction = async (collectorId: string, userRole: string, data: unknown) => {
  if (userRole !== Role.COLLECTOR) {
    throw new ForbiddenError('Hanya Collector yang bisa membeli limbah.');
  }

  const { waste_post_id } = createTransactionSchema.parse(data);

  const transactionResult = await prisma.$transaction(async (tx) => {
    const wastePost = await tx.wastePost.findUnique({
      where: { id: waste_post_id },
      include: { category: true },
    });

    if (!wastePost) throw new NotFoundError('Postingan limbah');
    if (wastePost.status !== WastePostStatus.AVAILABLE) {
      throw new BadRequestError('Limbah sudah tidak tersedia.');
    }

    // Prevent self-purchase
    if (wastePost.postedById === collectorId) {
      throw new ForbiddenError('Anda tidak bisa membeli limbah Anda sendiri.');
    }

    const finalPrice = wastePost.weight * wastePost.category.basePricePerKg;

    const newTransaction = await tx.transaction.create({
      data: {
        collectorId,
        wastePostId: waste_post_id,
        pointsAwarded: 0,
        finalPrice,
        status: TransactionStatus.PENDING,
      },
      include: {
        wastePost: { include: { category: true } },
      },
    });

    await tx.wastePost.update({
      where: { id: waste_post_id },
      data: { status: WastePostStatus.BOOKED },
    });

    return newTransaction;
  });

  return transactionResult;
};

/**
 * Completes a transaction.
 * Only the collector or the farmer of the transaction can complete it.
 * Awards points to the farmer.
 */
export const completeTransaction = async (userId: string, transactionId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { wastePost: true },
    });

    if (!transaction) throw new NotFoundError('Transaksi');

    // Authorization check
    if (userId !== transaction.collectorId && userId !== transaction.wastePost.postedById) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk menyelesaikan transaksi ini.');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestError('Transaksi ini sudah selesai atau dibatalkan.');
    }

    // Dynamic points based on weight (minimum 10)
    const points = Math.max(POINTS_PER_TRANSACTION, Math.ceil(transaction.wastePost.weight / 5) * 5);

    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.COMPLETED, pointsAwarded: points },
    });

    await tx.wastePost.update({
      where: { id: transaction.wastePostId },
      data: { status: WastePostStatus.SOLD },
    });

    await tx.user.update({
      where: { id: transaction.wastePost.postedById },
      data: { points: { increment: points } },
    });

    await tx.pointLog.create({
      data: {
        userId: transaction.wastePost.postedById,
        points,
        description: `Poin dari transaksi ${transaction.id} (${transaction.wastePost.weight}kg)`,
      },
    });

    return { ...updatedTransaction, pointsAwarded: points, farmerId: transaction.wastePost.postedById };
  });

  // Check and award badges asynchronously outside the transaction
  import('./gamification.service').then(gamification => {
    gamification.checkAndAwardBadges(result.farmerId).catch(err => {
      console.error('Failed to award badges:', err);
    });
  });

  return result;
};

/**
 * Cancels a pending transaction.
 * Only the collector or the farmer can cancel.
 * Restores waste post status to AVAILABLE.
 */
export const cancelTransaction = async (userId: string, transactionId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { wastePost: true },
    });

    if (!transaction) throw new NotFoundError('Transaksi');

    if (userId !== transaction.collectorId && userId !== transaction.wastePost.postedById) {
      throw new ForbiddenError('Anda tidak memiliki akses untuk membatalkan transaksi ini.');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestError('Hanya transaksi berstatus PENDING yang bisa dibatalkan.');
    }

    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED' as TransactionStatus },
    });

    await tx.wastePost.update({
      where: { id: transaction.wastePostId },
      data: { status: WastePostStatus.AVAILABLE },
    });

    return updatedTransaction;
  });

  return result;
};

/**
 * Gets all transactions for the logged-in user.
 * Returns different data based on role:
 * - FARMER: transactions where they are the waste poster
 * - COLLECTOR: transactions where they are the buyer
 */
export const getMyTransactions = async (userId: string, userRole: string) => {
  if (userRole === Role.FARMER) {
    return prisma.transaction.findMany({
      where: { wastePost: { postedById: userId } },
      include: {
        wastePost: { include: { category: true } },
        collector: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // COLLECTOR
  return prisma.transaction.findMany({
    where: { collectorId: userId },
    include: {
      wastePost: {
        include: {
          category: true,
          postedBy: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Gets a single transaction by ID with authorization check.
 */
export const getTransactionById = async (userId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      wastePost: {
        include: {
          category: true,
          postedBy: { select: { id: true, name: true, email: true } },
        },
      },
      collector: { select: { id: true, name: true, email: true } },
    },
  });

  if (!transaction) throw new NotFoundError('Transaksi');

  // Only related parties can view
  if (userId !== transaction.collectorId && userId !== transaction.wastePost.postedById) {
    throw new ForbiddenError('Anda tidak memiliki akses ke transaksi ini.');
  }

  return transaction;
};
