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
            
            <!-- Simplified Alerts -->
            ${(stats.unsubmittedRemittanceCount > 0 || stats.submittedRemittanceCount > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${stats.unsubmittedRemittanceCount > 0 ? utils.createAlertCard(
            'Pending Remittance',
            stats.unsubmittedRemittanceCount,
            'high',
            'remittance',
            '📤 Submit your daily cash remittance'
        ) : ''}
                    ${stats.submittedRemittanceCount > 0 ? utils.createAlertCard(
            'Awaiting Approval',
            stats.submittedRemittanceCount,
            'info',
            'remittance',
            '⏳ Your remittance is waiting for admin/cashier approval'
        ) : ''}
                </div>
            ` : ''}
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 My Recent Activity</h3>
                ${renderGroupedActivities(recentActivities)}
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
            
            <!-- Simplified Alerts -->
            ${(stats.pendingRemittances > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Remittances to Verify',
        stats.pendingRemittances,
        'high',
        'verify-remittance',
        '📥 Cash remittances awaiting your verification'
    )}
                </div>
            ` : ''}
            
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
            
            <!-- Simplified Alerts - Only Critical Items -->
            ${(stats.staleInProgress > 0 || stats.pendingRemittances > 0) ? `
                <div class="dashboard-alerts-grid">
                    ${stats.staleInProgress > 0 ? utils.createAlertCard(
        'Stale Repairs (>5 days)',
        stats.staleInProgress,
        'high',
        'inprogress',
        '🔴 Repairs need attention'
    ) : ''}
                    ${stats.pendingRemittances > 0 ? utils.createAlertCard(
        'Pending Remittances',
        stats.pendingRemittances,
        'medium',
        'verify-remittance',
        '📥 Need verification'
    ) : ''}
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

    // Get staff overview stats
    const users = Object.values(window.allUsers || {}).filter(u => u.status === 'active' && u.role !== 'admin');
    const allUserActivity = window.allUserActivity || {};
    const clockedInCount = users.filter(u => allUserActivity[u.uid]?.currentStatus === 'clocked-in').length;

    // Get personal finance balance
    const personalExpenses = window.personalExpenses || [];
    const totalPersonalExpenses = personalExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const personalBudgets = window.personalBudgets || [];
    const totalBudget = personalBudgets.reduce((sum, budget) => sum + parseFloat(budget.monthlyAmount || 0), 0);
    const personalBalance = totalBudget - totalPersonalExpenses;

    return `
        <div class="dashboard-container">
            <div class="page-header">
                <h2>👋 Welcome back, ${userName}!</h2>
                <p style="color:var(--text-secondary);">Administration & oversight dashboard</p>
            </div>
                        <!-- Admin Utilities -->
            <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 10px 0;color:#856404;">🔧 Admin Utilities</h4>
                <button onclick="findAndFixDuplicateExpenses()" class="btn-secondary" style="margin-right:10px;">
                    🔍 Find & Fix Duplicate Expenses
                </button>
                <button onclick="viewAllTechExpenses()" class="btn-secondary">
                    📋 View All Tech Expenses
                </button>
            </div>
                        <!-- Admin-Focused Metrics -->
            <div class="dashboard-stats-grid">
                ${utils.createStatCard(
        'Staff Overview',
        `${clockedInCount}/${users.length}`,
        `${clockedInCount} staff currently clocked in`,
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'staff-overview',
        '👥'
    )}
                ${utils.createStatCard(
        'Profit Dashboard',
        '₱' + stats.revenueToday.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
        'Shop revenue today (60% share)',
        'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
        'profit-dashboard',
        '💰'
    )}
                ${utils.createStatCard(
        'Usage Analytics',
        Object.keys(allUserActivity).length + ' active',
        'System activity tracking',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'usage-analytics',
        '📊'
    )}
                ${utils.createStatCard(
        'My Finances',
        '₱' + personalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 }),
        `Budget: ₱${totalBudget.toFixed(2)} | Spent: ₱${totalPersonalExpenses.toFixed(2)}`,
        'linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%)',
        'personal-finance',
        '💳'
    )}
            </div>
            
            <!-- Simplified Admin Alerts -->
            ${stats.pendingModRequests > 0 ? `
                <div class="dashboard-alerts-grid">
                    ${utils.createAlertCard(
        'Modification Requests',
        stats.pendingModRequests || 0,
        'high',
        'mod-requests',
        '🔔 Awaiting admin approval'
    )}
                </div>
            ` : ''}
            
            <!-- Recent Activity -->
            <div style="margin-top:30px;">
                <h3 style="margin-bottom:15px;color:var(--text-primary);">📋 Recent Shop Activity</h3>
                ${renderGroupedActivities(recentActivities)}
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
/**
 * Get recent activities for a specific user
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
 * Render grouped recent activities by type, then by date
 */
function renderGroupedActivities(activities) {
    if (activities.length === 0) {
        return `
            <div class="empty-state">
                <div style="font-size:48px;margin-bottom:10px;">🔧</div>
                <p>No recent activity. Ready to start a new repair?</p>
            </div>
        `;
    }

    // Group activities by type first
    const groupedByType = {
        'repair_created': { label: 'Received', icon: '➕', color: '#667eea', activities: [] },
        'repair_accepted': { label: 'Accepted', icon: '✅', color: '#51cf66', activities: [] },
        'repair_completed': { label: 'Completed', icon: '🎉', color: '#4facfe', activities: [] },
        'payment_recorded': { label: 'Payments', icon: '💰', color: '#ffd93d', activities: [] }
    };

    activities.forEach(activity => {
        if (groupedByType[activity.type]) {
            groupedByType[activity.type].activities.push(activity);
        }
    });

    // Render each activity type group
    return Object.keys(groupedByType).map((typeKey, typeIndex) => {
        const typeGroup = groupedByType[typeKey];
        if (typeGroup.activities.length === 0) return '';

        const typeId = `activity-type-${typeKey}`;

        // Group activities within this type by date
        const groupedByDate = {};
        typeGroup.activities.forEach(activity => {
            const dateKey = window.utils.formatDate(activity.timestamp);
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(activity);
        });

        const todayDateString = window.utils.formatDate(new Date());
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
            const dateA = new Date(groupedByDate[a][0].timestamp);
            const dateB = new Date(groupedByDate[b][0].timestamp);
            return dateB - dateA;
        });

        // Render type group
        return `
            <div class="activity-type-group" style="margin-bottom:25px;">
                <!-- Type Header -->
                <div class="activity-type-header" 
                     onclick="toggleActivityTypeGroup('${typeId}')"
                     style="background:linear-gradient(135deg, ${typeGroup.color} 0%, ${typeGroup.color}dd 100%);color:white;border-radius:12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;box-shadow:0 4px 12px ${typeGroup.color}40;" class="p-15 mb-15">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">${typeGroup.icon}</span>
                        <strong style="font-size:16px;">${typeGroup.label}</strong>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:rgba(255,255,255,0.25);padding:6px 14px;border-radius:15px;font-size:14px;font-weight:600;">
                            ${typeGroup.activities.length} ${typeGroup.activities.length === 1 ? 'item' : 'items'}
                        </span>
                        <span class="activity-type-toggle-icon" style="font-size:18px;transition:transform 0.3s;">
                            ${typeIndex === 0 ? '▼' : '▶'}
                        </span>
                    </div>
                </div>

                <!-- Date Groups within Type -->
                <div class="activity-type-items" id="${typeId}" style="padding-left:15px;display:${typeIndex === 0 ? 'block' : 'none'};">
                    ${sortedDates.map((dateKey, dateIndex) => {
            const activitiesInDate = groupedByDate[dateKey];
            const isToday = dateKey === todayDateString;
            const groupId = `${typeId}-date-${dateKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const daysAgoText = window.utils.daysAgo(activitiesInDate[0].timestamp);

            return `
                            <div class="activity-date-group" style="margin-bottom:15px;">
                                <div class="activity-date-header" 
                                     onclick="toggleActivityGroup('${groupId}')"
                                     class="bg-gray-100 p-10 rounded-md mb-10" style="border-left:4px solid ${typeGroup.color};display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;">
                                    <div>
                                        <strong style="font-size:14px;color:#333;">${dateKey}${isToday ? ' <span style="background:' + typeGroup.color + '20;color:' + typeGroup.color + ';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">Today</span>' : ''}</strong>
                                        <span style="font-size:12px;color:#666;margin-left:10px;">${daysAgoText}</span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span style="background:${typeGroup.color}20;color:${typeGroup.color};padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;">
                                            ${activitiesInDate.length}
                                        </span>
                                        <span class="activity-toggle-icon" style="font-size:16px;transition:transform 0.3s;color:#666;">
                                            ${isToday && dateIndex === 0 ? '▼' : '▶'}
                                        </span>
                                    </div>
                                </div>
                                <div class="activity-date-items" id="${groupId}" style="display:${isToday && dateIndex === 0 ? 'block' : 'none'};">
                                    <div class="activity-feed" style="padding-left:10px;">
                                        ${activitiesInDate.map(activity => renderActivityItem(activity)).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }).filter(html => html).join('');
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
        <div class="stat-card gradient-stat-purple" style="cursor: pointer;" 
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
 * Toggle activity type group visibility
 */
function toggleActivityTypeGroup(groupId) {
    const itemsDiv = document.getElementById(groupId);
    const header = document.querySelector(`[onclick="toggleActivityTypeGroup('${groupId}')"]`);

    if (itemsDiv && header) {
        const isHidden = itemsDiv.style.display === 'none';
        itemsDiv.style.display = isHidden ? 'block' : 'none';

        // Update arrow icon
        const icon = header.querySelector('.activity-type-toggle-icon');
        if (icon) {
            icon.textContent = isHidden ? '▼' : '▶';
        }
    }
}

/**
 * Toggle activity group visibility (date groups within type)
 */
function toggleActivityGroup(groupId) {
    const itemsDiv = document.getElementById(groupId);
    const header = document.querySelector(`[onclick="toggleActivityGroup('${groupId}')"]`);

    if (itemsDiv && header) {
        const isHidden = itemsDiv.style.display === 'none';
        itemsDiv.style.display = isHidden ? 'block' : 'none';

        // Update arrow icon
        const icon = header.querySelector('.activity-toggle-icon');
        if (icon) {
            icon.textContent = isHidden ? '▼' : '▶';
        }
    }
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
window.renderGroupedActivities = renderGroupedActivities;
window.toggleActivityTypeGroup = toggleActivityTypeGroup;
window.toggleActivityGroup = toggleActivityGroup;

// Export data health functions
window.buildDataHealthWidget = buildDataHealthWidget;
window.startDataHealthMonitor = startDataHealthMonitor;
window.updateDataHealthBadge = updateDataHealthBadge;
window.openAdminToolsDataHealth = openAdminToolsDataHealth;

// Export commission toggle functions
window.toggleCommissionPeriod = toggleCommissionPeriod;
window.getCommissionForPeriod = getCommissionForPeriod;

/**
 * Show unclassified suppliers banner
 */
function showUnclassifiedSuppliersBanner(count) {
    // Only show on admin dashboard
    const dashboardContainer = document.getElementById('main-content');
    if (!dashboardContainer) return;

    // Check if banner already exists
    let banner = document.getElementById('unclassifiedSuppliersBanner');
    if (banner) {
        banner.remove();
    }

    // Create new banner
    banner = document.createElement('div');
    banner.id = 'unclassifiedSuppliersBanner';
    banner.style.cssText = 'background:#fff3cd;border-left:4px solid #ff9800;padding:15px;border-radius:4px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;';
    banner.innerHTML = `
        <div>
            <strong style="color:#856404;">⚠️ ${count} Supplier${count > 1 ? 's' : ''} Need${count === 1 ? 's' : ''} Payment Type Classification</strong>
            <p style="margin:5px 0 0;color:#856404;font-size:0.9em;">Payment type determines how parts costs are tracked and who collects the payment.</p>
        </div>
        <div style="display:flex;gap:10px;">
            <button onclick="openAddSupplierModal()" class="btn-primary" style="white-space:nowrap;">Classify Now</button>
            <button onclick="dismissUnclassifiedWarning()" class="btn-secondary" style="white-space:nowrap;">Dismiss</button>
        </div>
    `;

    // Insert at top of dashboard
    const firstChild = dashboardContainer.firstChild;
    dashboardContainer.insertBefore(banner, firstChild);
}

// ===== ADMIN UTILITIES FOR DUPLICATE EXPENSE CLEANUP =====

/**
 * Find and display duplicate expenses
 */
async function findAndFixDuplicateExpenses() {
    if (!window.techExpenses || window.techExpenses.length === 0) {
        alert('No tech expenses loaded. Please wait for data to load.');
        return;
    }

    // Find duplicates - auto-generated expenses with same repairId + category
    const duplicateGroups = new Map();

    window.techExpenses.forEach(exp => {
        if (exp.autoGenerated && exp.repairId && !exp.remittanceId) {
            const key = `${exp.repairId}_${exp.category}`;
            if (!duplicateGroups.has(key)) {
                duplicateGroups.set(key, []);
            }
            duplicateGroups.get(key).push(exp);
        }
    });

    // Filter to only groups with duplicates
    const actualDuplicates = Array.from(duplicateGroups.entries())
        .filter(([key, exps]) => exps.length > 1);

    if (actualDuplicates.length === 0) {
        alert('✅ No duplicate expenses found!\\n\\nAll auto-generated expenses are unique.');
        return;
    }

    // Build report
    let report = `🔍 Found ${actualDuplicates.length} duplicate expense group(s):\\n\\n`;
    let totalToDelete = 0;
    const expensesToDelete = [];

    actualDuplicates.forEach(([key, exps]) => {
        const [repairId] = key.split('_');
        const repair = window.allRepairs.find(r => r.id === repairId);
        const customerName = repair ? repair.customerName : 'Unknown';

        // Sort by date, keep most recent
        exps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const keep = exps[0];
        const remove = exps.slice(1);

        report += `📱 ${customerName} (${repairId}):\\n`;
        report += `  Keep: ₱${keep.amount.toFixed(2)} (${new Date(keep.createdAt).toLocaleString()})\\n`;
        remove.forEach(exp => {
            report += `  ❌ Delete: ₱${exp.amount.toFixed(2)} (${new Date(exp.createdAt).toLocaleString()})\\n`;
            expensesToDelete.push(exp);
            totalToDelete += exp.amount;
        });
        report += '\\n';
    });

    report += `\\nTotal duplicate amount to remove: ₱${totalToDelete.toFixed(2)}`;
    report += `\\nExpenses to delete: ${expensesToDelete.length}`;

    const proceed = confirm(
        report + '\\n\\n⚠️ Do you want to delete the duplicate expenses?\\n\\nThis will keep only the most recent expense for each repair.'
    );

    if (!proceed) return;

    // Delete duplicates
    try {
        utils.showLoading(true);
        const db = firebase.database();

        for (const exp of expensesToDelete) {
            await db.ref(`techExpenses/${exp.id}`).remove();
        }

        // Reload expenses
        if (window.loadTechExpenses) {
            await window.loadTechExpenses();
        }

        utils.showLoading(false);
        alert(`✅ Successfully deleted ${expensesToDelete.length} duplicate expense(s)!\\n\\nRemoved: ₱${totalToDelete.toFixed(2)}`);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error deleting duplicates:', error);
        alert('❌ Error deleting duplicates: ' + error.message);
    }
}

/**
 * View all tech expenses for review
 */
function viewAllTechExpenses() {
    if (!window.techExpenses || window.techExpenses.length === 0) {
        alert('No tech expenses loaded.');
        return;
    }

    // Group by technician
    const byTech = {};
    window.techExpenses.forEach(exp => {
        if (!exp.remittanceId) { // Only unremitted
            if (!byTech[exp.techName]) {
                byTech[exp.techName] = [];
            }
            byTech[exp.techName].push(exp);
        }
    });

    let html = '<div style="max-height:600px;overflow-y:auto;">';

    Object.keys(byTech).sort().forEach(techName => {
        const expenses = byTech[techName];
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);

        html += `
            <div style="margin-bottom:20px;border:1px solid #ddd;border-radius:8px;padding:15px;">
                <h4 style="margin:0 0 10px 0;">${techName} - ₱${total.toFixed(2)} (${expenses.length} expenses)</h4>
                ${expenses.map(e => `
                    <div style="padding:8px;background:#f9f9f9;margin-bottom:5px;border-radius:4px;font-size:13px;">
                        <strong>${e.category}</strong> - ₱${e.amount.toFixed(2)}
                        ${e.autoGenerated ? ' 🤖' : ''}
                        ${e.repairId ? ` (Repair: ${e.repairId})` : ''}
                        <br><small style="color:#666;">${new Date(e.date).toLocaleString()} - ${e.description || 'No description'}</small>
                    </div>
                `).join('')}
            </div>
        `;
    });

    html += '</div>';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:800px;">
            <h3>📋 All Unremitted Tech Expenses</h3>
            ${html}
            <button onclick="this.closest('.modal').remove()" class="btn-primary" style="margin-top:15px;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

window.findAndFixDuplicateExpenses = findAndFixDuplicateExpenses;
window.viewAllTechExpenses = viewAllTechExpenses;

window.showUnclassifiedSuppliersBanner = showUnclassifiedSuppliersBanner;

console.log('✅ dashboard-helpers.js loaded');
