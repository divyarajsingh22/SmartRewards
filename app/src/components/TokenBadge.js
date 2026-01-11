import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TokenBadge = ({ tokens, size = 'medium' }) => {
  const sizeStyles = {
    small: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 6, iconSize: 14 },
    medium: { fontSize: 16, paddingHorizontal: 14, paddingVertical: 8, iconSize: 18 },
    large: { fontSize: 22, paddingHorizontal: 18, paddingVertical: 10, iconSize: 24 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, { paddingHorizontal: currentSize.paddingHorizontal, paddingVertical: currentSize.paddingVertical }]}>
      <Ionicons name="diamond" size={currentSize.iconSize} color="#FFB800" style={styles.icon} />
      <Text style={[styles.text, { fontSize: currentSize.fontSize }]}>{tokens.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#FFB800',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

module.exports = TokenBadge;
