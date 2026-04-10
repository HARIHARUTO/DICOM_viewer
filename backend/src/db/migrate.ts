import { pool } from './pool.js';
import { schemaSql } from './schema.js';
import { logger } from '../logger.js';

export const migrate = async () => {
  await pool.query(schemaSql);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(async () => {
      logger.info('Database migrations completed');
      await pool.end();
    })
    .catch(async (error) => {
      logger.error({ error }, 'Database migrations failed');
      await pool.end();
      process.exit(1);
    });
}

