import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/ProfileScreen';
import AchievementScreen from '../screens/AchievementScreen';
import ReferralScreen from '../screens/ReferralScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FriendsScreen from '../screens/FriendsScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen">
        {(props) => <ProfileScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="AchievementScreen">
        {(props) => <AchievementScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="ReferralScreen">
        {(props) => <ReferralScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="SettingsScreen">
        {(props) => <SettingsScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="FriendsScreen">
        {(props) => <FriendsScreen {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default ProfileStack;