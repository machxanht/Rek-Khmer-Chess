import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import './reference-home.css'

function clickExisting(selector: string, index = 0) {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
  nodes[index]?.click()
}

export function ReferenceHomeShell({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [showHome, setShowHome] = useState(false)

  useEffect(() => {
    const sync = () => {
      const app = hostRef.current?.querySelector<HTMLElement>('.stitch-app')
      setShowHome(Boolean(app?.classList.contains('stitch-view-home')))
    }
    sync()
    const observer = new MutationObserver(sync)
    if (hostRef.current) observer.observe(hostRef.current, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={hostRef} className="ref-shell-host">
      {children}
      {showHome ? (
        <main className="ref-home" aria-label="Rek Khmer home">
          <header className="ref-home-top">
            <span className="ref-time">9:41</span>
            <button type="button" className="ref-profile" aria-label="Settings" onClick={() => clickExisting('.st-profile')}>♙</button>
          </header>

          <section className="ref-brand-hero">
            <div className="ref-temple-art" aria-hidden="true" />
            <img className="ref-main-logo" src="/art/rek-logo.png" alt="Rek Khmer" />
            <p>Play. Learn. Preserve.</p>
          </section>

          <button type="button" className="ref-play" onClick={() => clickExisting('.st-play-hero')}>
            <span>▶</span><strong>Play</strong><small>Start a new game</small>
          </button>

          <section className="ref-mode-grid" aria-label="Game modes">
            <button type="button" onClick={() => clickExisting('.st-mode-rows > button', 0)}>
              <i>🤖</i><strong>VS AI</strong><small>Practice<br/>anytime</small>
            </button>
            <button type="button" onClick={() => clickExisting('.st-mode-rows > button', 1)}>
              <i>♟♟</i><strong>Local</strong><small>Play with<br/>friends</small>
            </button>
            <button type="button" onClick={() => clickExisting('.st-mode-rows > button', 2)}>
              <i>◎</i><strong>Online</strong><small>Play<br/>worldwide</small>
            </button>
          </section>

          <nav className="ref-nav" aria-label="Primary navigation">
            <button type="button" className="active"><span>⌂</span><small>Home</small></button>
            <button type="button" aria-disabled="true"><span>▣</span><small>Learn</small></button>
            <button type="button" aria-disabled="true"><span>◷</span><small>History</small></button>
            <button type="button" onClick={() => clickExisting('.st-profile')}><span>⚙</span><small>Settings</small></button>
          </nav>
        </main>
      ) : null}
    </div>
  )
}
