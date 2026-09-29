import '../styles/dashboard.css';

/* ---- Placeholder data ---- */
const STATS = [
  {
    label: 'Total Assets',
    value: '1,248',
    meta: 'Across all categories',
    accent: 'accent-blue',
    iconColor: 'blue',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Available',
    value: '342',
    meta: 'Ready to assign',
    accent: 'accent-green',
    iconColor: 'green',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Assigned',
    value: '867',
    meta: 'Currently in use',
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
    value: '39',
    meta: 'Under maintenance',
    accent: 'accent-amber',
    iconColor: 'amber',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const RECENT_ASSETS = [
  { id: 'AST-0042', name: 'Dell XPS 15', type: 'Laptop',    status: 'Assigned',  assignee: 'Sarah K.',   date: '29 Sep 2026' },
  { id: 'AST-0041', name: 'HP LaserJet M404', type: 'Printer',  status: 'In Stock',  assignee: '—',          date: '28 Sep 2026' },
  { id: 'AST-0040', name: 'Cisco RV340',  type: 'Router',   status: 'In Use',    assignee: 'IT Dept.',   date: '27 Sep 2026' },
  { id: 'AST-0039', name: 'iPhone 15 Pro', type: 'Smartphone', status: 'In Repair', assignee: 'Mark L.',    date: '26 Sep 2026' },
  { id: 'AST-0038', name: 'LG 27UK850',  type: 'Monitor',  status: 'Assigned',  assignee: 'Jana M.',    date: '25 Sep 2026' },
  { id: 'AST-0037', name: 'ThinkPad X1 Carbon', type: 'Laptop', status: 'Returned', assignee: '—',         date: '24 Sep 2026' },
];

const ACTIVITY_FEED = [
  { color: 'green', text: <><strong>Dell XPS 15</strong> assigned to <strong>Sarah K.</strong></>, meta: 'Today, 14:22 · By Admin' },
  { color: 'amber', text: <><strong>iPhone 15 Pro</strong> sent to repair — screen damage</>, meta: 'Today, 11:07 · By Mark L.' },
  { color: 'blue',  text: <>3 new assets added to <strong>Laptop</strong> category</>, meta: 'Yesterday, 16:43 · By Admin' },
  { color: 'gray',  text: <><strong>ThinkPad X1 Carbon</strong> returned from assignment</>, meta: 'Yesterday, 09:15 · By Jana M.' },
  { color: 'red',   text: <><strong>Cisco RV340</strong> maintenance due in 7 days</>, meta: 'Sep 27, 2026 · System alert' },
  { color: 'green', text: <>Quarterly audit completed — <strong>1,248</strong> assets verified</>, meta: 'Sep 25, 2026 · By Admin' },
];

const LIFECYCLE_SEGMENTS = [
  { label: 'In Stock',  pct: 27.5, color: '#6b7280' },
  { label: 'Assigned',  pct: 52.0, color: '#2563eb' },
  { label: 'In Use',    pct: 9.0,  color: '#16a34a' },
  { label: 'In Repair', pct: 3.1,  color: '#d97706' },
  { label: 'Returned',  pct: 5.8,  color: '#7c3aed' },
  { label: 'Disposed',  pct: 2.6,  color: '#dc2626' },
];

const OVERVIEW_ITEMS = [
  { label: 'Laptops',      count: 287, color: '#2563eb' },
  { label: 'Desktops',     count: 198, color: '#7c3aed' },
  { label: 'Monitors',     count: 310, color: '#0284c7' },
  { label: 'Printers',     count:  62, color: '#16a34a' },
  { label: 'Smartphones',  count: 145, color: '#d97706' },
  { label: 'Servers',      count:  24, color: '#dc2626' },
  { label: 'Routers',      count:  48, color: '#6b7280' },
  { label: 'Other',        count: 174, color: '#9ca3af' },
];

function StatusBadge({ status }) {
  const map = {
    'In Stock':  { cls: 'badge-gray',  dot: 'gray'  },
    'Assigned':  { cls: 'badge-blue',  dot: 'blue'  },
    'In Use':    { cls: 'badge-green', dot: 'green' },
    'In Repair': { cls: 'badge-amber', dot: 'amber' },
    'Returned':  { cls: 'badge-neutral', dot: 'gray' },
    'Disposed':  { cls: 'badge-red',   dot: 'red'   },
  };
  const { cls, dot } = map[status] ?? { cls: 'badge-gray', dot: 'gray' };
  return (
    <span className={`badge ${cls}`}>
      <span className={`badge-dot ${dot}`} />
      {status}
    </span>
  );
}

function AssetTypeIcon({ type }) {
  const icons = {
    Laptop: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    Desktop: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    Monitor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    Printer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
    Smartphone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    Router: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="9" width="22" height="9" rx="2" />
        <path d="M8 9V5M16 9V5M12 9V3M12 18v3" />
      </svg>
    ),
  };
  return icons[type] ?? icons.Laptop;
}

export default function Dashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">IT asset overview — as of 29 Sep 2026</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-primary btn-sm">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Asset
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats">
        {STATS.map((s) => (
          <div key={s.label} className={`stat-card ${s.accent}`}>
            <div className="stat-card-header">
              <span className="stat-card-label">{s.label}</span>
              <div className={`stat-card-icon ${s.iconColor}`}>{s.icon}</div>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-meta">{s.meta}</div>
          </div>
        ))}
      </div>

      {/* Body: Recent Assets + Sidebar panel */}
      <div className="dashboard-body">

        {/* Left: Recent Assets */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Assets</div>
              <div className="card-subtitle">Last 6 asset records updated</div>
            </div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-sm">View all</button>
            </div>
          </div>
          <div className="table-wrapper recent-assets-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Asset ID</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ASSETS.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="asset-type-cell">
                        <div className="asset-type-icon">
                          <AssetTypeIcon type={row.type} />
                        </div>
                        <div>
                          <div className="asset-name">{row.name}</div>
                          <div className="asset-tag">{row.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="col-mono col-nowrap">{row.id}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td className="col-nowrap">{row.assignee}</td>
                    <td className="col-nowrap" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Overview + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Asset Lifecycle bar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Asset Lifecycle</div>
            </div>
            <div className="lifecycle-bar-wrapper">
              <div className="lifecycle-bar-label">Distribution by status</div>
              <div className="lifecycle-bar" role="img" aria-label="Asset lifecycle distribution bar">
                {LIFECYCLE_SEGMENTS.map((seg) => (
                  <div
                    key={seg.label}
                    className="lifecycle-segment"
                    style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                    title={`${seg.label}: ${seg.pct}%`}
                  />
                ))}
              </div>
              <div className="lifecycle-legend">
                {LIFECYCLE_SEGMENTS.map((seg) => (
                  <span key={seg.label} className="lifecycle-legend-item">
                    <span className="lifecycle-legend-dot" style={{ backgroundColor: seg.color }} />
                    {seg.label} ({seg.pct}%)
                  </span>
                ))}
              </div>
            </div>
            <div className="overview-list">
              {OVERVIEW_ITEMS.map((item) => (
                <div key={item.label} className="overview-item">
                  <div className="overview-item-left">
                    <span className="overview-item-dot" style={{ backgroundColor: item.color }} />
                    <span className="overview-item-label">{item.label}</span>
                  </div>
                  <span className="overview-item-count">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Activity</div>
              <button className="btn btn-ghost btn-sm">View log</button>
            </div>
            <div className="activity-feed">
              {ACTIVITY_FEED.map((item, idx) => (
                <div key={idx} className="activity-item">
                  <span className={`activity-dot ${item.color}`} />
                  <div className="activity-content">
                    <div className="activity-text">{item.text}</div>
                    <div className="activity-meta">{item.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
