# Customer Pre-Approval Feature - Visual Guide

## 🎯 Feature Overview

This feature allows staff to mark devices as "customer already approved" when receiving them, skipping the diagnosis and approval workflow for faster processing.

## 📋 User Interface

### Receive Device Form - New Section

After the device photo upload, you'll now see:

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Customer has ALREADY APPROVED the repair price           │
│ Check this if you already quoted the customer and they      │
│ agreed to the price                                         │
└─────────────────────────────────────────────────────────────┘
```

### When Checked - Pricing Fields Appear

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Enter Agreed Pricing                                     │
│                                                              │
│ Repair Type *                                               │
│ [Screen Replacement ▼]                                      │
│                                                              │
│ Parts Cost (₱)          Labor Cost (₱)                      │
│ [1500.00]               [500.00]                            │
│                                                              │
│ Total Amount (₱)                                            │
│ [2000.00] (auto-calculated)                                 │
│                                                              │
│ ℹ️ Note: This device will be marked as "Received &         │
│ Approved" - ready for technician to accept and start        │
│ repair immediately.                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Comparison

### Before (Always Required Diagnosis)
```
1. Staff receives device
   ↓
2. Device shows in "Received Devices" (no pricing)
   ↓
3. Tech/Owner creates diagnosis with pricing
   ↓
4. Customer approves the price
   ↓
5. Technician accepts the repair
   ↓
6. Status: "In Progress"
```

### After (With Pre-Approval Option)

#### Option A: Customer Already Approved
```
1. Staff receives device + enters agreed pricing
   ↓
2. Device shows in "Received Devices" with:
   - ✅ Customer Approved badge
   - 💰 Pricing already set
   - "Accept This Repair" button visible
   ↓
3. Technician accepts the repair immediately
   ↓
4. Status: "In Progress"
```

#### Option B: Customer Not Sure Yet
```
1. Staff receives device (checkbox unchecked)
   ↓
2. Normal workflow continues (same as before)
```

## 💡 Use Cases

### When to Use Pre-Approval ✅

1. **Phone Quotes**: Customer called, you quoted them, they agreed
   ```
   Customer: "How much for iPhone 12 screen?"
   You: "₱2,500 total"
   Customer: "OK, I'll bring it in"
   → Check pre-approval, enter ₱2,500
   ```

2. **Repeat Customers**: Regular customer knows the price
   ```
   Customer: "Same issue as last time, same price?"
   You: "Yes, ₱1,800"
   Customer: "Go ahead"
   → Check pre-approval, enter ₱1,800
   ```

3. **Walk-in with Agreement**: Customer agreed to price at counter
   ```
   Customer inspects device, you quote ₱3,000
   Customer: "OK, fix it"
   → Check pre-approval, enter ₱3,000
   ```

### When NOT to Use Pre-Approval ❌

1. **Customer Unsure**: "Let me think about it"
   → Leave unchecked, normal workflow

2. **Need Diagnosis**: "I'm not sure what's wrong"
   → Leave unchecked, tech will diagnose

3. **Price Negotiation**: "That's too expensive"
   → Leave unchecked, may need to adjust pricing

## 📊 What Happens Behind the Scenes

### Pre-Approved Device Data
```javascript
{
  // Basic info
  customerName: "Juan Dela Cruz",
  brand: "Samsung",
  model: "Galaxy S21",
  problem: "Cracked screen",
  
  // Pricing (entered by staff)
  repairType: "Screen Replacement",
  partsCost: 1500.00,
  laborCost: 500.00,
  total: 2000.00,
  
  // Workflow flags (auto-set)
  status: "Received",
  diagnosisCreated: true,      // ✅ Marked as diagnosed
  customerApproved: true,       // ✅ Marked as approved
  
  // Audit trail
  diagnosisCreatedAt: "2025-12-28T10:30:00Z",
  diagnosisCreatedBy: "staff_uid",
  diagnosisCreatedByName: "Maria Santos",
  customerApprovedAt: "2025-12-28T10:30:00Z",
  customerApprovedBy: "staff_uid",
  
  // Ready for tech
  acceptedBy: null  // Waiting for technician to accept
}
```

## 🎨 Visual Indicators

### In Received Devices List

**Pre-Approved Device:**
```
┌─────────────────────────────────────────────────────────────┐
│ Juan Dela Cruz - Samsung Galaxy S21                         │
│ [📥 Received] [✅ Customer Approved] [👤 Walk-in]           │
│                                                              │
│ Contact: 09171234567                                        │
│ Problem: Cracked screen                                     │
│ Repair: Screen Replacement                                  │
│ Total: ₱2,000.00                                            │
│                                                              │
│ Received by: Maria Santos                                   │
│ Approved: Dec 28, 2025, 10:30 AM                           │
│                                                              │
│ [✅ Accept This Repair] [✏️ Update Diagnosis]              │
└─────────────────────────────────────────────────────────────┘
```

**Normal Device (Not Pre-Approved):**
```
┌─────────────────────────────────────────────────────────────┐
│ Pedro Santos - iPhone 12                                    │
│ [📥 Received] [👤 Walk-in]                                  │
│                                                              │
│ Contact: 09181234567                                        │
│ Problem: Battery drain                                      │
│ Repair: Pending Diagnosis                                   │
│                                                              │
│ Received by: Maria Santos                                   │
│                                                              │
│ [📝 Create Diagnosis]                                       │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Validation & Error Handling

### Validation Rules

1. **Repair Type Required**
   ```
   ❌ Error: "Please select the repair type for the pre-approved pricing"
   ```

2. **Total Must Be > 0**
   ```
   ❌ Error: "Please enter at least parts cost or labor cost"
   ```

3. **Auto-Calculation**
   - Total = Parts Cost + Labor Cost
   - Updates automatically when either field changes

### Success Messages

**Pre-Approved:**
```
✅ Device Received & Approved!

📱 Samsung Galaxy S21
👤 Juan Dela Cruz
📞 09171234567

💰 Approved Pricing:
• Screen Replacement
• Parts: ₱1,500.00
• Labor: ₱500.00
• Total: ₱2,000.00

✅ Device is ready for technician to accept and start repair!
```

**Normal:**
```
✅ Device Received!

📱 iPhone 12
👤 Pedro Santos
📞 09181234567

📋 Next Steps:
1. Tech/Owner will create diagnosis and set pricing
2. Customer will approve the price
3. Technician can then accept the repair

✅ Device is now in "📥 Received Devices" waiting for diagnosis.
```

## 🔐 Permissions

All roles that can receive devices can use pre-approval:
- ✅ Admin
- ✅ Manager
- ✅ Cashier
- ✅ Technician

## 📱 Mobile Responsive

The feature works on all devices:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Benefits

1. **Faster Processing**: Skip 2 steps for agreed prices
2. **Better Customer Experience**: Less waiting for approved repairs
3. **Accurate Records**: Still tracks all pricing and approval data
4. **Flexible**: Use when needed, skip when not
5. **Clear Communication**: Visual indicators show approval status

## 🔧 Technical Details

### Files Modified
- `js/ui.js` - Added UI and helper functions
- `js/repairs.js` - Added submission logic

### Functions Added
- `togglePreApprovalFields()` - Show/hide pricing fields
- `calculatePreApprovedTotal()` - Auto-calculate total

### Integration
- Works with existing "Received Devices" display
- Compatible with "Accept Repair" validation
- Integrates with statistics dashboard
- No breaking changes to existing workflows

---

**Ready to Use!** 🚀

