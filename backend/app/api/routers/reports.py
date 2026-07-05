from typing import Annotated
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.report import DealReport
from app.services.report_service import generate_deal_report

router = APIRouter(prefix="/deals/{deal_id}", tags=["reports"])

@router.post("/report", response_model=DealReport)
def create_deal_report(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> DealReport:
    """Generate the executive summary and timeline for the deal."""
    return generate_deal_report(db, deal_id, current_user)
