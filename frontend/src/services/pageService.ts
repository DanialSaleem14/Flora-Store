import { api } from './api';
import type { Page } from '../types';

export const getPages = () => api.get<{ success: boolean; pages: Page[] }>('/pages').then((r) => r.data);

export const getPageBySlug = (slug: string) =>
  api.get<{ success: boolean; page: Page }>(`/pages/slug/${slug}`).then((r) => r.data);

export const createPage = (data: Partial<Page>) =>
  api.post<{ success: boolean; page: Page }>('/pages', data).then((r) => r.data);

export const updatePage = (id: string, data: Partial<Page>) =>
  api.put<{ success: boolean; page: Page }>(`/pages/${id}`, data).then((r) => r.data);

export const deletePage = (id: string) => api.delete(`/pages/${id}`).then((r) => r.data);
