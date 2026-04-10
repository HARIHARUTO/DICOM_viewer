import type { DicomJsonDataset, DicomJsonElement, QidoStudy } from '../types/dicomJson.js';

export type StudyMetadata = {
  studyInstanceUid: string;
  patientId: string | null;
  patientName: string | null;
  patientBirthDate: string | null;
  patientSex: string | null;
  accessionNumber: string | null;
  studyDate: string | null;
  studyTime: string | null;
  studyDescription: string | null;
  referringPhysicianName: string | null;
  modalities: string[];
  studyId: string | null;
  numberOfSeries: number | null;
  numberOfInstances: number | null;
  rawMetadata: DicomJsonDataset;
};

const TAGS = {
  accessionNumber: '00080050',
  modalitiesInStudy: '00080061',
  referringPhysicianName: '00080090',
  studyDate: '00080020',
  studyTime: '00080030',
  studyDescription: '00081030',
  patientName: '00100010',
  patientId: '00100020',
  patientBirthDate: '00100030',
  patientSex: '00100040',
  studyInstanceUid: '0020000D',
  studyId: '00200010',
  numberOfSeries: '00201206',
  numberOfInstances: '00201208',
} as const;

const firstValue = (element?: DicomJsonElement): unknown => element?.Value?.[0];

const dicomValueToString = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    const maybePersonName = value as { Alphabetic?: unknown; Ideographic?: unknown; Phonetic?: unknown };
    const candidate = maybePersonName.Alphabetic ?? maybePersonName.Ideographic ?? maybePersonName.Phonetic;
    return dicomValueToString(candidate);
  }

  return null;
};

const getString = (dataset: DicomJsonDataset, tag: string): string | null =>
  dicomValueToString(firstValue(dataset[tag]));

const getStringArray = (dataset: DicomJsonDataset, tag: string): string[] => {
  const values = dataset[tag]?.Value ?? [];
  return values
    .map((value) => dicomValueToString(value))
    .filter((value): value is string => Boolean(value));
};

const getNumber = (dataset: DicomJsonDataset, tag: string): number | null => {
  const value = firstValue(dataset[tag]);
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const mapQidoStudyToMetadata = (study: QidoStudy): StudyMetadata => {
  const studyInstanceUid = getString(study, TAGS.studyInstanceUid);

  if (!studyInstanceUid) {
    throw new Error('QIDO-RS study is missing StudyInstanceUID (0020000D).');
  }

  return {
    studyInstanceUid,
    patientId: getString(study, TAGS.patientId),
    patientName: getString(study, TAGS.patientName),
    patientBirthDate: getString(study, TAGS.patientBirthDate),
    patientSex: getString(study, TAGS.patientSex),
    accessionNumber: getString(study, TAGS.accessionNumber),
    studyDate: getString(study, TAGS.studyDate),
    studyTime: getString(study, TAGS.studyTime),
    studyDescription: getString(study, TAGS.studyDescription),
    referringPhysicianName: getString(study, TAGS.referringPhysicianName),
    modalities: getStringArray(study, TAGS.modalitiesInStudy),
    studyId: getString(study, TAGS.studyId),
    numberOfSeries: getNumber(study, TAGS.numberOfSeries),
    numberOfInstances: getNumber(study, TAGS.numberOfInstances),
    rawMetadata: study,
  };
};

