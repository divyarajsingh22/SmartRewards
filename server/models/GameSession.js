const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameMode: {
    type: String,
    enum: ['dailyRush', 'tournament', 'quickBattle'],
    required: true
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  score: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  tokensEarned: {
    type: Number,
    required: true
  },
  streakMultiplier: {
    type: Number,
    default: 1
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedOption: {
      type: Number
    },
    timeTaken: {
      type: Number
    },
    isCorrect: {
      type: Boolean
    }
  }],
  rank: {
    type: Number
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

gameSessionSchema.index({ userId: 1, completedAt: -1 });
gameSessionSchema.index({ tournamentId: 1, score: -1 });
gameSessionSchema.index({ gameMode: 1, completedAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
