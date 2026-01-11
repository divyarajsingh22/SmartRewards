require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const gameRoutes = require("./routes/game.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const userRoutes = require("./routes/user.routes");
const tournamentRoutes = require("./routes/tournament.routes");
const achievementRoutes = require("./routes/achievement.routes");
const battleRoutes = require("./routes/battle.routes");
const walletRoutes = require("./routes/wallet.routes");
const referralRoutes = require("./routes/referral.routes");
const friendRoutes = require("./routes/friend.routes");
const streakFreezeRoutes = require("./routes/streakFreeze.routes");
const spinRoutes = require('./routes/spin.routes');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
// `server` and `io` are created only when running directly (see bottom of file)

// connectDB() will only run when this file is executed directly.

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tournament", tournamentRoutes);
app.use("/api/achievement", achievementRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/streak-freeze", streakFreezeRoutes);
app.use('/api/spin', spinRoutes);

const { scheduleTournaments } = require("./utils/tournamentScheduler");

// scheduleTournaments will only run when this file is executed directly.

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Connect to DB and start background schedulers only when run directly
  connectDB();
  // create HTTP server and socket.io only when running directly
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const Tournament = require('./models/Tournament');
  const TournamentPlayer = require('./models/TournamentPlayer');

  io.on('connection', (socket) => {
    socket.on('join-tournament', async (tournamentId) => {
      socket.join(`tournament-${tournamentId}`);

      const tournament = await Tournament.findById(tournamentId);
      if (tournament) {
        io.to(`tournament-${tournamentId}`).emit('tournament-update', {
          currentPlayers: tournament.currentPlayers,
          prizePool: tournament.prizePool,
          maxPlayers: tournament.maxPlayers,
        });
      }
    });

    socket.on('leave-tournament', (tournamentId) => {
      socket.leave(`tournament-${tournamentId}`);
    });

    socket.on('submit-answer', async (data) => {
      const { tournamentId, userId, score, rank } = data;
      io.to(`tournament-${tournamentId}`).emit('leaderboard-update', {
        userId,
        score,
        rank,
      });
    });
  });

  // start schedulers
  scheduleTournaments();
  setInterval(async () => {
    const now = new Date();
    const upcoming = await Tournament.find({
      status: 'scheduled',
      scheduledStart: { $lte: now },
    });

    for (const tournament of upcoming) {
      tournament.status = 'lobby';
      await tournament.save();

      io.emit('tournament-starting', {
        tournamentId: tournament._id,
        startsIn: 60,
      });

      setTimeout(async () => {
        const questions = await require('./models/Question').aggregate([
          { $sample: { size: 10 } },
        ]);

        tournament.status = 'active';
        tournament.actualStart = new Date();
        tournament.questions = questions.map((q) => q._id);
        await tournament.save();

        io.to(`tournament-${tournament._id}`).emit('tournament-started', {
          tournamentId: tournament._id,
          questions: questions.map((q) => ({
            id: q._id,
            question: q.question,
            options: q.options,
          })),
        });

        setTimeout(async () => {
          const Tournament = require('./models/Tournament');
          const TournamentPlayer = require('./models/TournamentPlayer');
          const GameSession = require('./models/GameSession');
          const User = require('./models/User');
          const { calculatePrizeDistribution } = require('./controllers/tournament.controller');

          const activeTournament = await Tournament.findById(tournament._id);
          if (!activeTournament || activeTournament.status !== 'active') return;

          const players = await TournamentPlayer.find({
            tournamentId: activeTournament._id,
          })
            .populate('gameSessionId')
            .lean();

          const scores = [];
          for (const player of players) {
            if (player.gameSessionId) {
              const session = await GameSession.findById(player.gameSessionId);
              if (session) {
                scores.push({
                  userId: player.userId,
                  playerId: player._id,
                  score: session.score,
                  accuracy: session.accuracy,
                });
              }
            }
          }

          scores.sort((a, b) => b.score - a.score);
          const prizeDistribution = calculatePrizeDistribution(activeTournament.type, activeTournament.prizePool);
          const winners = [];

          for (let i = 0; i < scores.length && i < prizeDistribution.length; i++) {
            const prize = prizeDistribution[i];
            const scoreData = scores[i];

            const user = await User.findById(scoreData.userId);
            if (user) {
              user.tokens += prize.tokens;
              if (i === 0) {
                user.stats.tournamentsWon += 1;
                user.totalWins += 1;
              }
              await user.save();
            }

            try {
              const WalletTransaction = require('./models/WalletTransaction');
              await WalletTransaction.create({
                user: scoreData.userId,
                type: 'reward',
                amount: prize.tokens,
                description: `Tournament prize - rank ${i + 1}`,
                relatedId: activeTournament._id,
                relatedModel: 'Tournament',
                balanceAfter: user ? user.tokens : undefined
              });
            } catch (txErr) {
              console.error('Failed to record tournament wallet transaction:', txErr);
            }

            await TournamentPlayer.updateOne({ _id: scoreData.playerId }, { $set: { finalRank: i + 1, tokensWon: prize.tokens } });

            await GameSession.updateOne({ userId: scoreData.userId, tournamentId: activeTournament._id }, { $set: { rank: i + 1, tokensEarned: prize.tokens } });

            winners.push({ userId: scoreData.userId, rank: i + 1, tokens: prize.tokens });
          }

          activeTournament.status = 'completed';
          activeTournament.endTime = new Date();
          activeTournament.winners = winners;
          await activeTournament.save();

          tournament.status = 'completed';
          await tournament.save();

          io.to(`tournament-${tournament._id}`).emit('tournament-ended', { tournamentId: tournament._id });
        }, 120000);
      }, 60000);
    }
  }, 2 * 60 * 1000); // run periodically (shorter interval during dev)

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app };
