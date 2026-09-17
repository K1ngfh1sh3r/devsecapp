# DevSecApp

Secure vulnerability management API developed as part of the Oteria cybersecurity curriculum.

## Objective

DevSecApp provides a REST API for managing identified security vulnerabilities.

The application is designed as a DevSecOps project, from application development to automated security controls.

## Stack

- Python 3.13+
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pytest
- Ruff
- Docker
- Docker Compose
- GitHub Actions

## MVP

The application will provide:

- Health check
- Vulnerability creation
- Vulnerability listing
- Vulnerability retrieval
- Vulnerability update
- Vulnerability deletion

## Vulnerability model

Each vulnerability contains:

- ID
- Title
- Description
- Severity
- Status
- Affected component
- Creation timestamp
- Update timestamp

### Severity

- LOW
- MEDIUM
- HIGH
- CRITICAL

### Status

- OPEN
- IN_PROGRESS
- RESOLVED

## API

Planned endpoints:

```text
GET    /health

POST   /vulnerabilities
GET    /vulnerabilities
GET    /vulnerabilities/{id}
PATCH  /vulnerabilities/{id}
DELETE /vulnerabilities/{id}