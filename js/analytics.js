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
        // Get verified payments in range (exclude refunded)
        const verifiedPayments = (repair.payments || []).filter(p => {
            if (!p.verified || p.refunded) return false;
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

            // Calculate commission properly
            if (window.calculateRepairCommission && repair.acceptedBy) {
                const commissionResult = window.calculateRepairCommission(repair, repair.acceptedBy);
                if (commissionResult.eligible && commissionResult.amount > 0) {
                    totalCommissions += commissionResult.amount;
                }
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

        // Calculate revenue from this repair (exclude refunded payments)
        const revenue = (repair.payments || [])
            .filter(p => p.verified && !p.refunded)
            .reduce((sum, p) => sum + p.amount, 0);
        techStats[techName].totalRevenue += revenue;

        // Calculate commission properly
        if (window.calculateRepairCommission && repair.acceptedBy) {
            const commissionResult = window.calculateRepairCommission(repair, repair.acceptedBy);
            if (commissionResult.eligible && commissionResult.amount > 0) {
                techStats[techName].totalCommission += commissionResult.amount;
            }
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

        // Commissions - calculate for all repairs with claimed status
        if (repair.status === 'Claimed' && repair.acceptedBy && window.calculateRepairCommission) {
            const commissionResult = window.calculateRepairCommission(repair, repair.acceptedBy);
            if (commissionResult.eligible && commissionResult.amount > 0) {
                commissions += commissionResult.amount;
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
 * Export data to CSV - handles mixed-structure objects for reports
 */
function exportArrayToCSV(data, filename) {
    let csv = '';

    if (Array.isArray(data) && data.length > 0) {
        // For mixed-structure reports, each row can have different keys
        // Don't use fixed headers - output each row's keys/values
        data.forEach(row => {
            const keys = Object.keys(row);
            const values = keys.map(key => {
                let value = row[key];

                // Convert undefined/null to empty string
                if (value === undefined || value === null) {
                    value = '';
                }

                // Convert to string
                value = String(value);

                // Escape commas and quotes
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
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

            if (repair.payments) {
                // Ensure payments is an array (Firebase may return object)
                const payments = Array.isArray(repair.payments) ? repair.payments : Object.values(repair.payments);
                payments.forEach(payment => {
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
        exportArrayToCSV(exportData, `daily_summary_${dateString}`);

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
        exportArrayToCSV(exportData, `weekly_report_${startString}_to_${endString}`);

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
            if (repair.payments) {
                // Ensure payments is an array (Firebase may return object)
                const payments = Array.isArray(repair.payments) ? repair.payments : Object.values(repair.payments);
                payments.forEach(payment => {
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
        exportData.push({});

        // Parts Orders section
        const partsOrdersData = [];
        if (window.allPartsOrders) {
            window.allPartsOrders.forEach(order => {
                const orderDate = new Date(order.requestedAt);
                if (orderDate >= startDate && orderDate <= endDate) {
                    partsOrdersData.push({
                        'Order Number': order.orderNumber,
                        'Repair ID': order.repairId,
                        'Customer': order.repairDetails?.customerName || 'N/A',
                        'Part Name': order.partName,
                        'Quantity': order.quantity,
                        'Supplier': order.supplierName || 'TBD',
                        'Urgency': order.urgency.toUpperCase(),
                        'Status': order.status.toUpperCase(),
                        'Estimated Price': order.estimatedPrice || 0,
                        'Actual Price': order.actualPrice || 0,
                        'Variance': order.priceVariance || 0,
                        'Variance %': order.priceVariancePercent || 0,
                        'Downpayment': order.paymentId ? 'Yes' : 'No',
                        'Requested By': order.requestedByName,
                        'Requested Date': utils.formatDate(order.requestedAt),
                        'Received Date': order.receivedAt ? utils.formatDate(order.receivedAt) : 'N/A',
                        'Cancellation Reason': order.cancellationReason || 'N/A'
                    });
                }
            });
        }
        exportData.push({ '=== PARTS ORDERS ===': '', 'Count': partsOrdersData.length });
        exportData.push(...partsOrdersData);

        // Export to CSV
        exportArrayToCSV(exportData, `monthly_archive_${monthString}`);

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
window.exportArrayToCSV = exportArrayToCSV;

// Export scheduled export functions
window.exportDailySummary = exportDailySummary;
window.exportWeeklyReport = exportWeeklyReport;
window.exportMonthlyArchive = exportMonthlyArchive;

// ===== PROFIT CALCULATION ENGINE =====

/**
 * Calculate true profit for a repair including overhead burden
 * @param {Object} repair - Repair object
 * @param {Date} startDate - Period start for overhead calculation
 * @param {Date} endDate - Period end for overhead calculation
 */
function calculateRepairProfit(repair, startDate, endDate) {
    if (!repair || repair.deleted) return null;

    // Revenue: Total verified payments
    const revenue = (repair.payments || [])
        .filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);

    // Parts cost
    const partsCost = repair.partsCost || 0;

    // Tech commission paid out (tech keeps this)
    let techCommission = 0;
    const techId = repair.acceptedBy || repair.technicianId;
    if (techId && window.calculateRepairCommission) {
        const commissionResult = window.calculateRepairCommission(repair, techId);
        if (commissionResult.eligible && commissionResult.amount > 0) {
            techCommission = commissionResult.amount;
        }
    }

    // Shop revenue (what shop keeps after paying tech)
    const shopRevenue = revenue - partsCost - techCommission;

    // NOTE: Overhead is NOT allocated per repair, it's tracked as total period expense
    // This is just for individual repair profit calculation
    const overheadBurden = 0; // Don't burden individual repairs with overhead

    // Gross profit for this repair (before overhead)
    const grossProfit = shopRevenue;

    // Net profit for this repair (overhead deducted at dashboard level, not per repair)
    const netProfit = grossProfit;

    // Profit margin based on shop revenue (before overhead)
    const profitMargin = shopRevenue > 0 ? (grossProfit / shopRevenue) * 100 : 0;

    return {
        repairId: repair.id,
        customerName: repair.customerName,
        repairType: repair.problemType,
        technicianName: repair.acceptedByName || 'Unknown',
        revenue: revenue,
        partsCost: partsCost,
        techCommission: techCommission,
        shopRevenue: shopRevenue,
        grossProfit: grossProfit,
        overheadBurden: overheadBurden,
        netProfit: netProfit,
        profitMargin: profitMargin,
        claimedAt: repair.claimedAt
    };
}

/**
 * Get profit analytics by repair type
 */
function getProfitByRepairType(startDate, endDate) {
    if (!window.allRepairs) return {};

    const byType = {};

    window.allRepairs.forEach(repair => {
        if (repair.deleted || !repair.claimedAt) return;

        const claimedDate = new Date(repair.claimedAt);
        if (claimedDate < startDate || claimedDate > endDate) return;

        const profit = calculateRepairProfit(repair, startDate, endDate);
        if (!profit) return;

        const type = repair.problemType || 'Other';

        if (!byType[type]) {
            byType[type] = {
                count: 0,
                totalRevenue: 0,
                totalPartsCost: 0,
                totalTechCommission: 0,
                totalShopRevenue: 0,
                totalNetProfit: 0,
                avgProfitMargin: 0,
                repairs: []
            };
        }

        byType[type].count++;
        byType[type].totalRevenue += profit.revenue;
        byType[type].totalPartsCost += profit.partsCost;
        byType[type].totalTechCommission += profit.techCommission;
        byType[type].totalShopRevenue += profit.shopRevenue;
        byType[type].totalNetProfit += profit.shopRevenue; // Shop revenue before overhead
        byType[type].repairs.push(profit);
    });

    // Calculate averages
    Object.keys(byType).forEach(type => {
        const data = byType[type];
        data.avgRevenue = data.totalRevenue / data.count;
        data.avgProfit = data.totalNetProfit / data.count;
        data.avgProfitMargin = data.totalShopRevenue > 0 ?
            (data.totalNetProfit / data.totalShopRevenue) * 100 : 0;
    });

    // Sort by total net profit descending
    const sorted = Object.entries(byType)
        .sort(([, a], [, b]) => b.totalNetProfit - a.totalNetProfit)
        .reduce((acc, [type, data]) => {
            acc[type] = data;
            return acc;
        }, {});

    return {
        byType: sorted,
        mostProfitable: Object.entries(sorted)[0]?.[0] || null,
        leastProfitable: Object.entries(sorted).slice(-1)[0]?.[0] || null
    };
}

/**
 * Get profit analytics by technician
 */
function getProfitByTechnician(startDate, endDate) {
    if (!window.allRepairs) return {};

    const byTech = {};

    window.allRepairs.forEach(repair => {
        if (repair.deleted || !repair.claimedAt || !repair.acceptedBy) return;

        const claimedDate = new Date(repair.claimedAt);
        if (claimedDate < startDate || claimedDate > endDate) return;

        const profit = calculateRepairProfit(repair, startDate, endDate);
        if (!profit) return;

        const tech = repair.acceptedBy;
        const techName = window.allUsers && window.allUsers[tech] ?
            window.allUsers[tech].displayName : tech;

        if (!byTech[techName]) {
            byTech[techName] = {
                techId: tech,
                repairCount: 0,
                totalRevenue: 0,
                totalPartsCost: 0,
                totalTechCommission: 0,
                totalShopRevenue: 0,
                totalNetProfit: 0,
                avgProfitMargin: 0,
                repairs: []
            };
        }

        byTech[techName].repairCount++;
        byTech[techName].totalRevenue += profit.revenue;
        byTech[techName].totalPartsCost += profit.partsCost;
        byTech[techName].totalTechCommission += profit.techCommission;
        byTech[techName].totalShopRevenue += profit.shopRevenue;
        byTech[techName].totalNetProfit += profit.netProfit;
        byTech[techName].repairs.push(profit);
    });

    // Calculate averages
    Object.keys(byTech).forEach(tech => {
        const data = byTech[tech];
        data.avgRevenue = data.totalRevenue / data.repairCount;
        data.avgProfit = data.totalNetProfit / data.repairCount;
        data.avgProfitMargin = data.totalShopRevenue > 0 ?
            (data.totalNetProfit / data.totalShopRevenue) * 100 : 0;
    });

    // Sort by total net profit descending
    const sorted = Object.entries(byTech)
        .sort(([, a], [, b]) => b.totalNetProfit - a.totalNetProfit)
        .reduce((acc, [tech, data]) => {
            acc[tech] = data;
            return acc;
        }, {});

    return sorted;
}

/**
 * Get profit trends over time
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {string} interval - 'daily', 'weekly', 'monthly'
 */
function getProfitTrends(startDate, endDate, interval = 'daily') {
    if (!window.allRepairs) return [];

    const trends = [];
    const dataByPeriod = {};

    window.allRepairs.forEach(repair => {
        if (repair.deleted || !repair.claimedAt) return;

        const claimedDate = new Date(repair.claimedAt);
        if (claimedDate < startDate || claimedDate > endDate) return;

        const profit = calculateRepairProfit(repair, startDate, endDate);
        if (!profit) return;

        // Determine period key based on interval
        let periodKey;
        if (interval === 'daily') {
            periodKey = claimedDate.toISOString().split('T')[0];
        } else if (interval === 'weekly') {
            const weekStart = new Date(claimedDate);
            weekStart.setDate(claimedDate.getDate() - claimedDate.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
        } else if (interval === 'monthly') {
            periodKey = `${claimedDate.getFullYear()}-${(claimedDate.getMonth() + 1).toString().padStart(2, '0')}`;
        }

        if (!dataByPeriod[periodKey]) {
            dataByPeriod[periodKey] = {
                period: periodKey,
                repairCount: 0,
                totalRevenue: 0,
                totalCosts: 0,
                totalProfit: 0,
                avgProfitMargin: 0
            };
        }

        dataByPeriod[periodKey].repairCount++;
        dataByPeriod[periodKey].totalRevenue += profit.revenue;
        dataByPeriod[periodKey].totalCosts += (profit.partsCost + profit.techCommission);
        dataByPeriod[periodKey].totalProfit += profit.shopRevenue;
    });

    // Calculate averages and sort by period
    Object.values(dataByPeriod).forEach(data => {
        data.avgProfitMargin = data.totalRevenue > 0 ?
            (data.totalProfit / data.totalRevenue) * 100 : 0;
    });

    return Object.values(dataByPeriod).sort((a, b) =>
        a.period.localeCompare(b.period)
    );
}

/**
 * Get comprehensive profit dashboard data
 */
function getProfitDashboard(startDate, endDate) {
    if (!window.allRepairs) {
        return {
            summary: {},
            byType: {},
            byTechnician: {},
            trends: [],
            overhead: {}
        };
    }

    // Summary metrics
    const allProfits = [];
    window.allRepairs.forEach(repair => {
        if (repair.deleted || !repair.claimedAt) return;

        const claimedDate = new Date(repair.claimedAt);
        if (claimedDate < startDate || claimedDate > endDate) return;

        const profit = calculateRepairProfit(repair, startDate, endDate);
        if (profit) allProfits.push(profit);
    });

    const totalRevenue = allProfits.reduce((sum, p) => sum + p.revenue, 0);
    const totalPartsCost = allProfits.reduce((sum, p) => sum + p.partsCost, 0);
    const totalTechCommission = allProfits.reduce((sum, p) => sum + p.techCommission, 0);
    const totalShopRevenue = allProfits.reduce((sum, p) => sum + p.shopRevenue, 0);

    console.log(`📊 Profit Dashboard - Calculating for period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    console.log(`📦 window.overheadExpenses available:`, !!window.overheadExpenses);
    console.log(`📦 window.overheadExpenses count:`, window.overheadExpenses ? window.overheadExpenses.length : 0);

    // Get TOTAL overhead for period (not per repair)
    const totalOverhead = window.calculateOverheadForPeriod ?
        window.calculateOverheadForPeriod(startDate, endDate) : 0;

    // Calculate overhead by type
    const overheadByType = {
        shop: 0,
        house: 0,
        loans: 0,
        miscellaneous: 0
    };

    if (window.overheadExpenses) {
        window.overheadExpenses
            .filter(expense => !expense.deleted)
            .forEach(expense => {
                const expenseDate = new Date(expense.date);
                if (expenseDate >= startDate && expenseDate <= endDate) {
                    const type = (expense.expenseType || 'Miscellaneous').toLowerCase();
                    if (overheadByType.hasOwnProperty(type)) {
                        overheadByType[type] += expense.amount;
                    } else {
                        overheadByType.miscellaneous += expense.amount;
                    }
                }
            });
    }

    // Calculate commission by technician
    const commissionByTech = {};
    allProfits.forEach(profit => {
        const techName = profit.technicianName || 'Unknown';
        if (!commissionByTech[techName]) {
            commissionByTech[techName] = 0;
        }
        commissionByTech[techName] += profit.techCommission;
    });

    console.log(`💰 Total overhead calculated: ₱${totalOverhead.toFixed(2)}`);
    console.log(`🏪 Shop overhead: ₱${overheadByType.shop.toFixed(2)}`);
    console.log(`🏠 House overhead: ₱${overheadByType.house.toFixed(2)}`);
    console.log(`� Loans overhead: ₱${overheadByType.loans.toFixed(2)}`);
    console.log(`�📝 Misc overhead: ₱${overheadByType.miscellaneous.toFixed(2)}`);
    console.log(`👨‍🔧 Commissions by tech:`, commissionByTech);

    // Net profit = Shop Revenue - Overhead
    const totalNetProfit = totalShopRevenue - totalOverhead;
    const avgProfitMargin = totalShopRevenue > 0 ? (totalNetProfit / totalShopRevenue) * 100 : 0;

    return {
        summary: {
            repairCount: allProfits.length,
            totalRevenue: totalRevenue,
            totalPartsCost: totalPartsCost,
            totalCommission: totalTechCommission,
            totalShopRevenue: totalShopRevenue,
            totalOverhead: totalOverhead,
            totalNetProfit: totalNetProfit,
            avgProfitMargin: avgProfitMargin,
            avgProfitPerRepair: allProfits.length > 0 ? totalNetProfit / allProfits.length : 0,
            overheadByType: overheadByType,
            commissionByTech: commissionByTech
        },
        byType: getProfitByRepairType(startDate, endDate),
        byTechnician: getProfitByTechnician(startDate, endDate),
        trends: getProfitTrends(startDate, endDate, 'daily'),
        overhead: {
            total: totalOverhead,
            byType: overheadByType,
            perRepair: allProfits.length > 0 ? totalOverhead / allProfits.length : 0,
            percentage: totalRevenue > 0 ? (totalOverhead / totalRevenue) * 100 : 0
        }
    };
}

/**
 * Export profit report to CSV
 */
function exportProfitReport(startDate, endDate) {
    const dashboard = getProfitDashboard(startDate, endDate);

    const exportData = [];

    // Summary section
    exportData.push({
        'PROFIT REPORT': '',
        'Period': `${utils.formatDate(startDate)} - ${utils.formatDate(endDate)}`
    });
    exportData.push({});
    exportData.push({ '=== SUMMARY ===': '' });
    exportData.push({ 'Metric': 'Total Repairs', 'Value': dashboard.summary.repairCount });
    exportData.push({ 'Metric': 'Total Revenue', 'Value': dashboard.summary.totalRevenue });
    exportData.push({ 'Metric': 'Parts Cost', 'Value': dashboard.summary.totalPartsCost });
    exportData.push({ 'Metric': 'Commission', 'Value': dashboard.summary.totalCommission });
    exportData.push({ 'Metric': 'Overhead', 'Value': dashboard.summary.totalOverhead });
    exportData.push({ 'Metric': 'Net Profit', 'Value': dashboard.summary.totalNetProfit });
    exportData.push({ 'Metric': 'Profit Margin', 'Value': `${dashboard.summary.avgProfitMargin.toFixed(2)}%` });
    exportData.push({});

    // By repair type
    exportData.push({ '=== PROFIT BY REPAIR TYPE ===': '' });
    Object.entries(dashboard.byType.byType).forEach(([type, data]) => {
        exportData.push({
            'Repair Type': type,
            'Count': data.count,
            'Revenue': data.totalRevenue,
            'Net Profit': data.totalNetProfit,
            'Profit Margin': `${data.avgProfitMargin.toFixed(2)}%`
        });
    });
    exportData.push({});

    // By technician
    exportData.push({ '=== PROFIT BY TECHNICIAN ===': '' });
    Object.entries(dashboard.byTechnician).forEach(([tech, data]) => {
        exportData.push({
            'Technician': tech,
            'Repairs': data.repairCount,
            'Revenue': data.totalRevenue,
            'Net Profit': data.totalNetProfit,
            'Profit Margin': `${data.avgProfitMargin.toFixed(2)}%`
        });
    });

    const filename = `profit_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
    exportArrayToCSV(exportData, filename);
}

// ===== PROFIT & LOSS STATEMENT =====

/**
 * Generate comprehensive P&L statement
 * @param {Date} startDate
 * @param {Date} endDate
 */
function generateProfitLossStatement(startDate, endDate) {
    if (!window.allRepairs) {
        return null;
    }

    // Revenue section
    const completedRepairs = window.allRepairs.filter(r => {
        if (!r.claimedAt || r.deleted) return false;
        const claimedDate = new Date(r.claimedAt);
        return claimedDate >= startDate && claimedDate <= endDate;
    });

    const totalRevenue = completedRepairs.reduce((sum, r) => {
        return sum + (r.payments || []).filter(p => p.verified).reduce((s, p) => s + p.amount, 0);
    }, 0);

    // Cost of Goods Sold (COGS)
    const totalPartsCost = completedRepairs.reduce((sum, r) => {
        return sum + (window.getRepairPartsCost ? window.getRepairPartsCost(r) : (r.partsCost || 0));
    }, 0);

    const totalCommission = completedRepairs.reduce((sum, r) => {
        if (r.acceptedBy && window.calculateRepairCommission) {
            const commissionResult = window.calculateRepairCommission(r, r.acceptedBy);
            return sum + (commissionResult.eligible ? commissionResult.amount : 0);
        }
        return sum;
    }, 0);
    const grossProfit = totalRevenue - totalPartsCost - totalCommission;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Operating Expenses
    const totalOverhead = window.calculateOverheadForPeriod ?
        window.calculateOverheadForPeriod(startDate, endDate) : 0;

    // Breakdown overhead by category
    const overheadByCategory = {};
    if (window.overheadExpenses) {
        window.overheadExpenses.forEach(exp => {
            if (exp.deleted) return;
            const expDate = new Date(exp.date);
            if (expDate >= startDate && expDate <= endDate) {
                if (!overheadByCategory[exp.category]) {
                    overheadByCategory[exp.category] = 0;
                }
                overheadByCategory[exp.category] += exp.amount;
            }
        });
    }

    // Net Income
    const operatingIncome = grossProfit - totalOverhead;
    const netIncome = operatingIncome; // Simplified: no other income/expenses
    const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
        period: {
            start: startDate,
            end: endDate,
            days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        },
        revenue: {
            totalRevenue: totalRevenue,
            repairCount: completedRepairs.length,
            averagePerRepair: completedRepairs.length > 0 ? totalRevenue / completedRepairs.length : 0
        },
        cogs: {
            partsCost: totalPartsCost,
            commission: totalCommission,
            total: totalPartsCost + totalCommission,
            percentOfRevenue: totalRevenue > 0 ? ((totalPartsCost + totalCommission) / totalRevenue) * 100 : 0
        },
        grossProfit: {
            amount: grossProfit,
            margin: grossMargin
        },
        operatingExpenses: {
            total: totalOverhead,
            byCategory: overheadByCategory,
            percentOfRevenue: totalRevenue > 0 ? (totalOverhead / totalRevenue) * 100 : 0
        },
        operatingIncome: {
            amount: operatingIncome,
            margin: totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0
        },
        netIncome: {
            amount: netIncome,
            margin: netMargin,
            perRepair: completedRepairs.length > 0 ? netIncome / completedRepairs.length : 0
        }
    };
}

/**
 * Get quarterly summary
 * @param {number} year - Year (e.g., 2026)
 * @param {number} quarter - Quarter (1-4)
 */
function getQuarterlySummary(year, quarter) {
    const quarterMonths = {
        1: [0, 1, 2],   // Jan, Feb, Mar
        2: [3, 4, 5],   // Apr, May, Jun
        3: [6, 7, 8],   // Jul, Aug, Sep
        4: [9, 10, 11]  // Oct, Nov, Dec
    };

    const months = quarterMonths[quarter];
    const startDate = new Date(year, months[0], 1);
    const endDate = new Date(year, months[2] + 1, 0, 23, 59, 59);

    const pl = generateProfitLossStatement(startDate, endDate);

    // Get monthly breakdown
    const monthlyData = [];
    months.forEach((monthIndex, i) => {
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        const monthPL = generateProfitLossStatement(monthStart, monthEnd);

        monthlyData.push({
            month: new Date(year, monthIndex, 1).toLocaleString('default', { month: 'long' }),
            monthIndex: monthIndex + 1,
            data: monthPL
        });
    });

    return {
        year: year,
        quarter: quarter,
        quarterName: `Q${quarter} ${year}`,
        summary: pl,
        monthlyBreakdown: monthlyData
    };
}

/**
 * Export quarterly report to CSV
 */
function exportQuarterlyReport(year, quarter) {
    const summary = getQuarterlySummary(year, quarter);
    const exportData = [];

    // Header
    exportData.push({
        'QUARTERLY REPORT': '',
        'Period': `Q${quarter} ${year}`,
        'From': utils.formatDate(summary.summary.period.start),
        'To': utils.formatDate(summary.summary.period.end)
    });
    exportData.push({});

    // Revenue
    exportData.push({ '=== REVENUE ===': '' });
    exportData.push({ 'Metric': 'Total Revenue', 'Amount': summary.summary.revenue.totalRevenue });
    exportData.push({ 'Metric': 'Repair Count', 'Amount': summary.summary.revenue.repairCount });
    exportData.push({ 'Metric': 'Average per Repair', 'Amount': summary.summary.revenue.averagePerRepair.toFixed(2) });
    exportData.push({});

    // COGS
    exportData.push({ '=== COST OF GOODS SOLD ===': '' });
    exportData.push({ 'Item': 'Parts Cost', 'Amount': summary.summary.cogs.partsCost });
    exportData.push({ 'Item': 'Commission', 'Amount': summary.summary.cogs.commission });
    exportData.push({ 'Item': 'Total COGS', 'Amount': summary.summary.cogs.total });
    exportData.push({ 'Item': '% of Revenue', 'Amount': `${summary.summary.cogs.percentOfRevenue.toFixed(2)}%` });
    exportData.push({});

    // Gross Profit
    exportData.push({ '=== GROSS PROFIT ===': '' });
    exportData.push({ 'Metric': 'Amount', 'Amount': summary.summary.grossProfit.amount });
    exportData.push({ 'Metric': 'Margin', 'Amount': `${summary.summary.grossProfit.margin.toFixed(2)}%` });
    exportData.push({});

    // Operating Expenses
    exportData.push({ '=== OPERATING EXPENSES ===': '' });
    Object.entries(summary.summary.operatingExpenses.byCategory).forEach(([cat, amt]) => {
        exportData.push({ 'Category': cat, 'Amount': amt });
    });
    exportData.push({ 'Category': 'Total Operating Expenses', 'Amount': summary.summary.operatingExpenses.total });
    exportData.push({});

    // Net Income
    exportData.push({ '=== NET INCOME ===': '' });
    exportData.push({ 'Metric': 'Operating Income', 'Amount': summary.summary.operatingIncome.amount });
    exportData.push({ 'Metric': 'Net Income', 'Amount': summary.summary.netIncome.amount });
    exportData.push({ 'Metric': 'Net Margin', 'Amount': `${summary.summary.netIncome.margin.toFixed(2)}%` });
    exportData.push({});

    // Monthly Breakdown
    exportData.push({ '=== MONTHLY BREAKDOWN ===': '' });
    exportData.push({ 'Month': '', 'Revenue': '', 'COGS': '', 'Overhead': '', 'Net Income': '', 'Margin %': '' });
    summary.monthlyBreakdown.forEach(m => {
        exportData.push({
            'Month': m.month,
            'Revenue': m.data.revenue.totalRevenue,
            'COGS': m.data.cogs.total,
            'Overhead': m.data.operatingExpenses.total,
            'Net Income': m.data.netIncome.amount,
            'Margin %': m.data.netIncome.margin.toFixed(2)
        });
    });

    const filename = `quarterly_report_Q${quarter}_${year}`;
    exportArrayToCSV(exportData, filename);
}

/**
 * Export annual P&L statement
 */
function exportAnnualPLStatement(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    const pl = generateProfitLossStatement(startDate, endDate);

    const exportData = [];

    // Header
    exportData.push({
        'PROFIT & LOSS STATEMENT': '',
        'Period': `January 1, ${year} - December 31, ${year}`
    });
    exportData.push({});

    // Revenue
    exportData.push({ 'REVENUE': '' });
    exportData.push({ '  Total Revenue': '', 'Amount': pl.revenue.totalRevenue });
    exportData.push({ '  Number of Repairs': '', 'Amount': pl.revenue.repairCount });
    exportData.push({});

    // COGS
    exportData.push({ 'COST OF GOODS SOLD': '' });
    exportData.push({ '  Parts Cost': '', 'Amount': pl.cogs.partsCost });
    exportData.push({ '  Technician Commission': '', 'Amount': pl.cogs.commission });
    exportData.push({ '  Total COGS': '', 'Amount': pl.cogs.total });
    exportData.push({});

    // Gross Profit
    exportData.push({ 'GROSS PROFIT': '', 'Amount': pl.grossProfit.amount });
    exportData.push({ '  Gross Margin': '', 'Amount': `${pl.grossProfit.margin.toFixed(2)}%` });
    exportData.push({});

    // Operating Expenses
    exportData.push({ 'OPERATING EXPENSES': '' });
    Object.entries(pl.operatingExpenses.byCategory).forEach(([cat, amt]) => {
        exportData.push({ [`  ${cat}`]: '', 'Amount': amt });
    });
    exportData.push({ '  Total Operating Expenses': '', 'Amount': pl.operatingExpenses.total });
    exportData.push({});

    // Operating Income
    exportData.push({ 'OPERATING INCOME': '', 'Amount': pl.operatingIncome.amount });
    exportData.push({ '  Operating Margin': '', 'Amount': `${pl.operatingIncome.margin.toFixed(2)}%` });
    exportData.push({});

    // Net Income
    exportData.push({ 'NET INCOME': '', 'Amount': pl.netIncome.amount });
    exportData.push({ '  Net Margin': '', 'Amount': `${pl.netIncome.margin.toFixed(2)}%` });
    exportData.push({ '  Net Income per Repair': '', 'Amount': pl.netIncome.perRepair.toFixed(2) });

    const filename = `profit_loss_statement_${year}`;
    exportArrayToCSV(exportData, filename);
}

// Export profit functions
window.calculateRepairProfit = calculateRepairProfit;
window.getProfitByRepairType = getProfitByRepairType;
window.getProfitByTechnician = getProfitByTechnician;
window.getProfitTrends = getProfitTrends;
window.getProfitDashboard = getProfitDashboard;
window.exportProfitReport = exportProfitReport;

// Export financial report functions
window.generateProfitLossStatement = generateProfitLossStatement;
window.getQuarterlySummary = getQuarterlySummary;
window.exportQuarterlyReport = exportQuarterlyReport;
window.exportAnnualPLStatement = exportAnnualPLStatement;

console.log('✅ analytics.js loaded');

