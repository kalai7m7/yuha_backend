import dotenv from "dotenv";
dotenv.config();

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

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(traceMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/catalog', catalogRouter);
app.use('/api/auth', authRouter)

// Global error handler (should be after routes)
app.use(errorHandler);

// app.listen(process.env.PORT, () =>
//   console.log(`Server running on ${process.env.PORT}`)
// );

console.log("Process Env var check: ", process.env.DB_HOST)
export default app;