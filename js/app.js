// ===== MAIN APP CONTROLLER =====

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');
        
        utils.showLoading(true);
        
        if (!window.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (!window.currentUserData) {
            throw new Error('User data not loaded');
        }
        
        console.log('✅ User verified:', window.currentUserData.displayName);
        console.log('✅ User role:', window.currentUserData.role);
        
        updateHeaderUserInfo();
        
        console.log('📦 Loading repairs...');
        await loadRepairs();
        console.log('✅ Repairs loaded:', window.allRepairs.length);
        
        console.log('📊 Building stats...');
        buildStats();
        
        console.log('🔖 Building tabs...');
        buildTabs();
        
        utils.showLoading(false);
        
        console.log('✅ App initialization complete!');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        alert('Error loading app: ' + error.message);
        utils.showLoading(false);
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
        
        if (!userName || !userRole || !userAvatar) return;
        
        if (window.currentUserData) {
            userName.textContent = window.currentUserData.displayName || 'User';
            userRole.textContent = window.currentUserData.role || 'user';
            
            const avatarUrl = window.currentUserData.profilePicture || 
                             utils.getDefaultAvatar(window.currentUserData.displayName || 'U');
            userAvatar.src = avatarUrl;
        }
    } catch (error) {
        console.error('Error updating header:', error);
    }
}

/**
 * Build statistics dashboard - role-specific with new workflow
 */
function buildStats() {
    try {
        console.log('📊 Building stats dashboard...');
        
        if (!window.currentUserData || !window.allRepairs) {
            console.warn('⚠️ Missing data for stats');
            return;
        }
        
        const role = window.currentUserData.role;
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
        
        // Build role-specific stats
        if (role === 'cashier') {
            buildCashierStats(statsSection, receivedDevices, inProgress, forRelease);
        } else if (role === 'admin' || role === 'manager') {
            buildAdminStats(statsSection, receivedDevices, inProgress, forRelease);
        } else if (role === 'technician') {
            buildTechnicianStats(statsSection, receivedDevices, inProgress, forRelease);
        }
        
        console.log('✅ Stats built successfully');
        
    } catch (error) {
        console.error('❌ Error building stats:', error);
    }
}

/**
 * Build cashier stats
 */
function buildCashierStats(container, receivedCount, inProgressCount, forReleaseCount) {
    const today = new Date().toDateString();
    
    const unpaidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) > 0;
    });
    
    const pendingPayments = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    );
    
    const todayRevenue = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => new Date(p.date).toDateString() === today && p.verified))
        .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
    
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
        <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
            <h3>${unpaidRepairs.length}</h3>
            <p>💳 Unpaid</p>
        </div>
        <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
            <h3>${pendingPayments.length}</h3>
            <p>⏳ Pending Payment</p>
        </div>
        <div class="stat-card" style="background:#f3e5f5;border-left:4px solid #9c27b0;">
            <h3>₱${todayRevenue.toFixed(0)}</h3>
            <p>💰 Today's Revenue</p>
        </div>
    `;
}

/**
 * Build admin/manager stats
 */
function buildAdminStats(container, receivedCount, inProgressCount, forReleaseCount) {
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
        <div class="stat-card" style="background:#c8e6c9;border-left:4px solid #2e7d32;">
            <h3>${completed}</h3>
            <p>✅ Completed</p>
            <small style="font-size:12px;color:#666;">Total done</small>
        </div>
        <div class="stat-card" style="background:#fff3cd;border-left:4px solid #fbc02d;">
            <h3>${pendingPayments.length}</h3>
            <p>⏳ Pending Payment</p>
            <small style="font-size:12px;color:#666;">Need verification</small>
        </div>
        <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
            <h3>₱${todayRevenue.toFixed(0)}</h3>
            <p>💰 Today's Revenue</p>
            <small style="font-size:12px;color:#666;">Verified payments</small>
        </div>
    `;
}

/**
 * Build technician stats
 */
function buildTechnicianStats(container, receivedCount, inProgressCount, forReleaseCount) {
    const myJobs = window.allRepairs.filter(r => r.acceptedBy === window.currentUser.uid);
    const myInProgress = myJobs.filter(r => r.status === 'In Progress' || r.status === 'Waiting for Parts').length;
    const myCompleted = myJobs.filter(r => r.status === 'Completed').length;
    const myReady = myJobs.filter(r => r.status === 'Ready for Pickup').length;
    
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

console.log('✅ app.js loaded');
