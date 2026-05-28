import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Eye, EyeOff, CheckCircle, Upload, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.08] bg-[size:80px_80px]" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-tight">
            Join ShopFlow Today
          </h1>
          <p className="text-primary-100 text-lg mb-10 leading-relaxed">
            Create an account to enjoy exclusive benefits and a seamless shopping experience.
          </p>
          <div className="space-y-5 text-left">
            <div className="flex items-center gap-4 text-primary-50">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-lg">Fast checkout with saved addresses</span>
            </div>
            <div className="flex items-center gap-4 text-primary-50">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-lg">Order tracking and history</span>
            </div>
            <div className="flex items-center gap-4 text-primary-50">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-lg">Exclusive member-only discounts</span>
            </div>
            <div className="flex items-center gap-4 text-primary-50">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-lg">Wishlist to save your favorite items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/20">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Create Account</h2>
            <p className="mt-3 text-gray-600 text-base">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group">
                Sign in
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

          {validationError && (
            <div className="bg-danger-50 border border-danger-200 rounded-2xl p-4 flex gap-3 animate-slide-up shadow-sm">
              <ShieldCheck className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-danger-900">Registration Failed</h3>
                <p className="text-sm text-danger-700 mt-1">{validationError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 mb-3 shadow-sm hover:border-primary-200 transition-colors">
                <img 
                  src={avatarPreview || 'https://placehold.co/150x150?text=Avatar'} 
                  alt="Avatar Preview" 
                  className="h-full w-full object-cover" 
                />
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-sm font-bold text-gray-900">Profile Picture <span className="text-gray-400 font-medium">(Optional)</span></p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WEBP. Max 5MB.</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input py-3.5 text-base"
                placeholder="John Doe"
              />
            </div>

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
                className="input py-3.5 text-base"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
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
                  className="input py-3.5 pr-12 text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 touch-target flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-danger-500'
                              : passwordStrength === 2
                                ? 'bg-amber-500'
                                : passwordStrength === 3
                                  ? 'bg-primary-500'
                                  : 'bg-success-500'
                            : 'bg-gray-100'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    {passwordStrength === 0 && 'Very weak'}
                    {passwordStrength === 1 && 'Weak password'}
                    {passwordStrength === 2 && 'Fair password'}
                    {passwordStrength === 3 && 'Good password'}
                    {passwordStrength === 4 && 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input py-3.5 text-base"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full text-base font-bold py-4 shadow-md hover:shadow-lg mt-4"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-6 leading-relaxed">
              By creating an account, you agree to our <br/>
              <Link to="/terms" className="text-primary-600 font-semibold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
