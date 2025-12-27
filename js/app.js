// ===== MAIN APP CONTROLLER =====

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');
        
        // Show loading
        utils.showLoading(true);
        
        // Verify user data is loaded
        if (!window.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (!window.currentUserData) {
            throw new Error('User data not loaded');
        }
        
        console.log('✅ User verified:', window.currentUserData.displayName);
        console.log('✅ User role:', window.currentUserData.role);
        
        // Update user info in header
        updateHeaderUserInfo();
        
        // Load repairs
        console.log('📦 Loading repairs...');
        await loadRepairs();
        console.log('✅ Repairs loaded:', window.allRepairs.length);
        
        // Build stats dashboard
        console.log('📊 Building stats...');
        buildStats();
        
        // Build tabs based on role
        console.log('🔖 Building tabs...');
        buildTabs();
        
        // Hide loading
        utils.showLoading(false);
        
        console.log('✅ App initialization complete!');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        alert('Error loading app: ' + error.message + '\n\nPlease refresh the page.\n\nIf error persists, contact support.');
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
        
        if (!userName || !userRole || !userAvatar) {
            console.warn('Header elements not found');
            return;
        }
        
        if (window.currentUserData) {
            userName.textContent = window.currentUserData.displayName || 'User';
            userRole.textContent = window.currentUserData.role || 'user';
            
            // Set profile picture or default avatar
            const avatarUrl = window.currentUserData.profilePicture || 
                             utils.getDefaultAvatar(window.currentUserData.displayName || 'U');
            userAvatar.src = avatarUrl;
            
            console.log('✅ Header updated');
        }
    } catch (error) {
        console.error('Error updating header:', error);
    }
}

/**
 * Build statistics dashboard - role-specific
 */
function buildStats() {
    try {
        console.log('📊 Building stats dashboard...');
        
        // Safety checks
        if (!window.currentUserData) {
            console.error('❌ Cannot build stats: currentUserData is null');
            return;
        }
        
        if (!window.allRepairs) {
            console.warn('⚠️ allRepairs is null, using empty array');
            window.allRepairs = [];
        }
        
        const role = window.currentUserData.role;
        console.log('User role:', role);
        console.log('Total repairs:', window.allRepairs.length);
        
        const statsSection = document.getElementById('statsSection');
        if (!statsSection) {
            console.error('❌ Stats section not found');
            return;
        }
        
        // CASHIER - Payment-focused stats
        if (role === 'cashier') {
            buildCashierStats(statsSection);
        }
        // ADMIN/MANAGER - Full stats with clickable filters
        else if (role === 'admin' || role === 'manager') {
            buildAdminStats(statsSection);
        }
        // TECHNICIAN - Work-focused stats
        else if (role === 'technician') {
            buildTechnicianStats(statsSection);
        }
        
        console.log('✅ Stats built successfully');
        
    } catch (error) {
        console.error('❌ Error building stats:', error);
    }
}

/**
 * Build cashier-specific stats
 */
function buildCashierStats(container) {
    const today = new Date().toDateString();
    
    // Payment calculations
    const unpaidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) > 0;
    });
    
    const pendingPayments = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    );
    
    const paidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) === 0 && r.total > 0;
    });
    
    const receivedToday = window.allRepairs.filter(r => 
        new Date(r.createdAt).toDateString() === today
    );
    
    const todayRevenue = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => new Date(p.date).toDateString() === today && p.verified))
        .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
    
    const totalUnpaidAmount = unpaidRepairs.reduce((sum, r) => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((s, p) => s + p.amount, 0);
        return sum + (r.total - totalPaid);
    }, 0);
    
    container.innerHTML = `
        <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
            <h3>${unpaidRepairs.length}</h3>
            <p>💳 Unpaid Repairs</p>
            <small style="font-size:12px;color:#666;">₱${totalUnpaidAmount.toFixed(0)} outstanding</small>
        </div>
        <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
            <h3>${pendingPayments.length}</h3>
            <p>⏳ Pending Verification</p>
            <small style="font-size:12px;color:#666;">Awaiting approval</small>
        </div>
        <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
            <h3>${paidRepairs.length}</h3>
            <p>✅ Fully Paid</p>
            <small style="font-size:12px;color:#666;">No balance</small>
        </div>
        <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
            <h3>${receivedToday.length}</h3>
            <p>📥 Received Today</p>
            <small style="font-size:12px;color:#666;">New devices</small>
        </div>
        <div class="stat-card" style="background:#f3e5f5;border-left:4px solid #9c27b0;">
            <h3>₱${todayRevenue.toFixed(0)}</h3>
            <p>💰 Today's Revenue</p>
            <small style="font-size:12px;color:#666;">Verified payments</small>
        </div>
        <div class="stat-card" style="background:#fff9c4;border-left:4px solid #fbc02d;">
            <h3>${window.allRepairs.length}</h3>
            <p>📋 Total Repairs</p>
            <small style="font-size:12px;color:#666;">All devices</small>
        </div>
    `;
}

/**
 * Build admin/manager stats with clickable filters
 */
function buildAdminStats(container) {
    const today = new Date().toDateString();
    const userRepairs = window.allRepairs;
    
    // Calculate stats by status
    const received = userRepairs.filter(r => r.status === 'Received').length;
    const inProgress = userRepairs.filter(r => r.status === 'In Progress').length;
    const waiting = userRepairs.filter(r => r.status === 'Waiting for Parts').length;
    const ready = userRepairs.filter(r => r.status === 'Ready for Pickup').length;
    const completed = userRepairs.filter(r => r.status === 'Completed').length;
    const unsuccessful = userRepairs.filter(r => r.status === 'Unsuccessful').length;
    const rto = userRepairs.filter(r => r.status === 'RTO').length;
    
    // Payment stats
    const todayRevenue = userRepairs
        .filter(r => r.payments && r.payments.some(p => new Date(p.date).toDateString() === today && p.verified))
        .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
    const pending = userRepairs.filter(r => r.payments && r.payments.some(p => !p.verified)).length;
    
    container.innerHTML = `
        <div class="stat-card" onclick="filterByStatus('all')" style="cursor:pointer;" title="Click to view all repairs">
            <h3>${userRepairs.length}</h3>
            <p>Total Repairs</p>
        </div>
        <div class="stat-card stat-received" onclick="filterByStatus('Received')" style="cursor:pointer;" title="Click to view received units">
            <h3>${received}</h3>
            <p>📥 Received</p>
        </div>
        <div class="stat-card stat-in-progress" onclick="filterByStatus('In Progress')" style="cursor:pointer;" title="Click to view in progress">
            <h3>${inProgress}</h3>
            <p>🔧 In Progress</p>
        </div>
        <div class="stat-card stat-waiting" onclick="filterByStatus('Waiting for Parts')" style="cursor:pointer;" title="Click to view waiting for parts">
            <h3>${waiting}</h3>
            <p>⏳ Waiting Parts</p>
        </div>
        <div class="stat-card stat-ready" onclick="filterByStatus('Ready for Pickup')" style="cursor:pointer;" title="Click to view ready units">
            <h3>${ready}</h3>
            <p>✅ Ready</p>
        </div>
        <div class="stat-card stat-completed" onclick="filterByStatus('Completed')" style="cursor:pointer;" title="Click to view completed">
            <h3>${completed}</h3>
            <p>🎉 Completed</p>
        </div>
        ${unsuccessful > 0 ? `
            <div class="stat-card stat-unsuccessful" onclick="filterByStatus('Unsuccessful')" style="cursor:pointer;" title="Click to view unsuccessful">
                <h3>${unsuccessful}</h3>
                <p>❌ Unsuccessful</p>
            </div>
        ` : ''}
        ${rto > 0 ? `
            <div class="stat-card stat-rto" onclick="filterByStatus('RTO')" style="cursor:pointer;" title="Click to view RTO">
                <h3>${rto}</h3>
                <p>🔙 RTO</p>
            </div>
        ` : ''}
        <div class="stat-card" onclick="filterByStatus('pending-payment')" style="cursor:pointer;background:#fff3cd;" title="Click to view pending payments">
            <h3>${pending}</h3>
            <p>⏳ Pending Payment</p>
        </div>
        <div class="stat-card" style="background:#e3f2fd;">
            <h3>₱${todayRevenue.toFixed(0)}</h3>
            <p>💰 Today's Revenue</p>
        </div>
    `;
}

/**
 * Build technician stats
 */
function buildTechnicianStats(container) {
    const techName = window.currentUserData.technicianName;
    const myRepairs = window.allRepairs.filter(r => r.assignedTo === techName);
    
    const inProgress = myRepairs.filter(r => r.status === 'In Progress' || r.status === 'Received').length;
    const waiting = myRepairs.filter(r => r.status === 'Waiting for Parts').length;
    const ready = myRepairs.filter(r => r.status === 'Ready for Pickup').length;
    const completed = myRepairs.filter(r => r.status === 'Completed').length;
    
    container.innerHTML = `
        <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
            <h3>${myRepairs.length}</h3>
            <p>My Workload</p>
        </div>
        <div class="stat-card stat-in-progress">
            <h3>${inProgress}</h3>
            <p>🔧 In Progress</p>
        </div>
        <div class="stat-card stat-waiting">
            <h3>${waiting}</h3>
            <p>⏳ Waiting Parts</p>
        </div>
        <div class="stat-card stat-ready">
            <h3>${ready}</h3>
            <p>✅ Ready</p>
        </div>
        <div class="stat-card stat-completed">
            <h3>${completed}</h3>
            <p>🎉 Completed</p>
        </div>
    `;
}

/**
 * Filter repairs by status
 */
function filterByStatus(status) {
    console.log('🔍 Filtering by status:', status);
    
    // Switch to appropriate tab and apply filter
    if (window.buildFilteredRepairsTab) {
        window.buildFilteredRepairsTab(status);
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
window.filterByStatus = filterByStatus;
window.closePhotoModal = closePhotoModal;
window.showPhotoModal = showPhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;

console.log('✅ app.js loaded');
