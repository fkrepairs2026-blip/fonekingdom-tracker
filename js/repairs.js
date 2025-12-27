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
    const form = e.target();
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
 * Submit quick device receive (Cashier)
 */
async function submitQuickReceive(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    console.log('📥 Quick receiving device...');
    
    const repair = {
        customerType: data.get('customerType'),
        customerName: data.get('customerName'),
        shopName: data.get('shopName') || '',
        contactNumber: data.get('contactNumber'),
        brand: data.get('brand'),
        model: data.get('model'),
        problem: data.get('problem'),
        repairType: 'Pending Diagnosis',
        partType: '',
        partSource: '',
        assignedTo: data.get('assignedTo'),
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
        notes: [{
            text: 'Device received by cashier - awaiting technician diagnosis and pricing',
            by: window.currentUserData.displayName,
            date: new Date().toISOString()
        }]
    };
    
    try {
        await db.ref('repairs').push(repair);
        console.log('✅ Device received successfully!');
        alert(`✅ Device Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📞 ${repair.contactNumber}\n\n🔧 Assigned to: ${repair.assignedTo}\n\n✅ Technician will diagnose and set pricing.`);
        
        // Reset form
        form.reset();
        photoData = [];
        const preview = document.getElementById('quickPreview1');
        if (preview) {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Error receiving device:', error);
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
                                    <button onclick="editPaymentDate('${repairId}', ${i})" style="background:#667eea;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        📅 Edit Date
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
    
    // Convert selected date to ISO string (at start of day in local timezone)
    const selectedDate = new Date(paymentDateInput.value + 'T00:00:00');
    const paymentDate = selectedDate.toISOString();
    
    const payment = {
        amount: amount,
        method: method,
        paymentDate: paymentDate, // When payment was actually received
        recordedDate: new Date().toISOString(), // When it was recorded in system
        receivedBy: window.currentUserData.displayName,
        notes: notes,
        photo: paymentProofPhoto || null,
        verified: (window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager'),
        verifiedBy: (window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager') ? window.currentUserData.displayName : null,
        verifiedAt: (window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager') ? new Date().toISOString() : null
    };
    
    const existingPayments = repair.payments || [];
    
    await db.ref('repairs/' + repairId).update({
        payments: [...existingPayments, payment],
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: window.currentUserData.displayName
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
            <textarea id="editReason" rows="2" required placeholder="Why are you changing the date? (e.g., Wrong date entered, Found payment slip from earlier date)"></textarea>
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
            <p style="margin:0;font-size:13px;"><strong>⚠️ Important:</strong> This will update the payment date in your records. The change will be logged with your name and reason.</p>
        </div>
    `;
    
    document.getElementById('paymentModal').style.display = 'block';
}

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
    
    // Update payment with new date and edit log
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
    
    alert(`✅ Payment date updated!\n\nOld Date: ${utils.formatDate(oldDate)}\nNew Date: ${utils.formatDate(newDate)}\n\nReason: ${reason}\n\nChange has been logged.`);
    
    // Reopen modal to refresh
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
    
    alert('✅ Payment verified!');
    
    // Reopen modal to refresh
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

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Export to global scope
window.loadRepairs = loadRepairs;
window.submitRepair = submitRepair;
window.submitQuickReceive = submitQuickReceive;
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
window.toggleRTOReasonField = toggleRTOReasonField;
window.toggleCustomReason = toggleCustomReason;
window.closeStatusModal = closeStatusModal;
window.closeAdditionalRepairModal = closeAdditionalRepairModal;
window.closePaymentModal = closePaymentModal;

console.log('✅ repairs.js loaded');
