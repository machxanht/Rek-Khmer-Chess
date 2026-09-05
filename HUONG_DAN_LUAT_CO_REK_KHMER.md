# HƯỚNG DẪN LUẬT & HỒ SƠ BẰNG CHỨNG: រែកខ្មែរ - REK KHMER (ល្បែងរែក)

> **Repository:** `machxanht/Rek-Khmer-Chess`  
> **Mục đích:** tách rõ **luật có bằng chứng**, **diễn giải kỹ thuật của engine** và **điểm chưa xác minh**.  
> **Nguyên tắc quan trọng:** tài liệu này KHÔNG dùng game/app trên Google Play, App Store hoặc app clone làm nguồn luật.

---

## 1. CÁCH ĐỌC TÀI LIỆU NÀY

Mỗi quy tắc được gắn một mức độ tin cậy:

| Nhãn | Ý nghĩa |
|---|---|
| **CONFIRMED** | Có nguồn Khmer/nguồn văn hóa độc lập mạnh xác nhận trực tiếp nguyên lý. |
| **STRONG EVIDENCE** | Có nhiều bằng chứng phù hợp hoặc một nguồn độc lập đáng tin, nhưng chưa có văn bản luật Khmer chính thức đủ chi tiết. |
| **PROJECT-CONFIRMED** | Được chủ dự án xác nhận trực tiếp bằng tư liệu/ảnh bàn thật dùng làm chuẩn của project. |
| **ENGINE INTERPRETATION** | Cách project biến nguyên lý truyền thống thành thuật toán cụ thể để chạy game. Không được tự động coi là chứng cứ lịch sử. |
| **UNVERIFIED** | Có dấu hiệu hoặc đã tồn tại trong engine/docs cũ nhưng chưa đủ bằng chứng để gọi là luật Khmer chuẩn. |
| **UNSUPPORTED TRADITIONAL CLAIM** | Chưa tìm thấy bằng chứng Rek truyền thống; nếu engine vẫn dùng thì phải xem là rule extension của project cho đến khi chứng minh được. |

**Quy tắc thay đổi engine:** chỉ khi một mục `UNVERIFIED` có bằng chứng mới đủ mạnh thì mới cập nhật `SPEC_ENGINE_CO_REK_KHMER.md`, code và regression tests.

---

## 2. CHÍNH SÁCH NGUỒN

### 2.1. Nguồn được ưu tiên

1. **Từ điển/tư liệu Khmer gốc hoặc bản chép có chỉ rõ nguồn gốc**, đặc biệt Buddhist Institute / Chuon Nath.
2. **Tài liệu văn hóa độc lập** về Campuchia có bibliographic record rõ ràng.
3. **Thư viện/cơ quan Khmer** như Ministry of Education, Center for Khmer Studies.
4. **Video bàn thật / kỳ thủ Khmer** khi nhìn được đầy đủ thế cờ trước và sau nước đi.
5. Nguồn game-history thứ cấp chỉ dùng để **corroborate**, không dùng một mình để quyết định luật gây tranh cãi.

### 2.2. Nguồn bị loại khỏi rule evidence

- Google Play / App Store.
- Website mirror mô tả app.
- Review trong app store.
- App mobile/web game có sẵn.
- Tài liệu chỉ copy luật từ app mà không dẫn nguồn Khmer độc lập.

Lý do: project đã phát hiện nhiều implementation/app hiện có sai setup hoặc sai `Hao Rek`, nên không được dùng chính các app đó để chứng minh luật.

---

## 3. CÁC NGUỒN HIỆN ĐÃ ĐỐI CHỨNG

### S1 — Mục từ `រែក` dẫn từ từ điển Chuon Nath / Buddhist Institute

Bản chép hiện truy cập được:

- https://phkaslapartner.com/learn/khmerwords-7764/

Bản này ghi rõ đang trích **វចនានុក្រមខ្មែរ của Samdech Chuon Nath (Buddhist Institute)** và phần danh từ `រែក` mô tả một trò chơi tương tự Chatrang, có kiểu `ស៊ីរែកទាំងពីរខាង` (ăn/gánh hai phía), và nếu một bên `ទាល់ច្រក` thì bên kia `កៀរក្រសោបស៊ីបានទាំងអស់` (bao/thu lại rồi ăn).

**Giá trị bằng chứng:** rất mạnh cho sự tồn tại của trò Rek, cơ chế ăn hai phía và nguyên lý vây/bí.  
**Giới hạn:** bản web hiện là bản chép lại mục từ, không phải scan gốc của từ điển.

### S2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

- ERIC record: https://eric.ed.gov/?id=ED334342
- Bản PDF lưu trữ: https://hslb.org/wp-content/uploads/Cambodian-American-Collection/History-and-Culture/Historical-Overview/Introduction-to-Cambodian-Culture.pdf
- Center for Khmer Studies catalog: https://library.khmerstudies.org/bib/14710

Phần **V. REK**, trang 48 của bản PDF mô tả Rek là game chiến thuật/war game, dùng bàn **8×8**, hai đội quân mỗi bên **1 King + 15 soldiers**, mỗi lượt chỉ di chuyển một quân và mục tiêu là **capture the opposing King**.

**Giá trị bằng chứng:** nguồn văn hóa độc lập mạnh, không dựa vào game mobile.

### S3 — Sabay News, bài về các trò/cờ Khmer

- https://news.sabay.com.kh/article/1045095

Bài nhắc `ល្បែងរែក` và lặp lại nguyên lý: ăn hai phía; khi một bên `ទាល់ច្រក` thì bị bên kia kẹp/bao và ăn hết.

**Giá trị bằng chứng:** corroboration bằng tiếng Khmer.  
**Giới hạn:** nội dung gần với định nghĩa từ điển, nên không được tính như một nguồn kỹ thuật hoàn toàn độc lập.

### S4 — Game-history overview về Rek (nguồn thứ cấp)

- https://en.wikipedia.org/wiki/Mak-yek

Phần Cambodian/Rek mô tả setup 7 quân ở hàng sau + King ở đầu hàng 2 + 8 quân ở hàng 3, di chuyển trực giao nhiều ô, intervention capture và surrounding capture. Trang này dẫn nguồn cũ tới Jean-Louis Cazaux/Chesmayne, nhưng nguồn gốc hiện khó truy cập.

**Giá trị bằng chứng:** `STRONG SECONDARY`, hữu ích để đối chiếu setup/movement.  
**Không được dùng một mình** để khóa các chi tiết gây tranh cãi như exact Hao Rek trigger.

### S5 — *ល្បែងប្រជាប្រិយខ្មែរ* (Buddhist Institute, 1964)

- Ministry of Education Digital School: https://sala.moeys.gov.kh/kh/library/00002631

Đây là sách Khmer thật, do Buddhist Institute xuất bản năm 1964. Tuy nhiên research hiện tại **chưa xác nhận rằng sách này chứa mục Rek đủ chi tiết để làm nguồn luật trực tiếp**.

**Giá trị bằng chứng:** bibliographic/context only. Không được trích như bằng chứng cho một rule Rek nếu chưa chỉ ra đúng trang/mục Rek.

---

## 4. NHỮNG GÌ HIỆN CÓ THỂ COI LÀ LÕI LUẬT REK

### 4.1. Bàn và số quân — **CONFIRMED**

- Bàn `8 × 8`.
- Mỗi bên 16 quân.
- Mỗi bên gồm **1 Vua (King/Sdech) + 15 quân thường (Men/Soldiers)**.
- Một lượt chỉ di chuyển **một quân**.
- Mục tiêu cốt lõi: **bắt Vua đối phương**.

Cơ sở chính: S2; tương thích với S4.

### 4.2. Setup canonical của project — **PROJECT-CONFIRMED + STRONG EVIDENCE**

Ngày 2026-09-05, chủ dự án xác nhận trực tiếp setup qua ảnh bàn cờ thực tế. Setup đó đồng thời phù hợp với mô tả thứ cấp ở S4.

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

- Trắng: King `a2`; Men `b1-h1` và `a3-h3`; `a1` trống.
- Đen: King `h7`; Men `a6-h6` và `a8-g8`; `h8` trống.
- Hai bên đối xứng quay 180°.

Đây là setup canonical của project cho đến khi có tư liệu Khmer gốc mạnh hơn chứng minh một setup khác.

### 4.3. Di chuyển trực giao — **STRONG EVIDENCE**

Mô hình đang được project dùng:

- đi ngang hoặc dọc;
- có thể đi nhiều ô nếu đường trống;
- không đi chéo;
- không nhảy qua quân cản;
- ô đích phải trống, không bắt theo kiểu đi đè lên quân địch.

S4 mô tả các quân di chuyển orthogonally nhiều ô như Rook. S1/S2 không cung cấp pseudo-code movement chi tiết, nên mức chính xác kỹ thuật được giữ ở `STRONG EVIDENCE` chứ không gắn `CONFIRMED` tuyệt đối.

### 4.4. Rek / `ស៊ីរែក` — **CONFIRMED về nguyên lý ăn hai phía**

Nguồn S1 nói rõ có kiểu `ស៊ីរែកទាំងពីរខាង` — ăn/gánh hai phía. Đây là cơ chế cốt lõi tạo nên tên game.

Project hiện diễn giải hình học Rek như sau:

```text
Địch  ←  quân vừa đi  →  Địch
```

Nếu sau khi quân của người chơi đi vào một ô trống, hai ô kề đối diện theo cùng một trục đều là quân địch, cặp đó bị bắt.

Ví dụ ngang:

```text
B   A   B
```

`A` vừa đi vào giữa hai `B` → hai `B` bị Rek.

**Phần bắt một cặp đối diện:** `CONFIRMED + ENGINE GEOMETRY`.  
**Việc đồng thời bắt cả hai trục thành 4 quân:** xem mục 7.1, chưa native-confirmed đủ mạnh.

### 4.5. Poat / vây-bí — **CONFIRMED về nguyên lý, STRONG INTERPRETATION về thuật toán**

S1 xác nhận khi một bên bị `ទាល់ច្រក` (bí/chặn đường), bên kia có thể `កៀរក្រសោប` rồi ăn. S4 mô tả việc bao hoàn toàn một quân hoặc nhóm quân để chúng không còn legal move.

Project hiện biến nguyên lý này thành:

1. tìm nhóm quân cùng phe liên thông trực giao;
2. tìm các ô trống trực giao sát nhóm (`liberties`);
3. nếu cả nhóm có `0 liberties` → nhóm bị Poat và bị loại.

Đây là **ENGINE INTERPRETATION mạnh và hợp lý**, nhưng tài liệu hiện không được phép nói rằng Chuon Nath đã mô tả trực tiếp thuật toán Flood-Fill/BFS.

---

## 5. HAI CHẾ ĐỘ CHƠI: CÁI GÌ BIẾT, CÁI GÌ CHƯA BIẾT

### 5.1. Rek Poat (`REK_POAT`)

Current engine profile:

- King di chuyển như Man.
- Rek không bắt buộc.
- Poat được áp dụng sau nước đi.
- Bắt King kết thúc ván.

**Research status:** setup/movement/Rek/encirclement có bằng chứng tương đối mạnh. Tên gọi/phạm vi chính xác của `Rek Poat` như một mode formal vẫn cần thêm tư liệu Khmer gốc, nhưng profile này hiện là baseline hợp lý nhất của project.

### 5.2. Min Rek Chanh (`MIN_REK_CHANH`)

Nguồn game-history thứ cấp cho thấy có một variant tên `Min Rek Chanh` và King là ngoại lệ về movement (Palace King / không đi). Điều này hỗ trợ việc engine hiện giữ King đứng yên.

Tuy nhiên **Hao Rek là vùng chưa được xác minh đủ sâu**.

Current engine đang thực hiện:

```text
Nếu tồn tại BẤT KỲ nước Rek nào của bên tới lượt
→ tất cả nước không-Rek bị loại khỏi legal set
→ nếu vẫn submit nước không-Rek thì xử thua ngay.
```

Cách này là **CURRENT ENGINE INTERPRETATION — UNVERIFIED AS TRADITIONAL RULE**.

Không được ghi trong tài liệu rằng đây là “100% luật Khmer chuẩn” cho đến khi tìm được nguồn Khmer/sequence bàn thật xác nhận exact trigger.

---

## 6. HAO REK (`ហៅរែក`) — HỒ SƠ NGHIÊN CỨU MỞ

### 6.1. Những câu hỏi chưa có câu trả lời đủ mạnh

1. Hao Rek có chỉ phát sinh do **nước ngay trước đó của đối phương** tạo ra thế gánh không?
2. Một cặp quân đã để hở từ nhiều lượt trước có được tính là Hao Rek không?
3. Có cần hành động `Hao Rek` tạo ra **một cặp cụ thể** để ép đối phương ăn đúng cặp đó không?
4. Nếu cùng lúc có nhiều cặp có thể Rek, người bị ép được chọn bất kỳ cặp nào hay bị ràng buộc bởi cặp vừa được gọi?
5. Lời hô bằng miệng có phải một phần bắt buộc của rule hay chỉ là nghi thức bàn thật?
6. Vi phạm Hao Rek là **thua ngay**, hay đơn giản nước đó không hợp lệ và phải đi lại?
7. Có chuỗi Hao Rek forced sequence không?
8. Poat có được áp dụng y hệt trong Min Rek Chanh hay Min mode chỉ ưu tiên/giới hạn Rek?

### 6.2. Hướng xác minh đúng

Cần thu được 5–10 sequence độc lập từ bàn thật/người chơi Khmer:

```text
Board trước nước gọi
→ nước vừa đi
→ cặp/quân được coi là Hao Rek
→ legal response thực tế
→ điều gì xảy ra nếu có nhiều Rek
→ kết quả nếu người chơi từ chối Rek
```

Mỗi sequence phải có link, timestamp hoặc ảnh board đủ để tái dựng bằng tọa độ.

**Không dùng app làm bằng chứng cho các sequence này.**

---

## 7. CÁC ĐIỂM ENGINE ĐANG CÓ NHƯNG CHƯA ĐƯỢC GỌI LÀ LUẬT TRUYỀN THỐNG ĐÃ XÁC NHẬN

### 7.1. Rek 4 quân — **ENGINE INTERPRETATION / INFERRED**

Engine hiện kiểm tra Rek ngang và Rek dọc độc lập tại cùng landing square. Vì vậy nếu đồng thời thỏa cả hai trục, 4 quân bị bắt.

Điều này hợp lý về hình học, nhưng research hiện chưa tìm được nguồn Khmer gốc đủ mạnh ghi rõ `រែកបួន` / “Rek 4” là rule formal.

**Giữ implementation hiện tại để ổn định game, nhưng không gắn `CONFIRMED`.**

### 7.2. Thứ tự `move → Rek → Poat` — **ENGINE INTERPRETATION**

Engine hiện:

```text
Move
→ remove Rek victims
→ calculate Poat on post-Rek board
→ remove Poat victims
→ adjudicate terminal state
```

Thứ tự này nhất quán và tránh double-counting, nhưng hiện chưa có nguồn Khmer gốc đủ chi tiết mô tả exact algorithmic ordering.

### 7.3. Zero legal moves toàn phe = thắng ngay — **UNVERIFIED**

Engine hiện coi đối thủ không còn geometric legal moves là một win condition riêng.

Trong S1, khái niệm `ទាល់ច្រក` gắn với việc bên kia bao/thu và ăn. Chưa đủ bằng chứng để kết luận mọi trạng thái `legalMoves === 0` phải lập tức xử thắng mà không thông qua capture semantics.

Đây là một điểm cần audit sau khi hiểu rõ Poat/Min Rek Chanh.

### 7.4. Threefold repetition — **UNSUPPORTED TRADITIONAL CLAIM**

Engine hiện hòa khi cùng position lặp 3 lần.

Research hiện **chưa tìm thấy nguồn Rek truyền thống** xác nhận threefold repetition. Cho đến khi có bằng chứng, đây phải được xem là **project draw extension**, không phải luật Khmer đã xác nhận.

### 7.5. Lone King 32-move draw — **UNSUPPORTED TRADITIONAL CLAIM**

Engine hiện có `DEFAULT_LONE_KING_DRAW_LIMIT = 32`.

Research hiện chưa tìm thấy nguồn Rek đủ mạnh cho quy tắc 32 nước. Các con số kiểu 32/44 xuất hiện ở các hệ cờ khu vực khác nên có nguy cơ bị cross-contamination.

Cho đến khi có nguồn Rek riêng, đây là **project extension**.

---

## 8. BẢNG RULE REGISTRY HIỆN TẠI

| Rule | Evidence status | Engine hiện tại | Hành động |
|---|---|---|---|
| Bàn 8×8 | **CONFIRMED** | Có | Giữ |
| 16 quân/bên = 1 King + 15 Men | **CONFIRMED** | Có | Giữ |
| Mỗi lượt đi 1 quân | **CONFIRMED** | Có | Giữ |
| Mục tiêu bắt King | **CONFIRMED** | Có | Giữ |
| Setup `a2/h7`, 7+King+8 | **PROJECT-CONFIRMED + STRONG** | Có | Giữ |
| Đi trực giao nhiều ô, không nhảy | **STRONG EVIDENCE** | Có | Giữ |
| Rek ăn cặp hai phía | **CONFIRMED** | Có | Giữ |
| Bao/vây quân bị bí | **CONFIRMED principle** | Có | Giữ |
| Poat = connected component + 0 liberties | **STRONG ENGINE INTERPRETATION** | Có | Giữ, tiếp tục tìm nguồn |
| Rek 4 | **INFERRED** | Có | Không gọi là confirmed |
| Move → Rek → Poat | **ENGINE INTERPRETATION** | Có | Giữ để ổn định |
| Min King đứng yên | **STRONG SECONDARY** | Có | Giữ, tìm native source |
| Hao Rek global compulsory | **UNVERIFIED** | Có | Ưu tiên research cao nhất |
| Hao Rek violation = thua ngay | **UNVERIFIED exact semantics** | Có | Ưu tiên research cao |
| Poat y hệt trong Min | **UNVERIFIED** | Có | Research |
| Zero-move instant win | **UNVERIFIED** | Có | Audit sau Poat/Hao Rek |
| Threefold repetition | **UNSUPPORTED traditional claim** | Có | Xem là project extension |
| Lone King 32 | **UNSUPPORTED traditional claim** | Có | Xem là project extension |

---

## 9. HƯỚNG DẪN CHƠI NHANH — PROFILE ENGINE HIỆN TẠI

Phần này mô tả **game mà code hiện đang chạy**, không tuyên bố mọi chi tiết đều đã được chứng minh là luật truyền thống.

### Chuẩn bị

- Bàn 8×8.
- 16 quân mỗi bên.
- Setup theo sơ đồ ở mục 4.2.
- Trắng/`you` đi trước trong engine hiện tại.

### Một lượt

1. Chọn một quân của bên tới lượt.
2. Di chuyển ngang/dọc qua các ô trống, không nhảy qua quân.
3. Không được đáp xuống ô đã có quân.
4. Nếu landing square nằm giữa hai quân đối phương ở một trục, engine Rek cặp đó.
5. Engine xóa Rek trước.
6. Engine kiểm tra các nhóm đối phương mất hết liberties và Poat chúng.
7. Nếu King đối phương bị bắt, game kết thúc.
8. Nếu chưa kết thúc, engine áp dụng các win/draw extension hiện hành rồi đổi lượt.

### Khác biệt mode hiện tại

**REK_POAT**
- King được đi.
- Rek optional.

**MIN_REK_CHANH**
- King đứng yên.
- Engine hiện buộc phải đi một Rek nếu tồn tại bất kỳ Rek nào.
- Vi phạm bị xử thua.

Hai dòng compulsory ở trên là **current implementation**, đang chờ xác minh Hao Rek sâu hơn.

---

## 10. QUY TẮC THAY ĐỔI SOURCE OF TRUTH

Khi tìm được nguồn mới:

1. Lưu link/tên sách/trang/timestamp.
2. Ghi nguyên văn Khmer ngắn gọn hoặc mô tả chính xác board sequence.
3. Dịch nghĩa nhưng tách phần dịch khỏi phần suy luận.
4. So với `Rule Registry` ở mục 8.
5. Nếu rule chuyển từ `UNVERIFIED` → `STRONG/CONFIRMED`, cập nhật tài liệu trước.
6. Sau đó mới sửa `SPEC_ENGINE_CO_REK_KHMER.md`.
7. Sau đó mới sửa `lib/rek-engine/`.
8. Thêm regression test tái hiện đúng evidence.
9. Chạy toàn bộ typecheck + test + tournament smoke.

**Không bao giờ sửa engine chỉ để khớp một app game có sẵn.**

---

## 11. ƯU TIÊN RESEARCH TIẾP THEO

Theo mức độ có thể làm thay đổi gameplay:

1. **Hao Rek exact trigger và response selection.**
2. Min Rek Chanh: vai trò King và Poat.
3. Poat exact timing/connected-group semantics.
4. Rek 4 có được native rule công nhận hay không.
5. Immobilization có phải terminal độc lập hay là hệ quả của Poat.
6. Draw rules: có hay không; nếu có thì exact conditions.

Cho đến khi các mục này được xác minh, engine hiện tại được xem là **stable project implementation**, không được gọi toàn bộ là “100% luật truyền thống đã chứng minh”.
