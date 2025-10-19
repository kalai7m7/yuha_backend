import express from 'express';
import itemRoutes from './routes/itemRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler } from './middlewares/errorHandler';
import path from 'path';
import { requestLogger } from './middlewares/requestLogger';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// Routes
app.use('/api/items', itemRoutes);
app.use('/api/category', categoryRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;