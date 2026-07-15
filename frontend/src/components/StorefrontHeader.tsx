import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/pages/about' },
  { label: 'Contact', to: '/pages/contact' },
];

export function StorefrontHeader() {
  const { website } = useStore();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          {website?.logo ? (
            <img src={website.logo} alt={website.storeName} className="h-8 w-auto" loading="lazy" />
          ) : (
            <span>{website?.storeName || 'My Store'}</span>
          )}
        </Link>

        <nav className="hidden gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-700 hover:text-black">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden max-w-xs flex-1 md:flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--store-accent)]"
          />
        </form>

        <div className="flex items-center gap-4 text-sm">
          <Link to={user ? '/account' : '/account/login'} className="hidden sm:block">
            {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign In'}
          </Link>
          <Link to="/cart" className="relative">
            🛒
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--store-accent)] text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-2 border-t border-gray-200 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
