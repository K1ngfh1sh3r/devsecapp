import os

os.environ["ENV_FILE"] = ".env.test"

import pytest

from devsecapp.database.connection import engine
from devsecapp.database.models import Base


@pytest.fixture(scope="session", autouse=True)
def reset_test_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    yield
