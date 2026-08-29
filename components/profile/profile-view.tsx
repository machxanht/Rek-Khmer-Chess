"use client"

import { PieceToken } from "@/components/game/piece-token"
import { Trophy, Flame, Crown, Swords, TrendingUp, Medal, Sparkles, Award } from "lucide-react"

const stats = [
  { label: "Competitive Rank", value: "Nokor III", icon: Medal, tone: "gold" as const },
  { label: "Rek Rating", value: "1,486", icon: TrendingUp, tone: "plain" as const },
  { label: "Win Streak", value: "5 🔥", icon: Flame, tone: "plain" as const },
]

const record = { wins: 42, losses: 19, draws: 7 }
const totalGames = record.wins + record.losses + record.draws
const winRate = Math.round((record.wins / totalGames) * 100)

const history = [
  { opponent: "SoreiyaKh", result: "win" as const, reason: "Rek in 34 turns", when: "2h ago" },
  { opponent: "TevodaBot", result: "win" as const, reason: "King flanked", when: "Yesterday" },
  { opponent: "Chaktrang_99", result: "loss" as const, reason: "Trapped on edge", when: "Yesterday" },
  { opponent: "NeakTa", result: "win" as const, reason: "Resignation", when: "2d ago" },
  { opponent: "Apsara_Q", result: "draw" as const, reason: "Stalemate hold", when: "3d ago" },
]

const achievements = [
  { label: "First Rek Master", desc: "Win your first custodial match", earned: true, icon: Crown },
  { label: "Wall Tactician", desc: "Capture 3 pieces against borders in one game", earned: true, icon: Swords },
  { label: "Unbroken Spirit", desc: "Win 5 competitive games in a row", earned: true, icon: Flame },
  { label: "Grand Nokor Champion", desc: "Reach 1,800 master rating", earned: false, icon: Trophy },
]

export function ProfileView() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-rise">
      {/* header card */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xl">
        <div className="h-24 w-full bg-gradient-to-r from-gold/30 via-gold/15 to-transparent border-b border-gold/20" />
        <div className="flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12 flex size-24 items-center justify-center rounded-3xl border-2 border-gold bg-secondary shadow-2xl ring-4 ring-gold/20">
            <div className="size-16 flex items-center justify-center">
              <PieceToken piece={{ player: "you", king: true, id: "avatar" }} size="board" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Bopha Nak</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-gold ring-1 ring-gold/40">
                <Sparkles className="size-3" />
                Pro
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">@bopha · Angkor Grandmaster League</p>
          </div>
        </div>
      </section>

      {/* stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={
              "rounded-2xl border p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 " +
              (s.tone === "gold"
                ? "border-gold/50 bg-gradient-to-br from-gold/20 to-card shadow-md shadow-gold/10 ring-1 ring-gold/40"
                : "border-border/80 bg-card/80")
            }
          >
            <div className="flex items-center justify-between">
              <s.icon className={"size-5 " + (s.tone === "gold" ? "text-gold" : "text-muted-foreground")} />
              {s.tone === "gold" && <Award className="size-4 text-gold animate-pulse" />}
            </div>
            <p className="mt-2 font-display text-xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* record bar */}
      <section className="mt-4 rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-base font-bold text-foreground">Battle Record</h2>
          <span className="font-mono text-xs font-semibold text-gold bg-gold-soft px-2 py-0.5 rounded-full ring-1 ring-gold/30">
            {winRate}% Win Rate · {totalGames} Total Matches
          </span>
        </div>
        <div className="mt-3.5 flex h-3.5 overflow-hidden rounded-full bg-secondary/80 p-0.5 ring-1 ring-border/50">
          <div className="bg-opp rounded-l-full shadow-sm" style={{ width: `${(record.wins / totalGames) * 100}%` }} />
          <div className="bg-muted-foreground/40" style={{ width: `${(record.draws / totalGames) * 100}%` }} />
          <div className="bg-destructive rounded-r-full" style={{ width: `${(record.losses / totalGames) * 100}%` }} />
        </div>
        <div className="mt-3 flex gap-4 text-xs font-semibold">
          <Legend swatch="bg-opp" label={`${record.wins} Wins`} />
          <Legend swatch="bg-muted-foreground/40" label={`${record.draws} Draws`} />
          <Legend swatch="bg-destructive" label={`${record.losses} Losses`} />
        </div>
      </section>

      {/* history + achievements */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
          <h2 className="font-display text-base font-bold text-foreground mb-1">Recent Matches</h2>
          <ul className="divide-y divide-border/60">
            {history.map((m, i) => (
              <li key={i} className="flex items-center gap-3 py-3 transition-colors hover:bg-accent/40 rounded-xl px-2">
                <span
                  className={
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase ring-1 shadow-sm " +
                    (m.result === "win"
                      ? "bg-opp/20 text-opp ring-opp/40"
                      : m.result === "loss"
                        ? "bg-destructive/20 text-destructive ring-destructive/40"
                        : "bg-secondary text-muted-foreground ring-border")
                  }
                >
                  {m.result === "win" ? "W" : m.result === "loss" ? "L" : "D"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{m.opponent}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.reason}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">{m.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-lg">
          <h2 className="font-display text-base font-bold text-foreground mb-1">Achievements</h2>
          <ul className="space-y-2.5 mt-2">
            {achievements.map((a) => (
              <li
                key={a.label}
                className={
                  "flex items-center gap-3 rounded-2xl border p-3 transition-all duration-200 " +
                  (a.earned
                    ? "border-gold/40 bg-gold/[0.08] shadow-sm hover:border-gold"
                    : "border-border/60 bg-background/30 opacity-55")
                }
              >
                <span
                  className={
                    "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm " +
                    (a.earned ? "bg-gold text-background font-bold shadow-gold/20" : "bg-secondary text-muted-foreground")
                  }
                >
                  <a.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{a.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={"size-2.5 rounded-full " + swatch} />
      {label}
    </span>
  )
}

