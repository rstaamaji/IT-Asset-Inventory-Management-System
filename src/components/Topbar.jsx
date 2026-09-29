import { useLocation } from 'react-router-dom';

const ROUTE_LABELS = {
  '/':           { breadcrumb: ['Dashboard'],                 title: 'Dashboard'   },
  '/assets':     { breadcrumb: ['Asset Management', 'Assets'], title: 'Assets'      },
  '/categories': { breadcrumb: ['Asset Management', 'Categories'], title: 'Categories' },
  '/employees':  { breadcrumb: ['Operations', 'Employees'],   title: 'Employees'   },
  '/assignments':{ breadcrumb: ['Operations', 'Assignments'], title: 'Assignments' },
  '/maintenance':{ breadcrumb: ['Service', 'Maintenance'],    title: 'Maintenance' },
  '/reports':    { breadcrumb: ['Service', 'Reports'],        title: 'Reports'     },
};

export default function Topbar({ sidebarCollapsed, onOpenMobile }) {
  const location = useLocation();
  const routeInfo = ROUTE_LABELS[location.pathname] ?? { breadcrumb: ['App'], title: 'Page' };

  return (
    <header className={`topbar${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        {/* Mobile hamburger */}
        <button
          className="topbar-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
          {routeInfo.breadcrumb.map((crumb, idx) => (
            <span key={crumb} className="breadcrumb-row" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {idx > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
              {idx === routeInfo.breadcrumb.length - 1
                ? <span className="breadcrumb-current">{crumb}</span>
                : <span className="breadcrumb-item">{crumb}</span>
              }
            </span>
          ))}
        </nav>

        {/* Search */}
        <div className="topbar-search" role="search">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            placeholder="Search assets, employees…"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification bell */}
        <button className="topbar-icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="topbar-badge" aria-label="3 notifications" />
        </button>

        {/* Settings */}
        <button className="topbar-icon-btn" aria-label="Settings">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="topbar-divider" aria-hidden="true" />

        {/* User avatar */}
        <div className="topbar-user" role="button" tabIndex={0} aria-label="User menu">
          <div className="topbar-avatar" aria-hidden="true">AD</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">Admin</span>
            <span className="topbar-user-role">IT Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
