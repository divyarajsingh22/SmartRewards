import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDailyLeaderboard } from '../services/api';

const LeaderboardScreen = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await getDailyLeaderboard();
      setLeaderboard(response.leaderboard || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFB800';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#888';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB800" />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={32} color="#FFB800" />
          <Text style={styles.title}>Daily Leaderboard</Text>
          <Text style={styles.subtitle}>Top 10 Players Today</Text>
        </View>
      </View>

      {leaderboard.length > 0 ? (
        <View style={styles.listContainer}>
          {leaderboard.map((entry, index) => (
            <View key={index} style={[styles.entryCard, entry.rank <= 3 && styles.topEntryCard]}>
              <View style={styles.rankContainer}>
                {getRankIcon(entry.rank) ? (
                  <Text style={styles.rankIcon}>{getRankIcon(entry.rank)}</Text>
                ) : (
                  <View style={[styles.rankBadge, { borderColor: getRankColor(entry.rank) }]}>
                    <Text style={[styles.rankNumber, { color: getRankColor(entry.rank) }]}>
                      {entry.rank}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color="#888" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{entry.name}</Text>
                  <Text style={styles.userEmail}>{entry.email}</Text>
                </View>
              </View>

              <View style={styles.scoreContainer}>
                <View style={styles.scoreRow}>
                  <Ionicons name="trophy" size={16} color="#FFB800" />
                  <Text style={styles.score}>{entry.score}</Text>
                </View>
                <View style={styles.accuracyRow}>
                  <Ionicons name="locate" size={14} color="#4ECDC4" />
                  <Text style={styles.accuracy}>
                    {Math.round(entry.accuracy)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#555" />
          <Text style={styles.emptyText}>No players yet today</Text>
          <Text style={styles.emptySubtext}>Be the first to play!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  topEntryCard: {
    borderWidth: 2,
    borderColor: '#FFB800',
    backgroundColor: '#1A1A1A',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIcon: {
    fontSize: 32,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  score: {
    color: '#FFB800',
    fontSize: 18,
    fontWeight: '700',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accuracy: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },
});

export default LeaderboardScreen;
