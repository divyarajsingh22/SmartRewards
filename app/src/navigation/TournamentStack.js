import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TournamentScreen from '../screens/TournamentScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import TournamentResultScreen from '../screens/TournamentResultScreen';
import TournamentWalletScreen from '../screens/TournamentWalletScreen';

const Stack = createNativeStackNavigator();

const TournamentStack = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TournamentScreen">
        {(props) => <TournamentScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="TournamentDetailScreen">
        {(props) => <TournamentDetailScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="TournamentWalletScreen">
        {(props) => <TournamentWalletScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="TournamentResultScreen">
        {(props) => <TournamentResultScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default TournamentStack;