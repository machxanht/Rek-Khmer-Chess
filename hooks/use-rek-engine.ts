'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  applyMove,
  createInitialState,
  getMoveResults,
  evaluateMove,
  rc,
  SIZE,
  type GameState,
  type MoveResult,
  type Player,
  type GameMode,
  type PuzzleSetup,
  KHMER_PUZZLES,
  getAvailableRekMoves,
} from '@/lib/rek/engine'
import { sounds } from '@/lib/sound'

export type MoveHistoryEntry = {
  from: number
  to: number
  player: Player
  pieceName: string
  fromCoord: string
  toCoord: string
  captures: number
  rek: boolean
  poat: boolean
  timestamp: string
}

function coord(index: number): string {
  const { row, col } = rc(index)
  return `${String.fromCharCode(97 + col)}${SIZE - row}`
}

export function useRekEngine(
  initialMode: GameMode = 'REK_POAT',
  canControl?: (player: Player) => boolean,
) {
  const [game, setGame] = useState<GameState>(() => createInitialState(initialMode))
  const [selected, setSelected] = useState<number | null>(null)
  const [history, setHistory] = useState<MoveHistoryEntry[]>([])
  const [pastStates, setPastStates] = useState<GameState[]>([])
  const [bannerAlert, setBannerAlert] = useState<string | null>(null)

  const controllable = useCallback(
    (player: Player) => (canControl ? canControl(player) : true),
    [canControl],
  )

  const moveResults = useMemo<Map<number, MoveResult>>(() => {
    if (selected === null) return new Map()
    return getMoveResults(game.board, selected, game.mode)
  }, [selected, game.board, game.mode])

  const threatened = useMemo<Set<number>>(() => {
    const set = new Set<number>()
    for (const r of moveResults.values()) r.captures.forEach((c) => set.add(c))
    return set
  }, [moveResults])

  // Does current player have Rek available?
  const availableReks = useMemo(() => {
    if (game.status !== 'playing') return []
    return getAvailableRekMoves(game.board, game.turn, game.mode)
  }, [game.board, game.turn, game.status, game.mode])

  const rekAvailable = availableReks.length > 0

  // Sound & notification triggers when turn changes
  useEffect(() => {
    if (game.status === 'playing' && rekAvailable) {
      sounds.playHaoRek()
      setBannerAlert('ហៅរែក! HAO REK AVAILABLE!')
      const timer = setTimeout(() => setBannerAlert(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [game.turn, rekAvailable, game.status])

  const select = useCallback(
    (index: number) => {
      if (game.status !== 'playing') return
      if (!controllable(game.turn)) return

      const piece = game.board[index]

      // Selecting one of your own movable pieces
      if (piece && piece.player === game.turn) {
        if (selected === index) {
          setSelected(null)
        } else {
          setSelected(index)
          sounds.playSelect()
        }
        return
      }

      // Attempting to move the selected piece
      if (selected !== null) {
        const results = getMoveResults(game.board, selected, game.mode)
        if (results.has(index)) {
          const moveRes = results.get(index)!
          const movingPiece = game.board[selected]!
          const pieceName = movingPiece.king ? 'Sdech (King)' : 'Pol (Man)'

          // Play appropriate sound
          if (moveRes.rek) {
            sounds.playRek()
          } else if (moveRes.poat) {
            sounds.playPoat()
          } else if (moveRes.captures.length > 0) {
            sounds.playCapture()
          } else {
            sounds.playMove()
          }

          const now = new Date()
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

          const entry: MoveHistoryEntry = {
            from: selected,
            to: index,
            player: movingPiece.player,
            pieceName,
            fromCoord: coord(selected),
            toCoord: coord(index),
            captures: moveRes.captures.length,
            rek: moveRes.rek,
            poat: moveRes.poat,
            timestamp: timeStr,
          }

          const next = applyMove(game, selected, index)
          setPastStates((prev) => [...prev, game])
          setHistory((prev) => [entry, ...prev])
          setGame(next)
          setSelected(null)

          if (next.status === 'won') {
            if (next.winner === 'you') {
              setTimeout(() => sounds.playVictory(), 200)
            } else {
              setTimeout(() => sounds.playDefeat(), 200)
            }
          }
          return
        }
      }

      // Clicked empty / invalid: clear selection
      setSelected(null)
    },
    [game, selected, controllable],
  )

  const undo = useCallback(() => {
    if (pastStates.length === 0) return
    const prev = pastStates[pastStates.length - 1]
    setPastStates((arr) => arr.slice(0, -1))
    setHistory((arr) => arr.slice(1))
    setGame(prev)
    setSelected(null)
    sounds.playSelect()
  }, [pastStates])

  const reset = useCallback(
    (mode?: GameMode) => {
      const activeMode = mode || game.mode
      setGame(createInitialState(activeMode))
      setSelected(null)
      setHistory([])
      setPastStates([])
      sounds.playSelect()
    },
    [game.mode],
  )

  const loadPuzzle = useCallback((puzzle: PuzzleSetup) => {
    const board = Array(SIZE * SIZE).fill(null)
    puzzle.setup(board)
    setGame({
      board,
      turn: 'you',
      status: 'playing',
      winner: null,
      winReason: null,
      mode: 'REK_POAT',
      lastMove: null,
      lastCaptured: [],
      lastRek: false,
      lastPoat: false,
      captured: { you: [], opp: [] },
      moveCount: 0,
      availableRekMovesCount: 0,
    })
    setSelected(null)
    setHistory([])
    setPastStates([])
    sounds.playSelect()
  }, [])

  // Apply an externally-decided move (AI / remote opponent)
  const applyExternal = useCallback((from: number, to: number) => {
    setGame((g) => {
      const movingPiece = g.board[from]
      const results = evaluateMove(g.board, from, to)
      if (results.rek) {
        sounds.playRek()
      } else if (results.poat) {
        sounds.playPoat()
      } else if (results.captures.length > 0) {
        sounds.playCapture()
      } else {
        sounds.playMove()
      }

      if (movingPiece) {
        const entry: MoveHistoryEntry = {
          from,
          to,
          player: movingPiece.player,
          pieceName: movingPiece.king ? 'Sdech (King)' : 'Pol (Man)',
          fromCoord: coord(from),
          toCoord: coord(to),
          captures: results.captures.length,
          rek: results.rek,
          poat: results.poat,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        }
        setHistory((prev) => [entry, ...prev])
      }

      const next = applyMove(g, from, to)
      if (next.status === 'won') {
        if (next.winner === 'you') {
          setTimeout(() => sounds.playVictory(), 200)
        } else {
          setTimeout(() => sounds.playDefeat(), 200)
        }
      }
      return next
    })
    setSelected(null)
  }, [])

  return {
    game,
    selected,
    moveResults,
    threatened,
    rekAvailable,
    bannerAlert,
    history,
    canUndo: pastStates.length > 0,
    undo,
    select,
    reset,
    loadPuzzle,
    applyExternal,
    setGame,
  }
}
