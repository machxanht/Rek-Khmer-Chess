import { useMemo, useState } from 'react'
import {
  BOARD_SIZE,
  createGame,
  idxToCoord,
  type Cell,
  type RuleSet,
} from '../lib/rek-engine'

const RULESETS: { id: RuleSet; label: string; note: string }[] = [
  {
    id: 'REK_STANDARD',
    label: 'Rek Standard',
    note: 'Rek + current Poat engine contract',
  },
  {
    id: 'MIN_REK_CHANH',
    label: 'Min Rek Chanh',
    note: 'Event-triggered Hao Rek contract',
  },
]

function PieceView({ piece }: { piece: NonNullable<Cell> }) {
  const side = piece.player === 'you' ? 'white' : 'black'
  const name = piece.king ? 'King' : 'Man'

  return (
    <span
      className={`piece piece--${side} ${piece.king ? 'piece--king' : ''}`}
      aria-label={`${side} ${name}`}
      title={`${side} ${name}`}
    >
      {piece.king ? '♚' : ''}
    </span>
  )
}

function Board({ board }: { board: Cell[] }) {
  return (
    <div className="board-shell">
      <div className="file-labels" aria-hidden="true">
        {'abcdefgh'.split('').map((file) => <span key={file}>{file}</span>)}
      </div>

      <div className="board-wrap">
        <div className="rank-labels" aria-hidden="true">
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => <span key={rank}>{rank}</span>)}
        </div>

        <div className="board" role="grid" aria-label="Rek Khmer board">
          {board.map((piece, index) => {
            const coord = idxToCoord(index)
            return (
              <div
                className="square"
                role="gridcell"
                aria-label={piece ? `${coord}: ${piece.player} ${piece.king ? 'King' : 'Man'}` : `${coord}: empty`}
                key={coord}
                data-coordinate={coord}
              >
                {piece ? <PieceView piece={piece} /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function App() {
  const [ruleset, setRuleset] = useState<RuleSet>('REK_STANDARD')
  const game = useMemo(() => createGame(ruleset), [ruleset])
  const state = game.getState()

  const counts = useMemo(() => {
    let you = 0
    let opp = 0
    for (const piece of state.board) {
      if (!piece) continue
      if (piece.player === 'you') you += 1
      else opp += 1
    }
    return { you, opp }
  }, [state.board])

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">ល្បែងរែក · REK KHMER</p>
        <h1>រែកខ្មែរ</h1>
        <p className="subtitle">
          Canonical 8×8 board rendered directly from the Rek engine.
        </p>
      </header>

      <section className="game-layout">
        <aside className="panel" aria-label="Game setup">
          <div>
            <span className="panel-label">Ruleset</span>
            <div className="segmented">
              {RULESETS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={ruleset === item.id ? 'segment segment--active' : 'segment'}
                  onClick={() => setRuleset(item.id)}
                  aria-pressed={ruleset === item.id}
                >
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="status-card">
            <span className="panel-label">Initial position</span>
            <dl>
              <div><dt>White King</dt><dd>a2</dd></div>
              <div><dt>Black King</dt><dd>h7</dd></div>
              <div><dt>White pieces</dt><dd>{counts.you}</dd></div>
              <div><dt>Black pieces</dt><dd>{counts.opp}</dd></div>
              <div><dt>Turn</dt><dd>{state.turn === 'you' ? 'White' : 'Black'}</dd></div>
            </dl>
          </div>

          <p className="phase-note">
            Board UI phase: position display only. Move interaction is added in the Local match phase.
          </p>
        </aside>

        <section className="board-card">
          <div className="board-card__head">
            <div>
              <span className="panel-label">Canonical position</span>
              <h2>{ruleset === 'REK_STANDARD' ? 'Rek Standard' : 'Min Rek Chanh'}</h2>
            </div>
            <span className="turn-chip">White to move</span>
          </div>

          <Board board={state.board} />

          <div className="legend" aria-label="Piece legend">
            <span><i className="legend-piece legend-piece--white" /> White</span>
            <span><i className="legend-piece legend-piece--black" /> Black</span>
            <span><i className="legend-king">♚</i> King</span>
          </div>
        </section>
      </section>
    </main>
  )
}
