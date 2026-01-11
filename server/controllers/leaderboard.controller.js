const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

const getDaily = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = await Leaderboard.find({
      period: 'daily',
      periodStart: today
    })
      .populate('userId', 'name email')
      .sort({ score: -1 })
      .limit(10)
      .lean();

    const leaderboard = entries.map((entry, index) => ({
      rank: entry.rank || index + 1,
      name: entry.userId.name,
      email: entry.userId.email,
      score: entry.score,
      gamesPlayed: entry.gamesPlayed
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const getWeekly = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const entries = await Leaderboard.find({
      period: 'weekly',
      periodStart: weekStart
    })
      .populate('userId', 'name email')
      .sort({ score: -1 })
      .limit(100)
      .lean();

    const leaderboard = entries.map(entry => ({
      rank: entry.rank || 0,
      name: entry.userId.name,
      email: entry.userId.email,
      score: entry.score,
      gamesPlayed: entry.gamesPlayed,
      wins: entry.wins
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
};

const getMonthly = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const entries = await Leaderboard.find({
      period: 'monthly',
      periodStart: monthStart
    })
      .populate('userId', 'name email')
      .sort({ score: -1 })
      .limit(100)
      .lean();

    const leaderboard = entries.map(entry => ({
      rank: entry.rank || 0,
      name: entry.userId.name,
      email: entry.userId.email,
      score: entry.score,
      gamesPlayed: entry.gamesPlayed,
      wins: entry.wins,
      tokensEarned: entry.tokensEarned
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
};

const getAllTime = async (req, res) => {
  try {
    const entries = await Leaderboard.find({
      period: 'alltime'
    })
      .populate('userId', 'name email streak')
      .sort({ score: -1 })
      .limit(100)
      .lean();

    const leaderboard = entries.map(entry => ({
      rank: entry.rank || 0,
      name: entry.userId.name,
      email: entry.userId.email,
      score: entry.score,
      gamesPlayed: entry.gamesPlayed,
      wins: entry.wins,
      tokensEarned: entry.tokensEarned,
      streak: entry.userId.streak
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all-time leaderboard' });
  }
};

module.exports = { getDaily, getWeekly, getMonthly, getAllTime };
