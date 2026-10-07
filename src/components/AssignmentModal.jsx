import { useState } from 'react';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssignmentModal Component
 * Allows assigning an available (In Stock or Returned) IT asset to an active employee.
 * Enforces rule: Already assigned assets cannot be assigned again.
 */
export default function AssignmentModal({ isOpen, assets = [], employees = [], preSelectedAssetId = null, onAssign, onClose }) {
  // Filter available assets: only 'In Stock' or 'Returned' assets can be checked out
  const availableAssets = assets.filter(
    (a) => a.status === 'In Stock' || a.status === 'Returned' || a.id === preSelectedAssetId
  );

  const activeEmployees = employees.filter((e) => e.status === 'Active');

  const [assetId, setAssetId] = useState(preSelectedAssetId || (availableAssets[0]?.id || ''));
  const [employeeId, setEmployeeId] = useState(activeEmployees[0]?.id || '');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const selectedAsset = assets.find((a) => a.id === assetId);
  const selectedEmployee = employees.find((e) => e.id === employeeId);

  const validate = () => {
    const newErrors = {};

    if (!assetId) {
      newErrors.assetId = 'Please select an asset to assign';
    } else {
      const targetAsset = assets.find((a) => a.id === assetId);
      if (targetAsset && (targetAsset.status === 'Assigned' || targetAsset.status === 'In Use')) {
        newErrors.assetId = `This asset is already assigned to ${targetAsset.assignedTo?.name || 'another custodian'}.`;
      }
    }

    if (!employeeId) {
      newErrors.employeeId = 'Please select an employee to receive this asset';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onAssign({
      assetId,
      employeeId,
      expectedReturnDate,
      notes,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
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
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                Assign IT Equipment
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Transfer hardware custody from central inventory to an active employee
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="detail-modal-body">
            {/* Step 1: Select Asset */}
            <div className="form-group">
              <label className="form-label" htmlFor="asgAsset">
                Select Available Hardware Asset <span className="form-required">*</span>
              </label>
              {availableAssets.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-status-warning-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fde68a',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-status-warning)',
                  }}
                >
                  No assets currently in stock or available for assignment. Register or return assets first.
                </div>
              ) : (
                <select
                  id="asgAsset"
                  value={assetId}
                  onChange={(e) => {
                    setAssetId(e.target.value);
                    if (errors.assetId) setErrors((prev) => ({ ...prev, assetId: null }));
                  }}
                  className={`select-control ${errors.assetId ? 'has-error' : ''}`}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Choose an available asset --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      [{asset.assetCode}] {asset.assetName} · {asset.category} ({asset.status})
                    </option>
                  ))}
                </select>
              )}
              {errors.assetId && <span className="form-error">{errors.assetId}</span>}

              {selectedAsset && (
                <div
                  style={{
                    marginTop: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <AssetCategoryIcon category={selectedAsset.category} size={15} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)' }}>
                      {selectedAsset.brand} {selectedAsset.model}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      (SN: {selectedAsset.serialNumber})
                    </span>
                  </div>
                  <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                    Current: {selectedAsset.location}
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Select Employee */}
            <div className="form-group">
              <label className="form-label" htmlFor="asgEmployee">
                Assignee / Custodian <span className="form-required">*</span>
              </label>
              <select
                id="asgEmployee"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  if (errors.employeeId) setErrors((prev) => ({ ...prev, employeeId: null }));
                }}
                className={`select-control ${errors.employeeId ? 'has-error' : ''}`}
                style={{ width: '100%' }}
              >
                <option value="">-- Choose an active employee --</option>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode}) · {emp.department} - {emp.position}
                  </option>
                ))}
              </select>
              {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}

              {selectedEmployee && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Contact: {selectedEmployee.email} · Office: {selectedEmployee.location}
                </div>
              )}
            </div>

            {/* Step 3: Expected Return Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="asgExpectedReturn">
                Expected Return Date (Optional)
              </label>
              <input
                id="asgExpectedReturn"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="form-input"
              />
              <span className="form-helper">
                Leave blank if assignment is indefinite or continuous employment standard issue.
              </span>
            </div>

            {/* Step 4: Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="asgNotes">
                Assignment Purpose / Notes (Optional)
              </label>
              <textarea
                id="asgNotes"
                placeholder="e.g. Workstation setup for incoming senior engineer, project deployment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="form-input form-textarea"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={availableAssets.length === 0}
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
