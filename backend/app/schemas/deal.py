from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.database.models import DealStatus, UserRole
from app.schemas.user import UserRead
from app.schemas.company import CompanyRead


class DealCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    buyer_company_id: int


class DealUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    status: DealStatus | None = None


class DealRead(BaseModel):
    id: int
    name: str
    description: str | None
    seller_company_id: int
    seller_company: CompanyRead
    buyer_company_id: int
    buyer_company: CompanyRead
    status: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DealUserCreate(BaseModel):
    user_id: int
    role: str


class DealUserRead(BaseModel):
    id: int
    deal_id: int
    user_id: int
    role: str
    created_at: datetime
    user: UserRead

    model_config = ConfigDict(from_attributes=True)
