import { useState } from 'react';
import AssetCategoryIcon from './AssetCategoryIcon';

function getInitialCategoryState(initialData) {
  if (initialData) {
    return {
      name: initialData.name || '',
      description: initialData.description || '',
    };
  }

  return {
    name: '',
    description: '',
  };
}

/**
 * CategoryFormContent
 * Keyed mount avoids useEffect cascading renders and ensures purity
 */
function CategoryFormContent({ initialData, existingCategories, onSave, onClose }) {
  const isEdit = Boolean(initialData && initialData.id);
  const [formData, setFormData] = useState(() => getInitialCategoryState(initialData));
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
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      newErrors.name = 'Category name is required';
    } else {
      // Check for duplicate name (case-insensitive), excluding the current category if editing
      const isDuplicate = existingCategories.some((cat) => {
        if (isEdit && cat.id === initialData.id) {
          return false;
        }
        return cat.name.trim().toLowerCase() === trimmedName.toLowerCase();
      });

      if (isDuplicate) {
        newErrors.name = `Category "${trimmedName}" already exists. Please choose a unique name.`;
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
      id: initialData?.id || `cat-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(payload);
  };

  return (
    <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
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
            <AssetCategoryIcon category={formData.name || 'Other'} size={18} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {isEdit ? `Modifying category "${initialData.name}"` : 'Define a new asset classification type'}
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
          <div className="form-group">
            <label className="form-label" htmlFor="catName">
              Category Name <span className="form-required">*</span>
            </label>
            <input
              id="catName"
              name="name"
              type="text"
              placeholder="e.g. Network Equipment, Laptop, Server"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              autoFocus
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="catDescription">
              Description <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'none', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <textarea
              id="catDescription"
              name="description"
              placeholder="Describe equipment scope, typical hardware specifications, and usage policies..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`form-input form-textarea ${errors.description ? 'has-error' : ''}`}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
            <span className="form-helper">
              Provide clear guidance to help IT staff categorize incoming inventory correctly.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {isEdit ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Reusable CategoryFormModal wrapper
 * Keyed by category ID / 'create-new' for pure initialization
 */
export default function CategoryFormModal({ isOpen, initialData, existingCategories = [], onSave, onClose }) {
  if (!isOpen) return null;

  const key = initialData?.id ? `edit-${initialData.id}` : 'create-new';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <CategoryFormContent
        key={key}
        initialData={initialData}
        existingCategories={existingCategories}
        onSave={onSave}
        onClose={onClose}
      />
    </div>
  );
}
