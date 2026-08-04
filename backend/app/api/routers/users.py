from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.models import User, UserRole
from app.database.session import get_db
from app.schemas.user import UserRead, UserUpdate
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser) -> User:
    return current_user

@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user = db.get(User, current_user.id)
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.password is not None:
        user.hashed_password = hash_password(payload.password)
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/buyers", response_model=list[UserRead])
def list_buyers(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    company_id: int | None = None,
) -> list[User]:
    # Allow any authenticated user to list buyer users so they can add them to deals
    stmt = select(User).where(User.role.astext.like("buyer_%"))
    if company_id:
        stmt = stmt.where(User.company_id == company_id)
    return list(db.scalars(stmt.order_by(User.created_at.desc())))

@router.get("", response_model=list[UserRead])
def list_users(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[User]:
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can list users.",
        )

    return list(db.scalars(select(User).order_by(User.created_at.desc())))
