// ===== HISTORICAL REVIEW MODULE =====

/**
 * Build Historical Review Tab
 * Shows historical data for repairs, payments, remittances, and expenses
 * All users can view data filtered by date range and user
 */
function buildHistoricalReviewTab(container) {
    console.log('📅 Building historical review tab...');

    window.currentTabRefresh = () => buildHistoricalReviewTab(
        document.getElementById('historicalReviewTab')
    );

    if (!container) {
        console.warn('Container not found for historical review');
        return;
    }

    const role = window.currentUserData.role;
    const currentUserId = window.currentUser.uid;

    // Get default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const startDateStr = getLocalDateString(lastWeek);
    const endDateStr = getLocalDateString(today);

    const html = `
        <div class="historical-review-container">
            <div class="page-header">
                <h2>📅 Historical Review</h2>
                <p style="color:var(--text-secondary);">Review past repairs, payments, remittances, and expenses</p>
            </div>
            
            <!-- Filters Section -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:20px;margin-bottom:20px;">
                <h3 style="margin-top:0;">🔍 Filters</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;">
                    <div>
                        <label style="display:block;margin-bottom:5px;font-weight:600;">Start Date</label>
                        <input type="date" id="historyStartDate" value="${startDateStr}" 
                               style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:5px;">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:5px;font-weight:600;">End Date</label>
                        <input type="date" id="historyEndDate" value="${endDateStr}" 
                               style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:5px;">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:5px;font-weight:600;">User Filter</label>
                        <select id="historyUserFilter" 
                                style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:5px;">
                            <option value="all">All Users</option>
                            ${Object.values(window.allUsers || {}).map(user =>
        `<option value="${user.uid}">${user.displayName} (${user.role})</option>`
    ).join('')}
                        </select>
                    </div>
                    <div style="grid-column:1/-1;">
                        <div style="display:flex;gap:5px;flex-wrap:wrap;">
                            <button onclick="applyHistoricalFilters()" class="btn-primary" style="flex:1;min-width:100px;">
                                Apply Filters
                            </button>
                            <button onclick="quickDateRange('today')" class="btn-small" style="flex:1;min-width:60px;">Today</button>
                            <button onclick="quickDateRange('week')" class="btn-small" style="flex:1;min-width:60px;">Week</button>
                            <button onclick="quickDateRange('month')" class="btn-small" style="flex:1;min-width:60px;">Month</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Summary Statistics -->
            <div id="historySummary" style="margin-bottom:20px;">
                <!-- Will be populated by applyHistoricalFilters -->
            </div>
            
            <!-- Activity Tabs -->
            <div class="tabs-container">
                <div class="tabs-header">
                    <button class="tab-btn active" onclick="switchHistoryTab('repairs')">
                        🔧 Repairs
                    </button>
                    <button class="tab-btn" onclick="switchHistoryTab('payments')">
                        💰 Payments
                    </button>
                    <button class="tab-btn" onclick="switchHistoryTab('remittances')">
                        📤 Remittances
                    </button>
                    <button class="tab-btn" onclick="switchHistoryTab('expenses')">
                        💸 Expenses
                    </button>
                </div>
                
                <!-- Repairs Tab -->
                <div id="historyRepairsTab" class="history-tab-content active">
                    <!-- Will be populated by applyHistoricalFilters -->
                </div>
                
                <!-- Payments Tab -->
                <div id="historyPaymentsTab" class="history-tab-content" style="display:none;">
                    <!-- Will be populated by applyHistoricalFilters -->
                </div>
                
                <!-- Remittances Tab -->
                <div id="historyRemittancesTab" class="history-tab-content" style="display:none;">
                    <!-- Will be populated by applyHistoricalFilters -->
                </div>
                
                <!-- Expenses Tab -->
                <div id="historyExpensesTab" class="history-tab-content" style="display:none;">
                    <!-- Will be populated by applyHistoricalFilters -->
                </div>
            </div>
            
            <!-- Export Options -->
            <div style="margin-top:20px;text-align:center;">
                <button onclick="exportHistoricalData('csv')" class="btn-secondary" style="margin:5px;">
                    📊 Export to CSV
                </button>
                <button onclick="exportHistoricalData('print')" class="btn-secondary" style="margin:5px;">
                    🖨️ Print Report
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Apply initial filters
    setTimeout(() => applyHistoricalFilters(), 100);
}

/**
 * Quick date range selector
 */
function quickDateRange(range) {
    const today = new Date();
    let startDate = new Date();

    switch (range) {
        case 'today':
            startDate = today;
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
    }

    document.getElementById('historyStartDate').value = getLocalDateString(startDate);
    document.getElementById('historyEndDate').value = getLocalDateString(today);

    applyHistoricalFilters();
}

/**
 * Switch between history sub-tabs
 */
function switchHistoryTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tabs-header .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.history-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`history${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).style.display = 'block';
}

/**
 * Apply filters and load historical data
 */
function applyHistoricalFilters() {
    console.log('🔍 Applying historical filters...');

    const startDateStr = document.getElementById('historyStartDate').value;
    const endDateStr = document.getElementById('historyEndDate').value;
    const selectedUserId = document.getElementById('historyUserFilter').value;

    if (!startDateStr || !endDateStr) {
        alert('Please select both start and end dates');
        return;
    }

    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T23:59:59');

    if (startDate > endDate) {
        alert('Start date must be before end date');
        return;
    }

    // Get filtered data
    const filteredData = getFilteredHistoricalData(startDate, endDate, selectedUserId);

    // Update summary
    updateHistorySummary(filteredData, startDateStr, endDateStr, selectedUserId);

    // Update each tab
    updateRepairsHistoryTab(filteredData.repairs);
    updatePaymentsHistoryTab(filteredData.payments);
    updateRemittancesHistoryTab(filteredData.remittances);
    updateExpensesHistoryTab(filteredData.expenses);
}

/**
 * Get filtered historical data based on date range and user
 */
function getFilteredHistoricalData(startDate, endDate, userId) {
    console.log('📊 Filtering historical data...', { startDate, endDate, userId });

    const data = {
        repairs: [],
        payments: [],
        remittances: [],
        expenses: []
    };

    // Filter repairs
    (window.allRepairs || []).forEach(repair => {
        if (repair.deleted) return;

        const createdDate = new Date(repair.createdAt);
        if (createdDate >= startDate && createdDate <= endDate) {
            // User filter
            if (userId === 'all' || repair.createdBy === userId || repair.acceptedBy === userId) {
                data.repairs.push(repair);
            }
        }
    });

    // Filter payments (from repairs)
    (window.allRepairs || []).forEach(repair => {
        if (repair.deleted || !repair.payments) return;

        repair.payments.forEach((payment, index) => {
            const paymentDate = new Date(payment.paymentDate || payment.recordedDate);
            if (paymentDate >= startDate && paymentDate <= endDate) {
                // User filter
                if (userId === 'all' || payment.receivedById === userId) {
                    data.payments.push({
                        ...payment,
                        repairId: repair.id,
                        customerName: repair.customerName,
                        device: `${repair.brand} ${repair.model}`,
                        paymentIndex: index
                    });
                }
            }
        });
    });

    // Filter remittances
    (window.techRemittances || []).forEach(remittance => {
        const remitDate = new Date(remittance.date || remittance.submittedAt);
        if (remitDate >= startDate && remitDate <= endDate) {
            // User filter
            if (userId === 'all' || remittance.techId === userId || remittance.verifiedBy === userId) {
                data.remittances.push(remittance);
            }
        }
    });

    // Filter expenses
    (window.allExpenses || []).forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startDate && expenseDate <= endDate) {
            // User filter
            if (userId === 'all' || expense.techId === userId) {
                data.expenses.push(expense);
            }
        }
    });

    console.log('✅ Filtered data:', data);
    return data;
}

/**
 * Update summary statistics section
 */
function updateHistorySummary(data, startDateStr, endDateStr, userId) {
    const userLabel = userId === 'all' ? 'All Users' :
        (window.allUsers[userId]?.displayName || 'Selected User');

    // Calculate totals
    const repairsReceived = data.repairs.filter(r =>
        new Date(r.createdAt) >= new Date(startDateStr) &&
        new Date(r.createdAt) <= new Date(endDateStr)
    ).length;

    const repairsCompleted = data.repairs.filter(r => r.status === 'Completed' || r.status === 'Claimed').length;
    const repairsInProgress = data.repairs.filter(r =>
        r.status === 'In Progress' ||
        r.status === 'Waiting for Parts' ||
        r.status === 'Pending Customer Approval'
    ).length;

    const totalPayments = data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const cashPayments = data.payments.filter(p => p.method === 'Cash').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const gcashPayments = data.payments.filter(p => p.method === 'GCash').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const totalRemittances = data.remittances.reduce((sum, r) => sum + (parseFloat(r.actualAmount) || 0), 0);
    const approvedRemittances = data.remittances.filter(r => r.status === 'approved').length;
    const pendingRemittances = data.remittances.filter(r => r.status === 'pending').length;

    const totalExpenses = data.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const netRevenue = totalPayments - totalExpenses;

    const summaryHtml = `
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border-radius:10px;padding:20px;margin-bottom:20px;">
            <h3 style="margin-top:0;color:white;">📊 Summary Statistics</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;font-size:14px;">
                <div>
                    <strong>Date Range:</strong><br>
                    ${startDateStr} to ${endDateStr}
                </div>
                <div>
                    <strong>User Filter:</strong><br>
                    ${userLabel}
                </div>
            </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;">
            <!-- Repairs Stats -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:24px;">🔧</span>
                    <h4 style="margin:0;">Repairs</h4>
                </div>
                <div style="font-size:24px;font-weight:bold;color:var(--primary-color);">${repairsReceived}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">
                    Received: ${repairsReceived} | Completed: ${repairsCompleted}<br>
                    In Progress: ${repairsInProgress}
                </div>
            </div>
            
            <!-- Payments Stats -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:24px;">💰</span>
                    <h4 style="margin:0;">Payments</h4>
                </div>
                <div style="font-size:24px;font-weight:bold;color:#4caf50;">₱${totalPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">
                    Cash: ₱${cashPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}<br>
                    GCash: ₱${gcashPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
            </div>
            
            <!-- Remittances Stats -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:24px;">📤</span>
                    <h4 style="margin:0;">Remittances</h4>
                </div>
                <div style="font-size:24px;font-weight:bold;color:#2196f3;">₱${totalRemittances.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">
                    Approved: ${approvedRemittances}<br>
                    Pending: ${pendingRemittances}
                </div>
            </div>
            
            <!-- Expenses Stats -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:24px;">💸</span>
                    <h4 style="margin:0;">Expenses</h4>
                </div>
                <div style="font-size:24px;font-weight:bold;color:#ff9800;">₱${totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">
                    Count: ${data.expenses.length}
                </div>
            </div>
            
            <!-- Net Revenue -->
            <div style="background:var(--bg-white);border:1px solid var(--border-color);border-radius:10px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:24px;">💵</span>
                    <h4 style="margin:0;">Net Revenue</h4>
                </div>
                <div style="font-size:24px;font-weight:bold;color:${netRevenue >= 0 ? '#4caf50' : '#f44336'};">
                    ₱${netRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">
                    Payments - Expenses
                </div>
            </div>
        </div>
    `;

    document.getElementById('historySummary').innerHTML = summaryHtml;
}

/**
 * Update Repairs History Tab
 */
function updateRepairsHistoryTab(repairs) {
    const container = document.getElementById('historyRepairsTab');

    if (repairs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:10px;">📦</div>
                <p>No repairs found for the selected date range and user filter.</p>
            </div>
        `;
        return;
    }

    const html = `
        <div style="margin-top:20px;">
            <h3>🔧 Repairs (${repairs.length})</h3>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                <table class="data-table" style="min-width:800px;">
                    <thead>
                        <tr>
                            <th style="min-width:90px;">Date</th>
                            <th style="min-width:120px;">Customer</th>
                            <th style="min-width:120px;">Device</th>
                            <th style="min-width:150px;">Problem</th>
                            <th style="min-width:100px;">Status</th>
                            <th style="min-width:120px;">Received By</th>
                            <th style="min-width:120px;">Accepted By</th>
                            <th style="min-width:100px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repairs.map(repair => `
                            <tr>
                                <td>${new Date(repair.createdAt).toLocaleDateString()}</td>
                                <td>${repair.customerName}</td>
                                <td>${repair.brand} ${repair.model}</td>
                                <td>${repair.problem ? repair.problem.substring(0, 40) + '...' : 'N/A'}</td>
                                <td><span class="status-badge status-${repair.status.toLowerCase().replace(/\s+/g, '-')}">${repair.status}</span></td>
                                <td>${repair.receivedBy || 'N/A'}</td>
                                <td>${repair.acceptedByName || 'Not assigned'}</td>
                                <td>₱${(parseFloat(repair.total) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Update Payments History Tab
 */
function updatePaymentsHistoryTab(payments) {
    const container = document.getElementById('historyPaymentsTab');

    if (payments.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:10px;">💳</div>
                <p>No payments found for the selected date range and user filter.</p>
            </div>
        `;
        return;
    }

    const html = `
        <div style="margin-top:20px;">
            <h3>💰 Payments (${payments.length})</h3>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                <table class="data-table" style="min-width:900px;">
                    <thead>
                        <tr>
                            <th style="min-width:100px;">Payment Date</th>
                            <th style="min-width:120px;">Customer</th>
                            <th style="min-width:120px;">Device</th>
                            <th style="min-width:100px;">Amount</th>
                            <th style="min-width:80px;">Method</th>
                            <th style="min-width:120px;">Received By</th>
                            <th style="min-width:80px;">Verified</th>
                            <th style="min-width:120px;">Remittance Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => `
                            <tr>
                                <td>${new Date(payment.paymentDate || payment.recordedDate).toLocaleDateString()}</td>
                                <td>${payment.customerName}</td>
                                <td>${payment.device}</td>
                                <td style="font-weight:bold;">₱${(parseFloat(payment.amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                <td>${payment.method}</td>
                                <td>${payment.receivedByName || payment.receivedBy}</td>
                                <td>${payment.verified ? '✅ Yes' : '⏳ Pending'}</td>
                                <td><span class="status-badge status-${payment.remittanceStatus || 'pending'}">${payment.remittanceStatus || 'pending'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Update Remittances History Tab
 */
function updateRemittancesHistoryTab(remittances) {
    const container = document.getElementById('historyRemittancesTab');

    if (remittances.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:10px;">📤</div>
                <p>No remittances found for the selected date range and user filter.</p>
            </div>
        `;
        return;
    }

    const html = `
        <div style="margin-top:20px;">
            <h3>📤 Remittances (${remittances.length})</h3>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                <table class="data-table" style="min-width:1000px;">
                    <thead>
                        <tr>
                            <th style="min-width:90px;">Date</th>
                            <th style="min-width:120px;">Technician</th>
                            <th style="min-width:130px;">Payments Collected</th>
                            <th style="min-width:100px;">Expenses</th>
                            <th style="min-width:130px;">Expected Amount</th>
                            <th style="min-width:120px;">Actual Amount</th>
                            <th style="min-width:110px;">Discrepancy</th>
                            <th style="min-width:90px;">Status</th>
                            <th style="min-width:120px;">Verified By</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${remittances.map(remittance => {
        const discrepancy = parseFloat(remittance.discrepancy) || 0;
        const discrepancyColor = discrepancy === 0 ? '#4caf50' : discrepancy > 0 ? '#2196f3' : '#f44336';

        return `
                            <tr>
                                <td>${new Date(remittance.date || remittance.submittedAt).toLocaleDateString()}</td>
                                <td>${remittance.techName}</td>
                                <td>₱${(parseFloat(remittance.totalPaymentsCollected) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                <td>₱${(parseFloat(remittance.totalExpenses) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                <td>₱${(parseFloat(remittance.expectedAmount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                <td style="font-weight:bold;">₱${(parseFloat(remittance.actualAmount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                <td style="color:${discrepancyColor};font-weight:bold;">
                                    ${discrepancy > 0 ? '+' : ''}₱${discrepancy.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </td>
                                <td><span class="status-badge status-${remittance.status}">${remittance.status}</span></td>
                                <td>${remittance.verifiedBy ? window.allUsers[remittance.verifiedBy]?.displayName || remittance.verifiedBy : 'N/A'}</td>
                            </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Update Expenses History Tab
 */
function updateExpensesHistoryTab(expenses) {
    const container = document.getElementById('historyExpensesTab');

    if (expenses.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:10px;">💸</div>
                <p>No expenses found for the selected date range and user filter.</p>
            </div>
        `;
        return;
    }

    const html = `
        <div style="margin-top:20px;">
            <h3>💸 Expenses (${expenses.length})</h3>
            <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
                <table class="data-table" style="min-width:600px;">
                    <thead>
                        <tr>
                            <th style="min-width:90px;">Date</th>
                            <th style="min-width:120px;">Technician</th>
                            <th style="min-width:120px;">Category</th>
                            <th style="min-width:200px;">Description</th>
                            <th style="min-width:100px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenses.map(expense => `
                            <tr>
                                <td>${new Date(expense.date).toLocaleDateString()}</td>
                                <td>${expense.techName}</td>
                                <td>${expense.category}</td>
                                <td>${expense.description || 'N/A'}</td>
                                <td style="font-weight:bold;">₱${(parseFloat(expense.amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Export historical data
 */
function exportHistoricalData(format) {
    const startDateStr = document.getElementById('historyStartDate').value;
    const endDateStr = document.getElementById('historyEndDate').value;
    const selectedUserId = document.getElementById('historyUserFilter').value;

    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T23:59:59');

    const data = getFilteredHistoricalData(startDate, endDate, selectedUserId);

    if (format === 'csv') {
        exportToCSV(data, startDateStr, endDateStr);
    } else if (format === 'print') {
        printReport(data, startDateStr, endDateStr, selectedUserId);
    }
}

/**
 * Export to CSV
 */
function exportToCSV(data, startDate, endDate) {
    let csv = `Fonekingdom Historical Report\n`;
    csv += `Date Range: ${startDate} to ${endDate}\n\n`;

    // Repairs CSV
    csv += `REPAIRS\n`;
    csv += `Date,Customer,Device,Problem,Status,Received By,Accepted By,Total\n`;
    data.repairs.forEach(repair => {
        csv += `"${new Date(repair.createdAt).toLocaleDateString()}","${repair.customerName}","${repair.brand} ${repair.model}","${(repair.problem || '').replace(/"/g, '""')}","${repair.status}","${repair.receivedBy}","${repair.acceptedByName || 'N/A'}","₱${parseFloat(repair.total || 0).toFixed(2)}"\n`;
    });

    csv += `\n\nPAYMENTS\n`;
    csv += `Date,Customer,Device,Amount,Method,Received By,Verified,Remittance Status\n`;
    data.payments.forEach(payment => {
        csv += `"${new Date(payment.paymentDate || payment.recordedDate).toLocaleDateString()}","${payment.customerName}","${payment.device}","₱${parseFloat(payment.amount || 0).toFixed(2)}","${payment.method}","${payment.receivedByName}","${payment.verified ? 'Yes' : 'No'}","${payment.remittanceStatus || 'pending'}"\n`;
    });

    csv += `\n\nREMITTANCES\n`;
    csv += `Date,Technician,Payments Collected,Expenses,Expected,Actual,Discrepancy,Status\n`;
    data.remittances.forEach(remittance => {
        csv += `"${new Date(remittance.date || remittance.submittedAt).toLocaleDateString()}","${remittance.techName}","₱${parseFloat(remittance.totalPaymentsCollected || 0).toFixed(2)}","₱${parseFloat(remittance.totalExpenses || 0).toFixed(2)}","₱${parseFloat(remittance.expectedAmount || 0).toFixed(2)}","₱${parseFloat(remittance.actualAmount || 0).toFixed(2)}","₱${parseFloat(remittance.discrepancy || 0).toFixed(2)}","${remittance.status}"\n`;
    });

    csv += `\n\nEXPENSES\n`;
    csv += `Date,Technician,Category,Description,Amount\n`;
    data.expenses.forEach(expense => {
        csv += `"${new Date(expense.date).toLocaleDateString()}","${expense.techName}","${expense.category}","${(expense.description || '').replace(/"/g, '""')}","₱${parseFloat(expense.amount || 0).toFixed(2)}"\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fonekingdom-historical-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('✅ CSV exported successfully!');
}

/**
 * Print report
 */
function printReport(data, startDate, endDate, userId) {
    const userLabel = userId === 'all' ? 'All Users' :
        (window.allUsers[userId]?.displayName || 'Selected User');

    const printWindow = window.open('', '', 'width=800,height=600');

    const totalPayments = data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netRevenue = totalPayments - totalExpenses;

    printWindow.document.write(`
        <html>
        <head>
            <title>Fonekingdom Historical Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1, h2 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #667eea; color: white; }
                .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <h1>🔧 Fonekingdom Historical Report</h1>
            <div class="summary">
                <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
                <p><strong>User Filter:</strong> ${userLabel}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <h3>Summary Statistics</h3>
                <p><strong>Total Repairs:</strong> ${data.repairs.length}</p>
                <p><strong>Total Payments:</strong> ₱${totalPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                <p><strong>Total Expenses:</strong> ₱${totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                <p><strong>Net Revenue:</strong> ₱${netRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            </div>
            
            <h2>Repairs (${data.repairs.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Device</th>
                        <th>Status</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.repairs.map(repair => `
                        <tr>
                            <td>${new Date(repair.createdAt).toLocaleDateString()}</td>
                            <td>${repair.customerName}</td>
                            <td>${repair.brand} ${repair.model}</td>
                            <td>${repair.status}</td>
                            <td>₱${(parseFloat(repair.total) || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>Payments (${data.payments.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Received By</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.payments.map(payment => `
                        <tr>
                            <td>${new Date(payment.paymentDate || payment.recordedDate).toLocaleDateString()}</td>
                            <td>${payment.customerName}</td>
                            <td>₱${(parseFloat(payment.amount) || 0).toFixed(2)}</td>
                            <td>${payment.method}</td>
                            <td>${payment.receivedByName}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <button onclick="window.print()" style="background:#667eea;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;font-size:16px;">🖨️ Print</button>
        </body>
        </html>
    `);

    printWindow.document.close();
}
