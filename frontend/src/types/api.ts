import { Company } from '../services/companies';

export interface DealSummary {
  id: number;
  name: string;
  seller_company: Company;
  buyer_company: Company;
  status: string;
}

export interface DocumentRecord {
  id: number;
  deal_id: number;
  uploaded_by: number;
  filename: string;
  original_filename: string;
  file_type: string;
  document_type: string;
  status: string;
  page_count: number | null;
  allowed_roles: string[];
  processing_error: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface RiskSummary {
  total_flags: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskFlag {
  id: number;
  deal_id: number;
  document_id: number;
  rule_key: string;
  description: string;
  severity: string;
  created_at: string;
}

export interface SearchSource {
  filename: string;
  page_number: number | null;
  score: number;
  text: string;
}

export interface SearchResponse {
  answer: string;
  sources: SearchSource[];
}

export interface DashboardCard {
  title: string;
  value: string;
}

export interface CompareResponse {
  comparison: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  document_source: string;
}

export interface DealReport {
  deal_id: number;
  executive_summary: string;
  timeline: TimelineEvent[];
  total_documents: number;
  high_risks: number;
}
