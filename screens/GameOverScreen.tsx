/**
 * GameOverScreen — shown when the player runs out of lives.
 * Offers restart and return-to-menu.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

interface GameOverScreenProps {
  finalScore: number;
  onRetry: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ finalScore, onRetry, onMenu }: GameOverScreenProps) {
  useEffect(() => {
    audio.play('gameOver');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SIGNAL LOST</Text>
      <Text style={styles.title}>GAME OVER</Text>

      <View style={styles.divider} />

      <Text style={styles.scoreLabel}>FINAL SCORE</Text>
      <Text style={styles.scoreValue}>{finalScore}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            audio.play('menuClick');
            onRetry();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>RUN IT BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            audio.play('menuClick');
            onMenu();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>MAIN MENU</Text>
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
    padding: 24,
  },
  eyebrow: {
    color: BRAND.reggaeRed,
    fontSize: 14,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.offWhite,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 10,
    textShadowColor: BRAND.reggaeRed,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  divider: {
    height: 2,
    width: 120,
    backgroundColor: BRAND.reggaeRed,
    marginVertical: 26,
    borderRadius: 2,
  },
  scoreLabel: {
    color: BRAND.neonTeal,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: BRAND.gold,
    fontSize: 48,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 2,
  },
  actions: {
    marginTop: 40,
    width: 280,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  secondaryBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  secondaryBtnText: {
    color: BRAND.neonTeal,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
