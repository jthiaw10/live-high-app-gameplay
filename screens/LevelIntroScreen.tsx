/**
 * LevelIntroScreen — brief card shown between levels.
 * Auto-advances after a short delay and also has a SKIP button.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

interface LevelIntroScreenProps {
  levelNumber: number;
  levelName: string;
  tagline: string;
  livesRemaining: number;
  runningScore: number;
  onContinue: () => void;
}

const AUTO_ADVANCE_MS = 2200;

export default function LevelIntroScreen({
  levelNumber,
  levelName,
  tagline,
  livesRemaining,
  runningScore,
  onContinue,
}: LevelIntroScreenProps) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      onContinue();
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(t);
  }, [fade, onContinue]);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <Text style={styles.eyebrow}>LEVEL {levelNumber}</Text>
      <Text style={styles.title}>{levelName.toUpperCase()}</Text>
      <Text style={styles.tagline}>{tagline}</Text>

      <View style={styles.divider} />

      <View style={styles.stats}>
        <Text style={styles.statText}>LIVES  {livesRemaining}</Text>
        <Text style={styles.statText}>SCORE  {runningScore}</Text>
      </View>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => {
          audio.play('menuClick');
          onContinue();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: BRAND.neonTeal,
    fontSize: 14,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 10,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  tagline: {
    color: BRAND.offWhite,
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 1,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    width: 100,
    backgroundColor: BRAND.sunsetOrange,
    marginVertical: 24,
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 30,
  },
  statText: {
    color: BRAND.neonTeal,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  skipBtn: {
    position: 'absolute',
    bottom: 30,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  skipText: {
    color: BRAND.neonTeal,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
});
