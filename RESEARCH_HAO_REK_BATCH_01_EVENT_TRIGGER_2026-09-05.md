# RESEARCH CHECKPOINT — Hao Rek event-trigger evidence — 2026-09-05

> **Scope:** checkpoint nhỏ để tránh mất research do timeout.  
> **Repo scope:** chỉ `machxanht/Rek-Khmer-Chess`.  
> **Engine impact:** **NONE — DO NOT CHANGE ENGINE / SPEC / TESTS FROM THIS FILE ALONE.**  
> **Parent note:** `RESEARCH_HAO_REK_2026.md`.

## 1. Vì sao có checkpoint này

Research Hao Rek đang đi theo nhiều nhánh archival/web/video. Để tránh một phiên dài bị timeout rồi mất các phát hiện chưa kịp ghi, từ checkpoint này research được chia thành batch nhỏ. Mỗi batch phải ghi:

- source / provenance;
- original Khmer nếu lấy được;
- literal Vietnamese translation;
- evidence label;
- claim nào được support;
- claim nào **không** được support;
- engine có đủ bằng chứng để đổi chưa.

## 2. Finding quan trọng nhất của batch: obligation có vẻ gắn với một hành động `បើកឲ្យរែក`

### H1-2013 — Khmer cultural/political article lineage

Trong phiên research 2026-09-05 đã truy được một bản đăng năm 2013, gắn tác giả **វិសាល ឧត្តម / Visal Odom** và ghi nguồn **ភ្នំពេញប៉ុស្តិ៍ (Phnom Penh Post)**. Bài dùng Rek làm phép so sánh chính trị nhưng trước phần bình luận có đoạn giải thích luật chơi.

Observed source URL:

- https://groups.google.com/g/samrainsyparty/c/sH2TuDyOL9c

Một bản đăng lại/cùng lineage về sau được thấy tại VOD:

- https://www.vodkhmer.news/2016/03/05/letter-to-editor-sam-rainsy-and-hun-sen-on-politics/

> **Retrieval note:** các URL trên đã được đọc trong phiên research; browser re-fetch có lúc timeout/cache-miss. Cần giữ chúng như source leads và nên lấy archived/full-text copy ở batch sau trước khi nâng confidence thêm.

### Original Khmer fragments observed

Các câu then chốt đã được đọc trong source lineage này:

> `បើមានគេបើកឲ្យរែក ខ្លួនត្រូវតែរែក`

Literal Vietnamese:

> “Nếu có người mở cho mình Rek, mình phải Rek.”

Và:

> `បើមិនរែក ត្រូវតែចាញ់ ដោយស្វ័យប្រវត្តិ`

Literal Vietnamese:

> “Nếu không Rek thì phải thua một cách tự động.”

Source còn mô tả chuỗi tiếp tục theo hướng người chơi phải Rek khi đối thủ tiếp tục `បើកឲ្យរែក`, và chuỗi chấm dứt khi đối thủ không tiếp tục mở cho Rek.

### Evidence classification

- **Source type:** Khmer secondary cultural/journalistic explanation.
- **Label cho event-trigger obligation:** `SECONDARY`.
- **Confidence:** medium-high cho claim hẹp rằng có một dạng rule `opponent opens for Rek -> responder must Rek -> refusal loses`.
- **Không dùng bài như một khối duy nhất:** cùng bài có chi tiết setup/piece-count không phù hợp với nguồn mạnh hơn 1 King + 15 Men; vì vậy evidence phải được đánh giá **theo từng claim**.

### Rule understanding affected

Finding này challenge trực tiếp current engine interpretation:

```text
current board has ANY Rek opportunity
-> quiet move forbidden / loss
```

Source language lại mô tả:

```text
opponent action
-> បើកឲ្យរែក (opens for Rek)
-> responder must Rek
-> ignore obligation = loss
```

Do đó candidate **event-triggered obligation** hiện có evidence tốt hơn trước.

### What this source DOES NOT prove

Source 2013 **không** đủ để chứng minh:

1. `បើកឲ្យរែក` chính xác là geometry nào trên board;
2. pair mở sẵn từ trước có exempt obligation hay không;
3. bắt buộc phải là một quân blocker đi ra để “mở” pair;
4. một move mở nhiều pair thì responder/caller chọn pair nào;
5. verbal call có bắt buộc hay chỉ là cách nói;
6. metadata call sống đúng 1 ply hay kéo dài;
7. quiet move phải bị reject như illegal move hay được chấp nhận rồi adjudicate loss.

## 3. Community signal chi tiết — không được tự nâng thành luật

### C1-2025 — user review `bou senghy`

User-generated Khmer review đã được đọc trước đó mô tả:

1. pair Rek vốn mở sẵn **không** tự tính là `ហៅ`;
2. nếu có một quân đang chắn/che rồi quân đó đi ra làm lộ pair thì mới tính là `ហៅ`;
3. nếu nhiều pair mở, responder có thể chọn pair;
4. nếu lời gọi chỉ tạo một pair thì pair đó bắt buộc phải Rek.

Classification:

`COMMUNITY SIGNAL — DETAILED, NOT AUTHORITATIVE`

Giá trị của signal này là nó đưa ra **board-transition hypothesis** cụ thể để đi tìm source độc lập. Nó không được dùng một mình để sửa SPEC hoặc engine.

## 4. Community/online historical leads trước app hiện đại

Trong cùng phiên research đã thấy thêm các dấu vết online Khmer cũ hơn app hiện tại:

- một first-person recollection khoảng **2010** kể việc chơi kiểu `មិនរែកចាញ់` và “mở cho đối thủ Rek” nhiều lần;
- một community explanation khoảng **2013** diễn đạt kiểu `A បើកអោយរែក B ... B មិនរែក ... B ចាញ់`;
- terminology `បើករែក`, `ហៅរែក`, `មិនរែកចាញ់` xuất hiện ngoài developer/app description.

Hiện các lead này **chưa được source-lock đầy đủ trong checkpoint này** (URL/full text phải truy lại ở batch sau).

Classification tạm thời:

`COMMUNITY SIGNAL / UNVERIFIED SOURCE LEAD`

Không dùng để nâng claim, nhưng chúng làm giảm khả năng hypothesis Hao Rek event-trigger chỉ là invention của một app mới.

## 5. Evidence matrix sau batch này

| Claim | Status sau batch | Ghi chú |
|---|---|---|
| Hao Rek/Min Rek Chanh có compulsory response | `SECONDARY` | source lineage 2013 mô tả `ត្រូវតែរែក` |
| Không đáp obligation thì thua | `SECONDARY` | mô tả `ចាញ់ដោយស្វ័យប្រវត្តិ` |
| Obligation liên quan hành động của opponent `បើកឲ្យរែក` | `SECONDARY` | mạnh hơn global board-state hypothesis |
| Pair mở sẵn không tạo obligation | `COMMUNITY SIGNAL` | chi tiết review 2025, chưa independent corroboration |
| Blocker đi ra mới tạo call | `COMMUNITY SIGNAL` | chưa có historical/independent board description |
| Responder chọn khi nhiều pair | `COMMUNITY SIGNAL` | chưa corroborate |
| Exact call lifetime | `UNVERIFIED` | chưa biết 1 ply hay chain-state semantics |
| Verbal call bắt buộc | `UNVERIFIED` | từ `ហៅ` không được suy ra requirement phát âm |
| Current global scan là historical truth | `ENGINE INTERPRETATION` | hiện bị event-trigger evidence challenge |

## 6. Engine decision sau batch này

**CHƯA SỬA ENGINE.**

Lý do: evidence hiện đủ để challenge current semantics nhưng chưa đủ để viết một replacement chính xác. Nếu code bây giờ sẽ chỉ thay một assumption bằng một assumption khác.

Candidate architecture chỉ được giữ ở mức hypothesis:

```text
opponent move
-> maybe creates active Hao Rek call
-> eligible response set
-> responder fulfills or violates
-> call expires / chains
```

Board state thuần túy có thể không đủ nếu pre-existing pair khác newly-opened pair, nhưng điều này vẫn phải được chứng minh độc lập.

## 7. Batch tiếp theo phải làm gì

Priority order:

1. source-lock/archival copy cho article lineage 2013 và kiểm tra bản Phnom Penh Post gốc;
2. search exact Khmer phrase `បើកឲ្យរែក` ở nguồn độc lập, đặc biệt trước 2013;
3. tìm board/video sequence đủ reconstruct để định nghĩa “open for Rek”;
4. tìm independent corroboration cho `pair đã mở sẵn != call`;
5. chỉ sau đó mới đánh giá có đạt evidence gate để update `RESEARCH_HAO_REK_2026.md` / `HUONG_DAN` hay chưa.

---

**Checkpoint conclusion:** core Hao Rek hypothesis đã chuyển từ “community-only” sang có **secondary evidence cho event-trigger obligation**, nhưng exact geometry/state semantics vẫn unresolved. **No gameplay change authorized.**
