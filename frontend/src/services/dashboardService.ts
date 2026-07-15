import { collection, query, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOrderStats, getRecentOrders } from './orderService';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  revenue: number;
  currentOrders: number;
  outForDelivery: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  deliveredThisYear: number;
}

export const getDashboardStats = async () => {
  const productsQuery = query(collection(db, 'products'), where('archived', '==', false));

  const [productsCount, categoriesCount, stockAgg, orderStats, recentOrders] = await Promise.all([
    getCountFromServer(productsQuery),
    getCountFromServer(collection(db, 'categories')),
    getAggregateFromServer(productsQuery, { totalStock: sum('stock') }),
    getOrderStats(),
    getRecentOrders(6),
  ]);

  const stats: DashboardStats = {
    totalProducts: productsCount.data().count,
    totalCategories: categoriesCount.data().count,
    totalStock: stockAgg.data().totalStock || 0,
    revenue: orderStats.revenue,
    currentOrders: orderStats.currentOrders,
    outForDelivery: orderStats.outForDelivery,
    deliveredThisWeek: orderStats.deliveredThisWeek,
    deliveredThisMonth: orderStats.deliveredThisMonth,
    deliveredThisYear: orderStats.deliveredThisYear,
  };

  return { success: true, stats, recentOrders };
};
