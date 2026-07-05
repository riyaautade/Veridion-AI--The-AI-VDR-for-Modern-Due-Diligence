from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.database.models import DealUser, Document, RiskFlag
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)]
) -> DashboardStats:
    
    # Get all deal_ids the user is a member of
    user_deal_ids_query = select(DealUser.deal_id).where(DealUser.user_id == current_user.id)
    user_deal_ids = db.scalars(user_deal_ids_query).all()
    
    total_deals = len(user_deal_ids)

    if total_deals == 0:
        return DashboardStats(
            total_deals=0,
            total_documents=0,
            total_risks=0,
            active_deal_members=0
        )
    
    # Count total documents for these deals
    total_docs = db.scalar(
        select(func.count(Document.id)).where(Document.deal_id.in_(user_deal_ids))
    ) or 0
    
    # Count total risks
    total_risks = db.scalar(
        select(func.count(RiskFlag.id)).where(RiskFlag.deal_id.in_(user_deal_ids))
    ) or 0
    
    # Count unique active members across these deals
    active_members = db.scalar(
        select(func.count(func.distinct(DealUser.user_id))).where(DealUser.deal_id.in_(user_deal_ids))
    ) or 0
    
    return DashboardStats(
        total_deals=total_deals,
        total_documents=total_docs,
        total_risks=total_risks,
        active_deal_members=active_members
    )
