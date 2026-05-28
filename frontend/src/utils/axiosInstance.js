import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s to handle Render free-tier cold starts
});

// Retry logic for timeout/network errors (Render cold start resilience)
axiosInstance.interceptors.response.use(null, async (error) => {
  const config = error.config;
  
  // Only retry on timeout or network errors, not on HTTP errors
  const isRetryable = error.code === 'ECONNABORTED' || error.message === 'Network Error';
  
  if (!isRetryable || !config) return Promise.reject(error);
  
  config.__retryCount = config.__retryCount || 0;
  const MAX_RETRIES = 2;
  
  if (config.__retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }
  
  config.__retryCount += 1;
  console.log(`[API] Retrying request (${config.__retryCount}/${MAX_RETRIES}): ${config.url}`);
  
  // Exponential backoff: 2s, 4s
  const delay = Math.pow(2, config.__retryCount) * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return axiosInstance(config);
});

// Request interceptor — attach auth token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] Response ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || '';

    // These routes should NEVER trigger an automatic redirect:
    // - Login / admin-login pages (wrong credentials should just show an error)
    // - /api/auth/me (token verification during bootstrap — just clear state, don't redirect)
    const isAuthSelfRequest =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/admin/login') ||
      requestUrl.includes('/api/auth/me') ||
      requestUrl.includes('/api/auth/register');

    // Only redirect on 401 for true protected routes (not auth routes themselves)
    if (error.response?.status === 401 && !isAuthSelfRequest) {
      console.warn('[API] Unauthorized (401) — clearing auth state');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const isAdminPath = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    }

    if (error.response?.status === 403) {
      console.warn('[API] Forbidden (403):', error.response.data?.message);
    }

    if (error.response?.status === 500) {
      console.error('[API] Server error (500):', error.response.data?.message);
    }

    if (error.message === 'Network Error') {
      console.error('[API] Network error — is the backend server running on port 5000?');
    }

    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timed out after 60s');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
