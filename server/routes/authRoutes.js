import express from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController.js';
import { requireAuth, loginRateLimiter } from '../middleware/auth.js';

const router = express.Router();

// Public auth endpoints
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);

// Protected session endpoint
router.get('/me', requireAuth, getCurrentUser);

export default router;
