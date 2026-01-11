const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rewarded'],
    default: 'pending'
  },
  rewards: [{
    type: {
      type: String,
      enum: ['signup', 'milestone']
    },
    amount: Number,
    grantedAt: Date
  }]
}, {
  timestamps: true
});

referralSchema.index({ referrer: 1 });
referralSchema.index({ code: 1 });

module.exports = mongoose.model('Referral', referralSchema);