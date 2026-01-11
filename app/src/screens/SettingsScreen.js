import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ user, setUser }) => {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            setUser(null);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="notifications" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Notifications</Text>
        <TouchableOpacity style={styles.toggle}>
          <Text style={styles.toggleText}>On</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="color-palette" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Theme</Text>
        <TouchableOpacity style={styles.toggle}>
          <Text style={styles.toggleText}>Dark</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="shield" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Privacy</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="help-circle" size={24} color="#FFD700" />
        <Text style={styles.menuText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color="#FF4444" />
        <Text style={[styles.menuText, { color: '#FF4444' }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
    flex: 1,
  },
  toggle: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  toggleText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;