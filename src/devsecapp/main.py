from collections.abc import Generator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from devsecapp.api.vulnerabilities import router as vulnerabilities_router
from devsecapp.database.connection import engine, get_db
from devsecapp.database.models import Base
from devsecapp.security.authorization import Role, get_current_role


def create_app(database_engine: Engine) -> FastAPI:
    SessionFactory = sessionmaker(
        bind=database_engine,
        autoflush=False,
        autocommit=False,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        Base.metadata.create_all(bind=database_engine)
        yield

    app = FastAPI(
        title="DevSecApp",
        description="Secure vulnerability management API",
        version="0.1.0",
        lifespan=lifespan,
    )

    def get_database_session() -> Generator[Session]:
        db = SessionFactory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_database_session
    app.include_router(vulnerabilities_router)


    @app.get("/me")
    def get_current_user(
        current_role: Role = Depends(get_current_role),
    ) -> dict[str, str]:
        return {"role": current_role.value}

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app(engine)
