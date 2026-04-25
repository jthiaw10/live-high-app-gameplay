/**
 * Level 1 — "Kingston Uplink"
 *
 * The full Blaze Runner adventure as a single long level. Combines
 * what used to be the separate "Kingston Skyline" and "Neon Boardwalk"
 * into one continuous run so the player gets a sustained arc without
 * the level-complete interruption in the middle.
 *
 * Design principles for this pass:
 *  - Mostly continuous ground. Only TWO actual death pits in the
 *    entire level, both short and both with clear visual telegraph.
 *    Everything else is elevation challenge, not fall-off-the-map.
 *  - Wide platforms. Landing zones are 250-320 px wide so the
 *    player doesn't fall off the edge after a well-executed jump.
 *  - Small, fair fires. The new fire hazard is 44×56 (was 64×82)
 *    and placed with gaps you can walk through without damage.
 *  - Coins paced so the 10th coin sits around the 40% mark of the
 *    level, which is where the fire-shot superpower unlocks. The
 *    power then feeds into the second half which has more enemies.
 *
 * Pacing chart (left to right):
 *   [  0 .. 1200] OPENER            Safe walk, first coins, first jump
 *   [1200 .. 1400] GAP 1             Small easy gap, no hazards below
 *   [1400 .. 2600] CRAB + STAIRS     First enemy, vertical teaching
 *   [2600 .. 3800] HAZARD GARDEN     Small fires, first police patrol
 *   [3800 .. 4600] POWER APPROACH    Coin run up to the 10th coin
 *   [4600 .. 5600] DRONE CORRIDOR    Use the power on flying enemies
 *   [5600 .. 5800] GAP 2             Second (and final) death pit
 *   [5800 .. 6700] VICTORY RUN       Final stretch + UPLINK goal
 *
 * Jump math (for reference): single-jump max rise ≈ 152 px, single
 * jump horizontal reach ≈ 260 px. All gaps and platform heights
 * below are within these.
 */

import { LevelData } from '../../types/game';
import { GAME_CONFIG, ENTITY_SIZE } from '../../config/constants';

const GROUND_Y = GAME_CONFIG.GROUND_Y;
const LEVEL_WIDTH = 11000;

const { crab, seagull, drone, policeman, fire, coin, goal } = ENTITY_SIZE;

// "feet on platform P" helper — entity sits with bottom on the given Y.
const on = (platformTopY: number, entityHeight: number) =>
  platformTopY - entityHeight;

export const level1: LevelData = {
  id: 'level-1',
  name: 'Kingston Uplink',
  tagline: 'One long run from the streets to the rooftop sound system.',
  widthPx: LEVEL_WIDTH,
  heightPx: 600,
  spawn: { x: 120, y: GROUND_Y - GAME_CONFIG.PLAYER_HEIGHT },
  background: require('../../assets/Copy of LEVEL 1 BACKGROUND.png'),

  // ----------------------------------------------------------------------
  // Platforms — continuous ground with elevated platforms stacked on top.
  // ----------------------------------------------------------------------
  platforms: [
    // ===== [0 .. 1179] OPENER ==========================================
    // Ground ends at 1179 where pothole 1's dark region begins.
    { x: 0, y: GROUND_Y, width: 1179, height: 50 },
    // Low teaching platform for the first jump (70 px rise).
    { x: 600, y: GROUND_Y - 80, width: 280, height: 26 },

    // ===== [1179 .. 1421] POTHOLE 1 (243 px pit) =======================
    // Aligned to the dark pixels in Road with pothole.png
    // (tile placed at x=785, dark region at tile-relative 394–636).

    // ===== [1421 .. 2600] CRAB + STAIRS ================================
    { x: 1421, y: GROUND_Y, width: 1179, height: 50 },
    // Rising staircase. Step heights tuned so a jump from the top
    // step doesn't clip the top of the viewport (apex from y=300 is
    // y=−2, just inside the world height of 710).
    { x: 1700, y: GROUND_Y - 90,  width: 260, height: 26 },
    { x: 2020, y: GROUND_Y - 150, width: 260, height: 26 },
    { x: 2330, y: GROUND_Y - 200, width: 260, height: 26 },

    // ===== [2600 .. 3800] HAZARD GARDEN ================================
    // Continuous ground — no pits in the hazard section. Fires are
    // just something to jump OVER, not fall past.
    { x: 2600, y: GROUND_Y, width: 1200, height: 50 },
    // Upper ledge bypass route for the whole hazard garden.
    { x: 2800, y: GROUND_Y - 150, width: 280, height: 26 },
    { x: 3180, y: GROUND_Y - 150, width: 280, height: 26 },
    { x: 3560, y: GROUND_Y - 150, width: 240, height: 26 },

    // ===== [3800 .. 4600] POWER APPROACH ===============================
    // Long flat stretch with a heavy coin run so the player hits the
    // 10-coin power threshold on the ground.
    { x: 3800, y: GROUND_Y, width: 800, height: 50 },

    // ===== [4600 .. 5579] DRONE CORRIDOR ================================
    // Ground ends at 5579 where pothole 2's dark region begins.
    { x: 4600, y: GROUND_Y, width: 979, height: 50 },
    // Low cover platforms you can run under OR jump on for height.
    { x: 4780, y: GROUND_Y - 90, width: 220, height: 26 },
    { x: 5120, y: GROUND_Y - 90, width: 220, height: 26 },
    { x: 5400, y: GROUND_Y - 90, width: 180, height: 26 },

    // ===== [5579 .. 5821] POTHOLE 2 (243 px pit) =======================
    // Tile at x=5185, dark region at tile-relative 394–636.

    // ===== [5821 .. 6800] TRANSITION ZONE ==============================
    { x: 5821, y: GROUND_Y, width: 979, height: 50 },
    { x: 6100, y: GROUND_Y - 120, width: 280, height: 26 },
    { x: 6450, y: GROUND_Y - 120, width: 280, height: 26 },

    // ===== [6800 .. 8200] ROOFTOP CLIMB ================================
    // Vertical platforming section with moving and breakable platforms.
    { x: 6800, y: GROUND_Y, width: 600, height: 50 },
    // Moving platforms — slide left/right on a rail.
    { x: 7100, y: GROUND_Y - 120, width: 200, height: 26,
      moveType: 'moving' as const, moveStart: 7000, moveEnd: 7500, moveSpeed: 80 },
    { x: 7350, y: GROUND_Y - 220, width: 200, height: 26,
      moveType: 'moving' as const, moveStart: 7200, moveEnd: 7700, moveSpeed: 90 },
    // Breakable block — crumbles after landing
    { x: 7600, y: GROUND_Y - 140, width: 180, height: 26,
      moveType: 'breakable' as const },
    { x: 7400, y: GROUND_Y, width: 800, height: 50 },
    // More moving platforms for height
    { x: 7850, y: GROUND_Y - 180, width: 200, height: 26,
      moveType: 'moving' as const, moveStart: 7750, moveEnd: 8250, moveSpeed: 70 },
    { x: 8200, y: GROUND_Y, width: 600, height: 50 },

    // ===== [8200 .. 9400] GAUNTLET =====================================
    // Dense enemy section with mixed obstacles.
    { x: 8200, y: GROUND_Y, width: 1200, height: 50 },
    { x: 8500, y: GROUND_Y - 100, width: 260, height: 26 },
    { x: 8800, y: GROUND_Y - 160, width: 260, height: 26 },
    // Breakable block over a gap
    { x: 9050, y: GROUND_Y - 100, width: 160, height: 26,
      moveType: 'breakable' as const },
    { x: 9200, y: GROUND_Y - 150, width: 220, height: 26,
      moveType: 'moving' as const, moveStart: 9100, moveEnd: 9500, moveSpeed: 100 },

    // ===== [9400 .. 10000] FINAL APPROACH ==============================
    { x: 9400, y: GROUND_Y, width: 600, height: 50 },
    { x: 9700, y: GROUND_Y - 130, width: 200, height: 26 },
    { x: 9900, y: GROUND_Y - 130, width: 200, height: 26 },

    // ===== [10000 .. 11000] BOSS ARENA =================================
    { x: 10000, y: GROUND_Y, width: 1000, height: 50 },
  ],

  // Props and world props cleared for now — the animated road ground
  // and the background image carry the visual weight.
  props: [],
  worldProps: [],

  // ----------------------------------------------------------------------
  // Collectibles — 24 coins total. The 10th coin sits in the POWER
  // APPROACH section so the superpower unlocks around the level's
  // 4000 px mark (about 58% through by distance), with most enemies
  // after that point so the player has something to shoot at.
  // ----------------------------------------------------------------------
  collectibles: [
    // Opener (coins 1-3)
    { id: 'c1',  x: 260, y: GROUND_Y - 80,  width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c2',  x: 380, y: GROUND_Y - 80,  width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c3',  x: 700, y: GROUND_Y - 130, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Gap arc reward (coin 4)
    { id: 'c4',  x: 1290, y: GROUND_Y - 170, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Stair climb (coins 5-7) — sit on top of each lowered step
    { id: 'c5',  x: 1780, y: GROUND_Y - 140, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c6',  x: 2100, y: GROUND_Y - 200, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c7',  x: 2410, y: GROUND_Y - 250, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Hazard garden ground coins (coins 8-9)
    { id: 'c8',  x: 2900, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c9',  x: 3240, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // THE POWER COIN — coin 10 unlocks the fire-shot superpower.
    // Placed at the start of the "power approach" section so it
    // feels like a gate opening rather than a random pickup.
    { id: 'c10', x: 3880, y: GROUND_Y - 100, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Power approach coin run (coins 11-14)
    { id: 'c11', x: 4020, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c12', x: 4160, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c13', x: 4300, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c14', x: 4440, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Drone corridor low cover coins (coins 15-17)
    { id: 'c15', x: 4840, y: GROUND_Y - 140, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c16', x: 5180, y: GROUND_Y - 140, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c17', x: 5460, y: GROUND_Y - 140, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Drone corridor mid-air coins (coins 18-19)
    { id: 'c18', x: 4980, y: GROUND_Y - 260, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c19', x: 5300, y: GROUND_Y - 260, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Gap 2 arc coin (coin 20)
    { id: 'c20', x: 5700, y: GROUND_Y - 170, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Transition zone (coins 21-24)
    { id: 'c21', x: 5900, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c22', x: 6180, y: GROUND_Y - 170, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c23', x: 6530, y: GROUND_Y - 170, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c24', x: 6720, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Rooftop climb (coins 25-28)
    { id: 'c25', x: 6900, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c26', x: 7200, y: GROUND_Y - 180, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c27', x: 7500, y: GROUND_Y - 280, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c28', x: 7900, y: GROUND_Y - 240, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Gauntlet (coins 29-33)
    { id: 'c29', x: 8350, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c30', x: 8600, y: GROUND_Y - 150, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c31', x: 8900, y: GROUND_Y - 210, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c32', x: 9150, y: GROUND_Y - 150, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c33', x: 9350, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },

    // Final approach (coins 34-36)
    { id: 'c34', x: 9550, y: GROUND_Y - 80, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c35', x: 9750, y: GROUND_Y - 180, width: coin.w, height: coin.h, collected: false, type: 'coin' },
    { id: 'c36', x: 9950, y: GROUND_Y - 180, width: coin.w, height: coin.h, collected: false, type: 'coin' },
  ],

  // ----------------------------------------------------------------------
  // Enemies — mostly back-loaded so the power becomes the reward for
  // reaching the 10-coin threshold. Pre-power: 1 crab, 1 policeman.
  // Post-power: 1 crab, 3 policemen, 3 drones. That's 9 enemies total
  // in a 6800 px level — generous breathing room between threats.
  // ----------------------------------------------------------------------
  enemies: [
    // --- Pre-power threats ---
    {
      id: 'crab-1',
      type: 'crab',
      x: 1750, y: on(GROUND_Y, crab.h),
      width: crab.w, height: crab.h,
      velocityX: 55, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 1640, patrolEnd: 1960,
      speed: 55, direction: 1,
    },
    {
      id: 'police-1',
      type: 'policeman',
      x: 3020, y: on(GROUND_Y, policeman.h),
      width: policeman.w, height: policeman.h,
      velocityX: 55, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 2860, patrolEnd: 3400,
      speed: 55, direction: 1,
      idleSprite: require('../../assets/Copy of POLICEMAN 2.png'),
      movingSprite: require('../../assets/Copy of POLICEMAN.png'),
    },

    // --- Post-power threats (fire-shot recommended) ---
    {
      id: 'crab-2',
      type: 'crab',
      x: 4860, y: on(GROUND_Y, crab.h),
      width: crab.w, height: crab.h,
      velocityX: 60, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 4720, patrolEnd: 5080,
      speed: 60, direction: 1,
    },
    {
      id: 'police-2',
      type: 'policeman',
      x: 5280, y: on(GROUND_Y, policeman.h),
      width: policeman.w, height: policeman.h,
      velocityX: 60, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 5080, patrolEnd: 5560,
      speed: 60, direction: -1,
      idleSprite: require('../../assets/Copy of POLICEMAN 2.png'),
      movingSprite: require('../../assets/Copy of POLICEMAN.png'),
    },
    // Drone gauntlet — three drones stacked horizontally in the
    // corridor. They use the lockon behavior so the player has a
    // ~300 px warning before each one closes in.
    // Drones positioned so that the player's arm-line at jump apex
    // (world y ≈ 261 from ground) lands inside the drone hitbox.
    // That makes them reliably shootable with a well-timed jump+fire.
    {
      id: 'drone-1',
      type: 'drone',
      x: 4850, y: GROUND_Y - 250,
      width: drone.w, height: drone.h,
      velocityX: 0, velocityY: 0,
      health: 1,
      behavior: 'lockon',
      detectionRange: 320,
      speed: 80,
      isLockedOn: false,
      patrolTopY: GROUND_Y - 320,
      patrolBottomY: GROUND_Y - 100,
      directionY: 1,
      shootCooldown: 1200,
    },
    {
      id: 'drone-2',
      type: 'drone',
      x: 5200, y: GROUND_Y - 260,
      width: drone.w, height: drone.h,
      velocityX: 0, velocityY: 0,
      health: 1,
      behavior: 'lockon',
      detectionRange: 320,
      speed: 80,
      isLockedOn: false,
      patrolTopY: GROUND_Y - 340,
      patrolBottomY: GROUND_Y - 120,
      directionY: -1,
      shootCooldown: 800,
    },
    {
      id: 'drone-3',
      type: 'drone',
      x: 5520, y: GROUND_Y - 250,
      width: drone.w, height: drone.h,
      velocityX: 0, velocityY: 0,
      health: 1,
      behavior: 'lockon',
      detectionRange: 320,
      speed: 80,
      isLockedOn: false,
      patrolTopY: GROUND_Y - 300,
      patrolBottomY: GROUND_Y - 80,
      directionY: 1,
      shootCooldown: 1600,
    },

    // Transition zone patrol
    {
      id: 'police-3',
      type: 'policeman',
      x: 6280, y: on(GROUND_Y, policeman.h),
      width: policeman.w, height: policeman.h,
      velocityX: 60, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 6120, patrolEnd: 6600,
      speed: 60, direction: 1,
      idleSprite: require('../../assets/Copy of POLICEMAN 2.png'),
      movingSprite: require('../../assets/Copy of POLICEMAN.png'),
    },

    // --- ROOFTOP CLIMB enemies ---
    {
      id: 'crab-3',
      type: 'crab',
      x: 7000, y: on(GROUND_Y, crab.h),
      width: crab.w, height: crab.h,
      velocityX: 65, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 6850, patrolEnd: 7350,
      speed: 65, direction: 1,
    },
    {
      id: 'drone-4',
      type: 'drone',
      x: 7600, y: GROUND_Y - 260,
      width: drone.w, height: drone.h,
      velocityX: 0, velocityY: 0,
      health: 1,
      behavior: 'lockon',
      detectionRange: 320,
      speed: 85,
      isLockedOn: false,
      patrolTopY: GROUND_Y - 320,
      patrolBottomY: GROUND_Y - 100,
      directionY: -1,
      shootCooldown: 1400,
    },

    // --- GAUNTLET enemies ---
    {
      id: 'crab-4',
      type: 'crab',
      x: 8400, y: on(GROUND_Y, crab.h),
      width: crab.w, height: crab.h,
      velocityX: 70, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 8250, patrolEnd: 8600,
      speed: 70, direction: -1,
    },
    {
      id: 'police-4',
      type: 'policeman',
      x: 8800, y: on(GROUND_Y, policeman.h),
      width: policeman.w, height: policeman.h,
      velocityX: 65, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 8650, patrolEnd: 9050,
      speed: 65, direction: 1,
      idleSprite: require('../../assets/Copy of POLICEMAN 2.png'),
      movingSprite: require('../../assets/Copy of POLICEMAN.png'),
    },
    {
      id: 'drone-5',
      type: 'drone',
      x: 9100, y: GROUND_Y - 250,
      width: drone.w, height: drone.h,
      velocityX: 0, velocityY: 0,
      health: 1,
      behavior: 'lockon',
      detectionRange: 320,
      speed: 90,
      isLockedOn: false,
      patrolTopY: GROUND_Y - 330,
      patrolBottomY: GROUND_Y - 90,
      directionY: 1,
      shootCooldown: 1000,
    },
    {
      id: 'crab-5',
      type: 'crab',
      x: 9300, y: on(GROUND_Y, crab.h),
      width: crab.w, height: crab.h,
      velocityX: 75, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 9200, patrolEnd: 9550,
      speed: 75, direction: 1,
    },

    // --- FINAL APPROACH ---
    {
      id: 'police-5',
      type: 'policeman',
      x: 9600, y: on(GROUND_Y, policeman.h),
      width: policeman.w, height: policeman.h,
      velocityX: 70, velocityY: 0,
      health: 1,
      behavior: 'patrol',
      patrolStart: 9450, patrolEnd: 9850,
      speed: 70, direction: -1,
      idleSprite: require('../../assets/Copy of POLICEMAN 2.png'),
      movingSprite: require('../../assets/Copy of POLICEMAN.png'),
    },
  ],

  // ----------------------------------------------------------------------
  // Hazards — small, sparse, always jumpable. The upper-ledge route
  // through the hazard garden lets you skip most of them entirely if
  // you climbed the staircase earlier.
  // ----------------------------------------------------------------------
  hazards: [],

  // ----------------------------------------------------------------------
  // Checkpoints — mid-level respawn flags. Touching one saves that
  // position so dying doesn't restart from x=0.
  // ----------------------------------------------------------------------
  checkpoints: [
    { id: 'cp-1', x: 2500, y: GROUND_Y - 120, width: 40, height: 120, activated: false },
    { id: 'cp-2', x: 4500, y: GROUND_Y - 120, width: 40, height: 120, activated: false },
    { id: 'cp-3', x: 7200, y: GROUND_Y - 120, width: 40, height: 120, activated: false },
    { id: 'cp-4', x: 9400, y: GROUND_Y - 120, width: 40, height: 120, activated: false },
  ],

  // ----------------------------------------------------------------------
  // Speed boosts — temporary 1.55x speed pickups before long stretches.
  // ----------------------------------------------------------------------
  speedBoosts: [
    { id: 'sb-1', x: 3850, y: GROUND_Y - 60, width: 44, height: 44, collected: false },
    { id: 'sb-2', x: 7800, y: GROUND_Y - 60, width: 44, height: 44, collected: false },
  ],

  // ----------------------------------------------------------------------
  // Boss — guards the UPLINK portal at the end.
  // Charges at the player, then goes vulnerable for fire-shots.
  // Takes 5 hits to defeat.
  // ----------------------------------------------------------------------
  boss: {
    id: 'boss-1',
    x: 10400,
    y: GROUND_Y - 140,
    width: 120,
    height: 140,
    health: 5,
    maxHealth: 5,
    phase: 'idle',
    phaseTimer: 1200,
    direction: -1,
    speed: 420,
    arenaLeft: 10000,
    arenaRight: 10800,
  },

  // ----------------------------------------------------------------------
  // Uplink portal — past the boss arena.
  // ----------------------------------------------------------------------
  goal: {
    id: 'l1-goal',
    x: 10900,
    y: GROUND_Y - goal.h,
    width: goal.w,
    height: goal.h,
    label: 'UPLINK',
  },
};
