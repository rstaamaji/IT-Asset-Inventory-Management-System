/**
 * Reusable CategoryDeleteModal Component
 * Confirms deletion of an asset category and warns if assets are currently allocated to it.
 */
export default function CategoryDeleteModal({ category, assetCount = 0, onConfirm, onCancel }) {
  if (!category) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-body">
          <div className="confirm-icon-box">
            <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="confirm-content">
            <h3 className="confirm-title">Delete Category?</h3>
            <p className="confirm-desc">
              Are you sure you want to delete the <strong>{category.name}</strong> category?
            </p>

            {assetCount > 0 ? (
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-status-warning-bg)',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-status-warning)',
                  lineHeight: var_leading_normal(),
                }}
              >
                <strong>Warning:</strong> There are currently <strong>{assetCount}</strong> asset(s) linked to this category in the inventory.
              </div>
            ) : (
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                This category has 0 linked assets and can be safely removed.
              </p>
            )}
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onConfirm(category.id)}>
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
}

function var_leading_normal() {
  return '1.5';
}
