/**
 * Level registry.
 *
 * The game ships with a single long level — "Kingston Uplink" — that
 * carries the player through the entire Blaze Runner world in one
 * continuous run. If you ever want to split it back into chapters
 * just add more entries to this array and the scene manager will
 * automatically sequence them.
 */

import { LevelData } from '../../types/game';
import { level1 } from './level1';

export const LEVELS: LevelData[] = [level1];

export function getLevel(index: number): LevelData {
  const safe = Math.max(0, Math.min(index, LEVELS.length - 1));
  return LEVELS[safe];
}

export function isLastLevel(index: number): boolean {
  return index >= LEVELS.length - 1;
}
