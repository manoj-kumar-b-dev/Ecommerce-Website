import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Home } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login page
  if (!user) {
    const loginPath = adminOnly ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // SECURITY: If admin-only route and user is not admin
  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-red-200">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-danger-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-danger-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Denied</h2>
          <p className="text-center text-gray-600 mb-6">
            <strong>Unauthorized Access:</strong> You do not have admin privileges to access this area. 
            Admin portal is restricted to administrators only.
          </p>
          <a
            href="/"
            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors mb-3"
          >
            Return to Home
          </a>
          <button
            onClick={() => window.history.back()}
            className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // SECURITY: If regular user trying to access user-only protected route with admin role
  if (!adminOnly && user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-yellow-200">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Access</h2>
          <p className="text-center text-gray-600 mb-6">
            Your admin account is not allowed to access customer pages. 
            Please use the <strong>Admin Dashboard</strong> instead.
          </p>
          <a
            href="/admin"
            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
