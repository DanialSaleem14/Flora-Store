import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', end: true, icon: '📊' },
  { label: 'Products', to: '/admin/products', icon: '📦' },
  { label: 'Categories', to: '/admin/categories', icon: '🗂️' },
  { label: 'Orders', to: '/admin/orders', icon: '🧾' },
  { label: 'Customers', to: '/admin/customers', icon: '👥' },
  { label: 'Website Builder', to: '/admin/website-builder', icon: '🛠️' },
  { label: 'Appearance', to: '/admin/appearance', icon: '🎨' },
  { label: 'Pages', to: '/admin/pages', icon: '📄' },
  { label: 'Analytics', to: '/admin/analytics', icon: '📈' },
  { label: 'Settings', to: '/admin/settings', icon: '⚙️' },
  { label: 'Profile', to: '/admin/profile', icon: '👤' },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-4 text-lg font-bold">
          <span>🛍️ Builder</span>
        </div>
        <NavItems />
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 text-lg font-bold">
              <span>🛍️ Builder</span>
              <button onClick={() => setMobileNavOpen(false)} className="text-xl text-gray-500" aria-label="Close menu">
                ✕
              </button>
            </div>
            <NavItems onNavigate={() => setMobileNavOpen(false)} />
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={handleLogout}
                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="text-xl text-gray-600 md:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="text-sm text-gray-500">Admin Dashboard</span>
          </div>
          <span className="text-sm font-medium">{user?.name}</span>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
