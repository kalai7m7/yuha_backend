import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './lib/requestLogger';
import { apiRouter } from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { supabaseAdmin } from './lib/supabase/admin';

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

// Temporary connection probe — remove once DB is confirmed working
app.get('/api/debug/supabase', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id')
    .limit(1);

  if (error) {
    res.status(500).json({ success: false, error: { message: error.message, code: error.code, details: error.details, hint: error.hint } });
    return;
  }
  res.json({ success: true, data });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
