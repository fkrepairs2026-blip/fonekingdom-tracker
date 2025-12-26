// ===== REPAIRS MODULE =====

// Initialize global repairs array
window.allRepairs = [];
let photoData = [];

/**
 * Load all repairs from Firebase
 */
async function loadRepairs() {
    return new Promise((resolve) => {
        console.log('📦 Setting up repairs listener...');
        
        db.ref('repairs').on('value', (snapshot) => {
            window.allRepairs = [];
            
            snapshot.forEach((child) => {
                window.allRepairs.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            console.log('✅ Repairs loaded from Firebase:', window.allRepairs.length);
            
            // Refresh current tab if it exists
            if (window.currentTabRefresh) {
                console.log('🔄 Refreshing current tab...');
                window.currentTabRefresh();
            }
            
            // Update stats
            if (window.buildStats) {
                window.buildStats();
            }
            
            resolve(window.allRepairs);
        });
    });
}

/**
 * Submit new repair
 */
async function submitRepair(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    console.log('💾 Saving new repair...');
    
    const repair = {
        customerType: data.get('customerType'),
        customerName: data.get('customerName'),
        shopName: data.get('shopName') || '',
        contactNumber: data.get('contactNumber'),
        brand: data.get('brand'),
        model: data.get('model'),
        problem: data.get('problem'),
        repairType: data.get('repairType'),
        partType: data.get('partType') || '',
        partSource: data.get('partSource') || '',
        assignedTo: data.get('assignedTo'),
        partsCost: parseFloat(data.get('partsCost')) || 0,
        laborCost: parseFloat(data.get('laborCost')) || 0,
        total: (parseFloat(data.get('partsCost')) || 0) + (parseFloat(data.get('laborCost')) || 0),
        status: 'Received',
        photos: photoData,
        payments: [],
        createdAt: new Date().toISOString(),
        createdBy: window.currentUser.uid,
        createdByName: window.currentUserData.displayName
    };
    
    // Add microsoldering specific fields if applicable
    if (data.get('repairType') === 'Microsoldering') {
        repair.deviceCondition = data.get('deviceCondition') || '';
        repair.deviceTier = data.get('deviceTier') || '';
        repair.isMicrosoldering = true;
    }
    
    try {
        await db.ref('repairs').push(repair);
        console.log('✅ Repair saved successfully!');
        alert('✅ Repair saved!');
        
        // Reset form
        form.reset();
        photoData = [];
        document.querySelectorAll('[id^="preview"]').forEach(el => {
            el.innerHTML = '';
            el.style.display = 'none';
        });
        const photo2 = document.getElementById('photo2');
        const photo3 = document.getElementById('photo3');
        if (photo2) photo2.style.display = 'none';
        if (photo3) photo3.style.display = 'none';
        
        // Repairs will auto-refresh via listener
        
    } catch (error) {
        console.error('❌ Error saving repair:', error);
        alert('Error: ' + error.message);
    }
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
        
        if (photoData.length === 1) {
            const photo2 = document.getElementById('photo2');
            if (photo2) photo2.style.display = 'block';
        }
        if (photoData.length === 2) {
            const photo3 = document.getElementById('photo3');
            if (photo3) photo3.style.display = 'block';
        }
    } catch (error) {
        alert('Error uploading photo: ' + error.message);
    }
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
        
        ${isMicrosoldering && repair.deviceCondition ? `
            <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
                <h4 style="margin:0 0 10px 0;">⚡ Microsoldering Job</h4>
                <p><strong>Condition:</strong> ${repair.deviceCondition === 'Fresh' ? '✅ Fresh (Never Opened)' : '⚠️ Tampered (Previously Repaired)'}</p>
                ${repair.deviceCondition === 'Tampered' && repair.deviceTier ? `
                    <p><strong>Tier:</strong> ${repair.deviceTier}</p>
                    <p style="color:#d32f2f;font-weight:bold;">Service fee applies if unsuccessful!</p>
                ` : ''}
                ${repair.deviceCondition === 'Fresh' ? `
                    <p style="color:#388e3c;font-weight:bold;">No charge if unsuccessful</p>
                ` : ''}
            </div>
        ` : ''}
        
        <div class="form-group">
            <label>New Status *</label>
            <select id="newStatus" onchange="toggleRTOReasonField()">
                <option value="">Select Status</option>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                ${isMicrosoldering ? '<option value="Unsuccessful">Unsuccessful (Failed Repair)</option>' : ''}
                <option value="RTO">RTO (Return to Owner)</option>
            </select>
        </div>
        
        <div class="form-group" id="rtoReasonGroup" style="display:none;">
            <label>RTO Reason *</label>
            <select id="rtoReason" onchange="toggleCustomReason()">
                <option value="">Select Reason</option>
                <option value="Too expensive">Too expensive - Customer declined</option>
                <option value="No parts available">No parts available</option>
                <option value="Beyond repair">Beyond repair / Not economical</option>
                <option value="Customer changed mind">Customer changed mind</option>
                <option value="Wrong diagnosis">Wrong diagnosis / Different issue</option>
                <option value="Customer unresponsive">Customer unresponsive</option>
                <option value="Other">Other (specify)</option>
            </select>
        </div>
        
        <div class="form-group" id="customReasonGroup" style="display:none;">
            <label>Specify Reason *</label>
            <textarea id="customReason" rows="3" placeholder="Enter custom reason..."></textarea>
        </div>
        
        <div id="serviceFeeSection" style="display:none;">
            <div style="background:#ffebee;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #f44336;">
                <h4 style="margin:0 0 10px 0;color:#c62828;">💰 Service Fee Required</h4>
                <p>Device was <strong>tampered</strong> - service fee applies even though repair unsuccessful.</p>
                <div class="form-group">
                    <label>Service Fee (₱) *</label>
                    <input type="number" id="serviceFeeAmount" min="0" step="50" placeholder="Enter service fee">
                    <small style="color:#666;display:block;margin-top:5px;">
                        Recommended: ${repair.deviceTier === 'Entry Android' ? '₱150-200' : 
                                      repair.deviceTier === 'Old iPhone' ? '₱200-300' : 
                                      repair.deviceTier === 'Latest Models' ? '₱300-500' : '₱150-500'}
                    </small>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea id="statusNotes" rows="3" placeholder="Additional notes about status change..."></textarea>
        </div>
        
        <button onclick="saveStatus('${repairId}')" style="width:100%;">💾 Update Status</button>
    `;
    
    // Add event listener for status change
    setTimeout(() => {
        const statusSelect = document.getElementById('newStatus');
        statusSelect.addEventListener('change', function() {
            const status = this.value;
            const serviceFeeSection = document.getElementById('serviceFeeSection');
            
            if (status === 'Unsuccessful' && isMicrosoldering && repair.deviceCondition === 'Tampered') {
                serviceFeeSection.style.display = 'block';
            } else {
                serviceFeeSection.style.display = 'none';
            }
        });
    }, 0);
    
    document.getElementById('statusModal').style.display = 'block';
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
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    
    let rtoInfo = null;
    if (newStatus === 'RTO') {
        const rtoReason = document.getElementById('rtoReason').value;
        if (!rtoReason) {
            alert('Please select RTO reason');
            return;
        }
        
        let finalReason = rtoReason;
        if (rtoReason === 'Other') {
            const customReason = document.getElementById('customReason').value.trim();
            if (!customReason) {
                alert('Please specify custom reason');
                return;
            }
            finalReason = customReason;
        }
        
        rtoInfo = {
            reason: finalReason,
            date: new Date().toISOString(),
            by: window.currentUserData.displayName
        };
    }
    
    const update = {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    };
    
    // Handle unsuccessful microsoldering with service fee
    if (newStatus === 'Unsuccessful') {
        const isMicrosoldering = repair.isMicrosoldering || repair.repairType === 'Microsoldering';
        const isTampered = repair.deviceCondition === 'Tampered';
        
        if (isMicrosoldering && isTampered) {
            const serviceFeeInput = document.getElementById('serviceFeeAmount');
            if (!serviceFeeInput || !serviceFeeInput.value) {
                alert('Please enter service fee for tampered device');
                return;
            }
            
            const serviceFee = parseFloat(serviceFeeInput.value);
            if (serviceFee <= 0) {
                alert('Service fee must be greater than 0');
                return;
            }
            
            update.total = serviceFee;
            update.serviceFee = serviceFee;
            update.partsCost = 0;
            update.laborCost = 0;
            update.unsuccessfulReason = 'Microsoldering failed - Device was tampered';
        } else if (isMicrosoldering && repair.deviceCondition === 'Fresh') {
            update.total = 0;
            update.partsCost = 0;
            update.laborCost = 0;
            update.unsuccessfulReason = 'Microsoldering failed - No charge (Fresh device)';
        }
    }
    
    if (rtoInfo) {
        update.rto = rtoInfo;
    }
    
    if (notes) {
        const existingNotes = repair.notes || [];
        update.notes = [...existingNotes, {
            text: notes,
            by: window.currentUserData.displayName,
            date: new Date().toISOString()
        }];
    }
    
    await db.ref('repairs/' + repairId).update(update);
    
    closeStatusModal();
    
    if (newStatus === 'Unsuccessful') {
        const isTampered = repair.deviceCondition === 'Tampered';
        if (isTampered) {
            alert(`✅ Status updated to Unsuccessful\n\n⚠️ Service fee of ₱${update.serviceFee.toFixed(2)} applies\n\nDevice was tampered - customer must pay service fee.`);
        } else {
            alert(`✅ Status updated to Unsuccessful\n\n✅ No charge - Fresh device\n\nCustomer does not owe anything.`);
        }
    } else {
        alert('✅ Status updated to: ' + newStatus);
    }
}

/**
 * Open additional repair modal
 */
function openAdditionalRepairModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }
    
    const content = document.getElementById('additionalRepairModalContent');
    content.innerHTML = `
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
            <h4 style="margin:0 0 10px 0;">Current Repair</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Original Problem:</strong> ${repair.problem}</p>
            <p><strong>Current Total:</strong> ₱${repair.total.toFixed(2)}</p>
        </div>
        
        <div class="form-group">
            <label>Additional Problem Found *</label>
            <textarea id="additionalProblem" rows="3" required placeholder="Describe what else needs repair..."></textarea>
        </div>
        
        <h4 style="margin:20px 0 10px;">Additional Parts & Labor</h4>
        
        <div class="form-row">
            <div class="form-group">
                <label>Part Type</label>
                <select id="additionalPartType">
                    <option value="">Select Part (if needed)</option>
                    <option value="LCD">LCD / Display</option>
                    <option value="Battery">Battery</option>
                    <option value="Flex">Flex Cable</option>
                    <option value="Charging Port">Charging Port</option>
                    <option value="Camera">Camera Module</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Microphone">Microphone</option>
                    <option value="Back Cover">Back Cover / Housing</option>
                    <option value="Board">Board / IC</option>
                    <option value="Multiple Parts">Multiple Parts</option>
                    <option value="No Parts">No Parts Needed</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Parts Source</label>
                <select id="additionalPartSource">
                    <option value="">Select Source (if applicable)</option>
                    <option value="Shop Stock">🏪 Shop Stock</option>
                    <option value="Guimba">📦 Guimba</option>
                    <option value="Ate Sheng">📦 Ate Sheng</option>
                    <option value="Lawrence">📦 Lawrence</option>
                    <option value="Jhay">📦 Jhay</option>
                </select>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Additional Parts Cost (₱) *</label>
                <input type="number" id="additionalPartsCost" min="0" step="0.01" value="0" required>
            </div>
            <div class="form-group">
                <label>Additional Labor Cost (₱) *</label>
                <input type="number" id="additionalLaborCost" min="0" step="0.01" value="0" required>
            </div>
        </div>
        
        <div style="background:#fff3cd;padding:15px;border-radius:5px;border-left:4px solid #ffc107;margin:15px 0;">
            <h4 style="margin:0 0 10px 0;">💰 New Total Calculation</h4>
            <p>Original Total: ₱${repair.total.toFixed(2)}</p>
            <p>Additional Cost: <span id="additionalCostPreview">₱0.00</span></p>
            <p style="font-size:18px;font-weight:bold;margin-top:10px;padding-top:10px;border-top:2px solid #ddd;">
                New Total: <span id="newTotalPreview">₱${repair.total.toFixed(2)}</span>
            </p>
        </div>
        
        <button onclick="saveAdditionalRepair('${repairId}')" style="width:100%;">💾 Add Additional Repair & Update Price</button>
    `;
    
    // Add event listeners for live preview
    setTimeout(() => {
        const partsCostInput = document.getElementById('additionalPartsCost');
        const laborCostInput = document.getElementById('additionalLaborCost');
        
        const updatePreview = () => {
            const partsCost = parseFloat(partsCostInput.value) || 0;
            const laborCost = parseFloat(laborCostInput.value) || 0;
            const additionalTotal = partsCost + laborCost;
            const newTotal = repair.total + additionalTotal;
            
            document.getElementById('additionalCostPreview').textContent = '₱' + additionalTotal.toFixed(2);
            document.getElementById('newTotalPreview').textContent = '₱' + newTotal.toFixed(2);
        };
        
        partsCostInput.addEventListener('input', updatePreview);
        laborCostInput.addEventListener('input', updatePreview);
    }, 0);
    
    document.getElementById('additionalRepairModal').style.display = 'block';
}

/**
 * Save additional repair
 */
async function saveAdditionalRepair(repairId) {
    const additionalProblem = document.getElementById('additionalProblem').value.trim();
    const partType = document.getElementById('additionalPartType').value;
    const partSource = document.getElementById('additionalPartSource').value;
    const partsCost = parseFloat(document.getElementById('additionalPartsCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('additionalLaborCost').value) || 0;
    
    if (!additionalProblem) {
        alert('Please describe the additional problem');
        return;
    }
    
    if (partsCost === 0 && laborCost === 0) {
        alert('Please enter at least parts cost or labor cost');
        return;
    }
    
    const repair = window.allRepairs.find(r => r.id === repairId);
    const additionalTotal = partsCost + laborCost;
    const newTotal = repair.total + additionalTotal;
    
    const additionalRepair = {
        problem: additionalProblem,
        partType: partType || 'N/A',
        partSource: partSource || 'N/A',
        partsCost: partsCost,
        laborCost: laborCost,
        total: additionalTotal,
        addedBy: window.currentUserData.displayName,
        addedAt: new Date().toISOString()
    };
    
    const existingAdditional = repair.additionalRepairs || [];
    
    await db.ref('repairs/' + repairId).update({
        additionalRepairs: [...existingAdditional, additionalRepair],
        total: newTotal,
        partsCost: repair.partsCost + partsCost,
        laborCost: repair.laborCost + laborCost,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    closeAdditionalRepairModal();
    
    alert(`✅ Additional repair added!\n\nPrevious Total: ₱${repair.total.toFixed(2)}\nAdditional: ₱${additionalTotal.toFixed(2)}\nNew Total: ₱${newTotal.toFixed(2)}\n\nCustomer needs to be informed of new price.`);
}

/**
 * Delete repair
 */
async function deleteRepair(repairId) {
    if (confirm('Delete this repair? This cannot be undone.')) {
        await db.ref(`repairs/${repairId}`).remove();
        alert('Repair deleted');
    }
}

// Toggle functions for status modal
function toggleRTOReasonField() {
    const status = document.getElementById('newStatus').value;
    const rtoGroup = document.getElementById('rtoReasonGroup');
    const customGroup = document.getElementById('customReasonGroup');
    
    if (status === 'RTO') {
        rtoGroup.style.display = 'block';
    } else {
        rtoGroup.style.display = 'none';
        customGroup.style.display = 'none';
    }
}

function toggleCustomReason() {
    const reason = document.getElementById('rtoReason').value;
    const customGroup = document.getElementById('customReasonGroup');
    
    if (reason === 'Other') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

// Modal close functions
function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

function closeAdditionalRepairModal() {
    document.getElementById('additionalRepairModal').style.display = 'none';
}

// Export to global scope
window.loadRepairs = loadRepairs;
window.submitRepair = submitRepair;
window.handlePhotoUpload = handlePhotoUpload;
window.updateRepairStatus = updateRepairStatus;
window.saveStatus = saveStatus;
window.openAdditionalRepairModal = openAdditionalRepairModal;
window.saveAdditionalRepair = saveAdditionalRepair;
window.deleteRepair = deleteRepair;
window.toggleRTOReasonField = toggleRTOReasonField;
window.toggleCustomReason = toggleCustomReason;
window.closeStatusModal = closeStatusModal;
window.closeAdditionalRepairModal = closeAdditionalRepairModal;

console.log('✅ repairs.js loaded');
