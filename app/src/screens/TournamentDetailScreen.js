import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { joinTournament, getTournament } from '../services/api';

const TournamentDetailScreen = ({ route, user }) => {
  const { tournamentId } = route?.params || {};
  const [tournament, setTournament] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    try {
      const data = await getTournament(tournamentId);
      setTournament(data);
      setJoined(data.players.some(p => p.user === user._id));
    } catch (error) {
    }
  };

  const handleJoin = async () => {
    if (user.tokens < tournament.entryFee) {
      Alert.alert('Insufficient Tokens', 'You need more tokens to join');
      return;
    }
    try {
      await joinTournament(tournamentId, user._id);
      setJoined(true);
      Alert.alert('Joined', 'You have joined the tournament');
    } catch (error) {
      Alert.alert('Error', 'Failed to join tournament');
    }
  };

  if (!tournament) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{tournament.name}</Text>
        <Text style={styles.prize}>Prize Pool: {tournament.prizePool} tokens</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detail}>
          <Ionicons name="people" size={20} color="#FFD700" />
          <Text style={styles.detailText}>
            {tournament.players.length}/{tournament.maxPlayers} Players
          </Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time" size={20} color="#FFD700" />
          <Text style={styles.detailText}>
            Starts: {new Date(tournament.startTime).toLocaleString()}
          </Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="cash" size={20} color="#FFD700" />
          <Text style={styles.detailText}>Entry: {tournament.entryFee} tokens</Text>
        </View>
      </View>

      <View style={styles.rules}>
        <Text style={styles.sectionTitle}>Rules</Text>
        <Text style={styles.rule}>• Answer questions as fast as possible</Text>
        <Text style={styles.rule}>• Higher score wins</Text>
        <Text style={styles.rule}>• Top players share the prize pool</Text>
      </View>

      {!joined && (
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
          <Text style={styles.joinText}>Join Tournament</Text>
        </TouchableOpacity>
      )}

      {joined && (
        <View style={styles.joined}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.joinedText}>You are registered</Text>
        </View>
      )}

      <TouchableOpacity style={styles.viewHistory} onPress={() => navigation.navigate('TournamentWalletScreen', { tournamentId })}>
        <Text style={styles.viewHistoryText}>View Tournament Wallet History</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  prize: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 5,
  },
  details: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#ccc',
    marginLeft: 10,
  },
  rules: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  rule: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  joinButton: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  viewHistory: {
    margin: 20,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center'
  },
  viewHistoryText: {
    color: '#FFD700',
    fontWeight: '700'
  },
  joined: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  joinedText: {
    fontSize: 18,
    color: '#4CAF50',
    marginLeft: 10,
  },
});

export default TournamentDetailScreen;