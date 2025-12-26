// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAeaBy4XBlWB3XmVYaAidvvCJyDZqBFOz8",
    authDomain: "fkrepairs2026.firebaseapp.com",
    databaseURL: "https://fkrepairs2026-default-rtdb.firebaseio.com",
    projectId: "fkrepairs2026",
    storageBucket: "fkrepairs2026.appspot.com",
    messagingSenderId: "1064226481575",
    appId: "1:1064226481575:web:7c1a0bb33ad1c5e5c9e8f0"
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
