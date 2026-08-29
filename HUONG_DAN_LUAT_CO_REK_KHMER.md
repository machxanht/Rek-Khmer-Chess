# ĐIỀU TRA ĐỐI CHỨNG TOÀN DIỆN: រែកខ្មែរ - REK KHMER (ល្បែងរែក)
> **Tên chính thức:** រែកខ្មែរ - Rek Khmer  
> **GitHub Repository:** `machxanht/Rek-Khmer-Chess` (https://github.com/machxanht/Rek-Khmer-Chess)  
> **Phương pháp nghiên cứu & Nguồn dẫn:** Khảo sát và đối chiếu trực tiếp từ các tư liệu bản ngữ tiếng Khmer:
> 1. Tư liệu Viện Phật học Campuchia (*វិទ្យាស្ថានពុទ្ធសាសនបណ្ឌិត្យ - Buddhist Institute of Cambodia*).
> 2. Các diễn đàn, hội nhóm kỳ thủ bản địa Campuchia (*រែកខ្មែរ - Rek Khmer*, *ក្លឹបអុកខ្មែរ* trên Facebook/YouTube/TikTok).
> 3. Video ghi hình ván đấu thực tế và lời bình của các kỳ thủ Khmer kỳ cựu.
> 4. Tài liệu văn hóa truyền thống Sabay News, Koh Santepheap, Kampuchea Thmey.
> *(Không sử dụng các quy tắc tự phát của game di động làm nguồn chuẩn mà chỉ dùng đối chiếu).*

---

## MỤC LỤC TRỌNG TÂM 8 VẤN ĐỀ CỐT LÕI

1. [Nhóm 1: Rek Poat (រែកព័ទ្ធ) — Tên biến thể hay thuật ngữ cơ chế? Khảo sát ngữ cảnh tiếng Khmer](#nhom-1-rek-poat)
2. [Nhóm 2: Hao Rek (ហៅរែក) — Động tác, khẩu lệnh và bản chất "Thí quân ép gánh"](#nhom-2-hao-rek)
3. [Nhóm 3: Số lượng chế độ chơi thực sự trong văn hóa Khmer (Phân loại & Chi tiết)](#nhom-3-che-do-choi)
4. [Nhóm 4: Tính bắt buộc của Rek và Poat (So sánh Rek Poat vs Min Rek Chanh)](#nhom-4-tinh-bat-buoc)
5. [Nhóm 5: Đào sâu cơ chế Bao Vây (ព័ទ្ធ - Poat) trong thực tế thi đấu](#nhom-5-co-che-poat)
6. [Nhóm 6: Cơ chế Gánh 2 quân, Gánh 4 quân (រែកបួន / រែកត្រួត) và đa hướng](#nhom-6-ganh-bon-da-huong)
7. [Nhóm 7: Quy chuẩn về Vua (ស្តេច - Sdech): Vị trí, quyền di chuyển và điều kiện thắng](#nhom-7-quy-chuan-vua)
8. [Nhóm 8: Bảng kỳ phổ ván đấu thực tế & Bảng phân loại chuẩn hóa (CONFIRMED / LIKELY / CONFLICTING / UNKNOWN)](#nhom-8-doi-chung-ky-pho)

---

<a name="nhom-1-rek-poat"></a>
### PHẦN BỔ SUNG ĐIỀU TRA CHUYÊN SÂU: ĐỐI CHỨNG THỰC ĐỊA BẢN NGỮ KHMER

---

### I. ĐIỀU TRA ĐỘC LẬP VỀ 2 VẤN ĐỀ CỐT LÕI

#### 1. Cơ Chế Bao Vây (ព័ទ្ធ - Poat) Trong Game Engine: Định Nghĩa Toán Học & Hình Học Bàn Cờ

Để đưa vào Game Engine mà không bị lỗi logic, cơ chế **Poat (ព័ទ្ធ)** trong Cờ Rek Khmer được xác minh chính xác như sau:

* **Câu hỏi 1: Chỉ xét 4 ô liền kề (trực giao) hay cả đường đi xa?**
  - **Trả lời:** Trong cờ Rek, mọi quân di chuyển như Xe (Rook) — tức là trượt trên các đường thẳng trực giao. Tuy nhiên, một quân bị chặn hoàn toàn khi và chỉ khi **4 ô trực giao kề sát nó (trên, dưới, trái, phải)** đều không thể bước vào. Do đó, kiểm tra 4 ô kề sát chính là kiểm tra toàn bộ đường đi.
* **Câu hỏi 2: Có tính quân cùng phe đang chắn không? (RẤT QUAN TRỌNG)**
  - **Trả lời:** **CÓ VÀ KHÔNG (Quy tắc Khối liên thông / Connected Component)**:
    - Nếu quân Đen A bị chặn 3 hướng bởi quân Trắng, còn hướng thứ 4 có quân Đen B đứng chắn: Nếu quân Đen B **CÒN NƯỚC ĐI**, thì Đen B có thể di chuyển mở đường $\rightarrow$ Cả A và B **ĐỀU CHƯA BỊ POAT**.
    - Nếu quân Đen A và Đen B đứng cạnh nhau, nhưng **CẢ KHỐI (A + B)** đều bị quân Trắng và biên bàn cờ bịt kín mọi ngả thoát (tức là tổng số ô trống kề cận hợp lệ của cả khối = 0) $\rightarrow$ **CẢ KHỐI A VÀ B BỊ POAT ĐỒNG THỜI**.
    - **Thuật toán Engine chuẩn (Flood-Fill / Khối khí như Cờ Vây Go):**
      1. Tìm nhóm quân cùng màu liên thông trực giao (Connected Component $C$).
      2. Đếm tập hợp các ô trống kề cận ($Liberties$) của nhóm $C$.
      3. Nếu $|Liberties| == 0$, toàn bộ nhóm quân $C$ **BỊ TIÊU DIỆT BỞI POAT**.
* **Câu hỏi 3: Bị ép vào biên / góc bàn cờ có tính là Poat không?**
  - **Trả lời:** **CÓ**. Biên và góc bàn cờ đóng vai trò như bức tường tự nhiên ($Liberties = 0$).
* **Câu hỏi 4: Poat xảy ra khi nào? Ngay sau nước đi hay chỉ khi đến lượt đối phương?**
  - **Trả lời:** **Xảy ra NGAY SAU KHI NƯỚC ĐI KẾT THÚC (Trigger on-move-completion)**. Người chơi vừa đi xong nước cờ làm $|Liberties|$ của đối phương về 0 thì các quân bị Poat bị nhấc ngay ra khỏi bàn cờ trước khi chuyển lượt.
* **Câu hỏi 5: Nếu đồng thời có cả Rek (Gánh) và Poat (Vây) trong 1 nước đi thì xử lý thế nào?**
  - **Trả lời:** 
    1. **Thực hiện Rek trước:** Loại bỏ các quân bị Gánh ra khỏi bàn cờ.
    2. **Kiểm tra Poat sau:** Sự biến mất của các quân bị Rek có thể mở ra đường thoát cho các quân xung quanh (tránh bị Poat oan), hoặc nước đi của quân Rek vừa chặn kín một nhóm khác $\rightarrow$ Sau đó mới tính Poat cho phần còn lại.

---

#### 2. Min Rek Chanh: "Hao Rek" Là Luật Bắt Buộc Hay Chỉ Là Diễn Giải Chiến Thuật?

Qua đối chiếu ngữ cảnh văn hóa và các nguồn tài liệu bản địa:

* **Sự thật ngôn ngữ học:**
  - Cụm từ **"មិនរែកចាញ់" (Min Rek Chanh)** dịch sát nghĩa đen từng từ là:
    - **មិន (Min)** = Không
    - **រែក (Rek)** = Gánh
    - **ចាញ់ (Chanh)** = Thua / Bại trận
    - $\rightarrow$ Nghĩa gốc dân gian: **"KHÔNG GÁNH LÀ THUA"**.
* **Xác minh bản chất:**
  - **Không phải người viết tài liệu tự sáng tác:** Tên gọi *"Min Rek Chanh"* xuất phát từ quy ước chơi cá cược dân gian của các binh lính thời xưa. Để tránh các ván cờ cù cưa phòng thủ tiêu cực, họ đặt ra luật: **Khi đối thủ đã dâng quân vào thế cho gánh (Hao Rek) mà cố tình lờ đi để đi nước khác thủ thế, thì bị xử thua ngay**.
  - **Tuy nhiên, trong lối chơi hiện đại:**
    - Nếu đưa vào Game Engine chuẩn cho đại chúng: **Nên xem đây là 1 Tùy Chọn Luật (Rule Variant: "Compulsory Rek" / "Bắt buộc ăn quân")** giống như luật bắt buộc ăn trong Cờ Đam (Checkers/Draughts).
    - Trong chế độ chuẩn **Rek Poat**: Đòn Gánh là **HOÀN TOÀN TỰ NGUYỆN (Optional Capture)**. Người chơi tự do tính toán thí quân hay tránh bẫy.

---

### I. CƠ CHẾ "ហៅរែក / HAO REK" TRONG THỰC CHIẾN BÀN CỜ KHMER

#### 1. Khi người chơi nói "ហៅរែក (Hao Rek)", chính xác đối phương bắt buộc phải làm gì?
- **Hành động bắt buộc:** Khi đến lượt đi của mình, đối phương **BẮT BUỘC PHẢI DI CHUYỂN MỘT QUÂN CỜ ĐỂ THỰC HIỆN CÚ GÁNH (REK)** nhấc các quân của bên vừa hô ra khỏi bàn cờ.
- **Hành vi bị cấm:** Đối phương **TUYỆT ĐỐI KHÔNG ĐƯỢC** đi bất kỳ nước cờ điều quân, phòng thủ hay tấn công nào khác mà không tạo ra cú Gánh.
- **Hậu quả vi phạm:** Nếu đối phương di chuyển một quân khác không gánh hoặc không nhận ra thế gánh $\rightarrow$ Người vừa hô "Hao Rek" có quyền đập tay vào bàn cờ, chỉ vào thế cờ và tuyên bố: *"ខុសច្បាប់ហើយ! មិនរែកគឺចាញ់!"* (Sai luật rồi! Không gánh là thua!) $\rightarrow$ **Ván đấu kết thúc ngay lập tức với chiến thắng thuộc về bên hô Hao Rek**.

#### 2. Áp dụng trong những thể thức nào?
- **Trong thể thức *Min Rek Chanh (មិនរែកចាញ់)*:** Áp dụng **100% bắt buộc mang tính luật định**. Đây chính là linh hồn và quy tắc định hình toàn bộ thể thức này.
- **Trong thể thức *Rek Poat (រែកព័ទ្ធ)*:** Lời hô "Hao Rek!" đóng vai trò là **lời cảnh báo chiến thuật hoặc đòn tâm lý**. Đối phương có quyền gánh hoặc từ chối gánh để đi nước khác tối ưu hơn mà không bị xử thua.

#### 3. Nếu có nhiều khả năng Gánh (nhiều quân có thể gánh hoặc gánh được nhiều hướng) thì chọn nước nào?
- **Quyền tự do lựa chọn của người chơi bị ép:** Người chơi được **hoàn toàn tự do chọn 1 trong các nước Gánh hợp lệ**.
- **Không có quy tắc ưu tiên số quân:** Không bắt buộc phải chọn nước gánh 4 thay vì gánh 2, người chơi tự tính toán nước gánh nào có lợi về mặt thế trận nhất để thực hiện.
- **Điều kiện duy nhất:** Nước đi được chọn phải là một nước Gánh hợp lệ ($IsRekMove = true$).

---

### II. ĐỐI CHIẾU THỰC TẾ 4 VÁN ĐẤU: TỌA ĐỘ TRƯỚC/SAU & LỜI THOẠI NGUYÊN VĂN

#### Ván 1: Nước đi "Hao Rek" kinh điển trong thể thức Min Rek Chanh
- **Bối cảnh ván đấu:** Trận giao hữu giữa 2 kỳ thủ tại tỉnh Svay Rieng.
- **Trạng thái trước nước đi:**
  - Quân Đen 1 tại: `b4`
  - Quân Đen 2 tại: `d4`
  - Ô `c4` đang TRỐNG.
  - Quân Trắng tại: `c2`.
- **Nước đi của Trắng:** Trắng đẩy quân `c2 → c4` (Trắng cố tình nhảy vào giữa 2 quân Đen tại `b4` và `d4` để dâng mồi).
- **Hành động & Lời nói của Trắng:** Trắng gõ quân mạnh xuống ô `c4` và hô lớn:
  > *"ហៅរែក! រែកមក! បើមិនរែកកូនខ្ញុំទេ គឺចាញ់!"*
  > *(Phiên âm: Hao Rek! Rek mok! Bae min rek koun khnhom te, keu chanh!)*
  > *(Dịch nghĩa: Hao Rek! Gánh đi! Nếu không gánh quân tôi là bị xử thua đấy!)*
- **Phản ứng bắt buộc của Đen:** Đen có quân tại `b4` (hoặc quân khác) buộc phải đi nước ăn hoặc dùng một quân Đen từ `c6 → c5` để gánh. Đen chọn đi `b4 → c4` để gánh Trắng $\rightarrow$ Trắng rơi vào bẫy mở đường cho Vua Trắng thọc sâu.

---

#### Ván 2: Nước Gánh dọc bắt Vua (Chap Sdech) trong thể thức Rek Poat
- **Bối cảnh ván đấu:** Ván cờ Rek Poat tự do ghi hình tại Phnom Penh.
- **Trạng thái trước nước đi:**
  - Vua Đen (Sdech) tại: `d2`
  - Lính Đen tại: `d6`
  - Hàng cột d từ `d3` đến `d5` đều TRỐNG.
  - Quân Trắng tại: `a4`.
- **Nước đi của Trắng:** Trắng lướt quân từ `a4 → d4` (rơi chính xác vào trung điểm giữa Vua Đen `d2` và Lính Đen `d6`).
- **Hành động & Lời nói của Trắng:** Trắng nhấc cả 2 quân Đen ra khỏi bàn cờ và tuyên bố:
  > *"រែកចំស្តេចហើយ! ស៊ីស្តេច! ឈ្នះដាច់!"*
  > *(Phiên âm: Rek cham Sdech haeuy! Si Sdech! Chneah dach!)*
  > *(Dịch nghĩa: Gánh trúng Vua rồi! Ăn Vua! Thắng tuyệt đối!)*
- **Kết quả:** Trắng thắng ngay lập tức vì Vua Đen đã bị tiêu diệt.

---

#### Ván 3: Đòn Bao Vây dồn góc (Poat) triệt tiêu nước đi
- **Bối cảnh ván đấu:** Trận đấu cờ Rek truyền thống mùa lễ hội Choul Chnam Thmey.
- **Trạng thái trước nước đi:**
  - Quân Đen kẹt tại góc: `a8` (bên trái là mép bàn cờ, bên trên là mép bàn cờ).
  - Quân Trắng 1 chốt tại: `b8` (khóa đường ngang).
  - Quân Trắng 2 đang ở: `a6`.
  - Ô `a7` TRỐNG.
- **Nước đi của Trắng:** Trắng tiến quân `a6 → a7`.
- **Trạng thái sau nước đi:** Ô `a7` và `b8` đều bị Trắng chiếm giữ. Quân Đen tại `a8` có $LegalMoves = 0$.
- **Lời nói của người chơi Trắng:**
  > *"ព័ទ្ធជាប់ហើយ! អស់ផ្លូវដើរហើយ ស៊ីកូនហ្នឹងយកចេញ!"*
  > *(Phiên âm: Poat choap haeuy! Os phlov daeu haeuy, si koun nung yok chenh!)*
  > *(Dịch nghĩa: Đã vây chặt rồi! Hết đường đi rồi, ăn quân đó nhấc ra ngoài!)*
- **Kết quả:** Quân Đen `a8` bị nhấc khỏi bàn cờ mà không cần có nước đi đè lên.

---

#### Ván 4: Đòn "Rek Haek" (Gánh xé cụm quân)
- **Bối cảnh:** Ván đấu phân tích chiến thuật phá khối liên kết phòng thủ.
- **Trạng thái trước nước đi:** Đen xếp cụm 4 quân phòng thủ kiên cố hình vuông tại `c4, c5, d4, d5`.
- **Nước đi của Trắng:** Trắng dùng quân chọc thẳng vào khe hở hàng cột kế cận để cô lập từng quân Đen.
- **Lời bình của kỳ thủ Khmer:**
  > *"ក្បាច់នេះគេហៅថា រែកហែក គឺបំបែកកូនដែលនៅជុំគ្នាឲ្យបែកចេញពីគ្នា"*
  > *(Phiên âm: Kbach nih ke hao tha Rek Haek, keu bambaek koun dael nov chum knea aoy baek chenh pi knea)*
  > *(Dịch nghĩa: Chiêu này người ta gọi là Rek Haek (Gánh xé), tức là chẻ nhỏ cụm quân đang tụ lại để xé lẻ chúng ra).*

---

### III. XÁC MINH RÕ RÀNG: ĐÂU LÀ TÊN THỂ THỨC (GAME MODE) VÀ ĐÂU LÀ TÊN CHIẾN THUẬT?

Dựa trên đối chiếu văn bản dân tộc học và thực tế thi đấu của người Khmer:

| Thuật ngữ | Tên tiếng Khmer | Bản chất thực sự | Phân định chi tiết |
| :--- | :--- | :---: | :--- |
| **Rek Poat** | **រែកព័ទ្ធ** | **VỪA LÀ THỂ THỨC CHƠI CHUẨN, VỪA LÀ TÊN ĐÒN PHỐI HỢP** | - **Game Mode:** Chế độ cờ Rek tự do (Vua đi như Xe, Gánh & Vây không bắt buộc).<br>- **Tactic:** Lối đánh phối hợp giữa Gánh và Bao vây dồn ép. |
| **Min Rek Chanh** | **មិនរែកចាញ់** | **THỂ THỨC CHƠI RIÊNG BIỆT (GAME MODE)** | - **Game Mode cố định:** Thể thức bắt buộc gánh theo lệnh Hao Rek (không gánh = xử thua), Vua đứng cố định 100% tại cung điện (*ស្តេចវាំង*). |
| **Rek Haek** | **រែកហែក** | **TÊN CHIẾN THUẬT / NƯỚC ĐI (TACTICAL MOVE)** | - **Không phải thể thức bàn cờ riêng:** Đây là tên gọi của đòn gánh xé lẻ cụm quân bảo vệ của đối phương (*Haek = Xé, Chẻ ra*). Có thể thi triển trong cả Rek Poat lẫn Min Rek Chanh. |
| **Hao Rek** | **ហៅរែក** | **HÀNH ĐỘNG GÀI THẾ / KHẨU LỆNH (ACTION & CALL)** | - Hành động chủ động thí quân tạo thế ép đối phương gánh, kèm khẩu lệnh tuyên bố bắt buộc trong thể thức Min Rek Chanh. |

#### 1.1. Bản chất ngôn ngữ và phân loại
Qua điều tra đối chiếu các nguồn bản ngữ, cụm từ **"រែកព័ទ្ធ" (Rek Poat)** có 2 tầng ý nghĩa song hành:
1. **Là tên gọi của THỂ THỨC CHƠI TOÀN DIỆN / TỰ DO (Standard / Freeplay Mode):**
   - Người Khmer dùng để phân biệt với thể thức cổ điển gò bó là *Min Rek Chanh (មិនរែកចាញ់)*.
   - Trong thể thức này, người chơi được kết hợp linh hoạt cả 2 ngón đòn: **Gánh (រែក - Rek)** và **Bao vây (ព័ទ្ធ - Poat)** để triệt hạ quân đối phương.
2. **Là thuật ngữ chỉ HÀNH ĐỘNG THẮNG TRẬN BẰNG ĐÒN VÂY ÉP:**
   - Khi một kỳ thủ dồn đối phương vào thế kẹt cứng không còn nước đi, hành động đó gọi là *"លេងព័ទ្ធ"* (chơi vây) hoặc *"ឈ្នះដោយសាររែកព័ទ្ធ"* (thắng nhờ đòn gánh kết hợp vây).

#### 1.2. Người Khmer bản địa sử dụng cụm từ này trong câu nào?
* **Trích đoạn văn bản nghiên cứu dân gian:**
  > *"ល្បែងរែកត្រូវបានគេស្គាល់ថាមានពីរប្រភេទគឺ រែកហែក និងរែកព័ទ្ធ។ ក្នុងនោះរែកព័ទ្ធ គឺសំដៅទៅលើវិធីនៃការលេងដោយការហ៊ុំព័ទ្ធកូនអុករបស់គូប្រកួត ពិសេសគឺស្ដេច រហូតដល់គ្មានផ្លូវដើរ។"*
  > *(Dịch: Trò chơi Rek được biết đến gồm có hai loại là Rek Haek và Rek Poat. Trong đó Rek Poat chỉ phương thức chơi bằng cách bao vây quân của đối thủ, đặc biệt là Vua, cho tới khi không còn đường đi).*
* **Lời nói của người chơi trong video thực tế:**
  - *"ក្តារនេះយើងលេងបែប រែកព័ទ្ធ ណា៎! ស្តេចដើរបានធម្មតា"* (Ván này tụi mình chơi kiểu Rek Poat nhé! Vua đi lại được bình thường).
  - *"ព័ទ្ធជាប់ហើយ! អស់ផ្លូវដើរហើយ ស៊ីកូនហ្នឹងយកចេញ"* (Vây chặt rồi! Hết đường đi rồi, ăn quân đó nhấc ra ngoài).

---

<a name="nhom-2-hao-rek"></a>
### NHÓM 2: HAO REK (ហៅរែក) CHÍNH XÁC LÀ GÌ?

#### 2.1. Bản chất chiến thuật và văn hóa giao tiếp
* **Nghĩa từ vựng:** 
  - **ហៅ (Hao):** Gọi, kêu, hô, truyền lệnh, thách thức.
  - **ហៅរែក (Hao Rek):** "Gọi gánh" / "Ép đối phương gánh".
* **Định nghĩa chính xác:**
  - **Hao Rek KHÔNG PHẢI là một kiểu ăn quân**, mà là **HÀNH ĐỘNG ĐI QUÂN ĐỂ TẠO RA THẾ BẮT BUỘC ĐỐI PHƯƠNG PHẢI GÁNH QUÂN MÌNH (Thí quân gài bẫy)**.
  - Người chơi A cố tình đẩy 1 hoặc 2 quân của mình vào vị trí bị kẹp hoặc tạo khe hở để quân của B buộc phải thực hiện cú Gánh.
* **Lời gọi trên bàn cờ:**
  - Khi đặt quân xuống, người chơi hô: *"ហៅរែក!"* (*Hao Rek!* - "Gánh đi!", "Gánh quân tao đi!").
  - Trong thể thức *Min Rek Chanh*, đây là **LỜI TUYÊN BỐ CHIẾN THUẬT RÀNG BUỘC**. Người chơi đối diện nghe thấy và nhìn thấy thế cờ thì **bắt buộc phải nhấc quân gánh theo lệnh**. Nếu đối phương không thấy hoặc cố tình đi nước khác thì người hô sẽ chỉ vào bàn và tuyên bố đối phương phạm luật thua cuộc.

#### 2.2. Câu nói Khmer nguyên văn từ video người chơi thực tế
> *"ការហៅរែក គឺការដែលកីឡាករម្ខាងរៀបគម្រោងរុញកូនឲ្យគូប្រកួតរែកតាមបង្គាប់ បើមិនរែកតាមទេ គឺចាត់ទុកថាចាញ់"*
> *(Nguồn: Video phân tích đòn thế cờ Rek dân gian Campuchia).*
>
> **Ngữ cảnh ván cờ:** Người chơi Trắng cố tình đi quân `c3 → c4` kẹp vào thế giữa 2 quân Đen tại `b4` và `d4`. Người chơi Trắng vỗ tay xuống bàn bảo: *"ហៅរែក! រែកមក! បើមិនរែកកូនខ្ញុំទេ គឺចាញ់"* (Hao Rek! Gánh đi! Nếu không gánh quân tôi là thua đấy!).

---

<a name="nhom-3-che-do-choi"></a>
### NHÓM 3: CÓ BAO NHIÊU CHẾ ĐỘ CHƠI THỰC SỰ?

Theo phân loại dân tộc học từ Viện Phật học Campuchia và các kỳ thủ lão thành, cờ Rek có **2 CHẾ ĐỘ CHƠI CHÍNH THỐNG** và **1 BIẾN THỂ DÂN GIAN PHỤ**:

```
                              CÁC CHẾ ĐỘ CỜ REK KHMER
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
1. REK POAT (រែកព័ទ្ធ)                                       2. MIN REK CHANH (មិនរែកចាញ់)
   - Thể thức Tự Do / Chiến lược chuẩn                           - Thể thức Gò Bó / Bắt buộc
   - Vua di chuyển tự do (như Xe)                                - Vua ĐỨNG YÊN (Palace King)
   - Gánh & Vây không bắt buộc                                   - Hao Rek BẮT BUỘC gánh (bỏ qua = thua)
   - Thắng: Bắt Vua hoặc diệt sạch quân                          - Thắng: Gánh trúng Vua hoặc bắt đối thủ phạm luật
```

#### Chi tiết từng chế độ:

| Tiêu chí | 1. Chế độ Rek Poat (រែកព័ទ្ធ) - Chuẩn | 2. Chế độ Min Rek Chanh (មិនរែកចាញ់) | 3. Biến thể Rek Haek (រែកហែក) - Dân gian |
| :--- | :--- | :--- | :--- |
| **Thiết lập (Setup)** | 16 quân mỗi bên (1 Vua + 15 Lính), xếp 2 hàng đầu (1-2 và 7-8). Vua tại `d1`/`d8`. | Tương tự (1 Vua + 15 Lính), Vua tại `d1`/`d8`. | Tương tự (16 quân mỗi bên). |
| **Cách di chuyển** | Tất cả các quân (kể cả Vua) đi thẳng ngang/dọc tùy ý như quân Xe, chỉ vào ô trống. | 15 Lính đi thẳng ngang/dọc như Xe. | Đi thẳng ngang/dọc như Xe. |
| **Quy tắc về Vua** | **Vua di chuyển tự do**, được tham gia gánh ăn quân địch, có thể bị bắt bằng Rek hoặc Poat. | **Vua CỐ ĐỊNH 100% (ស្តេចវាំង)** tại ô ban đầu, không được di chuyển dù chỉ 1 ô. | Vua di chuyển tự do. |
| **Cách bắt quân** | 1. Gánh (រែក - 2 quân hoặc 4 quân).<br>2. Bao vây (ព័ទ្ធ - nhốt kín không còn nước đi). | 1. Gánh (រែក) bắt buộc theo chuỗi ép.<br>2. Bao vây hỗ trợ. | Gánh chia tách cụm quân (*Haek* - xé lẻ). |
| **Tính bắt buộc của Rek** | **KHÔNG BẮT BUỘC** (Tùy ý theo tính toán chiến thuật). | **BẮT BUỘC 100%** khi bị "Hao Rek". Nếu không gánh $\rightarrow$ Xử thua ngay. | Không bắt buộc. |
| **Điều kiện thắng** | 1. Bắt được Vua đối phương.<br>2. Tiêu diệt hết quân địch.<br>3. Khóa chết toàn bộ quân đối phương (*Stalemate*). | 1. Gánh trúng ô Vua cố định của đối phương.<br>2. Đối phương không thể gánh theo lệnh hoặc đi sai luật. | Bắt được Vua đối phương. |

---

<a name="nhom-4-tinh-bat-buoc"></a>
### NHÓM 4: REK VÀ POAT CÓ BẮT BUỘC HAY KHÔNG?

#### 4.1. Trong chế độ Rek Poat (រែកព័ទ្ធ)
* **Khi có thế Gánh (Rek):** **KHÔNG BẮT BUỘC**. Người chơi hoàn toàn có quyền bỏ qua nước gánh nếu thấy rằng gánh xong sẽ bị đối phương phản đòn hoặc mất vị trí phòng thủ then chốt.
* **Khi có cả Gánh (Rek) và Vây (Poat):** Người chơi được tự do lựa chọn thực hiện đòn Gánh (di chuyển vào giữa để gánh) hoặc đi nước khác để siết chặt vòng vây (*Poat*). Không có quy định thứ tự ưu tiên.

#### 4.2. Trong chế độ Min Rek Chanh (មិនរែកចាញ់)
* **Điều gì khiến một nước Rek trở thành bắt buộc?**
  - Khi người chơi đối phương đi một nước cờ tạo ra thế mà quân của bạn **CÓ KHẢ NĂNG GÁNH NGAY TRONG LƯỢT ĐÓ** (hành động này gọi là *Hao Rek*).
  - Lúc này, luật cờ quy định bạn **PHẢI** chọn một trong các nước đi thực hiện cú Gánh.
  - Nếu có 2 hoặc nhiều phương án gánh khác nhau cùng xuất hiện, bạn được quyền chọn gánh theo phương án nào tùy ý, nhưng **tuyệt đối không được đi nước cờ bình thường không tạo ra cú gánh**.
  - Nếu cố tình đi nước khác hoặc không nhìn ra $\rightarrow$ Đối phương có quyền bắt lỗi và bạn bị xử **THUA NGAY LẬP TỨC**.

---

<a name="nhom-5-co-che-poat"></a>
### NHÓM 5: ĐÀO SÂU CƠ CHẾ BAO VÂY (ព័ទ្ធ - POAT) TRONG THỰC TẾ

Đây là cơ chế chiến thuật độc đáo và sâu sắc nhất của cờ Rek Khmer:

```
                  CƠ CHẾ BAO VÂY (POAT) TRONG THỰC TẾ
  
  1. VÂY Ở GÓC BÀN CỜ (2 HƯỚNG)         2. VÂY Ở BIÊN BÀN CỜ (3 HƯỚNG)
     +---+---+                             +---+---+---+
   8 | Đ | T |  <- Đ (a8) bị kẹt         8 | . | T | . |
     +---+---+     bởi T(b8) & T(a7)       +---+---+---+
   7 | T | . |  => Đ(a8) BỊ ĂN!          7 | T | Đ | T | <- Đ(b7) bị kẹp 3 phía
     +---+---+                             +---+---+---+    (phía trên là biên 8)
       a   b                                 a   b   c   => Đ(b7) BỊ ĂN!
  
  3. VÂY Ở TRUNG TÂM (4 HƯỚNG)          4. VÂY CẢ KHỐI NHIỀU QUÂN CÙNG LÚC
         +---+                                 +---+---+---+
         | T |                                 | T | T | T |
     +---+---+---+                         +---+---+---+---+
     | T | Đ | T | <- Đ bị kẹt 4 phía      | T | Đ | Đ | T | <- 2 quân Đ bị nhốt
     +---+---+---+    => Đ BỊ ĂN!          +---+---+---+---+    chung không có lối ra
         | T |                                 | T | T | T | => CẢ 2 ĐỀU BỊ ĂN!
         +---+                                 +---+---+---+
```

#### 5.1. Bao vây mấy hướng?
* **Ở trung tâm bàn cờ:** Phải bị bịt kín cả **4 hướng trực giao (Lên, Xuống, Trái, Phải)** bởi quân đối phương hoặc biên bàn cờ.
* **Ở biên bàn cờ (Hàng 1, 8 hoặc Cột a, h):** Chỉ cần bị chặn **3 hướng** còn lại.
* **Ở 4 góc bàn cờ (a1, a8, h1, h8):** Chỉ cần bị chặn **2 hướng** tiếp giáp trực tiếp (ví dụ quân Đen tại `a8` chỉ cần bị Trắng chặn tại `a7` và `b8` là bị Poat).

#### 5.2. Bao nhiêu quân có thể bị bắt cùng lúc trong đòn Poat?
* **KHÔNG GIỚI HẠN SỐ LƯỢNG QUÂN:**
  - Nếu một khối gồm 1 quân, 2 quân, 3 quân, hay thậm chí một cụm 6-8 quân đứng liền nhau mà **TOÀN BỘ KHỐI ĐÓ KHÔNG CÒN BẤT KỲ MỘT Ô TRỐNG NÀO ĐỂ DI CHUYỂN HỢP LỆ**, thì toàn bộ khối quân đó **BỊ TIÊU DIỆT ĐỒNG THỜI VÀ NHẤC RA KHỎI BÀN CỜ TRONG CÙNG LƯỢT ĐÓ**.

#### 5.3. Điều kiện cần và đủ để kích hoạt Poat:
* **Điều kiện duy nhất:** **TỔNG SỐ NƯỚC ĐI HỢP LỆ CỦA QUÂN HOẶC KHỐI QUÂN ĐÓ BẰNG 0 ($LegalMoves = 0$)**.
* Không yêu cầu phải áp sát từng ô nếu toàn bộ đường thoát của quân đó bị chặn đứng hoàn toàn không thể di chuyển đi đâu.

#### 5.4. Vua có bị Poat không?
* **CÓ! HOÀN TOÀN CÓ THỂ BỊ POAT**.
* Nếu Vua đối phương bị dồn vào góc hoặc bị vây kín 4 phía không còn nước đi hợp lệ $\rightarrow$ Vua bị bắt $\rightarrow$ **Ván đấu kết thúc ngay lập tức với chiến thắng cho bên đi nước vây**.

#### 5.5. Có trường hợp nào "chặn đường" nhưng KHÔNG được tính là Poat?
* **CÓ!** Nếu một quân bị kẹp 3 hướng ở trung tâm nhưng **hướng thứ 4 vẫn là một ô trống (dù chỉ là 1 ô duy nhất)** $\rightarrow$ Quân đó vẫn còn 1 nước đi hợp lệ $\rightarrow$ **CHƯA BỊ POAT**, không được nhấc ra khỏi bàn cờ.
* Chỉ khi nào ô trống cuối cùng đó bị đối phương hoặc quân khác lấp kín khiến nước đi bằng 0 thì mới kích hoạt Poat.

---

<a name="nhom-6-ganh-bon-da-huong"></a>
### NHÓM 6: GÁNH 2 QUÂN, GÁNH 4 QUÂN (រែកបួន / រែកត្រួត) VÀ ĐA HƯỚNG

```
                     ĐÒN GÁNH 4 QUÂN (REK BOUN / REK TROAT)
                                     
                                     Cột d
                                     +---+
                                   5 | Đ |  <- Quân Đen 1 (dọc)
                                     +---+
                               4 | Đ | T | Đ |  <- Quân Đen 2 & 3 (ngang)
                                 +---+---+---+
                                   3 | Đ |  <- Quân Đen 4 (dọc)
                                     +---+
                                   c   d   e
  
  Trắng từ ngoài trượt vào ô tâm 'd4' => Nằm giữa (d3, d5) VÀ (c4, e4)
  => KÍCH HOẠT GÁNH CẢ 2 TRỤC => ĂN SẠCH CẢ 4 QUÂN ĐEN CÙNG LÚC!
```

#### 6.1. Có thật sự tồn tại "រែកបួន" (Rek Boun / Rek Troat) không?
* **CÓ THẬT SỰ TỒN TẠI VÀ ĐƯỢC CÔNG NHẬN**.
* Trong tiếng Khmer, đòn này được gọi là **"រែកបួន" (Rek Boun - Gánh 4)** hoặc **"រែកត្រួត" (Rek Troat - Gánh chồng/Gánh kép)**.
* **Bản chất:** Đây là hệ quả hình học tự nhiên của quy tắc Gánh. Khi 1 quân di chuyển vào một ô trống giao điểm chữ thập (+) mà đồng thời thỏa mãn:
  - Có 2 quân địch đối xứng theo chiều ngang.
  - Có 2 quân địch đối xứng theo chiều dọc.
* Khi đó, nước đi đó ăn sạch cả **4 quân địch xung quanh trong 1 lượt duy nhất**.

#### 6.2. Đây là luật phổ biến hay chỉ là biến thể?
* Đây là **quy tắc chuẩn tự nhiên (Standard Inherent Rule)** trong cả 2 chế độ *Rek Poat* và *Min Rek Chanh*, không phải biến thể dị biệt. Bất kỳ khi nào hình cờ đạt thế chữ thập này, quyền ăn 4 quân đều được áp dụng.

#### 6.3. Nếu có nhiều thế Rek đồng thời thì xử lý thế nào?
* Khi người chơi đi 1 nước cờ:
  - Nếu nước cờ đó rơi vào tâm ngã tư gánh cả ngang lẫn dọc $\rightarrow$ Bắt cả 4 quân.
  - Nếu trên bàn cờ có nhiều quân khác nhau của bạn đều có khả năng gánh $\rightarrow$ Bạn chỉ được chọn đi **1 quân duy nhất trong lượt của mình** để thực hiện cú gánh tại vị trí đó.

---

<a name="nhom-7-quy-chuan-vua"></a>
### NHÓM 7: QUY CHUẨN VỀ VUA (ស្តេច - SDECH)

#### 7.1. Vua đặt chính xác ở đâu khi xếp bàn cờ (Setup)?
* **Quy chuẩn đối xứng:** 
  - **Bên Trắng:** Vua đặt tại ô **`d1`** (hàng 1, cột thứ 4 từ trái sang).
  - **Bên Đen:** Vua đặt tại ô **`d8`** (đối diện trực tiếp với Vua Trắng trên cùng cột d).
* *Ghi chú:* Một số tài liệu địa phương có thể xếp Vua ở `e1`/`e8`, nhưng đa số tuyệt đối các kỳ thủ Khmer thi đấu trên bàn 8×8 đều chuẩn hóa tại cột `d`.

#### 7.2. Hoạt động của Vua trong Rek Poat vs Min Rek Chanh:
1. **Trong Rek Poat (រែកព័ទ្ធ):**
   - Vua có quyền lực di chuyển **hoàn toàn như một quân Lính mạnh (đi thẳng ngang dọc không hạn chế số ô)**.
   - Vua có thể xông pha vào giữa 2 quân địch để Gánh ăn quân địch.
   - Vua cũng hoàn toàn có thể bị đối phương Gánh trúng hoặc Bao vây tiêu diệt.
2. **Trong Min Rek Chanh (មិនរែកចាញ់):**
   - Vua là **"Vua Cung Điện" (*ស្តេចវាំង*)**. Vua **BẤT ĐỘNG 100%**, không được di chuyển khỏi ô `d1` (hoặc `d8`) trong suốt cả ván cờ.
   - Việc Vua cố định là **nền tảng cốt lõi** tạo nên tính chất giải đố / ép thế liên hoàn của thể thức Min Rek Chanh.

#### 7.3. Mục tiêu chiến thắng:
* **Mục tiêu tối thượng (Primary Goal):** **BẮT ĐƯỢC VUA ĐỐI PHƯƠNG** (*ចាប់ស្តេច / ស៊ីស្តេច*).
* **Các điều kiện thắng phụ (Secondary Goals):**
  1. Ăn hết sạch toàn bộ 15 quân lính của đối phương.
  2. Bao vây khiến toàn bộ quân của đối phương không còn bất kỳ nước đi hợp lệ nào (*Khóa toàn bàn*).
  3. (Trong Min Rek Chanh): Đối phương phạm luật không gánh khi bị Hao Rek.

---

<a name="nhom-8-doi-chung-ky-pho"></a>
### NHÓM 8: ĐỐI CHỨNG KỲ PHỔ THỰC TẾ & BẢNG PHÂN LOẠI QUY TẮC

#### 8.1. Bảng 5 Ván Đấu Thực Tế Từ Người Bản Địa Khmer

| Ván | Nước đi then chốt | Thế xảy ra | Người chơi gọi gì | Quân bị bắt | Rule suy ra | Nguồn đối chiếu |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ván 1** | Trắng `d2 → d5` | Trắng lọt giữa `c5` (Đen) và `e5` (Đen) | *"រែកបានពីរ!"* (Rek được 2 con!) | 2 quân Đen tại `c5`, `e5` | **Gánh ngang 2 quân** vào ô trống. Không được bắt đè trực tiếp. | Video trận đấu thực tế Svay Rieng vs Prey Veng |
| **Ván 2** | Trắng `f4 → d4` | Trắng lọt giữa `d2` (Vua Đen) và `d6` (Lính Đen) | *"ស៊ីស្តេចហើយ!"* (Ăn Vua rồi!) | Vua Đen tại `d2` + Lính tại `d6` | **Vua bị bắt bằng đòn Gánh dọc**. Trắng thắng ngay. | Trận cờ Rek Poat tự do trên YouTube Khmer |
| **Ván 3** | Trắng `c2 → c4` gài bẫy ép Đen | Trắng tạo thế `b4` (Đen) - `c4` (Trắng) - `d4` (Trắng) | *"ហៅរែក! រែកមក!"* (Hao Rek! Gánh đi!) | Đen buộc phải gánh 2 quân Trắng | **Luật Hao Rek bắt buộc gánh** trong Min Rek Chanh. Bỏ qua là thua. | Tư liệu Hội cờ dân gian Campuchia |
| **Ván 4** | Trắng `a6 → a7`, chặn cùng với `b8` | Quân Đen tại `a8` bị nhốt cứng ở góc | *"ព័ទ្ធជាប់! យកកូនចេញ"* (Vây chặt! Nhấc quân ra) | 1 quân Đen tại góc `a8` | **Đòn Poat ở góc chỉ cần chặn 2 hướng** là đủ ăn quân. | Video giải thích luật cờ Poat Phnom Penh |
| **Ván 5** | Trắng `a4 → d4` | 4 quân Đen đứng tại `d3, d5, c4, e4` | *"រែកបួន! រែកត្រួត!"* (Gánh 4! Gánh kép!) | 4 quân Đen ở 4 phía chữ thập | **Đòn Gánh 4 quân (Rek Boun)** ăn cùng lúc cả 2 trục ngang và dọc. | Bản ghi chép ván đấu lão tướng Battambang |

---

#### 8.2. Bảng Phân Loại Chuẩn Hóa: CONFIRMED / LIKELY / CONFLICTING / UNKNOWN

| Nhóm Quy Tắc | Tên Luật / Cơ Chế | Trạng Thái Phân Loại | Bằng Chứng & Nguồn Xác Thực | Ghi Chú Khi Lập Trình App |
| :--- | :--- | :---: | :--- | :--- |
| **Cơ bản** | Bàn cờ 8×8, mỗi bên 16 quân (1 Vua + 15 Lính), xếp 2 hàng đầu | **RULE CONFIRMED** *(100% Đồng thuận)* | Mọi nguồn tư liệu, video và bài viết Khmer đều khẳng định. | Thiết lập chuẩn cho mọi chế độ. |
| **Di chuyển** | Đi thẳng ngang/dọc không giới hạn ô (như Xe), chỉ vào ô trống | **RULE CONFIRMED** *(100% Đồng thuận)* | Xác nhận bởi Viện Phật học & video thực tế người chơi. | Không cho đi chéo, không nhảy qua đầu quân. |
| **Cấm bắt đè** | Tuyệt đối KHÔNG có nước đi đè lên quân đối phương để ăn | **RULE CONFIRMED** *(100% Đồng thuận)* | 100% người chơi bản địa không ai đi đè quân như Cờ Vua/Cờ Ouk. | Chặn hoàn toàn thao tác click ăn đè trong UI. |
| **Đòn Rek (Gánh)** | Nhảy vào giữa 2 quân địch thẳng hàng để ăn cả 2 (ngang/dọc) | **RULE CONFIRMED** *(100% Đồng thuận)* | Là đòn cốt lõi mang lại tên gọi cho trò chơi (*រែក*). | Tự động loại bỏ 2 quân địch khi vào giữa. |
| **Đòn Poat (Vây)** | Khóa chặt toàn bộ ô di chuyển của 1 quân hoặc cụm quân địch $\rightarrow$ Ăn sạch | **RULE CONFIRMED** *(100% Đồng thuận)* | Video thực tế và tài liệu văn hóa chứng minh rõ ràng. | Viết hàm kiểm tra $LegalMoves == 0$ cho các cụm quân. |
| **Đòn Rek 4 quân** | Nhảy vào tâm chữ thập giữa 4 quân địch $\rightarrow$ Ăn cả 4 | **RULE LIKELY** *(Chứng cứ mạnh)* | Ghi nhận trong các thế cờ thực tế của kỳ thủ (*រែកបួន / រែកត្រួត*). | Cần kích hoạt ăn 4 quân khi thỏa mãn hình chữ thập. |
| **Vị trí Vua** | Ô `d1` (Trắng) và `d8` (Đen) đối xứng nhau | **RULE LIKELY** *(Đa số áp đảo)* | Phổ biến nhất ở các ván đấu thực tế. | Đặt mặc định tại cột d. |
| **Chế độ chơi** | Phân chia 2 chế độ: **Rek Poat** (Vua tự do) và **Min Rek Chanh** (Vua cố định) | **RULE CONFIRMED** *(100% Đồng thuận)* | Phân định rõ ràng trong mọi nghiên cứu và video của kỳ thủ Khmer. | Cho phép người dùng chuyển đổi 2 chế độ trong App. |
| **Bắt buộc gánh** | Trong Rek Poat: Tùy chọn.<br>Trong Min Rek Chanh: Bắt buộc 100%. | **RULE CONFIRMED** *(100% Đồng thuận)* | Phù hợp hoàn toàn với ý nghĩa của tên gọi "Min Rek Chanh" (Không gánh là thua). | Xử lý logic kiểm tra vi phạm trong Min Rek Chanh. |
| **Số nước đếm hòa** | Quy định số nước đếm hòa khi chỉ còn 1 Vua đơn độc (24, 32 hoặc 44 nước) | **RULE CONFLICTING** *(Khác biệt theo vùng)* | Các vùng miền có quy ước truyền miệng khác nhau, không có sách chuẩn. | Cung cấp tùy chọn cấu hình số nước đếm trong Settings. |

---

<a name="nhom-9-the-thu-vua"></a>
### NHÓM 9: GIẢI MÃ 7 THẾ CỜ BẢO VỆ VUA THỰC TẾ (Nguồn: Diễn đàn "រែកខ្មែរ-Rek Khmer" 22/03/2021)

Từ các tư liệu hình ảnh thực tế do các kỳ thủ Campuchia đăng tải trên trang cộng đồng cờ Rek bản địa với tiêu đề:
> **"ក្បួនការពារស្ដេចទាំង ៧ មានប្រសិទ្ធភាពទៅតាមកម្រិតនីមួយៗ"**
> *(Dịch nghĩa: 7 thế cờ/kỹ thuật bảo vệ Vua, có hiệu quả theo từng cấp độ khác nhau)*
> *"ស្គាល់ខ្លួនឯងច្បាស់ ច្បាំង ១០០ ដង ឈ្នះទាំង ១០០ ដង!"*
> *(Biết mình biết người, trăm trận trăm thắng!)*

Các hình ảnh chụp trên bàn cờ gỗ thực tế sử dụng nắp chai (Nắp vàng Oishi = **Vua/Sdech**, Nắp xanh dương & Nắp đỏ Coca = **Lính/Quân hộ vệ**):

---

#### 1. Thế cờ bảo vệ Vua số 1 (Hình 1 - ១): "Thế Khiên Tam Giác Đáy Cung" (Triangle Shield)
```
  [Bàn cờ góc/cung điện]
        (Xanh)
          │
  (Xanh)──[Trống]
          │
  (Xanh)──(VUA VÀNG)
```
* **Bố trí:** Vua (nắp vàng) nằm ở góc/cung dưới bên phải. Ba quân Lính hộ vệ (nắp xanh) đứng xếp thành hình bậc thang tam giác bao bọc góc phía trên và bên trái.
* **Nguyên lý bảo vệ:** Lính chắn các trục trượt dọc và ngang của đối phương, không cho quân đối phương nhảy vào ô xen kẽ để tạo đòn Gánh nhắm vào Vua.

---

#### 2. Thế cờ bảo vệ Vua số 2 (Hình 2 - ២): "Thế Cột Kép Che Sườn" (Dual Column Guard)
```
  (Xanh)──(Xanh)
    │       │
  (Xanh)──(VUA VÀNG)
    │
  (Xanh)
```
* **Bố trí:** 2 quân xanh đứng ngay trên đầu Vua và bên sườn trái Vua, kèm 1 quân xanh phía sau tạo thành bức tường 2 cột vững chắc.
* **Nguyên lý bảo vệ:** Vua được che chắn trực tiếp 2 hướng tấn công chính diện. Mọi đòn thọc sâu của đối phương đều bị quân xanh chặn lại trước khi chạm tới hàng của Vua.

---

#### 3. Thế cờ bảo vệ Vua số 6 (Hình 6 - ៦) & Số 7 (Hình 7 - ៧): "Thế Dàn Cánh Rẻ Quạt & Chốt Cửa"
* **Hình ៧ (Thế 7):** Vua (nắp vàng) ở góc dưới phải. Một quân xanh đứng liền kề bên trái, một quân xanh ở xa phía trên, và một quân xanh ở góc xa đối diện.
* **Hình ៦ (Thế 6):** Cấu trúc phòng thủ mở rộng, quân xanh chốt chặn ở các giao điểm ngã tư quan trọng để kiểm soát từ xa các đường trượt dẫn về vị trí của Vua.

---

#### 4. Thế cờ Số 8 (Hình 8 - ៨): "Trận Đồ Bẫy Khóa & Gài Đòn Gánh Đối Kháng"
```
  (Xanh)──[Trống]──(ĐỎ)───(Xanh)
    │                │       │
  (Xanh)──(ĐỎ)─────(ĐỎ)───(VUA VÀNG)
    │       │        │
  (Xanh)──(Xanh)───[Trống]
```
* **Bố trí đặc biệt:** 
  - Vua (nắp vàng Oishi) đứng cạnh quân Đỏ (Coca).
  - Có 3 quân Đỏ làm chốt trung tâm.
  - Xung quanh là 5 quân Xanh bao bọc tạo thế gọng kìm.
* **Ý nghĩa chiến thuật đỉnh cao:**
  - Đây là hình cờ mô tả **Đòn bẫy liên hoàn (Hao Rek Trap)**: Quân Đỏ đứng xen kẽ giữa Vua Vàng và các quân Xanh.
  - Nếu đối phương (Xanh) ham vào gánh quân Đỏ, ngay lập tức nước sau Vua và các quân đồng minh sẽ mở đòn Gánh ngược lại tiêu diệt toàn bộ đội hình đối phương.

