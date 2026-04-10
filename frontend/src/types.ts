export type Study = {
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
  firstSeenAt: string;
  updatedAt: string;
};

export type StudyListResponse = {
  studies: Study[];
  total: number;
};

export type UploadResponse = {
  uploadId: string;
  acceptedFiles: number;
  totalBytes: number;
  metadataSync: {
    synced: number;
    skipped: number;
  };
};

