import api from './api';

export interface Company {
  id: number;
  name: string;
}

export function listCompanies() {
  return api.get<Company[]>('/companies');
}

export interface CompanyDetail extends Company {
  created_at: string;
  employees: any[];
}

export function getMyCompany() {
  return api.get<CompanyDetail>('/companies/me');
}
