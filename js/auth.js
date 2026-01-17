// ===== AUTHENTICATION MODULE =====

// Initialize as null and export immediately to global scope
window.currentUser = null;
window.currentUserData = null;

// Flag to prevent multiple initializations
let appInitialized = false;

// ===== RATE LIMITING =====
class RateLimiter {
    constructor() {
        this.attempts = new Map();
    }

    isRateLimited(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const attempt = this.attempts.get(key);

        // First attempt
        if (!attempt) {
            this.attempts.set(key, {
                count: 1,
                resetAt: now + windowMs
            });
            return false;
        }

        // Reset window has passed
        if (now > attempt.resetAt) {
            this.attempts.set(key, {
                count: 1,
                resetAt: now + windowMs
            });
            return false;
        }

        // Increment attempt count
        attempt.count++;

        // Check if rate limited
        if (attempt.count > maxAttempts) {
            const waitTime = Math.ceil((attempt.resetAt - now) / 1000 / 60);
            throw new Error(`Too many login attempts. Please try again in ${waitTime} minute${waitTime > 1 ? 's' : ''}.`);
        }

        return false;
    }

    reset(key) {
        this.attempts.delete(key);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, attempt] of this.attempts.entries()) {
            if (now > attempt.resetAt) {
                this.attempts.delete(key);
            }
        }
    }
}

const rateLimiter = new RateLimiter();

// Cleanup rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

// ===== SESSION SECURITY =====
class SessionManager {
    constructor() {
        this.timeoutMinutes = 30; // Auto-logout after 30 minutes of inactivity
        this.warningMinutes = 5; // Warn 5 minutes before timeout
        this.timeoutId = null;
        this.warningTimeoutId = null;
        this.warningModal = null;
        this.countdownInterval = null;
    }

    init() {
        // Listen for user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetTimeout(), { passive: true });
        });

        // Start timeout
        this.resetTimeout();
    }

    resetTimeout() {
        // Don't reset if not logged in
        if (!window.currentUser) return;

        // Clear existing timeouts
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        // Hide warning modal if showing
        if (this.warningModal) {
            this.hideWarning();
        }

        // Set warning timeout (25 minutes)
        this.warningTimeoutId = setTimeout(() => {
            this.showWarning();
        }, (this.timeoutMinutes - this.warningMinutes) * 60 * 1000);

        // Set logout timeout (30 minutes)
        this.timeoutId = setTimeout(() => {
            this.logout();
        }, this.timeoutMinutes * 60 * 1000);
    }

    showWarning() {
        // Create modal
        this.warningModal = document.createElement('div');
        this.warningModal.className = 'session-warning-modal';
        this.warningModal.innerHTML = `
            <div class="session-warning-content">
                <h3>⚠️ Session Timeout Warning</h3>
                <p>Your session will expire in <strong id="sessionCountdown">${this.warningMinutes}:00</strong> due to inactivity.</p>
                <p>Click "Continue" to stay logged in.</p>
                <div class="btn-group">
                    <button onclick="sessionManager.continueSession()" class="btn btn-primary">
                        Continue Session
                    </button>
                    <button onclick="sessionManager.logout()" class="btn btn-secondary">
                        Logout Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.warningModal);

        // Start countdown
        let timeLeft = this.warningMinutes * 60;
        const countdownEl = document.getElementById('sessionCountdown');

        this.countdownInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    hideWarning() {
        if (this.warningModal) {
            this.warningModal.remove();
            this.warningModal = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    continueSession() {
        this.hideWarning();
        this.resetTimeout();
        if (utils.showSuccess) {
            utils.showSuccess('Session extended successfully');
        }
    }

    async logout() {
        try {
            this.hideWarning();
            await auth.signOut();
            window.currentUser = null;
            window.currentUserData = null;

            if (utils.showError) {
                utils.showError('You have been logged out due to inactivity.');
            } else {
                alert('You have been logged out due to inactivity.');
            }

            window.location.reload();
        } catch (error) {
            console.error('Auto-logout error:', error);
        }
    }
}

const sessionManager = new SessionManager();

// Export to global
window.sessionManager = sessionManager;

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
        if (window.DebugLogger) {
            DebugLogger.log('AUTH', 'Login Attempt', { email });
        }

        // Check rate limit
        try {
            rateLimiter.isRateLimited(`login:${email}`, 5, 15 * 60 * 1000);
        } catch (rateLimitError) {
            if (window.DebugLogger) {
                DebugLogger.log('ERROR', 'Login Rate Limited', { email, error: rateLimitError.message });
            }
            errorEl.textContent = rateLimitError.message;
            errorEl.style.display = 'block';
            errorEl.style.backgroundColor = '#fff3cd';
            errorEl.style.color = '#856404';
            errorEl.style.borderLeft = '4px solid #f6ad55';
            errorEl.style.padding = '1rem';
            return;
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        window.currentUser = userCredential.user;

        console.log('✅ Auth successful, loading user data...');

        // Success - reset rate limit
        rateLimiter.reset(`login:${email}`);

        // Load user data and WAIT for it
        const snapshot = await db.ref(`users/${window.currentUser.uid}`).once('value');
        window.currentUserData = snapshot.val();

        console.log('📊 User data loaded:', window.currentUserData);

        if (!window.currentUserData) {
            if (window.DebugLogger) {
                DebugLogger.log('ERROR', 'User Data Not Found', { uid: window.currentUser.uid, email });
            }
            throw new Error('User data not found in database');
        }

        // Check if user is active
        if (window.currentUserData.status !== 'active') {
            if (window.DebugLogger) {
                DebugLogger.log('ERROR', 'Account Deactivated', {
                    email,
                    status: window.currentUserData.status
                });
            }
            await auth.signOut();
            errorEl.textContent = 'Account is deactivated. Contact administrator.';
            errorEl.style.display = 'block';
            return;
        }

        if (window.DebugLogger) {
            DebugLogger.log('AUTH', 'Login Successful', {
                uid: window.currentUser.uid,
                email: window.currentUser.email,
                displayName: window.currentUserData.displayName,
                role: window.currentUserData.role
            });
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

        // Initialize session manager
        sessionManager.init();

        // Initialize app ONLY if not already initialized
        if (!appInitialized && window.initializeApp) {
            appInitialized = true;
            console.log('🚀 Initializing app...');
            await window.initializeApp();
        }

    } catch (error) {
        console.error('❌ Login error:', error);

        // Handle error with user-friendly message
        const friendlyError = utils.handleFirebaseError ?
            utils.handleFirebaseError(error) :
            { message: error.message };

        errorEl.textContent = friendlyError.message;
        errorEl.style.display = 'block';
        errorEl.style.backgroundColor = '#ffebee';
        errorEl.style.color = '#c0392b';
        errorEl.style.borderLeft = '4px solid #fc8181';
        errorEl.style.padding = '1rem';
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
    
    // Get badges data for technicians/cashiers
    let badgesHTML = '';
    if (['technician', 'cashier'].includes(window.currentUserData.role)) {
        const badges = window.currentUserBadges || await (async () => {
            const snapshot = await db.ref(`routineBadges/${window.currentUser.uid}`).once('value');
            return snapshot.val() || {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysCompleted: 0,
                badges: [],
                totalCashEarned: 0,
                totalCashPaid: 0
            };
        })();
        
        const pendingCash = badges.totalCashEarned - badges.totalCashPaid;
        const badgeList = Object.values(badges.badges || {});
        
        badgesHTML = `
            <div class="profile-section">
                <h4>🏆 Achievements & Badges</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:15px;margin-bottom:20px;">
                    <div style="text-align:center;padding:15px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:10px;">
                        <div style="font-size:32px;">🔥</div>
                        <div style="font-size:24px;font-weight:bold;">${badges.currentStreak || 0}</div>
                        <div style="font-size:12px;opacity:0.8;">Current Streak</div>
                    </div>
                    <div style="text-align:center;padding:15px;background:linear-gradient(135deg,#48bb78,#38a169);color:white;border-radius:10px;">
                        <div style="font-size:32px;">🏆</div>
                        <div style="font-size:24px;font-weight:bold;">${badges.longestStreak || 0}</div>
                        <div style="font-size:12px;opacity:0.8;">Longest Streak</div>
                    </div>
                    <div style="text-align:center;padding:15px;background:linear-gradient(135deg,#f6ad55,#ed8936);color:white;border-radius:10px;">
                        <div style="font-size:32px;">🏅</div>
                        <div style="font-size:24px;font-weight:bold;">${badgeList.length}</div>
                        <div style="font-size:12px;opacity:0.8;">Total Badges</div>
                    </div>
                </div>
                
                <div style="background:#f0f7ff;padding:15px;border-radius:10px;margin-bottom:15px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <div>
                            <div style="font-size:12px;color:#666;">💰 Pending Cash Rewards</div>
                            <div style="font-size:24px;font-weight:bold;color:#f6ad55;">₱${pendingCash.toLocaleString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:12px;color:#666;">💵 Paid Out</div>
                            <div style="font-size:20px;font-weight:bold;color:#48bb78;">₱${badges.totalCashPaid.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style="font-size:11px;color:#999;text-align:center;">
                        <em>Coming Soon: Cash rewards converted during holiday seasons</em>
                    </div>
                </div>
                
                ${badgeList.length > 0 ? `
                    <h5 style="margin-top:20px;margin-bottom:10px;">📜 Badge History</h5>
                    <div style="max-height:200px;overflow-y:auto;">
                        ${badgeList.map(badge => `
                            <div style="display:flex;align-items:center;padding:10px;background:#fff;border:2px solid ${badge.isPaid ? '#48bb78' : '#f6ad55'};border-radius:8px;margin-bottom:8px;">
                                <div style="font-size:32px;margin-right:12px;">🏆</div>
                                <div style="flex:1;">
                                    <div style="font-weight:bold;">${badge.type}</div>
                                    <div style="font-size:11px;color:#666;">${utils.formatDate(badge.earnedAt)} • ${badge.season} Season</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:bold;color:#f6ad55;">₱${badge.cashValue}</div>
                                    <div style="font-size:10px;color:${badge.isPaid ? '#48bb78' : '#999'};">
                                        ${badge.isPaid ? '✅ Paid' : '⏳ Pending'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="text-align:center;color:#999;padding:20px;">No badges earned yet. Complete your daily routine to earn badges!</p>'}
            </div>
        `;
    }

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
        
        ${badgesHTML}
        
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

            // Initialize session manager
            sessionManager.init();

            // Initialize app only if not already initialized
            if (!appInitialized && window.initializeApp) {
                appInitialized = true;
                console.log('🚀 Initializing app from auth state...');
                await window.initializeApp();
                
                // Show smart clock-in prompt for technicians/cashiers
                setTimeout(() => showSmartClockInPrompt(), 1000);
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

// ===== AUTHENTICATION GUARDS & SECURITY =====

/**
 * Check if user is authenticated
 */
function requireAuth() {
    if (!window.currentUser || !window.currentUserData) {
        console.warn('⚠️ Authentication required');
        utils.showError('Please login to continue');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        return false;
    }

    if (window.currentUserData.status !== 'active') {
        console.warn('⚠️ Account is not active');
        utils.showError('Your account has been deactivated. Contact administrator.');
        handleLogout();
        return false;
    }

    return true;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
    return window.currentUserData && window.currentUserData.role === 'admin';
}

/**
 * Check if current user is manager or higher
 */
function isManagerOrHigher() {
    const role = window.currentUserData?.role;
    return role === 'admin' || role === 'manager';
}

/**
 * Check if current user is cashier or higher
 */
function isCashierOrHigher() {
    const role = window.currentUserData?.role;
    return role === 'admin' || role === 'manager' || role === 'cashier';
}

/**
 * Require specific role
 */
function requireRole(role) {
    if (!requireAuth()) return false;

    if (window.currentUserData.role !== role) {
        utils.showError(`Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} role required.`);
        return false;
    }

    return true;
}

/**
 * Require admin role
 */
function requireAdmin() {
    if (!requireAuth()) return false;

    if (!isAdmin()) {
        utils.showError('Access denied. Administrator privileges required.');
        return false;
    }

    return true;
}

/**
 * Check permission for action
 */
function hasPermission(action) {
    if (!requireAuth()) return false;

    const role = window.currentUserData.role;

    // Define permissions matrix
    const permissions = {
        'delete_repair': ['admin'],
        'manage_users': ['admin'],
        'approve_modifications': ['admin'],
        'view_logs': ['admin'],
        'create_repair': ['admin', 'manager', 'cashier', 'technician'],
        'accept_repair': ['admin', 'manager', 'technician'],
        'set_pricing': ['admin', 'manager', 'technician'],
        'record_payment': ['admin', 'manager', 'cashier', 'technician'],
        'verify_payment': ['admin', 'cashier'],
        'release_device': ['admin', 'manager', 'cashier'],
        'manage_inventory': ['admin', 'manager'],
        'view_analytics': ['admin', 'manager']
    };

    const allowedRoles = permissions[action] || [];
    return allowedRoles.includes(role);
}

/**
 * Initialize role-based UI (hide/disable elements based on permissions)
 */
function initRoleBasedUI() {
    if (!window.currentUserData) return;

    const role = window.currentUserData.role;

    // Hide admin-only elements for non-admins
    document.querySelectorAll('[data-admin-only]').forEach(element => {
        element.style.display = isAdmin() ? '' : 'none';
    });

    // Hide manager-only elements for non-managers
    document.querySelectorAll('[data-manager-only]').forEach(element => {
        element.style.display = isManagerOrHigher() ? '' : 'none';
    });

    // Disable elements that require specific permissions
    document.querySelectorAll('[data-requires-permission]').forEach(element => {
        const requiredPermission = element.getAttribute('data-requires-permission');
        if (!hasPermission(requiredPermission)) {
            element.disabled = true;
            element.style.opacity = '0.5';
            element.style.cursor = 'not-allowed';
            element.title = 'Insufficient permissions';
        }
    });
}

/**
 * Force HTTPS in production
 */
function enforceHTTPS() {
    if (location.protocol !== 'https:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1') {
        console.log('🔒 Redirecting to HTTPS...');
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
}

// Enforce HTTPS on page load
enforceHTTPS();

// Export to global scope
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.handleAvatarUpload = handleAvatarUpload;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.requireRole = requireRole;
window.isAdmin = isAdmin;
window.isManagerOrHigher = isManagerOrHigher;
window.isCashierOrHigher = isCashierOrHigher;
window.hasPermission = hasPermission;
window.initRoleBasedUI = initRoleBasedUI;
