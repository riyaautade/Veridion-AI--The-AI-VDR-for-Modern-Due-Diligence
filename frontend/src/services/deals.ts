import api from './api';

import { Company } from './companies';

export interface DealSummary {
  id: number;
  name: string;
  description: string | null;
  seller_company: Company;
  buyer_company: Company;
  status: string;
}

export interface DealUser {
  id: number;
  deal_id: number;
  user_id: number;
  role: string;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
}

export function listDeals() {
  return api.get<DealSummary[]>('/deals');
}

export function getDeal(dealId: number) {
  return api.get<DealSummary>(`/deals/${dealId}`);
}

export interface DealCreate {
  name: string;
  description?: string;
  buyer_company_id: number;
}

export function createDeal(payload: DealCreate) {
  return api.post<DealSummary>('/deals', payload);
}

export interface DealUpdate {
  name?: string;
  description?: string;
  status?: string;
}

export function updateDeal(dealId: number, payload: DealUpdate) {
  return api.patch<DealSummary>(`/deals/${dealId}`, payload);
}

export function deleteDeal(dealId: number) {
  return api.delete(`/deals/${dealId}`);
}

export function addDealUser(dealId: number, userId: number, role: string) {
  return api.post(`/deals/${dealId}/users`, { user_id: userId, role });
}

export function removeDealUser(dealId: number, userId: number) {
  return api.delete(`/deals/${dealId}/users/${userId}`);
}

export function listDealUsers(dealId: number) {
  return api.get<DealUser[]>(`/deals/${dealId}/users`);
}
