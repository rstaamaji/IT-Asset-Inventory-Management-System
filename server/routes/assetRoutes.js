import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
} from '../controllers/assetController.js';

const router = express.Router();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.patch('/:id/status', updateAssetStatus);
router.put('/:id/status', updateAssetStatus);
router.put('/:id', updateAsset);
router.patch('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
