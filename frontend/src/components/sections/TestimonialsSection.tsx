import { useStore } from '../../context/StoreContext';

export function TestimonialsSection() {
  const { website } = useStore();
  const testimonials = website?.testimonials || [];
  if (!testimonials.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">What Our Customers Say</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <div key={t._id || i} className="rounded-lg border border-gray-200 p-5">
            <div className="text-amber-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            <p className="mt-2 text-sm text-gray-600">"{t.text}"</p>
            <div className="mt-4 flex items-center gap-2">
              {t.avatar && <img src={t.avatar} alt={t.name} className="h-8 w-8 rounded-full object-cover" loading="lazy" />}
              <span className="text-sm font-medium">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
