// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC7UvoqwOHIf2Qjvi1YkxDtQzPJP3AGDM",
  authDomain: "fkrepairs-a6360.firebaseapp.com",
  databaseURL: "https://fkrepairs-a6360-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fkrepairs-a6360",
  storageBucket: "fkrepairs-a6360.firebasestorage.app",
  messagingSenderId: "84992727126",
  appId: "1:84992727126:web:f761ec11c3ea6415e003f7",
  measurementId: "G-NP4B6GXHBL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable offline persistence
firebase.database().enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Offline persistence disabled: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Offline persistence not supported by browser');
    }
  });

// Firebase Services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;

// Initialize offline support
window.isOnline = true;
window.offlineQueue = [];

// Monitor connection state
db.ref('.info/connected').on('value', (snapshot) => {
  const connected = snapshot.val();
  window.isOnline = connected;
  console.log(connected ? '✅ Online' : '📡 Offline');
  
  // Update UI indicator
  if (typeof updateOfflineIndicator === 'function') {
    updateOfflineIndicator();
  }
  
  // Process offline queue when reconnecting
  if (connected && window.offlineQueue.length > 0) {
    console.log(`🔄 Processing ${window.offlineQueue.length} offline items...`);
    if (typeof processOfflineQueue === 'function') {
      processOfflineQueue();
    }
  }
});
