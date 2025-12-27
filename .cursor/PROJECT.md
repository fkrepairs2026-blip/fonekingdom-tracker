# 📱 Fonekingdom Repair Tracker v2.0 - Project Overview

## 🎯 Project Summary

**Name:** Fonekingdom Repair Tracker v2.0  
**Type:** Web-based Repair Shop Management System  
**Tech Stack:** HTML, CSS, JavaScript, Firebase  
**Deployment:** GitHub Pages  
**Live URL:** https://fkrepairs2026-blip.github.io/fonekingdom-tracker/

---

## 🏢 Business Context

**Fonekingdom** is a mobile phone repair shop in the Philippines. This application manages:
- Device intake and receiving
- Repair workflow tracking
- Technician assignment
- Payment processing
- Warranty management
- Customer communication
- Inventory tracking

**Primary Users:**
- Admin (full access)
- Manager (operational oversight)
- Cashier (customer-facing, payments)
- Technician (repair work)

**Languages:** English + Tagalog (Filipino) support

---

## 🎨 Application Architecture

### **Frontend Architecture**
```
┌─────────────────────────────────────┐
│         index.html                   │
│  (Main Entry Point)                  │
└──────────────┬──────────────────────┘
               │
      ┌────────┴─────────┐
      │                  │
┌─────▼──────┐    ┌─────▼──────┐
│  Login      │    │  Dashboard  │
│  Screen     │    │  Interface  │
└─────────────┘    └──────┬──────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │  Tabs    │     │ Modals  │     │ Stats   │
    │ System   │     │ System  │     │ Display │
    └──────────┘     └─────────┘     └─────────┘
```

### **Data Flow Architecture**
```
User Action
    ↓
JavaScript Event Handler
    ↓
Firebase Database Update
    ↓
Real-time Listener Triggered
    ↓
Update Global State (window.allRepairs)
    ↓
Refresh Current Tab
    ↓
UI Updates Automatically
```

### **Module Structure**
```
app.js          → Main initialization & coordination
auth.js         → Authentication & user management
repairs.js      → Business logic & Firebase operations
ui.js           → UI rendering & tab management
utils.js        → Utility functions
firebase-config.js → Firebase initialization
styles.css      → Styling
```

---

## 🗄️ Database Structure (Firebase Realtime Database)

### **Main Collections:**

#### **1. repairs/**
```javascript
{
  "repair-id-123": {
    // Customer Info
    customerType: "walk-in" | "dealer",
    customerName: "Juan dela Cruz",
    shopName: "TechStore Manila" | "",
    contactNumber: "09171234567",
    
    // Device Info
    brand: "Samsung",
    model: "Galaxy S21",
    problemType: "Screen" | "Battery" | "FRP Lock" | etc.,
    problem: "Cracked screen, touch not working",
    
    // Repair Info
    repairType: "Screen Replacement" | "Pending Diagnosis",
    partType: "Original LCD",
    partSource: "Stock" | "Supplier A" | etc.,
    partsCost: 2000,
    laborCost: 500,
    total: 2500,
    
    // Status Tracking
    status: "Received" | "In Progress" | "Waiting for Parts" | "Ready for Pickup" | "Completed" | "RTO" | "Unsuccessful" | "Claimed",
    
    // Assignment
    acceptedBy: "user-uid",
    acceptedByName: "Tech1",
    acceptedAt: "2025-12-27T10:00:00Z",
    
    // Payments
    payments: [
      {
        amount: 1000,
        method: "Cash" | "GCash" | "PayMaya" | "Bank Transfer",
        paymentDate: "2025-12-27T00:00:00Z",
        recordedDate: "2025-12-27T10:30:00Z",
        receivedBy: "Cashier1",
        notes: "First payment",
        photo: "base64-image-data" | null,
        verified: true,
        verifiedBy: "Admin",
        verifiedAt: "2025-12-27T11:00:00Z"
      }
    ],
    
    // Photos
    photos: ["base64-image-1", "base64-image-2"],
    
    // Timestamps
    createdAt: "2025-12-27T09:00:00Z",
    createdBy: "user-uid",
    createdByName: "Cashier1",
    receivedBy: "Cashier1",
    lastUpdated: "2025-12-27T10:00:00Z",
    lastUpdatedBy: "Tech1",
    
    // Warranty (if claimed)
    claimedAt: "2025-12-28T15:00:00Z",
    releasedBy: "Cashier1",
    releasedByUid: "user-uid",
    claimedNotes: "Customer satisfied",
    claimedCustomerSignature: true,
    warrantyPeriodDays: 30,
    warrantyStartDate: "2025-12-28T15:00:00Z",
    warrantyEndDate: "2026-01-28T15:00:00Z",
    warrantyNotes: "Covers parts and labor for same issue only",
    warrantyClaimId: "repair-id-456" | null,
    
    // Special Flags
    isBackJob: false,
    originalTechnicianId: "user-uid" | null,
    isMicrosoldering: false,
    isWarrantyClaim: false,
    originalRepairId: "repair-id-789" | null,
    warrantyCovered: true
  }
}
```

#### **2. users/**
```javascript
{
  "user-uid": {
    displayName: "Jay Pidazo",
    email: "jay111786@gmail.com",
    role: "admin" | "manager" | "technician" | "cashier",
    technicianName: "Tech1" | null,
    status: "active" | "inactive",
    profilePicture: "base64-image" | null,
    createdAt: "2025-12-25T12:00:00Z",
    createdBy: "admin-uid",
    lastLogin: "2025-12-27T10:00:00Z",
    loginHistory: {
      "entry-id": {
        type: "login" | "logout",
        timestamp: "2025-12-27T10:00:00Z",
        userId: "user-uid",
        userName: "Jay Pidazo",
        userEmail: "jay111786@gmail.com"
      }
    }
  }
}
```

#### **3. modificationRequests/**
```javascript
{
  "request-id": {
    repairId: "repair-id-123",
    requestType: "edit-payment-date" | "edit-repair-details",
    requestedBy: "user-uid",
    requestedByName: "Cashier1",
    requestedAt: "2025-12-27T11:00:00Z",
    
    changes: {
      field: "paymentDate",
      oldValue: "2025-12-26T00:00:00Z",
      newValue: "2025-12-27T00:00:00Z",
      reason: "Customer came today instead of yesterday"
    },
    
    status: "pending" | "approved" | "rejected",
    reviewedBy: "Admin" | null,
    reviewedAt: "2025-12-27T12:00:00Z" | null,
    reviewNotes: "Approved - customer confirmed" | null
  }
}
```

#### **4. loginHistory/** (global tracking)
```javascript
{
  "entry-id": {
    type: "login" | "logout",
    timestamp: "2025-12-27T10:00:00Z",
    userId: "user-uid",
    userName: "Jay Pidazo",
    userEmail: "jay111786@gmail.com"
  }
}
```

---

## 🔐 Authentication & Authorization

### **Authentication Flow:**
```
1. User enters email/password
2. Firebase Authentication validates
3. Load user data from /users/{uid}
4. Check status === 'active'
5. Record login event
6. Initialize app with user role
```

### **Role-Based Access Control:**

| Feature | Admin | Manager | Cashier | Technician |
|---------|-------|---------|---------|------------|
| Receive Devices | ✅ | ✅ | ✅ | ✅ |
| Accept Repairs | ✅ | ✅ | ❌ | ✅ |
| Set Pricing | ✅ | ✅ | ❌ | ✅ |
| Record Payments | ✅ | ✅ | ✅ | ❌ |
| Verify Payments | ✅ | ✅ | ❌ | ❌ |
| Update Status | ✅ | ✅ | ❌ | ✅ |
| Release Device | ✅ | ✅ | ✅ | ❌ |
| Process Warranty | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Modification Approval | ✅ | ✅ | ❌ | ❌ |

---

## 🎛️ Application Features

### **1. Device Intake System**
- Walk-in customer registration
- Dealer account management
- Problem type categorization (Hardware/Software)
- Automatic warnings for risky repairs (FRP, password locks)
- Photo documentation (up to 4 photos)
- Back job detection (returning customer)

### **2. Workflow Management**
- Technician self-assignment
- Status progression tracking
- Automatic tech reassignment for back jobs
- Microsoldering designation
- Part sourcing tracking

### **3. Payment System**
- Multiple payment methods (Cash, GCash, PayMaya, Bank Transfer)
- Partial payment support
- Payment proof photo upload
- Two-tier verification (auto for admin/manager, manual for others)
- Payment date editing with approval workflow
- Dual date tracking (payment date vs recorded date)

### **4. Warranty Management**
- Flexible warranty periods (0, 7, 15, 30, 60, 90, 180, 365 days)
- Bilingual warranty terms (English/Tagalog)
- Customer signature tracking
- Active/expired warranty status
- Warranty claim processing
- Free repairs for covered issues
- Auto-assignment to original technician

### **5. Modification Request System**
- Admin: direct edit capability
- Others: submit request for approval
- Approval workflow
- Audit trail preservation

### **6. Reporting & Analytics**
- Real-time statistics dashboard
- Status-based device counts
- Payment verification pending count
- Cash count calculator
- Supplier report generator
- Role-specific views

---

## 🎨 User Interface Structure

### **Tab System (Role-Based):**

**Admin Sees:**
1. 📥 Received Devices
2. 🔧 In Progress
3. 📦 For Release
4. ✅ Claimed Units
5. ➕ Receive Device
6. 📋 All Repairs
7. ⏳ Pending Verification
8. 💵 Cash Count
9. 📊 Supplier Report
10. 🔔 Mod Requests
11. 👥 Users

**Technician Sees:**
1. ➕ Receive Device (NEW!)
2. 🔧 My Jobs
3. 📝 My Requests

**Cashier Sees:**
1. 📥 Received Devices
2. 🔧 In Progress
3. 📦 For Release
4. ✅ Claimed Units
5. ➕ Receive Device
6. 📋 All Repairs
7. ⏳ Pending Verification
8. 💵 Cash Count

---

## 🔄 Real-time Updates

### **Firebase Listeners:**
```javascript
// repairs.js - Line 16
db.ref('repairs').on('value', (snapshot) => {
  // Updates window.allRepairs
  // Triggers currentTabRefresh()
  // Updates stats dashboard
});

// Similar listeners for:
// - modificationRequests
// - users
```

### **Auto-Refresh System:**
```javascript
// Each tab sets its refresh function
window.currentTabRefresh = () => buildThisTab(container);

// After any Firebase update:
if (window.currentTabRefresh) {
  window.currentTabRefresh();
}
```

---

## 🎯 Key Design Patterns

### **1. Global State Management**
```javascript
window.allRepairs = [];
window.allModificationRequests = [];
window.currentUser = null;
window.currentUserData = null;
window.currentTabRefresh = null;
```

### **2. Modal System**
```javascript
// Centralized modals in index.html
// Modal functions in repairs.js and ui.js
// Pattern:
openModal(id) → Build content → Show modal
closeModal(id) → Hide modal → Cleanup
```

### **3. Photo Handling**
```javascript
// Compress images to base64
// Store in Firebase directly
// Display with inline data URLs
// Max 4 photos per repair
```

### **4. Date Handling**
```javascript
// Store: ISO 8601 strings
// Display: Formatted with utils.formatDateTime()
// Edit: HTML5 date inputs
```

---

## 🚀 Deployment Pipeline

**Development:**
1. Edit files locally
2. Test in browser
3. Commit to GitHub
4. Push to main branch

**GitHub Pages:**
1. Automatic deployment
2. 2-3 minute propagation
3. Cache clearing required
4. Live at: https://fkrepairs2026-blip.github.io/fonekingdom-tracker/

---

## 🐛 Known Issues & Fixes

### **Recent Fixes Applied:**
1. ✅ Screen dimming on login (triple-safe loading)
2. ✅ Set Pricing button (added openEditRepairModal)
3. ✅ Auto-refresh after actions (added currentTabRefresh calls)
4. ⏳ Container null warning (low priority, fix pending)

### **Pending:**
- Container null check in ui.js (cosmetic issue)

---

## 📱 Mobile Responsiveness

- Responsive grid layouts
- Mobile-friendly forms
- Touch-optimized buttons
- Flexible navigation
- Adaptive photo gallery

---

## 🔮 Future Enhancement Ideas

1. SMS notifications
2. Email receipts
3. Advanced reporting
4. Inventory management
5. Parts ordering integration
6. Customer self-service portal
7. QR code device tracking
8. Export to Excel
9. Print receipts
10. Multi-branch support

---

## 🎓 Learning Resources

**Firebase:**
- Realtime Database: https://firebase.google.com/docs/database
- Authentication: https://firebase.google.com/docs/auth

**JavaScript:**
- Async/Await patterns
- Promise handling
- DOM manipulation
- Event handling

**GitHub Pages:**
- Deployment: https://pages.github.com/

---

## 📞 Support & Maintenance

**Code Maintainer:** Developer working with Jay Pidazo (Admin)  
**Business Owner:** Fonekingdom Repair Shop  
**Tech Stack:** Vanilla JavaScript (no frameworks)  
**Database:** Firebase Realtime Database  
**Hosting:** GitHub Pages (free tier)

---

This documentation should help Cursor understand the complete project structure, business logic, and technical implementation! 🎉
