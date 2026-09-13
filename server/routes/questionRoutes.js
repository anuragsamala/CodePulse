const express = require('express');
const router = express.Router();
const {
  getQuestions,
  checkDuplicate,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');

// Optional auth for reading questions to show personal status if logged in
const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return next();
  try {
    const { verifyToken } = require('../utils/jwt');
    const prisma = require('../config/db');
    const decoded = verifyToken(token);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, role: true },
    });
  } catch (err) {
    // Ignore invalid token on optional route
  }
  next();
};

router.get('/', optionalAuth, getQuestions);
router.get('/check-duplicate', checkDuplicate);
router.get('/:id', optionalAuth, getQuestionById);
router.post('/', authenticate, createQuestion);
router.put('/:id', authenticate, updateQuestion);
router.delete('/:id', authenticate, deleteQuestion);

module.exports = router;
