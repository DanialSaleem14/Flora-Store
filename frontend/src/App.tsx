import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminProtectedRoute, CustomerProtectedRoute, FullscreenSpinner } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/storefront/Home'));
const ProductListing = lazy(() => import('./pages/storefront/ProductListing'));
const ProductDetail = lazy(() => import('./pages/storefront/ProductDetail'));
const Categories = lazy(() => import('./pages/storefront/Categories'));
const CategoryDetail = lazy(() => import('./pages/storefront/CategoryDetail'));
const Cart = lazy(() => import('./pages/storefront/Cart'));
const Checkout = lazy(() => import('./pages/storefront/Checkout'));
const DynamicPage = lazy(() => import('./pages/storefront/DynamicPage'));

const CustomerLogin = lazy(() => import('./pages/account/Login'));
const CustomerRegister = lazy(() => import('./pages/account/Register'));
const CustomerForgotPassword = lazy(() => import('./pages/account/ForgotPassword'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));
const AccountAddresses = lazy(() => import('./pages/account/Addresses'));
const AccountWishlist = lazy(() => import('./pages/account/Wishlist'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));

const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminRegister = lazy(() => import('./pages/admin/Register'));
const AdminForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const WebsiteBuilder = lazy(() => import('./pages/admin/WebsiteBuilder'));
const Appearance = lazy(() => import('./pages/admin/Appearance'));
const AdminPages = lazy(() => import('./pages/admin/Pages'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));

const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <Routes>
        {/* Storefront */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pages/:slug" element={<DynamicPage />} />

          {/* Customer auth (standalone, no header/footer chrome needed but kept for nav consistency) */}
          <Route path="/account/login" element={<CustomerLogin />} />
          <Route path="/account/register" element={<CustomerRegister />} />
          <Route path="/account/forgot-password" element={<CustomerForgotPassword />} />

          <Route
            path="/account"
            element={
              <CustomerProtectedRoute>
                <AccountLayout />
              </CustomerProtectedRoute>
            }
          >
            <Route index element={<AccountProfile />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="wishlist" element={<AccountWishlist />} />
            <Route path="orders" element={<AccountOrders />} />
          </Route>
        </Route>

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="website-builder" element={<WebsiteBuilder />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
