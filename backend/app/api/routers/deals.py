from typing import Annotated

# pyrefly: ignore [missing-import]

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.deal import DealCreate, DealRead, DealUpdate, DealUserCreate, DealUserRead
from app.services import deal_service

router = APIRouter(prefix="/deals", tags=["deals"])


@router.post("", response_model=DealRead, status_code=status.HTTP_201_CREATED)
def create_deal(
    payload: DealCreate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.create_deal(db, payload, current_user)


@router.get("", response_model=list[DealRead])
def list_deals(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.list_deals(db, current_user)


@router.get("/{deal_id}", response_model=DealRead)
def get_deal(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.require_deal_access(db, deal_id, current_user)


@router.patch("/{deal_id}", response_model=DealRead)
def update_deal(
    deal_id: int,
    payload: DealUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.update_deal(db, deal_id, payload, current_user)


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    deal_service.delete_deal(db, deal_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{deal_id}/users", response_model=DealUserRead, status_code=status.HTTP_201_CREATED)
def add_deal_user(
    deal_id: int,
    payload: DealUserCreate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.add_deal_user(db, deal_id, payload.user_id, payload.role, current_user)


@router.get("/{deal_id}/users", response_model=list[DealUserRead])
def list_deal_users(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return deal_service.list_deal_users(db, deal_id, current_user)

@router.delete("/{deal_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_deal_user(
    deal_id: int,
    user_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    deal_service.remove_deal_user(db, deal_id, user_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
