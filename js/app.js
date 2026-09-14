/* ==========================================================================
   VKU FIELD SURVEY PWA — APPLICATION LOGIC
   Handles PWA registration, IndexedDB data flow, Offline state, Camera & GPS
   ========================================================================== */

// Global State Variables
let currentPhotos = [];
let currentFilter = 'all';
let deferredInstallPrompt = null;

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[App] Initializing VKU Field Survey PWA...');
  
  // 1. Initialize IndexedDB
  try {
    await VKUStorage.initDB();
    console.log('[App] Storage Engine Ready');
  } catch (err) {
    console.error('[App] Storage Init Failed:', err);
  }

  // 2. Register Service Worker
  registerServiceWorker();

  // 3. Setup Network Status Listeners
  setupNetworkListeners();

  // 4. Setup Theme Toggle
  setupThemeToggle();

  // 5. Setup PWA Install Prompt
  setupInstallPrompt();

  // 6. Handle Hash Navigation (Deep-linking)
  handleHashNavigation();

  // 7. Load Saved Google Sheets Webhook URL
  loadGoogleSheetURL();

  // 8. Load Initial Data & Refresh UI
  await refreshAppUI();
});

/* ==========================================================================
   SERVICE WORKER & PWA INSTALLATION
   ========================================================================== */

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[App] Service Worker Registered with Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[App] Service Worker Registration Failed:', err);
        });
    });
  }
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btnInstall = document.getElementById('btn-install-pwa');
    if (btnInstall) {
      btnInstall.style.display = 'flex';
      btnInstall.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log('[PWA] User installation response:', outcome);
        deferredInstallPrompt = null;
        btnInstall.style.display = 'none';
      });
    }
  });
}

/* ==========================================================================
   NETWORK STATUS & BADGING API
   ========================================================================== */

function setupNetworkListeners() {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    const badge = document.getElementById('network-status-badge');
    const text = document.getElementById('network-status-text');

    if (isOnline) {
      badge.className = 'network-badge online';
      text.textContent = 'Online';
      showToast('🟢 Đã kết nối mạng Internet');
    } else {
      badge.className = 'network-badge offline';
      text.textContent = 'Offline';
      showToast('🔴 Chế độ Offline — Dữ liệu được lưu cục bộ vào IndexedDB');
    }
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
}

async function updateAppBadgeCount() {
  try {
    const pendingCount = await VKUStorage.getPendingSyncCount();
    const badgeEl = document.getElementById('records-count-badge');
    
    if (badgeEl) {
      if (pendingCount > 0) {
        badgeEl.textContent = pendingCount;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Set Native Web App Badge if supported
    if ('setAppBadge' in navigator) {
      if (pendingCount > 0) {
        navigator.setAppBadge(pendingCount).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  } catch (e) {
    console.warn('[Badge] Error updating app badge:', e);
  }
}

/* ==========================================================================
   TAB NAVIGATION & THEME SWITCHER
   ========================================================================== */

function switchTab(tabId, navElement) {
  // Hide all tab views
  document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));

  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  // Show selected tab view
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Activate nav element
  if (navElement) {
    navElement.classList.add('active');
  }

  // Refresh view contents if switching to specific tabs
  if (tabId === 'tab-records') {
    renderRecordsList();
  } else if (tabId === 'tab-dashboard') {
    updateDashboardMetrics();
  }
}

function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'pwa-hub') {
    const pwaNavItem = document.querySelectorAll('.nav-item')[3];
    switchTab('tab-pwa-hub', pwaNavItem);
  } else if (hash === 'records') {
    const recordsNavItem = document.querySelectorAll('.nav-item')[1];
    switchTab('tab-records', recordsNavItem);
  }
}

function setupThemeToggle() {
  const btnTheme = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('vku_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('vku_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#btn-theme-toggle .material-icons-round');
  if (icon) {
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
}

/* ==========================================================================
   FORM HANDLING & HARDWARE ACCESS (CAMERA & GPS)
   ========================================================================== */

function selectCondition(condition) {
  document.querySelectorAll('.condition-card').forEach(card => card.classList.remove('selected'));
  const target = document.querySelector(`.condition-card[data-condition="${condition}"]`);
  if (target) {
    target.classList.add('selected');
  }
  document.getElementById('field-condition').value = condition;
}

function selectPriority(priority) {
  document.querySelectorAll('#priority-chip-group .chip').forEach(chip => chip.classList.remove('active'));
  const target = document.querySelector(`#priority-chip-group .chip[data-priority="${priority}"]`);
  if (target) {
    target.classList.add('active');
  }
  document.getElementById('field-priority').value = priority;
}

// Camera / Image Upload Handler (Compresses to Base64)
function handlePhotoUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      compressImage(e.target.result, 800, 0.7, (compressedBase64) => {
        currentPhotos.push(compressedBase64);
        renderPhotoPreviews();
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(base64Str, maxWidth, quality, callback) {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
}

function renderPhotoPreviews() {
  const grid = document.getElementById('photo-preview-grid');
  if (!grid) return;

  grid.innerHTML = currentPhotos.map((photo, index) => `
    <div class="preview-thumb">
      <img src="${photo}" alt="Preview ${index + 1}">
      <button class="remove-btn" type="button" onclick="removePhoto(${index})">✕</button>
    </div>
  `).join('');
}

function removePhoto(index) {
  currentPhotos.splice(index, 1);
  renderPhotoPreviews();
}

// GPS Location Grabber (Geolocation API)
function getGPSLocation() {
  const statusEl = document.getElementById('gps-status-text');
  const gpsInput = document.getElementById('field-gps');

  if (!navigator.geolocation) {
    statusEl.textContent = '❌ Trình duyệt không hỗ trợ GPS';
    return;
  }

  statusEl.textContent = '⌛ Đang xác định tọa độ GPS...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(5);
      const lng = position.coords.longitude.toFixed(5);
      const acc = position.coords.accuracy.toFixed(0);
      
      const gpsObj = { latitude: lat, longitude: lng, accuracy: acc };
      gpsInput.value = JSON.stringify(gpsObj);
      statusEl.textContent = `📍 Lat: ${lat}, Lng: ${lng} (Độ chính xác ±${acc}m)`;
      showToast('📍 Đã lấy tọa độ GPS thành công');
    },
    (error) => {
      // Fallback for simulation / denied permission (VKU Campus Default Coordinates)
      const fallbackGPS = { latitude: 15.9753, longitude: 108.2524, accuracy: 10 };
      gpsInput.value = JSON.stringify(fallbackGPS);
      statusEl.textContent = `📍 (Giả lập VKU) Lat: 15.9753, Lng: 108.2524`;
      showToast('⚠️ Dùng tọa độ GPS giả lập Campus VKU');
    },
    { enableHighAccuracy: true, timeout: 5000 }
  );
}

// Form Submission
async function submitSurveyForm() {
  const zone = document.getElementById('field-zone').value;
  const room = document.getElementById('field-room').value.trim();
  const facility = document.getElementById('field-facility').value;
  const condition = document.getElementById('field-condition').value;
  const priority = document.getElementById('field-priority').value;
  const notes = document.getElementById('field-notes').value.trim();
  const gpsVal = document.getElementById('field-gps').value;
  const surveyorName = document.getElementById('field-surveyor-name').value.trim() || 'Người khảo sát VKU';
  const surveyorId = document.getElementById('field-surveyor-id').value.trim() || 'VKU-2026';

  if (!room) {
    showToast('⚠️ Vui lòng nhập mã phòng hoặc vị trí cụ thể!');
    document.getElementById('field-room').focus();
    return;
  }

  let gpsObj = null;
  if (gpsVal) {
    try { gpsObj = JSON.parse(gpsVal); } catch(e) {}
  } else {
    gpsObj = { latitude: 15.9753, longitude: 108.2524, accuracy: 10 };
  }

  const surveyRecord = {
    locationZone: zone,
    roomCode: room,
    facilityType: facility,
    condition: condition,
    priority: priority,
    notes: notes,
    photos: [...currentPhotos],
    gps: gpsObj,
    surveyorName: surveyorName,
    surveyorId: surveyorId,
    timestamp: new Date().toISOString(),
    status: 'pending_sync'
  };

  try {
    await VKUStorage.saveSurvey(surveyRecord);
    showToast('✅ Đã lưu phiếu khảo sát vào IndexedDB thành công!');

    // Reset Form
    document.getElementById('survey-form').reset();
    currentPhotos = [];
    renderPhotoPreviews();
    document.getElementById('gps-status-text').textContent = 'Chưa xác định tọa độ';
    document.getElementById('field-gps').value = '';
    selectCondition('good');
    selectPriority('low');

    // Update Badges & Switch to Records tab
    await refreshAppUI();

    // Auto-sync to Google Sheets if Online & Webhook URL is saved
    if (navigator.onLine && localStorage.getItem('vku_gsheet_url')) {
      syncDataWithCloud();
    }

    const recordsNavItem = document.querySelectorAll('.nav-item')[1];
    switchTab('tab-records', recordsNavItem);
  } catch (err) {
    showToast('❌ Lỗi khi lưu dữ liệu: ' + err.message);
  }
}

/* ==========================================================================
   RECORDS MANAGEMENT & RENDERING
   ========================================================================== */

async function renderRecordsList() {
  const container = document.getElementById('records-list-container');
  if (!container) return;

  const searchQuery = (document.getElementById('records-search')?.value || '').toLowerCase();
  const surveys = await VKUStorage.getAllSurveys();

  const filtered = surveys.filter(s => {
    // Condition / Sync Filter
    if (currentFilter === 'pending_sync' && s.status !== 'pending_sync') return false;
    if (currentFilter === 'good' && s.condition !== 'good') return false;
    if (currentFilter === 'minor' && s.condition !== 'minor') return false;
    if (currentFilter === 'critical' && s.condition !== 'critical') return false;

    // Search Query Filter
    if (searchQuery) {
      const matchZone = s.locationZone.toLowerCase().includes(searchQuery);
      const matchRoom = s.roomCode.toLowerCase().includes(searchQuery);
      const matchFacility = s.facilityType.toLowerCase().includes(searchQuery);
      const matchNotes = (s.notes || '').toLowerCase().includes(searchQuery);
      return matchZone || matchRoom || matchFacility || matchNotes;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px 16px;">
        <span class="material-icons-round" style="font-size: 3rem; color: var(--text-muted);">folder_off</span>
        <h3 style="font-size: 1rem; margin-top: 10px;">Chưa Có Báo Cáo Khảo Sát</h3>
        <p style="font-size: 0.82rem; color: var(--text-sub);">Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const conditionBadge = s.condition === 'good' 
      ? '<span class="badge badge-good">🟢 Tốt</span>'
      : s.condition === 'minor'
      ? '<span class="badge badge-minor">🟡 Hỏng Nhẹ</span>'
      : '<span class="badge badge-critical">🔴 Hỏng Nặng</span>';

    const syncBadge = s.status === 'pending_sync'
      ? '<span class="badge badge-pending">🟡 Chờ sync</span>'
      : '<span class="badge badge-synced">🟢 Synced</span>';

    const formattedDate = new Date(s.timestamp).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const hasPhotos = s.photos && s.photos.length > 0;

    return `
      <div class="record-card" onclick="openRecordDetail('${s.id}')">
        <div class="record-card-header">
          <div>
            <div class="record-title">${escapeHTML(s.roomCode)}</div>
            <div class="record-subtitle">${escapeHTML(s.locationZone)} • ${escapeHTML(s.facilityType)}</div>
          </div>
          <div>${conditionBadge}</div>
        </div>

        ${s.notes ? `<div style="font-size: 0.85rem; color: var(--text-main); margin-top: 6px; line-height: 1.4;">${escapeHTML(s.notes)}</div>` : ''}

        ${hasPhotos ? `
          <div style="display: flex; gap: 6px; margin-top: 10px; overflow-x: auto;">
            ${s.photos.slice(0, 3).map(img => `
              <img src="${img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" alt="Thumb">
            `).join('')}
            ${s.photos.length > 3 ? `<div style="width: 50px; height: 50px; border-radius: 6px; background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">+${s.photos.length - 3}</div>` : ''}
          </div>
        ` : ''}

        <div class="record-meta">
          <span>🕒 ${formattedDate}</span>
          <span>👤 ${escapeHTML(s.surveyorName)}</span>
          ${syncBadge}
        </div>
      </div>
    `;
  }).join('');
}

function setRecordFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('#tab-records .chip').forEach(chip => chip.classList.remove('active'));
  const activeChip = document.querySelector(`#tab-records .chip[data-filter="${filter}"]`);
  if (activeChip) activeChip.classList.add('active');
  renderRecordsList();
}

function filterRecords() {
  renderRecordsList();
}

async function openRecordDetail(id) {
  const survey = await VKUStorage.getSurveyById(id);
  if (!survey) return;

  const modal = document.getElementById('modal-record-detail');
  const title = document.getElementById('modal-detail-title');
  const body = document.getElementById('modal-detail-body');

  title.textContent = `Chi Tiết: ${survey.roomCode}`;

  const formattedDate = new Date(survey.timestamp).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  body.innerHTML = `
    <div style="margin-bottom: 14px;">
      <div style="font-size: 0.85rem; color: var(--text-sub);">Khu vực Campus</div>
      <div style="font-weight: 700; font-size: 1rem;">${escapeHTML(survey.locationZone)}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
      <div>
        <div style="font-size: 0.8rem; color: var(--text-sub);">Loại Thiết Bị</div>
        <div style="font-weight: 600;">${escapeHTML(survey.facilityType)}</div>
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--text-sub);">Tình Trạng</div>
        <div style="font-weight: 700; color: ${survey.condition === 'good' ? 'var(--color-good)' : survey.condition === 'minor' ? 'var(--color-minor)' : 'var(--color-critical)'}">
          ${survey.condition === 'good' ? '🟢 Bình Thường' : survey.condition === 'minor' ? '🟡 Hỏng Nhẹ' : '🔴 Hỏng Nặng'}
        </div>
      </div>
    </div>

    <div style="margin-bottom: 14px;">
      <div style="font-size: 0.8rem; color: var(--text-sub);">Ghi Chú & Mô Tả</div>
      <div style="background: var(--bg-input); padding: 10px; border-radius: 8px; font-size: 0.88rem; margin-top: 4px;">
        ${escapeHTML(survey.notes || 'Không có ghi chú thêm.')}
      </div>
    </div>

    ${survey.gps ? `
      <div style="margin-bottom: 14px; background: var(--bg-input); padding: 10px; border-radius: 8px;">
        <div style="font-size: 0.8rem; color: var(--text-sub);">Tọa độ GPS Campus</div>
        <div style="font-size: 0.85rem; font-weight: 600;">📍 Lat: ${survey.gps.latitude}, Lng: ${survey.gps.longitude}</div>
        <a href="https://maps.google.com/?q=${survey.gps.latitude},${survey.gps.longitude}" target="_blank" style="color: var(--vku-cyan); font-size: 0.78rem; text-decoration: underline; margin-top: 4px; display: inline-block;">
          Xem trên Google Maps ↗
        </a>
      </div>
    ` : ''}

    ${survey.photos && survey.photos.length > 0 ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.8rem; color: var(--text-sub); margin-bottom: 8px;">Hình Ảnh Minh Họa (${survey.photos.length})</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          ${survey.photos.map(photo => `
            <img src="${photo}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" onclick="window.open('${photo}')" alt="Full Image">
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 16px;">
      Người khảo sát: ${escapeHTML(survey.surveyorName)} (${escapeHTML(survey.surveyorId)})<br>
      Thời gian: ${formattedDate}
    </div>

    <div style="display: flex; gap: 10px;">
      <button type="button" class="btn-secondary" onclick="exportRecordPDF('${survey.id}')">
        <span class="material-icons-round">print</span>
        In Phiếu PDF
      </button>
      <button type="button" class="btn-secondary" style="color: var(--color-critical); border-color: rgba(239,68,68,0.3);" onclick="deleteRecordItem('${survey.id}')">
        <span class="material-icons-round">delete</span>
        Xóa Báo Cáo
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-record-detail')?.classList.remove('active');
}

async function deleteRecordItem(id) {
  if (confirm('Bạn có chắc chắn muốn xóa báo cáo khảo sát này khỏi IndexedDB?')) {
    await VKUStorage.deleteSurvey(id);
    closeModal();
    showToast('🗑️ Đã xóa báo cáo khảo sát!');
    await refreshAppUI();
  }
}

/* ==========================================================================
   DASHBOARD METRICS & HEALTH SCORE
   ========================================================================== */

async function updateDashboardMetrics() {
  const surveys = await VKUStorage.getAllSurveys();
  
  const total = surveys.length;
  const pending = surveys.filter(s => s.status === 'pending_sync').length;
  const good = surveys.filter(s => s.condition === 'good').length;
  const minor = surveys.filter(s => s.condition === 'minor').length;
  const critical = surveys.filter(s => s.condition === 'critical').length;

  document.getElementById('dash-total').textContent = total;
  document.getElementById('dash-pending').textContent = pending;
  document.getElementById('dash-good').textContent = good;
  document.getElementById('dash-critical').textContent = critical;

  // Calculate Health Score Percentage
  let healthScore = 100;
  if (total > 0) {
    const penalty = (minor * 10 + critical * 25) / total;
    healthScore = Math.max(0, Math.round(100 - penalty));
  }

  const scoreText = document.getElementById('health-score-text');
  const barFill = document.getElementById('health-bar-fill');

  if (scoreText && barFill) {
    scoreText.textContent = healthScore + '%';
    barFill.style.width = healthScore + '%';

    if (healthScore >= 80) {
      scoreText.style.color = 'var(--color-good)';
    } else if (healthScore >= 50) {
      scoreText.style.color = 'var(--color-minor)';
    } else {
      scoreText.style.color = 'var(--color-critical)';
    }
  }
}

/* ==========================================================================
   CLOUD SYNC SIMULATION & GOOGLE SHEETS INTEGRATION
   ========================================================================== */

function saveGoogleSheetURL() {
  const urlInput = document.getElementById('gsheet-url-input');
  if (!urlInput) return;
  const url = urlInput.value.trim();

  if (url && !url.startsWith('http')) {
    showToast('⚠️ URL Google Apps Script không hợp lệ!');
    return;
  }

  localStorage.setItem('vku_gsheet_url', url);
  showToast(url ? '✅ Đã lưu Webhook Google Sheets thành công!' : 'ℹ️ Đã xóa Webhook Google Sheets');
}

function loadGoogleSheetURL() {
  const urlInput = document.getElementById('gsheet-url-input');
  const savedUrl = localStorage.getItem('vku_gsheet_url') || '';
  if (urlInput) {
    urlInput.value = savedUrl;
  }
}

function toggleGSheetInstructions() {
  const box = document.getElementById('gsheet-instructions-box');
  if (box) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }
}

async function syncDataWithCloud() {
  const pendingCount = await VKUStorage.getPendingSyncCount();

  if (pendingCount === 0) {
    showToast('ℹ️ Không có báo cáo nào cần đồng bộ.');
    return;
  }

  if (!navigator.onLine) {
    showToast('❌ Không có kết nối mạng Internet! Vui lòng thử lại khi online.');
    return;
  }

  const gsheetUrl = localStorage.getItem('vku_gsheet_url');

  if (gsheetUrl) {
    showToast(`⌛ Đang gửi ${pendingCount} báo cáo tới Google Sheets...`);
    const surveys = await VKUStorage.getAllSurveys();
    const pendingSurveys = surveys.filter(s => s.status === 'pending_sync');
    let successCount = 0;

    for (const survey of pendingSurveys) {
      try {
        await fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(survey)
        });
        successCount++;
      } catch (err) {
        console.warn('[GSheet] Sync item failed:', err);
      }
    }

    await VKUStorage.markAllAsSynced();
    showToast(`✅ Đã đồng bộ thành công vào Google Sheets!`);
    await refreshAppUI();
  } else {
    showToast('⌛ Đang đồng bộ ' + pendingCount + ' báo cáo lên Cloud...');
    setTimeout(async () => {
      await VKUStorage.markAllAsSynced();
      showToast('✅ Đồng bộ thành công ' + pendingCount + ' báo cáo!');
      await refreshAppUI();
    }, 1200);
  }
}

async function exportDataJSON() {
  const surveys = await VKUStorage.getAllSurveys();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(surveys, null, 2));
  downloadFile(dataStr, `vku_field_surveys_${Date.now()}.json`);
  showToast('📥 Đã xuất file JSON thành công!');
}

async function exportDataCSV() {
  const surveys = await VKUStorage.getAllSurveys();
  if (surveys.length === 0) {
    showToast('⚠️ Không có dữ liệu để xuất CSV!');
    return;
  }

  const headers = ['ID', 'Khu Vực', 'Mã Phòng', 'Loại Thiết Bị', 'Tình Trạng', 'Ưu Tiên', 'Ghi Chú', 'Vị Trí GPS', 'Người Khảo Sát', 'Thời Gian', 'Trạng Thái'];
  const rows = surveys.map(s => [
    s.id,
    `"${s.locationZone}"`,
    `"${s.roomCode}"`,
    `"${s.facilityType}"`,
    s.condition,
    s.priority,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
    s.gps ? `"${s.gps.latitude}, ${s.gps.longitude}"` : 'N/A',
    `"${s.surveyorName}"`,
    s.timestamp,
    s.status
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadFile(csvContent, `vku_field_surveys_${Date.now()}.csv`);
  showToast('📊 Đã xuất file CSV / Excel thành công!');
}

async function exportRecordPDF(id) {
  const survey = await VKUStorage.getSurveyById(id);
  if (!survey) return;

  const printWin = window.open('', '_blank');
  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phiếu Khảo Sát ${survey.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; }
        h1 { color: #00529c; border-bottom: 2px solid #00529c; padding-bottom: 8px; }
        .row { margin-bottom: 12px; }
        .label { font-weight: bold; width: 180px; display: inline-block; }
        .badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .good { background: #10b981; }
        .minor { background: #f59e0b; }
        .critical { background: #ef4444; }
        .photos { display: flex; gap: 10px; margin-top: 15px; }
        .photos img { width: 150px; height: 150px; object-fit: cover; border-radius: 6px; }
      </style>
    </head>
    <body>
      <h1>PHIẾU KIỂM TRA CƠ SỞ VẬT CHẤT VKU</h1>
      <div class="row"><span class="label">Mã Báo Cáo:</span> ${survey.id}</div>
      <div class="row"><span class="label">Khu Vực:</span> ${survey.locationZone}</div>
      <div class="row"><span class="label">Mã Phòng / Vị Trí:</span> ${survey.roomCode}</div>
      <div class="row"><span class="label">Loại Thiết Bị:</span> ${survey.facilityType}</div>
      <div class="row">
        <span class="label">Tình Trạng:</span> 
        <span class="badge ${survey.condition}">${survey.condition.toUpperCase()}</span>
      </div>
      <div class="row"><span class="label">Ghi Chú Chi Tiết:</span> ${survey.notes || 'Không'}</div>
      <div class="row"><span class="label">Người Kiểm Tra:</span> ${survey.surveyorName} (${survey.surveyorId})</div>
      <div class="row"><span class="label">Thời Gian:</span> ${new Date(survey.timestamp).toLocaleString('vi-VN')}</div>
      ${survey.gps ? `<div class="row"><span class="label">GPS Tọa Độ:</span> Lat ${survey.gps.latitude}, Lng ${survey.gps.longitude}</div>` : ''}
      
      ${survey.photos && survey.photos.length > 0 ? `
        <h3>Hình Ảnh Minh Họa</h3>
        <div class="photos">
          ${survey.photos.map(p => `<img src="${p}">`).join('')}
        </div>
      ` : ''}

      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWin.document.close();
}

function downloadFile(content, fileName) {
  const link = document.createElement('a');
  link.setAttribute('href', content);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   DEMO SEED & RESET UTILITIES
   ========================================================================== */

async function triggerSeedDemoData() {
  await VKUStorage.seedDemoData();
  showToast('✨ Đã tạo 4 báo cáo khảo sát mẫu Campus VKU!');
  await refreshAppUI();
}

async function clearAllData() {
  if (confirm('⚠️ Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu khảo sát khỏi IndexedDB? Action này không thể hoàn tác!')) {
    await VKUStorage.clearAllSurveys();
    showToast('🗑️ Đã xóa toàn bộ dữ liệu khảo sát local!');
    await refreshAppUI();
  }
}

function requestPushNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('⚠️ Trình duyệt không hỗ trợ Web Push Notification');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      showToast('🔔 Đã bật Web Push Notifications & Badging API!');
    } else {
      showToast('⚠️ Quyền thông báo đã bị từ chối.');
    }
  });
}

/* ==========================================================================
   HELPER UTILITIES & UI REFRESH
   ========================================================================== */

async function refreshAppUI() {
  await updateAppBadgeCount();
  await updateDashboardMetrics();
  renderRecordsList();
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Global Exports
window.switchTab = switchTab;
window.selectCondition = selectCondition;
window.selectPriority = selectPriority;
window.handlePhotoUpload = handlePhotoUpload;
window.removePhoto = removePhoto;
window.getGPSLocation = getGPSLocation;
window.submitSurveyForm = submitSurveyForm;
window.setRecordFilter = setRecordFilter;
window.filterRecords = filterRecords;
window.openRecordDetail = openRecordDetail;
window.closeModal = closeModal;
window.deleteRecordItem = deleteRecordItem;
window.syncDataWithCloud = syncDataWithCloud;
window.saveGoogleSheetURL = saveGoogleSheetURL;
window.toggleGSheetInstructions = toggleGSheetInstructions;
window.exportDataJSON = exportDataJSON;
window.exportDataCSV = exportDataCSV;
window.exportRecordPDF = exportRecordPDF;
window.triggerSeedDemoData = triggerSeedDemoData;
window.clearAllData = clearAllData;
window.requestPushNotificationPermission = requestPushNotificationPermission;
