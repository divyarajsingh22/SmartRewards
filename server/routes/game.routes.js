const express = require('express');
const router = express.Router();
const { startDailyRush, finishDailyRush } = require('../controllers/game.controller');
const validateUserId = require('../middleware/validateUserId');
const validateAnswers = require('../middleware/validateAnswers');

router.post('/daily-rush/start', validateUserId, startDailyRush);
router.post('/daily-rush/finish', validateUserId, validateAnswers, finishDailyRush);

module.exports = router;

