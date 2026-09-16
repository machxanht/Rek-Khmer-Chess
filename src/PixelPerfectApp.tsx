import React, { useEffect, useRef, useState } from 'react'
import {
  chooseAiMoveForState,
  createGame,
  type AiDifficulty,
  type CanonicalGameState,
  type Cell,
  type RekGame,
} from '../lib/rek-engine'

type View = 'home' | 'modes' | 'difficulty' | 'play' | 'learn' | 'history' | 'settings' | 'win'
type MatchMode = 'ai' | 'local' | 'online'
type DifficultyCard = 'easy' | 'medium' | 'hard' | 'expert'

function SvgIcon({ name, size = 24 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  switch (name) {
    case 'back': return <svg {...p}><path d="m15 18-6-6 6-6"/></svg>
    case 'home': return <svg {...p}><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></svg>
    case 'book': return <svg {...p}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>
    case 'history': return <svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>
    case 'settings': return <svg {...p}><path d="M4 7h10M18 7h2M10 17h10M4 17h2M14 4v6M8 14v6"/></svg>
    case 'bell': return <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
    case 'person': return <svg {...p}><circle cx="12" cy="8" r="3"/><path d="M5 21c.7-4.3 3-6.5 7-6.5s6.3 2.2 7 6.5"/></svg>
    case 'game': return <svg {...p}><path d="M7 8h10a5 5 0 0 1 4.7 6.7l-1 2.8a2.5 2.5 0 0 1-4.2 1l-1.8-2H9.3l-1.8 2a2.5 2.5 0 0 1-4.2-1l-1-2.8A5 5 0 0 1 7 8Z"/><path d="M7 11v4M5 13h4M16 12h.01M19 14h.01"/></svg>
    case 'play': return <svg {...p} fill="currentColor" stroke="none"><path d="m8 5 11 7-11 7V5Z"/></svg>
    case 'bot': return <svg {...p}><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6"/></svg>
    case 'group': return <svg {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.5-3.5 2.5-5.5 6-5.5s5.5 2 6 5.5M14 15c3.4 0 5.6 1.6 6 5"/></svg>
    case 'globe': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z"/></svg>
    case 'undo': return <svg {...p}><path d="m9 7-5 5 5 5"/><path d="M20 17a8 8 0 0 0-8-8H4"/></svg>
    case 'reset': return <svg {...p}><path d="M20 6v5h-5"/><path d="M19 11a8 8 0 1 0 1 5"/></svg>
    case 'more': return <svg {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'sound': return <svg {...p}><path d="M5 10H2v4h3l4 4V6l-4 4ZM14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12"/></svg>
    case 'eye': return <svg {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>
    default: return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>
  }
}

function StatusBar() {
  return <div className="pp-status"><b>9:41</b><div><span>▮▮▮</span><span>⌁</span><span className="pp-battery"/></div></div>
}

function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: Array<[View, string, string]> = [['home','home','Home'],['learn','book','Learn'],['history','history','History'],['settings','settings','Settings']]
  return <nav className="pp-bottom-nav">{items.map(([v,i,l]) => <button key={v} className={view===v?'active':''} onClick={() => setView(v)}><SvgIcon name={i}/><span>{l}</span></button>)}</nav>
}

function Home({ setView }: { setView: (v: View) => void }) {
  return <div className="pp-screen pp-home"><StatusBar/><header className="pp-home-head"><div className="pp-home-title"><span className="pp-icon-round"><SvgIcon name="game" size={23}/></span><h1>Home</h1></div><div className="pp-head-actions"><button aria-label="Notifications"><SvgIcon name="bell" size={22}/></button><button className="pp-avatar-btn" onClick={() => setView('settings')} aria-label="Profile"><SvgIcon name="person" size={20}/></button></div></header><main className="pp-home-main">
    <section className="pp-heritage-card"><div className="pp-temple-watermark"/><div className="pp-finial">✦</div><div className="pp-khmer-logo">រែក</div><h2>REK KHMER</h2><div className="pp-motto">● PLAY ● LEARN ● PRESERVE ●</div><p>Master the revered tactical chess of ancient Cambodian royalty and temple masters.</p><div className="pp-puzzle"><span className="pp-puzzle-icon">♜</span><div><b>Daily Puzzle #142</b><span>Trap the Neang in 2 moves</span></div><button>Solve</button></div></section>
    <button className="pp-play-cta" onClick={() => setView('modes')}><span className="pp-play-circle"><SvgIcon name="play"/></span><span className="pp-play-copy"><b>Play</b><small>Start a new match</small></span><span className="pp-choose">Choose Mode ›</span></button>
    <div className="pp-mode-grid"><button onClick={() => setView('difficulty')}><span className="pp-mode-icon"><SvgIcon name="bot"/></span><b>vs AI</b><small>Practice...</small><em>SOLO</em></button><button onClick={() => setView('modes')}><span className="pp-mode-icon"><SvgIcon name="group"/></span><b>Local</b><small>Pass &amp; play</small><em>SHARED</em></button><button onClick={() => setView('modes')}><span className="pp-mode-icon"><SvgIcon name="globe"/></span><b>Online</b><small>Worldwide</small><em className="live">LIVE</em></button></div>
    <section className="pp-tutorial"><div className="pp-tutorial-thumb">♟</div><div><small>TUTORIAL • 4 MIN</small><b>The Art of the Rek Trap</b><span>Master the double capture mechanic</span></div><button aria-label="Open tutorial">◇</button></section>
    <div className="pp-live-strip"><span>● 1,420 Masters Online</span><b>✪ Season 4 • Angkor Cup</b></div>
  </main><BottomNav view="home" setView={setView}/></div>
}

function ModeSelection({ setView, startLocal }: { setView:(v:View)=>void; startLocal:()=>void }) {
  return <div className="pp-screen pp-paper"><StatusBar/><header className="pp-center-head"><button onClick={() => setView('home')} aria-label="Back"><SvgIcon name="back" size={31}/></button><h1>Play</h1><span/></header><main className="pp-mode-list"><button onClick={() => setView('difficulty')} className="pp-big-mode"><span className="pp-piece-hero ivory">♕</span><div><b>vs AI</b><span>Choose difficulty and practice</span></div><i>›</i></button><button onClick={startLocal} className="pp-big-mode"><span className="pp-piece-hero wood">♞</span><div><b>Local</b><span>Play on the same device</span></div><i>›</i></button><button className="pp-big-mode"><span className="pp-piece-hero gold">♚</span><div><b>Online</b><span>Challenge players worldwide</span></div><i>›</i></button></main><div className="pp-home-indicator"/></div>
}

function Difficulty({ setView, difficulty, setDifficulty, startAi }: { setView:(v:View)=>void; difficulty: DifficultyCard; setDifficulty:(d:DifficultyCard)=>void; startAi:()=>void }) {
  const cards: Array<[DifficultyCard,string,string,string]> = [['easy','♙','Beginner','Good for learning'],['medium','♗','Intermediate','A bigger challenge'],['hard','♘','Advanced','For experienced players'],['expert','♛','Expert','Are you ready?']]
  return <div className="pp-screen pp-phone pp-paper"><StatusBar/><header className="pp-center-head compact"><button onClick={() => setView('modes')} aria-label="Back"><SvgIcon name="back" size={28}/></button><h1>Play vs AI</h1><span/></header><main className="pp-diff-main"><div className="pp-bot-badge"><SvgIcon name="bot" size={40}/></div><h2>Choose Difficulty</h2><p>Improve your skills step by step</p><div className="pp-diff-cards">{cards.map(([id,glyph,title,sub]) => <button key={id} className={difficulty===id?'selected':''} onClick={() => setDifficulty(id)}><span className={`pp-diff-glyph ${id}`}>{glyph}</span><div><b>{title}</b><small>{sub}</small></div>{difficulty===id?<i>✓</i>:null}</button>)}</div></main><button className="pp-start-game" onClick={startAi}>Start Game</button><div className="pp-home-indicator"/></div>
}

function pieceVariant(piece: NonNullable<Cell>) {
  let n = 0
  for (const c of piece.id) n = (n + c.charCodeAt(0)) % 4
  return n
}
function PieceGlyph({ piece }: { piece: NonNullable<Cell> }) {
  const glyphs = piece.king ? ['♛','♚','♕','♔'] : ['♜','♞','♝','♙']
  return <span className="pp-board-piece">{glyphs[pieceVariant(piece)]}</span>
}

function MatchBoard({ state, selected, legalMoves, onSquare }: { state:CanonicalGameState; selected:number|null; legalMoves:Set<number>; onSquare:(i:number)=>void }) {
  return <div className="pp-board-frame"><div className="pp-board">{state.board.map((piece,i) => <button key={i} onClick={() => onSquare(i)} className={`${selected===i?'sel ':''}${legalMoves.has(i)?'legal ':''}${state.lastMove && (state.lastMove.from===i||state.lastMove.to===i)?'last ':''}`}><span className="pp-cell-dot"/>{piece?<PieceGlyph piece={piece}/>:null}</button>)}</div></div>
}

function Game({ state, mode, selected, legalMoves, onSquare, onUndo, onReset, setView, showMenu, setShowMenu }: { state:CanonicalGameState; mode:MatchMode; selected:number|null; legalMoves:Set<number>; onSquare:(i:number)=>void; onUndo:()=>void; onReset:()=>void; setView:(v:View)=>void; showMenu:boolean; setShowMenu:(v:boolean)=>void }) {
  const turnLabel = state.turn==='you'?'White’s initiative':'Opponent’s initiative'
  return <div className="pp-screen pp-game"><StatusBar/><header className="pp-game-title"><button onClick={() => setView('modes')} aria-label="Back"><SvgIcon name="back" size={30}/></button><h1>Live Match Arena</h1><button className="pp-avatar-btn" aria-label="Profile"><SvgIcon name="person" size={19}/></button></header><main className="pp-arena"><section className="pp-player opp"><div className="pp-face">S</div><div><b>{mode==='ai'?'Sokchea 🇰🇭':'Opponent 🇰🇭'}</b><span>☆ 1500</span></div><em><SvgIcon name="clock" size={17}/>04:32</em></section><MatchBoard state={state} selected={selected} legalMoves={legalMoves} onSquare={onSquare}/><section className="pp-player you"><div className="pp-face">Y</div><div><b>You 🇰🇭</b><span>☆ 1480</span></div><em><SvgIcon name="clock" size={17}/>04:18</em></section><section className="pp-game-actions"><button onClick={onUndo}><span><SvgIcon name="undo"/></span>Undo</button><button onClick={onReset}><span><SvgIcon name="reset"/></span>Reset</button><button onClick={() => setShowMenu(true)}><span><SvgIcon name="more"/></span>More</button></section></main><section className="pp-match-card"><span>⚔</span><div><b>Ouk Chatrang Casual</b><small>Turn {state.moveCount} • {turnLabel}</small></div><em>Live</em></section>{showMenu?<GameMenu close={() => setShowMenu(false)} setView={setView}/>:null}</div>
}

function GameMenu({ close, setView }: { close:()=>void; setView:(v:View)=>void }) {
  return <div className="pp-modal-backdrop" onClick={close}><section className="pp-game-menu" onClick={e=>e.stopPropagation()}><header><b>Game Options</b><button onClick={close}>×</button></header><button><span>♙</span>Resign</button><button><span>♜</span>Offer Draw</button><button><span>↻</span>Flip Board</button><button><span><SvgIcon name="sound" size={20}/></span>Sound<i className="pp-toggle on"/></button><button><span><SvgIcon name="eye" size={20}/></span>Show Move Hints<i className="pp-toggle on"/></button><button onClick={() => setView('settings')}><span><SvgIcon name="settings" size={20}/></span>Settings</button></section></div>
}

function Win({ state, setView, playAgain }: { state:CanonicalGameState; setView:(v:View)=>void; playAgain:()=>void }) {
  const won = state.winner==='you'
  const draw = state.status==='draw'
  return <div className="pp-screen pp-win"><StatusBar/><div className="pp-win-mark">♛</div><h1>{draw?'Draw':won?'You Win!':'Game Over'}</h1><div className="pp-win-khmer">អបអរសាទរ</div><p>{draw?'A worthy duel.':won?'Well played!':'Play again and reclaim the board.'}</p><div className="pp-laurel"><span>❧</span><b>♔</b><span>❧</span></div><div className="pp-win-actions"><button onClick={playAgain}>Play Again</button><button onClick={() => setView('home')}>Back to Home</button><button className="link">▣ View Analysis</button></div></div>
}

function Learn({ setView }: { setView:(v:View)=>void }) {
  const items=[['▣','Rules','Learn how to play Rek Khmer'],['♟','Piece Guide','Understand each piece'],['♛','Strategy','Tips and tactics'],['✺','History','The cultural heritage']]
  return <div className="pp-screen pp-paper"><StatusBar/><header className="pp-center-head"><button onClick={() => setView('home')} aria-label="Back"><SvgIcon name="back" size={28}/></button><h1>Learn</h1><span/></header><main className="pp-learn-list">{items.map(([i,t,s])=><button key={t}><span>{i}</span><div><b>{t}</b><small>{s}</small></div><em>›</em></button>)}</main><BottomNav view="learn" setView={setView}/></div>
}

function History({ setView }: { setView:(v:View)=>void }) {
  const rows=[['Win','Dara','1500','2024-01-15'],['Loss','Vannak','1520','2024-01-14'],['Win','AI (Hard)','–','2024-01-13'],['Win','Chanthy','1480','2024-01-12'],['Loss','Kimheng','1510','2024-01-11'],['Win','AI (Medium)','–','2024-01-10']]
  return <div className="pp-screen pp-paper"><StatusBar/><header className="pp-center-head"><button onClick={() => setView('home')} aria-label="Back"><SvgIcon name="back" size={28}/></button><h1>Game History</h1><span/></header><main className="pp-history-main"><div className="pp-segments"><button className="active">All</button><button>Wins</button><button>Losses</button></div><div className="pp-history-list">{rows.map(([r,n,e,d],k)=><article key={k}><span className={r==='Win'?'win':'loss'}>{r}</span><div><b>vs. {n}</b><small>🇰🇭 {e}</small></div><time>{d}</time></article>)}</div></main><BottomNav view="history" setView={setView}/></div>
}

function Settings({ setView }: { setView:(v:View)=>void }) {
  const [sound,setSound]=useState(true)
  const [moves,setMoves]=useState(true)
  const [hints,setHints]=useState(true)
  const [confirm,setConfirm]=useState(true)
  return <div className="pp-screen pp-paper"><StatusBar/><header className="pp-center-head"><button onClick={() => setView('home')} aria-label="Back"><SvgIcon name="back" size={28}/></button><h1>Settings</h1><span/></header><main className="pp-settings-main"><h2>Appearance</h2><div className="pp-appearance"><button className="active">☀<span>Light Mode</span></button><button>☾<span>Dark Mode</span></button><button>◉<span>System</span></button></div><h2>Sound &amp; Effects</h2><section className="pp-setting-group"><SettingRow icon="◖" label="Sound" value={sound} setValue={setSound}/><SettingRow icon="▥" label="Move Sounds" value={moves} setValue={setMoves}/></section><h2>Game</h2><section className="pp-setting-group"><SettingRow icon="◌" label="Show Move Hints" value={hints} setValue={setHints}/><SettingRow icon="✓" label="Confirm Move" value={confirm} setValue={setConfirm}/></section><h2>Language</h2><div className="pp-language"><button className="active">✓ English</button><button>✦ ភាសាខ្មែរ<small>Khmer</small></button></div></main><div className="pp-home-indicator"/></div>
}
function SettingRow({icon,label,value,setValue}:{icon:string;label:string;value:boolean;setValue:(v:boolean)=>void}){return <button onClick={()=>setValue(!value)}><span>{icon}</span><b>{label}</b><i className={`pp-toggle ${value?'on':''}`}/></button>}

export function PixelPerfectApp() {
  const [view,setView]=useState<View>('home')
  const [mode,setMode]=useState<MatchMode>('ai')
  const [difficulty,setDifficulty]=useState<DifficultyCard>('medium')
  const gameRef=useRef<RekGame>(createGame('REK_STANDARD'))
  const [state,setState]=useState<CanonicalGameState>(()=>gameRef.current.getState())
  const [selected,setSelected]=useState<number|null>(null)
  const [legalMoves,setLegalMoves]=useState<Set<number>>(new Set())
  const [showMenu,setShowMenu]=useState(false)
  const aiDifficulty:AiDifficulty = difficulty==='easy'?'easy':difficulty==='hard'||difficulty==='expert'?'hard':'medium'

  const startGame=(nextMode:MatchMode)=>{ gameRef.current=createGame('REK_STANDARD'); setState(gameRef.current.getState()); setSelected(null); setLegalMoves(new Set()); setMode(nextMode); setShowMenu(false); setView('play') }
  const sync=()=>{ const s=gameRef.current.getState(); setState(s); setSelected(null); setLegalMoves(new Set()) }
  const onSquare=(i:number)=>{
    if(state.status!=='playing') return
    if(mode==='ai' && state.turn!=='you') return
    if(selected!==null && legalMoves.has(i)){ if(gameRef.current.makeMove(selected,i)) sync(); return }
    const p=state.board[i]
    if(p && p.player===state.turn){ setSelected(i); setLegalMoves(new Set(gameRef.current.getLegalMoves(i))); return }
    setSelected(null); setLegalMoves(new Set())
  }
  useEffect(()=>{
    if(view!=='play' || mode!=='ai' || state.status!=='playing' || state.turn!=='opp') return
    const t=window.setTimeout(()=>{ const move=chooseAiMoveForState(gameRef.current.getState(),aiDifficulty); if(move && gameRef.current.makeMove(move.from,move.to)) sync() },360)
    return ()=>window.clearTimeout(t)
  },[state,view,mode,aiDifficulty])
  useEffect(()=>{ if(view==='play' && state.status!=='playing'){ const t=window.setTimeout(()=>setView('win'),420); return ()=>window.clearTimeout(t)} },[state.status,view])

  const onUndo=()=>{ if(gameRef.current.undo()) sync() }
  const onReset=()=>{ gameRef.current.reset(); sync() }
  const playAgain=()=>startGame(mode)

  if(view==='home') return <Home setView={setView}/>
  if(view==='modes') return <ModeSelection setView={setView} startLocal={()=>startGame('local')}/>
  if(view==='difficulty') return <Difficulty setView={setView} difficulty={difficulty} setDifficulty={setDifficulty} startAi={()=>startGame('ai')}/>
  if(view==='play') return <Game state={state} mode={mode} selected={selected} legalMoves={legalMoves} onSquare={onSquare} onUndo={onUndo} onReset={onReset} setView={setView} showMenu={showMenu} setShowMenu={setShowMenu}/>
  if(view==='win') return <Win state={state} setView={setView} playAgain={playAgain}/>
  if(view==='learn') return <Learn setView={setView}/>
  if(view==='history') return <History setView={setView}/>
  return <Settings setView={setView}/>
}
