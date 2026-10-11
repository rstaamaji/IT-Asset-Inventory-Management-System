import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  returnAssignment,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.post('/:id/return', returnAssignment);
router.patch('/:id/return', returnAssignment);

export default router;
