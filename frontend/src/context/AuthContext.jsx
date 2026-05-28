import { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_ROUTES } from '../utils/constants';

const AUTH_ROUTES = API_ROUTES.AUTH;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          try {
            // Verify token with backend
            const { data } = await axiosInstance.get(AUTH_ROUTES.ME);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (err) {
            // Token invalid or expired — clear storage quietly.
            // Do NOT redirect here; let the router handle protected routes.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const loginUser = useCallback(async (email, password, rememberMe = true) => {
    setError(null);
    try {
      const { data } = await axiosInstance.post(AUTH_ROUTES.LOGIN, { email, password });

      // SECURITY: Validate that user is a regular user, not admin
      if (data.user.role !== 'user') {
        // Clear any stored auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        const errMsg = 'Admin accounts must login through the admin portal';
        setError(errMsg);
        throw new Error(errMsg);
      }

      localStorage.setItem('token', data.token);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('user');
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  const adminLogin = useCallback(async (email, password, rememberMe = true) => {
    setError(null);
    try {
      const { data } = await axiosInstance.post(AUTH_ROUTES.ADMIN_LOGIN, { email, password });

      localStorage.setItem('token', data.token);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('user');
      }

      if (data.user.role !== 'admin') {
        throw new Error('This account does not have admin access');
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const errMsg = err.response?.data?.message || err.message || 'Admin login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  const registerUser = useCallback(async (formData) => {
    setError(null);
    try {
      const { data } = await axiosInstance.post(AUTH_ROUTES.REGISTER, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await axiosInstance.get(AUTH_ROUTES.LOGOUT);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data from server (used after address changes)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(AUTH_ROUTES.ME);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login: loginUser,
      adminLogin,
      register: registerUser,
      logout: logoutUser,
      clearError,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
