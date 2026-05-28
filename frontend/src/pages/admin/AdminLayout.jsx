import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Truck, Users, Menu, X, ArrowLeft, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SIDEBAR_ITEMS = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', name: 'Products', icon: ShoppingBag },
  { path: '/admin/orders', name: 'Orders', icon: Truck },
  { path: '/admin/users', name: 'Users', icon: Users }
];

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <span className="font-bold text-gray-900">ShopFlow Admin</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-gray-900" />
          ) : (
            <Menu className="h-5 w-5 text-gray-900" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:translate-x-0 fixed md:static top-0 left-0 h-full md:h-auto z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold">SF</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">ShopFlow</h1>
            <p className="text-xs text-gray-600">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {user && (
            <div className="px-3 py-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-danger-50 text-danger-600 font-medium rounded-lg hover:bg-danger-100 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;