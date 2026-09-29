import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssetTable Component
 * 
 * Columns:
 * 1. Asset ID
 * 2. Asset Name
 * 3. Category
 * 4. Brand
 * 5. Location
 * 6. Status
 * 7. Assigned To
 * 8. Actions (View, Edit, Delete)
 */
export default function AssetTable({ assets, onViewAsset, onEditAsset, onDeleteAsset }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <div className="empty-state-title">No assets found</div>
        <div className="empty-state-desc">
          No hardware items matched your current search filters or category criteria.
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '130px' }}>Asset ID</th>
            <th>Asset Name</th>
            <th style={{ width: '110px' }}>Category</th>
            <th style={{ width: '110px' }}>Brand</th>
            <th>Location</th>
            <th style={{ width: '120px' }}>Status</th>
            <th>Assigned To</th>
            <th style={{ width: '170px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              {/* 1. Asset ID */}
              <td className="col-nowrap">
                <span className="asset-code-badge">{asset.assetCode}</span>
              </td>

              {/* 2. Asset Name */}
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
                    <AssetCategoryIcon category={asset.category} size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '240px',
                      }}
                    >
                      {asset.assetName}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      SN: {asset.serialNumber}
                    </div>
                  </div>
                </div>
              </td>

              {/* 3. Category */}
              <td className="col-nowrap">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border-light)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {asset.category}
                </span>
              </td>

              {/* 4. Brand */}
              <td className="col-nowrap">
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  {asset.brand}
                </span>
              </td>

              {/* 5. Location */}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 13, height: 13, color: 'var(--color-text-muted)', flexShrink: 0 }}
                  >
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {asset.location}
                  </span>
                </div>
              </td>

              {/* 6. Status */}
              <td className="col-nowrap">
                <AssetStatusBadge status={asset.status} />
              </td>

              {/* 7. Assigned To */}
              <td>
                {asset.assignedTo ? (
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                      {asset.assignedTo.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {asset.assignedTo.department}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Unassigned
                  </span>
                )}
              </td>

              {/* 8. Actions (View, Edit, Delete) */}
              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onViewAsset && onViewAsset(asset)}
                    title={`View details for ${asset.assetCode}`}
                    aria-label={`View ${asset.assetCode}`}
                    style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditAsset && onEditAsset(asset)}
                    title={`Edit ${asset.assetCode}`}
                    aria-label={`Edit ${asset.assetCode}`}
                    style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDeleteAsset && onDeleteAsset(asset)}
                    title={`Delete ${asset.assetCode}`}
                    aria-label={`Delete ${asset.assetCode}`}
                    style={{ padding: '2px 8px', fontSize: 'var(--text-xs)', color: 'var(--color-status-danger)' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
