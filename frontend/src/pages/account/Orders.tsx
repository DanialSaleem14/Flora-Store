import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../../services/orderService';
import { useCurrency } from '../../hooks/useCurrency';
import { Card, EmptyState, Spinner } from '../../components/ui';
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

export default function AccountOrders() {
  const formatPrice = useCurrency();
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders });

  return (
    <div>
      <h2 className="mb-4 font-semibold">Order History</h2>
      {isLoading ? (
        <Spinner />
      ) : !data?.orders.length ? (
        <EmptyState title="No orders yet" subtitle="Orders you place at checkout will appear here." />
      ) : (
        <div className="space-y-3">
          {data.orders.map((order) => (
            <Card key={order._id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
