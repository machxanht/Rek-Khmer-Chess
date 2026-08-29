'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Swords, Crown, Volume2 } from 'lucide-react'
import { sounds } from '@/lib/sound'

export function PageLoader({ onReady }: { onReady?: () => void }) {
  const [progress, setProgress] = useState(12)
  const [loaded, setLoaded] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 180)
    const timer2 = setTimeout(() => setProgress(80), 380)
    const timer3 = setTimeout(() => {
      setProgress(100)
      setLoaded(true)
      sounds.playSelect()
      if (onReady) onReady()
    }, 650)
    const timer4 = setTimeout(() => setHidden(true), 1100)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onReady])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl transition-all duration-500 ${
        loaded ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Golden Glowing Lotus Mandala & Temple Motif */}
      <div className="relative flex flex-col items-center justify-center p-8 text-center max-w-sm">
        {/* Animated outer aura */}
        <div className="absolute size-48 rounded-full bg-gold/15 blur-3xl animate-pulse" />

        {/* Central Angkor Crown Emblem */}
        <div className="relative flex size-24 items-center justify-center rounded-3xl border border-gold/60 bg-card/80 p-4 shadow-2xl shadow-gold/20 ring-4 ring-gold/20 backdrop-blur-md animate-float">
          <Crown className="size-12 text-gold animate-pulse drop-shadow-[0_0_12px_var(--gold)]" />
          <Sparkles className="absolute -top-2 -right-2 size-6 text-gold animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Title */}
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-wider text-foreground">
          REK <span className="text-gold bg-gradient-to-r from-gold via-amber-300 to-yellow-200 bg-clip-text text-transparent">KHMER</span>
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gold/80">
          ល្បែងរែក • Angkor Royal Strategy
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-64">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1.5 font-mono">
            <span>PREPARING BATTLEFIELD</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/80 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-gold to-yellow-300 shadow-[0_0_12px_var(--gold)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sound badge */}
        <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 className="size-3.5 text-gold" />
          <span>Web Audio Synthesizer Ready</span>
        </div>
      </div>
    </div>
  )
}
