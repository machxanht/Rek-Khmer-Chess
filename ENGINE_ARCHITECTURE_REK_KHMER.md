# SƠ ĐỒ GAME ENGINE REK KHMER

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Ngày cập nhật:** 2026-09-06  
> **Mục tiêu:** mô tả kiến trúc engine sau khi chuẩn hóa Game / RuleSet / MatchType / AI Difficulty và ghi rõ boundary giữa historical evidence với current software contract.

---

## 1. Phân cấp khái niệm

Project chỉ có một game:

```text
Game = REK_KHMER
```

Core engine hỗ trợ hai canonical rulesets:

```text
RuleSet
├── REK_STANDARD
└── MIN_REK_CHANH
```

Compatibility alias:

```text
REK_POAT --normalize--> REK_STANDARD
```

Không phải ruleset:

```text
MatchType
├── LOCAL
├── VS_AI
├── ONLINE
└── AI_VS_AI

AiDifficulty
├── easy
├── medium
└── hard
```

Rek và Poat là mechanics. Hao Rek là rule/state/event candidate trong Min Rek Chanh, không phải game mode.

---

## 2. Repository/module graph hiện tại

```mermaid
flowchart TD
    APP[Future UI / Server / CLI]
    API[index.ts]
    CAT[catalog.ts]
    SESSION[session.ts\nRekGame canonical facade]
    ENGINE[engine.ts\nPure rule adjudication]
    CAP[captures.ts\nRek + Poat primitives]
    TYPES[types.ts]
    AI[ai.ts\nSearch/evaluation]
    TOURNEY[ai-tournament.ts]
    PUZZLES[puzzles.ts]
    TESTS[13 test suites]

    APP --> API
    API --> CAT
    API --> SESSION
    API --> ENGINE
    API --> AI
    API --> PUZZLES

    SESSION --> ENGINE
    SESSION --> TYPES
    ENGINE --> CAP
    ENGINE --> TYPES
    CAP --> TYPES

    AI --> ENGINE
    AI --> CAP
    AI --> TYPES
    TOURNEY --> SESSION
    TOURNEY --> AI

    TESTS --> ENGINE
    TESTS --> SESSION
    TESTS --> AI
    TESTS --> TOURNEY
```

### Trách nhiệm

| Module | Có trách nhiệm | Không được làm |
|---|---|---|
| `types.ts` | data types, canonical rulesets, compatibility input | capture adjudication |
| `catalog.ts` | game identity + presentation metadata | legality/capture |
| `captures.ts` | Rek/Poat primitives | turn/history/session |
| `engine.ts` | setup, movement, preview, execute, terminal/draw | UI/network |
| `session.ts` | canonical state, undo, snapshot validation/migration | duplicate capture logic |
| `ai.ts` | search trên engine-owned legal moves | tự định nghĩa legality |
| `ai-tournament.ts` | deterministic match harness + metrics | đổi rules |
| `puzzles.ts` | engine tactical fixtures | historical provenance tự động |
| future UI/server | render/transport/match lifecycle | duplicate core rules |

---

## 3. Canonical public path

Application code mới nên dùng `RekGame`:

```mermaid
sequenceDiagram
    participant C as Consumer
    participant S as RekGame/session.ts
    participant E as engine.ts
    participant X as captures.ts

    C->>S: createGame(REK_STANDARD)
    S->>E: createInitialState()
    E-->>S: canonical state

    C->>S: getLegalMoves(from)
    S->>E: getMoveResults(board,from,ruleset)
    E->>X: Rek / Poat calculations
    X-->>E: capture metadata
    E-->>S: rule-legal destinations
    S-->>C: targets

    C->>S: makeMove(from,to)
    S->>E: executeMove(state,from,to)
    E->>X: resolve captures
    E-->>S: immutable next state
    S-->>C: state changed?
```

UI/server không được tự quyết “move này Rek/Poat/Hao hợp lệ không?”.

---

## 4. Public API layering

### Canonical session facade

```text
session.ts -> RekGame
```

`RekGame` owns:

- canonical state exposure;
- undo;
- serialization/deserialization;
- legacy snapshot normalization;
- public rule-legal move projection.

### Legacy/secondary stateful wrapper

`engine.ts` còn export class `RekEngine` ngoài pure functions.

Audit 2026-09-06 phát hiện một semantic mismatch:

- `RekGame.makeMove()` có thể trả `true` khi a geometrically legal current-Min quiet move làm state chuyển sang forfeit loss;
- `RekEngine.makeMove()` cũng chuyển state sang loss nhưng trả `false` nếu preview thấy `isHaoRekViolation`.

Đây là **API technical debt**. New consumers phải ưu tiên `RekGame`. Không sửa wrapper trong docs-only pass này.

---

## 5. Ruleset normalization layer

```ts
type RuleSet = 'REK_STANDARD' | 'MIN_REK_CHANH'
type RuleSetInput = RuleSet | 'REK_POAT'
```

```mermaid
flowchart LR
    OLD[REK_POAT input/snapshot] --> N[normalizeRuleSet]
    N --> STD[REK_STANDARD]
    STD --> STATE[canonical public state]
    STATE --> SNAP[new snapshot emits REK_STANDARD]
```

`createPositionKey()` normalize alias trước khi tạo repetition namespace.

Legacy `positionCounts` migrate `REK_POAT|` → `REK_STANDARD|` và merge counts.

---

## 6. Setup pipeline

```text
createGame()
  ↓
DEFAULT_RULESET = REK_STANDARD
  ↓
createInitialState()
  ↓
createInitialBoard()
  ↓
canonical 7 + King + 8
```

```text
8   ● ● ● ● ● ● ● .
7   . . . . . . . ♚
6   ● ● ● ● ● ● ● ●
5   . . . . . . . .
4   . . . . . . . .
3   ○ ○ ○ ○ ○ ○ ○ ○
2   ♔ . . . . . . .
1   . ○ ○ ○ ○ ○ ○ ○
```

Initial Kings luôn `a2` / `h7`. Custom puzzles có thể đặt King ở squares khác nhưng không đổi initial setup.

---

## 7. Move legality layers

```mermaid
flowchart LR
    P[piece] --> GEO[getLegalMoves]
    GEO --> G[geometric destinations]
    G --> RULE[getMoveResults / getAllMoveResults]
    RULE --> R[rule-legal moves + capture metadata]
```

### Geometry

- N/S/E/W sliding;
- empty squares only;
- stop at blocker;
- no jump/diagonal;
- current Min: King stationary.

### Rule legality

- Standard: geometric set remains available;
- Min: active Hao legality is owned by `GameState.haoRekContext`;
- board-only move-result helpers do not invent Hao from existing Rek;
- session/live AI use state-aware legality.

Consumer không dùng geometric set như final legal set.

---

## 8. Rek layer

```text
X | T | X
```

và vertical equivalent.

Current implementation union both axes, nên có thể capture 4.

Evidence boundary:

```text
two-sided pair capture = CONFIRMED
dual-axis => 4         = ENGINE INTERPRETATION / UNVERIFIED
```

Nếu future evidence bác Rek-4, thay đổi tập trung ở `captures.ts` + regression fixtures.

---

## 9. Poat layer

```mermaid
flowchart TD
    A[opponent piece] --> B[BFS same-color orthogonal group]
    B --> C[count adjacent empty cells]
    C --> D{liberties == 0?}
    D -- yes --> E[capture group]
    D -- no --> F[survive]
```

Evidence boundary:

- trapping/encirclement capture concept = confirmed;
- connected component + zero-liberties = engine interpretation;
- edge treatment = engine interpretation;
- timing after Rek = engine interpretation.

---

## 10. Current turn execution

```mermaid
flowchart TD
    A[from -> to] --> B{playing?}
    B -- no --> STOP[no-op]
    B -- yes --> C{piece belongs to turn?}
    C -- no --> STOP
    C -- yes --> D[normalize ruleset]
    D --> E[geometric legality]
    E --> F{legal geometry?}
    F -- no --> STOP
    F -- yes --> G[preview]
    G --> H{current Min violation?}
    H -- yes --> LOSS[forfeit; board unchanged]
    H -- no --> MOVE[apply mover]
    MOVE --> REK[resolve Rek]
    REK --> POAT[resolve Poat]
    POAT --> TERM[terminal]
    TERM --> DRAW[project draw extensions]
    DRAW --> NEXT[next canonical state]
```

---

## 11. `REK_STANDARD`

```text
REK_STANDARD
├── canonical setup
├── regular movement
├── Rek optional under current contract
├── Poat engine interpretation
└── King-capture terminal
```

Tên neutral, không tuyên bố “Rek Poat” là separate traditional mode.

---

## 12. `MIN_REK_CHANH`: current vs candidate historical model

### Current engine model

```text
previous state
   ↓
execute opponent move
   ↓
BEFORE/AFTER responder Rek diff
   ↓
newlyCreated responses
   ↓
HaoRekContext.allowedResponses
   ↓
state-aware response / forfeit
   ↓
derive next Hao context
```

### Evidence update 2026-09-06

Secondary Khmer wording:

```text
opponent បើកឲ្យរែក
→ responder must Rek
→ if not -> automatic loss
```

Do đó candidate historical flow hiện được support hơn:

```mermaid
flowchart LR
    PREV[previous board] --> MOVE[opponent move/action]
    MOVE --> DETECT[detect បើកឲ្យរែក]
    DETECT --> CTX[active Hao Rek obligation]
    CTX --> RESPONSE[allowed response set]
    RESPONSE --> NEXT[next state]
```

Event-triggered Hao is now implemented through Rek-set transition diff. The exact historical rule for multiple NEW responses and verbal calling remains unverified and is kept outside the architecture as technical policy.

---

## 13. Hao Rek state boundary

Current engine uses:

```ts
interface HaoRekContext {
  active: boolean
  createdByMove: { from: number; to: number } | null
  allowedResponses: { from: number; to: number }[]
}
```

Implemented lifecycle:

```text
previous state
   ↓
execute opponent move
   ↓
derive call context from verified rule
   ↓
persist context in canonical state/snapshot
   ↓
next player's rule-legal generation
   ↓
response / violation adjudication
   ↓
expire or chain context by verified rule
```

Snapshot v1 stores Hao context as an additive optional field and validates active response semantics.

---

### 13.1. Reconstructed media implications

Real-board footage `1000009344.mp4` provides multiple reconstructable events:

- blocker leaves the middle square and exposes a new response;
- mover enters a new position and creates a pair around a gap;
- pre-existing Rek can coexist with a newly-created call response;
- one response can create a counter-response and continue the chain.

Therefore future architecture must preserve **transition identity**, not only board identity.

Candidate lifecycle:

```text
previous state
   ↓
compute responder Rek set BEFORE
   ↓
execute opponent move
   ↓
compute responder Rek set AFTER
   ↓
newlyCreated = AFTER - BEFORE
   ↓
persist active Hao context if newlyCreated != empty
   ↓
next player's rule-legal generation exposes engine-owned allowedResponses
   ↓
response / violation adjudication
   ↓
response becomes next transition
   ↓
derive next Hao context
   ↓
chain until no newly-created response exists
```

This is **IMPLEMENTED IN V1**. Multiple-new-target choice and verbal-call requirements remain historically unresolved; responder-choice/no-verbal-state are explicit technical policies.

The board alone is insufficient to distinguish a pre-existing Rek from a newly-created Hao response. This matters for snapshots/replays, undo, online synchronization, AI search and deterministic tournament reconstruction.

---

## 14. Terminal/draw boundary

Current order:

```text
King captured
  ↓
all enemy pieces gone
  ↓
zero geometric moves
  ↓
threefold
  ↓
lone-King limit
```

| Rule | Evidence status |
|---|---|
| King capture = win | strong/confirmed objective |
| zero-move instant win | unverified |
| threefold | project extension |
| lone-King default 32 | project extension |

Zero-move terminal now uses `Opponent has no geometric moves`, keeping mobility distinct from Poat/liberties. The rule itself remains historically unverified.

---

## 15. AI architecture

AI live legal path:

```text
GameState
   ↓
state-aware engine legality
   ↓
engine-owned Hao/Rek/Poat/capture semantics
   ↓
ordering/evaluation/minimaxState
```

Board-only AI helpers remain for compatibility/benchmarks but live/tournament Min legality uses full state.

Điểm tốt:

- AI không duplicate movement/Rek/Poat;
- exact capture metadata được reuse;
- deterministic Medium/Hard regression;
- tournament uses `RekGame` for actual state transitions.

Draw-history debt đã được xử lý trong live state search: repetition history, lone-King counter và draw limit đi qua `GameState` / `executeMove()`. Threefold/lone-King vẫn là project extensions, không phải historical truth.

---

## 16. Puzzle architecture

`puzzles.ts` hiện là **engine tactical fixtures**, không phải database đã chứng minh provenance truyền thống.

Một số fixture phụ thuộc:

- BFS zero-liberties Poat;
- Rek→Poat ordering;
- custom King placements;
- descriptive tactical names.

Future UI phải label đúng “engine training/tactical fixture” trừ khi từng puzzle có nguồn Khmer độc lập.

---

## 17. Test/CI architecture

`npm run test:engine` compile và chạy 13 report groups, gồm core/spec/AI/state/draw/puzzle/simulation/tournament/API locks.

Checkpoint gần nhất trước research freeze: **109/109 PASS**.

CI engine workflow chạy khi paths thay đổi trong:

- `lib/rek-engine/**`;
- `scripts/**`;
- `package.json`;
- `tsconfig.json`;
- workflow itself.

Rule/spec/research Markdown hiện nằm trong CI path trigger, gồm wildcard `RESEARCH_*.md`.

---

## 18. Recommended future application split

```text
Core
├── RuleSet: REK_STANDARD | MIN_REK_CHANH
└── CanonicalGameState

Application
├── MatchType: LOCAL | VS_AI | ONLINE | AI_VS_AI
├── AiDifficulty: easy | medium | hard
├── presentation/i18n/audio
└── networking/replay storage
```

Core không cần biết human/AI/network.

---

## 19. Safe rule-change flow

```text
Khmer evidence / reconstructable board event
        ↓
RESEARCH_HAO / RESEARCH_LUAT
        ↓
HUONG_DAN confidence promotion
        ↓
SPEC technical contract
        ↓
new failing regression fixture
        ↓
core engine
        ↓
session/snapshot migration if needed
        ↓
AI/tournament verification
```

Không dùng app store làm source. Không sửa UI/AI để “bắt chước” rule future trước core.