const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');

router.get('/', achievementController.getAllAchievements);
router.get('/user/:userId', achievementController.getUserAchievements);

module.exports = router;

