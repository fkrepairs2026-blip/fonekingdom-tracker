// ===== MAIN APP CONTROLLER =====

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');
        
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
        
        console.log('📦 Loading modification requests...');
        await loadModificationRequests();
        console.log('✅ Modification requests loaded:', window.allModificationRequests.length);
        
        console.log('📊 Building stats...');
        buildStats();
        
        console.log('🔖 Building tabs...');
        buildTabs();
        
        // Initialize FAB menu
        if (window.buildFABMenu) {
            buildFABMenu();
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
        
        console.log('Stats calculated:', { receivedDevices, inProgress, forRelease });
        
        // Build role-specific stats
        if (role === 'cashier') {
            buildCashierStats(statsSection, receivedDevices, inProgress, forRelease);
        } else if (role === 'admin' || role === 'manager') {
            buildAdminStats(statsSection, receivedDevices, inProgress, forRelease);
        } else if (role === 'technician') {
            buildTechnicianStats(statsSection, receivedDevices, inProgress, forRelease);
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
        
        // Update FAB menu when stats change
        if (window.buildFABMenu) {
            setTimeout(() => {
                const fabMenu = document.getElementById('fabMenu');
                if (fabMenu && fabMenu.classList.contains('active')) {
                    buildFABMenu();
                }
            }, 100);
        }
        
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
function buildCashierStats(container, receivedCount, inProgressCount, forReleaseCount) {
    try {
        const today = new Date().toDateString();
        
        const unpaidRepairs = window.allRepairs.filter(r => {
            const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
            return (r.total - totalPaid) > 0;
        });
        
        const pendingPayments = window.allRepairs.filter(r => 
            r.payments && r.payments.some(p => !p.verified)
        );
        
        const todayRevenue = window.allRepairs
            .filter(r => r.payments && r.payments.some(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified))
            .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
        
        container.innerHTML = `
            <div class="stat-card" onclick="switchTab('received')" style="background:#e3f2fd;border-left:4px solid #2196f3;cursor:pointer;" title="Click to view">
                <h3>${receivedCount}</h3>
                <p>📥 Received Devices</p>
            </div>
            <div class="stat-card" onclick="switchTab('inprogress')" style="background:#fff3e0;border-left:4px solid #ff9800;cursor:pointer;" title="Click to view">
                <h3>${inProgressCount}</h3>
                <p>🔧 In Progress</p>
            </div>
            <div class="stat-card" onclick="switchTab('forrelease')" style="background:#e8f5e9;border-left:4px solid #4caf50;cursor:pointer;" title="Click to view">
                <h3>${forReleaseCount}</h3>
                <p>📦 For Release</p>
            </div>
            <div class="stat-card" onclick="toggleFABMenu()" style="background:#f3e5f5;border-left:4px solid #9c27b0;cursor:pointer;" title="Click for quick actions">
                <h3>⚡</h3>
                <p>Quick Actions</p>
                <small style="font-size:12px;color:#666;">Tap for more</small>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error building cashier stats:', error);
    }
}

/**
 * Build admin/manager stats
 */
function buildAdminStats(container, receivedCount, inProgressCount, forReleaseCount) {
    try {
        const today = new Date().toDateString();
        
        const completed = window.allRepairs.filter(r => r.status === 'Completed').length;
        
        const pendingPayments = window.allRepairs.filter(r => 
            r.payments && r.payments.some(p => !p.verified)
        );
        
        const todayRevenue = window.allRepairs
            .filter(r => r.payments && r.payments.some(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified))
            .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.paymentDate || p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
        
        container.innerHTML = `
            <div class="stat-card" onclick="switchTab('received')" style="background:#e3f2fd;border-left:4px solid #2196f3;cursor:pointer;" title="Click to view received devices">
                <h3>${receivedCount}</h3>
                <p>📥 Received Devices</p>
                <small style="font-size:12px;color:#666;">Waiting for tech</small>
            </div>
            <div class="stat-card" onclick="switchTab('inprogress')" style="background:#fff3e0;border-left:4px solid #ff9800;cursor:pointer;" title="Click to view in progress">
                <h3>${inProgressCount}</h3>
                <p>🔧 In Progress</p>
                <small style="font-size:12px;color:#666;">Active repairs</small>
            </div>
            <div class="stat-card" onclick="switchTab('forrelease')" style="background:#e8f5e9;border-left:4px solid #4caf50;cursor:pointer;" title="Click to view ready units">
                <h3>${forReleaseCount}</h3>
                <p>📦 For Release</p>
                <small style="font-size:12px;color:#666;">Ready for pickup</small>
            </div>
            <div class="stat-card" onclick="toggleFABMenu()" style="background:#f3e5f5;border-left:4px solid #9c27b0;cursor:pointer;" title="Click for quick actions">
                <h3>⚡</h3>
                <p>Quick Actions</p>
                <small style="font-size:12px;color:#666;">Tap for more</small>
            </div>
        `;
    } catch (error) {
        console.error('❌ Error building admin stats:', error);
    }
}

/**
 * Build technician stats
 */
function buildTechnicianStats(container, receivedCount, inProgressCount, forReleaseCount) {
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
        
        console.log('Stats:', { myJobs: myJobs.length, myInProgress, myCompleted, myReady });
        
        container.innerHTML = `
            <div class="stat-card" onclick="switchTab('received')" style="background:#e3f2fd;border-left:4px solid #2196f3;cursor:pointer;" title="Click to view and accept">
                <h3>${receivedCount}</h3>
                <p>📥 Received Devices</p>
                <small style="font-size:12px;color:#666;">Click to accept</small>
            </div>
            <div class="stat-card" onclick="switchTab('my')" style="background:#fff9c4;border-left:4px solid #fbc02d;cursor:pointer;" title="Click to view your jobs">
                <h3>${myJobs.length}</h3>
                <p>🔧 My Total Jobs</p>
                <small style="font-size:12px;color:#666;">Your workload</small>
            </div>
            <div class="stat-card" onclick="switchTab('inprogress')" style="background:#fff3e0;border-left:4px solid #ff9800;cursor:pointer;" title="All repairs in progress">
                <h3>${myInProgress}</h3>
                <p>⚙️ My In Progress</p>
                <small style="font-size:12px;color:#666;">Active work</small>
            </div>
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>${myReady}</h3>
                <p>✅ My Ready</p>
                <small style="font-size:12px;color:#666;">Done, for pickup</small>
            </div>
            <div class="stat-card" style="background:#c8e6c9;border-left:4px solid #2e7d32;">
                <h3>${myCompleted}</h3>
                <p>🎉 My Completed</p>
                <small style="font-size:12px;color:#666;">Total finished</small>
            </div>
            <div class="stat-card" onclick="switchTab('forrelease')" style="background:#e3f2fd;border-left:4px solid #2196f3;cursor:pointer;" title="All ready for release">
                <h3>${forReleaseCount}</h3>
                <p>📦 Shop For Release</p>
                <small style="font-size:12px;color:#666;">All ready units</small>
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

// Export to global scope
window.initializeApp = initializeApp;
window.updateHeaderUserInfo = updateHeaderUserInfo;
window.buildStats = buildStats;
window.closePhotoModal = closePhotoModal;
window.showPhotoModal = showPhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;

/**
 * Toggle Floating Action Button Menu
 */
function toggleFABMenu() {
    const fabMain = document.getElementById('fabMain');
    const fabMenu = document.getElementById('fabMenu');
    const fabBackdrop = document.getElementById('fabBackdrop');
    
    if (!fabMain || !fabMenu || !fabBackdrop) return;
    
    const isActive = fabMenu.classList.contains('active');
    
    if (isActive) {
        fabMenu.classList.remove('active');
        fabMain.classList.remove('active');
        fabBackdrop.classList.remove('active');
    } else {
        fabMenu.classList.add('active');
        fabMain.classList.add('active');
        fabBackdrop.classList.add('active');
        buildFABMenu();
    }
}

/**
 * Build FAB menu with quick actions based on role
 */
function buildFABMenu() {
    const fabMenu = document.getElementById('fabMenu');
    if (!fabMenu || !window.currentUserData) return;
    
    const role = window.currentUserData.role;
    const today = new Date().toDateString();
    
    // Calculate quick stats
    const completed = window.allRepairs.filter(r => r.status === 'Completed').length;
    const pendingPayments = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    ).length;
    
    const todayRevenue = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => {
            const paymentDate = new Date(p.paymentDate || p.date).toDateString();
            return paymentDate === today && p.verified;
        }))
        .reduce((sum, r) => {
            return sum + r.payments
                .filter(p => {
                    const paymentDate = new Date(p.paymentDate || p.date).toDateString();
                    return paymentDate === today && p.verified;
                })
                .reduce((s, p) => s + p.amount, 0);
        }, 0);
    
    const unpaidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) > 0 && r.total > 0;
    }).length;
    
    let menuItems = [];
    
    // Role-specific quick actions
    if (role === 'admin' || role === 'manager') {
        menuItems = [
            { icon: '✅', label: 'Completed', value: completed, action: () => { switchTab('all'); toggleFABMenu(); } },
            { icon: '⏳', label: 'Pending Payment', value: pendingPayments, action: () => { switchTab('pending'); toggleFABMenu(); } },
            { icon: '💰', label: "Today's Revenue", value: `₱${todayRevenue.toFixed(0)}`, action: () => { switchTab('cash'); toggleFABMenu(); } },
            { icon: '💳', label: 'Unpaid Repairs', value: unpaidRepairs, action: () => { switchTab('all'); toggleFABMenu(); } }
        ];
    } else if (role === 'cashier') {
        menuItems = [
            { icon: '💳', label: 'Unpaid', value: unpaidRepairs, action: () => { switchTab('unpaid'); toggleFABMenu(); } },
            { icon: '⏳', label: 'Pending Payment', value: pendingPayments, action: () => { switchTab('pending'); toggleFABMenu(); } },
            { icon: '💰', label: "Today's Revenue", value: `₱${todayRevenue.toFixed(0)}`, action: () => { switchTab('cash'); toggleFABMenu(); } },
            { icon: '✅', label: 'Paid', value: window.allRepairs.filter(r => {
                const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
                return totalPaid >= r.total && r.total > 0;
            }).length, action: () => { switchTab('paid'); toggleFABMenu(); } }
        ];
    } else if (role === 'technician') {
        const techUserId = window.currentUser.uid;
        const myCompleted = window.allRepairs.filter(r => 
            r.acceptedBy === techUserId && r.status === 'Completed'
        ).length;
        
        menuItems = [
            { icon: '🎉', label: 'My Completed', value: myCompleted, action: () => { switchTab('my'); toggleFABMenu(); } }
        ];
    }
    
    // Build menu HTML
    if (menuItems.length === 0) {
        fabMenu.innerHTML = '<div class="fab-menu-item" style="opacity:0.6;"><span class="fab-menu-item-label">No quick actions available</span></div>';
        return;
    }
    
    fabMenu.innerHTML = menuItems.map(item => {
        // Create a wrapper function that closes menu and executes action
        const actionWrapper = () => {
            toggleFABMenu(); // Close menu first
            setTimeout(() => {
                item.action(); // Then execute action
            }, 200);
        };
        
        return `
            <div class="fab-menu-item" onclick="(${actionWrapper.toString()})()">
                <span class="fab-menu-item-icon">${item.icon}</span>
                <span class="fab-menu-item-label">${item.label}</span>
                <span class="fab-menu-item-value">${item.value}</span>
            </div>
        `;
    }).join('');
}

window.toggleFABMenu = toggleFABMenu;
window.buildFABMenu = buildFABMenu;

console.log('✅ app.js loaded');
