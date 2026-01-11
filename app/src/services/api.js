import { API_BASE_URL } from '@env';

const { Platform } = require('react-native');
const io = require('socket.io-client');

const SOCKET_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

const getSocket = () => {
  return io(SOCKET_URL, {
    transports: ['websocket']
  });
};

const BASE = API_BASE_URL || 'http://localhost:5000';

const requireUserId = (userId) => {
  if (!userId) throw new Error('userId is required');
};

export const login = async (email, name, referralCode) => {
  const body = { email, name };
  if (referralCode) body.referralCode = referralCode;
  const response = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
};

export const getProfile = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/auth/profile/${userId}`);
  return response.json();
};

export const startDailyRush = async (userId) => {
  requireUserId(userId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${BASE}/api/game/daily-rush/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
};

export const finishDailyRush = async (userId, answers) => {
  requireUserId(userId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${BASE}/api/game/daily-rush/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, answers }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
};

export const getAllTournaments = async () => {
  const response = await fetch(`${BASE}/api/tournament/`);
  return response.json();
};

export const getUpcomingTournaments = async () => {
  const response = await fetch(`${BASE}/api/tournament/upcoming`);
  return response.json();
};

export const getJoinedTournaments = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/tournament/joined/${userId}`);
  return response.json();
};

export const getTournamentHistory = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/tournament/history/${userId}`);
  return response.json();
};

export const getTournamentById = async (id) => {
  const response = await fetch(`${BASE}/api/tournament/${id}`);
  return response.json();
};

export const joinTournament = async (id, userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/tournament/${id}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  return response.json();
};

export const submitTournamentScore = async (id, userId, score) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/tournament/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, score }),
  });
  return response.json();
};

export const getTournamentLeaderboard = async (id) => {
  const response = await fetch(`${BASE}/api/tournament/${id}/leaderboard`);
  return response.json();
};

export const getWallet = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/user/wallet?userId=${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch wallet');
  return data;
};

export const getUserStats = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/user/stats/${userId}`);
  return response.json();
};

export const getDailyLeaderboard = async () => {
  const response = await fetch(`${BASE}/api/leaderboard/daily`);
  return response.json();
};

export const getWeeklyLeaderboard = async () => {
  const response = await fetch(`${BASE}/api/leaderboard/weekly`);
  return response.json();
};

export const getMonthlyLeaderboard = async () => {
  const response = await fetch(`${BASE}/api/leaderboard/monthly`);
  return response.json();
};

export const getAllTimeLeaderboard = async () => {
  const response = await fetch(`${BASE}/api/leaderboard/alltime`);
  return response.json();
};

export const getAllAchievements = async () => {
  const response = await fetch(`${BASE}/api/achievement/`);
  return response.json();
};

export const getUserAchievements = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/achievement/user/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch achievements');
  return data;
};

export const claimAchievement = async (userId, achievementId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/achievement/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, achievementId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to claim achievement');
  return data;
};

export const joinBattle = async (userId, opponentId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/battle/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, opponentId }),
  });
  return response.json();
};

export const getBattleStatus = async (battleId) => {
  const response = await fetch(`${BASE}/api/battle/${battleId}/status`);
  return response.json();
};

export const submitBattleScore = async (battleId, userId, score) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/battle/${battleId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, score }),
  });
  return response.json();
};

export const getWalletTransactions = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/wallet/${userId}/transactions`);
  return response.json();
};

export const getWalletBalance = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/wallet/${userId}/balance`);
  return response.json();
};

export const spinWheel = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/spin/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to spin');
  return data;
};

export const generateReferralCode = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/referral/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to generate referral code');
  return data.referralCode;
};

export const getReferrals = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/referral/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch referrals');
  return data;
};

export const sendFriendRequest = async (userId, recipientEmail) => {
  const response = await fetch(`${BASE}/api/friend/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, recipientEmail }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to send friend request');
  return data;
};

export const getFriendRequests = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/friend/requests/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch friend requests');
  return data;
};

export const respondToFriendRequest = async (requestId, action) => {
  const response = await fetch(`${BASE}/api/friend/request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to respond to friend request');
  return data;
};

export const getFriends = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/friend/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch friends');
  return data;
};

export const purchaseStreakFreeze = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/streak-freeze/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to purchase streak freeze');
  return data;
};

export const getStreakFreeze = async (userId) => {
  requireUserId(userId);
  const response = await fetch(`${BASE}/api/streak-freeze/${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch streak freeze');
  return data;
};
