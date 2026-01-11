const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');

const getWalletTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const transactions = await WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedId', 'name');

    const total = await WalletTransaction.countDocuments({ user: userId });

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('tokens');
    res.json({ balance: user.tokens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

module.exports = {
  getWalletTransactions,
  getWalletBalance
};