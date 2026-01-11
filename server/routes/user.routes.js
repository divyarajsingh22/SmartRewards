const express = require('express');
const router = express.Router();

router.get('/wallet', async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const User = require('../models/User');
    const GameSession = require('../models/GameSession');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySession = await GameSession.findOne({
      userId,
      gameMode: 'dailyRush',
      createdAt: { $gte: today }
    });

    const last5Games = await GameSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const todayEarnings = todaySession ? todaySession.tokensEarned : 0;

    res.json({
      totalTokens: user.tokens,
      todayEarnings,
      lastGames: last5Games.map(g => ({
        score: g.score,
        tokensEarned: g.tokensEarned,
        accuracy: g.accuracy,
        gameMode: g.gameMode,
        createdAt: g.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require('../models/User');
    const GameSession = require('../models/GameSession');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSessions = await GameSession.countDocuments({ userId });
    const tournamentWins = await GameSession.countDocuments({
      userId,
      gameMode: 'tournament',
      rank: 1
    });

    res.json({
      totalGames: user.totalGames,
      totalWins: user.totalWins,
      averageAccuracy: user.averageAccuracy,
      streak: user.streak,
      tokens: user.tokens,
      stats: user.stats,
      tournamentWins
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
