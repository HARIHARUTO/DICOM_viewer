import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

describe('createApp CORS configuration', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgres://dicom_app:dicom_app_password@localhost:5432/dicom_metadata';
    process.env.ORTHANC_DICOMWEB_URL = 'http://localhost:8042/dicom-web';
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:3001';

    const module = await import('./app.js');
    app = module.createApp();
  });

  it('allows configured browser origins', async () => {
    const response = await request(app)
      .get('/health/live')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('does not emit CORS headers for unconfigured origins', async () => {
    const response = await request(app)
      .get('/health/live')
      .set('Origin', 'http://evil.example');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
