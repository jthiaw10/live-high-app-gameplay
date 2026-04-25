/**
 * VictoryScreen — shown after all levels are cleared.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';
import { useResponsive } from '../hooks/useResponsive';

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
  const { insets, font, uiScale, width } = useResponsive();

  useEffect(() => {
    audio.play('victory');
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
      <Text style={[styles.eyebrow, { fontSize: font(14) }]}>UPLINK ESTABLISHED</Text>
      <Text style={[styles.title, { fontSize: font(52) }]}>VICTORY</Text>
      <Text style={[styles.subtitle, { fontSize: font(14) }]}>
        Blaze reaches the rooftop sound system.
      </Text>

      <View style={[styles.divider, { marginVertical: Math.round(22 * uiScale) }]} />

      <View style={[styles.statsRow, { gap: Math.round(36 * uiScale) }]}>
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { fontSize: font(12) }]}>SCORE</Text>
          <Text style={[styles.statValue, { fontSize: font(34) }]}>{finalScore}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { fontSize: font(12) }]}>LIVES LEFT</Text>
          <Text style={[styles.statValue, { fontSize: font(34) }]}>{livesRemaining}</Text>
        </View>
      </View>

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
            onPlayAgain();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { fontSize: font(18) }]}>PLAY AGAIN</Text>
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
    color: BRAND.reggaeGreen,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 8,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: BRAND.neonTeal,
    letterSpacing: 1,
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    width: 120,
    backgroundColor: BRAND.sunsetOrange,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: {
    color: BRAND.neonTeal,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  statValue: {
    color: BRAND.gold,
    fontWeight: '900',
    marginTop: 4,
  },
  actions: {
    alignItems: 'stretch',
  },
  primaryBtn: {
    borderRadius: 12,
    backgroundColor: BRAND.reggaeGreen,
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
