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

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/wishlist', label: 'Wishlist', requiresAuth: true },
    { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
      <nav className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex w-screen items-center justify-between h-20">
          {/* Logo */}
          <div className='flex gap-10'>
              <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-2xl text-gray-900 hidden sm:block">ShopFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-md font-medium transition-colors hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </div>
          </div>
        
          <div>
            <SearchBar />
          </div>
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-7 mr-40">
            {user ? (
              <>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-md font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}

                <div className="flex items-center space-x-7">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <p className="text-md font-medium w-50 text-gray-700">Hi, {user.name.split(' ')[0]}</p>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-danger-600 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 py-4 space-y-2">
              {navLinks.map((link) => {
                if (link.requiresAuth && !user) return null;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              {user && (
                <>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ({cartItemCount})
                  </button>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-danger-600 rounded-lg hover:bg-danger-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              )}

              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
