import apiClient from './apiClient';

/**
 * Authentication API Service
 */
export const authService = {
  /**
   * Log in user with email & password
   * Server responds with user profile and sets secure HttpOnly cookie
   */
  async login(email, password) {
    const res = await apiClient.post('/api/auth/login', { email, password });
    return res;
  },

  /**
   * Log out current user and clear session cookie
   */
  async logout() {
    const res = await apiClient.post('/api/auth/logout', {});
    return res;
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getCurrentUser() {
    const res = await apiClient.get('/api/auth/me');
    return res;
  },
};

export default authService;
