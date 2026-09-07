import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import {
  coordToIdx,
  countPieces,
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

export function runSpecLockTests(): {
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
        details: 'Specification lock assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('SPEC-01', 'Initial setup is exactly the canonical 7+King+8 formation with Kings on a2/h7', () => {
    const state = createInitialState('REK_POAT')

    expect(countPieces(state.board, 'you') === 16, 'White/you must start with 16 pieces')
    expect(countPieces(state.board, 'opp') === 16, 'Black/opp must start with 16 pieces')
    expect(state.board[coordToIdx('a2')]?.player === 'you' && state.board[coordToIdx('a2')]?.king, 'White King must start on a2')
    expect(state.board[coordToIdx('h7')]?.player === 'opp' && state.board[coordToIdx('h7')]?.king, 'Black King must start on h7')

    const whiteMen = [
      ...'bcdefgh'.split('').map((file) => `${file}1`),
      ...'abcdefgh'.split('').map((file) => `${file}3`),
    ]
    const blackMen = [
      ...'abcdefgh'.split('').map((file) => `${file}6`),
      ...'abcdefg'.split('').map((file) => `${file}8`),
    ]

    for (const coord of whiteMen) {
      const piece = state.board[coordToIdx(coord)]
      expect(piece?.player === 'you' && !piece.king, `${coord} must contain a White/you man`)
    }
    for (const coord of blackMen) {
      const piece = state.board[coordToIdx(coord)]
      expect(piece?.player === 'opp' && !piece.king, `${coord} must contain a Black/opp man`)
    }

    const expectedEmpty = [
      'a1',
      ...'bcdefgh'.split('').map((file) => `${file}2`),
      ...'abcdefgh'.split('').flatMap((file) => [`${file}4`, `${file}5`]),
      ...'abcdefg'.split('').map((file) => `${file}7`),
      'h8',
    ]
    for (const coord of expectedEmpty) {
      expect(state.board[coordToIdx(coord)] === null, `${coord} must start empty`)
    }

    return 'Setup matches the corrected Khmer formation: White K@a2, Black K@h7, 15 men each, and only ranks 4-5 fully empty.'
  })

  run('SPEC-02', 'Rook-like movement stops at the first occupied square in every direction', () => {
    const board = emptyBoard()
    put(board, 'd4', 'you')
    put(board, 'd6', 'opp')
    put(board, 'd2', 'you')
    put(board, 'b4', 'opp')
    put(board, 'f4', 'you')

    const moves = getLegalMoves(board, coordToIdx('d4'))
    for (const coord of ['d5', 'd3', 'c4', 'e4']) {
      expect(moves.includes(coordToIdx(coord)), `${coord} must be reachable before the blocker`)
    }
    for (const coord of ['d6', 'd7', 'd2', 'd1', 'b4', 'a4', 'f4', 'g4']) {
      expect(!moves.includes(coordToIdx(coord)), `${coord} must not be reachable through/on a blocker`)
    }

    return 'All four sliding rays terminate at their first occupied square and occupied destinations are excluded.'
  })

  run('SPEC-03', 'Rek requires enemies on both adjacent opposite sides and never wraps at board edges', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'h4', 'opp')

    const res = previewMove(board, coordToIdx('a1'), coordToIdx('a4'), 'you', 'REK_POAT')
    expect(!res.rek, 'Landing on a4 cannot Rek without enemies on both in-bounds sides')
    expect(res.rekCaptures.length === 0, 'Edge coordinates must never wrap h4 into the left side of a4')

    return 'Rek is strictly local to the two adjacent opposite cells and board boundaries are respected.'
  })

  run('SPEC-04', 'Poat can capture the King and immediately award victory', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you', true, 'you_king')
    put(board, 'a6', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp', true, 'opp_king')

    const next = executeMove(makeState(board), coordToIdx('a6'), coordToIdx('a7'))
    expect(next.lastPoat, 'a6 -> a7 must close the final liberty around a8')
    expect(next.board[coordToIdx('a8')] === null, 'Poat must remove the trapped King')
    expect(next.status === 'won' && next.winner === 'you', 'Poat capture of the King must end the game immediately')
    expect(next.winReason === 'Royal King Captured', 'King capture must use the primary King-capture win condition')

    return 'A King has no immunity from Poat; zero liberties removes it and ends the game.'
  })

  run('SPEC-05', 'Pre-existing Rek does not create a Min obligation without transition context', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const ordinaryPieceMoves = getMoveResults(board, coordToIdx('h1'), 'MIN_REK_CHANH')
    expect(ordinaryPieceMoves.has(coordToIdx('h2')), 'Quiet move must remain context-free legal without active Hao')

    const rekPieceMoves = getMoveResults(board, coordToIdx('c1'), 'MIN_REK_CHANH')
    expect(rekPieceMoves.has(coordToIdx('c4')), 'Existing Rek remains an available tactical move')

    return 'Board-only Rek existence is no longer treated as the Hao trigger.'
  })

  run('SPEC-06', 'Ignoring an active transition-owned Hao response is an immediate forfeit', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const state = makeState(board, 'you', 'MIN_REK_CHANH')
    state.haoRekContext = {
      active: true,
      createdByMove: { from: coordToIdx('b3'), to: coordToIdx('b4') },
      allowedResponses: [{ from: coordToIdx('c1'), to: coordToIdx('c4') }],
    }
    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))

    expect(next.status === 'won', 'Ignoring active Hao must end the game')
    expect(next.winner === 'opp', 'The violating side must lose')
    expect(next.board[coordToIdx('h1')]?.player === 'you', 'The forfeiting move must not execute')
    expect(next.board[coordToIdx('h2')] === null, 'The forfeiting destination must remain empty')

    return 'Forfeit enforcement is owned by active Hao transition context.'
  })

  run('SPEC-07', 'Ordinary moves remain legal in MIN_REK_CHANH when no Rek exists', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'h8', 'opp', true)

    const moves = getMoveResults(board, coordToIdx('c1'), 'MIN_REK_CHANH')
    expect(moves.has(coordToIdx('c2')), 'c1 -> c2 must remain legal when no Rek opportunity exists')
    expect(moves.has(coordToIdx('c4')), 'Normal rook-like movement must remain available without a compulsory Rek')

    return 'Min Rek Chanh restricts ordinary movement only while at least one Rek is available.'
  })

  run('SPEC-08', 'The Palace King never generates movement or Rek in MIN_REK_CHANH', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true)
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    expect(getLegalMoves(board, coordToIdx('a2'), 'MIN_REK_CHANH').length === 0, 'Palace King must have zero legal destinations')
    const reks = getAllRekOpportunities(board, 'you', 'MIN_REK_CHANH')
    expect(!reks.some((move) => move.from === coordToIdx('a2')), 'Stationary Palace King must never appear in Rek opportunities')

    return 'King immobility is enforced consistently in both movement and compulsory-Rek discovery.'
  })

  run('SPEC-09', 'Poat remains enabled in MIN_REK_CHANH', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true, 'you_king')
    put(board, 'h7', 'opp', true, 'opp_king')
    put(board, 'a6', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp')

    const res = previewMove(board, coordToIdx('a6'), coordToIdx('a7'), 'you', 'MIN_REK_CHANH')
    expect(res.poat, 'Poat must still trigger in MIN_REK_CHANH')
    expect(res.poatCaptures.includes(coordToIdx('a8')), 'The trapped a8 man must be Poat-captured')

    return 'The mode table explicitly keeps Poat enabled in both game modes.'
  })

  run('SPEC-10', 'Current zero-move terminal is based on geometric mobility, not Poat liberties', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true, 'you_king')
    put(board, 'a1', 'you')
    put(board, 'h7', 'opp', true, 'opp_king')

    const next = executeMove(makeState(board, 'you', 'MIN_REK_CHANH'), coordToIdx('a1'), coordToIdx('b1'))
    expect(next.status === 'won' && next.winner === 'you', 'Opponent with zero geometric moves must lose under the current engine contract')
    expect(next.winReason === 'Opponent has no geometric moves', 'Zero-move terminal reason must not reuse Poat zero-liberties terminology')
    expect(next.board[coordToIdx('h7')]?.king === true, 'Zero-move terminal must not require the King to be captured first')

    return 'Current engine behavior is unchanged, while terminal wording is kept distinct from the Poat liberty algorithm.'
  })

  run('SPEC-11', 'A finished game is immutable to further move attempts', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true, 'you_king')
    put(board, 'a1', 'you')
    put(board, 'h7', 'opp', true, 'opp_king')

    const won = executeMove(makeState(board, 'you', 'MIN_REK_CHANH'), coordToIdx('a1'), coordToIdx('b1'))
    const after = executeMove(won, coordToIdx('h7'), coordToIdx('h6'))
    expect(after === won, 'executeMove must return the exact finished state when the game is no longer playing')

    return 'No rule processing or state mutation is allowed after win/draw status is reached.'
  })

  const passed = results.filter((result) => result.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
