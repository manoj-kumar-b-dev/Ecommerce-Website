import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Truck, Users, Menu, X, ArrowLeft, LogOut, Bell, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SIDEBAR_ITEMS = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', name: 'Products', icon: ShoppingBag },
  { path: '/admin/orders', name: 'Orders', icon: Truck },
  { path: '/admin/users', name: 'Users', icon: Users }
];

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Generate breadcrumb title
  const currentPath = SIDEBAR_ITEMS.find(item => item.path === location.pathname);
  const pageTitle = currentPath ? currentPath.name : 'Admin Panel';

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--admin-bg)' }}>
      {/* Mobile Header (Sticky) */}
      <div className="bg-white border-b p-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-sm" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target flex-center"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-gray-900 text-lg">{pageTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 md:hidden z-40 backdrop-blur-sm animate-backdrop-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dark Sidebar */}
      <aside
        className={`w-72 flex flex-col fixed md:sticky top-0 left-0 h-[100dvh] z-50 transition-transform duration-300 shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ backgroundColor: 'var(--admin-sidebar-bg)', color: 'var(--admin-sidebar-text)' }}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-xl tracking-tight">ShopFlow</h1>
              <p className="text-xs text-gray-400 font-medium">Admin Workspace</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hide-scrollbar">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</div>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${isActive
                    ? 'bg-primary-600/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'group-hover:bg-white/10'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors text-sm"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition-colors text-sm"
          >
            <div className="p-1.5 rounded-lg">
              <LogOut className="h-4 w-4" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20" style={{ borderColor: 'var(--admin-border)' }}>
          {/* Breadcrumb & Search */}
          <div className="flex items-center gap-8 flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">{pageTitle}</span>
            </div>
            
            <div className="max-w-md w-full relative">
              <input 
                type="text" 
                placeholder="Search orders, products, users..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in-scale origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-7xl mx-auto pb-20 md:pb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;