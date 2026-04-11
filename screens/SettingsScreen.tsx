/**
 * SettingsScreen — volume/mute toggles.
 * Simple step-based sliders since the project has no slider component.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

interface SettingsScreenProps {
  onBack: () => void;
}

const STEPS = 5; // 0..5 = 0%, 20%, 40%, 60%, 80%, 100%

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initial = audio.getSettings();
  const [sfxStep, setSfxStep] = useState(Math.round(initial.sfxVolume * STEPS));
  const [musicStep, setMusicStep] = useState(Math.round(initial.musicVolume * STEPS));
  const [enabled, setEnabled] = useState(initial.masterEnabled);

  const applySfx = (step: number) => {
    setSfxStep(step);
    audio.setSfxVolume(step / STEPS);
    audio.play('menuClick');
  };
  const applyMusic = (step: number) => {
    setMusicStep(step);
    audio.setMusicVolume(step / STEPS);
  };
  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    audio.setEnabled(next);
    if (next) audio.play('menuClick');
  };

  const renderBar = (
    label: string,
    step: number,
    onSet: (n: number) => void,
    color: string
  ) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barRow}>
        {Array.from({ length: STEPS + 1 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSet(i)}
            style={[
              styles.bar,
              {
                backgroundColor: i <= step ? color : 'rgba(255,255,255,0.15)',
                borderColor: color,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.value, { color }]}>{Math.round((step / STEPS) * 100)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SYSTEM</Text>
      <Text style={styles.title}>SETTINGS</Text>
      <View style={styles.divider} />

      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.toggleRow, { borderColor: enabled ? BRAND.reggaeGreen : BRAND.reggaeRed }]}
          onPress={toggleEnabled}
          activeOpacity={0.8}
        >
          <Text style={styles.label}>AUDIO</Text>
          <Text style={[styles.toggleValue, { color: enabled ? BRAND.reggaeGreen : BRAND.reggaeRed }]}>
            {enabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {renderBar('SFX', sfxStep, applySfx, BRAND.neonTeal)}
        {renderBar('MUSIC', musicStep, applyMusic, BRAND.gold)}
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          audio.play('menuClick');
          onBack();
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.backText}>BACK</Text>
      </TouchableOpacity>
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
    color: BRAND.neonTeal,
    fontSize: 13,
    letterSpacing: 5,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 6,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  divider: {
    height: 2,
    width: 100,
    backgroundColor: BRAND.sunsetOrange,
    marginVertical: 22,
    borderRadius: 2,
  },
  card: {
    width: 340,
    padding: 20,
    borderRadius: 14,
    backgroundColor: BRAND.deepPurple,
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: BRAND.offWhite,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    width: 60,
  },
  barRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  bar: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
  },
  value: {
    width: 44,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  toggleValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  backBtn: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  backText: {
    color: BRAND.gold,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
