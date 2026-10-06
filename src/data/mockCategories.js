/**
 * Reusable IT Asset Categories Data Definition & Mock Dataset
 * 
 * Field Specifications:
 * - id: unique internal identifier
 * - name: category title (e.g., 'Laptop', 'Desktop', 'Server')
 * - description: detailed scope and equipment policy description
 * - createdAt: ISO date string (YYYY-MM-DD)
 */

export const MOCK_CATEGORIES = [
  {
    id: 'cat-001',
    name: 'Laptop',
    description: 'Portable computing devices, ultrabooks, notebooks, and mobile workstations issued to personnel.',
    createdAt: '2024-01-10',
  },
  {
    id: 'cat-002',
    name: 'Desktop',
    description: 'Stationary office workstations, tower chassis, mini micro-PCs, and all-in-one computing units.',
    createdAt: '2024-01-10',
  },
  {
    id: 'cat-003',
    name: 'Monitor',
    description: 'External visual display panels, 4K productivity screens, and ultrawide presentation monitors.',
    createdAt: '2024-01-12',
  },
  {
    id: 'cat-004',
    name: 'Printer',
    description: 'Multifunction network copiers, desktop laser printers, barcode thermal printers, and scanners.',
    createdAt: '2024-01-15',
  },
  {
    id: 'cat-005',
    name: 'Smartphone',
    description: 'Corporate mobile phones, executive smartphones, and company-managed cellular tablets.',
    createdAt: '2024-01-18',
  },
  {
    id: 'cat-006',
    name: 'Server',
    description: 'Enterprise rackmount servers, hypervisors, blade chassis, and on-premises compute nodes.',
    createdAt: '2024-01-20',
  },
  {
    id: 'cat-007',
    name: 'Router',
    description: 'Core routers, managed network switches, edge gateways, Wi-Fi access points, and firewalls.',
    createdAt: '2024-01-22',
  },
  {
    id: 'cat-008',
    name: 'Keyboard',
    description: 'Ergonomic input keyboards, wireless keyboards, and specialized mechanical typing peripherals.',
    createdAt: '2024-02-01',
  },
  {
    id: 'cat-009',
    name: 'Mouse',
    description: 'Precision optical mice, wireless Bluetooth trackballs, and ergonomic pointing peripherals.',
    createdAt: '2024-02-01',
  },
  {
    id: 'cat-010',
    name: 'Other',
    description: 'Power distribution units (PDU), uninterrupted power supplies (UPS), docking hubs, and AV equipment.',
    createdAt: '2024-02-05',
  },
];
