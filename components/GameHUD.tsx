import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { ProgressionState, ExpFeedback, ComboState } from '../types/game';
import { BRAND, POWER_UNLOCK_COINS, COMBO } from '../config/constants';
import { useResponsive } from '../hooks/useResponsive';

interface GameHUDProps {
  coins: number;
  exp: number;
  health: number;
  maxHealth: number;
  expFeedbacks: ExpFeedback[];
  cameraX: number;
  renderScale: number;
  combo: ComboState;
}

export default function GameHUD({
  coins,
  exp,
  health,
  maxHealth,
  expFeedbacks,
  cameraX,
  renderScale,
  combo,
}: GameHUDProps) {
  const { insets, font, uiScale } = useResponsive();
  const powerUnlocked = coins >= POWER_UNLOCK_COINS;
  const coinsUntilPower = Math.max(0, POWER_UNLOCK_COINS - coins);

  const topInset = Math.max(12, insets.top + 8);
  const leftInset = Math.max(16, insets.left + 12);

  const iconSm = Math.round(20 * uiScale);
  const iconCoin = Math.round(24 * uiScale);
  const expW = Math.round(42 * uiScale);
  const expH = Math.round(22 * uiScale);

  const statsBarStyle = {
    top: topInset,
    left: leftInset,
    padding: Math.round(10 * uiScale),
    gap: Math.round(14 * uiScale),
    borderRadius: Math.round(12 * uiScale),
  };
  const powerBadgeTop = topInset + Math.round(54 * uiScale);
  const comboTop = topInset;

  return (
    <View style={styles.hud}>
      {/* Stats Bar */}
      <View style={[styles.statsBar, statsBarStyle]}>
        {/* Health Hearts */}
        <View style={[styles.healthContainer, { gap: Math.round(5 * uiScale) }]}>
          {Array.from({ length: maxHealth }).map((_, index) => (
            <View
              key={`health-${index}`}
              style={[
                styles.heart,
                {
                  width: iconSm,
                  height: iconSm,
                  borderRadius: Math.round(4 * uiScale),
                  backgroundColor: index < health ? '#ff4444' : '#333333',
                },
              ]}
            />
          ))}
        </View>

        {/* Coin Counter — coin sprite is near-square after crop. */}
        <View style={[styles.statItem, { gap: Math.round(6 * uiScale) }]}>
          <Image
            source={require('../assets/Copy of coin_LIVHI.gif')}
            style={{ width: iconCoin, height: iconCoin }}
            resizeMode="stretch"
          />
          <Text style={[styles.statText, { fontSize: font(18) }]}>{coins}</Text>
        </View>

        {/* EXP Counter — EXP LOGO is ~1.86:1 (wide) after crop. */}
        <View style={[styles.statItem, { gap: Math.round(6 * uiScale) }]}>
          <Image
            source={require('../assets/Copy of EXP LOGO.gif')}
            style={{ width: expW, height: expH }}
            resizeMode="stretch"
          />
          <Text style={[styles.statText, { fontSize: font(18) }]}>{exp}</Text>
        </View>
      </View>

      {/* Power indicator — lives just under the stats bar. Shows
          "FIRE SHOT" in burning orange when unlocked, or "X TO POWER
          UP" as a progress teaser before that. */}
      <View
        style={[
          styles.powerBadge,
          {
            top: powerBadgeTop,
            left: leftInset,
            paddingHorizontal: Math.round(12 * uiScale),
            paddingVertical: Math.round(5 * uiScale),
            borderRadius: Math.round(10 * uiScale),
            gap: Math.round(7 * uiScale),
          },
          powerUnlocked ? styles.powerBadgeActive : styles.powerBadgeLocked,
        ]}
      >
        {powerUnlocked ? (
          <>
            <View
              style={[
                styles.flameDot,
                {
                  width: Math.round(9 * uiScale),
                  height: Math.round(9 * uiScale),
                  borderRadius: Math.round(5 * uiScale),
                },
              ]}
            />
            <Text style={[styles.powerTextActive, { fontSize: font(12) }]}>
              FIRE SHOT  •  F / TAP
            </Text>
          </>
        ) : (
          <Text style={[styles.powerTextLocked, { fontSize: font(11) }]}>
            {coinsUntilPower} COIN{coinsUntilPower === 1 ? '' : 'S'} TO POWER UP
          </Text>
        )}
      </View>

      {/* Combo counter — shown top-center when multiplier > 1 */}
      {combo.multiplier > 1 && (
        <View
          style={[
            styles.comboBadge,
            {
              top: comboTop,
              paddingHorizontal: Math.round(16 * uiScale),
              paddingVertical: Math.round(7 * uiScale),
              borderRadius: Math.round(12 * uiScale),
            },
          ]}
        >
          <Text style={[styles.comboText, { fontSize: font(18) }]}>
            x{combo.multiplier} COMBO
          </Text>
          <View
            style={[
              styles.comboBarBg,
              {
                width: Math.round(90 * uiScale),
                marginTop: Math.round(4 * uiScale),
              },
            ]}
          >
            <View
              style={[
                styles.comboBarFill,
                { width: `${Math.max(0, (combo.timer / COMBO.WINDOW_MS) * 100)}%` as any },
              ]}
            />
          </View>
        </View>
      )}

      {/* Floating pickup feedback — positioned in WORLD coords, scaled
          to screen pixels by renderScale. Coins show just "+10" text.
          Enemy kills show the EXP logo + amount. */}
      {expFeedbacks.map((feedback) => {
        const elapsed = Date.now() - feedback.startTime;
        const opacity = Math.max(0, 1 - elapsed / 1000);
        const offsetY = (elapsed / 1000) * 50;

        return (
          <View
            key={feedback.id}
            style={{
              position: 'absolute',
              left: (feedback.x - cameraX) * renderScale,
              top: (feedback.y - offsetY) * renderScale,
              opacity,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {feedback.kind === 'exp' && (
              <Image
                source={require('../assets/Copy of EXP LOGO.gif')}
                style={{ width: expW, height: expH, marginRight: 4 }}
                resizeMode="stretch"
              />
            )}
            <Text
              style={[
                feedback.kind === 'exp' ? styles.expFeedbackText : styles.coinFeedbackText,
                { fontSize: feedback.kind === 'exp' ? font(20) : font(22) },
              ]}
            >
              +{feedback.amount}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  statsBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  healthContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  heart: {
    borderWidth: 2,
    borderColor: '#ff6666',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontWeight: 'bold',
    color: '#00ffcc',
  },
  expFeedbackText: {
    fontWeight: 'bold',
    color: '#ffff00',
  },
  comboBadge: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  comboText: {
    color: BRAND.gold,
    fontWeight: '900',
    letterSpacing: 3,
  },
  comboBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  comboBarFill: {
    height: 4,
    backgroundColor: BRAND.gold,
    borderRadius: 2,
  },
  coinFeedbackText: {
    fontWeight: '900',
    color: BRAND.gold,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  powerBadge: {
    position: 'absolute',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerBadgeActive: {
    backgroundColor: 'rgba(230, 57, 70, 0.85)',
    borderColor: BRAND.gold,
    shadowColor: BRAND.sunsetOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  powerBadgeLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 216, 77, 0.4)',
  },
  flameDot: {
    backgroundColor: BRAND.gold,
  },
  powerTextActive: {
    color: BRAND.offWhite,
    fontWeight: '900',
    letterSpacing: 2,
  },
  powerTextLocked: {
    color: BRAND.gold,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.7,
  },
});
