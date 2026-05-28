import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import AddToCartModal from './components/AddToCartModal';

// Lazy load application route targets for chunks optimization split
const Home = lazy(() => import('./pages/Home'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/Login.jsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLogin.jsx'));
const RegisterPage = lazy(() => import('./pages/Register.jsx'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Subsystem lazy declarations
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'text-sm font-medium bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200',
                  duration: 4000
                }}
              />
              <AddToCartModal />
              <Navbar />
              <CartDrawer />
              <main className="min-h-screen bg-gray-50">
                <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner size="large" /></div>}>
                  <Routes>
                    {/* Public Engine Channels */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Authenticated Client Channels */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                      <Route path="/payment-failed" element={<PaymentFailedPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                    </Route>

                    {/* Isolated Admin Subsystem Controls */}
                    <Route element={<ProtectedRoute adminOnly={true} />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="products" element={<AdminProductsPage />} />
                        <Route path="orders" element={<AdminOrdersPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                      </Route>
                    </Route>

                    {/* Catch Mismatches */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
