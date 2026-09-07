import type { CanonicalGameState } from '../lib/rek-engine'

function sortedPositionCounts(
  counts: CanonicalGameState['positionCounts'],
): [string, number][] {
  return Object.entries(counts ?? {}).sort(([a], [b]) => a.localeCompare(b))
}

/**
 * Replay logs are trusted only when rebuilding them reproduces the same
 * rule-relevant canonical state, not merely the same board position.
 */
export function sameReplayState(
  a: CanonicalGameState,
  b: CanonicalGameState,
): boolean {
  const fingerprint = (state: CanonicalGameState) => JSON.stringify({
    board: state.board,
    turn: state.turn,
    status: state.status,
    winner: state.winner,
    winReason: state.winReason,
    mode: state.mode,
    lastMove: state.lastMove,
    lastCaptured: state.lastCaptured,
    lastRek: state.lastRek,
    lastPoat: state.lastPoat,
    captured: state.captured,
    moveCount: state.moveCount,
    availableRekMovesCount: state.availableRekMovesCount,
    haoRekContext: state.haoRekContext ?? null,
    positionCounts: sortedPositionCounts(state.positionCounts),
    loneKingMoveCount: state.loneKingMoveCount ?? 0,
    drawMoveLimit: state.drawMoveLimit ?? 32,
  })

  return fingerprint(a) === fingerprint(b)
}
