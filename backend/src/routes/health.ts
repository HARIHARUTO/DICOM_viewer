import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { dicomwebClient } from '../services/services.js';

export const healthRouter = Router();

healthRouter.get('/live', (_req, res) => {
  res.json({ status: 'ok' });
});

healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1');
    await dicomwebClient.queryStudies({ limit: 1, offset: 0 });

    res.json({
      status: 'ready',
      checks: {
        postgres: 'ok',
        orthancDicomweb: 'ok',
      },
    });
  }),
);

