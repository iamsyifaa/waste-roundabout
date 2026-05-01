import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import wasteRoutes from './routes/waste.routes';
import transactionRoutes from './routes/transaction.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import aiRoutes from './routes/ai.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

// --- Global Security Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Prevent payload bombing
app.use(morgan('dev'));

// --- Rate Limiting for Auth Routes ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per window per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- API Version Prefix ---
const API_PREFIX = '/api/v1';

// --- Routes ---
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/waste`, wasteRoutes);
app.use(`${API_PREFIX}/transactions`, transactionRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);

// --- Health Check ---
app.get('/ping', (_req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

// --- 404 Handler (harus setelah semua routes) ---
app.use(notFoundHandler);

// --- Centralized Error Handler (harus paling terakhir) ---
app.use(errorHandler);

export default app;
