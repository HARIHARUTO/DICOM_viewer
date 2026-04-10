import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { request } from 'undici';
import { HttpError } from '../errors.js';
import type { QidoStudy } from '../types/dicomJson.js';
import type { DicomTempFile } from '../utils/multipartRelated.js';
import { createMultipartRelatedBody } from '../utils/multipartRelated.js';

type QueryStudiesInput = {
  limit?: number;
  offset?: number;
  patientName?: string;
  patientId?: string;
  accessionNumber?: string;
  studyInstanceUid?: string;
  modality?: string;
  studyDate?: string;
};

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export class DicomwebClient {
  constructor(
    private readonly baseUrl: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  private authorizationHeader(): string {
    return `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
  }

  private buildUrl(pathAndQuery: string): string {
    const normalizedPath = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  async queryStudies(input: QueryStudiesInput = {}): Promise<QidoStudy[]> {
    const params = new URLSearchParams();
    params.set('includefield', 'all');

    if (input.limit !== undefined) {
      params.set('limit', String(input.limit));
    }

    if (input.offset !== undefined) {
      params.set('offset', String(input.offset));
    }

    if (input.patientName) {
      params.set('PatientName', input.patientName);
    }

    if (input.patientId) {
      params.set('PatientID', input.patientId);
    }

    if (input.accessionNumber) {
      params.set('AccessionNumber', input.accessionNumber);
    }

    if (input.studyInstanceUid) {
      params.set('StudyInstanceUID', input.studyInstanceUid);
    }

    if (input.modality) {
      params.set('ModalitiesInStudy', input.modality);
    }

    if (input.studyDate) {
      params.set('StudyDate', input.studyDate);
    }

    const response = await request(this.buildUrl(`/studies?${params.toString()}`), {
      method: 'GET',
      headers: {
        accept: 'application/dicom+json, application/json',
        authorization: this.authorizationHeader(),
      },
    });

    const bodyText = await response.body.text();

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new HttpError(response.statusCode, 'QIDO-RS study query failed.', bodyText);
    }

    if (!bodyText.trim()) {
      return [];
    }

    return JSON.parse(bodyText) as QidoStudy[];
  }

  async stowDicomFiles(files: DicomTempFile[]): Promise<unknown> {
    if (files.length === 0) {
      throw new HttpError(400, 'No DICOM files were provided for STOW-RS upload.');
    }

    const boundary = `dicom-stow-${randomUUID()}`;
    const response = await request(this.buildUrl('/studies'), {
      method: 'POST',
      headers: {
        accept: 'application/dicom+json, application/json',
        authorization: this.authorizationHeader(),
        'content-type': `multipart/related; type="application/dicom"; boundary=${boundary}`,
      },
      body: Readable.from(createMultipartRelatedBody(files, boundary)),
    });

    const bodyText = await response.body.text();

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new HttpError(response.statusCode, 'STOW-RS upload failed.', bodyText);
    }

    if (!bodyText.trim()) {
      return { status: 'accepted' };
    }

    try {
      return JSON.parse(bodyText);
    } catch {
      return { status: 'accepted', response: bodyText };
    }
  }

  async proxyReadOnly(req: IncomingMessage, res: ServerResponse, pathAndQuery: string): Promise<void> {
    const headers: Record<string, string> = {
      authorization: this.authorizationHeader(),
    };

    for (const headerName of ['accept', 'accept-language', 'range', 'if-none-match', 'if-modified-since', 'if-range']) {
      const value = req.headers[headerName];
      if (typeof value === 'string') {
        headers[headerName] = value;
      }
    }

    const method = req.method === 'HEAD' ? 'HEAD' : 'GET';
    const response = await request(this.buildUrl(pathAndQuery), {
      method,
      headers,
    });

    res.statusCode = response.statusCode;

    for (const [name, value] of Object.entries(response.headers)) {
      const lowerName = name.toLowerCase();
      if (hopByHopHeaders.has(lowerName) || value === undefined) {
        continue;
      }

      res.setHeader(name, value);
    }

    response.body.pipe(res);
  }
}
