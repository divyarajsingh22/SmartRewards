import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BattleResultScreen = ({ route, user, setUser }) => {
  const { battle } = route.params;
  const navigation = useNavigation();

  const isWinner = battle.winner === user._id;
  const opponent = battle.players.find(p => p.user !== user._id);

  return (
    <View style={styles.container}>
      <Ionicons
        name={isWinner ? 'trophy' : 'close-circle'}
        size={64}
        color={isWinner ? '#FFD700' : '#FF4444'}
      />
      <Text style={styles.title}>
        {isWinner ? 'Victory!' : 'Defeat'}
      </Text>
      <Text style={styles.score}>
        Your Score: {battle.scores[user._id]}
      </Text>
      <Text style={styles.score}>
        Opponent Score: {battle.scores[opponent.user]}
      </Text>
      <Text style={styles.reward}>
        {isWinner ? '+18 Tokens' : '+2 Tokens'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PlayScreen')}
      >
        <Text style={styles.buttonText}>Play Again</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  score: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  reward: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default BattleResultScreen;