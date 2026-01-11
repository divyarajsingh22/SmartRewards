const Referral = require('../models/Referral');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const generateReferralCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.referralCode) {
      return res.json({ referralCode: user.referralCode });
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.referralCode = referralCode;
    await user.save();

    res.json({ referralCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
};

const getReferrals = async (req, res) => {
  try {
    const { userId } = req.params;
    const referrals = await Referral.find({ referrer: userId }).populate('referredUser', 'username');
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
};

const processReferral = async (referrerId, referredUserId) => {
  const referrer = await User.findById(referrerId);
  const referredUser = await User.findById(referredUserId);

  if (!referrer || !referredUser) return;

  const referral = new Referral({
    referrer: referrerId,
    referredUser: referredUserId,
    status: 'completed'
  });
  await referral.save();

  const reward = 50;
  referrer.tokens += reward;
  await referrer.save();

  await WalletTransaction.create({
    user: referrerId,
    type: 'reward',
    amount: reward,
    description: 'Referral bonus',
    relatedId: referral._id,
    relatedModel: 'Referral',
    balanceAfter: referrer.tokens
  });
};

module.exports = {
  generateReferralCode,
  getReferrals,
  processReferral
};