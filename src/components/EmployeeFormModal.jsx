import { useState } from 'react';
import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUSES } from '../data/mockEmployees';

function getInitialEmployeeState(initialData) {
  if (initialData) {
    return {
      employeeCode: initialData.employeeCode || '',
      name: initialData.name || '',
      email: initialData.email || '',
      department: initialData.department || 'IT',
      position: initialData.position || '',
      location: initialData.location || '',
      phone: initialData.phone || '',
      status: initialData.status || 'Active',
    };
  }

  return {
    employeeCode: '',
    name: '',
    email: '',
    department: 'IT',
    position: '',
    location: '',
    phone: '',
    status: 'Active',
  };
}

function EmployeeFormContent({ initialData, existingEmployees = [], onSave, onClose }) {
  const isEdit = Boolean(initialData && initialData.id);
  const [formData, setFormData] = useState(() => getInitialEmployeeState(initialData));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const trimmedCode = formData.employeeCode.trim();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    // 1. Name required
    if (!trimmedName) {
      newErrors.name = 'Employee name is required';
    }

    // 2. Employee code required & unique
    if (!trimmedCode) {
      newErrors.employeeCode = 'Employee code is required (e.g. EMP-101)';
    } else {
      const isDuplicateCode = existingEmployees.some((emp) => {
        if (isEdit && emp.id === initialData.id) return false;
        return emp.employeeCode.trim().toLowerCase() === trimmedCode.toLowerCase();
      });

      if (isDuplicateCode) {
        newErrors.employeeCode = `Employee code "${trimmedCode}" is already in use. Codes must be unique.`;
      }
    }

    // 3. Email must be valid
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address (e.g. user@company.internal)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      id: initialData?.id || `emp-${Date.now()}`,
      employeeCode: formData.employeeCode.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department,
      position: formData.position.trim() || 'Staff',
      location: formData.location.trim() || 'HQ',
      phone: formData.phone.trim() || '—',
      status: formData.status,
    };

    onSave(payload);
  };

  return (
    <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
      {/* Header */}
      <div className="detail-modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
              {isEdit ? 'Edit Employee Profile' : 'Register New Employee'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {isEdit ? `Modifying personnel record ${formData.employeeCode}` : 'Create an employee record eligible for IT equipment custody'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          aria-label="Close dialog"
          style={{ fontSize: 'var(--text-lg)', lineHeight: 1, padding: '4px 8px' }}
        >
          ✕
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <div className="detail-modal-body">
          {/* Row 1: Code & Name */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="empCode">
                Employee Code <span className="form-required">*</span>
              </label>
              <input
                id="empCode"
                name="employeeCode"
                type="text"
                placeholder="e.g. EMP-112"
                value={formData.employeeCode}
                onChange={handleChange}
                className={`form-input ${errors.employeeCode ? 'has-error' : ''}`}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              {errors.employeeCode && <span className="form-error">{errors.employeeCode}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="empName">
                Full Name <span className="form-required">*</span>
              </label>
              <input
                id="empName"
                name="name"
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'has-error' : ''}`}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="empEmail">
                Email Address <span className="form-required">*</span>
              </label>
              <input
                id="empEmail"
                name="email"
                type="email"
                placeholder="e.g. j.doe@company.internal"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'has-error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="empPhone">
                Phone Number
              </label>
              <input
                id="empPhone"
                name="phone"
                type="tel"
                placeholder="e.g. +1 (555) 019-3344"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 3: Department & Position */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="empDept">
                Department <span className="form-required">*</span>
              </label>
              <select
                id="empDept"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="select-control"
                style={{ width: '100%' }}
              >
                {EMPLOYEE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="empPosition">
                Job Title / Position
              </label>
              <input
                id="empPosition"
                name="position"
                type="text"
                placeholder="e.g. Systems Engineer, Financial Analyst"
                value={formData.position}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 4: Location & Status */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="empLocation">
                Office Location / Building
              </label>
              <input
                id="empLocation"
                name="location"
                type="text"
                placeholder="e.g. HQ - Floor 3, Chicago Branch"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="empStatus">
                Employment Status <span className="form-required">*</span>
              </label>
              <select
                id="empStatus"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select-control"
                style={{ width: '100%' }}
              >
                {EMPLOYEE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {isEdit ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EmployeeFormModal({ isOpen, initialData, existingEmployees = [], onSave, onClose }) {
  if (!isOpen) return null;

  const key = initialData?.id ? `edit-${initialData.id}` : 'create-new-emp';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <EmployeeFormContent
        key={key}
        initialData={initialData}
        existingEmployees={existingEmployees}
        onSave={onSave}
        onClose={onClose}
      />
    </div>
  );
}
