import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUSES } from '../data/mockEmployees';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeFormModal from '../components/EmployeeFormModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import EmployeeDeleteModal from '../components/EmployeeDeleteModal';

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, getEmployeeAssignedAssets } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Notification feedback
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const showNotification = (msg) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4000);
  };

  // Status counters for quick tabs
  const statusCounts = useMemo(() => {
    return {
      ALL: employees.length,
      Active: employees.filter((e) => e.status === 'Active').length,
      Inactive: employees.filter((e) => e.status === 'Inactive').length,
    };
  }, [employees]);

  // Filtered dataset
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Department filter
      if (selectedDept !== 'ALL' && emp.department !== selectedDept) {
        return false;
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL' && emp.status !== selectedStatus) {
        return false;
      }

      // 3. Search text (name, employeeCode, email, position, location, department)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = (emp.name || '').toLowerCase().includes(query);
        const codeMatch = (emp.employeeCode || '').toLowerCase().includes(query);
        const emailMatch = (emp.email || '').toLowerCase().includes(query);
        const posMatch = (emp.position || '').toLowerCase().includes(query);
        const locMatch = (emp.location || '').toLowerCase().includes(query);
        const deptMatch = (emp.department || '').toLowerCase().includes(query);
        return nameMatch || codeMatch || emailMatch || posMatch || locMatch || deptMatch;
      }

      return true;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus]);

  // Overall KPIs
  const totalAssignedEquipment = useMemo(() => {
    return employees.reduce((sum, emp) => sum + getEmployeeAssignedAssets(emp.id).length, 0);
  }, [employees, getEmployeeAssignedAssets]);

  const hasActiveFilters = searchQuery !== '' || selectedDept !== 'ALL' || selectedStatus !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('ALL');
    setSelectedStatus('ALL');
  };

  // ---- CRUD Handlers ----
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setIsFormOpen(true);
  };

  const handleSaveEmployee = (empData) => {
    const exists = employees.some((e) => e.id === empData.id);

    if (exists) {
      updateEmployee(empData);
      showNotification(`Employee ${empData.name} (${empData.employeeCode}) updated.`);
    } else {
      addEmployee(empData);
      showNotification(`Employee ${empData.name} (${empData.employeeCode}) successfully created.`);
    }

    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleDeletePrompt = (emp) => {
    setEmployeeToDelete(emp);
  };

  const handleConfirmDelete = (empId) => {
    const target = employees.find((e) => e.id === empId);
    const heldAssetsCount = getEmployeeAssignedAssets(empId).length;
    deleteEmployee(empId);
    setEmployeeToDelete(null);
    if (target) {
      if (heldAssetsCount > 0) {
        showNotification(`Employee ${target.name} deleted. ${heldAssetsCount} asset(s) safely released back to In Stock inventory.`);
      } else {
        showNotification(`Employee ${target.name} has been deleted.`);
      }
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">Manage personnel profiles, workforce departments, and assigned IT asset custody</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreate}
            aria-label="Add new employee"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Feedback notice banner */}
      {feedbackNotice && (
        <div
          className="placeholder-notice"
          style={{
            backgroundColor: 'var(--color-status-success-bg)',
            borderColor: '#bbf7d0',
            color: 'var(--color-status-success)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {feedbackNotice}
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="section-grid section-grid-4" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Workforce</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{employees.length}</div>
          <div className="stat-card-meta">Registered personnel records</div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Staff</span>
            <div className="stat-card-icon green">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{statusCounts.Active}</div>
          <div className="stat-card-meta">Eligible for asset assignments</div>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Inactive Staff</span>
            <div className="stat-card-icon amber">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{statusCounts.Inactive}</div>
          <div className="stat-card-meta">Archived or departed personnel</div>
        </div>

        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Assigned Assets</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{totalAssignedEquipment}</div>
          <div className="stat-card-meta">Units held across workforce</div>
        </div>
      </div>

      {/* Main Employees Card */}
      <div className="card">
        {/* Quick Status Tabs */}
        <div className="quick-filter-tabs">
          <button
            type="button"
            className={`quick-tab-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            All Personnel
            <span className="quick-tab-count">{statusCounts.ALL}</span>
          </button>
          {EMPLOYEE_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`quick-tab-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
              <span className="quick-tab-count">{statusCounts[status] || 0}</span>
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="asset-filter-bar">
          <div className="asset-filter-group">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search name, code, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search employees by name, code, email, or role"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer' }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Filter */}
            <select
              className="select-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="ALL">All Departments</option>
              {EMPLOYEE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status Dropdown Filter */}
            <select
              className="select-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              {EMPLOYEE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResetFilters}
                style={{ color: 'var(--color-status-danger)', fontSize: 'var(--text-xs)' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredEmployees.length}</strong> of {employees.length} personnel
          </div>
        </div>

        {/* Employee Table */}
        <EmployeeTable
          employees={filteredEmployees}
          getAssignedAssetCount={(empId) => getEmployeeAssignedAssets(empId).length}
          onViewEmployee={(emp) => setViewingEmployee(emp)}
          onEditEmployee={handleOpenEdit}
          onDeleteEmployee={handleDeletePrompt}
        />

        {/* Card Footer / Pagination Information */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing {filteredEmployees.length > 0 ? 1 : 0} to {filteredEmployees.length} of {filteredEmployees.length} filtered items
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Previous
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT Employee Modal */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        initialData={editingEmployee}
        existingEmployees={employees}
        onSave={handleSaveEmployee}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
      />

      {/* VIEW Employee Detail Modal */}
      {viewingEmployee && (
        <EmployeeDetailModal
          employee={viewingEmployee}
          assignedAssets={getEmployeeAssignedAssets(viewingEmployee.id)}
          onClose={() => setViewingEmployee(null)}
          onEdit={handleOpenEdit}
        />
      )}

      {/* DELETE Employee Confirmation Modal */}
      {employeeToDelete && (
        <EmployeeDeleteModal
          employee={employeeToDelete}
          assignedAssets={getEmployeeAssignedAssets(employeeToDelete.id)}
          onConfirm={handleConfirmDelete}
          onCancel={() => setEmployeeToDelete(null)}
        />
      )}
    </div>
  );
}
