const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battle.controller');

router.post('/join', battleController.joinBattle);
router.get('/:id/status', battleController.getBattleStatus);
router.post('/:id/submit', battleController.submitBattleScore);

module.exports = router;