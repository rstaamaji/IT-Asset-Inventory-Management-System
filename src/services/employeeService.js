import apiClient from './apiClient';

/**
 * Service for Employee operations
 */
export const employeeService = {
  /**
   * Fetch paginated employees with search, department, and status filters
   */
  async getEmployees(params = {}) {
    const data = await apiClient.get('/api/employees', params);
    return {
      employees: data?.employees || [],
      pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  /**
   * Fetch single employee with active assigned assets
   */
  async getEmployeeById(id) {
    const data = await apiClient.get(`/api/employees/${id}`);
    return data?.employee || null;
  },

  /**
   * Register a new employee
   */
  async createEmployee(employeeData) {
    const payload = {
      id: employeeData.id,
      employeeCode: employeeData.employeeCode,
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department,
      position: employeeData.position,
      location: employeeData.location,
      phone: employeeData.phone || '',
      status: employeeData.status || 'Active',
      joinedDate: employeeData.joinedDate,
    };
    const data = await apiClient.post('/api/employees', payload);
    return data?.employee;
  },

  /**
   * Update employee details
   */
  async updateEmployee(id, employeeData) {
    const payload = {
      employeeCode: employeeData.employeeCode,
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department,
      position: employeeData.position,
      location: employeeData.location,
      phone: employeeData.phone,
      status: employeeData.status,
      joinedDate: employeeData.joinedDate,
    };
    const data = await apiClient.put(`/api/employees/${id}`, payload);
    return data?.employee;
  },

  /**
   * Safe deletion of employee (blocked if active or historical assignments exist)
   */
  async deleteEmployee(id) {
    return await apiClient.delete(`/api/employees/${id}`);
  },
};

export default employeeService;
