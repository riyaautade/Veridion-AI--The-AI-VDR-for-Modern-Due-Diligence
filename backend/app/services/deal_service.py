from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.models import Deal, DealUser, User, UserRole, DealStatus
from app.schemas.deal import DealCreate, DealUpdate


def require_deal_access(db: Session, deal_id: int, user: User) -> Deal:
    deal = db.get(Deal, deal_id)
    if not deal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")

    if user.role == UserRole.ADMIN.value:
        return deal

    membership = db.scalar(
        select(DealUser).where(DealUser.deal_id == deal_id, DealUser.user_id == user.id)
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this deal.",
        )

    return deal


def require_deal_manager(db: Session, deal_id: int, user: User) -> Deal:
    deal = require_deal_access(db, deal_id, user)
    if user.role not in {UserRole.ADMIN.value, UserRole.SELLER_ADMIN.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller admins can manage this deal.",
        )
    return deal


def create_deal(db: Session, payload: DealCreate, user: User) -> Deal:
    if user.role not in {UserRole.ADMIN.value, UserRole.SELLER_ADMIN.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller admins can create deals.",
        )

    # ensure we pass the status as a lowercase string value to match DB enum literals
    deal = Deal(
        **payload.model_dump(), 
        seller_company_id=user.company_id,
        created_by=user.id, 
        status=DealStatus.ACTIVE.value
    )
    db.add(deal)
    db.flush()
    db.add(DealUser(deal_id=deal.id, user_id=user.id, role=user.role))
    db.commit()
    db.refresh(deal)
    return deal


def list_deals(db: Session, user: User) -> list[Deal]:
    statement = select(Deal).order_by(Deal.created_at.desc())
    if user.role != UserRole.ADMIN.value:
        statement = statement.join(DealUser).where(DealUser.user_id == user.id)
    return list(db.scalars(statement))


def update_deal(db: Session, deal_id: int, payload: DealUpdate, user: User) -> Deal:
    deal = require_deal_manager(db, deal_id, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(deal, field, value)
    db.commit()
    db.refresh(deal)
    return deal


def delete_deal(db: Session, deal_id: int, user: User) -> None:
    deal = require_deal_manager(db, deal_id, user)
    db.delete(deal)
    db.commit()


def add_deal_user(db: Session, deal_id: int, user_id: int, role: str, user: User) -> DealUser:
    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    deal = require_deal_manager(db, deal_id, user)
    
    # Enforce company mapping based on role
    if role.startswith("seller") and target_user.company_id != deal.seller_company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User's company does not match deal's seller company."
        )
    elif role.startswith("buyer") and target_user.company_id != deal.buyer_company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User's company does not match deal's buyer company."
        )

    existing = db.scalar(
        select(DealUser).where(DealUser.deal_id == deal_id, DealUser.user_id == user_id)
    )
    if existing:
        existing.role = role
        db.commit()
        return existing

    membership = DealUser(deal_id=deal_id, user_id=user_id, role=role)
    db.add(membership)
    db.commit()
    return membership


def remove_deal_user(db: Session, deal_id: int, user_id: int, user: User) -> None:
    require_deal_manager(db, deal_id, user)
    
    if user_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself from the deal."
        )

    membership = db.scalar(
        select(DealUser).where(DealUser.deal_id == deal_id, DealUser.user_id == user_id)
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User is not part of this deal.")
        
    db.delete(membership)
    db.commit()


def list_deal_users(db: Session, deal_id: int, user: User) -> list[DealUser]:
    require_deal_access(db, deal_id, user)
    return list(
        db.scalars(
            select(DealUser)
            .options(selectinload(DealUser.user))
            .where(DealUser.deal_id == deal_id)
            .order_by(DealUser.created_at.desc())
        )
    )
