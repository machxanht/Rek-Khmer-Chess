# រែកខ្មែរ - Rek Khmer Engine

Pure TypeScript game engine cho **Rek Khmer (ល្បែងរែក)**. Repository này hiện chứa **engine, session API, AI, tournament harness, tests, tactical fixtures và tài liệu luật/research**. UI/web/mobile/server chưa nằm trong repo hiện tại.

## Canonical project model

Project chỉ có **một game**:

```text
REK_KHMER
```

Hai canonical rulesets:

- `REK_STANDARD` — default technical ruleset cho Rek Khmer.
- `MIN_REK_CHANH` — event-triggered Hao Rek variant using transition-owned `HaoRekContext`; unresolved historical edges are explicit technical policy.

Compatibility only:

```text
REK_POAT -> REK_STANDARD
```

`GameMode` là deprecated alias. Rek và Poat là mechanics; Hao Rek là call/obligation rule-state candidate trong Min Rek Chanh, không phải game mode riêng.

`Local`, `Online`, `vs AI`, `AI vs AI`, `Easy/Medium/Hard` là application match type hoặc AI difficulty, không phải core ruleset.

## Evidence policy

Canonical labels dùng trong project:

- `CONFIRMED`
- `STRONG EVIDENCE`
- `SECONDARY`
- `ENGINE INTERPRETATION`
- `COMMUNITY SIGNAL`
- `UNVERIFIED`
- `UNSUPPORTED`
- `REJECTED AS POSITIVE EVIDENCE`

Google Play / Apple App Store developer descriptions, app tutorials, screenshots, app behavior và scraper/copy của chúng **không được dùng làm positive rule evidence**. User comments có thể được đọc như `COMMUNITY SIGNAL` để tìm edge case/keyword/fixture, nhưng không tự khóa SPEC hay engine.

Các tài liệu chính:

- `RESEARCH_FINAL_V1_FREEZE.md` — frozen v1 evidence matrix + reopen criteria.
- `RESEARCH_HAO_REK_2026.md` — Hao Rek research, media evidence, source/claim labels.
- `RESEARCH_LUAT_REK_KHMER_2026.md` — source registry + gameplay evidence matrix.
- `HUONG_DAN_LUAT_CO_REK_KHMER.md` — evidence-based rule guide.
- `SPEC_ENGINE_CO_REK_KHMER.md` — current technical contract.
- `ENGINE_ARCHITECTURE_REK_KHMER.md` — architecture + rule/state boundaries.
- `PLAN_PHAT_TRIEN_CO_REK.md` — roadmap.
- `AUDIT_REK_KHMER_2026-09-06.md` — full repo/game audit và prioritized next work.

## Canonical setup

Bàn 8×8, mỗi bên 1 King + 15 Men:

```text
    a   b   c   d   e   f   g   h
8   ●   ●   ●   ●   ●   ●   ●   .
7   .   .   .   .   .   .   .   ♚
6   ●   ●   ●   ●   ●   ●   ●   ●
5   .   .   .   .   .   .   .   .
4   .   .   .   .   .   .   .   .
3   ○   ○   ○   ○   ○   ○   ○   ○
2   ♔   .   .   .   .   .   .   .
1   .   ○   ○   ○   ○   ○   ○   ○
```

- White/`you`: King `a2`; Men `b1-h1`, `a3-h3`; `a1` empty.
- Black/`opp`: King `h7`; Men `a6-h6`, `a8-g8`; `h8` empty.
- Hai bên đối xứng quay 180°.

**Không restore initial setup King d1/d8 cũ.** Custom test/puzzle positions có thể đặt King ở ô khác nhưng đó không phải initial setup.

## Evidence-backed core vs engine interpretation

Evidence mạnh hiện hỗ trợ:

- Rek là trò Khmer;
- board 8×8;
- 1 King + 15 Men mỗi bên;
- một quân mỗi lượt;
- mục tiêu capture opposing King;
- two-sided Rek capture;
- trapping/encirclement concept;
- canonical setup + regular orthogonal sliding có secondary support mạnh.

Current engine còn có interpretations/extensions chưa được gọi historical truth:

- dual-axis Rek => capture 4;
- Poat = BFS connected group + zero orthogonal liberties;
- Rek resolve trước Poat;
- newly-created-response diff as the exact Hao transition predicate;
- responder-choice policy when one move creates multiple NEW Hao responses;
- stationary King in Min;
- zero-geometric-move instant win;
- Poat in Min;
- threefold repetition;
- lone-King draw limit 32.

## Hao Rek v1

Research + reconstructable real-board media support an event/action-triggered obligation more strongly than the old board-global interpretation.

Current v1 engine:

```text
BEFORE responder Rek set
→ opponent move
→ AFTER responder Rek set
→ NEW = AFTER - BEFORE
→ active HaoRekContext.allowedResponses
→ responder answers NEW response
→ response may create counter-Hao
```

Board-global “any Rek exists => compulsory” is no longer the engine contract.

Historical edges still not promoted as truth:

- multiple NEW responses: responder-choice is a technical policy;
- verbal call is not required by software;
- Poat-in-Min remains unverified;
- King stationary in Min remains historically unverified;
- zero-geometric-move instant win remains an engine interpretation.

See `RESEARCH_FINAL_V1_FREEZE.md` for the frozen evidence matrix and reopen criteria.

## Core modules

- `lib/rek-engine/types.ts` — canonical rulesets, compatibility inputs, state types.
- `lib/rek-engine/catalog.ts` — single-game identity + presentation metadata.
- `lib/rek-engine/captures.ts` — current Rek + Poat primitives.
- `lib/rek-engine/engine.ts` — setup, geometry, move resolution, terminal/draw adjudication.
- `lib/rek-engine/session.ts` — `RekGame`, canonical state, undo, snapshot validation/migration.
- `lib/rek-engine/ai.ts` — engine-backed AI search.
- `lib/rek-engine/ai-tournament.ts` — deterministic Hard-vs-Medium tournament harness.
- `lib/rek-engine/puzzles.ts` — curated **engine tactical fixtures**.

## Public API

Application code mới nên dùng `RekGame`:

```ts
import {
  REK_GAME,
  coordToIdx,
  createGame,
  getRuleSetMetadata,
  listRuleSets,
  type CanonicalGameState,
  type RuleSet,
  type RuleSetInput,
} from './lib/rek-engine'

console.log(REK_GAME.id) // REK_KHMER
console.log(listRuleSets().map((ruleset) => ruleset.id))
// ['REK_STANDARD', 'MIN_REK_CHANH']

const requested: RuleSetInput = 'REK_STANDARD'
const game = createGame(requested)
const state: CanonicalGameState = game.getState()
const ruleset: RuleSet = state.mode

const from = coordToIdx('a3')
const to = coordToIdx('a4')

if (game.getLegalMoves(from).includes(to)) {
  game.makeMove(from, to)
}
```

Public type boundary:

- `RuleSet` — canonical values only.
- `RuleSetInput` — canonical + legacy `REK_POAT` input.
- `CanonicalGameState` — public normalized state; never emits `REK_POAT`.
- `GameState` — compatibility/custom-load shape.
- `GameMode` — deprecated.

`engine.ts` còn export stateful `RekEngine` wrapper cho compatibility, nhưng **new application code nên ưu tiên `RekGame`**. `RekEngine` is deprecated and its state-change semantics are regression-locked to match `RekGame`.

## Snapshot compatibility

Snapshot schema hiện version `1`:

- loader nhận legacy `mode: "REK_POAT"`;
- normalize sang `REK_STANDARD`;
- legacy repetition keys migrate/merge;
- serializer mới chỉ emit canonical ruleset.

Validation hiện kiểm structural shape plus persisted semantic invariants for Kings/status, Hao context, repetition identity and lone-King counters.

## AI

- `easy`: random có capture bias.
- `medium`: deterministic alpha-beta depth 2.
- `hard`: deterministic depth 3, adaptive depth 4/5 ở narrow endgame.
- live/tournament legality uses state-aware engine boundaries;
- AI does not implement movement/Rek/Poat/Hao independently;
- live search carries engine-owned repetition/lone-King draw state.

## Tactical fixtures

`KHMER_PUZZLES` là **engine training/tactical fixtures**, không tự động là “7 thế truyền thống Khmer”. Một số fixture dùng custom King positions hoặc phụ thuộc current BFS Poat / Rek→Poat ordering. Chỉ gọi puzzle là historical/traditional khi có provenance riêng.

## Checkpoint

Checkpoint gần nhất của project:

```text
Engine regressions: 109/109 PASS
Medium baseline: 798 nodes
Hard baseline: 7,532 nodes / 652 cutoffs
Tournament smoke illegalMoves = 0
Observed runner test runtime: ~77s -> ~16s after legal-move pipeline optimization
```

## Test

```bash
npm install --no-package-lock
npm run typecheck
npm test
```

Tournament:

```bash
npm run tournament:ai
node scripts/run-ai-tournament.cjs --games-per-mode=10 --opening-plies=4 --max-plies=160
npm run tournament:ai:200
```

Engine CI runs typecheck + regressions for engine/scripts/package/tsconfig and canonical rule/spec/research Markdown (`RESEARCH_*.md`).

## Rule-change workflow

```text
research evidence
→ HUONG_DAN confidence promotion
→ SPEC technical decision
→ failing board regression
→ engine
→ session/snapshot migration if needed
→ AI/tournament verification
```

Không dùng app-store shortcut. Research v1 is frozen; reopen rule semantics only on materially stronger evidence.