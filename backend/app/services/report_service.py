import json
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.models import User, Document, RiskFlag
from app.services.deal_service import require_deal_access
from app.ai.provider import get_llm_provider
from app.schemas.report import DealReport, TimelineEvent

def generate_deal_report(db: Session, deal_id: int, user: User) -> DealReport:
    require_deal_access(db, deal_id, user)

    # Gather data
    documents = list(db.scalars(select(Document).where(Document.deal_id == deal_id)))
    risk_flags = list(db.scalars(select(RiskFlag).where(RiskFlag.deal_id == deal_id)))
    high_risks = sum(1 for r in risk_flags if r.severity == "high")

    if not documents:
        return DealReport(
            deal_id=deal_id,
            executive_summary="No documents available for this deal.",
            timeline=[],
            total_documents=0,
            high_risks=high_risks,
        )

    # Create a summary context (truncate safely)
    doc_contexts = []
    for doc in documents:
        text = doc.extracted_text or ""
        doc_contexts.append(f"Document: {doc.original_filename}\n{text[:5000]}")
    
    combined_context = "\n\n".join(doc_contexts)[:20000]

    llm = get_llm_provider()

    # 1. Generate Executive Summary
    summary_prompt = (
        "You are an expert M&A legal analyst. Based on the following document excerpts, "
        "write a concise executive summary of the deal. Highlight the key parties, the main purpose, "
        "and any critical obligations or risks.\n\n"
        f"{combined_context}\n\n"
        "Executive Summary:"
    )
    executive_summary = llm.generate(summary_prompt, max_tokens=600)

    # 2. Generate Timeline
    timeline_prompt = (
        "You are an expert M&A legal analyst. Based on the following document excerpts, "
        "extract the key dates and events to form a timeline. "
        "Return ONLY a valid JSON array of objects with keys 'date', 'event', and 'document_source'. "
        "Do not include markdown blocks or any other text.\n\n"
        f"{combined_context}\n\n"
        "JSON output:"
    )
    timeline_json_str = llm.generate(timeline_prompt, max_tokens=1000)
    
    # Parse timeline JSON safely
    timeline_events = []
    try:
        # Some LLMs might wrap it in ```json ... ```
        clean_json = timeline_json_str.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        events_list = json.loads(clean_json.strip())
        for e in events_list:
            timeline_events.append(TimelineEvent(
                date=e.get("date", ""),
                event=e.get("event", ""),
                document_source=e.get("document_source", "")
            ))
    except Exception as e:
        print(f"Failed to parse timeline JSON: {e}")
        # fallback
        timeline_events = []

    return DealReport(
        deal_id=deal_id,
        executive_summary=executive_summary,
        timeline=timeline_events,
        total_documents=len(documents),
        high_risks=high_risks,
    )
