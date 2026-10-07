import { useState } from 'react';
import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Valid lifecycle transitions mapping
 */
const VALID_TRANSITIONS = {
  'In Stock': [
    { status: 'Assigned', label: 'Assigned', desc: 'Reserve or assign asset to an employee custodian' },
    { status: 'In Repair', label: 'In Repair', desc: 'Send unit to maintenance or service depot for repair' },
    { status: 'Disposed', label: 'Disposed', desc: 'Permanently decommission asset for e-waste or retirement' },
  ],
  'Assigned': [
    { status: 'In Use', label: 'In Use', desc: 'Employee has received and commenced active usage' },
    { status: 'Returned', label: 'Returned', desc: 'Asset turned in by employee to IT collection pool' },
    { status: 'In Stock', label: 'In Stock', desc: 'Cancel assignment and return directly to available inventory' },
    { status: 'In Repair', label: 'In Repair', desc: 'Damaged or defective unit flagged for service repair' },
    { status: 'Disposed', label: 'Disposed', desc: 'Decommission or write-off lost/broken equipment' },
  ],
  'In Use': [
    { status: 'Returned', label: 'Returned', desc: 'Employee finished usage and returned unit to IT pool' },
    { status: 'In Repair', label: 'In Repair', desc: 'Unit encountered fault and requires diagnostic repair' },
    { status: 'Disposed', label: 'Disposed', desc: 'Decommission broken or end-of-life equipment' },
  ],
  'In Repair': [
    { status: 'In Stock', label: 'In Stock', desc: 'Repair successfully completed; returned to inventory' },
    { status: 'Disposed', label: 'Disposed', desc: 'Unit irreparable or uneconomical to repair; salvage/e-waste' },
  ],
  'Returned': [
    { status: 'In Stock', label: 'In Stock', desc: 'Inspected and certified ready for re-assignment' },
    { status: 'In Repair', label: 'In Repair', desc: 'Post-return inspection revealed faults requiring repair' },
    { status: 'Disposed', label: 'Disposed', desc: 'End-of-life unit decommissioned after return' },
  ],
  'Disposed': [], // Terminal state
};

export default function AssetStatusTransitionModal({ isOpen, asset, onTransition, onClose }) {
  const currentStatus = asset?.status || '';
  const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const isTerminal = currentStatus === 'Disposed';

  const [selectedStatus, setSelectedStatus] = useState(allowedNextStatuses[0]?.status || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !asset) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError('Please select a target status');
      return;
    }

    onTransition(asset.id, selectedStatus, reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
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
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                Asset Lifecycle Transition
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Advance asset through standardized IT lifecycle stages
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
                This asset is in the terminal <strong>Disposed</strong> state. It has been permanently decommissioned and cannot transition to active states.
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
                    {allowedNextStatuses.map((opt) => (
                      <label
                        key={opt.status}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${selectedStatus === opt.status ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          backgroundColor: selectedStatus === opt.status ? 'var(--color-accent-light)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <input
                          type="radio"
                          name="targetStatus"
                          value={opt.status}
                          checked={selectedStatus === opt.status}
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
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {opt.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {error && <span className="form-error">{error}</span>}
                </div>

                {/* Reason / Notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="transReason">
                    Transition Justification / Notes
                  </label>
                  <textarea
                    id="transReason"
                    placeholder="e.g. Returned from employee upon departure; inspected and cleaned for stock deployment..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="form-input form-textarea"
                  />
                  <span className="form-helper">
                    Documenting status changes ensures accurate audit logs and warranty tracking.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            {!isTerminal && allowedNextStatuses.length > 0 && (
              <button type="submit" className="btn btn-primary btn-sm">
                Apply Transition
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
