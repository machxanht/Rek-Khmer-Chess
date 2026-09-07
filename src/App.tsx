import React, { useEffect, useMemo, useState } from 'react'
import {
  chooseAiMoveForState,
  createGame,
  deserializeGame,
  idxToCoord,
  type AiDifficulty,
  type CanonicalGameState,
  type Cell,
  type PlayerColor,
  type RekGame,
  type RuleSet,
} from '../lib/rek-engine'
import type { OnlineServerMessage } from '../shared/online-protocol'
import { getDefaultOnlineServerUrl } from './config'
import { LANGUAGE_LABELS, UI_COPY, type UiCopy, type UiLanguage } from './i18n'
import { RekOnlineClient } from './online'
import {
  clearOnlineSession,
  loadOnlineSession,
  saveOnlineSession,
} from './online-session'
import { sameReplayState } from './replay'
import {
  loadStoredMatch,
  saveStoredMatch,
  type StoredMatchType,
  type StoredMove,
} from './persistence'

type MatchType = StoredMatchType | 'ONLINE'
type AppView = 'home' | 'play' | 'online' | 'history' | 'settings'
type OnlineStatus =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'connected'
  | 'peer-left'
  | 'disconnected'
  | 'error'

const RULESETS: { id: RuleSet; label: string; note: string }[] = [
  { id: 'REK_STANDARD', label: 'Rek Standard', note: 'Rek + current Poat engine contract' },
  { id: 'MIN_REK_CHANH', label: 'Min Rek Chanh', note: 'Event-triggered Hao Rek contract' },
]

const DIFFICULTIES: AiDifficulty[] = ['easy', 'medium', 'hard']

type IconName =
  | 'temple'
  | 'naga'
  | 'lotus'
  | 'local'
  | 'ai'
  | 'online'
  | 'rules'
  | 'status'
  | 'undo'
  | 'reset'
  | 'save'
  | 'load'
  | 'replay'
  | 'spark'
  | 'crown'
  | 'home'
  | 'settings'

function UiIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'temple') return <svg {...common}><path d="M3 21h18M5 21v-7h14v7M7 14V9h10v5M9 9V5h6v4M12 3l2 2h-4l2-2Z"/><path d="M8 17h2m4 0h2"/></svg>
  if (name === 'naga') return <svg {...common}><path d="M5 18c2.2 2 5.3 1.4 6.6-.8 1.5-2.5-.7-4.5-2.5-3.7-2 .8-1.4 3.8.8 4.1 4.8.8 9.5-2 9.5-6.7 0-3-2.3-5.5-5.2-5.9"/><path d="M16.7 4.7 19 3l-.4 3 2.4.9-2.6 1.1.3 3-2.3-1.7"/></svg>
  if (name === 'lotus') return <svg {...common}><path d="M12 21c0-4-2.6-6.6-6.8-7 1.1 3.7 3.4 5.8 6.8 7Z"/><path d="M12 21c0-4 2.6-6.6 6.8-7-1.1 3.7-3.4 5.8-6.8 7Z"/><path d="M12 18c-3-2.2-3.6-5.4 0-9 3.6 3.6 3 6.8 0 9Z"/><path d="M12 12c-2.4-1.5-3.1-4.4-1.4-7 1 .8 1.4 1.6 1.4 2.8 0-1.2.4-2 1.4-2.8 1.7 2.6 1 5.5-1.4 7Z"/></svg>
  if (name === 'local') return <svg {...common}><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c.4-3.4 2.1-5 5-5s4.6 1.6 5 5M11 20c.4-3.4 2.1-5 5-5s4.6 1.6 5 5"/></svg>
  if (name === 'ai') return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="3"/><path d="M9 10h.01M15 10h.01M8 15h8M12 2v3"/></svg>
  if (name === 'online') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3Z"/></svg>
  if (name === 'rules') return <svg {...common}><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"/></svg>
  if (name === 'status') return <svg {...common}><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg>
  if (name === 'undo') return <svg {...common}><path d="m9 7-5 5 5 5"/><path d="M20 17a8 8 0 0 0-8-8H4"/></svg>
  if (name === 'reset') return <svg {...common}><path d="M20 6v5h-5"/><path d="M19 11a8 8 0 1 0 1 5"/></svg>
  if (name === 'save') return <svg {...common}><path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7"/></svg>
  if (name === 'load') return <svg {...common}><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M5 19h14"/></svg>
  if (name === 'replay') return <svg {...common}><path d="M4 11a8 8 0 1 1 2 6"/><path d="M4 5v6h6"/><path d="m10 9 6 3-6 3Z"/></svg>
  if (name === 'home') return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></svg>
  if (name === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
  if (name === 'spark') return <svg {...common}><path d="m12 2 1.5 5L18 9l-4.5 2L12 16l-1.5-5L6 9l4.5-2L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>
  return <svg {...common}><path d="m4 9 4 3 4-7 4 7 4-3-2 10H6L4 9Z"/><path d="M7 19h10"/></svg>
}

function PieceView({ piece }: { piece: NonNullable<Cell> }) {
  const side = piece.player === 'you' ? 'white' : 'black'
  return (
    <span className={`piece piece--${side} ${piece.king ? 'piece--king' : ''}`} aria-hidden="true">
      {piece.king ? '♚' : ''}
    </span>
  )
}

interface BoardProps {
  state: CanonicalGameState
  selected: number | null
  legalMoves: Set<number>
  disabled: boolean
  copy: UiCopy
  onSquareClick: (index: number) => void
}

function Board({ state, selected, legalMoves, disabled, copy, onSquareClick }: BoardProps) {
  return (
    <div className="board-shell">
      <div className="file-labels" aria-hidden="true">
        {'abcdefgh'.split('').map((file) => <span key={file}>{file}</span>)}
      </div>
      <div className="board-wrap">
        <div className="rank-labels" aria-hidden="true">
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => <span key={rank}>{rank}</span>)}
        </div>
        <div className={`board ${disabled ? 'board--disabled' : ''}`} role="grid" aria-label="Rek Khmer board">
          {state.board.map((piece, index) => {
            const coord = idxToCoord(index)
            const isSelected = selected === index
            const isLegal = legalMoves.has(index)
            const isLastMove = state.lastMove?.from === index || state.lastMove?.to === index
            const label = piece
              ? `${coord}: ${piece.player === 'you' ? copy.white : copy.black} ${piece.king ? copy.king : copy.man}`
              : `${coord}: ${copy.empty}`

            return (
              <button
                type="button"
                role="gridcell"
                disabled={disabled}
                className={[
                  'square',
                  isSelected ? 'square--selected' : '',
                  isLegal ? 'square--legal' : '',
                  isLastMove ? 'square--last' : '',
                ].filter(Boolean).join(' ')}
                aria-label={isLegal ? `${label}, ${copy.legalDestination}` : label}
                aria-pressed={isSelected}
                key={coord}
                data-coordinate={coord}
                onClick={() => onSquareClick(index)}
              >
                {piece ? <PieceView piece={piece} /> : null}
                {isLegal ? <span className="legal-dot" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function pieceCounts(board: Cell[]) {
  let you = 0
  let opp = 0
  for (const piece of board) {
    if (!piece) continue
    if (piece.player === 'you') you += 1
    else opp += 1
  }
  return { you, opp }
}

function buildReplayState(ruleset: RuleSet, moves: StoredMove[], ply: number): CanonicalGameState {
  const replay = createGame(ruleset)
  for (const move of moves.slice(0, ply)) {
    if (!replay.makeMove(move.from, move.to)) break
  }
  return replay.getState()
}


export function App() {
  const [savedOnlineSession] = useState(loadOnlineSession)
  const [view, setView] = useState<AppView>(savedOnlineSession ? 'online' : 'home')
  const [language, setLanguage] = useState<UiLanguage>('km')
  const [ruleset, setRuleset] = useState<RuleSet>('REK_STANDARD')
  const [matchType, setMatchType] = useState<MatchType>(
    savedOnlineSession ? 'ONLINE' : 'LOCAL',
  )
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium')
  const [game, setGame] = useState<RekGame>(() => createGame('REK_STANDARD'))
  const [state, setState] = useState<CanonicalGameState>(() => game.getState())
  const [selected, setSelected] = useState<number | null>(null)
  const [legalMoves, setLegalMoves] = useState<Set<number>>(new Set())
  const [aiThinking, setAiThinking] = useState(false)
  const [moveLog, setMoveLog] = useState<StoredMove[]>([])
  const [replayPly, setReplayPly] = useState<number | null>(null)
  const [storageMessage, setStorageMessage] = useState('')

  const [onlineClient, setOnlineClient] = useState<RekOnlineClient | null>(null)
  const [onlineUrl, setOnlineUrl] = useState(
    () => savedOnlineSession?.url ?? getDefaultOnlineServerUrl(),
  )
  const [roomInput, setRoomInput] = useState('')
  const [roomId, setRoomId] = useState(savedOnlineSession?.roomId ?? '')
  const [onlineResumeToken, setOnlineResumeToken] = useState(
    savedOnlineSession?.resumeToken ?? '',
  )
  const [onlineColor, setOnlineColor] = useState<PlayerColor | null>(null)
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>(
    savedOnlineSession ? 'disconnected' : 'idle',
  )
  const [onlineError, setOnlineError] = useState('')

  const copy = UI_COPY[language]
  const replayState = useMemo(
    () => replayPly === null ? null : buildReplayState(ruleset, moveLog, replayPly),
    [moveLog, replayPly, ruleset],
  )
  const displayState = replayState ?? state
  const counts = pieceCounts(displayState.board)
  const isReplaying = replayPly !== null
  const isAiTurn =
    !isReplaying &&
    matchType === 'VS_AI' &&
    state.status === 'playing' &&
    state.turn === 'opp'
  const canOnlineMove =
    matchType === 'ONLINE' &&
    onlineStatus === 'connected' &&
    onlineColor !== null &&
    state.status === 'playing' &&
    state.turn === onlineColor

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    return () => onlineClient?.close(true)
  }, [onlineClient])

  const clearSelection = () => {
    setSelected(null)
    setLegalMoves(new Set())
  }

  const syncState = () => {
    setState(game.getState())
    clearSelection()
  }

  const resetOnline = () => {
    onlineClient?.close(true)
    setOnlineClient(null)
    clearOnlineSession()
    setRoomId('')
    setRoomInput('')
    setOnlineResumeToken('')
    setOnlineColor(null)
    setOnlineStatus('idle')
    setOnlineError('')
  }

  const startFreshGame = (nextRuleset = ruleset, nextMatchType: MatchType = matchType) => {
    if (matchType === 'ONLINE' || nextMatchType !== 'ONLINE') resetOnline()

    const nextGame = createGame(nextRuleset)
    setRuleset(nextRuleset)
    setMatchType(nextMatchType)
    setGame(nextGame)
    setState(nextGame.getState())
    setAiThinking(false)
    setMoveLog([])
    setReplayPly(null)
    setStorageMessage('')
    clearSelection()
  }

  useEffect(() => {
    if (!isAiTurn) {
      setAiThinking(false)
      return
    }

    setAiThinking(true)
    const timer = window.setTimeout(() => {
      const current = game.getState()
      if (current.status !== 'playing' || current.turn !== 'opp') {
        setAiThinking(false)
        return
      }

      const move = chooseAiMoveForState(current, difficulty)
      if (move && game.makeMove(move.from, move.to)) {
        setMoveLog((moves) => [...moves, { from: move.from, to: move.to }])
      }
      setState(game.getState())
      setAiThinking(false)
      clearSelection()
    }, 280)

    return () => window.clearTimeout(timer)
  }, [difficulty, game, isAiTurn])

  const handleOnlineMessage = (message: OnlineServerMessage) => {
    if (message.type === 'error') {
      if (
        message.message === 'Room expired' ||
        message.message === 'Room not found' ||
        message.message === 'Invalid resume token'
      ) {
        clearOnlineSession()
        setRoomId('')
        setOnlineResumeToken('')
        setOnlineColor(null)
      }
      setOnlineStatus('error')
      setOnlineError(message.message)
      return
    }

    if (message.type === 'peer') {
      setOnlineStatus(message.status === 'joined' ? 'connected' : 'peer-left')
      return
    }

    const remoteGame = deserializeGame(message.snapshot)
    const remoteState = remoteGame.getState()
    setGame(remoteGame)
    setState(remoteState)
    setRuleset(remoteState.mode)
    setRoomId(message.roomId)
    setReplayPly(null)
    clearSelection()

    if (message.type === 'room') {
      setOnlineColor(message.color)
      setOnlineResumeToken(message.resumeToken)
      saveOnlineSession({
        version: 1,
        url: onlineUrl,
        roomId: message.roomId,
        resumeToken: message.resumeToken,
      })
      if (!message.resumed) setMoveLog([])
      setOnlineStatus(message.peerConnected ? 'connected' : 'waiting')
      return
    }

    setMoveLog((moves) => [...moves, message.move])
    setOnlineStatus('connected')
  }

  const connectOnline = (action: 'create' | 'join' | 'resume') => {
    if (action !== 'resume') resetOnline()
    else onlineClient?.close(true)

    setMatchType('ONLINE')
    setOnlineStatus('connecting')
    setOnlineError('')

    let client: RekOnlineClient
    client = new RekOnlineClient(onlineUrl, {
      onOpen: () => {
        if (action === 'create') client.create(ruleset)
        else if (action === 'join') client.join(roomInput)
        else client.resume(roomId, onlineResumeToken)
      },
      onMessage: handleOnlineMessage,
      onClose: () => {
        setOnlineClient((current) => current === client ? null : current)
        setOnlineStatus((current) => current === 'error' ? current : 'disconnected')
      },
    })
    setOnlineClient(client)
  }

  const openOnline = (action: 'create' | 'join') => connectOnline(action)
  const resumeOnline = () => {
    if (!roomId || !onlineResumeToken) return
    connectOnline('resume')
  }

  const handleSquareClick = (index: number) => {
    if (state.status !== 'playing' || isAiTurn || isReplaying) return
    if (matchType === 'ONLINE' && !canOnlineMove) return

    if (selected !== null && legalMoves.has(index)) {
      if (matchType === 'ONLINE') {
        if (onlineClient && roomId) onlineClient.move(roomId, selected, index)
        clearSelection()
        return
      }

      if (game.makeMove(selected, index)) {
        setMoveLog((moves) => [...moves, { from: selected, to: index }])
      }
      syncState()
      return
    }

    const piece = state.board[index]
    if (piece?.player === state.turn) {
      setSelected(index)
      setLegalMoves(new Set(game.getLegalMoves(index)))
      return
    }
    clearSelection()
  }

  const resetGame = () => startFreshGame()

  const undoMove = () => {
    if (!game.canUndo() || isReplaying || matchType === 'ONLINE') return

    let undone = 0
    if (matchType === 'LOCAL') {
      if (game.undo()) undone = 1
    } else {
      const current = game.getState()
      if (current.status === 'playing' && current.turn === 'opp') {
        if (game.undo()) undone = 1
      } else {
        if (game.undo()) undone += 1
        if (game.canUndo() && game.undo()) undone += 1
      }
    }

    if (undone > 0) setMoveLog((moves) => moves.slice(0, -undone))
    setAiThinking(false)
    syncState()
  }

  const saveMatch = () => {
    if (matchType === 'ONLINE') return
    try {
      saveStoredMatch({
        version: 1,
        snapshot: game.serialize(),
        ruleset,
        matchType,
        difficulty,
        language,
        moves: moveLog,
      })
      setStorageMessage(copy.saved)
    } catch {
      setStorageMessage(copy.storageError)
    }
  }

  const loadMatch = () => {
    if (matchType === 'ONLINE') return
    try {
      const stored = loadStoredMatch()
      if (!stored) {
        setStorageMessage(copy.noSavedGame)
        return
      }

      const loadedGame = deserializeGame(stored.snapshot)
      const loadedState = loadedGame.getState()
      if (loadedState.mode !== stored.ruleset) throw new Error('Saved ruleset mismatch')

      const rebuilt = buildReplayState(stored.ruleset, stored.moves, stored.moves.length)
      const replayMoves = sameReplayState(rebuilt, loadedState) ? stored.moves : []

      setLanguage(stored.language)
      setRuleset(stored.ruleset)
      setMatchType(stored.matchType)
      setDifficulty(stored.difficulty)
      setGame(loadedGame)
      setState(loadedState)
      setMoveLog(replayMoves)
      setReplayPly(null)
      setAiThinking(false)
      clearSelection()
      setStorageMessage(UI_COPY[stored.language].loaded)
    } catch {
      setStorageMessage(copy.storageError)
    }
  }

  const difficultyLabel = copy[difficulty]
  const turnLabel = displayState.turn === 'you' ? copy.white : copy.black
  const onlineStatusLabel = onlineStatus === 'connecting'
    ? copy.connecting
    : onlineStatus === 'waiting'
      ? copy.waitingOpponent
      : onlineStatus === 'connected'
        ? copy.opponentConnected
        : onlineStatus === 'peer-left'
          ? copy.opponentLeft
          : onlineStatus === 'disconnected'
            ? copy.disconnected
            : onlineStatus === 'error'
            ? `${copy.onlineError}: ${onlineError}`
            : copy.online

  const statusLabel = isReplaying
    ? `${copy.replayPosition} ${replayPly}/${moveLog.length}`
    : matchType === 'ONLINE' && onlineStatus !== 'connected'
      ? onlineStatusLabel
      : state.status === 'playing'
        ? aiThinking
          ? copy.aiThinking
          : matchType === 'VS_AI' && state.turn === 'opp'
            ? `${copy.aiToMove} · ${difficultyLabel}`
            : `${turnLabel} ${copy.toMove}`
        : state.status === 'draw'
          ? copy.draw
          : `${state.winner === 'you' ? copy.white : copy.black} ${copy.wins}`

  const boardDisabled =
    isAiTurn ||
    isReplaying ||
    (matchType === 'ONLINE' && !canOnlineMove)

  const navItems: { id: AppView; icon: IconName; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'play', icon: 'local', label: 'Play' },
    { id: 'online', icon: 'online', label: copy.online },
    { id: 'history', icon: 'replay', label: copy.history },
    { id: 'settings', icon: 'settings', label: copy.language },
  ]

  const openPlay = (nextMatch: MatchType, nextRuleset = ruleset) => {
    startFreshGame(nextRuleset, nextMatch)
    setView('play')
  }

  const pageTitle =
    view === 'home' ? 'រែកខ្មែរ' :
    view === 'play' ? (ruleset === 'REK_STANDARD' ? 'Rek Standard' : 'Min Rek Chanh') :
    view === 'online' ? copy.online :
    view === 'history' ? copy.history :
    copy.language

  return (
    <main className="app-shell ouk-shell ouk-app">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <header className="ouk-topbar">
        <button type="button" className="ouk-brand ouk-brand-button" onClick={() => setView('home')}>
          <span className="ouk-brandmark"><UiIcon name="temple" size={22} /></span>
          <span><strong>រែកខ្មែរ</strong><small>REK KHMER</small></span>
        </button>
        <div className="ouk-page-title">{pageTitle}</div>
        <div className="ouk-online-dot"><i /> {matchType === 'ONLINE' ? onlineStatusLabel : 'Dark Khmer UI'}</div>
      </header>

      <section className="ouk-page">
        {view === 'home' ? (
          <div className="ouk-home">
            <section className="ouk-hero-card kbach-frame">
              <div className="ouk-hero-copy">
                <p className="eyebrow">ល្បែងរែក · REK KHMER</p>
                <h1>រែកខ្មែរ</h1>
                <p>{copy.subtitle}</p>
              </div>
              <button type="button" className="ouk-primary-cta" onClick={() => { setMatchType('ONLINE'); setView('online') }}>
                <span className="cta-icon"><UiIcon name="online" size={24} /></span>
                <span><strong>{copy.online}</strong><small>{copy.createRoom} / {copy.joinRoom}</small></span>
                <span>›</span>
              </button>
            </section>

            <div className="ouk-section-head"><span><UiIcon name="spark" size={15} /> Game modes</span></div>
            <div className="ouk-mode-grid">
              <button type="button" className="ouk-mode-card" onClick={() => openPlay('VS_AI')}>
                <span className="ouk-card-icon"><UiIcon name="ai" size={22} /></span>
                <span><strong>{copy.vsAi}</strong><small>{copy.easy} · {copy.medium} · {copy.hard}</small></span>
              </button>
              <button type="button" className="ouk-mode-card" onClick={() => openPlay('LOCAL')}>
                <span className="ouk-card-icon"><UiIcon name="local" size={22} /></span>
                <span><strong>{copy.local}</strong><small>{copy.localHint}</small></span>
              </button>
            </div>

            <div className="ouk-section-head"><span><UiIcon name="rules" size={15} /> {copy.ruleset}</span></div>
            <div className="ouk-rules-grid">
              {RULESETS.map((item) => (
                <button key={item.id} type="button" className={`ouk-rule-card ${ruleset === item.id ? 'is-selected' : ''}`} onClick={() => { setRuleset(item.id); openPlay(matchType === 'ONLINE' ? 'LOCAL' : matchType, item.id) }}>
                  <span className="ouk-card-icon"><UiIcon name={item.id === 'REK_STANDARD' ? 'temple' : 'naga'} size={22} /></span>
                  <span><strong>{item.label}</strong><small>{item.note}</small></span>
                </button>
              ))}
            </div>

            <section className="ouk-wisdom-card">
              <span className="ouk-card-icon"><UiIcon name="lotus" size={24} /></span>
              <div><small>Khmer heritage</small><strong>Rek · Poat · Hao Rek</strong><p>Traditional identity, evidence-labeled rules, canonical Rek engine.</p></div>
            </section>
          </div>
        ) : null}

        {view === 'online' ? (
          <div className="ouk-stack">
            <section className="ouk-page-card">
              <div className="ouk-section-head compact"><span><UiIcon name="online" size={15} /> {copy.online}</span><b>{onlineStatusLabel}</b></div>
              <label className="ouk-field"><span>{copy.server}</span><input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} spellCheck={false} /></label>
            </section>

            <section className="ouk-page-card">
              <div className="ouk-step-head"><span>1</span><strong>{copy.ruleset}</strong></div>
              <div className="ouk-segment-grid">
                {RULESETS.map((item) => (
                  <button type="button" key={item.id} className={ruleset === item.id ? 'active' : ''} disabled={!!roomId} onClick={() => setRuleset(item.id)}>{item.label}</button>
                ))}
              </div>
            </section>

            <section className="ouk-page-card">
              <div className="ouk-step-head"><span>2</span><strong>Room</strong></div>
              <div className="ouk-online-actions">
                <button type="button" className="ouk-action-primary" onClick={() => openOnline('create')}><UiIcon name="online" /> {copy.createRoom}</button>
                <div className="ouk-join-row">
                  <input value={roomInput} onChange={(e) => setRoomInput(e.target.value.toUpperCase())} placeholder={copy.roomCode} maxLength={6} />
                  <button type="button" onClick={() => openOnline('join')} disabled={roomInput.trim().length !== 6}>{copy.joinRoom}</button>
                </div>
                {roomId ? <div className="ouk-room-pill"><span>{copy.roomCode}</span><strong>{roomId}</strong></div> : null}
                {onlineStatus === 'disconnected' && roomId && onlineResumeToken ? <button type="button" className="ouk-action-secondary" onClick={resumeOnline}>{copy.reconnect}</button> : null}
              </div>
            </section>

            <section className="ouk-page-card ouk-online-status-card">
              <div><span>{copy.status}</span><strong>{onlineStatusLabel}</strong></div>
              <div><span>{copy.onlineAs}</span><strong>{onlineColor ? (onlineColor === 'you' ? copy.white : copy.black) : '—'}</strong></div>
              <button type="button" className="ouk-action-primary" disabled={onlineStatus !== 'connected'} onClick={() => setView('play')}>Enter board</button>
            </section>
          </div>
        ) : null}

        {view === 'history' ? (
          <div className="ouk-stack">
            <section className="ouk-page-card">
              <div className="ouk-section-head compact"><span><UiIcon name="replay" size={15} /> {copy.history}</span><b>{moveLog.length} {copy.moves}</b></div>
              {moveLog.length === 0 ? <p className="ouk-empty">No moves yet.</p> : (
                <ol className="ouk-history-list">
                  {moveLog.map((move, index) => (
                    <li key={index}><span className="ouk-card-icon"><UiIcon name="replay" size={16} /></span><span><strong>Move {index + 1}</strong><small>{idxToCoord(move.from)} → {idxToCoord(move.to)}</small></span></li>
                  ))}
                </ol>
              )}
            </section>
            <button type="button" className="ouk-action-primary" disabled={!moveLog.length} onClick={() => { setReplayPly(0); setView('play') }}>{copy.replay}</button>
          </div>
        ) : null}

        {view === 'settings' ? (
          <div className="ouk-stack">
            <section className="ouk-page-card">
              <div className="ouk-section-head compact"><span><UiIcon name="settings" size={15} /> {copy.language}</span></div>
              <div className="ouk-segment-grid">
                {(Object.keys(LANGUAGE_LABELS) as UiLanguage[]).map((item) => (
                  <button type="button" key={item} className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>{LANGUAGE_LABELS[item]}</button>
                ))}
              </div>
            </section>
            <section className="ouk-page-card">
              <div className="ouk-section-head compact"><span><UiIcon name="rules" size={15} /> {copy.ruleset}</span></div>
              <div className="ouk-rules-list">
                {RULESETS.map((item) => (
                  <button type="button" key={item.id} className={ruleset === item.id ? 'is-selected' : ''} onClick={() => startFreshGame(item.id, matchType === 'ONLINE' ? 'LOCAL' : matchType)}>
                    <span className="ouk-card-icon"><UiIcon name={item.id === 'REK_STANDARD' ? 'temple' : 'naga'} /></span>
                    <span><strong>{item.label}</strong><small>{item.note}</small></span>
                  </button>
                ))}
              </div>
            </section>
            <section className="ouk-page-card">
              <div className="ouk-section-head compact"><span><UiIcon name="ai" size={15} /> {copy.aiDifficulty}</span></div>
              <div className="ouk-segment-grid">
                {DIFFICULTIES.map((item) => <button type="button" key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}>{copy[item]}</button>)}
              </div>
            </section>
            <section className="ouk-page-card ouk-dark-default"><span className="ouk-card-icon"><UiIcon name="spark" /></span><div><strong>Dark theme</strong><small>Default presentation, matching the Ouk shell direction.</small></div><b>ON</b></section>
          </div>
        ) : null}

        {view === 'play' ? (
          <div className="ouk-play">
            <section className="ouk-player-strip">
              <div><span className="ouk-avatar black"><UiIcon name="crown" /></span><span><small>{copy.black}</small><strong>{counts.opp} pieces</strong></span></div>
              <div className={`ouk-turn-badge ${displayState.turn === 'opp' ? 'active' : ''}`}>{displayState.turn === 'opp' ? statusLabel : ruleset}</div>
            </section>

            <section className="board-card ouk-board-card">
              <div className="board-card__head">
                <div><span className="panel-label"><UiIcon name="temple" size={14} /> {matchType === 'LOCAL' ? copy.localBoardLabel : matchType === 'VS_AI' ? `${copy.vsAiBoardLabel} · ${difficultyLabel}` : `${copy.online} · ${roomId || '—'}`}</span><h2>{ruleset === 'REK_STANDARD' ? 'Rek Standard' : 'Min Rek Chanh'}</h2></div>
                <span className={`turn-chip ${displayState.status !== 'playing' ? 'turn-chip--finished' : ''}`}><UiIcon name="crown" size={15} />{statusLabel}</span>
              </div>
              <Board state={displayState} selected={isReplaying ? null : selected} legalMoves={isReplaying ? new Set() : legalMoves} disabled={boardDisabled} copy={copy} onSquareClick={handleSquareClick} />
              {isReplaying ? (
                <div className="replay-bar">
                  <button type="button" className="action-button" onClick={() => setReplayPly((ply) => Math.max(0, (ply ?? 0) - 1))} disabled={replayPly === 0}>{copy.previous}</button>
                  <span>{copy.replayPosition} {replayPly}/{moveLog.length}</span>
                  <button type="button" className="action-button" onClick={() => setReplayPly((ply) => Math.min(moveLog.length, (ply ?? 0) + 1))} disabled={replayPly === moveLog.length}>{copy.next}</button>
                  <button type="button" className="action-button replay-exit" onClick={() => setReplayPly(null)}>{copy.exitReplay}</button>
                </div>
              ) : null}
            </section>

            <section className="ouk-player-strip you">
              <div><span className="ouk-avatar white"><UiIcon name="crown" /></span><span><small>{copy.white}</small><strong>{counts.you} pieces</strong></span></div>
              <div className={`ouk-turn-badge ${displayState.turn === 'you' ? 'active' : ''}`}>{displayState.turn === 'you' ? statusLabel : copy.status}</div>
            </section>

            <section className="ouk-game-actions">
              {matchType !== 'ONLINE' ? <button type="button" onClick={undoMove} disabled={!game.canUndo() || aiThinking || isReplaying}><UiIcon name="undo" />{copy.undo}</button> : null}
              <button type="button" onClick={resetGame}><UiIcon name="reset" />{copy.reset}</button>
              {matchType !== 'ONLINE' ? <button type="button" onClick={saveMatch}><UiIcon name="save" />{copy.save}</button> : null}
              {matchType !== 'ONLINE' ? <button type="button" onClick={loadMatch}><UiIcon name="load" />{copy.load}</button> : null}
            </section>

            {storageMessage ? <p className="storage-note">{storageMessage}</p> : null}
            {state.winReason && !isReplaying ? <p className="result-note">{state.winReason}</p> : null}
          </div>
        ) : null}
      </section>

      <nav className="ouk-bottom-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button type="button" key={item.id} className={view === item.id ? 'ouk-nav-item ouk-nav-item--active' : 'ouk-nav-item'} onClick={() => setView(item.id)}>
            <UiIcon name={item.icon} /><span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}
