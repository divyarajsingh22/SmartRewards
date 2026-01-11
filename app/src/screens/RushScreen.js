import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RushScreen = ({ user }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rush</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DailyRushScreen', { user })}>
        <Text style={styles.buttonText}>Play Daily Rush</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TournamentDetailScreen')}>
        <Text style={styles.buttonText}>Join Tournament Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60, alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 24 },
  button: { backgroundColor: '#FFB800', padding: 16, borderRadius: 12, marginTop: 12, width: '80%', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '700' },
});

export default RushScreen;
