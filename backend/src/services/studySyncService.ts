import { config } from '../config.js';
import type { QidoStudy } from '../types/dicomJson.js';
import { DicomwebClient } from './dicomwebClient.js';
import { mapQidoStudyToMetadata } from './metadataMapper.js';
import { MetadataRepository } from './metadataRepository.js';

export class StudySyncService {
  constructor(
    private readonly dicomwebClient: DicomwebClient,
    private readonly metadataRepository: MetadataRepository,
  ) {}

  async syncAllStudies(): Promise<{ synced: number; skipped: number }> {
    let offset = 0;
    let synced = 0;
    let skipped = 0;

    while (offset < config.qidoMaxSyncStudies) {
      const qidoStudies = await this.dicomwebClient.queryStudies({
        limit: config.qidoPageSize,
        offset,
      });

      if (qidoStudies.length === 0) {
        break;
      }

      const mapped = this.mapStudiesSafely(qidoStudies);
      skipped += qidoStudies.length - mapped.length;
      synced += await this.metadataRepository.upsertStudies(mapped);

      if (qidoStudies.length < config.qidoPageSize) {
        break;
      }

      offset += config.qidoPageSize;
    }

    return { synced, skipped };
  }

  async syncStudy(studyInstanceUid: string): Promise<{ synced: number; skipped: number }> {
    const qidoStudies = await this.dicomwebClient.queryStudies({ studyInstanceUid, limit: 1 });
    const mapped = this.mapStudiesSafely(qidoStudies);
    return {
      synced: await this.metadataRepository.upsertStudies(mapped),
      skipped: qidoStudies.length - mapped.length,
    };
  }

  private mapStudiesSafely(qidoStudies: QidoStudy[]) {
    return qidoStudies.flatMap((study) => {
      try {
        return [mapQidoStudyToMetadata(study)];
      } catch {
        return [];
      }
    });
  }
}

