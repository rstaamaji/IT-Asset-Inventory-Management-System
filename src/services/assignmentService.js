import apiClient from './apiClient';

/**
 * Service for Asset Assignment and Return operations
 */
export const assignmentService = {
  /**
   * Fetch paginated assignments with search and filters
   */
  async getAssignments(params = {}) {
    const data = await apiClient.get('/api/assignments', params);
    return {
      assignments: data?.assignments || [],
      pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  /**
   * Fetch single assignment with full details
   */
  async getAssignmentById(id) {
    const data = await apiClient.get(`/api/assignments/${id}`);
    return data?.assignment || null;
  },

  /**
   * Create an assignment (locks asset, transitions status to Assigned atomically)
   */
  async createAssignment(assignmentData) {
    const payload = {
      id: assignmentData.id,
      assetId: assignmentData.assetId,
      employeeId: assignmentData.employeeId,
      assignedDate: assignmentData.assignedDate,
      expectedReturnDate: assignmentData.expectedReturnDate,
      notes: assignmentData.notes,
      actor: assignmentData.actor || null,
    };
    const data = await apiClient.post('/api/assignments', payload);
    return data?.assignment;
  },

  /**
   * Process equipment return (transitions assignment to Returned and updates inventory)
   */
  async returnAssignment(id, returnData = {}) {
    const payload = {
      returnedDate: returnData.returnedDate,
      notes: returnData.notes || returnData.returnNotes,
      returnStatus: returnData.returnStatus || 'In Stock',
      actor: returnData.actor || null,
    };
    const data = await apiClient.post(`/api/assignments/${id}/return`, payload);
    return data;
  },
};

export default assignmentService;
