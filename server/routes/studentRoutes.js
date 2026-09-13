const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentAnalytics,
  getMentorDashboardMetrics,
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard-metrics', authenticate, authorize('MENTOR', 'ADMIN'), getMentorDashboardMetrics);
// Allow Students, Mentors, and Admins to view students directory and individual progress analytics
router.get('/', authenticate, getStudents);
router.get('/:id', authenticate, getStudentAnalytics);

module.exports = router;