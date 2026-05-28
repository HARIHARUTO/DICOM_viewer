import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import { appConfig } from './config';
import { formatBytes } from './format';
import type { Study } from './types';
import './styles.css';

type Notice = {
  tone: 'success' | 'error' | 'neutral';
  message: string;
};

type Message = {
  sender: 'doctor' | 'patient' | 'system';
  text?: string;
  fileName?: string;
};

const emptyFilters = {
  patientName: '',
  patientId: '',
  accessionNumber: '',
  modality: '',
};

const modalityIcons: Record<string, string> = {
  CT: '🧠',
  MR: '🧠',
  CR: '🦴',
  DX: '🦴',
  US: '🫀',
  OP: '👁',
  OCT: '👁',
  OPT: '👁',
  OT: '📷',
};

const modalityMap: Record<string, string> = {
  CT: 'CT Scan',
  MR: 'MRI',
  CR: 'X-ray',
  DX: 'X-ray',
  US: 'Ultrasound',
  PT: 'PET Scan',
  OPT: 'Optical Imaging',
  OCT: 'OCT',
  OP: 'Ophthalmic Imaging',
  OT: 'Other Imaging',
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const [role, setRole] = useState<
    'doctor' | 'patient' | 'admin'
  >('patient');

  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';

  const [studies, setStudies] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState(emptyFilters);

  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [notice, setNotice] =
    useState<Notice | null>(null);

  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'doctor',
      text: 'Please upload your scan for review.',
    },
  ]);

  const chatEndRef =
    useRef<HTMLDivElement | null>(null);

  const selectedSize = useMemo(
    () =>
      files.reduce(
        (sum, file) => sum + file.size,
        0,
      ),
    [files],
  );

  useEffect(() => {
    void loadStudies();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  const loadStudies = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const response = await api.listStudies({
        patientName:
          filters.patientName.trim() || undefined,

        patientId:
          filters.patientId.trim() || undefined,

        accessionNumber:
          filters.accessionNumber.trim() ||
          undefined,

        modality:
          filters.modality.trim() || undefined,
      });

      setStudies(response.studies);
      setTotal(response.total);
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load studies.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    void loadStudies();
  };

  const handleSync = async () => {
    setSyncing(true);
    setNotice(null);

    try {
      await api.syncStudies();

      setNotice({
        tone: 'success',
        message: 'Studies synced successfully.',
      });

      await loadStudies();
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to sync metadata.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpload = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (files.length === 0) {
      setNotice({
        tone: 'error',
        message:
          'Choose one or more DICOM files first.',
      });

      return;
    }

    setUploading(true);
    setNotice(null);

    const uploadedFileName =
      files[0]?.name || '';

    try {
      const response =
        await api.uploadDicomFiles(files);

      setFiles([]);

      setNotice({
        tone: 'success',
        message: `Uploaded ${
          response.acceptedFiles
        } files with ${formatBytes(
          response.totalBytes,
        )}. ${
          response.metadataSync.synced
        } studies synced.`,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: '✅ Scan uploaded successfully',
        },
      ]);

      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        let doctorResponse =
          'Scan received. Reviewing now...';

        if (
          uploadedFileName
            .toUpperCase()
            .includes('CT')
        ) {
          doctorResponse =
            'CT scan received. Checking brain structures...';
        } else if (
          uploadedFileName
            .toUpperCase()
            .includes('OCT') ||
          uploadedFileName
            .toUpperCase()
            .includes('OP')
        ) {
          doctorResponse =
            'Eye scan received. Analyzing retina layers...';
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'doctor',
            text: doctorResponse,
          },
        ]);
      }, 1500);

      await loadStudies();
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const openInOhif = (
    studyInstanceUid: string,
  ) => {
    const url = new URL(
      '/viewer',
      appConfig.ohifBaseUrl,
    );

    url.searchParams.set(
      'StudyInstanceUIDs',
      studyInstanceUid,
    );

    window.open(
      url.toString(),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <main className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div>

          <p className="logo-tag">
            ORTHANC + OHIF
          </p>

          <h2 className="logo-title">
            MediView AI
          </h2>

          <div className="role-box">

            <span>Select Role</span>

            <select
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value as
                    | 'doctor'
                    | 'patient'
                    | 'admin',
                )
              }
            >
              <option value="admin">
                Admin
              </option>

              <option value="doctor">
                Doctor
              </option>

              <option value="patient">
                Patient
              </option>
            </select>

          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={`nav-item ${
              activePage === 'dashboard'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('dashboard')
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === 'uploads'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('uploads')
            }
          >
            📤 Uploads
          </button>

          <button
            className={`nav-item ${
              activePage === 'patients'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('patients')
            }
          >
            🧑 Patients
          </button>

          <button
            className={`nav-item ${
              activePage === 'studies'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('studies')
            }
          >
            🩻 Studies
          </button>

          <button
            className={`nav-item ${
              activePage === 'consultation'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage(
                'consultation',
              )
            }
          >
            💬 Consultation
          </button>

          <button
            className={`nav-item ${
              activePage === 'reports'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActivePage('reports')
            }
          >
            📊 Reports
          </button>

        </nav>

      </aside>

      {/* MAIN */}

     <section className="workspace">

  {/* DASHBOARD HERO */}

  {activePage === 'dashboard' && (
    <div className="hero-card">

      <div>

        <p className="hero-badge">
          AI RADIOLOGY WORKSPACE
        </p>

        <h1>
          DICOM Imaging Platform
        </h1>

        <p>
          Upload studies, sync metadata
          to PostgreSQL, and collaborate
          with doctors in real time.
        </p>

      </div>

      <div className="hero-status">

        <div>
          <span>API</span>
          <strong>
            {appConfig.apiBaseUrl}
          </strong>
        </div>

        <div>
          <span>OHIF</span>
          <strong>
            {appConfig.ohifBaseUrl}
          </strong>
        </div>

      </div>

    </div>
  )}

  {/* NOTICE */}

  {notice ? (
    <div className={`notice ${notice.tone}`}>
      {notice.message}
    </div>
  ) : null}

  {/* UPLOADS PAGE */}

  {(activePage === 'dashboard' ||
    activePage === 'uploads') && (

    <div className="workspace-grid">

      {/* UPLOAD */}

      <form
        className="upload-card"
        onSubmit={handleUpload}
      >

        <h2>Upload Scan</h2>

        <p>
          Upload DICOM files securely
          into Orthanc PACS.
        </p>

        <label className="upload-drop">

          <span>
            Choose DICOM files
          </span>

          <input
            type="file"
            multiple
            accept=".dcm,application/dicom,application/octet-stream"
            onChange={(event) => {
              const selected =
                Array.from(
                  event.target.files ?? [],
                );

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

        </label>

        <div className="file-summary">

          <span>
            {files.length} files selected
          </span>

          <span>
            {formatBytes(selectedSize)}
          </span>

        </div>

        <button
          type="submit"
          disabled={uploading}
        >
          {uploading
            ? 'Uploading...'
            : 'Upload to Orthanc'}
        </button>

      </form>

      {/* SEARCH */}

      {!isPatient && (
        <form
          className="search-card"
          onSubmit={handleSearch}
        >

          <h2>Find Studies</h2>

          <div className="filters">

            <label>
              Patient Name

              <input
                value={filters.patientName}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    patientName:
                      event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Patient ID

              <input
                value={filters.patientId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    patientId:
                      event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Accession

              <input
                value={
                  filters.accessionNumber
                }
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    accessionNumber:
                      event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Modality

              <select
                value={filters.modality}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    modality:
                      event.target.value,
                  }))
                }
              >
                <option value="">
                  All
                </option>

                <option value="CT">
                  CT
                </option>

                <option value="MR">
                  MRI
                </option>

                <option value="CR">
                  X-ray
                </option>

                <option value="US">
                  Ultrasound
                </option>

                <option value="OP">
                  Ophthalmic
                </option>

              </select>

            </label>

          </div>

          <div className="button-row">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Searching...'
                : 'Search'}
            </button>

            <button
              className="secondary"
              type="button"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing
                ? 'Syncing...'
                : 'Sync from Orthanc'}
            </button>

          </div>

        </form>
      )}

    </div>
  )}

  {/* PATIENTS PAGE */}

  {activePage === 'patients' && (
    <section className="study-section">

      <div className="section-heading">
        <h2>Patient Directory</h2>
      </div>

      <div className="study-list">

        <div className="study-card">
          <h3>👤 John Doe</h3>
          <p>Patient ID: P1024</p>
          <p>Last Scan: MRI</p>
        </div>

        <div className="study-card">
          <h3>👤 Sarah Smith</h3>
          <p>Patient ID: P2048</p>
          <p>Last Scan: CT</p>
        </div>

        <div className="study-card">
          <h3>👤 Michael Lee</h3>
          <p>Patient ID: P8891</p>
          <p>Last Scan: OCT</p>
        </div>

      </div>

    </section>
  )}

  {/* REPORTS PAGE */}

  {activePage === 'reports' && (
    <section className="study-section">

      <div className="section-heading">
        <h2>AI Reports</h2>
      </div>

      <div className="study-list">

        <div className="study-card">
          <h3>🧠 Brain CT Analysis</h3>
          <p>
            No acute abnormalities detected.
          </p>
        </div>

        <div className="study-card">
          <h3>👁 Retina OCT Analysis</h3>
          <p>
            Mild retinal layer distortion
            observed.
          </p>
        </div>

        <div className="study-card">
          <h3>🫀 Cardiac Ultrasound</h3>
          <p>
            Left ventricle function appears
            within normal limits.
          </p>
        </div>

      </div>

    </section>
  )}

  {/* STUDIES */}

  {!isPatient &&
    (activePage === 'dashboard' ||
      activePage === 'studies') && (

      <section className="study-section">

        <div className="section-heading">

          <h2>
            Recent Studies
          </h2>

          <span>
            {total} total
          </span>

        </div>

        <div className="study-list">

          {studies.map((study) => (
            <article
              className="study-card"
              key={study.studyInstanceUid}
            >

              <div>

                <p className="study-title">
                  {study.studyDescription ||
                    modalityMap[
                      study.modalities[0]
                    ] ||
                    'Scan'}
                </p>

                <p className="study-subtitle">
                  {study.patientName ||
                    'Unknown patient'}
                </p>

              </div>

              <div className="study-tags">

                {study.modalities.map((mod) => (
                  <span
                    key={mod}
                    className="tag"
                  >
                    {modalityIcons[mod]}{' '}
                    {modalityMap[mod] || mod}
                  </span>
                ))}

              </div>

              <div className="study-footer">

                <code>
                  {study.studyInstanceUid.slice(
                    0,
                    30,
                  )}
                  ...
                </code>

                <button
                  type="button"
                  onClick={() =>
                    openInOhif(
                      study.studyInstanceUid,
                    )
                  }
                >
                  🔍 View Scan
                </button>

              </div>

            </article>
          ))}

        </div>

      </section>
    )}

</section>

      {/* CHAT */}

      <aside className="chat-sidebar">

        <section className="chat-panel">

          <div className="chat-header">

            <h2>
              Doctor Consultation
            </h2>

            <span>Online</span>

          </div>

          <div className="chat-box">

            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`chat-row ${msg.sender}`}
                >

                  <div className="chat-bubble">

                    {msg.fileName ? (
                      <div className="file-bubble">
                        📁{' '}
                        {
                          msg.fileName
                        }
                      </div>
                    ) : (
                      msg.text
                    )}

                  </div>

                </div>
              ),
            )}

            {isTyping && (
              <div className="chat-row doctor">

                <div className="chat-bubble typing">
                  Doctor is typing...
                </div>

              </div>
            )}

            <div ref={chatEndRef} />

          </div>

          <form
            onSubmit={handleUpload}
            className="chat-upload"
          >

            <input
              type="file"
              multiple
              onChange={(e) => {
                const selected =
                  Array.from(
                    e.target.files ||
                      [],
                  );

                setFiles(selected);

                if (
                  selected.length > 0
                ) {
                  setMessages(
                    (prev) => [
                      ...prev,
                      {
                        sender:
                          'patient',
                        fileName:
                          selected[0]
                            .name,
                      },
                    ],
                  );
                }
              }}
            />

            <button type="submit">
              {uploading
                ? 'Sending...'
                : 'Send'}
            </button>

          </form>

        </section>

      </aside>

    </main>
  );
}

export default App;