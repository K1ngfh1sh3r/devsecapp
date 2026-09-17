from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from devsecapp.database.connection import get_db
from devsecapp.database.models import Vulnerability
from devsecapp.schemas.vulnerability import (
    VulnerabilityCreate,
    VulnerabilityResponse,
)

router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


@router.post(
    "",
    response_model=VulnerabilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vulnerability(
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
) -> Vulnerability:
    db_vulnerability = Vulnerability(
        title=vulnerability.title,
        description=vulnerability.description,
        severity=vulnerability.severity,
        status=vulnerability.status,
        affected_component=vulnerability.affected_component,
    )

    db.add(db_vulnerability)
    db.commit()
    db.refresh(db_vulnerability)

    return db_vulnerability
