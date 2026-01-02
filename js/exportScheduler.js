// Export Scheduler Module
// Handles automated scheduled CSV exports for financial data archival

let exportSchedulerInterval = null;
let isExportRunning = false;

/**
 * Initialize auto-export system
 * Checks Manila time hourly and triggers scheduled exports
 */
function initializeAutoExport() {
    console.log('🔄 Initializing auto-export scheduler...');

    // Load export configuration from localStorage
    const config = getExportScheduleConfig();

    // Clear existing interval if any
    if (exportSchedulerInterval) {
        clearInterval(exportSchedulerInterval);
    }

    // Check every hour (3600000 ms)
    exportSchedulerInterval = setInterval(() => {
        checkAndRunScheduledExports();
    }, 3600000);

    // Also run once after 10 seconds (after app fully loads)
    setTimeout(() => {
        checkAndRunScheduledExports();
    }, 10000);

    console.log('✅ Export scheduler started (checking hourly)');
}

/**
 * Check if any scheduled exports should run now
 */
function checkAndRunScheduledExports() {
    // Only run for admin users
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        return;
    }

    // Prevent concurrent exports
    if (isExportRunning) {
        console.log('⏸️ Export already running, skipping check');
        return;
    }

    const config = getExportScheduleConfig();
    const now = new Date();
    const manilaTimeStr = now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        hour12: false
    });
    const manilaDate = new Date(manilaTimeStr);
    const currentHour = manilaDate.getHours();
    const currentMinute = manilaDate.getMinutes();
    const currentDay = manilaDate.getDay(); // 0 = Sunday
    const currentDate = manilaDate.getDate();

    console.log(`📅 Export scheduler check: ${manilaDate.toLocaleString()}`);

    // Check Daily Export
    if (config.daily.enabled) {
        const dailyHour = parseInt(config.daily.time.split(':')[0]);
        if (currentHour === dailyHour && currentMinute < 10) {
            if (shouldRunExport('daily')) {
                runScheduledExport('daily');
            }
        }
    }

    // Check Weekly Export (default Sunday)
    if (config.weekly.enabled) {
        const weeklyDay = config.weekly.dayOfWeek || 0; // Sunday default
        const weeklyHour = parseInt(config.weekly.time.split(':')[0]);
        if (currentDay === weeklyDay && currentHour === weeklyHour && currentMinute < 10) {
            if (shouldRunExport('weekly')) {
                runScheduledExport('weekly');
            }
        }
    }

    // Check Monthly Export (default 1st day of month)
    if (config.monthly.enabled) {
        const monthlyDate = config.monthly.dayOfMonth || 1;
        const monthlyHour = parseInt(config.monthly.time.split(':')[0]);
        if (currentDate === monthlyDate && currentHour === monthlyHour && currentMinute < 10) {
            if (shouldRunExport('monthly')) {
                runScheduledExport('monthly');
            }
        }
    }
}

/**
 * Check if export should run (not already run today)
 */
function shouldRunExport(type) {
    const lastExportKey = `lastExport_${type}`;
    const lastExport = localStorage.getItem(lastExportKey);

    if (!lastExport) {
        return true;
    }

    const lastExportDate = new Date(lastExport);
    const now = new Date();
    const manilaTimeStr = now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        hour12: false
    });
    const manilaDate = new Date(manilaTimeStr);

    // Check if already exported today (Manila timezone)
    const lastDateStr = lastExportDate.toISOString().split('T')[0];
    const todayStr = manilaDate.toISOString().split('T')[0];

    return lastDateStr !== todayStr;
}

/**
 * Run scheduled export
 */
async function runScheduledExport(type) {
    console.log(`🚀 Running scheduled ${type} export...`);
    isExportRunning = true;

    try {
        const now = new Date();
        const manilaTimeStr = now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false
        });
        const manilaDate = new Date(manilaTimeStr);

        let success = false;
        let recordCount = 0;

        switch (type) {
            case 'daily':
                // Export previous day's data
                const yesterday = new Date(manilaDate);
                yesterday.setDate(yesterday.getDate() - 1);
                const result = await window.exportDailySummary(yesterday);
                success = result.success;
                recordCount = result.recordCount;
                break;

            case 'weekly':
                // Export last 7 days
                const weekAgo = new Date(manilaDate);
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekResult = await window.exportWeeklyReport(weekAgo);
                success = weekResult.success;
                recordCount = weekResult.recordCount;
                break;

            case 'monthly':
                // Export previous month
                const prevMonth = new Date(manilaDate);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                const monthResult = await window.exportMonthlyArchive(
                    prevMonth.getFullYear(),
                    prevMonth.getMonth()
                );
                success = monthResult.success;
                recordCount = monthResult.recordCount;
                break;
        }

        if (success) {
            // Mark as completed
            const lastExportKey = `lastExport_${type}`;
            localStorage.setItem(lastExportKey, manilaDate.toISOString());

            // Save export stats
            saveExportStats(type, recordCount);

            // Show success toast (only for admin)
            if (window.utils && window.utils.showToast) {
                window.utils.showToast(
                    `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} export completed - ${recordCount} records`,
                    'success',
                    5000
                );
            }

            console.log(`✅ ${type} export completed: ${recordCount} records`);
        }
    } catch (error) {
        console.error(`❌ Error running ${type} export:`, error);
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `❌ ${type.charAt(0).toUpperCase() + type.slice(1)} export failed: ${error.message}`,
                'error',
                5000
            );
        }
    } finally {
        isExportRunning = false;
    }
}

/**
 * Save export statistics to localStorage
 */
function saveExportStats(type, recordCount) {
    const statsKey = 'lastExportStats';
    let stats = {};

    try {
        const existing = localStorage.getItem(statsKey);
        if (existing) {
            stats = JSON.parse(existing);
        }
    } catch (e) {
        console.error('Error loading export stats:', e);
    }

    stats[type] = {
        timestamp: new Date().toISOString(),
        recordCount: recordCount
    };

    localStorage.setItem(statsKey, JSON.stringify(stats));
}

/**
 * Get export statistics for display
 */
function getExportStats() {
    const statsKey = 'lastExportStats';
    try {
        const stats = localStorage.getItem(statsKey);
        return stats ? JSON.parse(stats) : {};
    } catch (e) {
        console.error('Error loading export stats:', e);
        return {};
    }
}

/**
 * Get export schedule configuration from localStorage
 */
function getExportScheduleConfig() {
    const defaultConfig = {
        daily: {
            enabled: true,
            time: '00:00'
        },
        weekly: {
            enabled: false,
            time: '23:00',
            dayOfWeek: 0 // Sunday
        },
        monthly: {
            enabled: false,
            time: '00:00',
            dayOfMonth: 1
        }
    };

    try {
        const configStr = localStorage.getItem('exportScheduleConfig');
        if (configStr) {
            return JSON.parse(configStr);
        }
    } catch (e) {
        console.error('Error loading export config:', e);
    }

    return defaultConfig;
}

/**
 * Save export schedule configuration
 */
function saveExportScheduleConfig(config) {
    try {
        localStorage.setItem('exportScheduleConfig', JSON.stringify(config));
        console.log('✅ Export schedule config saved');
        return true;
    } catch (e) {
        console.error('Error saving export config:', e);
        return false;
    }
}

/**
 * Update schedule (call after config changes)
 */
function updateSchedule() {
    console.log('🔄 Updating export schedule...');
    // Restart the scheduler with new config
    initializeAutoExport();
}

/**
 * Manually trigger export (for "Export Now" buttons)
 */
async function triggerManualExport(type) {
    console.log(`🖱️ Manual ${type} export triggered`);

    if (isExportRunning) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                '⏸️ Export already in progress, please wait...',
                'warning',
                3000
            );
        }
        return;
    }

    // Temporarily bypass shouldRunExport check for manual triggers
    const originalShouldRun = shouldRunExport;
    window.shouldRunExportOverride = true;

    await runScheduledExport(type);

    window.shouldRunExportOverride = false;
}

// Export functions to window object
window.exportScheduler = {
    initializeAutoExport,
    updateSchedule,
    triggerManualExport,
    getExportScheduleConfig,
    saveExportScheduleConfig,
    getExportStats
};

console.log('📦 Export Scheduler module loaded');
