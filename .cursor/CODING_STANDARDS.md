# 💻 Coding Standards & Best Practices

## 🎨 Code Style Guide

### **JavaScript Style**

#### **Naming Conventions**
```javascript
// Variables & Functions: camelCase
const userName = "Juan";
function calculateTotal() { }

// Constants: UPPER_SNAKE_CASE
const MAX_PHOTOS = 4;
const DEFAULT_WARRANTY_DAYS = 30;

// Classes: PascalCase (if ever used)
class RepairManager { }

// Private variables: leading underscore (convention)
let _internalState = null;

// Boolean variables: is/has/should prefix
const isBackJob = true;
const hasWarranty = false;
const shouldAutoAssign = true;
```

#### **Function Declaration Style**
```javascript
// Prefer function declarations for top-level
function submitReceiveDevice(e) {
  // ...
}

// Arrow functions for callbacks
availableTabs.forEach((tab) => {
  // ...
});

// Async/await for Firebase operations
async function loadRepairs() {
  const snapshot = await db.ref('repairs').once('value');
}
```

#### **String Handling**
```javascript
// Template literals for interpolation
const message = `Device: ${brand} ${model}`;

// Single quotes for simple strings
const status = 'In Progress';

// Backticks for multi-line
const html = `
  <div>
    <p>Content here</p>
  </div>
`;
```

#### **Comments**
```javascript
// Single-line comments for brief explanations
const total = partsCost + laborCost;  // Calculate total

/**
 * Multi-line JSDoc for functions
 * @param {string} repairId - The repair ID
 * @returns {Object} The repair object
 */
function getRepair(repairId) {
  // Implementation
}

// Section headers
// ===== PAYMENT MANAGEMENT =====

// Temporary debugging (remove before commit)
console.log('🐛 DEBUG:', variable);  // TODO: Remove
```

---

### **HTML Style**

#### **Indentation**
```html
<!-- 4 spaces for indentation -->
<div class="repair-card">
    <h4>Customer Name</h4>
    <div class="repair-info">
        <p>Details</p>
    </div>
</div>
```

#### **Attributes**
```html
<!-- Order: id, class, other, event handlers -->
<button 
    id="saveBtn"
    class="btn-success"
    type="button"
    onclick="saveData()">
    Save
</button>

<!-- Use double quotes -->
<div class="container">

<!-- Boolean attributes -->
<input type="checkbox" checked>
<input type="text" required>
```

---

### **CSS Style**

#### **Organization**
```css
/* Group related styles */
/* ===== BUTTONS ===== */
button { }
.btn-success { }
.btn-danger { }

/* BEM-like naming (but simplified) */
.repair-card { }
.repair-card h4 { }
.repair-info { }

/* State classes */
.active { }
.disabled { }
.hidden { }
```

#### **Property Order**
```css
.element {
    /* Positioning */
    position: relative;
    top: 0;
    left: 0;
    
    /* Display */
    display: flex;
    flex-direction: column;
    
    /* Box Model */
    width: 100%;
    height: auto;
    margin: 10px;
    padding: 15px;
    
    /* Typography */
    font-family: Arial;
    font-size: 14px;
    color: #333;
    
    /* Visual */
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    /* Animation */
    transition: all 0.3s;
}
```

---

## 🏗️ Architectural Patterns

### **1. Global State Pattern**
```javascript
// Store in window scope for cross-module access
window.allRepairs = [];
window.currentUser = null;
window.currentUserData = null;

// Benefits:
// - No module bundler needed
// - Simple to understand
// - Works with onclick handlers
```

### **2. Firebase Listener Pattern**
```javascript
// Set up once, updates automatically
db.ref('repairs').on('value', (snapshot) => {
  window.allRepairs = [];
  snapshot.forEach((child) => {
    window.allRepairs.push({
      id: child.key,
      ...child.val()
    });
  });
  
  // Auto-refresh UI
  if (window.currentTabRefresh) {
    window.currentTabRefresh();
  }
});

// Benefits:
// - Real-time updates
// - Multi-user sync
// - No manual refresh needed
```

### **3. Tab Refresh Pattern**
```javascript
// Each tab sets its own refresh function
function buildMyTab(container) {
  // Set refresh callback
  window.currentTabRefresh = () => buildMyTab(
    document.getElementById('myTabId')
  );
  
  // Build content
  container.innerHTML = generateHTML();
}

// Call after any data change
if (window.currentTabRefresh) {
  window.currentTabRefresh();
}

// Benefits:
// - Automatic UI updates
// - No need to know which tab is active
// - Decoupled modules
```

### **4. Modal Pattern**
```javascript
// Modal HTML in index.html
<div id="myModal" class="modal">
  <div class="modal-content">
    <div id="myModalContent"></div>
  </div>
</div>

// Open modal function
function openMyModal(data) {
  const content = document.getElementById('myModalContent');
  content.innerHTML = generateModalHTML(data);
  document.getElementById('myModal').style.display = 'block';
}

// Close modal function
function closeMyModal() {
  document.getElementById('myModal').style.display = 'none';
}

// Benefits:
// - Reusable modal containers
// - Dynamic content
// - Consistent behavior
```

### **5. Export Pattern**
```javascript
// At end of file, export all public functions
window.functionName = functionName;
window.anotherFunction = anotherFunction;

// Required for onclick handlers
<button onclick="functionName()">Click</button>

// Benefits:
// - Works with vanilla HTML
// - No build step needed
// - Simple debugging
```

---

## 🔒 Security Best Practices

### **Firebase Security Rules** (Not in Code)
```javascript
// rules.json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    }
  }
}
```

### **Input Validation**
```javascript
// Always validate user input
function validatePhone(phone) {
  const re = /^(09|\+639)\d{9}$/;
  if (!re.test(phone)) {
    alert('Invalid phone number format');
    return false;
  }
  return true;
}

// Check required fields
if (!customerName || !contactNumber) {
  alert('Please fill all required fields');
  return;
}

// Sanitize for display (prevent XSS)
const safeName = escapeHtml(customerName);
```

### **Authentication Checks**
```javascript
// Always verify user is logged in
if (!window.currentUser || !window.currentUserData) {
  alert('Please log in first');
  return;
}

// Check user status
if (window.currentUserData.status !== 'active') {
  alert('Account is deactivated');
  return;
}

// Role-based access
const role = window.currentUserData.role;
if (role !== 'admin' && role !== 'manager') {
  alert('Insufficient permissions');
  return;
}
```

---

## ⚡ Performance Best Practices

### **Image Optimization**
```javascript
// Always compress images
const compressed = await utils.compressImage(file, 800);

// Limit number of photos
if (photoData.length >= 4) {
  alert('Maximum 4 photos allowed');
  return;
}

// Use appropriate compression quality
canvas.toDataURL('image/jpeg', 0.8);  // 80% quality
```

### **Database Queries**
```javascript
// Use listeners for real-time data
db.ref('repairs').on('value', callback);  // ✅ Good

// Don't fetch repeatedly
setInterval(() => {
  db.ref('repairs').once('value');  // ❌ Bad
}, 1000);

// Limit query results when possible
db.ref('repairs')
  .orderByChild('createdAt')
  .limitToLast(100)
  .once('value');
```

### **DOM Manipulation**
```javascript
// Build HTML string, then set once
let html = '';
repairs.forEach(r => {
  html += `<div class="repair-card">...</div>`;
});
container.innerHTML = html;  // ✅ Good - One operation

// Don't append repeatedly
repairs.forEach(r => {
  const div = document.createElement('div');
  container.appendChild(div);  // ❌ Bad - Multiple operations
});
```

### **Loading States**
```javascript
// Always show loading for async operations
async function longOperation() {
  utils.showLoading(true);
  
  try {
    await doSomething();
  } finally {
    utils.showLoading(false);  // Always hide
  }
}
```

---

## 🐛 Error Handling

### **Try-Catch Pattern**
```javascript
async function criticalFunction() {
  try {
    utils.showLoading(true);
    
    // Risky operation
    const result = await db.ref('path').once('value');
    
    // Success
    alert('✅ Success!');
    utils.showLoading(false);
    
  } catch (error) {
    // Error handling
    console.error('Error:', error);
    alert('Error: ' + error.message);
    utils.showLoading(false);  // CRITICAL!
  }
}
```

### **Null Checks**
```javascript
// Always check if element exists
const container = document.getElementById('myId');
if (!container) {
  console.warn('Container not found');
  return;
}

// Check Firebase data
const repair = window.allRepairs.find(r => r.id === repairId);
if (!repair) {
  alert('Repair not found');
  return;
}
```

### **User-Friendly Error Messages**
```javascript
// Don't show technical errors to users
try {
  await someOperation();
} catch (error) {
  console.error('Technical error:', error);  // For debugging
  alert('Unable to save. Please try again.');  // For user
}

// Specific error messages
if (!customerName) {
  alert('Please enter customer name');
  return;
}

if (amount <= 0) {
  alert('Amount must be greater than zero');
  return;
}
```

---

## 📊 Database Patterns

### **Creating Records**
```javascript
// Use push() for unique IDs
const newRef = await db.ref('repairs').push({
  customerName: name,
  createdAt: new Date().toISOString(),
  // ... other fields
});

const repairId = newRef.key;
```

### **Updating Records**
```javascript
// Use update() to modify specific fields
await db.ref(`repairs/${repairId}`).update({
  status: newStatus,
  lastUpdated: new Date().toISOString(),
  lastUpdatedBy: window.currentUserData.displayName
});

// Don't use set() unless replacing entire object
await db.ref(`repairs/${repairId}`).set({
  // This replaces EVERYTHING - rarely wanted
});
```

### **Deleting Records**
```javascript
// Soft delete (preferred)
await db.ref(`repairs/${repairId}`).update({
  deleted: true,
  deletedAt: new Date().toISOString(),
  deletedBy: window.currentUserData.displayName
});

// Hard delete (use sparingly)
await db.ref(`repairs/${repairId}`).remove();
```

### **Timestamps**
```javascript
// Always use ISO format
const now = new Date().toISOString();  // "2025-12-27T10:30:00.000Z"

// Store in database
{
  createdAt: now,
  lastUpdated: now
}

// Display to user
utils.formatDateTime(now);  // "Dec 27, 2025, 10:30 AM"
utils.formatDate(now);      // "Dec 27, 2025"
utils.daysAgo(now);         // "2 days ago"
```

---

## 🎯 Testing Guidelines

### **Manual Testing Checklist**
```
Before Each Commit:
☐ Login works for all roles
☐ No console errors
☐ Auto-refresh works after actions
☐ Modals open and close properly
☐ Photos upload and display
☐ Payments calculate correctly
☐ Dates format properly
☐ Mobile responsive
☐ Print styles work
```

### **Testing Different Roles**
```javascript
// Test accounts needed:
// - admin@test.com
// - manager@test.com
// - cashier@test.com
// - tech1@test.com

// Test role-specific features
// - Admin can do everything
// - Manager can do most things
// - Cashier limited to customer service
// - Technician limited to repairs
```

### **Browser Testing**
```
✅ Chrome (primary)
✅ Firefox
✅ Safari
✅ Mobile Chrome
✅ Mobile Safari
```

---

## 📝 Git Commit Guidelines

### **Commit Message Format**
```
Type: Brief description

Detailed description if needed.

Examples:
- Fix: Resolve screen dimming issue on login
- Feature: Add warranty management system
- Update: Improve payment verification workflow
- Refactor: Clean up repairs.js code structure
- Docs: Update README with new features
```

### **Types**
- `Fix:` Bug fixes
- `Feature:` New features
- `Update:` Improvements to existing features
- `Refactor:` Code restructuring
- `Docs:` Documentation changes
- `Style:` Code formatting
- `Test:` Testing changes

### **What to Commit**
```
✅ Commit:
- Functional changes
- Bug fixes
- New features
- Documentation updates

❌ Don't Commit:
- Debugging console.logs
- Commented-out code
- Temporary test files
- API keys (already in .gitignore)
```

---

## 🔍 Code Review Checklist

**Before Merging:**
```
☐ Code follows style guide
☐ No console.logs (except intentional)
☐ All functions exported
☐ Auto-refresh added where needed
☐ Error handling in place
☐ Loading states managed
☐ Null checks added
☐ User-friendly error messages
☐ Comments for complex logic
☐ No hard-coded values (use constants)
☐ Works in all roles
☐ Mobile responsive
☐ No breaking changes
```

---

These coding standards ensure consistency and quality across the codebase! 🎯
