# HƯỚNG DẪN LUẬT & HỒ SƠ BẰNG CHỨNG: រែកខ្មែរ - REK KHMER (ល្បែងរែក)

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Mục đích:** mô tả luật Rek Khmer theo mức độ bằng chứng và ngăn engine biến suy luận kỹ thuật thành “luật truyền thống đã xác nhận”.  
> **Nguồn bị loại:** Google Play, App Store, app game có sẵn, app clone và website chỉ copy luật từ app.

---

## 1. NGUYÊN TẮC CỐT LÕI: MỘT GAME, NHIỀU RULE LAYER

Project chỉ coi **Rek Khmer / ល្បែងរែក** là tên game.

Không chia `Rek`, `Poat`, `Hao Rek` thành ba game mode riêng:

- **Rek / រែក** = cơ chế bắt quân bằng cách đi vào giữa cặp quân đối phương.
- **Poat / ព័ទ្ធ** = cơ chế vây/bí.
- **Hao Rek / ហៅរែក** = khái niệm obligation/call đang tiếp tục research.
- **Min Rek Chanh / មិនរែកចាញ់** = variant có compulsory-Rek concept.

Engine hiện expose hai **rule set**:

```text
REK KHMER
│
├── REK_STANDARD
│   ├── movement core
│   ├── Rek
│   ├── Poat
│   └── King capture
│
└── MIN_REK_CHANH
    ├── cùng core Rek
    └── + current compulsory-Rek contract
        └── exact historical Hao Rek trigger: UNVERIFIED
```

Identifier `REK_POAT` là tên kỹ thuật cũ của project. Từ phiên bản contract hiện tại nó chỉ là **legacy alias → `REK_STANDARD`**, không còn được mô tả như tên một mode truyền thống độc lập.

---

## 2. MỨC ĐỘ TIN CẬY

| Nhãn | Ý nghĩa |
|---|---|
| **CONFIRMED** | Nguồn Khmer/nguồn văn hóa độc lập mạnh xác nhận trực tiếp nguyên lý. |
| **STRONG EVIDENCE** | Bằng chứng phù hợp, nhưng chưa có văn bản luật Khmer gốc đủ chi tiết để khóa mọi edge case. |
| **PROJECT-CONFIRMED** | Chủ dự án xác nhận trực tiếp bằng tư liệu/ảnh bàn thật dùng làm chuẩn project. |
| **ENGINE INTERPRETATION** | Cách project biến nguyên lý thành thuật toán cụ thể. |
| **UNVERIFIED** | Đã có trong code/docs cũ hoặc có dấu hiệu tồn tại nhưng chưa đủ bằng chứng. |
| **PROJECT EXTENSION** | Rule phục vụ software/gameplay hiện tại nhưng chưa tìm thấy cơ sở Rek truyền thống đủ mạnh. |

**Không được nâng `ENGINE INTERPRETATION` hoặc `UNVERIFIED` thành `CONFIRMED` chỉ vì regression test đang xanh.**

---

## 3. CHÍNH SÁCH NGUỒN

### 3.1. Ưu tiên

1. Từ điển/tư liệu Khmer gốc hoặc bản chép có nguồn rõ, đặc biệt Buddhist Institute / Chuon Nath.
2. Tài liệu văn hóa độc lập có bibliographic record.
3. Ministry of Education Cambodia, Center for Khmer Studies và thư viện học thuật.
4. Video bàn thật/kỳ thủ Khmer khi quan sát được đầy đủ thế trước-sau.
5. Game-history secondary source chỉ dùng corroboration.

### 3.2. Không dùng làm evidence

- Google Play / App Store.
- Game Android/iOS/web có sẵn.
- Website mirror app.
- Review/app description.
- Wiki/blog không có source chain khi quyết định rule tranh cãi.

---

## 4. NGUỒN ĐÃ ĐỐI CHỨNG

### S1 — Mục từ `រែក` dẫn từ Chuon Nath / Buddhist Institute

Bản chép truy cập được:

- https://phkaslapartner.com/learn/khmerwords-7764/

Nội dung mô tả `រែក` là một trò chơi; có `ស៊ីរែកទាំងពីរខាង` — ăn/gánh hai phía; và khi một bên `ទាល់ច្រក` thì bên kia có thể `កៀរក្រសោបស៊ីបានទាំងអស់` — bao/thu và ăn.

**Dùng để xác nhận:** sự tồn tại của Rek, intervention capture theo hai phía, nguyên lý vây/bí.

### S2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

- https://eric.ed.gov/?id=ED334342
- https://library.khmerstudies.org/bib/14710
- PDF lưu trữ: `Introduction to Cambodian Culture`, mục **V. REK**.

Mô tả bàn 8×8, mỗi bên 1 King + 15 soldiers, mỗi lượt một quân và mục tiêu bắt opposing King.

**Dùng để xác nhận:** kích thước bàn, số quân, King, lượt và mục tiêu.

### S3 — Sabay News

- https://news.sabay.com.kh/article/1045095

Corroborate nguyên lý ăn hai phía và tình trạng `ទាល់ច្រក`.

### S4 — Game-history secondary overview

- https://en.wikipedia.org/wiki/Mak-yek

Có mô tả Cambodian Rek về setup 7 + King + 8, movement trực giao, intervention/surrounding capture; nguồn gốc dẫn về material game-history cũ hiện khó truy cập.

**Mức:** STRONG SECONDARY, không đủ một mình để khóa Hao Rek.

### S5 — *ល្បែងប្រជាប្រិយខ្មែរ* (Buddhist Institute, 1964)

- https://sala.moeys.gov.kh/kh/library/00002631

Đây là bibliographic/context source thật, nhưng project hiện **chưa xác nhận đúng trang/mục Rek** đủ để dùng làm technical rule evidence.

---

## 5. LÕI LUẬT HIỆN CÓ THỂ DÙNG

### 5.1. Bàn, quân, mục tiêu — **CONFIRMED**

- Bàn 8×8.
- 16 quân mỗi bên.
- 1 King + 15 Men/Soldiers mỗi bên.
- Một lượt di chuyển một quân.
- Mục tiêu lõi: bắt King đối phương.

### 5.2. Setup — **PROJECT-CONFIRMED + STRONG EVIDENCE**

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

- Trắng: King `a2`; Men `b1-h1`, `a3-h3`; `a1` trống.
- Đen: King `h7`; Men `a6-h6`, `a8-g8`; `h8` trống.
- Đối xứng quay 180°.

### 5.3. Movement — **STRONG EVIDENCE**

Current canonical movement model:

- trượt theo 4 hướng trực giao;
- nhiều ô nếu đường trống;
- không đi chéo;
- không nhảy qua blocker;
- destination phải trống;
- không capture bằng cách đáp lên occupied square.

### 5.4. Rek — **CONFIRMED về intervention pair**

Sau khi quân đi vào ô trống `T`, nếu hai ô kề đối diện cùng trục đều là quân địch thì cặp đó bị bắt.

```text
enemy  |  T  |  enemy
```

hoặc theo trục dọc.

**Confirmed:** capture cặp hai phía.  
**Unverified:** nếu cả hai trục cùng đúng thì có bắt cả 4 hay phải chọn một cặp.

### 5.5. Poat — **CONFIRMED principle / ENGINE INTERPRETATION exact algorithm**

Nguồn bản ngữ xác nhận tình trạng bị bí/bao có thể dẫn tới bị ăn. Engine hiện diễn giải thành:

1. flood-fill nhóm quân cùng màu liên thông trực giao;
2. tìm adjacent empty liberties;
3. nhóm có 0 liberties bị bắt.

Đây là implementation hợp lý và regression-stable, nhưng không được nói rằng Chuon Nath đã mô tả BFS/liberties.

---

## 6. RULE SET CHUẨN: `REK_STANDARD`

`REK_STANDARD` là default rule set của project.

Current engine profile:

- setup canonical ở mục 5.2;
- movement trực giao;
- King di chuyển theo movement core;
- Rek không bị global compulsory filter;
- Poat chạy theo current flood-fill implementation;
- bắt King kết thúc ván.

`REK_STANDARD` **không có nghĩa** “một variant tên Rek Poat đã được lịch sử Khmer xác nhận”. Nó chỉ là tên technical canonical cho ruleset nền của Rek Khmer.

### Legacy alias

`REK_POAT`:

- vẫn được parser/API nhận để không phá caller/save cũ;
- ngay khi đi qua public session sẽ normalize thành `REK_STANDARD`;
- snapshot mới không emit `REK_POAT`.

---

## 7. VARIANT: `MIN_REK_CHANH`

Tên `មិនរែកចាញ់` gợi nghĩa “không Rek thì thua”, nên compulsory-Rek concept có cơ sở ngôn ngữ đáng điều tra sâu. Tuy nhiên **exact trigger chưa được khóa**.

### Current engine contract — **ENGINE INTERPRETATION / UNVERIFIED historical trigger**

Hiện code làm:

```text
nếu side-to-move có bất kỳ Rek opportunity nào trên board
→ chỉ Rek moves được expose là legal
→ submit quiet geometric move
→ xử thua ngay
```

Ngoài ra current engine giữ King đứng yên trong `MIN_REK_CHANH`.

### Chưa được gọi là confirmed

Cần nguồn bàn thật/Khmer mạnh hơn cho các câu hỏi:

1. Hao Rek có chỉ phát sinh từ **nước vừa rồi** không?
2. Cặp Rek đã tồn tại từ trước có tạo obligation không?
3. Có cần người chơi tuyên bố `ហៅរែក` không?
4. Nếu có nhiều Rek, được chọn bất kỳ hay chỉ target vừa gọi?
5. Có ưu tiên capture nhiều quân hơn không?
6. Không Rek là illegal move hay immediate loss?
7. King stationary chính xác trong mọi Min convention không?
8. Poat có áp dụng y hệt `REK_STANDARD` trong Min không?

Cho đến khi trả lời được, **không mở rộng thêm logic Min dựa trên suy đoán**.

---

## 8. KHÔNG PHẢI RULE SET

Các khái niệm sau không thuộc `RuleSet` của core engine:

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

UI/server tương lai quản lý match type. AI module quản lý difficulty. Core engine chỉ cần board, turn, state và ruleset.

---

## 9. CÁC ENGINE INTERPRETATION CÒN CHỜ RESEARCH

| Vấn đề | Current engine | Evidence status |
|---|---|---|
| Rek dual-axis | bắt 4 | **UNVERIFIED** |
| Poat exact semantics | connected group + 0 adjacent liberties | **ENGINE INTERPRETATION** |
| Rek/Poat timing | Rek trước, Poat sau | **ENGINE INTERPRETATION** |
| Min compulsory trigger | bất kỳ Rek nào trên board | **UNVERIFIED** |
| Min violation | immediate loss | **UNVERIFIED exact adjudication** |
| King stationary trong Min | yes | **STRONG SECONDARY / cần native confirmation** |
| Zero-move terminal | instant win | **UNVERIFIED** |
| Threefold | draw | **PROJECT EXTENSION** |
| Lone-King limit | configurable, default 32 | **PROJECT EXTENSION** |

---

## 10. QUY TRÌNH PROMOTE MỘT RULE MỚI

Không sửa engine trực tiếp từ một clip hoặc một bài viết đơn lẻ. Quy trình:

```text
new evidence
    ↓
đối chiếu source + board sequence
    ↓
update confidence trong HUONG_DAN...
    ↓
nếu đủ mạnh: update SPEC_ENGINE...
    ↓
add/change regression tests
    ↓
change core engine
    ↓
AI/session/tournament consume core behavior
```

Mục tiêu là để project ngày càng gần luật Khmer thật mà không biến uncertainty thành code “chắc chắn” quá sớm.
