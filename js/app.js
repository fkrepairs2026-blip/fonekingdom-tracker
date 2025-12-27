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
 * Build statistics dashboard with clickable filters
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
        
        const today = new Date().toDateString();
        const role = window.currentUserData.role;
        
        console.log('User role:', role);
        console.log('Total repairs:', window.allRepairs.length);
        
        // Filter repairs based on role
        let userRepairs = window.allRepairs;
        if (role === 'technician') {
            const techName = window.currentUserData.technicianName;
            console.log('Filtering for technician:', techName);
            userRepairs = window.allRepairs.filter(r => r.assignedTo === techName);
            console.log('Technician repairs:', userRepairs.length);
        }
        
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
        
        const statsSection = document.getElementById('statsSection');
        if (!statsSection) {
            console.error('❌ Stats section not found');
            return;
        }
        
        // Build clickable stats cards
        statsSection.innerHTML = `
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
            ${role !== 'technician' ? `
                <div class="stat-card" onclick="filterByStatus('pending-payment')" style="cursor:pointer;background:#fff3cd;" title="Click to view pending payments">
                    <h3>${pending}</h3>
                    <p>⏳ Pending Payment</p>
                </div>
                <div class="stat-card" style="background:#e3f2fd;">
                    <h3>₱${todayRevenue.toFixed(0)}</h3>
                    <p>💰 Today's Revenue</p>
                </div>
            ` : ''}
        `;
        
        console.log('✅ Stats built successfully');
        
    } catch (error) {
        console.error('❌ Error building stats:', error);
        // Don't throw - just log and continue
    }
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
