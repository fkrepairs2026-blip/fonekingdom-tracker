// ===== REPAIRS MODULE =====

// Initialize global repairs array
window.allRepairs = [];
let photoData = [];
// Global modification requests
window.allModificationRequests = [];

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
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 100);
            }
            
            // Always update stats
            if (window.buildStats) {
                setTimeout(() => {
                    window.buildStats();
                }, 100);
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
                window.currentTabRefresh();
            }
            
            resolve(window.allModificationRequests);
        });
    });
}

window.loadModificationRequests = loadModificationRequests;

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
    
    // Check if customer has pre-approved pricing
    const customerPreApproved = document.getElementById('customerPreApproved').checked;
    
    const repair = {
        customerType: data.get('customerType'),
        customerName: data.get('customerName'),
        shopName: data.get('shopName') || '',
        contactNumber: data.get('contactNumber'),
        brand: data.get('brand'),
        model: data.get('model'),
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
    
    // Handle PRE-APPROVED devices (customer already agreed to pricing)
    if (customerPreApproved && !isBackJob) {
        const repairType = document.getElementById('preApprovedRepairType').value;
        const partsCost = parseFloat(document.getElementById('preApprovedPartsCost').value) || 0;
        const laborCost = parseFloat(document.getElementById('preApprovedLaborCost').value) || 0;
        const total = partsCost + laborCost;
        
        if (!repairType) {
            alert('⚠️ Please select the repair type for the pre-approved pricing');
            return;
        }
        
        if (total <= 0) {
            alert('⚠️ Please enter at least parts cost or labor cost for the pre-approved pricing');
            return;
        }
        
        // Mark as pre-approved with pricing
        repair.repairType = repairType;
        repair.partsCost = partsCost;
        repair.laborCost = laborCost;
        repair.total = total;
        
        // Mark diagnosis as created and customer approved
        repair.diagnosisCreated = true;
        repair.diagnosisCreatedAt = new Date().toISOString();
        repair.diagnosisCreatedBy = window.currentUser.uid;
        repair.diagnosisCreatedByName = window.currentUserData.displayName;
        repair.customerApproved = true;
        repair.customerApprovedAt = new Date().toISOString();
        repair.customerApprovedBy = window.currentUser.uid;
        
        console.log('✅ Device marked as pre-approved with pricing:', {repairType, partsCost, laborCost, total});
    }
    
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
        
        // Back jobs skip diagnosis workflow - auto-approved (warranty claim)
        repair.diagnosisCreated = true;
        repair.diagnosisCreatedAt = new Date().toISOString();
        repair.diagnosisCreatedBy = window.currentUser.uid;
        repair.diagnosisCreatedByName = window.currentUserData.displayName;
        repair.customerApproved = true; // Back jobs are pre-approved
        repair.customerApprovedAt = new Date().toISOString();
        repair.customerApprovedBy = window.currentUser.uid;
        
        // Auto-assign to original tech
        repair.acceptedBy = backJobTech;
        repair.acceptedByName = techName;
        repair.acceptedAt = new Date().toISOString();
        repair.status = 'In Progress'; // Auto start for back jobs
    }
    
    try {
        await db.ref('repairs').push(repair);
        console.log('✅ Device received successfully!');
        
        // Log repair creation
        await logActivity('repair_created', 'repair', {
            customerName: repair.customerName,
            brand: repair.brand,
            model: repair.model,
            problemType: repair.problemType,
            isBackJob: isBackJob || false,
            customerPreApproved: customerPreApproved || false
        });
        
        if (isBackJob) {
            alert(`✅ Back Job Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n\n🔄 BACK JOB - Auto-assigned to: ${repair.originalTechName}\n📋 Reason: ${backJobReason}\n\n⚠️ This device will go directly to "${repair.originalTechName}"'s job list with status "In Progress".`);
        } else if (customerPreApproved) {
            alert(`✅ Device Received & Approved!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📞 ${repair.contactNumber}\n\n💰 Approved Pricing:\n• ${repair.repairType}\n• Parts: ₱${repair.partsCost.toFixed(2)}\n• Labor: ₱${repair.laborCost.toFixed(2)}\n• Total: ₱${repair.total.toFixed(2)}\n\n✅ Device is ready for technician to accept and start repair!`);
        } else {
            alert(`✅ Device Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📞 ${repair.contactNumber}\n\n📋 Next Steps:\n1. Tech/Owner will create diagnosis and set pricing\n2. Customer will approve the price\n3. Technician can then accept the repair\n\n✅ Device is now in "📥 Received Devices" waiting for diagnosis.`);
        }
        
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
        
        // Reset pre-approval fields
        if (document.getElementById('customerPreApproved')) {
            document.getElementById('customerPreApproved').checked = false;
        }
        if (document.getElementById('preApprovalFields')) {
            document.getElementById('preApprovalFields').style.display = 'none';
        }
        
        // Force refresh after a short delay to ensure Firebase has processed
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
        }, 500);
        
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        
    } catch (error) {
        console.error('❌ Error accepting repair:', error);
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
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
            <h4 style="margin:0 0 10px 0;">Payment Summary</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Total Amount:</strong> ₱${repair.total.toFixed(2)}</p>
            <p><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></p>
            <p><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-size:18px;font-weight:bold;">₱${balance.toFixed(2)}</span></p>
        </div>
        
        ${balance <= 0 ? `
            <div style="background:#c8e6c9;padding:15px;border-radius:5px;margin-bottom:15px;text-align:center;">
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
                        <div style="background:${p.verified ? '#e8f5e9' : '#fff3e0'};padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${p.verified ? '#4caf50' : '#ff9800'};">
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
    await logActivity('payment_recorded', 'financial', {
        repairId: repairId,
        customerName: repair.customerName,
        amount: amount,
        method: method,
        paymentDate: utils.formatDate(paymentDate),
        verified: payment.verified
    });
    
    paymentProofPhoto = null;
    
    const newBalance = balance - amount;
    const paymentDateStr = utils.formatDate(paymentDate);
    
    if (newBalance === 0) {
        alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n🎉 FULLY PAID! Balance is now ₱0.00`);
    } else {
        alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n📊 Remaining Balance: ₱${newBalance.toFixed(2)}`);
    }
    
    closePaymentModal();
    
    // Refresh after a short delay to ensure Firebase has processed
    setTimeout(() => {
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        if (window.buildStats) {
            window.buildStats();
        }
    }, 300);
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
        <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
            <h4 style="margin:0 0 10px 0;">📅 Edit Payment Date</h4>
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
        
        <div style="background:#ffebee;padding:12px;border-radius:5px;margin-top:15px;border-left:4px solid #f44336;">
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
        <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
            <h4 style="margin:0 0 10px 0;">🕒 Edit Recorded Date (Admin Only)</h4>
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
        
        <div style="background:#ffebee;padding:12px;border-radius:5px;margin-top:15px;border-left:4px solid #f44336;">
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
    
    await db.ref('repairs/' + repairId).update({
        payments: payments,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
    });
    
    // Log payment verification
    await logActivity('payment_verified', 'financial', {
        repairId: repairId,
        customerName: repair.customerName,
        amount: payments[paymentIndex].amount,
        method: payments[paymentIndex].method
    });
    
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
            <select id="newStatus">
                <option value="">Select Status</option>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                ${isMicrosoldering ? '<option value="Unsuccessful">Unsuccessful</option>' : ''}
                <option value="RTO">RTO</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea id="statusNotes" rows="3" placeholder="Notes..."></textarea>
        </div>
        
        <button onclick="saveStatus('${repairId}')" style="width:100%;">💾 Update Status</button>
    `;
    
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
            
            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
                if (window.buildStats) {
                    window.buildStats();
                }
            }, 300);
            
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
    
    // Refresh after a short delay to ensure Firebase has processed
    setTimeout(() => {
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        if (window.buildStats) {
            window.buildStats();
        }
    }, 300);
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
    
    // Refresh after a short delay to ensure Firebase has processed
    setTimeout(() => {
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        if (window.buildStats) {
            window.buildStats();
        }
    }, 300);
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
        <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #2196f3;">
            <h4 style="margin:0 0 10px 0;">📝 Request Payment Date Change</h4>
            <p>You need admin approval to change payment dates</p>
        </div>
        
        <div style="background:#f5f5f5;padding:12px;border-radius:5px;margin-bottom:15px;">
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
        
        <div style="background:#fff3cd;padding:12px;border-radius:5px;margin-top:15px;">
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
        <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #2196f3;">
            <h4 style="margin:0 0 10px 0;">📝 Request Recorded Date Change</h4>
            <p>You need admin approval to change recorded dates</p>
        </div>
        
        <div style="background:#f5f5f5;padding:12px;border-radius:5px;margin-bottom:15px;">
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
        <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #4caf50;">
            <h3 style="margin:0 0 10px 0;color:#2e7d32;">✅ Release Device to Customer</h3>
            <p style="margin:0;">This will mark the device as claimed and activate warranty</p>
        </div>
        
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
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
        
        <div id="warrantyInfoDisplay" style="display:none;background:#fff3cd;padding:12px;border-radius:5px;margin:10px 0;border-left:4px solid #ffc107;">
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
        
        <div style="background:#ffebee;padding:12px;border-radius:5px;margin:15px 0;border-left:4px solid #f44336;">
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
        
        // Refresh after a short delay to ensure Firebase has processed
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
            // Switch to claimed units tab if available
            if (window.switchTab) {
                window.switchTab('claimed');
            }
        }, 300);
        
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
        <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #2196f3;">
            <h3 style="margin:0 0 10px 0;">📄 Claim Details</h3>
            <p style="margin:0;">Device release and warranty information</p>
        </div>
        
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
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
        
        <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #4caf50;">
            <h4 style="margin:0 0 10px 0;color:#2e7d32;">📋 Claim Information</h4>
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
            <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
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
        <div style="background:#fff3cd;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
            <h3 style="margin:0 0 10px 0;">🛡️ Warranty Claim</h3>
            <p style="margin:0;">Device returning under active warranty</p>
        </div>
        
        <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:15px;">
            <h4 style="margin:0 0 10px 0;">Original Repair</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            <p><strong>Original Issue:</strong> ${repair.problemType || repair.problem}</p>
            <p><strong>Claimed:</strong> ${utils.formatDate(repair.claimedAt)} (${Math.floor((new Date() - new Date(repair.claimedAt)) / (1000 * 60 * 60 * 24))} days ago)</p>
        </div>
        
        <div style="background:#e8f5e9;padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #4caf50;">
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
        <div style="background:#e3f2fd;padding:15px;border-radius:5px;margin-bottom:15px;">
            <h3 style="margin:0;">${isNewDiagnosis ? '📋 Create Diagnosis' : '✏️ Update Diagnosis'}</h3>
            <p style="margin:5px 0 0;"><strong>${repair.customerName}</strong> - ${repair.brand} ${repair.model}</p>
        </div>
        ${isNewDiagnosis ? `
            <div style="background:#e3f2fd;padding:12px;border-radius:5px;margin-bottom:15px;border-left:4px solid #2196f3;">
                <p style="margin:0;"><strong>ℹ️ Create Diagnosis:</strong> Set repair details and pricing. After saving, status will change to "Pending Customer Approval".</p>
            </div>
        ` : `
            <div style="background:#fff3cd;padding:12px;border-radius:5px;margin-bottom:15px;border-left:4px solid #ffc107;">
                <p style="margin:0;"><strong>⚠️ Updating Diagnosis:</strong> Changing the diagnosis will reset customer approval. Customer will need to approve again.</p>
            </div>
        `}
        
        <form id="editPricingForm" onsubmit="submitPricingUpdate(event, '${repairId}')">
            <div class="form-group">
                <label>Repair Type *</label>
                <select name="repairType" required>
                    <option value="">Select repair type</option>
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
            
            <div style="background:#fff3cd;padding:12px;border-radius:5px;margin:15px 0;border-left:4px solid #ffc107;">
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
 * Open Parts Cost Modal
 */
function openPartsCostModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) return;
    
    document.getElementById('partsCostRepairId').value = repairId;
    document.getElementById('partsCostAmount').value = repair.partsCost || '';
    document.getElementById('partsCostNotes').value = repair.partsCostNotes || '';
    document.getElementById('partsCostModal').style.display = 'block';
}

/**
 * Save Parts Cost
 */
async function savePartsCost() {
    const repairId = document.getElementById('partsCostRepairId').value;
    const amount = parseFloat(document.getElementById('partsCostAmount').value);
    const notes = document.getElementById('partsCostNotes').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid parts cost');
        return;
    }
    
    try {
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}`).update({
            partsCost: amount,
            partsCostNotes: notes,
            partsCostRecordedBy: window.currentUserData.displayName,
            partsCostRecordedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        alert(`✅ Parts cost recorded!\n\n₱${amount.toFixed(2)}`);
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
    
    if (payments.length === 0) {
        alert('No payments collected today to remit.');
        return;
    }
    
    const expectedAmount = paymentsTotal - expensesTotal;
    
    // Build summary
    let summary = `
        <div class="remittance-summary-section">
            <h4>📥 Payments Collected (${payments.length})</h4>
            <div class="remittance-list">
                ${payments.map(p => `
                    <div class="remittance-item">
                        <span>${p.customerName}</span>
                        <span>₱${p.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="remittance-total">Total: ₱${paymentsTotal.toFixed(2)}</div>
        </div>
        
        <div class="remittance-summary-section">
            <h4>💸 Expenses (${expenses.length})</h4>
            <div class="remittance-list">
                ${expenses.length > 0 ? expenses.map(e => `
                    <div class="remittance-item">
                        <span>${e.description}</span>
                        <span>-₱${e.amount.toFixed(2)}</span>
                    </div>
                `).join('') : '<p style="color:#999;">No expenses recorded</p>'}
            </div>
            <div class="remittance-total">Total: -₱${expensesTotal.toFixed(2)}</div>
        </div>
        
        <div class="remittance-expected">
            <strong>Expected Remittance Amount:</strong>
            <span class="expected-amount">₱${expectedAmount.toFixed(2)}</span>
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
    
    if (isNaN(actualAmount) || actualAmount < 0) {
        alert('Please enter a valid remittance amount');
        return;
    }
    
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, today);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, today);
    const expectedAmount = paymentsTotal - expensesTotal;
    const discrepancy = actualAmount - expectedAmount;
    
    // Require notes if there's a discrepancy
    if (Math.abs(discrepancy) > 0.01 && !notes) {
        alert('Please provide a note explaining the discrepancy');
        return;
    }
    
    if (!confirm(`Submit remittance of ₱${actualAmount.toFixed(2)}?${discrepancy !== 0 ? `\n\nDiscrepancy: ₱${discrepancy.toFixed(2)}` : ''}`)) {
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Create remittance record
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
            // Expenses
            expenseIds: expenses.map(e => e.id),
            totalExpenses: expensesTotal,
            expensesList: expenses.map(e => ({
                category: e.category,
                amount: e.amount,
                description: e.description
            })),
            // Calculation
            expectedAmount: expectedAmount,
            actualAmount: actualAmount,
            discrepancy: discrepancy,
            // Status
            status: 'pending',
            submittedAt: new Date().toISOString(),
            // Verification
            verifiedBy: null,
            verifiedAt: null,
            verificationNotes: '',
            discrepancyReason: notes
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
        
        // Update expenses with remittance ID
        expenses.forEach(e => {
            updatePromises.push(
                db.ref(`techExpenses/${e.id}`).update({ remittanceId: remittanceId })
            );
        });
        
        await Promise.all(updatePromises);
        
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
    
    // Build release data
    const releaseData = {
        status: 'Claimed',
        claimedAt: new Date().toISOString(),
        releaseDate: new Date().toISOString(),
        releasedBy: window.currentUserData.displayName,
        releasedById: window.currentUser.uid,
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
    
    // Check payment status
    const totalPaid = (repair.payments || []).filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;
    
    if (balance > 0) {
        const proceed = confirm(
            `⚠️ UNPAID BALANCE WARNING!\n\n` +
            `Total: ₱${repair.total.toFixed(2)}\n` +
            `Paid: ₱${totalPaid.toFixed(2)}\n` +
            `Balance: ₱${balance.toFixed(2)}\n\n` +
            `Proceed with release anyway?`
        );
        if (!proceed) return;
        
        releaseData.releasedWithBalance = balance;
        releaseData.balanceNotes = 'Released with unpaid balance - approved by ' + window.currentUserData.displayName;
    }
    
    // Confirm release
    const confirmMsg = verificationMethod === 'with-slip'
        ? `✅ Release device with service slip photo?\n\nCustomer: ${customerName}`
        : `⚠️ Release device WITHOUT service slip?\n\nCustomer: ${customerName}\n\nEnhanced verification will be recorded.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}`).update(releaseData);
        
        utils.showLoading(false);
        
        const successMsg = verificationMethod === 'with-slip'
            ? '✅ Device released successfully!\n\n📸 Service slip photo recorded.'
            : '✅ Device released successfully!\n\n⚠️ Released without slip - Enhanced verification recorded.';
        
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

// Export to global scope
window.loadRepairs = loadRepairs;
window.submitReceiveDevice = submitReceiveDevice;
window.acceptRepair = acceptRepair;
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
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
window.openPartsCostModal = openPartsCostModal;
window.savePartsCost = savePartsCost;
window.closePartsCostModal = closePartsCostModal;
window.openExpenseModal = openExpenseModal;
window.saveExpense = saveExpense;
window.closeExpenseModal = closeExpenseModal;
window.getTechDailyPayments = getTechDailyPayments;
window.getTechDailyExpenses = getTechDailyExpenses;
window.openRemittanceModal = openRemittanceModal;
window.confirmRemittance = confirmRemittance;
window.closeRemittanceModal = closeRemittanceModal;
window.openVerifyRemittanceModal = openVerifyRemittanceModal;
window.approveRemittance = approveRemittance;
window.rejectRemittance = rejectRemittance;
window.closeVerifyRemittanceModal = closeVerifyRemittanceModal;
// Device release exports
window.openReleaseDeviceModal = openReleaseDeviceModal;
window.toggleVerificationMethod = toggleVerificationMethod;
window.uploadServiceSlipPhoto = uploadServiceSlipPhoto;
window.confirmReleaseDevice = confirmReleaseDevice;
window.closeReleaseDeviceModal = closeReleaseDeviceModal;

console.log('✅ repairs.js loaded');
