/**
 * MainMenuScreen — branded title screen.
 * Blaze Runner logo, neon gradient frame, start/settings/credits buttons.
 * Plays a menu sting and warms up the audio context on first press.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { BRAND } from '../config/constants';
import { audio } from '../lib/audio';

interface MainMenuScreenProps {
  onPlay: () => void;
  onSettings: () => void;
  onCredits: () => void;
  highScore: number;
}

export default function MainMenuScreen({
  onPlay,
  onSettings,
  onCredits,
  highScore,
}: MainMenuScreenProps) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bob]);

  const click = (fn: () => void) => () => {
    audio.ensureReady();
    audio.play('menuClick');
    fn();
  };

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View style={styles.container}>
      {/* Background grid accent */}
      <View style={styles.gridTop} />
      <View style={styles.gridBottom} />

      {/* Hero */}
      <Animated.View style={[styles.hero, { transform: [{ translateY }] }]}>
        <Image
          source={require('../assets/BLAZE STANDING.png')}
          style={styles.heroSprite}
          resizeMode="stretch"
        />
      </Animated.View>

      <Text style={styles.eyebrow}>JAMAICA 2420</Text>
      <Text style={styles.title}>BLAZE RUNNER</Text>
      <Text style={styles.subtitle}>A reggae-cyberpunk platformer</Text>

      <View style={styles.menuStack}>
        <TouchableOpacity style={styles.primaryBtn} onPress={click(onPlay)} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={click(onSettings)}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>SETTINGS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={click(onCredits)}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>CREDITS</Text>
        </TouchableOpacity>
      </View>

      {highScore > 0 && (
        <Text style={styles.highScore}>BEST SCORE  {highScore}</Text>
      )}

      <Text style={styles.footer}>
        ARROWS / WASD to move  •  SPACE to jump  •  ESC to pause
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: BRAND.deepPurple,
    borderBottomWidth: 3,
    borderBottomColor: BRAND.sunsetOrange,
  },
  gridBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: BRAND.deepPurple,
    borderTopWidth: 3,
    borderTopColor: BRAND.neonTeal,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heroSprite: {
    // Blaze standing is now tight-cropped (aspect 0.417 after crop).
    width: 92,
    height: 220,
  },
  eyebrow: {
    color: BRAND.reggaeGreen,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: 'bold',
    marginTop: 4,
  },
  title: {
    color: BRAND.gold,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginTop: 4,
  },
  subtitle: {
    color: BRAND.neonTeal,
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 6,
    marginBottom: 28,
  },
  menuStack: {
    width: 280,
    alignItems: 'stretch',
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
  },
  secondaryBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  secondaryBtnText: {
    color: BRAND.neonTeal,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  highScore: {
    marginTop: 22,
    color: BRAND.gold,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    color: BRAND.offWhite,
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.65,
  },
});
