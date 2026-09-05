import {
  BOARD_SIZE,
  DEFAULT_LONE_KING_DRAW_LIMIT,
  Cell,
  GameMode,
  GameState,
  PlayerColor,
  TestResult,
} from './types'
import {
  coordToIdx,
  createInitialState,
  createPositionKey,
  executeMove,
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
  mode: GameMode = 'REK_POAT',
  drawMoveLimit = DEFAULT_LONE_KING_DRAW_LIMIT
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
    availableRekMovesCount: 0,
    positionCounts: { [createPositionKey(board, turn, mode)]: 1 },
    loneKingMoveCount: 0,
    drawMoveLimit,
  }
}

function expect(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

export function runDrawTests(): {
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
        details: 'Draw-rule assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('DRAW-01', 'Initial state seeds repetition and the SPEC default 32-move limit', () => {
    const state = createInitialState('REK_POAT')
    const key = createPositionKey(state.board, state.turn, state.mode)
    expect(state.positionCounts?.[key] === 1, 'Initial position must be counted once')
    expect(state.loneKingMoveCount === 0, 'Initial lone-King counter must be zero')
    expect(
      state.drawMoveLimit === DEFAULT_LONE_KING_DRAW_LIMIT && state.drawMoveLimit === 32,
      'Technical SPEC default must be 32 moves'
    )
    return 'Draw bookkeeping is initialized explicitly and serializably.'
  })

  run('DRAW-02', 'Threefold repetition adjudicates a draw on the third identical position', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    let state = makeState(board, 'you', 'REK_POAT', 100)

    const cycle = () => {
      state = executeMove(state, coordToIdx('a1'), coordToIdx('a2'))
      state = executeMove(state, coordToIdx('h8'), coordToIdx('h7'))
      state = executeMove(state, coordToIdx('a2'), coordToIdx('a1'))
      state = executeMove(state, coordToIdx('h7'), coordToIdx('h8'))
    }

    cycle()
    expect(state.status === 'playing', 'Second occurrence must not end the game')
    cycle()
    expect(state.status === 'draw', 'Third occurrence must be a draw')
    expect(state.winner === 'draw', 'Draw winner marker must be draw')
    expect(state.winReason === 'Threefold Repetition', 'Draw reason must identify repetition')
    return 'Board + side-to-move + mode repetition reaches draw exactly on occurrence three.'
  })

  run('DRAW-03', 'Repetition key includes turn/mode but ignores cosmetic piece IDs', () => {
    const boardA = emptyBoard()
    const boardB = emptyBoard()
    put(boardA, 'a1', 'you', true, 'id_a')
    put(boardA, 'h8', 'opp', true, 'id_b')
    put(boardB, 'a1', 'you', true, 'different_a')
    put(boardB, 'h8', 'opp', true, 'different_b')

    const base = createPositionKey(boardA, 'you', 'REK_POAT')
    expect(base === createPositionKey(boardB, 'you', 'REK_POAT'), 'Piece IDs must not affect a chess position')
    expect(base !== createPositionKey(boardA, 'opp', 'REK_POAT'), 'Side to move must affect repetition identity')
    expect(base !== createPositionKey(boardA, 'you', 'MIN_REK_CHANH'), 'Game mode must affect repetition identity')
    return 'Only rule-relevant state participates in the repetition key.'
  })

  run('DRAW-04', 'The move creating a lone-King state starts the counter at zero', () => {
    const board = emptyBoard()
    put(board, 'h1', 'you', true, 'you_king')
    put(board, 'a8', 'you', false, 'you_last_man')
    put(board, 'd8', 'opp', true, 'opp_king')
    put(board, 'b8', 'opp', false, 'opp_blocker')
    put(board, 'a6', 'opp', false, 'opp_mover')

    const next = executeMove(
      makeState(board, 'opp'),
      coordToIdx('a6'),
      coordToIdx('a7')
    )

    expect(next.board[coordToIdx('a8')] === null, 'Fixture must Poat the last non-King piece')
    expect(next.status === 'playing', 'Lone-King clock should start without ending immediately')
    expect(next.loneKingMoveCount === 0, 'Creating move must start the survival clock at zero')
    return 'The 32-count begins after the position first becomes lone-King.'
  })

  run('DRAW-05', 'Lone-King count is configurable while default remains 32', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'f8', 'opp', false, 'opp_man')
    const state = makeState(board, 'you', 'REK_POAT', 3)
    state.loneKingMoveCount = 2

    const next = executeMove(state, coordToIdx('a1'), coordToIdx('a2'))
    expect(next.status === 'draw', 'Configured third counted move must draw')
    expect(next.winner === 'draw', 'Configured lone-King limit must produce draw marker')
    expect(next.loneKingMoveCount === 3, 'Counter must reach configured threshold')
    return 'Regional 24/32/44 variants can be configured without changing movement/capture code.'
  })

  run('DRAW-06', 'A decisive King capture takes priority over a draw threshold', () => {
    const board = emptyBoard()
    put(board, 'a4', 'you', true, 'you_king')
    put(board, 'd3', 'opp', true, 'opp_king')
    put(board, 'd5', 'opp', false, 'opp_man')
    const state = makeState(board, 'you')
    state.loneKingMoveCount = 31
    state.drawMoveLimit = 32

    const next = executeMove(state, coordToIdx('a4'), coordToIdx('d4'))
    expect(next.status === 'won', 'King capture must remain a win, not a draw')
    expect(next.winner === 'you', 'Capturing side must win')
    expect(next.winReason === 'Royal King Captured', 'Primary win reason must take precedence')
    return 'Win/forfeit adjudication remains higher priority than draw bookkeeping.'
  })

  run('DRAW-07', 'Repetition identity distinguishes active Hao response context', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you', true, 'you_king')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'c1', 'you', false, 'you_man')
    put(board, 'b4', 'opp', false, 'opp_b4')
    put(board, 'd4', 'opp', false, 'opp_d4')

    const plain = createPositionKey(board, 'you', 'MIN_REK_CHANH')
    const called = createPositionKey(board, 'you', 'MIN_REK_CHANH', {
      active: true,
      createdByMove: { from: coordToIdx('b3'), to: coordToIdx('b4') },
      allowedResponses: [{ from: coordToIdx('c1'), to: coordToIdx('c4') }],
    })
    const calledSameResponses = createPositionKey(board, 'you', 'MIN_REK_CHANH', {
      active: true,
      createdByMove: { from: coordToIdx('d3'), to: coordToIdx('d4') },
      allowedResponses: [{ from: coordToIdx('c1'), to: coordToIdx('c4') }],
    })

    expect(plain !== called, 'Same board with and without active Hao must not be the same repetition position')
    expect(
      called === calledSameResponses,
      'Repetition identity should depend on legal Hao response set, not cosmetic opener provenance'
    )
    return 'Board + turn + ruleset + active Hao response set define the rule-relevant repetition position.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
