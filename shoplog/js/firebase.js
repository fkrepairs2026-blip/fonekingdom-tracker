// ═══════════════════════════════════════
// FONEKINGDOM SHOPLOG — Firebase Module
// ═══════════════════════════════════════
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const cfg = {
  apiKey:            "AIzaSyBC7UvoqwOHIf2Qjvi1YkxDtQzPJP3AGDM",
  authDomain:        "fkrepairs-a6360.firebaseapp.com",
  projectId:         "fkrepairs-a6360",
  storageBucket:     "fkrepairs-a6360.firebasestorage.app",
  messagingSenderId: "84992727126",
  appId:             "1:84992727126:web:f761ec11c3ea6415e003f7"
};

// Use a named app — getApp() returns existing instance if already initialized
const _app = getApps().find(a => a.name === 'shoplog') ?? initializeApp(cfg, 'shoplog');

export const auth = getAuth(_app);
export const db   = getFirestore(_app);

// ─── Constants ───────────────────────────
export const ADMIN_EMAILS   = ['jay111786@gmail.com'];
export const COL_REPAIRS    = 'repairs';          // main repair logs
export const COL_USERS      = 'shoplog_users';    // user profiles
export const COL_ATTENDANCE = 'shoplog_attendance'; // daily time-in/out

// ─── Commission rates ─────────────────────
// Per-repair commission (% of net profit):
//   Lester: 40%  → shop gets 60%
//   Eder:   20%  + ₱200/day worked → shop gets 80% gross - daily bonus
//   Owner:  60%  personal → shop gets 40%
export const RATES = {
  Lester: { personal: 0.40, shop: 0.60 },
  Eder:   { personal: 0.20, shop: 0.80, dailyBonus: 200 },
  Owner:  { personal: 0.60, shop: 0.40 },
};
