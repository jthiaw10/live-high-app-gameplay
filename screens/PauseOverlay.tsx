/**
 * PauseOverlay — modal shown over the game world when the player pauses.
 * Keeps the game running (music/effects already halted by GameScreen)
 * but blocks input and offers resume / restart / menu.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { useResponsive } from '../hooks/useResponsive';

interface PauseOverlayProps {
  levelName: string;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({
  levelName,
  onResume,
  onRestart,
  onQuit,
}: PauseOverlayProps) {
  const { modalWidth, font, uiScale } = useResponsive();
  const cardPad = Math.round(20 * uiScale);
  const btnPad = Math.round(12 * uiScale);
  const btnGap = Math.round(8 * uiScale);

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { width: modalWidth, padding: cardPad }]}>
        <Text style={[styles.eyebrow, { fontSize: font(12) }]}>PAUSED</Text>
        <Text style={[styles.title, { fontSize: font(22) }]}>{levelName.toUpperCase()}</Text>
        <View style={[styles.divider, { marginVertical: Math.round(14 * uiScale) }]} />

        <TouchableOpacity
          style={[styles.primaryBtn, { paddingVertical: btnPad, marginBottom: btnGap }]}
          onPress={onResume}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryBtnText, { fontSize: font(16) }]}>RESUME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { paddingVertical: btnPad, marginBottom: btnGap }]}
          onPress={onRestart}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryBtnText, { fontSize: font(15) }]}>RESTART LEVEL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tertiaryBtn, { paddingVertical: btnPad }]}
          onPress={onQuit}
          activeOpacity={0.8}
        >
          <Text style={[styles.tertiaryBtnText, { fontSize: font(14) }]}>QUIT TO MENU</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { fontSize: font(11), marginTop: Math.round(12 * uiScale) }]}>
          ESC to resume • R to restart
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 8, 22, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: BRAND.nightPurple,
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
    alignItems: 'center',
    shadowColor: BRAND.neonTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  eyebrow: {
    color: BRAND.neonTeal,
    letterSpacing: 5,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: BRAND.gold,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    width: 80,
    backgroundColor: BRAND.sunsetOrange,
    borderRadius: 2,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: BRAND.neonTeal,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND.gold,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: BRAND.gold,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tertiaryBtn: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND.reggaeRed,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    color: BRAND.reggaeRed,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  hint: {
    color: 'rgba(245, 241, 232, 0.5)',
    letterSpacing: 1,
  },
});
