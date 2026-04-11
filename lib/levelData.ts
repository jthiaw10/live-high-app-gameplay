/**
 * Backwards-compatible facade for the old levelData module.
 * All level content lives in `lib/levels/` now. Existing imports
 * from this file still resolve to level 1.
 */

import { level1 } from './levels/level1';

export const LEVEL_1_WIDTH = level1.widthPx;
export const GROUND_HEIGHT = 500;

export const level1Platforms = level1.platforms;
export const level1Props = level1.props;
export const LEVEL_1_COLLECTIBLES = level1.collectibles;
export const LEVEL_1_WORLD_PROPS = level1.worldProps;
export const level1Enemies = level1.enemies;
export const level1Hazards = level1.hazards;

export { LEVELS, getLevel, isLastLevel } from './levels';
