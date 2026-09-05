import { BOARD_SIZE, Cell, TestResult } from './types'
import { coordToIdx } from './engine'
import {
  chooseAiMove,
  evaluateBoard,
  getAllLegalMoves,
} from './ai'
import { KHMER_PUZZLES } from './puzzles'

function emptyBoard(): Cell[] {
  return Array(BOARD_SIZE * BOARD_SIZE).fill(null)
}

function put(
  board: Cell[],
  coord: string,
  player: 'you' | 'opp',
  king = false,
  id = `${player}_${coord}`
): void {
  board[coordToIdx(coord)] = { player, king, id }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function royalCaptureFixture(): Cell[] {
  const board = emptyBoard()
  put(board, 'a1', 'you', true, 'you_king')
  put(board, 'a4', 'you', false, 'you_attacker')
  put(board, 'd3', 'opp', true, 'opp_king')
  put(board, 'd5', 'opp', false, 'opp_man')
  return board
}

export function runAiQualityTests(): {
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
        details: 'AI quality assertion failed',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  run('AIQ-01', 'Medium AI never overlooks an immediate legal King capture', () => {
    const move = chooseAiMove(royalCaptureFixture(), 'you', 'REK_STANDARD', 'medium')
    expect(move, 'Medium AI must return a move')
    expect(move.from === coordToIdx('a4') && move.to === coordToIdx('d4'), 'Medium AI must play a4→d4 Royal Rek')
    return 'Immediate Royal capture bypasses lower-value positional alternatives.'
  })

  run('AIQ-02', 'Hard AI never overlooks an immediate legal King capture', () => {
    const move = chooseAiMove(royalCaptureFixture(), 'you', 'REK_STANDARD', 'hard')
    expect(move, 'Hard AI must return a move')
    expect(move.from === coordToIdx('a4') && move.to === coordToIdx('d4'), 'Hard AI must play a4→d4 Royal Rek')
    return 'Hard search recognizes the same forced Royal finish before deeper search.'
  })

  run('AIQ-03', 'AI tactical metadata comes from the legal Rek→Poat master puzzle', () => {
    const board = emptyBoard()
    KHMER_PUZZLES[6].setup(board)
    const move = getAllLegalMoves(board, 'you', 'REK_STANDARD').find(
      (candidate) => candidate.from === coordToIdx('c1') && candidate.to === coordToIdx('c4')
    )
    expect(move, 'Level 7 solution must appear in AI engine-legal set')
    expect(move.rek && move.poat, 'Level 7 move must carry both engine tactical flags')
    expect(move.capturesKing, 'Level 7 move must be recognized as a Royal capture')
    expect(move.capturesCount === 3, 'Level 7 must remove two Rek victims plus Poat King')
    return 'AI ordering consumes core MoveResult metadata instead of recomputing capture rules.'
  })

  run('AIQ-04', 'Medium and hard selection are deterministic on equal input', () => {
    const board = royalCaptureFixture()
    const mediumA = chooseAiMove(board, 'you', 'REK_STANDARD', 'medium')
    const mediumB = chooseAiMove(board, 'you', 'REK_STANDARD', 'medium')
    const hardA = chooseAiMove(board, 'you', 'REK_STANDARD', 'hard')
    const hardB = chooseAiMove(board, 'you', 'REK_STANDARD', 'hard')
    expect(JSON.stringify(mediumA) === JSON.stringify(mediumB), 'Medium AI should be deterministic')
    expect(JSON.stringify(hardA) === JSON.stringify(hardB), 'Hard AI should be deterministic')
    return 'Only easy mode intentionally uses randomness.'
  })

  run('AIQ-05', 'Heuristic score is side-symmetric on the same nonterminal board', () => {
    const board = emptyBoard()
    put(board, 'a1', 'you', true, 'you_king')
    put(board, 'c3', 'you', false, 'you_man')
    put(board, 'h8', 'opp', true, 'opp_king')
    put(board, 'f6', 'opp', false, 'opp_man')
    const youScore = evaluateBoard(board, 'you', 'REK_STANDARD')
    const oppScore = evaluateBoard(board, 'opp', 'REK_STANDARD')
    expect(youScore === -oppScore, `Expected symmetric scores, got ${youScore} / ${oppScore}`)
    return 'Evaluation has no hidden first-player bias on a mirrored ownership view.'
  })

  const passed = results.filter((result) => result.passed).length
  return { total: results.length, passed, failed: results.length - passed, results }
}
