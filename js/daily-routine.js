// ===== PERFORMANCE DASHBOARD MODULE =====
// Drive Framework Implementation: Autonomy, Mastery, Purpose

/**
 * Tech Performance Dashboard
 * - Autonomy: FIFO job selection with pause/reassign
 * - Mastery: Skill tracking with auto-disassembly detection
 * - Purpose: Team contribution and impact metrics
 */

// Global state
window.skillCategories = [];
window.disassemblyTriggers = [];
window.shopAverages = null;
window.currentPerformanceTab = 'choose-work';

// ===== FIREBASE OPERATIONS =====

// Flags to prevent repeated initialization attempts
let skillCategoriesInitAttempted = false;
let disassemblyTriggersInitAttempted = false;

/**
 * Initialize performance dashboard listeners
 */
function initializePerformanceListeners() {
    const db = firebase.database();
    
    // Listen to skill categories
    db.ref('systemSettings/skillCategories').on('value', (snapshot) => {
        const categories = snapshot.val();
        if (categories && Array.isArray(categories)) {
            window.skillCategories = categories.filter(c => c && c.active !== false);
            skillCategoriesInitAttempted = false; // Reset flag on successful read
        } else if (!categories && !skillCategoriesInitAttempted) {
            // Initialize with defaults if doesn't exist (attempt once)
            skillCategoriesInitAttempted = true;
            initializeDefaultSkillCategories();
        }
        
        if (window.currentTabRefresh) {
            setTimeout(() => window.currentTabRefresh(), 400);
        }
    });
    
    // Listen to disassembly triggers
    db.ref('systemSettings/disassemblyTriggers').on('value', (snapshot) => {
        const triggers = snapshot.val();
        if (triggers && Array.isArray(triggers)) {
            window.disassemblyTriggers = triggers;
            disassemblyTriggersInitAttempted = false; // Reset flag on successful read
        } else if (!triggers && !disassemblyTriggersInitAttempted) {
            // Initialize with defaults (attempt once)
            disassemblyTriggersInitAttempted = true;
            initializeDefaultDisassemblyTriggers();
        }
    });
}

/**
 * Initialize default skill categories
 */
async function initializeDefaultSkillCategories() {
    const defaultCategories = [
        { id: 'screen', name: 'Screen Replacement', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'battery', name: 'Battery Replacement', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'charging', name: 'Charging Port', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'software', name: 'Software/FRP', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'ic', name: 'IC Repair', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'water', name: 'Water Damage', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'jtag', name: 'JTAG/ISP', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'disassembly-android', name: 'Disassembly - Android', novice: 10, proficient: 50, expert: 100, active: true },
        { id: 'disassembly-ios', name: 'Disassembly - iOS', novice: 10, proficient: 50, expert: 100, active: true }
    ];
    
    try {
        await firebase.database().ref('systemSettings/skillCategories').set(defaultCategories);
        window.skillCategories = defaultCategories;
        console.log('✅ Initialized default skill categories');
    } catch (error) {
        // Silently handle permission errors - use local defaults
        if (error.code === 'PERMISSION_DENIED') {
            window.skillCategories = defaultCategories;
        } else {
            console.error('Error initializing skill categories:', error);
        }
    }
}

/**
 * Initialize default disassembly triggers
 */
async function initializeDefaultDisassemblyTriggers() {
    const defaultTriggers = ['Battery', 'Screen', 'JTAG', 'ISP', 'Chip Off', 'Water Damage'];
    
    try {
        await firebase.database().ref('systemSettings/disassemblyTriggers').set(defaultTriggers);
        window.disassemblyTriggers = defaultTriggers;
        console.log('✅ Initialized default disassembly triggers');
    } catch (error) {
        // Silently handle permission errors - use local defaults
        if (error.code === 'PERMISSION_DENIED') {
            window.disassemblyTriggers = defaultTriggers;
        } else {
            console.error('Error initializing disassembly triggers:', error);
        }
    }
}

// ===== MAIN PERFORMANCE DASHBOARD =====

/**
 * Build performance dashboard (technician-only)
 */
function buildPerformanceTab(container) {
    if (!container) return;
    
    // Check if user is technician
    if (window.currentUserData?.role !== 'technician') {
        container.innerHTML = `
            <div style="padding:40px;text-align:center;">
                <p style="font-size:18px;color:#666;">Performance Dashboard is for technicians only.</p>
            </div>
        `;
        return;
    }
    
    // Set refresh callback
    window.currentTabRefresh = () => buildPerformanceTab(container);
    
    const currentTab = window.currentPerformanceTab || 'choose-work';
    
    container.innerHTML = `
        <div class="performance-dashboard">
            <!-- Tab Navigation -->
            <div class="performance-tabs">
                <button class="perf-tab ${currentTab === 'choose-work' ? 'active' : ''}" 
                        onclick="switchPerformanceTab('choose-work')">
                    📋 Choose Work
                </button>
                <button class="perf-tab ${currentTab === 'my-skills' ? 'active' : ''}" 
                        onclick="switchPerformanceTab('my-skills')">
                    🎯 My Skills
                </button>
                <button class="perf-tab ${currentTab === 'my-impact' ? 'active' : ''}" 
                        onclick="switchPerformanceTab('my-impact')">
                    💫 My Impact
                </button>
            </div>
            
            <!-- Tab Content -->
            <div class="performance-content" id="performanceContent">
                ${getPerformanceTabContent(currentTab)}
            </div>
        </div>
    `;
}

/**
 * Switch performance tab
 */
function switchPerformanceTab(tabName) {
    window.currentPerformanceTab = tabName;
    const contentDiv = document.getElementById('performanceContent');
    if (contentDiv) {
        contentDiv.innerHTML = getPerformanceTabContent(tabName);
    }
    
    // Update active tab styling
    document.querySelectorAll('.perf-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tabName === 'choose-work' ? 'Choose Work' : 
                                      tabName === 'my-skills' ? 'My Skills' : 'My Impact')) {
            btn.classList.add('active');
        }
    });
}

/**
 * Get content for specific tab
 */
function getPerformanceTabContent(tabName) {
    switch (tabName) {
        case 'choose-work':
            return buildChooseWorkContent();
        case 'my-skills':
            return buildMySkillsContent();
        case 'my-impact':
            return buildMyImpactContent();
        default:
            return '<p>Loading...</p>';
    }
}

// ===== AUTONOMY: CHOOSE WORK TAB =====

/**
 * Build Choose Work tab (FIFO job selector)
 */
function buildChooseWorkContent() {
    if (!window.allRepairs) {
        return '<p style="padding:20px;">Loading repairs...</p>';
    }
    
    const userId = window.currentUser.uid;
    
    // Get pending repairs (FIFO - oldest first)
    const pendingRepairs = window.allRepairs
        .filter(r => !r.deleted && r.status === 'Pending' && !r.acceptedBy)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Get paused repairs (all techs can see status)
    const pausedRepairs = window.allRepairs
        .filter(r => !r.deleted && r.status === 'Paused')
        .sort((a, b) => new Date(b.pausedAt) - new Date(a.pausedAt));
    
    // Get my active jobs
    const myActiveJobs = window.allRepairs
        .filter(r => !r.deleted && r.status === 'In Progress' && r.acceptedBy === userId)
        .sort((a, b) => new Date(a.acceptedAt) - new Date(b.acceptedAt));
    
    let html = '<div class="choose-work-container">';
    
    // My Active Jobs Section
    html += '<div class="work-section">';
    html += '<h3 style="margin:0 0 15px 0;color:#333;">🔧 My Active Jobs</h3>';
    
    if (myActiveJobs.length === 0) {
        html += '<p style="color:#999;font-style:italic;">No active jobs. Accept a repair below to get started!</p>';
    } else {
        myActiveJobs.forEach(repair => {
            const daysInProgress = Math.floor((Date.now() - new Date(repair.acceptedAt)) / (1000 * 60 * 60 * 24));
            html += `
                <div class="job-card active-job">
                    <div class="job-header">
                        <strong>${repair.customerName}</strong>
                        <span class="job-age">${daysInProgress} day${daysInProgress !== 1 ? 's' : ''} in progress</span>
                    </div>
                    <div class="job-details">
                        <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
                        <p><strong>Problem:</strong> ${repair.problemType}</p>
                    </div>
                    <div class="job-actions">
                        <button class="btn-secondary" onclick="pauseRepair('${repair.id}')">⏸️ Pause</button>
                        <button class="btn-primary" onclick="window.viewRepairDetails && window.viewRepairDetails('${repair.id}')">View Details</button>
                    </div>
                </div>
            `;
        });
    }
    html += '</div>';
    
    // Paused Jobs Section (visible to all)
    if (pausedRepairs.length > 0) {
        html += '<div class="work-section">';
        html += '<h3 style="margin:20px 0 15px 0;color:#f59e0b;">⏸️ Paused Repairs</h3>';
        
        pausedRepairs.forEach(repair => {
            const daysPaused = Math.floor((Date.now() - new Date(repair.pausedAt)) / (1000 * 60 * 60 * 24));
            const isMyJob = repair.pausedBy === userId;
            
            html += `
                <div class="job-card paused-job">
                    <div class="job-header">
                        <strong>${repair.customerName}</strong>
                        <span class="job-age">Paused ${daysPaused} day${daysPaused !== 1 ? 's' : ''} ago</span>
                    </div>
                    <div class="job-details">
                        <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
                        <p><strong>Problem:</strong> ${repair.problemType}</p>
                        <p><strong>Paused by:</strong> ${repair.pausedByName || 'Unknown'}</p>
                        <p style="color:#666;font-style:italic;">"${repair.pauseReason || 'No reason provided'}"</p>
                    </div>
                    ${isMyJob ? `
                        <div class="job-actions">
                            <button class="btn-primary" onclick="resumeRepair('${repair.id}')">▶️ Resume</button>
                            <button class="btn-secondary" onclick="showReassignModal('${repair.id}')">↪️ Reassign</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Pending Jobs Section (FIFO Queue)
    html += '<div class="work-section">';
    html += '<h3 style="margin:20px 0 15px 0;color:#10b981;">📋 Available Repairs (Oldest First)</h3>';
    
    if (pendingRepairs.length === 0) {
        html += '<p style="color:#999;font-style:italic;">No pending repairs at the moment.</p>';
    } else {
        pendingRepairs.slice(0, 10).forEach((repair, index) => {
            const daysWaiting = Math.floor((Date.now() - new Date(repair.createdAt)) / (1000 * 60 * 60 * 24));
            const isUrgent = daysWaiting >= 3;
            
            html += `
                <div class="job-card pending-job ${isUrgent ? 'urgent' : ''}">
                    <div class="job-header">
                        <strong>${repair.customerName}</strong>
                        <span class="job-age ${isUrgent ? 'urgent' : ''}">
                            Waiting: ${daysWaiting} day${daysWaiting !== 1 ? 's' : ''}
                            ${isUrgent ? ' ⚠️' : ''}
                        </span>
                    </div>
                    <div class="job-details">
                        <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
                        <p><strong>Problem:</strong> ${repair.problemType}</p>
                        <p><strong>Received:</strong> ${utils.formatDate(repair.createdAt)}</p>
                    </div>
                    <div class="job-actions">
                        <button class="btn-success" onclick="window.acceptRepair && window.acceptRepair('${repair.id}')">
                            ✅ Accept This Job
                        </button>
                    </div>
                </div>
            `;
        });
        
        if (pendingRepairs.length > 10) {
            html += `<p style="text-align:center;color:#666;margin-top:15px;">
                Showing 10 of ${pendingRepairs.length} pending repairs. Accept jobs to see more.
            </p>`;
        }
    }
    html += '</div>';
    
    html += '</div>';
    return html;
}

/**
 * Pause repair (requires reason)
 */
async function pauseRepair(repairId) {
    const reason = prompt('Why are you pausing this repair? (minimum 10 characters)');
    
    if (!reason || reason.trim().length < 10) {
        alert('Please provide a reason (at least 10 characters)');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const db = firebase.database();
        await db.ref(`repairs/${repairId}`).update({
            status: 'Paused',
            pausedAt: new Date().toISOString(),
            pausedBy: window.currentUser.uid,
            pausedByName: window.currentUserData.displayName,
            pauseReason: reason.trim(),
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        utils.showToast('⏸️ Repair paused', 'success');
        
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        alert('Error pausing repair: ' + error.message);
        console.error('Error pausing repair:', error);
    }
}

/**
 * Resume repair
 */
async function resumeRepair(repairId) {
    try {
        utils.showLoading(true);
        
        const db = firebase.database();
        await db.ref(`repairs/${repairId}`).update({
            status: 'In Progress',
            resumedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        utils.showToast('▶️ Repair resumed', 'success');
        
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        alert('Error resuming repair: ' + error.message);
        console.error('Error resuming repair:', error);
    }
}

/**
 * Show reassign modal
 */
function showReassignModal(repairId) {
    if (!window.allUsers) {
        alert('User list not loaded');
        return;
    }
    
    // Get all technicians
    const technicians = Object.keys(window.allUsers)
        .filter(uid => window.allUsers[uid].role === 'technician' && uid !== window.currentUser.uid)
        .map(uid => ({ uid, name: window.allUsers[uid].displayName }));
    
    if (technicians.length === 0) {
        alert('No other technicians available');
        return;
    }
    
    const techOptions = technicians.map(t => `<option value="${t.uid}">${t.name}</option>`).join('');
    
    const modal = document.getElementById('globalModal');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <h2 style="margin:0 0 20px 0;">Reassign Repair</h2>
            <form id="reassignForm">
                <div style="margin-bottom:15px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Assign to:</label>
                    <select id="newTechSelect" required style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
                        <option value="">Select technician...</option>
                        ${techOptions}
                    </select>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:5px;font-weight:600;">Reason for reassignment:</label>
                    <textarea id="reassignReason" required minlength="10" rows="3" 
                              style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;"
                              placeholder="Explain why you're reassigning this repair..."></textarea>
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button type="button" onclick="closeGlobalModal()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Reassign</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    document.getElementById('reassignForm').onsubmit = async (e) => {
        e.preventDefault();
        const newTechId = document.getElementById('newTechSelect').value;
        const reason = document.getElementById('reassignReason').value.trim();
        
        if (!newTechId || reason.length < 10) {
            alert('Please select a technician and provide a reason (at least 10 characters)');
            return;
        }
        
        await reassignRepair(repairId, newTechId, reason);
    };
}

/**
 * Reassign repair to another tech
 */
async function reassignRepair(repairId, newTechId, reason) {
    try {
        utils.showLoading(true);
        
        const newTech = window.allUsers[newTechId];
        if (!newTech) {
            throw new Error('New technician not found');
        }
        
        const db = firebase.database();
        await db.ref(`repairs/${repairId}`).update({
            acceptedBy: newTechId,
            acceptedByName: newTech.displayName,
            reassignedFrom: window.currentUser.uid,
            reassignedFromName: window.currentUserData.displayName,
            reassignReason: reason,
            reassignedAt: new Date().toISOString(),
            status: 'In Progress',
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Send notification to new tech
        if (window.createNotification) {
            await window.createNotification(newTechId, `You were assigned repair #${repairId}`, 'repair');
        }
        
        utils.showLoading(false);
        closeGlobalModal();
        utils.showToast('↪️ Repair reassigned', 'success');
        
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        alert('Error reassigning repair: ' + error.message);
        console.error('Error reassigning repair:', error);
    }
}

// ===== MASTERY: MY SKILLS TAB =====

/**
 * Build My Skills tab
 */
function buildMySkillsContent() {
    if (!window.allRepairs || !window.skillCategories || window.skillCategories.length === 0) {
        return '<p style="padding:20px;">Loading skills data...</p>';
    }
    
    const userId = window.currentUser.uid;
    const skillProgress = calculateSkillProgress(userId);
    
    // Separate active and unexplored skills
    const activeSkills = [];
    const unexploredSkills = [];
    
    skillProgress.forEach(skill => {
        if (skill.completions > 0) {
            activeSkills.push(skill);
        } else {
            unexploredSkills.push(skill);
        }
    });
    
    let html = '<div class="skills-container">';
    
    // Active Skills Section (expanded)
    html += '<div class="skills-section">';
    html += `<h3 style="margin:0 0 15px 0;color:#333;">🔥 Active Skills (${activeSkills.length})</h3>`;
    
    if (activeSkills.length === 0) {
        html += '<p style="color:#999;font-style:italic;">Complete your first repair to track your skills!</p>';
    } else {
        activeSkills.forEach(skill => {
            html += buildSkillCard(skill);
        });
    }
    html += '</div>';
    
    // Unexplored Skills Section (collapsed by default)
    if (unexploredSkills.length > 0) {
        html += '<div class="skills-section" style="margin-top:30px;">';
        html += `
            <h3 style="margin:0 0 15px 0;color:#666;cursor:pointer;" onclick="toggleUnexploredSkills()">
                📚 Unexplored Skills (${unexploredSkills.length}) <span id="unexploredToggle">▼</span>
            </h3>
        `;
        html += '<div id="unexploredSkillsContent" style="display:none;">';
        unexploredSkills.forEach(skill => {
            html += buildSkillCard(skill);
        });
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Build individual skill card
 */
function buildSkillCard(skill) {
    const levelIcon = skill.level === 'Expert' ? '🥇' : skill.level === 'Proficient' ? '🥈' : '🥉';
    const levelColor = skill.level === 'Expert' ? '#10b981' : skill.level === 'Proficient' ? '#3b82f6' : '#f59e0b';
    
    const nextThreshold = skill.level === 'Novice' ? skill.thresholds.proficient : 
                         skill.level === 'Proficient' ? skill.thresholds.expert : null;
    
    const progressPercent = nextThreshold ? Math.min(100, (skill.completions / nextThreshold) * 100) : 100;
    
    let html = `
        <div class="skill-card">
            <div class="skill-header">
                <div>
                    <strong>${skill.name}</strong>
                    <div style="margin-top:5px;">
                        <span class="skill-badge" style="background:${levelColor};">${levelIcon} ${skill.level}</span>
                        <span style="margin-left:10px;color:#666;">
                            ${skill.completions} repair${skill.completions !== 1 ? 's' : ''} completed
                        </span>
                    </div>
                </div>
            </div>
            <div class="skill-progress">
                <div class="progress-bar" style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
                    <div style="width:${progressPercent}%;height:100%;background:${levelColor};transition:width 0.3s;"></div>
                </div>
                ${nextThreshold ? `
                    <p style="margin:5px 0 0 0;font-size:13px;color:#666;">
                        ${skill.completions}/${nextThreshold} to ${skill.level === 'Novice' ? 'Proficient' : 'Expert'}
                    </p>
                ` : `
                    <p style="margin:5px 0 0 0;font-size:13px;color:#10b981;">✨ Mastered!</p>
                `}
            </div>
    `;
    
    // Add time comparison if available
    if (skill.avgTime > 0) {
        const shopAvg = skill.shopAvgTime > 0 ? skill.shopAvgTime : null;
        const comparison = shopAvg ? 
            (skill.avgTime < shopAvg ? `⚡ ${Math.round(((shopAvg - skill.avgTime) / shopAvg) * 100)}% faster than shop avg` :
             skill.avgTime > shopAvg ? `🐌 ${Math.round(((skill.avgTime - shopAvg) / shopAvg) * 100)}% slower than shop avg` :
             '⚖️ At shop average') : '';
        
        html += `
            <div class="skill-time" style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:13px;color:#666;">
                    <strong>Your avg time:</strong> ${skill.avgTime.toFixed(1)} hrs
                    ${shopAvg ? `<span style="margin-left:10px;">Shop avg: ${shopAvg.toFixed(1)} hrs</span>` : ''}
                </p>
                ${comparison ? `<p style="margin:5px 0 0 0;font-size:12px;color:#666;">${comparison}</p>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * Calculate skill progress for a technician
 */
function calculateSkillProgress(userId) {
    const skills = [];
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Calculate shop averages if not cached or expired
    if (!window.shopAverages || !window.shopAverages.calculatedAt || 
        (now - window.shopAverages.calculatedAt) > (24 * 60 * 60 * 1000)) {
        window.shopAverages = calculateShopAverages();
    }
    
    window.skillCategories.forEach(category => {
        const repairs = window.allRepairs.filter(r => 
            !r.deleted && 
            r.status === 'Claimed' && 
            r.acceptedBy === userId &&
            r.problemType === category.name
        );
        
        const completions = repairs.length;
        
        // Determine level
        let level = 'Novice';
        if (completions >= category.expert) {
            level = 'Expert';
        } else if (completions >= category.proficient) {
            level = 'Proficient';
        }
        
        // Calculate average time
        let avgTime = 0;
        const repairsWithTime = repairs.filter(r => r.acceptedAt && r.completedAt);
        if (repairsWithTime.length > 0) {
            const totalHours = repairsWithTime.reduce((sum, r) => {
                const hours = (new Date(r.completedAt) - new Date(r.acceptedAt)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);
            avgTime = totalHours / repairsWithTime.length;
        }
        
        // Check if disassembly skill
        const isDisassembly = category.name.includes('Disassembly');
        let actualCompletions = completions;
        
        if (isDisassembly) {
            // Count disassembly repairs
            actualCompletions = countDisassemblyRepairs(userId, category.name.includes('iOS'));
        }
        
        skills.push({
            name: category.name,
            completions: actualCompletions,
            level: level,
            thresholds: {
                novice: category.novice,
                proficient: category.proficient,
                expert: category.expert
            },
            avgTime: avgTime,
            shopAvgTime: window.shopAverages ? window.shopAverages[category.name] || 0 : 0
        });
    });
    
    return skills.sort((a, b) => b.completions - a.completions);
}

/**
 * Count disassembly repairs (auto-detected)
 */
function countDisassemblyRepairs(userId, isIOS) {
    if (!window.disassemblyTriggers || window.disassemblyTriggers.length === 0) {
        return 0;
    }
    
    const repairs = window.allRepairs.filter(r => 
        !r.deleted && 
        r.status === 'Claimed' && 
        r.acceptedBy === userId
    );
    
    let count = 0;
    repairs.forEach(repair => {
        // Check if problem type contains any disassembly trigger (case-insensitive)
        const problemLower = (repair.problemType || '').toLowerCase();
        const needsDisassembly = window.disassemblyTriggers.some(trigger => 
            problemLower.includes(trigger.toLowerCase())
        );
        
        if (!needsDisassembly) return;
        
        // Determine device type
        const brand = (repair.brand || '').toLowerCase();
        const deviceIsIOS = brand.includes('iphone') || brand.includes('ipad');
        
        if (deviceIsIOS === isIOS) {
            count++;
        }
    });
    
    return count;
}

/**
 * Calculate shop averages for all skill categories
 */
function calculateShopAverages() {
    const averages = {
        calculatedAt: Date.now()
    };
    
    window.skillCategories.forEach(category => {
        const repairs = window.allRepairs.filter(r => 
            !r.deleted && 
            r.status === 'Claimed' && 
            r.problemType === category.name &&
            r.acceptedAt &&
            r.completedAt
        );
        
        if (repairs.length > 0) {
            const totalHours = repairs.reduce((sum, r) => {
                const hours = (new Date(r.completedAt) - new Date(r.acceptedAt)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);
            averages[category.name] = totalHours / repairs.length;
        }
    });
    
    return averages;
}

/**
 * Toggle unexplored skills visibility
 */
function toggleUnexploredSkills() {
    const content = document.getElementById('unexploredSkillsContent');
    const toggle = document.getElementById('unexploredToggle');
    if (content && toggle) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▲';
        } else {
            content.style.display = 'none';
            toggle.textContent = '▼';
        }
    }
}

// ===== PURPOSE: MY IMPACT TAB =====

/**
 * Build My Impact tab
 */
function buildMyImpactContent() {
    if (!window.allRepairs) {
        return '<p style="padding:20px;">Loading impact data...</p>';
    }
    
    const userId = window.currentUser.uid;
    const currentPeriod = window.impactPeriod || 'week';
    
    const impact = calculateImpactMetrics(userId, currentPeriod);
    
    let html = '<div class="impact-container">';
    
    // Period Toggle
    html += `
        <div class="period-toggle" style="margin-bottom:20px;text-align:center;">
            <button class="period-btn ${currentPeriod === 'today' ? 'active' : ''}" 
                    onclick="switchImpactPeriod('today')">Today</button>
            <button class="period-btn ${currentPeriod === 'week' ? 'active' : ''}" 
                    onclick="switchImpactPeriod('week')">This Week</button>
            <button class="period-btn ${currentPeriod === 'month' ? 'active' : ''}" 
                    onclick="switchImpactPeriod('month')">This Month</button>
        </div>
    `;
    
    // Impact Cards
    html += '<div class="impact-cards">';
    
    // Customers Helped
    html += `
        <div class="impact-card">
            <div class="impact-icon">👥</div>
            <div class="impact-value">${impact.customersHelped}</div>
            <div class="impact-label">Customers Helped</div>
        </div>
    `;
    
    // Revenue Generated
    html += `
        <div class="impact-card">
            <div class="impact-icon">💰</div>
            <div class="impact-value">₱${impact.revenue.toLocaleString('en-PH')}</div>
            <div class="impact-label">Revenue Generated</div>
        </div>
    `;
    
    // Team Contribution
    const teamPercent = impact.teamPercent > 0 ? impact.teamPercent.toFixed(1) : '0';
    html += `
        <div class="impact-card">
            <div class="impact-icon">🎯</div>
            <div class="impact-value">${teamPercent}%</div>
            <div class="impact-label">Team Contribution</div>
            ${impact.totalShopRepairs > 0 ? `
                <div style="margin-top:10px;font-size:12px;color:#666;">
                    ${impact.myRepairs} of ${impact.totalShopRepairs} shop repairs
                </div>
            ` : ''}
        </div>
    `;
    
    html += '</div>';
    
    // Summary Message
    const periodText = currentPeriod === 'today' ? 'today' : 
                      currentPeriod === 'week' ? 'this week' : 'this month';
    
    html += `
        <div style="margin-top:30px;padding:20px;background:#f0fdf4;border-radius:12px;text-align:center;">
            <p style="margin:0;font-size:16px;color:#059669;line-height:1.6;">
                ${impact.customersHelped > 0 ? `
                    <strong>You've helped ${impact.customersHelped} customer${impact.customersHelped !== 1 ? 's' : ''} ${periodText},
                    generated ₱${impact.revenue.toLocaleString('en-PH')} in revenue,
                    and completed ${teamPercent}% of shop repairs.</strong>
                ` : `
                    No completed repairs ${periodText} yet. Keep working to make an impact!
                `}
            </p>
        </div>
    `;
    
    html += '</div>';
    return html;
}

/**
 * Calculate impact metrics for a technician
 */
function calculateImpactMetrics(userId, period) {
    const now = new Date();
    let startDate;
    
    if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
    } else { // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const startTime = startDate.getTime();
    const endTime = now.getTime();
    
    // My repairs
    const myRepairs = window.allRepairs.filter(r => 
        !r.deleted && 
        r.status === 'Claimed' && 
        r.acceptedBy === userId &&
        r.claimedAt &&
        new Date(r.claimedAt).getTime() >= startTime &&
        new Date(r.claimedAt).getTime() <= endTime
    );
    
    // Total shop repairs
    const totalShopRepairs = window.allRepairs.filter(r => 
        !r.deleted && 
        r.status === 'Claimed' &&
        r.claimedAt &&
        new Date(r.claimedAt).getTime() >= startTime &&
        new Date(r.claimedAt).getTime() <= endTime
    ).length;
    
    // Revenue calculation
    let revenue = 0;
    myRepairs.forEach(repair => {
        const verifiedPayments = (repair.payments || [])
            .filter(p => p.verified && !p.refunded)
            .reduce((sum, p) => sum + p.amount, 0);
        revenue += verifiedPayments;
    });
    
    const teamPercent = totalShopRepairs > 0 ? (myRepairs.length / totalShopRepairs) * 100 : 0;
    
    return {
        customersHelped: myRepairs.length,
        revenue: revenue,
        teamPercent: teamPercent,
        myRepairs: myRepairs.length,
        totalShopRepairs: totalShopRepairs
    };
}

/**
 * Switch impact period
 */
function switchImpactPeriod(period) {
    window.impactPeriod = period;
    const contentDiv = document.getElementById('performanceContent');
    if (contentDiv) {
        contentDiv.innerHTML = buildMyImpactContent();
    }
}

// ===== ADMIN TOOLS =====

/**
 * Build Paused Jobs Report (Admin)
 */
function buildPausedJobsReport() {
    if (!window.allRepairs) {
        return '<p>Loading repairs...</p>';
    }
    
    const pausedRepairs = window.allRepairs
        .filter(r => !r.deleted && r.status === 'Paused')
        .sort((a, b) => new Date(a.pausedAt) - new Date(b.pausedAt));
    
    if (pausedRepairs.length === 0) {
        return '<p style="text-align:center;color:#666;padding:40px;">No paused repairs</p>';
    }
    
    let html = `
        <div style="padding:20px;">
            <h3 style="margin:0 0 20px 0;">⏸️ Paused Repairs Report</h3>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f3f4f6;">
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Customer</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Device</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Paused By</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Reason</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Days</th>
                        <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">Action</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    pausedRepairs.forEach(repair => {
        const daysPaused = Math.floor((Date.now() - new Date(repair.pausedAt)) / (1000 * 60 * 60 * 24));
        html += `
            <tr>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${repair.customerName}</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${repair.brand} ${repair.model}</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${repair.pausedByName || 'Unknown'}</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-style:italic;">"${repair.pauseReason || 'No reason'}"</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${daysPaused}</td>
                <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
                    <button class="btn-sm" onclick="window.viewRepairDetails && window.viewRepairDetails('${repair.id}')">View</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

/**
 * Set device type on repair (Admin correction)
 */
async function setRepairDeviceType(repairId, deviceType) {
    if (window.currentUserData?.role !== 'admin') {
        alert('Only admins can set device type');
        return;
    }
    
    if (!['Android', 'iOS'].includes(deviceType)) {
        alert('Invalid device type');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const db = firebase.database();
        await db.ref(`repairs/${repairId}`).update({
            deviceType: deviceType,
            deviceTypeCorrectedBy: window.currentUserData.displayName,
            deviceTypeCorrectedAt: new Date().toISOString()
        });
        
        utils.showLoading(false);
        utils.showToast(`✅ Device type set to ${deviceType}`, 'success');
    } catch (error) {
        utils.showLoading(false);
        alert('Error setting device type: ' + error.message);
        console.error('Error setting device type:', error);
    }
}

/**
 * Export Skills Report (CSV)
 */
function exportSkillsReport() {
    if (!window.allUsers || !window.skillCategories) {
        alert('Data not loaded');
        return;
    }
    
    const technicians = Object.keys(window.allUsers)
        .filter(uid => window.allUsers[uid].role === 'technician');
    
    const csvData = [];
    csvData.push(['Tech Name', 'Skill Category', 'Total Completions', 'Level', 'Avg Time (hrs)', 'Shop Avg Time (hrs)']);
    
    technicians.forEach(techId => {
        const techName = window.allUsers[techId].displayName;
        const skills = calculateSkillProgress(techId);
        
        skills.forEach(skill => {
            csvData.push([
                techName,
                skill.name,
                skill.completions,
                skill.level,
                skill.avgTime.toFixed(2),
                skill.shopAvgTime.toFixed(2)
            ]);
        });
    });
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skills_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    utils.showToast('📊 Skills report exported', 'success');
}

// ===== UTILITY FUNCTIONS =====

/**
 * Show performance modal
 */
function showPerformanceModal() {
    const modal = document.getElementById('performanceModal');
    const content = document.getElementById('performanceContent');
    
    if (!modal || !content) {
        console.error('Performance modal elements not found');
        return;
    }
    
    // Build the performance dashboard
    buildPerformanceTab(content);
    
    // Show modal
    modal.style.display = 'flex';
}

/**
 * Close performance modal
 */
function closePerformanceModal() {
    const modal = document.getElementById('performanceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Close global modal
 */
function closeGlobalModal() {
    const modal = document.getElementById('globalModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = '';
    }
}

// ===== EXPORT FUNCTIONS TO WINDOW =====

window.initializePerformanceListeners = initializePerformanceListeners;
window.showPerformanceModal = showPerformanceModal;
window.closePerformanceModal = closePerformanceModal;
window.buildPerformanceTab = buildPerformanceTab;
window.switchPerformanceTab = switchPerformanceTab;
window.pauseRepair = pauseRepair;
window.resumeRepair = resumeRepair;
window.showReassignModal = showReassignModal;
window.reassignRepair = reassignRepair;
window.calculateSkillProgress = calculateSkillProgress;
window.toggleUnexploredSkills = toggleUnexploredSkills;
window.switchImpactPeriod = switchImpactPeriod;
window.buildPausedJobsReport = buildPausedJobsReport;
window.setRepairDeviceType = setRepairDeviceType;
window.exportSkillsReport = exportSkillsReport;

console.log('✅ Performance Dashboard module loaded');
