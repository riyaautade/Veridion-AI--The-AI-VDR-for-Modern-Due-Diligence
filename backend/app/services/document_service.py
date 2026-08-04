from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.database.models import Document, DocumentChunk, DocumentStatus, RiskFlag, User, UserRole
from app.parsing.docx_parser import extract_docx_text
from app.parsing.pdf_parser import extract_pdf_text
from app.parsing.text_cleaner import normalize_text
from app.retrieval.chunking import split_text
from app.retrieval.search_service import index_document_chunks
from app.services.deal_service import require_deal_access, require_deal_manager
from app.services.risk_service import detect_and_save_risks
from app.storage.local_storage import save_upload_file

SUPPORTED_FILE_TYPES = {".pdf", ".docx"}
DEFAULT_ALLOWED_ROLES = [role.value for role in UserRole]


def parse_allowed_roles(raw_roles: str | None) -> list[str]:
    if not raw_roles:
        return DEFAULT_ALLOWED_ROLES

    roles = [role.strip() for role in raw_roles.split(",") if role.strip()]
    valid_roles = {role.value for role in UserRole}
    invalid_roles = sorted(set(roles) - valid_roles)
    if invalid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid roles: {', '.join(invalid_roles)}.",
        )
    return roles


def can_view_document(document: Document, user: User) -> bool:
    # `user.role` is stored as a string in the DB; compare against enum values
    return user.role == UserRole.ADMIN.value or user.role in document.allowed_roles


async def create_document(
    db: Session,
    deal_id: int,
    upload: UploadFile,
    document_type: str,
    allowed_roles: str | None,
    user: User,
) -> Document:
    require_deal_manager(db, deal_id, user)

    original_name = Path(upload.filename or "").name
    suffix = Path(original_name).suffix.lower()
    if suffix not in SUPPORTED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only DOCX and digital PDF files are supported.",
        )

    roles = parse_allowed_roles(allowed_roles)
    stored_name, file_path = await run_in_threadpool(save_upload_file, deal_id, upload)

    document = Document(
        deal_id=deal_id,
        uploaded_by=user.id,
        filename=stored_name,
        original_filename=original_name,
        file_path=file_path,
        file_type=suffix.lstrip("."),
        document_type=document_type,
        status=DocumentStatus.PROCESSING.value,
        allowed_roles=roles,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        if suffix == ".pdf":
            extracted_text, page_count = await run_in_threadpool(extract_pdf_text, file_path)
        else:
            extracted_text, page_count = await run_in_threadpool(extract_docx_text, file_path)

        normalized = normalize_text(extracted_text)
        document.extracted_text = normalized
        document.page_count = page_count
        document.status = DocumentStatus.READY.value
        document.processed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(document)

        chunks = _create_document_chunks(db, document, normalized)
        index_document_chunks(document, chunks, roles)
        detect_and_save_risks(db, document, normalized)
    except Exception as exc:
        document.status = DocumentStatus.FAILED.value
        document.processing_error = str(exc)
        document.processed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(document)
    finally:
        # Delete the uploaded file to save storage
        await run_in_threadpool(_delete_file, file_path)

    return document


def _delete_file(file_path: str) -> None:
    """Delete the uploaded file after extraction."""
    try:
        path = Path(file_path)
        if path.exists():
            path.unlink()
    except Exception:
        # Silently ignore deletion errors
        pass


def _create_document_chunks(db: Session, document: Document, text: str) -> list[DocumentChunk]:
    chunk_texts = split_text(text)
    chunks = [
        DocumentChunk(
            document_id=document.id,
            deal_id=document.deal_id,
            chunk_index=index,
            page_number=None,
            text=chunk_text,
        )
        for index, chunk_text in enumerate(chunk_texts)
    ]
    db.add_all(chunks)
    db.commit()
    return chunks


def list_documents(db: Session, deal_id: int, user: User) -> list[Document]:
    require_deal_access(db, deal_id, user)
    documents = list(
        db.scalars(
            select(Document)
            .where(Document.deal_id == deal_id)
            .order_by(Document.created_at.desc())
        )
    )
    return [document for document in documents if can_view_document(document, user)]


def get_document(db: Session, deal_id: int, document_id: int, user: User) -> Document:
    require_deal_access(db, deal_id, user)
    document = db.scalar(
        select(Document).where(Document.id == document_id, Document.deal_id == deal_id)
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    if not can_view_document(document, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this document.",
        )
    return document


def delete_document(db: Session, deal_id: int, document_id: int, user: User) -> None:
    require_deal_manager(db, deal_id, user)
    document = db.scalar(
        select(Document).where(Document.id == document_id, Document.deal_id == deal_id)
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    db.delete(document)
    db.commit()


def delete_all_documents(db: Session, deal_id: int, user: User) -> None:
    # Only a deal manager may delete all documents
    require_deal_manager(db, deal_id, user)

    documents = list(
        db.scalars(
            select(Document).where(Document.deal_id == deal_id)
        )
    )

    for document in documents:
        db.delete(document)

    db.commit()
