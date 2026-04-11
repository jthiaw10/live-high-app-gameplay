/**
 * PlayerSprite — visual layer for Blaze.
 *
 * Four source frames:
 *   - Idle:       BLAZE STANDING.png
 *   - Run frame 1: BLAZELOOP 1 Running.png  (left arm forward)
 *   - Run frame 2: BLAZELOOP RUN 2.png      (right arm forward)
 *   - Jump:       BLAZELOOP JUMPING.png
 *   - Flamethrow: BLAZELOOP FLAMETHROW.png
 *
 * The run animation alternates between the two run frames to produce
 * a natural arm-swinging stride.
 *
 * Priority: airborne → jump, shooting → flamethrow,
 *           running → run cycle, idle → standing.
 */

import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SPRITE_ASPECT } from '../config/constants';

interface PlayerSpriteProps {
  isRunning: boolean;
  facingRight: boolean;
  width: number;
  height: number;
  velocityY?: number;
  isGrounded?: boolean;
  isShooting?: boolean;
}

const RENDER_HEIGHT_FACTOR = 1.053;
const RUN_FRAME_MS = 260; // swap every 260ms → ~4fps run cycle

const RUN_FRAME_1 = require('../assets/BLAZELOOP 1 Running.png');
const RUN_FRAME_2 = require('../assets/BLAZELOOP RUN 2.png');

export default function PlayerSprite({
  isRunning,
  facingRight,
  width,
  height,
  velocityY = 0,
  isGrounded = true,
  isShooting = false,
}: PlayerSpriteProps) {
  const [runFrame, setRunFrame] = useState(0);
  const [tick, setTick] = useState(0);

  // Alternate between the two run frames.
  useEffect(() => {
    if (!isRunning || !isGrounded) {
      setRunFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setRunFrame((prev) => (prev + 1) % 2);
    }, RUN_FRAME_MS);
    return () => clearInterval(interval);
  }, [isRunning, isGrounded]);

  // Slow tick for idle bob.
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  // --- Sprite + aspect selection ---
  let sprite;
  let aspect: number;

  if (!isGrounded) {
    sprite = require('../assets/BLAZELOOP JUMPING.png');
    aspect = SPRITE_ASPECT.blazeJump;
  } else if (isShooting) {
    sprite = require('../assets/BLAZELOOP FLAME CHALACE.png');
    aspect = SPRITE_ASPECT.blazeFlame;
  } else if (isRunning) {
    sprite = runFrame === 0 ? RUN_FRAME_1 : RUN_FRAME_2;
    aspect = runFrame === 0 ? SPRITE_ASPECT.blazeRun1 : SPRITE_ASPECT.blazeRun2;
  } else {
    sprite = require('../assets/BLAZE STANDING.png');
    aspect = SPRITE_ASPECT.blazeIdle;
  }

  const renderH = height * RENDER_HEIGHT_FACTOR;
  const renderW = renderH * aspect;

  // Bottom-center on the collision box.
  const offsetX = (width - renderW) / 2;
  const offsetY = height - renderH;

  // --- Procedural animation ---
  const t = tick * 0.033;
  let bobY = 0;
  let sX = 1;
  let sY = 1;

  if (!isGrounded) {
    // Airborne squash/stretch.
    if (velocityY < 0) {
      const k = Math.min(1, Math.abs(velocityY) / 820);
      sY = 1 + k * 0.08;
      sX = 1 - k * 0.05;
    } else {
      const k = Math.min(1, velocityY / 900);
      sY = 1 - k * 0.05;
      sX = 1 + k * 0.03;
    }
  } else if (isRunning && !isShooting) {
    // Slight vertical bob synced to the frame swap.
    bobY = runFrame === 0 ? 1.5 : -1.5;
  } else if (!isShooting) {
    // Idle breathing bob.
    bobY = Math.sin(t * 3) * 1.5;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={sprite}
        style={[
          styles.sprite,
          {
            left: offsetX,
            top: offsetY,
            width: renderW,
            height: renderH,
            transform: [
              { translateY: bobY },
              { scaleX: (facingRight ? 1 : -1) * sX },
              { scaleY: sY },
            ],
          },
        ]}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible',
  },
  sprite: {
    position: 'absolute',
  },
});
