import { useState } from 'react';
import { ASSET_CATEGORIES, ASSET_STATUSES } from '../data/mockAssets';
import AssetCategoryIcon from './AssetCategoryIcon';

function getInitialFormState(initialData) {
  if (initialData) {
    return {
      assetCode: initialData.assetCode || '',
      assetName: initialData.assetName || '',
      category: initialData.category || 'Laptop',
      brand: initialData.brand || '',
      model: initialData.model || '',
      serialNumber: initialData.serialNumber || '',
      purchaseDate: initialData.purchaseDate || '',
      purchasePrice: initialData.purchasePrice != null ? String(initialData.purchasePrice) : '',
      warrantyEnd: initialData.warrantyEnd || '',
      location: initialData.location || '',
      status: initialData.status || 'In Stock',
      assignedName: initialData.assignedTo?.name || '',
      assignedDept: initialData.assignedTo?.department || '',
    };
  }

  return {
    assetCode: '',
    assetName: '',
    category: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    warrantyEnd: '',
    location: '',
    status: 'In Stock',
    assignedName: '',
    assignedDept: '',
  };
}

/**
 * Internal form content component
 * Keyed by asset ID / 'create' to initialize state purely upon mount
 */
function AssetFormContent({ initialData, categories = [], onSave, onClose }) {
  const isEdit = Boolean(initialData && initialData.id);
  const [formData, setFormData] = useState(() => getInitialFormState(initialData));
  const [errors, setErrors] = useState({});

  const categoryList = categories.length > 0 ? categories.map((c) => c.name || c) : ASSET_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.assetCode.trim()) {
      newErrors.assetCode = 'Asset code is required (e.g. AST-2026-001)';
    }

    if (!formData.assetName.trim()) {
      newErrors.assetName = 'Asset name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a hardware category';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand / manufacturer is required';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Hardware serial number is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Physical or site location is required';
    }

    if (!formData.status) {
      newErrors.status = 'Please select a lifecycle status';
    }

    if (formData.purchasePrice && isNaN(Number(formData.purchasePrice))) {
      newErrors.purchasePrice = 'Purchase price must be a valid number';
    }

    if ((formData.status === 'Assigned' || formData.status === 'In Use') && !formData.assignedName.trim()) {
      newErrors.assignedName = 'Custodian name is required when asset is Assigned or In Use';
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
      id: initialData?.id || `ast-${Date.now()}`,
      assetCode: formData.assetCode.trim(),
      assetName: formData.assetName.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      model: formData.model.trim() || '—',
      serialNumber: formData.serialNumber.trim(),
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
      warrantyEnd: formData.warrantyEnd || '—',
      location: formData.location.trim(),
      status: formData.status,
      assignedTo: formData.assignedName.trim()
        ? {
            name: formData.assignedName.trim(),
            department: formData.assignedDept.trim() || 'General',
            email: `${formData.assignedName.trim().toLowerCase().replace(/\s+/g, '.')}@company.internal`,
          }
        : null,
    };

    onSave(payload);
  };

  return (
    <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
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
            <AssetCategoryIcon category={formData.category} size={18} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
              {isEdit ? 'Edit Asset' : 'Register New Asset'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {isEdit ? `Modifying asset ${formData.assetCode}` : 'Fill in hardware details to record in inventory'}
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
              <label className="form-label" htmlFor="assetCode">
                Asset Code <span className="form-required">*</span>
              </label>
              <input
                id="assetCode"
                name="assetCode"
                type="text"
                placeholder="e.g. AST-2026-042"
                value={formData.assetCode}
                onChange={handleChange}
                className={`form-input ${errors.assetCode ? 'has-error' : ''}`}
              />
              {errors.assetCode && <span className="form-error">{errors.assetCode}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="assetName">
                Asset Name <span className="form-required">*</span>
              </label>
              <input
                id="assetName"
                name="assetName"
                type="text"
                placeholder="e.g. ThinkPad T14 Gen 4"
                value={formData.assetName}
                onChange={handleChange}
                className={`form-input ${errors.assetName ? 'has-error' : ''}`}
              />
              {errors.assetName && <span className="form-error">{errors.assetName}</span>}
            </div>
          </div>

          {/* Row 2: Category & Status */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="form-required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`select-control ${errors.category ? 'has-error' : ''}`}
                style={{ width: '100%' }}
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Lifecycle Status <span className="form-required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`select-control ${errors.status ? 'has-error' : ''}`}
                style={{ width: '100%' }}
              >
                {ASSET_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.status && <span className="form-error">{errors.status}</span>}
            </div>
          </div>

          {/* Row 3: Brand & Model */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="brand">
                Brand / Vendor <span className="form-required">*</span>
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                placeholder="e.g. Lenovo, Apple, Dell"
                value={formData.brand}
                onChange={handleChange}
                className={`form-input ${errors.brand ? 'has-error' : ''}`}
              />
              {errors.brand && <span className="form-error">{errors.brand}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="model">
                Model / Part Number
              </label>
              <input
                id="model"
                name="model"
                type="text"
                placeholder="e.g. 21HD001EUS"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 4: Serial Number & Location */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="serialNumber">
                Serial Number <span className="form-required">*</span>
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                placeholder="e.g. PF-49X82A"
                value={formData.serialNumber}
                onChange={handleChange}
                className={`form-input ${errors.serialNumber ? 'has-error' : ''}`}
              />
              {errors.serialNumber && <span className="form-error">{errors.serialNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Location / Site <span className="form-required">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. HQ - Floor 3 (Engineering)"
                value={formData.location}
                onChange={handleChange}
                className={`form-input ${errors.location ? 'has-error' : ''}`}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>

          {/* Row 5: Purchase Date, Price, Warranty */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="purchaseDate">
                Purchase Date
              </label>
              <input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="purchasePrice">
                Purchase Price (USD)
              </label>
              <input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                placeholder="e.g. 1299.00"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={`form-input ${errors.purchasePrice ? 'has-error' : ''}`}
              />
              {errors.purchasePrice && <span className="form-error">{errors.purchasePrice}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="warrantyEnd">
                Warranty Expiration
              </label>
              <input
                id="warrantyEnd"
                name="warrantyEnd"
                type="date"
                value={formData.warrantyEnd}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Row 6: Custody Assignment */}
          <div className="divider" style={{ margin: 'var(--space-2) 0' }} />
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-3)' }}>
              Custody &amp; Assignment Details
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="assignedName">
                  Custodian / Employee Name {(formData.status === 'Assigned' || formData.status === 'In Use') && <span className="form-required">*</span>}
                </label>
                <input
                  id="assignedName"
                  name="assignedName"
                  type="text"
                  placeholder="e.g. Michael Scott"
                  value={formData.assignedName}
                  onChange={handleChange}
                  className={`form-input ${errors.assignedName ? 'has-error' : ''}`}
                />
                {errors.assignedName && <span className="form-error">{errors.assignedName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="assignedDept">
                  Department
                </label>
                <input
                  id="assignedDept"
                  name="assignedDept"
                  type="text"
                  placeholder="e.g. Engineering, Sales, DevOps"
                  value={formData.assignedDept}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {isEdit ? 'Update Asset' : 'Save Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Main AssetFormModal wrapper
 * Mounts AssetFormContent keyed by initialData ID to preserve purity without useEffect state mutations
 */
export default function AssetFormModal({ isOpen, initialData, categories = [], onSave, onClose }) {
  if (!isOpen) return null;

  const key = initialData?.id ? `edit-${initialData.id}` : 'create-new';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <AssetFormContent
        key={key}
        initialData={initialData}
        categories={categories}
        onSave={onSave}
        onClose={onClose}
      />
    </div>
  );
}
