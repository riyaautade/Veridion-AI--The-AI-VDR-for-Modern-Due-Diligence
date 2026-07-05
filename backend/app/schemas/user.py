from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.database.models import UserRole
from app.schemas.company import CompanyRead


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    role: str
    company_name: str = Field(min_length=1, max_length=255)

class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    company_id: int
    company: CompanyRead
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
