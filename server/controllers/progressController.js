const prisma = require('../config/db');
const { logActivity } = require('../services/activityService');
const { calculateStreak } = require('../services/streakService');

// Update or set personal progress for a question
const updateProgress = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { status, notes } = req.body;

    if (!['NOT_STARTED', 'IN_PROGRESS', 'SOLVED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid progress status' });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const now = new Date();

    const existingProgress = await prisma.studentQuestionProgress.findUnique({
      where: {
        studentId_questionId: {
          studentId: req.user.id,
          questionId,
        },
      },
    });

    let firstAttemptedAt = existingProgress ? existingProgress.firstAttemptedAt : null;
    let solvedAt = existingProgress ? existingProgress.solvedAt : null;

    if (status === 'IN_PROGRESS' && !firstAttemptedAt) {
      firstAttemptedAt = now;
    }

    if (status === 'SOLVED') {
      solvedAt = now;
      if (!firstAttemptedAt) firstAttemptedAt = now;
    } else if (status === 'NOT_STARTED' || status === 'IN_PROGRESS') {
      solvedAt = null;
    }

    const progress = await prisma.studentQuestionProgress.upsert({
      where: {
        studentId_questionId: {
          studentId: req.user.id,
          questionId,
        },
      },
      update: {
        status,
        firstAttemptedAt: status === 'NOT_STARTED' ? null : (firstAttemptedAt || now),
        solvedAt: status === 'SOLVED' ? (solvedAt || now) : null,
        lastUpdatedAt: now,
        notes: notes !== undefined ? notes : (existingProgress ? existingProgress.notes : null),
      },
      create: {
        studentId: req.user.id,
        questionId,
        status,
        firstAttemptedAt: status !== 'NOT_STARTED' ? now : null,
        solvedAt: status === 'SOLVED' ? now : null,
        lastUpdatedAt: now,
        notes: notes || null,
      },
    });

    if (status === 'SOLVED') {
      await prisma.assignment.updateMany({
        where: {
          studentId: req.user.id,
          questionId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        },
        data: { status: 'COMPLETED' },
      });
    } else if (status === 'IN_PROGRESS') {
      await prisma.assignment.updateMany({
        where: {
          studentId: req.user.id,
          questionId,
          status: 'ASSIGNED',
        },
        data: { status: 'IN_PROGRESS' },
      });
    }

    const actionType = status === 'SOLVED' ? 'QUESTION_SOLVED' : (status === 'IN_PROGRESS' ? 'QUESTION_ATTEMPTED' : 'QUESTION_UPDATED');
    await logActivity({
      userId: req.user.id,
      action: actionType,
      questionId,
      metadata: { status, questionTitle: question.title },
    });

    return res.status(200).json({
      message: 'Progress updated to ' + status,
      progress,
    });
  } catch (err) {
    console.error('updateProgress error:', err);
    return res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const totalQuestionsCount = await prisma.question.count({
      where: { visibility: 'PUBLIC' },
    });

    const progressRecords = await prisma.studentQuestionProgress.findMany({
      where: { studentId },
      include: {
        question: {
          select: { id: true, title: true, topic: true, difficulty: true, platform: true },
        },
      },
    });

    let solved = 0;
    let inProgress = 0;
    let notStarted = 0;

    const topicStats = {};
    const difficultyStats = { EASY: { total: 0, solved: 0 }, MEDIUM: { total: 0, solved: 0 }, HARD: { total: 0, solved: 0 } };

    progressRecords.forEach((pr) => {
      if (pr.status === 'SOLVED') solved++;
      else if (pr.status === 'IN_PROGRESS') inProgress++;
      else notStarted++;

      const t = pr.question.topic;
      if (!topicStats[t]) topicStats[t] = { total: 0, solved: 0 };
      topicStats[t].total++;
      if (pr.status === 'SOLVED') topicStats[t].solved++;

      const diff = pr.question.difficulty;
      if (difficultyStats[diff]) {
        difficultyStats[diff].total++;
        if (pr.status === 'SOLVED') difficultyStats[diff].solved++;
      }
    });

    const allQuestions = await prisma.question.findMany({
      where: { visibility: 'PUBLIC' },
      select: { topic: true, difficulty: true },
    });

    const topicBreakdown = {};
    allQuestions.forEach((q) => {
      if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { total: 0, solved: 0 };
      topicBreakdown[q.topic].total++;
    });

    progressRecords.forEach((pr) => {
      if (pr.status === 'SOLVED' && topicBreakdown[pr.question.topic]) {
        topicBreakdown[pr.question.topic].solved++;
      }
    });

    const calculatedNotStarted = Math.max(0, totalQuestionsCount - solved - inProgress);
    const streaks = await calculateStreak(studentId);

    // Today's solved count in local calendar day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySolvedCount = await prisma.studentQuestionProgress.count({
      where: {
        studentId,
        status: 'SOLVED',
        solvedAt: { gte: startOfToday },
      },
    });

    return res.status(200).json({
      totalQuestions: totalQuestionsCount,
      solved,
      inProgress,
      notStarted: calculatedNotStarted,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      todaySolved: todaySolvedCount,
      todayGoal: 5,
      topicBreakdown,
      difficultyStats,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch progress metrics', error: err.message });
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const now = new Date();

    // Determine current week Monday 00:00:00
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sundayEnd = new Date(monday);
    sundayEnd.setDate(monday.getDate() + 7);

    const solvedRecords = await prisma.studentQuestionProgress.findMany({
      where: {
        studentId,
        status: 'SOLVED',
        solvedAt: {
          gte: monday,
          lt: sundayEnd,
        },
      },
      select: { solvedAt: true },
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result = days.map((dayName) => ({ day: dayName, solved: 0 }));

    solvedRecords.forEach((rec) => {
      if (rec.solvedAt) {
        const d = new Date(rec.solvedAt);
        const dayIdx = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        if (result[dayIdx]) {
          result[dayIdx].solved++;
        }
      }
    });

    return res.status(200).json({ weeklyData: result });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch weekly progress', error: err.message });
  }
};

const getContributions = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

    const [activities, progressRecords, questionsCount, solutionsCount, commentsCount] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: studentId,
          createdAt: { gte: oneYearAgo },
        },
        select: { createdAt: true, action: true },
      }),
      prisma.studentQuestionProgress.findMany({
        where: {
          studentId,
          solvedAt: { gte: oneYearAgo },
        },
        select: { solvedAt: true },
      }),
      prisma.question.count({ where: { createdById: studentId } }),
      prisma.solution.count({ where: { userId: studentId } }),
      prisma.comment.count({ where: { userId: studentId } }),
    ]);

    const dayCounts = {};

    // Map activities to YYYY-MM-DD in local time
    activities.forEach((act) => {
      const d = new Date(act.createdAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });

    // Also ensure any solved questions are captured on heatmap
    progressRecords.forEach((pr) => {
      if (pr.solvedAt) {
        const d = new Date(pr.solvedAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        if (!dayCounts[key]) {
          dayCounts[key] = 1;
        }
      }
    });

    return res.status(200).json({
      summary: {
        questionsAdded: questionsCount,
        solutionsAdded: solutionsCount,
        commentsAdded: commentsCount,
        totalContributions: activities.length,
      },
      heatmap: dayCounts,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch contribution data', error: err.message });
  }
};

module.exports = {
  updateProgress,
  getMyProgress,
  getWeeklyProgress,
  getContributions,
};
