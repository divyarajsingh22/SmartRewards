import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';

const SIZE = 280;

const SpinnerWheel = ({ segments = [], onSpinComplete }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning || segments.length === 0) return;
    
    setSpinning(true);
    
    const segmentCount = segments.length;
    const chosenIndex = Math.floor(Math.random() * segmentCount);
    const segmentAngle = 360 / segmentCount;
    const extraDegrees = 360 - (chosenIndex * segmentAngle + segmentAngle / 2);
    const targetValue = 360 * 5 + extraDegrees;

    Animated.timing(rotation, {
      toValue: targetValue,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      rotation.setValue(targetValue % 360);
      if (onSpinComplete) {
        onSpinComplete(segments[chosenIndex], chosenIndex);
      }
    });
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.pointer} />
      <View style={styles.wheelContainer}>
        <Animated.View style={[styles.wheel, { transform: [{ rotate: rotateInterpolate }] }]}>
          {segments.map((s, i) => {
            const angle = (360 / segments.length) * i;
            return (
              <View key={i} style={[styles.segment, { transform: [{ rotate: `${angle}deg` }] }]}>
                <Text style={styles.segmentText}>{s.label}</Text>
              </View>
            );
          })}
        </Animated.View>
      </View>

      <TouchableOpacity 
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]} 
        onPress={spin} 
        disabled={spinning}
      >
        <Text style={styles.spinText}>{spinning ? 'Spinning...' : 'SPIN'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20 
  },
  wheelContainer: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: '#333',
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: SIZE / 2,
  },
  segment: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  segmentText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 14,
  },
  pointer: {
    marginBottom: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFB800',
    zIndex: 10,
  },
  spinButton: {
    marginTop: 30,
    backgroundColor: '#FFB800',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  spinButtonDisabled: { 
    opacity: 0.6 
  },
  spinText: { 
    fontWeight: '800', 
    fontSize: 18, 
    color: '#000' 
  },
});

export default SpinnerWheel;