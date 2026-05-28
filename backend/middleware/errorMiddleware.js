export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource context lookup failed - URL matching [${req.originalUrl}] does not resolve to an environment node target`);
  res.status(404);
  next(error);
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unhandled exception block crashed the structural pipeline runtime execution thread',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};