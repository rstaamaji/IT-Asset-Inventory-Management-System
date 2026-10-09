import { useState } from 'react';

/**
 * Reusable EmployeeDeleteModal Component
 * Confirms deletion of an employee record with asset re-assignment safeguards.
 * Enforces rule: Cannot silently delete an employee with active IT assets;
 * requires explicit user resolution and confirmation.
 */
export default function EmployeeDeleteModal({
  employee,
  assignedAssets = [],
  onConfirm,
  onCancel,
}) {
  const [resolutionConfirmed, setResolutionConfirmed] = useState(false);

  if (!employee) return null;

  const hasAssignedAssets = assignedAssets.length > 0;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="confirm-modal-body">
          <div className="confirm-icon-box" style={{ backgroundColor: hasAssignedAssets ? 'var(--color-status-warning-bg)' : 'var(--color-status-danger-bg)', color: hasAssignedAssets ? 'var(--color-status-warning)' : 'var(--color-status-danger)' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="confirm-content" style={{ width: '100%' }}>
            <h3 className="confirm-title">Delete Employee Record?</h3>
            <p className="confirm-desc">
              Are you sure you want to remove <strong>{employee.name}</strong> ({employee.employeeCode})?
            </p>

            {hasAssignedAssets ? (
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-status-warning-bg)',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-status-warning)', marginBottom: 4 }}>
                  ⚠️ Active Custody Safeguard
                </div>
                <p style={{ margin: '0 0 var(--space-2) 0' }}>
                  This employee currently holds <strong>{assignedAssets.length}</strong> active IT asset(s). To maintain relational data integrity, you must explicitly confirm resolution before proceeding.
                </p>

                {/* Compact Assigned Assets Preview */}
                <div
                  style={{
                    maxHeight: 120,
                    overflowY: 'auto',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {assignedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '3px 0',
                        borderBottom: '1px solid var(--color-border-light)',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ fontWeight: 'var(--font-medium)' }}>{asset.assetName}</span>
                      <span className="asset-code-badge" style={{ fontSize: '10px' }}>{asset.assetCode}</span>
                    </div>
                  ))}
                </div>

                {/* Explicit Resolution Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: 'var(--font-medium)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={resolutionConfirmed}
                    onChange={(e) => setResolutionConfirmed(e.target.checked)}
                    style={{ marginTop: 2 }}
                  />
                  <span>
                    Explicit Resolution: Terminate active assignments and release all {assignedAssets.length} asset(s) back to <em>In Stock</em> inventory upon deletion.
                  </span>
                </label>
              </div>
            ) : (
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                This employee has no active equipment assignments and can be safely deleted.
              </p>
            )}
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onConfirm(employee.id)}
            disabled={hasAssignedAssets && !resolutionConfirmed}
            style={{
              opacity: hasAssignedAssets && !resolutionConfirmed ? 0.5 : 1,
              cursor: hasAssignedAssets && !resolutionConfirmed ? 'not-allowed' : 'pointer',
            }}
          >
            {hasAssignedAssets ? 'Release Assets & Delete' : 'Delete Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
