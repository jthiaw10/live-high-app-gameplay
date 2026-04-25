/**
 * SettingsScreen — volume/mute toggles.
 * Simple step-based sliders since the project has no slider component.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';
import { useResponsive } from '../hooks/useResponsive';

interface SettingsScreenProps {
  onBack: () => void;
}

const STEPS = 5; // 0..5 = 0%, 20%, 40%, 60%, 80%, 100%

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const initial = audio.getSettings();
  const [sfxStep, setSfxStep] = useState(Math.round(initial.sfxVolume * STEPS));
  const [musicStep, setMusicStep] = useState(Math.round(initial.musicVolume * STEPS));
  const [enabled, setEnabled] = useState(initial.masterEnabled);
  const { insets, font, uiScale, modalWidth } = useResponsive();

  const barSize = Math.round(18 * uiScale);

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
      <Text style={[styles.label, { fontSize: font(13) }]}>{label}</Text>
      <View style={styles.barRow}>
        {Array.from({ length: STEPS + 1 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSet(i)}
            style={[
              styles.bar,
              {
                width: barSize,
                height: barSize,
                backgroundColor: i <= step ? color : 'rgba(255,255,255,0.15)',
                borderColor: color,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.value, { color, fontSize: font(12) }]}>
        {Math.round((step / STEPS) * 100)}%
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(20, insets.top + 16),
          paddingBottom: Math.max(20, insets.bottom + 16),
          paddingHorizontal: Math.max(20, insets.left + 20, insets.right + 20),
        },
      ]}
    >
      <Text style={[styles.eyebrow, { fontSize: font(13) }]}>SYSTEM</Text>
      <Text style={[styles.title, { fontSize: font(40) }]}>SETTINGS</Text>
      <View style={[styles.divider, { marginVertical: Math.round(18 * uiScale) }]} />

      <View
        style={[
          styles.card,
          {
            width: modalWidth,
            padding: Math.round(18 * uiScale),
            gap: Math.round(14 * uiScale),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.toggleRow,
            {
              paddingVertical: Math.round(9 * uiScale),
              paddingHorizontal: Math.round(12 * uiScale),
              borderColor: enabled ? BRAND.reggaeGreen : BRAND.reggaeRed,
            },
          ]}
          onPress={toggleEnabled}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, { fontSize: font(13) }]}>AUDIO</Text>
          <Text
            style={[
              styles.toggleValue,
              { fontSize: font(16), color: enabled ? BRAND.reggaeGreen : BRAND.reggaeRed },
            ]}
          >
            {enabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {renderBar('SFX', sfxStep, applySfx, BRAND.neonTeal)}
        {renderBar('MUSIC', musicStep, applyMusic, BRAND.gold)}
      </View>

      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            marginTop: Math.round(22 * uiScale),
            paddingHorizontal: Math.round(36 * uiScale),
            paddingVertical: Math.round(12 * uiScale),
          },
        ]}
        onPress={() => {
          audio.play('menuClick');
          onBack();
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.backText, { fontSize: font(15) }]}>BACK</Text>
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
  },
  eyebrow: {
    color: BRAND.neonTeal,
    letterSpacing: 5,
    fontWeight: 'bold',
  },
  title: {
    color: BRAND.gold,
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
    borderRadius: 2,
  },
  card: {
    borderRadius: 14,
    backgroundColor: BRAND.deepPurple,
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: BRAND.offWhite,
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
    borderRadius: 3,
    borderWidth: 1,
  },
  value: {
    width: 48,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 2,
  },
  toggleValue: {
    fontWeight: '900',
    letterSpacing: 3,
  },
  backBtn: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  backText: {
    color: BRAND.gold,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
