import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PlayScreen = ({ user }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Game</Text>
      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => navigation.navigate('DailyRushScreen')}
      >
        <Ionicons name="flash" size={48} color="#FFD700" />
        <Text style={styles.gameTitle}>Daily Rush</Text>
        <Text style={styles.gameDesc}>Answer questions fast to earn tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.gameButton}
        onPress={() => navigation.navigate('QuickBattleScreen')}
      >
        <Ionicons name="people" size={48} color="#FFD700" />
        <Text style={styles.gameTitle}>Quick Battle</Text>
        <Text style={styles.gameDesc}>1v1 async battle for tokens</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  gameButton: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
  },
  gameDesc: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default PlayScreen;