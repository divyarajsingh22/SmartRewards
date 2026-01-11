import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StreakBadge = ({ streak }) => {
  const getStreakMultiplier = (streak) => {
    if (streak >= 30)
      return { multiplier: 3, color: "#FF6B35", glow: "#FF6B35" };
    if (streak >= 14)
      return { multiplier: 2, color: "#FFB800", glow: "#FFB800" };
    if (streak >= 7)
      return { multiplier: 1.5, color: "#4ECDC4", glow: "#4ECDC4" };
    return { multiplier: 1, color: "#888", glow: "#666" };
  };

  const { multiplier, color, glow } = getStreakMultiplier(streak);

  return (
    <View style={[styles.container, { borderColor: color, shadowColor: glow }]}>
      <Ionicons name="flame" size={18} color={color} style={styles.icon} />
      <Text style={styles.streak}>{streak}</Text>
      <View style={[styles.multiplierBadge, { backgroundColor: color + "20" }]}>
        <Text style={[styles.multiplier, { color }]}>×{multiplier}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 6,
  },
  streak: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    minWidth: 20,
    textAlign: "center",
  },
  multiplierBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  multiplier: {
    fontSize: 12,
    fontWeight: "700",
  },
});

module.exports = StreakBadge;
