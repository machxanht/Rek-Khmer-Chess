# រែកខ្មែរ - Rek Khmer Engine

Pure TypeScript game engine cho **Rek Khmer (ល្បែងរែក)**. Repository này hiện chứa **engine, session API, AI, tournament harness, tests, tactical fixtures và tài liệu luật/research**. UI/web/mobile/server chưa nằm trong repo hiện tại.

## Canonical project model

Project chỉ có **một game**:

```text
REK_KHMER
```

Hai canonical rulesets:

- `REK_STANDARD` — default technical ruleset cho Rek Khmer.
- `MIN_REK_CHANH` — variant có current compulsory-Rek contract; exact historical Hao Rek trigger vẫn đang research.

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

- `RESEARCH_HAO_REK_2026.md` — exact Hao Rek research, source/claim labels, evidence gates.
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

Current engine còn có các interpretations/extensions chưa được gọi historical truth:

- dual-axis Rek => capture 4;
- Poat = BFS connected group + zero orthogonal liberties;
- Rek resolve trước Poat;
- board-global compulsory Rek trong `MIN_REK_CHANH`;
- zero-geometric-move instant win;
- Poat trong Min;
- threefold repetition;
- lone-King draw limit 32.

## Hao Rek research update — 2026-09-06

Một Khmer source ngày **6 November 2013**, ghi tác giả `វិសាល ឧត្តម / Visal Odom` và attribution `ភ្នំពេញប៉ុស្តិ៍ / Phnom Penh Post`, có wording:

```text
បើមានគេបើកឲ្យរែក ខ្លួនត្រូវតែរែក
```

Literal gần nhất:

> “Nếu có người mở cho mình Rek, mình phải Rek.”

Và:

```text
បើមិនរែក ត្រូវតែចាញ់ ដោយស្វ័យប្រវត្តិ
```

Literal:

> “Nếu không Rek thì phải thua một cách tự động.”

Các claim trên được giữ ở mức **SECONDARY**. VOD 2016 có text gần giống và cùng Visal Odom lineage nên không tính là independent source thứ hai.

Điểm quan trọng: source diễn đạt nghĩa vụ theo **opponent action — `បើកឲ្យរែក` — rồi responder phải Rek**, nên hiện có support tốt hơn trước cho candidate **event/action-triggered obligation**. Nó trực tiếp challenge cách engine hiện tại suy obligation chỉ từ “board đang có bất kỳ Rek opportunity nào”.

Tuy nhiên exact geometry vẫn chưa khóa:

- có cần blocking piece rời đi không?
- pair phải newly exposed không?
- pre-existing pair có call không?
- nhiều pair ai chọn?
- verbal call có bắt buộc không?
- obligation lifetime/chain kết thúc thế nào?

Các chi tiết đó vẫn `COMMUNITY SIGNAL / UNVERIFIED`. **Research pass này không đổi gameplay.**

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

`engine.ts` còn export stateful `RekEngine` wrapper cho compatibility, nhưng **new application code nên ưu tiên `RekGame`**. Audit 2026-09-06 ghi nhận một return-value inconsistency giữa hai wrappers khi current Min violation xảy ra; xem audit doc trước khi mở rộng public API.

## Snapshot compatibility

Snapshot schema hiện version `1`:

- loader nhận legacy `mode: "REK_POAT"`;
- normalize sang `REK_STANDARD`;
- legacy repetition keys migrate/merge;
- serializer mới chỉ emit canonical ruleset.

Validation hiện kiểm 64 cells, colors/types/status, piece IDs, captured ownership, counters và basic state shape.

## AI

- `easy`: random có capture bias.
- `medium`: deterministic alpha-beta depth 2.
- `hard`: deterministic depth 3, adaptive depth 4/5 ở narrow endgame.
- legality + exact capture metadata lấy từ `getAllMoveResults()` của core engine.
- AI không tự implement movement/Rek/Poat/Hao legality.

Known technical debt: minimax search không carry session repetition/lone-King history, nên threefold/lone-King project draw extensions chưa được model đầy đủ trong search tree. Actual `RekGame` execution vẫn adjudicate chúng.

## Tactical fixtures

`KHMER_PUZZLES` là **engine training/tactical fixtures**, không tự động là “7 thế truyền thống Khmer”. Một số fixture dùng custom King positions hoặc phụ thuộc current BFS Poat / Rek→Poat ordering. Chỉ gọi puzzle là historical/traditional khi có provenance riêng.

## Checkpoint

Checkpoint gần nhất của project:

```text
Engine regressions: 97/97 PASS
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

Current engine CI chạy typecheck + regression khi engine/scripts/package/tsconfig thay đổi. Audit ghi nhận rule/spec Markdown chưa nằm trong CI path trigger; đây là follow-up item.

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

Không dùng app-store shortcut. Không sửa Min semantics trước khi exact Hao Rek trigger đủ mạnh.