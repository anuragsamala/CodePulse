const prisma = require('../config/db');

// Global community activity feed
const getCommunityFeed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const take = Math.max(1, Math.min(50, parseInt(limit, 10)));

    const activities = await prisma.activity.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, role: true, profileImage: true },
        },
        question: {
          select: { id: true, title: true, topic: true, difficulty: true },
        },
        solution: {
          select: { id: true, language: true },
        },
      },
    });

    return res.status(200).json({ activities });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch community feed', error: err.message });
  }
};

module.exports = {
  getCommunityFeed,
};
