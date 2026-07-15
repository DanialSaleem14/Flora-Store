import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenSpinner />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function CustomerProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenSpinner />;
  if (!user) return <Navigate to="/account/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function FullscreenSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--store-accent)]" />
    </div>
  );
}
