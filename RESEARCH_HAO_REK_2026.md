# RESEARCH NOTE: ហៅរែក (Hao Rek) / Min Rek Chanh — 2026

> **Ngày rà soát:** 2026-09-05  
> **Trạng thái:** `UNRESOLVED — DO NOT CHANGE ENGINE RULES FROM THIS NOTE ALONE`  
> **Scope:** exact trigger và nghĩa vụ phản hồi của **Hao Rek (ហៅរែក)** trong variant `MIN_REK_CHANH`.

Tài liệu này là **research note**, không phải rule specification. Nó không thay thế:

1. `HUONG_DAN_LUAT_CO_REK_KHMER.md`
2. `SPEC_ENGINE_CO_REK_KHMER.md`
3. regression tests của engine

Mục tiêu của note là ghi lại những tín hiệu có ích cho việc điều tra Hao Rek, nhưng không biến app/game implementation hoặc ý kiến cộng đồng thành luật lịch sử.

---

## 1. Source policy bắt buộc

### EXCLUDED — không được dùng làm positive rule evidence

Các nguồn sau **không được dùng để chứng minh luật Rek Khmer**:

- mô tả game trên Google Play / Apple App Store;
- screenshot/tutorial của app;
- hành vi mà một app hiện đang implement;
- website copy/scrape lại store description;
- review bài app chỉ mô tả lại hành vi của app mà không nói về luật ngoài đời.

Lý do: app có thể implement sai, và chính mục tiêu của project là không sao chép sai sót từ app hiện có.

### COMMUNITY SIGNAL — được đọc để đối chiếu, không phải source of truth

**Comment/review do người dùng viết bên dưới app được phép đọc**, vì chúng có thể chứa:

- phản biện rằng app đang làm sai;
- mô tả edge case người chơi Khmer kỳ vọng;
- từ khóa Khmer để tiếp tục tìm tài liệu gốc;
- ví dụ board sequence cần đem đi xác minh độc lập.

Nhưng comment/review:

- không được nâng lên `CONFIRMED` chỉ vì người viết là native Khmer;
- không được dùng một mình để sửa `SPEC_ENGINE_CO_REK_KHMER.md`;
- không được dùng một mình để thay gameplay;
- phải được ghi rõ là `COMMUNITY SIGNAL`.

---

## 2. Current engine đang làm gì?

Tại thời điểm note này được viết, `MIN_REK_CHANH` dùng **current project interpretation**:

- King đứng yên.
- Nếu bên đến lượt có **bất kỳ** nước Rek nào ở bất kỳ đâu trên bàn, toàn bộ quiet moves bị loại khỏi rule-legal set.
- Nếu người chơi gửi một quiet move hình học hợp lệ trong khi engine thấy có Rek ở chỗ khác, engine adjudicate đó là Hao Rek violation và xử thua ngay.

Đây là **state-triggered global compulsory Rek**: nghĩa vụ phát sinh chỉ vì một Rek opportunity đang tồn tại trên board.

Hiện chưa có nguồn Khmer authoritative đủ chi tiết để chứng minh interpretation này là luật truyền thống chính xác.

---

## 3. Authoritative/independent evidence hiện có

### A1 — Chuon Nath / Buddhist Institute dictionary tradition

Nguồn mirror Khmer:

- https://phkaslapartner.com/learn/khmerwords-7764/

Trang này ghi rõ đang dẫn nghĩa từ **វចនានុក្រមខ្មែរ của Samdech Chuon Nath / Buddhist Institute**.

Phần định nghĩa `រែក` xác nhận ở mức native lexical/cultural evidence:

- Rek là một loại trò chơi Khmer tương tự `ចត្រង្គ` nhưng khác tên quân và thắng/thua;
- có kiểu `ស៊ីរែកទាំងពីរខាង` — bắt/ăn hai phía;
- nếu một bên `ទាល់ច្រក`, bên kia có thể `កៀរ/ក្រសោប` để bắt;
- trò này được nhắc như trò dành cho quân lính tương tự Chaktrang.

**Không có exact Hao Rek trigger trong mục từ này.**

Confidence: `CONFIRMED` cho core Rek/encirclement concept; `NO EVIDENCE` cho exact Hao Rek.

### A2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

Bibliographic record:

- ERIC ED334342: https://eric.ed.gov/?id=ED334342
- Center for Khmer Studies catalog bản gộp 1989: https://library.khmerstudies.org/bib/14710

Bản PDF được index có section `V. REK`, page 48:

- Rek dùng bàn 8×8;
- mỗi bên 1 King + 15 soldiers;
- chỉ một quân được đi mỗi lượt;
- mục tiêu là capture opposing King.

Nguồn này không cung cấp exact Hao Rek semantics trong phần text đã truy xuất được.

Confidence: `STRONG INDEPENDENT CULTURAL SOURCE` cho board/army/objective; `NO DIRECT HAO REK RULE`.

### A3 — Buddhist Institute, *ល្បែងប្រជាប្រិយខ្មែរ* (1964)

Institutional records:

- MoEYS Digital School: https://sala.moeys.gov.kh/kh/library/00002631
- Center for Khmer Studies: https://library.khmerstudies.org/bib/6505

Đây là tài liệu Khmer chính thống về folk games. Tuy nhiên các nguồn Khmer trích danh sách **22 trò trong sách** không có `ល្បែងរែក`; danh sách kết thúc với `ល្បែងចត្រង្គ`.

Ví dụ danh sách được trích tại:

- https://thmeythmey.com/detail/135581

Do đó tài liệu 1964 phải được dùng đúng vai trò:

- **rất mạnh cho bối cảnh lưu giữ trò chơi Khmer**;
- **không được dùng như direct Rek rule source**, trừ khi sau này tìm được trang scan cụ thể nói về Rek.

Confidence: `AUTHORITATIVE CONTEXT`, `NOT DIRECT REK EVIDENCE`.

### A4 — *ប្រជុំវប្បធម៌ទូទៅ* (1973) — historical corroboration only

Một transcription web dẫn metadata:

- author: ឡុច ផ្លែង;
- publisher: វិទ្យាស្ថានជាតិខេមរយានកម្ម;
- Phnom Penh, 1973;
- danh sách trò Khmer có `ល្បែងរែក`.

Transcription:

- https://savenkhknowlege.blogspot.com/2013/07/blog-post_5384.html

Đây chưa phải original scan nên chỉ dùng để chứng minh rằng **Rek được liệt kê trong một compilation văn hóa Khmer được gán cho năm 1973**, không dùng để xác minh mechanics.

Confidence: `HISTORICAL CORROBORATION`, chưa phải primary scan.

---

## 4. Community signals từ comment bên dưới app — chỉ để đối chiếu

Phần này cố ý **không coi store page, developer description hay app implementation là nguồn luật**. Chỉ ghi nhận lời người dùng để tạo giả thuyết nghiên cứu.

### C1 — Khmer user comment, 2025-02-16

Một commenter Khmer tên `bou senghy` phản biện cách app xử lý Hao Rek và mô tả ba ý:

1. một cặp Rek đã mở sẵn không tự động được tính là một lời gọi;
2. lời gọi có thể phát sinh khi một quân đang che/chặn rời đi và làm lộ cơ hội Rek;
3. khi có nhiều cặp mở, bên phải Rek có thể được quyền chọn; khi lời gọi chỉ tạo một cặp thì cặp đó bắt buộc phải được xử lý.

Classification: `COMMUNITY SIGNAL — DETAILED, NOT AUTHORITATIVE`.

Giá trị của comment này là tạo ra các candidate tests/event semantics để đi tìm nguồn độc lập, **không phải để code ngay**.

### C2 — Khmer user comment, 2026-06-08

Commenter `UN BUNTHEN` nói phần `ក្បួនហៅរែក` trong app được sắp/triển khai sai và yêu cầu sửa để không làm sai lệch cờ Rek Khmer.

Classification: `COMMUNITY SIGNAL — CORROBORATES THAT APP IMPLEMENTATION IS DISPUTED`.

Comment này không mô tả đủ thuật toán để xác định replacement rule.

### C3 — Apple App Store comments đã rà

Những review được index hiện chủ yếu nói về:

- lỗi kết nối/treo khi Hao Rek;
- single-player/bug;
- nhận xét chung về game.

Không tìm được comment App Store nào trong tập đã index cung cấp một rule sequence đủ chi tiết để độc lập corroborate C1.

Classification: `NO SEMANTIC CORROBORATION FOUND YET`.

### Kết luận từ community comparison

Community comments **làm current global state-trigger interpretation đáng nghi hơn**, nhưng chưa vượt evidence gate để thay luật.

---

## 5. Candidate Hao Rek model đang cần xác minh

Các giả thuyết dưới đây chỉ là `UNVERIFIED HYPOTHESES`:

- **H1 — Event trigger:** Hao Rek phát sinh do một nước cụ thể tạo/làm lộ lời gọi Rek, không phải chỉ vì board đang có Rek.
- **H2 — Pre-existing pair:** một cặp Rek đã mở từ trước không tự tạo call.
- **H3 — Multiple pairs:** responder có thể được chọn trong nhiều Rek pair hợp lệ.
- **H4 — Single called pair:** nếu call chỉ tạo đúng một response pair thì phải Rek pair đó.
- **H5 — Stateful call:** nếu H1 đúng, engine có thể cần lưu metadata về call vừa phát sinh; board position thuần túy có thể không đủ để suy ra obligation.

C1 phù hợp với H1–H4, nhưng **chưa có authoritative/native independent source thứ hai mô tả cùng edge cases**.

---

## 6. Vì sao chưa sửa engine?

Nếu đổi từ global state-trigger sang event-trigger ngay, project vẫn chưa trả lời chắc chắn được:

1. nước nào chính xác được xem là “gọi”;
2. call gắn với một pair, một destination hay chỉ trạng thái sau nước đi;
3. một nước làm lộ nhiều pair thì xử thế nào;
4. pre-existing pair + newly-called pair cùng tồn tại thì responder được chọn gì;
5. call sống đúng một ply hay kéo dài;
6. quiet move khi có call là illegal move hay immediate loss;
7. Poat có tồn tại trong `MIN_REK_CHANH` không;
8. King stationary interaction với Poat/immobilization thế nào;
9. một chuỗi Hao Rek liên tiếp được tạo và kết thúc ra sao.

Sửa khi chưa khóa các câu này sẽ chỉ thay một assumption bằng assumption khác.

---

## 7. Evidence gate trước khi thay Hao Rek semantics

Chỉ sửa exact Hao Rek khi đạt ít nhất một gate sau.

### Gate A — Authoritative Khmer document

Có rulebook, giáo trình, archival text hoặc tài liệu văn hóa Khmer mô tả trigger + response đủ rõ để dựng board tests.

### Gate B — Hai nguồn native độc lập có board sequence

Hai người/nguồn Khmer độc lập mô tả được ít nhất:

- board trước nước gọi;
- nước tạo call;
- legal response;
- trường hợp nhiều pair;
- hậu quả khi không đáp.

Ưu tiên video bàn thật hoặc oral explanation có thể reconstruct nước đi.

### Gate C — Expert validation

Một người chơi/giảng dạy Rek Khmer có uy tín xác nhận trực tiếp các edge cases bằng board examples.

**Store comments không tự thỏa Gate B**, trừ khi người viết được xác minh độc lập và sequence được đối chứng ngoài storefront.

---

## 8. Regression suite cần có nếu event-trigger được xác minh

Update theo đúng thứ tự:

`HUONG_DAN_LUAT_CO_REK_KHMER.md` → `SPEC_ENGINE_CO_REK_KHMER.md` → tests → engine → AI/tournament.

Candidate tests:

1. `HAO-EVENT-01` — pre-existing open pair không tự tạo call.
2. `HAO-EVENT-02` — một nước đã xác minh làm lộ pair tạo call.
3. `HAO-RESP-01` — single called response bắt buộc.
4. `HAO-RESP-02` — multiple pairs follow exact verified choice rule.
5. `HAO-RESP-03` — quiet response adjudication đúng semantics.
6. `HAO-LIFETIME-01` — lifetime/expiry của active call.
7. `HAO-MULTIAXIS-01` — một call tạo nhiều trục/pair.
8. `HAO-POAT-01` — interaction giữa called Rek và Poat.
9. snapshot/replay test nếu call là stateful metadata.
10. AI boundary test để AI chỉ consume engine-owned active-call legality.

---

## 9. Research priority tiếp theo

Ưu tiên theo thứ tự:

1. tìm original Chuon Nath/Buddhist Institute dictionary scan cho mục `រែក`;
2. tìm original scan/copy của `ប្រជុំវប្បធម៌ទូទៅ` 1973 và xem có section Rek chi tiết hay chỉ listing;
3. tra index `កម្ពុជសុរិយា` và catalog Khmer cho `រែក`, `ស៊ីរែក`, `ហៅរែក`, `មិនរែកចាញ់`;
4. tìm video bàn thật Khmer có thể reconstruct position trước/sau Hao Rek;
5. phỏng vấn/đối chiếu người chơi lớn tuổi hoặc người dạy trò truyền thống bằng các fixture board cụ thể.

Search pass 2026-09-05 chưa tìm được authoritative exact Hao Rek instruction đủ để vượt Gate A/B/C.

---

## 10. Quyết định kỹ thuật tại 2026-09-05

**Không thay gameplay `MIN_REK_CHANH` trong research pass này.**

Current implementation tiếp tục tồn tại để compatibility/regression ổn định nhưng phải được gọi đúng là:

> **current project interpretation / pending historical validation**

Không được quảng bá global compulsory Rek hiện tại như historical fact.
