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
import { clearOnlineSession, loadOnlineSession, saveOnlineSession } from './online-session'
import { sameReplayState } from './replay'
import {
  loadStoredMatch,
  saveStoredMatch,
  type StoredMatchType,
  type StoredMove,
} from './persistence'

type MatchType = StoredMatchType | 'ONLINE'
type PlayChoice = 'VS_AI' | 'LOCAL' | 'ONLINE'
type AppView = 'home' | 'modes' | 'play' | 'online' | 'settings'
type OnlineStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'peer-left' | 'disconnected' | 'error'

const RULESETS: { id: RuleSet; label: string; khmer: string; note: string }[] = [
  { id: 'REK_STANDARD', label: 'Rek Standard', khmer: 'រែកទូទៅ', note: 'Flanking two enemy pieces on opposite sides forces a capture.' },
  { id: 'MIN_REK_CHANH', label: 'Min Rek Chanh', khmer: 'មិនរែកចាញ់', note: 'Uses the Min Rek Chanh event-triggered Hao Rek contract.' },
]
const DIFFICULTIES: AiDifficulty[] = ['easy', 'medium', 'hard']

type IconName = 'home' | 'play' | 'settings' | 'ai' | 'local' | 'online' | 'back' | 'help' | 'rules' | 'undo' | 'reset' | 'more' | 'save' | 'load' | 'replay' | 'copy' | 'share' | 'crown' | 'status'

function UiIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'home') return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></svg>
  if (name === 'play') return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>
  if (name === 'settings') return <svg {...common}><path d="M4 7h10M18 7h2M10 17h10M4 17h2M14 4v6M8 14v6"/></svg>
  if (name === 'ai') return <svg {...common}><rect x="4" y="6" width="16" height="13" rx="3"/><path d="M9 11h.01M15 11h.01M8 15h8M12 3v3"/></svg>
  if (name === 'local') return <svg {...common}><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c.5-3.3 2.2-5 5-5s4.5 1.7 5 5M11 20c.5-3.3 2.2-5 5-5s4.5 1.7 5 5"/></svg>
  if (name === 'online') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z"/></svg>
  if (name === 'back') return <svg {...common}><path d="m15 18-6-6 6-6"/></svg>
  if (name === 'help') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.01"/></svg>
  if (name === 'rules') return <svg {...common}><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>
  if (name === 'undo') return <svg {...common}><path d="m9 7-5 5 5 5"/><path d="M20 17a8 8 0 0 0-8-8H4"/></svg>
  if (name === 'reset') return <svg {...common}><path d="M20 6v5h-5"/><path d="M19 11a8 8 0 1 0 1 5"/></svg>
  if (name === 'more') return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>
  if (name === 'save') return <svg {...common}><path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7"/></svg>
  if (name === 'load') return <svg {...common}><path d="M12 3v12m0 0-4-4m4 4 4-4M5 20h14"/></svg>
  if (name === 'replay') return <svg {...common}><path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/><path d="m10 9 6 3-6 3Z"/></svg>
  if (name === 'copy') return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
  if (name === 'share') return <svg {...common}><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></svg>
  if (name === 'crown') return <svg {...common}><path d="m4 9 4 3 4-7 4 7 4-3-2 10H6L4 9Z"/><path d="M7 19h10"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
}

function PieceView({ piece }: { piece: NonNullable<Cell> }) {
  const side = piece.player === 'you' ? 'white' : 'black'
  return <span className={`piece piece--${side} ${piece.king ? 'piece--king' : ''}`} aria-hidden="true">{piece.king ? <UiIcon name="crown" size={18}/> : <span className="piece-core" />}</span>
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
      <div className="board-wrap">
        <div className={`board ${disabled ? 'board--disabled' : ''}`} role="grid" aria-label="Rek Khmer board">
          {state.board.map((piece, index) => {
            const coord = idxToCoord(index)
            const isSelected = selected === index
            const isLegal = legalMoves.has(index)
            const isLastMove = state.lastMove?.from === index || state.lastMove?.to === index
            const label = piece ? `${coord}: ${piece.player === 'you' ? copy.white : copy.black} ${piece.king ? copy.king : copy.man}` : `${coord}: ${copy.empty}`
            return (
              <button
                type="button"
                role="gridcell"
                disabled={disabled}
                className={['square', isSelected ? 'square--selected' : '', isLegal ? 'square--legal' : '', isLastMove ? 'square--last' : ''].filter(Boolean).join(' ')}
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
        {state.lastRek && state.lastMove ? (() => {
          const landing = state.lastMove.to
          const row = Math.floor(landing / 8)
          const col = landing % 8
          const aligned = state.lastCaptured.filter((idx) => Math.floor(idx / 8) === row || idx % 8 === col)
          const horizontal = aligned.filter((idx) => Math.floor(idx / 8) === row)
          const vertical = aligned.filter((idx) => idx % 8 === col)
          if (horizontal.length >= 2) {
            const cols = horizontal.map((idx) => idx % 8)
            const min = Math.min(...cols, col)
            const max = Math.max(...cols, col)
            return <span className="rek-ray rek-ray--h" style={{ left: `${(min + .5) * 12.5}%`, top: `${(row + .5) * 12.5}%`, width: `${(max - min) * 12.5}%` }} />
          }
          if (vertical.length >= 2) {
            const rows = vertical.map((idx) => Math.floor(idx / 8))
            const min = Math.min(...rows, row)
            const max = Math.max(...rows, row)
            return <span className="rek-ray rek-ray--v" style={{ top: `${(min + .5) * 12.5}%`, left: `${(col + .5) * 12.5}%`, height: `${(max - min) * 12.5}%` }} />
          }
          return null
        })() : null}
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
  const [matchType, setMatchType] = useState<MatchType>(savedOnlineSession ? 'ONLINE' : 'LOCAL')
  const [pendingMatch, setPendingMatch] = useState<PlayChoice>('VS_AI')
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium')
  const [game, setGame] = useState<RekGame>(() => createGame('REK_STANDARD'))
  const [state, setState] = useState<CanonicalGameState>(() => game.getState())
  const [selected, setSelected] = useState<number | null>(null)
  const [legalMoves, setLegalMoves] = useState<Set<number>>(new Set())
  const [aiThinking, setAiThinking] = useState(false)
  const [moveLog, setMoveLog] = useState<StoredMove[]>([])
  const [replayPly, setReplayPly] = useState<number | null>(null)
  const [storageMessage, setStorageMessage] = useState('')
  const [showMore, setShowMore] = useState(false)

  const [onlineClient, setOnlineClient] = useState<RekOnlineClient | null>(null)
  const [onlineUrl] = useState(() => savedOnlineSession?.url ?? getDefaultOnlineServerUrl())
  const [roomInput, setRoomInput] = useState('')
  const [roomId, setRoomId] = useState(savedOnlineSession?.roomId ?? '')
  const [onlineResumeToken, setOnlineResumeToken] = useState(savedOnlineSession?.resumeToken ?? '')
  const [onlineColor, setOnlineColor] = useState<PlayerColor | null>(null)
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>(savedOnlineSession ? 'disconnected' : 'idle')
  const [onlineError, setOnlineError] = useState('')

  const copy = UI_COPY[language]
  const replayState = useMemo(() => replayPly === null ? null : buildReplayState(ruleset, moveLog, replayPly), [moveLog, replayPly, ruleset])
  const displayState = replayState ?? state
  const counts = pieceCounts(displayState.board)
  const isReplaying = replayPly !== null
  const isAiTurn = !isReplaying && matchType === 'VS_AI' && state.status === 'playing' && state.turn === 'opp'
  const canOnlineMove = matchType === 'ONLINE' && onlineStatus === 'connected' && onlineColor !== null && state.status === 'playing' && state.turn === onlineColor

  useEffect(() => { document.documentElement.lang = language }, [language])
  useEffect(() => () => onlineClient?.close(true), [onlineClient])

  const clearSelection = () => { setSelected(null); setLegalMoves(new Set()) }
  const syncState = () => { setState(game.getState()); clearSelection() }

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
    setShowMore(false)
    clearSelection()
  }

  useEffect(() => {
    if (!isAiTurn) { setAiThinking(false); return }
    setAiThinking(true)
    const timer = window.setTimeout(() => {
      const current = game.getState()
      if (current.status !== 'playing' || current.turn !== 'opp') { setAiThinking(false); return }
      const move = chooseAiMoveForState(current, difficulty)
      if (move && game.makeMove(move.from, move.to)) setMoveLog((moves) => [...moves, { from: move.from, to: move.to }])
      setState(game.getState())
      setAiThinking(false)
      clearSelection()
    }, 280)
    return () => window.clearTimeout(timer)
  }, [difficulty, game, isAiTurn])

  const handleOnlineMessage = (message: OnlineServerMessage) => {
    if (message.type === 'error') {
      if (message.message === 'Room expired' || message.message === 'Room not found' || message.message === 'Invalid resume token') {
        clearOnlineSession(); setRoomId(''); setOnlineResumeToken(''); setOnlineColor(null)
      }
      setOnlineStatus('error'); setOnlineError(message.message); return
    }
    if (message.type === 'peer') { setOnlineStatus(message.status === 'joined' ? 'connected' : 'peer-left'); return }
    const remoteGame = deserializeGame(message.snapshot)
    const remoteState = remoteGame.getState()
    setGame(remoteGame); setState(remoteState); setRuleset(remoteState.mode); setRoomId(message.roomId); setReplayPly(null); clearSelection()
    if (message.type === 'room') {
      setOnlineColor(message.color)
      setOnlineResumeToken(message.resumeToken)
      saveOnlineSession({ version: 1, url: onlineUrl, roomId: message.roomId, resumeToken: message.resumeToken })
      if (!message.resumed) setMoveLog([])
      setOnlineStatus(message.peerConnected ? 'connected' : 'waiting')
      return
    }
    setMoveLog((moves) => [...moves, message.move])
    setOnlineStatus('connected')
  }

  const connectOnline = (action: 'create' | 'join' | 'resume') => {
    if (action !== 'resume') resetOnline(); else onlineClient?.close(true)
    setMatchType('ONLINE'); setOnlineStatus('connecting'); setOnlineError('')
    let client: RekOnlineClient
    client = new RekOnlineClient(onlineUrl, {
      onOpen: () => { if (action === 'create') client.create(ruleset); else if (action === 'join') client.join(roomInput); else client.resume(roomId, onlineResumeToken) },
      onMessage: handleOnlineMessage,
      onClose: () => { setOnlineClient((current) => current === client ? null : current); setOnlineStatus((current) => current === 'error' ? current : 'disconnected') },
    })
    setOnlineClient(client)
  }

  const handleSquareClick = (index: number) => {
    if (state.status !== 'playing' || isAiTurn || isReplaying) return
    if (matchType === 'ONLINE' && !canOnlineMove) return
    if (selected !== null && legalMoves.has(index)) {
      if (matchType === 'ONLINE') { if (onlineClient && roomId) onlineClient.move(roomId, selected, index); clearSelection(); return }
      if (game.makeMove(selected, index)) setMoveLog((moves) => [...moves, { from: selected, to: index }])
      syncState(); return
    }
    const piece = state.board[index]
    if (piece?.player === state.turn) { setSelected(index); setLegalMoves(new Set(game.getLegalMoves(index))); return }
    clearSelection()
  }

  const undoMove = () => {
    if (!game.canUndo() || isReplaying || matchType === 'ONLINE') return
    let undone = 0
    if (matchType === 'LOCAL') { if (game.undo()) undone = 1 }
    else {
      const current = game.getState()
      if (current.status === 'playing' && current.turn === 'opp') { if (game.undo()) undone = 1 }
      else { if (game.undo()) undone += 1; if (game.canUndo() && game.undo()) undone += 1 }
    }
    if (undone > 0) setMoveLog((moves) => moves.slice(0, -undone))
    setAiThinking(false); syncState()
  }

  const saveMatch = () => {
    if (matchType === 'ONLINE') return
    try {
      saveStoredMatch({ version: 1, snapshot: game.serialize(), ruleset, matchType, difficulty, language, moves: moveLog })
      setStorageMessage(copy.saved)
    } catch { setStorageMessage(copy.storageError) }
  }

  const loadMatch = () => {
    if (matchType === 'ONLINE') return
    try {
      const stored = loadStoredMatch()
      if (!stored) { setStorageMessage(copy.noSavedGame); return }
      const loadedGame = deserializeGame(stored.snapshot)
      const loadedState = loadedGame.getState()
      if (loadedState.mode !== stored.ruleset) throw new Error('Saved ruleset mismatch')
      const rebuilt = buildReplayState(stored.ruleset, stored.moves, stored.moves.length)
      const replayMoves = sameReplayState(rebuilt, loadedState) ? stored.moves : []
      setLanguage(stored.language); setRuleset(stored.ruleset); setMatchType(stored.matchType); setDifficulty(stored.difficulty)
      setGame(loadedGame); setState(loadedState); setMoveLog(replayMoves); setReplayPly(null); setAiThinking(false); clearSelection()
      setStorageMessage(UI_COPY[stored.language].loaded)
    } catch { setStorageMessage(copy.storageError) }
  }

  const difficultyLabel = copy[difficulty]
  const turnLabel = displayState.turn === 'you' ? copy.white : copy.black
  const onlineStatusLabel = onlineStatus === 'connecting' ? copy.connecting : onlineStatus === 'waiting' ? copy.waitingOpponent : onlineStatus === 'connected' ? copy.opponentConnected : onlineStatus === 'peer-left' ? copy.opponentLeft : onlineStatus === 'disconnected' ? copy.disconnected : onlineStatus === 'error' ? `${copy.onlineError}: ${onlineError}` : copy.online
  const statusLabel = isReplaying ? `${copy.replayPosition} ${replayPly}/${moveLog.length}` : matchType === 'ONLINE' && onlineStatus !== 'connected' ? onlineStatusLabel : state.status === 'playing' ? aiThinking ? copy.aiThinking : matchType === 'VS_AI' && state.turn === 'opp' ? `${copy.aiToMove} · ${difficultyLabel}` : `${turnLabel} ${copy.toMove}` : state.status === 'draw' ? copy.draw : `${state.winner === 'you' ? copy.white : copy.black} ${copy.wins}`
  const boardDisabled = isAiTurn || isReplaying || (matchType === 'ONLINE' && !canOnlineMove)
  const rulesetInfo = RULESETS.find((item) => item.id === ruleset)!

  const chooseMode = (next: PlayChoice) => { setPendingMatch(next); if (next === 'ONLINE') setView('online'); else setView('modes') }
  const startSelectedMode = () => { if (pendingMatch === 'ONLINE') { setView('online'); return }; startFreshGame(ruleset, pendingMatch); setView('play') }
  const goBack = () => setView(view === 'play' || view === 'online' ? 'modes' : 'home')

  return (
    <main className={`app-shell ouk-shell ouk-app stitch-app stitch-view-${view}`}>
      <header className="st-topbar">
        <button type="button" className="st-brand" onClick={() => setView('home')}>
          <img src="/art/rek-logo.png" alt="REK KHMER" />
          <span><strong>REK KHMER</strong><small>ល្បែងរែក</small></span>
        </button>
        <button type="button" className="st-profile" aria-label="Settings" onClick={() => setView('settings')}><span>♙</span></button>
      </header>

      <section className="st-page">
        {view === 'home' ? (
          <div className="st-home">
            <section className="st-home-brand-card">
              <img src="/art/rek-logo.png" alt="" />
              <div><h1>REK KHMER <b>ល្បែងរែក</b></h1><p>Cozy Tabletop Strategy</p></div>
              <button type="button" onClick={() => setView('settings')} aria-label="Settings"><UiIcon name="settings" /></button>
            </section>

            <section className="st-preview-card" aria-label="Rek board preview">
              <div className="st-preview-board">
                {Array.from({ length: 16 }, (_, index) => <span key={index} className={`st-preview-square ${(Math.floor(index / 4) + index) % 2 ? 'alt' : ''}`}>
                  {index === 0 || index === 2 ? <i className="st-preview-piece jade">✦</i> : null}
                  {index === 10 || index === 12 || index === 15 ? <i className={`st-preview-piece gold ${index === 10 ? 'selected' : ''}`}>✧</i> : null}
                  {index === 5 || index === 6 || index === 9 ? <i className="st-preview-dot" /> : null}
                </span>)}
              </div>
              <p><span>◌</span> Traditional alignment &amp; capture game</p>
            </section>

            <button type="button" className="st-play-hero" onClick={() => setView('modes')}><span>▶</span> PLAY <small>(លេង)</small></button>

            <section className="st-mode-rows">
              <button type="button" onClick={() => chooseMode('VS_AI')}><i className="gold"><UiIcon name="ai" /></i><span><strong>VS AI <b>លេងជាមួយ AI</b></strong><small>Practice solo with 3 levels</small></span><em>›</em></button>
              <button type="button" onClick={() => chooseMode('LOCAL')}><i className="jade"><UiIcon name="local" /></i><span><strong>LOCAL <b>លេងពីរនាក់</b></strong><small>Pass &amp; play on one device</small></span><em>›</em></button>
              <button type="button" onClick={() => chooseMode('ONLINE')}><i className="mint"><UiIcon name="online" /></i><span><strong>ONLINE <b>លេងតាមអនឡាញ</b></strong><small>Play with friends or create a room</small></span><em>›</em></button>
            </section>
            <p className="st-mindful">◌ ល្បែងកម្សាន្តបែបស្ងប់ស្ងាត់ · MINDFUL PLAY ◌</p>
          </div>
        ) : null}

        {view === 'modes' ? (
          <div className="st-modes">
            <div className="st-page-heading"><button type="button" onClick={goBack}><UiIcon name="back" size={28}/></button><div><h1>Choose Mode</h1><p>ជ្រើសរើសរបៀបលេង</p></div><button type="button"><UiIcon name="help" /></button></div>
            <section className="st-intro-card"><div className="st-intro-art"><img src="/art/rek-logo.png" alt="" /></div><div><p><b>TRADITIONAL CHESS</b> <span>● Classic Board</span></p><h2>Ready your stones</h2><small>Flank opposing tokens to trigger a Rek capture.</small></div></section>
            <div className="st-section-title"><h2>GAME MODE</h2><span>កម្រិតលេង</span></div>
            <section className="st-mode-picker">
              <button type="button" className={pendingMatch === 'VS_AI' ? 'selected' : ''} onClick={() => setPendingMatch('VS_AI')}><i><UiIcon name="ai" size={28}/></i><span><strong>VS AI <b>Popular</b></strong><small>លេងជាមួយ AI · Offline Singleplayer</small></span><em>{pendingMatch === 'VS_AI' ? '✓' : '›'}</em></button>
              {pendingMatch === 'VS_AI' ? <div className="st-difficulty"><header><span>DIFFICULTY · កម្រិតលំបាក</span><b>{difficultyLabel} AI</b></header><div>{DIFFICULTIES.map((item) => <button type="button" key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}><b>{item === 'easy' ? '☆' : item === 'medium' ? '☆☆' : '☆☆☆'}</b><strong>{copy[item]}</strong><small>{item === 'easy' ? 'ងាយ' : item === 'medium' ? 'មធ្យម' : 'ពិបាក'}</small></button>)}</div></div> : null}
              <button type="button" className={pendingMatch === 'LOCAL' ? 'selected' : ''} onClick={() => setPendingMatch('LOCAL')}><i><UiIcon name="local" size={28}/></i><span><strong>LOCAL <b>Same Device</b></strong><small>លេងពីរនាក់ · Pass &amp; Play tabletop</small></span><em>{pendingMatch === 'LOCAL' ? '✓' : '›'}</em></button>
              <button type="button" className={pendingMatch === 'ONLINE' ? 'selected' : ''} onClick={() => setPendingMatch('ONLINE')}><i><UiIcon name="online" size={28}/></i><span><strong>ONLINE <b>Room</b></strong><small>លេងតាមអនឡាញ · Private rooms &amp; friends</small></span><em>{pendingMatch === 'ONLINE' ? '✓' : '›'}</em></button>
            </section>
            <section className="st-rules-card"><header><h2><UiIcon name="rules" /> Ruleset Options</h2><span>ជម្រើសច្បាប់</span></header><div className="st-rule-tabs">{RULESETS.map((item) => <button type="button" key={item.id} className={ruleset === item.id ? 'active' : ''} onClick={() => setRuleset(item.id)}>{item.label}</button>)}</div><p>◉ <b>{rulesetInfo.label}:</b> {rulesetInfo.note}</p></section>
            <button type="button" className="st-start" onClick={startSelectedMode}>▷ START GAME <small>(ចាប់ផ្តើមលេង)</small></button>
          </div>
        ) : null}

        {view === 'online' ? (
          <div className="st-online">
            <div className="st-page-heading online"><button type="button" onClick={goBack}><UiIcon name="back" size={28}/></button><div><h1>Online Match</h1><p>លេងតាមអនឡាញ</p></div><span className={`st-connect ${onlineStatus === 'connected' ? 'ok' : ''}`}>● {onlineStatusLabel}</span></div>
            <div className="st-mode-pill">🎮 {rulesetInfo.label} · 1v1 Mode</div>
            <section className="st-online-card host"><header><i>＋</i><div><h2>Create Room</h2><p>បង្កើតបន្ទប់ថ្មី</p></div><b>Host</b></header>{roomId ? <div className="st-room-box"><small>ROOM CODE (លេខបន្ទប់)</small><strong>{roomId}</strong><div><button type="button" onClick={() => navigator.clipboard?.writeText(roomId)}><UiIcon name="copy"/> Copy Code</button><button type="button" aria-label="Share"><UiIcon name="share"/></button></div></div> : <button type="button" className="st-create-room" onClick={() => connectOnline('create')}>Create New Room</button>}<div className="st-waiting">◉ <span>{onlineStatus === 'connected' ? 'Opponent connected' : onlineStatus === 'connecting' ? 'Connecting…' : 'Waiting for opponent to join…'}<small>{onlineError || 'កំពុងរង់ចាំគូប្រកួត…'}</small></span></div>{onlineStatus === 'disconnected' && roomId && onlineResumeToken ? <button type="button" className="st-link-button" onClick={() => connectOnline('resume')}>Reconnect room</button> : null}</section>
            <section className="st-online-card join"><header><i><UiIcon name="local"/></i><div><h2>Join Room</h2><p>ចូលរួមបន្ទប់</p></div><b>Guest</b></header><label>Enter 6-digit room code<input value={roomInput} onChange={(e) => setRoomInput(e.target.value.toUpperCase())} placeholder="E.G. 842 OR REK-842" maxLength={12}/></label><button type="button" className="st-start" onClick={() => connectOnline('join')} disabled={roomInput.trim().length < 6}>Join Match <small>(ចូលលេង)</small> →</button></section>
            {onlineStatus === 'connected' ? <button type="button" className="st-enter-board" onClick={() => setView('play')}>Enter board →</button> : null}
          </div>
        ) : null}

        {view === 'settings' ? (
          <div className="st-settings">
            <div className="st-settings-title"><i><UiIcon name="settings" /></i><div><h1>Settings</h1><p>ការកំណត់</p></div><span>v1.0.0</span></div>
            <section className="st-settings-intro"><img src="/art/rek-logo.png" alt=""/><div><h2>Custom Board Experience</h2><p>Configure classic Khmer rules and AI level for peaceful tabletop matches.</p></div></section>
            <section className="st-setting-card"><header><h2>⚖ Game Ruleset</h2><span>ច្បាប់ល្បែង</span></header><div className="st-setting-tabs">{RULESETS.map((item) => <button type="button" key={item.id} className={ruleset === item.id ? 'active' : ''} onClick={() => setRuleset(item.id)}><b>{item.label}</b><small>{item.khmer}</small></button>)}</div><p>💡 <b>{rulesetInfo.label}:</b> {rulesetInfo.note}</p></section>
            <section className="st-setting-card"><header><h2>⚙ Default AI Level</h2><span>កម្រិត AI</span></header><div className="st-ai-tabs">{DIFFICULTIES.map((item) => <button type="button" key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}><b>{item === 'easy' ? '♟' : item === 'medium' ? '♞' : '⚔'}</b><strong>{copy[item]}</strong><small>{item === 'easy' ? 'ងាយ' : item === 'medium' ? 'មធ្យម' : 'ពិបាក'}</small></button>)}</div></section>
            <section className="st-setting-card"><header><h2>文 Language</h2><span>ភាសា</span></header><div className="st-lang-tabs">{(Object.keys(LANGUAGE_LABELS) as UiLanguage[]).map((item) => <button type="button" key={item} className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}><span>{item === 'km' ? '🇰🇭' : '🇬🇧'}</span><b>{LANGUAGE_LABELS[item]}</b></button>)}</div></section>
            <section className="st-about"><h2>ⓘ About</h2><div><img src="/art/rek-logo.png" alt=""/><span><b>REK KHMER (ល្បែងរែក)</b><small>Traditional Cambodian Strategy Game</small></span><em>v1.0.0</em></div></section>
          </div>
        ) : null}

        {view === 'play' ? (
          <div className="st-game">
            <div className="st-game-heading"><button type="button" onClick={goBack}><UiIcon name="back" size={30}/></button><img src="/art/rek-logo.png" alt=""/><div><h1>Active Match</h1><p>ល្បែងកំពុងលេង</p></div></div>
            <div className="st-game-meta"><span>● {rulesetInfo.label.toUpperCase()} · 8×8</span><b>{statusLabel}</b></div>
            <section className="st-player-row opponent"><i><UiIcon name={matchType === 'VS_AI' ? 'ai' : 'crown'} /></i><div><h2>{matchType === 'VS_AI' ? `AI · ${difficultyLabel}` : matchType === 'ONLINE' ? 'Online Opponent' : copy.black}</h2><p>{copy.black} pieces · {counts.opp} remaining</p></div><b>{displayState.turn === 'opp' ? 'Your opponent' : 'Waiting'}</b></section>
            <section className="st-board-area">
              {displayState.lastRek ? <div className="st-rek-toast">✦ REK!</div> : null}
              <Board state={displayState} selected={isReplaying ? null : selected} legalMoves={isReplaying ? new Set() : legalMoves} disabled={boardDisabled} copy={copy} onSquareClick={handleSquareClick}/>
              {isReplaying ? <div className="st-replay-bar"><button type="button" onClick={() => setReplayPly((ply) => Math.max(0, (ply ?? 0) - 1))} disabled={replayPly === 0}>‹</button><span>{copy.replayPosition} {replayPly}/{moveLog.length}</span><button type="button" onClick={() => setReplayPly((ply) => Math.min(moveLog.length, (ply ?? 0) + 1))} disabled={replayPly === moveLog.length}>›</button><button type="button" onClick={() => setReplayPly(null)}>×</button></div> : null}
            </section>
            <section className="st-player-row you"><i><UiIcon name="crown" /></i><div><h2>You</h2><p>{copy.white} pieces · {counts.you} remaining</p></div><b className={displayState.turn === 'you' ? 'active' : ''}>{displayState.turn === 'you' ? copy.toMove : copy.status}</b></section>
            <section className="st-actions">
              {matchType !== 'ONLINE' ? <button type="button" onClick={undoMove} disabled={!game.canUndo() || aiThinking || isReplaying}><UiIcon name="undo"/> Undo</button> : null}
              {matchType !== 'ONLINE' ? <button type="button" onClick={() => startFreshGame()}><UiIcon name="reset"/> Reset</button> : null}
              <button type="button" className="primary" onClick={() => setShowMore((value) => !value)}><UiIcon name="more"/> More</button>
            </section>
            {showMore ? <section className="st-more-sheet">
              {matchType !== 'ONLINE' ? <button type="button" onClick={saveMatch}><UiIcon name="save"/> Save game</button> : null}
              {matchType !== 'ONLINE' ? <button type="button" onClick={loadMatch}><UiIcon name="load"/> Load game</button> : null}
              {moveLog.length ? <button type="button" onClick={() => { setReplayPly(0); setShowMore(false) }}><UiIcon name="replay"/> Review moves</button> : null}
              <button type="button" onClick={() => setView('home')}><UiIcon name="home"/> Exit to Home</button>
            </section> : null}
            {storageMessage ? <p className="st-storage-note">{storageMessage}</p> : null}
            {state.status !== 'playing' && !isReplaying ? <section className="st-result-card"><i><UiIcon name="crown" size={28}/></i><div><h2>{state.status === 'draw' ? copy.draw : `${state.winner === 'you' ? copy.white : copy.black} ${copy.wins}`}</h2><p>{state.winReason || `${state.moveCount} moves`}</p></div><button type="button" onClick={() => startFreshGame()}>Play Again</button></section> : null}
          </div>
        ) : null}
      </section>

      {view !== 'play' ? <nav className="st-bottom-nav" aria-label="Primary navigation">
        <button type="button" className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><UiIcon name="home"/><span>Home</span></button>
        <button type="button" className={view === 'modes' || view === 'online' ? 'active' : ''} onClick={() => setView('modes')}><UiIcon name="play"/><span>Play</span></button>
        <button type="button" className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}><UiIcon name="settings"/><span>Settings</span></button>
      </nav> : null}
    </main>
  )
}
