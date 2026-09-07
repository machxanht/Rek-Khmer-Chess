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
  mode: GameMode = 'REK_STANDARD'
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
  put(board, 'a2', 'you', true, 'you_king')
  put(board, 'h7', 'opp', true, 'opp_king')
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

  run('GUIDE-01', 'Initial front lines have the documented staggered opening mobility', () => {
    const files = 'abcdefgh'.split('')
    const modes: GameMode[] = ['REK_STANDARD', 'MIN_REK_CHANH']
    let checked = 0

    for (const mode of modes) {
      const state = createInitialState(mode)
      for (const file of files) {
        const whiteExpected = file === 'a' ? [`${file}4`, `${file}5`] : [`${file}2`, `${file}4`, `${file}5`]
        const blackExpected = file === 'h' ? [`${file}5`, `${file}4`] : [`${file}7`, `${file}5`, `${file}4`]

        sameSquares(
          getMoveResults(state.board, coordToIdx(`${file}3`), mode).keys(),
          whiteExpected,
          `${mode} ${file}3`
        )
        sameSquares(
          getMoveResults(state.board, coordToIdx(`${file}6`), mode).keys(),
          blackExpected,
          `${mode} ${file}6`
        )
        checked += 2
      }
    }

    return `${checked} front-line pieces checked across both canonical rulesets against the 7+King+8 formation.`
  })

  run('GUIDE-02', 'Initial rear formation and palace gaps match the canonical setup', () => {
    const modes: GameMode[] = ['REK_STANDARD', 'MIN_REK_CHANH']

    for (const mode of modes) {
      const state = createInitialState(mode)
      expect(state.board[coordToIdx('a1')] === null, `${mode} a1 must start empty`)
      expect(state.board[coordToIdx('h8')] === null, `${mode} h8 must start empty`)
      expect(state.board[coordToIdx('a2')]?.player === 'you' && state.board[coordToIdx('a2')]?.king, `${mode} White King must be on a2`)
      expect(state.board[coordToIdx('h7')]?.player === 'opp' && state.board[coordToIdx('h7')]?.king, `${mode} Black King must be on h7`)

      sameSquares(
        getMoveResults(state.board, coordToIdx('b1'), mode).keys(),
        ['a1', 'b2'],
        `${mode} b1 rear man`
      )
      sameSquares(
        getMoveResults(state.board, coordToIdx('g8'), mode).keys(),
        ['g7', 'h8'],
        `${mode} g8 rear man`
      )
    }

    return 'Both canonical rulesets preserve a1/h8 gaps, Kings on a2/h7, and rear-rank slides.'
  })

  run('GUIDE-03', 'Movement is orthogonal only and cannot land on or jump through occupied cells', () => {
    const state = createInitialState('REK_STANDARD')
    const moves = new Set(getLegalMoves(state.board, coordToIdx('a3'), 'REK_STANDARD'))

    expect(!moves.has(coordToIdx('b4')), 'Diagonal a3 -> b4 must be illegal')
    expect(!moves.has(coordToIdx('a2')), 'Landing on own occupied King at a2 must be illegal')
    expect(!moves.has(coordToIdx('a6')), 'Landing on occupied enemy a6 must be illegal')
    expect(!moves.has(coordToIdx('a7')), 'Jumping through occupied a6 to a7 must be illegal')
    expect(!moves.has(coordToIdx('a8')), 'Jumping through occupied a6 to a8 must be illegal')

    return 'Diagonal movement, occupied landing, and jumping are rejected from the canonical setup.'
  })

  run('GUIDE-04', 'King moves in REK_STANDARD but is stationary in current MIN_REK_CHANH contract', () => {
    const board = emptyBoard()
    put(board, 'a2', 'you', true, 'you_king')
    put(board, 'h7', 'opp', true, 'opp_king')

    sameSquares(
      getLegalMoves(board, coordToIdx('a2'), 'REK_STANDARD'),
      ['a1', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
      'REK_STANDARD King a2'
    )
    expect(
      getLegalMoves(board, coordToIdx('a2'), 'MIN_REK_CHANH').length === 0,
      'MIN_REK_CHANH King must expose zero moves under current engine contract'
    )

    return 'Ruleset-specific King behavior is locked without claiming Min semantics are historically final.'
  })

  run('GUIDE-05', 'Current engine supports two-axis Rek and four-way Rek', () => {
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

    return 'Two-piece Rek is core; four-way Rek remains explicitly a current engine interpretation pending stronger evidence.'
  })

  run('GUIDE-06', 'Current Poat implementation captures a zero-liberty connected group at the edge', () => {
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

    return 'Flood-fill Poat regression locks the current connected-component/liberty interpretation.'
  })

  run('GUIDE-07', 'Current turn pipeline resolves Rek before Poat', () => {
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

    const result = previewMove(board, coordToIdx('c1'), coordToIdx('c4'), 'you', 'REK_STANDARD')
    sameSquares(result.rekCaptures, ['b4', 'd4'], 'pipeline Rek victims')
    expect(
      !result.poatCaptures.includes(coordToIdx('b5')),
      'b5 must survive because removing b4 opens a liberty before Poat runs'
    )

    return 'Regression locks move -> Rek -> Poat as the current technical pipeline, not as settled historical proof.'
  })

  run('GUIDE-08', 'Current MIN_REK_CHANH contract exposes only Rek moves and forfeits a quiet response', () => {
    const state = setupCompulsoryRekFixture('MIN_REK_CHANH')
    expect(state.availableRekMovesCount > 0, 'Fixture must contain at least one Rek opportunity')
    expect(
      getMoveResults(state.board, coordToIdx('h1'), state.mode).size === 0,
      'Quiet h1 moves must disappear while current Min obligation is active'
    )

    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))
    expect(next.status === 'won' && next.winner === 'opp', 'Current Min contract must forfeit ignored Rek')
    expect(next.board[coordToIdx('h1')]?.id === 'you_quiet', 'Forfeited quiet move must not alter the board')
    expect(next.board[coordToIdx('h2')] === null, 'Forfeited quiet move must never reach h2')

    return 'This locks current software behavior while exact traditional Hao Rek trigger remains UNVERIFIED.'
  })

  run('GUIDE-09', 'Rek remains optional in REK_STANDARD even when a capture is available', () => {
    const state = setupCompulsoryRekFixture('REK_STANDARD')
    expect(state.availableRekMovesCount > 0, 'Fixture must contain a Rek opportunity')
    expect(
      getMoveResults(state.board, coordToIdx('h1'), state.mode).has(coordToIdx('h2')),
      'Quiet h1 -> h2 must remain rule-legal in REK_STANDARD'
    )

    const next = executeMove(state, coordToIdx('h1'), coordToIdx('h2'))
    expect(next !== state, 'Optional quiet move must execute')
    expect(next.status === 'playing', 'Optional quiet move must not forfeit the game')
    expect(next.board[coordToIdx('h2')]?.id === 'you_quiet', 'Quiet piece must arrive on h2')

    return 'Canonical Standard keeps Rek optional under the current project contract.'
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

    return 'Royal King capture remains the decisive terminal condition with strongest evidence.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
