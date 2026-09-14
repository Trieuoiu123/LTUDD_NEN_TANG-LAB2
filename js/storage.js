/* ==========================================================================
   STORAGE ENGINE - IndexedDB & Local Storage Fallback
   Offline-first local storage for VKU Field Survey PWA
   ========================================================================== */

const DB_NAME = 'VKUSurveyDB';
const DB_VERSION = 1;
const STORE_SURVEYS = 'surveys';
const STORE_SETTINGS = 'settings';

let dbInstance = null;

/**
 * Initialize IndexedDB Database
 */
function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('[Storage] IndexedDB Open Error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('[Storage] IndexedDB Initialized Successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create Surveys Object Store
      if (!db.objectStoreNames.contains(STORE_SURVEYS)) {
        const surveyStore = db.createObjectStore(STORE_SURVEYS, { keyPath: 'id' });
        surveyStore.createIndex('locationZone', 'locationZone', { unique: false });
        surveyStore.createIndex('condition', 'condition', { unique: false });
        surveyStore.createIndex('status', 'status', { unique: false });
        surveyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create Settings Store
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Save or Update a Field Survey Record
 */
async function saveSurvey(survey) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURVEYS, 'readwrite');
    const store = tx.objectStore(STORE_SURVEYS);

    if (!survey.id) {
      survey.id = 'SURVEY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    if (!survey.timestamp) {
      survey.timestamp = new Date().toISOString();
    }
    if (!survey.status) {
      survey.status = 'pending_sync';
    }

    const request = store.put(survey);

    request.onsuccess = () => {
      console.log('[Storage] Survey saved:', survey.id);
      resolve(survey);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Retrieve All Survey Records (Sorted by newest first)
 */
async function getAllSurveys() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURVEYS, 'readonly');
    const store = tx.objectStore(STORE_SURVEYS);
    const request = store.getAll();

    request.onsuccess = () => {
      const surveys = request.result || [];
      surveys.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(surveys);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Retrieve a Single Survey by ID
 */
async function getSurveyById(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURVEYS, 'readonly');
    const store = tx.objectStore(STORE_SURVEYS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete a Survey Record
 */
async function deleteSurvey(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURVEYS, 'readwrite');
    const store = tx.objectStore(STORE_SURVEYS);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('[Storage] Survey deleted:', id);
      resolve(true);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Count Unsynced Reports
 */
async function getPendingSyncCount() {
  const surveys = await getAllSurveys();
  return surveys.filter(s => s.status === 'pending_sync').length;
}

/**
 * Mark All Pending Reports as Synced
 */
async function markAllAsSynced() {
  const surveys = await getAllSurveys();
  const db = await initDB();
  const tx = db.transaction(STORE_SURVEYS, 'readwrite');
  const store = tx.objectStore(STORE_SURVEYS);

  surveys.forEach(survey => {
    if (survey.status === 'pending_sync') {
      survey.status = 'synced';
      survey.syncedAt = new Date().toISOString();
      store.put(survey);
    }
  });

  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
}

/**
 * Clear All Local Survey Data
 */
async function clearAllSurveys() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SURVEYS, 'readwrite');
    const store = tx.objectStore(STORE_SURVEYS);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Seed Demo Data for VKU Campus Facilities
 */
async function seedDemoData() {
  const demoSurveys = [
    {
      id: 'SURVEY-DEMO-001',
      locationZone: 'Khu A - Tòa Nhà Hành Chính',
      roomCode: 'A.102 - Phòng Hội Thảo',
      facilityType: 'Máy chiếu & Màn hình',
      condition: 'critical',
      priority: 'urgent',
      notes: 'Máy chiếu EPSON bị chập chờn màu đỏ, cáp HDMI chập mạch khi sử dụng giảng dạy.',
      photos: [],
      gps: { latitude: 15.9753, longitude: 108.2524, accuracy: 12 },
      surveyorName: 'Nguyễn Văn Anh',
      surveyorId: '21IT001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'pending_sync'
    },
    {
      id: 'SURVEY-DEMO-002',
      locationZone: 'Khu B - Giảng Đường',
      roomCode: 'B.304 - Giảng Đường 300 Chỗ',
      facilityType: 'Điều hòa & Quạt',
      condition: 'minor',
      priority: 'medium',
      notes: 'Điều hòa Daikin số 2 chảy nước nhẹ ở góc bên trái, vẫn mát bình thường.',
      photos: [],
      gps: { latitude: 15.9758, longitude: 108.2530, accuracy: 8 },
      surveyorName: 'Trần Thị Bình',
      surveyorId: '21IT045',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'pending_sync'
    },
    {
      id: 'SURVEY-DEMO-003',
      locationZone: 'Khu E - Thư Viện & CNTT',
      roomCode: 'Lab AI & BigData (Phòng E.201)',
      facilityType: 'Mạng & Wifi',
      condition: 'good',
      priority: 'low',
      notes: 'Kiểm tra định kỳ 30 máy trạm GPU - Tất cả hoạt động tốt, tốc độ mạng 1Gbps ổn định.',
      photos: [],
      gps: { latitude: 15.9760, longitude: 108.2520, accuracy: 5 },
      surveyorName: 'Lê Hoàng Cường',
      surveyorId: 'VKU-GV012',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: 'synced'
    },
    {
      id: 'SURVEY-DEMO-004',
      locationZone: 'Khu C - Ký Túc Xá',
      roomCode: 'KTX C2 - Phòng 305',
      facilityType: 'Thiết bị Vệ sinh',
      condition: 'critical',
      priority: 'high',
      notes: 'Vòi nước lavabo bị rò rỉ mạnh, hỏng van khóa nước phòng tắm.',
      photos: [],
      gps: { latitude: 15.9745, longitude: 108.2535, accuracy: 15 },
      surveyorName: 'Phạm Minh Đức',
      surveyorId: '22IT102',
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'pending_sync'
    }
  ];

  for (const s of demoSurveys) {
    await saveSurvey(s);
  }
  console.log('[Storage] Seeded 4 demo survey items for VKU Campus');
}

// Export Storage API to global window
window.VKUStorage = {
  initDB,
  saveSurvey,
  getAllSurveys,
  getSurveyById,
  deleteSurvey,
  getPendingSyncCount,
  markAllAsSynced,
  clearAllSurveys,
  seedDemoData
};
