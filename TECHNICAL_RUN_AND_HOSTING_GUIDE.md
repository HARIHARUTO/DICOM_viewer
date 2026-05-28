# Technical Guide, Running Steps, and Hosting

## 1. Technology Used

## Frontend

- React for the browser dashboard.
- TypeScript for typed frontend code.
- Vite for frontend development and production build.
- CSS for UI styling.
- React Testing Library and Vitest for frontend testing.

## Backend

- Node.js with Express for the API service.
- TypeScript for backend code.
- Busboy for multipart DICOM upload handling.
- Undici for HTTP calls to Orthanc DICOMweb APIs.
- Zod for request/config validation.
- Pino for structured logging.
- Vitest and Supertest for backend testing.

## Medical Imaging Stack

- Orthanc as the PACS/DICOM server.
- Orthanc DICOMweb plugin for STOW-RS, QIDO-RS, and WADO-RS.
- OHIF Viewer as the zero-footprint browser DICOM viewer.
- DICOMweb standards:
  - STOW-RS for upload.
  - QIDO-RS for metadata query.
  - WADO-RS for image retrieval.

## Database

- PostgreSQL for searchable metadata.
- DICOM files and pixel data are not stored in PostgreSQL.
- Orthanc remains responsible for DICOM object storage.

## Infrastructure

- Docker Compose for local multi-container setup.
- Separate containers for frontend, backend, PostgreSQL, Orthanc, and OHIF.
- Nginx serves the production frontend build.

## 2. How to Run the Project

## Prerequisites

Install:

- Docker Desktop.
- Docker Compose.
- Node.js 20 or later.
- npm.
- Git.

On Windows, Docker Desktop should be running with Linux containers enabled.

## Environment Setup

From the project root:

```powershell
Copy-Item .env.example .env
```

Important environment values:

```env
POSTGRES_DB=dicom_metadata
POSTGRES_USER=dicom_app
POSTGRES_PASSWORD=dicom_app_password
POSTGRES_PORT=5432
DATABASE_URL=postgres://dicom_app:dicom_app_password@localhost:5432/dicom_metadata

ORTHANC_USERNAME=orthanc
ORTHANC_PASSWORD=orthanc
ORTHANC_HTTP_PORT=8042
ORTHANC_DICOMWEB_URL=http://localhost:8042/dicom-web

BACKEND_PORT=4000
FRONTEND_PORT=3000
OHIF_PORT=3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Run With Docker Compose

From the project root:

```powershell
docker compose up --build -d
```

Check running containers:

```powershell
docker compose ps -a
```

Stop the stack:

```powershell
docker compose down
```

Stop and remove volumes:

```powershell
docker compose down -v
```

## Run Locally for Development

Start only PostgreSQL and Orthanc:

```powershell
docker compose up postgres orthanc -d
```

Install dependencies:

```powershell
npm run install:all
```

Run backend migration:

```powershell
cd backend
npm run migrate
```

Start backend:

```powershell
npm run dev
```

In a second terminal, start frontend:

```powershell
cd frontend
npm run dev
```

Start OHIF through Docker:

```powershell
docker compose up ohif -d
```

## Testing and Validation

Run all tests:

```powershell
npm test
```

Run production build validation:

```powershell
npm run build
```

Run backend tests only:

```powershell
npm run backend:test
```

Run frontend tests only:

```powershell
npm run frontend:test
```

Validate Docker Compose configuration:

```powershell
docker compose config
```

Run dependency audit:

```powershell
cd backend
npm audit

cd ..\frontend
npm audit
```

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health/live` | Confirms backend process is running. |
| `GET /health/ready` | Checks backend, PostgreSQL, and Orthanc DICOMweb readiness. |
| `POST /api/studies/upload` | Uploads DICOM files to Orthanc through the backend. |
| `GET /api/studies` | Lists synchronized study metadata. |
| `POST /api/studies/sync` | Syncs metadata from Orthanc to PostgreSQL. |
| `/api/dicomweb/*` | Read-only DICOMweb gateway for OHIF. |

## 3. Local Hosting and Web Hosting

## Local Hosting

The easiest local hosting method is Docker Compose.

After running:

```powershell
docker compose up --build -d
```

Open:

| Service | URL |
|---|---|
| Frontend dashboard | `http://localhost:3000` |
| OHIF Viewer | `http://localhost:3001` |
| Backend API | `http://localhost:4000` |
| Backend live health | `http://localhost:4000/health/live` |
| Backend ready health | `http://localhost:4000/health/ready` |
| Orthanc Admin | `http://localhost:8042` |

Default Orthanc login:

```text
Username: orthanc
Password: orthanc
```

For demo day, the recommended local setup is:

1. Start Docker Desktop.
2. Run `docker compose up --build -d`.
3. Open `http://localhost:3000`.
4. Upload sample DICOM files.
5. Sync metadata if needed.
6. Select a doctor/admin role.
7. Open a study in OHIF.

## Web Hosting Options

This project has multiple services, so it should not be hosted as only a static website. The frontend can be hosted separately, but the full system also needs backend hosting, PostgreSQL, Orthanc storage, and OHIF.

Recommended production-style hosting options:

| Component | Hosting Option |
|---|---|
| Frontend | Netlify, Vercel, static Nginx server, or cloud object hosting with CDN. |
| Backend | Render, Railway, Fly.io, AWS ECS, Azure Container Apps, Google Cloud Run, or a VPS. |
| PostgreSQL | Managed PostgreSQL from Render, Neon, Supabase, AWS RDS, Azure Database, or Google Cloud SQL. |
| Orthanc | VPS or container platform with persistent volume storage. |
| OHIF | Static hosting or container hosting. |

## Simple Web Deployment Architecture

```text
User Browser
  |
  v
Frontend Hosting
  |
  v
Backend API Hosting
  |
  |-- PostgreSQL Metadata Database
  |
  |-- Orthanc PACS with Persistent Storage
  |
  `-- OHIF Viewer
```

## Important Web Hosting Notes

- Orthanc needs persistent storage. Do not deploy it on a temporary filesystem.
- PostgreSQL should be managed or backed up regularly.
- Replace all default credentials before hosting publicly.
- Use HTTPS for frontend, backend, OHIF, and Orthanc access.
- Restrict direct public access to Orthanc Admin.
- Add authentication and role-based access before using real users.
- Do not upload real patient data without privacy, legal, clinical, and security review.
- Configure CORS for the real frontend and OHIF URLs.
- Store secrets in hosting provider environment variables, not in code.

## Example Production Environment Variables

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://user:password@db-host:5432/dicom_metadata
ORTHANC_DICOMWEB_URL=https://orthanc.example.com/dicom-web
ORTHANC_USERNAME=secure-user
ORTHANC_PASSWORD=secure-password
CORS_ORIGINS=https://app.example.com,https://ohif.example.com
MAX_UPLOAD_FILES=200
MAX_UPLOAD_BYTES=1073741824
```

## Suggested Hosting Path for a Student Demo

For a college demo or resume project, local Docker hosting is the safest and most reliable option.

For a public portfolio deployment:

1. Host the frontend as a static site.
2. Host the backend as a container service.
3. Use managed PostgreSQL.
4. Host Orthanc on a VPS or container service with persistent disk.
5. Host OHIF as a static app or container.
6. Add authentication before exposing uploads or study data.

## Final Technical Summary

The project is technically strongest as a Dockerized DICOM workflow system. It demonstrates real DICOM upload, PACS integration, metadata synchronization, and OHIF viewing. For production web hosting, the biggest requirements are persistent Orthanc storage, secure credentials, HTTPS, authentication, access control, and careful handling of medical data.
