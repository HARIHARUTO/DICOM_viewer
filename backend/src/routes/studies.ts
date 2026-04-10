import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../errors.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { metadataRepository, studySyncService } from '../services/services.js';
import { studyListQuerySchema } from '../services/metadataRepository.js';

const studyUidSchema = z.string().trim().min(1).max(128);

export const studiesRouter = Router();

studiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = studyListQuerySchema.parse(req.query);
    const result = await metadataRepository.listStudies(query);
    res.json(result);
  }),
);

studiesRouter.post(
  '/sync',
  asyncHandler(async (_req, res) => {
    const result = await studySyncService.syncAllStudies();
    res.json(result);
  }),
);

studiesRouter.get(
  '/:studyInstanceUid',
  asyncHandler(async (req, res) => {
    const studyInstanceUid = studyUidSchema.parse(req.params.studyInstanceUid);
    const study = await metadataRepository.getStudy(studyInstanceUid);

    if (!study) {
      throw new HttpError(404, 'Study metadata was not found. Run metadata sync after importing studies.');
    }

    res.json({ study });
  }),
);

