import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/dashboard.css';

const CATEGORY_COLORS = [
  '#2563eb', // blue
  '#7c3aed', // purple
  '#0284c7', // cyan
  '#16a34a', // green
  '#d97706', // amber
  '#dc2626', // red
  '#6b7280', // gray
  '#0891b2', // teal
  '#4f46e5', // indigo
];

function StatusBadge({ status }) {
  const map = {
    'In Stock':  { cls: 'badge-gray',    dot: 'gray'  },
    'Assigned':  { cls: 'badge-blue',    dot: 'blue'  },
    'In Use':    { cls: 'badge-green',   dot: 'green' },
    'In Repair': { cls: 'badge-amber',   dot: 'amber' },
    'Returned':  { cls: 'badge-neutral', dot: 'gray'  },
    'Disposed':  { cls: 'badge-red',     dot: 'red'   },
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
  const navigate = useNavigate();
  const { assets, categories, employees, assignments } = useApp();
  const [refreshedTime, setRefreshedTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [refreshNotice, setRefreshNotice] = useState(false);

  // 1. Dynamic Summary Statistics
  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === 'In Stock' || a.status === 'Returned').length;
  const assignedCount = assets.filter((a) => a.status === 'Assigned' || a.status === 'In Use').length;
  const inRepairCount = assets.filter((a) => a.status === 'In Repair').length;

  const stats = [
    {
      label: 'Total Assets',
      value: totalAssets.toLocaleString(),
      meta: `${categories.length} categories tracked`,
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
      value: availableCount.toLocaleString(),
      meta: 'Ready for assignment',
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
      value: assignedCount.toLocaleString(),
      meta: `${employees.filter(e => e.status === 'Active').length} active employees`,
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
      value: inRepairCount.toLocaleString(),
      meta: 'Maintenance & service',
      accent: 'accent-amber',
      iconColor: 'amber',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  // 2. Lifecycle Distribution
  const lifecycleStatuses = [
    { label: 'In Stock',  color: '#6b7280' },
    { label: 'Assigned',  color: '#2563eb' },
    { label: 'In Use',    color: '#16a34a' },
    { label: 'In Repair', color: '#d97706' },
    { label: 'Returned',  color: '#7c3aed' },
    { label: 'Disposed',  color: '#dc2626' },
  ];

  const lifecycleSegments = lifecycleStatuses.map((item) => {
    const count = assets.filter((a) => a.status === item.label).length;
    const pct = totalAssets > 0 ? ((count / totalAssets) * 100).toFixed(1) : '0.0';
    return { ...item, count, pct: parseFloat(pct) };
  });

  // 3. Category Overview Breakdown
  const categoryOverview = categories.map((cat, idx) => {
    const count = assets.filter((a) => {
      const aCat = (a.category || '').toLowerCase();
      const cName = cat.name.toLowerCase();
      return aCat === cName ||
        (cName.includes('network') && (aCat === 'router' || aCat === 'network')) ||
        (cName.includes('mobile') && (aCat === 'smartphone' || aCat === 'mobile')) ||
        (cName.includes('peripheral') && (aCat === 'keyboard' || aCat === 'mouse'));
    }).length;

    return {
      label: cat.name,
      count,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    };
  });

  // 4. Dynamic Recent Activity Feed from Assignments & Assets
  const recentActivities = assignments.slice(0, 6).map((asg) => {
    const asset = assets.find((a) => a.id === asg.assetId);
    const emp = employees.find((e) => e.id === asg.employeeId);
    const assetTitle = asset?.assetName || asg.assetId;
    const empName = emp?.name || asg.employeeId;

    if (asg.status === 'Active') {
      return {
        color: 'blue',
        text: (
          <>
            <strong>{assetTitle}</strong> assigned to <strong>{empName}</strong>
          </>
        ),
        meta: `${asg.assignedDate} · Active assignment`,
      };
    }
    return {
      color: 'gray',
      text: (
        <>
          <strong>{assetTitle}</strong> checked in from <strong>{empName}</strong>
        </>
      ),
      meta: `${asg.returnedDate || asg.assignedDate} · Returned to stock`,
    };
  });

  // Fallback if assignments are few
  if (recentActivities.length === 0) {
    recentActivities.push({
      color: 'green',
      text: <>Initial inventory setup completed with <strong>{totalAssets}</strong> assets</>,
      meta: 'System initialized',
    });
  }

  const handleRefresh = () => {
    setRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setRefreshNotice(true);
    setTimeout(() => setRefreshNotice(false), 2000);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            IT asset overview — Synchronized at {refreshedTime} {refreshNotice && <span style={{ color: 'var(--color-status-success)', marginLeft: '6px' }}>✓ Live</span>}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/assets')}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Asset
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats">
        {stats.map((s) => (
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
              <div className="card-subtitle">Last {Math.min(6, assets.length)} asset records in inventory</div>
            </div>
            <div className="card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assets')}>
                View all ({totalAssets})
              </button>
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
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 6).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="asset-type-cell">
                        <div className="asset-type-icon">
                          <AssetTypeIcon type={row.category} />
                        </div>
                        <div>
                          <div className="asset-name">{row.assetName}</div>
                          <div className="asset-tag">{row.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="col-mono col-nowrap">{row.assetCode}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td className="col-nowrap">{row.assignedTo ? row.assignedTo.name : '—'}</td>
                    <td className="col-nowrap" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      {row.purchaseDate || '—'}
                    </td>
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
                {lifecycleSegments.map((seg) => (
                  <div
                    key={seg.label}
                    className="lifecycle-segment"
                    style={{ width: `${Math.max(seg.pct, 1)}%`, backgroundColor: seg.color }}
                    title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
                  />
                ))}
              </div>
              <div className="lifecycle-legend">
                {lifecycleSegments.map((seg) => (
                  <span key={seg.label} className="lifecycle-legend-item">
                    <span className="lifecycle-legend-dot" style={{ backgroundColor: seg.color }} />
                    {seg.label} ({seg.count})
                  </span>
                ))}
              </div>
            </div>
            <div className="overview-list">
              {categoryOverview.map((item) => (
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>
                View log
              </button>
            </div>
            <div className="activity-feed">
              {recentActivities.map((item, idx) => (
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
