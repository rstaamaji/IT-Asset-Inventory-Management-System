import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
} from '../controllers/assetController.js';

import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Read operations: authenticated users (Admin & Staff)
router.get('/', requireAuth, getAssets);
router.get('/:id', requireAuth, getAssetById);

// Lifecycle transition: authenticated users (Admin & Staff) can perform operational transitions
router.patch('/:id/status', requireAuth, updateAssetStatus);
router.put('/:id/status', requireAuth, updateAssetStatus);

// Management operations (create, update, delete): Admin only
router.post('/', requireAuth, requireRole('Admin'), createAsset);
router.put('/:id', requireAuth, requireRole('Admin'), updateAsset);
router.patch('/:id', requireAuth, requireRole('Admin'), updateAsset);
router.delete('/:id', requireAuth, requireRole('Admin'), deleteAsset);

export default router;
