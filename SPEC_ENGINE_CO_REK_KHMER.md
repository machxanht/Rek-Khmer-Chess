# ĐẶC TẢ KỸ THUẬT GAME ENGINE: រែកខ្មែរ - REK KHMER

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Vai trò:** technical contract của code hiện tại.  
> **Không phải:** tuyên bố rằng mọi edge case dưới đây đều đã được lịch sử Khmer xác nhận. Evidence status nằm trong `HUONG_DAN_LUAT_CO_REK_KHMER.md`.

---

## 1. TERMINOLOGY CONTRACT

### 1.1. Một game

```text
Game = REK_KHMER
```

### 1.2. Canonical rule sets

```ts
export type RuleSet = 'REK_STANDARD' | 'MIN_REK_CHANH'
```

- `REK_STANDARD`: default technical ruleset.
- `MIN_REK_CHANH`: variant với current compulsory-Rek interpretation.

### 1.3. Legacy compatibility

```ts
export type LegacyGameMode = 'REK_POAT'
```

`REK_POAT` không còn là canonical ruleset name. Mọi public session/snapshot phải normalize:

```text
REK_POAT -> REK_STANDARD
```

`GameMode` chỉ còn là backward-compatible input union. New code nên dùng `RuleSet`.

---

## 2. DATA MODEL

Engine dùng flat board 64 cells.

```ts
export type PlayerColor = 'you' | 'opp'

export interface Piece {
  player: PlayerColor
  king: boolean
  id: string
}

export type Cell = Piece | null

export interface GameState {
  board: Cell[]
  turn: PlayerColor
  status: 'playing' | 'won' | 'draw'
  winner: PlayerColor | 'draw' | null
  winReason: string | null
  mode: GameMode
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
```

`mode` được giữ tên field cũ để snapshot/API compatibility; canonical runtime value từ `RekGame` là `REK_STANDARD` hoặc `MIN_REK_CHANH`.

---

## 3. COORDINATES

Public coordinate notation:

```text
files: a b c d e f g h
ranks: 1 2 3 4 5 6 7 8
```

Internal board:

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

## 4. INITIAL SETUP

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

White/`you`:

- King `a2`.
- Men `b1-h1`.
- Men `a3-h3`.

Black/`opp`:

- King `h7`.
- Men `a6-h6`.
- Men `a8-g8`.

Setup giống nhau ở cả hai ruleset.

---

## 5. GEOMETRIC MOVEMENT

`getLegalMoves(board, from, mode)` tạo geometric destinations.

Rule:

1. piece phải tồn tại;
2. scan 4 hướng trực giao;
3. mỗi ray thêm empty squares liên tiếp;
4. stop tại first occupied square hoặc board edge;
5. occupied square không bao giờ là destination;
6. không nhảy;
7. không đi chéo.

Current `MIN_REK_CHANH` contract: King không có geometric move.

`getLegalMoves()` **không phải final rule-legal set** trong Min. Consumer dùng `getMoveResults()` hoặc `RekGame.getLegalMoves()`.

---

## 6. REK CAPTURE PRIMITIVE

Sau khi mover tới landing square `T`:

Horizontal:

```text
Enemy | T | Enemy
```

Vertical:

```text
Enemy
  |
  T
  |
Enemy
```

`checkRekCaptures()` kiểm hai trục độc lập và union victims.

Current consequence:

- một trục đúng → 2 captures;
- cả hai trục đúng → 4 captures.

**Evidence note:** pair capture là core principle mạnh; dual-axis 4 vẫn là engine interpretation chưa native-confirmed đủ mạnh.

---

## 7. POAT CAPTURE PRIMITIVE

`checkPoatCaptures(board, oppPlayer)`:

1. duyệt từng opponent piece chưa visited;
2. BFS connected component cùng màu qua 4 hướng;
3. trong BFS, đếm adjacent empty cells;
4. nếu group có `0 liberties` → capture toàn group.

Pseudo-flow:

```text
for opponent group C:
    liberties(C) = adjacent empty orthogonal cells
    if liberties(C) == 0:
        capture C
```

Board edge không tạo liberty.

**Evidence note:** surrounding/no-escape capture có evidence; exact connected-component/liberty algorithm là technical interpretation.

---

## 8. MOVE PREVIEW PIPELINE

`previewMove(board, from, to, mover, mode)`:

```text
1. normalize ruleset
2. validate mover/piece
3. validate geometric move
4. current MIN obligation check
5. move piece on temporary board
6. resolve Rek
7. remove Rek victims
8. resolve Poat on post-Rek board
9. return MoveResult
```

`MoveResult`:

```ts
interface MoveResult {
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
```

---

## 9. `REK_STANDARD`

Canonical default.

Current behavior:

- normal geometric movement;
- King moves theo geometric core;
- Rek opportunity không suppress quiet move;
- Rek + Poat resolution theo sections 6-8;
- King capture is decisive.

Không có global compulsory-Rek filter.

---

## 10. `MIN_REK_CHANH`

### 10.1. Current engine interpretation

`getAllRekOpportunities(board, player, MIN_REK_CHANH)` scan toàn side.

Nếu ít nhất một Rek tồn tại:

```text
rule-legal moves = only moves that produce Rek
```

Nếu user/client submit một geometric quiet move bất chấp obligation:

```text
status = won
winner = opponent(mover)
board move is not applied
```

King stationary trong current Min contract.

### 10.2. Research boundary

Exact traditional trigger vẫn `UNVERIFIED`. Không được suy diễn thêm rằng current global scan chính là Hao Rek lịch sử.

Nếu future research xác nhận Hao Rek phụ thuộc previous move/call/target pair, `GameState` có thể cần explicit context; thay đổi đó phải đi qua guide + spec + tests trước khi code.

---

## 11. EXECUTE MOVE

`executeMove(state, from, to)`:

```text
playing?
  ↓
piece belongs to turn?
  ↓
normalize ruleset
  ↓
geometric legal?
  ↓
previewMove
  ↓
MIN violation? -> current forfeit path
  ↓
apply move
  ↓
remove all preview captures
  ↓
terminal checks
  ↓
draw extensions
  ↓
update metadata / switch turn
```

Input state không được mutate.

---

## 12. TERMINAL CONTRACT

Current decisive checks:

1. opponent King missing → mover wins (`Royal King Captured`);
2. mover King missing → opponent wins;
3. opponent has zero pieces → mover wins;
4. opponent geometric move count = 0 → mover wins under current engine contract.

**Evidence note:** King capture strong/confirmed; zero-move instant-win edge case remains unverified historically.

---

## 13. DRAW EXTENSIONS

Current project extensions:

### Threefold

Position key includes:

```text
canonical ruleset + side to move + board occupancy/type
```

Không include piece IDs/cosmetic metadata.

Third occurrence → draw.

### Lone King

Nếu một side chỉ còn King, engine có counter. Default:

```ts
DEFAULT_LONE_KING_DRAW_LIMIT = 32
```

Khi counter đạt limit → draw.

**Evidence status:** both are project extensions until traditional Rek evidence is found.

---

## 14. RULESET / SNAPSHOT MIGRATION

`normalizeRuleSet()`:

```text
REK_POAT      -> REK_STANDARD
REK_STANDARD  -> REK_STANDARD
MIN_REK_CHANH -> MIN_REK_CHANH
```

`createPositionKey()` luôn dùng canonical name.

Legacy `positionCounts`:

```text
REK_POAT|... -> REK_STANDARD|...
```

counts được merge nếu key canonical đã tồn tại.

Snapshot version vẫn `1`:

- loader nhận `REK_POAT` cũ;
- session normalize sang `REK_STANDARD`;
- serializer mới chỉ emit canonical value.

---

## 15. SESSION CONTRACT

`RekGame` là facade cho UI/server/CLI:

```ts
createGame(ruleset?)
getState()
getLegalMoves(from)
previewMove(from, to)
makeMove(from, to)
undo()
canUndo()
reset(ruleset?)
serialize()
deserializeGame(snapshot)
```

Default:

```ts
createGame() === createGame('REK_STANDARD')
```

Session không được chứa capture logic riêng.

---

## 16. AI CONTRACT

AI:

- nhận board/player/ruleset;
- lấy candidate từ `getMoveResults()`;
- không tự viết movement/Rek/Poat;
- Medium/Hard deterministic;
- tournament result luôn canonicalize ruleset.

Baseline:

```text
REK_STANDARD
MIN_REK_CHANH
```

Legacy `REK_POAT` input có thể được nhận nhưng tournament output phải là `REK_STANDARD`.

---

## 17. CORE REGRESSION CONTRACT

Các nhóm test hiện phải khóa ít nhất:

### Core TC

- `TC-01`: Horizontal Rek.
- `TC-02`: vertical Rek / King geometry fixture.
- `TC-03`: Rek primitive không bypass movement legality.
- `TC-04`: corner Poat.
- `TC-05`: current Min compulsory-Rek forfeit.
- `TC-06`: connected Poat group.

### Spec / movement

- canonical setup a2/h7;
- no jump / occupied destination rejected;
- Standard optional Rek;
- current Min legal filtering;
- King difference by ruleset;
- Rek-before-Poat current ordering;
- immutable execution;
- terminal + draw state invariants.

### Public API migration

Phải có regression cho:

```text
createGame().mode == REK_STANDARD
createGame(REK_POAT).mode == REK_STANDARD
legacy snapshot REK_POAT loads
legacy repetition keys migrate
new snapshot emits REK_STANDARD
```

---

## 18. CHANGE CONTROL

Khi research thay đổi một traditional rule:

```text
HUONG_DAN evidence update
        ↓
SPEC technical decision
        ↓
new failing regression
        ↓
engine implementation
        ↓
session/AI/tournament verification
```

Không sửa AI/UI để giả lập rule mới trước core engine.
