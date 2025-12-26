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
    
    // Common tabs
    availableTabs.push({ id: 'new', label: '➕ New Repair', build: buildNewRepairTab });
    
    if (role === 'admin' || role === 'manager') {
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingTab });
        availableTabs.push({ id: 'cash', label: '💵 Cash Count', build: buildCashCountTab });
        availableTabs.push({ id: 'suppliers', label: '📊 Supplier Report', build: buildSuppliersTab });
    }
    
    if (role === 'cashier') {
        availableTabs.push({ id: 'all', label: '📋 All Repairs', build: buildAllRepairsTab });
        availableTabs.push({ id: 'pending', label: '⏳ Pending Verification', build: buildPendingTab });
        availableTabs.push({ id: 'cash', label: '💵 Cash Count', build: buildCashCountTab });
    }
    
    if (role === 'technician') {
        availableTabs.push({ id: 'my', label: '🔧 My Repairs', build: buildMyRepairsTab });
        availableTabs.push({ id: 'assigned', label: '📤 Assigned to Others', build: buildAssignedToOthersTab });
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
        
        // Build tab content
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
 * Build New Repair Tab
 */
function buildNewRepairTab(container) {
    console.log('🆕 Building New Repair tab');
    window.currentTabRefresh = () => buildNewRepairTab(document.getElementById('newTab'));
    
    container.innerHTML = `
        <div class="card">
            <h3>Create New Repair</h3>
            <form onsubmit="submitRepair(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer Type *</label>
                        <select name="customerType" onchange="document.getElementById('shopNameGroup').style.display=this.value==='Dealer'?'block':'none'" required>
                            <option value="">Select</option>
                            <option>Walk-in</option>
                            <option>Dealer</option>
                        </select>
                    </div>
                    <div class="form-group" id="shopNameGroup" style="display:none;">
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
                        <input type="text" name="brand" required>
                    </div>
                    <div class="form-group">
                        <label>Model *</label>
                        <input type="text" name="model" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Problem Description *</label>
                    <textarea name="problem" rows="3" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Repair Type *</label>
                        <select name="repairType" id="repairTypeSelect" onchange="toggleMicrosoldingFields()" required>
                            <option value="">Select</option>
                            <option>LCD Replacement</option>
                            <option>Battery Replacement</option>
                            <option>Charging Port</option>
                            <option>Microsoldering</option>
                            <option>Water Damage</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Assigned To *</label>
                        <select name="assignedTo" required>
                            <option value="">Select Technician</option>
                            <option value="Owner">Owner</option>
                            <option value="Tech 1">Tech 1</option>
                            <option value="Tech 2">Tech 2</option>
                        </select>
                    </div>
                </div>
                <div id="microsoldingFields" style="display:none;">
                    <h4 style="margin:20px 0 10px;color:var(--primary);">Microsoldering Details</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Device Condition *</label>
                            <select name="deviceCondition" onchange="document.getElementById('deviceTierGroup').style.display=this.value==='Tampered'?'block':'none'">
                                <option value="">Select Condition</option>
                                <option value="Fresh">✅ Fresh (Never Opened)</option>
                                <option value="Tampered">⚠️ Tampered (Previously Repaired)</option>
                            </select>
                            <small style="color:#666;">Fresh = No charge if unsuccessful<br>Tampered = Service fee applies</small>
                        </div>
                        <div class="form-group" id="deviceTierGroup" style="display:none;">
                            <label>Device Tier *</label>
                            <select name="deviceTier">
                                <option value="">Select Tier</option>
                                <option value="Entry Android">Entry Android (₱150-200)</option>
                                <option value="Old iPhone">Old iPhone / Mid Android (₱200-300)</option>
                                <option value="Latest Models">Latest iPhone / Flagship (₱300-500)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Part Type</label>
                        <select name="partType">
                            <option value="">Select Part</option>
                            <option>LCD</option>
                            <option>Battery</option>
                            <option>Flex</option>
                            <option>Charging Port</option>
                            <option>Camera</option>
                            <option>Speaker</option>
                            <option>Microphone</option>
                            <option>Back Cover</option>
                            <option>Board</option>
                            <option>Multiple Parts</option>
                            <option>No Parts</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Parts Source</label>
                        <select name="partSource">
                            <option value="">Select Source</option>
                            <option>Shop Stock</option>
                            <option>Guimba</option>
                            <option>Ate Sheng</option>
                            <option>Lawrence</option>
                            <option>Jhay</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Parts Cost (₱)</label>
                        <input type="number" name="partsCost" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label>Labor Cost (₱)</label>
                        <input type="number" name="laborCost" step="0.01" value="0">
                    </div>
                </div>
                <div class="form-group">
                    <label>Device Photos (up to 3)</label>
                    <div class="form-row">
                        <div><input type="file" accept="image/*" id="photo1" onchange="handlePhotoUpload(this,'preview1')"><div id="preview1" style="display:none;margin-top:10px;"></div></div>
                        <div id="photo2" style="display:none;"><input type="file" accept="image/*" onchange="handlePhotoUpload(this,'preview2')"><div id="preview2" style="display:none;margin-top:10px;"></div></div>
                        <div id="photo3" style="display:none;"><input type="file" accept="image/*" onchange="handlePhotoUpload(this,'preview3')"><div id="preview3" style="display:none;margin-top:10px;"></div></div>
                    </div>
                </div>
                <button type="submit" style="width:100%;background:var(--primary);color:white;">💾 Save Repair</button>
            </form>
        </div>
    `;
}

function toggleMicrosoldingFields() {
    const repairType = document.getElementById('repairTypeSelect');
    const fields = document.getElementById('microsoldingFields');
    if (repairType && fields) {
        fields.style.display = repairType.value === 'Microsoldering' ? 'block' : 'none';
    }
}

/**
 * Build All Repairs Tab
 */
function buildAllRepairsTab(container) {
    console.log('📋 Building All Repairs tab');
    console.log('Total repairs to show:', window.allRepairs.length);
    
    window.currentTabRefresh = () => {
        console.log('🔄 Refreshing All Repairs tab');
        buildAllRepairsTab(document.getElementById('allTab'));
    };
    
    const repairs = window.allRepairs || [];
    
    container.innerHTML = `
        <div class="card">
            <h3>All Repairs (${repairs.length})</h3>
            <div id="allRepairsList"></div>
        </div>
    `;
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        const listContainer = document.getElementById('allRepairsList');
        if (listContainer) {
            console.log('📝 Displaying repairs in container...');
            displayRepairsInContainer(repairs, listContainer);
        } else {
            console.error('❌ allRepairsList container not found!');
        }
    }, 0);
}

/**
 * Display repairs in container
 */
function displayRepairsInContainer(repairs, container) {
    console.log('🎨 displayRepairsInContainer called');
    console.log('Repairs to display:', repairs.length);
    console.log('Container:', container);
    
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
    
    console.log('✅ Rendering', repairs.length, 'repair cards');
    
    container.innerHTML = repairs.map(r => {
        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
        const totalPaid = (r.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;
        const paymentStatus = balance === 0 ? 'verified' : (r.payments && r.payments.some(p => !p.verified)) ? 'pending' : 'unpaid';
        
        return `
            <div class="repair-card">
                <h4>${r.customerName}${r.shopName ? ` (${r.shopName})` : ''} - ${r.brand} ${r.model}</h4>
                <span class="status-badge status-${statusClass}">${r.status}</span>
                ${!hidePayments ? `<span class="payment-badge payment-${paymentStatus}">${paymentStatus === 'unpaid' ? 'Unpaid' : paymentStatus === 'pending' ? 'Pending' : 'Verified'}</span>` : ''}
                ${r.customerType === 'Dealer' ? '<span class="status-badge" style="background:#e1bee7;color:#6a1b9a;">🏪 Dealer</span>' : '<span class="status-badge" style="background:#c5e1a5;color:#33691e;">👤 Walk-in</span>'}
                
                <div class="repair-info">
                    <div><strong>Contact:</strong> ${r.contactNumber}</div>
                    <div><strong>Repair:</strong> ${r.repairType}</div>
                    ${r.isMicrosoldering || r.repairType === 'Microsoldering' ? `<div><strong>Condition:</strong> ${r.deviceCondition === 'Fresh' ? '✅ Fresh' : '⚠️ Tampered'}</div>` : ''}
                    <div><strong>Part:</strong> ${r.partType || 'N/A'}</div>
                    <div><strong>Assigned:</strong> ${r.assignedTo}</div>
                    ${!hidePayments ? `
                        <div><strong>Total:</strong> ₱${r.total.toFixed(2)}${r.serviceFee ? ' <span style="color:#f44336;">(Service Fee)</span>' : ''}</div>
                        <div><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'}">₱${balance.toFixed(2)}</span></div>
                    ` : '<div><strong>Amount:</strong> ***</div>'}
                </div>
                
                <div><strong>Problem:</strong> ${r.problem}</div>
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')" style="background:#667eea;color:white;">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Repair cards rendered successfully');
}

/**
 * Build other tabs (simplified for now)
 */
function buildMyRepairsTab(container) {
    console.log('🔧 Building My Repairs tab');
    window.currentTabRefresh = () => buildMyRepairsTab(document.getElementById('myTab'));
    
    const myRepairs = window.allRepairs.filter(r => r.assignedTo === window.currentUserData.technicianName);
    
    container.innerHTML = `
        <div class="card">
            <h3>My Repairs (${myRepairs.length})</h3>
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

function buildAssignedToOthersTab(container) {
    console.log('📤 Building Assigned to Others tab');
    window.currentTabRefresh = () => buildAssignedToOthersTab(document.getElementById('assignedTab'));
    
    const assignedToOthers = window.allRepairs.filter(r => 
        r.createdBy === window.currentUser.uid && 
        r.assignedTo !== window.currentUserData.technicianName
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>📤 Assigned to Others (${assignedToOthers.length})</h3>
            <div id="assignedRepairsList"></div>
        </div>
    `;
    
    setTimeout(() => {
        const listContainer = document.getElementById('assignedRepairsList');
        if (listContainer) {
            displayRepairsInContainer(assignedToOthers, listContainer);
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
window.buildNewRepairTab = buildNewRepairTab;
window.toggleMicrosoldingFields = toggleMicrosoldingFields;
window.displayRepairsInContainer = displayRepairsInContainer;
window.buildAllRepairsTab = buildAllRepairsTab;
window.buildMyRepairsTab = buildMyRepairsTab;
window.buildAssignedToOthersTab = buildAssignedToOthersTab;
window.buildPendingTab = buildPendingTab;
window.buildCashCountTab = buildCashCountTab;
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;

console.log('✅ ui.js loaded');
