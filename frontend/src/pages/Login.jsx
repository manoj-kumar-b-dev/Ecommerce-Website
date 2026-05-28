import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const user = await login(email, password, rememberMe);
      // SECURITY: User login should ONLY have role 'user'
      // If somehow role is different, error will be thrown in login function
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setFormError(errorMessage);
      // Clear password field for security
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.08] bg-[size:80px_80px]" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-tight">
            Welcome Back to ShopFlow
          </h1>
          <p className="text-primary-100 text-lg mb-10 leading-relaxed">
            Your premium shopping destination. Sign in to access your cart, orders, and exclusive deals.
          </p>
          <div className="space-y-5 text-left">
            {[
              'Fast and secure checkout',
              'Track your orders in real-time',
              'Exclusive member discounts'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-4 text-primary-50">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                  <span className="text-white text-sm font-bold">{idx + 1}</span>
                </div>
                <span className="font-medium text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/20">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Sign In</h2>
            <p className="mt-3 text-gray-600 text-base">
              New to ShopFlow?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group">
                Create an account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {formError && (
            <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 flex gap-3 animate-slide-up shadow-sm">
              <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-danger-900">Login Failed</h3>
                <p className="text-sm text-danger-700 mt-1">{formError}</p>
                {formError.includes('admin') && (
                  <p className="text-xs text-danger-600 mt-2">
                    Please use the <Link to="/admin/login" className="font-bold underline hover:no-underline">admin login</Link> portal instead.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input text-base py-3.5"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input text-base py-3.5 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 touch-target flex items-center justify-center"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group touch-target pl-1">
                <div className="relative flex items-center justify-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none h-5 w-5 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer group-hover:border-primary-400"
                  />
                  <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>

              <Link 
                to="/forgot-password" 
                className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors py-2"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full text-base font-bold py-4 shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>

            {/* Guest Checkout */}
            <Link
              to="/shop"
              className="btn bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 w-full text-base font-bold py-4"
            >
              Continue as Guest
            </Link>
          </form>

          {/* Admin Login Link */}
          <div className="text-center pt-6 pb-4">
            <p className="text-sm text-gray-500 font-medium">
              Are you an administrator?{' '}
              <Link to="/admin/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                Admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
