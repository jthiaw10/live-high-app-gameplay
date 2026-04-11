# Blaze Runner - Project Context

## What This Is

A 2D side-scrolling platformer game built with **React Native + Expo + TypeScript**. Set in a futuristic Jamaica 2420 with an afro-futurist reggae-cyberpunk aesthetic. The player character is "Blaze" who runs, jumps, collects coins, and unlocks a fire-shot superpower.

Originally built on **Expo Snack**, now running locally. The project uses Expo SDK 52.

## How to Run

- **Web (quickest):** `npm run web` — opens in browser
- **Expo Go (mobile):** `npm start` — scan QR from Expo Go app on iPhone (same Wi-Fi)
- **iOS Simulator:** Requires full Xcode installed and `xcode-select` pointed correctly, then `npm run ios`

## Architecture

**Scene state machine** in `App.tsx` — no navigation stack. Scene flow:
`loading → menu → intro → game → (victory | gameOver) → menu`

Key directories:
- `screens/` — Full-screen scene components (GameScreen is the main engine at ~1336 lines)
- `components/` — GameWorld (renders level), PlayerSprite, GameHUD, GameControls
- `lib/` — Physics engine (`physics.ts`), procedural audio (`audio.ts`), level data (`levels/`)
- `config/constants.ts` — Central tuning: sizes, physics values, colors, sprite aspect ratios
- `hooks/useGameLoop.ts` — requestAnimationFrame loop with delta-time capping
- `types/game.ts` — All entity type definitions

## Game Loop (per frame in GameScreen)

1. Input processing (keyboard + touch)
2. Jump logic (coyote time 120ms, jump buffer 140ms)
3. Fire-shot spawning
4. Gravity (dual: lighter rising, heavier falling)
5. Position update
6. Collision detection (platforms, collectibles, enemies, hazards, projectiles)
7. Entity AI updates (patrol/hover/chase/lockon)
8. Camera smooth-follow
9. Render at scale (world units 710px tall → screen pixels)

## Enemies & Mechanics

- **Crab**: Ground patrol, stompable
- **Seagull**: Hover (sine wave), stompable
- **Drone**: Lock-on targeting, stompable
- **Policeman**: Patrol/chase, **instant death on contact** (full level restart)
- **Fire hazards**: 1 damage + knockback
- **Coins**: 10 EXP each; 10th coin unlocks fire-shot superpower with "Power Up" ceremony

## Level Design

Single level: "Kingston Uplink" — 6800px wide. Defined declaratively in `lib/levels/level1.ts`. Ground rendered with `Road.png` and `Road with pothole.png` tiled along the bottom.

## Assets

All game sprites are in `assets/`. Originally these were Supabase URL placeholders from Expo Snack export — they have been downloaded and converted to real PNG/GIF files. Backups of the originals are in `assets/.broken_backup/`.

Key sprite files:
- Player: `BLAZE STANDING.png`, `BLAZELOOP 1 Running.png`, `BLAZELOOP RUN 2.png`, `BLAZELOOP JUMPING.png`, `BLAZELOOP FLAMETHROW.png`, `BLAZELOOP FLAME CHALACE.png`
- Background: `Backgroun Loop.png` (looped), `Copy of LEVEL 1 BACKGROUND.png`
- Ground: `Road.png`, `Road with pothole.png` (never mirror horizontally)

**Important:** Do not horizontally mirror road images — it breaks the visual coherence. Road images should always have their bottom edge pinned to the bottom of the screen.

## Audio

Procedurally generated chiptune SFX via Web Audio API — no audio files needed. Managed by `lib/audio.ts` singleton.

## Design Decisions from Development

- Single continuous level preferred over multiple short levels
- Player should run on the "ground" visible in the background image
- Background image should not be zoomed in — top and bottom should be visible
- Potholes shown as visual indicators for gaps/holes
- EXP LOGO feedback only shows when killing enemies, not when collecting coins (coins show +10 only)
- Running animation alternates between two frames at a moderate speed (not too fast)
- Platforms have subtle side-to-side movement and glow effect underneath
- Power-up moment is a ceremony with the `Power Up.png` image
