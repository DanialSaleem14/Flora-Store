import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from '../../services/newsletterService';
import { getErrorMessage } from '../../services/api';
import { Card, EmptyState, PageHeader, Spinner } from '../../components/ui';

export default function AdminCustomers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['newsletter-subscribers'], queryFn: getNewsletterSubscribers });

  const handleDelete = async (id: string) => {
    try {
      await deleteNewsletterSubscriber(id);
      qc.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success('Removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Customers" />

      <EmptyState
        title="Full customer directory is coming soon"
        subtitle="A directory with order history per customer will appear here in a future update. For now, here's who's subscribed to your newsletter."
      />

      <Card className="mt-6">
        <h3 className="mb-4 font-semibold">Newsletter Subscribers</h3>
        {isLoading ? (
          <Spinner />
        ) : !data?.subscribers.length ? (
          <p className="text-sm text-gray-500">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.subscribers.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2 text-sm">
                <span>{s.email}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => handleDelete(s._id)} className="text-xs text-red-600 underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
