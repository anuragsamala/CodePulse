const prisma = require('../config/db');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (role && role !== 'All') {
      where.role = role;
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
          createdAt: true,
          _count: {
            select: { createdQuestions: true, solutions: true, comments: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      data: users,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'MENTOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(200).json({ message: 'User role updated successfully', user: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Global Admin Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalSolutions,
      totalComments,
      totalAssignments,
      roleDistribution,
      topicDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.solution.count(),
      prisma.comment.count(),
      prisma.assignment.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.question.groupBy({ by: ['topic'], _count: { id: true } }),
    ]);

    return res.status(200).json({
      totalUsers,
      totalQuestions,
      totalSolutions,
      totalComments,
      totalAssignments,
      roleDistribution,
      topicDistribution,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch admin analytics', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminAnalytics,
};
