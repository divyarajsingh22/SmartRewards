const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'alltime'],
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date
  },
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  tokensEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

leaderboardSchema.index({ period: 1, periodStart: -1, score: -1 });
leaderboardSchema.index({ userId: 1, period: 1, periodStart: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

