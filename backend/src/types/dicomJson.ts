export type DicomJsonElement = {
  vr: string;
  Value?: unknown[];
  BulkDataURI?: string;
  InlineBinary?: string;
};

export type DicomJsonDataset = Record<string, DicomJsonElement>;

export type QidoStudy = DicomJsonDataset;

