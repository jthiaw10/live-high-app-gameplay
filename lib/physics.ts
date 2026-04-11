import { Player, Platform, Collectible, Enemy, Boss } from '../types/game';

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

      // Horizontal tracking.
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

      // Vertical patrol — bob up and down within patrolTopY..patrolBottomY.
      if (updatedEnemy.patrolTopY !== undefined && updatedEnemy.patrolBottomY !== undefined) {
        const vSpeed = (speed ?? 70) * 0.4;
        const dirY = updatedEnemy.directionY ?? 1;
        updatedEnemy.y += vSpeed * dirY * dt;
        if (updatedEnemy.y <= updatedEnemy.patrolTopY) {
          updatedEnemy.y = updatedEnemy.patrolTopY;
          updatedEnemy.directionY = 1;
        } else if (updatedEnemy.y + enemy.height >= updatedEnemy.patrolBottomY) {
          updatedEnemy.y = updatedEnemy.patrolBottomY - enemy.height;
          updatedEnemy.directionY = -1;
        }
      }

      // Tick shoot cooldown (actual projectile spawning is in GameScreen).
      if (updatedEnemy.shootCooldown !== undefined && updatedEnemy.shootCooldown > 0) {
        updatedEnemy.shootCooldown = Math.max(0, updatedEnemy.shootCooldown - deltaTime);
      }

      break;
    }
  }

  return updatedEnemy;
}

/**
 * Returns 'stomp' if the player is landing on the enemy from above,
 * 'damage' if it's a side/bottom hit, or null if no overlap.
 *
 * Stomp condition: player is falling (vy > 0) AND the player's bottom
 * is in the top fraction of the enemy's height (TOP_FRACTION from
 * config). This matches the classic Mario feel.
 */
export function checkEnemyCollision(
  player: Player,
  enemy: Enemy
): { type: 'stomp' | 'damage' | null } {
  if (enemy.isDefeated) return { type: null };

  const COLLISION_TOLERANCE = 6;

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

  // Stomp check: player is descending AND their feet are near the
  // enemy's head (within the top 35% of the enemy).
  const stompZone = enemyTop + (enemyBottom - enemyTop) * 0.35;
  if (player.velocity.y > 0 && playerBottom <= stompZone) {
    return { type: 'stomp' };
  }

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

/** Tick a moving platform back and forth within its rail. */
export function updateMovingPlatform(p: Platform, dtMs: number): Platform {
  if (p.moveType !== 'moving' || p.moveStart === undefined || p.moveEnd === undefined) {
    return p;
  }
  const dt = dtMs / 1000;
  const speed = p.moveSpeed ?? 60;
  const dir = (p as any)._dir ?? 1;
  let newX = p.x + speed * dir * dt;
  let newDir = dir;
  if (newX <= p.moveStart) {
    newX = p.moveStart;
    newDir = 1;
  } else if (newX + p.width >= p.moveEnd) {
    newX = p.moveEnd - p.width;
    newDir = -1;
  }
  return { ...p, x: newX, _dir: newDir } as any;
}

/** Tick breakable platform timer. Returns updated platform. */
export function updateBreakablePlatform(p: Platform, dtMs: number): Platform {
  if (p.moveType !== 'breakable' || p.broken) return p;
  if (p.breakTimer === undefined || p.breakTimer <= 0) return p;
  const remaining = p.breakTimer - dtMs;
  if (remaining <= 0) {
    return { ...p, broken: true, breakTimer: 0 };
  }
  return { ...p, breakTimer: remaining };
}

/** Simple boss AI state machine. */
export function updateBoss(boss: Boss, playerX: number, dtMs: number): Boss {
  if (boss.phase === 'defeated') return boss;
  const dt = dtMs / 1000;
  let b = { ...boss, phaseTimer: boss.phaseTimer - dtMs };

  switch (boss.phase) {
    case 'idle':
      // Face the player.
      b.direction = playerX > b.x + b.width / 2 ? 1 : -1;
      if (b.phaseTimer <= 0) {
        b.phase = 'charge';
        b.phaseTimer = 1800;
      }
      break;
    case 'charge':
      // Rush toward the player's last known position.
      b.x += b.speed * b.direction * dt;
      // Clamp to arena.
      if (b.x < b.arenaLeft) { b.x = b.arenaLeft; b.direction = 1; }
      if (b.x + b.width > b.arenaRight) { b.x = b.arenaRight - b.width; b.direction = -1; }
      if (b.phaseTimer <= 0) {
        b.phase = 'vulnerable';
        b.phaseTimer = 1600;
      }
      break;
    case 'vulnerable':
      // Stunned, can be hit by projectiles.
      if (b.phaseTimer <= 0) {
        b.phase = 'idle';
        b.phaseTimer = 1200;
      }
      break;
  }

  return b;
}