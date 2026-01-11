const Tournament = require('../models/Tournament');

const createTournament = async (type, name, scheduledStart, entryFee, maxPlayers) => {
  const tournament = new Tournament({
    name,
    type,
    scheduledStart,
    entryFee,
    maxPlayers,
    prizePool: 0,
    status: 'scheduled'
  });
  await tournament.save();
  return tournament;
};

const scheduleTournaments = async () => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const tournaments = [
    { type: 'small', name: 'Evening Rush', start: twoHoursLater, fee: 20, players: 50 },
    { type: 'small', name: 'Night Tournament', start: fourHoursLater, fee: 20, players: 50 },
    { type: 'medium', name: 'Late Night Battle', start: sixHoursLater, fee: 30, players: 200 }
  ];

  for (const t of tournaments) {
    const existing = await Tournament.findOne({
      name: t.name,
      scheduledStart: { $gte: new Date(t.start.getTime() - 60 * 60 * 1000) }
    });

    if (!existing) {
      await createTournament(t.type, t.name, t.start, t.fee, t.players);
    }
  }
};

module.exports = { scheduleTournaments, createTournament };

