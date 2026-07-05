from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.database.models import DocumentStatus

class DocumentUpdate(BaseModel):
    original_filename: str | None = None
    document_type: str | None = None
    allowed_roles: list[str] | None = None


class DocumentRead(BaseModel):
    id: int
    deal_id: int
    uploaded_by: int
    filename: str
    original_filename: str
    file_type: str
    document_type: str
    status: DocumentStatus
    page_count: int | None
    allowed_roles: list[str]
    processing_error: str | None
    created_at: datetime
    processed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class DocumentPreview(BaseModel):
    id: int
    filename: str
    status: DocumentStatus
    extracted_text: str | None

    model_config = ConfigDict(from_attributes=True)
