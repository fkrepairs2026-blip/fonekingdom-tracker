# Retroactive Completion Mode - User Guide

## Overview
The Retroactive Completion Mode allows technicians to receive devices that were already repaired before formal intake. This handles cases where repairs were completed but not properly documented in the system.

## Features

### 1. **Three Reception Modes**
- **Normal Reception** (default) - Standard workflow
- **Released (Ready for Pickup)** - Device already repaired, ready for customer
- **Claimed (Finalized)** - Device already repaired and released to customer

### 2. **Duplicate Detection**
- Automatically checks for similar repairs in last 7 days
- Blocks if >90% name similarity OR within 24 hours
- Non-admins cannot proceed with blocked duplicates
- Admins can override with required reason (minimum 20 characters)

### 3. **Backdating Capability**
- Set actual completion date/time
- Set actual release/claim date/time
- Validates dates (not future, release >= completion)
- Admin override for dates before 2025

### 4. **Excessive Usage Monitoring**
- Default threshold: 5 retroactive intakes per day
- Warning shown when threshold reached
- Admin notifications sent automatically
- Threshold configurable by admins

### 5. **Payment Collection**
- Optional payment collection during intake
- Auto-populates from repair total
- Supports all payment methods (Cash, GCash, Bank Transfer, Cheque)
- GCash requires reference number

### 6. **Admin Dashboard**
- View all retroactive intakes
- Stats cards (total, monthly, duplicates, excessive, payments)
- Technician breakdown with daily/monthly counts
- Filters by date, technician, status, flags
- CSV export with current filters
- Detailed view for each intake

## How to Use

### For Technicians

#### When to Use Retroactive Mode
- Device was repaired before formal intake
- Repair completed but paperwork not done
- Emergency repair done outside normal process
- Customer brought device back for quick fix

#### Steps

1. **Go to Receive Device Tab**
   - Fill in all normal device/customer details
   - **IMPORTANT:** Pricing is REQUIRED (Parts Cost + Labor Cost)

2. **Select Completion Mode**
   - Choose "Released" if device ready for pickup
   - Choose "Claimed" if already given to customer

3. **Set Dates**
   - **Completion Date:** When repair was actually finished
   - **Release/Claim Date:** When device was released/claimed
   - Dates must not be future
   - Release date must be >= completion date

4. **Released Mode Settings**
   - Select verification method:
     - **With Service Slip** - Upload service slip photo
     - **Customer Address** - No slip needed
     - **Verified by Photo** - Alternative verification
   - Add release notes (optional)

5. **Claimed Mode Settings**
   - Set warranty period (default: 7 days)
   - Add final notes (optional)

6. **Payment Collection** (Optional)
   - Check "Collect Payment Now" if collecting
   - Amount auto-populates from total
   - Select payment method
   - Add GCash reference if applicable

7. **Duplicate Warning**
   - System checks for similar repairs
   - If duplicate found:
     - **Blocked:** Cannot proceed (tech)
     - **Admin Override:** Must explain reason

8. **Excessive Usage Warning**
   - If you've created 5+ retroactive intakes today
   - Warning shown, admin notified
   - Can still proceed but flagged for review

9. **Confirmation**
   - Review all details in confirmation dialog
   - Check the confirmation checkbox
   - Click "Yes" to complete

### For Admins

#### Admin Override - Duplicates
When duplicate detected:
1. System shows matching repairs with confidence scores
2. Enter override reason (minimum 20 characters)
3. Reason logged in audit trail
4. Example reasons:
   - "Same customer, different device confirmed by serial number"
   - "Warranty return for same issue, authorized by manager"
   - "Customer has multiple devices of same model"

#### Admin Override - Dates
To allow dates before 2025:
1. Check "Admin Override - Allow dates before 2025"
2. Set desired dates
3. Override logged in audit trail

#### View Retroactive Intakes Dashboard
Access via: `buildTab('retroactive-intakes')` or admin menu

**Dashboard Features:**
- **Stats Cards:** Total, monthly, duplicates, excessive, payments
- **Technician Breakdown:** See who's using feature most
- **Filters:**
  - Date range
  - Specific technician
  - Status (Released/Claimed)
  - Duplicates only
  - Excessive usage only
- **Export:** CSV export with all filtered data
- **View Details:** Full audit trail for each intake

#### Configure Threshold
1. Open Retroactive Intakes dashboard
2. Click settings icon (⚙️)
3. Set daily threshold (1-20)
4. Save
5. New threshold applied immediately

## Security & Audit Trail

### What's Logged
- All retroactive intakes saved to separate `retroactiveIntakes` collection
- Fields tracked:
  - Repair ID and link
  - Technician (UID, name, role)
  - Timestamps (performed, completion, release)
  - Customer and device details
  - Verification method
  - Payment information
  - Duplicate detection results
  - Override reasons
  - Daily count and excessive flag
  - Admin overrides

### Activity Log Entry
- Special icon: 🔄
- Message: "Retroactive intake - Device completed on [date], received on [date]"
- Full details in activity log
- Orange badge in UI

### Notifications
- Admins receive notifications for:
  - Excessive usage (>= threshold)
  - Includes technician name, count, date
  - Links to repair IDs
  - Priority: Medium

## Validation Rules

### Required Fields
- All standard device/customer fields
- **Pricing:** Parts Cost + Labor Cost (total > 0)
- **Completion Date & Time**
- **Release/Claim Date & Time**
- **Verification Method** (Released mode)

### Date Validation
- ❌ Completion date cannot be future
- ❌ Release/claim date cannot be future
- ❌ Release/claim must be >= completion date
- ❌ Dates must be >= 2025-01-01 (unless admin override)

### Duplicate Blocking (Non-Admin)
- ❌ Cannot proceed if >90% name match
- ❌ Cannot proceed if same device within 24 hours
- ✅ Admin can override with reason

### Payment Validation
- ❌ Must select payment method if collecting
- ❌ Amount must be > 0
- ❌ GCash requires reference number

## Best Practices

### For Technicians
1. **Use sparingly** - Only for genuinely retroactive cases
2. **Accurate dates** - Set actual completion/release dates
3. **Complete pricing** - Don't estimate, use actual costs
4. **Avoid duplicates** - Check if repair already exists
5. **Document well** - Use notes fields for context

### For Admins
1. **Monitor usage** - Check dashboard weekly
2. **Review excessive flags** - Talk to technicians with high counts
3. **Audit duplicates** - Review override reasons
4. **Set appropriate threshold** - Adjust based on shop size/volume
5. **Export regularly** - Keep CSV backups for compliance

## Troubleshooting

### "Pricing is required"
- Must fill Parts Cost and/or Labor Cost
- Total must be > 0
- Cannot skip pricing in retroactive mode

### "Duplicate Detection - Cannot proceed"
- Similar repair found in last 7 days
- Contact admin for override
- Check if repair already exists in system

### "Date Validation Error"
- Check dates not in future
- Release date must be after completion
- Dates must be after 2025-01-01 (or get admin override)

### "Payment method required"
- If "Collect Payment Now" checked
- Must select method from dropdown
- GCash needs reference number

### Dashboard not loading
- Check role (admin only)
- Wait for Firebase data to load
- Check browser console for errors

## CSV Export Format

**Columns:**
- Date, Time
- Repair ID
- Tech Name, Tech Role
- Customer Name
- Device Brand, Device Model
- Final Status
- Completion Date
- Backdated Release Date
- Verification Method
- Payment Amount, Payment Method
- Warranty Days
- Admin Date Override (YES/NO)
- Duplicate Detected (YES/NO)
- Duplicate Override Reason
- Daily Count
- Excessive Flag (YES/NO)
- Performed At (ISO timestamp)

## Technical Details

### Firebase Collections
- **retroactiveIntakes/**: Audit trail for all retroactive intakes
- **systemSettings/**: Contains retroactiveIntakeThreshold
- **adminNotifications/**: Excessive usage alerts
- **repairs/**: Retroactive intakes flagged with `retroactiveIntake: true`

### Repair Object Fields Added
```javascript
{
  retroactiveIntake: true,
  retroactiveReason: 'Device received after completion',
  adminDateOverride: boolean,
  duplicateDetected: boolean,
  duplicateOverridden: boolean,
  duplicateOverrideReason: string | null,
  assignmentMethod: 'retroactive-auto-assign'
}
```

### Activity Type
- Type: `'retroactive_intake'`
- Icon: 🔄
- Styled with orange badge

## Access Control

### By Role
- **Technician:** Can create retroactive intakes (own repairs only)
- **Manager:** Can create retroactive intakes
- **Admin:** Can create retroactive intakes + override duplicates + override dates + view dashboard
- **Cashier:** Cannot access retroactive mode

### Dashboard Access
- Admin only
- Access via navigation or direct function call
- Shows all retroactive intakes across all technicians

## Support

### Common Questions

**Q: Why can't I proceed with a duplicate?**  
A: System detected similar repair to prevent accidental double entry. Contact admin for override if legitimate.

**Q: How do I set dates before 2025?**  
A: Only admins can do this using the "Admin Override" checkbox.

**Q: What's the daily limit?**  
A: Default is 5 retroactive intakes per day. Admins can configure this.

**Q: Can I edit a retroactive intake after submission?**  
A: No, retroactive intakes are immutable for audit purposes. Contact admin if correction needed.

**Q: Where can I see my retroactive intakes?**  
A: They appear in normal repair lists. Admins can see dedicated dashboard.

### Report Issues
- Check browser console for errors
- Note repair ID and timestamp
- Contact system administrator
- Include screenshots if possible

---

**Version:** 1.0  
**Last Updated:** January 8, 2026  
**Feature Status:** ✅ Production Ready
