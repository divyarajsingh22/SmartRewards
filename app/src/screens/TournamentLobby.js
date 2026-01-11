import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getSocket } from '../services/socket';

const TournamentLobby = ({ navigation }) => {
  const route = useRoute();
  const tournamentId = route?.params?.tournamentId;
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!tournamentId) return;

    socket.emit('join-tournament', tournamentId);

    socket.on('tournament-update', (data) => {
      setPlayers(data.currentPlayers || []);
    });

    socket.on('leaderboard-update', (entry) => {
      setLeaderboard((prev) => {
        const updated = prev.filter((p) => p.userId !== entry.userId);
        updated.push(entry);
        return updated.sort((a, b) => b.score - a.score);
      });
    });

    socket.on('tournament-started', (data) => {
      // navigate to in-game screen or show questions when started
      navigation.navigate('DailyRushScreen', { user: null });
    });

    return () => {
      socket.emit('leave-tournament', tournamentId);
      socket.off('tournament-update');
      socket.off('leaderboard-update');
      socket.off('tournament-started');
    };
  }, [tournamentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournament Lobby</Text>
      <Text style={styles.sub}>Tournament: {tournamentId || 'N/A'}</Text>

      <View style={{ width: '90%', marginTop: 12 }}>
        <Text style={{ color: '#fff', marginBottom: 8 }}>Players</Text>
        <FlatList
          data={players}
          keyExtractor={(item) => item.userId || item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#222' }}>
              <Text style={{ color: '#fff' }}>{item.name || item.userId}</Text>
            </View>
          )}
        />
      </View>

      <View style={{ width: '90%', marginTop: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 8 }}>Leaderboard</Text>
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => (
            <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#222', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff' }}>{index + 1}. {item.userId}</Text>
              <Text style={{ color: '#FFD700' }}>{item.score}</Text>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60, alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  sub: { color: '#888', marginBottom: 24 },
  button: { backgroundColor: '#FFB800', padding: 12, borderRadius: 10 },
  buttonText: { color: '#000', fontWeight: '700' },
});

export default TournamentLobby;
