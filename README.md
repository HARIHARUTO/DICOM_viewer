# Zero Footprint DICOM Viewer with Integrated Radiology Workflow System

Production-oriented medical imaging workflow platform built with React, Express, Orthanc, OHIF Viewer, PostgreSQL, and Docker.

The system provides a browser-based workflow for uploading DICOM studies, synchronizing metadata, listing studies, and launching OHIF Viewer for image review. It follows a decoupled architecture where the viewer, backend, DICOM server, and database have separate responsibilities.

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Run With Docker](#run-with-docker)
- [Run Locally For Development](#run-locally-for-development)
- [Service Endpoints](#service-endpoints)
- [Quality Assurance And Testing](#quality-assurance-and-testing)
- [API Reference](#api-reference)
- [Operational Notes](#operational-notes)
- [Troubleshooting](#troubleshooting)
- [Security And Compliance Notes](#security-and-compliance-notes)
- [Known Edge Cases](#known-edge-cases)

## Overview

This project implements the workflow:

```text
Upload -> Backend -> Orthanc -> Metadata Sync -> Frontend -> OHIF Viewer -> Diagnosis Support
```

DICOM files are uploaded through the React dashboard, sent to the Express backend, stored in Orthanc using DICOMweb STOW-RS, indexed into PostgreSQL as metadata, and viewed through OHIF Viewer using QIDO-RS and WADO-RS.

## Architecture Principles

- Do not build a DICOM viewer from scratch.
- Use OHIF Viewer as the only DICOM rendering engine.
- Use Orthanc as the DICOM server and DICOM storage layer.
- Do not store DICOM files or pixel data in PostgreSQL.
- Store only normalized study metadata and selected DICOM JSON metadata in PostgreSQL.
- Use DICOMweb standards: STOW-RS, QIDO-RS, and WADO-RS.
- Keep frontend, backend, viewer, DICOM server, and database decoupled.

## System Architecture

The platform is split into five runtime components:

```text
Browser
  |
  | React dashboard
  v
Frontend container
  |
  | REST upload/search requests
  v
Backend container
  |
  | STOW-RS upload, QIDO-RS metadata sync, WADO-RS/QIDO-RS proxy
  v
Orthanc container
  |
  | DICOM object storage
  v
Orthanc storage volume

Backend container
  |
  | Metadata-only persistence
  v
PostgreSQL container

Browser
  |
  | Launch selected study
  v
OHIF Viewer container
  |
  | QIDO-RS and WADO-RS through backend gateway
  v
Orthanc container
```

The React application does not render medical images. It only manages workflow actions such as upload, search, and viewer launch. OHIF Viewer handles all image rendering.

## Technology Stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, Nginx | Dashboard, DICOM upload UI, study list, OHIF launch |
| Backend | Node.js, Express, TypeScript | Application APIs, STOW-RS upload, QIDO-RS metadata sync, DICOMweb gateway |
| DICOM Server | Orthanc | DICOM storage and DICOMweb endpoints |
| Viewer | OHIF Viewer | Medical image rendering |
| Database | PostgreSQL | Study metadata only |
| Infrastructure | Docker Compose | Multi-container local deployment |
| QA | Vitest, React Testing Library, jsdom, TypeScript, npm audit | Unit tests, component tests, build validation, dependency audit |

## Repository Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- db/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- types/
|   |   `-- utils/
|   |-- Dockerfile
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   `-- vite.config.ts
|-- infra/
|   `-- ohif/
|       `-- app-config.js
|-- docker-compose.yml
|-- documentation.md
|-- .env.example
|-- package.json
`-- README.md
```

## Prerequisites

Install the following before running the platform:

- Docker Desktop
- Docker Compose
- Node.js 20.11 or later
- npm
- Git

On Windows, Docker Desktop must be running with the Linux engine enabled.

## Environment Configuration

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Default environment values:

```text
POSTGRES_DB=dicom_metadata
POSTGRES_USER=dicom_app
POSTGRES_PASSWORD=dicom_app_password
POSTGRES_PORT=5432

ORTHANC_USERNAME=orthanc
ORTHANC_PASSWORD=orthanc
ORTHANC_HTTP_PORT=8042

BACKEND_PORT=4000
FRONTEND_PORT=3000
OHIF_PORT=3001
```

Do not commit `.env`. It is ignored by Git.

## Run With Docker

From the project root:

```powershell
cd "c:\Users\HARI SANKAR REDDY\OneDrive\Desktop\New folder\New folder\DICOM_viewer"
Copy-Item .env.example .env
docker compose up --build
```

Open the services:

| Service | URL |
| --- | --- |
| React worklist | http://localhost:3000 |
| OHIF Viewer | http://localhost:3001 |
| Backend readiness check | http://localhost:4000/health/ready |
| Orthanc admin | http://localhost:8042 |

Orthanc local credentials:

```text
Username: orthanc
Password: orthanc
```

Stop the stack:

```powershell
docker compose down
```

Remove volumes only when you intentionally want to delete local PostgreSQL and Orthanc data:

```powershell
docker compose down -v
```

## Run Locally For Development

Start only PostgreSQL and Orthanc:

```powershell
docker compose up postgres orthanc
```

Install dependencies:

```powershell
npm run install:all
```

Start the backend:

```powershell
cd backend
$env:DATABASE_URL="postgres://dicom_app:dicom_app_password@localhost:5432/dicom_metadata"
$env:ORTHANC_DICOMWEB_URL="http://localhost:8042/dicom-web"
$env:ORTHANC_USERNAME="orthanc"
$env:ORTHANC_PASSWORD="orthanc"
npm run dev
```

Start the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

Start OHIF through Docker:

```powershell
docker compose up ohif
```

## Service Endpoints

| Component | Endpoint | Purpose |
| --- | --- | --- |
| Backend live check | `GET /health/live` | Confirms backend process is running |
| Backend ready check | `GET /health/ready` | Confirms backend can reach PostgreSQL and Orthanc |
| Upload API | `POST /api/studies/upload` | Receives DICOM files and forwards them to Orthanc using STOW-RS |
| Study list API | `GET /api/studies` | Returns metadata from PostgreSQL |
| Metadata sync API | `POST /api/studies/sync` | Syncs metadata from Orthanc using QIDO-RS |
| DICOMweb gateway | `/api/dicomweb/*` | Read-only QIDO-RS/WADO-RS gateway for OHIF |

## Quality Assurance And Testing

The current QA process uses automated tests, type checking, production builds, dependency audits, and infrastructure configuration validation.

Run the full test suite:

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

Run dependency security audits:

```powershell
cd backend
npm audit --json

cd ../frontend
npm audit --json
```

Validate Docker Compose configuration:

```powershell
docker compose config
```

QA coverage currently includes:

- Backend DICOM metadata mapping tests
- Missing `StudyInstanceUID` validation
- STOW-RS multipart body generation tests
- Frontend dashboard rendering tests
- OHIF delegation verification at UI level
- TypeScript compilation for backend and frontend
- Frontend production build validation
- Dependency vulnerability audit
- Docker Compose configuration validation

Selenium is not used in the current version. Browser-level end-to-end testing can be added later with Selenium or Playwright to validate upload, metadata sync, study listing, and OHIF launch in a running browser environment.

## API Reference

Upload DICOM files:

```powershell
curl.exe -X POST http://localhost:4000/api/studies/upload `
  -F "files=@C:\path\to\image1.dcm" `
  -F "files=@C:\path\to\image2.dcm"
```

Sync metadata from Orthanc:

```powershell
curl.exe -X POST http://localhost:4000/api/studies/sync
```

List studies:

```powershell
curl.exe "http://localhost:4000/api/studies?patientName=Doe&modality=CT"
```

Open OHIF with a specific study:

```text
http://localhost:3001/viewer?StudyInstanceUIDs=<study-instance-uid>
```

OHIF reads DICOMweb through:

```text
http://localhost:4000/api/dicomweb
```

## Operational Notes

- Orthanc is the source of truth for DICOM objects.
- PostgreSQL is the source of truth for application-facing metadata search.
- The backend DICOMweb gateway is read-only for OHIF.
- Uploads must go through `/api/studies/upload`.
- The backend runs database migrations at startup.
- DICOM upload limits are controlled through `MAX_UPLOAD_FILES` and `MAX_UPLOAD_BYTES`.
- OHIF configuration is mounted from `infra/ohif/app-config.js`.

## Troubleshooting

If Docker returns an API version or engine error, restart Docker Desktop and run:

```powershell
wsl --shutdown
docker version
docker compose up --build
```

If `ohif/app:latest` fails to pull:

```powershell
docker pull ohif/app:latest
```

If a port is already in use, update `.env`:

```text
FRONTEND_PORT=3002
OHIF_PORT=3003
BACKEND_PORT=4001
ORTHANC_HTTP_PORT=8043
POSTGRES_PORT=5433
```

If backend readiness fails, check that PostgreSQL and Orthanc are running:

```powershell
docker compose ps
```

If frontend loads but studies are missing:

```powershell
curl.exe -X POST http://localhost:4000/api/studies/sync
```

## Security And Compliance Notes

This repository is structured for engineering demonstration and production-oriented architecture, but additional controls are required before clinical deployment:

- Replace default Orthanc credentials.
- Use HTTPS in deployed environments.
- Add role-based access control.
- Add access audit logs.
- Add secure secret management.
- Restrict Orthanc admin exposure.
- Configure backup and restore procedures.
- Validate the system against applicable medical, privacy, and institutional requirements.

## Known Edge Cases

- Large uploads are capped by configured upload limits.
- Empty file uploads return HTTP 400.
- Orthanc upload failures are recorded in upload audit metadata.
- QIDO-RS studies without `StudyInstanceUID` are skipped during sync.
- PostgreSQL never stores DICOM files or pixel data.
- OHIF is required for viewing; the React app does not render images.
- Docker image builds require Docker Desktop to be running.
