import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TokenBadge from '../components/TokenBadge';
import StreakBadge from '../components/StreakBadge';

const ResultScreen = ({ navigation, route }) => {
  const { result, user } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const accuracy = Math.round(result.accuracy);
  const isGoodPerformance = accuracy >= 70;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.iconCircle, isGoodPerformance && styles.iconCircleSuccess]}>
            <Ionicons 
              name={isGoodPerformance ? "checkmark-circle" : "stats-chart"} 
              size={64} 
              color={isGoodPerformance ? "#FFB800" : "#888"} 
            />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Game Complete!</Text>
          <Text style={styles.subtitle}>Your Daily Rush Results</Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFB800" />
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{result.score}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="locate" size={24} color="#4ECDC4" />
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#FFB800" />
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={styles.statValue}>
              {result.correctCount}/{result.totalQuestions}
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.rewardsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.rewardsTitle}>Rewards Earned</Text>

          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Ionicons name="diamond" size={28} color="#FFB800" />
              <Text style={styles.rewardLabel}>Tokens</Text>
            </View>
            <TokenBadge tokens={result.tokensEarned} size="large" />
          </View>

          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Ionicons name="flame" size={28} color="#FF6B35" />
              <Text style={styles.rewardLabel}>Streak Multiplier</Text>
            </View>
            <StreakBadge streak={result.streak} />
            <Text style={styles.multiplierText}>
              {result.streakMultiplier}x multiplier applied
            </Text>
          </View>

          {result.achievements && result.achievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.achievementsTitle}>New Achievements!</Text>
              {result.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementBadge}>
                  <Ionicons name="trophy" size={20} color="#FFB800" />
                  <Text style={styles.achievementText}>{achievement.name}</Text>
                  <Text style={styles.achievementTokens}>+{achievement.tokens}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Wallet', { user })}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet" size={20} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>View Wallet</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  iconCircleSuccess: {
    borderColor: '#FFB800',
    backgroundColor: '#FFB80020',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFB800',
    fontSize: 24,
    fontWeight: '700',
  },
  rewardsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  rewardsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rewardLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  multiplierText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  achievementsContainer: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  achievementsTitle: {
    color: '#FFB800',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#0F0F0F',
    borderRadius: 8,
  },
  achievementText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementTokens: {
    color: '#FFB800',
    fontSize: 14,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultScreen;
