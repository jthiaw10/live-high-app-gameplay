/**
 * GameWorld — renders the entire scrollable level.
 *
 * Layers, from back to front:
 *   1. Sky gradient + procedural star field (static, far parallax)
 *   2. Procedural neon skyline silhouettes (very slow parallax)
 *   3. Background image (existing bitmap, slow parallax)
 *   4. Decorative props (palm trees, bushes)
 *   5. World props (vinyl, weed, trash cans)
 *   6. Hazards (fire)
 *   7. Platforms (stylized with glow edge)
 *   8. Goal / uplink portal
 *   9. Collectibles
 *  10. Enemies
 *  11. Particle effects
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import {
  Platform,
  Prop,
  Collectible,
  WorldProp,
  Enemy,
  Hazard,
  Goal,
  Particle,
  Projectile,
  EnemyProjectile,
  Checkpoint,
  SpeedBoost,
  Boss,
} from '../types/game';
import {
  BRAND,
  BG_ASPECT,
  WORLD_GROUND_Y,
  GAME_CONFIG,
} from '../config/constants';

interface GameWorldProps {
  platforms: Platform[];
  props: Prop[];
  collectibles: Collectible[];
  worldProps: WorldProp[];
  enemies: Enemy[];
  hazards: Hazard[];
  goal: Goal;
  background: any;
  particles: Particle[];
  projectiles: Projectile[];
  cameraX: number;
  playerX: number;
  /** Uniform world→screen scale factor. 1 = identity. */
  renderScale: number;
  /** Actual screen pixel width. */
  screenWidth: number;
  /** Actual screen pixel height. */
  screenHeight: number;
  /** Level width in world coords (for bg parallax sizing). */
  levelWidth: number;
  checkpoints: Checkpoint[];
  speedBoosts: SpeedBoost[];
  boss: Boss | null;
  enemyProjectiles: EnemyProjectile[];
}

export default function GameWorld({
  platforms,
  props,
  collectibles,
  worldProps,
  enemies,
  hazards,
  goal,
  background,
  particles,
  projectiles,
  cameraX,
  playerX,
  renderScale,
  screenWidth,
  screenHeight,
  levelWidth,
  checkpoints,
  speedBoosts,
  boss,
  enemyProjectiles,
}: GameWorldProps) {
  // World→screen helpers. Everything positioned in this component uses
  // world coordinates as input; these helpers multiply by the render
  // scale to produce the actual pixel position.
  const S = renderScale;
  const xToScreen = (worldX: number) => (worldX - cameraX) * S;
  const yToScreen = (worldY: number) => worldY * S;
  const px = (worldPx: number) => worldPx * S;

  // -----------------------------------------------------------------
  // Background tile layout.
  //
  // Each tile is rendered at the full viewport height (top-to-bottom)
  // with width preserved by the image's natural aspect ratio. The
  // street line of the image lands exactly on the world ground plane
  // because WORLD_HEIGHT was chosen as GROUND_Y / BG_GROUND_RATIO.
  //
  // Tiles are stitched horizontally 1:1 with the camera — no parallax.
  // They extend a tile past the level on each side so the map visually
  // continues even if the camera briefly peeks beyond the playable
  // area (it normally doesn't, but the buffer is cheap).
  //
  // Virtual tiling: only the tiles that overlap the visible range
  // are actually rendered.
  // -----------------------------------------------------------------
  const bgTileHeightPx = screenHeight;
  const bgTilePixelWidth = screenHeight * BG_ASPECT;
  // World-space width of one tile: tiles move 1:1 with the camera in
  // world coords, and the scale applied to them is the same S used
  // everywhere else, so one tile spans (bgTilePixelWidth / S) world px.
  const bgTileWorldWidth = bgTilePixelWidth / S;

  const firstVisibleTile = Math.floor(cameraX / bgTileWorldWidth) - 1;
  const lastVisibleTile =
    Math.ceil((cameraX + screenWidth / S) / bgTileWorldWidth) + 1;

  const bgTiles: number[] = [];
  for (let i = firstVisibleTile; i <= lastVisibleTile; i++) {
    bgTiles.push(i);
  }

  const renderCollectible = (coin: Collectible) => {
    if (coin.collected) return null;

    const t = Date.now() / 1000;
    // Gentle float + per-coin phase so they don't all bob in lockstep.
    const float = Math.sin(t * 3 + coin.x * 0.01) * 6;
    // Soft glow that pulses.
    const glow = 0.5 + Math.sin(t * 4 + coin.x * 0.02) * 0.25;

    return (
      <View
        key={coin.id}
        style={{
          position: 'absolute',
          left: xToScreen(coin.x),
          top: yToScreen(coin.y + float),
          width: px(coin.width),
          height: px(coin.height),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="none"
      >
        {/* glow */}
        <View
          style={{
            position: 'absolute',
            width: px(coin.width * 1.3),
            height: px(coin.height * 1.3),
            borderRadius: px(coin.width),
            backgroundColor: BRAND.gold,
            opacity: glow * 0.25,
          }}
        />
        <Image
          source={require('../assets/Copy of coin_LIVHI.gif')}
          style={{ width: px(coin.width), height: px(coin.height) }}
          resizeMode="stretch"
        />
      </View>
    );
  };

  const renderEnemy = (enemy: Enemy) => {
    if (enemy.isDefeated || enemy.health <= 0) return null;

    let enemySource;
    switch (enemy.type) {
      case 'crab':
        enemySource = require('../assets/Copy of CRAB.gif');
        break;
      case 'seagull':
        enemySource = require('../assets/Copy of SEAGULL.gif');
        break;
      case 'policeman':
        if (enemy.idleSprite && enemy.movingSprite) {
          enemySource = Math.abs(enemy.velocityX) > 0 ? enemy.movingSprite : enemy.idleSprite;
        } else {
          enemySource = require('../assets/Copy of POLICEMAN 2.png');
        }
        break;
      case 'drone':
        enemySource = require('../assets/Copy of JDF_DRONE_1.png');
        break;
    }

    const facingLeft = enemy.velocityX < 0;
    // Subtle hover for flying enemies — reinforces threat silhouette.
    const hoverBob =
      enemy.type === 'drone' || enemy.type === 'seagull'
        ? Math.sin(Date.now() / 220 + enemy.x * 0.01) * 3
        : 0;

    return (
      <View
        key={enemy.id}
        style={{
          position: 'absolute',
          left: xToScreen(enemy.x),
          top: yToScreen(enemy.y + hoverBob),
        }}
      >
        {/* soft shadow on ground enemies */}
        {(enemy.type === 'crab' || enemy.type === 'policeman') && (
          <View
            style={{
              position: 'absolute',
              bottom: px(-6),
              left: px(enemy.width * 0.15),
              width: px(enemy.width * 0.7),
              height: px(6),
              borderRadius: px(4),
              backgroundColor: 'rgba(0,0,0,0.35)',
            }}
          />
        )}
        <Image
          source={enemySource}
          style={{
            width: px(enemy.width),
            height: px(enemy.height),
            transform: [{ scaleX: facingLeft ? -1 : 1 }],
          }}
          resizeMode="stretch"
        />
        {enemy.type === 'drone' && enemy.isLockedOn && (
          <Image
            source={require('../assets/Copy of LOCKON.gif')}
            style={{
              position: 'absolute',
              width: px(48),
              height: px(48),
              top: px(-16),
              left: px(enemy.width / 2 - 24),
            }}
            resizeMode="stretch"
          />
        )}
      </View>
    );
  };

  const renderGoal = () => {
    const t = Date.now() / 1000;
    const pulse = 1 + Math.sin(t * 3) * 0.08;
    const swirl = (t * 120) % 360;
    return (
      <View
        style={{
          position: 'absolute',
          left: xToScreen(goal.x),
          top: yToScreen(goal.y),
          width: px(goal.width),
          height: px(goal.height),
          alignItems: 'center',
        }}
        pointerEvents="none"
      >
        {/* outer glow halo */}
        <View
          style={{
            position: 'absolute',
            top: px(-10),
            width: px(goal.width * 1.4),
            height: px(goal.height + 20),
            borderRadius: px(26),
            backgroundColor: BRAND.neonTeal,
            opacity: 0.12,
            transform: [{ scaleY: pulse }],
          }}
        />
        {/* beam */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: px(goal.width * 0.58),
            height: px(goal.height),
            backgroundColor: BRAND.neonTeal,
            opacity: 0.28,
            borderRadius: px(18),
            borderWidth: 2,
            borderColor: BRAND.neonTeal,
            transform: [{ scaleY: pulse }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: px(10),
            width: px(goal.width * 0.38),
            height: px(goal.height - 20),
            backgroundColor: BRAND.neonTeal,
            opacity: 0.6,
            borderRadius: px(14),
          }}
        />
        {/* Horizontal "scanline" that travels down the portal */}
        <View
          style={{
            position: 'absolute',
            top: px(((swirl / 360) * (goal.height - 20)) + 10),
            width: px(goal.width * 0.42),
            height: px(3),
            backgroundColor: BRAND.gold,
            opacity: 0.85,
            borderRadius: px(2),
          }}
        />
        <Image
          source={require('../assets/Copy of EXP LOGO.gif')}
          style={{
            position: 'absolute',
            top: px(-16),
            width: px(goal.width * 0.95),
            height: px(goal.width * 0.95 / 1.86),
          }}
          resizeMode="stretch"
        />
        <Text
          style={{
            position: 'absolute',
            bottom: px(-20),
            color: BRAND.neonTeal,
            fontSize: Math.max(10, 12 * S),
            fontWeight: 'bold',
            letterSpacing: 3,
            textShadowColor: '#000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {goal.label ?? 'GOAL'}
        </Text>
      </View>
    );
  };

  const renderPlatform = (platform: Platform, index: number) => {
    // Ground platforms are invisible — the road strip IS the ground.
    const isGround = platform.y >= GAME_CONFIG.GROUND_Y - 2;
    if (isGround) {
      return null;
    }

    // --- Levitating motion ---
    // Each platform drifts side-to-side on a slow sine, seeded by
    // its index so they don't all move in lockstep.
    const now = Date.now() / 1000;
    const driftX = Math.sin(now * 0.6 + index * 2.3) * 18;
    const bobY = Math.sin(now * 0.9 + index * 1.7) * 4;

    // Glow pulse for the underside levitation effect.
    const glowPulse = 0.45 + Math.sin(now * 2 + index * 1.1) * 0.15;

    const platLeft = xToScreen(platform.x + driftX);
    const platTop = yToScreen(platform.y + bobY);
    const platW = px(platform.width);
    const platH = px(28);

    return (
      <View
        key={`platform-${index}`}
        style={{
          position: 'absolute',
          left: platLeft,
          top: platTop,
          width: platW,
          height: platH,
        }}
      >
        {/* Levitation glow — soft teal/orange light underneath */}
        <View
          style={{
            position: 'absolute',
            left: px(16),
            right: px(16),
            bottom: px(-18),
            height: px(22),
            borderRadius: px(20),
            backgroundColor: BRAND.neonTeal,
            opacity: glowPulse * 0.35,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: px(30),
            right: px(30),
            bottom: px(-10),
            height: px(12),
            borderRadius: px(12),
            backgroundColor: BRAND.sunsetOrange,
            opacity: glowPulse * 0.45,
          }}
        />

        {/* Drop shadow on the slab itself */}
        <View
          style={{
            position: 'absolute',
            top: px(4),
            left: 0,
            right: 0,
            bottom: px(-6),
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: px(14),
          }}
        />

        {/* Main body — brighter than before so it pops against the bg */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#3d3660',
            borderRadius: px(14),
            borderWidth: 2,
            borderColor: BRAND.sunsetOrange,
          }}
        />

        {/* Top neon accent line */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: px(6),
            right: px(6),
            height: px(5),
            backgroundColor: BRAND.sunsetOrange,
            borderRadius: px(5),
          }}
        />

        {/* Gold glow above the accent */}
        <View
          style={{
            position: 'absolute',
            top: px(-4),
            left: px(12),
            right: px(12),
            height: px(4),
            backgroundColor: BRAND.gold,
            borderRadius: px(4),
            opacity: 0.55,
          }}
        />

        {/* Inner highlight stripe */}
        <View
          style={{
            position: 'absolute',
            top: px(6),
            left: px(8),
            right: px(8),
            height: px(2),
            backgroundColor: 'rgba(245,241,232,0.3)',
            borderRadius: 1,
          }}
        />

        {/* Bottom edge glow to sell the levitation from the slab side */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: px(10),
            right: px(10),
            height: px(3),
            backgroundColor: BRAND.neonTeal,
            borderRadius: px(3),
            opacity: glowPulse * 0.6,
          }}
        />
      </View>
    );
  };

  const renderProjectile = (p: Projectile) => {
    // Procedural fire blob scaled by the render scale.
    const alpha = Math.max(0.3, Math.min(1, p.life / p.maxLife));
    const cx = xToScreen(p.x + p.width / 2);
    const cy = yToScreen(p.y + p.height / 2);
    const wpx = px(p.width);
    const hpx = px(p.height);
    const trailLen = px(34);
    return (
      <View
        key={p.id}
        style={{ position: 'absolute', left: 0, top: 0 }}
        pointerEvents="none"
      >
        <View
          style={{
            position: 'absolute',
            left: cx - (p.facingRight ? trailLen : 0),
            top: cy - px(3),
            width: trailLen,
            height: px(6),
            backgroundColor: BRAND.sunsetOrange,
            opacity: alpha * 0.55,
            borderRadius: px(3),
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: cx - wpx / 2 - px(4),
            top: cy - hpx / 2 - px(4),
            width: wpx + px(8),
            height: hpx + px(8),
            borderRadius: wpx,
            backgroundColor: BRAND.reggaeRed,
            opacity: alpha * 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: cx - wpx / 2,
            top: cy - hpx / 2,
            width: wpx,
            height: hpx,
            borderRadius: wpx,
            backgroundColor: BRAND.sunsetOrange,
            opacity: alpha * 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: cx - wpx / 3,
            top: cy - hpx / 3,
            width: (wpx * 2) / 3,
            height: (hpx * 2) / 3,
            borderRadius: wpx,
            backgroundColor: BRAND.gold,
            opacity: alpha,
          }}
        />
      </View>
    );
  };

  const renderCheckpoint = (cp: Checkpoint) => {
    const flagColor = cp.activated ? BRAND.reggaeGreen : BRAND.gold;
    const t = Date.now() / 1000;
    const wave = cp.activated ? Math.sin(t * 4) * 3 : 0;
    return (
      <View
        key={cp.id}
        style={{
          position: 'absolute',
          left: xToScreen(cp.x),
          top: yToScreen(cp.y),
        }}
        pointerEvents="none"
      >
        {/* Pole */}
        <View style={{
          position: 'absolute', left: px(16), top: 0,
          width: px(4), height: px(cp.height),
          backgroundColor: '#888', borderRadius: px(2),
        }} />
        {/* Flag */}
        <View style={{
          position: 'absolute', left: px(20), top: px(4 + wave),
          width: px(30), height: px(22),
          backgroundColor: flagColor, borderRadius: px(3),
          opacity: cp.activated ? 1 : 0.7,
        }} />
        {cp.activated && (
          <View style={{
            position: 'absolute', left: px(8), bottom: px(-10),
            width: px(24), height: px(8),
            backgroundColor: BRAND.reggaeGreen, opacity: 0.4,
            borderRadius: px(12),
          }} />
        )}
      </View>
    );
  };

  const renderSpeedBoost = (sb: SpeedBoost) => {
    if (sb.collected) return null;
    const t = Date.now() / 1000;
    const bob = Math.sin(t * 4 + sb.x * 0.01) * 5;
    const glow = 0.5 + Math.sin(t * 6) * 0.2;
    return (
      <View
        key={sb.id}
        style={{
          position: 'absolute',
          left: xToScreen(sb.x),
          top: yToScreen(sb.y + bob),
          width: px(sb.width),
          height: px(sb.height),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="none"
      >
        <View style={{
          position: 'absolute',
          width: px(sb.width * 1.5), height: px(sb.height * 1.5),
          borderRadius: px(sb.width),
          backgroundColor: BRAND.neonTeal, opacity: glow * 0.3,
        }} />
        <View style={{
          width: px(sb.width * 0.7), height: px(sb.height * 0.7),
          backgroundColor: BRAND.neonTeal, borderRadius: px(sb.width),
          borderWidth: 2, borderColor: BRAND.offWhite,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: Math.max(10, px(14)), fontWeight: '900' }}>
            {'>>'}
          </Text>
        </View>
      </View>
    );
  };

  const renderBoss = (b: Boss) => {
    if (b.phase === 'defeated') return null;
    const isVulnerable = b.phase === 'vulnerable';
    const isCharging = b.phase === 'charge';
    const t = Date.now() / 1000;
    const shake = isCharging ? Math.sin(t * 30) * 3 : 0;
    const pulse = isVulnerable ? 0.5 + Math.sin(t * 8) * 0.3 : 0;

    return (
      <View
        key={b.id}
        style={{
          position: 'absolute',
          left: xToScreen(b.x + shake),
          top: yToScreen(b.y),
        }}
        pointerEvents="none"
      >
        {/* Boss body — large dark slab with colored border */}
        <View style={{
          width: px(b.width), height: px(b.height),
          backgroundColor: isVulnerable ? '#5a2040' : '#2a1535',
          borderWidth: 3,
          borderColor: isVulnerable ? BRAND.reggaeRed : BRAND.sunsetOrange,
          borderRadius: px(16),
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* "Face" — two glowing eyes */}
          <View style={{ flexDirection: 'row', gap: px(20), marginBottom: px(10) }}>
            <View style={{
              width: px(14), height: px(14), borderRadius: px(7),
              backgroundColor: isVulnerable ? BRAND.reggaeRed : BRAND.gold,
            }} />
            <View style={{
              width: px(14), height: px(14), borderRadius: px(7),
              backgroundColor: isVulnerable ? BRAND.reggaeRed : BRAND.gold,
            }} />
          </View>
          {/* "Mouth" */}
          <View style={{
            width: px(40), height: px(8), borderRadius: px(4),
            backgroundColor: isCharging ? BRAND.reggaeRed : '#444',
          }} />
        </View>
        {/* Vulnerable glow */}
        {isVulnerable && (
          <View style={{
            position: 'absolute', left: px(-10), top: px(-10),
            width: px(b.width + 20), height: px(b.height + 20),
            borderRadius: px(20), borderWidth: 3,
            borderColor: BRAND.reggaeRed, opacity: pulse,
          }} />
        )}
        {/* Health bar above boss */}
        <View style={{
          position: 'absolute', top: px(-20),
          left: px(10), right: px(10), height: px(8),
          backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: px(4),
        }}>
          <View style={{
            width: `${(b.health / b.maxHealth) * 100}%` as any,
            height: px(8), borderRadius: px(4),
            backgroundColor: b.health > 2 ? BRAND.reggaeGreen : BRAND.reggaeRed,
          }} />
        </View>
      </View>
    );
  };

  const renderEnemyProjectile = (ep: EnemyProjectile) => {
    const alpha = Math.max(0.4, ep.life / ep.maxLife);
    // Compute rotation from velocity direction.
    const angle = Math.atan2(ep.vy, ep.vx) * (180 / Math.PI);
    return (
      <View
        key={ep.id}
        style={{
          position: 'absolute',
          left: xToScreen(ep.x),
          top: yToScreen(ep.y),
          width: px(ep.width),
          height: px(ep.height),
          transform: [{ rotate: `${angle}deg` }],
          opacity: alpha,
        }}
        pointerEvents="none"
      >
        {/* Turquoise laser core */}
        <View style={{
          position: 'absolute', left: 0, top: 0,
          width: px(ep.width), height: px(ep.height),
          backgroundColor: '#0099cc',
          borderRadius: px(ep.height),
          borderWidth: 1,
          borderColor: '#66eeff',
        }} />
        {/* Bright center */}
        <View style={{
          position: 'absolute',
          left: px(3), top: px(1),
          width: px(ep.width - 6),
          height: px(ep.height - 2),
          backgroundColor: '#33ddff',
          borderRadius: px(ep.height),
        }} />
      </View>
    );
  };

  const renderParticle = (p: Particle) => {
    const alpha = Math.max(0, p.life / p.maxLife);
    const size = p.size * (p.type === 'spark' ? alpha : 1);
    const sizePx = px(size);
    return (
      <View
        key={p.id}
        style={{
          position: 'absolute',
          left: xToScreen(p.x) - sizePx / 2,
          top: yToScreen(p.y) - sizePx / 2,
          width: sizePx,
          height: sizePx,
          borderRadius: sizePx,
          backgroundColor: p.color,
          opacity: alpha,
        }}
        pointerEvents="none"
      />
    );
  };

  // -----------------------------------------------------------------
  // Road tile strip.
  //
  // Road.png (808×65) tiles across the entire level at the ground
  // plane. Where there's a gap between ground-level platforms, the
  // tile is swapped for Road with pothole.png (same 808×65 size,
  // pothole in the center). The pothole tile is positioned so its
  // center aligns with the gap center.
  //
  // Both tile layers scroll 1:1 with the camera, same as everything
  // else in the world. Virtual tiling: only visible tiles render.
  // -----------------------------------------------------------------
  const ROAD_TILE_WORLD_W = 808;
  const ROAD_TILE_WORLD_H = 65;
  // The dark pothole pit in the Road with pothole.png image spans
  // from pixel 394 to 636 (243px wide) within the 808px tile.
  // When placing the pothole tile over a gap, we position the tile
  // so tile_x + 394 = gap_left, meaning the dark pixels line up
  // exactly with the physical gap in the ground platform.
  const POTHOLE_LEFT_OFFSET = 394;

  // Detect ground-level platform spans and gaps between them.
  // Road tiles render ONLY over ground spans. Gaps are left empty
  // except for a pothole overlay, so the player can see exactly
  // where they'll fall.
  const groundPlats = platforms
    .filter((p) => p.y >= GAME_CONFIG.GROUND_Y - 2)
    .sort((a, b) => a.x - b.x);

  // Merge overlapping ground spans into a single list.
  const groundSpans: { left: number; right: number }[] = [];
  for (const p of groundPlats) {
    const right = p.x + p.width;
    if (groundSpans.length > 0 && p.x <= groundSpans[groundSpans.length - 1].right) {
      groundSpans[groundSpans.length - 1].right = Math.max(
        groundSpans[groundSpans.length - 1].right,
        right
      );
    } else {
      groundSpans.push({ left: p.x, right });
    }
  }

  // Gaps = spaces between consecutive merged ground spans.
  const gaps: { left: number; right: number; cx: number }[] = [];
  for (let i = 0; i < groundSpans.length - 1; i++) {
    const gapLeft = groundSpans[i].right;
    const gapRight = groundSpans[i + 1].left;
    if (gapRight - gapLeft > 20) {
      gaps.push({ left: gapLeft, right: gapRight, cx: (gapLeft + gapRight) / 2 });
    }
  }

  // Road rendering constants.
  const roadHPx = px(ROAD_TILE_WORLD_H);
  const roadWPx = px(ROAD_TILE_WORLD_W);
  const roadTopScreen = screenHeight - roadHPx;
  const visWorldLeft = cameraX - ROAD_TILE_WORLD_W;
  const visWorldRight = cameraX + screenWidth / S + ROAD_TILE_WORLD_W;

  // Build road tiles that ONLY cover ground spans (not gaps).
  // For each ground span, tile Road.png across it.
  const roadTiles: { worldX: number; worldW: number }[] = [];
  for (const span of groundSpans) {
    // Skip spans entirely outside visible range.
    if (span.right < visWorldLeft || span.left > visWorldRight) continue;
    // Tile across this span.
    const firstTile = Math.floor(span.left / ROAD_TILE_WORLD_W);
    const lastTile = Math.ceil(span.right / ROAD_TILE_WORLD_W);
    for (let ti = firstTile; ti <= lastTile; ti++) {
      const tileLeft = ti * ROAD_TILE_WORLD_W;
      const tileRight = tileLeft + ROAD_TILE_WORLD_W;
      // Skip if tile is entirely outside this ground span.
      if (tileRight <= span.left || tileLeft >= span.right) continue;
      // Skip if outside visible range.
      if (tileRight < visWorldLeft || tileLeft > visWorldRight) continue;
      roadTiles.push({ worldX: tileLeft, worldW: ROAD_TILE_WORLD_W });
    }
  }

  return (
    <View style={styles.world}>
      {/* Tiled background */}
      {bgTiles.map((i) => {
        const tileWorldX = i * bgTileWorldWidth;
        const leftPx = (tileWorldX - cameraX) * S;
        return (
          <Image
            key={`bg-tile-${i}`}
            source={require('../assets/Backgroun Loop.png')}
            style={{
              position: 'absolute',
              left: leftPx,
              top: 0,
              width: bgTilePixelWidth,
              height: bgTileHeightPx,
            }}
            resizeMode="stretch"
          />
        );
      })}

      {/* Road tiles — only rendered over ground platform spans.
          Gaps between ground platforms show as empty (no road). */}
      {roadTiles.map((tile, i) => (
        <Image
          key={`road-${i}`}
          source={require('../assets/Road.png')}
          style={{
            position: 'absolute',
            left: xToScreen(tile.worldX),
            top: roadTopScreen,
            width: roadWPx,
            height: roadHPx,
          }}
          resizeMode="stretch"
        />
      ))}

      {/* Pothole images at each gap — positioned so the dark pit
          pixels in the image line up with the physical gap. */}
      {gaps.map((gap, i) => (
        <Image
          key={`pothole-${i}`}
          source={require('../assets/Road with pothole.png')}
          style={{
            position: 'absolute',
            left: xToScreen(gap.left - POTHOLE_LEFT_OFFSET),
            top: roadTopScreen,
            width: roadWPx,
            height: roadHPx,
          }}
          resizeMode="stretch"
        />
      ))}

      {/* Platforms */}
      {platforms.map(renderPlatform)}

      {/* End-of-level goal */}
      {renderGoal()}

      {/* Checkpoints */}
      {checkpoints.map(renderCheckpoint)}

      {/* Speed boosts */}
      {speedBoosts.map(renderSpeedBoost)}

      {/* Collectible Coins */}
      {collectibles.map(renderCollectible)}

      {/* Boss */}
      {boss && renderBoss(boss)}

      {/* Enemies */}
      {enemies.map(renderEnemy)}

      {/* Fire-shot projectiles */}
      {projectiles.map(renderProjectile)}

      {/* Enemy laser projectiles */}
      {enemyProjectiles.map(renderEnemyProjectile)}

      {/* Particle effects on top of everything */}
      {particles.map(renderParticle)}
    </View>
  );
}

const styles = StyleSheet.create({
  world: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
    overflow: 'hidden',
  },
});
