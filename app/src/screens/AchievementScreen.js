import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserAchievements, claimAchievement, getProfile } from '../services/api';
import { Alert } from 'react-native';

const AchievementScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState({ unlocked: [], locked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }
    try {
      const response = await getUserAchievements(user._id);
      setAchievements(response);
      setLoading(false);
    } catch (error) {
      setAchievements({ unlocked: [], locked: [] });
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beginner': return '#4ECDC4';
      case 'intermediate': return '#FFB800';
      case 'advanced': return '#FF6B35';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={32} color="#FFB800" />
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {(() => {
              const totalUnlocked = typeof achievements.totalUnlocked === 'number' ? achievements.totalUnlocked : (achievements.unlocked ? achievements.unlocked.length : 0);
              const totalAchievements = typeof achievements.totalAchievements === 'number' ? achievements.totalAchievements : ((achievements.unlocked ? achievements.unlocked.length : 0) + (achievements.locked ? achievements.locked.length : 0));
              return `${totalUnlocked}/${totalAchievements} Unlocked`;
            })()}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {(() => {
            const totalUnlocked = typeof achievements.totalUnlocked === 'number' ? achievements.totalUnlocked : (achievements.unlocked ? achievements.unlocked.length : 0);
            const totalAchievements = typeof achievements.totalAchievements === 'number' ? achievements.totalAchievements : ((achievements.unlocked ? achievements.unlocked.length : 0) + (achievements.locked ? achievements.locked.length : 0));
            const pct = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;
            return <View style={[styles.progressFill, { width: `${pct}%` }]} />;
          })()}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unlocked</Text>
        {(achievements.unlocked && achievements.unlocked.length > 0) ? (
          achievements.unlocked.map((achievement) => (
            <TouchableOpacity key={achievement.id} style={styles.achievementCard} onPress={async () => {
              // Try to claim if claimable, otherwise navigate to detail
              if (!user || !user._id) return Alert.alert('Login required');
              try {
                const res = await claimAchievement(user._id, achievement.id);
                if (res && res.success) {
                  Alert.alert('Reward Claimed', `You received ${res.tokensAwarded || achievement.tokenReward} tokens`);
                  // refresh achievements and profile
                  await loadAchievements();
                  if (setUser) {
                    const profile = await getProfile(user._id);
                    setUser(profile);
                  }
                } else {
                  // Navigate to detail if claim not supported
                  navigation.navigate('AchievementDetail', { achievement });
                }
              } catch (err) {
                // If claim endpoint not available, navigate to detail
                navigation.navigate('AchievementDetail', { achievement });
              }
            }}>
              <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(achievement.category) + '20' }]}>
                <Ionicons name={achievement.icon || 'trophy'} size={32} color={getCategoryColor(achievement.category)} />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
                <View style={styles.rewardBadge}>
                  <Ionicons name="diamond" size={14} color="#FFB800" />
                  <Text style={styles.rewardText}>+{achievement.tokenReward} tokens</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No achievements unlocked yet</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locked</Text>
        {(achievements.locked && achievements.locked.length > 0) ? (
          achievements.locked.map((achievement) => (
            <TouchableOpacity key={achievement.id} style={[styles.achievementCard, styles.lockedCard]} onPress={() => {
              // Show hint or navigate to detail for locked achievements
              Alert.alert('Locked', achievement.hint || 'Complete required tasks to unlock this achievement');
            }}>
              <View style={[styles.iconContainer, styles.lockedIcon]}>
                <Ionicons name={achievement.icon || 'lock-closed'} size={32} color="#555" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, styles.lockedText]}>{achievement.name}</Text>
                <Text style={[styles.achievementDesc, styles.lockedDesc]}>{achievement.description}</Text>
                <View style={styles.rewardBadge}>
                  <Ionicons name="diamond" size={14} color="#666" />
                  <Text style={[styles.rewardText, styles.lockedReward]}>+{achievement.tokenReward} tokens</Text>
                </View>
              </View>
              <Ionicons name="lock-closed" size={24} color="#555" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>All achievements unlocked!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: '#0F0F0F',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  achievementDesc: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  lockedText: {
    color: '#666',
  },
  lockedDesc: {
    color: '#555',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: '600',
  },
  lockedReward: {
    color: '#666',
  },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },
});

export default AchievementScreen;

