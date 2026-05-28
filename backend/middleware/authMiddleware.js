import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// SECURITY: Verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to HttpOnly Cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized to access this route, token missing'));
  }

  try {
    if (!process.env.JWT_SECRET) {
      res.status(500);
      return next(new Error('JWT_SECRET is not configured'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      return next(new Error('User matching this token no longer exists'));
    }
    
    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Token verification failed, session expired'));
  }
};

// SECURITY: Allow only admin users to access admin routes
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    return next(new Error('Access denied: Administrative privileges required'));
  }
};

// SECURITY: Allow only regular users (not admins) to access user routes
// This prevents admins from accidentally accessing user endpoints
export const userOnly = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403);
    return next(new Error('Access denied: This action is restricted to regular user accounts'));
  }
};

// Alias for backward compatibility
export const admin = adminOnly;
