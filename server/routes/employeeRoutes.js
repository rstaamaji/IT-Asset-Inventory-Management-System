import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';

import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Read operations: authenticated users (Admin & Staff)
router.get('/', requireAuth, getEmployees);
router.get('/:id', requireAuth, getEmployeeById);

// Write/Delete operations: Admin only
router.post('/', requireAuth, requireRole('Admin'), createEmployee);
router.put('/:id', requireAuth, requireRole('Admin'), updateEmployee);
router.patch('/:id', requireAuth, requireRole('Admin'), updateEmployee);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteEmployee);

export default router;
