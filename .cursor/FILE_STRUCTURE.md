# 📂 File Structure & Code Organization

## 🗂️ Complete File Tree

```
fonekingdom-tracker/
├── index.html                 # Main entry point
├── css/
│   └── styles.css            # All styling
├── js/
│   ├── firebase-config.js    # Firebase initialization
│   ├── utils.js              # Utility functions
│   ├── auth.js               # Authentication logic
│   ├── repairs.js            # Business logic & Firebase operations
│   ├── ui.js                 # UI rendering & tab management
│   └── app.js                # Main application initialization
└── README.md                 # Repository documentation
```

---

## 📄 File Descriptions

### **index.html** (Main Entry Point)
**Purpose:** Single-page application shell  
**Size:** ~150 lines  
**Key Sections:**
- Login screen
- Dashboard container
- Modal definitions (8 modals)
- Script includes
- Emergency cleanup scripts

**Modals Defined:**
1. `photoModal` - Photo viewer
2. `userModal` - User management
3. `paymentModal` - Payment recording
4. `statusModal` - Status updates
5. `additionalRepairModal` - Extra repairs
6. `profileModal` - User profile
7. `claimModal` - Device release & warranty

**Script Load Order (CRITICAL!):**
```html
1. Firebase SDKs (app, auth, database, storage)
2. firebase-config.js   ← Initialize Firebase
3. utils.js             ← Load utilities first
4. auth.js              ← Authentication handlers
5. repairs.js           ← Business logic
6. ui.js                ← UI builders
7. app.js               ← Main initialization
```

---

### **css/styles.css** (~400 lines)
**Purpose:** All application styling  
**Organization:**
```css
/* Reset & Base */
/* Login Screen */
/* Main App */
/* Header */
/* Stats Dashboard */
/* Tabs */
/* Cards & Repair Cards */
/* Badges (status, payment, user) */
/* Forms */
/* Buttons */
/* Photo Gallery */
/* Modals */
/* Profile */
/* Utility Classes */
/* Responsive */
/* Print Styles */
```

**Key Design Decisions:**
- Purple gradient theme (#667eea to #764ba2)
- Box-shadow depth effects
- Mobile-first responsive
- Print-friendly styles
- No external CSS frameworks

---

### **js/firebase-config.js** (~30 lines)
**Purpose:** Firebase initialization  
**Exports:**
- `window.auth` - Firebase Authentication
- `window.db` - Firebase Realtime Database
- `window.storage` - Firebase Storage

**Configuration:**
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "fkrepairs-a6360.firebaseapp.com",
  databaseURL: "https://fkrepairs-a6360-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fkrepairs-a6360",
  storageBucket: "fkrepairs-a6360.firebasestorage.app",
  // ...
};
```

---

### **js/utils.js** (~220 lines)
**Purpose:** Reusable utility functions  
**Pattern:** Object with methods

**Functions:**
```javascript
compressImage(file, maxWidth)     // Image compression to base64
formatDateTime(isoString)         // "Dec 27, 2025, 10:30 AM"
formatDate(isoString)             // "Dec 27, 2025"
getDefaultAvatar(name)            // Generate SVG avatar
showLoading(show)                 // Show/hide loading overlay
daysAgo(isoString)                // "2 days ago"
timeAgo(isoString)                // Alias for daysAgo
formatCurrency(amount)            // "₱2,500.00"
isValidEmail(email)               // Email validation
isValidPhone(phone)               // Philippine phone validation
generateId(length)                // Random ID generator
clone(obj)                        // Deep clone
debounce(func, wait)              // Debounce wrapper
```

**Critical Notes:**
- Line 128: Must have comma after showLoading closing brace
- All functions are synchronous except compressImage
- Uses Philippine peso symbol (₱)
- Phone validation for PH format (09XX or +639XX)

---

### **js/auth.js** (~270 lines)
**Purpose:** Authentication & user session management

**Global State:**
```javascript
window.currentUser = null;         // Firebase auth user
window.currentUserData = null;     // User data from database
let appInitialized = false;        // Prevents double init
```

**Key Functions:**
```javascript
handleLogin(e)                    // Email/password login
handleLogout()                    // Sign out & reload
recordLoginEvent(type)            // Track login/logout
updateProfilePicture(file)        // Upload avatar
updateUserAvatar(imageUrl)        // Update UI avatars
openProfileModal()                // Show profile & history
handleAvatarUpload(event)         // File input handler
closeProfileModal()               // Close profile modal
```

**Auth Flow:**
```javascript
1. handleLogin() → Firebase signIn
2. Load user data from /users/{uid}
3. Check status === 'active'
4. Record login event
5. Show app, hide login
6. Call initializeApp()
7. onAuthStateChanged() maintains session
```

**Important:**
- Never calls initializeApp() twice
- Maintains persistent sessions
- Records all login/logout events
- Profile modal shows last 20 logins

---

### **js/repairs.js** (~1800 lines) - LARGEST FILE
**Purpose:** Core business logic & Firebase operations

**Global State:**
```javascript
window.allRepairs = [];
window.allModificationRequests = [];
let photoData = [];                // Temporary photo storage
let paymentProofPhoto = null;      // Temporary payment photo
```

**Major Function Groups:**

**1. Data Loading (Lines 1-75)**
```javascript
loadRepairs()                     // Firebase listener for repairs
loadModificationRequests()        // Firebase listener for mod requests
```

**2. Device Receiving (Lines 76-185)**
```javascript
submitReceiveDevice(e)            // Main receive function
  ├─ Handles walk-in vs dealer
  ├─ Back job detection
  ├─ Auto-assignment logic
  └─ Photo upload
```

**3. Repair Management (Lines 186-250)**
```javascript
acceptRepair(repairId)            // Technician accepts job
handlePhotoUpload(input, previewId) // Photo compression & preview
```

**4. Payment System (Lines 250-750)**
```javascript
getTodayDate()                    // Get today in YYYY-MM-DD
isoToDateInput(isoString)         // Convert ISO to date input
openPaymentModal(repairId)        // Open payment modal
previewPaymentProof(input)        // Preview payment photo
savePayment(repairId)             // Record new payment
editPaymentDate(repairId, index)  // Open edit modal
savePaymentDateEdit(repairId, index) // Save date edit
verifyPayment(repairId, index)    // Verify payment
```

**5. Status Management (Lines 750-820)**
```javascript
updateRepairStatus(repairId)      // Open status modal
saveStatus(repairId)              // Update status
```

**6. Additional Repairs (Lines 820-900)**
```javascript
openAdditionalRepairModal(repairId) // Add extra repair
saveAdditionalRepair(repairId)    // Save additional work
```

**7. Deletion (Lines 900-930)**
```javascript
deleteRepair(repairId)            // Remove repair (admin only)
```

**8. Modification Requests (Lines 930-1300)**
```javascript
requestModification(repairId, changes) // Submit request
approveModification(requestId)    // Approve request
rejectModification(requestId)     // Reject request
```

**9. Warranty System (Lines 1300-1660) - NEW**
```javascript
openClaimModal(repairId)          // Open release modal
updateWarrantyInfo()              // Live warranty calculator
claimDevice(repairId)             // Release to customer
viewClaimDetails(repairId)        // View claim info
openWarrantyClaimModal(repairId)  // Handle warranty return
processWarrantyClaim(repairId)    // Create warranty repair
closeClaimModal()                 // Close modal
```

**10. Pricing Editor (Lines 1660-1760) - NEW**
```javascript
openEditRepairModal(repairId)     // Open pricing modal
submitPricingUpdate(e, repairId)  // Save pricing
```

**11. Modal Controllers (Lines 1760-1793)**
```javascript
closeStatusModal()
closeAdditionalRepairModal()
closePaymentModal()
```

**Exports (Critical!):**
All functions must be exported to window scope for onclick handlers to work.

---

### **js/ui.js** (~920 lines)
**Purpose:** UI rendering & tab management

**Tab System Architecture:**
```javascript
availableTabs = [
  { id: 'received', label: '📥 Received Devices', build: buildReceivedDevicesPage },
  { id: 'inprogress', label: '🔧 In Progress', build: buildInProgressPage },
  // ... etc
]
```

**Major Function Groups:**

**1. Tab Management (Lines 1-100)**
```javascript
buildTabs()                       // Main tab builder
  ├─ Role-based tab filtering
  ├─ Tab button rendering
  └─ Content area setup
renderTabs(tabs)                  // Render tabs & contents
switchTab(tabId)                  // Switch active tab
```

**2. Tab Content Builders (Lines 100-800)**
```javascript
buildReceivedDevicesPage(container)    // Received devices
buildInProgressPage(container)         // In progress repairs
buildForReleasePage(container)         // Ready for pickup
buildClaimedUnitsPage(container)       // Claimed with warranty - NEW
buildReceiveDeviceTab(container)       // Receive form
buildMyRepairsTab(container)           // Technician's jobs
buildAllRepairsPage(container)         // All repairs (admin)
buildPendingVerificationPage(container) // Pending payments
buildCashCountPage(container)          // Cash calculator
buildSupplierReportPage(container)     // Supplier breakdown
buildModificationRequestsTab(container) // Mod requests
buildUsersTab(container)               // User management
buildMyRequestsTab(container)          // Technician requests
```

**3. Helper Functions (Lines 800-920)**
```javascript
displayRepairsInContainer(repairs, container, options)
  ├─ Generates repair cards
  ├─ Role-based action buttons
  └─ Auto-refresh setup
  
handleProblemTypeChange()         // Show/hide warnings - NEW
openPhotoModal(photoUrl)          // Photo viewer
closePhotoModal()                 // Close photo
openUserModal(mode, userId)       // User management
closeUserModal()                  // Close user modal
```

**Critical Pattern:**
```javascript
// Each tab builder sets its refresh function
function buildReceivedDevicesPage(container) {
  window.currentTabRefresh = () => buildReceivedDevicesPage(
    document.getElementById('receivedTab')
  );
  // ... build content
}
```

---

### **js/app.js** (~400 lines)
**Purpose:** Main application initialization & coordination

**Functions:**
```javascript
initializeApp()                   // Main init function
  ├─ Verify user loaded
  ├─ Update header
  ├─ Load repairs
  ├─ Load mod requests
  ├─ Build stats
  └─ Build tabs
  
updateHeaderUserInfo()            // Update header with user
buildStats()                      // Build stats dashboard
  ├─ Role-based stats
  ├─ Count calculations
  └─ Dynamic card rendering
```

**Initialization Flow:**
```javascript
1. auth.js detects user login
2. Calls initializeApp()
3. Verifies currentUser & currentUserData
4. Updates header with user info
5. Loads all repairs (Firebase listener)
6. Loads modification requests
7. Builds stats dashboard
8. Builds tabs (role-based)
9. Hides loading overlay
10. App ready!
```

**Error Handling:**
```javascript
try {
  // Initialize
} catch (error) {
  // ALWAYS hide loading
  utils.showLoading(false);
  alert('Error: ' + error.message);
}
```

---

## 🔄 Data Flow Examples

### **Example 1: Accepting a Repair**
```
1. User clicks "Accept Repair" button
   → onclick="acceptRepair('repair-123')"

2. repairs.js:acceptRepair() executes
   → Updates Firebase: acceptedBy, status, etc.

3. Firebase listener in loadRepairs() triggers
   → Updates window.allRepairs
   → Calls window.currentTabRefresh()

4. Tab rebuilds with new data
   → Repair moves from "Received" to "My Jobs"

5. Stats dashboard updates
   → Count decreases in Received
   → Count increases in In Progress
```

### **Example 2: Recording Payment**
```
1. User clicks "💰 Payment" button
   → openPaymentModal('repair-123')

2. Modal displays with payment form
   → User enters amount, method, date

3. User clicks "Save Payment"
   → savePayment('repair-123')

4. Firebase updates repair.payments[]

5. Listener triggers
   → currentTabRefresh()
   → Payment appears in UI
   → Balance recalculates
```

---

## 🎯 Critical Code Locations

### **Must-Have Exports:**
Every function called from HTML onclick/onchange must be exported:
```javascript
window.functionName = functionName;
```

### **Auto-Refresh Pattern:**
After any Firebase update:
```javascript
if (window.currentTabRefresh) {
  window.currentTabRefresh();
}
```

### **Loading Management:**
```javascript
utils.showLoading(true);   // Before async operation
utils.showLoading(false);  // After completion & in catch
```

### **Date Handling:**
```javascript
// Store in Firebase
const date = new Date().toISOString();

// Display to user
utils.formatDateTime(date);  // "Dec 27, 2025, 10:30 AM"
utils.formatDate(date);      // "Dec 27, 2025"
```

---

## 🐛 Common Pitfalls

**1. Missing Comma in utils Object**
```javascript
// WRONG:
daysAgo: function() { }
timeAgo: function() { }  // ← Syntax Error!

// CORRECT:
daysAgo: function() { },  // ← Comma!
timeAgo: function() { },
```

**2. Forgot to Export Function**
```javascript
function myNewFunction() { }

// Don't forget:
window.myNewFunction = myNewFunction;
```

**3. Forgot Auto-Refresh**
```javascript
await db.ref('repairs/'+id).update(data);
alert('Success!');
// Don't forget:
if (window.currentTabRefresh) {
  window.currentTabRefresh();
}
```

**4. Not Hiding Loading on Error**
```javascript
try {
  utils.showLoading(true);
  await doSomething();
  utils.showLoading(false);  // ← Good
} catch (error) {
  utils.showLoading(false);  // ← Critical!
  alert('Error');
}
```

---

This file structure guide should help Cursor understand how the codebase is organized! 🎉
