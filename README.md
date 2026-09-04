# រែកខ្មែរ - Rek Khmer Engine

Repository này hiện được thu gọn thành **game engine TypeScript thuần** cho Rek Khmer. Toàn bộ lớp UI/UX, Next.js, React, Tailwind, asset giao diện, âm thanh và browser-flow đã được loại khỏi nhánh engine-only để engine có thể được kiểm thử độc lập.

## Engine giữ lại

- `lib/rek-engine/types.ts` — kiểu dữ liệu và GameState.
- `lib/rek-engine/captures.ts` — Rek (Gánh) và Poat (Bao Vây/Flood Fill).
- `lib/rek-engine/engine.ts` — thiết lập bàn cờ, sinh nước đi, thực thi lượt, thắng/thua/hòa.
- `lib/rek-engine/ai.ts` — AI dựa trên tập nước đi hợp lệ của engine.
- `lib/rek-engine/puzzles.ts` — dữ liệu/thế cờ dùng bởi engine.
- `lib/rek-engine/*-tests.ts` — regression, specification lock, simulation, AI và draw tests.

Ba tài liệu nền tảng vẫn là nguồn sự thật của dự án và được giữ nguyên:

- `HUONG_DAN_LUAT_CO_REK_KHMER.md`
- `SPEC_ENGINE_CO_REK_KHMER.md`
- `PLAN_PHAT_TRIEN_CO_REK.md`

## Kiểm tra lỗi “không di chuyển quân”

Audit không phát hiện lỗi trong pipeline sinh/thực thi nước đi của engine. Engine sinh nước theo 4 hướng trực giao, chỉ qua ô trống và không nhảy qua quân cản.

Hai trường hợp quan trọng:

1. Ở thế khai cuộc, quân tại hàng sau (`rank 1`, gồm Vua ở `d1`) bị hàng `rank 2` của chính mình chặn nên chưa có nước đi. Đây là hành vi đúng luật.
2. Trong `MIN_REK_CHANH`, Vua còn phải đứng yên hoàn toàn theo đặc tả.

Regression test `MOVE-01` khóa hành vi rằng nước khai cuộc `a2 → a3` phải được sinh và thực thi thành công. `MOVE-02` khóa hành vi hàng sau bị chặn đúng luật.

Ở lớp UI cũ, toàn bộ ô bàn cờ từng bị `disabled` khi cờ `interactive` là false (ví dụ: không phải lượt điều khiển, modal mở hoặc trạng thái kết nối). Browser smoke cũ chỉ kiểm tra render/layout chứ không thực sự click quân và ô đích, nên lỗi tương tác UI có thể lọt qua dù engine test xanh. Lớp UI đó không còn nằm trong nhánh engine-only này.

## Chạy kiểm thử

```bash
npm install --no-package-lock
npm run typecheck
npm test
```

Engine test runner biên dịch riêng `lib/rek-engine/` rồi chạy toàn bộ bộ test core/spec/AI/state/draw/puzzle/simulation/movement.
