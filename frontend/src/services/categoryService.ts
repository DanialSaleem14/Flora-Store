import { api } from './api';
import type { Category } from '../types';

export const getCategories = () =>
  api.get<{ success: boolean; categories: Category[] }>('/categories').then((r) => r.data);

export const getCategoryBySlug = (slug: string) =>
  api.get<{ success: boolean; category: Category }>(`/categories/${slug}`).then((r) => r.data);

export const createCategory = (data: Partial<Category>) =>
  api.post<{ success: boolean; category: Category }>('/categories', data).then((r) => r.data);

export const updateCategory = (id: string, data: Partial<Category>) =>
  api.put<{ success: boolean; category: Category }>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`).then((r) => r.data);
