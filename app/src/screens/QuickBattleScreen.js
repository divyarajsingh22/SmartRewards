import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { joinBattle, getBattleStatus } from '../services/api';

const QuickBattleScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (battle) {
      const interval = setInterval(async () => {
        const status = await getBattleStatus(battle._id);
        if (status.status === 'completed') {
          navigation.navigate('BattleResultScreen', { battle: status });
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [battle]);

  const handleJoinBattle = async () => {
    setLoading(true);
    try {
      const result = await joinBattle(user._id);
      setBattle(result.battle);
    } catch (error) {
      Alert.alert('Error', 'Failed to join battle');
    } finally {
      setLoading(false);
    }
  };

  if (battle) {
    return (
      <View style={styles.container}>
        <Ionicons name="people" size={64} color="#FFD700" />
        <Text style={styles.title}>Battle Joined</Text>
        <Text style={styles.subtitle}>Waiting for opponent...</Text>
        <Text style={styles.info}>Entry Fee: 10 tokens</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="flash" size={64} color="#FFD700" />
      <Text style={styles.title}>Quick Battle</Text>
      <Text style={styles.subtitle}>1v1 Async Quiz Battle</Text>
      <Text style={styles.info}>Entry Fee: 10 tokens</Text>
      <Text style={styles.info}>Prize: 18 tokens for winner</Text>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoinBattle}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Joining...' : 'Join Battle'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default QuickBattleScreen;