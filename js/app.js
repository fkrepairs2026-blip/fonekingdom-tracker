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
        
        console.log('📦 Loading modification requests...');
        await loadModificationRequests();
        console.log('✅ Modification requests loaded:', window.allModificationRequests.length);
        
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
        
        console.log('🔖 Building tabs...');
        buildTabs();
        
        console.log('🎨 Initializing sidebars...');
        initSidebar();
        
        // Start auto-finalization checker for Released devices
        if (window.startAutoFinalizeChecker) {
            console.log('⏱️ Starting auto-finalization checker...');
            window.startAutoFinalizeChecker();
        }
        
        // CRITICAL: ALWAYS hide loading at the end
        utils.showLoading(false);
        
        console.log('✅ App initialization complete!');
        
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
function updateHeaderUserInfo() {
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
        }
    } catch (error) {
        console.error('❌ Error updating header:', error);
    }
}

/**
 * Stats functions removed - Now accessible via sidebar navigation
 * Dashboard tab shows welcome message and recent activity instead
 */

/**
 * Close modals when clicking outside
 */
window.onclick = function(event) {
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

// Export to global scope
window.initializeApp = initializeApp;
window.updateHeaderUserInfo = updateHeaderUserInfo;
window.closePhotoModal = closePhotoModal;
window.showPhotoModal = showPhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.initSidebar = initSidebar;

console.log('✅ app.js loaded');
