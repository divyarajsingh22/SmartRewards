import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWalletTransactions } from '../services/api';

const TransactionItem = ({ item }) => {
  const related = item.relatedModel ? `${item.relatedModel}` : '';
  const relatedName = item.relatedId && item.relatedId.name ? ` - ${item.relatedId.name}` : '';
  return (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <Text style={styles.txDesc}>{item.description}</Text>
        <Text style={styles.txMeta}>{related}{relatedName}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, item.amount >= 0 ? styles.positive : styles.negative]}>+{item.amount}</Text>
        <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

const TournamentWalletScreen = ({ route, navigation, user }) => {
  const { tournamentId } = route?.params || {};
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user || !user._id) return;
    try {
      const resp = await getWalletTransactions(user._id);
      const txs = resp.transactions || resp;
      const filtered = txs.filter(t => {
        if (!t) return false;
        if (!t.relatedModel) return false;
        if (t.relatedModel !== 'Tournament') return false;
        if (!t.relatedId) return true;
        const id = (t.relatedId._id || t.relatedId).toString();
        return tournamentId ? id === tournamentId.toString() : true;
      });
      setTransactions(filtered);
    } catch (err) {
      setTransactions([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tournament Wallet History</Text>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No tournament transactions found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 60, padding: 20, flexDirection: 'row', alignItems: 'center' },
  back: { marginRight: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  txLeft: { flex: 1 },
  txDesc: { color: '#fff', fontSize: 16, fontWeight: '600' },
  txMeta: { color: '#888', fontSize: 12, marginTop: 4 },
  txRight: { alignItems: 'flex-end', marginLeft: 12 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  positive: { color: '#4CAF50' },
  negative: { color: '#FF6B6B' },
  txDate: { color: '#888', fontSize: 12, marginTop: 4 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 }
});

export default TournamentWalletScreen;
