import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import AssignmentTable from '../components/AssignmentTable';
import AssignmentModal from '../components/AssignmentModal';
import ReturnAssetModal from '../components/ReturnAssetModal';
import AssetDetailModal from '../components/AssetDetailModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';

export default function Assignments() {
  const {
    assignments,
    assets,
    employees,
    assignAsset,
    returnAsset,
    getEmployeeAssignedAssets,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [returnContext, setReturnContext] = useState(null); // { assignment, asset, employee }
  const [viewingAsset, setViewingAsset] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Notification feedback
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const showNotification = (msg) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4000);
  };

  // Status counts for quick tabs
  const statusCounts = useMemo(() => {
    return {
      ALL: assignments.length,
      Active: assignments.filter((a) => a.status === 'Active').length,
      Returned: assignments.filter((a) => a.status === 'Returned').length,
    };
  }, [assignments]);

  // Available assets count (for KPI)
  const availableAssetCount = useMemo(() => {
    return assets.filter((a) => a.status === 'In Stock' || a.status === 'Returned').length;
  }, [assets]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      // 1. Status filter
      if (selectedStatus !== 'ALL' && asg.status !== selectedStatus) {
        return false;
      }

      // 2. Search query matching asset code/name or employee name/code
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const asset = assets.find((a) => a.id === asg.assetId);
        const employee = employees.find((e) => e.id === asg.employeeId);

        const assetCodeMatch = asset?.assetCode.toLowerCase().includes(query) || false;
        const assetNameMatch = asset?.assetName.toLowerCase().includes(query) || false;
        const empNameMatch = employee?.name.toLowerCase().includes(query) || false;
        const empCodeMatch = employee?.employeeCode.toLowerCase().includes(query) || false;
        const notesMatch = (asg.notes || '').toLowerCase().includes(query);

        return assetCodeMatch || assetNameMatch || empNameMatch || empCodeMatch || notesMatch;
      }

      return true;
    });
  }, [assignments, assets, employees, selectedStatus, searchQuery]);

  // ---- Workflow Handlers ----
  const handleAssignSubmit = (assignmentData) => {
    const result = assignAsset(assignmentData);
    if (result.success) {
      const asset = assets.find((a) => a.id === assignmentData.assetId);
      const employee = employees.find((e) => e.id === assignmentData.employeeId);
      showNotification(`Asset ${asset?.assetCode || ''} successfully assigned to ${employee?.name || ''}.`);
      setIsAssignOpen(false);
    } else {
      alert(result.error || 'Failed to complete assignment.');
    }
  };

  const handleReturnPrompt = (assignment, asset, employee) => {
    setReturnContext({ assignment, asset, employee });
  };

  const handleReturnSubmit = ({ assignmentId, returnedDate, returnNotes }) => {
    const result = returnAsset({ assignmentId, returnedDate, returnNotes });
    if (result.success) {
      showNotification('Equipment return completed. Asset transitioned back to In Stock.');
      setReturnContext(null);
    } else {
      alert(result.error || 'Failed to complete return.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Asset Assignments</h1>
          <p className="page-subtitle">Track equipment custody workflows, manage checkouts, and process hardware returns</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAssignOpen(true)}
            aria-label="Assign an asset"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Assign Asset
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackNotice && (
        <div
          className="placeholder-notice"
          style={{
            backgroundColor: 'var(--color-status-success-bg)',
            borderColor: '#bbf7d0',
            color: 'var(--color-status-success)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {feedbackNotice}
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="section-grid section-grid-4" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Assignments</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{assignments.length}</div>
          <div className="stat-card-meta">Lifetime assignment logs recorded</div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Checkouts</span>
            <div className="stat-card-icon green">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{statusCounts.Active}</div>
          <div className="stat-card-meta">Currently deployed to employees</div>
        </div>

        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Returned Check-ins</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{statusCounts.Returned}</div>
          <div className="stat-card-meta">Completed and returned assignments</div>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Available for Assignment</span>
            <div className="stat-card-icon amber">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{availableAssetCount}</div>
          <div className="stat-card-meta">In Stock units ready to deploy</div>
        </div>
      </div>

      {/* Main Assignments Card */}
      <div className="card">
        {/* Quick Filter Tabs */}
        <div className="quick-filter-tabs">
          <button
            type="button"
            className={`quick-tab-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            All Assignments
            <span className="quick-tab-count">{statusCounts.ALL}</span>
          </button>
          <button
            type="button"
            className={`quick-tab-btn ${selectedStatus === 'Active' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('Active')}
          >
            Active Checkouts
            <span className="quick-tab-count">{statusCounts.Active}</span>
          </button>
          <button
            type="button"
            className={`quick-tab-btn ${selectedStatus === 'Returned' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('Returned')}
          >
            Returned Check-ins
            <span className="quick-tab-count">{statusCounts.Returned}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="asset-filter-bar">
          <div className="asset-filter-group">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search asset, employee, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search assignments"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer' }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {searchQuery && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSearchQuery('')}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}
              >
                Clear Search
              </button>
            )}
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredAssignments.length}</strong> of {assignments.length} assignments
          </div>
        </div>

        {/* Assignments Table */}
        <AssignmentTable
          assignments={filteredAssignments}
          assets={assets}
          employees={employees}
          onReturnPrompt={handleReturnPrompt}
          onViewAsset={(asset) => setViewingAsset(asset)}
          onViewEmployee={(emp) => setViewingEmployee(emp)}
        />

        {/* Card Footer / Record summary */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing {filteredAssignments.length > 0 ? 1 : 0} to {filteredAssignments.length} of {filteredAssignments.length} records
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Previous
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignOpen}
        assets={assets}
        employees={employees}
        onAssign={handleAssignSubmit}
        onClose={() => setIsAssignOpen(false)}
      />

      {/* RETURN Equipment Modal */}
      {returnContext && (
        <ReturnAssetModal
          isOpen={Boolean(returnContext)}
          assignment={returnContext.assignment}
          asset={returnContext.asset}
          employee={returnContext.employee}
          onConfirmReturn={handleReturnSubmit}
          onClose={() => setReturnContext(null)}
        />
      )}

      {/* Inspect Asset Detail Modal */}
      {viewingAsset && (
        <AssetDetailModal
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
        />
      )}

      {/* Inspect Employee Detail Modal */}
      {viewingEmployee && (
        <EmployeeDetailModal
          employee={viewingEmployee}
          assignedAssets={getEmployeeAssignedAssets(viewingEmployee.id)}
          onClose={() => setViewingEmployee(null)}
        />
      )}
    </div>
  );
}
