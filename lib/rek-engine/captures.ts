// Capture calculations for Rek Khmer: Rek (Gánh) and Poat (Bao Vây)
// Based on /SPEC_ENGINE_CO_REK_KHMER.md and /HUONG_DAN_LUAT_CO_REK_KHMER.md

import {
  BOARD_SIZE,
  Cell,
  PlayerColor,
  Direction,
} from './types'

export const DIRS: Direction[] = [
  { dr: -1, dc: 0 }, // North (Up)
  { dr: 1, dc: 0 },  // South (Down)
  { dr: 0, dc: -1 }, // West (Left)
  { dr: 0, dc: 1 },  // East (Right)
]

export const rc = (index: number) => ({
  row: Math.floor(index / BOARD_SIZE),
  col: index % BOARD_SIZE,
})

export const idx = (row: number, col: number) => row * BOARD_SIZE + col

export const inBounds = (row: number, col: number) =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE

export const opponent = (p: PlayerColor): PlayerColor =>
  p === 'you' ? 'opp' : 'you'

/**
 * Check Rek (Gánh) captures resulting from moving to `landPos`
 * - Gánh ngang (Horizontal): Enemy to left AND enemy to right
 * - Gánh dọc (Vertical): Enemy to north AND enemy to south
 * - Gánh 4 (Rek Boun / Rek Troat): Both horizontal and vertical simultaneously
 */
export function checkRekCaptures(
  board: Cell[],
  landPos: number,
  moverPlayer: PlayerColor
): number[] {
  const { row, col } = rc(landPos)
  const opp = opponent(moverPlayer)
  const victims = new Set<number>()

  // 1. Horizontal Rek (East - West)
  if (inBounds(row, col - 1) && inBounds(row, col + 1)) {
    const leftCell = board[idx(row, col - 1)]
    const rightCell = board[idx(row, col + 1)]
    if (leftCell?.player === opp && rightCell?.player === opp) {
      victims.add(idx(row, col - 1))
      victims.add(idx(row, col + 1))
    }
  }

  // 2. Vertical Rek (North - South)
  if (inBounds(row - 1, col) && inBounds(row + 1, col)) {
    const northCell = board[idx(row - 1, col)]
    const southCell = board[idx(row + 1, col)]
    if (northCell?.player === opp && southCell?.player === opp) {
      victims.add(idx(row - 1, col))
      victims.add(idx(row + 1, col))
    }
  }

  return Array.from(victims)
}

/**
 * Check Poat (Bao Vây / Encirclement) captures via Flood-Fill algorithm.
 * Evaluates connected component of opponent pieces.
 * If an entire connected component has 0 liberties (free adjacent squares), it is captured.
 */
export function checkPoatCaptures(
  board: Cell[],
  oppPlayer: PlayerColor
): number[] {
  const visited = new Uint8Array(BOARD_SIZE * BOARD_SIZE)
  const captured: number[] = []

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const piece = board[i]
    if (!piece || piece.player !== oppPlayer || visited[i]) continue

    // Find connected component using BFS
    const group: number[] = []
    const queue: number[] = [i]
    visited[i] = 1
    let liberties = 0

    while (queue.length > 0) {
      const cur = queue.shift()!
      group.push(cur)
      const { row, col } = rc(cur)

      for (const { dr, dc } of DIRS) {
        const nr = row + dr
        const nc = col + dc
        if (!inBounds(nr, nc)) continue

        const neighborIdx = idx(nr, nc)
        const neighbor = board[neighborIdx]

        if (neighbor === null) {
          liberties++
        } else if (neighbor.player === oppPlayer && !visited[neighborIdx]) {
          visited[neighborIdx] = 1
          queue.push(neighborIdx)
        }
      }
    }

    // 0 liberties means the whole group is trapped and captured
    if (liberties === 0) {
      captured.push(...group)
    }
  }

  return captured
}
