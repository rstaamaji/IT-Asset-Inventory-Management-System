import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import AssetCategoryIcon from '../components/AssetCategoryIcon';
import CategoryFormModal from '../components/CategoryFormModal';
import CategoryDeleteModal from '../components/CategoryDeleteModal';

export default function Categories() {
  const { categories, assets, addCategory, updateCategory, deleteCategory } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Feedback banner
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const showNotification = (message) => {
    setFeedbackNotice(message);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4000);
  };

  // Pre-calculate asset count map for performance & KPI metrics
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      const targetName = (cat.name || '').trim().toLowerCase();
      counts[cat.id] = assets.filter((asset) => {
        const assetCat = (asset.category || '').trim().toLowerCase();
        if (assetCat === targetName) return true;
        if (targetName === 'network equipment' && (assetCat === 'router' || assetCat === 'network')) return true;
        if (targetName === 'mobile device' && (assetCat === 'smartphone' || assetCat === 'mobile')) return true;
        if (targetName === 'peripheral' && (assetCat === 'keyboard' || assetCat === 'mouse')) return true;
        return false;
      }).length;
    });
    return counts;
  }, [categories, assets]);

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.trim().toLowerCase();
    return categories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(query);
      const descMatch = (cat.description || '').toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [categories, searchQuery]);

  // Overall KPIs
  const totalAssetsAcrossCategories = useMemo(() => {
    return Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  }, [categoryCounts]);

  const topCategory = useMemo(() => {
    if (categories.length === 0) return null;
    let maxCat = categories[0];
    let maxCount = categoryCounts[maxCat.id] || 0;
    categories.forEach((cat) => {
      const count = categoryCounts[cat.id] || 0;
      if (count > maxCount) {
        maxCount = count;
        maxCat = cat;
      }
    });
    return { name: maxCat.name, count: maxCount };
  }, [categories, categoryCounts]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ---- CRUD Handlers ----
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = (categoryData) => {
    const exists = categories.some((c) => c.id === categoryData.id);

    if (exists) {
      // UPDATE
      updateCategory(categoryData);
      showNotification(`Category "${categoryData.name}" successfully updated.`);
    } else {
      // CREATE
      addCategory(categoryData);
      showNotification(`Category "${categoryData.name}" successfully created.`);
    }

    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeletePrompt = (category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = (categoryId) => {
    const target = categories.find((c) => c.id === categoryId);
    deleteCategory(categoryId);
    setCategoryToDelete(null);
    if (target) {
      showNotification(`Category "${target.name}" has been deleted.`);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Asset Categories</h1>
          <p className="page-subtitle">Classify hardware types, equipment lifecycle policies, and allocation profiles</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreate}
            aria-label="Add new category"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Feedback notice banner */}
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
            <span className="stat-card-label">Total Categories</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{categories.length}</div>
          <div className="stat-card-meta">Defined hardware classifications</div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Categorized Assets</span>
            <div className="stat-card-icon green">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">{totalAssetsAcrossCategories}</div>
          <div className="stat-card-meta">Assets mapped to active categories</div>
        </div>

        <div className="stat-card accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Top Category</span>
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm6-4a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2V7zm6-2a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {topCategory ? topCategory.name : '—'}
          </div>
          <div className="stat-card-meta">
            {topCategory ? `${topCategory.count} assigned units` : 'No categories'}
          </div>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Empty Categories</span>
            <div className="stat-card-icon amber">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="stat-card-value">
            {categories.filter((cat) => (categoryCounts[cat.id] || 0) === 0).length}
          </div>
          <div className="stat-card-meta">Categories with 0 assigned assets</div>
        </div>
      </div>

      {/* Main Categories Card */}
      <div className="card">
        {/* Search & Action Bar */}
        <div className="asset-filter-bar">
          <div className="asset-filter-group">
            {/* Search Input: name or description */}
            <div className="search-input-wrapper">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search category name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search categories by name or description"
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
            Showing <strong>{filteredCategories.length}</strong> of {categories.length} categories
          </div>
        </div>

        {/* Categories Table */}
        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <div className="empty-state-title">No categories found</div>
            <div className="empty-state-desc">
              {searchQuery
                ? `No category matched "${searchQuery}". Try a different search query.`
                : 'No categories recorded. Click "Add Category" to create one.'}
            </div>
            {searchQuery && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 'var(--space-4)' }}
                onClick={() => setSearchQuery('')}
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Category Name</th>
                  <th>Description</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Number of Assets</th>
                  <th style={{ width: '130px' }}>Created Date</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const assetCount = categoryCounts[cat.id] || 0;

                  return (
                    <tr key={cat.id}>
                      {/* Category Name */}
                      <td className="col-nowrap">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <AssetCategoryIcon category={cat.name} size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                              {cat.name}
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {cat.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td>
                        <div
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: var_leading_normal(),
                            maxWidth: '480px',
                          }}
                        >
                          {cat.description || '—'}
                        </div>
                      </td>

                      {/* Number of Assets */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${assetCount > 0 ? 'badge-blue' : 'badge-neutral'}`}
                          style={{ padding: '3px 10px', fontSize: 'var(--text-xs)' }}
                        >
                          {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="col-nowrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(cat.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(cat)}
                            title={`Edit ${cat.name}`}
                            aria-label={`Edit ${cat.name}`}
                            style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDeletePrompt(cat)}
                            title={`Delete ${cat.name}`}
                            aria-label={`Delete ${cat.name}`}
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
        )}

        {/* Card Footer / Record summary */}
        <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Showing {filteredCategories.length > 0 ? 1 : 0} to {filteredCategories.length} of {filteredCategories.length} categories
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

      {/* CREATE & EDIT Category Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        initialData={editingCategory}
        existingCategories={categories}
        onSave={handleSaveCategory}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
      />

      {/* DELETE Category Confirmation Modal */}
      {categoryToDelete && (
        <CategoryDeleteModal
          category={categoryToDelete}
          assetCount={categoryCounts[categoryToDelete.id] || 0}
          onConfirm={handleConfirmDelete}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
}

function var_leading_normal() {
  return '1.5';
}
