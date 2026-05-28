import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute window parameters
  max: 15, // Limit each isolated IP to 15 authentication connection attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts emitted from this endpoint vector trace. Please retry after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});