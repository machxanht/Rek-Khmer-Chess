# រែកខ្មែរ - Rek Khmer Engine

Repository này là **game engine TypeScript thuần** cho Rek Khmer. UI/UX cũ đã được loại để core rules, state, AI và regression tests có thể được kiểm thử độc lập.

## Tài liệu nền tảng

- `HUONG_DAN_LUAT_CO_REK_KHMER.md` — **evidence-based rule guide**: tách `CONFIRMED`, `STRONG EVIDENCE`, `ENGINE INTERPRETATION`, `UNVERIFIED` và project extensions.
- `SPEC_ENGINE_CO_REK_KHMER.md` — technical contract mô tả behavior mà engine hiện đang chạy.
- `ENGINE_ARCHITECTURE_REK_KHMER.md` — sơ đồ module, public call-flow, turn pipeline và ranh giới evidence của từng rule.
- `PLAN_PHAT_TRIEN_CO_REK.md` — kế hoạch phát triển nền tảng.

### Chính sách nguồn luật

Project **không dùng Google Play, App Store hoặc app game có sẵn làm bằng chứng luật**. Ưu tiên tư liệu Khmer, Buddhist Institute/Chuon Nath, tài liệu văn hóa độc lập, thư viện Khmer và ván bàn thật có thể tái dựng.

Một rule đang chạy trong code **không tự động đồng nghĩa** với “luật Khmer truyền thống đã được chứng minh”. Các điểm đang cần research sâu nhất là exact `Hao Rek / Min Rek Chanh`, Rek dual-axis 4 quân, exact Poat timing, zero-move terminal và draw rules.

## Engine modules

- `lib/rek-engine/types.ts` — `GameState`, piece/move types.
- `lib/rek-engine/captures.ts` — Rek và Poat primitives.
- `lib/rek-engine/engine.ts` — setup, movement, preview, execute, terminal/draw.
- `lib/rek-engine/session.ts` — `RekGame` facade, undo, serialize/deserialize.
- `lib/rek-engine/ai.ts` — AI search chỉ dùng legal moves từ core engine.
- `lib/rek-engine/ai-tournament.ts` — deterministic Hard-vs-Medium regression harness.
- `lib/rek-engine/puzzles.ts` — tactical fixtures.
- `lib/rek-engine/*-tests.ts` — core/spec/guide/state/public API/AI/simulation regressions.

## Setup canonical của project

Bàn 8×8, mỗi bên **16 quân = 1 King + 15 Men**. Setup đã được chủ project xác nhận trực tiếp bằng ảnh bàn thật và phù hợp với nguồn game-history thứ cấp độc lập:

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

- Trắng (`you`): King `a2`; Men `b1-h1`, `a3-h3`; `a1` trống.
- Đen (`opp`): King `h7`; Men `a6-h6`, `a8-g8`; `h8` trống.
- Hai đội hình đối xứng quay 180°.

## Rule confidence tóm tắt

| Rule | Status nghiên cứu | Engine hiện tại |
|---|---|---|
| Bàn 8×8 | `CONFIRMED` | Có |
| 1 King + 15 Men mỗi bên | `CONFIRMED` | Có |
| Mục tiêu bắt King | `CONFIRMED` | Có |
| Rek ăn cặp hai phía | `CONFIRMED` | Có |
| Bao/vây quân bị bí | `CONFIRMED principle` | Có |
| Setup 7+King+8 `a2/h7` | `PROJECT-CONFIRMED + STRONG` | Có |
| Đi trực giao nhiều ô | `STRONG EVIDENCE` | Có |
| Poat BFS / zero liberties | `STRONG ENGINE INTERPRETATION` | Có |
| Rek 4 do hai trục đồng thời | `INFERRED` | Có |
| Global compulsory Rek trong Min | `UNVERIFIED exact rule` | Có |
| Min violation = thua ngay | `UNVERIFIED exact semantics` | Có |
| Zero legal moves = instant win | `UNVERIFIED` | Có |
| Threefold repetition | `PROJECT EXTENSION` | Có |
| Lone King 32 | `PROJECT EXTENSION` | Có |

Chi tiết evidence và source links nằm trong `HUONG_DAN_LUAT_CO_REK_KHMER.md`.

## Public API

Consumer nên đi qua `RekGame`; UI/server không được duplicate luật:

```ts
import { coordToIdx, createGame, deserializeGame } from './lib/rek-engine'

const game = createGame('REK_POAT')
const from = coordToIdx('a3')
const to = coordToIdx('a4')

if (game.getLegalMoves(from).includes(to)) {
  game.makeMove(from, to)
}

const state = game.getState()
const snapshot = game.serialize()
const loaded = deserializeGame(snapshot)
```

`session.ts` chỉ quản current state, undo và persistence. Rule legality/adjudication phải đi qua core engine.

## Current turn pipeline

```text
input from/to
→ validate status + side to move
→ geometric movement
→ current Min Rek compulsory filter
→ move piece
→ Rek captures
→ Poat captures
→ King / piece / immobilization terminal checks
→ current draw extensions
→ switch turn
```

Xem `ENGINE_ARCHITECTURE_REK_KHMER.md` để biết khối nào đã có evidence mạnh và khối nào còn là project interpretation.

## AI contract

AI không tự định nghĩa luật. Candidate moves và tactical metadata đến từ `getMoveResults()` / core preview logic.

- `easy`: intentional randomness.
- `medium`: deterministic alpha-beta depth 2.
- `hard`: depth 3 mặc định; adaptive depth 4/5 ở position hẹp/endgame.
- rule-legal mobility được dùng trong evaluation.
- terminal immobilization được kiểm tra trước depth cutoff.
- có immediate Royal-capture horizon extension.
- pruned alpha-beta bounds không được cache như exact value.
- `analyzeAiMove()` trả search diagnostics deterministic.

**Lưu ý:** AI Min Rek Chanh hiện search theo compulsory-Rek model của engine. Không nên tune chiến lược Min sâu hơn trước khi exact Hao Rek semantics được khóa bằng evidence.

## AI tournament regression

Tournament harness:

- seeded opening chỉ lấy từ legal moves của engine;
- Hard/Medium đổi bên để giảm color bias;
- mọi AI move được xác nhận legality trước khi execute;
- theo dõi wins/draws/capped/illegal moves/plies/search nodes.

CI chỉ chạy smoke nhỏ. Benchmark lớn chạy thủ công:

```bash
npm run tournament:ai
node scripts/run-ai-tournament.cjs --games-per-mode=10 --opening-plies=4 --max-plies=160
npm run tournament:ai:200
```

## Testing

```bash
npm install --no-package-lock
npm run typecheck
npm test
```

Bộ regression hiện bao phủ core/spec/guide/public API/state/draw/puzzles/simulation/movement/AI search/tournament.

Khi research thay đổi rule:

```text
Evidence mới
→ update HUONG_DAN_LUAT_CO_REK_KHMER.md
→ update SPEC_ENGINE_CO_REK_KHMER.md
→ add reproduction fixture
→ sửa core engine tối thiểu
→ update affected tests
→ full CI + tournament smoke
```

Không sửa engine chỉ để khớp một app game có sẵn.
