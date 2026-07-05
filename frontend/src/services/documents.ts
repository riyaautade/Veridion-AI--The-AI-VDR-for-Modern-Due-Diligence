import api from './api';
import { DocumentRecord } from '../types/api';

export function listDocuments(dealId: number) {
  return api.get<DocumentRecord[]>(`/deals/${dealId}/documents`);
}

export function uploadDocument(dealId: number, formData: FormData) {
  return api.post<DocumentRecord>(`/deals/${dealId}/documents`, formData);
}

export function deleteAllDocuments(dealId: number) {
  return api.delete(`/deals/${dealId}/documents`);
}

export function deleteDocument(dealId: number, documentId: number) {
  return api.delete(`/deals/${dealId}/documents/${documentId}`);
}

export interface DocumentUpdate {
  original_filename?: string;
  document_type?: string;
}

export function updateDocument(dealId: number, documentId: number, data: DocumentUpdate) {
  return api.patch<DocumentRecord>(`/deals/${dealId}/documents/${documentId}`, data);
}
