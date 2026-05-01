import midtransClient from 'midtrans-client';

// Ensure keys are available
const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';

if (!serverKey || !clientKey) {
  console.warn('⚠️ MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY tidak ditemukan di .env');
}

/**
 * Midtrans Snap API Client Instance
 * Digunakan untuk generate payment token (frontend popup)
 */
export const snap = new midtransClient.Snap({
  isProduction: false, // Gunakan Sandbox mode
  serverKey,
  clientKey,
});

/**
 * Midtrans Core API Client Instance
 * Digunakan untuk verifikasi notifikasi (webhook)
 */
export const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey,
  clientKey,
});
