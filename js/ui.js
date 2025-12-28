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
    
    // SHARED PAGES - Everyone can access
    availableTabs.push({ id: 'received', label: '📥 Received Devices', build: buildReceivedDevicesPage });
    availableTabs.push({ id: 'inprogress', label: '🔧 In Progress', build: buildInProgressPage });
    availableTabs.push({ id: 'forrelease', label: '📦 For Release', build: buildForReleasePage });

    availableTabs.push({ id: 'claimed', label: '✅ Claimed Units', build: buildClaimedUnitsPage });
    
    // ROLE-SPECIFIC PAGES
    if (role === 'cashier') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'unpaid', label: '💳 Unpaid', build: buildUnpaidTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingPaymentsTab });
        availableTabs.push({ id: 'paid', label: '✅ Paid', build: buildPaidTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    else if (role === 'admin' || role === 'manager') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingTab });
        availableTabs.push({ id: 'cash', label: '💵 Cash Count', build: buildCashCountTab });
        availableTabs.push({ id: 'suppliers', label: '📊 Supplier Report', build: buildSuppliersTab });
        if (role === 'manager') {
            availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
        }
    }
    else if (role === 'technician') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'my', label: '🔧 My Jobs', build: buildMyRepairsTab });
        availableTabs.push({ id: 'remittance', label: '💸 Daily Remittance', build: buildDailyRemittanceTab });
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    
    // Cashier/Admin/Manager get remittance verification tab
    if (role === 'admin' || role === 'manager' || role === 'cashier') {
        availableTabs.push({ id: 'verify-remittance', label: '✅ Verify Remittance', build: buildRemittanceVerificationTab });
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
                    <label>Problem Description *</label>
                    <textarea name="problem" rows="3" required placeholder="Describe the issue..."></textarea>
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
                    <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                    ${r.acceptedBy ? `<div><strong>Technician:</strong> ${r.acceptedByName}</div>` : ''}
                    <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                    <div><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></div>
                    <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-weight:bold;">₱${balance.toFixed(2)}</span></div>
                </div>
                
                <div><strong>Problem:</strong> ${r.problem}</div>
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePaymentActions && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${(r.status === 'In Progress' || r.status === 'Ready for Pickup') ? `<button class="btn-small" onclick="openPartsCostModal('${r.id}')" style="background:#ff9800;color:white;">🔧 Parts Cost</button>` : ''}
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
    
    container.innerHTML = `
        <div class="card">
            <h3>👥 User Management</h3>
            <p style="text-align:center;color:#999;padding:40px;">User management feature coming soon...</p>
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
            ${payments.length > 0 && !todayRemittance ? `
                <button onclick="openRemittanceModal()" class="btn-success">
                    📤 Submit Today's Remittance
                </button>
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

window.buildDailyRemittanceTab = buildDailyRemittanceTab;
window.buildRemittanceVerificationTab = buildRemittanceVerificationTab;

console.log('✅ ui.js loaded');
