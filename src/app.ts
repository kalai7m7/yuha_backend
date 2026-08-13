import express from 'express';
import path from 'path';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { traceMiddleware } from './middlewares/traceMiddleware';
import catalogRouter from './routes/catalogRoutes';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import pincodeRouter from './routes/pincodeRoutes';
import orderRouter from './routes/orderRoutes';
import customerRouter from './routes/customerRoutes';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-trace-id'],
    optionsSuccessStatus: 200,
  })
);

// Log every request — including OPTIONS preflight — before anything else
app.use((req, _res, next) => {
  console.log(`[RAW] ${req.method} ${req.originalUrl} — origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(traceMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Health check
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/catalog', catalogRouter);
app.use('/api/auth', authRouter);
app.use('/api/pincodes', pincodeRouter);
app.use('/api/orders', orderRouter);
app.use('/api/customers', customerRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;