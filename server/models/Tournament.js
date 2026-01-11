const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['small', 'medium', 'large', 'mega'],
    default: 'small'
  },
  scheduledStart: {
    type: Date,
    required: true
  },
  actualStart: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'lobby', 'active', 'completed'],
    default: 'scheduled'
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  currentPlayers: {
    type: Number,
    default: 0
  },
  entryFee: {
    type: Number,
    required: true
  },
  prizePool: {
    type: Number,
    default: 0
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    }
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  winners: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rank: {
      type: Number
    },
    tokens: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

tournamentSchema.index({ status: 1, scheduledStart: 1 });
tournamentSchema.index({ scheduledStart: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);

