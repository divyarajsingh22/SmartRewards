import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getReferrals, generateReferralCode } from '../services/api';

const ReferralScreen = ({ user }) => {
  const [referrals, setReferrals] = useState([]);
  const [code, setCode] = useState(user.referralCode || '');

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    if (!user || !user._id) return;
    try {
      const data = await getReferrals(user._id);
      setReferrals(data);
    } catch (error) {
      console.error('Error loading referrals:', error);
      setReferrals([]);
    }
  };

  const handleGenerateCode = async () => {
    if (!user || !user._id) return;
    try {
      const newCode = await generateReferralCode(user._id);
      setCode(newCode);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate code');
    }
  };

  const shareCode = () => {
    Alert.alert('Share Code', `Your referral code: ${code}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="gift" size={48} color="#FFD700" />
        <Text style={styles.title}>Refer & Earn</Text>
        <Text style={styles.subtitle}>Earn tokens when friends join</Text>
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        {code ? (
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{code}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={shareCode}>
              <Ionicons name="share" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateCode}>
            <Text style={styles.generateText}>Generate Code</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rewards}>
        <Text style={styles.sectionTitle}>Referral Rewards</Text>
        <Text style={styles.rewardText}>• 50 tokens when friend signs up</Text>
        <Text style={styles.rewardText}>• 25 tokens when friend reaches 100 tokens</Text>
        <Text style={styles.rewardText}>• 100 tokens when friend wins tournament</Text>
      </View>

      <View style={styles.friends}>
        <Text style={styles.sectionTitle}>Referred Friends ({referrals.length})</Text>
        {referrals.map((ref, index) => (
          <View key={index} style={styles.friend}>
            <Text style={styles.friendName}>{ref.name}</Text>
            <Text style={styles.friendStatus}>{ref.status}</Text>
          </View>
        ))}
      </View>
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
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 5,
  },
  codeSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  shareButton: {
    backgroundColor: '#FFB800',
    padding: 10,
    borderRadius: 6,
  },
  generateButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  rewards: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rewardText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  friends: {
    padding: 20,
  },
  friend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  friendName: {
    fontSize: 16,
    color: '#fff',
  },
  friendStatus: {
    fontSize: 14,
    color: '#FFD700',
  },
});

export default ReferralScreen;