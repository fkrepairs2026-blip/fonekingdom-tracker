/**
 * Debug Logger for Fonekingdom Tracker
 * Captures all operations for troubleshooting
 */

// Global debug log storage
window.debugLogs = [];
// Disable debug logger by default for performance - only enable for specific developer
window.debugEnabled = false; // Set to true only when debugging
window.maxDebugLogs = 1000; // Keep last 1000 entries

const DebugLogger = {
    log(category, action, data = {}) {
        if (!window.debugEnabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            category,
            action,
            user: window.currentUserData?.displayName || 'Not logged in',
            userId: window.currentUser?.uid || null,
            role: window.currentUserData?.role || null,
            data: this.sanitizeData(data)
        };

        window.debugLogs.push(logEntry);

        // Keep only last N logs to prevent memory issues
        if (window.debugLogs.length > window.maxDebugLogs) {
            window.debugLogs.shift();
        }

        // Console output with emoji for easy scanning
        const emoji = this.getEmoji(category);
        console.group(`${emoji} [${category}] ${action}`);
        console.log('⏰', new Date().toLocaleTimeString());
        console.log('👤', logEntry.user, `(${logEntry.role})`);
        if (Object.keys(data).length > 0) {
            console.log('📊', data);
        }
        console.groupEnd();
    },

    // Deep clone and sanitize data (remove sensitive info, handle circular refs)
    sanitizeData(data) {
        try {
            const sanitized = JSON.parse(JSON.stringify(data));
            // Remove passwords if any
            if (sanitized.password) sanitized.password = '***';
            if (sanitized.newPassword) sanitized.newPassword = '***';
            return sanitized;
        } catch (e) {
            // Handle circular references
            return { error: 'Could not serialize data', message: String(data) };
        }
    },

    getEmoji(category) {
        const emojiMap = {
            'AUTH': '🔐',
            'REPAIR': '🔧',
            'PAYMENT': '💰',
            'STATUS': '📋',
            'RELEASE': '📦',
            'CLAIM': '✅',
            'INVENTORY': '📦',
            'REMITTANCE': '💸',
            'EXPENSE': '💳',
            'USER': '👤',
            'REFRESH': '🔄',
            'ERROR': '❌',
            'FIREBASE': '🔥',
            'MODAL': '🖼️',
            'FORM': '📝',
            'UI': '🎨',
            'AUTO': '🤖'
        };
        return emojiMap[category] || '📝';
    },

    // Export logs as formatted text
    exportLogs() {
        const header = `========================================
FONEKINGDOM DEBUG LOG EXPORT
Generated: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
Total Entries: ${window.debugLogs.length}
User: ${window.currentUserData?.displayName || 'Unknown'}
Role: ${window.currentUserData?.role || 'Unknown'}
========================================

`;

        const logText = window.debugLogs.map((log, index) => {
            return `[${index + 1}] ${log.timestamp}
Category: ${log.category} | Action: ${log.action}
User: ${log.user} (${log.role})
Data: ${JSON.stringify(log.data, null, 2)}
----------------------------------------`;
        }).join('\n\n');

        return header + logText;
    },

    // Export as JSON for programmatic analysis
    exportJSON() {
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            user: window.currentUserData?.displayName,
            role: window.currentUserData?.role,
            totalLogs: window.debugLogs.length,
            logs: window.debugLogs
        }, null, 2);
    },

    // Copy logs to clipboard
    copyToClipboard(format = 'text') {
        const logText = format === 'json' ? this.exportJSON() : this.exportLogs();
        navigator.clipboard.writeText(logText).then(() => {
            alert(`✅ Debug logs copied to clipboard!\n\n${window.debugLogs.length} entries exported as ${format.toUpperCase()}.`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showLogsModal(logText);
        });
    },

    // Show logs in a copyable textarea
    showLogsModal(logText = null) {
        const text = logText || this.exportLogs();

        const modal = document.createElement('div');
        modal.id = 'debugLogsModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 20px; max-width: 900px; width: 100%; max-height: 85vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2 style="margin: 0;">🐛 Debug Logs (${window.debugLogs.length}/${window.maxDebugLogs})</h2>
                    <div style="display: flex; gap: 10px;">
                        <label style="display: flex; align-items: center; gap: 5px; font-size: 14px;">
                            <input type="checkbox" id="debugEnabledToggle" ${window.debugEnabled ? 'checked' : ''} 
                                onchange="window.debugEnabled = this.checked; alert(this.checked ? '✅ Debug logging enabled' : '⏸️ Debug logging paused');">
                            Enabled
                        </label>
                        <button onclick="document.getElementById('debugFilterCategory').style.display = document.getElementById('debugFilterCategory').style.display === 'none' ? 'block' : 'none'" 
                            style="padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            🔍 Filter
                        </button>
                    </div>
                </div>
                
                <select id="debugFilterCategory" style="display: none; margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" 
                    onchange="DebugLogger.filterLogsInModal(this.value)">
                    <option value="">All Categories</option>
                    <option value="AUTH">🔐 Authentication</option>
                    <option value="REPAIR">🔧 Repairs</option>
                    <option value="PAYMENT">💰 Payments</option>
                    <option value="STATUS">📋 Status Changes</option>
                    <option value="RELEASE">📦 Release</option>
                    <option value="CLAIM">✅ Claim</option>
                    <option value="REMITTANCE">💸 Remittance</option>
                    <option value="FORM">📝 Form Inputs</option>
                    <option value="FIREBASE">🔥 Firebase</option>
                    <option value="REFRESH">🔄 Refresh</option>
                    <option value="ERROR">❌ Errors</option>
                    <option value="UI">🎨 UI Actions</option>
                </select>
                
                <textarea id="debugLogsTextarea" readonly style="flex: 1; font-family: monospace; font-size: 11px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; line-height: 1.5;">${text}</textarea>
                
                <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <button onclick="DebugLogger.copyToClipboard('text')" 
                        style="padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        📋 Copy Text
                    </button>
                    <button onclick="DebugLogger.copyToClipboard('json')" 
                        style="padding: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        📄 Copy JSON
                    </button>
                    <button onclick="DebugLogger.clear(); DebugLogger.showLogsModal()" 
                        style="padding: 10px; background: #9E9E9E; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        🧹 Clear
                    </button>
                    <button onclick="document.getElementById('debugLogsModal').remove()" 
                        style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        ✖️ Close
                    </button>
                </div>
                
                <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 12px; color: #1976d2;">
                    💡 <strong>Tip:</strong> Press <kbd>Ctrl+Shift+D</kbd> to open logs anytime. Use JSON format for detailed analysis.
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    filterLogsInModal(category) {
        const filteredLogs = category ?
            window.debugLogs.filter(log => log.category === category) :
            window.debugLogs;

        const logText = filteredLogs.map((log, index) => {
            return `[${index + 1}] ${log.timestamp}
Category: ${log.category} | Action: ${log.action}
User: ${log.user} (${log.role})
Data: ${JSON.stringify(log.data, null, 2)}
----------------------------------------`;
        }).join('\n\n');

        const textarea = document.getElementById('debugLogsTextarea');
        if (textarea) {
            textarea.value = `Filtered: ${category || 'All'} (${filteredLogs.length} entries)\n\n` + logText;
        }
    },

    // Clear logs
    clear() {
        const count = window.debugLogs.length;
        window.debugLogs = [];
        console.log('🧹 Debug logs cleared:', count, 'entries removed');
        alert(`🧹 Cleared ${count} debug log entries`);
    },

    // Get logs for specific category
    getCategory(category) {
        return window.debugLogs.filter(log => log.category === category);
    },

    // Get logs for specific repair
    getRepair(repairId) {
        return window.debugLogs.filter(log =>
            log.data.repairId === repairId ||
            log.data.id === repairId
        );
    },

    // Get recent errors
    getErrors() {
        return window.debugLogs.filter(log => log.category === 'ERROR');
    },

    // Get logs in time range
    getTimeRange(startTime, endTime) {
        return window.debugLogs.filter(log => {
            const logTime = new Date(log.timestamp);
            return logTime >= new Date(startTime) && logTime <= new Date(endTime);
        });
    },

    // Summary of log categories
    getSummary() {
        const summary = {};
        window.debugLogs.forEach(log => {
            summary[log.category] = (summary[log.category] || 0) + 1;
        });
        return summary;
    },

    // Automatic profit diagnostic
    runProfitDiagnostic() {
        console.log('\n🔍 ========================================');
        console.log('🔍 PROFIT CALCULATION DIAGNOSTIC');
        console.log('🔍 ========================================\n');

        const allRepairs = window.allRepairs || [];
        const currentUserId = window.currentUser?.uid;
        const techRepairs = allRepairs.filter(r =>
            r.acceptedBy === currentUserId && !r.deleted
        );

        console.log('📊 REPAIR OVERVIEW:');
        console.log(`   Total Repairs: ${allRepairs.filter(r => !r.deleted).length}`);
        console.log(`   Released: ${allRepairs.filter(r => r.status === 'Released' && !r.deleted).length}`);
        console.log(`   Claimed: ${allRepairs.filter(r => r.status === 'Claimed' && !r.deleted).length}`);
        console.log(`   For Release: ${allRepairs.filter(r => r.status === 'Ready for Pickup' && !r.deleted).length}\n`);

        // Analyze ALL repairs in detail (not just tech repairs)
        allRepairs.filter(r => !r.deleted).forEach((repair, index) => {
            console.log(`\n📱 DEVICE ${index + 1}: ${repair.customerName || 'Unknown'}`);
            console.log('   ID:', repair.id);
            console.log('   Status:', repair.status);
            console.log('   Total:', '₱' + (repair.total || 0).toLocaleString());
            console.log('   Parts Cost:', '₱' + (repair.partsCost || 0).toLocaleString());

            const payments = repair.payments || [];
            const verifiedPayments = payments.filter(p => p.verified);
            const totalPaid = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

            console.log('\n   💰 PAYMENTS:');
            console.log(`      Total Payments: ${payments.length}`);
            console.log(`      Verified: ${verifiedPayments.length} (₱${totalPaid.toLocaleString()})`);
            console.log(`      Balance: ₱${(repair.total - totalPaid).toLocaleString()}`);

            if (payments.length > 0) {
                console.log('\n      Payment Details:');
                payments.forEach((p, i) => {
                    console.log(`      ${i + 1}. ₱${p.amount} - ${p.method} - ${p.verified ? '✅ Verified' : '⏳ Pending'}`);
                    console.log(`         Date: ${p.paymentDate || p.recordedDate}`);
                    console.log(`         By: ${p.recordedBy || 'Unknown'}`);
                    if (p.collectedByTech) console.log(`         🔔 Needs Remittance`);
                });
            }
        });

        // Calculate net profit
        console.log('\n\n💵 NET PROFIT CALCULATION:');
        console.log('========================================');

        const allVerifiedPayments = allRepairs
            .filter(r => !r.deleted)
            .flatMap(r => (r.payments || []).filter(p => p.verified))
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const allPartsCosts = allRepairs
            .filter(r => !r.deleted)
            .reduce((sum, r) => sum + (r.partsCost || 0), 0);

        const allExpenses = (window.techExpenses || [])
            .filter(e => !e.deleted)
            .reduce((sum, e) => sum + (e.amount || 0), 0);

        console.log('Total Verified Payments:', '₱' + allVerifiedPayments.toLocaleString());
        console.log('Total Parts Costs:', '₱' + allPartsCosts.toLocaleString());
        console.log('Total Expenses:', '₱' + allExpenses.toLocaleString());
        console.log('\n📊 CALCULATED Net Profit:', '₱' + (allVerifiedPayments - allPartsCosts - allExpenses).toLocaleString());

        // Check what dashboard is showing
        console.log('\n\n📊 DASHBOARD COMPARISON:');
        console.log('========================================');
        console.log('Note: Check admin dashboard to compare with calculated value above');

        // Check for issues
        console.log('\n\n🔎 CHECKING FOR ISSUES:');
        console.log('========================================');

        let issuesFound = 0;

        // Check for missing parts costs
        const completedWithoutParts = allRepairs.filter(r =>
            (r.status === 'Claimed' || r.status === 'Released') && !r.partsCost && !r.deleted
        );
        if (completedWithoutParts.length > 0) {
            issuesFound++;
            console.log(`⚠️ ${completedWithoutParts.length} completed repairs without parts cost:`);
            completedWithoutParts.forEach(r => console.log(`   - ${r.customerName} (${r.id})`));
        }

        // Check for payments without verification
        const unverifiedPayments = allRepairs
            .filter(r => !r.deleted)
            .flatMap(r => (r.payments || []).filter(p => !p.verified));
        if (unverifiedPayments.length > 0) {
            console.log(`ℹ️ ${unverifiedPayments.length} unverified payments (normal if awaiting verification)`);
        }

        // Check for duplicate payments by analyzing same amount/date
        allRepairs.filter(r => !r.deleted).forEach(repair => {
            const payments = repair.payments || [];
            if (payments.length > 1) {
                const duplicateCheck = payments.reduce((acc, p, i) => {
                    const key = `${p.amount}_${p.method}_${p.paymentDate}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(i + 1);
                    return acc;
                }, {});

                Object.entries(duplicateCheck).forEach(([key, indices]) => {
                    if (indices.length > 1) {
                        issuesFound++;
                        console.log(`❌ Possible duplicate payments in ${repair.customerName}:`);
                        console.log(`   Payments #${indices.join(', ')} appear identical`);
                    }
                });
            }
        });

        if (issuesFound === 0) {
            console.log('✅ No obvious issues detected');
        }

        console.log('\n\n🔍 Diagnostic Complete!');
        console.log('========================================\n');

        return {
            totalRepairs: allRepairs.filter(r => !r.deleted).length,
            techRepairs: techRepairs.length,
            totalVerifiedPayments: allVerifiedPayments,
            totalPartsCosts: allPartsCosts,
            totalExpenses: allExpenses,
            calculatedNetProfit: allVerifiedPayments - allPartsCosts - allExpenses,
            issuesFound
        };
    }
};

// Export to window
window.DebugLogger = DebugLogger;

// Add keyboard shortcut: Ctrl+Shift+D to show logs
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        DebugLogger.showLogsModal();
    }
});

console.log('🐛 Debug Logger loaded! Press Ctrl+Shift+D to view logs');
console.log('📝 Commands: DebugLogger.copyToClipboard(), DebugLogger.clear(), DebugLogger.getSummary()');
console.log('🔍 New: DebugLogger.runProfitDiagnostic() - Auto profit analysis');
