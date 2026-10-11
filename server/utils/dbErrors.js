import { conflict, badRequest } from './apiResponse.js';

/**
 * Maps PostgreSQL driver error codes to appropriate HTTP error responses
 * without leaking credentials, sensitive query strings, or internals.
 */
export function handleDatabaseError(err, res, defaultMsg = 'Database operation failed') {
  console.error('[DB Error Code]:', err.code, '-', err.message);

  // 1. Unique Violation (duplicate key / index constraint)
  if (err.code === '23505') {
    let friendly = 'A record with duplicate unique values already exists.';
    if (err.constraint) {
      if (err.constraint.includes('categories_name')) {
        friendly = 'A category with this name already exists.';
      } else if (err.constraint.includes('employees_employee_code') || err.constraint.includes('employees_code')) {
        friendly = 'An employee with this employee code already exists.';
      } else if (err.constraint.includes('employees_email')) {
        friendly = 'An employee with this email address already exists.';
      } else if (err.constraint.includes('assets_asset_code') || err.constraint.includes('assets_code')) {
        friendly = 'An asset with this asset code already exists.';
      } else if (err.constraint.includes('assets_serial')) {
        friendly = 'An asset with this serial number already exists.';
      } else if (err.constraint.includes('unique_active_asset_assignment')) {
        friendly = 'This asset already has an active assignment in progress.';
      }
    }
    return conflict(res, friendly);
  }

  // 2. Foreign Key Violation
  if (err.code === '23503') {
    if (err.message && err.message.includes('update or delete')) {
      return conflict(
        res,
        'Cannot complete deletion because this record is actively referenced by existing assets or assignments.'
      );
    }
    return badRequest(
      res,
      'Referenced entity was not found in the database. Please verify the category ID or employee ID.'
    );
  }

  // 3. Check Constraint Violation
  if (err.code === '23514') {
    return badRequest(res, 'Value violates database constraints (invalid status, date logic, or numeric range).');
  }

  // 4. Not Null Violation
  if (err.code === '23502') {
    const col = err.column ? `Field '${err.column}'` : 'A required field';
    return badRequest(res, `${col} is required and cannot be empty.`);
  }

  // 5. Invalid text representation / type error (e.g. malformed date or integer)
  if (err.code === '22P02') {
    return badRequest(res, 'Invalid parameter or data type format.');
  }

  // Default to 500 internal server error
  return res.status(500).json({
    status: 'error',
    message: defaultMsg,
    ...(process.env.NODE_ENV === 'development' ? { error: err.message } : {}),
  });
}

export default {
  handleDatabaseError,
};
