import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './lib/requestLogger';
import { apiRouter } from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((value) => value.trim()),
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'yuha-backend'
    }
  });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
