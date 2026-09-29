import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssetTable Component
 * Renders an enterprise IT asset table with standardized formatting.
 */
export default function AssetTable({ assets, onSelectAsset }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <div className="empty-state-title">No assets found</div>
        <div className="empty-state-desc">
          No IT assets matched your current search filters.
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Asset Code &amp; Title</th>
            <th>Category</th>
            <th>Brand / Model</th>
            <th>Serial No.</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Location</th>
            <th style={{ textAlign: 'right' }}>Cost</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              {/* Asset Code & Title */}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <AssetCategoryIcon category={asset.category} size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                      {asset.assetName}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '2px' }}>
                      <span className="asset-code-badge">{asset.assetCode}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="col-nowrap">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>
                  {asset.category}
                </span>
              </td>

              {/* Brand / Model */}
              <td>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {asset.brand}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {asset.model}
                </div>
              </td>

              {/* Serial Number */}
              <td className="col-mono col-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                {asset.serialNumber}
              </td>

              {/* Status */}
              <td className="col-nowrap">
                <AssetStatusBadge status={asset.status} />
              </td>

              {/* Assigned To */}
              <td>
                {asset.assignedTo ? (
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                      {asset.assignedTo.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {asset.assignedTo.department}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                )}
              </td>

              {/* Location */}
              <td className="col-nowrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {asset.location}
              </td>

              {/* Purchase Cost */}
              <td className="col-mono col-nowrap" style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>
                {formatCurrency(asset.purchasePrice)}
              </td>

              {/* Actions */}
              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onSelectAsset && onSelectAsset(asset)}
                  aria-label={`View details for ${asset.assetCode}`}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
