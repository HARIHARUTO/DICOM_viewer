# Security Policy

## Supported Versions

This project is currently in active development and has not yet published a stable production release.

Security updates are applied to the latest code on the `main` branch. Older commits, forks, and unofficial copies are not actively supported.

| Version / Branch | Supported |
| --- | --- |
| `main` | Yes |
| `v1.0.0` | Planned |
| `< v1.0.0` | No |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

Do not create a public GitHub issue for security problems.

Report vulnerabilities through one of the following methods:

1. Use GitHub Security Advisories from the repository's **Security** tab, if available.
2. If private advisory reporting is not available, contact the project maintainer directly through GitHub.

When reporting a vulnerability, include:

- A clear description of the issue
- Steps to reproduce the problem
- Affected component, such as frontend, backend, Docker, Orthanc, OHIF configuration, or PostgreSQL
- Potential impact
- Any suggested fix, if known

Please do not include real patient data, real DICOM studies, PHI, hospital identifiers, or private medical information in the report.

## Response Expectations

After a vulnerability is reported:

- The report will be reviewed as soon as possible.
- Valid security issues will be prioritized based on severity and impact.
- Accepted vulnerabilities will be fixed in the `main` branch.
- If the issue is declined, the reason will be documented privately where possible.

## Security Scope

Security reports are welcome for:

- Authentication or authorization weaknesses
- DICOM upload handling issues
- DICOMweb gateway exposure
- Docker or environment configuration risks
- PostgreSQL metadata access risks
- Orthanc exposure or misconfiguration
- Dependency vulnerabilities
- Sensitive data leakage
- Insecure default configuration

## Out of Scope

The following are currently out of scope:

- Issues caused by modified forks
- Vulnerabilities in unsupported local deployments
- Reports using fake impact without reproduction steps
- Public disclosure before responsible reporting
- Clinical safety claims without technical evidence

## Medical Data Notice
