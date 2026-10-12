import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  returnAssignment,
} from '../controllers/assignmentController.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Both Admin and Staff can view, create assignment, and return assignment
router.get('/', requireAuth, getAssignments);
router.get('/:id', requireAuth, getAssignmentById);
router.post('/', requireAuth, createAssignment);
router.post('/:id/return', requireAuth, returnAssignment);
router.patch('/:id/return', requireAuth, returnAssignment);

export default router;
