import { api } from './api';
import type { Address, Product } from '../types';

export const getAddresses = () =>
  api.get<{ success: boolean; addresses: Address[] }>('/auth/addresses').then((r) => r.data);

export const addAddress = (data: Address) =>
  api.post<{ success: boolean; addresses: Address[] }>('/auth/addresses', data).then((r) => r.data);

export const updateAddress = (id: string, data: Partial<Address>) =>
  api.put<{ success: boolean; addresses: Address[] }>(`/auth/addresses/${id}`, data).then((r) => r.data);

export const deleteAddress = (id: string) =>
  api.delete<{ success: boolean; addresses: Address[] }>(`/auth/addresses/${id}`).then((r) => r.data);

export const getWishlist = () =>
  api.get<{ success: boolean; wishlist: Product[] }>('/auth/wishlist').then((r) => r.data);

export const toggleWishlist = (productId: string) =>
  api.post<{ success: boolean; wishlist: string[] }>(`/auth/wishlist/${productId}`).then((r) => r.data);
