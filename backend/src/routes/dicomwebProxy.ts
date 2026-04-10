import { Router } from 'express';
import { HttpError } from '../errors.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { dicomwebClient } from '../services/services.js';

export const dicomwebProxyRouter = Router();

dicomwebProxyRouter.use(
  '/',
  asyncHandler(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (!['GET', 'HEAD'].includes(req.method)) {
      throw new HttpError(405, 'Only read-only DICOMweb proxy methods are enabled. Upload through /api/studies/upload.');
    }

    const pathAndQuery = req.originalUrl.replace(/^\/api\/dicomweb/, '') || '/';
    await dicomwebClient.proxyReadOnly(req, res, pathAndQuery);
  }),
);

