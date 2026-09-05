# រែកខ្មែរ - Rek Khmer Engine

Pure TypeScript game engine cho **Rek Khmer (ល្បែងរែក)**. Repository này chỉ giữ engine, AI, test, puzzle và tài liệu luật; UI/UX không nằm trong scope hiện tại.

## Cách phân chia game chuẩn của project

Project chỉ có **một game: Rek Khmer**. Bên trong engine hiện có hai **rule set**:

- `REK_STANDARD` — rule set chuẩn/mặc định của Rek Khmer. Rek và Poat là **cơ chế bắt quân**, không phải hai game mode độc lập.
- `MIN_REK_CHANH` — variant có thêm rule bắt buộc Rek theo current engine contract. Exact historical Hao Rek trigger vẫn đang được research và chưa được tuyên bố là fully confirmed.

Identifier cũ `REK_POAT` được giữ **chỉ để backward compatibility**. Mọi public session/snapshot mới sẽ canonicalize nó thành `REK_STANDARD`.

`Local`, `Online`, `vs AI`, `AI vs AI`, `Easy/Medium/Hard` là match type hoặc AI difficulty, **không phải rule set của cờ Rek** và không được nhét vào core rule engine.

## Nguồn luật và độ tin cậy

- `HUONG_DAN_LUAT_CO_REK_KHMER.md` — evidence-based rule guide: CONFIRMED / STRONG EVIDENCE / ENGINE INTERPRETATION / UNVERIFIED.
- `SPEC_ENGINE_CO_REK_KHMER.md` — technical contract mà engine hiện thực thi.
- `ENGINE_ARCHITECTURE_REK_KHMER.md` — sơ đồ module, turn flow và ranh giới rule research.
- `RESEARCH_HAO_REK_2026.md` — research note về exact `ហៅរែក`: evidence mới, các giả thuyết chưa đủ chuẩn để code và evidence gate trước khi đổi `MIN_REK_CHANH`.
- `PLAN_PHAT_TRIEN_CO_REK.md` — kế hoạch phát triển.

Game/app trên Google Play, App Store hoặc app clone **không được dùng làm positive rule evidence**.

## Setup canonical

Bàn 8×8, mỗi bên 16 quân = 1 King + 15 Men. Nhìn từ phía Trắng (`you`):

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

- Trắng: King `a2`; Men `b1-h1`, `a3-h3`; `a1` trống.
- Đen: King `h7`; Men `a6-h6`, `a8-g8`; `h8` trống.
- Hai bên đối xứng quay 180°.

## Core engine

- `lib/rek-engine/types.ts` — `RuleSet`, `RuleSetInput`, `GameState`, `CanonicalGameState` và compatibility aliases.
- `lib/rek-engine/catalog.ts` — identity của game + catalog 2 canonical ruleset cho UI/server discovery; không chứa legality/capture logic.
- `lib/rek-engine/captures.ts` — primitive Rek + Poat.
- `lib/rek-engine/engine.ts` — setup, movement, preview, execute, terminal/draw adjudication.
- `lib/rek-engine/session.ts` — `RekGame`, undo, canonical state, snapshot migration/save/load.
- `lib/rek-engine/ai.ts` — AI chỉ search trên legal moves từ core engine.
- `lib/rek-engine/ai-tournament.ts` — deterministic AI tournament regression.
- `lib/rek-engine/puzzles.ts` — tactical fixtures.

## Public API

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

console.log(ruleset) // REK_STANDARD
console.log(getRuleSetMetadata(game.getState().mode).displayName)
```

Public type boundary được chia rõ:

- `RuleSet` — chỉ canonical values: `REK_STANDARD | MIN_REK_CHANH`.
- `RuleSetInput` — input compatibility boundary; ngoài hai giá trị canonical còn nhận legacy `REK_POAT`.
- `CanonicalGameState` — state trả ra từ `RekGame.getState()` và `deserializeGameState()`; `mode` luôn là `RuleSet`, không bao giờ là `REK_POAT`.
- `GameState` — compatibility/wire/custom-state shape dùng khi cần nhận dữ liệu legacy trước bước normalize.
- `GameMode` — deprecated alias, chỉ giữ để source cũ vẫn compile; code mới không nên dùng.

UI/server nên dùng `listRuleSets()` để render lựa chọn ruleset. Không tự hard-code thêm `REK_POAT` thành lựa chọn thứ ba và không dùng metadata catalog để quyết định move legality; legality/capture luôn gọi core engine.

Legacy callers vẫn chạy:

```ts
const legacyInput: RuleSetInput = 'REK_POAT'
const legacy = createGame(legacyInput)
const canonical: CanonicalGameState = legacy.getState()

console.log(canonical.mode) // REK_STANDARD
console.log(getRuleSetMetadata('REK_POAT').id) // REK_STANDARD
```

Snapshot schema vẫn là version `1`; loader nhận snapshot cũ có `mode: "REK_POAT"`, migrate mode + repetition keys sang `REK_STANDARD`, và khi serialize lại chỉ phát canonical identifier.

## Rule boundary quan trọng

Những phần đã có evidence mạnh: bàn 8×8, 16 quân/bên, setup 7+King+8 của project, movement trực giao, Rek ăn cặp hai phía, nguyên lý vây/bí, bắt King là mục tiêu.

Những phần **current engine đang chạy nhưng chưa được coi là historical truth**:

- exact Hao Rek trigger trong `MIN_REK_CHANH`;
- global compulsory Rek interpretation;
- dual-axis Rek = 4 captures;
- exact Rek → Poat ordering/timing;
- zero-move instant win;
- threefold repetition;
- lone-King draw limit.

Research pass 2026 về Hao Rek đã tìm thấy native Khmer evidence cho thấy **một cặp Rek mở sẵn có thể không tự tạo “lời gọi”**, và obligation có thể phụ thuộc vào một nước đi làm lộ pair. Evidence này đủ để nghi ngờ global state-trigger hiện tại nhưng **chưa đủ independent authoritative corroboration để đổi engine**. Chi tiết và evidence gate nằm trong `RESEARCH_HAO_REK_2026.md`.

Không thay các rule này chỉ vì suy đoán. Khi research đủ mạnh, cập nhật guide → SPEC → code → regression tests theo đúng thứ tự.

## AI

- `easy`: random có bias capture.
- `medium`: deterministic alpha-beta depth 2.
- `hard`: deterministic depth 3, adaptive depth 4/5 ở narrow endgame.
- AI không tự viết movement/Rek/Poat/Hao Rek riêng; legal set lấy từ core engine.

Tournament baseline chạy cả `REK_STANDARD` và `MIN_REK_CHANH`.

```bash
npm run tournament:ai
node scripts/run-ai-tournament.cjs --games-per-mode=10 --opening-plies=4 --max-plies=160
npm run tournament:ai:200
```

## Test

```bash
npm install --no-package-lock
npm run typecheck
npm test
```

Rule changes phải giữ engine pure TypeScript và không được duplicate legality/capture logic ở UI, server hoặc AI.
