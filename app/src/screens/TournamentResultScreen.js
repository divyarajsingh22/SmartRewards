import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTournamentResults } from '../services/api';

const TournamentResultScreen = ({ route, user }) => {
  const { tournamentId } = route.params;
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await getTournamentResults(tournamentId);
      setResults(data);
    } catch (error) {
    }
  };

  const renderResult = ({ item, index }) => (
    <View style={[styles.result, item.user === user._id && styles.myResult]}>
      <View style={styles.rankWrap}>
        {index === 0 ? <Ionicons name="medal" size={28} color="#FFD700" /> : index === 1 ? <Ionicons name="medal" size={24} color="#C0C0C0" /> : index === 2 ? <Ionicons name="medal" size={20} color="#CD7F32" /> : <Text style={styles.rank}>#{index + 1}</Text>}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.score} pts • {item.accuracy ? `${Math.round(item.accuracy)}%` : '—'}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.prize}>{item.prize} tokens</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={48} color="#FFD700" />
        <Text style={styles.title}>Tournament Results</Text>
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  list: {
    padding: 16,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 10,
    minHeight: 64,
  },
  myResult: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankWrap: { width: 56, alignItems: 'center', justifyContent: 'center' },
  rank: { fontSize: 16, color: '#FFD700', fontWeight: '700' },
  info: { flex: 1, paddingLeft: 8 },
  name: { fontSize: 16, color: '#fff', fontWeight: '700' },
  meta: { color: '#888', marginTop: 4 },
  right: { alignItems: 'flex-end', minWidth: 100 },
  prize: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
});

export default TournamentResultScreen;