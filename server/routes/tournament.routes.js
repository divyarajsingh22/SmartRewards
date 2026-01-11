const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');

router.get('/', tournamentController.getAllTournaments);
router.get('/upcoming', tournamentController.getUpcomingTournaments);
router.get('/joined/:userId', tournamentController.getJoinedTournaments);
router.get('/history/:userId', tournamentController.getTournamentHistory);
router.get('/:id', tournamentController.getTournamentById);
router.post('/:id/join', tournamentController.joinTournament);
router.post('/:id/submit', tournamentController.submitTournamentScore);
router.get('/:id/leaderboard', tournamentController.getTournamentLeaderboard);

module.exports = router;

