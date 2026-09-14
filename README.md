# 🏢 VKU Field Survey PWA — Ứng Dụng Khảo Sát Cơ Sở Vật Chất (Offline-First)

> **Mini-Project 1**: Progressive Web App (PWA) di động kiểm tra và khảo sát cơ sở vật chất Trường Đại học CNTT & TT Việt - Hàn (VKU), hoạt động **100% Offline-First (Zero Network Connectivity)** và tích hợp đồng bộ thời gian thực với **Google Sheets**.

---

## 🌟 Tính Năng Nổi Bật

- 📱 **Thiết kế Mobile-First & Responsive**: Giao diện chuẩn di động với Bottom Navigation Bar 5 Tabs, Floating Action Button (FAB), Đèn báo trạng thái Mạng thời gian thực (`Online` / `Offline`) và chế độ Sáng/Tối (Dark/Light mode).
- 🔌 **Offline-First 100%**: Sử dụng **Service Worker (`sw.js`)** và **IndexedDB (`VKUSurveyDB`)** giúp mở app và lưu dữ liệu khảo sát hoàn toàn không cần kết nối mạng.
- 📷 **Chụp Ảnh & Nén Ảnh Offline**: Hỗ trợ chụp trực tiếp từ Camera điện thoại hoặc chọn ảnh từ bộ nhớ, nén ảnh client-side lưu vào IndexedDB.
- 📍 **Tọa Độ GPS Auto-locator**: Tự động xác định tọa độ GPS chính xác (Latitude, Longitude) với Geolocation API kèm tọa độ fallback Campus VKU.
- 📊 **Liên Kết Google Sheets (Real-time Sync)**: Tự động hoặc thủ công đồng bộ toàn bộ phiếu khảo sát offline sang trang tính **Google Sheets** thông qua Webhook Google Apps Script.
- 📄 **Xuất Dữ Liệu Đa Dạng**: Xuất file **JSON (Backup)**, **CSV / Excel** và **In phiếu kiểm tra định dạng PDF**.
- 📚 **Tích Hợp Bài Giảng PWA Theory Hub**: Thể hiện trực quan 5 Tiêu chí PWA, Bảng so sánh PWA vs Native App, Sơ đồ Vòng đời Service Worker (SW Lifecycle), và 5 Chiến lược Caching chính.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
cross_platform_application_development/week2/
├── index.html          # Giao diện HTML5 Semantic 5 Tabs Mobile-First
├── css/
│   └── index.css       # Design System, VKU Brand Colors (#00529C), Responsive & Dark Mode
├── js/
│   ├── app.js          # Logic PWA, Event Listeners, Camera, GPS, Filter & Sync Engine
│   └── storage.js      # Storage Engine quản lý IndexedDB (VKUSurveyDB)
├── sw.js               # Service Worker triển khai 5 chiến lược caching & SW Lifecycle
├── manifest.json       # Web App Manifest hỗ trợ cài đặt Add to Home Screen
└── README.md           # Hướng dẫn chi tiết dự án
```

---

## 📚 Lý Thuyết PWA Tích Hợp (PWA Core Concepts)

### 1. 5 Tiêu Chí Của PWA (5 Criteria of a PWA)
1. **Installable**: Thêm vào màn hình chính với launcher icon độc lập.
2. **Offline-First**: Hoạt động tin cậy không cần mạng qua Service Worker + Cache API + IndexedDB.
3. **Fast & Responsive**: Khởi động dưới 1 giây từ local cache, tối ưu cho màn hình di động.
4. **Engaging**: Hỗ trợ Web Push Notifications & Badging API (`navigator.setAppBadge`).
5. **Secure**: Truyền tải dữ liệu an toàn qua HTTPS.

### 2. So Sánh PWA vs Native App
| Tiêu chí | Progressive Web App (PWA) | Native Mobile App |
|---|---|---|
| **Kênh phân phối** | Đường dẫn URL / Web Link trực tiếp | Google Play / Apple App Store |
| **Chi phí App Store** | **0% Fee** | 15% – 30% Fee |
| **Cập nhật** | Tức thì qua Service Worker | Phê duyệt Store (1 – 3 ngày) |
| **Kích thước** | 1 – 5 MB | 25 – 80 MB |
| **Truy cập phần cứng** | Tốt (Camera, GPS, Storage, Badging) | Toàn diện (BLE, NFC, Biometrics) |
| **Hỗ trợ Offline** | Cache API + IndexedDB | Local SQLite / File System |

### 3. Vòng Đời Service Worker (SW Lifecycle)
```
[ Register trong app.js ] ➔ ( Install Event: Pre-cache App Shell ) ➔ ( Activate Event: Dọn dẹp cache cũ ) ➔ ( Fetch Event: Intercept HTTP Requests )
```

### 4. 5 Chiến Lược Caching (5 Core Caching Strategies)
1. **Cache-First (App Shell)**: Ưu tiên lấy từ Cache trước, fallback sang Network.
2. **Network-First (Live Data)**: Ưu tiên lấy từ Network, fallback về Cache khi Offline.
3. **Stale-While-Revalidate**: Trả về Cache cũ ngay lập tức, đồng thời cập nhật ngầm từ Network.
4. **Cache-Only**: Chỉ lấy tài nguyên đã pre-cache.
5. **Network-Only**: Truyền thẳng qua Network (không cache).

---

## 📊 Hướng Dẫn Tích Hợp Google Sheets Webhook

### Bước 1: Thêm Code vào Google Sheets
1. Mở file **Google Sheets** của bạn ➔ Chọn menu **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
2. Dán đoạn mã sau vào và lưu lại (`Ctrl + S`):

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Mã Báo Cáo", "Thời Gian", "Khu Vực", "Mã Phòng", 
        "Loại Thiết Bị", "Tình Trạng", "Mức Ưu Tiên", "Ghi Chú", 
        "GPS", "Người Khảo Sát", "Mã SV/NV", "Trạng Thái"
      ]);
    }
    var gpsStr = data.gps ? (data.gps.latitude + ", " + data.gps.longitude) : "N/A";
    sheet.appendRow([
      data.id || "",
      data.timestamp || new Date().toISOString(),
      data.locationZone || "",
      data.roomCode || "",
      data.facilityType || "",
      data.condition || "",
      data.priority || "",
      data.notes || "",
      gpsStr,
      data.surveyorName || "",
      data.surveyorId || "",
      "VKU PWA Synced"
    ]);
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Bước 2: Triển Khai Web App
1. Bấm **Triển khai (Deploy)** ➔ **Tùy chọn triển khai mới (New Deployment)**.
2. Chọn loại **Ứng dụng web (Web app)** ➔ Mục *Ai có quyền truy cập (Who has access)* chọn **Bất kỳ ai (Anyone)**.
3. Bấm **Triển khai**, cấp quyền truy cập và copy **URL Ứng dụng web** (`https://script.google.com/macros/s/.../exec`).

### Bước 3: Lưu Link trên PWA
1. Mở PWA ➔ Vào Tab **Đồng bộ (Settings)** ➔ Dán URL Webhook ➔ Bấm **Lưu URL Webhook**.
2. Khi người dùng lưu phiếu khảo sát hoặc bấm **"Đồng Bộ Google Sheets"**, dữ liệu sẽ tự động đẩy sang Google Sheets thời gian thực.

---

## 🚀 Hướng Dẫn Chạy & Deploy

### Chạy Cục Bộ (Local)
- Đưa thư mục `week2` vào Web Server (ví dụ: `python -m http.server 8080` hoặc VS Code Live Server).
- Truy cập: `http://localhost:8080/`

### Triển Khai Lên GitHub Pages
1. Push toàn bộ thư mục dự án lên GitHub Repository của bạn.
2. Vào **Settings** ➔ **Pages** ➔ Chọn branch **`main`** ➔ Bấm **Save**.
3. Link ứng dụng sẽ có dạng: `https://<your-username>.github.io/<repo-name>/`

---

## 👨‍💻 Tác Giả & Bản Quyền
- **Dự án**: VKU Field Survey PWA (Phát triển ứng dụng đa nền tảng)
- **Đơn vị**: Trường Đại học CNTT & TT Việt - Hàn (VKU)
- **Năm thực hiện**: 2026
