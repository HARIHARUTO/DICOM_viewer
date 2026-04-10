import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './logger.js';
import { dicomwebProxyRouter } from './routes/dicomwebProxy.js';
import { healthRouter } from './routes/health.js';
import { studiesRouter } from './routes/studies.js';
import { uploadsRouter } from './routes/uploads.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Range', 'If-None-Match', 'If-Modified-Since', 'If-Range'],
      exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Content-Type'],
    }),
  );
  app.use(
    pinoHttp({
      logger,
      autoLogging: config.nodeEnv !== 'test',
      redact: ['req.headers.authorization'],
    }),
  );

  app.use('/health', healthRouter);
  app.use('/api/dicomweb', dicomwebProxyRouter);
  app.use('/api/studies/upload', uploadsRouter);
  app.use('/api/studies', express.json({ limit: '1mb' }), studiesRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        message: 'Route not found.',
      },
    });
  });

  app.use(errorHandler);

  return app;
};
