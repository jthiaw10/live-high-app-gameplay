/**
 * GameScreen — active gameplay engine.
 *
 * Responsibilities:
 *  - Run the fixed-timestep game loop (delegated to useGameLoop)
 *  - Own mutable per-level state (player, enemies, collectibles, camera)
 *  - Resolve physics and collisions
 *  - Detect goal overlap and emit onLevelComplete
 *  - Handle lives, pause, and the death/respawn loop
 *
 * The parent scene manager (App.tsx) owns cross-level state:
 * current level index, lives remaining, accumulated score.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useGameLoop } from '../hooks/useGameLoop';
import {
  checkCollectibleCollision,
  checkPlatformCollision,
  updateEnemy,
  checkEnemyCollision,
  checkHazardCollision,
  PHYSICS,
} from '../lib/physics';
import { getLevel } from '../lib/levels';
import { audio } from '../lib/audio';
import {
  GAME_CONFIG,
  BRAND,
  POWER_UNLOCK_COINS,
  PROJECTILE,
  WORLD_HEIGHT,
} from '../config/constants';
import {
  Player,
  Platform,
  Collectible,
  WorldProp,
  ProgressionState,
  Prop,
  Enemy,
  Hazard,
  Goal,
  LevelData,
  Particle,
  Projectile,
} from '../types/game';
import PlayerSprite from '../components/PlayerSprite';
import GameWorld from '../components/GameWorld';
import GameControls from '../components/GameControls';
import GameHUD from '../components/GameHUD';
import PauseOverlay from './PauseOverlay';
import LevelCompleteOverlay from './LevelCompleteOverlay';

const {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_MAX_JUMPS,
  PLAYER_SPAWN_HEALTH,
  COIN_EXP_VALUE,
  COIN_COMPLETION_BONUS,
  LEVEL_CLEAR_BONUS,
  DEATH_ANIMATION_MS,
} = GAME_CONFIG;

export interface LevelResult {
  coinsCollected: number;
  coinsTotal: number;
  exp: number;
  bonus: number;
  livesRemaining: number;
}

export interface GameScreenProps {
  levelIndex: number;
  livesRemaining: number;
  runningScore: number;
  onLevelComplete: (result: LevelResult) => void;
  onLifeLost: (livesRemaining: number) => void;
  onOutOfLives: () => void;
  onQuitToMenu: () => void;
}

interface GameState {
  player: Player;
  platforms: Platform[];
  props: Prop[];
  collectibles: Collectible[];
  worldProps: WorldProp[];
  enemies: Enemy[];
  hazards: Hazard[];
  goal: Goal;
  progression: ProgressionState;
  particles: Particle[];
  projectiles: Projectile[];
  cameraX: number;
  cameraShake: number;
  levelWidth: number;
  levelHeight: number;
  isDying: boolean;
  deathTimer: number;
  isLevelComplete: boolean;
}

// Monotonic counter for projectile ids.
let projectileIdSeq = 0;

function spawnFireProjectile(player: Player): Projectile {
  const facingRight = player.isFacingRight;
  // Spawn from the "arm" — just past the player's leading edge,
  // centered on the torso vertically.
  const armY = player.position.y + player.height * 0.42;
  const startX = facingRight
    ? player.position.x + player.width + 2
    : player.position.x - PROJECTILE.WIDTH - 2;
  return {
    id: `proj-${projectileIdSeq++}`,
    x: startX,
    y: armY,
    vx: facingRight ? PROJECTILE.SPEED : -PROJECTILE.SPEED,
    vy: 0,
    width: PROJECTILE.WIDTH,
    height: PROJECTILE.HEIGHT,
    life: PROJECTILE.LIFE_MS,
    maxLife: PROJECTILE.LIFE_MS,
    facingRight,
  };
}

// Particle helpers — kept here so spawning stays colocated with game logic.
let particleIdSeq = 0;
function makeDustParticles(x: number, y: number): Particle[] {
  const out: Particle[] = [];
  const count = 6;
  for (let i = 0; i < count; i++) {
    const angle = Math.PI + (Math.random() - 0.5) * Math.PI; // upward-ish
    const speed = 60 + Math.random() * 80;
    out.push({
      id: `dust-${particleIdSeq++}`,
      x: x + (Math.random() - 0.5) * 40,
      y,
      vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
      vy: -Math.abs(Math.sin(angle)) * speed * 0.5,
      life: 420,
      maxLife: 420,
      size: 6 + Math.random() * 6,
      type: 'dust',
      color: 'rgba(245, 241, 232, 0.75)',
    });
  }
  return out;
}

function makeSparkParticles(x: number, y: number): Particle[] {
  const out: Particle[] = [];
  const count = 10;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 120 + Math.random() * 120;
    out.push({
      id: `spark-${particleIdSeq++}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 520,
      maxLife: 520,
      size: 4 + Math.random() * 4,
      type: 'spark',
      color: i % 2 === 0 ? '#ffd84d' : '#00ffcc',
    });
  }
  return out;
}

const MAX_PARTICLES = 220;
function tickParticles(ps: Particle[], dtMs: number): Particle[] {
  const dt = dtMs / 1000;
  const out: Particle[] = [];
  for (const p of ps) {
    const life = p.life - dtMs;
    if (life <= 0) continue;
    // Gentle gravity on particles so they feel physical.
    const gravity = p.type === 'dust' ? 140 : 320;
    out.push({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * (p.type === 'dust' ? 0.92 : 0.97),
      vy: p.vy + gravity * dt,
      life,
    });
  }
  // Hard cap so long runs can't balloon render cost.
  if (out.length > MAX_PARTICLES) {
    // Drop the oldest (front of the array).
    return out.slice(out.length - MAX_PARTICLES);
  }
  return out;
}

function buildInitialState(level: LevelData): GameState {
  return {
    player: {
      position: { x: level.spawn.x, y: level.spawn.y },
      velocity: { x: 0, y: 0 },
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      isGrounded: true,
      isFacingRight: true,
      isRunning: false,
      health: PLAYER_SPAWN_HEALTH,
      maxHealth: PLAYER_SPAWN_HEALTH,
      isInvincible: false,
      invincibilityTimer: 0,
      jumpsRemaining: PLAYER_MAX_JUMPS,
      shootCooldownMs: 0,
      shootAnimMs: 0,
    },
    platforms: level.platforms,
    props: level.props,
    // Deep copy mutable fields so replays start clean.
    collectibles: level.collectibles.map((c) => ({ ...c, collected: false })),
    worldProps: level.worldProps,
    enemies: level.enemies.map((e) => ({
      ...e,
      isDefeated: false,
      isLockedOn: false,
    })),
    hazards: level.hazards,
    goal: level.goal,
    progression: {
      coins: 0,
      exp: 0,
      health: PLAYER_SPAWN_HEALTH,
      expFeedback: [],
    },
    particles: [],
    projectiles: [],
    cameraX: 0,
    cameraShake: 0,
    levelWidth: level.widthPx,
    levelHeight: level.heightPx,
    isDying: false,
    deathTimer: 0,
    isLevelComplete: false,
  };
}

export default function GameScreen({
  levelIndex,
  livesRemaining,
  runningScore,
  onLevelComplete,
  onLifeLost,
  onOutOfLives,
  onQuitToMenu,
}: GameScreenProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const level = getLevel(levelIndex);

  // Uniform render scale — world is authored in a 600-tall reference
  // coordinate space. At render time we scale everything so the world
  // fills the actual window vertically. Game logic and level data
  // stay in unscaled world coords; only rendering multiplies by this.
  const renderScale = SCREEN_HEIGHT / WORLD_HEIGHT;
  // Visible world width in world units (fewer world pixels fit in a
  // narrow window; the camera uses this for clamping and centering).
  const visibleWorldWidth = SCREEN_WIDTH / renderScale;

  const inputState = useRef({
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    // Edge-triggered shoot request. Set true by F key or touch tap,
    // consumed by the game loop each frame.
    shootRequested: false,
  });
  const prevJumpPressed = useRef(false);

  // Forgiveness timers for platformer feel.
  // coyoteMs: remaining ms during which a jump input still counts
  //           after walking off a ledge.
  // jumpBufferMs: remaining ms during which an early jump press
  //               will auto-trigger on next landing.
  const coyoteMs = useRef(0);
  const jumpBufferMs = useRef(0);
  const prevGroundedRef = useRef(true);

  // Smoothed camera target + lookahead — the game loop lerps toward
  // this each frame for cinematic follow without jitter.
  const cameraXRef = useRef(0);

  // Lives counter is local so we can decrement immediately on death
  // without having to round-trip through the parent scene manager.
  const livesRef = useRef(livesRemaining);
  useEffect(() => {
    livesRef.current = livesRemaining;
  }, [livesRemaining]);

  const [gameState, setGameState] = useState<GameState>(() => buildInitialState(level));
  const [lives, setLives] = useState(livesRemaining);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingComplete, setPendingComplete] = useState<LevelResult | null>(null);

  // Power-up ceremony: 'glow' = freeze + show Power Up pose,
  // 'modal' = show the flame chalice unlock modal, null = normal play.
  const [powerUpPhase, setPowerUpPhase] = useState<null | 'glow' | 'modal'>(null);
  // Track whether the power was already unlocked so the ceremony only
  // triggers once per run.
  const powerCeremonyDone = useRef(false);

  // Rebuild state when the level index changes
  useEffect(() => {
    cameraXRef.current = 0;
    coyoteMs.current = 0;
    jumpBufferMs.current = 0;
    prevGroundedRef.current = true;
    setGameState(buildInitialState(getLevel(levelIndex)));
    setPendingComplete(null);
    setIsPaused(false);
  }, [levelIndex]);

  // Keyboard bindings. Escape toggles pause. R restarts current level.
  useEffect(() => {
    const win = (globalThis as any).window;
    if (!win) return;

    const handleKeyDown = (e: any) => {
      const key = e.key.toLowerCase();

      if (key === 'escape' || key === 'p') {
        e.preventDefault();
        setIsPaused((p) => !p);
        audio.play('menuClick');
        return;
      }

      if (key === 'r') {
        e.preventDefault();
        cameraXRef.current = 0;
        coyoteMs.current = 0;
        jumpBufferMs.current = 0;
        prevGroundedRef.current = true;
        setGameState(buildInitialState(getLevel(levelIndex)));
        return;
      }

      if (key === 'arrowleft' || key === 'a') {
        inputState.current.left = true;
      } else if (key === 'arrowright' || key === 'd') {
        inputState.current.right = true;
      } else if (key === ' ' || key === 'arrowup' || key === 'w') {
        e.preventDefault();
        if (!inputState.current.jump) {
          inputState.current.jump = true;
          inputState.current.jumpJustPressed = true;
        }
      } else if (key === 'f' || key === 'j' || key === 'x') {
        // Fire-shot trigger — edge-triggered, ignored by the loop
        // if the power is locked or cooldown is active.
        e.preventDefault();
        inputState.current.shootRequested = true;
      }
    };

    const handleKeyUp = (e: any) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') inputState.current.left = false;
      else if (key === 'arrowright' || key === 'd') inputState.current.right = false;
      else if (key === ' ' || key === 'arrowup' || key === 'w') inputState.current.jump = false;
    };

    win.addEventListener('keydown', handleKeyDown);
    win.addEventListener('keyup', handleKeyUp);
    return () => {
      win.removeEventListener('keydown', handleKeyDown);
      win.removeEventListener('keyup', handleKeyUp);
    };
  }, [levelIndex]);

  const gameLoop = useCallback(
    (deltaTimeMs: number) => {
      // Freeze time during pause / level complete / power-up ceremony.
      if (isPaused || pendingComplete || powerUpPhase) return;

      const dt = deltaTimeMs / 1000;

      setGameState((prevState) => {
        const { player } = prevState;
        const levelSpawn = getLevel(levelIndex).spawn;

        // --------------------------------------------------------------
        // Death animation tick
        // --------------------------------------------------------------
        if (prevState.isDying) {
          const newDeathTimer = prevState.deathTimer - deltaTimeMs;

          if (newDeathTimer <= 0) {
            const remaining = livesRef.current - 1;

            if (remaining <= 0) {
              // Out of lives — hand control back to the scene manager.
              livesRef.current = 0;
              setLives(0);
              setTimeout(() => onOutOfLives(), 0);
              return { ...prevState, isDying: false, deathTimer: 0 };
            }

            livesRef.current = remaining;
            setLives(remaining);
            // Let the scene manager know about the new life count so it
            // persists across levels.
            setTimeout(() => onLifeLost(remaining), 0);

            // Respawn at level start, reset level entities, keep score.
            cameraXRef.current = 0;
            coyoteMs.current = 0;
            jumpBufferMs.current = 0;
            prevGroundedRef.current = true;
            const fresh = buildInitialState(getLevel(levelIndex));
            return {
              ...fresh,
              // Preserve running coin/exp count so the player doesn't feel
              // punished for a death in the middle of a collection run.
              progression: prevState.progression,
            };
          }

          // Keep particles animating during the death freeze.
          return {
            ...prevState,
            deathTimer: newDeathTimer,
            particles: tickParticles(prevState.particles, deltaTimeMs),
            cameraShake: Math.max(0, prevState.cameraShake - deltaTimeMs * 0.04),
          };
        }

        // --------------------------------------------------------------
        // Input -> horizontal acceleration (smooth start/stop)
        // --------------------------------------------------------------
        let newPlayer: Player = { ...player, velocity: { ...player.velocity } };
        // Particles spawned this frame — merged at the end instead of
        // being pushed into prevState (which is immutable from React's POV).
        const frameParticles: Particle[] = [];

        if (newPlayer.isInvincible && newPlayer.invincibilityTimer > 0) {
          newPlayer.invincibilityTimer = Math.max(0, newPlayer.invincibilityTimer - deltaTimeMs);
          if (newPlayer.invincibilityTimer === 0) newPlayer.isInvincible = false;
        }

        // Target velocity from input. Zero means "decelerate to rest".
        let targetVx = 0;
        if (inputState.current.left) {
          targetVx = -PHYSICS.MOVE_SPEED;
          newPlayer.isFacingRight = false;
        } else if (inputState.current.right) {
          targetVx = PHYSICS.MOVE_SPEED;
          newPlayer.isFacingRight = true;
        }

        // Pick accel/friction based on ground vs air and whether player
        // is actively pushing a direction. Friction is stronger than
        // acceleration so stops feel crisp.
        const onGround = newPlayer.isGrounded;
        let horizRate: number;
        if (targetVx !== 0) {
          horizRate = onGround ? PHYSICS.GROUND_ACCEL : PHYSICS.AIR_ACCEL;
        } else {
          horizRate = onGround ? PHYSICS.GROUND_FRICTION : PHYSICS.AIR_FRICTION;
        }

        const dvx = targetVx - newPlayer.velocity.x;
        const step = horizRate * dt;
        if (Math.abs(dvx) <= step) {
          newPlayer.velocity.x = targetVx;
        } else {
          newPlayer.velocity.x += Math.sign(dvx) * step;
        }
        newPlayer.isRunning = onGround && Math.abs(newPlayer.velocity.x) > 30;

        // Coyote window bookkeeping (was grounded last frame, not this one).
        if (onGround) {
          coyoteMs.current = PHYSICS.COYOTE_MS;
        } else {
          coyoteMs.current = Math.max(0, coyoteMs.current - deltaTimeMs);
        }

        // Jump buffer bookkeeping.
        if (inputState.current.jump && !prevJumpPressed.current) {
          jumpBufferMs.current = PHYSICS.JUMP_BUFFER_MS;
        } else {
          jumpBufferMs.current = Math.max(0, jumpBufferMs.current - deltaTimeMs);
        }
        prevJumpPressed.current = inputState.current.jump;

        // Try to consume a buffered jump.
        // Ground/coyote jump is "free" (doesn't spend the double-jump).
        // Air jump spends one of the remaining jumps.
        const canCoyoteJump =
          coyoteMs.current > 0 && newPlayer.velocity.y >= 0 && newPlayer.jumpsRemaining > 0;
        const canAirJump = !canCoyoteJump && newPlayer.jumpsRemaining > 0;

        if (jumpBufferMs.current > 0 && (canCoyoteJump || canAirJump)) {
          newPlayer.velocity.y = PHYSICS.JUMP_POWER;
          newPlayer.jumpsRemaining -= 1;
          jumpBufferMs.current = 0;
          coyoteMs.current = 0;
          audio.play('jump');
          // Spawn dust where the player took off.
          frameParticles.push(
            ...makeDustParticles(
              newPlayer.position.x + newPlayer.width / 2,
              newPlayer.position.y + newPlayer.height
            )
          );
        }

        // Variable jump height — cut upward velocity when jump released.
        if (!inputState.current.jump && newPlayer.velocity.y < 0) {
          newPlayer.velocity.y *= PHYSICS.JUMP_RELEASE_MULTIPLIER;
        }

        // --------------------------------------------------------------
        // Fire-shot superpower — unlocked at POWER_UNLOCK_COINS coins.
        // --------------------------------------------------------------
        const powerUnlocked = prevState.progression.coins >= POWER_UNLOCK_COINS;
        newPlayer.shootCooldownMs = Math.max(0, newPlayer.shootCooldownMs - deltaTimeMs);
        newPlayer.shootAnimMs = Math.max(0, newPlayer.shootAnimMs - deltaTimeMs);

        const newProjectilesToSpawn: Projectile[] = [];
        if (
          powerUnlocked &&
          inputState.current.shootRequested &&
          newPlayer.shootCooldownMs === 0
        ) {
          newProjectilesToSpawn.push(spawnFireProjectile(newPlayer));
          newPlayer.shootCooldownMs = PROJECTILE.COOLDOWN_MS;
          newPlayer.shootAnimMs = 220; // hold flamethrow pose for 220ms
          audio.play('hit');
          // Muzzle flash particles.
          const muzzleX = newPlayer.isFacingRight
            ? newPlayer.position.x + newPlayer.width + 6
            : newPlayer.position.x - 6;
          frameParticles.push(
            ...makeSparkParticles(muzzleX, newPlayer.position.y + newPlayer.height * 0.42)
          );
        }
        // Consume the edge-triggered request every frame regardless of
        // whether we actually fired, so a held key fires exactly once.
        inputState.current.shootRequested = false;

        // --------------------------------------------------------------
        // Vertical physics — dual gravity for snappy arcs
        // --------------------------------------------------------------
        const gravity = newPlayer.velocity.y < 0 ? PHYSICS.GRAVITY : PHYSICS.FALL_GRAVITY;
        newPlayer.velocity.y = Math.min(
          newPlayer.velocity.y + gravity * dt,
          PHYSICS.MAX_FALL_SPEED
        );

        newPlayer.position.x += newPlayer.velocity.x * dt;
        newPlayer.position.y += newPlayer.velocity.y * dt;

        // Clamp to level bounds horizontally
        if (newPlayer.position.x < 0) {
          newPlayer.position.x = 0;
          newPlayer.velocity.x = 0;
        }
        if (newPlayer.position.x + newPlayer.width > prevState.levelWidth) {
          newPlayer.position.x = prevState.levelWidth - newPlayer.width;
          newPlayer.velocity.x = 0;
        }

        const collision = checkPlatformCollision(newPlayer, prevState.platforms);
        const wasAirborne = !prevGroundedRef.current;
        const landingVy = newPlayer.velocity.y;
        if (collision.collided && collision.platform) {
          newPlayer.position.y = collision.platform.y - newPlayer.height;
          newPlayer.velocity.y = 0;
          newPlayer.isGrounded = true;
          newPlayer.jumpsRemaining = PLAYER_MAX_JUMPS;

          // Landing puff — only if we actually fell, not if we were
          // already glued to ground (fps hitches).
          if (wasAirborne && landingVy > 220) {
            frameParticles.push(
              ...makeDustParticles(
                newPlayer.position.x + newPlayer.width / 2,
                newPlayer.position.y + newPlayer.height
              )
            );
          }
        } else {
          newPlayer.isGrounded = false;
        }
        prevGroundedRef.current = newPlayer.isGrounded;

        // --------------------------------------------------------------
        // Fall-off-world death. Threshold is in WORLD coords (not
        // screen pixels) so it stays consistent across window sizes.
        // --------------------------------------------------------------
        if (newPlayer.position.y > WORLD_HEIGHT + 200) {
          audio.play('death');
          return {
            ...prevState,
            player: newPlayer,
            particles: [...prevState.particles, ...frameParticles],
            cameraShake: 10,
            isDying: true,
            deathTimer: DEATH_ANIMATION_MS,
          };
        }

        // Progression state — moved here (above projectile collision)
        // so enemy kills can award EXP.
        const newProgression = { ...prevState.progression };

        // --------------------------------------------------------------
        // Enemies
        // --------------------------------------------------------------
        const newEnemies = prevState.enemies.map((enemy) =>
          updateEnemy(enemy, newPlayer.position.x, deltaTimeMs)
        );

        // --------------------------------------------------------------
        // Projectiles — motion + TTL + enemy collision.
        // Projectiles pass through platforms and hazards, only hit
        // enemies. Mutates newEnemies by flipping isDefeated.
        // --------------------------------------------------------------
        const projectilePool: Projectile[] = [
          ...prevState.projectiles,
          ...newProjectilesToSpawn,
        ];
        const livingProjectiles: Projectile[] = [];
        for (const p of projectilePool) {
          const nextX = p.x + p.vx * dt;
          const nextY = p.y + p.vy * dt;
          const nextLife = p.life - deltaTimeMs;

          if (nextLife <= 0) continue;
          // Fizzle if it flew off the level horizontally.
          if (nextX < -100 || nextX > prevState.levelWidth + 100) continue;

          // Collide against enemies.
          let consumed = false;
          for (let i = 0; i < newEnemies.length; i++) {
            const e = newEnemies[i];
            if (e.isDefeated || e.health <= 0) continue;
            const hit =
              nextX + p.width > e.x &&
              nextX < e.x + e.width &&
              nextY + p.height > e.y &&
              nextY < e.y + e.height;
            if (hit) {
              newEnemies[i] = { ...e, isDefeated: true, health: 0 };
              consumed = true;
              audio.play('hit');
              // Award EXP for the kill.
              newProgression.exp += COIN_EXP_VALUE;
              newProgression.expFeedback.push({
                id: `exp-${Date.now()}-${Math.random()}`,
                x: e.x + e.width / 2,
                y: e.y,
                startTime: Date.now(),
                amount: COIN_EXP_VALUE,
                kind: 'exp',
              });
              // Kill burst sparks.
              frameParticles.push(
                ...makeSparkParticles(e.x + e.width / 2, e.y + e.height / 2)
              );
              break;
            }
          }
          if (consumed) continue;

          // Simple fire trail — a single spark every frame behind
          // the projectile, fading out as it travels.
          if (Math.random() < 0.9) {
            frameParticles.push({
              id: `ftrail-${particleIdSeq++}`,
              x: p.x + (p.facingRight ? 0 : p.width),
              y: p.y + p.height / 2 + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 60 + (p.facingRight ? -120 : 120),
              vy: (Math.random() - 0.5) * 60 - 30,
              life: 260,
              maxLife: 260,
              size: 5 + Math.random() * 4,
              type: 'spark',
              color: Math.random() < 0.5 ? BRAND.sunsetOrange : BRAND.gold,
            });
          }

          livingProjectiles.push({
            ...p,
            x: nextX,
            y: nextY,
            life: nextLife,
          });
        }

        let shouldDie = false;
        for (const enemy of newEnemies) {
          if (enemy.isDefeated || enemy.health <= 0) continue;
          const col = checkEnemyCollision(newPlayer, enemy);
          if (col.type === 'damage') {
            shouldDie = true;
            break;
          }
        }

        if (!shouldDie) {
          for (const hazard of prevState.hazards) {
            if (checkHazardCollision(newPlayer, hazard)) {
              shouldDie = true;
              break;
            }
          }
        }

        if (shouldDie) {
          audio.play('death');
          return {
            ...prevState,
            player: newPlayer,
            enemies: newEnemies,
            projectiles: livingProjectiles,
            particles: [
              ...prevState.particles,
              ...frameParticles,
              ...makeSparkParticles(
                newPlayer.position.x + newPlayer.width / 2,
                newPlayer.position.y + newPlayer.height / 2
              ),
            ],
            cameraShake: 14,
            isDying: true,
            deathTimer: DEATH_ANIMATION_MS,
          };
        }

        // --------------------------------------------------------------
        // Coins
        // --------------------------------------------------------------
        const playerBounds = {
          x: newPlayer.position.x,
          y: newPlayer.position.y,
          width: newPlayer.width,
          height: newPlayer.height,
        };

        let pickedCoin = false;
        const spawnedSparks: Particle[] = [];
        const newCollectibles = prevState.collectibles.map((coin) => {
          if (coin.collected) return coin;
          if (checkCollectibleCollision(playerBounds, coin)) {
            pickedCoin = true;
            newProgression.coins += 1;
            newProgression.expFeedback.push({
              id: `coin-${Date.now()}-${Math.random()}`,
              x: coin.x,
              y: coin.y,
              startTime: Date.now(),
              amount: COIN_EXP_VALUE,
              kind: 'coin',
            });
            spawnedSparks.push(
              ...makeSparkParticles(coin.x + coin.width / 2, coin.y + coin.height / 2)
            );
            return { ...coin, collected: true };
          }
          return coin;
        });
        if (pickedCoin) audio.play('coin');

        // --- Power-up ceremony trigger ---
        // When the player crosses the coin threshold, freeze the game
        // and kick off the ceremony. Only fires once per run.
        if (
          newProgression.coins >= POWER_UNLOCK_COINS &&
          prevState.progression.coins < POWER_UNLOCK_COINS &&
          !powerCeremonyDone.current
        ) {
          powerCeremonyDone.current = true;
          audio.play('levelComplete');
          // Phase 1: "glow" — freeze everything, show the Power Up pose.
          // After 1.5s, transition to the modal phase.
          setTimeout(() => setPowerUpPhase('glow'), 0);
          setTimeout(() => setPowerUpPhase('modal'), 1500);
        }

        newProgression.expFeedback = newProgression.expFeedback.filter(
          (f) => Date.now() - f.startTime < 1000
        );
        newProgression.health = newPlayer.health;

        // --------------------------------------------------------------
        // Goal overlap -> level complete
        // --------------------------------------------------------------
        const g = prevState.goal;
        const goalHit =
          newPlayer.position.x + newPlayer.width > g.x &&
          newPlayer.position.x < g.x + g.width &&
          newPlayer.position.y + newPlayer.height > g.y &&
          newPlayer.position.y < g.y + g.height;

        if (goalHit) {
          const coinsTotal = newCollectibles.length;
          const allCoinsBonus =
            newProgression.coins === coinsTotal ? COIN_COMPLETION_BONUS : 0;
          const result: LevelResult = {
            coinsCollected: newProgression.coins,
            coinsTotal,
            exp: newProgression.exp,
            bonus: LEVEL_CLEAR_BONUS + allCoinsBonus,
            livesRemaining: livesRef.current,
          };
          audio.play('levelComplete');
          setPendingComplete(result);
          return {
            ...prevState,
            player: newPlayer,
            enemies: newEnemies,
            collectibles: newCollectibles,
            progression: newProgression,
            projectiles: livingProjectiles,
            particles: [
              ...prevState.particles,
              ...frameParticles,
              ...spawnedSparks,
              ...makeSparkParticles(g.x + g.width / 2, g.y + g.height / 2),
              ...makeSparkParticles(g.x + g.width / 2, g.y + g.height / 4),
            ],
            isLevelComplete: true,
          };
        }

        // --------------------------------------------------------------
        // Camera — smoothed follow with look-ahead in facing direction.
        // Uses visibleWorldWidth (in world units, derived from the
        // render scale) so it stays correct at every window size.
        // --------------------------------------------------------------
        const lookAhead = newPlayer.isFacingRight ? 120 : -120;
        const maxCameraX = Math.max(0, prevState.levelWidth - visibleWorldWidth);
        const targetCameraX = Math.max(
          0,
          Math.min(
            newPlayer.position.x - visibleWorldWidth / 2 + newPlayer.width / 2 + lookAhead,
            maxCameraX
          )
        );
        // Critically-damped-ish lerp (frame-rate independent).
        const lerpK = 1 - Math.exp(-dt * 7);
        const cameraX = cameraXRef.current + (targetCameraX - cameraXRef.current) * lerpK;
        cameraXRef.current = cameraX;

        // --------------------------------------------------------------
        // Particle + shake tick
        // --------------------------------------------------------------
        const updatedParticles = tickParticles(
          [...prevState.particles, ...frameParticles, ...spawnedSparks],
          deltaTimeMs
        );
        const nextShake = Math.max(0, prevState.cameraShake - deltaTimeMs * 0.04);

        return {
          ...prevState,
          player: newPlayer,
          cameraX,
          cameraShake: nextShake,
          particles: updatedParticles,
          projectiles: livingProjectiles,
          collectibles: newCollectibles,
          enemies: newEnemies,
          progression: newProgression,
        };
      });
    },
    [
      visibleWorldWidth,
      isPaused,
      pendingComplete,
      powerUpPhase,
      levelIndex,
      onOutOfLives,
      onLifeLost,
    ]
  );

  useGameLoop(gameLoop);

  // Touch control wiring
  const handleLeftPress = () => {
    inputState.current.left = true;
  };
  const handleLeftRelease = () => {
    inputState.current.left = false;
  };
  const handleRightPress = () => {
    inputState.current.right = true;
  };
  const handleRightRelease = () => {
    inputState.current.right = false;
  };
  const handleJumpPress = () => {
    inputState.current.jump = true;
    inputState.current.jumpJustPressed = true;
  };
  const handleJumpRelease = () => {
    inputState.current.jump = false;
  };
  const handleShootPress = () => {
    inputState.current.shootRequested = true;
  };

  const handleResume = () => {
    audio.play('menuClick');
    setIsPaused(false);
  };
  const handleRestart = () => {
    audio.play('menuClick');
    cameraXRef.current = 0;
    coyoteMs.current = 0;
    jumpBufferMs.current = 0;
    prevGroundedRef.current = true;
    setGameState(buildInitialState(getLevel(levelIndex)));
    setIsPaused(false);
  };
  const handleQuit = () => {
    audio.play('menuClick');
    onQuitToMenu();
  };
  const handleNext = () => {
    if (!pendingComplete) return;
    audio.play('menuClick');
    const result = pendingComplete;
    setPendingComplete(null);
    onLevelComplete(result);
  };

  // Procedural screen shake offset. Sampled from a jittered sine so it
  // reads as "kick" rather than raw random noise.
  const shakeX =
    gameState.cameraShake > 0.1
      ? (Math.sin(Date.now() * 0.08) + (Math.random() - 0.5)) * gameState.cameraShake
      : 0;
  const shakeY =
    gameState.cameraShake > 0.1
      ? (Math.cos(Date.now() * 0.09) + (Math.random() - 0.5)) * gameState.cameraShake * 0.6
      : 0;

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          transform: [{ translateX: shakeX }, { translateY: shakeY }],
        }}
      >
        <GameWorld
          platforms={gameState.platforms}
          props={gameState.props}
          collectibles={gameState.collectibles}
          worldProps={gameState.worldProps}
          enemies={gameState.enemies}
          hazards={gameState.hazards}
          goal={gameState.goal}
          background={level.background}
          particles={gameState.particles}
          projectiles={gameState.projectiles}
          cameraX={gameState.cameraX}
          playerX={gameState.player.position.x}
          renderScale={renderScale}
          screenWidth={SCREEN_WIDTH}
          screenHeight={SCREEN_HEIGHT}
          levelWidth={gameState.levelWidth}
        />

        <View
          style={{
            position: 'absolute',
            left: (gameState.player.position.x - gameState.cameraX) * renderScale,
            top: gameState.player.position.y * renderScale,
            width: PLAYER_WIDTH * renderScale,
            height: PLAYER_HEIGHT * renderScale,
            opacity: gameState.isDying ? 0.3 : gameState.player.isInvincible ? 0.5 : 1,
            overflow: 'visible',
          }}
        >
          <PlayerSprite
            isRunning={gameState.player.isRunning}
            facingRight={gameState.player.isFacingRight}
            width={PLAYER_WIDTH * renderScale}
            height={PLAYER_HEIGHT * renderScale}
            velocityY={gameState.player.velocity.y}
            isGrounded={gameState.player.isGrounded}
            isShooting={gameState.player.shootAnimMs > 0}
          />
        </View>
      </View>

      <GameHUD
        coins={gameState.progression.coins}
        exp={gameState.progression.exp}
        health={gameState.player.health}
        maxHealth={gameState.player.maxHealth}
        expFeedbacks={gameState.progression.expFeedback}
        cameraX={gameState.cameraX}
        renderScale={renderScale}
      />

      {/* Level label + lives, top-right */}
      <View style={styles.topRight} pointerEvents="box-none">
        <Text style={styles.levelLabel}>{level.name.toUpperCase()}</Text>
        <Text style={styles.livesLabel}>LIVES {lives}  SCORE {runningScore}</Text>
        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={() => {
            audio.play('menuClick');
            setIsPaused(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pauseBtnText}>II</Text>
        </TouchableOpacity>
      </View>

      <GameControls
        onLeftPress={handleLeftPress}
        onLeftRelease={handleLeftRelease}
        onRightPress={handleRightPress}
        onRightRelease={handleRightRelease}
        onJumpPress={handleJumpPress}
        onJumpRelease={handleJumpRelease}
        onShootPress={handleShootPress}
        powerUnlocked={gameState.progression.coins >= POWER_UNLOCK_COINS}
      />

      {gameState.isDying && (
        <View style={styles.deathOverlay} pointerEvents="none">
          <View style={styles.deathContent}>
            <Text style={styles.skullText}>DOWNED</Text>
            <Text style={styles.skullSub}>
              {lives - 1 > 0 ? `${lives - 1} LIVES LEFT` : 'FINAL LIFE LOST'}
            </Text>
          </View>
        </View>
      )}

      {isPaused && (
        <PauseOverlay
          levelName={level.name}
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      {pendingComplete && (
        <LevelCompleteOverlay
          levelName={level.name}
          result={pendingComplete}
          onNext={handleNext}
        />
      )}

      {/* ============================================================
          POWER-UP CEREMONY
          Phase 'glow': frozen screen + Power Up pose + radial glow
          Phase 'modal': branded unlock modal with Flame Chalice
          ============================================================ */}
      {powerUpPhase && (
        <View style={styles.ceremonyOverlay}>
          {/* Dark tinted backdrop so the frozen world recedes */}
          <View style={styles.ceremonyBackdrop} />

          {powerUpPhase === 'glow' && (
            <View style={styles.ceremonyCenter}>
              {/* Radial glow rings behind the character */}
              <View style={[styles.glowRing, styles.glowRingOuter]} />
              <View style={[styles.glowRing, styles.glowRingMid]} />
              <View style={[styles.glowRing, styles.glowRingInner]} />
              {/* Power Up sprite */}
              <Image
                source={require('../assets/Power Up.png')}
                style={styles.powerUpSprite}
                resizeMode="contain"
              />
              <Text style={styles.powerUpText}>POWER UP</Text>
            </View>
          )}

          {powerUpPhase === 'modal' && (
            <View style={styles.ceremonyCenter}>
              {/* Glow persists behind the modal */}
              <View style={[styles.glowRing, styles.glowRingOuter, { opacity: 0.15 }]} />

              <View style={styles.unlockCard}>
                <Text style={styles.unlockEyebrow}>NEW ABILITY UNLOCKED</Text>

                <View style={styles.unlockDivider} />

                {/* Flame Chalice showcase */}
                <Image
                  source={require('../assets/FLAME CHALACE IMAGE.png')}
                  style={styles.chaliceImage}
                  resizeMode="contain"
                />

                <Text style={styles.unlockTitle}>FLAME CHALICE</Text>
                <Text style={styles.unlockDesc}>
                  Press F or tap FIRE to shoot{'\n'}fireballs and defeat enemies
                </Text>

                <TouchableOpacity
                  style={styles.unlockBtn}
                  onPress={() => {
                    audio.play('menuClick');
                    setPowerUpPhase(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.unlockBtnText}>ACCEPT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.nightPurple,
  },
  topRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 4,
  },
  levelLabel: {
    color: BRAND.gold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: BRAND.softShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  livesLabel: {
    color: BRAND.neonTeal,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pauseBtn: {
    marginTop: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 20, 51, 0.85)',
    borderWidth: 2,
    borderColor: BRAND.neonTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnText: {
    color: BRAND.neonTeal,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
  deathOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(230, 57, 70, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deathContent: { alignItems: 'center' },
  skullText: {
    fontSize: 64,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: BRAND.offWhite,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  skullSub: {
    fontSize: 16,
    marginTop: 10,
    color: BRAND.gold,
    letterSpacing: 3,
    fontWeight: 'bold',
  },

  // --- Power-up ceremony styles ---
  ceremonyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  ceremonyBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 8, 22, 0.75)',
  },
  ceremonyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Radial glow rings
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowRingOuter: {
    width: 420,
    height: 420,
    backgroundColor: BRAND.sunsetOrange,
    opacity: 0.12,
  },
  glowRingMid: {
    width: 280,
    height: 280,
    backgroundColor: BRAND.gold,
    opacity: 0.2,
  },
  glowRingInner: {
    width: 180,
    height: 180,
    backgroundColor: BRAND.reggaeYellow,
    opacity: 0.3,
  },

  powerUpSprite: {
    width: 200,
    height: 230,
    marginBottom: 10,
  },
  powerUpText: {
    color: BRAND.gold,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  // Unlock modal card
  unlockCard: {
    width: 360,
    padding: 28,
    borderRadius: 20,
    backgroundColor: BRAND.nightPurple,
    borderWidth: 3,
    borderColor: BRAND.gold,
    alignItems: 'center',
    shadowColor: BRAND.sunsetOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  unlockEyebrow: {
    color: BRAND.neonTeal,
    fontSize: 13,
    letterSpacing: 5,
    fontWeight: 'bold',
  },
  unlockDivider: {
    height: 2,
    width: 80,
    backgroundColor: BRAND.sunsetOrange,
    marginVertical: 16,
    borderRadius: 2,
  },
  chaliceImage: {
    width: 220,
    height: 115,
    marginBottom: 16,
  },
  unlockTitle: {
    color: BRAND.gold,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: BRAND.sunsetOrange,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  unlockDesc: {
    color: BRAND.offWhite,
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
    opacity: 0.85,
  },
  unlockBtn: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    backgroundColor: BRAND.sunsetOrange,
    borderWidth: 2,
    borderColor: BRAND.gold,
  },
  unlockBtnText: {
    color: BRAND.nightPurple,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
