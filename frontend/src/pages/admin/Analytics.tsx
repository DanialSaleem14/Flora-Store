import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getOrderStatusBreakdown, getTopSellingProducts } from '../../services/orderService';
import { useCurrency } from '../../hooks/useCurrency';
import { Card, PageHeader, Spinner, EmptyState } from '../../components/ui';
import type { OrderStatus } from '../../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Analytics() {
  const formatPrice = useCurrency();
  const { data: breakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: ['order-status-breakdown'],
    queryFn: getOrderStatusBreakdown,
  });
  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['top-selling-products'],
    queryFn: () => getTopSellingProducts(5),
  });

  if (loadingBreakdown || loadingTop) return <Spinner />;

  const chartData = breakdown
    ? (Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => ({ label: STATUS_LABELS[status], count: breakdown[status] }))
    : [];

  return (
    <div>
      <PageHeader title="Analytics" />
      <p className="mb-4 text-xs text-gray-400">Computed from real order data.</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Top Selling Products</h3>
          {!topProducts?.length ? (
            <EmptyState title="No sales yet" subtitle="Top sellers will appear once orders start coming in." />
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {topProducts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between py-2">
                  <span>
                    {p.name} <span className="text-gray-400">× {p.quantity}</span>
                  </span>
                  <span className="text-gray-500">{formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
