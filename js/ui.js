// ===== UI MODULE =====

let availableTabs = [];
let activeTab = '';

/**
 * Build tabs based on user role
 */
function buildTabs() {
    console.log('🔖 Building tabs...');
    const role = window.currentUserData.role;
    availableTabs = [];
    
    // ROLE-SPECIFIC PAGES - Most used functions FIRST
    if (role === 'cashier') {
        // Cashier workflow: Receive → Check status → Process payments
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'received', label: '📥 Received Devices', build: buildReceivedDevicesPage });
        availableTabs.push({ id: 'inprogress', label: '🔧 In Progress', build: buildInProgressPage });
        availableTabs.push({ id: 'forrelease', label: '📦 For Release', build: buildForReleasePage });
        availableTabs.push({ id: 'unpaid', label: '💳 Unpaid', build: buildUnpaidTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingPaymentsTab });
        availableTabs.push({ id: 'paid', label: '✅ Paid', build: buildPaidTab });
        availableTabs.push({ id: 'rto', label: '↩️ RTO Devices', build: buildRTODevicesTab });
        availableTabs.push({ id: 'claimed', label: '✅ Claimed Units', build: buildClaimedUnitsPage });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    else if (role === 'admin' || role === 'manager') {
        // Admin/Manager workflow: Receive → Monitor → Manage
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'received', label: '📥 Received Devices', build: buildReceivedDevicesPage });
        availableTabs.push({ id: 'inprogress', label: '🔧 In Progress', build: buildInProgressPage });
        availableTabs.push({ id: 'forrelease', label: '📦 For Release', build: buildForReleasePage });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'inventory', label: '📦 Inventory', build: buildInventoryTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingTab });
        availableTabs.push({ id: 'cash', label: '💵 Cash Count', build: buildCashCountTab });
        availableTabs.push({ id: 'rto', label: '↩️ RTO Devices', build: buildRTODevicesTab });
        availableTabs.push({ id: 'claimed', label: '✅ Claimed Units', build: buildClaimedUnitsPage });
        availableTabs.push({ id: 'suppliers', label: '📊 Supplier Report', build: buildSuppliersTab });
        if (role === 'manager') {
            availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
        }
    }
    else if (role === 'technician') {
        // Technician workflow: Receive → My Jobs → Use parts
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'my', label: '🔧 My Jobs', build: buildMyRepairsTab });
        availableTabs.push({ id: 'received', label: '📥 Received Devices', build: buildReceivedDevicesPage });
        availableTabs.push({ id: 'inprogress', label: '🔧 In Progress', build: buildInProgressPage });
        availableTabs.push({ id: 'forrelease', label: '📦 For Release', build: buildForReleasePage });
        availableTabs.push({ id: 'inventory', label: '📦 Inventory', build: buildInventoryTab });
        availableTabs.push({ id: 'rto', label: '↩️ RTO Devices', build: buildRTODevicesTab });
        availableTabs.push({ id: 'claimed', label: '✅ Claimed Units', build: buildClaimedUnitsPage });
        availableTabs.push({ id: 'remittance', label: '💸 Daily Remittance', build: buildDailyRemittanceTab });
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    
    // Cashier/Admin/Manager get remittance verification tab
    if (role === 'admin' || role === 'manager' || role === 'cashier') {
        availableTabs.push({ id: 'verify-remittance', label: '✅ Verify Remittance', build: buildRemittanceVerificationTab });
        availableTabs.push({ id: 'tech-logs', label: '📊 Technician Logs', build: buildTechnicianLogsTab });
    }
    
    // Admin gets modification requests approval page
    if (role === 'admin') {
        availableTabs.push({ id: 'mod-requests', label: '🔔 Mod Requests', build: buildModificationRequestsTab });
    }
    
    if (role === 'admin') {
        availableTabs.push({ id: 'users', label: '👥 Users', build: buildUsersTab });
    }
    
    if (role === 'admin') {
        availableTabs.push({ id: 'admin-tools', label: '🔧 Admin Tools', build: buildAdminToolsTab });
    }
    
    if (role === 'admin') {
        availableTabs.push({ id: 'admin-logs', label: '📋 Activity Logs', build: buildActivityLogsTab });
    }
    
    console.log('✅ Tabs configured:', availableTabs.length);
    renderTabs();
}

/**
 * Render tabs
 */
function renderTabs() {
    console.log('🎨 Rendering tabs UI...');
    const tabsContainer = document.getElementById('tabsContainer');
    const contentsContainer = document.getElementById('contentsContainer');
    const mobileNav = document.getElementById('mobileBottomNav');
    
    if (!tabsContainer || !contentsContainer) {
        console.error('❌ Tab containers not found!');
        return;
    }
    
    tabsContainer.innerHTML = '';
    contentsContainer.innerHTML = '';
    
    // Build mobile navigation (show ALL available tabs)
    if (mobileNav) {
        mobileNav.innerHTML = '';
        
        // Show ALL available tabs in mobile navigation
        availableTabs.forEach((tab, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'mobile-nav-item' + (index === 0 ? ' active' : '');
            navItem.onclick = () => switchTab(tab.id);
            navItem.id = `mobile-tab-${tab.id}`;
            
            // Extract emoji and text
            const label = tab.label;
            const emojiMatch = label.match(/^([^\s]+)\s+(.+)$/);
            const emoji = emojiMatch ? emojiMatch[1] : '📋';
            let text = emojiMatch ? emojiMatch[2] : label;
            
            // Shorten text for mobile - keep it short but readable
            const maxLength = 7;
            if (text.length > maxLength) {
                text = text.substring(0, maxLength - 1) + '…';
            }
            
            navItem.innerHTML = `
                <span>${emoji}</span>
                <span>${text}</span>
            `;
            mobileNav.appendChild(navItem);
        });
    }
    
    availableTabs.forEach((tab, index) => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (index === 0 ? ' active' : '');
        tabEl.textContent = tab.label;
        tabEl.onclick = () => switchTab(tab.id);
        tabEl.id = `tab-${tab.id}`;
        tabsContainer.appendChild(tabEl);
        
        const contentEl = document.createElement('div');
        contentEl.id = `${tab.id}Tab`;
        contentEl.className = 'tab-content' + (index === 0 ? ' active' : '');
        contentsContainer.appendChild(contentEl);
        
        console.log('📄 Building content for tab:', tab.label);
        tab.build(contentEl);
    });
    
    if (availableTabs.length > 0) {
        activeTab = availableTabs[0].id;
    }
    
    console.log('✅ Tabs rendered successfully');
}

/**
 * Switch tab
 */
function switchTab(tabId) {
    console.log('🔄 Switching to tab:', tabId);
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
    
    const tab = document.getElementById(`tab-${tabId}`);
    const content = document.getElementById(`${tabId}Tab`);
    const mobileTab = document.getElementById(`mobile-tab-${tabId}`);
    
    if (tab) tab.classList.add('active');
    if (content) content.classList.add('active');
    if (mobileTab) mobileTab.classList.add('active');
    
    activeTab = tabId;
    
    // For mobile: scroll to show content immediately (above stats at bottom)
    const isMobile = window.innerWidth <= 768;
    if (isMobile && content) {
        setTimeout(() => {
            const tabContents = document.querySelector('.tab-contents');
            if (tabContents) {
                // Scroll to tab contents area (content shows before stats on mobile)
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const scrollPosition = tabContents.offsetTop - headerHeight - 10;
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

/**
 * Build Received Devices Page (SHARED - Everyone can access)
 */
function buildReceivedDevicesPage(container) {
    console.log('📥 Building Received Devices page');
    window.currentTabRefresh = () => buildReceivedDevicesPage(document.getElementById('receivedTab'));
    
    // Show devices that are received but not yet accepted
    // Include both "Received" and "Pending Customer Approval" statuses
    const receivedDevices = window.allRepairs.filter(r => 
        (r.status === 'Received' || r.status === 'Pending Customer Approval') && !r.acceptedBy
    );
    
    const role = window.currentUserData.role;
    const canAccept = (role === 'admin' || role === 'manager' || role === 'technician');
    
    container.innerHTML = `
        <div class="card">
            <h3>📥 Received Devices (${receivedDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">
                <strong>Workflow:</strong> Device Received → Create Diagnosis → Customer Approves → Technician Accepts
            </p>
            ${receivedDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No devices waiting - All caught up!</p>
                </div>
            ` : `
                <div id="receivedDevicesList">
                    ${receivedDevices.map(r => `
                        <div class="repair-card" style="border-left:4px solid ${r.isBackJob ? '#f44336' : r.status === 'Pending Customer Approval' ? '#ff9800' : '#2196f3'};">
                            <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                            ${r.status === 'Pending Customer Approval' ? 
                                '<span class="status-badge status-pending-customer-approval">⏳ Pending Customer Approval</span>' : 
                                '<span class="status-badge status-received">📥 Received</span>'
                            }
                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 BACK JOB</span>' : ''}
                            ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                            ${r.customerApproved ? '<span class="status-badge" style="background:#d4edda;color:#155724;">✅ Customer Approved</span>' : ''}
                            
                            <div class="repair-info">
                                <div><strong>Contact:</strong> ${r.contactNumber}</div>
                                <div><strong>Problem:</strong> ${r.problem}</div>
                                ${r.isBackJob ? `<div style="color:#c62828;"><strong>⚠️ Back Job:</strong> ${r.backJobReason}</div>` : ''}
                                ${r.isBackJob && r.originalTechName ? `<div style="color:#c62828;"><strong>Original Tech:</strong> ${r.originalTechName}</div>` : ''}
                                <div><strong>Received by:</strong> ${r.receivedBy || r.createdByName}</div>
                                <div><strong>Received on:</strong> ${utils.formatDateTime(r.createdAt)}</div>
                                ${r.diagnosisCreated && r.diagnosisCreatedAt ? `<div><strong>Diagnosis created:</strong> ${utils.formatDateTime(r.diagnosisCreatedAt)} by ${r.diagnosisCreatedByName || 'N/A'}</div>` : ''}
                                ${r.repairType && r.repairType !== 'Pending Diagnosis' ? `<div><strong>Repair Type:</strong> ${r.repairType}</div>` : '<div style="color:#999;"><strong>Repair Type:</strong> Pending Diagnosis</div>'}
                                ${r.total > 0 ? `<div><strong>Total Cost:</strong> <span style="font-weight:bold;color:#667eea;">₱${r.total.toFixed(2)}</span></div>` : '<div style="color:#999;"><strong>Cost:</strong> Pending diagnosis</div>'}
                                ${r.customerApproved && r.customerApprovedAt ? `<div style="color:#28a745;"><strong>✅ Approved:</strong> ${utils.formatDateTime(r.customerApprovedAt)}</div>` : ''}
                            </div>
                            
                            ${r.photos && r.photos.length > 0 ? `
                                <div style="margin:10px 0;">
                                    <strong>Photos:</strong>
                                    <div style="display:flex;gap:10px;margin-top:5px;">
                                        ${r.photos.map(p => `<img src="${p}" onclick="showPhotoModal('${p}')" style="width:80px;height:80px;object-fit:cover;border-radius:5px;cursor:pointer;">`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="repair-actions">
                                ${!r.diagnosisCreated || r.repairType === 'Pending Diagnosis' ? `
                                    ${(role === 'admin' || role === 'manager' || role === 'technician') ? `
                                        <button class="btn-small btn-primary" onclick="openEditRepairModal('${r.id}')" style="background:#667eea;color:white;">
                                            📋 Create Diagnosis
                                        </button>
                                    ` : ''}
                                ` : `
                                    ${r.status === 'Pending Customer Approval' ? `
                                        ${(role === 'admin' || role === 'manager' || role === 'cashier') ? `
                                            <button class="btn-small btn-success" onclick="approveDiagnosis('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                                                ✅ Mark Customer Approved
                                            </button>
                                        ` : ''}
                                        ${(role === 'admin' || role === 'manager' || role === 'technician') ? `
                                            <button class="btn-small btn-primary" onclick="openEditRepairModal('${r.id}')" style="background:#667eea;color:white;">
                                                ✏️ Update Diagnosis
                                            </button>
                                        ` : ''}
                                    ` : `
                                        ${r.customerApproved ? `
                                            ${canAccept ? `
                                                <button class="btn-small btn-success" onclick="acceptRepair('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                                                    ✅ Accept This Repair
                                                </button>
                                            ` : ''}
                                        ` : `
                                            ${(role === 'admin' || role === 'manager' || role === 'cashier') ? `
                                                <button class="btn-small btn-success" onclick="approveDiagnosis('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                                                    ✅ Mark Customer Approved
                                                </button>
                                            ` : ''}
                                        `}
                                        ${(role === 'admin' || role === 'manager' || role === 'technician') ? `
                                            <button class="btn-small btn-primary" onclick="openEditRepairModal('${r.id}')" style="background:#667eea;color:white;">
                                                ✏️ Update Diagnosis
                                            </button>
                                        ` : ''}
                                    `}
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

/**
 * Build In Progress Page (SHARED - Everyone can access)
 */
function buildInProgressPage(container) {
    console.log('🔧 Building In Progress page');
    window.currentTabRefresh = () => buildInProgressPage(document.getElementById('inprogressTab'));
    
    const inProgressDevices = window.allRepairs.filter(r => 
        r.status === 'In Progress' || r.status === 'Waiting for Parts'
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>🔧 In Progress - Active Repairs (${inProgressDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices currently being repaired</p>
            ${inProgressDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">🎉</h2>
                    <p>No active repairs - All done!</p>
                </div>
            ` : `
                <div id="inProgressList">
                    ${displayRepairsInContainer(inProgressDevices, document.getElementById('inProgressList'), true)}
                </div>
            `}
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('inProgressList');
        if (listContainer && inProgressDevices.length > 0) {
            displayRepairsInContainer(inProgressDevices, listContainer);
        }
    }, 0);
}

/**
 * Build For Release Page (SHARED - Everyone can access)
 */
function buildForReleasePage(container) {
    console.log('📦 Building For Release page');
    window.currentTabRefresh = () => buildForReleasePage(document.getElementById('forreleaseTab'));
    
    const forReleaseRepairs = window.allRepairs.filter(r => r.status === 'Ready for Pickup');
    
    container.innerHTML = `
        <div class="card">
            <h3>📦 Ready for Customer Pickup (${forReleaseRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices ready to be released to customers</p>
            <div id="forReleaseList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('forReleaseList');
        if (listContainer) {
            if (forReleaseRepairs.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No devices ready for pickup</p>';
            } else {
                listContainer.innerHTML = forReleaseRepairs.map(r => {
                    const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
                    const balance = r.total - totalPaid;
                    const isFullyPaid = balance <= 0;
                    
                    return `
                        <div class="repair-card" style="border-left-color:#4caf50;">
                            <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''}</h4>
                            <span class="status-badge status-ready-for-pickup">✅ Ready for Pickup</span>
                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                            
                            <div class="repair-info" style="margin:15px 0;">
                                <div><strong>Device:</strong> ${r.brand} ${r.model}</div>
                                <div><strong>Contact:</strong> ${r.contactNumber}</div>
                                <div><strong>Repair:</strong> ${r.repairType || 'General Repair'}</div>
                                <div><strong>Completed:</strong> ${utils.formatDateTime(r.completedAt || r.lastUpdated)}</div>
                            </div>
                            
                            <div style="background:${isFullyPaid ? '#e8f5e9' : '#fff3cd'};padding:12px;border-radius:8px;margin:15px 0;border-left:4px solid ${isFullyPaid ? '#4caf50' : '#ff9800'};">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-weight:600;">Payment Status:</span>
                                    <span style="font-size:18px;font-weight:700;color:${isFullyPaid ? '#2e7d32' : '#e65100'};">
                                        ${isFullyPaid ? '✅ PAID' : `⚠️ ₱${balance.toFixed(2)} DUE`}
                                    </span>
                                </div>
                                <div style="font-size:13px;color:#666;margin-top:5px;">
                                    Total: ₱${r.total.toFixed(2)} | Paid: ₱${totalPaid.toFixed(2)}
                                </div>
                            </div>
                            
                            <button onclick="openReleaseDeviceModal('${r.id}')" class="btn-success" style="width:100%;font-size:16px;padding:14px;">
                                📦 Release Device to Customer
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }
    }, 0);
}

/**
 * Build RTO Devices Tab (SHARED - Everyone can access)
 */
function buildRTODevicesTab(container) {
    console.log('↩️ Building RTO Devices tab');
    window.currentTabRefresh = () => buildRTODevicesTab(document.getElementById('rtoTab'));
    
    const rtoDevices = window.allRepairs.filter(r => r.status === 'RTO' && !r.claimedAt);
    
    // Sort by RTO date (most recent first)
    rtoDevices.sort((a, b) => new Date(b.rtoDate || b.lastUpdated) - new Date(a.rtoDate || a.lastUpdated));
    
    container.innerHTML = `
        <div class="card">
            <h3>↩️ Return to Owner - RTO Devices (${rtoDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices that cannot be repaired or customer declined repair</p>
            <div id="rtoDevicesList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('rtoDevicesList');
        if (listContainer) {
            if (rtoDevices.length === 0) {
                listContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No RTO devices at this time</p>';
            } else {
                listContainer.innerHTML = rtoDevices.map(r => {
                    const rtoDate = r.rtoDate || r.lastUpdated;
                    const daysSinceRTO = Math.floor((new Date() - new Date(rtoDate)) / (1000 * 60 * 60 * 24));
                    
                    // Check diagnosis fee status
                    const diagnosisFee = r.diagnosisFee || 0;
                    const rtoPaymentStatus = r.rtoPaymentStatus || 'waived';
                    const hasFee = diagnosisFee > 0;
                    const isPaid = rtoPaymentStatus === 'paid' || rtoPaymentStatus === 'waived';
                    
                    // Role-based actions
                    const canRelease = ['admin', 'manager', 'cashier'].includes(window.currentUserData.role);
                    const canAddFee = ['admin', 'manager', 'cashier'].includes(window.currentUserData.role);
                    const canRevertStatus = ['admin'].includes(window.currentUserData.role);
                    
                    return `
                        <div class="repair-card rto-card" style="border-left:4px solid #ff9800;">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''}</h4>
                                <span class="status-badge" style="background:#ff9800;color:white;">↩️ RTO</span>
                            </div>
                            
                            ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;margin-right:5px;">🔄 Back Job</span>' : ''}
                            
                            <div class="repair-info" style="margin:15px 0;">
                                <div><strong>Device:</strong> ${r.brand} ${r.model}</div>
                                <div><strong>Contact:</strong> ${r.contactNumber}</div>
                                <div><strong>Problem:</strong> ${r.problemDescription || 'N/A'}</div>
                            </div>
                            
                            ${r.rtoReason ? `
                                <div style="background:#fff3cd;padding:10px;border-radius:5px;margin:10px 0;border-left:4px solid #ff9800;">
                                    <strong>RTO Reason:</strong> ${r.rtoReason}
                                    ${r.rtoNotes ? `<div style="margin-top:5px;font-size:13px;color:#666;">${r.rtoNotes}</div>` : ''}
                                </div>
                            ` : ''}
                            
                            <div style="background:#f8f9fa;padding:10px;border-radius:5px;margin:10px 0;">
                                <div style="font-size:13px;color:#666;">
                                    <div><strong>Set to RTO:</strong> ${utils.formatDateTime(rtoDate)} (${daysSinceRTO} day${daysSinceRTO !== 1 ? 's' : ''} ago)</div>
                                    ${r.rtoSetByName ? `<div><strong>Set by:</strong> ${r.rtoSetByName}</div>` : ''}
                                </div>
                            </div>
                            
                            ${hasFee ? `
                                <div style="background:${isPaid ? '#e8f5e9' : '#ffebee'};padding:12px;border-radius:8px;margin:15px 0;border-left:4px solid ${isPaid ? '#4caf50' : '#f44336'};">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <span style="font-weight:600;">Diagnosis Fee:</span>
                                        <span style="font-size:16px;font-weight:700;color:${isPaid ? '#2e7d32' : '#c62828'};">
                                            ₱${diagnosisFee.toFixed(2)} ${isPaid ? '✅ PAID' : '⚠️ UNPAID'}
                                        </span>
                                    </div>
                                    ${r.rtoPaymentDate ? `<div style="font-size:12px;color:#666;margin-top:5px;">Paid: ${utils.formatDateTime(r.rtoPaymentDate)}</div>` : ''}
                                </div>
                            ` : `
                                <div style="background:#f1f8e9;padding:10px;border-radius:5px;margin:10px 0;text-align:center;">
                                    <small style="color:#558b2f;">No diagnosis fee charged</small>
                                </div>
                            `}
                            
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px;">
                                ${canAddFee && hasFee && !isPaid ? `
                                    <button onclick="collectRTODiagnosisFee('${r.id}')" class="btn btn-primary" style="flex:1;min-width:150px;">
                                        💰 Collect Fee
                                    </button>
                                ` : ''}
                                
                                ${canAddFee && !hasFee ? `
                                    <button onclick="addRTODiagnosisFee('${r.id}')" class="btn btn-secondary" style="flex:1;min-width:150px;">
                                        💵 Add Diagnosis Fee
                                    </button>
                                ` : ''}
                                
                                ${canRelease && (!hasFee || isPaid) ? `
                                    <button onclick="releaseRTODevice('${r.id}')" class="btn btn-success" style="flex:1;min-width:200px;font-weight:bold;">
                                        ↩️ Return to Customer
                                    </button>
                                ` : ''}
                                
                                ${canRelease && hasFee && !isPaid ? `
                                    <button class="btn btn-secondary" disabled style="flex:1;min-width:200px;">
                                        ⚠️ Collect Fee First
                                    </button>
                                ` : ''}
                                
                                ${canRevertStatus ? `
                                    <button onclick="revertRTOStatus('${r.id}')" class="btn btn-warning" style="padding:10px 15px;">
                                        🔄 Revert to In Progress
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }, 0);
}

/**
 * Build Receive Device Tab with BACK JOB option
 */
function buildReceiveDeviceTab(container) {
    console.log('📥 Building Receive Device tab');
    window.currentTabRefresh = () => buildReceiveDeviceTab(document.getElementById('receiveTab'));
    
    // Get list of techs who have worked on repairs (for back jobs)
    const techsWithJobs = {};
    window.allRepairs.forEach(r => {
        if (r.acceptedBy && r.acceptedByName) {
            techsWithJobs[r.acceptedBy] = r.acceptedByName;
        }
    });
    
    container.innerHTML = `
        <div class="card">
            <h3>➕ Receive Device</h3>
            <p style="color:#666;margin-bottom:20px;">Receive new device from customer - Technician will accept it later</p>
            
            <form onsubmit="submitReceiveDevice(event)">
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:10px;">
                        <input type="checkbox" id="isBackJob" onchange="toggleBackJobFields()">
                        <span style="color:#c62828;font-weight:bold;">🔄 This is a BACK JOB (returning for same issue)</span>
                    </label>
                </div>
                
                <div id="backJobFields" style="display:none;background:#ffebee;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #f44336;">
                    <div class="form-group">
                        <label>Assign to Original Technician *</label>
                        <select id="backJobTech" name="backJobTech">
                            <option value="">Select technician who worked on this before</option>
                            ${Object.entries(techsWithJobs).map(([uid, name]) => 
                                `<option value="${uid}">${name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Back Job Reason *</label>
                        <textarea id="backJobReason" name="backJobReason" rows="2" placeholder="Why is this coming back? (English or Tagalog OK)"></textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer Type *</label>
                        <select name="customerType" onchange="document.getElementById('shopNameGroupReceive').style.display=this.value==='Dealer'?'block':'none'" required>
                            <option value="">Select</option>
                            <option>Walk-in</option>
                            <option>Dealer</option>
                        </select>
                    </div>
                    <div class="form-group" id="shopNameGroupReceive" style="display:none;">
                        <label>Shop Name *</label>
                        <input type="text" name="shopName" placeholder="Dealer shop name">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer Name *</label>
                        <input type="text" name="customerName" required>
                    </div>
                    <div class="form-group">
                        <label>Contact Number *</label>
                        <input type="text" name="contactNumber" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Brand *</label>
                        <input type="text" name="brand" required placeholder="e.g., Samsung, iPhone, Oppo">
                    </div>
                    <div class="form-group">
                        <label>Model *</label>
                        <input type="text" name="model" required placeholder="e.g., Galaxy S21, iPhone 12">
                    </div>
                </div>
                
                <!-- NEW: DEVICE DETAILS SECTION -->
                <div style="background:var(--bg-light);padding:20px;border-radius:var(--radius-md);margin:20px 0;border-left:4px solid var(--primary);">
                    <h4 style="margin:0 0 15px 0;color:var(--primary);">📱 Device Details</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>IMEI / Serial Number</label>
                            <input type="text" name="imei" placeholder="Enter IMEI or Serial (if available)">
                            <small>Optional - For warranty tracking & identification</small>
                        </div>
                        <div class="form-group">
                            <label>Device Passcode</label>
                            <input type="text" name="devicePasscode" placeholder="Pattern, PIN, or Password">
                            <small>Optional - For testing after repair</small>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Device Color</label>
                            <select name="deviceColor">
                                <option value="N/A">N/A (Unknown/Dead device)</option>
                                <option value="Black">Black</option>
                                <option value="White">White</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Rose Gold">Rose Gold</option>
                                <option value="Space Gray">Space Gray</option>
                                <option value="Blue">Blue</option>
                                <option value="Red">Red</option>
                                <option value="Green">Green</option>
                                <option value="Purple">Purple</option>
                                <option value="Pink">Pink</option>
                                <option value="Yellow">Yellow</option>
                                <option value="Orange">Orange</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Storage Capacity</label>
                            <select name="storageCapacity">
                                <option value="N/A">N/A (Unknown/Dead device)</option>
                                <option value="8GB">8GB</option>
                                <option value="16GB">16GB</option>
                                <option value="32GB">32GB</option>
                                <option value="64GB">64GB</option>
                                <option value="128GB">128GB</option>
                                <option value="256GB">256GB</option>
                                <option value="512GB">512GB</option>
                                <option value="1TB">1TB</option>
                                <option value="2TB">2TB</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- NEW: PRE-REPAIR CHECKLIST -->
                <div style="background:var(--bg-light);padding:20px;border-radius:var(--radius-md);margin:20px 0;border-left:4px solid var(--info);">
                    <h4 style="margin:0 0 15px 0;color:var(--info);">✅ Pre-Repair Device Checklist</h4>
                    <p style="margin:0 0 15px;font-size:13px;color:var(--text-secondary);">Check the device condition before starting repair - helps document existing issues</p>
                    
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                        <div class="form-group">
                            <label>📱 Screen Condition</label>
                            <select name="checklistScreen">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Good">✅ Good</option>
                                <option value="Minor Scratches">Minor Scratches</option>
                                <option value="Cracked">❌ Cracked</option>
                                <option value="Lines">Lines Visible</option>
                                <option value="Black/Dead">Black/Dead</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>🔋 Battery Condition</label>
                            <select name="checklistBattery">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Good">✅ Good</option>
                                <option value="Drains Fast">Drains Fast</option>
                                <option value="Won't Charge">❌ Won't Charge</option>
                                <option value="Swollen">⚠️ Swollen</option>
                                <option value="Dead">Dead</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>🔘 Buttons Functionality</label>
                            <select name="checklistButtons">
                                <option value="Not Checked">Not Checked</option>
                                <option value="All Working">✅ All Working</option>
                                <option value="Power Button Issue">Power Button Issue</option>
                                <option value="Volume Issue">Volume Issue</option>
                                <option value="Home Button Issue">Home Button Issue</option>
                                <option value="Multiple Issues">Multiple Issues</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>📷 Camera Status</label>
                            <select name="checklistCamera">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Working">✅ Working</option>
                                <option value="Blurry">Blurry</option>
                                <option value="Not Working">❌ Not Working</option>
                                <option value="Cracked Lens">Cracked Lens</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>🔊 Speakers/Microphone</label>
                            <select name="checklistSpeaker">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Working">✅ Working</option>
                                <option value="Distorted">Distorted</option>
                                <option value="No Sound">❌ No Sound</option>
                                <option value="Low Volume">Low Volume</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>🔌 Charging Port</label>
                            <select name="checklistChargingPort">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Working">✅ Working</option>
                                <option value="Loose">Loose Connection</option>
                                <option value="Damaged">❌ Damaged</option>
                                <option value="Dirty">Needs Cleaning</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>💧 Water Damage</label>
                            <select name="checklistWaterDamage">
                                <option value="None">✅ None</option>
                                <option value="Minor">⚠️ Minor Signs</option>
                                <option value="Severe">❌ Severe</option>
                                <option value="Indicators Triggered">Indicators Triggered</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>🔨 Physical Damage</label>
                            <select name="checklistPhysicalDamage">
                                <option value="None">✅ None</option>
                                <option value="Minor Scratches">Minor Scratches</option>
                                <option value="Dents">Dents</option>
                                <option value="Cracks">Cracks</option>
                                <option value="Broken Parts">❌ Broken Parts</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>📱 SIM Card Present?</label>
                            <select name="checklistSimCard">
                                <option value="Not Checked">Not Checked</option>
                                <option value="Yes - Kept with device">✅ Yes - Kept with device</option>
                                <option value="Yes - Returned to customer">Yes - Returned to customer</option>
                                <option value="No SIM">❌ No SIM</option>
                                <option value="SIM Tray Issue">SIM Tray Issue</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top:15px;">
                        <label>📦 Accessories/Inclusions</label>
                        <input type="text" name="checklistAccessories" placeholder="e.g., Case, Charger, Cable, Memory Card, Box, etc.">
                        <small>List any items the customer left with the device</small>
                    </div>
                    
                    <div class="form-group">
                        <label>📝 Additional Pre-Repair Notes</label>
                        <textarea name="checklistNotes" rows="2" placeholder="Any other observations or concerns about device condition..."></textarea>
                    </div>
                </div>

                <div class="form-group">
                    <label>Problem Type *</label>
                    <select id="problemType" name="problemType" onchange="handleProblemTypeChange()" required>
                        <option value="">Select problem type</option>
                        <optgroup label="🔧 Hardware Issues">
                            <option value="Screen">Screen (Cracked, Lines, Black)</option>
                            <option value="Battery">Battery (Drain, Not Charging, Swollen)</option>
                            <option value="Charging Port">Charging Port</option>
                            <option value="Camera">Camera (Front/Back)</option>
                            <option value="Speaker">Speaker/Microphone</option>
                            <option value="Button">Button (Power, Volume, Home)</option>
                            <option value="Housing">Housing/Body</option>
                            <option value="Water Damage">Water Damage</option>
                            <option value="Motherboard">Motherboard Issue</option>
                        </optgroup>
                        <optgroup label="💻 Software Issues">
                            <option value="FRP Lock">FRP Lock (Google Account)</option>
                            <option value="Password Lock">Password/Pattern Lock</option>
                            <option value="iCloud Lock">iCloud Lock (Apple ID)</option>
                            <option value="Software Restore">Software Restore/Reflash</option>
                            <option value="Virus/Malware">Virus/Malware Removal</option>
                            <option value="OS Update">OS Update/Upgrade</option>
                            <option value="App Issues">App Installation Issues</option>
                            <option value="Slow Performance">Slow Performance/Hang</option>
                            <option value="Data Recovery">Data Recovery</option>
                        </optgroup>
                        <optgroup label="🔄 Other">
                            <option value="Network">Network Issues (WiFi, Signal)</option>
                            <option value="Other Hardware">Other Hardware</option>
                            <option value="Other Software">Other Software</option>
                            <option value="Pending Diagnosis">Pending Diagnosis</option>
                        </optgroup>
                    </select>
                </div>
                
                <div id="softwareWarningBox" style="display:none;background:#fff3cd;padding:12px;border-radius:5px;margin:10px 0;border-left:4px solid #ffc107;">
                    <p style="margin:0;"><strong>⚠️ Software Issue Detected</strong></p>
                    <p style="margin:5px 0 0;font-size:14px;">This is a software repair. Make sure to inform customer about data backup and potential data loss.</p>
                </div>
                
                <div id="frpWarningBox" style="display:none;background:#ffebee;padding:12px;border-radius:5px;margin:10px 0;border-left:4px solid #f44336;">
                    <p style="margin:0;color:#c62828;"><strong>🔒 FRP/Lock Issue</strong></p>
                    <p style="margin:5px 0 0;font-size:14px;color:#c62828;">Verify customer is the original owner. Request proof of purchase. FRP unlock may not be possible on all devices.</p>
                </div>
                
                <div class="form-group">
                    <label>Detailed Problem Description *</label>
                    <textarea name="problem" id="problemDescription" rows="3" required placeholder="Describe the issue in detail..."></textarea>
                    <small style="color:#666;">Be specific: What happened? When? Any error messages?</small>
                </div>
                
                <div class="form-group">
                    <label>Device Photo (Optional)</label>
                    <input type="file" accept="image/*" id="receivePhoto1" onchange="handlePhotoUpload(this,'receivePreview1')">
                    <div id="receivePreview1" style="display:none;margin-top:10px;"></div>
                </div>
                
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:10px;">
                        <input type="checkbox" id="customerPreApproved" onchange="togglePreApprovalFields()">
                        <span style="color:#4caf50;font-weight:bold;">✅ Customer has ALREADY APPROVED the repair price</span>
                    </label>
                    <small style="color:#666;display:block;margin-top:5px;">Check this if you already quoted the customer and they agreed to the price</small>
                </div>
                
                <div id="preApprovalFields" style="display:none;background:#e8f5e9;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #4caf50;">
                    <p style="margin:0 0 15px;"><strong>💰 Enter Agreed Pricing</strong></p>
                    
                    <div class="form-group">
                        <label>Repair Type *</label>
                        <select id="preApprovedRepairType" name="preApprovedRepairType">
                            <option value="">Select repair type</option>
                            <option value="Screen Replacement">Screen Replacement</option>
                            <option value="Battery Replacement">Battery Replacement</option>
                            <option value="Charging Port Repair">Charging Port Repair</option>
                            <option value="Camera Replacement">Camera Replacement</option>
                            <option value="Speaker/Mic Repair">Speaker/Mic Repair</option>
                            <option value="Button Repair">Button Repair</option>
                            <option value="Housing Replacement">Housing Replacement</option>
                            <option value="Water Damage Repair">Water Damage Repair</option>
                            <option value="Motherboard Repair">Motherboard Repair</option>
                            <option value="Software Repair">Software Repair</option>
                            <option value="Data Recovery">Data Recovery</option>
                            <option value="Network/Signal Repair">Network/Signal Repair</option>
                            <option value="Other Repair">Other Repair</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Parts Cost (₱)</label>
                            <input type="number" id="preApprovedPartsCost" name="preApprovedPartsCost" min="0" step="0.01" value="0" onchange="calculatePreApprovedTotal()">
                        </div>
                        <div class="form-group">
                            <label>Labor Cost (₱)</label>
                            <input type="number" id="preApprovedLaborCost" name="preApprovedLaborCost" min="0" step="0.01" value="0" onchange="calculatePreApprovedTotal()">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Total Amount (₱)</label>
                        <input type="number" id="preApprovedTotal" name="preApprovedTotal" readonly style="background:#f5f5f5;font-weight:bold;font-size:18px;" value="0.00">
                    </div>
                    
                    <div style="background:#fff9c4;padding:10px;border-radius:5px;margin-top:10px;">
                        <small><strong>ℹ️ Note:</strong> This device will be marked as "Received & Approved" - ready for technician to accept and start repair immediately.</small>
                    </div>
                </div>
                
                <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #2196f3;">
                    <p style="margin:0;"><strong>ℹ️ Workflow:</strong></p>
                    <ol style="margin:5px 0 0 20px;font-size:14px;">
                        <li>Device received (no pricing yet)</li>
                        <li>Tech/Owner creates diagnosis and sets price</li>
                        <li>Customer approves the price</li>
                        <li>Technician accepts and starts repair</li>
                    </ol>
                </div>
                
                <button type="submit" style="width:100%;background:#4caf50;color:white;font-size:16px;padding:12px;">
                    📥 Receive Device
                </button>
            </form>
        </div>
    `;
}

/**
 * Build My Requests Tab (for non-admin users)
 */
function buildMyRequestsTab(container) {
    console.log('📝 Building My Requests tab');
    window.currentTabRefresh = () => buildMyRequestsTab(document.getElementById('requestsTab'));
    
    // Load modification requests for this user
    const myRequests = window.allModificationRequests ? 
        window.allModificationRequests.filter(r => r.requestedBy === window.currentUser.uid) : [];
    
    container.innerHTML = `
        <div class="card">
            <h3>📝 My Modification Requests (${myRequests.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Your requests to modify payment/repair data</p>
            
            ${myRequests.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📭</h2>
                    <p>No modification requests</p>
                    <p style="font-size:14px;color:#999;">When you need to change payment dates or repair data, submit a request here.</p>
                </div>
            ` : `
                <div>
                    ${myRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).map(req => `
                        <div style="background:${req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffebee' : '#fff3e0'};padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid ${req.status === 'approved' ? '#4caf50' : req.status === 'rejected' ? '#f44336' : '#ff9800'};">
                            <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                                <strong>${req.requestType === 'payment-date' ? '📅 Payment Date Change' : req.requestType === 'recorded-date' ? '🕒 Recorded Date Change' : '📝 Data Modification'}</strong>
                                <span style="background:${req.status === 'approved' ? '#4caf50' : req.status === 'rejected' ? '#f44336' : '#ff9800'};color:white;padding:2px 8px;border-radius:3px;font-size:12px;">
                                    ${req.status === 'approved' ? '✅ Approved' : req.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                                </span>
                            </div>
                            <div style="font-size:14px;color:#666;margin-bottom:10px;">
                                <div><strong>Repair:</strong> ${req.repairDetails || 'N/A'}</div>
                                ${req.oldValue ? `<div><strong>From:</strong> ${req.oldValue}</div>` : ''}
                                ${req.newValue ? `<div><strong>To:</strong> ${req.newValue}</div>` : ''}
                                <div><strong>Reason:</strong> ${req.reason}</div>
                                <div><strong>Requested:</strong> ${utils.formatDateTime(req.requestedAt)}</div>
                            </div>
                            ${req.status !== 'pending' ? `
                                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;font-size:13px;">
                                    <div><strong>${req.status === 'approved' ? 'Approved' : 'Rejected'} by:</strong> ${req.processedByName}</div>
                                    <div><strong>On:</strong> ${utils.formatDateTime(req.processedAt)}</div>
                                    ${req.adminNotes ? `<div><strong>Admin Notes:</strong> ${req.adminNotes}</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

/**
 * Build Modification Requests Tab (Admin only)
 */
function buildModificationRequestsTab(container) {
    console.log('🔔 Building Modification Requests tab');
    window.currentTabRefresh = () => buildModificationRequestsTab(document.getElementById('mod-requestsTab'));
    
    const pendingRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status === 'pending') : [];
    
    const processedRequests = window.allModificationRequests ?
        window.allModificationRequests.filter(r => r.status !== 'pending').slice(0, 20) : [];
    
    container.innerHTML = `
        <div class="card">
            <h3>🔔 Modification Requests (${pendingRequests.length} pending)</h3>
            <p style="color:#666;margin-bottom:15px;">Review and approve/reject modification requests from users</p>
            
            ${pendingRequests.length === 0 && processedRequests.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No modification requests</p>
                </div>
            ` : `
                ${pendingRequests.length > 0 ? `
                    <h4 style="margin-top:20px;">⏳ Pending Requests</h4>
                    ${pendingRequests.map(req => `
                        <div style="background:#fff3e0;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ff9800;">
                            <div style="margin-bottom:10px;">
                                <strong>${req.requestType === 'payment-date' ? '📅 Payment Date Change' : req.requestType === 'recorded-date' ? '🕒 Recorded Date Change' : '📝 Data Modification'}</strong>
                            </div>
                            <div style="font-size:14px;color:#666;margin-bottom:10px;">
                                <div><strong>Requested by:</strong> ${req.requestedByName} (${req.requestedByRole})</div>
                                <div><strong>Repair:</strong> ${req.repairDetails || 'N/A'}</div>
                                ${req.oldValue ? `<div><strong>From:</strong> ${req.oldValue}</div>` : ''}
                                ${req.newValue ? `<div><strong>To:</strong> ${req.newValue}</div>` : ''}
                                <div><strong>Reason:</strong> ${req.reason}</div>
                                <div><strong>Requested:</strong> ${utils.formatDateTime(req.requestedAt)}</div>
                            </div>
                            <div style="display:flex;gap:10px;">
                                <button onclick="processModificationRequest('${req.id}', 'approve')" style="background:#4caf50;color:white;padding:8px 16px;border:none;border-radius:5px;cursor:pointer;">
                                    ✅ Approve
                                </button>
                                <button onclick="processModificationRequest('${req.id}', 'reject')" style="background:#f44336;color:white;padding:8px 16px;border:none;border-radius:5px;cursor:pointer;">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}
                
                ${processedRequests.length > 0 ? `
                    <h4 style="margin-top:30px;">📋 Recent Processed (Last 20)</h4>
                    ${processedRequests.map(req => `
                        <div style="background:${req.status === 'approved' ? '#e8f5e9' : '#ffebee'};padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${req.status === 'approved' ? '#4caf50' : '#f44336'};">
                            <div style="display:flex;justify-content:space-between;font-size:14px;">
                                <div>
                                    <strong>${req.requestType === 'payment-date' ? '📅' : req.requestType === 'recorded-date' ? '🕒' : '📝'} ${req.requestedByName}</strong> - ${req.reason.substring(0, 50)}...
                                </div>
                                <span style="font-size:12px;color:#666;">${utils.formatDate(req.processedAt)}</span>
                            </div>
                        </div>
                    `).join('')}
                ` : ''}
            `}
        </div>
    `;
}

function buildUnpaidTab(container) {
    console.log('💳 Building Unpaid tab');
    window.currentTabRefresh = () => buildUnpaidTab(document.getElementById('unpaidTab'));
    
    const unpaidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) > 0;
    });
    
    container.innerHTML = `
        <div class="card">
            <h3>💳 Unpaid Repairs (${unpaidRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs with outstanding balance</p>
            <div id="unpaidRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('unpaidRepairsList');
        if (listContainer) {
            displayRepairsInContainer(unpaidRepairs, listContainer);
        }
    }, 0);
}

function buildPendingPaymentsTab(container) {
    console.log('⏳ Building Pending Payments tab');
    window.currentTabRefresh = () => buildPendingPaymentsTab(document.getElementById('pendingTab'));
    
    const pendingRepairs = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>⏳ Pending Payment Verification (${pendingRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Payments waiting for admin/manager approval</p>
            <div id="pendingPaymentsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('pendingPaymentsList');
        if (listContainer) {
            displayRepairsInContainer(pendingRepairs, listContainer);
        }
    }, 0);
}

function buildPaidTab(container) {
    console.log('✅ Building Paid tab');
    window.currentTabRefresh = () => buildPaidTab(document.getElementById('paidTab'));
    
    const paidRepairs = window.allRepairs.filter(r => {
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        return (r.total - totalPaid) === 0 && r.total > 0;
    });
    
    container.innerHTML = `
        <div class="card">
            <h3>✅ Fully Paid Repairs (${paidRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs with no outstanding balance</p>
            <div id="paidRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('paidRepairsList');
        if (listContainer) {
            displayRepairsInContainer(paidRepairs, listContainer);
        }
    }, 0);
}

function buildAllRepairsTab(container) {
    console.log('📋 Building All Repairs tab');
    
    window.currentTabRefresh = () => {
        buildAllRepairsTab(document.getElementById('allTab'));
    };
    
    const repairs = window.allRepairs || [];
    
    container.innerHTML = `
        <div class="card">
            <h3>All Repairs (${repairs.length})</h3>
            <div id="allRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('allRepairsList');
        if (listContainer) {
            displayRepairsInContainer(repairs, listContainer);
        }
    }, 0);
}

function displayRepairsInContainer(repairs, container) {
    // Safety check
    if (!container) {
        console.warn('⚠️ Container not found, skipping display');
        return;
    }
    
    if (!container) {
        console.error('❌ Container is null!');
        return;
    }
    
    if (!repairs || repairs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No repairs found</p>';
        return;
    }
    
    const role = window.currentUserData.role;
    const hidePaymentActions = role === 'technician';
    
    container.innerHTML = repairs.map(r => {
        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;
        const paymentStatus = balance === 0 && r.total > 0 ? 'verified' : (r.payments && r.payments.some(p => !p.verified)) ? 'pending' : 'unpaid';
        
        return `
            <div class="repair-card">
                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                <span class="status-badge status-${statusClass}">${r.status}</span>
                ${r.isBackJob ? '<span class="status-badge" style="background:#ffebee;color:#c62828;">🔄 Back Job</span>' : ''}
                ${!hidePaymentActions ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                
                <div class="repair-info">
                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                    ${r.imei ? `<div><strong>📱 IMEI/Serial:</strong> ${r.imei}</div>` : ''}
                    ${r.deviceColor && r.deviceColor !== 'N/A' ? `<div><strong>🎨 Color:</strong> ${r.deviceColor}</div>` : ''}
                    ${r.storageCapacity && r.storageCapacity !== 'N/A' ? `<div><strong>💾 Storage:</strong> ${r.storageCapacity}</div>` : ''}
                    ${r.devicePasscode ? `<div><strong>🔐 Passcode:</strong> ${r.devicePasscode}</div>` : ''}
                    <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                    ${r.acceptedBy ? `<div><strong>Technician:</strong> ${r.acceptedByName}</div>` : ''}
                    <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                    <div><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></div>
                    <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-weight:bold;">₱${balance.toFixed(2)}</span></div>
                </div>
                
                <div><strong>Problem:</strong> ${r.problem}</div>
                
                ${r.preRepairChecklist ? `
                    <details style="margin-top:15px;background:var(--bg-light);padding:10px;border-radius:var(--radius-md);">
                        <summary style="cursor:pointer;font-weight:600;color:var(--primary);">📋 Pre-Repair Checklist</summary>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;font-size:13px;">
                            ${r.preRepairChecklist.screen !== 'Not Checked' ? `<div><strong>📱 Screen:</strong> ${r.preRepairChecklist.screen}</div>` : ''}
                            ${r.preRepairChecklist.battery !== 'Not Checked' ? `<div><strong>🔋 Battery:</strong> ${r.preRepairChecklist.battery}</div>` : ''}
                            ${r.preRepairChecklist.buttons !== 'Not Checked' ? `<div><strong>🔘 Buttons:</strong> ${r.preRepairChecklist.buttons}</div>` : ''}
                            ${r.preRepairChecklist.camera !== 'Not Checked' ? `<div><strong>📷 Camera:</strong> ${r.preRepairChecklist.camera}</div>` : ''}
                            ${r.preRepairChecklist.speaker !== 'Not Checked' ? `<div><strong>🔊 Speaker:</strong> ${r.preRepairChecklist.speaker}</div>` : ''}
                            ${r.preRepairChecklist.chargingPort !== 'Not Checked' ? `<div><strong>🔌 Port:</strong> ${r.preRepairChecklist.chargingPort}</div>` : ''}
                            ${r.preRepairChecklist.waterDamage !== 'None' ? `<div><strong>💧 Water:</strong> ${r.preRepairChecklist.waterDamage}</div>` : ''}
                            ${r.preRepairChecklist.physicalDamage !== 'None' ? `<div><strong>🔨 Physical:</strong> ${r.preRepairChecklist.physicalDamage}</div>` : ''}
                            ${r.preRepairChecklist.simCard !== 'Not Checked' ? `<div><strong>📱 SIM:</strong> ${r.preRepairChecklist.simCard}</div>` : ''}
                            ${r.preRepairChecklist.accessories ? `<div style="grid-column:1/-1;"><strong>📦 Accessories:</strong> ${r.preRepairChecklist.accessories}</div>` : ''}
                            ${r.preRepairChecklist.notes ? `<div style="grid-column:1/-1;"><strong>📝 Notes:</strong> ${r.preRepairChecklist.notes}</div>` : ''}
                        </div>
                    </details>
                ` : ''}
                
                ${r.partsUsed && Object.keys(r.partsUsed).length > 0 ? `
                    <details style="margin-top:15px;background:#e8f5e9;padding:10px;border-radius:var(--radius-md);">
                        <summary style="cursor:pointer;font-weight:600;color:#2e7d32;">🔧 Parts Used</summary>
                        <div style="margin-top:10px;">
                            ${Object.values(r.partsUsed).map(part => `
                                <div style="display:flex;justify-content:space-between;padding:8px;background:white;border-radius:4px;margin-bottom:5px;">
                                    <div>
                                        <strong>${part.partName}</strong>
                                        <span class="text-secondary" style="font-size:12px;"> (${part.partNumber})</span>
                                        <div style="font-size:12px;color:#666;">
                                            Qty: ${part.quantity} × ₱${part.unitCost.toFixed(2)} = ₱${part.totalCost.toFixed(2)}
                                        </div>
                                        <div style="font-size:11px;color:#999;">
                                            ${part.usedBy} • ${utils.formatDateTime(part.usedAt)}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;text-align:right;">
                                <strong>Total Parts Cost: ₱${Object.values(r.partsUsed).reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    </details>
                ` : ''}
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Waiting for Parts') && (role === 'technician' || role === 'admin' || role === 'manager') ? `<button class="btn-small" onclick="openUsePartsModal('${r.id}')" style="background:#2e7d32;color:white;">🔧 Use Parts</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">💵 Parts Cost</button>` : ''}
                    ${role === 'technician' ? `<button class="btn-small" onclick="openExpenseModal('${r.id}')" style="background:#9c27b0;color:white;">💸 Expense</button>` : ''}
                    ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function buildMyRepairsTab(container) {
    console.log('🔧 Building My Repairs tab');
    window.currentTabRefresh = () => buildMyRepairsTab(document.getElementById('myTab'));
    
    const myRepairs = window.allRepairs.filter(r => 
        r.acceptedBy === window.currentUser.uid && 
        r.status !== 'Claimed'
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>🔧 My Jobs (${myRepairs.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Repairs you have accepted</p>
            <div id="myRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('myRepairsList');
        if (listContainer) {
            displayRepairsInContainer(myRepairs, listContainer);
        }
    }, 0);
}

function buildPendingTab(container) {
    console.log('⏳ Building Pending tab');
    window.currentTabRefresh = () => buildPendingTab(document.getElementById('pendingTab'));
    
    const pendingRepairs = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>⏳ Pending Verification (${pendingRepairs.length})</h3>
            <div id="pendingRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('pendingRepairsList');
        if (listContainer) {
            displayRepairsInContainer(pendingRepairs, listContainer);
        }
    }, 0);
}

function buildCashCountTab(container) {
    console.log('💵 Building Cash Count tab');
    window.currentTabRefresh = () => buildCashCountTab(document.getElementById('cashTab'));
    
    // Get current selected date or default to today
    const selectedDate = window.selectedCashCountDate || new Date();
    const dateString = selectedDate.toISOString().split('T')[0];
    const displayDate = utils.formatDate(selectedDate.toISOString());
    
    // Get cash data for selected date
    const cashData = getDailyCashData(dateString);
    const isLocked = cashData.locked;
    const lockInfo = cashData.lockedInfo;
    
    const role = window.currentUserData.role;
    const canLock = role === 'admin' || role === 'manager';
    const canUnlock = role === 'admin';
    
    container.innerHTML = `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3>💵 Daily Cash Count</h3>
                <div>
                    <input type="date" id="cashCountDate" value="${dateString}" 
                           onchange="updateCashCountDate(this.value)"
                           style="padding:8px;border:1px solid #ddd;border-radius:4px;">
                </div>
            </div>
            
            <div style="background:${isLocked ? '#f5f5f5' : '#e3f2fd'};padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid ${isLocked ? '#9e9e9e' : '#2196f3'};">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${displayDate}</strong>
                        ${isLocked ? `
                            <span style="margin-left:10px;padding:4px 12px;background:#9e9e9e;color:white;border-radius:12px;font-size:12px;">
                                🔒 LOCKED
                            </span>
                        ` : `
                            <span style="margin-left:10px;padding:4px 12px;background:#4caf50;color:white;border-radius:12px;font-size:12px;">
                                🔓 Unlocked
                            </span>
                        `}
                    </div>
                    ${isLocked && lockInfo ? `
                        <small style="color:#666;">
                            Locked ${utils.formatDateTime(lockInfo.lockedAt)} by ${lockInfo.lockedByName}
                        </small>
                    ` : ''}
                </div>
                ${isLocked && lockInfo && lockInfo.notes ? `
                    <div style="margin-top:10px;font-size:14px;color:#666;">
                        <strong>Notes:</strong> ${lockInfo.notes}
                    </div>
                ` : ''}
            </div>
            
            <!-- Payments Section -->
            <div class="card" style="background:#e8f5e9;margin-bottom:15px;">
                <h4 style="margin:0 0 15px;color:#2e7d32;">💵 Payments Collected</h4>
                <div style="font-size:24px;font-weight:bold;color:#2e7d32;margin-bottom:15px;">
                    ₱${cashData.totals.payments.toFixed(2)}
                    <small style="font-size:14px;color:#666;font-weight:normal;">(${cashData.payments.length} transactions)</small>
                </div>
                ${cashData.payments.length > 0 ? `
                    <div style="max-height:300px;overflow-y:auto;">
                        ${cashData.payments.map(p => `
                            <div style="padding:10px;background:white;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${p.customerName}</strong>
                                    <span style="color:#666;font-size:13px;"> • ${p.method}</span>
                                    ${p.receivedByName ? `<span style="color:#666;font-size:13px;"> • by ${p.receivedByName}</span>` : ''}
                                </div>
                                <div style="font-weight:bold;color:#2e7d32;">₱${p.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="text-align:center;color:#999;padding:20px;">No payments recorded for this date</p>
                `}
            </div>
            
            <!-- Expenses Section -->
            <div class="card" style="background:#ffebee;margin-bottom:15px;">
                <h4 style="margin:0 0 15px;color:#c62828;">💸 Expenses</h4>
                <div style="font-size:24px;font-weight:bold;color:#c62828;margin-bottom:15px;">
                    ₱${cashData.totals.expenses.toFixed(2)}
                    <small style="font-size:14px;color:#666;font-weight:normal;">(${cashData.expenses.length} transactions)</small>
                </div>
                ${cashData.expenses.length > 0 ? `
                    <div style="max-height:300px;overflow-y:auto;">
                        ${cashData.expenses.map(e => `
                            <div style="padding:10px;background:white;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${e.category}</strong>
                                    ${e.description ? `<span style="color:#666;font-size:13px;"> • ${e.description}</span>` : ''}
                                    ${e.techName ? `<span style="color:#666;font-size:13px;"> • ${e.techName}</span>` : ''}
                                </div>
                                <div style="font-weight:bold;color:#c62828;">₱${e.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="text-align:center;color:#999;padding:20px;">No expenses recorded for this date</p>
                `}
            </div>
            
            <!-- Net Revenue Section -->
            <div class="card" style="background:${cashData.totals.net >= 0 ? '#e3f2fd' : '#fff3cd'};border-left:4px solid ${cashData.totals.net >= 0 ? '#2196f3' : '#fbc02d'};">
                <h4 style="margin:0 0 15px;">📊 Net Revenue</h4>
                <div style="font-size:32px;font-weight:bold;color:${cashData.totals.net >= 0 ? '#1976d2' : '#f57c00'};margin-bottom:10px;">
                    ₱${cashData.totals.net.toFixed(2)}
                </div>
                <div style="color:#666;font-size:14px;">
                    ₱${cashData.totals.payments.toFixed(2)} (payments) - ₱${cashData.totals.expenses.toFixed(2)} (expenses)
                </div>
                ${cashData.totals.net < 0 ? `
                    <div style="margin-top:10px;padding:10px;background:#fff9c4;border-radius:4px;color:#f57c00;">
                        ⚠️ <strong>Negative Balance:</strong> Expenses exceed payments
                    </div>
                ` : ''}
            </div>
            
            <!-- Lock/Unlock Actions -->
            ${!isLocked && canLock ? `
                <div style="margin-top:20px;">
                    ${cashData.payments.length === 0 && cashData.expenses.length === 0 ? `
                        <div style="padding:15px;background:#fff3cd;border-radius:4px;margin-bottom:15px;color:#f57c00;">
                            ⚠️ No transactions recorded for this date
                        </div>
                    ` : ''}
                    <button onclick="openLockDayModal('${dateString}')" 
                            style="width:100%;padding:12px;background:#4caf50;color:white;border:none;border-radius:4px;font-size:16px;cursor:pointer;">
                        🔒 Lock This Day
                    </button>
                    <p style="text-align:center;color:#666;font-size:13px;margin-top:10px;">
                        Once locked, no transactions can be added or modified for this date
                    </p>
                </div>
            ` : ''}
            
            ${isLocked && canUnlock ? `
                <div style="margin-top:20px;">
                    <button onclick="openUnlockDayModal('${dateString}')" 
                            style="width:100%;padding:12px;background:#ff9800;color:white;border:none;border-radius:4px;font-size:16px;cursor:pointer;">
                        🔓 Unlock This Day (Admin Only)
                    </button>
                    <p style="text-align:center;color:#999;font-size:13px;margin-top:10px;">
                        ⚠️ Unlocking will allow modifications to historical data
                    </p>
                </div>
            ` : ''}
        </div>
        
        <!-- Historical Locked Days -->
        ${renderHistoricalCashCounts()}
    `;
}

/**
 * Render historical locked days
 */
function renderHistoricalCashCounts() {
    const lockedDays = Object.entries(window.dailyCashCounts || {})
        .filter(([_, data]) => data.locked)
        .sort((a, b) => b[0].localeCompare(a[0]))  // Sort by date descending
        .slice(0, 10);  // Show last 10 locked days
    
    if (lockedDays.length === 0) {
        return '';
    }
    
    return `
        <div class="card" style="margin-top:20px;">
            <h4 style="margin:0 0 15px;">📚 Recent Locked Days</h4>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f5f5f5;text-align:left;">
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Date</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Payments</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Expenses</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Net</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Locked By</th>
                            <th style="padding:10px;border-bottom:2px solid #ddd;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lockedDays.map(([date, data]) => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${utils.formatDate(date)}</td>
                                <td style="padding:10px;color:#2e7d32;">₱${data.totalPayments.toFixed(0)}</td>
                                <td style="padding:10px;color:#c62828;">₱${data.totalExpenses.toFixed(0)}</td>
                                <td style="padding:10px;font-weight:bold;color:${data.netRevenue >= 0 ? '#1976d2' : '#f57c00'};">
                                    ₱${data.netRevenue.toFixed(0)}
                                </td>
                                <td style="padding:10px;font-size:13px;color:#666;">${data.lockedByName || 'Unknown'}</td>
                                <td style="padding:10px;">
                                    <button onclick="viewLockedDay('${date}')" 
                                            style="padding:6px 12px;background:#2196f3;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Update cash count date selector
 */
function updateCashCountDate(dateString) {
    window.selectedCashCountDate = new Date(dateString + 'T00:00:00');
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * View specific locked day
 */
function viewLockedDay(dateString) {
    window.selectedCashCountDate = new Date(dateString + 'T00:00:00');
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

function buildSuppliersTab(container) {
    console.log('📊 Building Suppliers tab');
    window.currentTabRefresh = () => buildSuppliersTab(document.getElementById('suppliersTab'));
    
    container.innerHTML = `
        <div class="card">
            <h3>📊 Supplier Price Comparison</h3>
            <p style="text-align:center;color:#999;padding:40px;">Supplier report feature coming soon...</p>
        </div>
    `;
}

function buildUsersTab(container) {
    console.log('👥 Building Users tab');
    window.currentTabRefresh = () => buildUsersTab(document.getElementById('usersTab'));
    
    // Get all users
    const users = window.allUsers || [];
    const activeUsers = users.filter(u => u.status === 'active');
    const inactiveUsers = users.filter(u => u.status !== 'active');
    
    // Group by role
    const admins = users.filter(u => u.role === 'admin');
    const managers = users.filter(u => u.role === 'manager');
    const cashiers = users.filter(u => u.role === 'cashier');
    const technicians = users.filter(u => u.role === 'technician');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>👥 User Management</h2>
            <button onclick="openCreateUserModal()" class="btn-primary" style="margin-top:10px;">
                ➕ Create New User
            </button>
        </div>
        
        <!-- Summary Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>${users.length}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>${activeUsers.length}</h3>
                <p>✅ Active</p>
            </div>
            <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
                <h3>${inactiveUsers.length}</h3>
                <p>❌ Inactive</p>
            </div>
            <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
                <h3>${technicians.length}</h3>
                <p>🔧 Technicians</p>
            </div>
        </div>
        
        <!-- Users List -->
        <div class="card" style="margin:20px 0;">
            <h3>All Users</h3>
            
            ${users.length === 0 ? `
                <p style="text-align:center;color:#999;padding:40px;">No users found</p>
            ` : `
                <div class="repairs-list">
                    ${users.map(user => {
                        const roleColors = {
                            admin: '#f44336',
                            manager: '#ff9800',
                            cashier: '#2196f3',
                            technician: '#4caf50'
                        };
                        const roleColor = roleColors[user.role] || '#999';
                        const isActive = user.status === 'active';
                        
                        return `
                            <div class="repair-card" style="border-left-color:${roleColor};">
                                <div style="display:flex;justify-content:space-between;align-items:start;gap:15px;">
                                    <div style="flex:1;">
                                        <h4 style="margin:0 0 10px 0;">${user.displayName}</h4>
                                        <div style="font-size:13px;color:#666;line-height:1.6;">
                                            <div><strong>Email:</strong> ${user.email}</div>
                                            <div><strong>Role:</strong> 
                                                <span style="background:${roleColor};color:white;padding:2px 8px;border-radius:3px;font-size:11px;text-transform:uppercase;">
                                                    ${user.role}
                                                </span>
                                            </div>
                                            ${user.role === 'technician' && user.technicianName ? `
                                                <div><strong>Tech Name:</strong> ${user.technicianName}</div>
                                            ` : ''}
                                            <div><strong>Status:</strong> 
                                                <span style="color:${isActive ? '#4caf50' : '#f44336'};font-weight:600;">
                                                    ${isActive ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                            </div>
                                            ${user.lastLogin ? `
                                                <div><strong>Last Login:</strong> ${utils.formatDateTime(user.lastLogin)}</div>
                                            ` : ''}
                                            <div style="font-size:11px;color:#999;margin-top:5px;">
                                                Created: ${utils.formatDate(user.createdAt)} ${user.createdByName ? `by ${user.createdByName}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display:flex;flex-direction:column;gap:8px;">
                                        <button onclick="openEditUserModal('${user.id}')" class="btn-small" style="background:#667eea;color:white;">
                                            ✏️ Edit
                                        </button>
                                        <button onclick="toggleUserStatus('${user.id}')" class="btn-small" style="background:${isActive ? '#f44336' : '#4caf50'};color:white;">
                                            ${isActive ? '❌ Deactivate' : '✅ Activate'}
                                        </button>
                                        <button onclick="viewUserProfile('${user.id}')" class="btn-small" style="background:#2196f3;color:white;">
                                            👤 Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}

/**
 * Build Admin Tools Tab (Admin only)
 */
function buildAdminToolsTab(container) {
    console.log('🔧 Building Admin Tools tab');
    window.currentTabRefresh = () => buildAdminToolsTab(document.getElementById('admin-toolsTab'));
    
    const todayString = new Date().toISOString().split('T')[0];
    const cashData = getDailyCashData(todayString);
    const isLocked = window.dailyCashCounts && window.dailyCashCounts[todayString];
    
    container.innerHTML = `
        <div class="card">
            <h3>🔧 Admin Tools & Reset Functions</h3>
            
            <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #ffc107;">
                <strong>⚠️ WARNING:</strong> Reset functions will permanently delete data. Use with caution!
                <br><small>All resets are backed up and logged for audit purposes.</small>
            </div>
            
            <!-- TODAY'S STATUS -->
            <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
                <h4 style="margin:0 0 10px;">📊 Today's Cash Status</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                    <div>
                        <small style="color:#666;">Payments</small>
                        <div style="font-size:18px;font-weight:bold;color:#4caf50;">
                            ₱${cashData.totals.payments.toFixed(2)}
                        </div>
                        <small style="color:#999;">${cashData.payments.length} transaction(s)</small>
                    </div>
                    <div>
                        <small style="color:#666;">Expenses</small>
                        <div style="font-size:18px;font-weight:bold;color:#f44336;">
                            ₱${cashData.totals.expenses.toFixed(2)}
                        </div>
                        <small style="color:#999;">${cashData.expenses.length} transaction(s)</small>
                    </div>
                </div>
                <div style="border-top:1px solid #ddd;padding-top:10px;margin-top:10px;">
                    <small style="color:#666;">Net Revenue</small>
                    <div style="font-size:20px;font-weight:bold;color:#2196f3;">
                        ₱${cashData.totals.net.toFixed(2)}
                    </div>
                    ${isLocked ? '<div style="margin-top:5px;"><span style="background:#4caf50;color:white;padding:3px 8px;border-radius:3px;font-size:12px;">🔒 Locked</span></div>' : ''}
                </div>
            </div>
            
            ${isLocked ? `
                <div style="background:#fff9c4;padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #ffc107;">
                    <strong>🔒 Today is Locked</strong>
                    <p style="margin:5px 0 0;">To make changes, go to the <strong>Cash Count</strong> tab and unlock today's date first.</p>
                </div>
            ` : `
                <!-- RESET BUTTONS -->
                <div class="form-group">
                    <h4 style="margin:0 0 10px;">🔄 Reset Functions</h4>
                    
                    <button 
                        onclick="resetTodayPayments()" 
                        class="btn btn-danger"
                        style="width:100%;margin-bottom:10px;"
                        ${cashData.payments.length === 0 ? 'disabled' : ''}>
                        🗑️ Reset Today's Payments
                        ${cashData.payments.length === 0 ? '<br><small>(No payments to reset)</small>' : `<br><small>${cashData.payments.length} payment(s) - ₱${cashData.totals.payments.toFixed(2)}</small>`}
                    </button>
                    
                    <button 
                        onclick="resetTodayExpenses()" 
                        class="btn btn-danger"
                        style="width:100%;margin-bottom:10px;"
                        ${cashData.expenses.length === 0 ? 'disabled' : ''}>
                        🗑️ Reset Today's Expenses
                        ${cashData.expenses.length === 0 ? '<br><small>(No expenses to reset)</small>' : `<br><small>${cashData.expenses.length} expense(s) - ₱${cashData.totals.expenses.toFixed(2)}</small>`}
                    </button>
                    
                    <button 
                        onclick="fullResetToday()" 
                        class="btn btn-danger"
                        style="width:100%;background:#d32f2f;"
                        ${(cashData.payments.length === 0 && cashData.expenses.length === 0) ? 'disabled' : ''}>
                        ⚠️ FULL RESET - Today's All Data
                        ${(cashData.payments.length === 0 && cashData.expenses.length === 0) ? '<br><small>(No transactions to reset)</small>' : `<br><small>Will delete ALL transactions (${cashData.payments.length + cashData.expenses.length} total)</small>`}
                    </button>
                </div>
            `}
            
            <!-- BACKUP INFO -->
            <div class="form-group" style="background:#e3f2fd;padding:15px;border-radius:5px;margin-top:20px;">
                <h4 style="margin:0 0 10px;">💾 Data Safety</h4>
                <ul style="margin:5px 0;padding-left:20px;">
                    <li>All resets require your password</li>
                    <li>Deleted data is backed up to <code>resetBackups</code></li>
                    <li>All actions are logged with timestamp and reason</li>
                    <li>Locked dates cannot be modified</li>
                </ul>
            </div>
            
            <!-- RECENTLY RELEASED DEVICES -->
            ${buildRecentlyReleasedSection()}
            
            <!-- QUICK ACTIONS -->
            <div class="form-group" style="margin-top:20px;">
                <h4 style="margin:0 0 10px;">⚡ Quick Actions</h4>
                <button onclick="window.switchToTab('cash')" class="btn btn-primary" style="width:100%;margin-bottom:10px;">
                    💵 Open Cash Count Tab
                </button>
                <button onclick="window.switchToTab('admin-logs')" class="btn btn-primary" style="width:100%;">
                    📋 View Activity Logs
                </button>
            </div>
        </div>
    `;
}

/**
 * Build Recently Released Devices Section for Admin Tools
 */
function buildRecentlyReleasedSection() {
    // Get recently released devices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyReleased = window.allRepairs.filter(r => {
        if (!r.claimedAt) return false;
        const claimedDate = new Date(r.claimedAt);
        return claimedDate >= sevenDaysAgo;
    }).sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));
    
    if (recentlyReleased.length === 0) {
        return `
            <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-top:20px;">
                <h4 style="margin:0 0 10px;">📦 Recently Released Devices</h4>
                <p style="color:#999;margin:0;">No devices released in the last 7 days</p>
            </div>
        `;
    }
    
    // Check payment status for each
    const devicesHTML = recentlyReleased.slice(0, 10).map(repair => {
        const totalAmount = repair.total || 0;
        const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
        const balance = totalAmount - totalPaid;
        const isPaid = balance <= 0;
        
        const statusColor = isPaid ? '#4caf50' : '#f44336';
        const statusText = isPaid ? '✅ Fully Paid' : `⚠️ Unpaid: ₱${balance.toFixed(2)}`;
        
        return `
            <div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:8px;border-left:4px solid ${statusColor};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
                    <div style="flex:1;">
                        <strong>${repair.customerName}</strong> - ${repair.brand} ${repair.model}
                        <div style="font-size:12px;color:#666;margin-top:3px;">
                            Released: ${utils.formatDateTime(repair.claimedAt)}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:14px;font-weight:bold;color:${statusColor};">
                            ${statusText}
                        </div>
                        <div style="font-size:12px;color:#999;">
                            Total: ₱${totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
                ${!isPaid ? `
                    <div style="margin-top:10px;display:flex;gap:8px;">
                        <button onclick="adminAddPaymentToReleased('${repair.id}')" class="btn btn-primary" style="flex:1;padding:6px 12px;font-size:13px;">
                            💰 Add Payment
                        </button>
                        <button onclick="adminUnreleaseDevice('${repair.id}')" class="btn btn-warning" style="flex:1;padding:6px 12px;font-size:13px;">
                            ↩️ Un-Release
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    return `
        <div class="form-group" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-top:20px;">
            <h4 style="margin:0 0 10px;">📦 Recently Released Devices (Last 7 Days)</h4>
            <p style="color:#666;font-size:13px;margin:0 0 15px;">
                Showing ${Math.min(recentlyReleased.length, 10)} of ${recentlyReleased.length} device(s)
            </p>
            <div style="max-height:400px;overflow-y:auto;">
                ${devicesHTML}
            </div>
        </div>
    `;
}

/**
 * Build Activity Logs Tab (Admin only)
 */
function buildActivityLogsTab(container) {
    console.log('📋 Building Activity Logs tab');
    window.currentTabRefresh = () => buildActivityLogsTab(document.getElementById('admin-logsTab'));
    
    if (!window.activityLogs || window.activityLogs.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3>📋 Activity Logs</h3>
                <p style="text-align:center;color:#999;padding:40px;">No activity logs yet...</p>
            </div>
        `;
        return;
    }
    
    // Sort logs by timestamp (newest first)
    const sortedLogs = [...window.activityLogs].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Get filter values (if any)
    const filterUser = window.logFilterUser || 'all';
    const filterAction = window.logFilterAction || 'all';
    const filterDate = window.logFilterDate || 'all';
    
    // Apply filters
    let filteredLogs = sortedLogs;
    
    if (filterUser !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.userId === filterUser);
    }
    
    if (filterAction !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(filterAction.toLowerCase()));
    }
    
    if (filterDate !== 'all') {
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate === filterDate;
        });
    }
    
    // Get unique users and actions for filters
    const uniqueUsers = [...new Set(sortedLogs.map(log => ({ id: log.userId, name: log.userName })))];
    const uniqueActions = [...new Set(sortedLogs.map(log => log.action))];
    
    // Generate action icon
    const getActionIcon = (action) => {
        if (action.includes('Login')) return '🔓';
        if (action.includes('Logout')) return '🔒';
        if (action.includes('Payment')) return '💰';
        if (action.includes('Expense')) return '🏪';
        if (action.includes('Device')) return '📱';
        if (action.includes('Repair')) return '🔧';
        if (action.includes('Lock') || action.includes('Unlock')) return '🔐';
        if (action.includes('Reset') || action.includes('Delete')) return '🗑️';
        if (action.includes('Verify')) return '✅';
        return '📝';
    };
    
    // Generate action color
    const getActionColor = (action) => {
        if (action.includes('Login')) return '#4caf50';
        if (action.includes('Logout')) return '#9e9e9e';
        if (action.includes('Payment')) return '#4caf50';
        if (action.includes('Expense')) return '#f44336';
        if (action.includes('Lock')) return '#2196f3';
        if (action.includes('Unlock')) return '#ff9800';
        if (action.includes('Reset') || action.includes('Delete')) return '#d32f2f';
        if (action.includes('Device')) return '#9c27b0';
        return '#757575';
    };
    
    // Pagination
    const logsPerPage = 50;
    const currentPage = window.logCurrentPage || 1;
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    container.innerHTML = `
        <div class="card">
            <h3>📋 Activity Logs</h3>
            
            <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:20px;">
                <strong>Total Logs:</strong> ${sortedLogs.length} activities
                ${filteredLogs.length !== sortedLogs.length ? `<span style="color:#2196f3;"> (${filteredLogs.length} shown after filters)</span>` : ''}
            </div>
            
            <!-- FILTERS -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by User</label>
                    <select id="logFilterUser" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                        <option value="all">All Users</option>
                        ${uniqueUsers.map(u => `
                            <option value="${u.id}" ${filterUser === u.id ? 'selected' : ''}>${u.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by Action</label>
                    <select id="logFilterAction" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                        <option value="all">All Actions</option>
                        ${uniqueActions.map(a => `
                            <option value="${a}" ${filterAction === a ? 'selected' : ''}>${getActionIcon(a)} ${a}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:5px;font-weight:bold;font-size:14px;">Filter by Date</label>
                    <input type="date" id="logFilterDate" value="${filterDate !== 'all' ? filterDate : ''}" onchange="applyLogFilters()" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:5px;">
                </div>
            </div>
            
            <button onclick="clearLogFilters()" class="btn btn-secondary" style="width:100%;margin-bottom:20px;">
                🔄 Clear All Filters
            </button>
            
            <!-- LOGS LIST -->
            <div style="max-height:600px;overflow-y:auto;">
                ${paginatedLogs.map(log => {
                    const actionColor = getActionColor(log.action);
                    const actionIcon = getActionIcon(log.action);
                    
                    return `
                        <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${actionColor};">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                                <div style="flex:1;">
                                    <div style="font-size:16px;font-weight:bold;color:${actionColor};margin-bottom:5px;">
                                        ${actionIcon} ${log.action}
                                    </div>
                                    <div style="font-size:14px;color:#666;margin-bottom:5px;">
                                        <strong>${log.userName}</strong> <span style="color:#999;">(${log.userRole})</span>
                                    </div>
                                    ${log.details ? `<div style="font-size:14px;color:#333;margin-bottom:5px;">${log.details}</div>` : ''}
                                </div>
                                <div style="text-align:right;min-width:150px;">
                                    <div style="font-size:12px;color:#999;">${utils.formatDateTime(log.timestamp)}</div>
                                    <div style="font-size:11px;color:#bbb;">${utils.timeAgo(log.timestamp)}</div>
                                </div>
                            </div>
                            
                            ${log.device ? `
                                <div style="background:#fff;padding:10px;border-radius:5px;font-size:12px;color:#666;">
                                    <strong>Device Info:</strong>
                                    ${log.device.deviceType} • ${log.device.os} • ${log.device.browser}
                                    ${log.device.screenResolution ? ` • ${log.device.screenResolution}` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- PAGINATION -->
            ${totalPages > 1 ? `
                <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:20px;padding-top:20px;border-top:1px solid #ddd;">
                    <button 
                        onclick="changeLogPage(${currentPage - 1})" 
                        ${currentPage === 1 ? 'disabled' : ''}
                        class="btn btn-secondary"
                        style="padding:8px 15px;">
                        ← Previous
                    </button>
                    
                    <div style="color:#666;font-size:14px;">
                        Page ${currentPage} of ${totalPages}
                    </div>
                    
                    <button 
                        onclick="changeLogPage(${currentPage + 1})" 
                        ${currentPage === totalPages ? 'disabled' : ''}
                        class="btn btn-secondary"
                        style="padding:8px 15px;">
                        Next →
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Apply log filters
 */
function applyLogFilters() {
    window.logFilterUser = document.getElementById('logFilterUser').value;
    window.logFilterAction = document.getElementById('logFilterAction').value;
    const dateInput = document.getElementById('logFilterDate').value;
    window.logFilterDate = dateInput || 'all';
    window.logCurrentPage = 1; // Reset to first page
    
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * Clear log filters
 */
function clearLogFilters() {
    window.logFilterUser = 'all';
    window.logFilterAction = 'all';
    window.logFilterDate = 'all';
    window.logCurrentPage = 1;
    
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

/**
 * Change log page
 */
function changeLogPage(page) {
    window.logCurrentPage = page;
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

// Toggle back job fields
function toggleBackJobFields() {
    const isBackJob = document.getElementById('isBackJob').checked;
    const backJobFields = document.getElementById('backJobFields');
    
    if (backJobFields) {
        backJobFields.style.display = isBackJob ? 'block' : 'none';
    }
}

/**
 * Toggle pre-approval pricing fields
 */
function togglePreApprovalFields() {
    const isChecked = document.getElementById('customerPreApproved').checked;
    const fieldsDiv = document.getElementById('preApprovalFields');
    
    if (fieldsDiv) {
        fieldsDiv.style.display = isChecked ? 'block' : 'none';
        
        // If unchecking, clear the fields
        if (!isChecked) {
            const repairTypeField = document.getElementById('preApprovedRepairType');
            const partsCostField = document.getElementById('preApprovedPartsCost');
            const laborCostField = document.getElementById('preApprovedLaborCost');
            const totalField = document.getElementById('preApprovedTotal');
            
            if (repairTypeField) repairTypeField.value = '';
            if (partsCostField) partsCostField.value = '0';
            if (laborCostField) laborCostField.value = '0';
            if (totalField) totalField.value = '0.00';
        }
    }
}

/**
 * Calculate pre-approved total (parts + labor)
 */
function calculatePreApprovedTotal() {
    const partsCost = parseFloat(document.getElementById('preApprovedPartsCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('preApprovedLaborCost').value) || 0;
    const total = partsCost + laborCost;
    
    const totalField = document.getElementById('preApprovedTotal');
    if (totalField) {
        totalField.value = total.toFixed(2);
    }
}

/**
 * Handle problem type selection
 */
function handleProblemTypeChange() {
    const problemType = document.getElementById('problemType')?.value;
    if (!problemType) return;
    
    const softwareWarning = document.getElementById('softwareWarningBox');
    const frpWarning = document.getElementById('frpWarningBox');
    
    const softwareIssues = ['FRP Lock', 'Password Lock', 'iCloud Lock', 'Software Restore', 
                            'Virus/Malware', 'OS Update', 'App Issues', 'Slow Performance', 
                            'Data Recovery', 'Other Software'];
    
    const lockIssues = ['FRP Lock', 'Password Lock', 'iCloud Lock'];
    
    if (softwareWarning) {
        softwareWarning.style.display = softwareIssues.includes(problemType) ? 'block' : 'none';
    }
    
    if (frpWarning) {
        frpWarning.style.display = lockIssues.includes(problemType) ? 'block' : 'none';
    }
}

/**
 * Build Claimed Units Page
 */
function buildClaimedUnitsPage(container) {
    console.log('✅ Building Claimed Units page');
    window.currentTabRefresh = () => buildClaimedUnitsPage(document.getElementById('claimedTab'));
    
    const claimedUnits = window.allRepairs.filter(r => r.claimedAt);
    claimedUnits.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));
    
    const role = window.currentUserData.role;
    
    container.innerHTML = `
        <div class="card">
            <h3>✅ Claimed Units - Released to Customers (${claimedUnits.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices that have been picked up by customers with warranty tracking</p>
            
            ${claimedUnits.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📭</h2>
                    <p>No claimed units yet</p>
                </div>
            ` : `
                <div>
                    ${claimedUnits.map(r => {
                        const warrantyEndDate = r.warrantyEndDate ? new Date(r.warrantyEndDate) : null;
                        const isWarrantyActive = warrantyEndDate && warrantyEndDate > new Date();
                        const daysSinceClaimed = Math.floor((new Date() - new Date(r.claimedAt)) / (1000 * 60 * 60 * 24));
                        
                        return `
                            <div class="repair-card" style="border-left:4px solid ${isWarrantyActive ? '#4caf50' : '#999'};">
                                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                                <span class="status-badge" style="background:#c8e6c9;color:#2e7d32;">✅ Claimed</span>
                                ${isWarrantyActive ? 
                                    '<span class="status-badge" style="background:#4caf50;color:white;">🛡️ Warranty Active</span>' : 
                                    '<span class="status-badge" style="background:#999;color:white;">⏰ Warranty Expired</span>'
                                }
                                
                                <div class="repair-info">
                                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                                    <div><strong>Problem Type:</strong> ${r.problemType || 'N/A'}</div>
                                    <div><strong>Repair:</strong> ${r.repairType || 'N/A'}</div>
                                    <div><strong>Technician:</strong> ${r.acceptedByName || 'N/A'}</div>
                                    <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                                </div>
                                
                                <div style="background:#f5f5f5;padding:12px;border-radius:5px;margin:10px 0;">
                                    <h4 style="margin:0 0 8px 0;color:#2e7d32;">📋 Claim & Warranty Info</h4>
                                    <div style="font-size:14px;">
                                        <div><strong>Claimed:</strong> ${utils.formatDateTime(r.claimedAt || r.releaseDate)} (${daysSinceClaimed} days ago)</div>
                                        <div><strong>Released By:</strong> ${r.releasedBy || 'N/A'}</div>
                                        ${r.warrantyPeriodDays ? `
                                            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
                                                <div><strong>🛡️ Warranty:</strong> ${r.warrantyPeriodDays} days</div>
                                                <div><strong>Expires:</strong> ${warrantyEndDate ? utils.formatDate(warrantyEndDate.toISOString()) : 'N/A'}</div>
                                                ${isWarrantyActive ? 
                                                    `<div style="color:#2e7d32;font-weight:bold;">✅ Active (${Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))} days left)</div>` :
                                                    '<div style="color:#999;font-weight:bold;">⏰ Expired</div>'
                                                }
                                            </div>
                                        ` : '<div style="color:#999;"><strong>Warranty:</strong> None</div>'}
                                    </div>
                                </div>
                                
                                ${r.verificationMethod === 'with-slip' ? `
                                    <div style="margin:10px 0;padding:10px;background:#e8f5e9;border-radius:5px;border-left:4px solid #4caf50;">
                                        <strong>✅ Verified with Service Slip</strong>
                                        ${r.serviceSlipPhoto ? '<div style="font-size:13px;color:#666;">📸 Slip photo on file</div>' : ''}
                                    </div>
                                ` : r.verificationMethod === 'without-slip' ? `
                                    <div style="margin:10px 0;padding:10px;background:#fff3cd;border-radius:5px;border-left:4px solid #ff9800;">
                                        <strong>⚠️ Released without Service Slip</strong>
                                        <div style="font-size:13px;margin-top:5px;">
                                            Enhanced verification performed<br>
                                            ${r.enhancedVerification ? `Address: ${r.enhancedVerification.address}` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${r.releasedWithBalance ? `
                                    <div style="margin:10px 0;padding:10px;background:#ffebee;border-radius:5px;border-left:4px solid #f44336;">
                                        <strong>⚠️ Released with Balance</strong>
                                        <div>Amount: ₱${r.releasedWithBalance.toFixed(2)}</div>
                                    </div>
                                ` : ''}
                                
                                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                                    ${(role === 'admin' || role === 'manager' || role === 'cashier') ? `
                                        <button class="btn-small" onclick="viewClaimDetails('${r.id}')" style="background:#2196f3;color:white;">
                                            📄 View Details
                                        </button>
                                    ` : ''}
                                    ${isWarrantyActive && (role === 'admin' || role === 'manager') ? `
                                        <button class="btn-small" onclick="openWarrantyClaimModal('${r.id}')" style="background:#ff9800;color:white;">
                                            🛡️ Warranty Claim
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}

// Export to global scope
window.buildTabs = buildTabs;
window.switchTab = switchTab;
window.buildReceivedDevicesPage = buildReceivedDevicesPage;
window.buildInProgressPage = buildInProgressPage;
window.buildForReleasePage = buildForReleasePage;
window.buildReceiveDeviceTab = buildReceiveDeviceTab;
window.buildMyRequestsTab = buildMyRequestsTab;
window.buildModificationRequestsTab = buildModificationRequestsTab;
window.buildUnpaidTab = buildUnpaidTab;
window.buildPendingPaymentsTab = buildPendingPaymentsTab;
window.buildPaidTab = buildPaidTab;
window.displayRepairsInContainer = displayRepairsInContainer;
window.buildAllRepairsTab = buildAllRepairsTab;
window.buildMyRepairsTab = buildMyRepairsTab;
window.buildPendingTab = buildPendingTab;
window.buildCashCountTab = buildCashCountTab;
window.updateCashCountDate = updateCashCountDate;
window.viewLockedDay = viewLockedDay;
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;
window.toggleBackJobFields = toggleBackJobFields;
window.togglePreApprovalFields = togglePreApprovalFields;
window.calculatePreApprovedTotal = calculatePreApprovedTotal;
window.buildClaimedUnitsPage = buildClaimedUnitsPage;
window.applyLogFilters = applyLogFilters;
window.clearLogFilters = clearLogFilters;
window.changeLogPage = changeLogPage;
window.handleProblemTypeChange = handleProblemTypeChange;

/**
 * Build Daily Remittance Tab (Technician)
 */
function buildDailyRemittanceTab(container) {
    console.log('💸 Building Daily Remittance tab');
    window.currentTabRefresh = () => buildDailyRemittanceTab(document.getElementById('remittanceTab'));
    
    const techId = window.currentUser.uid;
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Get today's data
    const { payments, total: paymentsTotal } = window.getTechDailyPayments(techId, today);
    const { expenses, total: expensesTotal } = window.getTechDailyExpenses(techId, today);
    const expectedAmount = paymentsTotal - expensesTotal;
    
    // Check if already submitted today
    const todayRemittance = window.techRemittances.find(r => {
        const remDate = new Date(r.date).toDateString();
        return r.techId === techId && remDate === todayStr;
    });
    
    // Get recent remittances
    const recentRemittances = window.techRemittances
        .filter(r => r.techId === techId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    container.innerHTML = `
        <div class="page-header">
            <h2>💸 Daily Cash Remittance</h2>
            <p>Track your collected payments and expenses, then submit daily remittance</p>
        </div>
        
        <!-- Today's Summary -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>₱${paymentsTotal.toFixed(2)}</h3>
                <p>💰 Payments Collected</p>
                <small>${payments.length} payment(s) today</small>
            </div>
            <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
                <h3>₱${expensesTotal.toFixed(2)}</h3>
                <p>💸 Expenses</p>
                <small>${expenses.length} expense(s) today</small>
            </div>
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>₱${expectedAmount.toFixed(2)}</h3>
                <p>💵 Expected Remittance</p>
                <small>Payments - Expenses</small>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="margin:20px 0;display:flex;gap:10px;flex-wrap:wrap;">
            <button onclick="openExpenseModal()" class="btn-primary">
                ➕ Record General Expense
            </button>
            ${(payments.length > 0 || expenses.length > 0) && !todayRemittance ? `
                <button onclick="openRemittanceModal()" class="btn-success">
                    📤 Submit Today's Remittance
                </button>
            ` : ''}
            ${payments.length === 0 && expenses.length > 0 && !todayRemittance ? `
                <p style="color:#ff9800;font-size:13px;margin:10px 0;">
                    ⚠️ Note: You can submit expense-only remittance (negative amount)
                </p>
            ` : ''}
        </div>
        
        ${todayRemittance ? `
            <div class="remittance-card" style="background:#${todayRemittance.status === 'approved' ? 'e8f5e9' : (todayRemittance.status === 'rejected' ? 'ffebee' : 'fff3e0')};border-left:4px solid #${todayRemittance.status === 'approved' ? '4caf50' : (todayRemittance.status === 'rejected' ? 'f44336' : 'ff9800')};padding:20px;border-radius:10px;margin:20px 0;">
                <h4>Today's Remittance Status</h4>
                <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
                    <span style="font-size:18px;font-weight:600;">₱${todayRemittance.actualAmount.toFixed(2)}</span>
                    <span class="status-badge" style="background:#${todayRemittance.status === 'approved' ? '4caf50' : (todayRemittance.status === 'rejected' ? 'f44336' : 'ff9800')};color:white;">
                        ${todayRemittance.status === 'approved' ? '✅ Approved' : (todayRemittance.status === 'rejected' ? '❌ Rejected' : '⏳ Pending')}
                    </span>
                </div>
                <p style="font-size:13px;color:#666;">
                    Submitted: ${utils.formatDateTime(todayRemittance.submittedAt)}
                </p>
                ${todayRemittance.verifiedBy ? `
                    <p style="font-size:13px;color:#666;">
                        Verified by: ${todayRemittance.verifiedBy} on ${utils.formatDateTime(todayRemittance.verifiedAt)}
                    </p>
                ` : ''}
                ${todayRemittance.verificationNotes ? `
                    <div style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.05);border-radius:5px;">
                        <strong>Verification Notes:</strong>
                        <p style="margin:5px 0 0 0;">${todayRemittance.verificationNotes}</p>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        <!-- Today's Payments -->
        <div class="card" style="margin:20px 0;">
            <h3>💰 Today's Collected Payments (${payments.length})</h3>
            ${payments.length > 0 ? `
                <div class="repairs-list">
                    ${payments.map(p => `
                        <div class="repair-card" style="border-left-color:#2196f3;">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div>
                                    <h4>${p.customerName}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        ${p.method} • ${utils.formatDateTime(p.recordedDate)}
                                    </p>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:20px;font-weight:600;color:#4caf50;">₱${p.amount.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No payments collected today</p>'}
        </div>
        
        <!-- Today's Expenses -->
        <div class="card" style="margin:20px 0;">
            <h3>💸 Today's Expenses (${expenses.length})</h3>
            ${expenses.length > 0 ? `
                <div class="repairs-list">
                    ${expenses.map(e => `
                        <div class="repair-card" style="border-left-color:#ff9800;">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${e.description}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        ${e.category} • ${e.type === 'repair-specific' ? 'Repair-Specific' : 'General'}
                                    </p>
                                    ${e.notes ? `<p style="font-size:12px;color:#999;margin-top:5px;">${e.notes}</p>` : ''}
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:600;color:#f44336;">-₱${e.amount.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No expenses recorded today</p>'}
        </div>
        
        <!-- Remittance History -->
        <div class="card" style="margin:20px 0;">
            <h3>📋 Remittance History</h3>
            ${recentRemittances.length > 0 ? `
                <div class="repairs-list">
                    ${recentRemittances.map(r => `
                        <div class="repair-card" style="border-left-color:#${r.status === 'approved' ? '4caf50' : (r.status === 'rejected' ? 'f44336' : 'ff9800')};">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${utils.formatDate(r.date)}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        ${r.paymentsList.length} payment(s) • ${r.expensesList.length} expense(s)
                                    </p>
                                    <p style="font-size:12px;color:#999;">
                                        Submitted: ${utils.formatDateTime(r.submittedAt)}
                                    </p>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:600;color:#4caf50;">₱${r.actualAmount.toFixed(2)}</div>
                                    <span class="status-badge" style="background:#${r.status === 'approved' ? '4caf50' : (r.status === 'rejected' ? 'f44336' : 'ff9800')};color:white;font-size:11px;">
                                        ${r.status === 'approved' ? '✅ Approved' : (r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending')}
                                    </span>
                                </div>
                            </div>
                            ${Math.abs(r.discrepancy) > 0.01 ? `
                                <div style="margin-top:10px;padding:8px;background:rgba(255,152,0,0.1);border-radius:5px;font-size:12px;">
                                    Discrepancy: ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No remittance history</p>'}
        </div>
    `;
}

/**
 * Build Remittance Verification Tab (Cashier/Admin/Manager)
 */
function buildRemittanceVerificationTab(container) {
    console.log('✅ Building Remittance Verification tab');
    window.currentTabRefresh = () => buildRemittanceVerificationTab(document.getElementById('verify-remittanceTab'));
    
    // Get pending remittances
    const pendingRemittances = window.techRemittances
        .filter(r => r.status === 'pending')
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Get recent verified remittances
    const recentVerified = window.techRemittances
        .filter(r => r.status === 'approved' || r.status === 'rejected')
        .sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt))
        .slice(0, 10);
    
    container.innerHTML = `
        <div class="page-header">
            <h2>✅ Verify Remittances</h2>
            <p>Review and approve technician cash remittances</p>
        </div>
        
        <!-- Pending Remittances -->
        <div class="card" style="margin:20px 0;">
            <h3>⏳ Pending Verification (${pendingRemittances.length})</h3>
            ${pendingRemittances.length > 0 ? `
                <div class="repairs-list">
                    ${pendingRemittances.map(r => {
                        const hasDiscrepancy = Math.abs(r.discrepancy) > 0.01;
                        const isLargeDiscrepancy = Math.abs(r.discrepancy) > r.expectedAmount * 0.05;
                        return `
                            <div class="remittance-card ${hasDiscrepancy ? (isLargeDiscrepancy ? 'discrepancy-danger' : 'discrepancy-warning') : ''}">
                                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:15px;">
                                    <div>
                                        <h4>${r.techName}</h4>
                                        <p style="font-size:13px;color:#666;">
                                            ${utils.formatDate(r.date)} • Submitted ${utils.timeAgo(r.submittedAt)}
                                        </p>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:20px;font-weight:600;color:#4caf50;">₱${r.actualAmount.toFixed(2)}</div>
                                        <span class="status-badge" style="background:#ff9800;color:white;">⏳ Pending</span>
                                    </div>
                                </div>
                                
                                <div class="remittance-summary">
                                    <div>
                                        <strong>Payments:</strong> ${r.paymentsList.length}<br>
                                        <span style="color:#4caf50;font-weight:600;">₱${r.totalPaymentsCollected.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <strong>Expenses:</strong> ${r.expensesList.length}<br>
                                        <span style="color:#f44336;font-weight:600;">-₱${r.totalExpenses.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <strong>Expected:</strong><br>
                                        <span style="font-weight:600;">₱${r.expectedAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                ${hasDiscrepancy ? `
                                    <div class="${isLargeDiscrepancy ? 'discrepancy-danger' : 'discrepancy-warning'}" style="margin:15px 0;">
                                        <strong>⚠️ Discrepancy: ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}</strong>
                                        ${r.discrepancyReason ? `
                                            <p style="margin:5px 0 0 0;font-size:13px;">Tech's note: ${r.discrepancyReason}</p>
                                        ` : ''}
                                    </div>
                                ` : `
                                    <div style="margin:15px 0;padding:10px;background:#e8f5e9;border-radius:5px;color:#2e7d32;">
                                        ✅ No discrepancy - Amount matches expected
                                    </div>
                                `}
                                
                                <button onclick="openVerifyRemittanceModal('${r.id}')" class="btn-primary" style="width:100%;margin-top:10px;">
                                    📋 Review & Verify
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No pending remittances</p>'}
        </div>
        
        <!-- Recent Verified -->
        <div class="card" style="margin:20px 0;">
            <h3>📋 Recently Verified (${recentVerified.length})</h3>
            ${recentVerified.length > 0 ? `
                <div class="repairs-list">
                    ${recentVerified.map(r => `
                        <div class="repair-card" style="border-left-color:#${r.status === 'approved' ? '4caf50' : 'f44336'};">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${r.techName}</h4>
                                    <p style="font-size:13px;color:#666;">
                                        ${utils.formatDate(r.date)} • ${r.paymentsList.length} payment(s)
                                    </p>
                                    <p style="font-size:12px;color:#999;">
                                        Verified by ${r.verifiedBy} • ${utils.formatDateTime(r.verifiedAt)}
                                    </p>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:18px;font-weight:600;">₱${r.actualAmount.toFixed(2)}</div>
                                    <span class="status-badge" style="background:#${r.status === 'approved' ? '4caf50' : 'f44336'};color:white;font-size:11px;">
                                        ${r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color:#999;text-align:center;padding:20px;">No verified remittances yet</p>'}
        </div>
    `;
}

/**
 * Build Technician Logs Tab (Admin/Cashier/Manager)
 */
function buildTechnicianLogsTab(container) {
    console.log('📊 Building Technician Logs tab');
    window.currentTabRefresh = () => buildTechnicianLogsTab(document.getElementById('tech-logsTab'));
    
    // Get all technicians
    const technicians = (window.allUsers || []).filter(u => u.role === 'technician');
    
    // Get selected technician from dropdown (or first one)
    const selectedTechId = window.selectedTechForLogs || (technicians.length > 0 ? technicians[0].id : null);
    
    if (technicians.length === 0) {
        container.innerHTML = `
            <div class="page-header">
                <h2>📊 Technician Logs</h2>
            </div>
            <div class="card">
                <p style="text-align:center;color:#999;padding:40px;">No technicians found in the system</p>
            </div>
        `;
        return;
    }
    
    const selectedTech = technicians.find(t => t.id === selectedTechId) || technicians[0];
    
    // Get date range (default: last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Filter data for selected technician
    const techPayments = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => p.receivedById === selectedTech.id))
        .map(r => {
            return r.payments
                .filter(p => p.receivedById === selectedTech.id)
                .map((p, idx) => ({
                    ...p,
                    repairId: r.id,
                    customerName: r.customerName,
                    paymentIndex: idx
                }));
        })
        .flat()
        .sort((a, b) => new Date(b.paymentDate || b.recordedDate) - new Date(a.paymentDate || a.recordedDate));
    
    const techExpenses = (window.techExpenses || [])
        .filter(e => e.techId === selectedTech.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const techRemittances = (window.techRemittances || [])
        .filter(r => r.techId === selectedTech.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const techJobs = window.allRepairs.filter(r => r.acceptedBy === selectedTech.id);
    const completedJobs = techJobs.filter(r => r.status === 'Completed' || r.status === 'Claimed');
    
    // Calculate totals
    const totalCollected = techPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = techExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRemitted = techRemittances
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.actualAmount, 0);
    const pendingRemittance = techPayments
        .filter(p => p.remittanceStatus === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
    
    container.innerHTML = `
        <div class="page-header">
            <h2>📊 Technician Transaction Logs</h2>
            <p>View detailed transaction history for each technician</p>
        </div>
        
        <!-- Technician Selector -->
        <div class="card" style="margin:20px 0;">
            <label style="font-weight:600;margin-bottom:10px;display:block;">Select Technician:</label>
            <select id="technicianSelector" onchange="selectTechnicianForLogs(this.value)" style="width:100%;max-width:400px;padding:10px;font-size:15px;">
                ${technicians.map(t => `
                    <option value="${t.id}" ${t.id === selectedTech.id ? 'selected' : ''}>
                        ${t.displayName} (${t.technicianName || 'N/A'})
                    </option>
                `).join('')}
            </select>
        </div>
        
        <!-- Summary Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0;">
            <div class="stat-card" style="background:#e8f5e9;border-left:4px solid #4caf50;">
                <h3>₱${totalCollected.toFixed(2)}</h3>
                <p>💰 Total Collected</p>
                <small>${techPayments.length} payment(s)</small>
            </div>
            <div class="stat-card" style="background:#ffebee;border-left:4px solid #f44336;">
                <h3>₱${totalExpenses.toFixed(2)}</h3>
                <p>💸 Total Expenses</p>
                <small>${techExpenses.length} expense(s)</small>
            </div>
            <div class="stat-card" style="background:#e3f2fd;border-left:4px solid #2196f3;">
                <h3>₱${totalRemitted.toFixed(2)}</h3>
                <p>✅ Total Remitted</p>
                <small>${techRemittances.filter(r => r.status === 'approved').length} approved</small>
            </div>
            <div class="stat-card" style="background:#fff3e0;border-left:4px solid #ff9800;">
                <h3>₱${pendingRemittance.toFixed(2)}</h3>
                <p>⏳ Pending Remittance</p>
                <small>Not yet submitted</small>
            </div>
            <div class="stat-card" style="background:#f3e5f5;border-left:4px solid #9c27b0;">
                <h3>${techJobs.length}</h3>
                <p>🔧 Total Jobs</p>
                <small>${completedJobs.length} completed</small>
            </div>
        </div>
        
        <!-- Payments Collected -->
        <div class="card" style="margin:20px 0;">
            <h3>💰 Payments Collected (${techPayments.length})</h3>
            ${techPayments.length > 0 ? `
                <div style="max-height:400px;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="background:#f5f5f5;position:sticky;top:0;">
                            <tr>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Date</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Customer</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Method</th>
                                <th style="padding:10px;text-align:right;border-bottom:2px solid #ddd;">Amount</th>
                                <th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${techPayments.map(p => `
                                <tr style="border-bottom:1px solid #eee;">
                                    <td style="padding:10px;">${utils.formatDate(p.paymentDate || p.recordedDate)}</td>
                                    <td style="padding:10px;">${p.customerName}</td>
                                    <td style="padding:10px;">${p.method}</td>
                                    <td style="padding:10px;text-align:right;font-weight:600;color:#4caf50;">₱${p.amount.toFixed(2)}</td>
                                    <td style="padding:10px;text-align:center;">
                                        ${p.remittanceStatus === 'verified' ? '<span style="color:#4caf50;">✅ Verified</span>' : 
                                          p.remittanceStatus === 'remitted' ? '<span style="color:#ff9800;">📤 Remitted</span>' : 
                                          '<span style="color:#999;">⏳ Pending</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No payments collected</p>'}
        </div>
        
        <!-- Expenses Recorded -->
        <div class="card" style="margin:20px 0;">
            <h3>💸 Expenses Recorded (${techExpenses.length})</h3>
            ${techExpenses.length > 0 ? `
                <div style="max-height:400px;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="background:#f5f5f5;position:sticky;top:0;">
                            <tr>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Date</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Category</th>
                                <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Description</th>
                                <th style="padding:10px;text-align:right;border-bottom:2px solid #ddd;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${techExpenses.map(e => `
                                <tr style="border-bottom:1px solid #eee;">
                                    <td style="padding:10px;">${utils.formatDate(e.date)}</td>
                                    <td style="padding:10px;">${e.category}</td>
                                    <td style="padding:10px;">${e.description}</td>
                                    <td style="padding:10px;text-align:right;font-weight:600;color:#f44336;">-₱${e.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No expenses recorded</p>'}
        </div>
        
        <!-- Remittances Submitted -->
        <div class="card" style="margin:20px 0;">
            <h3>📤 Remittances Submitted (${techRemittances.length})</h3>
            ${techRemittances.length > 0 ? `
                <div class="repairs-list">
                    ${techRemittances.map(r => `
                        <div class="repair-card" style="border-left-color:${r.status === 'approved' ? '#4caf50' : (r.status === 'rejected' ? '#f44336' : '#ff9800')};">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <h4>${utils.formatDate(r.date)}</h4>
                                    <div style="font-size:13px;color:#666;line-height:1.6;margin-top:5px;">
                                        <div><strong>Payments:</strong> ₱${r.totalPaymentsCollected.toFixed(2)} (${r.paymentsList.length})</div>
                                        <div><strong>Expenses:</strong> ₱${r.totalExpenses.toFixed(2)} (${r.expensesList.length})</div>
                                        <div><strong>Expected:</strong> ₱${r.expectedAmount.toFixed(2)}</div>
                                        <div><strong>Actual:</strong> ₱${r.actualAmount.toFixed(2)}</div>
                                        ${Math.abs(r.discrepancy) > 0.01 ? `
                                            <div style="color:#ff9800;font-weight:600;">
                                                <strong>Discrepancy:</strong> ${r.discrepancy > 0 ? '+' : ''}₱${r.discrepancy.toFixed(2)}
                                            </div>
                                        ` : ''}
                                        <div style="font-size:11px;color:#999;margin-top:5px;">
                                            Submitted: ${utils.formatDateTime(r.submittedAt)}
                                        </div>
                                        ${r.verifiedBy ? `
                                            <div style="font-size:11px;color:#999;">
                                                Verified by: ${r.verifiedBy} on ${utils.formatDateTime(r.verifiedAt)}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div>
                                    <span class="status-badge" style="background:${r.status === 'approved' ? '#4caf50' : (r.status === 'rejected' ? '#f44336' : '#ff9800')};color:white;">
                                        ${r.status === 'approved' ? '✅ Approved' : (r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="text-align:center;color:#999;padding:20px;">No remittances submitted</p>'}
        </div>
        
        <!-- Job Performance -->
        <div class="card" style="margin:20px 0;">
            <h3>🔧 Job Performance</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:15px;">
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#667eea;">${techJobs.length}</div>
                    <div style="font-size:13px;color:#666;">Total Jobs</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#4caf50;">${completedJobs.length}</div>
                    <div style="font-size:13px;color:#666;">Completed</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#ff9800;">${techJobs.filter(r => r.status === 'In Progress' || r.status === 'Waiting for Parts').length}</div>
                    <div style="font-size:13px;color:#666;">In Progress</div>
                </div>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                    <div style="font-size:24px;font-weight:600;color:#2196f3;">${techJobs.filter(r => r.status === 'Ready for Pickup').length}</div>
                    <div style="font-size:13px;color:#666;">Ready</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Select technician for logs
 */
function selectTechnicianForLogs(techId) {
    window.selectedTechForLogs = techId;
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

// ===== INVENTORY MANAGEMENT TAB =====

/**
 * Build Inventory Management Tab
 */
function buildInventoryTab(container) {
    window.currentTabRefresh = () => buildInventoryTab(document.getElementById('inventoryTab'));
    
    const role = window.currentUserData.role;
    const canManage = role === 'admin' || role === 'manager';
    
    // Get low stock items
    const lowStockItems = getLowStockItems();
    const outOfStockItems = getOutOfStockItems();
    
    // Filter active items
    const activeItems = window.allInventoryItems.filter(item => !item.deleted);
    
    // Calculate total value
    const totalValue = activeItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitCost), 0
    );
    
    let html = `
        <div style="margin-bottom:20px;">
            <h2>📦 Inventory Management</h2>
            <p class="text-secondary">Track parts, manage stock levels, and monitor inventory</p>
        </div>
    `;
    
    // Low Stock Alerts
    if (lowStockItems.length > 0) {
        html += `
            <div class="alert-box" style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin-bottom:20px;border-radius:8px;">
                <h3 style="margin:0 0 10px;color:#856404;">⚠️ Low Stock Alert</h3>
                <p style="margin:0;color:#856404;">
                    ${lowStockItems.length} item(s) are running low on stock.
                    ${outOfStockItems.length > 0 ? `<strong>${outOfStockItems.length} out of stock!</strong>` : ''}
                </p>
            </div>
        `;
    }
    
    // Inventory Summary Stats
    html += `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:25px;">
            <div class="stat-card" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Items</div>
                <div style="font-size:32px;font-weight:bold;">${activeItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Low Stock</div>
                <div style="font-size:32px;font-weight:bold;">${lowStockItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Out of Stock</div>
                <div style="font-size:32px;font-weight:bold;">${outOfStockItems.length}</div>
            </div>
            <div class="stat-card" style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);color:white;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size:14px;opacity:0.9;margin-bottom:5px;">Total Value</div>
                <div style="font-size:32px;font-weight:bold;">₱${totalValue.toLocaleString()}</div>
            </div>
        </div>
    `;
    
    // Action Buttons
    html += `
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    `;
    
    if (canManage) {
        html += `
            <button onclick="openAddInventoryItemModal()" class="btn-primary">
                ➕ Add New Part
            </button>
            <button onclick="openAddSupplierModal()" class="btn-secondary">
                📊 Manage Suppliers
            </button>
        `;
    }
    
    html += `
            <button onclick="filterInventory('all')" class="btn-secondary" id="filterAll">
                📋 All Items
            </button>
            <button onclick="filterInventory('lowstock')" class="btn-secondary" id="filterLowStock">
                ⚠️ Low Stock
            </button>
            <button onclick="filterInventory('outofstock')" class="btn-secondary" id="filterOutOfStock">
                🔴 Out of Stock
            </button>
            <button onclick="viewStockMovementsReport()" class="btn-secondary">
                📊 Stock Movements
            </button>
        </div>
    `;
    
    // Search and Filter
    html += `
        <div style="margin-bottom:20px;">
            <input type="text" 
                   id="inventorySearch" 
                   placeholder="🔍 Search parts by name, number, brand, or model..." 
                   style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
                   oninput="filterInventoryTable()">
        </div>
    `;
    
    // Inventory Table
    html += `
        <div style="overflow-x:auto;">
            <table class="repair-table" id="inventoryTable">
                <thead>
                    <tr>
                        <th>Part Name</th>
                        <th>Part Number</th>
                        <th>Category</th>
                        <th>Brand/Model</th>
                        <th>Quantity</th>
                        <th>Min Stock</th>
                        <th>Unit Cost</th>
                        <th>Selling Price</th>
                        <th>Total Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="inventoryTableBody">
    `;
    
    if (activeItems.length === 0) {
        html += `
            <tr>
                <td colspan="10" style="text-align:center;padding:40px;">
                    <div style="font-size:48px;margin-bottom:10px;">📦</div>
                    <div class="text-secondary">No inventory items yet</div>
                    ${canManage ? '<div style="margin-top:10px;"><button onclick="openAddInventoryItemModal()" class="btn-primary">Add First Item</button></div>' : ''}
                </td>
            </tr>
        `;
    } else {
        // Sort by name
        activeItems.sort((a, b) => a.partName.localeCompare(b.partName));
        
        activeItems.forEach(item => {
            const isLowStock = item.quantity <= item.minStockLevel;
            const isOutOfStock = item.quantity === 0;
            const totalValue = item.quantity * item.unitCost;
            
            let stockBadge = '';
            if (isOutOfStock) {
                stockBadge = '<span class="status-badge" style="background:#f44336;">Out of Stock</span>';
            } else if (isLowStock) {
                stockBadge = '<span class="status-badge" style="background:#ff9800;">Low Stock</span>';
            } else {
                stockBadge = '<span class="status-badge" style="background:#4caf50;">In Stock</span>';
            }
            
            html += `
                <tr class="inventory-row" data-item-id="${item.id}" data-name="${item.partName.toLowerCase()}" data-number="${item.partNumber.toLowerCase()}" data-brand="${(item.brand || '').toLowerCase()}" data-model="${(item.model || '').toLowerCase()}" data-category="${item.category.toLowerCase()}">
                    <td><strong>${item.partName}</strong></td>
                    <td><code>${item.partNumber}</code></td>
                    <td>${item.category}</td>
                    <td class="text-secondary">${item.brand || 'N/A'} ${item.model || ''}</td>
                    <td>
                        <strong style="font-size:16px;${isOutOfStock ? 'color:#f44336;' : isLowStock ? 'color:#ff9800;' : 'color:#4caf50;'}">${item.quantity}</strong>
                        ${stockBadge}
                    </td>
                    <td class="text-secondary">${item.minStockLevel}</td>
                    <td>₱${item.unitCost.toLocaleString()}</td>
                    <td>₱${item.sellingPrice.toLocaleString()}</td>
                    <td><strong>₱${totalValue.toLocaleString()}</strong></td>
                    <td>
                        <button onclick="adjustStockModal('${item.id}')" class="btn-small" title="Adjust Stock">
                            📊 Stock
                        </button>
                        ${canManage ? `
                        <button onclick="editInventoryItemModal('${item.id}')" class="btn-small" title="Edit">
                            ✏️
                        </button>
                        <button onclick="deleteInventoryItem('${item.id}')" class="btn-small btn-danger" title="Delete">
                            🗑️
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Filter inventory table by search
 */
function filterInventoryTable() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const rows = document.querySelectorAll('.inventory-row');
    
    rows.forEach(row => {
        const name = row.dataset.name;
        const number = row.dataset.number;
        const brand = row.dataset.brand;
        const model = row.dataset.model;
        const category = row.dataset.category;
        
        const matches = name.includes(searchTerm) || 
                        number.includes(searchTerm) || 
                        brand.includes(searchTerm) || 
                        model.includes(searchTerm) ||
                        category.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
}

/**
 * Filter inventory by status
 */
function filterInventory(filter) {
    const allItems = window.allInventoryItems.filter(item => !item.deleted);
    let filteredItems = [];
    
    if (filter === 'lowstock') {
        filteredItems = getLowStockItems();
    } else if (filter === 'outofstock') {
        filteredItems = getOutOfStockItems();
    } else {
        filteredItems = allItems;
    }
    
    // Update button states
    document.querySelectorAll('[id^="filter"]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Show/hide rows
    const rows = document.querySelectorAll('.inventory-row');
    rows.forEach(row => {
        const itemId = row.dataset.itemId;
        const shouldShow = filteredItems.some(item => item.id === itemId);
        row.style.display = shouldShow ? '' : 'none';
    });
}

/**
 * Open Add Inventory Item Modal
 */
function openAddInventoryItemModal() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '➕ Add New Part';
    
    // Get suppliers for dropdown
    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);
    
    modalContent.innerHTML = `
        <form onsubmit="submitAddInventoryItem(event)" id="addInventoryForm">
            <div class="form-group">
                <label>Part Name *</label>
                <input type="text" name="partName" required placeholder="e.g. iPhone 12 Screen">
            </div>
            
            <div class="form-group">
                <label>Part Number *</label>
                <input type="text" name="partNumber" required placeholder="e.g. IP12-SCR-001">
            </div>
            
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required>
                    <option value="">Select category</option>
                    <option value="Screen">Screen/Display</option>
                    <option value="Battery">Battery</option>
                    <option value="Charging Port">Charging Port</option>
                    <option value="Camera">Camera</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Microphone">Microphone</option>
                    <option value="Button">Button</option>
                    <option value="Housing">Housing/Body</option>
                    <option value="Motherboard">Motherboard</option>
                    <option value="Connector">Connector/Flex Cable</option>
                    <option value="Tool">Tool/Equipment</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" name="brand" placeholder="e.g. Apple">
                </div>
                
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" name="model" placeholder="e.g. iPhone 12">
                </div>
            </div>
            
            <div class="form-group">
                <label>Supplier</label>
                <select name="supplier">
                    <option value="">None</option>
                    ${activeSuppliers.map(s => `<option value="${s.supplierName}">${s.supplierName}</option>`).join('')}
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Initial Quantity *</label>
                    <input type="number" name="quantity" required min="0" value="0">
                </div>
                
                <div class="form-group">
                    <label>Min Stock Level *</label>
                    <input type="number" name="minStockLevel" required min="1" value="5">
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Unit Cost (₱) *</label>
                    <input type="number" name="unitCost" required min="0" step="0.01" value="0">
                </div>
                
                <div class="form-group">
                    <label>Selling Price (₱) *</label>
                    <input type="number" name="sellingPrice" required min="0" step="0.01" value="0">
                </div>
            </div>
            
            <div class="form-group">
                <label>Storage Location</label>
                <input type="text" name="location" placeholder="e.g. Shelf A, Bin 3">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2" placeholder="Additional notes..."></textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Add Part</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit Add Inventory Item
 */
async function submitAddInventoryItem(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const itemData = {
        partName: formData.get('partName'),
        partNumber: formData.get('partNumber'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        supplier: formData.get('supplier'),
        quantity: parseInt(formData.get('quantity')),
        minStockLevel: parseInt(formData.get('minStockLevel')),
        unitCost: parseFloat(formData.get('unitCost')),
        sellingPrice: parseFloat(formData.get('sellingPrice')),
        location: formData.get('location'),
        notes: formData.get('notes')
    };
    
    try {
        await addInventoryItem(itemData);
        closeUserModal();
    } catch (error) {
        // Error handling done in addInventoryItem
    }
}

/**
 * Edit Inventory Item Modal
 */
function editInventoryItemModal(itemId) {
    const item = window.allInventoryItems.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found');
        return;
    }
    
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '✏️ Edit Part';
    
    // Get suppliers for dropdown
    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);
    
    modalContent.innerHTML = `
        <form onsubmit="submitEditInventoryItem(event, '${itemId}')" id="editInventoryForm">
            <div class="form-group">
                <label>Part Name *</label>
                <input type="text" name="partName" required value="${item.partName}">
            </div>
            
            <div class="form-group">
                <label>Part Number *</label>
                <input type="text" name="partNumber" required value="${item.partNumber}">
            </div>
            
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required>
                    <option value="Screen" ${item.category === 'Screen' ? 'selected' : ''}>Screen/Display</option>
                    <option value="Battery" ${item.category === 'Battery' ? 'selected' : ''}>Battery</option>
                    <option value="Charging Port" ${item.category === 'Charging Port' ? 'selected' : ''}>Charging Port</option>
                    <option value="Camera" ${item.category === 'Camera' ? 'selected' : ''}>Camera</option>
                    <option value="Speaker" ${item.category === 'Speaker' ? 'selected' : ''}>Speaker</option>
                    <option value="Microphone" ${item.category === 'Microphone' ? 'selected' : ''}>Microphone</option>
                    <option value="Button" ${item.category === 'Button' ? 'selected' : ''}>Button</option>
                    <option value="Housing" ${item.category === 'Housing' ? 'selected' : ''}>Housing/Body</option>
                    <option value="Motherboard" ${item.category === 'Motherboard' ? 'selected' : ''}>Motherboard</option>
                    <option value="Connector" ${item.category === 'Connector' ? 'selected' : ''}>Connector/Flex Cable</option>
                    <option value="Tool" ${item.category === 'Tool' ? 'selected' : ''}>Tool/Equipment</option>
                    <option value="Accessory" ${item.category === 'Accessory' ? 'selected' : ''}>Accessory</option>
                    <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Brand</label>
                    <input type="text" name="brand" value="${item.brand || ''}">
                </div>
                
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" name="model" value="${item.model || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Supplier</label>
                <select name="supplier">
                    <option value="">None</option>
                    ${activeSuppliers.map(s => `<option value="${s.supplierName}" ${item.supplier === s.supplierName ? 'selected' : ''}>${s.supplierName}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Min Stock Level *</label>
                <input type="number" name="minStockLevel" required min="1" value="${item.minStockLevel}">
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="form-group">
                    <label>Unit Cost (₱) *</label>
                    <input type="number" name="unitCost" required min="0" step="0.01" value="${item.unitCost}">
                </div>
                
                <div class="form-group">
                    <label>Selling Price (₱) *</label>
                    <input type="number" name="sellingPrice" required min="0" step="0.01" value="${item.sellingPrice}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Storage Location</label>
                <input type="text" name="location" value="${item.location || ''}">
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2">${item.notes || ''}</textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Save Changes</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit Edit Inventory Item
 */
async function submitEditInventoryItem(e, itemId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const updates = {
        partName: formData.get('partName'),
        partNumber: formData.get('partNumber'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        supplier: formData.get('supplier'),
        minStockLevel: parseInt(formData.get('minStockLevel')),
        unitCost: parseFloat(formData.get('unitCost')),
        sellingPrice: parseFloat(formData.get('sellingPrice')),
        location: formData.get('location'),
        notes: formData.get('notes')
    };
    
    try {
        await updateInventoryItem(itemId, updates);
        closeUserModal();
    } catch (error) {
        // Error handling done in updateInventoryItem
    }
}

/**
 * Adjust Stock Modal
 */
function adjustStockModal(itemId) {
    const item = window.allInventoryItems.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found');
        return;
    }
    
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '📊 Adjust Stock';
    
    modalContent.innerHTML = `
        <div style="margin-bottom:20px;padding:15px;background:var(--bg-secondary);border-radius:8px;">
            <h3 style="margin:0 0 5px;">${item.partName}</h3>
            <p class="text-secondary" style="margin:0;">Part #: ${item.partNumber}</p>
            <p style="margin:10px 0 0;font-size:24px;font-weight:bold;">Current Stock: ${item.quantity}</p>
        </div>
        
        <form onsubmit="submitStockAdjustment(event, '${itemId}')" id="adjustStockForm">
            <div class="form-group">
                <label>Adjustment Type *</label>
                <select name="adjustmentType" id="adjustmentType" onchange="updateAdjustmentLabel()" required>
                    <option value="">Select type</option>
                    <option value="add">➕ Add Stock (Received from supplier)</option>
                    <option value="remove">➖ Remove Stock (Used/Damaged/Returned)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label id="quantityLabel">Quantity *</label>
                <input type="number" name="quantity" id="adjustQuantity" required min="1" value="1">
            </div>
            
            <div class="form-group">
                <label>Reason *</label>
                <textarea name="reason" rows="2" required placeholder="Why are you adjusting the stock?"></textarea>
            </div>
            
            <div id="newStockPreview" style="margin:15px 0;padding:15px;background:var(--bg-hover);border-radius:8px;display:none;">
                <p style="margin:0;"><strong>New Stock Level:</strong> <span id="newStockValue">0</span></p>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Adjust Stock</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
        
        <script>
            // Update preview when quantity or type changes
            document.getElementById('adjustQuantity').addEventListener('input', updateStockPreview);
            document.getElementById('adjustmentType').addEventListener('change', updateStockPreview);
            
            function updateStockPreview() {
                const type = document.getElementById('adjustmentType').value;
                const qty = parseInt(document.getElementById('adjustQuantity').value) || 0;
                const currentStock = ${item.quantity};
                
                if (type && qty > 0) {
                    const newStock = type === 'add' ? currentStock + qty : currentStock - qty;
                    document.getElementById('newStockValue').textContent = newStock;
                    document.getElementById('newStockPreview').style.display = 'block';
                    
                    if (newStock < 0) {
                        document.getElementById('newStockValue').style.color = '#f44336';
                        document.getElementById('newStockValue').textContent = newStock + ' (Cannot be negative!)';
                    } else {
                        document.getElementById('newStockValue').style.color = newStock <= ${item.minStockLevel} ? '#ff9800' : '#4caf50';
                    }
                } else {
                    document.getElementById('newStockPreview').style.display = 'none';
                }
            }
            
            function updateAdjustmentLabel() {
                const type = document.getElementById('adjustmentType').value;
                const label = document.getElementById('quantityLabel');
                
                if (type === 'add') {
                    label.textContent = 'Quantity to Add *';
                } else if (type === 'remove') {
                    label.textContent = 'Quantity to Remove *';
                } else {
                    label.textContent = 'Quantity *';
                }
            }
        </script>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit Stock Adjustment
 */
async function submitStockAdjustment(e, itemId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const type = formData.get('adjustmentType');
    const quantity = parseInt(formData.get('quantity'));
    const reason = formData.get('reason');
    
    const adjustment = type === 'add' ? quantity : -quantity;
    
    try {
        await adjustStock(itemId, adjustment, reason);
        closeUserModal();
    } catch (error) {
        // Error handling done in adjustStock
    }
}

/**
 * Open Add Supplier Modal
 */
function openAddSupplierModal() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '📊 Manage Suppliers';
    
    const activeSuppliers = window.allSuppliers.filter(s => !s.deleted);
    
    modalContent.innerHTML = `
        <div style="margin-bottom:20px;">
            <button onclick="showAddSupplierForm()" class="btn-primary">➕ Add New Supplier</button>
        </div>
        
        <div id="supplierFormContainer" style="display:none;"></div>
        
        <h4>Existing Suppliers</h4>
        <div id="suppliersList">
            ${activeSuppliers.length === 0 ? '<p class="text-secondary">No suppliers added yet</p>' : ''}
            ${activeSuppliers.map(supplier => `
                <div style="padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:10px;">
                    <h4 style="margin:0 0 10px;">${supplier.supplierName}</h4>
                    ${supplier.contactPerson ? `<p style="margin:5px 0;"><strong>Contact:</strong> ${supplier.contactPerson}</p>` : ''}
                    ${supplier.phone ? `<p style="margin:5px 0;"><strong>Phone:</strong> ${supplier.phone}</p>` : ''}
                    ${supplier.email ? `<p style="margin:5px 0;"><strong>Email:</strong> ${supplier.email}</p>` : ''}
                    ${supplier.address ? `<p style="margin:5px 0;"><strong>Address:</strong> ${supplier.address}</p>` : ''}
                    <div style="margin-top:10px;">
                        <button onclick="editSupplierForm('${supplier.id}')" class="btn-small">✏️ Edit</button>
                        <button onclick="deleteSupplier('${supplier.id}')" class="btn-small btn-danger">🗑️ Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top:20px;">
            <button type="button" onclick="closeUserModal()" class="btn-secondary" style="width:100%;">Close</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

/**
 * Show Add Supplier Form
 */
function showAddSupplierForm() {
    const container = document.getElementById('supplierFormContainer');
    
    container.innerHTML = `
        <form onsubmit="submitAddSupplier(event)" id="addSupplierForm" style="padding:15px;background:var(--bg-hover);border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 15px;">New Supplier</h4>
            
            <div class="form-group">
                <label>Supplier Name *</label>
                <input type="text" name="supplierName" required>
            </div>
            
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contactPerson">
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email">
            </div>
            
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2"></textarea>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Add Supplier</button>
                <button type="button" onclick="hideSupplierForm()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
}

/**
 * Hide Supplier Form
 */
function hideSupplierForm() {
    document.getElementById('supplierFormContainer').style.display = 'none';
    document.getElementById('supplierFormContainer').innerHTML = '';
}

/**
 * Submit Add Supplier
 */
async function submitAddSupplier(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const supplierData = {
        supplierName: formData.get('supplierName'),
        contactPerson: formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        notes: formData.get('notes')
    };
    
    try {
        await addSupplier(supplierData);
        // Refresh modal content
        openAddSupplierModal();
    } catch (error) {
        // Error handling done in addSupplier
    }
}

/**
 * Edit Supplier Form
 */
function editSupplierForm(supplierId) {
    const supplier = window.allSuppliers.find(s => s.id === supplierId);
    
    if (!supplier) {
        alert('Supplier not found');
        return;
    }
    
    const container = document.getElementById('supplierFormContainer');
    
    container.innerHTML = `
        <form onsubmit="submitEditSupplier(event, '${supplierId}')" id="editSupplierForm" style="padding:15px;background:var(--bg-hover);border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 15px;">Edit Supplier</h4>
            
            <div class="form-group">
                <label>Supplier Name *</label>
                <input type="text" name="supplierName" required value="${supplier.supplierName}">
            </div>
            
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contactPerson" value="${supplier.contactPerson || ''}">
            </div>
            
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value="${supplier.phone || ''}">
            </div>
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${supplier.email || ''}">
            </div>
            
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2">${supplier.address || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2">${supplier.notes || ''}</textarea>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Save Changes</button>
                <button type="button" onclick="hideSupplierForm()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
}

/**
 * Submit Edit Supplier
 */
async function submitEditSupplier(e, supplierId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const updates = {
        supplierName: formData.get('supplierName'),
        contactPerson: formData.get('contactPerson'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        notes: formData.get('notes')
    };
    
    try {
        await updateSupplier(supplierId, updates);
        // Refresh modal content
        openAddSupplierModal();
    } catch (error) {
        // Error handling done in updateSupplier
    }
}

/**
 * Open Use Parts Modal for a Repair
 */
function openUsePartsModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '🔧 Use Parts from Inventory';
    
    // Get available inventory items (in stock only)
    const availableItems = window.allInventoryItems.filter(item => 
        !item.deleted && item.quantity > 0
    ).sort((a, b) => a.partName.localeCompare(b.partName));
    
    // Get already used parts
    const usedParts = repair.partsUsed ? Object.values(repair.partsUsed) : [];
    
    modalContent.innerHTML = `
        <div style="margin-bottom:20px;padding:15px;background:var(--bg-secondary);border-radius:8px;">
            <h4 style="margin:0 0 5px;">${repair.customerName} - ${repair.brand} ${repair.model}</h4>
            <p class="text-secondary" style="margin:0;">Repair: ${repair.repairType || 'Pending Diagnosis'}</p>
        </div>
        
        ${usedParts.length > 0 ? `
            <div style="margin-bottom:20px;padding:15px;background:#e8f5e9;border-radius:8px;">
                <h4 style="margin:0 0 10px;color:#2e7d32;">✅ Parts Already Used</h4>
                ${usedParts.map(part => `
                    <div style="padding:8px;background:white;border-radius:4px;margin-bottom:5px;">
                        <strong>${part.partName}</strong> <span class="text-secondary">(${part.partNumber})</span>
                        <div style="font-size:12px;color:#666;">Qty: ${part.quantity} | Cost: ₱${part.totalCost.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <form onsubmit="submitUseParts(event, '${repairId}')" id="usePartsForm">
            <div class="form-group">
                <label>Select Part *</label>
                <select name="partId" id="selectedPart" onchange="updatePartDetails()" required>
                    <option value="">-- Select a part --</option>
                    ${availableItems.map(item => `
                        <option value="${item.id}" 
                                data-name="${item.partName}" 
                                data-number="${item.partNumber}"
                                data-stock="${item.quantity}"
                                data-cost="${item.unitCost}">
                            ${item.partName} (${item.partNumber}) - Stock: ${item.quantity}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div id="partDetailsBox" style="display:none;padding:15px;background:var(--bg-light);border-radius:8px;margin-bottom:15px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                    <div>
                        <strong>Part Number:</strong>
                        <div id="displayPartNumber" class="text-secondary"></div>
                    </div>
                    <div>
                        <strong>Available Stock:</strong>
                        <div id="displayStock" style="color:#4caf50;font-weight:bold;"></div>
                    </div>
                </div>
                <div>
                    <strong>Unit Cost:</strong>
                    <div id="displayCost" style="color:#2196f3;font-weight:bold;"></div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" name="quantity" id="partQuantity" required min="1" value="1" 
                       oninput="updateTotalCost()">
                <small class="text-secondary">How many units are being used?</small>
            </div>
            
            <div id="totalCostBox" style="display:none;padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:15px;">
                <strong>Total Parts Cost:</strong>
                <div id="displayTotalCost" style="font-size:24px;font-weight:bold;color:#2196f3;margin-top:5px;"></div>
            </div>
            
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea name="notes" rows="2" placeholder="Any special notes about this part usage..."></textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Use Part</button>
                <button type="button" onclick="closeUserModal()" class="btn-secondary" style="flex:1;">Cancel</button>
            </div>
        </form>
        
        ${availableItems.length === 0 ? `
            <div style="margin-top:20px;padding:20px;background:#fff3cd;border-radius:8px;text-align:center;">
                <strong>⚠️ No parts available in inventory</strong>
                <p class="text-secondary" style="margin:10px 0 0;">All parts are out of stock. Please restock inventory first.</p>
            </div>
        ` : ''}
        
        <script>
            function updatePartDetails() {
                const select = document.getElementById('selectedPart');
                const selectedOption = select.options[select.selectedIndex];
                
                if (!selectedOption.value) {
                    document.getElementById('partDetailsBox').style.display = 'none';
                    document.getElementById('totalCostBox').style.display = 'none';
                    return;
                }
                
                const partNumber = selectedOption.dataset.number;
                const stock = selectedOption.dataset.stock;
                const cost = parseFloat(selectedOption.dataset.cost);
                
                document.getElementById('displayPartNumber').textContent = partNumber;
                document.getElementById('displayStock').textContent = stock + ' units';
                document.getElementById('displayCost').textContent = '₱' + cost.toFixed(2) + ' per unit';
                
                // Update max quantity
                document.getElementById('partQuantity').max = stock;
                
                document.getElementById('partDetailsBox').style.display = 'block';
                updateTotalCost();
            }
            
            function updateTotalCost() {
                const select = document.getElementById('selectedPart');
                const selectedOption = select.options[select.selectedIndex];
                const quantity = parseInt(document.getElementById('partQuantity').value) || 0;
                
                if (!selectedOption.value || quantity === 0) {
                    document.getElementById('totalCostBox').style.display = 'none';
                    return;
                }
                
                const cost = parseFloat(selectedOption.dataset.cost);
                const stock = parseInt(selectedOption.dataset.stock);
                const total = cost * quantity;
                
                // Check if quantity exceeds stock
                if (quantity > stock) {
                    document.getElementById('displayTotalCost').innerHTML = '<span style="color:#f44336;">⚠️ Quantity exceeds available stock!</span>';
                } else {
                    document.getElementById('displayTotalCost').textContent = '₱' + total.toFixed(2);
                }
                
                document.getElementById('totalCostBox').style.display = 'block';
            }
        </script>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit Use Parts
 */
async function submitUseParts(e, repairId) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const partId = formData.get('partId');
    const quantity = parseInt(formData.get('quantity'));
    const notes = formData.get('notes');
    
    try {
        // Use part in repair (this will handle stock deduction and recording)
        await usePartInRepair(partId, quantity, repairId);
        
        closeUserModal();
        utils.showToast('success', 'Parts Used', `Parts have been recorded and stock updated`);
    } catch (error) {
        // Error already handled in usePartInRepair
    }
}

/**
 * View Stock Movements Report
 */
function viewStockMovementsReport() {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');
    
    modalTitle.textContent = '📊 Stock Movements History';
    
    // Get recent movements (last 100)
    const recentMovements = window.stockMovements.slice(0, 100);
    
    modalContent.innerHTML = `
        <div style="margin-bottom:20px;">
            <p class="text-secondary">Showing last ${recentMovements.length} stock movements</p>
        </div>
        
        <div style="max-height:600px;overflow-y:auto;">
            ${recentMovements.length === 0 ? `
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:48px;margin-bottom:10px;">📦</div>
                    <div class="text-secondary">No stock movements recorded yet</div>
                </div>
            ` : `
                ${recentMovements.map(movement => {
                    const isIncrease = movement.adjustment > 0;
                    const color = isIncrease ? '#4caf50' : '#f44336';
                    const icon = isIncrease ? '➕' : '➖';
                    
                    return `
                        <div style="padding:15px;background:var(--bg-secondary);border-radius:8px;margin-bottom:10px;border-left:4px solid ${color};">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                                <div style="flex:1;">
                                    <h4 style="margin:0 0 5px;">${icon} ${movement.partName}</h4>
                                    <div class="text-secondary" style="font-size:13px;">
                                        Part #: ${movement.partNumber}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:20px;font-weight:bold;color:${color};">
                                        ${isIncrease ? '+' : ''}${movement.adjustment}
                                    </div>
                                    <div class="text-secondary" style="font-size:12px;">
                                        ${movement.previousQuantity} → ${movement.newQuantity}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background:var(--bg-light);padding:10px;border-radius:4px;margin-top:10px;">
                                <div style="font-size:13px;margin-bottom:5px;">
                                    <strong>Reason:</strong> ${movement.reason}
                                </div>
                                <div style="font-size:12px;color:#666;">
                                    <strong>By:</strong> ${movement.performedBy} • 
                                    <strong>On:</strong> ${utils.formatDateTime(movement.timestamp)}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `}
        </div>
        
        <div style="margin-top:20px;">
            <button onclick="closeUserModal()" class="btn-secondary" style="width:100%;">Close</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

window.viewStockMovementsReport = viewStockMovementsReport;
window.openUsePartsModal = openUsePartsModal;
window.submitUseParts = submitUseParts;

window.buildInventoryTab = buildInventoryTab;
window.filterInventoryTable = filterInventoryTable;
window.filterInventory = filterInventory;
window.openAddInventoryItemModal = openAddInventoryItemModal;
window.submitAddInventoryItem = submitAddInventoryItem;
window.editInventoryItemModal = editInventoryItemModal;
window.submitEditInventoryItem = submitEditInventoryItem;
window.adjustStockModal = adjustStockModal;
window.submitStockAdjustment = submitStockAdjustment;
window.openAddSupplierModal = openAddSupplierModal;
window.showAddSupplierForm = showAddSupplierForm;
window.hideSupplierForm = hideSupplierForm;
window.submitAddSupplier = submitAddSupplier;
window.editSupplierForm = editSupplierForm;
window.submitEditSupplier = submitEditSupplier;

window.buildDailyRemittanceTab = buildDailyRemittanceTab;
window.buildRemittanceVerificationTab = buildRemittanceVerificationTab;
window.buildTechnicianLogsTab = buildTechnicianLogsTab;
window.selectTechnicianForLogs = selectTechnicianForLogs;

console.log('✅ ui.js loaded');
