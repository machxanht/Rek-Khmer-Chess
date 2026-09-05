// Executable regression suite for the Rek Khmer core engine.
// The first six cases track the repository specification, with TC-02/TC-03
// guarded against impossible geometry under the documented rook-like movement.

import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import { checkRekCaptures } from './captures'
import {
  RekEngine,
  coordToIdx,
  createInitialState,
  executeMove,
  getAllRekOpportunities,
  getLegalMoves,
  getMoveResults,
  previewMove,
} from './engine'

function emptyBoard(): Cell[] {
  return Array(BOARD_SIZE * BOARD_SIZE).fill(null)
}

function put(
  board: Cell[],
  coord: string,
  player: PlayerColor,
  king = false,
  id = `${player}_${coord}`
): void {
  board[coordToIdx(coord)] = { player, king, id }
}

function makeState(
  board: Cell[],
  turn: PlayerColor = 'you',
  mode: GameMode = 'REK_POAT'
): GameState {
  return {
    board,
    turn,
    status: 'playing',
    winner: null,
    winReason: null,
    mode,
    lastMove: null,
    lastCaptured: [],
    lastRek: false,
    lastPoat: false,
    captured: { you: [], opp: [] },
    moveCount: 0,
    availableRekMovesCount: getAllRekOpportunities(board, turn, mode).length,
  }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function sameMembers(actual: number[], expected: number[]): boolean {
  if (actual.length !== expected.length) return false
  const set = new Set(actual)
  return expected.every((value) => set.has(value))
}

export function runAllUnitTests(): {
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
        details: 'Regression assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('TC-01', 'Gánh ngang 2 quân (Horizontal Rek)', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const from = coordToIdx('c1')
    const to = coordToIdx('c4')
    const expected = [coordToIdx('b4'), coordToIdx('d4')]
    const res = previewMove(board, from, to, 'you', 'REK_POAT')

    expect(res.rek, 'c1 -> c4 must trigger horizontal Rek')
    expect(sameMembers(res.rekCaptures, expected), 'Rek must capture b4 and d4 only')
    return 'Legal vertical approach into c4 captures the adjacent b4/d4 pair.'
  })

  run('TC-02', 'Gánh dọc bắt Vua (legal intervention geometry)', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you', true, 'you_king')
    put(board, 'a4', 'you')
    put(board, 'd3', 'opp', true, 'opp_king')
    put(board, 'd5', 'opp')

    const state = makeState(board)
    const next = executeMove(state, coordToIdx('a4'), coordToIdx('d4'))

    expect(next.status === 'won', 'Capturing the opponent King must end the game')
    expect(next.winner === 'you', 'The mover must win after Rek captures the King')
    expect(next.board[coordToIdx('d3')] === null, 'Opponent King at d3 must be removed')
    expect(next.board[coordToIdx('d5')] === null, 'Paired man at d5 must be removed')
    return 'Corrected the impossible d2/d6 table geometry to adjacent d3/d5 victims.'
  })

  run('TC-03', 'Rek Boun primitive cannot bypass movement legality', () => {
    const landed = emptyBoard()
    put(landed, 'd4', 'you')
    put(landed, 'c4', 'opp')
    put(landed, 'e4', 'opp')
    put(landed, 'd3', 'opp')
    put(landed, 'd5', 'opp')

    const primitive = checkRekCaptures(landed, coordToIdx('d4'), 'you')
    expect(primitive.length === 4, 'Capture primitive should recognize a four-way cross if it exists')

    const board = emptyBoard()
    put(board, 'a4', 'you')
    put(board, 'c4', 'opp')
    put(board, 'e4', 'opp')
    put(board, 'd3', 'opp')
    put(board, 'd5', 'opp')

    const impossible = previewMove(board, coordToIdx('a4'), coordToIdx('d4'), 'you', 'REK_POAT')
    expect(!impossible.rek, 'Preview must not simulate a4 -> d4 through occupied c4')
    expect(impossible.captures.length === 0, 'Illegal movement must never generate captures')
    return 'Cross capture math remains isolated, while the engine rejects the blocked a4 -> d4 scenario.'
  })

  run('TC-04', 'Bao vây Poat ở góc', () => {
    const board = emptyBoard()
    put(board, 'a6', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp')

    const res = previewMove(board, coordToIdx('a6'), coordToIdx('a7'), 'you', 'REK_POAT')
    expect(res.poat, 'Closing a7 with b8 occupied must Poat a8')
    expect(sameMembers(res.poatCaptures, [coordToIdx('a8')]), 'Only a8 should be Poat-captured')
    return 'Board edges count as walls; a8 has zero liberties after a6 -> a7.'
  })

  run('TC-05', 'Min Rek Chanh - compulsory Rek forfeit', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const state = makeState(board, 'you', 'MIN_REK_CHANH')
    const from = coordToIdx('c1')
    const illegalChoice = coordToIdx('c2')
    const next = executeMove(state, from, illegalChoice)

    expect(next.status === 'won', 'Ignoring a compulsory Rek must end Min Rek Chanh')
    expect(next.winner === 'opp', 'The player who ignores compulsory Rek must lose')
    expect(next.board[from]?.id === board[from]?.id, 'Forfeit must not execute the illegal move')
    expect(next.board[illegalChoice] === null, 'Forfeit destination must remain empty')
    return 'A geometrically valid non-Rek attempt is adjudicated as an immediate forfeit.'
  })

  run('TC-06', 'Khối liên thông Poat', () => {
    const board = emptyBoard()
    put(board, 'e7', 'you')
    put(board, 'a6', 'you')
    put(board, 'c8', 'you')
    put(board, 'a8', 'opp')
    put(board, 'a7', 'opp')
    put(board, 'b8', 'opp')

    const res = previewMove(board, coordToIdx('e7'), coordToIdx('b7'), 'you', 'REK_POAT')
    const expected = [coordToIdx('a8'), coordToIdx('a7'), coordToIdx('b8')]

    expect(res.poat, 'Closing b7 must Poat the connected corner group')
    expect(sameMembers(res.poatCaptures, expected), 'All three connected opponent pieces must be removed')
    return 'Flood-fill treats a7/a8/b8 as one group and captures it at zero liberties.'
  })

  run('REG-01', 'Initial staggered movement is rook-like and blocked by the surrounding formation', () => {
    const state = createInitialState('REK_POAT')
    const moves = getLegalMoves(state.board, coordToIdx('b3'), state.mode)
    const expected = ['b2', 'b4', 'b5'].map(coordToIdx)

    expect(sameMembers(moves, expected), 'b3 should slide to b2/b4/b5 and stop at b1/b6 blockers')
    return 'Initial b3 uses the palace gap behind it and the two central squares ahead of it.'
  })

  run('REG-02', 'Pieces cannot jump over blockers', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you')
    put(board, 'a3', 'you')

    const moves = getLegalMoves(board, coordToIdx('a1'))
    expect(moves.includes(coordToIdx('a2')), 'a2 must remain legal')
    expect(!moves.includes(coordToIdx('a3')), 'Occupied a3 must not be legal')
    expect(!moves.includes(coordToIdx('a4')), 'Squares beyond a3 must not be reachable')
    return 'The first occupied square terminates sliding in that direction.'
  })

  run('REG-03', 'Pieces cannot capture by landing on an occupied square', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you')
    put(board, 'a3', 'opp')

    const moves = getLegalMoves(board, coordToIdx('a1'))
    expect(moves.includes(coordToIdx('a2')), 'a2 must be legal before the blocker')
    expect(!moves.includes(coordToIdx('a3')), 'Enemy-occupied a3 must not be a destination')
    return 'Rek captures by intervention/encirclement, never by replacement capture.'
  })

  run('REG-04', 'Rek remains optional in REK_POAT', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const moves = getMoveResults(board, coordToIdx('c1'), 'REK_POAT')
    expect(moves.has(coordToIdx('c2')), 'Ordinary c1 -> c2 must remain legal in REK_POAT')
    expect(moves.has(coordToIdx('c4')), 'Rek c1 -> c4 must also remain legal')
    return 'Standard Rek Poat exposes both tactical Rek and ordinary movement.'
  })

  run('REG-05', 'MIN_REK_CHANH exposes only compulsory Rek destinations', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const moves = getMoveResults(board, coordToIdx('c1'), 'MIN_REK_CHANH')
    expect(!moves.has(coordToIdx('c2')), 'Non-Rek c2 must be filtered while Rek exists')
    expect(moves.has(coordToIdx('c4')), 'The actual Rek destination must remain available')
    return 'UI-facing legal moves match the compulsory Hao Rek rule.'
  })

  run('REG-06', 'King mobility differs by game mode', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)

    const standard = getLegalMoves(board, coordToIdx('a2'), 'REK_POAT')
    const palace = getLegalMoves(board, coordToIdx('a2'), 'MIN_REK_CHANH')
    expect(standard.length > 0, 'King must move like a rook in REK_POAT')
    expect(palace.length === 0, 'King must be stationary in MIN_REK_CHANH')
    return 'Mode-specific King behavior is enforced by the core move generator.'
  })

  run('REG-07', 'Rek is resolved before Poat', () => {
    const board = emptyBoard()
    put(board, 'c6', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')
    put(board, 'b3', 'opp')
    put(board, 'a3', 'you')
    put(board, 'c3', 'you')
    put(board, 'b2', 'you')
    put(board, 'a4', 'you')
    put(board, 'b5', 'you')

    const res = previewMove(board, coordToIdx('c6'), coordToIdx('c4'), 'you', 'REK_POAT')
    expect(res.rek, 'c6 -> c4 must Rek b4/d4')
    expect(res.rekCaptures.includes(coordToIdx('b4')), 'b4 must be removed by Rek first')
    expect(!res.poatCaptures.includes(coordToIdx('b3')), 'b3 must survive because removed b4 becomes a liberty')
    return 'Post-Rek emptiness is visible to the subsequent Poat flood-fill.'
  })

  run('REG-08', 'Preview and execute reject impossible movement', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you')
    put(board, 'a2', 'you')
    put(board, 'h8', 'opp', true)
    put(board, 'h1', 'you', true)

    const diagonal = previewMove(board, coordToIdx('a1'), coordToIdx('b2'), 'you', 'REK_POAT')
    expect(diagonal.captures.length === 0 && !diagonal.rek && !diagonal.poat, 'Diagonal preview must be empty')

    const state = makeState(board)
    const next = executeMove(state, coordToIdx('a1'), coordToIdx('a3'))
    expect(next === state, 'executeMove must return the original state when a2 blocks a1 -> a3')
    return 'Both preview and execution share the same geometric safety boundary.'
  })

  run('REG-09', 'RekEngine class cannot move the opponent on the wrong turn', () => {
    const engine = new RekEngine('REK_POAT')
    const before = engine.getState()
    const accepted = engine.makeMove(coordToIdx('a6'), coordToIdx('a5'))
    const after = engine.getState()

    expect(accepted === false, 'Wrong-turn move must return false')
    expect(after === before, 'Wrong-turn move must not mutate class state')
    expect(after.moveCount === 0, 'Wrong-turn move must not increment move count')
    return 'The stateful wrapper now enforces turn ownership before recording history.'
  })

  run('REG-10', 'Captured piece bookkeeping belongs to the side that lost pieces', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const next = executeMove(makeState(board), coordToIdx('c1'), coordToIdx('c4'))
    expect(next.captured.opp.length === 2, 'Two lost opponent men must be stored in captured.opp')
    expect(next.captured.you.length === 0, 'The mover must not be credited as having lost those pieces')
    return 'Capture trays track ownership of the removed pieces, not the capturing player.'
  })

  run('REG-11', 'Three-argument preview remains backward compatible', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const from = coordToIdx('c1')
    const to = coordToIdx('c4')
    const legacy = previewMove(board, from, to)
    const explicit = previewMove(board, from, to, 'you', 'REK_POAT')

    expect(sameMembers(legacy.captures, explicit.captures), 'Legacy and explicit previews must agree')
    expect(legacy.rek === explicit.rek && legacy.poat === explicit.poat, 'Legacy preview flags must match')
    return 'The modular refactor compatibility path is covered against regression.'
  })

  run('REG-12', 'Multiple compulsory Rek choices remain selectable', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'h4', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')
    put(board, 'f3', 'opp')
    put(board, 'f5', 'opp')

    const reks = getAllRekOpportunities(board, 'you', 'MIN_REK_CHANH')
    const first = reks.some((m) => m.from === coordToIdx('c1') && m.to === coordToIdx('c4'))
    const second = reks.some((m) => m.from === coordToIdx('h4') && m.to === coordToIdx('f4'))

    expect(first && second, 'Both independent Rek choices must be available')
    return 'Min Rek Chanh requires a Rek but does not arbitrarily select one tactical option.'
  })

  run('REG-13', 'A Poat group with one remaining liberty survives', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp')

    const res = previewMove(board, coordToIdx('h1'), coordToIdx('h2'), 'you', 'REK_POAT')
    expect(!res.poatCaptures.includes(coordToIdx('a8')), 'a8 must survive while a7 is empty')
    return 'Poat triggers only at zero liberties; a single escape square prevents capture.'
  })

  const passedCount = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  }
}
