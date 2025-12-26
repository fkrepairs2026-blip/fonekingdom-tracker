// ===== UI MODULE =====

let availableTabs = [];
let activeTab = '';

/**
 * Build tabs based on user role
 */
function buildTabs() {
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
    
    renderTabs();
}

/**
 * Render tabs
 */
function renderTabs() {
    const tabsContainer = document.getElementById('tabsContainer');
    const contentsContainer = document.getElementById('contentsContainer');
    
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
        tab.build(contentEl);
        contentsContainer.appendChild(contentEl);
    });
    
    if (availableTabs.length > 0) {
        activeTab = availableTabs[0].id;
    }
}

/**
 * Switch tab
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`${tabId}Tab`).classList.add('active');
}

// Export for global use
window.buildTabs = buildTabs;
window.switchTab = switchTab;

/**
 * Build New Repair Tab
 */
function buildNewRepairTab(container) {
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
    const repairType = document.getElementById('repairTypeSelect').value;
    document.getElementById('microsoldingFields').style.display = repairType === 'Microsoldering' ? 'block' : 'none';
}

/**
 * Display repairs in container
 */
function displayRepairsInContainer(repairs, container) {
    const role = window.currentUserData.role;
    const hidePayments = role === 'technician';
    
    if (!repairs.length) {
        container.innerHTML = '<p style="text-align:center;color:#666;">No repairs found</p>';
        return;
    }
    
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
                
                ${r.status === 'RTO' && r.rto ? `
                    <div style="margin-top:15px;padding:15px;background:#ffebee;border-left:4px solid #f44336;border-radius:5px;">
                        <h4 style="margin:0 0 10px 0;color:#c62828;">🚫 RTO</h4>
                        <p><strong>Reason:</strong> ${r.rto.reason}</p>
                        <p style="font-size:12px;color:#666;">By ${r.rto.by}</p>
                    </div>
                ` : ''}
                
                ${r.additionalRepairs && r.additionalRepairs.length > 0 ? `
                    <div style="margin-top:15px;padding:15px;background:#e3f2fd;border-left:4px solid #2196f3;border-radius:5px;">
                        <h4 style="margin:0 0 10px 0;color:#1976d2;">➕ Additional Repairs (${r.additionalRepairs.length})</h4>
                        ${r.additionalRepairs.map((add, idx) => `
                            <div style="padding:10px;margin:5px 0;background:white;border-radius:3px;">
                                <strong>${idx + 1}. ${add.problem}</strong><br>
                                <small>Parts: ₱${add.partsCost.toFixed(2)} | Labor: ₱${add.laborCost.toFixed(2)} | Total: ₱${add.total.toFixed(2)}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap;">
                    ${!hidePayments && balance > 0 ? `<button class="btn-small btn-success" onclick="alert('Payment modal - to implement')">💰 Payment</button>` : ''}
                    ${role === 'technician' || role === 'admin' || role === 'manager' ? `<button class="btn-small" onclick="updateRepairStatus('${r.id}')">📝 Status</button>` : ''}
                    ${role === 'admin' || role === 'manager' ? `<button class="btn-small btn-warning" onclick="openAdditionalRepairModal('${r.id}')">➕ Additional</button>` : ''}
                    ${role === 'admin' ? `<button class="btn-small btn-danger" onclick="deleteRepair('${r.id}')">🗑️ Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Export tab builders
window.buildNewRepairTab = buildNewRepairTab;
window.toggleMicrosoldingFields = toggleMicrosoldingFields;
window.displayRepairsInContainer = displayRepairsInContainer;

/**
 * Build All Repairs Tab
 */
function buildAllRepairsTab(container) {
    window.currentTabRefresh = () => buildAllRepairsTab(document.getElementById('allTab'));
    
    const repairs = window.currentUserData.role === 'technician' 
        ? window.allRepairs.filter(r => r.assignedTo === window.currentUserData.technicianName)
        : window.allRepairs;
    
    container.innerHTML = `
        <div class="card">
            <h3>All Repairs</h3>
            <div id="allRepairsList"></div>
        </div>
    `;
    
    const listContainer = document.getElementById('allRepairsList');
    if (listContainer) {
        displayRepairsInContainer(repairs, listContainer);
    }
}

/**
 * Build My Repairs Tab
 */
function buildMyRepairsTab(container) {
    window.currentTabRefresh = () => buildMyRepairsTab(document.getElementById('myTab'));
    
    const myRepairs = window.allRepairs.filter(r => r.assignedTo === window.currentUserData.technicianName);
    
    container.innerHTML = `
        <div class="card">
            <h3>My Repairs (${myRepairs.length})</h3>
            <p style="color:#666;">Repairs assigned to you</p>
            <div id="myRepairsList"></div>
        </div>
    `;
    
    const listContainer = document.getElementById('myRepairsList');
    if (listContainer) {
        displayRepairsInContainer(myRepairs, listContainer);
    }
}

/**
 * Build Assigned to Others Tab
 */
function buildAssignedToOthersTab(container) {
    window.currentTabRefresh = () => buildAssignedToOthersTab(document.getElementById('assignedTab'));
    
    const assignedToOthers = window.allRepairs.filter(r => 
        r.createdBy === window.currentUser.uid && 
        r.assignedTo !== window.currentUserData.technicianName
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>📤 Assigned to Others (${assignedToOthers.length})</h3>
            <p style="color:#666;">Repairs you created for other technicians</p>
            <div id="assignedRepairsList"></div>
        </div>
    `;
    
    const listContainer = document.getElementById('assignedRepairsList');
    if (listContainer) {
        if (assignedToOthers.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No repairs assigned to others</p>';
        } else {
            displayRepairsInContainer(assignedToOthers, listContainer);
        }
    }
}

/**
 * Build Pending Verification Tab
 */
function buildPendingTab(container) {
    window.currentTabRefresh = () => buildPendingTab(document.getElementById('pendingTab'));
    
    const pendingRepairs = window.allRepairs.filter(r => 
        r.payments && r.payments.some(p => !p.verified)
    );
    
    container.innerHTML = `
        <div class="card">
            <h3>⏳ Pending Verification (${pendingRepairs.length})</h3>
            <p style="color:#666;">Payments waiting for verification</p>
            <div id="pendingRepairsList"></div>
        </div>
    `;
    
    const listContainer = document.getElementById('pendingRepairsList');
    if (listContainer) {
        displayRepairsInContainer(pendingRepairs, listContainer);
    }
}

/**
 * Build Cash Count Tab
 */
function buildCashCountTab(container) {
    window.currentTabRefresh = () => buildCashCountTab(document.getElementById('cashTab'));
    
    const today = new Date().toDateString();
    const todayRevenue = window.allRepairs
        .filter(r => r.payments && r.payments.some(p => new Date(p.date).toDateString() === today && p.verified))
        .reduce((sum, r) => sum + r.payments.filter(p => new Date(p.date).toDateString() === today && p.verified).reduce((s, p) => s + p.amount, 0), 0);
    
    container.innerHTML = `
        <div class="card">
            <h3>💵 Cash Count</h3>
            <div style="background:#e8f5e9;padding:20px;border-radius:10px;margin:20px 0;text-align:center;">
                <h2 style="margin:0;color:#2e7d32;">Today's Expected: ₱${todayRevenue.toFixed(2)}</h2>
            </div>
            <p style="text-align:center;color:#999;">Cash count feature coming soon...</p>
        </div>
    `;
}

/**
 * Build Suppliers Tab
 */
function buildSuppliersTab(container) {
    window.currentTabRefresh = () => buildSuppliersTab(document.getElementById('suppliersTab'));
    
    container.innerHTML = `
        <div class="card">
            <h3>📊 Supplier Price Comparison</h3>
            <p style="text-align:center;color:#999;">Supplier report feature coming soon...</p>
        </div>
    `;
}

/**
 * Build Users Tab
 */
function buildUsersTab(container) {
    window.currentTabRefresh = () => buildUsersTab(document.getElementById('usersTab'));
    
    container.innerHTML = `
        <div class="card">
            <h3>👥 User Management</h3>
            <p style="text-align:center;color:#999;">User management feature coming soon...</p>
        </div>
    `;
}

// Export tab builders
window.buildAllRepairsTab = buildAllRepairsTab;
window.buildMyRepairsTab = buildMyRepairsTab;
window.buildAssignedToOthersTab = buildAssignedToOthersTab;
window.buildPendingTab = buildPendingTab;
window.buildCashCountTab = buildCashCountTab;
window.buildSuppliersTab = buildSuppliersTab;
window.buildUsersTab = buildUsersTab;
