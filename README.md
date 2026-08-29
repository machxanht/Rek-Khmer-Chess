# រែកខ្មែរ - Rek Khmer (Khmer Traditional Board Game)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**រែកខ្មែរ - Rek Khmer** là dự án số hóa và chuẩn hóa trò chơi cờ dân gian truyền thống độc đáo của người Khmer (Campuchia & Nam Bộ). Trò chơi sử dụng bàn cờ $8 \times 8$ với các quy tắc trượt xe (Rook-sliding), đòn kẹp Gánh (**រែក - Rek**), đòn Bao Vây diệt cụm (**ព័ទ្ធ - Poat**) và bảo vệ Vua tối cao (**ស្តេច - Sdech**).

---

## 🌟 Tính Năng Nổi Bật

1. **Chuẩn Hóa Luật Bản Địa Khmer 100%:**
   - Hỗ trợ cả 2 chế độ chơi chuẩn: **Rek Poat (រែកព័ទ្ធ)** và **Min Rek Chanh (មិនរែកចាញ់)**.
   - Cơ chế bắt buộc Gánh (*Hao Rek - ហៅរែក*) và thuật toán Flood-Fill tính khí giải phóng đòn Bao Vây (*Poat*).
2. **4 Chế Độ Chơi Đa Dạng:**
   - 👥 **Pass & Play (2P):** Đối kháng trực tiếp trên cùng thiết bị với chỉ dẫn nước đi trực quan & hoàn tác (Undo).
   - 🤖 **Vs AI Master:** Thi đấu với Bot trí tuệ nhân tạo (Tập sự, Dày dạn, Đại sư).
   - 🏆 **7 Thế Cờ Hộ Vua Cổ Truyền (*Kbuon Karpea Sdech*):** Chế độ giải đố chiến thuật (Khuyên tam giác, Cột đôi, Bẫy phản gánh...).
   - 🌐 **Online Multiplayer:** Tạo phòng thi đấu cá nhân với mã mời 6 chữ số.
3. **Trải Nghiệm Nghe Nhìn Chân Thực (Khmer Aesthetic & Sound Synthesis):**
   - Theme đền đài Angkor mạ vàng hoàng gia, quân cờ chạm khắc tinh xảo.
   - Âm thanh Web Audio Synthesizer: Tiếng gõ gỗ Teak, chuông đồng hoàng cung khi Gánh và chiêng chiến thắng.

---

## 📂 Tài Liệu Kiến Trúc & Nghiên Cứu

- [`/HUONG_DAN_LUAT_CO_REK_KHMER.md`](./HUONG_DAN_LUAT_CO_REK_KHMER.md) — Khảo sát đối chứng thực địa văn hóa & nguồn gốc luật cờ Khmer.
- [`/SPEC_ENGINE_CO_REK_KHMER.md`](./SPEC_ENGINE_CO_REK_KHMER.md) — Đặc tả toán học, tọa độ và thuật toán Game Engine.
- [`/PLAN_PHAT_TRIEN_CO_REK.md`](./PLAN_PHAT_TRIEN_CO_REK.md) — Lộ trình phát triển và giao thức kỹ thuật.

---

## 🚀 Khởi Chạy Ứng Dụng (Local Development)

```bash
# Cài đặt dependencies
npm install

# Khởi chạy server dev (Port 3000)
npm run dev

# Build production
npm run build
```

---

## 📜 Giấy Phép (License)

Dự án được phân phối dưới giấy phép MIT License. Bảo tồn và phát huy di sản văn hóa trò chơi dân gian Khmer.
