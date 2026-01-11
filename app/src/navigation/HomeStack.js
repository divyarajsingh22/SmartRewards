import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const HomeStack = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen">
        {(props) => <HomeScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default HomeStack;