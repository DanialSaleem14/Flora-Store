import { api } from './api';
import type { User } from '../types';

export const getMe = () => api.get<{ success: boolean; user: User }>('/auth/me').then((r) => r.data);

export const updateMe = (data: Partial<{ name: string }>) =>
  api.put<{ success: boolean; user: User }>('/auth/me', data).then((r) => r.data);

export const claimFirstAdmin = () =>
  api.post<{ success: boolean; user: User }>('/auth/claim-first-admin').then((r) => r.data);
