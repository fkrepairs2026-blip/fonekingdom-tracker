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
        acceptedAt: null
    };
    
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
        
        // Auto-assign to original tech
        repair.acceptedBy = backJobTech;
        repair.acceptedByName = techName;
        repair.acceptedAt = new Date().toISOString();
        repair.status = 'In Progress'; // Auto start for back jobs
    }
    
    try {
        await db.ref('repairs').push(repair);
        console.log('✅ Device received successfully!');
        
        if (isBackJob) {
            alert(`✅ Back Job Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n\n🔄 BACK JOB - Auto-assigned to: ${repair.originalTechName}\n📋 Reason: ${backJobReason}\n\n⚠️ This device will go directly to "${repair.originalTechName}"'s job list with status "In Progress".`);
        } else {
            alert(`✅ Device Received!\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📞 ${repair.contactNumber}\n\n✅ Device is now in "📥 Received Devices" waiting for technician to accept.`);
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
    
    const confirmMsg = `Accept this repair?\n\n📱 ${repair.brand} ${repair.model}\n👤 ${repair.customerName}\n📋 ${repair.problem}\n\nThis will move to your job list.`;
    
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
        
        alert(`✅ Repair Accepted!\n\n📱 ${repair.brand} ${repair.model}\n\n🔧 This repair is now in your job list.\n📍 Status changed to "In Progress"`);
        
        console.log('✅ Repair accepted successfully');
        
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
    
    const payment = {
        amount: amount,
        method: method,
        paymentDate: paymentDate,
        recordedDate: new Date().toISOString(),
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
    alert('✅ Status updated to: ' + newStatus);
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

console.log('✅ repairs.js loaded');
