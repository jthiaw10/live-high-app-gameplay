/**
 * CreditsScreen — project and brand credits.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';
import { useResponsive } from '../hooks/useResponsive';

interface CreditsScreenProps {
  onBack: () => void;
}

const CREDITS = [
  { section: 'GAME', lines: ['Blaze Runner', 'A Jamaica 2420 platformer'] },
  {
    section: 'DESIGN & CODE',
    lines: ['Built on Expo + React Native', 'TypeScript game loop'],
  },
  {
    section: 'ART',
    lines: [
      'Blaze sprite sheets',
      'Kingston skyline parallax',
      'JDF policeman, drone, crab, seagull',
      'Palm trees, bushes, vinyl, trash cans',
    ],
  },
  {
    section: 'AUDIO',
    lines: ['Procedural Web Audio synthesis', '(drop-in slots for real samples)'],
  },
  {
    section: 'THANKS',
    lines: ['To the sound system culture.', 'Jah guide.'],
  },
];

export default function CreditsScreen({ onBack }: CreditsScreenProps) {
  const { insets, font, uiScale } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(30, insets.top + 20),
          paddingBottom: Math.max(16, insets.bottom + 12),
          paddingHorizontal: Math.max(20, insets.left + 20, insets.right + 20),
        },
      ]}
    >
      <Text style={[styles.eyebrow, { fontSize: font(13) }]}>ROLL CALL</Text>
      <Text style={[styles.title, { fontSize: font(40) }]}>CREDITS</Text>
      <View style={[styles.divider, { marginVertical: Math.round(16 * uiScale) }]} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {CREDITS.map((c) => (
          <View key={c.section} style={[styles.block, { marginBottom: Math.round(16 * uiScale) }]}>
            <Text style={[styles.blockTitle, { fontSize: font(13) }]}>{c.section}</Text>
            {c.lines.map((l, i) => (
              <Text key={i} style={[styles.blockLine, { fontSize: font(14), lineHeight: font(22) }]}>
                {l}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            marginTop: Math.round(8 * uiScale),
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
  scroll: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
  },
  scrollInner: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  block: {
    alignItems: 'center',
  },
  blockTitle: {
    color: BRAND.neonTeal,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  blockLine: {
    color: BRAND.offWhite,
    letterSpacing: 1,
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
