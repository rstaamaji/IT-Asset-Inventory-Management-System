/**
 * Consistent API Response Helper Functions
 * Standardizes API output across all endpoints.
 */

export function success(res, data = {}, message = null, statusCode = 200) {
  const payload = {
    status: 'success',
  };
  if (message) payload.message = message;
  if (data && Object.keys(data).length > 0) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function created(res, data = {}, message = 'Resource created successfully') {
  return success(res, data, message, 201);
}

export function fail(res, message, errors = null, statusCode = 400) {
  const payload = {
    status: 'fail',
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

export function notFound(res, message = 'Resource not found') {
  return fail(res, message, null, 404);
}

export function conflict(res, message = 'Resource conflict or duplicate constraint violation') {
  return fail(res, message, null, 409);
}

export function badRequest(res, message = 'Invalid request payload or parameters', errors = null) {
  return fail(res, message, errors, 400);
}

export function sendSuccess(res, data = {}, message = null, statusCode = 200) {
  return success(res, data, message, statusCode);
}

export function sendError(res, message, statusCode = 400, errors = null) {
  return fail(res, message, errors, statusCode);
}

export default {
  success,
  created,
  fail,
  notFound,
  conflict,
  badRequest,
  sendSuccess,
  sendError,
};
