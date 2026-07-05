import re
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database.models import RiskRule

RISK_RULES = [
    {
        "rule_key": "automatic_renewal",
        "description": "Automatic renewal language detected.",
        "severity": "medium",
        "patterns": [r"automatic(?:ally)? renew", r"renew(?:al)? automatically"],
    },
    {
        "rule_key": "arbitration_clause",
        "description": "Arbitration clause detected.",
        "severity": "low",
        "patterns": [r"arbitration"],
    },
    {
        "rule_key": "termination_clause",
        "description": "Termination clause detected.",
        "severity": "low",
        "patterns": [r"termination"],
    },
    {
        "rule_key": "unlimited_liability",
        "description": "Unlimited liability language detected.",
        "severity": "high",
        "patterns": [r"without limitation", r"unlimited liability"],
    },
    {
        "rule_key": "missing_signature",
        "description": "Document may be missing a signature section.",
        "severity": "medium",
        "patterns": [r"signed by", r"signature"],
        "invert": True,
        "document_types": ["contract", "agreement"],
    },
]


def build_risk_flags(db: Session, deal_id: int, text: str, document_type: str) -> list[dict[str, str]]:
    normalized = text.lower()
    flags: list[dict[str, str]] = []
    
    custom_rules = list(db.scalars(select(RiskRule).where(RiskRule.deal_id == deal_id, RiskRule.is_active == True)))
    
    rules_to_evaluate = list(RISK_RULES)
    for r in custom_rules:
        rules_to_evaluate.append({
            "rule_key": r.rule_key,
            "description": r.description,
            "severity": r.severity,
            "patterns": r.patterns,
            "invert": r.invert,
            "document_types": r.document_types
        })

    for rule in rules_to_evaluate:
        if rule.get("document_types") and document_type.lower() not in rule.get("document_types", []):
            continue

        found = any(re.search(pattern, normalized) for pattern in rule["patterns"])
        if rule.get("invert"):
            if not found:
                flags.append(
                    {
                        "rule_key": rule["rule_key"],
                        "description": rule["description"],
                        "severity": rule["severity"],
                    }
                )
        elif found:
            flags.append(
                {
                    "rule_key": rule["rule_key"],
                    "description": rule["description"],
                    "severity": rule["severity"],
                }
            )

    return flags
