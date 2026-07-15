import { useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../../services/newsletterService';
import { getErrorMessage } from '../../services/api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribeNewsletter(email);
      toast.success('Subscribed!');
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="bg-[var(--store-secondary)] py-14 text-center">
      <div className="mx-auto max-w-xl px-4">
        <h2 className="text-2xl font-bold">Join our newsletter</h2>
        <p className="mt-2 text-sm text-gray-600">Get the latest news and offers straight to your inbox.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="store-btn px-5 py-2 text-sm font-medium">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
