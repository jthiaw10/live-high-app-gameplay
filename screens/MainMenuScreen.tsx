/**
 * MainMenuScreen — branded title screen.
 * Blaze Runner logo, neon gradient frame, start/settings/credits buttons.
 * Plays a menu sting and warms up the audio context on first press.
 *
 * Layout adapts to short landscape viewports (phone horizontal) by
 * shifting the hero to the left and stacking text/menu on the right.
 * Taller viewports keep the original centered-column layout.
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
import { useResponsive } from '../hooks/useResponsive';

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
  const { width, height, insets, isLandscape, shortEdge, font, uiScale } = useResponsive();

  // "Short" = phone-in-landscape territory where vertical space is tight.
  const useRowLayout = isLandscape && shortEdge < 560;

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

  const gridTopH = Math.max(40, Math.min(140, Math.round(height * 0.14)));
  const gridBotH = Math.max(28, Math.min(90, Math.round(height * 0.1)));
  const heroH = Math.round(
    useRowLayout ? Math.min(shortEdge * 0.75, 260) : Math.min(shortEdge * 0.55, 240)
  );
  const heroW = Math.round(heroH * (92 / 220));
  const titleSize = font(useRowLayout ? 42 : 52);
  const menuStackW = Math.min(320, Math.round(width * 0.5));
  const primaryVPad = Math.round(14 * uiScale);
  const secondaryVPad = Math.round(12 * uiScale);

  const content = (
    <>
      <Animated.View style={[styles.hero, { transform: [{ translateY }] }]}>
        <Image
          source={require('../assets/BLAZE STANDING.png')}
          style={{ width: heroW, height: heroH }}
          resizeMode="stretch"
        />
      </Animated.View>

      <View style={styles.textCol}>
        <Text style={[styles.eyebrow, { fontSize: font(13) }]}>JAMAICA 2420</Text>
        <Text style={[styles.title, { fontSize: titleSize }]}>BLAZE RUNNER</Text>
        <Text style={[styles.subtitle, { fontSize: font(14), marginBottom: Math.round(22 * uiScale) }]}>
          A reggae-cyberpunk platformer
        </Text>

        <View style={[styles.menuStack, { width: menuStackW, gap: Math.round(10 * uiScale) }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { paddingVertical: primaryVPad }]}
            onPress={click(onPlay)}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { fontSize: font(20) }]}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { paddingVertical: secondaryVPad }]}
            onPress={click(onSettings)}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryBtnText, { fontSize: font(14) }]}>SETTINGS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { paddingVertical: secondaryVPad }]}
            onPress={click(onCredits)}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryBtnText, { fontSize: font(14) }]}>CREDITS</Text>
          </TouchableOpacity>
        </View>

        {highScore > 0 && (
          <Text style={[styles.highScore, { fontSize: font(14), marginTop: Math.round(18 * uiScale) }]}>
            BEST SCORE  {highScore}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Background grid accent */}
      <View style={[styles.gridTop, { height: gridTopH }]} />
      <View style={[styles.gridBottom, { height: gridBotH }]} />

      <View
        style={[
          useRowLayout ? styles.rowBody : styles.colBody,
          {
            paddingTop: gridTopH + Math.max(8, insets.top),
            paddingBottom: gridBotH + Math.max(8, insets.bottom),
            paddingHorizontal: Math.max(24, insets.left + 24, insets.right + 24),
            gap: useRowLayout ? Math.round(32 * uiScale) : 0,
          },
        ]}
      >
        {content}
      </View>

      <Text
        style={[
          styles.footer,
          { fontSize: font(11), bottom: Math.max(10, insets.bottom + 6) },
        ]}
      >
        ARROWS / WASD to move  •  SPACE to jump  •  ESC to pause
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
    overflow: 'hidden',
  },
  colBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND.deepPurple,
    borderBottomWidth: 3,
    borderBottomColor: BRAND.sunsetOrange,
  },
  gridBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND.deepPurple,
    borderTopWidth: 3,
    borderTopColor: BRAND.neonTeal,
  },
  hero: {
    alignItems: 'center',
  },
  textCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: BRAND.reggaeGreen,
    letterSpacing: 6,
    fontWeight: 'bold',
    marginTop: 4,
  },
  title: {
    color: BRAND.gold,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginTop: 4,
  },
  subtitle: {
    color: BRAND.neonTeal,
    letterSpacing: 2,
    marginTop: 6,
  },
  menuStack: {
    alignItems: 'stretch',
  },
  primaryBtn: {
    borderRadius: 12,
    backgroundColor: BRAND.sunsetOrange,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  primaryBtnText: {
    color: BRAND.nightPurple,
    fontWeight: '900',
    letterSpacing: 6,
  },
  secondaryBtn: {
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
  },
  secondaryBtnText: {
    color: BRAND.neonTeal,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  highScore: {
    color: BRAND.gold,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: BRAND.offWhite,
    letterSpacing: 1,
    opacity: 0.65,
  },
});
