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
        const todayAttendance = attendanceSnapshot.val();

        if (!todayAttendance || !todayAttendance.clockIn) {
            utils.showLoading(false);
            alert('No clock-in record found for today!');
            return;
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

async function startClockReminderSystem() {
    console.log('⏰ Initializing clock reminder system...');
    await loadClockReminderSettings();
    
    if (clockReminderInterval) {
        clearInterval(clockReminderInterval);
    }
    
    clockReminderInterval = setInterval(checkClockReminder, 300000);
    setTimeout(checkClockReminder, 10000);
    
    console.log('✅ Clock reminder system started');
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
