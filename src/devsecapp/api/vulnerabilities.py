from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from devsecapp.database.connection import get_db
from devsecapp.database.models import Vulnerability
from devsecapp.schemas.vulnerability import (
    VulnerabilityCreate,
    VulnerabilityResponse,
    VulnerabilityUpdate,
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


@router.get(
    "",
    response_model=list[VulnerabilityResponse],
)
def list_vulnerabilities(
    db: Session = Depends(get_db),
) -> list[Vulnerability]:
    statement = select(Vulnerability).order_by(Vulnerability.id)
    vulnerabilities = db.scalars(statement).all()

    return vulnerabilities


@router.get(
    "/{vulnerability_id}",
    response_model=VulnerabilityResponse,
)
def get_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
) -> Vulnerability:
    vulnerability = db.get(Vulnerability, vulnerability_id)

    if vulnerability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    return vulnerability


@router.patch(
    "/{vulnerability_id}",
    response_model=VulnerabilityResponse,
)
def update_vulnerability(
    vulnerability_id: int,
    vulnerability: VulnerabilityUpdate,
    db: Session = Depends(get_db),
) -> Vulnerability:
    db_vulnerability = db.get(Vulnerability, vulnerability_id)

    if db_vulnerability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    update_data = vulnerability.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_vulnerability, field, value)

    db.commit()
    db.refresh(db_vulnerability)

    return db_vulnerability


@router.delete(
    "/{vulnerability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
) -> None:
    vulnerability = db.get(Vulnerability, vulnerability_id)

    if vulnerability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    db.delete(vulnerability)
    db.commit()
