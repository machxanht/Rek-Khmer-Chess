# KẾ HOẠCH PHÁT TRIỂN: រែកខ្មែរ - REK KHMER

> **Repository duy nhất:** `machxanht/Rek-Khmer-Chess`  
> **Ngày cập nhật roadmap:** 2026-09-06  
> **Vai trò:** roadmap kỹ thuật và thứ tự ưu tiên. Đây **không phải** historical rule source và không được override evidence guide/spec.

---

## 1. Thứ tự nguồn sự thật của project

```text
RESEARCH_HAO_REK_2026.md
RESEARCH_LUAT_REK_KHMER_2026.md
        ↓ evidence promotion
HUONG_DAN_LUAT_CO_REK_KHMER.md
        ↓ technical decision
SPEC_ENGINE_CO_REK_KHMER.md
        ↓ regression contract
lib/rek-engine tests
        ↓ implementation
lib/rek-engine core/session/AI
```

`PLAN_PHAT_TRIEN_CO_REK.md` chỉ quản lý roadmap. Nếu PLAN mâu thuẫn guide/SPEC thì guide/SPEC thắng.

---

## 2. Canonical product model

Project chỉ có một game:

```text
REK_KHMER
```

Canonical rulesets:

```text
REK_STANDARD
MIN_REK_CHANH
```

Compatibility only:

```text
REK_POAT -> REK_STANDARD
GameMode -> deprecated alias
```

Mechanics:

```text
Rek = capture mechanic
Poat = trapping/encirclement mechanic
Hao Rek = call/obligation rule/state candidate inside Min Rek Chanh
```

Application-level concepts tương lai:

```text
MatchType = LOCAL | VS_AI | ONLINE | AI_VS_AI
AiDifficulty = easy | medium | hard
```

Không nhét match type/difficulty vào core ruleset.

---

## 3. Canonical initial setup — locked

Bàn 8×8, mỗi bên 1 King + 15 Men.

```text
8   ● ● ● ● ● ● ● .
7   . . . . . . . ♚
6   ● ● ● ● ● ● ● ●
5   . . . . . . . .
4   . . . . . . . .
3   ○ ○ ○ ○ ○ ○ ○ ○
2   ♔ . . . . . . .
1   . ○ ○ ○ ○ ○ ○ ○
    a b c d e f g h
```

- White: King `a2`; Men `b1-h1`, `a3-h3`; `a1` empty.
- Black: King `h7`; Men `a8-g8`, `a6-h6`; `h8` empty.
- 180° rotational symmetry.

**Không quay lại initial setup d1/d8.**

---

## 4. Trạng thái thực tế của repository

### Đã có

- Pure TypeScript core engine trong `lib/rek-engine/`.
- Canonical ruleset normalization + legacy `REK_POAT` migration.
- `RekGame` public session facade.
- setup/movement/Rek/Poat/current Min adjudication.
- undo + snapshot serialize/deserialize + validation/migration.
- AI easy/medium/hard.
- deterministic AI tournament harness.
- curated engine tactical puzzles.
- 13 regression report groups.
- evidence-aware rule/research/spec/architecture docs.

### Chưa có trong repository này

- React/web/mobile board UI.
- `components/board/`.
- online server/network match implementation.
- production persistence/database.
- audio/i18n application layer.

Các roadmap cũ từng đánh dấu GameBoard/mode UI là hoàn thành là **không còn đúng với trạng thái repo hiện tại** và đã được loại khỏi checklist.

---

## 5. Checkpoint kỹ thuật hiện tại

Theo checkpoint đã ghi nhận sau PR #27–#29:

```text
Engine regression: 97/97 PASS

AI deterministic baseline:
Medium: 798 nodes
Hard: 7,532 nodes / 652 cutoffs
Tournament smoke illegalMoves = 0

Observed GitHub runner runtime after legal-move optimization:
~77s -> ~16s
```

Các metrics trên là regression checkpoint của project, không phải historical rule evidence.

---

## 6. Architecture target

```text
Future application/UI/server
        ↓
lib/rek-engine/index.ts
        ↓
RekGame (session.ts)  ← preferred canonical facade
        ↓
engine.ts pure functions
        ↓
captures.ts
```

AI path:

```text
ai.ts
  ↓
getAllMoveResults()
  ↓
engine-owned legal moves + exact capture metadata
```

Rules không được duplicate ở UI/server/AI.

---

## 7. Research v1 — FROZEN

Hao Rek event-trigger migration đã hoàn thành. Active broad rule research không còn là blocker cho product work.

Current engine:

```text
opponent move
→ derive newly-created responder Rek responses
→ active HaoRekContext
→ responder answers NEW response(s)
→ ignored active Hao => forfeit
→ response may chain
```

Evidence 2013 hiện support tốt hơn model:

```text
opponent action/move
→ បើកឲ្យរែក
→ responder must Rek
→ if not -> automatic loss
```

Nhưng exact geometry của `បើកឲ្យរែក` chưa khóa.

### Research tasks P0

1. Xác nhận exact board geometry của `បើកឲ្យរែក`.
2. Xác nhận có cần newly exposed pair không.
3. Xác nhận pre-existing pair có tạo obligation không.
4. Multiple pairs: ai chọn?
5. Có cần verbal call không?
6. Ignore call = illegal move hay legal move + instant loss?
7. Obligation lifetime/chain termination.
8. King stationary trong Min.
9. Poat trong Min.
10. Zero-move terminal relation với `ទាល់ច្រក`.
11. `រែកហែក` relation với Hao/Min terminology.

Archival targets:

- Kambuja Suriya 1964 body (`ល្បែងចត្រង្គ`, `ល្បែងផ្សេងៗ`, cultural/custom headings).
- original 1973 `ប្រជុំវប្បធម៌ទូទៅ` scan + exact Rek page.
- Chuon Nath vol.2 exact scan page for `រែក`.
- reconstructable real-board Khmer video.

Multiple-new-target choice, verbal call, Poat-in-Min, King stationary historical status và zero-move historical status được freeze với explicit evidence/technical labels trong `RESEARCH_FINAL_V1_FREEZE.md`.

---

## 8. Nếu research được reopen sau v1 freeze

Thứ tự bắt buộc:

```text
research note
→ HUONG_DAN evidence promotion
→ SPEC exact state/transition contract
→ failing board regressions
→ GameState/snapshot migration design nếu cần
→ core engine implementation
→ session API
→ AI legality/search adaptation
→ tournament/replay regression
```

Current context đã triển khai:

```ts
interface HaoRekContext {
  active: boolean
  createdByMove: { from: number; to: number } | null
  allowedResponses: { from: number; to: number }[]
}
```

Nếu evidence mới bác technical policy, phải quay lại research → guide → SPEC → failing regression trước khi sửa engine.

---

## 9. Completed core hardening

### Completed — canonicalize stateful facade

Repo hiện export cả:

- `RekGame` từ `session.ts` — canonical facade nên dùng cho application;
- `RekEngine` từ `engine.ts` — legacy/secondary wrapper.

Audit phát hiện return-value mismatch khi current Min violation xảy ra:

- `RekGame.makeMove()` có thể chuyển game sang forfeit loss và return `true` vì state changed;
- `RekEngine.makeMove()` cũng chuyển state sang loss nhưng return `false` vì preview đánh dấu violation.

Status: `RekEngine` đã deprecated, state-change semantics đã align với `RekGame`, có public API regression.

### Completed — public coordinate validation

`coordToIdx()` hiện validate canonical lowercase `a1-h8` và reject malformed input.

### Completed — snapshot semantic validation

Persisted snapshots hiện enforce King/status/Hao/repetition/lone-King semantic invariants while custom in-memory fixtures remain flexible.

---

## 10. Priority P1 — docs/test/CI contract

### Completed — docs-triggered regression

Engine CI hiện chạy cho canonical rule/spec/research docs, gồm `RESEARCH_*.md`.

Action proposed:

- add relevant docs paths vào engine-test workflow trigger, hoặc
- tạo lightweight docs-contract workflow.

Ưu tiên paths:

```text
HUONG_DAN_LUAT_CO_REK_KHMER.md
SPEC_ENGINE_CO_REK_KHMER.md
ENGINE_ARCHITECTURE_REK_KHMER.md
RESEARCH_HAO_REK_2026.md
RESEARCH_LUAT_REK_KHMER_2026.md
```

### P1.5 — docs lock semantics

`rule-guide-lock-tests.ts` hiện khóa **engine behavior được guide mô tả**, nhưng không parse/validate Markdown. Tên test có thể khiến người đọc tưởng docs được machine-checked.

Future options:

- giữ test nhưng rename rõ behavior lock; hoặc
- thêm docs consistency checks riêng.

---

## 11. Priority P1/P2 — puzzle hygiene

`KHMER_PUZZLES` hiện là curated **engine tactical fixtures**.

Không gọi toàn bộ 7 thế là “truyền thống/bản địa Khmer” nếu chưa có provenance riêng, vì một số phụ thuộc:

- BFS zero-liberties Poat;
- exact Rek→Poat ordering;
- current engine interpretations;
- custom King placements.

Action:

1. UI copy tương lai label “training/tactical fixtures”.
2. Nếu tìm được puzzle lịch sử thật, thêm source metadata per puzzle.
3. Custom d1/d8 Kings trong puzzle không được gây nhầm với canonical initial setup a2/h7.

---

## 12. Research freeze result — terminal semantics

Current engine có separate terminal:

```text
opponent has zero geometric moves -> mover wins
```

win reason hiện dùng wording:

```text
Opponent has no geometric moves
```

Vấn đề:

- “zero moves” và Poat “zero liberties” là hai predicates kỹ thuật khác nhau;
- native `ទាល់ច្រក` chưa đủ để khẳng định zero-geometric-move == instant win riêng.

Final v1 classification: zero-geometric-move instant win = `ENGINE INTERPRETATION / UNVERIFIED`. Wording đã tách khỏi Poat liberties.

---

## 13. Completed — draw/search consistency

Threefold và lone-King 32 hiện là project extensions.

Live state-aware AI search hiện mang repetition history, lone-King counter và draw limit qua engine-owned `GameState` transitions. Các draw rule vẫn là project extensions.

---

## 14. Priority P3 — future UI/application

Sau khi core contract đủ ổn định:

### Board UI

- render canonical a2/h7 initial setup;
- consume `listRuleSets()`;
- consume `RekGame.getLegalMoves()` / `previewMove()` / `makeMove()`;
- không implement capture logic;
- visual Rek/Poat sequence dựa trên engine metadata.

### Match types

```text
LOCAL
VS_AI
ONLINE
AI_VS_AI
```

Match type ngoài rules engine.

### AI UI

```text
easy
medium
hard
```

### Cultural presentation

- Khmer/Vietnamese/English i18n;
- terminology sourced from guide;
- tránh wording “100% traditional” cho unverified mechanics;
- Hao Rek visual/audio only after exact semantics verified enough to avoid teaching wrong rule.

---

## 15. Việc không được làm

- Không restore d1/d8 initial setup.
- Không biến `REK_POAT` thành canonical mode.
- Không dùng app-store developer description làm source.
- Không gọi BFS liberties là historical Poat truth.
- Không gọi dual-axis Rek-4 canonical trước source.
- Không kéo draw rule từ Ouk/Chatrang sang Rek.
- Không thay current Min global trigger bằng “newly exposed pair” chỉ từ community comment.
- Không duplicate legality trong AI/UI/server.
- Không sửa engine trước khi Hao Rek exact semantics vượt evidence gate.

---

## 16. Recommended execution order after v1 freeze

```text
P3  Board UI
    ↓
P3  Local match
    ↓
P3  vs AI
    ↓
P3  presentation / i18n / replay persistence
    ↓
P3  Online
    ↓
    polish
```

Research chỉ reopen khi có materially stronger archival/native/board-level evidence.