# Blaze Runner - Development Notes

## Double Jump Mechanic ✅

### Implementation Details
- **Max Jumps**: 2 (one ground jump + one air jump)
- **Same Triggers**: Uses identical input detection as original single jump
- **Edge Detection**: Jump fires on button press (not held)
- **Variable Height**: Release button early to cut jump short (works for both jumps)

### How It Works
1. **First Jump**: Press jump on ground → applies jump velocity, `jumpsRemaining` goes from 2 → 1
2. **Second Jump**: Press jump in mid-air → applies jump velocity again, `jumpsRemaining` goes from 1 → 0
3. **Landing**: Touch any platform → `jumpsRemaining` resets to 2

### Input Handling (Unchanged)
- **Keyboard**: Spacebar, W, or Arrow Up
- **Touch**: Jump button (right side)
- **Edge Detection**: `if (jump && !prevJump)` ensures jump fires once per press
- **Variable Height**: Releasing button multiplies upward velocity by 0.5

### Code Flow
```typescript
// Same edge detection as before
if (inputState.current.jump && !prevJumpPressed.current) {
  // NEW: Check jumps remaining instead of just isGrounded
  if (player.jumpsRemaining > 0) {
    player.velocity.y = PHYSICS.JUMP_POWER;
    player.jumpsRemaining -= 1;
  }
}

// Same variable jump height as before
if (!inputState.current.jump && player.velocity.y < 0) {
  player.velocity.y *= PHYSICS.JUMP_RELEASE_MULTIPLIER;
}

// Reset jumps on landing
if (collision.collided && collision.platform) {
  player.jumpsRemaining = MAX_JUMPS; // Reset to 2
}
```

### Key Points
- ✅ Same responsive feel as single jump
- ✅ No changes to input detection or button handling
- ✅ Works identically for keyboard and touch controls
- ✅ Variable jump height works for both jumps
- ✅ Resets properly on landing and respawn

---

## Combat System
- Touch any enemy/hazard → lose 1 heart + restart level
- Health persists across restarts (3 attempts total)
- No stomp mechanics or invincibility frames

## Enemy Types
- **Crab**: Patrols platforms horizontally
- **Policeman**: Patrols platforms (idle/running sprites)
- **Seagull**: Hovers in place with sine wave
- **Drone**: Lock-on targeting system
- **Fire**: Static environmental hazard

## Level Design
- First platform is enemy-free (safe starting zone)
- Enemies placed on higher platforms for progression
- 12 coins scattered throughout level
- Coins worth 10 EXP each