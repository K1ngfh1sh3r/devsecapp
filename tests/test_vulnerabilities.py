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


def test_list_vulnerabilities() -> None:
    payload = {
        "title": "List test vulnerability",
        "description": "Created for the list endpoint test",
        "severity": "MEDIUM",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    response = client.get("/vulnerabilities")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(
        vulnerability["title"] == "List test vulnerability" for vulnerability in data
    )


def test_get_vulnerability() -> None:
    payload = {
        "title": "Get test vulnerability",
        "description": "Created for the get endpoint test",
        "severity": "HIGH",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    vulnerability_id = create_response.json()["id"]

    response = client.get(f"/vulnerabilities/{vulnerability_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == vulnerability_id
    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]
    assert data["severity"] == payload["severity"]
    assert data["status"] == payload["status"]
    assert data["affected_component"] == payload["affected_component"]


def test_get_vulnerability_not_found() -> None:
    response = client.get("/vulnerabilities/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Vulnerability not found"}


def test_update_vulnerability() -> None:
    payload = {
        "title": "Update test vulnerability",
        "description": "Original description",
        "severity": "MEDIUM",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    vulnerability_id = create_response.json()["id"]

    update_response = client.patch(
        f"/vulnerabilities/{vulnerability_id}",
        json={"severity": "CRITICAL"},
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == vulnerability_id
    assert data["severity"] == "CRITICAL"
    assert data["title"] == payload["title"]
    assert data["status"] == payload["status"]


def test_update_multiple_vulnerability_fields() -> None:
    payload = {
        "title": "Multiple update test",
        "description": "Original description",
        "severity": "LOW",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    vulnerability_id = create_response.json()["id"]

    update_response = client.patch(
        f"/vulnerabilities/{vulnerability_id}",
        json={
            "title": "Updated vulnerability",
            "severity": "HIGH",
            "status": "IN_PROGRESS",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["title"] == "Updated vulnerability"
    assert data["severity"] == "HIGH"
    assert data["status"] == "IN_PROGRESS"
    assert data["description"] == payload["description"]
    assert data["affected_component"] == payload["affected_component"]


def test_update_vulnerability_not_found() -> None:
    response = client.patch(
        "/vulnerabilities/999999",
        json={"severity": "CRITICAL"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Vulnerability not found"}


def test_update_vulnerability_updates_timestamp() -> None:
    payload = {
        "title": "Timestamp test",
        "description": "Testing updated_at",
        "severity": "LOW",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    created_data = create_response.json()
    vulnerability_id = created_data["id"]
    created_at = created_data["created_at"]
    updated_at = created_data["updated_at"]

    update_response = client.patch(
        f"/vulnerabilities/{vulnerability_id}",
        json={"severity": "HIGH"},
    )

    assert update_response.status_code == 200

    updated_data = update_response.json()

    assert updated_data["created_at"] == created_at
    assert updated_data["updated_at"] != updated_at


def test_delete_vulnerability() -> None:
    payload = {
        "title": "Delete test vulnerability",
        "description": "Created for the delete endpoint test",
        "severity": "HIGH",
        "status": "OPEN",
        "affected_component": "test-api",
    }

    create_response = client.post("/vulnerabilities", json=payload)

    assert create_response.status_code == 201

    vulnerability_id = create_response.json()["id"]

    delete_response = client.delete(f"/vulnerabilities/{vulnerability_id}")

    assert delete_response.status_code == 204
    assert delete_response.content == b""

    get_response = client.get(f"/vulnerabilities/{vulnerability_id}")

    assert get_response.status_code == 404


def test_delete_vulnerability_not_found() -> None:
    response = client.delete("/vulnerabilities/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Vulnerability not found"}
