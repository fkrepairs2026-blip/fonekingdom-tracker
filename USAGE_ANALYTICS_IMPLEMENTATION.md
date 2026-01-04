# Usage Analytics Implementation

## Overview
Implemented a comprehensive usage analytics system to track how users interact with the application. This helps admins identify frequently used features and make data-driven decisions about which features to add, remove, or improve.

## Changes Made

### 1. Removed Device Details Section
**File:** `js/ui.js` - `buildReceiveDeviceTab()`

**Removed fields:**
- IMEI / Serial Number
- Device Passcode
- Device Color
- Storage Capacity

**Reason:** These fields were rarely used and cluttered the receive device form. The focus is now on essential repair information.

### 2. Usage Analytics Tracking System
**File:** `js/repairs.js`

**New Functions:**
- `trackUsage(eventType, data)` - Core tracking function that logs events to Firebase
- `trackTabSwitch(fromTab, toTab)` - Tracks when users switch between tabs
- `trackFormSubmit(formName, formData)` - Tracks form submissions
- `trackFieldInteraction(fieldName, fieldType)` - Tracks field focus events (throttled)
- `getUsageAnalytics(startDate, endDate, eventType)` - Retrieves analytics data
- `getTabUsageStats(startDate, endDate)` - Aggregated tab usage statistics
- `getFormUsageStats(startDate, endDate)` - Aggregated form usage statistics
- `getFieldUsageStats(startDate, endDate)` - Aggregated field interaction statistics

**Data Structure:**
```javascript
{
    userId: "user_uid",
    userName: "User Name",
    userRole: "admin|manager|technician|cashier",
    eventType: "tab_switch|form_submit|field_interaction",
    timestamp: "2026-01-04T10:30:00.000Z",
    data: {
        // Event-specific data
        // For tab_switch: { fromTab, toTab }
        // For form_submit: { formName, fields }
        // For field_interaction: { fieldName, fieldType }
    }
}
```

### 3. Automatic Tracking Integration
**File:** `js/ui.js` - `switchTab()`

Added automatic tracking call when users switch tabs:
```javascript
if (window.trackTabSwitch && activeTab !== tabId) {
    window.trackTabSwitch(activeTab, tabId);
}
```

### 4. Usage Analytics Admin Tab
**File:** `js/ui.js`

**New Tab:** "Usage Analytics" (Admin only)
- Location: Administration section
- Icon: 📈

**Features:**
- **Time Range Filters:**
  - Today
  - Last 7 Days (default)
  - Last 30 Days

- **Summary Cards:**
  - Total tab switches
  - Total form submissions
  - Total field interactions

- **Most Used Tabs Table:**
  - Rank
  - Tab name
  - Total visits
  - Percentage bar chart

- **Most Used Forms Table:**
  - Rank
  - Form name
  - Total submissions
  - Percentage bar chart

- **Most Used Form Fields Table:**
  - Top 20 most interacted fields
  - Interaction counts

- **Usage by Role Table:**
  - Tab switches per role
  - Most used tab per role

- **Insights & Recommendations:**
  - Automatic insights based on usage data
  - Suggestions for UI optimization

- **Export CSV:**
  - Export raw analytics events
  - Includes timestamp, user, role, event type, and details

## Firebase Structure

New collection: `usageAnalytics`
```
usageAnalytics/
  ├── {eventId1}/
  │   ├── userId: "abc123"
  │   ├── userName: "John Doe"
  │   ├── userRole: "technician"
  │   ├── eventType: "tab_switch"
  │   ├── timestamp: "2026-01-04T10:30:00.000Z"
  │   └── data: { fromTab: "dashboard", toTab: "my" }
  ├── {eventId2}/
  │   ├── userId: "abc123"
  │   ├── userName: "John Doe"
  │   ├── userRole: "technician"
  │   ├── eventType: "form_submit"
  │   ├── timestamp: "2026-01-04T10:35:00.000Z"
  │   └── data: { formName: "receiveDevice", fields: [...] }
  └── ...
```

## Usage Instructions

### For Admins:
1. Navigate to **Administration > Usage Analytics**
2. Select time range (Today, Last 7 Days, Last 30 Days)
3. View analytics data:
   - Which tabs are most frequently used
   - Which forms are submitted most often
   - Which fields users interact with most
   - Usage breakdown by role
4. Export data as CSV for further analysis
5. Use insights to:
   - Remove rarely used features
   - Promote frequently used features
   - Optimize UI/UX based on actual usage

### For Developers:
To track additional interactions, use the exported functions:

```javascript
// Track custom form submission
window.trackFormSubmit('myCustomForm', {
    field1: 'value1',
    field2: 'value2'
});

// Track custom field interaction
window.trackFieldInteraction('customField', 'text');

// Get analytics programmatically
const stats = await window.getTabUsageStats(startDate, endDate);
console.log(stats.mostUsedTabs);
```

## Privacy & Performance

- **Privacy:** Only tracks interaction patterns, not actual data values
- **Throttling:** Field interactions are tracked once per session per field to avoid excessive logging
- **Performance:** 
  - Tracking is async and won't block UI
  - Failed tracking operations are logged but don't affect user experience
  - Data queries use Firebase date range filters for efficiency

## Future Enhancements

Potential additions:
- Track button click frequency
- Track time spent on each tab
- Track error rates per form
- A/B testing framework
- User journey mapping
- Performance metrics (load times, etc.)
- Heatmap visualization
- Predictive analytics for feature recommendations

## Testing Checklist

- [x] Device details section removed from receive device form
- [x] Tab switches are tracked automatically
- [x] Usage analytics tab appears for admin users
- [x] Analytics data loads correctly
- [x] Time range filters work
- [x] CSV export works
- [ ] Data persists to Firebase (test after deployment)
- [ ] Analytics display correctly with real data
- [ ] No performance impact on normal operations

## Notes

- Analytics tracking starts immediately after this deployment
- Data will accumulate over time - check back after a few days for meaningful insights
- No historical data available (tracking starts from deployment date)
- Consider adding Firebase indexing rules if queries become slow:
  ```json
  {
    "rules": {
      "usageAnalytics": {
        ".indexOn": ["timestamp", "eventType", "userId", "userRole"]
      }
    }
  }
  ```
