import { useState, useContext, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Search, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, setIsDrawerOpen } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [isMobileMenuOpen]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/wishlist', label: 'Wishlist', requiresAuth: true },
    { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
  ];

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar container */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
              <span className="text-white font-heading font-bold text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-gray-900 hidden sm:block group-hover:text-primary-600 transition-colors">ShopFlow</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          {/* Desktop Search Bar - hidden on mobile */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Cart Button */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  aria-label="Open cart"
                  title={`Cart (${cartItemCount} items)`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

                {/* Admin Link */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    Admin
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-200 hover:border-primary-400 transition-colors">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      Hi, {user.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="p-2.5 text-gray-500 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all duration-200"
                    aria-label="Logout"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Actions - Right side */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile Cart Button — always visible */}
            <button
              onClick={() => {
                if (user) {
                  setIsDrawerOpen(true);
                } else {
                  navigate('/cart');
                }
              }}
              className="relative p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent-600 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center ring-2 ring-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full-screen Drawer from Left */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-in"
            onClick={handleCloseMobileMenu}
          />

          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in-left flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link to="/" onClick={handleCloseMobileMenu} className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-base">S</span>
                </div>
                <span className="font-heading font-bold text-lg text-gray-900">ShopFlow</span>
              </Link>
              <button
                onClick={handleCloseMobileMenu}
                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-4 border-b border-gray-100">
              <SearchBar />
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  if (link.requiresAuth && !user) return null;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={handleCloseMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>

              {user ? (
                <>
                  <div className="h-px bg-gray-200 my-3" />

                  {/* Mobile User Info */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-200">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={handleCloseMobileMenu}
                      className="flex items-center px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      handleCloseMobileMenu();
                    }}
                    className="flex items-center w-full px-4 py-3.5 text-base font-medium text-danger-600 rounded-xl hover:bg-danger-50 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-gray-200 my-3" />
                  <div className="space-y-2 px-1">
                    <Link
                      to="/login"
                      onClick={handleCloseMobileMenu}
                      className="block w-full px-4 py-3.5 text-base font-semibold text-center text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={handleCloseMobileMenu}
                      className="block w-full px-4 py-3.5 text-base font-semibold text-center text-primary-600 border-2 border-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200"
                    >
                      Create Account
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
