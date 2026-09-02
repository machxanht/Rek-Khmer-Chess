'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Volume2, Sparkles, Eye, Palette, Globe, Sliders, Mic2, WifiOff } from 'lucide-react'
import { sounds } from '@/lib/sound'
import {
  DEFAULT_OFFLINE_PREFERENCES,
  readOfflinePreferences,
  saveOfflinePreferences,
  type OfflinePreferences,
  type RekBoardTheme,
} from '@/lib/offline-preferences'

const BOARD_THEMES: Array<{
  id: RekBoardTheme
  label: string
  light: string
  dark: string
}> = [
  { id: 'temple', label: 'Temple Stone', light: 'oklch(0.54 0.055 72)', dark: 'oklch(0.405 0.047 57)' },
  { id: 'ivory', label: 'Ivory & Teak', light: 'oklch(0.86 0.03 85)', dark: 'oklch(0.52 0.06 60)' },
  { id: 'slate', label: 'River Slate', light: 'oklch(0.6 0.02 220)', dark: 'oklch(0.42 0.03 235)' },
  { id: 'jade', label: 'Jade Court', light: 'oklch(0.7 0.06 165)', dark: 'oklch(0.46 0.07 168)' },
]

const ENGINE_SUITES = [
  ['Core regressions', 'Movement, Rek, Poat, King behavior, captures, and compulsory Min Rek safeguards.'],
  ['Specification lock', 'Unambiguous rules are locked directly to the repository rule specification.'],
  ['State & draw contract', 'Turn metadata, immutability, threefold repetition, and lone-King draw bookkeeping.'],
  ['Published puzzles', 'All 7 puzzle target moves are validated against the engine.'],
  ['AI boundary & tactics', 'AI only uses engine-legal moves and receives tactical regression coverage.'],
  ['Long-run simulation', 'Deterministic multi-ply simulations exercise both rule modes across long sequences.'],
] as const

function SettingSwitch({
  label,
  desc,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string
  desc: string
  icon: React.ElementType
  checked: boolean
  onChange: () => void
}) {
  return (
    <li className="flex items-center gap-3.5 p-3 rounded-2xl transition-colors hover:bg-accent/40">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-gold shadow-sm">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 p-0.5 cursor-pointer shadow-inner touch-manipulation',
          checked ? 'bg-gold' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'block size-6 rounded-full bg-background shadow-md transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </li>
  )
}

export function SettingsView() {
  const [preferences, setPreferences] = useState<OfflinePreferences>(DEFAULT_OFFLINE_PREFERENCES)
  const [soundOn, setSoundOn] = useState(true)
  const [voiceOn, setVoiceOn] = useState(true)

  useEffect(() => {
    setPreferences(readOfflinePreferences())
    setSoundOn(!sounds.isMuted())
    setVoiceOn(sounds.isVoiceEnabled())
  }, [])

  const updatePreferences = (next: OfflinePreferences) => {
    setPreferences(next)
    saveOfflinePreferences(next)
    sounds.playSelect()
  }

  const handleSelectTheme = (boardTheme: RekBoardTheme) => {
    updatePreferences({ ...preferences, boardTheme })
  }

  const toggleSound = () => {
    const muted = sounds.toggleMute()
    setSoundOn(!muted)
    if (!muted) sounds.playSelect()
  }

  const toggleVoice = () => {
    const enabled = sounds.toggleVoice()
    setVoiceOn(enabled)
    sounds.playSelect()
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-rise">
      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold shadow-sm mb-2">
          <Sliders className="size-3.5" />
          <span>Offline Preferences</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          These settings are saved on this device and apply to Local, AI, and Puzzle play.
        </p>
      </header>

      <section className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Palette className="size-4.5 text-gold" />
          <h2 className="font-display text-base font-bold text-foreground">Board Theme</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BOARD_THEMES.map((theme) => {
            const active = preferences.boardTheme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                aria-pressed={active}
                className={cn(
                  'group rounded-2xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 touch-manipulation',
                  active
                    ? 'border-gold bg-gold/10 ring-2 ring-gold/50 shadow-md shadow-gold/20'
                    : 'border-border/80 bg-background/50 hover:border-gold/40',
                )}
              >
                <span className="grid aspect-square grid-cols-4 overflow-hidden rounded-xl shadow-inner ring-1 ring-border/50">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const row = Math.floor(i / 4)
                    const col = i % 4
                    return <span key={i} style={{ background: (row + col) % 2 ? theme.dark : theme.light }} />
                  })}
                </span>
                <span className="mt-2 block text-xs font-bold text-foreground truncate">{theme.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border/80 bg-card/80 p-3 backdrop-blur-md shadow-lg">
        <ul className="divide-y divide-border/60">
          <SettingSwitch
            label="Sound Effects"
            desc="Wood taps, captures, Rek/Poat bells, draw cues, and match endings."
            icon={Volume2}
            checked={soundOn}
            onChange={toggleSound}
          />
          <SettingSwitch
            label="Khmer Voice Calls"
            desc="Use a Khmer system voice for Rek, Poat, and Hao Rek when the device provides one."
            icon={Mic2}
            checked={voiceOn}
            onChange={toggleVoice}
          />
          <SettingSwitch
            label="Dynamic Animations"
            desc="Piece flight, capture bursts, and tactical pulses."
            icon={Sparkles}
            checked={preferences.animations}
            onChange={() => updatePreferences({ ...preferences, animations: !preferences.animations })}
          />
          <SettingSwitch
            label="Tactical Move Hints"
            desc="Show legal destination dots plus Rek and Poat target overlays."
            icon={Eye}
            checked={preferences.hints}
            onChange={() => updatePreferences({ ...preferences, hints: !preferences.hints })}
          />
        </ul>
      </section>

      <section className="mt-4 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Globe className="size-4.5 text-gold" />
          <h2 className="font-display text-base font-bold text-foreground">Interface Language</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The current offline build keeps one interface copy set so gameplay behavior stays consistent. Khmer terms remain visible for core Rek concepts; full UI localization will be handled separately rather than exposing non-functional language buttons.
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-gold/40 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-gold" />
            <h2 className="font-display text-base font-bold text-foreground">Engine Verification</h2>
          </div>
          <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
            CI-GATED
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Automated tests run in GitHub Actions. This settings screen reports coverage areas only and never invents a live pass/fail state.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
          {ENGINE_SUITES.map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="font-semibold text-foreground">{title}</span>
              <p className="mt-1 leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 flex items-start gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">
        <WifiOff className="mt-0.5 size-4.5 shrink-0 text-gold" />
        <p>
          Local, AI, puzzles, preferences, visual assets, and game audio work without an account or network connection after the app is loaded.
        </p>
      </section>

      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">Rek Khmer Chess · Offline Core</p>
    </div>
  )
}
