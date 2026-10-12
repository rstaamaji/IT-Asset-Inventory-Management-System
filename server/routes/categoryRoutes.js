import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireFields } from '../middleware/validate.js';

import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Read operations: authenticated users (Admin & Staff)
router.get('/', requireAuth, getCategories);
router.get('/:id', requireAuth, getCategoryById);

// Write/Delete operations: Admin only
router.post('/', requireAuth, requireRole('Admin'), requireFields(['name']), createCategory);
router.put('/:id', requireAuth, requireRole('Admin'), updateCategory);
router.patch('/:id', requireAuth, requireRole('Admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteCategory);

export default router;
