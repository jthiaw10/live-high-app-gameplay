/**
 * LevelCompleteOverlay — shown when the player touches the goal portal.
 * Displays per-level stats and hands off to the scene manager via onNext.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { LevelResult } from './GameScreen';

interface LevelCompleteOverlayProps {
  levelName: string;
  result: LevelResult;
  onNext: () => void;
}

export default function LevelCompleteOverlay({
  levelName,
  result,
  onNext,
}: LevelCompleteOverlayProps) {
  const allCoins = result.coinsCollected === result.coinsTotal;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>UPLINK COMPLETE</Text>
        <Text style={styles.title}>{levelName.toUpperCase()}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Hi-Fi Collected</Text>
          <Text style={[styles.value, allCoins && { color: BRAND.reggaeGreen }]}>
            {result.coinsCollected} / {result.coinsTotal}
            {allCoins ? '  PERFECT' : ''}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>EXP Earned</Text>
          <Text style={styles.value}>+{result.exp}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Clear Bonus</Text>
          <Text style={styles.value}>+{result.bonus}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>LEVEL SCORE</Text>
          <Text style={styles.totalValue}>{result.exp + result.bonus}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>CONTINUE</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(10, 8, 22, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 360,
    padding: 28,
    borderRadius: 18,
    backgroundColor: BRAND.nightPurple,
    borderWidth: 2,
    borderColor: BRAND.gold,
    alignItems: 'stretch',
    shadowColor: BRAND.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 22,
  },
  eyebrow: {
    color: BRAND.neonTeal,
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    color: BRAND.gold,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 6,
  },
  divider: {
    height: 2,
    width: 80,
    backgroundColor: BRAND.sunsetOrange,
    alignSelf: 'center',
    marginVertical: 16,
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: BRAND.offWhite,
    fontSize: 14,
    letterSpacing: 1,
  },
  value: {
    color: BRAND.neonTeal,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 216, 77, 0.3)',
    marginBottom: 20,
  },
  totalLabel: {
    color: BRAND.gold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  totalValue: {
    color: BRAND.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
