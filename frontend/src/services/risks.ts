import api from './api';
import { RiskFlag, RiskSummary } from '../types/api';

export function getRiskSummary(dealId: number) {
  return api.get<RiskSummary>(`/deals/${dealId}/risks`);
}

export function listRiskFlags(dealId: number) {
  return api.get<RiskFlag[]>(`/deals/${dealId}/risks/flags`);
}
