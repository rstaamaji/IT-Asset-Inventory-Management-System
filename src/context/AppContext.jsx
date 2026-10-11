import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import assetService from '../services/assetService';
import categoryService from '../services/categoryService';
import employeeService from '../services/employeeService';
import assignmentService from '../services/assignmentService';
import dashboardService from '../services/dashboardService';
import { MOCK_ASSETS } from '../data/mockAssets';
import { MOCK_CATEGORIES } from '../data/mockCategories';
import { MOCK_EMPLOYEES } from '../data/mockEmployees';
import { MOCK_ASSIGNMENTS } from '../data/mockAssignments';

const STORAGE_KEYS = {
  ASSETS: 'it_asset_mgmt_assets_v1',
  CATEGORIES: 'it_asset_mgmt_categories_v1',
  EMPLOYEES: 'it_asset_mgmt_employees_v1',
  ASSIGNMENTS: 'it_asset_mgmt_assignments_v1',
};

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch (err) {
    console.warn(`Error loading localStorage key "${key}":`, err);
    return fallback;
  }
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving localStorage key "${key}":`, err);
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Connection & Loading Status
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'offline'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // 2. Core domain datasets
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);

  /**
   * Load authoritative server dataset from backend APIs.
   * If server is unreachable, explicitly enters 'offline' state and uses isolated local preview.
   */
  const loadServerData = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const [catsRes, empsRes, astsRes, asgsRes, statsRes] = await Promise.all([
        categoryService.getCategories(),
        employeeService.getEmployees({ limit: 100 }),
        assetService.getAssets({ limit: 100 }),
        assignmentService.getAssignments({ limit: 100 }),
        dashboardService.getStats().catch(() => null),
      ]);

      setCategories(catsRes.categories || []);
      setEmployees(empsRes.employees || []);
      setAssets(astsRes.assets || []);
      setAssignments(asgsRes.assignments || []);
      if (statsRes) setDashboardStats(statsRes);

      setConnectionStatus('connected');
      setError(null);
    } catch (err) {
      console.warn('[AppContext] API Server offline or unreachable:', err.message);
      setConnectionStatus('offline');
      setError(err.message || 'Unable to connect to live backend API');

      // Development fallback: Read local storage cache for offline viewing only
      // Notice: we do NOT mark this as live server data and we do NOT overwrite server data!
      const fallbackAssets = loadStorage(STORAGE_KEYS.ASSETS, MOCK_ASSETS);
      const fallbackCategories = loadStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
      const fallbackEmployees = loadStorage(STORAGE_KEYS.EMPLOYEES, MOCK_EMPLOYEES);
      const fallbackAssignments = loadStorage(STORAGE_KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS);

      setAssets(fallbackAssets);
      setCategories(fallbackCategories);
      setEmployees(fallbackEmployees);
      setAssignments(fallbackAssignments);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial mount load using async effect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [catsRes, empsRes, astsRes, asgsRes, statsRes] = await Promise.all([
          categoryService.getCategories(),
          employeeService.getEmployees({ limit: 100 }),
          assetService.getAssets({ limit: 100 }),
          assignmentService.getAssignments({ limit: 100 }),
          dashboardService.getStats().catch(() => null),
        ]);

        if (!active) return;
        setCategories(catsRes.categories || []);
        setEmployees(empsRes.employees || []);
        setAssets(astsRes.assets || []);
        setAssignments(asgsRes.assignments || []);
        if (statsRes) setDashboardStats(statsRes);
        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        if (!active) return;
        console.warn('[AppContext] API Server offline or unreachable:', err.message);
        setConnectionStatus('offline');
        setError(err.message || 'Unable to connect to live backend API');

        setAssets(loadStorage(STORAGE_KEYS.ASSETS, MOCK_ASSETS));
        setCategories(loadStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES));
        setEmployees(loadStorage(STORAGE_KEYS.EMPLOYEES, MOCK_EMPLOYEES));
        setAssignments(loadStorage(STORAGE_KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS));
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Persist offline cache only when in offline preview mode (so user edits in offline mode aren't lost)
  useEffect(() => {
    if (connectionStatus === 'offline') {
      if (assets.length > 0) saveStorage(STORAGE_KEYS.ASSETS, assets);
      if (categories.length > 0) saveStorage(STORAGE_KEYS.CATEGORIES, categories);
      if (employees.length > 0) saveStorage(STORAGE_KEYS.EMPLOYEES, employees);
      if (assignments.length > 0) saveStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }
  }, [connectionStatus, assets, categories, employees, assignments]);

  /**
   * Refreshes dependent aggregated data (category asset counts, dashboard statistics)
   */
  const syncDependentData = useCallback(async () => {
    if (connectionStatus !== 'connected') return;
    try {
      const [catsRes, statsRes] = await Promise.all([
        categoryService.getCategories().catch(() => null),
        dashboardService.getStats().catch(() => null),
      ]);
      if (catsRes?.categories) setCategories(catsRes.categories);
      if (statsRes) setDashboardStats(statsRes);
    } catch (err) {
      console.warn('[AppContext] Background sync error:', err.message);
    }
  }, [connectionStatus]);

  // ==========================================
  // Category Operations
  // ==========================================
  const addCategory = async (categoryData) => {
    try {
      const created = await categoryService.createCategory(categoryData);
      setCategories((prev) => [created, ...prev]);
      return { success: true, category: created };
    } catch (err) {
      console.error('[AppContext] Failed to add category:', err);
      // Offline fallback
      if (connectionStatus === 'offline') {
        const localCat = {
          ...categoryData,
          id: categoryData.id || `cat-${Date.now()}`,
          assetCount: 0,
          createdAt: new Date().toISOString(),
        };
        setCategories((prev) => [localCat, ...prev]);
        return { success: true, category: localCat };
      }
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (categoryData) => {
    try {
      const updated = await categoryService.updateCategory(categoryData.id, categoryData);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      return { success: true, category: updated };
    } catch (err) {
      console.error('[AppContext] Failed to update category:', err);
      if (connectionStatus === 'offline') {
        setCategories((prev) => prev.map((c) => (c.id === categoryData.id ? { ...c, ...categoryData } : c)));
        return { success: true, category: categoryData };
      }
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      return { success: true };
    } catch (err) {
      console.error('[AppContext] Failed to delete category:', err);
      if (connectionStatus === 'offline') {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // Employee Operations
  // ==========================================
  const addEmployee = async (employeeData) => {
    try {
      const created = await employeeService.createEmployee(employeeData);
      setEmployees((prev) => [created, ...prev]);
      return { success: true, employee: created };
    } catch (err) {
      console.error('[AppContext] Failed to add employee:', err);
      if (connectionStatus === 'offline') {
        const localEmp = {
          ...employeeData,
          id: employeeData.id || `emp-${Date.now()}`,
          assignedAssetCount: 0,
          joinedDate: employeeData.joinedDate || new Date().toISOString().split('T')[0],
        };
        setEmployees((prev) => [localEmp, ...prev]);
        return { success: true, employee: localEmp };
      }
      return { success: false, error: err.message };
    }
  };

  const updateEmployee = async (employeeData) => {
    try {
      const updated = await employeeService.updateEmployee(employeeData.id, employeeData);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      // Background sync assets assignedTo snapshot
      syncDependentData();
      return { success: true, employee: updated };
    } catch (err) {
      console.error('[AppContext] Failed to update employee:', err);
      if (connectionStatus === 'offline') {
        setEmployees((prev) => prev.map((e) => (e.id === employeeData.id ? { ...e, ...employeeData } : e)));
        return { success: true, employee: employeeData };
      }
      return { success: false, error: err.message };
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
      return { success: true };
    } catch (err) {
      console.error('[AppContext] Failed to delete employee:', err);
      if (connectionStatus === 'offline') {
        setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // Asset Operations
  // ==========================================
  const addAsset = async (assetData) => {
    try {
      const created = await assetService.createAsset(assetData);
      setAssets((prev) => [created, ...prev]);
      syncDependentData();
      return { success: true, asset: created };
    } catch (err) {
      console.error('[AppContext] Failed to add asset:', err);
      if (connectionStatus === 'offline') {
        const localAsset = {
          ...assetData,
          id: assetData.id || `ast-${Date.now()}`,
          status: assetData.status || 'In Stock',
          statusHistory: [
            {
              id: `sh-local-${Date.now()}`,
              previousStatus: null,
              newStatus: assetData.status || 'In Stock',
              timestamp: new Date().toISOString(),
              reason: 'Initial asset registration (offline)',
              actor: null,
            },
          ],
        };
        setAssets((prev) => [localAsset, ...prev]);
        return { success: true, asset: localAsset };
      }
      return { success: false, error: err.message };
    }
  };

  const updateAsset = async (assetData, statusChangeReason = '', actor = null) => {
    try {
      const updated = await assetService.updateAsset(assetData.id, assetData, statusChangeReason, actor);
      setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      syncDependentData();
      return { success: true, asset: updated };
    } catch (err) {
      console.error('[AppContext] Failed to update asset:', err);
      if (connectionStatus === 'offline') {
        setAssets((prev) => prev.map((a) => (a.id === assetData.id ? { ...a, ...assetData } : a)));
        return { success: true, asset: assetData };
      }
      return { success: false, error: err.message };
    }
  };

  const transitionAssetStatus = async (assetId, newStatus, reason = '', actor = null) => {
    try {
      const updated = await assetService.updateAssetStatus(assetId, newStatus, reason, actor);
      setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

      // If returned, refresh assignments list as well
      if (newStatus === 'Returned') {
        const asgRes = await assignmentService.getAssignments({ limit: 100 }).catch(() => null);
        if (asgRes?.assignments) setAssignments(asgRes.assignments);
      }

      syncDependentData();
      return { success: true, asset: updated };
    } catch (err) {
      console.error('[AppContext] Failed to transition asset status:', err);
      if (connectionStatus === 'offline') {
        setAssets((prev) =>
          prev.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a))
        );
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  const deleteAsset = async (assetId) => {
    try {
      await assetService.deleteAsset(assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      syncDependentData();
      return { success: true };
    } catch (err) {
      console.error('[AppContext] Failed to delete asset:', err);
      if (connectionStatus === 'offline') {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // Assignment Operations
  // ==========================================
  const assignAsset = async ({ assetId, employeeId, assignedDate, expectedReturnDate, notes, actor }) => {
    try {
      const createdAsg = await assignmentService.createAssignment({
        assetId,
        employeeId,
        assignedDate,
        expectedReturnDate,
        notes,
        actor,
      });

      // Synchronize affected asset and employee records
      const [astRes, empRes] = await Promise.all([
        assetService.getAssetById(assetId).catch(() => null),
        employeeService.getEmployeeById(employeeId).catch(() => null),
      ]);

      if (astRes) {
        setAssets((prev) => prev.map((a) => (a.id === assetId ? astRes : a)));
      }
      if (empRes) {
        setEmployees((prev) => prev.map((e) => (e.id === employeeId ? empRes : e)));
      }

      setAssignments((prev) => [createdAsg, ...prev]);
      syncDependentData();
      return { success: true, assignment: createdAsg };
    } catch (err) {
      console.error('[AppContext] Failed to assign asset:', err);
      if (connectionStatus === 'offline') {
        const localAsg = {
          id: `asg-${Date.now()}`,
          assetId,
          employeeId,
          assignedDate: assignedDate || new Date().toISOString().split('T')[0],
          expectedReturnDate: expectedReturnDate || '',
          returnedDate: null,
          notes: notes || '',
          status: 'Active',
        };
        setAssignments((prev) => [localAsg, ...prev]);
        setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, status: 'Assigned' } : a)));
        return { success: true, assignment: localAsg };
      }
      return { success: false, error: err.message };
    }
  };

  const returnAsset = async ({ assignmentId, returnedDate, returnNotes, returnStatus, actor }) => {
    try {
      const result = await assignmentService.returnAssignment(assignmentId, {
        returnedDate,
        notes: returnNotes,
        returnStatus,
        actor,
      });

      if (result.assignment) {
        setAssignments((prev) => prev.map((asg) => (asg.id === assignmentId ? result.assignment : asg)));
      }

      // Re-fetch updated asset & employee states
      const targetAsg = assignments.find((a) => a.id === assignmentId);
      if (targetAsg?.assetId) {
        const fullAsset = await assetService.getAssetById(targetAsg.assetId).catch(() => null);
        if (fullAsset) {
          setAssets((prev) => prev.map((a) => (a.id === fullAsset.id ? fullAsset : a)));
        }
      }

      const empsRes = await employeeService.getEmployees({ limit: 100 }).catch(() => null);
      if (empsRes?.employees) setEmployees(empsRes.employees);

      syncDependentData();
      return { success: true, result };
    } catch (err) {
      console.error('[AppContext] Failed to return asset:', err);
      if (connectionStatus === 'offline') {
        setAssignments((prev) =>
          prev.map((asg) =>
            asg.id === assignmentId
              ? { ...asg, status: 'Returned', returnedDate: returnedDate || new Date().toISOString().split('T')[0] }
              : asg
          )
        );
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // Helper Queries & Dynamic Computations
  // ==========================================
  const getEmployeeAssignedAssets = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return [];

    const activeAssetIds = new Set(
      assignments.filter((asg) => asg.employeeId === employeeId && asg.status === 'Active').map((asg) => asg.assetId)
    );

    return assets.filter(
      (a) =>
        (activeAssetIds.has(a.id) ||
          (a.assignedTo &&
            (a.assignedTo.id === employeeId ||
              a.assignedTo.name === employee.name ||
              a.assignedTo.email === employee.email))) &&
        (a.status === 'Assigned' || a.status === 'In Use')
    );
  };

  const getEmployeeAssignmentHistory = (employeeId) => {
    return assignments.filter((asg) => asg.employeeId === employeeId);
  };

  const getAssetActiveAssignment = (assetId) => {
    return assignments.find((asg) => asg.assetId === assetId && asg.status === 'Active') || null;
  };

  const getAssetAssignmentHistory = (assetId) => {
    return assignments.filter((asg) => asg.assetId === assetId);
  };

  const getCategoryAssetCount = (categoryName) => {
    const target = (categoryName || '').trim().toLowerCase();
    return assets.filter((a) => {
      const cat = (a.category || '').trim().toLowerCase();
      if (cat === target) return true;
      if (target === 'network equipment' && (cat === 'router' || cat === 'network')) return true;
      if (target === 'mobile device' && (cat === 'smartphone' || cat === 'mobile')) return true;
      if (target === 'peripheral' && (cat === 'keyboard' || cat === 'mouse')) return true;
      return false;
    }).length;
  };

  // Reset to initial defaults (clears local cache and triggers server reload)
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    loadServerData();
  };

  const value = {
    // Live Server Connection & Status
    connectionStatus,
    isLoading,
    error,
    dashboardStats,
    retryConnection: loadServerData,
    refreshData: loadServerData,

    // Core datasets
    assets,
    categories,
    employees,
    assignments,

    // Category actions
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryAssetCount,

    // Employee actions
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeAssignedAssets,
    getEmployeeAssignmentHistory,

    // Asset actions
    addAsset,
    updateAsset,
    deleteAsset,
    transitionAssetStatus,
    getAssetActiveAssignment,
    getAssetAssignmentHistory,

    // Assignment actions
    assignAsset,
    returnAsset,

    // Reset
    resetToDefaults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
