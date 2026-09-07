# RESEARCH LUẬT REK KHMER — Evidence Matrix 2026

> **Ngày rà soát:** 2026-09-05  
> **Mục đích:** tách rule evidence khỏi engine implementation và ghi rõ mức độ tin cậy của từng luật.  
> **Không phải SPEC:** tài liệu này không tự động thay đổi gameplay.

---

## 1. Source policy

### Tier A — Native / institutional / primary-like evidence

Ưu tiên cao nhất:

- Buddhist Institute / Chuon Nath;
- MoEYS Digital School;
- Center for Khmer Studies catalog + original holdings;
- Ministry of Culture / institutional archives;
- original Khmer books/scans;
- archival publications such as `កម្ពុជសុរិយា` khi truy được bài gốc.

### Tier B — Independent cultural/educational source

Nguồn không phải rulebook nhưng độc lập với app/game implementation, ví dụ tài liệu văn hóa/giáo dục có mô tả Rek.

### Tier C — Secondary reconstruction

Nguồn game-history/board-game research có thể hỗ trợ setup/movement/capture interpretation, nhưng không được nâng lên ngang native rule text nếu chưa có corroboration.

### Tier D — Community signal

Comment/review, forum post, oral anecdote chưa được xác minh.

Dùng để:

- phát hiện edge case;
- tìm từ khóa Khmer;
- tạo board fixtures để hỏi người chơi khác.

Không dùng một mình để khóa SPEC.

### EXCLUDED

Không dùng làm positive rule evidence:

- Google Play / Apple App Store developer descriptions;
- app tutorial/screenshot;
- app behavior;
- scraper/copy của store description.

Comment của người dùng **bên dưới app** được phép ghi riêng như `COMMUNITY SIGNAL`, nhưng storefront/app không trở thành rule source vì vậy.

---

## 2. Source registry

### S1 — Chuon Nath / Buddhist Institute dictionary tradition

Mirror Khmer hiện truy được:

https://phkaslapartner.com/learn/khmerwords-7764/

Trang ghi rõ phần giải nghĩa được lấy từ `វចនានុក្រមខ្មែរ` của Samdech Chuon Nath / Buddhist Institute.

Mục `រែក` cho biết:

- Rek là một trò chơi tương tự `ចត្រង្គ` nhưng khác tên quân và thắng/thua;
- có `ស៊ីរែកទាំងពីរខាង` — ăn/bắt hai phía;
- khi một bên `ទាល់ច្រក`, bên kia có thể `កៀរ/ក្រសោប` để bắt;
- Rek được nhắc như trò dành cho quân lính tương tự Chaktrang.

**Tác động:** nguồn native mạnh nhất hiện có cho core Rek + trapping/encirclement concept.

**Chưa chứng minh:** exact setup, exact movement distance, Hao Rek, draw, Rek-4 simultaneity.

Confidence: `CONFIRMED CORE CONCEPT`.

---

### S2 — Sun-Him Chhim, *Introduction to Cambodian Culture* (1987)

ERIC:

https://eric.ed.gov/?id=ED334342

Direct indexed PDF:

https://hslb.org/wp-content/uploads/Cambodian-American-Collection/Building-Community/Cultural-Reproduction/Public/Introduction-to-Cambodian-Culture1-1.pdf

CKS catalog bản gộp 1989:

https://library.khmerstudies.org/bib/14710

Section `V. REK`, page 48 xác nhận:

- board 8×8;
- hai bên, mỗi bên 1 King + 15 soldiers;
- một quân được đi mỗi lượt;
- mục tiêu capture opposing King.

Nguồn còn nêu claim Rek bắt đầu khoảng thế kỷ II, nhưng claim này **chưa có independent historical corroboration**, nên không đưa vào canonical guide như fact.

Confidence: `STRONG INDEPENDENT CULTURAL SOURCE` cho board/army/objective.

---

### S3 — Buddhist Institute, *ល្បែងប្រជាប្រិយខ្មែរ* (1964)

MoEYS Digital School:

https://sala.moeys.gov.kh/kh/library/00002631

CKS catalog:

https://library.khmerstudies.org/bib/6505

Bibliographic corroboration khác:

https://ci.nii.ac.jp/ncid/BA64035767

Nguồn Khmer hiện đại trích danh sách 22 trò trong sách:

https://thmeythmey.com/detail/135581

Danh sách 22 trò **không có `ល្បែងរែក`**; có `ល្បែងចត្រង្គ`.

Vì vậy:

- đây là source authoritative cho context bảo tồn folk games Khmer;
- **không được cite như direct Rek rule source** nếu chưa tìm thấy trang scan riêng về Rek;
- absence của Rek trong danh sách còn là lý do phải tránh suy diễn rằng mọi sách folk games của Buddhist Institute đều bao phủ Rek.

Confidence: `AUTHORITATIVE CONTEXT / NOT DIRECT REK EVIDENCE`.

---

### S4 — *ប្រជុំវប្បធម៌ទូទៅ* — Luch Plaeng, 1973

Web transcription:

https://savenkhknowlege.blogspot.com/2013/07/blog-post_5384.html

Transcription tự ghi metadata:

- author `ឡុច ផ្លែង`;
- publisher `វិទ្យាស្ថានជាតិខេមរយានកម្ម`;
- Phnom Penh, 1973.

Danh sách trò Khmer trong transcription có `ល្បែងរែក`.

Điều này hỗ trợ **cultural existence** của Rek trong compilation được gán cho năm 1973, nhưng vì chưa truy được original scan nên:

- không dùng để xác nhận mechanics;
- không dùng để xác nhận Hao Rek.

Confidence: `HISTORICAL CORROBORATION ONLY`.

---

### S5 — Sabay Khmer article

https://news.sabay.com.kh/article/1045095

Bài Khmer nhắc Rek tương tự Chaktrang nhưng khác quân/thắng thua; có ăn hai phía và khi một bên bị bí thì bên kia có thể bao/bắt.

Nội dung này gần với wording Chuon Nath nên dùng như **secondary Khmer corroboration**, không phải primary rulebook.

Confidence: `SECONDARY KHMER CORROBORATION`.

---

### S6 — Secondary game-history reconstruction

Các nguồn reconstruction phi-app hỗ trợ mạnh cho:

- 8×8;
- 16 quân/bên;
- 7 men ở rear row + King ở cực trái/phải second row + 8 men front row;
- regular Rek pieces move orthogonally any unobstructed distance;
- intervention capture;
- surround capture trên piece/group và board edge.

Nhóm này hữu ích để corroborate setup user đã xác nhận và movement hiện tại, nhưng vẫn là secondary.

Confidence: `STRONG SECONDARY`, không thay native source.

---

## 3. Community comparison — không phải evidence tier chính

### CS1 — Google Play user comment `bou senghy`, 2025-02-16

Comment Khmer phản biện implementation Hao Rek và mô tả candidate semantics:

- pre-existing open pair không tự được tính là call;
- call có thể phát sinh khi quân che rời đi làm lộ pair;
- khi nhiều pair mở, responder có thể được quyền chọn;
- khi call chỉ tạo một pair, pair đó phải được Rek.

Classification: `COMMUNITY SIGNAL — DETAILED`.

Không dùng để sửa engine nếu chưa corroborate ngoài storefront.

### CS2 — Google Play user comment `UN BUNTHEN`, 2026-06-08

Comment nói `ក្បួនហៅរែក` trong app đang sắp/implement sai.

Classification: `COMMUNITY SIGNAL — IMPLEMENTATION DISPUTED`.

Không đủ chi tiết để định nghĩa replacement rule.

### CS3 — Apple App Store indexed reviews

Search pass hiện thấy chủ yếu:

- bug/network khi Hao Rek;
- lỗi/single-player;
- nhận xét chung.

Không có rule sequence chi tiết độc lập corroborate CS1 trong tập review đã index.

Classification: `NO SEMANTIC CORROBORATION FOUND`.

---

## 4. Rule evidence matrix

| Rule / behavior | Status 2026-09-05 | Evidence basis | Engine action |
|---|---|---|---|
| Rek là trò Khmer truyền thống | CONFIRMED | S1 + S2 + S4/S5 | Giữ |
| Board 8×8 | STRONG | S2 + secondary reconstruction | Giữ |
| 1 King + 15 Men mỗi bên | STRONG | S2 + secondary reconstruction | Giữ |
| Mỗi lượt đi một quân | STRONG | S2 | Giữ |
| Mục tiêu capture King | STRONG | S2 + secondary | Giữ |
| Regular Rek movement trực giao nhiều ô, không jump | STRONG SECONDARY | reconstruction + current project setup tests | Giữ, không gọi primary-confirmed |
| Setup 7 + King + 8 với King a2/h7 theo orientation project | STRONG SECONDARY + PROJECT-CONFIRMED | reconstruction + user-confirmed board + regression | Giữ |
| Rek bắt hai phía | CONFIRMED | S1 | Giữ |
| Rek có thể bắt đồng thời 4 trên hai trục | INFERRED | geometric extension, chưa native-confirmed | Giữ implementation nhưng label inferred |
| Có capture do bị bí/bao | CONFIRMED CONCEPT | S1 + S5 | Giữ concept |
| Poat = connected group + zero orthogonal liberties + edge wall | STRONG ENGINE INTERPRETATION | native concept + secondary reconstruction | Giữ, tiếp tục tìm primary detail |
| Rek xử trước Poat tự động trong cùng move | UNVERIFIED ORDERING | engine contract | Không quảng bá historical fact |
| `MIN_REK_CHANH` tồn tại như variant | STRONG SECONDARY / COMMUNITY KNOWN | non-app secondary mention; terminology widespread | Giữ variant label, tiếp tục primary search |
| King stationary trong Min | STRONG SECONDARY, NOT NATIVE-CONFIRMED | non-app reconstruction; app descriptions excluded | Giữ current contract, tiếp tục verify |
| Bất kỳ Rek nào trên board => compulsory | UNVERIFIED / DISPUTED | current engine; CS1 mâu thuẫn | Không đổi chưa đủ evidence |
| Hao Rek event-triggered khi làm lộ pair | UNVERIFIED HYPOTHESIS | CS1 | Không code |
| Multiple Rek pairs => responder tự chọn | UNVERIFIED HYPOTHESIS | CS1 | Không code |
| Không đáp Hao Rek => instant loss | UNVERIFIED exact adjudication | chưa authoritative | Không đổi chưa đủ evidence |
| Poat hoạt động trong Min | UNVERIFIED | current engine only | Không gọi traditional truth |
| Opponent zero legal moves => instant win | UNVERIFIED / POSSIBLE CONFLATION | native source nói stuck/encircled capture | Audit sau |
| Threefold repetition | UNSUPPORTED TRADITIONAL CLAIM | không tìm được Rek-specific source | Xem là project extension |
| Lone-King 32 | UNSUPPORTED TRADITIONAL CLAIM | không tìm được Rek-specific source | Xem là project extension |

---

## 5. Các điểm gameplay đã đủ an toàn để xây UI quanh chúng

UI/server có thể coi những phần sau là ổn định ở cấp project contract:

1. board 8×8;
2. 16 quân/bên;
3. canonical project setup đã test;
4. regular Standard movement trực giao;
5. Rek capture hai phía;
6. Poat hiện do engine sở hữu;
7. capture King quyết định trận theo current contract;
8. `REK_STANDARD` là canonical default ruleset;
9. `MIN_REK_CHANH` phải được hiển thị là variant đang còn historical validation cho exact Hao Rek.

UI **không được tự viết** Hao Rek/Poat logic dựa trên text docs.

---

## 6. Những thứ không được gọi là “luật Khmer chuẩn” lúc này

Không dùng wording kiểu `100% traditional/canonical` cho:

- global compulsory Rek;
- event-triggered Hao Rek hypothesis;
- Rek-4 simultaneity;
- exact Rek→Poat order;
- zero-move instant win;
- threefold draw;
- lone-King 32;
- Poat trong Min Rek Chanh;
- bất kỳ historical origin date cụ thể nào như “thế kỷ II” nếu chưa có corroboration khác.

---

## 7. Research gaps còn mở

### G1 — Original Chuon Nath scan

Cần original Buddhist Institute/dictionary scan cho mục `រែក`, thay vì chỉ mirror.

### G2 — Original 1973 compilation

Cần original `ប្រជុំវប្បធម៌ទូទៅ` để biết Rek chỉ được liệt kê hay có section riêng.

### G3 — `កម្ពុជសុរិយា`

Tra index/bản scan theo từ khóa:

- `រែក`
- `ល្បែងរែក`
- `ស៊ីរែក`
- `ហៅរែក`
- `មិនរែកចាញ់`

### G4 — Real-board Hao Rek sequence

Cần video/oral explanation có thể reconstruct:

- board trước call;
- move tạo call;
- response choices;
- capture result;
- lời gọi nếu audible.

### G5 — Min Rek Chanh details

Cần independent native evidence cho:

- exact Hao Rek trigger;
- King immobility;
- Poat availability;
- multi-pair choice;
- immediate-loss semantics;
- chain calls;
- win condition.

### G6 — Draw/endgame

Cần Rek-specific source trước khi gọi threefold/lone-King counters là traditional.

---

## 8. Evidence gate cho future rule changes

Rule historical chỉ được promote khi đạt một trong các gate:

### Gate A

Authoritative Khmer text đủ cụ thể để dựng board tests.

### Gate B

Hai nguồn native độc lập, ngoài app implementation, cùng mô tả được board sequence/edge case.

### Gate C

Expert Khmer player/teacher xác nhận board fixtures trực tiếp và lời giải có thể tái tạo.

Community comments chỉ tạo hypothesis; **không tự vượt gate**.

---

## 9. Quy trình nếu tìm được evidence mới

Không sửa code trước docs.

Thứ tự bắt buộc:

1. cập nhật research note + source metadata;
2. cập nhật `HUONG_DAN_LUAT_CO_REK_KHMER.md` và confidence;
3. nếu rule đủ evidence, cập nhật `SPEC_ENGINE_CO_REK_KHMER.md`;
4. viết regression tests từ board examples;
5. sửa core engine;
6. verify AI chỉ consume engine legality;
7. tournament + snapshot/replay regression;
8. merge khi CI xanh.

---

## 10. Kết luận pass 2026-09-05

Core Rek hiện có nền evidence khá tốt cho:

- identity/traditional existence;
- 8×8, 16 quân/bên;
- capture King objective;
- two-sided Rek;
- trapping/encirclement concept;
- project setup/movement ở mức strong secondary.

Rủi ro rule lớn nhất vẫn là **exact Hao Rek / Min Rek Chanh semantics**.

Community comments bên dưới app cho tín hiệu rất đáng nghiên cứu rằng current global compulsory implementation có thể quá rộng, nhưng **chưa đủ để sửa engine**.

Vì vậy gameplay `MIN_REK_CHANH` tiếp tục là **current project interpretation / pending historical validation** cho tới khi vượt evidence gate.
