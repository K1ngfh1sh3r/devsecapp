# DevSecApp

**DevSecApp** is a secure vulnerability management REST API developed as part of the Oteria cybersecurity curriculum.

The project demonstrates a complete **DevSecOps development workflow**, from application development and automated testing to static analysis, dependency auditing, secret scanning, container hardening, vulnerability scanning, and container publication.

---

## Objectives

The project aims to demonstrate the integration of security controls throughout the software development lifecycle.

The main objectives are:

* Develop a functional REST API with FastAPI.
* Store vulnerability data in PostgreSQL.
* Implement a complete CRUD workflow.
* Validate application input with Pydantic.
* Automate application testing with Pytest.
* Enforce code quality with Ruff.
* Containerize the application with Docker.
* Run automated security checks in GitHub Actions.
* Perform SAST with Semgrep and Bandit.
* Audit Python dependencies with pip-audit.
* Detect exposed secrets with Gitleaks.
* Scan the Docker image with Trivy.
* Run the application container as a non-root user.
* Publish validated container images to GitHub Container Registry (GHCR).

---

## Architecture

```text
                         Developer
                             │
                             ▼
                         Git / GitHub
                             │
                             ▼
                    ┌─────────────────┐
                    │ GitHub Actions  │
                    │      CI         │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       Pytest              Ruff           Security scans
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
                      Semgrep              Bandit            pip-audit
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             │
                                             ▼
                                          Gitleaks
                                             │
                                             ▼
                                      Docker image build
                                             │
                                             ▼
                                           Trivy
                                             │
                                             ▼
                                            GHCR


                    Runtime environment
                    ┌────────────────────────────┐
                    │       Docker Compose       │
                    │                            │
                    │  ┌──────────┐  ┌────────┐ │
                    │  │ FastAPI  │──│Postgres│ │
                    │  │   API    │  │   DB   │ │
                    │  └──────────┘  └────────┘ │
                    │                            │
                    └────────────────────────────┘
```

---

## Technology Stack

| Category                | Technology                |
| ----------------------- | ------------------------- |
| Language                | Python 3.13+              |
| API                     | FastAPI                   |
| Database                | PostgreSQL 17             |
| ORM                     | SQLAlchemy                |
| Validation              | Pydantic                  |
| Testing                 | Pytest                    |
| Code quality            | Ruff                      |
| SAST                    | Semgrep, Bandit           |
| Dependency security     | pip-audit                 |
| Secret scanning         | Gitleaks                  |
| Containerization        | Docker                    |
| Container orchestration | Docker Compose            |
| Container security      | Trivy                     |
| CI/CD                   | GitHub Actions            |
| Container registry      | GitHub Container Registry |

---

## Project Structure

```text
devsecapp/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── src/
│   └── devsecapp/
│       ├── api/
│       │   └── vulnerabilities.py
│       ├── database/
│       │   ├── connection.py
│       │   └── models.py
│       ├── schemas/
│       │   └── vulnerability.py
│       ├── config.py
│       ├── main.py
│       └── __init__.py
│
├── tests/
│   ├── conftest.py
│   ├── test_health.py
│   └── test_vulnerabilities.py
│
├── .dockerignore
├── .env.example
├── .gitignore
├── compose.yml
├── Dockerfile
├── pyproject.toml
└── README.md
```

---

## Features

### Health check

The API exposes a health endpoint:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Vulnerability management

The API provides a complete CRUD workflow:

```text
POST   /vulnerabilities
GET    /vulnerabilities
GET    /vulnerabilities/{id}
PATCH  /vulnerabilities/{id}
DELETE /vulnerabilities/{id}
```

Supported severity levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Supported statuses:

```text
OPEN
IN_PROGRESS
RESOLVED
```

Each vulnerability contains:

* ID
* Title
* Description
* Severity
* Status
* Affected component
* Creation timestamp
* Update timestamp

---

## API

### Create a vulnerability

```http
POST /vulnerabilities
```

Example request:

```json
{
  "title": "SQL injection",
  "description": "Potential SQL injection vulnerability.",
  "severity": "HIGH",
  "status": "OPEN",
  "affected_component": "Authentication API"
}
```

Returns:

```text
201 Created
```

### List vulnerabilities

```http
GET /vulnerabilities
```

Returns:

```text
200 OK
```

### Retrieve a vulnerability

```http
GET /vulnerabilities/{id}
```

Returns:

```text
200 OK
```

or:

```text
404 Not Found
```

when the vulnerability does not exist.

### Update a vulnerability

```http
PATCH /vulnerabilities/{id}
```

Only provided fields are modified.

Returns:

```text
200 OK
```

or:

```text
404 Not Found
```

### Delete a vulnerability

```http
DELETE /vulnerabilities/{id}
```

Returns:

```text
204 No Content
```

or:

```text
404 Not Found
```

---

## Configuration

Environment variables are used for database configuration.

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Example configuration:

```env
POSTGRES_DB=devsecapp
POSTGRES_USER=devsecapp
POSTGRES_PASSWORD=change-me
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

The `.env` and `.env.test` files are excluded from version control.

The test environment uses a separate PostgreSQL database:

```text
Development database: devsecapp
Test database:        devsecapp_test
```

---

## Running with Docker Compose

Start the application and PostgreSQL:

```bash
docker compose up -d --build
```

Check the running services:

```bash
docker compose ps
```

The API is available at:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

Stop the environment:

```bash
docker compose down
```

---

## API Documentation

FastAPI automatically provides interactive API documentation.

Swagger UI:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

## Testing

The project contains automated tests covering the health endpoint and vulnerability CRUD operations.

Run the complete test suite:

```bash
pytest
```

Current test coverage includes:

* Health check
* Vulnerability creation
* Invalid severity validation
* Vulnerability listing
* Vulnerability retrieval
* 404 handling
* Vulnerability update
* Multiple-field updates
* Update timestamp behavior
* Vulnerability deletion
* Delete 404 handling

The current test suite contains:

```text
12 tests
12 passed
```

---

## Code Quality

Ruff is used for linting and formatting.

Run the linter:

```bash
ruff check .
```

Verify formatting:

```bash
ruff format --check .
```

Both checks are executed automatically by the CI pipeline.

---

## DevSecOps Pipeline

Every push to the project branches and every pull request targeting `main` can trigger the GitHub Actions pipeline.

The pipeline performs the following checks:

```text
1. Checkout source code
        ↓
2. Install Python dependencies
        ↓
3. Run Pytest
        ↓
4. Run Ruff
        ↓
5. Run Semgrep
        ↓
6. Run Bandit
        ↓
7. Run pip-audit
        ↓
8. Run Gitleaks
        ↓
9. Build Docker image
        ↓
10. Verify container packages
        ↓
11. Run Trivy
        ↓
12. Publish image to GHCR
```

A failure in a blocking stage prevents the pipeline from completing successfully.

---

## Security Controls

### SAST

Two static analysis tools are integrated:

* **Semgrep** for source-code security analysis.
* **Bandit** for Python-specific security checks.

### Software Composition Analysis

`pip-audit` checks Python dependencies for known vulnerabilities.

### Secret scanning

Gitleaks scans the repository history and source code for accidentally committed secrets.

Sensitive environment files are also excluded through `.gitignore`:

```text
.env
.env.test
```

### Container security

The Docker image is hardened by:

* Using `python:3.13-slim` as the base image.
* Running the application as a dedicated non-root user.
* Removing unnecessary build tooling from the runtime environment.
* Keeping the runtime image focused on application dependencies.
* Scanning the final image with Trivy.

The application container runs as:

```text
appuser
```

rather than `root`.

### Container vulnerability scanning

Trivy scans the final Docker image for:

```text
HIGH
CRITICAL
```

vulnerabilities.

The current local image scan reports:

```text
0 HIGH/CRITICAL vulnerabilities
```

with unfixed vulnerabilities excluded from the blocking result.

---

## Container Registry

Validated Docker images are published to GitHub Container Registry (GHCR).

Images are tagged using the Git commit SHA:

```text
ghcr.io/<owner>/devsecapp:<commit-sha>
```

This provides a direct association between a published container image and the source revision that produced it.

---

## Development Workflow

The project follows a feature-branch workflow.

Example:

```bash
git checkout -b feature/new-feature
```

Develop and test locally:

```bash
pytest
ruff check .
ruff format --check .
```

Commit the changes:

```bash
git add .
git commit -m "feat: implement new feature"
```

Push the branch:

```bash
git push
```

GitHub Actions then performs the automated quality and security checks.

---

## Project Status

The DevSecApp implementation currently includes:

* Functional FastAPI application
* PostgreSQL persistence
* Complete vulnerability CRUD
* Input validation
* Automated test suite
* Ruff linting and formatting
* Docker containerization
* Non-root runtime
* Docker Compose environment
* GitHub Actions CI
* Semgrep SAST
* Bandit security analysis
* pip-audit dependency auditing
* Gitleaks secret scanning
* Trivy container scanning
* GHCR image publication

The mandatory technical implementation and CI security pipeline are complete.

---

## Educational Context

This project was developed as part of the **Oteria cybersecurity curriculum** to demonstrate practical DevSecOps principles and the integration of security controls into a software development lifecycle.
