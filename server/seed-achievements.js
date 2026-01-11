const mongoose = require('mongoose');
require('dotenv').config();
const Achievement = require('./models/Achievement');

const achievements = [
  {
    name: 'First Win',
    description: 'Win your first game',
    category: 'beginner',
    tokenReward: 50,
    criteria: { type: 'firstWin', value: 1 },
    icon: 'trophy'
  },
  {
    name: 'First Tournament',
    description: 'Join your first tournament',
    category: 'beginner',
    tokenReward: 100,
    criteria: { type: 'firstTournament', value: 1 },
    icon: 'people'
  },
  {
    name: '10 Games Played',
    description: 'Play 10 games',
    category: 'beginner',
    tokenReward: 150,
    criteria: { type: 'gamesPlayed', value: 10 },
    icon: 'game-controller'
  },
  {
    name: '50 Wins',
    description: 'Win 50 games',
    category: 'intermediate',
    tokenReward: 500,
    criteria: { type: 'wins', value: 50 },
    icon: 'medal'
  },
  {
    name: 'Perfect Score',
    description: 'Achieve 100% accuracy',
    category: 'intermediate',
    tokenReward: 300,
    criteria: { type: 'perfectScore', value: 100 },
    icon: 'star'
  },
  {
    name: 'Tournament Victory',
    description: 'Win a tournament',
    category: 'intermediate',
    tokenReward: 400,
    criteria: { type: 'tournamentWin', value: 1 },
    icon: 'trophy'
  },
  {
    name: '7-Day Streak',
    description: 'Maintain a 7-day streak',
    category: 'intermediate',
    tokenReward: 200,
    criteria: { type: 'streak', value: 7 },
    icon: 'flame'
  },
  {
    name: '100 Wins',
    description: 'Win 100 games',
    category: 'advanced',
    tokenReward: 1000,
    criteria: { type: 'wins', value: 100 },
    icon: 'medal'
  },
  {
    name: '30-Day Streak',
    description: 'Maintain a 30-day streak',
    category: 'advanced',
    tokenReward: 1000,
    criteria: { type: 'streak', value: 30 },
    icon: 'flame'
  },
  {
    name: 'Top 10 Leaderboard',
    description: 'Reach top 10 on leaderboard',
    category: 'advanced',
    tokenReward: 2000,
    criteria: { type: 'leaderboard', value: 10 },
    icon: 'trophy'
  },
  {
    name: '500 Games Played',
    description: 'Play 500 games',
    category: 'advanced',
    tokenReward: 1500,
    criteria: { type: 'gamesPlayed', value: 500 },
    icon: 'game-controller'
  }
];

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tokenrush');
    
    await Achievement.deleteMany({});
    await Achievement.insertMany(achievements);
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seedAchievements();

