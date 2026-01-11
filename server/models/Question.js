const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'Options must have exactly 4 items'
    }
  },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'tech', 'sports', 'science', 'history', 'current'],
    default: 'general'
  },
  timesUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ timesUsed: 1 });

module.exports = mongoose.model('Question', questionSchema);
