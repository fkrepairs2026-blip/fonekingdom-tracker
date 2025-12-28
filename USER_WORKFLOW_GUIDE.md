# 📖 Fonekingdom Repair Tracker - User Workflow Guide

## Table of Contents
- [👤 For Technicians](#-for-technicians)
- [💰 For Cashiers](#-for-cashiers)
- [⚙️ For Administrators](#️-for-administrators)
- [📱 Common Tasks](#-common-tasks)

---

## 👤 For Technicians

### What Technicians Can Do
- Receive devices from customers
- Accept and work on repairs
- Set pricing for repairs
- Update repair status
- Collect payments
- Record expenses
- Submit daily remittances
- View repair history

### Daily Workflow

#### 🌅 Starting Your Day

1. **Log In**
   - Open the application
   - Enter your email and password
   - Click "Login"
   - You'll see the Technician Dashboard

2. **Check Your Jobs**
   - Click "🔧 My Jobs" tab
   - Review repairs you're currently working on
   - Check status of each device
   - Plan your day

---

### 📥 Receiving a New Device

**When a customer brings in a device:**

1. **Click "➕ Receive Device" Tab**

2. **Fill in Customer Information**
   - Select Customer Type:
     - **Walk-in**: Individual customer
     - **Dealer**: Repair shop or reseller
   - Enter Customer Name (required)
   - If Dealer, enter Shop Name
   - Enter Contact Number (format: 09171234567)

3. **Enter Device Details**
   - Brand (Samsung, iPhone, Oppo, etc.)
   - Model (Galaxy S21, iPhone 12, etc.)

4. **Select Problem Type** (IMPORTANT!)
   
   **Hardware Issues:**
   - Screen, Battery, Charging Port
   - Camera, Speaker/Microphone
   - Button, Housing/Body
   - Water Damage, Motherboard Issue
   
   **Software Issues (⚠️ Pay Attention to Warnings):**
   - FRP Lock (Google Account) - RED WARNING
   - Password/Pattern Lock - RED WARNING
   - iCloud Lock (Apple ID) - RED WARNING
   - Software Restore/Reflash - YELLOW WARNING
   - Other software issues - YELLOW WARNING

   **What the Warnings Mean:**
   - 🔴 **Red Warning**: High risk! Verify ownership, request proof of purchase
   - 🟡 **Yellow Warning**: Inform customer about data backup and potential data loss

5. **Describe the Problem**
   - Write detailed problem description
   - Be specific (e.g., "Screen cracked in top right corner, touch not working")

6. **Take Photos** (Recommended)
   - Click "Choose Files" to upload photos
   - Take up to 4 photos
   - Document visible damage
   - Photos help with before/after comparison

7. **Check for Back Jobs**
   - If system detects customer's phone number, it shows "Back Job" option
   - If checked, you'll be automatically assigned (if you did the previous repair)
   - Review previous repair history

8. **Submit**
   - Click "Receive Device"
   - Device appears in "Received Devices" pool
   - You or another tech can accept it

**💡 Pro Tip:** For software issues, always inform customers about data loss and warranty limitations upfront!

---

### 🔧 Accepting a Repair Job

**When you're ready to work on a device:**

1. **Browse Available Devices**
   - Look at "📥 Received Devices" tab (all techs can see this)
   - Review problem descriptions
   - Choose repairs matching your expertise

2. **Accept the Repair**
   - Click "Accept Repair" button on the device card
   - Confirm you want to take this job
   - Device moves to your "🔧 My Jobs" tab
   - Status changes from "Received" to "In Progress"

3. **You're Now Responsible!**
   - Device is assigned to you
   - Other techs can't accept it
   - You'll handle updates, pricing, and completion

**💡 Pro Tip:** Only accept repairs you're confident handling. Quality matters more than quantity!

---

### 💰 Setting Pricing

**After diagnosing the issue:**

1. **Find the Repair in Your Jobs**
   - Go to "🔧 My Jobs" tab
   - Locate the device

2. **Click "Set Pricing" or "Edit Details"**
   - Opens the pricing modal

3. **Fill in Pricing Details**
   - **Repair Type**: What you'll do (e.g., "Screen Replacement")
   - **Part Type**: 
     - Original/OEM
     - High Copy
     - Service (China)
     - Customer Provided
     - Not Applicable (for software repairs)
   - **Part Source**:
     - Stock (we have it)
     - Supplier A/B (need to order)
     - Customer
     - Other
   - **Parts Cost**: Cost of parts in pesos (₱)
   - **Labor Cost**: Your service charge (₱)
   - **Total**: Automatically calculated

4. **Special Flags**
   - Check "Microsoldering" if it's a board-level repair
   - This allows "Unsuccessful" status if repair fails

5. **Record Parts Cost** (Optional but Recommended)
   - Click "💰 Record Parts Cost" button
   - Enter actual parts cost and notes
   - Helps with expense tracking and profit calculation

6. **Save**
   - Click "Save" button
   - Pricing is now set
   - Customer can be informed of cost

**💡 Pro Tip:** Always separate parts cost and labor cost clearly. It helps with warranty claims and accounting!

---

### 📊 Updating Repair Status

**As you progress with the repair:**

1. **Available Status Updates**
   - **In Progress**: Currently working on it
   - **Waiting for Parts**: Ordered parts, waiting for delivery
   - **Ready for Pickup**: Repair complete, device ready
   - **Unsuccessful**: (Microsoldering only) Repair failed
   - **RTO** (Return to Owner): Customer declined repair

2. **How to Update**
   - Go to "🔧 My Jobs" tab
   - Find the device
   - Click "Update Status" button
   - Select new status
   - Add notes (optional but recommended)
   - Click "Update"

3. **Status Progression**
   ```
   In Progress
       ↓
   Waiting for Parts (if needed)
       ↓
   In Progress (parts arrived)
       ↓
   Ready for Pickup
   ```

**💡 Pro Tip:** Update status promptly so customers and management know progress!

---

### 💵 Collecting Payments

**When a customer wants to pay (partial or full):**

1. **Find the Repair**
   - Can be in any status
   - Usually in "Ready for Pickup" or "In Progress"

2. **Click "💰 Record Payment"**

3. **Enter Payment Details**
   - **Amount**: How much they're paying (₱)
   - **Payment Method**: 
     - Cash
     - GCash
     - PayMaya
     - Bank Transfer
   - **Payment Date**: When they paid (usually today)
   - **Notes**: Optional (e.g., "First payment of 2")
   - **Photo**: Upload proof (receipt, screenshot) if digital payment

4. **Important: Technician Collections**
   - Payment will be marked as "Collected by Technician"
   - Status: ⏳ Pending Remittance
   - You must include this in your daily remittance
   - Payment won't count toward balance until you remit and cashier verifies

5. **Save Payment**
   - Click "Save Payment"
   - Payment recorded but pending your remittance

**💡 Pro Tip:** Always get proof for digital payments (screenshot of GCash, etc.)

---

### 🧾 Recording Expenses

**When you spend money for repairs or daily needs:**

#### Two Types of Expenses:

**1. Repair-Specific Expense** (e.g., buying parts for a specific job)
   - Go to "🔧 My Jobs"
   - Find the repair
   - Click "💳 Record Expense" button
   - Select category (usually "Parts")
   - Enter amount and description
   - Click "Save"

**2. General Daily Expense** (e.g., delivery fee, transportation)
   - Go to "💰 Daily Remittance" tab
   - Click "💳 Record Expense" button
   - Select category:
     - Delivery Fee
     - Cash Advance
     - Transportation
     - Meals
     - Parts
     - Other
   - Enter amount and description
   - Click "Save"

**Example Expenses:**
```
🚚 Delivery Fee - ₱150 - "Lalamove delivery for Samsung part"
🚗 Transportation - ₱60 - "Jeep fare to supplier"
🍔 Meals - ₱100 - "Lunch break"
🔧 Parts - ₱500 - "Bought screen from supplier B"
```

**💡 Pro Tip:** Record expenses immediately! Don't wait until end of day or you'll forget!

---

### 💰 Daily Remittance Process

**At the end of your shift:**

1. **Go to "💰 Daily Remittance" Tab**

2. **Review Your Day**
   
   **Collected Payments:**
   - Lists all payments you collected today
   - Shows customer names, amounts, methods
   - See total collected
   
   **Daily Expenses:**
   - Lists all expenses you recorded
   - Shows categories and amounts
   - See total expenses
   
   **Expected Remittance:**
   - Formula: Total Payments - Total Expenses
   - This is what you should hand over

3. **Click "📤 Submit Remittance"**

4. **Remittance Modal Opens**
   - Review summary again
   - **Important**: Count your cash carefully!

5. **Enter Actual Amount**
   - Enter the cash you're physically handing over
   - Must be in pesos (₱)

6. **Check for Discrepancy**
   - System compares Expected vs Actual
   - **No discrepancy**: Green ✅ Perfect match!
   - **Minor discrepancy** (< 5%): Yellow ⚠️ Small difference
   - **Major discrepancy** (≥ 5%): Red 🚨 Large difference

7. **Explain Discrepancy** (if any)
   - Required if amounts don't match
   - Be honest and specific
   - Examples:
     - "Customer gave ₱2000 for ₱1950 bill, kept ₱50 change as tip"
     - "Forgot to record ₱100 transportation expense"
     - "Gave ₱50 discount to regular customer, not recorded"

8. **Submit Remittance**
   - Click "Submit Remittance"
   - Status: ⏳ Pending Verification
   - All payments marked as "Remitted"
   - Wait for cashier/admin to verify

9. **What Happens Next**
   - Cashier/Admin reviews your remittance
   - They verify the cash matches
   - **If approved**: ✅ Payments verified, counts toward repair balances
   - **If rejected**: ❌ You'll need to resubmit with corrections

**💡 Pro Tips:**
- Count cash twice before submitting!
- Record ALL expenses immediately
- Don't mix personal money with remittance
- If discrepancy, explain clearly and honestly
- Submit remittance before leaving for the day

---

### 📝 Viewing Your Remittance History

**To check past remittances:**

1. **Go to "💰 Daily Remittance" Tab**

2. **Scroll Down to Remittance History**

3. **See All Past Remittances**
   - Date submitted
   - Total payments collected
   - Total expenses
   - Expected vs Actual amounts
   - Status:
     - ⏳ Pending: Waiting for verification
     - ✅ Approved: Verified and accepted
     - ❌ Rejected: Needs resubmission
   - Verification notes from cashier/admin

4. **Click "View Details"**
   - See full breakdown
   - All payments included
   - All expenses listed
   - Verification notes

---

### 📋 Viewing Modification Requests

**To check status of your requests:**

1. **Go to "📝 My Requests" Tab**

2. **See All Your Requests**
   - Pending requests (waiting for approval)
   - Approved requests
   - Rejected requests

3. **Request Types You Might Submit**
   - (Currently, as technician you mostly submit through normal workflows)
   - Any special edit requests would appear here

---

## 💰 For Cashiers

### What Cashiers Can Do
- Receive devices from customers
- Record payments (auto-verified)
- Verify technician payments
- Release devices to customers
- Verify technician remittances
- View all repairs
- Generate cash count reports
- Update device status (limited)

### Daily Workflow

#### 🌅 Starting Your Day

1. **Log In**
   - Enter your email and password
   - Click "Login"
   - You'll see the Cashier Dashboard

2. **Check Dashboard Stats**
   - 📥 Received Devices
   - 🔧 In Progress
   - 📦 For Release (devices ready for pickup)
   - ⏳ Pending Verification (payments needing verification)

3. **Priority Tasks**
   - Verify pending technician payments
   - Verify pending remittances
   - Release ready devices to customers

---

### 📥 Receiving Devices (Customer Service)

**When a customer walks in with a device:**

1. **Click "➕ Receive Device" Tab**

2. **Greet Customer & Gather Info**
   - Is this a walk-in customer or dealer?
   - Get their full name
   - Get contact number (important for updates!)
   - Ask about the device and problem

3. **Fill in the Form**
   - Follow same steps as Technician (see Technician section above)
   - Select problem type carefully
   - Pay attention to warning messages
   - Take photos if visible damage

4. **Explain to Customer**
   - If RED WARNING (FRP/Password/iCloud Lock):
     - "We need proof of ownership"
     - "This may not be possible on all devices"
     - "There's risk involved"
   - If YELLOW WARNING (Software/Data):
     - "Please backup your data"
     - "There might be data loss"
     - "We'll try our best to preserve data"

5. **Set Expectations**
   - "Our technician will diagnose and provide pricing"
   - "We'll call you with the quote"
   - "Typical turnaround time is X days"

6. **Submit & Give Receipt** (if you print receipts)
   - Click "Receive Device"
   - Note the repair ID for reference
   - Tell customer to keep their contact number available

**💡 Pro Tip:** Be warm and reassuring! Many customers are worried about their devices.

---

### 💵 Recording Payments (Cashier)

**When customer makes a payment:**

1. **Find the Repair**
   - Search by name or phone number
   - Or browse through tabs

2. **Click "💰 Record Payment"**

3. **Enter Payment Details**
   - **Amount**: How much they're paying
   - **Method**: Cash, GCash, PayMaya, Bank Transfer
   - **Payment Date**: Usually today, but can be changed if needed
   - **Notes**: Add context (e.g., "Down payment", "Final payment")
   - **Photo**: Upload proof if digital payment

4. **Important: Cashier Payments**
   - Your payments are **auto-verified** ✅
   - They immediately count toward repair balance
   - No need for additional verification
   - This is because you're trusted to handle cash directly

5. **Save Payment**
   - Click "Save Payment"
   - Payment shows as "✅ Verified"
   - Balance updates immediately

6. **Inform Customer**
   - Tell them remaining balance
   - If fully paid, let them know device will be ready soon

**💡 Pro Tip:** Always double-check the amount before saving! Mistakes require admin approval to fix.

---

### ✅ Verifying Technician Payments

**When technicians collect payments:**

1. **Go to "⏳ Pending Verification" Tab**

2. **See All Unverified Payments**
   - Payments collected by technicians
   - Sorted by date
   - Shows customer, amount, method, technician name

3. **Review Each Payment**
   - Check if amount seems reasonable
   - Verify payment method matches
   - Look at proof photo if available
   - Check if part of remittance or standalone

4. **Verify or Request Clarification**
   - **To Verify**: Click "✅ Verify" button
   - **If Unsure**: Ask technician for clarification
   - **If Wrong**: Ask technician to correct (admin can reject)

5. **After Verification**
   - Payment now counts toward repair balance
   - Customer's balance updates
   - Device may become ready for release if fully paid

**💡 Pro Tip:** Verify payments promptly so customers can pick up devices without delay!

---

### 💰 Verifying Daily Remittances

**When technicians submit end-of-day remittance:**

1. **Go to "💰 Verify Remittance" Tab**

2. **See Pending Remittances**
   - Technician name
   - Date submitted
   - Expected amount
   - Number of payments and expenses

3. **Click "View Details" on a Remittance**

4. **Review Everything Carefully**
   
   **Collected Payments Section:**
   - List of all payments collected
   - Customer names and amounts
   - Payment methods
   - Verify these match your records
   
   **Expenses Section:**
   - All expenses claimed
   - Categories and amounts
   - Descriptions
   - Check if expenses seem reasonable
   
   **Calculation Summary:**
   ```
   Total Payments: ₱5,000
   Total Expenses: ₱300
   Expected Amount: ₱4,700
   Actual Handed: ₱4,700
   Discrepancy: ₱0 ✅
   ```

5. **Check for Discrepancies**
   
   **No Discrepancy (Match)**: ✅
   - Expected = Actual
   - Green checkmark
   - Quick approval
   
   **Minor Discrepancy (< 5%)**: ⚠️ Yellow
   - Small difference (e.g., ₱50 on ₱2,000)
   - Review technician's explanation
   - Usually acceptable (tips, small miscalculations)
   
   **Major Discrepancy (≥ 5%)**: 🚨 Red
   - Large difference (e.g., ₱200 on ₱2,000)
   - Read explanation carefully
   - May need to ask technician for clarification
   - Verify cash count before approving

6. **Count the Physical Cash**
   - Most Important Step!
   - Count the cash the technician handed over
   - Does it match the "Actual Amount" they entered?

7. **Make Decision**
   
   **To Approve:**
   - Cash count matches actual amount
   - Expenses seem legitimate
   - Discrepancy (if any) is explained reasonably
   - Click "✅ Approve Remittance"
   - Add verification notes (optional but good practice)
   - Example: "Verified, cash count correct"
   
   **To Reject:**
   - Cash count doesn't match
   - Unexplained discrepancy
   - Suspicious expenses
   - Click "❌ Reject Remittance"
   - Add reason (required)
   - Example: "Cash count shows ₱4,500 but you entered ₱4,700. Please recount and resubmit."

8. **After Approval**
   - ✅ All payments in remittance become verified
   - Repair balances update
   - Remittance marked as "Approved"
   - Technician can see approval in their history

9. **After Rejection**
   - ❌ Payments reset to "Pending"
   - Remittance marked as "Rejected"
   - Technician must resubmit with corrections

**💡 Pro Tips:**
- Always count cash twice!
- If unsure, ask the technician before rejecting
- Document issues in verification notes
- Approve promptly so devices can be released
- Trust but verify - check expenses reasonably

**Common Scenarios:**

**Scenario 1: Perfect Match**
```
Expected: ₱3,000
Actual: ₱3,000
Action: Quick approve ✅
```

**Scenario 2: Small Tip**
```
Expected: ₱2,050
Actual: ₱2,000
Reason: "Customer kept ₱50 as tip"
Action: Approve with note "Tip accepted" ✅
```

**Scenario 3: Forgotten Expense**
```
Expected: ₱5,000
Actual: ₱4,850
Reason: "Forgot to record ₱150 transportation"
Action: Ask tech to add expense and resubmit
```

**Scenario 4: Major Discrepancy**
```
Expected: ₱4,000
Actual: ₱3,500
Reason: "Miscounted"
Action: Reject and ask to recount ❌
```

---

### 📦 Releasing Devices to Customers

**When customer comes to pick up their repaired device:**

1. **Verify Device is Ready**
   - Status: "Ready for Pickup" or "Completed"
   - Payment status: FULLY PAID (balance = ₱0)

2. **If Not Fully Paid**
   - Cannot release yet
   - Customer must pay remaining balance first
   - Record final payment
   - Then proceed with release

3. **Click "✅ Release to Customer"**

4. **Release Modal Opens**
   - Shows device summary
   - Shows payment history
   - Shows repair details

5. **Select Warranty Period**
   - **No Warranty (0 days)**: For software repairs, customer-provided parts
   - **7 days**: Short warranty for minor repairs
   - **15 days**: 
   - **30 days**: Standard warranty (most common)
   - **60 days**: 
   - **90 days**: Extended warranty
   - **180 days**: 6 months (rare, quality parts)
   - **365 days**: 1 year (very rare, premium service)

6. **Warranty Dates**
   - System auto-calculates start and end dates
   - Start: Today
   - End: Today + warranty period

7. **Add Warranty Terms** (Optional but Recommended)
   
   **Quick Bilingual Templates:**
   
   English:
   ```
   Warranty covers parts and labor for same issue only.
   Does not cover physical damage or water damage.
   Customer must return device in same condition.
   ```
   
   Tagalog:
   ```
   Warranty para sa parehong issue lang.
   Hindi kasali ang physical damage o tubig.
   Kailangan ibalik ang device sa parehong kondisyon.
   ```

8. **Add Release Notes** (Optional)
   - Any special instructions to customer
   - "Keep device dry for 24 hours"
   - "Charge fully before first use"
   - "Do not update software yet"

9. **Customer Signature**
   - Check the box to confirm customer signed
   - (Physical signature on paper receipt)

10. **Click "Release Device"**
    - Device moves to "✅ Claimed Units" tab
    - Status changes to "Claimed"
    - Warranty becomes active
    - Customer can now take their device

11. **Inform Customer**
    - "Your warranty is X days"
    - "If same problem returns, bring it back for free repair"
    - "Keep your receipt"
    - "Call us if any issues"

**💡 Pro Tips:**
- Most repairs: 30-day warranty
- Software repairs: Often no warranty (data-related issues may recur)
- Customer-provided parts: No warranty or short warranty
- Explain warranty terms clearly to customer
- Make sure they understand what's covered and what's not

---

### 💵 Cash Count Report

**At end of day, reconcile cash:**

1. **Go to "💵 Cash Count" Tab**

2. **Select Date Range**
   - Usually "Today" for daily cash count
   - Can select custom range for weekly/monthly

3. **Filter Options**
   - Payment Method: Usually "Cash" only
   - Verification Status: Usually "Verified" only
   - Can include GCash/PayMaya if you received them as cash

4. **Generate Report**
   - Click "Generate Cash Count"
   - See list of all cash payments
   - Shows:
     - Customer name
     - Amount
     - Payment date
     - Received by whom
     - Repair ID

5. **Total Calculation**
   - System adds up all cash payments
   - This is how much cash should be in drawer
   - Compare with physical cash count

6. **Reconciliation**
   - Count physical cash in drawer
   - Should match the report total
   - If doesn't match:
     - Check for unverified payments
     - Check if any payments marked wrong method
     - Check for technician remittances pending
     - Ask admin for help if large discrepancy

**💡 Pro Tip:** Do cash count daily! Easier to track down discrepancies while memory is fresh.

---

### 🛡️ Handling Warranty Claims

**When customer returns during warranty period:**

1. **Find Original Repair**
   - Go to "✅ Claimed Units" tab
   - Search for customer's device
   - Check warranty status:
     - 🛡️ **Warranty Active**: Can process claim
     - ⏰ **Warranty Expired**: Must charge customer

2. **If Warranty Active**
   - Ask customer about the problem
   - **Is it the same issue?**
   - **Is it related to repair?**
   - **Or completely different?**

3. **You Cannot Process Warranty Claims**
   - Only Admin/Manager can process warranty claims
   - Inform Admin/Manager
   - They will handle the warranty claim process

4. **What Admin/Manager Will Do**
   - Click "🛡️ Warranty Claim" button
   - Select claim type
   - Create new repair entry
   - Free repair if covered

5. **If Warranty Expired**
   - Treat as new repair
   - Regular pricing applies
   - Can offer returning customer discount (ask manager)

**💡 Pro Tip:** Always check warranty dates before promising free repairs to customers!

---

## ⚙️ For Administrators

### What Administrators Can Do
Everything! Full system access:
- All cashier functions
- All technician viewing functions (but don't usually do repair work)
- User management
- Approve/reject modification requests
- Process warranty claims
- Direct edit capabilities
- System configuration
- View all reports and analytics

### Daily Workflow

#### 🌅 Starting Your Day

1. **Log In as Admin**
   - You'll see the most comprehensive dashboard
   - Multiple tabs with all system functions

2. **Quick System Overview**
   - Check dashboard statistics
   - 📥 Received Devices: Devices waiting for technician assignment
   - 🔧 In Progress: Active repairs
   - 📦 For Release: Devices ready but not picked up
   - ⏳ Pending Verification: Payments/Remittances needing review
   - 🔔 Mod Requests: Edit requests needing approval

3. **Priority Tasks**
   - Verify pending remittances
   - Review modification requests
   - Check for system issues
   - Monitor workflow bottlenecks

---

### 👥 User Management

#### Creating New Users

**When hiring new staff:**

1. **Go to "👥 Users" Tab**

2. **Click "➕ Add New User"**

3. **Fill in User Details**
   - **Email**: Their work email (must be valid)
   - **Password**: Temporary password (min 6 characters)
   - **Display Name**: Their full name
   - **Role**: Select role carefully:
     - **Admin**: Full access (use sparingly!)
     - **Manager**: Operations management, cannot manage users
     - **Cashier**: Customer service, payments, verification
     - **Technician**: Repair work, job management
   - **Technician Name**: Only if role is Technician
     - Short name for display (e.g., "Tech1", "Jay")

4. **Create User**
   - Click "Create User"
   - Firebase creates authentication account
   - User data saved to database
   - User can log in immediately

5. **Give User Their Credentials**
   - Provide email and temporary password
   - Ask them to change password on first login (not enforced yet, but good practice)

**💡 Pro Tips:**
- Use work emails, not personal
- Create strong temporary passwords
- Only create admin accounts when absolutely necessary
- Document who has admin access

**Example Users Setup:**
```
Admin:
- owner@fonekingdom.com (Owner)
- manager@fonekingdom.com (Shop Manager)

Cashiers:
- cashier1@fonekingdom.com (Morning shift)
- cashier2@fonekingdom.com (Afternoon shift)

Technicians:
- tech1@fonekingdom.com (Technician Name: "Tech1")
- tech2@fonekingdom.com (Technician Name: "Jay")
- tech3@fonekingdom.com (Technician Name: "Mike")
```

---

#### Deactivating Users

**When staff leaves or needs to be suspended:**

1. **Go to "👥 Users" Tab**

2. **Find the User**
   - Scroll through user list
   - Or search by name/email

3. **Click "Deactivate" Button**
   - Confirm you want to deactivate
   - User status changes to "Inactive"
   - User is immediately logged out (if currently logged in)
   - User cannot log back in

4. **What Happens**
   - ❌ User cannot log in
   - ✅ User data preserved
   - ✅ Repair history preserved
   - ✅ Can be reactivated later if needed

5. **To Reactivate Later**
   - Click "Activate" button
   - User can log in again
   - All data intact

**💡 Pro Tip:** Deactivate rather than delete! Preserves audit trail and can be undone.

---

### 🔔 Reviewing Modification Requests

**When staff request to edit data:**

1. **Go to "🔔 Mod Requests" Tab**

2. **See All Pending Requests**
   - Sorted by date
   - Shows who requested
   - Shows what they want to change
   - Shows reason

3. **Click to View Details**
   - See original value
   - See proposed new value
   - Read reason for change
   - View repair context

4. **Common Request Types**
   - Payment date corrections (customer paid earlier/later than recorded)
   - Repair detail corrections (typos, wrong part type)
   - Pricing adjustments (wrong amount entered)
   - Status corrections (accidentally marked wrong status)

5. **Make Decision**
   
   **To Approve:**
   - Request seems legitimate
   - Reason makes sense
   - Change is necessary
   - Click "✅ Approve"
   - Add approval notes (optional)
   - Example: "Approved - customer confirmed payment was on Dec 25"
   
   **To Reject:**
   - Request doesn't seem justified
   - Change not necessary
   - Need more information
   - Click "❌ Reject"
   - Add rejection reason (required)
   - Example: "Need manager confirmation first"

6. **After Approval**
   - Change is applied to the repair
   - Requester is notified
   - Audit trail preserved

7. **After Rejection**
   - No change is made
   - Requester is notified with reason
   - They can resubmit with more info

**💡 Pro Tips:**
- Review requests daily
- Ask for clarification if unsure
- Always leave notes
- Trust staff but verify changes
- Watch for patterns (same person requesting many changes)

---

### 🛡️ Processing Warranty Claims

**When customer returns with warranty issue:**

1. **Find Original Repair**
   - Go to "✅ Claimed Units" tab
   - Search for customer's name or phone
   - Or have repair ID ready

2. **Check Warranty Status**
   - 🛡️ **Warranty Active** - Can process claim
   - ⏰ **Warranty Expired** - Cannot use warranty, charge as new repair

3. **If Warranty Active, Click "🛡️ Warranty Claim"**

4. **Warranty Claim Modal Opens**
   - Shows original repair details
   - Shows warranty information
   - Shows warranty dates

5. **Talk to Customer**
   - What's wrong now?
   - Is it the same issue or different?
   - When did it start happening?

6. **Select Claim Type**
   
   **1. Same Issue - Free Repair**
   - Exact same problem returned
   - Definitely covered under warranty
   - Customer pays: ₱0
   - Auto-assigns to original technician
   
   **2. Related Issue - Warranty Covers**
   - Problem related to original repair
   - Example: Replaced screen, now touch is glitchy (could be related)
   - Covered under warranty
   - Customer pays: ₱0
   - Requires technician assessment
   
   **3. Different Issue - NOT Covered**
   - Completely unrelated problem
   - Example: Replaced screen, now battery drains fast (not related)
   - NOT covered under warranty
   - Customer will be charged normally
   - Still creates record linked to original repair

7. **Describe the New Issue**
   - Write detailed description
   - Mention customer's complaint
   - Note any visible damage

8. **Upload Photos** (Recommended)
   - Take photos of current state
   - Document new problem
   - Helps with assessment

9. **Review Summary**
   - Original repair details
   - New issue description
   - Coverage (Free or Paid)
   - Technician assignment

10. **Submit Warranty Claim**
    - Click "Submit Warranty Claim"
    - New repair entry created
    - Linked to original repair
    - Auto-assigned to original technician
    - Cost set based on coverage (₱0 if covered)

11. **What Happens Next**
    - Technician sees in their "🔧 My Jobs"
    - Marked as warranty claim
    - Technician diagnoses and repairs
    - If actually not covered, technician can update pricing
    - Customer notified when ready

**💡 Pro Tips:**
- Always check warranty dates first
- Be fair but protect the business
- If unsure, select "Related Issue" - let technician assess
- Explain to customer what's covered and what's not
- Document everything

**Example Scenarios:**

**Scenario 1: Clear Warranty Claim**
```
Original: Screen Replacement (30-day warranty)
Issue after 10 days: Screen lines appearing
Assessment: Same issue
Action: Free repair under warranty ✅
```

**Scenario 2: Questionable**
```
Original: Battery Replacement (30-day warranty)
Issue after 15 days: Phone won't turn on
Assessment: Could be battery OR motherboard
Action: Select "Related Issue", let tech diagnose
Decision: Tech finds battery defective - Free replacement ✅
```

**Scenario 3: Not Covered**
```
Original: Screen Replacement (30-day warranty)
Issue after 20 days: Water damage
Assessment: Completely different, customer's fault
Action: "Different Issue - NOT Covered"
Decision: Charge customer normally ❌ (not warranty)
```

**Scenario 4: Expired**
```
Original: Screen Replacement (30-day warranty)
Issue after 45 days: Same problem
Assessment: Warranty expired
Action: Cannot process as warranty claim
Decision: Treat as new repair, can offer discount for returning customer
```

---

### 💰 Verifying Remittances (Same as Cashier)

**As admin, you can verify remittances:**
- Follow same process as Cashier (see Cashier section above)
- You have same verification interface
- Same approval/rejection workflow
- Your verifications are tracked in audit trail

---

### 📊 Viewing Reports

#### Supplier Report

**To track parts spending by supplier:**

1. **Go to "📊 Supplier Report" Tab**

2. **Select Date Range**
   - Today
   - This Week
   - This Month
   - Custom Range

3. **Generate Report**
   - Click "Generate Report"

4. **See Breakdown**
   ```
   📦 Stock Parts: ₱15,000 (12 repairs)
   🏪 Supplier A: ₱8,500 (5 repairs)
   🏪 Supplier B: ₱12,000 (8 repairs)
   👤 Customer Provided: ₱0 (3 repairs)
   📋 Other Sources: ₱2,000 (2 repairs)
   
   Total Parts Cost: ₱37,500
   ```

5. **Use This Data For**
   - Negotiating with suppliers
   - Inventory planning
   - Profit margin analysis
   - Expense tracking

---

### 🔧 Direct Editing Capabilities

**Unlike other roles, you can edit directly without requests:**

#### Edit Payment Dates
- Click "Edit Date" on any payment
- Change date directly
- Save immediately
- No approval needed
- Still creates audit trail

#### Edit Repair Details
- Click "Edit Details" on any repair
- Change any field
- Save immediately
- Changes tracked

#### Edit Pricing
- Click "Set Pricing" on any repair
- Modify parts/labor costs
- Update immediately

**💡 Pro Tip:** With great power comes great responsibility! Document why you're making direct edits.

---

### 📋 Monitoring All Repairs

**As admin, you have "📋 All Repairs" tab:**

1. **See Every Repair in System**
   - All statuses
   - All technicians
   - All dates
   - Comprehensive view

2. **Search and Filter**
   - By customer name
   - By phone number
   - By status
   - By technician
   - By date range

3. **Bulk Actions** (if needed)
   - Export data (future feature)
   - Generate reports
   - System maintenance

**💡 Pro Tip:** Use this view for system oversight, finding old repairs, and generating comprehensive reports.

---

### 🚨 Troubleshooting & Support

**When staff have issues:**

#### Common Admin Tasks:

**Reset User Password:**
- Currently: Need Firebase Console access
- Future: Built-in password reset

**Fix Payment Issues:**
- Check verification status
- Verify/reject as needed
- Edit payment details if wrong

**Fix Stuck Repairs:**
- Check current status
- Verify who's assigned
- Update status if needed
- Reassign technician if necessary

**Resolve Discrepancies:**
- Review payment history
- Check remittance records
- Verify with staff
- Make corrections as needed

**System Health:**
- Monitor pending items
- Check for bottlenecks
- Ensure workflow moving smoothly
- Address backlog

---

## 📱 Common Tasks

### For All Users

#### Logging In
1. Open application URL
2. Enter email and password
3. Click "Login"
4. Dashboard loads based on your role

#### Logging Out
1. Click your profile picture (top right)
2. Profile modal opens
3. Click "Logout" button
4. Confirm logout

#### Viewing Your Profile
1. Click profile picture (top right)
2. See your information:
   - Display name
   - Email
   - Role
   - Last login
   - Login history

#### Changing Profile Picture
1. Open profile modal
2. Click on profile picture
3. Select new image file
4. Image uploads and updates

#### Searching for Repairs
1. Use search boxes in tabs
2. Search by:
   - Customer name
   - Phone number
   - Repair ID
3. Results filter in real-time

#### Viewing Repair Details
1. Find repair in any tab
2. Click "📄 View Details" button
3. See complete information:
   - Customer details
   - Device info
   - Problem description
   - Status history
   - Payments
   - Photos
   - Warranty info

#### Viewing Photos
1. In repair details, see photo gallery
2. Click any photo
3. Opens full-screen viewer
4. Click X or outside to close

---

### Understanding Statuses

**Device Lifecycle:**

1. **📥 Received**
   - Just arrived
   - Waiting for technician to accept
   - Not yet assigned

2. **🔧 In Progress**
   - Technician actively working
   - Diagnosis or repair happening
   - May have pricing set

3. **⏰ Waiting for Parts**
   - Repair paused
   - Ordered parts from supplier
   - Waiting for delivery

4. **📦 Ready for Pickup**
   - Repair complete
   - Device tested and working
   - Waiting for customer pickup

5. **✅ Completed**
   - Customer paid in full
   - Device released
   - Warranty active

6. **🛡️ Claimed**
   - Customer picked up device
   - Warranty period active
   - Can process warranty claims

**Special Statuses:**

7. **🚫 RTO** (Return to Owner)
   - Customer declined repair
   - Too expensive or not worth it
   - Device returned as-is

8. **❌ Unsuccessful**
   - Repair attempted but failed
   - Only for microsoldering
   - Customer may pay diagnostic fee

---

### Understanding Payment Status

**Payment Verification States:**

1. **✅ Verified**
   - Payment confirmed and counted
   - Counts toward repair balance
   - Can proceed with release

2. **⏳ Pending Verification**
   - Technician collected payment
   - Waiting for cashier/admin to verify
   - Does NOT count toward balance yet

3. **📤 Remitted**
   - Technician submitted in remittance
   - Waiting for remittance verification
   - Does NOT count toward balance yet

**Who's Payments Are Auto-Verified:**
- ✅ Admin: Always auto-verified
- ✅ Manager: Always auto-verified
- ✅ Cashier: Always auto-verified
- ⏳ Technician: Needs verification after remittance

---

### Understanding Warranty

**Warranty Terms:**
- Covers SAME ISSUE only
- Does NOT cover:
  - Physical damage
  - Water damage
  - Different problems
  - Customer misuse
  - Software issues (usually)
- Customer must return device in same condition
- Must be within warranty period

**Warranty Periods:**
- 0 days = No warranty
- 7 days = 1 week
- 15 days = 2 weeks
- 30 days = 1 month (standard)
- 60 days = 2 months
- 90 days = 3 months
- 180 days = 6 months
- 365 days = 1 year

**When to Give Different Warranties:**
- No warranty: Software repairs, customer parts, risky repairs
- 7-15 days: Short warranty for minor repairs
- 30 days: Standard for most repairs
- 60-90 days: Quality parts, good repairs
- 180-365 days: Premium service, very rare

---

### Tips for Success

#### For Technicians:
✅ Accept jobs you can handle well
✅ Update status promptly
✅ Record ALL expenses immediately
✅ Count cash carefully before remitting
✅ Explain discrepancies honestly
✅ Communicate with customers about progress
✅ Document with photos

#### For Cashiers:
✅ Be friendly and professional with customers
✅ Verify technician payments promptly
✅ Count cash carefully when verifying remittances
✅ Ask for clarification if unsure
✅ Explain warranty terms clearly to customers
✅ Keep workspace organized
✅ Do daily cash counts

#### For Admins:
✅ Monitor system health daily
✅ Review requests promptly
✅ Support staff when they need help
✅ Trust but verify
✅ Document important decisions
✅ Keep user accounts organized
✅ Watch for patterns and issues
✅ Maintain system integrity

---

## 🆘 Getting Help

### If You Encounter Issues:

1. **Check this guide first**
2. **Ask a coworker or supervisor**
3. **Check if it's a permission issue** (wrong role)
4. **Contact admin/IT support**
5. **Document the issue** (screenshots help!)

### Common Issues:

**"I can't see the button"**
- Check your role permissions
- Some actions restricted to certain roles
- Ask admin if you need different access

**"Payment not counting toward balance"**
- Check if payment is verified
- Technician payments need remittance + verification
- Cashier/Admin payments are auto-verified

**"I made a mistake"**
- Non-admins: Submit modification request
- Admins: Can edit directly
- Explain what happened

**"Device not showing up"**
- Check which tab you're in
- Try searching by name/phone
- Check "All Repairs" tab (if you have access)

**"Can't release device"**
- Check if fully paid (balance = ₱0)
- Check if status is "Ready for Pickup"
- Verify all payments are verified

---

## 📞 Support

For technical issues or questions about this guide:
- Contact your administrator
- Check system documentation
- Refer to this workflow guide

**Remember:** This system is designed to make our repair business more efficient. Follow the workflows, communicate clearly, and document everything! 🎉

---

**Version:** 1.0  
**Last Updated:** December 29, 2025  
**System:** Fonekingdom Repair Tracker v2.0

