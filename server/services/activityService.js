const prisma = require('../config/db');

const logActivity = async ({ userId, action, questionId = null, solutionId = null, metadata = null }) => {
  try {
    return await prisma.activity.create({
      data: {
        userId,
        action,
        questionId,
        solutionId,
        metadata,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = {
  logActivity,
};
