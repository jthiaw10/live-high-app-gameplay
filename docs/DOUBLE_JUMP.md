# Double Jump Mechanic

## Overview
Blaze can now perform a double jump: one jump on the ground and one additional jump while in mid-air.

## Behavior

### Jump Allowance
- **Ground Jump**: First jump when standing on a platform
- **Air Jump**: Second jump available while airborne
- **Total**: 2 jumps maximum before needing to land

### Jump Consumption
- Each jump press consumes 1 jump from `jumpsRemaining`
- Starts with 2 jumps available
- Decrements to 1 after first jump
- Decrements to 0 after second jump
- Cannot jump when `jumpsRemaining === 0`

### Jump Reset
Jumps are restored to 2 when:
- Landing on any platform
- Respawning after falling off screen
- Restarting level after enemy/hazard contact

### Variable Jump Height
- Works with both ground and air jumps
- Hold jump button longer → higher jump
- Release jump button early → shorter jump
- Same mechanic as before, now works for double jumps

## Controls

**Keyboard:**
- Spacebar, W, or Arrow Up → Jump
- Can press twice for double jump

**Touch:**
- Jump button on right side
- Tap twice for double jump

## Implementation Details

### Player State
Added `jumpsRemaining: number` to Player interface:
- Initialized to `MAX_JUMPS = 2` on game start
- Reset to 2 on landing
- Decremented by 1 on each jump

### Jump Logic
```typescript
if (inputState.current.jump && !prevJumpPressed.current) {
  if (player.jumpsRemaining > 0) {
    player.velocity.y = -PHYSICS.JUMP_POWER;
    player.isGrounded = false;
    player.jumpsRemaining -= 1;
  }
}
```

### Landing Logic
```typescript
if (collision.collided && collision.platform) {
  player.position.y = collision.platform.y - player.height;
  player.velocity.y = 0;
  player.isGrounded = true;
  player.jumpsRemaining = MAX_JUMPS; // Reset to 2
}
```

## Gameplay Impact

**Increased Mobility:**
- Easier to reach high platforms
- Can correct mid-air mistakes
- More forgiving platforming

**Strategic Depth:**
- Decide when to use second jump
- Save air jump for emergencies
- Plan jump sequences to reach distant coins

**Enemy Avoidance:**
- Double jump over patrolling enemies
- Escape from threats in mid-air
- More options for dodging hazards