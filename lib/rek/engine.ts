// Rek Khmer Engine - Compatibility & Main Export
// Pure logic located in /lib/rek-engine/

export * from '@/lib/rek-engine'

// Common backward-compatible aliases
import {
  BOARD_SIZE,
  PlayerColor,
  TacticalPuzzle,
} from '@/lib/rek-engine'

export const SIZE = BOARD_SIZE
export type Player = PlayerColor
export type PuzzleSetup = TacticalPuzzle
