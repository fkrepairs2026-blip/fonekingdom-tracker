# Fonekingdom Repair Tracker - AI Assistant Instructions

## Project Context
Mobile phone repair shop management system. **Tech Stack:** Vanilla JavaScript, Firebase Realtime Database, Firebase Auth. **Deployment:** GitHub Pages. **No build process** - edit and push directly to main.

## Critical Architecture Patterns

### 1. Global State Management
```javascript
// State lives on window object - initialized in auth.js, used everywhere
window.currentUser = firebase.auth().currentUser;     // Firebase user object
window.currentUserData = { role, displayName, ... };  // User data from DB
window.allRepairs = [];                               // Live repairs list
window.allInventoryItems = [];                        // Inventory items
```

### 2. Real-time Data Flow (Critical!)
```javascript
// Firebase listeners in repairs.js update global arrays automatically
db.ref('repairs').on('value', (snapshot) => {
    window.allRepairs = [...]; // Populate from snapshot
    
    // CRITICAL: Auto-refresh current tab when data changes
    if (window.currentTabRefresh) {
        setTimeout(() => window.currentTabRefresh(), 400);
    }
});
```
**Key:** Data flows Firebase → Global Array → Auto-refresh → UI Update. Never query Firebase from UI code; always use `window.allRepairs`.

### 3. Tab/View System (ui.js)
Each tab sets its own refresh callback:
```javascript
function buildMyTab(container) {
    // FIRST: Set refresh callback (called on data changes)
    window.currentTabRefresh = () => buildMyTab(
        document.getElementById('myTabId')
    );
    
    // THEN: Render UI
    container.innerHTML = generateHTML();
}
```

### 4. Function Export Pattern (MANDATORY)
```javascript
// All functions called from HTML onclick must be exported
function myFunction() { }

// At end of file
window.myFunction = myFunction;
```
**If forgotten:** `Uncaught ReferenceError: myFunction is not defined`

### 5. Loading State Pattern
```javascript
try {
    utils.showLoading(true);
    await firebaseOperation();
    utils.showLoading(false);  // MUST hide on success
    
    // Trigger refresh
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
} catch (error) {
    utils.showLoading(false);  // MUST hide on error
    alert('Error: ' + error.message);
}
```

## Role-Based Access Control
Roles: `admin`, `manager`, `cashier`, `technician`. Check `window.currentUserData.role` before:
- **Admin:** Full access, user management, delete operations
- **Manager:** Operations, can't manage users
- **Cashier:** Payments, device release, NO repair pricing
- **Technician:** Accept repairs, set pricing, NO payments

See [.cursorrules](.cursorrules#L117) for full permission matrix.

## Firebase Operations

### Update Pattern (Most Common)
```javascript
await db.ref(`repairs/${repairId}`).update({
    status: 'In Progress',
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: window.currentUserData.displayName
});
// Listener auto-refreshes, no manual refresh needed
```

### Create Pattern
```javascript
const newRef = await db.ref('repairs').push({
    customerName: name,
    createdAt: new Date().toISOString(),
    createdBy: window.currentUser.uid,
    // ...
});
const repairId = newRef.key;
```

### Soft Delete (Never Hard Delete)
```javascript
await db.ref(`repairs/${repairId}`).update({
    deleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy: window.currentUserData.displayName
});
```

## Common Pitfalls

❌ **Missing comma in utils object:**
```javascript
utils = {
    method1: function() { },
    method2: function() { }  // Syntax error if comma missing above!
}
```

❌ **Forgetting to export functions:**
```html
<button onclick="handleClick()">  <!-- Breaks if not exported -->
```

❌ **Not hiding loading on error:**
```javascript
try {
    utils.showLoading(true);
    await operation();
    // Forgot utils.showLoading(false) on error path
}
```

## File Organization
- [index.html](index.html) - Single-page app shell, modals defined inline
- [js/app.js](js/app.js) - Initialization orchestrator (`initializeApp`)
- [js/auth.js](js/auth.js) - Login/logout, sets `window.currentUser/currentUserData`
- [js/repairs.js](js/repairs.js) - Firebase operations, business logic (10K+ lines)
- [js/ui.js](js/ui.js) - Tab builders, all UI rendering (6K+ lines)
- [js/utils.js](js/utils.js) - Utilities: date formatting, loading indicator, image compression
- [js/inventory.js](js/inventory.js) - Inventory operations
- [js/analytics.js](js/analytics.js) - Stats and reports

## Key Workflows

**Device Intake:** `buildReceiveDeviceTab` in ui.js → `submitReceiveDevice` in repairs.js → Firebase push → Auto-refresh

**Accept Repair:** Technician clicks "Accept" → `acceptRepair(repairId)` → Updates `acceptedBy`, `status='In Progress'` → Auto-refresh

**Payment:** `recordPayment()` → Push to `repairs/{id}/payments` array → Cashier/admin verifies later

**Status Updates:** All use `updateRepairStatus(repairId, newStatus)` → Firebase update → Auto-refresh

## Development Workflow
1. **No build step** - Edit files directly
2. **Test locally:** Open [index.html](index.html) in browser (requires live server for modules)
3. **Commit:** `git commit -m "feat: description"`
4. **Deploy:** `git push origin main` → GitHub Pages auto-deploys

## Date Handling
```javascript
// Always use ISO format for storage
const now = new Date().toISOString();  // "2025-12-27T10:30:00.000Z"

// Display helpers
utils.formatDateTime(iso);  // "Dec 27, 2025, 10:30 AM"
utils.formatDate(iso);      // "Dec 27, 2025"
utils.daysAgo(iso);         // "2 days ago"
```

## Auto-Finalization System (Released → Completed)

### Background Checker
```javascript
// Runs every 5 minutes (300000ms), triggered in app.js
setInterval(checkAndAutoFinalizeReleased, 300000);
```

### Workflow
1. **Release Device:** Status set to "Released" (not "Claimed") with `releasedAt` timestamp
2. **Grace Period:** Devices stay "Released" until 6pm Manila time (or manual finalization)
3. **Auto-finalization:** At 6pm daily, all Released devices from that day/earlier → "Claimed"

### Key Functions
- `checkAndAutoFinalizeReleased()` - Main checker, runs at 6pm Manila time (18:00-18:10 window)
- `finalizeClaimDevice(repairId, isAutomatic)` - Finalizes device, sets warranty period
- `getCountdownTo6PM()` - Calculates time remaining for UI display

### Manila Timezone Handling
```javascript
// Always use Manila timezone for auto-finalization
const manilaTimeStr = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    hour12: false
});
```

### Manual Override
Users can finalize before 6pm via "Finalize Now" button → Opens modal for warranty setup (default 30 days).

## Modification Request System (Admin Approval)

### Purpose
Technicians can request changes that require admin approval:
- Payment date corrections
- Recorded date modifications  
- **Deletion requests** (own repairs only)

### Request Flow
```javascript
// 1. Technician creates request
await db.ref('modificationRequests').push({
    requestType: 'deletion_request' | 'payment-date' | 'recorded-date',
    repairId: repairId,
    requestedBy: window.currentUser.uid,
    requestedByName: window.currentUserData.displayName,
    reason: 'User explanation',
    status: 'pending',
    requestedAt: new Date().toISOString()
});

// 2. Admin reviews in "Mod Requests" tab
// 3. Admin approves/rejects via processModificationRequest()
```

### Deletion Requests (Technician-Specific)
- **Validation:** Technician must own repair (`technicianId === currentUser.uid`)
- **Restrictions:** Cannot delete completed/already deleted repairs
- **On Approval:** Soft delete + backup to `deletedRepairs` collection
- **Button Shows Only If:** No pending deletion request exists

### Key Functions
- `requestRepairDeletion(repairId)` - Technician creates deletion request (min 10 char reason)
- `processModificationRequest(requestId, action)` - Admin approves/rejects (admin-only)
- Check for pending: `window.allModificationRequests.some(r => r.repairId === id && r.status === 'pending')`

## Technician Remittance System

### Overview
Technicians collect payments/incur expenses → Submit daily remittance → Cashier/Admin verifies → Payments finalized.

### Payment Collection
```javascript
// Technician payments flagged differently
await savePayment({
    collectedByTech: true,
    remittanceStatus: 'pending',  // 'pending' | 'remitted' | 'verified'
    receivedById: window.currentUser.uid
});
```

### Daily Workflow
1. **Record Expenses:** Technician uses "Record Expense" button on repairs or from Daily Remittance tab
   - Categories: Delivery, Cash Advance, Transportation, Meals, Parts, Other
   - Stored in `techExpenses` collection
2. **Submit Remittance:** End of day, submit via `confirmRemittance()`
   - **Formula:** Expected = Total Payments - Total Expenses
   - Auto-detects discrepancies, requires explanation if amount differs
3. **Verification:** Cashier/Admin reviews in "Verify Remittance" tab
   - Approve: All payments marked `verified`, remittance status → 'verified'
   - Reject: Payments reset to 'pending', technician must resubmit

### Parts Cost Tracking
```javascript
// Record parts cost during repair
await db.ref(`repairs/${repairId}`).update({
    partsCost: 2000,
    partsCostNotes: 'LCD screen, battery',
    partsCostRecordedBy: window.currentUserData.displayName,
    partsCostRecordedAt: new Date().toISOString()
});
```

### Key Collections
- `techExpenses/{expenseId}` - Individual expenses (delivery, meals, etc.)
- `techRemittances/{remittanceId}` - Daily remittance submissions
  - Links to all payments/expenses for the day
  - Tracks expected vs actual amount, discrepancy percentage

### Key Functions
- `getTechDailyPayments()` - Gets pending payments for current technician today
- `getTechDailyExpenses()` - Gets expenses for current technician today
- `confirmRemittance()` - Submits remittance for verification
- `approveRemittance(remittanceId)` - Cashier/Admin verifies and approves
- `rejectRemittance(remittanceId)` - Resets payments to pending

### Discrepancy Handling
- **Minor (<5%):** Yellow warning, optional notes
- **Major (≥5%):** Red alert, MUST explain discrepancy

## Testing & Development Patterns

### Testing Locally
**⚠️ CRITICAL:** Firebase config in [js/firebase-config.js](js/firebase-config.js) points to **LIVE production database**.
- No separate test environment
- Test with caution - changes affect production
- Use test user accounts: `test-tech@example.com`, `test-cashier@example.com`
- Test repairs: Look for customers named "TEST" or "QA"

### Debugging Patterns
```javascript
// Extensive console logging already in place
console.log('🚀 Starting operation...');
console.log('✅ Success:', data);
console.log('❌ Error:', error);

// Check global state in browser console
console.log(window.allRepairs);
console.log(window.currentUserData);

// Force refresh current tab
if (window.currentTabRefresh) {
    window.currentTabRefresh();
}
```

### Common Testing Workflows
1. **Test Device Intake:** Use real phone brands/models, dummy contact numbers
2. **Test Payments:** Small amounts (₱1-₱10), use "Test Payment" in notes
3. **Test Status Changes:** Verify auto-refresh triggers correctly
4. **Test Role Permissions:** Switch user accounts to verify access control

### Emergency Cleanup Script
[index.html](index.html) includes auto-cleanup (runs every 100ms for 3 seconds on page load):
- Force hides loading indicator
- Closes all modals
- Prevents UI freezing bugs

## More Documentation
- [.cursorrules](.cursorrules) - Complete coding rules
- [.cursor/PROJECT.md](.cursor/PROJECT.md) - Full architecture, DB schema
- [.cursor/FEATURES.md](.cursor/FEATURES.md) - Feature specifications
- [.cursor/CODING_STANDARDS.md](.cursor/CODING_STANDARDS.md) - Detailed code standards
