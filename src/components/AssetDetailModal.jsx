import AssetStatusBadge from './AssetStatusBadge';
import AssetCategoryIcon from './AssetCategoryIcon';

/**
 * Generates realistic mock activity timeline events for an asset.
 * Includes examples: Asset registered, Asset assigned, Asset moved, Asset returned, Asset sent to repair.
 */
function getAssetTimeline(asset) {
  const purchaseDate = asset.purchaseDate || '2024-01-15';
  const location = asset.location || 'HQ - IT Central Storage';
  const assigneeName = asset.assignedTo?.name || 'Staff Member';
  const assigneeDept = asset.assignedTo?.department || 'Operations';

  const timeline = [
    {
      id: 'evt-1',
      eventName: 'Asset registered',
      nodeColor: 'purple',
      time: purchaseDate,
      description: `Hardware unit cataloged into inventory system with serial ${asset.serialNumber}.`,
    },
  ];

  if (asset.status === 'In Stock') {
    timeline.unshift({
      id: 'evt-2',
      eventName: 'Asset moved',
      nodeColor: 'green',
      time: '12 days ago',
      description: `Checked into inventory storage at ${location}. Ready for deployment.`,
    });
  } else if (asset.status === 'Assigned' || asset.status === 'In Use') {
    timeline.unshift(
      {
        id: 'evt-2',
        eventName: 'Asset assigned',
        nodeColor: 'blue',
        time: '3 weeks ago',
        description: `Assigned to ${assigneeName} (${assigneeDept}) for primary operational use.`,
      },
      {
        id: 'evt-3',
        eventName: 'Asset moved',
        nodeColor: 'green',
        time: '3 weeks ago',
        description: `Delivered and stationed at ${location}.`,
      }
    );
  } else if (asset.status === 'In Repair') {
    timeline.unshift(
      {
        id: 'evt-2',
        eventName: 'Asset assigned',
        nodeColor: 'blue',
        time: '2 months ago',
        description: `Previously assigned to operational pool.`,
      },
      {
        id: 'evt-3',
        eventName: 'Asset sent to repair',
        nodeColor: 'amber',
        time: '4 days ago',
        description: `Transferred to ${location} for hardware diagnostic and maintenance inspection.`,
      }
    );
  } else if (asset.status === 'Returned') {
    timeline.unshift(
      {
        id: 'evt-2',
        eventName: 'Asset assigned',
        nodeColor: 'blue',
        time: '3 months ago',
        description: `Assigned for department project usage.`,
      },
      {
        id: 'evt-3',
        eventName: 'Asset returned',
        nodeColor: 'gray',
        time: '1 week ago',
        description: `Returned from field deployment back to IT pool at ${location}.`,
      }
    );
  } else if (asset.status === 'Disposed') {
    timeline.unshift(
      {
        id: 'evt-2',
        eventName: 'Asset returned',
        nodeColor: 'gray',
        time: '6 months ago',
        description: `Retired from active circulation after reaching end-of-lifecycle.`,
      },
      {
        id: 'evt-3',
        eventName: 'Asset moved',
        nodeColor: 'red',
        time: '2 weeks ago',
        description: `Transferred to ${location} for environmentally certified e-waste disposal.`,
      }
    );
  }

  return timeline;
}

/**
 * Reusable AssetDetailModal Component
 * 
 * Required Sections:
 * 1. IDENTITY: Asset Code, Asset Name, Category, Brand, Model, Serial Number
 * 2. PURCHASE: Purchase Date, Purchase Price, Warranty End
 * 3. LOCATION: Current Location
 * 4. STATUS: Current Asset Status, Assigned Employee
 * 5. ACTIVITY: Mock activity timeline (registered, assigned, moved, returned, sent to repair)
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

  const timeline = getAssetTimeline(asset);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 880 }}>
        {/* Modal Header */}
        <div className="detail-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
                flexShrink: 0,
              }}
            >
              <AssetCategoryIcon category={asset.category} size={20} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                {asset.assetName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                <span className="asset-code-badge">{asset.assetCode}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Internal ID: {asset.id}
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

        {/* Modal Body: Split into Specifications (Left) & Activity Timeline (Right) */}
        <div className="detail-modal-body" style={{ padding: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              minHeight: '440px',
            }}
            className="detail-body-split"
          >
            {/* Left Column: IDENTITY, STATUS, LOCATION, PURCHASE */}
            <div
              style={{
                padding: 'var(--space-6)',
                borderRight: '1px solid var(--color-border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              {/* SECTION 1: IDENTITY */}
              <div>
                <div className="detail-section-title">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 00-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Identity
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item-label">Asset Code</span>
                    <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {asset.assetCode}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Asset Name</span>
                    <span className="detail-item-value">{asset.assetName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Category</span>
                    <span className="detail-item-value">{asset.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Brand</span>
                    <span className="detail-item-value">{asset.brand}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Model / Part No.</span>
                    <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {asset.model || '—'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Serial Number</span>
                    <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {asset.serialNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: 0 }} />

              {/* SECTION 2: STATUS */}
              <div>
                <div className="detail-section-title">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Status &amp; Assignment
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item-label">Current Asset Status</span>
                    <div style={{ marginTop: 2 }}>
                      <AssetStatusBadge status={asset.status} />
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Assigned Employee</span>
                    <span className="detail-item-value">
                      {asset.assignedTo ? asset.assignedTo.name : 'Unassigned / In Stock'}
                    </span>
                    {asset.assignedTo?.department && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {asset.assignedTo.department} · {asset.assignedTo.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: 0 }} />

              {/* SECTION 3: LOCATION */}
              <div>
                <div className="detail-section-title">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Current Location</span>
                  <span className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {asset.location}
                  </span>
                </div>
              </div>

              <div className="divider" style={{ margin: 0 }} />

              {/* SECTION 4: PURCHASE */}
              <div>
                <div className="detail-section-title">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Purchase &amp; Financials
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item-label">Purchase Date</span>
                    <span className="detail-item-value">{asset.purchaseDate || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Purchase Price</span>
                    <span className="detail-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(asset.purchasePrice)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Warranty End</span>
                    <span className="detail-item-value">{asset.warrantyEnd || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: SECTION 5: ACTIVITY TIMELINE */}
            <div
              style={{
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-surface-alt)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="detail-section-title" style={{ marginBottom: 'var(--space-4)' }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Activity Timeline
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="timeline">
                  {timeline.map((evt) => (
                    <div key={evt.id} className="timeline-item">
                      <div className={`timeline-node ${evt.nodeColor}`} />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-event-name">{evt.eventName}</span>
                          <span className="timeline-time">{evt.time}</span>
                        </div>
                        <p className="timeline-desc">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Automated audit trail generated from IT operations.</span>
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
