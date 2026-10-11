import apiClient from './apiClient';

/**
 * Service for Dashboard aggregate KPI and distribution statistics
 */
export const dashboardService = {
  /**
   * Fetch live server aggregate metrics for dashboard
   */
  async getStats() {
    const data = await apiClient.get('/api/dashboard/stats');
    return data?.stats || null;
  },
};

export default dashboardService;
