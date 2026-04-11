/**
 * PauseOverlay — modal shown over the game world when the player pauses.
 * Keeps the game running (music/effects already halted by GameScreen)
 * but blocks input and offers resume / restart / menu.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';

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
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>PAUSED</Text>
        <Text style={styles.title}>{levelName.toUpperCase()}</Text>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.primaryBtn} onPress={onResume} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>RESUME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onRestart} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>RESTART LEVEL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryBtn} onPress={onQuit} activeOpacity={0.8}>
          <Text style={styles.tertiaryBtnText}>QUIT TO MENU</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>ESC to resume • R to restart</Text>
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
    width: 320,
    padding: 28,
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
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: BRAND.gold,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    width: 80,
    backgroundColor: BRAND.sunsetOrange,
    marginVertical: 18,
    borderRadius: 2,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: BRAND.neonTeal,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND.gold,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryBtnText: {
    color: BRAND.gold,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tertiaryBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BRAND.reggaeRed,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    color: BRAND.reggaeRed,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  hint: {
    marginTop: 16,
    color: 'rgba(245, 241, 232, 0.5)',
    fontSize: 11,
    letterSpacing: 1,
  },
});
