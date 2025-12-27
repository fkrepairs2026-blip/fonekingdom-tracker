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
    
    // ROLE-SPECIFIC PAGES
    if (role === 'cashier') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'unpaid', label: '💳 Unpaid', build: buildUnpaidTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingPaymentsTab });
        availableTabs.push({ id: 'paid', label: '✅ Paid', build: buildPaidTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
    }
    else if (role === 'admin' || role === 'manager') {
        availableTabs.push({ id: 'receive', label: '➕ Receive Device', build: buildReceiveDeviceTab });
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingTab });
        availableTabs.push({ id: 'cash', label: '💵 Cash Count', build: buildCashCountTab });
        availableTabs.push({ id: 'suppliers', label: '📊 Supplier Report', build: buildSuppliersTab });
    }
    else if (role === 'technician') {
        availableTabs.push({ id: 'my', label: '🔧 My Jobs', build: buildMyRepairsTab });
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
    
    if (!tabsContainer || !contentsContainer) {
        console.error('❌ Tab containers not found!');
        return;
    }
    
    tabsContainer.innerHTML = '';
    contentsContainer.innerHTML = '';
    
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
    
    const tab = document.getElementById(`tab-${tabId}`);
    const content = document.getElementById(`${tabId}Tab`);
    
    if (tab) tab.classList.add('active');
    if (content) content.classList.add('active');
    
    activeTab = tabId;
}

/**
 * Build Received Devices Page (SHARED - Everyone can access)
 */
function buildReceivedDevicesPage(container) {
    console.log('📥 Building Received Devices page');
    window.currentTabRefresh = () => buildReceivedDevicesPage(document.getElementById('receivedTab'));
    
    const receivedDevices = window.allRepairs.filter(r => 
        r.status === 'Received' && !r.acceptedBy
    );
    
    const role = window.currentUserData.role;
    const canAccept = (role === 'admin' || role === 'manager' || role === 'technician');
    
    container.innerHTML = `
        <div class="card">
            <h3>📥 Received Devices - Waiting for Technician (${receivedDevices.length})</h3>
            <p style="color:#666;margin-bottom:15px;">Devices received but not yet accepted by a technician</p>
            ${receivedDevices.length === 0 ? `
                <div style="text-align:center;padding:40px;color:#999;">
                    <h2 style="font-size:48px;margin:0;">✅</h2>
                    <p>No devices waiting - All caught up!</p>
                </div>
            ` : `
                <div id="receivedDevicesList">
                    ${receivedDevices.map(r => `
                        <div class="repair-card" style="border-left:4px solid #2196f3;">
                            <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                            <span class="status-badge" style="background:#e3f2fd;color:#1565c0;">📥 Received</span>
                            ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                            
                            <div class="repair-info">
                                <div><strong>Contact:</strong> ${r.contactNumber}</div>
                                <div><strong>Problem:</strong> ${r.problem}</div>
                                <div><strong>Received by:</strong> ${r.receivedBy || r.createdByName}</div>
                                <div><strong>Received on:</strong> ${utils.formatDateTime(r.createdAt)}</div>
                                ${r.repairType && r.repairType !== 'Pending Diagnosis' ? `<div><strong>Repair Type:</strong> ${r.repairType}</div>` : ''}
                                ${r.total > 0 ? `<div><strong>Estimated Cost:</strong> ₱${r.total.toFixed(2)}</div>` : '<div style="color:#999;"><strong>Cost:</strong> Pending diagnosis</div>'}
                            </div>
                            
                            ${r.photos && r.photos.length > 0 ? `
                                <div style="margin:10px 0;">
                                    <strong>Photos:</strong>
                                    <div style="display:flex;gap:10px;margin-top:5px;">
                                        ${r.photos.map(p => `<img src="${p}" onclick="showPhotoModal('${p}')" style="width:80px;height:80px;object-fit:cover;border-radius:5px;cursor:pointer;">`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                                ${canAccept ? `
                                    <button class="btn-small" onclick="acceptRepair('${r.id}')" style="background:#4caf50;color:white;font-weight:bold;">
                                        ✅ Accept This Repair
                                    </button>
                                ` : ''}
                                ${role === 'admin' || role === 'manager' ? `
                                    <button class="btn-small" onclick="openEditRepairModal('${r.id}')" style="background:#667eea;color:white;">
                                        📝 Set Pricing
                                    </button>
                                ` : ''}
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
    
    // Render after container is in DOM
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
    
    // Render after container is in DOM
    setTimeout(() => {
        const listContainer = document.getElementById('forReleaseList');
        if (listContainer && forReleaseDevices.length > 0) {
            displayRepairsInContainer(forReleaseDevices, listContainer);
        }
    }, 0);
}

/**
 * Build Receive Device Tab
 */
function buildReceiveDeviceTab(container) {
    console.log('📥 Building Receive Device tab');
    window.currentTabRefresh = () => buildReceiveDeviceTab(document.getElementById('receiveTab'));
    
    container.innerHTML = `
        <div class="card">
            <h3>➕ Receive Device</h3>
            <p style="color:#666;margin-bottom:20px;">Receive new device from customer - Technician will accept it later</p>
            
            <form onsubmit="submitReceiveDevice(event)">
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
                    <label>Problem Description *</label>
                    <textarea name="problem" rows="3" required placeholder="Describe the issue..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Device Photo (Optional)</label>
                    <input type="file" accept="image/*" id="receivePhoto1" onchange="handlePhotoUpload(this,'receivePreview1')">
                    <div id="receivePreview1" style="display:none;margin-top:10px;"></div>
                </div>
                
                <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #2196f3;">
                    <p style="margin:0;"><strong>ℹ️ Note:</strong> Device will appear in "📥 Received Devices" - Owner or Technician will accept it later.</p>
                </div>
                
                <button type="submit" style="width:100%;background:#4caf50;color:white;font-size:16px;padding:12px;">
                    📥 Receive Device
                </button>
            </form>
        </div>
    `;
}

/**
 * Build filtered repairs tab (for status filters)
 */
function buildFilteredRepairsTab(status) {
    console.log('🔍 Building filtered repairs tab for:', status);
    
    let repairs = [];
    let title = '';
    
    const role = window.currentUserData.role;
    let userRepairs = window.allRepairs;
    
    if (role === 'technician') {
        userRepairs = window.allRepairs.filter(r => r.acceptedBy === window.currentUser.uid);
    }
    
    if (status === 'all') {
        repairs = userRepairs;
        title = 'All Repairs';
    } else if (status === 'pending-payment') {
        repairs = userRepairs.filter(r => r.payments && r.payments.some(p => !p.verified));
        title = 'Pending Payment Verification';
    } else {
        repairs = userRepairs.filter(r => r.status === status);
        title = `${status} Repairs`;
    }
    
    switchTab('all');
    
    const container = document.getElementById('allTab');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3>${title} (${repairs.length})</h3>
                    <button onclick="buildTabs()" class="btn-small">← Back to All</button>
                </div>
                <div id="filteredRepairsList"></div>
            </div>
        `;
        
        setTimeout(() => {
            const listContainer = document.getElementById('filteredRepairsList');
            if (listContainer) {
                displayRepairsInContainer(repairs, listContainer);
            }
        }, 0);
    }
}

/**
 * Build Unpaid Tab (Cashier)
 */
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

/**
 * Build Pending Payments Tab (Cashier)
 */
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

/**
 * Build Paid Tab (Cashier)
 */
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

/**
 * Build All Repairs Tab
 */
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

/**
 * Display repairs in container
 */
function displayRepairsInContainer(repairs, container) {
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
                ${!hidePayments ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                
                <div class="repair-info">
                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                    <div><strong>Repair:</strong> ${r.repairType || 'Pending Diagnosis'}</div>
                    ${r.isMicrosoldering || r.repairType === 'Microsoldering' ? `<div><strong>Condition:</strong> ${r.deviceCondition === 'Fresh' ? '✅ Fresh' : '⚠️ Tampered'}</div>` : ''}
                    <div><strong>Part:</strong> ${r.partType || 'N/A'}</div>
                    ${r.acceptedBy ? `<div><strong>Technician:</strong> ${r.acceptedByName}</div>` : ''}
                    ${!hidePayments ? `
                        <div><strong>Total:</strong> ₱${r.total.toFixed(2)}${r.serviceFee ? ' <span style="color:#f44336;">(Service Fee)</span>' : ''}</div>
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

/**
 * Build My Repairs Tab (Technician)
 */
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

// Export to global scope
window.buildTabs = buildTabs;
window.switchTab = switchTab;
window.buildFilteredRepairsTab = buildFilteredRepairsTab;
window.buildReceivedDevicesPage = buildReceivedDevicesPage;
window.buildInProgressPage = buildInProgressPage;
window.buildForReleasePage = buildForReleasePage;
window.buildReceiveDeviceTab = buildReceiveDeviceTab;
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

console.log('✅ ui.js loaded');
