const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const spinWheel = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'UserId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const rewards = [0, 1, 2, 5, 10, 20, 50];
    const idx = Math.floor(Math.random() * rewards.length);
    const amount = rewards[idx];

    user.tokens += amount;
    await user.save();

    const tx = {
      user: userId,
      type: amount > 0 ? 'reward' : 'earn',
      amount,
      description: 'Spin the wheel reward',
      balanceAfter: user.tokens
    };
    await WalletTransaction.create(tx);

    res.json({ amount, balance: user.tokens });
  } catch (error) {
    console.error('spinWheel error:', error);
    res.status(500).json({ error: 'Failed to spin' });
  }
};

module.exports = { spinWheel };
