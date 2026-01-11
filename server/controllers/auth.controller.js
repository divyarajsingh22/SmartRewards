const User = require('../models/User');
const { randomUUID } = require('crypto');
const validator = require('validator');

const referralController = require('./referral.controller');

const login = async (req, res) => {
  try {
    const { email, name, referralCode } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newReferralCode = (randomUUID().substring(0, 8)).toUpperCase();
      user = new User({
        email,
        name: name || email.split('@')[0],
        tokens: 0,
        streak: 0,
        referralCode: newReferralCode
      });
      await user.save();

      if (referralCode) {
        try {
          const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
          if (referrer) {
            await referralController.processReferral(referrer._id, user._id);
          }
        } catch (refErr) {
          console.error('Referral processing failed during signup:', refErr);
        }
      }
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        streak: user.streak,
        lastPlayed: user.lastPlayed,
        streakLocked: user.streakLocked,
        referralCode: user.referralCode,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tokens: user.tokens,
        streak: user.streak,
        lastPlayed: user.lastPlayed,
        streakLocked: user.streakLocked,
        streakLockedUntil: user.streakLockedUntil,
        totalGames: user.totalGames,
        totalWins: user.totalWins,
        averageAccuracy: user.averageAccuracy,
        referralCode: user.referralCode,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { login, getProfile };