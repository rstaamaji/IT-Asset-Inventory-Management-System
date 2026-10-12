import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';
import { isValidEmail } from '../middleware/validate.js';
import {
  generateToken,
  getAuthCookieOptions,
  AUTH_COOKIE_NAME,
  resetLoginAttempts,
} from '../middleware/auth.js';

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return sendError(res, 'A valid email address is required', 400);
  }

  try {
    const userRes = await pool.query(
      `SELECT id, name, email, password_hash, role, status
       FROM users
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    // Generic error message to prevent user enumeration
    const invalidCredentialsMsg = 'Invalid email or password';

    if (userRes.rows.length === 0) {
      return sendError(res, invalidCredentialsMsg, 401);
    }

    const user = userRes.rows[0];

    if (user.status !== 'Active') {
      return sendError(
        res,
        'Your account has been deactivated. Please contact an administrator.',
        403
      );
    }

    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return sendError(res, invalidCredentialsMsg, 401);
    }

    // Reset rate limiter for this IP
    const clientIp = req.ip || req.connection.remoteAddress;
    resetLoginAttempts(clientIp);

    // Generate JWT token
    const token = generateToken(user);

    // Set secure HttpOnly cookie
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        token, // Provided for headless API/CLI clients
      },
      'Login successful',
      200
    );
  } catch (err) {
    return handleDatabaseError(err, res, 'login');
  }
}

/**
 * POST /api/auth/logout
 * Clears the HttpOnly authentication cookie
 */
export async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });

  return sendSuccess(res, null, 'Logged out successfully', 200);
}

/**
 * GET /api/auth/me
 * Retrieves profile of currently authenticated user from DB
 */
export async function getCurrentUser(req, res) {
  try {
    const userRes = await pool.query(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return sendError(res, 'User record not found', 404);
    }

    const user = userRes.rows[0];
    if (user.status !== 'Active') {
      return sendError(
        res,
        'Your account is inactive. Please contact an administrator.',
        403
      );
    }

    return sendSuccess(res, { user }, 'User profile retrieved successfully', 200);
  } catch (err) {
    return handleDatabaseError(err, res, 'getCurrentUser');
  }
}
