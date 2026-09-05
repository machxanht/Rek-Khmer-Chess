# AUDIT TOÀN BỘ REK KHMER — 2026-09-06

> **Repository audit:** `machxanht/Rek-Khmer-Chess`  
> **Base checkpoint:** `a783f5924bb8d567826a69f60c902e3ce50df065`  
> **Scope:** rules/evidence, core engine, session/API, AI, tournament, puzzles, tests/CI, roadmap.  
> **Important:** audit này **không thay đổi gameplay code**. Mọi finding về traditional rules phải đi qua research → guide → SPEC → tests → engine.

---

## 1. Executive summary

### Overall health

Project đang ở trạng thái **kiến trúc core khá tốt, regression mạnh, nhưng historical rule risk tập trung lớn ở `MIN_REK_CHANH` và một số terminal/capture interpretations**.

Điểm mạnh lớn nhất:

- canonical setup a2/h7 đã khóa đúng;
- một game / hai canonical rulesets đã chuẩn hóa sạch;
- `REK_POAT` bị hạ đúng xuống compatibility alias;
- core pure TypeScript, không có UI logic lẫn vào engine;
- AI lấy legality + exact capture metadata từ core engine;
- snapshot migration + public session boundary khá chặt;
- deterministic AI/tournament regression đã có;
- source/evidence policy hiện tách community/app khỏi historical evidence.

Rủi ro lớn nhất:

1. **P0 — Hao Rek trigger:** current board-global Min behavior chưa có historical support tương xứng và bị source 2013 challenge trực tiếp.
2. **P1 — duplicate stateful facade semantics:** `RekGame` và `RekEngine` không trả cùng boolean semantics cho current Min forfeit.
3. **P1 — docs/CI contract gap:** rule/spec Markdown có thể đổi mà engine CI không tự chạy.
4. **P1/P2 — puzzle provenance/wording:** engine fixtures có nguy cơ bị trình bày như “thế truyền thống”.
5. **P2 — zero-move terminal conflation:** zero geometric moves đang dùng win reason “Zero liberties”, dễ trộn với Poat/traditional `ទាល់ច្រក`.
6. **P2 — AI draw-history mismatch:** minimax không model threefold/lone-King session history.
7. **P2 — public input/state validation hardening:** coordinate helper và snapshot cross-field semantics còn có thể chặt hơn.

Không finding nào trong pass này buộc phải sửa gameplay ngay trước khi tiếp tục research.

---

## 2. Canonical rules audit

### 2.1. Initial setup — PASS / LOCKED

Current engine setup:

- White King `a2`.
- White Men `b1-h1`, `a3-h3`.
- `a1` empty.
- Black King `h7`.
- Black Men `a8-g8`, `a6-h6`.
- `h8` empty.
- 180° rotational symmetry.

Assessment: **đúng project canonical setup**. Không có dấu hiệu d1/d8 initial setup quay lại trong `createInitialBoard()`.

Note: test/puzzle custom positions vẫn dùng d1/d8 ở một số fixtures; đây không phải setup regression nếu UI/docs không gọi chúng là initial formation.

### 2.2. Game/ruleset terminology — PASS

Current model:

```text
Game = REK_KHMER
RuleSet = REK_STANDARD | MIN_REK_CHANH
REK_POAT = legacy alias -> REK_STANDARD
```

Assessment: **đúng canonical architecture**.

`catalog.ts` expose đúng một game và hai discoverable rulesets. Legacy alias không xuất hiện như lựa chọn thứ ba.

### 2.3. Rek core — PASS with evidence boundary

`checkRekCaptures()` implement intervention pair capture theo horizontal/vertical opposite neighbors.

- two-sided pair: evidence-backed core;
- dual-axis union => 4 victims: current engine interpretation.

Assessment: implementation consistent với current SPEC; historical status được docs gắn đúng label sau update.

### 2.4. Poat — TECHNICALLY CONSISTENT, HISTORICALLY OPEN

Current implementation:

```text
orthogonal same-color component
+ adjacent orthogonal empty liberties
+ zero liberties => capture whole group
```

Assessment:

- code nhất quán, đơn giản, testable;
- native evidence chỉ xác nhận trapping/encirclement concept;
- exact BFS/group/liberty semantics vẫn là `ENGINE INTERPRETATION`.

Không nên optimize/rewrite Poat dựa trên historical assumption trước khi có stronger source.

### 2.5. Rek → Poat order — TECHNICALLY LOCKED, HISTORICALLY OPEN

Current resolver:

1. move piece;
2. calculate Rek;
3. remove Rek victims;
4. calculate Poat on post-Rek board.

Regression đã lock behavior này.

Assessment: valid software contract, nhưng không historical truth.

### 2.6. `MIN_REK_CHANH` — HIGHEST RULE RISK

Current algorithm:

```text
getAllRekOpportunities(currentBoard, currentPlayer)
→ if any exists, quiet moves filtered globally
→ low-level quiet geometric submit = immediate forfeit
```

Research 2013 gives:

```text
opponent បើកឲ្យរែក
→ responder ត្រូវតែរែក
→ if not -> automatic loss
```

Assessment:

- consequence “không Rek thì thua” có `SECONDARY` support;
- **trigger** “any Rek already exists anywhere” không có comparable support;
- evidence hiện nghiêng hơn về previous/opponent action event.

**Action:** không sửa code cho tới khi exact `បើកឲ្យរែក` geometry + response set được xác minh.

---

## 3. `types.ts` audit

### Good

- `RuleSet` canonical union sạch.
- `RuleSetInput` tách compatibility boundary.
- `GameMode` marked deprecated.
- `CanonicalGameState` ngăn public session emit `REK_POAT` ở type level.
- draw fields được comment rõ là project extension.

### Follow-up

#### A-TYPE-01 — Future Hao Rek context may require state schema change

Nếu event-trigger được xác nhận, current `GameState` không có đủ previous-event metadata.

Potential needs:

- active call flag;
- move that created call;
- exact target pair(s)/response set;
- expiry/chain metadata.

Priority: **P0-dependent**. Không thêm field trước evidence.

#### A-TYPE-02 — `GameMode` should remain compatibility-only

Không thêm code mới dùng `GameMode`. Future cleanup có thể reduce internal references trong tests/helpers sang `RuleSetInput`.

Priority: **low / semantics-preserving**.

---

## 4. `catalog.ts` audit

### PASS

- stable `REK_GAME.id = REK_KHMER`;
- default = `REK_STANDARD`;
- exactly two canonical rulesets;
- immutable metadata objects;
- research status presentation-only;
- legacy metadata lookup canonicalizes correctly.

No immediate work required.

Potential future improvement: nếu exact Min semantics thay đổi materially, update summary/research status copy cùng guide/spec; không dùng catalog metadata như rule switch.

---

## 5. `captures.ts` audit

### Good

- no UI/session dependency;
- deterministic pure primitives;
- board edge handling explicit;
- capture victim sets avoid duplicate victim index.

### Rule risks

#### A-CAP-01 — dual-axis Rek-4

Current comment names “Gánh 4 / Rek Boun / Rek Troat”. Historical terminology/semantics chưa được source mạnh xác nhận trong current research.

Priority: **P2 research**, no code change yet.

Recommended later:

- keep implementation while labeled engine interpretation;
- if source supports choose-one-axis instead of union, add failing fixture first.

#### A-CAP-02 — Poat zero-liberty semantics

Current code counts liberties with duplicates, but only tests `liberties === 0`, so duplicate counts do not affect binary captured/survive outcome. Implementation is logically fine for current predicate.

Historical exactness remains open.

Priority: **P2 research**.

---

## 6. `engine.ts` audit

### 6.1. Setup/movement — PASS

`createInitialBoard()` matches a2/h7 canonical formation.

`getLegalMoves()`:

- orthogonal rays;
- empty destinations;
- stops at blocker;
- no jump/diagonal;
- Min King stationary.

Current technical contract consistent.

### 6.2. Min global obligation — KNOWN RULE RISK

`getAllRekOpportunities()` + `compulsoryRekDestinations()` implement board-global state trigger exactly as documented.

Priority: **P0 research blocker**.

Do not “fix” to newly-exposed-pair model from community signal alone.

### 6.3. `previewMove()` dual semantics — intentional but needs API clarity

Low-level `previewMove()` can return:

```ts
{ isHaoRekViolation: true }
```

for a geometrically legal quiet Min move.

Higher-level `RekGame.previewMove()` only exposes rule-legal results and returns `null` for that move.

Assessment: defensible layering, but public docs must distinguish **geometry-aware low-level preview** from **rule-legal session preview**.

Priority: **P1 documentation/API clarity**.

### 6.4. Duplicate stateful wrappers — concrete inconsistency

There are two stateful wrappers exported:

1. `RekEngine` in `engine.ts`.
2. `RekGame` in `session.ts`.

Current Min violation behavior:

- both can transition state to opponent win;
- `RekGame.makeMove()` returns `true` because `executeMove()` changed state;
- `RekEngine.makeMove()` returns `false` when preview says Hao violation, even though internal state was changed to terminal loss.

This creates caller ambiguity:

```text
return false
but game state changed
```

Severity: **P1 technical API bug/debt**.

Recommended fix later:

**Option A — preferred:** deprecate/remove `RekEngine` stateful wrapper from new public use, keep pure functions + `RekGame` as only canonical session facade.

**Option B:** align `RekEngine.makeMove()` boolean contract with `RekGame` and add regression.

Do not change rule adjudication while fixing this.

### 6.5. Zero-move terminal wording/predicate

Current terminal uses:

```text
countTotalLegalMoves() -> getLegalMoves() geometric count
```

If zero, mover wins with:

```text
Opponent completely immobilized (Zero liberties)
```

Problems:

- predicate = zero geometric moves;
- “Zero liberties” is Poat terminology in current algorithm;
- historical `ទាល់ច្រក` may or may not equal separate instant-win mobility rule.

Severity: **P2 rule/semantic ambiguity**.

Recommended order:

1. research terminal semantics;
2. at minimum rename software win reason if rule retained;
3. only change predicate after SPEC + regression decision.

### 6.6. `coordToIdx()` exported input validation

Current helper assumes a trusted two-character coordinate:

```ts
const file = coord.charCodeAt(0) - ...
const rank = parseInt(coord[1], 10)
```

Invalid input can produce NaN/out-of-range index rather than explicit error.

Severity: **P2 API robustness**.

Recommended later:

- strict `/^[a-h][1-8]$/` validation, or
- make helper contract explicitly trusted/internal.

Check all consumers before changing error behavior.

### 6.7. Position-key rule context

Current key includes:

```text
ruleset + side-to-move + board piece color/type
```

This is sufficient for current board-only rules.

If future Hao Rek is stateful/event-triggered, two identical boards can have different legal responses depending on active call context. Then position key **must include Hao context**, or repetition/transposition logic becomes incorrect.

Priority: **P0-dependent architectural requirement**.

---

## 7. `session.ts` audit

### Strong points

- canonical state normalization;
- defensive copies;
- legacy alias migration;
- repetition key migration/merge;
- snapshot version envelope;
- 64-cell validation;
- piece shape/id validation;
- unique IDs across board + captured trays;
- max one King per side;
- status/winner basic consistency;
- numeric counter validation.

### A-SESSION-01 — structural vs semantic validation gap

Loader validates **at most** one King per side, but a `playing` snapshot can structurally contain zero Kings and still pass shape validation if other fields are valid.

Likewise a won state does not deeply prove winner/board/winReason consistency.

This may be desirable for custom/debug states, but persistence boundary should choose explicitly.

Severity: **P2 robustness**.

Recommended approach:

1. define `GameState` compatibility vs `PersistedGameState` invariants;
2. preserve custom fixture flexibility separately;
3. only tighten loader with migration/backward compatibility tests.

### A-SESSION-02 — snapshot version if Hao context added

If Hao Rek becomes stateful, snapshot must carry call context. Decide whether this is backward-compatible optional field or merits version bump based on semantics.

Severity: **P0-dependent**.

### A-SESSION-03 — `availableRekMovesCount`

`normalizeState()` recomputes this from current global-board opportunities. If future Hao semantics become active-call-specific, field name/meaning may become misleading.

Potential future decision:

- keep as diagnostic “all board Rek opportunities”, or
- replace/add active Hao response count.

Priority: **P0-dependent**.

---

## 8. Public API audit

### PASS

`public-api-tests.ts` covers:

- canonical default;
- canonical setup exposure;
- move + undo;
- defensive getState copy;
- serialize/deserialize;
- malformed snapshot rejection;
- current Min contract;
- legacy migration;
- catalog shape;
- canonical output typing.

### Gap

No test currently appears to lock **`RekEngine` vs `RekGame` return semantics** because public API tests focus on canonical `RekGame`.

Recommended P1 regression before cleanup:

```text
API-COMPAT-01
current Min violating move
→ state transition result
→ boolean contract must be identical/documented across supported wrappers
```

Or mark `RekEngine` deprecated and test that new public docs do not recommend it.

---

## 9. AI audit

### 9.1. Legality architecture — PASS / STRONG

`getAllLegalMoves()` consumes `getAllMoveResults()`.

AI uses engine-returned:

- exact captures;
- capturesKing;
- Rek flag;
- Poat flag.

It does not reimplement movement/Rek/Poat/Hao legality.

This is the correct architecture and should be preserved.

### 9.2. Search determinism — PASS at checkpoint

Medium/Hard deterministic baselines are regression-locked.

Checkpoint:

```text
Medium: 798 nodes
Hard: 7,532 nodes / 652 cutoffs
```

### 9.3. Draw-history mismatch

Minimax receives essentially:

```text
board + aiColor/currentTurn + RuleSet
```

It does not receive:

- `positionCounts`;
- `loneKingMoveCount`;
- `drawMoveLimit`.

Therefore search may assign win/loss/eval to a branch that the real session would adjudicate draw via project extensions.

Severity: **P2 technical quality**, not P0 because draw rules themselves are unsupported traditional extensions.

Only solve after deciding whether threefold/lone-King rules remain long-term.

### 9.4. Future stateful Hao impact

If Hao call context changes legal moves, AI API must receive engine state/context rather than reconstruct from board.

Likely future direction:

- search position includes board + ruleset + Hao context;
- AI continues to call engine legality, never derives call itself.

Priority: **P0-dependent**.

---

## 10. Tournament audit

### Good

- canonicalizes ruleset;
- uses `createGame()` session for actual moves;
- verifies AI chosen move appears in engine legal set;
- tracks `illegalMoves`;
- seeded opening diversity uses legal moves only;
- Hard/Medium color swap removes simple side assignment bias;
- capped games tracked separately.

Checkpoint:

```text
tournament smoke illegalMoves = 0
```

### Follow-up

If Hao semantics change:

- add event/call state to tournament snapshot if needed;
- rebaseline deterministic node counts/game outcomes;
- verify illegalMoves remains 0;
- explicitly test chain Hao sequences if they can arise.

No immediate tournament architecture rewrite required.

---

## 11. Puzzle audit

### Current reality

`KHMER_PUZZLES` contains 7 curated engine tactical fixtures.

Some custom boards place Kings on d1/d8 or other non-canonical-start squares. That is fine for a puzzle fixture.

### Risk

Descriptions/titles can imply cultural/traditional authority while puzzles may depend on:

- current BFS Poat semantics;
- exact Rek→Poat order;
- current engine terminal assumptions;
- invented tactical names.

Severity: **P1/P2 presentation/evidence risk**.

Recommended:

1. label all as **engine tactical/training fixtures** by default;
2. add optional provenance metadata per puzzle in future;
3. only badge “traditional/historical” when independent source exists;
4. never use puzzle d1/d8 custom King positions to explain initial setup.

---

## 12. Test suite audit

`run-engine-tests.cjs` compiles and runs 13 report groups:

1. core engine;
2. specification lock;
3. AI legality boundary;
4. GameState contract;
5. draw adjudication;
6. puzzles;
7. simulations;
8. AI quality;
9. AI search regression;
10. AI tournament regression;
11. movement regression;
12. rule-guide behavior lock;
13. public session API.

Checkpoint reported: **97/97 PASS**.

### Strong coverage areas

- canonical setup;
- movement geometry;
- current Rek/Poat pipeline;
- current Min behavior;
- immutability/state;
- snapshot migration;
- AI legality;
- deterministic AI metrics;
- tournament illegal move smoke.

### Gaps / next tests

#### A-TEST-01 — future Hao event fixtures

Only after evidence gate:

- pre-existing pair;
- newly called pair;
- exact allowed response(s);
- multiple-pair rule;
- violation semantics;
- expiry/chain;
- snapshot/replay;
- AI legality.

#### A-TEST-02 — facade consistency

Add regression for `RekEngine` vs `RekGame` or deprecate one.

#### A-TEST-03 — terminal terminology/predicate

Add separate tests distinguishing:

- Poat zero liberties;
- zero geometric legal moves;
- capture King.

Do not conflate them in fixture names.

#### A-TEST-04 — snapshot semantic invariants

If loader contract is tightened, test missing Kings/status consistency.

---

## 13. CI audit

### Engine CI

Current `.github/workflows/engine-tests.yml` runs:

- Node 22;
- dependency install;
- typecheck;
- full engine regression.

But path trigger includes code/scripts/package/tsconfig/workflow only.

### Concrete gap: docs do not trigger CI

Changes to:

- `HUONG_DAN_LUAT_CO_REK_KHMER.md`;
- `SPEC_ENGINE_CO_REK_KHMER.md`;
- `ENGINE_ARCHITECTURE_REK_KHMER.md`;
- research notes;

do not automatically trigger engine regression workflow.

Severity: **P1 process risk** because docs are part of rule-change governance.

Recommended:

- add foundational docs to workflow paths; or
- add docs-contract workflow that runs appropriate tests.

### `rule-guide-lock-tests.ts` naming caveat

It tests engine behavior corresponding to guide claims; it does not parse Markdown content. Therefore changing guide prose can bypass any machine consistency check.

Potential action:

- rename for clarity, or
- add actual doc invariant checks.

### AI tournament workflow

Current tournament baseline workflow is `workflow_dispatch`, appropriate for heavier/manual baselines.

No need to run 200-game baseline on every docs PR.

---

## 14. Dependency/build audit

Package is intentionally minimal:

- TypeScript exact `5.7.3`;
- `@types/node` range `^24`;
- no runtime dependencies.

Strength: very low attack/maintenance surface.

Minor reproducibility note: CI uses `npm install --no-package-lock`, so ranged dev dependency resolution can drift over time. Not urgent.

Priority: **P3/low** unless reproducible CI becomes a concern.

---

## 15. Roadmap/documentation audit

Before this docs pass, `PLAN_PHAT_TRIEN_CO_REK.md` was materially stale:

- treated `REK_POAT` as mode;
- described AI path inconsistent with current repo;
- claimed UI/GameBoard/mode selector completed though no UI exists in repo;
- framed 7 puzzles as native/traditional without provenance.

This has now been corrected on the audit branch.

Current roadmap should be interpreted as:

```text
P0 exact Hao research
→ P1 semantics-preserving API/CI cleanup
→ P1 puzzle labeling/provenance
→ P2 terminal/draw consistency
→ P3 future UI/application
```

---

## 16. Priority backlog

### P0 — DO FIRST: exact Hao Rek research

Block gameplay rewrite until exact `បើកឲ្យរែក` semantics are strong enough.

Required answers:

1. previous/opponent action required?
2. exact geometry?
3. newly exposed pair?
4. pre-existing pair?
5. multiple pairs choice?
6. verbal call?
7. illegal vs instant-loss response?
8. lifetime?
9. chain termination?
10. King stationary?
11. Poat in Min?
12. `រែកហែក` terminology?
13. zero-move relation?

### P1 — semantics-preserving technical cleanup

1. Choose one canonical stateful facade (`RekGame` preferred).
2. Resolve/deprecate `RekEngine.makeMove()` boolean inconsistency.
3. Add facade regression.
4. Add foundational Markdown paths to CI or create docs-contract CI.
5. Clarify low-level preview vs session rule-legal preview.
6. Label puzzles as engine fixtures unless provenance exists.

### P2 — after P0 or in parallel if no rule behavior change

1. Research/clarify zero-move terminal vs Poat/`ទាល់ច្រក`.
2. Rename misleading “Zero liberties” terminal reason if needed.
3. Decide long-term threefold/lone-King extensions.
4. If kept, model draw history in AI search.
5. Harden `coordToIdx()` input contract.
6. Decide snapshot semantic validation invariants.
7. Research dual-axis Rek-4 exact historical semantics.
8. Research exact Poat group/liberty behavior.

### P3 — application development

1. Build UI around `RekGame` + `listRuleSets()`.
2. Local match.
3. vs AI.
4. i18n/cultural presentation.
5. Online/networking later.

Do not implement Hao teaching/audio/UX as authoritative before exact semantics are verified.

---

## 17. Recommended next execution sequence

### Track A — research

```text
A1. Deep Hao geometry
A2. Kambuja Suriya 1964 body
A3. 1973 original scan/page
A4. Chuon Nath vol.2 exact scan page
A5. real-board reconstruction
```

If A1 produces authoritative exact semantics: **stop, report evidence first**.

### Track B — safe engineering cleanup after docs PR

Can proceed without changing traditional gameplay:

```text
B1. Public facade cleanup/deprecation plan
B2. CI docs trigger
B3. puzzle provenance labels
B4. coordinate/state-validation design
```

### Track C — only after rule decisions

```text
C1. Hao state model + snapshot migration
C2. new failing regressions
C3. core engine change
C4. AI adaptation
C5. tournament rebaseline
```

---

## 18. What NOT to do next

- Không sửa current Min trigger sang newly-exposed-pair chỉ từ community review.
- Không gọi current global compulsory model traditional truth.
- Không restore d1/d8 initial setup.
- Không promote `REK_POAT` thành ruleset.
- Không merge Ouk/Chatrang rules vào Rek.
- Không gọi threefold/lone-King 32 traditional.
- Không gọi BFS zero-liberties historical Poat truth.
- Không gọi 7 engine puzzles là traditional collection nếu chưa có source.
- Không thêm UI-side capture/Hao logic.
- Không tối ưu AI bằng cách bypass engine legality.

---

## 19. Audit conclusion

Core project foundation hiện **đủ sạch để tiếp tục phát triển**, và PR #23–#29 đã tạo ranh giới architecture/evidence tốt. Không có lý do rewrite engine rộng lúc này.

Việc quan trọng nhất không phải “code thêm”, mà là **khóa exact Hao Rek transition semantics**. Source 2013 đã nâng chất lượng evidence đáng kể: obligation được mô tả bằng opponent action `បើកឲ្យរែក`, khiến board-global current implementation trở thành điểm cần xác minh lại rõ ràng nhất.

Trong khi chờ research, project có thể an toàn làm các cleanup không đổi gameplay: facade consistency, CI docs triggers, puzzle labeling, API validation design. Mọi gameplay change vẫn phải đi theo:

```text
research
→ guide
→ SPEC
→ tests
→ engine
→ session/snapshot
→ AI/tournament
```
