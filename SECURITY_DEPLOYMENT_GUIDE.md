# Security Implementation - Deployment Guide

## 🎯 What Was Implemented

### ✅ 1. Firebase Realtime Database Security Rules
- **File:** `database.rules.json`
- **Protection:** All collections now require authentication
- **Role-Based Access:** Admin-only operations protected
- **Audit Trail:** Logs collection is immutable

### ✅ 2. Input Validation & XSS Protection
- **File:** `js/utils.js`
- **Added Functions:**
  - `sanitizeString()` - Prevents XSS attacks
  - `sanitizeObject()` - Recursively sanitizes all string properties
  - `isValidEmail()` - Email format validation
  - `isValidPhone()` - Philippine phone number validation
  - `isRequired()` - Required field validation
  - `isValidNumber()` - Number validation with min/max
  - `isValidPrice()` - Price validation (non-negative)
  - `showValidationError()` - Display field errors
  - `clearValidationErrors()` - Clear all errors in container

### ✅ 3. Authentication Guards
- **File:** `js/auth.js`
- **Added Functions:**
  - `requireAuth()` - Require logged-in user
  - `requireAdmin()` - Require admin role
  - `requireRole(role)` - Require specific role
  - `isAdmin()` - Check if admin
  - `isManagerOrHigher()` - Check manager or admin
  - `isCashierOrHigher()` - Check cashier, manager, or admin
  - `hasPermission(action)` - Check specific permission
  - `initRoleBasedUI()` - Hide/disable elements based on role
  - `enforceHTTPS()` - Force HTTPS in production

### ✅ 4. Rate Limiting
- **File:** `js/auth.js`
- **Feature:** Login attempts limited to 5 per 15 minutes
- **Protection:** Prevents brute force attacks
- **User Feedback:** Shows countdown until retry allowed

### ✅ 5. Session Security
- **File:** `js/auth.js`
- **Features:**
  - Auto-logout after 30 minutes of inactivity
  - Warning modal 5 minutes before timeout
  - Countdown timer display
  - Continue or logout options
  - Activity tracking (mouse, keyboard, scroll)

### ✅ 6. Error Handling Improvements
- **File:** `js/utils.js`
- **Features:**
  - `showError()` - Toast error notifications
  - `showSuccess()` - Toast success notifications
  - `handleFirebaseError()` - User-friendly Firebase error messages
  - CSS styles for validation errors and toasts

### ✅ 7. HTTPS Enforcement
- **File:** `js/auth.js`
- **Feature:** Auto-redirect to HTTPS in production
- **Preserves:** localhost development

---

## 📋 Pre-Deployment Checklist

### Step 1: Verify Files Modified
```bash
# Check what files were changed
git status

# You should see:
# - database.rules.json (NEW)
# - js/auth.js (MODIFIED)
# - js/utils.js (MODIFIED)
# - css/styles.css (MODIFIED)
```

### Step 2: Test Locally First
Before deploying, test the following:

#### A. Login Rate Limiting
1. Try logging in with wrong password 6 times
2. ✅ Should block after 5 attempts
3. ✅ Should show "Too many login attempts" message
4. Wait 15 minutes or clear browser data
5. ✅ Should allow retry

#### B. Session Timeout
1. Login successfully
2. Leave browser idle for 25+ minutes
3. ✅ Should show warning modal after 25 minutes
4. ✅ Should have countdown timer
5. Click "Continue Session"
6. ✅ Should extend session
7. OR leave for 30 minutes total
8. ✅ Should auto-logout

#### C. Input Validation (will need to implement in forms)
1. Try submitting empty fields → Should show validation errors
2. Try invalid email → Should show error
3. Try invalid phone → Should show error

#### D. Authentication Guards
1. Open browser console
2. Type: `requireAuth()`
3. ✅ Should return true if logged in
4. Type: `requireAdmin()`
5. ✅ Should return true only for admin users
6. ✅ Non-admins should see error

---

## 🚀 Deployment Steps

### Option A: Deploy to Firebase Hosting (Recommended)

#### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

#### 2. Login to Firebase
```bash
firebase login
```

#### 3. Initialize Firebase (if first time)
```bash
firebase init

# Select:
# - Database: Configure security rules
# - Hosting: Configure files for Firebase Hosting
```

#### 4. Deploy Database Rules
```bash
# Test rules first (optional)
firebase deploy --only database --debug

# Deploy rules
firebase deploy --only database

# Expected output:
# ✔ Deploy complete!
# Database Rules: fkrepairs-a6360
```

#### 5. Verify Rules Deployment
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: fkrepairs-a6360
3. Click "Realtime Database" → "Rules"
4. ✅ Should see new rules with `requireAuth()` checks
5. ✅ Should show "Published" timestamp

#### 6. Deploy Hosting (Code Files)
```bash
# Deploy all files
firebase deploy --only hosting

# Or specific files
firebase deploy --only hosting
```

### Option B: Deploy to GitHub Pages

#### 1. Commit Changes
```bash
git add .
git commit -m "feat: Add comprehensive security measures

- Implement Firebase Realtime Database security rules
- Add input validation and XSS protection
- Add authentication guards and role-based access
- Implement login rate limiting (5 attempts per 15 min)
- Add session timeout (30 min) with warnings
- Improve error handling with user-friendly messages
- Add toast notifications for errors and success
- Force HTTPS in production
- Add validation error styling"
```

#### 2. Push to GitHub
```bash
git push origin main
```

#### 3. Deploy Database Rules Separately
```bash
# Database rules MUST be deployed via Firebase CLI
firebase deploy --only database
```

⚠️ **CRITICAL:** GitHub Pages only deploys your HTML/CSS/JS files. You **MUST** deploy database rules via Firebase CLI.

---

## 🧪 Post-Deployment Testing

### 1. Test Database Security Rules

#### Test A: Unauthenticated Access (Should Fail)
```javascript
// Open browser console on your site
// Logout first
firebase.database().ref('repairs').once('value')
  .then(() => console.log('❌ SECURITY ISSUE: Unauthenticated read succeeded'))
  .catch(() => console.log('✅ CORRECT: Unauthenticated read blocked'));
```

#### Test B: Authenticated Read (Should Succeed)
```javascript
// Login first, then run:
firebase.database().ref('repairs').once('value')
  .then(() => console.log('✅ CORRECT: Authenticated read succeeded'))
  .catch(() => console.log('❌ ISSUE: Authenticated read failed'));
```

#### Test C: Non-Admin Delete (Should Fail)
```javascript
// Login as non-admin (cashier/technician), then:
firebase.database().ref('repairs/someRepairId').remove()
  .then(() => console.log('❌ SECURITY ISSUE: Non-admin delete succeeded'))
  .catch(() => console.log('✅ CORRECT: Non-admin delete blocked'));
```

#### Test D: Admin Delete (Should Succeed)
```javascript
// Login as admin, then:
firebase.database().ref('repairs/someRepairId/deleted').set(true)
  .then(() => console.log('✅ CORRECT: Admin delete succeeded'))
  .catch(() => console.log('❌ ISSUE: Admin delete failed'));
```

### 2. Test Login Rate Limiting

**Steps:**
1. Logout
2. Try login with wrong password 6 times
3. ✅ Should see: "Too many login attempts. Please try again in X minutes."
4. Wait 15 minutes (or clear browser storage)
5. ✅ Should allow retry

**How to Test Faster:**
```javascript
// In browser console, manually trigger rate limit
rateLimiter.attempts.set('login:youremail@example.com', {
    count: 6,
    resetAt: Date.now() + (15 * 60 * 1000)
});
// Now try to login - should be blocked
```

### 3. Test Session Timeout

**Option A: Wait 30 Minutes**
1. Login
2. Leave browser idle for 25 minutes
3. ✅ Should see warning modal
4. Wait 5 more minutes
5. ✅ Should auto-logout

**Option B: Test Faster (Developer Mode)**
```javascript
// In browser console, adjust timeout for testing:
sessionManager.timeoutMinutes = 1; // 1 minute instead of 30
sessionManager.warningMinutes = 0.25; // 15 seconds warning
sessionManager.resetTimeout();
// Now wait 45 seconds - should see warning
// Wait 1 minute total - should logout
```

### 4. Test Authentication Guards

```javascript
// Test in browser console:

// 1. Test requireAuth (should work when logged in)
requireAuth(); // true if logged in

// 2. Test requireAdmin (should only work for admins)
requireAdmin(); // true only for admins

// 3. Test permission check
hasPermission('delete_repair'); // true only for admin
hasPermission('create_repair'); // true for all roles
hasPermission('verify_payment'); // true for admin/cashier only

// 4. Test role checks
isAdmin(); // true only for admin
isManagerOrHigher(); // true for admin/manager
isCashierOrHigher(); // true for admin/manager/cashier
```

### 5. Test Error Handling

```javascript
// Test toast notifications:
utils.showError('This is a test error');
utils.showSuccess('This is a test success message');

// Test validation error:
utils.showValidationError('customerPhone', 'Invalid phone number');

// Test Firebase error handler:
const testError = { code: 'auth/wrong-password' };
const friendly = utils.handleFirebaseError(testError);
console.log(friendly.message); // Should be: "Incorrect password"
```

### 6. Test Input Validation

```javascript
// Test in browser console:

// Email validation
utils.isValidEmail('test@example.com'); // true
utils.isValidEmail('invalid-email'); // false

// Phone validation
utils.isValidPhone('09123456789'); // true
utils.isValidPhone('+639123456789'); // true
utils.isValidPhone('12345'); // false

// Required field
utils.isRequired('text'); // true
utils.isRequired('   '); // false (whitespace only)
utils.isRequired(''); // false

// Price validation
utils.isValidPrice(100); // true
utils.isValidPrice(-50); // false
utils.isValidPrice('abc'); // false

// XSS protection
utils.sanitizeString('<script>alert("xss")</script>'); 
// Returns: &lt;script&gt;alert("xss")&lt;/script&gt;
```

---

## 🔒 Security Rules Explanation

### What Each Rule Does

#### 1. Users Collection
```json
"users": {
  "$userId": {
    ".read": "auth != null",  // Any logged-in user can read
    ".write": "auth != null && (auth.uid === $userId || root.child('users').child(auth.uid).child('role').val() === 'admin')"
    // Only owner or admin can write
  }
}
```
**Protection:** Users can only edit their own profile unless they're admin.

#### 2. Repairs Collection
```json
"repairs": {
  ".read": "auth != null",  // Must be logged in to read
  "$repairId": {
    ".write": "auth != null",  // Must be logged in to write
    "deleted": {
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      // Only admin can mark as deleted
    }
  }
}
```
**Protection:** All repairs require authentication. Only admins can delete.

#### 3. Logs Collection
```json
"logs": {
  ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
  // Only admins can read logs
  "$logId": {
    ".write": "auth != null",  // Anyone can create logs
    ".validate": "!data.exists()"  // But can't update existing logs
  }
}
```
**Protection:** Immutable audit trail. Logs can't be edited after creation.

---

## 🐛 Troubleshooting

### Issue: "Permission Denied" Errors After Deployment

**Cause:** Database rules blocking legitimate operations

**Solution:**
1. Check Firebase Console → Database → Rules
2. Verify rules deployed correctly
3. Test with Firebase Rules Simulator:
   - Go to Rules tab
   - Click "Rules Playground"
   - Select "Realtime Database"
   - Test read/write operations

### Issue: Rate Limiting Not Working

**Cause:** Browser cache or localStorage

**Solution:**
```javascript
// Clear rate limiter in console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Issue: Session Timeout Not Triggering

**Cause:** User activity resetting timer

**Solution:**
```javascript
// Check session manager status:
console.log('Timeout minutes:', sessionManager.timeoutMinutes);
console.log('Warning minutes:', sessionManager.warningMinutes);

// Manually trigger for testing:
sessionManager.showWarning();
```

### Issue: Validation Functions Not Found

**Cause:** utils.js not loaded or cached

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check console for JS errors
4. Verify utils.js loaded: `console.log(utils)`

### Issue: HTTPS Redirect Loop

**Cause:** Server configuration or hosting platform

**Solution:**
```javascript
// Check protocol in console:
console.log(location.protocol); // Should be 'https:'

// Temporarily disable HTTPS enforcement for testing:
// Comment out in auth.js:
// enforceHTTPS();
```

---

## 📊 Monitoring & Maintenance

### 1. Monitor Login Events
```javascript
// Check login events in Firebase Console
// Go to: Database → loginEvents

// Or query in console:
firebase.database().ref('loginEvents')
  .orderByChild('timestamp')
  .limitToLast(100)
  .once('value', snap => console.log(snap.val()));
```

### 2. Monitor Failed Login Attempts
```javascript
// Add to your admin dashboard
firebase.database().ref('loginEvents')
  .orderByChild('type')
  .equalTo('failed_login')
  .limitToLast(50)
  .once('value', snap => {
    const failed = snap.val();
    console.log('Recent failed logins:', failed);
  });
```

### 3. Check Rate Limiter Status
```javascript
// In browser console:
console.log('Rate limiter attempts:', rateLimiter.attempts);

// See all rate-limited IPs/emails:
for (let [key, data] of rateLimiter.attempts.entries()) {
  console.log(`${key}: ${data.count} attempts, reset at ${new Date(data.resetAt)}`);
}
```

### 4. Session Manager Statistics
```javascript
// In browser console:
console.log('Active timeout minutes:', sessionManager.timeoutMinutes);
console.log('Warning minutes:', sessionManager.warningMinutes);
console.log('Is warning showing:', !!sessionManager.warningModal);
```

---

## 🔄 Next Steps (Optional Future Enhancements)

### Priority 1: Apply Validation to All Forms

**Currently:** Validation functions exist but not applied to forms

**Next Steps:**
1. Update `submitReceiveDevice` in repairs.js
2. Update user creation forms
3. Update inventory forms
4. Update payment forms

**Example:**
```javascript
async function submitReceiveDevice() {
    // Get form data
    const formData = {
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        // ... other fields
    };
    
    // Validate
    const errors = [];
    
    if (!utils.isRequired(formData.customerName)) {
        errors.push({ field: 'customerName', message: 'Customer name is required' });
    }
    
    if (!utils.isValidPhone(formData.customerPhone)) {
        errors.push({ field: 'customerPhone', message: 'Invalid phone number' });
    }
    
    if (errors.length > 0) {
        errors.forEach(err => utils.showValidationError(err.field, err.message));
        return;
    }
    
    // Sanitize all inputs
    const sanitized = utils.sanitizeObject(formData);
    
    // Continue with save...
}
```

### Priority 2: Environment Variables (Requires Build Tool)

**Current:** Firebase config exposed in firebase-config.js

**To Fix (Advanced):**
1. Install Vite or Parcel: `npm install -D vite`
2. Create .env file
3. Use `import.meta.env.VITE_FIREBASE_API_KEY`
4. Add build script to package.json

**Alternative (Simple):** Accept that Firebase config is public (it's designed to be)

### Priority 3: Two-Factor Authentication (2FA)

**Future Enhancement:**
- Use Firebase Phone Authentication
- Require SMS code after password
- Store 2FA preference in user profile

### Priority 4: Security Audit Logging

**Future Enhancement:**
- Log all admin actions
- Track IP addresses
- Monitor suspicious patterns
- Export audit trail

---

## ✅ Deployment Verification Checklist

```
□ Database rules deployed to Firebase
□ Code changes committed to Git
□ Code pushed to GitHub (if using GitHub Pages)
□ Site accessible via HTTPS
□ Login works correctly
□ Rate limiting blocks after 5 attempts
□ Session timeout shows warning after 25 minutes
□ Session timeout logs out after 30 minutes
□ Toast notifications appear for errors/success
□ Validation functions available in console
□ Authentication guards working (requireAuth, requireAdmin)
□ Non-admins can't access admin functions
□ Database read requires authentication
□ Database delete requires admin role
□ No console errors on page load
```

---

## 🆘 Emergency Rollback

If something breaks critically:

### 1. Rollback Database Rules
```bash
# Use Firebase Console
# Go to: Database → Rules → History
# Select previous version
# Click "Restore"
```

### 2. Rollback Code
```bash
git log --oneline  # Find commit before security changes
git revert <commit-hash>
git push origin main
```

### 3. Quick Fix - Make Rules Permissive (TEMPORARY ONLY!)
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
⚠️ **WARNING:** This removes all security. Only use as emergency measure!

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console → Database → Rules
3. Test with Firebase Rules Simulator
4. Review this guide's Troubleshooting section
5. Check git commit history for changes

---

## 🎉 Success Metrics

Your app is now secure if:
- ✅ No anonymous access to database
- ✅ Login attempts limited
- ✅ Sessions timeout after inactivity
- ✅ User-friendly error messages
- ✅ XSS attacks prevented via sanitization
- ✅ Role-based access working
- ✅ HTTPS enforced in production
- ✅ Audit trail preserved (logs immutable)

**Congratulations! Your FoneKingdom Tracker is now significantly more secure! 🔒**
