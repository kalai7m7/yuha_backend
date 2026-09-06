import 'dotenv/config';

import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    'Yuha backend started'
  );
});

server.on('error', (error) => {
  logger.error(
    {
      error,
    },
    'HTTP server error'
  );
});

server.on('listening', () => {
  const address = server.address();

  logger.info(
    {
      address,
    },
    'HTTP server is listening'
  );
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutdown requested');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));