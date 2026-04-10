import { config } from '../config.js';
import { DicomwebClient } from './dicomwebClient.js';
import { MetadataRepository } from './metadataRepository.js';
import { StudySyncService } from './studySyncService.js';

export const dicomwebClient = new DicomwebClient(
  config.orthancDicomwebUrl,
  config.orthancUsername,
  config.orthancPassword,
);

export const metadataRepository = new MetadataRepository();

export const studySyncService = new StudySyncService(dicomwebClient, metadataRepository);

