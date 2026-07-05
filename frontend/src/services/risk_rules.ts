import api from './api';

export interface RiskRule {
  id: number;
  deal_id: number;
  rule_key: string;
  description: string;
  severity: string;
  patterns: string[];
  invert: boolean;
  document_types: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface RiskRuleCreate {
  rule_key: string;
  description: string;
  severity: string;
  patterns: string[];
  invert?: boolean;
  document_types?: string[] | null;
  is_active?: boolean;
}

export function listRiskRules(dealId: number) {
  return api.get<RiskRule[]>(`/deals/${dealId}/risk-rules`);
}

export function createRiskRule(dealId: number, data: RiskRuleCreate) {
  return api.post<RiskRule>(`/deals/${dealId}/risk-rules`, data);
}

export function updateRiskRule(dealId: number, ruleId: number, data: Partial<RiskRuleCreate>) {
  return api.patch<RiskRule>(`/deals/${dealId}/risk-rules/${ruleId}`, data);
}

export function deleteRiskRule(dealId: number, ruleId: number) {
  return api.delete(`/deals/${dealId}/risk-rules/${ruleId}`);
}
