import AssetCategoryIcon from './AssetCategoryIcon';
import AssetStatusBadge from './AssetStatusBadge';

/**
 * Reusable EmployeeDetailModal Component
 * Shows employee profile and the live list of all hardware assets assigned to this employee.
 */
export default function EmployeeDetailModal({ employee, assignedAssets = [], onClose }) {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="detail-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-full)',
                backgroundColor: employee.status === 'Active' ? 'var(--color-accent-light)' : 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: employee.status === 'Active' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontWeight: 'var(--font-bold)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {employee.name ? employee.name[0].toUpperCase() : 'E'}
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                {employee.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                <span className="asset-code-badge">{employee.employeeCode}</span>
                <span className={`badge ${employee.status === 'Active' ? 'badge-green' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                  {employee.status}
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

        {/* Body */}
        <div className="detail-modal-body">
          {/* Section 1: Employment Details */}
          <div>
            <div className="detail-section-title">Personnel Profile</div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Department</span>
                <span className="detail-item-value">{employee.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Position / Role</span>
                <span className="detail-item-value">{employee.position}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Work Email</span>
                <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {employee.email}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Contact Phone</span>
                <span className="detail-item-value">{employee.phone || '—'}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-item-label">Office Location</span>
                <span className="detail-item-value">{employee.location}</span>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

          {/* Section 2: Assigned IT Assets */}
          <div>
            <div className="detail-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Assigned IT Equipment</span>
              <span className="badge badge-blue">{assignedAssets.length} active</span>
            </div>

            {assignedAssets.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-6)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                No IT assets currently assigned to this employee.
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Category</th>
                      <th>Serial No.</th>
                      <th>Status</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-secondary)',
                                flexShrink: 0,
                              }}
                            >
                              <AssetCategoryIcon category={asset.category} size={13} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                                {asset.assetName}
                              </div>
                              <span className="asset-code-badge" style={{ fontSize: '10px' }}>
                                {asset.assetCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)' }}>{asset.category}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{asset.serialNumber}</td>
                        <td>
                          <AssetStatusBadge status={asset.status} />
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{asset.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
