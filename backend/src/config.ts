import 'dotenv/config';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

const numberFromEnv = (defaultValue: number) =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === '' ? defaultValue : Number(value)))
    .pipe(z.number().int().positive());

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  port: numberFromEnv(4000),
  databaseUrl: z.string().min(1),
  orthancDicomwebUrl: z.string().url(),
  orthancUsername: z.string().min(1),
  orthancPassword: z.string().min(1),
  corsOrigins: z
    .string()
    .default('http://localhost:3000,http://localhost:3001')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  uploadTmpDir: z.string().default(path.join(os.tmpdir(), 'dicom-viewer-uploads')),
  maxUploadFiles: numberFromEnv(200),
  maxUploadBytes: numberFromEnv(1024 * 1024 * 1024),
  qidoPageSize: numberFromEnv(100),
  qidoMaxSyncStudies: numberFromEnv(10000),
});

const parsed = configSchema.parse({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  orthancDicomwebUrl: process.env.ORTHANC_DICOMWEB_URL ?? 'http://localhost:8042/dicom-web',
  orthancUsername: process.env.ORTHANC_USERNAME ?? 'orthanc',
  orthancPassword: process.env.ORTHANC_PASSWORD ?? 'orthanc',
  corsOrigins: process.env.CORS_ORIGINS,
  uploadTmpDir: process.env.UPLOAD_TMP_DIR,
  maxUploadFiles: process.env.MAX_UPLOAD_FILES,
  maxUploadBytes: process.env.MAX_UPLOAD_BYTES,
  qidoPageSize: process.env.QIDO_PAGE_SIZE,
  qidoMaxSyncStudies: process.env.QIDO_MAX_SYNC_STUDIES,
});

export const config = {
  ...parsed,
  orthancDicomwebUrl: parsed.orthancDicomwebUrl.replace(/\/+$/, ''),
};

