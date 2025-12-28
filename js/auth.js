// ===== AUTHENTICATION MODULE =====

// Initialize as null and export immediately to global scope
window.currentUser = null;
window.currentUserData = null;

// Flag to prevent multiple initializations
let appInitialized = false;

/**
 * Handle login
 */
async function handleLogin(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        console.log('🔐 Logging in...');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        window.currentUser = userCredential.user;
        
        console.log('✅ Auth successful, loading user data...');
        
        // Load user data and WAIT for it
        const snapshot = await db.ref(`users/${window.currentUser.uid}`).once('value');
        window.currentUserData = snapshot.val();
        
        console.log('📊 User data loaded:', window.currentUserData);
        
        if (!window.currentUserData) {
            throw new Error('User data not found in database');
        }
        
        // Check if user is active
        if (window.currentUserData.status !== 'active') {
            await auth.signOut();
            errorEl.textContent = 'Account is deactivated. Contact administrator.';
            errorEl.style.display = 'block';
            return;
        }
        
        // Record login event
        await recordLoginEvent('login');
        
        // Update last login
        await db.ref(`users/${window.currentUser.uid}`).update({
            lastLogin: new Date().toISOString()
        });
        
        // Show app
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        // Initialize app ONLY if not already initialized
        if (!appInitialized && window.initializeApp) {
            appInitialized = true;
            console.log('🚀 Initializing app...');
            await window.initializeApp();
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Record logout event
        await recordLoginEvent('logout');
        
        await auth.signOut();
        window.currentUser = null;
        window.currentUserData = null;
        appInitialized = false;
        
        // Reload page to show login
        window.location.reload();
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
}

/**
 * Record login/logout event
 */
async function recordLoginEvent(type) {
    if (!window.currentUser || !window.currentUserData) return;
    
    try {
        const event = {
            type: type,
            timestamp: new Date().toISOString(),
            userId: window.currentUser.uid,
            userName: window.currentUserData.displayName,
            userEmail: window.currentUserData.email
        };
        
        // Add to user's login history
        await db.ref(`users/${window.currentUser.uid}/loginHistory`).push(event);
        
        // Also add to global login history (for admin tracking)
        await db.ref(`loginHistory`).push(event);
        
        // Log to activity logs
        if (window.logActivity) {
            await window.logActivity(
                type === 'login' ? 'user_login' : 'user_logout',
                {
                    email: window.currentUserData.email,
                    role: window.currentUserData.role,
                    timestamp: event.timestamp
                },
                `${window.currentUserData.displayName} ${type === 'login' ? 'logged in' : 'logged out'}`
            );
        }
    } catch (error) {
        console.warn('Could not record login event:', error);
    }
}

/**
 * Update user profile picture
 */
async function updateProfilePicture(file) {
    if (!file) return;
    
    try {
        utils.showLoading(true);
        
        // Compress image
        const compressedImage = await utils.compressImage(file, 300);
        
        // Save to Firebase
        await db.ref(`users/${window.currentUser.uid}`).update({
            profilePicture: compressedImage,
            profilePictureUpdated: new Date().toISOString()
        });
        
        // Update current user data
        window.currentUserData.profilePicture = compressedImage;
        
        // Update UI
        updateUserAvatar(compressedImage);
        
        utils.showLoading(false);
        alert('✅ Profile picture updated!');
        
    } catch (error) {
        utils.showLoading(false);
        alert('Error updating profile picture: ' + error.message);
    }
}

/**
 * Update avatar in UI
 */
function updateUserAvatar(imageUrl) {
    const avatars = document.querySelectorAll('.user-avatar, .profile-avatar-large');
    avatars.forEach(avatar => {
        avatar.src = imageUrl || utils.getDefaultAvatar(window.currentUserData.displayName);
    });
}

/**
 * Open profile modal
 */
async function openProfileModal() {
    if (!window.currentUser || !window.currentUserData) {
        alert('User data not loaded');
        return;
    }
    
    const content = document.getElementById('profileModalContent');
    
    // Get login history
    const historySnapshot = await db.ref(`users/${window.currentUser.uid}/loginHistory`)
        .orderByChild('timestamp')
        .limitToLast(20)
        .once('value');
    
    const loginHistory = [];
    historySnapshot.forEach(child => {
        loginHistory.unshift(child.val());
    });
    
    const currentAvatar = window.currentUserData.profilePicture || utils.getDefaultAvatar(window.currentUserData.displayName);
    
    content.innerHTML = `
        <div class="profile-section">
            <div class="profile-avatar-upload">
                <img src="${currentAvatar}" alt="Profile" class="profile-avatar-large" id="profileAvatarPreview">
                <br>
                <label class="avatar-upload-btn">
                    📸 Change Photo
                    <input type="file" accept="image/*" onchange="handleAvatarUpload(event)">
                </label>
            </div>
            
            <div style="text-align:center;">
                <h3>${window.currentUserData.displayName}</h3>
                <p style="color:#666;">${window.currentUserData.email}</p>
                <span class="user-badge badge-${window.currentUserData.role}">${window.currentUserData.role.toUpperCase()}</span>
            </div>
        </div>
        
        <div class="profile-section">
            <h4>👤 Profile Information</h4>
            <p><strong>Technician Name:</strong> ${window.currentUserData.technicianName || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color:green;">${window.currentUserData.status}</span></p>
            <p><strong>Created:</strong> ${utils.formatDate(window.currentUserData.createdAt)}</p>
            <p><strong>Last Login:</strong> ${utils.formatDateTime(window.currentUserData.lastLogin || new Date().toISOString())}</p>
        </div>
        
        <div class="profile-section">
            <h4>📊 Login History (Last 20)</h4>
            <div class="login-history">
                ${loginHistory.length === 0 ? '<p style="text-align:center;color:#666;">No login history yet</p>' : ''}
                ${loginHistory.map(event => `
                    <div class="login-record ${event.type}">
                        <div>
                            <div class="login-record-status ${event.type}">
                                ${event.type === 'login' ? '🟢 Login' : '🔴 Logout'}
                            </div>
                            <div class="login-record-time">
                                ${utils.formatDateTime(event.timestamp)}
                                <small>(${utils.timeAgo(event.timestamp)})</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <button onclick="closeProfileModal()" style="width:100%;background:#667eea;color:white;">Close</button>
    `;
    
    document.getElementById('profileModal').style.display = 'block';
}

/**
 * Handle avatar file upload
 */
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('profileAvatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Upload to Firebase
    await updateProfilePicture(file);
}

/**
 * Close profile modal
 */
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

/**
 * Initialize auth state listener
 * NOTE: This handles page refreshes and persistent sessions
 * But we DON'T call initializeApp here to avoid double initialization
 */
auth.onAuthStateChanged(async (user) => {
    console.log('🔄 Auth state changed:', user ? 'logged in' : 'logged out');
    
    if (user && !appInitialized) {
        window.currentUser = user;
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        window.currentUserData = snapshot.val();
        
        console.log('📊 User data from state change:', window.currentUserData);
        
        if (window.currentUserData && window.currentUserData.status === 'active') {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            
            // Initialize app only if not already initialized
            if (!appInitialized && window.initializeApp) {
                appInitialized = true;
                console.log('🚀 Initializing app from auth state...');
                await window.initializeApp();
            }
        } else if (window.currentUserData && window.currentUserData.status !== 'active') {
            console.warn('⚠️ User account is not active');
            auth.signOut();
        }
    } else if (!user) {
        console.log('👋 No user logged in');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        appInitialized = false;
    }
});

// Attach login handler
document.getElementById('loginForm').addEventListener('submit', handleLogin);

// Export to global scope
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.handleAvatarUpload = handleAvatarUpload;
