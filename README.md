# MediView AI  
### Zero-Footprint DICOM Imaging & Radiology Workflow Platform

Production-oriented medical imaging workflow system built using React, TypeScript, Express, Orthanc, OHIF Viewer, PostgreSQL, and Docker.

MediView AI provides an integrated browser-based radiology workspace for:

- DICOM upload and management
- Orthanc PACS integration
- OHIF medical image viewing
- Metadata synchronization
- Study search and filtering
- AI-assisted reporting workflows
- Doctor-patient collaboration UI

The platform follows a decoupled architecture where the frontend, backend, viewer, DICOM server, and metadata database operate independently.

---

# 🚀 Features

## 📤 DICOM Upload Workflow
- Upload CT, MRI, OCT, X-Ray and other DICOM studies
- Multipart upload support
- Upload progress tracking
- Orthanc PACS integration using STOW-RS

## 🩻 OHIF Medical Viewer Integration
- Launch studies directly in OHIF Viewer
- QIDO-RS and WADO-RS support
- Zero-footprint browser-based viewing

## 🧠 AI Radiology Workspace UI
- AI findings dashboard
- Reports section
- Patient directory
- Recent study tracking
- Doctor consultation panel

## 🔎 Study Search & Metadata Sync
- Search studies using patient name, modality, accession, etc.
- Sync metadata from Orthanc into PostgreSQL
- Metadata normalization pipeline

## 🐳 Containerized Architecture
- Docker Compose based deployment
- Separate frontend, backend, Orthanc, OHIF, and PostgreSQL services

---

# 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | CSS |
| Backend | Node.js + Express |
| DICOM Server | Orthanc |
| Medical Viewer | OHIF Viewer |
| Database | PostgreSQL |
| Containerization | Docker + Docker Compose |
| Testing | Vitest + React Testing Library |

---

# 🖥️ Application Modules

## Dashboard
- AI radiology workspace
- Upload metrics
- Study tracking
- Doctor collaboration panel

## Upload Workflow
- Upload DICOM scans directly into Orthanc
- Progress tracking
- Recent upload history

## Study Explorer
- Study listing and metadata filtering
- OHIF Viewer launch support

## AI Reports
- AI-assisted radiology reporting interface

## Patient Directory
- Patient metadata management UI

---

# ⚙️ System Workflow

```text
Frontend Upload
        ↓
Express Backend
        ↓
Orthanc PACS (STOW-RS)
        ↓
Metadata Sync (QIDO-RS)
        ↓
PostgreSQL Metadata Storage
        ↓
OHIF Viewer Launch
        ↓
Browser-based Medical Image Review
```

---

# 🏗️ System Architecture

```text
Browser
  |
  | React Dashboard
  v
Frontend Container
  |
  | REST APIs
  v
Backend Container
  |
  | STOW-RS Upload
  | QIDO-RS Metadata Sync
  | DICOMweb Gateway
  v
Orthanc PACS
  |
  | DICOM Storage
  v
Orthanc Volume

Backend
  |
  | Metadata Persistence
  v
PostgreSQL

Browser
  |
  | Launch Study
  v
OHIF Viewer
  |
  | QIDO-RS / WADO-RS
  v
Orthanc PACS
```

---

# 📂 Repository Structure

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
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- layouts/
|   |   |-- styles/
|   |   `-- context/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- vite.config.ts
|   `-- package.json
|
|-- infra/
|   `-- ohif/
|       `-- app-config.js
|
|-- docker-compose.yml
|-- README.md
|-- PROJECT_PLAN.md
|-- documentation.md
`-- .env.example
```

---

# ⚡ Prerequisites

Install the following before running the platform:

- Docker Desktop
- Docker Compose
- Node.js 20+
- npm
- Git

On Windows, Docker Desktop must be running with Linux containers enabled.

---

# 🔐 Environment Configuration

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Default environment values:

```env
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

---

# 🐳 Run With Docker

From the project root:

```powershell
docker compose up --build
```

Open the services:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| OHIF Viewer | http://localhost:3001 |
| Backend API | http://localhost:4000 |
| Orthanc Admin | http://localhost:8042 |

Orthanc credentials:

```text
Username: orthanc
Password: orthanc
```

Stop containers:

```powershell
docker compose down
```

Remove volumes:

```powershell
docker compose down -v
```

---

# 💻 Run Locally For Development

## Start PostgreSQL + Orthanc

```powershell
docker compose up postgres orthanc
```

## Install dependencies

```powershell
npm install
```

## Start backend

```powershell
cd backend
npm install
npm run dev
```

## Start frontend

```powershell
cd frontend
npm install
npm run dev
```

## Start OHIF

```powershell
docker compose up ohif
```

---

# 🔌 API Endpoints

| Endpoint | Purpose |
|---|---|
| GET /health/live | Backend live status |
| GET /health/ready | Backend readiness |
| POST /api/studies/upload | Upload DICOM studies |
| GET /api/studies | Fetch metadata |
| POST /api/studies/sync | Sync Orthanc metadata |
| /api/dicomweb/* | DICOMweb gateway |

---

# 🧪 Testing

Run all tests:

```powershell
npm test
```

Build validation:

```powershell
npm run build
```

Frontend tests:

```powershell
npm run frontend:test
```

Backend tests:

```powershell
npm run backend:test
```

Docker validation:

```powershell
docker compose config
```

---

# 📡 Example API Usage

## Upload DICOM Files

```powershell
curl.exe -X POST http://localhost:4000/api/studies/upload `
  -F "files=@C:\path\to\image1.dcm"
```

## Sync Metadata

```powershell
curl.exe -X POST http://localhost:4000/api/studies/sync
```

## List Studies

```powershell
curl.exe "http://localhost:4000/api/studies"
```

## Open OHIF Viewer

```text
http://localhost:3001/viewer?StudyInstanceUIDs=<study-instance-uid>
```

---

# 🛡️ Security Notes

Before production deployment:

- Replace default credentials
- Enable HTTPS
- Add JWT authentication
- Implement RBAC
- Add audit logging
- Secure environment variables
- Restrict Orthanc admin access

---

# 🔮 Future Scope

Planned production-grade enhancements:

- Google OAuth authentication
- JWT-based role access control
- Real-time doctor consultation chat
- AI-powered diagnosis assistance
- Study annotations and measurements
- Cloud PACS deployment
- DICOM SR support
- Audit logging and monitoring
- Dark/light theme switching
- Mobile-responsive radiology workspace
- AWS/GCP/Azure deployment

---

# 📌 Current Status

The current version demonstrates:

- End-to-end DICOM upload workflow
- Orthanc PACS integration
- OHIF Viewer integration
- Metadata synchronization
- Study browsing UI
- Modern radiology dashboard UX
- Dockerized deployment architecture

This project is intended as a production-oriented academic and engineering demonstration platform for scalable radiology workflow systems.

---

# 👨‍💻 Team Members

- Hari Sankar Reddy Yaram
- Uma MP
- Varsha CP
- Shreya GS
- Aisiri K
- Tejas S Chandrashekhar

---

# 📄 License

This project is intended for educational, research, and engineering demonstration purposes.
