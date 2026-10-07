/**
 * Mock Assignments Dataset
 * 
 * Fields:
 * - id: unique assignment record identifier
 * - assetId: ID of assigned asset
 * - employeeId: ID of receiving employee
 * - assignedDate: date asset was checked out (YYYY-MM-DD)
 * - expectedReturnDate: anticipated return date (YYYY-MM-DD or '')
 * - returnedDate: actual return date if returned (YYYY-MM-DD or null)
 * - notes: operational comments / justification
 * - status: 'Active' | 'Returned'
 */

export const MOCK_ASSIGNMENTS = [
  {
    id: 'asg-001',
    assetId: 'ast-001',
    employeeId: 'emp-001',
    assignedDate: '2024-02-20',
    expectedReturnDate: '2025-02-20',
    returnedDate: null,
    notes: 'Primary engineering laptop deployment.',
    status: 'Active',
  },
  {
    id: 'asg-002',
    assetId: 'ast-002',
    employeeId: 'emp-002',
    assignedDate: '2024-05-15',
    expectedReturnDate: '2025-05-15',
    returnedDate: null,
    notes: 'Design workstation for product design studio.',
    status: 'Active',
  },
  {
    id: 'asg-003',
    assetId: 'ast-007',
    employeeId: 'emp-003',
    assignedDate: '2023-10-10',
    expectedReturnDate: '2025-10-10',
    returnedDate: null,
    notes: 'Executive corporate device assignment.',
    status: 'Active',
  },
  {
    id: 'asg-004',
    assetId: 'ast-008',
    employeeId: 'emp-004',
    assignedDate: '2022-06-20',
    expectedReturnDate: '2025-06-20',
    returnedDate: null,
    notes: 'Reception desk primary terminal.',
    status: 'Active',
  },
  {
    id: 'asg-005',
    assetId: 'ast-014',
    employeeId: 'emp-005',
    assignedDate: '2024-03-25',
    expectedReturnDate: '2026-03-25',
    returnedDate: null,
    notes: 'Field sales communication smartphone.',
    status: 'Active',
  },
  {
    id: 'asg-006',
    assetId: 'ast-010',
    employeeId: 'emp-006',
    assignedDate: '2023-08-15',
    expectedReturnDate: '2024-08-15',
    returnedDate: '2024-08-10',
    notes: 'Returned following remote work project completion.',
    status: 'Returned',
  },
  {
    id: 'asg-007',
    assetId: 'ast-016',
    employeeId: 'emp-007',
    assignedDate: '2023-07-25',
    expectedReturnDate: '2024-07-25',
    returnedDate: '2024-07-20',
    notes: 'Returned to storage pool after lab restructuring.',
    status: 'Returned',
  },
];
