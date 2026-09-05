import {
  BOARD_SIZE,
  Cell,
  PlayerColor,
  RuleSet,
  TestResult,
} from './types'
import {
  coordToIdx,
  createPositionKey,
  previewMove,
} from './engine'
import {
  analyzeAiMove,
  countRuleLegalMoves,
  getAllLegalMoves,
  minimax,
  type AiMove,
} from './ai'

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

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function applyAiMove(
  board: Cell[],
  move: AiMove,
  mover: PlayerColor,
  mode: RuleSet
): Cell[] {
  const result = previewMove(board, move.from, move.to, mover, mode)
  const next = [...board]
  next[move.to] = next[move.from]
  next[move.from] = null
  for (const square of result.captures) next[square] = null
  return next
}

function compulsoryRekFixture(): Cell[] {
  const board = emptyBoard()
  put(board, 'd1', 'you', true)
  put(board, 'd8', 'opp', true)
  put(board, 'c1', 'you')
  put(board, 'h1', 'you')
  put(board, 'b4', 'opp')
  put(board, 'd4', 'opp')
  return board
}

function royalThreatFixture(): Cell[] {
  const board = emptyBoard()
  put(board, 'd1', 'you', true, 'you_king')
  put(board, 'b1', 'you', false, 'you_bait')
  put(board, 'a4', 'you', false, 'you_attacker')

  put(board, 'h8', 'opp', true, 'opp_king')
  put(board, 'c8', 'opp', false, 'opp_rek_attacker')
  put(board, 'b3', 'opp', false, 'opp_b3')
  put(board, 'b5', 'opp', false, 'opp_b5')
  return board
}

function benchmarkFixture(): Cell[] {
  const board = emptyBoard()
  put(board, 'a1', 'you', true, 'you_king')
  put(board, 'c2', 'you', false, 'you_man')
  put(board, 'h8', 'opp', true, 'opp_king')
  put(board, 'f7', 'opp', false, 'opp_man')
  return board
}

export function runAiSearchRegressionTests(): {
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
        details: 'AI search regression assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('AIS-01', 'AI mobility heuristic counts rule-legal Min Rek Chanh moves only', () => {
    const board = compulsoryRekFixture()
    const legal = getAllLegalMoves(board, 'you', 'MIN_REK_CHANH')
    const count = countRuleLegalMoves(board, 'you', 'MIN_REK_CHANH')

    expect(legal.length === 1, `Fixture must expose exactly one compulsory Rek, got ${legal.length}`)
    expect(count === legal.length, `Rule mobility count ${count} must equal engine-backed AI legal count ${legal.length}`)
    expect(
      legal[0].from === coordToIdx('c1') && legal[0].to === coordToIdx('c4'),
      'The only legal move must be c1→c4 Rek'
    )

    return 'MIN_REK_CHANH evaluation can no longer inflate mobility with forbidden quiet slides.'
  })

  run('AIS-02', 'Depth-zero minimax still recognizes engine terminal immobilization', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'd8', 'opp', true)

    const score = minimax(
      board,
      0,
      -Infinity,
      Infinity,
      false,
      'you',
      'MIN_REK_CHANH'
    )

    expect(score > 80000, `Opponent immobilization must be mate-like for AI, got ${score}`)
    return 'Search checks zero legal moves before applying the heuristic depth cutoff.'
  })

  run('AIS-03', 'Depth-zero horizon detects an immediate legal Royal capture', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you', true)
    put(board, 'a4', 'you')
    put(board, 'd3', 'opp', true)
    put(board, 'd5', 'opp')

    const score = minimax(
      board,
      0,
      -Infinity,
      Infinity,
      true,
      'you',
      'REK_STANDARD'
    )

    expect(score > 90000, `Immediate Royal Rek at horizon must receive a winning score, got ${score}`)
    return 'A one-ply Royal tactical extension prevents horizon blindness around the King.'
  })

  run('AIS-04', 'Medium and Hard refuse a tempting Rek that loses their King next move', () => {
    const board = royalThreatFixture()
    const tempting = getAllLegalMoves(board, 'you', 'REK_STANDARD').find(
      (move) => move.from === coordToIdx('a4') && move.to === coordToIdx('b4')
    )
    expect(tempting?.capturesCount === 2, 'Fixture must contain the tempting a4→b4 two-piece Rek')

    for (const difficulty of ['medium', 'hard'] as const) {
      const analysis = analyzeAiMove(board, 'you', 'REK_STANDARD', difficulty)
      expect(analysis.move, `${difficulty} must return a move`)
      expect(
        !(analysis.move.from === coordToIdx('a4') && analysis.move.to === coordToIdx('b4')),
        `${difficulty} must not take material while leaving c8→c1 Royal Rek`
      )

      const next = applyAiMove(board, analysis.move, 'you', 'REK_STANDARD')
      const opponentCanTakeKing = getAllLegalMoves(next, 'opp', 'REK_STANDARD').some(
        (move) => move.capturesKing
      )
      expect(!opponentCanTakeKing, `${difficulty} selected a move allowing immediate Royal capture`)
    }

    return 'Deterministic AI prioritizes King survival over a superficially profitable two-piece Rek.'
  })

  run('AIS-05', 'Hard adaptively deepens narrow tactical/endgame positions', () => {
    const board = emptyBoard()
    put(board, 'd1', 'you', true)
    put(board, 'a4', 'you')
    put(board, 'd8', 'opp', true)
    put(board, 'b3', 'opp')
    put(board, 'b5', 'opp')

    const medium = analyzeAiMove(board, 'you', 'MIN_REK_CHANH', 'medium')
    const hard = analyzeAiMove(board, 'you', 'MIN_REK_CHANH', 'hard')

    expect(medium.move && hard.move, 'Both deterministic difficulties must find the compulsory Rek')
    expect(medium.depth === 2, `Medium depth must remain 2, got ${medium.depth}`)
    expect(hard.depth === 5, `Hard should deepen a <=4-move root to depth 5, got ${hard.depth}`)
    expect(
      hard.move.from === coordToIdx('a4') && hard.move.to === coordToIdx('b4'),
      'Hard must play the compulsory a4→b4 Rek that immobilizes the remaining Palace King'
    )
    expect((hard.move.score ?? 0) > 90000, 'Immediate immobilization win must receive a mate-like score')

    return 'Hard spends extra depth only where branching is narrow, while immediate terminal wins short-circuit search.'
  })

  run('AIS-06', 'Alpha-beta pruned bounds are not cached as exact transposition values', () => {
    const board = benchmarkFixture()
    const cache = new Map<string, number>()
    const stats = { nodes: 0, leaves: 0, cutoffs: 0, cacheHits: 0, legalMoveGenerations: 0 }
    const rootKey = `1|max|${createPositionKey(board, 'you', 'REK_STANDARD')}`

    minimax(board, 1, 0, 0, true, 'you', 'REK_STANDARD', cache, stats)

    expect(stats.cutoffs > 0, 'Zero-width alpha-beta window must produce a cutoff in this fixture')
    expect(!cache.has(rootKey), 'A cutoff root is a bound and must not be stored in the exact numeric cache')
    return 'Transposition reuse can no longer treat fail-high/fail-low alpha-beta bounds as exact scores.'
  })

  run('AIS-07', 'Medium/Hard search benchmark is deterministic and bounded by node count', () => {
    const board = benchmarkFixture()
    const mediumA = analyzeAiMove(board, 'you', 'REK_STANDARD', 'medium')
    const mediumB = analyzeAiMove(board, 'you', 'REK_STANDARD', 'medium')
    const hardA = analyzeAiMove(board, 'you', 'REK_STANDARD', 'hard')
    const hardB = analyzeAiMove(board, 'you', 'REK_STANDARD', 'hard')

    expect(JSON.stringify(mediumA) === JSON.stringify(mediumB), 'Medium analysis and counters must be deterministic')
    expect(JSON.stringify(hardA) === JSON.stringify(hardB), 'Hard analysis and counters must be deterministic')
    expect(mediumA.move !== null && hardA.move !== null, 'Benchmark position must be playable')
    expect(mediumA.depth === 2, `Medium benchmark depth must be 2, got ${mediumA.depth}`)
    expect(hardA.depth >= 3, `Hard benchmark depth must be at least 3, got ${hardA.depth}`)
    expect(mediumA.stats.nodes > 0, 'Medium benchmark must visit search nodes')
    expect(hardA.stats.nodes > mediumA.stats.nodes, 'Hard should search more nodes than Medium on the same broad position')
    expect(hardA.stats.nodes < 250000, `Hard node budget regression: ${hardA.stats.nodes} nodes`)
    expect(hardA.stats.leaves > 0 && hardA.stats.legalMoveGenerations > 0, 'Hard diagnostics must record leaves and legal generations')

    return `Medium depth ${mediumA.depth}: ${mediumA.stats.nodes} nodes; Hard depth ${hardA.depth}: ${hardA.stats.nodes} nodes, ${hardA.stats.cutoffs} cutoffs.`
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
