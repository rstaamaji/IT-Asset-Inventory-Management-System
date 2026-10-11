import { createContext, useContext, useState, useEffect } from 'react';
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

/**
 * Creates an immutable status transition history record.
 * Schema: { id, previousStatus, newStatus, timestamp, reason, actor }
 * Note: Actor is null as application has no authenticated user context (do not fabricate actors).
 */
function createStatusHistoryEntry(previousStatus, newStatus, reason = '', actor = null) {
  return {
    id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    previousStatus: previousStatus || null,
    newStatus,
    timestamp: new Date().toISOString(),
    reason: (reason || '').trim() || (previousStatus ? `Status transitioned from ${previousStatus} to ${newStatus}` : `Initial status: ${newStatus}`),
    actor: actor || null,
  };
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Initial State from localStorage (or fallback mock data)
  const [assets, setAssets] = useState(() => {
    const loaded = loadStorage(STORAGE_KEYS.ASSETS, MOCK_ASSETS);
    return loaded.map((a) => ({
      ...a,
      statusHistory: Array.isArray(a.statusHistory) && a.statusHistory.length > 0
        ? a.statusHistory
        : [
            {
              id: `sh-init-${a.id}`,
              previousStatus: null,
              newStatus: a.status || 'In Stock',
              timestamp: a.purchaseDate ? `${a.purchaseDate}T09:00:00.000Z` : new Date().toISOString(),
              reason: 'Initial hardware inventory intake and cataloging',
              actor: null,
            },
          ],
    }));
  });
  const [categories, setCategories] = useState(() => loadStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES));
  const [employees, setEmployees] = useState(() => loadStorage(STORAGE_KEYS.EMPLOYEES, MOCK_EMPLOYEES));
  const [assignments, setAssignments] = useState(() => loadStorage(STORAGE_KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS));

  // 2. Persist state changes
  useEffect(() => {
    saveStorage(STORAGE_KEYS.ASSETS, assets);
  }, [assets]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }, [assignments]);

  // ==========================================
  // Category Operations
  // ==========================================
  const addCategory = (categoryData) => {
    const newCategory = {
      ...categoryData,
      id: categoryData.id || `cat-${Date.now()}`,
      createdAt: categoryData.createdAt || new Date().toISOString().split('T')[0],
    };
    setCategories((prev) => [newCategory, ...prev]);
    return newCategory;
  };

  const updateCategory = (categoryData) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryData.id ? categoryData : c)));
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // ==========================================
  // Employee Operations
  // ==========================================
  const addEmployee = (employeeData) => {
    const today = new Date().toISOString().split('T')[0];
    const newEmployee = {
      ...employeeData,
      id: employeeData.id || `emp-${Date.now()}`,
      joinedDate: employeeData.joinedDate || today,
      createdAt: employeeData.createdAt || today,
    };
    setEmployees((prev) => [newEmployee, ...prev]);
    return newEmployee;
  };

  const updateEmployee = (employeeData) => {
    setEmployees((prev) => prev.map((e) => (e.id === employeeData.id ? { ...e, ...employeeData } : e)));

    // Keep assignedTo snapshot on assets in sync with updated employee details
    setAssets((prev) =>
      prev.map((asset) => {
        if (
          asset.assignedTo &&
          (asset.assignedTo.id === employeeData.id ||
            asset.assignedTo.email === employeeData.email ||
            asset.assignedTo.name === employeeData.name)
        ) {
          return {
            ...asset,
            assignedTo: {
              id: employeeData.id,
              name: employeeData.name,
              department: employeeData.department,
              email: employeeData.email,
            },
          };
        }
        return asset;
      })
    );
  };

  const deleteEmployee = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    // Check if employee has active assigned assets
    const activeAssetIdsFromAssignments = new Set(
      assignments.filter((asg) => asg.employeeId === employeeId && asg.status === 'Active').map((asg) => asg.assetId)
    );

    const activeAssets = assets.filter(
      (a) =>
        activeAssetIdsFromAssignments.has(a.id) ||
        (a.assignedTo &&
          (a.assignedTo.id === employeeId ||
            a.assignedTo.email === employee.email ||
            a.assignedTo.name === employee.name))
    );

    // If active assets exist, release them to 'In Stock' and terminate active assignments
    if (activeAssets.length > 0) {
      const activeIds = new Set(activeAssets.map((a) => a.id));
      setAssets((prev) =>
        prev.map((a) => {
          if (activeIds.has(a.id)) {
            return {
              ...a,
              status: 'In Stock',
              assignedTo: null,
            };
          }
          return a;
        })
      );

      // Close active assignments
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.employeeId === employeeId && asg.status === 'Active') {
            return {
              ...asg,
              status: 'Returned',
              returnedDate: new Date().toISOString().split('T')[0],
              notes: `${asg.notes || ''} (Auto-returned due to employee profile deletion)`.trim(),
            };
          }
          return asg;
        })
      );
    }

    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  };

  // ==========================================
  // Asset Operations
  // ==========================================
  const addAsset = (assetData) => {
    const status = assetData.status || 'In Stock';
    const initHistory = createStatusHistoryEntry(
      null,
      status,
      'Initial asset registration and catalog intake',
      null
    );
    const newAsset = {
      ...assetData,
      id: assetData.id || `ast-${Date.now()}`,
      status,
      statusHistory: [initHistory],
    };
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const updateAsset = (assetData, statusChangeReason = '') => {
    const existing = assets.find((a) => a.id === assetData.id);
    let updatedHistory = Array.isArray(assetData.statusHistory)
      ? assetData.statusHistory
      : existing && Array.isArray(existing.statusHistory)
      ? existing.statusHistory
      : [];

    if (existing && existing.status !== assetData.status) {
      const historyEntry = createStatusHistoryEntry(
        existing.status,
        assetData.status,
        statusChangeReason || `Status updated from ${existing.status} to ${assetData.status} via edit`,
        null
      );
      updatedHistory = [historyEntry, ...updatedHistory];
    }

    const updated = {
      ...assetData,
      statusHistory: updatedHistory,
    };

    setAssets((prev) => prev.map((a) => (a.id === assetData.id ? updated : a)));
    return updated;
  };

  const deleteAsset = (assetId) => {
    // Remove asset from current catalog while preserving lifetime assignment audit records
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  /**
   * Transition Asset Status with lifecycle validation rules:
   * Statuses: 'In Stock' | 'Assigned' | 'In Use' | 'In Repair' | 'Returned' | 'Disposed'
   * Enforces rules:
   * - Disposed is terminal (no transitions allowed out).
   * - Cannot dispose an asset with an active assignment.
   * - Cannot transition an asset with an active assignment to In Stock (must be returned first).
   * - Repaired asset -> In Stock only if it has no active assignment.
   * - Records status transition history with previousStatus, newStatus, timestamp, reason, actor (null).
   */
  const transitionAssetStatus = (assetId, newStatus, reason = '') => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return { success: false, error: 'Asset not found.' };

    const currentStatus = targetAsset.status;

    // Disposed is a terminal state
    if (currentStatus === 'Disposed') {
      return {
        success: false,
        error: 'Cannot transition from Disposed state. Asset has been permanently decommissioned.',
      };
    }

    if (currentStatus === newStatus) {
      return { success: false, error: `Asset is already in ${newStatus} state.` };
    }

    // Check active assignment
    const hasActiveAssignment = assignments.some(
      (asg) => asg.assetId === assetId && asg.status === 'Active'
    );

    // Rule 3: Do not allow an asset with an active assignment to become available or be disposed.
    if (hasActiveAssignment) {
      if (newStatus === 'In Stock') {
        return {
          success: false,
          error: 'Cannot transition asset to In Stock while an active assignment exists. Return the equipment from custodian first.',
        };
      }
      if (newStatus === 'Disposed') {
        return {
          success: false,
          error: 'Cannot dispose an asset with an active assignment. Conclude custodian assignment before decommissioning.',
        };
      }
    }

    // Rule 2: repaired asset -> In Stock only if it has no active assignment
    if (currentStatus === 'In Repair' && newStatus === 'In Stock' && hasActiveAssignment) {
      return {
        success: false,
        error: 'Repaired asset cannot transition to In Stock while an active assignment is open.',
      };
    }

    // Rule 2: disposal -> Disposed only when no active assignment exists
    if (newStatus === 'Disposed' && hasActiveAssignment) {
      return {
        success: false,
        error: 'Cannot dispose asset while an active assignment exists.',
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const historyEntry = createStatusHistoryEntry(currentStatus, newStatus, reason, null);

    // Handle side effects of status transitions
    let updatedAssignedTo = targetAsset.assignedTo;

    if (newStatus === 'Returned') {
      // Returning an asset: conclude active assignment and record notes
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.assetId === assetId && asg.status === 'Active') {
            const returnNote = reason.trim() ? ` [${reason.trim()}]` : '';
            return {
              ...asg,
              status: 'Returned',
              returnedDate: today,
              notes: `${asg.notes || ''}${returnNote}`.trim(),
            };
          }
          return asg;
        })
      );
      updatedAssignedTo = null;
    } else if (newStatus === 'In Stock' || newStatus === 'Disposed') {
      updatedAssignedTo = null;
    }

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const prevHistory = Array.isArray(a.statusHistory) ? a.statusHistory : [];
          return {
            ...a,
            status: newStatus,
            assignedTo: updatedAssignedTo,
            statusHistory: [historyEntry, ...prevHistory],
          };
        }
        return a;
      })
    );

    return { success: true };
  };

  // ==========================================
  // Assignment Operations
  // ==========================================
  const assignAsset = ({ assetId, employeeId, assignedDate = '', expectedReturnDate = '', notes = '' }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    const targetEmployee = employees.find((e) => e.id === employeeId);

    if (!targetAsset) return { success: false, error: 'Selected asset does not exist.' };
    if (!targetEmployee) return { success: false, error: 'Selected employee does not exist.' };

    if (targetEmployee.status !== 'Active') {
      return {
        success: false,
        error: `Cannot assign equipment to inactive employee (${targetEmployee.name}).`,
      };
    }

    // Prevent assigning already assigned asset
    if (targetAsset.status === 'Assigned' || targetAsset.status === 'In Use') {
      return {
        success: false,
        error: `Asset ${targetAsset.assetCode} is already assigned to ${targetAsset.assignedTo?.name || 'another employee'}.`,
      };
    }

    // Rule 3: Do not allow disposed or in-repair assets to be assigned
    if (targetAsset.status === 'Disposed') {
      return { success: false, error: 'Cannot assign a disposed asset.' };
    }

    if (targetAsset.status === 'In Repair') {
      return { success: false, error: 'Cannot assign an asset currently under maintenance / repair.' };
    }

    // Check if asset already has an active assignment record
    const hasActiveAssignment = assignments.some(
      (asg) => asg.assetId === assetId && asg.status === 'Active'
    );
    if (hasActiveAssignment) {
      return {
        success: false,
        error: `Asset ${targetAsset.assetCode} already has an active assignment in progress.`,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const checkoutDate = assignedDate || today;

    // Date logic check
    if (expectedReturnDate && expectedReturnDate < checkoutDate) {
      return {
        success: false,
        error: 'Expected return date cannot be earlier than checkout date.',
      };
    }

    const newAssignment = {
      id: `asg-${Date.now()}`,
      assetId,
      employeeId,
      assignedDate: checkoutDate,
      expectedReturnDate: expectedReturnDate || '',
      returnedDate: null,
      notes: notes.trim(),
      status: 'Active',
    };

    const historyEntry = createStatusHistoryEntry(
      targetAsset.status,
      'Assigned',
      notes.trim() || `Assigned to ${targetEmployee.name} (${targetEmployee.employeeCode})`,
      null
    );

    // 1. Update Asset to 'Assigned' and link employee, and append status history
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const prevHistory = Array.isArray(a.statusHistory) ? a.statusHistory : [];
          return {
            ...a,
            status: 'Assigned',
            assignedTo: {
              id: targetEmployee.id,
              name: targetEmployee.name,
              department: targetEmployee.department,
              email: targetEmployee.email,
            },
            statusHistory: [historyEntry, ...prevHistory],
          };
        }
        return a;
      })
    );

    // 2. Append new assignment
    setAssignments((prev) => [newAssignment, ...prev]);

    return { success: true, assignment: newAssignment };
  };

  const returnAsset = ({ assignmentId, returnedDate = '', returnNotes = '', returnStatus = 'Returned' }) => {
    const targetAssignment = assignments.find((asg) => asg.id === assignmentId);
    if (!targetAssignment) return { success: false, error: 'Assignment record not found.' };

    const targetAsset = assets.find((a) => a.id === targetAssignment.assetId);

    const actualReturnDate = returnedDate || new Date().toISOString().split('T')[0];

    // Date logic validation
    if (targetAssignment.assignedDate && actualReturnDate < targetAssignment.assignedDate) {
      return {
        success: false,
        error: `Return date (${actualReturnDate}) cannot be earlier than checkout date (${targetAssignment.assignedDate}).`,
      };
    }

    const nextAssetStatus = returnStatus === 'In Stock' ? 'In Stock' : 'Returned';

    const historyEntry = createStatusHistoryEntry(
      targetAsset?.status || 'Assigned',
      nextAssetStatus,
      returnNotes.trim() || `Equipment returned from custodian assignment (${nextAssetStatus})`,
      null
    );

    // 1. Mark Assignment as 'Returned'
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId) {
          const combinedNotes = returnNotes.trim()
            ? `${asg.notes ? asg.notes + ' | ' : ''}Return note: ${returnNotes.trim()}`
            : asg.notes;
          return {
            ...asg,
            status: 'Returned',
            returnedDate: actualReturnDate,
            notes: combinedNotes,
          };
        }
        return asg;
      })
    );

    // 2. Update Asset status to nextAssetStatus ('Returned' or 'In Stock') and clear assignedTo
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === targetAssignment.assetId) {
          const prevHistory = Array.isArray(a.statusHistory) ? a.statusHistory : [];
          return {
            ...a,
            status: nextAssetStatus,
            assignedTo: null,
            statusHistory: [historyEntry, ...prevHistory],
          };
        }
        return a;
      })
    );

    return { success: true };
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

  // Reset to initial mock data (for test/demonstration convenience)
  const resetToDefaults = () => {
    setAssets(MOCK_ASSETS);
    setCategories(MOCK_CATEGORIES);
    setEmployees(MOCK_EMPLOYEES);
    setAssignments(MOCK_ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  };

  const value = {
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
