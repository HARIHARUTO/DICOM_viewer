import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.nodeEnv === 'test' ? 'silent' : process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'orthancPassword', 'password'],
    remove: true,
  },
});

