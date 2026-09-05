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
- current Min: side-wide board scan may suppress quiet moves;
- bulk AI path computes current Min obligation once per position.

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
current board + current player
      ↓
getAllRekOpportunities()
      ↓
any Rek exists?
  ├── no  -> normal geometric moves
  └── yes -> only Rek moves
             quiet geometric submit -> forfeit
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

**Exact `detect បើកឲ្យរែក` predicate vẫn UNVERIFIED.** Không implement candidate architecture trước evidence gate.

---

## 13. Future Hao Rek state boundary

Nếu event-trigger được xác nhận, engine có thể cần:

```ts
interface HaoRekContext {
  active: boolean
  createdByMove: { from: number; to: number } | null
  targetPairs: number[][]
  allowedResponses?: { from: number; to: number }[]
}
```

Possible lifecycle:

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

Nếu thêm context, phải bump/migrate snapshot contract theo nhu cầu thay vì silently deriving from board.

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

Win reason `Opponent completely immobilized (Zero liberties)` hiện dễ gây conflation giữa mobility terminal và Poat/liberties. Đây là naming/semantic cleanup candidate, chưa sửa code trong docs pass.

---

## 15. AI architecture

AI legal path:

```text
board + player + canonical RuleSet
        ↓
getAllMoveResults()
        ↓
engine-owned legal moves + captures
        ↓
ordering/evaluation/minimax
```

Điểm tốt:

- AI không duplicate movement/Rek/Poat;
- exact capture metadata được reuse;
- deterministic Medium/Hard regression;
- tournament uses `RekGame` for actual state transitions.

Technical debt:

- minimax search state không mang `positionCounts`, `loneKingMoveCount`, `drawMoveLimit`;
- vì vậy project draw extensions không được modeled đầy đủ trong search tree;
- tournament/session vẫn adjudicate draws khi move thật được execute.

Không ưu tiên sửa điểm này trước khi rule research/terminal semantics ổn định.

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

Checkpoint gần nhất: **97/97 PASS**.

CI engine workflow chạy khi paths thay đổi trong:

- `lib/rek-engine/**`;
- `scripts/**`;
- `package.json`;
- `tsconfig.json`;
- workflow itself.

**Audit finding:** Markdown rule/spec docs không nằm trong path trigger. Vì docs chính là evidence/contract layer, future CI nên cân nhắc trigger test suite khi `HUONG_DAN`, `SPEC`, `ENGINE_ARCHITECTURE` hoặc research lock-relevant docs thay đổi.

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