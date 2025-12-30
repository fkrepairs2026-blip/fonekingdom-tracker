// ===== REPAIRS MODULE =====

// Initialize global repairs array
window.allRepairs = [];
let photoData = [];
// Global modification requests
window.allModificationRequests = [];
// Global activity logs
window.allActivityLogs = [];
// Global users list
window.allUsers = [];

/**
 * Load all repairs from Firebase
 */
async function loadRepairs() {
    return new Promise((resolve) => {
        console.log('📦 Setting up repairs listener...');
        
        db.ref('repairs').on('value', (snapshot) => {
            const previousCount = window.allRepairs.length;
            window.allRepairs = [];
            
            snapshot.forEach((child) => {
                window.allRepairs.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            const newCount = window.allRepairs.length;
            console.log('✅ Repairs loaded from Firebase:', newCount, previousCount !== newCount ? '(changed)' : '');
            
            // Always refresh current tab when data changes
            if (window.currentTabRefresh) {
                console.log('🔄 Auto-refreshing current tab...');
                // Use setTimeout to ensure Firebase has fully synced
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }
            
            // Always update stats
            if (window.buildStats) {
                setTimeout(() => {
                    window.buildStats();
                }, 400);
            }
            
            resolve(window.allRepairs);
        });
    });
}

/**
 * Load modification requests from Firebase
 */
async function loadModificationRequests() {
    return new Promise((resolve) => {
        console.log('📦 Loading modification requests...');
        
        db.ref('modificationRequests').on('value', (snapshot) => {
            window.allModificationRequests = [];
            
            snapshot.forEach((child) => {
                window.allModificationRequests.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            console.log('✅ Modification requests loaded:', window.allModificationRequests.length);
            
            // Refresh current tab if it's modification requests tab
            if (window.currentTabRefresh) {
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }
            
            resolve(window.allModificationRequests);
        });
    });
}

window.loadModificationRequests = loadModificationRequests;

/**
 * Load activity logs from Firebase
 */
async function loadActivityLogs() {
    return new Promise((resolve) => {
        console.log('📦 Loading activity logs...');
        
        db.ref('activityLogs').orderByChild('timestamp').limitToLast(100).on('value', (snapshot) => {
            window.allActivityLogs = [];
            
            snapshot.forEach((child) => {
                window.allActivityLogs.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            // Sort by timestamp descending (newest first)
            window.allActivityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log('✅ Activity logs loaded:', window.allActivityLogs.length);
            
            // Refresh current tab if it's activity logs tab
            if (window.currentTabRefresh && window.activeTab === 'admin-logs') {
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }
            
            resolve(window.allActivityLogs);
        });
    });
}

window.loadActivityLogs = loadActivityLogs;

/**
 * Log activity to Firebase
 * @param {string} type - Activity type (repair_created, payment_recorded, etc.)
 * @param {object} details - Type-specific details
 * @param {string} summary - Human-readable summary
 */
async function logActivity(type, details, summary) {
    try {
        if (!window.currentUser || !window.currentUserData) {
            console.warn('⚠️ Cannot log activity: user not logged in');
            return;
        }
        
        const activityLog = {
            type: type,
            timestamp: new Date().toISOString(),
            userId: window.currentUser.uid,
            userName: window.currentUserData.displayName,
            userRole: window.currentUserData.role,
            details: details || {},
            summary: summary
        };
        
        await db.ref('activityLogs').push(activityLog);
        console.log('✅ Activity logged:', type, summary);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
        // Don't throw - logging errors shouldn't break the main flow
    }
}

window.logActivity = logActivity;

/**
 * Load all users from Firebase
 */
async function loadUsers() {
    return new Promise((resolve) => {
        console.log('📦 Loading users...');
        
        db.ref('users').on('value', (snapshot) => {
            window.allUsers = [];
            
            snapshot.forEach((child) => {
                window.allUsers.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            console.log('✅ Users loaded:', window.allUsers.length);
            
            // Refresh users tab if currently viewing
            if (window.currentTabRefresh && window.activeTab === 'users') {
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }
            
            resolve(window.allUsers);
        });
    });
}

window.loadUsers = loadUsers;

/**
 * Submit receive device (NEW WORKFLOW - No assignment)
 */
/**
 * Submit receive device with BACK JOB support
 */
async function submitReceiveDevice(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    console.log('📥 Receiving device...');
    
    // Check if it's a back job
    const isBackJob = document.getElementById('isBackJob').checked;
    
    const repair = {
        customerType: data.get('customerType'),
        customerName: data.get('customerName'),
        shopName: data.get('shopName') || '',
        contactNumber: data.get('contactNumber'),
        brand: data.get('brand'),
        model: data.get('model'),
        
        // NEW: Device Details (Phase 2)
        imei: data.get('imei') || '',
        deviceColor: data.get('deviceColor') || 'N/A',
        storageCapacity: data.get('storageCapacity') || 'N/A',
        devicePasscode: data.get('devicePasscode') || '',
        
        // Pre-Repair Checklist - filled when technician accepts repair
        preRepairChecklist: null,
        
        problemType: data.get('problemType') || 'Pending Diagnosis',
        problem: data.get('problem'),
        repairType: 'Pending Diagnosis',
        partType: '',
        partSource: '',
        partsCost: 0,
        laborCost: 0,
        total: 0,
        status: 'Received',
        photos: photoData,
        payments: [],
        createdAt: new Date().toISOString(),
        createdBy: window.currentUser.uid,
        createdByName: window.currentUserData.displayName,
        receivedBy: window.currentUserData.displayName,
        acceptedBy: null,
        acceptedByName: null,
        acceptedAt: null,
        // Diagnosis workflow fields
        diagnosisCreated: false,
        diagnosisCreatedAt: null,
        diagnosisCreatedBy: null,
        diagnosisCreatedByName: null,
        customerApproved: false,
        customerApprovedAt: null,
        customerApprovedBy: null
        
    };
    
    // Check if pricing was provided (auto-approve if pricing present)
    const repairType = document.getElementById('preApprovedRepairType').value;
    const partsCost = parseFloat(document.getElementById('preApprovedPartsCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('preApprovedLaborCost').value) || 0;
    const total = partsCost + laborCost;
    const hasPricing = repairType && total > 0;
    
    // Handle PRE-APPROVED devices (customer already agreed to pricing)
    if (hasPricing && !isBackJob) {
        // Get quoted supplier info
        const quotedSupplier = document.getElementById('receiveSupplier')?.value || null;
        
        // Mark as pre-approved with pricing
        repair.repairType = repairType;
        repair.partsCost = partsCost;
        repair.laborCost = laborCost;
        repair.total = total;
        
        // Quote information (for tracking vs actual)
        repair.quotedSupplier = quotedSupplier;
        repair.quotedPartsCost = partsCost;
        repair.quotedDate = new Date().toISOString();
        
        // Actual costs (to be filled later when recording actual parts cost)
        repair.actualPartsCost = null;
        repair.actualSupplier = null;
        repair.costVariance = null;
        
        // Mark diagnosis as created and customer approved
        repair.diagnosisCreated = true;
        repair.diagnosisCreatedAt = new Date().toISOString();
        repair.diagnosisCreatedBy = window.currentUser.uid;
        repair.diagnosisCreatedByName = window.currentUserData.displayName;
        repair.customerApproved = true;
        repair.customerApprovedAt = new Date().toISOString();
        repair.customerApprovedBy = window.currentUser.uid;
        
        console.log('✅ Device marked as pre-approved with pricing:', {repairType, partsCost, laborCost, total, quotedSupplier});
    }
    
    // NEW: Handle assignment options for Tech/Admin/Manager
    const userRole = window.currentUserData.role;
    let assignmentMethod = 'pool'; // Default for cashiers
    let assignedTo = null;
    let assignedToName = null;
    
    if (userRole === 'technician' || userRole === 'admin' || userRole === 'manager') {
        const assignOption = data.get('assignOption');
        
        if (assignOption === 'accept-myself') {
            // Immediate self-assignment
            assignmentMethod = 'immediate-accept';
            assignedTo = window.currentUser.uid;
            assignedToName = window.currentUserData.displayName;
            
            repair.status = 'In Progress';
            repair.acceptedBy = assignedTo;
            repair.acceptedByName = assignedToName;
            repair.acceptedAt = new Date().toISOString();
            
        } else if (assignOption === 'assign-other') {
            // Assign to specific tech
            const targetTechId = document.getElementById('assignToTech')?.value;
            
            if (!targetTechId) {
                alert('Please select a technician to assign this repair to');
                return;
            }
            
            const targetTech = window.allUsers.find(u => u.uid === targetTechId);
            if (!targetTech) {
                alert('Selected technician not found');
                return;
            }
            
            assignmentMethod = 'assigned-by-receiver';
            assignedTo = targetTechId;
            assignedToName = targetTech.displayName;
            
            repair.status = 'In Progress';
            repair.acceptedBy = assignedTo;
            repair.acceptedByName = assignedToName;
            repair.acceptedAt = new Date().toISOString();
            repair.assignedBy = window.currentUserData.displayName;
            
        } else {
            // Send to pool ('pool' option or default)
            assignmentMethod = 'pool';
        }
    }
    
    repair.assignmentMethod = assignmentMethod;
    
    // Add back job information if checked
    if (isBackJob) {
        const backJobTech = document.getElementById('backJobTech').value;
        const backJobReason = document.getElementById('backJobReason').value.trim();
        
        if (!backJobTech) {
            alert('Please select the original technician for this back job');
            return;
        }
        
        if (!backJobReason) {
            alert('Please provide a reason for the back job');
            return;
        }
        
        // Get tech name from selection
        const techSelect = document.getElementById('backJobTech');
        const techName = techSelect.options[techSelect.selectedIndex].text;
        
        repair.isBackJob = true;
        repair.backJobReason = backJobReason;
        repair.originalTechId = backJobTech;
        repair.originalTechName = techName;
        repair.suggestedTech = backJobTech; // Suggest but don't force
        
        // Back jobs skip diagnosis workflow - auto-approved (warranty claim)
        repair.diagnosisCreated = true;
        repair.diagnosisCreatedAt = new Date().toISOString();
        repair.diagnosisCreatedBy = window.currentUser.uid;
        repair.diagnosisCreatedByName = window.currentUserData.displayName;
        repair.customerApproved = true; // Back jobs are pre-approved
        repair.customerApprovedAt = new Date().toISOString();
        repair.customerApprovedBy = window.currentUser.uid;
        
        // If already assigned (via assignment options), keep that assignment
        // Otherwise, if original tech is receiving, they might auto-accept via assignOption
        // If going to pool, add note about suggested tech
        if (repair.status === 'Received' && assignmentMethod === 'pool') {
            repair.notes = `🔄 Back Job - Previously handled by ${techName}`;
        }
    }
    
    try {
        await db.ref('repairs').push(repair);
        console.log('✅ Device received successfully!');
        
        // Log repair creation
        await logActivity('repair_created', {
            customerName: repair.customerName,
            brand: repair.brand,
            model: repair.model,
            problemType: repair.problemType,
            isBackJob: isBackJob || false,
            customerPreApproved: hasPricing || false
        }, `${repair.customerName} - ${repair.brand} ${repair.model} received by ${window.currentUserData.displayName}`);
        
        // Show appropriate success message based on assignment
        let successMsg = `✅ Device Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📞 ${repair.contactNumber}\n\n`;
        
        if (assignmentMethod === 'immediate-accept') {
            successMsg += `🔧 Status: ACCEPTED by you!\n✅ Device is now in your "My Jobs" list.\n📍 Status: In Progress\n\n`;
            if (hasPricing) {
                successMsg += `💰 Pricing: ₱${repair.total.toFixed(2)}\n`;
            } else {
                successMsg += `⚠️ Don't forget to:\n• Create diagnosis & set pricing\n• Get customer approval\n`;
            }
        } else if (assignmentMethod === 'assigned-by-receiver') {
            successMsg += `👤 Assigned to: ${assignedToName}\n✅ They will see it in their "My Jobs" list.\n📍 Status: In Progress\n\n`;
            if (hasPricing) {
                successMsg += `💰 Pricing: ₱${repair.total.toFixed(2)}\n`;
            }
        } else {
            successMsg += `📥 Sent to: Received Devices (pool)\n✅ Any available technician can accept it.\n\n`;
            if (isBackJob) {
                successMsg += `🔄 Back Job - Original tech: ${repair.originalTechName}\n📋 Reason: ${backJobReason}\n\n`;
            }
            if (hasPricing) {
                successMsg += `💰 Pricing: ₱${repair.total.toFixed(2)} (pre-approved)\n`;
            } else {
                successMsg += `📋 Next: Create diagnosis & get customer approval\n`;
            }
        }
        
        alert(successMsg);
        
        // Reset form
        form.reset();
        photoData = [];
        const preview = document.getElementById('receivePreview1');
        if (preview) {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        
        // Reset back job fields
        if (document.getElementById('isBackJob')) {
            document.getElementById('isBackJob').checked = false;
        }
        if (document.getElementById('backJobFields')) {
            document.getElementById('backJobFields').style.display = 'none';
        }
        
        // Reset pricing fields (they stay visible but need to be cleared)
        if (document.getElementById('preApprovedRepairType')) {
            document.getElementById('preApprovedRepairType').value = '';
        }
        if (document.getElementById('preApprovedPartsCost')) {
            document.getElementById('preApprovedPartsCost').value = '0';
        }
        if (document.getElementById('preApprovedLaborCost')) {
            document.getElementById('preApprovedLaborCost').value = '0';
        }
        if (document.getElementById('preApprovedTotal')) {
            document.getElementById('preApprovedTotal').value = '0.00';
        }
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        console.error('❌ Error receiving device:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Accept repair (NEW WORKFLOW - Tech/Owner claims job)
 */
async function acceptRepair(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    if (repair.acceptedBy) {
        alert(`This repair has already been accepted by ${repair.acceptedByName}`);
        return;
    }
    
    // Check if diagnosis has been created - allow but warn
    const hasDiagnosis = repair.diagnosisCreated && repair.total > 0 && repair.repairType !== 'Pending Diagnosis';
    const hasApproval = repair.customerApproved;
    
    if (!hasDiagnosis || !hasApproval) {
        let warningMsg = '⚠️ Warning!\n\n';
        
        if (!hasDiagnosis) {
            warningMsg += '❌ No diagnosis or pricing set yet\n';
        }
        if (!hasApproval) {
            warningMsg += '❌ Customer has not approved pricing\n';
        }
        
        warningMsg += '\nYou can accept this repair now and set pricing later, but make sure to:\n';
        warningMsg += '• Create diagnosis & set pricing\n';
        warningMsg += '• Get customer approval\n';
        warningMsg += '• Before completing the repair\n\n';
        warningMsg += 'Accept anyway?';
        
        if (!confirm(warningMsg)) {
            return;
        }
    }
    
    const confirmMsg = `Accept this repair?\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📋 ${repair.repairType}\n💰 Total: ₱${repair.total.toFixed(2)}\n\nThis will move to your job list.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        await db.ref('repairs/' + repairId).update({
            acceptedBy: window.currentUser.uid,
            acceptedByName: window.currentUserData.displayName,
            acceptedAt: new Date().toISOString(),
            status: 'In Progress',
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log repair acceptance
        await logActivity('repair_accepted', 'repair', {
            repairId: repairId,
            customerName: repair.customerName,
            brand: repair.brand,
            model: repair.model,
            total: repair.total
        });
        
        alert(`✅ Repair Accepted!\n\n📱 ${repair.brand} ${repair.model}\n💰 Total: ₱${repair.total.toFixed(2)}\n\n🔧 This repair is now in your job list.\n📍 Status changed to "In Progress"`);
        
        console.log('✅ Repair accepted successfully');
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        console.error('❌ Error accepting repair:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Open transfer repair modal
 */
async function openTransferRepairModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    if (!repair.acceptedBy) {
        alert('This repair has not been accepted yet. Only accepted repairs can be transferred.');
        return;
    }
    
    // Get available technicians (exclude current assignee)
    const availableTechs = window.allUsers.filter(u => 
        u.role === 'technician' && 
        u.uid !== repair.acceptedBy &&
        u.status === 'active'
    );
    
    if (availableTechs.length === 0) {
        alert('No other technicians available for transfer');
        return;
    }
    
    const content = `
        <div class="alert-info">
            <h3>🔄 Transfer Repair</h3>
            <p style="margin:0;"><strong>${repair.brand} ${repair.model}</strong></p>
            <p style="margin:5px 0 0 0;color:#666;">Customer: ${repair.customerName}</p>
            <p style="margin:5px 0 0 0;color:#666;">Currently with: <strong>${repair.acceptedByName || 'Unassigned'}</strong></p>
        </div>
        
        <form onsubmit="submitTransferRepair(event, '${repairId}')">
            <div class="form-group">
                <label>Transfer to Technician: *</label>
                <select id="transferToTech" required>
                    <option value="">Select technician...</option>
                    ${availableTechs.map(tech => 
                        `<option value="${tech.uid}">${tech.displayName}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Transfer Reason: *</label>
                <textarea id="transferReason" rows="3" placeholder="Why are you transferring this repair?" required></textarea>
                <small style="color:#666;">e.g., "Too busy", "Needs different expertise", "Taking leave"</small>
            </div>
            
            <div class="form-group">
                <label>Transfer Notes (optional):</label>
                <textarea id="transferNotes" rows="2" placeholder="Any important information for the receiving technician..."></textarea>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" style="flex:1;background:#9c27b0;color:white;padding:12px;border:none;border-radius:5px;cursor:pointer;font-size:14px;">
                    🔄 Transfer Repair
                </button>
                <button type="button" onclick="closeTransferModal()" style="flex:1;background:#666;color:white;padding:12px;border:none;border-radius:5px;cursor:pointer;font-size:14px;">
                    ❌ Cancel
                </button>
            </div>
        </form>
    `;
    
    document.getElementById('transferModalContent').innerHTML = content;
    document.getElementById('transferModal').style.display = 'block';
}

/**
 * Submit transfer repair
 */
async function submitTransferRepair(e, repairId) {
    e.preventDefault();
    
    const targetTechId = document.getElementById('transferToTech').value;
    const reason = document.getElementById('transferReason').value.trim();
    const notes = document.getElementById('transferNotes').value.trim();
    
    if (!targetTechId || !reason) {
        alert('Please select technician and provide transfer reason');
        return;
    }
    
    const targetTech = window.allUsers.find(u => u.uid === targetTechId);
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    if (!targetTech || !repair) {
        alert('Error: Technician or repair not found');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const transferRecord = {
            fromTech: repair.acceptedBy,
            fromTechName: repair.acceptedByName,
            toTech: targetTechId,
            toTechName: targetTech.displayName,
            transferredBy: window.currentUser.uid,
            transferredByName: window.currentUserData.displayName,
            transferredAt: new Date().toISOString(),
            reason: reason,
            notes: notes
        };
        
        // Get existing transfer history or create new array
        const existingHistory = repair.transferHistory || [];
        const updatedHistory = [...existingHistory, transferRecord];
        
        // Update repair
        await db.ref(`repairs/${repairId}`).update({
            acceptedBy: targetTechId,
            acceptedByName: targetTech.displayName,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName,
            transferHistory: updatedHistory
        });
        
        // Log activity
        await logActivity('repair_transferred', 'repair', {
            repairId: repairId,
            customerName: repair.customerName,
            brand: repair.brand,
            model: repair.model,
            fromTech: repair.acceptedByName,
            toTech: targetTech.displayName,
            reason: reason
        });
        
        utils.showLoading(false);
        closeTransferModal();
        
        alert(`✅ Repair Transferred!\n\n📱 ${repair.brand} ${repair.model}\n\nFrom: ${repair.acceptedByName}\nTo: ${targetTech.displayName}\n\n${targetTech.displayName} will see this in their "My Jobs" list.`);
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error('Error transferring repair:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Close transfer modal
 */
function closeTransferModal() {
    document.getElementById('transferModal').style.display = 'none';
}

/**
 * Handle photo upload
 */
async function handlePhotoUpload(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    
    try {
        const compressed = await utils.compressImage(file, 800);
        photoData.push(compressed);
        
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '<img src="' + compressed + '" style="width:100%;border-radius:5px;">';
            preview.style.display = 'block';
        }
        
        if (photoData.length === 1 && document.getElementById('photo2')) {
            document.getElementById('photo2').style.display = 'block';
        }
        if (photoData.length === 2 && document.getElementById('photo3')) {
            document.getElementById('photo3').style.display = 'block';
        }
    } catch (error) {
        alert('Error uploading photo: ' + error.message);
    }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Convert ISO date to YYYY-MM-DD format
 */
function isoToDateInput(isoString) {
    if (!isoString) return getTodayDate();
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Open payment modal
 */
function openPaymentModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const totalPaid = (repair.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    
    const content = document.getElementById('paymentModalContent');
    
    content.innerHTML = `
        <div class="alert-neutral">
            <h4 style="margin:0 0 10px 0;">Payment Summary</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Total Amount:</strong> ₱${repair.total.toFixed(2)}</p>
            <p><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></p>
            <p><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-size:18px;font-weight:bold;">₱${balance.toFixed(2)}</span></p>
        </div>
        
        ${balance <= 0 ? `
            <div class="alert-success" style="text-align:center;">
                <h3 style="color:green;margin:0;">✅ FULLY PAID</h3>
                <p style="margin:10px 0 0;">This repair has been fully paid.</p>
            </div>
        ` : `
            <h4>Record New Payment</h4>
            
            <div class="form-group">
                <label>Payment Date *</label>
                <input type="date" id="paymentDate" value="${getTodayDate()}" max="${getTodayDate()}" required>
                <small style="color:#666;">Select the date when payment was actually received</small>
            </div>
            
            <div class="form-group">
                <label>Payment Amount (₱) *</label>
                <input type="number" id="paymentAmount" step="0.01" min="0.01" max="${balance}" value="${balance}" required>
                <small style="color:#666;">Maximum: ₱${balance.toFixed(2)} (remaining balance)</small>
            </div>
            
            <div class="form-group">
                <label>Payment Method *</label>
                <select id="paymentMethod" required>
                    <option value="">Select Method</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="GCash">📱 GCash</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                    <option value="Card">💳 Card</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Payment Proof (Photo)</label>
                <input type="file" accept="image/*" id="paymentProof" onchange="previewPaymentProof(event)">
                <div id="paymentProofPreview" style="display:none;margin-top:10px;"></div>
            </div>
            
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea id="paymentNotes" rows="2" placeholder="Additional notes about this payment..."></textarea>
            </div>
            
            <button onclick="savePayment('${repairId}')" style="width:100%;background:#4caf50;color:white;">💰 Record Payment</button>
        `}
        
        ${(repair.payments && repair.payments.length > 0) ? `
            <div style="margin-top:20px;">
                <h4>Payment History</h4>
                <div style="max-height:300px;overflow-y:auto;">
                    ${repair.payments.map((p, i) => `
                        <div class="${p.verified ? 'alert-success-compact' : 'alert-warning-compact'}">
                            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                                <strong style="color:${p.verified ? '#2e7d32' : '#e65100'};">₱${p.amount.toFixed(2)}</strong>
                                <span style="background:${p.verified ? '#4caf50' : '#ff9800'};color:white;padding:2px 8px;border-radius:3px;font-size:12px;">
                                    ${p.verified ? '✅ Verified' : '⏳ Pending'}
                                </span>
                            </div>
                            <div style="font-size:13px;color:#666;">
                                <div><strong>Method:</strong> ${p.method}</div>
                                <div><strong>Payment Date:</strong> ${utils.formatDate(p.paymentDate || p.date)}</div>
                                <div><strong>Recorded:</strong> ${utils.formatDateTime(p.recordedDate || p.date)}</div>
                                <div><strong>Received by:</strong> ${p.receivedBy}</div>
                                ${p.notes ? `<div><strong>Notes:</strong> ${p.notes}</div>` : ''}
                                ${p.verifiedBy ? `<div><strong>Verified by:</strong> ${p.verifiedBy} on ${utils.formatDateTime(p.verifiedAt)}</div>` : ''}
                            </div>
                            ${p.photo ? `
                                <div style="margin-top:8px;">
                                    <img src="${p.photo}" onclick="showPhotoModal('${p.photo}')" style="max-width:100%;max-height:150px;cursor:pointer;border-radius:5px;">
                                </div>
                            ` : ''}
                            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                                ${!p.verified && (window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager') ? `
                                    <button onclick="verifyPayment('${repairId}', ${i})" style="background:#4caf50;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        ✅ Verify Payment
                                    </button>
                                ` : ''}
                                ${(window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager' || window.currentUserData.role === 'cashier') ? `
    <button onclick="${window.currentUserData.role === 'admin' ? `editPaymentDate('${repairId}', ${i})` : `requestPaymentDateModification('${repairId}', ${i})`}" style="background:#667eea;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
        📅 ${window.currentUserData.role === 'admin' ? 'Edit Payment Date' : 'Request Edit Payment Date'}
    </button>
` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

let paymentProofPhoto = null;

/**
 * Preview payment proof photo
 */
async function previewPaymentProof(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const compressed = await utils.compressImage(file, 800);
        paymentProofPhoto = compressed;
        
        const preview = document.getElementById('paymentProofPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + compressed + '" style="width:100%;max-height:200px;object-fit:contain;border-radius:5px;">';
            preview.style.display = 'block';
        }
    } catch (error) {
        alert('Error uploading photo: ' + error.message);
    }
}

/**
 * Save payment
 */
async function savePayment(repairId) {
    const paymentDateInput = document.getElementById('paymentDate');
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('paymentNotes').value;
    
    if (!paymentDateInput || !paymentDateInput.value) {
        alert('Please select payment date');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid payment amount');
        return;
    }
    
    if (!method) {
        alert('Please select payment method');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const totalPaid = (repair.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    
    if (amount > balance) {
        alert(`Payment amount cannot exceed balance of ₱${balance.toFixed(2)}`);
        return;
    }
    
    const selectedDate = new Date(paymentDateInput.value + 'T00:00:00');
    const paymentDate = selectedDate.toISOString();
    
    // Check if date is locked (prevent backdating)
    const dateString = paymentDateInput.value;  // Already in YYYY-MM-DD format
    if (!preventBackdating(dateString)) {
        alert('⚠️ Cannot record payment on locked date!\n\nThis date has been locked and finalized. Please contact admin if you need to make corrections.');
        return;
    }
    
    // Check if payment is collected by technician
    const isTechnician = window.currentUserData.role === 'technician';
    const isAdminOrManager = window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager';
    
    const payment = {
        amount: amount,
        method: method,
        paymentDate: paymentDate,
        recordedDate: new Date().toISOString(),
        receivedBy: window.currentUserData.displayName,
        receivedById: window.currentUser.uid,
        notes: notes,
        photo: paymentProofPhoto || null,
        // Technician payment flags
        collectedByTech: isTechnician,
        techRemittanceId: null,
        remittanceStatus: isTechnician ? 'pending' : (isAdminOrManager ? 'verified' : 'pending'),
        // Verification
        verified: isAdminOrManager,
        verifiedBy: isAdminOrManager ? window.currentUserData.displayName : null,
        verifiedAt: isAdminOrManager ? new Date().toISOString() : null
    };
    
    const existingPayments = repair.payments || [];
    
    await db.ref('repairs/' + repairId).update({
        payments: [...existingPayments, payment],
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    // Log payment activity
    await logActivity('payment_recorded', {
        repairId: repairId,
        customerName: repair.customerName,
        amount: amount,
        method: method,
        paymentDate: utils.formatDate(paymentDate),
        verified: payment.verified
    }, `₱${amount.toFixed(2)} payment recorded for ${repair.customerName} by ${window.currentUserData.displayName}`);
    
    paymentProofPhoto = null;
    
    const newBalance = balance - amount;
    const paymentDateStr = utils.formatDate(paymentDate);
    
    if (newBalance === 0) {
        alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n🎉 FULLY PAID! Balance is now ₱0.00`);
    } else {
        alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n📊 Remaining Balance: ₱${newBalance.toFixed(2)}`);
    }
    
    closePaymentModal();
    
    // Firebase listener will auto-refresh the page
}

/**
 * Edit payment date
 */
function editPaymentDate(repairId, paymentIndex) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];
    
    const currentDate = isoToDateInput(payment.paymentDate || payment.date);
    
    const content = document.getElementById('paymentModalContent');
    content.innerHTML = `
        <div class="alert-warning">
            <h4>📅 Edit Payment Date</h4>
            <p><strong>Payment Amount:</strong> ₱${payment.amount.toFixed(2)}</p>
            <p><strong>Method:</strong> ${payment.method}</p>
            <p><strong>Current Date:</strong> ${utils.formatDate(payment.paymentDate || payment.date)}</p>
        </div>
        
        <div class="form-group">
            <label>New Payment Date *</label>
            <input type="date" id="newPaymentDate" value="${currentDate}" max="${getTodayDate()}" required>
            <small style="color:#666;">Select the correct date when payment was received</small>
        </div>
        
        <div class="form-group">
            <label>Reason for Change *</label>
            <textarea id="editReason" rows="2" required placeholder="Why are you changing the date?"></textarea>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="savePaymentDateEdit('${repairId}', ${paymentIndex})" style="flex:1;background:#4caf50;color:white;">
                ✅ Save Changes
            </button>
            <button onclick="openPaymentModal('${repairId}')" style="flex:1;background:#666;color:white;">
                ❌ Cancel
            </button>
        </div>
        
        <div class="alert-danger-compact" style="margin-top:15px;">
            <p style="margin:0;font-size:13px;"><strong>⚠️ Important:</strong> Change will be logged with your name and reason.</p>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

/**
 * Edit recorded date (ADMIN ONLY)
 */
function editRecordedDate(repairId, paymentIndex) {
    const role = window.currentUserData.role;
    
    // ONLY admin can edit recorded date directly
    if (role !== 'admin') {
        // Others must request
        requestRecordedDateModification(repairId, paymentIndex);
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];
    
    const currentDate = isoToDateInput(payment.recordedDate || payment.date);
    
    const content = document.getElementById('paymentModalContent');
    content.innerHTML = `
        <div class="alert-warning">
            <h4>🕒 Edit Recorded Date (Admin Only)</h4>
            <p><strong>Payment Amount:</strong> ₱${payment.amount.toFixed(2)}</p>
            <p><strong>Method:</strong> ${payment.method}</p>
            <p><strong>Payment Date:</strong> ${utils.formatDate(payment.paymentDate || payment.date)}</p>
            <p><strong>Current Recorded Date:</strong> ${utils.formatDateTime(payment.recordedDate || payment.date)}</p>
        </div>
        
        <div class="form-group">
            <label>New Recorded Date & Time *</label>
            <input type="datetime-local" id="newRecordedDate" value="${isoToDateTimeLocal(payment.recordedDate || payment.date)}" max="${isoToDateTimeLocal(new Date().toISOString())}" required>
            <small style="color:#666;">When was this payment actually recorded in the system?</small>
        </div>
        
        <div class="form-group">
            <label>Reason for Change *</label>
            <textarea id="editRecordedReason" rows="2" required placeholder="Why are you changing the recorded date?"></textarea>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="saveRecordedDateEdit('${repairId}', ${paymentIndex})" style="flex:1;background:#4caf50;color:white;">
                ✅ Save Changes
            </button>
            <button onclick="openPaymentModal('${repairId}')" style="flex:1;background:#666;color:white;">
                ❌ Cancel
            </button>
        </div>
        
        <div class="alert-danger-compact" style="margin-top:15px;">
            <p style="margin:0;font-size:13px;"><strong>⚠️ Admin Only:</strong> This changes when the payment was entered in the system. Be very careful!</p>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

/**
 * Convert ISO to datetime-local input format
 */
function isoToDateTimeLocal(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Save recorded date edit (ADMIN ONLY)
 */
async function saveRecordedDateEdit(repairId, paymentIndex) {
    const role = window.currentUserData.role;
    
    if (role !== 'admin') {
        alert('Only admin can edit recorded dates directly!');
        return;
    }
    
    const newDateInput = document.getElementById('newRecordedDate');
    const reason = document.getElementById('editRecordedReason').value.trim();
    
    if (!newDateInput || !newDateInput.value) {
        alert('Please select a new recorded date');
        return;
    }
    
    if (!reason) {
        alert('Please provide a reason for changing the date');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payments = [...repair.payments];
    const payment = payments[paymentIndex];
    
    const oldDate = payment.recordedDate || payment.date;
    const newDate = new Date(newDateInput.value).toISOString();
    
    payments[paymentIndex] = {
        ...payment,
        recordedDate: newDate,
        recordedDateEditHistory: [
            ...(payment.recordedDateEditHistory || []),
            {
                oldDate: oldDate,
                newDate: newDate,
                reason: reason,
                editedBy: window.currentUserData.displayName,
                editedAt: new Date().toISOString()
            }
        ]
    };
    
    await db.ref('repairs/' + repairId).update({
        payments: payments,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    alert(`✅ Recorded date updated!\n\nOld: ${utils.formatDateTime(oldDate)}\nNew: ${utils.formatDateTime(newDate)}\n\nReason: ${reason}`);
    
    setTimeout(() => openPaymentModal(repairId), 100);
}

window.editRecordedDate = editRecordedDate;
window.isoToDateTimeLocal = isoToDateTimeLocal;
window.saveRecordedDateEdit = saveRecordedDateEdit;

/**
 * Save payment date edit
 */
async function savePaymentDateEdit(repairId, paymentIndex) {
    const newDateInput = document.getElementById('newPaymentDate');
    const reason = document.getElementById('editReason').value.trim();
    
    if (!newDateInput || !newDateInput.value) {
        alert('Please select a new payment date');
        return;
    }
    
    if (!reason) {
        alert('Please provide a reason for changing the date');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payments = [...repair.payments];
    const payment = payments[paymentIndex];
    
    const oldDate = payment.paymentDate || payment.date;
    const selectedDate = new Date(newDateInput.value + 'T00:00:00');
    const newDate = selectedDate.toISOString();
    
    payments[paymentIndex] = {
        ...payment,
        paymentDate: newDate,
        dateEditHistory: [
            ...(payment.dateEditHistory || []),
            {
                oldDate: oldDate,
                newDate: newDate,
                reason: reason,
                editedBy: window.currentUserData.displayName,
                editedAt: new Date().toISOString()
            }
        ]
    };
    
    await db.ref('repairs/' + repairId).update({
        payments: payments,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    alert(`✅ Payment date updated!\n\nOld Date: ${utils.formatDate(oldDate)}\nNew Date: ${utils.formatDate(newDate)}\n\nReason: ${reason}`);
    
    setTimeout(() => openPaymentModal(repairId), 100);
}

/**
 * Verify payment
 */
async function verifyPayment(repairId, paymentIndex) {
    if (!confirm('Verify this payment?')) return;
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payments = [...repair.payments];
    
    payments[paymentIndex] = {
        ...payments[paymentIndex],
        verified: true,
        verifiedBy: window.currentUserData.displayName,
        verifiedAt: new Date().toISOString()
    };
    
    // Check if repair is now fully paid
    const totalPaid = payments.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    
    const updateData = {
        payments: payments,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    // If fully paid and has technician, mark commission eligible
    if (balance <= 0 && repair.acceptedBy) {
        const commission = calculateRepairCommission(repair, repair.acceptedBy);
        if (commission.eligible) {
            updateData.commissionEligible = true;
            updateData.commissionAmount = commission.amount;
        }
    }
    
    await db.ref('repairs/' + repairId).update(updateData);
    
    // Log payment verification
    await logActivity('payment_verified', {
        repairId: repairId,
        customerName: repair.customerName,
        amount: payments[paymentIndex].amount,
        method: payments[paymentIndex].method
    }, `₱${payments[paymentIndex].amount.toFixed(2)} payment verified for ${repair.customerName} by ${window.currentUserData.displayName}`);
    
    alert('✅ Payment verified!');
    setTimeout(() => openPaymentModal(repairId), 100);
}

/**
 * Update repair status
 */
async function updateRepairStatus(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const isMicrosoldering = repair.isMicrosoldering || repair.repairType === 'Microsoldering';
    
    const content = document.getElementById('statusModalContent');
    
    content.innerHTML = `
        <div class="form-group">
            <label>Current Status: <strong>${repair.status}</strong></label>
        </div>
        
        <div class="form-group">
            <label>New Status *</label>
            <select id="newStatus" onchange="toggleRTOFields()">
                <option value="">Select Status</option>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                ${isMicrosoldering ? '<option value="Unsuccessful">Unsuccessful</option>' : ''}
                <option value="RTO">RTO (Return to Owner)</option>
            </select>
        </div>
        
        <div id="rtoFields" class="alert-warning" style="display:none;">
            <h4 style="margin:0 0 15px;">↩️ RTO Information</h4>
            
            <div class="form-group">
                <label>RTO Reason *</label>
                <select id="rtoReason">
                    <option value="">Select reason</option>
                    <option value="Unable to repair">Unable to repair (technical limitation)</option>
                    <option value="Parts unavailable">Parts unavailable or too expensive</option>
                    <option value="Customer declined cost">Customer declined after seeing cost</option>
                    <option value="Not economical">Repair cost exceeds device value</option>
                    <option value="Customer changed mind">Customer changed mind / no longer wants repair</option>
                    <option value="Other">Other reason</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Additional Notes</label>
                <textarea id="rtoNotes" rows="3" placeholder="Explain the situation..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Diagnosis Fee (₱)</label>
                <input type="number" id="diagnosisFee" min="0" step="0.01" value="0" placeholder="0.00">
                <small style="color:#666;display:block;margin-top:5px;">Leave as 0 if no fee will be charged</small>
            </div>
        </div>
        
        <div class="form-group">
            <label>General Notes (Optional)</label>
            <textarea id="statusNotes" rows="3" placeholder="Notes..."></textarea>
        </div>
        
        <button onclick="saveStatus('${repairId}')" style="width:100%;">💾 Update Status</button>
    `;
    
    document.getElementById('statusModal').style.display = 'block';
}

/**
 * Toggle RTO-specific fields
 */
function toggleRTOFields() {
    const newStatus = document.getElementById('newStatus').value;
    const rtoFields = document.getElementById('rtoFields');
    
    if (rtoFields) {
        rtoFields.style.display = newStatus === 'RTO' ? 'block' : 'none';
    }
}

/**
 * Save status update
 */
async function saveStatus(repairId) {
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!newStatus) {
        alert('Please select a status');
        return;
    }
    
    // Handle RTO status with additional validation and data
    if (newStatus === 'RTO') {
        const rtoReason = document.getElementById('rtoReason').value;
        const rtoNotes = document.getElementById('rtoNotes').value;
        const diagnosisFee = parseFloat(document.getElementById('diagnosisFee').value) || 0;
        
        if (!rtoReason) {
            alert('⚠️ Please select an RTO reason');
            return;
        }
        
        try {
            utils.showLoading(true);
            
            const repair = window.allRepairs.find(r => r.id === repairId);
            const existingNotes = repair.notes || [];
            
            const update = {
                status: 'RTO',
                rtoReason: rtoReason,
                rtoDate: new Date().toISOString(),
                rtoSetBy: window.currentUser.uid,
                rtoSetByName: window.currentUserData.displayName,
                rtoNotes: rtoNotes || '',
                diagnosisFee: diagnosisFee,
                rtoPaymentStatus: diagnosisFee > 0 ? 'pending' : 'waived',
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            };
            
            if (notes) {
                update.notes = [...existingNotes, {
                    text: notes,
                    by: window.currentUserData.displayName,
                    date: new Date().toISOString()
                }];
            }
            
            await db.ref('repairs/' + repairId).update(update);
            
            // Log the RTO action
            await logActivity('device_marked_rto', 'repair', {
                repairId: repairId,
                customerName: repair.customerName,
                rtoReason: rtoReason,
                diagnosisFee: diagnosisFee
            });
            
            utils.showLoading(false);
            alert(`✅ Device set to RTO!\n\nReason: ${rtoReason}\n${diagnosisFee > 0 ? `Diagnosis Fee: ₱${diagnosisFee.toFixed(2)}` : 'No diagnosis fee'}\n\nDevice moved to RTO Devices tab.`);
            closeStatusModal();
            
            // Firebase listener will auto-refresh the page
            
            return;
        } catch (error) {
            utils.showLoading(false);
            console.error('Error:', error);
            alert('Error: ' + error.message);
            return;
        }
    }
    
    // Auto-transition: Completed → Ready for Pickup
    if (newStatus === 'Completed') {
        try {
            utils.showLoading(true);
            
            const update = {
                status: 'Ready for Pickup',
                completedAt: new Date().toISOString(),
                completedBy: window.currentUserData.displayName,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            };
            
            if (notes) {
                const repair = window.allRepairs.find(r => r.id === repairId);
                const existingNotes = repair.notes || [];
                update.notes = [...existingNotes, {
                    text: notes,
                    by: window.currentUserData.displayName,
                    date: new Date().toISOString()
                }];
            }
            
            await db.ref('repairs/' + repairId).update(update);
            
            utils.showLoading(false);
            alert('✅ Repair completed!\n\nStatus automatically changed to "Ready for Pickup"\n\nDevice is now ready for customer pickup.');
            closeStatusModal();
            
            // Firebase listener will auto-refresh the page
            
            return;
        } catch (error) {
            utils.showLoading(false);
            console.error('Error:', error);
            alert('Error: ' + error.message);
            return;
        }
    }
    
    // Regular status update
    const update = {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    if (notes) {
        const repair = window.allRepairs.find(r => r.id === repairId);
        const existingNotes = repair.notes || [];
        update.notes = [...existingNotes, {
            text: notes,
            by: window.currentUserData.displayName,
            date: new Date().toISOString()
        }];
    }
    
    await db.ref('repairs/' + repairId).update(update);
    
    closeStatusModal();
    
    // Firebase listener will auto-refresh the page
    alert('✅ Status updated to: ' + newStatus);
}

/**
 * Delete repair
 */
async function deleteRepair(repairId) {
    if (confirm('Delete this repair? This cannot be undone.')) {
        try {
            await db.ref(`repairs/${repairId}`).remove();
            alert('✅ Repair deleted');
            
            // Force refresh immediately
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            
            // Also refresh stats
            if (window.buildStats) {
                window.buildStats();
            }
        } catch (error) {
            console.error('Error deleting repair:', error);
            alert('Error: ' + error.message);
        }
    }
}

// ===== ADMIN TOOLS FUNCTIONS (PHASE 1) =====

/**
 * Admin: Delete device (soft delete) - works for all pre-release statuses
 * Allowed statuses: Received, In Progress, Waiting for Parts, Ready for Pickup, 
 * RTO, Unsuccessful, Pending Customer Approval
 */
async function adminDeleteDevice(repairId) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    // Check if device has been released/claimed
    if (repair.claimedAt || repair.status === 'Completed') {
        alert('⚠️ Cannot delete released or completed devices!\n\nThis device has already been released to the customer.\nUse the "Un-Release" function instead if you need to make corrections.');
        return;
    }
    
    // Show device details and get confirmation
    const statusInfo = `Status: ${repair.status}\nCustomer: ${repair.customerName}\nDevice: ${repair.brand} ${repair.model}\nProblem: ${repair.problem}`;
    const totalAmount = repair.total || 0;
    const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    
    const confirmed = confirm(
        `⚠️ DELETE DEVICE ⚠️\n\n` +
        `${statusInfo}\n\n` +
        `${totalPaid > 0 ? `⚠️ WARNING: This device has ₱${totalPaid.toFixed(2)} in payments!\n\n` : ''}` +
        `This will SOFT DELETE the device (mark as deleted but keep records).\n\n` +
        `Click OK to continue...`
    );
    
    if (!confirmed) return;
    
    // Require reason
    const reason = prompt('Please enter reason for deleting this device:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required to delete a device');
        return;
    }
    
    // Password confirmation
    const password = prompt('Enter your password to confirm deletion:');
    if (!password) {
        alert('❌ Deletion cancelled');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Verify password
        const credential = firebase.auth.EmailAuthProvider.credential(
            window.currentUser.email,
            password
        );
        await window.currentUser.reauthenticateWithCredential(credential);
        
        const now = new Date().toISOString();
        
        // Create backup
        const backup = {
            ...repair,
            deletedAt: now,
            deletedBy: window.currentUserData.displayName,
            deletedById: window.currentUser.uid,
            deleteReason: reason,
            backupType: 'device_deletion'
        };
        
        await db.ref('deletedRepairs').push(backup);
        
        // Soft delete the repair
        await db.ref(`repairs/${repairId}`).update({
            deleted: true,
            deletedAt: now,
            deletedBy: window.currentUserData.displayName,
            deletedById: window.currentUser.uid,
            deleteReason: reason,
            lastUpdated: now,
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log activity
        await logActivity('device_deleted', {
            repairId: repairId,
            customerName: repair.customerName,
            device: `${repair.brand} ${repair.model}`,
            status: repair.status,
            hadPayments: totalPaid > 0,
            paymentAmount: totalPaid,
            reason: reason
        }, `Device deleted: ${repair.customerName} - ${repair.brand} ${repair.model} (${repair.status})`);
        
        utils.showLoading(false);
        alert(`✅ Device Deleted!\n\n${repair.customerName} - ${repair.brand} ${repair.model}\n\nStatus: Marked as deleted\nBackup: Saved for audit\nReason: ${reason}`);
        
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Deletion cancelled.');
        } else {
            console.error('❌ Error deleting device:', error);
            alert('Error: ' + error.message);
        }
    }
}

/**
 * Admin: Bulk delete multiple devices (soft delete)
 */
async function adminBulkDeleteDevices(repairIds) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    if (!repairIds || repairIds.length === 0) {
        alert('⚠️ No devices selected for deletion');
        return;
    }
    
    // Get all repairs
    const repairs = repairIds.map(id => window.allRepairs.find(r => r.id === id)).filter(r => r);
    
    if (repairs.length === 0) {
        alert('❌ No valid repairs found');
        return;
    }
    
    // Check for released/claimed devices
    const releasedDevices = repairs.filter(r => r.claimedAt || r.status === 'Completed');
    if (releasedDevices.length > 0) {
        alert(`⚠️ Cannot delete released or completed devices!\n\n${releasedDevices.length} of ${repairs.length} selected device(s) have been released to customers.\n\nPlease deselect released devices and try again.`);
        return;
    }
    
    // Calculate totals
    const totalWithPayments = repairs.filter(r => {
        const totalPaid = r.payments ? r.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
        return totalPaid > 0;
    }).length;
    
    const totalPaymentAmount = repairs.reduce((sum, r) => {
        const totalPaid = r.payments ? r.payments.reduce((s, p) => s + (p.amount || 0), 0) : 0;
        return sum + totalPaid;
    }, 0);
    
    // Show summary and get confirmation
    const deviceList = repairs.slice(0, 5).map(r => 
        `• ${r.customerName} - ${r.brand} ${r.model} (${r.status})`
    ).join('\n');
    
    const confirmed = confirm(
        `⚠️⚠️ BULK DELETE DEVICES ⚠️⚠️\n\n` +
        `You are about to delete ${repairs.length} device(s):\n\n` +
        `${deviceList}` +
        `${repairs.length > 5 ? `\n...and ${repairs.length - 5} more` : ''}\n\n` +
        `${totalWithPayments > 0 ? `⚠️ WARNING: ${totalWithPayments} device(s) have payments totaling ₱${totalPaymentAmount.toFixed(2)}!\n\n` : ''}` +
        `This will SOFT DELETE all selected devices (mark as deleted but keep records).\n\n` +
        `Click OK to continue...`
    );
    
    if (!confirmed) return;
    
    // Require reason
    const reason = prompt(`Please enter reason for deleting these ${repairs.length} devices:`);
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required to delete devices');
        return;
    }
    
    // Password confirmation
    const password = prompt('Enter your password to confirm bulk deletion:');
    if (!password) {
        alert('❌ Deletion cancelled');
        return;
    }
    
    try {
        utils.showLoading(true, `Deleting ${repairs.length} devices...`);
        
        // Verify password
        const credential = firebase.auth.EmailAuthProvider.credential(
            window.currentUser.email,
            password
        );
        await window.currentUser.reauthenticateWithCredential(credential);
        
        const now = new Date().toISOString();
        let successCount = 0;
        let failCount = 0;
        const errors = [];
        
        // Process each repair
        for (const repair of repairs) {
            try {
                // Create backup
                const backup = {
                    ...repair,
                    deletedAt: now,
                    deletedBy: window.currentUserData.displayName,
                    deletedById: window.currentUser.uid,
                    deleteReason: reason,
                    backupType: 'bulk_device_deletion'
                };
                
                await db.ref('deletedRepairs').push(backup);
                
                // Soft delete the repair
                await db.ref(`repairs/${repair.id}`).update({
                    deleted: true,
                    deletedAt: now,
                    deletedBy: window.currentUserData.displayName,
                    deletedById: window.currentUser.uid,
                    deleteReason: reason,
                    lastUpdated: now,
                    lastUpdatedBy: window.currentUserData.displayName
                });
                
                successCount++;
                
            } catch (err) {
                failCount++;
                errors.push(`${repair.customerName}: ${err.message}`);
                console.error('Error deleting repair:', repair.id, err);
            }
        }
        
        // Log bulk activity
        await logActivity('devices_bulk_deleted', {
            deviceCount: successCount,
            failedCount: failCount,
            totalWithPayments: totalWithPayments,
            totalPaymentAmount: totalPaymentAmount,
            reason: reason,
            repairIds: repairs.map(r => r.id)
        }, `Bulk deleted ${successCount} device(s) - Reason: ${reason}`);
        
        utils.showLoading(false);
        
        // Show results
        if (failCount === 0) {
            alert(
                `✅ Bulk Delete Complete!\n\n` +
                `Successfully deleted: ${successCount} device(s)\n` +
                `Backups: Saved for audit\n` +
                `Reason: ${reason}`
            );
        } else {
            alert(
                `⚠️ Bulk Delete Completed with Errors\n\n` +
                `Successfully deleted: ${successCount} device(s)\n` +
                `Failed: ${failCount} device(s)\n\n` +
                `Errors:\n${errors.slice(0, 3).join('\n')}` +
                `${errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''}`
            );
        }
        
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Bulk deletion cancelled.');
        } else {
            console.error('❌ Error in bulk delete:', error);
            alert('Error: ' + error.message);
        }
    }
}

/**
 * Admin: Get all pending remittances across all technicians
 */
function adminGetPendingRemittances() {
    if (!window.allTechRemittances) {
        return [];
    }
    
    const pending = window.allTechRemittances.filter(r => r.status === 'pending');
    
    // Sort by date (oldest first) to prioritize overdue ones
    pending.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    
    // Add age in days
    const now = new Date();
    pending.forEach(r => {
        const submitted = new Date(r.submittedAt);
        const ageInDays = Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
        r.ageInDays = ageInDays;
        r.isOverdue = ageInDays > 1; // Overdue if more than 1 day old
    });
    
    return pending;
}

/**
 * Admin: Get remittance statistics by technician
 */
function adminGetRemittanceStats() {
    if (!window.allTechRemittances) {
        return {};
    }
    
    const stats = {};
    
    window.allTechRemittances.forEach(r => {
        if (!stats[r.techId]) {
            stats[r.techId] = {
                techName: r.techName,
                pending: 0,
                approved: 0,
                rejected: 0,
                totalPending: 0,
                totalApproved: 0,
                totalRejected: 0,
                avgDiscrepancy: 0,
                discrepancies: []
            };
        }
        
        const s = stats[r.techId];
        
        if (r.status === 'pending') {
            s.pending++;
            s.totalPending += r.expectedAmount;
        } else if (r.status === 'approved') {
            s.approved++;
            s.totalApproved += r.expectedAmount;
        } else if (r.status === 'rejected') {
            s.rejected++;
            s.totalRejected += r.expectedAmount;
        }
        
        if (r.discrepancy !== 0) {
            s.discrepancies.push(r.discrepancy);
        }
    });
    
    // Calculate average discrepancy
    Object.values(stats).forEach(s => {
        if (s.discrepancies.length > 0) {
            s.avgDiscrepancy = s.discrepancies.reduce((sum, d) => sum + Math.abs(d), 0) / s.discrepancies.length;
        }
    });
    
    return stats;
}

/**
 * Admin: Find orphaned and problematic data
 */
function adminFindOrphanedData() {
    const issues = {
        missingCustomerInfo: [],
        missingDeviceInfo: [],
        releasedWithoutWarranty: [],
        paymentsWithoutVerification: [],
        oldPendingPayments: [],
        negativeBalance: [],
        missingTechnician: [],
        stuckInProgress: [],
        rtoWithoutFee: []
    };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    window.allRepairs.forEach(repair => {
        // Skip deleted repairs
        if (repair.deleted) return;
        
        // Missing customer info
        if (!repair.customerName || !repair.contactNumber) {
            issues.missingCustomerInfo.push({
                id: repair.id,
                issue: 'Missing customer name or contact',
                repair: repair
            });
        }
        
        // Missing device info
        if (!repair.brand || !repair.model) {
            issues.missingDeviceInfo.push({
                id: repair.id,
                issue: 'Missing brand or model',
                repair: repair
            });
        }
        
        // Released without warranty info
        if (repair.claimedAt && !repair.warrantyPeriodDays && repair.warrantyPeriodDays !== 0) {
            issues.releasedWithoutWarranty.push({
                id: repair.id,
                issue: 'Released but no warranty period set',
                repair: repair
            });
        }
        
        // Payments without verification (old)
        if (repair.payments) {
            repair.payments.forEach((payment, idx) => {
                if (!payment.verified) {
                    const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                    if (paymentDate < sevenDaysAgo) {
                        issues.paymentsWithoutVerification.push({
                            id: repair.id,
                            issue: `Payment ${idx + 1} unverified for ${Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24))} days`,
                            repair: repair,
                            paymentIndex: idx
                        });
                    }
                }
            });
            
            // Old pending payments (not released/completed)
            const totalPaid = repair.payments.filter(p => p.verified).reduce((sum, p) => sum + (p.amount || 0), 0);
            if (totalPaid > 0 && !repair.claimedAt && repair.status !== 'Completed' && repair.status !== 'RTO') {
                const lastPayment = repair.payments[repair.payments.length - 1];
                const lastPaymentDate = new Date(lastPayment.recordedDate || lastPayment.paymentDate);
                if (lastPaymentDate < thirtyDaysAgo) {
                    issues.oldPendingPayments.push({
                        id: repair.id,
                        issue: `Has payments but not released/completed for ${Math.floor((now - lastPaymentDate) / (1000 * 60 * 60 * 24))} days`,
                        repair: repair
                    });
                }
            }
            
            // Negative balance (overpaid)
            const total = repair.total || 0;
            if (totalPaid > total && total > 0) {
                issues.negativeBalance.push({
                    id: repair.id,
                    issue: `Overpaid: ₱${totalPaid.toFixed(2)} paid on ₱${total.toFixed(2)} total`,
                    repair: repair
                });
            }
        }
        
        // Missing technician assignment (not in Received status)
        if (!repair.acceptedBy && repair.status !== 'Received' && repair.status !== 'Pending Customer Approval' && repair.status !== 'RTO') {
            issues.missingTechnician.push({
                id: repair.id,
                issue: `Status "${repair.status}" but no technician assigned`,
                repair: repair
            });
        }
        
        // Stuck in progress for too long
        if ((repair.status === 'In Progress' || repair.status === 'Waiting for Parts') && repair.acceptedAt) {
            const acceptedDate = new Date(repair.acceptedAt);
            if (acceptedDate < thirtyDaysAgo) {
                issues.stuckInProgress.push({
                    id: repair.id,
                    issue: `Stuck in "${repair.status}" for ${Math.floor((now - acceptedDate) / (1000 * 60 * 60 * 24))} days`,
                    repair: repair
                });
            }
        }
        
        // RTO without diagnosis fee
        if (repair.status === 'RTO' && (!repair.diagnosisFee || repair.diagnosisFee === 0)) {
            // Check if there are any payments
            const hasPaid = repair.payments && repair.payments.length > 0;
            if (!hasPaid) {
                issues.rtoWithoutFee.push({
                    id: repair.id,
                    issue: 'RTO status but no diagnosis fee charged',
                    repair: repair
                });
            }
        }
    });
    
    // Count total issues
    let totalIssues = 0;
    Object.values(issues).forEach(arr => {
        totalIssues += arr.length;
    });
    
    return {
        issues,
        totalIssues,
        categories: {
            missingCustomerInfo: issues.missingCustomerInfo.length,
            missingDeviceInfo: issues.missingDeviceInfo.length,
            releasedWithoutWarranty: issues.releasedWithoutWarranty.length,
            paymentsWithoutVerification: issues.paymentsWithoutVerification.length,
            oldPendingPayments: issues.oldPendingPayments.length,
            negativeBalance: issues.negativeBalance.length,
            missingTechnician: issues.missingTechnician.length,
            stuckInProgress: issues.stuckInProgress.length,
            rtoWithoutFee: issues.rtoWithoutFee.length
        }
    };
}

/**
 * Admin: Quick fix for missing warranty info
 */
async function adminQuickFixWarranty(repairId, warrantyDays) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const repair = window.allRepairs.find(r => r.id === repairId);
        if (!repair || !repair.claimedAt) {
            throw new Error('Repair not found or not released');
        }
        
        const warrantyStartDate = repair.claimedAt;
        const warrantyEndDate = new Date(new Date(warrantyStartDate).getTime() + (warrantyDays * 24 * 60 * 60 * 1000)).toISOString();
        
        await db.ref(`repairs/${repairId}`).update({
            warrantyPeriodDays: warrantyDays,
            warrantyStartDate: warrantyStartDate,
            warrantyEndDate: warrantyEndDate,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        await logActivity('warranty_fixed', {
            repairId: repairId,
            customerName: repair.customerName,
            warrantyDays: warrantyDays
        }, `Admin fixed missing warranty: ${repair.customerName} - ${warrantyDays} days`);
        
        utils.showLoading(false);
        alert(`✅ Warranty info added: ${warrantyDays} days`);
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error('Error fixing warranty:', error);
        alert('Error: ' + error.message);
    }
}

// ===== END ADMIN TOOLS FUNCTIONS =====

/**
 * Open additional repair modal
 */
function openAdditionalRepairModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) return;
    
    const content = document.getElementById('additionalRepairModalContent');
    content.innerHTML = `
        <div class="form-group">
            <label>Additional Problem *</label>
            <textarea id="additionalProblem" rows="3" required></textarea>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Parts Cost (₱)</label>
                <input type="number" id="additionalPartsCost" step="0.01" value="0">
            </div>
            <div class="form-group">
                <label>Labor Cost (₱)</label>
                <input type="number" id="additionalLaborCost" step="0.01" value="0">
            </div>
        </div>
        
        <button onclick="saveAdditionalRepair('${repairId}')" style="width:100%;">💾 Add Additional Repair</button>
    `;
    
    document.getElementById('additionalRepairModal').style.display = 'block';
}

/**
 * Save additional repair
 */
async function saveAdditionalRepair(repairId) {
    const problem = document.getElementById('additionalProblem').value.trim();
    const partsCost = parseFloat(document.getElementById('additionalPartsCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('additionalLaborCost').value) || 0;
    
    if (!problem) {
        alert('Please describe the additional problem');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const additionalTotal = partsCost + laborCost;
    
    const additionalRepair = {
        problem: problem,
        partsCost: partsCost,
        laborCost: laborCost,
        total: additionalTotal,
        addedBy: window.currentUserData.displayName,
        addedAt: new Date().toISOString()
    };
    
    const existingAdditional = repair.additionalRepairs || [];
    
    await db.ref('repairs/' + repairId).update({
        additionalRepairs: [...existingAdditional, additionalRepair],
        total: repair.total + additionalTotal,
        partsCost: repair.partsCost + partsCost,
        laborCost: repair.laborCost + laborCost,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    closeAdditionalRepairModal();
    alert(`✅ Additional repair added! New total: ₱${(repair.total + additionalTotal).toFixed(2)}`);
    
    // Firebase listener will auto-refresh the page
}

/**
 * Request modification for payment date (Non-admin)
 */
function requestPaymentDateModification(repairId, paymentIndex) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];
    
    const currentDate = utils.formatDate(payment.paymentDate || payment.date);
    
    const content = document.getElementById('paymentModalContent');
    content.innerHTML = `
        <div class="alert-info">
            <h4>📝 Request Payment Date Change</h4>
            <p>You need admin approval to change payment dates</p>
        </div>
        
        <div class="alert-neutral" style="padding:12px;">
            <p><strong>Payment:</strong> ₱${payment.amount.toFixed(2)}</p>
            <p><strong>Current Date:</strong> ${currentDate}</p>
        </div>
        
        <div class="form-group">
            <label>Requested New Date *</label>
            <input type="date" id="requestedPaymentDate" max="${getTodayDate()}" required>
        </div>
        
        <div class="form-group">
            <label>Reason for Change * (English or Tagalog OK)</label>
            <textarea id="modificationReason" rows="3" required placeholder="Bakit kailangan palitan? / Why does this need to be changed?"></textarea>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="submitModificationRequest('${repairId}', ${paymentIndex}, 'payment-date')" style="flex:1;background:#2196f3;color:white;">
                📤 Submit Request
            </button>
            <button onclick="openPaymentModal('${repairId}')" style="flex:1;background:#666;color:white;">
                ❌ Cancel
            </button>
        </div>
        
        <div class="alert-warning-compact" style="margin-top:15px;">
            <p style="margin:0;font-size:13px;">⏳ Your request will be sent to admin for approval</p>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

/**
 * Request modification for recorded date (Non-admin)
 */
function requestRecordedDateModification(repairId, paymentIndex) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];
    
    const currentDate = utils.formatDateTime(payment.recordedDate || payment.date);
    
    const content = document.getElementById('paymentModalContent');
    content.innerHTML = `
        <div class="alert-info">
            <h4>📝 Request Recorded Date Change</h4>
            <p>You need admin approval to change recorded dates</p>
        </div>
        
        <div class="alert-neutral" style="padding:12px;">
            <p><strong>Payment:</strong> ₱${payment.amount.toFixed(2)}</p>
            <p><strong>Current Recorded:</strong> ${currentDate}</p>
        </div>
        
        <div class="form-group">
            <label>Requested New Recorded Date & Time *</label>
            <input type="datetime-local" id="requestedRecordedDate" max="${isoToDateTimeLocal(new Date().toISOString())}" required>
        </div>
        
        <div class="form-group">
            <label>Reason for Change * (English or Tagalog OK)</label>
            <textarea id="modificationReason" rows="3" required placeholder="Bakit kailangan palitan? / Why does this need to be changed?"></textarea>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="submitModificationRequest('${repairId}', ${paymentIndex}, 'recorded-date')" style="flex:1;background:#2196f3;color:white;">
                📤 Submit Request
            </button>
            <button onclick="openPaymentModal('${repairId}')" style="flex:1;background:#666;color:white;">
                ❌ Cancel
            </button>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

/**
 * Submit modification request
 */
async function submitModificationRequest(repairId, paymentIndex, requestType) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];
    const reason = document.getElementById('modificationReason').value.trim();
    
    if (!reason) {
        alert('Please provide a reason for the modification');
        return;
    }
    
    let newValue;
    let oldValue;
    
    if (requestType === 'payment-date') {
        const newDateInput = document.getElementById('requestedPaymentDate');
        if (!newDateInput || !newDateInput.value) {
            alert('Please select a new payment date');
            return;
        }
        const selectedDate = new Date(newDateInput.value + 'T00:00:00');
        newValue = selectedDate.toISOString();
        oldValue = payment.paymentDate || payment.date;
    } else if (requestType === 'recorded-date') {
        const newDateInput = document.getElementById('requestedRecordedDate');
        if (!newDateInput || !newDateInput.value) {
            alert('Please select a new recorded date');
            return;
        }
        newValue = new Date(newDateInput.value).toISOString();
        oldValue = payment.recordedDate || payment.date;
    }
    
    const modRequest = {
        repairId: repairId,
        paymentIndex: paymentIndex,
        requestType: requestType,
        oldValue: oldValue,
        newValue: newValue,
        reason: reason,
        repairDetails: `${repair.customerName} - ${repair.brand} ${repair.model}`,
        paymentAmount: payment.amount,
        requestedBy: window.currentUser.uid,
        requestedByName: window.currentUserData.displayName,
        requestedByRole: window.currentUserData.role,
        requestedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        await db.ref('modificationRequests').push(modRequest);
        
        alert(`✅ Request Submitted!\n\nYour modification request has been sent to admin for approval.\n\nYou can check the status in "📝 My Requests" tab.`);
        
        closePaymentModal();
        
        // Switch to requests tab if available
        if (window.switchTab) {
            setTimeout(() => window.switchTab('requests'), 500);
        }
        
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Error: ' + error.message);
    }
}

window.requestPaymentDateModification = requestPaymentDateModification;
window.requestRecordedDateModification = requestRecordedDateModification;
window.submitModificationRequest = submitModificationRequest;

/**
 * Process modification request (Admin only)
 */
async function processModificationRequest(requestId, action) {
    if (window.currentUserData.role !== 'admin') {
        alert('Only admin can process modification requests!');
        return;
    }
    
    const request = window.allModificationRequests.find(r => r.id === requestId);
    if (!request) {
        alert('Request not found');
        return;
    }
    
    const actionText = action === 'approve' ? 'APPROVE' : 'REJECT';
    const adminNotes = prompt(`${actionText} this request?\n\nReason: ${request.reason}\n\nAdd admin notes (optional):`);
    
    if (adminNotes === null) return; // Cancelled
    
    try {
        if (action === 'approve') {
            // Apply the modification
            const repair = window.allRepairs.find(r => r.id === request.repairId);
            const payments = [...repair.payments];
            const payment = payments[request.paymentIndex];
            
            if (request.requestType === 'payment-date') {
                payments[request.paymentIndex] = {
                    ...payment,
                    paymentDate: request.newValue,
                    dateEditHistory: [
                        ...(payment.dateEditHistory || []),
                        {
                            oldDate: request.oldValue,
                            newDate: request.newValue,
                            reason: request.reason,
                            editedBy: request.requestedByName,
                            approvedBy: window.currentUserData.displayName,
                            editedAt: new Date().toISOString()
                        }
                    ]
                };
            } else if (request.requestType === 'recorded-date') {
                payments[request.paymentIndex] = {
                    ...payment,
                    recordedDate: request.newValue,
                    recordedDateEditHistory: [
                        ...(payment.recordedDateEditHistory || []),
                        {
                            oldDate: request.oldValue,
                            newDate: request.newValue,
                            reason: request.reason,
                            editedBy: request.requestedByName,
                            approvedBy: window.currentUserData.displayName,
                            editedAt: new Date().toISOString()
                        }
                    ]
                };
            }
            
            await db.ref('repairs/' + request.repairId).update({
                payments: payments,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            });
        }
        
        // Update request status
        await db.ref('modificationRequests/' + requestId).update({
            status: action === 'approve' ? 'approved' : 'rejected',
            processedBy: window.currentUser.uid,
            processedByName: window.currentUserData.displayName,
            processedAt: new Date().toISOString(),
            adminNotes: adminNotes || null
        });
        
        alert(`✅ Request ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
        
    } catch (error) {
        console.error('Error processing request:', error);
        alert('Error: ' + error.message);
    }
}

window.processModificationRequest = processModificationRequest;

// Modal close functions
function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

function closeAdditionalRepairModal() {
    document.getElementById('additionalRepairModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function closeAcceptRepairModal() {
    document.getElementById('acceptRepairModal').style.display = 'none';
}

/**
 * Open accept repair modal with pre-repair checklist
 */
function openAcceptRepairModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    if (repair.acceptedBy) {
        alert(`This repair has already been accepted by ${repair.acceptedByName}`);
        return;
    }
    
    // Check if diagnosis has been created
    if (!repair.diagnosisCreated || repair.total === 0 || repair.repairType === 'Pending Diagnosis') {
        alert('⚠️ Diagnosis Required!\n\nPlease create a diagnosis and set pricing before accepting this repair.\n\nUse "📝 Create Diagnosis" button to set the repair details and price.');
        return;
    }
    
    // Check if customer has approved the price
    if (!repair.customerApproved) {
        alert('⚠️ Customer Approval Required!\n\nCustomer must approve the diagnosis and pricing before you can accept this repair.\n\nCurrent Price: ₱' + repair.total.toFixed(2) + '\n\nPlease wait for customer approval or use "✅ Mark Customer Approved" button if customer has verbally approved.');
        return;
    }
    
    const content = document.getElementById('acceptRepairModalContent');
    content.innerHTML = `
        <div class="alert-success" style="margin-bottom:20px;">
            <h4>📱 Repair Details</h4>
            <p style="margin:5px 0;"><strong>Customer:</strong> ${repair.customerName}</p>
            <p style="margin:5px 0;"><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p style="margin:5px 0;"><strong>Problem:</strong> ${repair.problemType || repair.problem}</p>
            <p style="margin:5px 0;"><strong>Repair Type:</strong> ${repair.repairType}</p>
            <p style="margin:5px 0;"><strong>Total:</strong> ₱${repair.total.toFixed(2)}</p>
        </div>
        
        <form id="acceptRepairForm" onsubmit="submitAcceptRepair(event, '${repairId}')">
            <div style="background:var(--bg-light);padding:20px;border-radius:var(--radius-md);margin-bottom:20px;border-left:4px solid var(--info);">
                <h4 style="margin:0 0 15px 0;color:var(--info);">✅ Pre-Repair Device Checklist</h4>
                <p style="margin:0 0 15px;font-size:13px;color:var(--text-secondary);">Before starting repair, inspect the device and document its condition</p>
                
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
            
            <div class="form-actions">
                <button type="submit" class="btn-success" style="flex:1;">
                    ✅ Accept Repair & Start Work
                </button>
                <button type="button" onclick="closeAcceptRepairModal()" class="btn-secondary" style="flex:1;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    document.getElementById('acceptRepairModal').style.display = 'block';
}

/**
 * Submit accept repair with checklist
 */
async function submitAcceptRepair(e, repairId) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    try {
        utils.showLoading(true);
        
        await db.ref('repairs/' + repairId).update({
            acceptedBy: window.currentUser.uid,
            acceptedByName: window.currentUserData.displayName,
            acceptedAt: new Date().toISOString(),
            status: 'In Progress',
            preRepairChecklist: {
                screen: data.get('checklistScreen') || 'Not Checked',
                battery: data.get('checklistBattery') || 'Not Checked',
                buttons: data.get('checklistButtons') || 'Not Checked',
                camera: data.get('checklistCamera') || 'Not Checked',
                speaker: data.get('checklistSpeaker') || 'Not Checked',
                chargingPort: data.get('checklistChargingPort') || 'Not Checked',
                waterDamage: data.get('checklistWaterDamage') || 'None',
                physicalDamage: data.get('checklistPhysicalDamage') || 'None',
                simCard: data.get('checklistSimCard') || 'Not Checked',
                accessories: data.get('checklistAccessories') || '',
                notes: data.get('checklistNotes') || ''
            },
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        const repair = window.allRepairs.find(r => r.id === repairId);
        
        // Log repair acceptance
        await logActivity('repair_accepted', 'repair', {
            repairId: repairId,
            customerName: repair.customerName,
            brand: repair.brand,
            model: repair.model,
            total: repair.total
        });
        
        utils.showLoading(false);
        closeAcceptRepairModal();
        
        alert(`✅ Repair Accepted!\n\n📱 ${repair.brand} ${repair.model}\n💰 Total: ₱${repair.total.toFixed(2)}\n\n🔧 This repair is now in your job list.\n📍 Status changed to "In Progress"\n✅ Pre-repair inspection completed`);
        
        console.log('✅ Repair accepted successfully with checklist');
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        console.error('❌ Error accepting repair:', error);
        utils.showLoading(false);
        alert('Error: ' + error.message);
    }
}

/**
 * Open claim modal to release device to customer
 */
function openClaimModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const totalPaid = (repair.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    
    if (balance > 0) {
        alert(`Cannot release - Outstanding balance: ₱${balance.toFixed(2)}\n\nPlease collect payment first.`);
        return;
    }
    
    if (repair.claimedAt) {
        alert('This device has already been claimed!');
        return;
    }
    
    const content = document.getElementById('claimModalContent');
    content.innerHTML = `
        <div class="alert-success">
            <h3>✅ Release Device to Customer</h3>
            <p style="margin:0;">This will mark the device as claimed and activate warranty</p>
        </div>
        
        <div class="alert-neutral">
            <h4 style="margin:0 0 10px 0;">Repair Summary</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Contact:</strong> ${repair.contactNumber}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Problem:</strong> ${repair.problemType || repair.problem}</p>
            <p><strong>Repair:</strong> ${repair.repairType || 'N/A'}</p>
            <p><strong>Total:</strong> ₱${repair.total.toFixed(2)}</p>
            <p><strong>Status:</strong> <span style="color:green;">✅ Fully Paid</span></p>
        </div>
        
        <div class="form-group">
            <label>Warranty Period *</label>
            <select id="warrantyPeriod" onchange="updateWarrantyInfo()">
                <option value="">Select warranty period</option>
                <option value="0">No Warranty</option>
                <option value="7">7 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days (Standard)</option>
                <option value="60">60 Days (2 Months)</option>
                <option value="90">90 Days (3 Months)</option>
                <option value="180">180 Days (6 Months)</option>
                <option value="365">365 Days (1 Year)</option>
            </select>
        </div>
        
        <div id="warrantyInfoDisplay" class="alert-warning-compact" style="display:none;margin:10px 0;">
            <h4 style="margin:0 0 8px 0;">🛡️ Warranty Information</h4>
            <div id="warrantyDates"></div>
        </div>
        
        <div class="form-group">
            <label>Warranty Terms/Notes (Optional)</label>
            <textarea id="warrantyNotes" rows="3" placeholder="e.g., Warranty covers parts and labor for same issue only. Does not cover physical damage or water damage.

Tagalog OK: Warranty para sa parehong issue lang. Hindi kasali ang physical damage o tubig."></textarea>
        </div>
        
        <div class="form-group">
            <label>Release Notes (Optional)</label>
            <textarea id="claimNotes" rows="2" placeholder="Any special notes about the release..."></textarea>
        </div>
        
        <div class="form-group">
            <label style="display:flex;align-items:center;gap:10px;">
                <input type="checkbox" id="customerSignature">
                <span>Customer signed for device pickup ✍️</span>
            </label>
        </div>
        
        <div class="alert-danger-compact" style="margin:15px 0;">
            <p style="margin:0;font-size:13px;"><strong>⚠️ Important:</strong> Once released, the device will be marked as claimed and warranty period will start. This action cannot be undone.</p>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="claimDevice('${repairId}')" style="flex:1;background:#4caf50;color:white;font-size:16px;padding:12px;font-weight:bold;">
                ✅ Release to Customer
            </button>
            <button onclick="closeClaimModal()" style="flex:1;background:#666;color:white;padding:12px;">
                ❌ Cancel
            </button>
        </div>
    `;
    
    document.getElementById('claimModal').style.display = 'block';
}

/**
 * Update warranty info display
 */
function updateWarrantyInfo() {
    const warrantyDays = parseInt(document.getElementById('warrantyPeriod').value);
    const infoDisplay = document.getElementById('warrantyInfoDisplay');
    const datesDiv = document.getElementById('warrantyDates');
    
    if (!warrantyDays || warrantyDays === 0) {
        infoDisplay.style.display = 'none';
        return;
    }
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + warrantyDays);
    
    datesDiv.innerHTML = `
        <div><strong>Start Date:</strong> ${utils.formatDate(startDate.toISOString())} (Today)</div>
        <div><strong>End Date:</strong> ${utils.formatDate(endDate.toISOString())}</div>
        <div><strong>Duration:</strong> ${warrantyDays} days</div>
        <div style="color:#2e7d32;font-weight:bold;margin-top:5px;">✅ Warranty will be ACTIVE until ${utils.formatDate(endDate.toISOString())}</div>
    `;
    
    infoDisplay.style.display = 'block';
}

/**
 * Claim/Release device to customer
 */
async function claimDevice(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const warrantyPeriod = document.getElementById('warrantyPeriod').value;
    const warrantyNotes = document.getElementById('warrantyNotes').value.trim();
    const claimNotes = document.getElementById('claimNotes').value.trim();
    const customerSignature = document.getElementById('customerSignature').checked;
    
    if (!warrantyPeriod) {
        alert('Please select a warranty period (or "No Warranty")');
        return;
    }
    
    if (!confirm(`Release device to customer?\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n\nThis will activate warranty and mark as claimed.`)) {
        return;
    }
    
    const claimedAt = new Date().toISOString();
    const warrantyDays = parseInt(warrantyPeriod);
    let warrantyEndDate = null;
    
    if (warrantyDays > 0) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + warrantyDays);
        warrantyEndDate = endDate.toISOString();
    }
    
    const claimData = {
        claimedAt: claimedAt,
        releasedBy: window.currentUserData.displayName,
        releasedByUid: window.currentUser.uid,
        claimedNotes: claimNotes || null,
        claimedCustomerSignature: customerSignature,
        warrantyPeriodDays: warrantyDays,
        warrantyStartDate: claimedAt,
        warrantyEndDate: warrantyEndDate,
        warrantyNotes: warrantyNotes || null,
        status: 'Claimed',
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    try {
        await db.ref('repairs/' + repairId).update(claimData);
        
        const warrantyMsg = warrantyDays > 0 ? 
            `\n\n🛡️ WARRANTY: ${warrantyDays} days\nExpires: ${utils.formatDate(warrantyEndDate)}` :
            '\n\n⚠️ NO WARRANTY PROVIDED';
        
        alert(`✅ Device Released!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n\nReleased by: ${window.currentUserData.displayName}\nDate: ${utils.formatDateTime(claimedAt)}${warrantyMsg}\n\nDevice moved to "✅ Claimed Units"`);
        
        closeClaimModal();
        
        // Firebase listener will auto-refresh the page
        // Switch to claimed units tab if available
        if (window.switchTab) {
            window.switchTab('claimed');
        }
        
    } catch (error) {
        console.error('Error claiming device:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * View claim details
 */
function viewClaimDetails(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const warrantyEndDate = repair.warrantyEndDate ? new Date(repair.warrantyEndDate) : null;
    const isWarrantyActive = warrantyEndDate && warrantyEndDate > new Date();
    const daysSinceClaimed = Math.floor((new Date() - new Date(repair.claimedAt)) / (1000 * 60 * 60 * 24));
    
    const content = document.getElementById('claimModalContent');
    
    content.innerHTML = `
        <div class="alert-info">
            <h3 style="margin:0 0 10px 0;">📄 Claim Details</h3>
            <p style="margin:0;">Device release and warranty information</p>
        </div>
        
        <div class="alert-neutral">
            <h4 style="margin:0 0 10px 0;">Device Information</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Contact:</strong> ${repair.contactNumber}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Problem Type:</strong> ${repair.problemType || 'N/A'}</p>
            <p><strong>Repair:</strong> ${repair.repairType || 'N/A'}</p>
            <p><strong>Part Used:</strong> ${repair.partType || 'N/A'}</p>
            <p><strong>Technician:</strong> ${repair.acceptedByName || 'N/A'}</p>
            <p><strong>Total Cost:</strong> ₱${repair.total.toFixed(2)}</p>
        </div>
        
        <div class="alert-success">
            <h4>📋 Claim Information</h4>
            <p><strong>Claimed On:</strong> ${utils.formatDateTime(repair.claimedAt)}</p>
            <p><strong>Days Since Claimed:</strong> ${daysSinceClaimed} days ago</p>
            <p><strong>Released By:</strong> ${repair.releasedBy}</p>
            ${repair.claimedCustomerSignature ? '<p><strong>Customer Signature:</strong> ✓ Signed</p>' : '<p><strong>Customer Signature:</strong> Not recorded</p>'}
            ${repair.claimNotes ? `<p><strong>Release Notes:</strong> ${repair.claimNotes}</p>` : ''}
        </div>
        
        <div style="background:${isWarrantyActive ? '#e8f5e9' : '#f5f5f5'};padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid ${isWarrantyActive ? '#4caf50' : '#999'};">
            <h4 style="margin:0 0 10px 0;color:${isWarrantyActive ? '#2e7d32' : '#666'};">🛡️ Warranty Information</h4>
            ${repair.warrantyPeriodDays ? `
                <p><strong>Warranty Period:</strong> ${repair.warrantyPeriodDays} days</p>
                <p><strong>Start Date:</strong> ${utils.formatDate(repair.warrantyStartDate || repair.claimedAt)}</p>
                <p><strong>End Date:</strong> ${warrantyEndDate ? utils.formatDate(warrantyEndDate.toISOString()) : 'N/A'}</p>
                ${isWarrantyActive ? `
                    <p style="color:#2e7d32;font-weight:bold;font-size:16px;margin-top:10px;">
                        ✅ WARRANTY ACTIVE
                    </p>
                    <p style="color:#2e7d32;">
                        ${Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                ` : `
                    <p style="color:#999;font-weight:bold;font-size:16px;margin-top:10px;">
                        ⏰ WARRANTY EXPIRED
                    </p>
                    <p style="color:#999;">
                        Expired ${Math.floor((new Date() - warrantyEndDate) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                `}
                ${repair.warrantyNotes ? `
                    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd;">
                        <strong>Warranty Terms:</strong>
                        <p style="white-space:pre-wrap;margin:5px 0 0;">${repair.warrantyNotes}</p>
                    </div>
                ` : ''}
            ` : '<p style="color:#999;">No warranty provided for this repair</p>'}
        </div>
        
        ${repair.payments && repair.payments.length > 0 ? `
            <div class="alert-neutral">
                <h4 style="margin:0 0 10px 0;">💰 Payment History</h4>
                ${repair.payments.map(p => `
                    <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #ddd;">
                        <p style="margin:0;"><strong>₱${p.amount.toFixed(2)}</strong> - ${p.method}</p>
                        <p style="margin:0;font-size:13px;color:#666;">
                            ${utils.formatDate(p.paymentDate || p.date)} | 
                            Received by ${p.receivedBy} | 
                            ${p.verified ? '✅ Verified' : '⏳ Pending'}
                        </p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <button onclick="closeClaimModal()" style="width:100%;background:#2196f3;color:white;padding:12px;">
            Close
        </button>
    `;
    
    document.getElementById('claimModal').style.display = 'block';
}

/**
 * Open warranty claim modal (for devices returning under warranty)
 */
function openWarrantyClaimModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const warrantyEndDate = repair.warrantyEndDate ? new Date(repair.warrantyEndDate) : null;
    const isWarrantyActive = warrantyEndDate && warrantyEndDate > new Date();
    
    if (!isWarrantyActive) {
        alert('Warranty has expired for this device!');
        return;
    }
    
    const content = document.getElementById('claimModalContent');
    
    content.innerHTML = `
        <div class="alert-warning">
            <h3>🛡️ Warranty Claim</h3>
            <p style="margin:0;">Device returning under active warranty</p>
        </div>
        
        <div class="alert-neutral">
            <h4 style="margin:0 0 10px 0;">Original Repair</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Original Issue:</strong> ${repair.problemType || repair.problem}</p>
            <p><strong>Claimed:</strong> ${utils.formatDate(repair.claimedAt)} (${Math.floor((new Date() - new Date(repair.claimedAt)) / (1000 * 60 * 60 * 24))} days ago)</p>
        </div>
        
        <div class="alert-success">
            <h4 style="margin:0 0 8px 0;color:#2e7d32;">Active Warranty</h4>
            <p><strong>Period:</strong> ${repair.warrantyPeriodDays} days</p>
            <p><strong>Expires:</strong> ${utils.formatDate(warrantyEndDate.toISOString())}</p>
            <p style="color:#2e7d32;font-weight:bold;">
                ✅ ${Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining
            </p>
        </div>
        
        <div class="form-group">
            <label>Warranty Claim Type *</label>
            <select id="warrantyClaimType" required>
                <option value="">Select claim type</option>
                <option value="same-issue">Same Issue - Free Repair</option>
                <option value="related-issue">Related Issue - Warranty Covers</option>
                <option value="different-issue">Different Issue - NOT Covered</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Issue Description *</label>
            <textarea id="warrantyIssue" rows="3" required placeholder="Describe what's wrong now... (English or Tagalog OK)"></textarea>
        </div>
        
        <div class="form-group">
            <label>Technician Notes</label>
            <textarea id="warrantyTechNotes" rows="2" placeholder="Internal notes for technician..."></textarea>
        </div>
        
        <div style="display:flex;gap:10px;">
            <button onclick="processWarrantyClaim('${repairId}')" style="flex:1;background:#4caf50;color:white;padding:12px;font-weight:bold;">
                ✅ Accept Warranty Claim
            </button>
            <button onclick="closeClaimModal()" style="flex:1;background:#666;color:white;padding:12px;">
                ❌ Cancel
            </button>
        </div>
    `;
    
    document.getElementById('claimModal').style.display = 'block';
}

/**
 * Process warranty claim
 */
async function processWarrantyClaim(repairId) {
    const claimType = document.getElementById('warrantyClaimType').value;
    const issue = document.getElementById('warrantyIssue').value.trim();
    const techNotes = document.getElementById('warrantyTechNotes').value.trim();
    
    if (!claimType) {
        alert('Please select claim type');
        return;
    }
    
    if (!issue) {
        alert('Please describe the issue');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    if (!confirm(`Accept warranty claim?\n\nThis will create a new repair entry under warranty.`)) {
        return;
    }
    
    // Determine if free or paid
    const isCovered = claimType === 'same-issue' || claimType === 'related-issue';
    
    // Create new repair as warranty claim
    const warrantyClaim = {
        customerType: repair.customerType,
        customerName: repair.customerName,
        shopName: repair.shopName || '',
        contactNumber: repair.contactNumber,
        brand: repair.brand,
        model: repair.model,
        problemType: 'Warranty Claim',
        problem: issue,
        repairType: 'Warranty Claim',
        partType: '',
        partSource: '',
        partsCost: 0,
        laborCost: 0,
        total: isCovered ? 0 : 0, // Set to 0, will be updated if needed
        status: 'Received',
        photos: [],
        payments: [],
        createdAt: new Date().toISOString(),
        createdBy: window.currentUser.uid,
        createdByName: window.currentUserData.displayName,
        receivedBy: window.currentUserData.displayName,
        acceptedBy: repair.acceptedBy, // Auto-assign to original tech
        acceptedByName: repair.acceptedByName,
        acceptedAt: new Date().toISOString(),
        isWarrantyClaim: true,
        originalRepairId: repairId,
        warrantyClaimType: claimType,
        warrantyCovered: isCovered,
        warrantyTechNotes: techNotes || null
    };
    
    try {
        const newRepairRef = await db.ref('repairs').push(warrantyClaim);
        
        // Update original repair with warranty claim reference
        await db.ref('repairs/' + repairId).update({
            warrantyClaimId: newRepairRef.key,
            warrantyClaimDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        });
        
        const coverageMsg = isCovered ? 
            '✅ Covered under warranty - NO CHARGE' :
            '⚠️ Not covered - Will require payment';
        
        alert(`✅ Warranty Claim Accepted!\n\n📱 ${repair.brand} ${repair.model}\n\n${coverageMsg}\n\nNew repair created and assigned to ${repair.acceptedByName}\n\nCheck "📥 Received Devices" or technician's job list.`);
        
        closeClaimModal();
        
        // Refresh after a short delay to ensure Firebase has processed
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
        }, 300);
        
    } catch (error) {
        console.error('Error processing warranty claim:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Close claim modal
 */
function closeClaimModal() {
    const modal = document.getElementById('claimModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Open edit repair modal to set pricing
 */
function openEditRepairModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const content = document.getElementById('statusModalContent');
    const isNewDiagnosis = !repair.diagnosisCreated || repair.repairType === 'Pending Diagnosis';
    
    content.innerHTML = `
        <div class="alert-info">
            <h3 style="margin:0;">${isNewDiagnosis ? '📋 Create Diagnosis' : '✏️ Update Diagnosis'}</h3>
            <p style="margin:5px 0 0;"><strong>${repair.customerName}</strong> - ${repair.brand} ${repair.model}</p>
        </div>
        ${isNewDiagnosis ? `
            <div class="alert-info-compact">
                <p style="margin:0;"><strong>ℹ️ Create Diagnosis:</strong> Set repair details and pricing. After saving, status will change to "Pending Customer Approval".</p>
            </div>
        ` : `
            <div class="alert-warning-compact">
                <p style="margin:0;"><strong>⚠️ Updating Diagnosis:</strong> Changing the diagnosis will reset customer approval. Customer will need to approve again.</p>
            </div>
        `}
        
        <form id="editPricingForm" onsubmit="submitPricingUpdate(event, '${repairId}')">
            <div class="alert-neutral" style="padding:10px;">
                <p style="margin:0;font-size:13px;"><strong>Reported Issue:</strong> ${repair.problemType || repair.problem || 'N/A'}</p>
            </div>
            
            <div class="form-group">
                <label>Actual Repair Solution *</label>
                <select id="editRepairType" name="repairType" required>
                    <option value="">Select actual repair to be performed</option>
                    <option value="Screen Replacement" ${repair.repairType === 'Screen Replacement' ? 'selected' : ''}>Screen Replacement</option>
                    <option value="Battery Replacement" ${repair.repairType === 'Battery Replacement' ? 'selected' : ''}>Battery Replacement</option>
                    <option value="Charging Port Repair" ${repair.repairType === 'Charging Port Repair' ? 'selected' : ''}>Charging Port Repair</option>
                    <option value="Camera Repair" ${repair.repairType === 'Camera Repair' ? 'selected' : ''}>Camera Repair</option>
                    <option value="Speaker/Microphone" ${repair.repairType === 'Speaker/Microphone' ? 'selected' : ''}>Speaker/Microphone</option>
                    <option value="Button Repair" ${repair.repairType === 'Button Repair' ? 'selected' : ''}>Button Repair</option>
                    <option value="Water Damage Repair" ${repair.repairType === 'Water Damage Repair' ? 'selected' : ''}>Water Damage Repair</option>
                    <option value="Motherboard Repair" ${repair.repairType === 'Motherboard Repair' ? 'selected' : ''}>Motherboard Repair</option>
                    <option value="Software Issue" ${repair.repairType === 'Software Issue' ? 'selected' : ''}>Software Issue</option>
                    <option value="FRP Unlock" ${repair.repairType === 'FRP Unlock' ? 'selected' : ''}>FRP Unlock</option>
                    <option value="Password Unlock" ${repair.repairType === 'Password Unlock' ? 'selected' : ''}>Password Unlock</option>
                    <option value="Data Recovery" ${repair.repairType === 'Data Recovery' ? 'selected' : ''}>Data Recovery</option>
                    <option value="Other" ${repair.repairType === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Part Type/Description</label>
                <input type="text" name="partType" value="${repair.partType || ''}" placeholder="e.g., Original LCD, High Copy Battery">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Part Source</label>
                    <select name="partSource">
                        <option value="">Select source</option>
                        <option value="Stock" ${repair.partSource === 'Stock' ? 'selected' : ''}>Stock</option>
                        <option value="Supplier A" ${repair.partSource === 'Supplier A' ? 'selected' : ''}>Supplier A</option>
                        <option value="Supplier B" ${repair.partSource === 'Supplier B' ? 'selected' : ''}>Supplier B</option>
                        <option value="Customer Provided" ${repair.partSource === 'Customer Provided' ? 'selected' : ''}>Customer Provided</option>
                        <option value="Other" ${repair.partSource === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Parts Cost</label>
                    <input type="number" name="partsCost" value="${repair.partsCost || 0}" min="0" step="0.01" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Labor Cost</label>
                <input type="number" name="laborCost" value="${repair.laborCost || 0}" min="0" step="0.01" required>
            </div>
            
            <div class="alert-warning-compact" style="margin:15px 0;">
                <p style="margin:0;"><strong>Total:</strong> ₱<span id="totalPreview">${(parseFloat(repair.partsCost || 0) + parseFloat(repair.laborCost || 0)).toFixed(2)}</span></p>
            </div>
            
            <div style="display:flex;gap:10px;">
                <button type="submit" style="flex:1;background:#4caf50;color:white;padding:12px;font-weight:bold;">
                    ${isNewDiagnosis ? '📋 Create Diagnosis' : '💾 Update Diagnosis'}
                </button>
                <button type="button" onclick="closeStatusModal()" style="flex:1;background:#666;color:white;padding:12px;">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    // Add event listeners to update total
    const partsCostInput = content.querySelector('[name="partsCost"]');
    const laborCostInput = content.querySelector('[name="laborCost"]');
    const totalPreview = content.querySelector('#totalPreview');
    
    const updateTotal = () => {
        const parts = parseFloat(partsCostInput.value) || 0;
        const labor = parseFloat(laborCostInput.value) || 0;
        totalPreview.textContent = (parts + labor).toFixed(2);
    };
    
    partsCostInput.addEventListener('input', updateTotal);
    laborCostInput.addEventListener('input', updateTotal);
    
    // Auto-suggest repair type based on reported problem (if not already set)
    if (isNewDiagnosis && utils && utils.suggestRepairType && repair.problemType) {
        const repairTypeSelect = content.querySelector('#editRepairType');
        if (repairTypeSelect && (!repair.repairType || repair.repairType === 'Pending Diagnosis')) {
            const suggestedRepair = utils.suggestRepairType(repair.problemType);
            if (suggestedRepair) {
                repairTypeSelect.value = suggestedRepair;
            }
        }
    }
    
    document.getElementById('statusModal').style.display = 'block';
}

/**
 * Submit pricing update
 */
async function submitPricingUpdate(e, repairId) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const partsCost = parseFloat(formData.get('partsCost')) || 0;
    const laborCost = parseFloat(formData.get('laborCost')) || 0;
    const total = partsCost + laborCost;
    
    if (total <= 0) {
        alert('⚠️ Please set a valid price (greater than ₱0)');
        return;
    }
    
    const updateData = {
        repairType: formData.get('repairType'),
        partType: formData.get('partType') || '',
        partSource: formData.get('partSource') || '',
        partsCost: partsCost,
        laborCost: laborCost,
        total: total,
        // Mark diagnosis as created
        diagnosisCreated: true,
        diagnosisCreatedAt: new Date().toISOString(),
        diagnosisCreatedBy: window.currentUser.uid,
        diagnosisCreatedByName: window.currentUserData.displayName,
        // Reset customer approval (new diagnosis needs new approval)
        customerApproved: false,
        customerApprovedAt: null,
        customerApprovedBy: null,
        // Set status to pending customer approval
        status: 'Pending Customer Approval',
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    try {
        await db.ref('repairs/' + repairId).update(updateData);
        alert(`✅ Diagnosis Created!\n\n📋 Repair Type: ${updateData.repairType}\n💰 Total: ₱${total.toFixed(2)}\n\n⏳ Status: Pending Customer Approval\n\nNext: Customer must approve this price before technician can accept the repair.`);
        closeStatusModal();
        
        // Refresh current tab after a short delay to ensure Firebase has processed
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
        }, 300);
    } catch (error) {
        console.error('Error creating diagnosis:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Approve diagnosis - Mark customer approval of pricing
 */
async function approveDiagnosis(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    if (!repair.diagnosisCreated || repair.total === 0) {
        alert('⚠️ No diagnosis found!\n\nPlease create a diagnosis first before marking customer approval.');
        return;
    }
    
    if (repair.customerApproved) {
        alert('✅ Customer has already approved this diagnosis.');
        return;
    }
    
    const confirmMsg = `Mark customer approval?\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📋 ${repair.repairType}\n💰 Total: ₱${repair.total.toFixed(2)}\n\nThis will allow technicians to accept this repair.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        await db.ref('repairs/' + repairId).update({
            customerApproved: true,
            customerApprovedAt: new Date().toISOString(),
            customerApprovedBy: window.currentUser.uid,
            customerApprovedByName: window.currentUserData.displayName,
            status: 'Received', // Back to Received, ready for tech to accept
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        alert(`✅ Customer Approval Recorded!\n\n📱 ${repair.brand} ${repair.model}\n💰 Approved Price: ₱${repair.total.toFixed(2)}\n\n✅ Technicians can now accept this repair.`);
        
        // Refresh after a short delay to ensure Firebase has processed
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
        }, 300);
        
    } catch (error) {
        console.error('❌ Error approving diagnosis:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * ============================================
 * TECHNICIAN REMITTANCE SYSTEM
 * ============================================
 */

// Global state for expenses and remittances
window.techExpenses = [];
window.techRemittances = [];
let currentExpenseRepairId = null;

/**
 * Load technician expenses from Firebase
 */
async function loadTechExpenses() {
    try {
        const snapshot = await db.ref('techExpenses').once('value');
        const expenses = [];
        snapshot.forEach(child => {
            expenses.push({
                id: child.key,
                ...child.val()
            });
        });
        window.techExpenses = expenses;
        console.log('✅ Tech expenses loaded:', expenses.length);
    } catch (error) {
        console.error('❌ Error loading tech expenses:', error);
    }
}

/**
 * Load technician remittances from Firebase
 */
async function loadTechRemittances() {
    try {
        const snapshot = await db.ref('techRemittances').once('value');
        const remittances = [];
        snapshot.forEach(child => {
            remittances.push({
                id: child.key,
                ...child.val()
            });
        });
        window.techRemittances = remittances;
        console.log('✅ Tech remittances loaded:', remittances.length);
    } catch (error) {
        console.error('❌ Error loading tech remittances:', error);
    }
}

/**
 * Load daily cash counts (locked day records)
 */
async function loadDailyCashCounts() {
    try {
        const snapshot = await db.ref('dailyCashCounts').once('value');
        window.dailyCashCounts = snapshot.val() || {};
        console.log('✅ Daily cash counts loaded:', Object.keys(window.dailyCashCounts).length);
    } catch (error) {
        console.error('❌ Error loading daily cash counts:', error);
        window.dailyCashCounts = {};
    }
}

/**
 * Get daily cash data for a specific date
 */
function getDailyCashData(dateString) {
    const targetDate = new Date(dateString + 'T00:00:00').toDateString();
    
    // Get payments for this date
    const payments = [];
    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach(payment => {
                if (payment.verified) {
                    const paymentDate = new Date(payment.paymentDate || payment.recordedDate).toDateString();
                    if (paymentDate === targetDate) {
                        payments.push({
                            repairId: repair.id,
                            customerName: repair.customerName,
                            amount: payment.amount,
                            method: payment.method,
                            receivedByName: payment.receivedByName || payment.receivedBy,
                            paymentDate: payment.paymentDate
                        });
                    }
                }
            });
        }
    });
    
    // Get expenses for this date
    const expenses = [];
    (window.techExpenses || []).forEach(expense => {
        const expenseDate = new Date(expense.date).toDateString();
        if (expenseDate === targetDate) {
            expenses.push({
                id: expense.id,
                techName: expense.techName,
                category: expense.category,
                amount: expense.amount,
                description: expense.description,
                date: expense.date
            });
        }
    });
    
    // Calculate totals
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netRevenue = totalPayments - totalExpenses;
    
    // Check if locked
    const lockRecord = window.dailyCashCounts[dateString];
    const isLocked = lockRecord && lockRecord.locked;
    
    return {
        payments,
        expenses,
        totals: {
            payments: totalPayments,
            expenses: totalExpenses,
            net: netRevenue
        },
        locked: isLocked,
        lockedInfo: isLocked ? lockRecord : null
    };
}

/**
 * Open lock day confirmation modal
 */
function openLockDayModal(dateString) {
    const cashData = getDailyCashData(dateString);
    const displayDate = utils.formatDate(dateString);
    
    // Check if already locked
    if (cashData.locked) {
        alert('This day is already locked');
        return;
    }
    
    // Check if future date
    const selectedDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
        alert('Cannot lock future dates');
        return;
    }
    
    // Warn if no transactions
    if (cashData.payments.length === 0 && cashData.expenses.length === 0) {
        if (!confirm('⚠️ No transactions recorded for this date.\n\nAre you sure you want to lock this day?')) {
            return;
        }
    }
    
    // Warn if negative balance
    let warningMessage = '';
    if (cashData.totals.net < 0) {
        warningMessage = '\n\n⚠️ WARNING: Negative balance (Expenses exceed payments)';
    }
    
    const notes = prompt(
        `🔒 Lock Daily Cash Count for ${displayDate}?\n\n` +
        `Summary:\n` +
        `• Payments: ₱${cashData.totals.payments.toFixed(2)} (${cashData.payments.length} trans)\n` +
        `• Expenses: ₱${cashData.totals.expenses.toFixed(2)} (${cashData.expenses.length} trans)\n` +
        `• Net Revenue: ₱${cashData.totals.net.toFixed(2)}${warningMessage}\n\n` +
        `⚠️ Once locked, no transactions can be added or modified for this date.\n\n` +
        `Enter notes (optional):`
    );
    
    if (notes !== null) {  // User didn't cancel
        lockDailyCashCount(dateString, cashData, notes);
    }
}

/**
 * Lock a daily cash count
 */
async function lockDailyCashCount(dateString, cashData, notes) {
    try {
        utils.showLoading(true);
        
        const lockRecord = {
            date: dateString,
            dateISO: new Date(dateString + 'T00:00:00').toISOString(),
            
            // Payments breakdown
            totalPayments: cashData.totals.payments,
            paymentsCount: cashData.payments.length,
            paymentsList: cashData.payments,
            
            // Expenses breakdown
            totalExpenses: cashData.totals.expenses,
            expensesCount: cashData.expenses.length,
            expensesList: cashData.expenses,
            
            // Calculation
            netRevenue: cashData.totals.net,
            
            // Lock status
            locked: true,
            lockedAt: new Date().toISOString(),
            lockedBy: window.currentUser.uid,
            lockedByName: window.currentUserData.displayName,
            notes: notes || ''
        };
        
        await db.ref(`dailyCashCounts/${dateString}`).set(lockRecord);
        
        // Log day lock activity
        await logActivity('day_locked', 'financial', {
            date: dateString,
            totalPayments: cashData.totals.payments,
            totalExpenses: cashData.totals.expenses,
            netRevenue: cashData.totals.net,
            paymentsCount: cashData.payments.length,
            expensesCount: cashData.expenses.length
        });
        
        utils.showLoading(false);
        
        alert(`✅ Day Locked Successfully!\n\n${utils.formatDate(dateString)} is now locked and cannot be modified.`);
        
        // Reload cash counts and refresh
        await loadDailyCashCounts();
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error locking day:', error);
        alert('Error locking day: ' + error.message);
    }
}

/**
 * Open unlock day modal (Admin only)
 */
function openUnlockDayModal(dateString) {
    const role = window.currentUserData.role;
    if (role !== 'admin') {
        alert('⚠️ Only admins can unlock days');
        return;
    }
    
    const cashData = getDailyCashData(dateString);
    if (!cashData.locked) {
        alert('This day is not locked');
        return;
    }
    
    const displayDate = utils.formatDate(dateString);
    const reason = prompt(
        `⚠️ UNLOCK ${displayDate}?\n\n` +
        `This will allow modifications to historical data.\n\n` +
        `Please provide a reason for unlocking:`
    );
    
    if (reason && reason.trim()) {
        unlockDailyCashCount(dateString, reason);
    } else if (reason !== null) {
        alert('Reason is required to unlock a day');
    }
}

/**
 * Unlock a daily cash count (Admin only)
 */
async function unlockDailyCashCount(dateString, reason) {
    try {
        utils.showLoading(true);
        
        const lockRecord = window.dailyCashCounts[dateString];
        if (!lockRecord) {
            alert('No lock record found');
            utils.showLoading(false);
            return;
        }
        
        // Update lock record with unlock info
        const updatedRecord = {
            ...lockRecord,
            locked: false,
            unlockedAt: new Date().toISOString(),
            unlockedBy: window.currentUser.uid,
            unlockedByName: window.currentUserData.displayName,
            unlockReason: reason
        };
        
        await db.ref(`dailyCashCounts/${dateString}`).set(updatedRecord);
        
        // Log day unlock activity
        await logActivity('day_unlocked', 'financial', {
            date: dateString,
            reason: reason,
            originallyLockedBy: lockRecord.lockedByName
        });
        
        utils.showLoading(false);
        
        alert(`✅ Day Unlocked\n\n${utils.formatDate(dateString)} has been unlocked.\n\nTransactions can now be modified for this date.`);
        
        // Reload and refresh
        await loadDailyCashCounts();
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error unlocking day:', error);
        alert('Error unlocking day: ' + error.message);
    }
}

/**
 * Check if a date is locked (prevent backdating)
 * Returns true if editing is allowed, false if locked
 */
function preventBackdating(dateString) {
    // Check if the date is locked
    const lockRecord = window.dailyCashCounts[dateString];
    if (lockRecord && lockRecord.locked) {
        return false;  // Cannot add/edit transactions on locked dates
    }
    return true;  // OK to proceed
}

/**
 * ============================================
 * ACTIVITY LOGGING SYSTEM
 * ============================================
 */

/**
 * Log user activity for monitoring and audit trail
 */
async function logActivity(action, actionCategory, details = {}, success = true, errorMessage = null) {
    try {
        if (!window.currentUser || !window.currentUserData) {
            console.warn('⚠️ Cannot log activity: No user logged in');
            return;
        }
        
        const log = {
            // User Info
            userId: window.currentUser.uid,
            userName: window.currentUserData.displayName,
            userRole: window.currentUserData.role,
            
            // Action Info
            action: action,
            actionCategory: actionCategory,
            timestamp: new Date().toISOString(),
            
            // Device Info
            device: utils.getDeviceInfo(),
            
            // Action Details
            details: details,
            
            // Result
            success: success,
            errorMessage: errorMessage
        };
        
        await db.ref('activityLogs').push(log);
        console.log('✅ Activity logged:', action);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
        // Don't fail the main action if logging fails
    }
}

/**
 * Load activity logs from Firebase
 */
async function loadActivityLogs() {
    try {
        const snapshot = await db.ref('activityLogs')
            .orderByChild('timestamp')
            .limitToLast(1000)  // Load last 1000 logs
            .once('value');
        
        const logs = [];
        snapshot.forEach(child => {
            logs.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Sort by timestamp descending (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        window.activityLogs = logs;
        console.log('✅ Activity logs loaded:', logs.length);
    } catch (error) {
        console.error('❌ Error loading activity logs:', error);
        window.activityLogs = [];
    }
}

/**
 * Load suppliers from Firebase
 */
async function loadSuppliers() {
    return new Promise((resolve) => {
        db.ref('suppliers').orderByChild('active').equalTo(true).once('value', (snapshot) => {
            const suppliers = [];
            snapshot.forEach((child) => {
                suppliers.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            // Sort by name
            suppliers.sort((a, b) => a.name.localeCompare(b.name));
            
            window.allSuppliers = suppliers;
            resolve(suppliers);
        });
    });
}

/**
 * Quick add supplier from receive device form
 */
async function openAddSupplierFromReceive() {
    const name = prompt('Enter supplier name:');
    if (!name || !name.trim()) return;
    
    const contact = prompt('Contact number (optional):');
    
    try {
        utils.showLoading(true);
        
        const newSupplierRef = db.ref('suppliers').push();
        await newSupplierRef.set({
            name: name.trim(),
            contactNumber: contact?.trim() || '',
            active: true,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid,
            createdByName: window.currentUserData.displayName
        });
        
        await loadSuppliers();
        utils.showLoading(false);
        
        alert(`✅ Supplier "${name.trim()}" added!`);
        
        // Refresh dropdown and select new supplier
        if (window.populateReceiveSupplierDropdown) {
            window.populateReceiveSupplierDropdown();
            const select = document.getElementById('receiveSupplier');
            if (select) select.value = name.trim();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('Error adding supplier:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Quick add supplier from parts cost modal
 */
async function openAddSupplierQuick() {
    const name = prompt('Enter supplier name:');
    if (!name || !name.trim()) return;
    
    const contact = prompt('Contact number (optional):');
    
    try {
        utils.showLoading(true);
        
        // Add to Firebase suppliers
        const newSupplierRef = db.ref('suppliers').push();
        await newSupplierRef.set({
            name: name.trim(),
            contactNumber: contact?.trim() || '',
            active: true,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid,
            createdByName: window.currentUserData.displayName
        });
        
        // Reload suppliers
        await loadSuppliers();
        
        utils.showLoading(false);
        alert(`✅ Supplier "${name.trim()}" added!`);
        
        // Select the new supplier
        const supplierSelect = document.getElementById('partsCostSupplier');
        if (supplierSelect) {
            // Find the option with this name and select it
            for (let i = 0; i < supplierSelect.options.length; i++) {
                if (supplierSelect.options[i].value === name.trim()) {
                    supplierSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('Error adding supplier:', error);
        alert('Error adding supplier: ' + error.message);
    }
}

/**
 * Open Parts Cost Modal
 */
async function openPartsCostModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) return;
    
    // Load suppliers if not already loaded
    if (!window.allSuppliers) {
        await loadSuppliers();
    }
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('partsCostSupplier');
    if (supplierSelect) {
        // Clear existing options except default ones (first 3)
        while (supplierSelect.options.length > 3) {
            supplierSelect.remove(3);
        }
        
        // Add suppliers from Firebase
        window.allSuppliers.forEach(supplier => {
            const option = new Option(supplier.name, supplier.name);
            supplierSelect.add(option);
        });
        
        // Pre-select if already recorded
        if (repair.partsCostSupplier) {
            supplierSelect.value = repair.partsCostSupplier;
        }
    }
    
    document.getElementById('partsCostRepairId').value = repairId;
    document.getElementById('partsCostAmount').value = repair.partsCost || '';
    document.getElementById('partsCostNotes').value = repair.partsCostNotes || '';
    document.getElementById('partsCostModal').style.display = 'block';
}

/**
 * Save Parts Cost (Actual)
 */
async function savePartsCost() {
    const repairId = document.getElementById('partsCostRepairId').value;
    const actualAmount = parseFloat(document.getElementById('partsCostAmount').value);
    const actualSupplier = document.getElementById('partsCostSupplier').value;
    const notes = document.getElementById('partsCostNotes').value.trim();
    
    if (!actualAmount || actualAmount <= 0) {
        alert('Please enter a valid parts cost');
        return;
    }
    
    if (!actualSupplier) {
        alert('Please select a supplier');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    // Calculate variance from quote
    let costVariance = null;
    if (repair && repair.quotedPartsCost) {
        costVariance = actualAmount - repair.quotedPartsCost;
    }
    
    try {
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}`).update({
            actualPartsCost: actualAmount,
            actualSupplier: actualSupplier,
            partsCostSupplier: actualSupplier,  // For backward compatibility
            partsCostNotes: notes,
            partsCostRecordedBy: window.currentUserData.displayName,
            partsCostRecordedAt: new Date().toISOString(),
            costVariance: costVariance,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        
        let message = `✅ Actual parts cost recorded!\n\n₱${actualAmount.toFixed(2)}\nSupplier: ${actualSupplier}`;
        
        if (costVariance !== null && costVariance !== 0) {
            const varianceText = costVariance > 0 ? `+₱${costVariance.toFixed(2)} higher` : `₱${Math.abs(costVariance).toFixed(2)} lower`;
            message += `\n\nVariance from quote: ${varianceText}`;
        }
        
        alert(message);
        closePartsCostModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error saving parts cost:', error);
        alert('Error: ' + error.message);
    }
}

function closePartsCostModal() {
    document.getElementById('partsCostModal').style.display = 'none';
}

/**
 * Open Expense Modal
 */
function openExpenseModal(repairId = null) {
    currentExpenseRepairId = repairId;
    
    // Reset form
    document.getElementById('expenseType').value = repairId ? 'repair-specific' : 'general';
    document.getElementById('expenseCategory').value = 'delivery';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseNotes').value = '';
    
    // Show/hide repair ID field
    const repairIdField = document.getElementById('expenseRepairIdDisplay');
    if (repairIdField) {
        repairIdField.style.display = repairId ? 'block' : 'none';
        if (repairId) {
            const repair = window.allRepairs.find(r => r.id === repairId);
            repairIdField.textContent = `Repair: ${repair?.customerName || repairId}`;
        }
    }
    
    document.getElementById('expenseModal').style.display = 'block';
}

/**
 * Save Expense
 */
async function saveExpense() {
    const type = document.getElementById('expenseType').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value.trim();
    const notes = document.getElementById('expenseNotes').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid expense amount');
        return;
    }
    
    if (!description) {
        alert('Please enter expense description');
        return;
    }
    
    // Check if today's date is locked (prevent backdating)
    const todayString = new Date().toISOString().split('T')[0];
    if (!preventBackdating(todayString)) {
        alert('⚠️ Cannot record expense on locked date!\n\nToday has been locked and finalized. Please contact admin.');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const expense = {
            techId: window.currentUser.uid,
            techName: window.currentUserData.displayName,
            date: new Date().toISOString(),
            type: type,
            repairId: type === 'repair-specific' ? currentExpenseRepairId : null,
            category: category,
            amount: amount,
            description: description,
            notes: notes,
            createdAt: new Date().toISOString(),
            remittanceId: null
        };
        
        await db.ref('techExpenses').push(expense);
        
        // Log expense activity
        await logActivity('expense_recorded', 'financial', {
            category: category,
            amount: amount,
            description: description,
            type: type,
            repairId: expense.repairId
        });
        
        // Reload expenses
        await loadTechExpenses();
        
        utils.showLoading(false);
        alert(`✅ Expense recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📝 ${description}`);
        closeExpenseModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error saving expense:', error);
        alert('Error: ' + error.message);
    }
}

function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
    currentExpenseRepairId = null;
}

/**
 * Get technician's daily payments
 */
function getTechDailyPayments(techId, date) {
    const today = new Date(date).toDateString();
    const payments = [];
    let total = 0;
    
    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                const paymentDate = new Date(payment.recordedDate || payment.paymentDate).toDateString();
                if (payment.collectedByTech && 
                    payment.receivedById === techId && 
                    paymentDate === today &&
                    payment.remittanceStatus === 'pending') {
                    payments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        method: payment.method,
                        paymentDate: payment.paymentDate,
                        recordedDate: payment.recordedDate
                    });
                    total += payment.amount;
                }
            });
        }
    });
    
    return { payments, total };
}

/**
 * Get technician's daily expenses
 */
function getTechDailyExpenses(techId, date) {
    const today = new Date(date).toDateString();
    const expenses = window.techExpenses.filter(exp => {
        const expDate = new Date(exp.date).toDateString();
        return exp.techId === techId && 
               expDate === today && 
               !exp.remittanceId;
    });
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return { expenses, total };
}

// ===== COMMISSION CALCULATION FUNCTIONS =====

/**
 * Calculate parts cost for a repair
 * Uses inventory partsUsed or manual partsCost field
 */
function getRepairPartsCost(repair) {
    let totalPartsCost = 0;
    
    // Get cost from inventory system (Phase 3 partsUsed)
    if (repair.partsUsed) {
        const inventoryCost = Object.values(repair.partsUsed).reduce((sum, part) => {
            return sum + (part.totalCost || 0);
        }, 0);
        totalPartsCost += inventoryCost;
    }
    
    // Add manual parts cost if entered
    if (repair.partsCost) {
        totalPartsCost += parseFloat(repair.partsCost) || 0;
    }
    
    return totalPartsCost;
}

/**
 * Get delivery expenses for a specific repair
 */
function getRepairDeliveryExpenses(repairId) {
    if (!window.techExpenses) return 0;
    
    const deliveryExpenses = window.techExpenses.filter(exp => 
        exp.repairId === repairId && 
        exp.category === 'Delivery'
    );
    
    return deliveryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Calculate commission for a single repair
 * Returns: { eligible, amount, breakdown }
 */
function calculateRepairCommission(repair, techId) {
    const result = {
        eligible: false,
        amount: 0,
        breakdown: {
            repairTotal: repair.total || 0,
            partsCost: 0,
            deliveryExpenses: 0,
            netAmount: 0,
            commissionRate: 0.40
        }
    };
    
    // Check eligibility
    // 1. Must be assigned to this technician
    if (repair.acceptedBy !== techId) {
        return result;
    }
    
    // 2. Must be fully paid
    const totalPaid = (repair.payments || [])
        .filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);
    
    const balance = repair.total - totalPaid;
    
    if (balance > 0) {
        return result;
    }
    
    // 3. Must be claimed (not RTO)
    if (repair.status === 'RTO') {
        return result;
    }
    
    // Calculate commission
    result.eligible = true;
    result.breakdown.partsCost = getRepairPartsCost(repair);
    result.breakdown.deliveryExpenses = getRepairDeliveryExpenses(repair.id);
    result.breakdown.netAmount = 
        result.breakdown.repairTotal - 
        result.breakdown.partsCost - 
        result.breakdown.deliveryExpenses;
    
    result.amount = result.breakdown.netAmount * result.breakdown.commissionRate;
    
    // Ensure non-negative
    if (result.amount < 0) {
        result.amount = 0;
    }
    
    return result;
}

/**
 * Get all commission-eligible repairs for a tech on a date
 */
function getTechCommissionEligibleRepairs(techId, date) {
    const targetDate = new Date(date).toDateString();
    const eligibleRepairs = [];
    
    window.allRepairs.forEach(repair => {
        // Check if repair has payments on this date
        let hasPaymentToday = false;
        
        if (repair.payments) {
            repair.payments.forEach(payment => {
                const paymentDate = new Date(payment.recordedDate || payment.paymentDate).toDateString();
                if (paymentDate === targetDate && payment.verified) {
                    hasPaymentToday = true;
                }
            });
        }
        
        // If payment made today and repair is now fully paid, check commission
        if (hasPaymentToday) {
            const commission = calculateRepairCommission(repair, techId);
            
            if (commission.eligible && commission.amount > 0) {
                // Check if not already claimed
                if (!repair.commissionClaimedBy) {
                    eligibleRepairs.push({
                        repair: repair,
                        commission: commission
                    });
                }
            }
        }
    });
    
    return eligibleRepairs;
}

/**
 * Get total commission earned for the day
 */
function getTechDailyCommission(techId, date) {
    const eligibleRepairs = getTechCommissionEligibleRepairs(techId, date);
    
    const breakdown = eligibleRepairs.map(item => ({
        repairId: item.repair.id,
        customerName: item.repair.customerName,
        deviceInfo: `${item.repair.brand} ${item.repair.model}`,
        repairType: item.repair.repairType || 'General Repair',
        repairTotal: item.commission.breakdown.repairTotal,
        partsCost: item.commission.breakdown.partsCost,
        deliveryExpenses: item.commission.breakdown.deliveryExpenses,
        netAmount: item.commission.breakdown.netAmount,
        commission: item.commission.amount
    }));
    
    const total = breakdown.reduce((sum, item) => sum + item.commission, 0);
    
    return { breakdown, total };
}

/**
 * Toggle manual commission fields
 */
function toggleManualCommissionFields() {
    const checkbox = document.getElementById('hasManualCommission');
    const fields = document.getElementById('manualCommissionFields');
    
    if (fields) {
        fields.style.display = checkbox.checked ? 'block' : 'none';
    }
}

/**
 * Show detailed commission breakdown
 */
function showCommissionBreakdown() {
    const techId = window.currentUser.uid;
    const today = new Date();
    const { breakdown } = getTechDailyCommission(techId, today);
    
    if (breakdown.length === 0) {
        alert('No commission earned today');
        return;
    }
    
    let html = `
        <div style="max-height:400px;overflow-y:auto;">
            <h3 style="margin:0 0 20px;">📊 Commission Breakdown</h3>
            ${breakdown.map(c => `
                <div style="background:var(--bg-secondary);padding:15px;border-radius:8px;margin-bottom:15px;border-left:4px solid #4caf50;">
                    <h4 style="margin:0 0 10px;">${c.customerName}</h4>
                    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;">
                        ${c.deviceInfo} - ${c.repairType}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr auto;gap:5px;font-size:14px;">
                        <div>Repair Total:</div>
                        <div style="font-weight:bold;">₱${c.repairTotal.toFixed(2)}</div>
                        
                        <div>Parts Cost:</div>
                        <div style="color:#f44336;">-₱${c.partsCost.toFixed(2)}</div>
                        
                        <div>Delivery Expenses:</div>
                        <div style="color:#ff9800;">-₱${c.deliveryExpenses.toFixed(2)}</div>
                        
                        <div style="border-top:1px solid var(--border-color);padding-top:5px;margin-top:5px;"><strong>Net Amount:</strong></div>
                        <div style="border-top:1px solid var(--border-color);padding-top:5px;margin-top:5px;font-weight:bold;">₱${c.netAmount.toFixed(2)}</div>
                        
                        <div><strong>Your Commission (40%):</strong></div>
                        <div style="color:#4caf50;font-size:18px;font-weight:bold;">₱${c.commission.toFixed(2)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:20px;padding-top:20px;border-top:2px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:bold;color:#4caf50;">
                <span>Total Commission:</span>
                <span>₱${breakdown.reduce((sum, c) => sum + c.commission, 0).toFixed(2)}</span>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button onclick="closeUserModal()" class="btn-secondary" style="width:100%;">Close</button>
        </div>
    `;
    
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');
    const modalContent = document.getElementById('userModalContent');
    
    modalTitle.textContent = 'Commission Details';
    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

/**
 * Open Remittance Submission Modal
 */
function openRemittanceModal() {
    const techId = window.currentUser.uid;
    const today = new Date();
    
    // Check if already submitted for today
    const todayStr = today.toDateString();
    const existingRemittance = window.techRemittances.find(r => {
        const remDate = new Date(r.date).toDateString();
        return r.techId === techId && remDate === todayStr && r.status === 'pending';
    });
    
    if (existingRemittance) {
        alert('⚠️ You have already submitted a remittance for today that is pending verification.');
        return;
    }
    
    // Get today's data
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, today);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, today);
    const { breakdown: commissionBreakdown, total: commissionTotal } = getTechDailyCommission(techId, today);
    
    // Allow submission if either payments or expenses exist
    if (payments.length === 0 && expenses.length === 0) {
        alert('⚠️ No payments or expenses to remit today.');
        return;
    }
    
    // Calculate expected remittance (Payments - Commission - Expenses)
    const expectedAmount = paymentsTotal - commissionTotal - expensesTotal;
    
    // Build summary
    let summary = `
        <div class="remittance-summary-section">
            <h4>📥 Payments Collected (${payments.length})</h4>
            ${payments.length > 0 ? `
                <div class="remittance-list">
                    ${payments.map(p => `
                        <div class="remittance-item">
                            <span>${p.customerName}</span>
                            <span>₱${p.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="remittance-total">Total: ₱${paymentsTotal.toFixed(2)}</div>
            ` : `
                <p style="text-align:center;color:#999;padding:10px;">No payments collected today</p>
            `}
        </div>
        
        <div class="remittance-summary-section alert-success" style="border:none;">
            <h4>🎯 Your Commission (${commissionBreakdown.length} repairs)</h4>
            ${commissionBreakdown.length > 0 ? `
                <div class="remittance-list">
                    ${commissionBreakdown.map(c => `
                        <div class="remittance-item">
                            <div>
                                <div><strong>${c.customerName}</strong> - ${c.deviceInfo}</div>
                                <div style="font-size:12px;color:#666;">
                                    ₱${c.repairTotal.toFixed(0)} - ₱${c.partsCost.toFixed(0)} parts - ₱${c.deliveryExpenses.toFixed(0)} delivery = ₱${c.netAmount.toFixed(0)} × 40%
                                </div>
                            </div>
                            <span style="color:#4caf50;font-weight:bold;">₱${c.commission.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="remittance-total" style="background:#2e7d32;color:white;">Your Commission: ₱${commissionTotal.toFixed(2)}</div>
                <button onclick="showCommissionBreakdown()" type="button" class="btn-small" style="margin-top:10px;">📊 View Detailed Breakdown</button>
            ` : `
                <p style="text-align:center;color:#999;padding:10px;">No commission earned today (no fully-paid repairs completed)</p>
            `}
        </div>
        
        <div class="remittance-summary-section">
            <h4>💸 Other Expenses (${expenses.length})</h4>
            <div class="remittance-list">
                ${expenses.length > 0 ? expenses.map(e => `
                    <div class="remittance-item">
                        <span>${e.description}</span>
                        <span>-₱${e.amount.toFixed(2)}</span>
                    </div>
                `).join('') : '<p style="color:#999;">No other expenses recorded</p>'}
            </div>
            <div class="remittance-total">Total: -₱${expensesTotal.toFixed(2)}</div>
        </div>
        
        <div class="remittance-calculation" style="background:var(--bg-secondary);padding:15px;border-radius:8px;margin:15px 0;">
            <div class="calc-row">
                <span>Payments Collected:</span>
                <span>₱${paymentsTotal.toFixed(2)}</span>
            </div>
            <div class="calc-row" style="color:#4caf50;">
                <span>Less: Your Commission:</span>
                <span>-₱${commissionTotal.toFixed(2)}</span>
            </div>
            <div class="calc-row">
                <span>Less: Other Expenses:</span>
                <span>-₱${expensesTotal.toFixed(2)}</span>
            </div>
            <hr style="margin:10px 0;border:none;border-top:2px solid var(--border-color);">
            <div class="calc-row" style="font-size:18px;font-weight:bold;color:var(--primary);">
                <span>Amount to Remit:</span>
                <span>₱${expectedAmount.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    document.getElementById('remittanceSummary').innerHTML = summary;
    document.getElementById('actualRemittanceAmount').value = expectedAmount.toFixed(2);
    document.getElementById('remittanceNotes').value = '';
    document.getElementById('remittanceModal').style.display = 'block';
}

/**
 * Confirm and Submit Remittance
 */
async function confirmRemittance() {
    const techId = window.currentUser.uid;
    const today = new Date();
    const actualAmount = parseFloat(document.getElementById('actualRemittanceAmount').value);
    const notes = document.getElementById('remittanceNotes').value.trim();
    
    // Get manual override fields
    const hasManualOverride = document.getElementById('hasManualCommission').checked;
    const manualCommission = hasManualOverride ? parseFloat(document.getElementById('manualCommissionAmount').value) : null;
    const overrideReason = hasManualOverride ? document.getElementById('manualCommissionReason').value.trim() : '';
    
    if (isNaN(actualAmount) || actualAmount < 0) {
        alert('Please enter a valid remittance amount');
        return;
    }
    
    // Validate manual commission if entered
    if (hasManualOverride && (isNaN(manualCommission) || manualCommission < 0)) {
        alert('Please enter a valid manual commission amount');
        return;
    }
    
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, today);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, today);
    const { breakdown: commissionBreakdown, total: commissionTotal } = getTechDailyCommission(techId, today);
    
    const expectedAmount = paymentsTotal - commissionTotal - expensesTotal;
    const discrepancy = actualAmount - expectedAmount;
    
    // Require notes if there's a discrepancy
    if (Math.abs(discrepancy) > 0.01 && !notes) {
        alert('Please provide a note explaining the discrepancy');
        return;
    }
    
    let confirmMessage = `Submit remittance of ₱${actualAmount.toFixed(2)}?`;
    if (commissionTotal > 0) {
        confirmMessage += `\n\nCommission: ₱${commissionTotal.toFixed(2)}`;
    }
    if (hasManualOverride) {
        confirmMessage += `\n\n⚠️ Manual Override: ₱${manualCommission.toFixed(2)}`;
        confirmMessage += `\n(Auto-calc: ₱${commissionTotal.toFixed(2)})`;
        confirmMessage += `\n\nThis will be flagged for admin review.`;
    }
    if (discrepancy !== 0) {
        confirmMessage += `\n\nDiscrepancy: ₱${discrepancy.toFixed(2)}`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Create remittance record
        const remittanceStatus = hasManualOverride ? 'under_discussion' : 'pending';
        
        const remittance = {
            techId: techId,
            techName: window.currentUserData.displayName,
            date: today.toISOString(),
            // Payments
            paymentIds: payments.map(p => `${p.repairId}_${p.paymentIndex}`),
            totalPaymentsCollected: paymentsTotal,
            paymentsList: payments.map(p => ({
                repairId: p.repairId,
                customerName: p.customerName,
                amount: p.amount,
                method: p.method
            })),
            // Commission
            commissionEarned: commissionTotal,
            commissionBreakdown: commissionBreakdown,
            hasManualOverride: hasManualOverride,
            manualCommission: manualCommission,
            overrideReason: overrideReason,
            finalApprovedCommission: hasManualOverride ? null : commissionTotal,
            // Expenses
            expenseIds: expenses.map(e => e.id),
            totalExpenses: expensesTotal,
            expensesList: expenses.map(e => ({
                category: e.category,
                amount: e.amount,
                description: e.description
            })),
            // Calculation
            expectedRemittance: expectedAmount,
            actualAmount: actualAmount,
            discrepancy: discrepancy,
            // Status & Discussion
            status: remittanceStatus,
            discussionThread: [],
            submittedAt: new Date().toISOString(),
            // Verification
            verifiedBy: null,
            verifiedAt: null,
            verificationNotes: '',
            discrepancyReason: notes,
            resolvedBy: null,
            resolvedAt: null,
            resolutionNotes: ''
        };
        
        const remittanceRef = await db.ref('techRemittances').push(remittance);
        const remittanceId = remittanceRef.key;
        
        // Update payments with remittance ID
        const updatePromises = [];
        payments.forEach(p => {
            const repair = window.allRepairs.find(r => r.id === p.repairId);
            const updatedPayments = [...repair.payments];
            updatedPayments[p.paymentIndex] = {
                ...updatedPayments[p.paymentIndex],
                techRemittanceId: remittanceId,
                remittanceStatus: 'remitted'
            };
            updatePromises.push(
                db.ref(`repairs/${p.repairId}`).update({ payments: updatedPayments })
            );
        });
        
        // Mark commission as claimed for repairs in commission breakdown
        commissionBreakdown.forEach(c => {
            updatePromises.push(
                db.ref(`repairs/${c.repairId}`).update({
                    commissionClaimedBy: techId,
                    commissionClaimedAt: new Date().toISOString(),
                    commissionRemittanceId: remittanceId
                })
            );
        });
        
        // Update expenses with remittance ID
        expenses.forEach(e => {
            updatePromises.push(
                db.ref(`techExpenses/${e.id}`).update({ remittanceId: remittanceId })
            );
        });
        
        await Promise.all(updatePromises);
        
        // Log remittance submission
        await logActivity('remittance_submitted', {
            remittanceId: remittanceId,
            paymentsCollected: paymentsTotal,
            expenses: expensesTotal,
            expectedAmount: expectedAmount,
            actualAmount: actualAmount,
            discrepancy: discrepancy
        }, `${window.currentUserData.displayName} submitted remittance: ₱${actualAmount.toFixed(2)}${Math.abs(discrepancy) > 0.01 ? ` (discrepancy: ₱${discrepancy.toFixed(2)})` : ''}`);
        
        // Reload data
        await loadTechRemittances();
        await loadTechExpenses();
        
        utils.showLoading(false);
        alert(`✅ Remittance submitted!\n\n💰 Amount: ₱${actualAmount.toFixed(2)}\n\nWaiting for cashier/admin verification.`);
        closeRemittanceModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error submitting remittance:', error);
        alert('Error: ' + error.message);
    }
}

function closeRemittanceModal() {
    document.getElementById('remittanceModal').style.display = 'none';
}

/**
 * Open Remittance Verification Modal
 */
function openVerifyRemittanceModal(remittanceId) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) return;
    
    const discrepancy = remittance.discrepancy;
    const hasDiscrepancy = Math.abs(discrepancy) > 0.01;
    
    let details = `
        <div class="remittance-verify-header">
            <h4>Technician: ${remittance.techName}</h4>
            <p>Date: ${utils.formatDate(remittance.date)}</p>
            <p>Submitted: ${utils.formatDateTime(remittance.submittedAt)}</p>
        </div>
        
        <div class="remittance-summary-section">
            <h4>📥 Payments Collected (${remittance.paymentsList.length})</h4>
            <div class="remittance-list">
                ${remittance.paymentsList.map(p => `
                    <div class="remittance-item">
                        <span>${p.customerName}</span>
                        <span>₱${p.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="remittance-total">Total: ₱${remittance.totalPaymentsCollected.toFixed(2)}</div>
        </div>
        
        <div class="remittance-summary-section">
            <h4>💸 Expenses (${remittance.expensesList.length})</h4>
            <div class="remittance-list">
                ${remittance.expensesList.length > 0 ? remittance.expensesList.map(e => `
                    <div class="remittance-item">
                        <span>${e.description}</span>
                        <span>-₱${e.amount.toFixed(2)}</span>
                    </div>
                `).join('') : '<p style="color:#999;">No expenses</p>'}
            </div>
            <div class="remittance-total">Total: -₱${remittance.totalExpenses.toFixed(2)}</div>
        </div>
        
        <div class="remittance-calculation">
            <div class="calc-row">
                <span>Expected Amount:</span>
                <strong>₱${remittance.expectedAmount.toFixed(2)}</strong>
            </div>
            <div class="calc-row">
                <span>Actual Amount Remitted:</span>
                <strong>₱${remittance.actualAmount.toFixed(2)}</strong>
            </div>
            <div class="calc-row ${hasDiscrepancy ? 'discrepancy' : ''}">
                <span>Discrepancy:</span>
                <strong style="color:${discrepancy > 0 ? '#4caf50' : (discrepancy < 0 ? '#f44336' : '#666')}">
                    ${discrepancy > 0 ? '+' : ''}₱${discrepancy.toFixed(2)}
                    ${discrepancy > 0 ? ' (Over)' : (discrepancy < 0 ? ' (Short)' : ' (Match)')}
                </strong>
            </div>
        </div>
        
        ${hasDiscrepancy ? `
            <div class="discrepancy-warning ${Math.abs(discrepancy) > remittance.expectedAmount * 0.05 ? 'discrepancy-danger' : ''}">
                <strong>⚠️ Technician's Note:</strong>
                <p>${remittance.discrepancyReason || 'No explanation provided'}</p>
            </div>
        ` : ''}
    `;
    
    document.getElementById('remittanceDetails').innerHTML = details;
    document.getElementById('verificationNotes').value = '';
    document.getElementById('verifyRemittanceModal').dataset.remittanceId = remittanceId;
    document.getElementById('verifyRemittanceModal').style.display = 'block';
}

/**
 * Approve Remittance
 */
async function approveRemittance() {
    const remittanceId = document.getElementById('verifyRemittanceModal').dataset.remittanceId;
    const notes = document.getElementById('verificationNotes').value.trim();
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    
    if (!remittance) return;
    
    const hasDiscrepancy = Math.abs(remittance.discrepancy) > 0.01;
    
    if (hasDiscrepancy && !notes) {
        alert('Please provide verification notes explaining why you are approving despite the discrepancy');
        return;
    }
    
    if (!confirm('Approve this remittance?')) return;
    
    try {
        utils.showLoading(true);
        
        // Update remittance status
        await db.ref(`techRemittances/${remittanceId}`).update({
            status: 'approved',
            verifiedBy: window.currentUserData.displayName,
            verifiedAt: new Date().toISOString(),
            verificationNotes: notes
        });
        
        // Update all linked payments to verified
        const updatePromises = [];
        remittance.paymentIds.forEach(paymentId => {
            const [repairId, paymentIndex] = paymentId.split('_');
            const repair = window.allRepairs.find(r => r.id === repairId);
            if (repair && repair.payments && repair.payments[paymentIndex]) {
                const updatedPayments = [...repair.payments];
                updatedPayments[paymentIndex] = {
                    ...updatedPayments[paymentIndex],
                    verified: true,
                    verifiedBy: window.currentUserData.displayName,
                    verifiedAt: new Date().toISOString(),
                    remittanceStatus: 'verified'
                };
                updatePromises.push(
                    db.ref(`repairs/${repairId}`).update({ payments: updatedPayments })
                );
            }
        });
        
        await Promise.all(updatePromises);
        
        // Reload data
        await loadTechRemittances();
        
        utils.showLoading(false);
        alert('✅ Remittance approved and all payments verified!');
        closeVerifyRemittanceModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error approving remittance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Reject Remittance
 */
async function rejectRemittance() {
    const remittanceId = document.getElementById('verifyRemittanceModal').dataset.remittanceId;
    const notes = document.getElementById('verificationNotes').value.trim();
    
    if (!notes) {
        alert('Please provide a reason for rejecting this remittance');
        return;
    }
    
    if (!confirm('Reject this remittance? The technician will need to resubmit.')) return;
    
    try {
        utils.showLoading(true);
        
        // Update remittance status
        await db.ref(`techRemittances/${remittanceId}`).update({
            status: 'rejected',
            verifiedBy: window.currentUserData.displayName,
            verifiedAt: new Date().toISOString(),
            verificationNotes: notes
        });
        
        // Reset payment remittance status back to pending
        const remittance = window.techRemittances.find(r => r.id === remittanceId);
        const updatePromises = [];
        remittance.paymentIds.forEach(paymentId => {
            const [repairId, paymentIndex] = paymentId.split('_');
            const repair = window.allRepairs.find(r => r.id === repairId);
            if (repair && repair.payments && repair.payments[paymentIndex]) {
                const updatedPayments = [...repair.payments];
                updatedPayments[paymentIndex] = {
                    ...updatedPayments[paymentIndex],
                    techRemittanceId: null,
                    remittanceStatus: 'pending'
                };
                updatePromises.push(
                    db.ref(`repairs/${repairId}`).update({ payments: updatedPayments })
                );
            }
        });
        
        // Reset expense remittance IDs
        remittance.expenseIds.forEach(expenseId => {
            updatePromises.push(
                db.ref(`techExpenses/${expenseId}`).update({ remittanceId: null })
            );
        });
        
        await Promise.all(updatePromises);
        
        // Reload data
        await loadTechRemittances();
        await loadTechExpenses();
        
        utils.showLoading(false);
        alert('❌ Remittance rejected. Technician can resubmit with corrections.');
        closeVerifyRemittanceModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error rejecting remittance:', error);
        alert('Error: ' + error.message);
    }
}

function closeVerifyRemittanceModal() {
    document.getElementById('verifyRemittanceModal').style.display = 'none';
}

/**
 * Device Release Functions
 */

let serviceSlipPhoto = null;

/**
 * Open Release Device Modal
 */
function openReleaseDeviceModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) return;
    
    // Reset photo
    serviceSlipPhoto = null;
    
    // Calculate payment status
    const totalPaid = (repair.payments || []).filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    const isFullyPaid = balance <= 0;
    
    // Set repair ID
    document.getElementById('releaseRepairId').value = repairId;
    
    // Display device info
    document.getElementById('releaseDeviceInfo').innerHTML = `
        <div class="release-info-card">
            <h4>${repair.customerName}</h4>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Problem:</strong> ${repair.problem}</p>
            <p><strong>Repair:</strong> ${repair.repairType || 'General Repair'}</p>
            <p><strong>Repair ID:</strong> ${repairId}</p>
            ${repair.isBackJob ? '<p style="color:#d32f2f;font-weight:bold;">🔄 BACK JOB (Warranty)</p>' : ''}
        </div>
    `;
    
    // Display payment status
    const paymentHTML = isFullyPaid ? `
        <div class="payment-status-card paid">
            <h4 style="color:#2e7d32;margin:0 0 10px 0;">✅ FULLY PAID</h4>
            <p style="margin:0;">Total: ₱${repair.total.toFixed(2)} | Paid: ₱${totalPaid.toFixed(2)}</p>
        </div>
    ` : `
        <div class="payment-status-card unpaid">
            <h4 style="color:#e65100;margin:0 0 10px 0;">⚠️ BALANCE DUE</h4>
            <p style="margin:5px 0;">Total: ₱${repair.total.toFixed(2)}</p>
            <p style="margin:5px 0;">Paid: ₱${totalPaid.toFixed(2)}</p>
            <p style="font-size:20px;font-weight:bold;color:#d32f2f;margin:10px 0;">
                Balance: ₱${balance.toFixed(2)}
            </p>
            <button onclick="openPaymentModal('${repairId}'); closeReleaseDeviceModal();" 
                    class="btn-primary" style="margin-top:10px;width:100%;">
                💰 Record Payment First
            </button>
        </div>
    `;
    
    document.getElementById('releasePaymentStatus').innerHTML = paymentHTML;
    
    // Pre-fill customer info
    document.getElementById('releaseCustomerName').value = repair.customerName;
    document.getElementById('releaseContactNumber').value = repair.contactNumber;
    document.getElementById('releaseCustomerAddress').value = '';
    
    // Reset verification method
    document.getElementById('verificationMethod').value = 'with-slip';
    toggleVerificationMethod();
    
    // Reset photo preview
    const photoPreview = document.getElementById('serviceSlipPhotoPreview');
    if (photoPreview) {
        photoPreview.src = '';
        photoPreview.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('releaseDeviceModal').style.display = 'block';
}

/**
 * Toggle Verification Method
 */
function toggleVerificationMethod() {
    const method = document.getElementById('verificationMethod').value;
    const withSlipSection = document.getElementById('withSlipSection');
    const withoutSlipSection = document.getElementById('withoutSlipSection');
    
    if (method === 'with-slip') {
        withSlipSection.style.display = 'block';
        withoutSlipSection.style.display = 'none';
        document.getElementById('releaseCustomerAddress').required = false;
    } else {
        withSlipSection.style.display = 'none';
        withoutSlipSection.style.display = 'block';
        document.getElementById('releaseCustomerAddress').required = true;
    }
}

/**
 * Upload Service Slip Photo
 */
async function uploadServiceSlipPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        // Compress image
        const compressed = await utils.compressImage(file, 1024, 768);
        serviceSlipPhoto = compressed;
        
        // Show preview
        const preview = document.getElementById('serviceSlipPhotoPreview');
        preview.src = compressed;
        preview.style.display = 'block';
        
        console.log('✅ Service slip photo uploaded');
    } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error uploading photo: ' + error.message);
    }
}

/**
 * Confirm Release Device
 */
async function confirmReleaseDevice() {
    const repairId = document.getElementById('releaseRepairId').value;
    const verificationMethod = document.getElementById('verificationMethod').value;
    const customerName = document.getElementById('releaseCustomerName').value.trim();
    const contactNumber = document.getElementById('releaseContactNumber').value.trim();
    const releaseNotes = document.getElementById('releaseNotes').value.trim();
    
    // Basic validation
    if (!customerName || !contactNumber) {
        alert('Please confirm customer name and contact number');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    // Verify customer info
    if (customerName.toLowerCase() !== repair.customerName.toLowerCase()) {
        if (!confirm('⚠️ Customer name does not match!\n\nRecorded: ' + repair.customerName + '\nEntered: ' + customerName + '\n\nContinue anyway?')) {
            return;
        }
    }
    
    if (contactNumber !== repair.contactNumber) {
        if (!confirm('⚠️ Contact number does not match!\n\nRecorded: ' + repair.contactNumber + '\nEntered: ' + contactNumber + '\n\nContinue anyway?')) {
            return;
        }
    }
    
    // Check payment status and offer to collect payment at release
    const totalPaidBefore = (repair.payments || []).filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);
    const balanceBefore = repair.total - totalPaidBefore;
    let paymentCollected = null;
    
    if (balanceBefore > 0) {
        const collectPayment = confirm(
            `💰 Outstanding Balance: ₱${balanceBefore.toFixed(2)}\n\n` +
            `Total: ₱${repair.total.toFixed(2)}\n` +
            `Paid: ₱${totalPaidBefore.toFixed(2)}\n` +
            `Balance: ₱${balanceBefore.toFixed(2)}\n\n` +
            `Collect payment now during release?`
        );
        
        if (collectPayment) {
            const amountStr = prompt(`Enter amount to collect (Balance: ₱${balanceBefore.toFixed(2)}):`, balanceBefore.toFixed(2));
            if (amountStr) {
                const amount = parseFloat(amountStr);
                if (isNaN(amount) || amount <= 0) {
                    alert('Invalid amount entered. Proceeding without payment collection.');
                } else if (amount > balanceBefore) {
                    alert('⚠️ Amount exceeds balance! Proceeding without payment collection.');
                } else {
                    const method = prompt('Payment method:\n1 = Cash\n2 = GCash\n3 = Bank Transfer\n4 = PayMaya', '1');
                    const methodMap = {'1': 'Cash', '2': 'GCash', '3': 'Bank Transfer', '4': 'PayMaya'};
                    const paymentMethod = methodMap[method] || 'Cash';
                    
                    paymentCollected = {
                        amount: amount,
                        method: paymentMethod,
                        collectedBy: window.currentUserData.displayName,
                        collectedById: window.currentUser.uid,
                        collectedByRole: window.currentUserData.role,
                        collectedAt: new Date().toISOString()
                    };
                }
            }
        }
    }
    
    // Build release data
    const releaseData = {
        status: 'Claimed',
        claimedAt: new Date().toISOString(),
        releaseDate: new Date().toISOString(),
        releasedBy: window.currentUserData.displayName,
        releasedById: window.currentUser.uid,
        releasedByRole: window.currentUserData.role,
        // Preserve who actually repaired the device for commission tracking
        repairedBy: repair.acceptedByName || 'Unknown',
        repairedById: repair.acceptedBy || null,
        releaseNotes: releaseNotes,
        verificationMethod: verificationMethod,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    // Add verification-specific data
    if (verificationMethod === 'with-slip') {
        releaseData.serviceSlipPhoto = serviceSlipPhoto;
        releaseData.verifiedWithSlip = true;
    } else {
        // Without slip - enhanced verification
        const address = document.getElementById('releaseCustomerAddress').value.trim();
        if (!address) {
            alert('Please enter customer address for verification');
            return;
        }
        
        releaseData.enhancedVerification = {
            address: address,
            claimantPhoto: serviceSlipPhoto, // Reusing same photo field
            verifiedBy: window.currentUserData.displayName,
            verifiedAt: new Date().toISOString(),
            method: 'without-slip'
        };
    }
    
    // Add balance tracking if still unpaid after optional payment collection
    const finalBalance = paymentCollected ? (balanceBefore - paymentCollected.amount) : balanceBefore;
    if (finalBalance > 0) {
        releaseData.releasedWithBalance = finalBalance;
        releaseData.balanceNotes = 'Released with unpaid balance of ₱' + finalBalance.toFixed(2) + ' - approved by ' + window.currentUserData.displayName;
    }
    
    // Confirm release
    const confirmMsg = verificationMethod === 'with-slip'
        ? `✅ Release device with service slip photo?\n\nCustomer: ${customerName}`
        : `⚠️ Release device WITHOUT service slip?\n\nCustomer: ${customerName}\n\nEnhanced verification will be recorded.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        utils.showLoading(true);
        
        // Update device release status
        await db.ref(`repairs/${repairId}`).update(releaseData);
        
        // If payment was collected during release, save it
        if (paymentCollected) {
            const role = window.currentUserData.role;
            const payment = {
                amount: paymentCollected.amount,
                method: paymentCollected.method,
                paymentDate: paymentCollected.collectedAt,
                recordedDate: paymentCollected.collectedAt,
                receivedBy: paymentCollected.collectedBy,
                receivedById: paymentCollected.collectedById,
                notes: 'Payment collected at device release by ' + paymentCollected.collectedBy,
                // Auto-verify for cashier/admin/manager
                verified: ['admin', 'manager', 'cashier'].includes(role),
                verificationDate: ['admin', 'manager', 'cashier'].includes(role) ? paymentCollected.collectedAt : null,
                verifiedBy: ['admin', 'manager', 'cashier'].includes(role) ? paymentCollected.collectedBy : null,
                // Technician payments need remittance
                collectedByTech: role === 'technician',
                remittanceStatus: role === 'technician' ? 'pending' : 'verified'
            };
            
            const existingPayments = repair.payments || [];
            await db.ref(`repairs/${repairId}`).update({
                payments: [...existingPayments, payment]
            });
            
            // Log payment collection
            await logActivity('payment_recorded', {
                repairId: repairId,
                amount: payment.amount,
                method: payment.method,
                collectedAt: 'device_release',
                collectedBy: paymentCollected.collectedBy,
                collectedByRole: role,
                customerName: repair.customerName
            }, `Payment of ₱${payment.amount.toFixed(2)} collected at release by ${paymentCollected.collectedBy}`);
        }
        
        // Log device release activity
        await logActivity('device_released', {
            repairId: repairId,
            customerName: repair.customerName,
            device: `${repair.brand} ${repair.model}`,
            releasedBy: window.currentUserData.displayName,
            releasedByRole: window.currentUserData.role,
            repairedBy: repair.acceptedByName || 'Unknown',
            repairedById: repair.acceptedBy,
            verificationMethod: verificationMethod,
            paymentCollected: paymentCollected ? paymentCollected.amount : 0,
            hadBalance: balanceBefore > 0
        }, `Device released to ${repair.customerName} by ${window.currentUserData.displayName} (${window.currentUserData.role})${paymentCollected ? ` - Collected ₱${paymentCollected.amount.toFixed(2)}` : ''}`);
        
        utils.showLoading(false);
        
        let successMsg = verificationMethod === 'with-slip'
            ? '✅ Device released successfully!\n\n📸 Service slip photo recorded.'
            : '✅ Device released successfully!\n\n⚠️ Released without slip - Enhanced verification recorded.';
        
        if (paymentCollected) {
            const newBalance = balanceBefore - paymentCollected.amount;
            successMsg += `\n\n💰 Payment Collected: ₱${paymentCollected.amount.toFixed(2)}`;
            if (newBalance > 0) {
                successMsg += `\n⚠️ Remaining Balance: ₱${newBalance.toFixed(2)}`;
            } else {
                successMsg += `\n✅ Fully Paid!`;
            }
            
            if (window.currentUserData.role === 'technician') {
                successMsg += `\n\n📋 Payment will be included in your daily remittance.`;
            }
        }
        
        alert(successMsg);
        closeReleaseDeviceModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) window.currentTabRefresh();
            if (window.buildStats) window.buildStats();
        }, 300);
        
    } catch (error) {
        utils.showLoading(false);
        console.error('Error releasing device:', error);
        alert('Error: ' + error.message);
    }
}

function closeReleaseDeviceModal() {
    document.getElementById('releaseDeviceModal').style.display = 'none';
    serviceSlipPhoto = null;
}

// ===== FILTER AND SORT FUNCTIONS (Called from Right Sidebar) =====

let currentFilters = {
    status: 'all'
};

function filterByStatus(status) {
    console.log('Filtering by status:', status);
    currentFilters.status = status;
    
    // Refresh current tab with filter
    if (window.currentTabRefresh) {
        window.currentTabRefresh();
    }
}

// Export filter functions
window.filterByStatus = filterByStatus;
window.currentFilters = currentFilters;

// Export to global scope
window.loadRepairs = loadRepairs;
window.submitReceiveDevice = submitReceiveDevice;
window.acceptRepair = acceptRepair;
window.openTransferRepairModal = openTransferRepairModal;
window.submitTransferRepair = submitTransferRepair;
window.closeTransferModal = closeTransferModal;
window.handlePhotoUpload = handlePhotoUpload;
window.getTodayDate = getTodayDate;
window.isoToDateInput = isoToDateInput;
window.openPaymentModal = openPaymentModal;
window.previewPaymentProof = previewPaymentProof;
window.savePayment = savePayment;
window.editPaymentDate = editPaymentDate;
window.savePaymentDateEdit = savePaymentDateEdit;
window.verifyPayment = verifyPayment;
window.updateRepairStatus = updateRepairStatus;
window.saveStatus = saveStatus;
window.openAdditionalRepairModal = openAdditionalRepairModal;
window.saveAdditionalRepair = saveAdditionalRepair;
window.deleteRepair = deleteRepair;
window.closeStatusModal = closeStatusModal;
window.closeAdditionalRepairModal = closeAdditionalRepairModal;
window.closePaymentModal = closePaymentModal;
window.closeAcceptRepairModal = closeAcceptRepairModal;
window.openAcceptRepairModal = openAcceptRepairModal;
window.submitAcceptRepair = submitAcceptRepair;
window.openClaimModal = openClaimModal;
window.updateWarrantyInfo = updateWarrantyInfo;
window.claimDevice = claimDevice;
window.viewClaimDetails = viewClaimDetails;
window.openWarrantyClaimModal = openWarrantyClaimModal;
window.processWarrantyClaim = processWarrantyClaim;
window.closeClaimModal = closeClaimModal;
window.openEditRepairModal = openEditRepairModal;
window.submitPricingUpdate = submitPricingUpdate;
window.approveDiagnosis = approveDiagnosis;
// Remittance system exports
window.loadTechExpenses = loadTechExpenses;
window.loadTechRemittances = loadTechRemittances;
window.loadDailyCashCounts = loadDailyCashCounts;
// Cash count lock system exports
window.getDailyCashData = getDailyCashData;
window.openLockDayModal = openLockDayModal;
window.lockDailyCashCount = lockDailyCashCount;
window.openUnlockDayModal = openUnlockDayModal;
window.unlockDailyCashCount = unlockDailyCashCount;
window.preventBackdating = preventBackdating;
// Activity logging exports
window.logActivity = logActivity;
window.loadActivityLogs = loadActivityLogs;

/**
 * ============================================
 * ADMIN RESET FUNCTIONS
 * ============================================
 */

/**
 * Reset today's payments (Admin only)
 */
async function resetTodayPayments() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const todayString = new Date().toISOString().split('T')[0];
    
    // Check if today is locked
    if (!preventBackdating(todayString)) {
        alert('⚠️ Cannot reset locked date!\n\nToday has been locked. Please unlock it first if you need to make changes.');
        return;
    }
    
    const cashData = getDailyCashData(todayString);
    
    if (cashData.payments.length === 0) {
        alert('ℹ️ No payments to reset today');
        return;
    }
    
    // Confirmation with password
    const password = prompt(
        `⚠️ RESET TODAY'S PAYMENTS?\n\n` +
        `This will DELETE ${cashData.payments.length} payment(s)\n` +
        `Total amount: ₱${cashData.totals.payments.toFixed(2)}\n\n` +
        `⚠️ THIS CANNOT BE UNDONE!\n\n` +
        `Enter your password to confirm:`
    );
    
    if (!password) return;
    
    const reason = prompt('Please provide a reason for this reset:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Verify password
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
        
        // Create backup
        const backup = {
            type: 'payments_reset',
            date: todayString,
            timestamp: new Date().toISOString(),
            resetBy: window.currentUserData.displayName,
            reason: reason,
            data: cashData.payments
        };
        await db.ref('resetBackups').push(backup);
        
        // Reset payments for all repairs with today's payments
        const updates = {};
        const today = new Date().toDateString();
        
        window.allRepairs.forEach(repair => {
            if (repair.payments && repair.payments.length > 0) {
                const filteredPayments = repair.payments.filter(p => {
                    const paymentDate = new Date(p.paymentDate || p.recordedDate).toDateString();
                    return paymentDate !== today;
                });
                
                if (filteredPayments.length !== repair.payments.length) {
                    updates[`repairs/${repair.id}/payments`] = filteredPayments;
                    updates[`repairs/${repair.id}/lastUpdated`] = new Date().toISOString();
                    updates[`repairs/${repair.id}/lastUpdatedBy`] = window.currentUserData.displayName;
                }
            }
        });
        
        await db.ref().update(updates);
        
        // Log the reset
        await logActivity('data_reset', 'admin', {
            resetType: 'payments',
            date: todayString,
            itemsDeleted: cashData.payments.length,
            totalAmount: cashData.totals.payments,
            reason: reason
        });
        
        utils.showLoading(false);
        alert(`✅ Payments Reset Complete!\n\n${cashData.payments.length} payment(s) deleted\n\nBackup saved for recovery if needed.`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Reset cancelled.');
        } else {
            console.error('❌ Error resetting payments:', error);
            alert('Error: ' + error.message);
        }
    }
}

/**
 * Reset today's expenses (Admin only)
 */
async function resetTodayExpenses() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const todayString = new Date().toISOString().split('T')[0];
    
    // Check if today is locked
    if (!preventBackdating(todayString)) {
        alert('⚠️ Cannot reset locked date!\n\nToday has been locked. Please unlock it first if you need to make changes.');
        return;
    }
    
    const cashData = getDailyCashData(todayString);
    
    if (cashData.expenses.length === 0) {
        alert('ℹ️ No expenses to reset today');
        return;
    }
    
    // Confirmation with password
    const password = prompt(
        `⚠️ RESET TODAY'S EXPENSES?\n\n` +
        `This will DELETE ${cashData.expenses.length} expense(s)\n` +
        `Total amount: ₱${cashData.totals.expenses.toFixed(2)}\n\n` +
        `⚠️ THIS CANNOT BE UNDONE!\n\n` +
        `Enter your password to confirm:`
    );
    
    if (!password) return;
    
    const reason = prompt('Please provide a reason for this reset:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Verify password
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
        
        // Create backup
        const backup = {
            type: 'expenses_reset',
            date: todayString,
            timestamp: new Date().toISOString(),
            resetBy: window.currentUserData.displayName,
            reason: reason,
            data: cashData.expenses
        };
        await db.ref('resetBackups').push(backup);
        
        // Delete today's expenses from Firebase
        const today = new Date().toDateString();
        const allExpenses = await db.ref('techExpenses').once('value');
        const updates = {};
        
        allExpenses.forEach(child => {
            const expense = child.val();
            const expenseDate = new Date(expense.date).toDateString();
            if (expenseDate === today) {
                updates[`techExpenses/${child.key}`] = null;
            }
        });
        
        await db.ref().update(updates);
        
        // Log the reset
        await logActivity('data_reset', 'admin', {
            resetType: 'expenses',
            date: todayString,
            itemsDeleted: cashData.expenses.length,
            totalAmount: cashData.totals.expenses,
            reason: reason
        });
        
        utils.showLoading(false);
        alert(`✅ Expenses Reset Complete!\n\n${cashData.expenses.length} expense(s) deleted\n\nBackup saved for recovery if needed.`);
        
        // Reload and refresh
        await loadTechExpenses();
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Reset cancelled.');
        } else {
            console.error('❌ Error resetting expenses:', error);
            alert('Error: ' + error.message);
        }
    }
}

/**
 * Full reset - both payments and expenses (Admin only)
 */
async function fullResetToday() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const todayString = new Date().toISOString().split('T')[0];
    
    // Check if today is locked
    if (!preventBackdating(todayString)) {
        alert('⚠️ Cannot reset locked date!\n\nToday has been locked. Please unlock it first if you need to make changes.');
        return;
    }
    
    const cashData = getDailyCashData(todayString);
    
    if (cashData.payments.length === 0 && cashData.expenses.length === 0) {
        alert('ℹ️ No transactions to reset today');
        return;
    }
    
    // Final confirmation
    const confirmed = confirm(
        `⚠️⚠️ FULL RESET - TODAY'S DATA ⚠️⚠️\n\n` +
        `This will DELETE:\n` +
        `• ${cashData.payments.length} payment(s) (₱${cashData.totals.payments.toFixed(2)})\n` +
        `• ${cashData.expenses.length} expense(s) (₱${cashData.totals.expenses.toFixed(2)})\n\n` +
        `⚠️⚠️ THIS CANNOT BE UNDONE! ⚠️⚠️\n\n` +
        `Click OK to continue...`
    );
    
    if (!confirmed) return;
    
    // Password confirmation
    const password = prompt('Enter your password to confirm FULL RESET:');
    if (!password) return;
    
    const reason = prompt('Please provide a reason for this FULL RESET:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Verify password
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
        
        // Create backup
        const backup = {
            type: 'full_reset',
            date: todayString,
            timestamp: new Date().toISOString(),
            resetBy: window.currentUserData.displayName,
            reason: reason,
            data: {
                payments: cashData.payments,
                expenses: cashData.expenses
            }
        };
        await db.ref('resetBackups').push(backup);
        
        // Reset payments
        const updates = {};
        const today = new Date().toDateString();
        
        window.allRepairs.forEach(repair => {
            if (repair.payments && repair.payments.length > 0) {
                const filteredPayments = repair.payments.filter(p => {
                    const paymentDate = new Date(p.paymentDate || p.recordedDate).toDateString();
                    return paymentDate !== today;
                });
                
                if (filteredPayments.length !== repair.payments.length) {
                    updates[`repairs/${repair.id}/payments`] = filteredPayments;
                    updates[`repairs/${repair.id}/lastUpdated`] = new Date().toISOString();
                    updates[`repairs/${repair.id}/lastUpdatedBy`] = window.currentUserData.displayName;
                }
            }
        });
        
        // Reset expenses
        const allExpenses = await db.ref('techExpenses').once('value');
        allExpenses.forEach(child => {
            const expense = child.val();
            const expenseDate = new Date(expense.date).toDateString();
            if (expenseDate === today) {
                updates[`techExpenses/${child.key}`] = null;
            }
        });
        
        await db.ref().update(updates);
        
        // Log the full reset
        await logActivity('data_reset', 'admin', {
            resetType: 'full',
            date: todayString,
            paymentsDeleted: cashData.payments.length,
            expensesDeleted: cashData.expenses.length,
            totalPayments: cashData.totals.payments,
            totalExpenses: cashData.totals.expenses,
            reason: reason
        });
        
        utils.showLoading(false);
        alert(`✅ Full Reset Complete!\n\n` +
              `${cashData.payments.length} payment(s) deleted\n` +
              `${cashData.expenses.length} expense(s) deleted\n\n` +
              `Backup saved for recovery if needed.`);
        
        // Reload and refresh
        await loadRepairs();
        await loadTechExpenses();
        // Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Reset cancelled.');
        } else {
            console.error('❌ Error in full reset:', error);
            alert('Error: ' + error.message);
        }
    }
}

// Reset functions exports
window.resetTodayPayments = resetTodayPayments;
window.resetTodayExpenses = resetTodayExpenses;
window.fullResetToday = fullResetToday;

/**
 * ============================================
 * ADMIN CORRECTION FUNCTIONS
 * ============================================
 */

/**
 * Admin: Add payment to an already-released device
 */
async function adminAddPaymentToReleased(repairId) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    // Show repair details
    const totalAmount = repair.total || 0;
    const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const balance = totalAmount - totalPaid;
    
    const amount = prompt(
        `💰 Add Payment to Released Device\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Released: ${utils.formatDateTime(repair.claimedAt)}\n\n` +
        `Total Amount: ₱${totalAmount.toFixed(2)}\n` +
        `Already Paid: ₱${totalPaid.toFixed(2)}\n` +
        `Balance: ₱${balance.toFixed(2)}\n\n` +
        `Enter payment amount:`
    );
    
    if (!amount) return;
    
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert('⚠️ Invalid payment amount');
        return;
    }
    
    if (paymentAmount > balance) {
        const confirmOverpay = confirm(
            `⚠️ Payment amount (₱${paymentAmount.toFixed(2)}) exceeds balance (₱${balance.toFixed(2)})\n\n` +
            `Continue anyway?`
        );
        if (!confirmOverpay) return;
    }
    
    const paymentMethod = prompt('Payment method:\n1 = Cash\n2 = GCash\n3 = Bank Transfer\n4 = Card\n\nEnter 1-4:');
    const methodMap = { '1': 'Cash', '2': 'GCash', '3': 'Bank Transfer', '4': 'Card' };
    const method = methodMap[paymentMethod] || 'Cash';
    
    const reason = prompt('Reason for adding payment to released device:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const payment = {
            amount: paymentAmount,
            paymentMethod: method,
            paymentDate: new Date().toISOString(),
            recordedDate: new Date().toISOString(),
            recordedBy: window.currentUser.uid,
            recordedByName: window.currentUserData.displayName,
            notes: `[ADMIN CORRECTION] ${reason}`,
            verified: true,
            verifiedBy: window.currentUser.uid,
            verifiedByName: window.currentUserData.displayName,
            verifiedAt: new Date().toISOString()
        };
        
        const payments = repair.payments || [];
        payments.push(payment);
        
        await db.ref(`repairs/${repairId}`).update({
            payments: payments,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log the action
        await logActivity('admin_payment_correction', 'admin', {
            repairId: repairId,
            customerName: repair.customerName,
            amount: paymentAmount,
            method: method,
            reason: reason,
            deviceStatus: 'released'
        });
        
        utils.showLoading(false);
        alert(`✅ Payment Added!\n\n₱${paymentAmount.toFixed(2)} recorded for ${repair.customerName}\n\nNew balance: ₱${(balance - paymentAmount).toFixed(2)}`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error adding payment:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Admin: Un-release a device (rollback to "ready for release" status)
 */
async function adminUnreleaseDevice(repairId) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    if (!repair.claimedAt) {
        alert('⚠️ This device has not been released yet');
        return;
    }
    
    const totalAmount = repair.total || 0;
    const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const balance = totalAmount - totalPaid;
    
    const reason = prompt(
        `↩️ UN-RELEASE DEVICE\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Released: ${utils.formatDateTime(repair.claimedAt)}\n` +
        `Balance: ₱${balance.toFixed(2)}\n\n` +
        `⚠️ This will change device status back to "Ready for Release"\n\n` +
        `Reason for un-releasing:`
    );
    
    if (!reason || !reason.trim()) {
        return; // User cancelled or no reason
    }
    
    const confirmed = confirm(
        `⚠️ Confirm Un-Release?\n\n` +
        `This will:\n` +
        `• Remove release/claim information\n` +
        `• Change status back to "For Release"\n` +
        `• Preserve all payment records\n` +
        `• Log this action for audit\n\n` +
        `Continue?`
    );
    
    if (!confirmed) return;
    
    try {
        utils.showLoading(true);
        
        // Store the original claim info for backup
        const claimBackup = {
            claimedAt: repair.claimedAt,
            claimedBy: repair.claimedBy,
            claimedByName: repair.claimedByName,
            claimVerified: repair.claimVerified,
            claimVerifiedBy: repair.claimVerifiedBy,
            claimVerifiedByName: repair.claimVerifiedByName,
            claimVerifiedAt: repair.claimVerifiedAt,
            pickupSignature: repair.pickupSignature,
            unreleaseReason: reason,
            unreleasedBy: window.currentUserData.displayName,
            unreleasedAt: new Date().toISOString()
        };
        
        // Save backup
        await db.ref('unreleasedBackups').push({
            repairId: repairId,
            customerName: repair.customerName,
            backup: claimBackup
        });
        
        // Update repair status
        await db.ref(`repairs/${repairId}`).update({
            claimedAt: null,
            claimedBy: null,
            claimedByName: null,
            claimVerified: null,
            claimVerifiedBy: null,
            claimVerifiedByName: null,
            claimVerifiedAt: null,
            pickupSignature: null,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName,
            adminNote: `[ADMIN] Un-released on ${utils.formatDateTime(new Date().toISOString())}. Reason: ${reason}`
        });
        
        // Log the action
        await logActivity('admin_unreleased_device', 'admin', {
            repairId: repairId,
            customerName: repair.customerName,
            originalReleaseDate: repair.claimedAt,
            reason: reason
        });
        
        utils.showLoading(false);
        alert(`✅ Device Un-Released!\n\n${repair.customerName} - ${repair.brand} ${repair.model}\n\nStatus changed back to "Ready for Release"\nPayment records preserved\nBackup saved for audit`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error un-releasing device:', error);
        alert('Error: ' + error.message);
    }
}

// Admin correction functions exports
window.adminAddPaymentToReleased = adminAddPaymentToReleased;
window.adminUnreleaseDevice = adminUnreleaseDevice;

/**
 * ============================================
 * RTO DEVICE FUNCTIONS
 * ============================================
 */

/**
 * Release RTO device to customer
 */
async function releaseRTODevice(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    if (repair.status !== 'RTO') {
        alert('⚠️ This device is not marked as RTO');
        return;
    }
    
    // Check diagnosis fee status
    const diagnosisFee = repair.diagnosisFee || 0;
    const rtoPaymentStatus = repair.rtoPaymentStatus || 'waived';
    
    if (diagnosisFee > 0 && rtoPaymentStatus !== 'paid') {
        alert('⚠️ Please collect diagnosis fee before releasing device\n\nFee: ₱' + diagnosisFee.toFixed(2));
        return;
    }
    
    // Confirm customer details
    const customerName = prompt(
        `↩️ RETURN RTO DEVICE TO CUSTOMER\n\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `RTO Reason: ${repair.rtoReason}\n` +
        `${diagnosisFee > 0 ? `Diagnosis Fee: ₱${diagnosisFee.toFixed(2)} (Paid)\n` : 'No diagnosis fee'}\n\n` +
        `Confirm customer name:`
    );
    
    if (!customerName) return;
    
    if (customerName.toLowerCase().trim() !== repair.customerName.toLowerCase().trim()) {
        const proceed = confirm(
            `⚠️ Name Mismatch!\n\n` +
            `Expected: ${repair.customerName}\n` +
            `Entered: ${customerName}\n\n` +
            `Continue anyway?`
        );
        if (!proceed) return;
    }
    
    // Optional release notes
    const releaseNotes = prompt('Optional release notes:') || '';
    
    // Final confirmation
    const confirmed = confirm(
        `✅ Confirm Release?\n\n` +
        `Returning device to: ${repair.customerName}\n` +
        `Device: ${repair.brand} ${repair.model}\n\n` +
        `This will mark the device as returned and move it to Claimed Units.`
    );
    
    if (!confirmed) return;
    
    try {
        utils.showLoading(true);
        
        const releaseData = {
            claimedAt: new Date().toISOString(),
            claimedBy: window.currentUser.uid,
            claimedByName: window.currentUserData.displayName,
            releaseDate: new Date().toISOString(),
            releasedBy: window.currentUserData.displayName,
            releasedById: window.currentUser.uid,
            releaseNotes: releaseNotes || `RTO device returned to customer. Reason: ${repair.rtoReason}`,
            rtoReleased: true,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        };
        
        await db.ref(`repairs/${repairId}`).update(releaseData);
        
        // Log the release
        await logActivity('rto_device_released', 'repair', {
            repairId: repairId,
            customerName: repair.customerName,
            rtoReason: repair.rtoReason,
            diagnosisFee: diagnosisFee
        });
        
        utils.showLoading(false);
        alert(`✅ RTO Device Returned!\n\nDevice returned to: ${repair.customerName}\n\nMoved to Claimed Units.`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error releasing RTO device:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Add diagnosis fee to RTO device
 */
async function addRTODiagnosisFee(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    if (repair.status !== 'RTO') {
        alert('⚠️ This device is not marked as RTO');
        return;
    }
    
    if (repair.diagnosisFee && repair.diagnosisFee > 0) {
        alert('⚠️ Diagnosis fee already set\n\nUse "Collect Fee" button to record payment');
        return;
    }
    
    const amount = prompt(
        `💵 SET DIAGNOSIS FEE\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `RTO Reason: ${repair.rtoReason}\n\n` +
        `Enter diagnosis fee amount (₱):`
    );
    
    if (!amount) return;
    
    const feeAmount = parseFloat(amount);
    if (isNaN(feeAmount) || feeAmount <= 0) {
        alert('⚠️ Invalid amount');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}`).update({
            diagnosisFee: feeAmount,
            rtoPaymentStatus: 'pending',
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        alert(`✅ Diagnosis Fee Set!\n\n₱${feeAmount.toFixed(2)}\n\nStatus: Pending payment`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error setting diagnosis fee:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Collect diagnosis fee for RTO device
 */
async function collectRTODiagnosisFee(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    if (repair.status !== 'RTO') {
        alert('⚠️ This device is not marked as RTO');
        return;
    }
    
    const diagnosisFee = repair.diagnosisFee || 0;
    if (diagnosisFee <= 0) {
        alert('⚠️ No diagnosis fee set for this device');
        return;
    }
    
    if (repair.rtoPaymentStatus === 'paid') {
        alert('✅ Diagnosis fee already paid');
        return;
    }
    
    const paymentMethod = prompt(
        `💰 COLLECT DIAGNOSIS FEE\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Amount: ₱${diagnosisFee.toFixed(2)}\n\n` +
        `Payment method:\n` +
        `1 = Cash\n` +
        `2 = GCash\n` +
        `3 = Bank Transfer\n` +
        `4 = Card\n\n` +
        `Enter 1-4:`
    );
    
    if (!paymentMethod) return;
    
    const methodMap = { '1': 'Cash', '2': 'GCash', '3': 'Bank Transfer', '4': 'Card' };
    const method = methodMap[paymentMethod] || 'Cash';
    
    try {
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}`).update({
            rtoPaymentStatus: 'paid',
            rtoPaymentMethod: method,
            rtoPaymentDate: new Date().toISOString(),
            rtoPaymentCollectedBy: window.currentUserData.displayName,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log the fee collection
        await logActivity('rto_diagnosis_fee_recorded', 'financial', {
            repairId: repairId,
            customerName: repair.customerName,
            amount: diagnosisFee,
            paymentMethod: method
        });
        
        utils.showLoading(false);
        alert(`✅ Diagnosis Fee Collected!\n\n₱${diagnosisFee.toFixed(2)} (${method})\n\nDevice ready to be returned to customer.`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error collecting diagnosis fee:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Revert RTO status back to In Progress (Admin only)
 */
async function revertRTOStatus(repairId) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }
    
    if (repair.status !== 'RTO') {
        alert('⚠️ This device is not marked as RTO');
        return;
    }
    
    const reason = prompt(
        `🔄 REVERT RTO STATUS\n\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Customer: ${repair.customerName}\n` +
        `Current RTO Reason: ${repair.rtoReason}\n\n` +
        `This will change status back to "In Progress"\n\n` +
        `Reason for reverting:`
    );
    
    if (!reason || !reason.trim()) {
        return; // User cancelled
    }
    
    try {
        utils.showLoading(true);
        
        // Keep RTO history but change status
        await db.ref(`repairs/${repairId}`).update({
            status: 'In Progress',
            rtoReverted: true,
            rtoRevertedAt: new Date().toISOString(),
            rtoRevertedBy: window.currentUserData.displayName,
            rtoRevertReason: reason,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName,
            adminNote: `[ADMIN] Reverted from RTO on ${utils.formatDateTime(new Date().toISOString())}. Reason: ${reason}`
        });
        
        utils.showLoading(false);
        alert(`✅ Status Reverted!\n\nDevice moved back to "In Progress"\n\nRTO history preserved for records.`);
        
        // Reload and refresh
        await loadRepairs();
        // loadRepairs() Firebase listener will auto-refresh the page
        if (window.buildStats) {
            window.buildStats();
        }
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error reverting RTO status:', error);
        alert('Error: ' + error.message);
    }
}

// RTO functions exports
window.releaseRTODevice = releaseRTODevice;
window.addRTODiagnosisFee = addRTODiagnosisFee;
window.collectRTODiagnosisFee = collectRTODiagnosisFee;
window.revertRTOStatus = revertRTOStatus;
window.toggleRTOFields = toggleRTOFields;
window.loadSuppliers = loadSuppliers;
window.openAddSupplierFromReceive = openAddSupplierFromReceive;
window.openAddSupplierQuick = openAddSupplierQuick;
window.openPartsCostModal = openPartsCostModal;
window.savePartsCost = savePartsCost;

// ===== USER MANAGEMENT FUNCTIONS =====

let newUserProfilePicture = null;
let editUserProfilePicture = null;

/**
 * Open Create User Modal
 */
function openCreateUserModal() {
    document.getElementById('createUserModal').style.display = 'block';
    document.getElementById('createUserForm').reset();
    newUserProfilePicture = null;
    document.getElementById('newUserProfilePreview').style.display = 'none';
    document.getElementById('technicianNameField').style.display = 'none';
}

/**
 * Close Create User Modal
 */
function closeCreateUserModal() {
    document.getElementById('createUserModal').style.display = 'none';
}

/**
 * Handle role change in create user form
 */
function handleRoleChange() {
    const role = document.getElementById('newUserRole').value;
    const techField = document.getElementById('technicianNameField');
    techField.style.display = role === 'technician' ? 'block' : 'none';
    
    if (role === 'technician') {
        document.getElementById('newUserTechnicianName').required = true;
    } else {
        document.getElementById('newUserTechnicianName').required = false;
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Handle new user profile picture upload
 */
async function handleNewUserProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        // Compress and convert to base64
        const compressed = await utils.compressImage(file, 300, 300);
        newUserProfilePicture = compressed;
        
        // Show preview
        const preview = document.getElementById('newUserProfilePreview');
        preview.src = compressed;
        preview.style.display = 'block';
    } catch (error) {
        console.error('Error processing profile picture:', error);
        alert('Error processing image. Please try another file.');
    }
}

/**
 * Create new user
 */
async function createUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const passwordConfirm = document.getElementById('newUserPasswordConfirm').value;
    const displayName = document.getElementById('newUserDisplayName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const technicianName = document.getElementById('newUserTechnicianName').value.trim();
    
    // Validation
    if (!email || !password || !displayName || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('⚠️ Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('⚠️ Password must be at least 6 characters');
        return;
    }
    
    if (role === 'technician' && !technicianName) {
        alert('⚠️ Please enter technician name');
        return;
    }
    
    if (!confirm(`Create new ${role} account for ${displayName}?`)) {
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Create Firebase Auth account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        
        // Create user record in database
        const userData = {
            displayName: displayName,
            email: email,
            role: role,
            technicianName: role === 'technician' ? technicianName : null,
            status: 'active',
            profilePicture: newUserProfilePicture || null,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid,
            createdByName: window.currentUserData.displayName,
            lastLogin: null,
            loginHistory: {}
        };
        
        await db.ref(`users/${uid}`).set(userData);
        
        // Log activity
        await logActivity('user_created', {
            userId: uid,
            email: email,
            role: role,
            displayName: displayName
        }, `${window.currentUserData.displayName} created new ${role} account: ${displayName}`);
        
        utils.showLoading(false);
        alert(`✅ User created successfully!\n\nEmail: ${email}\nName: ${displayName}\nRole: ${role}\n\nThe user can now log in with their credentials.`);
        
        closeCreateUserModal();
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error creating user:', error);
        
        let errorMessage = 'Error creating user: ';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage += 'This email is already registered';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage += 'Invalid email address';
        } else if (error.code === 'auth/weak-password') {
            errorMessage += 'Password is too weak';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

/**
 * Open Edit User Modal
 */
function openEditUserModal(userId) {
    const user = window.allUsers.find(u => u.id === userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserDisplayName').value = user.displayName;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status || 'active';
    
    // Handle technician name field
    const techField = document.getElementById('editTechnicianNameField');
    if (user.role === 'technician') {
        techField.style.display = 'block';
        document.getElementById('editUserTechnicianName').value = user.technicianName || '';
    } else {
        techField.style.display = 'none';
    }
    
    // Show profile picture if exists
    editUserProfilePicture = null;
    const preview = document.getElementById('editUserProfilePreview');
    if (user.profilePicture) {
        preview.src = user.profilePicture;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    
    document.getElementById('editUserModal').style.display = 'block';
}

/**
 * Close Edit User Modal
 */
function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

/**
 * Handle role change in edit user form
 */
function handleEditRoleChange() {
    const role = document.getElementById('editUserRole').value;
    const techField = document.getElementById('editTechnicianNameField');
    techField.style.display = role === 'technician' ? 'block' : 'none';
}

/**
 * Handle edit user profile picture upload
 */
async function handleEditUserProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const compressed = await utils.compressImage(file, 300, 300);
        editUserProfilePicture = compressed;
        
        const preview = document.getElementById('editUserProfilePreview');
        preview.src = compressed;
        preview.style.display = 'block';
    } catch (error) {
        console.error('Error processing profile picture:', error);
        alert('Error processing image. Please try another file.');
    }
}

/**
 * Update user
 */
async function updateUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const displayName = document.getElementById('editUserDisplayName').value.trim();
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;
    const technicianName = document.getElementById('editUserTechnicianName').value.trim();
    
    const user = window.allUsers.find(u => u.id === userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    if (!displayName || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (role === 'technician' && !technicianName) {
        alert('⚠️ Please enter technician name');
        return;
    }
    
    // Check if role is changing
    const roleChanged = user.role !== role;
    if (roleChanged && !confirm(`⚠️ Change user role from ${user.role} to ${role}?\n\nThis will change their access permissions.`)) {
        return;
    }
    
    // Check if status is changing
    const statusChanged = user.status !== status;
    if (statusChanged && status === 'inactive' && !confirm(`⚠️ Deactivate ${user.displayName}?\n\nThey will not be able to log in.`)) {
        return;
    }
    
    try {
        utils.showLoading(true);
        
        const updates = {
            displayName: displayName,
            role: role,
            technicianName: role === 'technician' ? technicianName : null,
            status: status,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        };
        
        // Update profile picture if changed
        if (editUserProfilePicture) {
            updates.profilePicture = editUserProfilePicture;
        }
        
        await db.ref(`users/${userId}`).update(updates);
        
        // Log activity
        const changes = [];
        if (user.displayName !== displayName) changes.push(`name: ${user.displayName} → ${displayName}`);
        if (roleChanged) changes.push(`role: ${user.role} → ${role}`);
        if (statusChanged) changes.push(`status: ${user.status} → ${status}`);
        
        await logActivity('user_updated', {
            userId: userId,
            changes: changes
        }, `${window.currentUserData.displayName} updated user ${displayName}${changes.length > 0 ? ': ' + changes.join(', ') : ''}`);
        
        utils.showLoading(false);
        alert(`✅ User updated successfully!`);
        
        closeEditUserModal();
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error updating user:', error);
        alert('Error updating user: ' + error.message);
    }
}

/**
 * Toggle user status (activate/deactivate)
 */
async function toggleUserStatus(userId) {
    const user = window.allUsers.find(u => u.id === userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    const confirmMsg = newStatus === 'inactive' 
        ? `⚠️ Deactivate ${user.displayName}?\n\nThey will not be able to log in until reactivated.`
        : `✅ Reactivate ${user.displayName}?\n\nThey will be able to log in again.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        utils.showLoading(true);
        
        await db.ref(`users/${userId}`).update({
            status: newStatus,
            statusChangedAt: new Date().toISOString(),
            statusChangedBy: window.currentUserData.displayName
        });
        
        // Log activity
        await logActivity('user_status_changed', {
            userId: userId,
            oldStatus: user.status,
            newStatus: newStatus
        }, `${window.currentUserData.displayName} ${action}d ${user.displayName}`);
        
        utils.showLoading(false);
        alert(`✅ User ${action}d successfully!`);
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        utils.showLoading(false);
        console.error(`❌ Error ${action}ing user:`, error);
        alert(`Error ${action}ing user: ` + error.message);
    }
}

/**
 * View user profile (opens existing profile modal)
 */
function viewUserProfile(userId) {
    const user = window.allUsers.find(u => u.id === userId);
    if (!user) {
        alert('User not found');
        return;
    }
    
    // Use existing showUserProfile function if available
    if (window.showUserProfile) {
        window.showUserProfile(userId);
    } else {
        // Fallback: show basic info
        alert(`User Profile\n\nName: ${user.displayName}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}\nCreated: ${utils.formatDate(user.createdAt)}`);
    }
}

// Export user management functions
window.openCreateUserModal = openCreateUserModal;
window.closeCreateUserModal = closeCreateUserModal;
window.handleRoleChange = handleRoleChange;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleNewUserProfilePicture = handleNewUserProfilePicture;
window.createUser = createUser;
window.openEditUserModal = openEditUserModal;
window.closeEditUserModal = closeEditUserModal;
window.handleEditRoleChange = handleEditRoleChange;
window.handleEditUserProfilePicture = handleEditUserProfilePicture;
window.updateUser = updateUser;
window.toggleUserStatus = toggleUserStatus;
window.viewUserProfile = viewUserProfile;
window.closePartsCostModal = closePartsCostModal;
window.openExpenseModal = openExpenseModal;
window.saveExpense = saveExpense;
window.closeExpenseModal = closeExpenseModal;
window.getTechDailyPayments = getTechDailyPayments;
window.getTechDailyExpenses = getTechDailyExpenses;
window.getRepairPartsCost = getRepairPartsCost;
window.getRepairDeliveryExpenses = getRepairDeliveryExpenses;
window.calculateRepairCommission = calculateRepairCommission;
window.getTechCommissionEligibleRepairs = getTechCommissionEligibleRepairs;
window.getTechDailyCommission = getTechDailyCommission;
window.toggleManualCommissionFields = toggleManualCommissionFields;
window.showCommissionBreakdown = showCommissionBreakdown;
window.openRemittanceModal = openRemittanceModal;
window.confirmRemittance = confirmRemittance;
window.closeRemittanceModal = closeRemittanceModal;
window.openVerifyRemittanceModal = openVerifyRemittanceModal;
window.approveRemittance = approveRemittance;
window.rejectRemittance = rejectRemittance;
window.closeVerifyRemittanceModal = closeVerifyRemittanceModal;
/**
 * ============================================
 * EDIT RECEIVED DETAILS FUNCTIONS
 * ============================================
 */

/**
 * Open Edit Details Modal for received devices
 */
function openEditReceivedDetails(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const modal = document.getElementById('editDetailsModal');
    const content = document.getElementById('editDetailsModalContent');
    
    content.innerHTML = `
        <form onsubmit="submitEditReceivedDetails(event, '${repairId}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Customer Type *</label>
                    <select name="customerType" id="editCustomerType" onchange="document.getElementById('editShopNameGroup').style.display=this.value==='Dealer'?'block':'none'" required>
                        <option value="Walk-in" ${repair.customerType === 'Walk-in' ? 'selected' : ''}>Walk-in</option>
                        <option value="Dealer" ${repair.customerType === 'Dealer' ? 'selected' : ''}>Dealer</option>
                    </select>
                </div>
                <div class="form-group" id="editShopNameGroup" style="display:${repair.customerType === 'Dealer' ? 'block' : 'none'};">
                    <label>Shop Name ${repair.customerType === 'Dealer' ? '*' : ''}</label>
                    <input type="text" name="shopName" value="${repair.shopName || ''}" placeholder="Dealer shop name">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Customer Name *</label>
                    <input type="text" name="customerName" value="${repair.customerName}" required>
                </div>
                <div class="form-group">
                    <label>Contact Number *</label>
                    <input type="text" name="contactNumber" value="${repair.contactNumber}" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Brand *</label>
                    <input type="text" name="brand" value="${repair.brand}" required>
                </div>
                <div class="form-group">
                    <label>Model *</label>
                    <input type="text" name="model" value="${repair.model}" required>
                </div>
            </div>
            
            <div style="background:var(--bg-light);padding:15px;border-radius:var(--radius-md);margin:15px 0;">
                <h4 style="margin:0 0 15px 0;color:var(--primary);">📱 Device Details</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>IMEI / Serial Number</label>
                        <input type="text" name="imei" value="${repair.imei || ''}" placeholder="Enter IMEI or Serial">
                    </div>
                    <div class="form-group">
                        <label>Device Passcode</label>
                        <input type="text" name="devicePasscode" value="${repair.devicePasscode || ''}" placeholder="Pattern, PIN, or Password">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Device Color</label>
                        <select name="deviceColor">
                            <option value="N/A" ${repair.deviceColor === 'N/A' ? 'selected' : ''}>N/A (Unknown/Dead device)</option>
                            <option value="Black" ${repair.deviceColor === 'Black' ? 'selected' : ''}>Black</option>
                            <option value="White" ${repair.deviceColor === 'White' ? 'selected' : ''}>White</option>
                            <option value="Silver" ${repair.deviceColor === 'Silver' ? 'selected' : ''}>Silver</option>
                            <option value="Gold" ${repair.deviceColor === 'Gold' ? 'selected' : ''}>Gold</option>
                            <option value="Rose Gold" ${repair.deviceColor === 'Rose Gold' ? 'selected' : ''}>Rose Gold</option>
                            <option value="Space Gray" ${repair.deviceColor === 'Space Gray' ? 'selected' : ''}>Space Gray</option>
                            <option value="Blue" ${repair.deviceColor === 'Blue' ? 'selected' : ''}>Blue</option>
                            <option value="Red" ${repair.deviceColor === 'Red' ? 'selected' : ''}>Red</option>
                            <option value="Green" ${repair.deviceColor === 'Green' ? 'selected' : ''}>Green</option>
                            <option value="Purple" ${repair.deviceColor === 'Purple' ? 'selected' : ''}>Purple</option>
                            <option value="Pink" ${repair.deviceColor === 'Pink' ? 'selected' : ''}>Pink</option>
                            <option value="Yellow" ${repair.deviceColor === 'Yellow' ? 'selected' : ''}>Yellow</option>
                            <option value="Orange" ${repair.deviceColor === 'Orange' ? 'selected' : ''}>Orange</option>
                            <option value="Other" ${repair.deviceColor === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Storage Capacity</label>
                        <select name="storageCapacity">
                            <option value="N/A" ${repair.storageCapacity === 'N/A' ? 'selected' : ''}>N/A (Unknown/Dead device)</option>
                            <option value="8GB" ${repair.storageCapacity === '8GB' ? 'selected' : ''}>8GB</option>
                            <option value="16GB" ${repair.storageCapacity === '16GB' ? 'selected' : ''}>16GB</option>
                            <option value="32GB" ${repair.storageCapacity === '32GB' ? 'selected' : ''}>32GB</option>
                            <option value="64GB" ${repair.storageCapacity === '64GB' ? 'selected' : ''}>64GB</option>
                            <option value="128GB" ${repair.storageCapacity === '128GB' ? 'selected' : ''}>128GB</option>
                            <option value="256GB" ${repair.storageCapacity === '256GB' ? 'selected' : ''}>256GB</option>
                            <option value="512GB" ${repair.storageCapacity === '512GB' ? 'selected' : ''}>512GB</option>
                            <option value="1TB" ${repair.storageCapacity === '1TB' ? 'selected' : ''}>1TB</option>
                            <option value="2TB" ${repair.storageCapacity === '2TB' ? 'selected' : ''}>2TB</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="alert-warning-compact" style="margin:15px 0;">
                <small><strong>ℹ️ Note:</strong> This will update the device details. Problem description and pricing are not editable here.</small>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">💾 Save Changes</button>
                <button type="button" onclick="closeEditDetailsModal()" class="btn-secondary">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit edited details for received device
 */
async function submitEditReceivedDetails(e, repairId) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    try {
        utils.showLoading(true);
        
        const updates = {
            customerType: data.get('customerType'),
            customerName: data.get('customerName'),
            shopName: data.get('shopName') || '',
            contactNumber: data.get('contactNumber'),
            brand: data.get('brand'),
            model: data.get('model'),
            imei: data.get('imei') || '',
            deviceColor: data.get('deviceColor') || 'N/A',
            storageCapacity: data.get('storageCapacity') || 'N/A',
            devicePasscode: data.get('devicePasscode') || '',
            lastEditedBy: window.currentUser.uid,
            lastEditedByName: window.currentUserData.displayName,
            lastEditedAt: new Date().toISOString()
        };
        
        await db.ref(`repairs/${repairId}`).update(updates);
        
        // Log activity
        await logActivity('repair_details_edited', {
            repairId: repairId,
            customerName: updates.customerName,
            brand: updates.brand,
            model: updates.model
        }, `Device details updated for ${updates.customerName} - ${updates.brand} ${updates.model}`);
        
        utils.showLoading(false);
        closeEditDetailsModal();
        
        alert('✅ Device details updated successfully!');
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        console.error('Error updating details:', error);
        utils.showLoading(false);
        alert('Error updating details: ' + error.message);
    }
}

/**
 * Close Edit Details Modal
 */
function closeEditDetailsModal() {
    document.getElementById('editDetailsModal').style.display = 'none';
}

/**
 * ============================================
 * UPDATE DIAGNOSIS FUNCTIONS (For Accepted Repairs)
 * ============================================
 */

/**
 * Open Update Diagnosis Modal for accepted repairs
 */
function openUpdateDiagnosisModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    if (!repair.acceptedBy) {
        alert('This repair has not been accepted yet. Use "Create Diagnosis" for received devices.');
        return;
    }
    
    const modal = document.getElementById('updateDiagnosisModal');
    const content = document.getElementById('updateDiagnosisModalContent');
    
    content.innerHTML = `
        <div class="alert-info-compact">
            <strong>📱 ${repair.brand} ${repair.model}</strong><br>
            <span style="font-size:13px;color:#666;">Customer: ${repair.customerName}</span><br>
            <span style="font-size:13px;color:#666;">Original Problem: ${repair.problem}</span>
        </div>
        
        <form onsubmit="submitDiagnosisUpdate(event, '${repairId}')">
            <div class="form-group">
                <label>Additional Problem Found *</label>
                <input type="text" name="problemFound" required placeholder="e.g., Battery also swollen, Charging port damaged">
                <small style="color:#666;">Describe the additional issue discovered during repair</small>
            </div>
            
            <div class="form-group">
                <label>Notes / Details</label>
                <textarea name="notes" rows="3" placeholder="Additional details, customer approval status, pricing adjustments, etc."></textarea>
                <small style="color:#666;">Any relevant information about this update</small>
            </div>
            
            <div class="alert-warning-compact" style="margin:15px 0;">
                <small><strong>ℹ️ Note:</strong> This update will be added to the repair timeline and visible to all users. No admin approval needed.</small>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">📝 Add Update</button>
                <button type="button" onclick="closeUpdateDiagnosisModal()" class="btn-secondary">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

/**
 * Submit diagnosis update
 */
async function submitDiagnosisUpdate(e, repairId) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    try {
        utils.showLoading(true);
        
        const repair = window.allRepairs.find(r => r.id === repairId);
        if (!repair) {
            throw new Error('Repair not found');
        }
        
        const update = {
            problemFound: data.get('problemFound'),
            notes: data.get('notes') || '',
            updatedBy: window.currentUser.uid,
            updatedByName: window.currentUserData.displayName,
            updatedAt: new Date().toISOString()
        };
        
        // Get existing updates or create new array
        const existingUpdates = repair.diagnosisUpdates || [];
        existingUpdates.push(update);
        
        await db.ref(`repairs/${repairId}`).update({
            diagnosisUpdates: existingUpdates,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log activity
        await logActivity('diagnosis_updated', {
            repairId: repairId,
            customerName: repair.customerName,
            problemFound: update.problemFound
        }, `Diagnosis updated for ${repair.customerName}: ${update.problemFound}`);
        
        utils.showLoading(false);
        closeUpdateDiagnosisModal();
        
        alert('✅ Diagnosis update added successfully!');
        
        // Firebase listener will auto-refresh the page
        
    } catch (error) {
        console.error('Error updating diagnosis:', error);
        utils.showLoading(false);
        alert('Error updating diagnosis: ' + error.message);
    }
}

/**
 * Close Update Diagnosis Modal
 */
function closeUpdateDiagnosisModal() {
    document.getElementById('updateDiagnosisModal').style.display = 'none';
}

// Device release exports
window.openReleaseDeviceModal = openReleaseDeviceModal;
window.toggleVerificationMethod = toggleVerificationMethod;
window.uploadServiceSlipPhoto = uploadServiceSlipPhoto;
window.confirmReleaseDevice = confirmReleaseDevice;
window.closeReleaseDeviceModal = closeReleaseDeviceModal;
// Edit details and update diagnosis exports
window.openEditReceivedDetails = openEditReceivedDetails;
window.submitEditReceivedDetails = submitEditReceivedDetails;
window.closeEditDetailsModal = closeEditDetailsModal;
window.openUpdateDiagnosisModal = openUpdateDiagnosisModal;
window.submitDiagnosisUpdate = submitDiagnosisUpdate;
window.closeUpdateDiagnosisModal = closeUpdateDiagnosisModal;
// Admin Tools exports (Phase 1)
window.adminDeleteDevice = adminDeleteDevice;
window.adminBulkDeleteDevices = adminBulkDeleteDevices;
window.adminGetPendingRemittances = adminGetPendingRemittances;
window.adminGetRemittanceStats = adminGetRemittanceStats;
window.adminFindOrphanedData = adminFindOrphanedData;
window.adminQuickFixWarranty = adminQuickFixWarranty;

console.log('✅ repairs.js loaded');
