# រែកខ្មែរ - Rek Khmer Engine

Repository này hiện được thu gọn thành **game engine TypeScript thuần** cho Rek Khmer. Toàn bộ lớp UI/UX, Next.js, React, Tailwind, asset giao diện, âm thanh và browser-flow đã được loại để engine có thể được kiểm thử độc lập.

## Nguồn luật chuẩn

Ba tài liệu nền tảng vẫn là nguồn sự thật của dự án và được giữ nguyên:

- `HUONG_DAN_LUAT_CO_REK_KHMER.md` — hướng dẫn/đối chứng luật chơi Rek Khmer.
- `SPEC_ENGINE_CO_REK_KHMER.md` — đặc tả kỹ thuật dùng để khóa hành vi engine.
- `PLAN_PHAT_TRIEN_CO_REK.md` — kế hoạch phát triển nền tảng.

Engine và regression tests phải tuân theo các tài liệu này; UI/server về sau không được tự viết lại luật.

## Engine giữ lại

- `lib/rek-engine/types.ts` — kiểu dữ liệu và `GameState`.
- `lib/rek-engine/captures.ts` — Rek (Gánh) và Poat (Bao Vây/Flood Fill).
- `lib/rek-engine/engine.ts` — thiết lập bàn cờ, sinh nước đi, thực thi lượt, thắng/thua/hòa.
- `lib/rek-engine/session.ts` — public facade cho UI/server/CLI: game session, undo và save/load.
- `lib/rek-engine/ai.ts` — AI dựa hoàn toàn trên tập nước đi hợp lệ của engine.
- `lib/rek-engine/ai-tournament.ts` — deterministic Hard-vs-Medium tournament harness và aggregate metrics.
- `lib/rek-engine/puzzles.ts` — dữ liệu/thế cờ dùng bởi engine.
- `lib/rek-engine/*-tests.ts` — regression, specification lock, rule-guide lock, public API, simulation, AI và draw tests.

## Public API ổn định

Import từ `lib/rek-engine/index.ts`:

```ts
import { coordToIdx, createGame, deserializeGame } from './lib/rek-engine'

const game = createGame('REK_POAT')

const from = coordToIdx('a2')
const to = coordToIdx('a3')

const legalTargets = game.getLegalMoves(from)
if (legalTargets.includes(to)) {
  game.makeMove(from, to)
}

const state = game.getState()
const snapshot = game.serialize()
const loaded = deserializeGame(snapshot)

loaded.undo() // false: undo history is process-local and is not serialized
```

`RekGame` không tự quyết luật. `getLegalMoves()` dùng tập rule-legal từ core engine và `makeMove()` chuyển toàn bộ adjudication sang `executeMove()`. Trong `MIN_REK_CHANH`, UI có thể chỉ hiển thị nước Rek bắt buộc, nhưng nếu client/server vẫn gửi một nước bỏ qua Hao Rek thì core engine sẽ xử thua đúng luật.

Snapshot save/load dùng schema version `1`, validate cấu trúc board/state, piece ID, King count, status/winner và metadata trước khi cho state quay lại session.

## AI và search contract

AI không tự viết lại luật di chuyển/Rek/Poat. Tất cả candidate moves và tactical metadata đều lấy từ `getMoveResults()` của core engine.

- `easy`: cố ý có randomness; ưu tiên capture với xác suất nhưng không đảm bảo chiến thuật tối ưu.
- `medium`: deterministic alpha-beta, depth `2`; nhìn đủ một phản đòn trực tiếp để tránh các nước kiểu “ăn quân rồi mất Vua ngay”.
- `hard`: deterministic alpha-beta, depth `3` ở thế rộng/nhiều quân; chỉ tăng lên depth `4` khi root có tối đa 10 nước **và** tổng quân còn ≤18, hoặc depth `5` khi root có tối đa 4 nước **và** tổng quân còn ≤10.
- Mobility heuristic dùng **rule-legal moves**, nên trong `MIN_REK_CHANH` các quiet move bị Hao Rek cấm không còn được tính nhầm vào điểm thế trận.
- Terminal immobilization được kiểm tra trước depth cutoff.
- Horizon có tactical extension cho Royal capture ngay lượt kế tiếp.
- Transposition cache chỉ lưu node đã search đầy đủ; node bị alpha-beta prune không bị ghi như một exact score.
- `analyzeAiMove()` trả cùng quyết định với `chooseAiMove()` cho Medium/Hard nhưng kèm deterministic search counters (`nodes`, `leaves`, `cutoffs`, `cacheHits`, `legalMoveGenerations`) để benchmark/regression mà không phụ thuộc tốc độ runner.

`ai-search-regression-tests.ts` khóa tactical safety và node-count budget để thay đổi AI về sau không vô tình làm yếu logic hoặc gây search explosion.

## AI-vs-AI tournament regression

`ai-tournament.ts` chạy Hard-vs-Medium ở cả `REK_POAT` và `MIN_REK_CHANH` với các nguyên tắc:

- opening diversity dùng seed deterministic nhưng **chỉ chọn từ legal moves của core engine**;
- Hard/Medium đổi màu `you`/`opp` sau mỗi ván để tránh bias bên đi;
- mọi AI move được đối chiếu lại với legal set rồi mới gọi `RekGame.makeMove()`;
- `maxPlies` chỉ là giới hạn benchmark; ván chạm cap được báo là `capped`, **không bị giả thành hòa theo luật**;
- thống kê gồm Hard wins, Medium wins, engine draws, capped games, illegal moves, average/max plies và search-node totals/max.

CI chạy tournament smoke nhỏ ở mọi thay đổi engine để khóa legality, determinism, color balance và node budget. Smoke hiện có 5 assertions riêng; cùng các suite trước đó đưa tổng regression lên **93/93**.

Tournament lớn được tách khỏi CI thường vì Hard alpha-beta có chi phí đáng kể. Runner hỗ trợ cấu hình rõ ràng:

```bash
# baseline nhỏ mặc định: 2 ván/mode
npm run tournament:ai

# tùy chỉnh
node scripts/run-ai-tournament.cjs --games-per-mode=10 --opening-plies=4 --max-plies=160

# 200 ván tổng (100/mode) — long-running benchmark có chủ đích
npm run tournament:ai:200
```

GitHub Actions có workflow manual `Rek AI Tournament Baseline`, cho phép nhập `games_per_mode`, `opening_plies`, `max_plies`. Không chạy tournament 200 ván trên mọi PR vì smoke CI đã cho thấy searched AI plies đắt hơn unit tests rất nhiều; benchmark lớn chỉ nên chạy khi cần lập hoặc so baseline AI.

## Rule lock theo hướng dẫn Khmer

`rule-guide-lock-tests.ts` khóa các điểm cốt lõi trực tiếp từ tài liệu luật:

- Toàn bộ quân hàng 2/hàng 7 ở khai cuộc có đúng 4 nước trượt vào trung tâm, ở cả `REK_POAT` và `MIN_REK_CHANH`.
- Hàng sau bị chính hàng trước chặn; không quân nào được nhảy qua quân cản.
- Chỉ đi trực giao và ô đích bắt buộc trống.
- King đi như Man trong `REK_POAT`, đứng yên trong `MIN_REK_CHANH`.
- Rek bắt 2 hoặc 4 quân theo hai trục.
- Poat dùng connected-component + liberties, kể cả ở biên/góc.
- Pipeline cố định: **move → Rek → Poat → check thắng/thua**.
- Hao Rek bắt buộc trong `MIN_REK_CHANH`; Rek vẫn tự chọn trong `REK_POAT`.
- Bắt King là điều kiện kết thúc ván.

Long-run simulation hiện chạy **4.000 deterministic legal plies** tổng cộng qua hai mode và kiểm tra liên tục tính bất biến của state, bảo toàn quân, unique piece ID, repetition bookkeeping và cached Rek count.

## Kiểm tra lỗi “không di chuyển quân”

Audit không phát hiện lỗi trong pipeline sinh/thực thi nước đi của engine. Engine sinh nước theo 4 hướng trực giao, chỉ qua ô trống và không nhảy qua quân cản.

Hai trường hợp quan trọng:

1. Ở thế khai cuộc, quân tại hàng sau (`rank 1`, gồm Vua ở `d1`) bị hàng `rank 2` của chính mình chặn nên chưa có nước đi. Đây là hành vi đúng luật.
2. Trong `MIN_REK_CHANH`, Vua còn phải đứng yên hoàn toàn theo đặc tả.

Regression test `MOVE-01` khóa hành vi rằng nước khai cuộc `a2 → a3` phải được sinh và thực thi thành công. `MOVE-02` khóa hành vi hàng sau bị chặn đúng luật.

Ở lớp UI cũ, toàn bộ ô bàn cờ từng bị `disabled` khi cờ `interactive` là false (ví dụ: không phải lượt điều khiển, modal mở hoặc trạng thái kết nối). Browser smoke cũ chỉ kiểm tra render/layout chứ không thực sự click quân và ô đích, nên lỗi tương tác UI có thể lọt qua dù engine test xanh. Lớp UI đó không còn nằm trong engine-only repository này.

## Chạy kiểm thử

```bash
npm install --no-package-lock
npm run typecheck
npm test
```

Engine test runner biên dịch riêng `lib/rek-engine/` rồi chạy toàn bộ bộ test core/spec/rule-guide/public-API/AI/state/draw/puzzle/simulation/movement, gồm AI search regression, tournament smoke và deterministic node-count benchmark.
