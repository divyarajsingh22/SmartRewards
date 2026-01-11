import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, getUpcomingTournaments, getFriends } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenBadge from '../components/TokenBadge';
import StreakBadge from '../components/StreakBadge';

const HomeScreen = ({ navigation, user, setUser }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadUpcomingTournaments();
      loadFriends();
    }
  }, [user]);

  const loadUpcomingTournaments = async () => {
    try {
      const tournaments = await getUpcomingTournaments();
      setUpcomingTournaments(tournaments);
    } catch (error) {
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await getFriends(user._id);
      setFriends(friendsData);
    } catch (error) {
    }
  };

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setEmail(parsed.email);
      }
    } catch (error) {
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, email.split('@')[0]);
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNow = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login first');
      return;
    }
    navigation.navigate('Play', { screen: 'DailyRushScreen', params: { user } });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Token Rush</Text>
          <Text style={styles.subtitle}>Daily Rewards</Text>
        </View>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Get Started</Text>
          <TouchableOpacity
            style={styles.emailInput}
            onPress={() => {
              const testEmail = `user${Math.floor(Math.random() * 1000)}@test.com`;
              setEmail(testEmail);
            }}
          >
            <Text style={[styles.emailText, !email && styles.emailPlaceholder]}>
              {email || 'Tap to generate email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lockedSection}>
          <View style={styles.lockedCard}>
            <Ionicons name="lock-closed" size={20} color="#666" />
            <Text style={styles.lockedTitle}>Tournaments & Battles</Text>
            <Text style={styles.lockedText}>Available after login</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TokenBadge tokens={user.tokens || 0} size="medium" />
        </View>
        <View style={styles.statsRow}>
          <StreakBadge streak={user.streak || 0} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.mainCard}
        onPress={() => navigation.navigate('Play', { screen: 'DailyRushScreen' })}
        activeOpacity={0.9}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardHeader}>
            <View style={styles.mainCardIcon}>
              <Ionicons name="flash" size={32} color="#FFD700" />
            </View>
            <View style={styles.mainCardText}>
              <Text style={styles.mainCardTitle}>Daily Rush</Text>
              <Text style={styles.mainCardSubtitle}>Play now to earn tokens</Text>
            </View>
          </View>
          <View style={styles.mainCardFooter}>
            <Ionicons name="arrow-forward-circle" size={24} color="#FFD700" />
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainCard, { marginTop: 12 }]}
        onPress={() => navigation.navigate('Play', { screen: 'SpinScreen' })}
        activeOpacity={0.9}
      >
        <View style={styles.mainCardContent}>
          <View style={styles.mainCardHeader}>
            <View style={styles.mainCardIcon}>
              <Ionicons name="gift" size={32} color="#FFD700" />
            </View>
            <View style={styles.mainCardText}>
              <Text style={styles.mainCardTitle}>Spin & Win</Text>
              <Text style={styles.mainCardSubtitle}>Try your luck for tokens</Text>
            </View>
          </View>
          <View style={styles.mainCardFooter}>
            <Ionicons name="arrow-forward-circle" size={24} color="#FFD700" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Tournaments</Text>
        {upcomingTournaments.length > 0 ? (
          upcomingTournaments.slice(0, 1).map((tournament) => (
            <TouchableOpacity
                    key={tournament._id}
                    style={styles.tournamentCard}
                    onPress={() => navigation.navigate('Tournaments', { screen: 'TournamentDetailScreen', params: { tournamentId: tournament._id } })}
                  >
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentPrize}>{tournament.prizePool} tokens</Text>
              </View>
              <Text style={styles.tournamentTime}>
                Starts {new Date(tournament.startTime).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming tournaments</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friend Activity</Text>
        {friends.length > 0 ? (
          friends.slice(0, 2).map((friend) => (
            <View key={friend.id} style={styles.activity}>
              <Ionicons name="person" size={20} color="#FFD700" />
              <Text style={styles.activityText}>{friend.friend.name} joined</Text>
            </View>
          ))
        ) : (
          <View style={styles.activity}>
            <Ionicons name="person" size={20} color="#FFD700" />
            <Text style={styles.activityText}>No friend activity</Text>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  emailInput: {
    backgroundColor: '#252525',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emailText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emailPlaceholder: {
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainCardContent: {
    padding: 20,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFB80020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  mainCardSubtitle: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '500',
  },
  mainCardFooter: {
    alignItems: 'flex-end',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB80020',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lockedSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lockedCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  lockedIcon: {
    marginBottom: 12,
  },
  lockedTitle: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  lockedItems: {
    flexDirection: 'row',
    gap: 24,
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tournamentCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  tournamentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tournamentPrize: {
    color: '#FFD700',
    fontSize: 14,
  },
  tournamentTime: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  }
});

export default HomeScreen;


// DPKA9509