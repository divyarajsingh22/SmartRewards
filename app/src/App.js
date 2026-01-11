import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" />
        <BottomTabNavigator user={user} setUser={setUser} />
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default App;