/**
 * Reusable Delete Confirmation Dialog
 * Shows asset details and asks for explicit confirmation before deletion.
 */
export default function DeleteConfirmModal({ asset, onConfirm, onCancel }) {
  if (!asset) return null;

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
            <h3 className="confirm-title">Delete IT Asset?</h3>
            <p className="confirm-desc">
              Are you sure you want to delete <strong>{asset.assetName}</strong> ({asset.assetCode})? This action will remove the asset record from the active catalog.
            </p>
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onConfirm(asset.id)}>
            Delete Asset
          </button>
        </div>
      </div>
    </div>
  );
}
