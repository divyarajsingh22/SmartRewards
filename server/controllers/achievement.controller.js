const Achievement = require('../models/Achievement');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('achievements.achievementId');
    res.json(user.achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
};

const checkAndUnlockAchievements = async (userId) => {
  const user = await User.findById(userId);
  const achievements = await Achievement.find({ isActive: true });

  for (const achievement of achievements) {
    const alreadyUnlocked = user.achievements.some(a => a.achievementId.toString() === achievement._id.toString());
    if (alreadyUnlocked) continue;

    let unlocked = false;

    switch (achievement.type) {
      case 'milestone':
        if (achievement.requirement === 'firstWin' && user.totalWins >= 1) unlocked = true;
        if (achievement.requirement === 'tournamentWin' && user.stats.tournamentsWon >= 1) unlocked = true;
        break;
      case 'streak':
        if (user.streak >= achievement.requirement) unlocked = true;
        break;
      case 'win':
        if (user.totalWins >= achievement.requirement) unlocked = true;
        break;
    }

    if (unlocked) {
      user.achievements.push({
        achievementId: achievement._id,
        unlockedAt: new Date()
      });
      user.tokens += achievement.reward;

      await WalletTransaction.create({
        user: userId,
        type: 'reward',
        amount: achievement.reward,
        description: `Achievement unlocked: ${achievement.name}`,
        relatedId: achievement._id,
        relatedModel: 'Achievement',
        balanceAfter: user.tokens
      });
    }
  }

  await user.save();
};

module.exports = {
  getAllAchievements,
  getUserAchievements,
  checkAndUnlockAchievements
};

