# What We Have Done and Team Contribution

## Project Summary

MediView AI is a browser-based DICOM imaging workflow platform. The project connects a React dashboard, Node.js backend, Orthanc PACS server, OHIF Viewer, PostgreSQL metadata database, and Docker Compose deployment into one working medical imaging workflow.

The main goal was to avoid building a custom DICOM image renderer and instead use proven medical imaging tools. Orthanc handles DICOM storage, OHIF handles image viewing, PostgreSQL stores searchable metadata, and the backend coordinates upload, metadata sync, and DICOMweb access.

## What We Have Built

- React dashboard for radiology workflow interaction.
- DICOM upload flow from frontend to backend.
- Multipart upload handling in the backend.
- STOW-RS upload from backend to Orthanc.
- Orthanc PACS integration for DICOM storage.
- QIDO-RS metadata synchronization from Orthanc.
- PostgreSQL schema for study metadata and upload audit records.
- Study search and filtering using synchronized metadata.
- OHIF Viewer launch using StudyInstanceUID.
- UI-level role-based access for admin, doctor, and patient views.
- Viewer launch restricted to doctor/admin roles in the frontend.
- Read-only DICOMweb gateway for OHIF through the backend.
- Docker Compose setup for frontend, backend, PostgreSQL, Orthanc, and OHIF.
- Health check APIs for backend live and ready status.
- Automated tests for backend metadata mapping, multipart generation, CORS behavior, and frontend dashboard behavior.
- Documentation for setup, architecture, security, and future production work.

## Current Implemented Scope

The implemented backend workflow covers:

- DICOM upload.
- Orthanc-based DICOM storage.
- Metadata synchronization.
- PostgreSQL metadata persistence.
- Study listing and search.
- OHIF viewer launch.
- Docker-based local deployment.

The AI reports, doctor consultation screens, and role-based access controls are prototype frontend UI sections for demonstration. Real AI inference, report persistence, real-time chat, authentication, backend-enforced role-based access control, and hospital-grade security are future enhancements.

## Team Involvement and Contribution Level

| Team Member | Contribution Level | Role and Work Summary |
|---|---|---|
| Hari Sankar Reddy Yaram | Major contributor | Led the project architecture, overall technical direction, DICOM workflow design, backend integration, Orthanc/OHIF setup, Docker orchestration, debugging, testing alignment, and final technical validation. |
| Uma MP | Major contributor | Contributed strongly to backend/API validation, metadata synchronization review, DICOMweb workflow understanding, integration checks, and ensuring the backend behavior matched the planned architecture. |
| Shreya GS | Medium contributor | Worked on frontend workflow support, dashboard structure, upload interface review, study list usability, and frontend/backend interaction checks. |
| Aisiri K | Medium contributor | Supported QA and integration testing, including upload workflow checks, study listing validation, metadata sync review, and usability feedback. |
| Varsha CP | Medium contributor | Supported documentation, manual testing, workflow explanation, review activities, and presentation-oriented project refinement. |
| Anagha | Below medium contributor | Provided limited support in review, discussion, and minor project assistance. |
| Tejas S Chandrashekhar | Bare minimum contribution | Provided minimal support, mainly around basic testing/review and final documentation understanding. |

## Presentation-Friendly Explanation

This project demonstrates a complete DICOM workflow rather than a simple static dashboard. The strongest implemented parts are the upload pipeline, Orthanc integration, metadata synchronization, PostgreSQL persistence, Docker setup, and OHIF viewer launch.

For presentation or interview use, describe the AI reports and consultation sections as prototype UI areas. The safest wording is:

> We built the core DICOM upload, PACS integration, metadata sync, study search, and OHIF launch workflow. The AI reports and consultation pages are UI prototypes planned for future backend integration.

## Future Work

- Add authentication and role-based access control.
- Add real doctor-patient chat.
- Add report creation, editing, and persistence.
- Add AI model inference for report assistance.
- Add audit logs for study access and upload events.
- Add production HTTPS, secrets management, and deployment hardening.
- Add Playwright or Selenium end-to-end tests.
- Add cloud deployment with persistent storage and secure networking.
