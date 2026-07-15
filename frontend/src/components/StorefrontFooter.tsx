import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext';
import { subscribeNewsletter } from '../services/newsletterService';
import { getErrorMessage } from '../services/api';

export function StorefrontFooter() {
  const { website } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribeNewsletter(email);
      toast.success('Subscribed!');
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const social = website?.social;
  const socialLinks = social
    ? Object.entries(social).filter(([, url]) => url)
    : [];

  return (
    <footer className="mt-16 border-t border-gray-200 bg-[var(--store-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="font-bold">{website?.storeName || 'My Store'}</h3>
            <p className="mt-2 text-sm text-gray-600">{website?.footer?.text || website?.about}</p>
          </div>

          {website?.footer?.columns?.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {col.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {website?.contact?.email && <li>{website.contact.email}</li>}
              {website?.contact?.phone && <li>{website.contact.phone}</li>}
              {website?.contact?.address && <li>{website.contact.address}</li>}
            </ul>
            {socialLinks.length > 0 && (
              <div className="mt-3 flex gap-3 text-sm">
                {socialLinks.map(([key, url]) => (
                  <a key={key} href={url as string} target="_blank" rel="noreferrer" className="capitalize underline">
                    {key}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold">Newsletter</h4>
            <form onSubmit={handleSubscribe} className="mt-2 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button type="submit" className="store-btn px-3 py-1.5 text-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-gray-300 pt-6 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} {website?.storeName || 'My Store'}. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/pages/privacy-policy">Privacy Policy</Link>
            <Link to="/pages/terms-conditions">Terms</Link>
            <Link to="/pages/return-policy">Returns</Link>
            <Link to="/pages/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
