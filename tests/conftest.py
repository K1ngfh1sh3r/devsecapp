from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.pool import StaticPool

from devsecapp.main import create_app


@pytest.fixture
def test_engine() -> Generator[Engine]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    yield engine

    engine.dispose()


@pytest.fixture
def client(test_engine: Engine) -> Generator[TestClient]:
    app: FastAPI = create_app(test_engine)

    with TestClient(
        app,
        headers={"X-Real-IP": "10.20.20.10"},
    ) as test_client:
        yield test_client


@pytest.fixture
def it_client(test_engine: Engine) -> Generator[TestClient]:
    app: FastAPI = create_app(test_engine)

    with TestClient(
        app,
        headers={"X-Real-IP": "10.20.10.10"},
    ) as test_client:
        yield test_client
