import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Deterministic pseudo-random dummy series so the charts look stable between loads
const dummySeries = (seed, length, min, max) => {
  const arr = [];
  let value = seed;
  for (let i = 0; i < length; i += 1) {
    value = (value * 9301 + 49297) % 233280;
    const rand = value / 233280;
    arr.push(Math.floor(min + rand * (max - min)));
  }
  return arr;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalCategories] = await Promise.all([
    Product.countDocuments({ archived: false }),
    Category.countDocuments(),
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const visitors = dummySeries(17, months.length, 200, 2000);
  const revenue = dummySeries(42, months.length, 500, 8000);
  const orders = dummySeries(7, months.length, 10, 150);

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalCategories,
      totalVisitors: visitors.reduce((a, b) => a + b, 0),
      totalOrders: orders.reduce((a, b) => a + b, 0),
      revenue: revenue.reduce((a, b) => a + b, 0),
    },
    charts: {
      labels: months,
      visitors,
      revenue,
      orders,
    },
  });
});
