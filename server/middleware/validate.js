import { badRequest } from '../utils/apiResponse.js';

export const ALLOWED_ASSET_STATUSES = [
  'In Stock',
  'Assigned',
  'In Use',
  'In Repair',
  'Returned',
  'Disposed',
];

export const ALLOWED_EMPLOYEE_STATUSES = ['Active', 'Inactive'];

/**
 * Validates and normalizes pagination query params
 */
export function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100; // Upper safety cap

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Validates email address format
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Validates ISO date format YYYY-MM-DD
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Middleware factory for validating required body fields
 */
export function requireFields(fieldList = []) {
  return (req, res, next) => {
    const missing = [];
    for (const field of fieldList) {
      const val = req.body[field];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return badRequest(
        res,
        `Missing or empty required fields: ${missing.join(', ')}`,
        missing.map((f) => ({ field: f, message: `${f} is required` }))
      );
    }

    next();
  };
}

export default {
  ALLOWED_ASSET_STATUSES,
  ALLOWED_EMPLOYEE_STATUSES,
  parsePagination,
  isValidEmail,
  isValidDate,
  requireFields,
};
