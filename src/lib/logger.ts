import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'yuha-backend',
    environment: env.NODE_ENV
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'access_token',
      'refresh_token',
      'SUPABASE_SECRET_KEY'
    ],
    censor: '[REDACTED]'
  }
});
