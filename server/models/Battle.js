const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    completedAt: Date
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scores: {
    type: Map,
    of: Number,
    default: {}
  },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

battleSchema.index({ status: 1 });
battleSchema.index({ 'players.user': 1 });

module.exports = mongoose.model('Battle', battleSchema);