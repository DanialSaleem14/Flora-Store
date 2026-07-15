import { api } from './api';
import type { Pagination, Product } from '../types';

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'featured';
  page?: number;
  limit?: number;
  includeUnpublished?: boolean;
}

export const getProducts = (query: ProductQuery = {}) =>
  api
    .get<{ success: boolean; products: Product[]; pagination: Pagination }>('/products', { params: query })
    .then((r) => r.data);

export const getProductBySlug = (slug: string) =>
  api.get<{ success: boolean; product: Product }>(`/products/slug/${slug}`).then((r) => r.data);

export const getProductById = (id: string) =>
  api.get<{ success: boolean; product: Product }>(`/products/${id}`).then((r) => r.data);

export const createProduct = (data: Partial<Product>) =>
  api.post<{ success: boolean; product: Product }>('/products', data).then((r) => r.data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  api.put<{ success: boolean; product: Product }>(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: string) => api.delete(`/products/${id}`).then((r) => r.data);

export const duplicateProduct = (id: string) =>
  api.post<{ success: boolean; product: Product }>(`/products/${id}/duplicate`).then((r) => r.data);

export const toggleArchiveProduct = (id: string) =>
  api.patch<{ success: boolean; product: Product }>(`/products/${id}/archive`).then((r) => r.data);
