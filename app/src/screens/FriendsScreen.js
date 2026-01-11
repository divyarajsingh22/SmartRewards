import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriends } from '../services/api';

const FriendsScreen = ({ user }) => {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user || !user._id) return;
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        getFriends(user._id),
        getFriendRequests(user._id)
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Enter friend email');
      return;
    }
    try {
      await sendFriendRequest(user._id, email);
      Alert.alert('Success', 'Friend request sent');
      setEmail('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await respondToFriendRequest(requestId, action);
      loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friend}>
      <Text style={styles.friendName}>{item.friend.name}</Text>
      <Text style={styles.friendEmail}>{item.friend.email}</Text>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={styles.request}>
      <Text style={styles.requestName}>{item.requester.name}</Text>
      <Text style={styles.requestEmail}>{item.requester.email}</Text>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRespond(item._id, 'accept')}
        >
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRespond(item._id, 'reject')}
        >
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
      </View>

      <View style={styles.addFriend}>
        <TextInput
          style={styles.input}
          placeholder="Friend's email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest}>
          <Text style={styles.sendText}>Send Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friend Requests ({requests.length})</Text>
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No friends yet</Text>}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addFriend: {
    padding: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  sendText: {
    color: '#000',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  request: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  requestName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestEmail: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 10,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  friend: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendEmail: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    padding: 20,
  },
});

export default FriendsScreen;