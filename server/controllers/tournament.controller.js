const Tournament = require('../models/Tournament');
const TournamentPlayer = require('../models/TournamentPlayer');
const User = require('../models/User');
const Question = require('../models/Question');
const WalletTransaction = require('../models/WalletTransaction');
const { checkAndUnlockAchievements } = require('./achievement.controller');

const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({}).sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
};

const joinTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.tokens < tournament.entryFee) {
      return res.status(400).json({ error: 'Insufficient tokens' });
    }

    const alreadyJoined = tournament.players.some(p => p.user.toString() === userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this tournament' });
    }

    tournament.players.push({ user: userId });
    tournament.prizePool += tournament.entryFee;
    await tournament.save();

    user.tokens -= tournament.entryFee;
    await user.save();

    await WalletTransaction.create({
      user: userId,
      type: 'spend',
      amount: -tournament.entryFee,
      description: `Entry fee for ${tournament.name}`,
      relatedId: tournament._id,
      relatedModel: 'Tournament',
      balanceAfter: user.tokens
    });

    res.json({ message: 'Joined tournament successfully', tournament });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join tournament' });
  }
};

const submitTournamentScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, score } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const playerIndex = tournament.players.findIndex(p => p.user.toString() === userId);
    if (playerIndex === -1) {
      return res.status(400).json({ error: 'Player not in tournament' });
    }

    tournament.players[playerIndex].score = score;
    tournament.players[playerIndex].completedAt = new Date();
    await tournament.save();

    res.json({ message: 'Score submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit score' });
  }
};

const getTournamentLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const leaderboard = tournament.players
      .filter(p => p.score !== undefined)
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        userId: player.user,
        score: player.score
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const calculatePrizeDistribution = (type, prizePool) => {
  const distributions = {
    small: [
      { rank: 1, tokens: Math.floor(prizePool * 0.5) },
      { rank: 2, tokens: Math.floor(prizePool * 0.3) },
      { rank: 3, tokens: Math.floor(prizePool * 0.2) }
    ],
    medium: [
      { rank: 1, tokens: Math.floor(prizePool * 0.3) },
      { rank: 2, tokens: Math.floor(prizePool * 0.2) },
      { rank: 3, tokens: Math.floor(prizePool * 0.15) },
      { rank: 4, tokens: Math.floor(prizePool * 0.1) },
      { rank: 5, tokens: Math.floor(prizePool * 0.08) },
      { rank: 6, tokens: Math.floor(prizePool * 0.06) },
      { rank: 7, tokens: Math.floor(prizePool * 0.04) },
      { rank: 8, tokens: Math.floor(prizePool * 0.03) },
      { rank: 9, tokens: Math.floor(prizePool * 0.02) },
      { rank: 10, tokens: Math.floor(prizePool * 0.02) }
    ],
    large: [
      { rank: 1, tokens: Math.floor(prizePool * 0.25) },
      { rank: 2, tokens: Math.floor(prizePool * 0.15) },
      { rank: 3, tokens: Math.floor(prizePool * 0.1) },
      { rank: 4, tokens: Math.floor(prizePool * 0.08) },
      { rank: 5, tokens: Math.floor(prizePool * 0.07) },
      { rank: 6, tokens: Math.floor(prizePool * 0.05) },
      { rank: 7, tokens: Math.floor(prizePool * 0.03) },
      { rank: 8, tokens: Math.floor(prizePool * 0.01) },
      { rank: 9, tokens: Math.floor(prizePool * 0.005) },
      { rank: 10, tokens: Math.floor(prizePool * 0.005) }
    ],
    mega: [
      { rank: 1, tokens: Math.floor(prizePool * 0.2) },
      { rank: 2, tokens: Math.floor(prizePool * 0.12) },
      { rank: 3, tokens: Math.floor(prizePool * 0.08) },
      { rank: 4, tokens: Math.floor(prizePool * 0.05) },
      { rank: 5, tokens: Math.floor(prizePool * 0.04) },
      { rank: 6, tokens: Math.floor(prizePool * 0.03) },
      { rank: 7, tokens: Math.floor(prizePool * 0.025) },
      { rank: 8, tokens: Math.floor(prizePool * 0.02) },
      { rank: 9, tokens: Math.floor(prizePool * 0.015) },
      { rank: 10, tokens: Math.floor(prizePool * 0.015) }
    ]
  };

  return distributions[type] || distributions.small;
};

const getUpcomingTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ status: 'scheduled' }).sort({ scheduledStart: 1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming tournaments' });
  }
};

const getJoinedTournaments = async (req, res) => {
  try {
    const { userId } = req.params;
    const tournaments = await Tournament.find({
      'players.user': userId,
      status: { $in: ['scheduled', 'lobby', 'active'] }
    }).sort({ scheduledStart: 1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch joined tournaments' });
  }
};

const getTournamentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const tournaments = await Tournament.find({
      'players.user': userId,
      status: 'completed'
    }).sort({ endTime: -1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament history' });
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  joinTournament,
  submitTournamentScore,
  getTournamentLeaderboard,
  calculatePrizeDistribution,
  getUpcomingTournaments,
  getJoinedTournaments,
  getTournamentHistory
};

