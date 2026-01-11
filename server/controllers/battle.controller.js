const Battle = require('../models/Battle');
const User = require('../models/User');
const Question = require('../models/Question');
const WalletTransaction = require('../models/WalletTransaction');
const { checkAndUnlockAchievements } = require('./achievement.controller');

const joinBattle = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user.tokens < 10) {
      return res.status(400).json({ error: 'Insufficient tokens' });
    }

    let battle = await Battle.findOne({
      status: 'waiting',
      'players.user': { $ne: userId }
    });

    if (!battle) {
      const questions = await Question.aggregate([{ $sample: { size: 5 } }]);
      battle = new Battle({
        players: [{ user: userId }],
        questions: questions.map(q => q._id),
        status: 'waiting'
      });
      await battle.save();
    } else {
      battle.players.push({ user: userId });
      battle.status = 'active';
      battle.startedAt = new Date();
      await battle.save();
    }

    user.tokens -= 10;
    await user.save();

    await WalletTransaction.create({
      user: userId,
      type: 'spend',
      amount: -10,
      description: 'Quick Battle entry fee',
      relatedId: battle._id,
      relatedModel: 'Battle',
      balanceAfter: user.tokens
    });

    res.json({ battle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join battle' });
  }
};

const getBattleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const battle = await Battle.findById(id).populate('players.user', 'name');
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    res.json(battle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get battle status' });
  }
};

const submitBattleScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, score } = req.body;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const playerIndex = battle.players.findIndex(p => p.user.toString() === userId);
    if (playerIndex === -1) {
      return res.status(400).json({ error: 'Player not in battle' });
    }

    battle.players[playerIndex].score = score;
    battle.players[playerIndex].completedAt = new Date();
    battle.scores.set(userId, score);

    const completedPlayers = battle.players.filter(p => p.score !== undefined);
    if (completedPlayers.length === 2) {
      battle.status = 'completed';
      battle.completedAt = new Date();

      const [player1, player2] = completedPlayers;
      const winner = player1.score > player2.score ? player1 : player2;
      const loser = player1.score > player2.score ? player2 : player1;

      battle.winner = winner.user;

      const winnerUser = await User.findById(winner.user);
      const loserUser = await User.findById(loser.user);

      winnerUser.tokens += 18;
      winnerUser.totalWins += 1;
      loserUser.tokens += 2;

      await winnerUser.save();
      await loserUser.save();

      await checkAndUnlockAchievements(winner.user);

      await WalletTransaction.create({
        user: winner.user,
        type: 'earn',
        amount: 18,
        description: 'Quick Battle win',
        relatedId: battle._id,
        relatedModel: 'Battle',
        balanceAfter: winnerUser.tokens
      });

      await WalletTransaction.create({
        user: loser.user,
        type: 'earn',
        amount: 2,
        description: 'Quick Battle participation',
        relatedId: battle._id,
        relatedModel: 'Battle',
        balanceAfter: loserUser.tokens
      });
    }

    await battle.save();
    res.json({ message: 'Score submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit score' });
  }
};

module.exports = {
  joinBattle,
  getBattleStatus,
  submitBattleScore
};