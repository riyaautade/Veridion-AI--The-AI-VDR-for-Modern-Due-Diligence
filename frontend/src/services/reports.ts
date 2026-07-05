import api from './api';
import { DealReport } from '../types/api';

export function generateReport(dealId: number) {
  return api.post<DealReport>(`/deals/${dealId}/report`);
}
