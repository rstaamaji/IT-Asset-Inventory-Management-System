import { useState, useMemo } from 'react';
import { MOCK_ASSETS, ASSET_CATEGORIES, ASSET_STATUSES } from '../data/mockAssets';
import AssetTable from '../components/AssetTable';
import AssetDetailModal from '../components/AssetDetailModal';

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeAsset, setActiveAsset] = useState(null);

  // Compute status counts for quick tabs
  const statusCounts = useMemo(() => {
    const counts = { ALL: MOCK_ASSETS.length };
    ASSET_STATUSES.forEach((st) => {
      counts[st] = MOCK_ASSETS.filter((a) => a.status === st).length;
    });
    return counts;
  }, []);

  // Filtered dataset matching search and filter parameters
  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter((asset) => {
      // 1. Filter by category
      if (selectedCategory !== 'ALL' && asset.category !== selectedCategory) {
        return false;
      }

      // 2. Filter by status
      if (selectedStatus !== 'ALL' && asset.status !== selectedStatus) {
        return false;
      }

      // 3. Search by asset name, asset code, serial number, or brand
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const codeMatch = asset.assetCode.toLowerCase().includes(query);
        const nameMatch = asset.assetName.toLowerCase().includes(query);
        const brandMatch = asset.brand.toLowerCase().includes(query);
        const serialMatch = asset.serialNumber.toLowerCase().includes(query);

        return codeMatch || nameMatch || brandMatch || serialMatch;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Metric stats for summary strip
  const totalValue = useMemo(() => {
    return MOCK_ASSETS.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Assets Management</h1>
          <p className="page-subtitle">Central inventory of organizational IT hardware, equipment, and peripherals</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary btn-sm" aria-label="Export asset catalog">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export List
          </button>
          <button type="button" className="btn btn-primary btn-sm" aria-label="Add new asset">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Register Asset
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="section-grid section-grid-4" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Assets</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{MOCK_ASSETS.length}</div>
          <div className="stat-card-meta">Recorded units across departments</div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Available In Stock</span>
            <div className="stat-card-icon green">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{statusCounts['In Stock'] || 0}</div>
          <div className="stat-card-meta">Available for employee deployment</div>
        </div>

        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Allocated / In Use</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">
            {(statusCounts['In Use'] || 0) + (statusCounts['Assigned'] || 0)}
          </div>
          <div className="stat-card-meta">Currently in active rotation</div>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Asset Value</span>
            <div className="stat-card-icon amber">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalValue)}</div>
          <div className="stat-card-meta">Combined acquisition investment</div>
        </div>
      </div>

      {/* Main Asset Table Card */}
      <div className="card">
        {/* Quick Lifecycle Status Tabs */}
        <div className="quick-filter-tabs">
          <button
            type="button"
            className={`quick-tab-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            All Statuses
            <span className="quick-tab-count">{statusCounts.ALL}</span>
          </button>
          {ASSET_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`quick-tab-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
              <span className="quick-tab-count">{statusCounts[status] || 0}</span>
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="asset-filter-bar">
          <div className="asset-filter-group">
            {/* Search Input: asset name, asset code, serial number, brand */}
            <div className="search-input-wrapper">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search name, code, serial, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search by asset name, asset code, serial number, or brand"
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

            {/* Filter by Category */}
            <select
              className="select-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {ASSET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Filter by Status Dropdown */}
            <select
              className="select-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              {ASSET_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResetFilters}
                style={{ color: 'var(--color-status-danger)', fontSize: 'var(--text-xs)' }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredAssets.length}</strong> of {MOCK_ASSETS.length} assets
          </div>
        </div>

        {/* 8-Column Asset Table */}
        <AssetTable
          assets={filteredAssets}
          onSelectAsset={(asset) => setActiveAsset(asset)}
        />

        {/* Card Footer / Pagination Information */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing {filteredAssets.length > 0 ? 1 : 0} to {filteredAssets.length} of {filteredAssets.length} filtered items
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

      {/* Asset Inspection Detail Modal */}
      {activeAsset && (
        <AssetDetailModal
          asset={activeAsset}
          onClose={() => setActiveAsset(null)}
        />
      )}
    </div>
  );
}
