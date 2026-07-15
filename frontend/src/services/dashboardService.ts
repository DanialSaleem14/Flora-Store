import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';

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

// Deterministic pseudo-random dummy series so the charts look stable between
// loads — placeholder data until real analytics/orders exist.
const dummySeries = (seed: number, length: number, min: number, max: number) => {
  const arr: number[] = [];
  let value = seed;
  for (let i = 0; i < length; i += 1) {
    value = (value * 9301 + 49297) % 233280;
    const rand = value / 233280;
    arr.push(Math.floor(min + rand * (max - min)));
  }
  return arr;
};

export const getDashboardStats = async () => {
  const [productsCount, categoriesCount] = await Promise.all([
    getCountFromServer(query(collection(db, 'products'), where('archived', '==', false))),
    getCountFromServer(collection(db, 'categories')),
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const visitors = dummySeries(17, months.length, 200, 2000);
  const revenue = dummySeries(42, months.length, 500, 8000);
  const orders = dummySeries(7, months.length, 10, 150);

  const stats: DashboardStats = {
    totalProducts: productsCount.data().count,
    totalCategories: categoriesCount.data().count,
    totalVisitors: visitors.reduce((a, b) => a + b, 0),
    totalOrders: orders.reduce((a, b) => a + b, 0),
    revenue: revenue.reduce((a, b) => a + b, 0),
  };

  const charts: DashboardCharts = { labels: months, visitors, revenue, orders };

  return { success: true, stats, charts };
};
