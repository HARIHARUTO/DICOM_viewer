import { FormEvent, useEffect, useMemo, useState, useRef } from 'react';
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

const modalityIcons: Record<string, string> = {
  CT: "🧠",
  MR: "🧠",
  CR: "🦴",
  DX: "🦴",
  US: "🫀",
  OP: "👁",
  OCT: "👁",
  OPT: "👁",
  OT: "📷",
};

const modalityMap: Record<string, string> = {
  CT: "CT Scan",
  MR: "MRI",
  CR: "X-ray",
  DX: "X-ray",
  US: "Ultrasound",
  PT: "PET Scan",
  OPT: "Optical Imaging",
  OCT: "OCT",
  OP: "Ophthalmic Imaging",
  OT: "Other Imaging",
};

type Message = {
  sender: 'doctor' | 'patient' | 'system';
  text?: string;
  fileName?: string;
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
const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  { sender: 'doctor', text: 'Please upload your scan for review.' },
]);[]
>([
  { sender: 'doctor', text: 'Please upload your scan for review.' },
]);
const chatEndRef = useRef<HTMLDivElement | null>(null);
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

useEffect(() => {
  void loadStudies();
}, []);

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, isTyping]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadStudies();
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice(null);

    try {
      const response = await api.syncStudies();
      setMessages((prev) => [
  ...prev,
]);
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

setMessages((prev) => [
  ...prev,
  { sender: 'system', text: '✅ Scan uploaded successfully' },
]);

// show typing
setIsTyping(true);

// simulate doctor delay
setTimeout(() => {
  setIsTyping(false);

  const fileName = files[0]?.name || '';

  let response = 'Scan received. Reviewing now...';

  if (fileName.includes('CT')) {
    response = 'CT scan received. Checking brain structures...';
  } else if (fileName.includes('OCT') || fileName.includes('OP')) {
    response = 'Eye scan received. Analyzing retina layers...';
  }

  setMessages((prev) => [
    ...prev,
    { sender: 'doctor', text: response },
  ]);
}, 1500);

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
    <div className="layout">

      {/* LEFT SIDE */}
      <div className="main-content">

        <section className="top-band" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Orthanc + OHIF</p>
            <h1 id="page-title">DICOM Imaging Worklist</h1>
            <p className="lede">
              Upload studies to Orthanc, sync metadata to PostgreSQL, and open images in OHIF.
            </p>
          </div>
          <div className="status-panel">
            <span>API {appConfig.apiBaseUrl}</span>
            <span>OHIF {appConfig.ohifBaseUrl}</span>
          </div>
        </section>

        {notice ? (
          <div className={`notice ${notice.tone}`}>
            {notice.message}
          </div>
        ) : null}

        {/* UPLOAD + SEARCH */}
        <section className="action-grid" aria-label="DICOM worklist actions">

          {/* Upload */}
          <form className="upload-panel" onSubmit={handleUpload}>
            <h2>Upload DICOM</h2>
            <p>Files are streamed to Orthanc by STOW-RS. PostgreSQL receives metadata only.</p>

            <label className="file-picker">
              <span>Choose DICOM files</span>
              <input
                type="file"
                multiple
                accept=".dcm,application/dicom,application/octet-stream"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []))
                }
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

          {/* Search */}
          <form className="search-panel" onSubmit={handleSearch}>
            <h2>Find Studies</h2>

            <div className="filters">
              <label>
                Patient name
                <input
                  value={filters.patientName}
                  onChange={(e) =>
                    setFilters((c) => ({ ...c, patientName: e.target.value }))
                  }
                />
              </label>

              <label>
                Patient ID
                <input
                  value={filters.patientId}
                  onChange={(e) =>
                    setFilters((c) => ({ ...c, patientId: e.target.value }))
                  }
                />
              </label>

              <label>
                Accession
                <input
                  value={filters.accessionNumber}
                  onChange={(e) =>
                    setFilters((c) => ({ ...c, accessionNumber: e.target.value }))
                  }
                />
              </label>

              <label>
                Modality
                <select
                  value={filters.modality}
                  onChange={(e) =>
                    setFilters((c) => ({ ...c, modality: e.target.value }))
                  }
                >
                  <option value="">All</option>
                  <option value="CT">CT</option>
                  <option value="MR">MRI</option>
                  <option value="CR">X-ray</option>
                  <option value="US">Ultrasound</option>
                  <option value="OP">Ophthalmic</option>
                </select>
              </label>
            </div>

            <div className="button-row">
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync from Orthanc'}
              </button>
            </div>
          </form>

        </section>

        {/* STUDIES */}
        <section className="study-section">
          <div className="section-heading">
            <h2>Studies</h2>
            <span>{total} total</span>
          </div>

          {loading && <p>Loading studies...</p>}

          {!loading && studies.length === 0 && (
            <p>No scans available</p>
          )}

          <div className="study-list">
            {studies.map((study) => (
              <div key={study.studyInstanceUid} className="study-card">

                <p className="study-title">
                  {study.studyDescription ||
                    `${modalityMap[study.modalities[0]] || 'Scan'} ${
                      study.studyDate ? `• ${formatDicomDate(study.studyDate)}` : ''
                    }`}
                </p>

                <p className="study-subtitle">
                  {study.patientName || 'Unknown patient'}
                </p>

                <button onClick={() => openInOhif(study.studyInstanceUid)}>
                  🔍 View Scan
                </button>

              </div>
            ))}
          </div>
        </section>

      </div>

      {/* RIGHT SIDE CHAT */}
      <div className="chat-sidebar">

        <section className="chat-panel">
          <h2>Consultation Chat</h2>

          <div className="chat-box">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-row ${msg.sender}`}>
                <div className="chat-bubble">
  {msg.fileName ? (
    <div className="file-bubble">
      📁 {msg.fileName}
    </div>
  ) : (
    msg.text
  )}
</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-row doctor">
                <div className="chat-bubble typing">
                  Doctor is typing...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleUpload} className="chat-upload">
  <input
    type="file"
    multiple
    onChange={(e) => {
      const selected = Array.from(e.target.files || []);
      setFiles(selected);

      if (selected.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'patient',
            fileName: selected[0].name,
          },
        ]);
      }
    }}
  />

  <button type="submit">
    {uploading ? 'Sending...' : 'Send Scan'}
  </button>
</form>
        </section>

      </div>

    </div>
  </main>
);
}

export default App;

