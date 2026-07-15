import { EmptyState, PageHeader } from '../../components/ui';

export default function AdminOrders() {
  return (
    <div>
      <PageHeader title="Orders" />
      <EmptyState
        title="Order management is coming soon"
        subtitle="Orders will appear here once checkout is connected to a payment provider (Stripe / PayPal / JazzCash / EasyPaisa)."
      />
    </div>
  );
}
