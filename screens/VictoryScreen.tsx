/**
 * VictoryScreen — shown after all levels are cleared.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

interface VictoryScreenProps {
  finalScore: number;
  livesRemaining: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function VictoryScreen({
  finalScore,
  livesRemaining,
  onPlayAgain,
  onMenu,
}: VictoryScreenProps) {
  useEffect(() => {
    audio.play('victory');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>UPLINK ESTABLISHED</Text>
      <Text style={styles.title}>VICTORY</Text>
      <Text style={styles.subtitle}>Blaze reaches the rooftop sound system.</Text>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{finalScore}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>LIVES LEFT</Text>
          <Text style={styles.statValue}>{livesRemaining}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            audio.play('menuClick');
            onPlayAgain();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
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
    color: BRAND.reggaeGreen,
    fontSize: 14,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 10,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: BRAND.neonTeal,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 8,
  },
  divider: {
    height: 2,
    width: 120,
    backgroundColor: BRAND.sunsetOrange,
    marginVertical: 26,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: {
    color: BRAND.neonTeal,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  statValue: {
    color: BRAND.gold,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 4,
  },
  actions: {
    marginTop: 40,
    width: 280,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: BRAND.reggaeGreen,
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
