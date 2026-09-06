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
import { LANGUAGE_LABELS, UI_COPY, type UiCopy, type UiLanguage } from './i18n'

type MatchType = 'LOCAL' | 'VS_AI'

const RULESETS: { id: RuleSet; label: string; note: string }[] = [
  { id: 'REK_STANDARD', label: 'Rek Standard', note: 'Rek + current Poat engine contract' },
  { id: 'MIN_REK_CHANH', label: 'Min Rek Chanh', note: 'Event-triggered Hao Rek contract' },
]

const DIFFICULTIES: AiDifficulty[] = ['easy', 'medium', 'hard']

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

export function App() {
  const [language, setLanguage] = useState<UiLanguage>('km')
  const [ruleset, setRuleset] = useState<RuleSet>('REK_STANDARD')
  const [matchType, setMatchType] = useState<MatchType>('LOCAL')
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium')
  const [game, setGame] = useState<RekGame>(() => createGame('REK_STANDARD'))
  const [state, setState] = useState<CanonicalGameState>(() => game.getState())
  const [selected, setSelected] = useState<number | null>(null)
  const [legalMoves, setLegalMoves] = useState<Set<number>>(new Set())
  const [aiThinking, setAiThinking] = useState(false)

  const copy = UI_COPY[language]
  const counts = pieceCounts(state.board)
  const isAiTurn = matchType === 'VS_AI' && state.status === 'playing' && state.turn === 'opp'

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

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

  const difficultyLabel = copy[difficulty]
  const turnLabel = state.turn === 'you' ? copy.white : copy.black
  const statusLabel = state.status === 'playing'
    ? aiThinking
      ? copy.aiThinking
      : matchType === 'VS_AI' && state.turn === 'opp'
        ? `${copy.aiToMove} · ${difficultyLabel}`
        : `${turnLabel} ${copy.toMove}`
    : state.status === 'draw'
      ? copy.draw
      : `${state.winner === 'you' ? copy.white : copy.black} ${copy.wins}`

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">ល្បែងរែក · REK KHMER</p>
        <h1>រែកខ្មែរ</h1>
        <p className="subtitle">{copy.subtitle}</p>
      </header>

      <section className="game-layout">
        <aside className="panel" aria-label={copy.match}>
          <div>
            <span className="panel-label">{copy.language}</span>
            <div className="choice-row choice-row--three">
              {(Object.keys(LANGUAGE_LABELS) as UiLanguage[]).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={language === item ? 'choice choice--active' : 'choice'}
                  onClick={() => setLanguage(item)}
                  aria-pressed={language === item}
                >
                  {LANGUAGE_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="panel-label">{copy.match}</span>
            <div className="choice-row">
              <button
                type="button"
                className={matchType === 'LOCAL' ? 'choice choice--active' : 'choice'}
                onClick={() => startFreshGame(ruleset, 'LOCAL')}
                aria-pressed={matchType === 'LOCAL'}
              >
                {copy.local}
              </button>
              <button
                type="button"
                className={matchType === 'VS_AI' ? 'choice choice--active' : 'choice'}
                onClick={() => startFreshGame(ruleset, 'VS_AI')}
                aria-pressed={matchType === 'VS_AI'}
              >
                {copy.vsAi}
              </button>
            </div>
          </div>

          {matchType === 'VS_AI' ? (
            <div>
              <span className="panel-label">{copy.aiDifficulty}</span>
              <div className="choice-row choice-row--three">
                {DIFFICULTIES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={difficulty === item ? 'choice choice--active' : 'choice'}
                    onClick={() => setDifficulty(item)}
                    aria-pressed={difficulty === item}
                  >
                    {copy[item]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <span className="panel-label">{copy.ruleset}</span>
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
            <span className="panel-label">{matchType === 'LOCAL' ? copy.localMatch : copy.youAreWhite}</span>
            <dl>
              <div><dt>{copy.status}</dt><dd>{statusLabel}</dd></div>
              <div><dt>{copy.whitePieces}</dt><dd>{counts.you}</dd></div>
              <div><dt>{copy.blackPieces}</dt><dd>{counts.opp}</dd></div>
              <div><dt>{copy.moves}</dt><dd>{state.moveCount}</dd></div>
              <div><dt>{copy.lastRek}</dt><dd>{state.lastRek ? copy.yes : copy.no}</dd></div>
              <div><dt>{copy.lastPoat}</dt><dd>{state.lastPoat ? copy.yes : copy.no}</dd></div>
            </dl>
          </div>

          <div className="actions">
            <button
              type="button"
              className="action-button"
              onClick={undoMove}
              disabled={!game.canUndo() || aiThinking}
            >
              {copy.undo}
            </button>
            <button type="button" className="action-button" onClick={resetGame}>
              {copy.reset}
            </button>
          </div>

          {state.winReason ? <p className="result-note">{state.winReason}</p> : null}

          <p className="phase-note">
            {matchType === 'VS_AI' ? copy.vsAiHint : copy.localHint}
          </p>
        </aside>

        <section className="board-card">
          <div className="board-card__head">
            <div>
              <span className="panel-label">
                {matchType === 'LOCAL' ? copy.localBoardLabel : `${copy.vsAiBoardLabel} · ${difficultyLabel}`}
              </span>
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
            copy={copy}
            onSquareClick={handleSquareClick}
          />

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
