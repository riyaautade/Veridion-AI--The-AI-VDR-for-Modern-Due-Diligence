from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.models import RiskRule, Deal
from app.database.session import get_db
from app.schemas.risk import RiskRuleCreate, RiskRuleRead, RiskRuleUpdate
from app.services.deal_service import require_deal_manager, require_deal_access

router = APIRouter(prefix="/deals/{deal_id}/risk-rules", tags=["risk_rules"])


@router.post("", response_model=RiskRuleRead, status_code=status.HTTP_201_CREATED)
def create_risk_rule(
    deal_id: int,
    payload: RiskRuleCreate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    require_deal_access(db, deal_id, current_user)
    
    # ensure rule_key is unique per deal
    existing = db.scalar(select(RiskRule).where(RiskRule.deal_id == deal_id, RiskRule.rule_key == payload.rule_key))
    if existing:
        raise HTTPException(status_code=400, detail="A rule with this key already exists for this deal.")

    rule = RiskRule(
        deal_id=deal_id,
        **payload.model_dump()
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("", response_model=list[RiskRuleRead])
def list_risk_rules(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    require_deal_access(db, deal_id, current_user)
    rules = list(db.scalars(select(RiskRule).where(RiskRule.deal_id == deal_id).order_by(RiskRule.created_at.desc())))
    return rules


@router.patch("/{rule_id}", response_model=RiskRuleRead)
def update_risk_rule(
    deal_id: int,
    rule_id: int,
    payload: RiskRuleUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    require_deal_access(db, deal_id, current_user)
    rule = db.scalar(select(RiskRule).where(RiskRule.id == rule_id, RiskRule.deal_id == deal_id))
    if not rule:
        raise HTTPException(status_code=404, detail="Risk rule not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
        
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk_rule(
    deal_id: int,
    rule_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    require_deal_access(db, deal_id, current_user)
    rule = db.scalar(select(RiskRule).where(RiskRule.id == rule_id, RiskRule.deal_id == deal_id))
    if not rule:
        raise HTTPException(status_code=404, detail="Risk rule not found.")
        
    db.delete(rule)
    db.commit()
