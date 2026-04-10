import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { appConfig } from './config';
import { formatBytes, formatDicomDate, formatDicomTime } from './format';
import type { Study } from './types';
import './styles.css';

type Notice = {
  tone: 'success' | 'error' | 'neutral';
  message: string;
};

const emptyFilters = {
  patientName: '',
  patientId: '',
  accessionNumber: '',
  modality: '',
};

function App() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const selectedSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  const loadStudies = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const response = await api.listStudies({
        patientName: filters.patientName.trim() || undefined,
        patientId: filters.patientId.trim() || undefined,
        accessionNumber: filters.accessionNumber.trim() || undefined,
        modality: filters.modality.trim() || undefined,
      });

      setStudies(response.studies);
      setTotal(response.total);
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load studies.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudies();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadStudies();
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice(null);

    try {
      const response = await api.syncStudies();
      setNotice({
        tone: 'success',
        message: `Metadata sync complete. ${response.synced} studies synced, ${response.skipped} skipped.`,
      });
      await loadStudies();
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to sync metadata.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      setNotice({ tone: 'error', message: 'Choose one or more DICOM files first.' });
      return;
    }

    setUploading(true);
    setNotice(null);

    try {
      const response = await api.uploadDicomFiles(files);
      setFiles([]);
      setNotice({
        tone: 'success',
        message: `Uploaded ${response.acceptedFiles} files with ${formatBytes(
          response.totalBytes,
        )}. ${response.metadataSync.synced} studies synced.`,
      });
      await loadStudies();
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const openInOhif = (studyInstanceUid: string) => {
    const url = new URL('/viewer', appConfig.ohifBaseUrl);
    url.searchParams.set('StudyInstanceUIDs', studyInstanceUid);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="app-shell">
      <section className="top-band" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Orthanc + OHIF</p>
          <h1 id="page-title">DICOM Imaging Worklist</h1>
          <p className="lede">Upload studies to Orthanc, sync metadata to PostgreSQL, and open images in OHIF.</p>
        </div>
        <div className="status-panel" aria-label="Runtime endpoints">
          <span>API {appConfig.apiBaseUrl}</span>
          <span>OHIF {appConfig.ohifBaseUrl}</span>
        </div>
      </section>

      {notice ? <div className={`notice ${notice.tone}`}>{notice.message}</div> : null}

      <section className="action-grid" aria-label="DICOM worklist actions">
        <form className="upload-panel" onSubmit={handleUpload}>
          <h2>Upload DICOM</h2>
          <p>Files are streamed to Orthanc by STOW-RS. PostgreSQL receives metadata only.</p>
          <label className="file-picker">
            <span>Choose DICOM files</span>
            <input
              type="file"
              multiple
              accept=".dcm,application/dicom,application/octet-stream"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          <div className="file-summary">
            <span>{files.length} files selected</span>
            <span>{formatBytes(selectedSize)}</span>
          </div>
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload to Orthanc'}
          </button>
        </form>

        <form className="search-panel" onSubmit={handleSearch}>
          <h2>Find Studies</h2>
          <div className="filters">
            <label>
              Patient name
              <input
                value={filters.patientName}
                onChange={(event) => setFilters((current) => ({ ...current, patientName: event.target.value }))}
                autoComplete="off"
              />
            </label>
            <label>
              Patient ID
              <input
                value={filters.patientId}
                onChange={(event) => setFilters((current) => ({ ...current, patientId: event.target.value }))}
                autoComplete="off"
              />
            </label>
            <label>
              Accession
              <input
                value={filters.accessionNumber}
                onChange={(event) => setFilters((current) => ({ ...current, accessionNumber: event.target.value }))}
                autoComplete="off"
              />
            </label>
            <label>
              Modality
              <input
                value={filters.modality}
                onChange={(event) => setFilters((current) => ({ ...current, modality: event.target.value }))}
                autoComplete="off"
                maxLength={16}
              />
            </label>
          </div>
          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button className="secondary" type="button" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync from Orthanc'}
            </button>
          </div>
        </form>
      </section>

      <section className="study-section" aria-labelledby="studies-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">QIDO metadata</p>
            <h2 id="studies-title">Studies</h2>
          </div>
          <span>{total} total</span>
        </div>

        {loading ? <p className="empty-state">Loading studies...</p> : null}

        {!loading && studies.length === 0 ? (
          <p className="empty-state">No studies found. Upload DICOM files or sync metadata from Orthanc.</p>
        ) : null}

        <div className="study-list">
          {studies.map((study) => (
            <article className="study-card" key={study.studyInstanceUid}>
              <div>
                <p className="study-title">{study.studyDescription || 'Untitled study'}</p>
                <p className="study-subtitle">
                  {study.patientName || 'Unknown patient'} {study.patientId ? `(${study.patientId})` : ''}
                </p>
              </div>
              <dl className="study-meta">
                <div>
                  <dt>Date</dt>
                  <dd>
                    {formatDicomDate(study.studyDate)}
                    {study.studyTime ? ` ${formatDicomTime(study.studyTime)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Modality</dt>
                  <dd>{study.modalities.length ? study.modalities.join(', ') : 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Series</dt>
                  <dd>{study.numberOfSeries ?? 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Instances</dt>
                  <dd>{study.numberOfInstances ?? 'Unknown'}</dd>
                </div>
              </dl>
              <div className="study-footer">
                <code>{study.studyInstanceUid}</code>
                <button type="button" onClick={() => openInOhif(study.studyInstanceUid)}>
                  Open in OHIF
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;

