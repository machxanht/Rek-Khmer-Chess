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

`getAllRekOpportunities(board, player, MIN_REK_CHANH)` scan toàn side.

Nếu ít nhất một Rek tồn tại:

```text
rule-legal moves = only moves that produce Rek
```

Nếu caller submit một **geometrically legal quiet move** qua low-level `executeMove()`:

```text
status = won
winner = opponent(mover)
board move is NOT applied
winReason = 'Min Rek Chanh violation: compulsory Rek was ignored'
```

King stationary trong current Min contract.

### 11.2. Research boundary 2026-09-06

Secondary evidence mới mô tả:

```text
opponent បើកឲ្យរែក
→ responder must Rek
→ if not -> automatic loss
```

Điều này trực tiếp challenge giả định rằng **mere existence of any current-board Rek** là exact historical trigger.

Technical decision hiện tại:

- giữ global scan để không thay gameplay trước evidence gate;
- ghi rõ nó là `ENGINE INTERPRETATION / UNVERIFIED`;
- không thêm previous-move/call context cho tới khi exact `បើកឲ្យរែក` geometry được khóa.

### 11.3. Không suy diễn từ community geometry

Các candidate rules như “blocking piece moves away”, “pre-existing pair không call”, “multiple pairs responder chọn” chưa vào SPEC vì mới ở `COMMUNITY SIGNAL / UNVERIFIED`.

---

## 11.4. Proposed Hao Rek transition contract — NOT IMPLEMENTED

Reconstructed real-board evidence now supports an event/transition model more strongly than the current board-global scan.

**Current implementation remains unchanged** until unresolved edge cases are locked.

Candidate future contract:

```ts
interface HaoRekContext {
  active: boolean
  createdByMove: { from: number; to: number } | null
  // Engine-owned responses that were newly created by createdByMove.
  allowedResponses: { from: number; to: number }[]
}
```

Candidate derivation:

```text
before = getAllRekOpportunities(previousBoard, responder)
apply opponent move under core rules
after  = getAllRekOpportunities(nextBoard, responder)

newlyCreated = after - before

if newlyCreated.length > 0:
    nextState.haoRekContext = active(newlyCreated)
else:
    nextState.haoRekContext = inactive
```

Important constraints from evidence:

1. Do **not** implement Hao as `any Rek exists on current board`.
2. Do **not** hard-code only the geometry “blocking piece moves away”; real-board footage also shows a mover entering a new square to create a pair around a gap.
3. Pre-existing Rek opportunities must remain distinguishable from newly-created call responses.
4. A valid response may itself create a new Hao context for the other side, forming a chain.
5. Chain termination candidate: no newly-created Hao response after the latest move.
6. Multiple newly-created responses from one move remain `UNVERIFIED`; do not choose responder-vs-caller policy yet.
7. Verbal declaration remains `UNVERIFIED`.
8. 2013 Khmer text supplies `SECONDARY` support for automatic loss when the required Rek is ignored; exact software representation remains a technical decision.

Snapshot impact if implemented:

- Hao context is transition-derived state and cannot safely be reconstructed from board alone;
- persisted/replay state may need `haoRekContext` or enough previous-move context to deterministically derive it;
- snapshot version/migration must be reviewed before implementation.

AI impact if implemented:

- AI must consume engine-owned `allowedResponses`;
- AI must not diff Rek sets itself;
- tournament/replay tests must include Hao chain state.

No tests or engine code are changed by this documentation section.

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
4. opponent **geometric** move count = 0 -> mover wins (`Opponent completely immobilized (Zero liberties)`).

Evidence boundary:

- capture opposing King = strongest evidence;
- zero-move instant-win = unverified historical interpretation;
- winReason text `Zero liberties` is software wording and should not be treated as proof it is identical to Poat/traditional `ទាល់ច្រក`.

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

Current search state is essentially:

```text
board + side + ruleset
```

It does **not** carry session repetition/lone-King history. Therefore threefold/lone-King draw extensions are adjudicated by session/game execution, not fully modeled inside minimax. This is documented technical debt, not a current ruleset change.

---

## 19. Puzzle contract

`puzzles.ts` contains curated **engine tactical fixtures**. Their solutions must be legal under current engine SPEC.

Important evidence boundary:

- a custom puzzle King on `d1/d8` is not initial setup;
- puzzles that depend on BFS Poat, Rek→Poat ordering or other unverified mechanics demonstrate **current engine behavior**, not automatically “traditional Khmer puzzle truth”.

Future UI copy must preserve this distinction unless a puzzle has independent historical provenance.

---

## 20. Core regression contract

At checkpoint `a783f592...`, project reports **97/97 PASS**.

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