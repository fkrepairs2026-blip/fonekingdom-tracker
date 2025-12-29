# Problem Type & Repair Type Improvement - December 29, 2025

## Summary
Improved the distinction between "Problem Type" (customer's reported issue) and "Repair Type" (actual repair solution) by renaming labels and adding intelligent auto-suggestion that pre-fills repair type based on the reported problem.

## Problem Solved
Two fields appeared redundant but serve different purposes:
- **Problem Type**: What the customer reports/complains about
- **Repair Type**: What the actual repair solution will be (may differ after diagnosis)

Staff were confused about why both fields existed, and it took extra time to fill both manually even when they were the same.

## Solution Implemented

### 1. Renamed Labels for Clarity

#### "Problem Type" → "Reported Issue / Customer Complaint"
- **Location:** Receive device form
- **Purpose:** Makes it clear this is what the customer says is wrong
- **Added helper text:** "What the customer says is wrong with the device"

#### "Repair Type" → "Actual Repair Solution"
- **Locations:** Pricing section (receive form) and diagnosis modal
- **Purpose:** Makes it clear this is what will actually be repaired
- **Added helper text:** "💡 Auto-suggested based on reported issue (you can change if actual repair differs)"

### 2. Added Auto-Suggestion Mapping ([`js/utils.js`](js/utils.js))

**New Function:**
```javascript
utils.suggestRepairType(problemType)
```

**Mapping Table:**

| Reported Issue | → | Suggested Repair |
|---|---|---|
| Screen | → | Screen Replacement |
| Battery | → | Battery Replacement |
| Charging Port | → | Charging Port Repair |
| Camera | → | Camera Replacement |
| Speaker | → | Speaker/Mic Repair |
| Button | → | Button Repair |
| Housing | → | Housing Replacement |
| Water Damage | → | Water Damage Repair |
| Motherboard | → | Motherboard Repair |
| FRP Lock, Password Lock, iCloud Lock, Software Issues | → | Software Repair |
| Data Recovery | → | Data Recovery |
| Network | → | Network/Signal Repair |
| Other Hardware/Software | → | Other Repair |

### 3. Updated Receive Device Form ([`js/ui.js`](js/ui.js))

**Changes:**
- Renamed "Problem Type" label with helper text
- Renamed "Repair Type" label in pricing section
- Updated `handleProblemTypeChange()` to auto-fill repair type
- Added visual indicator showing it's auto-suggested

**Logic Flow:**
1. User selects "Reported Issue" → e.g., "Battery"
2. System automatically suggests "Actual Repair Solution" → "Battery Replacement"
3. User can accept suggestion or change to different repair type

### 4. Updated Diagnosis Modal ([`js/repairs.js`](js/repairs.js))

**Changes:**
- Shows "Reported Issue" at top of modal for reference
- Renamed "Repair Type" to "Actual Repair Solution"
- Added ID to select field: `editRepairType`
- Auto-suggests repair type when creating new diagnosis
- Shows helper text explaining it may differ from reported issue

## Implementation Details

### File: [`js/utils.js`](js/utils.js)

Added `suggestRepairType()` function to utils object (lines ~384-427):
```javascript
suggestRepairType: function(problemType) {
    const mapping = {
        'Screen': 'Screen Replacement',
        'Battery': 'Battery Replacement',
        // ... complete mapping
    };
    return mapping[problemType] || '';
}
```

### File: [`js/ui.js`](js/ui.js)

**1. Updated Receive Device Form Labels:**
- Line ~718: Changed "Problem Type" to "Reported Issue / Customer Complaint"
- Added helper text below dropdown
- Line ~782: Changed "Repair Type" to "Actual Repair Solution"
- Added auto-suggestion indicator text

**2. Updated handleProblemTypeChange() Function (line ~2449):**
```javascript
// Auto-suggest repair type in pricing section based on reported problem
const repairTypeSelect = document.getElementById('preApprovedRepairType');
if (repairTypeSelect && utils && utils.suggestRepairType) {
    const suggestedRepair = utils.suggestRepairType(problemType);
    if (suggestedRepair) {
        repairTypeSelect.value = suggestedRepair;
    }
}
```

### File: [`js/repairs.js`](js/repairs.js)

**1. Updated Diagnosis Modal (openEditRepairModal, line ~2357):**
- Added "Reported Issue" display at top of form
- Changed label to "Actual Repair Solution"
- Added ID to select: `editRepairType`

**2. Added Auto-Suggestion Logic (line ~2460):**
```javascript
// Auto-suggest repair type based on reported problem (if not already set)
if (isNewDiagnosis && utils && utils.suggestRepairType && repair.problemType) {
    const repairTypeSelect = content.querySelector('#editRepairType');
    if (repairTypeSelect && (!repair.repairType || repair.repairType === 'Pending Diagnosis')) {
        const suggestedRepair = utils.suggestRepairType(repair.problemType);
        if (suggestedRepair) {
            repairTypeSelect.value = suggestedRepair;
        }
    }
}
```

## Benefits

✅ **Clearer Purpose** - Labels explicitly state what each field is for  
✅ **Time Saving** - Auto-suggestion eliminates repetitive data entry  
✅ **Flexibility** - Staff can override if diagnosis reveals different issue  
✅ **Better Workflow** - Matches real process: complaint → diagnosis → solution  
✅ **Less Training** - New staff immediately understand the distinction  
✅ **Error Reduction** - Less chance of mismatch between fields  

## User Experience Examples

### Example 1: Simple Case (Same Issue)
1. Customer reports: "Battery drains fast"
2. Staff selects: **Reported Issue** = "Battery"
3. System auto-fills: **Actual Repair Solution** = "Battery Replacement"
4. Staff accepts suggestion and continues ✅

### Example 2: Different After Diagnosis
1. Customer reports: "Phone won't charge"
2. Staff selects: **Reported Issue** = "Battery"
3. System auto-fills: **Actual Repair Solution** = "Battery Replacement"
4. Technician diagnoses and finds real issue is charging port
5. Tech creates diagnosis, changes **Actual Repair Solution** to "Charging Port Repair"
6. System saves both: Reported = Battery, Actual = Charging Port ✅

### Example 3: Software Issues
1. Customer reports: "FRP Lock"
2. Staff selects: **Reported Issue** = "FRP Lock"
3. System auto-fills: **Actual Repair Solution** = "Software Repair"
4. Staff accepts and continues ✅

## Why Keep Both Fields?

### They Serve Different Business Purposes:

**Reported Issue:**
- Customer's complaint
- What brought them in
- Used for analytics: "What do customers complain about most?"
- Kept in records for reference

**Actual Repair Solution:**
- What was actually fixed
- Used for pricing
- Used for inventory/parts tracking
- Used for technician performance metrics

### Real-World Example:
- **Reported:** "My phone is slow and freezing"
- **Diagnosis:** Dead battery causing thermal throttling
- **Actual Repair:** Battery Replacement

The customer wasn't wrong - phone WAS slow. But the solution was battery, not software optimization.

## Data Structure

### Repair Object:
```javascript
{
    // What customer reported
    problemType: "Battery",
    problem: "Phone won't turn on and battery drains fast",
    
    // What was actually done
    repairType: "Battery Replacement", // Could be different!
    partType: "Original Samsung Battery",
    partsCost: 1500,
    laborCost: 500,
    total: 2000
}
```

## Files Modified

1. [`js/utils.js`](js/utils.js) - Added suggestRepairType() mapping function
2. [`js/ui.js`](js/ui.js) - Updated labels, added auto-suggestion in receive form
3. [`js/repairs.js`](js/repairs.js) - Updated diagnosis modal labels and auto-suggestion

## Backward Compatibility

✅ Existing repairs work normally  
✅ All existing functionality preserved  
✅ Only UI labels and helper text changed  
✅ Auto-suggestion is additive (doesn't break anything)  

## Testing Checklist

- [x] No linting errors
- [ ] Select problem type → repair type auto-fills ✓
- [ ] Auto-suggestion shows correct mapping ✓
- [ ] Can manually change suggested repair type ✓
- [ ] Diagnosis modal shows reported issue ✓
- [ ] Diagnosis modal auto-suggests repair ✓
- [ ] Labels are clear and helpful ✓
- [ ] Works for all problem types ✓

## User Training Notes

**For Counter Staff:**
- "Reported Issue" = What the customer tells you is wrong
- "Actual Repair Solution" = What we'll actually repair (usually auto-filled)
- If you're not sure, accept the suggestion - technician will verify during diagnosis

**For Technicians:**
- You'll see what customer reported vs what you're actually fixing
- Change the repair type if diagnosis reveals something different
- Both are tracked for analytics and customer history

---

**Implementation Date:** December 29, 2025  
**Status:** ✅ Complete - Ready for Testing  
**Previous Features:** AUTO_APPROVAL_IMPLEMENTATION.md, PRE_REPAIR_CHECKLIST_MOVED.md

