import { describe, expect, it } from 'vitest';
import { mapQidoStudyToMetadata } from './metadataMapper.js';

describe('mapQidoStudyToMetadata', () => {
  it('maps common QIDO-RS DICOM JSON tags into database metadata', () => {
    const metadata = mapQidoStudyToMetadata({
      '0020000D': { vr: 'UI', Value: ['1.2.3'] },
      '00100010': { vr: 'PN', Value: [{ Alphabetic: 'Doe^Jane' }] },
      '00100020': { vr: 'LO', Value: ['PAT-7'] },
      '00080050': { vr: 'SH', Value: ['ACC-42'] },
      '00080020': { vr: 'DA', Value: ['20260410'] },
      '00080061': { vr: 'CS', Value: ['CT', 'MR'] },
      '00201206': { vr: 'IS', Value: [2] },
      '00201208': { vr: 'IS', Value: ['128'] },
    });

    expect(metadata).toMatchObject({
      studyInstanceUid: '1.2.3',
      patientName: 'Doe^Jane',
      patientId: 'PAT-7',
      accessionNumber: 'ACC-42',
      studyDate: '20260410',
      modalities: ['CT', 'MR'],
      numberOfSeries: 2,
      numberOfInstances: 128,
    });
  });

  it('rejects QIDO-RS studies without a StudyInstanceUID', () => {
    expect(() => mapQidoStudyToMetadata({})).toThrow(/StudyInstanceUID/);
  });
});

