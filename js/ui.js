// ===== UI MODULE =====

/**
 * Get local date string in YYYY-MM-DD format (no timezone conversion)
 * This prevents timezone bugs where dates shift due to UTC conversion
 */
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

let availableTabs = [];
let activeTab = '';

/**
 * Build tabs based on user role - organized into sections for sidebar
 */
function buildTabs() {
    console.log('🔖 Building sidebar navigation...');
    const role = window.currentUserData.role;

    // Define sections with their tabs
    const sections = {
        overview: {
            title: 'Overview',
            tabs: []
        },
        operations: {
            title: 'Operations',
            tabs: []
        },
        payments: {
            title: 'Payments',
            tabs: []
        },
        inventory: {
            title: 'Inventory & Reports',
            tabs: []
        },
        admin: {
            title: 'Administration',
            tabs: []
        }
    };

    // Overview section - Dashboard for all roles
    sections.overview.tabs.push(
        { id: 'dashboard', label: 'Dashboard', icon: '📊', build: buildDashboardTab }
    );

    // ROLE-SPECIFIC TABS
    if (role === 'cashier') {
        // Operations
        sections.operations.tabs.push(
            { id: 'receive', label: 'Receive Device', icon: '➕', build: buildReceiveDeviceTab },
            { id: 'received', label: 'Received Devices', icon: '📥', build: buildReceivedDevicesPage },
            { id: 'inprogress', label: 'In Progress', icon: '🔧', build: buildInProgressPage },
            { id: 'forrelease', label: 'For Release', icon: '📦', build: buildForReleasePage },
            { id: 'rto', label: 'RTO Devices', icon: '↩️', build: buildRTODevicesTab },
            { id: 'claimed', label: 'Claimed Units', icon: '✅', build: buildClaimedUnitsPage }
        );
        // Payments
        sections.payments.tabs.push(
            { id: 'unpaid', label: 'Unpaid', icon: '💳', build: buildUnpaidTab },
            { id: 'pending', label: 'Pending Verification', icon: '⏳', build: buildPendingPaymentsTab },
            { id: 'paid', label: 'Paid', icon: '✅', build: buildPaidTab },
            { id: 'verify-remittance', label: 'Verify Remittance', icon: '✅', build: buildRemittanceVerificationTab }
        );
        // Inventory & Reports
        sections.inventory.tabs.push(
            { id: 'all', label: 'All Repairs', icon: '📋', build: buildAllRepairsTab },
            { id: 'historical-review', label: 'Historical Review', icon: '📅', build: buildHistoricalReviewTab },
            { id: 'tech-logs', label: 'Technician Logs', icon: '📊', build: buildTechnicianLogsTab },
            { id: 'requests', label: 'My Requests', icon: '📝', build: buildMyRequestsTab }
        );
    }
    else if (role === 'admin' || role === 'manager') {
        // Operations
        sections.operations.tabs.push(
            { id: 'receive', label: 'Receive Device', icon: '➕', build: buildReceiveDeviceTab },
            { id: 'received', label: 'Received Devices', icon: '📥', build: buildReceivedDevicesPage },
            { id: 'inprogress', label: 'In Progress', icon: '🔧', build: buildInProgressPage },
            { id: 'forrelease', label: 'For Release', icon: '📦', build: buildForReleasePage },
            { id: 'rto', label: 'RTO Devices', icon: '↩️', build: buildRTODevicesTab },
            { id: 'claimed', label: 'Claimed Units', icon: '✅', build: buildClaimedUnitsPage }
        );
        // Payments
        sections.payments.tabs.push(
            { id: 'pending', label: 'Pending Verification', icon: '⏳', build: buildPendingTab },
            { id: 'cash', label: 'Cash Count', icon: '💵', build: buildCashCountTab },
            { id: 'verify-remittance', label: 'Verify Remittance', icon: '✅', build: buildRemittanceVerificationTab }
        );
        // Inventory & Reports
        sections.inventory.tabs.push(
            { id: 'all', label: 'All Repairs', icon: '📋', build: buildAllRepairsTab },
            { id: 'historical-review', label: 'Historical Review', icon: '📅', build: buildHistoricalReviewTab },
            { id: 'profit-dashboard', label: 'Profit Dashboard', icon: '💰', build: buildProfitDashboardTab },
            { id: 'overhead', label: 'Overhead Expenses', icon: '💼', build: buildOverheadExpensesTab },
            { id: 'supplier-payables', label: 'Supplier Payables', icon: '🧾', build: buildSupplierPayablesTab },
            { id: 'financial-reports', label: 'Financial Reports', icon: '📑', build: buildFinancialReportsTab },
            { id: 'analytics', label: 'Analytics & Reports', icon: '📊', build: buildAnalyticsTab },
            { id: 'inventory', label: 'Inventory', icon: '📦', build: buildInventoryTab },
            { id: 'suppliers', label: 'Supplier Report', icon: '📊', build: buildSuppliersTab },
            { id: 'tech-logs', label: 'Technician Logs', icon: '📈', build: buildTechnicianLogsTab }
        );
        if (role === 'manager') {
            sections.inventory.tabs.push(
                { id: 'requests', label: 'My Requests', icon: '📝', build: buildMyRequestsTab }
            );
        }
        // Administration (Admin only)
        if (role === 'admin') {
            sections.admin.tabs.push(
                { id: 'users', label: 'Users', icon: '👥', build: buildUsersTab },
                { id: 'mod-requests', label: 'Mod Requests', icon: '🔔', build: buildModificationRequestsTab },
                { id: 'refund-requests', label: 'Refund Requests', icon: '🔄', build: buildRefundRequestsTab },
                { id: 'admin-tools', label: 'Admin Tools', icon: '🔧', build: buildAdminToolsTab },
                { id: 'admin-logs', label: 'Activity Logs', icon: '📋', build: buildActivityLogsTab }
            );
        }
    }
    else if (role === 'technician') {
        // Operations
        sections.operations.tabs.push(
            { id: 'receive', label: 'Receive Device', icon: '➕', build: buildReceiveDeviceTab },
            { id: 'my', label: 'My Jobs', icon: '🔧', build: buildMyRepairsTab },
            { id: 'myclaimed', label: 'My Claimed', icon: '✅', build: buildMyClaimedDevicesTab },
            { id: 'received', label: 'Received Devices', icon: '📥', build: buildReceivedDevicesPage },
            { id: 'inprogress', label: 'In Progress', icon: '🔧', build: buildInProgressPage },
            { id: 'forrelease', label: 'For Release', icon: '📦', build: buildForReleasePage },
            { id: 'rto', label: 'RTO Devices', icon: '↩️', build: buildRTODevicesTab },
            { id: 'claimed', label: 'Claimed Units', icon: '📋', build: buildClaimedUnitsPage }
        );
        // Payments
        sections.payments.tabs.push(
            { id: 'remittance', label: 'Daily Remittance', icon: '💸', build: buildDailyRemittanceTab }
        );
        // Inventory & Reports
        sections.inventory.tabs.push(
            { id: 'inventory', label: 'Inventory', icon: '📦', build: buildInventoryTab },
            { id: 'historical-review', label: 'Historical Review', icon: '📅', build: buildHistoricalReviewTab },
            { id: 'requests', label: 'My Requests', icon: '📝', build: buildMyRequestsTab }
        );
    }

    // Store sections globally for sidebar rendering
    window.sidebarSections = sections;

    // Build flat availableTabs array for compatibility
    availableTabs = [];
    for (const section of Object.values(sections)) {
        availableTabs.push(...section.tabs);
    }

    console.log('✅ Sidebar sections configured:', Object.keys(sections).length);
    console.log('✅ Total tabs:', availableTabs.length);
    renderSidebar();
}

/**
 * Render sidebar navigation with sections
 */
function renderSidebar() {
    console.log('🎨 Rendering sidebar navigation...');
    const sidebarNav = document.getElementById('sidebarNav');
    const contentsContainer = document.getElementById('contentsContainer');

    if (!sidebarNav) {
        console.error('❌ Sidebar nav not found!');
        return;
    }

    if (!contentsContainer) {
        console.error('❌ Contents container not found!');
        return;
    }

    // Calculate pending deletion requests count
    const pendingDeletions = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status === 'pending' && r.requestType === 'deletion_request').length : 0;

    // Clear existing content
    sidebarNav.innerHTML = '';
    contentsContainer.innerHTML = '';

    let html = '';

    // Render each section
    for (const [sectionKey, section] of Object.entries(window.sidebarSections)) {
        if (section.tabs.length === 0) continue;

        html += `
            <div class="sidebar-section">
                <div class="sidebar-section-title">${section.title}</div>
                ${section.tabs.map(tab => {
            // Add badge for mod-requests tab if there are pending deletions
            const hasBadge = tab.id === 'mod-requests' && pendingDeletions > 0;

            return `
                        <div class="sidebar-item ${tab.id === activeTab ? 'active' : ''}" 
                             data-tab="${tab.id}"
                             id="sidebar-${tab.id}"
                             onclick="switchTab('${tab.id}')">
                            <span class="sidebar-item-icon">${tab.icon}</span>
                            <span class="sidebar-item-label">${tab.label}</span>
                            ${hasBadge ? `<span class="sidebar-badge-alert">${pendingDeletions}</span>` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    sidebarNav.innerHTML = html;

    // Build content containers for all tabs
    availableTabs.forEach((tab, index) => {
        const contentEl = document.createElement('div');
        contentEl.id = `${tab.id}Tab`;
        contentEl.className = 'tab-content' + (index === 0 ? ' active' : '');
        contentsContainer.appendChild(contentEl);

        console.log('📄 Building content for tab:', tab.label);
        tab.build(contentEl);
    });

    // Set first tab as active
    if (availableTabs.length > 0) {
        activeTab = availableTabs[0].id;
    }

    // Render mobile bottom nav (keep 4-5 most important tabs)
    renderMobileBottomNav();

    console.log('✅ Sidebar rendered successfully');
}

/**
 * Render mobile bottom navigation with 4-5 key tabs
 */
function renderMobileBottomNav() {
    const mobileNav = document.getElementById('mobileBottomNav');
    if (!mobileNav) return;

    const role = window.currentUserData.role;

    // Select 4-5 most important tabs for quick access
    const quickTabs = [];

    if (role === 'cashier') {
        quickTabs.push(
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'receive', icon: '➕', label: 'Receive' },
            { id: 'forrelease', icon: '📦', label: 'Release' },
            { id: 'unpaid', icon: '💳', label: 'Unpaid' }
        );
    } else if (role === 'technician') {
        quickTabs.push(
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'my', icon: '🔧', label: 'My Jobs' },
            { id: 'receive', icon: '➕', label: 'Receive' },
            { id: 'remittance', icon: '💸', label: 'Remittance' },
            { id: 'inprogress', icon: '⚙️', label: 'Progress' }
        );
    } else if (role === 'admin' || role === 'manager') {
        quickTabs.push(
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'receive', icon: '➕', label: 'Receive' },
            { id: 'inprogress', icon: '🔧', label: 'Progress' },
            { id: 'all', icon: '📋', label: 'All' },
            { id: 'cash', icon: '💵', label: 'Cash' }
        );
    }

    mobileNav.innerHTML = quickTabs.map(tab => `
        <div class="mobile-nav-item ${tab.id === activeTab ? 'active' : ''}"
             id="mobile-tab-${tab.id}"
             onclick="switchTab('${tab.id}')">
            <span class="mobile-nav-icon">${tab.icon}</span>
            <span class="mobile-nav-label">${tab.label}</span>
        </div>
    `).join('');
}

/**
 * Render tabs (kept for compatibility, now hidden)
 */
function renderTabs() {
    console.log('🎨 Rendering tabs UI...');
    const tabsContainer = document.getElementById('tabsContainer');
    const contentsContainer = document.getElementById('contentsContainer');
    const mobileNav = document.getElementById('mobileBottomNav');

    if (!tabsContainer || !contentsContainer) {
        console.error('❌ Tab containers not found!');
        return;
    }

    tabsContainer.innerHTML = '';
    contentsContainer.innerHTML = '';

    // Build mobile navigation (show ALL available tabs)
    if (mobileNav) {
        mobileNav.innerHTML = '';

        // Show ALL available tabs in mobile navigation
        availableTabs.forEach((tab, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'mobile-nav-item' + (index === 0 ? ' active' : '');
            navItem.onclick = () => switchTab(tab.id);
            navItem.id = `mobile-tab-${tab.id}`;

            // Extract emoji and text
            const label = tab.label;
            const emojiMatch = label.match(/^([^\s]+)\s+(.+)$/);
            const emoji = emojiMatch ? emojiMatch[1] : '📋';
            let text = emojiMatch ? emojiMatch[2] : label;

            // Shorten text for mobile - keep it short but readable
            const maxLength = 7;
            if (text.length > maxLength) {
                text = text.substring(0, maxLength - 1) + '…';
            }

            navItem.innerHTML = `
                <span>${emoji}</span>
                <span>${text}</span>
            `;
            mobileNav.appendChild(navItem);
        });
    }

    availableTabs.forEach((tab, index) => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (index === 0 ? ' active' : '');
        tabEl.textContent = tab.label;
        tabEl.onclick = () => switchTab(tab.id);
        tabEl.id = `tab-${tab.id}`;
        tabsContainer.appendChild(tabEl);

        const contentEl = document.createElement('div');
        contentEl.id = `${tab.id}Tab`;
        contentEl.className = 'tab-content' + (index === 0 ? ' active' : '');
        contentsContainer.appendChild(contentEl);

        console.log('📄 Building content for tab:', tab.label);
        tab.build(contentEl);
    });

    if (availableTabs.length > 0) {
        activeTab = availableTabs[0].id;
    }

    console.log('✅ Tabs rendered successfully');
}

/**
 * Switch tab
 */
function switchTab(tabId, dateFilter = null) {
    console.log('🔄 Switching to tab:', tabId, dateFilter ? `(Filter: ${dateFilter})` : '');

    if (window.DebugLogger) {
        DebugLogger.log('UI', 'Tab Switch', {
            from: activeTab,
            to: tabId,
            dateFilter: dateFilter
        });
    }

    // Store date filter for specific tabs
    if (tabId === 'myclaimed') {
        window.currentDateFilter = dateFilter;
    }

    // Remove active class from all navigation items
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

    // Activate current tab elements
    const tab = document.getElementById(`tab-${tabId}`);
    const content = document.getElementById(`${tabId}Tab`);
    const mobileTab = document.getElementById(`mobile-tab-${tabId}`);
    const sidebarItem = document.getElementById(`sidebar-${tabId}`);

    if (tab) tab.classList.add('active');
    if (content) content.classList.add('active');
    if (mobileTab) mobileTab.classList.add('active');
    if (sidebarItem) sidebarItem.classList.add('active');

    activeTab = tabId;

    // Close mobile sidebar if open
    if (window.innerWidth <= 768) {
        if (window.closeMobileSidebar) {
            window.closeMobileSidebar();
        }
    }

    // For mobile: scroll to show content immediately (above stats at bottom)
    const isMobile = window.innerWidth <= 768;
    if (isMobile && content) {
        setTimeout(() => {
            const tabContents = document.querySelector('.tab-contents');
            if (tabContents) {
                // Scroll to tab contents area (content shows before stats on mobile)
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const scrollPosition = tabContents.offsetTop - headerHeight - 10;
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

/**
 * Build Received Devices Page (SHARED - Everyone can access)
 */
function buildReceivedDevicesPage(container) {
    console.log('📥 Building Received Devices page');
    window.currentTabRefresh = () => buildReceivedDevicesPage(document.getElementById('receivedTab'));

    // Show devices that are received but not yet accepted
    // Include both "Received" and "Pending Customer Approval" statuses
    const receivedDevices = window.allRepairs.filter(r =>
        (r.status === 'Received' || r.status === 'Pending Customer Approval') && !r.acceptedBy
    );

    container.innerHTML = `
        <div class="card">
            <h3>📥 Received Devices (${receivedDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">
                <strong>Workflow:</strong> Device Received → Create Diagnosis → Customer Approves → Technician Accepts
            </p>
            ${receivedDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No devices waiting - All caught up!</p>
                </div>
            ` : `
                <div id="receivedDevicesList"></div>
            `}
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('receivedDevicesList');
        if (listContainer && receivedDevices.length > 0) {
            displayGroupedRepairsList(receivedDevices, listContainer, 'received', 'recordedDate');
        }
    }, 0);
}

/**
 * Build In Progress Page (SHARED - Everyone can access)
 */
function buildInProgressPage(container) {
    console.log('🔧 Building In Progress page');
    window.currentTabRefresh = () => buildInProgressPage(document.getElementById('inprogressTab'));

    const inProgressDevices = window.allRepairs.filter(r =>
        r.status === 'In Progress' || r.status === 'Waiting for Parts'
    );

    container.innerHTML = `
        <div class="card">
            <h3>🔧 In Progress - Active Repairs (${inProgressDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices currently being repaired</p>
            ${inProgressDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">🎉</h2>
                    <p>No active repairs - All done!</p>
                </div>
            ` : `
                <div id="inProgressList"></div>
            `}
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('inProgressList');
        if (listContainer && inProgressDevices.length > 0) {
            displayGroupedRepairsList(inProgressDevices, listContainer, 'default', 'recordedDate');
        }
    }, 0);
}

/**
 * Build For Release Page (SHARED - Everyone can access)
 */
function buildForReleasePage(container) {
    console.log('📦 Building For Release page');
    window.currentTabRefresh = () => buildForReleasePage(document.getElementById('forreleaseTab'));

    const forReleaseRepairs = window.allRepairs.filter(r => r.status === 'Ready for Pickup');
    const releasedRepairs = window.allRepairs.filter(r => r.status === 'Released');

    container.innerHTML = `
        <div class="card">
            <h3>📦 Ready for Customer Pickup (${forReleaseRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices ready to be released to customers</p>
            <div id="forReleaseList"></div>
        </div>
        
        ${releasedRepairs.length > 0 ? `
        <div class="card" style="border-left:4px solid #ff9800;background:#fffbf0;margin-top:20px;">
            <h3 style="color:#f57c00;">⚡ Released - Awaiting Finalization (${releasedRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">
                Devices handed to customers. Will auto-finalize at <strong>6pm Manila time</strong> or can be manually finalized now.
            </p>
            <div id="releasedList"></div>
        </div>
        ` : ''}
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('forReleaseList');
        if (listContainer) {
            if (forReleaseRepairs.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No devices ready for pickup</p>';
            } else {
                displayGroupedRepairsList(forReleaseRepairs, listContainer, 'forrelease', 'completedAt');
            }
        }

        const releasedContainer = document.getElementById('releasedList');
        if (releasedContainer && releasedRepairs.length > 0) {
            displayGroupedRepairsList(releasedRepairs, releasedContainer, 'released', 'releasedAt');
        }
    }, 0);
}

/**
 * Build RTO Devices Tab (SHARED - Everyone can access)
 */
function buildRTODevicesTab(container) {
    console.log('↩️ Building RTO Devices tab');
    window.currentTabRefresh = () => buildRTODevicesTab(document.getElementById('rtoTab'));

    const rtoDevices = window.allRepairs.filter(r => r.status === 'RTO' && !r.claimedAt);

    // Sort by RTO date (most recent first)
    rtoDevices.sort((a, b) => new Date(b.rtoDate || b.lastUpdated) - new Date(a.rtoDate || a.lastUpdated));

    container.innerHTML = `
        <div class="card">
            <h3>↩️ Return to Owner - RTO Devices (${rtoDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices that cannot be repaired or customer declined repair</p>
            ${rtoDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <p>No RTO devices at this time</p>
                </div>
            ` : `
                <div id="rtoDevicesList"></div>
            `}
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('rtoDevicesList');
        if (listContainer && rtoDevices.length > 0) {
            displayGroupedRepairsList(rtoDevices, listContainer, 'rto', 'rtoDate');
        }
    }, 0);
}

/**
 * Build Dashboard Tab - Role-Specific Personalized Command Center
 */
function buildDashboardTab(container) {
    console.log('📊 Building Dashboard tab');

    window.currentTabRefresh = () => {
        // Invalidate cache on refresh
        utils.invalidateDashboardCache();
        buildDashboardTab(document.getElementById('dashboardTab'));
    };

    if (!container) {
        console.warn('Container not found for dashboard');
        return;
    }

    const role = window.currentUserData.role;
    const userName = window.currentUserData.displayName;

    // Get cached or fresh stats
    const stats = utils.getCachedDashboardStats(role);

    // Build role-specific dashboard
    let dashboardHTML = '';

    if (role === 'technician') {
        dashboardHTML = buildTechnicianDashboard(userName, stats);
    } else if (role === 'cashier') {
        dashboardHTML = buildCashierDashboard(userName, stats);
    } else if (role === 'manager') {
        dashboardHTML = buildManagerDashboard(userName, stats);
    } else if (role === 'admin') {
        dashboardHTML = buildAdminDashboard(userName, stats);
    }

    container.innerHTML = dashboardHTML;
}

/**
 * Build user-grouped activity feed
 * Groups recent activities by user ID
 */
function buildUserGroupedActivityFeed() {
    const userActivities = {};
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    // Get recent repairs (last 3 days)
    (window.allRepairs || []).forEach(repair => {
        if (repair.deleted) return;

        const createdDate = new Date(repair.createdAt);
        if (createdDate < threeDaysAgo) return;

        // Group by creator
        if (repair.createdBy) {
            if (!userActivities[repair.createdBy]) {
                userActivities[repair.createdBy] = {
                    userName: repair.createdByName || 'Unknown',
                    userId: repair.createdBy,
                    activities: []
                };
            }

            userActivities[repair.createdBy].activities.push({
                type: 'repair_created',
                timestamp: repair.createdAt,
                data: {
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status,
                    repairId: repair.id
                }
            });
        }

        // Group payments by receiver
        if (repair.payments) {
            repair.payments.forEach(payment => {
                const paymentDate = new Date(payment.paymentDate || payment.recordedDate);
                if (paymentDate < threeDaysAgo) return;

                if (payment.receivedById) {
                    if (!userActivities[payment.receivedById]) {
                        userActivities[payment.receivedById] = {
                            userName: payment.receivedByName || 'Unknown',
                            userId: payment.receivedById,
                            activities: []
                        };
                    }

                    userActivities[payment.receivedById].activities.push({
                        type: 'payment_recorded',
                        timestamp: payment.recordedDate || payment.paymentDate,
                        data: {
                            customer: repair.customerName,
                            amount: payment.amount,
                            method: payment.method
                        }
                    });
                }
            });
        }
    });

    // Get recent remittances (last 3 days)
    (window.techRemittances || []).forEach(remittance => {
        const remitDate = new Date(remittance.submittedAt || remittance.date);
        if (remitDate < threeDaysAgo) return;

        if (remittance.techId) {
            if (!userActivities[remittance.techId]) {
                userActivities[remittance.techId] = {
                    userName: remittance.techName || 'Unknown',
                    userId: remittance.techId,
                    activities: []
                };
            }

            userActivities[remittance.techId].activities.push({
                type: 'remittance_submitted',
                timestamp: remittance.submittedAt || remittance.date,
                data: {
                    amount: remittance.actualAmount,
                    status: remittance.status
                }
            });
        }
    });

    // Sort activities within each user by timestamp (most recent first)
    Object.values(userActivities).forEach(userData => {
        userData.activities.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        // Limit to 5 most recent activities per user
        userData.activities = userData.activities.slice(0, 5);
    });

    return userActivities;
}

/**
 * Render a user's activity section
 */
function renderUserActivitySection(userId, userData) {
    const activityTypeIcons = {
        'repair_created': '🔧',
        'payment_recorded': '💰',
        'remittance_submitted': '📤'
    };

    const activityTypeColors = {
        'repair_created': '#667eea',
        'payment_recorded': '#4caf50',
        'remittance_submitted': '#2196f3'
    };

    return `
        <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;overflow:hidden;">
            <!-- User Header (Collapsible) -->
            <div onclick="toggleUserActivitySection('${userId}')" 
                 style="padding:15px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <h4 style="margin:0;font-size:16px;">👤 ${userData.userName}</h4>
                    <p style="margin:5px 0 0 0;font-size:13px;opacity:0.9;">
                        ${userData.activities.length} recent ${userData.activities.length === 1 ? 'activity' : 'activities'}
                    </p>
                </div>
                <span id="toggle-icon-${userId}" style="font-size:20px;transition:transform 0.3s;">▼</span>
            </div>
            
            <!-- Activity List (Collapsible Content) -->
            <div id="user-activities-${userId}" style="padding:15px;display:block;">
                ${userData.activities.map((activity, index) => {
        const icon = activityTypeIcons[activity.type] || '📌';
        const color = activityTypeColors[activity.type] || '#999';

        let activityText = '';
        if (activity.type === 'repair_created') {
            activityText = `Created repair for <strong>${activity.data.customer}</strong> - ${activity.data.device}`;
        } else if (activity.type === 'payment_recorded') {
            activityText = `Recorded payment of <strong>₱${parseFloat(activity.data.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> (${activity.data.method}) from ${activity.data.customer}`;
        } else if (activity.type === 'remittance_submitted') {
            activityText = `Submitted remittance of <strong>₱${parseFloat(activity.data.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> - ${activity.data.status}`;
        }

        return `
                        <div style="display:flex;gap:12px;padding:10px;${index < userData.activities.length - 1 ? 'border-bottom:1px solid var(--border-color);' : ''}">
                            <div style="font-size:24px;flex-shrink:0;">${icon}</div>
                            <div style="flex:1;">
                                <p style="margin:0;font-size:14px;color:var(--text-primary);">${activityText}</p>
                                <p style="margin:5px 0 0 0;font-size:12px;color:var(--text-secondary);">
                                    ${utils.daysAgo(activity.timestamp)}
                                </p>
                            </div>
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-top:6px;flex-shrink:0;"></span>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

/**
 * Toggle user activity section
 */
function toggleUserActivitySection(userId) {
    const content = document.getElementById(`user-activities-${userId}`);
    const icon = document.getElementById(`toggle-icon-${userId}`);

    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
        icon.textContent = '▶';
    }
}

/**
 * Build Receive Device Tab with BACK JOB option
 */
function buildReceiveDeviceTab(container) {
    console.log('📥 Building Receive Device tab');
    window.currentTabRefresh = () => buildReceiveDeviceTab(document.getElementById('receiveTab'));

    // Load suppliers for dropdown if not already loaded
    if (!window.allSuppliers) {
        loadSuppliers().then(() => {
            setTimeout(() => populateReceiveSupplierDropdown(), 100);
        });
    } else {
        // Suppliers already loaded, just populate
        setTimeout(() => populateReceiveSupplierDropdown(), 100);
    }

    // Get list of techs who have worked on repairs (for back jobs)
    const techsWithJobs = {};
    window.allRepairs.forEach(r => {
        if (r.acceptedBy && r.acceptedByName) {
            techsWithJobs[r.acceptedBy] = r.acceptedByName;
        }
    });

    container.innerHTML = `
        <div class="card">
            <h3>➕ Receive Device</h3>
            <p style="color:#666;margin-bottom:20px;">Receive new device from customer - Technician will accept it later</p>
            
            ${generateHelpBox('deviceIntake', getCurrentHelpLanguage())}
            
            <form onsubmit="submitReceiveDevice(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer Type *</label>
                        <select name="customerType" onchange="document.getElementById('shopNameGroupReceive').style.display=this.value==='Dealer'?'block':'none'" required>
                            <option value="">Select</option>
                            <option>Walk-in</option>
                            <option>Dealer</option>
                        </select>
                    </div>
                    <div class="form-group" id="shopNameGroupReceive" style="display:none;">
                        <label>Shop Name *</label>
                        <input type="text" name="shopName" placeholder="Dealer shop name">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer Name *</label>
                        <input type="text" name="customerName" required>
                    </div>
                    <div class="form-group">
                        <label>Contact Number *</label>
                        <input type="text" name="contactNumber" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Brand *</label>
                        <input type="text" name="brand" required placeholder="e.g., Samsung, iPhone, Oppo">
                    </div>
                    <div class="form-group">
                        <label>Model *</label>
                        <input type="text" name="model" required placeholder="e.g., Galaxy S21, iPhone 12">
                    </div>
                </div>
                
                <!-- NEW: DEVICE DETAILS SECTION -->
                <div style="background:var(--bg-light);padding:20px;border-radius:var(--radius-md);margin:20px 0;border-left:4px solid var(--primary);">
                    <h4 style="margin:0 0 15px 0;color:var(--primary);">📱 Device Details</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>IMEI / Serial Number</label>
                            <input type="text" name="imei" placeholder="Enter IMEI or Serial (if available)">
                            <small>Optional - For warranty tracking & identification</small>
                        </div>
                        <div class="form-group">
                            <label>Device Passcode</label>
                            <input type="text" name="devicePasscode" placeholder="Pattern, PIN, or Password">
                            <small>Optional - For testing after repair</small>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Device Color</label>
                            <select name="deviceColor">
                                <option value="N/A">N/A (Unknown/Dead device)</option>
                                <option value="Black">Black</option>
                                <option value="White">White</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Rose Gold">Rose Gold</option>
                                <option value="Space Gray">Space Gray</option>
                                <option value="Blue">Blue</option>
                                <option value="Red">Red</option>
                                <option value="Green">Green</option>
                                <option value="Purple">Purple</option>
                                <option value="Pink">Pink</option>
                                <option value="Yellow">Yellow</option>
                                <option value="Orange">Orange</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Storage Capacity</label>
                            <select name="storageCapacity">
                                <option value="N/A">N/A (Unknown/Dead device)</option>
                                <option value="8GB">8GB</option>
                                <option value="16GB">16GB</option>
                                <option value="32GB">32GB</option>
                                <option value="64GB">64GB</option>
                                <option value="128GB">128GB</option>
                                <option value="256GB">256GB</option>
                                <option value="512GB">512GB</option>
                                <option value="1TB">1TB</option>
                                <option value="2TB">2TB</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Reported Issue / Customer Complaint *</label>
                    <select id="problemType" name="problemType" onchange="handleProblemTypeChange()" required>
                        <option value="">Select what customer reported</option>
                        <optgroup label="🔧 Hardware Issues">
                            <option value="Screen">Screen (Cracked, Lines, Black)</option>
                            <option value="Battery">Battery (Drain, Not Charging, Swollen)</option>
                            <option value="Charging Port">Charging Port</option>
                            <option value="Camera">Camera (Front/Back)</option>
                            <option value="Speaker">Speaker/Microphone</option>
                            <option value="Button">Button (Power, Volume, Home)</option>
                            <option value="Housing">Housing/Body</option>
                            <option value="Water Damage">Water Damage</option>
                            <option value="Motherboard">Motherboard Issue</option>
                        </optgroup>
                        <optgroup label="💻 Software Issues">
                            <option value="FRP Lock">FRP Lock (Google Account)</option>
                            <option value="Password Lock">Password/Pattern Lock</option>
                            <option value="iCloud Lock">iCloud Lock (Apple ID)</option>
                            <option value="Software Restore">Software Restore/Reflash</option>
                            <option value="Virus/Malware">Virus/Malware Removal</option>
                            <option value="OS Update">OS Update/Upgrade</option>
                            <option value="App Issues">App Installation Issues</option>
                            <option value="Slow Performance">Slow Performance/Hang</option>
                            <option value="Data Recovery">Data Recovery</option>
                        </optgroup>
                        <optgroup label="🔄 Other">
                            <option value="Network">Network Issues (WiFi, Signal)</option>
                            <option value="Other Hardware">Other Hardware</option>
                            <option value="Other Software">Other Software</option>
                            <option value="Pending Diagnosis">Pending Diagnosis</option>
                        </optgroup>
                    </select>
                    <small style="color:#666;">What the customer says is wrong with the device</small>
                </div>
                
                <div id="softwareWarningBox" class="alert-warning-compact" style="display:none;margin:10px 0;">
                    <p style="margin:0;"><strong>⚠️ Software Issue Detected</strong></p>
                    <p style="margin:5px 0 0;font-size:14px;">This is a software repair. Make sure to inform customer about data backup and potential data loss.</p>
                </div>
                
                <div id="frpWarningBox" class="alert-danger-compact" style="display:none;margin:10px 0;">
                    <p style="margin:0;"><strong>🔒 FRP/Lock Issue</strong></p>
                    <p style="margin:5px 0 0;font-size:14px;color:#c62828;">Verify customer is the original owner. Request proof of purchase. FRP unlock may not be possible on all devices.</p>
                </div>
                
                <div class="form-group">
                    <label>Detailed Problem Description *</label>
                    <textarea name="problem" id="problemDescription" rows="3" required placeholder="Describe the issue in detail..."></textarea>
                    <small style="color:#666;">Be specific: What happened? When? Any error messages?</small>
                </div>
                
                <div class="form-group">
                    <label>Estimated Repair Cost (₱) (Optional)</label>
                    <input type="number" id="estimatedCost" name="estimatedCost" min="0" step="0.01" value="" placeholder="e.g., 2000">
                    <small style="color:#666;">💡 If you know approximate cost, enter it here. This will cap advance payments customers can make.</small>
                </div>
                
                <div class="form-group">
                    <label>Device Photo (Optional)</label>
                    <input type="file" accept="image/*" id="receivePhoto1" onchange="handlePhotoUpload(this,'receivePreview1')">
                    <div id="receivePreview1" style="display:none;margin-top:10px;"></div>
                </div>
                
                <div id="preApprovalFields" class="alert-success">
                    <p style="margin:0 0 10px;"><strong>💰 Pricing (Optional)</strong></p>
                    <p style="margin:0 0 15px;font-size:13px;color:#666;">
                        If customer has already approved pricing, enter it here. Call suppliers for current quotes.
                    </p>
                    
                    <div class="form-group">
                        <label>Parts Supplier</label>
                        <div style="display:flex;gap:10px;">
                            <select id="receiveSupplier" name="receiveSupplier" style="flex:1;">
                                <option value="">Select supplier (or use stock)</option>
                                <option value="Stock">From Stock (Already Owned)</option>
                                <option value="Customer Provided">Customer Provided</option>
                            </select>
                            <button type="button" onclick="openAddSupplierFromReceive()" class="btn-secondary" style="white-space:nowrap;">
                                ➕ New
                            </button>
                        </div>
                        <small style="color:#666;">Which supplier did you get the quote from?</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Actual Repair Solution</label>
                        <select id="preApprovedRepairType" name="preApprovedRepairType">
                            <option value="">Select actual repair to be performed</option>
                            <option value="Screen Replacement">Screen Replacement</option>
                            <option value="Battery Replacement">Battery Replacement</option>
                            <option value="Charging Port Repair">Charging Port Repair</option>
                            <option value="Camera Replacement">Camera Replacement</option>
                            <option value="Speaker/Mic Repair">Speaker/Mic Repair</option>
                            <option value="Button Repair">Button Repair</option>
                            <option value="Housing Replacement">Housing Replacement</option>
                            <option value="Water Damage Repair">Water Damage Repair</option>
                            <option value="Motherboard Repair">Motherboard Repair</option>
                            <option value="Software Repair">Software Repair</option>
                            <option value="Data Recovery">Data Recovery</option>
                            <option value="Network/Signal Repair">Network/Signal Repair</option>
                            <option value="Other Repair">Other Repair</option>
                        </select>
                        <small style="color:#666;">💡 Auto-suggested based on reported issue (you can change if actual repair differs)</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quoted Parts Cost (₱)</label>
                            <input type="number" id="preApprovedPartsCost" name="preApprovedPartsCost" min="0" step="0.01" value="0" onchange="calculatePreApprovedTotal()">
                            <small style="color:#666;">Price supplier quoted today</small>
                        </div>
                        <div class="form-group">
                            <label>Labor Cost (₱)</label>
                            <input type="number" id="preApprovedLaborCost" name="preApprovedLaborCost" min="0" step="0.01" value="0" onchange="calculatePreApprovedTotal()">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Total Amount (₱)</label>
                        <input type="number" id="preApprovedTotal" name="preApprovedTotal" readonly style="background:#f5f5f5;font-weight:bold;font-size:18px;" value="0.00">
                    </div>
                    
                    <div style="background:#fff9c4;padding:10px;border-radius:5px;margin-top:10px;">
                        <small><strong>ℹ️ Note:</strong> This is the quoted price. Actual cost can be recorded later when parts are purchased (prices may vary daily).</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:10px;">
                        <input type="checkbox" id="isBackJob" onchange="toggleBackJobFields()">
                        <span style="color:#c62828;font-weight:bold;">🔄 This is a BACK JOB (returning for same issue)</span>
                    </label>
                </div>
                
                <div id="backJobFields" class="alert-danger" style="display:none;">
                    <div class="form-group">
                        <label>Assign to Original Technician *</label>
                        <select id="backJobTech" name="backJobTech">
                            <option value="">Select technician who worked on this before</option>
                            ${Object.entries(techsWithJobs).map(([uid, name]) =>
        `<option value="${uid}">${name}</option>`
    ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Back Job Reason *</label>
                        <textarea id="backJobReason" name="backJobReason" rows="2" placeholder="Why is this coming back? (English or Tagalog OK)"></textarea>
                    </div>
                </div>
                
                <div class="alert-info" style="margin:15px 0;">
                    <p style="margin:0;"><strong>ℹ️ Workflow:</strong></p>
                    <ol style="margin:5px 0 0 20px;font-size:14px;">
                        <li><strong>With Pricing:</strong> Device marked as approved → Tech accepts → Starts repair</li>
                        <li><strong>Without Pricing:</strong> Device received → Tech/Owner creates diagnosis → Customer approves → Tech accepts</li>
                    </ol>
                </div>
                
                <!-- Technician Self-Assignment Section (Tech/Admin/Manager only) -->
                <div id="techAcceptSection" style="display:${window.currentUserData.role !== 'cashier' ? 'block' : 'none'};background:#f3e5f5;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #9c27b0;">
                    <h4 style="margin:0 0 12px 0;color:#9c27b0;">🔧 Assign This Repair</h4>
                    
                    <div style="margin-bottom:12px;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;border:2px solid #9c27b0;">
                            <input type="radio" name="assignOption" value="accept-myself" checked onchange="toggleAssignToTech()">
                            <span><strong>✅ Accept this repair myself</strong> (goes to My Jobs immediately)</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom:12px;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;">
                            <input type="radio" name="assignOption" value="assign-other" onchange="toggleAssignToTech()">
                            <span><strong>👤 Assign to specific technician</strong></span>
                        </label>
                        <div id="assignToTechWrapper" style="display:none;margin-left:30px;margin-top:8px;">
                            <select id="assignToTech" style="width:100%;">
                                <option value="">Select technician...</option>
                                ${Object.values(window.allUsers || {}).filter(u => u.role === 'technician' && u.status === 'active').map(u =>
        `<option value="${u.uid}">${u.displayName}</option>`
    ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:0;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;">
                            <input type="radio" name="assignOption" value="pool" onchange="toggleAssignToTech()">
                            <span><strong>📥 Send to Received Devices</strong> (any tech can accept)</span>
                        </label>
                    </div>
                    
                    <small style="display:block;margin-top:10px;color:#666;">
                        💡 <strong>Tip:</strong> Select "Accept myself" to start working immediately!
                    </small>
                </div>
                
                <button type="submit" style="width:100%;background:#4caf50;color:white;font-size:16px;padding:12px;">
                    📥 Receive Device
                </button>
            </form>
        </div>
    `;
}

/**
 * Populate supplier dropdown in receive device form
 */
function populateReceiveSupplierDropdown() {
    const supplierSelect = document.getElementById('receiveSupplier');
    if (!supplierSelect || !window.allSuppliers) return;

    // Clear existing dynamic options (keep first 3: blank, Stock, Customer Provided)
    while (supplierSelect.options.length > 3) {
        supplierSelect.remove(3);
    }

    // Add suppliers from Firebase
    window.allSuppliers.forEach(supplier => {
        const option = new Option(supplier.name, supplier.name);
        supplierSelect.add(option);
    });

    console.log(`✅ Loaded ${window.allSuppliers.length} suppliers into receive form`);
}

/**
 * Build My Requests Tab (for non-admin users)
 */
function buildMyRequestsTab(container) {
    console.log('📝 Building My Requests tab');
    window.currentTabRefresh = () => buildMyRequestsTab(document.getElementById('requestsTab'));

    // Load modification requests for this user
    const myModRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.requestedBy === window.currentUser.uid) : [];
    
    // Load refund requests for this user
    const myRefundRequests = window.refunds ?
        window.refunds.filter(r => r.requestedById === window.currentUser.uid) : [];
    
    const totalRequests = myModRequests.length + myRefundRequests.length;

    container.innerHTML = `
        <div class="card">
            <h3>📝 My Requests (${totalRequests})</h3>
            <p style="color:#666;margin-bottom:15px;">Your modification and refund requests</p>
            
            ${totalRequests === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📭</h2>
                    <p>No requests submitted</p>
                    <p style="font-size:14px;color:#999;">Refund and modification requests will appear here</p>
                </div>
            ` : `
                ${myRefundRequests.length > 0 ? `
                    <h4 style="margin-top:20px;color:#e91e63;">🔄 My Refund Requests (${myRefundRequests.length})</h4>
                    ${myRefundRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).map(refund => {
                        const repair = window.allRepairs.find(r => r.id === refund.repairId);
                        return `
                        <div style="background:${refund.status === 'completed' ? '#e8f5e9' : refund.status === 'rejected' ? '#ffebee' : '#fff3e0'};padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid ${refund.status === 'completed' ? '#4caf50' : refund.status === 'rejected' ? '#f44336' : '#ff9800'};">
                            <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                                <strong>🔄 Refund Request - ₱${refund.refundAmount.toFixed(2)}</strong>
                                <span style="background:${refund.status === 'completed' ? '#4caf50' : refund.status === 'rejected' ? '#f44336' : '#ff9800'};color:white;padding:2px 8px;border-radius:3px;font-size:12px;">
                                    ${refund.status === 'completed' ? '✅ Approved' : refund.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                                </span>
                            </div>
                            <div style="font-size:14px;color:#666;margin-bottom:10px;">
                                <div><strong>Customer:</strong> ${repair ? repair.customerName : 'N/A'}</div>
                                <div><strong>Device:</strong> ${repair ? `${repair.brand} ${repair.model}` : 'N/A'}</div>
                                <div><strong>Reason:</strong> ${refund.refundReason.replace('_', ' ').toUpperCase()}</div>
                                <div><strong>Explanation:</strong> ${refund.refundReasonDetails}</div>
                                <div><strong>Requested:</strong> ${utils.formatDateTime(refund.requestedAt)}</div>
                            </div>
                            ${refund.status !== 'pending_approval' ? `
                                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;font-size:13px;">
                                    <div><strong>${refund.status === 'completed' ? 'Approved' : 'Rejected'} by:</strong> ${refund.completedBy || refund.rejectedBy}</div>
                                    <div><strong>On:</strong> ${utils.formatDateTime(refund.completedAt || refund.rejectedAt)}</div>
                                    ${refund.adminNotes ? `<div><strong>Admin Notes:</strong> ${refund.adminNotes}</div>` : ''}
                                    ${refund.rejectionReason ? `<div><strong>Rejection Reason:</strong> ${refund.rejectionReason}</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `}).join('')}
                ` : ''}
                
                ${myModRequests.length > 0 ? `
                    <h4 style="margin-top:30px;color:#667eea;">📝 My Modification Requests (${myModRequests.length})</h4>
                    ${myModRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).map(req => `
                        <div style="background:${req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffebee' : '#fff3e0'};padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid ${req.status === 'approved' ? '#4caf50' : req.status === 'rejected' ? '#f44336' : '#ff9800'};">
                            <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                                <strong>${req.requestType === 'payment-date' ? '📅 Payment Date Change' : req.requestType === 'recorded-date' ? '🕒 Recorded Date Change' : '📝 Data Modification'}</strong>
                                <span style="background:${req.status === 'approved' ? '#4caf50' : req.status === 'rejected' ? '#f44336' : '#ff9800'};color:white;padding:2px 8px;border-radius:3px;font-size:12px;">
                                    ${req.status === 'approved' ? '✅ Approved' : req.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                                </span>
                            </div>
                            <div style="font-size:14px;color:#666;margin-bottom:10px;">
                                <div><strong>Repair:</strong> ${req.repairDetails || 'N/A'}</div>
                                ${req.oldValue ? `<div><strong>From:</strong> ${req.oldValue}</div>` : ''}
                                ${req.newValue ? `<div><strong>To:</strong> ${req.newValue}</div>` : ''}
                                <div><strong>Reason:</strong> ${req.reason}</div>
                                <div><strong>Requested:</strong> ${utils.formatDateTime(req.requestedAt)}</div>
                            </div>
                            ${req.status !== 'pending' ? `
                                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;font-size:13px;">
                                    <div><strong>${req.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong> ${req.processedByName}</div>
                                    <div><strong>On:</strong> ${utils.formatDateTime(req.processedAt)}</div>
                                    ${req.adminNotes ? `<div><strong>Admin Notes:</strong> ${req.adminNotes}</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                ` : ''}
            `}
        </div>
    `;
}

/**
 * Build Modification Requests Tab (Admin only)
 */
function buildModificationRequestsTab(container) {
    console.log('🔔 Building Modification Requests tab');
    window.currentTabRefresh = () => buildModificationRequestsTab(document.getElementById('mod-requestsTab'));

    // Separate deletion requests from other requests
    const pendingDeletionRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status === 'pending' && r.requestType === 'deletion_request') : [];

    const pendingOtherRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status === 'pending' && r.requestType !== 'deletion_request') : [];

    const totalPending = pendingDeletionRequests.length + pendingOtherRequests.length;

    const processedRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status !== 'pending').slice(0, 20) : [];

    container.innerHTML = `
        <div class="card">
            <h3>🔔 Modification Requests (${totalPending} pending)</h3>
            <p style="color:#666;margin-bottom:15px;">Review and approve/reject modification requests from users</p>
            
            ${totalPending === 0 && processedRequests.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No modification requests</p>
                </div>
            ` : `
                ${pendingDeletionRequests.length > 0 ? `
                    <h4 style="margin-top:20px;color:#d32f2f;">🗑️ PENDING DELETION REQUESTS (${pendingDeletionRequests.length})</h4>
                    ${pendingDeletionRequests.map(req => `
                        <div class="deletion-request-card" style="background:#ffebee;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #d32f2f;">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <strong style="color:#d32f2f;font-size:16px;">🗑️ DELETION REQUEST</strong>
                                <span style="background:#d32f2f;color:white;padding:3px 10px;border-radius:3px;font-size:12px;font-weight:bold;">
                                    ⚠️ REQUIRES APPROVAL
                                </span>
                            </div>
                            <div style="font-size:14px;color:#333;margin-bottom:12px;">
                                <div><strong>Requested by:</strong> ${req.requestedByName}</div>
                                <div><strong>Date:</strong> ${utils.formatDateTime(req.requestedAt)} (${utils.daysAgo(req.requestedAt)})</div>
                            </div>
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:12px;">
                                <div style="font-size:14px;margin-bottom:8px;">
                                    <div><strong>Customer:</strong> ${req.repairDetails.customerName}</div>
                                    <div><strong>Device:</strong> ${req.repairDetails.device}</div>
                                    <div><strong>Status:</strong> <span style="background:#ff9800;color:white;padding:2px 6px;border-radius:3px;font-size:12px;">${req.repairDetails.status}</span></div>
                                    <div><strong>Problem:</strong> ${req.repairDetails.problem}</div>
                                </div>
                            </div>
                            <div style="background:#fff9c4;padding:10px;border-radius:5px;border-left:3px solid #f57c00;margin-bottom:12px;">
                                <strong style="color:#e65100;">Deletion Reason:</strong>
                                <div style="margin-top:5px;color:#333;">${req.reason}</div>
                            </div>
                            <div style="display:flex;gap:10px;">
                                <button onclick="processDeletionRequest('${req.id}', 'approve')" style="background:#d32f2f;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;font-weight:bold;flex:1;">
                                    ✅ Approve Delete
                                </button>
                                <button onclick="processDeletionRequest('${req.id}', 'reject')" style="background:#757575;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;flex:1;">
                                    ❌ Reject Request
                                </button>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${pendingOtherRequests.length > 0 ? `
                    <h4 style="margin-top:20px;">⏳ Other Pending Requests (${pendingOtherRequests.length})</h4>
                    ${pendingOtherRequests.map(req => `
                        <div style="background:#fff3e0;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ff9800;">
                            <div style="margin-bottom:10px;">
                                <strong>${req.requestType === 'payment-date' ? '📅 Payment Date Change' : req.requestType === 'recorded-date' ? '🕒 Recorded Date Change' : '📝 Data Modification'}</strong>
                            </div>
                            <div style="font-size:14px;color:#666;margin-bottom:10px;">
                                <div><strong>Requested by:</strong> ${req.requestedByName} (${req.requestedByRole})</div>
                                <div><strong>Repair:</strong> ${req.repairDetails || 'N/A'}</div>
                                ${req.oldValue ? `<div><strong>From:</strong> ${req.oldValue}</div>` : ''}
                                ${req.newValue ? `<div><strong>To:</strong> ${req.newValue}</div>` : ''}
                                <div><strong>Reason:</strong> ${req.reason}</div>
                                <div><strong>Requested:</strong> ${utils.formatDateTime(req.requestedAt)}</div>
                            </div>
                            <div style="display:flex;gap:10px;">
                                <button onclick="processModificationRequest('${req.id}', 'approve')" style="background:#4caf50;color:white;padding:8px 16px;border:none;border-radius:5px;cursor:pointer;">
                                    ✅ Approve
                                </button>
                                <button onclick="processModificationRequest('${req.id}', 'reject')" style="background:#f44336;color:white;padding:8px 16px;border:none;border-radius:5px;cursor:pointer;">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${processedRequests.length > 0 ? `
                    <h4 style="margin-top:30px;">📋 Recent Processed (Last 20)</h4>
                    ${processedRequests.map(req => `
                        <div style="background:${req.status === 'approved' ? '#e8f5e9' : '#ffebee'};padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${req.status === 'approved' ? '#4caf50' : '#f44336'};">
                            <div style="display:flex;justify-content:space-between;font-size:14px;">
                                <div>
                                    <strong>${req.requestType === 'deletion_request' ? '🗑️' : req.requestType === 'payment-date' ? '📅' : req.requestType === 'recorded-date' ? '🕒' : '📝'} ${req.requestedByName}</strong> - ${req.reason.substring(0, 50)}...
                                </div>
                                <span style="font-size:12px;color:#666;">${utils.formatDate(req.reviewedAt || req.processedAt)}</span>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}
            `}
        </div>
    `;
}

/**
 * Build Refund Requests Tab (Admin/Manager only)
 */
function buildRefundRequestsTab(container) {
    console.log('🔄 Building Refund Requests tab');
    window.currentTabRefresh = () => buildRefundRequestsTab(document.getElementById('refund-requestsTab'));

    const pendingRefunds = (window.refunds || []).filter(r => r.status === 'pending_approval');
    const completedRefunds = (window.refunds || []).filter(r => r.status === 'completed').slice(0, 20);
    const rejectedRefunds = (window.refunds || []).filter(r => r.status === 'rejected').slice(0, 10);

    container.innerHTML = `
        <div class="card">
            <h3>🔄 Refund Requests (${pendingRefunds.length} pending)</h3>
            <p style="color:#666;margin-bottom:15px;">Review and approve/reject refund requests</p>
            
            ${pendingRefunds.length === 0 && completedRefunds.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No refund requests</p>
                </div>
            ` : `
                ${pendingRefunds.length > 0 ? `
                    <h4 style="margin-top:20px;color:#e91e63;">⏳ PENDING REFUND REQUESTS (${pendingRefunds.length})</h4>
                    ${pendingRefunds.map(refund => {
                        const repair = window.allRepairs.find(r => r.id === refund.repairId);
                        const tierColors = {
                            1: { bg: '#e8f5e9', border: '#4caf50', label: 'Low Risk' },
                            2: { bg: '#fff3e0', border: '#ff9800', label: 'Medium Risk' },
                            3: { bg: '#ffebee', border: '#f44336', label: 'High Risk' }
                        };
                        const tier = tierColors[refund.tier] || tierColors[2];
                        
                        return `
                        <div style="background:${tier.bg};padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid ${tier.border};">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <div>
                                    <strong style="color:${tier.border};font-size:16px;">🔄 REFUND REQUEST</strong>
                                    <span style="background:${tier.border};color:white;padding:2px 8px;border-radius:3px;font-size:11px;margin-left:8px;">
                                        ${tier.label}
                                    </span>
                                </div>
                                <span style="background:#ff9800;color:white;padding:3px 10px;border-radius:3px;font-size:12px;font-weight:bold;">
                                    ⏳ PENDING APPROVAL
                                </span>
                            </div>
                            
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:12px;">
                                <div style="font-size:14px;margin-bottom:8px;">
                                    <div><strong>Customer:</strong> ${repair ? repair.customerName : 'N/A'}</div>
                                    <div><strong>Device:</strong> ${repair ? `${repair.brand} ${repair.model}` : 'N/A'}</div>
                                    <div><strong>Repair Status:</strong> ${repair ? repair.status : 'N/A'}</div>
                                </div>
                            </div>
                            
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                                <div style="background:white;padding:10px;border-radius:5px;">
                                    <div style="font-size:12px;color:#666;">Refund Amount</div>
                                    <div style="font-size:20px;font-weight:bold;color:#e91e63;">₱${refund.refundAmount.toFixed(2)}</div>
                                    <div style="font-size:11px;color:#999;">Original: ₱${refund.originalPaymentAmount.toFixed(2)}</div>
                                </div>
                                <div style="background:white;padding:10px;border-radius:5px;">
                                    <div style="font-size:12px;color:#666;">Type & Method</div>
                                    <div style="font-size:14px;font-weight:bold;">${refund.refundType === 'full' ? 'Full Refund' : 'Partial Refund'}</div>
                                    <div style="font-size:12px;color:#666;">${refund.refundMethod}</div>
                                </div>
                            </div>
                            
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:12px;">
                                <div style="font-size:13px;">
                                    <div style="margin-bottom:5px;"><strong>Reason:</strong> <span style="color:#e91e63;">${refund.refundReason.replace('_', ' ').toUpperCase()}</span></div>
                                    <div style="margin-bottom:5px;color:#666;">${refund.refundReasonDetails}</div>
                                    ${refund.notes ? `<div style="margin-top:8px;padding:8px;background:#f5f5f5;border-radius:4px;font-size:12px;"><strong>Additional Notes:</strong> ${refund.notes}</div>` : ''}
                                </div>
                            </div>
                            
                            ${refund.commissionAffected ? `
                                <div style="background:#fff3cd;padding:10px;border-radius:5px;margin-bottom:12px;border-left:3px solid #ffc107;">
                                    <strong>⚠️ Commission Impact:</strong> ₱${refund.commissionToReverse.toFixed(2)} commission reversal for ${refund.technicianName}
                                </div>
                            ` : ''}
                            
                            <div style="font-size:13px;color:#666;margin-bottom:12px;">
                                <div><strong>Requested by:</strong> ${refund.requestedBy}</div>
                                <div><strong>Date:</strong> ${utils.formatDateTime(refund.requestedAt)} (${utils.daysAgo(refund.requestedAt)})</div>
                            </div>
                            
                            <div style="margin-bottom:10px;">
                                <textarea id="adminNotes_${refund.id}" placeholder="Admin notes (optional)..." 
                                          style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;" rows="2"></textarea>
                            </div>
                            
                            <div style="display:flex;gap:10px;">
                                <button onclick="approveRefundRequest('${refund.id}')" 
                                        style="background:#4caf50;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;font-weight:bold;flex:1;">
                                    ✅ Approve Refund
                                </button>
                                <button onclick="rejectRefundRequest('${refund.id}')" 
                                        style="background:#f44336;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;flex:1;">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    `}).join('')}
                ` : ''}
                
                ${completedRefunds.length > 0 ? `
                    <h4 style="margin-top:30px;">✅ Recent Completed Refunds (Last 20)</h4>
                    ${completedRefunds.map(refund => {
                        const repair = window.allRepairs.find(r => r.id === refund.repairId);
                        return `
                        <div style="background:#e8f5e9;padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid #4caf50;">
                            <div style="display:flex;justify-content:space-between;font-size:14px;">
                                <div>
                                    <strong>₱${refund.refundAmount.toFixed(2)}</strong> - ${repair ? repair.customerName : 'N/A'} 
                                    <span style="color:#666;font-size:12px;">(${refund.refundReason.replace('_', ' ')})</span>
                                </div>
                                <span style="font-size:12px;color:#666;">${utils.formatDate(refund.completedAt)}</span>
                            </div>
                            ${refund.adminNotes ? `<div style="font-size:12px;color:#666;margin-top:5px;">Note: ${refund.adminNotes}</div>` : ''}
                        </div>
                    `}).join('')}
                ` : ''}
                
                ${rejectedRefunds.length > 0 ? `
                    <h4 style="margin-top:30px;">❌ Recent Rejected Refunds (Last 10)</h4>
                    ${rejectedRefunds.map(refund => {
                        const repair = window.allRepairs.find(r => r.id === refund.repairId);
                        return `
                        <div style="background:#ffebee;padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid #f44336;">
                            <div style="display:flex;justify-content:space-between;font-size:14px;">
                                <div>
                                    <strong>₱${refund.refundAmount.toFixed(2)}</strong> - ${repair ? repair.customerName : 'N/A'}
                                </div>
                                <span style="font-size:12px;color:#666;">${utils.formatDate(refund.rejectedAt)}</span>
                            </div>
                            <div style="font-size:12px;color:#666;margin-top:5px;">Reason: ${refund.rejectionReason}</div>
                        </div>
                    `}).join('')}
                ` : ''}
            `}
        </div>
    `;
}

// Refund approval handlers
function approveRefundRequest(refundId) {
    const adminNotes = document.getElementById(`adminNotes_${refundId}`)?.value || '';
    
    if (confirm('Approve this refund request?\n\nThis will process the refund immediately.')) {
        window.approveRefund(refundId, adminNotes);
    }
}

function rejectRefundRequest(refundId) {
    const reason = prompt('Enter rejection reason:');
    if (reason && reason.trim()) {
        window.rejectRefund(refundId, reason.trim());
    }
}

function buildUnpaidTab(container) {
    console.log('💳 Building Unpaid tab');
    window.currentTabRefresh = () => buildUnpaidTab(document.getElementById('unpaidTab'));

    const unpaidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) > 0;
    });

    container.innerHTML = `
        <div class="card">
            <h3>💳 Unpaid Repairs (${unpaidRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs with outstanding balance</p>
            <div id="unpaidRepairsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('unpaidRepairsList');
        if (listContainer) {
            displayCompactRepairsList(unpaidRepairs, listContainer);
        }
    }, 0);
}

function buildPendingPaymentsTab(container) {
    console.log('⏳ Building Pending Payments tab');
    window.currentTabRefresh = () => buildPendingPaymentsTab(document.getElementById('pendingTab'));

    const pendingRepairs = window.allRepairs.filter(r =>
        r.payments && r.payments.some(p => !p.verified)
    );

    container.innerHTML = `
        <div class="card">
            <h3>⏳ Pending Payment Verification (${pendingRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Payments waiting for admin/manager approval</p>
            <div id="pendingPaymentsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('pendingPaymentsList');
        if (listContainer) {
            displayCompactRepairsList(pendingRepairs, listContainer);
        }
    }, 0);
}

function buildPaidTab(container) {
    console.log('✅ Building Paid tab');
    window.currentTabRefresh = () => buildPaidTab(document.getElementById('paidTab'));

    const paidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) === 0 && r.total > 0;
    });

    container.innerHTML = `
        <div class="card">
            <h3>✅ Fully Paid Repairs (${paidRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs with no outstanding balance</p>
            <div id="paidRepairsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('paidRepairsList');
        if (listContainer) {
            displayCompactRepairsList(paidRepairs, listContainer);
        }
    }, 0);
}

function buildAllRepairsTab(container) {
    console.log('📋 Building All Repairs tab');

    window.currentTabRefresh = () => {
        buildAllRepairsTab(document.getElementById('allTab'));
    };

    const repairs = window.allRepairs || [];

    container.innerHTML = `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:15px;">
                <h3 style="margin:0;">All Repairs (${repairs.length})</h3>
                <div style="flex:1;max-width:500px;">
                    <input type="text" 
                           id="allRepairsSearchInput" 
                           placeholder="🔍 Search by name, phone, model, problem, or ID..." 
                           style="width:100%;padding:12px 15px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;transition:border-color 0.3s,box-shadow 0.3s;"
                           oninput="filterAllRepairs(this.value)"
                           onfocus="this.style.borderColor='#667eea';this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)'"
                           onblur="this.style.borderColor='#e0e0e0';this.style.boxShadow='none'">
                </div>
            </div>
            <div id="allRepairsStats" style="margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:8px;display:none;">
                <span id="allRepairsSearchStats"></span>
            </div>
            <div id="allRepairsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('allRepairsList');
        if (listContainer) {
            displayGroupedRepairsList(repairs, listContainer, 'all', 'recordedDate');
        }
    }, 0);
}

function displayRepairsInContainer(repairs, container) {
    // Safety check
    if (!container) {
        console.warn('⚠️ Container not found, skipping display');
        return;
    }

    if (!container) {
        console.error('❌ Container is null!');
        return;
    }

    if (!repairs || repairs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No repairs found</p>';
        return;
    }

    const role = window.currentUserData.role;
    const hidePaymentActions = role === 'technician';

    container.innerHTML = repairs.map(r => {
        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;
        const paymentStatus = balance === 0 && r.total > 0 ? 'verified' : (r.payments && r.payments.some(p => !p.verified)) ? 'pending' : 'unpaid';

        return `
            <div class="repair-card">
                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                <span class="status-badge status-${statusClass}">${r.status}</span>
                ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                ${!hidePaymentActions ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                
                <div class="repair-info">
                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                    ${r.imei ? `<div><strong>📱 IMEI/Serial:</strong> ${r.imei}</div>` : ''}
                    ${r.deviceColor && r.deviceColor !== 'N/A' ? `<div><strong>🎨 Color:</strong> ${r.deviceColor}</div>` : ''}
                    ${r.storageCapacity && r.storageCapacity !== 'N/A' ? `<div><strong>💾 Storage:</strong> ${r.storageCapacity}</div>` : ''}
                    ${r.devicePasscode ? `<div><strong>🔐 Passcode:</strong> ${r.devicePasscode}</div>` : ''}
                    <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                    ${r.acceptedBy ? `<div><strong>Technician:</strong> ${r.acceptedByName}</div>` : ''}
                    <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                    <div><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></div>
                    <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-weight:bold;">₱${balance.toFixed(2)}</span></div>
                </div>
                
                <div><strong>Problem:</strong> ${r.problem}</div>
                
                ${r.preRepairChecklist ? `
                    <details style="margin-top:15px;background:var(--bg-light);padding:10px;border-radius:var(--radius-md);">
                        <summary style="cursor:pointer;font-weight:600;color:var(--primary);">📋 Pre-Repair Checklist</summary>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;font-size:13px;">
                            ${r.preRepairChecklist.screen !== 'Not Checked' ? `<div><strong>📱 Screen:</strong> ${r.preRepairChecklist.screen}</div>` : ''}
                            ${r.preRepairChecklist.battery !== 'Not Checked' ? `<div><strong>🔋 Battery:</strong> ${r.preRepairChecklist.battery}</div>` : ''}
                            ${r.preRepairChecklist.buttons !== 'Not Checked' ? `<div><strong>🔘 Buttons:</strong> ${r.preRepairChecklist.buttons}</div>` : ''}
                            ${r.preRepairChecklist.camera !== 'Not Checked' ? `<div><strong>📷 Camera:</strong> ${r.preRepairChecklist.camera}</div>` : ''}
                            ${r.preRepairChecklist.speaker !== 'Not Checked' ? `<div><strong>🔊 Speaker:</strong> ${r.preRepairChecklist.speaker}</div>` : ''}
                            ${r.preRepairChecklist.chargingPort !== 'Not Checked' ? `<div><strong>🔌 Port:</strong> ${r.preRepairChecklist.chargingPort}</div>` : ''}
                            ${r.preRepairChecklist.waterDamage !== 'None' ? `<div><strong>💧 Water:</strong> ${r.preRepairChecklist.waterDamage}</div>` : ''}
                            ${r.preRepairChecklist.physicalDamage !== 'None' ? `<div><strong>🔨 Physical:</strong> ${r.preRepairChecklist.physicalDamage}</div>` : ''}
                            ${r.preRepairChecklist.simCard !== 'Not Checked' ? `<div><strong>📱 SIM:</strong> ${r.preRepairChecklist.simCard}</div>` : ''}
                            ${r.preRepairChecklist.accessories ? `<div style="grid-column:1/-1;"><strong>📦 Accessories:</strong> ${r.preRepairChecklist.accessories}</div>` : ''}
                            ${r.preRepairChecklist.notes ? `<div style="grid-column:1/-1;"><strong>📝 Notes:</strong> ${r.preRepairChecklist.notes}</div>` : ''}
                        </div>
                    </details>
                ` : ''}
                
                ${r.partsUsed && Object.keys(r.partsUsed).length > 0 ? `
                    <details class="alert-success-compact" style="margin-top:15px;">
                        <summary style="cursor:pointer;font-weight:600;">🔧 Parts Used</summary>
                        <div style="margin-top:10px;">
                            ${Object.values(r.partsUsed).map(part => `
                                <div style="display:flex;justify-content:space-between;padding:8px;background:white;border-radius:4px;margin-bottom:5px;">
                                    <div>
                                        <strong>${part.partName}</strong>
                                        <span class="text-secondary" style="font-size:12px;"> (${part.partNumber})</span>
                                        <div style="font-size:12px;color:#666;">
                                            Qty: ${part.quantity} × ₱${part.unitCost.toFixed(2)} = ₱${part.totalCost.toFixed(2)}
                                        </div>
                                        <div style="font-size:11px;color:#999;">
                                            ${part.usedBy} • ${utils.formatDateTime(part.usedAt)}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;text-align:right;">
                                <strong>Total Parts Cost: ₱${Object.values(r.partsUsed).reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </details>
                ` : ''}
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Waiting for Parts') && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openUsePartsModal('${r.id}')" style="background:#2e7d32;color:white;">🔧 Use Parts</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">💵 Parts Cost</button>` : ''}
                    ${role === 'technician' ? `<button class="btn-small" onclick="openExpenseModal('${r.id}')" style="background:#9c27b0;color:white;">💸 Expense</button>` : ''}
                    ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Display repairs grouped by date
 * @param {Array} repairs - Array of repair objects
 * @param {HTMLElement} container - Container element
 * @param {string} context - Display context ('forrelease', 'claimed', 'all', etc.)
 * @param {string} dateField - Field name to group by (e.g., 'completedAt', 'claimedAt', 'recordedDate')
 */
function displayGroupedRepairsList(repairs, container, context = 'default', dateField = 'createdAt') {
    if (!container) {
        console.warn('⚠️ Container not found, skipping display');
        return;
    }

    if (!repairs || repairs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No repairs found</p>';
        return;
    }

    // Group repairs by date
    const groupedByDate = {};
    
    repairs.forEach(r => {
        // Use fallback dates if primary field doesn't exist
        let dateValue = r[dateField] || r.createdAt || r.recordedDate;
        if (!dateValue) return;
        
        // Get date only (no time) - format as "Jan 02, 2026"
        const dateKey = utils.formatDate(dateValue);
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(r);
    });

    // Sort date groups (most recent first)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        const dateA = new Date(groupedByDate[a][0][dateField] || groupedByDate[a][0].createdAt);
        const dateB = new Date(groupedByDate[b][0][dateField] || groupedByDate[b][0].createdAt);
        return dateB - dateA;
    });

    // Render grouped repairs
    const role = window.currentUserData.role;
    
    // Get today's date string for comparison
    const todayDateString = utils.formatDate(new Date());
    
    container.innerHTML = sortedDates.map((dateKey, index) => {
        const repairsInDate = groupedByDate[dateKey];
        
        // Sort repairs within each date group by most recent first
        repairsInDate.sort((a, b) => {
            const dateA = new Date(a[dateField] || a.createdAt || a.recordedDate);
            const dateB = new Date(b[dateField] || b.createdAt || b.recordedDate);
            return dateB - dateA;
        });
        
        const count = repairsInDate.length;
        
        // Calculate days ago for the date group
        const daysAgoText = utils.daysAgo(repairsInDate[0][dateField] || repairsInDate[0].createdAt);
        
        // Check if this is today's date - show expanded by default
        const isToday = dateKey === todayDateString;
        const groupId = `date-group-${index}`; // Use index for unique ID
        
        return `
            <div class="date-group" style="margin-bottom:30px;">
                <div class="date-group-header" 
                     onclick="toggleDateGroup('${groupId}')"
                     style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:15px 20px;border-radius:12px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 12px rgba(102,126,234,0.2);cursor:pointer;user-select:none;">
                    <div>
                        <h4 style="margin:0;font-size:18px;font-weight:600;">${dateKey}${isToday ? ' <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:4px;font-size:13px;">Today</span>' : ''}</h4>
                        <span style="font-size:13px;opacity:0.9;">${daysAgoText}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:rgba(255,255,255,0.25);padding:6px 14px;border-radius:15px;font-size:14px;font-weight:600;">
                            ${count} device${count !== 1 ? 's' : ''}
                        </span>
                        <span class="date-group-toggle-icon" style="font-size:20px;transition:transform 0.3s;">
                            ${isToday ? '▼' : '▶'}
                        </span>
                    </div>
                </div>
                <div class="date-group-items" id="${groupId}" style="padding-left:10px;display:${isToday ? 'block' : 'none'};">
                    ${repairsInDate.map(r => {
                        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
                        const isExpanded = window.expandedRepairId === r.id;
                        const problemPreview = r.problem.length > 60 ? r.problem.substring(0, 60) + '...' : r.problem;
                        
                        return `
                            <div class="repair-list-item-compact ${isExpanded ? 'expanded' : ''}" 
                                 id="repair-item-${r.id}"
                                 data-repair-id="${r.id}"
                                 data-context="${context}">
                                <div class="repair-compact-header" onclick="toggleRepairDetails('${r.id}', '${context}')">
                                    <div class="repair-compact-main">
                                        <div class="repair-compact-title">
                                            <strong>${r.brand} ${r.model}</strong>
                                            <span class="repair-compact-customer">| ${r.customerName}${r.shopName ? ` (${r.shopName})` : ''}</span>
                                        </div>
                                        <div class="repair-compact-badges">
                                            <span class="status-badge status-${statusClass}">${r.status}</span>
                                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                                            ${r.isBackJob && r.suggestedTech === window.currentUser.uid ? '<span class="status-badge" style="background:#ff9800;color:white;">⭐ Your Previous Customer</span>' : ''}
                                            ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : ''}
                                        </div>
                                        <div class="repair-compact-problem">
                                            <strong>Problem:</strong> ${problemPreview}
                                        </div>
                                    </div>
                                    <div class="expand-indicator">
                                        ${isExpanded ? '▲' : '▼'}
                                    </div>
                                </div>
                                
                                <div class="repair-detail-content" style="display:${isExpanded ? 'block' : 'none'};">
                                    ${isExpanded ? renderExpandedRepairDetails(r, role, context) : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Display repairs in searchable format with date grouping (for All Repairs tab)
 * Uses modal instead of expand/collapse
 */
function displaySearchableRepairsList(repairs, container) {
    if (!container) {
        console.warn('⚠️ Container not found');
        return;
    }

    if (!repairs || repairs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No repairs found</p>';
        return;
    }

    // Group repairs by date
    const groupedByDate = {};
    
    repairs.forEach(r => {
        const dateValue = r.recordedDate || r.createdAt;
        if (!dateValue) return;
        
        const dateKey = utils.formatDate(dateValue);
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(r);
    });

    // Sort date groups (most recent first)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        const dateA = new Date(groupedByDate[a][0].recordedDate || groupedByDate[a][0].createdAt);
        const dateB = new Date(groupedByDate[b][0].recordedDate || groupedByDate[b][0].createdAt);
        return dateB - dateA;
    });

    const todayDateString = utils.formatDate(new Date());
    
    container.innerHTML = sortedDates.map((dateKey, index) => {
        const repairsInDate = groupedByDate[dateKey];
        
        repairsInDate.sort((a, b) => {
            const dateA = new Date(a.recordedDate || a.createdAt);
            const dateB = new Date(b.recordedDate || b.createdAt);
            return dateB - dateA;
        });
        
        const count = repairsInDate.length;
        const daysAgoText = utils.daysAgo(repairsInDate[0].recordedDate || repairsInDate[0].createdAt);
        const isToday = dateKey === todayDateString;
        const groupId = `date-group-${index}`;
        
        return `
            <div class="date-group" style="margin-bottom:30px;">
                <div class="date-group-header" 
                     onclick="toggleDateGroup('${groupId}')"
                     style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:15px 20px;border-radius:12px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 12px rgba(102,126,234,0.2);cursor:pointer;user-select:none;">
                    <div>
                        <h4 style="margin:0;font-size:18px;font-weight:600;">${dateKey}${isToday ? ' <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:4px;font-size:13px;">Today</span>' : ''}</h4>
                        <span style="font-size:13px;opacity:0.9;">${daysAgoText}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:rgba(255,255,255,0.25);padding:6px 14px;border-radius:15px;font-size:14px;font-weight:600;">
                            ${count} device${count !== 1 ? 's' : ''}
                        </span>
                        <span class="date-group-toggle-icon" style="font-size:20px;transition:transform 0.3s;">
                            ${isToday ? '▼' : '▶'}
                        </span>
                    </div>
                </div>
                <div class="date-group-items" id="${groupId}" style="padding-left:10px;display:${isToday ? 'block' : 'none'};">
                    ${repairsInDate.map(r => {
                        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
                        const problemPreview = r.problem.length > 60 ? r.problem.substring(0, 60) + '...' : r.problem;
                        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
                        const balance = r.total - totalPaid;
                        
                        return `
                            <div class="repair-list-item-compact searchable-repair-item" 
                                 data-repair-id="${r.id}"
                                 data-customer="${r.customerName.toLowerCase()}"
                                 data-phone="${r.contactNumber}"
                                 data-model="${(r.brand + ' ' + r.model).toLowerCase()}"
                                 data-problem="${r.problem.toLowerCase()}"
                                 onclick="showRepairDetailsModal('${r.id}')"
                                 style="cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;">
                                <div class="repair-compact-header">
                                    <div class="repair-compact-main">
                                        <div class="repair-compact-title">
                                            <strong>${r.brand} ${r.model}</strong>
                                            <span class="repair-compact-customer">| ${r.customerName}${r.shopName ? ` (${r.shopName})` : ''}</span>
                                            <span style="color:#666;font-size:13px;"> • ${r.contactNumber}</span>
                                        </div>
                                        <div class="repair-compact-badges">
                                            <span class="status-badge status-${statusClass}">${r.status}</span>
                                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                                            ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : ''}
                                            ${balance > 0 ? `<span class="status-badge" style="background:#fff3e0;color:#e65100;">₱${balance.toFixed(0)} balance</span>` : '<span class="status-badge" style="background:#e8f5e9;color:#2e7d32;">✓ Paid</span>'}
                                        </div>
                                        <div class="repair-compact-problem">
                                            <strong>Problem:</strong> ${problemPreview}
                                        </div>
                                        ${r.repairType ? `<div style="font-size:13px;color:#666;margin-top:5px;"><strong>Repair:</strong> ${r.repairType}</div>` : ''}
                                    </div>
                                    <div style="color:#667eea;font-size:18px;">›</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter repairs in All Repairs tab based on search query
 */
function filterAllRepairs(query) {
    const searchLower = query.toLowerCase().trim();
    const allItems = document.querySelectorAll('.searchable-repair-item');
    const statsDiv = document.getElementById('allRepairsStats');
    const statsSpan = document.getElementById('allRepairsSearchStats');
    
    if (!searchLower) {
        // Show all items
        allItems.forEach(item => item.style.display = 'block');
        if (statsDiv) statsDiv.style.display = 'none';
        
        // Show/hide empty date groups
        document.querySelectorAll('.date-group').forEach(group => {
            const visibleItems = group.querySelectorAll('.searchable-repair-item[style*="display: block"], .searchable-repair-item:not([style*="display"])');
            group.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
        return;
    }
    
    let matchCount = 0;
    
    allItems.forEach(item => {
        const customer = item.dataset.customer || '';
        const phone = item.dataset.phone || '';
        const model = item.dataset.model || '';
        const problem = item.dataset.problem || '';
        const repairId = item.dataset.repairId || '';
        
        const matches = customer.includes(searchLower) ||
                       phone.includes(searchLower) ||
                       model.includes(searchLower) ||
                       problem.includes(searchLower) ||
                       repairId.includes(searchLower);
        
        item.style.display = matches ? 'block' : 'none';
        if (matches) matchCount++;
    });
    
    // Update stats
    if (statsDiv && statsSpan) {
        statsDiv.style.display = 'block';
        statsSpan.textContent = `Found ${matchCount} repair${matchCount !== 1 ? 's' : ''} matching "${query}"`;
        if (matchCount === 0) {
            statsSpan.innerHTML = `<span style="color:#d32f2f;">No repairs found matching "${query}"</span>`;
        }
    }
    
    // Show/hide empty date groups
    document.querySelectorAll('.date-group').forEach(group => {
        const visibleItems = group.querySelectorAll('.searchable-repair-item[style="display: block;"]');
        group.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
}

/**
 * Toggle visibility of date group items
 * Called when clicking on date group header
 */
function toggleDateGroup(groupId) {
    const itemsDiv = document.getElementById(groupId);
    const header = document.querySelector(`[onclick="toggleDateGroup('${groupId}')"]`);
    
    if (itemsDiv && header) {
        const isHidden = itemsDiv.style.display === 'none';
        itemsDiv.style.display = isHidden ? 'block' : 'none';
        
        // Update arrow icon
        const icon = header.querySelector('.date-group-toggle-icon');
        if (icon) {
            icon.textContent = isHidden ? '▼' : '▶';
        }
    }
}

/**
 * Display repairs in a compact, expandable list format
 * Shows minimal info (brand/model, customer, problem) and expands on click
 */
function displayCompactRepairsList(repairs, container, context = 'default') {
    // Safety check
    if (!container) {
        console.warn('⚠️ Container not found, skipping display');
        return;
    }

    if (!repairs || repairs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No repairs found</p>';
        return;
    }

    // Store context in container dataset for access in toggle function
    container.dataset.context = context;

    const role = window.currentUserData.role;

    container.innerHTML = repairs.map(r => {
        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
        const isExpanded = window.expandedRepairId === r.id;

        // Truncate problem description for compact view
        const problemPreview = r.problem.length > 60 ? r.problem.substring(0, 60) + '...' : r.problem;

        return `
            <div class="repair-list-item-compact ${isExpanded ? 'expanded' : ''}" 
                 id="repair-item-${r.id}"
                 data-repair-id="${r.id}"
                 data-context="${context}">
                <div class="repair-compact-header" onclick="toggleRepairDetails('${r.id}', '${context}')">
                    <div class="repair-compact-main">
                        <div class="repair-compact-title">
                            <strong>${r.brand} ${r.model}</strong>
                            <span class="repair-compact-customer">| ${r.customerName}${r.shopName ? ` (${r.shopName})` : ''}</span>
                        </div>
                        <div class="repair-compact-badges">
                            <span class="status-badge status-${statusClass}">${r.status}</span>
                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                            ${r.isBackJob && r.suggestedTech === window.currentUser.uid ? '<span class="status-badge" style="background:#ff9800;color:white;">⭐ Your Previous Customer</span>' : ''}
                            ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : ''}
                        </div>
                        <div class="repair-compact-problem">
                            <strong>Problem:</strong> ${problemPreview}
                        </div>
                    </div>
                    <div class="expand-indicator">
                        ${isExpanded ? '▲' : '▼'}
                    </div>
                </div>
                
                <div class="repair-detail-content" style="display:${isExpanded ? 'block' : 'none'};">
                    ${isExpanded ? renderExpandedRepairDetails(r, role, context) : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render full details for an expanded repair item
 */
function renderExpandedRepairDetails(repair, role, context = 'default') {
    const r = repair;
    const hidePaymentActions = role === 'technician';
    const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = r.total - totalPaid;
    const paymentStatus = balance === 0 && r.total > 0 ? 'verified' : (r.payments && r.payments.some(p => !p.verified)) ? 'pending' : 'unpaid';

    return `
        <div class="repair-expanded-details">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div style="flex:1;"></div>
                <button onclick="openEditDeviceModal('${r.id}')" class="btn-small" style="background:#2196f3;color:white;padding:5px 10px;font-size:12px;">
                    ✏️ Edit Device Info
                </button>
            </div>
            <div class="repair-info">
                <div><strong>Contact:</strong> ${r.contactNumber}</div>
                <div><strong>📥 Received by:</strong> ${r.receivedBy || 'Unknown'}</div>
                ${r.lastEditedAt ? `<div style="font-size:12px;color:#999;"><em>Last edited: ${utils.formatDateTime(r.lastEditedAt)} by ${r.lastEditedByName}</em></div>` : ''}
                ${r.imei ? `<div><strong>📱 IMEI/Serial:</strong> ${r.imei}</div>` : ''}
                ${r.deviceColor && r.deviceColor !== 'N/A' ? `<div><strong>🎨 Color:</strong> ${r.deviceColor}</div>` : ''}
                ${r.storageCapacity && r.storageCapacity !== 'N/A' ? `<div><strong>💾 Storage:</strong> ${r.storageCapacity}</div>` : ''}
                ${r.devicePasscode ? `<div><strong>🔐 Passcode:</strong> ${r.devicePasscode}</div>` : ''}
                <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                ${r.acceptedBy ? `
                    <div><strong>Technician:</strong> ${r.acceptedByName}
                        ${r.assignmentMethod === 'immediate-accept' ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;margin-left:5px;">⚡ Immediate</span>` : ''}
                        ${r.assignmentMethod === 'assigned-by-receiver' ? `<span style="background:#9c27b0;color:white;padding:2px 6px;border-radius:3px;font-size:11px;margin-left:5px;">👤 Assigned by ${r.assignedBy}</span>` : ''}
                    </div>
                ` : ''}
                <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                ${!hidePaymentActions ? `
                    <div><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></div>
                    <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-weight:bold;">₱${balance.toFixed(2)}</span></div>
                    <span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>
                ` : ''}
            </div>
            
            <div style="margin-top:15px;"><strong>Full Problem Description:</strong><br>${r.problem || r.problemDescription || 'N/A'}</div>
            
            ${r.diagnosisUpdates && r.diagnosisUpdates.length > 0 ? `
                <details class="alert-warning-compact" style="margin-top:15px;">
                    <summary style="cursor:pointer;font-weight:600;">📝 Diagnosis Updates (${r.diagnosisUpdates.length})</summary>
                    <div style="margin-top:10px;">
                        ${r.diagnosisUpdates.map((update, index) => `
                            <div style="background:white;padding:10px;border-radius:5px;margin-bottom:8px;border-left:3px solid #ff9800;">
                                <div style="font-size:12px;color:#666;margin-bottom:5px;">
                                    ${utils.formatDateTime(update.updatedAt)} • ${update.updatedByName}
                                </div>
                                <div style="font-weight:600;color:#e65100;margin-bottom:5px;">
                                    ${update.problemFound}
                                </div>
                                ${update.notes ? `<div style="font-size:13px;color:#666;">${update.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </details>
            ` : ''}
            
            ${r.transferHistory && r.transferHistory.length > 0 ? `
                <details style="margin-top:15px;background:#f3e5f5;padding:10px;border-radius:var(--radius-md);border-left:4px solid #9c27b0;">
                    <summary style="cursor:pointer;font-weight:600;color:#9c27b0;">🔄 Transfer History (${r.transferHistory.length})</summary>
                    <div style="margin-top:10px;">
                        ${r.transferHistory.map((transfer, index) => `
                            <div style="background:white;padding:10px;border-radius:5px;margin-bottom:8px;border-left:3px solid #9c27b0;">
                                <div style="font-size:12px;color:#666;margin-bottom:5px;">
                                    ${utils.formatDateTime(transfer.transferredAt)} • by ${transfer.transferredByName}
                                </div>
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-weight:600;">
                                    <span>${transfer.fromTechName}</span>
                                    <span style="color:#9c27b0;">→</span>
                                    <span>${transfer.toTechName}</span>
                                </div>
                                <div style="font-size:13px;color:#666;margin-bottom:3px;">
                                    <strong>Reason:</strong> ${transfer.reason}
                                </div>
                                ${transfer.notes ? `<div style="font-size:13px;color:#666;"><strong>Notes:</strong> ${transfer.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </details>
            ` : ''}
            
            ${r.quotedSupplier ? `
                <div class="alert-neutral" style="margin-top:15px;padding:12px;">
                    <h4 style="margin:0 0 10px 0;">💰 Parts Pricing</h4>
                    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;font-size:14px;">
                        <strong>Quoted:</strong>
                        <span>${r.quotedSupplier}</span>
                        <span>₱${r.quotedPartsCost.toFixed(2)}</span>
                        
                        ${r.actualPartsCost ? `
                            <strong>Actual:</strong>
                            <span>${r.actualSupplier}</span>
                            <span style="color:${r.costVariance > 0 ? '#f44336' : r.costVariance < 0 ? '#4caf50' : '#666'};">
                                ₱${r.actualPartsCost.toFixed(2)}
                                ${r.costVariance !== 0 ? `(${r.costVariance > 0 ? '+' : ''}₱${r.costVariance.toFixed(2)})` : ''}
                            </span>
                        ` : `
                            <em style="grid-column:2/4;color:#999;">Actual cost not yet recorded</em>
                        `}
                    </div>
                </div>
            ` : r.partsCostSupplier ? `
                <div style="margin-top:15px;"><strong>📦 Parts Supplier:</strong> ${r.partsCostSupplier}</div>
            ` : ''}
            
            ${context === 'rto' ? renderRTOSpecificInfo(r) : ''}
            
            ${r.preRepairChecklist ? `
                <details style="margin-top:15px;background:var(--bg-light);padding:10px;border-radius:var(--radius-md);">
                    <summary style="cursor:pointer;font-weight:600;color:var(--primary);">📋 Pre-Repair Checklist</summary>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;font-size:13px;">
                        ${r.preRepairChecklist.screen !== 'Not Checked' ? `<div><strong>📱 Screen:</strong> ${r.preRepairChecklist.screen}</div>` : ''}
                        ${r.preRepairChecklist.battery !== 'Not Checked' ? `<div><strong>🔋 Battery:</strong> ${r.preRepairChecklist.battery}</div>` : ''}
                        ${r.preRepairChecklist.buttons !== 'Not Checked' ? `<div><strong>🔘 Buttons:</strong> ${r.preRepairChecklist.buttons}</div>` : ''}
                        ${r.preRepairChecklist.camera !== 'Not Checked' ? `<div><strong>📷 Camera:</strong> ${r.preRepairChecklist.camera}</div>` : ''}
                        ${r.preRepairChecklist.speaker !== 'Not Checked' ? `<div><strong>🔊 Speaker:</strong> ${r.preRepairChecklist.speaker}</div>` : ''}
                        ${r.preRepairChecklist.chargingPort !== 'Not Checked' ? `<div><strong>🔌 Port:</strong> ${r.preRepairChecklist.chargingPort}</div>` : ''}
                        ${r.preRepairChecklist.waterDamage !== 'None' ? `<div><strong>💧 Water:</strong> ${r.preRepairChecklist.waterDamage}</div>` : ''}
                        ${r.preRepairChecklist.physicalDamage !== 'None' ? `<div><strong>🔨 Physical:</strong> ${r.preRepairChecklist.physicalDamage}</div>` : ''}
                        ${r.preRepairChecklist.simCard !== 'Not Checked' ? `<div><strong>📱 SIM:</strong> ${r.preRepairChecklist.simCard}</div>` : ''}
                        ${r.preRepairChecklist.accessories ? `<div style="grid-column:1/-1;"><strong>📦 Accessories:</strong> ${r.preRepairChecklist.accessories}</div>` : ''}
                        ${r.preRepairChecklist.notes ? `<div style="grid-column:1/-1;"><strong>📝 Notes:</strong> ${r.preRepairChecklist.notes}</div>` : ''}
                    </div>
                </details>
            ` : ''}
            
            ${r.partsUsed && Object.keys(r.partsUsed).length > 0 ? `
                <details class="alert-success-compact" style="margin-top:15px;">
                    <summary style="cursor:pointer;font-weight:600;">🔧 Parts Used</summary>
                    <div style="margin-top:10px;">
                        ${Object.values(r.partsUsed).map(part => `
                            <div style="display:flex;justify-content:space-between;padding:8px;background:white;border-radius:4px;margin-bottom:5px;">
                                <div>
                                    <strong>${part.partName}</strong>
                                    <span class="text-secondary" style="font-size:12px;"> (${part.partNumber})</span>
                                    <div style="font-size:12px;color:#666;">
                                        Qty: ${part.quantity} × ₱${part.unitCost.toFixed(2)} = ₱${part.totalCost.toFixed(2)}
                                    </div>
                                    <div style="font-size:11px;color:#999;">
                                        ${part.usedBy} • ${utils.formatDateTime(part.usedAt)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;text-align:right;">
                            <strong>Total Parts Cost: ₱${Object.values(r.partsUsed).reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}</strong>
                        </div>
                    </div>
                </details>
            ` : ''}
            
            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                ${renderContextButtons(r, role, context)}
            </div>
        </div>
    `;
}

/**
 * Render RTO-specific information
 */
function renderRTOSpecificInfo(r) {
    const rtoDate = r.rtoDate || r.lastUpdated;
    const daysSinceRTO = Math.floor((new Date() - new Date(rtoDate)) / (1000 * 60 * 60 * 24));
    const diagnosisFee = r.diagnosisFee || 0;
    const rtoPaymentStatus = r.rtoPaymentStatus || 'waived';
    const hasFee = diagnosisFee > 0;
    const isPaid = rtoPaymentStatus === 'paid' || rtoPaymentStatus === 'waived';

    return `
        ${r.rtoReason ? `
            <div class="alert-warning-compact" style="margin:15px 0;">
                <strong>↩️ RTO Reason:</strong> ${r.rtoReason}
                ${r.rtoNotes ? `<div style="margin-top:8px;font-size:13px;color:#666;"><strong>Notes:</strong> ${r.rtoNotes}</div>` : ''}
            </div>
        ` : ''}
        
        <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin:15px 0;">
            <div style="font-size:14px;color:#666;">
                <div><strong>Set to RTO:</strong> ${utils.formatDateTime(rtoDate)} (${daysSinceRTO} day${daysSinceRTO !== 1 ? 's' : ''} ago)</div>
                ${r.rtoSetByName ? `<div><strong>Set by:</strong> ${r.rtoSetByName}</div>` : ''}
            </div>
        </div>
        
        ${hasFee ? `
            <div style="background:${isPaid ? '#e8f5e9' : '#ffebee'};padding:12px;border-radius:8px;margin:15px 0;border-left:4px solid ${isPaid ? '#4caf50' : '#f44336'};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;">💵 Diagnosis Fee:</span>
                    <span style="font-size:18px;font-weight:700;color:${isPaid ? '#2e7d32' : '#c62828'};">
                        ₱${diagnosisFee.toFixed(2)} ${isPaid ? '✅ PAID' : '⚠️ UNPAID'}
                    </span>
                </div>
                ${r.rtoPaymentDate ? `<div style="font-size:13px;color:#666;margin-top:5px;"><strong>Paid:</strong> ${utils.formatDateTime(r.rtoPaymentDate)}</div>` : ''}
            </div>
        ` : `
            <div style="background:#f1f8e9;padding:12px;border-radius:8px;margin:15px 0;text-align:center;border-left:4px solid #7cb342;">
                <span style="color:#558b2f;font-weight:600;">✅ No diagnosis fee charged</span>
            </div>
        `}
    `;
}

/**
 * Render context-specific action buttons based on repair context
 */
function renderContextButtons(repair, role, context) {
    switch (context) {
        case 'received':
            return renderReceivedDeviceButtons(repair, role);
        case 'rto':
            return renderRTODeviceButtons(repair, role);
        case 'forrelease':
            return renderForReleaseButtons(repair, role);
        case 'released':
            return renderReleasedButtons(repair, role);
        case 'claimed':
            return renderClaimedButtons(repair, role);
        default:
            return renderStandardButtons(repair, role);
    }
}

/**
 * Render standard action buttons (default context)
 */
function renderStandardButtons(r, role) {
    const hidePaymentActions = role === 'technician';

    // Check if there's a pending deletion request for this repair
    const hasPendingDeletion = window.allModificationRequests.some(
        req => req.repairId === r.id &&
            req.requestType === 'deletion_request' &&
            req.status === 'pending'
    );

    // Show delete request button for technician on their own repairs
    const canRequestDelete = role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed' &&
        !hasPendingDeletion;

    return `
        ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
        ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
        ${r.acceptedBy && (role === 'admin' || role === 'manager' || role === 'technician') ? `<button class="btn-small" onclick="openUpdateDiagnosisModal('${r.id}')" style="background:#667eea;color:white;">📝 Update Diagnosis</button>` : ''}
        ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
        ${(r.status === 'In Progress' || r.status === 'Waiting for Parts') && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openUsePartsModal('${r.id}')" style="background:#2e7d32;color:white;">🔧 Use Parts</button>` : ''}
        ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">💵 Parts Cost</button>` : ''}
        ${role === 'technician' ? `<button class="btn-small" onclick="openExpenseModal('${r.id}')" style="background:#9c27b0;color:white;">💸 Expense</button>` : ''}
        ${r.acceptedBy && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openTransferRepairModal('${r.id}')" style="background:#9c27b0;color:white;">🔄 Transfer</button>` : ''}
        ${canRequestDelete ? `<button class="btn-small" onclick="requestRepairDeletion('${r.id}')" style="background:#dc3545;color:white;">🗑️ Request Delete</button>` : ''}
        ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
    `;
}

/**
 * Render buttons for For Release context (Ready for Pickup devices)
 */
function renderForReleaseButtons(r, role) {
    const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = r.total - totalPaid;
    const isFullyPaid = balance <= 0;

    let buttons = '';

    // Payment button if not fully paid (not for technicians who will collect during release)
    if (!isFullyPaid && role !== 'technician') {
        buttons += `
            <button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">
                💰 Record Payment
            </button>
        `;
    }

    // Release button - ALL roles can ALWAYS release (payment collection happens during release)
    buttons += `
        <button class="btn-small btn-success" onclick="openReleaseDeviceModal('${r.id}')" style="background:#2e7d32;color:white;font-weight:bold;">
            ✅ Release to Customer${!isFullyPaid ? ' (Collect Payment)' : ''}
        </button>
    `;

    // Show balance warning if unpaid
    if (!isFullyPaid) {
        buttons += `
            <span style="display:block;margin-top:5px;color:#f44336;font-size:12px;font-weight:600;">
                ⚠️ Outstanding Balance: ₱${balance.toFixed(2)} - Will collect during release
            </span>
        `;
    }

    // Additional action buttons for authorized roles
    if (role === 'technician' || role === 'admin' || role === 'manager') {
        buttons += `
            <button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">
                💵 Parts Cost
            </button>
        `;
    }

    // Status update button
    if (role === 'admin' || role === 'manager' || role === 'technician') {
        buttons += `
            <button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">
                📝 Update Status
            </button>
        `;
    }

    // Technician delete request button
    const hasPendingDeletion = window.allModificationRequests.some(
        req => req.repairId === r.id &&
            req.requestType === 'deletion_request' &&
            req.status === 'pending'
    );

    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed' &&
        !hasPendingDeletion) {
        buttons += `
            <button class="btn-small" onclick="requestRepairDeletion('${r.id}')" style="background:#dc3545;color:white;">
                🗑️ Request Delete
            </button>
        `;
    }

    // Admin delete button
    if (role === 'admin') {
        buttons += `
            <button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">
                🗑️ Delete
            </button>
        `;
    }

    return buttons;
}

/**
 * Render buttons for Released context (devices handed to customer but not yet finalized)
 */
function renderReleasedButtons(r, role) {
    let buttons = '';

    // Show countdown timer
    if (r.releasedAt && window.getCountdownTo6PM) {
        const countdown = window.getCountdownTo6PM(r.releasedAt);
        buttons += `
            <div style="background:#fff3cd;padding:10px;border-radius:6px;margin-bottom:10px;border-left:3px solid #ffc107;">
                <span style="color:#856404;font-weight:600;font-size:13px;">
                    ⏱️ ${countdown}
                </span>
            </div>
        `;
    }

    // Payment button (for unpaid/partially paid devices)
    const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = r.total - totalPaid;
    const hidePaymentActions = role === 'technician';

    if (!hidePaymentActions && r.total > 0 && balance > 0) {
        buttons += `
            <button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">
                💰 Payment (₱${balance.toFixed(2)})
            </button>
        `;
    }

    // Finalize button (all roles can finalize)
    buttons += `
        <button class="btn-small btn-success" onclick="finalizeClaimDevice('${r.id}', false)" 
                style="background:#4caf50;color:white;font-weight:bold;">
            ⚡ Finalize Now
        </button>
    `;

    // View details button
    buttons += `
        <button class="btn-small" onclick="viewClaimDetails('${r.id}')" 
                style="background:#2196f3;color:white;">
            📄 View Details
        </button>
    `;

    // Status update button for authorized roles
    if (role === 'admin' || role === 'manager' || role === 'technician') {
        buttons += `
            <button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">
                📝 Update Status
            </button>
        `;
    }

    // Admin delete button
    if (role === 'admin') {
        buttons += `
            <button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">
                🗑️ Delete
            </button>
        `;
    }

    return buttons;
}

/**
 * Render buttons for Claimed Units context
 */
function renderClaimedButtons(r, role) {
    let buttons = '';

    // Payment button (for unpaid/partially paid devices)
    const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = r.total - totalPaid;
    const hidePaymentActions = role === 'technician';

    if (!hidePaymentActions && r.total > 0 && balance > 0) {
        buttons += `
            <button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">
                💰 Payment (₱${balance.toFixed(2)})
            </button>
        `;
    }
    
    // View Payments button - Show for ALL roles to view payment history and request refunds
    // Technicians can request refunds, others can directly refund
    // ALSO show if device has balance but no payments (to record missing payment)
    if ((r.payments || []).length > 0 || (r.total > 0 && totalPaid === 0)) {
        const buttonText = (r.payments || []).length > 0 ? '💳 View Payments' : '💰 Record Missing Payment';
        const buttonColor = (r.payments || []).length > 0 ? '#667eea' : '#ff9800';
        buttons += `
            <button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:${buttonColor};color:white;">
                ${buttonText}
            </button>
        `;
    }

    // Warranty claim button (admin/manager only)
    if (role === 'admin' || role === 'manager') {
        const warrantyActive = r.warrantyEndDate && new Date(r.warrantyEndDate) > new Date();
        if (warrantyActive) {
            buttons += `
                <button class="btn-small" onclick="openWarrantyClaimModal('${r.id}')" 
                        style="background:#ff9800;color:white;">
                    🛡️ Warranty Claim
                </button>
            `;
        }
    }

    // View claim details button
    buttons += `
        <button class="btn-small" onclick="viewClaimDetails('${r.id}')" 
                style="background:#2196f3;color:white;">
            📄 View Details
        </button>
    `;

    // Technician delete request button
    const hasPendingDeletion = window.allModificationRequests.some(
        req => req.repairId === r.id &&
            req.requestType === 'deletion_request' &&
            req.status === 'pending'
    );

    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        !hasPendingDeletion) {
        buttons += `
            <button class="btn-small" onclick="requestRepairDeletion('${r.id}')" style="background:#dc3545;color:white;">
                🗑️ Request Delete
            </button>
        `;
    }

    // Admin tools
    if (role === 'admin') {
        buttons += `
            <button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">
                🗑️ Delete
            </button>
        `;
    }

    return buttons;
}

/**
 * Render buttons for Received Devices (workflow context)
 */
function renderReceivedDeviceButtons(r, role) {
    const canAccept = (role === 'admin' || role === 'manager' || role === 'technician');
    let buttons = '';

    // Always show Edit Details button for all roles (to fix input errors)
    buttons += `
        <button class="btn-small" onclick="openEditReceivedDetails('${r.id}')" style="background:#ff9800;color:white;">
            ✏️ Edit Details
        </button>
    `;

    // If no diagnosis created yet
    if (!r.diagnosisCreated || r.repairType === 'Pending Diagnosis') {
        if (role === 'admin' || role === 'manager' || role === 'technician') {
            buttons += `
                <button class="btn-small btn-primary" onclick="openEditRepairModal('${r.id}')" style="background:#667eea;color:white;">
                    📋 Create Diagnosis
                </button>
            `;
        }
        return buttons;
    }

    // Diagnosis created - check approval status
    if (r.status === 'Pending Customer Approval') {
        // Show approval button for admin/manager/cashier
        if (role === 'admin' || role === 'manager' || role === 'cashier') {
            buttons += `
                <button class="btn-small btn-success" onclick="approveDiagnosis('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                    ✅ Mark Customer Approved
                </button>
            `;
        }
        return buttons;
    }

    // Customer approved - show accept or approval button
    if (r.customerApproved && canAccept) {
        buttons += `
            <button class="btn-small btn-success" onclick="openAcceptRepairModal('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                ✅ Accept This Repair
            </button>
        `;
    } else if (!r.customerApproved && (role === 'admin' || role === 'manager' || role === 'cashier')) {
        buttons += `
            <button class="btn-small btn-success" onclick="approveDiagnosis('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                ✅ Mark Customer Approved
            </button>
        `;
    }

    // Technician delete request button
    const hasPendingDeletion = window.allModificationRequests.some(
        req => req.repairId === r.id &&
            req.requestType === 'deletion_request' &&
            req.status === 'pending'
    );

    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed' &&
        !hasPendingDeletion) {
        buttons += `
            <button class="btn-small" onclick="requestRepairDeletion('${r.id}')" style="background:#dc3545;color:white;">
                🗑️ Request Delete
            </button>
        `;
    }

    return buttons;
}

/**
 * Render buttons for RTO Devices (RTO context)
 */
function renderRTODeviceButtons(r, role) {
    const diagnosisFee = r.diagnosisFee || 0;
    const rtoPaymentStatus = r.rtoPaymentStatus || 'waived';
    const hasFee = diagnosisFee > 0;
    const isPaid = rtoPaymentStatus === 'paid' || rtoPaymentStatus === 'waived';

    const canRelease = ['admin', 'manager', 'cashier'].includes(role);
    const canAddFee = ['admin', 'manager', 'cashier'].includes(role);
    const canRevertStatus = role === 'admin';

    let buttons = '';

    // Collect fee button (if unpaid)
    if (canAddFee && hasFee && !isPaid) {
        buttons += `
            <button onclick="collectRTODiagnosisFee('${r.id}')" class="btn btn-primary" style="flex:1;min-width:150px;">
                💰 Collect Fee
            </button>
        `;
    }

    // Add diagnosis fee button (if no fee)
    if (canAddFee && !hasFee) {
        buttons += `
            <button onclick="addRTODiagnosisFee('${r.id}')" class="btn btn-secondary" style="flex:1;min-width:150px;">
                💵 Add Diagnosis Fee
            </button>
        `;
    }

    // Return to customer button (if paid or no fee)
    if (canRelease && (!hasFee || isPaid)) {
        buttons += `
            <button onclick="releaseRTODevice('${r.id}')" class="btn btn-success" style="flex:1;min-width:200px;font-weight:bold;">
                ↩️ Return to Customer
            </button>
        `;
    }

    // Disabled button if fee not paid
    if (canRelease && hasFee && !isPaid) {
        buttons += `
            <button class="btn btn-secondary" disabled style="flex:1;min-width:200px;">
                ⚠️ Collect Fee First
            </button>
        `;
    }

    // Revert status button (admin only)
    if (canRevertStatus) {
        buttons += `
            <button onclick="revertRTOStatus('${r.id}')" class="btn btn-warning" style="padding:10px 15px;">
                🔄 Revert to In Progress
            </button>
        `;
    }

    // Technician delete request button
    const hasPendingDeletion = window.allModificationRequests.some(
        req => req.repairId === r.id &&
            req.requestType === 'deletion_request' &&
            req.status === 'pending'
    );

    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed' &&
        !hasPendingDeletion) {
        buttons += `
            <button class="btn-small" onclick="requestRepairDeletion('${r.id}')" style="background:#dc3545;color:white;padding:10px 15px;">
                🗑️ Request Delete
            </button>
        `;
    }

    return buttons;
}

/**
 * Toggle repair details expansion/collapse
 */
function toggleRepairDetails(repairId, context = 'default') {
    console.log('🔄 toggleRepairDetails called:', { repairId, context });
    
    // Get the repair item
    const repairItem = document.getElementById(`repair-item-${repairId}`);
    if (!repairItem) {
        console.warn('⚠️ Repair item not found:', repairId);
        return;
    }

    // Get context from data attribute if not provided
    if (context === 'default' && repairItem.dataset.context) {
        context = repairItem.dataset.context;
    }

    // Check if this item is already expanded
    const isCurrentlyExpanded = window.expandedRepairId === repairId;
    console.log('📊 Current state:', { 
        isCurrentlyExpanded, 
        windowExpandedId: window.expandedRepairId 
    });

    // Collapse all items first
    document.querySelectorAll('.repair-list-item-compact').forEach(item => {
        item.classList.remove('expanded');
        const detailContent = item.querySelector('.repair-detail-content');
        if (detailContent) detailContent.style.display = 'none';
        const indicator = item.querySelector('.expand-indicator');
        if (indicator) indicator.textContent = '▼';
    });

    // If was not expanded, expand it
    if (!isCurrentlyExpanded) {
        console.log('✅ Expanding repair:', repairId);
        window.expandedRepairId = repairId;
        repairItem.classList.add('expanded');

        const detailContent = repairItem.querySelector('.repair-detail-content');
        if (detailContent) {
            // If content is empty, render it
            if (!detailContent.innerHTML.trim()) {
                console.log('📝 Rendering content for:', repairId);
                const repair = window.allRepairs.find(r => r.id === repairId);
                const role = window.currentUserData.role;
                if (repair) {
                    detailContent.innerHTML = renderExpandedRepairDetails(repair, role, context);
                }
            }
            // FORCE visible - bypass CSS animation completely
            detailContent.style.display = 'block';
            detailContent.style.opacity = '1';
            detailContent.style.maxHeight = 'none';
            detailContent.style.animation = 'none';
            console.log('✅ STYLES SET:', {
                display: detailContent.style.display,
                opacity: detailContent.style.opacity,
                maxHeight: detailContent.style.maxHeight,
                animation: detailContent.style.animation
            });
        }

        const indicator = repairItem.querySelector('.expand-indicator');
        if (indicator) indicator.textContent = '▲';

        // Scroll into view smoothly
        setTimeout(() => {
            repairItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        // Collapsed - clear the expanded ID
        window.expandedRepairId = null;
    }
}

function buildMyRepairsTab(container) {
    console.log('🔧 Building My Repairs tab');
    window.currentTabRefresh = () => buildMyRepairsTab(document.getElementById('myTab'));

    const myRepairs = window.allRepairs.filter(r =>
        r.acceptedBy === window.currentUser.uid &&
        r.status !== 'Claimed' &&
        r.status !== 'Released'
    );

    container.innerHTML = `
        <div class="card">
            <h3>🔧 My Jobs (${myRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs you have accepted</p>
            <div id="myRepairsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('myRepairsList');
        if (listContainer) {
            displayGroupedRepairsList(myRepairs, listContainer, 'default', 'recordedDate');
        }
    }, 0);
}

/**
 * Build My Claimed Devices Tab (Technician Only)
 * Shows Released + Claimed devices repaired by this technician
 */
function buildMyClaimedDevicesTab(container) {
    const dateFilter = window.currentDateFilter || null;
    console.log('✅ Building My Claimed Devices tab', dateFilter ? `(Filter: ${dateFilter})` : '');
    window.currentTabRefresh = () => buildMyClaimedDevicesTab(document.getElementById('myclaimedTab'));

    const techId = window.currentUser.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter: Devices where this tech did the repair
    const myReleasedDevices = window.allRepairs.filter(r =>
        r.acceptedBy === techId &&
        r.status === 'Released' &&
        !r.deleted
    );

    let myClaimedDevices = window.allRepairs.filter(r =>
        r.acceptedBy === techId &&
        r.status === 'Claimed' &&
        !r.deleted
    );

    // Apply date filter if specified
    if (dateFilter === 'today') {
        myClaimedDevices = myClaimedDevices.filter(r => {
            if (!r.completedAt) return false;
            const completedDate = new Date(r.completedAt);
            return completedDate >= today;
        });
    }

    // Sort by most recent first
    myReleasedDevices.sort((a, b) => new Date(b.releasedAt || b.releaseDate) - new Date(a.releasedAt || a.releaseDate));
    myClaimedDevices.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 style="margin:0;">✅ My Claimed Devices</h2>
                <p style="margin:5px 0 0;color:var(--text-secondary);">
                    Devices I successfully repaired - Released and Claimed
                </p>
                ${dateFilter === 'today' ? `
                    <div style="margin-top:15px;padding:12px;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3;display:flex;justify-content:space-between;align-items:center;">
                        <span><strong>📅 Showing:</strong> Completed Today</span>
                        <button onclick="switchTab('myclaimed')" class="btn btn-secondary" style="padding:6px 12px;font-size:13px;">
                            📋 Show All Devices
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Released - Awaiting Finalization Section -->
            ${myReleasedDevices.length > 0 ? `
                <div style="margin-bottom:30px;">
                    <h3 style="margin:20px 0 15px;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
                        <span>📦 Released - Awaiting Finalization</span>
                        <span style="background:#ff9800;color:white;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:bold;">
                            ${myReleasedDevices.length}
                        </span>
                    </h3>
                    <div style="background:#fff3e0;padding:15px;border-radius:8px;margin-bottom:15px;border-left:4px solid #ff9800;">
                        <strong>⏰ Auto-Finalize:</strong> These devices will automatically move to "Claimed" at 6:00 PM Manila time.
                        <br><strong>💡 Tip:</strong> You can finalize now and optionally collect payment.
                    </div>
                    <div id="myReleasedDevicesList"></div>
                </div>
            ` : ''}

            <!-- Claimed Devices Section -->
            <div>
                <h3 style="margin:20px 0 15px;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
                    <span>✅ Claimed - Completed Repairs</span>
                    <span style="background:#4caf50;color:white;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:bold;">
                        ${myClaimedDevices.length}
                    </span>
                </h3>
                ${myClaimedDevices.length === 0 ? `
                    <div class="empty-state">
                        <div style="font-size:48px;margin-bottom:10px;">✅</div>
                        <p>No claimed devices yet</p>
                        <p style="color:var(--text-secondary);font-size:14px;">
                            Devices appear here after they are released and finalized
                        </p>
                    </div>
                ` : `
                    <div id="myClaimedDevicesList"></div>
                `}
            </div>
        </div>
    `;

    // Render lists after DOM update
    setTimeout(() => {
        if (myReleasedDevices.length > 0) {
            const releasedListContainer = document.getElementById('myReleasedDevicesList');
            displayGroupedRepairsList(myReleasedDevices, releasedListContainer, 'released', 'releasedAt');
        }
        if (myClaimedDevices.length > 0) {
            const claimedListContainer = document.getElementById('myClaimedDevicesList');
            displayGroupedRepairsList(myClaimedDevices, claimedListContainer, 'claimed', 'completedAt');
        }
    }, 0);
}

function buildPendingTab(container) {
    console.log('⏳ Building Pending tab');
    window.currentTabRefresh = () => buildPendingTab(document.getElementById('pendingTab'));

    const pendingRepairs = window.allRepairs.filter(r =>
        r.payments && r.payments.some(p => !p.verified)
    );

    container.innerHTML = `
        <div class="card">
            <h3>⏳ Pending Verification (${pendingRepairs.length})</h3>
            <div id="pendingRepairsList"></div>
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('pendingRepairsList');
        if (listContainer) {
            displayCompactRepairsList(pendingRepairs, listContainer);
        }
    }, 0);
}

function buildCashCountTab(container) {
    console.log('💵 Building Cash Count tab');
    window.currentTabRefresh = () => buildCashCountTab(document.getElementById('cashTab'));

    // Get current selected date or default to today
    const selectedDate = window.selectedCashCountDate || new Date();
    const dateString = selectedDate.toISOString().split('T')[0];
    const displayDate = utils.formatDate(selectedDate.toISOString());

    // Get cash data for selected date
    const cashData = getDailyCashData(dateString);
    const isLocked = cashData.locked;
    const lockInfo = cashData.lockedInfo;

    const role = window.currentUserData.role;
    const canLock = role === 'admin' || role === 'manager';
    const canUnlock = role === 'admin';

    container.innerHTML = `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3>💵 Daily Cash Count</h3>
                <div>
                    <input type="date" id="cashCountDate" value="${dateString}" 
                           onchange="updateCashCountDate(this.value)"
                           style="padding:8px;border:1px solid #ddd;border-radius:4px;">
                </div>
            </div>
            
            <div style="background:${isLocked ? '#f5f5f5' : '#e3f2fd'};padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid ${isLocked ? '#9e9e9e' : '#2196f3'};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${displayDate}</strong>
                        ${isLocked ? `
                            <span style="margin-left:10px;padding:4px 12px;background:#9e9e9e;color:white;border-radius:12px;font-size:12px;">
                                🔒 LOCKED
                            </span>
                        ` : `
                            <span style="margin-left:10px;padding:4px 12px;background:#4caf50;color:white;border-radius:12px;font-size:12px;">
                                🔓 Unlocked
                            </span>
                        `}
                    </div>
                    ${isLocked && lockInfo ? `
                        <small style="color:#666;">
                            Locked ${utils.formatDateTime(lockInfo.lockedAt)} by ${lockInfo.lockedByName}
                        </small>
                    ` : ''}
                </div>
                ${isLocked && lockInfo && lockInfo.notes ? `
                    <div style="margin-top:10px;font-size:14px;color:#666;">
                        <strong>Notes:</strong> ${lockInfo.notes}
                    </div>
                ` : ''}
            </div>
            
            <!-- Payments Section -->
            <div class="card" style="background:#e8f5e9;margin-bottom:15px;">
                <h4 style="margin:0 0 15px;color:#2e7d32;">💵 Payments Collected</h4>
                <div style="font-size:24px;font-weight:bold;color:#2e7d32;margin-bottom:15px;">
                    ₱${cashData.totals.payments.toFixed(2)}
                    <small style="font-size:14px;color:#666;font-weight:normal;">(${cashData.payments.length} transactions)</small>
                </div>
                ${cashData.payments.length > 0 ? `
                    <div style="max-height:300px;overflow-y:auto;">
                        ${cashData.payments.map(p => `
                            <div style="padding:10px;background:white;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${p.customerName}</strong>
                                    <span style="color:#666;font-size:13px;"> • ${p.method}</span>
                                    ${p.receivedByName ? `<span style="color:#666;font-size:13px;"> • by ${p.receivedByName}</span>` : ''}
                                </div>
                                <div style="font-weight:bold;color:#2e7d32;">₱${p.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="text-align:center;color:#999;padding:20px;">No payments recorded for this date</p>
                `}
            </div>
            
            <!-- Expenses Section -->
            <div class="card" style="background:#ffebee;margin-bottom:15px;">
                <h4 style="margin:0 0 15px;color:#c62828;">💸 Expenses</h4>
                <div style="font-size:24px;font-weight:bold;color:#c62828;margin-bottom:15px;">
                    ₱${cashData.totals.expenses.toFixed(2)}
                    <small style="font-size:14px;color:#666;font-weight:normal;">(${cashData.expenses.length} transactions)</small>
                </div>
                ${cashData.expenses.length > 0 ? `
                    <div style="max-height:300px;overflow-y:auto;">
                        ${cashData.expenses.map(e => `
                            <div style="padding:10px;background:white;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${e.category}</strong>
                                    ${e.description ? `<span style="color:#666;font-size:13px;"> • ${e.description}</span>` : ''}
                                    ${e.techName ? `<span style="color:#666;font-size:13px;"> • ${e.techName}</span>` : ''}
                                </div>
                                <div style="font-weight:bold;color:#c62828;">₱${e.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="text-align:center;color:#999;padding:20px;">No expenses recorded for this date</p>
                `}
            </div>
            
            <!-- Net Revenue Section -->
            <div class="card" style="background:${cashData.totals.net >= 0 ? '#e3f2fd' : '#fff3cd'};border-left:4px solid ${cashData.totals.net >= 0 ? '#2196f3' : '#fbc02d'};">
                <h4 style="margin:0 0 15px;">📊 Net Revenue</h4>
                <div style="font-size:32px;font-weight:bold;color:${cashData.totals.net >= 0 ? '#1976d2' : '#f57c00'};margin-bottom:10px;">
                    ₱${cashData.totals.net.toFixed(2)}
                </div>
                <div style="color:#666;font-size:14px;">
                    ₱${cashData.totals.payments.toFixed(2)} (payments) - ₱${cashData.totals.expenses.toFixed(2)} (expenses)
                </div>
                ${cashData.totals.net < 0 ? `
                    <div style="margin-top:10px;padding:10px;background:#fff9c4;border-radius:4px;color:#f57c00;">
                        ⚠️ <strong>Negative Balance:</strong> Expenses exceed payments
                    </div>
                ` : ''}
            </div>
            
            <!-- Lock/Unlock Actions -->
            ${!isLocked && canLock ? `
                <div style="margin-top:20px;">
                    ${cashData.payments.length === 0 && cashData.expenses.length === 0 ? `
                        <div style="padding:15px;background:#fff3cd;border-radius:4px;margin-bottom:15px;color:#f57c00;">
                            ⚠️ No transactions recorded for this date
                        </div>
                    ` : ''}
                    <button onclick="openLockDayModal('${dateString}')" 
                            style="width:100%;padding:12px;background:#4caf50;color:white;border:none;border-radius:4px;font-size:16px;cursor:pointer;">
                        🔒 Lock This Day
                    </button>
                    <p style="text-align:center;color:#666;font-size:13px;margin-top:10px;">
                        Once locked, no transactions can be added or modified for this date
                    </p>
                </div>
            ` : ''}
            
            ${isLocked && canUnlock ? `
                <div style="margin-top:20px;">
                    <button onclick="openUnlockDayModal('${dateString}')" 
                            style="width:100%;padding:12px;background:#ff9800;color:white;border:none;border-radius:4px;font-size:16px;cursor:pointer;">
                        🔓 Unlock This Day (Admin Only)
                    </button>
                    <p style="text-align:center;color:#999;font-size:13px;margin-top:10px;">
                        ⚠️ Unlocking will allow modifications to historical data
                    </p>
                </div>
            ` : ''}
        </div>
        
        <!-- Historical Locked Days -->
        ${renderHistoricalCashCounts()}
    `;
}

/**
 * Render historical locked days
 */
function renderHistoricalCashCounts() {
    const lockedDays = Object.entries(window.dailyCashCounts || {})
        .filter(([_, data]) => data.locked)
        .sort((a, b) => b[0].localeCompare(a[0]))  // Sort by date descending
        .slice(0, 10);  // Show last 10 locked days

    if (lockedDays.length === 0) {
        return '';
    }

    return `
        <div class="card" style="margin-top:20px;">
            <h4 style="margin:0 0 15px;">📚 Recent Locked Days</h4>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f5f5f5;text-align:left;">
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Date</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Payments</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Expenses</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Net</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Locked By</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lockedDays.map(([date, data]) => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${utils.formatDate(date)}</td>
                                <td style="padding:10px;color:#2e7d32;">₱${data.totalPayments.toFixed(0)}</td>
                                <td style="padding:10px;color:#c62828;">₱${data.totalExpenses.toFixed(0)}</td>
                                <td style="padding:10px;font-weight:bold;color:${data.netRevenue >= 0 ? '#1976d2' : '#f57c00'};">
                                    ₱${data.netRevenue.toFixed(0)}
                                </td>
                                <td style="padding:10px;font-size:13px;color:#666;">${data.lockedByName || 'Unknown'}</td>
                                <td style="padding:10px;">
                                    <button onclick="viewLockedDay('${date}')" 
                                            style="padding:6px 12px;background:#2196f3;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Update cash count date selector
 */
function updateCashCountDate(dateString) {
    window.selectedCashCountDate = new Date(dateString + 'T00:00:00');
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * View specific locked day
 */
function viewLockedDay(dateString) {
    window.selectedCashCountDate = new Date(dateString + 'T00:00:00');
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

function buildSuppliersTab(container) {
    console.log('📊 Building Suppliers tab');
    window.currentTabRefresh = () => buildSuppliersTab(document.getElementById('suppliersTab'));

    container.innerHTML = `
        <div class="card">
            <h3>📊 Supplier Price Comparison</h3>
            <p style="text-align:center;color:#999;padding:40px;">Supplier report feature coming soon...</p>
        </div>
    `;
}

function buildUsersTab(container) {
    console.log('👥 Building Users tab');
    window.currentTabRefresh = () => buildUsersTab(document.getElementById('usersTab'));

    // Get all users
    const users = Object.values(window.allUsers || {});
    const activeUsers = users.filter(u => u.status === 'active');
    const inactiveUsers = users.filter(u => u.status !== 'active');

    // Group by role
    const admins = users.filter(u => u.role === 'admin');
    const managers = users.filter(u => u.role === 'manager');
    const cashiers = users.filter(u => u.role === 'cashier');
    const technicians = users.filter(u => u.role === 'technician');

    container.innerHTML = `
        <div class="page-header">
            <h2>👥 User Management</h2>
            <button onclick="openCreateUserModal()" class="btn-primary" style="margin-top:10px;">
                ➕ Create New User
            </button>
        </div>
        
        <!-- Summary Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>${users.length}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>${activeUsers.length}</h3>
                <p>✅ Active</p>
            </div>
            <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
                <h3>${inactiveUsers.length}</h3>
                <p>❌ Inactive</p>
            </div>
            <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
                <h3>${technicians.length}</h3>
                <p>🔧 Technicians</p>
            </div>
        </div>
        
        <!-- Users List -->
        <div class="card" style="margin:20px 0;">
            <h3>All Users</h3>
            
            ${users.length === 0 ? `
                <p style="text-align:center;color:#999;padding:40px;">No users found</p>
            ` : `
                <div class="repairs-list">
                    ${users.map(user => {
        const roleColors = {
            admin: '#f44336',
            manager: '#ff9800',
            cashier: '#2196f3',
            technician: '#4caf50'
        };
        const roleColor = roleColors[user.role] || '#999';
        const isActive = user.status === 'active';

        return `
                            <div class="repair-card" style="border-left-color:${roleColor};">
                                <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                                    <div style="flex:1;">
                                        <h4 style="margin:0 0 10px 0;">${user.displayName}</h4>
                                        <div style="font-size:13px;color:#666;line-height:1.6;">
                                            <div><strong>Email:</strong> ${user.email}</div>
                                            <div><strong>Role:</strong> 
                                                <span style="background:${roleColor};color:white;padding:2px 8px;border-radius:3px;font-size:11px;text-transform:uppercase;">
                                                    ${user.role}
                                                </span>
                                            </div>
                                            ${user.role === 'technician' && user.technicianName ? `
                                                <div><strong>Tech Name:</strong> ${user.technicianName}</div>
                                            ` : ''}
                                            ${user.role === 'technician' || user.role === 'admin' || user.role === 'manager' ? `
                                                <div><strong>💰 Compensation:</strong> 
                                                    <span style="font-weight:600;">
                                                        ${user.compensationType === 'salary' ? `Salary (₱${(user.monthlySalary || 0).toLocaleString()}/mo)` :
            user.compensationType === 'hybrid' ? `Hybrid (₱${(user.monthlySalary || 0).toLocaleString()}/mo + ${(user.hybridCommissionRate * 100).toFixed(0)}%)` :
                user.compensationType === 'commission' ? `Commission (${(user.commissionRate * 100).toFixed(0)}%)` :
                    'Not Set'}
                                                    </span>
                                                </div>
                                            ` : ''}
                                            <div><strong>Status:</strong> 
                                                <span style="color:${isActive ? '#4caf50' : '#f44336'};font-weight:600;">
                                                    ${isActive ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                            </div>
                                            ${user.lastLogin ? `
                                                <div><strong>Last Login:</strong> ${utils.formatDateTime(user.lastLogin)}</div>
                                            ` : ''}
                                            <div style="font-size:11px;color:#999;margin-top:5px;">
                                                Created: ${utils.formatDate(user.createdAt)} ${user.createdByName ? `by ${user.createdByName}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display:flex;flex-direction:column;gap:8px;">
                                        ${(user.role === 'technician' || user.role === 'admin' || user.role === 'manager') ? `
                                            <button onclick="openCompensationModal('${user.id}')" class="btn-small" style="background:#4caf50;color:white;">
                                                💰 Compensation
                                            </button>
                                        ` : ''}
                                        <button onclick="openEditUserModal('${user.id}')" class="btn-small" style="background:#667eea;color:white;">
                                            ✏️ Edit
                                        </button>
                                        <button onclick="toggleUserStatus('${user.id}')" class="btn-small" style="background:${isActive ? '#f44336' : '#4caf50'};color:white;">
                                            ${isActive ? '❌ Deactivate' : '✅ Activate'}
                                        </button>
                                        <button onclick="viewUserProfile('${user.id}')" class="btn-small" style="background:#2196f3;color:white;">
                                            👤 Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            `}
        </div>
    `;
}

/**
 * Build Admin Tools Tab (Admin only)
 */
function buildAdminToolsTab(container) {
    console.log('🔧 Building Admin Tools tab');
    window.currentTabRefresh = () => buildAdminToolsTab(document.getElementById('admin-toolsTab'));

    const todayString = new Date().toISOString().split('T')[0];
    const cashData = getDailyCashData(todayString);
    const isLocked = window.dailyCashCounts && window.dailyCashCounts[todayString];

    container.innerHTML = `
        <div class="card">
            <h3>🔧 Admin Tools & Reset Functions</h3>
            
            <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #ffc107;">
                <strong>⚠️ WARNING:</strong> Reset functions will permanently delete data. Use with caution!
                <br><small>All resets are backed up and logged for audit purposes.</small>
            </div>
            
            <!-- DATA HEALTH & CLEANUP -->
            ${buildDataHealthSection()}
            
            <!-- UNPAID DEVICES BULK FIX -->
            ${buildUnpaidDevicesFixSection()}
            
            <!-- SCHEDULED EXPORTS -->
            ${buildExportSettingsSection()}
            
            <!-- TODAY'S STATUS -->
            <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin:0 0 10px;">📊 Today's Cash Status</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                    <div>
                        <small style="color:#666;">Payments</small>
                        <div style="font-size:18px;font-weight:bold;color:#4caf50;">
                            ₱${cashData.totals.payments.toFixed(2)}
                        </div>
                        <small style="color:#999;">${cashData.payments.length} transaction(s)</small>
                    </div>
                    <div>
                        <small style="color:#666;">Expenses</small>
                        <div style="font-size:18px;font-weight:bold;color:#f44336;">
                            ₱${cashData.totals.expenses.toFixed(2)}
                        </div>
                        <small style="color:#999;">${cashData.expenses.length} transaction(s)</small>
                    </div>
                </div>
                <div style="border-top:1px solid #ddd;padding-top:10px;margin-top:10px;">
                    <small style="color:#666;">Net Revenue</small>
                    <div style="font-size:20px;font-weight:bold;color:#2196f3;">
                        ₱${cashData.totals.net.toFixed(2)}
                    </div>
                    ${isLocked ? '<div style="margin-top:5px;"><span style="background:#4caf50;color:white;padding:3px 8px;border-radius:3px;font-size:12px;">🔒 Locked</span></div>' : ''}
                </div>
            </div>
            
            ${isLocked ? `
                <div style="background:#fff9c4;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #ffc107;">
                    <strong>🔒 Today is Locked</strong>
                    <p style="margin:5px 0 0;">To make changes, go to the <strong>Cash Count</strong> tab and unlock today's date first.</p>
                </div>
            ` : `
                <!-- RESET BUTTONS -->
                <div class="form-group">
                    <h4 style="margin:0 0 10px;">🔄 Reset Functions</h4>
                    
                    <button 
                        onclick="resetTodayPayments()" 
                        class="btn btn-danger"
                        style="width:100%;margin-bottom:10px;"
                        ${cashData.payments.length === 0 ? 'disabled' : ''}>
                        🗑️ Reset Today's Payments
                        ${cashData.payments.length === 0 ? '<br><small>(No payments to reset)</small>' : `<br><small>${cashData.payments.length} payment(s) - ₱${cashData.totals.payments.toFixed(2)}</small>`}
                    </button>
                    
                    <button 
                        onclick="resetTodayExpenses()" 
                        class="btn btn-danger"
                        style="width:100%;margin-bottom:10px;"
                        ${cashData.expenses.length === 0 ? 'disabled' : ''}>
                        🗑️ Reset Today's Expenses
                        ${cashData.expenses.length === 0 ? '<br><small>(No expenses to reset)</small>' : `<br><small>${cashData.expenses.length} expense(s) - ₱${cashData.totals.expenses.toFixed(2)}</small>`}
                    </button>
                    
                    <button 
                        onclick="fullResetToday()" 
                        class="btn btn-danger"
                        style="width:100%;background:#d32f2f;"
                        ${(cashData.payments.length === 0 && cashData.expenses.length === 0) ? 'disabled' : ''}>
                        ⚠️ FULL RESET - Today's All Data
                        ${(cashData.payments.length === 0 && cashData.expenses.length === 0) ? '<br><small>(No transactions to reset)</small>' : `<br><small>Will delete ALL transactions (${cashData.payments.length + cashData.expenses.length} total)</small>`}
                    </button>
                </div>
            `}
            
            <!-- MASTER RESET -->
            <div class="form-group" style="border-top:2px solid #f44336;padding-top:20px;margin-top:20px;">
                <h4 style="margin:0 0 10px;color:#d32f2f;">🗑️ Master Reset (Danger Zone)</h4>
                <div style="background:#ffebee;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #f44336;">
                    <strong style="color:#d32f2f;">⚠️ EXTREME CAUTION REQUIRED</strong>
                    <p style="margin:5px 0 0;font-size:13px;">
                        Master Reset allows you to permanently delete ALL data from the system:
                    </p>
                    <ul style="margin:8px 0 0 20px;font-size:12px;">
                        <li>All repair records and history</li>
                        <li>All payment and remittance records</li>
                        <li>All expense records</li>
                        <li>All activity logs</li>
                        <li>Daily cash count locks</li>
                    </ul>
                    <p style="margin:8px 0 0;font-size:12px;font-weight:bold;">
                        This is useful when testing or starting fresh. User accounts will NOT be affected.
                    </p>
                </div>
                
                <button 
                    onclick="openMasterResetModal()" 
                    class="btn btn-danger"
                    style="width:100%;background:#b71c1c;font-size:16px;padding:15px;">
                    🗑️ MASTER RESET - Delete Selected Data
                    <br><small style="font-weight:normal;">Click to select what to delete</small>
                </button>
            </div>
            
            <!-- BACKUP INFO -->
            <div class="form-group" style="background:#e3f2fd;padding:15px;border-radius:5px;margin-top:20px;">
                <h4 style="margin:0 0 10px;">💾 Data Safety</h4>
                <ul style="margin:5px 0;padding-left:20px;">
                    <li>All resets require your password</li>
                    <li>Deleted data is backed up to <code>resetBackups</code></li>
                    <li>All actions are logged with timestamp and reason</li>
                    <li>Locked dates cannot be modified</li>
                </ul>
            </div>
            
            <!-- RECENTLY RELEASED DEVICES -->
            ${buildRecentlyReleasedSection()}
            
            <!-- TODAY'S TRANSACTIONS (Individual Delete) -->
            ${buildTodayTransactionsSection()}
            
            <!-- DEVICE MANAGEMENT -->
            ${buildDeviceManagementSection()}
            
            <!-- PENDING REMITTANCES -->
            ${buildPendingRemittancesSection()}
            
            <!-- DATA INTEGRITY CHECK -->
            ${buildDataIntegritySection()}
            
            <!-- DEBUG PANEL -->
            <div class="form-group" style="background:#e1f5fe;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #2196f3;">
                <h4 style="margin:0 0 10px;">🐛 Debug System</h4>
                
                <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:15px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                        <div>
                            <small style="color:#666;">Debug Logs</small>
                            <div style="font-size:20px;font-weight:bold;color:#2196f3;">
                                ${window.debugLogs ? window.debugLogs.length : 0}
                            </div>
                        </div>
                        <div>
                            <small style="color:#666;">Status</small>
                            <div style="font-size:14px;font-weight:bold;color:${window.debugEnabled ? '#4caf50' : '#f44336'};">
                                ${window.debugEnabled ? '✅ Enabled' : '⏸️ Paused'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                    <button onclick="DebugLogger.showLogsModal()" class="btn btn-primary" style="font-size:13px;">
                        📋 View Logs
                    </button>
                    <button onclick="DebugLogger.copyToClipboard('text')" class="btn btn-success" style="font-size:13px;">
                        📄 Copy Text
                    </button>
                </div>
                
                <div style="padding:10px;background:#fff9c4;border-radius:5px;font-size:12px;">
                    <strong>💡 Tip:</strong> Press <kbd>Ctrl+Shift+D</kbd> to open logs anytime
                </div>
            </div>
            
            <!-- QUICK ACTIONS -->
            <div class="form-group" style="margin-top:20px;">
                <h4 style="margin:0 0 10px;">⚡ Quick Actions</h4>
                <button onclick="window.switchToTab('cash')" class="btn btn-primary" style="width:100%;margin-bottom:10px;">
                    💵 Open Cash Count Tab
                </button>
                <button onclick="window.switchToTab('admin-logs')" class="btn btn-primary" style="width:100%;">
                    📋 View Activity Logs
                </button>
            </div>
        </div>
    `;
}

/**
 * Build Unpaid Devices Fix Section for Admin Tools
 */
function buildUnpaidDevicesFixSection() {
    // Find all devices that were released/claimed without payment records but have outstanding balance
    const unpaidDevices = window.allRepairs.filter(r => {
        if (r.deleted || !r.status) return false;
        
        // Only check Released and Claimed devices
        if (r.status !== 'Released' && r.status !== 'Claimed') return false;
        
        // Calculate payment info
        const totalPaid = (r.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;
        
        // Flag if has balance but no payments array or empty
        return balance > 0 && (!r.payments || r.payments.length === 0);
    });

    const totalBalance = unpaidDevices.reduce((sum, r) => {
        const totalPaid = (r.payments || []).reduce((s, p) => s + p.amount, 0);
        return sum + (r.total - totalPaid);
    }, 0);

    return `
        <div class="unpaid-devices-section" style="margin-bottom:30px;">
            <h4 style="margin:0 0 15px;">💰 Unpaid Released Devices</h4>
            
            ${unpaidDevices.length === 0 ? `
                <div style="background:#d1fae5;padding:15px;border-radius:8px;border-left:4px solid #10b981;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:24px;">✅</span>
                        <div>
                            <strong style="color:#065f46;">No Unpaid Devices</strong>
                            <div style="font-size:13px;color:#065f46;margin-top:4px;">All released devices have payment records</div>
                        </div>
                    </div>
                </div>
            ` : `
                <div style="background:#fff3cd;padding:15px;border-radius:8px;border-left:4px solid #ffc107;margin-bottom:15px;">
                    <strong style="color:#856404;">⚠️ ${unpaidDevices.length} Device${unpaidDevices.length !== 1 ? 's' : ''} Released Without Payment Records</strong>
                    <div style="font-size:13px;color:#856404;margin-top:4px;">Total outstanding balance: ₱${totalBalance.toFixed(2)}</div>
                </div>
                
                <div style="max-height:400px;overflow-y:auto;background:white;border-radius:8px;border:1px solid #ddd;">
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <thead style="position:sticky;top:0;background:#f8f9fa;border-bottom:2px solid #ddd;">
                            <tr>
                                <th style="padding:10px;text-align:left;border-right:1px solid #ddd;">Device</th>
                                <th style="padding:10px;text-align:left;border-right:1px solid #ddd;">Customer</th>
                                <th style="padding:10px;text-align:right;border-right:1px solid #ddd;">Balance</th>
                                <th style="padding:10px;text-align:center;border-right:1px solid #ddd;">Status</th>
                                <th style="padding:10px;text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${unpaidDevices.map(r => {
                                const totalPaid = (r.payments || []).reduce((s, p) => s + p.amount, 0);
                                const balance = r.total - totalPaid;
                                return `
                                    <tr style="border-bottom:1px solid #eee;">
                                        <td style="padding:10px;border-right:1px solid #eee;">
                                            <div style="font-weight:600;">${r.brand} ${r.model}</div>
                                            <div style="font-size:11px;color:#666;">${r.id}</div>
                                        </td>
                                        <td style="padding:10px;border-right:1px solid #eee;">
                                            <div>${r.customerName}</div>
                                            <div style="font-size:11px;color:#666;">${r.contactNumber}</div>
                                        </td>
                                        <td style="padding:10px;text-align:right;border-right:1px solid #eee;">
                                            <strong style="color:#f44336;">₱${balance.toFixed(2)}</strong>
                                            <div style="font-size:11px;color:#666;">Total: ₱${r.total.toFixed(2)}</div>
                                        </td>
                                        <td style="padding:10px;text-align:center;border-right:1px solid #eee;">
                                            <span style="background:${r.status === 'Released' ? '#ff9800' : '#4caf50'};color:white;padding:3px 8px;border-radius:3px;font-size:11px;">
                                                ${r.status}
                                            </span>
                                            <div style="font-size:10px;color:#666;margin-top:3px;">
                                                ${utils.formatDate(r.releasedAt || r.completedAt)}
                                            </div>
                                        </td>
                                        <td style="padding:10px;text-align:center;">
                                            <button onclick="recordMissingPaymentForDevice('${r.id}')" 
                                                class="btn-small btn-primary" 
                                                style="font-size:11px;padding:5px 10px;">
                                                💳 Add Payment
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                    <p style="font-size:13px;color:#666;margin:0 0 10px;">
                        📝 <strong>Note:</strong> These devices were released without payment checkbox being marked. 
                        Use the "Add Payment" button to record missing payments for each device.
                    </p>
                    <button onclick="exportUnpaidDevicesList()" class="btn-small" style="margin-top:5px;">
                        📊 Export List to CSV
                    </button>
                </div>
            `}
        </div>
    `;
}

/**
 * Build Data Health Section for Admin Tools
 */
function buildDataHealthSection() {
    const issues = window.calculateDataHealthIssues ? window.calculateDataHealthIssues() : {
        total: 0,
        missingPartsCost: [],
        orphanedRemittances: [],
        legacyPayments: []
    };

    return `
        <div class="data-health-section" style="margin-bottom:30px;">
            <h4 style="margin:0 0 15px;">🔍 Data Health & Cleanup</h4>
            
            ${issues.total === 0 ? `
                <div style="background:#d1fae5;padding:15px;border-radius:8px;border-left:4px solid #10b981;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:24px;">✅</span>
                        <div>
                            <strong style="color:#065f46;">All Systems Healthy</strong>
                            <div style="font-size:13px;color:#065f46;margin-top:4px;">No data issues detected</div>
                        </div>
                    </div>
                </div>
            ` : `
                <div style="background:#fee2e2;padding:15px;border-radius:8px;border-left:4px solid #ef4444;margin-bottom:15px;">
                    <strong style="color:#991b1b;">⚠️ ${issues.total} Data Issue${issues.total !== 1 ? 's' : ''} Detected</strong>
                    <div style="font-size:13px;color:#991b1b;margin-top:4px;">Review and fix issues below</div>
                </div>
                
                <div class="issue-cards-grid" style="display:grid;grid-template-columns:1fr;gap:15px;">
                    ${issues.missingPartsCost.length > 0 ? `
                        <div class="issue-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #ef4444;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <strong>❌ Missing Parts Cost</strong>
                                <span class="issue-count-badge" style="background:#ef4444;color:white;padding:4px 10px;border-radius:12px;font-size:12px;">${issues.missingPartsCost.length}</span>
                            </div>
                            <p style="font-size:13px;color:#666;margin:10px 0;">Completed repairs missing parts cost information</p>
                            <div style="display:flex;gap:10px;margin-top:10px;">
                                <button onclick="fixDataIssues('missingPartsCost')" class="btn-small btn-primary">🔧 Fix All (${issues.missingPartsCost.length})</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${issues.orphanedRemittances.length > 0 ? `
                        <div class="issue-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #f59e0b;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <strong>⚠️ Orphaned Remittances</strong>
                                <span class="issue-count-badge" style="background:#f59e0b;color:white;padding:4px 10px;border-radius:12px;font-size:12px;">${issues.orphanedRemittances.length}</span>
                            </div>
                            <p style="font-size:13px;color:#666;margin:10px 0;">Payments with invalid remittance references</p>
                            <div style="display:flex;gap:10px;margin-top:10px;">
                                <button onclick="fixDataIssues('orphanedRemittances')" class="btn-small btn-primary">🔧 Fix All (${issues.orphanedRemittances.length})</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${issues.legacyPayments.length > 0 ? `
                        <div class="issue-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #3b82f6;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <strong>ℹ️ Legacy Payments</strong>
                                <span class="issue-count-badge" style="background:#3b82f6;color:white;padding:4px 10px;border-radius:12px;font-size:12px;">${issues.legacyPayments.length}</span>
                            </div>
                            <p style="font-size:13px;color:#666;margin:10px 0;">Old payments missing remittance status field</p>
                            <div style="display:flex;gap:10px;margin-top:10px;">
                                <button onclick="fixDataIssues('legacyPayments')" class="btn-small btn-primary">🔧 Fix All (${issues.legacyPayments.length})</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Cleanup History -->
                <div style="margin-top:20px;">
                    <button onclick="showCleanupHistory()" class="btn-small">📜 View Cleanup History</button>
                </div>
            `}
        </div>
    `;
}

/**
 * Build Export Settings Section for Admin Tools
 */
function buildExportSettingsSection() {
    const config = window.exportScheduler ? window.exportScheduler.getExportScheduleConfig() : {
        daily: { enabled: true, time: '00:00' },
        weekly: { enabled: false, time: '23:00' },
        monthly: { enabled: false, time: '00:00' }
    };

    const stats = window.exportScheduler ? window.exportScheduler.getExportStats() : {};

    // Generate time options
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        const hour = h.toString().padStart(2, '0');
        timeOptions.push(`<option value="${hour}:00" ${config.daily.time === `${hour}:00` ? 'selected' : ''}>${hour}:00</option>`);
    }

    return `
        <div class="export-settings-section" style="margin-bottom:30px;">
            <h4 style="margin:0 0 15px;">📤 Scheduled Exports</h4>
            <p style="font-size:13px;color:#666;margin-bottom:15px;">Automatically export financial data for backup and external analysis</p>
            
            <div style="display:grid;grid-template-columns:1fr;gap:15px;">
                <!-- Daily Export -->
                <div class="export-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #10b981;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <strong>📅 Daily Summary</strong>
                        <label class="toggle-switch">
                            <input type="checkbox" id="exportDailyEnabled" ${config.daily.enabled ? 'checked' : ''} onchange="updateExportSchedule()">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div style="display:grid;grid-template-columns:100px 1fr;gap:10px;align-items:center;margin-bottom:10px;">
                        <label style="font-size:13px;color:#666;">Time:</label>
                        <select id="exportDailyTime" class="input" onchange="updateExportSchedule()">
                            ${timeOptions.join('')}
                        </select>
                    </div>
                    ${stats.daily ? `
                        <div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:12px;">
                            <strong>Last Export:</strong> ${utils.formatDateTime(stats.daily.timestamp)}
                            <br><strong>Records:</strong> ${stats.daily.recordCount}
                        </div>
                    ` : '<div style="font-size:12px;color:#999;">Not yet exported</div>'}
                    <button onclick="window.exportScheduler.triggerManualExport('daily')" class="btn-small btn-primary" style="width:100%;margin-top:10px;">
                        📥 Export Now
                    </button>
                </div>
                
                <!-- Weekly Export -->
                <div class="export-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #3b82f6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <strong>📊 Weekly Report</strong>
                        <label class="toggle-switch">
                            <input type="checkbox" id="exportWeeklyEnabled" ${config.weekly.enabled ? 'checked' : ''} onchange="updateExportSchedule()">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    ${stats.weekly ? `
                        <div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:12px;">
                            <strong>Last Export:</strong> ${utils.formatDateTime(stats.weekly.timestamp)}
                        </div>
                    ` : '<div style="font-size:12px;color:#999;">Not yet exported</div>'}
                    <button onclick="window.exportScheduler.triggerManualExport('weekly')" class="btn-small btn-primary" style="width:100%;margin-top:10px;">
                        📥 Export Now
                    </button>
                </div>
                
                <!-- Monthly Export -->
                <div class="export-card" style="background:white;border-radius:8px;padding:15px;border-left:4px solid #8b5cf6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <strong>📦 Monthly Archive</strong>
                        <label class="toggle-switch">
                            <input type="checkbox" id="exportMonthlyEnabled" ${config.monthly.enabled ? 'checked' : ''} onchange="updateExportSchedule()">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    ${stats.monthly ? `
                        <div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:12px;">
                            <strong>Last Export:</strong> ${utils.formatDateTime(stats.monthly.timestamp)}
                            <br><strong>Records:</strong> ${stats.monthly.recordCount}
                        </div>
                    ` : '<div style="font-size:12px;color:#999;">Not yet exported</div>'}
                    <button onclick="window.exportScheduler.triggerManualExport('monthly')" class="btn-small btn-primary" style="width:100%;margin-top:10px;">
                        📥 Export Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Build Recently Released Devices Section for Admin Tools
 */
function buildRecentlyReleasedSection() {
    // Get recently released devices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyReleased = window.allRepairs.filter(r => {
        if (!r.claimedAt) return false;
        const claimedDate = new Date(r.claimedAt);
        return claimedDate >= sevenDaysAgo;
    }).sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    if (recentlyReleased.length === 0) {
        return `
            <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-top:20px;">
                <h4 style="margin:0 0 10px;">📦 Recently Released Devices</h4>
                <p style="color:#999;margin:0;">No devices released in the last 7 days</p>
            </div>
        `;
    }

    // Check payment status for each
    const devicesHTML = recentlyReleased.slice(0, 10).map(repair => {
        const totalAmount = repair.total || 0;
        const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
        const balance = totalAmount - totalPaid;
        const isPaid = balance <= 0;

        const statusColor = isPaid ? '#4caf50' : '#f44336';
        const statusText = isPaid ? '✅ Fully Paid' : `⚠️ Unpaid: ₱${balance.toFixed(2)}`;

        return `
            <div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid ${statusColor};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
                    <div style="flex:1;">
                        <strong>${repair.customerName}</strong> - ${repair.brand} ${repair.model}
                        <div style="font-size:12px;color:#666;margin-top:3px;">
                            Released: ${utils.formatDateTime(repair.claimedAt)}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:14px;font-weight:bold;color:${statusColor};">
                            ${statusText}
                        </div>
                        <div style="font-size:12px;color:#999;">
                            Total: ₱${totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
                ${!isPaid ? `
                    <div style="margin-top:10px;display:flex;gap:8px;">
                        <button onclick="adminAddPaymentToReleased('${repair.id}')" class="btn btn-primary" style="flex:1;padding:6px 12px;font-size:13px;">
                            💰 Add Payment
                        </button>
                        <button onclick="adminUnreleaseDevice('${repair.id}')" class="btn btn-warning" style="flex:1;padding:6px 12px;font-size:13px;">
                            ↩️ Un-Release
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-top:20px;">
            <h4 style="margin:0 0 10px;">📦 Recently Released Devices (Last 7 Days)</h4>
            <p style="color:#666;font-size:13px;margin:0 0 15px;">
                Showing ${Math.min(recentlyReleased.length, 10)} of ${recentlyReleased.length} device(s)
            </p>
            <div style="max-height:400px;overflow-y:auto;">
                ${devicesHTML}
            </div>
        </div>
    `;
}

/**
 * Build Today's Transactions Section (Individual Delete)
 */
function buildTodayTransactionsSection() {
    const todayString = new Date().toISOString().split('T')[0];
    const cashData = getDailyCashData(todayString);
    const isLocked = window.dailyCashCounts && window.dailyCashCounts[todayString];

    // If locked, don't show this section
    if (isLocked) {
        return '';
    }

    const totalTransactions = cashData.payments.length + cashData.expenses.length;

    if (totalTransactions === 0) {
        return `
            <div class="form-group" style="background:#e8f5e9;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #4caf50;">
                <h4 style="margin:0 0 10px;">💳 Today's Transactions</h4>
                <p style="color:#2e7d32;margin:0;">✅ No transactions recorded today</p>
            </div>
        `;
    }

    // Build payments list
    const paymentsHTML = cashData.payments.length > 0 ? cashData.payments.map(p => {
        const repair = window.allRepairs.find(r => r.id === p.repairId);
        if (!repair || !repair.payments) return '';

        // Find the payment index by matching properties
        const paymentIndex = repair.payments.findIndex(payment =>
            payment.amount === p.amount &&
            payment.paymentDate === p.paymentDate &&
            (payment.receivedByName === p.receivedByName || payment.receivedBy === p.receivedByName)
        );

        if (paymentIndex === -1) return ''; // Payment not found

        const payment = repair.payments[paymentIndex];

        return `
            <div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid #4caf50;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <strong>${repair.customerName}</strong>
                        <div style="font-size:12px;color:#666;margin-top:3px;">
                            Amount: <strong style="color:#4caf50;">₱${p.amount.toFixed(2)}</strong> | 
                            Method: ${p.method || 'Cash'}
                        </div>
                        <div style="font-size:11px;color:#999;margin-top:2px;">
                            Received by: ${p.receivedByName || 'N/A'} | 
                            ${payment.verified ? '✅ Verified' : '⏳ Pending'}
                        </div>
                    </div>
                    <button onclick="adminDeletePayment('${p.repairId}', ${paymentIndex})" 
                            class="btn btn-danger" 
                            style="padding:4px 10px;font-size:12px;">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('') : '<p style="color:#999;font-size:13px;">No payments today</p>';

    // Build expenses list
    const expensesHTML = cashData.expenses.length > 0 ? cashData.expenses.map(e => {
        // Check if expense is nested or direct
        const expense = e.expense || e;
        
        return `
        <div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid #f44336;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                    <strong>${expense.category || 'Uncategorized'}</strong>
                    <div style="font-size:12px;color:#666;margin-top:3px;">
                        Amount: <strong style="color:#f44336;">₱${(expense.amount || 0).toFixed(2)}</strong>
                        ${expense.description ? ` | ${expense.description}` : ''}
                    </div>
                    <div style="font-size:11px;color:#999;margin-top:2px;">
                        Recorded by: ${expense.recordedBy || 'N/A'}
                    </div>
                </div>
                <button onclick="adminDeleteExpense('${e.expenseId || e.id}')" 
                        class="btn btn-danger" 
                        style="padding:4px 10px;font-size:12px;">
                    🗑️ Delete
                </button>
            </div>
        </div>
        `;
    }).join('') : '<p style="color:#999;font-size:13px;">No expenses today</p>';

    return `
        <div class="form-group" style="background:#e3f2fd;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #2196f3;">
            <h4 style="margin:0 0 10px;">💳 Today's Transactions (Individual Delete)</h4>
            
            <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
                    <div>
                        <small style="color:#666;">Payments</small>
                        <div style="font-size:18px;font-weight:bold;color:#4caf50;">
                            ${cashData.payments.length}
                        </div>
                    </div>
                    <div>
                        <small style="color:#666;">Expenses</small>
                        <div style="font-size:18px;font-weight:bold;color:#f44336;">
                            ${cashData.expenses.length}
                        </div>
                    </div>
                    <div>
                        <small style="color:#666;">Total</small>
                        <div style="font-size:18px;font-weight:bold;color:#2196f3;">
                            ${totalTransactions}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom:10px;padding:10px;background:#fff9c4;border-radius:5px;font-size:12px;">
                💡 <strong>Tip:</strong> Delete individual transactions selectively. Use the "Reset" buttons above for bulk deletion.
            </div>
            
            ${cashData.payments.length > 0 ? `
                <div style="margin-bottom:20px;">
                    <h5 style="margin:0 0 10px;color:#4caf50;">💵 Payments (${cashData.payments.length})</h5>
                    <div style="max-height:300px;overflow-y:auto;">
                        ${paymentsHTML}
                    </div>
                </div>
            ` : ''}
            
            ${cashData.expenses.length > 0 ? `
                <div>
                    <h5 style="margin:0 0 10px;color:#f44336;">💸 Expenses (${cashData.expenses.length})</h5>
                    <div style="max-height:300px;overflow-y:auto;">
                        ${expensesHTML}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Build Device Management Section (PHASE 1: Delete Devices + Bulk Delete)
 */
function buildDeviceManagementSection() {
    // Get all active (non-deleted) devices that can be deleted
    const deletableDevices = window.allRepairs.filter(r =>
        !r.deleted &&
        !r.claimedAt &&
        r.status !== 'Completed'
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Group by status
    const byStatus = {};
    deletableDevices.forEach(r => {
        const status = r.status || 'Unknown';
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(r);
    });

    const statusSummary = Object.keys(byStatus).map(status =>
        `${status}: ${byStatus[status].length}`
    ).join(' | ');

    if (deletableDevices.length === 0) {
        return `
            <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-top:20px;">
                <h4 style="margin:0 0 10px;">🗑️ Device Management</h4>
                <p style="color:#999;margin:0;">No devices available for management</p>
            </div>
        `;
    }

    // Show last 15 devices
    const devicesHTML = deletableDevices.slice(0, 15).map(repair => {
        const totalAmount = repair.total || 0;
        const totalPaid = repair.payments ? repair.payments.filter(p => p.verified).reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
        const hasPayments = totalPaid > 0;

        const statusColors = {
            'Received': '#9e9e9e',
            'Pending Customer Approval': '#ff9800',
            'In Progress': '#2196f3',
            'Waiting for Parts': '#9c27b0',
            'Ready for Pickup': '#4caf50',
            'RTO': '#f44336',
            'Unsuccessful': '#d32f2f'
        };

        const statusColor = statusColors[repair.status] || '#757575';

        return `
            <div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid ${statusColor};">
                <div style="display:flex;align-items:flex-start;gap:10px;">
                    <input type="checkbox" 
                           class="device-delete-checkbox" 
                           data-repair-id="${repair.id}" 
                           onchange="updateBulkDeleteButton()"
                           style="margin-top:5px;width:18px;height:18px;cursor:pointer;">
                    <div style="flex:1;">
                        <strong>${repair.customerName}</strong> - ${repair.brand} ${repair.model}
                        <div style="font-size:12px;color:#666;margin-top:3px;">
                            Status: <span style="color:${statusColor};font-weight:bold;">${repair.status}</span>
                            ${repair.acceptedByName ? ` | Tech: ${repair.acceptedByName}` : ''}
                        </div>
                        <div style="font-size:11px;color:#999;margin-top:2px;">
                            Created: ${utils.formatDateTime(repair.createdAt)}
                        </div>
                        ${hasPayments ? `
                            <div style="font-size:11px;color:#f44336;font-weight:bold;margin-top:3px;">
                                ⚠️ Has ₱${totalPaid.toFixed(2)} in payments
                            </div>
                        ` : ''}
                    </div>
                    <button onclick="adminDeleteDevice('${repair.id}')" class="btn btn-danger" style="padding:4px 10px;font-size:12px;">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="form-group" style="background:#fff3cd;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #ff9800;">
            <h4 style="margin:0 0 10px;">🗑️ Device Management</h4>
            <p style="color:#666;font-size:13px;margin:0 0 10px;">
                ${deletableDevices.length} device(s) can be deleted (pre-release only)
                ${statusSummary ? `<br><small>${statusSummary}</small>` : ''}
            </p>
            
            <!-- Bulk Actions Bar -->
            <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:15px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="checkbox" 
                           id="selectAllDevices" 
                           onchange="toggleAllDeviceCheckboxes()"
                           style="width:18px;height:18px;cursor:pointer;">
                    <label for="selectAllDevices" style="margin:0;cursor:pointer;font-weight:bold;">
                        Select All
                    </label>
                    <span id="selectedDeviceCount" style="color:#666;font-size:13px;">
                        (0 selected)
                    </span>
                </div>
                <button id="bulkDeleteBtn" 
                        onclick="executeBulkDelete()" 
                        class="btn btn-danger" 
                        style="padding:6px 15px;font-size:13px;display:none;">
                    🗑️ Delete Selected
                </button>
            </div>
            
            <div style="max-height:400px;overflow-y:auto;" id="deviceListContainer">
                ${devicesHTML}
            </div>
            ${deletableDevices.length > 15 ? `
                <p style="margin:10px 0 0;font-size:12px;color:#999;text-align:center;">
                    Showing 15 of ${deletableDevices.length} devices. Use search to find specific devices.
                </p>
            ` : ''}
        </div>
    `;
}

/**
 * Build Pending Remittances Section (PHASE 1)
 */
function buildPendingRemittancesSection() {
    if (!window.adminGetPendingRemittances) {
        return '';
    }

    const pendingRemittances = window.adminGetPendingRemittances();
    const remittanceStats = window.adminGetRemittanceStats ? window.adminGetRemittanceStats() : {};

    if (pendingRemittances.length === 0) {
        return `
            <div class="form-group" style="background:#e8f5e9;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #4caf50;">
                <h4 style="margin:0 0 10px;">💰 Pending Remittances</h4>
                <p style="color:#2e7d32;margin:0;">✅ All remittances verified! No pending remittances.</p>
            </div>
        `;
    }

    // Calculate totals
    const totalPending = pendingRemittances.reduce((sum, r) => sum + (r.expectedAmount || r.actualAmount || 0), 0);
    const overdueCount = pendingRemittances.filter(r => r.isOverdue).length;

    const remittancesHTML = pendingRemittances.slice(0, 10).map(remittance => {
        const isOverdue = remittance.isOverdue;
        const hasDiscrepancy = Math.abs(remittance.discrepancy) > 0;
        const discrepancyPercent = remittance.expectedAmount > 0 ?
            Math.abs((remittance.discrepancy / remittance.expectedAmount) * 100) : 0;
        const isMajorDiscrepancy = discrepancyPercent >= 5;

        return `
            <div style="background:${isOverdue ? '#ffebee' : '#fff'};padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid ${isOverdue ? '#f44336' : '#ff9800'};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <strong>${remittance.techName}</strong>
                        ${isOverdue ? '<span style="color:#f44336;font-size:12px;margin-left:5px;">⚠️ OVERDUE</span>' : ''}
                        <div style="font-size:12px;color:#666;margin-top:3px;">
                            Submitted: ${utils.formatDateTime(remittance.submittedAt)} (${remittance.ageInDays} day${remittance.ageInDays !== 1 ? 's' : ''} ago)
                        </div>
                        <div style="font-size:12px;margin-top:5px;">
                            Expected: <strong>₱${remittance.expectedAmount.toFixed(2)}</strong>
                            ${hasDiscrepancy ? `
                                <span style="color:${isMajorDiscrepancy ? '#f44336' : '#ff9800'};margin-left:5px;">
                                    ${remittance.discrepancy > 0 ? '+' : ''}₱${remittance.discrepancy.toFixed(2)}
                                    (${discrepancyPercent.toFixed(1)}%)
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <button onclick="openVerifyRemittanceModal('${remittance.id}')" class="btn btn-primary" style="padding:6px 12px;font-size:12px;">
                        ✅ Verify
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Tech stats summary
    const techStatsHTML = Object.values(remittanceStats)
        .filter(s => s.pending > 0)
        .sort((a, b) => b.pending - a.pending)
        .slice(0, 5)
        .map(s => `
            <div style="font-size:12px;padding:5px 0;border-bottom:1px solid #eee;">
                <strong>${s.techName}</strong>: ${s.pending} pending (₱${s.totalPending.toFixed(2)})
            </div>
        `).join('');

    return `
        <div class="form-group" style="background:#fff3cd;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #ff9800;">
            <h4 style="margin:0 0 10px;">💰 Pending Remittances Dashboard</h4>
            
            <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <small style="color:#666;">Total Pending</small>
                        <div style="font-size:18px;font-weight:bold;color:#ff9800;">
                            ${pendingRemittances.length}
                        </div>
                    </div>
                    <div>
                        <small style="color:#666;">Amount</small>
                        <div style="font-size:18px;font-weight:bold;color:#f44336;">
                            ₱${totalPending.toFixed(2)}
                        </div>
                    </div>
                </div>
                ${overdueCount > 0 ? `
                    <div style="margin-top:10px;padding:8px;background:#ffebee;border-radius:3px;font-size:12px;color:#d32f2f;">
                        ⚠️ <strong>${overdueCount}</strong> overdue remittance${overdueCount !== 1 ? 's' : ''} (over 1 day old)
                    </div>
                ` : ''}
            </div>
            
            ${techStatsHTML ? `
                <div style="background:#f8f9fa;padding:10px;border-radius:5px;margin-bottom:15px;">
                    <small style="color:#666;font-weight:bold;">By Technician:</small>
                    ${techStatsHTML}
                </div>
            ` : ''}
            
            <div style="max-height:400px;overflow-y:auto;">
                ${remittancesHTML}
            </div>
            
            <button onclick="window.switchToTab('verify-remittance')" class="btn btn-primary" style="width:100%;margin-top:10px;">
                📋 View All Remittances
            </button>
        </div>
    `;
}

/**
 * Build Data Integrity Section (PHASE 1)
 */
function buildDataIntegritySection() {
    if (!window.adminFindOrphanedData) {
        return '';
    }

    const dataCheck = window.adminFindOrphanedData();
    const totalIssues = dataCheck.totalIssues;
    const categories = dataCheck.categories;

    if (totalIssues === 0) {
        return `
            <div class="form-group" style="background:#e8f5e9;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #4caf50;">
                <h4 style="margin:0 0 10px;">🔍 Data Integrity Check</h4>
                <p style="color:#2e7d32;margin:0;">✅ All clear! No data integrity issues found.</p>
            </div>
        `;
    }

    // Build issue summary
    const issueTypes = [
        { key: 'missingCustomerInfo', label: 'Missing Customer Info', icon: '👤', color: '#f44336' },
        { key: 'missingDeviceInfo', label: 'Missing Device Info', icon: '📱', color: '#f44336' },
        { key: 'releasedWithoutWarranty', label: 'Released Without Warranty', icon: '🛡️', color: '#ff9800' },
        { key: 'paymentsWithoutVerification', label: 'Unverified Payments (7+ days)', icon: '💰', color: '#ff9800' },
        { key: 'oldPendingPayments', label: 'Old Pending Payments (30+ days)', icon: '⏰', color: '#ff9800' },
        { key: 'negativeBalance', label: 'Overpaid Repairs', icon: '💸', color: '#2196f3' },
        { key: 'missingTechnician', label: 'Missing Technician Assignment', icon: '🔧', color: '#f44336' },
        { key: 'stuckInProgress', label: 'Stuck In Progress (30+ days)', icon: '⏳', color: '#ff9800' },
        { key: 'rtoWithoutFee', label: 'RTO Without Fee', icon: '↩️', color: '#9e9e9e' }
    ];

    const issuesHTML = issueTypes
        .filter(type => categories[type.key] > 0)
        .map(type => {
            const count = categories[type.key];
            const issues = dataCheck.issues[type.key];
            const examplesHTML = issues.slice(0, 3).map(issue => `
                <div style="font-size:11px;padding:5px;background:#f8f9fa;border-radius:3px;margin-top:3px;">
                    ${issue.repair.customerName} - ${issue.repair.brand || 'Unknown'} ${issue.repair.model || ''}
                    <br><span style="color:#666;">${issue.issue}</span>
                    ${type.key === 'releasedWithoutWarranty' ? `
                        <div style="margin-top:3px;">
                            <button onclick="adminQuickFixWarranty('${issue.id}', 30)" class="btn btn-primary" style="padding:2px 6px;font-size:10px;margin-right:3px;">
                                Fix (30d)
                            </button>
                            <button onclick="adminQuickFixWarranty('${issue.id}', 7)" class="btn btn-primary" style="padding:2px 6px;font-size:10px;">
                                Fix (7d)
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            return `
                <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:8px;border-left:3px solid ${type.color};">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="flex:1;">
                            <div style="font-size:14px;font-weight:bold;color:${type.color};">
                                ${type.icon} ${type.label}
                            </div>
                            <div style="font-size:12px;color:#666;margin-top:2px;">
                                ${count} issue${count !== 1 ? 's' : ''} found
                            </div>
                        </div>
                        <div style="font-size:20px;font-weight:bold;color:${type.color};">
                            ${count}
                        </div>
                    </div>
                    ${examplesHTML ? `
                        <div style="margin-top:10px;">
                            <div style="font-size:11px;color:#666;margin-bottom:5px;">Examples:</div>
                            ${examplesHTML}
                            ${count > 3 ? `<div style="font-size:10px;color:#999;margin-top:3px;">...and ${count - 3} more</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

    return `
        <div class="form-group" style="background:#ffebee;padding:15px;border-radius:5px;margin-top:20px;border-left:4px solid #f44336;">
            <h4 style="margin:0 0 10px;">🔍 Data Integrity Check</h4>
            
            <div style="background:#fff;padding:10px;border-radius:5px;margin-bottom:15px;">
                <div style="font-size:24px;font-weight:bold;color:#f44336;text-align:center;">
                    ${totalIssues}
                </div>
                <div style="font-size:13px;color:#666;text-align:center;">
                    total issue${totalIssues !== 1 ? 's' : ''} found
                </div>
            </div>
            
            <div style="max-height:500px;overflow-y:auto;">
                ${issuesHTML}
            </div>
            
            <div style="margin-top:15px;padding:10px;background:#fff9c4;border-radius:5px;font-size:12px;">
                💡 <strong>Tip:</strong> Regular data cleanup helps maintain system integrity and accurate reporting.
            </div>
        </div>
    `;
}

/**
 * Build Activity Logs Tab (Admin only)
 */
function buildActivityLogsTab(container) {
    console.log('📋 Building Activity Logs tab');
    window.currentTabRefresh = () => buildActivityLogsTab(document.getElementById('admin-logsTab'));

    if (!window.activityLogs || window.activityLogs.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3>📋 Activity Logs</h3>
                <p style="text-align:center;color:#999;padding:40px;">No activity logs yet...</p>
            </div>
        `;
        return;
    }

    // Sort logs by timestamp (newest first)
    const sortedLogs = [...window.activityLogs].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Get filter values (if any)
    const filterUser = window.logFilterUser || 'all';
    const filterAction = window.logFilterAction || 'all';
    // Ensure filterDate is a string, not an element
    let filterDate = window.logFilterDate || 'all';
    if (typeof filterDate !== 'string') {
        filterDate = 'all';
    }

    // Apply filters
    let filteredLogs = sortedLogs;

    if (filterUser !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.userId === filterUser);
    }

    if (filterAction !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(filterAction.toLowerCase()));
    }

    if (filterDate !== 'all') {
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate === filterDate;
        });
    }

    // Get unique users and actions for filters
    const uniqueUsers = [...new Set(sortedLogs.map(log => ({ id: log.userId, name: log.userName })))];
    const uniqueActions = [...new Set(sortedLogs.map(log => log.action))];

    // Generate action icon
    const getActionIcon = (action) => {
        if (action.includes('Login')) return '🔓';
        if (action.includes('Logout')) return '🔒';
        if (action.includes('Payment')) return '💰';
        if (action.includes('Expense')) return '🏪';
        if (action.includes('Device')) return '📱';
        if (action.includes('Repair')) return '🔧';
        if (action.includes('Lock') || action.includes('Unlock')) return '🔐';
        if (action.includes('Reset') || action.includes('Delete')) return '🗑️';
        if (action.includes('Verify')) return '✅';
        return '📝';
    };

    // Generate action color
    const getActionColor = (action) => {
        if (action.includes('Login')) return '#4caf50';
        if (action.includes('Logout')) return '#9e9e9e';
        if (action.includes('Payment')) return '#4caf50';
        if (action.includes('Expense')) return '#f44336';
        if (action.includes('Lock')) return '#2196f3';
        if (action.includes('Unlock')) return '#ff9800';
        if (action.includes('Reset') || action.includes('Delete')) return '#d32f2f';
        if (action.includes('Device')) return '#9c27b0';
        return '#757575';
    };

    // Pagination
    const logsPerPage = 50;
    const currentPage = window.logCurrentPage || 1;
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    container.innerHTML = `
        <div class="card">
            <h3>📋 Activity Logs</h3>
            
            <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:20px;">
                <strong>Total Logs:</strong> ${sortedLogs.length} activities
                ${filteredLogs.length !== sortedLogs.length ? `<span style="color:#2196f3;"> (${filteredLogs.length} shown after filters)</span>` : ''}
            </div>
            
            <!-- FILTERS -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by User</label>
                    <select id="logFilterUser" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                        <option value="all">All Users</option>
                        ${uniqueUsers.map(u => `
                            <option value="${u.id}" ${filterUser === u.id ? 'selected' : ''}>${u.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by Action</label>
                    <select id="logFilterAction" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                        <option value="all">All Actions</option>
                        ${uniqueActions.map(a => `
                            <option value="${a}" ${filterAction === a ? 'selected' : ''}>${getActionIcon(a)} ${a}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by Date</label>
                    <input type="date" id="logFilterDate" value="${filterDate !== 'all' ? filterDate : ''}" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                </div>
            </div>
            
            <button onclick="clearLogFilters()" class="btn btn-secondary" style="width:100%;margin-bottom:20px;">
                🔄 Clear All Filters
            </button>
            
            <!-- LOGS LIST -->
            <div style="max-height:600px;overflow-y:auto;">
                ${paginatedLogs.map(log => {
        const actionColor = getActionColor(log.action);
        const actionIcon = getActionIcon(log.action);

        return `
                        <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${actionColor};">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                                <div style="flex:1;">
                                    <div style="font-size:16px;font-weight:bold;color:${actionColor};margin-bottom:5px;">
                                        ${actionIcon} ${log.action}
                                    </div>
                                    <div style="font-size:14px;color:#666;margin-bottom:5px;">
                                        <strong>${log.userName}</strong> <span style="color:#999;">(${log.userRole})</span>
                                    </div>
                                    ${log.details ? `<div style="font-size:14px;color:#333;margin-bottom:5px;">${log.details}</div>` : ''}
                                </div>
                                <div style="text-align:right;min-width:150px;">
                                    <div style="font-size:12px;color:#999;">${utils.formatDateTime(log.timestamp)}</div>
                                    <div style="font-size:11px;color:#bbb;">${utils.timeAgo(log.timestamp)}</div>
                                </div>
                            </div>
                            
                            ${log.device ? `
                                <div style="background:#fff;padding:10px;border-radius:5px;font-size:12px;color:#666;">
                                    <strong>Device Info:</strong>
                                    ${log.device.deviceType} • ${log.device.os} • ${log.device.browser}
                                    ${log.device.screenResolution ? ` • ${log.device.screenResolution}` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
    }).join('')}
            </div>
            
            <!-- PAGINATION -->
            ${totalPages > 1 ? `
                <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:20px;padding-top:20px;border-top:1px solid #ddd;">
                    <button 
                        onclick="changeLogPage(${currentPage - 1})" 
                        ${currentPage === 1 ? 'disabled' : ''}
                        class="btn btn-secondary"
                        style="padding:8px 15px;">
                        ← Previous
                    </button>
                    
                    <div style="color:#666;font-size:14px;">
                        Page ${currentPage} of ${totalPages}
                    </div>
                    
                    <button 
                        onclick="changeLogPage(${currentPage + 1})" 
                        ${currentPage === totalPages ? 'disabled' : ''}
                        class="btn btn-secondary"
                        style="padding:8px 15px;">
                        Next →
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Apply log filters
 */
function applyLogFilters() {
    window.logFilterUser = document.getElementById('logFilterUser').value;
    window.logFilterAction = document.getElementById('logFilterAction').value;
    const dateInput = document.getElementById('logFilterDate').value;
    window.logFilterDate = dateInput || 'all';
    window.logCurrentPage = 1; // Reset to first page

    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * Clear log filters
 */
function clearLogFilters() {
    window.logFilterUser = 'all';
    window.logFilterAction = 'all';
    window.logFilterDate = 'all';
    window.logCurrentPage = 1;

    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * Change log page
 */
function changeLogPage(page) {
    window.logCurrentPage = page;
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

// Toggle back job fields
function toggleBackJobFields() {
    const isBackJob = document.getElementById('isBackJob').checked;
    const backJobFields = document.getElementById('backJobFields');

    if (backJobFields) {
        backJobFields.style.display = isBackJob ? 'block' : 'none';
    }
}

/**
 * Calculate pre-approved total (parts + labor)
 */
function calculatePreApprovedTotal() {
    const partsCost = parseFloat(document.getElementById('preApprovedPartsCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('preApprovedLaborCost').value) || 0;
    const total = partsCost + laborCost;

    const totalField = document.getElementById('preApprovedTotal');
    if (totalField) {
        totalField.value = total.toFixed(2);
    }
}

/**
 * Toggle assign to tech dropdown visibility
 */
function toggleAssignToTech() {
    const assignOption = document.querySelector('input[name="assignOption"]:checked')?.value;
    const assignToTechWrapper = document.getElementById('assignToTechWrapper');

    if (assignToTechWrapper) {
        assignToTechWrapper.style.display = assignOption === 'assign-other' ? 'block' : 'none';
    }
}

/**
 * Handle problem type selection
 */
function handleProblemTypeChange() {
    const problemType = document.getElementById('problemType')?.value;
    if (!problemType) return;

    const softwareWarning = document.getElementById('softwareWarningBox');
    const frpWarning = document.getElementById('frpWarningBox');

    const softwareIssues = ['FRP Lock', 'Password Lock', 'iCloud Lock', 'Software Restore',
        'Virus/Malware', 'OS Update', 'App Issues', 'Slow Performance',
        'Data Recovery', 'Other Software'];

    const lockIssues = ['FRP Lock', 'Password Lock', 'iCloud Lock'];

    if (softwareWarning) {
        softwareWarning.style.display = softwareIssues.includes(problemType) ? 'block' : 'none';
    }

    if (frpWarning) {
        frpWarning.style.display = lockIssues.includes(problemType) ? 'block' : 'none';
    }

    // Auto-suggest repair type in pricing section based on reported problem
    const repairTypeSelect = document.getElementById('preApprovedRepairType');
    if (repairTypeSelect && utils && utils.suggestRepairType) {
        const suggestedRepair = utils.suggestRepairType(problemType);
        if (suggestedRepair) {
            repairTypeSelect.value = suggestedRepair;
        }
    }
}

/**
 * Build Claimed Units Page
 */
function buildClaimedUnitsPage(container) {
    console.log('✅ Building Claimed Units page');
    window.currentTabRefresh = () => buildClaimedUnitsPage(document.getElementById('claimedTab'));

    const role = window.currentUserData.role;
    const techId = window.currentUser.uid;

    // Filter claimed devices
    let claimedUnits = window.allRepairs.filter(r => r.claimedAt);

    // For technicians, exclude their own devices (they use "My Claimed" tab)
    if (role === 'technician') {
        claimedUnits = claimedUnits.filter(r => r.acceptedBy !== techId);
    }

    // Sort by most recent first
    claimedUnits.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    container.innerHTML = `
        <div class="card">
            <h3>✅ Claimed Units - Released to Customers (${claimedUnits.length})</h3>
            <p style="color:#666;margin-bottom:15px;">
                ${role === 'technician'
            ? 'Other technicians\' claimed devices (use "My Claimed" for your own)'
            : 'Devices that have been picked up by customers with warranty tracking'}
            </p>
            
            ${claimedUnits.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📭</h2>
                    <p>No claimed units${role === 'technician' ? ' from other technicians' : ''}</p>
                </div>
            ` : `
                <div id="claimedUnitsList"></div>
            `}
        </div>
    `;

    setTimeout(() => {
        const listContainer = document.getElementById('claimedUnitsList');
        if (listContainer && claimedUnits.length > 0) {
            displayGroupedRepairsList(claimedUnits, listContainer, 'claimed', 'claimedAt');
        }
    }, 0);
}

/**
 * Change remittance view date
 */
function changeRemittanceDate(dateOrAction) {
    let newDate;

    if (dateOrAction === null) {
        // Go to today
        newDate = null;
    } else if (dateOrAction === 'prev') {
        // Previous day - use local date to avoid timezone issues
        const current = window.selectedRemittanceDate
            ? new Date(window.selectedRemittanceDate + 'T00:00:00')
            : new Date();
        current.setDate(current.getDate() - 1);
        newDate = getLocalDateString(current);
    } else if (dateOrAction === 'next') {
        // Next day - use local date to avoid timezone issues
        const current = window.selectedRemittanceDate
            ? new Date(window.selectedRemittanceDate + 'T00:00:00')
            : new Date();
        current.setDate(current.getDate() + 1);
        const today = getLocalDateString(new Date());
        const next = getLocalDateString(current);
        if (next > today) {
            return; // Don't go beyond today
        }
        newDate = next;
    } else {
        // Specific date from picker
        newDate = dateOrAction;
    }

    // Store the selected date
    window.selectedRemittanceDate = newDate;

    // Rebuild tab with selected date
    const container = document.getElementById('remittanceTab');
    if (container) {
        buildDailyRemittanceTab(container, newDate);
    }
}

// Export to global scope
window.buildTabs = buildTabs;
window.switchTab = switchTab;
window.toggleUserActivitySection = toggleUserActivitySection;
window.changeRemittanceDate = changeRemittanceDate;
window.buildReceivedDevicesPage = buildReceivedDevicesPage;
window.buildInProgressPage = buildInProgressPage;
window.buildForReleasePage = buildForReleasePage;
window.buildReceiveDeviceTab = buildReceiveDeviceTab;
window.populateReceiveSupplierDropdown = populateReceiveSupplierDropdown;
window.buildMyRequestsTab = buildMyRequestsTab;
window.buildModificationRequestsTab = buildModificationRequestsTab;
window.buildRefundRequestsTab = buildRefundRequestsTab;
window.approveRefundRequest = approveRefundRequest;
window.rejectRefundRequest = rejectRefundRequest;
window.buildUnpaidTab = buildUnpaidTab;
window.buildPendingPaymentsTab = buildPendingPaymentsTab;
window.buildPaidTab = buildPaidTab;
window.displayRepairsInContainer = displayRepairsInContainer;
window.displayCompactRepairsList = displayCompactRepairsList;
window.displayGroupedRepairsList = displayGroupedRepairsList;
window.toggleDateGroup = toggleDateGroup;
window.renderExpandedRepairDetails = renderExpandedRepairDetails;
window.renderForReleaseButtons = renderForReleaseButtons;
window.renderReleasedButtons = renderReleasedButtons;
window.renderClaimedButtons = renderClaimedButtons;
window.toggleRepairDetails = toggleRepairDetails;
window.buildAllRepairsTab = buildAllRepairsTab;
window.filterAllRepairs = filterAllRepairs;
window.buildMyRepairsTab = buildMyRepairsTab;
window.buildMyClaimedDevicesTab = buildMyClaimedDevicesTab;
window.buildPendingTab = buildPendingTab;
window.buildCashCountTab = buildCashCountTab;
window.updateCashCountDate = updateCashCountDate;
window.viewLockedDay = viewLockedDay;
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;
window.toggleBackJobFields = toggleBackJobFields;
window.calculatePreApprovedTotal = calculatePreApprovedTotal;
window.toggleAssignToTech = toggleAssignToTech;
window.buildClaimedUnitsPage = buildClaimedUnitsPage;
window.applyLogFilters = applyLogFilters;
window.clearLogFilters = clearLogFilters;
window.changeLogPage = changeLogPage;
window.handleProblemTypeChange = handleProblemTypeChange;

/**
 * Build Daily Remittance Tab (Technician) - Enhanced with status & history
 */
function buildDailyRemittanceTab(container) {
    console.log('💸 Building Daily Remittance tab - Enhanced with status & history');

    const techId = window.currentUser.uid;
    const today = new Date();
    const todayStr = getLocalDateString(today);

    // Set refresh function
    window.currentTabRefresh = () => buildDailyRemittanceTab(document.getElementById('remittanceTab'));

    // Get technician's remittances
    const myRemittances = window.techRemittances.filter(r => r.techId === techId);
    const pendingRemittances = myRemittances.filter(r => r.status === 'pending');
    const rejectedRemittances = myRemittances.filter(r =>
        r.status === 'rejected' && !r.manuallyResolved
    );
    const approvedCommissions = myRemittances.filter(r =>
        r.status === 'approved' && r.commissionPaid === false
    );

    // Get all pending dates with balances
    const pendingDates = window.getPendingRemittanceDates(techId);

    // Get today's summary for display
    const { payments, total: paymentsTotal } = window.getTechDailyPayments(techId, todayStr);
    const { payments: gcashPayments, total: gcashTotal } = window.getTechDailyGCashPayments(techId, todayStr);
    const { expenses, total: expensesTotal } = window.getTechDailyExpenses(techId, todayStr);
    const { breakdown: commissionBreakdown, total: commissionTotal } = window.getTechDailyCommission(techId, todayStr);

    // Today's unremitted balance
    const todayBalance = window.getUnremittedBalance(techId, todayStr);
    const hasUnremittedToday = pendingDates.some(d => d.dateString === todayStr);

    // History filtering state
    const historyFilter = window.remittanceHistoryFilter || 'last30';
    const historyPage = window.remittanceHistoryPage || 0;
    const itemsPerPage = 10;

    container.innerHTML = `
        <div class="page-header">
            <h2>💸 Daily Cash Remittance</h2>
            <p>Track your submissions, commissions, and remittance history</p>
        </div>
        
        ${generateHelpBox('techRemittance', getCurrentHelpLanguage())}
        
        <!-- REJECTED REMITTANCES ALERT -->
        ${rejectedRemittances.length > 0 ? `
            <div class="card" style="background:#ffebee;border-left:4px solid #f44336;margin:20px 0;">
                <h3 style="color:#c62828;">⚠️ Rejected Remittances (${rejectedRemittances.length})</h3>
                <p style="color:#666;margin-bottom:15px;">These remittances were rejected and need to be resubmitted</p>
                
                ${rejectedRemittances.map(r => `
                    <div class="repair-card" style="border-left-color:#f44336;background:white;margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                            <div>
                                <h4 style="color:#c62828;margin:0 0 5px 0;">
                                    ${utils.formatDate(r.date)}
                                </h4>
                                <p style="font-size:13px;color:#666;margin:5px 0;">
                                    Amount: ₱${r.actualAmount.toFixed(2)}
                                </p>
                                <p style="font-size:13px;color:#666;margin:5px 0;">
                                    Rejected by: ${r.verifiedBy || 'Unknown'}
                                </p>
                                <p style="font-size:12px;color:#999;margin:5px 0;">
                                    ${utils.formatDateTime(r.verifiedAt)}
                                </p>
                            </div>
                            <span class="status-badge" style="background:#f44336;color:white;">
                                ❌ REJECTED
                            </span>
                        </div>
                        
                        <div style="background:#ffebee;padding:12px;border-radius:8px;margin:10px 0;">
                            <strong style="color:#c62828;">Rejection Reason:</strong>
                            <p style="margin:8px 0 0 0;color:#666;">${r.verificationNotes || 'No reason provided'}</p>
                        </div>
                        
                        <div style="display:grid;grid-template-columns:${(!r.remittanceType || r.remittanceType === 'cash') ? '1fr 1fr' : '1fr'};gap:10px;margin-top:10px;">
                            <button onclick="open${r.remittanceType === 'gcash' ? 'GCash' : 'SingleDay'}RemittanceModal('${getLocalDateString(new Date(r.date))}')" 
                                    class="btn-primary" 
                                    style="background:#f44336;padding:10px;">
                                🔄 Resubmit
                            </button>
                            ${(!r.remittanceType || r.remittanceType === 'cash') ? `
                                <button onclick="markRemittanceAsResolved('${r.id}')" 
                                        class="btn-secondary" 
                                        style="padding:10px;">
                                    ✅ Mark as Manually Fixed
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <!-- PENDING VERIFICATION STATUS -->
        ${pendingRemittances.length > 0 ? `
            <div class="card" style="background:#fff3cd;border-left:4px solid #ff9800;margin:20px 0;">
                <h3 style="color:#f57c00;">⏳ Pending Verification (${pendingRemittances.length})</h3>
                <p style="color:#666;margin-bottom:15px;">Waiting for approval from cashier/admin</p>
                
                ${pendingRemittances.map(r => {
        const submittedDate = new Date(r.submittedAt);
        const hoursPending = Math.floor((new Date() - submittedDate) / (1000 * 60 * 60));

        return `
                        <div class="repair-card" style="border-left-color:#ff9800;background:white;margin-bottom:15px;">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4 style="color:#f57c00;margin:0 0 5px 0;">
                                        ${utils.formatDate(r.date)}
                                    </h4>
                                    <p style="font-size:13px;color:#666;margin:5px 0;">
                                        Amount: ₱${r.actualAmount.toFixed(2)}
                                    </p>
                                    <p style="font-size:13px;color:#666;margin:5px 0;">
                                        Submitted to: ${r.submittedToName || 'Unknown'}
                                    </p>
                                    <p style="font-size:12px;color:#999;margin:5px 0;">
                                        ${utils.timeAgo(r.submittedAt)} (${utils.formatDateTime(r.submittedAt)})
                                    </p>
                                    <p style="font-size:12px;color:${hoursPending > 24 ? '#f44336' : '#999'};margin:5px 0;font-weight:${hoursPending > 24 ? 'bold' : 'normal'};">
                                        ⏰ ${hoursPending < 1 ? 'Less than 1 hour' : `${hoursPending} hour${hoursPending > 1 ? 's' : ''}`} pending
                                    </p>
                                </div>
                                <span class="status-badge" style="background:#ff9800;color:white;">
                                    ⏳ PENDING
                                </span>
                            </div>
                            
                            ${r.totalCommission > 0 ? `
                                <div style="background:#e8f5e9;padding:10px;border-radius:6px;margin-top:10px;font-size:13px;">
                                    💰 Commission: ₱${r.totalCommission.toFixed(2)} (${r.commissionPaymentPreference || 'Not specified'})
                                </div>
                            ` : ''}
                        </div>
                    `;
    }).join('')}
            </div>
        ` : ''}
        
        <!-- APPROVED COMMISSIONS AWAITING PAYMENT -->
        ${approvedCommissions.length > 0 ? `
            <div class="card" style="background:#e8f5e9;border-left:4px solid #4caf50;margin:20px 0;">
                <h3 style="color:#2e7d32;">💰 Approved Commissions Awaiting Payment (${approvedCommissions.length})</h3>
                <p style="color:#666;margin-bottom:15px;">These commissions have been approved. Mark as received when you get paid.</p>
                
                ${(() => {
                const totalCash = approvedCommissions.reduce((sum, r) =>
                    r.commissionPaymentPreference === 'cash' ? sum + (r.totalCommission || 0) : sum, 0
                );
                const totalGCash = approvedCommissions.reduce((sum, r) =>
                    r.commissionPaymentPreference === 'gcash' ? sum + (r.totalCommission || 0) : sum, 0
                );

                return `
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
                            ${totalCash > 0 ? `
                                <div style="background:white;padding:15px;border-radius:8px;text-align:center;">
                                    <div style="font-size:14px;color:#666;">💵 Cash Commission</div>
                                    <div style="font-size:24px;font-weight:bold;color:#4caf50;margin:10px 0;">₱${totalCash.toFixed(2)}</div>
                                </div>
                            ` : ''}
                            ${totalGCash > 0 ? `
                                <div style="background:white;padding:15px;border-radius:8px;text-align:center;">
                                    <div style="font-size:14px;color:#666;">📱 GCash Commission</div>
                                    <div style="font-size:24px;font-weight:bold;color:#00bcd4;margin:10px 0;">₱${totalGCash.toFixed(2)}</div>
                                </div>
                            ` : ''}
                        </div>
                    `;
            })()}
                
                ${approvedCommissions.map(r => `
                    <div class="repair-card" style="border-left-color:#4caf50;background:white;margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                            <div>
                                <h4 style="color:#2e7d32;margin:0 0 5px 0;">
                                    ${utils.formatDate(r.date)}
                                </h4>
                                <p style="font-size:13px;color:#666;margin:5px 0;">
                                    Commission: ₱${r.totalCommission.toFixed(2)}
                                </p>
                                <p style="font-size:13px;color:#666;margin:5px 0;">
                                    Payment Method: ${r.commissionPaymentPreference === 'cash' ? '💵 Cash' : '📱 GCash'}
                                </p>
                                <p style="font-size:12px;color:#999;margin:5px 0;">
                                    Approved by: ${r.verifiedBy}
                                </p>
                                <p style="font-size:12px;color:#999;margin:5px 0;">
                                    ${utils.formatDateTime(r.verifiedAt)}
                                </p>
                            </div>
                            <span class="status-badge" style="background:#4caf50;color:white;">
                                ✅ APPROVED
                            </span>
                        </div>
                        
                        <button onclick="markCommissionReceived('${r.id}')" 
                                class="btn-primary" 
                                style="background:#4caf50;width:100%;margin-top:10px;">
                            ✅ Mark as Received
                        </button>
                    </div>
                `).join('')}
                
                <p style="font-size:12px;color:#666;margin-top:15px;padding:10px;background:white;border-radius:6px;">
                    ℹ️ <strong>Note:</strong> Click "Mark as Received" after you physically receive the commission payment. 
                    If there's any discrepancy in the amount, you can report it during confirmation.
                </p>
            </div>
        ` : ''}
        
        <!-- Today's Summary -->
        <div style="background:#e3f2fd;padding:20px;border-radius:10px;border-left:4px solid #2196f3;margin:20px 0;">
            <h3 style="margin-top:0;">📅 Today - ${utils.formatDate(today)}</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin:15px 0;">
                <div>
                    <div style="font-size:14px;color:#666;">💵 Cash Collected</div>
                    <div style="font-size:20px;font-weight:bold;color:#1976d2;">₱${paymentsTotal.toFixed(2)}</div>
                    <div style="font-size:12px;color:#999;">${payments.length} payment(s)</div>
                </div>
                <div>
                    <div style="font-size:14px;color:#666;">📱 GCash Processed</div>
                    <div style="font-size:20px;font-weight:bold;color:#0097a7;">₱${gcashTotal.toFixed(2)}</div>
                    <div style="font-size:12px;color:#999;">${gcashPayments.length} payment(s)</div>
                </div>
                <div>
                    <div style="font-size:14px;color:#666;">💸 Expenses</div>
                    <div style="font-size:20px;font-weight:bold;color:#f44336;">-₱${expensesTotal.toFixed(2)}</div>
                    <div style="font-size:12px;color:#999;">${expenses.length} item(s)</div>
                </div>
                <div style="background:white;padding:10px;border-radius:8px;">
                    <div style="font-size:14px;color:#666;">💳 To Remit (60%)</div>
                    <div style="font-size:20px;font-weight:bold;color:#4caf50;">₱${todayBalance.unremittedBalance.toFixed(2)}</div>
                    <div style="font-size:12px;color:#999;">After commission</div>
                </div>
            </div>
        </div>
        
        <!-- PENDING GCASH REMITTANCES -->
        ${window.getPendingGCashDates && (() => {
            const pendingGCashDates = window.getPendingGCashDates(techId);
            return pendingGCashDates.length > 0 ? `
                <div class="card" style="margin:20px 0;background:#e1f5fe;border-left:4px solid #00bcd4;">
                    <h3 style="color:#0097a7;">📱 Pending GCash Remittances (${pendingGCashDates.length})</h3>
                    <p style="color:#666;font-size:14px;margin-bottom:15px;">
                        Report GCash payments received to track your commission
                    </p>
                    
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${pendingGCashDates.map((dateData) => {
                const isToday = dateData.dateString === todayStr;
                const displayLabel = isToday ? '📅 Today' : `📅 ${utils.formatDate(dateData.dateString)}`;
                const daysAgo = Math.floor((new Date() - dateData.date) / (1000 * 60 * 60 * 24));
                const daysLabel = isToday ? '' : `(${daysAgo} day${daysAgo > 1 ? 's' : ''} ago)`;

                return `
                                <div style="background:white;border:2px solid #00bcd4;border-radius:10px;padding:15px;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                        <div>
                                            <div style="font-weight:bold;font-size:16px;color:#0097a7;">${displayLabel} ${daysLabel}</div>
                                            <div style="font-size:12px;color:#999;margin-top:3px;">${dateData.payments.length} GCash payment(s)</div>
                                        </div>
                                    </div>
                                    
                                    <div style="background:#e1f5fe;padding:12px;border-radius:8px;margin-bottom:12px;">
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;">
                                            <span>📱 Total GCash:</span>
                                            <strong>₱${dateData.totalPayments.toFixed(2)}</strong>
                                        </div>
                                        ${dateData.totalPartsCost > 0 ? `
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#f44336;">
                                            <span>🔧 Parts Cost:</span>
                                            <strong>-₱${dateData.totalPartsCost.toFixed(2)}</strong>
                                        </div>
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;padding-top:5px;border-top:1px dashed #ccc;">
                                            <span><strong>Net Amount:</strong></span>
                                            <strong>₱${dateData.totalNetAmount.toFixed(2)}</strong>
                                        </div>
                                        ` : ''}
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#4caf50;">
                                            <span>🏦 Remitted (60%):</span>
                                            <strong>₱${dateData.remittedAmount.toFixed(2)}</strong>
                                        </div>
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#2196f3;">
                                            <span>👤 Commission (40%):</span>
                                            <strong>₱${dateData.totalCommission.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                    
                                    <button onclick="openGCashRemittanceModal('${dateData.dateString}')" 
                                            style="width:100%;padding:10px;background:#00bcd4;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer;transition:background 0.3s;"
                                            onmouseover="this.style.background='#0097a7';"
                                            onmouseout="this.style.background='#00bcd4';">
                                        📱 Report GCash Remittance
                                    </button>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            ` : '';
        })()}
        
        <!-- Pending Remittance Dates (CASH) -->
        <div class="card" style="margin:20px 0;">
            <h3>💵 Pending Cash Remittances${pendingDates.length > 0 ? ` (${pendingDates.length} date${pendingDates.length > 1 ? 's' : ''})` : ''}</h3>
            
            ${pendingDates.length > 0 ? `
                <div style="margin:15px 0;">
                    <p style="color:#666;font-size:14px;margin-bottom:10px;">
                        Click a date below to submit remittance. Recommended: Start with oldest date.
                    </p>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${pendingDates.map((dateData, idx) => {
            const isToday = dateData.dateString === todayStr;
            const displayLabel = isToday ? '📅 Today' : `📅 ${utils.formatDate(dateData.dateString)}`;
            const daysAgo = Math.floor((new Date() - dateData.date) / (1000 * 60 * 60 * 24));
            const daysLabel = isToday ? '' : `(${daysAgo} day${daysAgo > 1 ? 's' : ''} ago)`;

            return `
                                <div data-remittance-date="${dateData.dateString}" 
                                     style="background:white;border:2px solid #e0e0e0;border-radius:10px;padding:15px;cursor:pointer;transition:all 0.3s;"
                                     onmouseover="this.style.borderColor='#2196f3';this.style.boxShadow='0 4px 12px rgba(33,150,243,0.2)';"
                                     onmouseout="this.style.borderColor='#e0e0e0';this.style.boxShadow='none';">
                                    
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                        <div>
                                            <div style="font-weight:bold;font-size:16px;color:#333;">${displayLabel} ${daysLabel}</div>
                                            <div style="font-size:12px;color:#999;margin-top:3px;">${dateData.payments.length} payment(s) • ${dateData.expenses.length} expense(s)</div>
                                        </div>
                                        ${idx === 0 && !isToday ? `
                                            <span style="background:#ff9800;color:white;padding:5px 10px;border-radius:20px;font-size:11px;font-weight:bold;">
                                                ⭐ START HERE
                                            </span>
                                        ` : ''}
                                    </div>
                                    
                                    <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-bottom:12px;">
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;">
                                            <span>Collected:</span>
                                            <strong>₱${dateData.totalPayments.toFixed(2)}</strong>
                                        </div>
                                        ${dateData.totalExpenses > 0 ? `
                                            <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#f44336;">
                                                <span>Expenses:</span>
                                                <strong>-₱${dateData.totalExpenses.toFixed(2)}</strong>
                                            </div>
                                        ` : ''}
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#2196f3;">
                                            <span>Commission (40%):</span>
                                            <strong>-₱${dateData.totalCommission.toFixed(2)}</strong>
                                        </div>
                                        <div style="border-top:2px solid #ddd;margin:10px 0;"></div>
                                        <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:15px;font-weight:bold;">
                                            <span>To Remit (60%):</span>
                                            <span style="color:#4caf50;">₱${dateData.unremittedBalance.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <button onclick="openSingleDayRemittanceModal('${dateData.dateString}')" 
                                            style="width:100%;padding:10px;background:#4caf50;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer;transition:background 0.3s;"
                                            onmouseover="this.style.background='#45a049';"
                                            onmouseout="this.style.background='#4caf50';">
                                        💵 Remit This Day
                                    </button>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            ` : `
                <div style="text-align:center;padding:40px 20px;">
                    <div style="font-size:48px;margin-bottom:10px;">✅</div>
                    <h3 style="color:#4caf50;margin:10px 0;">All Clear!</h3>
                    <p style="color:#999;">No pending remittances. All cash has been submitted.</p>
                </div>
            `}
        </div>
        
        <!-- REMITTANCE HISTORY -->
        <div class="card" style="margin:20px 0;">
            <h3>📋 Remittance History</h3>
            
            <!-- Date Filter -->
            <div style="margin:15px 0;padding:15px;background:#f5f5f5;border-radius:8px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:10px;">
                    <div>
                        <label style="font-weight:bold;margin-bottom:10px;display:block;">📅 Filter by Date:</label>
                        <select id="historyFilter" 
                                onchange="window.remittanceHistoryFilter=this.value;window.remittanceHistoryPage=0;window.currentTabRefresh();"
                                style="padding:8px;border:1px solid #ddd;border-radius:4px;width:100%;">
                            <option value="last7" ${historyFilter === 'last7' ? 'selected' : ''}>Last 7 Days</option>
                            <option value="last30" ${historyFilter === 'last30' ? 'selected' : ''}>Last 30 Days</option>
                            <option value="last90" ${historyFilter === 'last90' ? 'selected' : ''}>Last 90 Days</option>
                            <option value="all" ${historyFilter === 'all' ? 'selected' : ''}>All Time</option>
                            <option value="custom" ${historyFilter === 'custom' ? 'selected' : ''}>Custom Range</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight:bold;margin-bottom:10px;display:block;">💰 Filter by Type:</label>
                        <select id="typeFilter" 
                                onchange="window.remittanceTypeFilter=this.value;window.remittanceHistoryPage=0;window.currentTabRefresh();"
                                style="padding:8px;border:1px solid #ddd;border-radius:4px;width:100%;">
                            <option value="all" ${(window.remittanceTypeFilter || 'all') === 'all' ? 'selected' : ''}>All Types</option>
                            <option value="cash" ${window.remittanceTypeFilter === 'cash' ? 'selected' : ''}>💵 Cash Only</option>
                            <option value="gcash" ${window.remittanceTypeFilter === 'gcash' ? 'selected' : ''}>📱 GCash Only</option>
                        </select>
                    </div>
                </div>
                
                ${historyFilter === 'custom' ? `
                    <div style="margin-top:15px;display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;">
                        <div>
                            <label style="font-size:12px;color:#666;display:block;margin-bottom:5px;">From:</label>
                            <input type="date" 
                                   id="customDateFrom" 
                                   value="${window.customDateFrom || ''}"
                                   style="padding:8px;border:1px solid #ddd;border-radius:4px;width:100%;">
                        </div>
                        <div>
                            <label style="font-size:12px;color:#666;display:block;margin-bottom:5px;">To:</label>
                            <input type="date" 
                                   id="customDateTo" 
                                   value="${window.customDateTo || ''}"
                                   style="padding:8px;border:1px solid #ddd;border-radius:4px;width:100%;">
                        </div>
                        <button onclick="applyCustomDateFilter()" 
                                class="btn-primary" 
                                style="padding:8px 15px;height:38px;">
                            Apply
                        </button>
                    </div>
                ` : ''}
            </div>
            
            ${(() => {
            // Filter history based on selection
            let filteredHistory = myRemittances;
            const now = new Date();
            const typeFilter = window.remittanceTypeFilter || 'all';

            // Apply type filter first
            if (typeFilter === 'cash') {
                filteredHistory = filteredHistory.filter(r => !r.remittanceType || r.remittanceType === 'cash');
            } else if (typeFilter === 'gcash') {
                filteredHistory = filteredHistory.filter(r => r.remittanceType === 'gcash');
            }

            // Apply date filter
            if (historyFilter === 'last7') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredHistory = filteredHistory.filter(r => new Date(r.submittedAt) >= sevenDaysAgo);
            } else if (historyFilter === 'last30') {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredHistory = filteredHistory.filter(r => new Date(r.submittedAt) >= thirtyDaysAgo);
            } else if (historyFilter === 'last90') {
                const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                filteredHistory = filteredHistory.filter(r => new Date(r.submittedAt) >= ninetyDaysAgo);
            } else if (historyFilter === 'custom' && window.customDateFrom && window.customDateTo) {
                const fromDate = new Date(window.customDateFrom);
                const toDate = new Date(window.customDateTo);
                toDate.setHours(23, 59, 59, 999);
                filteredHistory = filteredHistory.filter(r => {
                    const submitDate = new Date(r.submittedAt);
                    return submitDate >= fromDate && submitDate <= toDate;
                });
            }

            // Pagination
            const totalItems = filteredHistory.length;
            const startIndex = historyPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
            const hasMore = endIndex < totalItems;

            if (filteredHistory.length === 0) {
                return `
                        <div style="text-align:center;padding:40px 20px;">
                            <div style="font-size:48px;margin-bottom:10px;">📭</div>
                            <h3 style="color:#999;margin:10px 0;">No Remittances Found</h3>
                            <p style="color:#999;">No remittance history for the selected period.</p>
                        </div>
                    `;
            }

            return `
                    <p style="color:#666;margin:15px 0;">
                        Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} remittance${totalItems > 1 ? 's' : ''}
                    </p>
                    
                    <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
                        ${paginatedHistory.map(r => {
                const statusColor = r.status === 'approved' ? '#4caf50' :
                    r.status === 'rejected' ? '#f44336' : '#ff9800';
                const statusIcon = r.status === 'approved' ? '✅' :
                    r.status === 'rejected' ? '❌' : '⏳';
                const statusText = r.status === 'approved' ? 'APPROVED' :
                    r.status === 'rejected' ? 'REJECTED' : 'PENDING';

                const remitType = r.remittanceType === 'gcash' ? '📱 GCash' : '💵 Cash';
                const remitColor = r.remittanceType === 'gcash' ? '#00bcd4' : '#4caf50';

                return `
                                <details class="repair-card" style="border-left-color:${statusColor};">
                                    <summary style="cursor:pointer;font-weight:bold;padding:10px;background:#f5f5f5;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <span style="font-size:16px;">${utils.formatDate(r.date)}</span>
                                            <span style="font-size:13px;color:#666;margin-left:10px;">
                                                ₱${r.actualAmount.toFixed(2)}
                                            </span>
                                            <span style="font-size:12px;color:${remitColor};margin-left:8px;font-weight:bold;">
                                                ${remitType}
                                            </span>
                                        </div>
                                        <span class="status-badge" style="background:${statusColor};color:white;">
                                            ${statusIcon} ${statusText}
                                        </span>
                                    </summary>
                                    
                                    <div style="padding:15px;background:white;">
                                        <!-- Summary -->
                                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:15px;">
                                            <div>
                                                <div style="font-size:12px;color:#666;">Payments Collected</div>
                                                <div style="font-size:16px;font-weight:bold;">₱${(r.totalPaymentsCollected || 0).toFixed(2)}</div>
                                                <div style="font-size:11px;color:#999;">${(r.paymentsList || []).length} payment(s)</div>
                                            </div>
                                            <div>
                                                <div style="font-size:12px;color:#666;">Expenses</div>
                                                <div style="font-size:16px;font-weight:bold;color:#f44336;">-₱${(r.totalExpenses || 0).toFixed(2)}</div>
                                                <div style="font-size:11px;color:#999;">${(r.expensesList || []).length} item(s)</div>
                                            </div>
                                            <div>
                                                <div style="font-size:12px;color:#666;">Commission (40%)</div>
                                                <div style="font-size:16px;font-weight:bold;color:#2196f3;">₱${(r.totalCommission || 0).toFixed(2)}</div>
                                                <div style="font-size:11px;color:#999;">${r.commissionPaymentPreference || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style="font-size:12px;color:#666;">Remitted (60%)</div>
                                                <div style="font-size:16px;font-weight:bold;color:#4caf50;">₱${(r.actualAmount || 0).toFixed(2)}</div>
                                                ${(r.discrepancy || 0) !== 0 ? `
                                                    <div style="font-size:11px;color:${(r.discrepancy || 0) > 0 ? '#4caf50' : '#f44336'};">
                                                        ${(r.discrepancy || 0) > 0 ? '+' : ''}₱${(r.discrepancy || 0).toFixed(2)}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        
                                        <!-- Submission Info -->
                                        <div style="background:#f5f5f5;padding:12px;border-radius:6px;margin-bottom:15px;">
                                            <div style="font-size:12px;color:#666;margin-bottom:8px;">
                                                <strong>Submitted to:</strong> ${r.submittedToName || 'Unknown'} (${r.submittedToRole || 'N/A'})
                                            </div>
                                            <div style="font-size:12px;color:#666;">
                                                <strong>Submitted:</strong> ${utils.formatDateTime(r.submittedAt)}
                                            </div>
                                            ${r.verifiedAt ? `
                                                <div style="font-size:12px;color:#666;margin-top:8px;">
                                                    <strong>${r.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong> ${r.verifiedBy || 'Unknown'}
                                                </div>
                                                <div style="font-size:12px;color:#666;">
                                                    <strong>${r.status === 'approved' ? 'Approved' : 'Rejected'}:</strong> ${utils.formatDateTime(r.verifiedAt)}
                                                </div>
                                            ` : ''}
                                        </div>
                                        
                                        <!-- Rejection Reason -->
                                        ${r.status === 'rejected' && r.verificationNotes ? `
                                            <div style="background:#ffebee;padding:12px;border-radius:6px;margin-bottom:15px;">
                                                <strong style="color:#c62828;">Rejection Reason:</strong>
                                                <p style="margin:8px 0 0 0;color:#666;">${r.verificationNotes}</p>
                                            </div>
                                        ` : ''}
                                        
                                        <!-- Commission Status -->
                                        ${r.status === 'approved' && r.totalCommission > 0 ? `
                                            <div style="background:${r.commissionPaid ? '#e8f5e9' : '#fff3cd'};padding:12px;border-radius:6px;margin-bottom:15px;">
                                                <strong style="color:${r.commissionPaid ? '#2e7d32' : '#f57c00'};">
                                                    ${r.commissionPaid ? '✅' : '⏳'} Commission: 
                                                </strong>
                                                ${r.commissionPaid ? `
                                                    <span style="color:#2e7d32;">Received</span>
                                                    <div style="font-size:12px;color:#666;margin-top:5px;">
                                                        Confirmed: ${utils.formatDateTime(r.commissionPaidAt)}
                                                    </div>
                                                    ${r.hasCommissionDiscrepancy ? `
                                                        <div style="background:#ffebee;padding:8px;border-radius:4px;margin-top:8px;">
                                                            <strong style="color:#c62828;">⚠️ Discrepancy Reported</strong>
                                                        </div>
                                                    ` : ''}
                                                ` : `
                                                    <span style="color:#f57c00;">Awaiting Payment</span>
                                                    <div style="margin-top:10px;">
                                                        <button onclick="markCommissionReceived('${r.id}')" 
                                                                class="btn-primary" 
                                                                style="background:#4caf50;padding:6px 12px;font-size:13px;">
                                                            ✅ Mark as Received
                                                        </button>
                                                    </div>
                                                `}
                                            </div>
                                        ` : ''}
                                        
                                        <!-- Payment Details -->
                                        <details style="margin-top:10px;">
                                            <summary style="cursor:pointer;font-weight:bold;color:#2196f3;font-size:13px;">
                                                View Payment Details (${(r.paymentsList || []).length})
                                            </summary>
                                            <div style="margin-top:10px;max-height:200px;overflow-y:auto;">
                                                ${(r.paymentsList || []).map(p => `
                                                    <div style="padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;">
                                                        <div>
                                                            <div style="font-weight:600;font-size:13px;">${p.customerName || 'Unknown'}</div>
                                                            <div style="font-size:11px;color:#666;">${p.repairId || '-'}</div>
                                                        </div>
                                                        <div style="font-weight:bold;">₱${(p.amount || 0).toFixed(2)}</div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </details>
                                        
                                        <!-- Expense Details -->
                                        ${(r.expensesList || []).length > 0 ? `
                                            <details style="margin-top:10px;">
                                                <summary style="cursor:pointer;font-weight:bold;color:#f44336;font-size:13px;">
                                                    View Expense Details (${(r.expensesList || []).length})
                                                </summary>
                                                <div style="margin-top:10px;max-height:200px;overflow-y:auto;">
                                                    ${(r.expensesList || []).map(e => `
                                                        <div style="padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;">
                                                            <div>
                                                                <div style="font-weight:600;font-size:13px;">${e.category || 'Unknown'}</div>
                                                                <div style="font-size:11px;color:#666;">${e.description || '-'}</div>
                                                            </div>
                                                            <div style="font-weight:bold;color:#f44336;">-₱${(e.amount || 0).toFixed(2)}</div>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            </details>
                                        ` : ''}
                                    </div>
                                </details>
                            `;
            }).join('')}
                    </div>
                    
                    <!-- Pagination -->
                    ${hasMore || historyPage > 0 ? `
                        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
                            ${historyPage > 0 ? `
                                <button onclick="window.remittanceHistoryPage--;window.currentTabRefresh();" 
                                        class="btn-primary" 
                                        style="padding:10px 20px;">
                                    ← Previous
                                </button>
                            ` : ''}
                            ${hasMore ? `
                                <button onclick="window.remittanceHistoryPage++;window.currentTabRefresh();" 
                                        class="btn-primary" 
                                        style="padding:10px 20px;">
                                    Load More →
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                `;
        })()}
        </div>
        
        <!-- Today's Details (existing sections remain) -->
        ${hasUnremittedToday ? `
            <div class="card" style="margin:20px 0;background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>📥 Today's Cash Payments</h3>
                ${payments.length > 0 ? `
                    <div style="background:white;border-radius:8px;overflow:hidden;">
                        ${payments.map((p, idx) => `
                            <div style="padding:12px;border-bottom:${idx < payments.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;color:#333;">${p.customerName}</div>
                                    <div style="font-size:12px;color:#666;">Repair: ${p.repairId}</div>
                                </div>
                                <div style="font-weight:bold;color:#4caf50;font-size:16px;">₱${p.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color:#999;text-align:center;padding:20px;">No cash payments today</p>'}
            </div>
        ` : ''}
        
        ${gcashPayments.length > 0 ? `
            <div class="card" style="margin:20px 0;background:#e1f5fe;border-left:4px solid #00bcd4;">
                <h3>📱 GCash Payments (Not included in cash remittance)</h3>
                <p style="color:#666;font-size:13px;margin-bottom:15px;">GCash payments go directly to shop account - no remittance needed.</p>
                <div style="background:white;border-radius:8px;overflow:hidden;">
                    ${gcashPayments.map((gp, idx) => `
                        <div style="padding:12px;border-bottom:${idx < gcashPayments.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:600;color:#333;">${gp.customerName}</div>
                                <div style="font-size:12px;color:#666;">Ref: ${gp.gcashReferenceNumber || 'N/A'}</div>
                            </div>
                            <div style="font-weight:bold;color:#00bcd4;font-size:16px;">₱${gp.amount.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${expensesTotal > 0 ? `
            <div class="card" style="margin:20px 0;">
                <h3>💸 Today's Expenses</h3>
                <div style="background:white;border-radius:8px;overflow:hidden;">
                    ${expenses.map((e, idx) => `
                        <div style="padding:12px;border-bottom:${idx < expenses.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:600;color:#333;">${e.category || e.type}</div>
                                <div style="font-size:12px;color:#666;">${e.description || '-'}</div>
                            </div>
                            <div style="font-weight:bold;color:#f44336;font-size:16px;">-₱${e.amount.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="openExpenseModal()" class="btn-primary" style="margin-top:15px;width:100%;">
                    ➕ Add Expense
                </button>
            </div>
        ` : `
            <div style="margin:20px 0;">
                <button onclick="openExpenseModal()" class="btn-primary" style="width:100%;">
                    ➕ Record Expense
                </button>
            </div>
        `}
        
        ${commissionTotal > 0 ? `
            <div class="card" style="margin:20px 0;background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>💰 Today's Commission</h3>
                <p style="color:#666;font-size:13px;margin-bottom:15px;">40% commission on labor (Total - Parts Cost)</p>
                <div style="background:white;border-radius:8px;padding:15px;">
                    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;">
                        <span>Commission Earned:</span>
                        <span style="color:#4caf50;">₱${commissionTotal.toFixed(2)}</span>
                    </div>
                    <p style="font-size:12px;color:#666;margin-top:10px;">
                        ℹ️ Commission is deducted from your remittance amount and credited to you via your selected payment method.
                    </p>
                </div>
            </div>
        ` : ''}
    `;
}

/**
 * Apply custom date range filter
 */
function applyCustomDateFilter() {
    const fromInput = document.getElementById('customDateFrom');
    const toInput = document.getElementById('customDateTo');

    if (!fromInput.value || !toInput.value) {
        alert('⚠️ Please select both From and To dates');
        return;
    }

    const fromDate = new Date(fromInput.value);
    const toDate = new Date(toInput.value);

    if (fromDate > toDate) {
        alert('⚠️ From date cannot be after To date');
        return;
    }

    window.customDateFrom = fromInput.value;
    window.customDateTo = toInput.value;
    window.remittanceHistoryPage = 0;

    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

window.applyCustomDateFilter = applyCustomDateFilter;
/**
 * Build Remittance Verification Tab (Cashier/Admin/Manager)
 */
function buildRemittanceVerificationTab(container) {
    console.log('✅ Building Remittance Verification tab');
    window.currentTabRefresh = () => buildRemittanceVerificationTab(document.getElementById('verify-remittanceTab'));

    const currentUserId = window.currentUser.uid;
    const currentUserRole = window.currentUserData.role;
    const isAdmin = currentUserRole === 'admin';

    // Separate CASH remittances: for me vs others
    const cashForMe = window.techRemittances
        .filter(r => r.status === 'pending' && r.submittedTo === currentUserId && (!r.remittanceType || r.remittanceType === 'cash'))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const cashForOthers = window.techRemittances
        .filter(r => r.status === 'pending' && r.submittedTo && r.submittedTo !== currentUserId && (!r.remittanceType || r.remittanceType === 'cash'))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // GCASH remittances: for me (receiver verification)
    const gcashForMe = window.techRemittances
        .filter(r => r.status === 'pending' && r.remittanceType === 'gcash' && r.gcashReceiverUid === currentUserId)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Legacy pending (no recipient specified)
    const legacyPending = window.techRemittances
        .filter(r => r.status === 'pending' && !r.submittedTo)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Get recent verified remittances
    const recentVerified = window.techRemittances
        .filter(r => r.status === 'approved' || r.status === 'rejected')
        .sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt))
        .slice(0, 10);

    container.innerHTML = `
        <div class="page-header">
            <h2>✅ Verify Remittances</h2>
            <p>Review and approve technician cash remittances</p>
        </div>
        
        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#fffbf0;border-left:4px solid #ff9800;">
                <h3>${cashForMe.length}</h3>
                <p>💵 Cash For Me</p>
                <small>Cash remittances submitted to you</small>
            </div>
            <div class="stat-card" style="background:#e1f5fe;border-left:4px solid #00bcd4;">
                <h3>${gcashForMe.length}</h3>
                <p>📱 GCash For Me</p>
                <small>GCash reports awaiting verification</small>
            </div>
            ${isAdmin ? `
                <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                    <h3>${cashForOthers.length}</h3>
                    <p>👥 For Others</p>
                    <small>Submitted to other staff</small>
                </div>
            ` : cashForOthers.length > 0 ? `
                <div class="stat-card" style="background:#f5f5f5;border-left:4px solid #999;">
                    <h3>${cashForOthers.length}</h3>
                    <p>👥 For Others</p>
                    <small>Cannot verify these</small>
                </div>
            ` : ''}
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>₱${([...cashForMe, ...gcashForMe].reduce((sum, r) => sum + (r.actualAmount || r.totalPaymentsCollected || 0), 0)).toFixed(2)}</h3>
                <p>💰 Total For Me</p>
                <small>Combined amount awaiting verification</small>
            </div>
        </div>
        
        <!-- GCash For Me Section (Priority - Simple Verify) -->
        ${gcashForMe.length > 0 ? `
            <div class="card" style="border-left:4px solid #00bcd4;background:#e1f5fe;margin:20px 0;">
                <h3 style="color:#0097a7;">📱 GCash Reports For Me (${gcashForMe.length})</h3>
                <p style="color:#666;margin-bottom:15px;">Verify that you received these GCash payments in your account</p>
                
                <div class="repairs-list">
                    ${gcashForMe.map(r => {
        return `
                            <div class="remittance-card" style="border-left-color:#00bcd4;background:#fff;">
                                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:15px;">
                                    <div>
                                        <h4 style="color:#0097a7;">${r.techName}</h4>
                                        <p style="font-size:14px;color:#666;margin:5px 0;">
                                            Date: ${utils.formatDate(r.date)}
                                        </p>
                                        <p style="font-size:13px;color:#999;margin:5px 0;">
                                            Submitted: ${utils.formatDateTime(r.submittedAt)}
                                        </p>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:24px;font-weight:bold;color:#00bcd4;">
                                            ₱${r.totalPaymentsCollected.toFixed(2)}
                                        </div>
                                        <div style="font-size:12px;color:#666;">Total GCash</div>
                                    </div>
                                </div>
                                
                                <div style="background:#e1f5fe;padding:15px;border-radius:8px;margin:15px 0;">
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                                        <div>
                                            <div style="font-size:12px;color:#666;">📱 ${r.paymentsList.length} GCash Payment(s)</div>
                                            <div style="font-size:18px;font-weight:bold;color:#00bcd4;">₱${r.totalPaymentsCollected.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div style="font-size:12px;color:#666;">👤 Tech Commission (40%)</div>
                                            <div style="font-size:18px;font-weight:bold;color:#2196f3;">₱${r.totalCommission.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    ${r.gcashNote ? `
                                        <div style="margin-top:10px;padding:10px;background:white;border-radius:4px;">
                                            <strong style="font-size:12px;color:#666;">Note:</strong>
                                            <p style="margin:5px 0 0 0;font-size:13px;">${r.gcashNote}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div style="background:#fff3cd;padding:12px;border-radius:6px;margin:15px 0;">
                                    <strong style="color:#f57c00;">⚠️ Verification Instructions:</strong>
                                    <ul style="margin:10px 0;padding-left:20px;color:#666;">
                                        <li>Check your GCash account for ₱${r.totalPaymentsCollected.toFixed(2)} from ${r.techName}</li>
                                        <li>If received, click "✅ GCash Received"</li>
                                        <li>If NOT received, click "❌ GCash Not Found" and explain</li>
                                    </ul>
                                </div>
                                
                                <div style="display:flex;gap:10px;margin-top:15px;">
                                    <button onclick="verifyGCashRemittance('${r.id}', true)" 
                                            class="btn-primary" 
                                            style="flex:1;background:#4caf50;padding:12px;">
                                        ✅ GCash Received
                                    </button>
                                    <button onclick="verifyGCashRemittance('${r.id}', false)" 
                                            class="btn-secondary" 
                                            style="flex:1;background:#f44336;color:white;padding:12px;">
                                        ❌ GCash Not Found
                                    </button>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Cash For Me Section (Standard Verification) -->
        ${cashForMe.length > 0 ? `
            <div class="card" style="border-left:4px solid #ff9800;background:#fffbf0;margin:20px 0;">
                <h3 style="color:#f57c00;">💵 Cash Remittances For Me (${cashForMe.length})</h3>
                <p style="color:#666;margin-bottom:15px;">These technicians submitted their cash remittances to YOU</p>
                
                <div class="repairs-list">
                    ${cashForMe.map(r => {
        const hasDiscrepancy = Math.abs(r.discrepancy) > 0.01;
        const isLargeDiscrepancy = Math.abs(r.discrepancy) > r.expectedRemittance * 0.05;
        return `
                            <div class="remittance-card ${hasDiscrepancy ? (isLargeDiscrepancy ? 'discrepancy-danger' : 'discrepancy-warning') : ''}" style="border-left-color:#ff9800;background:#fff;">
                                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:15px;">
                                    <div>
                                        <h4>${r.techName}</h4>
                                        <p style="font-size:13px;color:#666;">
                                            📅 ${utils.formatDate(r.date)}<br>
                                            ⏰ Submitted: ${utils.formatDateTime(r.submittedAt)} (${utils.timeAgo(r.submittedAt)})<br>
                                            💰 Amount: <strong style="color:#4caf50;">₱${r.actualAmount.toFixed(2)}</strong><br>
                                            📊 Payments: ${(r.paymentsList || []).length} • Commission: ${(r.commissionBreakdown || []).length} • Expenses: ${(r.expensesList || []).length}
                                        </p>
                                        ${r.discrepancyReason ? `<p style="font-size:12px;color:#999;margin-top:5px;">📝 ${r.discrepancyReason}</p>` : ''}
                                        ${hasDiscrepancy ? `
                                            <div style="background:#fff3cd;padding:8px;border-radius:5px;margin-top:8px;font-size:13px;">
                                                ⚠️ Discrepancy: ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div style="text-align:right;">
                                        <button onclick="openVerifyRemittanceModal('${r.id}')" 
                                                class="btn btn-success" 
                                                style="padding:10px 20px;font-size:14px;white-space:nowrap;">
                                            ✅ Verify Receipt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        ` : `
            <div class="card" style="background:#e8f5e9;margin:20px 0;">
                <p style="text-align:center;color:#4caf50;padding:20px;">
                    ✅ No remittances submitted to you
                </p>
            </div>
        `}
        
        <!-- For Others Section (Admin can override) -->
        ${cashForOthers.length > 0 && isAdmin ? `
            <div class="card" style="margin:20px 0;">
                <h3>👥 Remittances For Other Staff (${cashForOthers.length})</h3>
                <p style="color:#666;margin-bottom:15px;">
                    ⚠️ These were submitted to other staff members. As admin, you can verify them if needed.
                </p>
                
                <div class="repairs-list">
                    ${cashForOthers.map(r => `
                        <div class="repair-card">
                            <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                                <div style="flex:1;">
                                    <h4>${r.techName} → ${r.submittedToName}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        📅 ${utils.formatDate(r.date)} • 
                                        💰 ₱${r.actualAmount.toFixed(2)} • 
                                        Submitted ${utils.timeAgo(r.submittedAt)}
                                    </p>
                                </div>
                                <div style="text-align:right;">
                                    <button onclick="openVerifyRemittanceModal('${r.id}', true)" 
                                            class="btn btn-secondary" 
                                            style="padding:8px 15px;font-size:13px;">
                                        🔓 Admin Override
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : cashForOthers.length > 0 ? `
            <div class="card" style="margin:20px 0;background:#f5f5f5;">
                <p style="text-align:center;color:#666;padding:20px;">
                    📋 ${cashForOthers.length} remittance(s) submitted to other staff members
                </p>
            </div>
        ` : ''}
        
        <!-- Legacy Pending (No Recipient Specified) -->
        ${legacyPending.length > 0 ? `
            <div class="card" style="margin:20px 0;">
                <h3>📋 Legacy Pending (${legacyPending.length})</h3>
                <p style="color:#666;margin-bottom:15px;">Older remittances without recipient tracking</p>
                
                <div class="repairs-list">
                    ${legacyPending.map(r => {
        const hasDiscrepancy = Math.abs(r.discrepancy) > 0.01;
        return `
                            <div class="repair-card">
                                <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                                    <div style="flex:1;">
                                        <h4>${r.techName}</h4>
                                        <p style="font-size:13px;color:#666;">
                                            📅 ${utils.formatDate(r.date)} • 
                                            💰 ₱${r.actualAmount.toFixed(2)} • 
                                            Submitted ${utils.timeAgo(r.submittedAt)}
                                        </p>
                                        ${hasDiscrepancy ? `
                                            <p style="font-size:12px;color:#ff9800;margin-top:5px;">
                                                ⚠️ Discrepancy: ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}
                                            </p>
                                        ` : ''}
                                    </div>
                                    <div style="text-align:right;">
                                        <button onclick="openVerifyRemittanceModal('${r.id}')" 
                                                class="btn btn-primary" 
                                                style="padding:8px 15px;font-size:13px;">
                                            📋 Review & Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Recent Verified -->
        <div class="card" style="margin:20px 0;">
            <h3>📋 Recently Verified (${recentVerified.length})</h3>
            ${recentVerified.length > 0 ? `
                <div class="repairs-list">
                    ${recentVerified.map(r => `
                        <div class="repair-card" style="border-left-color:#${r.status === 'approved' ? '4caf50' : 'f44336'};">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${r.techName}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        ${utils.formatDate(r.date)} • ${(r.paymentsList || []).length} payment(s)
                                    </p>
                                    <p style="font-size:12px;color:#999;">
                                        Verified by ${r.verifiedBy} • ${utils.formatDateTime(r.verifiedAt)}
                                    </p>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:600;">₱${r.actualAmount.toFixed(2)}</div>
                                    <span class="status-badge" style="background:#${r.status === 'approved' ? '4caf50' : 'f44336'};color:white;font-size:11px;">
                                        ${r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No verified remittances yet</p>'}
        </div>
    `;
}

/**
 * Build Technician Logs Tab (Admin/Cashier/Manager)
 */
function buildTechnicianLogsTab(container) {
    console.log('📊 Building Technician Logs tab');
    window.currentTabRefresh = () => buildTechnicianLogsTab(document.getElementById('tech-logsTab'));

    // Get all technicians
    const technicians = Object.values(window.allUsers || {}).filter(u => u.role === 'technician');

    // Get selected technician from dropdown (or first one)
    const selectedTechId = window.selectedTechForLogs || (technicians.length > 0 ? technicians[0].id : null);

    if (technicians.length === 0) {
        container.innerHTML = `
            <div class="page-header">
                <h2>📊 Technician Logs</h2>
            </div>
            <div class="card">
                <p style="text-align:center;color:#999;padding:40px;">No technicians found in the system</p>
            </div>
        `;
        return;
    }

    const selectedTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

    // Get date range (default: last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Filter data for selected technician
    const techPayments = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => p.receivedById === selectedTech.id))
        .map(r => {
            return r.payments
                .map((p, actualIndex) => ({
                    payment: p,
                    actualIndex: actualIndex,
                    repairId: r.id,
                    customerName: r.customerName
                }))
                .filter(item => item.payment.receivedById === selectedTech.id)
                .map(item => ({
                    ...item.payment,
                    repairId: item.repairId,
                    customerName: item.customerName,
                    paymentIndex: item.actualIndex // Use actual index in repair.payments array
                }));
        })
        .flat()
        .sort((a, b) => new Date(b.paymentDate || b.recordedDate) - new Date(a.paymentDate || a.recordedDate));

    const techExpenses = (window.techExpenses || [])
        .filter(e => e.techId === selectedTech.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const techRemittances = (window.techRemittances || [])
        .filter(r => r.techId === selectedTech.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const techJobs = window.allRepairs.filter(r => r.acceptedBy === selectedTech.id);
    const completedJobs = techJobs.filter(r => r.status === 'Completed' || r.status === 'Claimed');

    // Calculate totals
    const totalCollected = techPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = techExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRemitted = techRemittances
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.actualAmount, 0);
    const pendingRemittance = techPayments
        .filter(p => p.remittanceStatus === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    container.innerHTML = `
        <div class="page-header">
            <h2>📊 Technician Transaction Logs</h2>
            <p>View detailed transaction history for each technician</p>
        </div>
        
        <!-- Technician Selector -->
        <div class="card" style="margin:20px 0;">
            <label style="font-weight:600;margin-bottom:10px;display:block;">Select Technician:</label>
            <select id="technicianSelector" onchange="selectTechnicianForLogs(this.value)" style="width:100%;max-width:400px;padding:10px;font-size:15px;">
                ${technicians.map(t => `
                    <option value="${t.id}" ${t.id === selectedTech.id ? 'selected' : ''}>
                        ${t.displayName} (${t.technicianName || 'N/A'})
                    </option>
                `).join('')}
            </select>
        </div>
        
        <!-- Summary Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>₱${totalCollected.toFixed(2)}</h3>
                <p>💰 Total Collected</p>
                <small>${techPayments.length} payment(s)</small>
            </div>
            <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
                <h3>₱${totalExpenses.toFixed(2)}</h3>
                <p>💸 Total Expenses</p>
                <small>${techExpenses.length} expense(s)</small>
            </div>
            <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>₱${totalRemitted.toFixed(2)}</h3>
                <p>✅ Total Remitted</p>
                <small>${techRemittances.filter(r => r.status === 'approved').length} approved</small>
            </div>
            <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
                <h3>₱${pendingRemittance.toFixed(2)}</h3>
                <p>⏳ Pending Remittance</p>
                <small>Not yet submitted</small>
            </div>
            <div class="stat-card" style="background:#f3e5f5;border-left:4px solid #9c27b0;">
                <h3>${techJobs.length}</h3>
                <p>🔧 Total Jobs</p>
                <small>${completedJobs.length} completed</small>
            </div>
        </div>
        
        <!-- Payments Collected -->
        <div class="card" style="margin:20px 0;">
            <h3>💰 Payments Collected (${techPayments.length})</h3>
            ${techPayments.length > 0 ? `
                <div style="max-height:400px;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="background:#f5f5f5;position:sticky;top:0;">
                            <tr>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Date</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Customer</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Method</th>
                                <th style="padding:10px;text-align:right;border-bottom:2px solid #ddd;">Amount</th>
                                <th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">Status</th>
                                ${window.currentUserData.role === 'admin' ? '<th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${techPayments.map(p => `
                                <tr style="border-bottom:1px solid #eee;">
                                    <td style="padding:10px;">${utils.formatDate(p.paymentDate || p.recordedDate)}</td>
                                    <td style="padding:10px;">${p.customerName}</td>
                                    <td style="padding:10px;">${p.method}</td>
                                    <td style="padding:10px;text-align:right;font-weight:600;color:#4caf50;">₱${p.amount.toFixed(2)}</td>
                                    <td style="padding:10px;text-align:center;">
                                        ${p.remittanceStatus === 'verified' ? '<span style="color:#4caf50;">✅ Verified</span>' :
            p.remittanceStatus === 'remitted' ? '<span style="color:#ff9800;">📤 Remitted</span>' :
                '<span style="color:#999;">⏳ Pending</span>'}
                                    </td>
                                    ${window.currentUserData.role === 'admin' ? `
                                        <td style="padding:10px;text-align:center;">
                                            ${p.remittanceStatus === 'remitted' ? `
                                                <button onclick="adminUnremitPayment('${p.repairId}', ${p.paymentIndex})" 
                                                        class="btn-small" 
                                                        style="background:#ff9800;color:white;padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;"
                                                        title="Reset this payment to pending status">
                                                    ↩️ Un-Remit
                                                </button>
                                            ` : '-'}
                                        </td>
                                    ` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No payments collected</p>'}
        </div>
        
        <!-- Expenses Recorded -->
        <div class="card" style="margin:20px 0;">
            <h3>💸 Expenses Recorded (${techExpenses.length})</h3>
            ${techExpenses.length > 0 ? `
                <div style="max-height:400px;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="background:#f5f5f5;position:sticky;top:0;">
                            <tr>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Date</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Category</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Description</th>
                                <th style="padding:10px;text-align:right;border-bottom:2px solid #ddd;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${techExpenses.map(e => `
                                <tr style="border-bottom:1px solid #eee;">
                                    <td style="padding:10px;">${utils.formatDate(e.date)}</td>
                                    <td style="padding:10px;">${e.category}</td>
                                    <td style="padding:10px;">${e.description}</td>
                                    <td style="padding:10px;text-align:right;font-weight:600;color:#f44336;">-₱${e.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No expenses recorded</p>'}
        </div>
        
        <!-- Remittances Submitted -->
        <div class="card" style="margin:20px 0;">
            <h3>📤 Remittances Submitted (${techRemittances.length})</h3>
            ${techRemittances.length > 0 ? `
                <div class="repairs-list">
                    ${techRemittances.map(r => `
                        <div class="repair-card" style="border-left-color:${r.status === 'approved' ? '#4caf50' : (r.status === 'rejected' ? '#f44336' : '#ff9800')};">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${utils.formatDate(r.date)}</h4>
                                    <div style="font-size:13px;color:#666;line-height:1.6;margin-top:5px;">
                                        <div><strong>Payments:</strong> ₱${(r.totalPaymentsCollected || 0).toFixed(2)} (${(r.paymentsList || []).length})</div>
                                        <div><strong>Expenses:</strong> ₱${(r.totalExpenses || 0).toFixed(2)} (${(r.expensesList || []).length})</div>
                                        <div><strong>Expected:</strong> ₱${(r.expectedAmount || r.actualAmount || 0).toFixed(2)}</div>
                                        <div><strong>Actual:</strong> ₱${r.actualAmount.toFixed(2)}</div>
                                        ${Math.abs(r.discrepancy) > 0.01 ? `
                                            <div style="color:#ff9800;font-weight:600;">
                                                <strong>Discrepancy:</strong> ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}
                                            </div>
                                        ` : ''}
                                        <div style="font-size:11px;color:#999;margin-top:5px;">
                                            Submitted: ${utils.formatDateTime(r.submittedAt)}
                                        </div>
                                        ${r.verifiedBy ? `
                                            <div style="font-size:11px;color:#999;">
                                                Verified by: ${r.verifiedBy} on ${utils.formatDateTime(r.verifiedAt)}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div>
                                    <span class="status-badge" style="background:${r.status === 'approved' ? '#4caf50' : (r.status === 'rejected' ? '#f44336' : '#ff9800')};color:white;">
                                        ${r.status === 'approved' ? '✅ Approved' : (r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No remittances submitted</p>'}
        </div>
        
        <!-- Job Performance -->
        <div class="card" style="margin:20px 0;">
            <h3>🔧 Job Performance</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:15px;">
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#667eea;">${techJobs.length}</div>
                    <div style="font-size:13px;color:#666;">Total Jobs</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#4caf50;">${completedJobs.length}</div>
                    <div style="font-size:13px;color:#666;">Completed</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#ff9800;">${techJobs.filter(r => r.status === 'In Progress' || r.status === 'Waiting for Parts').length}</div>
                    <div style="font-size:13px;color:#666;">In Progress</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#2196f3;">${techJobs.filter(r => r.status === 'Ready for Pickup').length}</div>
                    <div style="font-size:13px;color:#666;">Ready</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Select technician for logs
 */
function selectTechnicianForLogs(techId) {
    window.selectedTechForLogs = techId;
    // Directly call the Technician Logs tab build function
    const container = document.getElementById('tech-logsTab');
    if (container) {
        buildTechnicianLogsTab(container);
    }
}

// ===== INVENTORY MANAGEMENT TAB =====

/**
 * Build Inventory Management Tab
 */
function buildInventoryTab(container) {
    window.currentTabRefresh = () => buildInventoryTab(document.getElementById('inventoryTab'));

    const role = window.currentUserData.role;
    const canManage = role === 'admin' || role === 'manager';

    // Get low stock items
    const lowStockItems = getLowStockItems();
    const outOfStockItems = getOutOfStockItems();

    // Filter active items
    const activeItems = window.allInventoryItems.filter(item => !item.deleted);

    // Calculate total value
    const totalValue = activeItems.reduce((sum, item) =>
        sum + (item.quantity * item.unitCost), 0
    );

    let html = `
        <div style="margin-bottom:20px;">
            <h2>📦 Inventory Management</h2>
            <p class="text-secondary">Track parts, manage stock levels, and monitor inventory</p>
        </div>
    `;

    // Low Stock Alerts
    if (lowStockItems.length > 0) {
        html += `
            <div class="alert-box" style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin-bottom:20px;border-radius:8px;">
                <h3 style="margin:0 0 10px;color:#856404;">⚠️ Low Stock Alert</h3>
                <p style="margin:0;color:#856404;">
                    ${lowStockItems.length} item(s) are running low on stock.
                    ${outOfStockItems.length > 0 ? `<strong>${outOfStockItems.length} out of stock!</strong>` : ''}
                </p>
            </div>
        `;
    }

    // Inventory Summary Stats
    html += `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:25px;">
            <div class="stat-card" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Items</div>
                <div style="font-size:32px;font-weight:bold;">${activeItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Low Stock</div>
                <div style="font-size:32px;font-weight:bold;">${lowStockItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Out of Stock</div>
                <div style="font-size:32px;font-weight:bold;">${outOfStockItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Value</div>
                <div style="font-size:32px;font-weight:bold;">₱${totalValue.toLocaleString()}</div>
            </div>
        </div>
    `;

    // Action Buttons
    html += `
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    `;

    if (canManage) {
        html += `
            <button onclick="openAddInventoryItemModal()" class="btn-primary">
                ➕ Add New Part
            </button>
            <button onclick="openAddSupplierModal()" class="btn-secondary">
                📊 Manage Suppliers
            </button>
        `;
    }

    html += `
            <button onclick="filterInventory('all')" class="btn-secondary" id="filterAll">
                📋 All Items
            </button>
            <button onclick="filterInventory('lowstock')" class="btn-secondary" id="filterLowStock">
                ⚠️ Low Stock
            </button>
            <button onclick="filterInventory('outofstock')" class="btn-secondary" id="filterOutOfStock">
                🔴 Out of Stock
            </button>
            <button onclick="viewStockMovementsReport()" class="btn-secondary">
                📊 Stock Movements
            </button>
        </div>
    `;

    // Search and Filter
    html += `
        <div style="margin-bottom:20px;">
            <input type="text" 
                   id="inventorySearch" 
                   placeholder="🔍 Search parts by name, number, brand, or model..." 
                   style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
                   oninput="filterInventoryTable()">
        </div>
    `;

    // Inventory Table
    html += `
        <div style="overflow-x:auto;">
            <table class="repair-table" id="inventoryTable">
                <thead>
                    <tr>
                        <th>Part Name</th>
                        <th>Part Number</th>
                        <th>Category</th>
                        <th>Brand/Model</th>
                        <th>Quantity</th>
                        <th>Min Stock</th>
                        <th>Unit Cost</th>
                        <th>Selling Price</th>
                        <th>Total Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="inventoryTableBody">
    `;

    if (activeItems.length === 0) {
        html += `
            <tr>
                <td colspan="10" style="text-align:center;padding:40px;">
                    <div style="font-size:48px;margin-bottom:10px;">📦</div>
                    <div class="text-secondary">No inventory items yet</div>
                    ${canManage ? '<div style="margin-top:10px;"><button onclick="openAddInventoryItemModal()" class="btn-primary">Add First Item</button></div>' : ''}
                </td>
            </tr>
        `;
    } else {
        // Sort by name
        activeItems.sort((a, b) => a.partName.localeCompare(b.partName));

        activeItems.forEach(item => {
            const isLowStock = item.quantity <= item.minStockLevel;
            const isOutOfStock = item.quantity === 0;
            const totalValue = item.quantity * item.unitCost;

            let stockBadge = '';
            if (isOutOfStock) {
                stockBadge = '<span class="status-badge" style="background:#f44336;">Out of Stock</span>';
            } else if (isLowStock) {
                stockBadge = '<span class="status-badge" style="background:#ff9800;">Low Stock</span>';
            } else {
                stockBadge = '<span class="status-badge" style="background:#4caf50;">In Stock</span>';
            }

            html += `
                <tr class="inventory-row" data-item-id="${item.id}" data-name="${item.partName.toLowerCase()}" data-number="${item.partNumber.toLowerCase()}" data-brand="${(item.brand || '').toLowerCase()}" data-model="${(item.model || '').toLowerCase()}" data-category="${item.category.toLowerCase()}">
                    <td><strong>${item.partName}</strong></td>
                    <td><code>${item.partNumber}</code></td>
                    <td>${item.category}</td>
                    <td class="text-secondary">${item.brand || 'N/A'} ${item.model || ''}</td>
                    <td>
                        <strong style="font-size:16px;${isOutOfStock ? 'color:#f44336;' : isLowStock ? 'color:#ff9800;' : 'color:#4caf50;'}">${item.quantity}</strong>
                        ${stockBadge}
                    </td>
                    <td class="text-secondary">${item.minStockLevel}</td>
                    <td>₱${item.unitCost.toLocaleString()}</td>
                    <td>₱${item.sellingPrice.toLocaleString()}</td>
                    <td><strong>₱${totalValue.toLocaleString()}</strong></td>
                    <td>
                        <button onclick="adjustStockModal('${item.id}')" class="btn-small" title="Adjust Stock">
                            📊 Stock
                        </button>
                        ${canManage ? `
                        <button onclick="editInventoryItemModal('${item.id}')" class="btn-small" title="Edit">
                            ✏️
                        </button>
                        <button onclick="deleteInventoryItem('${item.id}')" class="btn-small btn-danger" title="Delete">
                            🗑️
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Filter inventory table by search
 */
function filterInventoryTable() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const rows = document.querySelectorAll('.inventory-row');

    rows.forEach(row => {
        const name = row.dataset.name;
        const number = row.dataset.number;
        const brand = row.dataset.brand;
        const model = row.dataset.model;
        const category = row.dataset.category;

        const matches = name.includes(searchTerm) ||
            number.includes(searchTerm) ||
            brand.includes(searchTerm) ||
            model.includes(searchTerm) ||
            category.includes(searchTerm);

        row.style.display = matches ? '' : 'none';
    });
}

/**
 * Filter inventory by status
 */
function filterInventory(filter) {
    const allItems = window.allInventoryItems.filter(item => !item.deleted);
    let filteredItems = [];

    if (filter === 'lowstock') {
        filteredItems = getLowStockItems();
    } else if (filter === 'outofstock') {
        filteredItems = getOutOfStockItems();
    } else {
        filteredItems = allItems;
    }

    // Update button states
    document.querySelectorAll('[id^="filter"]').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeButton = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Show/hide rows
    const rows = document.querySelectorAll('.inventory-row');
    rows.forEach(row => {
        const itemId = row.dataset.itemId;
        const shouldShow = filteredItems.some(item => item.id === itemId);
        row.style.display = shouldShow ? '' : 'none';
    });
}

/**
 * Open Add Inventory Item Modal
 */
function openAddInventoryItemModal() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '➕ Add New Part';

    // Get suppliers for dropdown
    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);

    modalContent.innerHTML = `
        <form onsubmit="submitAddInventoryItem(event)" id="addInventoryForm">
            <div class="form-group">
                <label>Part Name *</label>
                <input type="text" name="partName" required placeholder="e.g. iPhone 12 Screen">
            </div>
            
            <div class="form-group">
                <label>Part Number *</label>
                <input type="text" name="partNumber" required placeholder="e.g. IP12-SCR-001">
            </div>
            
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required>
                    <option value="">Select category</option>
                    <option value="Screen">Screen/Display</option>
                    <option value="Battery">Battery</option>
                    <option value="Charging Port">Charging Port</option>
                    <option value="Camera">Camera</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Microphone">Microphone</option>
                    <option value="Button">Button</option>
                    <option value="Housing">Housing/Body</option>
                    <option value="Motherboard">Motherboard</option>
                    <option value="Connector">Connector/Flex Cable</option>
                    <option value="Tool">Tool/Equipment</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" name="brand" placeholder="e.g. Apple">
                </div>
                
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" name="model" placeholder="e.g. iPhone 12">
                </div>
            </div>
            
            <div class="form-group">
                <label>Supplier</label>
                <select name="supplier">
                    <option value="">None</option>
                    ${activeSuppliers.map(s => `<option value="${s.supplierName}">${s.supplierName}</option>`).join('')}
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Initial Quantity *</label>
                    <input type="number" name="quantity" required min="0" value="0">
                </div>
                
                <div class="form-group">
                    <label>Min Stock Level *</label>
                    <input type="number" name="minStockLevel" required min="1" value="5">
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Unit Cost (₱) *</label>
                    <input type="number" name="unitCost" required min="0" step="0.01" value="0">
                </div>
                
                <div class="form-group">
                    <label>Selling Price (₱) *</label>
                    <input type="number" name="sellingPrice" required min="0" step="0.01" value="0">
                </div>
            </div>
            
            <div class="form-group">
                <label>Storage Location</label>
                <input type="text" name="location" placeholder="e.g. Shelf A, Bin 3">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2" placeholder="Additional notes..."></textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Add Part</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;

    modal.style.display = 'block';
}

/**
 * Submit Add Inventory Item
 */
async function submitAddInventoryItem(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const itemData = {
        partName: formData.get('partName'),
        partNumber: formData.get('partNumber'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        supplier: formData.get('supplier'),
        quantity: parseInt(formData.get('quantity')),
        minStockLevel: parseInt(formData.get('minStockLevel')),
        unitCost: parseFloat(formData.get('unitCost')),
        sellingPrice: parseFloat(formData.get('sellingPrice')),
        location: formData.get('location'),
        notes: formData.get('notes')
    };

    try {
        await addInventoryItem(itemData);
        closeUserModal();
    } catch (error) {
        // Error handling done in addInventoryItem
    }
}

/**
 * Edit Inventory Item Modal
 */
function editInventoryItemModal(itemId) {
    const item = window.allInventoryItems.find(i => i.id === itemId);

    if (!item) {
        alert('Item not found');
        return;
    }

    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '✏️ Edit Part';

    // Get suppliers for dropdown
    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);

    modalContent.innerHTML = `
        <form onsubmit="submitEditInventoryItem(event, '${itemId}')" id="editInventoryForm">
            <div class="form-group">
                <label>Part Name *</label>
                <input type="text" name="partName" required value="${item.partName}">
            </div>
            
            <div class="form-group">
                <label>Part Number *</label>
                <input type="text" name="partNumber" required value="${item.partNumber}">
            </div>
            
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required>
                    <option value="Screen" ${item.category === 'Screen' ? 'selected' : ''}>Screen/Display</option>
                    <option value="Battery" ${item.category === 'Battery' ? 'selected' : ''}>Battery</option>
                    <option value="Charging Port" ${item.category === 'Charging Port' ? 'selected' : ''}>Charging Port</option>
                    <option value="Camera" ${item.category === 'Camera' ? 'selected' : ''}>Camera</option>
                    <option value="Speaker" ${item.category === 'Speaker' ? 'selected' : ''}>Speaker</option>
                    <option value="Microphone" ${item.category === 'Microphone' ? 'selected' : ''}>Microphone</option>
                    <option value="Button" ${item.category === 'Button' ? 'selected' : ''}>Button</option>
                    <option value="Housing" ${item.category === 'Housing' ? 'selected' : ''}>Housing/Body</option>
                    <option value="Motherboard" ${item.category === 'Motherboard' ? 'selected' : ''}>Motherboard</option>
                    <option value="Connector" ${item.category === 'Connector' ? 'selected' : ''}>Connector/Flex Cable</option>
                    <option value="Tool" ${item.category === 'Tool' ? 'selected' : ''}>Tool/Equipment</option>
                    <option value="Accessory" ${item.category === 'Accessory' ? 'selected' : ''}>Accessory</option>
                    <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" name="brand" value="${item.brand || ''}">
                </div>
                
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" name="model" value="${item.model || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Supplier</label>
                <select name="supplier">
                    <option value="">None</option>
                    ${activeSuppliers.map(s => `<option value="${s.supplierName}" ${item.supplier === s.supplierName ? 'selected' : ''}>${s.supplierName}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Min Stock Level *</label>
                <input type="number" name="minStockLevel" required min="1" value="${item.minStockLevel}">
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Unit Cost (₱) *</label>
                    <input type="number" name="unitCost" required min="0" step="0.01" value="${item.unitCost}">
                </div>
                
                <div class="form-group">
                    <label>Selling Price (₱) *</label>
                    <input type="number" name="sellingPrice" required min="0" step="0.01" value="${item.sellingPrice}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Storage Location</label>
                <input type="text" name="location" value="${item.location || ''}">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2">${item.notes || ''}</textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Save Changes</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;

    modal.style.display = 'block';
}

/**
 * Submit Edit Inventory Item
 */
async function submitEditInventoryItem(e, itemId) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const updates = {
        partName: formData.get('partName'),
        partNumber: formData.get('partNumber'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        supplier: formData.get('supplier'),
        minStockLevel: parseInt(formData.get('minStockLevel')),
        unitCost: parseFloat(formData.get('unitCost')),
        sellingPrice: parseFloat(formData.get('sellingPrice')),
        location: formData.get('location'),
        notes: formData.get('notes')
    };

    try {
        await updateInventoryItem(itemId, updates);
        closeUserModal();
    } catch (error) {
        // Error handling done in updateInventoryItem
    }
}

/**
 * Adjust Stock Modal
 */
function adjustStockModal(itemId) {
    const item = window.allInventoryItems.find(i => i.id === itemId);

    if (!item) {
        alert('Item not found');
        return;
    }

    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '📊 Adjust Stock';

    modalContent.innerHTML = `
        <div style="margin-bottom:20px;padding:15px;background:var(--bg-secondary);border-radius:8px;">
            <h3 style="margin:0 0 5px;">${item.partName}</h3>
            <p class="text-secondary" style="margin:0;">Part #: ${item.partNumber}</p>
            <p style="margin:10px 0 0;font-size:24px;font-weight:bold;">Current Stock: ${item.quantity}</p>
        </div>
        
        <form onsubmit="submitStockAdjustment(event, '${itemId}')" id="adjustStockForm">
            <div class="form-group">
                <label>Adjustment Type *</label>
                <select name="adjustmentType" id="adjustmentType" onchange="updateAdjustmentLabel()" required>
                    <option value="">Select type</option>
                    <option value="add">➕ Add Stock (Received from supplier)</option>
                    <option value="remove">➖ Remove Stock (Used/Damaged/Returned)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label id="quantityLabel">Quantity *</label>
                <input type="number" name="quantity" id="adjustQuantity" required min="1" value="1">
            </div>
            
            <div class="form-group">
                <label>Reason *</label>
                <textarea name="reason" rows="2" required placeholder="Why are you adjusting the stock?"></textarea>
            </div>
            
            <div id="newStockPreview" style="margin:15px 0;padding:15px;background:var(--bg-hover);border-radius:8px;display:none;">
                <p style="margin:0;"><strong>New Stock Level:</strong> <span id="newStockValue">0</span></p>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Adjust Stock</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
        
        <script>
            // Update preview when quantity or type changes
            document.getElementById('adjustQuantity').addEventListener('input', updateStockPreview);
            document.getElementById('adjustmentType').addEventListener('change', updateStockPreview);
            
            function updateStockPreview() {
                const type = document.getElementById('adjustmentType').value;
                const qty = parseInt(document.getElementById('adjustQuantity').value) || 0;
                const currentStock = ${item.quantity};
                
                if (type && qty > 0) {
                    const newStock = type === 'add' ? currentStock + qty : currentStock - qty;
                    document.getElementById('newStockValue').textContent = newStock;
                    document.getElementById('newStockPreview').style.display = 'block';
                    
                    if (newStock < 0) {
                        document.getElementById('newStockValue').style.color = '#f44336';
                        document.getElementById('newStockValue').textContent = newStock + ' (Cannot be negative!)';
                    } else {
                        document.getElementById('newStockValue').style.color = newStock <= ${item.minStockLevel} ? '#ff9800' : '#4caf50';
                    }
                } else {
                    document.getElementById('newStockPreview').style.display = 'none';
                }
            }
            
            function updateAdjustmentLabel() {
                const type = document.getElementById('adjustmentType').value;
                const label = document.getElementById('quantityLabel');
                
                if (type === 'add') {
                    label.textContent = 'Quantity to Add *';
                } else if (type === 'remove') {
                    label.textContent = 'Quantity to Remove *';
                } else {
                    label.textContent = 'Quantity *';
                }
            }
        </script>
    `;

    modal.style.display = 'block';
}

/**
 * Submit Stock Adjustment
 */
async function submitStockAdjustment(e, itemId) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const type = formData.get('adjustmentType');
    const quantity = parseInt(formData.get('quantity'));
    const reason = formData.get('reason');

    const adjustment = type === 'add' ? quantity : -quantity;

    try {
        await adjustStock(itemId, adjustment, reason);
        closeUserModal();
    } catch (error) {
        // Error handling done in adjustStock
    }
}

/**
 * Open Add Supplier Modal
 */
function openAddSupplierModal() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '📊 Manage Suppliers';

    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);

    modalContent.innerHTML = `
        <div style="margin-bottom:20px;">
            <button onclick="showAddSupplierForm()" class="btn-primary">➕ Add New Supplier</button>
        </div>
        
        <div id="supplierFormContainer" style="display:none;"></div>
        
        <h4>Existing Suppliers</h4>
        <div id="suppliersList">
            ${activeSuppliers.length === 0 ? '<p class="text-secondary">No suppliers added yet</p>' : ''}
            ${activeSuppliers.map(supplier => `
                <div style="padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:10px;">
                    <h4 style="margin:0 0 10px;">${supplier.supplierName}</h4>
                    ${supplier.contactPerson ? `<p style="margin:5px 0;"><strong>Contact:</strong> ${supplier.contactPerson}</p>` : ''}
                    ${supplier.phone ? `<p style="margin:5px 0;"><strong>Phone:</strong> ${supplier.phone}</p>` : ''}
                    ${supplier.email ? `<p style="margin:5px 0;"><strong>Email:</strong> ${supplier.email}</p>` : ''}
                    ${supplier.address ? `<p style="margin:5px 0;"><strong>Address:</strong> ${supplier.address}</p>` : ''}
                    <div style="margin-top:10px;">
                        <button onclick="editSupplierForm('${supplier.id}')" class="btn-small">✏️ Edit</button>
                        <button onclick="deleteSupplier('${supplier.id}')" class="btn-small btn-danger">🗑️ Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top:20px;">
            <button type="button" onclick="closeUserModal()" class="btn-secondary" style="width:100%;">Close</button>
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * Show Add Supplier Form
 */
function showAddSupplierForm() {
    const container = document.getElementById('supplierFormContainer');

    container.innerHTML = `
        <form onsubmit="submitAddSupplier(event)" id="addSupplierForm" style="padding:15px;background:var(--bg-hover);border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 15px;">New Supplier</h4>
            
            <div class="form-group">
                <label>Supplier Name *</label>
                <input type="text" name="supplierName" required>
            </div>
            
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contactPerson">
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email">
            </div>
            
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2"></textarea>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Add Supplier</button>
                <button type="button" onclick="hideSupplierForm()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;

    container.style.display = 'block';
}

/**
 * Hide Supplier Form
 */
function hideSupplierForm() {
    document.getElementById('supplierFormContainer').style.display = 'none';
    document.getElementById('supplierFormContainer').innerHTML = '';
}

/**
 * Submit Add Supplier
 */
async function submitAddSupplier(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const supplierData = {
        supplierName: formData.get('supplierName'),
        contactPerson: formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        notes: formData.get('notes')
    };

    try {
        await addSupplier(supplierData);
        // Refresh modal content
        openAddSupplierModal();
    } catch (error) {
        // Error handling done in addSupplier
    }
}

/**
 * Edit Supplier Form
 */
function editSupplierForm(supplierId) {
    const supplier = window.allSuppliers.find(s => s.id === supplierId);

    if (!supplier) {
        alert('Supplier not found');
        return;
    }

    const container = document.getElementById('supplierFormContainer');

    container.innerHTML = `
        <form onsubmit="submitEditSupplier(event, '${supplierId}')" id="editSupplierForm" style="padding:15px;background:var(--bg-hover);border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 15px;">Edit Supplier</h4>
            
            <div class="form-group">
                <label>Supplier Name *</label>
                <input type="text" name="supplierName" required value="${supplier.supplierName}">
            </div>
            
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contactPerson" value="${supplier.contactPerson || ''}">
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value="${supplier.phone || ''}">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${supplier.email || ''}">
            </div>
            
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2">${supplier.address || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2">${supplier.notes || ''}</textarea>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Save Changes</button>
                <button type="button" onclick="hideSupplierForm()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;

    container.style.display = 'block';
}

/**
 * Submit Edit Supplier
 */
async function submitEditSupplier(e, supplierId) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const updates = {
        supplierName: formData.get('supplierName'),
        contactPerson: formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        notes: formData.get('notes')
    };

    try {
        await updateSupplier(supplierId, updates);
        // Refresh modal content
        openAddSupplierModal();
    } catch (error) {
        // Error handling done in updateSupplier
    }
}

/**
 * Open Use Parts Modal for a Repair
 */
function openUsePartsModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);

    if (!repair) {
        alert('Repair not found');
        return;
    }

    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '🔧 Use Parts from Inventory';

    // Get available inventory items (in stock only)
    const availableItems = window.allInventoryItems.filter(item =>
        !item.deleted && item.quantity > 0
    ).sort((a, b) => a.partName.localeCompare(b.partName));

    // Get already used parts
    const usedParts = repair.partsUsed ? Object.values(repair.partsUsed) : [];

    modalContent.innerHTML = `
        <div style="margin-bottom:20px;padding:15px;background:var(--bg-secondary);border-radius:8px;">
            <h4 style="margin:0 0 5px;">${repair.customerName} - ${repair.brand} ${repair.model}</h4>
            <p class="text-secondary" style="margin:0;">Repair: ${repair.repairType || 'Pending Diagnosis'}</p>
        </div>
        
        ${usedParts.length > 0 ? `
            <div style="margin-bottom:20px;padding:15px;background:#e8f5e9;border-radius:8px;">
                <h4 style="margin:0 0 10px;color:#2e7d32;">✅ Parts Already Used</h4>
                ${usedParts.map(part => `
                    <div style="padding:8px;background:white;border-radius:4px;margin-bottom:5px;">
                        <strong>${part.partName}</strong> <span class="text-secondary">(${part.partNumber})</span>
                        <div style="font-size:12px;color:#666;">Qty: ${part.quantity} | Cost: ₱${part.totalCost.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <form onsubmit="submitUseParts(event, '${repairId}')" id="usePartsForm">
            <div class="form-group">
                <label>Select Part *</label>
                <select name="partId" id="selectedPart" onchange="updatePartDetails()" required>
                    <option value="">-- Select a part --</option>
                    ${availableItems.map(item => `
                        <option value="${item.id}" 
                                data-name="${item.partName}" 
                                data-number="${item.partNumber}"
                                data-stock="${item.quantity}"
                                data-cost="${item.unitCost}">
                            ${item.partName} (${item.partNumber}) - Stock: ${item.quantity}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div id="partDetailsBox" style="display:none;padding:15px;background:var(--bg-light);border-radius:8px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                    <div>
                        <strong>Part Number:</strong>
                        <div id="displayPartNumber" class="text-secondary"></div>
                    </div>
                    <div>
                        <strong>Available Stock:</strong>
                        <div id="displayStock" style="color:#4caf50;font-weight:bold;"></div>
                    </div>
                </div>
                <div>
                    <strong>Unit Cost:</strong>
                    <div id="displayCost" style="color:#2196f3;font-weight:bold;"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" name="quantity" id="partQuantity" required min="1" value="1" 
                       oninput="updateTotalCost()">
                <small class="text-secondary">How many units are being used?</small>
            </div>
            
            <div id="totalCostBox" style="display:none;padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:15px;">
                <strong>Total Parts Cost:</strong>
                <div id="displayTotalCost" style="font-size:24px;font-weight:bold;color:#2196f3;margin-top:5px;"></div>
            </div>
            
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea name="notes" rows="2" placeholder="Any special notes about this part usage..."></textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Use Part</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
        
        ${availableItems.length === 0 ? `
            <div style="margin-top:20px;padding:20px;background:#fff3cd;border-radius:8px;text-align:center;">
                <strong>⚠️ No parts available in inventory</strong>
                <p class="text-secondary" style="margin:10px 0 0;">All parts are out of stock. Please restock inventory first.</p>
            </div>
        ` : ''}
        
        <script>
            function updatePartDetails() {
                const select = document.getElementById('selectedPart');
                const selectedOption = select.options[select.selectedIndex];
                
                if (!selectedOption.value) {
                    document.getElementById('partDetailsBox').style.display = 'none';
                    document.getElementById('totalCostBox').style.display = 'none';
                    return;
                }
                
                const partNumber = selectedOption.dataset.number;
                const stock = selectedOption.dataset.stock;
                const cost = parseFloat(selectedOption.dataset.cost);
                
                document.getElementById('displayPartNumber').textContent = partNumber;
                document.getElementById('displayStock').textContent = stock + ' units';
                document.getElementById('displayCost').textContent = '₱' + cost.toFixed(2) + ' per unit';
                
                // Update max quantity
                document.getElementById('partQuantity').max = stock;
                
                document.getElementById('partDetailsBox').style.display = 'block';
                updateTotalCost();
            }
            
            function updateTotalCost() {
                const select = document.getElementById('selectedPart');
                const selectedOption = select.options[select.selectedIndex];
                const quantity = parseInt(document.getElementById('partQuantity').value) || 0;
                
                if (!selectedOption.value || quantity === 0) {
                    document.getElementById('totalCostBox').style.display = 'none';
                    return;
                }
                
                const cost = parseFloat(selectedOption.dataset.cost);
                const stock = parseInt(selectedOption.dataset.stock);
                const total = cost * quantity;
                
                // Check if quantity exceeds stock
                if (quantity > stock) {
                    document.getElementById('displayTotalCost').innerHTML = '<span style="color:#f44336;">⚠️ Quantity exceeds available stock!</span>';
                } else {
                    document.getElementById('displayTotalCost').textContent = '₱' + total.toFixed(2);
                }
                
                document.getElementById('totalCostBox').style.display = 'block';
            }
        </script>
    `;

    modal.style.display = 'block';
}

/**
 * Submit Use Parts
 */
async function submitUseParts(e, repairId) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const partId = formData.get('partId');
    const quantity = parseInt(formData.get('quantity'));
    const notes = formData.get('notes');

    try {
        // Use part in repair (this will handle stock deduction and recording)
        await usePartInRepair(partId, quantity, repairId);

        closeUserModal();
        utils.showToast('success', 'Parts Used', `Parts have been recorded and stock updated`);
    } catch (error) {
        // Error already handled in usePartInRepair
    }
}

/**
 * View Stock Movements Report
 */
function viewStockMovementsReport() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = '📊 Stock Movements History';

    // Get recent movements (last 100)
    const recentMovements = window.stockMovements.slice(0, 100);

    modalContent.innerHTML = `
        <div style="margin-bottom:20px;">
            <p class="text-secondary">Showing last ${recentMovements.length} stock movements</p>
        </div>
        
        <div style="max-height:600px;overflow-y:auto;">
            ${recentMovements.length === 0 ? `
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:48px;margin-bottom:10px;">📦</div>
                    <div class="text-secondary">No stock movements recorded yet</div>
                </div>
            ` : `
                ${recentMovements.map(movement => {
        const isIncrease = movement.adjustment > 0;
        const color = isIncrease ? '#4caf50' : '#f44336';
        const icon = isIncrease ? '➕' : '➖';

        return `
                        <div style="padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:10px;border-left:4px solid ${color};">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <div style="flex:1;">
                                    <h4 style="margin:0 0 5px;">${icon} ${movement.partName}</h4>
                                    <div class="text-secondary" style="font-size:13px;">
                                        Part #: ${movement.partNumber}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:20px;font-weight:bold;color:${color};">
                                        ${isIncrease ? '+' : ''}${movement.adjustment}
                                    </div>
                                    <div class="text-secondary" style="font-size:12px;">
                                        ${movement.previousQuantity} → ${movement.newQuantity}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background:var(--bg-light);padding:10px;border-radius:4px;margin-top:10px;">
                                <div style="font-size:13px;margin-bottom:5px;">
                                    <strong>Reason:</strong> ${movement.reason}
                                </div>
                                <div style="font-size:12px;color:#666;">
                                    <strong>By:</strong> ${movement.performedBy} • 
                                    <strong>On:</strong> ${utils.formatDateTime(movement.timestamp)}
                                </div>
                            </div>
                        </div>
                    `;
    }).join('')}
            `}
        </div>
        
        <div style="margin-top:20px;">
            <button onclick="closeUserModal()" class="btn-secondary" style="width:100%;">Close</button>
        </div>
    `;

    modal.style.display = 'block';
}

window.viewStockMovementsReport = viewStockMovementsReport;
window.openUsePartsModal = openUsePartsModal;
window.submitUseParts = submitUseParts;

window.buildInventoryTab = buildInventoryTab;
window.filterInventoryTable = filterInventoryTable;
window.filterInventory = filterInventory;
window.openAddInventoryItemModal = openAddInventoryItemModal;
window.submitAddInventoryItem = submitAddInventoryItem;
window.editInventoryItemModal = editInventoryItemModal;
window.submitEditInventoryItem = submitEditInventoryItem;
window.adjustStockModal = adjustStockModal;
window.submitStockAdjustment = submitStockAdjustment;
window.openAddSupplierModal = openAddSupplierModal;
window.showAddSupplierForm = showAddSupplierForm;
window.hideSupplierForm = hideSupplierForm;
window.submitAddSupplier = submitAddSupplier;
window.editSupplierForm = editSupplierForm;
window.submitEditSupplier = submitEditSupplier;

// ===== ANALYTICS & REPORTS TAB =====

/**
 * Build Analytics Dashboard Tab
 */
function buildAnalyticsTab(container) {
    console.log('📊 Building Analytics tab');
    window.currentTabRefresh = () => buildAnalyticsTab(document.getElementById('analyticsTab'));

    // Get date range (default: last 30 days)
    const startDate = window.analyticsDateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = window.analyticsDateRange?.end || new Date();

    // Get all analytics data
    const revenue = getRevenueAnalytics(startDate, endDate);
    const performance = getTechnicianPerformance(startDate, endDate);
    const customers = getCustomerAnalytics(startDate, endDate);
    const repairTypes = getRepairTypeAnalytics(startDate, endDate);
    const inventory = getInventoryAnalytics(startDate, endDate);
    const financial = getFinancialReport(startDate, endDate);

    container.innerHTML = `
        <div class="page-header">
            <h2>📊 Analytics & Reports</h2>
            <p>Comprehensive business intelligence and reporting</p>
        </div>
        
        <!-- Date Range Selector -->
        <div class="analytics-controls" style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;gap:15px;flex-wrap:wrap;align-items:center;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Start Date</label>
                    <input type="date" id="analyticsStartDate" value="${startDate.toISOString().split('T')[0]}" 
                           style="padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-white);color:var(--text-primary);">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:600;">End Date</label>
                    <input type="date" id="analyticsEndDate" value="${endDate.toISOString().split('T')[0]}"
                           style="padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-white);color:var(--text-primary);">
                </div>
                <div style="display:flex;gap:10px;align-items:flex-end;">
                    <button onclick="updateAnalyticsDateRange()" class="btn-primary">Apply</button>
                    <button onclick="setQuickDateRange('7days')" class="btn-secondary">Last 7 Days</button>
                    <button onclick="setQuickDateRange('30days')" class="btn-secondary">Last 30 Days</button>
                    <button onclick="setQuickDateRange('thisMonth')" class="btn-secondary">This Month</button>
                </div>
            </div>
        </div>
        
        <!-- Revenue Overview Cards -->
        <h3 style="margin:25px 0 15px;">💰 Revenue Overview</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:30px;">
            <div class="stat-card" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Revenue</div>
                <div style="font-size:32px;font-weight:bold;">₱${revenue.totalRevenue.toLocaleString()}</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">${revenue.repairCount} repairs</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Parts Cost</div>
                <div style="font-size:32px;font-weight:bold;">₱${revenue.totalPartsCost.toLocaleString()}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Commissions</div>
                <div style="font-size:32px;font-weight:bold;">₱${revenue.totalCommissions.toLocaleString()}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Net Profit</div>
                <div style="font-size:32px;font-weight:bold;">₱${revenue.netProfit.toLocaleString()}</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">${revenue.profitMargin.toFixed(1)}% margin</div>
            </div>
        </div>
        
        <!-- Revenue by Type -->
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3 style="margin:0;">📊 Revenue by Repair Type</h3>
                <button onclick="exportRevenueByType()" class="btn-small">📥 Export CSV</button>
            </div>
            <div class="analytics-table">
                <table class="repair-table">
                    <thead>
                        <tr>
                            <th>Repair Type</th>
                            <th>Revenue</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(revenue.revenueByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, amount]) => `
                                <tr>
                                    <td><strong>${type}</strong></td>
                                    <td>₱${amount.toLocaleString()}</td>
                                    <td>${((amount / revenue.totalRevenue) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Technician Performance -->
        <h3 style="margin:25px 0 15px;">⚡ Technician Performance</h3>
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h4 style="margin:0;">Performance Metrics</h4>
                <button onclick="exportTechPerformance()" class="btn-small">📥 Export CSV</button>
            </div>
            <div class="analytics-table">
                <table class="repair-table">
                    <thead>
                        <tr>
                            <th>Technician</th>
                            <th>Total Repairs</th>
                            <th>Completed</th>
                            <th>Completion Rate</th>
                            <th>Avg Time (hrs)</th>
                            <th>Revenue</th>
                            <th>Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(performance)
            .sort((a, b) => b[1].totalRepairs - a[1].totalRepairs)
            .map(([tech, stats]) => `
                                <tr>
                                    <td><strong>${tech}</strong></td>
                                    <td>${stats.totalRepairs}</td>
                                    <td>${stats.completedRepairs}</td>
                                    <td><span style="color:${stats.completionRate >= 80 ? '#4caf50' : stats.completionRate >= 60 ? '#ff9800' : '#f44336'};">${stats.completionRate.toFixed(1)}%</span></td>
                                    <td>${stats.avgRepairTime.toFixed(1)}</td>
                                    <td>₱${stats.totalRevenue.toLocaleString()}</td>
                                    <td>₱${stats.totalCommission.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Customer Analytics -->
        <h3 style="margin:25px 0 15px;">👥 Customer Analytics</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-bottom:25px;">
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Total Customers</h4>
                <div style="font-size:36px;font-weight:bold;color:var(--primary);">${customers.totalCustomers}</div>
            </div>
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Repeat Customers</h4>
                <div style="font-size:36px;font-weight:bold;color:#4caf50;">${customers.repeatCustomers}</div>
                <div style="font-size:14px;color:var(--text-secondary);">${customers.repeatRate.toFixed(1)}% repeat rate</div>
            </div>
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Walk-in vs Dealer</h4>
                <div style="font-size:18px;"><span style="color:#2196f3;font-weight:bold;">${customers.walkinCount}</span> Walk-in</div>
                <div style="font-size:18px;"><span style="color:#9c27b0;font-weight:bold;">${customers.dealerCount}</span> Dealer</div>
            </div>
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Avg Spend</h4>
                <div style="font-size:36px;font-weight:bold;color:var(--primary);">₱${customers.avgSpendPerCustomer.toLocaleString()}</div>
            </div>
        </div>
        
        <!-- Top Customers -->
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h4 style="margin:0;">🏆 Top 10 Customers</h4>
                <button onclick="exportCustomerAnalytics()" class="btn-small">📥 Export CSV</button>
            </div>
            <div class="analytics-table">
                <table class="repair-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Total Repairs</th>
                            <th>Total Spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.topCustomers.map((c, index) => `
                            <tr>
                                <td>
                                    ${index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1) + '.'} 
                                    <strong>${c.name}</strong>
                                    ${c.shopName ? `<br><small style="color:var(--text-secondary);">${c.shopName}</small>` : ''}
                                </td>
                                <td><span class="status-badge" style="background:${c.type === 'Dealer' ? '#9c27b0' : '#2196f3'};">${c.type}</span></td>
                                <td>${c.totalRepairs}</td>
                                <td><strong>₱${c.totalSpent.toLocaleString()}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Repair Type Analytics -->
        <h3 style="margin:25px 0 15px;">🔧 Repair Type Analytics</h3>
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h4 style="margin:0;">Most Common Repairs</h4>
                <button onclick="exportRepairTypeAnalytics()" class="btn-small">📥 Export CSV</button>
            </div>
            <div class="analytics-table">
                <table class="repair-table">
                    <thead>
                        <tr>
                            <th>Repair Type</th>
                            <th>Count</th>
                            <th>Avg Revenue</th>
                            <th>Total Revenue</th>
                            <th>Profit</th>
                            <th>Completion %</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repairTypes.all.slice(0, 10).map(type => `
                            <tr>
                                <td><strong>${type.type}</strong></td>
                                <td>${type.count}</td>
                                <td>₱${type.avgRevenue.toLocaleString()}</td>
                                <td>₱${type.totalRevenue.toLocaleString()}</td>
                                <td style="color:${type.profit >= 0 ? '#4caf50' : '#f44336'};">₱${type.profit.toLocaleString()}</td>
                                <td>${type.completionRate.toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Inventory Analytics -->
        <h3 style="margin:25px 0 15px;">📦 Inventory Analytics</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Total Parts Cost</h4>
                <div style="font-size:28px;font-weight:bold;color:#f44336;">₱${inventory.totalPartsCost.toLocaleString()}</div>
            </div>
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Current Stock Value</h4>
                <div style="font-size:28px;font-weight:bold;color:#2196f3;">₱${inventory.totalInventoryValue.toLocaleString()}</div>
            </div>
            <div class="stat-card" style="background:var(--bg-secondary);padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px;">Stock Status</h4>
                <div style="font-size:16px;"><span style="color:#4caf50;font-weight:bold;">${inventory.currentStock}</span> In Stock</div>
                <div style="font-size:16px;"><span style="color:#ff9800;font-weight:bold;">${inventory.lowStock}</span> Low Stock</div>
                <div style="font-size:16px;"><span style="color:#f44336;font-weight:bold;">${inventory.outOfStock}</span> Out of Stock</div>
            </div>
        </div>
        
        <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h4 style="margin:0;">Most Used Parts</h4>
                <button onclick="exportInventoryAnalytics()" class="btn-small">📥 Export CSV</button>
            </div>
            <div class="analytics-table">
                <table class="repair-table">
                    <thead>
                        <tr>
                            <th>Part Name</th>
                            <th>Part Number</th>
                            <th>Times Used</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventory.mostUsedParts.map(part => `
                            <tr>
                                <td><strong>${part.partName}</strong></td>
                                <td><code>${part.partNumber}</code></td>
                                <td>${part.timesUsed}</td>
                                <td>${part.totalQuantity}</td>
                                <td>₱${part.totalCost.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Financial Summary -->
        <h3 style="margin:25px 0 15px;">💰 Financial Summary (P&L)</h3>
        <div style="background:var(--bg-secondary);padding:25px;border-radius:12px;margin-bottom:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h4 style="margin:0;">Profit & Loss Statement</h4>
                <button onclick="exportFinancialReport()" class="btn-small">📥 Export CSV</button>
            </div>
            <div style="max-width:600px;">
                <div class="financial-row" style="display:flex;justify-content:space-between;padding:12px;background:var(--bg-white);border-radius:8px;margin-bottom:10px;">
                    <span style="font-weight:600;">Total Revenue</span>
                    <span style="font-weight:bold;color:#4caf50;font-size:18px;">₱${financial.revenue.total.toLocaleString()}</span>
                </div>
                <div style="margin-left:20px;margin-bottom:15px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">Cash Payments</span>
                        <span>₱${financial.revenue.byCash.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">GCash Payments</span>
                        <span>₱${financial.revenue.byGCash.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">Bank Transfer</span>
                        <span>₱${financial.revenue.byBank.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="financial-row" style="display:flex;justify-content:space-between;padding:12px;background:var(--bg-white);border-radius:8px;margin-bottom:10px;">
                    <span style="font-weight:600;">Total Expenses</span>
                    <span style="font-weight:bold;color:#f44336;font-size:18px;">₱${financial.expenses.total.toLocaleString()}</span>
                </div>
                <div style="margin-left:20px;margin-bottom:15px;">
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">Parts Cost</span>
                        <span>₱${financial.expenses.parts.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">Commissions</span>
                        <span>₱${financial.expenses.commissions.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px;">
                        <span class="text-secondary">General Expenses</span>
                        <span>₱${financial.expenses.general.toLocaleString()}</span>
                    </div>
                </div>
                
                <div style="padding:20px;background:${financial.profit.net >= 0 ? '#e8f5e9' : '#ffebee'};border-radius:8px;border-left:4px solid ${financial.profit.net >= 0 ? '#4caf50' : '#f44336'};">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-size:14px;margin-bottom:5px;color:${financial.profit.net >= 0 ? '#2e7d32' : '#c62828'};">Net Profit</div>
                            <div style="font-size:36px;font-weight:bold;color:${financial.profit.net >= 0 ? '#2e7d32' : '#c62828'};">₱${financial.profit.net.toLocaleString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:14px;margin-bottom:5px;color:${financial.profit.net >= 0 ? '#2e7d32' : '#c62828'};">Profit Margin</div>
                            <div style="font-size:28px;font-weight:bold;color:${financial.profit.net >= 0 ? '#2e7d32' : '#c62828'};">${financial.profit.margin.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update analytics date range
 */
function updateAnalyticsDateRange() {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    window.analyticsDateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
    };

    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * Set quick date range
 */
function setQuickDateRange(range) {
    const end = new Date();
    let start = new Date();

    switch (range) {
        case '7days':
            start.setDate(end.getDate() - 7);
            break;
        case '30days':
            start.setDate(end.getDate() - 30);
            break;
        case 'thisMonth':
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            break;
    }

    window.analyticsDateRange = { start, end };

    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

// Export functions
function exportRevenueByType() {
    const revenue = getRevenueAnalytics(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = Object.entries(revenue.revenueByType).map(([type, amount]) => ({
        'Repair Type': type,
        'Revenue': amount,
        'Percentage': ((amount / revenue.totalRevenue) * 100).toFixed(2)
    }));
    exportToCSV(data, 'revenue_by_type');
}

function exportTechPerformance() {
    const performance = getTechnicianPerformance(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = Object.entries(performance).map(([tech, stats]) => ({
        'Technician': tech,
        'Total Repairs': stats.totalRepairs,
        'Completed': stats.completedRepairs,
        'Completion Rate': stats.completionRate.toFixed(2),
        'Avg Time (hrs)': stats.avgRepairTime.toFixed(2),
        'Revenue': stats.totalRevenue,
        'Commission': stats.totalCommission
    }));
    exportToCSV(data, 'technician_performance');
}

function exportCustomerAnalytics() {
    const customers = getCustomerAnalytics(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = customers.allCustomers.map(c => ({
        'Customer Name': c.name,
        'Phone': c.phone,
        'Type': c.type,
        'Shop Name': c.shopName || 'N/A',
        'Total Repairs': c.totalRepairs,
        'Total Spent': c.totalSpent
    }));
    exportToCSV(data, 'customer_analytics');
}

function exportRepairTypeAnalytics() {
    const repairTypes = getRepairTypeAnalytics(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = repairTypes.all.map(type => ({
        'Repair Type': type.type,
        'Count': type.count,
        'Avg Revenue': type.avgRevenue.toFixed(2),
        'Total Revenue': type.totalRevenue,
        'Total Cost': type.totalCost,
        'Profit': type.profit,
        'Profit Margin': type.profitMargin.toFixed(2),
        'Completion Rate': type.completionRate.toFixed(2)
    }));
    exportToCSV(data, 'repair_type_analytics');
}

function exportInventoryAnalytics() {
    const inventory = getInventoryAnalytics(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = inventory.allPartsUsage.map(part => ({
        'Part Name': part.partName,
        'Part Number': part.partNumber,
        'Times Used': part.timesUsed,
        'Total Quantity': part.totalQuantity,
        'Total Cost': part.totalCost
    }));
    exportToCSV(data, 'inventory_analytics');
}

function exportFinancialReport() {
    const financial = getFinancialReport(window.analyticsDateRange.start, window.analyticsDateRange.end);
    const data = [
        { 'Category': 'Revenue - Cash', 'Amount': financial.revenue.byCash },
        { 'Category': 'Revenue - GCash', 'Amount': financial.revenue.byGCash },
        { 'Category': 'Revenue - Bank Transfer', 'Amount': financial.revenue.byBank },
        { 'Category': 'Total Revenue', 'Amount': financial.revenue.total },
        { 'Category': 'Expenses - Parts', 'Amount': -financial.expenses.parts },
        { 'Category': 'Expenses - Commissions', 'Amount': -financial.expenses.commissions },
        { 'Category': 'Expenses - General', 'Amount': -financial.expenses.general },
        { 'Category': 'Total Expenses', 'Amount': -financial.expenses.total },
        { 'Category': 'Net Profit', 'Amount': financial.profit.net },
        { 'Category': 'Profit Margin (%)', 'Amount': financial.profit.margin.toFixed(2) }
    ];
    exportToCSV(data, 'financial_report');
}

window.buildAnalyticsTab = buildAnalyticsTab;
window.updateAnalyticsDateRange = updateAnalyticsDateRange;
window.setQuickDateRange = setQuickDateRange;
window.exportRevenueByType = exportRevenueByType;
window.exportTechPerformance = exportTechPerformance;
window.exportCustomerAnalytics = exportCustomerAnalytics;
window.exportRepairTypeAnalytics = exportRepairTypeAnalytics;
window.exportInventoryAnalytics = exportInventoryAnalytics;
window.exportFinancialReport = exportFinancialReport;

window.buildDailyRemittanceTab = buildDailyRemittanceTab;
window.buildRemittanceVerificationTab = buildRemittanceVerificationTab;
window.buildTechnicianLogsTab = buildTechnicianLogsTab;
window.selectTechnicianForLogs = selectTechnicianForLogs;

// Admin Tools helper functions (Phase 1)
window.buildTodayTransactionsSection = buildTodayTransactionsSection;
window.buildDeviceManagementSection = buildDeviceManagementSection;
window.buildPendingRemittancesSection = buildPendingRemittancesSection;
window.buildDataIntegritySection = buildDataIntegritySection;

/**
 * Toggle all device checkboxes
 */
function toggleAllDeviceCheckboxes() {
    const selectAll = document.getElementById('selectAllDevices');
    const checkboxes = document.querySelectorAll('.device-delete-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });

    updateBulkDeleteButton();
}

/**
 * Update bulk delete button state
 */
function updateBulkDeleteButton() {
    const checkboxes = document.querySelectorAll('.device-delete-checkbox:checked');
    const count = checkboxes.length;
    const countSpan = document.getElementById('selectedDeviceCount');
    const bulkBtn = document.getElementById('bulkDeleteBtn');
    const selectAll = document.getElementById('selectAllDevices');

    // Update count display
    if (countSpan) {
        countSpan.textContent = `(${count} selected)`;
    }

    // Show/hide bulk delete button
    if (bulkBtn) {
        if (count > 0) {
            bulkBtn.style.display = 'inline-block';
            bulkBtn.innerHTML = `🗑️ Delete Selected (${count})`;
        } else {
            bulkBtn.style.display = 'none';
        }
    }

    // Update select all checkbox state
    if (selectAll) {
        const allCheckboxes = document.querySelectorAll('.device-delete-checkbox');
        selectAll.checked = allCheckboxes.length > 0 && count === allCheckboxes.length;
        selectAll.indeterminate = count > 0 && count < allCheckboxes.length;
    }
}

/**
 * Execute bulk delete
 */
async function executeBulkDelete() {
    const checkboxes = document.querySelectorAll('.device-delete-checkbox:checked');
    const repairIds = Array.from(checkboxes).map(cb => cb.dataset.repairId);

    if (repairIds.length === 0) {
        alert('⚠️ No devices selected');
        return;
    }

    // Call the bulk delete function
    await window.adminBulkDeleteDevices(repairIds);
}

// ===== DATA CLEANUP & EXPORT HELPERS =====

/**
 * Fix data issues by category
 */
async function fixDataIssues(category) {
    const issues = window.calculateDataHealthIssues();

    if (!issues || !issues[category] || issues[category].length === 0) {
        alert('No issues to fix in this category');
        return;
    }

    const categoryNames = {
        missingPartsCost: 'Missing Parts Cost',
        orphanedRemittances: 'Orphaned Remittances',
        legacyPayments: 'Legacy Payments'
    };

    const confirmed = confirm(
        `Fix ${issues[category].length} ${categoryNames[category]} issue(s)?\n\n` +
        `This action is reversible for 90 days.\n\n` +
        `Click OK to proceed.`
    );

    if (!confirmed) return;

    // Perform cleanup
    const result = await window.performCleanup(category, issues[category]);

    if (result && result.success) {
        // Refresh tab to show updated status
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    }
}

/**
 * Show cleanup history modal
 */
async function showCleanupHistory() {
    const history = await window.getCleanupHistory(20);

    if (!history || history.length === 0) {
        alert('No cleanup history found');
        return;
    }

    const now = new Date();

    const historyHTML = history.map(cleanup => {
        const expiresAt = new Date(cleanup.expiresAt);
        const isExpired = now > expiresAt;
        const canUndo = !isExpired && cleanup.status === 'active';

        return `
            <tr>
                <td style="font-size:12px;">${utils.formatDateTime(cleanup.timestamp)}</td>
                <td>${cleanup.category}</td>
                <td>${cleanup.affectedRecords.length}</td>
                <td>${cleanup.performedBy}</td>
                <td>
                    <span class="cleanup-status-badge status-${cleanup.status}">
                        ${cleanup.status}
                    </span>
                </td>
                <td>
                    ${canUndo ? `
                        <button onclick="undoCleanupById('${cleanup.cleanupId}')" class="btn-small">
                            ↩️ Undo
                        </button>
                    ` : (isExpired ? '<small style="color:#999;">Expired</small>' : '<small style="color:#999;">Already undone</small>')}
                </td>
            </tr>
        `;
    }).join('');

    const modalHTML = `
        <div style="background:white;padding:20px;border-radius:8px;max-width:900px;max-height:80vh;overflow-y:auto;">
            <h3>📜 Cleanup History</h3>
            <table class="cleanup-history-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Category</th>
                        <th>Records</th>
                        <th>Performed By</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${historyHTML}
                </tbody>
            </table>
            <button onclick="closeModal()" class="btn" style="margin-top:20px;">Close</button>
        </div>
    `;

    // Show in a modal (reuse existing modal system or create simple overlay)
    const overlay = document.createElement('div');
    overlay.id = 'cleanup-history-modal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = modalHTML;
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
    document.body.appendChild(overlay);
}

/**
 * Undo cleanup by ID
 */
async function undoCleanupById(cleanupId) {
    const confirmed = confirm(
        'Undo this cleanup operation?\n\n' +
        'All changes will be reverted to their original state.'
    );

    if (!confirmed) return;

    const result = await window.undoCleanup(cleanupId);

    if (result && result.success) {
        // Close modal and refresh
        const modal = document.getElementById('cleanup-history-modal');
        if (modal) {
            document.body.removeChild(modal);
        }

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    }
}

/**
 * Update export schedule configuration
 */
function updateExportSchedule() {
    if (!window.exportScheduler) {
        console.error('Export scheduler not loaded');
        return;
    }

    const config = {
        daily: {
            enabled: document.getElementById('exportDailyEnabled').checked,
            time: document.getElementById('exportDailyTime').value
        },
        weekly: {
            enabled: document.getElementById('exportWeeklyEnabled').checked,
            time: '23:00',
            dayOfWeek: 0 // Sunday
        },
        monthly: {
            enabled: document.getElementById('exportMonthlyEnabled').checked,
            time: '00:00',
            dayOfMonth: 1
        }
    };

    const saved = window.exportScheduler.saveExportScheduleConfig(config);

    if (saved) {
        // Update the scheduler
        window.exportScheduler.updateSchedule();

        // Show success toast
        if (window.utils && window.utils.showToast) {
            window.utils.showToast('✅ Export schedule updated', 'success', 2000);
        }
    } else {
        alert('Error saving export schedule');
    }
}

// ===== PROFIT DASHBOARD TAB =====
function buildProfitDashboardTab(container) {
    console.log('💰 Building Profit Dashboard tab');
    window.currentTabRefresh = () => buildProfitDashboardTab(container);

    // Get date range (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    container.innerHTML = `
        <div class="card">
            <h3>💰 Profit Dashboard</h3>
            
            <!-- DATE RANGE SELECTOR -->
            <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;">
                    <div>
                        <label>Start Date</label>
                        <input type="date" id="profitStartDate" value="${startStr}" class="form-control">
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="date" id="profitEndDate" value="${endStr}" class="form-control">
                    </div>
                    <div>
                        <button onclick="refreshProfitDashboard()" class="btn btn-primary">
                            🔄 Refresh
                        </button>
                        <button onclick="exportCurrentProfitReport()" class="btn btn-success">
                            📊 Export CSV
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- DASHBOARD CONTENT -->
            <div id="profitDashboardContent">
                <div style="text-align:center;padding:40px;color:#999;">
                    Click "Refresh" to load profit data
                </div>
            </div>
        </div>
    `;
}

function refreshProfitDashboard() {
    const startInput = document.getElementById('profitStartDate');
    const endInput = document.getElementById('profitEndDate');

    if (!startInput || !endInput) return;

    const startDate = new Date(startInput.value + 'T00:00:00');
    const endDate = new Date(endInput.value + 'T23:59:59');

    utils.showLoading(true);

    setTimeout(() => {
        const dashboard = window.getProfitDashboard(startDate, endDate);
        const container = document.getElementById('profitDashboardContent');

        if (!container) {
            utils.showLoading(false);
            return;
        }

        container.innerHTML = `
            <!-- SUMMARY CARDS -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:25px;">
                <div class="stat-card" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;">
                    <div class="stat-label">Total Revenue</div>
                    <div class="stat-value">₱${dashboard.summary.totalRevenue.toFixed(2)}</div>
                    <div class="stat-sublabel">${dashboard.summary.repairCount} repairs</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;">
                    <div class="stat-label">Parts Cost</div>
                    <div class="stat-value">₱${dashboard.summary.totalPartsCost.toFixed(2)}</div>
                    <div class="stat-sublabel">${((dashboard.summary.totalPartsCost / dashboard.summary.totalRevenue) * 100).toFixed(1)}% of revenue</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#fa709a 0%,#fee140 100%);color:white;">
                    <div class="stat-label">Tech Commission (Paid Out)</div>
                    <div class="stat-value">₱${dashboard.summary.totalCommission.toFixed(2)}</div>
                    <div class="stat-sublabel">${((dashboard.summary.totalCommission / dashboard.summary.totalRevenue) * 100).toFixed(1)}% of revenue</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#30cfd0 0%,#330867 100%);color:white;">
                    <div class="stat-label">Overhead (Total Period)</div>
                    <div class="stat-value">₱${dashboard.summary.totalOverhead.toFixed(2)}</div>
                    <div class="stat-sublabel">${dashboard.summary.repairCount > 0 ? '₱' + (dashboard.summary.totalOverhead / dashboard.summary.repairCount).toFixed(2) + ' avg per repair' : 'No repairs'}</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,${dashboard.summary.totalNetProfit >= 0 ? '#11998e 0%,#38ef7d 100%' : '#eb3349 0%,#f45c43 100%'});color:white;">
                    <div class="stat-label">Net Profit</div>
                    <div class="stat-value">₱${dashboard.summary.totalNetProfit.toFixed(2)}</div>
                    <div class="stat-sublabel">₱${dashboard.summary.avgProfitPerRepair.toFixed(2)} per repair</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);color:#333;">
                    <div class="stat-label">Profit Margin</div>
                    <div class="stat-value">${dashboard.summary.avgProfitMargin.toFixed(1)}%</div>
                    <div class="stat-sublabel">${dashboard.summary.avgProfitMargin >= 20 ? '✅ Healthy' : dashboard.summary.avgProfitMargin >= 10 ? '⚠️ Fair' : '❌ Low'}</div>
                </div>
            </div>
            
            <!-- PROFIT BY REPAIR TYPE -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">📊 Profit by Repair Type</h4>
                <div style="overflow-x:auto;">
                    <table class="repairs-table">
                        <thead>
                            <tr>
                                <th>Repair Type</th>
                                <th>Count</th>
                                <th>Revenue</th>
                                <th>Shop Revenue (60%)</th>
                                <th>Margin</th>
                                <th>Avg Shop Rev</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(dashboard.byType.byType).map(([type, data]) => `
                                <tr>
                                    <td><strong>${type}</strong></td>
                                    <td>${data.count}</td>
                                    <td>₱${data.totalRevenue.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;">
                                        ₱${data.totalNetProfit.toFixed(2)}
                                    </td>
                                    <td>
                                        <span style="background:${data.avgProfitMargin >= 50 ? '#4caf50' : data.avgProfitMargin >= 40 ? '#ff9800' : '#f44336'};
                                                     color:white;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:bold;">
                                            ${data.avgProfitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td>₱${data.avgProfit.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- PROFIT BY TECHNICIAN -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">👨‍🔧 Profit by Technician</h4>
                <div style="overflow-x:auto;">
                    <table class="repairs-table">
                        <thead>
                            <tr>
                                <th>Technician</th>
                                <th>Repairs</th>
                                <th>Revenue</th>
                                <th>Shop Revenue (60%)</th>
                                <th>Margin</th>
                                <th>Avg Shop Rev</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(dashboard.byTechnician).map(([tech, data]) => `
                                <tr>
                                    <td><strong>${tech}</strong></td>
                                    <td>${data.repairCount}</td>
                                    <td>₱${data.totalRevenue.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;">
                                        ₱${data.totalNetProfit.toFixed(2)}
                                    </td>
                                    <td>
                                        <span style="background:${data.avgProfitMargin >= 50 ? '#4caf50' : data.avgProfitMargin >= 40 ? '#ff9800' : '#f44336'};
                                                     color:white;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:bold;">
                                            ${data.avgProfitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td>₱${data.avgProfit.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- PROFIT TRENDS -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 15px;">📈 Daily Profit Trends</h4>
                <div style="overflow-x:auto;">
                    <table class="repairs-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Repairs</th>
                                <th>Revenue</th>
                                <th>Parts + Tech (40%)</th>
                                <th>Shop Revenue (60%)</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dashboard.trends.map(trend => `
                                <tr>
                                    <td>${utils.formatDate(new Date(trend.period))}</td>
                                    <td>${trend.repairCount}</td>
                                    <td>₱${trend.totalRevenue.toFixed(2)}</td>
                                    <td>₱${trend.totalCosts.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;">
                                        ₱${trend.totalProfit.toFixed(2)}
                                    </td>
                                    <td>${trend.avgProfitMargin.toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        utils.showLoading(false);
    }, 300);
}

function exportCurrentProfitReport() {
    const startInput = document.getElementById('profitStartDate');
    const endInput = document.getElementById('profitEndDate');

    if (!startInput || !endInput) return;

    const startDate = new Date(startInput.value + 'T00:00:00');
    const endDate = new Date(endInput.value + 'T23:59:59');

    window.exportProfitReport(startDate, endDate);

    if (window.utils && window.utils.showToast) {
        window.utils.showToast('✅ Profit report exported', 'success', 2000);
    }
}

// ===== OVERHEAD EXPENSES TAB =====
function buildOverheadExpensesTab(container) {
    console.log('💼 Building Overhead Expenses tab');
    window.currentTabRefresh = () => buildOverheadExpensesTab(container);

    // Get current month expenses
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthExpenses = (window.overheadExpenses || []).filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd && !exp.deleted;
    });

    const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Group by category
    const byCategory = {};
    monthExpenses.forEach(exp => {
        if (!byCategory[exp.category]) byCategory[exp.category] = 0;
        byCategory[exp.category] += exp.amount;
    });

    container.innerHTML = `
        <div class="card">
            <h3>💼 Overhead Expenses</h3>
            
            <!-- ADD NEW EXPENSE -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">➕ Add New Overhead Expense</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Category *</label>
                        <select id="overheadCategory" class="form-control">
                            <option value="Rent">🏢 Rent</option>
                            <option value="Utilities">⚡ Utilities (Electric, Water)</option>
                            <option value="Salaries">👥 Salaries</option>
                            <option value="Equipment">🔧 Equipment</option>
                            <option value="Marketing">📢 Marketing</option>
                            <option value="Insurance">🛡️ Insurance</option>
                            <option value="Supplies">📦 Supplies</option>
                            <option value="Maintenance">🔨 Maintenance</option>
                            <option value="Other">📝 Other</option>
                        </select>
                    </div>
                    <div>
                        <label>Amount *</label>
                        <input type="number" id="overheadAmount" class="form-control" placeholder="0.00" step="0.01" min="0">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Date *</label>
                        <input type="date" id="overheadDate" class="form-control" value="${now.toISOString().split('T')[0]}">
                    </div>
                    <div>
                        <label>Recurring</label>
                        <select id="overheadRecurring" class="form-control">
                            <option value="">One-time</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:15px;">
                    <label>Description</label>
                    <textarea id="overheadDescription" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
                </div>
                <button onclick="saveOverheadExpense()" class="btn btn-primary">
                    ✅ Add Expense
                </button>
            </div>
            
            <!-- MONTHLY SUMMARY -->
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 10px;">📊 ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)} Summary</h4>
                <div style="font-size:32px;font-weight:bold;margin-bottom:10px;">₱${monthTotal.toFixed(2)}</div>
                <div style="font-size:14px;opacity:0.9;">${monthExpenses.length} expense(s)</div>
                
                ${Object.keys(byCategory).length > 0 ? `
                    <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.3);">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
                            ${Object.entries(byCategory).map(([cat, amt]) => `
                                <div>
                                    <div style="font-size:12px;opacity:0.9;">${cat}</div>
                                    <div style="font-size:18px;font-weight:bold;">₱${amt.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- EXPENSE LIST -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 15px;">📋 All Overhead Expenses</h4>
                ${(window.overheadExpenses || []).filter(e => !e.deleted).length === 0 ? `
                    <div style="text-align:center;padding:40px;color:#999;">
                        No overhead expenses recorded yet
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="repairs-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Recurring</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(window.overheadExpenses || [])
            .filter(e => !e.deleted)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(exp => `
                                        <tr>
                                            <td>${utils.formatDate(new Date(exp.date))}</td>
                                            <td><strong>${exp.category}</strong></td>
                                            <td style="font-weight:bold;color:#667eea;">₱${exp.amount.toFixed(2)}</td>
                                            <td>${exp.recurringFrequency ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;">${exp.recurringFrequency}</span>` : '-'}</td>
                                            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${exp.description || exp.notes || '-'}</td>
                                            <td>
                                                <button onclick="deleteOverheadExpenseById('${exp.id}')" class="btn btn-danger btn-sm">
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function saveOverheadExpense() {
    const category = document.getElementById('overheadCategory').value;
    const amount = parseFloat(document.getElementById('overheadAmount').value);
    const date = document.getElementById('overheadDate').value;
    const recurring = document.getElementById('overheadRecurring').value;
    const description = document.getElementById('overheadDescription').value.trim();

    if (!category || !amount || amount <= 0 || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const expense = {
        category: category,
        amount: amount,
        date: date + 'T00:00:00.000Z',
        isRecurring: recurring ? true : false,
        recurringFrequency: recurring || null,
        description: description || '',
        notes: description || '',
        createdBy: window.currentUser.uid,
        createdByName: window.currentUserData.displayName,
        createdAt: new Date().toISOString()
    };

    utils.showLoading(true);

    window.addOverheadExpense(expense)
        .then(() => {
            utils.showLoading(false);
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('✅ Overhead expense added', 'success', 2000);
            }

            // Clear form
            document.getElementById('overheadAmount').value = '';
            document.getElementById('overheadDescription').value = '';

            // Refresh will happen automatically via Firebase listener
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error adding overhead expense: ' + error.message);
        });
}

function deleteOverheadExpenseById(expenseId) {
    if (!confirm('Delete this overhead expense?')) return;

    utils.showLoading(true);

    window.deleteOverheadExpense(expenseId)
        .then(() => {
            utils.showLoading(false);
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('✅ Overhead expense deleted', 'success', 2000);
            }
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error deleting overhead expense: ' + error.message);
        });
}

// ===== SUPPLIER PAYABLES TAB =====
function buildSupplierPayablesTab(container) {
    console.log('🧾 Building Supplier Payables tab');
    window.currentTabRefresh = () => buildSupplierPayablesTab(document.getElementById('supplier-payablesTab'));

    const purchases = window.supplierPurchases || [];
    const unpaid = purchases.filter(p => p.paymentStatus === 'unpaid' && !p.deleted);
    const partial = purchases.filter(p => p.paymentStatus === 'partial' && !p.deleted);
    const overdue = window.getOverduePurchases ? window.getOverduePurchases() : [];

    const totalOutstanding = [...unpaid, ...partial].reduce((sum, p) => sum + p.outstandingBalance, 0);

    // Group by supplier
    const bySupplier = {};
    purchases.filter(p => !p.deleted && p.paymentStatus !== 'paid').forEach(p => {
        if (!bySupplier[p.supplierName]) {
            bySupplier[p.supplierName] = {
                count: 0,
                total: 0,
                overdue: 0
            };
        }
        bySupplier[p.supplierName].count++;
        bySupplier[p.supplierName].total += p.outstandingBalance;
        if (overdue.some(o => o.id === p.id)) {
            bySupplier[p.supplierName].overdue++;
        }
    });

    container.innerHTML = `
        <div class="card">
            <h3>🧾 Supplier Payables</h3>
            
            <!-- ADD NEW PURCHASE -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">➕ Record New Purchase</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Supplier *</label>
                        <input type="text" id="purchaseSupplier" class="form-control" placeholder="Supplier name">
                    </div>
                    <div>
                        <label>Invoice Number *</label>
                        <input type="text" id="purchaseInvoice" class="form-control" placeholder="INV-001">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Amount *</label>
                        <input type="number" id="purchaseAmount" class="form-control" placeholder="0.00" step="0.01" min="0">
                    </div>
                    <div>
                        <label>Purchase Date *</label>
                        <input type="date" id="purchaseDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div>
                        <label>Due Date</label>
                        <input type="date" id="purchaseDueDate" class="form-control">
                    </div>
                </div>
                <div style="margin-bottom:15px;">
                    <label>Description</label>
                    <textarea id="purchaseDescription" class="form-control" rows="2" placeholder="Items purchased..."></textarea>
                </div>
                <button onclick="saveSupplierPurchase()" class="btn btn-primary">
                    ✅ Record Purchase
                </button>
            </div>
            
            <!-- OUTSTANDING SUMMARY -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
                <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;">
                    <div class="stat-label">Total Outstanding</div>
                    <div class="stat-value">₱${totalOutstanding.toFixed(2)}</div>
                    <div class="stat-sublabel">${unpaid.length + partial.length} invoice(s)</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#fa709a 0%,#fee140 100%);color:white;">
                    <div class="stat-label">Unpaid</div>
                    <div class="stat-value">${unpaid.length}</div>
                    <div class="stat-sublabel">₱${unpaid.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#ff9a56 0%,#ff6a88 100%);color:white;">
                    <div class="stat-label">Partial Paid</div>
                    <div class="stat-value">${partial.length}</div>
                    <div class="stat-sublabel">₱${partial.reduce((sum, p) => sum + p.outstandingBalance, 0).toFixed(2)} remaining</div>
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#eb3349 0%,#f45c43 100%);color:white;">
                    <div class="stat-label">Overdue</div>
                    <div class="stat-value">${overdue.length}</div>
                    <div class="stat-sublabel">⚠️ Action required</div>
                </div>
            </div>
            
            <!-- BY SUPPLIER -->
            ${Object.keys(bySupplier).length > 0 ? `
                <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                    <h4 style="margin:0 0 15px;">📊 Outstanding by Supplier</h4>
                    <div style="overflow-x:auto;">
                        <table class="repairs-table">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Invoices</th>
                                    <th>Outstanding</th>
                                    <th>Overdue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(bySupplier)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([supplier, data]) => `
                                        <tr>
                                            <td><strong>${supplier}</strong></td>
                                            <td>${data.count}</td>
                                            <td style="font-weight:bold;color:#f5576c;">₱${data.total.toFixed(2)}</td>
                                            <td>${data.overdue > 0 ? `<span style="background:#f44336;color:white;padding:2px 6px;border-radius:3px;font-size:11px;">${data.overdue}</span>` : '-'}</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
            
            <!-- ALL PURCHASES -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 15px;">📋 All Supplier Purchases</h4>
                ${purchases.filter(p => !p.deleted).length === 0 ? `
                    <div style="text-align:center;padding:40px;color:#999;">
                        No supplier purchases recorded yet
                    </div>
                ` : `
                    <div style="overflow-x:auto;">
                        <table class="repairs-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Supplier</th>
                                    <th>Invoice</th>
                                    <th>Amount</th>
                                    <th>Paid</th>
                                    <th>Outstanding</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${purchases
            .filter(p => !p.deleted)
            .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
            .map(purchase => {
                const isOverdue = overdue.some(o => o.id === purchase.id);
                return `
                                            <tr style="${isOverdue ? 'background:#ffebee;' : ''}">
                                                <td>${utils.formatDate(new Date(purchase.purchaseDate))}</td>
                                                <td><strong>${purchase.supplierName}</strong></td>
                                                <td>${purchase.invoiceNumber}</td>
                                                <td>₱${purchase.amount.toFixed(2)}</td>
                                                <td style="color:#4caf50;">₱${purchase.totalPaid.toFixed(2)}</td>
                                                <td style="font-weight:bold;color:${purchase.outstandingBalance > 0 ? '#f44336' : '#4caf50'};">
                                                    ₱${purchase.outstandingBalance.toFixed(2)}
                                                </td>
                                                <td>
                                                    ${purchase.dueDate ? utils.formatDate(new Date(purchase.dueDate)) : '-'}
                                                    ${isOverdue ? '<br><span style="color:#f44336;font-size:11px;">⚠️ OVERDUE</span>' : ''}
                                                </td>
                                                <td>
                                                    <span style="background:${purchase.paymentStatus === 'paid' ? '#4caf50' : purchase.paymentStatus === 'partial' ? '#ff9800' : '#f44336'};
                                                                 color:white;padding:3px 8px;border-radius:3px;font-size:11px;font-weight:bold;">
                                                        ${purchase.paymentStatus.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    ${purchase.paymentStatus !== 'paid' ? `
                                                        <button onclick="showRecordPaymentModal('${purchase.id}')" class="btn btn-success btn-sm">
                                                            💵 Pay
                                                        </button>
                                                    ` : ''}
                                                    <button onclick="viewPurchaseDetails('${purchase.id}')" class="btn btn-primary btn-sm">
                                                        👁️ View
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
            }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function saveSupplierPurchase() {
    const supplier = document.getElementById('purchaseSupplier').value.trim();
    const invoice = document.getElementById('purchaseInvoice').value.trim();
    const amount = parseFloat(document.getElementById('purchaseAmount').value);
    const purchaseDate = document.getElementById('purchaseDate').value;
    const dueDate = document.getElementById('purchaseDueDate').value;
    const description = document.getElementById('purchaseDescription').value.trim();

    if (!supplier || !invoice || !amount || amount <= 0 || !purchaseDate) {
        alert('Please fill in all required fields');
        return;
    }

    const purchase = {
        supplierName: supplier,
        invoiceNumber: invoice,
        amount: amount,
        purchaseDate: purchaseDate + 'T00:00:00.000Z',
        dueDate: dueDate ? dueDate + 'T00:00:00.000Z' : null,
        description: description || null,
        paymentStatus: 'unpaid',
        totalPaid: 0,
        outstandingBalance: amount,
        payments: [],
        createdBy: window.currentUser.uid,
        createdByName: window.currentUserData.displayName,
        createdAt: new Date().toISOString()
    };

    utils.showLoading(true);

    window.addSupplierPurchase(purchase)
        .then(() => {
            utils.showLoading(false);
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('✅ Purchase recorded', 'success', 2000);
            }

            // Clear form
            document.getElementById('purchaseSupplier').value = '';
            document.getElementById('purchaseInvoice').value = '';
            document.getElementById('purchaseAmount').value = '';
            document.getElementById('purchaseDueDate').value = '';
            document.getElementById('purchaseDescription').value = '';
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error recording purchase: ' + error.message);
        });
}

function showRecordPaymentModal(purchaseId) {
    const purchase = (window.supplierPurchases || []).find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Purchase not found');
        return;
    }

    const modal = document.getElementById('supplierPaymentModal');
    if (!modal) {
        // Create modal if it doesn't exist
        const modalHTML = `
            <div id="supplierPaymentModal" class="modal">
                <div class="modal-content" style="max-width:500px;">
                    <span class="close" onclick="document.getElementById('supplierPaymentModal').style.display='none'">&times;</span>
                    <h3>💵 Record Payment</h3>
                    
                    <div id="supplierPaymentModalContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const contentDiv = document.getElementById('supplierPaymentModalContent');
    contentDiv.innerHTML = `
        <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
            <div style="margin-bottom:10px;">
                <strong>Supplier:</strong> ${purchase.supplierName}
            </div>
            <div style="margin-bottom:10px;">
                <strong>Invoice:</strong> ${purchase.invoiceNumber}
            </div>
            <div style="margin-bottom:10px;">
                <strong>Total Amount:</strong> ₱${purchase.amount.toFixed(2)}
            </div>
            <div style="margin-bottom:10px;">
                <strong>Already Paid:</strong> <span style="color:#4caf50;">₱${purchase.totalPaid.toFixed(2)}</span>
            </div>
            <div>
                <strong>Outstanding:</strong> <span style="color:#f44336;font-size:18px;font-weight:bold;">₱${purchase.outstandingBalance.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="form-group">
            <label>Payment Amount *</label>
            <input type="number" id="paymentAmount" class="form-control" 
                   placeholder="0.00" step="0.01" min="0" max="${purchase.outstandingBalance}"
                   value="${purchase.outstandingBalance}">
        </div>
        
        <div class="form-group">
            <label>Payment Date *</label>
            <input type="date" id="paymentDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
        </div>
        
        <div class="form-group">
            <label>Payment Method</label>
            <select id="paymentMethod" class="form-control">
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Other">Other</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Reference Number</label>
            <input type="text" id="paymentReference" class="form-control" placeholder="Optional">
        </div>
        
        <div class="form-group">
            <label>Notes</label>
            <textarea id="paymentNotes" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
        </div>
        
        <div style="display:flex;gap:10px;margin-top:20px;">
            <button onclick="confirmSupplierPayment('${purchaseId}')" class="btn btn-success" style="flex:1;">
                ✅ Record Payment
            </button>
            <button onclick="document.getElementById('supplierPaymentModal').style.display='none'" class="btn btn-secondary" style="flex:1;">
                ❌ Cancel
            </button>
        </div>
    `;

    document.getElementById('supplierPaymentModal').style.display = 'block';
}

function confirmSupplierPayment(purchaseId) {
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const method = document.getElementById('paymentMethod').value;
    const reference = document.getElementById('paymentReference').value.trim();
    const notes = document.getElementById('paymentNotes').value.trim();

    const purchase = (window.supplierPurchases || []).find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Purchase not found');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid payment amount');
        return;
    }

    if (amount > purchase.outstandingBalance) {
        alert('Payment amount cannot exceed outstanding balance');
        return;
    }

    if (!date) {
        alert('Please select a payment date');
        return;
    }

    const payment = {
        amount: amount,
        date: date + 'T00:00:00.000Z',
        method: method,
        reference: reference || null,
        notes: notes || null,
        recordedBy: window.currentUser.uid,
        recordedByName: window.currentUserData.displayName,
        recordedAt: new Date().toISOString()
    };

    utils.showLoading(true);
    document.getElementById('supplierPaymentModal').style.display = 'none';

    window.recordSupplierPayment(purchaseId, payment)
        .then(() => {
            utils.showLoading(false);
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('✅ Payment recorded', 'success', 2000);
            }
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error recording payment: ' + error.message);
        });
}

function viewPurchaseDetails(purchaseId) {
    const purchase = (window.supplierPurchases || []).find(p => p.id === purchaseId);
    if (!purchase) {
        alert('Purchase not found');
        return;
    }

    const paymentsHTML = (purchase.payments || []).length > 0 ? `
        <h4 style="margin:20px 0 10px;">Payment History</h4>
        <table class="repairs-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Recorded By</th>
                </tr>
            </thead>
            <tbody>
                ${purchase.payments.map(pmt => `
                    <tr>
                        <td>${utils.formatDate(new Date(pmt.date))}</td>
                        <td style="color:#4caf50;font-weight:bold;">₱${pmt.amount.toFixed(2)}</td>
                        <td>${pmt.method}</td>
                        <td>${pmt.reference || '-'}</td>
                        <td>${pmt.recordedByName}<br><small>${utils.formatDateTime(pmt.recordedAt)}</small></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p style="color:#999;text-align:center;padding:20px;">No payments recorded yet</p>';

    const detailsHTML = `
        <h3>🧾 Purchase Details</h3>
        
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Supplier</div>
                    <div style="font-size:18px;font-weight:bold;">${purchase.supplierName}</div>
                </div>
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Invoice Number</div>
                    <div style="font-size:18px;font-weight:bold;">${purchase.invoiceNumber}</div>
                </div>
            </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px;">
            <div style="background:white;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <div style="color:#666;font-size:12px;margin-bottom:5px;">Total Amount</div>
                <div style="font-size:24px;font-weight:bold;">₱${purchase.amount.toFixed(2)}</div>
            </div>
            <div style="background:white;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <div style="color:#666;font-size:12px;margin-bottom:5px;">Total Paid</div>
                <div style="font-size:24px;font-weight:bold;color:#4caf50;">₱${purchase.totalPaid.toFixed(2)}</div>
            </div>
            <div style="background:white;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <div style="color:#666;font-size:12px;margin-bottom:5px;">Outstanding</div>
                <div style="font-size:24px;font-weight:bold;color:#f44336;">₱${purchase.outstandingBalance.toFixed(2)}</div>
            </div>
        </div>
        
        <div style="background:white;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Purchase Date</div>
                    <div>${utils.formatDate(new Date(purchase.purchaseDate))}</div>
                </div>
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Due Date</div>
                    <div>${purchase.dueDate ? utils.formatDate(new Date(purchase.dueDate)) : 'Not set'}</div>
                </div>
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Status</div>
                    <div>
                        <span style="background:${purchase.paymentStatus === 'paid' ? '#4caf50' : purchase.paymentStatus === 'partial' ? '#ff9800' : '#f44336'};
                                     color:white;padding:5px 10px;border-radius:3px;font-size:12px;font-weight:bold;">
                            ${purchase.paymentStatus.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div>
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Created By</div>
                    <div>${purchase.createdByName}<br><small>${utils.formatDateTime(purchase.createdAt)}</small></div>
                </div>
            </div>
            ${purchase.description ? `
                <div style="margin-top:15px;padding-top:15px;border-top:1px solid #eee;">
                    <div style="color:#666;font-size:12px;margin-bottom:5px;">Description</div>
                    <div>${purchase.description}</div>
                </div>
            ` : ''}
        </div>
        
        ${paymentsHTML}
    `;

    showModal('Purchase Details', detailsHTML);
}

// Export profit dashboard functions
window.buildProfitDashboardTab = buildProfitDashboardTab;
window.refreshProfitDashboard = refreshProfitDashboard;
window.exportCurrentProfitReport = exportCurrentProfitReport;

// Export overhead expense functions
window.buildOverheadExpensesTab = buildOverheadExpensesTab;
window.saveOverheadExpense = saveOverheadExpense;
window.deleteOverheadExpenseById = deleteOverheadExpenseById;

// Export supplier payables functions
window.buildSupplierPayablesTab = buildSupplierPayablesTab;
window.saveSupplierPurchase = saveSupplierPurchase;
window.showRecordPaymentModal = showRecordPaymentModal;
window.confirmSupplierPayment = confirmSupplierPayment;
window.viewPurchaseDetails = viewPurchaseDetails;

// ===== FINANCIAL REPORTS TAB =====
function buildFinancialReportsTab(container) {
    console.log('📑 Building Financial Reports tab');
    window.currentTabRefresh = () => buildFinancialReportsTab(document.getElementById('financial-reportsTab'));
    
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    
    container.innerHTML = `
        <div class="card">
            <h3>📑 Financial Reports</h3>
            
            <!-- PROFIT & LOSS STATEMENT -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">📊 Profit & Loss Statement</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-bottom:15px;">
                    <div>
                        <label>Start Date</label>
                        <input type="date" id="plStartDate" class="form-control" value="${currentYear}-01-01">
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="date" id="plEndDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="display:flex;align-items:end;gap:10px;">
                        <button onclick="generatePLStatement()" class="btn btn-primary">📊 Generate</button>
                        <button onclick="exportPLStatementCSV()" class="btn btn-success">💾 Export CSV</button>
                    </div>
                </div>
                <div id="plStatementContent"></div>
            </div>
            
            <!-- QUARTERLY SUMMARY -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">📅 Quarterly Summary</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-bottom:15px;">
                    <div>
                        <label>Year</label>
                        <select id="quarterYear" class="form-control">
                            ${[currentYear, currentYear - 1, currentYear - 2].map(y => 
                                `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label>Quarter</label>
                        <select id="quarter" class="form-control">
                            ${[1, 2, 3, 4].map(q => 
                                `<option value="${q}" ${q === currentQuarter ? 'selected' : ''}>Q${q}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div style="display:flex;align-items:end;gap:10px;">
                        <button onclick="generateQuarterlySummary()" class="btn btn-primary">📊 Generate</button>
                        <button onclick="exportQuarterlySummaryCSV()" class="btn btn-success">💾 Export CSV</button>
                    </div>
                </div>
                <div id="quarterlySummaryContent"></div>
            </div>
            
            <!-- ANNUAL SUMMARY -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                <h4 style="margin:0 0 15px;">📆 Annual Summary</h4>
                <div style="display:grid;grid-template-columns:1fr auto;gap:10px;">
                    <div>
                        <label>Year</label>
                        <select id="annualYear" class="form-control">
                            ${[currentYear, currentYear - 1, currentYear - 2].map(y => 
                                `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div style="display:flex;align-items:end;gap:10px;">
                        <button onclick="exportAnnualPLStatementCSV()" class="btn btn-success">💾 Export Annual P&L</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generatePLStatement() {
    const startInput = document.getElementById('plStartDate');
    const endInput = document.getElementById('plEndDate');
    const container = document.getElementById('plStatementContent');
    
    if (!startInput || !endInput || !container) return;
    
    const startDate = new Date(startInput.value + 'T00:00:00');
    const endDate = new Date(endInput.value + 'T23:59:59');
    
    utils.showLoading(true);
    
    setTimeout(() => {
        const pl = window.generateProfitLossStatement(startDate, endDate);
        
        if (!pl) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No data available</p>';
            utils.showLoading(false);
            return;
        }
        
        container.innerHTML = `
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-top:15px;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="border-bottom:2px solid #333;">
                        <td colspan="2" style="padding:10px;font-size:18px;font-weight:bold;">PROFIT & LOSS STATEMENT</td>
                    </tr>
                    <tr style="border-bottom:1px solid #ddd;">
                        <td colspan="2" style="padding:8px;color:#666;">${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}</td>
                    </tr>
                    
                    <!-- REVENUE -->
                    <tr style="background:#f8f9fa;">
                        <td style="padding:10px;font-weight:bold;">REVENUE</td>
                        <td style="padding:10px;text-align:right;"></td>
                    </tr>
                    <tr>
                        <td style="padding:8px 10px 8px 30px;">Total Revenue (${pl.revenue.repairCount} repairs)</td>
                        <td style="padding:8px 10px;text-align:right;font-weight:bold;">₱${pl.revenue.totalRevenue.toFixed(2)}</td>
                    </tr>
                    
                    <!-- COGS -->
                    <tr style="background:#f8f9fa;">
                        <td style="padding:10px;font-weight:bold;">COST OF GOODS SOLD</td>
                        <td style="padding:10px;text-align:right;"></td>
                    </tr>
                    <tr>
                        <td style="padding:8px 10px 8px 30px;">Parts Cost</td>
                        <td style="padding:8px 10px;text-align:right;">₱${pl.cogs.partsCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 10px 8px 30px;">Technician Commission</td>
                        <td style="padding:8px 10px;text-align:right;">₱${pl.cogs.commission.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top:1px solid #ddd;">
                        <td style="padding:8px 10px 8px 30px;font-weight:bold;">Total COGS</td>
                        <td style="padding:8px 10px;text-align:right;font-weight:bold;">₱${pl.cogs.total.toFixed(2)}</td>
                    </tr>
                    
                    <!-- GROSS PROFIT -->
                    <tr style="background:#e3f2fd;border-top:2px solid #333;">
                        <td style="padding:10px;font-weight:bold;">GROSS PROFIT</td>
                        <td style="padding:10px;text-align:right;font-weight:bold;color:#2196f3;">₱${pl.grossProfit.amount.toFixed(2)}</td>
                    </tr>
                    <tr style="background:#e3f2fd;">
                        <td style="padding:8px 10px 8px 30px;">Gross Margin</td>
                        <td style="padding:8px 10px;text-align:right;">${pl.grossProfit.margin.toFixed(2)}%</td>
                    </tr>
                    
                    <!-- OPERATING EXPENSES -->
                    <tr style="background:#f8f9fa;">
                        <td style="padding:10px;font-weight:bold;">OPERATING EXPENSES</td>
                        <td style="padding:10px;text-align:right;"></td>
                    </tr>
                    ${Object.entries(pl.operatingExpenses.byCategory).map(([cat, amt]) => `
                        <tr>
                            <td style="padding:8px 10px 8px 30px;">${cat}</td>
                            <td style="padding:8px 10px;text-align:right;">₱${amt.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="border-top:1px solid #ddd;">
                        <td style="padding:8px 10px 8px 30px;font-weight:bold;">Total Operating Expenses</td>
                        <td style="padding:8px 10px;text-align:right;font-weight:bold;">₱${pl.operatingExpenses.total.toFixed(2)}</td>
                    </tr>
                    
                    <!-- NET INCOME -->
                    <tr style="background:${pl.netIncome.amount >= 0 ? '#e8f5e9' : '#ffebee'};border-top:2px solid #333;">
                        <td style="padding:12px;font-weight:bold;font-size:16px;">NET INCOME</td>
                        <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:${pl.netIncome.amount >= 0 ? '#4caf50' : '#f44336'};">
                            ₱${pl.netIncome.amount.toFixed(2)}
                        </td>
                    </tr>
                    <tr style="background:${pl.netIncome.amount >= 0 ? '#e8f5e9' : '#ffebee'};">
                        <td style="padding:8px 10px 8px 30px;">Net Margin</td>
                        <td style="padding:8px 10px;text-align:right;font-weight:bold;">${pl.netIncome.margin.toFixed(2)}%</td>
                    </tr>
                    <tr style="background:${pl.netIncome.amount >= 0 ? '#e8f5e9' : '#ffebee'};">
                        <td style="padding:8px 10px 8px 30px;">Per Repair</td>
                        <td style="padding:8px 10px;text-align:right;">₱${pl.netIncome.perRepair.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        `;
        
        utils.showLoading(false);
    }, 300);
}

function exportPLStatementCSV() {
    const startInput = document.getElementById('plStartDate');
    const endInput = document.getElementById('plEndDate');
    
    if (!startInput || !endInput) return;
    
    const startDate = new Date(startInput.value + 'T00:00:00');
    const endDate = new Date(endInput.value + 'T23:59:59');
    
    const pl = window.generateProfitLossStatement(startDate, endDate);
    
    if (!pl) {
        alert('No data to export');
        return;
    }
    
    const exportData = [];
    
    exportData.push({ 'PROFIT & LOSS STATEMENT': '', 'Period': `${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}` });
    exportData.push({});
    exportData.push({ 'REVENUE': '' });
    exportData.push({ '  Total Revenue': '', 'Amount': pl.revenue.totalRevenue });
    exportData.push({});
    exportData.push({ 'COST OF GOODS SOLD': '' });
    exportData.push({ '  Parts Cost': '', 'Amount': pl.cogs.partsCost });
    exportData.push({ '  Commission': '', 'Amount': pl.cogs.commission });
    exportData.push({ '  Total COGS': '', 'Amount': pl.cogs.total });
    exportData.push({});
    exportData.push({ 'GROSS PROFIT': '', 'Amount': pl.grossProfit.amount });
    exportData.push({ '  Gross Margin': '', 'Amount': `${pl.grossProfit.margin.toFixed(2)}%` });
    exportData.push({});
    exportData.push({ 'OPERATING EXPENSES': '' });
    Object.entries(pl.operatingExpenses.byCategory).forEach(([cat, amt]) => {
        exportData.push({ [`  ${cat}`]: '', 'Amount': amt });
    });
    exportData.push({ '  Total Operating Expenses': '', 'Amount': pl.operatingExpenses.total });
    exportData.push({});
    exportData.push({ 'NET INCOME': '', 'Amount': pl.netIncome.amount });
    exportData.push({ '  Net Margin': '', 'Amount': `${pl.netIncome.margin.toFixed(2)}%` });
    
    const filename = `PL_Statement_${startInput.value}_to_${endInput.value}`;
    exportToCSV(exportData, filename);
    
    if (window.utils && window.utils.showToast) {
        window.utils.showToast('✅ P&L statement exported', 'success', 2000);
    }
}

function generateQuarterlySummary() {
    const year = parseInt(document.getElementById('quarterYear').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    const container = document.getElementById('quarterlySummaryContent');
    
    if (!container) return;
    
    utils.showLoading(true);
    
    setTimeout(() => {
        const summary = window.getQuarterlySummary(year, quarter);
        
        if (!summary || !summary.summary) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No data available</p>';
            utils.showLoading(false);
            return;
        }
        
        const pl = summary.summary;
        
        container.innerHTML = `
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-top:15px;">
                <h4 style="margin:0 0 15px;">${summary.quarterName} Summary</h4>
                
                <!-- Summary Cards -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
                    <div style="background:#e3f2fd;padding:15px;border-radius:8px;">
                        <div style="color:#666;font-size:12px;margin-bottom:5px;">Total Revenue</div>
                        <div style="font-size:24px;font-weight:bold;color:#2196f3;">₱${pl.revenue.totalRevenue.toFixed(2)}</div>
                        <div style="color:#999;font-size:11px;">${pl.revenue.repairCount} repairs</div>
                    </div>
                    <div style="background:#f3e5f5;padding:15px;border-radius:8px;">
                        <div style="color:#666;font-size:12px;margin-bottom:5px;">Gross Profit</div>
                        <div style="font-size:24px;font-weight:bold;color:#9c27b0;">₱${pl.grossProfit.amount.toFixed(2)}</div>
                        <div style="color:#999;font-size:11px;">${pl.grossProfit.margin.toFixed(1)}% margin</div>
                    </div>
                    <div style="background:${pl.netIncome.amount >= 0 ? '#e8f5e9' : '#ffebee'};padding:15px;border-radius:8px;">
                        <div style="color:#666;font-size:12px;margin-bottom:5px;">Net Income</div>
                        <div style="font-size:24px;font-weight:bold;color:${pl.netIncome.amount >= 0 ? '#4caf50' : '#f44336'};">₱${pl.netIncome.amount.toFixed(2)}</div>
                        <div style="color:#999;font-size:11px;">${pl.netIncome.margin.toFixed(1)}% margin</div>
                    </div>
                </div>
                
                <!-- Monthly Breakdown -->
                <h5 style="margin:20px 0 10px;">Monthly Breakdown</h5>
                <div style="overflow-x:auto;">
                    <table class="repairs-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Revenue</th>
                                <th>COGS</th>
                                <th>Overhead</th>
                                <th>Net Income</th>
                                <th>Margin %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summary.monthlyBreakdown.map(m => `
                                <tr>
                                    <td><strong>${m.month}</strong></td>
                                    <td>₱${m.data.revenue.totalRevenue.toFixed(2)}</td>
                                    <td>₱${m.data.cogs.total.toFixed(2)}</td>
                                    <td>₱${m.data.operatingExpenses.total.toFixed(2)}</td>
                                    <td style="color:${m.data.netIncome.amount >= 0 ? '#4caf50' : '#f44336'};font-weight:bold;">
                                        ₱${m.data.netIncome.amount.toFixed(2)}
                                    </td>
                                    <td>${m.data.netIncome.margin.toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        utils.showLoading(false);
    }, 300);
}

function exportQuarterlySummaryCSV() {
    const year = parseInt(document.getElementById('quarterYear').value);
    const quarter = parseInt(document.getElementById('quarter').value);
    
    window.exportQuarterlyReport(year, quarter);
    
    if (window.utils && window.utils.showToast) {
        window.utils.showToast('✅ Quarterly summary exported', 'success', 2000);
    }
}

function exportAnnualPLStatementCSV() {
    const year = parseInt(document.getElementById('annualYear').value);
    
    window.exportAnnualPLStatement(year);
    
    if (window.utils && window.utils.showToast) {
        window.utils.showToast('✅ Annual P&L statement exported', 'success', 2000);
    }
}

// Export financial reports functions
window.buildFinancialReportsTab = buildFinancialReportsTab;
window.generatePLStatement = generatePLStatement;
window.exportPLStatementCSV = exportPLStatementCSV;
window.generateQuarterlySummary = generateQuarterlySummary;
window.exportQuarterlySummaryCSV = exportQuarterlySummaryCSV;
window.exportAnnualPLStatementCSV = exportAnnualPLStatementCSV;

// Export checkbox functions
window.toggleAllDeviceCheckboxes = toggleAllDeviceCheckboxes;
window.updateBulkDeleteButton = updateBulkDeleteButton;
window.executeBulkDelete = executeBulkDelete;

// Export repair list interaction functions
window.toggleRepairDetails = toggleRepairDetails;

// Export cleanup and export functions
window.fixDataIssues = fixDataIssues;
window.showCleanupHistory = showCleanupHistory;
window.undoCleanupById = undoCleanupById;
window.updateExportSchedule = updateExportSchedule;

console.log('✅ ui.js loaded');
