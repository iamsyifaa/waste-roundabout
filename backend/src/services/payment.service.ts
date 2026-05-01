import { PaymentStatus, TransactionStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { snap, coreApi } from '../utils/midtrans';
import { NotFoundError, BadRequestError } from '../utils/errors';

// Force TS Server reload

/**
 * Initiates payment via Midtrans Snap.
 * Generates a snap token that the frontend can use to display the payment popup.
 */
export const createPaymentToken = async (userId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      collector: true,
      wastePost: { include: { category: true } },
    },
  });

  if (!transaction) throw new NotFoundError('Transaksi');

  if (transaction.collectorId !== userId) {
    throw new BadRequestError('Hanya pembeli (Collector) yang bisa melakukan pembayaran.');
  }

  if (transaction.status !== TransactionStatus.PENDING) {
    throw new BadRequestError(`Transaksi berstatus ${transaction.status}, tidak bisa dibayar.`);
  }

  if (transaction.paymentStatus === PaymentStatus.PAID) {
    throw new BadRequestError('Transaksi ini sudah dibayar.');
  }

  // Jika token sudah pernah dibuat dan belum dibayar, gunakan kembali token tersebut
  if (transaction.snapToken && transaction.midtransOrderId) {
    return {
      token: transaction.snapToken,
    };
  }
  
  const midtransOrderId = `TRX-${transaction.id}-${Date.now()}`; // Unique order ID per attempt

  const parameter = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: Math.round(transaction.finalPrice), // Midtrans requires integer
    },
    customer_details: {
      first_name: transaction.collector.name || 'Collector',
      email: transaction.collector.email,
    },
    item_details: [
      {
        id: transaction.wastePost.categoryId,
        price: Math.round(transaction.wastePost.category.basePricePerKg),
        quantity: Math.round(transaction.wastePost.weight),
        name: transaction.wastePost.title.substring(0, 50), // Midtrans limits name length
      },
    ],
  };

  const snapResponse = await snap.createTransaction(parameter);

  // Update transaction with the new snap token and order ID
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      snapToken: snapResponse.token,
      midtransOrderId: midtransOrderId,
    },
  });

  return {
    token: updated.snapToken,
    redirect_url: snapResponse.redirect_url,
  };
};

/**
 * Handles incoming webhooks (notifications) from Midtrans.
 * Verifies the signature and updates the transaction payment status.
 */
export const handlePaymentNotification = async (notificationJson: any) => {
  try {
    // 1. Verify notification authenticity with Midtrans Core API
    const statusResponse = await coreApi.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Find the transaction using the midtransOrderId
    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: orderId },
      include: { wastePost: true },
    });

    if (!transaction) {
      console.warn(`[Midtrans] Transaksi dengan order_id ${orderId} tidak ditemukan.`);
      return; // Acknowledge anyway so Midtrans stops retrying
    }

    let newPaymentStatus = transaction.paymentStatus;

    // 2. Map Midtrans status to our PaymentStatus enum
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        newPaymentStatus = PaymentStatus.PENDING;
      } else {
        newPaymentStatus = PaymentStatus.PAID;
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newPaymentStatus = PaymentStatus.FAILED;
    } else if (transactionStatus === 'pending') {
      newPaymentStatus = PaymentStatus.PENDING;
    }

    // 3. Update database
    if (newPaymentStatus !== transaction.paymentStatus) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: newPaymentStatus },
      });
      
      console.log(`[Midtrans] Status pembayaran ${transaction.id} diupdate menjadi ${newPaymentStatus}`);
    }

    return true;
  } catch (error) {
    console.error('[Midtrans] Gagal memproses notifikasi:', error);
    throw error;
  }
};
