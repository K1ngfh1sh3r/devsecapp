import pytest
from fastapi.testclient import TestClient

from devsecapp.main import create_app


@pytest.mark.parametrize(
    "client_ip",
    [
        "10.20.30.10",
        "10.20.40.10",
        "192.168.1.10",
    ],
)
def test_unauthorized_networks_are_denied(
    client: TestClient,
    client_ip: str,
) -> None:
    response = client.get(
        "/vulnerabilities",
        headers={"X-Real-IP": client_ip},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Access denied: unauthorized network"}


@pytest.mark.parametrize(
    "client_ip,expected_detail",
    [
        ("", "Access denied: client IP is missing"),
        ("not-an-ip", "Access denied: invalid client IP"),
    ],
)
def test_invalid_client_ip_is_denied(
    client: TestClient,
    client_ip: str,
    expected_detail: str,
) -> None:
    response = client.get(
        "/vulnerabilities",
        headers={"X-Real-IP": client_ip},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": expected_detail}


def test_missing_client_ip_header_is_denied(test_engine) -> None:
    app = create_app(test_engine)

    with TestClient(app) as untrusted_client:
        response = untrusted_client.get("/vulnerabilities")

    assert response.status_code == 403
    assert response.json() == {"detail": "Access denied: client IP is missing"}


@pytest.mark.parametrize(
    "client_ip,expected_role",
    [
        ("10.20.10.10", "IT"),
        ("10.20.20.10", "Developer"),
    ],
)
def test_current_role_endpoint(
    client: TestClient,
    client_ip: str,
    expected_role: str,
) -> None:
    response = client.get(
        "/me",
        headers={"X-Real-IP": client_ip},
    )

    assert response.status_code == 200
    assert response.json() == {"role": expected_role}


@pytest.mark.parametrize(
    "client_ip",
    [
        "10.20.30.10",
        "10.20.40.10",
        "192.168.1.10",
    ],
)
def test_current_role_endpoint_denies_unauthorized_networks(
    client: TestClient,
    client_ip: str,
) -> None:
    response = client.get(
        "/me",
        headers={"X-Real-IP": client_ip},
    )

    assert response.status_code == 403
