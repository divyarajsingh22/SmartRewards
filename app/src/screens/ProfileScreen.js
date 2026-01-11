import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getStreakFreeze, purchaseStreakFreeze } from '../services/api';

const ProfileScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const [hasFreeze, setHasFreeze] = useState(false);

  useEffect(() => {
    if (user) {
      loadStreakFreeze();
    }
  }, [user]);

  const loadStreakFreeze = async () => {
    try {
      const data = await getStreakFreeze(user._id);
      setHasFreeze(data.hasFreeze);
    } catch (error) {
    }
  };

  const handlePurchaseFreeze = async () => {
    if (hasFreeze) {
      Alert.alert('Info', 'You already have a streak freeze');
      return;
    }
    if (user.tokens < 50) {
      Alert.alert('Error', 'Not enough tokens');
      return;
    }
    try {
      await purchaseStreakFreeze(user._id);
      setHasFreeze(true);
      setUser({ ...user, tokens: user.tokens - 50 });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={80} color="#FFD700" />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.tokens}</Text>
          <Text style={styles.statLabel}>Tokens</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.totalGames}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('AchievementScreen')}
      >
        <Ionicons name="medal" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Achievements</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('ReferralScreen')}
      >
        <Ionicons name="people" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Referrals</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('FriendsScreen')}
      >
        <Ionicons name="person-add" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Friends</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePurchaseFreeze}
      >
        <Ionicons name="snow" size={24} color="#FFD700" />
        <Text style={styles.menuText}>
          {hasFreeze ? 'Streak Freeze (Owned)' : 'Buy Streak Freeze (50 tokens)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('SettingsScreen')}
      >
        <Ionicons name="settings" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Settings</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
    flex: 1,
  },
});

export default ProfileScreen;