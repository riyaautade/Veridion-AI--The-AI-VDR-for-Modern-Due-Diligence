from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RiskFlagRead(BaseModel):
    id: int
    deal_id: int
    document_id: int
    rule_key: str
    description: str
    severity: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskSummary(BaseModel):
    total_flags: int
    high: int
    medium: int
    low: int

class RiskRuleBase(BaseModel):
    rule_key: str
    description: str
    severity: str
    patterns: list[str]
    invert: bool = False
    document_types: list[str] | None = None
    is_active: bool = True

class RiskRuleCreate(RiskRuleBase):
    pass

class RiskRuleUpdate(BaseModel):
    description: str | None = None
    severity: str | None = None
    patterns: list[str] | None = None
    invert: bool | None = None
    document_types: list[str] | None = None
    is_active: bool | None = None

class RiskRuleRead(RiskRuleBase):
    id: int
    deal_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
