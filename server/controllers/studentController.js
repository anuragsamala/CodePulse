const prisma = require('../config/db');
const { calculateStreak } = require('../services/streakService');

// List students for Mentor/Admin
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = { role: 'STUDENT' };
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [students, total, totalPublicQuestions] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          createdAt: true,
          progressRecords: {
            select: { status: true, lastUpdatedAt: true },
          },
          activities: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.question.count({ where: { visibility: 'PUBLIC' } }),
    ]);

    const formatted = await Promise.all(
      students.map(async (st) => {
        const solvedCount = st.progressRecords.filter((p) => p.status === 'SOLVED').length;
        const inProgressCount = st.progressRecords.filter((p) => p.status === 'IN_PROGRESS').length;
        const progressPct = totalPublicQuestions > 0 ? Math.round((solvedCount / totalPublicQuestions) * 100) : 0;
        const streaks = await calculateStreak(st.id);
        const lastActive = st.activities.length > 0 ? st.activities[0].createdAt : st.createdAt;

        return {
          id: st.id,
          name: st.name,
          email: st.email,
          profileImage: st.profileImage,
          createdAt: st.createdAt,
          solved: solvedCount,
          inProgress: inProgressCount,
          progressPercentage: progressPct,
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
          lastActive,
          status: streaks.currentStreak > 0 ? 'Active' : 'Inactive',
        };
      })
    );

    return res.status(200).json({
      data: formatted,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
};

// Detailed student analytics for Mentor/Admin
const getStudentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const totalPublicQuestions = await prisma.question.count({ where: { visibility: 'PUBLIC' } });

    const progressRecords = await prisma.studentQuestionProgress.findMany({
      where: { studentId: id },
      include: {
        question: {
          select: { id: true, title: true, topic: true, difficulty: true, platform: true },
        },
      },
      orderBy: { lastUpdatedAt: 'desc' },
    });

    let solved = 0;
    let inProgress = 0;
    const difficultyDistribution = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const topicStats = {};

    progressRecords.forEach((pr) => {
      if (pr.status === 'SOLVED') {
        solved++;
        difficultyDistribution[pr.question.difficulty] =
          (difficultyDistribution[pr.question.difficulty] || 0) + 1;
        topicStats[pr.question.topic] = (topicStats[pr.question.topic] || 0) + 1;
      } else if (pr.status === 'IN_PROGRESS') {
        inProgress++;
      }
    });

    const notStarted = Math.max(0, totalPublicQuestions - solved - inProgress);
    const completionRate = totalPublicQuestions > 0 ? Math.round((solved / totalPublicQuestions) * 100) : 0;
    const streaks = await calculateStreak(id);

    // Recent activity log
    const recentActivities = await prisma.activity.findMany({
      where: { userId: id },
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        question: { select: { id: true, title: true } },
        solution: { select: { id: true, language: true } },
      },
    });

    // Recent solutions submitted by student
    const studentSolutions = await prisma.solution.findMany({
      where: { userId: id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        question: { select: { id: true, title: true, topic: true, difficulty: true } },
      },
    });

    return res.status(200).json({
      student,
      metrics: {
        totalQuestions: totalPublicQuestions,
        solved,
        inProgress,
        notStarted,
        completionRate,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
      },
      difficultyDistribution,
      topicStats,
      recentActivities,
      solutions: studentSolutions,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch student analytics', error: err.message });
  }
};

// Mentor Dashboard aggregate stats
const getMentorDashboardMetrics = async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Active students today based on activity
    const activeTodayGroup = await prisma.activity.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOfToday } },
    });
    const activeToday = activeTodayGroup.length;

    // Questions solved today
    const questionsSolvedToday = await prisma.studentQuestionProgress.count({
      where: {
        status: 'SOLVED',
        solvedAt: { gte: startOfToday },
      },
    });

    // Solutions submitted today
    const solutionsSubmittedToday = await prisma.solution.count({
      where: { createdAt: { gte: startOfToday } },
    });

    // Average student progress
    const totalQuestions = await prisma.question.count({ where: { visibility: 'PUBLIC' } });
    const allProgress = await prisma.studentQuestionProgress.findMany({
      where: { status: 'SOLVED' },
      select: { studentId: true },
    });

    const solvedPerStudent = {};
    allProgress.forEach((p) => {
      solvedPerStudent[p.studentId] = (solvedPerStudent[p.studentId] || 0) + 1;
    });

    let avgProgress = 0;
    if (totalStudents > 0 && totalQuestions > 0) {
      const sumProgress = Object.values(solvedPerStudent).reduce((a, b) => a + b, 0);
      avgProgress = Math.round((sumProgress / (totalStudents * totalQuestions)) * 100);
    }

    // Students needing attention: 0 active streak or inactive for 3+ days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const activeRecently = await prisma.activity.findMany({
      where: { createdAt: { gte: threeDaysAgo } },
      select: { userId: true },
      distinct: ['userId'],
    });
    const activeSet = new Set(activeRecently.map((a) => a.userId));
    const studentsNeedingAttention = Math.max(0, totalStudents - activeSet.size);

    return res.status(200).json({
      totalStudents,
      activeToday,
      questionsSolvedToday,
      solutionsSubmittedToday,
      averageStudentProgress: avgProgress,
      studentsNeedingAttention,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch mentor dashboard stats', error: err.message });
  }
};

module.exports = {
  getStudents,
  getStudentAnalytics,
  getMentorDashboardMetrics,
};
