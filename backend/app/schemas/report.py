from pydantic import BaseModel

class TimelineEvent(BaseModel):
    date: str
    event: str
    document_source: str

class DealReport(BaseModel):
    deal_id: int
    executive_summary: str
    timeline: list[TimelineEvent]
    total_documents: int
    high_risks: int
