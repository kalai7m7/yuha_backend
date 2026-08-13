import pinoHttp from 'pino-http';
import crypto from 'node:crypto';
import { logger } from './logger';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) =>
    req.headers['x-request-id']?.toString() ?? crypto.randomUUID()
});
