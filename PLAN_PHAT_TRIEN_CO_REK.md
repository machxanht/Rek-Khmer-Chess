# KẾ HOẠCH PHÁT TRIỂN & QUY CHUẨN: DỰ ÁN រែកខ្មែរ - REK KHMER (ល្បែងរែក)
> **Tên chính thức:** រែកខ្មែរ - Rek Khmer  
> **GitHub Repository:** `machxanht/Rek-Khmer-Chess` (https://github.com/machxanht/Rek-Khmer-Chess)  
> **Tài liệu chiến lược (Master Development Plan & Agent Protocols)**  
> **Mục tiêu:** Xây dựng ứng dụng Cờ Rek chuẩn văn hóa Khmer với kiến trúc module hóa cao, kiểm thử tự động chặt chẽ, an toàn và dễ dàng mở rộng khi nhiều AI Agent / lập trình viên cùng tham gia.

---

## 1. NGUYÊN TẮC BẢO TOÀN DỮ LIỆU & NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH)

Mọi AI Agent tham gia vào dự án **BẮT BUỘC** phải tuân thủ thứ bậc ưu tiên tài liệu:

```
[TẦNG 1: QUY CHUẨN LUẬT BẢN ĐỊA KHMER]
└── /HUONG_DAN_LUAT_CO_REK_KHMER.md (Chân lý tối cao về quy tắc văn hóa, câu nói, thế cờ)

[TẦNG 2: ĐẶC TẢ KỸ THUẬT & TOÁN HỌC ENGINE]
└── /SPEC_ENGINE_CO_REK_KHMER.md (Đặc tả dữ liệu, tọa độ, thuật toán Gánh/Vây Flood-fill)

[TẦNG 3: KẾ HOẠCH & QUY ƯỚC PHÁT TRIỂN]
└── /PLAN_PHAT_TRIEN_CO_REK.md (Tài liệu này - Quản lý tiến độ và phân chia module)
```

> ⚠️ **Quy tắc bất biến cho AI Agent:** Không tự ý sửa đổi logic bắt quân (Gánh/Vây) hoặc sáng tác thêm quy tắc mới nếu không được quy định trong Tầng 1 và Tầng 2.

---

## 2. LỘ TRÌNH PHÁT TRIỂN 4 GIAI ĐOẠN (STEP-BY-STEP ROADMAP)

Để đảm bảo an toàn tuyệt đối và không phát sinh lỗi chồng chéo giữa giao diện và logic cờ, dự án chia làm 4 giai đoạn độc lập:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: CORE GAME ENGINE (THUẦN LOGIC TYPESCRIPT - ZERO UI)            │
│  - Xây dựng thư viện RekEngine độc lập, không dính dáng đến React/HTML      │
│  - Viết 100% Unit Tests bao phủ tất cả các tình huống Gánh, Vây, Bắt Vua   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: BÀN CỜ TƯƠNG TÁC (INTERACTIVE 2D BOARD & UI)                  │
│  - Render bàn cờ 8x8 với Tailwind & Motion animations mượt mà               │
│  - Tương tác kéo/thả hoặc click di chuyển, highlight ô hợp lệ               │
│  - Hiển thị hoạt ảnh khi Gánh (Rek) và Bao Vây (Poat)                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: ENGINE ĐỐI THỦ AI (AI BOT - MINIMAX / ALPHA-BETA)              │
│  - Bot AI với 3 cấp độ: Dễ (Ngẫu nhiên/Tham lam), Vừa, Khó (Minimax d=3-4)  │
│  - Thuật toán đánh giá thế trận: Ưu tiên bảo vệ Vua, tránh bẫy Hao Rek      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: VĂN HÓA & TRẢI NGHIỆM NGƯỜI DÙNG (KHMER CULTURAL POLISH)       │
│  - Đa ngôn ngữ (Khmer / Tiếng Việt / Tiếng Anh)                             │
│  - Âm thanh dân gian: Tiếng gõ nắp chai/quân gỗ, giọng đọc "ហៅរែក!", "ព័ទ្ធ!" │
│  - Chế độ 7 thế phòng thủ Vua truyền thống (Puzzle / Training Mode)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CHI TIẾT TỪNG MODULE CẦN XÂY DỰNG

### Module 1: `lib/rek-engine/` (Core Logic)
* `types.ts`: Định nghĩa toàn bộ interfaces, enums (`PlayerColor`, `Piece`, `Move`, `BoardState`).
* `engine.ts`: Bộ xử lý nước đi, kiểm tra trượt, va chạm, luật `REK_POAT` & `MIN_REK_CHANH`.
* `captures.ts`:
  - `checkRekCaptures()`: Xử lý gánh ngang, gánh dọc, gánh 4.
  - `checkPoatCaptures()`: Thuật toán Flood-Fill tính khí (Liberties).
* `fen.ts` hoặc `serializer.ts`: Mã hóa/Giải mã trạng thái bàn cờ thành chuỗi ngắn gọn để lưu ván đấu.

### Module 2: `lib/rek-ai/` (Trí Tuệ Nhân Tạo)
* `evaluator.ts`: Hàm lượng giá điểm thế trận (Vua: 10000đ, Lính: 100đ, Kiểm soát trung tâm: 20đ, Mất khí: -50đ).
* `minimax.ts`: Tìm kiếm nước đi tối ưu với tỉa nhánh Alpha-Beta Pruning.

### Module 3: `components/board/` (Giao Diện Bàn Cờ)
* `GameBoard.tsx`: Canvas hoặc CSS Grid 8x8 với theme gỗ dân gian hoặc nắp chai truyền thống.
* `PieceView.tsx`: Render Vua Vàng Oishi / Lính Xanh / Lính Đỏ với hiệu ứng chuyển động mượt mà.
* `MoveHistory.tsx`: Danh sách ghi kỳ phổ tọa độ chuẩn quốc tế (`d2 → d4`, `c5 → c4 [Rek 2]`).
* `CapturedPieces.tsx`: Khay chứa các quân đã bị tiêu diệt của 2 bên.

### Module 4: `components/modes/` (Các Chế Độ Chơi)
* `TwoPlayerLocal.tsx`: Chơi 2 người trên cùng màn hình.
* `PlayVsAi.tsx`: Đánh với máy (3 cấp độ).
* `PuzzleTraining.tsx`: Giải 7 thế cờ bảo vệ Vua bản địa Khmer.

---

## 4. HƯỚNG DẪN DÀNH CHO AI AGENT (AGENT INSTRUCTIONS & PROTOCOL)

Khi giao việc cho một AI Agent khác trong dự án này, Agent cần tuân theo **4 cam kết kỹ thuật**:

1. **Cam kết 1: Không can thiệp Logic ngoài file Engine**
   - Mọi quyết định xem nước đi có hợp lệ hay không, quân nào bị ăn, ai thắng cuộc **100% PHẢI GỌI TỪ `RekEngine`**. Tuyệt đối không viết logic kiểm tra ăn quân bên trong component React.
2. **Cam kết 2: Kiểm thử trước khi báo cáo hoàn thành**
   - Bất kỳ sửa đổi nào trong Engine phải chạy qua toàn bộ test case (TC-01 đến TC-06 trong file spec) để đảm bảo không bị regression (vỡ logic cũ).
3. **Cam kết 3: Xử lý bất đồng bộ trong UI**
   - Khi có nước đi gây ra cả Rek và Poat: Cần có độ trễ hoạt ảnh nhỏ (ví dụ 250ms) giữa lúc quân bị Gánh biến mất và lúc quân bị Vây biến mất để người chơi quan sát rõ ràng.
4. **Cam kết 4: Giữ đúng thuật ngữ Khmer**
   - Giao diện và thông báo trong game cần dùng đúng từ gốc: *រែក (Rek)*, *ព័ទ្ធ (Poat)*, *ហៅរែក (Hao Rek)*, *ស្តេច (Sdech)*, *កូន (Koun)*.

---

## 5. CHECKLIST BẮT ĐẦU NGAY (ACTION ITEMS - ĐÃ HOÀN THÀNH)

- [x] **Bước 1:** Khởi tạo thư mục `lib/rek-engine/` và tách mã nguồn từ `/SPEC_ENGINE_CO_REK_KHMER.md` vào các file TypeScript sạch (`types.ts`, `captures.ts`, `engine.ts`, `ai.ts`, `puzzles.ts`, `tests.ts`, `index.ts`).
- [x] **Bước 2:** Viết file unit test kiểm tra 6 tình huống then chốt (TC-01 đến TC-06 trong SPEC_ENGINE_CO_REK_KHMER.md) và tích hợp vào Test Suite.
- [x] **Bước 3:** Tạo component `GameBoard` kết nối với `RekEngine` để người chơi có thể click di chuyển quân thử nghiệm trực quan với hiệu ứng và animation.
- [x] **Bước 4:** Bổ sung thanh chọn Game Mode (`Rek Poat` vs `Min Rek Chanh`) và âm thanh hiệu ứng synthesizer Web Audio API.

