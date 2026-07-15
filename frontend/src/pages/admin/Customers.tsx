import { EmptyState, PageHeader } from '../../components/ui';

export default function AdminCustomers() {
  return (
    <div>
      <PageHeader title="Customers" />
      <EmptyState
        title="Customer management is coming soon"
        subtitle="A full customer directory with order history will appear here in a future update."
      />
    </div>
  );
}
