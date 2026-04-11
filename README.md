# Blaze Runner

A full 2D side-scrolling platformer set in **Jamaica 2420** — a reggae-cyberpunk
future where Blaze dodges JDF drones and police squads to reach each level's
uplink portal. Built on Expo + React Native + TypeScript so it runs on web,
iOS, and Android from the same codebase.

---

## Run it

```bash
npm install
npm run web        # browser (recommended)
npm run ios        # iOS simulator
npm run android    # Android device/emulator
```

The web build is the easiest way to play — open the URL Expo prints and you'll
get a full platformer with sound, menus, multiple levels, and an end-to-end
game loop.

### Controls

| Action        | Keyboard                 | Touch           |
| ------------- | ------------------------ | --------------- |
| Move          | Arrow Keys / `A` `D`     | On-screen pad   |
| Jump          | `Space` / `W` / `↑`      | Jump button     |
| Double jump   | Tap jump again mid-air   | Tap jump again  |
| Variable jump | Hold jump = higher       | Hold jump       |
| Pause         | `Esc` or `P`             | Pause button    |
| Restart level | `R`                      | Pause → Restart |

---

## Game loop

```
Loading → Menu → Level Intro → Gameplay → Level Complete ──┐
                     ▲            │                         │
                     │            ├─ Pause (resume/restart/quit)
                     │            │
                     │            ├─ Die (lose a life, respawn)
                     │            │
                     │            └─ Run out of lives → Game Over
                     │
                     └── All levels cleared → Victory
```

- **3 lives** per run, persistent across levels.
- Touching a JDF cop, crab, drone, seagull, or fire hazard = lose a life.
- Falling off the bottom of the screen = lose a life.
- Touching the **UPLINK** portal at the end of each level = level complete.
- All levels cleared = **Victory** screen with final score.

---

## Architecture

```
a0-project/
├── App.tsx                       ← Root scene state machine
├── config/
│   └── constants.ts              ← GAME_CONFIG + BRAND palette
├── lib/
│   ├── audio.ts                  ← Procedural Web Audio SFX manager
│   ├── physics.ts                ← Gravity, collision, enemy AI
│   ├── levelData.ts              ← Back-compat re-export
│   └── levels/
│       ├── index.ts              ← LEVELS registry + helpers
│       ├── level1.ts             ← Kingston Skyline
│       └── level2.ts             ← Neon Boardwalk
├── screens/
│   ├── LoadingScreen.tsx         ← Boot splash
│   ├── MainMenuScreen.tsx        ← Title + Play/Settings/Credits
│   ├── LevelIntroScreen.tsx      ← Between-level title card
│   ├── GameScreen.tsx            ← Active gameplay engine
│   ├── PauseOverlay.tsx          ← Modal shown over gameplay
│   ├── LevelCompleteOverlay.tsx  ← Modal shown over gameplay
│   ├── GameOverScreen.tsx        ← Out of lives
│   ├── VictoryScreen.tsx         ← All levels cleared
│   ├── SettingsScreen.tsx        ← Audio / SFX / music toggles
│   └── CreditsScreen.tsx
├── components/
│   ├── GameWorld.tsx             ← Renders background, platforms, props, goal
│   ├── PlayerSprite.tsx          ← Idle/run animation
│   ├── GameControls.tsx          ← Touch buttons
│   └── GameHUD.tsx               ← Score, coins, hearts, EXP floaters
├── hooks/
│   └── useGameLoop.ts            ← requestAnimationFrame loop
├── types/
│   └── game.ts                   ← All gameplay type definitions
└── assets/                       ← Sprites, backgrounds, icons
```

### Scene state machine (`App.tsx`)

All cross-level state — current level index, lives remaining, accumulated
score, high score — lives in `App.tsx`. Each scene is a full-screen React
component. `GameScreen` is stateless between runs: the scene manager drives
it by passing `levelIndex`, `livesRemaining`, and callbacks.

### Gameplay engine (`GameScreen.tsx`)

The game loop ticks at `requestAnimationFrame` and runs:

1. Input → horizontal velocity
2. Jump edge detection + variable jump cut
3. Gravity integration
4. Horizontal clamping to level bounds
5. Platform collision resolve
6. Enemy AI tick + collision
7. Hazard collision
8. Coin pickup
9. **Goal overlap → level complete**
10. Camera follow with level-width clamping

Death, pause, and level-complete all freeze the loop by early-returning.

### Audio (`lib/audio.ts`)

The project ships with no audio files, so `AudioManager` synthesizes tiny
chiptune-style SFX via the Web Audio API — jump, coin pickup, hit, death,
level complete, victory, menu click. To swap in real samples later, replace
the `play*` implementations with `new Audio(require('../assets/...'))` or
`expo-av`'s `Sound` API. The manager fails silently on platforms without
Web Audio.

Volume and enable toggles are exposed through the Settings screen.

---

## Adding a new level

1. Create `lib/levels/level3.ts` modeled on `level2.ts`. A level exports a
   `LevelData` object with: `id`, `name`, `tagline`, `widthPx`, `heightPx`,
   `spawn`, `background`, `platforms`, `props`, `worldProps`, `collectibles`,
   `enemies`, `hazards`, and `goal`.
2. Register it in `lib/levels/index.ts`:
   ```ts
   import { level3 } from './level3';
   export const LEVELS: LevelData[] = [level1, level2, level3];
   ```
3. That's it. The scene manager automatically picks it up, shows its intro
   card, and runs it as the next level after level 2.

### Adding a new enemy type

1. Add a case to `EnemyType` and `EnemyBehavior` in `types/game.ts`.
2. Add the AI tick in `lib/physics.ts → updateEnemy`.
3. Add a render branch in `components/GameWorld.tsx → renderEnemy`.
4. Drop instances into any level's `enemies` array.

---

## Brand adaptation

Blaze Runner is an **Afro-futurist reggae-cyberpunk** take on the classic
platformer. The adaptation — palette, enemies, collectibles, UI tone — is
driven by the existing sprite kit:

| Mario archetype     | Blaze Runner equivalent           |
| ------------------- | --------------------------------- |
| Coins               | Hi-fi vinyl records (EXP)         |
| Goombas             | Crabs, JDF policemen              |
| Koopas / flyers     | Drones, seagulls                  |
| Fireballs           | Fire hazards                      |
| Goal flag           | Uplink portal (EXP LOGO badge)    |
| Grass / brick world | Kingston skyline + palm trees     |
| "It's-a me"         | Jah guide, sound system culture   |

The palette — **night purple**, **neon teal**, **sunset orange**, **gold**,
and **reggae red / yellow / green** — is centralized in `config/constants.ts`
(`BRAND`) so every screen stays visually coherent.

---

## What was reused vs. newly built

**Reused from the existing project:**
- All sprites (Blaze standing/run, enemies, props, backgrounds, coin, EXP logo)
- `useGameLoop` hook
- `lib/physics.ts` — gravity, collision, enemy AI
- Level 1 layout
- `GameControls`, `GameHUD`, `PlayerSprite` components
- Touch controls for mobile

**Newly built:**
- `App.tsx` scene state machine (replacing the single-screen stack)
- `config/constants.ts` centralized tuning + brand palette
- `lib/audio.ts` procedural Web Audio SFX manager
- `lib/levels/*` multi-level registry with level 2 (Neon Boardwalk)
- End-of-level goal/portal (data + render + collision)
- `Goal` + `LevelData` types
- Main menu, loading, level intro, pause, level complete, game over,
  victory, settings, credits screens
- Lives/score persistence across levels with respawn loop
- Keyboard pause (`Esc`/`P`) and restart (`R`)
- Parallax background that reads per-level (previously hardcoded)

---

## Known polish opportunities

- Real music + sampled SFX (drop in via the audio manager's `play*` hooks)
- Checkpoint flags within long levels
- Power-ups (speed boost, invuln) to reward coin collection
- More enemy types and a boss at the final level
- Persistent high-score storage via `AsyncStorage` or `localStorage`
- Animated goal portal with particle effects
- Screen-shake on hit and dust particles on landing

---

Built with Expo, React Native, and TypeScript. Jah guide.
