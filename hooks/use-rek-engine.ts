'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  applyMove,
  createInitialState,
  createPositionKey,
  getMoveResults,
  evaluateMove,
  rc,
  SIZE,
  DEFAULT_LONE_KING_DRAW_LIMIT,
  type GameState,
  type MoveResult,
  type Player,
  type GameMode,
  type PuzzleSetup,
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

  const playTerminalOutcome = useCallback(
    (next: GameState) => {
      if (next.status === 'draw') {
        setTimeout(() => sounds.playDraw(), 200)
        return
      }
      if (next.status !== 'won' || !next.winner || next.winner === 'draw') return

      // Pass-and-play controls both colors, so any decisive finish is a shared
      // match conclusion. Solo modes use canControl to distinguish win/loss.
      const wonByControlledSide = !canControl || controllable(next.winner)
      setTimeout(() => {
        if (wonByControlledSide) sounds.playVictory()
        else sounds.playDefeat()
      }, 200)
    },
    [canControl, controllable],
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

  const availableReks = useMemo(() => {
    if (game.status !== 'playing') return []
    return getAvailableRekMoves(game.board, game.turn, game.mode)
  }, [game.board, game.turn, game.status, game.mode])

  const rekAvailable = availableReks.length > 0

  useEffect(() => {
    if (
      game.status !== 'playing' ||
      game.mode !== 'MIN_REK_CHANH' ||
      !rekAvailable
    ) {
      setBannerAlert(null)
      return
    }

    sounds.playHaoRek()
    setBannerAlert('ហៅរែក! HAO REK — REK IS COMPULSORY!')
    const timer = setTimeout(() => setBannerAlert(null), 2500)
    return () => clearTimeout(timer)
  }, [game.turn, game.mode, rekAvailable, game.status])

  const select = useCallback(
    (index: number) => {
      if (game.status !== 'playing') return
      if (!controllable(game.turn)) return

      const piece = game.board[index]

      if (piece && piece.player === game.turn) {
        if (selected === index) {
          setSelected(null)
        } else {
          setSelected(index)
          sounds.playSelect()
        }
        return
      }

      if (selected !== null) {
        const results = getMoveResults(game.board, selected, game.mode)
        if (results.has(index)) {
          const moveRes = results.get(index)!
          const movingPiece = game.board[selected]!
          const pieceName = movingPiece.king ? 'Sdech (King)' : 'Pol (Man)'

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
          if (next === game) {
            setSelected(null)
            return
          }

          setPastStates((prev) => [...prev, game])
          setHistory((prev) => [entry, ...prev])
          setGame(next)
          setSelected(null)
          playTerminalOutcome(next)
          return
        }
      }

      setSelected(null)
    },
    [game, selected, controllable, playTerminalOutcome],
  )

  const undo = useCallback(() => {
    if (pastStates.length === 0) return
    const prev = pastStates[pastStates.length - 1]
    const rollbackPlies = Math.max(1, game.moveCount - prev.moveCount)

    setPastStates((arr) => arr.slice(0, -1))
    setHistory((arr) => arr.slice(Math.min(rollbackPlies, arr.length)))
    setGame(prev)
    setSelected(null)
    sounds.playSelect()
  }, [pastStates, game.moveCount])

  const reset = useCallback(
    (mode?: GameMode) => {
      const activeMode = mode || game.mode
      setGame(createInitialState(activeMode))
      setSelected(null)
      setHistory([])
      setPastStates([])
      setBannerAlert(null)
      sounds.playSelect()
    },
    [game.mode],
  )

  const loadPuzzle = useCallback((puzzle: PuzzleSetup) => {
    const board = Array(SIZE * SIZE).fill(null)
    puzzle.setup(board)
    const mode: GameMode = 'REK_POAT'
    const turn: Player = 'you'
    setGame({
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
      availableRekMovesCount: getAvailableRekMoves(board, turn, mode).length,
      positionCounts: { [createPositionKey(board, turn, mode)]: 1 },
      loneKingMoveCount: 0,
      drawMoveLimit: DEFAULT_LONE_KING_DRAW_LIMIT,
    })
    setSelected(null)
    setHistory([])
    setPastStates([])
    setBannerAlert(null)
    sounds.playSelect()
  }, [])

  const applyExternal = useCallback(
    (from: number, to: number) => {
      setGame((g) => {
        const movingPiece = g.board[from]
        if (!movingPiece || movingPiece.player !== g.turn) return g

        const results = evaluateMove(g.board, from, to, movingPiece.player, g.mode)
        const next = applyMove(g, from, to)
        if (next === g) return g

        const moveExecuted =
          next.moveCount === g.moveCount + 1 &&
          next.lastMove?.from === from &&
          next.lastMove?.to === to

        if (moveExecuted) {
          if (results.rek) {
            sounds.playRek()
          } else if (results.poat) {
            sounds.playPoat()
          } else if (results.captures.length > 0) {
            sounds.playCapture()
          } else {
            sounds.playMove()
          }

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

        playTerminalOutcome(next)
        return next
      })
      setSelected(null)
    },
    [playTerminalOutcome],
  )

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
