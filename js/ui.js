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
    // Note: Completed, Pending Payment, Revenue moved to FAB menu
    if (role === 'cashier') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        // Unpaid, Paid, Pending moved to FAB menu - keep tabs for direct access
        availableTabs.push({ id: 'unpaid', label: '💳 Unpaid', build: buildUnpaidTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingPaymentsTab });
        availableTabs.push({ id: 'paid', label: '✅ Paid', build: buildPaidTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    else if (role === 'admin' || role === 'manager') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        // Pending Verification, Cash Count moved to FAB menu but keep tabs
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
        availableTabs.push({ id: 'requests', label: '📝 My Requests', build: buildMyRequestsTab });
    }
    
    // Admin gets modification requests approval page
    if (role === 'admin') {
        availableTabs.push({ id: 'mod-requests', label: '🔔 Mod Requests', build: buildModificationRequestsTab });
    }
    
    if (role === 'admin') {
        availableTabs.push({ id: 'users', label: '👥 Users', build: buildUsersTab });
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
    
    // Build mobile navigation (show first 5 tabs)
    if (mobileNav) {
        mobileNav.innerHTML = '';
        const mobileTabs = availableTabs.slice(0, 5);
        mobileTabs.forEach((tab, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'mobile-nav-item' + (index === 0 ? ' active' : '');
            navItem.onclick = () => switchTab(tab.id);
            navItem.id = `mobile-tab-${tab.id}`;
            
            // Extract emoji and text
            const label = tab.label;
            const emojiMatch = label.match(/^([^\s]+)\s+(.+)$/);
            const emoji = emojiMatch ? emojiMatch[1] : '📋';
            const text = emojiMatch ? emojiMatch[2] : label;
            
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
    
    // Scroll to top on mobile
    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    const forReleaseDevices = window.allRepairs.filter(r => 
        r.status === 'Ready for Pickup' || r.status === 'Completed'
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>📦 For Release - Ready for Pickup (${forReleaseDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices ready to be released to customers</p>
            ${forReleaseDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">📭</h2>
                    <p>No devices ready for release</p>
                </div>
            ` : `
                <div id="forReleaseList">
                    ${displayRepairsInContainer(forReleaseDevices, document.getElementById('forReleaseList'), true)}
                </div>
            `}
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('forReleaseList');
        if (listContainer && forReleaseDevices.length > 0) {
            displayRepairsInContainer(forReleaseDevices, listContainer);
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
                    <label>Problem Description *</label>
                    <textarea name="problem" id="problemDescription" rows="3" required placeholder="Describe the issue in detail..."></textarea>
                    <small style="color:#666;">Be specific: What happened? When? Any error messages?</small>
                </div>
                
                <div class="form-group">
                    <label>Device Photo (Optional)</label>
                    <input type="file" accept="image/*" id="receivePhoto1" onchange="handlePhotoUpload(this,'receivePreview1')">
                    <div id="receivePreview1" style="display:none;margin-top:10px;"></div>
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
    const hidePayments = role === 'technician';
    
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
                ${!hidePayments ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                
                <div class="repair-info">
                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                    <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                    ${r.acceptedBy ? `<div><strong>Technician:</strong> ${r.acceptedByName}</div>` : ''}
                    ${!hidePayments ? `
                        <div><strong>Total:</strong> ₱${r.total.toFixed(2)}</div>
                        <div><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></div>
                        <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-weight:bold;">₱${balance.toFixed(2)}</span></div>
                    ` : '<div><strong>Amount:</strong> ***</div>'}
                </div>
                
                <div><strong>Problem:</strong> ${r.problem}</div>
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePayments && r.total > 0 ? `<button class="btn-small" onclick="openPaymentModal('${r.id}')" style="background:#4caf50;color:white;">💰 Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function buildMyRepairsTab(container) {
    console.log('🔧 Building My Repairs tab');
    window.currentTabRefresh = () => buildMyRepairsTab(document.getElementById('myTab'));
    
    const myRepairs = window.allRepairs.filter(r => r.acceptedBy === window.currentUser.uid);
    
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
    
    container.innerHTML = `
        <div class="card">
            <h3>💵 Cash Count</h3>
            <p style="text-align:center;color:#999;padding:40px;">Cash count feature coming soon...</p>
        </div>
    `;
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

// Toggle back job fields
function toggleBackJobFields() {
    const isBackJob = document.getElementById('isBackJob').checked;
    const backJobFields = document.getElementById('backJobFields');
    
    if (backJobFields) {
        backJobFields.style.display = isBackJob ? 'block' : 'none';
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
                                        <div><strong>Claimed:</strong> ${utils.formatDateTime(r.claimedAt)} (${daysSinceClaimed} days ago)</div>
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
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;
window.toggleBackJobFields = toggleBackJobFields;
window.buildClaimedUnitsPage = buildClaimedUnitsPage;
window.handleProblemTypeChange = handleProblemTypeChange;

console.log('✅ ui.js loaded');
