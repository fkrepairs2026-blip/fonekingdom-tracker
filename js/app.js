// ===== MAIN APP CONTROLLER =====

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Show loading
        utils.showLoading(true);
        
        // Wait for user data to be available
        let retries = 0;
        while (!window.currentUserData && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.currentUserData) {
            throw new Error('User data not loaded. Please refresh the page.');
        }
        
        // Update user info in header
        updateHeaderUserInfo();
        
        // Load repairs
        await loadRepairs();
        
        // Build stats dashboard
        buildStats();
        
        // Build tabs based on role
        buildTabs();
        
        // Hide loading
        utils.showLoading(false);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading app: ' + error.message + '\n\nPlease refresh the page.');
        utils.showLoading(false);
    }
}

/**
 * Update header with user information
 */
function updateHeaderUserInfo() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (window.currentUserData) {
        userName.textContent = window.currentUserData.displayName || 'User';
        userRole.textContent = window.currentUserData.role || 'user';
        
        // Set profile picture or default avatar
        const avatarUrl = window.currentUserData.profilePicture || 
                         utils.getDefaultAvatar(window.currentUserData.displayName || 'U');
        userAvatar.src = avatarUrl;
    }
}

/**
 * Build statistics dashboard
 */
function buildStats() {
    // Safety check
    if (!window.currentUserData || !window.allRepairs) {
        console.warn('Cannot build stats - user data or repairs not loaded');
        return;
    }
    
    const today = new Date().toDateString();
    const role = window.currentUserData.role;
    
    // Filter repairs based on role
    let userRepairs = window.allRepairs;
    if (role === 'technician') {
        userRepairs = window.allRepairs.filter(r => r.assignedTo === window.currentUserData.technicianName);
    }
    
    const inProgress = userRepairs.filter(r => r.status === 'In Progress' || r.status === 'Received').length;
    const todayRevenue = userRepairs
        .filter(r => r.payments && r.payments.some(p => new Date(p.date).toDateString() === today && p.verified))
        .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
    const pending = userRepairs.filter(r => r.payments && r.payments.some(p => !p.verified)).length;
    
    const statsLabels = role === 'technician' 
        ? ['My Workload', 'In Progress', 'My Revenue', 'Pending Verify']
        : ['Total Repairs', 'In Progress', "Today's Revenue", 'Pending Verify'];
    
    const statsSection = document.getElementById('statsSection');
    if (statsSection) {
        statsSection.innerHTML = `
            <div class="stat-card">
                <h3>${userRepairs.length}</h3>
                <p>${statsLabels[0]}</p>
            </div>
            <div class="stat-card">
                <h3>${inProgress}</h3>
                <p>${statsLabels[1]}</p>
            </div>
            <div class="stat-card">
                <h3>₱${todayRevenue.toFixed(0)}</h3>
                <p>${statsLabels[2]}</p>
            </div>
            <div class="stat-card">
                <h3>${pending}</h3>
                <p>${statsLabels[3]}</p>
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
    document.getElementById('photoModal').style.display = 'none';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Export to global scope
window.initializeApp = initializeApp;
window.updateHeaderUserInfo = updateHeaderUserInfo;
window.buildStats = buildStats;
window.closePhotoModal = closePhotoModal;
window.closeUserModal = closeUserModal;
window.closePaymentModal = closePaymentModal;
