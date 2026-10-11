import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssignmentDetailModal Component
 * Displays complete transaction audit details for an asset assignment,
 * including asset hardware specs, custodian profile, timeline dates, and return action trigger.
 */
export default function AssignmentDetailModal({
  assignment,
  asset,
  employee,
  onInitiateReturn,
  onClose,
}) {
  if (!assignment) return null;

  const isActive = assignment.status === 'Active';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660 }}>
        {/* Header */}
        <div className="detail-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-status-success-bg)' : 'var(--color-surface-alt)',
                border: `1px solid ${isActive ? '#bbf7d0' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'var(--color-status-success)' : 'var(--color-text-secondary)',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                  Assignment Details
                </span>
                <span className="asset-code-badge" style={{ fontSize: '11px' }}>
                  {assignment.id}
                </span>
                <span className={`badge ${isActive ? 'badge-green' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                  <span className={`badge-dot ${isActive ? 'green' : 'gray'}`} />
                  {assignment.status}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Recorded checkout ledger transaction
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

        {/* Modal Body */}
        <div className="detail-modal-body">
          {/* Section 1: Assigned Hardware Asset Card */}
          <div>
            <div className="detail-section-title">Hardware Asset Information</div>
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-secondary)',
                      flexShrink: 0,
                    }}
                  >
                    <AssetCategoryIcon category={asset?.category} size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      {asset?.assetName || 'Hardware Unit'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {asset?.brand} {asset?.model} · Category: {asset?.category || '—'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="asset-code-badge">{asset?.assetCode || assignment.assetId}</span>
                  <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                    Status: {asset?.status || '—'}
                  </span>
                </div>
              </div>

              <div className="detail-grid" style={{ marginTop: 'var(--space-1)' }}>
                <div className="detail-item">
                  <span className="detail-item-label">Serial Number</span>
                  <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {asset?.serialNumber || '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Deployment Location</span>
                  <span className="detail-item-value">{asset?.location || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Custodian Personnel Card */}
          <div>
            <div className="detail-section-title">Custodian Personnel Profile</div>
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-item-label">Employee Name</span>
                  <span className="detail-item-value" style={{ fontWeight: 'var(--font-semibold)' }}>
                    {employee?.name || 'Staff Member'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Employee Code</span>
                  <span className="detail-item-value">
                    <span className="asset-code-badge" style={{ fontSize: '11px', padding: '1px 5px' }}>
                      {employee?.employeeCode || assignment.employeeId}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Department &amp; Role</span>
                  <span className="detail-item-value">
                    {employee?.department || '—'} · {employee?.position || 'Staff'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Corporate Email</span>
                  <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {employee?.email || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Custody Timeline & Schedule */}
          <div>
            <div className="detail-section-title">Assignment Timeline</div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Checkout Date</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--font-semibold)' }}>
                  {assignment.assignedDate || '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Expected Return Date</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {assignment.expectedReturnDate || '— (Indefinite deployment)'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Actual Return Date</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {assignment.returnedDate ? (
                    <span style={{ color: 'var(--color-status-success)' }}>{assignment.returnedDate}</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>Currently in custody (Not returned yet)</span>
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Current Custody Status</span>
                <span className="detail-item-value">
                  <span className={`badge ${isActive ? 'badge-green' : 'badge-neutral'}`}>
                    <span className={`badge-dot ${isActive ? 'green' : 'gray'}`} />
                    {isActive ? 'Active Custody' : 'Completed / Returned'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Audit & Purpose Notes */}
          <div>
            <div className="detail-section-title">Assignment Notes &amp; Audit Trail</div>
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                color: assignment.notes ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              {assignment.notes || 'No operational notes recorded for this assignment transaction.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Record ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{assignment.id}</code>
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            {isActive && onInitiateReturn && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onInitiateReturn(assignment, asset, employee);
                }}
              >
                Return Equipment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
