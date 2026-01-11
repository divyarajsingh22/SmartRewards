const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date
  },
  streakLocked: {
    type: Boolean,
    default: false
  },
  streakLockedUntil: {
    type: Date
  },
  totalGames: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  averageAccuracy: {
    type: Number,
    default: 0
  },
  achievements: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stats: {
    dailyRushPlayed: {
      type: Number,
      default: 0
    },
    tournamentsJoined: {
      type: Number,
      default: 0
    },
    tournamentsWon: {
      type: Number,
      default: 0
    },
    quickBattlesPlayed: {
      type: Number,
      default: 0
    },
    quickBattlesWon: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ 'stats.tournamentsWon': -1 });
userSchema.index({ streak: -1 });

module.exports = mongoose.model('User', userSchema);
