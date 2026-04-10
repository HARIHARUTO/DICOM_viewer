import { appConfig } from './config';
import type { StudyListResponse, UploadResponse } from './types';

type StudyQuery = {
  patientName?: string;
  patientId?: string;
  accessionNumber?: string;
  modality?: string;
};

const buildUrl = (path: string, query?: Record<string, string | undefined>) => {
  const url = new URL(`${appConfig.apiBaseUrl}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url;
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
};

export const api = {
  async listStudies(query: StudyQuery): Promise<StudyListResponse> {
    const response = await fetch(buildUrl('/studies', query));
    return parseJsonResponse<StudyListResponse>(response);
  },

  async syncStudies(): Promise<{ synced: number; skipped: number }> {
    const response = await fetch(buildUrl('/studies/sync'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseJsonResponse<{ synced: number; skipped: number }>(response);
  },

  async uploadDicomFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));

    const response = await fetch(buildUrl('/studies/upload'), {
      method: 'POST',
      body: formData,
    });

    return parseJsonResponse<UploadResponse>(response);
  },
};

