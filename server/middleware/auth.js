import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'it_asset_mgmt_dev_jwt_secret_change_in_production_key';
export const AUTH_COOKIE_NAME = 'auth_token';
export const TOKEN_EXPIRY = '8h';
export const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Generate signed JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Express cookie options helper
 */
export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

/**
 * Authentication Middleware
 * Validates JWT token from HttpOnly cookie or Authorization Bearer header
 */
export function requireAuth(req, res, next) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }

  // 2. Fallback to Authorization: Bearer <token> header for CLI/API clients
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return sendError(
      res,
      'Authentication required. Please sign in to access this resource.',
      401
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(
        res,
        'Your session has expired. Please sign in again.',
        401
      );
    }
    return sendError(
      res,
      'Invalid authentication token. Please sign in again.',
      401
    );
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts endpoint to specific roles (e.g. 'Admin')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required. Please sign in.',
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}

/**
 * Simple in-memory rate limiter for login attempts
 * Limits consecutive failed attempts per IP
 */
const loginAttemptsMap = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  const record = loginAttemptsMap.get(ip);
  if (record) {
    if (now - record.firstAttempt > WINDOW_MS) {
      // Window expired, reset
      loginAttemptsMap.set(ip, { count: 1, firstAttempt: now });
    } else if (record.count >= MAX_ATTEMPTS) {
      return sendError(
        res,
        'Too many login attempts. Please try again in 15 minutes.',
        429
      );
    } else {
      record.count += 1;
    }
  } else {
    loginAttemptsMap.set(ip, { count: 1, firstAttempt: now });
  }

  next();
}

/**
 * Reset rate limit counter upon successful login
 */
export function resetLoginAttempts(ip) {
  if (ip && loginAttemptsMap.has(ip)) {
    loginAttemptsMap.delete(ip);
  }
}
