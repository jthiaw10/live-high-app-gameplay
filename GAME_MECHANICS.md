# Blaze Runner - Game Mechanics

## Core Gameplay Loop
- 2D side-scrolling platformer set in Jamaica 2420
- Collect coins, avoid/defeat enemies, navigate platforms
- Arcade-style physics with responsive controls

## Player Controls
**Keyboard:**
- Arrow Keys / WASD: Move left/right
- Spacebar / W / Arrow Up: Jump (hold for higher jump)

**Touch:**
- Left/Right buttons: Move
- Jump button: Jump (hold for higher jump)

## Combat System

### Enemy Types

**Ground Enemies (Lethal):**
1. **Crab** - Patrols platforms horizontally
   - Contact: **-1 health + instant level restart**
   - Cannot be stomped
   - Confined to specific platforms

2. **Policeman** - Patrols platforms horizontally
   - Contact: **-1 health + instant level restart**
   - Cannot be stomped
   - Idle sprite when stationary, running sprite when moving
   - Confined to specific platforms

**Flying Enemies (Stompable):**
3. **Seagull** - Hovers in place with vertical sine wave motion
   - Stomp from above: Defeat enemy
   - Side/bottom contact: -1 health + knockback + invincibility frames

4. **Drone** - Lock-on behavior with targeting reticle
   - Shows LOCKON.gif when player within 250px
   - Stomp from above: Defeat enemy
   - Side/bottom contact: -1 health + knockback + invincibility frames

### Hazards
**Fire** - Static environmental hazard
- Contact: -1 health + knockback + invincibility frames
- Cannot be defeated

## Health System
- Start with 3 hearts
- Lose hearts from:
  - Crab/Policeman contact: -1 heart + level restart
  - Flying enemy side contact: -1 heart + knockback
  - Fire hazard: -1 heart + knockback
- When health reaches 0: Full level restart with 3 hearts
- Invincibility frames (1.5s) after taking damage from flying enemies/hazards
- **No invincibility frames for crab/policeman** (instant restart)

## Level Restart Behavior

**Crab/Policeman Contact:**
1. Lose 1 health heart
2. Instant level restart:
   - Player position → start (100, 200)
   - All coins → reset to uncollected
   - All enemies → reset to starting positions
   - Coins/EXP → reset to 0
   - Camera → reset to start
3. Health carries over (unless it reached 0, then reset to 3)

**Death (0 Health):**
- Same as above, but health resets to 3 hearts

## Progression
- Collect coins for EXP (10 EXP per coin)
- 12 coins total in Level 1
- Floating "+10 EXP" feedback on collection
- HUD displays: Coins collected, Total EXP, Health hearts

## Level Design
- Handcrafted platforms with rounded corners
- Parallax scrolling background (30% speed)
- Environmental props: Palm trees, bushes, vinyl records, weed leaves, trash cans
- Interactive trash cans bounce when player is nearby

## Physics
- Constant gravity
- Variable jump height (hold vs tap)
- Forgiving platform collision (20px tolerance)
- Responsive horizontal movement
- Knockback on damage from flying enemies/hazards