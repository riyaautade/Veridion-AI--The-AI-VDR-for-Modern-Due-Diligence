from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.search import SearchRequest, SearchResponse, CompareRequest, CompareResponse
from app.services.ai_service import answer_question

router = APIRouter(prefix="/deals/{deal_id}", tags=["ai"])


@router.post("/search", response_model=SearchResponse)
def search_deal_documents(
    deal_id: int,
    payload: SearchRequest,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> SearchResponse:
    """Search deal documents via RAG-powered retrieval and answer generation."""
    return answer_question(db, deal_id, current_user, payload.query)


@router.post("/compare", response_model=CompareResponse)
def compare_deal_documents(
    deal_id: int,
    payload: CompareRequest,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> CompareResponse:
    """Compare two documents using LLM."""
    from app.services.ai_service import compare_documents
    result = compare_documents(db, deal_id, current_user, payload.document_id_1, payload.document_id_2)
    return CompareResponse(comparison=result)
