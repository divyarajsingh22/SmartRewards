import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import SpinnerWheel from '../components/SpinnerWheel';
import { spinWheel } from '../services/api';

const SpinScreen = ({ route, navigation, user, setUser }) => {
  const [result, setResult] = useState(null);

  const handleComplete = async (segment) => {
    if (!user || !user._id) return Alert.alert('Login required');
    try {
      const res = await spinWheel(user._id);
      setResult(res);
      const updated = { ...user, tokens: res.balance };
      setUser && setUser(updated);
      Alert.alert('You won', `${res.amount} tokens`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Spin failed');
    }
  };

  const segments = [
    { label: '1' },
    { label: '2' },
    { label: '5' },
    { label: '10' },
    { label: '20' },
    { label: '50' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spin & Win</Text>
      </View>
      <View style={styles.content}>
        <SpinnerWheel segments={segments} onSpinComplete={handleComplete} />
        {result ? (
          <View style={styles.result}>
            <Text style={styles.resultText}>You won {result.amount} tokens</Text>
            <Text style={styles.balanceText}>Balance: {result.balance}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, padding: 20 },
  backButton: { marginRight: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  desc: { color: '#ccc', marginBottom: 24, textAlign: 'center' },
  spinButton: { backgroundColor: '#FFD700', padding: 18, borderRadius: 12, minWidth: 160, alignItems: 'center' },
  spinText: { fontWeight: '700' },
  result: { marginTop: 24, alignItems: 'center' },
  resultText: { color: '#FFD700', fontSize: 18, fontWeight: '700' },
  balanceText: { color: '#ccc', marginTop: 8 }
});

export default SpinScreen;
