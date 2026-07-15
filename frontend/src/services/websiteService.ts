import { api } from './api';
import type { Website } from '../types';

export const getWebsite = () => api.get<{ success: boolean; website: Website }>('/website').then((r) => r.data);

export const updateWebsite = (data: Partial<Website>) =>
  api.put<{ success: boolean; website: Website }>('/website', data).then((r) => r.data);
