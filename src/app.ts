import express from 'express';
import path from 'path';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// Routes
app.use('/api/items', itemRoutes);
app.use('/api/category', categoryRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;