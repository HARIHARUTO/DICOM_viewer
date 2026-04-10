# 4-Week Development Plan

## Zero Footprint DICOM Viewer with Integrated Radiology Workflow System

## Project Overview

The goal of this project is to develop a browser-based medical imaging workflow system that allows users to upload DICOM studies, synchronize study metadata, search studies, and launch a diagnostic viewer without installing desktop software.

The system follows a zero-footprint architecture and uses OHIF Viewer as the dedicated DICOM rendering engine. Orthanc is used as the DICOM server, PostgreSQL stores metadata only, and the backend coordinates DICOMweb communication using STOW-RS, QIDO-RS, and WADO-RS.

Unlike the earlier draft plan, this project does not use Cornerstone.js directly. Image rendering is handled only through OHIF Viewer, which provides a safer and more maintainable approach for this architecture.

## Objectives

- Build a browser-based radiology workflow dashboard.
- Enable DICOM upload through the frontend.
- Store DICOM studies only in Orthanc.
- Sync searchable study metadata into PostgreSQL.
- Launch OHIF Viewer for DICOM image review.
- Use DICOMweb standards: STOW-RS, QIDO-RS, and WADO-RS.
- Keep frontend, backend, viewer, DICOM server, and database decoupled.
- Containerize the full system using Docker Compose.
- Validate the system using automated tests, build checks, dependency audits, and configuration validation.

## Overall Project Status

Current completion status: approximately 85 percent complete.

Completed:

- React dashboard for upload, study list, search, and OHIF launch.
- Express backend with DICOMweb integration.
- STOW-RS upload flow from backend to Orthanc.
- QIDO-RS metadata sync from Orthanc to PostgreSQL.
- WADO-RS and QIDO-RS read-only gateway for OHIF.
- PostgreSQL metadata-only schema.
- Orthanc and OHIF integration through Docker Compose.
- README and formal project documentation.
- Unit tests, frontend component tests, TypeScript build validation, dependency audit, and Docker Compose configuration validation.

Pending or recommended:

- Full Docker runtime verification on a working Docker Desktop environment.
- Browser-level end-to-end testing using Selenium or Playwright.
- Authentication and role-based access control.
- HTTPS and production secret management.
- Audit logging for study access and upload actions.
- Deployment hardening for production or hospital environments.
- Clinical validation before real-world medical use.

## Week 1: Architecture, Environment Setup, and Core Infrastructure

### Vision

Establish the foundation of the medical imaging platform with a clear production-grade architecture, correct technology choices, and containerized infrastructure.

### Planned Tasks

- Define system architecture and module boundaries.
- Set up React frontend project.
- Set up Node.js Express backend project.
- Configure PostgreSQL for metadata storage.
- Configure Orthanc as the DICOM server.
- Configure OHIF Viewer as the only rendering engine.
- Create Docker Compose setup for all services.
- Define environment configuration and project structure.

### Daily Plan

Day 1: Finalize architecture and technology stack.

Day 2: Create repository structure for frontend, backend, infra, and documentation.

Day 3: Set up React frontend with TypeScript and Vite.

Day 4: Set up Express backend with TypeScript.

Day 5: Add PostgreSQL schema for metadata-only storage.

Day 6: Configure Orthanc and OHIF services in Docker Compose.

Day 7: Validate service wiring and prepare base documentation.

### Week 1 Status

Completed.

The project structure, Docker Compose setup, Orthanc service, OHIF configuration, PostgreSQL service, backend foundation, and frontend foundation have been implemented.

## Week 2: DICOMweb Backend and Metadata Pipeline

### Vision

Implement the backend workflow that receives DICOM uploads, stores DICOM files in Orthanc, and synchronizes searchable metadata into PostgreSQL.

### Planned Tasks

- Implement upload API in Express.
- Stream uploaded DICOM files to Orthanc using STOW-RS.
- Implement DICOMweb client service.
- Query Orthanc using QIDO-RS.
- Map QIDO-RS DICOM JSON into normalized study metadata.
- Store only metadata in PostgreSQL.
- Add upload audit records.
- Add backend error handling and validation.

### Daily Plan

Day 8: Implement multipart upload handling in backend.

Day 9: Add STOW-RS upload integration with Orthanc.

Day 10: Implement QIDO-RS study query logic.

Day 11: Create metadata mapper for DICOM JSON fields.

Day 12: Implement PostgreSQL metadata repository.

Day 13: Add metadata sync endpoint.

Day 14: Add backend tests for metadata mapping and STOW-RS multipart generation.

### Week 2 Status

Completed.

The backend now supports DICOM upload through STOW-RS, metadata synchronization through QIDO-RS, PostgreSQL metadata persistence, upload audit records, validation, error handling, and backend unit tests.

## Week 3: Frontend Workflow and OHIF Viewer Integration

### Vision

Build the user-facing workflow for uploading studies, searching metadata, and launching OHIF Viewer for image review.

### Planned Tasks

- Build React dashboard UI.
- Implement DICOM file upload form.
- Display selected file count and upload size.
- Implement study search filters.
- Display study list from backend metadata APIs.
- Add metadata sync action.
- Add OHIF launch button for selected studies.
- Ensure frontend does not render DICOM images directly.
- Add frontend tests.

### Daily Plan

Day 15: Build dashboard layout and application shell.

Day 16: Implement DICOM upload form.

Day 17: Connect upload UI to backend upload API.

Day 18: Implement study list and metadata display.

Day 19: Add study search filters.

Day 20: Add OHIF launch flow using StudyInstanceUID.

Day 21: Add frontend component tests and UI validation.

### Week 3 Status

Completed.

The React frontend supports DICOM upload, study listing, metadata filtering, manual metadata sync, and OHIF launch. The frontend does not perform custom DICOM rendering and correctly delegates image viewing to OHIF.

## Week 4: QA, Documentation, Deployment Readiness, and Final Review

### Vision

Stabilize the system, validate implementation quality, prepare documentation, and identify production-readiness gaps.

### Planned Tasks

- Run backend unit tests.
- Run frontend component tests.
- Run TypeScript build validation.
- Run frontend production build.
- Run dependency security audit.
- Validate Docker Compose configuration.
- Improve README with industry-standard setup and operational sections.
- Create professional project documentation.
- Document team contributions and QA process.
- Identify remaining production hardening work.

### Daily Plan

Day 22: Run backend tests and fix issues.

Day 23: Run frontend tests and fix issues.

Day 24: Run TypeScript build validation for backend and frontend.

Day 25: Run dependency audit and resolve vulnerabilities.

Day 26: Validate Docker Compose configuration and service definitions.

Day 27: Prepare README and formal documentation.

Day 28: Final project review, commit, and GitHub push.

### Week 4 Status

Mostly completed.

Completed:

- Backend tests passed.
- Frontend tests passed.
- Backend build passed.
- Frontend build passed.
- Dependency audit passed with zero vulnerabilities.
- Docker Compose configuration parsed successfully.
- README was upgraded to an industry-standard format.
- `documentation.md` was created and updated with QA and team contribution details.
- Project was committed and pushed to GitHub.

Pending:

- Full Docker image build and runtime test after Docker Desktop engine issue is resolved.
- Browser-level E2E tests using Selenium or Playwright.
- Production security hardening.

## Quality Assurance Plan

### QA Performed

The following validation was completed:

- Backend unit testing with Vitest.
- Frontend component testing with Vitest, React Testing Library, and jsdom.
- TypeScript compilation for backend and frontend.
- Production frontend build using Vite.
- Dependency security audit using npm audit.
- Docker Compose configuration validation.
- Git staging, commit, and push verification.

### QA Not Yet Performed

Selenium was not used in the current version.

Recommended next QA additions:

- Selenium or Playwright end-to-end test for DICOM upload.
- E2E test for metadata sync.
- E2E test for study search.
- E2E test for OHIF launch.
- Manual browser testing across Chrome, Edge, and Firefox.
- Runtime Docker test after Docker Desktop is working correctly.

## Team Execution Plan

Hari: Team Lead and System Architect  
Responsible for architecture, backend integration, DICOM pipeline design, Orthanc integration, OHIF integration, Docker orchestration, and overall technical direction.

Shreya: Frontend Development and UI Workflow  
Responsible for dashboard workflow, upload interface, study list layout, search interaction, and frontend usability support.

Aisiri: QA Lead and Integration Testing  
Responsible for upload workflow testing, study list validation, frontend-backend integration checks, and end-to-end workflow review.

Uma: Backend and API Validation Support  
Responsible for backend API testing, metadata sync validation, DICOMweb behavior review, and integration support.

Varsha: Documentation and Manual Testing Support  
Responsible for project documentation support, review activities, manual testing assistance, and workflow explanation refinement.

Tejas: Deployment Testing and Documentation Review  
Responsible for deployment step validation, minor feature review, manual testing support, and final documentation review.

## Expected Outcome

At the end of the 4-week development cycle, the project delivers:

- A browser-based zero-footprint DICOM workflow system.
- React dashboard for upload, study search, and OHIF launch.
- Express backend with DICOMweb integration.
- Orthanc-based DICOM storage.
- PostgreSQL metadata-only persistence.
- OHIF Viewer as the only image rendering engine.
- Docker Compose-based multi-container setup.
- Professional README and project documentation.
- Automated backend and frontend tests.
- Clear future path for production hardening and E2E testing.

## Remaining Work Before Production Use

- Resolve local Docker Desktop engine issue and run full containerized system.
- Add authentication and authorization.
- Replace default credentials.
- Add HTTPS.
- Add audit logs for study access and upload actions.
- Add Selenium or Playwright E2E automation.
- Add monitoring and logging dashboards.
- Add backup and restore process for Orthanc and PostgreSQL.
- Validate with sample DICOM studies from multiple modalities.
- Perform clinical, privacy, and compliance review before real medical deployment.

## Assumptions

- This project plan is written as a 4-week academic or portfolio project plan.
- The implemented system is based on OHIF and Orthanc, not Cornerstone.js direct rendering.
- The current status is represented as approximately 85 percent complete.
- Selenium is documented as future scope, not as a completed QA tool.
- Production clinical deployment is outside the current 4-week scope.

