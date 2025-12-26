// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC7UvoqwOHIf2Qjvi1YkxDtQzPJP3AGDM",
  authDomain: "fkrepairs-a6360.firebaseapp.com",
  databaseURL: "https://fkrepairs-a6360-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fkrepairs-a6360",
  storageBucket: "fkrepairs-a6360.firebasestorage.app",
  messagingSenderId: "84992727126",
  appId: "1:84992727126:web:cf1e10fd7e8d0ffbe003f7",
  measurementId: "G-J3SND1GS9C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
