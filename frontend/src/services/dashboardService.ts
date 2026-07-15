import { api } from './api';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalVisitors: number;
  totalOrders: number;
  revenue: number;
}

export interface DashboardCharts {
  labels: string[];
  visitors: number[];
  revenue: number[];
  orders: number[];
}

export const getDashboardStats = () =>
  api
    .get<{ success: boolean; stats: DashboardStats; charts: DashboardCharts }>('/dashboard/stats')
    .then((r) => r.data);
