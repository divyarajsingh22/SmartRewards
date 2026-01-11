import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeStack from "./HomeStack";
import PlayStack from "./PlayStack";
import TournamentStack from "./TournamentStack";
import WalletStack from "./WalletStack";
import ProfileStack from "./ProfileStack";
import RushScreen from '../screens/RushScreen';

const Tab = createBottomTabNavigator();
const BottomTabNavigator = ({ user, setUser }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Play") {
            iconName = focused ? "play" : "play-outline";
          } else if (route.name === "Rush") {
            iconName = focused ? "flash" : "flash-outline";
          } else if (route.name === "Tournaments") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "Wallet") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FFD700",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#1a1a1a",
          borderTopColor: "#333",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeStack {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Play">
        {(props) => <PlayStack {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Rush">
        {(props) => <RushScreen {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Tournaments">
        {(props) => <TournamentStack {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Wallet">
        {(props) => <WalletStack {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfileStack {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;