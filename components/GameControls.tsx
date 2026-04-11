/**
 * GameControls — on-screen touch controls.
 *
 * Left pad:  ◀  ▶
 * Right pad: FIRE (visible once unlocked) + JUMP
 *
 * The FIRE button is always rendered but dimmed until the player
 * picks up the power (coins >= POWER_UNLOCK_COINS), at which point
 * it lights up orange. Tapping it when dimmed does nothing.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config/constants';

interface GameControlsProps {
  onLeftPress: () => void;
  onLeftRelease: () => void;
  onRightPress: () => void;
  onRightRelease: () => void;
  onJumpPress: () => void;
  onJumpRelease: () => void;
  onShootPress: () => void;
  powerUnlocked: boolean;
}

export default function GameControls({
  onLeftPress,
  onLeftRelease,
  onRightPress,
  onRightRelease,
  onJumpPress,
  onJumpRelease,
  onShootPress,
  powerUnlocked,
}: GameControlsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom,
          paddingLeft: 20 + Math.max(0, insets.left - 20),
          paddingRight: 20 + Math.max(0, insets.right - 20),
        },
      ]}
    >
      <View style={styles.leftControls}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={onLeftPress}
          onPressOut={onLeftRelease}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPressIn={onRightPress}
          onPressOut={onRightRelease}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rightControls}>
        <TouchableOpacity
          style={[
            styles.shootButton,
            !powerUnlocked && styles.shootButtonDimmed,
          ]}
          onPressIn={() => {
            if (powerUnlocked) onShootPress();
          }}
          activeOpacity={powerUnlocked ? 0.6 : 1}
        >
          <Text
            style={[
              styles.shootButtonText,
              !powerUnlocked && { opacity: 0.4 },
            ]}
          >
            FIRE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.jumpButton]}
          onPressIn={onJumpPress}
          onPressOut={onJumpRelease}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>JUMP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 15,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(58, 106, 122, 0.8)',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 107, 53, 0.8)',
  },
  shootButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(230, 57, 70, 0.85)',
    borderWidth: 3,
    borderColor: BRAND.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND.sunsetOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  shootButtonDimmed: {
    backgroundColor: 'rgba(58, 51, 82, 0.7)',
    borderColor: 'rgba(255, 216, 77, 0.3)',
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  shootButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
});
