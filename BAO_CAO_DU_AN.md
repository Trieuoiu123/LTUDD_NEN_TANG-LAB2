# BÁO CÁO KỸ THUẬT TẮT DỰ ÁN MINI-PROJECT
**Môn học:** Phát Triển Ứng Dụng Di Động Đa Nền Tảng (VKU)  
**Tên Mini-Project:** Mini-Project 1: VKU Field Survey PWA (Khảo sát Cơ sở Vật chất Campus VKU)  
**Tên Nhóm / Sinh viên:** Nguyễn Văn Triệu  
**Ngày nộp:** 14/09/2026  

---

## 1. THÔNG TIN CHUNG & CÁC ĐƯỜNG LINK DỰ ÁN

* **Thành viên nhóm:**
  1. Trần Kim Bá Triều — Mã SV: 23IT287 — Vai trò: Kiến trúc PWA & Phát triển Full-Stack — Đóng góp: 100%
* **🔗 Live Demo URL:** [https://trieuoiu123.github.io/lab1/](https://trieuoiu123.github.io/lab1/)
* **💻 GitHub Repository:** [https://github.com/Trieuoiu123/lab1](https://github.com/Trieuoiu123/lab1)
* **🎥 Video Demo (Option):** N/A

---

## 2. BẢNG CHECKLIST TÍNH NĂNG ĐÃ TRIỂN KHAI

| # | Tính năng Yêu cầu | Trạng thái | Chi tiết Triển khai & Mức độ Đạt |
|:---:|---|:---:|---|
| 1 | **Giao diện Responsive Mobile & Dark Mode** | ✅ Hoàn thành | 100% responsive chuẩn Mobile-First với Thanh điều hướng đáy (Bottom Nav 5 Tabs), các nút bấm cảm ứng lớn, tùy chỉnh giao diện Sáng/Tối linh hoạt. |
| 2 | **Lưu trữ Cục bộ Offline Persistence** | ✅ Hoàn thành | Sử dụng **IndexedDB (`VKUSurveyDB`)** lưu trữ dữ liệu khảo sát, hình ảnh chụp nén Base64 và tọa độ GPS ngoại mạng 100% không cần Internet. |
| 3 | **Đồng bộ Tự động & Real-time Google Sheets** | ✅ Hoàn thành | Tự động hoặc thủ công đồng bộ các phiếu chờ (`pending_sync`) trực tiếp vào trang tính **Google Sheets** qua Webhook Google Apps Script khi có mạng. |
| 4 | **Cài đặt PWA & Service Worker Lifecycle** | ✅ Hoàn thành | File `manifest.json` chuẩn standalone PWA, `sw.js` triển khai 5 chiến lược caching (Cache-First, Network-First, Stale-While-Revalidate, Cache-Only, Network-Only). |
| 5 | **Truy cập Phần cứng Camera & GPS** | ✅ Hoàn thành | Chụp ảnh camera nén client-side canvas, lấy tọa độ GPS chính xác (Geolocation API) và hiển thị thông báo hiệu Badging API (`navigator.setAppBadge`). |
| 6 | **Xuất Báo cáo JSON / CSV / PDF** | ✅ Hoàn thành | Hỗ trợ xuất dữ liệu backup JSON, file Excel/CSV và in phiếu kiểm tra cơ sở vật chất PDF chuẩn định dạng báo cáo VKU. |

---

## 3. KIẾN TRÚC KỸ THUẬT & CẤU TRÚC DỰ ÁN

### 📁 Cấu trúc thư mục mã nguồn
```
cross_platform_application_development/week2/
├── index.html          # Giao diện HTML5 Semantic 5 Tabs Mobile Viewport
├── css/
│   └── index.css       # Design System, VKU Brand Colors (#00529C), Responsive & Dark Theme
├── js/
│   ├── app.js          # Quản lý State, Sự kiện, Camera, GPS, Bộ lọc & Engine Đồng bộ Google Sheets
│   └── storage.js      # Storage Engine thao tác với CSDL Cục bộ IndexedDB (VKUSurveyDB)
├── sw.js               # Service Worker triển khai 5 chiến lược caching & SW Lifecycle
├── manifest.json       # Web App Manifest hỗ trợ cài đặt PWA Standalone & Shortcuts
├── README.md           # Hướng dẫn chi tiết dự án & Cấu hình Google Apps Script
└── BAO_CAO_DU_AN.md    # Báo cáo kỹ thuật tổng hợp
```

### 🔄 Luồng Quản lý Trạng thái (Offline-First State Flow)
1. **Khởi tạo dữ liệu**: Người dùng nhập form khảo sát ➔ Hệ thống kiểm tra dữ liệu ➔ Nén ảnh chụp qua Canvas (<800px) ➔ Lấy tọa độ GPS hiện tại.
2. **Ghi đĩa cục bộ (IndexedDB)**: Báo cáo được lưu trực tiếp vào Object Store `surveys` với trạng thái mặc định `pending_sync` (Chờ đồng bộ).
3. **Engine Đồng bộ Cloud**: Khi thiết bị có mạng (`navigator.onLine = true`) và đã lưu URL Webhook Google Apps Script, hệ thống gửi request `fetch()` dạng JSON tới Web App URL.
4. **Cập nhật trạng thái**: Khi nhận phản hồi thành công, phiếu khảo sát chuyển trạng thái `synced` và cập nhật biểu tượng Badging API trên ứng dụng.

### 🛡️ Chiến lược Xử lý Ngoại lệ (Exception Handling)
- **Ngoại lệ Ngoại mạng (Offline Fallback)**: Geolocation API tự động chuyển sang tọa độ giả lập Campus VKU (15.9753, 108.2524) khi mất GPS hoặc người dùng từ chối quyền.
- **An toàn Giao dịch IndexedDB**: Mọi giao dịch đọc/ghi CSDL đều được bọc trong Promise với cơ chế tự động rollback khi gặp lỗi `onerror`.
- **Service Worker Resilience**: Mọi lỗi truy vấn mạng trong `sw.js` đều tự động fallback về CacheStorage tĩnh mà không gây treo ứng dụng.

---

## 4. MINH CHỨNG THỰC NGHIỆM & HÌNH ẢNH MINH HỌA

### 📍 Minh chứng 1: Repository Mã nguồn & Deploy trên GitHub Pages
*Ứng dụng được quản lý mã nguồn công khai tại Repository `Trieuoiu123/lab1` và tự động triển khai thành công qua GitHub Pages.*

![GitHub Repository & Deploy Status](https://github.com/Trieuoiu123/lab1/raw/main/README.md)
*Hình 1: Mã nguồn dự án VKU Field Survey PWA được lưu trữ và Deploy thành công trên GitHub.*

---

### 📍 Minh chứng 2: Giao diện Form Khảo Sát Cơ Sở Vật Chất (Mobile-First UI)
*Giao diện nhập liệu tối ưu di động với các ô chọn khu vực VKU, mã phòng, loại thiết bị, nút đánh giá tình trạng trực quan (🟢 Bình thường, 🟡 Hỏng nhẹ, 🔴 Hỏng nặng) và các nút thao tác cảm ứng lớn.*

![Giao diện Form Khảo sát VKU PWA](https://trieuoiu123.github.io/lab1/index.html)
*Hình 2: Giao diện Form Khảo sát Cơ sở Vật chất chuẩn Mobile-First chạy trực tuyến trên GitHub Pages.*

---

### 📍 Minh chứng 3: Tích hợp Đồng bộ Google Sheets Thời Gian Thực (Real-time Sync)
*Giao diện Tab Đồng bộ & Hệ thống hỗ trợ dán URL Webhook Google Apps Script (`https://script.google.com/macros/s/.../exec`), lưu cấu hình và kích hoạt nút đồng bộ dữ liệu trực tiếp về trang tính Google Sheets.*

![Tích hợp Google Sheets Webhook](https://trieuoiu123.github.io/lab1/index.html#settings)
*Hình 3: Cấu hình Webhook Google Apps Script tự động đồng bộ dữ liệu khảo sát vào Google Sheets.*

---

## 5. THÁCH THỨC KỸ THUẬT & GIẢI PHÁP

### ⚠️ Thách thức 1: Lỗi CORS & Preflight Check khi gửi dữ liệu sang Google Apps Script
- **Vấn đề nghẽn**: Khi sử dụng `fetch()` với `headers: { 'Content-Type': 'application/json' }` từ PWA sang đường link `script.google.com`, trình duyệt sẽ phát sinh lệnh kiểm tra CORS preflight `OPTIONS` làm Google Apps Script từ chối kết nối và không nhận được dữ liệu.
- **Giải pháp**: Điều chỉnh phương thức gửi trong `app.js` sử dụng `mode: 'no-cors'` kết hợp `headers: { 'Content-Type': 'text/plain;charset=utf-8' }`. Phía Google Apps Script trong hàm `doPost(e)` dùng `JSON.parse(e.postData.contents)` để đọc dữ liệu sạch 100% không bị chặn bởi CORS.

### ⚠️ Thách thức 2: Trình duyệt lưu Cache Service Worker cũ không cập nhật giao diện mới
- **Vấn đề nghẽn**: Do ứng dụng PWA có tính năng lưu bộ nhớ đệm Offline mạnh mẽ, khi đẩy code mới (tính năng Google Sheets) lên GitHub Pages, trình duyệt người dùng vẫn ưu tiên tải `index.html` cũ từ Service Worker CacheStorage.
- **Giải pháp**: Cập nhật chỉ số phiên bản Cache `const CACHE_VERSION = 'vku-survey-v1.0.1'` trong file `sw.js`. Trong sự kiện `activate`, Service Worker sẽ tự động quét và xóa toàn bộ bộ nhớ cache cũ (`caches.delete()`), ép trình duyệt cập nhật tức thì phiên bản mới nhất.
