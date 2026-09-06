import { useEffect, useState } from 'react'
import {
  chooseAiMoveForState,
  createGame,
  idxToCoord,
  type AiDifficulty,
  type CanonicalGameState,
  type Cell,
  type RekGame,
  type RuleSet,
} from '../lib/rek-engine'

type MatchType = 'LOCAL' | 'VS_AI'

const RULESETS: { id: RuleSet; label: string; note: string }[] = [
  { id: 'REK_STANDARD', label: 'Rek Standard', note: 'Rek + current Poat engine contract' },
  { id: 'MIN_REK_CHANH', label: 'Min Rek Chanh', note: 'Event-triggered Hao Rek contract' },
]

const DIFFICULTIES: { id: AiDifficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]

function PieceView({ piece }: { piece: NonNullable<Cell> }) {
  const side = piece.player === 'you' ? 'white' : 'black'
  return (
    <span
      className={`piece piece--${side} ${piece.king ? 'piece--king' : ''}`}
      aria-hidden="true"
    >
      {piece.king ? '♚' : ''}
    </span>
  )
}

interface BoardProps {
  state: CanonicalGameState
  selected: number | null
  legalMoves: Set<number>
  disabled: boolean
  onSquareClick: (index: number) => void
}

function Board({ state, selected, legalMoves, disabled, onSquareClick }: BoardProps) {
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
              ? `${coord}: ${piece.player === 'you' ? 'White' : 'Black'} ${piece.king ? 'King' : 'Man'}`
              : `${coord}: empty`

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
                aria-label={isLegal ? `${label}, legal destination` : label}
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

export function App() {
  const [ruleset, setRuleset] = useState<RuleSet>('REK_STANDARD')
  const [matchType, setMatchType] = useState<MatchType>('LOCAL')
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium')
  const [game, setGame] = useState<RekGame>(() => createGame('REK_STANDARD'))
  const [state, setState] = useState<CanonicalGameState>(() => game.getState())
  const [selected, setSelected] = useState<number | null>(null)
  const [legalMoves, setLegalMoves] = useState<Set<number>>(new Set())
  const [aiThinking, setAiThinking] = useState(false)

  const counts = pieceCounts(state.board)
  const isAiTurn = matchType === 'VS_AI' && state.status === 'playing' && state.turn === 'opp'

  const clearSelection = () => {
    setSelected(null)
    setLegalMoves(new Set())
  }

  const syncState = () => {
    setState(game.getState())
    clearSelection()
  }

  const startFreshGame = (nextRuleset = ruleset, nextMatchType = matchType) => {
    const nextGame = createGame(nextRuleset)
    setRuleset(nextRuleset)
    setMatchType(nextMatchType)
    setGame(nextGame)
    setState(nextGame.getState())
    setAiThinking(false)
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
      if (move) game.makeMove(move.from, move.to)

      setState(game.getState())
      setAiThinking(false)
      clearSelection()
    }, 280)

    return () => window.clearTimeout(timer)
  }, [difficulty, game, isAiTurn])

  const handleSquareClick = (index: number) => {
    if (state.status !== 'playing' || isAiTurn) return

    if (selected !== null && legalMoves.has(index)) {
      game.makeMove(selected, index)
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
    if (!game.canUndo()) return

    if (matchType === 'LOCAL') {
      game.undo()
    } else {
      const current = game.getState()
      if (current.status === 'playing' && current.turn === 'opp') {
        game.undo()
      } else {
        game.undo()
        if (game.canUndo()) game.undo()
      }
    }

    setAiThinking(false)
    syncState()
  }

  const turnLabel = state.turn === 'you' ? 'White' : 'Black'
  const statusLabel = state.status === 'playing'
    ? aiThinking
      ? 'AI thinking…'
      : matchType === 'VS_AI' && state.turn === 'opp'
        ? `AI (${difficulty}) to move`
        : `${turnLabel} to move`
    : state.status === 'draw'
      ? 'Draw'
      : `${state.winner === 'you' ? 'White' : 'Black'} wins`

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">ល្បែងរែក · REK KHMER</p>
        <h1>រែកខ្មែរ</h1>
        <p className="subtitle">Play locally or challenge the engine AI.</p>
      </header>

      <section className="game-layout">
        <aside className="panel" aria-label="Match controls">
          <div>
            <span className="panel-label">Match</span>
            <div className="choice-row">
              <button
                type="button"
                className={matchType === 'LOCAL' ? 'choice choice--active' : 'choice'}
                onClick={() => startFreshGame(ruleset, 'LOCAL')}
                aria-pressed={matchType === 'LOCAL'}
              >
                Local
              </button>
              <button
                type="button"
                className={matchType === 'VS_AI' ? 'choice choice--active' : 'choice'}
                onClick={() => startFreshGame(ruleset, 'VS_AI')}
                aria-pressed={matchType === 'VS_AI'}
              >
                vs AI
              </button>
            </div>
          </div>

          {matchType === 'VS_AI' ? (
            <div>
              <span className="panel-label">AI difficulty</span>
              <div className="choice-row choice-row--three">
                {DIFFICULTIES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={difficulty === item.id ? 'choice choice--active' : 'choice'}
                    onClick={() => setDifficulty(item.id)}
                    aria-pressed={difficulty === item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <span className="panel-label">Ruleset</span>
            <div className="segmented">
              {RULESETS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={ruleset === item.id ? 'segment segment--active' : 'segment'}
                  onClick={() => startFreshGame(item.id, matchType)}
                  aria-pressed={ruleset === item.id}
                >
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="status-card">
            <span className="panel-label">{matchType === 'LOCAL' ? 'Local match' : 'You are White'}</span>
            <dl>
              <div><dt>Status</dt><dd>{statusLabel}</dd></div>
              <div><dt>White pieces</dt><dd>{counts.you}</dd></div>
              <div><dt>Black pieces</dt><dd>{counts.opp}</dd></div>
              <div><dt>Moves</dt><dd>{state.moveCount}</dd></div>
              <div><dt>Last Rek</dt><dd>{state.lastRek ? 'Yes' : 'No'}</dd></div>
              <div><dt>Last Poat</dt><dd>{state.lastPoat ? 'Yes' : 'No'}</dd></div>
            </dl>
          </div>

          <div className="actions">
            <button
              type="button"
              className="action-button"
              onClick={undoMove}
              disabled={!game.canUndo() || aiThinking}
            >
              Undo
            </button>
            <button type="button" className="action-button" onClick={resetGame}>
              Reset
            </button>
          </div>

          {state.winReason ? <p className="result-note">{state.winReason}</p> : null}

          <p className="phase-note">
            {matchType === 'VS_AI'
              ? 'You play White. The AI plays Black using full state-aware engine search.'
              : 'Both sides play on this device. All legality and adjudication come from the engine.'}
          </p>
        </aside>

        <section className="board-card">
          <div className="board-card__head">
            <div>
              <span className="panel-label">{matchType === 'LOCAL' ? 'Local · 2 players' : `vs AI · ${difficulty}`}</span>
              <h2>{ruleset === 'REK_STANDARD' ? 'Rek Standard' : 'Min Rek Chanh'}</h2>
            </div>
            <span className={`turn-chip ${state.status !== 'playing' ? 'turn-chip--finished' : ''}`}>
              {statusLabel}
            </span>
          </div>

          <Board
            state={state}
            selected={selected}
            legalMoves={legalMoves}
            disabled={isAiTurn}
            onSquareClick={handleSquareClick}
          />

          <div className="legend" aria-label="Piece legend">
            <span><i className="legend-piece legend-piece--white" /> White</span>
            <span><i className="legend-piece legend-piece--black" /> Black</span>
            <span><i className="legend-king">♚</i> King</span>
            <span><i className="legend-dot" /> Legal move</span>
          </div>
        </section>
      </section>
    </main>
  )
}
