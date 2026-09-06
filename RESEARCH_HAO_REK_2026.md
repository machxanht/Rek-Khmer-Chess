# RESEARCH NOTE: ហៅរែក (Hao Rek) / Min Rek Chanh — 2026

> **Ngày rà soát:** 2026-09-06  
> **Trạng thái:** `PARTIALLY RESOLVED — EVENT-TRIGGERED HAO REK STRONGLY SUPPORTED; MULTI-TARGET / VERBAL EDGE CASES UNRESOLVED`  
> **Scope:** exact trigger, geometry và nghĩa vụ phản hồi của **Hao Rek (ហៅរែក)** trong variant `MIN_REK_CHANH`.

Tài liệu này là **research note**, không phải rule specification. Nó không thay thế:

1. `HUONG_DAN_LUAT_CO_REK_KHMER.md`
2. `SPEC_ENGINE_CO_REK_KHMER.md`
3. regression tests của engine

Mục tiêu là lưu evidence theo từng claim, giữ community/app signals tách khỏi archival/cultural evidence, và chỉ ra chính xác phần nào của current engine đang là giả định kỹ thuật.

---

## 1. Evidence labels bắt buộc

| Label | Nghĩa |
|---|---|
| `CONFIRMED` | Nguồn Khmer/institutional mạnh xác nhận trực tiếp claim. |
| `STRONG EVIDENCE` | Nhiều bằng chứng độc lập phù hợp nhưng chưa khóa mọi edge case. |
| `SECONDARY` | Nguồn độc lập hữu ích nhưng không phải authoritative rule text. |
| `ENGINE INTERPRETATION` | Cách project hiện thực hóa một nguyên lý chưa được nguồn lịch sử mô tả đủ chi tiết. |
| `COMMUNITY SIGNAL` | Comment/forum/oral recollection dùng để tạo hypothesis và keyword, không tự khóa SPEC. |
| `UNVERIFIED` | Claim có dấu hiệu hoặc đang tồn tại trong project nhưng chưa đủ evidence. |
| `UNSUPPORTED` | Chưa tìm thấy Rek-specific evidence cho claim. |
| `REJECTED AS POSITIVE EVIDENCE` | App-store developer text, app tutorial/behavior/screenshot, hoặc scrape/copy của chúng. |

**Label theo từng claim, không label cả source một cục.** Một source có thể có một claim `SECONDARY` nhưng claim khác `UNSUPPORTED` hoặc mâu thuẫn nguồn mạnh hơn.

---

## 2. Source policy

### 2.1. Ưu tiên

1. Buddhist Institute.
2. Chuon Nath Dictionary bản gốc/scan.
3. Center for Khmer Studies.
4. MoEYS Cambodia.
5. Ministry of Culture / Khmer archival sources.
6. `កម្ពុជសុរិយា`.
7. sách/scan Khmer cũ.
8. academic/cultural source độc lập.
9. video người Khmer chơi bàn thật nếu reconstruct được position + move sequence.

### 2.2. REJECTED AS POSITIVE EVIDENCE

Không dùng để chứng minh luật:

- Google Play / Apple App Store developer descriptions;
- app tutorial/screenshot;
- behavior implementation của app;
- website scrape/copy app-store description;
- game app hiện tại làm source of truth.

### 2.3. COMMUNITY SIGNAL

User comment/review dưới app được đọc để:

- phát hiện edge case;
- lấy keyword Khmer;
- dựng hypothesis;
- tìm lỗi implementation;
- tìm source độc lập.

Nhưng không được dùng một mình để:

- nâng claim lên `CONFIRMED`;
- sửa `HUONG_DAN`/`SPEC`;
- sửa engine;
- gọi là historical evidence.

---

## 3. Current engine đang làm gì?

`MIN_REK_CHANH` hiện dùng **transition-owned Hao Rek context**:

```text
before opponent move -> responder Rek set BEFORE
opponent move
after opponent move  -> responder Rek set AFTER
NEW = AFTER - BEFORE
   ├── empty -> no Hao obligation
   └── non-empty -> active Hao context with engine-owned allowedResponses
                    ignore active response -> immediate forfeit
```

Ngoài ra current engine giữ King đứng yên trong `MIN_REK_CHANH`.

Classification:

- transition-owned newly-created-response trigger: `IMPLEMENTED TECHNICAL POLICY`, supported by `STRONG EVIDENCE` for event-triggered Hao;
- ignore active Hao => instant loss: `IMPLEMENTED TECHNICAL POLICY`, with `SECONDARY` support for the consequence “không Rek thì thua”;
- King stationary: `STRONG EVIDENCE` ở secondary reconstruction, chưa native-confirmed;
- Poat trong Min: `UNVERIFIED`.

---

## 4. Core sources không giải exact Hao Rek

### A1 — Chuon Nath / Buddhist Institute dictionary tradition

Exact Khmer reproduction của entry `រែក`:

> `រែក (ន.) ឈ្មោះល្បែងមួយប្រភេទ ស្រដៀងនឹងចត្រង្គ ខុសគ្នាតែឈ្មោះកូន និងការឈ្នះចាញ់, មានបែបឲ្យស៊ីរែកទាំងពីរខាង ឬបើអ្នកម្ខាងទាល់ច្រក ត្រូវអ្នកម្ខាងកៀរក្រសោបស៊ីបានទាំងអស់ : លេងរែក (ជាល្បែងសម្រាប់ពួកទាហានដូច ចត្រង្គ ដែរ) ។`

Literal VN gần nhất:

> “Rek: tên một loại trò chơi, tương tự Chatrang nhưng khác ở tên quân và cách thắng thua; có lối ăn Rek ở cả hai phía; hoặc nếu một bên bị dồn/bế tắc thì bên kia có thể dồn, khép vây và ăn hết tất cả. Chơi Rek là trò cho quân lính, giống Chatrang.”

Provenance đã corroborate:

- Buddhist Institute;
- 5th edition;
- 1967–1968;
- 2 volumes;
- vol.2 (`យ-អ`) xuất bản 1968 chứa alphabetic range của `រែក`.

Claims:

- Rek identity + two-sided capture + trapping/encirclement: `CONFIRMED`.
- exact Hao Rek trigger: `UNSUPPORTED` bởi entry này.
- exact scan page của `រែក`: **chưa khóa; không được bịa page number**.

### A2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

Section `V. REK` support:

- board 8×8;
- 1 King + 15 soldiers mỗi bên;
- 1 piece per turn;
- objective = capture opposing King.

Claims trên: `STRONG EVIDENCE`.

Claim Rek bắt đầu khoảng thế kỷ II trong cùng source là single-source historical claim: `UNVERIFIED`.

Không có exact Hao Rek trigger trong phần đã truy xuất.

### A3 — Buddhist Institute, `ល្បែងប្រជាប្រិយខ្មែរ` (1964)

Đây là official folk-game publication nhưng research sau xác nhận compilation chỉ thu thập `មួយចំនួនតូច` — “một số ít” trò. Danh sách secondary được trích lại không có Rek.

Kết luận hẹp:

- publication/provenance: `CONFIRMED`;
- absence khỏi một danh sách secondary: không được dùng để kết luận Rek không truyền thống;
- direct Rek/Hao Rek rule evidence: `UNSUPPORTED` cho đến khi khóa original page.

### A4 — `ប្រជុំវប្បធម៌ទូទៅ`, ឡុច ផ្លែង, 1973

Metadata transcription đã corroborate:

- author: `ឡុច ផ្លែង`;
- publisher: `វិទ្យាស្ថានជាតិខេមរយានកម្ម`;
- Phnom Penh;
- 1973.

Danh sách trò có:

> `... ល្បែងរាវបង្កង, ល្បែងរែក, ល្បែងលាក់កន្សែង ...`

Claim “Rek được liệt kê như một trò Khmer trong compilation 1973”: `SECONDARY` historical corroboration.

Research 2026-09-06 đã tìm được **exact eLibrary Cambodia ebook object/path**, nhưng viewer không lộ asset scan/PDF ổn định qua current access. Vì vậy:

- original scan object lead: có;
- exact page chứa `ល្បែងរែក`: **chưa khóa**;
- rule detail: `UNSUPPORTED`.

---

## 5. Nguồn quan trọng nhất về nghĩa vụ Hao Rek

### H1 — Visal Odom / Phnom Penh Post attribution, 2013-11-06

Một bài Khmer ngày **6 November 2013**, ghi tác giả `វិសាល ឧត្តម / Visal Odom` và attribution `ភ្នំពេញប៉ុស្តិ៍ / Phnom Penh Post`, dùng luật Rek để giải thích trước một bài bình luận.

Exact phrases quan trọng:

> `បើមានគេបើកឲ្យរែក ខ្លួនត្រូវតែរែក`

Literal VN:

> “Nếu có người mở cho mình Rek, mình phải Rek.”

Và:

> `បើមិនរែក ត្រូវតែចាញ់ ដោយស្វ័យប្រវត្តិ`

Literal VN:

> “Nếu không Rek thì phải thua một cách tự động.”

Bài còn mô tả chuỗi ý:

```text
opponent បើកឲ្យរែក
→ responder ត្រូវតែរែក
→ nếu không Rek => automatic loss
→ opponent có thể tiếp tục mở cho Rek
→ chain tiếp tục cho tới khi opponent ngừng mở cho Rek
```

Claim classification:

| Claim | Label |
|---|---|
| Có concept “opponent mở cho mình Rek” | `SECONDARY` |
| Responder phải Rek sau khi được “mở cho Rek” | `SECONDARY` |
| Không Rek => automatic loss | `SECONDARY` |
| Obligation được mô tả bằng previous/opponent action, không phải chỉ board-global state | `SECONDARY` challenge đối với current engine model |
| Exact board geometry của `បើកឲ្យរែក` | `UNVERIFIED` |

Lý do không nâng toàn bài lên strong/confirmed: bài có claim piece-count không đáng tin/mâu thuẫn nguồn mạnh hơn. Label áp dụng theo từng claim.

### Independence caveat — VOD 2016

VOD Khmer năm 2016 có text gần giống và cũng liên quan Visal Odom. Không tính 2013 + 2016 là hai independent sources; khả năng republication/reuse cao.

---

## 6. Community signals độc lập-ish / pre-app lineage

### C1 — Khmer user comment, 2025-02-16

Comment mô tả candidate geometry:

1. pair Rek đã mở sẵn không tự tính là `ហៅ`;
2. có một quân đang chắn/che;
3. quân đó đi ra;
4. lúc đó pair mới được tính là call;
5. nhiều pair thì responder có thể chọn;
6. nếu call chỉ tạo một pair thì pair đó bắt buộc.

Classification: `COMMUNITY SIGNAL — DETAILED, NOT AUTHORITATIVE`.

### C2 — Khmer user comment, 2026-06-08

Phản biện phần `ក្បួនហៅរែក` trong app triển khai sai.

Classification: `COMMUNITY SIGNAL — IMPLEMENTATION DISPUTED`.

### C3 — community wording khoảng 2013

Search pass 2026-09-06 tìm lại wording:

> `ហៅ រែកចាញ់ រឺ បើករែក ... បើ A បើកអោយរែក B មិនរែក នេាះ B នឹងចាញ់។`

Literal gần nhất:

> “Gọi là Rek-chaanh hoặc Bok Rek; nếu A mở cho B Rek mà B không Rek thì B thua.”

Classification: `COMMUNITY SIGNAL`.

Giá trị:

- corroborate terminology `បើករែក / បើកអោយរែក` ngoài đúng text Visal;
- support nhẹ cho action/event wording;
- **không chứng minh geometry**;
- provenance/independence chưa đủ để nâng lên `SECONDARY`.

### C4 — historical online recollection khoảng 2010

Có dấu vết người Khmer kể first-person đã chơi dạng `មួយអម្រែកចាញ់ / បើមិនរែកចាញ់`, kể nhiều lần `បើកអោយគេរែក` rồi cuối chuỗi Rek trúng King.

Classification: `COMMUNITY SIGNAL`.

Nó cho thấy terminology/cultural memory predate app hiện đại, nhưng không đủ rule precision.

---

## 7. Candidate historical model sau research 2026-09-06

Evidence hiện tại support tốt hơn trước cho **event/action-triggered obligation**:

```text
opponent previous move/action
        ↓
បើកឲ្យរែក  (“opens for Rek”)
        ↓
active obligation
        ↓
responder must Rek
        ↓
if not -> loss
```

Classification:

- existence/basic obligation semantics: `SECONDARY` text + reconstructable media support;
- event/action-triggered Hao Rek: `STRONG EVIDENCE`;
- transition predicate based on **new Rek opportunities created by the opponent move**: `STRONG EVIDENCE candidate`;
- blocker-leaves geometry: `STRONG EVIDENCE candidate` from M1-E1;
- mover-enters-to-create-pair geometry: `STRONG EVIDENCE candidate` from M1-E3;
- pre-existing Rek is not automatically the newly-called target: `STRONG EVIDENCE candidate`;
- chain response semantics: `STRONG EVIDENCE candidate` + `SECONDARY` textual support;
- responder/caller choice when one move creates multiple NEW targets: `UNVERIFIED`.

**Current board-global engine interpretation is not supported by any authoritative/secondary source found so far.** Không được gọi nó historical truth.

---

## 8. Exact questions vẫn phải giải

1. Hao Rek phát sinh từ action/move của opponent? **STRONG EVIDENCE: yes, event-triggered.**
2. `បើកឲ្យរែក` exact board geometry? **Partially resolved:** multiple geometries can create a NEW Rek response; do not hard-code only blocker-leaves.
3. Có cần “newly created” Rek opportunity không? **STRONG EVIDENCE candidate.**
4. Pair/Rek đã mở từ trước có tạo obligation mới không? **Evidence nghiêng mạnh về no; vẫn chưa universal-confirmed.**
5. Nếu một move mở nhiều NEW targets, responder chọn hay caller chọn? **UNVERIFIED.**
6. Có cần verbal call `រែក!` / `ហៅរែក` không? **UNVERIFIED.**
7. Ignore call là illegal move hay move hợp lệ nhưng instant loss? **Penalty SECONDARY; engine representation UNVERIFIED.**
8. Obligation sống đúng 1 ply hay kéo dài theo chain? **Chain behavior strongly supported; exact state representation pending.**
9. King trong Min Rek Chanh có hoàn toàn bất động không?
10. Poat có áp dụng trong Min Rek Chanh không?
11. Zero legal moves có phải win riêng hay chỉ là trapping/encirclement concept?
12. `រែកហែក` quan hệ gì với `មិនរែកចាញ់` / `ហៅរែក`?
13. Chain Hao Rek chấm dứt chính xác khi nào?

---

## 9. Terminology pass 2026-09-06

Exact searches:

- `រែកហែក`
- `របៀបលេងរែកហែក`
- `ក្បួនរែកហែក`
- `រែកហែក រែកព័ទ្ធ`
- `មិនរែកចាញ់`
- `ហៅរែក`
- `បើកឲ្យរែក`
- `បើកអោយរែក`
- `ក្បួនហៅរែក`
- `រែកចាញ់`
- `មួយអម្រែកចាញ់`

Result:

- `រែកហែក`: `UNVERIFIED`; chưa có independent archival/cultural source giải thích quan hệ với Hao Rek/Min Rek Chanh.
- `រែកចាញ់ / បើករែក`: có `COMMUNITY SIGNAL` cũ và phù hợp wording action-based.
- app/store mirrors xuất hiện nhiều nhưng đều `REJECTED AS POSITIVE EVIDENCE`.

Không đổi canonical terminology của project.

---

## 10. Archival pass liên quan Hao Rek

### `កម្ពុជសុរិយា`

CKS corroborate hai index:

1. `កម្រងមាតិកា កម្ពុជសុរិយា (១៩២៦–២០០០)` — khoảng 331 trang.
2. `កម្ពុជសុរិយា (១៩២៦–១៩៧៤): មាតិកា និងអក្ខរក្រម` — catalog khoảng 575 trang; searchable scan khoảng 599 scan pages.

Claim hẹp đã khóa:

> The 1926–1974 Kambuja Suriya alphabetical index contains no indexed article/title named `ល្បែងរែក`.

Label: `CONFIRMED ABOUT INDEX ONLY`.

Không được suy ra rằng body magazine không có Rek.

Research 2026-09-06 còn khóa:

- Buddhist Institute digital corpus giữ article title + author + page + scan/file links;
- `ល្បែងអៀវ` năm 1961, tác giả `ញូង សឿង`, là ví dụ folk-game article riêng;
- năm 1964 = `ឆ្នាំទី៣៦`, có 6 issues;
- đã tìm pointer `1964.pdf`, nhưng host hiện 502 nên chưa kiểm body `ល្បែងចត្រង្គ` / `ល្បែងផ្សេងៗ`.

Status Rek mention trong article body: `UNVERIFIED`.

### Chuon Nath exact scan

Edition/volume provenance đã khóa; exact `រែក` scan page vẫn unresolved. Archive pointer tìm được hiện 404. Không bịa page.

### 1973 scan

Exact eLibrary object/path đã tìm thấy; chưa bóc được page image/PDF asset. Không bịa page.

---

## 11. Video real-board research

Search terms đã dùng:

- `លេងល្បែងរែក`
- `របៀបលេងរែក`
- `ក្បួនលេងរែក`
- `ល្បែងរែកខ្មែរ`
- `ហៅរែក`
- `ក្បួនហៅរែក`
- `មិនរែកចាញ់`
- `បើកឲ្យរែក`
- `រែកហែក`
- `រែកព័ទ្ធ`

Một video 2014 `Tradition Khmer Board Game (Rek - រែក)` của Elite Naga là developer/app lineage: `REJECTED AS POSITIVE EVIDENCE`.

### 11.1. Media evidence inventory — user-supplied real-board footage

Các file dưới đây là media do user sưu tầm và cung cấp trực tiếp cho project research. Chúng **không có provenance archival độc lập đã khóa**, nên không tự nâng thành `CONFIRMED historical rule`. Tuy nhiên source policy của project cho phép real-board video trở thành positive evidence khi reconstruct được board + move sequence.

#### M1 — `1000009344.mp4` (real-board video, ~17:40)

`1000009345.mp4` là duplicate byte-identical của M1, nên **không tính là nguồn độc lập**.

##### Event M1-E1 — khoảng 89–97s: blocker leaves, newly opened Rek is answered

Camera-grid coordinates dùng hàng/cột 1-based để tránh nhầm với engine a1–h8.

Before opener:

- Red pieces tại khoảng `R6C3 – R7C3 – R8C3`;
- Blue đã có **một Rek opportunity cũ ở nơi khác trên board**.

Opener:

- Red `R7C3 → R7C2`;
- nước này không capture;
- ô `R7C3` vừa bỏ trống nằm giữa Red `R6C3` và Red `R8C3`.

Response:

- Blue `R7C6 → R7C3`;
- Blue đáp đúng vào gap mới mở;
- capture Red `R6C3 + R8C3`.

Evidence implications:

| Claim | Label |
|---|---|
| Sequence/move/capture trên video | `CONFIRMED ABOUT VIDEO` |
| Một blocker rời ô giữa pair có thể tạo một Rek response mới | `STRONG EVIDENCE candidate` |
| Hao Rek gắn với transition do opponent move tạo ra, không chỉ current-board scan | `STRONG EVIDENCE` |
| Pre-existing Rek khác không tự động trở thành target của call mới | `STRONG EVIDENCE candidate` |
| Tất cả pre-existing Rek luôn được bỏ qua trong mọi trường hợp | `UNVERIFIED` |

Điểm đặc biệt: Blue có một Rek cũ trước opener nhưng thực tế đáp Rek **mới vừa được mở**. Khi ghép với Khmer text `បើកឲ្យរែក` và community statement “pair mở sẵn không tự tính là call”, event này trực tiếp challenge current board-global compulsory model.

##### Event M1-E2 — khoảng 186.5–194s: Hao chain

Before opponent move:

- Blue có 0 Rek opportunity.

Red opener:

- Red di chuyển một nước quiet tạo ra một Rek mới cho Blue.

Blue response:

- Blue vào giữa hai Red và capture 2 quân.

Chain:

- chính Blue response tạo một Rek mới cho Red;
- Red lập tức Rek lại và capture 2 Blue;
- sau response này Blue không còn Rek response mới;
- sequence dừng.

Evidence implications:

| Claim | Label |
|---|---|
| Video có response → counter-response chain | `CONFIRMED ABOUT VIDEO` |
| Hao response có thể tạo Hao mới cho bên kia | `STRONG EVIDENCE candidate` |
| Chain kết thúc khi không còn call mới | `STRONG EVIDENCE candidate`, phù hợp `SECONDARY` text 2013 |

##### Event M1-E3 — khoảng 550.5–563s: mover enters to create a pair around a gap

Before Blue move:

- Red có 0 Rek opportunity.

Blue opener:

- Blue đi khoảng `R6C3 → R6C5`;
- sau nước này Blue tại `R6C5` và Blue đã có tại `R6C7`, với `R6C6` trống.

Red response:

- Red khoảng `R5C6 → R6C6`;
- Red đáp vào gap mới tạo;
- capture Blue `R6C5 + R6C7`.

Evidence implication:

- exact trigger **không thể hard-code chỉ là “blocking piece moves away”**;
- một opponent move **đi vào vị trí mới** cũng có thể tạo Rek opportunity mới;
- candidate predicate rộng hơn là **difference between responder Rek opportunities before vs after opponent move**.

##### Event M1-E4 — khoảng 1027–1041s

Một sequence khác cùng pattern:

- trước Red quiet move: Blue có 0 Rek;
- Red move tạo đúng một Rek mới;
- Blue lập tức thực hiện Rek đó và capture 2 Red.

Classification: `CONFIRMED ABOUT VIDEO` cho sequence; `STRONG EVIDENCE` khi dùng cùng M1-E1/E2/E3 để support transition-triggered model.

##### Multiple-new-target search

Toàn video đã được scan lại ở interval nhỏ và manual-review các candidate. Chưa tìm được event sạch mà **một opponent move duy nhất tạo >=2 NEW Hao responses**.

Do đó:

- “multiple ordinary Rek opportunities có thể cùng tồn tại”: observed;
- “một call có thể tạo nhiều new Hao targets”: `UNVERIFIED`;
- nếu có nhiều new targets thì responder/caller chọn: `UNVERIFIED`.

#### M2 — `1000009329.mp4` (real-board clip, ~33s)

Có board thật, người thật thao tác và capture, nhưng hand occlusion + overlay che các thời điểm quan trọng. Chưa reconstruct được một Hao before→opener→response đủ sạch.

Classification: `COMMUNITY / REAL-BOARD SIGNAL`; chưa dùng để khóa Hao geometry.

#### M3 — `1000009336.mp4` + `1000009337.jpg`

Video/screenshot chủ yếu quay sơ đồ setup vẽ tay, không phải move sequence. Hữu ích để corroborate canonical staggered setup ở community level nhưng không dùng khóa Hao geometry.

#### M4 — Facebook post `ល្បែងរែក-Rek Khmer`, 2021-03-22, ảnh tactical positions

Các ảnh là **các thế được đánh số riêng**, không phải before/after animation. Không được suy sequence capture giữa hai ảnh liên tiếp.

Classification: `COMMUNITY SIGNAL`; có giá trị làm lead cho trapping/Poat/tactical research.

#### M5 — app gameplay media

App/UI gameplay vẫn là `REJECTED AS POSITIVE EVIDENCE` cho historical rule truth.

### 11.2. Media-derived Hao model

Các reconstructed events hiện support model sau mạnh hơn current engine:

```text
before opponent move:
    responder Rek set = BEFORE

opponent executes move

after opponent move:
    responder Rek set = AFTER

newlyCreated = AFTER - BEFORE

if newlyCreated is non-empty:
    active Hao Rek obligation is created
    responder answers a newly-created Rek response

response itself becomes the next opponent move
    ↓
derive newly-created Rek responses for the other side
    ↓
chain while a new call exists
    ↓
stop when no new call is created
```

Đây là **implemented project model**, dựa trên evidence mạnh nhất hiện có; các edge case chưa khóa vẫn được ghi riêng là technical policy, không phải historical truth.

Unresolved edge cases:

1. one move creates multiple new Hao responses;
2. whether verbal declaration `រែក!` / `ហៅរែក` is required;
3. exact legal/forfeit representation when responder ignores a call;
4. interaction with Poat and multi-axis Rek.

---

## 12. Evidence gate trước khi đổi engine

Chỉ thay exact Hao Rek khi đạt ít nhất một trong các gate:

### Gate A — authoritative Khmer document

Rulebook, giáo trình, archival text hoặc tài liệu văn hóa Khmer mô tả trigger + response đủ rõ để dựng board tests.

### Gate B — hai nguồn native độc lập có board sequence

Mỗi nguồn phải cho reconstruct được tối thiểu:

- board trước nước gọi;
- move tạo call;
- pair trước/sau;
- legal response;
- multiple-pair handling nếu có;
- hậu quả khi không đáp.

### Gate C — expert validation

Người chơi/giảng dạy Rek Khmer có uy tín xác nhận edge cases bằng board examples.

Community/store comments không tự thỏa gate.

---

## 12.1. Edge-case research decision — 2026-09-06

Targeted follow-up searches were run for:

- multiple newly-created Hao responses;
- verbal call requirement;
- ignore-call penalty;
- `រែកព័ទ្ធ` vs `មិនរែកចាញ់`.

Results:

1. **Multiple NEW Hao responses:** no independent Khmer rule source found that decides responder-vs-caller choice. Historical semantics remain `UNVERIFIED`.
2. **Verbal declaration:** no Rek-specific source found saying a spoken/shouted `រែក!` is required for the obligation to exist. Historical verbal requirement remains `UNVERIFIED`.
3. **Ignore call:** Visal Odom / Phnom Penh Post attribution explicitly states `បើមិនរែក គឺត្រូវចាញ់` — “if [one] does not Rek, [one] loses.” Label: `SECONDARY`.
4. **Variant separation:** the same 2013 source explicitly says `ល្បែង “រែក” មានពីរ​ប្រភេទ គឺ “រែក ព័ទ្ធ” និង “មិន​រែក​ចាញ់”` — Rek has two types, “Rek Poat” and “Min Rek Chanh”. Label: `SECONDARY`; no independent corroboration found in this pass.

### Technical policies for implementation — NOT historical truth

To permit deterministic engine work without silently inventing historical claims:

- **TP-H1 — multiple NEW responses:** expose **all newly-created Hao responses** to the responder; responder may choose any. This is a conservative software policy, not a historical claim.
- **TP-H2 — verbal call:** do not require speech/audio state. Hao is derived from the board transition. If later evidence proves verbal declaration mandatory, this policy must be revisited.
- **TP-H3 — ignored Hao:** a geometrically submitted move outside the active Hao response set causes an immediate state-changing forfeit, preserving the existing public API style and the 2013 automatic-loss wording.
- **TP-H4 — Poat in Min:** do **not** change Poat behavior in the Hao implementation. The 2013 separation is a meaningful challenge but remains only `SECONDARY`; Poat-in-Min stays `ENGINE INTERPRETATION / UNVERIFIED` pending stronger evidence.

These policies unlock tests/implementation while keeping evidence labels separate from software decisions.

---

## 13. Candidate regression suite nếu event-trigger được xác minh

Update đúng workflow:

`research note → HUONG_DAN → SPEC → tests → engine → AI/tournament`

Candidate tests:

1. `HAO-EVENT-01` — pre-existing open pair không tự tạo call.
2. `HAO-EVENT-02` — exact verified opening move tạo call.
3. `HAO-RESP-01` — single called response bắt buộc.
4. `HAO-RESP-02` — multiple pairs theo exact verified choice rule.
5. `HAO-RESP-03` — ignore-call adjudication đúng semantics.
6. `HAO-LIFETIME-01` — lifetime/expiry của active call.
7. `HAO-CHAIN-01` — call chain tiếp tục/kết thúc đúng điều kiện.
8. `HAO-MULTIAXIS-01` — một call tạo nhiều trục/pair.
9. `HAO-POAT-01` — interaction called Rek / Poat.
10. snapshot/replay test nếu call là stateful metadata.
11. AI boundary test để AI chỉ consume engine-owned active-call legality.

---

## 14. Quyết định kỹ thuật tại 2026-09-07 — V1 freeze

`MIN_REK_CHANH` đã migrate sang transition-owned Hao Rek context và regression hiện khóa model đó.

Current implementation phải được gọi đúng là:

> `PROJECT V1 TECHNICAL POLICY — transition-owned Hao Rek / pending stronger historical validation for unresolved edges`

Evidence chữ + reconstructed real-board events hiện đủ mạnh để viết **proposed transition model** dựa trên newly-created Rek opportunities, nhưng **chưa đủ để implement final engine contract** vì multiple-new-target choice, verbal-call requirement và một số interaction edge cases vẫn unresolved.

Không thay gameplay trong note này. Bước tiếp theo đúng workflow là đồng bộ `HUONG_DAN` + `SPEC` ở mức **PROPOSED / NOT IMPLEMENTED**, sau đó mới quyết định test/engine migration khi evidence gate cho các edge case còn lại đủ mạnh.