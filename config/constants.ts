/**
 * Central configuration for Blaze Runner.
 * Tuning values live here so that art/levels/code can be changed
 * without hunting through modules.
 */

export const GAME_CONFIG = {
  // Player collision box.
  //
  // These values are TIGHT around the character body on purpose:
  // after sprite-padding was removed (see /tmp/crop_sprites.py), the
  // old 120x160 hitbox was 2-3x larger than the visible Blaze pixels,
  // which made the game feel like enemies hit from invisible air.
  // The new box hugs the torso; arms/legs on the run frame visually
  // extend past the hitbox, which is what the player expects.
  PLAYER_WIDTH: 60,
  PLAYER_HEIGHT: 120,
  PLAYER_MAX_JUMPS: 3,
  PLAYER_SPAWN_HEALTH: 3,
  STARTING_LIVES: 3,

  // Scoring
  COIN_EXP_VALUE: 10,
  COIN_COMPLETION_BONUS: 100,
  LEVEL_CLEAR_BONUS: 500,
  TIME_BONUS_MAX: 300,

  // Timers (ms)
  DEATH_ANIMATION_MS: 1400,
  INVINCIBILITY_MS: 1500,
  LEVEL_TRANSITION_MS: 1600,

  // World ground plane. This is where the player's feet land. Set to
  // WORLD_HEIGHT - ROAD_TILE_HEIGHT (710 - 65 = 645) so the player
  // stands exactly on the top edge of the Road.png tile strip, which
  // is pinned to the bottom of the screen. Kept in sync with
  // WORLD_GROUND_Y below.
  GROUND_Y: 850,
} as const;

/**
 * Sprite aspect ratios (width / height) after the cropping pass.
 * Used by PlayerSprite and GameWorld to render each sprite at its
 * natural proportions so the rendered box = the visible pixels.
 * Update these if you re-export source art.
 *
 * Source: .crop_manifest.json produced by /tmp/crop_sprites.py.
 */
export const SPRITE_ASPECT = {
  blazeIdle: 43 / 103,    // 0.417 — narrow, arms at sides
  blazeRun1: 71 / 103,    // 0.689 — BLAZELOOP 1 Running.png
  blazeRun2: 75 / 103,    // 0.728 — BLAZELOOP RUN 2.png
  blazeJump: 74 / 91,     // 0.813 — BLAZELOOP JUMPING.png
  blazeFlame: 112 / 103,  // 1.087 — BLAZELOOP FLAME CHALACE.png
  crab: 47 / 47,          // 1.000
  seagull: 611 / 337,     // 1.813
  drone: 137 / 138,       // 0.993
  policemanIdle: 87 / 177,// 0.492
  policemanMove: 417 / 865, // 0.482 — very close to idle, safe swap
  fire: 670 / 857,        // 0.782
  coin: 62 / 63,          // 0.984
  expLogo: 314 / 169,     // 1.858
  palmTree: 302 / 452,    // 0.668
  vinyl: 659 / 669,       // 0.985
  weed: 533 / 523,        // 1.019
  trashCan: 1116 / 1034,  // 1.079
} as const;

/**
 * Rendering / viewport.
 *
 * The game logic and level data are authored in a fixed "world"
 * coordinate system. At render time we compute
 * `renderScale = windowHeight / WORLD_HEIGHT` and multiply every
 * on-screen position and size by that scale.
 *
 * WORLD_HEIGHT is chosen so that the world's ground plane lands at
 * the same vertical fraction as the street line in the background
 * image. When the bg is rendered at screenHeight tall (its natural
 * full-viewport size), its street pixel ends up exactly on the
 * world ground with no vertical zoom mismatch.
 *
 *   WORLD_HEIGHT = WORLD_GROUND_Y / BG_GROUND_RATIO
 *                = 500 / (264/375) ≈ 710
 */
export const WORLD_GROUND_Y = 645;
export const BG_ASPECT = 733 / 375;
export const BG_GROUND_RATIO = 264 / 375;
export const WORLD_HEIGHT = Math.round(WORLD_GROUND_Y / BG_GROUND_RATIO);

/**
 * Canonical in-game sizes for entities. These are the collision box
 * sizes — rendering uses the aspect ratios above so the visible sprite
 * exactly fills the box (for enemies) or is cleanly centered on it
 * (for the player, whose run frame is intentionally wider than the
 * body hitbox).
 */
export const ENTITY_SIZE = {
  crab:      { w: 54, h: 54 },
  seagull:   { w: 90, h: 50 },
  drone:     { w: 72, h: 72 },
  policeman: { w: 54, h: 110 },
  // Fire is intentionally smaller than before — a smaller visible
  // flame reads as "jumpable" instead of "immovable wall", which
  // keeps the level feel forgiving.
  fire:      { w: 44, h: 56 },
  coin:      { w: 48, h: 48 },
  goal:      { w: 96, h: 170 },
} as const;

/**
 * How many coins the player must collect to unlock the fire-shot
 * superpower. Tuned so the power unlocks around the mid-point of
 * the combined level, giving the player a fresh toy for the back
 * half.
 */
export const POWER_UNLOCK_COINS = 10;

/**
 * Projectile tuning for the fire-shot superpower.
 */
export const PROJECTILE = {
  WIDTH: 34,
  HEIGHT: 28,
  SPEED: 720,        // px/s in facing direction
  LIFE_MS: 1200,     // distance ≈ 864 px before fizzling
  COOLDOWN_MS: 340,  // min gap between shots
} as const;

/**
 * Breakable platform timing.
 */
export const BREAKABLE = {
  /** ms after landing before the platform breaks. */
  WARN_MS: 800,
  /** ms of "crumbling" visual before the platform vanishes. */
  CRUMBLE_MS: 300,
} as const;

/**
 * Speed boost power-up.
 */
export const SPEED_BOOST = {
  DURATION_MS: 5000,
  MULTIPLIER: 1.55,
  /** Pickup hitbox size in world coords. */
  SIZE: 44,
} as const;

/**
 * Combo scoring.
 */
export const COMBO = {
  /** ms window to chain the next action before combo resets. */
  WINDOW_MS: 2200,
  /** Maximum multiplier. */
  MAX_MULT: 4,
  /** Actions needed to advance: 1→x2 at 2, x2→x3 at 4, x3→x4 at 6. */
  THRESHOLDS: [2, 4, 6],
} as const;

/**
 * Boss tuning.
 */
export const BOSS_CONFIG = {
  WIDTH: 120,
  HEIGHT: 140,
  MAX_HEALTH: 5,
  CHARGE_SPEED: 420,
  /** Durations per phase (ms). */
  IDLE_MS: 1200,
  CHARGE_MS: 1800,
  VULNERABLE_MS: 1600,
  /** Player bounce-back velocity on boss contact. */
  KNOCKBACK_VX: 350,
} as const;

/**
 * Stomp mechanic.
 */
export const STOMP = {
  /** Player velocity.y bounce after stomping an enemy. */
  BOUNCE_VY: -550,
  /** How far above enemy.y the player's bottom must be to count
   *  as a stomp vs a side hit. Fraction of enemy height. */
  TOP_FRACTION: 0.35,
} as const;

/**
 * Brand palette — derived from the existing Blaze Runner assets.
 * Afro-futurist reggae-cyberpunk: deep night purple, neon teal,
 * sunset orange, gold, reggae red/yellow/green.
 */
export const BRAND = {
  nightPurple: '#1a1433',
  deepPurple: '#2b2640',
  neonTeal: '#00ffcc',
  sunsetOrange: '#f26d5b',
  burntOrange: '#ff6b35',
  gold: '#ffd84d',
  reggaeRed: '#e63946',
  reggaeYellow: '#f1c40f',
  reggaeGreen: '#2ecc71',
  offWhite: '#f5f1e8',
  softShadow: 'rgba(0,0,0,0.7)',
} as const;
