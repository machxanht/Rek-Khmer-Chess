# RESEARCH NOTE: ហៅរែក (Hao Rek) / Min Rek Chanh — 2026

> **Ngày rà soát:** 2026-09-05  
> **Trạng thái:** `UNRESOLVED — DO NOT CHANGE ENGINE RULES FROM THIS NOTE ALONE`  
> **Scope:** exact trigger và nghĩa vụ phản hồi của **Hao Rek (ហៅរែក)** trong variant `MIN_REK_CHANH`.

Tài liệu này là **research note**, không phải rule specification. Nó không thay thế:

1. `HUONG_DAN_LUAT_CO_REK_KHMER.md`
2. `SPEC_ENGINE_CO_REK_KHMER.md`
3. regression tests của engine

Mục tiêu của note là ghi lại evidence mới, chỉ ra chỗ current engine có thể đang diễn giải quá rộng, và khóa các câu hỏi cần xác minh trước khi sửa luật.

---

## 1. Current engine đang làm gì?

Tại thời điểm note này được viết, `MIN_REK_CHANH` dùng **current project interpretation**:

- King đứng yên.
- Nếu bên đến lượt có **bất kỳ** nước Rek nào ở bất kỳ đâu trên bàn, toàn bộ quiet moves bị loại khỏi rule-legal set.
- Nếu người chơi gửi một quiet move hình học hợp lệ trong khi engine thấy có Rek ở chỗ khác, engine adjudicate đó là Hao Rek violation và xử thua ngay.

Điểm quan trọng: đây là **state-triggered global compulsory Rek** — nghĩa vụ phát sinh chỉ vì một Rek opportunity đang tồn tại trên bàn.

Research mới bên dưới cho thấy cách hiểu này **có khả năng không đúng với cách “ហៅរែក / gọi Rek” truyền thống**, nhưng evidence hiện tại chưa đủ mạnh để thay engine.

---

## 2. Evidence mới

### E1 — Native Khmer player correction, Google Play review — 2025-02-16

Nguồn:

- Google Play, app `Rek (ល្បែងរែក)`, review của **bou senghy**, ngày 2025-02-16.
- https://play.google.com/store/apps/details?id=com.nagastudios.rek

Review này mô tả chi tiết ba điểm có ý nghĩa trực tiếp với exact Hao Rek trigger:

1. **Một cặp Rek đã mở sẵn không tự động được tính là “gọi Rek”.**
2. Một tình huống được tính là “gọi” khi trước đó có quân che/chặn phía trước, rồi quân đó **đi ra và làm lộ** cơ hội Rek.
3. Nếu có nhiều cặp Rek đang mở, bên phải đi Rek có quyền chọn cặp để ăn; bên gọi không được tùy ý chỉ định cặp nào. Nếu lời gọi chỉ tạo ra **một** cặp, cặp đó phải được Rek và không được né.

### Đánh giá evidence

- **Giá trị:** rất cao về mặt chi tiết kỹ thuật vì tác giả viết bằng Khmer và sửa đúng các edge case mà current engine đang thiếu.
- **Hạn chế:** đây vẫn là **một community review**, không phải rulebook, giáo trình, tổ chức văn hóa hay lời giải thích từ nhiều cao thủ độc lập.
- **Kết luận:** đủ mạnh để **đặt current global compulsory interpretation vào trạng thái nghi vấn**, nhưng chưa đủ để thay historical rule contract.

---

### E2 — Independent native criticism, Google Play review — 2026-06-08

Nguồn:

- Cùng listing Google Play, review của **UN BUNTHEN**, ngày 2026-06-08.
- https://play.google.com/store/apps/details?id=com.nagastudios.rek

Review này nói rằng phần **ក្បួនហៅរែក / rule of calling Rek** trong app được sắp/triển khai sai và nên được sửa để tránh làm sai lệch Rek Khmer.

### Đánh giá evidence

- Đây là một tín hiệu **độc lập** rằng implementation Hao Rek phổ biến trên app không nên được mặc định xem là chuẩn.
- Review không cung cấp đủ thuật toán/edge case để tự nó xác định replacement rule.
- Nó củng cố quyết định **không coi app implementation là source of truth**.

---

### E3 — App/developer description về Min Rek Chanh

Nguồn:

- Google Play: https://play.google.com/store/apps/details?id=com.nagastudios.rek
- Apple App Store: https://apps.apple.com/kh/app/rek/id928419019

Developer description nói rằng:

- Min Rek Chanh là style trong đó người chơi có thể “taunt/order” đối thủ Rek.
- King không di chuyển.
- Một “order of Rek” phải được tôn trọng; không làm theo thì thua.
- Chuỗi sacrifice/order là trọng tâm chiến thuật của variant.

### Đánh giá evidence

Repo này đã khóa policy rằng **game/app store description không được dùng làm positive rule evidence**. Vì vậy E3 chỉ có vai trò:

- xác nhận terminology “taunt/order/call Rek” tồn tại trong mô tả phổ biến;
- cho thấy nghĩa vụ có vẻ liên quan tới **một hành vi gọi/order**, chứ không đơn thuần là mọi trạng thái có thể Rek;
- **không** được dùng để tự động sửa engine.

---

### E4 — Khmer dictionary-derived definition của “រែក”

Nguồn:

- Phkasla Partner, mục từ Khmer “រែក”: https://phkaslapartner.com/learn/khmerwords-7764/
- Nội dung được trình bày như giải nghĩa từ điển Khmer.

Nguồn này hỗ trợ phần core Rek nói chung: đây là một trò chơi Khmer tương tự chess/chatrang, có kiểu ăn hai phía và kiểu vây/bí.

Nó **không mô tả exact Hao Rek trigger**, vì vậy không giải quyết tranh chấp hiện tại.

---

## 3. Kết luận research hiện tại

### Điều có thể nói với độ tin cậy cao

- Không có đủ evidence để tiếp tục tuyên bố rằng **“hễ tồn tại bất kỳ Rek nào trên bàn thì bắt buộc phải Rek”** là historical Hao Rek rule.
- Có native Khmer evidence cụ thể cho thấy **pre-existing open Rek pair có thể không phải là lời gọi**.
- Evidence đó mô tả Hao Rek giống một **event-triggered obligation**: một nước đi làm lộ/tạo lời gọi Rek.
- App descriptions không đủ tư cách làm source of truth, và ngay trên listing app có native reviewers phản đối cách implementation Hao Rek.

### Điều CHƯA được xác nhận đủ để code

Chưa được nâng thành rule contract các giả thuyết sau:

- **H1 — Event trigger:** Hao Rek chỉ phát sinh khi một nước đi cụ thể làm lộ một cặp Rek trước đó bị che.
- **H2 — Pre-existing pair:** cặp Rek mở sẵn trước lời gọi không tạo nghĩa vụ.
- **H3 — Multiple pairs:** nếu responder có nhiều cặp Rek, responder được tự chọn cặp ăn.
- **H4 — Single called pair:** nếu lời gọi chỉ để lại đúng một cặp hợp lệ, responder bắt buộc phải ăn cặp đó.

Bốn giả thuyết này phù hợp với E1 nhưng **chưa đủ independent authoritative corroboration** để đưa vào `SPEC_ENGINE_CO_REK_KHMER.md`.

---

## 4. Vì sao KHÔNG sửa engine ngay?

Nếu đổi từ global state-trigger sang event-trigger ngay bây giờ, project phải trả lời thêm nhiều câu hỏi mà nguồn hiện tại chưa khóa được:

1. “Quân che phía trước” được định nghĩa hình học chính xác thế nào?
2. Lời gọi có gắn với **một destination**, một pair, hay chỉ với trạng thái sau nước đi?
3. Nếu một nước làm lộ hai hoặc nhiều cặp trên hai trục thì obligation là gì?
4. Nếu đồng thời có một pre-existing pair và một newly-called pair, responder được chọn pair nào?
5. Nghĩa vụ tồn tại trong đúng một ply hay kéo dài tới khi pair được ăn/mất?
6. Nếu called pair bị chặn bởi một rule khác hoặc không còn legal vì thay đổi board, xử thế nào?
7. Poat có được phép xảy ra trong cùng response hay Min Rek Chanh thực sự chỉ cho capture bằng Rek?
8. “Không đáp lời gọi thì thua” được adjudicate lúc submit một nước khác hay tại một thời điểm khác?

Sửa code khi chưa trả lời được các câu này sẽ chỉ thay một giả định bằng một giả định khác.

---

## 5. Evidence gate trước khi thay luật

Chỉ nên sửa exact Hao Rek semantics khi đạt ít nhất một trong các ngưỡng sau:

### Gate A — Tài liệu authoritative

Có rulebook/giáo trình/bản ghi văn hóa Khmer mô tả rõ trigger + response, đủ để dựng test cases.

### Gate B — Hai nguồn native độc lập có mô tả thuật toán

Ít nhất hai người/nguồn Khmer độc lập, không chỉ nói “app sai”, mà cùng mô tả được:

- cách tạo lời gọi;
- cách chọn response khi nhiều pair;
- điều kiện thua do không đáp;
- ít nhất một sequence ví dụ có thể tái tạo trên bàn.

### Gate C — Expert validation

Một người chơi/giảng dạy Rek Khmer có uy tín xác nhận trực tiếp các edge case ở mục 4 bằng ví dụ bàn cờ.

---

## 6. Bộ regression cần viết NGAY KHI evidence đủ

Khi vượt evidence gate, update theo đúng thứ tự:

`HUONG_DAN_LUAT_CO_REK_KHMER.md` → `SPEC_ENGINE_CO_REK_KHMER.md` → tests → engine → AI/tournament.

Candidate tests phải khóa tối thiểu:

1. `HAO-EVENT-01` — pre-existing open Rek pair không tự tạo call.
2. `HAO-EVENT-02` — một nước đi làm lộ pair tạo call.
3. `HAO-RESP-01` — single called pair bắt buộc phải Rek.
4. `HAO-RESP-02` — multiple eligible pairs cho responder quyền chọn theo rule đã xác minh.
5. `HAO-RESP-03` — quiet response khi có active call bị adjudicate đúng cách.
6. `HAO-LIFETIME-01` — lifetime/expiry của active call.
7. `HAO-MULTIAXIS-01` — một nước gọi tạo nhiều trục/pair.
8. `HAO-POAT-01` — interaction giữa called Rek và Poat.
9. serialization/replay test nếu active Hao Rek cần trở thành stateful metadata.
10. AI boundary test để AI chỉ consume engine-owned active-call legality.

Nếu exact Hao Rek là **event-based**, engine gần như chắc chắn sẽ cần lưu thêm state metadata về call vừa được tạo; không được suy ra obligation chỉ từ board hiện tại.

---

## 7. Quyết định kỹ thuật tại ngày 2026-09-05

**Không thay gameplay trong `MIN_REK_CHANH` ở research pass này.**

Current implementation vẫn được giữ để compatibility/regression ổn định, nhưng phải được gọi đúng tên là:

> **current project interpretation / pending historical validation**

Không được quảng bá global compulsory Rek hiện tại như một historical fact.

Research priority tiếp theo: tìm thêm **một nguồn Khmer độc lập có sequence ví dụ cụ thể** hoặc rulebook/archival instruction đủ để vượt evidence gate.
