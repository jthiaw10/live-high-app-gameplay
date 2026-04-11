import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { ProgressionState, ExpFeedback, ComboState } from '../types/game';
import { BRAND, POWER_UNLOCK_COINS, COMBO } from '../config/constants';

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
  const powerUnlocked = coins >= POWER_UNLOCK_COINS;
  const coinsUntilPower = Math.max(0, POWER_UNLOCK_COINS - coins);
  return (
    <View style={styles.hud}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        {/* Health Hearts */}
        <View style={styles.healthContainer}>
          {Array.from({ length: maxHealth }).map((_, index) => (
            <View
              key={`health-${index}`}
              style={[
                styles.heart,
                {
                  backgroundColor: index < health ? '#ff4444' : '#333333',
                },
              ]}
            />
          ))}
        </View>

        {/* Coin Counter — coin sprite is near-square after crop. */}
        <View style={styles.statItem}>
          <Image
            source={require('../assets/Copy of coin_LIVHI.gif')}
            style={{ width: 24, height: 24 }}
            resizeMode="stretch"
          />
          <Text style={styles.statText}>{coins}</Text>
        </View>

        {/* EXP Counter — EXP LOGO is ~1.86:1 (wide) after crop. */}
        <View style={styles.statItem}>
          <Image
            source={require('../assets/Copy of EXP LOGO.gif')}
            style={{ width: 42, height: 22 }}
            resizeMode="stretch"
          />
          <Text style={styles.statText}>{exp}</Text>
        </View>
      </View>

      {/* Power indicator — lives just under the stats bar. Shows
          "FIRE SHOT" in burning orange when unlocked, or "X TO POWER
          UP" as a progress teaser before that. */}
      <View
        style={[
          styles.powerBadge,
          powerUnlocked ? styles.powerBadgeActive : styles.powerBadgeLocked,
        ]}
      >
        {powerUnlocked ? (
          <>
            <View style={styles.flameDot} />
            <Text style={styles.powerTextActive}>FIRE SHOT  •  F / TAP</Text>
          </>
        ) : (
          <Text style={styles.powerTextLocked}>
            {coinsUntilPower} COIN{coinsUntilPower === 1 ? '' : 'S'} TO POWER UP
          </Text>
        )}
      </View>

      {/* Combo counter — shown top-center when multiplier > 1 */}
      {combo.multiplier > 1 && (
        <View style={styles.comboBadge}>
          <Text style={styles.comboText}>x{combo.multiplier} COMBO</Text>
          <View style={styles.comboBarBg}>
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
                style={{ width: 42, height: 22, marginRight: 4 }}
                resizeMode="stretch"
              />
            )}
            <Text style={feedback.kind === 'exp' ? styles.expFeedbackText : styles.coinFeedbackText}>
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
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  healthContainer: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
  },
  heart: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ff6666',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffcc',
  },
  expFeedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffff00',
  },
  comboBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  comboText: {
    color: BRAND.gold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  comboBarBg: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  comboBarFill: {
    height: 4,
    backgroundColor: BRAND.gold,
    borderRadius: 2,
  },
  coinFeedbackText: {
    fontSize: 22,
    fontWeight: '900',
    color: BRAND.gold,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  powerBadge: {
    position: 'absolute',
    top: 82,
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.gold,
  },
  powerTextActive: {
    color: BRAND.offWhite,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  powerTextLocked: {
    color: BRAND.gold,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.7,
  },
});