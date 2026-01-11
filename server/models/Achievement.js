const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['milestone', 'streak', 'win', 'special'],
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

achievementSchema.index({ type: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

