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
        console.log('✅ Users loaded:', window.allUsers.length);
        
        console.log('📊 Building stats...');
        buildStats();
        
        console.log('🔖 Building tabs...');
        buildTabs();
        
        console.log('🎨 Initializing sidebars...');
        initSidebar();
        
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
 * Build statistics dashboard - role-specific with new workflow
 */
function buildStats() {
    try {
        console.log('📊 Building stats dashboard...');
        
        if (!window.currentUserData) {
            console.error('❌ currentUserData is null');
            return;
        }
        
        if (!window.allRepairs) {
            console.warn('⚠️ allRepairs is null, using empty array');
            window.allRepairs = [];
        }
        
        const role = window.currentUserData.role;
        console.log('Building stats for role:', role);
        
        const statsSection = document.getElementById('statsSection');
        
        if (!statsSection) {
            console.error('❌ Stats section not found');
            return;
        }
        
        // Calculate workflow stats (shared by all roles)
        const receivedDevices = window.allRepairs.filter(r => 
            r.status === 'Received' && !r.acceptedBy
        ).length;
        
        const inProgress = window.allRepairs.filter(r => 
            r.status === 'In Progress' || r.status === 'Waiting for Parts'
        ).length;
        
        const forRelease = window.allRepairs.filter(r => 
            r.status === 'Ready for Pickup' || r.status === 'Completed'
        ).length;
        
        const rtoDevices = window.allRepairs.filter(r => 
            r.status === 'RTO' && !r.claimedAt
        ).length;
        
        console.log('Stats calculated:', { receivedDevices, inProgress, forRelease, rtoDevices });
        
        // Build role-specific stats
        if (role === 'cashier') {
            buildCashierStats(statsSection, receivedDevices, inProgress, forRelease, rtoDevices);
        } else if (role === 'admin' || role === 'manager') {
            buildAdminStats(statsSection, receivedDevices, inProgress, forRelease, rtoDevices);
        } else if (role === 'technician') {
            buildTechnicianStats(statsSection, receivedDevices, inProgress, forRelease, rtoDevices);
        } else {
            console.warn('⚠️ Unknown role:', role);
            // Default stats for unknown role
            statsSection.innerHTML = `
                <div class="stat-card">
                    <h3>${window.allRepairs.length}</h3>
                    <p>Total Repairs</p>
                </div>
            `;
        }
        
        console.log('✅ Stats built successfully');
        
    } catch (error) {
        console.error('❌ Error building stats:', error);
        console.error('Error stack:', error.stack);
        
        // Show error message in stats section
        const statsSection = document.getElementById('statsSection');
        if (statsSection) {
            statsSection.innerHTML = `
                <div class="stat-card" style="background:#ffebee;">
                    <p style="color:#c62828;">Error loading stats</p>
                </div>
            `;
        }
    }
}

/**
 * Build cashier stats
 */
function buildCashierStats(container, receivedCount, inProgressCount, forReleaseCount, rtoCount) {
    try {
        const today = new Date().toDateString();
        
        const unpaidRepairs = window.allRepairs.filter(r => {
            const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
            return (r.total - totalPaid) > 0;
        });
        
        const pendingPayments = window.allRepairs.filter(r => 
            r.payments && r.payments.some(p => !p.verified)
        );
        
        // Calculate today's verified payments
        const todayPayments = window.allRepairs
            .filter(r => r.payments && r.payments.some(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified))
            .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
        
        // Calculate today's expenses from techExpenses
        const todayExpenses = (window.techExpenses || [])
            .filter(e => new Date(e.date).toDateString() === today)
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Net revenue = payments - expenses
        const todayRevenue = todayPayments - todayExpenses;
        
        // Check if today is locked
        const todayString = new Date().toISOString().split('T')[0];
        const todayLocked = window.dailyCashCounts[todayString] && window.dailyCashCounts[todayString].locked;
        
        container.innerHTML = `
            <div class="stat-card stat-received" onclick="switchTab('received')" title="Click to view received devices">
                <h3>${receivedCount}</h3>
                <p>📥 Received</p>
                <small>Awaiting diagnosis</small>
            </div>
            <div class="stat-card stat-in-progress" onclick="switchTab('inprogress')" title="Click to view repairs in progress">
                <h3>${inProgressCount}</h3>
                <p>🔧 In Progress</p>
                <small>Active repairs</small>
            </div>
            <div class="stat-card stat-ready" onclick="switchTab('forrelease')" title="Click to view devices ready for pickup">
                <h3>${forReleaseCount}</h3>
                <p>📦 For Release</p>
                <small>Ready for pickup</small>
            </div>
            <div class="stat-card stat-rto" onclick="switchTab('rto')" title="Click to view RTO devices">
                <h3>${rtoCount}</h3>
                <p>↩️ RTO</p>
                <small>Returned to owner</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);" onclick="switchTab('unpaid')">
                <h3>${unpaidRepairs.length}</h3>
                <p>💳 Unpaid</p>
                <small>Outstanding balance</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);" onclick="switchTab('pending')">
                <h3>${pendingPayments.length}</h3>
                <p>⏳ Pending</p>
                <small>Awaiting verification</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);" onclick="switchTab('cash')" title="Click to view cash count">
                <h3>₱${todayRevenue.toLocaleString()}</h3>
                <p>💰 Today's Net ${todayLocked ? '🔒' : ''}</p>
                <small>₱${todayPayments.toLocaleString()} - ₱${todayExpenses.toLocaleString()}</small>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error building cashier stats:', error);
    }
}

/**
 * Build admin/manager stats
 */
function buildAdminStats(container, receivedCount, inProgressCount, forReleaseCount, rtoCount) {
    try {
        const today = new Date().toDateString();
        
        const completed = window.allRepairs.filter(r => r.status === 'Completed').length;
        
        const pendingPayments = window.allRepairs.filter(r => 
            r.payments && r.payments.some(p => !p.verified)
        );
        
        // Calculate today's verified payments
        const todayPayments = window.allRepairs
            .filter(r => r.payments && r.payments.some(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified))
            .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
        
        // Calculate today's expenses from techExpenses
        const todayExpenses = (window.techExpenses || [])
            .filter(e => new Date(e.date).toDateString() === today)
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Net revenue = payments - expenses
        const todayRevenue = todayPayments - todayExpenses;
        
        // Check if today is locked
        const todayString = new Date().toISOString().split('T')[0];
        const todayLocked = window.dailyCashCounts[todayString] && window.dailyCashCounts[todayString].locked;
        
        container.innerHTML = `
            <div class="stat-card stat-received" onclick="switchTab('received')" title="Click to view received devices">
                <h3>${receivedCount}</h3>
                <p>📥 Received</p>
                <small>Waiting for tech</small>
            </div>
            <div class="stat-card stat-in-progress" onclick="switchTab('inprogress')" title="Click to view repairs in progress">
                <h3>${inProgressCount}</h3>
                <p>🔧 In Progress</p>
                <small>Active repairs</small>
            </div>
            <div class="stat-card stat-ready" onclick="switchTab('forrelease')" title="Click to view devices ready for pickup">
                <h3>${forReleaseCount}</h3>
                <p>📦 For Release</p>
                <small>Ready for pickup</small>
            </div>
            <div class="stat-card stat-rto" onclick="switchTab('rto')" title="Click to view RTO devices">
                <h3>${rtoCount}</h3>
                <p>↩️ RTO</p>
                <small>Returned to owner</small>
            </div>
            <div class="stat-card stat-completed" onclick="switchTab('claimed')">
                <h3>${completed}</h3>
                <p>✅ Completed</p>
                <small>Total finished</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);" onclick="switchTab('pending')">
                <h3>${pendingPayments.length}</h3>
                <p>⏳ Pending</p>
                <small>Needs verification</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);" onclick="switchTab('cash')" title="Click to view cash count">
                <h3>₱${todayRevenue.toLocaleString()}</h3>
                <p>💰 Today's Net ${todayLocked ? '🔒' : ''}</p>
                <small>₱${todayPayments.toLocaleString()} - ₱${todayExpenses.toLocaleString()}</small>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error building admin stats:', error);
    }
}

/**
 * Build technician stats
 */
function buildTechnicianStats(container, receivedCount, inProgressCount, forReleaseCount, rtoCount) {
    try {
        console.log('🔧 Building technician stats');
        
        // Get technician's user ID for filtering
        const techUserId = window.currentUser.uid;
        console.log('Tech user ID:', techUserId);
        
        // Filter repairs accepted by this technician
        const myJobs = window.allRepairs.filter(r => r.acceptedBy === techUserId);
        console.log('My jobs count:', myJobs.length);
        
        const myInProgress = myJobs.filter(r => r.status === 'In Progress' || r.status === 'Waiting for Parts').length;
        const myCompleted = myJobs.filter(r => r.status === 'Completed').length;
        const myReady = myJobs.filter(r => r.status === 'Ready for Pickup').length;
        
        // Calculate today's collected cash
        const today = new Date().toDateString();
        const todayCashCollected = window.allRepairs
            .filter(r => r.payments && r.payments.some(p => 
                p.receivedById === techUserId && 
                p.collectedByTech === true &&
                new Date(p.paymentDate || p.recordedDate).toDateString() === today
            ))
            .reduce((sum, r) => {
                return sum + r.payments
                    .filter(p => p.receivedById === techUserId && 
                                 p.collectedByTech === true &&
                                 new Date(p.paymentDate || p.recordedDate).toDateString() === today)
                    .reduce((s, p) => s + p.amount, 0);
            }, 0);
        
        console.log('Stats:', { myJobs: myJobs.length, myInProgress, myCompleted, myReady, todayCashCollected });
        
        container.innerHTML = `
            <div class="stat-card stat-received" onclick="switchTab('received')" title="Click to view and accept jobs">
                <h3>${receivedCount}</h3>
                <p>📥 Available</p>
                <small>Click to accept</small>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);" onclick="switchTab('my')" title="Click to view your jobs">
                <h3>${myJobs.length}</h3>
                <p>🔧 My Jobs</p>
                <small>Total assigned</small>
            </div>
            <div class="stat-card stat-completed" onclick="switchTab('remittance')" title="Click to view and submit remittance">
                <h3>₱${todayCashCollected.toLocaleString()}</h3>
                <p>💰 Today's Cash</p>
                <small>Collected today</small>
            </div>
            <div class="stat-card stat-in-progress" onclick="switchTab('inprogress')" title="Your repairs in progress">
                <h3>${myInProgress}</h3>
                <p>⚙️ In Progress</p>
                <small>Active work</small>
            </div>
            <div class="stat-card stat-ready">
                <h3>${myReady}</h3>
                <p>✅ Ready</p>
                <small>Done, for pickup</small>
            </div>
            <div class="stat-card stat-rto" onclick="switchTab('rto')" title="Click to view RTO devices">
                <h3>${rtoCount}</h3>
                <p>↩️ RTO</p>
                <small>Returned to owner</small>
            </div>
            <div class="stat-card stat-completed">
                <h3>${myCompleted}</h3>
                <p>🎉 Completed</p>
                <small>Total finished</small>
            </div>
            <div class="stat-card stat-received" onclick="switchTab('forrelease')" title="All devices ready for release">
                <h3>${forReleaseCount}</h3>
                <p>📦 All Ready</p>
                <small>Shop-wide</small>
            </div>
        `;
        
        console.log('✅ Technician stats built');
    } catch (error) {
        console.error('❌ Error building technician stats:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback stats
        container.innerHTML = `
            <div class="stat-card" style="background:#ffebee;">
                <p style="color:#c62828;">Error loading stats</p>
            </div>
        `;
    }
}

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
 * Toggle left sidebar collapse
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
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
 * Restore sidebar states on load
 */
function initSidebar() {
    console.log('🎨 Initializing dual sidebar layout...');
    
    // Restore left sidebar state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('left-sidebar-collapsed');
    }
    
    // Right sidebar visibility will be controlled by updateRightSidebar()
    // when switching tabs
    
    console.log('✅ Dual sidebar initialized');
}

// Export to global scope
window.initializeApp = initializeApp;
window.updateHeaderUserInfo = updateHeaderUserInfo;
window.buildStats = buildStats;
window.closePhotoModal = closePhotoModal;
window.showPhotoModal = showPhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.initSidebar = initSidebar;

console.log('✅ app.js loaded');
