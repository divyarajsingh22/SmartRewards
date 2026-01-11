import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const TimerBar = ({ duration, onComplete, isActive }) => {
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.timing(progress, {
        toValue: 0,
        duration: duration * 1000,
      }).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    } else {
      progress.setValue(1);
    }
  }, [isActive, duration]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['#FF4444', '#FF8800', '#FFB800', '#4ECDC4'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            width,
            backgroundColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default TimerBar;
