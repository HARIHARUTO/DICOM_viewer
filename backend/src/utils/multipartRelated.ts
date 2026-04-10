import { createReadStream } from 'node:fs';

export type DicomTempFile = {
  path: string;
  filename: string;
  size: number;
  mimeType?: string;
};

export const createMultipartRelatedBody = async function* (
  files: DicomTempFile[],
  boundary: string,
): AsyncGenerator<Buffer> {
  for (const file of files) {
    yield Buffer.from(`--${boundary}\r\n`);
    yield Buffer.from('Content-Type: application/dicom\r\n');
    yield Buffer.from(`Content-Location: ${encodeURIComponent(file.filename)}\r\n\r\n`);

    for await (const chunk of createReadStream(file.path)) {
      yield Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    }

    yield Buffer.from('\r\n');
  }

  yield Buffer.from(`--${boundary}--\r\n`);
};

