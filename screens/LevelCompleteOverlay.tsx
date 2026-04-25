/**
 * LevelCompleteOverlay — shown when the player touches the goal portal.
 * Displays per-level stats and hands off to the scene manager via onNext.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { LevelResult } from './GameScreen';
import { useResponsive } from '../hooks/useResponsive';

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
  const { modalWidth, font, uiScale } = useResponsive();
  const allCoins = result.coinsCollected === result.coinsTotal;
  const cardPad = Math.round(22 * uiScale);

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { width: modalWidth, padding: cardPad }]}>
        <Text style={[styles.eyebrow, { fontSize: font(12) }]}>UPLINK COMPLETE</Text>
        <Text style={[styles.title, { fontSize: font(22) }]}>{levelName.toUpperCase()}</Text>

        <View style={[styles.divider, { marginVertical: Math.round(14 * uiScale) }]} />

        <View style={[styles.row, { marginBottom: Math.round(8 * uiScale) }]}>
          <Text style={[styles.label, { fontSize: font(14) }]}>Hi-Fi Collected</Text>
          <Text
            style={[
              styles.value,
              { fontSize: font(14) },
              allCoins && { color: BRAND.reggaeGreen },
            ]}
          >
            {result.coinsCollected} / {result.coinsTotal}
            {allCoins ? '  PERFECT' : ''}
          </Text>
        </View>

        <View style={[styles.row, { marginBottom: Math.round(8 * uiScale) }]}>
          <Text style={[styles.label, { fontSize: font(14) }]}>EXP Earned</Text>
          <Text style={[styles.value, { fontSize: font(14) }]}>+{result.exp}</Text>
        </View>

        <View style={[styles.row, { marginBottom: Math.round(8 * uiScale) }]}>
          <Text style={[styles.label, { fontSize: font(14) }]}>Clear Bonus</Text>
          <Text style={[styles.value, { fontSize: font(14) }]}>+{result.bonus}</Text>
        </View>

        <View
          style={[
            styles.totalRow,
            {
              marginTop: Math.round(8 * uiScale),
              paddingTop: Math.round(10 * uiScale),
              marginBottom: Math.round(16 * uiScale),
            },
          ]}
        >
          <Text style={[styles.totalLabel, { fontSize: font(16) }]}>LEVEL SCORE</Text>
          <Text style={[styles.totalValue, { fontSize: font(20) }]}>
            {result.exp + result.bonus}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { paddingVertical: Math.round(12 * uiScale) }]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryBtnText, { fontSize: font(16) }]}>CONTINUE</Text>
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
    letterSpacing: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    color: BRAND.gold,
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
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: BRAND.offWhite,
    letterSpacing: 1,
  },
  value: {
    color: BRAND.neonTeal,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 216, 77, 0.3)',
  },
  totalLabel: {
    color: BRAND.gold,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  totalValue: {
    color: BRAND.gold,
    fontWeight: 'bold',
  },
  primaryBtn: {
    borderRadius: 10,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
