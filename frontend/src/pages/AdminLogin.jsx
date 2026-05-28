import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { adminLogin, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/admin';

  // Clear auth error when user starts typing
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      await adminLogin(email, password, rememberMe);
      // Small delay to ensure state updates
      setTimeout(() => {
        navigate(redirectPath.startsWith('/admin') ? redirectPath : '/admin', { replace: true });
      }, 100);
    } catch (err) {
      const errorMsg = err.message || 'Admin authentication failed. Please try again.';
      setFormError(errorMsg);
      // SECURITY: Clear password field after failed attempt
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field) => {
    setValidationErrors({
      ...validationErrors,
      [field]: undefined
    });
    if (formError) {
      setFormError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Card */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Console</h1>
            <p className="mt-2 text-sm text-gray-600">
              Secure administrative access for store management
            </p>
          </div>

          {/* Error Alert */}
          {formError && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-danger-900">Authentication Failed</h3>
                <p className="text-sm text-danger-700 mt-0.5">{formError}</p>
                {formError.includes('admin') && !formError.includes('credentials') && (
                  <p className="text-xs text-danger-600 mt-2">
                    If you're a regular customer, please use the <Link to="/login" className="font-semibold underline">customer login</Link> instead.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange('email');
                }}
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${validationErrors.email
                    ? 'border-danger-300 focus:border-danger-300 focus:ring-danger-500 bg-danger-50'
                    : 'border-gray-300 focus:border-primary-300 focus:ring-primary-500 bg-white'
                  }`}
                placeholder="admin@example.com"
                disabled={submitting}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-danger-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange('password');
                  }}
                  className={`w-full px-4 py-2.5 pr-12 border rounded-lg shadow-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${validationErrors.password
                      ? 'border-danger-300 focus:border-danger-300 focus:ring-danger-500 bg-danger-50'
                      : 'border-gray-300 focus:border-primary-300 focus:ring-primary-500 bg-white'
                    }`}
                  placeholder="••••••••"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  disabled={submitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-danger-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="admin-remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="admin-remember-me" className="ml-3 text-sm font-medium text-gray-700 select-none cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Enter Admin Console
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500 font-medium">Need help?</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Customer Login
            </Link>
            <p className="text-center text-xs text-gray-500">
              Forgot your credentials?{' '}
              <a href="#" className="text-primary-600 font-semibold hover:text-primary-700">
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400">
          Protected access • Enterprise grade authentication • IP logging enabled
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
