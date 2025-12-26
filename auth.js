// ===== AUTHENTICATION MODULE =====

let currentUser = null;
let currentUserData = null;

/**
 * Handle login
 */
async function handleLogin(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Load user data
        const snapshot = await db.ref(`users/${currentUser.uid}`).once('value');
        currentUserData = snapshot.val();
        
        if (!currentUserData) {
            throw new Error('User data not found');
        }
        
        // Check if user is active
        if (currentUserData.status !== 'active') {
            await auth.signOut();
            errorEl.textContent = 'Account is deactivated. Contact administrator.';
            errorEl.style.display = 'block';
            return;
        }
        
        // Record login event
        await recordLoginEvent('login');
        
        // Update last login
        await db.ref(`users/${currentUser.uid}`).update({
            lastLogin: new Date().toISOString()
        });
        
        // Show app
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        // Initialize app
        window.initializeApp();
        
    } catch (error) {
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
        currentUser = null;
        currentUserData = null;
        
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
    if (!currentUser) return;
    
    const event = {
        type: type, // 'login' or 'logout'
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        userName: currentUserData.displayName,
        userEmail: currentUserData.email
    };
    
    // Add to user's login history
    await db.ref(`users/${currentUser.uid}/loginHistory`).push(event);
    
    // Also add to global login history (for admin tracking)
    await db.ref(`loginHistory`).push(event);
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
        await db.ref(`users/${currentUser.uid}`).update({
            profilePicture: compressedImage,
            profilePictureUpdated: new Date().toISOString()
        });
        
        // Update current user data
        currentUserData.profilePicture = compressedImage;
        
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
        avatar.src = imageUrl || utils.getDefaultAvatar(currentUserData.displayName);
    });
}

/**
 * Open profile modal
 */
async function openProfileModal() {
    const content = document.getElementById('profileModalContent');
    
    // Get login history
    const historySnapshot = await db.ref(`users/${currentUser.uid}/loginHistory`)
        .orderByChild('timestamp')
        .limitToLast(20)
        .once('value');
    
    const loginHistory = [];
    historySnapshot.forEach(child => {
        loginHistory.unshift(child.val());
    });
    
    const currentAvatar = currentUserData.profilePicture || utils.getDefaultAvatar(currentUserData.displayName);
    
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
                <h3>${currentUserData.displayName}</h3>
                <p style="color:#666;">${currentUserData.email}</p>
                <span class="user-badge badge-${currentUserData.role}">${currentUserData.role.toUpperCase()}</span>
            </div>
        </div>
        
        <div class="profile-section">
            <h4>👤 Profile Information</h4>
            <p><strong>Technician Name:</strong> ${currentUserData.technicianName || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color:green;">${currentUserData.status}</span></p>
            <p><strong>Created:</strong> ${utils.formatDate(currentUserData.createdAt)}</p>
            <p><strong>Last Login:</strong> ${utils.formatDateTime(currentUserData.lastLogin)}</p>
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
 */
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        const snapshot = await db.ref(`users/${user.uid}`).once('value');
        currentUserData = snapshot.val();
        
        if (currentUserData && currentUserData.status === 'active') {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            
            if (window.initializeApp) {
                window.initializeApp();
            }
        } else {
            auth.signOut();
        }
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
});

// Attach login handler
document.getElementById('loginForm').addEventListener('submit', handleLogin);

// Export to global scope
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.handleAvatarUpload = handleAvatarUpload;
