import { useState } from 'react';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable ReturnAssetModal Component
 * Facilitates returning an assigned IT asset back to the central inventory ("In Stock").
 */
export default function ReturnAssetModal({ isOpen, assignment, asset, employee, onConfirmReturn, onClose }) {
  const [returnedDate, setReturnedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [returnNotes, setReturnNotes] = useState('');

  if (!isOpen || !assignment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmReturn({
      assignmentId: assignment.id,
      returnedDate,
      returnNotes,
    });
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
                backgroundColor: 'var(--color-status-success-bg)',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-status-success)',
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                Return Equipment to Stock
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Check-in hardware and release custodian assignment
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
            {/* Asset and Custodian Summary Box */}
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <AssetCategoryIcon category={asset?.category} size={16} />
                  <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {asset?.assetName || 'Hardware Asset'}
                  </span>
                </div>
                <span className="asset-code-badge">{asset?.assetCode}</span>
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Returning from custodian: <strong>{employee?.name || 'Assigned Custodian'}</strong> ({employee?.department})
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Assigned on: {assignment.assignedDate} {assignment.expectedReturnDate && `· Expected: ${assignment.expectedReturnDate}`}
              </div>
            </div>

            {/* Return Date input */}
            <div className="form-group">
              <label className="form-label" htmlFor="returnDate">
                Actual Return Date <span className="form-required">*</span>
              </label>
              <input
                id="returnDate"
                type="date"
                value={returnedDate}
                onChange={(e) => setReturnedDate(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Condition / Return Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="returnNotes">
                Condition Check &amp; Return Notes (Optional)
              </label>
              <textarea
                id="returnNotes"
                placeholder="e.g. Unit returned in clean condition, all cables and charger included..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={2}
                className="form-input form-textarea"
              />
            </div>

            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-status-info-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bae6fd',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-status-info)',
              }}
            >
              Confirming this return will automatically transition the asset status to <strong>In Stock</strong> and remove active custodian allocation.
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Complete Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
