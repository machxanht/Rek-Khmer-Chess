'use client'

import { useEffect, useState } from 'react'
import { Eye, Mic2, Palette, Sliders, Sparkles, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  { id: 'temple', label: 'Temple Stone', light: '#c5a36e', dark: '#725b40' },
  { id: 'ivory', label: 'Ivory & Teak', light: 'oklch(0.86 0.03 85)', dark: 'oklch(0.52 0.06 60)' },
  { id: 'slate', label: 'River Slate', light: 'oklch(0.6 0.02 220)', dark: 'oklch(0.42 0.03 235)' },
  { id: 'jade', label: 'Jade Court', light: 'oklch(0.7 0.06 165)', dark: 'oklch(0.46 0.07 168)' },
]

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
    <div className="grid min-h-[76px] grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border py-3 last:border-b-0 sm:gap-4">
      <span className="flex size-9 items-center justify-center border border-border bg-background text-gold" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/70',
          checked ? 'border-gold/45 bg-gold/22' : 'border-border bg-background',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all duration-150',
            checked ? 'left-[1.55rem] bg-gold' : 'left-1 bg-muted-foreground/55',
          )}
        />
      </button>
    </div>
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

  const toggleSound = () => {
    const muted = sounds.toggleMute()
    setSoundOn(!muted)
    if (!muted) sounds.playSelect()
  }

  const toggleVoice = () => {
    setVoiceOn(sounds.toggleVoice())
    sounds.playSelect()
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-rise">
      <header className="grid gap-5 border-b border-border pb-7 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-7">
        <div className="flex size-14 items-center justify-center border border-border bg-card text-gold">
          <Sliders className="size-6" />
        </div>
        <div>
          <p className="rk-eyebrow">Offline preferences</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Preferences</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Saved on this device. These controls affect Local, AI, and Puzzle play without changing game rules.
          </p>
        </div>
      </header>

      <section className="py-7">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-gold" />
          <h2 className="font-display text-xl font-semibold text-foreground">Board surface</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Choose the material treatment. Board geometry and piece state stay identical.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BOARD_THEMES.map((theme) => {
            const active = preferences.boardTheme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => updatePreferences({ ...preferences, boardTheme: theme.id })}
                aria-pressed={active}
                className={cn(
                  'border bg-card p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/70',
                  active ? 'border-gold/55' : 'border-border hover:border-gold/30',
                )}
              >
                <span className="grid aspect-[1.55/1] grid-cols-4 overflow-hidden border border-black/20">
                  {Array.from({ length: 16 }).map((_, index) => {
                    const row = Math.floor(index / 4)
                    const col = index % 4
                    return <span key={index} style={{ background: (row + col) % 2 ? theme.dark : theme.light }} />
                  })}
                </span>
                <span className="mt-2 flex items-center justify-between gap-2 text-xs font-bold text-foreground">
                  <span className="truncate">{theme.label}</span>
                  {active && <span className="size-1.5 rounded-full bg-gold" aria-label="Selected" />}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-8 border-t border-border py-7 lg:grid-cols-[1fr_0.78fr]">
        <div>
          <p className="rk-eyebrow">Gameplay presentation</p>
          <div className="mt-2">
            <SettingSwitch
              label="Sound Effects"
              desc="Move, capture, Rek, Poat, draw, and match-result cues."
              icon={Volume2}
              checked={soundOn}
              onChange={toggleSound}
            />
            <SettingSwitch
              label="Khmer Voice Calls"
              desc="Uses a compatible device voice for Rek, Poat, and Hao Rek when available."
              icon={Mic2}
              checked={voiceOn}
              onChange={toggleVoice}
            />
            <SettingSwitch
              label="Animations"
              desc="Short piece motion and capture feedback. Reduced-motion system settings still take priority."
              icon={Sparkles}
              checked={preferences.animations}
              onChange={() => updatePreferences({ ...preferences, animations: !preferences.animations })}
            />
            <SettingSwitch
              label="Tactical Move Hints"
              desc="Show legal destinations plus Rek and Poat destination marks supplied by the engine."
              icon={Eye}
              checked={preferences.hints}
              onChange={() => updatePreferences({ ...preferences, hints: !preferences.hints })}
            />
          </div>
        </div>

        <aside className="border border-border bg-card/42 p-4 sm:p-5">
          <p className="rk-eyebrow">Integrity</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Rules stay outside the UI</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            These settings only change presentation. Legal moves, Rek, Poat, compulsory Rek, wins, and draws continue to come from the existing engine.
          </p>
          <div className="mt-5 border-t border-border pt-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-gold">CI-gated engine suite</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Regression, specification-lock, state, draw, puzzle, simulation, and AI-boundary tests run in GitHub Actions rather than pretending to run inside this settings screen.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
