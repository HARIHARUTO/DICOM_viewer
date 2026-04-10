# DICOM Viewer Platform

Production-grade DICOM web platform using:

- React for the upload/search worklist
- OHIF Viewer for all image rendering
- Express for metadata APIs and secure DICOMweb gatewaying
- PostgreSQL for metadata only
- Orthanc for DICOM storage and DICOMweb
- Docker Compose for local infrastructure

This project deliberately does not build a DICOM viewer from scratch. DICOM files are stored by Orthanc, not PostgreSQL. PostgreSQL stores study metadata received through QIDO-RS.

## Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── infra/
│   └── ohif/
│       └── app-config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Where Code Lives

- `backend/src/routes/uploads.ts`: accepts browser uploads and sends them to Orthanc with STOW-RS.
- `backend/src/routes/studies.ts`: reads PostgreSQL metadata and triggers QIDO-RS metadata sync.
- `backend/src/routes/dicomwebProxy.ts`: read-only DICOMweb gateway for OHIF QIDO-RS and WADO-RS calls.
- `backend/src/db/schema.ts`: PostgreSQL tables for metadata and upload audit records. It does not contain DICOM pixel data.
- `frontend/src/App.tsx`: React worklist, upload form, study search, and OHIF launch button.
- `infra/ohif/app-config.js`: OHIF configuration pointing to the backend DICOMweb gateway.
- `docker-compose.yml`: PostgreSQL, Orthanc, backend, frontend, and OHIF services.

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

Open:

- React worklist: http://localhost:3000
- OHIF Viewer: http://localhost:3001
- Backend health: http://localhost:4000/health/ready
- Orthanc admin: http://localhost:8042 with `orthanc` / `orthanc`

## Run Locally

Start PostgreSQL and Orthanc:

```bash
docker compose up postgres orthanc
```

Install dependencies:

```bash
npm run install:all
```

Run backend:

```powershell
cd backend
$env:DATABASE_URL="postgres://dicom_app:dicom_app_password@localhost:5432/dicom_metadata"
$env:ORTHANC_DICOMWEB_URL="http://localhost:8042/dicom-web"
$env:ORTHANC_USERNAME="orthanc"
$env:ORTHANC_PASSWORD="orthanc"
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Run OHIF:

```bash
docker compose up ohif
```

## Test

```bash
npm run backend:test
npm run frontend:test
npm run build
```

## API

Upload DICOM files through STOW-RS:

```bash
curl -X POST http://localhost:4000/api/studies/upload \
  -F "files=@/path/to/image1.dcm" \
  -F "files=@/path/to/image2.dcm"
```

Sync metadata from Orthanc through QIDO-RS:

```bash
curl -X POST http://localhost:4000/api/studies/sync
```

List metadata from PostgreSQL:

```bash
curl "http://localhost:4000/api/studies?patientName=Doe&modality=CT"
```

OHIF uses WADO-RS and QIDO-RS through:

```text
http://localhost:4000/api/dicomweb
```

## Edge Cases

- Large uploads are capped by `MAX_UPLOAD_BYTES`; files are streamed to temporary disk and removed after STOW-RS completes.
- Empty files are ignored; an upload with no non-empty files returns HTTP 400.
- Orthanc upload failures are recorded in `upload_audit` without storing DICOM data in PostgreSQL.
- Studies missing `StudyInstanceUID` in QIDO-RS responses are skipped during metadata sync.
- OHIF is the only component that renders DICOM images; the React app only launches OHIF.
- Backend DICOMweb proxy is read-only for OHIF. Uploads must go through `/api/studies/upload`.
- PostgreSQL stores DICOM JSON metadata and normalized search fields only, never DICOM files or pixel data.
