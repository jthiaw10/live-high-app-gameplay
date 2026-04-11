import { Player, Platform, Collectible, Enemy } from '../types/game';

// Physics constants in world pixels per second (px/s) and px/s².
//
// Tuning philosophy:
// - Single jump must clear ~150px of rise so level 1's lowest platform
//   is reachable without double-jump (teaches before demanding).
//   Rise = v₀² / 2g  ⇒  820² / 4400 ≈ 152 px with base gravity 2200.
// - Fall gravity is higher than rise gravity for a snappier, less floaty
//   arc (a trick most well-tuned platformers use).
// - Horizontal motion is acceleration-based so the player can "feather"
//   precise positioning; stopping is faster than starting for tight feel.
// - Air control is reduced but not zero so mid-air corrections are possible.
export const PHYSICS = {
  // Vertical
  GRAVITY: 2200,            // applied while rising
  FALL_GRAVITY: 3000,       // applied while falling (heavier)
  JUMP_POWER: -820,
  MAX_FALL_SPEED: 1100,
  JUMP_RELEASE_MULTIPLIER: 0.45,

  // Horizontal
  MOVE_SPEED: 340,          // max horizontal speed
  GROUND_ACCEL: 3200,       // px/s² when input matches facing direction on ground
  GROUND_FRICTION: 3800,    // px/s² when no horizontal input on ground
  AIR_ACCEL: 2000,          // px/s² in air
  AIR_FRICTION: 900,        // px/s² air drag (lower = more momentum preserved)

  // Forgiveness windows (ms)
  COYOTE_MS: 120,           // grace after walking off a ledge
  JUMP_BUFFER_MS: 140,      // input queued before landing
};

export function checkPlatformCollision(
  player: Player,
  platforms: Platform[]
): { collided: boolean; platform: Platform | null } {
  for (const platform of platforms) {
    if (
      player.position.x + player.width > platform.x &&
      player.position.x < platform.x + platform.width &&
      player.position.y + player.height >= platform.y &&
      player.position.y + player.height <= platform.y + 20 &&
      player.velocity.y >= 0
    ) {
      return { collided: true, platform };
    }
  }
  return { collided: false, platform: null };
}

export function checkCollectibleCollision(
  player: { x: number; y: number; width: number; height: number },
  collectible: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    player.x < collectible.x + collectible.width &&
    player.x + player.width > collectible.x &&
    player.y < collectible.y + collectible.height &&
    player.y + player.height > collectible.y
  );
}

export function applyGravity(player: Player, deltaTimeMs: number): Player {
  const dt = deltaTimeMs / 1000;

  const newVelocityY = Math.min(
    player.velocity.y + PHYSICS.GRAVITY * dt,
    PHYSICS.MAX_FALL_SPEED
  );

  return {
    ...player,
    velocity: {
      ...player.velocity,
      y: newVelocityY,
    },
  };
}

// NOTE: Not used by the current GameScreen, but kept correct for future use.
export function updatePlayerPosition(
  player: Player,
  platforms: Platform[],
  deltaTimeMs: number = 16.67
): Player {
  const dt = deltaTimeMs / 1000;

  let newPlayer = { ...player };

  newPlayer.position.x += newPlayer.velocity.x * dt;
  newPlayer.position.y += newPlayer.velocity.y * dt;

  const collision = checkPlatformCollision(newPlayer, platforms);

  if (collision.collided && collision.platform) {
    newPlayer.position.y = collision.platform.y - newPlayer.height;
    newPlayer.velocity.y = 0;
    newPlayer.isGrounded = true;
  } else {
    newPlayer.isGrounded = false;
  }

  return newPlayer;
}

export function updateEnemy(enemy: Enemy, playerX: number, deltaTime: number): Enemy {
  if (enemy.isDefeated) return enemy;

  const dt = deltaTime / 1000;
  let updatedEnemy: Enemy = { ...enemy };

  // Ensure we always have a direction for horizontal movement enemies
  if (updatedEnemy.direction === undefined || updatedEnemy.direction === 0) {
    updatedEnemy.direction = 1;
  }

  switch (enemy.behavior) {
    case 'patrol': {
      const speed = enemy.speed ?? 40;
      updatedEnemy.x += speed * (updatedEnemy.direction ?? 1) * dt;

      if (enemy.patrolStart !== undefined && enemy.patrolEnd !== undefined) {
        if (updatedEnemy.x <= enemy.patrolStart) {
          updatedEnemy.x = enemy.patrolStart;
          updatedEnemy.direction = 1;
        } else if (updatedEnemy.x + enemy.width >= enemy.patrolEnd) {
          updatedEnemy.x = enemy.patrolEnd - enemy.width;
          updatedEnemy.direction = -1;
        }
      }
      // Mirror velocityX so rendering knows which way to face
      updatedEnemy.velocityX = speed * (updatedEnemy.direction ?? 1);
      break;
    }

    case 'hover': {
      if (enemy.hoverOffset !== undefined) {
        const time = Date.now() / 1000;
        updatedEnemy.y = enemy.y + Math.sin(time * 2) * enemy.hoverOffset;
      }
      break;
    }

    case 'chase': {
      const distanceToPlayer = playerX - enemy.x;
      if (Math.abs(distanceToPlayer) < 300) {
        updatedEnemy.direction = distanceToPlayer > 0 ? 1 : -1;
        const speed = enemy.speed ?? 60;
        updatedEnemy.x += speed * (updatedEnemy.direction ?? 1) * dt;
        updatedEnemy.velocityX = speed * (updatedEnemy.direction ?? 1);
      } else {
        updatedEnemy.velocityX = 0;
      }
      break;
    }

    case 'lockon': {
      const droneDistance = Math.abs(playerX - enemy.x);
      const speed = enemy.speed ?? 70;
      if (droneDistance < 250) {
        updatedEnemy.isLockedOn = true;
        if (droneDistance < 200) {
          updatedEnemy.direction = playerX > enemy.x ? 1 : -1;
          updatedEnemy.x += speed * (updatedEnemy.direction ?? 1) * dt * 0.5;
          updatedEnemy.velocityX = speed * (updatedEnemy.direction ?? 1) * 0.5;
        }
      } else {
        updatedEnemy.isLockedOn = false;
        updatedEnemy.velocityX = 0;
      }
      break;
    }
  }

  return updatedEnemy;
}

export function checkEnemyCollision(
  player: Player,
  enemy: Enemy
): { type: 'damage' | null } {
  if (enemy.isDefeated) return { type: null };

  // Collision tolerance (inset on each side). Smaller now than before
  // because the sprites themselves got tighter hitboxes after the
  // cropping pass — we don't need as much forgiveness padding because
  // the box no longer contains invisible dead space.
  const COLLISION_TOLERANCE = 6; // px inset on each side

  const playerLeft = player.position.x + COLLISION_TOLERANCE;
  const playerRight = player.position.x + player.width - COLLISION_TOLERANCE;
  const playerTop = player.position.y + COLLISION_TOLERANCE;
  const playerBottom = player.position.y + player.height - COLLISION_TOLERANCE;

  const enemyLeft = enemy.x + COLLISION_TOLERANCE;
  const enemyRight = enemy.x + enemy.width - COLLISION_TOLERANCE;
  const enemyTop = enemy.y + COLLISION_TOLERANCE;
  const enemyBottom = enemy.y + enemy.height - COLLISION_TOLERANCE;

  const isOverlapping =
    playerRight > enemyLeft &&
    playerLeft < enemyRight &&
    playerBottom > enemyTop &&
    playerTop < enemyBottom;

  if (!isOverlapping) return { type: null };

  // For this game mode we treat ANY overlap as damage.
  return { type: 'damage' };
}

export function checkHazardCollision(
  player: Player,
  hazard: { x: number; y: number; width: number; height: number }
): boolean {
  const playerLeft = player.position.x;
  const playerRight = player.position.x + player.width;
  const playerTop = player.position.y;
  const playerBottom = player.position.y + player.height;

  const hazardLeft = hazard.x;
  const hazardRight = hazard.x + hazard.width;
  const hazardTop = hazard.y;
  const hazardBottom = hazard.y + hazard.height;

  return (
    playerRight > hazardLeft &&
    playerLeft < hazardRight &&
    playerBottom > hazardTop &&
    playerTop < hazardBottom
  );
}