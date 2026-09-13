const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAssignments);
router.post('/', authenticate, authorize('MENTOR', 'ADMIN'), createAssignment);
router.put('/:id', authenticate, updateAssignment);
router.delete('/:id', authenticate, authorize('MENTOR', 'ADMIN'), deleteAssignment);

module.exports = router;
