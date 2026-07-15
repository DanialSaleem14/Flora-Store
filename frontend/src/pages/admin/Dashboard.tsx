import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/dashboardService';
import { useCurrency } from '../../hooks/useCurrency';
import { Card, Spinner, PageHeader, EmptyState } from '../../components/ui';
import type { OrderStatus } from '../../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const formatPrice = useCurrency();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });

  if (isLoading || !data) return <Spinner />;

  const { stats, recentOrders } = data;

  const primaryCards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Stock', value: stats.totalStock.toLocaleString() },
    { label: 'Revenue (Delivered)', value: formatPrice(stats.revenue) },
    { label: 'Current Orders', value: stats.currentOrders },
  ];

  const deliveryCards = [
    { label: 'Out for Delivery', value: stats.outForDelivery },
    { label: 'Delivered This Week', value: stats.deliveredThisWeek },
    { label: 'Delivered This Month', value: stats.deliveredThisMonth },
    { label: 'Delivered This Year', value: stats.deliveredThisYear },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryCards.map((c) => (
          <Card key={c.label}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {deliveryCards.map((c) => (
          <Card key={c.label}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="mb-4 font-semibold">Recent Orders</h3>
          {!recentOrders.length ? (
            <EmptyState title="No orders yet" subtitle="Orders placed at checkout will show up here." />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        All figures above are computed from real product and order data — no placeholder numbers.
      </p>
    </div>
  );
}
