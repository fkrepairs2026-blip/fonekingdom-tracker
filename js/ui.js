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
            { id: 'backjob-reception', label: 'Back Job Reception', icon: '🔄', build: buildBackJobReceptionTab },
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
        // Operations (only for manager, not admin)
        if (role === 'manager') {
            sections.operations.tabs.push(
                { id: 'receive', label: 'Receive Device', icon: '➕', build: buildReceiveDeviceTab },
                { id: 'backjob-reception', label: 'Back Job Reception', icon: '🔄', build: buildBackJobReceptionTab },
                { id: 'approve-parts-orders', label: 'Approve Orders', icon: '📦', build: buildApprovePartsOrdersTab },
                { id: 'received', label: 'Received Devices', icon: '📥', build: buildReceivedDevicesPage },
                { id: 'inprogress', label: 'In Progress', icon: '🔧', build: buildInProgressPage },
                { id: 'forrelease', label: 'For Release', icon: '📦', build: buildForReleasePage },
                { id: 'rto', label: 'RTO Devices', icon: '↩️', build: buildRTODevicesTab },
                { id: 'claimed', label: 'Claimed Units', icon: '✅', build: buildClaimedUnitsPage }
            );
            // Payments (manager only)
            sections.payments.tabs.push(
                { id: 'pending', label: 'Pending Verification', icon: '⏳', build: buildPendingTab },
                { id: 'cash', label: 'Cash Count', icon: '💵', build: buildCashCountTab },
                { id: 'verify-remittance', label: 'Verify Remittance', icon: '✅', build: buildRemittanceVerificationTab }
            );
        }
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
                { id: 'staff-overview', label: 'Staff Overview', icon: '👥', build: buildStaffOverviewTab },
                { id: 'verify-remittance', label: 'Verify Remittance', icon: '✅', build: buildRemittanceVerificationTab },
                { id: 'approve-parts-orders', label: 'Approve Orders', icon: '📦', build: buildApprovePartsOrdersTab },
                { id: 'photo-gallery', label: 'Photo Gallery', icon: '📸', build: buildPhotoGalleryTab },
                { id: 'users', label: 'Users', icon: '👤', build: buildUsersTab },
                { id: 'refund-requests', label: 'Refund Requests', icon: '🔄', build: buildRefundRequestsTab },
                { id: 'refunded-devices', label: 'Refunded Devices', icon: '💸', build: buildRefundedDevicesTab },
                { id: 'extract-remittance', label: 'Extract Remittance Data', icon: '🔍', build: buildExtractRemittanceTab },
                { id: 'usage-analytics', label: 'Usage Analytics', icon: '📈', build: buildUsageAnalyticsTab },
                { id: 'admin-tools', label: 'Admin Tools', icon: '🔧', build: buildAdminToolsTab },
                { id: 'admin-logs', label: 'Activity Logs', icon: '📋', build: buildActivityLogsTab },
                { id: 'personal-finance', label: 'My Finances', icon: '💰', build: buildPersonalFinanceTab }
            );
        }
        // Refund Requests for Manager and Cashier (under Admin section)
        if (role === 'manager' || role === 'cashier') {
            sections.admin.tabs.push(
                { id: 'refund-requests', label: 'Refund Requests', icon: '🔄', build: buildRefundRequestsTab },
                { id: 'refunded-devices', label: 'Refunded Devices', icon: '💸', build: buildRefundedDevicesTab },
                { id: 'personal-finance', label: 'My Finances', icon: '💰', build: buildPersonalFinanceTab }
            );
        }
    }
    else if (role === 'technician') {
        // Operations
        sections.operations.tabs.push(
            { id: 'receive', label: 'Receive Device', icon: '➕', build: buildReceiveDeviceTab },
            { id: 'backjob-reception', label: 'Back Job Reception', icon: '🔄', build: buildBackJobReceptionTab },
            { id: 'my', label: 'My Jobs', icon: '🔧', build: buildMyRepairsTab },
            { id: 'mycompleted', label: 'My Completed', icon: '✅', build: buildMyCompletedDevicesTab },
            { id: 'myclaimed', label: 'My Claimed', icon: '🎉', build: buildMyClaimedDevicesTab },
            { id: 'parts-orders', label: 'Parts Orders', icon: '📦', build: buildPartsOrdersTab },
            { id: 'received', label: 'Received Devices', icon: '📥', build: buildReceivedDevicesPage },
            { id: 'inprogress', label: 'In Progress', icon: '🔧', build: buildInProgressPage },
            { id: 'forrelease', label: 'For Release', icon: '📦', build: buildForReleasePage },
            { id: 'rto', label: 'RTO Devices', icon: '↩️', build: buildRTODevicesTab },
            { id: 'claimed', label: 'Claimed Units', icon: '📋', build: buildClaimedUnitsPage }
        );
        // Payments
        sections.payments.tabs.push(
            { id: 'remittance', label: 'Daily Remittance', icon: '💸', build: buildDailyRemittanceTab },
            { id: 'refunded-devices', label: 'Refunded Devices', icon: '💸', build: buildRefundedDevicesTab }
        );
        // Inventory & Reports
        sections.inventory.tabs.push(
            { id: 'inventory', label: 'Inventory', icon: '📦', build: buildInventoryTab },
            { id: 'historical-review', label: 'Historical Review', icon: '📅', build: buildHistoricalReviewTab },
            { id: 'requests', label: 'My Requests', icon: '📝', build: buildMyRequestsTab },
            { id: 'personal-finance', label: 'My Finances', icon: '💰', build: buildPersonalFinanceTab }
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

    // Create content containers but only build first tab (lazy loading)
    availableTabs.forEach((tab, index) => {
        const contentEl = document.createElement('div');
        contentEl.id = `${tab.id}Tab`;
        contentEl.className = 'tab-content' + (index === 0 ? ' active' : '');
        contentEl.dataset.tabId = tab.id;
        contentEl.dataset.built = 'false'; // Track if tab has been built
        contentsContainer.appendChild(contentEl);

        // Only build first tab on initial load
        if (index === 0) {
            console.log('📄 Building initial tab:', tab.label);
            tab.build(contentEl);
            contentEl.dataset.built = 'true';
        }
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
            { id: 'expense', icon: '💰', label: 'Expense' },
            { id: 'receive', icon: '➕', label: 'Receive' },
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'search', icon: '🔍', label: 'Search' },
            { id: 'remittance', icon: '💸', label: 'Remittance' }
        );
    } else if (role === 'admin') {
        quickTabs.push(
            { id: 'staff-overview', icon: '👥', label: 'Staff' },
            { id: 'profit-dashboard', icon: '💰', label: 'Profit' },
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'overhead-expenses', icon: '💸', label: 'Overhead' },
            { id: 'verify-remittance', icon: '✅', label: 'Verify' }
        );
    } else if (role === 'manager') {
        quickTabs.push(
            { id: 'analytics', icon: '📈', label: 'Profit' },
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'verify-remittance', icon: '✅', label: 'Verify' },
            { id: 'inventory', icon: '📦', label: 'Inventory' }
        );
    }

    mobileNav.innerHTML = quickTabs.map(tab => {
        // Special handlers for action buttons (not tabs)
        let clickHandler = '';
        if (tab.id === 'expense') {
            clickHandler = 'openQuickExpenseModal()';
        } else if (tab.id === 'search') {
            clickHandler = 'openQuickSearchModal()';
        } else {
            clickHandler = `switchTab('${tab.id}')`;
        }

        return `
            <div class="mobile-nav-item ${tab.id === activeTab ? 'active' : ''}"
                 id="mobile-tab-${tab.id}"
                 onclick="${clickHandler}">
                <span class="mobile-nav-icon">${tab.icon}</span>
                <span class="mobile-nav-label">${tab.label}</span>
            </div>
        `;
    }).join('');
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

    // Store or clear date filter for specific tabs
    if (tabId === 'myclaimed' || tabId === 'mycompleted') {
        window.currentDateFilter = dateFilter || null;  // Explicitly clear if no filter provided
    } else {
        // Clear date filter when switching to other tabs
        window.currentDateFilter = null;
    }

    // Clear expanded repair state to prevent context leakage between tabs
    window.expandedRepairId = null;

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
    if (mobileTab) mobileTab.classList.add('active');
    if (sidebarItem) sidebarItem.classList.add('active');

    // Lazy load tab content if not already built
    if (content) {
        content.classList.add('active');

        if (content.dataset.built === 'false') {
            const tabDefinition = availableTabs.find(t => t.id === tabId);
            if (tabDefinition) {
                console.log('📄 Lazy loading tab:', tabDefinition.label);
                tabDefinition.build(content);
                content.dataset.built = 'true';
            }
        }
    }

    activeTab = tabId;

    // Rebuild Staff Overview tab on switch to get fresh attendance data
    if (tabId === 'staff-overview' && content) {
        console.log('🔄 Refreshing Staff Overview with latest attendance data');
        buildStaffOverviewTab(content);
    }

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
            // Ensure payments is an array (Firebase may return object)
            const payments = Array.isArray(repair.payments) ? repair.payments : Object.values(repair.payments);
            payments.forEach(payment => {
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
                 class="gradient-header-primary" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
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
                    <label>Initial Observations/Recommendations (Optional)</label>
                    <textarea id="initialAssessment" name="initialAssessment" rows="3" placeholder="Document any initial observations, visible damage, or repair recommendations..."></textarea>
                    <small style="color:#666;">📋 Professional assessment at reception - helps assigned technician understand context</small>
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
                
                <div class="alert-card-warning">
                    <p style="margin:0;font-size:14px;">
                        🔄 <strong>Is this a returning repair for the same issue?</strong> 
                        Use the <a href="#" onclick="buildTab('backjob-reception'); return false;" style="color:#ff6f00;text-decoration:underline;font-weight:bold;">Back Job Reception</a> tab instead.
                    </p>
                </div>
                
                <div class="alert-info" style="margin:15px 0;">
                    <p style="margin:0;"><strong>ℹ️ Workflow:</strong></p>
                    <ol style="margin:5px 0 0 20px;font-size:14px;">
                        <li><strong>With Pricing:</strong> Device marked as approved → Tech accepts → Starts repair</li>
                        <li><strong>Without Pricing:</strong> Device received → Tech/Owner creates diagnosis → Customer approves → Tech accepts</li>
                    </ol>
                </div>
                
                <!-- Retroactive Completion Mode (Tech/Admin/Manager only) -->
                <div id="retroactiveSection" style="display:${window.currentUserData && ['technician', 'admin', 'manager'].includes(window.currentUserData.role) ? 'block' : 'none'};background:#fff3e0;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #ff9800;">
                    <h4 style="margin:0 0 12px 0;color:#e65100;">⚡ Retroactive Completion Mode <span style="font-size:12px;color:#666;font-weight:normal;">(Device already repaired)</span></h4>
                    
                    <div style="margin-bottom:15px;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;border:2px solid #4caf50;">
                            <input type="radio" name="completionMode" value="normal" checked onchange="toggleCompletionFields()">
                            <span><strong>✅ Normal Reception</strong> - Device goes through repair workflow</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;">
                            <input type="radio" name="completionMode" value="pre-completed" onchange="toggleCompletionFields()">
                            <span><strong>📦 Pre-completed (Waiting to be Claimed)</strong> - Job done, ready for customer pickup</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <label style="display:flex;align-items:center;gap:10px;padding:10px;background:white;border-radius:5px;cursor:pointer;">
                            <input type="radio" name="completionMode" value="completed" onchange="toggleCompletionFields()">
                            <span><strong>🎯 Completed (Released & Paid)</strong> - Device already given to customer (auto-finalize if fully paid)</span>
                        </label>
                    </div>
                    
                    <!-- Simplified Completion Fields -->
                    <div id="completedFields" style="display:none;background:#e8f5e9;padding:15px;border-radius:5px;margin-top:10px;border-left:3px solid #4caf50;">
                        <h5 style="margin:0 0 12px 0;color:#2e7d32;">Completion Settings</h5>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label><strong style="color:#d32f2f;">*</strong> Completion Date & Time</label>
                                <input type="datetime-local" id="completionDate" name="completionDate">
                                <small style="color:#666;">When repair was actually completed</small>
                            </div>
                            <div class="form-group">
                                <label><strong style="color:#d32f2f;">*</strong> Release Date & Time</label>
                                <input type="datetime-local" id="releaseDate" name="releaseDate">
                                <small style="color:#666;">When device was given to customer</small>
                            </div>
                        </div>
                        
                        ${window.currentUserData && window.currentUserData.role === 'admin' ? `
                        <div class="form-group">
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="adminDateOverride" name="adminDateOverride">
                                <span>🔓 Admin Override - Allow dates before 2025</span>
                            </label>
                        </div>
                        ` : ''}
                        
                        <!-- Warranty field - only shown for "completed" mode -->
                        <div id="warrantyField" style="display:none;">
                            <div class="form-group">
                                <label>Warranty Period (Days)</label>
                                <input type="number" id="warrantyDays" name="warrantyDays" value="7" min="0" max="365">
                                <small style="color:#666;">Default: 7 days for hardware repairs, 0 for software</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Verification Method</label>
                            <select id="verificationMethod" name="verificationMethod">
                                <option value="">-- Select --</option>
                                <option value="walk-in">Walk-in Pickup</option>
                                <option value="with-slip">With Service Slip</option>
                                <option value="customer-address">Customer Address</option>
                                <option value="verified-photo">Verified by Photo</option>
                            </select>
                        </div>
                        
                        <div id="slipUploadGroup" style="display:none;">
                            <div class="form-group">
                                <label>Service Slip Photo</label>
                                <input type="file" id="serviceSlipPhoto" accept="image/*">
                                <small style="color:#666;">Optional: Upload service slip image</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Release Notes</label>
                            <textarea id="releaseNotes" name="releaseNotes" rows="3" placeholder="Any notes about the release..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="collectPayment" name="collectPayment" onchange="togglePaymentFields()">
                                <span>💰 Collect Payment Now</span>
                            </label>
                        </div>
                        
                        <div id="paymentFields" style="display:none;background:#fff;padding:10px;border-radius:5px;margin-top:10px;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Payment Amount (₱)</label>
                                    <input type="number" id="paymentAmount" name="paymentAmount" min="0.01" step="0.01">
                                    <small style="color:#666;">Enter payment amount</small>
                                </div>
                                <div class="form-group">
                                    <label><strong style="color:#d32f2f;">*</strong> Payment Method</label>
                                    <select id="paymentMethod" name="paymentMethod" onchange="toggleGCashRef()">
                                        <option value="">-- Select Method --</option>
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="gcashRefGroup" style="display:none;">
                                <div class="form-group">
                                    <label>GCash Reference Number</label>
                                    <input type="text" id="gcashRef" name="gcashRef" maxlength="13">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Payment Notes</label>
                                <textarea id="paymentNotes" name="paymentNotes" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:#ffebee;padding:10px;border-radius:5px;margin-top:10px;">
                        <small style="color:#c62828;"><strong>⚠️ Warning:</strong> Retroactive mode bypasses normal workflow. Only use when device was already repaired before this intake. Pricing is required.</small>
                    </div>
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
 * Build Back Job Reception Tab
 * Search for completed repairs and mark them as back jobs
 */
function buildBackJobReceptionTab(container) {
    console.log('🔄 Building Back Job Reception tab');
    window.currentTabRefresh = () => buildBackJobReceptionTab(document.getElementById('backjobReceptionTab'));

    // Get all completed/claimed repairs from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleRepairs = window.allRepairs.filter(r =>
        (r.status === 'Claimed' || r.status === 'Completed') &&
        r.claimedAt &&
        new Date(r.claimedAt) >= ninetyDaysAgo &&
        !r.deleted
    ).sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    container.innerHTML = `
        <div class="card">
            <h3>🔄 Back Job Reception</h3>
            <p style="color:#666;margin-bottom:20px;">Search for original repair to mark device as returning back job</p>
            
            <div class="alert-card-warning">
                <p style="margin:0;font-size:14px;">
                    <strong>ℹ️ Instructions:</strong> Use this tab when a customer returns with the same issue. 
                    Search for the original repair below, then click "Mark as Back Job" to receive the device.
                </p>
            </div>

            <!-- Search Bar -->
            <div class="form-group" style="margin-bottom:25px;">
                <label>🔍 Search Original Repair</label>
                <input type="text" 
                       id="backJobSearch" 
                       class="input" 
                       placeholder="Search by phone number, customer name, or device model..."
                       onkeyup="filterBackJobSearchResults()"
                       style="font-size:16px;padding:12px;">
                <small style="color:#666;display:block;margin-top:8px;">
                    Shows completed/claimed repairs from last 90 days only
                </small>
            </div>

            <!-- Search Results -->
            <div id="backJobSearchResults">
                ${eligibleRepairs.length === 0 ? `
                    <div style="text-align:center;padding:40px;color:#999;">
                        <h2 style="font-size:48px;margin:0;">📭</h2>
                        <p>No eligible repairs found</p>
                        <p style="font-size:14px;">Only repairs completed in last 90 days are shown</p>
                    </div>
                ` : `
                    <div id="backJobResultsList">
                        <p style="color:#666;font-size:14px;margin-bottom:15px;">
                            Showing ${eligibleRepairs.length} eligible repair(s). Use search box to filter.
                        </p>
                        ${eligibleRepairs.slice(0, 20).map(r => {
        const daysAgo = Math.floor((Date.now() - new Date(r.claimedAt)) / (1000 * 60 * 60 * 24));
        const hasBackJob = r.hasBackJobId;
        const warrantyActive = r.warrantyEndDate && new Date(r.warrantyEndDate) > new Date();

        return `
                                <div class="repair-card" style="border-left-color:${hasBackJob ? '#f44336' : warrantyActive ? '#4caf50' : '#9e9e9e'};">
                                    <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                                        <div style="flex:1;">
                                            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
                                                <h4 style="margin:0;">${r.customerName}</h4>
                                                ${hasBackJob ? '<span class="status-badge status-badge-danger">⚠️ Has Back Job</span>' : ''}
                                                ${warrantyActive ? '<span class="status-badge status-badge-success">🛡️ Warranty Active</span>' : ''}
                                            </div>
                                            <p style="font-size:14px;margin:5px 0;">
                                                📱 ${r.brand} ${r.model}<br>
                                                📞 ${r.contactNumber}<br>
                                                🔧 <strong>Issue:</strong> ${r.problemType || 'N/A'}<br>
                                                💼 <strong>Repair:</strong> ${r.repairType || 'N/A'}<br>
                                                👤 <strong>Tech:</strong> ${r.acceptedByName || 'N/A'}<br>
                                                📅 <strong>Completed:</strong> ${utils.formatDate(r.claimedAt)} (${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago)
                                            </p>
                                            ${r.warrantyPeriodDays ? `
                                                <p style="font-size:13px;color:#666;margin-top:5px;">
                                                    🛡️ Warranty: ${r.warrantyPeriodDays} days 
                                                    ${warrantyActive ?
                    `(expires ${utils.formatDate(r.warrantyEndDate)})` :
                    `(expired ${utils.formatDate(r.warrantyEndDate)})`}
                                                </p>
                                            ` : ''}
                                        </div>
                                        <div style="text-align:right;">
                                            ${daysAgo > 90 ? `
                                                <div style="background:#f44336;color:white;padding:8px 12px;border-radius:5px;font-size:13px;margin-bottom:10px;">
                                                    ❌ Outside 90-day limit
                                                </div>
                                            ` : hasBackJob ? `
                                                <button onclick="viewRepairDetails('${r.id}')" 
                                                        class="btn btn-secondary" 
                                                        style="padding:8px 15px;font-size:13px;">
                                                    📋 View Original
                                                </button>
                                                <button onclick="if('${r.hasBackJobId}') viewRepairDetails('${r.hasBackJobId}')" 
                                                        class="btn btn-primary" 
                                                        style="padding:8px 15px;font-size:13px;margin-top:5px;">
                                                    🔄 View Back Job
                                                </button>
                                            ` : `
                                                <button onclick="openMarkAsBackJobModal('${r.id}')" 
                                                        class="btn btn-primary" 
                                                        style="padding:8px 15px;font-size:13px;">
                                                    🔄 Mark as Back Job
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                </div>
                            `;
    }).join('')}
                        ${eligibleRepairs.length > 20 ? `
                            <p style="text-align:center;color:#666;margin-top:20px;">
                                Showing first 20 results. Use search to filter more.
                            </p>
                        ` : ''}
                    </div>
                `}
            </div>
        </div>
    `;
}

/**
 * Filter back job search results based on search input
 */
function filterBackJobSearchResults() {
    const searchTerm = document.getElementById('backJobSearch').value.toLowerCase().trim();

    if (!searchTerm) {
        // Reset to show all
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        return;
    }

    // Get eligible repairs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleRepairs = window.allRepairs.filter(r =>
        (r.status === 'Claimed' || r.status === 'Completed') &&
        r.claimedAt &&
        new Date(r.claimedAt) >= ninetyDaysAgo &&
        !r.deleted
    );

    // Filter by search term
    const filteredRepairs = eligibleRepairs.filter(r =>
        r.customerName?.toLowerCase().includes(searchTerm) ||
        r.contactNumber?.includes(searchTerm) ||
        r.brand?.toLowerCase().includes(searchTerm) ||
        r.model?.toLowerCase().includes(searchTerm) ||
        r.id?.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    // Update results display
    const resultsDiv = document.getElementById('backJobResultsList');
    if (!resultsDiv) return;

    if (filteredRepairs.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <h2 style="font-size:48px;margin:0;">🔍</h2>
                <p>No repairs found matching "${searchTerm}"</p>
                <p style="font-size:14px;">Try searching by phone number or customer name</p>
            </div>
        `;
        return;
    }

    resultsDiv.innerHTML = `
        <p style="color:#666;font-size:14px;margin-bottom:15px;">
            Found ${filteredRepairs.length} repair(s) matching "${searchTerm}"
        </p>
        ${filteredRepairs.slice(0, 20).map(r => {
        const daysAgo = Math.floor((Date.now() - new Date(r.claimedAt)) / (1000 * 60 * 60 * 24));
        const hasBackJob = r.hasBackJobId;
        const warrantyActive = r.warrantyEndDate && new Date(r.warrantyEndDate) > new Date();

        return `
                <div class="repair-card" style="border-left-color:${hasBackJob ? '#f44336' : warrantyActive ? '#4caf50' : '#9e9e9e'};">
                    <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                        <div style="flex:1;">
                            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
                                <h4 style="margin:0;">${r.customerName}</h4>
                                ${hasBackJob ? '<span class="status-badge" style="background:#f44336;color:white;">⚠️ Has Back Job</span>' : ''}
                                ${warrantyActive ? '<span class="status-badge" style="background:#4caf50;color:white;">🛡️ Warranty Active</span>' : ''}
                            </div>
                            <p style="font-size:14px;margin:5px 0;">
                                📱 ${r.brand} ${r.model}<br>
                                📞 ${r.contactNumber}<br>
                                🔧 <strong>Issue:</strong> ${r.problemType || 'N/A'}<br>
                                💼 <strong>Repair:</strong> ${r.repairType || 'N/A'}<br>
                                👤 <strong>Tech:</strong> ${r.acceptedByName || 'N/A'}<br>
                                📅 <strong>Completed:</strong> ${utils.formatDate(r.claimedAt)} (${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago)
                            </p>
                            ${r.warrantyPeriodDays ? `
                                <p style="font-size:13px;color:#666;margin-top:5px;">
                                    🛡️ Warranty: ${r.warrantyPeriodDays} days 
                                    ${warrantyActive ?
                    `(expires ${utils.formatDate(r.warrantyEndDate)})` :
                    `(expired ${utils.formatDate(r.warrantyEndDate)})`}
                                </p>
                            ` : ''}
                        </div>
                        <div style="text-align:right;">
                            ${daysAgo > 90 ? `
                                <div style="background:#f44336;color:white;padding:8px 12px;border-radius:5px;font-size:13px;margin-bottom:10px;">
                                    ❌ Outside 90-day limit
                                </div>
                            ` : hasBackJob ? `
                                <button onclick="viewRepairDetails('${r.id}')" 
                                        class="btn btn-secondary" 
                                        style="padding:8px 15px;font-size:13px;">
                                    📋 View Original
                                </button>
                                <button onclick="if('${r.hasBackJobId}') viewRepairDetails('${r.hasBackJobId}')" 
                                        class="btn btn-primary" 
                                        style="padding:8px 15px;font-size:13px;margin-top:5px;">
                                    🔄 View Back Job
                                </button>
                            ` : `
                                <button onclick="openMarkAsBackJobModal('${r.id}')" 
                                        class="btn btn-primary" 
                                        style="padding:8px 15px;font-size:13px;">
                                    🔄 Mark as Back Job
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
    }).join('')}
        ${filteredRepairs.length > 20 ? `
            <p style="text-align:center;color:#666;margin-top:20px;">
                Showing first 20 results. Refine your search for better results.
            </p>
        ` : ''}
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

    // Load pending refund acknowledgments (for technicians)
    const pendingAcknowledgments = window.refunds ?
        window.refunds.filter(r =>
            (r.status === 'approved_pending_tech' || (r.status === 'approved' && r.commissionAffected && !r.acknowledgedByTech)) &&
            r.technicianId === window.currentUser.uid
        ) : [];

    console.log('📊 My Requests breakdown:', {
        myRefunds: myRefundRequests.length,
        pendingAcks: pendingAcknowledgments.length,
        myModRequests: myModRequests.length,
        allRefunds: window.refunds.length,
        myRefundStatuses: myRefundRequests.map(r => ({ id: r.id, status: r.status })),
        pendingAckDetails: pendingAcknowledgments.map(r => ({ id: r.id, status: r.status, techId: r.technicianId, currentUserId: window.currentUser.uid }))
    });

    const totalRequests = myModRequests.length + myRefundRequests.length + pendingAcknowledgments.length;

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
                ${pendingAcknowledgments.length > 0 ? `
                    <h4 style="margin-top:20px;color:#ff9800;display:flex;align-items:center;gap:10px;">
                        ⚠️ Refund Acknowledgments Required (${pendingAcknowledgments.length})
                        <span style="background:#ff9800;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:normal;">ACTION NEEDED</span>
                    </h4>
                    <p style="color:#666;font-size:14px;margin-bottom:15px;">These refunds have been approved but require your acknowledgment before commission is deducted.</p>
                    ${pendingAcknowledgments.sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt)).map(refund => {
        const repair = window.allRepairs.find(r => r.id === refund.repairId);
        return `
                        <div class="alert-card-warning" style="box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                            <div style="display:flex;justify-content:space-between;margin-bottom:10px;align-items:center;">
                                <strong style="color:#e65100;">⚠️ Refund Approved - Commission Reversal</strong>
                                <span style="background:#ff9800;color:white;padding:4px 12px;border-radius:3px;font-size:12px;font-weight:bold;">
                                    REQUIRES ACKNOWLEDGMENT
                                </span>
                            </div>
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:10px;">
                                <div style="font-size:14px;color:#666;margin-bottom:8px;">
                                    <div><strong>Customer:</strong> ${repair ? repair.customerName : 'N/A'}</div>
                                    <div><strong>Device:</strong> ${repair ? `${repair.brand} ${repair.model}` : 'N/A'}</div>
                                    <div><strong>Refund Amount:</strong> ₱${refund.refundAmount.toFixed(2)}</div>
                                    <div style="color:#d32f2f;font-weight:bold;"><strong>Commission to Deduct:</strong> -₱${refund.commissionToReverse.toFixed(2)}</div>
                                    <div><strong>Reason:</strong> ${refund.refundReason.replace('_', ' ').toUpperCase()}</div>
                                    <div><strong>Explanation:</strong> ${refund.refundReasonDetails}</div>
                                    <div><strong>Approved by:</strong> ${refund.approvedBy} on ${utils.formatDateTime(refund.approvedAt)}</div>
                                </div>
                            </div>
                            <div style="background:#fff8e1;padding:10px;border-radius:5px;margin-bottom:10px;border-left:3px solid #ffc107;">
                                <p style="margin:0;font-size:13px;color:#f57c00;">
                                    <strong>⚠️ Action Required:</strong> Please review and acknowledge this refund. 
                                    The commission of ₱${refund.commissionToReverse.toFixed(2)} will be deducted from your daily remittance once acknowledged.
                                </p>
                            </div>
                            <button onclick="if(confirm('This will deduct ₱${refund.commissionToReverse.toFixed(2)} from your commission. Continue?')) window.acknowledgeRefund('${refund.id}')" 
                                    style="background:#ff9800;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-weight:bold;">
                                ✅ Acknowledge and Accept Commission Deduction
                            </button>
                        </div>
                    `}).join('')}
                ` : ''}
                
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
                            ${refund.status !== 'pending_approval' && refund.status !== 'pending' ? `
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
 * Build Refund Requests Tab (Admin/Manager only)
 */
function buildRefundRequestsTab(container) {
    console.log('🔄 Building Refund Requests tab');
    window.currentTabRefresh = () => buildRefundRequestsTab(document.getElementById('refund-requestsTab'));

    const pendingRefunds = (window.refunds || []).filter(r => r.status === 'pending_approval' || r.status === 'pending');
    const awaitingTechRefunds = (window.refunds || []).filter(r => r.status === 'approved_pending_tech' || (r.status === 'approved' && r.commissionAffected && !r.acknowledgedByTech));
    const stuckRefunds = (window.refunds || []).filter(r => r.status === 'approved' && r.acknowledgedByTech);
    const completedRefunds = (window.refunds || []).filter(r => r.status === 'completed').slice(0, 20);
    const rejectedRefunds = (window.refunds || []).filter(r => r.status === 'rejected').slice(0, 10);
    const approvedRefunds = (window.refunds || []).filter(r => r.status === 'approved' && (!r.commissionAffected || r.acknowledgedByTech));
    const otherRefunds = (window.refunds || []).filter(r =>
        r.status !== 'pending_approval' &&
        r.status !== 'pending' &&
        r.status !== 'approved_pending_tech' &&
        r.status !== 'completed' &&
        r.status !== 'rejected' &&
        r.status !== 'approved'
    );

    console.log('📊 Refund breakdown:', {
        total: window.refunds.length,
        pending: pendingRefunds.length,
        awaitingTech: awaitingTechRefunds.length,
        stuck: stuckRefunds.length,
        approved: approvedRefunds.length,
        completed: completedRefunds.length,
        rejected: rejectedRefunds.length,
        other: otherRefunds.length,
        statuses: window.refunds.map(r => ({ id: r.id, status: r.status, customerName: window.allRepairs.find(rep => rep.id === r.repairId)?.customerName }))
    });

    container.innerHTML = `
        <div class="card">
            <h3>🔄 Refund Requests (${pendingRefunds.length} pending${awaitingTechRefunds.length > 0 ? `, ${awaitingTechRefunds.length} awaiting tech` : ''}${stuckRefunds.length > 0 ? `, ${stuckRefunds.length} need recovery` : ''})</h3>
            <p style="color:#666;margin-bottom:15px;">Review and approve/reject refund requests</p>
            
            ${pendingRefunds.length === 0 && completedRefunds.length === 0 && awaitingTechRefunds.length === 0 && stuckRefunds.length === 0 ? `
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
                                <div><strong>Requested by:</strong> ${refund.requestedBy}${refund.requestedByRole ? ` <span style="background:#667eea;color:white;padding:2px 6px;border-radius:3px;font-size:10px;text-transform:uppercase;">${refund.requestedByRole}</span>` : ''}</div>
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
                
                ${stuckRefunds.length > 0 ? `
                    <h4 style="margin-top:30px;color:#f44336;">⚠️ STUCK REFUNDS - NEED RECOVERY (${stuckRefunds.length})</h4>
                    <p style="color:#666;font-size:14px;margin-bottom:15px;">These refunds were acknowledged by tech but failed to complete. Click "Retry Processing" to complete them.</p>
                    ${stuckRefunds.map(refund => {
            const repair = window.allRepairs.find(r => r.id === refund.repairId);
            const usersArray = window.allUsers ? Object.values(window.allUsers) : [];
            const tech = repair ? usersArray.find(u => u.id === refund.technicianId) : null;
            return `
                        <div class="alert-card-danger">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <div>
                                    <strong style="color:#c62828;font-size:16px;">⚠️ Processing Failed</strong>
                                </div>
                                <span style="background:#f44336;color:white;padding:3px 10px;border-radius:3px;font-size:12px;font-weight:bold;">
                                    STUCK
                                </span>
                            </div>
                            
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:12px;">
                                <div style="font-size:14px;margin-bottom:8px;">
                                    <div><strong>Customer:</strong> ${repair ? repair.customerName : 'N/A'}</div>
                                    <div><strong>Device:</strong> ${repair ? `${repair.brand} ${repair.model}` : 'N/A'}</div>
                                    <div><strong>Refund Amount:</strong> ₱${refund.refundAmount.toFixed(2)}</div>
                                    <div style="color:#d32f2f;"><strong>Commission to Reverse:</strong> -₱${refund.commissionToReverse.toFixed(2)}</div>
                                    <div><strong>Technician:</strong> ${tech ? tech.displayName : refund.technicianName || 'N/A'}</div>
                                    <div><strong>Approved by:</strong> ${refund.approvedBy} on ${utils.formatDateTime(refund.approvedAt)}</div>
                                    <div><strong>Acknowledged by tech:</strong> ${utils.formatDateTime(refund.acknowledgedAt)}</div>
                                </div>
                            </div>
                            
                            <div style="background:#fff8e1;padding:10px;border-radius:5px;margin-bottom:10px;border-left:3px solid #ffc107;">
                                <p style="margin:0;font-size:13px;color:#f57c00;">
                                    ⚠️ <strong>Issue:</strong> Tech acknowledged but processing failed. Click button below to retry and complete the refund.
                                </p>
                            </div>
                            
                            <button onclick="if(confirm('Retry processing this refund? This will complete the refund and mark the payment as refunded.')) window.processRefund('${refund.id}')" 
                                    style="background:#4caf50;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-weight:bold;">
                                🔄 Retry Processing
                            </button>
                        </div>
                    `}).join('')}
                ` : ''}
                
                ${awaitingTechRefunds.length > 0 ? `
                    <h4 style="margin-top:30px;color:#ff9800;">⏳ AWAITING TECHNICIAN ACKNOWLEDGMENT (${awaitingTechRefunds.length})</h4>
                    <p style="color:#666;font-size:14px;margin-bottom:15px;">These refunds have been approved but are waiting for the technician to acknowledge the commission reversal.</p>
                    ${awaitingTechRefunds.map(refund => {
                const repair = window.allRepairs.find(r => r.id === refund.repairId);
                const usersArray = window.allUsers ? Object.values(window.allUsers) : [];
                const tech = repair ? usersArray.find(u => u.id === refund.technicianId) : null;
                return `
                        <div class="alert-card-warning">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <div>
                                    <strong style="color:#e65100;font-size:16px;">✅ Approved - Awaiting Tech</strong>
                                </div>
                                <span style="background:#ff9800;color:white;padding:3px 10px;border-radius:3px;font-size:12px;font-weight:bold;">
                                    PENDING TECH ACK
                                </span>
                            </div>
                            
                            <div style="background:white;padding:12px;border-radius:5px;margin-bottom:12px;">
                                <div style="font-size:14px;margin-bottom:8px;">
                                    <div><strong>Customer:</strong> ${repair ? repair.customerName : 'N/A'}</div>
                                    <div><strong>Device:</strong> ${repair ? `${repair.brand} ${repair.model}` : 'N/A'}</div>
                                    <div><strong>Refund Amount:</strong> ₱${refund.refundAmount.toFixed(2)}</div>
                                    <div style="color:#d32f2f;"><strong>Commission to Reverse:</strong> -₱${refund.commissionToReverse.toFixed(2)}</div>
                                    <div><strong>Technician:</strong> ${tech ? tech.displayName : refund.technicianName || 'N/A'}</div>
                                    <div><strong>Approved by:</strong> ${refund.approvedBy} on ${utils.formatDateTime(refund.approvedAt)}</div>
                                </div>
                            </div>
                            
                            <div style="background:#fff8e1;padding:10px;border-radius:5px;border-left:3px solid #ffc107;">
                                <p style="margin:0;font-size:13px;color:#f57c00;">
                                    ℹ️ Waiting for <strong>${tech ? tech.displayName : 'technician'}</strong> to acknowledge this refund before commission is deducted.
                                </p>
                            </div>
                        </div>
                    `}).join('')}
                ` : ''}
                
                ${completedRefunds.length > 0 ? `
                    <h4 style="margin-top:30px;">✅ Recent Completed Refunds (Last 20)</h4>
                    ${completedRefunds.map(refund => {
                    const repair = window.allRepairs.find(r => r.id === refund.repairId);
                    return `
                        <div class="alert-card-success">
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
                        <div class="alert-card-danger">
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

/**
 * Build Refunded Devices Tab (Admin/Manager/Cashier)
 */
function buildRefundedDevicesTab(container) {
    console.log('💸 Building Refunded Devices tab');
    window.currentTabRefresh = () => buildRefundedDevicesTab(document.getElementById('refunded-devicesTab'));

    // Show all refunds that are approved or completed (not pending/rejected)
    const completedRefunds = (window.refunds || []).filter(r =>
        r.status === 'completed' ||
        r.status === 'approved' ||
        r.status === 'approved_pending_tech'
    );

    // Sort by completion date or approval date (newest first)
    completedRefunds.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.approvedAt || a.createdAt);
        const dateB = new Date(b.completedAt || b.approvedAt || b.createdAt);
        return dateB - dateA;
    });

    // Calculate totals
    const totalRefundAmount = completedRefunds.reduce((sum, r) => sum + r.refundAmount, 0);
    const totalCommissionReversed = completedRefunds.reduce((sum, r) => sum + (r.commissionToReverse || 0), 0);

    container.innerHTML = `
        <div class="card">
            <h3>💸 Refunded Devices (${completedRefunds.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Complete history of all processed refunds</p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-bottom:20px;">
                <div class="alert-card-info">
                    <div style="font-size:14px;color:#666;">Total Refunds</div>
                    <div style="font-size:24px;font-weight:bold;color:#2196f3;">${completedRefunds.length}</div>
                </div>
                <div class="alert-card-warning">
                    <div style="font-size:14px;color:#666;">Total Amount Refunded</div>
                    <div style="font-size:24px;font-weight:bold;color:#ff9800;">₱${totalRefundAmount.toFixed(2)}</div>
                </div>
                <div class="alert-card-danger">
                    <div style="font-size:14px;color:#666;">Commission Reversed</div>
                    <div style="font-size:24px;font-weight:bold;color:#f44336;">₱${totalCommissionReversed.toFixed(2)}</div>
                </div>
            </div>

            <div style="margin-bottom:15px;">
                <input type="text" 
                       id="refundSearch" 
                       placeholder="🔍 Search by customer name, device, or reason..." 
                       onkeyup="filterRefundedDevices()" 
                       style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;font-size:14px;">
            </div>
            
            ${completedRefunds.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No refunded devices yet</p>
                </div>
            ` : `
                <div id="refundedDevicesList">
                    ${completedRefunds.map(refund => {
        const repair = window.allRepairs.find(r => r.id === refund.repairId);
        const usersArray = window.allUsers ? Object.values(window.allUsers) : [];
        const tech = repair ? usersArray.find(u => u.id === refund.technicianId) : null;

        // Determine status display
        const statusDisplay = refund.status === 'completed'
            ? { bg: '#4caf50', text: '✅ COMPLETED', date: refund.completedAt }
            : refund.status === 'approved_pending_tech'
                ? { bg: '#ff9800', text: '⏳ PENDING TECH ACK', date: refund.approvedAt }
                : { bg: '#2196f3', text: '✅ APPROVED', date: refund.approvedAt };

        return `
                            <div class="refund-item" data-search="${repair?.customerName} ${repair?.brand} ${repair?.model} ${refund.refundReason}">
                                <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-bottom:15px;border-left:4px solid ${statusDisplay.bg};">
                                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                        <div style="flex:1;">
                                            <div style="font-weight:bold;font-size:16px;color:#333;margin-bottom:5px;">
                                                ${repair ? repair.customerName : 'N/A'}
                                            </div>
                                            <div style="font-size:14px;color:#666;">
                                                ${repair ? `${repair.brand} ${repair.model}` : 'Device not found'}
                                            </div>
                                            <div style="font-size:13px;color:#999;margin-top:3px;">
                                                Repair ID: ${refund.repairId}
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="background:${statusDisplay.bg};color:white;padding:5px 12px;border-radius:5px;font-size:13px;font-weight:bold;margin-bottom:5px;">
                                                ${statusDisplay.text}
                                            </div>
                                            <div style="font-size:12px;color:#666;">
                                                ${statusDisplay.date ? utils.formatDate(statusDisplay.date) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="background:white;padding:12px;border-radius:5px;margin-bottom:10px;">
                                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;">
                                            <div>
                                                <strong>Refund Amount:</strong>
                                                <span style="color:#4caf50;font-weight:bold;">₱${refund.refundAmount.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <strong>Original Payment:</strong> ₱${refund.originalPaymentAmount.toFixed(2)}
                                            </div>
                                            <div>
                                                <strong>Type:</strong> ${refund.refundType === 'full' ? 'Full Refund' : 'Partial Refund'}
                                            </div>
                                            <div>
                                                <strong>Method:</strong> ${refund.refundMethod}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="alert-card-warning" style="padding:10px;border-left:3px solid #ff9800;">
                                        <div style="font-size:13px;">
                                            <strong>Reason:</strong> ${refund.refundReason.replace('_', ' ').toUpperCase()}
                                        </div>
                                        ${refund.refundReasonDetails ? `
                                            <div style="font-size:13px;color:#666;margin-top:5px;">
                                                ${refund.refundReasonDetails}
                                            </div>
                                        ` : ''}
                                    </div>

                                    ${refund.commissionAffected ? `
                                        <div class="alert-card-danger" style="padding:10px;border-left:3px solid #f44336;">
                                            <div style="font-size:13px;color:#d32f2f;">
                                                <strong>⚠️ Commission Impact:</strong> -₱${refund.commissionToReverse.toFixed(2)} deducted from ${tech ? tech.displayName : refund.technicianName || 'technician'}
                                            </div>
                                            ${refund.acknowledgedAt ? `
                                                <div style="font-size:12px;color:#666;margin-top:3px;">
                                                    Acknowledged: ${utils.formatDateTime(refund.acknowledgedAt)}
                                                </div>
                                            ` : ''}
                                        </div>
                                    ` : ''}

                                    <div style="font-size:12px;color:#999;padding-top:10px;border-top:1px solid #ddd;">
                                        <div><strong>Requested by:</strong> ${refund.requestedBy} (${refund.requestedByRole}) on ${utils.formatDateTime(refund.requestedAt)}</div>
                                        <div><strong>Approved by:</strong> ${refund.approvedBy} on ${utils.formatDateTime(refund.approvedAt)}</div>
                                        <div><strong>Completed by:</strong> ${refund.completedBy} on ${utils.formatDateTime(refund.completedAt)}</div>
                                        ${refund.adminNotes ? `<div><strong>Admin Notes:</strong> ${refund.adminNotes}</div>` : ''}
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

// Search filter for refunded devices
function filterRefundedDevices() {
    const searchTerm = document.getElementById('refundSearch')?.value.toLowerCase() || '';
    const items = document.querySelectorAll('.refund-item');

    items.forEach(item => {
        const searchData = item.getAttribute('data-search').toLowerCase();
        if (searchData.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function buildUnpaidTab(container) {
    console.log('💳 Building Unpaid tab');
    window.currentTabRefresh = () => buildUnpaidTab(document.getElementById('unpaidTab'));

    const unpaidRepairs = window.allRepairs.filter(r => {
        if (r.deleted) return false;
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
        !r.deleted && r.payments && r.payments.some(p => !p.verified)
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
        if (r.deleted) return false;
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

    // Filter out deleted repairs
    const repairs = (window.allRepairs || []).filter(r => !r.deleted);

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

        // Get enhanced status display with parts info
        const enhancedStatus = getEnhancedStatusDisplay(r);

        return `
            <div class="repair-card">
                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                <span class="status-badge status-${statusClass}">${enhancedStatus.statusText}${enhancedStatus.statusIcon}</span>
                ${r.isBackJob ? '<span class="status-badge status-badge-danger">🔄 Back Job</span>' : ''}
                ${!hidePaymentActions ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="badge-pill badge-pill-warning">🏪 Dealer</span>' : '<span class="badge-pill badge-pill-success">👤 Walk-in</span>'}
                
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
                
                ${(() => {
                const repairOrders = (window.allPartsOrders || []).filter(o => o.repairId === r.id);
                if (repairOrders.length === 0) return '';

                return `
                        <details style="margin-top:15px;background:#f3f4f6;padding:10px;border-radius:8px;border-left:4px solid #8b5cf6;">
                            <summary style="cursor:pointer;font-weight:600;color:#8b5cf6;">📦 Parts Order History (${repairOrders.length})</summary>
                            <div style="margin-top:10px;">
                                ${repairOrders.map(order => {
                    const statusColor =
                        order.status === 'pending' ? '#f59e0b' :
                            order.status === 'approved' ? '#3b82f6' :
                                order.status === 'ordered' ? '#8b5cf6' :
                                    order.status === 'received' ? '#10b981' : '#ef4444';

                    const varianceIcon = !order.priceVariancePercent ? '' :
                        Math.abs(order.priceVariancePercent) <= 10 ? '🟢' :
                            Math.abs(order.priceVariancePercent) <= 20 ? '⚠️' : '🔴';

                    return `
                                        <div style="background:white;padding:10px;border-radius:6px;margin-bottom:8px;border-left:3px solid ${statusColor};">
                                            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                                                <strong>${order.partName}</strong> (x${order.quantity})
                                                <span style="background:${statusColor};color:white;padding:2px 8px;border-radius:12px;font-size:11px;">
                                                    ${order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div style="font-size:12px;color:#666;">
                                                Order #${order.orderNumber} • ${order.supplierName || 'Supplier TBD'}
                                            </div>
                                            ${order.estimatedPrice ? `
                                                <div style="font-size:12px;margin-top:5px;">
                                                    Est: ₱${order.estimatedPrice}/unit (Total: ₱${(order.estimatedPrice * order.quantity).toFixed(2)})
                                                </div>
                                            ` : ''}
                                            ${order.actualPrice ? `
                                                <div style="font-size:12px;margin-top:3px;color:#10b981;">
                                                    <strong>Actual: ₱${order.actualPrice}/unit (Total: ₱${(order.actualPrice * order.quantity).toFixed(2)})</strong>
                                                    ${order.priceVariance ? ` ${varianceIcon} ${order.priceVariance > 0 ? '+' : ''}₱${order.priceVariance.toFixed(2)}` : ''}
                                                </div>
                                            ` : ''}
                                            ${order.paymentId ? `
                                                <div style="font-size:11px;margin-top:3px;color:#059669;">
                                                    💵 Downpayment collected
                                                </div>
                                            ` : ''}
                                            ${order.cancellationReason ? `
                                                <div style="font-size:11px;color:#ef4444;margin-top:5px;padding:5px;background:#fee;border-radius:3px;">
                                                    Cancelled: ${order.cancellationReason}
                                                </div>
                                            ` : ''}
                                            <div style="font-size:11px;color:#999;margin-top:5px;">
                                                Requested: ${utils.formatDateTime(order.requestedAt)}
                                                ${order.receivedAt ? ` • Received: ${utils.formatDateTime(order.receivedAt)}` : ''}
                                            </div>
                                        </div>
                                    `;
                }).join('')}
                            </div>
                        </details>
                    `;
            })()}
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
                    ${(role === 'admin' && r.status === 'Claimed') ? `<button class="btn-small" onclick="adminAddPaymentToReleased('${r.id}')" style="background:#2e7d32;color:white;">💰 Admin Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Waiting for Parts') && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openUsePartsModal('${r.id}')" style="background:#2e7d32;color:white;">🔧 Use Parts</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">💵 Parts Cost</button>` : ''}
                    ${!['Completed', 'Claimed', 'Cancelled'].includes(r.status) && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openPartsOrderModal('${r.id}')" style="background:#8b5cf6;color:white;">📦 Request Parts</button>` : ''}
                    ${r.status === 'Waiting for Parts' && !r.workaroundActive && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="enableWorkaround('${r.id}')" style="background:#f59e0b;color:white;">🔧 Work on Other Issues</button>` : ''}
                    ${role === 'technician' ? `<button class="btn-small" onclick="openExpenseModal('${r.id}')" style="background:#9c27b0;color:white;">💸 Expense</button>` : ''}
                    ${(() => {
                const repairExpenses = (window.techExpenses || []).filter(e => e.repairId === r.id);
                return repairExpenses.length > 0 ? `<button class="btn-small" onclick="viewRepairExpenses('${r.id}')" style="background:#7b1fa2;color:white;">📋 View Expenses (${repairExpenses.length})</button>` : '';
            })()}
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
        // Create unique ID from date key (remove spaces and special chars)
        const groupId = `date-group-${dateKey.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;

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
            const assessmentPreview = r.initialAssessment ? (r.initialAssessment.length > 50 ? r.initialAssessment.substring(0, 50) + '...' : r.initialAssessment) : null;

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
                                            ${r.isBackJob ? '<span class="status-badge status-badge-danger">🔄 Back Job</span>' : ''}
                                            ${r.isBackJob && r.suggestedTech === window.currentUser.uid ? '<span class="badge-pill badge-pill-warning">⭐ Your Previous Customer</span>' : ''}
                                            ${r.customerType === 'Dealer' ? '<span class="badge-pill badge-pill-info">🏪 Dealer</span>' : ''}
                                            ${r.initialAssessment ? '<span class="status-badge" style="background:#e3f2fd;color:#1976d2;">📋 Initial Notes</span>' : ''}
                                        </div>
                                        <div class="repair-compact-problem">
                                            <strong>Problem:</strong> ${problemPreview}
                                        </div>
                                        ${assessmentPreview ? `
                                            <div class="repair-compact-assessment" style="margin-top:5px;padding:8px;background:#e3f2fd;border-radius:5px;font-size:13px;">
                                                <strong style="color:#1976d2;">📋 Assessment:</strong> ${assessmentPreview}
                                            </div>
                                        ` : ''}
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
                                 data-assessment="${(r.initialAssessment || '').toLowerCase()}"
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
                                            ${r.isBackJob ? '<span class="status-badge status-badge-danger">🔄 Back Job</span>' : ''}
                                            ${r.customerType === 'Dealer' ? '<span class="badge-pill badge-pill-info">🏪 Dealer</span>' : ''}
                                            ${r.initialAssessment ? '<span class="badge-pill badge-pill-info">📋 Initial Notes</span>' : ''}
                                            ${balance > 0 ? `<span class="badge-pill badge-pill-warning">₱${balance.toFixed(0)} balance</span>` : '<span class="badge-pill badge-pill-success">✓ Paid</span>'}
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
        // Show all items by removing display style
        allItems.forEach(item => item.style.display = '');
        if (statsDiv) statsDiv.style.display = 'none';

        // Show all date groups when search is cleared
        document.querySelectorAll('.date-group').forEach(group => {
            group.style.display = 'block';
        });
        return;
    }

    let matchCount = 0;

    allItems.forEach(item => {
        const customer = item.dataset.customer || '';
        const phone = item.dataset.phone || '';
        const model = item.dataset.model || '';
        const problem = item.dataset.problem || '';
        const assessment = item.dataset.assessment || '';
        const repairId = item.dataset.repairId || '';

        const matches = customer.includes(searchLower) ||
            phone.includes(searchLower) ||
            model.includes(searchLower) ||
            problem.includes(searchLower) ||
            assessment.includes(searchLower) ||
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
        const visibleItems = Array.from(group.querySelectorAll('.searchable-repair-item')).filter(item => {
            const display = item.style.display;
            return !display || display === 'block' || display === '';
        });
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
                            ${r.isBackJob ? '<span class="status-badge status-badge-danger">🔄 Back Job</span>' : ''}
                            ${r.isBackJob && r.suggestedTech === window.currentUser.uid ? '<span class="badge-pill badge-pill-warning">⭐ Your Previous Customer</span>' : ''}
                            ${r.customerType === 'Dealer' ? '<span class="badge-pill badge-pill-info">🏪 Dealer</span>' : ''}
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
            
            ${r.photos && r.photos.length > 0 ? `
                <div style="margin-top:15px;background:#f5f5f5;padding:12px;border-radius:8px;border-left:4px solid #673ab7;">
                    <strong style="color:#673ab7;">📸 Device Photos (${r.photos.length})</strong>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px;">
                        ${r.photos.map((photo, index) => `
                            <div style="cursor:pointer;border:2px solid #ddd;border-radius:8px;overflow:hidden;" onclick="viewFullImage('${photo}', '${r.customerName} - Photo ${index + 1}')">
                                <img src="${photo}" alt="Device photo ${index + 1}" style="width:100%;height:150px;object-fit:cover;" />
                                <div style="background:#673ab7;color:white;text-align:center;padding:5px;font-size:12px;">
                                    Photo ${index + 1}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${r.initialAssessment ? `
                <div style="margin-top:15px;background:#e3f2fd;padding:12px;border-radius:8px;border-left:4px solid #2196f3;">
                    <strong style="color:#1976d2;">📋 Initial Assessment:</strong><br>
                    <div style="margin-top:8px;color:#333;white-space:pre-wrap;">${r.initialAssessment}</div>
                    <small style="color:#666;margin-top:8px;display:block;">Documented at reception</small>
                </div>
            ` : ''}
            
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
            
            ${r.inventoryItemsUsed && r.inventoryItemsUsed.length > 0 ? `
                <details style="margin-top:15px;background:#e8f5e9;padding:12px;border-radius:8px;border-left:4px solid #4caf50;">
                    <summary style="cursor:pointer;font-weight:600;color:#2e7d32;">📦 Inventory Items Used (${r.inventoryItemsUsed.length})</summary>
                    <div style="margin-top:12px;display:grid;gap:8px;">
                        ${r.inventoryItemsUsed.map(item => `
                            <div style="background:white;padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${item.itemName}</strong><br>
                                    <small style="color:#666;">${item.category} • ${item.quantity} ${item.unit}</small>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-weight:bold;color:#2e7d32;">₱${(item.quantity * item.unitCost).toFixed(2)}</div>
                                    <small style="color:#999;">₱${item.unitCost.toFixed(2)}/${item.unit}</small>
                                </div>
                            </div>
                        `).join('')}
                        <div style="padding:10px;background:white;border-radius:6px;display:flex;justify-content:space-between;border-top:2px solid #4caf50;">
                            <strong>Total Stock Cost:</strong>
                            <strong style="color:#2e7d32;">₱${r.inventoryItemsUsed.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2)}</strong>
                        </div>
                        <small style="color:#666;font-size:12px;margin-top:4px;">
                            🕐 Linked ${window.utils.daysAgo(r.inventoryLinkedAt)} by ${r.inventoryLinkedBy}
                        </small>
                    </div>
                </details>
            ` : r.actualSupplier === 'Stock' ? `
                <div style="margin-top:15px;background:#fff3cd;padding:12px;border-radius:8px;border-left:4px solid #ffc107;">
                    <strong>⚠️ Stock items not yet linked</strong><br>
                    <small style="color:#666;">Supplier marked as "From Stock" but inventory items haven't been specified.</small>
                    ${['admin', 'manager'].includes(window.currentUserData.role) ? `
                        <button onclick="openInventorySelectionModal('${r.id}', ${r.actualPartsCost || 0})" class="btn-small" style="margin-top:8px;background:#ff9800;">
                            📦 Link Inventory Items
                        </button>
                    ` : ''}
                </div>
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

    // Check if technician can delete (within 24h of creation)
    const canTechDelete = role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed' &&
        (() => {
            const createdAt = new Date(r.createdAt);
            const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
            return hoursSinceCreation <= 24;
        })();

    return `
        ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
        ${(role === 'admin' && (r.status === 'Released' || r.status === 'Claimed')) ? `<button class="btn-small" onclick="adminAddPaymentToReleased('${r.id}')" style="background:#2e7d32;color:white;">💰 Admin Payment</button>` : ''}
        ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
        ${r.acceptedBy && (role === 'admin' || role === 'manager' || role === 'technician') ? `<button class="btn-small" onclick="openUpdateDiagnosisModal('${r.id}')" style="background:#667eea;color:white;">📝 Update Diagnosis</button>` : ''}
        ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
        ${(r.status === 'In Progress' || r.status === 'Waiting for Parts') && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openUsePartsModal('${r.id}')" style="background:#2e7d32;color:white;">🔧 Use Parts</button>` : ''}
        ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">💵 Parts Cost</button>` : ''}
        ${!['Completed', 'Claimed', 'Cancelled'].includes(r.status) && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openPartsOrderModal('${r.id}')" style="background:#8b5cf6;color:white;">📦 Request Parts</button>` : ''}
        ${r.status === 'Waiting for Parts' && !r.workaroundActive && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="enableWorkaround('${r.id}')" style="background:#f59e0b;color:white;">🔧 Work on Other Issues</button>` : ''}
        ${role === 'technician' ? `<button class="btn-small" onclick="openExpenseModal('${r.id}')" style="background:#9c27b0;color:white;">💸 Expense</button>` : ''}
        ${r.acceptedBy && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openTransferRepairModal('${r.id}')" style="background:#9c27b0;color:white;">🔄 Transfer</button>` : ''}
        ${canTechDelete ? `<button class="btn-small" onclick="deleteRepair('${r.id}')" style="background:#dc3545;color:white;" title="Delete within 24h">🗑️ Delete</button>` : ''}
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

    // Technician delete button (within 24h of creation)
    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed') {
        const createdAt = new Date(r.createdAt);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation <= 24) {
            buttons += `
                <button class="btn-small" onclick="deleteRepair('${r.id}')" style="background:#dc3545;color:white;" title="Delete within 24h">
                    🗑️ Delete
                </button>
            `;
        }
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

    // Technician delete button (within 24h of creation)
    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted) {
        const createdAt = new Date(r.createdAt);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation <= 24) {
            buttons += `
                <button class="btn-small" onclick="deleteRepair('${r.id}')" style="background:#dc3545;color:white;" title="Delete within 24h">
                    🗑️ Delete
                </button>
            `;
        }
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

    // Technician delete button (within 24h of creation)
    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed') {
        const createdAt = new Date(r.createdAt);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation <= 24) {
            buttons += `
                <button class="btn-small" onclick="deleteRepair('${r.id}')" style="background:#dc3545;color:white;" title="Delete within 24h">
                    🗑️ Delete
                </button>
            `;
        }
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

    // Technician delete button (within 24h of creation)
    if (role === 'technician' &&
        r.technicianId === window.currentUser.uid &&
        !r.deleted &&
        r.status !== 'Completed') {
        const createdAt = new Date(r.createdAt);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation <= 24) {
            buttons += `
                <button class="btn-small" onclick="deleteRepair('${r.id}')" style="background:#dc3545;color:white;padding:10px 15px;" title="Delete within 24h">
                    🗑️ Delete
                </button>
            `;
        }
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

    // Only show truly active repairs (In Progress and Waiting for Parts)
    // Ready for Pickup devices belong in "Completed Today" tab
    const myRepairs = window.allRepairs.filter(r =>
        r.acceptedBy === window.currentUser.uid &&
        (r.status === 'In Progress' || r.status === 'Waiting for Parts')
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
 * Build My Completed Devices Tab (Technician Only)
 * Shows Ready for Pickup + Released devices (not yet Claimed)
 */
function buildMyCompletedDevicesTab(container) {
    const dateFilter = window.currentDateFilter || null;
    console.log('✅ Building My Completed Devices tab', dateFilter ? `(Filter: ${dateFilter})` : '');
    window.currentTabRefresh = () => buildMyCompletedDevicesTab(document.getElementById('mycompletedTab'));

    const techId = window.currentUser.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter: Devices where this tech did the repair - Ready for Pickup + Released
    let myReadyDevices = window.allRepairs.filter(r =>
        r.acceptedBy === techId &&
        r.status === 'Ready for Pickup' &&
        !r.deleted
    );

    let myReleasedDevices = window.allRepairs.filter(r =>
        r.acceptedBy === techId &&
        r.status === 'Released' &&
        !r.deleted
    );

    // Apply date filter if specified
    if (dateFilter === 'today') {
        myReadyDevices = myReadyDevices.filter(r => {
            if (!r.completedAt) return false;
            const completedDate = new Date(r.completedAt);
            return completedDate >= today;
        });
        myReleasedDevices = myReleasedDevices.filter(r => {
            if (!r.completedAt) return false;
            const completedDate = new Date(r.completedAt);
            return completedDate >= today;
        });
    }

    // Sort by most recent first
    myReadyDevices.sort((a, b) => new Date(b.completedAt || b.recordedDate) - new Date(a.completedAt || a.recordedDate));
    myReleasedDevices.sort((a, b) => new Date(b.releasedAt || b.releaseDate) - new Date(a.releasedAt || a.releaseDate));

    const totalCompleted = myReadyDevices.length + myReleasedDevices.length;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 style="margin:0;">✅ My Completed Devices</h2>
                <p style="margin:5px 0 0;color:var(--text-secondary);">
                    Repairs I finished - Ready for pickup and recently released
                </p>
                ${dateFilter === 'today' ? `
                    <div style="margin-top:15px;padding:12px;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3;display:flex;justify-content:space-between;align-items:center;">
                        <span><strong>📅 Showing:</strong> Completed Today</span>
                        <button onclick="switchTab('mycompleted')" class="btn btn-secondary" style="padding:6px 12px;font-size:13px;">
                            📋 Show All Completed
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Ready for Pickup Section -->
            ${myReadyDevices.length > 0 ? `
                <div style="margin-bottom:30px;">
                    <h3 style="margin:20px 0 15px;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
                        <span>📦 Ready for Pickup</span>
                        <span style="background:#2196f3;color:white;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:bold;">
                            ${myReadyDevices.length}
                        </span>
                    </h3>
                    <div class="alert-card-info">
                        <strong>📱 Status:</strong> Repair completed, waiting for customer to pick up
                    </div>
                    <div id="myReadyDevicesList"></div>
                </div>
            ` : ''}

            <!-- Released - Awaiting Finalization Section -->
            ${myReleasedDevices.length > 0 ? `
                <div style="margin-bottom:30px;">
                    <h3 style="margin:20px 0 15px;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
                        <span>⚡ Released - Awaiting Finalization</span>
                        <span style="background:#ff9800;color:white;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:bold;">
                            ${myReleasedDevices.length}
                        </span>
                    </h3>
                    <div class="alert-card-warning">
                        <strong>⏰ Auto-Finalize:</strong> These devices will automatically move to "Claimed" at 6:00 PM Manila time.
                        <br><strong>💡 Tip:</strong> You can finalize now and optionally collect payment.
                    </div>
                    <div id="myReleasedDevicesList"></div>
                </div>
            ` : ''}

            ${totalCompleted === 0 ? `
                <div class="empty-state">
                    <div style="font-size:48px;margin-bottom:10px;">✅</div>
                    <p>No completed devices${dateFilter === 'today' ? ' today' : ''}</p>
                    <p style="color:var(--text-secondary);font-size:14px;">
                        Devices appear here when repair is finished
                    </p>
                </div>
            ` : ''}
        </div>
    `;

    // Render lists after DOM update
    setTimeout(() => {
        if (myReadyDevices.length > 0) {
            const readyListContainer = document.getElementById('myReadyDevicesList');
            displayGroupedRepairsList(myReadyDevices, readyListContainer, 'forrelease', 'completedAt');
        }
        if (myReleasedDevices.length > 0) {
            const releasedListContainer = document.getElementById('myReleasedDevicesList');
            displayGroupedRepairsList(myReleasedDevices, releasedListContainer, 'released', 'releasedAt');
        }
    }, 0);
}

/**
 * Build My Claimed Devices Tab (Technician Only)
 * Shows ONLY Claimed devices (fully finalized and picked up)
 */
function buildMyClaimedDevicesTab(container) {
    const dateFilter = window.currentDateFilter || null;
    console.log('🎉 Building My Claimed Devices tab', dateFilter ? `(Filter: ${dateFilter})` : '');
    window.currentTabRefresh = () => buildMyClaimedDevicesTab(document.getElementById('myclaimedTab'));

    const techId = window.currentUser.uid;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter: Only Claimed devices (fully finalized)
    let myClaimedDevices = window.allRepairs.filter(r =>
        r.acceptedBy === techId &&
        r.status === 'Claimed' &&
        !r.deleted
    );

    // Apply date filter if specified
    if (dateFilter === 'today') {
        myClaimedDevices = myClaimedDevices.filter(r => {
            if (!r.claimedAt) return false;
            const claimedDate = new Date(r.claimedAt);
            return claimedDate >= today;
        });
    }

    // Sort by most recent first
    myClaimedDevices.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 style="margin:0;">🎉 My Claimed Devices</h2>
                <p style="margin:5px 0 0;color:var(--text-secondary);">
                    Devices I repaired that were finalized and picked up by customers
                </p>
                ${dateFilter === 'today' ? `
                    <div style="margin-top:15px;padding:12px;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3;display:flex;justify-content:space-between;align-items:center;">
                        <span><strong>📅 Showing:</strong> Claimed Today</span>
                        <button onclick="switchTab('myclaimed')" class="btn btn-secondary" style="padding:6px 12px;font-size:13px;">
                            📋 Show All Claimed Devices
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Claimed Devices Section -->
            <div>
                <h3 style="margin:20px 0 15px;color:var(--text-primary);display:flex;align-items:center;gap:10px;">
                    <span>🎉 Fully Finalized Repairs</span>
                    <span style="background:#4caf50;color:white;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:bold;">
                        ${myClaimedDevices.length}
                    </span>
                </h3>
                ${myClaimedDevices.length === 0 ? `
                    <div class="empty-state">
                        <div style="font-size:48px;margin-bottom:10px;">🎉</div>
                        <p>No claimed devices${dateFilter === 'today' ? ' today' : ' yet'}</p>
                        <p style="color:var(--text-secondary);font-size:14px;">
                            Devices appear here after they are released and finalized
                        </p>
                    </div>
                ` : `
                    <div class="alert-card-success">
                        <strong>✅ Status:</strong> These repairs are fully completed, paid, and customer has picked up the device.
                    </div>
                    <div id="myClaimedDevicesList"></div>
                `}
            </div>
        </div>
    `;

    // Render list after DOM update
    setTimeout(() => {
        if (myClaimedDevices.length > 0) {
            const claimedListContainer = document.getElementById('myClaimedDevicesList');
            displayGroupedRepairsList(myClaimedDevices, claimedListContainer, 'claimed', 'claimedAt');
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
            <div class="card alert-card-success" style="margin-bottom:15px;">
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
            <div class="card alert-card-danger" style="margin-bottom:15px;">
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
            
            <!-- Table/Card View Toggle -->
            <div class="table-view-toggle">
                <button onclick="toggleTableView('cash-count-table')" class="btn btn-small" id="cash-count-view-toggle">
                    <span id="cash-count-toggle-text">📱 Card View</span>
                </button>
            </div>
            
            <!-- Desktop Table View -->
            <div id="cash-count-table-view" class="table-responsive">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr class="bg-gray-50" style="text-align:left;">
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Date</th>
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Payments</th>
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Expenses</th>
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Net</th>
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Locked By</th>
                            <th class="p-10" style="border-bottom:2px solid var(--border-color);">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lockedDays.map(([date, data]) => `
                            <tr style="border-bottom:1px solid var(--border-light);">
                                <td class="p-10">${utils.formatDate(date)}</td>
                                <td class="p-10" style="color:#2e7d32;">₱${data.totalPayments.toFixed(0)}</td>
                                <td class="p-10" style="color:#c62828;">₱${data.totalExpenses.toFixed(0)}</td>
                                <td class="p-10 text-bold" style="color:${data.netRevenue >= 0 ? '#1976d2' : '#f57c00'};">
                                    ₱${data.netRevenue.toFixed(0)}
                                </td>
                                <td class="p-10 text-sm text-muted">${data.lockedByName || 'Unknown'}</td>
                                <td class="p-10">
                                    <button onclick="viewLockedDay('${date}')" class="btn btn-primary" style="font-size:13px;">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Mobile Card View -->
            <div id="cash-count-card-view" class="mobile-card-view" style="display:none;">
                ${lockedDays.map(([date, data]) => `
                    <div class="cash-count-card">
                        <div class="card-date-header">${utils.formatDate(date)}</div>
                        <div class="card-row">
                            <span class="label">Payments:</span>
                            <span class="value" style="color:#2e7d32;">₱${data.totalPayments.toFixed(0)}</span>
                        </div>
                        <div class="card-row">
                            <span class="label">Expenses:</span>
                            <span class="value" style="color:#c62828;">₱${data.totalExpenses.toFixed(0)}</span>
                        </div>
                        <div class="card-row">
                            <span class="label">Net:</span>
                            <span class="value text-bold" style="color:${data.netRevenue >= 0 ? '#1976d2' : '#f57c00'};">
                                ₱${data.netRevenue.toFixed(0)}
                            </span>
                        </div>
                        <div class="card-footer">
                            <span class="text-muted-sm">Locked by: ${data.lockedByName || 'Unknown'}</span>
                            <button onclick="viewLockedDay('${date}')" class="btn btn-primary btn-small">View</button>
                        </div>
                    </div>
                `).join('')}
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

/**
 * Calculate total profit for a given period
 * @param {string} period - 'today', 'week', 'month', or 'previousMonth'
 * @returns {number} Total net profit
 */
function calculateProfitForPeriod(period) {
    const now = new Date();
    let startDate, endDate;

    if (period === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday start
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
    } else if (period === 'previousMonth') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    // Use analytics function if available
    if (window.getProfitDashboard) {
        const dashboard = window.getProfitDashboard(startDate, endDate);
        return dashboard.summary.totalNetProfit || 0;
    }

    return 0;
}

/**
 * Build Staff Overview Tab (Admin only)
 * Shows real-time staff status, attendance, and activity
 */
function buildStaffOverviewTab(container) {
    console.log('👥 Building Staff Overview tab');
    window.currentTabRefresh = () => buildStaffOverviewTab(document.getElementById('staff-overviewTab'));

    // Exclude admin role from staff overview
    const users = Object.values(window.allUsers || {}).filter(u => u.status === 'active' && u.role !== 'admin');
    const allUserActivity = window.allUserActivity || {};
    console.log('📊 User Activity Data:', allUserActivity, '- Total keys:', Object.keys(allUserActivity).length);
    const today = getLocalDateString(new Date());

    // Categorize users (no admins)
    const technicians = users.filter(u => u.role === 'technician');
    const cashiers = users.filter(u => u.role === 'cashier');
    const managers = users.filter(u => u.role === 'manager');

    // Count currently clocked in
    const clockedInTechs = technicians.filter(t => allUserActivity[t.id]?.currentStatus === 'clocked-in').length;
    const clockedInCashiers = cashiers.filter(c => allUserActivity[c.id]?.currentStatus === 'clocked-in').length;

    container.innerHTML = `
        <div class="page-header">
            <h2>👥 Staff Overview</h2>
            <p style="color:#666;margin-top:5px;">Real-time staff activity and attendance monitoring</p>
        </div>

        <!-- Summary Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card alert-card-info">
                <h3>${users.length}</h3>
                <p>Active Staff</p>
            </div>
            <div class="stat-card alert-card-success">
                <h3>${clockedInTechs + clockedInCashiers}</h3>
                <p>🟢 Clocked In</p>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;">
                <h3>₱${calculateProfitForPeriod('today').toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                <p>💰 Today's Profit</p>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);color:white;">
                <h3>₱${calculateProfitForPeriod('week').toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                <p>📅 This Week</p>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);color:white;">
                <h3>₱${calculateProfitForPeriod('month').toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                <p>📊 This Month</p>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #ffd93d 0%, #f59e0b 100%);color:white;">
                <h3>₱${calculateProfitForPeriod('previousMonth').toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                <p>📈 Previous Month</p>
            </div>
        </div>

        <!-- Real-time Status -->
        <div class="card" style="margin:20px 0;">
            <h3>🟢 Real-Time Status</h3>
            ${renderStaffStatusList(technicians, allUserActivity, 'Technicians', '🔧')}
            ${renderStaffStatusList(cashiers, allUserActivity, 'Cashiers', '💳')}
            ${managers.length > 0 ? renderStaffStatusList(managers, allUserActivity, 'Managers', '👨‍💼') : ''}
        </div>

        <!-- Today's Attendance -->
        <div class="card" style="margin:20px 0;">
            <h3>📅 Today's Attendance (${utils.formatDate(new Date().toISOString())})</h3>
            <div id="todayAttendanceList">
                <p style="text-align:center;color:#999;padding:20px;">Loading attendance data...</p>
            </div>
        </div>

        <!-- Staff Dashboards (View Other Users) -->
        <div class="card" style="margin:20px 0;">
            <h3>📊 View User Dashboard</h3>
            <p style="color:#666;margin-bottom:15px;">Select a user to view their personal dashboard and activity</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                ${users.map(user => {
        const activity = allUserActivity[user.id];
        const isClockedIn = activity?.currentStatus === 'clocked-in';
        return `
                        <button onclick="viewUserDashboard('${user.id}')" class="btn-secondary" 
                            style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
                            <span>
                                ${isClockedIn ? '🟢' : '⚫'} ${user.displayName}
                            </span>
                            <span style="font-size:11px;opacity:0.7;">${user.role}</span>
                        </button>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    // Load today's attendance asynchronously
    loadTodayAttendance(users);
}

/**
 * Render staff status list for a group
 */
function renderStaffStatusList(users, allUserActivity, groupName, icon) {
    if (users.length === 0) return '';

    return `
        <div style="margin:20px 0;">
            <h4 style="color:#667eea;margin-bottom:15px;">${icon} ${groupName}</h4>
            <div style="display:grid;gap:10px;">
                ${users.map(user => {
        const activity = allUserActivity[user.id];
        const isClockedIn = activity?.currentStatus === 'clocked-in';
        const lastActivity = activity?.lastActivity;
        const clockInTime = activity?.todayClockIn;
        console.log(`🔍 ${user.displayName}:`, { activity, isClockedIn, clockInTime });

        return `
                        <div style="background:#f9f9f9;padding:15px;border-radius:8px;border-left:4px solid ${isClockedIn ? '#4caf50' : '#999'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${user.displayName}</strong>
                                    <div style="font-size:13px;color:#666;margin-top:5px;">
                                        Status: <span style="color:${isClockedIn ? '#4caf50' : '#999'};font-weight:600;">
                                            ${isClockedIn ? '🟢 Clocked In' : '⚫ Clocked Out'}
                                        </span>
                                    </div>
                                    ${clockInTime ? `
                                        <div style="font-size:12px;color:#666;margin-top:3px;">
                                            Clock In: ${utils.formatDateTime(clockInTime)}
                                        </div>
                                    ` : ''}
                                    ${lastActivity ? `
                                        <div style="font-size:12px;color:#999;margin-top:3px;">
                                            Last Activity: ${utils.daysAgo(lastActivity)}
                                        </div>
                                    ` : ''}
                                </div>
                                <button onclick="viewUserDashboard('${user.id}')" class="btn-small">
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

/**
 * Load today's attendance for all users
 */
async function loadTodayAttendance(users) {
    const container = document.getElementById('todayAttendanceList');
    if (!container) return;

    try {
        const today = getLocalDateString(new Date());
        const db = firebase.database();

        const attendancePromises = users.map(async (user) => {
            const snapshot = await db.ref(`userAttendance/${user.id}/${today}`).once('value');
            return {
                user: user,
                attendance: snapshot.val()
            };
        });

        const results = await Promise.all(attendancePromises);

        // Filter users who have attendance today
        const withAttendance = results.filter(r => r.attendance);
        const withoutAttendance = results.filter(r => !r.attendance);

        if (withAttendance.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;color:#999;padding:20px;">No attendance records for today</p>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display:grid;gap:10px;">
                ${withAttendance.map(({ user, attendance }) => {
            const clockIn = attendance.clockIn;
            const clockOut = attendance.clockOut;
            const duration = attendance.duration || 0;
            const isActive = !clockOut;

            // Calculate current duration if still clocked in
            let displayDuration = duration;
            if (isActive && clockIn) {
                const clockInTime = new Date(clockIn);
                const now = new Date();
                displayDuration = Math.floor((now - clockInTime) / 1000);
            }

            const hours = Math.floor(displayDuration / 3600);
            const minutes = Math.floor((displayDuration % 3600) / 60);

            return `
                        <div style="background:#f9f9f9;padding:15px;border-radius:8px;border-left:4px solid ${isActive ? '#4caf50' : '#2196f3'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${user.displayName}</strong> 
                                    <span style="font-size:12px;color:#666;">(${user.role})</span>
                                    <div style="font-size:13px;margin-top:8px;color:#666;">
                                        <div>⏰ Clock In: ${utils.formatDateTime(clockIn)}</div>
                                        ${clockOut ? `
                                            <div>⏰ Clock Out: ${utils.formatDateTime(clockOut)}</div>
                                        ` : `
                                            <div style="color:#4caf50;font-weight:600;">🟢 Currently Working</div>
                                        `}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:24px;font-weight:600;color:${isActive ? '#4caf50' : '#2196f3'};">
                                        ${hours}h ${minutes}m
                                    </div>
                                    <div style="font-size:12px;color:#666;margin-top:5px;">
                                        Work Duration
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>

            ${withoutAttendance.length > 0 ? `
                <div style="margin-top:20px;padding:15px;background:#fff3cd;border-radius:8px;border-left:4px solid #ffc107;">
                    <strong>⚠️ No Clock In Today:</strong>
                    <div style="margin-top:10px;font-size:13px;">
                        ${withoutAttendance.map(({ user }) =>
            `<span style="display:inline-block;background:white;padding:5px 10px;margin:5px 5px 0 0;border-radius:4px;">${user.displayName}</span>`
        ).join('')}
                    </div>
                </div>
            ` : ''}
        `;

    } catch (error) {
        console.error('❌ Error loading today attendance:', error);
        container.innerHTML = `
            <p style="text-align:center;color:#f44336;padding:20px;">Error loading attendance data</p>
        `;
    }
}

/**
 * View another user's dashboard (Admin feature)
 */
async function viewUserDashboard(userId) {
    const user = window.allUsers[userId];
    if (!user) {
        alert('User not found');
        return;
    }

    // Show modal with user's dashboard
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');
    const modalContent = document.getElementById('userModalContent');

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = `📊 ${user.displayName}'s Dashboard`;
    modalContent.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">Loading dashboard...</p>`;
    modal.style.display = 'block';

    try {
        // Get user's stats
        const userRepairs = window.allRepairs.filter(r => {
            if (user.role === 'technician') {
                return r.acceptedBy === userId;
            } else if (user.role === 'cashier') {
                return r.receivedById === userId || (r.payments && r.payments.some(p => p.receivedById === userId));
            }
            return false;
        });

        const today = getLocalDateString(new Date());
        const todayRepairs = userRepairs.filter(r => {
            const createdDate = r.createdAt ? getLocalDateString(new Date(r.createdAt)) : null;
            return createdDate === today;
        });

        // Get attendance data
        const db = firebase.database();
        const attendanceSnapshot = await db.ref(`userAttendance/${userId}`).limitToLast(7).once('value');
        const attendanceData = attendanceSnapshot.val() || {};
        const attendanceDates = Object.keys(attendanceData).sort().reverse();

        // Get activity status
        const activity = window.allUserActivity[userId];
        const isClockedIn = activity?.currentStatus === 'clocked-in';

        modalContent.innerHTML = `
            <!-- User Info -->
            <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h3 style="margin:0 0 10px 0;">${user.displayName}</h3>
                <div style="font-size:14px;color:#666;">
                    <div><strong>Role:</strong> ${user.role.toUpperCase()}</div>
                    <div><strong>Email:</strong> ${user.email}</div>
                    <div><strong>Status:</strong> 
                        <span style="color:${isClockedIn ? '#4caf50' : '#999'};font-weight:600;">
                            ${isClockedIn ? '🟢 Clocked In' : '⚫ Clocked Out'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px;">
                <div class="stat-card alert-card-info">
                    <h3>${userRepairs.length}</h3>
                    <p>Total Repairs</p>
                </div>
                <div class="stat-card alert-card-success">
                    <h3>${todayRepairs.length}</h3>
                    <p>Today's Work</p>
                </div>
            </div>

            <!-- Recent Attendance -->
            <div style="margin-top:20px;">
                <h4>📅 Recent Attendance (Last 7 Days)</h4>
                ${attendanceDates.length === 0 ? `
                    <p style="color:#999;padding:20px;text-align:center;">No attendance records</p>
                ` : `
                    <div style="margin-top:15px;">
                        ${attendanceDates.map(date => {
            const record = attendanceData[date];
            const duration = record.duration || 0;
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);

            return `
                                <div style="background:#f9f9f9;padding:12px;margin-bottom:8px;border-radius:6px;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <strong>${utils.formatDate(record.clockIn)}</strong>
                                            <div style="font-size:12px;color:#666;margin-top:4px;">
                                                ${record.clockIn ? utils.formatDateTime(record.clockIn) : 'N/A'} - 
                                                ${record.clockOut ? utils.formatDateTime(record.clockOut) : 'No clock out'}
                                            </div>
                                        </div>
                                        <div style="font-weight:600;color:#2196f3;">
                                            ${hours}h ${minutes}m
                                        </div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                `}
            </div>

            <div style="margin-top:20px;text-align:center;">
                <button onclick="closeUserModal()" class="btn-secondary">Close</button>
            </div>
        `;

    } catch (error) {
        console.error('❌ Error loading user dashboard:', error);
        modalContent.innerHTML = `
            <p style="text-align:center;color:#f44336;padding:40px;">Error loading dashboard</p>
            <div style="text-align:center;">
                <button onclick="closeUserModal()" class="btn-secondary">Close</button>
            </div>
        `;
    }
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
            <div class="stat-card alert-card-info">
                <h3>${users.length}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-card alert-card-success">
                <h3>${activeUsers.length}</h3>
                <p>✅ Active</p>
            </div>
            <div class="stat-card alert-card-danger">
                <h3>${inactiveUsers.length}</h3>
                <p>❌ Inactive</p>
            </div>
            <div class="stat-card alert-card-warning">
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
            
            <!-- TODAY'S STATUS (Always Visible) -->
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
            
            <!-- COLLAPSIBLE SECTIONS -->
            
            <!-- 1. DATA HEALTH & CLEANUP -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('dataHealth')" style="background:#f8f9fa;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #10b981;">
                    <strong>🔍 Data Health & Cleanup</strong>
                    <span id="dataHealth-icon">▼</span>
                </div>
                <div id="dataHealth-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
                    ${buildDataHealthSection()}
                </div>
            </div>
            
            <!-- 2. PAYMENT VERIFICATION -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('paymentVerification')" style="background:#f8f9fa;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #10b981;">
                    <strong>✅ Payment Verification (Retroactive Fix)</strong>
                    <span id="paymentVerification-icon">▼</span>
                </div>
                <div id="paymentVerification-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
                    ${buildPaymentVerificationSection()}
                </div>
            </div>
            
            <!-- 3. UNPAID DEVICES -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('unpaidDevices')" style="background:#f8f9fa;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #ffc107;">
                    <strong>💰 Unpaid Released Devices</strong>
                    <span id="unpaidDevices-icon">▼</span>
                </div>
                <div id="unpaidDevices-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
                    ${buildUnpaidDevicesFixSection()}
                </div>
            </div>
            
            <!-- 4. SCHEDULED EXPORTS -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('scheduledExports')" style="background:#f8f9fa;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #2196f3;">
                    <strong>📤 Scheduled Exports</strong>
                    <span id="scheduledExports-icon">▼</span>
                </div>
                <div id="scheduledExports-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
                    ${buildExportSettingsSection()}
                </div>
            </div>
            
            <!-- 5. RESET FUNCTIONS -->
            ${isLocked ? `
                <div class="bg-yellow-light" style="padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
                    <strong>🔒 Today is Locked</strong>
                    <p style="margin:5px 0 0;">To make changes, go to the <strong>Cash Count</strong> tab and unlock today's date first.</p>
                </div>
            ` : `
                <div class="collapsible-section" style="margin-bottom:15px;">
                    <div onclick="toggleAdminSection('resetFunctions')" style="background:#ffe0e0;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #f44336;">
                        <strong>🔄 Reset Functions (Today's Data)</strong>
                        <span id="resetFunctions-icon">▼</span>
                    </div>
                    <div id="resetFunctions-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
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
                </div>
            `}
            
            <!-- 5. MASTER RESET (Danger Zone) -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('masterReset')" class="alert-card-danger" style="padding:12px 15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #b71c1c;">
                    <strong>🗑️ Master Reset (Danger Zone)</strong>
                    <span id="masterReset-icon">▼</span>
                </div>
                <div id="masterReset-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
                    <div class="alert-card-danger">
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
            </div>
            
            <!-- 6. DEBUG PANEL -->
            <div class="collapsible-section" style="margin-bottom:15px;">
                <div onclick="toggleAdminSection('debugPanel')" style="background:#e1f5fe;padding:12px 15px;border-radius:5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #2196f3;">
                    <strong>🐛 Debug System</strong>
                    <span id="debugPanel-icon">▼</span>
                </div>
                <div id="debugPanel-content" style="display:none;padding:15px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 5px 5px;">
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
                    
                    <button onclick="toggleDebugLogging()" class="btn" style="width:100%;background:${window.debugEnabled ? '#f44336' : '#4caf50'};color:white;margin-bottom:10px;">
                        ${window.debugEnabled ? '⏸️ Disable' : '▶️ Enable'} Debug Logging
                        <br><small style="font-weight:normal;opacity:0.9;">${window.debugEnabled ? 'Improves performance' : 'For troubleshooting only'}</small>
                    </button>
                    
                    <div style="padding:10px;background:#fff9c4;border-radius:5px;font-size:12px;">
                        <strong>💡 Tip:</strong> Press <kbd>Ctrl+Shift+D</kbd> to open logs anytime
                        <br><small style="color:#666;margin-top:5px;display:block;">Debug logging affects app performance - keep disabled unless troubleshooting</small>
                    </div>
                </div>
            </div>
            
            <!-- BACKUP INFO (Always Visible) -->
            <div class="form-group alert-card-info">
                <h4 style="margin:0 0 10px;">💾 Data Safety</h4>
                <ul style="margin:5px 0;padding-left:20px;font-size:13px;">
                    <li>All resets require your password</li>
                    <li>Deleted data is backed up to <code>resetBackups</code></li>
                    <li>All actions are logged with timestamp and reason</li>
                    <li>Locked dates cannot be modified</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Toggle collapsible admin section
 */
window.toggleAdminSection = function (sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const icon = document.getElementById(`${sectionId}-icon`);

    if (content && icon) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▲';
        } else {
            content.style.display = 'none';
            icon.textContent = '▼';
        }
    }
};

/**
 * Toggle debug logging on/off
 */
window.toggleDebugLogging = function () {
    window.debugEnabled = !window.debugEnabled;

    if (window.debugEnabled) {
        alert('✅ Debug Logging Enabled\n\nWarning: This will slow down the app. Use only for troubleshooting.\n\nPress Ctrl+Shift+D to view logs.');
    } else {
        alert('⏸️ Debug Logging Disabled\n\nApp performance improved. Logs are paused but still viewable.');
    }

    // Refresh admin tools tab to update button
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
};

/**
 * Build Payment Verification Section for Admin Tools
 */
function buildPaymentVerificationSection() {
    // Find all repairs with unverified retroactive payments
    const repairsWithUnverified = window.allRepairs.filter(r => {
        if (!r.payments || r.payments.length === 0) return false;

        return r.payments.some(p =>
            p.collectedDuringIntake === true &&
            (p.verified === false || p.verified === undefined || p.verified === null)
        );
    });

    const totalUnverified = repairsWithUnverified.reduce((count, r) => {
        return count + r.payments.filter(p =>
            p.collectedDuringIntake === true &&
            (p.verified === false || p.verified === undefined || p.verified === null)
        ).length;
    }, 0);

    const totalAmount = repairsWithUnverified.reduce((sum, r) => {
        const unverified = r.payments.filter(p =>
            p.collectedDuringIntake === true &&
            (p.verified === false || p.verified === undefined || p.verified === null)
        );
        return sum + unverified.reduce((s, p) => s + p.amount, 0);
    }, 0);

    return `
        <div class="payment-verification-section">
            <h4 style="margin:0 0 15px;">✅ Retroactive Payment Verification</h4>
            
            <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:15px;">
                <p style="margin:0 0 10px;font-size:14px;">
                    <strong>Purpose:</strong> Fix historical payments from retroactive intakes that lack verification fields.
                    Unverified payments prevent commission calculation for technicians.
                </p>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;margin-top:15px;">
                    <div style="background:white;padding:12px;border-radius:5px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#2196f3;">
                            ${repairsWithUnverified.length}
                        </div>
                        <div style="font-size:12px;color:#666;margin-top:5px;">Repairs Affected</div>
                    </div>
                    <div style="background:white;padding:12px;border-radius:5px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#ff9800;">
                            ${totalUnverified}
                        </div>
                        <div style="font-size:12px;color:#666;margin-top:5px;">Unverified Payments</div>
                    </div>
                    <div style="background:white;padding:12px;border-radius:5px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#4caf50;">
                            ₱${totalAmount.toFixed(2)}
                        </div>
                        <div style="font-size:12px;color:#666;margin-top:5px;">Total Amount</div>
                    </div>
                </div>
            </div>
            
            ${repairsWithUnverified.length > 0 ? `
                <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
                    <strong>⚠️ Issue Detected</strong>
                    <p style="margin:5px 0 0;font-size:13px;">
                        Found ${totalUnverified} unverified payment(s) in ${repairsWithUnverified.length} repair(s). 
                        These payments won't count toward technician commissions until verified.
                    </p>
                </div>
                
                <button 
                    onclick="adminBulkVerifyRetroactivePayments()" 
                    class="btn btn-success"
                    style="width:100%;font-size:14px;padding:12px;">
                    ✅ Bulk Verify All Retroactive Payments
                    <br><small style="font-weight:normal;">Mark ${totalUnverified} payment(s) as verified</small>
                </button>
            ` : `
                <div style="background:#d4edda;padding:15px;border-radius:5px;border-left:4px solid #4caf50;">
                    <strong>✅ All Clear!</strong>
                    <p style="margin:5px 0 0;font-size:13px;">
                        No unverified retroactive payments found. All payments are properly verified.
                    </p>
                </div>
            `}
            
            <div style="margin-top:15px;padding:10px;background:#e3f2fd;border-radius:5px;font-size:12px;">
                <strong>💡 How It Works:</strong>
                <ul style="margin:5px 0 0 15px;padding:0;">
                    <li>Scans all repairs for payments with <code>collectedDuringIntake: true</code></li>
                    <li>Identifies payments missing <code>verified: true</code> flag</li>
                    <li>Bulk updates all found payments with verification fields</li>
                    <li>Adds audit trail flag (<code>bulkVerified: true</code>)</li>
                    <li>Enables commission calculation for technicians</li>
                </ul>
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
                <div class="alert-card-warning" style="margin-bottom:15px;">
                    <strong style="color:#856404;">⚠️ ${unpaidDevices.length} Device${unpaidDevices.length !== 1 ? 's' : ''} Released Without Payment Records</strong>
                    <div style="font-size:13px;color:#856404;margin-top:4px;">Total outstanding balance: ₱${totalBalance.toFixed(2)}</div>
                </div>
                
                <!-- Table/Card View Toggle -->
                <div class="table-view-toggle">
                    <button onclick="toggleTableView('unpaid-devices-table')" class="btn btn-small" id="unpaid-devices-view-toggle">
                        <span id="unpaid-devices-toggle-text">📱 Card View</span>
                    </button>
                </div>
                
                <!-- Desktop Table View -->
                <div id="unpaid-devices-table-view" class="table-responsive" style="max-height:400px;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <thead style="position:sticky;top:0;background:var(--bg-gray-100);border-bottom:2px solid var(--border-color);">
                            <tr>
                                <th class="p-10" style="text-align:left;border-right:1px solid var(--border-color);">Device</th>
                                <th class="p-10" style="text-align:left;border-right:1px solid var(--border-color);">Customer</th>
                                <th class="p-10" style="text-align:right;border-right:1px solid var(--border-color);">Balance</th>
                                <th class="p-10" style="text-align:center;border-right:1px solid var(--border-color);">Status</th>
                                <th class="p-10" style="text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${unpaidDevices.map(r => {
        const totalPaid = (r.payments || []).reduce((s, p) => s + p.amount, 0);
        const balance = r.total - totalPaid;
        return `
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td class="p-10" style="border-right:1px solid var(--border-light);">
                                            <div class="text-bold">${r.brand} ${r.model}</div>
                                            <div class="text-xs text-muted">${r.id}</div>
                                        </td>
                                        <td class="p-10" style="border-right:1px solid var(--border-light);">
                                            <div>${r.customerName}</div>
                                            <div class="text-xs text-muted">${r.contactNumber}</div>
                                        </td>
                                        <td class="p-10" style="text-align:right;border-right:1px solid var(--border-light);">
                                            <strong style="color:#f44336;">₱${balance.toFixed(2)}</strong>
                                            <div class="text-xs text-muted">Total: ₱${r.total.toFixed(2)}</div>
                                        </td>
                                        <td class="p-10" style="text-align:center;border-right:1px solid var(--border-light);">
                                            <span class="badge-pill ${r.status === 'Released' ? 'badge-pill-warning' : 'badge-pill-success'}">
                                                ${r.status}
                                            </span>
                                            <div class="text-xs text-muted" style="margin-top:3px;">
                                                ${utils.formatDate(r.releasedAt || r.completedAt)}
                                            </div>
                                        </td>
                                        <td class="p-10" style="text-align:center;">
                                            <button onclick="recordMissingPaymentForDevice('${r.id}')" class="btn btn-primary btn-small">
                                                💳 Add Payment
                                            </button>
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Mobile Card View -->
                <div id="unpaid-devices-card-view" class="mobile-card-view" style="display:none;">
                    ${unpaidDevices.map(r => {
        const totalPaid = (r.payments || []).reduce((s, p) => s + p.amount, 0);
        const balance = r.total - totalPaid;
        return `
                        <div class="collections-card">
                            <div class="card-header-dual">
                                <div class="device-info">
                                    <strong>${r.brand} ${r.model}</strong>
                                    <span class="text-muted-sm">${r.id}</span>
                                </div>
                                <span class="badge-pill ${r.status === 'Released' ? 'badge-pill-warning' : 'badge-pill-success'}">
                                    ${r.status}
                                </span>
                            </div>
                            <div class="customer-info">
                                <span>${r.customerName}</span>
                                <span class="text-muted-sm">${r.contactNumber}</span>
                            </div>
                            <div class="balance-section">
                                <div class="balance-main" style="color:#f44336;">₱${balance.toFixed(2)} Balance</div>
                                <div class="text-muted-sm">Total: ₱${r.total.toFixed(2)}</div>
                            </div>
                            <div class="card-footer">
                                <span class="text-muted-sm">${utils.formatDate(r.releasedAt || r.completedAt)}</span>
                                <button onclick="recordMissingPaymentForDevice('${r.id}')" class="btn btn-primary btn-small">
                                    💳 Add Payment
                                </button>
                            </div>
                        </div>
                    `;
    }).join('')}
                </div>
                
                <div class="bg-gray-100 p-15 rounded-md" style="margin-top:15px;">
                    <p class="text-sm text-muted" style="margin:0 0 10px;">
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
            <div class="form-group alert-card-success">
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
        <div class="form-group alert-card-info">
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
            <div class="form-group alert-card-success">
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
            <div class="form-group alert-card-success">
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
        <div class="form-group alert-card-danger">
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
            
            <div class="alert-card-info" style="margin-bottom:20px;">
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
 * Toggle completion mode fields (Released/Claimed)
 */
function toggleCompletionFields() {
    const completionMode = document.querySelector('input[name="completionMode"]:checked')?.value;
    const completedFields = document.getElementById('completedFields');
    const warrantyField = document.getElementById('warrantyField');
    const techAcceptSection = document.getElementById('techAcceptSection');

    // Hide completion fields first
    if (completedFields) completedFields.style.display = 'none';
    if (warrantyField) warrantyField.style.display = 'none';

    // Show/hide tech assignment section
    if (techAcceptSection) {
        techAcceptSection.style.display = completionMode === 'normal' ? 'block' : 'none';
    }

    // Show completion fields for pre-completed or completed modes
    if ((completionMode === 'pre-completed' || completionMode === 'completed') && completedFields) {
        completedFields.style.display = 'block';

        // Show warranty field only for "completed" mode
        if (completionMode === 'completed' && warrantyField) {
            warrantyField.style.display = 'block';
        }

        // Set default dates to now
        const now = new Date();
        const nowStr = now.toISOString().slice(0, 16);
        document.getElementById('completionDate').value = nowStr;
        document.getElementById('releaseDate').value = nowStr;

        // Validate dates on change
        document.getElementById('completionDate').addEventListener('change', validateCompletionDates);
        document.getElementById('releaseDate').addEventListener('change', validateCompletionDates);

        // Toggle service slip upload based on verification method
        const verificationMethod = document.getElementById('verificationMethod');
        if (verificationMethod) {
            verificationMethod.addEventListener('change', function () {
                const slipUploadGroup = document.getElementById('slipUploadGroup');
                if (slipUploadGroup) {
                    slipUploadGroup.style.display = this.value === 'with-slip' ? 'block' : 'none';
                }
            });
        }
    }
}

/**
 * Validate completion dates (not future, release >= completion, >= 2025 unless admin override)
 */
function validateCompletionDates() {
    const completionMode = document.querySelector('input[name="completionMode"]:checked')?.value;
    if (completionMode === 'normal') return true;

    const isReleased = completionMode === 'released';
    const completionDateInput = document.getElementById(isReleased ? 'releasedCompletionDate' : 'claimedCompletionDate');
    const releaseDateInput = document.getElementById(isReleased ? 'releasedReleaseDate' : 'claimedClaimDate');
    const adminOverrideInput = document.getElementById(isReleased ? 'releasedAdminDateOverride' : 'claimedAdminDateOverride');

    if (!completionDateInput || !releaseDateInput) return false;

    const completionDate = new Date(completionDateInput.value);
    const releaseDate = new Date(releaseDateInput.value);
    const now = new Date();
    const minDate = new Date('2025-01-01');
    const isAdminOverride = adminOverrideInput?.checked || false;

    // Check completion not future
    if (completionDate > now) {
        alert('⚠️ Completion date cannot be in the future!');
        completionDateInput.value = '';
        return false;
    }

    // Check release not future
    if (releaseDate > now) {
        alert('⚠️ Release/claim date cannot be in the future!');
        releaseDateInput.value = '';
        return false;
    }

    // Check release >= completion
    if (releaseDate < completionDate) {
        alert('⚠️ Release/claim date must be after or equal to completion date!');
        releaseDateInput.value = completionDateInput.value;
        return false;
    }

    // Check dates >= 2025 unless admin override
    if (!isAdminOverride) {
        if (completionDate < minDate) {
            alert('⚠️ Completion date must be after January 1, 2025!\n(Admin override required for earlier dates)');
            completionDateInput.value = '';
            return false;
        }
        if (releaseDate < minDate) {
            alert('⚠️ Release/claim date must be after January 1, 2025!\n(Admin override required for earlier dates)');
            releaseDateInput.value = '';
            return false;
        }
    }

    return true;
}

/**
 * Toggle Released payment fields
 */
/**
 * Toggle payment fields for completion mode
 */
function togglePaymentFields() {
    const checkbox = document.getElementById('collectPayment');
    const fieldsDiv = document.getElementById('paymentFields');
    const amountInput = document.getElementById('paymentAmount');

    if (fieldsDiv) {
        fieldsDiv.style.display = checkbox?.checked ? 'block' : 'none';

        // Auto-populate amount from total
        if (checkbox?.checked && amountInput) {
            const total = parseFloat(document.getElementById('preApprovedTotal')?.value || 0);
            amountInput.value = total.toFixed(2);
        }
    }
}

/**
 * Toggle GCash reference field for completion mode
 */
function toggleGCashRef() {
    const method = document.getElementById('paymentMethod')?.value;
    const gcashRefGroup = document.getElementById('gcashRefGroup');

    if (gcashRefGroup) {
        gcashRefGroup.style.display = method === 'GCash' ? 'block' : 'none';
    }
}

// Keep old function names for backwards compatibility (in case they're called from other places)
function toggleReleasedPaymentFields() {
    togglePaymentFields();
}

function toggleReleasedGCashRef() {
    toggleGCashRef();
}

function toggleClaimedPaymentFields() {
    togglePaymentFields();
}

function toggleClaimedGCashRef() {
    toggleGCashRef();
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

/**
 * Build Photo Gallery Tab (Admin only)
 */
function buildPhotoGalleryTab(container) {
    console.log('📸 Building Photo Gallery tab');
    window.currentTabRefresh = () => buildPhotoGalleryTab(document.getElementById('photoGalleryTab'));

    const role = window.currentUserData?.role;
    if (role !== 'admin') {
        container.innerHTML = '<div class="card"><h3>⚠️ Access Denied</h3><p>This page is for administrators only.</p></div>';
        return;
    }

    // Get all repairs with photos
    const repairsWithPhotos = window.allRepairs.filter(r => r.photos && r.photos.length > 0 && !r.deleted);

    // Group photos by technician
    const photosByTech = {};
    repairsWithPhotos.forEach(repair => {
        const techName = repair.receivedBy || 'Unknown';
        if (!photosByTech[techName]) {
            photosByTech[techName] = [];
        }
        repair.photos.forEach((photo, index) => {
            photosByTech[techName].push({
                photo: photo,
                repairId: repair.id,
                customerName: repair.customerName,
                brand: repair.brand,
                model: repair.model,
                receivedAt: repair.receivedAt,
                photoIndex: index
            });
        });
    });

    const techNames = Object.keys(photosByTech).sort();
    const totalPhotos = repairsWithPhotos.reduce((sum, r) => sum + (r.photos?.length || 0), 0);

    container.innerHTML = `
        <div class="card">
            <h2>📸 Device Photo Gallery</h2>
            <p style="color:#666;margin-bottom:20px;">All photos uploaded during device intake</p>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-bottom:20px;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;text-align:center;">
                    <div>
                        <div style="font-size:32px;font-weight:bold;color:#673ab7;">${totalPhotos}</div>
                        <div style="color:#666;font-size:14px;">Total Photos</div>
                    </div>
                    <div>
                        <div style="font-size:32px;font-weight:bold;color:#2196f3;">${repairsWithPhotos.length}</div>
                        <div style="color:#666;font-size:14px;">Repairs with Photos</div>
                    </div>
                    <div>
                        <div style="font-size:32px;font-weight:bold;color:#4caf50;">${techNames.length}</div>
                        <div style="color:#666;font-size:14px;">Staff Members</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <input type="text" 
                       id="photoGallerySearch" 
                       placeholder="🔍 Search by customer name, device, or staff name..." 
                       onkeyup="filterPhotoGallery()" 
                       style="width:100%;padding:12px;border:1px solid #ddd;border-radius:5px;font-size:14px;">
            </div>

            <div style="margin-bottom:20px;">
                <label style="margin-right:15px;">
                    <strong>Filter by Staff:</strong>
                </label>
                <select id="techFilterSelect" onchange="filterPhotoGallery()" style="padding:8px;border:1px solid #ddd;border-radius:5px;font-size:14px;">
                    <option value="">All Staff (${techNames.length})</option>
                    ${techNames.map(techName => `
                        <option value="${techName}">${techName} (${photosByTech[techName].length})</option>
                    `).join('')}
                </select>
            </div>

            ${techNames.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📷</h2>
                    <p>No photos uploaded yet</p>
                </div>
            ` : `
                <div id="photoGalleryContent">
                    ${techNames.map(techName => {
        const photos = photosByTech[techName];
        return `
                            <div class="photo-gallery-section" data-tech="${techName}" style="margin-bottom:40px;">
                                <h3 style="background:#673ab7;color:white;padding:12px;border-radius:8px;margin-bottom:15px;">
                                    👤 ${techName} (${photos.length} photo${photos.length !== 1 ? 's' : ''})
                                </h3>
                                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;">
                                    ${photos.map(item => `
                                        <div class="photo-item" 
                                             data-customer="${item.customerName}" 
                                             data-device="${item.brand} ${item.model}"
                                             style="cursor:pointer;border:2px solid #ddd;border-radius:8px;overflow:hidden;background:white;box-shadow:0 2px 5px rgba(0,0,0,0.1);transition:transform 0.2s;"
                                             onmouseover="this.style.transform='scale(1.05)'"
                                             onmouseout="this.style.transform='scale(1)'"
                                             onclick="viewFullImage('${item.photo}', '${item.customerName} - ${item.brand} ${item.model}')">
                                            <img src="${item.photo}" 
                                                 alt="${item.customerName}" 
                                                 style="width:100%;height:200px;object-fit:cover;" />
                                            <div style="padding:10px;">
                                                <div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:3px;">
                                                    ${item.customerName}
                                                </div>
                                                <div style="font-size:13px;color:#666;margin-bottom:5px;">
                                                    ${item.brand} ${item.model}
                                                </div>
                                                <div style="font-size:12px;color:#999;">
                                                    ${utils.formatDate(item.receivedAt)}
                                                </div>
                                                <button onclick="event.stopPropagation();switchTab('all');setTimeout(() => { const search = document.getElementById('repairSearch'); if (search) { search.value = '${item.repairId}'; search.dispatchEvent(new Event('keyup')); } }, 300);" 
                                                        style="margin-top:8px;width:100%;padding:5px;background:#2196f3;color:white;border:none;border-radius:4px;font-size:12px;cursor:pointer;">
                                                    🔍 View Repair
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
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
 * Filter photo gallery by search and staff
 */
function filterPhotoGallery() {
    const searchTerm = document.getElementById('photoGallerySearch')?.value.toLowerCase() || '';
    const selectedTech = document.getElementById('techFilterSelect')?.value || '';

    const sections = document.querySelectorAll('.photo-gallery-section');

    sections.forEach(section => {
        const techName = section.getAttribute('data-tech');
        const items = section.querySelectorAll('.photo-item');

        // Check if section should be visible based on tech filter
        if (selectedTech && techName !== selectedTech) {
            section.style.display = 'none';
            return;
        }

        let visibleCount = 0;
        items.forEach(item => {
            const customer = item.getAttribute('data-customer').toLowerCase();
            const device = item.getAttribute('data-device').toLowerCase();

            if (searchTerm === '' || customer.includes(searchTerm) || device.includes(searchTerm)) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Hide section if no visible items
        section.style.display = visibleCount > 0 ? 'block' : 'none';
    });
}

/**
 * View full-size image in modal
 */
function viewFullImage(imageData, title) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.id = 'imageViewerModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    modal.innerHTML = `
        <div style="position:absolute;top:10px;right:10px;">
            <button onclick="closeImageViewer()" style="background:#fff;border:none;padding:10px 15px;border-radius:5px;cursor:pointer;font-size:18px;font-weight:bold;">
                ✕
            </button>
        </div>
        <div style="text-align:center;color:white;margin-bottom:15px;font-weight:bold;font-size:16px;">
            ${title}
        </div>
        <img src="${imageData}" alt="${title}" style="max-width:90%;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);" />
        <div style="margin-top:15px;">
            <button onclick="downloadImage('${imageData}', '${title}')" style="background:#2196f3;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-size:14px;margin-right:10px;">
                💾 Download
            </button>
            <button onclick="closeImageViewer()" style="background:#666;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-size:14px;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageViewer();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeImageViewer();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

/**
 * Close image viewer modal
 */
function closeImageViewer() {
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Download image
 */
function downloadImage(imageData, title) {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
window.buildBackJobReceptionTab = buildBackJobReceptionTab;
window.filterBackJobSearchResults = filterBackJobSearchResults;
window.populateReceiveSupplierDropdown = populateReceiveSupplierDropdown;
window.buildMyRequestsTab = buildMyRequestsTab;
window.buildRefundRequestsTab = buildRefundRequestsTab;
window.buildRefundedDevicesTab = buildRefundedDevicesTab;
window.filterRefundedDevices = filterRefundedDevices;
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
window.buildPhotoGalleryTab = buildPhotoGalleryTab;
window.filterPhotoGallery = filterPhotoGallery;
window.viewFullImage = viewFullImage;
window.closeImageViewer = closeImageViewer;
window.downloadImage = downloadImage;
window.renderClaimedButtons = renderClaimedButtons;
window.toggleRepairDetails = toggleRepairDetails;
window.buildDashboardTab = buildDashboardTab;
window.buildAllRepairsTab = buildAllRepairsTab;
window.filterAllRepairs = filterAllRepairs;
window.buildMyRepairsTab = buildMyRepairsTab;
window.buildMyClaimedDevicesTab = buildMyClaimedDevicesTab;
window.buildMyCompletedDevicesTab = buildMyCompletedDevicesTab;
window.buildPendingTab = buildPendingTab;
window.buildCashCountTab = buildCashCountTab;
window.updateCashCountDate = updateCashCountDate;
window.viewLockedDay = viewLockedDay;
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;
window.toggleBackJobFields = toggleBackJobFields;
window.calculatePreApprovedTotal = calculatePreApprovedTotal;
window.toggleAssignToTech = toggleAssignToTech;
window.toggleCompletionFields = toggleCompletionFields;
window.validateCompletionDates = validateCompletionDates;
window.togglePaymentFields = togglePaymentFields;
window.toggleGCashRef = toggleGCashRef;
window.toggleReleasedPaymentFields = toggleReleasedPaymentFields;
window.toggleReleasedGCashRef = toggleReleasedGCashRef;
window.toggleClaimedPaymentFields = toggleClaimedPaymentFields;
window.toggleClaimedGCashRef = toggleClaimedGCashRef;
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
            <div class="card alert-card-danger" style="margin:20px 0;">
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
                        
                        <div class="alert-card-danger" style="margin:10px 0;">
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
                                <div class="alert-card-success" style="padding:10px;margin-top:10px;font-size:13px;">
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
            <div class="card alert-card-success" style="margin:20px 0;">
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
        <div class="alert-card-info" style="padding:20px;margin:20px 0;">
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
                                        ${dateData.totalPartsCosts > 0 ? `
                                            <div style="display:flex;justify-content:space-between;margin:8px 0;font-size:13px;color:#f44336;">
                                                <span>🔧 Parts Costs:</span>
                                                <strong>-₱${dateData.totalPartsCosts.toFixed(2)}</strong>
                                            </div>
                                        ` : ''}
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
                                            <div class="alert-card-danger" style="margin-bottom:15px;">
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
                                                        <div class="alert-card-danger" style="padding:8px;margin-top:8px;">
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
                <div class="stat-card alert-card-info">
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
            <div class="stat-card alert-card-success">
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
            <div class="card alert-card-success" style="margin:20px 0;">
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

    // Filter data for selected technician (exclude deleted repairs)
    const techPayments = window.allRepairs
        .filter(r => !r.deleted && r.payments && r.payments.some(p => p.receivedById === selectedTech.id))
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
            <div class="stat-card alert-card-success">
                <h3>₱${totalCollected.toFixed(2)}</h3>
                <p>💰 Total Collected</p>
                <small>${techPayments.length} payment(s)</small>
            </div>
            <div class="stat-card alert-card-danger">
                <h3>₱${totalExpenses.toFixed(2)}</h3>
                <p>💸 Total Expenses</p>
                <small>${techExpenses.length} expense(s)</small>
            </div>
            <div class="stat-card alert-card-info">
                <h3>₱${totalRemitted.toFixed(2)}</h3>
                <p>✅ Total Remitted</p>
                <small>${techRemittances.filter(r => r.status === 'approved').length} approved</small>
            </div>
            <div class="stat-card alert-card-warning">
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
                <div class="table-responsive" style="max-height:400px;overflow-y:auto;">
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
                <div class="table-responsive" style="max-height:400px;overflow-y:auto;">
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
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
            <table class="repair-table" id="inventoryTable" style="min-width:100%;">
                <thead>
                    <tr>
                        <th style="min-width:150px;">Part Name</th>
                        <th style="min-width:120px;">Part Number</th>
                        <th style="min-width:100px;">Category</th>
                        <th style="min-width:120px;">Brand/Model</th>
                        <th style="min-width:100px;">Quantity</th>
                        <th style="min-width:90px;">Min Stock</th>
                        <th style="min-width:100px;">Unit Cost</th>
                        <th style="min-width:110px;">Selling Price</th>
                        <th style="min-width:110px;">Total Value</th>
                        <th style="min-width:150px;position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">Actions</th>
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
                    <td style="position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">
                        <div style="display:flex;gap:5px;flex-wrap:nowrap;">
                            <button onclick="adjustStockModal('${item.id}')" class="btn-small" title="Adjust Stock" style="white-space:nowrap;">
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
                        </div>
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
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <h4 style="margin:0;flex:1;">${supplier.supplierName}</h4>
                        ${supplier.paymentType ? `
                            <span style="background:${supplier.paymentType === 'shop_inventory' ? '#4caf50' :
                supplier.paymentType === 'tech_pays_cod' ? '#ff9800' :
                    '#2196f3'
            };color:white;padding:4px 10px;border-radius:4px;font-size:0.85em;font-weight:500;">
                                ${supplier.paymentType === 'shop_inventory' ? '💰 Shop' :
                supplier.paymentType === 'tech_pays_cod' ? '💵 COD' :
                    '📅 Later'
            }
                            </span>
                        ` : '<span style="color:#f44336;font-size:0.85em;font-weight:500;">⚠️ Unclassified</span>'}
                    </div>
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
            
            ${window.currentUserData.role === 'admin' ? `
                <div class="form-group">
                    <label>Payment Type <span style="color:red;">*</span></label>
                    <select name="paymentType" required>
                        <option value="">Select payment type</option>
                        <option value="shop_inventory">💰 Shop Inventory (Boss Nado) - Payment to shop/admin</option>
                        <option value="tech_pays_cod">💵 Technician Pays COD - Auto-deducts from remittance</option>
                        <option value="shop_pays_later">📅 Shop Pays Later - Accounts payable</option>
                    </select>
                    <small style="color:#666;">How should parts purchases from this supplier be handled?</small>
                </div>
            ` : ''}
            
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
        notes: formData.get('notes'),
        paymentType: formData.get('paymentType') || ''
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

    // Handle both old and new data structures
    const supplierName = supplier.supplierName || supplier.name || '';

    container.innerHTML = `
        <form onsubmit="submitEditSupplier(event, '${supplierId}')" id="editSupplierForm" style="padding:15px;background:var(--bg-hover);border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 15px;">Edit Supplier</h4>
            
            <div class="form-group">
                <label>Supplier Name *</label>
                <input type="text" name="supplierName" required value="${supplierName}">
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
            
            ${window.currentUserData.role === 'admin' ? `
                <div class="form-group">
                    <label>Payment Type <span style="color:red;">*</span></label>
                    <select name="paymentType" required>
                        <option value="">Select payment type</option>
                        <option value="shop_inventory" ${supplier.paymentType === 'shop_inventory' ? 'selected' : ''}>💰 Shop Inventory (Boss Nado) - Payment to shop/admin</option>
                        <option value="tech_pays_cod" ${supplier.paymentType === 'tech_pays_cod' ? 'selected' : ''}>💵 Technician Pays COD - Auto-deducts from remittance</option>
                        <option value="shop_pays_later" ${supplier.paymentType === 'shop_pays_later' ? 'selected' : ''}>📅 Shop Pays Later - Accounts payable</option>
                    </select>
                    <small style="color:#666;">How should parts purchases from this supplier be handled?</small>
                    <small style="color:#ff9800;display:block;margin-top:5px;">⚠️ Payment type changes only affect future repairs. Existing repairs remain unchanged.</small>
                </div>
            ` : ''}
            
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
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                <div>
                    <h2>📊 Analytics & Reports</h2>
                    <p>Comprehensive business intelligence and reporting</p>
                </div>
                ${window.currentUserData.role === 'admin' ? `
                    <button onclick="openCommissionAdjustmentModal()" class="btn-primary" style="height:fit-content;">
                        💰 Adjust Commissions
                    </button>
                ` : ''}
            </div>
        </div>
        
        <!-- Date Range Selector -->
        <div class="analytics-controls" style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Start Date</label>
                    <input type="date" id="analyticsStartDate" value="${startDate.toISOString().split('T')[0]}" 
                           style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-white);color:var(--text-primary);">
                </div>
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:600;">End Date</label>
                    <input type="date" id="analyticsEndDate" value="${endDate.toISOString().split('T')[0]}"
                           style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-white);color:var(--text-primary);">
                </div>
                <div style="grid-column:1/-1;">
                    <div style="display:flex;gap:5px;flex-wrap:wrap;">
                        <button onclick="updateAnalyticsDateRange()" class="btn-primary" style="flex:1;min-width:80px;">Apply</button>
                        <button onclick="setQuickDateRange('7days')" class="btn-secondary" style="flex:1;min-width:80px;">7 Days</button>
                        <button onclick="setQuickDateRange('30days')" class="btn-secondary" style="flex:1;min-width:80px;">30 Days</button>
                        <button onclick="setQuickDateRange('thisMonth')" class="btn-secondary" style="flex:1;min-width:80px;">Month</button>
                    </div>
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
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px;">
                <h3 style="margin:0;">📊 Revenue by Repair Type</h3>
                <button onclick="exportRevenueByType()" class="btn-small">📥 Export CSV</button>
            </div>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                <table class="repair-table" style="min-width:400px;">
                    <thead>
                        <tr>
                            <th style="min-width:150px;">Repair Type</th>
                            <th style="min-width:120px;">Revenue</th>
                            <th style="min-width:100px;">% of Total</th>
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
            <div class="table-responsive">
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
        
        <!-- Back Job Analytics Section -->
        ${buildBackJobAnalyticsSection(startDate, endDate)}
        
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
            <div class="table-responsive">
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
            <div class="table-responsive">
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
            <div class="table-responsive">
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

/**
 * Build Back Job Analytics Section
 * Shows back job rate per technician, trends, and drill-down details
 */
function buildBackJobAnalyticsSection(startDate, endDate) {
    // Get all back jobs in date range
    const backJobs = window.allRepairs.filter(r =>
        r.isBackJob &&
        r.receivedAt &&
        new Date(r.receivedAt) >= startDate &&
        new Date(r.receivedAt) <= endDate &&
        !r.deleted
    );

    // Get all completed repairs in date range (for rate calculation)
    const completedRepairs = window.allRepairs.filter(r =>
        (r.status === 'Claimed' || r.status === 'Completed') &&
        r.claimedAt &&
        new Date(r.claimedAt) >= startDate &&
        new Date(r.claimedAt) <= endDate &&
        !r.deleted &&
        !r.isBackJob
    );

    // Calculate stats per technician
    const techStats = {};

    // Count completed repairs per tech
    completedRepairs.forEach(r => {
        if (r.acceptedByName) {
            if (!techStats[r.acceptedByName]) {
                techStats[r.acceptedByName] = {
                    name: r.acceptedByName,
                    techId: r.acceptedBy,
                    completedRepairs: 0,
                    backJobs: 0,
                    backJobRate: 0,
                    backJobList: []
                };
            }
            techStats[r.acceptedByName].completedRepairs++;
        }
    });

    // Count back jobs per tech
    backJobs.forEach(r => {
        if (r.originalTechName) {
            if (!techStats[r.originalTechName]) {
                techStats[r.originalTechName] = {
                    name: r.originalTechName,
                    techId: r.originalTechId,
                    completedRepairs: 0,
                    backJobs: 0,
                    backJobRate: 0,
                    backJobList: []
                };
            }
            techStats[r.originalTechName].backJobs++;
            techStats[r.originalTechName].backJobList.push(r);
        }
    });

    // Calculate back job rates
    Object.values(techStats).forEach(tech => {
        if (tech.completedRepairs > 0) {
            tech.backJobRate = (tech.backJobs / tech.completedRepairs) * 100;
        }
    });

    // Sort technicians by back job count (descending)
    const sortedTechs = Object.values(techStats)
        .filter(t => t.completedRepairs > 0 || t.backJobs > 0)
        .sort((a, b) => b.backJobs - a.backJobs);

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    window.allRepairs.filter(r =>
        r.isBackJob &&
        r.receivedAt &&
        new Date(r.receivedAt) >= sixMonthsAgo &&
        !r.deleted
    ).forEach(r => {
        const monthKey = new Date(r.receivedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    const totalBackJobs = backJobs.length;
    const totalCompleted = completedRepairs.length;
    const overallRate = totalCompleted > 0 ? (totalBackJobs / totalCompleted * 100) : 0;

    return `
        <!-- Back Job Quality Metrics -->
        <h3 style="margin:25px 0 15px;">🔄 Back Job Quality Metrics</h3>
        
        <!-- Summary Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
            <div class="stat-card" style="background:${totalBackJobs > 0 ? 'linear-gradient(135deg,#ff9800 0%,#f44336 100%)' : 'linear-gradient(135deg,#4caf50 0%,#66bb6a 100%)'};color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Back Jobs</div>
                <div style="font-size:32px;font-weight:bold;">${totalBackJobs}</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">in date range</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#2196f3 0%,#1976d2 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Back Job Rate</div>
                <div style="font-size:32px;font-weight:bold;">${overallRate.toFixed(1)}%</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">${totalBackJobs} / ${totalCompleted} completed</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#9c27b0 0%,#7b1fa2 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Active Technicians</div>
                <div style="font-size:32px;font-weight:bold;">${sortedTechs.length}</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">with repairs tracked</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#00bcd4 0%,#0097a7 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Avg per Tech</div>
                <div style="font-size:32px;font-weight:bold;">${sortedTechs.length > 0 ? (totalBackJobs / sortedTechs.length).toFixed(1) : 0}</div>
                <div style="font-size:12px;opacity:0.8;margin-top:5px;">back jobs</div>
            </div>
        </div>
        
        ${totalBackJobs === 0 ? `
            <div class="alert-card-success" style="padding:20px;text-align:center;margin-bottom:25px;">
                <h2 style="color:#4caf50;font-size:48px;margin:0;">✅</h2>
                <h4 style="margin:10px 0;color:#2e7d32;">Excellent Quality!</h4>
                <p style="color:#666;margin:5px 0;">No back jobs recorded in this period. Keep up the great work!</p>
            </div>
        ` : `
            <!-- Back Job Rate per Technician -->
            <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h4 style="margin:0;">📊 Back Job Rate by Technician</h4>
                    <button onclick="exportBackJobAnalytics()" class="btn-small">📥 Export CSV</button>
                </div>
                <p style="color:#666;font-size:14px;margin-bottom:15px;">
                    Lower rates indicate better repair quality. Industry standard: <5% is excellent, 5-10% is acceptable, >10% needs attention.
                </p>
                <div class="table-responsive">
                    <table class="repair-table">
                        <thead>
                            <tr>
                                <th>Technician</th>
                                <th>Completed Repairs</th>
                                <th>Back Jobs</th>
                                <th>Back Job Rate</th>
                                <th>Quality Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedTechs.map(tech => {
        const rateColor = tech.backJobRate < 5 ? '#4caf50' :
            tech.backJobRate < 10 ? '#ff9800' : '#f44336';
        const rating = tech.backJobRate < 5 ? '⭐ Excellent' :
            tech.backJobRate < 10 ? '⚠️ Acceptable' : '❌ Needs Attention';
        return `
                                    <tr>
                                        <td><strong>${tech.name}</strong></td>
                                        <td>${tech.completedRepairs}</td>
                                        <td>${tech.backJobs}</td>
                                        <td><span style="color:${rateColor};font-weight:bold;font-size:16px;">${tech.backJobRate.toFixed(1)}%</span></td>
                                        <td><span style="color:${rateColor};">${rating}</span></td>
                                        <td>
                                            ${tech.backJobs > 0 ? `
                                                <button onclick="showBackJobDetails('${tech.techId}')" class="btn-small">
                                                    📋 View Details (${tech.backJobs})
                                                </button>
                                            ` : '<span style="color:#4caf50;">✓ No back jobs</span>'}
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Monthly Trend -->
            ${Object.keys(monthlyTrend).length > 0 ? `
                <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:25px;">
                    <h4 style="margin:0 0 15px;">📈 Back Job Trend (Last 6 Months)</h4>
                    <div style="display:flex;gap:10px;align-items:end;height:200px;padding:20px;background:var(--bg-white);border-radius:8px;">
                        ${Object.entries(monthlyTrend)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .map(([month, count]) => {
                    const maxCount = Math.max(...Object.values(monthlyTrend));
                    const height = (count / maxCount * 150);
                    return `
                                    <div style="flex:1;text-align:center;">
                                        <div style="background:#ff9800;height:${height}px;border-radius:4px 4px 0 0;margin-bottom:5px;position:relative;">
                                            <span style="position:absolute;top:-25px;left:50%;transform:translateX(-50%);font-weight:bold;color:#f44336;">${count}</span>
                                        </div>
                                        <div style="font-size:11px;color:#666;transform:rotate(-45deg);margin-top:20px;">${month}</div>
                                    </div>
                                `;
                }).join('')}
                    </div>
                </div>
            ` : ''}
        `}
    `;
}

/**
 * Show back job details for specific technician
 */
function showBackJobDetails(techId) {
    const tech = Object.values(window.allUsers || {}).find(u => u.uid === techId);
    const techName = tech ? tech.displayName : 'Unknown';

    const backJobs = window.allRepairs.filter(r =>
        r.isBackJob &&
        r.originalTechId === techId &&
        !r.deleted
    ).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

    if (backJobs.length === 0) {
        alert('No back jobs found for this technician.');
        return;
    }

    const modalContent = `
        <div style="max-height:70vh;overflow-y:auto;">
            <h3 style="margin:0 0 20px;">🔄 Back Jobs - ${techName}</h3>
            <p style="color:#666;margin-bottom:20px;">Total: ${backJobs.length} back job(s)</p>
            
            ${backJobs.map(r => {
        const originalRepair = window.allRepairs.find(orig => orig.id === r.originalRepairId);
        return `
                    <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-bottom:15px;border-left:4px solid #f44336;">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                            <div>
                                <h4 style="margin:0 0 5px;">${r.customerName}</h4>
                                <p style="margin:0;font-size:14px;color:#666;">
                                    📱 ${r.brand} ${r.model}<br>
                                    📅 Received: ${utils.formatDate(r.receivedAt)}<br>
                                    ${originalRepair ? `🔧 Original Completed: ${utils.formatDate(originalRepair.claimedAt)}` : ''}
                                </p>
                            </div>
                            <button onclick="viewRepairDetails('${r.id}')" class="btn-small">View Details</button>
                        </div>
                        <div style="background:white;padding:10px;border-radius:5px;margin-top:10px;">
                            <strong>Reason for Return:</strong><br>
                            <em style="color:#666;">${r.backJobReason || 'No reason provided'}</em>
                        </div>
                        ${originalRepair ? `
                            <div style="margin-top:10px;font-size:13px;color:#666;">
                                <strong>Original Repair:</strong> ${originalRepair.repairType || 'N/A'} • 
                                ₱${(originalRepair.total || 0).toFixed(2)} • 
                                <a href="#" onclick="viewRepairDetails('${originalRepair.id}'); return false;">View Original</a>
                            </div>
                        ` : ''}
                    </div>
                `;
    }).join('')}
        </div>
        <div style="margin-top:20px;text-align:right;">
            <button onclick="this.closest('.modal').style.display='none'" class="btn-secondary">Close</button>
        </div>
    `;

    // Create temporary modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `<div class="modal-content" style="max-width:700px;">${modalContent}</div>`;
    document.body.appendChild(modal);

    // Remove modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Export back job analytics to CSV
 */
function exportBackJobAnalytics() {
    const startDate = window.analyticsDateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = window.analyticsDateRange?.end || new Date();

    const backJobs = window.allRepairs.filter(r =>
        r.isBackJob &&
        r.receivedAt &&
        new Date(r.receivedAt) >= startDate &&
        new Date(r.receivedAt) <= endDate &&
        !r.deleted
    );

    const data = backJobs.map(r => ({
        'Repair ID': r.id,
        'Customer': r.customerName,
        'Device': `${r.brand} ${r.model}`,
        'Original Tech': r.originalTechName || 'N/A',
        'Received Date': utils.formatDate(r.receivedAt),
        'Reason': r.backJobReason || 'N/A',
        'Status': r.status,
        'Original Repair ID': r.originalRepairId || 'N/A'
    }));

    exportToCSV(data, 'back_job_analytics');
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
window.showBackJobDetails = showBackJobDetails;
window.exportBackJobAnalytics = exportBackJobAnalytics;

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
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end;">
                    <div>
                        <label>Start Date</label>
                        <input type="date" id="profitStartDate" value="${startStr}" class="form-control">
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="date" id="profitEndDate" value="${endStr}" class="form-control">
                    </div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap;">
                        <button onclick="refreshProfitDashboard()" class="btn btn-primary" style="flex:1;min-width:100px;">
                            🔄 Refresh
                        </button>
                        <button onclick="exportCurrentProfitReport()" class="btn btn-success" style="flex:1;min-width:100px;">
                            📊 Export
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
                    ${dashboard.summary.commissionByTech && Object.keys(dashboard.summary.commissionByTech).length > 0 ? `
                        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.3);font-size:11px;">
                            ${Object.entries(dashboard.summary.commissionByTech).map(([tech, amt]) =>
            `<div style="display:flex;justify-content:space-between;margin:3px 0;">
                                    <span>${tech}:</span>
                                    <span style="font-weight:bold;">₱${amt.toFixed(2)}</span>
                                </div>`
        ).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="stat-card" style="background:linear-gradient(135deg,#30cfd0 0%,#330867 100%);color:white;">
                    <div class="stat-label">Overhead (Total Period)</div>
                    <div class="stat-value">₱${dashboard.summary.totalOverhead.toFixed(2)}</div>
                    <div class="stat-sublabel">${dashboard.summary.repairCount > 0 ? '₱' + (dashboard.summary.totalOverhead / dashboard.summary.repairCount).toFixed(2) + ' avg per repair' : 'No repairs'}</div>
                    ${dashboard.summary.overheadByType ? `
                        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.3);font-size:11px;">
                            <div style="display:flex;justify-content:space-between;margin:3px 0;">
                                <span>🏪 Shop:</span>
                                <span style="font-weight:bold;">₱${dashboard.summary.overheadByType.shop.toFixed(2)}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin:3px 0;">
                                <span>🏠 House:</span>
                                <span style="font-weight:bold;">₱${dashboard.summary.overheadByType.house.toFixed(2)}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin:3px 0;">
                                <span>� Loans:</span>
                                <span style="font-weight:bold;">₱${dashboard.summary.overheadByType.loans.toFixed(2)}</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin:3px 0;">
                                <span>�📝 Misc:</span>
                                <span style="font-weight:bold;">₱${dashboard.summary.overheadByType.miscellaneous.toFixed(2)}</span>
                            </div>
                        </div>
                    ` : ''}
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
                <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <table class="repairs-table" style="min-width:100%;">
                        <thead>
                            <tr>
                                <th style="min-width:150px;">Repair Type</th>
                                <th style="min-width:80px;">Count</th>
                                <th style="min-width:120px;">Revenue</th>
                                <th style="min-width:140px;">Shop Revenue (60%)</th>
                                <th style="min-width:100px;">Margin</th>
                                <th style="min-width:120px;">Avg Shop Rev</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(dashboard.byType.byType).map(([type, data]) => `
                                <tr>
                                    <td><strong>${type}</strong></td>
                                    <td>${data.count}</td>
                                    <td style="white-space:nowrap;">₱${data.totalRevenue.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;white-space:nowrap;">
                                        ₱${data.totalNetProfit.toFixed(2)}
                                    </td>
                                    <td>
                                        <span style="background:${data.avgProfitMargin >= 50 ? '#4caf50' : data.avgProfitMargin >= 40 ? '#ff9800' : '#f44336'};
                                                     color:white;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:bold;white-space:nowrap;">
                                            ${data.avgProfitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td style="white-space:nowrap;">₱${data.avgProfit.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- PROFIT BY TECHNICIAN -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">👨‍🔧 Profit by Technician</h4>
                <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <table class="repairs-table" style="min-width:100%;">
                        <thead>
                            <tr>
                                <th style="min-width:150px;">Technician</th>
                                <th style="min-width:80px;">Repairs</th>
                                <th style="min-width:120px;">Revenue</th>
                                <th style="min-width:140px;">Shop Revenue (60%)</th>
                                <th style="min-width:100px;">Margin</th>
                                <th style="min-width:120px;">Avg Shop Rev</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(dashboard.byTechnician).map(([tech, data]) => `
                                <tr>
                                    <td><strong>${tech}</strong></td>
                                    <td>${data.repairCount}</td>
                                    <td style="white-space:nowrap;">₱${data.totalRevenue.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;white-space:nowrap;">
                                        ₱${data.totalNetProfit.toFixed(2)}
                                    </td>
                                    <td>
                                        <span style="background:${data.avgProfitMargin >= 50 ? '#4caf50' : data.avgProfitMargin >= 40 ? '#ff9800' : '#f44336'};
                                                     color:white;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:bold;white-space:nowrap;">
                                            ${data.avgProfitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td style="white-space:nowrap;">₱${data.avgProfit.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- PROFIT TRENDS -->
            <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 15px;">📈 Daily Profit Trends</h4>
                <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                    <table class="repairs-table" style="min-width:100%;">
                        <thead>
                            <tr>
                                <th style="min-width:100px;">Date</th>
                                <th style="min-width:80px;">Repairs</th>
                                <th style="min-width:120px;">Revenue</th>
                                <th style="min-width:140px;">Parts + Commission</th>
                                <th style="min-width:140px;">Shop Revenue</th>
                                <th style="min-width:100px;">Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dashboard.trends.map(trend => `
                                <tr>
                                    <td style="white-space:nowrap;">${utils.formatDate(new Date(trend.period))}</td>
                                    <td>${trend.repairCount}</td>
                                    <td style="white-space:nowrap;">₱${trend.totalRevenue.toFixed(2)}</td>
                                    <td style="white-space:nowrap;">₱${trend.totalCosts.toFixed(2)}</td>
                                    <td style="color:#4caf50;font-weight:bold;white-space:nowrap;">
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
    console.log('📊 window.overheadExpenses:', window.overheadExpenses);
    console.log('📊 Total expenses:', window.overheadExpenses ? window.overheadExpenses.length : 0);

    window.currentTabRefresh = () => buildOverheadExpensesTab(container);

    // Get current month expenses
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthExpenses = (window.overheadExpenses || []).filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd && !exp.deleted;
    });

    console.log('📊 Month expenses:', monthExpenses.length, 'out of', (window.overheadExpenses || []).length);

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
                <div style="display:grid;grid-template-columns:1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Expense Type *</label>
                        <select id="overheadExpenseType" class="form-control" onchange="updateOverheadCategories()">
                            <option value="Shop">🏪 Shop Expense</option>
                            <option value="House">🏠 House Expense</option>
                            <option value="Loans">💳 Loans/Credit</option>
                            <option value="Miscellaneous">📝 Miscellaneous Expense</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Category *</label>
                        <select id="overheadCategory" class="form-control">
                            <!-- Shop categories -->
                            <option value="Rent" data-type="Shop">🏢 Rent</option>
                            <option value="Utilities" data-type="Shop">⚡ Utilities (Electric, Water)</option>
                            <option value="Salaries" data-type="Shop">👥 Salaries</option>
                            <option value="Equipment" data-type="Shop">🔧 Equipment</option>
                            <option value="Marketing" data-type="Shop">📢 Marketing</option>
                            <option value="Insurance" data-type="Shop">🛡️ Insurance</option>
                            <option value="Supplies" data-type="Shop">📦 Supplies</option>
                            <option value="Maintenance" data-type="Shop">🔨 Maintenance</option>
                            <!-- House categories -->
                            <option value="Groceries" data-type="House">🛒 Groceries</option>
                            <option value="Food" data-type="House">🍽️ Food/Dining</option>
                            <option value="House Utilities" data-type="House">💡 House Utilities</option>
                            <option value="House Rent" data-type="House">🏠 House Rent</option>
                            <option value="Healthcare" data-type="House">⚕️ Healthcare</option>
                            <option value="Education" data-type="House">🎓 Education</option>
                            <option value="Personal Care" data-type="House">💆 Personal Care</option>
                            <option value="Clothing" data-type="House">👕 Clothing</option>
                            <option value="House Maintenance" data-type="House">🔧 House Maintenance</option>
                            <!-- Loans categories -->
                            <option value="Credit Card" data-type="Loans">💳 Credit Card Payment</option>
                            <option value="Personal Loan" data-type="Loans">💵 Personal Loan</option>
                            <option value="Car Loan" data-type="Loans">🚗 Car Loan</option>
                            <option value="Home Loan" data-type="Loans">🏡 Home Loan/Mortgage</option>
                            <option value="Business Loan" data-type="Loans">💼 Business Loan</option>
                            <option value="SSS Loan" data-type="Loans">🏦 SSS Loan</option>
                            <option value="Pag-IBIG Loan" data-type="Loans">🏦 Pag-IBIG Loan</option>
                            <option value="Cooperative Loan" data-type="Loans">🤝 Cooperative Loan</option>
                            <!-- Miscellaneous categories -->
                            <option value="Transportation" data-type="Miscellaneous">🚗 Transportation</option>
                            <option value="Entertainment" data-type="Miscellaneous">🎬 Entertainment</option>
                            <option value="Gifts" data-type="Miscellaneous">🎁 Gifts/Donations</option>
                            <option value="Travel" data-type="Miscellaneous">✈️ Travel</option>
                            <option value="Subscriptions" data-type="Miscellaneous">📱 Subscriptions</option>
                            <option value="Other" data-type="Miscellaneous">📝 Other</option>
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
                
                ${(() => {
            const byType = {};
            monthExpenses.forEach(exp => {
                const type = exp.expenseType || 'Miscellaneous';
                if (!byType[type]) byType[type] = 0;
                byType[type] += exp.amount;
            });
            return Object.keys(byType).length > 0 ? `
                        <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.3);">
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
                                ${Object.entries(byType).map(([type, amt]) => {
                const icon = type === 'Shop' ? '🏪' : type === 'House' ? '🏠' : type === 'Loans' ? '💳' : '📝';
                return `
                                        <div>
                                            <div style="font-size:12px;opacity:0.9;">${icon} ${type}</div>
                                            <div style="font-size:18px;font-weight:bold;">₱${amt.toFixed(2)}</div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    ` : '';
        })()}
                
                ${Object.keys(byCategory).length > 0 ? `
                    <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.3);">
                        <div style="font-size:12px;opacity:0.8;margin-bottom:10px;">By Category:</div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;">
                            ${Object.entries(byCategory).map(([cat, amt]) => `
                                <div>
                                    <div style="font-size:11px;opacity:0.9;">${cat}</div>
                                    <div style="font-size:14px;font-weight:bold;">₱${amt.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- EXPENSE LISTS BY TYPE -->
            ${(() => {
            const allExpenses = (window.overheadExpenses || []).filter(e => !e.deleted);
            const shopExpenses = allExpenses.filter(e => (e.expenseType || 'Miscellaneous') === 'Shop');
            const houseExpenses = allExpenses.filter(e => (e.expenseType || 'Miscellaneous') === 'House');
            const loanExpenses = allExpenses.filter(e => (e.expenseType || 'Miscellaneous') === 'Loans');
            const miscExpenses = allExpenses.filter(e => (e.expenseType || 'Miscellaneous') === 'Miscellaneous');

            return `
                    <!-- SHOP EXPENSES -->
                    <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                        <h4 style="margin:0 0 15px;">🏪 Shop Expenses (${shopExpenses.length})</h4>
                        ${shopExpenses.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#999;">
                                No shop expenses recorded
                            </div>
                        ` : `
                    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                                <table class="repairs-table" style="min-width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="min-width:100px;">Date</th>
                                            <th style="min-width:120px;">Category</th>
                                            <th style="min-width:100px;">Amount</th>
                                            <th style="min-width:80px;">Recurring</th>
                                            <th style="min-width:150px;">Description</th>
                                            <th style="min-width:150px;position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${shopExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => `
                                            <tr>
                                                <td style="white-space:nowrap;">${utils.formatDate(new Date(exp.date))}</td>
                                                <td><strong>${exp.category}</strong></td>
                                                <td style="font-weight:bold;color:#2196f3;white-space:nowrap;">₱${exp.amount.toFixed(2)}</td>
                                                <td>${exp.recurringFrequency ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;white-space:nowrap;">${exp.recurringFrequency}</span>` : '-'}</td>
                                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${exp.description || exp.notes || '-'}</td>
                                                <td style="position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">
                                                    <div style="display:flex;gap:5px;flex-wrap:nowrap;">
                                                        <button onclick="openEditOverheadModal('${exp.id}')" class="btn btn-secondary btn-sm" style="white-space:nowrap;">✏️ Edit</button>
                                                        <button onclick="deleteOverheadExpenseById('${exp.id}')" class="btn btn-danger btn-sm" style="white-space:nowrap;">🗑️ Del</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                    
                    <!-- HOUSE EXPENSES -->
                    <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                        <h4 style="margin:0 0 15px;">🏠 House Expenses (${houseExpenses.length})</h4>
                        ${houseExpenses.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#999;">
                                No house expenses recorded
                            </div>
                        ` : `
                            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                                <table class="repairs-table" style="min-width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="min-width:100px;">Date</th>
                                            <th style="min-width:120px;">Category</th>
                                            <th style="min-width:100px;">Amount</th>
                                            <th style="min-width:80px;">Recurring</th>
                                            <th style="min-width:150px;">Description</th>
                                            <th style="min-width:150px;position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${houseExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => `
                                            <tr>
                                                <td style="white-space:nowrap;">${utils.formatDate(new Date(exp.date))}</td>
                                                <td><strong>${exp.category}</strong></td>
                                                <td style="font-weight:bold;color:#ff9800;white-space:nowrap;">₱${exp.amount.toFixed(2)}</td>
                                                <td>${exp.recurringFrequency ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;white-space:nowrap;">${exp.recurringFrequency}</span>` : '-'}</td>
                                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${exp.description || exp.notes || '-'}</td>
                                                <td style="position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">
                                                    <div style="display:flex;gap:5px;flex-wrap:nowrap;">
                                                        <button onclick="openEditOverheadModal('${exp.id}')" class="btn btn-secondary btn-sm" style="white-space:nowrap;">✏️ Edit</button>
                                                        <button onclick="deleteOverheadExpenseById('${exp.id}')" class="btn btn-danger btn-sm" style="white-space:nowrap;">🗑️ Del</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                    
                    <!-- LOANS/CREDIT EXPENSES -->
                    <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px;">
                        <h4 style="margin:0 0 15px;">💳 Loans/Credit Expenses (${loanExpenses.length})</h4>
                        ${loanExpenses.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#999;">
                                No loan/credit expenses recorded
                            </div>
                        ` : `
                            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                                <table class="repairs-table" style="min-width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="min-width:100px;">Date</th>
                                            <th style="min-width:120px;">Category</th>
                                            <th style="min-width:100px;">Amount</th>
                                            <th style="min-width:80px;">Recurring</th>
                                            <th style="min-width:150px;">Description</th>
                                            <th style="min-width:150px;position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${loanExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => `
                                            <tr>
                                                <td style="white-space:nowrap;">${utils.formatDate(new Date(exp.date))}</td>
                                                <td><strong>${exp.category}</strong></td>
                                                <td style="font-weight:bold;color:#e91e63;white-space:nowrap;">₱${exp.amount.toFixed(2)}</td>
                                                <td>${exp.recurringFrequency ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;white-space:nowrap;">${exp.recurringFrequency}</span>` : '-'}</td>
                                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${exp.description || exp.notes || '-'}</td>
                                                <td style="position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">
                                                    <div style="display:flex;gap:5px;flex-wrap:nowrap;">
                                                        <button onclick="openEditOverheadModal('${exp.id}')" class="btn btn-secondary btn-sm" style="white-space:nowrap;">✏️ Edit</button>
                                                        <button onclick="deleteOverheadExpenseById('${exp.id}')" class="btn btn-danger btn-sm" style="white-space:nowrap;">🗑️ Del</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                    
                    <!-- MISCELLANEOUS EXPENSES -->
                    <div style="background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <h4 style="margin:0 0 15px;">📝 Miscellaneous Expenses (${miscExpenses.length})</h4>
                        ${miscExpenses.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:#999;">
                                No miscellaneous expenses recorded
                            </div>
                        ` : `
                            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                                <table class="repairs-table" style="min-width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="min-width:100px;">Date</th>
                                            <th style="min-width:120px;">Category</th>
                                            <th style="min-width:100px;">Amount</th>
                                            <th style="min-width:80px;">Recurring</th>
                                            <th style="min-width:150px;">Description</th>
                                            <th style="min-width:150px;position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${miscExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => `
                                            <tr>
                                                <td style="white-space:nowrap;">${utils.formatDate(new Date(exp.date))}</td>
                                                <td><strong>${exp.category}</strong></td>
                                                <td style="font-weight:bold;color:#9c27b0;white-space:nowrap;">₱${exp.amount.toFixed(2)}</td>
                                                <td>${exp.recurringFrequency ? `<span style="background:#4caf50;color:white;padding:2px 6px;border-radius:3px;font-size:11px;white-space:nowrap;">${exp.recurringFrequency}</span>` : '-'}</td>
                                                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${exp.description || exp.notes || '-'}</td>
                                                <td style="position:sticky;right:0;background:white;box-shadow:-2px 0 4px rgba(0,0,0,0.05);">
                                                    <div style="display:flex;gap:5px;flex-wrap:nowrap;">
                                                        <button onclick="openEditOverheadModal('${exp.id}')" class="btn btn-secondary btn-sm" style="white-space:nowrap;">✏️ Edit</button>
                                                        <button onclick="deleteOverheadExpenseById('${exp.id}')" class="btn btn-danger btn-sm" style="white-space:nowrap;">🗑️ Del</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                `;
        })()}
            </div>
        </div>
    `;
}

function saveOverheadExpense() {
    const expenseType = document.getElementById('overheadExpenseType').value;
    const category = document.getElementById('overheadCategory').value;
    const amount = parseFloat(document.getElementById('overheadAmount').value);
    const date = document.getElementById('overheadDate').value;
    const recurring = document.getElementById('overheadRecurring').value;
    const description = document.getElementById('overheadDescription').value.trim();

    if (!expenseType || !category || !amount || amount <= 0 || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const expense = {
        expenseType: expenseType,
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

function openEditOverheadModal(expenseId) {
    const expense = (window.overheadExpenses || []).find(e => e.id === expenseId);
    if (!expense) {
        alert('Expense not found');
        return;
    }

    // Populate modal fields
    document.getElementById('editOverheadId').value = expense.id;
    document.getElementById('editOverheadExpenseType').value = expense.expenseType || 'Miscellaneous';
    document.getElementById('editOverheadCategory').value = expense.category || '';
    document.getElementById('editOverheadAmount').value = expense.amount || '';

    // Convert ISO date to YYYY-MM-DD format for input
    const dateStr = expense.date ? expense.date.split('T')[0] : '';
    document.getElementById('editOverheadDate').value = dateStr;

    document.getElementById('editOverheadRecurring').value = expense.recurringFrequency || '';
    document.getElementById('editOverheadDescription').value = expense.description || expense.notes || '';

    // Filter categories based on expense type
    updateEditOverheadCategories();
    // Re-set the category value after filtering
    document.getElementById('editOverheadCategory').value = expense.category || '';

    // Show modal
    document.getElementById('editOverheadModal').style.display = 'flex';
}

function closeEditOverheadModal() {
    document.getElementById('editOverheadModal').style.display = 'none';
}

function saveEditedOverheadExpense() {
    const expenseId = document.getElementById('editOverheadId').value;
    const expenseType = document.getElementById('editOverheadExpenseType').value;
    const category = document.getElementById('editOverheadCategory').value;
    const amount = parseFloat(document.getElementById('editOverheadAmount').value);
    const date = document.getElementById('editOverheadDate').value;
    const recurring = document.getElementById('editOverheadRecurring').value;
    const description = document.getElementById('editOverheadDescription').value.trim();

    if (!expenseType || !category || !amount || amount <= 0 || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const updates = {
        expenseType: expenseType,
        category: category,
        amount: amount,
        date: date + 'T00:00:00.000Z',
        isRecurring: recurring ? true : false,
        recurringFrequency: recurring || null,
        description: description,
        notes: description,
        lastModifiedBy: window.currentUser.uid,
        lastModifiedByName: window.currentUserData.displayName,
        lastModifiedAt: new Date().toISOString()
    };

    utils.showLoading(true);

    window.updateOverheadExpense(expenseId, updates)
        .then(() => {
            utils.showLoading(false);
            if (window.utils && window.utils.showToast) {
                window.utils.showToast('✅ Overhead expense updated', 'success', 2000);
            }
            closeEditOverheadModal();
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error updating overhead expense: ' + error.message);
        });
}

/**
 * Filter overhead categories based on expense type
 */
function updateOverheadCategories() {
    const expenseType = document.getElementById('overheadExpenseType').value;
    const categorySelect = document.getElementById('overheadCategory');
    const options = categorySelect.querySelectorAll('option');

    options.forEach(option => {
        const optionType = option.getAttribute('data-type');
        if (!optionType) {
            option.style.display = ''; // Show empty/default option
        } else if (optionType === expenseType) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });

    // Reset to first visible option
    const firstVisible = Array.from(options).find(opt => opt.style.display !== 'none' && opt.value);
    if (firstVisible) {
        categorySelect.value = firstVisible.value;
    } else {
        categorySelect.value = '';
    }
}

/**
 * Filter edit modal categories based on expense type
 */
function updateEditOverheadCategories() {
    const expenseType = document.getElementById('editOverheadExpenseType').value;
    const categorySelect = document.getElementById('editOverheadCategory');
    const options = categorySelect.querySelectorAll('option');

    const currentValue = categorySelect.value;

    options.forEach(option => {
        const optionType = option.getAttribute('data-type');
        if (!optionType) {
            option.style.display = ''; // Show empty/default option
        } else if (optionType === expenseType) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });

    // Check if current value is still visible
    const currentOption = Array.from(options).find(opt => opt.value === currentValue);
    if (currentOption && currentOption.style.display === 'none') {
        // Reset to first visible option if current is hidden
        const firstVisible = Array.from(options).find(opt => opt.style.display !== 'none' && opt.value);
        if (firstVisible) {
            categorySelect.value = firstVisible.value;
        } else {
            categorySelect.value = '';
        }
    }
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
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:15px;">
                    <div>
                        <label>Supplier *</label>
                        <input type="text" id="purchaseSupplier" class="form-control" placeholder="Supplier name">
                    </div>
                    <div>
                        <label>Invoice Number *</label>
                        <input type="text" id="purchaseInvoice" class="form-control" placeholder="INV-001">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:15px;">
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
                
                <!-- PARTS DETAILS (OPTIONAL) -->
                <div style="background:white;padding:15px;border-radius:4px;margin-bottom:15px;">
                    <h5 style="margin:0 0 10px;">📦 Parts Details (Optional)</h5>
                    <div id="partsDetailsContainer"></div>
                    <button type="button" onclick="addPartsRow()" class="btn-secondary" style="font-size:0.9em;">
                        ➕ Add Part
                    </button>
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
                    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                        <table class="repairs-table" style="min-width:500px;">
                            <thead>
                                <tr>
                                    <th style="min-width:150px;">Supplier</th>
                                    <th style="min-width:80px;">Invoices</th>
                                    <th style="min-width:120px;">Outstanding</th>
                                    <th style="min-width:80px;">Overdue</th>
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
                    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                        <table class="repairs-table" style="min-width:900px;">
                            <thead>
                                <tr>
                                    <th style="min-width:90px;">Date</th>
                                    <th style="min-width:120px;">Supplier</th>
                                    <th style="min-width:100px;">Invoice</th>
                                    <th style="min-width:100px;">Amount</th>
                                    <th style="min-width:90px;">Paid</th>
                                    <th style="min-width:110px;">Outstanding</th>
                                    <th style="min-width:100px;">Due Date</th>
                                    <th style="min-width:80px;">Status</th>
                                    <th style="min-width:140px;position:sticky;right:0;background:white;">Actions</th>
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
                                                <td style="position:sticky;right:0;background:white;white-space:nowrap;">
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

    // Get parts details if entered
    const partsRows = document.querySelectorAll('.parts-row');
    const partsPurchased = [];
    partsRows.forEach(row => {
        const partName = row.querySelector('.part-name')?.value.trim();
        const quantity = parseFloat(row.querySelector('.part-quantity')?.value);
        const unitPrice = parseFloat(row.querySelector('.part-price')?.value);

        if (partName && quantity && unitPrice) {
            partsPurchased.push({
                partName: partName,
                quantity: quantity,
                unitPrice: unitPrice,
                totalCost: quantity * unitPrice
            });
        }
    });

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
        partsPurchased: partsPurchased.length > 0 ? partsPurchased : [],
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

            // Clear parts rows
            document.getElementById('partsDetailsContainer').innerHTML = '';
        })
        .catch(error => {
            utils.showLoading(false);
            alert('Error recording purchase: ' + error.message);
        });
}

function addPartsRow() {
    const container = document.getElementById('partsDetailsContainer');
    const rowId = 'partRow_' + Date.now();

    const row = document.createElement('div');
    row.className = 'parts-row';
    row.id = rowId;
    row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:10px;margin-bottom:10px;align-items:end;';

    row.innerHTML = `
        <div>
            <label style="font-size:0.9em;">Part Name</label>
            <input type="text" class="part-name form-control" placeholder="LCD Screen">
        </div>
        <div>
            <label style="font-size:0.9em;">Quantity</label>
            <input type="number" class="part-quantity form-control" placeholder="1" min="1" step="1">
        </div>
        <div>
            <label style="font-size:0.9em;">Unit Price</label>
            <input type="number" class="part-price form-control" placeholder="0.00" step="0.01" min="0">
        </div>
        <button type="button" onclick="document.getElementById('${rowId}').remove()" class="btn-danger" style="padding:8px 12px;">
            🗑️
        </button>
    `;

    container.appendChild(row);
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
window.openEditOverheadModal = openEditOverheadModal;
window.closeEditOverheadModal = closeEditOverheadModal;
window.saveEditedOverheadExpense = saveEditedOverheadExpense;
window.updateOverheadCategories = updateOverheadCategories;
window.updateEditOverheadCategories = updateEditOverheadCategories;

// Export supplier payables functions
window.buildSupplierPayablesTab = buildSupplierPayablesTab;
window.saveSupplierPurchase = saveSupplierPurchase;
window.addPartsRow = addPartsRow;
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
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:15px;">
                    <div>
                        <label>Start Date</label>
                        <input type="date" id="plStartDate" class="form-control" value="${currentYear}-01-01">
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="date" id="plEndDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="display:flex;align-items:end;gap:5px;flex-wrap:wrap;">
                        <button onclick="generatePLStatement()" class="btn btn-primary" style="flex:1;min-width:100px;">📊 Generate</button>
                        <button onclick="exportPLStatementCSV()" class="btn btn-success" style="flex:1;min-width:100px;">💾 Export</button>
                    </div>
                </div>
                <div id="plStatementContent"></div>
            </div>
            
            <!-- QUARTERLY SUMMARY -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
                <h4 style="margin:0 0 15px;">📅 Quarterly Summary</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:15px;">
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
                    <div style="display:flex;align-items:end;gap:5px;flex-wrap:wrap;">
                        <button onclick="generateQuarterlySummary()" class="btn btn-primary" style="flex:1;min-width:100px;">📊 Generate</button>
                        <button onclick="exportQuarterlySummaryCSV()" class="btn btn-success" style="flex:1;min-width:100px;">💾 Export</button>
                    </div>
                </div>
                <div id="quarterlySummaryContent"></div>
            </div>
            
            <!-- ANNUAL SUMMARY -->
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                <h4 style="margin:0 0 15px;">📆 Annual Summary</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">
                    <div>
                        <label>Year</label>
                        <select id="annualYear" class="form-control">
                            ${[currentYear, currentYear - 1, currentYear - 2].map(y =>
        `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
    ).join('')}
                        </select>
                    </div>
                    <div style="display:flex;align-items:end;">
                        <button onclick="exportAnnualPLStatementCSV()" class="btn btn-success" style="width:100%;">💾 Export Annual P&L</button>
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
                <div class="table-responsive">
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
                    <div class="alert-card-info">
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
                <div class="table-responsive">
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

// ========== QUICK ACTION MODALS ==========

/**
 * Open quick expense modal (from mobile FAB)
 */
function openQuickExpenseModal() {
    // Clear any repair ID context (general expense)
    if (window.currentExpenseRepairId) {
        window.currentExpenseRepairId = null;
    }

    const display = document.getElementById('expenseRepairIdDisplay');
    if (display) {
        display.style.display = 'none';
    }

    // Reset form
    document.getElementById('expenseType').value = 'general';
    document.getElementById('expenseCategory').value = 'delivery';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseNotes').value = '';

    // Open modal
    document.getElementById('expenseModal').style.display = 'block';
}

/**
 * Open quick search modal (from mobile FAB)
 */
function openQuickSearchModal() {
    const modal = document.getElementById('quickSearchModal');
    const searchInput = document.getElementById('quickSearchInput');
    const resultsDiv = document.getElementById('quickSearchResults');

    // Clear previous search
    searchInput.value = '';
    resultsDiv.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Type to search for devices...</p>';

    // Open modal
    modal.style.display = 'block';

    // Focus on search input
    setTimeout(() => searchInput.focus(), 100);
}

/**
 * Close quick search modal
 */
function closeQuickSearchModal() {
    document.getElementById('quickSearchModal').style.display = 'none';
}

/**
 * Perform quick search across all repairs
 */
function performQuickSearch() {
    const searchTerm = document.getElementById('quickSearchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('quickSearchResults');

    if (searchTerm.length < 2) {
        resultsDiv.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Type at least 2 characters...</p>';
        return;
    }

    // Search across all repairs
    const allRepairs = window.allRepairs || [];
    const results = allRepairs.filter(r => {
        if (r.deleted) return false;

        const trackingNum = (r.trackingNumber || '').toLowerCase();
        const customerName = (r.customerName || '').toLowerCase();
        const shopName = (r.shopName || '').toLowerCase();
        const brand = (r.brand || '').toLowerCase();
        const model = (r.model || '').toLowerCase();
        const problem = (r.problem || '').toLowerCase();

        return trackingNum.includes(searchTerm) ||
            customerName.includes(searchTerm) ||
            shopName.includes(searchTerm) ||
            brand.includes(searchTerm) ||
            model.includes(searchTerm) ||
            problem.includes(searchTerm);
    }).slice(0, 20); // Limit to 20 results

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No devices found matching your search.</p>';
        return;
    }

    // Render results
    resultsDiv.innerHTML = results.map(r => {
        const statusClass = r.status.toLowerCase().replace(/\\s+/g, '-');

        // Determine which tab to navigate to based on status
        let targetTab = 'my';
        if (r.status === 'Received') targetTab = 'received';
        else if (r.status === 'In Progress' || r.status === 'Waiting for Parts') targetTab = 'inprogress';
        else if (r.status === 'Ready for Pickup') targetTab = 'forrelease';
        else if (r.status === 'Released') targetTab = 'mycompleted';
        else if (r.status === 'Claimed') targetTab = 'myclaimed';

        // Get pricing info
        const pricing = r.pricing || r.quotedPrice || 0;
        const totalPaid = r.payments ? r.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0;
        const displayPrice = totalPaid > 0 ? totalPaid : pricing;

        // Get job description
        const jobDescription = r.problem || r.repairType || 'Not specified';

        return `
            <div class="search-result-item" 
                 onclick="closeQuickSearchModal(); switchTab('${targetTab}'); setTimeout(() => toggleRepairDetails('${r.id}'), 500);"
                 style="padding:15px;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;background:white;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                    <div style="flex:1;">
                        <div style="font-size:16px;font-weight:600;color:#333;margin-bottom:4px;">
                            ${r.brand} ${r.model}
                        </div>
                        <div style="font-size:13px;color:#666;margin-bottom:2px;">
                            🔧 <strong>Job:</strong> ${jobDescription}
                        </div>
                        <div style="font-size:13px;color:#666;">
                            📍 ${r.trackingNumber} • ${window.utils.formatDate(r.recordedDate)}
                        </div>
                    </div>
                    <div style="text-align:right;margin-left:15px;">
                        <div style="font-size:18px;font-weight:bold;color:#2e7d32;margin-bottom:4px;">
                            ₱${displayPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </div>
                        <span class="status-badge status-${statusClass}" style="font-size:11px;">${r.status}</span>
                    </div>
                </div>
                ${r.customerName || r.shopName ? `
                    <div style="font-size:12px;color:#999;border-top:1px solid #f0f0f0;padding-top:6px;margin-top:6px;">
                        👤 ${r.customerName}${r.shopName ? ` • 🏪 ${r.shopName}` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    // Add hover effect via CSS
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f5f5f5';
            item.style.borderColor = '#667eea';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
            item.style.borderColor = '#e0e0e0';
        });
    });
}

// Export quick action functions
window.openQuickExpenseModal = openQuickExpenseModal;
window.openQuickSearchModal = openQuickSearchModal;
window.closeQuickSearchModal = closeQuickSearchModal;
window.performQuickSearch = performQuickSearch;

console.log('✅ ui.js loaded');

// Export repair list interaction functions
window.toggleRepairDetails = toggleRepairDetails;

// Export cleanup and export functions
window.fixDataIssues = fixDataIssues;
window.showCleanupHistory = showCleanupHistory;
window.undoCleanupById = undoCleanupById;
window.updateExportSchedule = updateExportSchedule;

/**
 * Toggle between table and card view for responsive tables
 * @param {string} tableId - The ID prefix of the table (e.g., 'cash-count-table')
 */
function toggleTableView(tableId) {
    const tableView = document.getElementById(`${tableId}-view`);
    const cardView = document.getElementById(`${tableId.replace('-table', '')}-card-view`);
    const toggleButton = document.getElementById(`${tableId.replace('-table', '')}-view-toggle`);
    const toggleText = document.getElementById(`${tableId.replace('-table', '')}-toggle-text`);

    if (!tableView || !cardView) return;

    // Check current state
    const isCardView = cardView.style.display !== 'none';

    if (isCardView) {
        // Switch to table view
        tableView.style.display = 'block';
        cardView.style.display = 'none';
        if (toggleText) toggleText.textContent = '📱 Card View';
        localStorage.setItem(`${tableId}-view-mode`, 'table');
    } else {
        // Switch to card view
        tableView.style.display = 'none';
        cardView.style.display = 'block';
        if (toggleText) toggleText.textContent = '📊 Table View';
        localStorage.setItem(`${tableId}-view-mode`, 'cards');
    }
}

/**
 * Initialize table view based on saved preference or screen size
 * @param {string} tableId - The ID prefix of the table
 */
function initTableView(tableId) {
    const savedMode = localStorage.getItem(`${tableId}-view-mode`);
    const isMobile = window.innerWidth <= 768;

    // Auto-switch to card view on mobile if no preference saved
    if (!savedMode && isMobile) {
        toggleTableView(tableId);
    } else if (savedMode === 'cards') {
        toggleTableView(tableId);
    }
}

// Export table toggle functions
window.toggleTableView = toggleTableView;
window.initTableView = initTableView;

// ============================================
// USAGE ANALYTICS TAB
// ============================================

function buildUsageAnalyticsTab(container) {
    console.log('📈 Building Usage Analytics tab');
    window.currentTabRefresh = () => buildUsageAnalyticsTab(document.getElementById('usage-analyticsTab'));

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get current filter or default to 7 days
    const currentRange = window.usageAnalyticsRange || '7days';

    let startDate, endDate;
    switch (currentRange) {
        case 'today':
            startDate = today;
            endDate = today + 'T23:59:59.999Z';
            break;
        case '7days':
            startDate = sevenDaysAgo;
            endDate = today + 'T23:59:59.999Z';
            break;
        case '30days':
            startDate = thirtyDaysAgo;
            endDate = today + 'T23:59:59.999Z';
            break;
        default:
            startDate = sevenDaysAgo;
            endDate = today + 'T23:59:59.999Z';
    }

    container.innerHTML = `
        <div class="card">
            <h3>📈 Usage Analytics</h3>
            <p style="color:#666;margin-bottom:20px;">
                Track which tabs and features are most frequently used. Use this data to optimize the UI and remove unused features.
            </p>

            <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn-${currentRange === 'today' ? 'primary' : 'secondary'}"
                        onclick="window.usageAnalyticsRange='today'; buildUsageAnalyticsTab(document.getElementById('usage-analyticsTab'));">
                    Today
                </button>
                <button class="btn-${currentRange === '7days' ? 'primary' : 'secondary'}"
                        onclick="window.usageAnalyticsRange='7days'; buildUsageAnalyticsTab(document.getElementById('usage-analyticsTab'));">
                    Last 7 Days
                </button>
                <button class="btn-${currentRange === '30days' ? 'primary' : 'secondary'}"
                        onclick="window.usageAnalyticsRange='30days'; buildUsageAnalyticsTab(document.getElementById('usage-analyticsTab'));">
                    Last 30 Days
                </button>
                <button class="btn-secondary" onclick="exportUsageAnalytics()">
                    📥 Export CSV
                </button>
            </div>

            <div id="usageAnalyticsContent">
                <div style="text-align:center;padding:40px;color:#999;">
                    Loading analytics data...
                </div>
            </div>
        </div>
    `;

    // Load analytics data
    loadUsageAnalyticsData(startDate, endDate);
}

async function loadUsageAnalyticsData(startDate, endDate) {
    const contentDiv = document.getElementById('usageAnalyticsContent');

    try {
        utils.showLoading(true);

        const [tabStats, formStats, fieldStats] = await Promise.all([
            window.getTabUsageStats(startDate, endDate),
            window.getFormUsageStats(startDate, endDate),
            window.getFieldUsageStats(startDate, endDate)
        ]);

        utils.showLoading(false);

        if (!contentDiv) return;

        const summaryCards = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:30px;">
                <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                    <div class="stat-value">${tabStats.totalEvents.toLocaleString()}</div>
                    <div class="stat-label">Tab Switches</div>
                </div>
                <div class="stat-card" style="background:#f3e5f5;border-left:4px solid #9c27b0;">
                    <div class="stat-value">${formStats.totalSubmissions.toLocaleString()}</div>
                    <div class="stat-label">Form Submissions</div>
                </div>
                <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                    <div class="stat-value">${fieldStats.totalInteractions.toLocaleString()}</div>
                    <div class="stat-label">Field Interactions</div>
                </div>
            </div>
        `;

        const tabsTable = tabStats.mostUsedTabs.length > 0 ? `
            <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;border:1px solid #e0e0e0;">
                <h4 style="margin:0 0 15px 0;color:#2196f3;">🔝 Most Used Tabs</h4>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Tab Name</th>
                                <th>Total Visits</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                    <tbody>
                        ${tabStats.mostUsedTabs.map((tab, index) => {
            const percentage = ((tab.count / tabStats.totalEvents) * 100).toFixed(1);
            return `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td>${tab.tab}</td>
                                    <td>${tab.count.toLocaleString()}</td>
                                    <td>
                                        <div style="display:flex;align-items:center;gap:10px;">
                                            <div style="flex:1;background:#e0e0e0;height:20px;border-radius:10px;overflow:hidden;">
                                                <div style="width:${percentage}%;background:#2196f3;height:100%;"></div>
                                            </div>
                                            <span style="min-width:45px;text-align:right;">${percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        ` : '<p style="text-align:center;color:#999;padding:20px;">No tab data available</p>';

        contentDiv.innerHTML = summaryCards + tabsTable;

    } catch (error) {
        console.error('❌ Error loading usage analytics:', error);
        utils.showLoading(false);

        const contentDiv = document.getElementById('usageAnalyticsContent');
        if (contentDiv) {
            const isPermissionError = error.message && error.message.includes('permission');
            contentDiv.innerHTML = `
                <div class="alert-${isPermissionError ? 'warning' : 'danger'}">
                    <h3 style="margin:0 0 10px;font-size:18px;">❌ ${isPermissionError ? 'Permission Error' : 'Error Loading Analytics'}</h3>
                    <p style="margin:0;"><strong>Error:</strong> ${error.message}</p>
                    ${isPermissionError ? `
                        <p style="margin:10px 0 0;font-size:14px;">
                            <strong>Solution:</strong> This means the Firebase database rules need to be deployed. 
                            Contact your system administrator to deploy the latest database rules.
                        </p>
                    ` : `
                        <p style="margin:5px 0 0;font-size:14px;">
                            This might be because no usage data has been collected yet. Start using the app to generate analytics.
                        </p>
                    `}
                </div>
            `;
        }
    }
}

async function exportUsageAnalytics() {
    try {
        utils.showLoading(true);

        const currentRange = window.usageAnalyticsRange || '7days';
        const today = new Date().toISOString().split('T')[0];

        let startDate, endDate;
        switch (currentRange) {
            case 'today':
                startDate = today;
                endDate = today + 'T23:59:59.999Z';
                break;
            case '7days':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                endDate = today + 'T23:59:59.999Z';
                break;
            case '30days':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                endDate = today + 'T23:59:59.999Z';
                break;
        }

        const events = await window.getUsageAnalytics(startDate, endDate);

        const csvHeaders = ['Timestamp', 'User', 'Role', 'Event Type', 'Details'];
        const csvRows = events.map(event => {
            let details = '';
            if (event.eventType === 'tab_switch') {
                details = `${event.data.fromTab} → ${event.data.toTab}`;
            } else if (event.eventType === 'form_submit') {
                details = event.data.formName;
            } else if (event.eventType === 'field_interaction') {
                details = `${event.data.fieldName} (${event.data.fieldType})`;
            }

            return [
                event.timestamp,
                event.userName,
                event.userRole,
                event.eventType,
                details
            ];
        });

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage_analytics_${currentRange}_${today}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        utils.showLoading(false);
        alert('✅ Usage analytics exported successfully!');

    } catch (error) {
        console.error('❌ Error exporting analytics:', error);
        utils.showLoading(false);
        alert('❌ Error exporting analytics: ' + error.message);
    }
}

// Export usage analytics functions
window.buildUsageAnalyticsTab = buildUsageAnalyticsTab;
window.loadUsageAnalyticsData = loadUsageAnalyticsData;
window.exportUsageAnalytics = exportUsageAnalytics;

// ============================================
// PERSONAL FINANCE TAB
// ============================================

function buildPersonalFinanceTab(container) {
    console.log('💰 Building Personal Finance tab');

    // Set refresh callback
    window.currentTabRefresh = () => buildPersonalFinanceTab(
        document.getElementById('personal-financeTab')
    );

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Get current budget
    const budget = calculateNetPersonalBudget(currentMonth, currentYear);

    // Check if recurring generated for current month
    const recurringGenerated = (window.allPersonalExpenses || []).some(e =>
        e.isAutoGenerated &&
        new Date(e.date).getMonth() + 1 === currentMonth &&
        new Date(e.date).getFullYear() === currentYear
    );

    container.innerHTML = `
        <div class="card">
            <h2 style="margin-bottom:10px;">💰 My Personal Finance</h2>
            <div style="background:#E3F2FD;padding:12px;border-radius:6px;margin-bottom:20px;border-left:4px solid #2196F3;">
                <p style="margin:0;font-size:14px;color:#1976D2;">
                    <strong>💡 How it works:</strong><br>
                    • Your <strong>Spending Budget (60%)</strong> is for personal expenses (food, bills, etc.)<br>
                    • <strong>Savings Goals (40%)</strong> are funded from technician commissions pool<br>
                    • Credit cards and expense tracking use your spending budget
                </p>
            </div>
            
            <!-- Budget Dashboard -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('budget-dashboard')">
                    <h3>📊 Budget Dashboard</h3>
                    <span class="toggle-icon" id="budget-dashboard-icon">▼</span>
                </div>
                <div id="budget-dashboard-section" class="admin-section-content" style="display:block;">
                    ${buildBudgetDashboard(budget, currentMonth, currentYear)}
                </div>
            </div>
            
            <!-- Savings Goals -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('savings-goals')">
                    <h3>🎯 Savings Goals</h3>
                    <span class="toggle-icon" id="savings-goals-icon">▼</span>
                </div>
                <div id="savings-goals-section" class="admin-section-content">
                    ${buildSavingsGoalsSection()}
                </div>
            </div>
            
            <!-- Credit Cards -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('credit-cards')">
                    <h3>💳 Credit Cards</h3>
                    <span class="toggle-icon" id="credit-cards-icon">▼</span>
                </div>
                <div id="credit-cards-section" class="admin-section-content">
                    ${buildCreditCardsSection()}
                </div>
            </div>
            
            <!-- Recurring Templates -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('recurring-templates')">
                    <h3>🔄 Recurring Templates ${!recurringGenerated ? '<span style="background:#F44336;color:white;padding:2px 8px;border-radius:12px;font-size:12px;margin-left:10px;">!</span>' : ''}</h3>
                    <span class="toggle-icon" id="recurring-templates-icon">▼</span>
                </div>
                <div id="recurring-templates-section" class="admin-section-content">
                    ${buildRecurringTemplatesSection(recurringGenerated, currentMonth, currentYear)}
                </div>
            </div>
            
            <!-- Expense History -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('expense-history')">
                    <h3>📋 Expense History</h3>
                    <span class="toggle-icon" id="expense-history-icon">▼</span>
                </div>
                <div id="expense-history-section" class="admin-section-content">
                    ${buildExpenseHistorySection(currentMonth, currentYear)}
                </div>
            </div>
            
            <!-- Trend Charts -->
            <div class="admin-section">
                <div class="admin-section-header" onclick="toggleAdminSection('trend-charts')">
                    <h3>📈 Spending Trends</h3>
                    <span class="toggle-icon" id="trend-charts-icon">▼</span>
                </div>
                <div id="trend-charts-section" class="admin-section-content">
                    ${buildTrendChartsSection()}
                </div>
            </div>
        </div>
    `;
}

function buildBudgetDashboard(budget, month, year) {
    if (budget.isTechnician) {
        return `
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-bottom:15px;">
                <h4 style="margin-top:0;font-size:15px;">💼 Commission Budget (${getMonthName(month)} ${year})</h4>
                <div class="budget-breakdown-grid" style="display:flex;flex-direction:column;gap:10px;margin-bottom:15px;">
                    <div style="padding:10px;background:white;border-radius:6px;">
                        <small style="color:#666;display:block;margin-bottom:4px;">Gross Commission</small>
                        <div style="font-size:18px;font-weight:bold;color:#4CAF50;">₱${budget.breakdown.grossCommission.toFixed(2)}</div>
                    </div>
                    <div style="padding:10px;background:white;border-radius:6px;">
                        <small style="color:#666;display:block;margin-bottom:4px;">Overhead Share (${(budget.breakdown.userProportion * 100).toFixed(1)}%)</small>
                        <div style="font-size:18px;font-weight:bold;color:#F44336;">-₱${budget.breakdown.overheadShare.toFixed(2)}</div>
                    </div>
                    <div style="padding:10px;background:white;border-radius:6px;">
                        <small style="color:#666;display:block;margin-bottom:4px;">Net After Overhead</small>
                        <div style="font-size:18px;font-weight:bold;color:#2196F3;">₱${budget.breakdown.netAfterOverhead.toFixed(2)}</div>
                    </div>
                </div>
                <div class="budget-split-grid" style="display:flex;flex-direction:column;gap:12px;">
                    <div style="background:#E3F2FD;padding:12px;border-radius:8px;">
                        <h4 style="margin:0 0 8px 0;font-size:14px;">60% Spending Budget</h4>
                        <div style="font-size:22px;font-weight:bold;color:#2196F3;">₱${budget.spendingBudget.toFixed(2)}</div>
                        <small style="color:#666;">For personal expenses</small>
                    </div>
                    <div style="background:#E8F5E9;padding:12px;border-radius:8px;">
                        <h4 style="margin:0 0 8px 0;font-size:14px;">40% Savings Pool</h4>
                        <div style="font-size:22px;font-weight:bold;color:#4CAF50;">₱${budget.savingsPool.toFixed(2)}</div>
                        <small style="color:#666;">Auto-allocated to goals</small>
                    </div>
                </div>
            </div>
            <div style="background:white;padding:12px;border-radius:8px;border:1px solid #ddd;">
                <h4 style="margin-top:0;font-size:15px;">💰 Spending Status</h4>
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:14px;">
                        <span>Spent</span>
                        <span style="font-weight:bold;">₱${budget.spent.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;">
                        <span>Remaining</span>
                        <span style="font-weight:bold;color:${budget.remaining >= 0 ? '#4CAF50' : '#F44336'};">₱${budget.remaining.toFixed(2)}</span>
                    </div>
                    <div style="background:#f0f0f0;height:20px;border-radius:10px;overflow:hidden;">
                        <div style="background:${budget.utilizationPercent < 70 ? '#4CAF50' : budget.utilizationPercent < 90 ? '#FF9800' : '#F44336'};height:100%;width:${Math.min(budget.utilizationPercent, 100)}%;transition:width 0.3s;"></div>
                    </div>
                    <div style="text-align:center;margin-top:5px;font-size:14px;color:#666;">
                        ${budget.utilizationPercent.toFixed(1)}% used
                    </div>
                </div>
                <button onclick="openPersonalExpenseModal()" class="btn-primary" style="width:100%;min-height:44px;">➕ Add Expense</button>
            </div>
        `;
    } else {
        return `
            <div style="background:#E8F5E9;padding:15px;border-radius:8px;margin-bottom:15px;">
                <h4 style="margin-top:0;">💼 Admin/Staff Budget (${getMonthName(month)} ${year})</h4>
                <p style="color:#666;margin-bottom:10px;">💰 Set your monthly spending budget (from 60% admin allocation):</p>
                <div style="display:flex;gap:10px;margin-bottom:15px;">
                    <input type="number" id="manualBudgetInput" value="${budget.spendingBudget}" placeholder="0.00" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px;">
                    <button onclick="saveManualBudget(${month}, ${year})" class="btn-primary">💾 Save</button>
                </div>
                ${budget.savingsPool > 0 ? `
                    <div style="background:#E3F2FD;padding:12px;border-radius:6px;border-left:3px solid #2196F3;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <small style="color:#666;">🏦 Shared Savings Pool (Tech 40%)</small>
                                <div style="font-size:20px;font-weight:bold;color:#2196F3;">₱${budget.savingsPool.toFixed(2)}</div>
                            </div>
                            <small style="color:#666;text-align:right;">Available for<br/>savings goals</small>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${budget.spendingBudget > 0 ? `
                <div style="background:white;padding:15px;border-radius:8px;border:1px solid #ddd;">
                    <h4 style="margin-top:0;">💰 Spending Status</h4>
                    <div style="margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Budget</span>
                            <span style="font-weight:bold;">₱${budget.spendingBudget.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Spent</span>
                            <span style="font-weight:bold;">₱${budget.spent.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                            <span>Remaining</span>
                            <span style="font-weight:bold;color:${budget.remaining >= 0 ? '#4CAF50' : '#F44336'};">₱${budget.remaining.toFixed(2)}</span>
                        </div>
                        <div style="background:#f0f0f0;height:20px;border-radius:10px;overflow:hidden;">
                            <div style="background:${budget.utilizationPercent < 70 ? '#4CAF50' : budget.utilizationPercent < 90 ? '#FF9800' : '#F44336'};height:100%;width:${Math.min(budget.utilizationPercent, 100)}%;transition:width 0.3s;"></div>
                        </div>
                        <div style="text-align:center;margin-top:5px;font-size:14px;color:#666;">
                            ${budget.utilizationPercent.toFixed(1)}% used
                        </div>
                    </div>
                    <button onclick="openPersonalExpenseModal()" class="btn-primary" style="width:100%;">➕ Add Expense</button>
                </div>
            ` : ''}
        `;
    }
}

function buildSavingsGoalsSection() {
    const goals = window.allSavingsGoals || [];
    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);

    const totalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

    const today = new Date();
    const budget = calculateNetPersonalBudget(today.getMonth() + 1, today.getFullYear());

    let html = `
        <div class="finance-section-header" style="margin-bottom:15px;">
            <div style="margin-bottom:10px;">
                <h4 style="margin:0;font-size:16px;">Total Savings: ₱${totalSavings.toFixed(2)}</h4>
                <small style="color:#666;display:block;margin-top:4px;">${activeGoals.length} active, ${completedGoals.length} completed</small>
                ${budget.savingsPool > 0 ? `<small style="color:#2196F3;font-weight:bold;display:block;margin-top:4px;">💰 ₱${budget.savingsPool.toFixed(2)} available from tech pool (40%)</small>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button onclick="openSavingsGoalModal()" class="btn-primary" style="width:100%;min-height:44px;">➕ Add Goal</button>
                ${budget.savingsPool > 0 ? `
                    <button onclick="showAllocationRecommendation()" class="btn-secondary" style="width:100%;min-height:44px;">💡 Optimize Allocation</button>
                ` : ''}
            </div>
        </div>
    `;

    if (activeGoals.length === 0 && completedGoals.length === 0) {
        html += '<p style="text-align:center;color:#666;padding:40px 20px;font-size:14px;">No savings goals yet. Create one to start saving!</p>';
    } else {
        html += '<div class="goals-grid" style="display:flex;flex-direction:column;gap:12px;">';

        activeGoals.forEach(goal => {
            html += buildGoalCard(goal);
        });

        completedGoals.forEach(goal => {
            html += buildGoalCard(goal);
        });

        html += '</div>';
    }

    return html;
}

function buildGoalCard(goal) {
    const percentComplete = ((goal.currentAmount || 0) / goal.targetAmount) * 100;
    const isCompleted = goal.isCompleted || false;

    return `
        <div class="goal-card" style="background:${isCompleted ? '#E8F5E9' : 'white'};border:1px solid ${isCompleted ? '#4CAF50' : '#ddd'};border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                <div style="flex:1;min-width:0;">
                    <h4 style="margin:0 0 5px 0;font-size:15px;word-break:break-word;">${isCompleted ? '✅ ' : ''}${goal.goalName}</h4>
                    <span style="background:#E3F2FD;color:#2196F3;padding:2px 8px;border-radius:4px;font-size:11px;display:inline-block;">${goal.category}</span>
                </div>
                <span style="font-size:12px;color:#666;white-space:nowrap;">Priority ${goal.priority}</span>
            </div>
            <div style="margin:12px 0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px;">
                    <span style="color:#666;">₱${(goal.currentAmount || 0).toFixed(2)}</span>
                    <span style="color:#666;">₱${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div style="background:#f0f0f0;height:12px;border-radius:6px;overflow:hidden;">
                    <div style="background:${isCompleted ? '#4CAF50' : '#2196F3'};height:100%;width:${Math.min(percentComplete, 100)}%;transition:width 0.3s;"></div>
                </div>
                <div style="text-align:center;margin-top:5px;font-size:12px;color:#666;">
                    ${percentComplete.toFixed(1)}% complete
                </div>
            </div>
            ${goal.deadline ? `
                <div style="font-size:12px;color:#666;margin-bottom:10px;">
                    📅 Target: ${new Date(goal.deadline).toLocaleDateString()}
                </div>
            ` : ''}
            ${!isCompleted ? `
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button onclick="openContributionModal('${goal.id}')" class="btn-secondary" style="flex:1;min-width:70px;font-size:11px;padding:8px 4px;min-height:40px;">➕ Add</button>
                    <button onclick="openWithdrawalModal('${goal.id}')" class="btn-secondary" style="flex:1;min-width:70px;font-size:11px;padding:8px 4px;min-height:40px;">💸 Withdraw</button>
                    <button onclick="editSavingsGoal('${goal.id}')" class="btn-secondary" style="font-size:11px;padding:8px 10px;min-height:40px;">✏️</button>
                    <button onclick="deleteSavingsGoal('${goal.id}')" class="btn-secondary" style="font-size:11px;padding:8px 10px;min-height:40px;">🗑️</button>
                </div>
            ` : `
                <div style="text-align:center;color:#4CAF50;font-weight:bold;font-size:14px;">🎉 Goal Completed!</div>
            `}
        </div>
    `;
}

function buildCreditCardsSection() {
    const cards = (window.allCreditCards || []).filter(c => c.isActive);

    const totalDebt = cards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
    const totalLimit = cards.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
    const totalMinimums = cards.reduce((sum, c) => {
        const balance = c.currentBalance || 0;
        const percent = c.minimumPaymentPercent || 3;
        return sum + (balance * percent / 100);
    }, 0);

    let html = `
        <div class="finance-section-header" style="margin-bottom:15px;">
            <div style="margin-bottom:10px;">
                <h4 style="margin:0;font-size:16px;">Total Debt: ₱${totalDebt.toFixed(2)}</h4>
                <small style="color:#666;display:block;margin-top:4px;">Monthly Minimums: ₱${totalMinimums.toFixed(2)}</small>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button onclick="openCreditCardModal()" class="btn-primary" style="width:100%;min-height:44px;">➕ Add Card</button>
                <button onclick="openLoanCalculatorModal()" class="btn-secondary" style="width:100%;min-height:44px;">🏦 Check Loan</button>
            </div>
        </div>
    `;

    if (cards.length === 0) {
        html += '<p style="text-align:center;color:#666;padding:40px;">No credit cards tracked yet.</p>';
    } else {
        html += '<div class="table-responsive"><table class="data-table"><thead><tr>';
        html += '<th>Card Name</th><th>Holder</th><th>Bank</th><th>Limit</th><th>Balance</th><th>Utilization</th><th>Due Date</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        cards.forEach(card => {
            const utilization = (card.currentBalance / card.creditLimit) * 100;
            const holderColors = { 'Mine': '#4CAF50', 'Spouse': '#2196F3', 'Shared': '#FF9800' };

            html += '<tr>';
            html += `<td><strong>${card.cardName}</strong></td>`;
            html += `<td><span style="background:${holderColors[card.cardHolder]};color:white;padding:2px 8px;border-radius:4px;font-size:12px;">${card.cardHolder}</span></td>`;
            html += `<td>${card.bank}</td>`;
            html += `<td>₱${card.creditLimit.toFixed(2)}</td>`;
            html += `<td style="color:${card.currentBalance > 0 ? '#F44336' : '#4CAF50'};">₱${card.currentBalance.toFixed(2)}</td>`;
            html += `<td><div style="display:flex;align-items:center;gap:5px;">`;
            html += `<div style="flex:1;background:#f0f0f0;height:12px;border-radius:6px;overflow:hidden;min-width:80px;">`;
            html += `<div style="background:${utilization < 30 ? '#4CAF50' : utilization < 70 ? '#FF9800' : '#F44336'};height:100%;width:${Math.min(utilization, 100)}%;"></div>`;
            html += `</div><span style="font-size:12px;white-space:nowrap;">${utilization.toFixed(0)}%</span></div></td>`;
            html += `<td>Day ${card.monthlyDueDate}</td>`;
            html += `<td>`;
            html += `<button onclick="recordCardPayment('${card.id}')" class="btn-secondary" style="font-size:12px;padding:4px 8px;margin-right:5px;">💳 Pay</button>`;
            html += `<button onclick="editCreditCard('${card.id}')" class="btn-secondary" style="font-size:12px;padding:4px 8px;margin-right:5px;">✏️</button>`;
            html += `<button onclick="deleteCreditCard('${card.id}')" class="btn-secondary" style="font-size:12px;padding:4px 8px;">🗑️</button>`;
            html += `</td></tr>`;
        });

        html += '</tbody></table></div>';
    }

    return html;
}

function buildRecurringTemplatesSection(generated, month, year) {
    const templates = window.allRecurringTemplates || [];

    let html = `
        <div class="finance-section-header" style="margin-bottom:15px;">
            <div style="margin-bottom:10px;">
                <h4 style="margin:0;font-size:16px;">${templates.length} Templates</h4>
                <small style="color:#666;display:block;margin-top:4px;">${templates.filter(t => t.isActive).length} active</small>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button onclick="openRecurringTemplateModal()" class="btn-primary" style="width:100%;min-height:44px;">➕ Add Template</button>
                <button onclick="generateRecurringExpenses(${month}, ${year})" class="btn-secondary" ${!window.isOnline ? 'disabled' : ''} style="width:100%;min-height:44px;">
                    🔄 Generate This Month ${!generated ? '⚠️' : ''}
                </button>
            </div>
        </div>
    `;

    if (templates.length === 0) {
        html += '<p style="text-align:center;color:#666;padding:40px;">No recurring templates. Add one to automate monthly bills!</p>';
    } else {
        html += '<div class="table-responsive"><table class="data-table"><thead><tr>';
        html += '<th>Name</th><th>Category</th><th>Amount</th><th>Day of Month</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        templates.forEach(template => {
            html += '<tr>';
            html += `<td><strong>${template.name}</strong></td>`;
            html += `<td>${template.category}</td>`;
            html += `<td>${template.currency === 'USD' ? '$' : '₱'}${template.amount.toFixed(2)}</td>`;
            html += `<td>Day ${template.dayOfMonth}</td>`;
            html += `<td><span style="color:${template.isActive ? '#4CAF50' : '#999'};">${template.isActive ? '✅ Active' : '⏸️ Inactive'}</span></td>`;
            html += `<td>`;
            html += `<button onclick="editRecurringTemplate('${template.id}')" class="btn-secondary" style="font-size:12px;padding:4px 8px;margin-right:5px;" ${!window.isOnline ? 'disabled' : ''}>✏️</button>`;
            html += `<button onclick="deleteRecurringTemplate('${template.id}')" class="btn-secondary" style="font-size:12px;padding:4px 8px;" ${!window.isOnline ? 'disabled' : ''}>🗑️</button>`;
            html += `</td></tr>`;
        });

        html += '</tbody></table></div>';
    }

    return html;
}

function buildExpenseHistorySection(month, year) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const expenses = (window.allPersonalExpenses || []).filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = `
        <div class="finance-section-header" style="margin-bottom:15px;">
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;width:100%;">
                <input type="text" id="expenseSearch" placeholder="🔍 Search expenses..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:16px;" onkeyup="filterExpenses()">
                <select id="categoryFilter" onchange="filterExpenses()" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:16px;">
                    <option value="">All Categories</option>
                    <option value="Bills">💡 Bills</option>
                    <option value="Loans">🏦 Loans</option>
                    <option value="Food">🍽️ Food</option>
                    <option value="Transportation">🚗 Transportation</option>
                    <option value="Medical">🏥 Medical</option>
                    <option value="Entertainment">🎮 Entertainment</option>
                    <option value="Shopping">🛒 Shopping</option>
                    <option value="Allowance">💵 Allowance</option>
                    <option value="Credit Card Payment">💳 Credit Card Payment</option>
                    <option value="Other">📦 Other</option>
                </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button onclick="openPersonalExpenseModal()" class="btn-primary" style="width:100%;min-height:44px;">➕ Add Expense</button>
                <button onclick="exportPersonalFinancesCSV(${month}, ${year})" class="btn-secondary" style="width:100%;min-height:44px;">📊 Export CSV</button>
            </div>
        </div>
    `;

    if (expenses.length === 0) {
        html += '<p style="text-align:center;color:#666;padding:40px;">No expenses for this month.</p>';
    } else {
        html += '<div id="expenseTableContainer" class="table-responsive"><table class="data-table"><thead><tr>';
        html += '<th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Currency</th><th>PHP Equivalent</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody id="expenseTableBody">';

        expenses.forEach(expense => {
            const phpAmount = expense.currency === 'USD' ? expense.amount * expense.phpConversionRate : expense.amount;
            const isPending = expense.syncStatus === 'pending';
            const isCCPayment = expense.category === 'Credit Card Payment';

            html += `<tr style="${isPending ? 'background:#FFF9C4;' : ''}${isCCPayment ? 'background:#E1F5FE;' : ''}">`;
            html += `<td>${new Date(expense.date).toLocaleDateString()}</td>`;
            html += `<td>${expense.category}</td>`;
            html += `<td>${expense.description || '-'}</td>`;
            html += `<td>${expense.currency === 'USD' ? '$' : '₱'}${expense.amount.toFixed(2)}</td>`;
            html += `<td>${expense.currency}</td>`;
            html += `<td>₱${phpAmount.toFixed(2)}${expense.currency === 'USD' ? ` <small>(rate: ${expense.phpConversionRate})</small>` : ''}</td>`;
            html += `<td>${isPending ? '⏳ Pending' : '✅ Synced'}</td>`;
            html += `<td><button class="btn-secondary" style="font-size:12px;padding:4px 8px;" onclick="alert('Edit/delete requires online connection')" ${!window.isOnline || isPending ? 'disabled' : ''}>🗑️</button></td>`;
            html += `</tr>`;
        });

        html += '</tbody></table></div>';
    }

    return html;
}

function buildTrendChartsSection() {
    const trendData = getSpendingTrendData(6);

    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">';

    // Spending trend chart (simple visualization)
    html += '<div style="background:white;padding:15px;border-radius:8px;border:1px solid #ddd;">';
    html += '<h4 style="margin-top:0;">📈 6-Month Spending Trend</h4>';

    if (trendData.length > 0) {
        const maxAmount = Math.max(...trendData.map(d => d.total));

        html += '<div style="display:flex;align-items:flex-end;justify-content:space-around;height:200px;gap:10px;">';
        trendData.forEach(d => {
            const height = maxAmount > 0 ? (d.total / maxAmount) * 100 : 0;
            html += `<div style="flex:1;text-align:center;">`;
            html += `<div style="background:#2196F3;height:${height}%;min-height:10px;border-radius:4px 4px 0 0;"></div>`;
            html += `<div style="font-size:10px;margin-top:5px;color:#666;">${d.monthName.substring(0, 3)}</div>`;
            html += `<div style="font-size:11px;font-weight:bold;">₱${(d.total / 1000).toFixed(1)}k</div>`;
            html += `</div>`;
        });
        html += '</div>';
    } else {
        html += '<p style="text-align:center;color:#666;padding:40px;">No data yet</p>';
    }

    html += '</div>';

    // Current month category breakdown
    const today = new Date();
    const categoryData = getCategoryBreakdown(today.getMonth() + 1, today.getFullYear());
    const categories = Object.keys(categoryData);

    html += '<div style="background:white;padding:15px;border-radius:8px;border:1px solid #ddd;">';
    html += '<h4 style="margin-top:0;">🥧 This Month by Category</h4>';

    if (categories.length > 0) {
        const total = Object.values(categoryData).reduce((sum, v) => sum + v, 0);

        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        categories.forEach(cat => {
            const amount = categoryData[cat];
            const percent = (amount / total) * 100;

            html += `<div>`;
            html += `<div style="display:flex;justify-content:space-between;margin-bottom:5px;">`;
            html += `<span style="font-size:14px;">${cat}</span>`;
            html += `<span style="font-weight:bold;">₱${amount.toFixed(2)} (${percent.toFixed(1)}%)</span>`;
            html += `</div>`;
            html += `<div style="background:#f0f0f0;height:8px;border-radius:4px;overflow:hidden;">`;
            html += `<div style="background:#4CAF50;height:100%;width:${percent}%;"></div>`;
            html += `</div>`;
            html += `</div>`;
        });
        html += '</div>';
    } else {
        html += '<p style="text-align:center;color:#666;padding:40px;">No expenses this month</p>';
    }

    html += '</div>';
    html += '</div>';

    return html;
}

// Modal handlers

function openPersonalExpenseModal() {
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseCategory').value = '';
    document.getElementById('expenseCreditCard').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCurrency').value = 'PHP';
    document.getElementById('expenseConversionRate').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseNotes').value = '';
    document.getElementById('expenseRecurring').checked = false;
    document.getElementById('creditCardSelector').style.display = 'none';
    document.getElementById('conversionRateGroup').style.display = 'none';

    // Populate credit card selector
    const cards = (window.allCreditCards || []).filter(c => c.isActive);
    const select = document.getElementById('expenseCreditCard');
    select.innerHTML = '<option value="">Select Card</option>';
    cards.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.cardName} (₱${c.currentBalance.toFixed(2)})</option>`;
    });

    updateOfflineIndicator();
    document.getElementById('personalExpenseModal').style.display = 'block';
}

function closePersonalExpenseModal() {
    document.getElementById('personalExpenseModal').style.display = 'none';
}

function handleExpenseCategoryChange() {
    const category = document.getElementById('expenseCategory').value;
    const cardSelector = document.getElementById('creditCardSelector');

    if (category === 'Credit Card Payment') {
        cardSelector.style.display = 'block';
    } else {
        cardSelector.style.display = 'none';
    }
}

function handleCurrencyChange() {
    const currency = document.getElementById('expenseCurrency').value;
    const rateGroup = document.getElementById('conversionRateGroup');

    if (currency === 'USD') {
        rateGroup.style.display = 'block';
    } else {
        rateGroup.style.display = 'none';
    }
}

async function savePersonalExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = document.getElementById('expenseAmount').value;
    const currency = document.getElementById('expenseCurrency').value;
    const date = document.getElementById('expenseDate').value;

    // Validate required fields
    if (!date || !category || !amount || parseFloat(amount) <= 0) {
        alert('⚠️ Please fill in all required fields (Date, Category, and Amount)');
        return;
    }

    if (category === 'Credit Card Payment') {
        // Handle as credit card payment
        const cardId = document.getElementById('expenseCreditCard').value;
        if (!cardId) {
            alert('⚠️ Please select a credit card');
            return;
        }

        const result = await recordCreditCardPayment(cardId, amount, date);
        if (result.success) {
            closePersonalExpenseModal();
        }
    } else {
        // Handle as regular expense
        const expenseData = {
            category: category,
            amount: parseFloat(amount),
            currency: currency,
            phpConversionRate: currency === 'USD' ? parseFloat(document.getElementById('expenseConversionRate').value) || 0 : 1.0,
            date: date,
            description: document.getElementById('expenseDescription').value,
            notes: document.getElementById('expenseNotes').value
        };

        const result = await addPersonalExpense(expenseData);

        if (result.success) {
            closePersonalExpenseModal();

            // Create recurring template if checked
            if (document.getElementById('expenseRecurring').checked) {
                const templateData = {
                    name: expenseData.description || expenseData.category,
                    category: expenseData.category,
                    amount: expenseData.amount,
                    currency: expenseData.currency,
                    dayOfMonth: new Date(date).getDate(),
                    isActive: true
                };

                await saveRecurringTemplate(templateData);
            }
        }
    }
}

// Additional modal functions - continuing in next part due to length...

// Export Personal Finance functions
window.buildPersonalFinanceTab = buildPersonalFinanceTab;
window.openPersonalExpenseModal = openPersonalExpenseModal;
window.closePersonalExpenseModal = closePersonalExpenseModal;
window.handleExpenseCategoryChange = handleExpenseCategoryChange;
window.handleCurrencyChange = handleCurrencyChange;
window.savePersonalExpense = savePersonalExpense;

// Recurring Template Modal
function openRecurringTemplateModal(templateId = null) {
    // Populate day selector (1-31)
    const daySelect = document.getElementById('templateDayOfMonth');
    daySelect.innerHTML = '<option value="">Select Day</option>';
    for (let i = 1; i <= 31; i++) {
        daySelect.innerHTML += `<option value="${i}">Day ${i}</option>`;
    }

    if (templateId) {
        const template = window.allRecurringTemplates.find(t => t.id === templateId);
        if (template) {
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateCategory').value = template.category;
            document.getElementById('templateAmount').value = template.amount;
            document.getElementById('templateCurrency').value = template.currency;
            document.getElementById('templateDayOfMonth').value = template.dayOfMonth;
            document.getElementById('templateActive').checked = template.isActive;
        }
    } else {
        document.getElementById('templateName').value = '';
        document.getElementById('templateCategory').value = '';
        document.getElementById('templateAmount').value = '';
        document.getElementById('templateCurrency').value = 'PHP';
        document.getElementById('templateDayOfMonth').value = '';
        document.getElementById('templateActive').checked = true;
    }

    document.getElementById('recurringTemplateModal').style.display = 'block';
}

function closeRecurringTemplateModal() {
    document.getElementById('recurringTemplateModal').style.display = 'none';
}

async function saveRecurringTemplate() {
    const templateData = {
        id: null,
        name: document.getElementById('templateName').value,
        category: document.getElementById('templateCategory').value,
        amount: document.getElementById('templateAmount').value,
        currency: document.getElementById('templateCurrency').value,
        dayOfMonth: document.getElementById('templateDayOfMonth').value,
        isActive: document.getElementById('templateActive').checked
    };

    const result = await window.saveRecurringTemplate(templateData);
    if (result.success) {
        closeRecurringTemplateModal();
    }
}

function editRecurringTemplate(templateId) {
    openRecurringTemplateModal(templateId);
}

// Credit Card Modal
function openCreditCardModal(cardId = null) {
    // Populate day selector (1-31)
    const daySelect = document.getElementById('cardDueDate');
    daySelect.innerHTML = '<option value="">Select Day</option>';
    for (let i = 1; i <= 31; i++) {
        daySelect.innerHTML += `<option value="${i}">Day ${i}</option>`;
    }

    if (cardId) {
        const card = window.allCreditCards.find(c => c.id === cardId);
        if (card) {
            document.getElementById('cardName').value = card.cardName;
            document.getElementById('cardHolder').value = card.cardHolder;
            document.getElementById('cardBank').value = card.bank;
            document.getElementById('cardLimit').value = card.creditLimit;
            document.getElementById('cardBalance').value = card.currentBalance;
            document.getElementById('cardInterestRate').value = card.interestRate;
            document.getElementById('cardDueDate').value = card.monthlyDueDate;
            document.getElementById('cardMinimumPercent').value = card.minimumPaymentPercent;
            document.getElementById('cardActive').checked = card.isActive;
        }
    } else {
        document.getElementById('cardName').value = '';
        document.getElementById('cardHolder').value = 'Mine';
        document.getElementById('cardBank').value = '';
        document.getElementById('cardLimit').value = '';
        document.getElementById('cardBalance').value = '';
        document.getElementById('cardInterestRate').value = '';
        document.getElementById('cardDueDate').value = '';
        document.getElementById('cardMinimumPercent').value = '3';
        document.getElementById('cardActive').checked = true;
    }

    document.getElementById('creditCardModal').style.display = 'block';
}

function closeCreditCardModal() {
    document.getElementById('creditCardModal').style.display = 'none';
}

async function submitCreditCardForm() {
    const cardData = {
        id: null,
        cardName: document.getElementById('cardName').value,
        cardHolder: document.getElementById('cardHolder').value,
        bank: document.getElementById('cardBank').value,
        creditLimit: document.getElementById('cardLimit').value,
        currentBalance: document.getElementById('cardBalance').value,
        interestRate: document.getElementById('cardInterestRate').value,
        monthlyDueDate: document.getElementById('cardDueDate').value,
        minimumPaymentPercent: document.getElementById('cardMinimumPercent').value,
        isActive: document.getElementById('cardActive').checked
    };

    const result = await saveCreditCard(cardData);
    if (result.success) {
        closeCreditCardModal();
    }
}

function editCreditCard(cardId) {
    openCreditCardModal(cardId);
}

function recordCardPayment(cardId) {
    openPersonalExpenseModal();
    document.getElementById('expenseCategory').value = 'Credit Card Payment';
    document.getElementById('expenseCreditCard').value = cardId;
    document.getElementById('creditCardSelector').style.display = 'block';
}

// Loan Calculator Modal
function openLoanCalculatorModal() {
    document.getElementById('loanAmount').value = '';
    document.getElementById('loanTermMonths').value = '';
    document.getElementById('loanInterestRate').value = '';
    document.getElementById('loanResultsSection').style.display = 'none';
    document.getElementById('loanCalculatorModal').style.display = 'block';
}

function closeLoanCalculatorModal() {
    document.getElementById('loanCalculatorModal').style.display = 'none';
}

function calculateLoanAffordability() {
    const amount = document.getElementById('loanAmount').value;
    const term = document.getElementById('loanTermMonths').value;
    const rate = document.getElementById('loanInterestRate').value;

    if (!amount || !term || !rate) {
        alert('⚠️ Please fill in all fields');
        return;
    }

    const analysis = window.analyzeLoanAffordability(amount, term, rate);

    if (!analysis.success) {
        alert(`Error: ${analysis.error}`);
        return;
    }

    const resultsSection = document.getElementById('loanResultsSection');
    resultsSection.style.display = 'block';
    resultsSection.style.background = analysis.recommendationColor + '22';
    resultsSection.style.border = `2px solid ${analysis.recommendationColor}`;

    resultsSection.innerHTML = `
        <h3 style="color:${analysis.recommendationColor};margin-top:0;">${analysis.recommendation}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
            <div>
                <small style="color:#666;">Monthly Payment</small>
                <div style="font-size:20px;font-weight:bold;">₱${analysis.monthlyPayment.toFixed(2)}</div>
            </div>
            <div>
                <small style="color:#666;">Debt-to-Income Ratio</small>
                <div style="font-size:20px;font-weight:bold;">${analysis.debtToIncomeRatio.toFixed(1)}%</div>
            </div>
        </div>
        <div style="background:white;padding:10px;border-radius:4px;margin-bottom:10px;">
            <h4 style="margin:5px 0;">Financial Breakdown</h4>
            <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>Current Credit Card Debt:</span>
                <span style="font-weight:bold;">₱${analysis.totalCurrentDebt.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>Monthly CC Minimums:</span>
                <span style="font-weight:bold;">₱${analysis.monthlyMinimums.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>Proposed Loan Payment:</span>
                <span style="font-weight:bold;">₱${analysis.monthlyPayment.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;border-top:1px solid #ddd;padding-top:5px;">
                <span>Total Monthly Obligations:</span>
                <span style="font-weight:bold;">₱${analysis.monthlyObligations.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>Your Monthly Budget:</span>
                <span style="font-weight:bold;">₱${analysis.monthlyBudget.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;">
                <span>Current Spending:</span>
                <span style="font-weight:bold;">₱${analysis.currentSpent.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:5px 0;border-top:1px solid #ddd;padding-top:5px;">
                <span>Remaining Cash Flow:</span>
                <span style="font-weight:bold;color:${analysis.remainingCashFlow >= 0 ? '#4CAF50' : '#F44336'};">₱${analysis.remainingCashFlow.toFixed(2)}</span>
            </div>
        </div>
        <p style="margin:10px 0;line-height:1.6;">${analysis.detailedMessage}</p>
    `;
}

// Savings Goal Modal
function openSavingsGoalModal(goalId = null) {
    if (goalId) {
        const goal = window.allSavingsGoals.find(g => g.id === goalId);
        if (goal) {
            document.getElementById('savingsGoalModalTitle').textContent = '✏️ Edit Savings Goal';
            document.getElementById('goalName').value = goal.goalName;
            document.getElementById('goalCategory').value = goal.category;
            document.getElementById('goalTarget').value = goal.targetAmount;
            document.getElementById('goalCurrent').value = goal.currentAmount || 0;
            document.getElementById('goalPriority').value = goal.priority;
            document.getElementById('goalDeadline').value = goal.deadline || '';
            document.getElementById('goalAutoAllocate').checked = goal.autoAllocate;
        }
    } else {
        document.getElementById('savingsGoalModalTitle').textContent = '🎯 New Savings Goal';
        document.getElementById('goalName').value = '';
        document.getElementById('goalCategory').value = '';
        document.getElementById('goalTarget').value = '';
        document.getElementById('goalCurrent').value = '0';
        document.getElementById('goalPriority').value = '3';
        document.getElementById('goalDeadline').value = '';
        document.getElementById('goalAutoAllocate').checked = true;
    }

    document.getElementById('savingsGoalModal').style.display = 'block';
}

function closeSavingsGoalModal() {
    document.getElementById('savingsGoalModal').style.display = 'none';
}

async function saveSavingsGoal() {
    const goalData = {
        id: null,
        goalName: document.getElementById('goalName').value,
        category: document.getElementById('goalCategory').value,
        targetAmount: document.getElementById('goalTarget').value,
        currentAmount: document.getElementById('goalCurrent').value,
        priority: document.getElementById('goalPriority').value,
        deadline: document.getElementById('goalDeadline').value,
        autoAllocate: document.getElementById('goalAutoAllocate').checked
    };

    const result = await window.saveSavingsGoal(goalData);
    if (result.success) {
        closeSavingsGoalModal();
    }
}

function editSavingsGoal(goalId) {
    openSavingsGoalModal(goalId);
}

// Contribution Modal
function openContributionModal(goalId) {
    const goal = window.allSavingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const html = `
        <div class="modal" id="contributionModal" style="display:block;">
            <div class="modal-content">
                <h3>➕ Add Contribution</h3>
                <div class="form-group">
                    <label>Goal</label>
                    <input type="text" value="${goal.goalName}" readonly style="background:#f5f5f5;">
                </div>
                <div class="form-group">
                    <label>Amount *</label>
                    <input type="number" id="contributionAmount" step="0.01" min="0" required placeholder="0.00">
                    <small style="color:#666;">Current: ₱${(goal.currentAmount || 0).toFixed(2)} / Target: ₱${goal.targetAmount.toFixed(2)}</small>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="contributionNotes" rows="2" placeholder="Optional notes"></textarea>
                </div>
                <div class="form-actions">
                    <button onclick="saveContribution('${goalId}')" class="btn-primary">💾 Add Contribution</button>
                    <button onclick="closeContributionModal()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

function closeContributionModal() {
    const modal = document.getElementById('contributionModal');
    if (modal) modal.remove();
}

async function saveContribution(goalId) {
    const amount = document.getElementById('contributionAmount').value;
    const notes = document.getElementById('contributionNotes').value;

    const result = await addManualContribution(goalId, amount, notes);
    if (result.success) {
        closeContributionModal();
    }
}

// Withdrawal Modal
let currentWithdrawalGoalId = null;

function openWithdrawalModal(goalId) {
    const goal = window.allSavingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    currentWithdrawalGoalId = goalId;
    document.getElementById('withdrawalGoalName').value = goal.goalName;
    document.getElementById('withdrawalMaxAmount').textContent = `Maximum: ₱${(goal.currentAmount || 0).toFixed(2)}`;
    document.getElementById('withdrawalAmount').value = '';
    document.getElementById('withdrawalReason').value = '';
    document.getElementById('withdrawalModal').style.display = 'block';
}

function closeWithdrawalModal() {
    currentWithdrawalGoalId = null;
    document.getElementById('withdrawalModal').style.display = 'none';
}

async function saveWithdrawal() {
    const amount = document.getElementById('withdrawalAmount').value;
    const reason = document.getElementById('withdrawalReason').value;

    const result = await recordWithdrawal(currentWithdrawalGoalId, amount, reason);
    if (result.success) {
        closeWithdrawalModal();
    }
}

// Goal Completion Modal
function openGoalCompletionModal(goal) {
    const content = document.getElementById('goalCompletionContent');
    content.innerHTML = `
        <div style="font-size:80px;margin:20px 0;">🎉</div>
        <h2 style="margin:10px 0;">Congratulations!</h2>
        <p style="font-size:18px;margin:15px 0;">You've completed your goal:<br><strong>${goal.goalName}</strong></p>
        <div style="background:#E8F5E9;padding:15px;border-radius:8px;margin:20px 0;">
            <div style="font-size:32px;font-weight:bold;color:#4CAF50;">₱${goal.currentAmount.toFixed(2)}</div>
            <small style="color:#666;">Target: ₱${goal.targetAmount.toFixed(2)}</small>
        </div>
        <p style="color:#666;margin:15px 0;">Your monthly allocation for this goal will be redistributed to other active goals.</p>
    `;

    document.getElementById('goalCompletionModal').style.display = 'block';
}

function closeGoalCompletionModal() {
    document.getElementById('goalCompletionModal').style.display = 'none';
}

function redistributeGoalAllocation() {
    closeGoalCompletionModal();
    alert('✅ Allocation will be automatically redistributed next month!');
}

// Allocation Recommendation
function showAllocationRecommendation() {
    const today = new Date();
    const budget = calculateNetPersonalBudget(today.getMonth() + 1, today.getFullYear());

    if (!budget.isTechnician || budget.savingsPool <= 0) {
        alert('ℹ️ No savings pool available to allocate');
        return;
    }

    const allocation = recommendGoalAllocation(budget.savingsPool);

    if (allocation.recommendations.length === 0) {
        alert('ℹ️ No active goals to allocate to. Create goals first!');
        return;
    }

    let message = `💰 Savings Pool: ₱${budget.savingsPool.toFixed(2)}\n`;
    message += `📊 Strategy: ${allocation.allocationStrategy}\n\n`;

    if (allocation.emergencyFundStatus) {
        const status = allocation.emergencyFundStatus;
        message += `🚨 Emergency Fund Status:\n`;
        message += `   Current: ₱${status.current.toFixed(2)}\n`;
        message += `   Target: ₱${status.target.toFixed(2)}\n`;
        message += `   Coverage: ${status.monthsOfExpensesCovered.toFixed(1)} months\n`;
        message += `   Progress: ${status.percentComplete.toFixed(1)}%\n\n`;
    }

    message += `Recommended Allocation:\n\n`;

    allocation.recommendations.forEach(rec => {
        message += `${rec.goalName}:\n`;
        message += `   Amount: ₱${rec.suggestedAmount.toFixed(2)}\n`;
        message += `   Percentage: ${rec.suggestedPercent.toFixed(1)}%\n`;
        message += `   ${rec.reasoning}\n\n`;
    });

    const confirm = window.confirm(message + '\nApply this allocation?');

    if (confirm) {
        allocateSavingsFromCommission(today.getMonth() + 1, today.getFullYear());
    }
}

// Manual Budget Save
async function saveManualBudget(month, year) {
    const amount = parseFloat(document.getElementById('manualBudgetInput').value);

    if (isNaN(amount) || amount < 0) {
        alert('⚠️ Please enter a valid amount');
        return;
    }

    try {
        utils.showLoading(true);

        // Find existing budget or create new
        const existingBudget = window.allPersonalBudgets.find(b =>
            b.month === month && b.year === year
        );

        if (existingBudget) {
            await db.ref(`personalBudgets/${existingBudget.id}`).update({
                manualBudgetAmount: amount,
                updatedAt: new Date().toISOString()
            });
        } else {
            await db.ref('personalBudgets').push({
                userId: window.currentUser.uid,
                month: month,
                year: year,
                manualBudgetAmount: amount,
                createdAt: new Date().toISOString()
            });
        }

        utils.showLoading(false);
        alert(`✅ Budget saved: ₱${amount.toFixed(2)}`);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        console.error('❌ Error saving budget:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
    }
}

// Export Personal Finances to CSV
function exportPersonalFinancesCSV(month, year) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const expenses = (window.allPersonalExpenses || []).filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (expenses.length === 0) {
        alert('ℹ️ No expenses to export for this month');
        return;
    }

    let csv = 'Date,Category,Description,Amount,Currency,Conversion Rate,PHP Equivalent,Notes,Sync Status\n';

    expenses.forEach(e => {
        const phpAmount = e.currency === 'USD' ? e.amount * e.phpConversionRate : e.amount;
        const row = [
            new Date(e.date).toLocaleDateString(),
            e.category,
            `"${(e.description || '').replace(/"/g, '""')}"`,
            e.amount.toFixed(2),
            e.currency,
            e.phpConversionRate || 1,
            phpAmount.toFixed(2),
            `"${(e.notes || '').replace(/"/g, '""')}"`,
            e.syncStatus || 'synced'
        ];
        csv += row.join(',') + '\n';
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-expenses-${year}-${String(month).padStart(2, '0')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`✅ Exported ${expenses.length} expenses to CSV`);
}

// Filter expenses in table
function filterExpenses() {
    const searchTerm = document.getElementById('expenseSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const rows = document.querySelectorAll('#expenseTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const category = row.cells[1].textContent;

        const matchesSearch = text.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;

        row.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
    });
}

/**
 * Build Extract Remittance Data Tab (Admin Only)
 */
function buildExtractRemittanceTab(container) {
    console.log('🔍 Building Extract Remittance Data tab...');

    // Set refresh callback
    window.currentTabRefresh = () => buildExtractRemittanceTab(container);

    // Set default dates
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const defaultStartDate = lastWeek.toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    container.innerHTML = `
        <div class="page-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px;">🔍 Extract Remittance Data</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Extract and verify historical remittance calculations</p>
        </div>

        <!-- Controls -->
        <div class="data-card" style="margin-bottom: 30px;">
            <h2 style="margin-bottom: 20px; color: #333;">📅 Extraction Settings</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Start Date:</label>
                    <input type="date" id="extractStartDate" value="${defaultStartDate}" 
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">End Date:</label>
                    <input type="date" id="extractEndDate" value="${defaultEndDate}"
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Technician:</label>
                    <select id="extractTechFilter" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;">
                        <option value="">All Technicians</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Status:</label>
                    <select id="extractStatusFilter" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="performExtraction()">🔍 Extract Data</button>
                <button class="btn btn-secondary" onclick="setExtractionDateRange('week')">Last 7 Days</button>
                <button class="btn btn-secondary" onclick="setExtractionDateRange('month')">Last 30 Days</button>
                <button class="btn btn-success" onclick="exportExtractionJSON()" id="exportExtractBtn" style="display:none;">📥 Export JSON</button>
                <button class="btn btn-success" onclick="exportExtractionCSV()" id="exportExtractCSVBtn" style="display:none;">📊 Export CSV</button>
            </div>
        </div>

        <!-- Instructions -->
        <div class="alert alert-info" style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin-bottom: 20px; border-radius: 6px;">
            <strong>ℹ️ Instructions:</strong> Select a date range and click "Extract Data" to analyze historical remittances. 
            The system will verify the 40/60 split calculation (Technician 40%, Shop 60%) and identify any discrepancies.
        </div>

        <!-- Results Container -->
        <div id="extractionResults"></div>
    `;

    // Populate technician filter from remittances
    populateTechFilterFromRemittances();
}

function populateTechFilterFromRemittances() {
    const techFilter = document.getElementById('extractTechFilter');
    if (!techFilter) return;

    // Get unique technicians from all remittances in Firebase
    db.ref('techRemittances').once('value').then(snapshot => {
        const techMap = new Map();
        snapshot.forEach(child => {
            const data = child.val();
            if (data.techName && data.techId) {
                techMap.set(data.techId, data.techName);
            }
        });

        // Sort by name and populate
        const techs = Array.from(techMap.entries())
            .sort((a, b) => a[1].localeCompare(b[1]));

        techs.forEach(([techId, techName]) => {
            const option = document.createElement('option');
            option.value = techId;
            option.textContent = techName;
            techFilter.appendChild(option);
        });
    }).catch(error => {
        console.error('Error loading technicians:', error);
    });
}

function setExtractionDateRange(range) {
    const today = new Date();
    const startDateInput = document.getElementById('extractStartDate');
    const endDateInput = document.getElementById('extractEndDate');

    if (!startDateInput || !endDateInput) return;

    const startDate = new Date(today);
    if (range === 'week') {
        startDate.setDate(today.getDate() - 7);
    } else if (range === 'month') {
        startDate.setDate(today.getDate() - 30);
    }

    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
}

// Export functions
window.buildExtractRemittanceTab = buildExtractRemittanceTab;
window.setExtractionDateRange = setExtractionDateRange;

// Export all modal and helper functions
window.openRecurringTemplateModal = openRecurringTemplateModal;
window.closeRecurringTemplateModal = closeRecurringTemplateModal;
window.saveRecurringTemplate = saveRecurringTemplate;
window.editRecurringTemplate = editRecurringTemplate;
window.openCreditCardModal = openCreditCardModal;
window.closeCreditCardModal = closeCreditCardModal;
window.submitCreditCardForm = submitCreditCardForm;
window.editCreditCard = editCreditCard;
window.recordCardPayment = recordCardPayment;
window.openLoanCalculatorModal = openLoanCalculatorModal;
window.closeLoanCalculatorModal = closeLoanCalculatorModal;
window.calculateLoanAffordability = calculateLoanAffordability;
window.openSavingsGoalModal = openSavingsGoalModal;
window.closeSavingsGoalModal = closeSavingsGoalModal;
window.saveSavingsGoal = saveSavingsGoal;
window.editSavingsGoal = editSavingsGoal;
window.openContributionModal = openContributionModal;
window.closeContributionModal = closeContributionModal;
window.saveContribution = saveContribution;
window.openWithdrawalModal = openWithdrawalModal;
window.closeWithdrawalModal = closeWithdrawalModal;
window.saveWithdrawal = saveWithdrawal;
window.openGoalCompletionModal = openGoalCompletionModal;
window.closeGoalCompletionModal = closeGoalCompletionModal;
window.redistributeGoalAllocation = redistributeGoalAllocation;
window.showAllocationRecommendation = showAllocationRecommendation;
window.saveManualBudget = saveManualBudget;
window.exportPersonalFinancesCSV = exportPersonalFinancesCSV;
window.filterExpenses = filterExpenses;

// ===== COMMISSION ADJUSTMENT UI =====

function openCommissionAdjustmentModal() {
    const modal = document.getElementById('commissionAdjustmentModal');
    const content = document.getElementById('commissionAdjustmentContent');

    // Load staged adjustments from sessionStorage if available
    try {
        const staged = sessionStorage.getItem('stagedAdjustments');
        if (staged) {
            window.stagedAdjustments = JSON.parse(staged);
        }
    } catch (e) {
        console.warn('Could not load staged adjustments:', e);
    }

    content.innerHTML = `
        <div style="background:var(--bg-white);border-radius:8px;margin-bottom:20px;">
            <!-- Tab Navigation -->
            <div style="display:flex;border-bottom:2px solid var(--border-color);margin-bottom:20px;">
                <button onclick="showAdjustmentTab('baseline')" id="tab-baseline" class="adjustment-tab active" 
                        style="padding:15px 25px;border:none;background:transparent;cursor:pointer;border-bottom:3px solid var(--primary-color);font-weight:600;">
                    Set Baseline Rates
                </button>
                <button onclick="showAdjustmentTab('detect')" id="tab-detect" class="adjustment-tab"
                        style="padding:15px 25px;border:none;background:transparent;cursor:pointer;font-weight:600;">
                    Detect & Stage
                </button>
                <button onclick="showAdjustmentTab('review')" id="tab-review" class="adjustment-tab"
                        style="padding:15px 25px;border:none;background:transparent;cursor:pointer;font-weight:600;">
                    Review & Apply ${window.stagedAdjustments && window.stagedAdjustments.length > 0 ? `<span style="background:var(--danger-color);color:white;padding:2px 8px;border-radius:12px;font-size:11px;margin-left:5px;">${window.stagedAdjustments.length}</span>` : ''}
                </button>
                <button onclick="showAdjustmentTab('cleanup')" id="tab-cleanup" class="adjustment-tab"
                        style="padding:15px 25px;border:none;background:transparent;cursor:pointer;font-weight:600;">
                    Cleanup Logs
                </button>
            </div>

            <!-- Tab Content -->
            <div id="adjustment-tab-content"></div>
        </div>
    `;

    modal.style.display = 'block';
    showAdjustmentTab('baseline');
}

function closeCommissionAdjustmentModal() {
    document.getElementById('commissionAdjustmentModal').style.display = 'none';
}

function showAdjustmentTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.adjustment-tab').forEach(btn => {
        btn.style.borderBottom = 'none';
        btn.style.color = 'var(--text-secondary)';
    });
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.style.borderBottom = '3px solid var(--primary-color)';
        activeTab.style.color = 'var(--primary-color)';
    }

    const content = document.getElementById('adjustment-tab-content');

    if (tabName === 'baseline') {
        renderBaselineTab(content);
    } else if (tabName === 'detect') {
        renderDetectTab(content);
    } else if (tabName === 'review') {
        renderReviewTab(content);
    } else if (tabName === 'cleanup') {
        renderCleanupTab(content);
    }
}

function renderBaselineTab(container) {
    // Get all techs for dropdown
    const techs = Object.values(window.allUsers || {})
        .filter(u => u.role === 'technician' || u.role === 'admin' || u.role === 'manager')
        .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

    container.innerHTML = `
        <div style="padding:20px;">
            <div style="background:var(--warning-bg);border-left:4px solid var(--warning-color);padding:15px;margin-bottom:20px;border-radius:8px;">
                <strong>⚠️ Set Baseline Rates:</strong> Use this to set historical commission rates for technicians.
                This is useful for migration or when onboarding new hires with custom compensation.
                The system will warn if existing remittances will be affected.
            </div>

            <div style="max-width:600px;margin:0 auto;">
                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Technician</label>
                    <select id="baselineTechId" class="form-input" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="">Select Technician</option>
                        ${techs.map(t => `
                            <option value="${t.uid}">${t.displayName} (${t.compensationType || 'commission'} - ${((t.commissionRate || 0.40) * 100).toFixed(0)}%)</option>
                        `).join('')}
                    </select>
                </div>

                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Compensation Type</label>
                    <select id="baselineCompType" class="form-input" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="commission">Commission Only</option>
                        <option value="salary">Salary Only (0% commission)</option>
                        <option value="hybrid">Hybrid (Salary + Commission)</option>
                        <option value="none">None (Cashier, etc.)</option>
                    </select>
                </div>

                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Commission Rate (decimal, e.g., 0.40 for 40%)</label>
                    <input type="number" id="baselineRate" class="form-input" step="0.01" min="0" max="1" value="0.40"
                           style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;">
                </div>

                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Effective Date</label>
                    <input type="date" id="baselineEffectiveDate" class="form-input"
                           style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;">
                </div>

                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Reason</label>
                    <input type="text" id="baselineReason" class="form-input" placeholder="e.g., Migration baseline, New hire rate"
                           style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;">
                </div>

                <button onclick="saveBaselineRate()" class="btn-primary" style="width:100%;padding:12px;font-size:16px;">
                    💾 Save Baseline Rate
                </button>
            </div>
        </div>
    `;
}

function renderDetectTab(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="background:var(--info-bg);border-left:4px solid var(--info-color);padding:15px;margin-bottom:20px;border-radius:8px;">
                <strong>🔍 Auto-Detect Adjustments:</strong> Scan last 100 remittances for commission calculation errors.
                The system will compare stored commissions against recalculated values using historical rates.
                Differences > ₱1 will be flagged for review.
            </div>

            <button onclick="runAdjustmentDetection()" class="btn-primary" style="padding:12px 24px;font-size:16px;">
                🔍 Scan for Adjustments
            </button>

            <div id="detection-results" style="margin-top:20px;"></div>
        </div>
    `;
}

function renderReviewTab(container) {
    const staged = window.stagedAdjustments || [];

    if (staged.length === 0) {
        container.innerHTML = `
            <div style="padding:40px;text-align:center;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:15px;">📋</div>
                <p style="font-size:18px;margin-bottom:10px;">No staged adjustments</p>
                <p>Run "Detect & Stage" to find adjustments needing review</p>
            </div>
        `;
        return;
    }

    // Group by tech
    const byTech = {};
    staged.forEach(adj => {
        if (!byTech[adj.techId]) {
            byTech[adj.techId] = {
                techName: adj.techName,
                adjustments: [],
                totalDifference: 0
            };
        }
        byTech[adj.techId].adjustments.push(adj);
        byTech[adj.techId].totalDifference += adj.difference;
    });

    container.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h4 style="margin:0;">${staged.length} Adjustments Staged</h4>
                <div style="display:flex;gap:10px;">
                    <button onclick="clearStagedAdjustments()" class="btn-secondary">Clear All</button>
                    <button onclick="applyAllStagedAdjustments()" class="btn-primary">Apply All Adjustments</button>
                </div>
            </div>

            ${Object.entries(byTech).map(([techId, data]) => `
                <div style="background:var(--bg-secondary);padding:20px;border-radius:12px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <h4 style="margin:0;">${data.techName}</h4>
                        <div style="font-size:24px;font-weight:bold;color:${data.totalDifference >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ${data.totalDifference >= 0 ? '+' : ''}₱${Math.abs(data.totalDifference).toFixed(2)}
                        </div>
                    </div>

                    ${data.adjustments.map(adj => `
                        <details style="background:var(--bg-white);padding:15px;border-radius:8px;margin-bottom:10px;">
                            <summary style="cursor:pointer;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
                                <span>Remittance ${adj.remittanceId.substring(0, 8)}... (${new Date(adj.submittedAt).toLocaleDateString()})</span>
                                <span style="color:${adj.difference >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${adj.difference >= 0 ? '+' : ''}₱${adj.difference.toFixed(2)}
                                </span>
                            </summary>

                            <div style="margin-top:15px;">
                                <table class="repair-table" style="font-size:13px;">
                                    <thead>
                                        <tr>
                                            <th>Repair ID</th>
                                            <th>Customer</th>
                                            <th>Device</th>
                                            <th>Original</th>
                                            <th>Recalculated</th>
                                            <th>Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${adj.repairs.map(r => `
                                            <tr>
                                                <td>${r.repairId.substring(0, 8)}...</td>
                                                <td>${r.customerName}</td>
                                                <td>${r.device}</td>
                                                <td>₱${r.originalCommission.toFixed(2)}</td>
                                                <td>₱${r.recalculatedCommission.toFixed(2)}</td>
                                                <td style="color:${r.difference >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                                    ${r.difference >= 0 ? '+' : ''}₱${r.difference.toFixed(2)}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

function renderCleanupTab(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="background:var(--warning-bg);border-left:4px solid var(--warning-color);padding:15px;margin-bottom:20px;border-radius:8px;">
                <strong>🗑️ Cleanup Old Logs:</strong> Delete commission adjustment logs and exports older than 24 months.
                You MUST download all files locally before cleanup. This action cannot be undone.
            </div>

            <button onclick="scanForCleanupFiles()" class="btn-primary" style="padding:12px 24px;font-size:16px;">
                🔍 Scan for Old Files
            </button>

            <div id="cleanup-results" style="margin-top:20px;"></div>
        </div>
    `;
}

async function saveBaselineRate() {
    const techId = document.getElementById('baselineTechId').value;
    const compType = document.getElementById('baselineCompType').value;
    const rate = parseFloat(document.getElementById('baselineRate').value);
    const effectiveDate = document.getElementById('baselineEffectiveDate').value;
    const reason = document.getElementById('baselineReason').value.trim();

    if (!techId || !compType || !effectiveDate) {
        alert('⚠️ Please fill all required fields');
        return;
    }

    const success = await window.setBaselineCommissionRate(techId, rate, compType, effectiveDate, reason);
    if (success) {
        // Clear form
        document.getElementById('baselineTechId').value = '';
        document.getElementById('baselineRate').value = '0.40';
        document.getElementById('baselineEffectiveDate').value = '';
        document.getElementById('baselineReason').value = '';
    }
}

async function runAdjustmentDetection() {
    const resultsDiv = document.getElementById('detection-results');
    resultsDiv.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Scanning remittances...</div>';

    try {
        const adjustments = window.detectRemittancesNeedingAdjustment();

        if (adjustments.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                    <div style="font-size:48px;margin-bottom:15px;">✅</div>
                    <p style="font-size:18px;">No adjustments needed</p>
                    <p>All remittances are calculated correctly</p>
                </div>
            `;
            return;
        }

        // Stage adjustments
        window.stageAdjustments(adjustments);

        // Show results
        const totalDifference = adjustments.reduce((sum, adj) => sum + adj.difference, 0);

        resultsDiv.innerHTML = `
            <div style="background:var(--success-bg);border-left:4px solid var(--success-color);padding:15px;margin-bottom:20px;border-radius:8px;">
                <strong>✅ Detection Complete:</strong> Found ${adjustments.length} remittances needing adjustment.
                Total adjustment: ${totalDifference >= 0 ? '+' : ''}₱${totalDifference.toFixed(2)}
            </div>

            <p style="margin-bottom:15px;">Adjustments have been staged for review. Switch to the "Review & Apply" tab to approve.</p>

            <button onclick="showAdjustmentTab('review')" class="btn-primary">
                Go to Review & Apply →
            </button>
        `;

        // Update badge count
        const reviewTab = document.getElementById('tab-review');
        if (reviewTab) {
            reviewTab.innerHTML = `Review & Apply <span style="background:var(--danger-color);color:white;padding:2px 8px;border-radius:12px;font-size:11px;margin-left:5px;">${adjustments.length}</span>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `
            <div style="background:var(--danger-bg);border-left:4px solid var(--danger-color);padding:15px;border-radius:8px;">
                <strong>❌ Error:</strong> ${error.message}
            </div>
        `;
    }
}

function clearStagedAdjustments() {
    if (!confirm('Clear all staged adjustments?')) return;

    window.stagedAdjustments = [];
    sessionStorage.removeItem('stagedAdjustments');

    renderReviewTab(document.getElementById('adjustment-tab-content'));

    const reviewTab = document.getElementById('tab-review');
    if (reviewTab) {
        reviewTab.innerHTML = 'Review & Apply';
    }
}

async function applyAllStagedAdjustments() {
    const staged = window.stagedAdjustments || [];
    if (staged.length === 0) {
        alert('No staged adjustments to apply');
        return;
    }

    // Mark all as approved
    const approved = staged.map(adj => ({ ...adj, approved: true }));

    const results = await window.applyApprovedAdjustments(approved);

    if (results) {
        // Refresh review tab
        renderReviewTab(document.getElementById('adjustment-tab-content'));

        // Update badge
        const reviewTab = document.getElementById('tab-review');
        if (reviewTab) {
            reviewTab.innerHTML = 'Review & Apply';
        }
    }
}

async function scanForCleanupFiles() {
    const resultsDiv = document.getElementById('cleanup-results');
    resultsDiv.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Scanning for old files...</div>';

    try {
        const files = await window.getStorageFilesForCleanup();

        if (files.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                    <div style="font-size:48px;margin-bottom:15px;">✅</div>
                    <p style="font-size:18px;">No files to cleanup</p>
                    <p>All files are within the 24-month retention period</p>
                </div>
            `;
            return;
        }

        let downloadComplete = false;

        resultsDiv.innerHTML = `
            <div style="background:var(--warning-bg);border-left:4px solid var(--warning-color);padding:15px;margin-bottom:20px;border-radius:8px;">
                <strong>⚠️ Found ${files.length} files to cleanup</strong>
            </div>

            <table class="repair-table" style="margin-bottom:20px;">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Date</th>
                        <th>Age (months)</th>
                        <th>Size (KB)</th>
                    </tr>
                </thead>
                <tbody>
                    ${files.map(f => `
                        <tr>
                            <td>${f.filename}</td>
                            <td>${f.date.toLocaleDateString()}</td>
                            <td>${f.ageMonths}</td>
                            <td>${f.sizeKB}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display:flex;gap:10px;margin-bottom:20px;">
                <button onclick="downloadAllCleanupFiles()" id="downloadBtn" class="btn-primary">
                    📥 Download All Locally
                </button>
                <button onclick="confirmCleanupDelete()" id="deleteBtn" class="btn-danger" disabled>
                    🗑️ Delete from Firebase
                </button>
            </div>

            <div id="cleanup-status"></div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div style="background:var(--danger-bg);border-left:4px solid var(--danger-color);padding:15px;border-radius:8px;">
                <strong>❌ Error:</strong> ${error.message}
            </div>
        `;
    }
}

async function downloadAllCleanupFiles() {
    // This would need JSZip library to be added
    alert('⚠️ Download feature requires JSZip library.\n\nFor now, please manually download files from Firebase Console before cleanup.');

    // Enable delete button after "download"
    document.getElementById('deleteBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = true;
    document.getElementById('downloadBtn').textContent = '✅ Downloaded';

    document.getElementById('cleanup-status').innerHTML = `
        <div style="background:var(--success-bg);border-left:4px solid var(--success-color);padding:15px;border-radius:8px;">
            <strong>✅ Ready for cleanup:</strong> You can now delete files from Firebase.
        </div>
    `;
}

async function confirmCleanupDelete() {
    const confirmed = await window.cleanupOldAdjustmentLogs(true);
    if (confirmed) {
        document.getElementById('cleanup-results').innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--success-color);">
                <div style="font-size:48px;margin-bottom:15px;">✅</div>
                <p style="font-size:18px;">Cleanup complete</p>
            </div>
        `;
    }
}

// ========================================
// PARTS ORDERING TABS
// ========================================

/**
 * Get enhanced status display with parts info
 */
function getEnhancedStatusDisplay(repair) {
    const activeOrders = (window.allPartsOrders || []).filter(o =>
        o.repairId === repair.id &&
        ['pending', 'approved', 'ordered'].includes(o.status)
    );

    const unacknowledgedParts = (window.allPartsOrders || []).filter(o =>
        o.repairId === repair.id &&
        o.status === 'received' &&
        !o.acknowledgedByTech
    );

    let statusText = repair.status;
    let statusIcon = '';

    if (unacknowledgedParts.length > 0) {
        statusIcon = ' 🎉';
    } else if (activeOrders.length > 0) {
        if (repair.workaroundActive || repair.status === 'In Progress (Parts Pending)') {
            statusText = `In Progress (⏳ ${activeOrders.length} parts pending)`;
            statusIcon = ' 🔧⏳';
        } else if (repair.status === 'Waiting for Parts') {
            statusText = `Waiting for Parts (${activeOrders.length})`;
            statusIcon = ' ⏳';
        }
    }

    return { statusText, statusIcon, activeOrders: activeOrders.length, unacknowledgedParts: unacknowledgedParts.length };
}

/**
 * Build Parts Orders Tab (Technician View)
 */
function buildPartsOrdersTab(container) {
    console.log('📦 Building Parts Orders tab');

    // Set refresh callback
    window.currentTabRefresh = () => buildPartsOrdersTab(
        document.getElementById('parts-ordersTab')
    );

    const techId = window.currentUser.uid;
    const myOrders = (window.allPartsOrders || []).filter(o => o.requestedBy === techId);

    // Group by status
    const unacknowledged = myOrders.filter(o => o.status === 'received' && !o.acknowledgedByTech);
    const pending = myOrders.filter(o => o.status === 'pending');
    const approved = myOrders.filter(o => o.status === 'approved');
    const ordered = myOrders.filter(o => o.status === 'ordered');
    const received = myOrders.filter(o => o.status === 'received' && o.acknowledgedByTech);
    const cancelled = myOrders.filter(o => o.status === 'cancelled');

    container.innerHTML = `
        <div class="page-header">
            <h2>📦 Parts Orders</h2>
            <p>Manage your parts order requests</p>
        </div>
        
        ${unacknowledged.length > 0 ? `
            <div style="background:#10b981;color:white;padding:15px;border-radius:8px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong style="font-size:18px;">🎉 ${unacknowledged.length} Parts Received!</strong>
                        <p style="margin:5px 0 0 0;opacity:0.9;">Parts are ready for use in repairs</p>
                    </div>
                    <button class="btn-primary" onclick="acknowledgeAllPartsReceived()" style="background:white;color:#10b981;">
                        Acknowledge All
                    </button>
                </div>
            </div>
        ` : ''}
        
        <div class="stats-grid" style="margin-bottom:20px;">
            <div class="stat-card" style="background:var(--warning-bg);border-left:4px solid var(--warning-color);">
                <div class="stat-value">${pending.length}</div>
                <div class="stat-label">⏳ Pending Approval</div>
            </div>
            <div class="stat-card" style="background:var(--info-bg);border-left:4px solid var(--info-color);">
                <div class="stat-value">${approved.length + ordered.length}</div>
                <div class="stat-label">📞 Approved/Ordered</div>
            </div>
            <div class="stat-card" style="background:var(--success-bg);border-left:4px solid var(--success-color);">
                <div class="stat-value">${received.length}</div>
                <div class="stat-label">✅ Received</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${myOrders.length}</div>
                <div class="stat-label">📊 Total Orders</div>
            </div>
        </div>
        
        ${renderOrdersSection('⏳ Pending Approval', pending, 'warning')}
        ${renderOrdersSection('✅ Approved', approved, 'info')}
        ${renderOrdersSection('📞 Ordered', ordered, 'info')}
        ${renderOrdersSection('📦 Received', unacknowledged.concat(received), 'success')}
        ${renderOrdersSection('🚫 Cancelled', cancelled, 'danger')}
    `;
}

/**
 * Build Approve Parts Orders Tab (Admin View)
 */
function buildApprovePartsOrdersTab(container) {
    console.log('📦 Building Approve Parts Orders tab');

    // Set refresh callback
    window.currentTabRefresh = () => buildApprovePartsOrdersTab(
        document.getElementById('approve-parts-ordersTab')
    );

    const allOrders = window.allPartsOrders || [];

    // Group by status
    const pending = allOrders.filter(o => o.status === 'pending');
    const approved = allOrders.filter(o => o.status === 'approved');
    const ordered = allOrders.filter(o => o.status === 'ordered');
    const received = allOrders.filter(o => o.status === 'received').slice(0, 20); // Last 20
    const urgent = pending.filter(o => o.urgency === 'urgent');

    container.innerHTML = `
        <div class="page-header">
            <h2>📦 Approve Parts Orders</h2>
            <p>Review and manage all parts order requests</p>
        </div>
        
        ${urgent.length > 0 ? `
            <div style="background:#ef4444;color:white;padding:15px;border-radius:8px;margin-bottom:20px;">
                <strong style="font-size:18px;">🔴 ${urgent.length} Urgent Order(s) Waiting!</strong>
                <p style="margin:5px 0 0 0;opacity:0.9;">Customers are waiting for these parts</p>
            </div>
        ` : ''}
        
        <div class="stats-grid" style="margin-bottom:20px;">
            <div class="stat-card" style="background:var(--warning-bg);border-left:4px solid var(--warning-color);">
                <div class="stat-value">${pending.length}</div>
                <div class="stat-label">⏳ Pending Approval</div>
            </div>
            <div class="stat-card" style="background:var(--info-bg);border-left:4px solid var(--info-color);">
                <div class="stat-value">${approved.length}</div>
                <div class="stat-label">✅ Approved</div>
            </div>
            <div class="stat-card" style="background:var(--info-bg);border-left:4px solid var(--info-color);">
                <div class="stat-value">${ordered.length}</div>
                <div class="stat-label">📞 Ordered</div>
            </div>
            <div class="stat-card" style="background:var(--success-bg);border-left:4px solid var(--success-color);">
                <div class="stat-value">${received.length}</div>
                <div class="stat-label">📦 Recently Received</div>
            </div>
        </div>
        
        ${renderAdminOrdersSection('⏳ Pending Approval', pending, 'pending')}
        ${renderAdminOrdersSection('✅ Approved (Ready to Order)', approved, 'approved')}
        ${renderAdminOrdersSection('📞 Ordered (Awaiting Delivery)', ordered, 'ordered')}
        ${renderAdminOrdersSection('📦 Recently Received', received, 'received')}
    `;
}

/**
 * Render orders section (Technician view)
 */
function renderOrdersSection(title, orders, colorType) {
    if (orders.length === 0) {
        return `
            <div class="card" style="margin-bottom:20px;">
                <h3 style="margin-bottom:10px;">${title} (0)</h3>
                <p style="color:#999;margin:0;">No orders in this status</p>
            </div>
        `;
    }

    // Group by repair
    const byRepair = {};
    orders.forEach(order => {
        if (!byRepair[order.repairId]) {
            byRepair[order.repairId] = [];
        }
        byRepair[order.repairId].push(order);
    });

    let html = `
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:15px;">${title} (${orders.length})</h3>
    `;

    for (const [repairId, repairOrders] of Object.entries(byRepair)) {
        const firstOrder = repairOrders[0];

        html += `
            <div class="repair-card" style="margin-bottom:15px;background:#f9fafb;padding:15px;border-radius:8px;border-left:4px solid var(--${colorType}-color);">
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                    <div>
                        <strong>${firstOrder.repairDetails.customerName}</strong> - ${firstOrder.repairDetails.device}
                        <div style="font-size:13px;color:#666;margin-top:3px;">
                            ${firstOrder.repairDetails.problem}
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="switchTab('all'); setTimeout(() => filterRepairById('${repairId}'), 500);" style="font-size:12px;">
                        View Repair
                    </button>
                </div>
                
                ${repairOrders.map(order => {
            const urgencyIcon = order.urgency === 'urgent' ? '🔴' : order.urgency === 'normal' ? '🟡' : '🟢';
            const age = utils.daysAgo(order.requestedAt);

            let statusBadge = '';
            if (order.status === 'pending') {
                statusBadge = `<span class="badge" style="background:#f59e0b;color:white;">⏳ Pending</span>`;
            } else if (order.status === 'approved') {
                statusBadge = `<span class="badge" style="background:#3b82f6;color:white;">✅ Approved</span>`;
            } else if (order.status === 'ordered') {
                statusBadge = `<span class="badge" style="background:#8b5cf6;color:white;">📞 Ordered</span>`;
            } else if (order.status === 'received') {
                const varianceIcon = !order.priceVariancePercent ? '' :
                    Math.abs(order.priceVariancePercent) <= 10 ? '🟢' :
                        Math.abs(order.priceVariancePercent) <= 20 ? '⚠️' : '🔴';
                statusBadge = `<span class="badge" style="background:#10b981;color:white;">📦 Received ${varianceIcon}</span>`;
            } else if (order.status === 'cancelled') {
                statusBadge = `<span class="badge" style="background:#ef4444;color:white;">🚫 Cancelled</span>`;
            }

            let actionButtons = '';
            if (order.status === 'pending' || order.status === 'approved') {
                actionButtons = `<button class="btn-danger" onclick="cancelPartsOrder('${order.id}')" style="font-size:11px;padding:3px 8px;">Cancel</button>`;
            }

            if (order.status === 'received' && !order.acknowledgedByTech) {
                actionButtons = `<button class="btn-primary" onclick="acknowledgePartsReceived('${order.id}')" style="font-size:11px;padding:3px 8px;">Acknowledge</button>`;
            }

            return `
                        <div style="background:white;padding:12px;border-radius:6px;margin-top:10px;border:1px solid #e5e7eb;">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                                <div>
                                    <strong>${urgencyIcon} ${order.partName}</strong> (x${order.quantity})
                                    <div style="font-size:12px;color:#666;margin-top:2px;">
                                        Order #${order.orderNumber} • ${age}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    ${statusBadge}
                                </div>
                            </div>
                            
                            ${order.supplierName ? `<div style="font-size:12px;color:#666;">Supplier: ${order.supplierName}</div>` : ''}
                            
                            ${order.estimatedPrice ? `<div style="font-size:12px;margin-top:5px;">Est: ₱${order.estimatedPrice}/unit (Total: ₱${(order.estimatedPrice * order.quantity).toFixed(2)})</div>` : ''}
                            
                            ${order.actualPrice ? `
                                <div style="font-size:12px;margin-top:3px;color:#10b981;">
                                    <strong>Actual: ₱${order.actualPrice}/unit (Total: ₱${(order.actualPrice * order.quantity).toFixed(2)})</strong>
                                    ${order.priceVariance ? `<span style="color:${order.priceVariance > 0 ? '#ef4444' : '#10b981'};">(${order.priceVariance > 0 ? '+' : ''}₱${order.priceVariance.toFixed(2)})</span>` : ''}
                                </div>
                            ` : ''}
                            
                            ${order.estimatedArrival && order.status === 'ordered' ? `
                                <div style="font-size:12px;margin-top:5px;color:#f59e0b;">
                                    ETA: ${utils.formatDate(order.estimatedArrival)}
                                </div>
                            ` : ''}
                            
                            ${order.notes ? `<div style="font-size:12px;color:#666;margin-top:5px;font-style:italic;">${order.notes}</div>` : ''}
                            
                            ${order.cancellationReason ? `
                                <div style="font-size:12px;color:#ef4444;margin-top:5px;padding:8px;background:#fee;border-radius:4px;">
                                    <strong>Cancelled:</strong> ${order.cancellationReason}
                                </div>
                            ` : ''}
                            
                            ${actionButtons ? `<div style="margin-top:8px;">${actionButtons}</div>` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

/**
 * Render admin orders section
 */
function renderAdminOrdersSection(title, orders, status) {
    if (orders.length === 0) {
        return `
            <div class="card" style="margin-bottom:20px;">
                <h3 style="margin-bottom:10px;">${title} (0)</h3>
                <p style="color:#999;margin:0;">No orders in this status</p>
            </div>
        `;
    }

    let html = `
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:15px;">${title} (${orders.length})</h3>
    `;

    orders.forEach(order => {
        const urgencyIcon = order.urgency === 'urgent' ? '🔴' : order.urgency === 'normal' ? '🟡' : '🟢';
        const age = utils.daysAgo(order.requestedAt);

        let actionButtons = '';
        if (status === 'pending') {
            actionButtons = `
                <button class="btn-primary" onclick="approvePartsOrder('${order.id}')" style="margin-right:5px;">✅ Approve</button>
                <button class="btn-danger" onclick="rejectPartsOrder('${order.id}')">❌ Reject</button>
            `;
        } else if (status === 'approved') {
            actionButtons = `
                <button class="btn-primary" onclick="markAsOrdered('${order.id}')" style="margin-right:5px;">📞 Mark as Ordered</button>
                <button class="btn-secondary" onclick="cancelPartsOrder('${order.id}')">Cancel</button>
            `;
        } else if (status === 'ordered') {
            actionButtons = `
                <button class="btn-success" onclick="markPartsReceived('${order.id}')" style="margin-right:5px;">📦 Mark as Received</button>
                <button class="btn-secondary" onclick="cancelPartsOrder('${order.id}')">Cancel</button>
            `;
        }

        const varianceIcon = !order.priceVariancePercent ? '' :
            Math.abs(order.priceVariancePercent) <= 10 ? '🟢' :
                Math.abs(order.priceVariancePercent) <= 20 ? '⚠️' : '🔴';

        html += `
            <div class="repair-card" style="margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                    <div>
                        <strong style="font-size:16px;">${urgencyIcon} ${order.partName}</strong> (x${order.quantity})
                        <div style="font-size:13px;color:#666;margin-top:3px;">
                            Order #${order.orderNumber} • ${age}
                        </div>
                    </div>
                </div>
                
                <div style="background:#f9fafb;padding:10px;border-radius:6px;margin-bottom:10px;">
                    <div style="font-size:13px;">
                        <strong>Repair:</strong> ${order.repairDetails.customerName} - ${order.repairDetails.device}
                    </div>
                    <div style="font-size:13px;color:#666;">
                        ${order.repairDetails.problem}
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:10px;font-size:13px;">
                    <div><strong>Requested by:</strong> ${order.requestedByName}</div>
                    <div><strong>Requested:</strong> ${utils.formatDate(order.requestedAt)}</div>
                    ${order.supplierName ? `<div><strong>Supplier:</strong> ${order.supplierName}</div>` : '<div></div>'}
                    ${order.estimatedPrice ? `<div><strong>Est Price:</strong> ₱${order.estimatedPrice}/unit</div>` : '<div></div>'}
                </div>
                
                ${order.notes ? `
                    <div style="font-size:13px;color:#666;padding:8px;background:#f3f4f6;border-radius:4px;margin-bottom:10px;">
                        <strong>Notes:</strong> ${order.notes}
                    </div>
                ` : ''}
                
                ${order.approvalNotes ? `
                    <div style="font-size:13px;color:#059669;padding:8px;background:#d1fae5;border-radius:4px;margin-bottom:10px;">
                        <strong>Admin notes:</strong> ${order.approvalNotes}
                    </div>
                ` : ''}
                
                ${order.supplierOrderNumber ? `
                    <div style="font-size:13px;margin-bottom:5px;">
                        <strong>Supplier Ref:</strong> ${order.supplierOrderNumber}
                    </div>
                ` : ''}
                
                ${order.estimatedArrival ? `
                    <div style="font-size:13px;margin-bottom:5px;">
                        <strong>ETA:</strong> ${utils.formatDate(order.estimatedArrival)}
                    </div>
                ` : ''}
                
                ${order.actualPrice ? `
                    <div style="font-size:14px;margin-top:10px;padding:8px;background:#d1fae5;border-radius:4px;">
                        <strong>Received:</strong> ₱${order.actualPrice}/unit (Total: ₱${(order.actualPrice * order.quantity).toFixed(2)})
                        ${order.priceVariance ? `
                            <span style="color:${order.priceVariance > 0 ? '#ef4444' : '#10b981'};">
                                ${varianceIcon} ${order.priceVariance > 0 ? '+' : ''}₱${order.priceVariance.toFixed(2)} 
                                (${order.priceVariancePercent > 0 ? '+' : ''}${order.priceVariancePercent}%)
                            </span>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${actionButtons ? `
                    <div style="margin-top:15px;display:flex;gap:10px;">
                        ${actionButtons}
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

/**
 * Helper to filter repair by ID (for linking from parts orders)
 */
function filterRepairById(repairId) {
    // This assumes there's a search/filter input in All Repairs tab
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.value = repairId;
        searchInput.dispatchEvent(new Event('input'));
    }
}

// Export parts ordering tab functions
window.buildPartsOrdersTab = buildPartsOrdersTab;
window.buildApprovePartsOrdersTab = buildApprovePartsOrdersTab;
window.renderOrdersSection = renderOrdersSection;
window.renderAdminOrdersSection = renderAdminOrdersSection;
window.filterRepairById = filterRepairById;

// Export commission adjustment functions
window.openCommissionAdjustmentModal = openCommissionAdjustmentModal;
window.closeCommissionAdjustmentModal = closeCommissionAdjustmentModal;
window.showAdjustmentTab = showAdjustmentTab;
window.saveBaselineRate = saveBaselineRate;
window.runAdjustmentDetection = runAdjustmentDetection;
window.clearStagedAdjustments = clearStagedAdjustments;
window.applyAllStagedAdjustments = applyAllStagedAdjustments;
window.scanForCleanupFiles = scanForCleanupFiles;
window.downloadAllCleanupFiles = downloadAllCleanupFiles;
window.confirmCleanupDelete = confirmCleanupDelete;

/**
 * Build Retroactive Intakes Tab (Admin Only)
 */
function buildRetroactiveIntakesTab(container) {
    window.currentTabRefresh = () => buildRetroactiveIntakesTab(container);

    const intakes = window.allRetroactiveIntakes || [];
    const role = window.currentUserData?.role;

    if (role !== 'admin') {
        container.innerHTML = `
            <div class="page-header">
                <h2>🔒 Access Denied</h2>
                <p>This page is for administrators only.</p>
            </div>
        `;
        return;
    }

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const totalIntakes = intakes.length;
    const thisMonthIntakes = intakes.filter(i => i.performedAt && i.performedAt.startsWith(thisMonth)).length;
    const duplicateOverrides = intakes.filter(i => i.duplicateOverridden).length;
    const excessiveFlags = intakes.filter(i => i.excessiveUsageFlag).length;
    const totalPayments = intakes.reduce((sum, i) => sum + (i.paymentCollected || 0), 0);

    // Technician breakdown
    const techStats = {};
    intakes.forEach(intake => {
        const uid = intake.performedBy;
        if (!uid) return;

        if (!techStats[uid]) {
            techStats[uid] = {
                name: intake.performedByName || 'Unknown',
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                total: 0
            };
        }

        techStats[uid].total++;

        const intakeDate = intake.performedDate || intake.performedAt?.split('T')[0];
        if (intakeDate === today) techStats[uid].today++;
        if (intake.performedMonth === thisMonth) techStats[uid].thisMonth++;
    });

    container.innerHTML = `
        <div class="page-header">
            <h2>🔄 Retroactive Intakes</h2>
            <p>Audit trail for devices received after completion</p>
        </div>
        
        <!-- Stats Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
            <div class="stat-card">
                <div class="stat-value">${totalIntakes}</div>
                <div class="stat-label">Total Retroactive</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${thisMonthIntakes}</div>
                <div class="stat-label">This Month</div>
            </div>
            <div class="stat-card" style="background:#fff3cd;">
                <div class="stat-value">${duplicateOverrides}</div>
                <div class="stat-label">Duplicate Overrides</div>
            </div>
            <div class="stat-card" style="background:#f8d7da;">
                <div class="stat-value">${excessiveFlags}</div>
                <div class="stat-label">Excessive Usage Alerts</div>
            </div>
            <div class="stat-card" style="background:#d1ecf1;">
                <div class="stat-value">₱${totalPayments.toLocaleString()}</div>
                <div class="stat-label">Total Payments</div>
            </div>
        </div>
        
        <!-- Technician Breakdown -->
        <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
            <h3 style="margin:0 0 15px 0;">👥 Technician Breakdown</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Technician</th>
                        <th>Today</th>
                        <th>This Month</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(techStats).map(([uid, stats]) => `
                        <tr>
                            <td><strong>${stats.name}</strong></td>
                            <td>${stats.today}</td>
                            <td>${stats.thisMonth}</td>
                            <td>${stats.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Filters -->
        <div style="background:white;padding:15px;border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 12px 0;">🔍 Filters</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
                <div>
                    <label>Date From</label>
                    <input type="date" id="filterDateFrom" onchange="applyRetroactiveFilters()">
                </div>
                <div>
                    <label>Date To</label>
                    <input type="date" id="filterDateTo" onchange="applyRetroactiveFilters()">
                </div>
                <div>
                    <label>Technician</label>
                    <select id="filterTech" onchange="applyRetroactiveFilters()">
                        <option value="">All Technicians</option>
                        ${Object.entries(techStats).map(([uid, stats]) => `
                            <option value="${uid}">${stats.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label>Status</label>
                    <select id="filterStatus" onchange="applyRetroactiveFilters()">
                        <option value="">All</option>
                        <option value="Released">Released</option>
                        <option value="Claimed">Claimed</option>
                    </select>
                </div>
                <div>
                    <label style="display:flex;align-items:center;gap:8px;margin-top:25px;">
                        <input type="checkbox" id="filterDuplicates" onchange="applyRetroactiveFilters()">
                        <span>Duplicates Only</span>
                    </label>
                </div>
                <div>
                    <label style="display:flex;align-items:center;gap:8px;margin-top:25px;">
                        <input type="checkbox" id="filterExcessive" onchange="applyRetroactiveFilters()">
                        <span>Excessive Only</span>
                    </label>
                </div>
            </div>
            <div style="margin-top:10px;">
                <button onclick="clearRetroactiveFilters()" class="btn-secondary">Clear Filters</button>
                <button onclick="exportRetroactiveIntakesToCSV()" class="btn-primary">📄 Export to CSV</button>
            </div>
        </div>
        
        <!-- Intakes Table -->
        <div style="background:white;padding:20px;border-radius:8px;">
            <h3 style="margin:0 0 15px 0;">📋 All Retroactive Intakes</h3>
            <div id="retroactiveIntakesTableContainer">
                ${renderRetroactiveIntakesTable(intakes)}
            </div>
        </div>
    `;
}

function renderRetroactiveIntakesTable(intakes) {
    if (!intakes || intakes.length === 0) {
        return '<p style="text-align:center;padding:40px;color:#666;">No retroactive intakes found.</p>';
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Repair ID</th>
                    <th>Technician</th>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Flags</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${intakes.map(intake => {
        const flags = [];
        if (intake.duplicateOverridden) flags.push('<span style="background:#ffc107;color:#000;padding:2px 6px;border-radius:3px;font-size:11px;">DUPLICATE</span>');
        if (intake.excessiveUsageFlag) flags.push('<span style="background:#dc3545;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">EXCESSIVE</span>');
        if (intake.adminDateOverride) flags.push('<span style="background:#17a2b8;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">DATE OVERRIDE</span>');

        return `
                        <tr>
                            <td>${utils.formatDateTime(intake.performedAt)}</td>
                            <td><a href="#" onclick="viewRepairDetails('${intake.repairId}'); return false;">${intake.repairId.substring(0, 8)}</a></td>
                            <td>${intake.performedByName}</td>
                            <td>${intake.customerName}</td>
                            <td>${intake.deviceBrand} ${intake.deviceModel}</td>
                            <td><span class="status-badge ${intake.finalStatus.toLowerCase().replace(' ', '-')}">${intake.finalStatus}</span></td>
                            <td>${intake.paymentCollected ? '₱' + intake.paymentCollected.toLocaleString() : '-'}</td>
                            <td>${flags.join(' ')}</td>
                            <td>
                                <button onclick="viewRetroactiveIntakeDetails('${intake.id}')" class="btn-small">View Details</button>
                            </td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
}

function applyRetroactiveFilters() {
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;
    const techFilter = document.getElementById('filterTech')?.value;
    const statusFilter = document.getElementById('filterStatus')?.value;
    const duplicatesOnly = document.getElementById('filterDuplicates')?.checked;
    const excessiveOnly = document.getElementById('filterExcessive')?.checked;

    let filtered = window.allRetroactiveIntakes || [];

    if (dateFrom) {
        filtered = filtered.filter(i => i.performedAt >= dateFrom);
    }
    if (dateTo) {
        const dateToEnd = dateTo + 'T23:59:59';
        filtered = filtered.filter(i => i.performedAt <= dateToEnd);
    }
    if (techFilter) {
        filtered = filtered.filter(i => i.performedBy === techFilter);
    }
    if (statusFilter) {
        filtered = filtered.filter(i => i.finalStatus === statusFilter);
    }
    if (duplicatesOnly) {
        filtered = filtered.filter(i => i.duplicateOverridden);
    }
    if (excessiveOnly) {
        filtered = filtered.filter(i => i.excessiveUsageFlag);
    }

    document.getElementById('retroactiveIntakesTableContainer').innerHTML = renderRetroactiveIntakesTable(filtered);
}

function clearRetroactiveFilters() {
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterTech').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDuplicates').checked = false;
    document.getElementById('filterExcessive').checked = false;
    applyRetroactiveFilters();
}

function viewRetroactiveIntakeDetails(intakeId) {
    const intake = window.allRetroactiveIntakes.find(i => i.id === intakeId);
    if (!intake) {
        alert('Intake not found');
        return;
    }

    let details = `🔄 RETROACTIVE INTAKE DETAILS\n\n`;
    details += `Repair ID: ${intake.repairId}\n`;
    details += `Performed By: ${intake.performedByName} (${intake.performedByRole})\n`;
    details += `Performed At: ${utils.formatDateTime(intake.performedAt)}\n\n`;
    details += `Customer: ${intake.customerName}\n`;
    details += `Device: ${intake.deviceBrand} ${intake.deviceModel}\n\n`;
    details += `Original Completion: ${utils.formatDateTime(intake.originalCompletionDate)}\n`;
    details += `Backdated Release: ${utils.formatDateTime(intake.backdatedReleaseDate)}\n`;
    details += `Final Status: ${intake.finalStatus}\n\n`;
    details += `Verification: ${intake.verificationMethod}\n`;
    details += `Payment: ${intake.paymentCollected ? '₱' + intake.paymentCollected + ' via ' + intake.paymentMethod : 'Not collected'}\n`;
    details += `Warranty: ${intake.warrantyDays} days\n\n`;
    details += `Tech Daily Count: ${intake.techDailyCount}/${intake.threshold || 5}\n`;
    details += `Excessive Flag: ${intake.excessiveUsageFlag ? 'YES' : 'NO'}\n`;
    details += `Admin Date Override: ${intake.adminDateOverride ? 'YES' : 'NO'}\n`;
    details += `Duplicate Detected: ${intake.duplicateDetected ? 'YES' : 'NO'}\n`;
    if (intake.duplicateOverridden) {
        details += `Duplicate Override Reason: ${intake.duplicateOverrideReason}\n`;
    }

    alert(details);
}

// Export Staff Overview functions
window.buildStaffOverviewTab = buildStaffOverviewTab;
window.renderStaffStatusList = renderStaffStatusList;
window.loadTodayAttendance = loadTodayAttendance;
window.viewUserDashboard = viewUserDashboard;
window.buildRetroactiveIntakesTab = buildRetroactiveIntakesTab;
window.applyRetroactiveFilters = applyRetroactiveFilters;
window.clearRetroactiveFilters = clearRetroactiveFilters;
window.viewRetroactiveIntakeDetails = viewRetroactiveIntakeDetails;
