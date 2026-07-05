from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Deal, RiskFlag, User, Document
from app.database.models import UserRole
from app.services.deal_service import require_deal_access
from app.risk.risk_engine import build_risk_flags
from app.schemas.risk import RiskSummary


def detect_and_save_risks(db: Session, document: "Document", text: str) -> None:
    flags = build_risk_flags(db, document.deal_id, text, document.document_type)
    for flag in flags:
        db.add(
            RiskFlag(
                deal_id=document.deal_id,
                document_id=document.id,
                rule_key=flag["rule_key"],
                description=flag["description"],
                severity=flag["severity"],
            )
        )
    db.commit()


def get_deal_risk_summary(db: Session, deal_id: int, user: User) -> RiskSummary:
    require_deal_access(db, deal_id, user)

    result = db.execute(
        select(RiskFlag.severity).where(RiskFlag.deal_id == deal_id)
    ).all()
    severities = [row[0] for row in result]
    return RiskSummary(
        total_flags=len(severities),
        high=severities.count("high"),
        medium=severities.count("medium"),
        low=severities.count("low"),
    )


def list_risk_flags(db: Session, deal_id: int, user: User) -> list[RiskFlag]:
    require_deal_access(db, deal_id, user)
    return list(db.scalars(select(RiskFlag).where(RiskFlag.deal_id == deal_id).order_by(RiskFlag.created_at.desc())))
