import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getWallet } from '../services/api';
import TokenBadge from '../components/TokenBadge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const WalletScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeUser = route?.params?.user;
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const effectiveUser = user || routeUser;
    if (effectiveUser && effectiveUser._id) {
      loadWallet(effectiveUser);
    } else {
      (async () => {
        const saved = await AsyncStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed._id) {
            setUser && setUser(parsed);
            loadWallet(parsed);
            return;
          }
        }
        setLoading(false);
      })();
    }
  }, [user, routeUser]);

  const loadWallet = async (effectiveUser) => {
    try {
      const uid = effectiveUser ? effectiveUser._id : (user && user._id);
      if (!uid) throw new Error('user id missing');
      const response = await getWallet(uid);
      setWalletData(response);
      setLoading(false);

      if (response.totalTokens !== undefined) {
        const updatedUser = await AsyncStorage.getItem('user');
        if (updatedUser) {
          const parsed = JSON.parse(updatedUser);
          parsed.tokens = response.totalTokens;
          await AsyncStorage.setItem('user', JSON.stringify(parsed));
        }
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setWalletData({ balance: 0, tokens: 0, totalTokens: 0, transactions: [] });
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
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
        <Text style={styles.title}>Wallet</Text>
      </View>

      <View style={styles.totalContainer}>
        <View style={styles.totalCard}>
          <Ionicons name="diamond" size={32} color="#FFB800" />
          <TokenBadge tokens={walletData?.totalTokens || 0} size="large" />
          <Text style={styles.totalLabel}>Total Balance</Text>
        </View>
      </View>

      <View style={styles.todayContainer}>
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Ionicons name="today" size={20} color="#FFB800" />
            <Text style={styles.todayLabel}>Today's Earnings</Text>
          </View>
          <TokenBadge tokens={walletData?.todayEarnings || 0} size="medium" />
        </View>
      </View>

      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Ionicons name="time" size={20} color="#FFFFFF" />
          <Text style={styles.historyTitle}>Recent Games</Text>
        </View>
        {walletData?.lastGames && walletData.lastGames.length > 0 ? (
          walletData.lastGames.map((game, index) => (
            <View key={index} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.gameDateContainer}>
                  <Ionicons name="calendar" size={16} color="#888" />
                  <Text style={styles.gameDate}>{formatDate(game.createdAt)}</Text>
                </View>
                <View style={styles.gameScoreContainer}>
                  <Ionicons name="trophy" size={16} color="#FFB800" />
                  <Text style={styles.gameScore}>{game.score}</Text>
                </View>
              </View>
              <View style={styles.gameStats}>
                <View style={styles.gameStatItem}>
                  <Ionicons name="locate" size={16} color="#4ECDC4" />
                  <Text style={styles.gameStat}>
                    {Math.round(game.accuracy)}%
                  </Text>
                </View>
                <TokenBadge tokens={game.tokensEarned} size="small" />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={48} color="#555" />
            <Text style={styles.emptyText}>No games played yet</Text>
            <Text style={styles.emptySubtext}>Complete Daily Rush to earn tokens</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  totalContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  totalLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  todayContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  todayCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  todayLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameDate: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  gameScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameScore: {
    color: '#FFB800',
    fontSize: 16,
    fontWeight: '700',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameStat: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
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

export default WalletScreen;
