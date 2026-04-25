/**
 * LevelIntroScreen — brief card shown between levels.
 * Auto-advances after a short delay and also has a SKIP button.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';
import { useResponsive } from '../hooks/useResponsive';

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
  const { insets, font, uiScale } = useResponsive();

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
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fade,
          paddingTop: Math.max(24, insets.top + 20),
          paddingBottom: Math.max(24, insets.bottom + 20),
          paddingHorizontal: Math.max(24, insets.left + 24, insets.right + 24),
        },
      ]}
    >
      <Text style={[styles.eyebrow, { fontSize: font(14) }]}>LEVEL {levelNumber}</Text>
      <Text style={[styles.title, { fontSize: font(40) }]}>{levelName.toUpperCase()}</Text>
      <Text style={[styles.tagline, { fontSize: font(14) }]}>{tagline}</Text>

      <View style={[styles.divider, { marginVertical: Math.round(20 * uiScale) }]} />

      <View style={[styles.stats, { gap: Math.round(28 * uiScale) }]}>
        <Text style={[styles.statText, { fontSize: font(14) }]}>LIVES  {livesRemaining}</Text>
        <Text style={[styles.statText, { fontSize: font(14) }]}>SCORE  {runningScore}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.skipBtn,
          {
            bottom: Math.max(20, insets.bottom + 14),
            paddingHorizontal: Math.round(22 * uiScale),
            paddingVertical: Math.round(9 * uiScale),
          },
        ]}
        onPress={() => {
          audio.play('menuClick');
          onContinue();
        }}
        activeOpacity={0.8}
      >
        <Text style={[styles.skipText, { fontSize: font(12) }]}>SKIP</Text>
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
  },
  eyebrow: {
    color: BRAND.neonTeal,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 10,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  tagline: {
    color: BRAND.offWhite,
    marginTop: 10,
    letterSpacing: 1,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    width: 100,
    backgroundColor: BRAND.sunsetOrange,
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    color: BRAND.neonTeal,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  skipBtn: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  skipText: {
    color: BRAND.neonTeal,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
});
