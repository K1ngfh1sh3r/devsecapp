from fastapi.testclient import TestClient

from devsecapp.main import app

client = TestClient(app)


def test_create_vulnerability() -> None:
    payload = {
        "title": "Test vulnerability",
        "description": "Created through the API test",
        "severity": "HIGH",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    response = client.post("/vulnerabilities", json=payload)

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]
    assert data["severity"] == payload["severity"]
    assert data["status"] == payload["status"]
    assert data["affected_component"] == payload["affected_component"]
    assert isinstance(data["id"], int)
    assert data["created_at"] is not None
    assert data["updated_at"] is not None


def test_create_vulnerability_invalid_severity() -> None:
    payload = {
        "title": "Invalid vulnerability",
        "description": "This should be rejected",
        "severity": "INVALID",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    response = client.post("/vulnerabilities", json=payload)

    assert response.status_code == 422
