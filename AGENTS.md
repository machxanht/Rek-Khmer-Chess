# HƯỚNG DẪN QUY CHUẨN DÀNH CHO AI AGENT (AGENT RULES & GUARDRAILS)
> **DỰ ÁN:** រែកខ្មែរ - Rek Khmer (ល្បែងរែក - Khmer Traditional Board Game)  
> **GitHub Repository:** `machxanht/Rek-Khmer-Chess` (https://github.com/machxanht/Rek-Khmer-Chess)  
> **Áp dụng cho:** Tất cả các AI Coding Agent, Sub-agents và Lập trình viên tham gia phát triển dự án.

---

## 0. KHÓA PHẠM VI REPOSITORY (REPOSITORY SCOPE LOCK — CRITICAL)

- Mọi thao tác đọc, audit, tạo branch, sửa file, commit, pull request, issue, workflow và merge của Agent cho dự án này **CHỈ ĐƯỢC PHÉP** thực hiện trên repository:
  - `https://github.com/machxanht/Rek-Khmer-Chess`
  - Repository đầy đủ: `machxanht/Rek-Khmer-Chess`
- **CẤM TUYỆT ĐỐI** đọc để suy diễn trạng thái công việc, ghi file, commit, push, mở PR/issue hoặc thay đổi bất kỳ repository GitHub nào khác khi đang thực hiện nhiệm vụ của dự án Rek Khmer này, trừ khi người dùng đưa ra yêu cầu mới và nêu rõ repository khác trong chính yêu cầu đó.
- Trước mọi thao tác ghi GitHub, Agent phải xác nhận trường `repository_full_name`/remote mục tiêu là chính xác `machxanht/Rek-Khmer-Chess`.
- Nếu lịch sử hội thoại, link cũ, tên repo tương tự hoặc công cụ trả về repository khác, Agent phải **bỏ qua repository đó** và quay lại `machxanht/Rek-Khmer-Chess`.
- Quy tắc khóa repository này có độ ưu tiên cao hơn mọi ví dụ, link hoặc ngữ cảnh repo cũ trong các tài liệu không phải tài liệu nền tảng của dự án.

---

## 1. NGUYÊN TẮC BẢO VỆ DỰ ÁN & CHỐNG PHÁ HOẠI (CRITICAL GUARDRAILS)

### ⛔ ĐIỀU CẤM TUYỆT ĐỐI (STRICT PROHIBITIONS):
1. **KHÔNG TỰ Ý XÓA FILE (NO ARBITRARY DELETIONS):**
   - Tuyệt đối **CẤM** gọi lệnh xóa (`delete_file`, `rm`, `git rm`) đối với bất kỳ file nào trong dự án nếu người dùng không yêu cầu trực tiếp.
2. **KHÔNG GHI ĐÈ PHÁ HỦY TÀI LIỆU NỀN TẢNG (PRESERVE FOUNDATIONAL DOCS):**
   - Ba file sau đây là **NGUỒN SỰ THẬT DUY NHẤT (Single Source of Truth)**, tuyệt đối không được ghi đè làm mất thông tin hoặc thay đổi logic cốt lõi đã được kiểm chứng:
     - `/HUONG_DAN_LUAT_CO_REK_KHMER.md` (Chân lý văn hóa & luật chơi bản địa Khmer).
     - `/SPEC_ENGINE_CO_REK_KHMER.md` (Đặc tả toán học, tọa độ & thuật toán Engine).
     - `/PLAN_PHAT_TRIEN_CO_REK.md` (Lộ trình phân rã module & tiến độ phát triển).
3. **CHỐNG TỰ SÁNG TÁC QUY TẮC (ZERO HALLUCINATION & NO UNSOLICITED SCOPE):**
   - Không tự ý bịa thêm luật mới, không tự thay đổi cách bắt quân (Gánh/Vây) ngoài những gì đã được quy định trong tài liệu.
   - Không thêm các tính năng thừa thãi (như server backend không cần thiết, cơ sở dữ liệu bên ngoài khi chưa yêu cầu).
4. **NGUYÊN TẮC "ĐỌC TRƯỚC KHI SỬA" (READ-BEFORE-WRITE MANDATORY):**
   - Phải luôn gọi `view_file` để kiểm tra nội dung hiện tại của file trước khi thực hiện `edit_file` hoặc chỉnh sửa. Không bao giờ đoán mò nội dung file.

---

## 2. QUY CHUẨN KIẾN TRÚC & PHÂN TÁCH TRÁCH NHIỆM (ARCHITECTURE PROTOCOLS)

* **Phần lõi Logic (`lib/rek-engine/`):**
  - Viết bằng TypeScript thuần (Pure TypeScript), 100% không phụ thuộc vào React, DOM hay HTML.
  - Chịu trách nhiệm hoàn toàn về: Kiểm tra tính hợp lệ của nước đi, tính toán đòn Gánh (Rek), đòn Bao Vây (Poat theo Flood-Fill), xử lý Vua và điều kiện thắng/thua/hòa.
* **Phần Giao diện UI (`components/`):**
  - Chỉ nhận dữ liệu từ `RekEngine` và render lên màn hình.
  - **CẤM VIẾT LOGIC PHÁN ĐOÁN ĂN QUÂN BÊN TRONG COMPONENT REACT.**
* **Quy trình Kiểm Thử (Testing):**
  - Mọi thay đổi logic bắt buộc phải vượt qua toàn bộ Test Cases từ `TC-01` đến `TC-06` trong `SPEC_ENGINE_CO_REK_KHMER.md`.

---

## 3. QUY TRÌNH QUẢN LÝ GIT & ĐỒNG BỘ LÊN GITHUB (GIT & GITHUB AUTO-PUSH WORKFLOW)

Để đảm bảo toàn bộ mã nguồn, tài liệu và tiến độ phát triển luôn được lưu trữ an toàn, AI Agent cần tuân theo quy trình Git sau:

### 3.1. Quy tắc Commit Chuẩn (Conventional Commits)
Mỗi commit phải có thông điệp rõ ràng, đúng ngữ cảnh:
- `feat:` Khi thêm tính năng mới (ví dụ: `feat: implement Flood-Fill Poat capture algorithm`)
- `fix:` Khi sửa lỗi (ví dụ: `fix: correct horizontal Rek capture edge collision`)
- `docs:` Khi cập nhật tài liệu (ví dụ: `docs: update Khmer tactical puzzle diagrams`)
- `test:` Khi thêm hoặc cập nhật unit test (ví dụ: `test: add TC-02 king capture test`)
- `refactor:` Khi tối ưu cấu trúc code mà không đổi logic nghiệp vụ

### 3.2. Bảo Mật Bí Mật & API Keys (Security First)
- **TUYỆT ĐỐI KHÔNG** commit các file chứa secret, credentials, token hoặc `.env.local` lên GitHub.
- Mọi biến môi trường mẫu phải được khai báo trong `.env.example`.

### 3.3. Quy trình Tự Động Push Lên GitHub Khi Có Yêu Cầu
Khi nhận lệnh commit và push lên GitHub từ người dùng, Agent thực hiện theo các bước an toàn sau:

```bash
# 1. Kiểm tra trạng thái hiện tại
git status

# 2. Thêm các file thay đổi an toàn (loại trừ các file tạm/nhạy cảm)
git add .

# 3. Tạo commit với thông điệp chuẩn xác
git commit -m "feat/docs: <mô tả ngắn gọn nội dung vừa cập nhật>"

# 4. Đẩy lên nhánh chính của remote repository (ví dụ: main hoặc develop)
git push origin main
```

*(Lưu ý: Nếu chưa cấu hình remote GitHub, Agent sẽ hướng dẫn người dùng kết nối repository thông qua menu Settings/Export hoặc cấu hình `git remote add origin <URL>` một cách an toàn).*

---

## 4. TÓM TẮT CHECKLIST HÀNH ĐỘNG DÀNH CHO AGENT

Mỗi khi Agent bắt đầu một lượt làm việc:
- [ ] Xác nhận repository mục tiêu là `machxanht/Rek-Khmer-Chess` trước mọi thao tác GitHub.
- [ ] Đọc hiểu yêu cầu của người dùng, đối chiếu với `/HUONG_DAN_LUAT_CO_REK_KHMER.md` và `/SPEC_ENGINE_CO_REK_KHMER.md`.
- [ ] Dùng `view_file` trước khi sửa.
- [ ] Không xóa bất kỳ file tài liệu `.md` nào.
- [ ] Chạy `compile_applet` và `lint_applet` để xác minh không có lỗi biên dịch.
- [ ] Chuẩn bị sẵn sàng trạng thái Git sạch sẽ cho việc push lên GitHub.
