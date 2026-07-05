from typing import Any
from app.schemas.search import SearchResponse, SearchSource
from app.ai.provider import get_llm_provider
from app.database.models import User
from app.retrieval.search_service import search_document_chunks
from app.services.deal_service import require_deal_access
from sqlalchemy.orm import Session


def build_rag_prompt(query: str, chunks: list[dict[str, object]]) -> str:
    evidence_lines = []
    for chunk in chunks:
        page = chunk.get("page_number")
        page_label = f"page {page}" if page is not None else "unknown page"
        evidence_lines.append(
            f"[{chunk.get('original_filename')} - {page_label}]\n{chunk.get('text')}"
        )

    evidence_body = "\n\n---\n\n".join(evidence_lines)

    return (
        "You are an M&A due diligence assistant. Use only the evidence from the retrieved document chunks. "
        "Do not hallucinate or invent details. If the answer cannot be derived from the evidence, say 'I couldn't find supporting evidence.'\n\n"
        "Evidence:\n"
        f"{evidence_body}\n\n"
        "Question: "
        f"{query}\n\n"
        "Answer with concise legal analysis and cite the source filenames and page numbers."
    )


def run_rag_query(db: Session, deal_id: int, user: User, query: str) -> SearchResponse:
    require_deal_access(db, deal_id, user)

    # `user.role` is stored as a string in the DB
    chunks = search_document_chunks(deal_id, user.role, query, limit=5)
    if not chunks:
        return SearchResponse(
            answer="I couldn't find supporting evidence.",
            sources=[],
        )

    prompt = build_rag_prompt(query, chunks)
    llm = get_llm_provider()
    answer = llm.generate(prompt, max_tokens=400)

    sources = [
        SearchSource(
            filename=str(chunk.get("original_filename")),
            page_number=int(chunk.get("page_number")) if chunk.get("page_number") is not None else None,
            score=float(chunk.get("score", 0.0)),
            text=str(chunk.get("text", "")),
        )
        for chunk in chunks
    ]

    return SearchResponse(
        answer=answer,
        sources=sources,
    )
