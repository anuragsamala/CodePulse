const prisma = require('../config/db');
const { logActivity } = require('../services/activityService');
const storageService = require('../services/storageService');

// Get all solutions for a specific question
const getSolutionsByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { language, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = { questionId };
    if (language && language !== 'All') {
      where.language = language;
    }

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, role: true, profileImage: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.solution.count({ where }),
    ]);

    return res.status(200).json({
      data: solutions,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch solutions', error: err.message });
  }
};

// Get all solutions by logged-in user
const getMySolutions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where: { userId: req.user.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          question: {
            select: { id: true, title: true, topic: true, difficulty: true, platform: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.solution.count({ where: { userId: req.user.id } }),
    ]);

    return res.status(200).json({
      data: solutions,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch my solutions', error: err.message });
  }
};

// Create solution for question
const createSolution = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { language, sourceCode, explanation, timeComplexity, spaceComplexity } = req.body;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let code = sourceCode;
    let fileUrl = null;

    if (req.file) {
      fileUrl = await storageService.saveFile(req.file);
      if (!code) {
        code = '// Uploaded file: ' + req.file.originalname;
      }
    }

    if (!code || !language) {
      return res.status(400).json({ message: 'Language and source code (or file) are required.' });
    }

    const solution = await prisma.solution.create({
      data: {
        questionId,
        userId: req.user.id,
        language: language.trim(),
        sourceCode: code,
        fileUrl,
        explanation: explanation ? explanation.trim() : null,
        timeComplexity: timeComplexity ? timeComplexity.trim() : null,
        spaceComplexity: spaceComplexity ? spaceComplexity.trim() : null,
      },
      include: {
        author: { select: { id: true, name: true, role: true, profileImage: true } },
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'SOLUTION_ADDED',
      questionId,
      solutionId: solution.id,
      metadata: { language: solution.language, questionTitle: question.title },
    });

    return res.status(201).json({
      message: 'Solution submitted successfully!',
      solution,
    });
  } catch (err) {
    console.error('createSolution error:', err);
    return res.status(500).json({ message: 'Failed to submit solution', error: err.message });
  }
};

// Update solution
const updateSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.solution.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    if (existing.userId !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to edit this solution' });
    }

    const { language, sourceCode, explanation, timeComplexity, spaceComplexity } = req.body;
    let fileUrl = existing.fileUrl;

    if (req.file) {
      if (existing.fileUrl) {
        await storageService.deleteFile(existing.fileUrl);
      }
      fileUrl = await storageService.saveFile(req.file);
    }

    const updated = await prisma.solution.update({
      where: { id },
      data: {
        ...(language ? { language: language.trim() } : {}),
        ...(sourceCode ? { sourceCode } : {}),
        ...(explanation !== undefined ? { explanation: explanation ? explanation.trim() : null } : {}),
        ...(timeComplexity !== undefined ? { timeComplexity: timeComplexity ? timeComplexity.trim() : null } : {}),
        ...(spaceComplexity !== undefined ? { spaceComplexity: spaceComplexity ? spaceComplexity.trim() : null } : {}),
        fileUrl,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'SOLUTION_UPDATED',
      questionId: updated.questionId,
      solutionId: updated.id,
      metadata: { language: updated.language },
    });

    return res.status(200).json({ message: 'Solution updated successfully', solution: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update solution', error: err.message });
  }
};

// Delete solution
const deleteSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.solution.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    if (existing.userId !== req.user.id && !['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to delete this solution' });
    }

    if (existing.fileUrl) {
      await storageService.deleteFile(existing.fileUrl);
    }

    await prisma.solution.delete({ where: { id } });

    return res.status(200).json({ message: 'Solution deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete solution', error: err.message });
  }
};

module.exports = {
  getSolutionsByQuestion,
  getMySolutions,
  createSolution,
  updateSolution,
  deleteSolution,
};
