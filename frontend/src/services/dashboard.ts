import api from './api';

export interface DashboardStats {
  total_deals: number;
  total_documents: number;
  total_risks: number;
  active_deal_members: number;
}

export function getDashboardStats() {
  return api.get<DashboardStats>('/dashboard/stats');
}
