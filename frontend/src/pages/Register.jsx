import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Eye, EyeOff, CheckCircle, Upload } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.match(/[A-Z]/)) strength += 1;
    if (pwd.match(/[0-9]/)) strength += 1;
    if (pwd.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setValidationError('Only JPG, PNG, and WEBP formats are allowed');
        return;
      }
      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size must be less than 5MB');
        return;
      }
      setValidationError('');
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (password.length < 6) {
      return setValidationError('Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return setValidationError('Passwords do not match');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      await register(formData);
      navigate('/');
    } catch (err) {
      setValidationError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success-600 to-success-800 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Join ShopFlow Today
          </h1>
          <p className="text-success-100 text-lg mb-8">
            Create an account to enjoy exclusive benefits and a seamless shopping experience.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-success-100">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Fast checkout with saved addresses</span>
            </div>
            <div className="flex items-center gap-3 text-success-100">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Order tracking and history</span>
            </div>
            <div className="flex items-center gap-3 text-success-100">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Exclusive member-only discounts</span>
            </div>
            <div className="flex items-center gap-3 text-success-100">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Wishlist to save your favorite items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {validationError && (
            <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded-lg">
              <p className="text-sm text-danger-700">{validationError}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleFormSubmit}>
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 mb-2">
                <img 
                  src={avatarPreview || 'https://placehold.co/150x150?text=Upload'} 
                  alt="Avatar Preview" 
                  className="h-full w-full object-cover" 
                />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Upload className="h-6 w-6" />
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-sm font-medium text-gray-700">Profile Picture (Optional)</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WEBP. Max 5MB.</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-danger-500'
                              : passwordStrength === 2
                                ? 'bg-amber-500'
                                : passwordStrength === 3
                                  ? 'bg-primary-500'
                                  : 'bg-success-500'
                            : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {passwordStrength === 0 && 'Very weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Fair'}
                    {passwordStrength === 3 && 'Good'}
                    {passwordStrength === 4 && 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
