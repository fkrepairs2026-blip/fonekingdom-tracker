// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Firebase Services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
