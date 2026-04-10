import Busboy from 'busboy';
import type { Request } from 'express';
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { config } from '../config.js';
import { HttpError } from '../errors.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { dicomwebClient, metadataRepository, studySyncService } from '../services/services.js';
import type { DicomTempFile } from '../utils/multipartRelated.js';

type ParsedUpload = {
  uploadId: string;
  tempDir: string;
  files: DicomTempFile[];
  totalBytes: number;
};

const safeFilename = (filename: string) =>
  path
    .basename(filename)
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 160);

const parseMultipartUpload = async (req: Request): Promise<ParsedUpload> => {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    throw new HttpError(415, 'Upload must use multipart/form-data.');
  }

  const contentLength = req.headers['content-length'];
  if (contentLength && Number(contentLength) > config.maxUploadBytes) {
    throw new HttpError(413, 'Upload is larger than the configured maximum.');
  }

  await mkdir(config.uploadTmpDir, { recursive: true });
  const uploadId = randomUUID();
  const tempDir = await mkdtemp(path.join(config.uploadTmpDir || os.tmpdir(), `${uploadId}-`));

  const parseResult = new Promise<ParsedUpload>((resolve, reject) => {
    const files: DicomTempFile[] = [];
    const writes: Promise<void>[] = [];
    let totalBytes = 0;
    let settled = false;
    let uploadError: Error | null = null;

    const fail = (error: Error) => {
      uploadError = uploadError ?? error;
    };

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: config.maxUploadFiles,
        fileSize: config.maxUploadBytes,
      },
    });

    busboy.on('file', (_fieldName, fileStream, info) => {
      if (files.length >= config.maxUploadFiles) {
        fail(new HttpError(413, `Upload cannot contain more than ${config.maxUploadFiles} files.`));
        fileStream.resume();
        return;
      }

      const filename = safeFilename(info.filename || `dicom-${files.length + 1}.dcm`);
      const tempPath = path.join(tempDir, `${randomUUID()}-${filename}`);
      const uploadedFile: DicomTempFile = {
        path: tempPath,
        filename,
        size: 0,
        mimeType: info.mimeType,
      };

      files.push(uploadedFile);

      const writeStream = createWriteStream(tempPath, { flags: 'wx' });

      fileStream.on('data', (chunk: Buffer) => {
        uploadedFile.size += chunk.length;
        totalBytes += chunk.length;

        if (totalBytes > config.maxUploadBytes) {
          fail(new HttpError(413, 'Upload is larger than the configured maximum.'));
          fileStream.unpipe(writeStream);
          writeStream.destroy();
          fileStream.resume();
        }
      });

      fileStream.on('limit', () => {
        fail(new HttpError(413, 'A DICOM file exceeded the configured upload limit.'));
        fileStream.unpipe(writeStream);
        writeStream.destroy();
        fileStream.resume();
      });

      const writePromise = new Promise<void>((resolveWrite, rejectWrite) => {
        let finished = false;
        writeStream.on('finish', () => {
          finished = true;
          resolveWrite();
        });
        writeStream.on('close', () => {
          if (uploadError && !finished) {
            resolveWrite();
          }
        });
        writeStream.on('error', (error) => {
          if (!uploadError) {
            rejectWrite(error);
          } else {
            resolveWrite();
          }
        });
      });

      writes.push(writePromise);
      fileStream.pipe(writeStream);
    });

    busboy.on('filesLimit', () => {
      fail(new HttpError(413, `Upload cannot contain more than ${config.maxUploadFiles} files.`));
    });

    busboy.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    busboy.on('close', async () => {
      if (settled) {
        return;
      }

      settled = true;

      try {
        await Promise.all(writes);

        if (uploadError) {
          throw uploadError;
        }

        const nonEmptyFiles = files.filter((file) => file.size > 0);

        if (nonEmptyFiles.length === 0) {
          throw new HttpError(400, 'No non-empty DICOM files were uploaded.');
        }

        resolve({
          uploadId,
          tempDir,
          files: nonEmptyFiles,
          totalBytes,
        });
      } catch (error) {
        reject(error);
      }
    });

    req.pipe(busboy);
  });

  try {
    return await parseResult;
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true });
    throw error;
  }
};

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const upload = await parseMultipartUpload(req);

    try {
      const orthancResponse = await dicomwebClient.stowDicomFiles(upload.files);
      const syncResult = await studySyncService.syncAllStudies();

      await metadataRepository.createUploadAudit({
        id: upload.uploadId,
        originalFileCount: upload.files.length,
        totalBytes: upload.totalBytes,
        status: 'accepted',
        orthancResponse,
      });

      res.status(201).json({
        uploadId: upload.uploadId,
        acceptedFiles: upload.files.length,
        totalBytes: upload.totalBytes,
        orthancResponse,
        metadataSync: syncResult,
      });
    } catch (error) {
      await metadataRepository.createUploadAudit({
        id: upload.uploadId,
        originalFileCount: upload.files.length,
        totalBytes: upload.totalBytes,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown upload error',
      });

      throw error;
    } finally {
      await rm(upload.tempDir, { recursive: true, force: true });
    }
  }),
);
