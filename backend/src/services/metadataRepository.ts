import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import type { StudyMetadata } from './metadataMapper.js';

export const studyListQuerySchema = z.object({
  patientName: z.string().trim().min(1).optional(),
  patientId: z.string().trim().min(1).optional(),
  accessionNumber: z.string().trim().min(1).optional(),
  modality: z.string().trim().min(1).max(16).optional(),
  studyDateFrom: z.string().regex(/^\d{8}$/).optional(),
  studyDateTo: z.string().regex(/^\d{8}$/).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type StudyListQuery = z.infer<typeof studyListQuerySchema>;

export type StudyRow = {
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
  rawMetadata: unknown;
  firstSeenAt: string;
  updatedAt: string;
};

const mapRow = (row: Record<string, unknown>): StudyRow => ({
  studyInstanceUid: row.study_instance_uid as string,
  patientId: (row.patient_id as string | null) ?? null,
  patientName: (row.patient_name as string | null) ?? null,
  patientBirthDate: (row.patient_birth_date as string | null) ?? null,
  patientSex: (row.patient_sex as string | null) ?? null,
  accessionNumber: (row.accession_number as string | null) ?? null,
  studyDate: (row.study_date as string | null) ?? null,
  studyTime: (row.study_time as string | null) ?? null,
  studyDescription: (row.study_description as string | null) ?? null,
  referringPhysicianName: (row.referring_physician_name as string | null) ?? null,
  modalities: (row.modalities as string[]) ?? [],
  studyId: (row.study_id as string | null) ?? null,
  numberOfSeries: (row.number_of_series as number | null) ?? null,
  numberOfInstances: (row.number_of_instances as number | null) ?? null,
  rawMetadata: row.raw_metadata,
  firstSeenAt: (row.first_seen_at as Date).toISOString(),
  updatedAt: (row.updated_at as Date).toISOString(),
});

export class MetadataRepository {
  constructor(private readonly db: Pool = pool) {}

  async upsertStudies(studies: StudyMetadata[], client?: PoolClient): Promise<number> {
    const executor = client ?? this.db;

    for (const study of studies) {
      await executor.query(
        `
        INSERT INTO studies (
          study_instance_uid,
          patient_id,
          patient_name,
          patient_birth_date,
          patient_sex,
          accession_number,
          study_date,
          study_time,
          study_description,
          referring_physician_name,
          modalities,
          study_id,
          number_of_series,
          number_of_instances,
          raw_metadata
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15
        )
        ON CONFLICT (study_instance_uid) DO UPDATE SET
          patient_id = EXCLUDED.patient_id,
          patient_name = EXCLUDED.patient_name,
          patient_birth_date = EXCLUDED.patient_birth_date,
          patient_sex = EXCLUDED.patient_sex,
          accession_number = EXCLUDED.accession_number,
          study_date = EXCLUDED.study_date,
          study_time = EXCLUDED.study_time,
          study_description = EXCLUDED.study_description,
          referring_physician_name = EXCLUDED.referring_physician_name,
          modalities = EXCLUDED.modalities,
          study_id = EXCLUDED.study_id,
          number_of_series = EXCLUDED.number_of_series,
          number_of_instances = EXCLUDED.number_of_instances,
          raw_metadata = EXCLUDED.raw_metadata,
          updated_at = NOW()
        `,
        [
          study.studyInstanceUid,
          study.patientId,
          study.patientName,
          study.patientBirthDate,
          study.patientSex,
          study.accessionNumber,
          study.studyDate,
          study.studyTime,
          study.studyDescription,
          study.referringPhysicianName,
          study.modalities,
          study.studyId,
          study.numberOfSeries,
          study.numberOfInstances,
          study.rawMetadata,
        ],
      );
    }

    return studies.length;
  }

  async listStudies(query: StudyListQuery): Promise<{ studies: StudyRow[]; total: number }> {
    const where: string[] = [];
    const values: unknown[] = [];

    const addValue = (value: unknown) => {
      values.push(value);
      return `$${values.length}`;
    };

    if (query.patientName) {
      where.push(`patient_name ILIKE ${addValue(`%${query.patientName}%`)}`);
    }

    if (query.patientId) {
      where.push(`patient_id = ${addValue(query.patientId)}`);
    }

    if (query.accessionNumber) {
      where.push(`accession_number = ${addValue(query.accessionNumber)}`);
    }

    if (query.modality) {
      where.push(`${addValue(query.modality.toUpperCase())} = ANY(modalities)`);
    }

    if (query.studyDateFrom) {
      where.push(`study_date >= ${addValue(query.studyDateFrom)}`);
    }

    if (query.studyDateTo) {
      where.push(`study_date <= ${addValue(query.studyDateTo)}`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const filterValues = [...values];
    const limitParam = addValue(query.limit);
    const offsetParam = addValue(query.offset);

    const [items, count] = await Promise.all([
      this.db.query(
        `
        SELECT *
        FROM studies
        ${whereSql}
        ORDER BY COALESCE(study_date, '') DESC, updated_at DESC
        LIMIT ${limitParam}
        OFFSET ${offsetParam}
        `,
        values,
      ),
      this.db.query(
        `
        SELECT COUNT(*)::INTEGER AS total
        FROM studies
        ${whereSql}
        `,
        filterValues,
      ),
    ]);

    return {
      studies: items.rows.map(mapRow),
      total: count.rows[0].total as number,
    };
  }

  async getStudy(studyInstanceUid: string): Promise<StudyRow | null> {
    const result = await this.db.query('SELECT * FROM studies WHERE study_instance_uid = $1', [studyInstanceUid]);
    return result.rowCount ? mapRow(result.rows[0]) : null;
  }

  async createUploadAudit(input: {
    id: string;
    originalFileCount: number;
    totalBytes: number;
    status: 'accepted' | 'failed';
    orthancResponse?: unknown;
    errorMessage?: string;
  }): Promise<void> {
    await this.db.query(
      `
      INSERT INTO upload_audit (
        id,
        original_file_count,
        total_bytes,
        status,
        orthanc_response,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        input.id,
        input.originalFileCount,
        input.totalBytes,
        input.status,
        input.orthancResponse ?? null,
        input.errorMessage ?? null,
      ],
    );
  }
}

