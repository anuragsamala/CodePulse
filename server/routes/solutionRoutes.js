const express = require('express');
const router = express.Router();
const {
  getSolutionsByQuestion,
  getMySolutions,
  createSolution,
  updateSolution,
  deleteSolution,
} = require('../controllers/solutionController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/my', authenticate, getMySolutions);
router.get('/question/:questionId', getSolutionsByQuestion);
router.post('/question/:questionId', authenticate, upload.single('solutionFile'), createSolution);
router.put('/:id', authenticate, upload.single('solutionFile'), updateSolution);
router.delete('/:id', authenticate, deleteSolution);

module.exports = router;
