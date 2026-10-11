/**
 * 404 Not Found handler for undefined route requests
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    status: 'fail',
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized structured error handling middleware
 */
export function errorHandler(err, req, res, _next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An internal server error occurred',
    ...(isDev ? { stack: err.stack } : {}),
  });
}

export default {
  notFoundHandler,
  errorHandler,
};
