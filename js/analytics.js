// ===== ANALYTICS & REPORTING MODULE =====

/**
 * Global analytics state
 */
window.analyticsDateRange = {
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    end: new Date()
};

// ===== REVENUE ANALYTICS =====

/**
 * Get revenue data for a date range
 */
function getRevenueAnalytics(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    const relevantRepairs = window.allRepairs.filter(r => {
        if (!r.payments || r.payments.length === 0) return false;
        
        // Check if any verified payment falls within date range
        return r.payments.some(p => {
            if (!p.verified) return false;
            const paymentDate = new Date(p.recordedDate || p.paymentDate).getTime();
            return paymentDate >= start && paymentDate <= end;
        });
    });
    
    // Calculate total revenue
    let totalRevenue = 0;
    let totalPartsCost = 0;
    let totalCommissions = 0;
    
    const dailyRevenue = {};
    const revenueByType = {};
    const revenueByTech = {};
    
    relevantRepairs.forEach(repair => {
        // Get verified payments in range
        const verifiedPayments = (repair.payments || []).filter(p => {
            if (!p.verified) return false;
            const paymentDate = new Date(p.recordedDate || p.paymentDate).getTime();
            return paymentDate >= start && paymentDate <= end;
        });
        
        const repairRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        if (repairRevenue > 0) {
            totalRevenue += repairRevenue;
            
            // Track by date
            verifiedPayments.forEach(p => {
                const date = new Date(p.recordedDate || p.paymentDate).toISOString().split('T')[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + p.amount;
            });
            
            // Track by repair type
            const type = repair.repairType || 'General Repair';
            revenueByType[type] = (revenueByType[type] || 0) + repairRevenue;
            
            // Track by technician
            if (repair.acceptedByName) {
                revenueByTech[repair.acceptedByName] = (revenueByTech[repair.acceptedByName] || 0) + repairRevenue;
            }
            
            // Calculate costs
            const partsCost = window.getRepairPartsCost ? window.getRepairPartsCost(repair) : (repair.partsCost || 0);
            totalPartsCost += partsCost;
            
            if (repair.commissionAmount) {
                totalCommissions += repair.commissionAmount;
            }
        }
    });
    
    const totalExpenses = totalPartsCost + totalCommissions;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return {
        totalRevenue,
        totalPartsCost,
        totalCommissions,
        totalExpenses,
        netProfit,
        profitMargin,
        repairCount: relevantRepairs.length,
        avgRevenuePerRepair: relevantRepairs.length > 0 ? totalRevenue / relevantRepairs.length : 0,
        dailyRevenue,
        revenueByType,
        revenueByTech
    };
}

// ===== PERFORMANCE METRICS =====

/**
 * Get technician performance metrics
 */
function getTechnicianPerformance(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    const techStats = {};
    
    window.allRepairs.forEach(repair => {
        if (!repair.acceptedBy || !repair.acceptedByName) return;
        
        const completedDate = repair.completedAt ? new Date(repair.completedAt).getTime() : null;
        if (!completedDate || completedDate < start || completedDate > end) return;
        
        const techName = repair.acceptedByName;
        
        if (!techStats[techName]) {
            techStats[techName] = {
                totalRepairs: 0,
                completedRepairs: 0,
                totalRevenue: 0,
                totalCommission: 0,
                totalRepairTime: 0,
                repairTimes: [],
                repairsByType: {}
            };
        }
        
        techStats[techName].totalRepairs++;
        
        if (repair.status === 'Claimed') {
            techStats[techName].completedRepairs++;
        }
        
        // Calculate revenue from this repair
        const revenue = (repair.payments || [])
            .filter(p => p.verified)
            .reduce((sum, p) => sum + p.amount, 0);
        techStats[techName].totalRevenue += revenue;
        
        if (repair.commissionAmount) {
            techStats[techName].totalCommission += repair.commissionAmount;
        }
        
        // Calculate repair time
        if (repair.createdAt && repair.completedAt) {
            const startTime = new Date(repair.createdAt).getTime();
            const endTime = new Date(repair.completedAt).getTime();
            const hours = (endTime - startTime) / (1000 * 60 * 60);
            
            techStats[techName].totalRepairTime += hours;
            techStats[techName].repairTimes.push(hours);
        }
        
        // Track by type
        const type = repair.repairType || 'General';
        techStats[techName].repairsByType[type] = (techStats[techName].repairsByType[type] || 0) + 1;
    });
    
    // Calculate averages
    Object.keys(techStats).forEach(tech => {
        const stats = techStats[tech];
        stats.completionRate = stats.totalRepairs > 0 ? (stats.completedRepairs / stats.totalRepairs) * 100 : 0;
        stats.avgRepairTime = stats.repairTimes.length > 0 
            ? stats.totalRepairTime / stats.repairTimes.length 
            : 0;
        stats.avgRevenuePerRepair = stats.totalRepairs > 0 
            ? stats.totalRevenue / stats.totalRepairs 
            : 0;
    });
    
    return techStats;
}

// ===== CUSTOMER ANALYTICS =====

/**
 * Get customer analytics
 */
function getCustomerAnalytics(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    const customers = {};
    let walkinCount = 0;
    let dealerCount = 0;
    
    window.allRepairs.forEach(repair => {
        const createdDate = new Date(repair.createdAt).getTime();
        if (createdDate < start || createdDate > end) return;
        
        const customerKey = `${repair.customerName}_${repair.contactNumber}`.toLowerCase();
        
        if (!customers[customerKey]) {
            customers[customerKey] = {
                name: repair.customerName,
                phone: repair.contactNumber,
                type: repair.customerType || 'Walk-in',
                shopName: repair.shopName || '',
                totalRepairs: 0,
                totalSpent: 0,
                repairs: []
            };
        }
        
        customers[customerKey].totalRepairs++;
        customers[customerKey].repairs.push(repair.id);
        
        const revenue = (repair.payments || [])
            .filter(p => p.verified)
            .reduce((sum, p) => sum + p.amount, 0);
        customers[customerKey].totalSpent += revenue;
        
        if (repair.customerType === 'Dealer') {
            dealerCount++;
        } else {
            walkinCount++;
        }
    });
    
    const customerArray = Object.values(customers);
    const repeatCustomers = customerArray.filter(c => c.totalRepairs > 1);
    const topCustomers = customerArray
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
    
    return {
        totalCustomers: customerArray.length,
        repeatCustomers: repeatCustomers.length,
        repeatRate: customerArray.length > 0 ? (repeatCustomers.length / customerArray.length) * 100 : 0,
        walkinCount,
        dealerCount,
        avgRepairsPerCustomer: customerArray.length > 0 
            ? customerArray.reduce((sum, c) => sum + c.totalRepairs, 0) / customerArray.length 
            : 0,
        avgSpendPerCustomer: customerArray.length > 0
            ? customerArray.reduce((sum, c) => sum + c.totalSpent, 0) / customerArray.length
            : 0,
        topCustomers,
        allCustomers: customerArray
    };
}

// ===== REPAIR TYPE ANALYTICS =====

/**
 * Get repair type analytics
 */
function getRepairTypeAnalytics(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    const repairTypes = {};
    
    window.allRepairs.forEach(repair => {
        const createdDate = new Date(repair.createdAt).getTime();
        if (createdDate < start || createdDate > end) return;
        
        const type = repair.repairType || 'General Repair';
        
        if (!repairTypes[type]) {
            repairTypes[type] = {
                count: 0,
                totalRevenue: 0,
                totalCost: 0,
                completed: 0,
                avgDuration: 0,
                durations: []
            };
        }
        
        repairTypes[type].count++;
        
        const revenue = (repair.payments || [])
            .filter(p => p.verified)
            .reduce((sum, p) => sum + p.amount, 0);
        repairTypes[type].totalRevenue += revenue;
        
        const partsCost = window.getRepairPartsCost ? window.getRepairPartsCost(repair) : (repair.partsCost || 0);
        repairTypes[type].totalCost += partsCost;
        
        if (repair.status === 'Claimed') {
            repairTypes[type].completed++;
        }
        
        if (repair.createdAt && repair.completedAt) {
            const duration = (new Date(repair.completedAt) - new Date(repair.createdAt)) / (1000 * 60 * 60);
            repairTypes[type].durations.push(duration);
        }
    });
    
    // Calculate averages and profit
    Object.keys(repairTypes).forEach(type => {
        const data = repairTypes[type];
        data.avgRevenue = data.count > 0 ? data.totalRevenue / data.count : 0;
        data.avgCost = data.count > 0 ? data.totalCost / data.count : 0;
        data.profit = data.totalRevenue - data.totalCost;
        data.profitMargin = data.totalRevenue > 0 ? (data.profit / data.totalRevenue) * 100 : 0;
        data.completionRate = data.count > 0 ? (data.completed / data.count) * 100 : 0;
        data.avgDuration = data.durations.length > 0 
            ? data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length 
            : 0;
    });
    
    // Sort by count
    const sorted = Object.entries(repairTypes)
        .map(([type, data]) => ({ type, ...data }))
        .sort((a, b) => b.count - a.count);
    
    return {
        byType: repairTypes,
        mostCommon: sorted[0] || null,
        mostProfitable: sorted.sort((a, b) => b.profit - a.profit)[0] || null,
        all: sorted
    };
}

// ===== INVENTORY ANALYTICS =====

/**
 * Get inventory analytics
 */
function getInventoryAnalytics(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    const partsUsage = {};
    let totalPartsCost = 0;
    
    // Analyze parts used in repairs
    window.allRepairs.forEach(repair => {
        if (!repair.partsUsed) return;
        
        Object.values(repair.partsUsed).forEach(part => {
            const usedDate = new Date(part.usedAt).getTime();
            if (usedDate < start || usedDate > end) return;
            
            const partKey = part.partNumber;
            
            if (!partsUsage[partKey]) {
                partsUsage[partKey] = {
                    partName: part.partName,
                    partNumber: part.partNumber,
                    timesUsed: 0,
                    totalQuantity: 0,
                    totalCost: 0
                };
            }
            
            partsUsage[partKey].timesUsed++;
            partsUsage[partKey].totalQuantity += part.quantity;
            partsUsage[partKey].totalCost += part.totalCost;
            totalPartsCost += part.totalCost;
        });
    });
    
    const partsArray = Object.values(partsUsage).sort((a, b) => b.timesUsed - a.timesUsed);
    
    // Current inventory status
    const activeItems = (window.allInventoryItems || []).filter(item => !item.deleted);
    const lowStockItems = window.getLowStockItems ? window.getLowStockItems() : [];
    const outOfStockItems = window.getOutOfStockItems ? window.getOutOfStockItems() : [];
    const totalInventoryValue = activeItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    
    return {
        mostUsedParts: partsArray.slice(0, 10),
        totalPartsCost,
        avgCostPerRepair: partsArray.length > 0 ? totalPartsCost / partsArray.length : 0,
        currentStock: activeItems.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length,
        totalInventoryValue,
        allPartsUsage: partsArray
    };
}

// ===== FINANCIAL REPORTS =====

/**
 * Get comprehensive financial report
 */
function getFinancialReport(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    let totalRevenue = 0;
    let cashPayments = 0;
    let gcashPayments = 0;
    let bankPayments = 0;
    let partsCost = 0;
    let commissions = 0;
    let generalExpenses = 0;
    
    // Revenue and payment methods
    window.allRepairs.forEach(repair => {
        (repair.payments || []).forEach(payment => {
            if (!payment.verified) return;
            
            const paymentDate = new Date(payment.recordedDate || payment.paymentDate).getTime();
            if (paymentDate < start || paymentDate > end) return;
            
            totalRevenue += payment.amount;
            
            switch (payment.method) {
                case 'Cash':
                    cashPayments += payment.amount;
                    break;
                case 'GCash':
                    gcashPayments += payment.amount;
                    break;
                case 'Bank Transfer':
                    bankPayments += payment.amount;
                    break;
            }
        });
        
        // Parts cost
        const repairPartsCost = window.getRepairPartsCost ? window.getRepairPartsCost(repair) : (repair.partsCost || 0);
        partsCost += repairPartsCost;
        
        // Commissions
        if (repair.commissionAmount && repair.commissionClaimedAt) {
            const claimDate = new Date(repair.commissionClaimedAt).getTime();
            if (claimDate >= start && claimDate <= end) {
                commissions += repair.commissionAmount;
            }
        }
    });
    
    // General expenses
    if (window.techExpenses) {
        window.techExpenses.forEach(expense => {
            const expenseDate = new Date(expense.date).getTime();
            if (expenseDate >= start && expenseDate <= end && expense.category !== 'Delivery') {
                generalExpenses += expense.amount;
            }
        });
    }
    
    const totalExpenses = partsCost + commissions + generalExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return {
        revenue: {
            total: totalRevenue,
            byCash: cashPayments,
            byGCash: gcashPayments,
            byBank: bankPayments
        },
        expenses: {
            parts: partsCost,
            commissions: commissions,
            general: generalExpenses,
            total: totalExpenses
        },
        profit: {
            net: netProfit,
            margin: profitMargin
        }
    };
}

// ===== ADVANCE PAYMENT ANALYTICS =====

/**
 * Get advance payment analytics
 */
function getAdvancePaymentAnalytics(startDate, endDate) {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    let totalAdvances = 0;
    let totalAdvancesApplied = 0;
    let totalAdvancesRefunded = 0;
    let totalAdvancesPending = 0;
    
    let countAdvances = 0;
    let countApplied = 0;
    let countRefunded = 0;
    let countPending = 0;
    
    let repairsWithAdvances = 0;
    const repairsProcessed = new Set();
    const pendingAdvanceRepairs = [];
    
    // Analyze all repairs for advance payments
    window.allRepairs.forEach(repair => {
        let hasAdvance = false;
        
        (repair.payments || []).forEach(payment => {
            if (!payment.isAdvance) return;
            
            const paymentDate = new Date(payment.recordedDate || payment.paymentDate).getTime();
            if (paymentDate < start || paymentDate > end) return;
            
            hasAdvance = true;
            countAdvances++;
            
            if (payment.advanceStatus === 'pending') {
                totalAdvancesPending += payment.amount;
                countPending++;
                
                // Track repair with pending advance
                if (!pendingAdvanceRepairs.find(r => r.id === repair.id)) {
                    pendingAdvanceRepairs.push({
                        id: repair.id,
                        customerName: repair.customerName,
                        brand: repair.brand,
                        model: repair.model,
                        advanceAmount: payment.amount,
                        recordedDate: payment.recordedDate || payment.paymentDate,
                        estimatedCost: repair.estimatedCost || null,
                        total: repair.total || 0
                    });
                }
            } else if (payment.advanceStatus === 'applied') {
                totalAdvancesApplied += payment.amount;
                countApplied++;
                totalAdvances += payment.amount;
            } else if (payment.advanceStatus === 'refunded') {
                totalAdvancesRefunded += payment.amount;
                countRefunded++;
            }
        });
        
        if (hasAdvance && !repairsProcessed.has(repair.id)) {
            repairsWithAdvances++;
            repairsProcessed.add(repair.id);
        }
    });
    
    totalAdvances = totalAdvancesApplied; // Only count applied advances in total revenue
    const avgAdvanceAmount = countAdvances > 0 ? (totalAdvancesApplied + totalAdvancesPending + totalAdvancesRefunded) / countAdvances : 0;
    
    // Calculate advance-to-final-cost ratio for applied advances
    let totalFinalCost = 0;
    let appliedAdvancesCount = 0;
    
    window.allRepairs.forEach(repair => {
        const hasAppliedAdvance = (repair.payments || []).some(p => 
            p.isAdvance && 
            p.advanceStatus === 'applied' &&
            new Date(p.recordedDate || p.paymentDate).getTime() >= start &&
            new Date(p.recordedDate || p.paymentDate).getTime() <= end
        );
        
        if (hasAppliedAdvance && repair.total > 0) {
            totalFinalCost += repair.total;
            appliedAdvancesCount++;
        }
    });
    
    const avgAdvanceToFinalRatio = appliedAdvancesCount > 0 && totalFinalCost > 0 
        ? (totalAdvancesApplied / totalFinalCost) * 100 
        : 0;
    
    return {
        summary: {
            totalAdvancesCollected: totalAdvances,
            totalPending: totalAdvancesPending,
            totalApplied: totalAdvancesApplied,
            totalRefunded: totalAdvancesRefunded,
            countAdvances,
            countPending,
            countApplied,
            countRefunded,
            avgAdvanceAmount,
            repairsWithAdvances,
            avgAdvanceToFinalRatio
        },
        pendingAdvances: pendingAdvanceRepairs
    };
}

// ===== EXPORT FUNCTIONS =====

/**
 * Export data to CSV
 */
function exportToCSV(data, filename) {
    let csv = '';
    
    if (Array.isArray(data) && data.length > 0) {
        // Get headers from first object
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';
        
        // Add rows
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
    }
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== SCHEDULED EXPORT FUNCTIONS =====

/**
 * Export daily summary (all payments/expenses/remittances for a specific date)
 * @param {Date} date - Date to export (defaults to yesterday)
 */
async function exportDailySummary(date = null) {
    try {
        // Default to yesterday
        if (!date) {
            const now = new Date();
            date = new Date(now);
            date.setDate(date.getDate() - 1);
        }
        
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        console.log(`📥 Exporting daily summary for ${dateString}...`);
        
        // Get all data for the date
        const paymentsData = [];
        const expensesData = [];
        const remittancesData = [];
        
        // Filter repairs with payments on this date
        window.allRepairs.forEach(repair => {
            if (repair.deleted) return;
            
            if (repair.payments && repair.payments.length > 0) {
                repair.payments.forEach(payment => {
                    if (!payment.recordedDate) return;
                    
                    const paymentDate = new Date(payment.recordedDate).toISOString().split('T')[0];
                    if (paymentDate === dateString) {
                        paymentsData.push({
                            'Repair ID': repair.id,
                            'Customer': repair.customerName,
                            'Amount': payment.amount,
                            'Method': payment.method,
                            'Verified': payment.verified ? 'Yes' : 'No',
                            'Collected By': payment.receivedBy || 'N/A',
                            'Remittance Status': payment.remittanceStatus || 'N/A',
                            'Recorded At': utils.formatDateTime(payment.recordedDate),
                            'Notes': payment.notes || ''
                        });
                    }
                });
            }
        });
        
        // Filter expenses for this date
        if (window.techExpenses) {
            window.techExpenses.forEach(expense => {
                const expenseDate = new Date(expense.date).toISOString().split('T')[0];
                if (expenseDate === dateString) {
                    expensesData.push({
                        'Expense ID': expense.id,
                        'Technician': expense.techName,
                        'Category': expense.category,
                        'Amount': expense.amount,
                        'Description': expense.description,
                        'Repair ID': expense.repairId || 'General',
                        'Remittance ID': expense.remittanceId || 'Not Remitted',
                        'Created At': utils.formatDateTime(expense.createdAt)
                    });
                }
            });
        }
        
        // Filter remittances for this date
        if (window.techRemittances) {
            window.techRemittances.forEach(remittance => {
                const remittanceDate = new Date(remittance.date).toISOString().split('T')[0];
                if (remittanceDate === dateString) {
                    remittancesData.push({
                        'Remittance ID': remittance.id,
                        'Technician': remittance.techName,
                        'Type': remittance.remittanceType || 'cash',
                        'Total Payments': remittance.totalPaymentsCollected,
                        'Total Expenses': remittance.totalExpenses,
                        'Expected Amount': remittance.expectedAmount,
                        'Actual Amount': remittance.actualAmount,
                        'Discrepancy': remittance.discrepancy,
                        'Status': remittance.status,
                        'Submitted At': utils.formatDateTime(remittance.submittedAt),
                        'Verified By': remittance.verifiedBy || 'Pending',
                        'Verified At': remittance.verifiedAt ? utils.formatDateTime(remittance.verifiedAt) : 'N/A'
                    });
                }
            });
        }
        
        const totalRecords = paymentsData.length + expensesData.length + remittancesData.length;
        
        // Show warning if large export
        if (totalRecords > 1000 && window.utils && window.utils.showToast) {
            window.utils.showToast(
                `⚠️ Large export (${totalRecords} records) may take 10-15 seconds`,
                'warning',
                5000
            );
        }
        
        // Combine all data with section headers
        const exportData = [];
        
        // Add payments section
        exportData.push({ '=== PAYMENTS ===': '', 'Records': paymentsData.length });
        exportData.push(...paymentsData);
        exportData.push({}); // Empty row
        
        // Add expenses section
        exportData.push({ '=== EXPENSES ===': '', 'Records': expensesData.length });
        exportData.push(...expensesData);
        exportData.push({}); // Empty row
        
        // Add remittances section
        exportData.push({ '=== REMITTANCES ===': '', 'Records': remittancesData.length });
        exportData.push(...remittancesData);
        exportData.push({}); // Empty row
        
        // Add summary
        const totalPayments = paymentsData.reduce((sum, p) => sum + (p.Amount || 0), 0);
        const totalExpenses = expensesData.reduce((sum, e) => sum + (e.Amount || 0), 0);
        exportData.push({ '=== SUMMARY ===': '' });
        exportData.push({ 'Metric': 'Total Payments', 'Value': totalPayments });
        exportData.push({ 'Metric': 'Total Expenses', 'Value': totalExpenses });
        exportData.push({ 'Metric': 'Net Revenue', 'Value': totalPayments - totalExpenses });
        
        // Export to CSV
        exportToCSV(exportData, `daily_summary_${dateString}`);
        
        console.log(`✅ Daily summary exported: ${totalRecords} records`);
        
        return { success: true, recordCount: totalRecords };
        
    } catch (error) {
        console.error('❌ Error exporting daily summary:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Export weekly financial report
 * @param {Date} startDate - Start date (defaults to 7 days ago)
 */
async function exportWeeklyReport(startDate = null) {
    try {
        // Default to last 7 days
        if (!startDate) {
            const now = new Date();
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        
        const startString = startDate.toISOString().split('T')[0];
        const endString = endDate.toISOString().split('T')[0];
        
        console.log(`📥 Exporting weekly report from ${startString} to ${endString}...`);
        
        // Generate financial report for the period
        const report = getFinancialReport(startDate, endDate);
        
        // Format for CSV
        const exportData = [];
        
        // Header
        exportData.push({
            'Weekly Financial Report': '',
            'Period': `${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}`
        });
        exportData.push({});
        
        // Revenue section
        exportData.push({ '=== REVENUE ===': '' });
        exportData.push({ 'Metric': 'Total Revenue', 'Amount (₱)': report.revenue.total });
        exportData.push({ 'Metric': 'Cash Payments', 'Amount (₱)': report.revenue.byCash });
        exportData.push({ 'Metric': 'GCash Payments', 'Amount (₱)': report.revenue.byGCash });
        exportData.push({ 'Metric': 'Bank Transfers', 'Amount (₱)': report.revenue.byBank });
        exportData.push({});
        
        // Expenses section
        exportData.push({ '=== EXPENSES ===': '' });
        exportData.push({ 'Metric': 'Parts Cost', 'Amount (₱)': report.expenses.parts });
        exportData.push({ 'Metric': 'Tech Commissions', 'Amount (₱)': report.expenses.commissions });
        exportData.push({ 'Metric': 'General Expenses', 'Amount (₱)': report.expenses.general });
        exportData.push({ 'Metric': 'Total Expenses', 'Amount (₱)': report.expenses.total });
        exportData.push({});
        
        // Profit section
        exportData.push({ '=== PROFIT ===': '' });
        exportData.push({ 'Metric': 'Net Profit', 'Amount (₱)': report.profit.net });
        exportData.push({ 'Metric': 'Profit Margin', 'Percentage': `${report.profit.margin.toFixed(2)}%` });
        
        const recordCount = exportData.length;
        
        // Export to CSV
        exportToCSV(exportData, `weekly_report_${startString}_to_${endString}`);
        
        console.log(`✅ Weekly report exported`);
        
        return { success: true, recordCount: recordCount };
        
    } catch (error) {
        console.error('❌ Error exporting weekly report:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Export monthly archive (comprehensive data for entire month)
 * @param {number} year - Year
 * @param {number} month - Month (0-11, JavaScript date format)
 */
async function exportMonthlyArchive(year = null, month = null) {
    try {
        // Default to previous month
        if (year === null || month === null) {
            const now = new Date();
            const prevMonth = new Date(now);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            year = prevMonth.getFullYear();
            month = prevMonth.getMonth();
        }
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month
        
        const monthName = startDate.toLocaleString('default', { month: 'long' });
        const monthString = `${monthName}_${year}`;
        
        console.log(`📥 Exporting monthly archive for ${monthName} ${year}...`);
        
        // Collect all data for the month
        const repairsData = [];
        const paymentsData = [];
        const expensesData = [];
        const remittancesData = [];
        
        // Filter repairs claimed/completed in this month
        window.allRepairs.forEach(repair => {
            if (repair.deleted) return;
            
            let inPeriod = false;
            
            // Check if claimed/completed in this month
            if (repair.claimedAt) {
                const claimedDate = new Date(repair.claimedAt);
                if (claimedDate >= startDate && claimedDate <= endDate) {
                    inPeriod = true;
                }
            }
            
            if (inPeriod) {
                repairsData.push({
                    'Repair ID': repair.id,
                    'Customer': repair.customerName,
                    'Contact': repair.contactNumber,
                    'Type': repair.customerType,
                    'Brand': repair.brand,
                    'Model': repair.model,
                    'Problem': repair.problemType,
                    'Status': repair.status,
                    'Total': repair.total,
                    'Parts Cost': repair.partsCost || 0,
                    'Labor Cost': repair.laborCost || 0,
                    'Technician': repair.acceptedBy || 'N/A',
                    'Received At': utils.formatDateTime(repair.createdAt),
                    'Completed At': utils.formatDateTime(repair.completedAt),
                    'Claimed At': utils.formatDateTime(repair.claimedAt)
                });
            }
            
            // Collect payments from this month
            if (repair.payments && repair.payments.length > 0) {
                repair.payments.forEach(payment => {
                    if (!payment.recordedDate) return;
                    
                    const paymentDate = new Date(payment.recordedDate);
                    if (paymentDate >= startDate && paymentDate <= endDate) {
                        paymentsData.push({
                            'Payment ID': `${repair.id}_${payment.paymentDate}`,
                            'Repair ID': repair.id,
                            'Customer': repair.customerName,
                            'Amount': payment.amount,
                            'Method': payment.method,
                            'Verified': payment.verified ? 'Yes' : 'No',
                            'Collected By': payment.receivedBy,
                            'Recorded Date': utils.formatDateTime(payment.recordedDate)
                        });
                    }
                });
            }
        });
        
        // Filter expenses from this month
        if (window.techExpenses) {
            window.techExpenses.forEach(expense => {
                const expenseDate = new Date(expense.date);
                if (expenseDate >= startDate && expenseDate <= endDate) {
                    expensesData.push({
                        'Expense ID': expense.id,
                        'Technician': expense.techName,
                        'Category': expense.category,
                        'Amount': expense.amount,
                        'Description': expense.description,
                        'Date': utils.formatDate(expense.date)
                    });
                }
            });
        }
        
        // Filter remittances from this month
        if (window.techRemittances) {
            window.techRemittances.forEach(remittance => {
                const remittanceDate = new Date(remittance.date);
                if (remittanceDate >= startDate && remittanceDate <= endDate) {
                    remittancesData.push({
                        'Remittance ID': remittance.id,
                        'Technician': remittance.techName,
                        'Payments Collected': remittance.totalPaymentsCollected,
                        'Expenses': remittance.totalExpenses,
                        'Expected': remittance.expectedAmount,
                        'Actual': remittance.actualAmount,
                        'Status': remittance.status,
                        'Submitted': utils.formatDate(remittance.submittedAt)
                    });
                }
            });
        }
        
        const totalRecords = repairsData.length + paymentsData.length + 
                            expensesData.length + remittancesData.length;
        
        // Show warning if large export
        if (totalRecords > 1000 && window.utils && window.utils.showToast) {
            window.utils.showToast(
                `⚠️ Large export (${totalRecords} records) may take 10-15 seconds`,
                'warning',
                5000
            );
        }
        
        // Combine all data with section headers
        const exportData = [];
        
        exportData.push({ 
            'Monthly Archive': monthString, 
            'Total Records': totalRecords 
        });
        exportData.push({});
        
        // Repairs section
        exportData.push({ '=== REPAIRS ===': '', 'Count': repairsData.length });
        exportData.push(...repairsData);
        exportData.push({});
        
        // Payments section
        exportData.push({ '=== PAYMENTS ===': '', 'Count': paymentsData.length });
        exportData.push(...paymentsData);
        exportData.push({});
        
        // Expenses section
        exportData.push({ '=== EXPENSES ===': '', 'Count': expensesData.length });
        exportData.push(...expensesData);
        exportData.push({});
        
        // Remittances section
        exportData.push({ '=== REMITTANCES ===': '', 'Count': remittancesData.length });
        exportData.push(...remittancesData);
        
        // Export to CSV
        exportToCSV(exportData, `monthly_archive_${monthString}`);
        
        console.log(`✅ Monthly archive exported: ${totalRecords} records`);
        
        return { success: true, recordCount: totalRecords };
        
    } catch (error) {
        console.error('❌ Error exporting monthly archive:', error);
        return { success: false, error: error.message };
    }
}

// Export functions to window
window.getRevenueAnalytics = getRevenueAnalytics;
window.getTechnicianPerformance = getTechnicianPerformance;
window.getCustomerAnalytics = getCustomerAnalytics;
window.getRepairTypeAnalytics = getRepairTypeAnalytics;
window.getInventoryAnalytics = getInventoryAnalytics;
window.getFinancialReport = getFinancialReport;
window.getAdvancePaymentAnalytics = getAdvancePaymentAnalytics;
window.exportToCSV = exportToCSV;

// Export scheduled export functions
window.exportDailySummary = exportDailySummary;
window.exportWeeklyReport = exportWeeklyReport;
window.exportMonthlyArchive = exportMonthlyArchive;

console.log('✅ analytics.js loaded');

