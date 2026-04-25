/**
 * useResponsive — central hook for landscape-oriented responsive UI.
 *
 * The game is locked to landscape, so the short edge (height) is the
 * limiting dimension for controls, HUD text, and modal cards. Every
 * UI size derives from `shortEdge` against a 400px baseline (typical
 * phone landscape height), clamped so tablets and desktop windows
 * don't get cartoonishly large chrome.
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_SHORT_EDGE = 400;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const shortEdge = Math.min(width, height);
    const longEdge = Math.max(width, height);
    const isLandscape = width >= height;
    const isCompact = shortEdge < 450;
    const isTablet = shortEdge >= 700;

    // UI scale driven by the short edge, clamped so large windows
    // don't blow buttons up to absurd sizes.
    const uiScale = clamp(shortEdge / BASE_SHORT_EDGE, 0.85, 1.55);

    // Typography scales a little more gently than buttons.
    const fontScale = clamp(shortEdge / BASE_SHORT_EDGE, 0.9, 1.35);
    const font = (base: number) => Math.round(base * fontScale);

    // Button sizing: ~20% of short edge, clamped for thumb ergonomics
    // (Apple HIG ≥44pt, aiming higher for a game).
    const buttonSize = clamp(shortEdge * 0.2, 60, 108);
    const primaryButtonSize = clamp(shortEdge * 0.26, 76, 130);
    const secondaryButtonSize = clamp(shortEdge * 0.2, 64, 112);

    // Modal width: 62% of short edge on compact screens, capped on big ones.
    const modalWidth = clamp(longEdge * 0.55, 320, 520);

    return {
      width,
      height,
      insets,
      shortEdge,
      longEdge,
      isLandscape,
      isCompact,
      isTablet,
      uiScale,
      fontScale,
      font,
      buttonSize,
      primaryButtonSize,
      secondaryButtonSize,
      modalWidth,
    };
  }, [width, height, insets.top, insets.bottom, insets.left, insets.right]);
}
