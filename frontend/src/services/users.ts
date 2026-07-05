import api from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company: string;
  is_active: boolean;
  created_at: string;
}

export function listBuyers(companyId?: number) {
  const url = companyId ? `/users/buyers?company_id=${companyId}` : '/users/buyers';
  return api.get(url);
}

export interface UserUpdate {
  full_name?: string;
  password?: string;
}

export function updateMe(payload: UserUpdate) {
  return api.patch<User>('/users/me', payload);
}
