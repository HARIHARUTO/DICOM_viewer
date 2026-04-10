import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createMultipartRelatedBody } from './multipartRelated.js';

describe('createMultipartRelatedBody', () => {
  it('creates a DICOM multipart/related body without storing DICOM in the database', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'multipart-test-'));
    const dicomPath = path.join(tempDir, 'image.dcm');

    try {
      await writeFile(dicomPath, Buffer.from('DICM-CONTENT'));
      const chunks: Buffer[] = [];

      for await (const chunk of createMultipartRelatedBody(
        [{ path: dicomPath, filename: 'image.dcm', size: 12 }],
        'boundary-test',
      )) {
        chunks.push(chunk);
      }

      const body = Buffer.concat(chunks).toString('utf8');
      expect(body).toContain('--boundary-test');
      expect(body).toContain('Content-Type: application/dicom');
      expect(body).toContain('DICM-CONTENT');
      expect(body.endsWith('--boundary-test--\r\n')).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

