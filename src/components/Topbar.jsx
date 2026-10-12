import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoginModal from './LoginModal';

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { connectionStatus, retryConnection, error, currentUser, isAuthenticated, logoutUser } = useApp();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
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
          {/* Server Connection Status */}
          {connectionStatus === 'connected' && (
            <span
              className="badge badge-green"
              style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Connected to live PostgreSQL API"
            >
              <span className="badge-dot green" />
              API Connected
            </span>
          )}
          {connectionStatus === 'connecting' && (
            <span
              className="badge badge-blue"
              style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span className="badge-dot blue" />
              Connecting...
            </span>
          )}
          {connectionStatus === 'offline' && (
            <button
              type="button"
              onClick={retryConnection}
              className="badge badge-amber"
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                border: 'none',
              }}
              title={error || 'Backend server is offline. Click to retry connection.'}
            >
              <span className="badge-dot amber" />
              Offline · Retry
            </button>
          )}

          {/* Notification bell */}
          <button className="topbar-icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span className="topbar-badge" aria-label="3 notifications" />
          </button>

          <div className="topbar-divider" aria-hidden="true" />

          {/* User menu / Sign in */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <div
                className="topbar-user"
                role="button"
                tabIndex={0}
                aria-label="User menu"
                onClick={() => setShowUserDropdown((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                <div className="topbar-avatar" aria-hidden="true">
                  {getInitials(currentUser?.name)}
                </div>
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{currentUser?.name || 'User'}</span>
                  <span className="topbar-user-role">
                    {currentUser?.role === 'Admin' ? 'Administrator' : 'Staff Member'}
                  </span>
                </div>
              </div>

              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 200,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 0',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Signed in as</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      logoutUser();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsLoginModalOpen(true)}
              style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
