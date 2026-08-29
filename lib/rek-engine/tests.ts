// Automated Test Suite for Rek Khmer Game Engine
// Validates TC-01 to TC-06 from /SPEC_ENGINE_CO_REK_KHMER.md

import { BOARD_SIZE, Cell, TestResult } from './types'
import { idx, rc } from './captures'
import {
  coordToIdx,
  getLegalMoves,
  previewMove,
  executeMove,
  createInitialState,
} from './engine'

export function runAllUnitTests(): {
  total: number
  passed: number
  failed: number
  results: TestResult[]
} {
  const results: TestResult[] = []

  // TC-01: Gánh Ngang Cơ Bản (Horizontal Rek)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const c1 = coordToIdx('c1')
    const c4 = coordToIdx('c4')
    const b4 = coordToIdx('b4')
    const d4 = coordToIdx('d4')

    board[c1] = { player: 'you', king: false, id: 'u_c1' }
    board[b4] = { player: 'opp', king: false, id: 'o_b4' }
    board[d4] = { player: 'opp', king: false, id: 'o_d4' }

    const res = previewMove(board, c1, c4, 'you', 'REK_POAT')
    const capturedSet = new Set(res.captures)
    const pass =
      res.rek &&
      capturedSet.has(b4) &&
      capturedSet.has(d4) &&
      res.captures.length === 2

    results.push({
      id: 'TC-01',
      title: 'Gánh Ngang Cơ Bản (Horizontal Rek)',
      passed: pass,
      details: `Slid c1 → c4, captured b4 and d4. Captured count = ${res.captures.length}`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-01',
      title: 'Gánh Ngang Cơ Bản (Horizontal Rek)',
      passed: false,
      details: 'Exception encountered during execution',
      error: e.message,
    })
  }

  // TC-02: Gánh Bắt Vua (Direct King capture via Rek)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const a4 = coordToIdx('a4')
    const d4 = coordToIdx('d4')
    const d2 = coordToIdx('d2') // Opponent King
    const d6 = coordToIdx('d6') // Opponent Man

    board[a4] = { player: 'you', king: false, id: 'u_a4' }
    board[d2] = { player: 'opp', king: true, id: 'o_king' }
    board[d6] = { player: 'opp', king: false, id: 'o_man' }

    const res = previewMove(board, a4, d4, 'you', 'REK_POAT')
    const capturedSet = new Set(res.captures)
    const pass =
      res.rek &&
      capturedSet.has(d2) &&
      capturedSet.has(d6) &&
      res.captures.length === 2

    results.push({
      id: 'TC-02',
      title: 'Gánh Bắt Vua Trực Tiếp (Royal King Rek Assassination)',
      passed: pass,
      details: `Slid a4 → d4, captured King at d2 and Man at d6`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-02',
      title: 'Gánh Bắt Vua Trực Tiếp (Royal King Rek Assassination)',
      passed: false,
      details: 'Exception encountered',
      error: e.message,
    })
  }

  // TC-03: Gánh 4 Quân (Rek Boun / Rek Troat)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const a4 = coordToIdx('a4')
    const d4 = coordToIdx('d4')
    const c4 = coordToIdx('c4')
    const e4 = coordToIdx('e4')
    const d5 = coordToIdx('d5')
    const d3 = coordToIdx('d3')

    board[a4] = { player: 'you', king: false, id: 'u_a4' }
    board[c4] = { player: 'opp', king: false, id: 'o_c4' }
    board[e4] = { player: 'opp', king: false, id: 'o_e4' }
    board[d5] = { player: 'opp', king: false, id: 'o_d5' }
    board[d3] = { player: 'opp', king: false, id: 'o_d3' }

    const res = previewMove(board, a4, d4, 'you', 'REK_POAT')
    const capturedSet = new Set(res.captures)
    const pass =
      res.rek &&
      capturedSet.has(c4) &&
      capturedSet.has(e4) &&
      capturedSet.has(d5) &&
      capturedSet.has(d3) &&
      res.captures.length === 4

    results.push({
      id: 'TC-03',
      title: 'Gánh 4 Quân Đồng Thời (Rek Boun / Rek Troat)',
      passed: pass,
      details: `Slid a4 → d4, captured all 4 cross enemies (c4, e4, d5, d3)`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-03',
      title: 'Gánh 4 Quân Đồng Thời (Rek Boun / Rek Troat)',
      passed: false,
      details: 'Exception encountered',
      error: e.message,
    })
  }

  // TC-04: Bao Vây Đơn Lẻ (Single Piece Poat)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const a5 = coordToIdx('a5')
    const a7 = coordToIdx('a7')
    const a8 = coordToIdx('a8') // Opponent piece at corner
    const b8 = coordToIdx('b8') // White piece sealing right side

    board[a5] = { player: 'you', king: false, id: 'u_a5' }
    board[b8] = { player: 'you', king: false, id: 'u_b8' }
    board[a8] = { player: 'opp', king: false, id: 'o_a8' }

    const res = previewMove(board, a5, a7, 'you', 'REK_POAT')
    const capturedSet = new Set(res.captures)
    const pass = res.poat && capturedSet.has(a8) && res.captures.length === 1

    results.push({
      id: 'TC-04',
      title: 'Bao Vây Đơn Lẻ Góc (Corner Single Poat)',
      passed: pass,
      details: `Slid a5 → a7, sealing a8 with 0 liberties. Poat triggered successfully`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-04',
      title: 'Bao Vây Đơn Lẻ Góc (Corner Single Poat)',
      passed: false,
      details: 'Exception encountered',
      error: e.message,
    })
  }

  // TC-05: Bao Vây Cụm Liên Kết (Group Encirclement Poat)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const e7 = coordToIdx('e7')
    const b7 = coordToIdx('b7')
    const a6 = coordToIdx('a6')
    const c8 = coordToIdx('c8')

    // White pieces
    board[e7] = { player: 'you', king: false, id: 'u_e7' }
    board[a6] = { player: 'you', king: false, id: 'u_a6' }
    board[c8] = { player: 'you', king: false, id: 'u_c8' }

    // Opponent 3-piece connected cluster: a8, a7, b8
    const a8 = coordToIdx('a8')
    const a7 = coordToIdx('a7')
    const b8 = coordToIdx('b8')
    board[a8] = { player: 'opp', king: false, id: 'o_a8' }
    board[a7] = { player: 'opp', king: false, id: 'o_a7' }
    board[b8] = { player: 'opp', king: false, id: 'o_b8' }

    const res = previewMove(board, e7, b7, 'you', 'REK_POAT')
    const capturedSet = new Set(res.captures)
    const pass =
      res.poat &&
      capturedSet.has(a8) &&
      capturedSet.has(a7) &&
      capturedSet.has(b8) &&
      res.captures.length === 3

    results.push({
      id: 'TC-05',
      title: 'Bao Vây Cụm Liên Kết (Group Poat Encirclement)',
      passed: pass,
      details: `Slid e7 → b7, all 3 connected pieces at a8, a7, b8 captured via Flood-Fill (0 liberties)`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-05',
      title: 'Bao Vây Cụm Liên Kết (Group Poat Encirclement)',
      passed: false,
      details: 'Exception encountered',
      error: e.message,
    })
  }

  // TC-06: Bắt Buộc Gánh Trong Min Rek Chanh (Compulsory Hao Rek)
  try {
    const board: Cell[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
    const c1 = coordToIdx('c1')
    const c4 = coordToIdx('c4') // Rek move
    const c2 = coordToIdx('c2') // Non-rek move
    const b4 = coordToIdx('b4')
    const d4 = coordToIdx('d4')

    board[c1] = { player: 'you', king: false, id: 'u_c1' }
    board[b4] = { player: 'opp', king: false, id: 'o_b4' }
    board[d4] = { player: 'opp', king: false, id: 'o_d4' }

    // When playing in Min Rek Chanh, trying to make non-rek move c1 -> c2 must be rejected
    const nonRekRes = previewMove(board, c1, c2, 'you', 'MIN_REK_CHANH')
    const rekRes = previewMove(board, c1, c4, 'you', 'MIN_REK_CHANH')

    const pass =
      nonRekRes.isHaoRekViolation === true &&
      rekRes.isHaoRekViolation !== true &&
      rekRes.rek === true

    results.push({
      id: 'TC-06',
      title: 'Bắt Buộc Gánh (Min Rek Chanh / Hao Rek Enforcement)',
      passed: pass,
      details: `Non-rek move blocked with isHaoRekViolation=true, Rek move accepted`,
    })
  } catch (e: any) {
    results.push({
      id: 'TC-06',
      title: 'Bắt Buộc Gánh (Min Rek Chanh / Hao Rek Enforcement)',
      passed: false,
      details: 'Exception encountered',
      error: e.message,
    })
  }

  const passedCount = results.filter((r) => r.passed).length
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  }
}
