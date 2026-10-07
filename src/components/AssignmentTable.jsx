import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Reusable AssignmentTable Component
 * Shows audit trail and active checkout records with asset details and return action triggers.
 */
export default function AssignmentTable({
  assignments = [],
  assets = [],
  employees = [],
  onReturnPrompt,
  onViewAsset,
  onViewEmployee,
}) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <div className="empty-state-title">No assignment records found</div>
        <div className="empty-state-desc">
          No hardware assignments matched your active search query or status filter.
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '220px' }}>Assigned Asset</th>
            <th style={{ width: '210px' }}>Custodian Employee</th>
            <th style={{ width: '120px' }}>Checkout Date</th>
            <th style={{ width: '130px' }}>Expected Return</th>
            <th style={{ width: '120px' }}>Returned Date</th>
            <th style={{ width: '100px' }}>Status</th>
            <th>Notes</th>
            <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((asg) => {
            const asset = assets.find((a) => a.id === asg.assetId);
            const employee = employees.find((e) => e.id === asg.employeeId);
            const isActive = asg.status === 'Active';

            return (
              <tr key={asg.id}>
                {/* 1. Asset */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
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
                      <AssetCategoryIcon category={asset?.category} size={14} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 'var(--font-medium)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                          cursor: onViewAsset ? 'pointer' : 'default',
                        }}
                        onClick={() => onViewAsset && asset && onViewAsset(asset)}
                        title={asset ? 'Click to inspect asset' : ''}
                      >
                        {asset?.assetName || 'Unknown Asset'}
                      </div>
                      <span className="asset-code-badge" style={{ fontSize: '11px', padding: '1px 5px' }}>
                        {asset?.assetCode || asg.assetId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Employee */}
                <td>
                  <div>
                    <div
                      style={{
                        fontWeight: 'var(--font-semibold)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        cursor: onViewEmployee ? 'pointer' : 'default',
                      }}
                      onClick={() => onViewEmployee && employee && onViewEmployee(employee)}
                      title={employee ? 'Click to inspect employee' : ''}
                    >
                      {employee?.name || 'Unknown Custodian'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {employee?.department} {employee?.employeeCode && `· ${employee.employeeCode}`}
                    </div>
                  </div>
                </td>

                {/* 3. Checkout Date */}
                <td className="col-nowrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {asg.assignedDate}
                </td>

                {/* 4. Expected Return Date */}
                <td className="col-nowrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {asg.expectedReturnDate || '— (Indefinite)'}
                </td>

                {/* 5. Actual Returned Date */}
                <td className="col-nowrap" style={{ fontSize: 'var(--text-xs)' }}>
                  {asg.returnedDate ? (
                    <span style={{ color: 'var(--color-text-secondary)' }}>{asg.returnedDate}</span>
                  ) : (
                    <span style={{ color: 'var(--color-status-success)', fontStyle: 'italic' }}>— Active</span>
                  )}
                </td>

                {/* 6. Status Badge */}
                <td className="col-nowrap">
                  <span className={`badge ${isActive ? 'badge-green' : 'badge-neutral'}`}>
                    <span className={`badge-dot ${isActive ? 'green' : 'gray'}`} />
                    {asg.status}
                  </span>
                </td>

                {/* 7. Notes */}
                <td>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      maxWidth: '240px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={asg.notes || ''}
                  >
                    {asg.notes || '—'}
                  </div>
                </td>

                {/* 8. Actions */}
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {isActive ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onReturnPrompt && onReturnPrompt(asg, asset, employee)}
                      style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                      title="Return equipment back to inventory"
                    >
                      Return Asset
                    </button>
                  ) : (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
