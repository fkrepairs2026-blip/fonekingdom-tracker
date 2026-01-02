// ===== UTILITY FUNCTIONS =====

const utils = {
    /**
     * Compress image to specified max width
     */
    compressImage: async function (file, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Format date and time
     */
    formatDateTime: function (isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Format date only (no time)
     */
    formatDate: function (isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Get default avatar with initials
     */
    getDefaultAvatar: function (name) {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'
        ];

        const colorIndex = name.charCodeAt(0) % colors.length;
        const bgColor = colors[colorIndex];

        const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${bgColor}"/>
                <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
                    ${initials}
                </text>
            </svg>
        `;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    /**
     * Show/hide loading indicator
     */
    showLoading: function (show) {
        console.log(`🔄 showLoading called: ${show ? 'SHOW' : 'HIDE'}`);

        const loading = document.getElementById('loading');
        if (!loading) {
            console.warn('⚠️ Loading element not found');
            return;
        }

        if (show) {
            loading.style.display = 'flex';
            console.log('✅ Loading overlay shown');
        } else {
            // Triple-safe hiding
            loading.style.display = 'none';
            loading.style.visibility = 'hidden';
            loading.style.opacity = '0';
            console.log('✅ Loading overlay FORCE HIDDEN (triple safe)');

            // Force browser to recalculate
            void loading.offsetHeight;
        }
    },  // ✅ COMMA ADDED HERE!

    /**
     * Calculate days ago - Fixed to compare calendar days, not timestamps
     */
    daysAgo: function (isoString) {
        if (!isoString) return 'N/A';

        // Parse the input date
        const date = new Date(isoString);
        const now = new Date();

        // Set both dates to midnight (start of day) for accurate day comparison
        const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Calculate difference in days
        const diff = nowAtMidnight - dateAtMidnight;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    },

    /**
     * Time ago (alias for daysAgo)
     */
    timeAgo: function (isoString) {
        return this.daysAgo(isoString);
    },

    /**
     * Format currency
     */
    formatCurrency: function (amount) {
        return '₱' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },

    /**
     * Validate email
     */
    isValidEmail: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone number (Philippine format)
     */
    isValidPhone: function (phone) {
        const re = /^(09|\+639)\d{9}$/;
        return re.test(phone.replace(/[\s-]/g, ''));
    },

    /**
     * Generate random ID
     */
    generateId: function (length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Deep clone object
     */
    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce function
     */
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Dashboard cache - stores calculated metrics with TTL
     */
    dashboardCache: {
        stats: null,
        activities: null,
        lastUpdated: null,
        ttl: 5000  // 5 seconds
    },

    /**
     * Calculate commission for a specific time period
     * @param {Array} repairs - All repairs
     * @param {string} techId - Technician user ID
     * @param {Date} startDate - Period start
     * @param {Date} endDate - Period end
     * @returns {object} Commission breakdown {total, cash, gcash}
     */
    calculateCommissionForPeriod: function (repairs, techId, startDate, endDate) {
        let cashCommission = 0;
        let gcashCommission = 0;

        repairs.forEach(r => {
            if (r.acceptedBy !== techId || !r.payments) return;

            r.payments.forEach(payment => {
                if (!payment.verified) return;

                const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                if (paymentDate < startDate || paymentDate > endDate) return;

                // Calculate commission based on payment - parts cost
                const repairPartsCost = r.partsCost || 0;
                const paymentShare = payment.amount;
                const partsCostShare = r.payments.length > 0 ? repairPartsCost / r.payments.length : 0;
                const netAmount = Math.max(0, paymentShare - partsCostShare);
                const commission = netAmount * 0.40; // Tech gets 40%

                if (payment.method === 'GCash') {
                    gcashCommission += commission;
                } else {
                    cashCommission += commission;
                }
            });
        });

        return {
            total: cashCommission + gcashCommission,
            cash: cashCommission,
            gcash: gcashCommission
        };
    },

    /**
     * Get cached dashboard stats or recalculate
     * @param {string} role - User role (admin, manager, cashier, technician)
     * @returns {object} Calculated stats for the role
     */
    getCachedDashboardStats: function (role) {
        const now = Date.now();

        // Return cached stats if still valid
        if (this.dashboardCache.stats &&
            this.dashboardCache.lastUpdated &&
            (now - this.dashboardCache.lastUpdated) < this.dashboardCache.ttl) {
            console.log('📊 Using cached dashboard stats');
            return this.dashboardCache.stats;
        }

        // Recalculate stats
        console.log('🔄 Calculating fresh dashboard stats');
        const stats = this.calculateDashboardStats(role);

        // Cache the results
        this.dashboardCache.stats = stats;
        this.dashboardCache.lastUpdated = now;

        return stats;
    },

    /**
     * Invalidate dashboard cache (called by auto-refresh)
     */
    invalidateDashboardCache: function () {
        this.dashboardCache.stats = null;
        this.dashboardCache.activities = null;
        this.dashboardCache.lastUpdated = null;
        console.log('🗑️ Dashboard cache invalidated');
    },

    /**
     * Calculate dashboard statistics based on role
     * @param {string} role - User role
     * @returns {object} Calculated statistics
     */
    calculateDashboardStats: function (role) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const repairs = window.allRepairs || [];
        const activeRepairs = repairs.filter(r => !r.deleted);
        const currentUserId = window.currentUser ? window.currentUser.uid : null;

        const stats = {
            // Common stats for all roles
            totalActive: activeRepairs.length,
            received: activeRepairs.filter(r => r.status === 'Received').length,
            inProgress: activeRepairs.filter(r => r.status === 'In Progress' || r.status === 'Waiting for Parts').length,
            readyForPickup: activeRepairs.filter(r => r.status === 'Ready for Pickup').length,
            released: activeRepairs.filter(r => r.status === 'Ready for Pickup').length,
            claimedToday: activeRepairs.filter(r => {
                if (!r.claimedAt) return false;
                const claimedDate = new Date(r.claimedAt);
                return claimedDate >= today;
            }).length,

            // Priority alerts
            staleInProgress: activeRepairs.filter(r => {
                const isInProgress = r.status === 'In Progress' || r.status === 'Waiting for Parts';
                if (!isInProgress || !r.acceptedAt) return false;
                const days = Math.floor((now - new Date(r.acceptedAt)) / (1000 * 60 * 60 * 24));
                return days > 5;
            }).length,

            overduePickup: activeRepairs.filter(r => {
                if (r.status !== 'Ready for Pickup' || !r.completedAt) return false;
                const days = Math.floor((now - new Date(r.completedAt)) / (1000 * 60 * 60 * 24));
                return days > 3;
            }).length,

            pendingApproval: activeRepairs.filter(r =>
                r.status === 'Pending Customer Approval' && r.diagnosisCreated && !r.customerApproved
            ).length
        };

        // Role-specific calculations
        if (role === 'technician') {
            // Personal job stats
            stats.myActiveJobs = activeRepairs.filter(r =>
                r.acceptedBy === currentUserId &&
                (r.status === 'In Progress' || r.status === 'Waiting for Parts')
            ).length;

            // Completed today = Ready for Pickup + Released (not yet Claimed)
            stats.myCompletedToday = activeRepairs.filter(r => {
                if (r.acceptedBy !== currentUserId) return false;
                if (r.status !== 'Ready for Pickup' && r.status !== 'Released') return false;
                if (!r.completedAt) return false;
                const completedDate = new Date(r.completedAt);
                return completedDate >= today;
            }).length;

            stats.myReadyForPickup = activeRepairs.filter(r =>
                r.acceptedBy === currentUserId && r.status === 'Ready for Pickup'
            ).length;

            // Count only Claimed devices by this tech (fully finalized)
            stats.myClaimedCount = activeRepairs.filter(r =>
                r.acceptedBy === currentUserId &&
                r.status === 'Claimed' &&
                !r.deleted
            ).length;

            // Commission tracking - Calculate from actual payments this month
            // Includes both cash (in remittances) and GCash (reported)
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            let cashCommission = 0;
            let gcashCommission = 0;

            activeRepairs.forEach(r => {
                if (r.acceptedBy !== currentUserId || !r.payments) return;

                r.payments.forEach(payment => {
                    if (!payment.verified) return;

                    const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                    if (paymentDate < monthStart || paymentDate > monthEnd) return;

                    // Calculate commission based on payment - parts cost
                    const repairPartsCost = r.partsCost || 0;
                    const paymentShare = payment.amount;
                    const partsCostShare = r.payments.length > 0 ? repairPartsCost / r.payments.length : 0;
                    const netAmount = Math.max(0, paymentShare - partsCostShare);
                    const commission = netAmount * 0.40; // Tech gets 40%

                    if (payment.method === 'GCash') {
                        gcashCommission += commission;
                    } else {
                        cashCommission += commission;
                    }
                });
            });

            stats.myCommissionThisMonth = cashCommission + gcashCommission;
            stats.myCashCommission = cashCommission;
            stats.myGCashCommission = gcashCommission;

            // Calculate daily and weekly commission as well
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

            // Get start of week (Sunday)
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59);

            // Calculate daily commission
            const dailyComm = this.calculateCommissionForPeriod(activeRepairs, currentUserId, todayStart, todayEnd);
            stats.myCommissionToday = dailyComm.total;
            stats.myCashCommissionToday = dailyComm.cash;
            stats.myGCashCommissionToday = dailyComm.gcash;

            // Calculate weekly commission
            const weeklyComm = this.calculateCommissionForPeriod(activeRepairs, currentUserId, weekStart, weekEnd);
            stats.myCommissionThisWeek = weeklyComm.total;
            stats.myCashCommissionWeek = weeklyComm.cash;
            stats.myGCashCommissionWeek = weeklyComm.gcash;

            // Remittance status
            const techRemittances = window.techRemittances || [];
            const myPendingRemittances = techRemittances.filter(r =>
                r.techId === currentUserId && r.status === 'pending'
            );
            stats.pendingRemittanceCount = myPendingRemittances.length;
            stats.pendingRemittanceAmount = myPendingRemittances.reduce((sum, r) =>
                sum + (parseFloat(r.actualAmount) || 0), 0
            );

        } else if (role === 'cashier') {
            // Payment-focused stats
            stats.unpaidCount = activeRepairs.filter(r => {
                const total = parseFloat(r.total) || 0;
                const paid = (r.payments || [])
                    .filter(p => p.verified && !p.refunded)
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                return total > paid;
            }).length;

            stats.pendingVerification = activeRepairs.filter(r => {
                const hasUnverified = (r.payments || []).some(p => !p.verified);
                return hasUnverified;
            }).length;

            const techRemittances = window.techRemittances || [];
            stats.pendingRemittances = techRemittances.filter(r => r.status === 'pending').length;

            // Cash count status
            const dailyCashCounts = window.dailyCashCounts || {};
            const todayKey = today.toISOString().split('T')[0];
            stats.cashCountDone = !!dailyCashCounts[todayKey];

        } else if (role === 'admin' || role === 'manager') {
            // System-wide metrics
            stats.completedToday = activeRepairs.filter(r => {
                if (!r.completedAt) return false;
                const completed = new Date(r.completedAt);
                return completed >= today;
            }).length;

            // Daily revenue (shop's 60% share after 40% tech commission and parts cost)
            let todayCashRevenue = 0;
            let todayGCashRevenue = 0;

            activeRepairs.forEach(r => {
                const verifiedPayments = (r.payments || []).filter(p => {
                    if (!p.verified) return false;
                    const payDate = new Date(p.recordedDate || p.paymentDate);
                    return payDate >= today;
                });

                verifiedPayments.forEach(p => {
                    const repairPartsCost = r.partsCost || 0;
                    const partsCostShare = r.payments.length > 0 ? repairPartsCost / r.payments.length : 0;
                    const netAmount = Math.max(0, p.amount - partsCostShare);
                    const shopShare = netAmount * 0.60; // Shop gets 60%

                    if (p.method === 'GCash') {
                        todayGCashRevenue += shopShare;
                    } else {
                        todayCashRevenue += shopShare;
                    }
                });
            });

            stats.revenueToday = todayCashRevenue + todayGCashRevenue;
            stats.todayCashRevenue = todayCashRevenue;
            stats.todayGCashRevenue = todayGCashRevenue;

            // Average completion time this week
            const completedThisWeek = activeRepairs.filter(r => {
                if (!r.completedAt) return false;
                const completed = new Date(r.completedAt);
                return completed >= weekAgo;
            });

            if (completedThisWeek.length > 0) {
                const totalDays = completedThisWeek.reduce((sum, r) => {
                    if (!r.acceptedAt || !r.completedAt) return sum;
                    const days = (new Date(r.completedAt) - new Date(r.acceptedAt)) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0);
                stats.avgCompletionDays = (totalDays / completedThisWeek.length).toFixed(1);
            } else {
                stats.avgCompletionDays = 0;
            }

            // Modification requests (admin only)
            if (role === 'admin') {
                const modRequests = window.allModificationRequests || [];
                stats.pendingModRequests = modRequests.filter(r => r.status === 'pending').length;
            }

            // Remittances pending verification
            const techRemittances = window.techRemittances || [];
            stats.pendingRemittances = techRemittances.filter(r => r.status === 'pending').length;
        }

        return stats;
    },

    /**
     * Create stat card HTML
     * @param {string} label - Card label
     * @param {string|number} value - Main value to display
     * @param {string} subtext - Optional subtext
     * @param {string} gradient - CSS gradient string
     * @param {function|string} clickAction - Click handler function name or tab name
     * @param {string} icon - Optional emoji icon
     * @returns {string} HTML string
     */
    createStatCard: function (label, value, subtext, gradient, clickAction, icon = '', dateFilter = null) {
        let clickHandler = '';

        if (typeof clickAction === 'function') {
            clickHandler = `onclick="${clickAction.name}()" style="cursor:pointer;"`;
        } else if (typeof clickAction === 'string' && clickAction) {
            // Check if it's a known function name (starts with lowercase and has specific patterns)
            const knownFunctions = ['toggleCommissionPeriod', 'openAdminToolsDataHealth'];
            const isFunctionName = knownFunctions.includes(clickAction);

            if (isFunctionName) {
                // It's a function name
                clickHandler = `onclick="${clickAction}()" style="cursor:pointer;"`;
            } else {
                // It's a tab name (including single-word tab IDs like 'my', 'myclaimed', etc.)
                clickHandler = dateFilter
                    ? `onclick="switchTab('${clickAction}', '${dateFilter}')" style="cursor:pointer;"`
                    : `onclick="switchTab('${clickAction}')" style="cursor:pointer;"`;
            }
        }

        return `
            <div class="dashboard-stat-card" ${clickHandler}>
                <div style="font-size:13px;color:rgba(255,255,255,0.9);margin-bottom:8px;">
                    ${icon} ${label}
                </div>
                <div style="font-size:32px;font-weight:bold;color:white;margin-bottom:5px;">
                    ${value}
                </div>
                ${subtext ? `<div style="font-size:11px;color:rgba(255,255,255,0.8);">${subtext}</div>` : ''}
                <div class="stat-card-gradient" style="background:${gradient};"></div>
            </div>
        `;
    },

    /**
     * Create alert card HTML for urgent items
     * @param {string} title - Alert title
     * @param {number} count - Count of items
     * @param {string} urgency - 'high', 'medium', 'low'
     * @param {string} targetTab - Tab to switch to on click
     * @param {string} icon - Emoji icon
     * @returns {string} HTML string
     */
    createAlertCard: function (title, count, urgency, targetTab, icon = '⚠️') {
        const colors = {
            high: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
            medium: 'linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%)',
            low: 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)'
        };

        const gradient = colors[urgency] || colors.medium;

        if (count === 0) return '';  // Don't show alerts with zero count

        return `
            <div class="dashboard-alert-card" onclick="switchTab('${targetTab}')" style="cursor:pointer;">
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <div class="alert-count">${count}</div>
                    <div class="alert-title">${title}</div>
                </div>
                <div class="stat-card-gradient" style="background:${gradient};"></div>
            </div>
        `;
    },

    /**
     * Get device and browser information
     */
    getDeviceInfo: function () {
        const ua = navigator.userAgent;

        // Detect browser
        let browser = "Unknown";
        let browserVersion = "";
        if (ua.includes("Chrome") && !ua.includes("Edge")) {
            browser = "Chrome";
            const match = ua.match(/Chrome\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Firefox")) {
            browser = "Firefox";
            const match = ua.match(/Firefox\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
            browser = "Safari";
            const match = ua.match(/Version\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Edge")) {
            browser = "Edge";
            const match = ua.match(/Edge\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Opera") || ua.includes("OPR")) {
            browser = "Opera";
        }

        // Detect OS
        let os = "Unknown";
        if (ua.includes("Windows NT 10")) os = "Windows 10/11";
        else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
        else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
        else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
        else if (ua.includes("Mac OS X")) {
            os = "macOS";
            const match = ua.match(/Mac OS X (\d+)[._](\d+)/);
            if (match) os = `macOS ${match[1]}.${match[2]}`;
        } else if (ua.includes("Android")) {
            os = "Android";
            const match = ua.match(/Android (\d+)/);
            if (match) os = `Android ${match[1]}`;
        } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
            os = "iOS";
            const match = ua.match(/OS (\d+)_(\d+)/);
            if (match) os = `iOS ${match[1]}.${match[2]}`;
        } else if (ua.includes("Linux")) {
            os = "Linux";
        }

        // Detect device type
        let deviceType = "Desktop";
        if (/Mobile|Android|iPhone|iPod/.test(ua)) {
            deviceType = "Mobile";
        } else if (/Tablet|iPad/.test(ua)) {
            deviceType = "Tablet";
        }

        return {
            browser: browserVersion ? `${browser} ${browserVersion}` : browser,
            os: os,
            deviceType: deviceType,
            userAgent: ua,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || navigator.userLanguage,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    },

    /**
     * Show toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (default: 4000)
     */
    showToast: function (message, type = 'info', duration = 4000) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Define icons for each type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Define titles for each type
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.remove()">×</div>
        `;

        // Add toast to container
        toastContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
                // Remove container if no toasts left
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, duration);
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme: function () {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update toggle button icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        // Show toast notification
        this.showToast(
            `${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`,
            'success',
            2000
        );
    },

    /**
     * Initialize theme from localStorage
     */
    initTheme: function () {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const html = document.documentElement;
        html.setAttribute('data-theme', savedTheme);

        // Update toggle button icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    },

    /**
     * Suggest repair type based on reported problem
     * Maps customer complaint to likely repair solution
     */
    suggestRepairType: function (problemType) {
        const mapping = {
            'Screen': 'Screen Replacement',
            'Battery': 'Battery Replacement',
            'Charging Port': 'Charging Port Repair',
            'Camera': 'Camera Replacement',
            'Speaker': 'Speaker/Mic Repair',
            'Button': 'Button Repair',
            'Housing': 'Housing Replacement',
            'Water Damage': 'Water Damage Repair',
            'Motherboard': 'Motherboard Repair',
            'FRP Lock': 'Software Repair',
            'Password Lock': 'Software Repair',
            'iCloud Lock': 'Software Repair',
            'Software Restore': 'Software Repair',
            'Virus/Malware': 'Software Repair',
            'OS Update': 'Software Repair',
            'App Issues': 'Software Repair',
            'Slow Performance': 'Software Repair',
            'Data Recovery': 'Data Recovery',
            'Network': 'Network/Signal Repair',
            'Other Hardware': 'Other Repair',
            'Other Software': 'Software Repair',
            'Pending Diagnosis': ''
        };

        return mapping[problemType] || '';
    },

    /**
     * Update remittance badge for technician
     */
    updateRemittanceBadge: function () {
        if (!window.currentUser || !window.currentUserData) return;
        if (window.currentUserData.role !== 'technician') return;

        const techId = window.currentUser.uid;

        // Count pending and rejected remittances for this tech
        const pending = window.techRemittances.filter(r =>
            r.techId === techId && r.status === 'pending'
        ).length;

        const rejected = window.techRemittances.filter(r =>
            r.techId === techId && r.status === 'rejected'
        ).length;

        // Find the Daily Remittance tab button
        const remittanceTab = document.querySelector('[data-tab=\"remittance\"]');
        if (!remittanceTab) return;

        // Remove existing badges
        const existingBadge = remittanceTab.querySelector('.tab-badge');
        if (existingBadge) existingBadge.remove();

        // Add badge if there are notifications
        if (pending > 0 || rejected > 0) {
            const badge = document.createElement('span');
            badge.className = 'tab-badge';
            badge.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: ${rejected > 0 ? '#f44336' : '#ff9800'};
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
                min-width: 18px;
                text-align: center;
            `;

            if (rejected > 0) {
                badge.textContent = `❌ ${rejected}`;
                badge.title = `${rejected} rejected remittance${rejected > 1 ? 's' : ''}`;
            } else {
                badge.textContent = `⏳ ${pending}`;
                badge.title = `${pending} pending verification`;
            }

            remittanceTab.style.position = 'relative';
            remittanceTab.appendChild(badge);
        }
    },

    // ===== SECURITY & VALIDATION FUNCTIONS =====

    /**
     * Sanitize string input to prevent XSS attacks
     */
    sanitizeString: function (input) {
        if (typeof input !== 'string') return '';

        // Create a temporary div element to safely encode HTML
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
    },

    /**
     * Sanitize object (all string values)
     */
    sanitizeObject: function (obj) {
        const sanitized = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    },

    /**
     * Validate email format
     */
    isValidEmail: function (email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate Philippine phone number
     */
    isValidPhone: function (phone) {
        if (!phone) return false;

        // Remove spaces, dashes, and parentheses
        const cleaned = phone.replace(/[\s\-()]/g, '');

        // Philippine mobile: 09XX-XXX-XXXX or +639XX-XXX-XXXX or 9XXXXXXXXX
        const phoneRegex = /^(\+63|0)?9\d{9}$/;
        return phoneRegex.test(cleaned);
    },

    /**
     * Validate required field
     */
    isRequired: function (value) {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    },

    /**
     * Validate number
     */
    isValidNumber: function (value, min = null, max = null) {
        const num = Number(value);

        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;

        return true;
    },

    /**
     * Validate price/amount (must be >= 0)
     */
    isValidPrice: function (value) {
        return this.isValidNumber(value, 0);
    },

    /**
     * Show validation error on field
     */
    showValidationError: function (fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Add error class
        field.classList.add('validation-error');

        // Show error message
        let errorDiv = field.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            field.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;

        // Remove error on input
        const clearError = function () {
            field.classList.remove('validation-error');
            if (errorDiv && errorDiv.parentElement) {
                errorDiv.remove();
            }
            field.removeEventListener('input', clearError);
        };
        field.addEventListener('input', clearError);
    },

    /**
     * Clear all validation errors in a container
     */
    clearValidationErrors: function (containerId) {
        const container = document.getElementById(containerId) || document;

        // Remove error classes
        container.querySelectorAll('.validation-error').forEach(field => {
            field.classList.remove('validation-error');
        });

        // Remove error messages
        container.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });
    },

    /**
     * Show error toast notification
     */
    showError: function (message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Show success toast notification
     */
    showSuccess: function (message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Handle Firebase authentication errors with user-friendly messages
     */
    handleFirebaseError: function (error) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address format',
            'auth/user-disabled': 'This account has been disabled. Contact administrator.',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password must be at least 6 characters',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/operation-not-allowed': 'This operation is not allowed',
            'PERMISSION_DENIED': 'You do not have permission to perform this action',
            'permission-denied': 'You do not have permission to perform this action',
            'unavailable': 'Service temporarily unavailable. Please try again.',
            'not-found': 'Requested data not found',
            'already-exists': 'This item already exists',
            'failed-precondition': 'Operation failed. Please check requirements.',
            'invalid-argument': 'Invalid data provided'
        };

        const userMessage = errorMessages[error.code] || errorMessages[error.message] ||
            'An unexpected error occurred. Please try again.';

        return {
            code: error.code,
            message: userMessage,
            originalError: error
        };
    }
};

// ===== LANGUAGE TOGGLE FUNCTIONS =====

/**
 * Toggle language dropdown visibility
 */
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Set help language preference
 */
function setHelpLanguage(lang) {
    localStorage.setItem('helpLanguage', lang);

    // Update button text
    const currentLangText = document.getElementById('currentLangText');
    if (currentLangText) {
        currentLangText.textContent = lang.toUpperCase();
    }

    // Close dropdown
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }

    // Refresh current tab to show help in new language
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }

    console.log('✅ Language set to:', lang);
}

/**
 * Get current help language
 */
function getCurrentHelpLanguage() {
    return localStorage.getItem('helpLanguage') || 'en';
}

// ===== HELP GUIDE FUNCTIONS =====

/**
 * Open help guide modal
 */
function openHelpGuide(topicKey) {
    const lang = getCurrentHelpLanguage();
    const modal = document.getElementById('helpGuideModal');
    const content = document.getElementById('helpGuideContent');

    if (!modal || !content) return;

    // Update title based on language
    const titleEl = document.getElementById('helpGuideTitle');
    if (titleEl) {
        titleEl.textContent = lang === 'tl' ? '❓ Gabay sa Paggamit' : '❓ Help Guide';
    }

    // Update search placeholder
    const searchInput = document.getElementById('helpSearchInput');
    if (searchInput) {
        searchInput.placeholder = lang === 'tl' ? 'Maghanap ng tulong...' : 'Search help topics...';
        searchInput.value = '';
    }

    // Generate help content
    let html = '<div style="display:grid;gap:15px;">';

    // Define all topics
    const topics = [
        'deviceIntake',
        'preApprovalPricing',
        'acceptRepair',
        'statusUpdates',
        'rtoProcess',
        'recordPayment',
        'deviceRelease',
        'techRemittance',
        'verifyRemittance',
        'backJobs',
        'partsCost'
    ];

    // Generate help boxes for each topic
    topics.forEach(topic => {
        html += generateHelpBox(topic, lang);
    });

    html += '</div>';

    content.innerHTML = html;

    // Expand specific topic if provided
    if (topicKey) {
        setTimeout(() => {
            const details = content.querySelectorAll('details');
            details.forEach(detail => {
                const summary = detail.querySelector('summary');
                if (summary && summary.textContent.includes(topicKey)) {
                    detail.open = true;
                }
            });
        }, 100);
    }

    modal.style.display = 'block';
}

/**
 * Close help guide modal
 */
function closeHelpGuide() {
    const modal = document.getElementById('helpGuideModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Filter help topics based on search input
 */
function filterHelpTopics() {
    const input = document.getElementById('helpSearchInput');
    const content = document.getElementById('helpGuideContent');

    if (!input || !content) return;

    const filter = input.value.toLowerCase();
    const helpBoxes = content.querySelectorAll('.help-box');

    helpBoxes.forEach(box => {
        const text = box.textContent.toLowerCase();
        if (text.includes(filter)) {
            box.style.display = 'block';
            // Auto-expand if searching
            if (filter.length > 0) {
                box.open = true;
            }
        } else {
            box.style.display = 'none';
        }
    });
}

// ===== FIRST-TIME USER ONBOARDING =====

/**
 * Check if user has seen onboarding
 */
function hasSeenOnboarding() {
    const role = window.currentUserData?.role;
    if (!role) return true; // Skip if no role

    const key = `hasSeenOnboarding_${role}`;
    return localStorage.getItem(key) === 'true';
}

/**
 * Mark onboarding as seen
 */
function markOnboardingSeen() {
    const role = window.currentUserData?.role;
    if (!role) return;

    const key = `hasSeenOnboarding_${role}`;
    localStorage.setItem(key, 'true');
}

/**
 * Show onboarding wizard
 */
function showOnboardingWizard() {
    if (!window.currentUserData) return;

    const role = window.currentUserData.role;
    const lang = getCurrentHelpLanguage();

    const messages = {
        technician: {
            en: `Welcome, Technician! 👋\n\nKey features for you:\n• My Jobs - See repairs assigned to you\n• Daily Remittance - Submit daily cash collections\n• Accept Repair - Start working on repairs\n\nWould you like to see the full help guide?`,
            tl: `Maligayang pagdating, Technician! 👋\n\nMahalagang features para sa iyo:\n• My Jobs - Tingnan ang repairs na assigned sa iyo\n• Daily Remittance - Mag-submit ng araw-arawang cash collections\n• Accept Repair - Simulan ang pag-repair\n\nGusto mo bang tingnan ang buong help guide?`
        },
        cashier: {
            en: `Welcome, Cashier! 👋\n\nKey features for you:\n• Receive Device - Accept new repairs\n• For Release - Release devices to customers\n• Verify Remittance - Verify technician submissions\n• Unpaid - Track pending payments\n\nWould you like to see the full help guide?`,
            tl: `Maligayang pagdating, Cashier! 👋\n\nMahalagang features para sa iyo:\n• Receive Device - Tumanggap ng bagong repairs\n• For Release - I-release ang devices sa customers\n• Verify Remittance - I-verify ang submissions ng technician\n• Unpaid - Subaybayan ang pending payments\n\nGusto mo bang tingnan ang buong help guide?`
        },
        manager: {
            en: `Welcome, Manager! 👋\n\nYou have access to all operational features:\n• All repair statuses and tabs\n• Analytics & Reports\n• Cash Count daily overview\n• Verify technician remittances\n\nWould you like to see the full help guide?`,
            tl: `Maligayang pagdating, Manager! 👋\n\nMay access ka sa lahat ng operational features:\n• Lahat ng repair statuses at tabs\n• Analytics & Reports\n• Cash Count daily overview\n• I-verify ang technician remittances\n\nGusto mo bang tingnan ang buong help guide?`
        },
        admin: {
            en: `Welcome, Admin! 👋\n\nYou have full system access:\n• User Management\n• Mod Requests approval\n• Admin Tools & Activity Logs\n• All operational features\n\nWould you like to see the full help guide?`,
            tl: `Maligayang pagdating, Admin! 👋\n\nMay full system access ka:\n• User Management\n• Mod Requests approval\n• Admin Tools & Activity Logs\n• Lahat ng operational features\n\nGusto mo bang tingnan ang buong help guide?`
        }
    };

    const message = messages[role]?.[lang] || messages[role]?.en;

    if (message && confirm(message)) {
        openHelpGuide();
    }

    markOnboardingSeen();
}

// Export to global scope
window.utils = utils;

// Export functions to window
window.toggleTheme = utils.toggleTheme.bind(utils);
window.toggleLanguageDropdown = toggleLanguageDropdown;
window.setHelpLanguage = setHelpLanguage;
window.getCurrentHelpLanguage = getCurrentHelpLanguage;
window.openHelpGuide = openHelpGuide;
window.closeHelpGuide = closeHelpGuide;
window.filterHelpTopics = filterHelpTopics;
window.showOnboardingWizard = showOnboardingWizard;
window.hasSeenOnboarding = hasSeenOnboarding;
window.markOnboardingSeen = markOnboardingSeen;

// Close language dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('languageDropdown');
    const langBtn = document.getElementById('langToggleBtn');

    if (dropdown && langBtn &&
        !dropdown.contains(event.target) &&
        !langBtn.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// ===== TOAST NOTIFICATION SYSTEM =====

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
utils.showToast = function (message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => removeToast(toast);

    toast.appendChild(messageSpan);
    toast.appendChild(closeBtn);

    // Add to container
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }

    return toast;
};

/**
 * Remove toast with animation
 */
function removeToast(toast) {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

console.log('✅ utils.js loaded');
