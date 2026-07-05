import api from './api';
import { SearchResponse, CompareResponse } from '../types/api';

export function searchDeal(dealId: number, query: string) {
  return api.post<SearchResponse>(`/deals/${dealId}/search`, { query });
}

export function compareDocuments(dealId: number, docId1: number, docId2: number) {
  return api.post<CompareResponse>(`/deals/${dealId}/compare`, {
    document_id_1: docId1,
    document_id_2: docId2,
  });
}
