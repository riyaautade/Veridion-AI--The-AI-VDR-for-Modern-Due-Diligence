from typing import Any
from app.rag import run_rag_query
from app.schemas.search import SearchResponse
from app.database.models import User
from sqlalchemy.orm import Session
from app.services.document_service import get_document
from app.ai.provider import get_llm_provider


def answer_question(db: Session, deal_id: int, user: User, query: str) -> SearchResponse:
    return run_rag_query(db, deal_id, user, query)


def compare_documents(db: Session, deal_id: int, user: User, doc_id_1: int, doc_id_2: int) -> str:
    doc1 = get_document(db, deal_id, doc_id_1, user)
    doc2 = get_document(db, deal_id, doc_id_2, user)

    text1 = doc1.extracted_text or ""
    text2 = doc2.extracted_text or ""

    # Simple truncation to fit within context window limits if they are very large
    # Llama-3.3-70b supports 8k/32k depending on Groq config. We'll limit to ~20000 chars each for safety.
    text1 = text1[:20000]
    text2 = text2[:20000]

    prompt = (
        "You are an expert M&A legal assistant. Compare the following two documents and identify the key differences. "
        "Focus on changes in liability, term length, governance, termination rights, and financial obligations. "
        "Format the response using clear headings and bullet points.\n\n"
        f"--- Document 1: {doc1.original_filename} ---\n{text1}\n\n"
        f"--- Document 2: {doc2.original_filename} ---\n{text2}\n\n"
        "Comparison Report:"
    )

    llm = get_llm_provider()
    # We can pass max_tokens via kwargs if supported by Groq provider wrapper
    return llm.generate(prompt, max_tokens=1000)

