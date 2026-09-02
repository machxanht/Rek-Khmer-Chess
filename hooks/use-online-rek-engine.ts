'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAvailableRekMoves,
  getMoveResults,
  type MoveResult,
} from '@/lib/rek/engine'
import type { MoveHistoryEntry } from '@/hooks/use-rek-engine'
import type { OnlineRoomSnapshot } from '@/lib/rek-online/types'
import { sounds } from '@/lib/sound'

export function useOnlineRekEngine({
  room,
  submitMove,
  onError,
}: {
  room: OnlineRoomSnapshot
  submitMove: (from: number, to: number, expectedMoveCount: number) => Promise<void>
  onError?: (message: string) => void
}) {
  const game = room.state
  const playerColor = room.playerColor
  const [selected, setSelected] = useState<number | null>(null)
  const [pending, setPending] = useState(false)
  const previousMoveCount = useRef(game.moveCount)
  const previousStatus = useRef(game.status)

  useEffect(() => {
    if (game.moveCount !== previousMoveCount.current) {
      if (game.lastRek) sounds.playRek()
      else if (game.lastPoat) sounds.playPoat()
      else if (game.lastCaptured.length > 0) sounds.playCapture()
      else sounds.playMove()
      previousMoveCount.current = game.moveCount
      setSelected(null)
    }

    if (previousStatus.current === 'playing' && game.status === 'won') {
      if (game.winner === playerColor) sounds.playVictory()
      else sounds.playDefeat()
    }
    previousStatus.current = game.status
  }, [game, playerColor])

  const moveResults = useMemo<Map<number, MoveResult>>(() => {
    if (selected === null) return new Map()
    if (game.status !== 'playing' || game.turn !== playerColor) return new Map()
    const piece = game.board[selected]
    if (!piece || piece.player !== playerColor) return new Map()
    return getMoveResults(game.board, selected, game.mode)
  }, [game, playerColor, selected])

  const threatened = useMemo<Set<number>>(() => {
    const squares = new Set<number>()
    for (const result of moveResults.values()) {
      for (const square of result.captures) squares.add(square)
    }
    return squares
  }, [moveResults])

  const rekAvailable = useMemo(() => {
    if (game.status !== 'playing') return false
    return getAvailableRekMoves(game.board, game.turn, game.mode).length > 0
  }, [game])

  const bannerAlert =
    game.status === 'playing' &&
    game.mode === 'MIN_REK_CHANH' &&
    game.turn === playerColor &&
    rekAvailable
      ? 'ហៅរែក! HAO REK — REK IS COMPULSORY!'
      : null

  const history = useMemo<MoveHistoryEntry[]>(() => {
    return [...room.moves].reverse().map((move) => ({
      from: move.from,
      to: move.to,
      player: move.player,
      pieceName: move.pieceName,
      fromCoord: move.fromCoord,
      toCoord: move.toCoord,
      captures: move.captures,
      rek: move.rek,
      poat: move.poat,
      timestamp: new Date(move.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }))
  }, [room.moves])

  const select = useCallback(
    (index: number) => {
      if (pending || game.status !== 'playing' || game.turn !== playerColor) return
      const piece = game.board[index]

      if (piece?.player === playerColor) {
        setSelected((current) => (current === index ? null : index))
        sounds.playSelect()
        return
      }

      if (selected === null || !moveResults.has(index)) {
        setSelected(null)
        return
      }

      const from = selected
      setSelected(null)
      setPending(true)
      void submitMove(from, index, game.moveCount)
        .catch((error) => {
          onError?.(error instanceof Error ? error.message : 'Online move failed')
        })
        .finally(() => setPending(false))
    }, [game, moveResults, onError, pending, playerColor, selected, submitMove],
  )

  return {
    game,
    selected,
    moveResults,
    threatened,
    rekAvailable,
    bannerAlert,
    history,
    select,
    pending,
  }
}
