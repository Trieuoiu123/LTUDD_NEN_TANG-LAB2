# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 1: VKU Field Survey PWA & Android Application  
**Team / Student Name:** Trần Kim Bá Triều  
**Submission Date:** 21/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

* **Team Members:**
  * **Trần Kim Bá Triều** — Student ID: **23IT287** — Role: **Full-Stack PWA & Android Developer** — Contribution: **100%**

* **🔗 Live Demo URL:** [http://localhost:8080](http://localhost:8080) (Local PWA Server)
* **💻 GitHub Repository:** [https://github.com/Trieuoiu123/LTUDD_NEN_TANG-LAB2.git](https://github.com/Trieuoiu123/LTUDD_NEN_TANG-LAB2.git)
* **📱 Android APK Package:** `android/app/build/outputs/apk/debug/app-debug.apk`
* **🎥 Video Demo (Optional):** N/A

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|---|---|:---:|---|
| **1** | **Responsive Mobile Viewport & Dark Mode** | ✅ Complete | 100% responsive across mobile viewports with 5-Tab Bottom Navigation Bar, touch-friendly UI, real-time Online/Offline indicator, and smooth Dark/Light mode toggling. |
| **2** | **Local Offline Persistence** | ✅ Complete | Uses **IndexedDB (`VKUSurveyDB`)** for client-side storage, saving offline survey logs, base64 compressed images, and GPS coordinates without network dependency. |
| **3** | **Automatic Background & Cloud Sync** | ✅ Complete | Auto-queues pending payloads (`pending_sync`) and syncs them in real-time to **Google Sheets** via Google Apps Script Webhook when network connectivity is restored. |
| **4** | **PWA Capabilities & Caching** | ✅ Complete | Full PWA compliance (`manifest.json`) and Service Worker (`sw.js`) implementing 5 core caching strategies (Cache-First, Network-First, Stale-While-Revalidate, Cache-Only, Network-Only). |
| **5** | **Hardware Access (Camera & GPS)** | ✅ Complete | Real-time photo capture with client-side Canvas image compression (<800px), Geolocation API auto-locator with VKU Campus fallback coordinates, and Badging API (`navigator.setAppBadge`). |
| **6** | **Native Android App Packaging** | ✅ Complete | Packaged into a full native Android project using **Capacitor 7** & compiled into `app-debug.apk` via Gradle with native Android permissions (`CAMERA`, `GPS`, `INTERNET`). |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 📁 Directory Structure
```
LTUDD_NEN_TANG-LAB2/
├── index.html              # Main HTML5 Semantic UI (Mobile 5 Tabs, FAB, Real-time status)
├── editor.html             # Data management & survey inspection interface
├── generate-icons.html     # PWA launcher icon generation utility
├── css/
│   └── index.css           # Design System, VKU Brand Colors (#00529C), Responsive & Dark Mode
├── js/
│   ├── app.js              # Core PWA Logic, Event listeners, Camera, GPS, Filter & Sync Engine
│   └── storage.js          # Storage Engine managing IndexedDB (VKUSurveyDB)
├── sw.js                   # Service Worker script managing PWA lifecycle & 5 caching strategies
├── manifest.json           # Web App Manifest for Add-to-HomeScreen & PWA installation
├── capacitor.config.json   # Capacitor runtime configuration for Android platform
├── build-apk.bat           # One-click Gradle compilation & packaging script for Windows
├── android/                # Full Native Android Studio project structure
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml  # Native Android permissions (Camera, Location, Internet)
│   │   └── build.gradle                   # Module build rules & Java 17 compatibility config
│   └── build.gradle                       # Top-level Gradle configuration & subprojects setup
├── TECHNICAL_REPORT.md     # Technical project report
└── README.md               # Complete setup, Google Apps Script Webhook & execution guide
```

### 🔄 State Management & Offline-First Flow
1. **Form Input & Media Processing**: The user fills out a facility inspection report, captures a picture via HTML5 Camera API (compressed via Canvas to <800px Base64), and auto-detects GPS coordinates.
2. **Local Storage Execution**: Data is committed to IndexedDB (`surveys` ObjectStore) under status `pending_sync`.
3. **Synchronization Engine**: When `navigator.onLine` evaluates to `true`, the sync engine iterates through `pending_sync` entries, transmitting JSON payloads via HTTP POST to the configured Google Apps Script Webhook.
4. **State Transition & UI Feedback**: Successfully transmitted entries transition to state `synced`. App badges and UI list indicators update dynamically.

### 🛡️ Exception Handling Strategies
- **GPS Fallback**: If Geolocation is unavailable or denied by the user, the app gracefully falls back to default VKU Campus coordinates (`15.9753, 108.2524`).
- **Network Request Failures**: HTTP requests timeout gracefully without throwing uncaught errors; items remain securely queued in IndexedDB until reconnection.
- **IndexedDB Transaction Integrity**: Database operations are wrapped in Promises with automatic transaction rollback upon failure.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

### 📷 Screenshot 1: Mobile-First Inspection Form & Hardware Access (GPS & Camera)
*The primary survey form showing VKU building zone selectors, equipment condition pills, real-time GPS coordinate acquisition, and responsive camera photo capture.*

> **[Screenshot 1 Placeholder: Mobile Viewport & Survey Form]**

---

### 📷 Screenshot 2: Real-time Cloud Synchronization (Google Sheets Webhook)
*The Settings & Sync Tab displaying Webhook URL configuration (`https://script.google.com/macros/s/.../exec`), real-time synchronization status, and live spreadsheet row insertion.*

> **[Screenshot 2 Placeholder: Real-time Google Sheets Sync Interface]**

---

### 📷 Screenshot 3: Native Android Packaging & APK Build Confirmation
*Output terminal showing successful Gradle compilation (`BUILD SUCCESSFUL`) and generation of `android/app/build/outputs/apk/debug/app-debug.apk` via Capacitor 7.*

> **[Screenshot 3 Placeholder: Android APK Compilation Success]**

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### ⚠️ Challenge 1: Android Gradle Plugin (AGP 8.x) Java Version Mismatch
- **Bottleneck**: When building the Android APK via Gradle, the build failed with `Android Gradle plugin requires Java 17 to run. You are currently using Java 11`, and subsequently failed with `invalid source release: 21` due to incomplete JRE paths.
- **Resolution**: Updated `android/build.gradle` with a `subprojects` configuration block forcing `JavaVersion.VERSION_17` compatibility across all modules (`:app`, `:capacitor-android`, `:capacitor-cordova-android-plugins`) and configured `JAVA_HOME` in `build-apk.bat` to point to a complete OpenJDK 20 JDK path containing `jlink.exe` and `javac.exe`.

### ⚠️ Challenge 2: CORS Preflight Blockage with Google Apps Script Webhook
- **Bottleneck**: Sending JSON payloads via standard `fetch()` with header `'Content-Type': 'application/json'` triggered browser CORS preflight `OPTIONS` requests, which Google Apps Script web app URLs do not support natively, causing sync failures.
- **Resolution**: Refactored `app.js` sync fetch logic to use `mode: 'no-cors'` with `'Content-Type': 'text/plain;charset=utf-8'`. In the Google Apps Script backend `doPost(e)`, the payload is parsed via `JSON.parse(e.postData.contents)`, bypassing CORS checks completely while maintaining 100% data fidelity.
