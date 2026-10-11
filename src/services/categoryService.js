import apiClient from './apiClient';

/**
 * Service for Category operations
 */
export const categoryService = {
  /**
   * Fetch all categories with dynamic asset counts
   */
  async getCategories(params = {}) {
    const data = await apiClient.get('/api/categories', params);
    return {
      categories: data?.categories || [],
      total: data?.total || 0,
    };
  },

  /**
   * Fetch single category by ID
   */
  async getCategoryById(id) {
    const data = await apiClient.get(`/api/categories/${id}`);
    return data?.category || null;
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    const payload = {
      id: categoryData.id,
      name: categoryData.name,
      description: categoryData.description || '',
    };
    const data = await apiClient.post('/api/categories', payload);
    return data?.category;
  },

  /**
   * Update category name and/or description
   */
  async updateCategory(id, categoryData) {
    const payload = {
      name: categoryData.name,
      description: categoryData.description,
    };
    const data = await apiClient.put(`/api/categories/${id}`, payload);
    return data?.category;
  },

  /**
   * Delete category (blocked on backend if assets are assigned to it)
   */
  async deleteCategory(id) {
    return await apiClient.delete(`/api/categories/${id}`);
  },
};

export default categoryService;
