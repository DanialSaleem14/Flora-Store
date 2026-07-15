import { EmptyState } from '../../components/ui';

export default function AccountOrders() {
  return (
    <div>
      <h2 className="mb-4 font-semibold">Order History</h2>
      <EmptyState
        title="No orders yet"
        subtitle="Order tracking will appear here once checkout is connected to a payment provider."
      />
    </div>
  );
}
