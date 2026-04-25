/**
 * GameControls — on-screen touch controls.
 *
 * Left pad:  ◀  ▶
 * Right pad: FIRE (visible once unlocked) + JUMP
 *
 * The FIRE button is always rendered but dimmed until the player
 * picks up the power (coins >= POWER_UNLOCK_COINS), at which point
 * it lights up orange. Tapping it when dimmed does nothing.
 *
 * Sizes scale with screen dimensions via useResponsive — on a
 * 900×400 phone in landscape, buttons end up ~80px tall with
 * safe-area padding for notch/home indicator.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BRAND } from '../config/constants';
import { useResponsive } from '../hooks/useResponsive';

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
  const { insets, buttonSize, primaryButtonSize, secondaryButtonSize, font } = useResponsive();

  const base = Math.round(buttonSize);
  const jump = Math.round(primaryButtonSize);
  const fire = Math.round(secondaryButtonSize);
  const gap = Math.max(10, Math.round(base * 0.18));
  const sidePad = Math.max(16, Math.round(base * 0.3));

  const buttonStyle = {
    width: base,
    height: base,
    borderRadius: base / 2,
  };
  const jumpStyle = {
    width: jump,
    height: jump,
    borderRadius: jump / 2,
  };
  const fireStyle = {
    width: fire,
    height: fire,
    borderRadius: fire / 2,
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom + Math.max(4, Math.round(base * 0.08)),
          paddingLeft: sidePad + insets.left,
          paddingRight: sidePad + insets.right,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.leftControls, { gap }]}>
        <TouchableOpacity
          style={[styles.button, buttonStyle]}
          onPressIn={onLeftPress}
          onPressOut={onLeftRelease}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { fontSize: font(24) }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, buttonStyle]}
          onPressIn={onRightPress}
          onPressOut={onRightRelease}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { fontSize: font(24) }]}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.rightControls, { gap }]}>
        <TouchableOpacity
          style={[
            styles.shootButton,
            fireStyle,
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
              { fontSize: font(16) },
              !powerUnlocked && { opacity: 0.4 },
            ]}
          >
            FIRE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.jumpButton, jumpStyle]}
          onPressIn={onJumpPress}
          onPressOut={onJumpRelease}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { fontSize: font(22) }]}>JUMP</Text>
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
    alignItems: 'flex-end',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: 'rgba(58, 106, 122, 0.8)',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.8)',
  },
  shootButton: {
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
    fontWeight: 'bold',
    color: '#fff',
  },
  shootButtonText: {
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
});
