const prisma = require('../config/db');
const { logActivity } = require('../services/activityService');

// Get questions with filters, search, sorting and server-side pagination
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      topic,
      difficulty,
      platform,
      sort = 'newest',
      visibility,
      creatorId,
      hasSolution,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};

    // Only creator or admin/mentor can see private questions
    if (req.user) {
      if (req.user.role === 'STUDENT') {
        where.OR = [
          { visibility: 'PUBLIC' },
          { createdById: req.user.id },
        ];
      }
    } else {
      where.visibility = 'PUBLIC';
    }

    if (creatorId) {
      where.createdById = creatorId;
    }

    if (topic && topic !== 'All') {
      where.topic = topic;
    }

    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    if (platform && platform !== 'All') {
      where.platform = platform;
    }

    if (hasSolution === 'true') {
      where.solutions = { some: {} };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { platform: { contains: q, mode: 'insensitive' } },
            { creator: { name: { contains: q, mode: 'insensitive' } } },
            { tags: { has: q } },
          ],
        },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'mostSolutions') orderBy = { solutions: { _count: 'desc' } };
    else if (sort === 'mostComments') orderBy = { comments: { _count: 'desc' } };
    else if (sort === 'recentlyUpdated') orderBy = { updatedAt: 'desc' };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true, profileImage: true },
          },
          _count: {
            select: { solutions: true, comments: true },
          },
          studentProgress: req.user
            ? {
                where: { studentId: req.user.id },
                select: { status: true, solvedAt: true, notes: true },
              }
            : false,
        },
      }),
      prisma.question.count({ where }),
    ]);

    const formatted = questions.map((q) => {
      const userProgress = q.studentProgress && q.studentProgress.length > 0
        ? q.studentProgress[0].status
        : 'NOT_STARTED';

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        topic: q.topic,
        difficulty: q.difficulty,
        platform: q.platform,
        problemUrl: q.problemUrl,
        tags: q.tags,
        visibility: q.visibility,
        createdById: q.createdById,
        creator: q.creator,
        solutionCount: q._count.solutions,
        commentCount: q._count.comments,
        personalStatus: userProgress,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });

    return res.status(200).json({
      data: formatted,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    console.error('getQuestions error:', err);
    return res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
};

// Duplicate detection check
const checkDuplicate = async (req, res) => {
  try {
    const { title, problemUrl, platform } = req.query;

    const duplicates = [];

    if (problemUrl && problemUrl.trim() !== '') {
      const byUrl = await prisma.question.findFirst({
        where: { problemUrl: problemUrl.trim() },
        include: { creator: { select: { name: true } } },
      });
      if (byUrl) duplicates.push({ reason: 'Identical problem URL found', question: byUrl });
    }

    if (title && title.trim() !== '') {
      const byTitle = await prisma.question.findMany({
        where: {
          title: { contains: title.trim(), mode: 'insensitive' },
          ...(platform ? { platform } : {}),
        },
        take: 3,
        include: { creator: { select: { name: true } } },
      });
      byTitle.forEach((q) => {
        if (!duplicates.some((d) => d.question.id === q.id)) {
          duplicates.push({ reason: 'Similar question title found', question: q });
        }
      });
    }

    return res.status(200).json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error checking duplicate question', error: err.message });
  }
};

// Get single question details with creator and personal progress
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true, profileImage: true },
        },
        _count: {
          select: { solutions: true, comments: true },
        },
        studentProgress: req.user
          ? {
              where: { studentId: req.user.id },
            }
          : false,
      },
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Access check for private questions
    if (
      question.visibility === 'PRIVATE' &&
      (!req.user || (req.user.id !== question.createdById && req.user.role === 'STUDENT'))
    ) {
      return res.status(403).json({ message: 'Access denied. Private question.' });
    }

    const personalProgress =
      question.studentProgress && question.studentProgress.length > 0
        ? question.studentProgress[0]
        : { status: 'NOT_STARTED', notes: null };

    return res.status(200).json({
      ...question,
      personalProgress,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch question', error: err.message });
  }
};

// Create Question
const createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty = 'EASY',
      platform,
      problemUrl,
      tags = [],
      visibility = 'PUBLIC',
      initialNotes,
    } = req.body;

    if (!title || !description || !topic || !platform) {
      return res.status(400).json({ message: 'Title, description, topic, and platform are required.' });
    }

    const formattedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        topic: topic.trim(),
        difficulty,
        platform: platform.trim(),
        problemUrl: problemUrl ? problemUrl.trim() : null,
        tags: formattedTags,
        visibility: visibility || 'PUBLIC',
        createdById: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    // Create initial progress record for creator if notes provided
    if (initialNotes) {
      await prisma.studentQuestionProgress.create({
        data: {
          studentId: req.user.id,
          questionId: question.id,
          status: 'NOT_STARTED',
          notes: initialNotes,
        },
      });
    }

    // Activity Log
    await logActivity({
      userId: req.user.id,
      action: 'QUESTION_CREATED',
      questionId: question.id,
      metadata: { title: question.title, topic: question.topic },
    });

    return res.status(201).json({
      message: 'Question created successfully!',
      question,
    });
  } catch (err) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
};

// Update Question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.question.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only creator, mentor, or admin can edit
    if (existing.createdById !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to update this question' });
    }

    const { title, description, topic, difficulty, platform, problemUrl, tags, visibility } = req.body;

    const formattedTags = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(topic ? { topic: topic.trim() } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(platform ? { platform: platform.trim() } : {}),
        ...(problemUrl !== undefined ? { problemUrl: problemUrl ? problemUrl.trim() : null } : {}),
        ...(formattedTags !== undefined ? { tags: formattedTags } : {}),
        ...(visibility ? { visibility } : {}),
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'QUESTION_UPDATED',
      questionId: id,
      metadata: { title: updated.title },
    });

    return res.status(200).json({ message: 'Question updated successfully', question: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update question', error: err.message });
  }
};

// Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.question.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (existing.createdById !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to delete this question' });
    }

    await prisma.question.delete({ where: { id } });

    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
};

module.exports = {
  getQuestions,
  checkDuplicate,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
