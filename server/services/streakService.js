const prisma = require('../config/db');

// Calculate streaks based on unique active days from activity logs & solved records
const calculateStreak = async (userId) => {
  const [activities, progressRecords] = await Promise.all([
    prisma.activity.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentQuestionProgress.findMany({
      where: { userId: undefined, studentId: userId, status: 'SOLVED' },
      select: { solvedAt: true },
    })
  ]);

  const toLocalDateStr = (dateObj) => {
    if (!dateObj) return null;
    const d = new Date(dateObj);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const daySet = new Set();
  activities.forEach((a) => {
    const s = toLocalDateStr(a.createdAt);
    if (s) daySet.add(s);
  });
  progressRecords.forEach((p) => {
    const s = toLocalDateStr(p.solvedAt);
    if (s) daySet.add(s);
  });

  if (!daySet.size) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDays = Array.from(daySet).sort().reverse(); // newest first

  const now = new Date();
  const todayStr = toLocalDateStr(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toLocalDateStr(yesterdayDate);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check current streak: active today or yesterday
  if (sortedDays.includes(todayStr) || sortedDays.includes(yesterdayStr)) {
    let checkDate = sortedDays.includes(todayStr) ? new Date(now) : new Date(yesterdayDate);
    
    while (true) {
      const dateStr = toLocalDateStr(checkDate);
      if (daySet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded days
  const chronologicalDays = Array.from(daySet).sort();
  for (let i = 0; i < chronologicalDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(chronologicalDays[i - 1]);
      const curr = new Date(chronologicalDays[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return { currentStreak, longestStreak: Math.max(currentStreak, longestStreak) };
};

module.exports = {
  calculateStreak,
};
