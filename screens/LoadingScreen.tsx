/**
 * LoadingScreen — brief boot splash before the main menu.
 * Image assets are handled via require() so they're bundled at build
 * time; this screen is mostly a brand beat but it also gives the
 * main menu a moment to mount cleanly.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { BRAND } from '../config/constants';

interface LoadingScreenProps {
  onDone: () => void;
}

const BOOT_MS = 900;

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const dot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dot, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const t = setTimeout(() => onDone(), BOOT_MS);
    return () => clearTimeout(t);
  }, [dot, onDone]);

  const opacity = dot.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Copy of EXP LOGO.gif')}
        style={styles.logo}
        resizeMode="stretch"
      />
      <Text style={styles.title}>BLAZE RUNNER</Text>
      <Animated.Text style={[styles.loading, { opacity }]}>
        BOOTING SOUND SYSTEM...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // EXP LOGO is ~1.86:1 after crop
    width: 186,
    height: 100,
    marginBottom: 20,
  },
  title: {
    color: BRAND.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  loading: {
    color: BRAND.neonTeal,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 30,
    fontWeight: 'bold',
  },
});
