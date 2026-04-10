import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { pool } from './db/pool.js';
import { createApp } from './app.js';
import { logger } from './logger.js';

const app = createApp();

const start = async () => {
  await migrate();

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'DICOM backend listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down DICOM backend');
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

start().catch(async (error) => {
  logger.error({ error }, 'Failed to start backend');
  await pool.end();
  process.exit(1);
});

