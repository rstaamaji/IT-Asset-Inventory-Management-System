import apiClient from './apiClient';

/**
 * Service for Asset CRUD and Lifecycle Status operations
 */
export const assetService = {
  /**
   * Fetch paginated assets with search and filters
   */
  async getAssets(params = {}) {
    const data = await apiClient.get('/api/assets', params);
    return {
      assets: data?.assets || [],
      pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  /**
   * Fetch single asset by ID with full status history and active assignment
   */
  async getAssetById(id) {
    const data = await apiClient.get(`/api/assets/${id}`);
    return data?.asset || null;
  },

  /**
   * Register a new asset in the system
   */
  async createAsset(assetData) {
    const payload = {
      id: assetData.id,
      assetCode: assetData.assetCode,
      assetName: assetData.assetName,
      categoryId: assetData.categoryId || assetData.category_id,
      category: assetData.category,
      brand: assetData.brand,
      model: assetData.model,
      serialNumber: assetData.serialNumber,
      purchaseDate: assetData.purchaseDate,
      purchasePrice: assetData.purchasePrice != null ? Number(assetData.purchasePrice) : 0,
      warrantyEnd: assetData.warrantyEnd,
      location: assetData.location,
      status: assetData.status || 'In Stock',
      assignedToEmployeeId: assetData.assignedTo?.id || assetData.assignedToEmployeeId || null,
      actor: assetData.actor || null,
    };

    const data = await apiClient.post('/api/assets', payload);
    return data?.asset;
  },

  /**
   * Update an existing asset
   */
  async updateAsset(id, assetData, reason = '', actor = null) {
    const payload = {
      assetCode: assetData.assetCode,
      assetName: assetData.assetName,
      categoryId: assetData.categoryId || assetData.category_id,
      category: assetData.category,
      brand: assetData.brand,
      model: assetData.model,
      serialNumber: assetData.serialNumber,
      purchaseDate: assetData.purchaseDate,
      purchasePrice: assetData.purchasePrice != null ? Number(assetData.purchasePrice) : undefined,
      warrantyEnd: assetData.warrantyEnd,
      location: assetData.location,
      status: assetData.status,
      assignedToEmployeeId: assetData.assignedTo ? assetData.assignedTo.id : assetData.assignedToEmployeeId,
      reason: reason || undefined,
      actor: actor || undefined,
    };

    const data = await apiClient.put(`/api/assets/${id}`, payload);
    return data?.asset;
  },

  /**
   * Transition asset status through the dedicated lifecycle endpoint
   */
  async updateAssetStatus(id, newStatus, reason = '', actor = null) {
    const payload = {
      status: newStatus,
      reason: reason || undefined,
      actor: actor || undefined,
    };

    const data = await apiClient.patch(`/api/assets/${id}/status`, payload);
    return data?.asset;
  },

  /**
   * Safe asset deletion
   */
  async deleteAsset(id) {
    return await apiClient.delete(`/api/assets/${id}`);
  },
};

export default assetService;
