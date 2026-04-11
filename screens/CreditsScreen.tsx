/**
 * CreditsScreen — project and brand credits.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

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
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ROLL CALL</Text>
      <Text style={styles.title}>CREDITS</Text>
      <View style={styles.divider} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {CREDITS.map((c) => (
          <View key={c.section} style={styles.block}>
            <Text style={styles.blockTitle}>{c.section}</Text>
            {c.lines.map((l, i) => (
              <Text key={i} style={styles.blockLine}>
                {l}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>

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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  scroll: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
  },
  scrollInner: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  block: {
    alignItems: 'center',
    marginBottom: 20,
  },
  blockTitle: {
    color: BRAND.neonTeal,
    fontSize: 13,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  blockLine: {
    color: BRAND.offWhite,
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 22,
  },
  backBtn: {
    marginTop: 10,
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
