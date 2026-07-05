from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.risk import RiskFlagRead, RiskSummary
from app.services.risk_service import get_deal_risk_summary, list_risk_flags

router = APIRouter(prefix="/deals/{deal_id}", tags=["risks"])


@router.get("/risks", response_model=RiskSummary)
def deal_risk_summary(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> RiskSummary:
    return get_deal_risk_summary(db, deal_id, current_user)


@router.get("/risks/flags", response_model=list[RiskFlagRead])
def deal_risk_flags(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[RiskFlagRead]:
    flags = list_risk_flags(db, deal_id, current_user)
    return [RiskFlagRead.model_validate(f) for f in flags]
