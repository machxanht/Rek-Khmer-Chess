import { useEffect, useMemo, useState } from 'react'
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

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <header className="hero">
        <div className="hero-emblem" aria-hidden="true"><UiIcon name="temple" size={34} /></div>
        <p className="eyebrow">ល្បែងរែក · REK KHMER</p>
        <h1>រែកខ្មែរ</h1>
        <p className="subtitle">{copy.subtitle}</p>
        <div className="heritage-strip" aria-label="Khmer cultural motifs">
          <div className="heritage-card"><UiIcon name="temple" /><span><strong>អង្គរ</strong><small>Angkor spirit</small></span></div>
          <div className="heritage-card"><UiIcon name="naga" /><span><strong>នាគ</strong><small>Naga guardian</small></span></div>
          <div className="heritage-card"><UiIcon name="lotus" /><span><strong>ផ្កាឈូក</strong><small>Lotus balance</small></span></div>
        </div>
      </header>

      <section className="game-layout">
        <aside className="panel" aria-label={copy.match}>
          <div className="panel-ornament" aria-hidden="true"><span /><i /><span /></div>
          <div>
            <span className="panel-label"><UiIcon name="spark" size={14} />{copy.language}</span>
            <div className="choice-row choice-row--three">
              {(Object.keys(LANGUAGE_LABELS) as UiLanguage[]).map((item) => (
                <button type="button" key={item} className={language === item ? 'choice choice--active' : 'choice'} onClick={() => setLanguage(item)}>
                  {LANGUAGE_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="panel-label"><UiIcon name="local" size={14} />{copy.match}</span>
            <div className="choice-row choice-row--match">
              <button type="button" className={matchType === 'LOCAL' ? 'choice choice--active' : 'choice'} onClick={() => startFreshGame(ruleset, 'LOCAL')}><UiIcon name="local" />{copy.local}</button>
              <button type="button" className={matchType === 'VS_AI' ? 'choice choice--active' : 'choice'} onClick={() => startFreshGame(ruleset, 'VS_AI')}><UiIcon name="ai" />{copy.vsAi}</button>
              <button type="button" className={matchType === 'ONLINE' ? 'choice choice--active' : 'choice'} onClick={() => startFreshGame(ruleset, 'ONLINE')}><UiIcon name="online" />{copy.online}</button>
            </div>
          </div>

          {matchType === 'ONLINE' ? (
            <div className="online-panel">
              <span className="panel-label"><UiIcon name="online" size={14} />{copy.server}</span>
              <input className="online-input" value={onlineUrl} onChange={(event) => setOnlineUrl(event.target.value)} spellCheck={false} />
              <div className="online-create">
                <button type="button" className="action-button" onClick={() => openOnline('create')}><UiIcon name="online" />{copy.createRoom}</button>
              </div>
              <span className="panel-label">{copy.roomCode}</span>
              <div className="online-join">
                <input className="online-input room-input" value={roomInput} onChange={(event) => setRoomInput(event.target.value.toUpperCase())} maxLength={6} spellCheck={false} />
                <button type="button" className="action-button" onClick={() => openOnline('join')} disabled={roomInput.trim().length !== 6}><UiIcon name="online" />{copy.joinRoom}</button>
              </div>
              {roomId ? <p className="online-room"><strong>{copy.roomCode}:</strong> {roomId}</p> : null}
              {onlineColor ? <p className="online-room"><strong>{copy.onlineAs}:</strong> {onlineColor === 'you' ? copy.white : copy.black}</p> : null}
              {onlineStatus === 'disconnected' && roomId && onlineResumeToken ? (
                <button type="button" className="action-button" onClick={resumeOnline}>
                  {copy.reconnect}
                </button>
              ) : null}
              <p className="storage-note">{onlineStatusLabel}</p>
            </div>
          ) : null}

          {matchType === 'VS_AI' ? (
            <div>
              <span className="panel-label"><UiIcon name="ai" size={14} />{copy.aiDifficulty}</span>
              <div className="choice-row choice-row--three">
                {DIFFICULTIES.map((item) => (
                  <button type="button" key={item} className={difficulty === item ? 'choice choice--active' : 'choice'} onClick={() => setDifficulty(item)}>
                    {copy[item]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <span className="panel-label"><UiIcon name="rules" size={14} />{copy.ruleset}</span>
            <div className="segmented">
              {RULESETS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  disabled={matchType === 'ONLINE' && !!roomId}
                  className={ruleset === item.id ? 'segment segment--active' : 'segment'}
                  onClick={() => startFreshGame(item.id, matchType)}
                >
                  <span className="segment-icon"><UiIcon name={item.id === 'REK_STANDARD' ? 'temple' : 'naga'} /></span>
                  <span><strong>{item.label}</strong><small>{item.note}</small></span>
                </button>
              ))}
            </div>
          </div>

          <div className="status-card">
            <span className="panel-label"><UiIcon name="status" size={14} />
              {matchType === 'LOCAL' ? copy.localMatch : matchType === 'VS_AI' ? copy.youAreWhite : copy.online}
            </span>
            <dl>
              <div><dt>{copy.status}</dt><dd>{statusLabel}</dd></div>
              <div><dt>{copy.whitePieces}</dt><dd>{counts.you}</dd></div>
              <div><dt>{copy.blackPieces}</dt><dd>{counts.opp}</dd></div>
              <div><dt>{copy.moves}</dt><dd>{displayState.moveCount}</dd></div>
              <div><dt>{copy.lastRek}</dt><dd>{displayState.lastRek ? copy.yes : copy.no}</dd></div>
              <div><dt>{copy.lastPoat}</dt><dd>{displayState.lastPoat ? copy.yes : copy.no}</dd></div>
            </dl>
          </div>

          {matchType !== 'ONLINE' ? (
            <>
              <div className="actions">
                <button type="button" className="action-button" onClick={undoMove} disabled={!game.canUndo() || aiThinking || isReplaying}><UiIcon name="undo" />{copy.undo}</button>
                <button type="button" className="action-button" onClick={resetGame}><UiIcon name="reset" />{copy.reset}</button>
              </div>
              <div className="storage-actions">
                <button type="button" className="action-button" onClick={saveMatch}><UiIcon name="save" />{copy.save}</button>
                <button type="button" className="action-button" onClick={loadMatch}><UiIcon name="load" />{copy.load}</button>
                <button type="button" className="action-button" onClick={() => setReplayPly(0)} disabled={moveLog.length === 0}><UiIcon name="replay" />{copy.replay}</button>
              </div>
              {storageMessage ? <p className="storage-note">{storageMessage}</p> : null}
            </>
          ) : null}

          {state.winReason && !isReplaying ? <p className="result-note">{state.winReason}</p> : null}

          {moveLog.length > 0 ? (
            <div className="move-history">
              <span className="panel-label"><UiIcon name="replay" size={14} />{copy.history}</span>
              <ol>
                {moveLog.slice(-8).map((move, index) => (
                  <li key={moveLog.length - Math.min(moveLog.length, 8) + index}>{idxToCoord(move.from)} → {idxToCoord(move.to)}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {matchType !== 'ONLINE' ? <p className="phase-note">{matchType === 'VS_AI' ? copy.vsAiHint : copy.localHint}</p> : null}
        </aside>

        <section className="board-card">
          <div className="board-card__head">
            <div>
              <span className="panel-label">
                {isReplaying
                  ? `${copy.replay} · ${replayPly}/${moveLog.length}`
                  : matchType === 'LOCAL'
                    ? copy.localBoardLabel
                    : matchType === 'VS_AI'
                      ? `${copy.vsAiBoardLabel} · ${difficultyLabel}`
                      : `${copy.online} · ${roomId || '—'}`}
              </span>
              <h2>{ruleset === 'REK_STANDARD' ? 'Rek Standard' : 'Min Rek Chanh'}</h2>
            </div>
            <span className={`turn-chip ${displayState.status !== 'playing' ? 'turn-chip--finished' : ''}`}>{statusLabel}</span>
          </div>

          <Board
            state={displayState}
            selected={isReplaying ? null : selected}
            legalMoves={isReplaying ? new Set() : legalMoves}
            disabled={boardDisabled}
            copy={copy}
            onSquareClick={handleSquareClick}
          />

          {isReplaying ? (
            <div className="replay-bar">
              <button type="button" className="action-button" onClick={() => setReplayPly((ply) => Math.max(0, (ply ?? 0) - 1))} disabled={replayPly === 0}>{copy.previous}</button>
              <span>{copy.replayPosition} {replayPly}/{moveLog.length}</span>
              <button type="button" className="action-button" onClick={() => setReplayPly((ply) => Math.min(moveLog.length, (ply ?? 0) + 1))} disabled={replayPly === moveLog.length}>{copy.next}</button>
              <button type="button" className="action-button replay-exit" onClick={() => setReplayPly(null)}>{copy.exitReplay}</button>
            </div>
          ) : null}

          <div className="legend" aria-label="Piece legend">
            <span><i className="legend-piece legend-piece--white" /> {copy.white}</span>
            <span><i className="legend-piece legend-piece--black" /> {copy.black}</span>
            <span><i className="legend-king">♚</i> {copy.king}</span>
            <span><i className="legend-dot" /> {copy.legalMove}</span>
          </div>
        </section>
      </section>
    </main>
  )
}
