const StreakFreeze = require('../models/StreakFreeze');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const purchaseStreakFreeze = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.tokens < 50) {
      return res.status(400).json({ error: 'Insufficient tokens' });
    }

    const existing = await StreakFreeze.findOne({ user: userId, used: false });
    if (existing) {
      return res.status(400).json({ error: 'Already have an unused streak freeze' });
    }

    user.tokens -= 50;
    await user.save();

    const streakFreeze = new StreakFreeze({ user: userId });
    await streakFreeze.save();

    await WalletTransaction.create({
      user: userId,
      type: 'spend',
      amount: -50,
      description: 'Purchased streak freeze',
      relatedId: streakFreeze._id,
      relatedModel: 'StreakFreeze',
      balanceAfter: user.tokens
    });

    res.json({ message: 'Streak freeze purchased', streakFreeze });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase streak freeze' });
  }
};

const getStreakFreeze = async (req, res) => {
  try {
    const { userId } = req.params;

    const streakFreeze = await StreakFreeze.findOne({ user: userId, used: false });
    res.json({ hasFreeze: !!streakFreeze });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get streak freeze' });
  }
};

const useStreakFreeze = async (userId) => {
  const streakFreeze = await StreakFreeze.findOne({ user: userId, used: false });
  if (streakFreeze) {
    streakFreeze.used = true;
    await streakFreeze.save();
  }
};

module.exports = { purchaseStreakFreeze, getStreakFreeze, useStreakFreeze };