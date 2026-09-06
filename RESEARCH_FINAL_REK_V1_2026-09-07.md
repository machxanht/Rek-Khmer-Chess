# REK KHMER RULES — V1 RESEARCH FREEZE

> Date: 2026-09-07
> Repository: machxanht/Rek-Khmer-Chess
> Status: V1 FROZEN — reopen only for materially stronger Rek-specific evidence

## 1. Purpose

This document closes active rule research for Rek v1.

It does **not** claim every current engine rule is historical truth. It freezes a transparent boundary between:

- evidence-backed Rek rules;
- strong but incomplete reconstructions;
- explicit project technical policies;
- unresolved historical questions.

From this point, active development should move to product/game completion. Rule research reopens only when new evidence can materially change a claim, SPEC contract, or test fixture.

## 2. Canonical project model

One game:

```text
REK_KHMER
```

Two canonical rulesets:

```text
REK_STANDARD
MIN_REK_CHANH
```

Compatibility only:

```text
REK_POAT -> REK_STANDARD
GameMode -> deprecated alias
```

Rek and Poat are mechanics. Hao Rek is a transition-owned obligation/state inside Min Rek Chanh. Local / Online / vs AI are application match types, not rulesets.

## 3. V1 claim matrix

| Claim | V1 status |
|---|---|
| Rek is a Khmer game | CONFIRMED |
| Board 8x8 | STRONG EVIDENCE |
| 1 King + 15 Men per side | STRONG EVIDENCE |
| One piece moves per turn | STRONG EVIDENCE |
| Goal is capture opposing King | STRONG EVIDENCE |
| Two-sided Rek capture | CONFIRMED |
| Trapping / encirclement concept around `ទាល់ច្រក` | CONFIRMED |
| Canonical 7 + King + 8 setup, Kings a2/h7 | STRONG EVIDENCE + PROJECT CANONICAL LOCK |
| Regular orthogonal rook-like movement | STRONG EVIDENCE |
| Event-triggered Hao Rek from opponent action | STRONG EVIDENCE |
| Newly-created Rek response set as software Hao trigger | PROJECT V1 TECHNICAL POLICY, evidence-supported |
| Pre-existing Rek alone does not create Hao obligation | STRONG EVIDENCE candidate + V1 POLICY |
| Hao response can create counter-Hao chain | STRONG EVIDENCE candidate + SECONDARY text support |
| Ignore active Hao -> loss | SECONDARY consequence support + V1 POLICY |
| Multiple NEW Hao responses -> responder may choose any | TECHNICAL POLICY / historical rule UNVERIFIED |
| Verbal shout/call occurs in practice | SECONDARY |
| Verbal call is mandatory for legality | UNVERIFIED; software does not require it |
| King stationary in Min | ENGINE INTERPRETATION / UNVERIFIED |
| Poat belongs inside Min | ENGINE INTERPRETATION / UNVERIFIED |
| Rek Poat and Min Rek Chanh are distinct named types | SECONDARY |
| BFS connected-group + zero-liberties Poat | ENGINE INTERPRETATION |
| Rek resolves before Poat | ENGINE INTERPRETATION |
| Dual-axis Rek captures four | ENGINE INTERPRETATION / UNVERIFIED |
| Zero geometric moves = instant win | ENGINE INTERPRETATION / UNVERIFIED |
| Threefold repetition | PROJECT EXTENSION / unsupported traditional claim |
| Lone-King 32 | PROJECT EXTENSION / unsupported traditional claim |
| `រែកហែក` relationship to Hao/Min | UNVERIFIED |

## 4. Hao Rek v1 freeze

The implemented project model is:

```text
BEFORE = responder Rek opportunities before opponent move
opponent move
AFTER = responder Rek opportunities after move
NEW = AFTER - BEFORE

NEW empty
-> no Hao obligation

NEW non-empty
-> active HaoRekContext
-> allowedResponses = all NEW responses
-> responder must choose one
-> ignored active Hao = immediate forfeit
-> response may create NEW responses for the other side
-> chain continues until latest move creates no NEW response
```

This model is supported by:

- Khmer textual wording `បើកឲ្យរែក -> ត្រូវតែរែក`;
- automatic-loss wording `បើមិនរែក -> ចាញ់`;
- reconstructed real-board sequences in user-supplied media;
- sequence where a pre-existing Rek coexists with a newly-opened called response;
- both blocker-leaves and mover-enters geometries.

Historical edge cases still unresolved:

- mandatory speech declaration;
- exact traditional choice rule for multiple NEW responses;
- full interaction with Poat and multi-axis Rek.

These do not block Rek v1 because they are isolated behind replaceable technical policies.

## 5. Poat / Min decision

Research found:

- Chuon Nath tradition confirms trapping / encirclement as part of Rek;
- 2013 lineage describes `រែកព័ទ្ធ` and `មិនរែកចាញ់` as two types;
- independent practitioner reporting in 2023 corroborates a living/intergenerational practice explicitly called `រែកព័ទ្ធ`.

Research did **not** find:

- an authoritative exact Poat algorithm;
- independent proof that current BFS zero-liberties is traditional;
- sufficient evidence to state that Min Rek Chanh must disable Poat.

Therefore v1 keeps current Poat-in-Min behavior as **ENGINE INTERPRETATION / UNVERIFIED**, not historical truth.

## 6. Terminal / King freeze

No Rek-specific source found in the final pass proves:

- the Min King must be completely stationary;
- zero geometric moves is a separate traditional instant-win condition.

Therefore both remain explicit engine interpretations.

The engine wording `Opponent has no geometric moves` must remain separate from Poat/liberty terminology and must not be cited as proof of traditional `ទាល់ច្រក`.

## 7. Archival unresolved items

Still worth resolving opportunistically, but they no longer block v1:

- exact Chuon Nath scan page for `រែក`;
- exact 1973 `ប្រជុំវប្បធម៌ទូទៅ` page;
- Kambuja Suriya 1964 body search for Rek mentions;
- stronger independent Poat rule text;
- native expert validation for King stationary / multiple-Hao choice.

Do not invent page numbers or promote absence from an index into absence from the corpus.

## 8. V1 implementation status

Current engine architecture:

- canonical setup a2/h7;
- transition-owned `HaoRekContext`;
- state-aware session/API/AI legality;
- snapshots persist Hao context;
- repetition identity includes active Hao responses;
- AI search carries Hao/repetition/lone-King state through engine transitions;
- coordinate API rejects malformed coordinates;
- persisted snapshots enforce semantic invariants;
- zero-move terminal wording is separated from Poat terminology.

Current Quality Gate before this freeze branch: **109/109 PASS**.

## 9. Reopen criteria

Do not resume broad rule research.

Reopen a frozen claim only when at least one of these appears:

1. authoritative Khmer rulebook / institutional archival text;
2. original scan with directly relevant rule wording;
3. independent native practitioner/expert validation with reconstructable board examples;
4. real-board footage with a reconstructable event that conflicts with the frozen model;
5. two independent sources that materially resolve an existing UNVERIFIED edge.

App-store descriptions, app behavior and screenshots never satisfy this gate.

Community comments may trigger a hypothesis but cannot alone reopen SPEC/gameplay.

## 10. Development direction after freeze

Default priority after this document:

```text
finish core/API quality
-> gameplay application
-> UI
-> local/vs-AI
-> online/replay
-> product polish
```

Research is now maintenance work, not the main development track.

