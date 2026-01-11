const mongoose = require('mongoose');

const streakFreezeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
}, { timestamps: true });

module.exports = mongoose.model('StreakFreeze', streakFreezeSchema);