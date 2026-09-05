# HƯỚNG DẪN LUẬT & HỒ SƠ BẰNG CHỨNG: រែកខ្មែរ - REK KHMER (ល្បែងរែក)

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Ngày cập nhật:** 2026-09-06  
> **Mục đích:** mô tả luật Rek Khmer theo mức độ bằng chứng và ngăn engine biến suy luận kỹ thuật thành “luật truyền thống đã xác nhận”.

---

## 1. Canonical terminology

Project chỉ có **một game**:

```text
Game = REK_KHMER
```

Hai canonical rulesets:

```text
RuleSet
├── REK_STANDARD
└── MIN_REK_CHANH
```

- **Rek / រែក** = capture mechanic.
- **Poat / ព័ទ្ធ** = trapping/encirclement mechanic.
- **Hao Rek / ហៅរែក** = call/obligation concept nằm trong research về `MIN_REK_CHANH`; không phải game mode riêng.
- **Min Rek Chanh / មិនរែកចាញ់** = variant có concept “không Rek thì thua”.
- `REK_POAT` = deprecated/legacy compatibility alias → `REK_STANDARD`.
- `GameMode` = deprecated source-compatible alias; new code dùng `RuleSet` / `RuleSetInput`.
- Local / Online / vs AI / AI-vs-AI = match type ngoài core rules engine.

Không quay lại cách gọi Rek/Poat/Hao Rek thành ba game mode.

---

## 2. Evidence labels bắt buộc

| Label | Nghĩa |
|---|---|
| **CONFIRMED** | Nguồn Khmer/institutional mạnh xác nhận trực tiếp claim. |
| **STRONG EVIDENCE** | Bằng chứng độc lập phù hợp nhưng chưa khóa mọi edge case. |
| **SECONDARY** | Corroboration hữu ích nhưng không phải authoritative rule text. |
| **ENGINE INTERPRETATION** | Cách project hiện thực hóa nguyên lý chưa được nguồn lịch sử mô tả đủ chi tiết. |
| **COMMUNITY SIGNAL** | Comment/forum/oral recollection dùng tạo hypothesis/keyword/fixture. |
| **UNVERIFIED** | Có dấu hiệu hoặc đang tồn tại trong code/docs nhưng chưa đủ evidence. |
| **UNSUPPORTED** | Chưa tìm thấy Rek-specific evidence. |
| **REJECTED AS POSITIVE EVIDENCE** | App-store developer text, tutorial/screenshot/app behavior và scraper/copy của chúng. |

**Label theo từng claim, không label cả source một cục.** Regression xanh không biến `ENGINE INTERPRETATION` thành `CONFIRMED`.

---

## 3. Source policy

### 3.1. Ưu tiên

1. Buddhist Institute.
2. Chuon Nath Dictionary bản gốc/scan.
3. Center for Khmer Studies.
4. MoEYS Cambodia.
5. Ministry of Culture / Khmer archival sources.
6. `កម្ពុជសុរិយា`.
7. sách/scan Khmer cũ.
8. academic/cultural source độc lập.
9. video bàn thật Khmer nếu reconstruct được position + move sequence.

### 3.2. Không dùng làm positive evidence

`REJECTED AS POSITIVE EVIDENCE`:

- Google Play / Apple App Store developer descriptions;
- app tutorial/screenshot;
- app behavior/implementation;
- website mirror/scrape app-store description.

### 3.3. Community signal

User comments/reviews được đọc để tìm edge case, keyword Khmer và candidate fixtures, nhưng **không tự sửa guide/SPEC/engine**.

---

## 4. Nguồn cốt lõi đã đối chiếu

### S1 — Chuon Nath / Buddhist Institute dictionary tradition

Exact Khmer reproduction:

> `រែក (ន.) ឈ្មោះល្បែងមួយប្រភេទ ស្រដៀងនឹងចត្រង្គ ខុសគ្នាតែឈ្មោះកូន និងការឈ្នះចាញ់, មានបែបឲ្យស៊ីរែកទាំងពីរខាង ឬបើអ្នកម្ខាងទាល់ច្រក ត្រូវអ្នកម្ខាងកៀរក្រសោបស៊ីបានទាំងអស់ : លេងរែក (ជាល្បែងសម្រាប់ពួកទាហានដូច ចត្រង្គ ដែរ) ។`

Literal VN gần nhất:

> “Rek: tên một loại trò chơi, tương tự Chatrang nhưng khác ở tên quân và cách thắng thua; có lối ăn Rek ở cả hai phía; hoặc nếu một bên bị dồn/bế tắc thì bên kia có thể dồn, khép vây và ăn hết tất cả. Chơi Rek là trò cho quân lính, giống Chatrang.”

Digital reproduction:

https://phkaslapartner.com/learn/khmerwords-7764/

Provenance đã corroborate:

- Buddhist Institute;
- 5th edition;
- 1967–1968;
- 2 volumes;
- vol.2 (`យ-អ`) 1968 chứa alphabetic range của `រែក`.

**CONFIRMED:** Rek identity, two-sided Rek capture principle, trapping/encirclement concept.  
**UNSUPPORTED bởi entry này:** exact setup, exact movement distance, exact Poat algorithm, Hao Rek, draw rules.  
**Exact scan page:** chưa khóa; không bịa page number.

### S2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

- https://eric.ed.gov/?id=ED334342
- https://library.khmerstudies.org/bib/14710

Section `V. REK` support:

- board 8×8;
- mỗi bên 1 King + 15 soldiers;
- mỗi lượt đi 1 quân;
- mục tiêu capture opposing King.

Classification: **STRONG EVIDENCE**.

Claim origin khoảng thế kỷ II trong cùng source vẫn **UNVERIFIED** vì thiếu independent corroboration.

### S3 — Buddhist Institute, `ល្បែងប្រជាប្រិយខ្មែរ` (1964)

- https://sala.moeys.gov.kh/kh/library/00002631
- https://library.khmerstudies.org/bib/6505

Official folk-game publication. Secondary lists không có Rek, nhưng compilation được mô tả chỉ thu thập `មួយចំនួនតូច` — một số ít trò. Vì vậy absence trong list **không** chứng minh Rek không truyền thống.

Direct Rek mechanics: **UNSUPPORTED** cho đến khi khóa scan page.

### S4 — `ប្រជុំវប្បធម៌ទូទៅ`, ឡុច ផ្លែង, 1973

Transcription:

https://savenkhknowlege.blogspot.com/2013/07/blog-post_5384.html

Metadata ghi author `ឡុច ផ្លែង`, publisher `វិទ្យាស្ថានជាតិខេមរយានកម្ម`, Phnom Penh, 1973. Danh sách có:

> `... ល្បែងរាវបង្កង, ល្បែងរែក, ល្បែងលាក់កន្សែង ...`

Claim Rek được liệt kê như một trò Khmer: **SECONDARY historical corroboration**. Research đã tìm exact eLibrary Cambodia ebook object/path, nhưng exact scan page vẫn chưa khóa.

### S5 — Sabay Khmer

https://news.sabay.com.kh/article/1045095

Corroborate wording gần Chuon Nath về Rek, two-sided capture và `ទាល់ច្រក`.

Classification: **SECONDARY**.

### S6 — secondary reconstruction

Non-app game-history reconstruction support mạnh cho:

- setup 7 + King + 8;
- regular pieces move trực giao nhiều ô khi đường trống;
- intervention capture;
- surrounding capture concept.

Classification: **STRONG EVIDENCE** ở cấp secondary.

### S7 — Visal Odom / Phnom Penh Post attribution, 2013-11-06

Exact phrases:

> `បើមានគេបើកឲ្យរែក ខ្លួនត្រូវតែរែក`

Literal:

> “Nếu có người mở cho mình Rek, mình phải Rek.”

> `បើមិនរែក ត្រូវតែចាញ់ ដោយស្វ័យប្រវត្តិ`

Literal:

> “Nếu không Rek thì phải thua một cách tự động.”

Claims:

- opponent `បើកឲ្យរែក` tạo nghĩa vụ response: **SECONDARY**;
- responder phải Rek: **SECONDARY**;
- không Rek => automatic loss: **SECONDARY**;
- exact board geometry của “mở”: **UNVERIFIED**.

VOD 2016 có text gần giống và cùng Visal Odom lineage, nên không tính là independent source thứ hai.

---

## 5. Canonical setup phải giữ

Bàn 8×8. Mỗi bên 1 King + 15 Men.

Nhìn từ phía Trắng (`you`):

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

White / `you`:

- King `a2`;
- Men `b1-h1`;
- Men `a3-h3`;
- `a1` empty.

Black / `opp`:

- King `h7`;
- Men `a8-g8`;
- Men `a6-h6`;
- `h8` empty.

Hai bên đối xứng 180°.

Classification: **STRONG EVIDENCE + project canonical lock**.

**Tuyệt đối không quay lại initial setup King d1/d8 cũ.** Custom puzzle positions có thể đặt King ở ô khác nếu đó chỉ là fixture, nhưng không được mô tả chúng như initial setup truyền thống.

---

## 6. Core movement — current canonical model

Regular Rek movement:

- trượt theo 4 hướng trực giao;
- nhiều ô nếu đường trống;
- không đi chéo;
- không nhảy qua blocker;
- destination phải trống;
- không capture bằng cách đáp lên occupied square.

Classification: **STRONG EVIDENCE** ở cấp secondary reconstruction + regression-stable project contract.

---

## 7. Rek capture

Sau khi quân đi vào landing square `T`, nếu hai ô kề đối diện cùng trục đều là quân địch thì cặp đó bị bắt:

```text
enemy | T | enemy
```

hoặc theo trục dọc.

- two-sided pair capture: **CONFIRMED**;
- cả hai trục cùng đúng => engine hiện union và bắt 4: **ENGINE INTERPRETATION / UNVERIFIED**.

Không gọi “Rek-4” là historical canonical rule cho tới khi có source đủ mạnh.

---

## 8. Poat / trapping

Native evidence xác nhận concept khi một bên `ទាល់ច្រក` có thể bị bên kia `កៀរក្រសោបស៊ីបានទាំងអស់`.

Current engine diễn giải Poat thành:

1. BFS connected group cùng màu qua 4 hướng;
2. tính adjacent empty orthogonal liberties;
3. group có zero liberties bị bắt.

Evidence status:

- trapping/encirclement capture concept: **CONFIRMED**;
- connected-component + zero-liberties exact algorithm: **ENGINE INTERPRETATION**;
- edge treatment theo current BFS: **ENGINE INTERPRETATION**;
- Rek resolve trước Poat: **ENGINE INTERPRETATION**.

---

## 9. `REK_STANDARD`

Canonical default ruleset của project:

- canonical setup ở mục 5;
- regular orthogonal movement;
- King đi theo movement core;
- Rek opportunity không suppress quiet move;
- Poat chạy theo current engine interpretation;
- capture King decisive.

`REK_STANDARD` là technical canonical name, **không phải tuyên bố một traditional variant tên “Rek Poat” đã được lịch sử xác nhận**.

`REK_POAT` chỉ là legacy input alias:

```text
REK_POAT -> REK_STANDARD
```

Snapshot mới không emit `REK_POAT`.

---

## 10. `MIN_REK_CHANH` / Hao Rek

### 10.1. Evidence mới support basic obligation semantics

S7 cho **SECONDARY** evidence:

```text
opponent បើកឲ្យរែក
→ responder ត្រូវតែរែក
→ if not Rek => automatic loss
```

Điểm quan trọng: wording được mô tả theo **previous/opponent action** — “mở cho Rek” — chứ không theo câu “board hiện có bất kỳ Rek opportunity nào”.

### 10.2. Current engine contract

Engine hiện làm:

```text
nếu side-to-move có bất kỳ Rek opportunity nào trên current board
→ chỉ moves tạo Rek được expose legal
→ submit quiet geometric move
→ immediate forfeit
```

Classification:

- global trigger: **ENGINE INTERPRETATION / UNVERIFIED**;
- consequence “không Rek => thua”: có **SECONDARY** support, nhưng current engine có thể đang áp consequence đúng vào trigger quá rộng;
- King stationary trong Min: **STRONG EVIDENCE** secondary, native confirmation còn thiếu;
- Poat trong Min: **UNVERIFIED**.

### 10.3. Candidate historical model hiện được support hơn

```text
opponent move/action
→ បើកឲ្យរែក
→ active obligation
→ responder must Rek
→ if not -> loss
```

Candidate này có **SECONDARY** support về basic event/obligation semantics, nhưng exact trigger geometry vẫn **UNVERIFIED**.

### 10.4. Những gì chưa được promote

Community signal 2025 mô tả:

```text
blocking piece
→ moves away
→ newly exposed Rek pair
→ call
```

và nói pre-existing pair không tự call; nhiều pair có thể cho responder chọn.

Tất cả các chi tiết geometry/choice này vẫn **COMMUNITY SIGNAL / UNVERIFIED**. Chưa sửa SPEC/engine.

---

## 11. Open rule questions

1. Hao Rek chỉ phát sinh từ move/action của opponent hay không?
2. `បើកឲ្យរែក` exact geometry là gì?
3. Có cần newly exposed pair?
4. Pair đã mở từ trước có tạo obligation không?
5. Multiple pairs: responder chọn hay caller chọn?
6. Có cần verbal `រែក!` / `ហៅរែក`?
7. Ignore call là illegal move hay legal move + instant loss?
8. Obligation sống đúng 1 ply hay theo chain?
9. King stationary trong Min có tuyệt đối không?
10. Poat có áp dụng trong Min không?
11. Zero legal moves là terminal riêng hay chỉ manifestation của trapping?
12. `រែកហែក` quan hệ gì với `មិនរែកចាញ់` / `ហៅរែក`?
13. Chain Hao Rek kết thúc khi nào?

---

## 12. Kambuja Suriya / archival boundary

Được phép kết luận hẹp:

> **The 1926–1974 Kambuja Suriya alphabetical index contains no indexed article/title named `ល្បែងរែក`.**

Classification: **CONFIRMED ABOUT INDEX ONLY**.

Không được kết luận Kambuja Suriya không có Rek. Target tiếp theo: body `ល្បែងចត្រង្គ`, `ល្បែងផ្សេងៗ`, customs/culture headings.

Research đã khóa năm 1964 = `ឆ្នាំទី៣៦`, có 6 issues và có pointer `1964.pdf`, nhưng host hiện 502 nên chưa kiểm body.

---

## 13. Engine interpretations / extensions còn chờ research

| Vấn đề | Current engine | Evidence status |
|---|---|---|
| Dual-axis Rek | bắt 4 | **ENGINE INTERPRETATION / UNVERIFIED** |
| Poat exact semantics | connected group + 0 liberties | **ENGINE INTERPRETATION** |
| Rek/Poat timing | Rek trước Poat | **ENGINE INTERPRETATION** |
| Min compulsory trigger | bất kỳ Rek nào trên board | **ENGINE INTERPRETATION / UNVERIFIED; challenged by S7** |
| Min violation | immediate loss | **SECONDARY consequence support; exact trigger unresolved** |
| King stationary trong Min | yes | **STRONG EVIDENCE secondary; native confirmation thiếu** |
| Poat trong Min | yes | **UNVERIFIED** |
| Zero-move terminal | instant win | **UNVERIFIED** |
| Threefold repetition | draw | **UNSUPPORTED traditional claim / project extension** |
| Lone-King 32 | draw | **UNSUPPORTED traditional claim / project extension** |

---

## 14. Không phải ruleset

```text
MatchType
├── LOCAL
├── VS_AI
├── ONLINE
└── AI_VS_AI

AiDifficulty
├── easy
├── medium
└── hard
```

Core engine chỉ cần board, turn, state, ruleset và — nếu future evidence xác nhận event-trigger Hao Rek — explicit call context do engine sở hữu.

---

## 14.1. Media evidence update — reconstructed Hao Rek events

User-supplied real-board footage `1000009344.mp4` đã cho nhiều event reconstruct được:

- ~89–97s: một Red blocker rời ô giữa pair; Blue đã có một Rek cũ ở nơi khác nhưng đáp đúng **Rek mới vừa được mở** và capture hai Red;
- ~186.5–194s: quiet opener tạo Rek mới → response capture 2 → response lại tạo counter-Rek → counter-response → hết new call thì chain dừng;
- ~550.5–563s: opponent **đi vào** vị trí mới để tạo pair quanh một gap; responder vào gap và Rek 2 quân;
- ~1027–1041s: thêm một quiet opener → exactly one new Rek → immediate Rek response.

Claim-level status:

| Claim | Evidence label |
|---|---|
| Hao Rek gắn với opponent action / transition | `STRONG EVIDENCE` |
| New Rek opportunity được tạo bởi move là candidate trigger | `STRONG EVIDENCE candidate` |
| Blocker-leaves có thể tạo call | `STRONG EVIDENCE candidate` |
| Mover-enters-to-create-pair cũng có thể tạo call | `STRONG EVIDENCE candidate` |
| Pre-existing Rek không tự động là target của call mới | `STRONG EVIDENCE candidate` |
| Hao response có thể chain | `STRONG EVIDENCE candidate` + `SECONDARY` textual support |
| Chain dừng khi đối phương ngừng mở Rek mới | `STRONG EVIDENCE candidate` + `SECONDARY` textual support |
| Multiple NEW targets choice rule | `UNVERIFIED` |
| Verbal call bắt buộc | `UNVERIFIED` |
| Không đáp => automatic loss | `SECONDARY` |

### Proposed historical interpretation — NOT IMPLEMENTED

Model hiện phù hợp evidence nhất:

```text
BEFORE = responder Rek opportunities before opponent move
opponent makes move
AFTER = responder Rek opportunities after opponent move
NEW = AFTER - BEFORE

NEW non-empty
→ active Hao Rek call
→ responder must answer newly-created Rek response(s)
→ response may create NEW responses for other side
→ continue chain
→ stop when no new call is created
```

Điểm này **challenge trực tiếp** current engine interpretation `ANY current-board Rek → compulsory`.

Tuy nhiên chưa sửa engine vì chưa khóa multiple-new-target choice, verbal declaration requirement và interaction với Poat/multi-axis.

---

## 15. Promote workflow

Không nhảy thẳng từ research vào code:

```text
new evidence
    ↓
RESEARCH_HAO / RESEARCH_LUAT
    ↓
HUONG_DAN confidence update
    ↓
SPEC technical contract update
    ↓
new failing regression fixture
    ↓
core engine
    ↓
session/snapshot migration nếu cần
    ↓
AI/tournament consume core behavior
```

Research pass 2026-09-06 **không đủ exact geometry để đổi gameplay**. Current Min behavior phải tiếp tục được ghi là current project interpretation pending historical validation.