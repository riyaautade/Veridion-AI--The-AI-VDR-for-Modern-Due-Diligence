from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.document import DocumentPreview, DocumentRead, DocumentUpdate
from app.services import document_service
from app.services.deal_service import require_deal_manager

router = APIRouter(prefix="/deals/{deal_id}/documents", tags=["documents"])


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    file: Annotated[UploadFile, File()],
    document_type: Annotated[str, Form()] = "general",
    allowed_roles: Annotated[str | None, Form()] = None,
):
    return await document_service.create_document(
        db=db,
        deal_id=deal_id,
        upload=file,
        document_type=document_type,
        allowed_roles=allowed_roles,
        user=current_user,
    )


@router.get("", response_model=list[DocumentRead])
def list_documents(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return document_service.list_documents(db, deal_id, current_user)


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    deal_id: int,
    document_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return document_service.get_document(db, deal_id, document_id, current_user)


@router.get("/{document_id}/preview", response_model=DocumentPreview)
def preview_document(
    deal_id: int,
    document_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    return document_service.get_document(db, deal_id, document_id, current_user)

@router.patch("/{document_id}", response_model=DocumentRead)
def update_document(
    deal_id: int,
    document_id: int,
    payload: DocumentUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    require_deal_manager(db, deal_id, current_user)
    doc = document_service.get_document(db, deal_id, document_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{document_id}/download")
def download_document(
    deal_id: int,
    document_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    # Only deal managers may download original files
    require_deal_manager(db, deal_id, current_user)
    document = document_service.get_document(db, deal_id, document_id, current_user)
    return FileResponse(
        path=document.file_path,
        filename=document.original_filename,
        media_type="application/octet-stream",
    )


@router.get("/{document_id}/view")
def view_document(
    deal_id: int,
    document_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    document = document_service.get_document(db, deal_id, document_id, current_user)
    media_type = "application/pdf" if document.file_type == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(
        path=document.file_path,
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="{document.original_filename}"'}
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    deal_id: int,
    document_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    document_service.delete_document(db, deal_id, document_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_documents(
    deal_id: int,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    document_service.delete_all_documents(db, deal_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
