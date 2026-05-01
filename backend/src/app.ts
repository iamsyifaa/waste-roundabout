import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import wasteRoutes from './routes/waste.routes';
import transactionRoutes from './routes/transaction.routes'; // Import transaction routes

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Define a consistent API version prefix
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/waste`, wasteRoutes);
app.use(`${API_PREFIX}/transactions`, transactionRoutes); // Add transaction routes

app.get('/ping', (_req, res) => {
  res.send('pong');
});

export default app;
