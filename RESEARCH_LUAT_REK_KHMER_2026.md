# RESEARCH LUẬT REK KHMER — Evidence Matrix 2026

> **Ngày rà soát:** 2026-09-06  
> **Mục đích:** tách historical/cultural rule evidence khỏi engine implementation và ghi rõ confidence theo từng claim.  
> **Không phải SPEC:** tài liệu này không tự động thay đổi gameplay.

---

## 1. Evidence labels canonical

| Label | Ý nghĩa |
|---|---|
| `CONFIRMED` | Nguồn Khmer/institutional mạnh xác nhận trực tiếp claim. |
| `STRONG EVIDENCE` | Bằng chứng độc lập phù hợp, nhưng chưa khóa mọi edge case. |
| `SECONDARY` | Corroboration hữu ích từ nguồn độc lập, không phải authoritative rule text. |
| `ENGINE INTERPRETATION` | Cách project hiện thực hóa nguyên lý chưa có mô tả lịch sử đủ chi tiết. |
| `COMMUNITY SIGNAL` | Comment/forum/oral recollection dùng tạo hypothesis, keyword, fixture. |
| `UNVERIFIED` | Có dấu hiệu/implementation nhưng chưa đủ evidence. |
| `UNSUPPORTED` | Chưa tìm thấy Rek-specific evidence. |
| `REJECTED AS POSITIVE EVIDENCE` | App-store developer text, tutorial/screenshot/app behavior và scraper của chúng. |

Không gộp label. Label theo **claim**, không theo toàn source.

---

## 2. Source policy

### Tier A — native / institutional / archival

Ưu tiên:

1. Buddhist Institute;
2. Chuon Nath Dictionary bản gốc/scan;
3. Center for Khmer Studies;
4. MoEYS Cambodia;
5. Ministry of Culture / Khmer archival sources;
6. `កម្ពុជសុរិយា`;
7. sách/scan Khmer cũ.

### Tier B — independent cultural / educational

Ví dụ: tài liệu văn hóa, giáo dục, academic source độc lập với app/game implementation.

### Tier C — secondary reconstruction

Game-history/board-game research có thể corroborate setup/movement/capture, nhưng không được nâng ngang native rule text.

### Tier D — community signal

Comment/review/forum/oral anecdote chưa xác minh. Dùng để phát hiện edge case, keyword và dựng board fixtures.

### Excluded

`REJECTED AS POSITIVE EVIDENCE`:

- Google Play / Apple App Store developer descriptions;
- app tutorial/screenshot;
- app behavior;
- website scrape/copy store description.

User comment dưới app vẫn có thể ghi riêng là `COMMUNITY SIGNAL`.

---

## 3. Source registry

### S1 — Chuon Nath / Buddhist Institute dictionary tradition

Exact Khmer reproduction của entry `រែក`:

> `រែក (ន.) ឈ្មោះល្បែងមួយប្រភេទ ស្រដៀងនឹងចត្រង្គ ខុសគ្នាតែឈ្មោះកូន និងការឈ្នះចាញ់, មានបែបឲ្យស៊ីរែកទាំងពីរខាង ឬបើអ្នកម្ខាងទាល់ច្រក ត្រូវអ្នកម្ខាងកៀរក្រសោបស៊ីបានទាំងអស់ : លេងរែក (ជាល្បែងសម្រាប់ពួកទាហានដូច ចត្រង្គ ដែរ) ។`

Literal VN gần nhất:

> “Rek: tên một loại trò chơi, tương tự Chatrang nhưng khác ở tên quân và cách thắng thua; có lối ăn Rek ở cả hai phía; hoặc nếu một bên bị dồn/bế tắc thì bên kia có thể dồn, khép vây và ăn hết tất cả. Chơi Rek là trò cho quân lính, giống Chatrang.”

Digital reproduction currently accessible:

https://phkaslapartner.com/learn/khmerwords-7764/

Edition provenance corroborated:

- Buddhist Institute;
- 5th edition;
- 1967–1968;
- 2 volumes;
- vol.2 (`យ-អ`) 1968 contains alphabetic range of `រែក`.

Claims:

- Rek identity: `CONFIRMED`;
- `ស៊ីរែកទាំងពីរខាង`: `CONFIRMED` two-sided/intervention capture principle;
- `ទាល់ច្រក` + `កៀរក្រសោបស៊ីបានទាំងអស់`: `CONFIRMED` trapping/encirclement concept;
- exact BFS/liberties algorithm: `UNSUPPORTED` by dictionary;
- exact Hao Rek: `UNSUPPORTED` by dictionary;
- exact scan page for `រែក`: unresolved; **không bịa page number**.

---

### S2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

ERIC:

https://eric.ed.gov/?id=ED334342

CKS catalog:

https://library.khmerstudies.org/bib/14710

Section `V. REK`, page 48 supports:

- board 8×8;
- 1 King + 15 soldiers mỗi bên;
- one piece per turn;
- objective capture opposing King.

Classification: `STRONG EVIDENCE`.

Claim game bắt đầu khoảng thế kỷ II: `UNVERIFIED` single-source historical claim.

---

### S3 — Buddhist Institute, `ល្បែងប្រជាប្រិយខ្មែរ` (1964)

MoEYS:

https://sala.moeys.gov.kh/kh/library/00002631

CKS:

https://library.khmerstudies.org/bib/6505

Đây là official folk-game publication. Secondary lists không có Rek, nhưng research đã xác nhận compilation chỉ thu thập `មួយចំនួនតូច` — một số ít trò.

Kết luận:

- provenance/context: `CONFIRMED`;
- absence khỏi secondary list **không** chứng minh Rek không truyền thống;
- direct Rek mechanics: `UNSUPPORTED` cho tới khi khóa page scan.

---

### S4 — `ប្រជុំវប្បធម៌ទូទៅ`, ឡុច ផ្លែង, 1973

Transcription:

https://savenkhknowlege.blogspot.com/2013/07/blog-post_5384.html

Metadata transcription:

- author `ឡុច ផ្លែង`;
- publisher `វិទ្យាស្ថានជាតិខេមរយានកម្ម`;
- Phnom Penh;
- 1973.

Danh sách có:

> `... ល្បែងរាវបង្កង, ល្បែងរែក, ល្បែងលាក់កន្សែង ...`

Claim Rek được liệt kê như một trò Khmer: `SECONDARY` historical corroboration.

Research 2026-09-06 đã tìm được exact eLibrary Cambodia ebook object/path nhưng chưa lấy được stable page image/PDF asset.

- exact page: unresolved;
- rule detail: `UNSUPPORTED`.

---

### S5 — Sabay Khmer article

https://news.sabay.com.kh/article/1045095

Corroborate wording gần Chuon Nath về Rek, two-sided capture và `ទាល់ច្រក`.

Classification: `SECONDARY` Khmer corroboration.

---

### S6 — independent secondary reconstruction

Non-app game-history reconstruction hỗ trợ:

- setup 7 + King + 8;
- regular pieces move orthogonally any unobstructed distance;
- intervention capture;
- surrounding capture concept.

Classification: `STRONG EVIDENCE` cho setup/movement ở cấp secondary, không thay native source.

---

### S7 — Visal Odom / Phnom Penh Post attribution, 2013-11-06

Bài Khmer ghi tác giả `វិសាល ឧត្តម / Visal Odom`, attribution `ភ្នំពេញប៉ុស្តិ៍ / Phnom Penh Post`.

Exact phrases:

> `បើមានគេបើកឲ្យរែក ខ្លួនត្រូវតែរែក`

Literal:

> “Nếu có người mở cho mình Rek, mình phải Rek.”

> `បើមិនរែក ត្រូវតែចាញ់ ដោយស្វ័យប្រវត្តិ`

Literal:

> “Nếu không Rek thì phải thua một cách tự động.”

Claim classification:

- `បើកឲ្យរែក` là action của opponent tạo nghĩa vụ response: `SECONDARY`;
- responder phải Rek: `SECONDARY`;
- không Rek => automatic loss: `SECONDARY`;
- exact geometry của “mở”: `UNVERIFIED`;
- piece-count claim khác trong bài không được dùng nếu mâu thuẫn nguồn mạnh hơn.

VOD 2016 có text gần giống và cùng Visal Odom lineage; không tính là independent second source.

---

## 4. Kambuja Suriya research

CKS corroborate hai index:

1. `កម្រងមាតិកា កម្ពុជសុរិយា (១៩២៦–២០០០)` — khoảng 331 trang.
2. `កម្ពុជសុរិយា (១៩២៦–១៩៧៤): មាតិកា និងអក្ខរក្រម` — catalog khoảng 575 trang; searchable scan khoảng 599 scan pages.

Claim được phép:

> **The 1926–1974 Kambuja Suriya alphabetical index contains no indexed article/title named `ល្បែងរែក`.**

Classification: `CONFIRMED ABOUT INDEX ONLY`.

Không được kết luận “Kambuja Suriya không có Rek”, vì Rek có thể nằm trong body bài khác, `ល្បែងផ្សេងៗ`, `ល្បែងចត្រង្គ`, customs/culture headings hoặc title không chứa `រែក`.

Corpus Buddhist Institute cho thấy magazine có article riêng về folk game, ví dụ:

- `ល្បែងអៀវ`;
- năm 1961;
- tác giả `ញូង សឿង`.

Research 2026-09-06 còn khóa:

- 1964 = `ឆ្នាំទី៣៦`;
- có 6 issues;
- đã tìm pointer `1964.pdf`;
- host hiện trả 502 nên chưa kiểm body `ល្បែងចត្រង្គ` / `ល្បែងផ្សេងៗ`.

Status body mention Rek: `UNVERIFIED`.

---

## 5. Community comparison — không phải source of truth

### CS1 — user comment 2025-02-16

Candidate Hao Rek semantics:

- pre-existing open pair không tự tạo call;
- blocking/covering piece moves away;
- newly exposed pair tạo call;
- nhiều pair có thể cho responder chọn;
- một called pair thì pair đó bắt buộc.

Classification: `COMMUNITY SIGNAL — DETAILED`.

### CS2 — user comment 2026-06-08

Nói `ក្បួនហៅរែក` trong app implement sai.

Classification: `COMMUNITY SIGNAL — IMPLEMENTATION DISPUTED`.

### CS3 — community wording khoảng 2013

> `ហៅ រែកចាញ់ រឺ បើករែក ... បើ A បើកអោយរែក B មិនរែក នេាះ B នឹងចាញ់។`

Classification: `COMMUNITY SIGNAL`.

Support nhẹ cho action/event wording và terminology `រែកចាញ់ / បើករែក`; không support exact geometry.

### CS4 — recollection khoảng 2010

First-person memory về `មួយអម្រែកចាញ់ / បើមិនរែកចាញ់` và `បើកអោយគេរែក` nhiều lần trước khi Rek trúng King.

Classification: `COMMUNITY SIGNAL`.

Cho thấy terminology/cultural memory predate modern app lineage, nhưng không đủ technical precision.

---

## 6. Rule evidence matrix

| Rule / behavior | Status 2026-09-06 | Evidence basis | Engine action |
|---|---|---|---|
| Rek là trò Khmer | `CONFIRMED` | S1 + S2 + S4/S5 | Giữ |
| Board 8×8 | `STRONG EVIDENCE` | S2 | Giữ |
| 1 King + 15 Men mỗi bên | `STRONG EVIDENCE` | S2 | Giữ |
| Mỗi lượt đi một quân | `STRONG EVIDENCE` | S2 | Giữ |
| Mục tiêu capture King | `STRONG EVIDENCE` | S2 | Giữ |
| Setup 7 + King + 8, project orientation a2/h7 | `STRONG EVIDENCE` + project lock | S6 + regression | Giữ |
| Regular movement trực giao nhiều ô, không jump | `STRONG EVIDENCE` secondary | S6 | Giữ |
| Rek bắt cặp hai phía | `CONFIRMED` | S1 | Giữ |
| Dual-axis Rek => bắt 4 | `ENGINE INTERPRETATION / UNVERIFIED` | code geometry | Giữ implementation, không quảng bá historical truth |
| Có capture khi bị bí/bao | `CONFIRMED` concept | S1 + S5 | Giữ concept |
| Poat = connected group + zero orthogonal liberties | `ENGINE INTERPRETATION` | code + secondary reconstruction | Giữ implementation, research exact semantics |
| Rek resolve trước Poat | `ENGINE INTERPRETATION` | current pipeline | Giữ implementation |
| `MIN_REK_CHANH` / “không Rek thì thua” concept | `SECONDARY` + community corroboration | S7 + CS3/CS4 | Giữ variant label |
| `បើកឲ្យរែក` => responder phải Rek | `SECONDARY` | S7 | Ghi vào docs, chưa code trigger |
| Không Rek sau call => automatic loss | `SECONDARY` | S7 | Current consequence có support; exact trigger chưa khóa |
| Board có bất kỳ Rek => compulsory globally | `ENGINE INTERPRETATION / UNVERIFIED` | current engine only; evidence mới challenge | Không đổi code chưa đủ geometry |
| Hao Rek triggered bởi previous/opponent action | `SECONDARY` candidate historical model | S7 | Research tiếp, chưa code |
| Blocking piece moves away -> newly exposed pair | `COMMUNITY SIGNAL / UNVERIFIED` | CS1 | Không code |
| Pre-existing open pair không call | `COMMUNITY SIGNAL / UNVERIFIED` | CS1 | Không code |
| Multiple pairs => responder chọn | `COMMUNITY SIGNAL / UNVERIFIED` | CS1 | Không code |
| King stationary trong Min | `STRONG EVIDENCE` secondary, native confirmation thiếu | reconstruction | Giữ current contract |
| Poat áp dụng trong Min | `UNVERIFIED` | current engine only | Không gọi traditional truth |
| Zero legal moves => instant win | `UNVERIFIED` | current engine; có nguy cơ conflation với `ទាល់ច្រក` | Audit/research |
| Threefold repetition | `UNSUPPORTED` traditional claim | project extension | Giữ technical extension |
| Lone King draw 32 | `UNSUPPORTED` traditional claim | project extension | Giữ technical extension |

---

## 7. Stable project contract để UI/server có thể dựa vào

Ở cấp **project contract**, UI/server có thể dựa vào:

1. board 8×8;
2. 16 quân/bên;
3. canonical initial setup a2/h7;
4. `REK_STANDARD` và `MIN_REK_CHANH` là hai canonical rulesets;
5. `REK_POAT` chỉ là legacy compatibility alias → `REK_STANDARD`;
6. movement/Rek/Poat legality do core engine sở hữu;
7. capture King là decisive terminal theo current contract;
8. AI không được duplicate rule logic.

UI phải hiển thị Min Rek Chanh là variant có **exact Hao Rek semantics pending historical validation**.

---

## 8. Không được gọi là “luật Khmer chuẩn” lúc này

Không dùng wording `canonical traditional / 100% historical` cho:

- board-global compulsory Rek;
- newly-exposed-pair geometry;
- dual-axis Rek = 4;
- exact Rek→Poat order;
- BFS zero-liberties Poat;
- Poat trong Min;
- zero-move instant win;
- threefold;
- lone-King 32;
- century-II origin claim.

---

## 9. Research gaps ưu tiên

### G1 — exact Hao Rek geometry

Cần nguồn Khmer độc lập xác nhận:

```text
previous board
→ opponent move/action
→ what exactly counts as បើកឲ្យរែក
→ response set
→ violation consequence
```

### G2 — Kambuja Suriya 1964 body

Ưu tiên `ល្បែងចត្រង្គ`, `ល្បែងផ្សេងៗ`, `ល្បែង`, `ទំនៀមទម្លាប់`, `ប្រពៃណី`, `វប្បធម៌`, `កីឡា`.

### G3 — 1973 original scan

Lấy exact page `ល្បែងរែក`, xác định chỉ listing hay có rule section.

### G4 — Chuon Nath exact scan page

Khóa original vol.2 scan page chứa entry `រែក`. Không nội suy page từ alphabetical order.

### G5 — real-board video

Chỉ dùng event có thể record:

- source/date/timecode;
- position;
- move before;
- pair before/after;
- response;
- quiet alternative;
- verbal terminology;
- capture result;
- confidence.

### G6 — terminology

Tiếp tục exact search `រែកហែក`, `រែកព័ទ្ធ`, `មិនរែកចាញ់`, `រែកចាញ់`, `ហៅរែក`, `បើកឲ្យរែក`, `មួយអម្រែកចាញ់`.

---

## 10. Change-control gate

Khi evidence đủ mạnh:

1. update research note + source metadata;
2. update `HUONG_DAN_LUAT_CO_REK_KHMER.md` confidence;
3. update `SPEC_ENGINE_CO_REK_KHMER.md` nếu exact behavior đã đủ rõ;
4. viết board regression trước;
5. sửa core engine;
6. session/snapshot migration nếu cần stateful Hao Rek context;
7. AI chỉ consume new engine legality;
8. tournament + replay regression;
9. merge khi CI xanh.

---

## 11. Kết luận 2026-09-06

Core Rek có evidence tốt cho identity, 8×8, 1 King + 15 Men, one-piece-per-turn, capture-King objective, two-sided Rek và trapping/encirclement concept. Setup/movement hiện có secondary support mạnh.

Finding mới quan trọng nhất là S7: wording `បើកឲ្យរែក → ត្រូវតែរែក → មិនរែក = ចាញ់ដោយស្វ័យប្រវត្តិ` tạo **SECONDARY evidence trực tiếp** rằng Hao Rek được mô tả như nghĩa vụ phát sinh từ action của opponent.

Điều này làm current **board-global compulsory scan** yếu hơn về mặt historical model. Tuy nhiên exact geometry của `បើកឲ្យរែក` vẫn chưa chứng minh; vì vậy **không thay SPEC gameplay/engine semantics trong pass này**.