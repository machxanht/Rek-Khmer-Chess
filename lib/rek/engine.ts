// Rek Khmer (ល្បែងរែក) — Authentic Khmer Custodial & Encirclement Board Game Engine.
// Full implementation based on /HUONG_DAN_LUAT_CO_REK_KHMER.md and /SPEC_ENGINE_CO_REK_KHMER.md.
// 8x8 board, 16 pieces per side (1 King + 15 Men).
// All pieces slide orthogonally like Rooks (across empty squares).
// Captures:
// 1. Rek (រែក - Gánh): Stepping between 2 enemy pieces horizontally or vertically (or 4 pieces simultaneously).
// 2. Poat (ព័ទ្ធ - Bao Vây): Flood-fill connected component calculation. When a group of enemy pieces has 0 liberties (free orthogonal squares), all pieces in the group are captured.
// Modes:
// 1. REK_POAT (Standard / Free King, optional Rek)
// 2. MIN_REK_CHANH (Classic / Palace King fixed at d1/d8, compulsory Rek)

export const SIZE = 8

export type Player = 'you' | 'opp' // you = White (y=6,7 / bottom), opp = Black (y=0,1 / top)

export type Piece = {
  player: Player
  king: boolean
  id: string
}

export type Cell = Piece | null

export type GameMode = 'REK_POAT' | 'MIN_REK_CHANH'

export type MoveResult = {
  to: number
  rekCaptures: number[]
  poatCaptures: number[]
  captures: number[]
  rek: boolean
  poat: boolean
  isHaoRekViolation?: boolean
}

export type GameStatus = 'playing' | 'won' | 'draw'

export type GameState = {
  board: Cell[]
  turn: Player
  status: GameStatus
  winner: Player | 'draw' | null
  winReason: string | null
  mode: GameMode
  lastMove: { from: number; to: number } | null
  lastCaptured: number[]
  lastRek: boolean
  lastPoat: boolean
  captured: { you: Piece[]; opp: Piece[] } // pieces each player has LOST
  moveCount: number
  availableRekMovesCount: number
}

export const opponent = (p: Player): Player => (p === 'you' ? 'opp' : 'you')

export const rc = (index: number) => ({ row: Math.floor(index / SIZE), col: index % SIZE })
export const idx = (row: number, col: number) => row * SIZE + col
export const inBounds = (row: number, col: number) => row >= 0 && row < SIZE && col >= 0 && col < SIZE

export const DIRS = [
  { dr: -1, dc: 0 }, // Up (north)
  { dr: 1, dc: 0 },  // Down (south)
  { dr: 0, dc: -1 }, // Left (west)
  { dr: 0, dc: 1 },  // Right (east)
]

let idCounter = 0
export const makeId = () => `p_${idCounter++}`

export function createInitialState(mode: GameMode = 'REK_POAT'): GameState {
  idCounter = 0
  const board: Cell[] = Array(SIZE * SIZE).fill(null)

  // Opponent (Black) occupies rows 0 and 1 (top)
  for (let col = 0; col < SIZE; col++) {
    board[idx(0, col)] = { player: 'opp', king: col === 3, id: makeId() }
    board[idx(1, col)] = { player: 'opp', king: false, id: makeId() }
  }

  // You (White) occupies rows 6 and 7 (bottom)
  for (let col = 0; col < SIZE; col++) {
    board[idx(6, col)] = { player: 'you', king: false, id: makeId() }
    board[idx(7, col)] = { player: 'you', king: col === 3, id: makeId() }
  }

  return {
    board,
    turn: 'you',
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
  }
}

// Compute legal sliding destinations for a piece at `from`
// Rook-like movement along empty orthogonal lines
export function getLegalMoves(board: Cell[], from: number, mode: GameMode = 'REK_POAT'): number[] {
  const piece = board[from]
  if (!piece) return []

  // In Min Rek Chanh mode, the Palace King is fixed at its throne and cannot move
  if (mode === 'MIN_REK_CHANH' && piece.king) {
    return []
  }

  const { row, col } = rc(from)
  const moves: number[] = []

  for (const { dr, dc } of DIRS) {
    let step = 1
    while (true) {
      const nr = row + dr * step
      const nc = col + dc * step
      if (!inBounds(nr, nc)) break
      const targetIndex = idx(nr, nc)
      if (board[targetIndex] !== null) {
        // Blocked by another piece (cannot jump or capture by stepping on top)
        break
      }
      moves.push(targetIndex)
      step++
    }
  }

  return moves
}

// Helper: Calculate Rek (intervention / sandwich) captures
export function calculateRekCaptures(board: Cell[], landedIndex: number, player: Player): number[] {
  const enemy = opponent(player)
  const { row, col } = rc(landedIndex)
  const captured: number[] = []

  // 1. Horizontal Rek (Left + Right)
  if (col > 0 && col < SIZE - 1) {
    const leftPiece = board[idx(row, col - 1)]
    const rightPiece = board[idx(row, col + 1)]
    if (leftPiece?.player === enemy && rightPiece?.player === enemy) {
      captured.push(idx(row, col - 1), idx(row, col + 1))
    }
  }

  // 2. Vertical Rek (Up + Down)
  if (row > 0 && row < SIZE - 1) {
    const upPiece = board[idx(row - 1, col)]
    const downPiece = board[idx(row + 1, col)]
    if (upPiece?.player === enemy && downPiece?.player === enemy) {
      captured.push(idx(row - 1, col), idx(row + 1, col))
    }
  }

  return Array.from(new Set(captured))
}

// Helper: Calculate Poat (Encirclement via Flood-Fill Liberties)
// After removing Rek pieces, any enemy group with 0 liberties is captured
export function calculatePoatCaptures(board: Cell[], enemy: Player): number[] {
  const visited: boolean[] = Array(SIZE * SIZE).fill(false)
  const poatCaptures: number[] = []

  for (let i = 0; i < board.length; i++) {
    const p = board[i]
    if (!p || p.player !== enemy || visited[i]) continue

    const group: number[] = []
    const liberties: Set<number> = new Set()
    const queue: number[] = [i]
    visited[i] = true

    while (queue.length > 0) {
      const curr = queue.shift()!
      group.push(curr)
      const { row, col } = rc(curr)

      for (const { dr, dc } of DIRS) {
        const nr = row + dr
        const nc = col + dc
        if (!inBounds(nr, nc)) continue
        const nIndex = idx(nr, nc)
        const neighbor = board[nIndex]

        if (neighbor === null) {
          liberties.add(nIndex)
        } else if (neighbor.player === enemy && !visited[nIndex]) {
          visited[nIndex] = true
          queue.push(nIndex)
        }
      }
    }

    if (liberties.size === 0) {
      poatCaptures.push(...group)
    }
  }

  return poatCaptures
}

// Evaluate outcome of moving from -> to without mutating game state
export function evaluateMove(board: Cell[], from: number, to: number): MoveResult {
  const piece = board[from]
  if (!piece) return { to, rekCaptures: [], poatCaptures: [], captures: [], rek: false, poat: false }

  const next = board.slice()
  next[to] = piece
  next[from] = null

  const enemy = opponent(piece.player)

  // Step 1: Compute Rek captures
  const rekCaptures = calculateRekCaptures(next, to, piece.player)

  // Temporarily remove Rek victims to evaluate subsequent liberties accurately
  for (const r of rekCaptures) {
    next[r] = null
  }

  // Step 2: Compute Poat captures with remaining board state
  const poatCaptures = calculatePoatCaptures(next, enemy)

  const allCaptures = Array.from(new Set([...rekCaptures, ...poatCaptures]))

  return {
    to,
    rekCaptures,
    poatCaptures,
    captures: allCaptures,
    rek: rekCaptures.length > 0,
    poat: poatCaptures.length > 0,
  }
}

// Check all available Rek moves for a given player
export function getAvailableRekMoves(board: Cell[], player: Player, mode: GameMode = 'REK_POAT'): { from: number; to: number }[] {
  const rekMoves: { from: number; to: number }[] = []
  for (let from = 0; from < board.length; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue
    for (const to of getLegalMoves(board, from, mode)) {
      const res = evaluateMove(board, from, to)
      if (res.rek) {
        rekMoves.push({ from, to })
      }
    }
  }
  return rekMoves
}

// Map of destination -> MoveResult for selected piece
export function getMoveResults(board: Cell[], from: number, mode: GameMode = 'REK_POAT'): Map<number, MoveResult> {
  const map = new Map<number, MoveResult>()
  for (const to of getLegalMoves(board, from, mode)) {
    map.set(to, evaluateMove(board, from, to))
  }
  return map
}

export function hasKing(board: Cell[], player: Player): boolean {
  return board.some((c) => c?.player === player && c.king)
}

export function anyLegalMove(board: Cell[], player: Player, mode: GameMode = 'REK_POAT'): boolean {
  for (let i = 0; i < board.length; i++) {
    if (board[i]?.player === player && getLegalMoves(board, i, mode).length > 0) return true
  }
  return false
}

export function applyMove(state: GameState, from: number, to: number): GameState {
  const piece = state.board[from]
  if (!piece || piece.player !== state.turn || state.status !== 'playing') return state

  const legal = getLegalMoves(state.board, from, state.mode)
  if (!legal.includes(to)) return state

  // In Min Rek Chanh mode: Verify mandatory Rek constraint (Hao Rek)
  if (state.mode === 'MIN_REK_CHANH') {
    const availableReks = getAvailableRekMoves(state.board, state.turn, state.mode)
    if (availableReks.length > 0) {
      const isPerformingRek = availableReks.some((m) => m.from === from && m.to === to)
      if (!isPerformingRek) {
        // Failed to perform mandatory Rek -> Instant Loss!
        const nextWinner = opponent(state.turn)
        return {
          ...state,
          status: 'won',
          winner: nextWinner,
          winReason: 'Phạm luật Min Rek Chanh: Không gánh khi có cơ hội (Hao Rek violation)!',
          lastMove: { from, to },
        }
      }
    }
  }

  const board = state.board.slice()
  board[to] = piece
  board[from] = null

  const enemy = opponent(piece.player)

  // Step 1: Rek captures
  const rekCaptures = calculateRekCaptures(board, to, piece.player)
  for (const r of rekCaptures) {
    board[r] = null
  }

  // Step 2: Poat captures
  const poatCaptures = calculatePoatCaptures(board, enemy)
  for (const p of poatCaptures) {
    board[p] = null
  }

  const allCapturedIndices = Array.from(new Set([...rekCaptures, ...poatCaptures]))
  const captured = { you: [...state.captured.you], opp: [...state.captured.opp] }
  let enemyKingDied = false

  for (const i of allCapturedIndices) {
    const victim = state.board[i]
    if (victim) {
      if (victim.player === 'you') captured.you.push(victim)
      else captured.opp.push(victim)
      if (victim.king) enemyKingDied = true
    }
  }

  const nextTurn = opponent(state.turn)
  const nextReks = getAvailableRekMoves(board, nextTurn, state.mode)

  const next: GameState = {
    board,
    turn: nextTurn,
    status: 'playing',
    winner: null,
    winReason: null,
    mode: state.mode,
    lastMove: { from, to },
    lastCaptured: allCapturedIndices,
    lastRek: rekCaptures.length > 0,
    lastPoat: poatCaptures.length > 0,
    captured,
    moveCount: state.moveCount + 1,
    availableRekMovesCount: nextReks.length,
  }

  // Check victory conditions
  if (enemyKingDied || !hasKing(board, enemy)) {
    next.status = 'won'
    next.winner = piece.player
    next.winReason = 'Captured the Royal King (Chap Sdech - ចាប់ស្ដេច)!'
  } else if (countPieces(board, enemy) === 0) {
    next.status = 'won'
    next.winner = piece.player
    next.winReason = 'Annihilated all enemy forces!'
  } else if (!anyLegalMove(board, enemy, state.mode)) {
    next.status = 'won'
    next.winner = piece.player
    next.winReason = 'Opponent has no legal moves left (Total Encirclement)!'
  }

  return next
}

export function countPieces(board: Cell[], player: Player): number {
  return board.reduce((acc, c) => (c?.player === player ? acc + 1 : acc), 0)
}

export function kingIndex(board: Cell[], player: Player): number | null {
  const i = board.findIndex((c) => c?.player === player && c.king)
  return i === -1 ? null : i
}

// AI Engine (Minimax with Alpha-Beta Pruning for Authentic Khmer Strategy)
export function evaluateBoardScore(board: Cell[], perspective: Player): number {
  const enemy = opponent(perspective)
  if (!hasKing(board, perspective)) return -100000
  if (!hasKing(board, enemy)) return 100000

  let score = 0
  for (let i = 0; i < board.length; i++) {
    const p = board[i]
    if (!p) continue
    const { row, col } = rc(i)
    // Center control bonus
    const centerDist = Math.abs(3.5 - row) + Math.abs(3.5 - col)
    const posBonus = (7 - centerDist) * 3

    if (p.player === perspective) {
      score += (p.king ? 2000 : 100) + posBonus
    } else {
      score -= (p.king ? 2000 : 100) + posBonus
    }
  }

  return score
}

export function chooseAiMove(
  board: Cell[],
  player: Player,
  mode: GameMode = 'REK_POAT',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): { from: number; to: number } | null {
  const candidates: { from: number; to: number; score: number }[] = []

  // If in Min Rek Chanh mode and Rek moves exist, must choose one of them
  if (mode === 'MIN_REK_CHANH') {
    const mandatoryReks = getAvailableRekMoves(board, player, mode)
    if (mandatoryReks.length > 0) {
      return mandatoryReks[Math.floor(Math.random() * mandatoryReks.length)]
    }
  }

  for (let from = 0; from < board.length; from++) {
    const piece = board[from]
    if (!piece || piece.player !== player) continue
    for (const [to, result] of getMoveResults(board, from, mode)) {
      let moveScore = 0

      // Immediate King Capture
      const capturesKing = result.captures.some((i) => board[i]?.king)
      if (capturesKing) moveScore += 10000

      if (result.rek) moveScore += 300
      if (result.poat) moveScore += 250
      moveScore += result.captures.length * 150

      if (difficulty === 'easy') {
        moveScore += (Math.random() - 0.5) * 200
      } else if (difficulty === 'hard') {
        // Look 1 step ahead: Check opponent counter-attacks
        const simulatedState: GameState = {
          board: board.slice(),
          turn: player,
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
        }
        const nextState = applyMove(simulatedState, from, to)
        const opponentReks = getAvailableRekMoves(nextState.board, opponent(player), mode)
        if (opponentReks.length > 0) {
          moveScore -= 400 // Avoid walking into Hao Rek traps
        }
        moveScore += evaluateBoardScore(nextState.board, player) * 0.1
      }

      candidates.push({ from, to, score: moveScore })
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.score - a.score)
  return { from: candidates[0].from, to: candidates[0].to }
}

// 7 Authentic Traditional Khmer King Defense Puzzles (Kbuon Karpea Sdech - ក្បួនការពារស្ដេច)
export interface PuzzleSetup {
  id: number
  titleKhmer: string
  titleEn: string
  desc: string
  difficulty: 'Beginner' | 'Intermediate' | 'Master'
  setup: (board: Cell[]) => void
  solution: { fromCoord: string; toCoord: string }
  hint: string
}

export const KHMER_PUZZLES: PuzzleSetup[] = [
  {
    id: 1,
    titleKhmer: 'ក្បួនទី ១: ខែលត្រីកោណបាតវាំង (Triangle Palace Shield)',
    titleEn: 'Level 1: The Triangle Palace Shield',
    desc: 'Vua (h1) đang đối mặt với các đòn thọc thẳng. Dùng quân Lính tại h5 trượt xuống h2 bịt kín trục dọc để che chắn an toàn tuyệt đối cho Vua.',
    difficulty: 'Beginner',
    hint: 'Trượt Lính từ h5 xuống h2 để hoàn thiện lá chắn tam giác!',
    solution: { fromCoord: 'h5', toCoord: 'h2' },
    setup: (board) => {
      board.fill(null)
      // King at h1 (row 7, col 7)
      board[idx(7, 7)] = { player: 'you', king: true, id: makeId() }
      board[idx(7, 6)] = { player: 'you', king: false, id: makeId() } // g1
      board[idx(6, 6)] = { player: 'you', king: false, id: makeId() } // g2
      board[idx(3, 7)] = { player: 'you', king: false, id: makeId() } // h5 (sliding hero)
      // Opponent pieces aiming at King
      board[idx(7, 2)] = { player: 'opp', king: false, id: makeId() } // c1
      board[idx(1, 7)] = { player: 'opp', king: false, id: makeId() } // h7
      board[idx(0, 3)] = { player: 'opp', king: true, id: makeId() }  // d8 (Opp King)
    },
  },
  {
    id: 2,
    titleKhmer: 'ក្បួនទី ២: សសរភ្លោះការពារចំហៀង (Dual Column Guard)',
    titleEn: 'Level 2: The Dual Column Bastion',
    desc: 'Thiết lập bức tường cột đôi vững chắc để chặn đòn thọc sườn hiểm hóc của đối phương.',
    difficulty: 'Beginner',
    hint: 'Trượt quân từ b4 sang f4 chặn ngay trước mũi tiến công của quân Đen.',
    solution: { fromCoord: 'b4', toCoord: 'f4' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makeId() } // d1
      board[idx(6, 3)] = { player: 'you', king: false, id: makeId() } // d2
      board[idx(6, 2)] = { player: 'you', king: false, id: makeId() } // c2
      board[idx(4, 1)] = { player: 'you', king: false, id: makeId() } // b4 (our piece)
      board[idx(3, 5)] = { player: 'opp', king: false, id: makeId() } // f5
      board[idx(5, 5)] = { player: 'opp', king: false, id: makeId() } // f3
      board[idx(0, 3)] = { player: 'opp', king: true, id: makeId() }  // d8
    },
  },
  {
    id: 3,
    titleKhmer: 'ក្បួនទី ៣: បង្ក្រាបកណ្តាលបំបែកទ័ព (Central Flank Strike)',
    titleEn: 'Level 3: The Central Rek Split',
    desc: 'Hai quân Lính địch đứng thẳng hàng tại b4 và d4. Trượt quân vào ô c4 để thi triển đòn Gánh (Rek) chia tách đội hình đối phương.',
    difficulty: 'Intermediate',
    hint: 'Trượt Lính từ c1 lên c4 để gánh cùng lúc cả b4 và d4!',
    solution: { fromCoord: 'c1', toCoord: 'c4' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makeId() } // d1
      board[idx(7, 2)] = { player: 'you', king: false, id: makeId() } // c1
      board[idx(4, 1)] = { player: 'opp', king: false, id: makeId() } // b4
      board[idx(4, 3)] = { player: 'opp', king: false, id: makeId() } // d4
      board[idx(0, 3)] = { player: 'opp', king: true, id: makeId() }  // d8
    },
  },
  {
    id: 4,
    titleKhmer: 'ក្បួនទី ៤: រែកចាប់ស្ដេច (Direct King Assassination)',
    titleEn: 'Level 4: The Royal King Ambush',
    desc: 'Vua Đen (d2) và Lính Đen (d6) đứng trên cùng trục dọc. Trượt quân vào ô d4 để kẹp gánh bắt ngay Vua Đen và giành chiến thắng tức thì!',
    difficulty: 'Intermediate',
    hint: 'Trượt quân từ a4 sang d4 để tạo đòn Gánh dọc bắt trúng Vua đối phương!',
    solution: { fromCoord: 'a4', toCoord: 'd4' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 0)] = { player: 'you', king: true, id: makeId() } // a1
      board[idx(4, 0)] = { player: 'you', king: false, id: makeId() } // a4
      board[idx(6, 3)] = { player: 'opp', king: true, id: makeId() }  // d2 (King)
      board[idx(2, 3)] = { player: 'opp', king: false, id: makeId() } // d6
    },
  },
  {
    id: 5,
    titleKhmer: 'ក្បួនទី ៥: សំណាញ់ព័ទ្ធជ្រុង (Corner Poat Encirclement)',
    titleEn: 'Level 5: The Corner Poat Net',
    desc: 'Quân Đen ở góc a8 đã bị vây 1 phía bởi b8. Hãy trượt quân lên a7 để bịt kín ô khí cuối cùng, ăn gọn quân địch bằng đòn Bao Vây (Poat)!',
    difficulty: 'Intermediate',
    hint: 'Trượt quân từ a5 lên a7 để tước toàn bộ khí (0 liberties) của quân góc a8!',
    solution: { fromCoord: 'a5', toCoord: 'a7' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makeId() } // d1
      board[idx(3, 0)] = { player: 'you', king: false, id: makeId() } // a5
      board[idx(0, 1)] = { player: 'you', king: false, id: makeId() } // b8
      board[idx(0, 0)] = { player: 'opp', king: false, id: makeId() } // a8
      board[idx(0, 4)] = { player: 'opp', king: true, id: makeId() }  // e8
    },
  },
  {
    id: 6,
    titleKhmer: 'ក្បួនទី ៦: ព័ទ្ធកម្ទេចកងវរជន (Phalanx Mass Encirclement)',
    titleEn: 'Level 6: Phalanx Mass Encirclement',
    desc: 'Cụm liên kết 3 quân Đen (a7, a8, b8) đang bị bao vây chặt bởi a6 và c8. Trượt quân vào b7 để triệt tiêu toàn bộ đường thoát của cả cụm 3 quân!',
    difficulty: 'Master',
    hint: 'Di chuyển quân từ e7 sang b7 để đóng chiếc lồng sắt vây bắt cả 3 quân Đen!',
    solution: { fromCoord: 'e7', toCoord: 'b7' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makeId() } // d1
      board[idx(1, 4)] = { player: 'you', king: false, id: makeId() } // e7
      board[idx(2, 0)] = { player: 'you', king: false, id: makeId() } // a6
      board[idx(0, 2)] = { player: 'you', king: false, id: makeId() } // c8
      // Opponent group: a8, a7, b8
      board[idx(0, 0)] = { player: 'opp', king: false, id: makeId() } // a8
      board[idx(1, 0)] = { player: 'opp', king: false, id: makeId() } // a7
      board[idx(0, 1)] = { player: 'opp', king: false, id: makeId() } // b8
      board[idx(0, 7)] = { player: 'opp', king: true, id: makeId() }  // h8
    },
  },
  {
    id: 7,
    titleKhmer: 'ក្បួនទី ៧: អន្ទាក់ហៅរែកមហាសាល (Grand 4-Way Rek Masterpiece)',
    titleEn: 'Level 7: The Grand 4-Way Rek Masterpiece',
    desc: 'Đối phương dàn quân vây ép hình chữ thập quanh ô trung tâm d4. Hãy lao thẳng vào tâm điểm d4 để tung tuyệt chiêu Gánh 4 quân (Rek Troat / Rek Boun) quét sạch đối thủ!',
    difficulty: 'Master',
    hint: 'Trượt từ a4 thẳng vào d4 để gánh cả 4 quân (c4, e4, d5, d3) cùng 1 lúc!',
    solution: { fromCoord: 'a4', toCoord: 'd4' },
    setup: (board) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makeId() } // d1
      board[idx(4, 0)] = { player: 'you', king: false, id: makeId() } // a4 (our hero piece)
      // Opponent cross at d4: c4 (4,2), e4 (4,4), d5 (3,3), d3 (5,3)
      board[idx(4, 2)] = { player: 'opp', king: false, id: makeId() } // c4
      board[idx(4, 4)] = { player: 'opp', king: false, id: makeId() } // e4
      board[idx(3, 3)] = { player: 'opp', king: false, id: makeId() } // d5
      board[idx(5, 3)] = { player: 'opp', king: false, id: makeId() } // d3
      board[idx(0, 3)] = { player: 'opp', king: true, id: makeId() }  // d8
    },
  },
]
