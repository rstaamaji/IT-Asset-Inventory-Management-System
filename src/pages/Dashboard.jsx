import '../styles/dashboard.css';

/* ============================================================
   1. Summary Statistics (4 core metric cards)
   ============================================================ */
const SUMMARY_STATS = [
  {
    label: 'Total Assets',
    value: '1,280',
    change: '+12 this month',
    accent: 'accent-blue',
    iconColor: 'blue',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Available Assets',
    value: '315',
    change: '24.6% of inventory',
    accent: 'accent-green',
    iconColor: 'green',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Assigned Assets',
    value: '890',
    change: '69.5% allocated',
    accent: 'accent-blue',
    iconColor: 'blue',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    label: 'In Repair',
    value: '42',
    change: '3.3% in service',
    accent: 'accent-amber',
    iconColor: 'amber',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

/* ============================================================
   2. Asset Status Overview (5 key lifecycle statuses)
   ============================================================ */
const STATUS_OVERVIEW = [
  { label: 'In Stock',   count: 315, pct: 24.6, color: '#64748b' },
  { label: 'Assigned',   count: 578, pct: 45.2, color: '#2563eb' },
  { label: 'In Use',     count: 312, pct: 24.4, color: '#16a34a' },
  { label: 'In Repair',  count: 42,  pct: 3.3,  color: '#d97706' },
  { label: 'Disposed',   count: 33,  pct: 2.5,  color: '#dc2626' },
];

/* ============================================================
   3. Recent Activity (Realistic IT operations events)
   ============================================================ */
const RECENT_ACTIVITIES = [
  {
    type: 'assigned',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
      </svg>
    ),
    text: <><strong>ThinkPad T14 Gen 4</strong> assigned to <strong>Michael Scott</strong> (Engineering)</>,
    time: '14 minutes ago',
    actor: 'Admin (System)',
  },
  {
    type: 'returned',
    color: 'green',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
      </svg>
    ),
    text: <><strong>Dell UltraSharp 27&quot; Monitor</strong> returned from <strong>Rachel Green</strong> (Marketing)</>,
    time: '1 hour ago',
    actor: 'IT Helpdesk',
  },
  {
    type: 'repair',
    color: 'amber',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    text: <><strong>HP Color LaserJet Pro M479</strong> moved to repair — fuser unit inspection</>,
    time: '3 hours ago',
    actor: 'Dave Miller (Ops)',
  },
  {
    type: 'added',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
    text: <><strong>5x Apple MacBook Pro 16&quot; (M3 Pro)</strong> added to stock under PO #8921</>,
    time: '5 hours ago',
    actor: 'Admin (System)',
  },
  {
    type: 'disposed',
    color: 'red',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    text: <><strong>Cisco Catalyst 2960 Switch</strong> retired &amp; marked for E-waste disposal</>,
    time: 'Yesterday',
    actor: 'Sarah Connor',
  },
];

/* ============================================================
   4. Asset Categories (Specific 6 requested categories)
   ============================================================ */
const CATEGORIES = [
  {
    name: 'Laptop',
    count: 480,
    pct: 37.5,
    color: '#2563eb',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: 'Desktop',
    count: 220,
    pct: 17.2,
    color: '#3b82f6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    ),
  },
  {
    name: 'Monitor',
    count: 290,
    pct: 22.7,
    color: '#0284c7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="1" />
        <line x1="8" y1="20" x2="16" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    name: 'Printer',
    count: 65,
    pct: 5.1,
    color: '#16a34a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
  {
    name: 'Network',
    count: 85,
    pct: 6.6,
    color: '#d97706',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6" y2="14" />
        <line x1="12" y1="6" x2="12" y2="14" />
        <line x1="18" y1="6" x2="18" y2="14" />
      </svg>
    ),
  },
  {
    name: 'Peripheral',
    count: 140,
    pct: 10.9,
    color: '#64748b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
      </svg>
    ),
  },
];

/* Helper to render SVG Donut segments */
function DonutChart({ segments, totalCount }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29

  // Pre-calculate cumulative offsets purely
  const segmentsWithOffsets = segments.map((seg, idx) => {
    const priorPct = segments.slice(0, idx).reduce((sum, s) => sum + s.pct, 0);
    const strokeDashoffset = -((priorPct / 100) * circumference);
    const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
    return { ...seg, strokeDashoffset, strokeDasharray };
  });

  return (
    <div className="donut-svg-container">
      <svg viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="16"
        />
        {segmentsWithOffsets.map((seg) => (
          <circle
            key={seg.label}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={seg.strokeDasharray}
            strokeDashoffset={seg.strokeDashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="donut-center-label">
        <span className="donut-center-value">{totalCount}</span>
        <span className="donut-center-sub">Total Assets</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">IT Asset &amp; Inventory Management System — Operations Center</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" aria-label="Export asset summary">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Summary
          </button>
          <button className="btn btn-primary btn-sm" aria-label="Add new asset">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Register Asset
          </button>
        </div>
      </div>

      {/* 1. Summary Statistics Cards */}
      <div className="dashboard-stats">
        {SUMMARY_STATS.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.accent}`}>
            <div className="stat-card-header">
              <span className="stat-card-label">{stat.label}</span>
              <div className={`stat-card-icon ${stat.iconColor}`}>{stat.icon}</div>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-meta">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* 2. Asset Status Overview (5 Lifecycle stages) */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Asset Status Overview</div>
            <div className="card-subtitle">Real-time status breakdown across inventory lifecycle</div>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: 'var(--text-xs)' }}>5 Status States</span>
        </div>

        {/* Visual Progress Bar (Lifecycle Ribbon) */}
        <div className="lifecycle-bar-wrapper">
          <div className="lifecycle-bar" role="img" aria-label="Asset status lifecycle distribution">
            {STATUS_OVERVIEW.map((item) => (
              <div
                key={item.label}
                className="lifecycle-segment"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                title={`${item.label}: ${item.count} (${item.pct}%)`}
              />
            ))}
          </div>
        </div>

        {/* 5 Status Indicator Tiles */}
        <div className="dashboard-status-row" style={{ padding: '0 var(--space-5) var(--space-5)' }}>
          {STATUS_OVERVIEW.map((item) => (
            <div key={item.label} className="status-tile">
              <span className="status-tile-label">{item.label}</span>
              <span className="status-tile-value">{item.count.toLocaleString()}</span>
              <span className="status-tile-pct">{item.pct}% of total</span>
              <div className="status-tile-bar" style={{ backgroundColor: item.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="dashboard-body">
        {/* Left Column: Recent Activity & Visual Overview */}
        <div className="dashboard-left">
          
          {/* 3. Recent Activity Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Activity</div>
                <div className="card-subtitle">Latest operations, checkouts, returns, and maintenance events</div>
              </div>
              <button className="btn btn-ghost btn-sm">Audit Log</button>
            </div>
            <div className="activity-feed">
              {RECENT_ACTIVITIES.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-icon ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-meta">
                      <span>{activity.time}</span>
                      <span className="activity-meta-dot" />
                      <span>{activity.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: 4. Asset Categories & 5. Simple Visual Overview (Chart) */}
        <div className="dashboard-right">
          
          {/* Visual Overview: Status Distribution Donut Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Inventory Allocation</div>
                <div className="card-subtitle">Proportional asset status</div>
              </div>
            </div>
            <div className="donut-chart-wrapper">
              <DonutChart segments={STATUS_OVERVIEW} totalCount="1,280" />
              <div className="donut-legend">
                {STATUS_OVERVIEW.map((item) => (
                  <div key={item.label} className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ backgroundColor: item.color }} />
                    <div className="donut-legend-info">
                      <div className="donut-legend-label">{item.label}</div>
                      <div className="donut-legend-val">{item.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Asset Categories Breakdown */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Asset Categories</div>
                <div className="card-subtitle">Hardware breakdown (6 categories)</div>
              </div>
            </div>
            <div className="category-list">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="category-item">
                  <div className="category-icon-wrap">
                    {cat.icon}
                  </div>
                  <div className="category-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="category-label">{cat.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{cat.pct}%</span>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <span className="category-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
