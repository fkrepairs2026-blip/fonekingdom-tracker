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
        
        // Update UI if on relevant tab (with small delay for DOM updates)
        if (window.currentTabRefresh) {
            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 100);
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
    if (window.buildRemittanceTab) {
        window.buildRemittanceTab(document.getElementById('mainTabContent'));
    } else {
        alert('Remittance tab not available. Please contact admin.');
    }
}
window.goToRemittanceTab = goToRemittanceTab;
window.getUserAttendanceStatus = getUserAttendanceStatus;
window.getUserAttendanceRecords = getUserAttendanceRecords;
window.getTodayWorkHours = getTodayWorkHours;
window.getAllUsersStatus = getAllUsersStatus;
window.getAttendanceSummary = getAttendanceSummary;
window.formatDuration = formatDuration;
window.initAttendanceListeners = initAttendanceListeners;

console.log('✅ Attendance module loaded');
