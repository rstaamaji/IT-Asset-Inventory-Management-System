import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssetDetailModal Component
 * Shows complete hardware asset metadata in a clean modal drawer dialog.
 */
export default function AssetDetailModal({ asset, onClose }) {
  if (!asset) return null;

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
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
              <AssetCategoryIcon category={asset.category} size={18} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                {asset.assetName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                <span className="asset-code-badge">{asset.assetCode}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  ID: {asset.id}
                </span>
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
          {/* Status & Allocation Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Current Status:
              </span>
              <AssetStatusBadge status={asset.status} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Category: <strong>{asset.category}</strong>
            </div>
          </div>

          {/* Hardware Specifications */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-3)' }}>
              Hardware Specifications
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Brand</span>
                <span className="detail-item-value">{asset.brand}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Model / Part No.</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>{asset.model}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Serial Number</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>{asset.serialNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Current Location</span>
                <span className="detail-item-value">{asset.location}</span>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* Allocation & Ownership */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-3)' }}>
              Assignment &amp; Custody
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Assigned Custodian</span>
                <span className="detail-item-value">
                  {asset.assignedTo ? asset.assignedTo.name : 'Unassigned / In Inventory'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Department</span>
                <span className="detail-item-value">
                  {asset.assignedTo ? asset.assignedTo.department : '—'}
                </span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-item-label">Contact Email</span>
                <span className="detail-item-value">
                  {asset.assignedTo ? asset.assignedTo.email : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* Financial & Warranty Details */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-3)' }}>
              Procurement &amp; Warranty
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Purchase Date</span>
                <span className="detail-item-value">{asset.purchaseDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Purchase Price</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(asset.purchasePrice)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Warranty Expiration</span>
                <span className="detail-item-value">{asset.warrantyEnd}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
