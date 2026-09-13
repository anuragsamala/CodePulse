const prisma = require('../config/db');
const { logActivity } = require('../services/activityService');

const getComments = async (req, res) => {
  try {
    const { questionId, solutionId } = req.query;
    if (!questionId && !solutionId) {
      return res.status(400).json({ message: 'Must provide either questionId or solutionId' });
    }

    const where = {};
    if (questionId) where.questionId = questionId;
    if (solutionId) where.solutionId = solutionId;

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
      },
    });

    return res.status(200).json({ comments });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { questionId, solutionId, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    if (!questionId && !solutionId) {
      return res.status(400).json({ message: 'Must provide either questionId or solutionId' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: req.user.id,
        questionId: questionId || null,
        solutionId: solutionId || null,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'COMMENT_ADDED',
      questionId: questionId || null,
      solutionId: solutionId || null,
      metadata: { snippet: content.substring(0, 40) },
    });

    return res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content cannot be empty' });
    }

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existing.userId !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to edit this comment' });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        user: { select: { id: true, name: true, role: true, profileImage: true } },
      },
    });

    return res.status(200).json({ message: 'Comment updated successfully', comment: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update comment', error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.comment.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (existing.userId !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id } });

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
