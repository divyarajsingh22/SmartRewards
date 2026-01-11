const Question = require('../models/Question');
const User = require('../models/User');
const GameSession = require('../models/GameSession');
const Achievement = require('../models/Achievement');
const Leaderboard = require('../models/Leaderboard');
const { checkAndUnlockAchievements } = require('./achievement.controller');
const { useStreakFreeze } = require('./streakFreeze.controller');

const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1.5;
  return 1;
};

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { streak: 0, multiplier: 1, locked: false };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!user.lastPlayed) {
    user.streak = 1;
    user.lastPlayed = today;
    await user.save();
    return { streak: 1, multiplier: 1, locked: false };
  }

  const lastPlayedDate = new Date(user.lastPlayed);
  const lastPlayedDay = new Date(lastPlayedDate.getFullYear(), lastPlayedDate.getMonth(), lastPlayedDate.getDate());
  
  const daysDiff = Math.floor((today - lastPlayedDay) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return { streak: user.streak, multiplier: getStreakMultiplier(user.streak), locked: user.streakLocked };
  } else if (daysDiff === 1) {
    user.streak += 1;
    user.lastPlayed = today;
    if (user.streakLocked && user.streakLockedUntil && new Date() > user.streakLockedUntil) {
      user.streakLocked = false;
      user.streakLockedUntil = null;
    }
    await user.save();
    return { streak: user.streak, multiplier: getStreakMultiplier(user.streak), locked: user.streakLocked };
  } else {
    const StreakFreeze = require('../models/StreakFreeze');
    const freeze = await StreakFreeze.findOne({ user: userId, used: false });
    if (freeze) {
      await useStreakFreeze(userId);
      return { streak: user.streak, multiplier: getStreakMultiplier(user.streak), locked: user.streakLocked };
    }
    user.streak = 1;
    user.lastPlayed = today;
    user.streakLocked = true;
    user.streakLockedUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    await user.save();
    return { streak: 1, multiplier: 1, locked: true };
  }
};

const checkAchievements = async (userId, gameData) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const achievements = await Achievement.find({});
  const unlocked = [];

  for (const achievement of achievements) {
    const alreadyUnlocked = user.achievements.some(a => a.achievementId.toString() === achievement._id.toString());
    if (alreadyUnlocked) continue;

    let shouldUnlock = false;

    switch (achievement.criteria.type) {
      case 'firstWin':
        shouldUnlock = gameData.isWin && user.totalWins === 0;
        break;
      case 'firstTournament':
        shouldUnlock = gameData.gameMode === 'tournament' && user.stats.tournamentsJoined === 0;
        break;
      case 'gamesPlayed':
        shouldUnlock = user.totalGames >= achievement.criteria.value;
        break;
      case 'wins':
        shouldUnlock = user.totalWins >= achievement.criteria.value;
        break;
      case 'perfectScore':
        shouldUnlock = gameData.accuracy === 100;
        break;
      case 'tournamentWin':
        shouldUnlock = gameData.gameMode === 'tournament' && gameData.rank === 1;
        break;
      case 'streak':
        shouldUnlock = user.streak >= achievement.criteria.value;
        break;
    }

    if (shouldUnlock) {
      user.achievements.push({
        achievementId: achievement._id,
        unlockedAt: new Date()
      });
      user.tokens += achievement.tokenReward;
      unlocked.push({
        name: achievement.name,
        description: achievement.description,
        tokens: achievement.tokenReward
      });
    }
  }

  if (unlocked.length > 0) {
    await user.save();
  }

  return unlocked;
};

const updateLeaderboard = async (userId, score, gameMode) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const periods = [
    { period: 'daily', start: today },
    { period: 'weekly', start: weekStart },
    { period: 'monthly', start: monthStart },
    { period: 'alltime', start: new Date(0) }
  ];

  for (const { period, start } of periods) {
    let leaderboard = await Leaderboard.findOne({
      userId,
      period,
      periodStart: start
    });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        userId,
        period,
        periodStart: start,
        periodEnd: period === 'daily' ? new Date(today.getTime() + 24 * 60 * 60 * 1000) : null
      });
    }

    leaderboard.score += score;
    leaderboard.gamesPlayed += 1;
    if (gameMode === 'tournament') {
      leaderboard.wins += 1;
    }
    await leaderboard.save();
  }

  for (const { period, start } of periods) {
    const allEntries = await Leaderboard.find({ period, periodStart: start })
      .sort({ score: -1 })
      .lean();

    for (let i = 0; i < allEntries.length; i++) {
      await Leaderboard.updateOne(
        { _id: allEntries[i]._id },
        { $set: { rank: i + 1 } }
      );
    }
  }
};

const startDailyRush = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = await GameSession.findOne({
      userId,
      gameMode: 'dailyRush',
      createdAt: { $gte: today }
    });

    if (existingSession) {
      return res.status(400).json({ error: 'Already played today' });
    }

    const questions = await Question.aggregate([
      { $sample: { size: 15 } }
    ]);

    if (questions.length < 10) {
      return res.status(500).json({ error: 'Not enough questions in database' });
    }

    const selectedQuestions = questions.slice(0, 15).map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      correctOption: q.correctOption
    }));

    res.json({ questions: selectedQuestions });
  } catch (error) {
    console.error('startDailyRush error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};

const finishDailyRush = async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = await GameSession.findOne({
      userId,
      gameMode: 'dailyRush',
      createdAt: { $gte: today }
    });

    if (existingSession) {
      return res.status(400).json({ error: 'Game already completed today' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    let correctCount = 0;
    const answerDetails = [];

    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return;

      const isCorrect = answer.selectedOption === question.correctOption;
      const timeTaken = answer.timeRemaining !== undefined ? (9 - answer.timeRemaining) : 9;

      if (isCorrect) {
        correctCount++;
        let points = 10;
        if (answer.timeRemaining !== undefined) {
          const timeBonus = Math.floor(answer.timeRemaining * 0.5);
          points += Math.min(timeBonus, 5);
        }
        score += points;
      }

      answerDetails.push({
        questionId: question._id,
        selectedOption: answer.selectedOption,
        timeTaken,
        isCorrect
      });
    });

    const totalQuestions = answers.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const streakData = await updateStreak(userId);
    const streakMultiplier = streakData.multiplier;
    const baseTokens = Math.floor(score / 2);
    const tokensEarned = Math.floor(baseTokens * streakMultiplier);

    user.tokens += tokensEarned;
    user.totalGames += 1;
    user.stats.dailyRushPlayed += 1;
    if (accuracy >= 85) {
      user.totalWins += 1;
    }
    
    const totalAccuracy = (user.averageAccuracy * (user.totalGames - 1) + accuracy) / user.totalGames;
    user.averageAccuracy = Math.round(totalAccuracy * 100) / 100;

    await user.save();

    const gameSession = new GameSession({
      userId,
      gameMode: 'dailyRush',
      score,
      accuracy,
      tokensEarned,
      streakMultiplier,
      answers: answerDetails
    });
    await gameSession.save();

    const WalletTransaction = require('../models/WalletTransaction');
    try {
      await WalletTransaction.create({
        user: userId,
        type: 'earn',
        amount: tokensEarned,
        description: 'Daily Rush reward',
        relatedId: gameSession._id,
        relatedModel: 'GameSession',
        balanceAfter: user.tokens
      });
    } catch (txErr) {
      console.error('Failed to create wallet transaction for daily rush:', txErr);
    }

    await checkAndUnlockAchievements(userId);

    await updateLeaderboard(userId, score, 'dailyRush');

    res.json({
      score,
      accuracy,
      tokensEarned,
      streak: streakData.streak,
      streakMultiplier,
      correctCount,
      totalQuestions
    });
  } catch (error) {
    console.error('finishDailyRush error:', error);
    res.status(500).json({ error: 'Failed to finish game' });
  }
};

module.exports = { startDailyRush, finishDailyRush, updateStreak, getStreakMultiplier };
