// ===== ATTENDANCE MODULE =====

/**
 * Attendance tracking for technicians and cashiers
 * Tracks clock in/out, breaks, and work duration
 */

// Global attendance state
window.allAttendance = {};
window.allUserActivity = {};

// Initialize Firebase listeners
function initAttendanceListeners() {
    console.log('🕐 Initializing attendance listeners...');

    const db = firebase.database();

    // Listen to all attendance records
    db.ref('userAttendance').on('value', (snapshot) => {
        window.allAttendance = snapshot.val() || {};
        console.log('📊 Attendance data updated:', Object.keys(window.allAttendance).length, 'users');
    });

    // Listen to user activity status
    db.ref('userActivity').on('value', (snapshot) => {
        window.allUserActivity = snapshot.val() || {};
        console.log('👥 User activity updated:', Object.keys(window.allUserActivity).length, 'users');

        // Update UI if on relevant tab (increased delay for state propagation)
        if (window.currentTabRefresh) {
            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 500); // Increased to 500ms to ensure global state is available
        }
    });
}

/**
 * Clock in current user
 */
async function clockIn() {
    try {
        if (!window.currentUser) {
            alert('Please log in first');
            return;
        }

        utils.showLoading(true);
        const db = firebase.database();
        const userId = window.currentUser.uid;
        const now = new Date().toISOString();
        const today = getLocalDateString(new Date());

        // Check if already clocked in
        const activitySnapshot = await db.ref(`userActivity/${userId}`).once('value');
        const currentActivity = activitySnapshot.val();

        if (currentActivity && currentActivity.currentStatus === 'clocked-in') {
            utils.showLoading(false);
            alert('You are already clocked in!');
            return;
        }

        // Check if already clocked in today
        const attendanceSnapshot = await db.ref(`userAttendance/${userId}/${today}`).once('value');
        const todayAttendance = attendanceSnapshot.val();

        if (todayAttendance && todayAttendance.clockIn && !todayAttendance.clockOut) {
            utils.showLoading(false);
            alert('You already have an active clock-in for today!');
            return;
        }

        // Create attendance record
        await db.ref(`userAttendance/${userId}/${today}`).set({
            clockIn: now,
            clockOut: null,
            duration: 0,
            breaks: [],
            userName: window.currentUserData.displayName,
            userRole: window.currentUserData.role
        });

        // Update activity status
        await db.ref(`userActivity/${userId}`).set({
            currentStatus: 'clocked-in',
            lastActivity: now,
            todayClockIn: now,
            userName: window.currentUserData.displayName,
            userRole: window.currentUserData.role
        });

        // Log activity
        await logActivity('clock-in', `Clocked in at ${utils.formatDateTime(now)}`);

        utils.showLoading(false);
        alert('✅ Clocked in successfully!');

        // Refresh UI
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Clock in error:', error);
        alert('Error clocking in: ' + error.message);
    }
}

/**
 * Clock out current user
 */
async function clockOut() {
    try {
        if (!window.currentUser) {
            alert('Please log in first');
            return;
        }

        utils.showLoading(true);
        const db = firebase.database();
        const userId = window.currentUser.uid;
        const now = new Date().toISOString();
        const today = getLocalDateString(new Date());

        // Check if clocked in
        const activitySnapshot = await db.ref(`userActivity/${userId}`).once('value');
        const currentActivity = activitySnapshot.val();

        if (!currentActivity || currentActivity.currentStatus !== 'clocked-in') {
            utils.showLoading(false);
            alert('You are not clocked in!');
            return;
        }

        // Remittance check for technicians
        if (window.currentUserData && window.currentUserData.role === 'technician' && window.getTechDailyPayments) {
            const { payments, total } = window.getTechDailyPayments(userId, today);
            if (payments && payments.length > 0) {
                utils.showLoading(false);
                // Show modal to require remittance
                document.getElementById('remittanceRequiredModal').style.display = 'block';
                return;
            }
        }

        // Get today's attendance
        const attendanceSnapshot = await db.ref(`userAttendance/${userId}/${today}`).once('value');
        let todayAttendance = attendanceSnapshot.val();

        // Handle stale clock-in from previous day
        if (!todayAttendance || !todayAttendance.clockIn) {
            // Check if they have a stale clock-in (todayClockIn is from a previous day)
            const clockInDate = currentActivity.todayClockIn ? getLocalDateString(new Date(currentActivity.todayClockIn)) : null;
            
            if (clockInDate && clockInDate !== today) {
                // Auto-create today's clock-in record for seamless transition
                await db.ref(`userAttendance/${userId}/${today}`).set({
                    clockIn: now,
                    clockOut: null,
                    duration: 0,
                    breaks: [],
                    userName: window.currentUserData.displayName,
                    userRole: window.currentUserData.role,
                    autoCreated: true,
                    note: `Auto-created from stale clock-in on ${clockInDate}`
                });
                
                // Update activity to reflect current session
                await db.ref(`userActivity/${userId}`).update({
                    todayClockIn: now,
                    lastActivity: now
                });
                
                todayAttendance = {
                    clockIn: now,
                    userName: window.currentUserData.displayName,
                    userRole: window.currentUserData.role
                };
            } else {
                utils.showLoading(false);
                alert('No clock-in record found for today!');
                return;
            }
        }

        // Calculate duration (in seconds)
        const clockInTime = new Date(todayAttendance.clockIn);
        const clockOutTime = new Date(now);
        const duration = Math.floor((clockOutTime - clockInTime) / 1000);

        // Update attendance record
        await db.ref(`userAttendance/${userId}/${today}`).update({
            clockOut: now,
            duration: duration
        });

        // Update activity status
        await db.ref(`userActivity/${userId}`).update({
            currentStatus: 'clocked-out',
            lastActivity: now,
            todayClockIn: null
        });

        // Log activity
        await logActivity('clock-out', `Clocked out at ${utils.formatDateTime(now)} (${formatDuration(duration)})`);

        utils.showLoading(false);
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        alert(`✅ Clocked out successfully!\n\nWork duration: ${hours}h ${minutes}m`);

        // Refresh UI
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Clock out error:', error);
        alert('Error clocking out: ' + error.message);
    }
}

/**
 * Get current user's attendance status
 */
async function getUserAttendanceStatus(userId = null) {
    try {
        const db = firebase.database();
        const targetUserId = userId || window.currentUser.uid;

        const activitySnapshot = await db.ref(`userActivity/${targetUserId}`).once('value');
        return activitySnapshot.val() || { currentStatus: 'clocked-out' };

    } catch (error) {
        console.error('❌ Error getting attendance status:', error);
        return { currentStatus: 'clocked-out' };
    }
}

/**
 * Get attendance records for a user (date range)
 */
async function getUserAttendanceRecords(userId, startDate, endDate) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`userAttendance/${userId}`).once('value');
        const allRecords = snapshot.val() || {};

        // Filter by date range
        const filtered = {};
        Object.keys(allRecords).forEach(date => {
            if (date >= startDate && date <= endDate) {
                filtered[date] = allRecords[date];
            }
        });

        return filtered;

    } catch (error) {
        console.error('❌ Error getting attendance records:', error);
        return {};
    }
}

/**
 * Format duration (seconds) to human-readable string
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
}

/**
 * Get today's work hours for current user
 */
async function getTodayWorkHours() {
    try {
        const db = firebase.database();
        const userId = window.currentUser.uid;
        const today = getLocalDateString(new Date());

        const snapshot = await db.ref(`userAttendance/${userId}/${today}`).once('value');
        const attendance = snapshot.val();

        if (!attendance || !attendance.clockIn) {
            return { clockedIn: false, duration: 0 };
        }

        // If clocked in but not yet clocked out, calculate current duration
        if (attendance.clockIn && !attendance.clockOut) {
            const clockInTime = new Date(attendance.clockIn);
            const now = new Date();
            const duration = Math.floor((now - clockInTime) / 1000);
            return { clockedIn: true, duration: duration, clockIn: attendance.clockIn };
        }

        // If clocked out, return stored duration
        return {
            clockedIn: false,
            duration: attendance.duration || 0,
            clockIn: attendance.clockIn,
            clockOut: attendance.clockOut
        };

    } catch (error) {
        console.error('❌ Error getting today work hours:', error);
        return { clockedIn: false, duration: 0 };
    }
}

/**
 * Log attendance activity
 */
async function logActivity(action, details) {
    try {
        const db = firebase.database();
        await db.ref('activityLogs').push({
            userId: window.currentUser.uid,
            userName: window.currentUserData.displayName,
            userRole: window.currentUserData.role,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error logging activity:', error);
    }
}

/**
 * Get all users' current status (for admin dashboard)
 */
function getAllUsersStatus() {
    return window.allUserActivity || {};
}

/**
 * Get attendance summary for a user (month or date range)
 */
async function getAttendanceSummary(userId, year, month) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`userAttendance/${userId}`).once('value');
        const allRecords = snapshot.val() || {};

        // Filter by month
        const monthStr = String(month).padStart(2, '0');
        const prefix = `${year}-${monthStr}`;

        const filtered = {};
        let totalDuration = 0;
        let daysPresent = 0;

        Object.keys(allRecords).forEach(date => {
            if (date.startsWith(prefix)) {
                filtered[date] = allRecords[date];
                if (allRecords[date].duration) {
                    totalDuration += allRecords[date].duration;
                    daysPresent++;
                }
            }
        });

        return {
            records: filtered,
            totalDuration: totalDuration,
            daysPresent: daysPresent,
            averageDuration: daysPresent > 0 ? totalDuration / daysPresent : 0
        };

    } catch (error) {
        console.error('❌ Error getting attendance summary:', error);
        return { records: {}, totalDuration: 0, daysPresent: 0, averageDuration: 0 };
    }
}

// Helper function for local date string (if not in utils)
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Export functions to window
window.clockIn = clockIn;
window.clockOut = clockOut;

// Helper to go to remittance tab from modal
function goToRemittanceTab() {
    document.getElementById('remittanceRequiredModal').style.display = 'none';
    // Use buildTab function which properly switches tabs
    if (window.buildTab) {
        window.buildTab('remittance');
    } else if (window.buildDailyRemittanceTab) {
        // Fallback: find the remittance tab container
        const remittanceContainer = document.getElementById('remittanceTab');
        if (remittanceContainer) {
            window.buildDailyRemittanceTab(remittanceContainer);
            // Switch to the tab visually
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            const remittanceBtn = document.querySelector('[data-tab="remittance"]');
            if (remittanceBtn) remittanceBtn.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            if (remittanceContainer) remittanceContainer.classList.add('active');
        }
    } else {
        alert('Remittance tab not available. Please contact admin.');
    }
}

function closeRemittanceModal() {
    document.getElementById('remittanceRequiredModal').style.display = 'none';
}

window.goToRemittanceTab = goToRemittanceTab;
window.closeRemittanceModal = closeRemittanceModal;
window.getUserAttendanceStatus = getUserAttendanceStatus;

/**
 * Smart Clock-In Prompt System
 * Shows welcome message and asks if user wants to clock in on first login of the day
 */
async function showSmartClockInPrompt() {
    try {
        // Only show for technicians and cashiers
        const role = window.currentUserData?.role;
        if (role !== 'technician' && role !== 'cashier') {
            return;
        }

        const userId = window.currentUser.uid;
        const today = getLocalDateString(new Date());

        // First, check for missed clock-out from previous days
        const missedClockOut = await checkMissedClockOut(userId);
        if (missedClockOut) {
            showMissedClockOutModal(missedClockOut);
            return; // Handle missed clock-out first
        }

        // Check if already shown today
        const shownKey = `clockInPromptShown_${userId}_${today}`;
        if (localStorage.getItem(shownKey) === 'true') {
            return;
        }

        // Check if already clocked in
        const activitySnapshot = await firebase.database().ref(`userActivity/${userId}`).once('value');
        const currentActivity = activitySnapshot.val();
        
        if (currentActivity && currentActivity.currentStatus === 'clocked-in') {
            // Already clocked in, check if it's from today
            const clockInDate = currentActivity.todayClockIn ? getLocalDateString(new Date(currentActivity.todayClockIn)) : null;
            if (clockInDate === today) {
                return; // Already clocked in today, no prompt needed
            }
        }

        // Check if already have attendance record for today
        const attendanceSnapshot = await firebase.database().ref(`userAttendance/${userId}/${today}`).once('value');
        if (attendanceSnapshot.exists() && attendanceSnapshot.val().clockIn) {
            return; // Already has clock-in for today
        }

        // Show the prompt
        document.getElementById('welcomeUserName').textContent = `${window.currentUserData.displayName}!`;
        document.getElementById('welcomeClockInModal').style.display = 'block';

        // Mark as shown for today
        localStorage.setItem(shownKey, 'true');

    } catch (error) {
        console.error('❌ Error showing clock-in prompt:', error);
    }
}

/**
 * Check if user has any missed clock-outs from previous days
 */
async function checkMissedClockOut(userId) {
    try {
        const db = firebase.database();
        const today = getLocalDateString(new Date());
        
        // Get all attendance records for this user
        const snapshot = await db.ref(`userAttendance/${userId}`).once('value');
        const records = snapshot.val() || {};

        // Find the most recent day with clock-in but no clock-out
        for (const [date, record] of Object.entries(records).reverse()) {
            if (date >= today) continue; // Skip today and future dates
            
            if (record.clockIn && !record.clockOut) {
                return {
                    date: date,
                    clockIn: record.clockIn,
                    userName: record.userName
                };
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error checking missed clock-out:', error);
        return null;
    }
}

/**
 * Show modal for missed clock-out correction
 */
function showMissedClockOutModal(missedData) {
    const modal = document.getElementById('missedClockOutModal');
    if (!modal) return;

    const dateFormatted = new Date(missedData.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    document.getElementById('missedClockOutDate').textContent = dateFormatted;
    document.getElementById('missedClockOutTime').textContent = utils.formatDateTime(missedData.clockIn);
    
    // Store data for correction
    window.missedClockOutData = missedData;
    
    modal.style.display = 'block';
}

/**
 * Set missed clock-out time
 */
async function setMissedClockOut(clockOutTime) {
    try {
        const data = window.missedClockOutData;
        if (!data) {
            alert('Error: No missed clock-out data found');
            return;
        }

        utils.showLoading(true);

        // Default to 6:00 PM if not provided
        if (!clockOutTime) {
            const date = new Date(data.date + 'T18:00:00');
            clockOutTime = date.toISOString();
        }

        const clockInTime = new Date(data.clockIn);
        const clockOutTimeObj = new Date(clockOutTime);
        const duration = Math.floor((clockOutTimeObj - clockInTime) / 1000);

        if (duration < 0) {
            utils.showLoading(false);
            alert('Clock-out time cannot be before clock-in time');
            return;
        }

        // Update attendance record
        await firebase.database().ref(`userAttendance/${window.currentUser.uid}/${data.date}`).update({
            clockOut: clockOutTime,
            duration: duration,
            manualClockOut: true,
            manualClockOutReason: 'Corrected via missed clock-out prompt',
            correctedAt: new Date().toISOString(),
            correctedBy: window.currentUserData.displayName
        });

        // Update activity status if still showing clocked-in from that old session
        const activitySnapshot = await firebase.database().ref(`userActivity/${window.currentUser.uid}`).once('value');
        const activity = activitySnapshot.val();
        
        if (activity && activity.currentStatus === 'clocked-in') {
            const clockInDate = activity.todayClockIn ? getLocalDateString(new Date(activity.todayClockIn)) : null;
            if (clockInDate === data.date) {
                await firebase.database().ref(`userActivity/${window.currentUser.uid}`).update({
                    currentStatus: 'clocked-out',
                    lastActivity: new Date().toISOString(),
                    todayClockIn: null
                });
            }
        }

        utils.showLoading(false);
        document.getElementById('missedClockOutModal').style.display = 'none';
        
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        alert(`✅ Clock-out time set successfully!\n\nWork duration: ${hours}h ${minutes}m`);

        // Clear stored data and show welcome prompt
        window.missedClockOutData = null;
        setTimeout(() => showSmartClockInPrompt(), 500);

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error setting missed clock-out:', error);
        alert('Error setting clock-out time: ' + error.message);
    }
}

/**
 * Use default 6pm for missed clock-out
 */
function useDefault6pmClockOut() {
    const data = window.missedClockOutData;
    if (!data) return;
    
    // Create 6:00 PM timestamp for that date
    const date = new Date(data.date + 'T18:00:00+08:00'); // Manila timezone
    setMissedClockOut(date.toISOString());
}

/**
 * Skip missed clock-out correction (admin can fix later)
 */
function skipMissedClockOut() {
    document.getElementById('missedClockOutModal').style.display = 'none';
    window.missedClockOutData = null;
    
    // Show welcome prompt after skipping
    setTimeout(() => showSmartClockInPrompt(), 500);
}

async function acceptClockInPrompt() {
    document.getElementById('welcomeClockInModal').style.display = 'none';
    await clockIn();
}

function dismissClockInPrompt() {
    document.getElementById('welcomeClockInModal').style.display = 'none';
}

window.showSmartClockInPrompt = showSmartClockInPrompt;
window.acceptClockInPrompt = acceptClockInPrompt;
window.dismissClockInPrompt = dismissClockInPrompt;
window.setMissedClockOut = setMissedClockOut;
window.useDefault6pmClockOut = useDefault6pmClockOut;
window.skipMissedClockOut = skipMissedClockOut;

/**
 * Clock Reminder System
 * Reminds techs/cashiers to clock in/out at configured times
 */
let clockReminderInterval = null;
window.clockReminderSettings = {
    enabled: true,
    clockInTime: '08:00',
    clockOutTime: '17:50',
    reminderWindow: 15,
    workDays: [1, 2, 3, 4, 5, 6]
};

async function loadClockReminderSettings() {
    try {
        const snapshot = await db.ref('clockReminderSettings').once('value');
        if (snapshot.exists()) {
            const settings = snapshot.val();
            window.clockReminderSettings = {
                enabled: settings.enabled !== false,
                clockInTime: settings.clockInTime || '08:00',
                clockOutTime: settings.clockOutTime || '17:50',
                reminderWindow: settings.reminderWindow || 15,
                workDays: settings.workDays || [1, 2, 3, 4, 5, 6]
            };
            console.log('⏰ Clock reminder settings loaded:', window.clockReminderSettings);
        }
    } catch (error) {
        console.error('❌ Error loading clock reminder settings:', error);
    }
}

function checkClockReminder() {
    const role = window.currentUserData?.role;
    if (!role || !['technician', 'cashier'].includes(role)) return;
    if (!window.clockReminderSettings.enabled) return;

    // Get Manila time components separately
    const now = new Date();
    const hours = parseInt(now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        hour12: false,
        hour: '2-digit'
    }));
    const minutes = parseInt(now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        minute: '2-digit'
    }));
    const weekdayStr = now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        weekday: 'short'
    });

    const currentMinutes = hours * 60 + minutes;

    const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const dayOfWeek = dayMap[weekdayStr];

    if (!window.clockReminderSettings.workDays.includes(dayOfWeek)) return;

    const [clockInHour, clockInMin] = window.clockReminderSettings.clockInTime.split(':').map(Number);
    const clockInMinutes = clockInHour * 60 + clockInMin;
    const clockInWindowEnd = clockInMinutes + window.clockReminderSettings.reminderWindow;

    const [clockOutHour, clockOutMin] = window.clockReminderSettings.clockOutTime.split(':').map(Number);
    const clockOutMinutes = clockOutHour * 60 + clockOutMin;
    const clockOutWindowEnd = clockOutMinutes + window.clockReminderSettings.reminderWindow;

    const userId = window.currentUser?.uid;
    if (!userId) return;

    const userActivity = window.allUserActivity?.[userId];
    const isClockedIn = userActivity?.currentStatus === 'clocked-in';

    if (!isClockedIn && currentMinutes >= clockInMinutes && currentMinutes <= clockInWindowEnd) {
        const lastReminder = sessionStorage.getItem(`lastClockInReminder_${userId}`);
        const now = Date.now();

        if (!lastReminder || (now - parseInt(lastReminder)) > 15 * 60 * 1000) {
            const timeStr = window.clockReminderSettings.clockInTime;
            utils.showToast(
                `⏰ Time to clock in! It's ${timeStr} - start your shift.`,
                'warning',
                8000
            );
            sessionStorage.setItem(`lastClockInReminder_${userId}`, now.toString());
            console.log('⏰ Clock-in reminder shown');
        }
    }

    if (isClockedIn && currentMinutes >= clockOutMinutes && currentMinutes <= clockOutWindowEnd) {
        const lastReminder = sessionStorage.getItem(`lastClockOutReminder_${userId}`);
        const now = Date.now();

        if (!lastReminder || (now - parseInt(lastReminder)) > 15 * 60 * 1000) {
            const timeStr = window.clockReminderSettings.clockOutTime;
            utils.showToast(
                `⏰ Time to clock out! It's ${timeStr} - end your shift.`,
                'warning',
                8000
            );
            sessionStorage.setItem(`lastClockOutReminder_${userId}`, now.toString());
            console.log('⏰ Clock-out reminder shown');
        }
    }
}

/**
 * Auto Clock-Out System
 * Automatically clocks out users who forgot to clock out at end of day (6pm Manila time)
 */
async function checkAutoClockOut() {
    try {
        // Get Manila time
        const now = new Date();
        const hours = parseInt(now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false,
            hour: '2-digit'
        }));
        const minutes = parseInt(now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            minute: '2-digit'
        }));

        // Only run at 6:00 PM Manila time (within 10-minute window)
        if (hours !== 18 || minutes > 10) {
            return;
        }

        console.log('🕐 Checking for auto clock-out at 6pm...');

        const db = firebase.database();
        const today = getLocalDateString(new Date());
        
        // Get all user activities
        const activitySnapshot = await db.ref('userActivity').once('value');
        const allActivity = activitySnapshot.val() || {};

        let autoClockOutCount = 0;

        for (const [userId, activity] of Object.entries(allActivity)) {
            // Only auto-clock out technicians and cashiers who are still clocked in
            if (activity.currentStatus !== 'clocked-in') continue;
            
            const userRole = activity.userRole;
            if (!['technician', 'cashier'].includes(userRole)) continue;

            // Check if clock-in is from today
            const clockInDate = activity.todayClockIn ? getLocalDateString(new Date(activity.todayClockIn)) : null;
            if (clockInDate !== today) continue;

            // Check if they have an attendance record for today without clock-out
            const attendanceSnapshot = await db.ref(`userAttendance/${userId}/${today}`).once('value');
            const attendance = attendanceSnapshot.val();
            
            if (attendance && attendance.clockIn && !attendance.clockOut) {
                // Auto clock-out at 6pm
                const clockOutTime = new Date();
                clockOutTime.setHours(18, 0, 0, 0); // Set to exactly 6:00 PM
                const clockOutISO = clockOutTime.toISOString();

                const clockInTime = new Date(attendance.clockIn);
                const duration = Math.floor((clockOutTime - clockInTime) / 1000);

                // Update attendance record
                await db.ref(`userAttendance/${userId}/${today}`).update({
                    clockOut: clockOutISO,
                    duration: duration,
                    autoClockOut: true,
                    autoClockOutReason: 'Automatic clock-out at 6:00 PM'
                });

                // Update activity status
                await db.ref(`userActivity/${userId}`).update({
                    currentStatus: 'clocked-out',
                    lastActivity: clockOutISO,
                    todayClockIn: null
                });

                autoClockOutCount++;
                console.log(`✅ Auto clocked-out: ${activity.userName} at 6:00 PM (${formatDuration(duration)})`);
            }
        }

        if (autoClockOutCount > 0) {
            console.log(`🕐 Auto clock-out completed: ${autoClockOutCount} user(s)`);
        }

    } catch (error) {
        console.error('❌ Error in auto clock-out:', error);
    }
}

async function startClockReminderSystem() {
    console.log('⏰ Initializing clock reminder system...');
    await loadClockReminderSettings();

    if (clockReminderInterval) {
        clearInterval(clockReminderInterval);
    }

    // Check reminders every 5 minutes, auto clock-out every 5 minutes (will only trigger at 6pm)
    clockReminderInterval = setInterval(() => {
        checkClockReminder();
        checkAutoClockOut();
    }, 300000);
    
    setTimeout(checkClockReminder, 10000);
    setTimeout(checkAutoClockOut, 15000); // Check auto clock-out 15 seconds after startup

    console.log('✅ Clock reminder system started (includes auto clock-out at 6pm)');
}

async function saveClockReminderSettings(settings) {
    if (window.currentUserData?.role !== 'admin') {
        throw new Error('Only admins can modify clock reminder settings');
    }

    try {
        await db.ref('clockReminderSettings').set({
            enabled: settings.enabled !== false,
            clockInTime: settings.clockInTime || '08:00',
            clockOutTime: settings.clockOutTime || '17:50',
            reminderWindow: settings.reminderWindow || 15,
            workDays: settings.workDays || [1, 2, 3, 4, 5, 6],
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        window.clockReminderSettings = { ...settings };
        console.log('✅ Clock reminder settings saved');
        return true;
    } catch (error) {
        console.error('❌ Error saving clock reminder settings:', error);
        throw error;
    }
}

window.getUserAttendanceRecords = getUserAttendanceRecords;
window.getTodayWorkHours = getTodayWorkHours;
window.getAllUsersStatus = getAllUsersStatus;
window.getAttendanceSummary = getAttendanceSummary;
window.formatDuration = formatDuration;
window.initAttendanceListeners = initAttendanceListeners;
window.startClockReminderSystem = startClockReminderSystem;
window.saveClockReminderSettings = saveClockReminderSettings;
window.loadClockReminderSettings = loadClockReminderSettings;

console.log('✅ Attendance module loaded');
