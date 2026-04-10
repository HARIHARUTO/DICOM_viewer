export const schemaSql = `
CREATE TABLE IF NOT EXISTS studies (
  study_instance_uid TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  patient_birth_date TEXT,
  patient_sex TEXT,
  accession_number TEXT,
  study_date TEXT,
  study_time TEXT,
  study_description TEXT,
  referring_physician_name TEXT,
  modalities TEXT[] NOT NULL DEFAULT '{}',
  study_id TEXT,
  number_of_series INTEGER,
  number_of_instances INTEGER,
  raw_metadata JSONB NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS studies_patient_id_idx ON studies (patient_id);
CREATE INDEX IF NOT EXISTS studies_patient_name_idx ON studies (patient_name);
CREATE INDEX IF NOT EXISTS studies_accession_number_idx ON studies (accession_number);
CREATE INDEX IF NOT EXISTS studies_study_date_idx ON studies (study_date);
CREATE INDEX IF NOT EXISTS studies_modalities_gin_idx ON studies USING GIN (modalities);

CREATE TABLE IF NOT EXISTS upload_audit (
  id UUID PRIMARY KEY,
  original_file_count INTEGER NOT NULL,
  total_bytes BIGINT NOT NULL,
  status TEXT NOT NULL,
  orthanc_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

