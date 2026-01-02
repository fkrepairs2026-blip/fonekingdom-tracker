// Dashboard Helper Functions for Role-Specific Dashboards

/**
 * Build Technician Dashboard - Personal Job Focus
 */
function buildTechnicianDashboard(userName, stats) {
    const recentActivities = getRecentActivitiesForUser(window.currentUser.uid, 10);

    return `
        <div class="dashboard-container">
            <div class="page-header">
                <h2>👋 Welcome back, ${userName}!</h2>
                <p style="color:var(--text-secondary);">Your personal job dashboard</p>
            </div>
            
            <!-- Primary Metrics -->
            <div class="dashboard-stats-grid">
                ${utils.createStatCard(
        'My Active Jobs',
        stats.myActiveJobs,
        'Currently in progress',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'my',
        '🔧'
    )}
                ${utils.createStatCard(
        'Completed Today',
        stats.myCompletedToday,
        'Ready for pickup',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'mycompleted',
        '✅',
        'today'  // Pass date filter - shows only today's completions
    )}
                ${utils.createStatCard(
        'My Claimed Devices',
        stats.myClaimedCount || 0,
        'Finalized & picked up',
        'linear-gradient(135deg, #94d82d 0%, #5f9ea0 100%)',
        'myclaimed',
        '🎉'
    )}
                ${(() => {
        const commission = getCommissionForPeriod(stats);
        return utils.createStatCard(
            commission.label,
            '₱' + commission.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
            commission.breakdown + ' • Click to toggle',
            'linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%)',
            'toggleCommissionPeriod',
            '💰'
        );
    })()}
            </div>
            
            <!-- Alerts Section -->
            ${(stats.pendingRemittanceCount > 0 || stats.pendingApproval > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Pending Remittance',
        stats.pendingRemittanceCount,
        'high',
        'remittance',
        '📤'
    )}
                    ${utils.createAlertCard(
        'Pending Customer Approval',
        stats.pendingApproval,
        'medium',
        'inprogress',
        '⏳'
    )}
                </div>
            ` : ''}
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 My Recent Activity</h3>
                ${recentActivities.length === 0 ? `
                    <div class="empty-state">
                        <div style="font-size:48px;margin-bottom:10px;">🔧</div>
                        <p>No recent activity. Ready to start a new repair?</p>
                    </div>
                ` : `
                    <div class="activity-feed">
                        ${recentActivities.map(activity => renderActivityItem(activity)).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

/**
 * Build Cashier Dashboard - Payment & Verification Focus
 */
function buildCashierDashboard(userName, stats) {
    const recentActivities = getRecentActivities(10);

    return `
        <div class="dashboard-container">
            <div class="page-header">
                <h2>👋 Welcome back, ${userName}!</h2>
                <p style="color:var(--text-secondary);">Payment & verification command center</p>
            </div>
            
            <!-- Primary Metrics -->
            <div class="dashboard-stats-grid">
                ${utils.createStatCard(
        'Unpaid Devices',
        stats.unpaidCount,
        'Need payment collection',
        'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
        'unpaid',
        '💵'
    )}
                ${utils.createStatCard(
        'Claimed Today',
        stats.claimedToday,
        'Successfully finalized',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'claimed',
        '✅'
    )}
                ${utils.createStatCard(
        'Ready for Release',
        stats.readyForPickup,
        'Awaiting customer pickup',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'forrelease',
        '📦'
    )}
                ${utils.createStatCard(
        'Cash Count Status',
        stats.cashCountDone ? 'Complete' : 'Pending',
        stats.cashCountDone ? 'Done for today' : 'Need to count cash',
        stats.cashCountDone
            ? 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)'
            : 'linear-gradient(135deg, #ff922b 0%, #fd7e14 100%)',
        'cash',
        '💰'
    )}
            </div>
            
            <!-- Alerts Section -->
            ${(stats.pendingRemittances > 0 || stats.overduePickup > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Remittances to Verify',
        stats.pendingRemittances,
        'high',
        'verify-remittance',
        '📥'
    )}
                    ${utils.createAlertCard(
        'Overdue Pickups (>3 days)',
        stats.overduePickup,
        'medium',
        'forrelease',
        '⚠️'
    )}
                </div>
            ` : ''}
            
            <!-- Quick Stats -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📊 Quick Overview</h3>
                <div class="quick-stats">
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Total Active</span>
                        <span class="quick-stat-value">${stats.totalActive}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">In Progress</span>
                        <span class="quick-stat-value">${stats.inProgress}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Released</span>
                        <span class="quick-stat-value">${stats.released}</span>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 Recent Shop Activity</h3>
                <div class="activity-feed">
                    ${recentActivities.map(activity => renderActivityItem(activity)).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Build Manager Dashboard - Operations & Performance
 */
function buildManagerDashboard(userName, stats) {
    const recentActivities = getRecentActivities(10);

    return `
        <div class="dashboard-container">
            <div class="page-header">
                <h2>👋 Welcome back, ${userName}!</h2>
                <p style="color:var(--text-secondary);">Operations & performance overview</p>
            </div>
            
            <!-- Primary Metrics -->
            <div class="dashboard-stats-grid">
                ${utils.createStatCard(
        'Revenue Today',
        '₱' + stats.revenueToday.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
        'Payments collected',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'analytics',
        '💰'
    )}
                ${utils.createStatCard(
        'Ready for Release',
        stats.released,
        'Awaiting customer pickup',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'forrelease',
        '📦'
    )}
                ${utils.createStatCard(
        'Claimed Today',
        stats.claimedToday,
        'Successfully finalized',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'claimed',
        '✅'
    )}
                ${utils.createStatCard(
        'In Progress',
        stats.inProgress,
        'Active repairs',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'inprogress',
        '🔧'
    )}
                ${utils.createStatCard(
        'Avg Completion Time',
        stats.avgCompletionDays + ' days',
        'This week average',
        'linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%)',
        'analytics',
        '⏱️'
    )}
            </div>
            
            <!-- Alerts Section -->
            ${(stats.staleInProgress > 0 || stats.overduePickup > 0 || stats.pendingRemittances > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Stale Repairs (>5 days)',
        stats.staleInProgress,
        'high',
        'inprogress',
        '🔴'
    )}
                    ${utils.createAlertCard(
        'Overdue Pickups (>3 days)',
        stats.overduePickup,
        'medium',
        'forrelease',
        '⚠️'
    )}
                    ${utils.createAlertCard(
        'Pending Remittances',
        stats.pendingRemittances,
        'medium',
        'verify-remittance',
        '📥'
    )}
                </div>
            ` : ''}
            
            <!-- Quick Stats -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📊 Quick Overview</h3>
                <div class="quick-stats">
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Total Active</span>
                        <span class="quick-stat-value">${stats.totalActive}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Received</span>
                        <span class="quick-stat-value">${stats.received}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Ready for Pickup</span>
                        <span class="quick-stat-value">${stats.readyForPickup}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Released</span>
                        <span class="quick-stat-value">${stats.released}</span>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 Recent Shop Activity</h3>
                <div class="activity-feed">
                    ${recentActivities.map(activity => renderActivityItem(activity)).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Build Admin Dashboard - System Health & Oversight
 */
function buildAdminDashboard(userName, stats) {
    const recentActivities = getRecentActivities(10);

    return `
        <div class="dashboard-container">
            <div class="page-header">
                <h2>👋 Welcome back, ${userName}!</h2>
                <p style="color:var(--text-secondary);">System health & oversight dashboard</p>
            </div>
            
            <!-- Primary Metrics -->
            <div class="dashboard-stats-grid">
                ${utils.createStatCard(
        'Revenue Today (Shop 60%)',
        '₱' + stats.revenueToday.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
        `Cash: ₱${(stats.todayCashRevenue || 0).toFixed(2)} | GCash: ₱${(stats.todayGCashRevenue || 0).toFixed(2)}`,
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'analytics',
        '💰'
    )}
                ${utils.createStatCard(
        'Ready for Release',
        stats.released,
        'Awaiting customer pickup',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'forrelease',
        '📦'
    )}
                ${utils.createStatCard(
        'Claimed Today',
        stats.claimedToday,
        'Successfully finalized',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'claimed',
        '✅'
    )}
                ${utils.createStatCard(
        'All Devices',
        stats.totalActive,
        `${stats.inProgress} in progress`,
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'all',
        '📱'
    )}
                ${utils.createStatCard(
        'Avg Completion Time',
        stats.avgCompletionDays + ' days',
        'This week average',
        'linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%)',
        'analytics',
        '⏱️'
    )}
                ${buildDataHealthWidget()}
            </div>
            
            <!-- Admin Alerts Section -->
            ${(stats.pendingModRequests > 0 || stats.staleInProgress > 0 || stats.overduePickup > 0 || stats.pendingRemittances > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Modification Requests',
        stats.pendingModRequests || 0,
        'high',
        'mod-requests',
        '🔔'
    )}
                    ${utils.createAlertCard(
        'Stale Repairs (>5 days)',
        stats.staleInProgress,
        'high',
        'inprogress',
        '🔴'
    )}
                    ${utils.createAlertCard(
        'Overdue Pickups (>3 days)',
        stats.overduePickup,
        'medium',
        'forrelease',
        '⚠️'
    )}
                    ${utils.createAlertCard(
        'Pending Remittances',
        stats.pendingRemittances,
        'medium',
        'verify-remittance',
        '📥'
    )}
                </div>
            ` : ''}
            
            <!-- System Overview -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📊 System Overview</h3>
                <div class="quick-stats">
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Received</span>
                        <span class="quick-stat-value">${stats.received}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">In Progress</span>
                        <span class="quick-stat-value">${stats.inProgress}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Ready for Pickup</span>
                        <span class="quick-stat-value">${stats.readyForPickup}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Released</span>
                        <span class="quick-stat-value">${stats.released}</span>
                    </div>
                    <div class="quick-stat-item">
                        <span class="quick-stat-label">Pending Approval</span>
                        <span class="quick-stat-value">${stats.pendingApproval}</span>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 Recent Shop Activity</h3>
                <div class="activity-feed">
                    ${recentActivities.map(activity => renderActivityItem(activity)).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Get recent activities for all users
 */
function getRecentActivities(limit = 10) {
    const activities = [];
    const repairs = window.allRepairs || [];

    // Collect recent repair creations and completions
    repairs.forEach(repair => {
        if (repair.deleted) return;

        if (repair.createdAt) {
            activities.push({
                type: 'repair_created',
                timestamp: repair.createdAt,
                user: repair.createdByName || 'Unknown',
                data: {
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status
                }
            });
        }

        if (repair.completedAt) {
            activities.push({
                type: 'repair_completed',
                timestamp: repair.completedAt,
                user: repair.acceptedByName || 'Unknown',
                data: {
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`
                }
            });
        }
    });

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, limit);
}

/**
 * Get recent activities for specific user
 */
function getRecentActivitiesForUser(userId, limit = 10) {
    const activities = [];
    const repairs = window.allRepairs || [];

    repairs.forEach(repair => {
        if (repair.deleted) return;

        // Activities where user is creator
        if (repair.createdBy === userId && repair.createdAt) {
            activities.push({
                type: 'repair_created',
                timestamp: repair.createdAt,
                data: {
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status
                }
            });
        }

        // Activities where user accepted/completed
        if (repair.acceptedBy === userId) {
            if (repair.acceptedAt) {
                activities.push({
                    type: 'repair_accepted',
                    timestamp: repair.acceptedAt,
                    data: {
                        customer: repair.customerName,
                        device: `${repair.brand} ${repair.model}`
                    }
                });
            }

            if (repair.completedAt) {
                activities.push({
                    type: 'repair_completed',
                    timestamp: repair.completedAt,
                    data: {
                        customer: repair.customerName,
                        device: `${repair.brand} ${repair.model}`
                    }
                });
            }
        }
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, limit);
}

/**
 * Render activity item
 */
function renderActivityItem(activity) {
    const icons = {
        'repair_created': '➕',
        'repair_accepted': '✅',
        'repair_completed': '🎉',
        'payment_recorded': '💰'
    };

    const colors = {
        'repair_created': '#667eea',
        'repair_accepted': '#51cf66',
        'repair_completed': '#4facfe',
        'payment_recorded': '#ffd93d'
    };

    const icon = icons[activity.type] || '📌';
    const color = colors[activity.type] || '#999';

    let text = '';
    if (activity.type === 'repair_created') {
        text = `<strong>${activity.data.customer}</strong> - ${activity.data.device} ${activity.user ? `by ${activity.user}` : ''}`;
    } else if (activity.type === 'repair_accepted') {
        text = `Accepted <strong>${activity.data.customer}</strong> - ${activity.data.device}`;
    } else if (activity.type === 'repair_completed') {
        text = `Completed <strong>${activity.data.customer}</strong> - ${activity.data.device}`;
    }

    return `
        <div class="activity-item">
            <div class="activity-icon" style="background:${color}20;color:${color};">${icon}</div>
            <div class="activity-content">
                <div class="activity-text">${text}</div>
                <div class="activity-time">${utils.daysAgo(activity.timestamp)}</div>
            </div>
        </div>
    `;
}

// ===== DATA HEALTH MONITORING =====

/**
 * Build data health widget for admin dashboard
 * Shows summary of data issues and provides navigation to cleanup tools
 */
function buildDataHealthWidget() {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        return '';
    }

    // Calculate issues
    const issues = window.calculateDataHealthIssues ? window.calculateDataHealthIssues() : { total: 0 };

    // Determine status color
    let statusColor = '#10b981'; // Green
    let statusIcon = '🟢';
    let statusText = 'Healthy';

    if (issues.total > 0 && issues.total <= 5) {
        statusColor = '#f59e0b'; // Yellow
        statusIcon = '🟡';
        statusText = 'Minor Issues';
    } else if (issues.total > 5) {
        statusColor = '#ef4444'; // Red
        statusIcon = '🔴';
        statusText = 'Needs Attention';
    }

    return `
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); cursor: pointer;" 
             onclick="openAdminToolsDataHealth()">
            <div class="stat-icon">🔍</div>
            <div class="stat-info">
                <div class="stat-label">Data Health</div>
                <div class="stat-value" style="display: flex; align-items: center; gap: 10px;">
                    <span>${statusIcon}</span>
                    <span>${statusText}</span>
                </div>
                <div class="stat-description">
                    ${issues.total === 0 ? 'No issues detected' : `${issues.total} issue${issues.total !== 1 ? 's' : ''} found`}
                </div>
            </div>
        </div>
    `;
}

/**
 * Start data health monitor (runs every 5 minutes for admin)
 * Updates badge count on Admin Tools tab
 */
let dataHealthInterval = null;

function startDataHealthMonitor() {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        return;
    }

    console.log('🔍 Starting data health monitor...');

    // Clear existing interval
    if (dataHealthInterval) {
        clearInterval(dataHealthInterval);
    }

    // Update badge immediately
    updateDataHealthBadge();

    // Check every 5 minutes
    dataHealthInterval = setInterval(() => {
        updateDataHealthBadge();
    }, 300000); // 5 minutes

    console.log('✅ Data health monitor started (checking every 5 minutes)');
}

/**
 * Update data health badge on Admin Tools tab
 */
function updateDataHealthBadge() {
    if (!window.calculateDataHealthIssues) {
        return;
    }

    const issues = window.calculateDataHealthIssues();
    window.dataHealthIssueCount = issues.total;

    // Update badge if it exists
    const badge = document.getElementById('data-health-badge');
    if (badge) {
        if (issues.total > 0) {
            badge.textContent = issues.total;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Update widget if dashboard is visible
    const widget = document.querySelector('.dashboard-stats-grid');
    if (widget) {
        // Refresh dashboard if health status changed
        const currentStatus = window.lastHealthStatus || 0;
        if (currentStatus !== issues.total) {
            window.lastHealthStatus = issues.total;
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }
    }
}

/**
 * Navigate to Admin Tools Data Health section
 */
function openAdminToolsDataHealth() {
    // Switch to Admin Tools tab
    if (window.switchTab) {
        window.switchTab('admin-tools');
    }

    // Scroll to Data Health section after tab loads
    setTimeout(() => {
        const dataHealthSection = document.querySelector('[data-section="dataHealth"]');
        if (dataHealthSection) {
            dataHealthSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

/**
 * Toggle commission period (daily -> weekly -> monthly -> daily)
 */
function toggleCommissionPeriod() {
    // Toggle between daily and monthly only
    if (!window.commissionPeriod || window.commissionPeriod === 'daily') {
        window.commissionPeriod = 'monthly';
    } else {
        window.commissionPeriod = 'daily';
    }

    // Refresh dashboard explicitly (not relying on currentTabRefresh which may be overwritten)
    const dashboardContainer = document.getElementById('dashboardTab');
    if (dashboardContainer) {
        utils.invalidateDashboardCache();
        window.buildDashboardTab(dashboardContainer);
    }
}

/**
 * Get commission data for current period
 * @param {object} stats - Dashboard stats object
 * @returns {object} {label, amount, breakdown}
 */
function getCommissionForPeriod(stats) {
    const period = window.commissionPeriod || 'daily';

    if (period === 'daily') {
        return {
            label: 'Commission Today',
            amount: stats.myCommissionToday || 0,
            breakdown: `Cash: ₱${(stats.myCashCommissionToday || 0).toFixed(2)} | GCash: ₱${(stats.myGCashCommissionToday || 0).toFixed(2)}`
        };
    } else if (period === 'weekly') {
        return {
            label: 'Commission This Week',
            amount: stats.myCommissionThisWeek || 0,
            breakdown: `Cash: ₱${(stats.myCashCommissionWeek || 0).toFixed(2)} | GCash: ₱${(stats.myGCashCommissionWeek || 0).toFixed(2)}`
        };
    } else { // monthly
        return {
            label: 'Commission This Month',
            amount: stats.myCommissionThisMonth || 0,
            breakdown: `Cash: ₱${(stats.myCashCommission || 0).toFixed(2)} | GCash: ₱${(stats.myGCashCommission || 0).toFixed(2)}`
        };
    }
}

// Export functions to window
window.buildTechnicianDashboard = buildTechnicianDashboard;
window.buildCashierDashboard = buildCashierDashboard;
window.buildManagerDashboard = buildManagerDashboard;
window.buildAdminDashboard = buildAdminDashboard;
window.getRecentActivities = getRecentActivities;
window.getRecentActivitiesForUser = getRecentActivitiesForUser;
window.renderActivityItem = renderActivityItem;

// Export data health functions
window.buildDataHealthWidget = buildDataHealthWidget;
window.startDataHealthMonitor = startDataHealthMonitor;
window.updateDataHealthBadge = updateDataHealthBadge;
window.openAdminToolsDataHealth = openAdminToolsDataHealth;

// Export commission toggle functions
window.toggleCommissionPeriod = toggleCommissionPeriod;
window.getCommissionForPeriod = getCommissionForPeriod;

console.log('✅ dashboard-helpers.js loaded');
