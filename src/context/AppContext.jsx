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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Initial State from localStorage (or fallback mock data)
  const [assets, setAssets] = useState(() => loadStorage(STORAGE_KEYS.ASSETS, MOCK_ASSETS));
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
    const newAsset = {
      ...assetData,
      id: assetData.id || `ast-${Date.now()}`,
    };
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const updateAsset = (assetData) => {
    setAssets((prev) => prev.map((a) => (a.id === assetData.id ? assetData : a)));
  };

  const deleteAsset = (assetId) => {
    // Remove asset and any linked assignments
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    setAssignments((prev) => prev.filter((asg) => asg.assetId !== assetId));
  };

  /**
   * Transition Asset Status with lifecycle validation rules:
   * Statuses: 'In Stock' | 'Assigned' | 'In Use' | 'In Repair' | 'Returned' | 'Disposed'
   */
  const transitionAssetStatus = (assetId, newStatus, reason = '') => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return { success: false, error: 'Asset not found' };

    const currentStatus = targetAsset.status;

    // Disposed is a terminal state
    if (currentStatus === 'Disposed') {
      return { success: false, error: 'Cannot transition from Disposed state. Asset has been permanently retired.' };
    }

    // Handle side effects of status transitions
    let updatedAssignedTo = targetAsset.assignedTo;

    if (newStatus === 'In Stock') {
      // Returning to inventory clears assignee
      updatedAssignedTo = null;

      // Close any active assignment for this asset
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.assetId === assetId && asg.status === 'Active') {
            return {
              ...asg,
              status: 'Returned',
              returnedDate: new Date().toISOString().split('T')[0],
              notes: reason ? `${asg.notes || ''} [${reason}]`.trim() : asg.notes,
            };
          }
          return asg;
        })
      );
    } else if (newStatus === 'In Repair' || newStatus === 'Disposed') {
      // If sent for repair or disposed while assigned, close active assignment
      if (updatedAssignedTo) {
        setAssignments((prev) =>
          prev.map((asg) => {
            if (asg.assetId === assetId && asg.status === 'Active') {
              return {
                ...asg,
                status: 'Returned',
                returnedDate: new Date().toISOString().split('T')[0],
                notes: `Asset marked as ${newStatus}. ${reason}`.trim(),
              };
            }
            return asg;
          })
        );
      }
    }

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            status: newStatus,
            assignedTo: newStatus === 'In Stock' || newStatus === 'Disposed' ? null : updatedAssignedTo,
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
  const assignAsset = ({ assetId, employeeId, expectedReturnDate = '', notes = '' }) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    const targetEmployee = employees.find((e) => e.id === employeeId);

    if (!targetAsset) return { success: false, error: 'Selected asset does not exist.' };
    if (!targetEmployee) return { success: false, error: 'Selected employee does not exist.' };

    // Prevent assigning already assigned asset
    if (targetAsset.status === 'Assigned' || targetAsset.status === 'In Use') {
      return {
        success: false,
        error: `Asset ${targetAsset.assetCode} is already assigned to ${targetAsset.assignedTo?.name || 'another employee'}.`,
      };
    }

    if (targetAsset.status === 'Disposed') {
      return { success: false, error: 'Cannot assign a disposed asset.' };
    }

    if (targetAsset.status === 'In Repair') {
      return { success: false, error: 'Cannot assign an asset currently under repair.' };
    }

    const today = new Date().toISOString().split('T')[0];
    const newAssignment = {
      id: `asg-${Date.now()}`,
      assetId,
      employeeId,
      assignedDate: today,
      expectedReturnDate: expectedReturnDate || '',
      returnedDate: null,
      notes: notes.trim(),
      status: 'Active',
    };

    // 1. Update Asset to 'Assigned' and link employee
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            status: 'Assigned',
            assignedTo: {
              id: targetEmployee.id,
              name: targetEmployee.name,
              department: targetEmployee.department,
              email: targetEmployee.email,
            },
          };
        }
        return a;
      })
    );

    // 2. Append new assignment
    setAssignments((prev) => [newAssignment, ...prev]);

    return { success: true, assignment: newAssignment };
  };

  const returnAsset = ({ assignmentId, returnedDate = '', returnNotes = '' }) => {
    const targetAssignment = assignments.find((asg) => asg.id === assignmentId);
    if (!targetAssignment) return { success: false, error: 'Assignment record not found.' };

    const actualReturnDate = returnedDate || new Date().toISOString().split('T')[0];

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

    // 2. Update Asset status to 'In Stock' and clear assignedTo
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === targetAssignment.assetId) {
          return {
            ...a,
            status: 'In Stock',
            assignedTo: null,
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
        activeAssetIds.has(a.id) ||
        (a.assignedTo &&
          (a.assignedTo.id === employeeId ||
            a.assignedTo.name === employee.name ||
            a.assignedTo.email === employee.email))
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
