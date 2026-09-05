import type { TestResult } from './types'
import {
  coordToIdx,
  createInitialState,
  executeMove,
  getMoveResults,
} from './engine'

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export function runMoveRegressionTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []

  const run = (id: string, title: string, fn: () => string) => {
    try {
      const details = fn()
      results.push({ id, title, passed: true, details })
    } catch (error) {
      results.push({
        id,
        title,
        passed: false,
        details: 'Movement regression assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('MOVE-01', 'A legal canonical opening move can be generated and executed', () => {
    const state = createInitialState('REK_POAT')
    const from = coordToIdx('a3')
    const to = coordToIdx('a4')
    const moves = getMoveResults(state.board, from, state.mode)

    expect(moves.has(to), 'a3 -> a4 must be a legal opening move')

    const next = executeMove(state, from, to)
    expect(next !== state, 'executeMove must return a new state for a legal move')
    expect(next.board[from] === null, 'the source square a3 must be empty after the move')
    expect(next.board[to]?.player === 'you', 'the moving piece must arrive on a4')
    expect(next.turn === 'opp', 'turn must pass to the opponent after a legal move')
    expect(next.moveCount === 1, 'moveCount must increment after a legal move')

    return 'The engine generates and applies a3 -> a4 from the canonical initial position.'
  })

  run('MOVE-02', 'Canonical staggered setup exposes the intended palace gaps', () => {
    const state = createInitialState('REK_POAT')

    expect(state.board[coordToIdx('a1')] === null, 'a1 must start empty')
    expect(state.board[coordToIdx('h8')] === null, 'h8 must start empty')
    expect(state.board[coordToIdx('a2')]?.king === true, 'White King must start on a2')
    expect(state.board[coordToIdx('h7')]?.king === true, 'Black King must start on h7')

    const whiteRearMoves = new Set(getMoveResults(state.board, coordToIdx('b1'), state.mode).keys())
    expect(whiteRearMoves.has(coordToIdx('a1')), 'b1 must be able to slide into the empty a1 corner')
    expect(whiteRearMoves.has(coordToIdx('b2')), 'b1 must be able to slide into the empty b2 palace gap')

    const blackRearMoves = new Set(getMoveResults(state.board, coordToIdx('g8'), state.mode).keys())
    expect(blackRearMoves.has(coordToIdx('h8')), 'g8 must be able to slide into the empty h8 corner')
    expect(blackRearMoves.has(coordToIdx('g7')), 'g8 must be able to slide into the empty g7 palace gap')

    return 'The staggered 7+King+8 formation and its opening gaps are preserved.'
  })

  const passed = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
