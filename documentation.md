# Zero Footprint DICOM Viewer with Integrated Radiology Workflow System

## 1. Executive Summary

The Zero Footprint DICOM Viewer with Integrated Radiology Workflow System is a production-oriented medical imaging platform designed to upload, manage, query, and view DICOM studies through a web-based workflow. The system follows a zero-footprint model, allowing users to access imaging workflows through a browser without installing a dedicated desktop viewer.

The platform uses OHIF Viewer as the exclusive DICOM rendering engine and Orthanc as the DICOM server. The backend coordinates DICOMweb communication, metadata synchronization, and application-level APIs, while PostgreSQL stores only searchable metadata. This design keeps image storage, rendering, backend logic, and database responsibilities clearly separated.

## 2. Problem Statement

Radiology workflows often depend on heavyweight desktop viewers, tightly coupled storage systems, and manual study handling. These approaches can limit accessibility, increase operational complexity, and make integration with modern web applications difficult.

The project addresses the need for a browser-accessible imaging workflow that can upload DICOM studies, index study metadata, retrieve studies through standard DICOMweb APIs, and launch a reliable diagnostic viewer without building a custom image rendering engine.

## 3. Solution Overview

The solution provides a modular web-based workflow where DICOM files are uploaded through a React dashboard, passed to a Node.js backend, stored in Orthanc, indexed into PostgreSQL as metadata, and viewed through OHIF Viewer.

The system uses DICOMweb standards throughout the imaging pipeline:

- STOW-RS for DICOM upload
- QIDO-RS for study and metadata query
- WADO-RS for image retrieval

The frontend does not render DICOM images. It provides study upload, study search, metadata display, and OHIF launch controls. OHIF handles all medical image visualization.

## 4. System Architecture

The architecture is divided into independent modules with clear responsibilities.

The React frontend acts as the user-facing dashboard. It allows users to upload DICOM files, search studies, view available study metadata, and open selected studies in OHIF Viewer.

The Node.js Express backend acts as the application service layer. It receives uploads from the frontend, forwards DICOM objects to Orthanc using STOW-RS, synchronizes study metadata using QIDO-RS, exposes metadata APIs to the frontend, and provides a controlled DICOMweb gateway for OHIF.

Orthanc is the dedicated DICOM server. It is responsible for receiving, storing, indexing, and serving DICOM objects. All DICOM files remain inside Orthanc storage and are never stored in the application database.

PostgreSQL is used only for application metadata. It stores searchable study-level metadata such as patient identifiers, study instance UID, study date, modality, accession number, series count, and instance count. It does not store DICOM files or pixel data.

OHIF Viewer is the only DICOM rendering engine in the system. It retrieves study data through the backend DICOMweb gateway and renders images using standard OHIF functionality.

Docker provides the infrastructure layer by running the frontend, backend, PostgreSQL, Orthanc, and OHIF as separate containers.

## 5. Technology Stack

Frontend: React, TypeScript, Vite, Nginx

Backend: Node.js, Express, TypeScript

DICOM Server: Orthanc with DICOMweb support

Viewer: OHIF Viewer

Database: PostgreSQL

Infrastructure: Docker and Docker Compose

Standards: DICOMweb, STOW-RS, QIDO-RS, WADO-RS

## 6. Core Features

- Browser-based zero-footprint access to radiology workflows
- DICOM upload through the web dashboard
- STOW-RS based upload from backend to Orthanc
- Orthanc-based DICOM storage
- PostgreSQL-based metadata indexing
- Study search and filtering using synchronized metadata
- OHIF launch from the study list
- WADO-RS based image retrieval for viewing
- Clear separation between viewer, backend, DICOM server, and database
- Containerized deployment using Docker Compose

## 7. System Workflow

1. The user uploads one or more DICOM files from the React dashboard.

2. The frontend sends the files to the Node.js backend through the upload API.

3. The backend validates the request and streams the DICOM files to Orthanc using STOW-RS.

4. Orthanc stores the DICOM studies and makes them available through DICOMweb endpoints.

5. The backend synchronizes study metadata from Orthanc using QIDO-RS.

6. PostgreSQL stores only normalized metadata and selected DICOM JSON metadata for search and display.

7. The frontend retrieves study metadata from the backend and displays the study list.

8. The user selects a study and launches OHIF Viewer.

9. OHIF retrieves the selected study through the backend DICOMweb gateway using QIDO-RS and WADO-RS.

10. The radiology workflow continues in OHIF for image review and diagnosis support.

## 8. Implementation Details

The backend is implemented as an Express service with modular routing for health checks, study metadata, upload handling, and DICOMweb proxying. Uploads are handled as multipart requests and forwarded to Orthanc using STOW-RS. The backend does not persist DICOM files in PostgreSQL.

Metadata synchronization is performed by querying Orthanc through QIDO-RS. Study-level fields are mapped into PostgreSQL columns to support efficient filtering and listing. Raw DICOM JSON metadata may also be stored for traceability and future workflow needs, while pixel data remains outside the database.

OHIF is configured as an external viewer service and connected to the backend DICOMweb gateway. This keeps the viewer independent from the frontend dashboard and ensures that image rendering is handled by a proven medical imaging viewer rather than a custom implementation.

Docker Compose defines separate services for the frontend, backend, Orthanc, PostgreSQL, and OHIF. This allows each module to be developed, tested, deployed, and scaled independently.

## 9. Team Contributions

Hari served as the Team Lead and System Architect. He was the primary contributor responsible for designing the overall architecture, defining the DICOM pipeline, integrating the backend with Orthanc, establishing the DICOMweb workflow, coordinating the Docker-based system orchestration, and ensuring that the system followed the constraints of OHIF-only rendering, Orthanc-based DICOM storage, and PostgreSQL metadata-only persistence.

Shreya contributed to the frontend workflow, including dashboard structure, upload interaction flow, study list usability, and user-facing validation support. She also assisted with integration checks between the frontend and backend APIs.

Aisiri contributed to testing and integration support, including verification of upload behavior, study listing behavior, and workflow consistency from upload to OHIF launch. She also helped identify usability issues during frontend testing.

Uma contributed to backend and integration validation, including API behavior checks, metadata synchronization review, and support for ensuring the workflow aligned with DICOMweb-based communication.

Varsha supported documentation, testing, and review activities. Her work included helping organize project notes, reviewing workflow descriptions, and assisting with validation of user-facing behavior.

Tejas supported testing, minor feature review, and project documentation refinement. He assisted with checking system behavior, reviewing deployment steps, and validating that the final workflow was understandable for demonstration and submission.

## 10. Challenges Faced and Solutions

One major challenge was maintaining a clear separation between DICOM storage, metadata storage, image rendering, and application logic. This was addressed by using Orthanc exclusively for DICOM storage, PostgreSQL only for metadata, OHIF only for rendering, and Express only for orchestration and APIs.

Another challenge was avoiding custom DICOM rendering while still providing a complete viewer workflow. The solution was to integrate OHIF as a standalone viewer and launch it from the React dashboard with the selected study context.

Handling uploads required a standards-compliant approach. This was solved by using STOW-RS to send DICOM files from the backend to Orthanc instead of storing files in the database or filesystem as application data.

Metadata consistency was another important concern. The backend addresses this by syncing study metadata from Orthanc using QIDO-RS after upload and exposing PostgreSQL-backed metadata APIs to the frontend.

Deployment complexity was reduced by containerizing each major component with Docker Compose. This allowed the team to run the full system with a consistent multi-container setup.

## 11. Future Scope

- Add role-based access control for radiologists, technicians, administrators, and referring physicians
- Add audit logs for study access, uploads, and viewing events
- Add reporting workflow for diagnosis notes and structured radiology reports
- Add PACS integration with external hospital systems
- Add HL7 or FHIR integration for patient and order workflows
- Add automated study routing and assignment
- Add advanced search filters for modality, date range, accession number, and referring physician
- Add production security hardening, including HTTPS, secrets management, and stricter network policies
- Add monitoring, alerting, and operational dashboards
- Add validation steps required for clinical or regulatory deployment

## 12. Conclusion

The Zero Footprint DICOM Viewer with Integrated Radiology Workflow System provides a modular and standards-based approach to medical imaging workflows. By using Orthanc for DICOM storage, OHIF for image rendering, PostgreSQL for metadata, and Node.js for orchestration, the system avoids unsafe coupling and follows established DICOMweb practices.

The project demonstrates a practical architecture for browser-based radiology workflows while preserving clear module boundaries. It provides a strong foundation for future enhancements such as reporting, access control, audit logging, hospital system integration, and production security hardening.
