const express = require('express');
const router = express.Router();
const {
  updateProgress,
  getMyProgress,
  getWeeklyProgress,
  getContributions,
} = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getMyProgress);
router.get('/weekly', authenticate, getWeeklyProgress);
router.get('/contributions', authenticate, getContributions);
router.get('/contributions/:studentId', authenticate, getContributions);
router.put('/:questionId', authenticate, updateProgress);

module.exports = router;
