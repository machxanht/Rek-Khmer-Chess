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

  run('MOVE-01', 'A legal opening move can be generated and executed', () => {
    const state = createInitialState('REK_POAT')
    const from = coordToIdx('a2')
    const to = coordToIdx('a3')
    const moves = getMoveResults(state.board, from, state.mode)

    expect(moves.has(to), 'a2 -> a3 must be a legal opening move')

    const next = executeMove(state, from, to)
    expect(next !== state, 'executeMove must return a new state for a legal move')
    expect(next.board[from] === null, 'the source square a2 must be empty after the move')
    expect(next.board[to]?.player === 'you', 'the moving piece must arrive on a3')
    expect(next.turn === 'opp', 'turn must pass to the opponent after a legal move')
    expect(next.moveCount === 1, 'moveCount must increment after a legal move')

    return 'The engine generates and applies a2 -> a3 from the initial position.'
  })

  run('MOVE-02', 'Back-rank pieces are blocked at the initial position', () => {
    const state = createInitialState('REK_POAT')
    const king = coordToIdx('d1')
    const backRankMan = coordToIdx('a1')

    expect(
      getMoveResults(state.board, king, state.mode).size === 0,
      'd1 King must initially be blocked by friendly pieces',
    )
    expect(
      getMoveResults(state.board, backRankMan, state.mode).size === 0,
      'a1 back-rank piece must initially be blocked by friendly pieces',
    )

    return 'A blocked rank-1 piece not moving is legal behavior, not an engine failure.'
  })

  const passed = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
