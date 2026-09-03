# Rek Khmer UI v2 — OpenDesign Brief

## Repository scope

This design task applies only to `machxanht/Rek-Khmer-Chess`.

Read `AGENTS.md` before changing code. Do not modify the foundational rule documents or reinterpret engine semantics.

Protected gameplay sources:

- `lib/rek-engine/**`
- `hooks/use-rek-engine.ts` unless a presentation-only adapter change is strictly required
- `HUONG_DAN_LUAT_CO_REK_KHMER.md`
- `SPEC_ENGINE_CO_REK_KHMER.md`
- `PLAN_PHAT_TRIEN_CO_REK.md`

The engine is authoritative. The UI consumes engine state and legal move results; it never reimplements Rek, Poat, Min Rek Chanh, movement, capture, win, or draw rules.

## Product

Rek Khmer (រែកខ្មែរ) is a Cambodian strategy board game. The redesign should feel like a serious national strategy game rather than a generic game template.

Primary offline experiences:

1. Local Pass & Play
2. Play vs Khmer AI
3. Tactical Puzzles
4. How to Play

Online remains secondary and must not drive the visual system or implementation scope.

## Design problem

The current UI contains good Khmer/Angkor motifs but uses too many floating cards, rounded containers, badges, glows, and competing accents. Game screens do not give the board enough visual authority.

The redesign must reduce decoration while increasing identity.

## Direction — Angkor Night Court

A restrained competitive-game interface inspired by:

- dark temple stone after sunset
- worn sandstone game surfaces
- aged bronze and muted gold details
- oxidized teal for the opposing side
- lacquer/cinnabar red for the local side
- carved Khmer geometry used as framing, not wallpaper

The memorable quality should be: **a physical Rek board resting inside a quiet Angkor chamber**.

## Anti-slop rules

Do not use:

- purple/blue AI gradients
- generic SaaS cards everywhere
- glassmorphism as the primary visual language
- excessive `rounded-2xl` / `rounded-3xl`
- glow on every active element
- emoji as product iconography
- fake stats, rankings, matchmaking, or social metrics
- decorative motion that competes with board state
- large marketing copy inside gameplay screens

Use one dominant accent per state. Gold is ceremonial, not a default fill color.

## Information hierarchy

### Home

1. Rek Khmer identity
2. one primary Play action
3. compact Local / AI / Puzzles access
4. How to Play / Settings as secondary navigation

### Mode select

One strong vertical or editorial list. Local, AI, and Puzzles are playable. Online is visually de-emphasized and clearly non-primary.

### Game

1. board
2. turn / compulsory Rek state
3. players and remaining pieces
4. essential actions: undo, history, rules, restart/resign where applicable
5. everything else

On mobile, the board should occupy the largest possible width without overflowing. On desktop, use the extra width for player/status rails rather than making the board tiny inside a centered phone layout.

## Interaction principles

- Legal move information must be understandable without relying only on color.
- Selected square and last move must be clearly distinct.
- Rek and Poat destinations should be tactical marks, not giant badges covering squares.
- Min Rek Chanh compulsory Rek must be unmistakable but not animated continuously.
- Motion should be short, transform/opacity based, and disabled by reduced-motion preference.
- Modal overlays must never leave the board interactive underneath.

## Responsive targets

- 320–430 px mobile portrait
- mobile landscape
- tablet
- 1280+ desktop

Desktop gameplay should become a board-centered 3-column composition when space permits.

## Deliverable order

1. design system contract and tokens
2. app shell
3. home
4. mode selector
5. board and pieces
6. game shell/player/status/controls
7. Local + AI parity
8. Puzzle presentation
9. Rules/Settings/Profile polish
10. final responsive/accessibility verification

## Acceptance gates

Do not weaken tests.

Before merge:

- TypeScript passes
- Next production build passes
- existing engine tests pass
- browser smoke passes in production and development modes
- Local, AI, Puzzle, Rules, Settings all render
- no foundational rules document changed
- no gameplay semantics changed for visual convenience
