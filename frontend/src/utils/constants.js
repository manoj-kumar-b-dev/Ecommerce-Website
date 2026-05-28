export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    ADMIN_LOGIN: '/api/auth/admin/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    ADDRESSES: '/api/addresses',
  },
  PRODUCTS: {
    BASE: '/api/products',
    DETAIL: (id) => `/api/products/${id}`,
  },
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};
