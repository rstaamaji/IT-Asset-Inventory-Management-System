import { useState, useMemo } from 'react';
import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Enforces valid lifecycle transitions according to enterprise asset management rules:
 * - New available asset -> In Stock
 * - Assigning an asset -> Assigned
 * - Active use -> In Use
 * - Returning an asset -> Returned and then available In Stock when appropriate
 * - Repair -> In Repair
 * - Repaired asset -> In Stock only if it has no active assignment
 * - Disposal -> Disposed only when no active assignment exists
 * - Disposed is terminal (no transitions allowed)
 */
function getValidTransitions(currentStatus, hasActiveAssignment = false) {
  switch (currentStatus) {
    case 'In Stock':
      return [
        {
          status: 'Assigned',
          label: 'Assigned',
          desc: 'Allocate equipment to an employee custodian.',
          consequential: false,
        },
        {
          status: 'In Repair',
          label: 'In Repair',
          desc: 'Send hardware to maintenance or service depot for repair.',
          consequential: false,
        },
        {
          status: 'Disposed',
          label: 'Disposed',
          desc: 'Permanently decommission asset for e-waste or retirement.',
          consequential: true,
          danger: true,
        },
      ];

    case 'Assigned':
      return [
        {
          status: 'In Use',
          label: 'In Use',
          desc: 'Employee has received equipment and commenced active operations.',
          consequential: false,
        },
        {
          status: 'Returned',
          label: 'Returned',
          desc: 'Check-in equipment from employee and conclude active custody.',
          consequential: true,
        },
        {
          status: 'In Repair',
          label: 'In Repair',
          desc: 'Hardware encountered issues; flag for service depot inspection.',
          consequential: false,
        },
      ];

    case 'In Use':
      return [
        {
          status: 'Assigned',
          label: 'Assigned (Standby)',
          desc: 'Place active deployment on temporary operational standby.',
          consequential: false,
        },
        {
          status: 'Returned',
          label: 'Returned',
          desc: 'Check-in equipment from employee and conclude active custody.',
          consequential: true,
        },
        {
          status: 'In Repair',
          label: 'In Repair',
          desc: 'Hardware failure or defect reported; send for diagnosis/repair.',
          consequential: false,
        },
      ];

    case 'Returned':
      return [
        {
          status: 'In Stock',
          label: 'In Stock',
          desc: 'Post-return inspection passed; certify ready for inventory stock.',
          consequential: false,
        },
        {
          status: 'In Repair',
          label: 'In Repair',
          desc: 'Post-return inspection revealed faults requiring servicing.',
          consequential: false,
        },
        {
          status: 'Disposed',
          label: 'Disposed',
          desc: 'Unit reached end-of-life or damaged beyond economic repair.',
          consequential: true,
          danger: true,
        },
        {
          status: 'Assigned',
          label: 'Assigned',
          desc: 'Immediately re-assign equipment to another custodian.',
          consequential: false,
        },
      ];

    case 'In Repair': {
      const options = [];
      if (!hasActiveAssignment) {
        options.push({
          status: 'In Stock',
          label: 'In Stock',
          desc: 'Repair successfully completed; returned to available stock pool.',
          consequential: false,
        });
        options.push({
          status: 'Disposed',
          label: 'Disposed',
          desc: 'Hardware unrepairable or uneconomic to fix; salvage or e-waste.',
          consequential: true,
          danger: true,
        });
      } else {
        options.push({
          status: 'In Use',
          label: 'In Use',
          desc: 'Repair completed; returned to assigned employee for active use.',
          consequential: false,
        });
        options.push({
          status: 'Returned',
          label: 'Returned',
          desc: 'Check-in unit from employee custody while in maintenance.',
          consequential: true,
        });
      }
      return options;
    }

    case 'Disposed':
    default:
      return [];
  }
}

export default function AssetStatusTransitionModal({
  isOpen,
  asset,
  hasActiveAssignment = false,
  onTransition,
  onClose,
}) {
  const currentStatus = asset?.status || '';
  const allowedNextStatuses = useMemo(
    () => getValidTransitions(currentStatus, hasActiveAssignment),
    [currentStatus, hasActiveAssignment]
  );
  const isTerminal = currentStatus === 'Disposed';

  const [selectedStatus, setSelectedStatus] = useState(allowedNextStatuses[0]?.status || '');
  const [reason, setReason] = useState('');
  const [disposalConfirmed, setDisposalConfirmed] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !asset) return null;

  const activeOption = allowedNextStatuses.find((opt) => opt.status === selectedStatus);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError('Please select a target lifecycle status.');
      return;
    }

    // Require confirmation and mandatory reason for Disposed
    if (selectedStatus === 'Disposed') {
      if (!disposalConfirmed) {
        setError('Please check the confirmation box to authorize permanent disposal.');
        return;
      }
      if (!reason.trim()) {
        setError('Disposal justification reason is required for compliance audit trails.');
        return;
      }
    }

    onTransition(asset.id, selectedStatus, reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
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
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                Asset Lifecycle Transition
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Advance hardware through standardized enterprise lifecycle states
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
            {/* Current Asset Info */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AssetCategoryIcon category={asset.category} size={16} />
                <div>
                  <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {asset.assetName}
                  </span>
                  <span className="asset-code-badge" style={{ marginLeft: 'var(--space-2)' }}>
                    {asset.assetCode}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Current:</span>
                <AssetStatusBadge status={currentStatus} />
              </div>
            </div>

            {/* Active Assignment Warning Notice if applicable */}
            {hasActiveAssignment && currentStatus !== 'In Repair' && (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-status-info-bg)',
                  border: '1px solid #bae6fd',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-status-info)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  Asset has an active assignment to <strong>{asset.assignedTo?.name || 'an employee'}</strong>. Direct transitions to In Stock or Disposed are restricted until returned.
                </span>
              </div>
            )}

            {isTerminal ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-status-danger-bg)',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-status-danger)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                This asset is in the terminal <strong>Disposed</strong> state. It has been permanently decommissioned and cannot transition back to active lifecycle states.
              </div>
            ) : allowedNextStatuses.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                No valid lifecycle transitions available for status {currentStatus}.
              </div>
            ) : (
              <>
                {/* Target Status Choice */}
                <div className="form-group">
                  <label className="form-label">
                    Allowed Target Lifecycle Status <span className="form-required">*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {allowedNextStatuses.map((opt) => {
                      const isSelected = selectedStatus === opt.status;
                      return (
                        <label
                          key={opt.status}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${
                              isSelected
                                ? opt.danger
                                  ? 'var(--color-status-danger)'
                                  : 'var(--color-accent)'
                                : 'var(--color-border)'
                            }`,
                            backgroundColor: isSelected
                              ? opt.danger
                                ? 'var(--color-status-danger-bg)'
                                : 'var(--color-accent-light)'
                              : 'var(--color-surface)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <input
                            type="radio"
                            name="targetStatus"
                            value={opt.status}
                            checked={isSelected}
                            onChange={(e) => {
                              setSelectedStatus(e.target.value);
                              setError('');
                            }}
                            style={{ marginTop: 3 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                                {opt.label}
                              </span>
                              <AssetStatusBadge status={opt.status} />
                              {opt.consequential && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 'var(--font-bold)',
                                    textTransform: 'uppercase',
                                    color: opt.danger ? 'var(--color-status-danger)' : 'var(--color-text-muted)',
                                    letterSpacing: '0.04em',
                                  }}
                                >
                                  {opt.danger ? '• Terminal' : '• Action'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                              {opt.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Consequential Transition Warning & Confirmation Checkbox */}
                {activeOption?.danger && (
                  <div
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      backgroundColor: 'var(--color-status-danger-bg)',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-status-danger)',
                      fontSize: 'var(--text-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span>⚠️ Consequential Action: Irreversible Decommissioning</span>
                    </div>
                    <div>
                      Disposal is a terminal state. Once confirmed, this hardware cannot be returned to active inventory, reassigned, or edited.
                    </div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        cursor: 'pointer',
                        marginTop: 'var(--space-1)',
                        fontWeight: 'var(--font-medium)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={disposalConfirmed}
                        onChange={(e) => {
                          setDisposalConfirmed(e.target.checked);
                          if (error) setError('');
                        }}
                      />
                      <span>I confirm this asset is decommissioned and authorize permanent disposal.</span>
                    </label>
                  </div>
                )}

                {/* Reason / Notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="transReason">
                    Transition Reason &amp; Audit Notes {selectedStatus === 'Disposed' && <span className="form-required">*</span>}
                  </label>
                  <textarea
                    id="transReason"
                    placeholder={
                      selectedStatus === 'Disposed'
                        ? 'e.g. Obsolete hardware beyond repair; battery swelling; recycled per e-waste protocol...'
                        : selectedStatus === 'Returned'
                        ? 'e.g. Employee completed project; unit cleaned and turned into IT pool...'
                        : 'e.g. Routine maintenance scheduled; diagnostic inspection passed...'
                    }
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (error) setError('');
                    }}
                    rows={2}
                    className={`form-input form-textarea ${error && !reason.trim() && selectedStatus === 'Disposed' ? 'has-error' : ''}`}
                  />
                  <span className="form-helper">
                    Recorded in persistent status history for compliance, warranty, and lifecycle auditing.
                  </span>
                </div>

                {error && <div className="form-error" style={{ marginTop: 'var(--space-1)' }}>{error}</div>}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            {!isTerminal && allowedNextStatuses.length > 0 && (
              <button
                type="submit"
                className={`btn btn-sm ${activeOption?.danger ? 'btn-danger' : 'btn-primary'}`}
                style={activeOption?.danger ? { backgroundColor: 'var(--color-status-danger)', borderColor: 'var(--color-status-danger)', color: '#fff' } : {}}
              >
                {selectedStatus === 'Disposed' ? 'Confirm Disposal' : 'Apply Transition'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
