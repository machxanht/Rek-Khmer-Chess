import {
  BOARD_SIZE,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import { checkPoatCaptures, checkRekCaptures } from './captures'
import {
  coordToIdx,
  createInitialState,
  executeMove,
  getAllRekOpportunities,
  getLegalMoves,
  getMoveResults,
  previewMove,
} from './engine'

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

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

function sameSquares(actual: Iterable<number>, expectedCoords: string[], label: string): void {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expectedCoords.map(coordToIdx))
  expect(actualSet.size === expectedSet.size, `${label}: expected ${expectedSet.size} moves, got ${actualSet.size}`)
  for (const square of expectedSet) {
    expect(actualSet.has(square), `${label}: missing expected square ${square}`)
  }
}

function setupCompulsoryRekFixture(mode: GameMode): GameState {
  const board = emptyBoard()
  put(board, 'd1', 'you', true, 'you_king')
  put(board, 'd8', 'opp', true, 'opp_king')
  put(board, 'c1', 'you', false, 'you_rek')
  put(board, 'h1', 'you', false, 'you_quiet')
  put(board, 'b4', 'opp', false, 'opp_b4')
  put(board, 'd4', 'opp', false, 'opp_d4')
  return makeState(board, 'you', mode)
}

export function runRuleGuideLockTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []
  const run = (id: string, title: string, fn: () => string) => {
    try {
      results.push({ id, title, passed: true, details: fn() })
    } catch (error) {
      results.push({
        id,
        title,
        passed: false,
        details: 'Khmer rule-guide lock assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('GUIDE-01', 'Every initial front-rank piece has exactly the four central sliding moves', () => {
    const files = 'abcdefgh'.split('')
    const modes: GameMode[] = ['REK_POAT', 'MIN_REK_CHANH']
    let checked = 0

    for (const mode of modes) {
      const state = createInitialState(mode)
      for (const file of files) {
        sameSquares(
          getMoveResults(state.board, coordToIdx(`${file}2`), mode).keys(),
          [3, 4, 5, 6].map((rank) => `${file}${rank}`),
          `${mode} ${file}2`
        )
        sameSquares(
          getMoveResults(state.board, coordToIdx(`${file}7`), mode).keys(),
          [6, 5, 4, 3].map((rank) => `${file}${rank}`),
          `${mode} ${file}7`
        )
        checked += 2
      }
    }

    return `${checked} opening pieces checked across both rule modes; each has exactly four legal slides.`
  })

  run('GUIDE-02', 'Initial back-rank pieces are blocked by their own front rank', () => {
    const files = 'abcdefgh'.split('')
    const modes: GameMode[] = ['REK_POAT', 'MIN_REK_CHANH']
    let checked = 0

    for (const mode of modes) {
      const state = createInitialState(mode)
      for (const file of files) {
        expect(
          getMoveResults(state.board, coordToIdx(`${file}1`), mode).size === 0,
          `${mode} ${file}1 must be blocked initially`
        )
        expect(
          getMoveResults(state.board, coordToIdx(`${file}8`), mode).size === 0,
          `${mode} ${file}8 must be blocked initially`
        )
        checked += 2
      }
    }

    return `${checked} back-rank pieces checked; none can jump through its own front rank.`
  })

  run('GUIDE-03', 'Movement is orthogonal only and cannot land on or jump through occupied cells', () => {
    const state = createInitialState('REK_POAT')
    const moves = new Set(getLegalMoves(state.board, coordToIdx('a2'), 'REK_POAT'))

    expect(!moves.has(coordToIdx('b3')), 'Diagonal a2 -> b3 must be illegal')
    expect(!moves.has(coordToIdx('a1')), 'Landing on own occupied a1 must be illegal')
    expect(!moves.has(coordToIdx('a7')), 'Landing on occupied enemy a7 must be illegal')
    expect(!moves.has(coordToIdx('a8')), 'Jumping through occupied a7 to a8 must be illegal')

    return 'Diagonal movement, occupied landing, and jumping are all rejected.'
  })

  run('GUIDE-04', 'King slides like a Man in Rek Poat but is stationary in Min Rek Chanh', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'd8', 'opp', true, 'opp_king')

    sameSquares(
      getLegalMoves(board, coordToIdx('d1'), 'REK_POAT'),
      ['a1', 'b1', 'c1', 'e1', 'f1', 'g1', 'h1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
      'REK_POAT King d1'
    )
    expect(
      getLegalMoves(board, coordToIdx('d1'), 'MIN_REK_CHANH').length === 0,
      'MIN_REK_CHANH King must expose zero moves'
    )

    return 'The King behavior is locked independently for both documented modes.'
  })

  run('GUIDE-05', 'Rek can capture two on one axis or four on both axes', () => {
    const board = emptyBoard()
    put(board, 'c4', 'you', false, 'you_land')
    put(board, 'b4', 'opp')
    put(board, 'd4', 'opp')
    put(board, 'c3', 'opp')
    put(board, 'c5', 'opp')

    sameSquares(
      checkRekCaptures(board, coordToIdx('c4'), 'you'),
      ['b4', 'd4', 'c3', 'c5'],
      'four-way Rek at c4'
    )

    board[coordToIdx('c3')] = null
    board[coordToIdx('c5')] = null
    sameSquares(
      checkRekCaptures(board, coordToIdx('c4'), 'you'),
      ['b4', 'd4'],
      'horizontal Rek at c4'
    )

    return 'Rek Boun/Rek Troat and ordinary two-piece Rek are both locked.'
  })

  run('GUIDE-06', 'Poat captures an entire zero-liberty connected group including at the board edge', () => {
    const sealed = emptyBoard()
    put(sealed, 'a8', 'opp')
    put(sealed, 'b8', 'opp')
    put(sealed, 'a7', 'you')
    put(sealed, 'b7', 'you')
    put(sealed, 'c8', 'you')

    sameSquares(checkPoatCaptures(sealed, 'opp'), ['a8', 'b8'], 'sealed edge group')

    const withLiberty = [...sealed]
    withLiberty[coordToIdx('c8')] = null
    expect(
      checkPoatCaptures(withLiberty, 'opp').length === 0,
      'Connected group with one liberty at c8 must survive'
    )

    return 'Flood-fill Poat respects connected components, liberties, and board edges.'
  })

  run('GUIDE-07', 'Turn pipeline resolves Rek before Poat so removed Rek pieces can open liberties', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_mover')
    put(board, 'a4', 'you')
    put(board, 'b3', 'you')
    put(board, 'a5', 'you')
    put(board, 'c5', 'you')
    put(board, 'b6', 'you')
    put(board, 'b4', 'opp', false, 'opp_rek_left')
    put(board, 'd4', 'opp', false, 'opp_rek_right')
    put(board, 'b5', 'opp', false, 'opp_survivor')

    const result = previewMove(board, coordToIdx('c1'), coordToIdx('c4'), 'you', 'REK_POAT')
    sameSquares(result.rekCaptures, ['b4', 'd4'], 'pipeline Rek victims')
    expect(
      !result.poatCaptures.includes(coordToIdx('b5')),
      'b5 must survive because removing b4 opens a liberty before Poat runs'
    )

    return 'The documented move -> Rek -> Poat ordering is observable and locked.'
  })

  run('GUIDE-08', 'Min Rek Chanh exposes only Rek moves and ignoring Rek loses immediately', () => {
    const state = setupCompulsoryRekFixture('MIN_REK_CHANH')
    expect(state.availableRekMovesCount > 0, 'Fixture must contain at least one Rek opportunity')
    expect(
      getMoveResults(state.board, coordToIdx('h1'), state.mode).size === 0,
      'Quiet h1 moves must disappear while Rek is compulsory'
    )

    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))
    expect(next.status === 'won' && next.winner === 'opp', 'Ignoring compulsory Rek must forfeit the game')
    expect(next.board[coordToIdx('h1')]?.id === 'you_quiet', 'Forfeited quiet move must not alter the board')
    expect(next.board[coordToIdx('h2')] === null, 'Forfeited quiet move must never reach h2')

    return 'Hao Rek is a true compulsory rule with immediate-loss adjudication in Min Rek Chanh.'
  })

  run('GUIDE-09', 'Rek remains optional in Rek Poat even when a capture is available', () => {
    const state = setupCompulsoryRekFixture('REK_POAT')
    expect(state.availableRekMovesCount > 0, 'Fixture must contain a Rek opportunity')
    expect(
      getMoveResults(state.board, coordToIdx('h1'), state.mode).has(coordToIdx('h2')),
      'Quiet h1 -> h2 must remain rule-legal in Rek Poat'
    )

    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))
    expect(next !== state, 'Optional quiet move must execute')
    expect(next.status === 'playing', 'Optional quiet move must not forfeit the game')
    expect(next.board[coordToIdx('h2')]?.id === 'you_quiet', 'Quiet piece must arrive on h2')

    return 'Rek Poat keeps capture optional exactly as documented.'
  })

  run('GUIDE-10', 'Capturing the opponent King by Rek ends the game immediately', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true, 'you_king')
    put(board, 'a4', 'you', false, 'you_attacker')
    put(board, 'c3', 'opp', false, 'opp_man')
    put(board, 'c5', 'opp', true, 'opp_king')

    const next = executeMove(makeState(board), coordToIdx('a4'), coordToIdx('c4'))
    expect(next.status === 'won', 'King capture must end the game')
    expect(next.winner === 'you', 'Mover must win after capturing opponent King')
    expect(next.lastRek === true, 'Fixture must end through Rek')
    expect(next.board[coordToIdx('c5')] === null, 'Captured King must be removed from the board')

    return 'Royal King capture is locked as a decisive terminal condition.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
