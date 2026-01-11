import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

const WalletStack = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletScreen">
        {(props) => <WalletScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default WalletStack;