# Compensation System - Testing Guide

## 🧪 Manual Testing Steps

### Test 1: Create User with Default Compensation
**Goal:** Verify new users get correct default compensation settings

1. Login as admin
2. Go to **Users** tab
3. Click **➕ Create New User**
4. Fill in:
   - Email: `test-tech3@example.com`
   - Password: `test123`
   - Display Name: `Test Technician 3`
   - Role: **Technician**
   - Technician Name: `Tech3`
5. Click **✅ Create User**
6. **Expected Result:**
   - User created successfully
   - Compensation shows: **Commission (40%)**
   - No errors in console

### Test 2: Change Commission Rate (Pure Commission)
**Goal:** Verify custom commission rates work correctly

1. Find `Test Technician 3` in Users tab
2. Click **💰 Compensation** button
3. Verify modal shows:
   - Current type: Commission
   - Current rate: 40%
   - No history yet
4. Change:
   - Keep type: **Commission Only**
   - Set rate: **50**
   - Reason: `Testing custom rate - performance bonus`
5. Click **Save Changes**
6. Confirm the popup
7. **Expected Result:**
   - Success message appears
   - Modal closes
   - User card now shows **Commission (50%)**
   - No console errors

### Test 3: Convert to Salary-Only
**Goal:** Verify salary-only compensation works

1. Open compensation modal for `Test Technician 3`
2. Change:
   - Type: **Salary Only**
   - Monthly Salary: **15000**
   - Reason: `Converting to trainee status for testing`
3. Click **Save Changes**
4. **Expected Result:**
   - User card shows **Salary (₱15,000/mo)**
   - History section shows 2 entries (40% commission → 50% commission → salary)
   - No errors

### Test 4: Convert to Hybrid
**Goal:** Verify hybrid compensation (salary + commission)

1. Open compensation modal again
2. Change:
   - Type: **Hybrid**
   - Monthly Salary: **12000**
   - Hybrid Commission Rate: **25**
   - Reason: `Testing hybrid compensation model`
3. Click **Save Changes**
4. **Expected Result:**
   - User card shows **Hybrid (₱12,000/mo + 25%)**
   - History now has 3 entries
   - No errors

### Test 5: Commission Calculation (Pure Commission)
**Goal:** Verify calculateRepairCommission uses custom rate

1. Convert `Test Technician 3` back to **Commission Only** at **45%**
2. Open browser console (F12)
3. Create a test repair accepted by Tech3:
   ```javascript
   // In console
   const testRepair = {
       id: 'test-repair-001',
       acceptedBy: 'test-tech3-uid', // Use actual UID from Firebase
       total: 10000,
       partsCost: 2000,
       status: 'Claimed',
       payments: [{
           amount: 10000,
           verified: true
       }]
   };
   
   const commission = window.calculateRepairCommission(testRepair, 'test-tech3-uid');
   console.log('Commission Result:', commission);
   ```
4. **Expected Result:**
   ```javascript
   {
       eligible: true,
       amount: 3600, // (10000 - 2000) × 45% = 3600
       breakdown: {
           repairTotal: 10000,
           partsCost: 2000,
           deliveryExpenses: 0,
           netAmount: 8000,
           commissionRate: 0.45,
           compensationType: 'commission'
       }
   }
   ```

### Test 6: Commission Calculation (Salary-Only)
**Goal:** Verify salary-only techs get ₱0 commission

1. Convert `Test Technician 3` to **Salary Only** (₱15,000/mo)
2. In console, run same test:
   ```javascript
   const commission = window.calculateRepairCommission(testRepair, 'test-tech3-uid');
   console.log('Salary Tech Commission:', commission);
   ```
3. **Expected Result:**
   ```javascript
   {
       eligible: true,
       amount: 0, // No commission for salary-only
       breakdown: {
           repairTotal: 10000,
           partsCost: 2000,
           deliveryExpenses: 0,
           netAmount: 8000,
           commissionRate: 0,
           compensationType: 'salary'
       }
   }
   ```

### Test 7: Commission Calculation (Hybrid)
**Goal:** Verify hybrid gets reduced commission

1. Convert `Test Technician 3` to **Hybrid** (₱12,000/mo + 25%)
2. Run test again:
   ```javascript
   const commission = window.calculateRepairCommission(testRepair, 'test-tech3-uid');
   console.log('Hybrid Tech Commission:', commission);
   ```
3. **Expected Result:**
   ```javascript
   {
       eligible: true,
       amount: 2000, // (10000 - 2000) × 25% = 2000
       breakdown: {
           repairTotal: 10000,
           partsCost: 2000,
           deliveryExpenses: 0,
           netAmount: 8000,
           commissionRate: 0.25,
           compensationType: 'hybrid'
       }
   }
   ```

### Test 8: Rate Change History
**Goal:** Verify history tracks all changes correctly

1. Open compensation modal for `Test Technician 3`
2. Scroll to **📊 Change History** section
3. **Expected Result:**
   - Shows all changes in reverse chronological order (newest first)
   - Each entry shows:
     - Compensation type and amount/rate
     - Date/time changed
     - Who changed it
     - Reason given
   - Example:
     ```
     Hybrid: ₱12,000/mo + 25%
     Dec 27, 2024, 10:45 AM by Admin Name
     "Testing hybrid compensation model"
     
     Salary: ₱15,000/mo
     Dec 27, 2024, 10:40 AM by Admin Name
     "Converting to trainee status for testing"
     
     Commission: 50%
     Dec 27, 2024, 10:35 AM by Admin Name
     "Testing custom rate - performance bonus"
     
     Commission: 40%
     Dec 27, 2024, 10:30 AM by System
     "Initial setup"
     ```

### Test 9: Real Repair Flow
**Goal:** Verify commission works in actual repair workflow

1. Set `Test Technician 3` to **Commission Only** at **45%**
2. Login as `test-tech3@example.com` / `test123`
3. Go to **Receive Device** tab
4. Create a test device:
   - Customer: `TEST CUSTOMER`
   - Phone: `iPhone 14`
   - Problem: `Screen broken`
   - Click **Submit**
5. Go to **My Repairs** tab
6. Click **Accept Repair**
7. Set repair price: **₱8,000**
8. Click **Start Repair**
9. Mark as **Ready for Release**
10. Record payment: **₱8,000 Cash**
11. Release device (will auto-mark as Released)
12. Wait for 6pm OR manually finalize
13. Go to **Daily Remittance** tab
14. **Expected Result:**
    - Repair shows in pending payments
    - Commission calculated: ₱8,000 × 45% = ₱3,600
    - Expected remittance: ₱4,400 (₱8,000 - ₱3,600)
    - Submit remittance shows correct amounts

### Test 10: GCash Remittance with Custom Rate
**Goal:** Verify GCash remittances use custom rates

1. Set up tech with custom rate (e.g., 50%)
2. Record a GCash payment on a repair
3. Go to **GCash Remittance** tab
4. **Expected Result:**
   - Shows pending GCash payments
   - Commission: 50% of net amount
   - Remitted: 50% of net amount
   - Totals calculated correctly

## 🐛 Common Issues & Solutions

### Issue 1: "User not found" error
**Solution:** Make sure `window.allUsers` is populated. Check browser console for Firebase connection errors.

### Issue 2: Commission shows ₱0 for commission-only tech
**Solution:** 
- Check if tech has accepted the repair (`repair.acceptedBy === techId`)
- Verify repair is fully paid (`balance === 0`)
- Check repair is not RTO status
- Verify `window.allUsers[techId]` exists

### Issue 3: Rate history not showing
**Solution:** 
- Check if `commissionRateHistory` field exists in Firebase
- Verify user was created AFTER this update
- Old users need migration: Add empty array to `commissionRateHistory`

### Issue 4: Modal doesn't close after saving
**Solution:**
- Check browser console for errors
- Verify `closeCompensationModal()` is exported to `window`
- Try manual close with X button

### Issue 5: Compensation not showing on user card
**Solution:**
- Verify user role is technician, admin, or manager
- Check if `compensationType` field exists in user data
- Refresh page to force data reload

## 📊 Console Debug Commands

### Check User Compensation Settings
```javascript
const user = window.allUsers['user-id-here'];
console.log('Compensation Type:', user.compensationType);
console.log('Commission Rate:', user.commissionRate);
console.log('Monthly Salary:', user.monthlySalary);
console.log('Hybrid Rate:', user.hybridCommissionRate);
console.log('History:', user.commissionRateHistory);
```

### Test Commission Calculation
```javascript
const testRepair = {
    id: 'test-001',
    acceptedBy: 'tech-uid',
    total: 10000,
    partsCost: 2000,
    status: 'Claimed',
    payments: [{ amount: 10000, verified: true }]
};

const result = window.calculateRepairCommission(testRepair, 'tech-uid');
console.log('Commission:', result);
```

### Check All Techs' Rates
```javascript
Object.values(window.allUsers)
    .filter(u => u.role === 'technician')
    .forEach(tech => {
        console.log(`${tech.displayName}: ${tech.compensationType} - ${(tech.commissionRate * 100).toFixed(0)}%`);
    });
```

### Force Refresh Current Tab
```javascript
if (window.currentTabRefresh) {
    window.currentTabRefresh();
}
```

## ✅ Acceptance Criteria

All tests must pass before deployment:

- [ ] Create user with default compensation
- [ ] Change commission rate (pure commission)
- [ ] Convert to salary-only
- [ ] Convert to hybrid
- [ ] Commission calculation (pure commission) uses custom rate
- [ ] Commission calculation (salary-only) returns ₱0
- [ ] Commission calculation (hybrid) uses hybrid rate
- [ ] Rate change history displays correctly
- [ ] Real repair flow calculates commission correctly
- [ ] GCash remittances use custom rates
- [ ] No console errors during any operation
- [ ] Modal opens/closes without issues
- [ ] Changes persist after page refresh
- [ ] Firebase updates logged correctly

## 🚀 Ready for Production?

**Before pushing to main:**
1. Run all 10 tests above
2. Check browser console for errors
3. Verify Firebase rules allow compensation field updates
4. Test with real user accounts (not just test accounts)
5. Backup Firebase database before deployment
6. Monitor first few hours after deployment
7. Check activity logs for compensation changes

---

**Test Date:** _____________  
**Tested By:** _____________  
**Result:** ⬜ PASS | ⬜ FAIL  
**Notes:** _____________________________
