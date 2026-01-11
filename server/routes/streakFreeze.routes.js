const express = require('express');
const router = express.Router();
const { purchaseStreakFreeze, getStreakFreeze } = require('../controllers/streakFreeze.controller');

router.post('/purchase', purchaseStreakFreeze);
router.get('/:userId', getStreakFreeze);

module.exports = router;