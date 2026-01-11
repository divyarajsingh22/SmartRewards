const express = require('express');
const router = express.Router();
const { getDaily, getWeekly, getMonthly, getAllTime } = require('../controllers/leaderboard.controller');

router.get('/daily', getDaily);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);
router.get('/alltime', getAllTime);

module.exports = router;

