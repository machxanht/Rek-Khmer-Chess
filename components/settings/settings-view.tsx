"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Volume2, Sparkles, Eye, Bell, Palette, Globe, LogOut, Sliders } from "lucide-react"
import { sounds } from "@/lib/sound"

type Toggle = { key: string; label: string; desc: string; icon: React.ElementType; on: boolean }

const BOARD_THEMES = [
  { id: "temple", label: "Temple Stone", light: "oklch(0.44 0.032 68)", dark: "oklch(0.36 0.03 64)" },
  { id: "ivory", label: "Ivory & Teak", light: "oklch(0.86 0.03 85)", dark: "oklch(0.52 0.06 60)" },
  { id: "slate", label: "River Slate", light: "oklch(0.6 0.02 220)", dark: "oklch(0.42 0.03 235)" },
  { id: "jade", label: "Jade Court", light: "oklch(0.7 0.06 165)", dark: "oklch(0.46 0.07 168)" },
]

const ENGINE_SUITES = [
  {
    title: "Core regressions",
    desc: "Movement, Rek, Poat, King behavior, captures, and compulsory Min Rek safeguards.",
  },
  {
    title: "Specification lock",
    desc: "Unambiguous rules are locked directly to the repository rule specification.",
  },
  {
    title: "AI legality boundary",
    desc: "Every AI difficulty is constrained to moves returned by the core engine.",
  },
  {
    title: "GameState contract",
    desc: "Turn, move metadata, captures, immutability, and terminal-state bookkeeping stay synchronized.",
  },
]

export function SettingsView() {
  const [theme, setTheme] = useState("temple")
  const [toggles, setToggles] = useState<Toggle[]>([
    { key: "sound", label: "Sound Effects", desc: "Tactile clicks, captures, and victory chimes", icon: Volume2, on: !sounds.isMuted() },
    { key: "anim", label: "Dynamic Animations", desc: "Piece sliding, radiant captures, and pulse indicators", icon: Sparkles, on: true },
    { key: "hints", label: "Tactical Move Hints", desc: "Highlight valid steps, custody threats, and Rek", icon: Eye, on: true },
    { key: "notify", label: "Match Notifications", desc: "Receive turn reminders when in background", icon: Bell, on: false },
  ])

  const flip = (key: string) => {
    setToggles((t) =>
      t.map((x) => {
        if (x.key === key) {
          const nextVal = !x.on
          if (key === "sound") {
            const isMuted = sounds.toggleMute()
            if (!isMuted) {
              sounds.playSelect()
            }
          }
          return { ...x, on: nextVal }
        }
        return x
      }),
    )
  }

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId)
    sounds.playSelect()
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-rise">
      <header className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold shadow-sm mb-2">
          <Sliders className="size-3.5" />
          <span>System & Visuals</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your board aesthetics, audio feedback, and game hints.</p>
      </header>

      {/* board theme */}
      <section className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Palette className="size-4.5 text-gold" />
          <h2 className="font-display text-base font-bold text-foreground">Board Themes</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BOARD_THEMES.map((t) => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                aria-pressed={active}
                className={cn(
                  "group rounded-2xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5",
                  active
                    ? "border-gold bg-gold/10 ring-2 ring-gold/50 shadow-md shadow-gold/20"
                    : "border-border/80 bg-background/50 hover:border-gold/40",
                )}
              >
                <span className="grid aspect-square grid-cols-4 overflow-hidden rounded-xl shadow-inner ring-1 ring-border/50">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const row = Math.floor(i / 4)
                    const col = i % 4
                    const isDark = (row + col) % 2 === 1
                    return (
                      <span key={i} style={{ background: isDark ? t.dark : t.light }} />
                    )
                  })}
                </span>
                <span className="mt-2 block text-xs font-bold text-foreground truncate">{t.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* toggles */}
      <section className="mt-4 rounded-3xl border border-border/80 bg-card/80 p-3 backdrop-blur-md shadow-lg">
        <ul className="divide-y divide-border/60">
          {toggles.map((t) => (
            <li key={t.key} className="flex items-center gap-3.5 p-3 rounded-2xl transition-colors hover:bg-accent/40">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-gold shadow-sm">
                <t.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{t.label}</p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={t.on}
                aria-label={t.label}
                onClick={() => flip(t.key)}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 p-0.5 cursor-pointer shadow-inner",
                  t.on ? "bg-gold" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "block size-6 rounded-full bg-background shadow-md transition-transform duration-200",
                    t.on ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* language */}
      <section className="mt-4 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Globe className="size-4.5 text-gold" />
          <h2 className="font-display text-base font-bold text-foreground">Language / ភាសា / Ngôn ngữ</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {["ភាសាខ្មែរ (Khmer)", "Tiếng Việt", "English", "Français"].map((lang, i) => (
            <button
              key={lang}
              type="button"
              onClick={() => sounds.playSelect()}
              className={cn(
                "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                i === 0 || i === 1
                  ? "border-gold bg-gold/15 font-bold text-gold shadow-sm"
                  : "border-border/80 bg-secondary/80 text-muted-foreground hover:text-foreground hover:border-gold/40",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Engine Verification & Test Suite */}
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
          Engine verification runs in GitHub Actions against the repository source of truth. This settings screen does not execute tests and therefore does not claim a live pass/fail result.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Rule source: <code className="text-gold">/HUONG_DAN_LUAT_CO_REK_KHMER.md</code> and <code className="text-gold">/SPEC_ENGINE_CO_REK_KHMER.md</code>.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
          {ENGINE_SUITES.map((suite) => (
            <div key={suite.title} className="rounded-xl border border-border/70 bg-background/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{suite.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-gold">Automated</span>
              </div>
              <p className="mt-1 leading-relaxed text-muted-foreground">{suite.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-[0.99]"
      >
        <LogOut className="size-4.5" />
        <span>Sign Out</span>
      </button>

      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">Rek Khmer Chess · Angkor Edition v1.0.0</p>
    </div>
  )
}
