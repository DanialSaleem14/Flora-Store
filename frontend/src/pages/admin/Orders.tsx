import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as orderService from '../../services/orderService';
import type { OrderPage } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { useCurrency } from '../../hooks/useCurrency';
import { Button, EmptyState, PageHeader, Spinner } from '../../components/ui';
import type { Order, OrderStatus } from '../../types';

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

const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminOrders() {
  const formatPrice = useCurrency();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cursor, setCursor] = useState<OrderPage['nextCursor']>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({ status: statusFilter, limit: 15 });
      setOrders(res.orders);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = async () => {
    setLoadingMore(true);
    const res = await orderService.getOrders({ status: statusFilter, limit: 15, cursor });
    setOrders((prev) => [...prev, ...res.orders]);
    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
    setLoadingMore(false);
  };

  const changeStatus = async (id: string, status: OrderStatus) => {
    setBusyId(id);
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success('Order updated');
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              statusFilter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : !orders.length ? (
        <EmptyState title="No orders yet" subtitle="Orders placed at checkout (Cash on Delivery) will appear here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500">
                  Ship to: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                </span>
                <div className="ml-auto flex gap-2">
                  {order.status === 'pending' && (
                    <Button variant="secondary" disabled={busyId === order._id} onClick={() => changeStatus(order._id, 'processing')}>
                      Mark Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button variant="secondary" disabled={busyId === order._id} onClick={() => changeStatus(order._id, 'out_for_delivery')}>
                      Mark Out for Delivery
                    </Button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <Button variant="secondary" disabled={busyId === order._id} onClick={() => changeStatus(order._id, 'delivered')}>
                      Mark Delivered
                    </Button>
                  )}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <Button variant="danger" disabled={busyId === order._id} onClick={() => changeStatus(order._id, 'cancelled')}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
