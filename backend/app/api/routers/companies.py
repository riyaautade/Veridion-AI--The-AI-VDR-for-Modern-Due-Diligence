from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.models import Company, User
from app.database.session import get_db
from app.schemas.company import CompanyRead, CompanyDetail
from app.schemas.user import UserRead

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("", response_model=list[CompanyRead])
def list_companies(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[Company]:
    return list(db.scalars(select(Company).order_by(Company.name.asc())))

@router.get("/me", response_model=CompanyDetail)
def get_my_company(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    company = db.get(Company, current_user.company_id)
    employees = list(db.scalars(select(User).where(User.company_id == current_user.company_id)))
    
    # We can't easily return Pydantic models when we set employees: list due to circular imports.
    # Let's just return a dict that matches CompanyDetail.
    return {
        "id": company.id,
        "name": company.name,
        "created_at": company.created_at,
        "employees": [UserRead.model_validate(e).model_dump() for e in employees]
    }
