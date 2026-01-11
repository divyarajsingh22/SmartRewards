import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUpcomingTournaments, getJoinedTournaments, getTournamentHistory, joinTournament } from '../services/api';

const TournamentScreen = ({ user }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [joined, setJoined] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const up = await getUpcomingTournaments();
      setUpcoming(up);
      const join = await getJoinedTournaments(user._id);
      setJoined(join);
      const hist = await getTournamentHistory(user._id);
      setHistory(hist);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTournament = ({ item }) => (
    <TouchableOpacity
      style={styles.tournamentCard}
      onPress={() => navigation.navigate('TournamentDetailScreen', { tournamentId: item._id })}
    >
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentName}>{item.name}</Text>
        <Text style={styles.tournamentPrize}>{item.prizePool} tokens</Text>
      </View>
      <Text style={styles.tournamentPlayers}>
        {item.players?.length || 0}/{item.maxPlayers} players
      </Text>
      <Text style={styles.tournamentTime}>
        Starts: {new Date(item.startTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={styles.tournamentCard}
      onPress={() => navigation.navigate('TournamentResultScreen', { tournamentId: item._id })}
    >
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentName}>{item.name}</Text>
        <Text style={styles.tournamentPrize}>Completed</Text>
      </View>
      <Text style={styles.tournamentTime}>
        Ended: {new Date(item.endTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'joined', label: 'Joined' },
    { key: 'results', label: 'Results' },
    { key: 'history', label: 'History' },
  ];

  const handleJoinTournament = async (tournament) => {
    try {
      const response = await joinTournament(tournament.id, user.id);
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      Alert.alert('Success', 'Joined tournament successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('TournamentLobby', { tournament, user }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to join tournament');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tournaments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={
          activeTab === 'upcoming' ? upcoming :
          activeTab === 'joined' ? joined :
          activeTab === 'results' ? joined.filter(t => t.status === 'completed') :
          history
        }
        renderItem={activeTab === 'results' || activeTab === 'history' ? renderResult : renderTournament}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  tournamentCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tournamentHeader: {
    marginBottom: 8,
  },
  tournamentName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tournamentPrize: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 4,
  },
  tournamentPlayers: {
    color: '#888',
    fontSize: 14,
  },
  tournamentTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  }
});

export default TournamentScreen;
