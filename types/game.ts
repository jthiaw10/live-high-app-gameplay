export interface Vector2 {
  x: number;
  y: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 'moving' platforms slide back and forth on a rail. */
  moveType?: 'moving' | 'breakable';
  /** World-x range for moving platforms. */
  moveStart?: number;
  moveEnd?: number;
  /** Speed in px/s for moving platforms. */
  moveSpeed?: number;
  /** Break timer remaining (ms). Set when player first lands. */
  breakTimer?: number;
  /** Whether a breakable platform has fully crumbled. */
  broken?: boolean;
}

/** Mid-level respawn flag. On death the player restarts at the last
 *  checkpoint they touched rather than the level start. */
export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

/** Temporary speed boost pickup. */
export interface SpeedBoost {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

/** Boss enemy — multi-hit, attack patterns, health bar. */
export interface Boss {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  /** Current behavior phase. */
  phase: 'idle' | 'charge' | 'vulnerable' | 'defeated';
  /** Timer for current phase (ms remaining). */
  phaseTimer: number;
  /** Direction the boss is facing / charging. */
  direction: number;
  speed: number;
  /** World-x patrol bounds for the boss arena. */
  arenaLeft: number;
  arenaRight: number;
}

/** Combo multiplier state tracked per-run. */
export interface ComboState {
  multiplier: number; // 1, 2, 3, 4
  /** ms remaining before combo resets. */
  timer: number;
  /** Running count of actions in this streak. */
  streak: number;
}

export interface Player {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  isGrounded: boolean;
  isFacingRight: boolean;
  isRunning: boolean;
  health: number;
  maxHealth: number;
  isInvincible: boolean;
  invincibilityTimer: number;
  jumpsRemaining: number; // For double jump mechanic (2 = can jump twice)
  /** Remaining ms until the fire-shot can be used again. */
  shootCooldownMs: number;
  /** Remaining ms to hold the flamethrow pose (visual only). */
  shootAnimMs: number;
  /** Remaining ms of speed boost. 0 = normal speed. */
  speedBoostMs: number;
}

/**
 * Player-fired fire projectile. Travels in a straight line in the
 * facing direction at the moment of firing, kills enemies on contact,
 * fizzles after a short life. Doesn't collide with terrain or hazards.
 */
export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  life: number;
  maxLife: number;
  facingRight: boolean;
}

export interface Prop {
  x: number;
  y: number;
  type: 'palmTree' | 'bush';
  scale?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  type: 'coin';
}

export interface WorldProp {
  id: string;
  x: number;
  y: number;
  type: 'vinyl' | 'weed' | 'trashCan';
  interactive?: boolean;
  scale?: number;
}

export interface ExpFeedback {
  id: string;
  x: number;
  y: number;
  startTime: number;
  amount: number;
  /** 'coin' = "+10" text only. 'exp' = EXP logo + amount. */
  kind: 'coin' | 'exp';
}

export interface ProgressionState {
  coins: number;
  exp: number;
  health: number;
  expFeedback: ExpFeedback[];
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  props: Prop[];
  collectibles: Collectible[];
  worldProps: WorldProp[];
  enemies: Enemy[];
  hazards: Hazard[];
  progression: ProgressionState;
  cameraX: number;
  levelWidth: number;
  levelHeight: number;
  isDying: boolean;
  deathTimer: number;
}

export type EnemyType = 'crab' | 'seagull' | 'policeman' | 'drone';
export type EnemyBehavior = 'patrol' | 'hover' | 'chase' | 'lockon';

/**
 * Enemy-fired projectile (drone laser). Travels toward the player's
 * last known position. Player contact = damage/death.
 */
export interface EnemyProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  life: number;
  maxLife: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  behavior: EnemyBehavior;
  patrolStart?: number;
  patrolEnd?: number;
  detectionRange?: number;
  speed?: number;
  /**
   * Horizontal direction for patrol / chase movement.
   * -1 = left, 1 = right.
   */
  direction?: number;
  /**
   * Vertical hover amplitude for flying enemies like seagulls.
   */
  hoverOffset?: number;
  /**
   * Whether a lock-on style enemy currently has the player targeted.
   */
  isLockedOn?: boolean;
  /**
   * Marks enemies that have been permanently defeated.
   */
  isDefeated?: boolean;
  /**
   * Optional sprite overrides for enemies with idle vs moving states.
   */
  idleSprite?: any;
  movingSprite?: any;
  /** Vertical patrol bounds for drones (world-y range). */
  patrolTopY?: number;
  patrolBottomY?: number;
  /** Vertical direction: -1 = up, 1 = down. */
  directionY?: number;
  /** Remaining ms until the drone can fire again. */
  shootCooldown?: number;
}

/**
 * Lightweight particle used for landing dust and coin sparkles.
 * World-space; rendered by GameWorld with camera offset.
 */
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // remaining ms
  maxLife: number;
  size: number;
  type: 'dust' | 'spark';
  color: string;
}

export interface Hazard {
  id: string;
  type: 'fire';
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
}

/**
 * End-of-level goal. When the player overlaps the goal bounds,
 * the current level is marked complete.
 */
export interface Goal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Cosmetic label shown in the HUD / level intro. */
  label?: string;
}

/**
 * Complete self-contained level definition. Levels are declarative
 * data — the engine (GameScreen) consumes this shape.
 */
export interface LevelData {
  id: string;
  name: string;
  tagline: string;
  widthPx: number;
  heightPx: number;
  spawn: { x: number; y: number };
  background: any; // require(...) reference
  platforms: Platform[];
  props: Prop[];
  worldProps: WorldProp[];
  collectibles: Collectible[];
  enemies: Enemy[];
  hazards: Hazard[];
  goal: Goal;
  checkpoints: Checkpoint[];
  speedBoosts: SpeedBoost[];
  boss?: Boss;
}