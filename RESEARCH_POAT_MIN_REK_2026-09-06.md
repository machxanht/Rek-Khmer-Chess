# RESEARCH CHECKPOINT: `រែកព័ទ្ធ` vs `មិនរែកចាញ់` — 2026-09-06

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Scope:** whether current Poat behavior historically belongs inside `MIN_REK_CHANH`, and what can safely be claimed about the named `រែកព័ទ្ធ` tradition.  
> **Status:** `UNRESOLVED — DO NOT CHANGE POAT-IN-MIN GAMEPLAY FROM THIS NOTE ALONE`

---

## 1. Question

Current project behavior keeps the Poat capture implementation enabled in both canonical rulesets:

```text
REK_STANDARD
MIN_REK_CHANH
```

The historical question is narrower:

> Does traditional `MIN_REK_CHANH` itself include the same Poat/encirclement capture mechanic, or are `រែកព័ទ្ធ` and `មិនរែកចាញ់` distinct Rek variants with materially different rule sets?

This is a historical-evidence question, not an invitation to infer rules from the current app/engine.

---

## 2. Source H1 — Visal Odom / Phnom Penh Post attribution, 2013

The 2013 Khmer article states explicitly:

> `ល្បែង “រែក” មាន​ពីរ​ប្រភេទ គឺ “រែក ព័ទ្ធ” និង “មិន​រែក​ចាញ់”`

Literal:

> “The game Rek has two types: ‘Rek Poat’ and ‘Min Rek Chanh’.”

It further says Khmer people, especially in rural areas, prefer `មិនរែកចាញ់` because it is easier and simpler than `រែកព័ទ្ធ`.

Claim labels:

| Claim | Label |
|---|---|
| The source distinguishes named `រែកព័ទ្ធ` and `មិនរែកចាញ់` types | `SECONDARY` |
| `មិនរែកចាញ់` is described as simpler/easier than `រែកព័ទ្ធ` | `SECONDARY` |
| Therefore Poat capture is categorically forbidden in every traditional Min position | `UNVERIFIED` |
| Exact Rek-Poat capture algorithm | `UNSUPPORTED` by this passage |

Source lineage caveat: the 2016 VOD article has near-identical wording and is associated with the same Visal Odom text lineage, so 2013 + 2016 are **not** counted as two independent sources.

---

## 3. Source H2 — VOD Khmer, 2016

VOD repeats the two-type wording:

```text
“រែកព័ទ្ធ”
“រែកចាញ់ ឬមិនរែកចាញ់”
```

It also describes players hearing an opponent shout phrases such as:

```text
“រែកមួយ!”
“រែកមួយទៀត!”
```

Evidence boundary:

- this corroborates that verbal calling/shouting occurs in the described practice/text;
- it **does not prove** that speech is a legal prerequisite for a Hao obligation;
- because the article is not independent from the 2013 lineage, it does not independently resolve variant separation.

Verbal-call requirement remains `UNVERIFIED`.

---

## 4. Independent practitioner corroboration — AMS Sports, 2023-09-26

AMS Sports article:

> `គេគ្រប់គ្នាស្ទើរបំភ្លេចចោល តែអ្នករត់ម៉ូតូឌុបម្នាក់នៅតែលេងរែកព័ទ្ធកំសាន្តជីវិត`

Article URL:

`https://sports.ams.com.kh/detail/23165`

Associated AMS Sports video:

`https://www.youtube.com/watch?v=9j32wv2ca3A`

The article identifies a man named `សុផល` (Sophol), over 60 years old, who still plays `រែកព័ទ្ធ` with peers. He says he learned it as a child by watching and learning from older people who played it.

Claim labels:

| Claim | Label |
|---|---|
| A living Khmer practice is explicitly called `រែកព័ទ្ធ` | `SECONDARY / contemporary practitioner corroboration` |
| The named practice was learned intergenerationally from older players | `SECONDARY / oral-practitioner corroboration` |
| `រែកព័ទ្ធ` is not merely a modern app label | `STRONGER SECONDARY CORROBORATION` |
| Exact Poat capture geometry/algorithm | `UNVERIFIED` |
| `រែកព័ទ្ធ` and `មិនរែកចាញ់` have mutually exclusive capture mechanics | `UNVERIFIED` |
| Current BFS connected-group + zero-liberty Poat implementation is historically exact | `UNVERIFIED / ENGINE INTERPRETATION` |

This source is independent of the 2013/2016 Visal text lineage and materially strengthens the evidence that a named Rek-Poat tradition exists outside app/developer material.

It still does **not** supply enough board-level rule detail to change the engine.

---

## 5. Chuon Nath / Buddhist Institute boundary

The dictionary tradition confirms the broader Rek game includes both:

- two-sided Rek capture; and
- a trapping/encirclement concept when a side is `ទាល់ច្រក`, where the other side can `កៀរក្រសោបស៊ីបានទាំងអស់`.

This is strong evidence for an encirclement/trapping concept somewhere in Rek tradition.

It does not identify:

- whether that passage maps exactly to the later label `រែកព័ទ្ធ`;
- whether the same encirclement rule also remains active inside `មិនរែកចាញ់`;
- the current engine's BFS/liberty implementation.

Therefore the dictionary cannot by itself settle Poat-in-Min.

---

## 6. Targeted search result — 2026-09-06

Exact/narrow searches were run for combinations of:

- `រែកព័ទ្ធ`
- `មិនរែកចាញ់`
- `របៀបលេងរែកព័ទ្ធ`
- `ក្បួនរែកព័ទ្ធ`
- `រែកព័ទ្ធ ទាល់ច្រក`
- `រែកព័ទ្ធ ស៊ី`

Result:

1. the explicit two-type rule wording still resolves mainly to the 2013/2016 Visal lineage;
2. AMS Sports independently corroborates living/intergenerational `រែកព័ទ្ធ` practice but does not publish enough exact board rules in its article text;
3. no authoritative archival source was found in this pass that states whether Poat remains enabled or disabled inside `មិនរែកចាញ់`;
4. no source in this pass validates the engine's exact connected-component/zero-liberty algorithm as traditional law.

---

## 7. Engine decision at this checkpoint

**Do not change gameplay yet.**

Current policy remains:

```text
Poat in MIN_REK_CHANH = ENGINE INTERPRETATION / UNVERIFIED historical semantics
```

The 2013 named-variant separation is a meaningful challenge to current behavior, and AMS 2023 independently strengthens the existence of a Rek-Poat tradition, but the evidence does not yet define a safe replacement rule.

Turning Poat off in Min now would invent a stronger claim than the sources actually establish.

---

## 8. Highest-value next evidence

Priority order:

1. reconstruct the AMS Sports 2023 real-board video if it exposes actual moves/captures;
2. find an older Khmer rule text that separately defines `រែកព័ទ្ធ` and `មិនរែកចាញ់`;
3. recover archival scans already identified in the wider research (`Chuon Nath` exact page, 1973 compilation object, Kambuja Suriya body candidates);
4. obtain expert/practitioner board examples specifically answering:
   - Does Min use Poat?
   - What exactly constitutes a Poat capture?
   - Can Poat occur during/after a Hao chain?

If a reconstructable source resolves these questions, stop at the evidence gate and update guide → SPEC → failing tests before changing engine behavior.
