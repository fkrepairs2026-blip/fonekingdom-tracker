// ===== MAIN APP CONTROLLER =====

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');

        // Initialize theme FIRST (before any UI rendering)
        utils.initTheme();
        console.log('✅ Theme initialized');

        // CRITICAL: Force hide any existing loading FIRST
        utils.showLoading(false);

        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 150));

        // NOW show loading for current init
        utils.showLoading(true);


        if (!window.currentUser) {
            throw new Error('No user logged in');
        }

        if (!window.currentUserData) {
            throw new Error('User data not loaded');
        }

        console.log('✅ User verified:', window.currentUserData.displayName);
        console.log('✅ User role:', window.currentUserData.role);

        // Special handling for technician
        if (window.currentUserData.role === 'technician') {
            console.log('✅ Technician detected');
            if (!window.currentUserData.technicianName) {
                window.currentUserData.technicianName = window.currentUserData.displayName;
            }
        }

        updateHeaderUserInfo();

        console.log('📦 Loading repairs...');
        await loadRepairs();
        console.log('✅ Repairs loaded:', window.allRepairs.length);

        console.log('📦 Loading inventory...');
        await loadInventory();
        console.log('✅ Inventory loaded:', window.allInventoryItems.length);

        console.log('📦 Loading suppliers...');
        await loadSuppliers();
        console.log('✅ Suppliers loaded:', window.allSuppliers.length);

        console.log('📦 Loading stock movements...');
        await loadStockMovements();
        console.log('✅ Stock movements loaded:', window.stockMovements.length);

        // Load retroactive intakes (optional - won't block if collection doesn't exist)
        try {
            console.log('📦 Loading retroactive intakes...');
            await loadRetroactiveIntakes();
            console.log('✅ Retroactive intakes loaded:', window.allRetroactiveIntakes.length);
        } catch (error) {
            console.warn('⚠️ Retroactive intakes not loaded (collection may not exist yet):', error.message);
            window.allRetroactiveIntakes = [];
        }

        // Load system settings (optional - won't block if doesn't exist)
        try {
            console.log('📦 Loading system settings...');
            await loadSystemSettings();
            console.log('✅ System settings loaded');
        } catch (error) {
            console.warn('⚠️ System settings not loaded, using defaults:', error.message);
            window.systemSettings = { retroactiveIntakeThreshold: 5 };
        }

        console.log('📦 Loading parts orders...');
        await loadPartsOrders();
        console.log('✅ Parts orders loaded:', window.allPartsOrders.length);

        console.log('📦 Loading tech expenses...');
        await loadTechExpenses();
        console.log('✅ Tech expenses loaded:', window.techExpenses.length);

        console.log('📦 Loading tech remittances...');
        await loadTechRemittances();
        console.log('✅ Tech remittances loaded:', window.techRemittances.length);

        console.log('📦 Loading daily cash counts...');
        await loadDailyCashCounts();
        console.log('✅ Daily cash counts loaded:', Object.keys(window.dailyCashCounts || {}).length);

        console.log('📦 Loading activity logs...');
        await loadActivityLogs();
        console.log('✅ Activity logs loaded:', window.allActivityLogs.length);

        console.log('📦 Loading users...');
        await loadUsers();
        console.log('✅ Users loaded:', Object.keys(window.allUsers).length);

        console.log('� Loading overhead expenses...');
        await loadOverheadExpenses();
        console.log('✅ Overhead expenses loaded:', window.overheadExpenses.length);
        console.log('🔄 Loading refunds...');
        await loadRefunds();
        console.log('✅ Refunds loaded:', window.refunds.length);
        console.log('📦 Loading supplier purchases...');
        await loadSupplierPurchases();
        console.log('✅ Supplier purchases loaded:', window.supplierPurchases.length);
        // Load offline queue from storage
        console.log('📂 Loading offline queue...');
        loadOfflineQueueFromStorage();
        console.log('✅ Offline queue loaded:', window.offlineQueue.length, 'items');

        // Load personal finance data
        console.log('💰 Loading personal expenses...');
        await loadPersonalExpenses();
        console.log('✅ Personal expenses loaded:', window.allPersonalExpenses.length);

        console.log('🔄 Loading recurring templates...');
        await loadRecurringTemplates();
        console.log('✅ Recurring templates loaded:', window.allRecurringTemplates.length);

        console.log('💳 Loading credit cards...');
        await loadCreditCards();
        console.log('✅ Credit cards loaded:', window.allCreditCards.length);

        console.log('📊 Loading personal budgets...');
        await loadPersonalBudgets();
        console.log('✅ Personal budgets loaded:', window.allPersonalBudgets.length);

        console.log('🎯 Loading savings goals...');
        await loadSavingsGoals();
        console.log('✅ Savings goals loaded:', window.allSavingsGoals.length);
        console.log('🕐 Initializing attendance system...');
        initAttendanceListeners();
        console.log('✅ Attendance system initialized');
        
        // Initialize performance dashboard system
        console.log('📋 Initializing performance dashboard system...');
        initializePerformanceListeners();
        console.log('✅ Performance dashboard system initialized');
        
        // Start clock reminder system for techs/cashiers
        const role = window.currentUserData.role;
        if (['technician', 'cashier'].includes(role)) {
            if (window.startClockReminderSystem) {
                window.startClockReminderSystem();
            }
            
            // Start daily routine reminder system
            if (window.checkAndShowReminder) {
                // Check every 30 minutes (1800000ms)
                setInterval(() => {
                    window.checkAndShowReminder();
                }, 1800000);
            }
        }
        console.log('�🔖 Building tabs...');
        buildTabs();

        console.log('🎨 Initializing sidebars...');
        initSidebar();

        // Auto-finalization system removed - devices stay Released until manual finalization

        // Initialize export scheduler for admin
        if (window.currentUserData.role === 'admin' && window.exportScheduler) {
            console.log('📤 Initializing export scheduler...');
            window.exportScheduler.initializeAutoExport();
        }

        // Start data health monitor for admin
        if (window.currentUserData.role === 'admin' && window.startDataHealthMonitor) {
            console.log('🔍 Starting data health monitor...');
            window.startDataHealthMonitor();
        }

        // Check for unclassified suppliers
        if (window.currentUserData.role === 'admin' && window.checkUnclassifiedSuppliers) {
            console.log('🏷️ Checking for unclassified suppliers...');
            window.checkUnclassifiedSuppliers();
        }

        // Check for expired cleanups to archive (once per month)
        if (window.currentUserData.role === 'admin' && window.archiveExpiredCleanups) {
            const lastArchiveCheck = localStorage.getItem('lastCleanupArchiveCheck');
            const now = new Date();
            const currentMonth = now.getFullYear() + '-' + (now.getMonth() + 1);

            if (lastArchiveCheck !== currentMonth) {
                console.log('🗄️ Checking for expired cleanups to archive...');
                setTimeout(() => {
                    window.archiveExpiredCleanups();
                    localStorage.setItem('lastCleanupArchiveCheck', currentMonth);
                }, 5000);
            }
        }

        // CRITICAL: ALWAYS hide loading at the end
        utils.showLoading(false);

        console.log('✅ App initialization complete!');
        
        // Set flag to stop emergency cleanup script
        window.appInitialized = true;

        // Prevent accidental browser back button exits
        setupBackButtonHandler();

        // Show onboarding wizard for first-time users (after UI is ready)
        setTimeout(() => {
            if (!hasSeenOnboarding()) {
                console.log('👋 Showing onboarding wizard for first-time user');
                showOnboardingWizard();
            } else {
                console.log('✓ User has seen onboarding before');
            }
        }, 1000); // Delay to ensure UI is fully rendered
        
        // Note: Performance dashboard removed auto-show
        // Technicians can access via sidebar menu "My Performance"

    } catch (error) {
        console.error('❌ Error initializing app:', error);
        console.error('Stack:', error.stack);

        // CRITICAL: ALWAYS hide loading on error
        utils.showLoading(false);

        alert('Error loading app: ' + error.message + '\n\nTry refreshing the page.');
    }
}

/**
 * Update header with user information
 */
async function updateHeaderUserInfo() {
    try {
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');

        if (!userName || !userRole || !userAvatar) {
            console.warn('⚠️ Header elements not found');
            return;
        }

        if (window.currentUserData) {
            userName.textContent = window.currentUserData.displayName || 'User';
            userRole.textContent = window.currentUserData.role || 'user';

            const avatarUrl = window.currentUserData.profilePicture ||
                utils.getDefaultAvatar(window.currentUserData.displayName || 'U');
            userAvatar.src = avatarUrl;

            console.log('✅ Header updated');

            // Update clock in/out widget for technicians and cashiers
            if (['technician', 'cashier'].includes(window.currentUserData.role)) {
                await updateClockInOutWidget();
            }
        }
    } catch (error) {
        console.error('❌ Error updating header:', error);
    }
}

/**
 * Update clock in/out widget
 */
async function updateClockInOutWidget() {
    const widget = document.getElementById('clockInOutWidget');
    const btn = document.getElementById('clockInOutBtn');
    const btnText = document.getElementById('clockBtnText');
    const clockIcon = document.getElementById('clockIcon');
    const workTimeDisplay = document.getElementById('workTimeDisplay');

    if (!widget || !btn) return;

    // Show widget
    widget.style.display = 'block';

    // Get current status
    const status = await getUserAttendanceStatus();
    const todayHours = await getTodayWorkHours();

    if (status.currentStatus === 'clocked-in') {
        btnText.textContent = 'Clock Out';
        clockIcon.textContent = '🔴';
        btn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

        // Show live work time
        if (todayHours.clockedIn) {
            const duration = todayHours.duration;
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            workTimeDisplay.textContent = `${hours}h ${minutes}m`;
            workTimeDisplay.style.color = '#4caf50';
            workTimeDisplay.style.fontWeight = 'bold';
        }
    } else {
        btnText.textContent = 'Clock In';
        clockIcon.textContent = '🕐';
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

        // Show today's total work time if clocked out
        if (todayHours.duration > 0) {
            const duration = todayHours.duration;
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            workTimeDisplay.textContent = `Today: ${hours}h ${minutes}m`;
            workTimeDisplay.style.color = '#666';
            workTimeDisplay.style.fontWeight = 'normal';
        } else {
            workTimeDisplay.textContent = '';
        }
    }
}

/**
 * Handle clock in/out button click
 */
async function handleClockInOut() {
    const status = await getUserAttendanceStatus();

    if (status.currentStatus === 'clocked-in') {
        // Confirm before clocking out
        if (confirm('Are you sure you want to clock out?')) {
            await clockOut();
            await updateClockInOutWidget();
        }
    } else {
        await clockIn();
        await updateClockInOutWidget();
    }
}

// Update work time display every minute for clocked-in users
setInterval(async () => {
    if (window.currentUserData && ['technician', 'cashier'].includes(window.currentUserData.role)) {
        const status = await getUserAttendanceStatus();
        if (status.currentStatus === 'clocked-in') {
            await updateClockInOutWidget();
        }
    }
}, 60000); // Every 1 minute

/**
 * Stats functions removed - Now accessible via sidebar navigation
 * Dashboard tab shows welcome message and recent activity instead
 */

/**
 * Close modals when clicking outside
 */
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Photo modal functions
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) modal.style.display = 'none';
}

function showPhotoModal(photoUrl) {
    const modal = document.getElementById('photoModal');
    const img = document.getElementById('modalPhoto');
    if (modal && img) {
        img.src = photoUrl;
        modal.style.display = 'block';
    }
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'none';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.style.display = 'none';
}

// ===== DUAL SIDEBAR CONTROLS =====

/**
 * Toggle left sidebar collapse (desktop) or close (mobile)
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // On mobile, close the sidebar instead of collapsing
    if (window.innerWidth <= 768) {
        closeMobileSidebar();
        return;
    }

    // Desktop: toggle collapse
    sidebar.classList.toggle('collapsed');

    // Update body class for CSS adjustments
    if (sidebar.classList.contains('collapsed')) {
        document.body.classList.add('left-sidebar-collapsed');
    } else {
        document.body.classList.remove('left-sidebar-collapsed');
    }

    // Save state to localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);

    console.log(`Left sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`);
}

/**
 * Toggle mobile sidebar
 */
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !overlay) return;

    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Toggle More Menu dropdown
 */
function toggleMoreMenu() {
    const dropdown = document.getElementById('moreMenuDropdown');
    if (!dropdown) return;

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';

    // Close dropdown when clicking outside
    if (!isVisible) {
        setTimeout(() => {
            document.addEventListener('click', closeMoreMenuOnClickOutside);
        }, 0);
    } else {
        document.removeEventListener('click', closeMoreMenuOnClickOutside);
    }
}

/**
 * Close More Menu when clicking outside
 */
function closeMoreMenuOnClickOutside(event) {
    const dropdown = document.getElementById('moreMenuDropdown');
    const moreMenuBtn = document.querySelector('.more-menu-btn');

    if (!dropdown || !moreMenuBtn) return;

    // Check if click is outside both dropdown and button
    if (!dropdown.contains(event.target) && !moreMenuBtn.contains(event.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeMoreMenuOnClickOutside);
    }
}

/**
 * Restore sidebar state on load
 */
function initSidebar() {
    console.log('🎨 Initializing sidebar layout...');

    // Restore left sidebar state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.getElementById('sidebar');

    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('left-sidebar-collapsed');
    }

    console.log('✅ Sidebar initialized');
}

/**
 * Setup browser back button handler
 * Prevents accidental exits from the app
 */
function setupBackButtonHandler() {
    // Push initial state
    window.history.pushState({ page: 'app' }, '', window.location.href);

    // Handle back button
    window.addEventListener('popstate', function (event) {
        // Confirm before leaving the app
        const confirmExit = confirm('Are you sure you want to leave the app? Any unsaved changes may be lost.');

        if (confirmExit) {
            // Allow navigation away
            window.removeEventListener('popstate', arguments.callee);
            window.history.back();
        } else {
            // Stay in the app - push state again
            window.history.pushState({ page: 'app' }, '', window.location.href);
        }
    });

    console.log('✅ Back button handler initialized');
}

// Export to global scope
window.initializeApp = initializeApp;
window.updateHeaderUserInfo = updateHeaderUserInfo;
window.updateClockInOutWidget = updateClockInOutWidget;
window.handleClockInOut = handleClockInOut;
window.closePhotoModal = closePhotoModal;
window.showPhotoModal = showPhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.toggleMoreMenu = toggleMoreMenu;
window.initSidebar = initSidebar;

console.log('✅ app.js loaded');
