from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_deals: int
    total_documents: int
    total_risks: int
    active_deal_members: int
