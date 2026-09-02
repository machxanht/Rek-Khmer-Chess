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

  run('SPEC-01', 'Initial setup is exactly 16 pieces per side with Kings on d1/d8', () => {
    const state = createInitialState('REK_POAT')

    expect(countPieces(state.board, 'you') === 16, 'White/you must start with 16 pieces')
    expect(countPieces(state.board, 'opp') === 16, 'Black/opp must start with 16 pieces')
    expect(state.board[coordToIdx('d1')]?.player === 'you' && state.board[coordToIdx('d1')]?.king, 'White King must start on d1')
    expect(state.board[coordToIdx('d8')]?.player === 'opp' && state.board[coordToIdx('d8')]?.king, 'Black King must start on d8')

    for (const rank of [3, 4, 5, 6]) {
      for (const file of 'abcdefgh') {
        expect(state.board[coordToIdx(`${file}${rank}`)] === null, `Central square ${file}${rank} must start empty`)
      }
    }

    return 'Setup matches the repository specification: 16 vs 16, d1/d8 Kings, four empty central ranks.'
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

  run('SPEC-05', 'Compulsory Rek in MIN_REK_CHANH is global across the whole side', () => {
    const board = emptyBoard()
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const ordinaryPieceMoves = getMoveResults(board, coordToIdx('h1'), 'MIN_REK_CHANH')
    expect(ordinaryPieceMoves.size === 0, 'A non-Rek piece must expose no moves while another friendly piece can Rek')

    const rekPieceMoves = getMoveResults(board, coordToIdx('c1'), 'MIN_REK_CHANH')
    expect(rekPieceMoves.has(coordToIdx('c4')), 'The actual compulsory Rek destination must remain legal')

    return 'The obligation is side-wide: if any Rek exists, ordinary moves from other pieces are suppressed.'
  })

  run('SPEC-06', 'Ignoring a Rek available elsewhere is an immediate Min Rek Chanh forfeit', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you')
    put(board, 'h1', 'you')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')

    const state = makeState(board, 'you', 'MIN_REK_CHANH')
    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))

    expect(next.status === 'won', 'A compulsory-Rek violation must end the game')
    expect(next.winner === 'opp', 'The violating side must lose')
    expect(next.board[coordToIdx('h1')]?.player === 'you', 'The illegal move must not be executed')
    expect(next.board[coordToIdx('h2')] === null, 'The illegal destination must remain empty')

    return 'Forfeit enforcement uses the globally available Rek set, not only the selected piece.'
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
    put(board, 'd1', 'you', true)
    put(board, 'c4', 'opp')
    put(board, 'e4', 'opp')

    expect(getLegalMoves(board, coordToIdx('d1'), 'MIN_REK_CHANH').length === 0, 'Palace King must have zero legal destinations')
    const reks = getAllRekOpportunities(board, 'you', 'MIN_REK_CHANH')
    expect(!reks.some((move) => move.from === coordToIdx('d1')), 'Stationary Palace King must never appear in Rek opportunities')

    return 'King immobility is enforced consistently in both movement and compulsory-Rek discovery.'
  })

  run('SPEC-09', 'Poat remains enabled in MIN_REK_CHANH', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'a6', 'you')
    put(board, 'b8', 'you')
    put(board, 'a8', 'opp')

    const res = previewMove(board, coordToIdx('a6'), coordToIdx('a7'), 'you', 'MIN_REK_CHANH')
    expect(res.poat, 'Poat must still trigger in MIN_REK_CHANH')
    expect(res.poatCaptures.includes(coordToIdx('a8')), 'The trapped a8 man must be Poat-captured')

    return 'The mode table explicitly keeps Poat enabled in both game modes.'
  })

  run('SPEC-10', 'Immobilization is a win when the opponent has no legal moves', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'a1', 'you')
    put(board, 'd8', 'opp', true, 'opp_king')

    const next = executeMove(makeState(board, 'you', 'MIN_REK_CHANH'), coordToIdx('a1'), coordToIdx('a2'))
    expect(next.status === 'won' && next.winner === 'you', 'Opponent with zero legal moves must lose')
    expect(next.winReason === 'Opponent completely immobilized (Zero liberties)', 'Immobilization must be reported as the win reason')
    expect(next.board[coordToIdx('d8')]?.king === true, 'Immobilization must not require the King to be captured first')

    return 'A surviving but completely immobile opponent loses according to the endgame specification.'
  })

  run('SPEC-11', 'A finished game is immutable to further move attempts', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'a1', 'you')
    put(board, 'd8', 'opp', true, 'opp_king')

    const won = executeMove(makeState(board, 'you', 'MIN_REK_CHANH'), coordToIdx('a1'), coordToIdx('a2'))
    const after = executeMove(won, coordToIdx('d8'), coordToIdx('d7'))
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
