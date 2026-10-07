/**
 * Reusable EmployeeTable Component
 * Displays personnel directory, status badges, department tags, and assigned asset counts.
 */
export default function EmployeeTable({
  employees,
  getAssignedAssetCount,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) {
  if (!employees || employees.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div className="empty-state-title">No employees found</div>
        <div className="empty-state-desc">
          No personnel records matched your current search parameters or department filters.
        </div>
      </div>
    );
  }

  // Get initials for avatar badge
  const getInitials = (name) => {
    if (!name) return 'EM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '220px' }}>Employee</th>
            <th style={{ width: '130px' }}>Department</th>
            <th>Role / Position</th>
            <th>Contact &amp; Location</th>
            <th style={{ width: '110px' }}>Status</th>
            <th style={{ width: '130px', textAlign: 'center' }}>Assigned Assets</th>
            <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const assetCount = getAssignedAssetCount ? getAssignedAssetCount(emp.id) : 0;
            const initials = getInitials(emp.name);

            return (
              <tr key={emp.id}>
                {/* Employee: Avatar + Name + Code */}
                <td className="col-nowrap">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: emp.status === 'Active' ? 'var(--color-accent-light)' : 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: emp.status === 'Active' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-bold)',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                        {emp.name}
                      </div>
                      <span className="asset-code-badge" style={{ fontSize: '11px', padding: '1px 5px' }}>
                        {emp.employeeCode}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Department */}
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
                    {emp.department}
                  </span>
                </td>

                {/* Position */}
                <td className="col-nowrap">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-medium)' }}>
                    {emp.position || 'Staff'}
                  </span>
                </td>

                {/* Contact & Location */}
                <td>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {emp.email}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {emp.location} {emp.phone && emp.phone !== '—' && `· ${emp.phone}`}
                  </div>
                </td>

                {/* Status */}
                <td className="col-nowrap">
                  <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-neutral'}`}>
                    <span className={`badge-dot ${emp.status === 'Active' ? 'green' : 'gray'}`} />
                    {emp.status}
                  </span>
                </td>

                {/* Assigned Assets */}
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onViewEmployee && onViewEmployee(emp)}
                    className={`badge ${assetCount > 0 ? 'badge-blue' : 'badge-neutral'}`}
                    style={{ cursor: 'pointer', border: 'none', padding: '3px 10px', fontSize: 'var(--text-xs)' }}
                    title="Click to view assigned assets"
                  >
                    {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
                  </button>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onViewEmployee && onViewEmployee(emp)}
                      title={`View profile for ${emp.name}`}
                      aria-label={`View ${emp.name}`}
                      style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditEmployee && onEditEmployee(emp)}
                      title={`Edit ${emp.name}`}
                      aria-label={`Edit ${emp.name}`}
                      style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDeleteEmployee && onDeleteEmployee(emp)}
                      title={`Delete ${emp.name}`}
                      aria-label={`Delete ${emp.name}`}
                      style={{ padding: '2px 8px', fontSize: 'var(--text-xs)', color: 'var(--color-status-danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
