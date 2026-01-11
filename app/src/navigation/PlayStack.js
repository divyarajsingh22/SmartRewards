import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlayScreen from '../screens/PlayScreen';
import DailyRushScreen from '../screens/DailyRushScreen';
import ResultScreen from '../screens/ResultScreen';
import QuickBattleScreen from '../screens/QuickBattleScreen';
import BattleResultScreen from '../screens/BattleResultScreen';
import SpinScreen from '../screens/SpinScreen';

const Stack = createNativeStackNavigator();

const PlayStack = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayScreen">
        {(props) => <PlayScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="DailyRushScreen">
        {(props) => <DailyRushScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="ResultScreen">
        {(props) => <ResultScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="QuickBattleScreen">
        {(props) => <QuickBattleScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="SpinScreen">
        {(props) => <SpinScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="BattleResultScreen">
        {(props) => <BattleResultScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default PlayStack;