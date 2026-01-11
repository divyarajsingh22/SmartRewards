const mongoose = require('mongoose');

const tournamentPlayerSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  gameSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession'
  },
  finalRank: {
    type: Number
  },
  tokensWon: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

tournamentPlayerSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });
tournamentPlayerSchema.index({ tournamentId: 1, finalRank: 1 });

module.exports = mongoose.model('TournamentPlayer', tournamentPlayerSchema);

