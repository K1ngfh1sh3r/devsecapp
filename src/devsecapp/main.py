from fastapi import FastAPI

from devsecapp.api.vulnerabilities import router as vulnerabilities_router
from devsecapp.database.connection import engine
from devsecapp.database.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevSecApp",
    description="Secure vulnerability management API",
    version="0.1.0",
)

app.include_router(vulnerabilities_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}