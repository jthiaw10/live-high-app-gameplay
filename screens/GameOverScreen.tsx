/**
 * GameOverScreen — shown when the player runs out of lives.
 * Offers restart and return-to-menu.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';
import { useResponsive } from '../hooks/useResponsive';

interface GameOverScreenProps {
  finalScore: number;
  onRetry: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ finalScore, onRetry, onMenu }: GameOverScreenProps) {
  const { insets, font, uiScale, width } = useResponsive();

  useEffect(() => {
    audio.play('gameOver');
  }, []);

  const actionsWidth = Math.min(320, Math.round(width * 0.55));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(24, insets.top + 20),
          paddingBottom: Math.max(24, insets.bottom + 20),
          paddingHorizontal: Math.max(24, insets.left + 24, insets.right + 24),
        },
      ]}
    >
      <Text style={[styles.eyebrow, { fontSize: font(14) }]}>SIGNAL LOST</Text>
      <Text style={[styles.title, { fontSize: font(52) }]}>GAME OVER</Text>

      <View style={[styles.divider, { marginVertical: Math.round(22 * uiScale) }]} />

      <Text style={[styles.scoreLabel, { fontSize: font(14) }]}>FINAL SCORE</Text>
      <Text style={[styles.scoreValue, { fontSize: font(44) }]}>{finalScore}</Text>

      <View
        style={[
          styles.actions,
          { width: actionsWidth, marginTop: Math.round(32 * uiScale), gap: Math.round(10 * uiScale) },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryBtn, { paddingVertical: Math.round(14 * uiScale) }]}
          onPress={() => {
            audio.play('menuClick');
            onRetry();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { fontSize: font(18) }]}>RUN IT BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { paddingVertical: Math.round(12 * uiScale) }]}
          onPress={() => {
            audio.play('menuClick');
            onMenu();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { fontSize: font(14) }]}>MAIN MENU</Text>
        </TouchableOpacity>
      </View>
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
  eyebrow: {
    color: BRAND.reggaeRed,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.offWhite,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 8,
    textShadowColor: BRAND.reggaeRed,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  divider: {
    height: 2,
    width: 120,
    backgroundColor: BRAND.reggaeRed,
    borderRadius: 2,
  },
  scoreLabel: {
    color: BRAND.neonTeal,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: BRAND.gold,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 2,
  },
  actions: {
    alignItems: 'stretch',
  },
  primaryBtn: {
    borderRadius: 12,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontWeight: '900',
    letterSpacing: 4,
  },
  secondaryBtn: {
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  secondaryBtnText: {
    color: BRAND.neonTeal,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
