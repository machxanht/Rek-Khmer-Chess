# ĐẶC TẢ KỸ THUẬT GAME ENGINE: រែកខ្មែរ - REK KHMER

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Ngày cập nhật contract:** 2026-09-06  
> **Vai trò:** technical contract của code hiện tại.  
> **Không phải:** tuyên bố rằng mọi edge case dưới đây đều đã được lịch sử Khmer xác nhận. Evidence status nằm trong `HUONG_DAN_LUAT_CO_REK_KHMER.md` và research notes.

**Research pass 2026-09-06 không đổi gameplay.** Evidence mới về `បើកឲ្យរែក` được ghi vào guide/research nhưng exact geometry chưa đủ để thay current Min contract.

---

## 1. Terminology contract

### 1.1. Một game

```text
Game = REK_KHMER
```

### 1.2. Canonical rulesets

```ts
export type RuleSet = 'REK_STANDARD' | 'MIN_REK_CHANH'
```

- `REK_STANDARD`: default technical ruleset.
- `MIN_REK_CHANH`: variant với current compulsory-Rek interpretation.

### 1.3. Compatibility input

```ts
export type LegacyRuleSet = 'REK_POAT'
export type RuleSetInput = RuleSet | LegacyRuleSet
/** @deprecated */
export type GameMode = RuleSetInput
```

Normalization:

```text
REK_POAT      -> REK_STANDARD
REK_STANDARD  -> REK_STANDARD
MIN_REK_CHANH -> MIN_REK_CHANH
```

`REK_POAT` không phải canonical ruleset và không được emit trong new public session state/snapshot.

---

## 2. Public metadata contract

Stable single-game identity:

```ts
REK_GAME.id === 'REK_KHMER'
REK_GAME.defaultRuleSet === 'REK_STANDARD'
```

`listRuleSets()` expose đúng hai entries theo stable order:

```text
REK_STANDARD
MIN_REK_CHANH
```

Catalog metadata chỉ dùng presentation/discovery, **không dùng để quyết định legality/capture**.

---

## 3. Data model

Board = flat 64 cells.

```ts
export type PlayerColor = 'you' | 'opp'

export interface Piece {
  player: PlayerColor
  king: boolean
  id: string
}

export type Cell = Piece | null

export interface MoveResult {
  from: number
  to: number
  rekCaptures: number[]
  poatCaptures: number[]
  captures: number[]
  rek: boolean
  poat: boolean
  isHaoRekViolation?: boolean
  sanNotation?: string
}

export interface GameState {
  board: Cell[]
  turn: PlayerColor
  status: 'playing' | 'won' | 'draw'
  winner: PlayerColor | 'draw' | null
  winReason: string | null
  mode: RuleSetInput
  lastMove: { from: number; to: number } | null
  lastCaptured: number[]
  lastRek: boolean
  lastPoat: boolean
  captured: { you: Piece[]; opp: Piece[] }
  moveCount: number
  availableRekMovesCount: number
  positionCounts?: Record<string, number>
  loneKingMoveCount?: number
  drawMoveLimit?: number
}

export type CanonicalGameState =
  Omit<GameState, 'mode'> & { mode: RuleSet }
```

`GameState` là compatibility/custom-load shape. `RekGame.getState()` và `deserializeGameState()` trả `CanonicalGameState`.

### 3.1. Hao Rek state boundary

Current state **không có explicit Hao Rek call context**. Current Min obligation được suy hoàn toàn từ current board.

Nếu future evidence xác nhận event-trigger semantics, board-only state có thể không đủ. Candidate future shape:

```ts
interface HaoRekContext {
  active: boolean
  createdByMove: { from: number; to: number } | null
  targetPairs: number[][]
  allowedResponses?: { from: number; to: number }[]
}
```

**Không implement field này trước khi exact trigger/response/lifetime được evidence-lock.**

---

## 4. Coordinates

Public notation:

```text
files: a b c d e f g h
ranks: 1 2 3 4 5 6 7 8
```

Internal:

```text
index = row * 8 + col
row 0 = rank 8
row 7 = rank 1
col 0 = file a
col 7 = file h
```

Conversion:

```ts
row = 8 - rank
col = file.charCodeAt(0) - 'a'.charCodeAt(0)
```

---

## 5. Initial setup — canonical lock

Mỗi bên 16 quân = 1 King + 15 Men.

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

White / `you`:

- King `a2`;
- Men `b1-h1`;
- Men `a3-h3`;
- `a1` empty.

Black / `opp`:

- King `h7`;
- Men `a6-h6`;
- Men `a8-g8`;
- `h8` empty.

Hai sides đối xứng 180°; setup giống nhau ở cả hai ruleset.

**Initial setup d1/d8 cũ bị loại và không được phục hồi.** Custom fixtures/puzzles có thể đặt King ở ô khác nhưng không được hiểu là initial setup.

---

## 6. Geometric movement

`getLegalMoves(board, from, mode)` trả geometric destinations.

Rules:

1. piece phải tồn tại;
2. scan 4 hướng orthogonal;
3. add empty squares liên tiếp trên ray;
4. stop tại occupied square hoặc edge;
5. occupied square không là destination;
6. không jump;
7. không diagonal.

Current `MIN_REK_CHANH`: King trả zero geometric moves.

`getLegalMoves()` **không phải final rule-legal set** trong Min. Public/search consumer dùng `getMoveResults()` / `getAllMoveResults()` / `RekGame.getLegalMoves()`.

---

## 7. Rek capture primitive

Sau khi mover tới landing square `T`:

```text
Horizontal: Enemy | T | Enemy

Vertical:   Enemy
              |
              T
              |
            Enemy
```

`checkRekCaptures()` kiểm hai trục độc lập và union victims.

Current consequence:

- một trục đúng -> 2 captures;
- cả hai trục đúng -> 4 captures.

Evidence boundary:

- two-sided pair capture = confirmed core principle;
- dual-axis four-capture = current engine interpretation, historical semantics unverified.

---

## 8. Poat capture primitive

`checkPoatCaptures(board, oppPlayer)`:

1. duyệt opponent piece chưa visited;
2. BFS connected component cùng màu qua 4 hướng;
3. đếm adjacent empty cells;
4. group có zero liberties -> capture toàn group.

```text
for opponent group C:
    liberties(C) = adjacent empty orthogonal cells
    if liberties(C) == 0:
        capture C
```

Board edge không tạo liberty.

Evidence boundary:

- trapping/encirclement capture concept có evidence mạnh;
- exact connected-component/liberty algorithm = engine interpretation.

---

## 9. Move resolution pipeline

`resolveValidatedMove()` / `previewMove()` current flow:

```text
1. normalize ruleset
2. validate mover/piece
3. validate geometric move
4. current MIN obligation check
5. move on temporary board
6. resolve Rek
7. remove Rek victims
8. resolve Poat on post-Rek board
9. union capture metadata
```

Current `Rek -> Poat` ordering là **technical contract**, không historical claim.

---

## 10. `REK_STANDARD`

Current behavior:

- canonical setup;
- geometric orthogonal movement;
- King moves theo same geometric core;
- Rek opportunity không suppress quiet moves;
- Rek + Poat theo sections 7–9;
- King capture decisive.

Không có global compulsory-Rek filter.

---

## 11. `MIN_REK_CHANH`

### 11.1. Current software contract

`MIN_REK_CHANH` uses transition-owned Hao Rek state.

```text
before = responder Rek opportunities before opponent move
execute opponent move
after = responder Rek opportunities after move
newlyCreated = after - before

newlyCreated.length > 0
→ state.haoRekContext.active = true
→ allowedResponses = all newly-created Rek responses
```

State-aware legality exposes only `allowedResponses` while Hao is active.

Submitting a geometrically legal move outside active `allowedResponses`:

```text
status = won
winner = opponent(mover)
board move is NOT applied
winReason = 'Min Rek Chanh violation: active Hao Rek response was ignored'
```

Technical-policy boundaries:

- multiple NEW responses: responder may choose any;
- verbal call is not required by software;
- response may create a counter-Hao context;
- chain ends when the latest move creates no new response;
- Poat behavior remains unchanged pending stronger evidence;
- King stationary remains current engine interpretation, not historical-confirmed truth.

### 11.2. Hao state persistence

`GameState.haoRekContext` is persisted because board state alone cannot distinguish pre-existing Rek from a newly-created Hao response.

Repetition identity includes the active Hao response set.

Snapshot loader validates that active Hao responses are legal Rek responses for the side to move.

### 11.3. Evidence boundary

Implemented transition semantics are the project v1 model supported by the strongest available evidence.

Historical claims still unresolved:

- mandatory verbal declaration;
- exact traditional choice rule when one move creates multiple NEW responses;
- whether Poat belongs inside Min Rek Chanh;
- King stationary semantics;
- exact interaction with multi-axis Rek.

These remain replaceable technical-policy boundaries, not promoted historical truth.

---

## 12. Rule-legal generation boundary

### `getMoveResults(board, from, mode)`

- piece-specific;
- computes current Min side-wide compulsory set;
- only returns allowed destinations;
- resolves exact engine capture metadata once.

### `getAllMoveResults(board, player, mode)`

Preferred AI/search boundary:

- computes current side-wide Min obligation once;
- generates all rule-legal moves;
- returns engine-owned Rek/Poat/capture metadata.

AI không được gọi geometry rồi tự suy capture/obligation.

---

## 13. Execute move

`executeMove(state, from, to)`:

```text
state playing?
  ↓
piece belongs to turn?
  ↓
normalize ruleset
  ↓
geometric legal?
  ↓
previewMove
  ↓
MIN violation? -> forfeit state; board unchanged
  ↓ otherwise
apply move
  ↓
remove captures
  ↓
terminal checks
  ↓
project draw checks
  ↓
metadata + next turn
```

Input state không mutate.

---

## 14. Terminal contract

Current decisive checks after a normal executed move:

1. opponent King missing -> mover wins (`Royal King Captured`);
2. mover King missing -> opponent wins (`Self King Lost`);
3. opponent has zero pieces -> mover wins;
4. opponent **geometric** move count = 0 -> mover wins (`Opponent has no geometric moves`).

Evidence boundary:

- capture opposing King = strongest evidence;
- zero-move instant-win = unverified historical interpretation;
- zero-geometric-move remains an engine interpretation and is intentionally named separately from Poat/liberties.

---

## 15. Draw extensions

### Threefold repetition

Position key includes:

```text
canonical ruleset + side to move + board occupancy/type
```

Does not include piece IDs/cosmetic metadata. Third occurrence -> draw.

### Lone King

Default:

```ts
DEFAULT_LONE_KING_DRAW_LIMIT = 32
```

Counter begins after lone-King state already exists; reaching limit -> draw.

Evidence status for both: **project extensions / unsupported as traditional Rek claims**.

---

## 16. Snapshot / migration

Snapshot version remains `1`.

Loader accepts legacy `REK_POAT`; session normalizes to `REK_STANDARD`; serializer emits canonical value only.

Legacy repetition keys:

```text
REK_POAT|... -> REK_STANDARD|...
```

Counts are merged if canonical key already exists.

Snapshot validation enforces:

- exactly 64 board cells;
- canonical coordinate APIs accept only lowercase `a1`–`h8`;
- playing/draw snapshots contain exactly one King per side;
- won snapshots retain the winner King;
- active Hao context is valid only in playing `MIN_REK_CHANH` and its responses remain legal Rek;
- valid player/ruleset/status;
- max one King per side on board;
- unique piece IDs across board + captured arrays;
- valid captured/player ownership;
- nonnegative move/counter fields;
- positive repetition counts and draw limit.

---

## 17. Session/API contract

Canonical facade for application consumers:

```ts
createGame(ruleset?)
RekGame.getState()
RekGame.getLegalMoves(from)
RekGame.previewMove(from, to)
RekGame.makeMove(from, to)
RekGame.undo()
RekGame.canUndo()
RekGame.reset(ruleset?)
RekGame.serialize()
deserializeGame(snapshot)
```

Default:

```ts
createGame() === createGame('REK_STANDARD')
```

`RekGame.previewMove()` returns only **rule-legal** move result or `null`; a current-Min quiet forfeiting move is not exposed as preview-legal.

`RekGame.makeMove()` delegates to `executeMove()`. A geometrically legal current-Min violation therefore can transition the game to a loss state and return `true` because state changed.

### Legacy `RekEngine` wrapper

`engine.ts` still exports a stateful `RekEngine` compatibility wrapper in addition to `RekGame`. New UI/server integration should prefer `RekGame`.

Current audit found return-value semantics differ on Hao Rek violation between these wrappers; this is **technical debt**, not a rule decision. See `AUDIT_REK_KHMER_2026-09-06.md`.

---

## 18. AI contract

AI:

- accepts canonical `RuleSet` internally;
- gets candidates + exact captures from `getAllMoveResults()`;
- does not reimplement movement/Rek/Poat/Hao legality;
- Medium/Hard deterministic;
- tournament output canonicalizes ruleset.

Live AI search consumes full `GameState`, including Hao context, repetition counts, lone-King count and draw limit. Engine terminal outcomes remain authoritative; AI does not duplicate Hao or draw adjudication.

---

## 19. Puzzle contract

`puzzles.ts` contains curated **engine tactical fixtures**. Their solutions must be legal under current engine SPEC.

Important evidence boundary:

- a custom puzzle King on `d1/d8` is not initial setup;
- puzzles that depend on BFS Poat, Rek→Poat ordering or other unverified mechanics demonstrate **current engine behavior**, not automatically “traditional Khmer puzzle truth”.

Future UI copy must preserve this distinction unless a puzzle has independent historical provenance.

---

## 20. Core regression contract

Current Rek v1 freeze checkpoint reports **109/109 PASS**.

Required groups include:

### Core

- horizontal/vertical Rek;
- geometry legality;
- corner/connected Poat;
- current Min compulsory forfeit.

### Setup/movement/spec locks

- canonical a2/h7 setup;
- a1/h8 gaps;
- no jump/occupied destination;
- Standard optional Rek;
- Min current filtering;
- King ruleset difference;
- Rek-before-Poat pipeline;
- immutable execution;
- terminal/draw invariants.

### Public API

```text
createGame().mode == REK_STANDARD
createGame(REK_POAT).mode == REK_STANDARD
legacy snapshot loads
legacy repetition keys migrate
new snapshot emits REK_STANDARD
```

### AI/tournament

- engine-owned legality boundary;
- deterministic Medium/Hard search baselines;
- tournament illegalMoves = 0.

---

## 21. Change control

Traditional-rule change workflow:

```text
RESEARCH evidence
        ↓
HUONG_DAN confidence promotion
        ↓
SPEC technical decision
        ↓
new failing regression fixture
        ↓
engine implementation
        ↓
session/snapshot migration if state shape changes
        ↓
AI/tournament verification
```

Không sửa AI/UI để giả lập rule mới trước core engine. Không thay current Min semantics chỉ vì event-trigger model hiện có evidence tốt hơn; exact trigger vẫn chưa đủ.