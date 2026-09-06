# REK KHMER — RESEARCH FINAL / V1 FREEZE

> **Freeze date:** 2026-09-07  
> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Purpose:** close active rule research for v1, separate evidence-backed rules from software policy, and define when research may reopen.

This file does **not** claim that every engine behavior is traditional Khmer truth. It freezes the current evidence classification so product work can proceed without reopening the same questions repeatedly.

## 1. V1 freeze principle

Research v1 is considered complete when every gameplay claim is in one of these buckets:

- `CONFIRMED`
- `STRONG EVIDENCE`
- `SECONDARY`
- `ENGINE INTERPRETATION`
- `COMMUNITY SIGNAL`
- `UNVERIFIED`
- `UNSUPPORTED`
- `REJECTED AS POSITIVE EVIDENCE`

Unknowns are allowed to remain unknown. They are not promoted merely to make the engine complete.

Active research should reopen only when one of these appears:

1. authoritative Khmer archival/rule text;
2. independent native source with reconstructable board sequence;
3. expert/practitioner validation with explicit board examples;
4. original scan/page that materially changes a frozen claim.

## 2. Frozen evidence matrix

| Claim | V1 evidence label | V1 software disposition |
|---|---|---|
| Rek is a Khmer board game | `CONFIRMED` / strong institutional tradition | keep |
| Board is 8×8 | `STRONG EVIDENCE` | keep |
| 1 King + 15 Men per side | `STRONG EVIDENCE` | keep |
| One piece moves per turn | `STRONG EVIDENCE` | keep |
| Objective is capture opposing King | `STRONG EVIDENCE` | keep |
| Canonical staggered setup a2/h7 | `STRONG EVIDENCE + project canonical lock` | keep; never restore d1/d8 initial setup |
| Regular movement is orthogonal sliding through empty squares | `STRONG EVIDENCE` | keep |
| Two-sided Rek/intervention capture | `CONFIRMED` | keep |
| Dual-axis Rek can capture 4 | `ENGINE INTERPRETATION / UNVERIFIED` | keep for v1 |
| Trapping/encirclement concept | `CONFIRMED` | keep concept |
| Poat = BFS connected group + zero orthogonal liberties | `ENGINE INTERPRETATION / UNVERIFIED` | keep for v1 |
| Rek resolves before Poat | `ENGINE INTERPRETATION / UNVERIFIED` | keep for v1 |
| `រែកព័ទ្ធ` exists as a named living/intergenerational practice | `SECONDARY independent corroboration` | terminology research only |
| `រែកព័ទ្ធ` and `មិនរែកចាញ់` are described as separate types | `SECONDARY` | do not infer final Poat-in-Min rule |
| Poat belongs in `MIN_REK_CHANH` | `UNVERIFIED` | keep current behavior for v1; do not call historical truth |
| Hao Rek is triggered by opponent action/transition | `STRONG EVIDENCE` | implemented |
| Trigger is newly-created responder Rek opportunity after opponent move | `STRONG EVIDENCE candidate` | implemented as v1 technical contract |
| Pre-existing Rek alone creates Hao obligation | evidence strongly leans **no** | not used as trigger |
| Blocker leaving can create Hao | `STRONG EVIDENCE candidate` | supported by transition diff |
| Mover entering can create Hao | `STRONG EVIDENCE candidate` | supported by transition diff |
| Hao response can create counter-Hao chain | `STRONG EVIDENCE candidate + SECONDARY text` | implemented |
| Ignore active Hao => loss | `SECONDARY` | implemented as state-changing forfeit |
| Multiple newly-created Hao responses: responder chooses any | `UNVERIFIED historical rule` | explicit `TECHNICAL POLICY` |
| Verbal shout/call is mandatory | `UNVERIFIED` | not modeled |
| King is completely stationary in Min | visual/secondary support but no direct native rule text | keep current engine behavior as `ENGINE INTERPRETATION / UNVERIFIED historical rule` |
| Zero geometric moves = instant win | `UNVERIFIED`; not established by `ទាល់ច្រក` wording | keep current engine behavior as project interpretation |
| `ទាល់ច្រក` / encirclement is identical to zero-move terminal | `UNSUPPORTED` | do not conflate |
| Threefold repetition | `UNSUPPORTED traditional claim / project extension` | keep |
| Lone-King draw limit 32 | `UNSUPPORTED traditional claim / project extension` | keep |
| `រែកហែក` relation to Hao/Min | `UNVERIFIED` | no canonical terminology change |

## 3. Hao Rek v1 contract

Current implementation is intentionally state/transition-aware:

```text
BEFORE = responder Rek opportunities before opponent move
opponent move executes
AFTER = responder Rek opportunities after opponent move
NEW = AFTER - BEFORE

if NEW is non-empty:
    store HaoRekContext.allowedResponses = NEW
    responder may choose any allowed response
    submitting another geometric move => immediate forfeit

after a valid response:
    derive the next side's NEW responses
    chain while a new Hao context exists
```

Important evidence boundary:

- event-triggered Hao is research-supported;
- exact multiple-new-target choice is a software policy;
- speech/audio is not part of the v1 rule state;
- AI consumes engine-owned state legality and must not derive Hao independently.

## 4. King stationary and zero-move final research result

### King stationary in Min

The final narrow search did **not** find a Khmer rule text that directly says the King cannot move in `MIN_REK_CHANH`.

The 2013 source confirms a `ស្តេច (អង្គ)` can be Rek-captured, but does not describe King movement. User-supplied real-board footage visually supports stationary unique palace markers across sampled play, but the identity and universality are not strong enough for `CONFIRMED`.

V1 classification:

> `ENGINE INTERPRETATION / UNVERIFIED historical rule` with meaningful secondary/visual support.

### Zero geometric moves

Chuon Nath tradition says that if one side is `ទាល់ច្រក`, the other may `កៀរក្រសោបស៊ីបានទាំងអស់` — surround/close in and capture all.

No Rek-specific source found in the final pass states:

> “having zero geometric moves immediately loses the game.”

Therefore:

> zero-geometric-move instant win = `ENGINE INTERPRETATION / UNVERIFIED`.

It must remain distinct from Poat/liberty terminology and from the confirmed trapping/encirclement concept.

## 5. Poat / Min final research result

V1 closes this question without forcing a historical answer:

- 2013 text describes `រែកព័ទ្ធ` and `មិនរែកចាញ់` as two types: `SECONDARY`;
- AMS Sports 2023 independently corroborates a living/intergenerational practice explicitly called `រែកព័ទ្ធ`: `SECONDARY independent corroboration`;
- no independent rule source found that defines exact Poat capture geometry;
- no sufficient independent evidence proves Poat must be disabled in `MIN_REK_CHANH`.

V1 decision:

> Keep Poat-in-Min behavior unchanged as `ENGINE INTERPRETATION / UNVERIFIED`. Reopen only on materially stronger evidence.

## 6. Archival items intentionally left open

These are useful future evidence targets but are **not blockers for v1 product work**:

- Chuon Nath vol.2 exact scan page for `រែក`;
- exact page in 1973 `ប្រជុំវប្បធម៌ទូទៅ`;
- Kambuja Suriya article-body search, including 1964 scans;
- reconstructable independent real-board Poat sequence;
- authoritative handling of multiple newly-created Hao targets;
- authoritative `រែកហែក` terminology.

Do not repeatedly run broad searches for these without a new lead.

## 7. V1 engineering checkpoint

At freeze time the project has:

- transition-owned `HaoRekContext`;
- state-aware session legality;
- snapshot persistence/validation for Hao state;
- active-Hao-aware repetition identity;
- state-aware AI/tournament legality;
- draw-history-aware live AI search;
- strict public coordinate validation;
- semantic persisted-state validation;
- deprecated legacy `RekEngine` facade with aligned state-change semantics;
- rule/research Markdown included in engine CI triggers.

Latest verified regression checkpoint before this freeze:

```text
109/109 PASS
Medium: 798 nodes
Hard: 7,532 nodes / 652 cutoffs
tournament illegalMoves = 0
```

## 8. After the freeze

Default project direction is now application/product work:

```text
core v1 freeze
→ UI board
→ Local
→ vs AI
→ presentation/i18n
→ persistence/replay
→ Online
→ polish
```

Rule research becomes event-driven rather than continuous.

If new evidence contradicts a frozen technical policy:

```text
new evidence
→ research note
→ guide
→ SPEC
→ failing regression
→ engine/session
→ AI/tournament
→ new freeze revision
```
