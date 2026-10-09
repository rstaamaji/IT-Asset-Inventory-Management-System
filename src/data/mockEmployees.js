/**
 * Mock Employees Dataset
 * 
 * Fields:
 * - id: unique identifier
 * - employeeCode: unique workforce code (e.g., EMP-101)
 * - name: full name
 * - email: corporate email
 * - department: IT | Finance | HR | Operations | Marketing | Management
 * - position: job title
 * - location: physical work office / building
 * - phone: contact number
 * - status: Active | Inactive
 */

export const EMPLOYEE_DEPARTMENTS = [
  'IT',
  'Engineering',
  'Finance',
  'HR',
  'Operations',
  'Marketing',
  'Sales',
  'Management',
];

export const EMPLOYEE_STATUSES = ['Active', 'Inactive'];

export const MOCK_EMPLOYEES = [
  {
    id: 'emp-001',
    employeeCode: 'EMP-101',
    name: 'Michael Scott',
    email: 'm.scott@company.internal',
    department: 'Management',
    position: 'Regional Director',
    location: 'HQ - Floor 3',
    phone: '+1 (555) 019-2831',
    status: 'Active',
    joinedDate: '2023-01-15',
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP-102',
    name: 'Sarah Connor',
    email: 's.connor@company.internal',
    department: 'Engineering',
    position: 'Lead Systems Architect',
    location: 'HQ - Floor 4',
    phone: '+1 (555) 019-3342',
    status: 'Active',
    joinedDate: '2023-03-20',
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP-103',
    name: 'Eleanor Vance',
    email: 'e.vance@company.internal',
    department: 'Management',
    position: 'VP of Technology Operations',
    location: 'HQ - Floor 5',
    phone: '+1 (555) 019-4920',
    status: 'Active',
    joinedDate: '2022-11-01',
  },
  {
    id: 'emp-004',
    employeeCode: 'EMP-104',
    name: 'Pam Beesly',
    email: 'p.beesly@company.internal',
    department: 'Operations',
    position: 'Operations Coordinator',
    location: 'Reception / Level 1',
    phone: '+1 (555) 019-5819',
    status: 'Active',
    joinedDate: '2023-06-12',
  },
  {
    id: 'emp-005',
    employeeCode: 'EMP-105',
    name: 'Dwight Schrute',
    email: 'd.schrute@company.internal',
    department: 'Sales',
    position: 'Senior Account Manager',
    location: 'Branch Office - Chicago',
    phone: '+1 (555) 019-6721',
    status: 'Active',
    joinedDate: '2022-08-15',
  },
  {
    id: 'emp-006',
    employeeCode: 'EMP-106',
    name: 'Rachel Green',
    email: 'r.green@company.internal',
    department: 'Marketing',
    position: 'Product Marketing Lead',
    location: 'HQ - Floor 4',
    phone: '+1 (555) 019-7812',
    status: 'Active',
    joinedDate: '2023-09-01',
  },
  {
    id: 'emp-007',
    employeeCode: 'EMP-107',
    name: 'David Miller',
    email: 'd.miller@company.internal',
    department: 'IT',
    position: 'DevOps & Cloud Engineer',
    location: 'Data Center - Bay 2',
    phone: '+1 (555) 019-8923',
    status: 'Active',
    joinedDate: '2023-10-18',
  },
  {
    id: 'emp-008',
    employeeCode: 'EMP-108',
    name: 'Angela Martin',
    email: 'a.martin@company.internal',
    department: 'Finance',
    position: 'Financial Controller',
    location: 'HQ - Floor 2',
    phone: '+1 (555) 019-9012',
    status: 'Active',
    joinedDate: '2022-04-10',
  },
  {
    id: 'emp-009',
    employeeCode: 'EMP-109',
    name: 'Toby Flenderson',
    email: 't.flenderson@company.internal',
    department: 'HR',
    position: 'HR Compliance Officer',
    location: 'HQ - Floor 2',
    phone: '+1 (555) 019-1294',
    status: 'Inactive',
    joinedDate: '2022-01-10',
  },
  {
    id: 'emp-010',
    employeeCode: 'EMP-110',
    name: 'Alex Morgan',
    email: 'a.morgan@company.internal',
    department: 'IT',
    position: 'Infrastructure Specialist',
    location: 'HQ - Floor 4',
    phone: '+1 (555) 019-4829',
    status: 'Active',
    joinedDate: '2024-02-01',
  },
];
