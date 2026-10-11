import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useApp } from '../context/AppContext';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { connectionStatus, retryConnection } = useApp();

  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);
  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className={`app-content-wrapper${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onOpenMobile={openMobile}
        />
        {connectionStatus === 'offline' && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              color: '#92400e',
              padding: '8px 16px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
            role="alert"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>
                <strong>Backend Server Disconnected:</strong> Running in offline preview mode. Run <code>npm run server</code> to synchronize with PostgreSQL.
              </span>
            </div>
            <button
              type="button"
              onClick={retryConnection}
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Retry Connection
            </button>
          </div>
        )}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
