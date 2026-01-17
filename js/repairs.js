// ===== REPAIRS MODULE =====

/**
 * Get local date string in YYYY-MM-DD format (no timezone conversion)
 * This prevents timezone bugs where dates shift due to UTC conversion
 */
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Initialize global repairs array
window.allRepairs = [];
let photoData = [];
// Global modification requests
window.allModificationRequests = [];
// Global activity logs
window.allActivityLogs = [];
// Global users list
window.allUsers = {};
// Global tech remittances
window.techRemittances = [];
// Global retroactive intakes
window.allRetroactiveIntakes = [];
// Global system settings
window.systemSettings = { retroactiveIntakeThreshold: 5 };

/**
 * Handle photo upload and preview for device intake
 */
async function handlePhotoUpload(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    
    try {
        // Show loading
        utils.showLoading(true);
        
        // Compress image
        const compressed = await utils.compressImage(file, 800);
        
        // Add to photo data array
        photoData.push(compressed);
        
        // Show preview
        const previewDiv = document.getElementById(previewId);
        if (previewDiv) {
            previewDiv.style.display = 'block';
            previewDiv.innerHTML = `
                <img src="${compressed}" style="max-width:200px;border-radius:8px;border:2px solid #4caf50;">
                <p style="color:#4caf50;margin:5px 0 0 0;font-size:13px;">✅ Photo added successfully</p>
            `;
        }
        
        utils.showLoading(false);
        
        if (utils.showToast) {
            utils.showToast('✅ Photo added', 'success', 2000);
        }
        
        console.log(`📸 Photo added. Total photos: ${photoData.length}`);
        
    } catch (error) {
        utils.showLoading(false);
        alert('Error uploading photo: ' + error.message);
        console.error('Photo upload error:', error);
    }
}

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
                const repairData = child.val();

                // Ensure payments is always an array (Firebase may return object)
                if (repairData.payments && typeof repairData.payments === 'object' && !Array.isArray(repairData.payments)) {
                    repairData.payments = Object.values(repairData.payments);
                } else if (!repairData.payments) {
                    repairData.payments = [];
                }

                window.allRepairs.push({
                    id: child.key,
                    ...repairData
                });
            });

            const newCount = window.allRepairs.length;
            console.log('✅ Repairs loaded from Firebase:', newCount, previousCount !== newCount ? '(changed)' : '');

            if (window.DebugLogger) {
                DebugLogger.log('FIREBASE', 'Repairs Data Updated', {
                    previousCount,
                    newCount,
                    changed: previousCount !== newCount,
                    repairIds: window.allRepairs.map(r => r.id).slice(0, 10) // First 10 IDs
                });
            }

            // Always refresh current tab when data changes
            if (window.currentTabRefresh) {
                console.log('🔄 Auto-refreshing current tab...');
                if (window.DebugLogger) {
                    DebugLogger.log('REFRESH', 'Triggering Tab Auto-Refresh', {
                        tabFunction: window.currentTabRefresh.name || 'anonymous',
                        repairCount: newCount
                    });
                }
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
 * Load retroactive intakes from Firebase
 */
async function loadRetroactiveIntakes() {
    return new Promise((resolve, reject) => {
        console.log('📦 Loading retroactive intakes...');

        const timeout = setTimeout(() => {
            console.warn('⚠️ Retroactive intakes load timeout');
            resolve([]); // Resolve with empty array instead of rejecting
        }, 5000); // 5 second timeout

        try {
            db.ref('retroactiveIntakes').orderByChild('performedAt').on('value', (snapshot) => {
                clearTimeout(timeout);
                window.allRetroactiveIntakes = [];

                if (snapshot.exists()) {
                    snapshot.forEach((child) => {
                        window.allRetroactiveIntakes.push({
                            id: child.key,
                            ...child.val()
                        });
                    });

                    // Sort by performedAt descending (most recent first)
                    window.allRetroactiveIntakes.sort((a, b) => {
                        return new Date(b.performedAt) - new Date(a.performedAt);
                    });
                }

                console.log('✅ Retroactive intakes loaded:', window.allRetroactiveIntakes.length);

                // Refresh retroactive intakes tab if currently viewing
                if (window.currentTabRefresh && window.activeTab === 'retroactive-intakes') {
                    setTimeout(() => {
                        window.currentTabRefresh();
                    }, 400);
                }

                resolve(window.allRetroactiveIntakes);
            }, (error) => {
                clearTimeout(timeout);
                console.warn('⚠️ Error loading retroactive intakes:', error);
                window.allRetroactiveIntakes = [];
                resolve([]); // Resolve with empty array instead of rejecting
            });
        } catch (error) {
            clearTimeout(timeout);
            console.warn('⚠️ Error setting up retroactive intakes listener:', error);
            window.allRetroactiveIntakes = [];
            resolve([]); // Resolve with empty array instead of rejecting
        }
    });
}

window.loadRetroactiveIntakes = loadRetroactiveIntakes;

/**
 * Load system settings from Firebase
 */
async function loadSystemSettings() {
    return new Promise((resolve, reject) => {
        console.log('📦 Loading system settings...');

        const timeout = setTimeout(() => {
            console.warn('⚠️ System settings load timeout, using defaults');
            window.systemSettings = { retroactiveIntakeThreshold: 5 };
            resolve(window.systemSettings);
        }, 5000); // 5 second timeout

        try {
            db.ref('systemSettings').on('value', (snapshot) => {
                clearTimeout(timeout);
                window.systemSettings = snapshot.val() || {
                    retroactiveIntakeThreshold: 5
                };

                console.log('✅ System settings loaded:', window.systemSettings);

                resolve(window.systemSettings);
            }, (error) => {
                clearTimeout(timeout);
                console.warn('⚠️ Error loading system settings:', error);
                window.systemSettings = { retroactiveIntakeThreshold: 5 };
                resolve(window.systemSettings);
            });
        } catch (error) {
            clearTimeout(timeout);
            console.warn('⚠️ Error setting up system settings listener:', error);
            window.systemSettings = { retroactiveIntakeThreshold: 5 };
            resolve(window.systemSettings);
        }
    });
}

window.loadSystemSettings = loadSystemSettings;

/**
 * Load parts orders from Firebase
 */
async function loadPartsOrders() {
    return new Promise((resolve) => {
        console.log('📦 Loading parts orders...');

        db.ref('partsOrders').on('value', (snapshot) => {
            window.allPartsOrders = [];

            snapshot.forEach((child) => {
                const order = child.val();
                if (!order.deleted) {
                    window.allPartsOrders.push({
                        id: child.key,
                        ...order
                    });
                }
            });

            console.log('✅ Parts orders loaded:', window.allPartsOrders.length);

            // Refresh current tab if it's parts orders tab
            if (window.currentTabRefresh) {
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }

            resolve(window.allPartsOrders);
        });
    });
}

window.loadPartsOrders = loadPartsOrders;

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
 * Load tech remittances from Firebase with real-time updates
 */
async function loadTechRemittances() {
    return new Promise((resolve) => {
        console.log('📦 Loading tech remittances...');

        // Use limitToLast to improve performance - last 100 remittances
        db.ref('techRemittances').orderByChild('submittedAt').limitToLast(100).on('value', (snapshot) => {
            window.techRemittances = [];

            snapshot.forEach((child) => {
                window.techRemittances.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Sort by submission date (newest first)
            window.techRemittances.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            console.log('✅ Tech remittances loaded:', window.techRemittances.length);

            // Update remittance badges
            if (window.currentUserData && window.currentUserData.role === 'technician') {
                if (window.updateRemittanceBadge) {
                    window.updateRemittanceBadge();
                }
            }

            // Auto-refresh current tab if it's remittance-related
            if (window.currentTabRefresh) {
                setTimeout(() => {
                    window.currentTabRefresh();
                }, 400);
            }

            resolve(window.techRemittances);
        });
    });
}

window.loadTechRemittances = loadTechRemittances;

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
            window.allUsers = {};

            snapshot.forEach((child) => {
                const userData = child.val();
                window.allUsers[child.key] = {
                    id: child.key,
                    uid: child.key, // Add uid field for consistency
                    ...userData
                };
            });

            console.log('✅ Users loaded:', Object.keys(window.allUsers).length);

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
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
function calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // Normalize strings: lowercase and trim
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;

    // Levenshtein distance algorithm
    const matrix = [];
    const len1 = s1.length;
    const len2 = s2.length;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Calculate distances
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.round(similarity);
}

/**
 * Check for duplicate retroactive intakes
 * @param {string} customerName - Customer name to check
 * @param {string} brand - Device brand
 * @param {string} model - Device model
 * @returns {object} - {isBlocked, matchingRepairs, reason}
 */
function checkDuplicateRetroactiveIntake(customerName, brand, model) {
    if (!customerName || !brand || !model) {
        return { isBlocked: false, matchingRepairs: [], reason: '' };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const matchingRepairs = [];

    // Check all repairs from last 7 days
    (window.allRepairs || []).forEach(repair => {
        if (!repair.createdAt) return;

        const repairDate = new Date(repair.createdAt);
        if (repairDate < sevenDaysAgo) return;

        // Check if brand and model match exactly
        const brandMatch = repair.deviceBrand?.toLowerCase() === brand.toLowerCase();
        const modelMatch = repair.deviceModel?.toLowerCase() === model.toLowerCase();

        if (!brandMatch || !modelMatch) return;

        // Calculate name similarity
        const nameSimilarity = calculateStringSimilarity(customerName, repair.customerName);

        // Check if it's an exact name match or high similarity
        if (nameSimilarity >= 70) {
            const daysAgo = Math.floor((new Date() - repairDate) / (1000 * 60 * 60 * 24));
            const hoursAgo = Math.floor((new Date() - repairDate) / (1000 * 60 * 60));

            matchingRepairs.push({
                id: repair.id,
                customerName: repair.customerName,
                brand: repair.deviceBrand,
                model: repair.deviceModel,
                date: repair.createdAt,
                daysAgo: daysAgo,
                hoursAgo: hoursAgo,
                confidence: nameSimilarity,
                status: repair.status
            });
        }
    });

    // Determine if should block
    let isBlocked = false;
    let reason = '';

    if (matchingRepairs.length > 0) {
        // Block if any match has >90% similarity OR within 24 hours
        const highConfidenceMatch = matchingRepairs.find(m => m.confidence >= 90);
        const recentMatch = matchingRepairs.find(m => m.hoursAgo <= 24);

        if (highConfidenceMatch || recentMatch) {
            isBlocked = true;
            if (highConfidenceMatch && recentMatch) {
                reason = `High confidence match (${highConfidenceMatch.confidence}%) within 24 hours`;
            } else if (highConfidenceMatch) {
                reason = `High confidence match (${highConfidenceMatch.confidence}%)`;
            } else {
                reason = `Recent repair within 24 hours (${recentMatch.hoursAgo} hours ago)`;
            }
        }
    }

    return {
        isBlocked,
        matchingRepairs,
        reason,
        requiresAdminOverride: isBlocked
    };
}

/**
 * Validate backdate timestamps
 * @param {string} completionDate - Completion date ISO string
 * @param {string} releaseDate - Release/claim date ISO string
 * @param {boolean} isAdminOverride - Admin override flag
 * @returns {object} - {valid, error}
 */
function validateBackdateTimestamp(completionDate, releaseDate, isAdminOverride) {
    if (!completionDate || !releaseDate) {
        return { valid: false, error: 'Both completion and release/claim dates are required' };
    }

    const completion = new Date(completionDate);
    const release = new Date(releaseDate);
    const now = new Date();
    const minDate = new Date('2025-01-01');

    // Check completion not future
    if (completion > now) {
        return { valid: false, error: 'Completion date cannot be in the future' };
    }

    // Check release not future
    if (release > now) {
        return { valid: false, error: 'Release/claim date cannot be in the future' };
    }

    // Check release >= completion
    if (release < completion) {
        return { valid: false, error: 'Release/claim date must be after or equal to completion date' };
    }

    // Check dates >= 2025 unless admin override
    if (!isAdminOverride) {
        if (completion < minDate) {
            return { valid: false, error: 'Completion date must be after January 1, 2025 (admin override required)' };
        }
        if (release < minDate) {
            return { valid: false, error: 'Release/claim date must be after January 1, 2025 (admin override required)' };
        }
    }

    return { valid: true, error: '' };
}

/**
 * Check for excessive retroactive intakes by technician today
 * @param {string} techUid - Technician UID
 * @returns {object} - {isExcessive, count, threshold}
 */
function checkExcessiveRetroactiveIntakes(techUid) {
    const threshold = window.systemSettings?.retroactiveIntakeThreshold || 5;

    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Count retroactive intakes by this tech today
    const count = (window.allRetroactiveIntakes || []).filter(intake => {
        if (!intake.performedBy || !intake.performedAt) return false;

        const intakeDate = intake.performedAt.split('T')[0];
        return intake.performedBy === techUid && intakeDate === today;
    }).length;

    return {
        isExcessive: count >= threshold,
        count: count,
        threshold: threshold
    };
}

/**
 * Submit receive device with BACK JOB support
 */
async function submitReceiveDevice(e) {
    e.preventDefault();

    // Prevent double submission
    if (window.isSubmittingDevice) {
        console.warn('⚠️ Submission already in progress, ignoring duplicate');
        return;
    }
    window.isSubmittingDevice = true;

    try {
        const form = e.target;
        const data = new FormData(form);

        console.log('📥 Receiving device...');

        // Check if it's a back job (element removed, always false for normal receive)
        const isBackJobCheckbox = document.getElementById('isBackJob');
        const isBackJob = isBackJobCheckbox ? isBackJobCheckbox.checked : false;

        // DEBUG: Capture form inputs
        const formInputs = {
            customerType: data.get('customerType'),
            customerName: data.get('customerName'),
            shopName: data.get('shopName') || '',
            contactNumber: data.get('contactNumber'),
            brand: data.get('brand'),
            model: data.get('model'),
            imei: data.get('imei') || '',
            deviceColor: data.get('deviceColor') || 'N/A',
            storageCapacity: data.get('storageCapacity') || 'N/A',
            problemType: data.get('problemType') || 'Pending Diagnosis',
            problem: data.get('problem'),
            estimatedCost: data.get('estimatedCost'),
            isBackJob: isBackJob,
            preApprovedRepairType: document.getElementById('preApprovedRepairType')?.value,
            preApprovedPartsCost: document.getElementById('preApprovedPartsCost')?.value,
            preApprovedLaborCost: document.getElementById('preApprovedLaborCost')?.value,
            assignOption: data.get('assignOption'),
            photoCount: photoData.length
        };

        if (window.DebugLogger) {
            DebugLogger.log('FORM', 'Receive Device Form Submitted', formInputs);
        }

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
            initialAssessment: data.get('initialAssessment')?.trim() || null,
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

        // ==================== RETROACTIVE COMPLETION MODE ====================
        // Check if retroactive completion mode is selected
        const completionMode = data.get('completionMode') || 'normal';

        if (completionMode !== 'normal') {
            // Retroactive mode - device already completed
            console.log('🔄 Retroactive completion mode:', completionMode);

            // VALIDATION: Require pricing
            if (!hasPricing) {
                alert('⚠️ Pricing is required for retroactive completion mode!\n\nPlease enter:\n• Repair Type\n• Parts Cost\n• Labor Cost');
                return;
            }

            // VALIDATION: Check for duplicates
            const duplicateCheck = checkDuplicateRetroactiveIntake(
                data.get('customerName'),
                data.get('brand'),
                data.get('model')
            );

            if (duplicateCheck.isBlocked) {
                // Blocked duplicate detected
                if (window.currentUserData.role !== 'admin') {
                    // Non-admin: Cannot proceed
                    let duplicateMsg = '❌ DUPLICATE DETECTION - Cannot proceed!\n\n';
                    duplicateMsg += `Reason: ${duplicateCheck.reason}\n\n`;
                    duplicateMsg += 'Similar repairs found:\n';
                    duplicateCheck.matchingRepairs.forEach((match, idx) => {
                        duplicateMsg += `\n${idx + 1}. ID: ${match.id.substring(0, 8)}\n`;
                        duplicateMsg += `   Customer: ${match.customerName}\n`;
                        duplicateMsg += `   Device: ${match.brand} ${match.model}\n`;
                        duplicateMsg += `   Date: ${match.daysAgo} days ago\n`;
                        duplicateMsg += `   Confidence: ${match.confidence}%\n`;
                        duplicateMsg += `   Status: ${match.status}\n`;
                    });
                    duplicateMsg += '\nOnly admins can override this block.';
                    alert(duplicateMsg);
                    return;
                } else {
                    // Admin: Show warning and require override reason
                    const overrideReason = prompt(
                        `⚠️ ADMIN DUPLICATE OVERRIDE REQUIRED\n\n` +
                        `Reason: ${duplicateCheck.reason}\n\n` +
                        `${duplicateCheck.matchingRepairs.length} similar repair(s) found in last 7 days:\n` +
                        duplicateCheck.matchingRepairs.map((m, i) =>
                            `${i + 1}. ${m.customerName} - ${m.brand} ${m.model} (${m.daysAgo}d ago, ${m.confidence}% match)`
                        ).join('\n') +
                        `\n\nEnter override reason (minimum 20 characters):`
                    );

                    if (!overrideReason || overrideReason.trim().length < 20) {
                        alert('❌ Override cancelled or reason too short (minimum 20 characters required)');
                        return;
                    }

                    repair.duplicateOverrideReason = overrideReason.trim();
                    repair.duplicateOverridden = true;
                }
            }

            // Get unified completion fields
            const completionDate = document.getElementById('completionDate')?.value;
            const releaseDate = document.getElementById('releaseDate')?.value;
            const adminOverride = document.getElementById('adminDateOverride')?.checked || false;

            // VALIDATION: Validate dates
            const dateValidation = validateBackdateTimestamp(completionDate, releaseDate, adminOverride);
            if (!dateValidation.valid) {
                alert(`⚠️ Date Validation Error:\n\n${dateValidation.error}`);
                return;
            }

            // Check for excessive usage
            const excessiveCheck = checkExcessiveRetroactiveIntakes(window.currentUser.uid);
            if (excessiveCheck.isExcessive) {
                const continueExcessive = confirm(
                    `⚠️ EXCESSIVE USAGE WARNING\n\n` +
                    `You've created ${excessiveCheck.count}/${excessiveCheck.threshold} retroactive intakes today.\n\n` +
                    `Admin will be notified of this activity.\n\n` +
                    `Continue anyway?`
                );

                if (!continueExcessive) {
                    return;
                }
            }

            // Get additional fields
            const verificationMethod = document.getElementById('verificationMethod')?.value || null;
            const releaseNotes = document.getElementById('releaseNotes')?.value || '';
            const warrantyDays = parseInt(document.getElementById('warrantyDays')?.value || 7);

            // Handle service slip photo if provided
            let serviceSlipPhoto = null;
            const slipPhotoInput = document.getElementById('serviceSlipPhoto');
            if (slipPhotoInput && slipPhotoInput.files && slipPhotoInput.files[0]) {
                serviceSlipPhoto = await utils.compressImage(slipPhotoInput.files[0]);
            }

            // Handle payment collection
            const collectPayment = document.getElementById('collectPayment')?.checked;
            let paymentData = null;

            if (collectPayment) {
                const paymentAmount = parseFloat(document.getElementById('paymentAmount')?.value || 0);
                const paymentMethod = document.getElementById('paymentMethod')?.value;
                const paymentNotes = document.getElementById('paymentNotes')?.value || '';

                if (!paymentMethod) {
                    alert('⚠️ Please select a payment method!');
                    return;
                }

                if (paymentAmount <= 0) {
                    alert('⚠️ Payment amount must be greater than 0!');
                    return;
                }

                // GCash validation
                if (paymentMethod === 'GCash') {
                    const gcashRef = document.getElementById('gcashRef')?.value;
                    if (!gcashRef || gcashRef.trim().length === 0) {
                        alert('⚠️ GCash reference number is required!');
                        return;
                    }
                }

                // Determine if user can auto-verify payments
                const isTechnician = window.currentUserData.role === 'technician';
                const isAdminOrManager = window.currentUserData.role === 'admin' || window.currentUserData.role === 'manager';
                const isGCash = paymentMethod === 'GCash';

                paymentData = {
                    amount: paymentAmount,
                    method: paymentMethod,
                    gcashReference: paymentMethod === 'GCash' ? document.getElementById('gcashRef')?.value : null,
                    notes: paymentNotes,
                    paymentDate: new Date(releaseDate || completionDate).toISOString(),
                    recordedDate: new Date().toISOString(),
                    collectedDuringIntake: true,
                    collectedAt: new Date().toISOString(),
                    receivedBy: window.currentUserData.displayName,
                    receivedById: window.currentUser.uid,
                    // Remittance tracking for technician payments
                    collectedByTech: !isGCash && isTechnician,
                    techRemittanceId: null,
                    remittanceStatus: (!isGCash && isTechnician) ? 'pending' : 'n/a',
                    // Auto-verify for tech/admin/manager (cashiers need verification)
                    verified: isTechnician || isAdminOrManager,
                    verifiedBy: (isTechnician || isAdminOrManager) ? window.currentUserData.displayName : null,
                    verifiedAt: (isTechnician || isAdminOrManager) ? new Date().toISOString() : null
                };
            }

            // SIMPLIFIED STATUS LOGIC - Always use Released
            // Cashier/Admin will manually finalize through normal workflow
            // This prevents the bug where Claimed devices become uneditable
            let finalStatus = 'Released';
            let shouldFinalize = false;

            // Note: Even if fully paid, device stays as "Released" to maintain workflow consistency

            // CONFIRMATION MODAL
            const confirmDetails = `
⚠️ **RETROACTIVE INTAKE - BYPASS NORMAL WORKFLOW**

Mode: ${completionMode === 'pre-completed' ? 'Pre-completed (Waiting to be Claimed)' : 'Completed (Released & Paid)'}
Final Status: ${finalStatus}${shouldFinalize ? ' (Auto-finalized)' : ''}
Completion Date: ${utils.formatDateTime(completionDate)}
Release Date: ${utils.formatDateTime(releaseDate)}
Assigned Tech: ${window.currentUserData.displayName}
${verificationMethod ? `Verification: ${verificationMethod}` : ''}
${shouldFinalize ? `Warranty: ${warrantyDays} days (until ${new Date(new Date(releaseDate).getTime() + warrantyDays * 24 * 60 * 60 * 1000).toLocaleDateString()})` : ''}
Payment: ${paymentData ? `₱${paymentData.amount.toFixed(2)} via ${paymentData.method}${shouldFinalize ? ' (Fully Paid ✓)' : ' (Partial/Unpaid)'}` : 'Not collected'}
${duplicateCheck.matchingRepairs.length > 0 ? `\n⚠️ Duplicate Override: ${repair.duplicateOverrideReason || 'N/A'}` : ''}
${excessiveCheck.isExcessive ? `\n⚠️ Daily Count: ${excessiveCheck.count}/${excessiveCheck.threshold} (Admin notified)` : ''}

${shouldFinalize ? '✓ Device will be auto-finalized to Claimed status (fully paid)' : finalStatus === 'Released' ? '⚠ Device will remain in Released status (unpaid/partial - for dealer finalization)' : ''}

This device will be marked as already repaired.
        `.trim();

            const userConfirmed = confirm(
                confirmDetails + '\n\n☑️ I confirm this device was already repaired before this intake.\n\nContinue?'
            );

            if (!userConfirmed) {
                console.log('❌ User cancelled retroactive intake');
                return;
            }

            // BUILD RETROACTIVE REPAIR OBJECT
            const completionDateISO = new Date(completionDate).toISOString();
            const releaseDateISO = new Date(releaseDate).toISOString();
            const warrantyEndDate = new Date(new Date(releaseDateISO).getTime() + warrantyDays * 24 * 60 * 60 * 1000);

            // Set base repair data with pricing
            repair.repairType = repairType;
            repair.partsCost = partsCost;
            repair.laborCost = laborCost;
            repair.total = total;

            // Mark as retroactive intake
            repair.retroactiveIntake = true;
            repair.retroactiveReason = 'Device received after completion';
            repair.adminDateOverride = adminOverride;
            repair.duplicateDetected = duplicateCheck.matchingRepairs.length > 0;

            // Set status based on auto-finalization logic
            repair.status = finalStatus;

            // Set completion fields
            repair.completedAt = completionDateISO;
            repair.completedBy = window.currentUserData.displayName;
            repair.completedById = window.currentUser.uid;

            // Set diagnosis as created and customer approved
            repair.diagnosisCreated = true;
            repair.diagnosisCreatedAt = completionDateISO;
            repair.diagnosisCreatedBy = window.currentUser.uid;
            repair.diagnosisCreatedByName = window.currentUserData.displayName;
            repair.customerApproved = true;
            repair.customerApprovedAt = completionDateISO;
            repair.customerApprovedBy = window.currentUser.uid;

            // Auto-assign to current technician
            repair.acceptedBy = window.currentUser.uid;
            repair.acceptedByName = window.currentUserData.displayName;
            repair.acceptedAt = completionDateISO;
            repair.assignmentMethod = 'retroactive-auto-assign';

            // Always set released fields
            repair.releasedAt = releaseDateISO;
            repair.releaseDate = releaseDateISO;
            repair.releasedBy = window.currentUserData.displayName;
            repair.releasedById = window.currentUser.uid;
            repair.releasedByRole = window.currentUserData.role;
            repair.repairedBy = window.currentUserData.displayName;
            repair.repairedById = window.currentUser.uid;
            repair.verificationMethod = verificationMethod;
            repair.serviceSlipPhoto = serviceSlipPhoto;
            repair.verifiedWithSlip = verificationMethod === 'with-slip';
            repair.releaseNotes = releaseNotes;

            // If auto-finalized to Claimed, set finalization fields
            if (shouldFinalize) {
                repair.claimedAt = releaseDateISO;
                repair.finalizedAt = releaseDateISO;
                repair.finalizedBy = window.currentUserData.displayName;
                repair.finalizedById = window.currentUser.uid;
                repair.autoFinalized = true;
                repair.autoFinalizedReason = 'Fully paid during retroactive intake';
                repair.warrantyDays = warrantyDays;
                repair.warrantyEndDate = warrantyEndDate.toISOString();
            }

            // Add payment if collected
            if (paymentData) {
                repair.payments = [paymentData];
                repair.amountPaid = paymentData.amount;
            }

            // Save to Firebase
            try {
                const newRef = await db.ref('repairs').push(repair);
                const repairId = newRef.key;

                console.log('✅ Retroactive intake saved:', repairId);

                // Save to retroactiveIntakes audit collection
                const today = new Date();
                const auditEntry = {
                    repairId: repairId,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUserData.displayName,
                    performedByRole: window.currentUserData.role,
                    performedAt: new Date().toISOString(),
                    performedDate: today.toISOString().split('T')[0],
                    performedWeek: `${today.getFullYear()}-W${String(Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}`,
                    performedMonth: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
                    originalCompletionDate: completionDateISO,
                    backdatedReleaseDate: releaseDateISO,
                    completionMode: completionMode,
                    finalStatus: finalStatus,
                    autoFinalized: shouldFinalize,
                    customerName: repair.customerName,
                    deviceBrand: repair.brand,
                    deviceModel: repair.model,
                    verificationMethod: verificationMethod || 'N/A',
                    paymentCollected: paymentData ? paymentData.amount : null,
                    paymentMethod: paymentData ? paymentData.method : null,
                    warrantyDays: warrantyDays,
                    retroactiveReason: 'Device received after completion',
                    adminDateOverride: adminOverride,
                    duplicateDetected: duplicateCheck.matchingRepairs.length > 0,
                    duplicateOverridden: repair.duplicateOverridden || false,
                    duplicateOverrideReason: repair.duplicateOverrideReason || null,
                    duplicateMatchingRepairs: duplicateCheck.matchingRepairs.map(m => ({
                        id: m.id,
                        customerName: m.customerName,
                        confidence: m.confidence,
                        daysAgo: m.daysAgo
                    })),
                    techDailyCount: excessiveCheck.count + 1,
                    excessiveUsageFlag: excessiveCheck.isExcessive
                };

                await db.ref('retroactiveIntakes').push(auditEntry);
                console.log('✅ Audit entry saved to retroactiveIntakes collection');

                // Send notification if excessive usage
                if (excessiveCheck.isExcessive) {
                    await db.ref('adminNotifications').push({
                        type: 'excessive_retroactive_intakes',
                        techUid: window.currentUser.uid,
                        techName: window.currentUserData.displayName,
                        count: excessiveCheck.count + 1,
                        threshold: excessiveCheck.threshold,
                        date: today.toISOString().split('T')[0],
                        repairIds: [repairId],
                        message: `${window.currentUserData.displayName} created ${excessiveCheck.count + 1} retroactive intakes today`,
                        createdAt: new Date().toISOString(),
                        read: false,
                        priority: 'medium'
                    });
                    console.log('⚠️ Excessive usage notification sent to admins');
                }

                // Log activity with special retroactive intake marker
                await logActivity('retroactive_intake', {
                    repairId: repairId,
                    originalCompletionDate: completionDateISO,
                    backdatedTo: releaseDateISO,
                    finalStatus: repair.status,
                    assignedTo: window.currentUserData.displayName,
                    paymentCollected: paymentData ? paymentData.amount : 0,
                    verificationMethod: verificationMethod || 'warranty-finalized',
                    duplicateCheckPassed: !duplicateCheck.isBlocked || repair.duplicateOverridden,
                    duplicateOverridden: repair.duplicateOverridden || false,
                    excessiveUsageFlag: excessiveCheck.isExcessive,
                    techDailyCount: excessiveCheck.count + 1,
                    threshold: excessiveCheck.threshold
                }, `🔄 Retroactive intake - Device completed on ${utils.formatDate(completionDateISO)}, received on ${utils.formatDate(new Date().toISOString())}`);


                // Success message
                alert(
                    `✅ Retroactive Intake Complete!\n\n` +
                    `📱 Device: ${repair.brand} ${repair.model}\n` +
                    `👤 Customer: ${repair.customerName}\n` +
                    `📍 Status: ${repair.status}${shouldFinalize ? ' (Auto-finalized ✓)' : ''}\n` +
                    `🔄 Mode: ${completionMode === 'pre-completed' ? 'Pre-completed (Waiting)' : 'Completed (Released & Paid)'}\n` +
                    `✅ Completed: ${utils.formatDateTime(completionDateISO)}\n` +
                    `📦 Released: ${utils.formatDateTime(releaseDateISO)}\n` +
                    `${paymentData ? `💰 Payment: ₱${paymentData.amount.toFixed(2)} collected\n` : ''}` +
                    `${shouldFinalize ? `🛡️ Warranty: ${warrantyDays} days (until ${new Date(new Date(releaseDateISO).getTime() + warrantyDays * 24 * 60 * 60 * 1000).toLocaleDateString()})\n` : ''}` +
                    `\nRepair ID: ${repairId.substring(0, 8)}`
                );

                // Reset form and refresh
                form.reset();
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }

                return; // Exit early - skip normal workflow

            } catch (error) {
                console.error('❌ Error saving retroactive intake:', error);
                alert('Error saving retroactive intake: ' + error.message);
                return;
            }
        }
        // ==================== END RETROACTIVE COMPLETION MODE ====================

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

            console.log('✅ Device marked as pre-approved with pricing:', { repairType, partsCost, laborCost, total, quotedSupplier });
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

                const targetTech = window.allUsers[targetTechId];
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

        // Add back job information if checked (legacy code - back jobs now use dedicated tab)
        if (isBackJob) {
            const backJobTechElement = document.getElementById('backJobTech');
            const backJobReasonElement = document.getElementById('backJobReason');

            const backJobTech = backJobTechElement ? backJobTechElement.value : null;
            const backJobReason = backJobReasonElement ? backJobReasonElement.value.trim() : '';

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
            if (window.DebugLogger) {
                DebugLogger.log('REPAIR', 'Saving Device to Firebase', {
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status,
                    repairType: repair.repairType,
                    total: repair.total,
                    assignmentMethod: repair.assignmentMethod,
                    acceptedBy: repair.acceptedByName,
                    isBackJob: repair.isBackJob || false,
                    hasPricing: repair.total > 0
                });
            }

            const newRef = await db.ref('repairs').push(repair);
            const repairId = newRef.key;

            console.log('✅ Device received successfully!');

            if (window.DebugLogger) {
                DebugLogger.log('REPAIR', 'Device Received Successfully', {
                    repairId: repairId,
                    customer: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status,
                    finalTotal: repair.total
                });
            }

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

        } catch (innerError) {
            console.error('❌ Error saving device:', innerError);
            alert('Error saving device: ' + innerError.message);
        }

    } catch (error) {
        console.error('❌ Error receiving device:', error);
        alert('Error: ' + error.message);
    } finally {
        // Always reset the submission flag
        window.isSubmittingDevice = false;
    }
}

/**
 * Accept repair (NEW WORKFLOW - Tech/Owner claims job)
 */
async function acceptRepair(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        if (window.DebugLogger) {
            DebugLogger.log('ERROR', 'Accept Repair - Repair Not Found', { repairId });
        }
        return;
    }

    if (repair.acceptedBy) {
        alert(`This repair has already been accepted by ${repair.acceptedByName}`);
        if (window.DebugLogger) {
            DebugLogger.log('ERROR', 'Accept Repair - Already Accepted', {
                repairId,
                acceptedBy: repair.acceptedByName
            });
        }
        return;
    }

    if (window.DebugLogger) {
        DebugLogger.log('REPAIR', 'Accept Repair Initiated', {
            repairId,
            customer: repair.customerName,
            device: `${repair.brand} ${repair.model}`,
            status: repair.status,
            repairType: repair.repairType,
            total: repair.total,
            hasDiagnosis: repair.diagnosisCreated,
            hasApproval: repair.customerApproved
        });
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
        if (window.DebugLogger) {
            DebugLogger.log('REPAIR', 'Accepting Repair - Updating Firebase', {
                repairId,
                newStatus: 'In Progress',
                acceptedBy: window.currentUserData.displayName
            });
        }

        await db.ref('repairs/' + repairId).update({
            acceptedBy: window.currentUser.uid,
            acceptedByName: window.currentUserData.displayName,
            acceptedAt: new Date().toISOString(),
            status: 'In Progress',
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        if (window.DebugLogger) {
            DebugLogger.log('REPAIR', 'Repair Accepted Successfully', {
                repairId,
                customer: repair.customerName,
                device: `${repair.brand} ${repair.model}`,
                status: 'In Progress'
            });
        }

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
        if (window.DebugLogger) {
            DebugLogger.log('ERROR', 'Accept Repair Failed', {
                repairId,
                error: error.message,
                stack: error.stack
            });
        }
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
    const availableTechs = Object.values(window.allUsers).filter(u =>
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
                <select id="transferToTech" required style="padding:10px;font-size:14px;">
                    <option value="">Select technician...</option>
                    ${availableTechs.map(tech =>
        `<option value="${tech.uid}" style="padding:8px;">${tech.displayName}</option>`
    ).join('')}
                    <option value="__assign__" style="background:#9c27b0;color:white;font-weight:bold;">🔄 Assign this repair to me</option>
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

    const targetTech = window.allUsers[targetTechId];
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

    // Ensure user data is loaded
    if (!window.currentUserData) {
        console.error('User data not loaded yet');
        setTimeout(() => openPaymentModal(repairId), 500);
        return;
    }

    const userRole = window.currentUserData.role;
    const isAdmin = userRole === 'admin';
    const isManager = userRole === 'manager';
    const isCashier = userRole === 'cashier';
    const canRefund = isAdmin || isManager || isCashier;

    console.log('🔍 Payment Modal - User Role Check:', {
        userRole,
        isAdmin,
        isManager,
        isCashier,
        canRefund,
        currentUserData: window.currentUserData
    });

    console.log('📋 Payment Data Check:', {
        repairId,
        totalPayments: repair.payments ? repair.payments.length : 0,
        payments: repair.payments ? repair.payments.map((p, i) => ({
            index: i,
            amount: p.amount,
            verified: p.verified,
            refunded: p.refunded,
            method: p.method
        })) : []
    });

    // Calculate total paid (verified payments only)
    const totalPaid = (repair.payments || []).filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;

    // Calculate advance payments (when total is 0 or undefined)
    const isAdvancePayment = !repair.total || repair.total === 0;
    const totalAdvances = isAdvancePayment ? (repair.payments || []).filter(p => p.isAdvance && p.verified).reduce((sum, p) => sum + p.amount, 0) : 0;
    const pendingAdvances = (repair.payments || []).filter(p => p.isAdvance && p.advanceStatus === 'pending');

    const content = document.getElementById('paymentModalContent');

    const lang = getCurrentHelpLanguage();
    const helpTitle = lang === 'tl' ? 'Paano Isulat ang Bayad' : 'How to Record Payment';
    const helpText = lang === 'tl' ?
        'Pumili ng payment date, ilagay ang halaga, piliin ang payment method (Cash, GCash, atbp.), at i-save.' :
        'Select payment date, enter amount, choose payment method (Cash, GCash, etc.), and save.';

    content.innerHTML = `
        <details style="margin-bottom:15px;padding:10px;background:#e3f2fd;border-radius:6px;">
            <summary style="cursor:pointer;font-weight:bold;color:#1976d2;font-size:14px;">
                ❓ ${helpTitle}
            </summary>
            <p style="margin:10px 0 0;color:#555;font-size:13px;line-height:1.5;">
                ${helpText}
            </p>
        </details>
        
        <div class="alert-neutral">
            <h4 style="margin:0 0 10px 0;">Payment Summary</h4>
            <p><strong>Customer:</strong> ${repair.customerName}</p>
            <p><strong>Device:</strong> ${repair.brand} ${repair.model}</p>
            ${repair.estimatedCost ? `<p><strong>Estimated Cost:</strong> ₱${repair.estimatedCost.toFixed(2)}</p>` : ''}
            ${isAdvancePayment ? `
                <p style="color:#ff9800;font-weight:bold;">⚠️ Pricing not finalized yet</p>
                ${totalAdvances > 0 ? `<p><strong>Advances Collected:</strong> <span style="color:#ff9800;">₱${totalAdvances.toFixed(2)}</span></p>` : ''}
                ${pendingAdvances.length > 0 ? `<p style="font-size:12px;color:#666;">${pendingAdvances.length} advance payment(s) pending resolution</p>` : ''}
            ` : `
                <p><strong>Total Amount:</strong> ₱${repair.total.toFixed(2)}</p>
                <p><strong>Paid:</strong> <span style="color:green;">₱${totalPaid.toFixed(2)}</span></p>
                <p><strong>Balance:</strong> <span style="color:${balance > 0 ? 'red' : 'green'};font-size:18px;font-weight:bold;">₱${balance.toFixed(2)}</span></p>
            `}
        </div>
        
        ${balance <= 0 && !isAdvancePayment && !isAdvancePayment ? `
            <div class="alert-success" style="text-align:center;">
                <h3 style="color:green;margin:0;">✅ FULLY PAID</h3>
                <p style="margin:10px 0 0;">This repair has been fully paid.</p>
            </div>
        ` : `
            <h4>${isAdvancePayment ? '💰 Record Advance Payment (Deposit)' : 'Record New Payment'}</h4>
            ${isAdvancePayment ? `
                <div class="alert-warning" style="margin-bottom:15px;">
                    <p style="margin:0;"><strong>⚠️ Advance Payment:</strong> Pricing not yet finalized. This payment will be held as a deposit until repair cost is determined.</p>
                    ${repair.estimatedCost ? `<p style="margin:5px 0 0;font-size:13px;">💡 Maximum allowed: ₱${repair.estimatedCost.toFixed(2)} (estimated cost)</p>` : ''}
                </div>
            ` : ''}
            
            <div class="form-group">
                <label>Payment Date *</label>
                <input type="date" id="paymentDate" value="${getTodayDate()}" max="${getTodayDate()}" required>
                <small style="color:#666;">Select the date when payment was actually received</small>
            </div>
            
            <div class="form-group">
                <label>Payment Amount (₱) *</label>
                <input type="number" id="paymentAmount" step="0.01" min="0.01" ${isAdvancePayment ? (repair.estimatedCost ? `max="${repair.estimatedCost}"` : '') : `max="${balance}"`} value="${isAdvancePayment ? '' : balance}" required>
                <small style="color:#666;">${isAdvancePayment ? (repair.estimatedCost ? `Maximum: ₱${repair.estimatedCost.toFixed(2)} (estimated cost)` : 'Enter advance amount') : `Maximum: ₱${balance.toFixed(2)} (remaining balance)`}</small>
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
                    ${repair.payments.map((p, i) => {
        // Determine advance status display
        let advanceIcon = '';
        let advanceColor = '';
        let advanceLabel = '';

        if (p.isAdvance) {
            if (p.advanceStatus === 'pending') {
                advanceIcon = '💰';
                advanceColor = '#ff9800';
                advanceLabel = 'ADVANCE (Pending)';
            } else if (p.advanceStatus === 'applied') {
                advanceIcon = '✅';
                advanceColor = '#4caf50';
                advanceLabel = 'ADVANCE (Applied)';
            } else if (p.advanceStatus === 'refunded') {
                advanceIcon = '↩️';
                advanceColor = '#2196f3';
                advanceLabel = 'ADVANCE (Refunded)';
            }
        }

        // Log payment refund eligibility
        console.log(`💳 Payment ${i}:`, {
            amount: p.amount,
            verified: p.verified,
            refunded: p.refunded,
            canRefund: canRefund,
            shouldShowRefund: p.verified && !p.refunded && canRefund
        });

        return `
                        <div class="${p.verified ? 'alert-success-compact' : 'alert-warning-compact'}">
                            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                                <div>
                                    <strong style="color:${p.verified ? '#2e7d32' : '#e65100'};">₱${p.amount.toFixed(2)}</strong>
                                    ${p.isAdvance ? `<span style="color:${advanceColor};font-size:11px;margin-left:5px;">${advanceIcon} ${advanceLabel}</span>` : ''}
                                </div>
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
                                ${p.refundedBy ? `<div style="color:#2196f3;"><strong>Refunded by:</strong> ${p.refundedBy} on ${utils.formatDateTime(p.refundedAt)}</div>` : ''}
                                ${p.refundNotes ? `<div style="color:#2196f3;"><strong>Refund Notes:</strong> ${p.refundNotes}</div>` : ''}
                            </div>
                            ${p.photo ? `
                                <div style="margin-top:8px;">
                                    <img src="${p.photo}" onclick="showPhotoModal('${p.photo}')" style="max-width:100%;max-height:150px;cursor:pointer;border-radius:5px;">
                                </div>
                            ` : ''}
                            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                                ${!p.verified && (isAdmin || isManager) ? `
                                    <button onclick="verifyPayment('${repairId}', ${i})" style="background:#4caf50;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        ✅ Verify Payment
                                    </button>
                                ` : ''}
                                ${p.verified && !p.refunded && canRefund ? `
                                    <button onclick="showRefundModal('${repairId}', ${i})" style="background:#e91e63;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        🔄 Refund
                                    </button>
                                ` : ''}
                                ${p.verified && !p.refunded && userRole === 'technician' ? `
                                    <button onclick="showRefundModal('${repairId}', ${i})" style="background:#ff9800;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        🔄 Request Refund
                                    </button>
                                ` : ''}
                                ${p.isAdvance && p.advanceStatus === 'pending' && (isAdmin || isManager) ? `
                                    <button onclick="refundAdvancePayment('${repairId}', ${i})" style="background:#2196f3;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                                        ↩️ Mark as Refunded
                                    </button>
                                ` : ''}
                                ${canRefund ? `
    <button onclick="${isAdmin ? `editPaymentDate('${repairId}', ${i})` : `requestPaymentDateModification('${repairId}', ${i})`}" style="background:#667eea;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
        📅 ${isAdmin ? 'Edit Payment Date' : 'Request Edit Payment Date'}
    </button>
` : ''}
                            </div>
                        </div>
                    `}).join('')}
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

    // Check if this is an advance payment (total not set or 0)
    const isAdvancePayment = !repair.total || repair.total === 0;

    // Validate payment amount
    if (!isAdvancePayment && amount > balance) {
        alert(`Payment amount cannot exceed balance of ₱${balance.toFixed(2)}`);
        return;
    }

    // For advance payments, check against estimated cost if provided
    if (isAdvancePayment && repair.estimatedCost && amount > repair.estimatedCost) {
        const confirm = window.confirm(
            `⚠️ Warning: Payment amount (₱${amount.toFixed(2)}) exceeds estimated cost (₱${repair.estimatedCost.toFixed(2)}).\n\n` +
            `Continue anyway?`
        );
        if (!confirm) return;
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
        // Advance payment tracking
        isAdvance: isAdvancePayment,
        advanceStatus: isAdvancePayment ? 'pending' : null,
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

    const paymentDateStr = utils.formatDate(paymentDate);

    if (isAdvancePayment) {
        alert(`✅ Advance Payment Recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n🔔 This advance will be applied when repair pricing is finalized.`);
    } else {
        const newBalance = balance - amount;
        if (newBalance === 0) {
            alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n🎉 FULLY PAID! Balance is now ₱0.00`);
        } else {
            alert(`✅ Payment recorded!\n\n💰 Amount: ₱${amount.toFixed(2)}\n📅 Payment Date: ${paymentDateStr}\n✅ Status: ${payment.verified ? 'Verified' : 'Pending Verification'}\n\n📊 Remaining Balance: ₱${newBalance.toFixed(2)}`);
        }
    }

    closePaymentModal();

    // Firebase listener will auto-refresh the page
}

/**
 * Refund advance payment
 */
async function refundAdvancePayment(repairId, paymentIndex) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];

    if (!payment.isAdvance || payment.advanceStatus !== 'pending') {
        alert('⚠️ This payment is not a pending advance payment');
        return;
    }

    const refundNotes = prompt(
        `Mark this advance payment as refunded?\n\n` +
        `Amount: ₱${payment.amount.toFixed(2)}\n` +
        `Customer: ${repair.customerName}\n\n` +
        `Enter refund notes (e.g., "Customer declined repair", "Parts unavailable"):`
    );

    if (!refundNotes || !refundNotes.trim()) {
        return;
    }

    try {
        const payments = [...repair.payments];
        payments[paymentIndex] = {
            ...payments[paymentIndex],
            advanceStatus: 'refunded',
            refundedBy: window.currentUserData.displayName,
            refundedAt: new Date().toISOString(),
            refundNotes: refundNotes.trim()
        };

        await db.ref('repairs/' + repairId).update({
            payments: payments,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        // Log refund activity
        await logActivity('advance_refunded', {
            repairId: repairId,
            customerName: repair.customerName,
            amount: payment.amount,
            reason: refundNotes.trim()
        }, `₱${payment.amount.toFixed(2)} advance refunded to ${repair.customerName} by ${window.currentUserData.displayName}`);

        alert(`✅ Advance payment marked as refunded!\n\n₱${payment.amount.toFixed(2)} refunded to ${repair.customerName}`);

        setTimeout(() => openPaymentModal(repairId), 100);
    } catch (error) {
        console.error('Error refunding advance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Show refund request modal
 */
function showRefundModal(repairId, paymentIndex) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) return;

    const payment = repair.payments[paymentIndex];
    if (!payment) return;

    const tier = determineRefundTier(repair, payment);
    const tierLabels = {
        1: { label: 'Low Risk', color: '#4caf50', desc: 'Auto-approved (safe scenario)' },
        2: { label: 'Medium Risk', color: '#ff9800', desc: 'Requires admin approval' },
        3: { label: 'High Risk', color: '#f44336', desc: 'Requires admin approval + detailed justification' }
    };
    const tierInfo = tierLabels[tier];

    const content = document.getElementById('paymentModalContent');
    content.innerHTML = `
        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin-bottom:20px;border-radius:4px;">
            <strong>⚠️ Refund Request</strong>
            <div style="margin-top:5px;font-size:14px;">
                Risk Level: <span style="color:${tierInfo.color};font-weight:bold;">${tierInfo.label}</span><br>
                <span style="color:#666;">${tierInfo.desc}</span>
            </div>
        </div>

        <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-bottom:20px;">
            <h4 style="margin:0 0 10px;">Payment Details</h4>
            <div style="font-size:14px;">
                <strong>Amount:</strong> ₱${payment.amount.toFixed(2)}<br>
                <strong>Method:</strong> ${payment.method}<br>
                <strong>Date:</strong> ${utils.formatDate(payment.paymentDate || payment.recordedDate)}<br>
                <strong>Received by:</strong> ${payment.receivedBy}<br>
                <strong>Status:</strong> ${payment.verified ? '✅ Verified' : '⏳ Pending'}
                ${payment.remittanceStatus ? `<br><strong>Remittance:</strong> ${payment.remittanceStatus}` : ''}
            </div>
        </div>

        <div style="margin-bottom:15px;">
            <label><strong>Refund Type *</strong></label>
            <select id="refundType" class="form-control" onchange="toggleRefundAmount()">
                <option value="full">Full Refund (₱${payment.amount.toFixed(2)})</option>
                <option value="partial">Partial Refund</option>
            </select>
        </div>

        <div id="partialAmountDiv" style="margin-bottom:15px;display:none;">
            <label><strong>Refund Amount *</strong></label>
            <input type="number" id="refundAmount" class="form-control" 
                   min="0.01" max="${payment.amount}" step="0.01" 
                   placeholder="Enter amount to refund">
        </div>

        <div style="margin-bottom:15px;">
            <label><strong>Refund Reason *</strong></label>
            <select id="refundReason" class="form-control">
                <option value="">-- Select Reason --</option>
                <option value="customer_request">Customer Request</option>
                <option value="failed_repair">Failed Repair</option>
                <option value="overcharge">Overcharge/Incorrect Amount</option>
                <option value="warranty_issue">Warranty Issue</option>
                <option value="dispute">Customer Dispute</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div style="margin-bottom:15px;">
            <label><strong>Detailed Explanation * (minimum 20 characters)</strong></label>
            <textarea id="refundReasonDetails" class="form-control" rows="3" 
                      placeholder="Explain in detail why this refund is being requested..."></textarea>
        </div>

        <div style="margin-bottom:15px;">
            <label><strong>Refund Method</strong></label>
            <select id="refundMethod" class="form-control">
                <option value="${payment.method}">${payment.method} (Same as original)</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
            </select>
        </div>

        ${tier >= 2 ? `
            <div style="background:#ffebee;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #f44336;">
                <strong>⚠️ ${tier === 3 ? 'HIGH RISK REFUND' : 'ADMIN APPROVAL REQUIRED'}</strong>
                <div style="font-size:13px;margin-top:8px;color:#666;">
                    ${tier === 3
                ? 'This refund requires admin approval because the device is claimed or commission already paid.'
                : 'This refund requires admin approval due to remittance status or device status.'}
                </div>
            </div>
        ` : ''}

        <div style="margin-bottom:15px;">
            <label><strong>Additional Notes</strong></label>
            <textarea id="refundNotes" class="form-control" rows="2" 
                      placeholder="Any additional information..."></textarea>
        </div>

        <div style="display:flex;gap:10px;">
            <button onclick="submitRefundRequest('${repairId}', ${paymentIndex})" 
                    class="btn-primary" style="flex:1;">
                ${tier === 1 && window.currentUserData.role === 'admin' ? '✅ Process Refund' : '📝 Submit Request'}
            </button>
            <button onclick="openPaymentModal('${repairId}')" 
                    class="btn-secondary">
                Cancel
            </button>
        </div>
    `;

    // Show/hide partial amount field
    window.toggleRefundAmount = function () {
        const type = document.getElementById('refundType').value;
        const div = document.getElementById('partialAmountDiv');
        div.style.display = type === 'partial' ? 'block' : 'none';
    };
}

/**
 * Submit refund request
 */
async function submitRefundRequest(repairId, paymentIndex) {
    const type = document.getElementById('refundType').value;
    const reason = document.getElementById('refundReason').value;
    const reasonDetails = document.getElementById('refundReasonDetails').value.trim();
    const method = document.getElementById('refundMethod').value;
    const notes = document.getElementById('refundNotes').value.trim();

    const repair = window.allRepairs.find(r => r.id === repairId);
    const payment = repair.payments[paymentIndex];

    const refundAmount = type === 'full'
        ? payment.amount
        : parseFloat(document.getElementById('refundAmount').value);

    // Validation
    if (!reason) {
        alert('⚠️ Please select a refund reason');
        return;
    }

    if (reasonDetails.length < 20) {
        alert('⚠️ Please provide a detailed explanation (minimum 20 characters)');
        return;
    }

    if (type === 'partial' && (!refundAmount || refundAmount <= 0 || refundAmount > payment.amount)) {
        alert('⚠️ Invalid refund amount');
        return;
    }

    const refundData = {
        refundAmount: refundAmount,
        reason: reason,
        reasonDetails: reasonDetails,
        refundMethod: method,
        notes: notes
    };

    const result = await requestRefund(repairId, paymentIndex, refundData);

    if (result.success) {
        // Close modal and refresh payment view
        setTimeout(() => openPaymentModal(repairId), 500);
    }
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
    const currentStatus = repair.status;

    const content = document.getElementById('statusModalContent');

    content.innerHTML = `
        <div class="form-group">
            <label>Current Status: <strong style="color:#4caf50;">${repair.status}</strong></label>
        </div>
        
        <div class="form-group">
            <label>New Status *</label>
            <select id="newStatus" onchange="toggleRTOFields()">
                <option value="">Select Status</option>
                <option value="Received" ${currentStatus === 'Received' ? 'selected style="background:#4caf50;color:white;"' : ''}>Received</option>
                <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected style="background:#4caf50;color:white;"' : ''}>In Progress</option>
                <option value="Waiting for Parts" ${currentStatus === 'Waiting for Parts' ? 'selected style="background:#4caf50;color:white;"' : ''}>Waiting for Parts</option>
                <option value="Ready for Pickup" ${currentStatus === 'Ready for Pickup' ? 'selected style="background:#4caf50;color:white;"' : ''}>Ready for Pickup</option>
                <option value="Released" ${currentStatus === 'Released' ? 'selected style="background:#4caf50;color:white;"' : ''}>Released</option>
                <option value="Completed" ${currentStatus === 'Completed' ? 'selected style="background:#4caf50;color:white;"' : ''}>Completed</option>
                ${isMicrosoldering ? `<option value="Unsuccessful" ${currentStatus === 'Unsuccessful' ? 'selected style="background:#4caf50;color:white;"' : ''}>Unsuccessful</option>` : ''}
                <option value="RTO" ${currentStatus === 'RTO' ? 'selected style="background:#4caf50;color:white;"' : ''}>RTO (Return to Owner)</option>
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

// ===== DELETION REQUEST FUNCTIONS =====

/**
 * Technician: Request repair deletion
 * Only for repairs assigned to the current technician
 */
/**
 * Direct delete repair (Admin only, or Technician within 24 hours)
 */
async function deleteRepair(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }

    // Check permissions
    const isAdmin = window.currentUserData.role === 'admin';
    const isTechOwner = repair.technicianId === window.currentUser.uid;
    const createdAt = new Date(repair.createdAt);
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    const within24Hours = hoursSinceCreation <= 24;

    if (!isAdmin && !(isTechOwner && within24Hours)) {
        if (isTechOwner && !within24Hours) {
            alert('⚠️ You can only delete repairs within 24 hours of creation.\n\nThis repair is ' + Math.floor(hoursSinceCreation) + ' hours old.\n\nPlease contact an admin for deletion.');
        } else {
            alert('⚠️ You can only delete repairs assigned to you within 24 hours of creation.');
        }
        return;
    }

    // Check if already deleted
    if (repair.deleted) {
        alert('⚠️ This repair is already deleted');
        return;
    }

    // Show repair details with special warning for Claimed devices
    const repairInfo = `Customer: ${repair.customerName}\nDevice: ${repair.brand} ${repair.model}\nProblem: ${repair.problem}\nStatus: ${repair.status}`;

    // Extra confirmation for Claimed devices
    if (repair.status === 'Claimed') {
        const claimedWarning = confirm(
            `⚠️⚠️⚠️ WARNING - CLAIMED DEVICE DELETION ⚠️⚠️⚠️\n\n` +
            `${repairInfo}\n\n` +
            `This device has COMPLETED WARRANTY TRACKING.\n` +
            `Deletion should only be done for serious errors (duplicate, wrong customer, etc.)\n\n` +
            `Consider using "Un-release Device" instead to preserve data.\n\n` +
            `Are you ABSOLUTELY SURE you want to delete this claimed device?`
        );
        if (!claimedWarning) return;
    }

    if (!confirm(`DELETE REPAIR\n\n${repairInfo}\n\nAre you sure you want to delete this repair?\n\nThis action cannot be undone.`)) {
        return;
    }

    // Get deletion reason
    const reason = prompt('Please enter the reason for deletion:\n(e.g., "Wrong customer", "Duplicate entry", "Customer cancelled")');

    if (!reason || !reason.trim()) {
        alert('❌ Deletion reason is required');
        return;
    }

    if (reason.trim().length < 10) {
        alert('❌ Please provide a more detailed reason (at least 10 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        const now = new Date().toISOString();

        // Soft delete - archive to deletedRepairs collection
        await db.ref(`deletedRepairs/${repairId}`).set({
            ...repair,
            deleted: true,
            deletedAt: now,
            deletedBy: window.currentUser.uid,
            deletedByName: window.currentUserData.displayName,
            deletedByRole: window.currentUserData.role,
            deletionReason: reason.trim(),
            originalCollectionPath: 'repairs'
        });

        // Mark as deleted in repairs collection
        await db.ref(`repairs/${repairId}`).update({
            deleted: true,
            deletedAt: now,
            deletedBy: window.currentUser.uid,
            deletedByName: window.currentUserData.displayName,
            deletionReason: reason.trim()
        });

        // Log activity
        await logActivity('repair_deleted', {
            repairId: repairId,
            customerName: repair.customerName,
            device: `${repair.brand} ${repair.model}`,
            status: repair.status,
            reason: reason.trim(),
            deletedByRole: window.currentUserData.role,
            within24Hours: within24Hours
        }, `Repair deleted: ${repair.customerName} - ${repair.brand} ${repair.model}`);

        utils.showLoading(false);
        alert('✅ Repair deleted successfully!');

        // Auto-refresh
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('Error deleting repair:', error);
        alert('Error: ' + error.message);
    }
}

// ===== END DELETION REQUEST FUNCTIONS =====

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

window.deleteRepair = deleteRepair;

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

    const repair = window.allRepairs.find(r => r.id === repairId);

    // Check for pending advance payments and auto-apply them
    const pendingAdvances = (repair.payments || []).filter(p => p.isAdvance && p.advanceStatus === 'pending');
    const updatedPayments = (repair.payments || []).map(p => {
        if (p.isAdvance && p.advanceStatus === 'pending') {
            return {
                ...p,
                advanceStatus: 'applied',
                appliedAt: new Date().toISOString(),
                appliedTo: total
            };
        }
        return p;
    });

    const updateData = {
        repairType: formData.get('repairType'),
        partType: formData.get('partType') || '',
        partSource: formData.get('partSource') || '',
        partsCost: partsCost,
        laborCost: laborCost,
        total: total,
        // Update payments array if there were pending advances
        ...(pendingAdvances.length > 0 ? { payments: updatedPayments } : {}),
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

        let successMsg = `✅ Diagnosis Created!\n\n📋 Repair Type: ${updateData.repairType}\n💰 Total: ₱${total.toFixed(2)}`;

        if (pendingAdvances.length > 0) {
            const totalAdvances = pendingAdvances.reduce((sum, p) => sum + p.amount, 0);
            successMsg += `\n\n💰 ${pendingAdvances.length} advance payment(s) automatically applied: ₱${totalAdvances.toFixed(2)}`;
            const remaining = total - totalAdvances;
            if (remaining > 0) {
                successMsg += `\n📊 Remaining balance: ₱${remaining.toFixed(2)}`;
            } else if (remaining === 0) {
                successMsg += `\n🎉 Fully paid with advances!`;
            }
        }

        successMsg += `\n\n⏳ Status: Pending Customer Approval\n\nNext: Customer must approve this price before technician can accept the repair.`;

        alert(successMsg);
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
            supplierName: name.trim(),
            phone: contact?.trim() || '',
            contactPerson: '',
            email: '',
            address: '',
            notes: '',
            deleted: false,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName
        });

        await loadSuppliers();
        utils.showLoading(false);

        alert(`✅ Supplier "${name.trim()}" added!`);

        // Refresh dropdown and select new supplier
        if (window.populateReceiveSupplierDropdown) {
            window.populateReceiveSupplierDropdown();
            const select = document.getElementById('receiveSupplier');
            if (select) {
                // Find option by supplier name
                const options = Array.from(select.options);
                const option = options.find(opt => opt.text === name.trim());
                if (option) select.value = option.value;
            }
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
            supplierName: name.trim(),
            phone: contact?.trim() || '',
            contactPerson: '',
            email: '',
            address: '',
            notes: '',
            deleted: false,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName
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

    // Check supplier payment type for special suppliers
    let supplierPaymentType = null;
    if (actualSupplier !== 'Stock' && actualSupplier !== 'Customer Provided') {
        const supplier = (window.allSuppliers || []).find(s => s.supplierName === actualSupplier);

        if (supplier) {
            supplierPaymentType = supplier.paymentType;

            // Warn if supplier is not classified
            if (!supplierPaymentType) {
                if (window.currentUserData.role === 'admin') {
                    const classify = confirm(
                        `⚠️ Supplier Not Classified\n\n` +
                        `Supplier: ${actualSupplier}\n\n` +
                        `This supplier needs payment type classification.\n\n` +
                        `Would you like to classify it now?\n\n` +
                        `(Click OK to classify, Cancel to proceed without classification)`
                    );

                    if (classify) {
                        closePartsCostModal();
                        if (window.editSupplierForm) {
                            window.editSupplierForm(supplier.id);
                        }
                        return;
                    }
                } else {
                    const proceed = confirm(
                        `⚠️ Supplier Classification Missing\n\n` +
                        `Supplier: ${actualSupplier}\n\n` +
                        `This supplier has not been classified yet for payment handling.\n\n` +
                        `Parts cost will be recorded, but expense may not be tracked correctly.\n\n` +
                        `Contact an admin to classify this supplier.\n\n` +
                        `Proceed anyway?`
                    );

                    if (!proceed) return;
                }
            }
        }
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

        // Auto-create or update expense if supplier type is tech_pays_cod
        if (supplierPaymentType === 'tech_pays_cod') {
            // Reload expenses first to ensure we have latest data
            if (window.loadTechExpenses) {
                await window.loadTechExpenses();
            }
            
            // Check for existing auto-generated expense for this repair
            const existingExpense = (window.techExpenses || []).find(e =>
                e.repairId === repairId &&
                e.category === 'parts' &&
                e.autoGenerated === true &&
                !e.remittanceId  // Only if not yet remitted
            );

            if (existingExpense) {
                // Update existing expense instead of creating duplicate
                await db.ref(`techExpenses/${existingExpense.id}`).update({
                    amount: actualAmount,
                    description: `Parts cost: ${notes || actualSupplier}`,
                    notes: `Auto-updated from parts cost. Supplier: ${actualSupplier}`,
                    lastUpdatedAt: new Date().toISOString()
                });
                console.log('✅ Updated existing auto-generated expense - parts cost updated');
            } else {
                // Create new expense only if none exists
                const linkedPartsCostId = repairId + '_partsCost_' + Date.now();

                const expense = {
                    techId: window.currentUser.uid,
                    techName: window.currentUserData.displayName,
                    date: new Date().toISOString(),
                    type: 'repair-specific',
                    repairId: repairId,
                    category: 'parts',
                    amount: actualAmount,
                    description: `Parts cost: ${notes || actualSupplier}`,
                    notes: `Auto-generated from parts cost. Supplier: ${actualSupplier}`,
                    createdAt: new Date().toISOString(),
                    remittanceId: null,
                    linkedPartsCostId: linkedPartsCostId,
                    autoGenerated: true
                };

                await db.ref('techExpenses').push(expense);
                console.log('✅ Auto-created expense for technician - parts cost will be deducted from remittance');
            }

            // Reload expenses after changes
            if (window.loadTechExpenses) {
                await window.loadTechExpenses();
            }
        }

        utils.showLoading(false);

        let message = `✅ Actual parts cost recorded!\n\n₱${actualAmount.toFixed(2)}\nSupplier: ${actualSupplier}`;

        if (costVariance !== null && costVariance !== 0) {
            const varianceText = costVariance > 0 ? `+₱${costVariance.toFixed(2)} higher` : `₱${Math.abs(costVariance).toFixed(2)} lower`;
            message += `\n\nVariance from quote: ${varianceText}`;
        }

        if (supplierPaymentType === 'tech_pays_cod') {
            message += `\n\n💵 Expense auto-created and will be deducted from your daily remittance.`;
        }

        alert(message);
        closePartsCostModal();
        
        // If supplier is "Stock", prompt to select inventory items
        if (actualSupplier === 'Stock') {
            setTimeout(() => {
                openInventorySelectionModal(repairId, actualAmount);
            }, 500);
        }

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

/**
 * Open modal to select inventory items used for a repair
 */
async function openInventorySelectionModal(repairId, totalCost) {
    console.log('📦 Opening inventory selection modal for repair:', repairId);
    
    document.getElementById('invSelectRepairId').value = repairId;
    
    // Initialize selected items array
    window.selectedInventoryItems = [];
    
    // Load existing selected items if any
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (repair && repair.inventoryItemsUsed) {
        window.selectedInventoryItems = [...repair.inventoryItemsUsed];
    }
    
    // Show modal first with loading state
    document.getElementById('inventorySelectionModal').style.display = 'flex';
    const container = document.getElementById('inventoryItemsList');
    container.innerHTML = `
        <div style="text-align:center;padding:40px;color:#999;">
            <p style="font-size:48px;margin:0;">📦</p>
            <p>Loading inventory items...</p>
        </div>
    `;
    
    // Load inventory if not already loaded
    if (!window.allInventoryItems || window.allInventoryItems.length === 0) {
        try {
            await loadInventory();
        } catch (error) {
            console.error('Error loading inventory:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:#d32f2f;">
                    <p style="font-size:48px;margin:0;">❌</p>
                    <p>Error loading inventory</p>
                    <small>${error.message}</small>
                </div>
            `;
            return;
        }
    }
    
    loadAvailableInventoryItems();
    updateSelectedItemsSummary();
}

/**
 * Load and display available inventory items
 */
function loadAvailableInventoryItems() {
    const container = document.getElementById('inventoryItemsList');
    
    if (!window.allInventoryItems || window.allInventoryItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <p style="font-size:48px;margin:0;">📦</p>
                <p>No inventory items available</p>
                <small>Add items to inventory first</small>
            </div>
        `;
        return;
    }
    
    // Filter out deleted items and items with 0 quantity
    const availableItems = window.allInventoryItems.filter(item => 
        !item.deleted && item.quantity > 0
    );
    
    if (availableItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <p style="font-size:48px;margin:0;">📦</p>
                <p>No items in stock</p>
                <small>All items are out of stock</small>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display:grid;gap:10px;">';
    
    availableItems.forEach(item => {
        const isSelected = window.selectedInventoryItems.some(sel => sel.itemId === item.id);
        const selectedItem = window.selectedInventoryItems.find(sel => sel.itemId === item.id);
        const selectedQty = selectedItem ? selectedItem.quantity : 0;
        
        // Safe property access with defaults - use correct field names
        const itemName = item.partName || 'Unnamed Item';
        const itemCategory = item.category || 'Uncategorized';
        const itemPartNumber = item.partNumber || '';
        const itemBrand = item.brand || '';
        const itemModel = item.model || '';
        const itemCost = parseFloat(item.unitCost || 0);
        
        // Build display info
        const brandModelInfo = [itemBrand, itemModel].filter(x => x).join(' ');
        
        // Build search string safely
        const searchString = `${itemName.toLowerCase()} ${itemCategory.toLowerCase()} ${itemPartNumber.toLowerCase()} ${brandModelInfo.toLowerCase()}`;
        
        html += `
            <div class="inventory-item-card" data-item-id="${item.id}" data-search="${searchString}">
                <div style="display:flex;gap:15px;align-items:center;">
                    <input type="checkbox" 
                           id="inv_${item.id}" 
                           onchange="toggleInventoryItem('${item.id}')"
                           ${isSelected ? 'checked' : ''}
                           style="width:20px;height:20px;cursor:pointer;">
                    
                    <div style="flex:1;">
                        <div style="font-weight:bold;font-size:15px;margin-bottom:4px;">
                            ${itemName}
                        </div>
                        <div style="font-size:13px;color:#666;">
                            ${itemCategory} • PN: ${itemPartNumber} • Stock: ${item.quantity || 0} pcs
                            ${brandModelInfo ? ` • ${brandModelInfo}` : ''}
                        </div>
                        <div style="font-size:14px;color:#2e7d32;font-weight:bold;margin-top:4px;">
                            ₱${itemCost.toFixed(2)} per pc
                        </div>
                    </div>
                    
                    <div style="display:${isSelected ? 'flex' : 'none'};align-items:center;gap:8px;" id="qty_controls_${item.id}">
                        <button type="button" onclick="changeItemQuantity('${item.id}', -1)" class="btn-small" style="width:30px;padding:4px;">-</button>
                        <input type="number" 
                               id="qty_${item.id}" 
                               value="${selectedQty || 1}" 
                               min="1" 
                               max="${item.quantity}"
                               onchange="updateItemQuantity('${item.id}', this.value)"
                               style="width:60px;text-align:center;padding:4px;">
                        <button type="button" onclick="changeItemQuantity('${item.id}', 1)" class="btn-small" style="width:30px;padding:4px;">+</button>
                        <span style="font-size:12px;color:#666;">of ${item.quantity}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Filter inventory items by search term
 */
function filterInventoryItems() {
    const searchTerm = document.getElementById('invSearchInput').value.toLowerCase();
    const items = document.querySelectorAll('.inventory-item-card');
    
    items.forEach(item => {
        const searchData = item.getAttribute('data-search');
        if (searchData.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Toggle inventory item selection
 */
function toggleInventoryItem(itemId) {
    const checkbox = document.getElementById(`inv_${itemId}`);
    const qtyControls = document.getElementById(`qty_controls_${itemId}`);
    
    if (checkbox.checked) {
        // Add to selected items
        const item = window.allInventoryItems.find(i => i.id === itemId);
        if (item) {
            window.selectedInventoryItems.push({
                itemId: item.id,
                itemName: item.partName || 'Unnamed Item',
                partNumber: item.partNumber || '',
                quantity: 1,
                unitCost: parseFloat(item.unitCost || 0),
                category: item.category || 'Uncategorized'
            });
        }
        qtyControls.style.display = 'flex';
        document.getElementById(`qty_${itemId}`).value = 1;
    } else {
        // Remove from selected items
        window.selectedInventoryItems = window.selectedInventoryItems.filter(i => i.itemId !== itemId);
        qtyControls.style.display = 'none';
    }
    
    updateSelectedItemsSummary();
}

/**
 * Change item quantity by delta
 */
function changeItemQuantity(itemId, delta) {
    const input = document.getElementById(`qty_${itemId}`);
    const item = window.allInventoryItems.find(i => i.id === itemId);
    if (!item) return;
    
    let newQty = parseInt(input.value) + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > item.quantity) newQty = item.quantity;
    
    input.value = newQty;
    updateItemQuantity(itemId, newQty);
}

/**
 * Update item quantity
 */
function updateItemQuantity(itemId, quantity) {
    const selectedItem = window.selectedInventoryItems.find(i => i.itemId === itemId);
    const item = window.allInventoryItems.find(i => i.id === itemId);
    
    if (selectedItem && item) {
        let qty = parseInt(quantity);
        if (qty < 1) qty = 1;
        if (qty > item.quantity) qty = item.quantity;
        
        selectedItem.quantity = qty;
        document.getElementById(`qty_${itemId}`).value = qty;
        updateSelectedItemsSummary();
    }
}

/**
 * Update selected items summary
 */
function updateSelectedItemsSummary() {
    const summary = document.getElementById('selectedItemsSummary');
    const list = document.getElementById('selectedItemsList');
    const total = document.getElementById('selectedItemsTotal');
    
    if (window.selectedInventoryItems.length === 0) {
        summary.style.display = 'none';
        return;
    }
    
    summary.style.display = 'block';
    
    let totalCost = 0;
    let html = '<div style="display:grid;gap:8px;">';
    
    window.selectedInventoryItems.forEach(item => {
        const itemTotal = item.quantity * item.unitCost;
        totalCost += itemTotal;
        
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:white;border-radius:6px;">
                <div>
                    <strong>${item.itemName}</strong><br>
                    <small style="color:#666;">${item.quantity} pcs × ₱${item.unitCost.toFixed(2)}</small>
                </div>
                <div style="font-weight:bold;color:#2e7d32;">
                    ₱${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    list.innerHTML = html;
    total.textContent = totalCost.toFixed(2);
}

/**
 * Save selected inventory items and deduct from stock
 */
async function saveSelectedInventoryItems() {
    const repairId = document.getElementById('invSelectRepairId').value;
    
    if (window.selectedInventoryItems.length === 0) {
        const skip = confirm('No items selected. Do you want to skip inventory tracking for this repair?');
        if (skip) {
            closeInventorySelectionModal();
        }
        return;
    }
    
    try {
        utils.showLoading(true);
        
        // Save to repair record
        await db.ref(`repairs/${repairId}`).update({
            inventoryItemsUsed: window.selectedInventoryItems,
            inventoryLinkedAt: new Date().toISOString(),
            inventoryLinkedBy: window.currentUserData.displayName,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Deduct from inventory
        for (const item of window.selectedInventoryItems) {
            const inventoryItem = window.allInventoryItems.find(i => i.id === item.itemId);
            if (inventoryItem) {
                const newQuantity = inventoryItem.quantity - item.quantity;
                
                await db.ref(`inventory/${item.itemId}`).update({
                    quantity: newQuantity,
                    lastUpdated: new Date().toISOString()
                });
                
                // Log adjustment
                await db.ref(`inventory/${item.itemId}/adjustments`).push({
                    type: 'used',
                    quantity: -item.quantity,
                    newQuantity: newQuantity,
                    reason: `Used for repair ${repairId}`,
                    repairId: repairId,
                    recordedBy: window.currentUserData.displayName,
                    recordedAt: new Date().toISOString()
                });
            }
        }
        
        utils.showLoading(false);
        alert(`✅ Inventory items linked and deducted!\n\n${window.selectedInventoryItems.length} item(s) deducted from stock.`);
        closeInventorySelectionModal();
        
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error saving inventory items:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Close inventory selection modal
 */
function closeInventorySelectionModal() {
    document.getElementById('inventorySelectionModal').style.display = 'none';
    document.getElementById('invSearchInput').value = '';
    window.selectedInventoryItems = [];
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
 * View repair expenses
 */
function viewRepairExpenses(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    const expenses = (window.techExpenses || []).filter(e => e.repairId === repairId);

    if (expenses.length === 0) {
        alert('No expenses found for this repair');
        return;
    }

    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    const modalTitle = document.getElementById('userModalTitle');

    modalTitle.textContent = `💸 Expenses for ${repair?.customerName || 'Repair'}`;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    modalContent.innerHTML = `
        <div style="margin-bottom:20px;">
            <strong>Device:</strong> ${repair?.brand || ''} ${repair?.model || ''}<br>
            <strong>Customer:</strong> ${repair?.customerName || ''}<br>
            <strong>Total Expenses:</strong> ₱${totalExpenses.toFixed(2)}
        </div>
        
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:var(--bg-hover);">
                    <th style="padding:10px;text-align:left;border:1px solid #ddd;">Category</th>
                    <th style="padding:10px;text-align:left;border:1px solid #ddd;">Amount</th>
                    <th style="padding:10px;text-align:left;border:1px solid #ddd;">Description</th>
                    <th style="padding:10px;text-align:left;border:1px solid #ddd;">Date</th>
                    <th style="padding:10px;text-align:center;border:1px solid #ddd;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => `
                    <tr>
                        <td style="padding:10px;border:1px solid #ddd;">
                            ${expense.category}
                            ${expense.autoGenerated ? '<br><span style="font-size:0.8em;color:#ff9800;">⚡ Auto-generated</span>' : ''}
                        </td>
                        <td style="padding:10px;border:1px solid #ddd;">₱${expense.amount.toFixed(2)}</td>
                        <td style="padding:10px;border:1px solid #ddd;">
                            ${expense.description || 'N/A'}
                            ${expense.linkedPartsCostId ? `<br><small style="color:#666;">Linked: ${expense.linkedPartsCostId}</small>` : ''}
                        </td>
                        <td style="padding:10px;border:1px solid #ddd;">${utils.formatDate(expense.date)}</td>
                        <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                            ${!expense.remittanceId ? `
                                <button onclick="deleteExpense('${expense.id}')" class="btn-small btn-danger" style="font-size:0.8em;">
                                    🗑️ Delete
                                </button>
                            ` : `<span style="color:#999;font-size:0.8em;">Remitted</span>`}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top:20px;text-align:right;">
            <button onclick="closeModal()" class="btn-secondary">Close</button>
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * Delete expense with confirmation and audit log
 */
async function deleteExpense(expenseId) {
    const expense = (window.techExpenses || []).find(e => e.id === expenseId);

    if (!expense) {
        alert('Expense not found');
        return;
    }

    if (expense.remittanceId) {
        alert('Cannot delete expense that has been remitted');
        return;
    }

    const confirmMsg = expense.autoGenerated
        ? '⚠️ Delete this auto-generated expense?\n\n' +
        'This expense was automatically created from parts cost.\n' +
        'Deleting it will affect your daily remittance calculation.\n\n' +
        'This action will be logged for audit purposes.\n\n' +
        'Continue?'
        : '⚠️ Delete this expense?\n\n' +
        'This will affect your daily remittance calculation.\n' +
        'This action will be logged for audit purposes.\n\n' +
        'Continue?';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        utils.showLoading(true);

        // Create audit log for deletion
        await db.ref('expenseDeletions').push({
            expenseId: expenseId,
            expense: expense,
            deletedBy: window.currentUserData.displayName,
            deletedById: window.currentUser.uid,
            deletedAt: new Date().toISOString(),
            reason: 'Manual deletion via expense view'
        });

        // Delete the expense
        await db.ref(`techExpenses/${expenseId}`).remove();

        // Reload expenses
        if (window.loadTechExpenses) {
            await window.loadTechExpenses();
        }

        utils.showLoading(false);
        alert('✅ Expense deleted and logged for audit');

        // Close modal and refresh
        closeModal();
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error deleting expense:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Get technician's daily payments
 */
function getTechDailyPayments(techId, date) {
    // Convert date to local date string for comparison (no timezone issues)
    const targetDateString = date instanceof Date
        ? getLocalDateString(date)
        : date; // Already a string like "2025-12-31"

    const payments = [];
    let total = 0;

    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                const paymentDateString = getLocalDateString(paymentDate);
                const paymentMethod = payment.method || 'Cash'; // Default to Cash for old payments

                // Include CASH and BANK TRANSFER payments in remittance
                // GCash goes directly to shop, no remittance needed
                if (payment.collectedByTech &&
                    payment.receivedById === techId &&
                    paymentDateString === targetDateString && // String comparison - no timezone issues
                    (paymentMethod === 'Cash' || paymentMethod === 'Bank Transfer') &&
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
 * Get ALL pending payments for a technician (any date) - for remittance submission
 */
function getAllPendingPayments(techId) {
    const payments = [];
    let total = 0;

    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                const paymentMethod = payment.method || 'Cash';

                // Include ALL pending cash and bank transfer payments regardless of date
                if (payment.collectedByTech &&
                    payment.receivedById === techId &&
                    (paymentMethod === 'Cash' || paymentMethod === 'Bank Transfer') &&
                    payment.remittanceStatus === 'pending' &&
                    !payment.techRemittanceId) {

                    const paymentDate = new Date(payment.recordedDate || payment.paymentDate);

                    payments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        method: payment.method,
                        paymentDate: payment.paymentDate,
                        recordedDate: payment.recordedDate,
                        dateString: getLocalDateString(paymentDate)
                    });
                    total += payment.amount;
                }
            });
        }
    });

    // Sort by date (oldest first)
    payments.sort((a, b) => new Date(a.recordedDate || a.paymentDate) - new Date(b.recordedDate || b.paymentDate));

    return { payments, total };
}

/**
 * Get all pending dates for a technician (dates with unremitted payments)
 * Returns array of dates sorted oldest to newest with balance info
 */
function getPendingRemittanceDates(techId) {
    const dateMap = {};

    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                const paymentMethod = payment.method || 'Cash';

                // Only Cash and Bank Transfer payments that are pending
                if (payment.collectedByTech &&
                    payment.receivedById === techId &&
                    (paymentMethod === 'Cash' || paymentMethod === 'Bank Transfer') &&
                    payment.remittanceStatus === 'pending' &&
                    !payment.techRemittanceId) {

                    const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                    const dateString = getLocalDateString(paymentDate);

                    if (!dateMap[dateString]) {
                        dateMap[dateString] = {
                            dateString: dateString,
                            date: new Date(dateString + 'T00:00:00'),
                            payments: [],
                            expenses: [],
                            totalPayments: 0,
                            totalExpenses: 0,
                            totalCommission: 0
                        };
                    }

                    dateMap[dateString].payments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        method: payment.method,
                        paymentDate: payment.paymentDate,
                        recordedDate: payment.recordedDate
                    });
                    dateMap[dateString].totalPayments += payment.amount;
                }
            });
        }
    });

    // Add expenses for each date
    if (window.allExpenses) {
        window.allExpenses.forEach(expense => {
            if (expense.techId === techId) {
                const expenseDate = new Date(expense.date);
                const dateString = getLocalDateString(expenseDate);

                if (dateMap[dateString]) {
                    dateMap[dateString].expenses.push(expense);
                    dateMap[dateString].totalExpenses += expense.amount;
                }
            }
        });
    }

    // Calculate commission and unremitted balance per date
    // Correct: Tech gets 40% of gross, Shop gets 60% of gross minus expenses/parts
    Object.keys(dateMap).forEach(dateString => {
        const dateData = dateMap[dateString];

        // Get parts costs for this date
        const { total: partsCostsTotal } = getTechDailyPartsCosts(techId, dateString);
        dateData.totalPartsCosts = partsCostsTotal;

        // Tech commission = 40% of gross payments
        dateData.totalCommission = dateData.totalPayments * 0.40;
        // Shop's share = 60% of gross minus expenses and parts costs
        const shopShare = (dateData.totalPayments * 0.60) - partsCostsTotal - dateData.totalExpenses;
        dateData.unremittedBalance = shopShare;
    });

    // Convert to array and sort by date (oldest first)
    const dates = Object.values(dateMap).sort((a, b) => a.date - b.date);

    return dates;
}

/**
 * Get pending GCash remittance dates for technician
 */
function getPendingGCashDates(techId) {
    const dateMap = {};

    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                // Only GCash payments that haven't been reported yet
                if (payment.method === 'GCash' &&
                    payment.receivedById === techId &&
                    !payment.gcashRemittanceId) {

                    const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                    const dateString = getLocalDateString(paymentDate);

                    if (!dateMap[dateString]) {
                        dateMap[dateString] = {
                            dateString: dateString,
                            date: new Date(dateString + 'T00:00:00'),
                            payments: [],
                            totalPayments: 0,
                            totalPartsCost: 0,
                            totalNetAmount: 0,
                            totalCommission: 0
                        };
                    }

                    // Get parts cost for this repair
                    const partsCost = repair.partsCost || 0;
                    const netAmount = payment.amount - (partsCost / (repair.payments.length || 1)); // Distribute parts cost across payments

                    dateMap[dateString].payments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        partsCost: partsCost,
                        netAmount: netAmount > 0 ? netAmount : 0,
                        method: payment.method,
                        gcashReferenceNumber: payment.gcashReferenceNumber,
                        paymentDate: payment.paymentDate,
                        recordedDate: payment.recordedDate
                    });
                    dateMap[dateString].totalPayments += payment.amount;
                    dateMap[dateString].totalPartsCost += (partsCost / (repair.payments.length || 1));
                    dateMap[dateString].totalNetAmount += (netAmount > 0 ? netAmount : 0);
                }
            });
        }
    });

    // Calculate commission per date using custom tech rate
    const techUser = window.allUsers ? window.allUsers[techId] : null;
    let commissionRate = 0.40; // Default

    if (techUser) {
        const compensationType = techUser.compensationType || 'commission';
        if (compensationType === 'salary') {
            commissionRate = 0;
        } else if (compensationType === 'hybrid') {
            commissionRate = techUser.hybridCommissionRate || 0.20;
        } else if (compensationType === 'commission') {
            commissionRate = techUser.commissionRate || 0.40;
        } else {
            commissionRate = 0;
        }

        // Admin/manager repairs get their custom rate
        if ((techUser.role === 'admin' || techUser.role === 'manager') && compensationType === 'commission') {
            commissionRate = techUser.commissionRate || 0.60;
        }
    }

    Object.keys(dateMap).forEach(dateString => {
        const dateData = dateMap[dateString];
        dateData.totalCommission = dateData.totalNetAmount * commissionRate;
        // Remaining % is "remitted" (shop keeps after parts cost)
        dateData.remittedAmount = dateData.totalNetAmount * (1 - commissionRate);
    });

    // Convert to array and sort by date (oldest first)
    return Object.values(dateMap).sort((a, b) => a.date - b.date);
}

/**
 * Calculate unremitted balance for a specific date
 * Returns: Shop's 60% share minus expenses and parts costs
 */
function getUnremittedBalance(techId, dateString) {
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, dateString);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, dateString);
    const { repairs: partsRepairs, total: partsCostsTotal } = getTechDailyPartsCosts(techId, dateString);

    // Calculate net revenue (payments - parts costs - expenses)
    const netRevenue = paymentsTotal - partsCostsTotal - expensesTotal;
    
    // Calculate commission deduction (technician's 40% share of net revenue)
    const commissionDeduction = netRevenue * 0.40;
    
    // Correct calculation: shop gets 60% of net revenue
    const shopShare = netRevenue * 0.60;
    const unremittedBalance = shopShare;

    return {
        paymentsTotal,
        partsCostsTotal,
        expensesTotal,
        netRevenue,
        commissionDeduction,
        unremittedBalance,
        paymentCount: payments.length
    };
}

/**
 * Get technician's daily GCash payments (for display only, not remittance)
 */
function getTechDailyGCashPayments(techId, date) {
    // Convert date to local date string for comparison (no timezone issues)
    const targetDateString = date instanceof Date
        ? getLocalDateString(date)
        : date; // Already a string like "2025-12-31"

    const payments = [];
    let total = 0;

    window.allRepairs.forEach(repair => {
        // Only include repairs assigned to this technician
        if (repair.acceptedBy === techId && repair.payments) {
            repair.payments.forEach((payment, index) => {
                const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                const paymentDateString = getLocalDateString(paymentDate);

                // Only GCash payments for this date
                if (payment.method === 'GCash' && paymentDateString === targetDateString) {
                    payments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        method: payment.method,
                        gcashReferenceNumber: payment.gcashReferenceNumber,
                        verified: payment.verified,
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
 * Get technician's daily expenses (with duplicate prevention)
 */
function getTechDailyExpenses(techId, date) {
    // Convert date to local date string for comparison (no timezone issues)
    const targetDateString = date instanceof Date
        ? getLocalDateString(date)
        : date; // Already a string like "2025-12-31"

    const expenses = window.techExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        const expDateString = getLocalDateString(expDate);
        return exp.techId === techId &&
            expDateString === targetDateString &&
            !exp.remittanceId;
    });
    
    // Remove duplicates - if multiple auto-generated expenses exist for same repair, keep only the most recent
    const deduplicatedExpenses = [];
    const seenRepairExpenses = new Map();
    
    expenses.forEach(exp => {
        if (exp.autoGenerated && exp.repairId) {
            const key = `${exp.repairId}_${exp.category}`;
            const existing = seenRepairExpenses.get(key);
            
            if (!existing || new Date(exp.createdAt) > new Date(existing.createdAt)) {
                // This is more recent, replace if exists
                if (existing) {
                    const oldIndex = deduplicatedExpenses.indexOf(existing);
                    if (oldIndex > -1) {
                        deduplicatedExpenses.splice(oldIndex, 1);
                    }
                    console.warn(`⚠️ Duplicate expense detected for repair ${exp.repairId}, using most recent`);
                }
                seenRepairExpenses.set(key, exp);
                deduplicatedExpenses.push(exp);
            }
        } else {
            // Not auto-generated or no repairId, include as-is
            deduplicatedExpenses.push(exp);
        }
    });

    const total = deduplicatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return { expenses: deduplicatedExpenses, total };
}

// ===== COMMISSION CALCULATION FUNCTIONS =====

/**
 * Calculate parts cost for a repair
 * Uses inventory partsUsed or manual partsCost field
 */
function getRepairPartsCost(repair) {
    // Priority: Use inventory system cost if available, otherwise use manual entry
    // Never add both together to avoid double-counting

    // Get cost from inventory system (Phase 3 partsUsed)
    if (repair.partsUsed) {
        const inventoryCost = Object.values(repair.partsUsed).reduce((sum, part) => {
            return sum + (part.totalCost || 0);
        }, 0);
        if (inventoryCost > 0) {
            return inventoryCost; // Use inventory cost
        }
    }

    // Fallback to manual parts cost if inventory not used
    if (repair.partsCost) {
        return parseFloat(repair.partsCost) || 0;
    }

    return 0;
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
    // Determine commission rate based on user compensation settings
    const techUser = window.allUsers ? window.allUsers[techId] : null;
    let commissionRate = 0.40; // Fallback default
    let compensationType = 'commission'; // Default type

    if (techUser) {
        compensationType = techUser.compensationType || 'commission';

        // Calculate rate based on compensation type
        if (compensationType === 'salary') {
            // Salary-only techs don't earn commission from repairs
            commissionRate = 0;
        } else if (compensationType === 'hybrid') {
            // Hybrid: Salary + reduced commission
            commissionRate = techUser.hybridCommissionRate || 0.20; // Default 20% for hybrid
        } else if (compensationType === 'commission') {
            // Pure commission techs
            commissionRate = techUser.commissionRate || 0.40; // Use custom rate or default
        } else {
            // 'none' or unknown - no commission (cashiers, managers)
            commissionRate = 0;
        }

        // Special case: Admin/manager repairs get higher rate if doing repairs themselves
        if ((techUser.role === 'admin' || techUser.role === 'manager') && compensationType === 'commission') {
            commissionRate = techUser.commissionRate || 0.60;
        }
    }

    const result = {
        eligible: false,
        amount: 0,
        breakdown: {
            repairTotal: repair.total || 0,
            partsCost: 0,
            deliveryExpenses: 0,
            netAmount: 0,
            commissionRate: commissionRate,
            compensationType: compensationType // Track for transparency
        }
    };

    DebugLogger.log('REMITTANCE', 'Commission Calculation Started', {
        repairId: repair.id,
        customerName: repair.customerName,
        techId: techId,
        repairTotal: repair.total,
        status: repair.status,
        acceptedBy: repair.acceptedBy,
        compensationType: compensationType,
        commissionRate: commissionRate
    });

    // Check eligibility
    // 1. Must be assigned to this technician
    if (repair.acceptedBy !== techId) {
        DebugLogger.log('REMITTANCE', 'Commission Not Eligible - Wrong Technician', {
            repairId: repair.id,
            expectedTech: techId,
            actualTech: repair.acceptedBy
        });
        return result;
    }

    // 2. Must be fully paid
    const totalPaid = (repair.payments || [])
        .filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);

    const balance = repair.total - totalPaid;

    if (balance > 0) {
        DebugLogger.log('REMITTANCE', 'Commission Not Eligible - Not Fully Paid', {
            repairId: repair.id,
            repairTotal: repair.total,
            totalPaid: totalPaid,
            balance: balance
        });
        return result;
    }

    // 3. Must be claimed (not RTO)
    if (repair.status === 'RTO') {
        DebugLogger.log('REMITTANCE', 'Commission Not Eligible - RTO Status', {
            repairId: repair.id,
            status: repair.status
        });
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

    // Validate net amount is not negative
    if (result.breakdown.netAmount < 0) {
        console.warn('⚠️ Commission Calculation Warning: Negative net amount', {
            repairId: repair.id,
            repairTotal: result.breakdown.repairTotal,
            partsCost: result.breakdown.partsCost,
            deliveryExpenses: result.breakdown.deliveryExpenses,
            netAmount: result.breakdown.netAmount
        });
        result.breakdown.netAmount = 0;
    }

    result.amount = result.breakdown.netAmount * result.breakdown.commissionRate;

    // Ensure non-negative
    if (result.amount < 0) {
        result.amount = 0;
    }

    DebugLogger.log('REMITTANCE', 'Commission Calculated', {
        repairId: repair.id,
        customerName: repair.customerName,
        eligible: result.eligible,
        repairTotal: result.breakdown.repairTotal,
        partsCost: result.breakdown.partsCost,
        deliveryExpenses: result.breakdown.deliveryExpenses,
        netAmount: result.breakdown.netAmount,
        compensationType: result.breakdown.compensationType,
        commissionRate: result.breakdown.commissionRate,
        commissionAmount: result.amount
    });

    return result;
}

/**
 * Get all commission-eligible repairs for a tech on a date
 */
function getTechCommissionEligibleRepairs(techId, date) {
    // Convert date to local date string for comparison (no timezone issues)
    const targetDateString = date instanceof Date
        ? getLocalDateString(date)
        : date; // Already a string like "2025-12-31"

    const eligibleRepairs = [];

    window.allRepairs.forEach(repair => {
        // Check if commission already claimed
        if (repair.commissionClaimedBy) {
            return; // Skip - already claimed in a remittance
        }

        // Find the LAST verified payment that made this repair fully paid
        let lastVerifiedPaymentDate = null;
        let runningTotal = 0;
        const repairTotal = repair.total || 0;

        if (repair.payments) {
            // Sort payments by verification date
            const sortedPayments = [...repair.payments]
                .filter(p => p.verified)
                .sort((a, b) => new Date(a.verifiedAt || a.recordedDate) - new Date(b.verifiedAt || b.recordedDate));

            for (const payment of sortedPayments) {
                runningTotal += payment.amount;
                if (runningTotal >= repairTotal) {
                    // This payment made it fully paid
                    const paymentDate = new Date(payment.verifiedAt || payment.recordedDate);
                    lastVerifiedPaymentDate = getLocalDateString(paymentDate);
                    break;
                }
            }
        }

        // Only include commission on the date it became fully paid
        if (lastVerifiedPaymentDate === targetDateString) {
            const commission = calculateRepairCommission(repair, techId);

            if (commission.eligible && commission.amount > 0) {
                eligibleRepairs.push({
                    repair: repair,
                    commission: commission
                });
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

    const breakdown = eligibleRepairs.map(item => {
        // Find when it was fully paid
        let fullyPaidDate = null;
        let runningTotal = 0;
        const repairTotal = item.repair.total || 0;

        if (item.repair.payments) {
            const sortedPayments = [...item.repair.payments]
                .filter(p => p.verified)
                .sort((a, b) => new Date(a.verifiedAt || a.recordedDate) - new Date(b.verifiedAt || b.recordedDate));

            for (const payment of sortedPayments) {
                runningTotal += payment.amount;
                if (runningTotal >= repairTotal) {
                    fullyPaidDate = new Date(payment.verifiedAt || payment.recordedDate);
                    break;
                }
            }
        }

        return {
            repairId: item.repair.id,
            customerName: item.repair.customerName,
            deviceInfo: `${item.repair.brand} ${item.repair.model}`,
            repairType: item.repair.repairType || 'General Repair',
            repairTotal: item.commission.breakdown.repairTotal,
            partsCost: item.commission.breakdown.partsCost,
            deliveryExpenses: item.commission.breakdown.deliveryExpenses,
            netAmount: item.commission.breakdown.netAmount,
            commissionRate: item.commission.breakdown.commissionRate,
            commission: item.commission.amount,
            fullyPaidDate: fullyPaidDate ? fullyPaidDate.toISOString() : null
        };
    });

    const total = breakdown.reduce((sum, item) => sum + item.commission, 0);

    return { breakdown, total };
}

/**
 * Get ALL pending commission for a technician (any date) - for remittance submission
 */
function getAllPendingCommission(techId) {
    DebugLogger.log('REMITTANCE', 'Getting All Pending Commission', { techId: techId });

    const breakdown = [];

    window.allRepairs.forEach(repair => {
        // Check if commission NOT yet claimed
        if (repair.acceptedBy === techId &&
            repair.status === 'Claimed' &&
            !repair.commissionClaimedBy) {

            // Check if repair is fully paid
            const totalPaid = (repair.payments || [])
                .filter(p => p.verified)
                .reduce((sum, p) => sum + p.amount, 0);

            if (totalPaid >= (repair.total || 0)) {
                // Calculate commission
                const commission = calculateRepairCommission(repair, techId);

                if (commission.eligible && commission.amount > 0) {
                    // Find when it was fully paid (for date grouping)
                    let fullyPaidDate = null;
                    let runningTotal = 0;
                    const repairTotal = repair.total || 0;

                    if (repair.payments) {
                        const sortedPayments = [...repair.payments]
                            .filter(p => p.verified)
                            .sort((a, b) => new Date(a.verifiedAt || a.recordedDate) - new Date(b.verifiedAt || b.recordedDate));

                        for (const payment of sortedPayments) {
                            runningTotal += payment.amount;
                            if (runningTotal >= repairTotal) {
                                fullyPaidDate = new Date(payment.verifiedAt || payment.recordedDate);
                                break;
                            }
                        }
                    }

                    breakdown.push({
                        repairId: repair.id,
                        customerName: repair.customerName,
                        deviceInfo: `${repair.brand} ${repair.model}`,
                        repairType: repair.repairType || 'General Repair',
                        repairTotal: commission.breakdown.repairTotal,
                        partsCost: commission.breakdown.partsCost,
                        deliveryExpenses: commission.breakdown.deliveryExpenses,
                        netAmount: commission.breakdown.netAmount,
                        commission: commission.amount,
                        dateString: fullyPaidDate ? getLocalDateString(fullyPaidDate) : getLocalDateString(new Date())
                    });
                }
            }
        }
    });

    // Sort by date (oldest first)
    breakdown.sort((a, b) => {
        const dateA = new Date(a.dateString + 'T00:00:00');
        const dateB = new Date(b.dateString + 'T00:00:00');
        return dateA - dateB;
    });

    const total = breakdown.reduce((sum, item) => sum + item.commission, 0);

    DebugLogger.log('REMITTANCE', 'Pending Commission Calculated', {
        techId: techId,
        repairsWithCommission: breakdown.length,
        totalCommission: total,
        breakdown: breakdown.map(b => ({
            repairId: b.repairId,
            customerName: b.customerName,
            commission: b.commission
        }))
    });

    return { breakdown, total };
}

/**
 * Get technician's daily parts costs from repairs where they collected payments
 */
function getTechDailyPartsCosts(techId, date) {
    // Convert date to local date string for comparison
    const targetDateString = date instanceof Date
        ? getLocalDateString(date)
        : date; // Already a string like "2025-12-31"

    const repairs = [];
    let total = 0;

    window.allRepairs.forEach(repair => {
        // Only include repairs assigned to this technician (exclude deleted)
        if (!repair.deleted && repair.acceptedBy === techId && repair.payments) {
            // Check if tech collected any payment on this date
            const hasPaymentOnDate = repair.payments.some(payment => {
                // Only count verified payments collected by tech
                if (!payment.verified || payment.collectedByTech !== true) return false;

                const paymentDate = new Date(payment.recordedDate || payment.paymentDate);
                const paymentDateString = getLocalDateString(paymentDate);
                return paymentDateString === targetDateString;
            });

            // If tech collected payment on this date, include the repair's parts cost
            if (hasPaymentOnDate) {
                const partsCost = getRepairPartsCost(repair);
                if (partsCost > 0) {
                    repairs.push({
                        repairId: repair.id,
                        customerName: repair.customerName,
                        deviceInfo: `${repair.brand || ''} ${repair.model || ''}`.trim(),
                        partsCost: partsCost
                    });
                    total += partsCost;
                }
            }
        }
    });

    return { repairs, total };
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
 * Open Single-Day Remittance Modal
 * Called when technician selects a specific date to remit
 */
function openSingleDayRemittanceModal(dateString) {
    const techId = window.currentUser.uid;
    const today = new Date();
    const todayDateString = getLocalDateString(today);
    const isToday = dateString === todayDateString;

    // IMPORTANT: Hide/remove any existing remittance modal from HTML
    const existingHtmlModal = document.querySelector('#remittanceModal.modal');
    if (existingHtmlModal) {
        existingHtmlModal.style.display = 'none';
    }

    // Get data for this specific date
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, dateString);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, dateString);
    const { repairs: partsRepairs, total: partsCostsTotal } = getTechDailyPartsCosts(techId, dateString);

    // Commission: 40% of gross payments, expenses deducted from shop's 60%
    const commissionDeduction = paymentsTotal * 0.40;  // Tech keeps 40% of gross
    const shopShare = (paymentsTotal * 0.60) - partsCostsTotal - expensesTotal;  // Shop gets 60% minus costs
    const expectedAmount = shopShare;

    if (payments.length === 0 && expenses.length === 0) {
        alert('⚠️ No pending payments or expenses for this date.');
        return;
    }

    // Check if user has any older pending dates
    const pendingDates = getPendingRemittanceDates(techId);
    const olderPendingDates = pendingDates.filter(d => d.dateString < dateString);
    const hasOlderPending = olderPendingDates.length > 0;

    // Format date for display
    const displayDate = new Date(dateString + 'T00:00:00');
    const dateDisplay = isToday ? 'Today' : utils.formatDate(dateString);

    // Get eligible recipients (admin, manager, cashier) - case insensitive
    const eligibleRecipients = Object.values(window.allUsers || {})
        .filter(u => {
            if (!u || !u.role) return false;
            const role = (u.role || '').toLowerCase().trim();
            return ['admin', 'manager', 'cashier'].includes(role);
        });

    // Get or create modal (use unique ID for single-day remittance)
    let modal = document.getElementById('singleDayRemittanceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'singleDayRemittanceModal';
        modal.style.cssText = 'display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,0.4);overflow-y:auto;';
        document.body.appendChild(modal);
    }

    // Get or create modal content
    let modalContent = document.getElementById('singleDayRemittanceModalContent');
    if (!modalContent) {
        modalContent = document.createElement('div');
        modalContent.id = 'singleDayRemittanceModalContent';
        modalContent.style.cssText = 'background-color:#fefefe;margin:2% auto;padding:0;border:1px solid #888;width:90%;max-width:800px;border-radius:10px;';
        modal.appendChild(modalContent);
    }

    // Clear any previous content
    modalContent.innerHTML = '';

    let html = `
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="margin:0;color:#333;">💵 Remit ${dateDisplay}</h2>
                <button onclick="closeRemittanceModal()" style="background:none;border:none;font-size:28px;cursor:pointer;color:#999;">&times;</button>
            </div>
            
            <div style="background:#e3f2fd;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #2196f3;">
                <p style="margin:0;color:#1976d2;"><strong>📅 ${dateDisplay}</strong> - Single-day remittance submission</p>
            </div>
            
            ${hasOlderPending ? `
                <div style="background:#fff3cd;padding:12px;border-radius:8px;margin-bottom:15px;border-left:4px solid #ff9800;">
                    <strong>⚠️ Pending Older Dates</strong><br>
                    <small style="color:#666;">
                        You have ${olderPendingDates.length} older date(s) with pending remittance. 
                        Recommended: Remit in order (oldest first).
                    </small>
                </div>
            ` : ''}
            
            <!-- Payment Breakdown -->
            <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px;">
                <h3 style="margin-top:0;color:#333;">💰 Payment Breakdown</h3>
                <div style="background:white;padding:15px;border-radius:8px;border:1px solid #eee;">
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>💵 Gross Cash Collected:</span>
                        <strong>₱${paymentsTotal.toFixed(2)}</strong>
                    </div>
                    <hr style="border:none;border-top:1px dashed #ddd;margin:10px 0;">
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>👤 Your Commission (40% of gross):</span>
                        <strong style="color:#2196f3;">₱${commissionDeduction.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>🏦 Shop's Share (60% of gross):</span>
                        <strong>₱${(paymentsTotal * 0.60).toFixed(2)}</strong>
                    </div>
                    <hr style="border:none;border-top:1px solid #ddd;margin:10px 0;">
                    <div style="font-size:13px;color:#666;margin:10px 0;font-style:italic;">
                        Deductions from Shop's Share:
                    </div>
                    ${partsCostsTotal > 0 ? `
                        <div style="display:flex;justify-content:space-between;margin:10px 0;padding-left:15px;">
                            <span>🔧 Parts Costs</span>
                            <strong style="color:#f44336;">-₱${partsCostsTotal.toFixed(2)}</strong>
                        </div>
                    ` : ''}
                    ${expensesTotal > 0 ? `
                        <div style="display:flex;justify-content:space-between;margin:10px 0;padding-left:15px;">
                            <span>📦 Your Expenses</span>
                            <strong style="color:#f44336;">-₱${expensesTotal.toFixed(2)}</strong>
                        </div>
                    ` : ''}
                    <hr style="border:none;border-top:2px solid #ddd;margin:15px 0;">
                    <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;">
                        <span>💳 Amount to Remit:</span>
                        <span style="color:#4caf50;">₱${expectedAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <p style="margin-top:15px;font-size:13px;color:#666;background:#e8f5e9;padding:12px;border-radius:6px;border-left:4px solid #4caf50;">
                    ✓ <strong>Your 40% Commission (₱${commissionDeduction.toFixed(2)})</strong> is calculated from gross collections. 
                    Expenses are deducted from the shop's 60% share only.
                </p>
            </div>
            
            <!-- Payment Items -->
            ${payments.length > 0 ? `
                <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px;">
                    <h3 style="margin-top:0;color:#333;">📥 Payments (${payments.length} item${payments.length > 1 ? 's' : ''})</h3>
                    <div style="background:white;border-radius:8px;overflow:hidden;border:1px solid #eee;">
                        ${payments.map((p, idx) => `
                            <div style="padding:12px;border-bottom:${idx < payments.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;color:#333;">${p.customerName}</div>
                                    <div style="font-size:12px;color:#666;">Repair ID: ${p.repairId}</div>
                                </div>
                                <div style="text-align:right;font-weight:bold;color:#4caf50;">₱${p.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Expenses -->
            ${expenses.length > 0 ? `
                <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px;">
                    <h3 style="margin-top:0;color:#333;">📋 Expenses (${expenses.length} item${expenses.length > 1 ? 's' : ''})</h3>
                    <div style="background:white;border-radius:8px;overflow:hidden;border:1px solid #eee;">
                        ${expenses.map((e, idx) => `
                            <div style="padding:12px;border-bottom:${idx < expenses.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;color:#333;">${e.category || e.type}</div>
                                    <div style="font-size:12px;color:#666;">${e.description || '-'}</div>
                                </div>
                                <div style="text-align:right;font-weight:bold;color:#f44336;">-₱${e.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Remittance Entry -->
            <div style="background:#f0f7ff;padding:15px;border-radius:8px;border-left:4px solid #2196f3;margin-bottom:20px;">
                <h3 style="margin-top:0;color:#333;">💵 Submit Remittance</h3>
                
                ${commissionDeduction > 0 ? `
                <div style="background:#e8f5e9;padding:12px;border-radius:8px;margin-bottom:15px;border-left:3px solid #4caf50;">
                    <h4 style="margin:0 0 10px;color:#2e7d32;">💰 Your Commission: ₱${commissionDeduction.toFixed(2)}</h4>
                    <div class="form-group" style="margin:0;">
                        <label style="font-weight:bold;">How do you want to receive your commission? *</label>
                        <select id="commissionPaymentPreference" required style="width:100%;padding:10px;font-size:15px;border:1px solid #ddd;border-radius:5px;">
                            <option value="">-- Select payment method --</option>
                            <option value="cash">💵 Cash (Shop gives me cash at end of day)</option>
                            <option value="gcash">📱 GCash (Shop sends to my GCash account)</option>
                        </select>
                        <small style="color:#666;display:block;margin-top:5px;">
                            💡 This tells the shop how to pay your commission
                        </small>
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-bottom:15px;">
                    <label style="font-weight:bold;display:block;margin-bottom:8px;">Amount to Remit *</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:18px;">₱</span>
                        <input type="number" 
                               id="actualRemittanceAmount" 
                               value="${expectedAmount.toFixed(2)}" 
                               step="0.01" 
                               min="0"
                               style="flex:1;padding:10px;border:1px solid #ddd;border-radius:5px;font-size:16px;font-weight:bold;">
                    </div>
                    <small style="color:#666;margin-top:5px;display:block;">
                        Expected: ₱${expectedAmount.toFixed(2)} | If different, add note below
                    </small>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="font-weight:bold;display:block;margin-bottom:8px;">Who are you giving this to? *</label>
                    <select id="remittanceRecipient" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;">
                        <option value="">-- Select recipient --</option>
                    </select>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="font-weight:bold;display:block;margin-bottom:8px;">Notes (if amount differs)</label>
                    <textarea id="remittanceNotes" 
                              placeholder="Explain any discrepancy..." 
                              style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;min-height:60px;"></textarea>
                </div>
            </div>
            
            <!-- Store date info for confirmation -->
            <input type="hidden" id="remittanceDateString" value="${dateString}">
            <input type="hidden" id="remittanceExpectedAmount" value="${expectedAmount.toFixed(2)}">
            <input type="hidden" id="remittancePaymentsTotal" value="${paymentsTotal.toFixed(2)}">
            <input type="hidden" id="remittanceExpensesTotal" value="${expensesTotal.toFixed(2)}">
            <input type="hidden" id="remittanceCommissionDeduction" value="${commissionDeduction.toFixed(2)}">
            <input type="hidden" id="hasOlderPending" value="${hasOlderPending}">
            
            <!-- Action Buttons -->
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                <button onclick="closeRemittanceModal()" style="padding:12px 20px;background:#999;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">
                    Cancel
                </button>
                <button onclick="confirmSingleDayRemittance()" style="padding:12px 20px;background:#4caf50;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">
                    ✓ Submit Remittance
                </button>
            </div>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.style.display = 'block';

    // Populate recipient dropdown AFTER modal is visible (ensures DOM is ready)
    setTimeout(() => {
        console.log('🔍 Looking for remittanceRecipient dropdown in singleDayRemittanceModal...');
        console.log('🔍 Eligible recipients:', eligibleRecipients.length, eligibleRecipients);

        // Search within the specific modal to avoid conflicts with other modals
        const recipientSelect = modal.querySelector('#remittanceRecipient');
        console.log('🔍 Found select element:', recipientSelect);

        if (recipientSelect) {
            console.log('🔍 Current options count:', recipientSelect.options.length);

            // Clear existing options (keeps the first "-- Select recipient --" option)
            while (recipientSelect.options.length > 1) {
                recipientSelect.remove(1);
            }

            // Add eligible recipients
            eligibleRecipients.forEach(user => {
                console.log('➕ Adding option:', user.displayName, user.role, user.uid);
                const option = document.createElement('option');
                option.value = user.uid;
                option.textContent = `${user.displayName || user.name || 'Unknown'} (${user.role})`;
                recipientSelect.appendChild(option);
            });

            console.log('✅ Dropdown populated! Final options count:', recipientSelect.options.length);
        } else {
            console.error('❌ Could not find remittanceRecipient select element');
            alert('ERROR: Dropdown element not found! Check console.');
        }
    }, 100);
}

function closeRemittanceModal() {
    // Close both types of remittance modals
    const htmlModal = document.getElementById('remittanceModal');
    if (htmlModal) {
        htmlModal.style.display = 'none';
    }

    const dynamicModal = document.getElementById('singleDayRemittanceModal');
    if (dynamicModal) {
        dynamicModal.style.display = 'none';
    }
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

    // Get ALL pending data (not just today - includes historical items)
    const todayDateString = getLocalDateString(today);
    const { payments, total: paymentsTotal } = getAllPendingPayments(techId);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, todayDateString); // Expenses stay date-specific
    const { breakdown: commissionBreakdown, total: commissionTotal } = getAllPendingCommission(techId);

    // Calculate commission breakdown by payment method (Cash vs GCash)
    let cashCommission = 0;
    let gcashCommission = 0;
    let cashRepairCount = 0;
    let gcashRepairCount = 0;

    commissionBreakdown.forEach(c => {
        const repair = window.allRepairs.find(r => r.id === c.repairId);
        if (repair && repair.payments) {
            // Check if this repair has any GCash payment
            const hasGCashPayment = repair.payments.some(p => p.method === 'GCash');

            if (hasGCashPayment) {
                gcashCommission += c.commission;
                gcashRepairCount++;
            } else {
                cashCommission += c.commission;
                cashRepairCount++;
            }
        }
    });

    const totalCommission = cashCommission + gcashCommission;

    // Check if there are ANY items to remit (today or historical)
    const hasTodayItems = payments.length > 0 || expenses.length > 0 || commissionBreakdown.length > 0;

    // Check for historical pending payments
    let hasHistoricalPending = false;
    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach(payment => {
                if (payment.collectedByTech &&
                    payment.receivedById === techId &&
                    payment.remittanceStatus === 'pending' &&
                    !payment.techRemittanceId) {
                    hasHistoricalPending = true;
                }
            });
        }
    });

    // Check for unclaimed commissions
    let hasUnclaimedCommission = false;
    window.allRepairs.forEach(repair => {
        if (repair.acceptedBy === techId &&
            repair.status === 'Claimed' &&
            !repair.commissionClaimedBy) {
            const totalPaid = (repair.payments || [])
                .filter(p => p.verified)
                .reduce((sum, p) => sum + p.amount, 0);
            if (totalPaid >= repair.total) {
                hasUnclaimedCommission = true;
            }
        }
    });

    // Allow submission if ANY items exist
    if (!hasTodayItems && !hasHistoricalPending && !hasUnclaimedCommission) {
        alert('⚠️ No items to remit.\n\nYou have no pending payments, expenses, or commissions.');
        return;
    }

    // Show detailed info message if including historical items
    const paymentsByDate = {};
    payments.forEach(p => {
        const dateStr = p.dateString;
        if (!paymentsByDate[dateStr]) {
            paymentsByDate[dateStr] = { count: 0, total: 0 };
        }
        paymentsByDate[dateStr].count++;
        paymentsByDate[dateStr].total += p.amount;
    });

    const dates = Object.keys(paymentsByDate).sort();
    const todayDateStr = getLocalDateString(today);
    const historicalDates = dates.filter(d => d !== todayDateStr);

    if (historicalDates.length > 0) {
        let message = '💡 Including Historical Payments\n\n';
        message += 'Your remittance will include:\n\n';

        dates.forEach(dateStr => {
            const isToday = dateStr === todayDateStr;
            const data = paymentsByDate[dateStr];
            message += `${isToday ? '📅 Today' : '⚠️ ' + utils.formatDate(dateStr)}: ${data.count} payment(s) = ₱${data.total.toFixed(2)}\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `TOTAL: ${payments.length} payment(s) = ₱${paymentsTotal.toFixed(2)}\n\n`;
        message += 'All pending items will be submitted together in one remittance.';

        alert(message);
    }

    // CORRECT CALCULATION: 60/40 split on gross payments, expenses from shop's share
    // Tech keeps: 40% of gross payments as commission
    // Shop gets: 60% of gross payments - expenses
    // Tech remits: Shop's share (60% - expenses)
    const commissionDeduction = paymentsTotal * 0.40;  // Tech keeps 40% of gross
    const shopShare = (paymentsTotal * 0.60) - expensesTotal;  // Shop gets 60% minus expenses
    const expectedAmount = shopShare;

    // Build summary
    let summary = `
        ${totalCommission > 0 ? `
            <div class="card" style="background:#e8f5e9;margin:20px 0;border-left:4px solid #4caf50;">
                <h3>💰 Your Commission Today</h3>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;">
                    ${cashCommission > 0 ? `
                        <div style="background:white;padding:15px;border-radius:8px;border-left:4px solid #2196f3;">
                            <div style="font-size:12px;color:#666;">From Cash Repairs</div>
                            <div style="font-size:24px;font-weight:600;color:#2196f3;">₱${cashCommission.toFixed(2)}</div>
                            <div style="font-size:11px;color:#999;">${cashRepairCount} repair(s)</div>
                        </div>
                    ` : ''}
                    ${gcashCommission > 0 ? `
                        <div style="background:white;padding:15px;border-radius:8px;border-left:4px solid #00bcd4;">
                            <div style="font-size:12px;color:#666;">From GCash Repairs</div>
                            <div style="font-size:24px;font-weight:600;color:#00bcd4;">₱${gcashCommission.toFixed(2)}</div>
                            <div style="font-size:11px;color:#999;">${gcashRepairCount} repair(s)</div>
                        </div>
                    ` : ''}
                </div>
                
                <div style="background:#4caf50;color:white;padding:15px;border-radius:8px;text-align:center;">
                    <div style="font-size:14px;opacity:0.9;">Total Commission Earned</div>
                    <div style="font-size:32px;font-weight:bold;">₱${totalCommission.toFixed(2)}</div>
                </div>
                
                <div class="form-group" style="margin-top:20px;">
                    <label style="font-weight:bold;">How do you want to receive your commission? *</label>
                    <select id="commissionPaymentPreference" required style="width:100%;padding:12px;font-size:15px;">
                        <option value="">-- Select payment method --</option>
                        <option value="cash">💵 Cash (Shop gives me cash at end of day)</option>
                        <option value="gcash">📱 GCash (Shop sends to my GCash account)</option>
                    </select>
                    <small style="color:#666;display:block;margin-top:8px;">
                        💡 This preference tells the shop how to pay your commission
                    </small>
                </div>
            </div>
        ` : ''}
        
        <div class="card" style="margin:20px 0;">
            <h3>💵 Cash Remittance</h3>
            <p style="color:#666;font-size:14px;margin-bottom:15px;">Cash you physically collected - must be remitted</p>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin:10px 0;">
                    <span>💵 Gross Cash Collected:</span>
                    <strong>₱${paymentsTotal.toFixed(2)}</strong>
                </div>
                <hr style="border:none;border-top:1px dashed #ddd;margin:10px 0;">
                <div style="display:flex;justify-content:space-between;margin:10px 0;">
                    <span>👤 Your Commission (40% of gross):</span>
                    <strong style="color:#2196f3;">₱${(paymentsTotal * 0.40).toFixed(2)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin:10px 0;">
                    <span>🏦 Shop's Share (60% of gross):</span>
                    <strong>₱${(paymentsTotal * 0.60).toFixed(2)}</strong>
                </div>
                ${expensesTotal > 0 ? `
                    <hr style="border:none;border-top:1px solid #ddd;margin:10px 0;">
                    <div style="font-size:13px;color:#666;margin:10px 0;font-style:italic;">
                        Deductions from Shop's Share:
                    </div>
                    <div style="display:flex;justify-content:space-between;margin:10px 0;padding-left:15px;">
                        <span>📦 Your Expenses</span>
                        <strong style="color:#f44336;">-₱${expensesTotal.toFixed(2)}</strong>
                    </div>
                ` : ''}
                <hr style="border:none;border-top:2px solid #ddd;margin:15px 0;">
                <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;">
                    <span>💳 Amount to Remit:</span>
                    <span style="color:#4caf50;">₱${expectedAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <p style="margin-top:15px;font-size:13px;color:#666;background:#e8f5e9;padding:12px;border-radius:6px;border-left:4px solid #4caf50;">
                ✓ <strong>Your 40% Commission (₱${(paymentsTotal * 0.40).toFixed(2)})</strong> is calculated from gross collections. 
                Expenses are deducted from the shop's 60% share only.
            </p>
        </div>
        
        ${payments.length > 0 ? `
            <div class="card" style="margin:20px 0;">
                <h3>📥 Cash Payments Breakdown (${payments.length} payment${payments.length > 1 ? 's' : ''})</h3>
                ${(() => {
                // Group payments by date
                const paymentsByDate = {};
                payments.forEach(p => {
                    const dateStr = p.dateString;
                    if (!paymentsByDate[dateStr]) {
                        paymentsByDate[dateStr] = [];
                    }
                    paymentsByDate[dateStr].push(p);
                });

                // Check if there are multiple dates
                const dates = Object.keys(paymentsByDate).sort();
                const hasMultipleDates = dates.length > 1;
                const todayStrModal = todayDateString; // Use the variable from parent scope

                // Show warning if historical items included
                let html = '';
                if (hasMultipleDates) {
                    const historicalDates = dates.filter(d => d !== todayStrModal);
                    if (historicalDates.length > 0) {
                        html += `
                                <div style="background:#fff3cd;padding:12px;border-radius:8px;margin-bottom:15px;border-left:4px solid #ff9800;">
                                    <strong>⚠️ Including Historical Items</strong><br>
                                    <small style="color:#666;">
                                        This remittance includes payments from ${historicalDates.length} previous date(s).
                                        All pending items will be submitted together.
                                    </small>
                                </div>
                            `;
                    }
                }

                // Display grouped by date
                html += dates.map(dateStr => {
                    const datePayments = paymentsByDate[dateStr];
                    const dateTotal = datePayments.reduce((sum, p) => sum + p.amount, 0);
                    const isToday = dateStr === todayStrModal;

                    return `
                            <div style="margin:15px 0;padding:15px;background:${isToday ? '#e3f2fd' : '#fff3cd'};border-radius:8px;border-left:4px solid ${isToday ? '#2196f3' : '#ff9800'};">
                                <h4 style="margin:0 0 10px 0;color:#333;">
                                    ${isToday ? '📅 Today' : '⚠️ Previous Date'}: ${utils.formatDate(dateStr)}
                                </h4>
                                <div class="remittance-list">
                                    ${datePayments.map(p => `
                                        <div class="remittance-item" style="background:white;padding:8px;border-radius:4px;margin:5px 0;">
                                            <span>${p.customerName}</span>
                                            <span style="font-weight:600;color:#4caf50;">₱${p.amount.toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div style="text-align:right;margin-top:10px;padding-top:10px;border-top:2px solid rgba(0,0,0,0.1);">
                                    <strong>Subtotal: ₱${dateTotal.toFixed(2)}</strong>
                                </div>
                            </div>
                        `;
                }).join('');

                return html;
            })()}
            </div>
        ` : ''}
        
        ${expenses.length > 0 ? `
            <div class="remittance-summary-section">
                <h4>💸 Expenses (${expenses.length})</h4>
                <div class="remittance-list">
                    ${expenses.map(e => `
                        <div class="remittance-item">
                            <span>${e.description}</span>
                            <span>-₱${e.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    document.getElementById('remittanceSummary').innerHTML = summary;
    document.getElementById('actualRemittanceAmount').value = expectedAmount.toFixed(2);
    document.getElementById('remittanceNotes').value = '';

    // Populate recipient dropdown
    const recipientSelect = document.getElementById('remittanceRecipient');
    recipientSelect.innerHTML = '<option value="">-- Select who will receive the cash --</option>';

    // Get list of available cashiers, managers, and admins (excluding current user)
    const recipients = Object.values(window.allUsers || {})
        .filter(u => ['admin', 'manager', 'cashier'].includes(u.role) && u.uid !== window.currentUser.uid)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

    recipients.forEach(user => {
        const option = document.createElement('option');
        option.value = user.uid;
        option.textContent = `${user.displayName} (${user.role})`;
        recipientSelect.appendChild(option);
    });

    document.getElementById('remittanceModal').style.display = 'block';
}

/**
 * Confirm and Submit Remittance
 */
async function confirmRemittance() {
    const techId = window.currentUser.uid;
    const today = new Date();
    const todayDateString = getLocalDateString(today);

    DebugLogger.log('REMITTANCE', 'Remittance Submission Initiated', {
        techId: techId,
        techName: window.currentUserData.displayName,
        date: todayDateString
    });

    // Get the HTML modal to read values from the correct elements
    const modal = document.getElementById('remittanceModal');
    if (!modal) {
        DebugLogger.log('ERROR', 'Remittance Modal Not Found', {});
        alert('Modal not found');
        return;
    }

    const actualAmount = parseFloat(modal.querySelector('#actualRemittanceAmount').value);
    const notes = modal.querySelector('#remittanceNotes').value.trim();
    const recipientId = modal.querySelector('#remittanceRecipient').value;

    DebugLogger.log('REMITTANCE', 'Remittance Form Data Captured', {
        actualAmount: actualAmount,
        recipientId: recipientId,
        hasNotes: notes.length > 0
    });

    // Validate recipient selection
    if (!recipientId) {
        alert('⚠️ Please select who you are giving this money to');
        return;
    }

    const recipient = window.allUsers[recipientId];
    if (!recipient) {
        alert('⚠️ Selected recipient not found');
        return;
    }

    // Validate recipient role
    if (!['admin', 'manager', 'cashier'].includes(recipient.role)) {
        alert('⚠️ Invalid recipient role. Must be admin, manager, or cashier.');
        return;
    }

    // Get commission payment preference
    const commissionPreferenceSelect = modal.querySelector('#commissionPaymentPreference');
    const commissionPaymentPreference = commissionPreferenceSelect ? commissionPreferenceSelect.value : '';

    // Get manual override fields
    const hasManualOverride = modal.querySelector('#hasManualCommission').checked;
    const manualCommission = hasManualOverride ? parseFloat(modal.querySelector('#manualCommissionAmount').value) : null;
    const overrideReason = hasManualOverride ? modal.querySelector('#manualCommissionReason').value.trim() : '';

    if (isNaN(actualAmount) || actualAmount < 0) {
        alert('Please enter a valid remittance amount');
        return;
    }

    // Validate manual commission if entered
    if (hasManualOverride && (isNaN(manualCommission) || manualCommission < 0)) {
        alert('Please enter a valid manual commission amount');
        return;
    }

    // Re-fetch pending adjustment from Firebase to verify not cleared by admin
    let pendingAdjustment = null;
    let adjustmentAmount = 0;
    try {
        const techRef = db.ref(`users/${techId}`);
        const snapshot = await techRef.once('value');
        const techData = snapshot.val();
        pendingAdjustment = techData.pendingCommissionAdjustment;
        adjustmentAmount = pendingAdjustment ? (pendingAdjustment.totalAmount || 0) : 0;

        DebugLogger.log('REMITTANCE', 'Pending Adjustment Verified', {
            hasPendingAdjustment: !!pendingAdjustment,
            adjustmentAmount: adjustmentAmount
        });
    } catch (error) {
        console.warn('Could not fetch pending adjustment:', error);
    }

    // Use the same functions as openRemittanceModal - get ALL pending items
    const { payments, total: paymentsTotal } = getAllPendingPayments(techId);
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, todayDateString); // Expenses stay date-specific
    const { breakdown: commissionBreakdown, total: commissionTotal } = getAllPendingCommission(techId);

    DebugLogger.log('REMITTANCE', 'Remittance Calculations', {
        paymentsCount: payments.length,
        paymentsTotal: paymentsTotal,
        expensesCount: expenses.length,
        expensesTotal: expensesTotal,
        commissionBreakdownCount: commissionBreakdown.length,
        commissionTotal: commissionTotal,
        pendingAdjustment: adjustmentAmount
    });

    // Calculate commission breakdown by payment method
    let cashCommission = 0;
    let gcashCommission = 0;

    commissionBreakdown.forEach(c => {
        const repair = window.allRepairs.find(r => r.id === c.repairId);
        if (repair && repair.payments) {
            const hasGCashPayment = repair.payments.some(p => p.method === 'GCash');
            if (hasGCashPayment) {
                gcashCommission += c.commission;
            } else {
                cashCommission += c.commission;
            }
        }
    });

    const totalCommission = cashCommission + gcashCommission;

    // Validate commission payment preference if there's commission
    if (totalCommission > 0 && !commissionPaymentPreference) {
        alert('⚠️ Please select how you want to receive your commission');
        return;
    }

    // CORRECT CALCULATION: 60/40 split on GROSS payments, expenses from shop's share
    // Tech keeps: 40% of gross payments as commission
    // Shop gets: 60% of gross payments - expenses
    // Tech remits: Shop's share + any pending adjustment
    const technicianShare = paymentsTotal * 0.40;  // Technician keeps 40% of gross
    const shopShare = (paymentsTotal * 0.60) - expensesTotal;  // Shop gets 60% minus expenses
    const baseExpected = shopShare; // Base expected before adjustment
    const expectedAmount = baseExpected + adjustmentAmount; // Add/subtract pending adjustment
    const discrepancy = actualAmount - expectedAmount;

    DebugLogger.log('REMITTANCE', 'Remittance Amount Calculation', {
        paymentsTotal: paymentsTotal,
        expensesTotal: expensesTotal,
        technicianShare: technicianShare,  // 40% of gross
        shopShareBeforeExpenses: paymentsTotal * 0.60,  // 60% of gross
        shopShare: shopShare,  // 60% minus expenses
        commissionTotal: totalCommission,  // Should match technicianShare if using standard rates
        baseExpected: baseExpected,
        pendingAdjustment: adjustmentAmount,
        expectedAmount: expectedAmount,
        actualAmount: actualAmount,
        discrepancy: discrepancy,
        discrepancyPercent: expectedAmount > 0 ? ((discrepancy / expectedAmount) * 100).toFixed(2) + '%' : '0%'
    });

    // Require notes if there's a discrepancy
    if (Math.abs(discrepancy) > 0.01 && !notes) {
        alert('Please provide a note explaining the discrepancy');
        return;
    }

    let confirmMessage = `Submit remittance of ₱${actualAmount.toFixed(2)}?`;
    if (commissionTotal > 0) {
        confirmMessage += `\n\nCommission: ₱${commissionTotal.toFixed(2)}`;
    }
    if (adjustmentAmount !== 0) {
        confirmMessage += `\n\nPending Adjustment: ${adjustmentAmount >= 0 ? '+' : ''}₱${adjustmentAmount.toFixed(2)}`;
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
            // Recipient tracking
            submittedTo: recipientId,
            submittedToName: recipient.displayName,
            submittedToRole: recipient.role,
            // Payments
            paymentIds: payments.map(p => `${p.repairId}_${p.paymentIndex}`),
            totalPaymentsCollected: paymentsTotal,
            paymentsList: payments.map(p => ({
                repairId: p.repairId,
                customerName: p.customerName,
                amount: p.amount,
                method: p.method
            })),
            // Commission (NEW: breakdown by payment method)
            commissionEarned: totalCommission,
            cashCommission: cashCommission,
            gcashCommission: gcashCommission,
            totalCommission: totalCommission,
            commissionPaymentPreference: commissionPaymentPreference,
            commissionBreakdown: commissionBreakdown,
            hasManualOverride: hasManualOverride,
            manualCommission: manualCommission,
            overrideReason: overrideReason,
            finalApprovedCommission: hasManualOverride ? null : totalCommission,
            // Pending adjustment applied
            appliedAdjustment: pendingAdjustment ? {
                totalAmount: adjustmentAmount,
                adjustments: pendingAdjustment.adjustments,
                appliedAt: new Date().toISOString()
            } : null,
            // Expenses
            expenseIds: expenses.map(e => e.id),
            totalExpenses: expensesTotal,
            expensesList: expenses.map(e => ({
                category: e.category,
                amount: e.amount,
                description: e.description
            })),
            // Calculation (NEW: no commission deduction)
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

        DebugLogger.log('FIREBASE', 'Remittance Saved to Firebase', {
            remittanceId: remittanceId,
            status: remittanceStatus,
            actualAmount: actualAmount,
            expectedAmount: expectedAmount,
            discrepancy: discrepancy,
            paymentsCount: payments.length,
            expensesCount: expenses.length,
            submittedToName: recipient.displayName
        });

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

        // Clear pending adjustment and update notifications if adjustment was applied
        if (pendingAdjustment) {
            // Clear pending adjustment
            await db.ref(`users/${techId}/pendingCommissionAdjustment`).set(null);

            // Update notifications to mark as applied
            const notificationsRef = db.ref(`users/${techId}/notifications`);
            const notifSnapshot = await notificationsRef.once('value');
            const notifUpdates = {};

            notifSnapshot.forEach(child => {
                const notif = child.val();
                if (notif.type === 'commission_adjustment' && !notif.appliedToRemittance) {
                    notifUpdates[child.key] = {
                        ...notif,
                        appliedToRemittance: remittanceId,
                        appliedAt: new Date().toISOString()
                    };
                }
            });

            if (Object.keys(notifUpdates).length > 0) {
                await notificationsRef.update(notifUpdates);

                DebugLogger.log('REMITTANCE', 'Pending Adjustment Cleared', {
                    adjustmentAmount: adjustmentAmount,
                    notificationsUpdated: Object.keys(notifUpdates).length
                });
            }
        }

        // Log remittance submission
        await logActivity('remittance_submitted', {
            remittanceId: remittanceId,
            submittedBy: window.currentUserData.displayName,
            submittedTo: recipient.displayName,
            paymentsCollected: paymentsTotal,
            expenses: expensesTotal,
            expectedAmount: expectedAmount,
            actualAmount: actualAmount,
            discrepancy: discrepancy
        }, `${window.currentUserData.displayName} submitted remittance of ₱${actualAmount.toFixed(2)} to ${recipient.displayName}${Math.abs(discrepancy) > 0.01 ? ` (discrepancy: ₱${discrepancy.toFixed(2)})` : ''}`);

        // Reload data
        await loadTechRemittances();
        await loadTechExpenses();

        utils.showLoading(false);
        alert(`✅ Remittance submitted!\n\n💰 Amount: ₱${actualAmount.toFixed(2)}\n👤 Submitted to: ${recipient.displayName}\n\n⏳ Track verification status in Daily Remittance tab (check badge for updates).`);
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

/**
 * Confirm and Submit Single-Day Remittance
 */
async function confirmSingleDayRemittance() {
    const techId = window.currentUser.uid;
    const today = new Date();
    const todayDateString = getLocalDateString(today);

    // Get the modal to read values from the correct elements
    const modal = document.getElementById('singleDayRemittanceModal');
    if (!modal) {
        alert('Modal not found');
        return;
    }

    // Get values from modal - use querySelector to get elements from THIS modal
    const dateString = modal.querySelector('#remittanceDateString').value;
    const actualAmount = parseFloat(modal.querySelector('#actualRemittanceAmount').value);
    const notes = modal.querySelector('#remittanceNotes').value.trim();
    const recipientId = modal.querySelector('#remittanceRecipient').value;
    const expectedAmount = parseFloat(modal.querySelector('#remittanceExpectedAmount').value);
    const paymentsTotal = parseFloat(modal.querySelector('#remittancePaymentsTotal').value);
    const expensesTotal = parseFloat(modal.querySelector('#remittanceExpensesTotal').value);
    const commissionDeduction = parseFloat(modal.querySelector('#remittanceCommissionDeduction').value);
    const hasOlderPending = modal.querySelector('#hasOlderPending').value === 'true';
    const isToday = dateString === todayDateString;

    // Get commission payment preference if commission exists
    const commissionPaymentPreferenceSelect = modal.querySelector('#commissionPaymentPreference');
    const commissionPaymentPreference = commissionPaymentPreferenceSelect ? commissionPaymentPreferenceSelect.value : '';

    // Validate
    if (!recipientId) {
        alert('⚠️ Please select who you are giving this money to');
        return;
    }

    // Validate commission payment preference if there's commission
    if (commissionDeduction > 0 && !commissionPaymentPreference) {
        alert('⚠️ Please select how you want to receive your commission');
        return;
    }

    if (isNaN(actualAmount) || actualAmount < 0) {
        alert('Please enter a valid remittance amount');
        return;
    }

    const discrepancy = actualAmount - expectedAmount;
    if (Math.abs(discrepancy) > 0.01 && !notes) {
        alert('Please provide a note explaining the discrepancy');
        return;
    }

    const recipient = window.allUsers[recipientId];
    if (!recipient) {
        alert('⚠️ Selected recipient not found');
        return;
    }

    // Check for multi-day prompt only if TODAY and there are older pending dates
    if (isToday && hasOlderPending) {
        const pendingDates = getPendingRemittanceDates(techId);
        const olderPendingDates = pendingDates.filter(d => d.dateString < dateString);

        if (olderPendingDates.length > 0) {
            const olderDatesStr = olderPendingDates.map(d => utils.formatDate(d.dateString)).join(', ');
            const olderTotal = olderPendingDates.reduce((sum, d) => sum + d.unremittedBalance, 0);
            const combinedTotal = actualAmount + olderTotal;

            const message = `You have pending remittance from: ${olderDatesStr}\n\n` +
                `Today only: ₱${actualAmount.toFixed(2)}\n` +
                `All pending + today: ₱${combinedTotal.toFixed(2)}\n\n` +
                `Do you want to:\n` +
                `1. Remit TODAY ONLY (₱${actualAmount.toFixed(2)})\n` +
                `2. CATCH UP all pending + today (₱${combinedTotal.toFixed(2)})`;

            const choice = confirm(message + '\n\n(OK = Catch up all, CANCEL = Today only)');

            if (choice) {
                // Catch up all pending dates
                await submitMultipleDayRemittance(recipientId, recipient, notes);
                return;
            }
        }
    }

    // Proceed with single-day submission
    try {
        utils.showLoading(true);

        // Get payments for this specific date
        const { payments, total: paymentsCheckTotal } = getTechDailyPayments(techId, dateString);
        const { expenses, total: expensesCheckTotal } = getTechDailyExpenses(techId, dateString);
        const { repairs: partsRepairs, total: partsCostsTotal } = getTechDailyPartsCosts(techId, dateString);

        // Create remittance record for this specific date
        const remittanceDate = new Date(dateString + 'T00:00:00');
        const remittanceId = `rem_${techId}_${dateString.replace(/-/g, '')}_${Date.now()}`;

        const remittance = {
            id: remittanceId,
            techId: techId,
            techName: window.currentUserData.displayName,
            date: remittanceDate.toISOString(),
            dateString: dateString,
            // Recipient tracking
            submittedTo: recipientId,
            submittedToName: recipient.displayName,
            submittedToRole: recipient.role,
            // Payments
            paymentIds: payments.map(p => `${p.repairId}_${p.paymentIndex}`),
            totalPaymentsCollected: paymentsTotal,
            paymentsList: payments.map(p => ({
                repairId: p.repairId,
                customerName: p.customerName,
                amount: p.amount,
                method: p.method
            })),
            // Parts Costs
            totalPartsCosts: partsCostsTotal,
            partsRepairs: partsRepairs.map(p => ({
                repairId: p.repairId,
                customerName: p.customerName,
                deviceInfo: p.deviceInfo,
                partsCost: p.partsCost
            })),
            // Commission
            commissionDeduction: commissionDeduction,
            commissionPaymentPreference: commissionPaymentPreference || null,
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
            // Status
            status: 'pending',
            submittedAt: new Date().toISOString(),
            discrepancyReason: notes || '',
            // For single-day tracking
            singleDaySubmission: true
        };

        // Save to Firebase Realtime Database
        await db.ref(`techRemittances/${remittanceId}`).set(remittance);

        // Update all payments to mark as remitted and link to this remittance
        const updates = {};
        payments.forEach(payment => {
            const repair = window.allRepairs.find(r => r.id === payment.repairId);
            if (repair && repair.payments && repair.payments[payment.paymentIndex]) {
                // Update payment status
                repair.payments[payment.paymentIndex].remittanceStatus = 'remitted';
                repair.payments[payment.paymentIndex].techRemittanceId = remittanceId;

                // Prepare Firebase update
                updates[`repairs/${repair.id}/payments`] = repair.payments;
            }
        });

        // Update expenses to link to this remittance
        expenses.forEach(expense => {
            updates[`techExpenses/${expense.id}/remittanceId`] = remittanceId;
        });

        // Apply all updates
        await db.ref().update(updates);

        // Reload data
        await loadRepairs();
        await loadTechRemittances();
        await loadTechExpenses();

        utils.showLoading(false);

        // Show success with visual confirmation
        alert(`✅ Remittance submitted for ${utils.formatDate(dateString)}!\n\n💰 Amount: ₱${actualAmount.toFixed(2)}\n👤 Submitted to: ${recipient.displayName}`);
        closeRemittanceModal();

        // Remove this date from the pending list in real-time
        removeRemittedDateFromUI(dateString);

        // Refresh current tab
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error submitting single-day remittance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Mark commission as received by technician
 */
async function markCommissionReceived(remittanceId) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        alert('Remittance not found');
        return;
    }

    // Verify it's the technician's own remittance
    if (remittance.techId !== window.currentUser.uid) {
        alert('⚠️ You can only mark your own commissions as received');
        return;
    }

    // Check if already marked as paid
    if (remittance.commissionPaid) {
        alert('ℹ️ This commission is already marked as received');
        return;
    }

    // Ask for optional notes and discrepancy report
    const reportDiscrepancy = confirm(
        `Mark commission as received?\n\n` +
        `Amount: ₱${remittance.totalCommission.toFixed(2)}\n` +
        `Payment Method: ${remittance.commissionPaymentPreference}\n\n` +
        `Click OK to confirm, or Cancel to report a discrepancy.`
    );

    let notes = '';
    let hasDiscrepancy = !reportDiscrepancy;

    if (hasDiscrepancy) {
        notes = prompt(
            '⚠️ Report Commission Discrepancy\n\n' +
            'Please describe the discrepancy (minimum 10 characters):'
        );

        if (!notes || notes.trim().length < 10) {
            alert('Please provide a detailed explanation (at least 10 characters)');
            return;
        }
    } else {
        notes = prompt(
            'Commission Receipt Confirmation\n\n' +
            'Optional: Add any notes about this commission payment:'
        ) || '';
    }

    try {
        utils.showLoading(true);

        const updateData = {
            commissionPaid: true,
            commissionPaidAt: new Date().toISOString(),
            commissionPaidConfirmedBy: window.currentUserData.displayName,
            commissionReceivedNotes: notes.trim(),
            hasCommissionDiscrepancy: hasDiscrepancy
        };

        await db.ref(`techRemittances/${remittanceId}`).update(updateData);

        // If there's a discrepancy, create a modification request
        if (hasDiscrepancy) {
            await db.ref('modificationRequests').push({
                requestType: 'commission_discrepancy',
                remittanceId: remittanceId,
                requestedBy: window.currentUser.uid,
                requestedByName: window.currentUserData.displayName,
                reason: notes.trim(),
                status: 'pending',
                requestedAt: new Date().toISOString(),
                commissionAmount: remittance.totalCommission,
                verifiedBy: remittance.verifiedBy
            });

            alert('✅ Commission discrepancy reported!\n\nAdmin will review your report.');
        } else {
            alert('✅ Commission marked as received!');
        }

        utils.showLoading(false);

        // Refresh tab
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        console.error('Error marking commission received:', error);
        alert('Error: ' + error.message);
    }
}

window.markCommissionReceived = markCommissionReceived;

/**
 * Mark rejected remittance as manually resolved (Admin/Cashier only)
 */
async function markRemittanceAsResolved(remittanceId) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        alert('Remittance not found');
        return;
    }

    // Check if user has permission (admin, cashier, or manager)
    const userRole = window.currentUserData.role;
    if (!['admin', 'cashier', 'manager'].includes(userRole)) {
        alert('⚠️ Only admin, cashier, or manager can mark remittances as resolved');
        return;
    }

    // Check if already resolved
    if (remittance.manuallyResolved) {
        alert('ℹ️ This remittance is already marked as resolved');
        return;
    }

    // Check if it's rejected
    if (remittance.status !== 'rejected') {
        alert('⚠️ Only rejected remittances can be marked as resolved');
        return;
    }

    // Ask for resolution notes
    const notes = prompt(
        'Mark Remittance as Resolved\n\n' +
        `Tech: ${remittance.techName}\n` +
        `Date: ${utils.formatDate(remittance.date)}\n` +
        `Amount: ₱${remittance.actualAmount.toFixed(2)}\n\n` +
        'Please explain how this was resolved (minimum 10 characters):'
    );

    if (!notes || notes.trim().length < 10) {
        alert('Please provide a detailed explanation (at least 10 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        const updateData = {
            manuallyResolved: true,
            resolvedBy: window.currentUserData.displayName,
            resolvedById: window.currentUser.uid,
            resolvedAt: new Date().toISOString(),
            resolutionNotes: notes.trim()
        };

        await db.ref(`techRemittances/${remittanceId}`).update(updateData);

        alert('✅ Remittance marked as resolved!');

        utils.showLoading(false);

        // Refresh tab
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        console.error('Error marking remittance as resolved:', error);
        alert('Error: ' + error.message);
    }
}

window.markRemittanceAsResolved = markRemittanceAsResolved;

/**
 * Mark rejected remittance as manually resolved (Admin/Cashier only)
 */
async function markRemittanceAsResolved(remittanceId) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        alert('Remittance not found');
        return;
    }

    // Check if user has permission (admin, cashier, or manager)
    const userRole = window.currentUserData.role;
    if (!['admin', 'cashier', 'manager'].includes(userRole)) {
        alert('⚠️ Only admin, cashier, or manager can mark remittances as resolved');
        return;
    }

    // Check if already resolved
    if (remittance.manuallyResolved) {
        alert('ℹ️ This remittance is already marked as resolved');
        return;
    }

    // Check if it's rejected
    if (remittance.status !== 'rejected') {
        alert('⚠️ Only rejected remittances can be marked as resolved');
        return;
    }

    // Ask for resolution notes
    const notes = prompt(
        'Mark Remittance as Resolved\n\n' +
        `Tech: ${remittance.techName}\n` +
        `Date: ${utils.formatDate(remittance.date)}\n` +
        `Amount: ₱${remittance.actualAmount.toFixed(2)}\n\n` +
        'Please explain how this was resolved (minimum 10 characters):'
    );

    if (!notes || notes.trim().length < 10) {
        alert('Please provide a detailed explanation (at least 10 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        const updateData = {
            manuallyResolved: true,
            resolvedBy: window.currentUserData.displayName,
            resolvedById: window.currentUser.uid,
            resolvedAt: new Date().toISOString(),
            resolutionNotes: notes.trim()
        };

        await db.ref(`techRemittances/${remittanceId}`).update(updateData);

        alert('✅ Remittance marked as resolved!');

        utils.showLoading(false);

        // Refresh tab
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        console.error('Error marking remittance as resolved:', error);
        alert('Error: ' + error.message);
    }
}

window.markRemittanceAsResolved = markRemittanceAsResolved;

/**
 * Submit multiple day remittance (catch-up)
 */
async function submitMultipleDayRemittance(recipientId, recipient, notes) {
    const techId = window.currentUser.uid;

    try {
        utils.showLoading(true);

        const pendingDates = getPendingRemittanceDates(techId);
        if (pendingDates.length === 0) {
            alert('No pending remittances found');
            utils.showLoading(false);
            return;
        }

        let totalPayments = 0;
        let totalExpenses = 0;
        let totalCommission = 0;
        const allPaymentIds = [];
        const allExpenseIds = [];
        const paymentsList = [];
        const expensesList = [];

        // Aggregate all pending dates
        pendingDates.forEach(dateData => {
            totalPayments += dateData.totalPayments;
            totalExpenses += dateData.totalExpenses;
            totalCommission += dateData.totalCommission;

            dateData.payments.forEach(p => {
                allPaymentIds.push(`${p.repairId}_${p.paymentIndex}`);
                paymentsList.push({
                    repairId: p.repairId,
                    customerName: p.customerName,
                    amount: p.amount,
                    method: p.method,
                    date: dateData.dateString
                });
            });

            dateData.expenses.forEach(e => {
                allExpenseIds.push(e.id);
                expensesList.push({
                    category: e.category,
                    amount: e.amount,
                    description: e.description,
                    date: dateData.dateString
                });
            });
        });

        // Correct calculation: Shop's 60% minus expenses
        const shopShare = (totalPayments * 0.60) - totalExpenses;
        const expectedRemittance = shopShare;

        // Confirm with user
        const confirmMsg = `Catch-up Remittance:\n\n` +
            `Dates: ${pendingDates.map(d => utils.formatDate(d.dateString)).join(', ')}\n` +
            `Payments: ₱${totalPayments.toFixed(2)}\n` +
            `Your Commission (40%): ₱${totalCommission.toFixed(2)}\n` +
            `Shop Share (60%): ₱${(totalPayments * 0.60).toFixed(2)}\n` +
            `Expenses: -₱${totalExpenses.toFixed(2)}\n` +
            `Amount to Remit: ₱${expectedRemittance.toFixed(2)}\n\nConfirm?`;

        if (!confirm(confirmMsg)) {
            utils.showLoading(false);
            return;
        }

        // Create remittance record
        const today = new Date();
        const remittanceId = `rem_${techId}_multi_${Date.now()}`;

        const remittance = {
            id: remittanceId,
            techId: techId,
            techName: window.currentUserData.displayName,
            date: today.toISOString(),
            dateString: getLocalDateString(today),
            datesIncluded: pendingDates.map(d => d.dateString),
            // Recipient
            submittedTo: recipientId,
            submittedToName: recipient.displayName,
            submittedToRole: recipient.role,
            // Payments
            paymentIds: allPaymentIds,
            totalPaymentsCollected: totalPayments,
            paymentsList: paymentsList,
            // Commission
            commissionDeduction: totalCommission,
            // Expenses
            expenseIds: allExpenseIds,
            totalExpenses: totalExpenses,
            expensesList: expensesList,
            // Calculation
            expectedRemittance: expectedRemittance,
            actualAmount: expectedRemittance,
            discrepancy: 0,
            // Status
            status: 'pending',
            submittedAt: new Date().toISOString(),
            discrepancyReason: notes || '',
            // Multi-day tracking
            multiDaySubmission: true
        };

        // Save to Firebase Realtime Database
        await db.ref(`techRemittances/${remittanceId}`).set(remittance);

        // Update all payments to mark as remitted
        const updates = {};
        pendingDates.forEach(dateData => {
            dateData.payments.forEach(payment => {
                const repair = window.allRepairs.find(r => r.id === payment.repairId);
                if (repair && repair.payments && repair.payments[payment.paymentIndex]) {
                    // Update payment status
                    repair.payments[payment.paymentIndex].remittanceStatus = 'remitted';
                    repair.payments[payment.paymentIndex].techRemittanceId = remittanceId;

                    // Prepare Firebase update
                    updates[`repairs/${repair.id}/payments`] = repair.payments;
                }
            });
        });

        // Update expenses to link to this remittance
        allExpenseIds.forEach(expenseId => {
            updates[`techExpenses/${expenseId}/remittanceId`] = remittanceId;
        });

        // Apply all updates
        await db.ref().update(updates);

        // Reload data
        await loadRepairs();
        await loadTechRemittances();
        await loadTechExpenses();

        utils.showLoading(false);

        alert(`✅ Multi-day remittance submitted!\n\n` +
            `Dates: ${pendingDates.map(d => utils.formatDate(d.dateString)).join(', ')}\n` +
            `💰 Amount: ₱${expectedRemittance.toFixed(2)}\n` +
            `👤 Submitted to: ${recipient.displayName}`);

        closeRemittanceModal();

        // Remove all remitted dates from UI
        pendingDates.forEach(dateData => {
            removeRemittedDateFromUI(dateData.dateString);
        });

        // Refresh current tab
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error submitting multi-day remittance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Remove remitted date from UI without page refresh
 */
function removeRemittedDateFromUI(dateString) {
    // Find and remove the date element from the pending dates list
    const dateElements = document.querySelectorAll('[data-remittance-date]');
    dateElements.forEach(el => {
        if (el.getAttribute('data-remittance-date') === dateString) {
            // Show confirmation toast
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideInUp 0.3s ease-in-out;
            `;
            toast.innerHTML = `✓ Remitted ${utils.formatDate(dateString)}`;
            document.body.appendChild(toast);

            // Remove element with animation
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            el.style.transition = 'all 0.3s ease-in-out';

            setTimeout(() => {
                el.remove();
                // Remove toast
                setTimeout(() => toast.remove(), 2000);
            }, 300);
        }
    });
}

/**
 * Open Remittance Verification Modal
 */
function openVerifyRemittanceModal(remittanceId, isAdminOverride = false) {
    console.log('🔍 Opening verify modal for remittance:', remittanceId);
    console.log('📋 Available remittances:', window.techRemittances.map(r => r.id));

    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        console.error('❌ Remittance not found:', remittanceId);
        alert('⚠️ Remittance not found. Please refresh the page and try again.');
        return;
    }

    console.log('✅ Found remittance:', remittance);

    const currentUserId = window.currentUser.uid;
    const isAdmin = window.currentUserData.role === 'admin';

    console.log('👤 Current user:', currentUserId, 'Role:', window.currentUserData.role);
    console.log('📮 Remittance submitted to:', remittance.submittedTo, remittance.submittedToName);

    // Check if current user is the intended recipient
    const isIntendedRecipient = remittance.submittedTo === currentUserId;

    console.log('✓ Is intended recipient?', isIntendedRecipient, '| Is admin?', isAdmin);

    if (!isIntendedRecipient && !isAdmin) {
        alert('⚠️ This remittance was submitted to ' + remittance.submittedToName + ', not you.\n\nOnly they (or an admin) can verify it.');
        return;
    }

    console.log('✅ Authorization passed, building modal...');

    const showOverrideWarning = isAdminOverride && !isIntendedRecipient;
    const discrepancy = remittance.discrepancy;
    const hasDiscrepancy = Math.abs(discrepancy) > 0.01;

    let details = `
        ${showOverrideWarning ? `
            <div style="background:#ffebee;padding:15px;border-radius:8px;border-left:3px solid #f44336;margin-bottom:15px;">
                <strong style="color:#d32f2f;">⚠️ ADMIN OVERRIDE</strong><br>
                This remittance was submitted to <strong>${remittance.submittedToName}</strong>, not you.<br>
                You are verifying on their behalf.
            </div>
        ` : ''}
        
        <div class="remittance-verify-header">
            <h4>Technician: ${remittance.techName}</h4>
            ${remittance.submittedTo ? `
                <p><strong>Submitted To:</strong> ${remittance.submittedToName} ${isIntendedRecipient ? '(You)' : ''}</p>
            ` : ''}
            <p>Date: ${utils.formatDate(remittance.date)}</p>
            <p>Submitted: ${utils.formatDateTime(remittance.submittedAt)}</p>
        </div>
        
        <div class="remittance-summary-section">
            <h4>📥 Payments Collected (${(remittance.paymentsList || []).length})</h4>
            <div class="remittance-list">
                ${(remittance.paymentsList || []).length > 0 ? (remittance.paymentsList || []).map(p => `
                    <div class="remittance-item">
                        <span>${p.customerName}</span>
                        <span>₱${p.amount.toFixed(2)}</span>
                    </div>
                `).join('') : '<p style="color:#999;">No payment details available</p>'}
            </div>
            <div class="remittance-total">Total: ₱${(remittance.totalPaymentsCollected || 0).toFixed(2)}</div>
        </div>
        
        ${(remittance.totalPartsCosts || 0) > 0 ? `
            <div class="remittance-summary-section">
                <h4>🔧 Parts Costs (${(remittance.partsRepairs || []).length})</h4>
                <div class="remittance-list">
                    ${(remittance.partsRepairs || []).length > 0 ? (remittance.partsRepairs || []).map(p => `
                        <div class="remittance-item">
                            <span>${p.customerName} - ${p.deviceInfo}</span>
                            <span style="color:#f44336;">-₱${p.partsCost.toFixed(2)}</span>
                        </div>
                    `).join('') : '<p style="color:#999;">No parts costs</p>'}
                </div>
                <div class="remittance-total" style="color:#f44336;">Total: -₱${(remittance.totalPartsCosts || 0).toFixed(2)}</div>
            </div>
        ` : ''}
        
        ${(remittance.totalCommission || remittance.commissionEarned || 0) > 0 ? `
            <div class="card" style="background:#e8f5e9;margin:20px 0;border-left:4px solid #4caf50;">
                <h3>💰 Commission Owed to Technician</h3>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;">
                    ${(remittance.cashCommission || 0) > 0 ? `
                        <div style="background:white;padding:10px;border-radius:5px;">
                            <small>From Cash Repairs</small>
                            <div style="font-size:18px;font-weight:600;color:#2196f3;">
                                ₱${(remittance.cashCommission || 0).toFixed(2)}
                            </div>
                        </div>
                    ` : ''}
                    ${(remittance.gcashCommission || 0) > 0 ? `
                        <div style="background:white;padding:10px;border-radius:5px;">
                            <small>From GCash Repairs</small>
                            <div style="font-size:18px;font-weight:600;color:#00bcd4;">
                                ₱${(remittance.gcashCommission || 0).toFixed(2)}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div style="background:#4caf50;color:white;padding:15px;border-radius:8px;text-align:center;">
                    <div>Total Commission to Pay:</div>
                    <div style="font-size:28px;font-weight:bold;">
                        ₱${(remittance.totalCommission || remittance.commissionEarned || 0).toFixed(2)}
                    </div>
                </div>
                
                <div style="background:#fff3cd;padding:12px;border-radius:8px;margin-top:10px;">
                    <strong>Payment Method:</strong> 
                    ${remittance.commissionPaymentPreference === 'cash'
                ? '💵 Cash - Give cash to technician'
                : remittance.commissionPaymentPreference === 'gcash'
                    ? '📱 GCash - Send to technician\'s GCash'
                    : '⚠️ Not specified (legacy remittance)'}
                </div>
                
                ${remittance.commissionPaid ? `
                    <div style="background:#e8f5e9;padding:12px;border-radius:8px;margin-top:10px;border-left:4px solid #4caf50;">
                        <strong>✅ Commission Paid</strong><br>
                        <small style="color:#666;">
                            Paid by: ${remittance.commissionPaidBy}<br>
                            Date: ${utils.formatDateTime(remittance.commissionPaidAt)}<br>
                            ${remittance.commissionPaymentNotes ? `Notes: ${remittance.commissionPaymentNotes}` : ''}
                        </small>
                    </div>
                ` : `
                    ${remittance.status === 'approved' ? `
                        <div style="margin-top:15px;">
                            <button onclick="markCommissionAsPaid('${remittanceId}')" 
                                    class="btn-success" 
                                    style="width:100%;padding:12px;font-size:15px;">
                                💰 Mark Commission as Paid
                            </button>
                            <small style="display:block;color:#666;text-align:center;margin-top:5px;">
                                Click this button after you've paid the technician
                            </small>
                        </div>
                    ` : ''}
                `}
            </div>
        ` : ''}
        
        <div class="remittance-summary-section">
            <h4>💸 Expenses (${(remittance.expensesList || []).length})</h4>
            <div class="remittance-list">
                ${(remittance.expensesList || []).length > 0 ? (remittance.expensesList || []).map(e => `
                    <div class="remittance-item">
                        <span>${e.description}</span>
                        <span>-₱${e.amount.toFixed(2)}</span>
                    </div>
                `).join('') : '<p style="color:#999;">No expenses</p>'}
            </div>
            <div class="remittance-total">Total: -₱${(remittance.totalExpenses || 0).toFixed(2)}</div>
        </div>
        
        <div class="remittance-calculation">
            <div class="calc-row">
                <span>Expected Amount:</span>
                <strong>₱${(remittance.expectedAmount || remittance.actualAmount || 0).toFixed(2)}</strong>
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
            <div class="discrepancy-warning ${Math.abs(discrepancy) > (remittance.expectedAmount || remittance.actualAmount || 0) * 0.05 ? 'discrepancy-danger' : ''}">
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

    DebugLogger.log('REMITTANCE', 'Remittance Approval Initiated', {
        remittanceId: remittanceId,
        approvedBy: window.currentUserData.displayName,
        approvedByRole: window.currentUserData.role
    });

    if (!remittance) {
        DebugLogger.log('ERROR', 'Approve Failed - Remittance Not Found', { remittanceId: remittanceId });
        return;
    }

    const hasDiscrepancy = Math.abs(remittance.discrepancy) > 0.01;

    DebugLogger.log('REMITTANCE', 'Remittance Data for Approval', {
        remittanceId: remittanceId,
        techName: remittance.techName,
        actualAmount: remittance.actualAmount,
        expectedAmount: remittance.expectedRemittance,
        discrepancy: remittance.discrepancy,
        hasDiscrepancy: hasDiscrepancy,
        paymentsCount: remittance.paymentIds ? remittance.paymentIds.length : 0
    });

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
        DebugLogger.log('FIREBASE', 'Remittance Approved - Firebase Update Success', {
            remittanceId: remittanceId,
            status: 'approved',
            verifiedBy: window.currentUserData.displayName,
            verificationNotes: notes
        });

        // Update all linked payments to verified
        const updatePromises = [];
        (remittance.paymentIds || []).forEach(paymentId => {
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
        DebugLogger.log('REMITTANCE', 'All Payments Verified', {
            remittanceId: remittanceId,
            paymentsVerified: remittance.paymentIds ? remittance.paymentIds.length : 0
        });

        // Reload data to reflect changes
        await loadTechRemittances();
        await loadRepairs(); // IMPORTANT: Reload repairs to get updated payment statuses
        DebugLogger.log('REFRESH', 'Data Reloaded After Approval', { remittanceId: remittanceId });

        utils.showLoading(false);
        alert('✅ Remittance approved and all payments verified!');
        closeVerifyRemittanceModal();

        // Auto-close and refresh page
        setTimeout(() => {
            location.reload();
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

        console.log('🔄 Rejecting remittance:', remittanceId);
        console.log('📋 Remittance has paymentIds:', remittance.paymentIds);

        // ALWAYS scan ALL repairs to find any payment linked to this remittance
        // This ensures we don't miss any payments due to data inconsistencies
        let paymentsReset = 0;

        window.allRepairs.forEach(repair => {
            if (repair.payments) {
                const updatedPayments = [...repair.payments];
                let hasChanges = false;

                repair.payments.forEach((payment, index) => {
                    // Reset if payment is linked to this remittance by ID OR status
                    if (payment.techRemittanceId === remittanceId ||
                        (payment.remittanceStatus === 'remitted' &&
                            remittance.paymentIds &&
                            remittance.paymentIds.includes(`${repair.id}_${index}`))) {

                        console.log(`✅ Resetting payment: ${repair.customerName} - ₱${payment.amount}`);

                        updatedPayments[index] = {
                            ...payment,
                            techRemittanceId: null,
                            remittanceStatus: 'pending'
                        };
                        hasChanges = true;
                        paymentsReset++;
                    }
                });

                if (hasChanges) {
                    updatePromises.push(
                        db.ref(`repairs/${repair.id}`).update({ payments: updatedPayments })
                    );
                }
            }
        });

        console.log(`📊 Total payments reset: ${paymentsReset}`);

        // Reset expense remittance IDs
        if (remittance.expenseIds && remittance.expenseIds.length > 0) {
            remittance.expenseIds.forEach(expenseId => {
                updatePromises.push(
                    db.ref(`techExpenses/${expenseId}`).update({ remittanceId: null })
                );
            });
        } else {
            // Old format - find expenses manually
            window.techExpenses.forEach(expense => {
                if (expense.remittanceId === remittanceId) {
                    updatePromises.push(
                        db.ref(`techExpenses/${expense.id}`).update({ remittanceId: null })
                    );
                }
            });
        }

        // Reset commission flags for repairs included in this remittance
        if (remittance.commissionBreakdown && remittance.commissionBreakdown.length > 0) {
            // New format - use commission breakdown
            remittance.commissionBreakdown.forEach(c => {
                updatePromises.push(
                    db.ref(`repairs/${c.repairId}`).update({
                        commissionClaimedBy: null,
                        commissionClaimedAt: null,
                        commissionRemittanceId: null
                    })
                );
            });
        } else {
            // Old format - find all repairs with this remittance ID
            console.log('⚠️ Legacy remittance, manually resetting commission flags...');
            window.allRepairs.forEach(repair => {
                if (repair.commissionRemittanceId === remittanceId) {
                    updatePromises.push(
                        db.ref(`repairs/${repair.id}`).update({
                            commissionClaimedBy: null,
                            commissionClaimedAt: null,
                            commissionRemittanceId: null
                        })
                    );
                }
            });
        }

        await Promise.all(updatePromises);

        // Reload data to reflect changes
        await loadTechRemittances();
        await loadTechExpenses();
        await loadRepairs(); // IMPORTANT: Reload repairs to get updated payment statuses

        utils.showLoading(false);
        alert('❌ Remittance rejected. Technician can resubmit with corrections.');
        closeVerifyRemittanceModal();

        // Auto-close and refresh page
        setTimeout(() => {
            location.reload();
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
 * ============================================
 * GCASH REMITTANCE FUNCTIONS
 * ============================================
 */

/**
 * Open GCash Remittance Modal for a specific date
 */
function openGCashRemittanceModal(dateString) {
    const techId = window.currentUser.uid;

    // Get GCash payments for this date
    const dateData = getPendingGCashDates(techId).find(d => d.dateString === dateString);
    if (!dateData) {
        alert('⚠️ No pending GCash payments for this date');
        return;
    }

    const payments = dateData.payments;
    const paymentsTotal = dateData.totalPayments;
    const commissionAmount = dateData.totalCommission; // 40%
    const remittedAmount = dateData.remittedAmount; // 60%

    // Get list of users who can receive GCash (admin, manager, cashier)
    const gcashReceivers = Object.values(window.allUsers).filter(u =>
        ['admin', 'manager', 'cashier'].includes(u.role)
    );

    const modal = document.getElementById('remittanceModal');
    if (!modal) {
        console.error('Remittance modal not found');
        return;
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:700px;max-height:90vh;overflow-y:auto;">
            <span class="close" onclick="closeRemittanceModal()">&times;</span>
            <h2 style="margin:0 0 20px 0;color:#00bcd4;">📱 Report GCash Remittance</h2>
            <p style="font-size:14px;color:#666;margin-bottom:20px;">
                ${utils.formatDate(dateString)}
            </p>
            
            <!-- Summary Box -->
            <div style="background:#e1f5fe;padding:20px;border-radius:10px;border-left:4px solid #00bcd4;margin-bottom:20px;">
                <h3 style="margin-top:0;color:#0097a7;">💰 GCash Summary</h3>
                <div style="background:white;padding:15px;border-radius:8px;margin-top:15px;">
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>📱 Total GCash Collected:</span>
                        <strong>₱${paymentsTotal.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>🏦 Remitted to Shop (60%):</span>
                        <strong style="color:#4caf50;">₱${remittedAmount.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin:10px 0;">
                        <span>👤 Your Commission (40%):</span>
                        <strong style="color:#2196f3;">₱${commissionAmount.toFixed(2)}</strong>
                    </div>
                </div>
                
                <p style="margin-top:15px;font-size:13px;color:#0097a7;background:white;padding:12px;border-radius:6px;">
                    ℹ️ <strong>GCash goes directly to shop account.</strong> This report is for tracking your commission and verifying the receiver got the payment.
                </p>
            </div>
            
            <!-- GCash Payments List -->
            ${payments.length > 0 ? `
                <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-bottom:20px;">
                    <h3 style="margin-top:0;color:#333;">📱 GCash Payments (${payments.length})</h3>
                    <div style="background:white;border-radius:8px;overflow:hidden;border:1px solid #eee;">
                        ${payments.map((p, idx) => `
                            <div style="padding:12px;border-bottom:${idx < payments.length - 1 ? '1px solid #eee' : 'none'};display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-weight:600;color:#333;">${p.customerName}</div>
                                    <div style="font-size:12px;color:#666;">Ref: ${p.gcashReferenceNumber || 'N/A'}</div>
                                </div>
                                <div style="text-align:right;font-weight:bold;color:#00bcd4;">₱${p.amount.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- GCash Receiver Selection (REQUIRED) -->
            <div class="form-group" style="margin-bottom:20px;">
                <label style="font-weight:bold;margin-bottom:8px;display:block;color:#333;">
                    📱 Who's GCash Account Received This? <span style="color:red;">*</span>
                </label>
                <select id="gcashReceiverSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;" required>
                    <option value="">-- Select Receiver --</option>
                    ${gcashReceivers.map(u => `
                        <option value="${u.uid}" data-name="${u.displayName}" data-role="${u.role}">
                            ${u.displayName} (${u.role}) ${u.email ? '- ' + u.email : ''}
                        </option>
                    `).join('')}
                </select>
                <small style="color:#666;display:block;margin-top:5px;">
                    Select which admin/cashier's GCash account received these payments
                </small>
            </div>
            
            <!-- Commission Payment Preference (REQUIRED) -->
            <div class="form-group" style="margin-bottom:20px;">
                <label style="font-weight:bold;margin-bottom:8px;display:block;color:#333;">
                    💰 How do you want to receive your ₱${commissionAmount.toFixed(2)} commission? <span style="color:red;">*</span>
                </label>
                <select id="gcashCommissionPreference" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;" required>
                    <option value="">-- Select Payment Method --</option>
                    <option value="cash">💵 Cash</option>
                    <option value="gcash">📱 GCash</option>
                </select>
            </div>
            
            <!-- Optional Notes -->
            <div class="form-group" style="margin-bottom:20px;">
                <label style="font-weight:bold;margin-bottom:8px;display:block;color:#333;">
                    📝 Optional Notes
                </label>
                <textarea id="gcashRemittanceNotes" 
                          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;min-height:80px;font-family:inherit;"
                          placeholder="Any additional notes about these GCash payments..."></textarea>
            </div>
            
            <!-- Hidden Fields -->
            <input type="hidden" id="gcashDateString" value="${dateString}">
            <input type="hidden" id="gcashTotalAmount" value="${paymentsTotal}">
            <input type="hidden" id="gcashRemittedAmount" value="${remittedAmount}">
            <input type="hidden" id="gcashCommissionAmount" value="${commissionAmount}">
            
            <!-- Actions -->
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                <button onclick="closeRemittanceModal()" class="btn-secondary" style="padding:10px 20px;">
                    Cancel
                </button>
                <button onclick="confirmGCashRemittance()" class="btn-primary" style="padding:10px 20px;background:#00bcd4;">
                    📱 Submit GCash Report
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * Confirm and Submit GCash Remittance
 */
async function confirmGCashRemittance() {
    const techId = window.currentUser.uid;

    // Get values from modal
    const modal = document.getElementById('remittanceModal');
    if (!modal) {
        alert('Modal not found');
        return;
    }

    const dateString = modal.querySelector('#gcashDateString').value;
    const totalAmount = parseFloat(modal.querySelector('#gcashTotalAmount').value);
    const remittedAmount = parseFloat(modal.querySelector('#gcashRemittedAmount').value);
    const commissionAmount = parseFloat(modal.querySelector('#gcashCommissionAmount').value);
    const receiverSelect = modal.querySelector('#gcashReceiverSelect');
    const receiverUid = receiverSelect.value;
    const commissionPreference = modal.querySelector('#gcashCommissionPreference').value;
    const notes = modal.querySelector('#gcashRemittanceNotes').value.trim();

    // Validation
    if (!receiverUid) {
        alert('⚠️ Please select who received the GCash payments');
        return;
    }

    if (!commissionPreference) {
        alert('⚠️ Please select how you want to receive your commission');
        return;
    }

    const receiver = window.allUsers[receiverUid];
    if (!receiver) {
        alert('⚠️ Selected receiver not found');
        return;
    }

    // Get GCash payments for this date
    const dateData = getPendingGCashDates(techId).find(d => d.dateString === dateString);
    if (!dateData) {
        alert('⚠️ No pending GCash payments for this date');
        return;
    }

    const payments = dateData.payments;

    // Confirm
    if (!confirm(
        `Submit GCash Remittance Report?\n\n` +
        `Total GCash: ₱${totalAmount.toFixed(2)}\n` +
        `Remitted (60%): ₱${remittedAmount.toFixed(2)}\n` +
        `Commission (40%): ₱${commissionAmount.toFixed(2)}\n` +
        `Receiver: ${receiver.displayName}\n` +
        `Commission Method: ${commissionPreference}\n\n` +
        `This will be submitted for verification.`
    )) {
        return;
    }

    try {
        utils.showLoading(true);

        // Create GCash remittance record
        const remittance = {
            remittanceType: 'gcash',  // KEY: Distinguish from cash
            techId: techId,
            techName: window.currentUserData.displayName,
            date: new Date(dateString + 'T00:00:00').toISOString(),
            dateString: dateString,
            // GCash receiver tracking
            submittedTo: receiverUid,
            submittedToName: receiver.displayName,
            submittedToRole: receiver.role,
            gcashReceiverUid: receiverUid,
            gcashReceiverName: receiver.displayName,
            gcashReceiverAccount: receiver.email || '',
            gcashNote: notes,
            // Payments
            paymentIds: payments.map(p => `${p.repairId}_${p.paymentIndex}`),
            totalPaymentsCollected: totalAmount,
            paymentsList: payments.map(p => ({
                repairId: p.repairId,
                customerName: p.customerName,
                amount: p.amount,
                method: 'GCash',
                gcashReferenceNumber: p.gcashReferenceNumber || ''  // Handle undefined
            })),
            // Commission (40% of GCash total)
            totalCommission: commissionAmount,
            gcashCommission: commissionAmount,
            cashCommission: 0,
            commissionPaymentPreference: commissionPreference,
            commissionBreakdown: [],  // Can be expanded if needed
            hasManualOverride: false,
            finalApprovedCommission: commissionAmount,
            // No expenses for GCash
            expenseIds: [],
            totalExpenses: 0,
            expensesList: [],
            // Amount tracking (60% "remitted" - already in shop account)
            expectedRemittance: remittedAmount,
            actualAmount: remittedAmount,
            discrepancy: 0,
            // Status
            status: 'pending',  // Awaits receiver verification
            submittedAt: new Date().toISOString(),
            verifiedBy: null,
            verifiedAt: null,
            verificationNotes: '',
            // Commission payment tracking
            commissionPaid: false,
            commissionPaidAt: null,
            commissionPaidConfirmedBy: null
        };

        const remittanceRef = await db.ref('techRemittances').push(remittance);
        const remittanceId = remittanceRef.key;

        // Update all GCash payments with remittance ID
        const updatePromises = [];
        payments.forEach(p => {
            const repair = window.allRepairs.find(r => r.id === p.repairId);
            if (repair && repair.payments) {
                const updatedPayments = [...repair.payments];
                updatedPayments[p.paymentIndex] = {
                    ...updatedPayments[p.paymentIndex],
                    gcashRemittanceId: remittanceId,
                    remittanceStatus: 'remitted'  // Mark as remitted (reported)
                };
                updatePromises.push(
                    db.ref(`repairs/${p.repairId}`).update({ payments: updatedPayments })
                );
            }
        });

        await Promise.all(updatePromises);

        // Log activity
        await logActivity('gcash_remittance_submitted', {
            remittanceId: remittanceId,
            submittedBy: window.currentUserData.displayName,
            submittedTo: receiver.displayName,
            gcashCollected: totalAmount,
            remittedAmount: remittedAmount,
            commission: commissionAmount
        }, `${window.currentUserData.displayName} submitted GCash remittance report of ₱${totalAmount.toFixed(2)} to ${receiver.displayName}`);

        utils.showLoading(false);
        alert(`✅ GCash remittance reported!\n\n💰 Total: ₱${totalAmount.toFixed(2)}\n🏦 Remitted (60%): ₱${remittedAmount.toFixed(2)}\n👤 Commission (40%): ₱${commissionAmount.toFixed(2)}\n\n⏳ Waiting for ${receiver.displayName} to verify receipt.`);
        closeRemittanceModal();

        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);
    } catch (error) {
        utils.showLoading(false);
        console.error('Error submitting GCash remittance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Verify GCash Remittance (Receiver confirms)
 */
async function verifyGCashRemittance(remittanceId, approved) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        alert('Remittance not found');
        return;
    }

    // Check if user is the receiver or admin
    const currentUserId = window.currentUser.uid;
    const isReceiver = remittance.gcashReceiverUid === currentUserId;
    const isAdmin = window.currentUserData.role === 'admin';

    if (!isReceiver && !isAdmin) {
        alert('⚠️ Only the GCash receiver or admin can verify this remittance');
        return;
    }

    // Ask for notes
    let notes = '';
    if (approved) {
        notes = prompt(
            'Confirm GCash Received\n\n' +
            `Total GCash: ₱${remittance.totalPaymentsCollected.toFixed(2)}\n` +
            `From: ${remittance.techName}\n\n` +
            'Optional: Add verification notes:'
        ) || 'GCash payments verified and received in account';
    } else {
        notes = prompt(
            '⚠️ Reject GCash Remittance\n\n' +
            `Total GCash: ₱${remittance.totalPaymentsCollected.toFixed(2)}\n` +
            `From: ${remittance.techName}\n\n` +
            'Please explain why GCash was not found (minimum 10 characters):'
        );

        if (!notes || notes.trim().length < 10) {
            alert('Please provide a detailed explanation (at least 10 characters)');
            return;
        }
    }

    try {
        utils.showLoading(true);

        const updateData = {
            status: approved ? 'approved' : 'rejected',
            verifiedBy: window.currentUserData.displayName,
            verifiedById: currentUserId,
            verifiedAt: new Date().toISOString(),
            verificationNotes: notes.trim()
        };

        await db.ref(`techRemittances/${remittanceId}`).update(updateData);

        // If rejected, reset payment statuses
        if (!approved) {
            const updatePromises = [];
            remittance.paymentsList.forEach((p, idx) => {
                const paymentId = remittance.paymentIds[idx];
                const [repairId, paymentIndex] = paymentId.split('_');
                const repair = window.allRepairs.find(r => r.id === repairId);

                if (repair && repair.payments) {
                    const updatedPayments = [...repair.payments];
                    updatedPayments[parseInt(paymentIndex)] = {
                        ...updatedPayments[parseInt(paymentIndex)],
                        gcashRemittanceId: null,
                        remittanceStatus: 'pending'
                    };
                    updatePromises.push(
                        db.ref(`repairs/${repairId}`).update({ payments: updatedPayments })
                    );
                }
            });

            await Promise.all(updatePromises);
        }

        // Log activity
        await logActivity(approved ? 'gcash_remittance_approved' : 'gcash_remittance_rejected', {
            remittanceId: remittanceId,
            techName: remittance.techName,
            verifiedBy: window.currentUserData.displayName,
            amount: remittance.totalPaymentsCollected
        }, `${window.currentUserData.displayName} ${approved ? 'approved' : 'rejected'} GCash remittance from ${remittance.techName}`);

        utils.showLoading(false);
        alert(approved ? '✅ GCash remittance approved!' : '❌ GCash remittance rejected. Technician can resubmit.');

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
    } catch (error) {
        utils.showLoading(false);
        console.error('Error verifying GCash remittance:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * ============================================
 * COMMISSION PAYMENT FUNCTIONS
 * ============================================
 */

/**
 * Mark Commission as Paid
 */
async function markCommissionAsPaid(remittanceId) {
    const remittance = window.techRemittances.find(r => r.id === remittanceId);
    if (!remittance) {
        alert('⚠️ Remittance not found');
        return;
    }

    // Check if already paid
    if (remittance.commissionPaid) {
        alert('ℹ️ Commission has already been marked as paid.');
        return;
    }

    const totalCommission = remittance.totalCommission || remittance.commissionEarned || 0;
    if (totalCommission === 0) {
        alert('ℹ️ No commission to pay for this remittance.');
        return;
    }

    // Confirm payment
    const paymentMethod = remittance.commissionPaymentPreference || 'Not specified';
    const confirmed = confirm(
        `💰 MARK COMMISSION AS PAID\n\n` +
        `Technician: ${remittance.techName}\n` +
        `Commission Amount: ₱${totalCommission.toFixed(2)}\n` +
        `Cash Repairs: ₱${(remittance.cashCommission || 0).toFixed(2)}\n` +
        `GCash Repairs: ₱${(remittance.gcashCommission || 0).toFixed(2)}\n` +
        `Payment Method: ${paymentMethod === 'cash' ? '💵 Cash' : paymentMethod === 'gcash' ? '📱 GCash' : '⚠️ Not specified'}\n\n` +
        `Are you sure you have paid this commission to the technician?\n\n` +
        `Click OK to mark as paid...`
    );

    if (!confirmed) return;

    // Require notes
    const notes = prompt('Enter notes (optional - e.g., GCash reference number, cash count notes):');

    try {
        utils.showLoading(true);

        const now = new Date().toISOString();

        await db.ref(`techRemittances/${remittanceId}`).update({
            commissionPaid: true,
            commissionPaidBy: window.currentUserData.displayName,
            commissionPaidAt: now,
            commissionPaymentNotes: notes || ''
        });

        // Log activity
        await logActivity('commission_paid', {
            remittanceId: remittanceId,
            techId: remittance.techId,
            techName: remittance.techName,
            amount: totalCommission,
            paymentMethod: paymentMethod,
            notes: notes
        }, `Commission paid: ₱${totalCommission.toFixed(2)} to ${remittance.techName} via ${paymentMethod}`);

        // Reload remittances
        await loadTechRemittances();

        utils.showLoading(false);
        alert(`✅ Commission Marked as Paid!\n\n₱${totalCommission.toFixed(2)} to ${remittance.techName}\nMethod: ${paymentMethod}\n\nThis will now show as paid in both technician and admin views.`);

        // Refresh
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error marking commission as paid:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Device Release Functions
 */

let serviceSlipPhoto = null;

/**
 * Toggle payment entry section in release modal
 */
function toggleReleasePaymentSection() {
    const paidYes = document.getElementById('customerPaidYes');
    const paidNo = document.getElementById('customerPaidNo');
    const section = document.getElementById('releasePaymentSection');
    const amountField = document.getElementById('releasePaymentAmount');
    const methodField = document.getElementById('releasePaymentMethod');

    // Update radio button label styling
    const yesLabel = paidYes.parentElement;
    const noLabel = paidNo.parentElement;

    if (paidYes.checked) {
        // Highlight selected option
        yesLabel.style.borderColor = '#667eea';
        yesLabel.style.background = '#f0f4ff';
        yesLabel.style.borderWidth = '2px';
        noLabel.style.borderColor = '#ddd';
        noLabel.style.background = '#fff';

        // Show payment fields
        section.style.display = 'block';

        // Auto-populate remaining balance
        const repairId = window.currentReleaseRepairId;
        const repair = window.allRepairs.find(r => r.id === repairId);
        if (repair) {
            const totalPaid = (repair.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const balance = repair.total - totalPaid;

            if (balance > 0) {
                amountField.value = balance.toFixed(2);
                document.getElementById('releaseBalanceInfo').innerHTML =
                    `<strong style="color:#2196f3;">Remaining balance: ₱${balance.toFixed(2)}</strong>`;
            } else {
                document.getElementById('releaseBalanceInfo').innerHTML =
                    `<span style="color:#4caf50;">✓ Fully paid</span>`;
            }
        }

        amountField.required = true;
        methodField.required = true;
    } else if (paidNo.checked) {
        // Highlight selected option
        noLabel.style.borderColor = '#667eea';
        noLabel.style.background = '#f0f4ff';
        noLabel.style.borderWidth = '2px';
        yesLabel.style.borderColor = '#ddd';
        yesLabel.style.background = '#fff';

        // Hide payment fields
        section.style.display = 'none';
        amountField.required = false;
        methodField.required = false;
        amountField.value = '';
        document.getElementById('releaseBalanceInfo').innerHTML = '';
    }
}

/**
 * Toggle GCash reference number field based on payment method
 */
function toggleGCashReferenceField() {
    const paymentMethod = document.getElementById('releasePaymentMethod').value;
    const gcashField = document.getElementById('gcashReferenceField');
    const gcashInput = document.getElementById('releaseGCashReference');

    if (paymentMethod === 'GCash') {
        gcashField.style.display = 'block';
        gcashInput.required = true;
    } else {
        gcashField.style.display = 'none';
        gcashInput.required = false;
        gcashInput.value = ''; // Clear field when not GCash
    }
}

/**
 * Open Release Device Modal
 */
function openReleaseDeviceModal(repairId) {
    // Store repairId globally for payment section
    window.currentReleaseRepairId = repairId;

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

    // Add help text at the top of the modal
    const lang = getCurrentHelpLanguage();
    const helpTitle = lang === 'tl' ? 'Paano I-release ang Device' : 'How to Release Device';
    const helpText = lang === 'tl' ?
        'Piliin ang verification method (With/Without Slip), kumpirmahin ang customer name at contact, at i-click ang Release Device. Pwede ring maningil ng bayad habang nire-release.' :
        'Choose verification method (With/Without Slip), confirm customer name and contact, then click Release Device. You can also collect payment during release.';

    const helpSection = document.createElement('div');
    helpSection.innerHTML = `
        <details style="margin-bottom:15px;padding:10px;background:#e3f2fd;border-radius:6px;">
            <summary style="cursor:pointer;font-weight:bold;color:#1976d2;font-size:14px;">
                ❓ ${helpTitle}
            </summary>
            <p style="margin:10px 0 0;color:#555;font-size:13px;line-height:1.5;">
                ${helpText}
            </p>
        </details>
    `;

    // Insert help at the beginning of modal content
    const modalContent = document.getElementById('releaseDeviceModalContent');
    if (modalContent) {
        const firstChild = modalContent.firstChild;
        modalContent.insertBefore(helpSection.firstChild, firstChild);
    }

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
            <p style="font-size:13px;color:#666;margin:10px 0;">
                💡 You can record payment during release below, or release with outstanding balance for dealers.
            </p>
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

    // Reset payment radio buttons and section
    const paidYes = document.getElementById('customerPaidYes');
    const paidNo = document.getElementById('customerPaidNo');
    const paymentSection = document.getElementById('releasePaymentSection');

    if (paidYes) {
        paidYes.checked = false;
        // Reset label styling
        paidYes.parentElement.style.borderColor = '#ddd';
        paidYes.parentElement.style.background = '#fff';
    }
    if (paidNo) {
        paidNo.checked = false;
        // Reset label styling
        paidNo.parentElement.style.borderColor = '#ddd';
        paidNo.parentElement.style.background = '#fff';
    }
    if (paymentSection) {
        paymentSection.style.display = 'none';
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
    // DUPLICATE PREVENTION: Check if already processing
    if (window.processingRelease) {
        console.warn('⚠️ Release already in progress, ignoring duplicate click');
        return;
    }

    const repairId = document.getElementById('releaseRepairId').value;
    const verificationMethod = document.getElementById('verificationMethod').value;
    const customerName = document.getElementById('releaseCustomerName').value.trim();
    const contactNumber = document.getElementById('releaseContactNumber').value.trim();
    const releaseNotes = document.getElementById('releaseNotes').value.trim();

    DebugLogger.log('RELEASE', 'Device Release Initiated', {
        repairId: repairId,
        verificationMethod: verificationMethod,
        customerName: customerName,
        contactNumber: contactNumber,
        releaseNotes: releaseNotes,
        releasedBy: window.currentUserData.displayName,
        releasedByRole: window.currentUserData.role
    });

    // Basic validation
    if (!customerName || !contactNumber) {
        DebugLogger.log('ERROR', 'Release Validation Failed', { reason: 'Missing customer name or contact' });
        alert('Please confirm customer name and contact number');
        return;
    }

    // VALIDATE PAYMENT STATUS RADIO BUTTON SELECTION (REQUIRED)
    const paidYes = document.getElementById('customerPaidYes');
    const paidNo = document.getElementById('customerPaidNo');

    if (!paidYes.checked && !paidNo.checked) {
        alert('⚠️ Please select payment status:\n\n• Customer Paid Now\n• Not Paid Yet (Outstanding Balance)');
        DebugLogger.log('ERROR', 'Release Validation Failed', { reason: 'Payment status not selected' });
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);

    // DUPLICATE PREVENTION: Check if already released
    if (repair.status === 'Released' || repair.status === 'Claimed') {
        alert('⚠️ This device has already been released!');
        DebugLogger.log('ERROR', 'Duplicate Release Prevented', { repairId, currentStatus: repair.status });
        return;
    }

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

    // Check if payment is being recorded via radio button
    const customerPaid = paidYes.checked;
    let paymentCollected = null;
    let paymentAmount = 0;

    if (customerPaid) {
        paymentAmount = parseFloat(document.getElementById('releasePaymentAmount').value);
        const paymentMethod = document.getElementById('releasePaymentMethod').value;
        const paymentNotes = document.getElementById('releasePaymentNotes').value.trim();
        const gcashReference = document.getElementById('releaseGCashReference').value.trim();

        DebugLogger.log('PAYMENT', 'Payment Collection at Release', {
            repairId: repairId,
            paymentAmount: paymentAmount,
            paymentMethod: paymentMethod,
            gcashReference: gcashReference,
            paymentNotes: paymentNotes
        });

        // Validate payment amount
        if (!paymentAmount || paymentAmount <= 0) {
            DebugLogger.log('ERROR', 'Payment Validation Failed', { reason: 'Invalid amount', amount: paymentAmount });
            alert('⚠️ Please enter a valid payment amount');
            return;
        }

        // Validate GCash reference if GCash is selected
        if (paymentMethod === 'GCash') {
            if (!gcashReference) {
                alert('⚠️ GCash reference number is required for GCash payments');
                return;
            }
            if (!/^\d{13}$/.test(gcashReference)) {
                alert('⚠️ GCash reference number must be exactly 13 digits');
                return;
            }
        }

        // Create payment collected object
        paymentCollected = {
            amount: paymentAmount,
            method: paymentMethod,
            notes: paymentNotes,
            collectedBy: window.currentUserData.displayName,
            collectedById: window.currentUser.uid,
            collectedByRole: window.currentUserData.role,
            collectedAt: new Date().toISOString(),
            // GCash specific fields
            gcashReferenceNumber: paymentMethod === 'GCash' ? gcashReference : null
        };
    }

    // Calculate balance for tracking
    const totalPaidBefore = (repair.payments || []).filter(p => p.verified)
        .reduce((sum, p) => sum + p.amount, 0);
    const balanceBefore = repair.total - totalPaidBefore;

    // Build release data
    const releaseData = {
        status: 'Released',
        releasedAt: new Date().toISOString(),
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
        // DUPLICATE PREVENTION: Set processing flag and disable button
        window.processingRelease = true;
        const confirmBtn = document.querySelector('#releaseModal button[onclick="confirmReleaseDevice()"]');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
        }

        utils.showLoading(true);

        // Update device release status
        await db.ref(`repairs/${repairId}`).update(releaseData);
        DebugLogger.log('FIREBASE', 'Device Released - Firebase Update Success', {
            repairId: repairId,
            status: 'Released',
            releasedBy: window.currentUserData.displayName,
            verificationMethod: verificationMethod,
            hadBalance: balanceBefore > 0,
            releaseData: releaseData
        });

        // If payment was collected during release, save it
        if (paymentCollected) {
            // FIX: Payment should be credited to the technician who worked on the repair,
            // not the person who releases the device (could be cashier/admin)
            const technicianId = repair.acceptedBy; // Who worked on the repair
            const technicianName = repair.acceptedByName || 'Unknown';

            // Check if the technician has a technician role (for remittance tracking)
            const technicianUser = technicianId ? window.allUsers[technicianId] : null;
            const isTechRole = technicianUser && technicianUser.role === 'technician';

            // Create payment object
            // NOTE: Payments are ALWAYS auto-verified when recorded
            // Verification happens at the REMITTANCE level (when tech hands cash to cashier/admin)
            // GCash payments go to shop account, not collected by tech
            const isGCash = paymentCollected.method === 'GCash';

            const payment = {
                amount: paymentCollected.amount,
                method: paymentCollected.method,
                notes: paymentCollected.notes || ('Payment collected at device release by ' + paymentCollected.collectedBy),
                paymentDate: paymentCollected.collectedAt, // When customer paid
                recordedDate: paymentCollected.collectedAt, // When we recorded it (MUST use recordedDate, not recordedAt)
                recordedBy: paymentCollected.collectedBy,
                recordedById: paymentCollected.collectedById,
                // FIX: Credit payment to technician who worked on repair, not releasing user
                receivedBy: technicianName, // Technician who earned the payment
                receivedById: technicianId || window.currentUser.uid, // Tech UID (fallback to releaser if no tech)
                // Track who physically released the device (for audit trail)
                releaseCollectedBy: paymentCollected.collectedBy,
                releaseCollectedById: paymentCollected.collectedById,
                releaseCollectedByRole: paymentCollected.collectedByRole,
                // FIX: Check technician's role, not releasing user's role
                collectedByTech: !isGCash && isTechRole, // Only true for Cash earned by tech
                remittanceStatus: (!isGCash && isTechRole) ? 'pending' : 'n/a', // Only Cash by tech needs remittance
                verified: true, // ALWAYS auto-verified
                verifiedAt: paymentCollected.collectedAt,
                verifiedBy: paymentCollected.collectedBy,
                verifiedById: paymentCollected.collectedById,
                // GCash specific fields
                gcashReferenceNumber: paymentCollected.gcashReferenceNumber || null
            };

            const existingPayments = repair.payments || [];
            await db.ref(`repairs/${repairId}`).update({
                payments: [...existingPayments, payment]
            });
            DebugLogger.log('PAYMENT', 'Payment Saved to Firebase', {
                repairId: repairId,
                amount: payment.amount,
                method: payment.method,
                receivedBy: payment.receivedBy,
                collectedByTech: payment.collectedByTech,
                remittanceStatus: payment.remittanceStatus,
                verified: payment.verified
            });

            // Log payment collection
            await logActivity('payment_recorded', {
                repairId: repairId,
                amount: payment.amount,
                method: payment.method,
                collectedAt: 'device_release',
                collectedBy: paymentCollected.collectedBy,
                collectedByRole: window.currentUserData.role,
                customerName: repair.customerName
            }, `Payment of ₱${payment.amount.toFixed(2)} collected at release by ${paymentCollected.collectedBy}`);

            // Calculate and set commission if device is fully paid
            const totalPaid = [...existingPayments, payment]
                .filter(p => p.verified)
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            const balance = repair.total - totalPaid;

            if (balance <= 0 && repair.acceptedBy) {
                const commission = calculateRepairCommission(repair, repair.acceptedBy);
                if (commission.eligible && !repair.commissionAmount) {
                    await db.ref(`repairs/${repairId}`).update({
                        commissionEligible: true,
                        commissionAmount: commission.amount,
                        commissionCalculatedAt: new Date().toISOString()
                    });
                    DebugLogger.log('COMMISSION', 'Commission Calculated at Release', {
                        repairId: repairId,
                        technicianId: repair.acceptedBy,
                        amount: commission.amount,
                        eligible: commission.eligible
                    });
                }
            }
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

        // DUPLICATE PREVENTION: Reset flag
        window.processingRelease = false;

        setTimeout(() => {
            if (window.currentTabRefresh) window.currentTabRefresh();
            if (window.buildStats) window.buildStats();
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error releasing device:', error);
        alert('Error: ' + error.message);

        // DUPLICATE PREVENTION: Reset flag and re-enable button on error
        window.processingRelease = false;
        const confirmBtn = document.querySelector('#releaseModal button[onclick="confirmReleaseDevice()"]');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Release';
        }
    }
}

function closeReleaseDeviceModal() {
    document.getElementById('releaseDeviceModal').style.display = 'none';
    serviceSlipPhoto = null;
}

/**
 * Finalize Released Device - Manual or Automatic
 * Convert Released status to Claimed
 */
async function finalizeClaimDevice(repairId, isAutomatic = false) {
    DebugLogger.log('CLAIM', 'Device Claim/Finalize Initiated', {
        repairId: repairId,
        isAutomatic: isAutomatic,
        initiatedBy: isAutomatic ? 'System Auto-Finalize' : window.currentUserData.displayName
    });

    try {
        const repair = window.allRepairs.find(r => r.id === repairId);
        if (!repair) {
            DebugLogger.log('ERROR', 'Claim Failed - Repair Not Found', { repairId: repairId });
            alert('Repair not found');
            return;
        }

        if (repair.status !== 'Released') {
            DebugLogger.log('ERROR', 'Claim Failed - Invalid Status', {
                repairId: repairId,
                currentStatus: repair.status,
                expectedStatus: 'Released'
            });
            alert('⚠️ This device is not in Released status');
            return;
        }

        // If manual finalization, show modal for warranty info
        if (!isAutomatic) {
            openFinalizeModal(repairId);
            return;
        }

        // Automatic finalization at 6pm
        const finalizeData = {
            status: 'Claimed',
            claimedAt: new Date().toISOString(),
            finalizedAt: new Date().toISOString(),
            finalizedBy: isAutomatic ? 'System Auto-Finalize' : window.currentUserData.displayName,
            finalizedById: isAutomatic ? 'system' : window.currentUser.uid,
            autoFinalized: isAutomatic,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: isAutomatic ? 'System' : window.currentUserData.displayName
        };

        await db.ref(`repairs/${repairId}`).update(finalizeData);

        // Log activity
        await logActivity('device_finalized', {
            repairId: repairId,
            customerName: repair.customerName,
            autoFinalized: isAutomatic,
            finalizedBy: finalizeData.finalizedBy
        }, `Device finalized: ${repair.customerName} - ${isAutomatic ? 'Auto at 6pm' : 'Manual'}`);

        if (!isAutomatic) {
            alert('✅ Device finalized successfully!');
            closeFinalizeModal();
            if (window.currentTabRefresh) window.currentTabRefresh();
            if (window.buildStats) window.buildStats();
        }

    } catch (error) {
        console.error('Error finalizing device:', error);
        if (!isAutomatic) {
            alert('Error: ' + error.message);
        }
    }
}

function openFinalizeModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);

    // Default warranty: 0 days for software repairs, 7 days for hardware
    const isSoftwareRepair = repair && (repair.repairType === 'Software Issue' ||
        repair.repairType === 'FRP Unlock' ||
        repair.repairType === 'Password Unlock' ||
        repair.repairType === 'IC Bypass' ||
        repair.repairType === 'Virus Removal' ||
        repair.repairType === 'Data Recovery' ||
        repair.repairType === 'Software Restore');
    const defaultWarranty = isSoftwareRepair ? '0' : '7';

    document.getElementById('finalizeRepairId').value = repairId;
    document.getElementById('finalizeWarrantyDays').value = defaultWarranty;
    document.getElementById('finalizeFinalNotes').value = '';

    // Reset payment fields
    document.getElementById('finalizePaymentCheckbox').checked = false;
    document.getElementById('finalizePaymentFields').style.display = 'none';
    document.getElementById('finalizePaymentAmount').value = '';
    document.getElementById('finalizePaymentMethod').value = '';
    document.getElementById('finalizePaymentNotes').value = '';
    document.getElementById('finalizeGCashReference').value = '';
    document.getElementById('finalizeGCashReferenceGroup').style.display = 'none';

    document.getElementById('finalizeClaimModal').style.display = 'block';
}

async function confirmFinalizeDevice() {
    // DUPLICATE PREVENTION: Check if already processing
    if (window.processingFinalize) {
        console.warn('⚠️ Finalize already in progress, ignoring duplicate click');
        return;
    }

    const repairId = document.getElementById('finalizeRepairId').value;
    const warrantyDays = parseInt(document.getElementById('finalizeWarrantyDays').value) || 0;
    const finalNotes = document.getElementById('finalizeFinalNotes').value.trim();

    // Check if payment is being collected
    const collectingPayment = document.getElementById('finalizePaymentCheckbox').checked;
    let paymentCollected = null;

    if (collectingPayment) {
        const paymentAmount = parseFloat(document.getElementById('finalizePaymentAmount').value);
        const paymentMethod = document.getElementById('finalizePaymentMethod').value;
        const paymentNotes = document.getElementById('finalizePaymentNotes').value.trim();
        const gcashReference = document.getElementById('finalizeGCashReference').value.trim();

        DebugLogger.log('CLAIM', 'Payment Collection at Finalization', {
            repairId: repairId,
            paymentAmount: paymentAmount,
            paymentMethod: paymentMethod,
            gcashReference: gcashReference
        });

        // Validate payment amount
        if (!paymentAmount || paymentAmount <= 0) {
            DebugLogger.log('ERROR', 'Finalize Payment Validation Failed', { reason: 'Invalid amount' });
            alert('⚠️ Please enter a valid payment amount');
            return;
        }

        // Validate payment method
        if (!paymentMethod) {
            alert('⚠️ Please select a payment method');
            return;
        }

        // Validate GCash reference if GCash is selected
        if (paymentMethod === 'GCash') {
            if (!gcashReference) {
                alert('⚠️ GCash reference number is required for GCash payments');
                return;
            }
            if (!/^\d{13}$/.test(gcashReference)) {
                alert('⚠️ GCash reference number must be exactly 13 digits');
                return;
            }
        }

        paymentCollected = {
            amount: paymentAmount,
            method: paymentMethod,
            notes: paymentNotes,
            gcashReferenceNumber: paymentMethod === 'GCash' ? gcashReference : null,
            collectedAt: new Date().toISOString()
        };
    }

    if (!repairId) {
        alert('Invalid repair ID');
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }

    // DUPLICATE PREVENTION: Check if already claimed
    if (repair.status === 'Claimed') {
        alert('⚠️ This device has already been claimed!');
        DebugLogger.log('ERROR', 'Duplicate Finalize Prevented', { repairId, currentStatus: repair.status });
        return;
    }

    const confirmMsg = paymentCollected
        ? `✅ Finalize and mark as Claimed?\n\nWarranty: ${warrantyDays} days\n💰 Payment: ₱${paymentCollected.amount.toFixed(2)} (${paymentCollected.method})`
        : `✅ Finalize and mark as Claimed?\n\nWarranty: ${warrantyDays} days`;

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        // DUPLICATE PREVENTION: Set processing flag and disable button
        window.processingFinalize = true;
        const confirmBtn = document.querySelector('#finalizeModal button[onclick="confirmFinalizeDevice()"]');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
        }

        utils.showLoading(true);

        const warrantyEndDate = new Date();
        warrantyEndDate.setDate(warrantyEndDate.getDate() + warrantyDays);

        const finalizeData = {
            status: 'Claimed',
            claimedAt: new Date().toISOString(),
            finalizedAt: new Date().toISOString(),
            finalizedBy: window.currentUserData.displayName,
            finalizedById: window.currentUser.uid,
            autoFinalized: false,
            warrantyDays: warrantyDays,
            warrantyEndDate: warrantyEndDate.toISOString(),
            finalNotes: finalNotes || '',
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        };

        await db.ref(`repairs/${repairId}`).update(finalizeData);
        DebugLogger.log('FIREBASE', 'Device Claimed (Manual) - Firebase Update Success', {
            repairId: repairId,
            status: 'Claimed',
            warrantyDays: warrantyDays,
            paymentCollected: paymentCollected ? paymentCollected.amount : 0
        });

        // If payment was collected, save it
        if (paymentCollected) {
            // Credit payment to technician who did the repair (repairedBy)
            const technicianId = repair.acceptedBy || repair.technicianId;
            const technicianName = repair.acceptedByName || repair.repairedBy || 'Unknown';

            // Check if technician has technician role
            const technicianUser = technicianId ? window.allUsers[technicianId] : null;
            const isTechRole = technicianUser && technicianUser.role === 'technician';
            const isGCash = paymentCollected.method === 'GCash';

            const payment = {
                amount: paymentCollected.amount,
                method: paymentCollected.method,
                notes: paymentCollected.notes || ('Payment collected at claim finalization by ' + window.currentUserData.displayName),
                paymentDate: paymentCollected.collectedAt,
                recordedDate: paymentCollected.collectedAt,
                recordedBy: window.currentUserData.displayName,
                recordedById: window.currentUser.uid,
                // Credit to technician who did the repair
                receivedBy: technicianName,
                receivedById: technicianId || window.currentUser.uid,
                // Track who finalized the claim
                finalizedBy: window.currentUserData.displayName,
                finalizedById: window.currentUser.uid,
                finalizedByRole: window.currentUserData.role,
                // Payment collection flags
                collectedAtFinalization: true,  // NEW flag
                collectedByTech: !isGCash && isTechRole,
                remittanceStatus: (!isGCash && isTechRole) ? 'pending' : 'n/a',
                verified: true,  // Auto-verified
                verifiedAt: paymentCollected.collectedAt,
                verifiedBy: window.currentUserData.displayName,
                verifiedById: window.currentUser.uid,
                // GCash specific
                gcashReferenceNumber: paymentCollected.gcashReferenceNumber || null
            };

            const existingPayments = repair.payments || [];
            await db.ref(`repairs/${repairId}`).update({
                payments: [...existingPayments, payment]
            });

            DebugLogger.log('PAYMENT', 'Payment Saved at Finalization', {
                repairId: repairId,
                amount: payment.amount,
                method: payment.method,
                receivedBy: payment.receivedBy,
                collectedByTech: payment.collectedByTech,
                remittanceStatus: payment.remittanceStatus
            });

            // Log payment collection
            await logActivity('payment_recorded', {
                repairId: repairId,
                amount: payment.amount,
                method: payment.method,
                collectedAt: 'claim_finalization',
                collectedBy: window.currentUserData.displayName,
                collectedByRole: window.currentUserData.role,
                creditedTo: technicianName,
                customerName: repair.customerName
            }, `Payment of ₱${payment.amount.toFixed(2)} collected at claim finalization - credited to ${technicianName}`);

            // Calculate and set commission if device is fully paid
            const totalPaid = [...existingPayments, payment]
                .filter(p => p.verified)
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            const balance = repair.total - totalPaid;

            if (balance <= 0 && repair.acceptedBy) {
                const commission = calculateRepairCommission(repair, repair.acceptedBy);
                if (commission.eligible && !repair.commissionAmount) {
                    await db.ref(`repairs/${repairId}`).update({
                        commissionEligible: true,
                        commissionAmount: commission.amount,
                        commissionCalculatedAt: new Date().toISOString()
                    });
                    DebugLogger.log('COMMISSION', 'Commission Calculated at Finalization', {
                        repairId: repairId,
                        technicianId: repair.acceptedBy,
                        amount: commission.amount,
                        eligible: commission.eligible
                    });
                }
            }
        }

        // Log finalization activity
        await logActivity('device_finalized', {
            repairId: repairId,
            customerName: repair.customerName,
            autoFinalized: false,
            warrantyDays: warrantyDays,
            finalizedBy: window.currentUserData.displayName,
            paymentCollected: paymentCollected ? paymentCollected.amount : 0
        }, `Device manually finalized: ${repair.customerName} - ${warrantyDays} days warranty${paymentCollected ? ` - Collected ₱${paymentCollected.amount.toFixed(2)}` : ''}`);

        utils.showLoading(false);

        let successMsg = '✅ Device finalized successfully!';
        if (paymentCollected) {
            const totalPaid = (repair.payments || [])
                .filter(p => p.verified)
                .reduce((sum, p) => sum + p.amount, 0) + paymentCollected.amount;
            const newBalance = repair.total - totalPaid;

            successMsg += `\n\n💰 Payment Recorded: ₱${paymentCollected.amount.toFixed(2)}`;
            if (newBalance > 0) {
                successMsg += `\n⚠️ Remaining Balance: ₱${newBalance.toFixed(2)}`;
            } else {
                successMsg += `\n✅ Fully Paid!`;
            }

            if (isTechRole) {
                successMsg += `\n\n📋 Payment credited to ${technicianName} for remittance.`;
            }
        }

        alert(successMsg);
        closeFinalizeModal();

        // DUPLICATE PREVENTION: Reset flag
        window.processingFinalize = false;

        setTimeout(() => {
            if (window.currentTabRefresh) window.currentTabRefresh();
            if (window.buildStats) window.buildStats();
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error finalizing device:', error);
        DebugLogger.log('ERROR', 'Finalize Device Failed', { repairId: repairId, error: error.message });
        alert('Error: ' + error.message);

        // DUPLICATE PREVENTION: Reset flag and re-enable button on error
        window.processingFinalize = false;
        const confirmBtn = document.querySelector('#finalizeModal button[onclick="confirmFinalizeDevice()"]');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Finalize';
        }
    }
}

function closeFinalizeModal() {
    document.getElementById('finalizeClaimModal').style.display = 'none';
}

/**
 * Open Mark as Back Job Modal
 * Shows original repair details and prompts for back job reason
 */
async function openMarkAsBackJobModal(originalRepairId) {
    const repair = window.allRepairs.find(r => r.id === originalRepairId);
    if (!repair) {
        alert('❌ Repair not found');
        return;
    }

    // Validate 90-day limit
    const claimedDate = new Date(repair.claimedAt);
    const daysAgo = Math.floor((Date.now() - claimedDate) / (1000 * 60 * 60 * 24));

    if (daysAgo > 90) {
        alert('❌ Cannot create back job: This repair was completed more than 90 days ago (outside warranty period).');
        return;
    }

    // Check if already has back job
    if (repair.hasBackJobId) {
        alert('⚠️ This repair already has a back job registered. View the Back Job tab to see it.');
        return;
    }

    // Populate original repair details
    const warrantyActive = repair.warrantyEndDate && new Date(repair.warrantyEndDate) > new Date();
    const detailsDiv = document.getElementById('backJobOriginalDetails');
    detailsDiv.innerHTML = `
        <h4 style="margin:0 0 10px 0;color:#2196f3;">📋 Original Repair Details</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;">
            <div><strong>Customer:</strong> ${repair.customerName}</div>
            <div><strong>Phone:</strong> ${repair.contactNumber}</div>
            <div><strong>Device:</strong> ${repair.brand} ${repair.model}</div>
            <div><strong>Completed:</strong> ${utils.formatDate(repair.claimedAt)} (${daysAgo} days ago)</div>
            <div><strong>Original Issue:</strong> ${repair.problemType || 'N/A'}</div>
            <div><strong>Repair Done:</strong> ${repair.repairType || 'N/A'}</div>
            <div><strong>Technician:</strong> ${repair.acceptedByName || 'N/A'}</div>
            <div><strong>Total Paid:</strong> ₱${(repair.total || 0).toFixed(2)}</div>
        </div>
        ${repair.warrantyPeriodDays ? `
            <div style="margin-top:10px;padding:10px;background:${warrantyActive ? '#e8f5e9' : '#ffebee'};border-radius:5px;">
                <strong>🛡️ Warranty:</strong> ${repair.warrantyPeriodDays} days 
                ${warrantyActive ?
                `(Active until ${utils.formatDate(repair.warrantyEndDate)})` :
                `(Expired on ${utils.formatDate(repair.warrantyEndDate)})`}
            </div>
        ` : ''}
        ${repair.technicianNotes ? `
            <div style="margin-top:10px;">
                <strong>Original Tech Notes:</strong><br>
                <em style="color:#666;">${repair.technicianNotes}</em>
            </div>
        ` : ''}
    `;

    // Set repair ID and clear form
    document.getElementById('backJobOriginalRepairId').value = originalRepairId;
    document.getElementById('backJobReason').value = '';
    document.getElementById('backJobAdditionalNotes').value = '';

    // Show modal
    document.getElementById('markBackJobModal').style.display = 'block';
}

/**
 * Confirm and create back job repair
 */
async function confirmMarkAsBackJob() {
    const originalRepairId = document.getElementById('backJobOriginalRepairId').value;
    const backJobReason = document.getElementById('backJobReason').value.trim();
    const additionalNotes = document.getElementById('backJobAdditionalNotes').value.trim();

    // Validation
    if (!backJobReason || backJobReason.length < 10) {
        alert('⚠️ Please provide a detailed reason (minimum 10 characters)');
        return;
    }

    const originalRepair = window.allRepairs.find(r => r.id === originalRepairId);
    if (!originalRepair) {
        alert('❌ Original repair not found');
        return;
    }

    // Final 90-day check
    const daysAgo = Math.floor((Date.now() - new Date(originalRepair.claimedAt)) / (1000 * 60 * 60 * 24));
    if (daysAgo > 90) {
        alert('❌ Cannot create back job: Outside 90-day warranty period');
        return;
    }

    try {
        utils.showLoading(true);

        // Create new repair entry as back job
        const now = new Date().toISOString();
        const newRepairData = {
            // Customer info (copied from original)
            customerType: originalRepair.customerType || 'Walk-in',
            shopName: originalRepair.shopName || null,
            customerName: originalRepair.customerName,
            contactNumber: originalRepair.contactNumber,

            // Device info (copied from original)
            brand: originalRepair.brand,
            model: originalRepair.model,
            imei: originalRepair.imei || null,
            serialNumber: originalRepair.serialNumber || null,
            password: originalRepair.password || null,

            // Problem info
            problemType: originalRepair.problemType,
            problemDescription: `BACK JOB: ${backJobReason}${additionalNotes ? '\\n\\nAdditional: ' + additionalNotes : ''}`,

            // Back job specific fields
            isBackJob: true,
            backJobReason: backJobReason,
            originalRepairId: originalRepairId,
            originalTechId: originalRepair.acceptedBy,
            originalTechName: originalRepair.acceptedByName,

            // Status and assignment
            status: 'In Progress',
            acceptedBy: originalRepair.acceptedBy,  // Auto-assign to original tech
            acceptedByName: originalRepair.acceptedByName,
            acceptedAt: now,

            // Warranty claim flags
            isWarrantyClaim: true,
            warrantyClaimType: 'same_issue',
            linkedRepairId: originalRepairId,

            // Pricing (no charge for back jobs)
            total: 0,
            partsCost: 0,
            laborCost: 0,
            customerApproved: true,
            approvedAt: now,

            // Tracking
            receivedAt: now,
            recordedDate: now,
            receivedBy: window.currentUser.uid,
            receivedByName: window.currentUserData.displayName,
            createdBy: window.currentUser.uid,
            lastUpdated: now,
            lastUpdatedBy: window.currentUserData.displayName,

            // Metadata
            deleted: false
        };

        // Create new repair
        const newRepairRef = await db.ref('repairs').push(newRepairData);
        const newRepairId = newRepairRef.key;

        console.log('✅ Back job repair created:', newRepairId);

        // Update original repair with back job link
        await db.ref(`repairs/${originalRepairId}`).update({
            hasBackJobId: newRepairId,
            hasBackJobCreatedAt: now,
            lastUpdated: now,
            lastUpdatedBy: window.currentUserData.displayName
        });

        console.log('✅ Original repair updated with back job link');

        // Log activity
        await logActivity('back_job_created', {
            originalRepairId: originalRepairId,
            newRepairId: newRepairId,
            technicianId: originalRepair.acceptedBy,
            technicianName: originalRepair.acceptedByName,
            customerName: originalRepair.customerName,
            device: `${originalRepair.brand} ${originalRepair.model}`,
            reason: backJobReason
        }, `Back job created for ${originalRepair.customerName} (${originalRepair.brand} ${originalRepair.model}) - assigned to ${originalRepair.acceptedByName}`);

        utils.showLoading(false);
        closeMarkBackJobModal();

        // Success message
        alert(`✅ Back job created successfully!\\n\\nRepair ID: ${newRepairId}\\nAssigned to: ${originalRepair.acceptedByName}\\n\\nThe technician will see this in their "My Jobs" tab.`);

        // Refresh view
        if (window.currentTabRefresh) {
            setTimeout(() => window.currentTabRefresh(), 300);
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error creating back job:', error);
        alert('Error creating back job: ' + error.message);
    }
}

/**
 * Close mark as back job modal
 */
function closeMarkBackJobModal() {
    document.getElementById('markBackJobModal').style.display = 'none';
}

/**
 * Toggle finalize payment fields visibility
 */
function toggleFinalizePaymentFields() {
    const checkbox = document.getElementById('finalizePaymentCheckbox');
    const fields = document.getElementById('finalizePaymentFields');
    const repairId = document.getElementById('finalizeRepairId').value;

    if (checkbox.checked) {
        fields.style.display = 'block';

        // Pre-fill payment amount with remaining balance
        const repair = window.allRepairs.find(r => r.id === repairId);
        if (repair) {
            const totalPaid = (repair.payments || [])
                .filter(p => p.verified)
                .reduce((sum, p) => sum + p.amount, 0);
            const balance = repair.total - totalPaid;

            document.getElementById('finalizePaymentAmount').value = balance > 0 ? balance.toFixed(2) : '';
            document.getElementById('finalizeBalanceNote').textContent =
                `Remaining balance: ₱${balance.toFixed(2)}`;
        }
    } else {
        fields.style.display = 'none';
    }
}

/**
 * Toggle GCash reference field
 */
function toggleFinalizeGCashField() {
    const method = document.getElementById('finalizePaymentMethod').value;
    const gcashGroup = document.getElementById('finalizeGCashReferenceGroup');

    if (method === 'GCash') {
        gcashGroup.style.display = 'block';
    } else {
        gcashGroup.style.display = 'none';
        document.getElementById('finalizeGCashReference').value = '';
    }
}

/**
 * Open Edit Device Info Modal
 */
function openEditDeviceModal(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }

    // Populate form fields
    document.getElementById('editDeviceRepairId').value = repairId;
    document.getElementById('editCustomerName').value = repair.customerName || '';
    document.getElementById('editContactNumber').value = repair.contactNumber || '';
    document.getElementById('editBrand').value = repair.brand || '';
    document.getElementById('editModel').value = repair.model || '';
    document.getElementById('editImei').value = repair.imei || '';
    document.getElementById('editColor').value = repair.deviceColor || '';
    document.getElementById('editStorage').value = repair.storageCapacity || '';
    document.getElementById('editPasscode').value = repair.devicePasscode || '';
    document.getElementById('editProblem').value = repair.problem || '';
    document.getElementById('editReason').value = '';

    document.getElementById('editDeviceModal').style.display = 'block';
}

/**
 * Save Device Info Changes
 */
async function saveDeviceInfo() {
    const repairId = document.getElementById('editDeviceRepairId').value;
    const customerName = document.getElementById('editCustomerName').value.trim();
    const contactNumber = document.getElementById('editContactNumber').value.trim();
    const brand = document.getElementById('editBrand').value.trim();
    const model = document.getElementById('editModel').value.trim();
    const imei = document.getElementById('editImei').value.trim();
    const color = document.getElementById('editColor').value.trim();
    const storage = document.getElementById('editStorage').value.trim();
    const passcode = document.getElementById('editPasscode').value.trim();
    const problem = document.getElementById('editProblem').value.trim();
    const editReason = document.getElementById('editReason').value.trim();

    // Validation
    if (!customerName || !contactNumber || !brand || !model) {
        alert('⚠️ Please fill in all required fields (Customer Name, Contact, Brand, Model)');
        return;
    }

    if (!editReason) {
        alert('⚠️ Please provide a reason for editing');
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }

    // Build change log
    const changes = [];
    if (repair.customerName !== customerName) changes.push(`Customer Name: "${repair.customerName}" → "${customerName}"`);
    if (repair.contactNumber !== contactNumber) changes.push(`Contact: "${repair.contactNumber}" → "${contactNumber}"`);
    if (repair.brand !== brand) changes.push(`Brand: "${repair.brand}" → "${brand}"`);
    if (repair.model !== model) changes.push(`Model: "${repair.model}" → "${model}"`);
    if ((repair.imei || '') !== imei) changes.push(`IMEI: "${repair.imei || 'N/A'}" → "${imei || 'N/A'}"`);
    if ((repair.deviceColor || '') !== color) changes.push(`Color: "${repair.deviceColor || 'N/A'}" → "${color || 'N/A'}"`);
    if ((repair.storageCapacity || '') !== storage) changes.push(`Storage: "${repair.storageCapacity || 'N/A'}" → "${storage || 'N/A'}"`);
    if ((repair.devicePasscode || '') !== passcode) changes.push(`Passcode: "${repair.devicePasscode || 'N/A'}" → "${passcode || 'N/A'}"`);
    if ((repair.problem || '') !== problem) changes.push(`Problem: "${repair.problem || 'N/A'}" → "${problem || 'N/A'}"`);

    if (changes.length === 0) {
        alert('ℹ️ No changes detected');
        return;
    }

    const confirmMsg = `Save these changes?\n\n${changes.join('\n')}\n\nReason: ${editReason}`;
    if (!confirm(confirmMsg)) return;

    try {
        utils.showLoading(true);

        // Update device info
        await db.ref(`repairs/${repairId}`).update({
            customerName: customerName,
            contactNumber: contactNumber,
            brand: brand,
            model: model,
            imei: imei,
            deviceColor: color || 'N/A',
            storageCapacity: storage || 'N/A',
            devicePasscode: passcode,
            problem: problem,
            lastEditedAt: new Date().toISOString(),
            lastEditedBy: window.currentUser.uid,
            lastEditedByName: window.currentUserData.displayName,
            lastEditReason: editReason
        });

        // Log the edit
        await logActivity('device_info_edited', {
            repairId: repairId,
            changes: changes,
            reason: editReason,
            editedBy: window.currentUserData.displayName
        }, `${window.currentUserData.displayName} edited device info for ${customerName} - ${brand} ${model}`);

        utils.showLoading(false);
        alert('✅ Device information updated successfully!');
        closeEditDeviceModal();

        // Reload repairs
        await loadRepairs();

        // Refresh current view
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error updating device info:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Close Edit Device Modal
 */
function closeEditDeviceModal() {
    document.getElementById('editDeviceModal').style.display = 'none';
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
window.refundAdvancePayment = refundAdvancePayment;
window.showRefundModal = showRefundModal;
window.submitRefundRequest = submitRefundRequest;
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
window.finalizeClaimDevice = finalizeClaimDevice;
window.openFinalizeModal = openFinalizeModal;
window.confirmFinalizeDevice = confirmFinalizeDevice;
window.closeFinalizeModal = closeFinalizeModal;
window.openMarkAsBackJobModal = openMarkAsBackJobModal;
window.confirmMarkAsBackJob = confirmMarkAsBackJob;
window.closeMarkBackJobModal = closeMarkBackJobModal;
window.toggleFinalizePaymentFields = toggleFinalizePaymentFields;
window.toggleFinalizeGCashField = toggleFinalizeGCashField;
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
 * Admin: Delete individual payment from a repair
 */
async function adminDeletePayment(repairId, paymentIndex) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair || !repair.payments || !repair.payments[paymentIndex]) {
        alert('❌ Payment not found');
        return;
    }

    const payment = repair.payments[paymentIndex];
    const paymentDate = new Date(payment.recordedDate || payment.paymentDate).toISOString().split('T')[0];

    // Check if payment date is locked
    if (!preventBackdating(paymentDate)) {
        alert('⚠️ Cannot delete payment from locked date!\n\nThis payment date has been locked. Please unlock it first if you need to make changes.');
        return;
    }

    // Show payment details and confirm
    const confirmed = confirm(
        `⚠️ DELETE PAYMENT ⚠️\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Amount: ₱${payment.amount.toFixed(2)}\n` +
        `Method: ${payment.method}\n` +
        `Date: ${utils.formatDate(payment.paymentDate)}\n` +
        `Received by: ${payment.receivedBy}\n` +
        `${payment.verified ? '✅ Verified' : '⏳ Pending verification'}\n\n` +
        `This will DELETE this payment transaction.\n\n` +
        `Click OK to continue...`
    );

    if (!confirmed) return;

    // Require reason
    const reason = prompt('Please enter reason for deleting this payment:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required to delete a payment');
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
            type: 'payment_deletion',
            repairId: repairId,
            customerName: repair.customerName,
            payment: payment,
            paymentIndex: paymentIndex,
            deletedAt: now,
            deletedBy: window.currentUserData.displayName,
            deletedById: window.currentUser.uid,
            deleteReason: reason
        };

        await db.ref('deletedTransactions').push(backup);

        // Remove payment from array
        const updatedPayments = repair.payments.filter((p, idx) => idx !== paymentIndex);

        await db.ref(`repairs/${repairId}`).update({
            payments: updatedPayments,
            lastUpdated: now,
            lastUpdatedBy: window.currentUserData.displayName
        });

        // Log activity
        await logActivity('payment_deleted', {
            repairId: repairId,
            customerName: repair.customerName,
            amount: payment.amount,
            method: payment.method,
            paymentDate: payment.paymentDate,
            verified: payment.verified,
            reason: reason
        }, `Payment deleted: ₱${payment.amount.toFixed(2)} from ${repair.customerName} - Reason: ${reason}`);

        utils.showLoading(false);
        alert(`✅ Payment Deleted!\n\n₱${payment.amount.toFixed(2)} payment from ${repair.customerName}\n\nBackup: Saved for audit\nReason: ${reason}`);

        // Refresh
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        if (window.buildStats) {
            window.buildStats();
        }

    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Deletion cancelled.');
        } else {
            console.error('❌ Error deleting payment:', error);
            alert('Error: ' + error.message);
        }
    }
}

/**
 * Admin: Un-remit a payment (reset to pending status)
 */
async function adminUnremitPayment(repairId, paymentIndex) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair || !repair.payments || !repair.payments[paymentIndex]) {
        alert('❌ Payment not found');
        return;
    }

    const payment = repair.payments[paymentIndex];

    // Check current status
    if (payment.remittanceStatus !== 'remitted') {
        alert(`ℹ️ This payment is already in "${payment.remittanceStatus || 'pending'}" status.\n\nNo action needed.`);
        return;
    }

    // Show payment details and confirm
    const confirmed = confirm(
        `⚠️ UN-REMIT PAYMENT ⚠️\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Amount: ₱${payment.amount.toFixed(2)}\n` +
        `Method: ${payment.method}\n` +
        `Date: ${utils.formatDate(payment.paymentDate)}\n` +
        `Received by: ${payment.receivedByName || payment.receivedBy}\n` +
        `Current Status: REMITTED\n\n` +
        `This will reset this payment to PENDING status.\n` +
        `The payment will appear in the technician's daily remittance again.\n\n` +
        `Use this when a payment was incorrectly marked as remitted,\n` +
        `or when you need to fix a rejected remittance.\n\n` +
        `Click OK to continue...`
    );

    if (!confirmed) return;

    // Require reason
    const reason = prompt('Please enter reason for un-remitting this payment:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required');
        return;
    }

    try {
        utils.showLoading(true);

        const now = new Date().toISOString();
        const updatedPayments = [...repair.payments];

        // Reset payment to pending status
        updatedPayments[paymentIndex] = {
            ...payment,
            remittanceStatus: 'pending',
            techRemittanceId: null,
            unremittedBy: window.currentUserData.displayName,
            unremittedAt: now,
            unremitReason: reason
        };

        await db.ref(`repairs/${repairId}`).update({
            payments: updatedPayments,
            lastUpdated: now,
            lastUpdatedBy: window.currentUserData.displayName
        });

        // Log activity
        await logActivity('payment_unremitted', {
            repairId: repairId,
            customerName: repair.customerName,
            amount: payment.amount,
            method: payment.method,
            paymentDate: payment.paymentDate,
            reason: reason
        }, `Payment un-remitted: ₱${payment.amount.toFixed(2)} from ${repair.customerName} - Reason: ${reason}`);

        // Reload repairs to get fresh data
        await loadRepairs();

        utils.showLoading(false);
        alert(`✅ Payment Un-Remitted!\n\n₱${payment.amount.toFixed(2)} from ${repair.customerName}\n\nStatus: REMITTED → PENDING\n\nThis payment will now appear in the technician's daily remittance.`);

        // Refresh current tab and stats
        setTimeout(() => {
            if (window.currentTabRefresh) {
                window.currentTabRefresh();
            }
            if (window.buildStats) {
                window.buildStats();
            }
        }, 300);

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error un-remitting payment:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Admin: Delete individual expense
 */
async function adminDeleteExpense(expenseId) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    const expense = window.allExpenses ? window.allExpenses.find(e => e.id === expenseId) : null;
    if (!expense) {
        alert('❌ Expense not found');
        return;
    }

    const expenseDate = new Date(expense.date).toISOString().split('T')[0];

    // Check if expense date is locked
    if (!preventBackdating(expenseDate)) {
        alert('⚠️ Cannot delete expense from locked date!\n\nThis expense date has been locked. Please unlock it first if you need to make changes.');
        return;
    }

    // Show expense details and confirm
    const confirmed = confirm(
        `⚠️ DELETE EXPENSE ⚠️\n\n` +
        `Category: ${expense.category}\n` +
        `Amount: ₱${expense.amount.toFixed(2)}\n` +
        `Description: ${expense.description || 'N/A'}\n` +
        `Date: ${utils.formatDate(expense.date)}\n` +
        `Recorded by: ${expense.recordedBy}\n\n` +
        `This will DELETE this expense transaction.\n\n` +
        `Click OK to continue...`
    );

    if (!confirmed) return;

    // Require reason
    const reason = prompt('Please enter reason for deleting this expense:');
    if (!reason || !reason.trim()) {
        alert('⚠️ Reason is required to delete an expense');
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
            type: 'expense_deletion',
            expense: expense,
            deletedAt: now,
            deletedBy: window.currentUserData.displayName,
            deletedById: window.currentUser.uid,
            deleteReason: reason
        };

        await db.ref('deletedTransactions').push(backup);

        // Delete expense
        await db.ref(`expenses/${expenseId}`).remove();

        // Log activity
        await logActivity('expense_deleted', {
            expenseId: expenseId,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            reason: reason
        }, `Expense deleted: ₱${expense.amount.toFixed(2)} (${expense.category}) - Reason: ${reason}`);

        utils.showLoading(false);
        alert(`✅ Expense Deleted!\n\n₱${expense.amount.toFixed(2)} (${expense.category})\n\nBackup: Saved for audit\nReason: ${reason}`);

        // Refresh
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        if (window.buildStats) {
            window.buildStats();
        }

    } catch (error) {
        utils.showLoading(false);
        if (error.code === 'auth/wrong-password') {
            alert('❌ Incorrect password. Deletion cancelled.');
        } else {
            console.error('❌ Error deleting expense:', error);
            alert('Error: ' + error.message);
        }
    }
}

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
 * Admin: Add payment to an already-released or claimed device
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

    // Allow Released or Claimed status
    if (repair.status !== 'Released' && repair.status !== 'Claimed') {
        alert('⚠️ Can only add payments to Released or Claimed devices');
        return;
    }

    // Show repair details
    const totalAmount = repair.total || 0;
    const totalPaid = repair.payments ? repair.payments.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const balance = totalAmount - totalPaid;

    const amount = prompt(
        `💰 Add Payment to ${repair.status} Device\n\n` +
        `Customer: ${repair.customerName}\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Status: ${repair.status}\n` +
        `${repair.claimedAt ? 'Released: ' + utils.formatDateTime(repair.claimedAt) : ''}\n\n` +
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
            verifiedAt: new Date().toISOString(),
            addedPostClaim: repair.status === 'Claimed'  // Flag for audit trail
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

        // Store the original claim info for backup (filter out undefined values)
        const claimBackup = {
            unreleaseReason: reason,
            unreleasedBy: window.currentUserData.displayName,
            unreleasedAt: new Date().toISOString()
        };

        // Only add properties that exist (not undefined/null)
        if (repair.status) claimBackup.originalStatus = repair.status;
        if (repair.releasedAt) claimBackup.releasedAt = repair.releasedAt;
        if (repair.releaseDate) claimBackup.releaseDate = repair.releaseDate;
        if (repair.claimedAt) claimBackup.claimedAt = repair.claimedAt;
        if (repair.claimedBy) claimBackup.claimedBy = repair.claimedBy;
        if (repair.claimedByName) claimBackup.claimedByName = repair.claimedByName;
        if (repair.claimVerified) claimBackup.claimVerified = repair.claimVerified;
        if (repair.claimVerifiedBy) claimBackup.claimVerifiedBy = repair.claimVerifiedBy;
        if (repair.claimVerifiedByName) claimBackup.claimVerifiedByName = repair.claimVerifiedByName;
        if (repair.claimVerifiedAt) claimBackup.claimVerifiedAt = repair.claimVerifiedAt;
        if (repair.pickupSignature) claimBackup.pickupSignature = repair.pickupSignature;
        if (repair.releasedWithBalance) claimBackup.releasedWithBalance = repair.releasedWithBalance;
        if (repair.balanceNotes) claimBackup.balanceNotes = repair.balanceNotes;

        // Save backup
        await db.ref('unreleasedBackups').push({
            repairId: repairId,
            customerName: repair.customerName,
            backup: claimBackup
        });

        // Update repair status
        await db.ref(`repairs/${repairId}`).update({
            status: 'For Release',  // Set back to For Release
            releasedAt: null,       // Clear release timestamp
            releaseDate: null,      // Clear release date
            claimedAt: null,
            claimedBy: null,
            claimedByName: null,
            claimVerified: null,
            claimVerifiedBy: null,
            claimVerifiedByName: null,
            claimVerifiedAt: null,
            pickupSignature: null,
            releasedWithBalance: null,  // Clear balance release info
            balanceNotes: null,
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

/**
 * Admin: Bulk verify unverified retroactive payments
 * Fixes historical payments from old retroactive intakes that lack verification fields
 */
async function adminBulkVerifyRetroactivePayments() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    try {
        utils.showLoading(true);

        // Find all repairs with unverified retroactive payments
        const repairsToFix = [];
        let totalUnverifiedPayments = 0;

        window.allRepairs.forEach(repair => {
            if (!repair.payments || repair.payments.length === 0) return;

            const unverifiedRetroactive = repair.payments.filter(p =>
                p.collectedDuringIntake === true &&
                (p.verified === false || p.verified === undefined || p.verified === null)
            );

            if (unverifiedRetroactive.length > 0) {
                repairsToFix.push({
                    id: repair.id,
                    customerName: repair.customerName,
                    device: `${repair.brand} ${repair.model}`,
                    status: repair.status,
                    unverifiedCount: unverifiedRetroactive.length,
                    totalUnverified: unverifiedRetroactive.reduce((sum, p) => sum + p.amount, 0)
                });
                totalUnverifiedPayments += unverifiedRetroactive.length;
            }
        });

        utils.showLoading(false);

        if (repairsToFix.length === 0) {
            alert('✅ No Unverified Retroactive Payments Found!\n\nAll retroactive payments are properly verified.');
            return;
        }

        // Show summary
        const summary = repairsToFix.slice(0, 10).map(r =>
            `- ${r.customerName} (${r.device}): ${r.unverifiedCount} payment(s) - ₱${r.totalUnverified.toFixed(2)}`
        ).join('\n');

        const confirmMsg = `🔍 BULK PAYMENT VERIFICATION\n\n` +
            `Found ${totalUnverifiedPayments} unverified payment(s) in ${repairsToFix.length} repair(s)\n\n` +
            `Sample repairs:\n${summary}` +
            `${repairsToFix.length > 10 ? '\n... and ' + (repairsToFix.length - 10) + ' more' : ''}\n\n` +
            `This will:\n` +
            `✓ Mark all retroactive payments as verified\n` +
            `✓ Add verification timestamp and admin name\n` +
            `✓ Enable commission calculation for these payments\n` +
            `✓ Create audit log\n\n` +
            `Continue with bulk verification?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        // Perform bulk verification
        utils.showLoading(true);
        let successCount = 0;
        let failCount = 0;
        const now = new Date().toISOString();

        for (const repairInfo of repairsToFix) {
            try {
                const repair = window.allRepairs.find(r => r.id === repairInfo.id);
                if (!repair) continue;

                // Update payments array
                const updatedPayments = repair.payments.map(payment => {
                    if (payment.collectedDuringIntake === true &&
                        (payment.verified === false || payment.verified === undefined || payment.verified === null)) {
                        return {
                            ...payment,
                            verified: true,
                            verifiedBy: window.currentUserData.displayName,
                            verifiedAt: now,
                            bulkVerified: true,  // Flag for audit trail
                            bulkVerifiedReason: 'Admin bulk verification - retroactive intake payment fix'
                        };
                    }
                    return payment;
                });

                await db.ref(`repairs/${repairInfo.id}`).update({
                    payments: updatedPayments,
                    lastUpdated: now,
                    lastUpdatedBy: window.currentUserData.displayName
                });

                successCount++;

            } catch (error) {
                console.error(`❌ Error verifying payments for repair ${repairInfo.id}:`, error);
                failCount++;
            }
        }

        // Log the bulk action
        await logActivity('admin_bulk_verify_payments', 'admin', {
            totalRepairs: repairsToFix.length,
            totalPayments: totalUnverifiedPayments,
            successCount: successCount,
            failCount: failCount,
            timestamp: now
        });

        utils.showLoading(false);

        alert(
            `✅ BULK VERIFICATION COMPLETE!\n\n` +
            `Successfully verified: ${successCount} repair(s)\n` +
            `Failed: ${failCount} repair(s)\n` +
            `Total payments verified: ${totalUnverifiedPayments}\n\n` +
            `Technicians can now claim commissions for these repairs once finalized.`
        );

        // Reload data
        await loadRepairs();
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error in bulk verification:', error);
        alert('Error: ' + error.message);
    }
}

// Admin correction functions exports
window.adminAddPaymentToReleased = adminAddPaymentToReleased;
window.adminUnreleaseDevice = adminUnreleaseDevice;
window.adminBulkVerifyRetroactivePayments = adminBulkVerifyRetroactivePayments;

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
window.openInventorySelectionModal = openInventorySelectionModal;
window.loadAvailableInventoryItems = loadAvailableInventoryItems;
window.filterInventoryItems = filterInventoryItems;
window.toggleInventoryItem = toggleInventoryItem;
window.changeItemQuantity = changeItemQuantity;
window.updateItemQuantity = updateItemQuantity;
window.updateSelectedItemsSummary = updateSelectedItemsSummary;
window.saveSelectedInventoryItems = saveSelectedInventoryItems;
window.closeInventorySelectionModal = closeInventorySelectionModal;

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
            loginHistory: {},

            // Compensation settings
            compensationType: role === 'technician' ? 'commission' : 'none',
            commissionRate: role === 'technician' ? 0.40 : (role === 'admin' || role === 'manager' ? 0.60 : 0),
            monthlySalary: 0,
            hybridCommissionRate: 0,
            commissionRateHistory: [{
                rate: role === 'technician' ? 0.40 : (role === 'admin' || role === 'manager' ? 0.60 : 0),
                changedBy: window.currentUserData.displayName,
                changedById: window.currentUser.uid,
                changedAt: new Date().toISOString(),
                reason: 'Initial setup'
            }]
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

        // Auto-close and refresh page
        setTimeout(() => {
            location.reload();
        }, 300);

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
    const user = window.allUsers[userId];
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

    const user = window.allUsers[userId];
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

        // Auto-close and refresh page
        setTimeout(() => {
            location.reload();
        }, 300);

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
    const user = window.allUsers[userId];
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
    const user = window.allUsers[userId];
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

/**
 * ========================================
 * COMPENSATION MANAGEMENT
 * ========================================
 */

/**
 * Open compensation management modal
 */
function openCompensationModal(userId) {
    const user = window.allUsers[userId];
    if (!user) {
        alert('User not found');
        return;
    }

    // Populate user info
    document.getElementById('compensationUserId').value = userId;
    document.getElementById('compensationUserName').textContent = user.displayName;
    document.getElementById('compensationUserRole').textContent = user.role.toUpperCase();

    // Populate current compensation settings
    const compensationType = user.compensationType || 'commission';
    document.getElementById('compensationType').value = compensationType;

    // Set current values
    document.getElementById('commissionRate').value = user.commissionRate ? (user.commissionRate * 100).toFixed(0) : '';
    document.getElementById('monthlySalary').value = user.monthlySalary || '';
    document.getElementById('hybridCommissionRate').value = user.hybridCommissionRate ? (user.hybridCommissionRate * 100).toFixed(0) : '';
    document.getElementById('compensationReason').value = '';

    // Show/hide fields based on type
    handleCompensationTypeChange();

    // Show history if exists
    if (user.commissionRateHistory && user.commissionRateHistory.length > 0) {
        const historySection = document.getElementById('compensationHistorySection');
        const historyContainer = document.getElementById('compensationHistory');
        historySection.style.display = 'block';

        historyContainer.innerHTML = user.commissionRateHistory
            .slice()
            .reverse() // Show newest first
            .map(entry => `
                <div style="padding:8px;border-bottom:1px solid #ddd;font-size:12px;">
                    <div style="font-weight:600;">
                        ${entry.compensationType === 'salary' ? `Salary: ₱${(entry.monthlySalary || 0).toLocaleString()}/mo` :
                    entry.compensationType === 'hybrid' ? `Hybrid: ₱${(entry.monthlySalary || 0).toLocaleString()}/mo + ${(entry.rate * 100).toFixed(0)}%` :
                        entry.compensationType === 'commission' ? `Commission: ${(entry.rate * 100).toFixed(0)}%` :
                            'None'}
                    </div>
                    <div style="color:#666;margin-top:3px;">
                        ${utils.formatDateTime(entry.changedAt)} by ${entry.changedBy}
                    </div>
                    ${entry.reason ? `<div style="color:#999;margin-top:2px;font-style:italic;">"${entry.reason}"</div>` : ''}
                </div>
            `).join('');
    } else {
        document.getElementById('compensationHistorySection').style.display = 'none';
    }

    document.getElementById('compensationModal').style.display = 'flex';
}

/**
 * Close compensation modal
 */
function closeCompensationModal() {
    document.getElementById('compensationModal').style.display = 'none';
    document.getElementById('compensationForm').reset();
}

/**
 * Handle compensation type change
 */
function handleCompensationTypeChange() {
    const type = document.getElementById('compensationType').value;

    // Show/hide fields based on type
    document.getElementById('commissionRateField').style.display =
        (type === 'commission') ? 'block' : 'none';

    document.getElementById('monthlySalaryField').style.display =
        (type === 'salary' || type === 'hybrid') ? 'block' : 'none';

    document.getElementById('hybridCommissionRateField').style.display =
        (type === 'hybrid') ? 'block' : 'none';

    // Set required flags
    document.getElementById('commissionRate').required = (type === 'commission');
    document.getElementById('monthlySalary').required = (type === 'salary' || type === 'hybrid');
    document.getElementById('hybridCommissionRate').required = (type === 'hybrid');
}

/**
 * Save compensation settings
 */
async function saveCompensationSettings(event) {
    event.preventDefault();

    const userId = document.getElementById('compensationUserId').value;
    const user = window.allUsers[userId];
    if (!user) {
        alert('User not found');
        return;
    }

    const compensationType = document.getElementById('compensationType').value;
    const reason = document.getElementById('compensationReason').value.trim();

    if (!compensationType) {
        alert('Please select a compensation type');
        return;
    }

    if (!reason || reason.length < 10) {
        alert('Please provide a reason (minimum 10 characters)');
        return;
    }

    // Build updates object
    const updates = {
        compensationType: compensationType,
        compensationChangedAt: new Date().toISOString(),
        compensationChangedBy: window.currentUserData.displayName
    };

    // Get values based on type
    let rate = 0;
    let monthlySalary = 0;
    let hybridCommissionRate = 0;

    if (compensationType === 'commission') {
        const ratePercent = parseFloat(document.getElementById('commissionRate').value);
        if (isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
            alert('Please enter a valid commission rate (0-100)');
            return;
        }
        rate = ratePercent / 100;
        updates.commissionRate = rate;
        updates.monthlySalary = 0;
        updates.hybridCommissionRate = 0;

    } else if (compensationType === 'salary') {
        monthlySalary = parseFloat(document.getElementById('monthlySalary').value);
        if (isNaN(monthlySalary) || monthlySalary < 0) {
            alert('Please enter a valid monthly salary');
            return;
        }
        rate = 0; // No commission for salary
        updates.commissionRate = 0;
        updates.monthlySalary = monthlySalary;
        updates.hybridCommissionRate = 0;

    } else if (compensationType === 'hybrid') {
        monthlySalary = parseFloat(document.getElementById('monthlySalary').value);
        const hybridRatePercent = parseFloat(document.getElementById('hybridCommissionRate').value);

        if (isNaN(monthlySalary) || monthlySalary < 0) {
            alert('Please enter a valid monthly salary');
            return;
        }
        if (isNaN(hybridRatePercent) || hybridRatePercent < 0 || hybridRatePercent > 100) {
            alert('Please enter a valid hybrid commission rate (0-100)');
            return;
        }

        hybridCommissionRate = hybridRatePercent / 100;
        rate = hybridCommissionRate; // Store for history
        updates.commissionRate = 0; // Not used for hybrid (uses hybridCommissionRate)
        updates.monthlySalary = monthlySalary;
        updates.hybridCommissionRate = hybridCommissionRate;

    } else { // 'none'
        updates.commissionRate = 0;
        updates.monthlySalary = 0;
        updates.hybridCommissionRate = 0;
    }

    // Add to rate history
    const historyEntry = {
        compensationType: compensationType,
        rate: rate,
        monthlySalary: monthlySalary,
        hybridCommissionRate: hybridCommissionRate,
        changedBy: window.currentUserData.displayName,
        changedAt: new Date().toISOString(),
        reason: reason
    };

    const existingHistory = user.commissionRateHistory || [];
    updates.commissionRateHistory = [...existingHistory, historyEntry];

    // Confirm before saving
    let confirmMsg = `💰 Update Compensation for ${user.displayName}?\n\n`;
    if (compensationType === 'salary') {
        confirmMsg += `Type: Salary Only\nAmount: ₱${monthlySalary.toLocaleString()}/month`;
    } else if (compensationType === 'hybrid') {
        confirmMsg += `Type: Hybrid\nSalary: ₱${monthlySalary.toLocaleString()}/month\nCommission: ${(hybridCommissionRate * 100).toFixed(0)}%`;
    } else if (compensationType === 'commission') {
        confirmMsg += `Type: Commission Only\nRate: ${(rate * 100).toFixed(0)}%`;
    } else {
        confirmMsg += `Type: None`;
    }
    confirmMsg += `\n\nReason: ${reason}`;
    confirmMsg += `\n\n⚠️ This will apply to future repairs only.`;

    if (!confirm(confirmMsg)) return;

    try {
        utils.showLoading(true);

        await db.ref(`users/${userId}`).update(updates);

        // Log activity
        await logActivity('compensation_changed', {
            userId: userId,
            compensationType: compensationType,
            rate: rate,
            monthlySalary: monthlySalary,
            hybridCommissionRate: hybridCommissionRate,
            reason: reason
        }, `${window.currentUserData.displayName} updated compensation for ${user.displayName}`);

        utils.showLoading(false);
        alert('✅ Compensation settings saved successfully!');
        closeCompensationModal();

        // Refresh page
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error saving compensation:', error);
        alert('Error saving compensation: ' + error.message);
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
window.openCompensationModal = openCompensationModal;
window.closeCompensationModal = closeCompensationModal;
window.handleCompensationTypeChange = handleCompensationTypeChange;
window.saveCompensationSettings = saveCompensationSettings;
window.closePartsCostModal = closePartsCostModal;
window.openExpenseModal = openExpenseModal;
window.saveExpense = saveExpense;
window.closeExpenseModal = closeExpenseModal;
window.viewRepairExpenses = viewRepairExpenses;
window.deleteExpense = deleteExpense;
window.getTechDailyPayments = getTechDailyPayments;
window.getTechDailyGCashPayments = getTechDailyGCashPayments;
window.getTechDailyExpenses = getTechDailyExpenses;
window.getTechDailyPartsCosts = getTechDailyPartsCosts;
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
window.markCommissionAsPaid = markCommissionAsPaid;
window.closeVerifyRemittanceModal = closeVerifyRemittanceModal;
window.openGCashRemittanceModal = openGCashRemittanceModal;
window.confirmGCashRemittance = confirmGCashRemittance;
window.verifyGCashRemittance = verifyGCashRemittance;
window.getPendingGCashDates = getPendingGCashDates;

/**
 * ============================================
 * DEBUG FUNCTIONS
 * ============================================
 */

/**
 * DEBUG: Dump payment details for a repair
 * Usage: window.debugPaymentStatus('repairId')
 */
function debugPaymentStatus(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        console.error('Repair not found:', repairId);
        return;
    }

    console.log('=== PAYMENT DEBUG ===');
    console.log('Repair ID:', repairId);
    console.log('Customer:', repair.customerName);
    console.log('Device:', repair.brand, repair.model);
    console.log('Total:', repair.total);
    console.log('Assigned Technician:', repair.acceptedByName, `(${repair.acceptedBy})`);
    console.log('Status:', repair.status);
    console.log('\nPAYMENTS:');

    if (!repair.payments || repair.payments.length === 0) {
        console.log('  No payments recorded');
        return;
    }

    let totalPaid = 0;
    repair.payments.forEach((p, i) => {
        console.log(`\n  Payment #${i}:`);
        console.log('    Amount:', p.amount);
        console.log('    Method:', p.method);
        console.log('    Payment Date:', p.paymentDate || p.recordedDate);
        console.log('    Recorded By:', p.receivedBy, `(${p.receivedById})`);
        console.log('    Verified:', p.verified ? `Yes - by ${p.verifiedBy} at ${p.verifiedAt}` : 'No');
        console.log('    Collected by Tech:', p.collectedByTech || false);
        console.log('    Remittance Status:', p.remittanceStatus || 'N/A');
        console.log('    Remittance ID:', p.techRemittanceId || 'None');
        if (p.verified) {
            totalPaid += p.amount;
        }
    });

    console.log('\n  TOTAL VERIFIED:', totalPaid);
    console.log('  BALANCE:', repair.total - totalPaid);
    console.log('  FULLY PAID:', totalPaid >= repair.total);

    // Commission info
    console.log('\nCOMMISSION INFO:');
    console.log('  Claimed By:', repair.commissionClaimedBy || 'Not claimed');
    console.log('  Claimed At:', repair.commissionClaimedAt || 'N/A');
    console.log('  Remittance ID:', repair.commissionRemittanceId || 'N/A');

    return {
        repair: repair,
        summary: {
            total: repair.total,
            paid: totalPaid,
            balance: repair.total - totalPaid,
            fullyPaid: totalPaid >= repair.total,
            commissionClaimed: !!repair.commissionClaimedBy
        }
    };
}

/**
 * DEBUG: Show ALL technician payments (not just today)
 * Usage: window.debugAllTechPayments()
 */
function debugAllTechPayments() {
    const techId = window.currentUser.uid;
    console.log('=== ALL TECH PAYMENTS DEBUG ===');
    console.log('Technician:', window.currentUserData.displayName, `(${techId})`);
    console.log('\n');

    const allPayments = [];
    window.allRepairs.forEach(repair => {
        if (repair.payments) {
            repair.payments.forEach((payment, index) => {
                if (payment.collectedByTech && payment.receivedById === techId) {
                    allPayments.push({
                        repairId: repair.id,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        recordedDate: payment.recordedDate,
                        paymentDate: payment.paymentDate,
                        remittanceStatus: payment.remittanceStatus,
                        techRemittanceId: payment.techRemittanceId,
                        collectedByTech: payment.collectedByTech,
                        receivedById: payment.receivedById,
                        dateString: new Date(payment.recordedDate || payment.paymentDate).toDateString()
                    });
                }
            });
        }
    });

    console.log('Total payments by this tech:', allPayments.length);
    console.log('\nPending (not yet remitted):');
    allPayments.filter(p => p.remittanceStatus === 'pending').forEach(p => {
        console.log(`  ${p.customerName}: ₱${p.amount} - Date: ${p.dateString} - Recorded: ${p.recordedDate}`);
    });

    console.log('\nRemitted:');
    allPayments.filter(p => p.remittanceStatus === 'remitted').forEach(p => {
        console.log(`  ${p.customerName}: ₱${p.amount} - Date: ${p.dateString} - RemittanceID: ${p.techRemittanceId}`);
    });

    console.log('\nVerified:');
    allPayments.filter(p => p.remittanceStatus === 'verified').forEach(p => {
        console.log(`  ${p.customerName}: ₱${p.amount} - Date: ${p.dateString}`);
    });

    return allPayments;
}

/**
 * DEBUG: Show tech's daily remittance breakdown
 * Usage: window.debugDailyRemittance('2025-12-30')
 */
function debugDailyRemittance(dateString = null) {
    const techId = window.currentUser.uid;
    const date = dateString ? new Date(dateString) : new Date();
    const dateStr = date.toDateString();

    console.log('=== DAILY REMITTANCE DEBUG ===');
    console.log('Date:', dateStr);
    console.log('Technician:', window.currentUserData.displayName, `(${techId})`);

    // Payments
    const { payments, total: paymentsTotal } = getTechDailyPayments(techId, date);
    console.log('\nPAYMENTS COLLECTED:');
    console.log('  Count:', payments.length);
    console.log('  Total:', paymentsTotal);
    payments.forEach(p => {
        console.log(`  - ${p.customerName}: ₱${p.amount} (${p.method}) [${p.recordedDate}]`);
    });

    // Commission
    const { breakdown, total: commissionTotal } = getTechDailyCommission(techId, date);
    console.log('\nCOMMISSION:');
    console.log('  Count:', breakdown.length);
    console.log('  Total:', commissionTotal);
    breakdown.forEach(c => {
        console.log(`  - ${c.customerName}: ₱${c.commission} (Repair: ₱${c.repairTotal}, Parts: ₱${c.partsCost})`);
    });

    // Expenses
    const { expenses, total: expensesTotal } = getTechDailyExpenses(techId, date);
    console.log('\nEXPENSES:');
    console.log('  Count:', expenses.length);
    console.log('  Total:', expensesTotal);
    expenses.forEach(e => {
        console.log(`  - ${e.description}: ₱${e.amount} (${e.category})`);
    });

    // Summary - Correct calculation: shop's 60% minus expenses
    const shopShare = (paymentsTotal * 0.60) - expensesTotal;
    const expectedAmount = shopShare;
    console.log('\nSUMMARY:');
    console.log('  Total Payments:', paymentsTotal);
    console.log('  Tech Commission (40%):', commissionTotal);
    console.log('  Shop Share (60%):', paymentsTotal * 0.60);
    console.log('  Expenses:', expensesTotal);
    console.log('  AMOUNT TO REMIT (Shop Share - Expenses):', expectedAmount);

    // Check for submitted remittance
    const remittance = window.techRemittances.find(r => {
        const remDate = new Date(r.date).toDateString();
        return r.techId === techId && remDate === dateStr;
    });

    if (remittance) {
        console.log('\nREMITTANCE SUBMITTED:');
        console.log('  Submitted At:', remittance.submittedAt);
        console.log('  Submitted To:', remittance.submittedToName || 'N/A');
        console.log('  Actual Amount:', remittance.actualAmount);
        console.log('  Status:', remittance.status);
        console.log('  Verified By:', remittance.verifiedBy || 'Not verified');
    } else {
        console.log('\nNo remittance submitted for this date');
    }

    return {
        date: dateStr,
        payments: { items: payments, total: paymentsTotal },
        commission: { items: breakdown, total: commissionTotal },
        expenses: { items: expenses, total: expensesTotal },
        expectedAmount: expectedAmount,
        remittance: remittance || null
    };
}

/**
 * DEBUG: Find all repairs with commission issues
 */
function debugCommissionIssues() {
    console.log('=== COMMISSION ISSUES DEBUG ===');
    const issues = [];

    window.allRepairs.forEach(repair => {
        // Check for fully paid repairs without commission marked
        if (repair.payments && repair.payments.length > 0) {
            const totalPaid = repair.payments.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
            const fullyPaid = totalPaid >= (repair.total || 0);

            if (fullyPaid && repair.acceptedBy && repair.status === 'Claimed') {
                const hasClaimed = !!repair.commissionClaimedBy;
                const hasEligibleFlag = repair.commissionEligible;

                // Find what date it became fully paid
                let lastPaymentDate = null;
                let runningTotal = 0;
                const sortedPayments = [...repair.payments]
                    .filter(p => p.verified)
                    .sort((a, b) => new Date(a.verifiedAt || a.recordedDate) - new Date(b.verifiedAt || b.recordedDate));

                for (const p of sortedPayments) {
                    runningTotal += p.amount;
                    if (runningTotal >= repair.total) {
                        lastPaymentDate = p.verifiedAt || p.recordedDate;
                        break;
                    }
                }

                issues.push({
                    repairId: repair.id,
                    customer: repair.customerName,
                    total: repair.total,
                    paid: totalPaid,
                    technician: repair.acceptedByName,
                    fullyPaidDate: lastPaymentDate,
                    commissionClaimed: hasClaimed,
                    claimedBy: repair.commissionClaimedBy,
                    claimedAt: repair.commissionClaimedAt,
                    remittanceId: repair.commissionRemittanceId
                });
            }
        }
    });

    console.log(`Found ${issues.length} fully paid repairs with commission status:`);
    console.table(issues);

    return issues;
}

// Export debug functions
window.debugPaymentStatus = debugPaymentStatus;
window.debugAllTechPayments = debugAllTechPayments;
window.debugDailyRemittance = debugDailyRemittance;
window.debugCommissionIssues = debugCommissionIssues;

/**
 * ADMIN: Recalculate commission claims for data audit
 */
async function adminRecalculateCommissions() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    if (!confirm('Analyze commission tracking for all repairs?\n\nThis will scan all claimed repairs and check if commission tracking is correct.')) {
        return;
    }

    try {
        utils.showLoading(true);
        const issues = [];
        const warnings = [];

        // Analyze all claimed repairs
        window.allRepairs.forEach(repair => {
            if (repair.status === 'Claimed' && repair.payments && repair.acceptedBy) {
                const totalPaid = repair.payments.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
                const fullyPaid = totalPaid >= repair.total;

                if (fullyPaid) {
                    // Should have commission claimed
                    if (!repair.commissionClaimedBy) {
                        // Find when it became fully paid
                        let fullyPaidDate = null;
                        let runningTotal = 0;
                        const sortedPayments = [...repair.payments]
                            .filter(p => p.verified)
                            .sort((a, b) => new Date(a.verifiedAt || a.recordedDate) - new Date(b.verifiedAt || b.recordedDate));

                        for (const p of sortedPayments) {
                            runningTotal += p.amount;
                            if (runningTotal >= repair.total) {
                                fullyPaidDate = p.verifiedAt || p.recordedDate;
                                break;
                            }
                        }

                        issues.push({
                            id: repair.id,
                            customer: repair.customerName,
                            tech: repair.acceptedByName,
                            total: repair.total,
                            fullyPaidDate: fullyPaidDate,
                            issue: 'Fully paid but commission not claimed'
                        });
                    } else {
                        // Has commission claimed - verify data
                        warnings.push({
                            id: repair.id,
                            customer: repair.customerName,
                            tech: repair.acceptedByName,
                            claimedBy: repair.commissionClaimedBy,
                            claimedAt: repair.commissionClaimedAt,
                            remittanceId: repair.commissionRemittanceId
                        });
                    }
                }
            }
        });

        utils.showLoading(false);

        console.log('=== COMMISSION AUDIT RESULTS ===');
        console.log(`\nISSUES (${issues.length}):`);
        if (issues.length > 0) {
            console.table(issues);
        } else {
            console.log('✅ No issues found');
        }

        console.log(`\nCOMMISSIONS CLAIMED (${warnings.length}):`);
        if (warnings.length > 0) {
            console.table(warnings);
        }

        if (issues.length === 0) {
            alert(`✅ Commission Audit Complete!\n\nNo tracking issues found.\n\n${warnings.length} commissions properly tracked.\n\nSee console for details.`);
        } else {
            alert(`⚠️ Commission Audit Complete!\n\nFound ${issues.length} potential tracking issue(s):\n• Fully paid repairs without claimed commission\n\nSee console for detailed report.`);
        }

        return { issues, tracked: warnings };
    } catch (error) {
        utils.showLoading(false);
        console.error('Error during audit:', error);
        alert('Error: ' + error.message);
    }
}

// Export admin function
window.adminRecalculateCommissions = adminRecalculateCommissions;

/**
 * ============================================
 * ADMIN MASTER RESET FUNCTIONS
 * ============================================
 */

/**
 * Open Master Reset Modal (Admin Only)
 */
function openMasterResetModal() {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ This function is only available to administrators');
        return;
    }

    const content = document.getElementById('masterResetModalContent');
    content.innerHTML = `
        <div style="background:#ffebee;padding:15px;border-radius:8px;border-left:4px solid #f44336;margin-bottom:20px;">
            <strong style="color:#d32f2f;">⚠️ DANGER ZONE</strong><br>
            This will permanently delete selected data. This action CANNOT be undone!
        </div>
        
        <h4 style="margin-bottom:15px;">Select Data to Reset:</h4>
        
        <div style="background:#fff;padding:15px;border-radius:8px;border:1px solid #ddd;">
            <label style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid #eee;">
                <input type="checkbox" id="reset_repairs" onchange="updateResetSummary()">
                <div style="flex:1;">
                    <strong>All Repairs & Jobs</strong>
                    <div style="font-size:12px;color:#666;">Clears all repair records, payments, status history</div>
                    <div style="font-size:11px;color:#999;">Count: ${window.allRepairs.length} repairs</div>
                </div>
            </label>
            
            <label style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid #eee;">
                <input type="checkbox" id="reset_remittances" onchange="updateResetSummary()">
                <div style="flex:1;">
                    <strong>Technician Remittances</strong>
                    <div style="font-size:12px;color:#666;">Clears all remittance records and commission tracking</div>
                    <div style="font-size:11px;color:#999;">Count: ${window.techRemittances.length} remittances</div>
                </div>
            </label>
            
            <label style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid #eee;">
                <input type="checkbox" id="reset_expenses" onchange="updateResetSummary()">
                <div style="flex:1;">
                    <strong>Technician Expenses</strong>
                    <div style="font-size:12px;color:#666;">Clears all expense records</div>
                    <div style="font-size:11px;color:#999;">Count: ${window.techExpenses.length} expenses</div>
                </div>
            </label>
            
            <label style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid #eee;">
                <input type="checkbox" id="reset_cashcounts" onchange="updateResetSummary()">
                <div style="flex:1;">
                    <strong>Daily Cash Counts</strong>
                    <div style="font-size:12px;color:#666;">Clears all daily cash count locks and records</div>
                </div>
            </label>
            
            <label style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;">
                <input type="checkbox" id="reset_activitylogs" onchange="updateResetSummary()">
                <div style="flex:1;">
                    <strong>Activity Logs</strong>
                    <div style="font-size:12px;color:#666;">Clears all activity log history</div>
                    <div style="font-size:11px;color:#999;">Count: ${(window.activityLogs || []).length} logs</div>
                </div>
            </label>
        </div>
        
        <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:15px 0;border-left:3px solid #ff9800;">
            <strong>📝 Important Notes:</strong>
            <ul style="margin:10px 0 0 20px;font-size:13px;">
                <li>User accounts will NOT be deleted</li>
                <li>Suppliers list will NOT be deleted</li>
                <li>System settings will NOT be changed</li>
                <li>This action is PERMANENT and cannot be undone</li>
            </ul>
        </div>
        
        <div id="resetSummary" style="background:#e3f2fd;padding:15px;border-radius:8px;margin:15px 0;display:none;">
            <strong>Reset Summary:</strong>
            <div id="resetSummaryContent" style="margin-top:10px;"></div>
        </div>
        
        <div class="form-group">
            <label style="font-weight:bold;color:#d32f2f;">Type "DELETE" to confirm *</label>
            <input type="text" id="resetConfirmation" placeholder="Type DELETE in CAPS" 
                   style="width:100%;padding:10px;border:2px solid #f44336;border-radius:5px;">
        </div>
        
        <div class="form-group">
            <label>Reason for Reset *</label>
            <textarea id="resetReason" rows="3" required 
                      placeholder="Why are you resetting this data? This will be logged."></textarea>
        </div>
        
        <div class="form-actions">
            <button onclick="executeMasterReset()" class="btn-danger" style="background:#d32f2f;">
                🗑️ Execute Reset
            </button>
            <button onclick="closeMasterResetModal()" class="btn-secondary">Cancel</button>
        </div>
    `;

    document.getElementById('masterResetModal').style.display = 'block';
}

/**
 * Update reset summary
 */
function updateResetSummary() {
    const repairs = document.getElementById('reset_repairs').checked;
    const remittances = document.getElementById('reset_remittances').checked;
    const expenses = document.getElementById('reset_expenses').checked;
    const cashcounts = document.getElementById('reset_cashcounts').checked;
    const logs = document.getElementById('reset_activitylogs').checked;

    const summary = document.getElementById('resetSummary');
    const content = document.getElementById('resetSummaryContent');

    if (!repairs && !remittances && !expenses && !cashcounts && !logs) {
        summary.style.display = 'none';
        return;
    }

    summary.style.display = 'block';
    let items = [];
    if (repairs) items.push('✓ All Repairs & Jobs');
    if (remittances) items.push('✓ Technician Remittances');
    if (expenses) items.push('✓ Technician Expenses');
    if (cashcounts) items.push('✓ Daily Cash Counts');
    if (logs) items.push('✓ Activity Logs');

    content.innerHTML = items.join('<br>');
}

/**
 * Execute Master Reset
 */
async function executeMasterReset() {
    const confirmation = document.getElementById('resetConfirmation').value;
    const reason = document.getElementById('resetReason').value.trim();

    if (confirmation !== 'DELETE') {
        alert('⚠️ Please type DELETE (in CAPS) to confirm');
        return;
    }

    if (!reason) {
        alert('⚠️ Please provide a reason for this reset');
        return;
    }

    const repairs = document.getElementById('reset_repairs').checked;
    const remittances = document.getElementById('reset_remittances').checked;
    const expenses = document.getElementById('reset_expenses').checked;
    const cashcounts = document.getElementById('reset_cashcounts').checked;
    const logs = document.getElementById('reset_activitylogs').checked;

    if (!repairs && !remittances && !expenses && !cashcounts && !logs) {
        alert('⚠️ Please select at least one item to reset');
        return;
    }

    let confirmMsg = '⚠️ FINAL CONFIRMATION\n\nYou are about to PERMANENTLY DELETE:\n\n';
    if (repairs) confirmMsg += `• ${window.allRepairs.length} Repairs\n`;
    if (remittances) confirmMsg += `• ${window.techRemittances.length} Remittances\n`;
    if (expenses) confirmMsg += `• ${window.techExpenses.length} Expenses\n`;
    if (cashcounts) confirmMsg += '• All Daily Cash Counts\n';
    if (logs) confirmMsg += `• ${(window.activityLogs || []).length} Activity Logs\n`;
    confirmMsg += '\nThis CANNOT be undone!\n\nProceed?';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        utils.showLoading(true);

        const deletePromises = [];

        // Delete selected data
        if (repairs) {
            deletePromises.push(db.ref('repairs').remove());
        }
        if (remittances) {
            deletePromises.push(db.ref('techRemittances').remove());
        }
        if (expenses) {
            deletePromises.push(db.ref('techExpenses').remove());
        }
        if (cashcounts) {
            deletePromises.push(db.ref('dailyCashCounts').remove());
        }
        if (logs) {
            deletePromises.push(db.ref('activityLogs').remove());
        }

        await Promise.all(deletePromises);

        // Log the reset action (if logs weren't deleted)
        if (!logs) {
            await logActivity('master_reset', 'admin', {
                repairs: repairs,
                remittances: remittances,
                expenses: expenses,
                cashcounts: cashcounts,
                logs: logs,
                reason: reason
            });
        }

        utils.showLoading(false);

        alert('✅ Master Reset Complete!\n\nSelected data has been permanently deleted.\n\nPage will reload in 2 seconds...');

        closeMasterResetModal();

        // Reload page to refresh data
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        utils.showLoading(false);
        console.error('Error during master reset:', error);
        alert('❌ Error during reset: ' + error.message);
    }
}

function closeMasterResetModal() {
    document.getElementById('masterResetModal').style.display = 'none';
}

// Export functions
window.openMasterResetModal = openMasterResetModal;
window.updateResetSummary = updateResetSummary;
window.executeMasterReset = executeMasterReset;
window.closeMasterResetModal = closeMasterResetModal;

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
window.toggleReleasePaymentSection = toggleReleasePaymentSection;
window.toggleGCashReferenceField = toggleGCashReferenceField;
window.confirmReleaseDevice = confirmReleaseDevice;
window.closeReleaseDeviceModal = closeReleaseDeviceModal;
window.openEditDeviceModal = openEditDeviceModal;
window.saveDeviceInfo = saveDeviceInfo;
window.closeEditDeviceModal = closeEditDeviceModal;
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
window.adminDeletePayment = adminDeletePayment;
window.adminUnremitPayment = adminUnremitPayment;
window.adminDeleteExpense = adminDeleteExpense;
window.deleteRepair = deleteRepair; // Replaced requestRepairDeletion with direct delete

// Admin Bulk Fix Tools exports
window.recordMissingPaymentForDevice = recordMissingPaymentForDevice;
window.exportUnpaidDevicesList = exportUnpaidDevicesList;

/**
 * Record Missing Payment for a Device (Admin Bulk Fix Tool)
 */
async function recordMissingPaymentForDevice(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('⚠️ Repair record not found!');
        return;
    }

    const totalPaid = (repair.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const balance = repair.total - totalPaid;

    if (balance <= 0) {
        alert('✅ This device is already fully paid!');
        if (window.currentTabRefresh) window.currentTabRefresh();
        return;
    }

    // Prompt for payment details
    const amountStr = prompt(
        `💰 Record Missing Payment\n\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Customer: ${repair.customerName}\n` +
        `Status: ${repair.status}\n` +
        `Released: ${utils.formatDate(repair.releasedAt || repair.completedAt)}\n\n` +
        `Total: ₱${repair.total.toFixed(2)}\n` +
        `Paid: ₱${totalPaid.toFixed(2)}\n` +
        `Balance: ₱${balance.toFixed(2)}\n\n` +
        `Enter payment amount (or leave blank for full balance):`,
        balance.toFixed(2)
    );

    if (amountStr === null) return; // Cancelled

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        alert('⚠️ Invalid payment amount!');
        return;
    }

    if (amount > balance) {
        if (!confirm(`⚠️ Payment amount (₱${amount.toFixed(2)}) exceeds balance (₱${balance.toFixed(2)}).\n\nContinue anyway?`)) {
            return;
        }
    }

    // Prompt for payment method
    const method = prompt(
        `Payment Method:\n\n` +
        `1 = Cash\n` +
        `2 = GCash\n` +
        `3 = Bank Transfer\n` +
        `4 = Check\n` +
        `5 = Credit Card\n\n` +
        `Enter number (default: 1 for Cash):`,
        '1'
    );

    if (method === null) return; // Cancelled

    const methodMap = {
        '1': 'Cash',
        '2': 'GCash',
        '3': 'Bank Transfer',
        '4': 'Check',
        '5': 'Credit Card'
    };

    const paymentMethod = methodMap[method] || 'Cash';

    // GCash reference if needed
    let gcashRef = null;
    if (paymentMethod === 'GCash') {
        gcashRef = prompt('Enter GCash reference number (13 digits):');
        if (gcashRef && !/^\d{13}$/.test(gcashRef)) {
            alert('⚠️ GCash reference must be exactly 13 digits. Payment recorded without reference.');
            gcashRef = null;
        }
    }

    // Optional notes
    const notes = prompt('Payment notes (optional):\n(e.g., "Payment recorded retrospectively by admin")',
        'Missing payment recorded by ' + window.currentUserData.displayName);

    // Confirm before saving
    if (!confirm(
        `✅ Confirm Payment Recording\n\n` +
        `Device: ${repair.brand} ${repair.model}\n` +
        `Customer: ${repair.customerName}\n` +
        `Amount: ₱${amount.toFixed(2)}\n` +
        `Method: ${paymentMethod}\n` +
        `${gcashRef ? `GCash Ref: ${gcashRef}\n` : ''}` +
        `${notes ? `Notes: ${notes}\n` : ''}\n` +
        `Recorded by: ${window.currentUserData.displayName}\n\n` +
        `Proceed with recording?`
    )) {
        return;
    }

    try {
        utils.showLoading(true);

        // Create payment object
        const payment = {
            amount: amount,
            method: paymentMethod,
            notes: notes || '',
            receivedBy: window.currentUserData.displayName,
            receivedById: window.currentUser.uid,
            receivedAt: new Date().toISOString(),
            verified: true, // Admin-recorded payments are auto-verified
            remittanceStatus: 'verified', // Skip remittance process
            gcashReferenceNumber: gcashRef,
            adminRecorded: true, // Flag for audit trail
            adminRecordedReason: 'Missing payment recorded retrospectively via Admin Tools'
        };

        // Add to payments array
        const payments = repair.payments || [];
        payments.push(payment);

        await db.ref(`repairs/${repairId}`).update({
            payments: payments,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        // Log the action
        await logAdminAction({
            action: 'record_missing_payment',
            targetType: 'repair',
            targetId: repairId,
            targetName: `${repair.brand} ${repair.model} - ${repair.customerName}`,
            details: {
                amount: amount,
                method: paymentMethod,
                previousBalance: balance,
                newBalance: balance - amount,
                gcashReference: gcashRef,
                notes: notes
            },
            performedBy: window.currentUserData.displayName,
            performedById: window.currentUser.uid,
            timestamp: new Date().toISOString()
        });

        utils.showLoading(false);
        alert(`✅ Payment Recorded Successfully!\n\nAmount: ₱${amount.toFixed(2)}\nNew Balance: ₱${(balance - amount).toFixed(2)}`);

        // Refresh the tab
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        console.error('Error recording missing payment:', error);
        utils.showLoading(false);
        alert('❌ Error recording payment: ' + error.message);
    }
}

/**
 * Export Unpaid Devices List to CSV (Admin Tool)
 */
function exportUnpaidDevicesList() {
    // Find unpaid devices
    const unpaidDevices = window.allRepairs.filter(r => {
        if (r.deleted || !r.status) return false;
        if (r.status !== 'Released' && r.status !== 'Claimed') return false;

        const totalPaid = (r.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;

        return balance > 0 && (!r.payments || r.payments.length === 0);
    });

    if (unpaidDevices.length === 0) {
        alert('✅ No unpaid devices to export!');
        return;
    }

    // Generate CSV
    let csv = 'Repair ID,Customer Name,Contact Number,Brand,Model,Problem,Status,Released Date,Total,Paid,Balance\n';

    unpaidDevices.forEach(r => {
        const totalPaid = (r.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const balance = r.total - totalPaid;
        const releaseDate = r.releasedAt || r.completedAt || '';

        csv += `"${r.id}","${r.customerName}","${r.contactNumber}","${r.brand}","${r.model}","${r.problem}","${r.status}","${utils.formatDate(releaseDate)}",${r.total.toFixed(2)},${totalPaid.toFixed(2)},${balance.toFixed(2)}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unpaid-devices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    console.log(`📊 Exported ${unpaidDevices.length} unpaid devices to CSV`);
}

// ==================== AUTO-FINALIZATION FOR RELEASED STATUS ====================

// Auto-finalization system removed for workflow simplification
// Devices now remain in Released status until manually finalized

// ===== DATA CLEANUP ENGINE =====

/**
 * Calculate data health issues across all repairs
 * Returns categorized list of problems
 */
function calculateDataHealthIssues() {
    const issues = {
        missingPartsCost: [],
        orphanedRemittances: [],
        legacyPayments: [],
        total: 0
    };

    if (!window.allRepairs) {
        return issues;
    }

    window.allRepairs.forEach(repair => {
        if (repair.deleted) return;

        // Check for missing parts cost on completed repairs
        // Exclude software repairs which legitimately have zero parts cost
        const isSoftwareRepair = repair.repairType === 'Software Issue' ||
            repair.repairType === 'FRP Unlock' ||
            repair.repairType === 'Password Unlock' ||
            repair.repairType === 'Data Recovery';

        // Only flag if parts cost was never set (no partsCostRecordedBy field)
        // If partsCostRecordedBy exists, it means the value was explicitly set (even if 0)
        if ((repair.status === 'Claimed' || repair.status === 'Released') &&
            repair.total > 0 &&
            (!repair.partsCost || repair.partsCost === 0) &&
            !repair.partsCostRecordedBy &&
            !isSoftwareRepair) {
            issues.missingPartsCost.push({
                repairId: repair.id,
                customerName: repair.customerName,
                total: repair.total,
                status: repair.status,
                claimedAt: repair.claimedAt
            });
        }

        // Check payments for issues
        if (repair.payments && repair.payments.length > 0) {
            repair.payments.forEach((payment, index) => {
                // Check for orphaned remittances
                if (payment.techRemittanceId && payment.remittanceStatus === 'remitted') {
                    const remittanceExists = window.techRemittances &&
                        window.techRemittances.find(r => r.id === payment.techRemittanceId);

                    if (!remittanceExists) {
                        issues.orphanedRemittances.push({
                            repairId: repair.id,
                            paymentIndex: index,
                            customerName: repair.customerName,
                            amount: payment.amount,
                            method: payment.method,
                            recordedDate: payment.recordedDate,
                            techRemittanceId: payment.techRemittanceId
                        });
                    }
                }

                // Check for legacy payments (missing remittanceStatus)
                if (payment.collectedByTech && !payment.remittanceStatus) {
                    issues.legacyPayments.push({
                        repairId: repair.id,
                        paymentIndex: index,
                        customerName: repair.customerName,
                        amount: payment.amount,
                        method: payment.method,
                        verified: payment.verified,
                        recordedDate: payment.recordedDate
                    });
                }
            });
        }
    });

    issues.total = issues.missingPartsCost.length +
        issues.orphanedRemittances.length +
        issues.legacyPayments.length;

    return issues;
}

/**
 * Perform data cleanup with reversible snapshots
 * @param {string} category - 'missingPartsCost', 'orphanedRemittances', 'legacyPayments'
 * @param {Array} affectedRecords - List of records to fix
 */
async function performCleanup(category, affectedRecords) {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can perform data cleanup');
        return { success: false };
    }

    if (!affectedRecords || affectedRecords.length === 0) {
        alert('⚠️ No records to clean up');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        // Generate cleanup ID
        const cleanupId = `cleanup_${Date.now()}`;
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString(); // 90 days

        // Prepare cleanup snapshot
        const cleanupSnapshot = {
            cleanupId: cleanupId,
            category: category,
            performedBy: window.currentUserData.displayName,
            performedById: window.currentUser.uid,
            timestamp: now,
            expiresAt: expiresAt,
            status: 'active',
            affectedRecords: []
        };

        // Process each record
        const updates = {};

        for (const record of affectedRecords) {
            const repairRef = `repairs/${record.repairId}`;
            const repair = window.allRepairs.find(r => r.id === record.repairId);

            if (!repair) continue;

            const snapshot = {
                repairId: record.repairId,
                oldValues: {},
                newValues: {}
            };

            switch (category) {
                case 'missingPartsCost':
                    // Check if it's a software repair
                    const isSoftwareRepair = repair.repairType === 'Software Issue' ||
                        repair.repairType === 'FRP Unlock' ||
                        repair.repairType === 'Password Unlock' ||
                        repair.repairType === 'Data Recovery';

                    let partsCostValue = 0;
                    let partsCostNote = '';

                    if (isSoftwareRepair) {
                        // Auto-set to 0 for software repairs
                        partsCostValue = 0;
                        partsCostNote = `Software repair - no parts cost. Auto-set by data cleanup on ${utils.formatDate(now)}`;
                    } else {
                        // Prompt user for actual parts cost for hardware repairs
                        const actualPartsCost = prompt(
                            `Enter parts cost for repair #${repair.id}\nCustomer: ${repair.customerName}\nTotal: ₱${repair.total}\n\nEnter 0 if no parts were used:`,
                            '0'
                        );

                        // Skip if user cancels
                        if (actualPartsCost === null) {
                            console.log(`Skipped parts cost for repair ${repair.id}`);
                            continue;
                        }

                        partsCostValue = parseFloat(actualPartsCost) || 0;
                        partsCostNote = `Set to ₱${partsCostValue} by data cleanup on ${utils.formatDate(now)}`;
                    }

                    snapshot.oldValues.partsCost = repair.partsCost || null;
                    snapshot.oldValues.partsCostNotes = repair.partsCostNotes || null;

                    snapshot.newValues.partsCost = partsCostValue;
                    snapshot.newValues.partsCostNotes = partsCostNote;
                    snapshot.newValues.partsCostRecordedBy = window.currentUserData.displayName;
                    snapshot.newValues.partsCostRecordedAt = now;

                    updates[`${repairRef}/partsCost`] = partsCostValue;
                    updates[`${repairRef}/partsCostNotes`] = partsCostNote;
                    updates[`${repairRef}/partsCostRecordedBy`] = snapshot.newValues.partsCostRecordedBy;
                    updates[`${repairRef}/partsCostRecordedAt`] = snapshot.newValues.partsCostRecordedAt;
                    break;

                case 'orphanedRemittances':
                    const payment = repair.payments[record.paymentIndex];
                    snapshot.oldValues.remittanceStatus = payment.remittanceStatus;
                    snapshot.oldValues.techRemittanceId = payment.techRemittanceId;

                    snapshot.newValues.remittanceStatus = 'pending';
                    snapshot.newValues.techRemittanceId = null;
                    snapshot.paymentIndex = record.paymentIndex;

                    updates[`${repairRef}/payments/${record.paymentIndex}/remittanceStatus`] = 'pending';
                    updates[`${repairRef}/payments/${record.paymentIndex}/techRemittanceId`] = null;
                    break;

                case 'legacyPayments':
                    const legacyPayment = repair.payments[record.paymentIndex];
                    snapshot.oldValues.remittanceStatus = legacyPayment.remittanceStatus || null;

                    // Set based on verification status
                    const newStatus = legacyPayment.verified ? 'verified' : 'pending';
                    snapshot.newValues.remittanceStatus = newStatus;
                    snapshot.paymentIndex = record.paymentIndex;

                    updates[`${repairRef}/payments/${record.paymentIndex}/remittanceStatus`] = newStatus;
                    break;
            }

            cleanupSnapshot.affectedRecords.push(snapshot);
        }

        // Save cleanup snapshot to Firebase
        await db.ref(`dataCleanupHistory/${cleanupId}`).set(cleanupSnapshot);

        // Apply updates
        await db.ref().update(updates);

        // Log activity
        await logActivity('data_cleanup', {
            cleanupId: cleanupId,
            category: category,
            recordsAffected: affectedRecords.length
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Cleanup completed: ${affectedRecords.length} records fixed`,
                'success',
                5000
            );
        }

        // Refresh current tab
        if (window.currentTabRefresh) {
            setTimeout(() => window.currentTabRefresh(), 400);
        }

        return { success: true, cleanupId: cleanupId };

    } catch (error) {
        console.error('❌ Error performing cleanup:', error);
        utils.showLoading(false);
        alert(`Error performing cleanup: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Undo a cleanup operation (within 90 days)
 * @param {string} cleanupId - ID of the cleanup to undo
 */
async function undoCleanup(cleanupId) {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can undo cleanup operations');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        // Retrieve cleanup snapshot
        const snapshot = await db.ref(`dataCleanupHistory/${cleanupId}`).once('value');
        const cleanupData = snapshot.val();

        if (!cleanupData) {
            throw new Error('Cleanup snapshot not found');
        }

        // Check if already undone
        if (cleanupData.status === 'undone') {
            alert('⚠️ This cleanup has already been undone');
            utils.showLoading(false);
            return { success: false };
        }

        // Check if expired
        const expiresAt = new Date(cleanupData.expiresAt);
        const now = new Date();
        if (now > expiresAt) {
            alert('⚠️ This cleanup has expired (>90 days old) and cannot be undone');
            utils.showLoading(false);
            return { success: false };
        }

        // Prepare undo updates
        const updates = {};

        for (const record of cleanupData.affectedRecords) {
            const repairRef = `repairs/${record.repairId}`;

            // Restore old values
            for (const [key, value] of Object.entries(record.oldValues)) {
                if (record.paymentIndex !== undefined) {
                    // Payment field
                    updates[`${repairRef}/payments/${record.paymentIndex}/${key}`] = value;
                } else {
                    // Repair field
                    updates[`${repairRef}/${key}`] = value;
                }
            }
        }

        // Apply undo updates
        await db.ref().update(updates);

        // Mark cleanup as undone
        await db.ref(`dataCleanupHistory/${cleanupId}`).update({
            status: 'undone',
            undoneBy: window.currentUserData.displayName,
            undoneById: window.currentUser.uid,
            undoneAt: new Date().toISOString()
        });

        // Log activity
        await logActivity('cleanup_undone', {
            cleanupId: cleanupId,
            category: cleanupData.category,
            recordsReverted: cleanupData.affectedRecords.length
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Cleanup undone: ${cleanupData.affectedRecords.length} records reverted`,
                'success',
                5000
            );
        }

        // Refresh current tab
        if (window.currentTabRefresh) {
            setTimeout(() => window.currentTabRefresh(), 400);
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Error undoing cleanup:', error);
        utils.showLoading(false);
        alert(`Error undoing cleanup: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Archive expired cleanups (>90 days) to CSV and delete from Firebase
 * Runs monthly
 */
async function archiveExpiredCleanups() {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        return;
    }

    try {
        console.log('🗄️ Checking for expired cleanups to archive...');

        const snapshot = await db.ref('dataCleanupHistory').once('value');
        const allCleanups = snapshot.val() || {};

        const now = new Date();
        const expiredCleanups = [];

        Object.entries(allCleanups).forEach(([id, cleanup]) => {
            const expiresAt = new Date(cleanup.expiresAt);
            if (now > expiresAt) {
                expiredCleanups.push({
                    cleanupId: id,
                    ...cleanup
                });
            }
        });

        if (expiredCleanups.length === 0) {
            console.log('✅ No expired cleanups to archive');
            return;
        }

        // Export to CSV
        const csvData = expiredCleanups.map(c => ({
            'Cleanup ID': c.cleanupId,
            'Category': c.category,
            'Performed By': c.performedBy,
            'Timestamp': utils.formatDateTime(c.timestamp),
            'Status': c.status,
            'Records Affected': c.affectedRecords.length,
            'Expires At': utils.formatDateTime(c.expiresAt)
        }));

        const now_str = new Date().toISOString().split('T')[0];
        exportToCSV(csvData, `cleanup_archive_${now_str}`);

        // Delete from Firebase
        const deleteUpdates = {};
        expiredCleanups.forEach(c => {
            deleteUpdates[`dataCleanupHistory/${c.cleanupId}`] = null;
        });

        await db.ref().update(deleteUpdates);

        console.log(`✅ Archived and deleted ${expiredCleanups.length} expired cleanups`);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `📦 Archived ${expiredCleanups.length} expired cleanups`,
                'info',
                5000
            );
        }

    } catch (error) {
        console.error('❌ Error archiving expired cleanups:', error);
    }
}

/**
 * Get cleanup history for display
 */
async function getCleanupHistory(limit = 20) {
    try {
        const snapshot = await db.ref('dataCleanupHistory')
            .orderByChild('timestamp')
            .limitToLast(limit)
            .once('value');

        const cleanups = [];
        snapshot.forEach(child => {
            cleanups.push({
                id: child.key,
                ...child.val()
            });
        });

        // Sort by timestamp descending (newest first)
        cleanups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return cleanups;

    } catch (error) {
        console.error('Error loading cleanup history:', error);
        return [];
    }
}

// ===== OVERHEAD EXPENSE MANAGEMENT =====

// Global overhead expenses array
window.overheadExpenses = [];

/**
 * Load overhead expenses from Firebase
 */
async function loadOverheadExpenses() {
    try {
        console.log('📦 Loading overhead expenses...');

        db.ref('overheadExpenses').on('value', (snapshot) => {
            const expenses = [];
            snapshot.forEach(child => {
                expenses.push({
                    id: child.key,
                    ...child.val()
                });
            });

            window.overheadExpenses = expenses;
            console.log(`✅ Loaded ${expenses.length} overhead expenses`);

            // Debug: Log first few expenses
            if (expenses.length > 0) {
                console.log('📊 Sample overhead expenses:', expenses.slice(0, 3));
            } else {
                console.warn('⚠️ No overhead expenses found in database');
            }

            // Refresh overhead tab if it exists
            setTimeout(() => {
                const overheadContainer = document.getElementById('overheadTab');
                if (overheadContainer && window.buildOverheadExpensesTab) {
                    // Always rebuild the tab when data changes (even if not currently visible)
                    window.buildOverheadExpensesTab(overheadContainer);
                    console.log('🔄 Overhead tab refreshed with', expenses.length, 'expenses');
                }
            }, 400);
        });

    } catch (error) {
        console.error('❌ Error loading overhead expenses:', error);
    }
}

/**
 * Add overhead expense
 * @param {Object} expense - Expense data
 */
async function addOverheadExpense(expense) {
    if (!window.currentUserData || !['admin', 'manager'].includes(window.currentUserData.role)) {
        alert('⚠️ Only administrators and managers can add overhead expenses');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const expenseData = {
            expenseType: expense.expenseType || 'Miscellaneous',
            category: expense.category,
            description: expense.description,
            amount: parseFloat(expense.amount),
            date: expense.date || new Date().toISOString(),
            isRecurring: expense.isRecurring || false,
            recurringFrequency: expense.recurringFrequency || null, // 'monthly', 'quarterly', 'yearly'
            notes: expense.notes || '',
            createdBy: window.currentUserData.displayName,
            createdById: window.currentUser.uid,
            createdAt: new Date().toISOString()
        };

        const newRef = await db.ref('overheadExpenses').push(expenseData);

        // Log activity
        await logActivity('overhead_expense_added', {
            expenseId: newRef.key,
            category: expenseData.category,
            amount: expenseData.amount
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Overhead expense added: ₱${expenseData.amount.toLocaleString()}`,
                'success',
                3000
            );
        }

        return { success: true, expenseId: newRef.key };

    } catch (error) {
        console.error('❌ Error adding overhead expense:', error);
        utils.showLoading(false);
        alert(`Error adding overhead expense: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Update overhead expense
 */
async function updateOverheadExpense(expenseId, updates) {
    if (!window.currentUserData || !['admin', 'manager'].includes(window.currentUserData.role)) {
        alert('⚠️ Only administrators and managers can update overhead expenses');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        updates.lastUpdatedBy = window.currentUserData.displayName;
        updates.lastUpdatedAt = new Date().toISOString();

        await db.ref(`overheadExpenses/${expenseId}`).update(updates);

        await logActivity('overhead_expense_updated', {
            expenseId: expenseId,
            updates: updates
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast('✅ Overhead expense updated', 'success', 3000);
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Error updating overhead expense:', error);
        utils.showLoading(false);
        alert(`Error updating overhead expense: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Delete overhead expense
 */
async function deleteOverheadExpense(expenseId) {
    if (!window.currentUserData || window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can delete overhead expenses');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const expense = window.overheadExpenses.find(e => e.id === expenseId);

        // Soft delete (backup to deletedOverheadExpenses)
        await db.ref(`deletedOverheadExpenses/${expenseId}`).set({
            ...expense,
            deletedBy: window.currentUserData.displayName,
            deletedAt: new Date().toISOString()
        });

        await db.ref(`overheadExpenses/${expenseId}`).remove();

        await logActivity('overhead_expense_deleted', {
            expenseId: expenseId,
            category: expense.category,
            amount: expense.amount
        });

        utils.showLoading(false);
        console.log('✅ Overhead expense deleted:', expenseId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting overhead expense:', error);
        utils.showLoading(false);
        throw error;
    }
}

async function updateOverheadExpense(expenseId, updates) {
    if (!window.currentUserData || !['admin', 'manager'].includes(window.currentUserData.role)) {
        alert('⚠️ Only administrators and managers can edit overhead expenses');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const expense = window.overheadExpenses.find(e => e.id === expenseId);
        if (!expense) {
            throw new Error('Expense not found');
        }

        // Log the changes for audit trail
        await logActivity('overhead_expense_updated', {
            expenseId: expenseId,
            category: updates.category,
            oldAmount: expense.amount,
            newAmount: updates.amount,
            changes: updates
        });

        // Update the expense in Firebase
        await db.ref(`overheadExpenses/${expenseId}`).update(updates);

        utils.showLoading(false);
        console.log('✅ Overhead expense updated:', expenseId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating overhead expense:', error);
        utils.showLoading(false);
        throw error;
    }
}

/**
 * Calculate total overhead for a period
 */
function calculateOverheadForPeriod(startDate, endDate) {
    if (!window.overheadExpenses) {
        console.warn('⚠️ calculateOverheadForPeriod: window.overheadExpenses is undefined');
        return 0;
    }

    console.log(`📊 Calculating overhead for period ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    console.log(`📦 Total overhead expenses in array: ${window.overheadExpenses.length}`);

    const total = window.overheadExpenses
        .filter(expense => !expense.deleted) // Exclude deleted expenses
        .reduce((sum, expense) => {
            const expenseDate = new Date(expense.date);
            const isInRange = expenseDate >= startDate && expenseDate <= endDate;

            if (isInRange) {
                console.log(`  ✅ Including: ${expense.category} - ₱${expense.amount} on ${expense.date.split('T')[0]}`);
            }

            return isInRange ? sum + expense.amount : sum;
        }, 0);

    console.log(`💰 Total overhead for period: ₱${total.toFixed(2)}`);
    return total;
}

// ===== SUPPLIER PAYABLES MANAGEMENT =====

// Global supplier purchases array
window.supplierPurchases = [];

/**
 * Load supplier purchases from Firebase
 */
async function loadSupplierPurchases() {
    try {
        console.log('📦 Loading supplier purchases...');

        db.ref('supplierPurchases').on('value', (snapshot) => {
            const purchases = [];
            snapshot.forEach(child => {
                purchases.push({
                    id: child.key,
                    ...child.val()
                });
            });

            window.supplierPurchases = purchases;
            console.log(`✅ Loaded ${purchases.length} supplier purchases`);

            // Trigger refresh if on relevant tab
            if (window.currentTabRefresh) {
                setTimeout(() => window.currentTabRefresh(), 400);
            }
        });

    } catch (error) {
        console.error('❌ Error loading supplier purchases:', error);
    }
}

/**
 * Add supplier purchase
 */
async function addSupplierPurchase(purchase) {
    if (!window.currentUserData || !['admin', 'manager', 'technician'].includes(window.currentUserData.role)) {
        alert('⚠️ You do not have permission to add supplier purchases');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const purchaseData = {
            supplierId: purchase.supplierId,
            supplierName: purchase.supplierName,
            description: purchase.description,
            totalAmount: parseFloat(purchase.totalAmount),
            amountPaid: parseFloat(purchase.amountPaid || 0),
            amountDue: parseFloat(purchase.totalAmount) - parseFloat(purchase.amountPaid || 0),
            purchaseDate: purchase.purchaseDate || new Date().toISOString(),
            dueDate: purchase.dueDate || null,
            paymentStatus: purchase.amountPaid >= purchase.totalAmount ? 'paid' :
                purchase.amountPaid > 0 ? 'partial' : 'unpaid',
            invoiceNumber: purchase.invoiceNumber || '',
            notes: purchase.notes || '',
            repairId: purchase.repairId || null, // Link to repair if applicable
            createdBy: window.currentUserData.displayName,
            createdById: window.currentUser.uid,
            createdAt: new Date().toISOString(),
            payments: []
        };

        const newRef = await db.ref('supplierPurchases').push(purchaseData);

        // Update supplier outstanding balance
        if (purchaseData.amountDue > 0) {
            await updateSupplierOutstanding(purchaseData.supplierId, purchaseData.amountDue);
        }

        // Log activity
        await logActivity('supplier_purchase_added', {
            purchaseId: newRef.key,
            supplierName: purchaseData.supplierName,
            amount: purchaseData.totalAmount
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Purchase added: ₱${purchaseData.totalAmount.toLocaleString()}`,
                'success',
                3000
            );
        }

        return { success: true, purchaseId: newRef.key };

    } catch (error) {
        console.error('❌ Error adding supplier purchase:', error);
        utils.showLoading(false);
        alert(`Error adding supplier purchase: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Record payment for supplier purchase
 */
async function recordSupplierPayment(purchaseId, payment) {
    if (!window.currentUserData || !['admin', 'manager', 'cashier'].includes(window.currentUserData.role)) {
        alert('⚠️ You do not have permission to record payments');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const purchase = window.supplierPurchases.find(p => p.id === purchaseId);
        if (!purchase) {
            throw new Error('Purchase not found');
        }

        const paymentData = {
            amount: parseFloat(payment.amount),
            method: payment.method || 'Cash',
            paymentDate: payment.paymentDate || new Date().toISOString(),
            notes: payment.notes || '',
            recordedBy: window.currentUserData.displayName,
            recordedById: window.currentUser.uid,
            recordedAt: new Date().toISOString()
        };

        // Add payment to purchase payments array
        const payments = purchase.payments || [];
        payments.push(paymentData);

        const newAmountPaid = purchase.amountPaid + paymentData.amount;
        const newAmountDue = purchase.totalAmount - newAmountPaid;
        const newStatus = newAmountDue <= 0 ? 'paid' :
            newAmountPaid > 0 ? 'partial' : 'unpaid';

        await db.ref(`supplierPurchases/${purchaseId}`).update({
            payments: payments,
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            paymentStatus: newStatus,
            lastPaymentDate: paymentData.paymentDate,
            lastUpdatedBy: window.currentUserData.displayName,
            lastUpdatedAt: new Date().toISOString()
        });

        // Update supplier outstanding balance
        await updateSupplierOutstanding(purchase.supplierId, -paymentData.amount);

        // Log activity
        await logActivity('supplier_payment_recorded', {
            purchaseId: purchaseId,
            supplierName: purchase.supplierName,
            amount: paymentData.amount
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Payment recorded: ₱${paymentData.amount.toLocaleString()}`,
                'success',
                3000
            );
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Error recording supplier payment:', error);
        utils.showLoading(false);
        alert(`Error recording payment: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Update supplier outstanding balance
 */
async function updateSupplierOutstanding(supplierId, amountChange) {
    try {
        const supplierSnapshot = await db.ref(`suppliers/${supplierId}`).once('value');
        const supplier = supplierSnapshot.val();

        if (supplier) {
            const currentOutstanding = supplier.outstandingBalance || 0;
            const newOutstanding = currentOutstanding + amountChange;

            await db.ref(`suppliers/${supplierId}`).update({
                outstandingBalance: newOutstanding,
                lastUpdatedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error updating supplier outstanding:', error);
    }
}

/**
 * Get supplier outstanding balance
 */
function getSupplierOutstanding(supplierId) {
    if (!window.supplierPurchases) return 0;

    return window.supplierPurchases
        .filter(p => p.supplierId === supplierId && p.paymentStatus !== 'paid')
        .reduce((total, p) => total + p.amountDue, 0);
}

/**
 * Get overdue purchases
 */
function getOverduePurchases() {
    if (!window.supplierPurchases) return [];

    const now = new Date();
    return window.supplierPurchases.filter(p => {
        if (p.paymentStatus === 'paid' || !p.dueDate) return false;
        return new Date(p.dueDate) < now;
    });
}

// ===== REFUND MANAGEMENT SYSTEM =====

// Global refunds array
window.refunds = [];

/**
 * Load refunds from Firebase
 */
async function loadRefunds() {
    try {
        console.log('🔄 Loading refunds...');

        db.ref('refunds').on('value', (snapshot) => {
            const refunds = [];
            snapshot.forEach(child => {
                refunds.push({
                    id: child.key,
                    ...child.val()
                });
            });

            window.refunds = refunds;
            console.log(`✅ Loaded ${refunds.length} refunds`);

            // Refresh refund requests tab when data changes (even if not visible)
            setTimeout(() => {
                const refundContainer = document.getElementById('refund-requestsTab');
                if (refundContainer && window.buildRefundRequestsTab) {
                    // Always rebuild the tab when data changes
                    window.buildRefundRequestsTab(refundContainer);
                    console.log('🔄 Refund requests tab refreshed with', refunds.length, 'refunds');
                }
            }, 400);
        });

    } catch (error) {
        console.error('❌ Error loading refunds:', error);
    }
}

/**
 * Request a refund for a payment
 * @param {string} repairId - Repair ID
 * @param {number} paymentIndex - Index of payment in payments array
 * @param {Object} refundData - Refund details
 */
async function requestRefund(repairId, paymentIndex, refundData) {
    const userRole = window.currentUserData?.role;

    // Allow all roles to request, but technicians can only create requests
    if (!window.currentUserData) {
        alert('⚠️ You must be logged in to request a refund');
        return { success: false };
    }

    const isTechnician = userRole === 'technician';

    try {
        utils.showLoading(true);

        const repair = window.allRepairs.find(r => r.id === repairId);
        if (!repair || !repair.payments || !repair.payments[paymentIndex]) {
            throw new Error('Payment not found');
        }

        const payment = repair.payments[paymentIndex];

        // Validation
        if (!payment.verified) {
            throw new Error('Cannot refund unverified payment');
        }

        if (payment.refunded) {
            throw new Error('Payment already refunded');
        }

        if (refundData.refundAmount <= 0 || refundData.refundAmount > payment.amount) {
            throw new Error('Invalid refund amount');
        }

        // Check existing refund requests
        const existingRefund = window.refunds.find(r =>
            r.repairId === repairId &&
            r.paymentIndex === paymentIndex &&
            (r.status === 'pending_approval' || r.status === 'pending')
        );

        if (existingRefund) {
            throw new Error('Refund request already pending for this payment');
        }

        // Determine refund tier and auto-approval
        const tier = determineRefundTier(repair, payment);

        // Technicians always need approval, others follow tier rules
        const requiresApproval = isTechnician || tier >= 2 || userRole !== 'admin';

        const refundRecord = {
            repairId: repairId,
            paymentIndex: paymentIndex,
            refundType: refundData.refundAmount === payment.amount ? 'full' : 'partial',
            refundReason: refundData.reason,
            refundReasonDetails: refundData.reasonDetails || '',

            // Amount details
            refundAmount: parseFloat(refundData.refundAmount),
            originalPaymentAmount: payment.amount,

            // Payment details
            originalPaymentMethod: payment.method,
            originalPaymentDate: payment.paymentDate || payment.recordedDate,
            refundMethod: refundData.refundMethod || payment.method,

            // Refund details
            refundDate: new Date().toISOString(),
            requestedBy: window.currentUserData.displayName,
            requestedById: window.currentUser.uid,
            requestedAt: new Date().toISOString(),
            requestedByRole: userRole,

            // Status - pending for technicians, otherwise based on tier
            status: requiresApproval ? 'pending' : 'approved',
            tier: tier,

            // Commission impact
            commissionAffected: false,
            commissionToReverse: 0,
            technicianId: repair.acceptedBy || null,
            technicianName: repair.acceptedByName || null,

            // Parts handling
            partsReturned: refundData.partsReturned || false,
            partsReturnNotes: refundData.partsReturnNotes || '',

            // Notes
            notes: refundData.notes || '',
            adminNotes: '',

            // Remittance check
            remittanceStatus: payment.remittanceStatus || 'n/a',
            techRemittanceId: payment.techRemittanceId || null,

            // Audit
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Calculate commission impact
        if (repair.acceptedBy && window.calculateRepairCommission) {
            const commissionCalc = window.calculateRepairCommission(repair, repair.acceptedBy);
            if (commissionCalc.eligible && commissionCalc.amount > 0) {
                refundRecord.commissionAffected = true;
                // Proportional commission reduction
                const refundRatio = refundData.refundAmount / repair.total;
                refundRecord.commissionToReverse = commissionCalc.amount * refundRatio;
            }
        }

        const newRef = await db.ref('refunds').push(refundRecord);

        // Log activity
        await logActivity('refund_requested', {
            refundId: newRef.key,
            repairId: repairId,
            amount: refundData.refundAmount,
            reason: refundData.reason,
            tier: tier,
            requiresApproval: requiresApproval
        });

        // Auto-process if approved
        if (!requiresApproval) {
            await processRefund(newRef.key);
        }

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                requiresApproval
                    ? `🔔 Refund request submitted for approval (₱${refundData.refundAmount})`
                    : `✅ Refund processed: ₱${refundData.refundAmount}`,
                requiresApproval ? 'info' : 'success',
                3000
            );
        }

        return { success: true, refundId: newRef.key, requiresApproval };

    } catch (error) {
        console.error('❌ Error requesting refund:', error);
        utils.showLoading(false);
        alert(`Error requesting refund: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Determine refund tier based on risk factors
 * @param {Object} repair - Repair object
 * @param {Object} payment - Payment object
 * @returns {number} - Tier (1=low risk, 2=medium, 3=high)
 */
function determineRefundTier(repair, payment) {
    // Tier 3 (High Risk) - Device already claimed
    if (repair.status === 'Claimed') {
        return 3;
    }

    // Tier 3 - Commission already paid
    if (repair.commissionClaimedBy && repair.commissionClaimedAt) {
        return 3;
    }

    // Tier 2 (Medium Risk) - Device released but not claimed
    if (repair.status === 'Released' || repair.status === 'For Release') {
        return 2;
    }

    // Tier 2 - Payment in verified remittance
    if (payment.remittanceStatus === 'verified') {
        return 2;
    }

    // Tier 2 - Payment in pending remittance
    if (payment.remittanceStatus === 'remitted') {
        return 2;
    }

    // Tier 1 (Low Risk) - Safe to auto-approve
    return 1;
}

/**
 * Process an approved refund
 * @param {string} refundId - Refund ID
 */
async function processRefund(refundId) {
    try {
        const refund = window.refunds.find(r => r.id === refundId);
        if (!refund) {
            throw new Error('Refund not found');
        }

        if (refund.status === 'completed') {
            throw new Error('Refund already completed');
        }

        if (refund.status === 'pending_approval') {
            throw new Error('Refund requires approval first');
        }

        const repair = window.allRepairs.find(r => r.id === refund.repairId);
        if (!repair) {
            throw new Error('Repair not found');
        }

        // Mark payment as refunded
        const updatedPayments = Array.isArray(repair.payments) ? [...repair.payments] : [];
        if (!updatedPayments[refund.paymentIndex]) {
            throw new Error('Payment not found at specified index');
        }
        updatedPayments[refund.paymentIndex].refunded = true;
        updatedPayments[refund.paymentIndex].refundedAmount = refund.refundAmount;
        updatedPayments[refund.paymentIndex].refundedAt = new Date().toISOString();
        updatedPayments[refund.paymentIndex].refundedBy = window.currentUserData.displayName;
        updatedPayments[refund.paymentIndex].refundId = refundId;

        // Update repair
        await db.ref(`repairs/${refund.repairId}`).update({
            payments: updatedPayments,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        // Update refund status
        await db.ref(`refunds/${refundId}`).update({
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: window.currentUserData.displayName,
            completedById: window.currentUser.uid,
            lastUpdated: new Date().toISOString()
        });

        // Log activity
        await logActivity('refund_processed', {
            refundId: refundId,
            repairId: refund.repairId,
            amount: refund.refundAmount
        });

        // Invalidate dashboard cache
        if (window.invalidateDashboardCache) {
            window.invalidateDashboardCache();
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Error processing refund:', error);
        throw error;
    }
}

/**
 * Approve a refund request (admin/manager only)
 * @param {string} refundId - Refund ID
 * @param {string} adminNotes - Admin notes
 */
async function approveRefund(refundId, adminNotes = '') {
    if (!window.currentUserData || !['admin', 'manager', 'cashier'].includes(window.currentUserData.role)) {
        alert('⚠️ Only admin, manager, or cashier can approve refunds');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const refund = window.refunds.find(r => r.id === refundId);
        if (!refund) {
            throw new Error('Refund not found');
        }

        if (refund.status !== 'pending_approval' && refund.status !== 'pending') {
            throw new Error('Refund is not pending approval');
        }

        // Check if payment still exists and is valid
        const repair = window.allRepairs.find(r => r.id === refund.repairId);
        if (!repair || !repair.payments[refund.paymentIndex]) {
            throw new Error('Payment no longer exists');
        }

        const payment = repair.payments[refund.paymentIndex];
        if (payment.refunded) {
            throw new Error('Payment already refunded');
        }

        // Auto-reject remittance if exists
        if (refund.techRemittanceId) {
            const remittance = window.techRemittances?.find(r => r.id === refund.techRemittanceId);
            if (remittance && remittance.status === 'remitted') {
                // Reject the remittance
                await rejectRemittance(refund.techRemittanceId, `Auto-rejected: Payment refunded (Refund ID: ${refundId})`);
            }
        }

        // Check if commission reversal is needed
        const needsTechAck = refund.commissionAffected && refund.commissionToReverse > 0;

        if (needsTechAck) {
            // Require technician acknowledgment before commission deduction
            await db.ref(`refunds/${refundId}`).update({
                status: 'approved_pending_tech',
                approvedBy: window.currentUserData.displayName,
                approvedById: window.currentUser.uid,
                approvedAt: new Date().toISOString(),
                adminNotes: adminNotes,
                lastUpdated: new Date().toISOString()
            });

            utils.showLoading(false);

            if (window.utils && window.utils.showToast) {
                window.utils.showToast(
                    `✅ Refund approved. Waiting for technician (${refund.technicianName}) to acknowledge commission reversal.`,
                    'success',
                    4000
                );
            }

            // Log activity
            await logActivity('refund_approved_pending_tech', {
                refundId: refundId,
                repairId: refund.repairId,
                amount: refund.refundAmount,
                technicianId: refund.technicianId,
                commissionToReverse: refund.commissionToReverse
            });

            return { success: true, pendingTech: true };
        } else {
            // No commission impact, process immediately
            await db.ref(`refunds/${refundId}`).update({
                status: 'approved',
                approvedBy: window.currentUserData.displayName,
                approvedById: window.currentUser.uid,
                approvedAt: new Date().toISOString(),
                adminNotes: adminNotes,
                lastUpdated: new Date().toISOString()
            });

            // Process the refund
            await processRefund(refundId);
        }

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Refund approved and processed: ₱${refund.refundAmount}`,
                'success',
                3000
            );
        }

        // Log activity
        await logActivity('refund_approved', {
            refundId: refundId,
            repairId: refund.repairId,
            amount: refund.refundAmount
        });

        return { success: true };

    } catch (error) {
        console.error('❌ Error approving refund:', error);
        utils.showLoading(false);
        alert(`Error approving refund: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Technician acknowledges refund and accepts commission reversal
 * @param {string} refundId - Refund ID
 */
async function acknowledgeRefund(refundId) {
    if (!window.currentUserData || window.currentUserData.role !== 'technician') {
        alert('⚠️ Only technicians can acknowledge refunds');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const refund = window.refunds.find(r => r.id === refundId);
        if (!refund) {
            throw new Error('Refund not found');
        }

        if (refund.status !== 'approved_pending_tech') {
            throw new Error('Refund is not awaiting your acknowledgment');
        }

        // Verify this tech is the one who needs to acknowledge
        if (refund.technicianId !== window.currentUser.uid) {
            throw new Error('This refund is assigned to another technician');
        }

        const repair = window.allRepairs.find(r => r.id === refund.repairId);
        if (!repair) {
            throw new Error('Repair not found');
        }

        // Add negative payment entry for commission reversal
        if (refund.commissionToReverse > 0) {
            const reversalPayment = {
                amount: -refund.commissionToReverse,
                method: 'Commission Reversal',
                type: 'refund_commission_reversal',
                date: new Date().toISOString(),
                recordedDate: new Date().toISOString(),
                paymentDate: new Date().toISOString(),
                receivedBy: window.currentUserData.displayName,
                receivedById: window.currentUser.uid,
                collectedByTech: true,
                remittanceStatus: 'pending',
                verified: true,
                verifiedBy: 'System',
                verifiedAt: new Date().toISOString(),
                refundId: refundId,
                refundAmount: refund.refundAmount,
                notes: `Commission reversal for refund: ${refund.refundReason.replace('_', ' ')} - ${refund.refundReasonDetails}`,
                isCommissionReversal: true
            };

            // Add to repair payments
            await db.ref(`repairs/${refund.repairId}/payments`).push(reversalPayment);
        }

        // Update refund status to approved and process
        await db.ref(`refunds/${refundId}`).update({
            status: 'approved',
            acknowledgedByTech: true,
            acknowledgedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        });

        // Process the refund
        await processRefund(refundId);

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast(
                `✅ Refund acknowledged. ₱${refund.commissionToReverse.toFixed(2)} commission will be deducted from today's remittance.`,
                'success',
                4000
            );
        }

        // Log activity
        await logActivity('refund_tech_acknowledged', {
            refundId: refundId,
            repairId: refund.repairId,
            commissionReversed: refund.commissionToReverse
        });

        return { success: true };

    } catch (error) {
        console.error('❌ Error acknowledging refund:', error);
        utils.showLoading(false);
        alert(`Error acknowledging refund: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Reject a refund request
 * @param {string} refundId - Refund ID
 * @param {string} reason - Rejection reason
 */
async function rejectRefund(refundId, reason) {
    if (!window.currentUserData || !['admin', 'manager', 'cashier'].includes(window.currentUserData.role)) {
        alert('⚠️ Only admin, manager, or cashier can reject refunds');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const refund = window.refunds.find(r => r.id === refundId);
        if (!refund) {
            throw new Error('Refund not found');
        }

        await db.ref(`refunds/${refundId}`).update({
            status: 'rejected',
            rejectedBy: window.currentUserData.displayName,
            rejectedById: window.currentUser.uid,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
            lastUpdated: new Date().toISOString()
        });

        utils.showLoading(false);

        if (window.utils && window.utils.showToast) {
            window.utils.showToast('✅ Refund request rejected', 'success', 2000);
        }

        // Log activity
        await logActivity('refund_rejected', {
            refundId: refundId,
            repairId: refund.repairId,
            reason: reason
        });

        return { success: true };

    } catch (error) {
        console.error('❌ Error rejecting refund:', error);
        utils.showLoading(false);
        alert(`Error rejecting refund: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Export refund functions
window.loadRefunds = loadRefunds;
window.requestRefund = requestRefund;
window.processRefund = processRefund;
window.approveRefund = approveRefund;
window.acknowledgeRefund = acknowledgeRefund;
window.rejectRefund = rejectRefund;
window.determineRefundTier = determineRefundTier;

// Auto-finalization functions removed (system simplified)

// Export cleanup functions
window.calculateDataHealthIssues = calculateDataHealthIssues;
window.performCleanup = performCleanup;
window.undoCleanup = undoCleanup;
window.archiveExpiredCleanups = archiveExpiredCleanups;
window.getCleanupHistory = getCleanupHistory;

// Export overhead expense functions
window.loadOverheadExpenses = loadOverheadExpenses;
window.addOverheadExpense = addOverheadExpense;
window.updateOverheadExpense = updateOverheadExpense;
window.deleteOverheadExpense = deleteOverheadExpense;
window.calculateOverheadForPeriod = calculateOverheadForPeriod;

// Export supplier payables functions
window.loadSupplierPurchases = loadSupplierPurchases;
window.addSupplierPurchase = addSupplierPurchase;
window.recordSupplierPayment = recordSupplierPayment;
window.getSupplierOutstanding = getSupplierOutstanding;
window.getOverduePurchases = getOverduePurchases;

// ===== BUDGET MANAGEMENT SYSTEM =====

/**
 * Set monthly overhead budget
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (1-12)
 * @param {number} amount - Budget amount
 */
async function setMonthlyBudget(year, month, amount) {
    const budgetKey = `${year}-${String(month).padStart(2, '0')}`;

    try {
        await db.ref(`overheadBudgets/${budgetKey}`).set({
            year: year,
            month: month,
            amount: amount,
            setBy: window.currentUser.uid,
            setByName: window.currentUserData.displayName,
            setAt: new Date().toISOString()
        });

        console.log(`✅ Budget set for ${budgetKey}: ₱${amount}`);

        // Log activity
        if (window.logActivity) {
            await window.logActivity('budget_set', null, {
                period: budgetKey,
                amount: amount
            });
        }

        return true;
    } catch (error) {
        console.error('❌ Error setting budget:', error);
        throw error;
    }
}

/**
 * Get monthly overhead budget
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (1-12)
 */
async function getMonthlyBudget(year, month) {
    const budgetKey = `${year}-${String(month).padStart(2, '0')}`;

    try {
        const snapshot = await db.ref(`overheadBudgets/${budgetKey}`).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('❌ Error getting budget:', error);
        return null;
    }
}

/**
 * Calculate budget variance for a period
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 * @param {number} budgetAmount - Budget amount
 */
function calculateBudgetVariance(startDate, endDate, budgetAmount) {
    const actualSpent = calculateOverheadForPeriod(startDate, endDate);
    const variance = budgetAmount - actualSpent;
    const percentVariance = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

    return {
        budget: budgetAmount,
        actual: actualSpent,
        variance: variance,
        percentVariance: percentVariance,
        isOverBudget: variance < 0,
        utilizationPercent: budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0
    };
}

/**
 * Get all budgets
 */
async function getAllBudgets() {
    try {
        const snapshot = await db.ref('overheadBudgets').once('value');
        const budgets = [];

        snapshot.forEach((child) => {
            budgets.push({
                period: child.key,
                ...child.val()
            });
        });

        return budgets.sort((a, b) => b.period.localeCompare(a.period));
    } catch (error) {
        console.error('❌ Error getting all budgets:', error);
        return [];
    }
}

// Export budget management functions
window.setMonthlyBudget = setMonthlyBudget;
window.getMonthlyBudget = getMonthlyBudget;
window.calculateBudgetVariance = calculateBudgetVariance;
window.getAllBudgets = getAllBudgets;

// ============================================
// PERSONAL FINANCE SYSTEM
// ============================================

// Global arrays for personal finance data
window.allPersonalExpenses = [];
window.allRecurringTemplates = [];
window.allCreditCards = [];
window.allPersonalBudgets = [];
window.allSavingsGoals = [];

// Offline queue management
function saveOfflineQueueToStorage() {
    try {
        localStorage.setItem('personalFinanceOfflineQueue', JSON.stringify(window.offlineQueue || []));
        console.log('💾 Offline queue saved to storage:', window.offlineQueue.length, 'items');
    } catch (error) {
        console.error('❌ Error saving offline queue:', error);
    }
}

function loadOfflineQueueFromStorage() {
    try {
        const stored = localStorage.getItem('personalFinanceOfflineQueue');
        if (stored) {
            window.offlineQueue = JSON.parse(stored);
            console.log('📂 Loaded offline queue:', window.offlineQueue.length, 'items');
        }
    } catch (error) {
        console.error('❌ Error loading offline queue:', error);
        window.offlineQueue = [];
    }
}

async function processOfflineQueue() {
    if (!window.offlineQueue || window.offlineQueue.length === 0) return;

    console.log('🔄 Processing offline queue:', window.offlineQueue.length, 'items');
    const syncIndicator = document.getElementById('syncIndicator');
    if (syncIndicator) {
        syncIndicator.textContent = `⏳ Syncing ${window.offlineQueue.length} items...`;
        syncIndicator.style.display = 'block';
    }

    const queue = [...window.offlineQueue];
    let successCount = 0;
    let failCount = 0;

    for (const item of queue) {
        try {
            const { operationType, collection, data, offlineId } = item;

            if (operationType === 'add') {
                // Add lastModified timestamp for conflict resolution
                data.lastModified = new Date().toISOString();
                data.syncStatus = 'synced';
                delete data.offlineId;

                await db.ref(collection).push(data);

                // Remove from queue
                window.offlineQueue = window.offlineQueue.filter(q => q.offlineId !== offlineId);
                successCount++;

                if (syncIndicator) {
                    syncIndicator.textContent = `⏳ Syncing ${queue.length - successCount - failCount} items...`;
                }
            }
        } catch (error) {
            console.error('❌ Error syncing item:', error);
            failCount++;
        }
    }

    // Save updated queue
    saveOfflineQueueToStorage();

    if (syncIndicator) {
        if (failCount === 0) {
            syncIndicator.textContent = `✅ Synced ${successCount} items`;
            setTimeout(() => {
                syncIndicator.style.display = 'none';
            }, 3000);
        } else {
            syncIndicator.textContent = `⚠️ Synced ${successCount}, ${failCount} failed`;
        }
    }

    console.log(`✅ Sync complete: ${successCount} success, ${failCount} failed`);

    // Refresh current tab
    if (window.currentTabRefresh) {
        setTimeout(() => window.currentTabRefresh(), 500);
    }
}

function updateOfflineIndicator() {
    const indicator = document.getElementById('offlineIndicator');
    const expenseBanner = document.getElementById('offlineExpenseBanner');

    if (indicator) {
        indicator.style.display = window.isOnline ? 'none' : 'block';
    }

    if (expenseBanner) {
        expenseBanner.style.display = window.isOnline ? 'none' : 'block';
    }
}

// Load Personal Expenses
async function loadPersonalExpenses() {
    try {
        db.ref('personalExpenses').on('value', (snapshot) => {
            const expenses = [];
            snapshot.forEach(child => {
                expenses.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Filter by current user
            window.allPersonalExpenses = expenses.filter(e =>
                e.userId === window.currentUser?.uid
            );

            console.log('✅ Personal expenses loaded:', window.allPersonalExpenses.length);

            // Auto-refresh tab if visible
            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 400);
        });
    } catch (error) {
        console.error('❌ Error loading personal expenses:', error);
    }
}

// Load Recurring Templates
async function loadRecurringTemplates() {
    try {
        db.ref('personalRecurringTemplates').on('value', (snapshot) => {
            const templates = [];
            snapshot.forEach(child => {
                templates.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Filter by current user
            window.allRecurringTemplates = templates.filter(t =>
                t.userId === window.currentUser?.uid
            );

            console.log('✅ Recurring templates loaded:', window.allRecurringTemplates.length);

            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 400);
        });
    } catch (error) {
        console.error('❌ Error loading recurring templates:', error);
    }
}

// Load Credit Cards
async function loadCreditCards() {
    try {
        db.ref('personalCreditCards').on('value', (snapshot) => {
            const cards = [];
            snapshot.forEach(child => {
                cards.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Filter by current user
            window.allCreditCards = cards.filter(c =>
                c.userId === window.currentUser?.uid
            );

            console.log('✅ Credit cards loaded:', window.allCreditCards.length);

            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 400);
        });
    } catch (error) {
        console.error('❌ Error loading credit cards:', error);
    }
}

// Load Personal Budgets
async function loadPersonalBudgets() {
    try {
        db.ref('personalBudgets').on('value', (snapshot) => {
            const budgets = [];
            snapshot.forEach(child => {
                budgets.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Filter by current user
            window.allPersonalBudgets = budgets.filter(b =>
                b.userId === window.currentUser?.uid
            );

            console.log('✅ Personal budgets loaded:', window.allPersonalBudgets.length);

            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 400);
        });
    } catch (error) {
        console.error('❌ Error loading personal budgets:', error);
    }
}

// Load Savings Goals
async function loadSavingsGoals() {
    try {
        db.ref('savingsGoals').on('value', (snapshot) => {
            const goals = [];
            snapshot.forEach(child => {
                goals.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Filter by current user
            window.allSavingsGoals = goals.filter(g =>
                g.userId === window.currentUser?.uid
            );

            console.log('✅ Savings goals loaded:', window.allSavingsGoals.length);

            setTimeout(() => {
                if (window.currentTabRefresh) {
                    window.currentTabRefresh();
                }
            }, 400);
        });
    } catch (error) {
        console.error('❌ Error loading savings goals:', error);
    }
}

// Add Personal Expense (with offline support)
async function addPersonalExpense(expenseData) {
    try {
        // Validation
        if (!expenseData.category || !expenseData.amount || expenseData.amount <= 0) {
            alert('⚠️ Please fill in all required fields');
            return { success: false };
        }

        if (expenseData.currency === 'USD' && (!expenseData.phpConversionRate || expenseData.phpConversionRate <= 0)) {
            alert('⚠️ Please enter the PHP conversion rate for USD expenses');
            return { success: false };
        }

        // Check if date is locked
        const dateString = new Date(expenseData.date).toISOString().split('T')[0];
        if (!preventBackdating(dateString)) {
            alert('⚠️ Cannot add expense on locked date!');
            return { success: false };
        }

        const expense = {
            userId: window.currentUser.uid,
            userName: window.currentUserData.displayName,
            date: expenseData.date,
            category: expenseData.category,
            amount: parseFloat(expenseData.amount),
            currency: expenseData.currency || 'PHP',
            phpConversionRate: expenseData.currency === 'USD' ? parseFloat(expenseData.phpConversionRate) : 1.0,
            description: expenseData.description || '',
            notes: expenseData.notes || '',
            isAutoGenerated: expenseData.isAutoGenerated || false,
            recurringTemplateId: expenseData.recurringTemplateId || null,
            creditCardPayment: expenseData.creditCardPayment || null,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName,
            lastModified: new Date().toISOString(),
            syncStatus: window.isOnline ? 'synced' : 'pending'
        };

        if (window.isOnline) {
            // Online: Save directly to Firebase
            utils.showLoading(true);
            const newRef = await db.ref('personalExpenses').push(expense);

            // Log activity
            await logActivity('personal_expense_added', 'personal_finance', {
                expenseId: newRef.key,
                category: expense.category,
                amount: expense.amount,
                currency: expense.currency
            });

            utils.showLoading(false);

            const displayAmount = expense.currency === 'USD'
                ? `$${expense.amount.toFixed(2)} (₱${(expense.amount * expense.phpConversionRate).toFixed(2)})`
                : `₱${expense.amount.toFixed(2)}`;

            alert(`✅ Expense recorded!\n\n💰 ${expense.category}: ${displayAmount}`);

            return { success: true, expenseId: newRef.key };
        } else {
            // Offline: Add to queue
            const offlineId = 'offline_' + Date.now() + '_' + Math.random();
            expense.offlineId = offlineId;

            window.offlineQueue.push({
                operationType: 'add',
                collection: 'personalExpenses',
                data: expense,
                offlineId: offlineId,
                timestamp: new Date().toISOString()
            });

            saveOfflineQueueToStorage();

            // Add to local array for immediate UI update
            window.allPersonalExpenses.push({ id: offlineId, ...expense });

            alert('✅ Expense saved offline!\n\n📡 Will sync when you reconnect to internet.');

            return { success: true, expenseId: offlineId, offline: true };
        }
    } catch (error) {
        console.error('❌ Error adding expense:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Record Credit Card Payment (auto-updates balance)
async function recordCreditCardPayment(cardId, amount, date) {
    if (!window.isOnline) {
        alert('⚠️ Credit card payments require internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const card = window.allCreditCards.find(c => c.id === cardId);
        if (!card) {
            throw new Error('Card not found');
        }

        const paymentAmount = parseFloat(amount);
        if (paymentAmount <= 0 || paymentAmount > card.currentBalance) {
            throw new Error('Invalid payment amount');
        }

        const newBalance = card.currentBalance - paymentAmount;

        // Create expense record
        const expenseResult = await addPersonalExpense({
            category: 'Credit Card Payment',
            amount: paymentAmount,
            currency: 'PHP',
            date: date,
            description: `Payment to ${card.cardName}`,
            creditCardPayment: {
                cardId: cardId,
                cardName: card.cardName,
                newBalance: newBalance
            }
        });

        if (!expenseResult.success) {
            throw new Error('Failed to create expense record');
        }

        // Update card balance and add to payment history
        const paymentHistory = card.paymentHistory || [];
        paymentHistory.push({
            date: date,
            amount: paymentAmount,
            newBalance: newBalance,
            paidBy: window.currentUserData.displayName,
            expenseId: expenseResult.expenseId
        });

        await db.ref(`personalCreditCards/${cardId}`).update({
            currentBalance: newBalance,
            paymentHistory: paymentHistory,
            lastModified: new Date().toISOString()
        });

        // Log activity
        await logActivity('credit_card_payment', 'personal_finance', {
            cardId: cardId,
            cardName: card.cardName,
            amount: paymentAmount,
            newBalance: newBalance
        });

        utils.showLoading(false);

        alert(`✅ Payment recorded!\n\n💳 ${card.cardName}\n💰 Amount: ₱${paymentAmount.toFixed(2)}\n📊 New Balance: ₱${newBalance.toFixed(2)}`);

        return { success: true };
    } catch (error) {
        console.error('❌ Error recording payment:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Generate Recurring Expenses for a month
async function generateRecurringExpenses(month, year) {
    try {
        const activeTemplates = window.allRecurringTemplates.filter(t => t.isActive);

        if (activeTemplates.length === 0) {
            alert('ℹ️ No active recurring templates found');
            return { success: false };
        }

        // Check if already generated for this month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const existingAutoExpenses = window.allPersonalExpenses.filter(e =>
            e.isAutoGenerated &&
            new Date(e.date) >= monthStart &&
            new Date(e.date) <= monthEnd
        );

        if (existingAutoExpenses.length > 0) {
            const confirm = window.confirm(`⚠️ Found ${existingAutoExpenses.length} auto-generated expenses for this month.\n\nGenerate again anyway?`);
            if (!confirm) return { success: false };
        }

        utils.showLoading(true);
        let generatedCount = 0;

        for (const template of activeTemplates) {
            const expenseDate = new Date(year, month - 1, template.dayOfMonth);

            // Skip if day doesn't exist in month (e.g., Feb 30)
            if (expenseDate.getMonth() !== month - 1) {
                console.log(`⚠️ Skipping template "${template.name}" - day ${template.dayOfMonth} doesn't exist in this month`);
                continue;
            }

            const result = await addPersonalExpense({
                category: template.category,
                amount: template.amount,
                currency: template.currency,
                date: expenseDate.toISOString(),
                description: template.name,
                notes: 'Auto-generated from recurring template',
                isAutoGenerated: true,
                recurringTemplateId: template.id
            });

            if (result.success) {
                generatedCount++;
            }
        }

        utils.showLoading(false);

        alert(`✅ Generated ${generatedCount} recurring expenses for ${getMonthName(month)} ${year}!`);

        return { success: true, count: generatedCount };
    } catch (error) {
        console.error('❌ Error generating recurring expenses:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Save Recurring Template
async function saveRecurringTemplate(templateData) {
    if (!window.isOnline) {
        alert('⚠️ Editing templates requires internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const template = {
            userId: window.currentUser.uid,
            name: templateData.name,
            category: templateData.category,
            amount: parseFloat(templateData.amount),
            currency: templateData.currency,
            dayOfMonth: parseInt(templateData.dayOfMonth),
            isActive: templateData.isActive !== false,
            createdAt: templateData.id ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (templateData.id) {
            // Update existing
            await db.ref(`personalRecurringTemplates/${templateData.id}`).update(template);
        } else {
            // Create new
            await db.ref('personalRecurringTemplates').push(template);
        }

        utils.showLoading(false);
        alert('✅ Template saved!');

        return { success: true };
    } catch (error) {
        console.error('❌ Error saving template:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Delete Recurring Template
async function deleteRecurringTemplate(templateId) {
    if (!window.isOnline) {
        alert('⚠️ Deleting templates requires internet connection');
        return { success: false };
    }

    try {
        const template = window.allRecurringTemplates.find(t => t.id === templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        const confirm = window.confirm(`Delete template "${template.name}"?\n\nThis will not delete previously generated expenses.`);
        if (!confirm) return { success: false };

        utils.showLoading(true);
        await db.ref(`personalRecurringTemplates/${templateId}`).remove();
        utils.showLoading(false);

        alert('✅ Template deleted!');
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting template:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Save Credit Card
async function saveCreditCard(cardData) {
    if (!window.isOnline) {
        alert('⚠️ Editing credit cards requires internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const card = {
            userId: window.currentUser.uid,
            cardName: cardData.cardName,
            cardHolder: cardData.cardHolder,
            bank: cardData.bank,
            creditLimit: parseFloat(cardData.creditLimit),
            currentBalance: parseFloat(cardData.currentBalance),
            interestRate: parseFloat(cardData.interestRate),
            monthlyDueDate: parseInt(cardData.monthlyDueDate),
            minimumPaymentPercent: parseFloat(cardData.minimumPaymentPercent) || 3.0,
            paymentHistory: cardData.paymentHistory || [],
            isActive: cardData.isActive !== false,
            createdAt: cardData.id ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (cardData.id) {
            // Update existing
            await db.ref(`personalCreditCards/${cardData.id}`).update(card);
        } else {
            // Create new
            await db.ref('personalCreditCards').push(card);
        }

        utils.showLoading(false);
        alert('✅ Credit card saved!');

        return { success: true };
    } catch (error) {
        console.error('❌ Error saving credit card:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Delete Credit Card
async function deleteCreditCard(cardId) {
    if (!window.isOnline) {
        alert('⚠️ Deleting credit cards requires internet connection');
        return { success: false };
    }

    try {
        const card = window.allCreditCards.find(c => c.id === cardId);
        if (!card) {
            throw new Error('Card not found');
        }

        if (card.currentBalance > 0) {
            const confirm = window.confirm(`⚠️ This card has a balance of ₱${card.currentBalance.toFixed(2)}.\n\nDelete anyway?`);
            if (!confirm) return { success: false };
        }

        const confirm2 = window.confirm(`Delete credit card "${card.cardName}"?`);
        if (!confirm2) return { success: false };

        utils.showLoading(true);
        await db.ref(`personalCreditCards/${cardId}`).remove();
        utils.showLoading(false);

        alert('✅ Credit card deleted!');
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting credit card:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Add Manual Contribution to Savings Goal
async function addManualContribution(goalId, amount, notes) {
    if (!window.isOnline) {
        alert('⚠️ Adding contributions requires internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const goal = window.allSavingsGoals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('Goal not found');
        }

        const contributionAmount = parseFloat(amount);
        if (contributionAmount <= 0) {
            throw new Error('Amount must be greater than zero');
        }

        const newCurrentAmount = (goal.currentAmount || 0) + contributionAmount;

        const contributions = goal.contributions || [];
        contributions.push({
            date: new Date().toISOString(),
            amount: contributionAmount,
            source: 'manual',
            addedBy: window.currentUserData.displayName,
            notes: notes || ''
        });

        await db.ref(`savingsGoals/${goalId}`).update({
            currentAmount: newCurrentAmount,
            contributions: contributions,
            lastModified: new Date().toISOString()
        });

        // Check if goal is now complete
        await checkGoalCompletion(goalId);

        utils.showLoading(false);
        alert(`✅ Contribution added!\n\n🎯 ${goal.goalName}\n💰 +₱${contributionAmount.toFixed(2)}\n📊 New Total: ₱${newCurrentAmount.toFixed(2)}`);

        return { success: true };
    } catch (error) {
        console.error('❌ Error adding contribution:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Record Withdrawal from Savings Goal
async function recordWithdrawal(goalId, amount, reason) {
    if (!window.isOnline) {
        alert('⚠️ Recording withdrawals requires internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const goal = window.allSavingsGoals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('Goal not found');
        }

        const withdrawalAmount = parseFloat(amount);
        if (withdrawalAmount <= 0) {
            throw new Error('Amount must be greater than zero');
        }

        if (withdrawalAmount > goal.currentAmount) {
            throw new Error('Withdrawal amount exceeds current savings');
        }

        if (!reason || reason.trim() === '') {
            throw new Error('Please provide a reason for withdrawal');
        }

        const newCurrentAmount = goal.currentAmount - withdrawalAmount;

        const withdrawals = goal.withdrawals || [];
        withdrawals.push({
            date: new Date().toISOString(),
            amount: withdrawalAmount,
            reason: reason.trim(),
            withdrawnBy: window.currentUserData.displayName
        });

        // If goal was completed, mark as incomplete if needed
        const updates = {
            currentAmount: newCurrentAmount,
            withdrawals: withdrawals,
            lastModified: new Date().toISOString()
        };

        if (goal.isCompleted && newCurrentAmount < goal.targetAmount) {
            updates.isCompleted = false;
            updates.completedAt = null;
        }

        await db.ref(`savingsGoals/${goalId}`).update(updates);

        utils.showLoading(false);
        alert(`✅ Withdrawal recorded!\n\n🎯 ${goal.goalName}\n💸 -₱${withdrawalAmount.toFixed(2)}\n📊 Remaining: ₱${newCurrentAmount.toFixed(2)}`);

        return { success: true };
    } catch (error) {
        console.error('❌ Error recording withdrawal:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Check if goal is completed
async function checkGoalCompletion(goalId) {
    try {
        const goal = window.allSavingsGoals.find(g => g.id === goalId);
        if (!goal) return;

        if (!goal.isCompleted && goal.currentAmount >= goal.targetAmount) {
            // Goal just completed!
            await db.ref(`savingsGoals/${goalId}`).update({
                isCompleted: true,
                completedAt: new Date().toISOString(),
                autoAllocate: false // Stop auto-allocation
            });

            // Show completion modal
            if (typeof openGoalCompletionModal === 'function') {
                openGoalCompletionModal(goal);
            }
        }
    } catch (error) {
        console.error('❌ Error checking goal completion:', error);
    }
}

// Save Savings Goal
async function saveSavingsGoal(goalData) {
    if (!window.isOnline) {
        alert('⚠️ Editing savings goals requires internet connection');
        return { success: false };
    }

    try {
        utils.showLoading(true);

        const goal = {
            userId: window.currentUser.uid,
            goalName: goalData.goalName,
            category: goalData.category,
            targetAmount: parseFloat(goalData.targetAmount),
            currentAmount: parseFloat(goalData.currentAmount) || 0,
            priority: parseInt(goalData.priority),
            deadline: goalData.deadline || null,
            autoAllocate: goalData.autoAllocate !== false,
            isCompleted: false,
            contributions: goalData.contributions || [],
            withdrawals: goalData.withdrawals || [],
            createdAt: goalData.id ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (goalData.id) {
            // Update existing
            await db.ref(`savingsGoals/${goalData.id}`).update(goal);
        } else {
            // Create new
            const newRef = await db.ref('savingsGoals').push(goal);

            // Check if already complete
            if (goal.currentAmount >= goal.targetAmount) {
                await checkGoalCompletion(newRef.key);
            }
        }

        utils.showLoading(false);
        alert('✅ Savings goal saved!');

        return { success: true };
    } catch (error) {
        console.error('❌ Error saving savings goal:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Delete Savings Goal
async function deleteSavingsGoal(goalId) {
    if (!window.isOnline) {
        alert('⚠️ Deleting savings goals requires internet connection');
        return { success: false };
    }

    try {
        const goal = window.allSavingsGoals.find(g => g.id === goalId);
        if (!goal) {
            throw new Error('Goal not found');
        }

        if (goal.currentAmount > 0) {
            const confirm = window.confirm(`⚠️ This goal has ₱${goal.currentAmount.toFixed(2)} saved.\n\nDelete anyway? (This won't delete your actual money)`);
            if (!confirm) return { success: false };
        }

        const confirm2 = window.confirm(`Delete savings goal "${goal.goalName}"?`);
        if (!confirm2) return { success: false };

        utils.showLoading(true);
        await db.ref(`savingsGoals/${goalId}`).remove();
        utils.showLoading(false);

        alert('✅ Savings goal deleted!');
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting savings goal:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// Helper function to get month name
function getMonthName(month) {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month - 1] || '';
}

// Export personal finance functions
window.loadOfflineQueueFromStorage = loadOfflineQueueFromStorage;
window.saveOfflineQueueToStorage = saveOfflineQueueToStorage;
window.processOfflineQueue = processOfflineQueue;
window.updateOfflineIndicator = updateOfflineIndicator;
window.loadPersonalExpenses = loadPersonalExpenses;
window.loadRecurringTemplates = loadRecurringTemplates;
window.loadCreditCards = loadCreditCards;
window.loadPersonalBudgets = loadPersonalBudgets;
window.loadSavingsGoals = loadSavingsGoals;
window.addPersonalExpense = addPersonalExpense;
window.recordCreditCardPayment = recordCreditCardPayment;
window.generateRecurringExpenses = generateRecurringExpenses;
window.saveRecurringTemplate = saveRecurringTemplate;
window.deleteRecurringTemplate = deleteRecurringTemplate;
window.saveCreditCard = saveCreditCard;
window.deleteCreditCard = deleteCreditCard;
window.addManualContribution = addManualContribution;
window.recordWithdrawal = recordWithdrawal;
window.checkGoalCompletion = checkGoalCompletion;
window.saveSavingsGoal = saveSavingsGoal;
window.deleteSavingsGoal = deleteSavingsGoal;

// ============================================
// BUDGET CALCULATION & ANALYSIS
// ============================================

// Calculate net personal budget (60% spending + 40% savings)
function calculateNetPersonalBudget(month, year) {
    try {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        // Filter claimed repairs for the month
        const claimedRepairs = (window.allRepairs || []).filter(r =>
            r.status === 'Claimed' &&
            r.releasedAt &&
            new Date(r.releasedAt) >= monthStart &&
            new Date(r.releasedAt) <= monthEnd
        );

        // Check if current user is a technician
        const userRepairs = claimedRepairs.filter(r => r.technicianId === window.currentUser?.uid);
        const isTechnician = userRepairs.length > 0;

        let spendingBudget = 0;
        let savingsPool = 0;
        let breakdown = {};

        if (isTechnician) {
            // Calculate user's commission
            const userCommission = userRepairs.reduce((sum, r) => {
                const commission = r.commission || 0;
                return sum + commission;
            }, 0);

            // Calculate all technicians' commissions for proportion
            const allTechCommissions = claimedRepairs.reduce((sum, r) => {
                const commission = r.commission || 0;
                return sum + commission;
            }, 0);

            const userProportion = allTechCommissions > 0 ? userCommission / allTechCommissions : 0;

            // Get overhead expenses for the month
            const overheadExpenses = (window.allOverheadExpenses || []).filter(e => {
                if (e.deleted) return false;
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStart && expenseDate <= monthEnd;
            });

            const totalOverhead = overheadExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const overheadShare = totalOverhead * userProportion;

            // Net after overhead
            const netAfterOverhead = userCommission - overheadShare;

            // Split: 60% spending, 40% savings
            spendingBudget = netAfterOverhead * 0.6;
            savingsPool = netAfterOverhead * 0.4;

            breakdown = {
                grossCommission: userCommission,
                overheadShare: overheadShare,
                userProportion: userProportion,
                totalOverhead: totalOverhead,
                netAfterOverhead: netAfterOverhead,
                sixtyPercentSpending: spendingBudget,
                fortyPercentSavings: savingsPool
            };
        } else {
            // Non-technician: Get manual budget for spending, but calculate shared savings pool
            const manualBudget = window.allPersonalBudgets.find(b =>
                b.month === month && b.year === year
            );

            spendingBudget = manualBudget ? manualBudget.manualBudgetAmount : 0;

            // Calculate total savings pool from ALL technicians' 40%
            const allTechSavings = claimedRepairs.reduce((sum, r) => {
                const commission = r.commission || 0;
                return sum + commission;
            }, 0);

            // Get overhead for all techs
            const overheadExpenses = (window.allOverheadExpenses || []).filter(e => {
                if (e.deleted) return false;
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStart && expenseDate <= monthEnd;
            });
            const totalOverhead = overheadExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

            const netAfterOverhead = allTechSavings - totalOverhead;
            savingsPool = netAfterOverhead * 0.4; // 40% of all techs' net goes to savings

            breakdown = {
                manual: true,
                manualBudgetAmount: spendingBudget,
                sharedSavingsPool: savingsPool,
                allTechCommissions: allTechSavings,
                sharedOverhead: totalOverhead
            };
        }

        // Calculate spending for the month
        const expenses = (window.allPersonalExpenses || []).filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
        });

        let totalSpent = 0;
        const spentByCategory = {};

        expenses.forEach(e => {
            const phpAmount = e.currency === 'USD'
                ? e.amount * e.phpConversionRate
                : e.amount;

            totalSpent += phpAmount;
            spentByCategory[e.category] = (spentByCategory[e.category] || 0) + phpAmount;
        });

        const remaining = spendingBudget - totalSpent;
        const utilizationPercent = spendingBudget > 0 ? (totalSpent / spendingBudget) * 100 : 0;

        return {
            spendingBudget: spendingBudget,
            savingsPool: savingsPool,
            spent: totalSpent,
            remaining: remaining,
            utilizationPercent: utilizationPercent,
            isTechnician: isTechnician,
            breakdown: breakdown,
            spentByCategory: spentByCategory
        };
    } catch (error) {
        console.error('❌ Error calculating budget:', error);
        return {
            spendingBudget: 0,
            savingsPool: 0,
            spent: 0,
            remaining: 0,
            utilizationPercent: 0,
            isTechnician: false,
            breakdown: {},
            spentByCategory: {}
        };
    }
}

// Calculate average monthly expenses (last 3 months)
function calculateAverageMonthlyExpenses() {
    try {
        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

        const recentExpenses = (window.allPersonalExpenses || []).filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= threeMonthsAgo;
        });

        let totalSpent = 0;

        recentExpenses.forEach(e => {
            const phpAmount = e.currency === 'USD'
                ? e.amount * e.phpConversionRate
                : e.amount;

            totalSpent += phpAmount;
        });

        // Average over 3 months
        const average = totalSpent / 3;

        return average;
    } catch (error) {
        console.error('❌ Error calculating average expenses:', error);
        return 0;
    }
}

// Recommend goal allocation based on emergency fund and priorities
function recommendGoalAllocation(savingsPoolAmount) {
    try {
        const activeGoals = (window.allSavingsGoals || []).filter(g =>
            !g.isCompleted && g.autoAllocate
        );

        if (activeGoals.length === 0) {
            return {
                recommendations: [],
                allocationStrategy: 'No Active Goals',
                emergencyFundStatus: null
            };
        }

        // Calculate recommended emergency fund (6 months expenses)
        const averageMonthlyExpenses = calculateAverageMonthlyExpenses();
        const recommendedEmergencyFund = averageMonthlyExpenses * 6;

        // Find emergency fund goal
        const emergencyGoal = activeGoals.find(g => g.category === 'Emergency Fund');

        let recommendations = [];
        let allocationStrategy = '';

        if (emergencyGoal && emergencyGoal.currentAmount < emergencyGoal.targetAmount) {
            // Emergency fund not complete - prioritize it
            const emergencyAllocation = savingsPoolAmount * 0.7;
            const remainingPool = savingsPoolAmount * 0.3;

            recommendations.push({
                goalId: emergencyGoal.id,
                goalName: emergencyGoal.goalName,
                suggestedAmount: emergencyAllocation,
                suggestedPercent: 70,
                reasoning: '70% allocated to Emergency Fund (priority)'
            });

            // Distribute remaining 30% to other goals
            const otherGoals = activeGoals.filter(g => g.id !== emergencyGoal.id);

            if (otherGoals.length > 0) {
                const weightedDistribution = calculateWeightedDistribution(otherGoals, remainingPool);
                recommendations.push(...weightedDistribution);
            }

            allocationStrategy = 'Emergency First';
        } else {
            // Emergency fund complete or doesn't exist - distribute by priority/deadline
            const weightedDistribution = calculateWeightedDistribution(activeGoals, savingsPoolAmount);
            recommendations = weightedDistribution;

            allocationStrategy = 'Balanced Priority';
        }

        const emergencyFundStatus = emergencyGoal ? {
            current: emergencyGoal.currentAmount,
            target: emergencyGoal.targetAmount,
            recommended: recommendedEmergencyFund,
            monthsOfExpensesCovered: averageMonthlyExpenses > 0
                ? emergencyGoal.currentAmount / averageMonthlyExpenses
                : 0,
            percentComplete: (emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100
        } : null;

        return {
            recommendations: recommendations,
            allocationStrategy: allocationStrategy,
            emergencyFundStatus: emergencyFundStatus
        };
    } catch (error) {
        console.error('❌ Error recommending allocation:', error);
        return {
            recommendations: [],
            allocationStrategy: 'Error',
            emergencyFundStatus: null
        };
    }
}

// Calculate weighted distribution based on priority and deadline
function calculateWeightedDistribution(goals, poolAmount) {
    const today = new Date();

    // Calculate weights for each goal
    const goalsWithWeights = goals.map(g => {
        // Priority weight (Priority 1 = 2.0, Priority 5 = 0.5)
        let priorityWeight = 0;
        switch (g.priority) {
            case 1: priorityWeight = 2.0; break;
            case 2: priorityWeight = 1.5; break;
            case 3: priorityWeight = 1.0; break;
            case 4: priorityWeight = 0.7; break;
            case 5: priorityWeight = 0.5; break;
            default: priorityWeight = 1.0;
        }

        // Deadline urgency multiplier
        let deadlineMultiplier = 1.0;
        if (g.deadline) {
            const deadline = new Date(g.deadline);
            const monthsUntilDeadline = (deadline - today) / (1000 * 60 * 60 * 24 * 30);

            if (monthsUntilDeadline <= 6) {
                deadlineMultiplier = 1.5;
            } else if (monthsUntilDeadline <= 12) {
                deadlineMultiplier = 1.2;
            }
        }

        const totalWeight = priorityWeight * deadlineMultiplier;

        return {
            ...g,
            weight: totalWeight
        };
    });

    // Calculate total weight
    const totalWeight = goalsWithWeights.reduce((sum, g) => sum + g.weight, 0);

    // Distribute based on weight
    const recommendations = goalsWithWeights.map(g => {
        const percent = (g.weight / totalWeight) * 100;
        const amount = poolAmount * (g.weight / totalWeight);

        let reasoning = `${percent.toFixed(1)}% - Priority ${g.priority}`;
        if (g.deadline) {
            const deadline = new Date(g.deadline);
            const monthsUntil = Math.round((deadline - today) / (1000 * 60 * 60 * 24 * 30));
            reasoning += ` (${monthsUntil} months until deadline)`;
        }

        return {
            goalId: g.id,
            goalName: g.goalName,
            suggestedAmount: amount,
            suggestedPercent: percent,
            reasoning: reasoning
        };
    });

    return recommendations;
}

// Allocate savings from commission to goals
async function allocateSavingsFromCommission(month, year) {
    try {
        const budget = calculateNetPersonalBudget(month, year);

        if (budget.savingsPool <= 0) {
            console.log('ℹ️ No savings pool to allocate');
            alert('ℹ️ No savings pool available for this month');
            return { success: false, message: 'No savings pool available' };
        }

        const allocation = recommendGoalAllocation(budget.savingsPool);

        if (allocation.recommendations.length === 0) {
            console.log('ℹ️ No active goals to allocate to');
            return { success: false, message: 'No active goals' };
        }

        utils.showLoading(true);

        for (const rec of allocation.recommendations) {
            const goal = window.allSavingsGoals.find(g => g.id === rec.goalId);
            if (!goal) continue;

            const newCurrentAmount = (goal.currentAmount || 0) + rec.suggestedAmount;

            const contributions = goal.contributions || [];
            contributions.push({
                date: new Date().toISOString(),
                amount: rec.suggestedAmount,
                source: 'commission',
                addedBy: window.currentUserData.displayName,
                notes: `Auto-allocated from ${getMonthName(month)} ${year} commission`
            });

            await db.ref(`savingsGoals/${rec.goalId}`).update({
                currentAmount: newCurrentAmount,
                contributions: contributions,
                monthlyAllocation: rec.suggestedAmount,
                allocationPercent: rec.suggestedPercent,
                lastModified: new Date().toISOString()
            });

            // Check if goal completed
            await checkGoalCompletion(rec.goalId);
        }

        utils.showLoading(false);

        alert(`✅ Allocated ₱${budget.savingsPool.toFixed(2)} to ${allocation.recommendations.length} goals!`);

        return { success: true };
    } catch (error) {
        console.error('❌ Error allocating savings:', error);
        utils.showLoading(false);
        alert(`Error: ${error.message}`);
        return { success: false };
    }
}

// ============================================
// LOAN AFFORDABILITY ANALYZER
// ============================================

function analyzeLoanAffordability(proposedAmount, termMonths, annualRate) {
    try {
        const loanAmount = parseFloat(proposedAmount);
        const term = parseInt(termMonths);
        const rate = parseFloat(annualRate);

        if (loanAmount <= 0 || term <= 0 || rate < 0) {
            throw new Error('Invalid input values');
        }

        // Calculate monthly payment using amortization formula
        const monthlyRate = rate / 12 / 100;
        let monthlyPayment = 0;

        if (monthlyRate === 0) {
            monthlyPayment = loanAmount / term;
        } else {
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
                (Math.pow(1 + monthlyRate, term) - 1);
        }

        // Get active credit cards
        const activeCards = (window.allCreditCards || []).filter(c => c.isActive);

        // Calculate total debt and monthly minimums
        let totalCurrentDebt = 0;
        let monthlyMinimums = 0;

        activeCards.forEach(card => {
            const balance = card.currentBalance || 0;
            const minimumPercent = card.minimumPaymentPercent || 3;

            totalCurrentDebt += balance;
            monthlyMinimums += balance * (minimumPercent / 100);
        });

        // Get current month budget (60% spending portion only)
        const today = new Date();
        const budget = calculateNetPersonalBudget(today.getMonth() + 1, today.getFullYear());
        const monthlyBudget = budget.spendingBudget;

        // Calculate debt-to-income ratio
        const totalMonthlyObligations = monthlyMinimums + monthlyPayment;
        const debtToIncomeRatio = monthlyBudget > 0
            ? (totalMonthlyObligations / monthlyBudget) * 100
            : 999;

        // Calculate remaining cash flow
        const remainingCashFlow = monthlyBudget - budget.spent - monthlyPayment - monthlyMinimums;

        // Determine recommendation
        let recommendation = '';
        let recommendationColor = '';

        if (debtToIncomeRatio < 40) {
            recommendation = '✅ Approved';
            recommendationColor = '#4CAF50';
        } else if (debtToIncomeRatio >= 40 && debtToIncomeRatio < 50) {
            recommendation = '⚠️ Proceed with Caution';
            recommendationColor = '#FF9800';
        } else {
            recommendation = '❌ Not Recommended';
            recommendationColor = '#F44336';
        }

        const detailedMessage = `Your debt-to-income ratio would be ${debtToIncomeRatio.toFixed(1)}%. ` +
            (debtToIncomeRatio < 40
                ? `This is healthy and manageable. You would have ₱${remainingCashFlow.toFixed(2)} remaining each month.`
                : debtToIncomeRatio < 50
                    ? `This is getting high. You would have ₱${remainingCashFlow.toFixed(2)} remaining each month. Consider paying down existing debt first.`
                    : `This is too high and risky. You would only have ₱${remainingCashFlow.toFixed(2)} remaining each month. Not recommended.`);

        return {
            success: true,
            recommendation: recommendation,
            recommendationColor: recommendationColor,
            monthlyPayment: monthlyPayment,
            totalCurrentDebt: totalCurrentDebt,
            monthlyMinimums: monthlyMinimums,
            monthlyObligations: totalMonthlyObligations,
            debtToIncomeRatio: debtToIncomeRatio,
            monthlyBudget: monthlyBudget,
            currentSpent: budget.spent,
            remainingCashFlow: remainingCashFlow,
            detailedMessage: detailedMessage
        };
    } catch (error) {
        console.error('❌ Error analyzing loan:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// TREND & ANALYTICS
// ============================================

function getSpendingTrendData(months = 6) {
    try {
        const today = new Date();
        const trendData = [];

        for (let i = months - 1; i >= 0; i--) {
            const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = targetMonth.getMonth() + 1;
            const year = targetMonth.getFullYear();

            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59);

            const expenses = (window.allPersonalExpenses || []).filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStart && expenseDate <= monthEnd;
            });

            let total = 0;
            const byCategory = {};

            expenses.forEach(e => {
                const phpAmount = e.currency === 'USD'
                    ? e.amount * e.phpConversionRate
                    : e.amount;

                total += phpAmount;
                byCategory[e.category] = (byCategory[e.category] || 0) + phpAmount;
            });

            trendData.push({
                month: month,
                year: year,
                monthName: getMonthName(month),
                total: total,
                byCategory: byCategory
            });
        }

        return trendData;
    } catch (error) {
        console.error('❌ Error getting trend data:', error);
        return [];
    }
}

function getSavingsProgressData() {
    try {
        return (window.allSavingsGoals || []).map(g => ({
            goalName: g.goalName,
            category: g.category,
            current: g.currentAmount || 0,
            target: g.targetAmount,
            percentComplete: ((g.currentAmount || 0) / g.targetAmount) * 100,
            isCompleted: g.isCompleted || false
        }));
    } catch (error) {
        console.error('❌ Error getting savings progress:', error);
        return [];
    }
}

function getCategoryBreakdown(month, year) {
    try {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const expenses = (window.allPersonalExpenses || []).filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
        });

        const byCategory = {};

        expenses.forEach(e => {
            const phpAmount = e.currency === 'USD'
                ? e.amount * e.phpConversionRate
                : e.amount;

            byCategory[e.category] = (byCategory[e.category] || 0) + phpAmount;
        });

        return byCategory;
    } catch (error) {
        console.error('❌ Error getting category breakdown:', error);
        return {};
    }
}

// Export budget and analysis functions
window.calculateNetPersonalBudget = calculateNetPersonalBudget;
window.calculateAverageMonthlyExpenses = calculateAverageMonthlyExpenses;
window.recommendGoalAllocation = recommendGoalAllocation;
window.allocateSavingsFromCommission = allocateSavingsFromCommission;
window.analyzeLoanAffordability = analyzeLoanAffordability;
window.getSpendingTrendData = getSpendingTrendData;
window.getSavingsProgressData = getSavingsProgressData;
window.getCategoryBreakdown = getCategoryBreakdown;

// ===== USAGE ANALYTICS TRACKING SYSTEM =====

/**
 * Track tab visits and form field interactions
 * Stores in Firebase for admin analysis
 */
function trackUsage(eventType, data) {
    if (!window.currentUser || !window.currentUserData) return;

    // Create usage event
    const usageEvent = {
        userId: window.currentUser.uid,
        userName: window.currentUserData.displayName,
        userRole: window.currentUserData.role,
        eventType: eventType, // 'tab_switch', 'form_submit', 'field_interaction'
        timestamp: new Date().toISOString(),
        data: data
    };

    // Store in Firebase under usageAnalytics collection
    db.ref('usageAnalytics').push(usageEvent).catch(error => {
        console.error('❌ Error tracking usage:', error);
    });
}

/**
 * Track tab switches
 */
function trackTabSwitch(fromTab, toTab) {
    trackUsage('tab_switch', {
        fromTab: fromTab,
        toTab: toTab,
        timestamp: new Date().toISOString()
    });
}

/**
 * Track form submissions
 */
function trackFormSubmit(formName, formData = {}) {
    trackUsage('form_submit', {
        formName: formName,
        fields: Object.keys(formData),
        timestamp: new Date().toISOString()
    });
}

/**
 * Track field interactions (focus events)
 */
function trackFieldInteraction(fieldName, fieldType) {
    // Throttle to avoid excessive tracking - only track once per field per session
    if (!window.trackedFields) {
        window.trackedFields = new Set();
    }

    const fieldKey = `${fieldName}_${fieldType}`;
    if (window.trackedFields.has(fieldKey)) return;

    window.trackedFields.add(fieldKey);

    trackUsage('field_interaction', {
        fieldName: fieldName,
        fieldType: fieldType,
        timestamp: new Date().toISOString()
    });
}

/**
 * Get usage analytics for admin (filtered by date range)
 */
async function getUsageAnalytics(startDate, endDate, eventType = null) {
    try {
        const snapshot = await db.ref('usageAnalytics')
            .orderByChild('timestamp')
            .startAt(startDate)
            .endAt(endDate)
            .once('value');

        const events = [];
        snapshot.forEach(child => {
            const event = child.val();
            event.id = child.key;

            // Filter by event type if specified
            if (!eventType || event.eventType === eventType) {
                events.push(event);
            }
        });

        return events;
    } catch (error) {
        console.error('❌ Error getting usage analytics:', error);
        return [];
    }
}

/**
 * Get aggregated tab usage statistics
 */
async function getTabUsageStats(startDate, endDate) {
    const events = await getUsageAnalytics(startDate, endDate, 'tab_switch');

    // Aggregate by tab
    const tabCounts = {};
    const tabByUser = {};
    const tabByRole = {};

    events.forEach(event => {
        const tab = event.data.toTab;
        if (!tab) return;

        // Overall counts
        tabCounts[tab] = (tabCounts[tab] || 0) + 1;

        // By user
        if (!tabByUser[event.userName]) {
            tabByUser[event.userName] = {};
        }
        tabByUser[event.userName][tab] = (tabByUser[event.userName][tab] || 0) + 1;

        // By role
        if (!tabByRole[event.userRole]) {
            tabByRole[event.userRole] = {};
        }
        tabByRole[event.userRole][tab] = (tabByRole[event.userRole][tab] || 0) + 1;
    });

    return {
        totalEvents: events.length,
        tabCounts: tabCounts,
        tabByUser: tabByUser,
        tabByRole: tabByRole,
        mostUsedTabs: Object.entries(tabCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tab, count]) => ({ tab, count }))
    };
}

/**
 * Get aggregated form usage statistics
 */
async function getFormUsageStats(startDate, endDate) {
    const events = await getUsageAnalytics(startDate, endDate, 'form_submit');

    // Aggregate by form
    const formCounts = {};
    const formByUser = {};

    events.forEach(event => {
        const form = event.data.formName;
        if (!form) return;

        // Overall counts
        formCounts[form] = (formCounts[form] || 0) + 1;

        // By user
        if (!formByUser[event.userName]) {
            formByUser[event.userName] = {};
        }
        formByUser[event.userName][form] = (formByUser[event.userName][form] || 0) + 1;
    });

    return {
        totalSubmissions: events.length,
        formCounts: formCounts,
        formByUser: formByUser,
        mostUsedForms: Object.entries(formCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([form, count]) => ({ form, count }))
    };
}

/**
 * Get field interaction statistics
 */
async function getFieldUsageStats(startDate, endDate) {
    const events = await getUsageAnalytics(startDate, endDate, 'field_interaction');

    // Aggregate by field
    const fieldCounts = {};
    const fieldByType = {};

    events.forEach(event => {
        const field = event.data.fieldName;
        const type = event.data.fieldType;
        if (!field) return;

        // Overall counts
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;

        // By type
        if (!fieldByType[type]) {
            fieldByType[type] = {};
        }
        fieldByType[type][field] = (fieldByType[type][field] || 0) + 1;
    });

    return {
        totalInteractions: events.length,
        fieldCounts: fieldCounts,
        fieldByType: fieldByType,
        mostUsedFields: Object.entries(fieldCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([field, count]) => ({ field, count }))
    };
}

// Export tracking functions
window.trackUsage = trackUsage;
window.trackTabSwitch = trackTabSwitch;
window.trackFormSubmit = trackFormSubmit;
window.trackFieldInteraction = trackFieldInteraction;
window.getUsageAnalytics = getUsageAnalytics;
window.getTabUsageStats = getTabUsageStats;
window.getFormUsageStats = getFormUsageStats;
window.getFieldUsageStats = getFieldUsageStats;

/**
 * Extract and analyze historical remittance data
 */
async function performExtraction() {
    const startDate = document.getElementById('extractStartDate').value;
    const endDate = document.getElementById('extractEndDate').value;
    const techFilter = document.getElementById('extractTechFilter').value;
    const statusFilter = document.getElementById('extractStatusFilter').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    const resultsContainer = document.getElementById('extractionResults');
    resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; 
                        width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #666; font-size: 16px;">Extracting data from Firebase...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    try {
        // Fetch all remittances
        const snapshot = await db.ref('techRemittances').once('value');
        const allRemittances = [];

        snapshot.forEach(child => {
            const data = child.val();
            allRemittances.push({
                id: child.key,
                ...data
            });
        });

        // Filter by date range
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        let filteredRemittances = allRemittances.filter(r => {
            const remitDate = new Date(r.submittedAt || r.date);
            return remitDate >= start && remitDate <= end;
        });

        // Apply filters
        if (techFilter) {
            filteredRemittances = filteredRemittances.filter(r => r.techId === techFilter);
        }
        if (statusFilter) {
            filteredRemittances = filteredRemittances.filter(r => r.status === statusFilter);
        }

        // Process and calculate with detailed repair data
        const processedData = await Promise.all(filteredRemittances.map(async (r) => {
            const payments = r.totalPaymentsCollected || 0;
            const expenses = r.totalExpenses || 0;
            const net = payments - expenses;
            const expectedRemittance = net * 0.40; // Correct: 40% to tech
            const actualRemittance = r.actualAmount || 0;
            const discrepancy = actualRemittance - expectedRemittance;
            const discrepancyPercent = expectedRemittance > 0
                ? ((Math.abs(discrepancy) / expectedRemittance) * 100)
                : 0;

            // Fetch detailed repair data
            const repairDetails = [];
            if (r.paymentIds && r.paymentIds.length > 0) {
                for (const paymentId of r.paymentIds) {
                    // Find repair that contains this payment
                    const repair = window.allRepairs.find(rep => {
                        if (!rep.payments || !Array.isArray(rep.payments)) return false;
                        return rep.payments.some(p => p.id === paymentId);
                    });

                    if (repair) {
                        const payment = repair.payments.find(p => p.id === paymentId);
                        if (payment) {
                            repairDetails.push({
                                repairId: repair.id,
                                customerName: repair.customerName,
                                deviceBrand: repair.deviceBrand || 'N/A',
                                deviceModel: repair.deviceModel || 'N/A',
                                problemDescription: repair.problemDescription || repair.repairType || 'N/A',
                                repairType: repair.repairType || 'N/A',
                                totalPrice: repair.totalPrice || 0,
                                partsCost: repair.partsCost || 0,
                                supplierName: repair.supplierName || 'Shop Inventory',
                                paymentAmount: payment.amount || 0,
                                paymentMethod: payment.method || 'Cash',
                                paymentDate: payment.paidAt || payment.timestamp || repair.recordedAt,
                                recordedAt: repair.recordedAt
                            });
                        }
                    } else {
                        // Payment not found in repairs - add placeholder
                        console.warn(`Payment ${paymentId} not found in repairs for remittance ${r.id}`);
                    }
                }
            }

            // Fetch expense details
            const expenseDetails = [];
            if (r.expenseIds && r.expenseIds.length > 0) {
                for (const expenseId of r.expenseIds) {
                    const expense = (window.techExpenses || []).find(e => e.id === expenseId);
                    if (expense) {
                        expenseDetails.push({
                            category: expense.category,
                            amount: expense.amount,
                            description: expense.description,
                            linkedRepairId: expense.repairId,
                            date: expense.date
                        });
                    }
                }
            }

            return {
                id: r.id,
                date: r.submittedAt || r.date,
                techName: r.techName,
                techId: r.techId,
                status: r.status,
                payments: payments,
                expenses: expenses,
                net: net,
                actualRemittance: actualRemittance,
                expectedRemittance: expectedRemittance,
                discrepancy: discrepancy,
                discrepancyPercent: discrepancyPercent,
                isAccurate: Math.abs(discrepancy) < 1, // Within ₱1
                paymentsCount: r.paymentIds?.length || 0,
                expensesCount: r.expenseIds?.length || 0,
                repairDetails: repairDetails,
                expenseDetails: expenseDetails
            };
        }));

        // Store for export
        window.extractedRemittanceData = processedData;

        console.log('✅ Extracted data:', processedData);
        console.log('📊 Sample repair details:', processedData[0]?.repairDetails);

        // Display results
        displayExtractionResults(processedData, startDate, endDate);

    } catch (error) {
        console.error('Error extracting data:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger" style="background: #f8d7da; border-left: 4px solid #721c24; padding: 15px; border-radius: 6px;">
                <strong>❌ Error:</strong> ${error.message}
            </div>
        `;
    }
}

function displayExtractionResults(data, startDate, endDate) {
    const resultsContainer = document.getElementById('extractionResults');

    // Calculate summary
    const total = data.length;
    const accurate = data.filter(d => d.isAccurate).length;
    const withDiscrepancy = total - accurate;
    const totalDiscrepancy = data.reduce((sum, d) => sum + Math.abs(d.discrepancy), 0);
    const avgDiscrepancy = total > 0 ? (totalDiscrepancy / total) : 0;

    // Show export buttons
    document.getElementById('exportExtractBtn').style.display = 'inline-block';
    document.getElementById('exportExtractCSVBtn').style.display = 'inline-block';

    if (total === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-warning" style="background: #fff3cd; border-left: 4px solid #856404; padding: 15px; border-radius: 6px;">
                <strong>⚠️ No Data Found</strong>
                <p>No remittances found in the selected date range with the applied filters.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = `
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="data-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3 style="font-size: 14px; opacity: 0.9; margin-bottom: 10px; text-transform: uppercase;">Total Remittances</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${total}</div>
                <div style="font-size: 14px; opacity: 0.8;">In selected period</div>
            </div>
            <div class="data-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                <h3 style="font-size: 14px; opacity: 0.9; margin-bottom: 10px; text-transform: uppercase;">Accurate</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${accurate}</div>
                <div style="font-size: 14px; opacity: 0.8;">${total > 0 ? ((accurate / total) * 100).toFixed(1) : 0}% of total</div>
            </div>
            <div class="data-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                <h3 style="font-size: 14px; opacity: 0.9; margin-bottom: 10px; text-transform: uppercase;">With Discrepancies</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${withDiscrepancy}</div>
                <div style="font-size: 14px; opacity: 0.8;">${total > 0 ? ((withDiscrepancy / total) * 100).toFixed(1) : 0}% of total</div>
            </div>
            <div class="data-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
                <h3 style="font-size: 14px; opacity: 0.9; margin-bottom: 10px; text-transform: uppercase;">Avg Discrepancy</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">₱${avgDiscrepancy.toFixed(2)}</div>
                <div style="font-size: 14px; opacity: 0.8;">Per remittance</div>
            </div>
        </div>

        <!-- Filters -->
        <div class="data-card" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                <label style="font-weight: 600;">Show:</label>
                <label><input type="checkbox" id="showAllExtract" checked onchange="applyExtractionFilters()"> All</label>
                <label><input type="checkbox" id="showDiscrepanciesExtract" onchange="applyExtractionFilters()"> Discrepancies Only</label>
                <label><input type="checkbox" id="showCorrectExtract" onchange="applyExtractionFilters()"> Accurate Only</label>
            </div>
        </div>

        <!-- Data Table -->
        <div class="data-card">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Technician</th>
                            <th>Status</th>
                            <th>Payments</th>
                            <th>Expenses</th>
                            <th>Net</th>
                            <th>Actual Remitted</th>
                            <th>Expected (40%)</th>
                            <th>Discrepancy</th>
                            <th>Accuracy</th>
                        </tr>
                    </thead>
                    <tbody id="extractionTableBody">
                        ${data.map(d => {
        const statusClass = d.status === 'verified' ? 'status-completed' :
            d.status === 'pending' ? 'status-pending' : 'status-cancelled';
        const accuracyClass = d.isAccurate ? 'status-completed' : 'status-pending';
        const discrepancyColor = d.discrepancy > 0 ? '#28a745' : '#dc3545';

        return `
                                <tr class="extraction-row" data-accurate="${d.isAccurate}" 
                                    onclick="showRemittanceDetails('${d.id}')" 
                                    style="cursor: pointer;" 
                                    title="Click to view detailed breakdown">
                                    <td>${utils.formatDate(d.date)}</td>
                                    <td>${d.techName}</td>
                                    <td><span class="status-badge ${statusClass}">${d.status}</span></td>
                                    <td>₱${d.payments.toFixed(2)}</td>
                                    <td>₱${d.expenses.toFixed(2)}</td>
                                    <td><strong>₱${d.net.toFixed(2)}</strong></td>
                                    <td>₱${d.actualRemittance.toFixed(2)}</td>
                                    <td>₱${d.expectedRemittance.toFixed(2)}</td>
                                    <td style="color: ${discrepancyColor}; font-weight: bold;">
                                        ${d.discrepancy > 0 ? '+' : ''}₱${d.discrepancy.toFixed(2)}
                                        ${!d.isAccurate ? ` (${d.discrepancyPercent.toFixed(2)}%)` : ''}
                                    </td>
                                    <td><span class="status-badge ${accuracyClass}">
                                        ${d.isAccurate ? '✓ Accurate' : '⚠ Discrepancy'}
                                    </span></td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Detailed Breakdown Section -->
        <div class="data-card" style="margin-top: 30px;">
            <h3 style="margin-bottom: 20px;">📋 Detailed Device Breakdown</h3>
            <p style="color: #666; margin-bottom: 20px;">
                Click any remittance row above to see device-level details including repair pricing, parts costs, and payment breakdown.
            </p>
            <div id="detailedBreakdown" style="padding: 20px; background: #f8f9fa; border-radius: 6px; min-height: 100px;">
                <p style="text-align: center; color: #999; font-style: italic;">
                    Select a remittance to view detailed breakdown
                </p>
            </div>
        </div>
    `;
}

function showRemittanceDetails(remittanceId) {
    const remittance = window.extractedRemittanceData.find(r => r.id === remittanceId);
    if (!remittance) return;

    const detailDiv = document.getElementById('detailedBreakdown');
    if (!detailDiv) return;

    // Calculate old formula (60% tech) for comparison
    const oldExpected = remittance.net * 0.60;
    const wasCorrectUnderOldFormula = Math.abs(remittance.actualRemittance - oldExpected) < 1;

    let html = `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 15px; color: #667eea;">
                🧾 Remittance: ${remittance.techName} - ${utils.formatDate(remittance.date)}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px;">Total Payments</div>
                    <div style="font-size: 24px; font-weight: bold; color: #4caf50;">₱${remittance.payments.toFixed(2)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px;">Total Expenses</div>
                    <div style="font-size: 24px; font-weight: bold; color: #f44336;">₱${remittance.expenses.toFixed(2)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px;">Net Revenue</div>
                    <div style="font-size: 24px; font-weight: bold; color: #2196f3;">₱${remittance.net.toFixed(2)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px;">Actual Remitted</div>
                    <div style="font-size: 24px; font-weight: bold; color: #9c27b0;">₱${remittance.actualRemittance.toFixed(2)}</div>
                </div>
            </div>

            <!-- Formula Comparison -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h5 style="margin: 0 0 10px; color: #856404;">⚠️ Formula Analysis</h5>
                <table style="width: 100%; font-size: 14px;">
                    <tr>
                        <td><strong>Current Formula (Correct):</strong></td>
                        <td>Tech gets 40%, Shop gets 60%</td>
                        <td style="text-align: right;"><strong>Expected: ₱${remittance.expectedRemittance.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Old Formula (Used before fix):</strong></td>
                        <td>Tech got 60%, Shop got 40%</td>
                        <td style="text-align: right;"><strong>Would be: ₱${oldExpected.toFixed(2)}</strong></td>
                    </tr>
                    <tr style="background: ${wasCorrectUnderOldFormula ? '#d4edda' : '#f8d7da'};">
                        <td colspan="2"><strong>${wasCorrectUnderOldFormula ? '✅ This remittance used OLD formula' : '❌ Neither formula matches'}</strong></td>
                        <td style="text-align: right;"><strong>Actual: ₱${remittance.actualRemittance.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
    `;

    // Device Details
    if (remittance.repairDetails && remittance.repairDetails.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px; color: #667eea;">📱 Device Details (${remittance.repairDetails.length} repairs)</h4>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Device</th>
                                <th>Problem/Type</th>
                                <th>Total Price</th>
                                <th>Parts Cost</th>
                                <th>Supplier</th>
                                <th>Payment</th>
                                <th>Method</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${remittance.repairDetails.map(d => `
                                <tr>
                                    <td><strong>${d.customerName}</strong></td>
                                    <td>${d.deviceBrand} ${d.deviceModel}</td>
                                    <td>
                                        ${d.problemDescription || d.repairType || 'N/A'}
                                    </td>
                                    <td><strong>₱${d.totalPrice.toFixed(2)}</strong></td>
                                    <td>${d.partsCost > 0 ? '₱' + d.partsCost.toFixed(2) : '-'}</td>
                                    <td><small>${d.supplierName}</small></td>
                                    <td style="color: #4caf50; font-weight: bold;">₱${d.paymentAmount.toFixed(2)}</td>
                                    <td><span class="badge">${d.paymentMethod}</span></td>
                                    <td><small>${utils.formatDate(d.paymentDate)}</small></td>
                                </tr>
                            `).join('')}
                            <tr style="background: #e8f5e9; font-weight: bold;">
                                <td colspan="6" style="text-align: right;">TOTAL PAYMENTS:</td>
                                <td colspan="3" style="color: #4caf50;">₱${remittance.payments.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <strong>⚠️ No Device Details Available</strong>
                <p style="margin: 5px 0 0;">Device-level data could not be found for this remittance. This may be because:</p>
                <ul style="margin: 10px 0 0; padding-left: 20px;">
                    <li>The repair records have been deleted</li>
                    <li>Payment IDs don't match current repair records</li>
                    <li>This is an older remittance before device tracking was implemented</li>
                </ul>
                <p style="margin: 10px 0 0;"><strong>Payment Count:</strong> ${remittance.paymentsCount} payment(s) | <strong>Total:</strong> ₱${remittance.payments.toFixed(2)}</p>
            </div>
        `;
    }

    // Expense Details
    if (remittance.expenseDetails && remittance.expenseDetails.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4 style="margin: 0 0 15px; color: #667eea;">💸 Expense Details (${remittance.expenseDetails.length} expenses)</h4>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Linked Repair</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${remittance.expenseDetails.map(e => `
                                <tr>
                                    <td><span class="badge">${e.category}</span></td>
                                    <td style="color: #f44336; font-weight: bold;">₱${e.amount.toFixed(2)}</td>
                                    <td>${e.description || '-'}</td>
                                    <td><small>${e.linkedRepairId || 'N/A'}</small></td>
                                    <td><small>${utils.formatDate(e.date)}</small></td>
                                </tr>
                            `).join('')}
                            <tr style="background: #ffebee; font-weight: bold;">
                                <td>TOTAL EXPENSES:</td>
                                <td colspan="4" style="color: #f44336;">₱${remittance.expenses.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    detailDiv.innerHTML = html;
    detailDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Export detailed extraction function
window.showRemittanceDetails = showRemittanceDetails;

function applyExtractionFilters() {
    const showAll = document.getElementById('showAllExtract').checked;
    const showDiscrepancies = document.getElementById('showDiscrepanciesExtract').checked;
    const showCorrect = document.getElementById('showCorrectExtract').checked;

    const rows = document.querySelectorAll('.extraction-row');
    rows.forEach(row => {
        const isAccurate = row.dataset.accurate === 'true';

        let shouldShow = true;
        if (!showAll) {
            if (showDiscrepancies && isAccurate) shouldShow = false;
            if (showCorrect && !isAccurate) shouldShow = false;
        }

        row.style.display = shouldShow ? '' : 'none';
    });
}

function exportExtractionJSON() {
    if (!window.extractedRemittanceData) {
        alert('No data to export');
        return;
    }

    const exportObj = {
        extractedAt: new Date().toISOString(),
        dateRange: {
            start: document.getElementById('extractStartDate').value,
            end: document.getElementById('extractEndDate').value
        },
        formula: {
            correct: 'expectedRemittance = (payments - expenses) × 0.40',
            split: 'Technician: 40%, Shop: 60%'
        },
        summary: {
            total: window.extractedRemittanceData.length,
            accurate: window.extractedRemittanceData.filter(d => d.isAccurate).length,
            withDiscrepancies: window.extractedRemittanceData.filter(d => !d.isAccurate).length
        },
        data: window.extractedRemittanceData
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remittance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportExtractionCSV() {
    if (!window.extractedRemittanceData) {
        alert('No data to export');
        return;
    }

    // Main summary CSV
    const headers = ['Date', 'Technician', 'Status', 'Payments', 'Expenses', 'Net',
        'Actual Remitted', 'Expected (40%)', 'Old Formula (60%)', 'Discrepancy', 'Discrepancy %', 'Accurate'];

    const rows = window.extractedRemittanceData.map(d => {
        const oldExpected = d.net * 0.60;
        return [
            new Date(d.date).toLocaleDateString(),
            d.techName,
            d.status,
            d.payments.toFixed(2),
            d.expenses.toFixed(2),
            d.net.toFixed(2),
            d.actualRemittance.toFixed(2),
            d.expectedRemittance.toFixed(2),
            oldExpected.toFixed(2),
            d.discrepancy.toFixed(2),
            d.discrepancyPercent.toFixed(2),
            d.isAccurate ? 'Yes' : 'No'
        ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Detailed device-level CSV
    const detailHeaders = ['Remittance Date', 'Technician', 'Customer', 'Device', 'Problem/Type',
        'Total Price', 'Parts Cost', 'Supplier', 'Payment Amount', 'Payment Method', 'Payment Date'];

    const detailRows = [];
    window.extractedRemittanceData.forEach(r => {
        if (r.repairDetails && r.repairDetails.length > 0) {
            r.repairDetails.forEach(d => {
                detailRows.push([
                    new Date(r.date).toLocaleDateString(),
                    r.techName,
                    d.customerName,
                    `${d.deviceBrand} ${d.deviceModel}`,
                    d.problemDescription || d.repairType || 'N/A',
                    d.totalPrice.toFixed(2),
                    d.partsCost.toFixed(2),
                    d.supplierName,
                    d.paymentAmount.toFixed(2),
                    d.paymentMethod,
                    new Date(d.paymentDate).toLocaleDateString()
                ]);
            });
        }
    });

    const detailCsv = [detailHeaders, ...detailRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Create combined download
    const combined = `REMITTANCE SUMMARY\n${csv}\n\n\nDETAILED DEVICE BREAKDOWN\n${detailCsv}`;

    const blob = new Blob([combined], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remittance-data-detailed-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Export extraction functions
window.performExtraction = performExtraction;
window.applyExtractionFilters = applyExtractionFilters;
window.exportExtractionJSON = exportExtractionJSON;
window.exportExtractionCSV = exportExtractionCSV;

// ===== COMMISSION ADJUSTMENT SYSTEM =====

/**
 * Set baseline commission rate for a technician (admin only)
 * Used for migration and onboarding new hires with custom compensation
 */
async function setBaselineCommissionRate(techId, rate, compensationType, effectiveDate, reason) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can set baseline rates');
        return;
    }

    if (!techId || rate === undefined || !compensationType || !effectiveDate) {
        alert('⚠️ All fields are required');
        return;
    }

    if (rate < 0 || rate > 1) {
        alert('⚠️ Rate must be between 0 and 1 (e.g., 0.40 for 40%)');
        return;
    }

    try {
        utils.showLoading(true);

        // Check if remittances exist after this date
        const affectedRemittances = window.techRemittances.filter(r =>
            r.techId === techId &&
            new Date(r.submittedAt) >= new Date(effectiveDate)
        );

        if (affectedRemittances.length > 0) {
            const confirmMsg = `⚠️ WARNING: ${affectedRemittances.length} remittances will be affected by this baseline.\n\nRun Auto-Detect after saving to review adjustments.\n\nContinue?`;
            if (!confirm(confirmMsg)) {
                utils.showLoading(false);
                return;
            }
        }

        // Get current rate history
        const techRef = db.ref(`users/${techId}`);
        const snapshot = await techRef.once('value');
        const techData = snapshot.val();
        const rateHistory = techData.commissionRateHistory || [];

        // Add baseline entry
        const baselineEntry = {
            rate: rate,
            compensationType: compensationType,
            changedAt: new Date(effectiveDate).toISOString(),
            changedBy: window.currentUserData.displayName,
            reason: reason || 'baseline_set',
            timestamp: new Date().toISOString()
        };

        rateHistory.unshift(baselineEntry); // Add to beginning

        // Update user record
        await techRef.update({
            commissionRate: rate,
            compensationType: compensationType,
            commissionRateHistory: rateHistory
        });

        utils.showLoading(false);
        alert('✅ Baseline rate set successfully\n\nRun Auto-Detect to calculate adjustments for existing remittances.');

        return true;
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error setting baseline rate:', error);
        alert('Error setting baseline rate: ' + error.message);
        return false;
    }
}

/**
 * Get historical commission rate for a technician at a specific date
 */
function getHistoricalCommissionRate(techId, targetDate) {
    const techUser = window.allUsers[techId];
    if (!techUser) {
        return { rate: 0.40, compensationType: 'commission' }; // Fallback
    }

    const rateHistory = techUser.commissionRateHistory || [];
    if (rateHistory.length === 0) {
        return {
            rate: techUser.commissionRate || 0.40,
            compensationType: techUser.compensationType || 'commission'
        };
    }

    // Sort by changedAt descending
    const sortedHistory = [...rateHistory].sort((a, b) =>
        new Date(b.changedAt) - new Date(a.changedAt)
    );

    // Find first entry where changedAt <= targetDate
    const targetTime = new Date(targetDate).getTime();
    for (const entry of sortedHistory) {
        if (new Date(entry.changedAt).getTime() <= targetTime) {
            return {
                rate: entry.rate,
                compensationType: entry.compensationType
            };
        }
    }

    // No historical rate found, use fallback
    return { rate: 0.40, compensationType: 'commission' };
}

/**
 * Detect remittances needing commission adjustments
 * Returns array of mismatches with line-by-line repair breakdown
 */
function detectRemittancesNeedingAdjustment() {
    if (!window.techRemittances || window.techRemittances.length === 0) {
        alert('No remittances loaded');
        return [];
    }

    const results = [];

    window.techRemittances.forEach(remittance => {
        if (!remittance.commissionBreakdown || remittance.commissionBreakdown.length === 0) {
            return; // Skip remittances without commission breakdown
        }

        const techId = remittance.techId;
        const submittedAt = remittance.submittedAt || remittance.date;

        // Get historical rate at time of remittance submission
        const historicalRate = getHistoricalCommissionRate(techId, submittedAt);

        let originalTotal = 0;
        let recalculatedTotal = 0;
        const repairs = [];

        // Recalculate each repair in the breakdown
        remittance.commissionBreakdown.forEach(item => {
            const repairTotal = item.repairTotal || 0;
            const partsCost = item.partsCost || 0;
            const deliveryExpenses = item.deliveryExpenses || 0;

            // Recalculate net amount
            const recalculatedNet = Math.max(0, repairTotal - partsCost - deliveryExpenses);
            const recalculatedCommission = recalculatedNet * historicalRate.rate;

            const originalCommission = item.commission || 0;
            const difference = recalculatedCommission - originalCommission;

            originalTotal += originalCommission;
            recalculatedTotal += recalculatedCommission;

            repairs.push({
                repairId: item.repairId,
                customerName: item.customerName,
                device: item.deviceInfo || `${item.deviceBrand || ''} ${item.deviceModel || ''}`.trim(),
                repairTotal: repairTotal,
                partsCost: partsCost,
                deliveryExpenses: deliveryExpenses,
                netAmount: recalculatedNet,
                originalCommission: originalCommission,
                recalculatedCommission: recalculatedCommission,
                difference: difference
            });
        });

        const totalDifference = recalculatedTotal - originalTotal;

        // Only include if difference > ₱1
        if (Math.abs(totalDifference) > 1) {
            results.push({
                remittanceId: remittance.id,
                techId: techId,
                techName: remittance.techName,
                submittedAt: submittedAt,
                originalCommission: originalTotal,
                recalculatedCommission: recalculatedTotal,
                difference: totalDifference,
                historicalRate: historicalRate,
                repairs: repairs,
                staged: false,
                approved: false
            });
        }
    });

    console.log('🔍 Detected adjustments needed:', results.length);
    return results;
}

/**
 * Stage adjustments for admin review
 * Saves to global window.stagedAdjustments and sessionStorage
 */
function stageAdjustments(adjustments) {
    window.stagedAdjustments = adjustments.map(adj => ({
        ...adj,
        staged: true,
        approved: false,
        editable: true
    }));

    // Persist in sessionStorage for page refresh recovery
    try {
        sessionStorage.setItem('stagedAdjustments', JSON.stringify(window.stagedAdjustments));
    } catch (e) {
        console.warn('Could not save staged adjustments to sessionStorage:', e);
    }

    console.log('📋 Staged adjustments:', window.stagedAdjustments.length);
    return window.stagedAdjustments;
}

/**
 * Apply approved adjustments to technician accounts
 * Accumulates adjustments in pendingCommissionAdjustment field
 */
async function applyApprovedAdjustments(approvedAdjustments) {
    if (!approvedAdjustments || approvedAdjustments.length === 0) {
        alert('No adjustments to apply');
        return;
    }

    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can apply adjustments');
        return;
    }

    const confirmMsg = `Apply ${approvedAdjustments.length} commission adjustments?\n\nThis will add pending amounts to technician accounts.`;
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        utils.showLoading(true);

        const results = [];

        // Group by technician
        const byTech = {};
        approvedAdjustments.forEach(adj => {
            if (!byTech[adj.techId]) {
                byTech[adj.techId] = [];
            }
            byTech[adj.techId].push(adj);
        });

        // Apply adjustments per technician
        for (const techId of Object.keys(byTech)) {
            const techAdjustments = byTech[techId];
            const totalAmount = techAdjustments.reduce((sum, adj) => sum + adj.difference, 0);

            // Accumulate adjustment
            await accumulateCommissionAdjustment(
                techId,
                techAdjustments.map(adj => ({
                    remittanceId: adj.remittanceId,
                    amount: adj.difference,
                    reason: `Commission recalculation: ${adj.repairs.length} repairs`,
                    affectedRepairs: adj.repairs.map(r => r.repairId)
                }))
            );

            // Send notification
            await notifyTechAdjustment(
                techId,
                totalAmount,
                `Commission adjustment for ${techAdjustments.length} remittances`,
                techAdjustments.map(adj => adj.remittanceId).join(', ')
            );

            results.push({
                techId: techId,
                techName: techAdjustments[0].techName,
                amount: totalAmount
            });
        }

        // Clear staged adjustments
        window.stagedAdjustments = [];
        sessionStorage.removeItem('stagedAdjustments');

        utils.showLoading(false);

        const summary = results.map(r =>
            `${r.techName}: ${r.amount >= 0 ? '+' : ''}₱${r.amount.toFixed(2)}`
        ).join('\n');

        alert(`✅ Adjustments applied successfully:\n\n${summary}\n\nTechnicians have been notified.`);

        return results;
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error applying adjustments:', error);
        alert('Error applying adjustments: ' + error.message);
        return null;
    }
}

/**
 * Accumulate commission adjustment for a technician
 * Uses Firebase transaction for atomic updates
 */
async function accumulateCommissionAdjustment(techId, adjustmentsArray) {
    return new Promise((resolve, reject) => {
        const techRef = db.ref(`users/${techId}/pendingCommissionAdjustment`);

        techRef.transaction(current => {
            // Initialize if doesn't exist
            if (!current) {
                current = {
                    totalAmount: 0,
                    adjustments: []
                };
            }

            // Add new adjustments
            adjustmentsArray.forEach(adj => {
                current.adjustments.push({
                    remittanceId: adj.remittanceId,
                    amount: adj.amount,
                    reason: adj.reason,
                    addedAt: new Date().toISOString(),
                    addedBy: window.currentUserData.displayName,
                    affectedRepairs: adj.affectedRepairs || []
                });
            });

            // Recalculate total
            current.totalAmount = current.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
            current.lastUpdated = new Date().toISOString();

            return current;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error('Transaction failed:', error);
                reject(error);
            } else if (!committed) {
                reject(new Error('Transaction not committed'));
            } else {
                console.log('✅ Adjustment accumulated for tech:', techId);
                resolve(snapshot.val());
            }
        });
    });
}

/**
 * Send notification to technician about commission adjustment
 */
async function notifyTechAdjustment(techId, amount, reason, remittanceId) {
    try {
        const notificationsRef = db.ref(`users/${techId}/notifications`);
        await notificationsRef.push({
            id: Date.now(),
            type: 'commission_adjustment',
            amount: amount,
            reason: reason,
            remittanceId: remittanceId,
            addedBy: window.currentUserData.displayName,
            timestamp: new Date().toISOString(),
            read: false,
            dismissed: false,
            appliedToRemittance: null
        });

        console.log('📬 Notification sent to tech:', techId);
        return true;
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        return false;
    }
}

/**
 * Clear pending commission adjustments (admin override)
 */
async function clearPendingAdjustment(techId, reason) {
    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can clear adjustments');
        return;
    }

    if (!reason || reason.trim().length < 5) {
        alert('⚠️ Please provide a reason (minimum 5 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        // Fetch current pending adjustment
        const techRef = db.ref(`users/${techId}`);
        const snapshot = await techRef.once('value');
        const techData = snapshot.val();
        const pendingAdjustment = techData.pendingCommissionAdjustment;

        if (!pendingAdjustment) {
            alert('No pending adjustments to clear');
            utils.showLoading(false);
            return;
        }

        // Save to adjustment log
        await db.ref('commissionAdjustmentLog').push({
            action: 'cleared',
            techId: techId,
            techName: techData.displayName,
            clearedAmount: pendingAdjustment.totalAmount,
            clearedBy: window.currentUserData.displayName,
            clearedAt: new Date().toISOString(),
            reason: reason,
            clearedAdjustments: pendingAdjustment.adjustments
        });

        // Clear pending adjustment
        await techRef.update({
            pendingCommissionAdjustment: null
        });

        // Notify technician
        await notifyTechAdjustment(
            techId,
            0,
            `Adjustment cleared by admin: ${reason}`,
            'adjustment_cleared'
        );

        utils.showLoading(false);
        alert(`✅ Pending adjustment cleared: ₱${pendingAdjustment.totalAmount.toFixed(2)}\n\nTechnician has been notified.`);

        return true;
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error clearing adjustment:', error);
        alert('Error clearing adjustment: ' + error.message);
        return false;
    }
}

/**
 * Export commission adjustment logs for a specific month
 */
async function exportAdjustmentLogs(year, month) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const logsRef = db.ref('commissionAdjustmentLog');
        const snapshot = await logsRef
            .orderByChild('timestamp')
            .startAt(startDate.toISOString())
            .endAt(endDate.toISOString())
            .once('value');

        const logs = [];
        snapshot.forEach(child => {
            logs.push({
                id: child.key,
                ...child.val()
            });
        });

        if (logs.length === 0) {
            return { exported: 0, filename: null };
        }

        // Generate CSV
        const headers = ['Date', 'Action', 'Tech Name', 'Tech ID', 'Amount', 'Reason', 'Details', 'By', 'Timestamp'];
        const rows = logs.map(log => [
            new Date(log.timestamp || log.clearedAt).toLocaleDateString(),
            log.action,
            log.techName,
            log.techId,
            (log.clearedAmount || 0).toFixed(2),
            log.reason || '',
            JSON.stringify(log.clearedAdjustments || []),
            log.clearedBy || log.addedBy || '',
            log.timestamp || log.clearedAt
        ]);

        const csv = [headers, ...rows].map(row =>
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        // Download
        const monthStr = String(month).padStart(2, '0');
        const filename = `commission_adjustments_${year}-${monthStr}.csv`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`✅ Exported ${logs.length} adjustment logs:`, filename);
        return { exported: logs.length, filename: filename };
    } catch (error) {
        console.error('❌ Error exporting logs:', error);
        return { exported: 0, filename: null, error: error.message };
    }
}

/**
 * Get Storage files that need cleanup (older than 24 months)
 */
async function getStorageFilesForCleanup() {
    try {
        const storageRef = firebase.storage().ref('exports/adjustmentLogs');
        const result = await storageRef.listAll();

        const now = new Date();
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 24, 1); // 24 months ago

        const filesToCleanup = [];

        for (const item of result.items) {
            const filename = item.name;
            // Parse date from filename: commission_adjustments_YYYY-MM.csv
            const match = filename.match(/commission_adjustments_(\d{4})-(\d{2})\.csv/);

            if (match) {
                const fileYear = parseInt(match[1]);
                const fileMonth = parseInt(match[2]);
                const fileDate = new Date(fileYear, fileMonth - 1, 1);

                if (fileDate < cutoffDate) {
                    const ageMonths = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24 * 30));
                    const metadata = await item.getMetadata();

                    filesToCleanup.push({
                        filename: filename,
                        path: item.fullPath,
                        date: fileDate,
                        ageMonths: ageMonths,
                        sizeKB: Math.round(metadata.size / 1024)
                    });
                }
            }
        }

        console.log(`🗑️ Found ${filesToCleanup.length} files for cleanup`);
        return filesToCleanup;
    } catch (error) {
        console.error('❌ Error getting files for cleanup:', error);
        return [];
    }
}

/**
 * Cleanup old adjustment logs with mandatory download
 */
async function cleanupOldAdjustmentLogs(downloadComplete) {
    if (!downloadComplete) {
        alert('⚠️ Please download all files locally before cleanup');
        return false;
    }

    if (window.currentUserData.role !== 'admin') {
        alert('⚠️ Only administrators can cleanup logs');
        return false;
    }

    const confirmMsg = 'Delete old adjustment logs from Firebase?\n\nEnsure you have downloaded all files locally.';
    if (!confirm(confirmMsg)) {
        return false;
    }

    try {
        utils.showLoading(true);

        const filesToCleanup = await getStorageFilesForCleanup();

        if (filesToCleanup.length === 0) {
            utils.showLoading(false);
            alert('No files to cleanup');
            return true;
        }

        let deletedFiles = 0;
        let deletedRecords = 0;

        // Delete files from Storage
        for (const file of filesToCleanup) {
            try {
                const fileRef = firebase.storage().ref(file.path);
                await fileRef.delete();
                deletedFiles++;
                console.log('🗑️ Deleted file:', file.filename);
            } catch (error) {
                console.error('Error deleting file:', file.filename, error);
            }
        }

        // Delete corresponding DB records (older than 24 months)
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 24);

        const logsRef = db.ref('commissionAdjustmentLog');
        const snapshot = await logsRef
            .orderByChild('timestamp')
            .endAt(cutoffDate.toISOString())
            .once('value');

        const deletePromises = [];
        snapshot.forEach(child => {
            deletePromises.push(child.ref.remove());
            deletedRecords++;
        });

        await Promise.all(deletePromises);

        // Log cleanup action
        await db.ref('commissionAdjustmentLog').push({
            action: 'cleanup',
            deletedFiles: filesToCleanup.map(f => f.filename),
            deletedFileCount: deletedFiles,
            deletedRecordCount: deletedRecords,
            deletedBy: window.currentUserData.displayName,
            deletedAt: new Date().toISOString()
        });

        utils.showLoading(false);
        alert(`✅ Cleanup complete:\n\n${deletedFiles} files deleted\n${deletedRecords} DB records removed`);

        return true;
    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error during cleanup:', error);
        alert('Error during cleanup: ' + error.message);
        return false;
    }
}

// ========================================
// PARTS ORDERING SYSTEM
// ========================================

/**
 * Open Parts Order Modal
 */
function openPartsOrderModal(repairId, suggestedPartName = '') {
    const repair = window.allRepairs.find(r => r.id === repairId);

    if (!repair) {
        alert('Repair not found');
        return;
    }

    const content = document.getElementById('partsOrderModalContent');

    // Get existing orders for this repair
    const existingOrders = (window.allPartsOrders || []).filter(o =>
        o.repairId === repairId && !['cancelled', 'received'].includes(o.status)
    );

    content.innerHTML = `
        <div class="alert-info" style="margin-bottom:15px;">
            <p style="margin:0;"><strong>Repair:</strong> ${repair.customerName} - ${repair.brand} ${repair.model}</p>
            <p style="margin:5px 0 0 0;"><strong>Problem:</strong> ${repair.problem || 'N/A'}</p>
            ${existingOrders.length > 0 ? `
                <p style="margin:10px 0 0 0;color:#f59e0b;"><strong>⚠️ ${existingOrders.length} order(s) already pending for this repair</strong></p>
            ` : ''}
        </div>
        
        <form onsubmit="submitPartsOrder(event, '${repairId}')" id="partsOrderForm">
            <div class="form-group">
                <label>Part Needed *</label>
                <input type="text" id="orderPartName" class="input" value="${suggestedPartName}" required placeholder="e.g., LCD Screen, Battery, Charging Port">
            </div>
            
            <div class="form-group">
                <label>Preferred Supplier</label>
                <select id="orderSupplier" class="input">
                    <option value="">Any available supplier</option>
                    ${(window.allSuppliers || [])
            .filter(s => s.active !== false && !s.deleted)
            .map(s => `<option value="${s.id}">${s.name || s.supplierName || 'Unnamed Supplier'}</option>`)
            .join('')}
                </select>
                <small style="color:#666;">Leave blank if admin should choose</small>
            </div>
            
            <div class="form-group">
                <label>Quantity Needed</label>
                <input type="number" id="orderQuantity" class="input" value="1" min="1" required>
            </div>
            
            <div class="form-group">
                <label>Urgency Level *</label>
                <select id="orderUrgency" class="input" required>
                    <option value="urgent">🔴 Urgent (Customer waiting)</option>
                    <option value="normal" selected>🟡 Normal (Can wait 1-2 days)</option>
                    <option value="low">🟢 Low (When available)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Additional Notes</label>
                <textarea id="orderNotes" class="input" rows="2" placeholder="Specifications, brand preference, estimated price, etc."></textarea>
            </div>

            <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:15px 0;">
                <p style="margin:0 0 10px 0;font-weight:600;">💵 Collect Downpayment?</p>
                <button type="button" class="btn-secondary" onclick="openPartsDownpayment('${repairId}')" style="width:100%;">
                    Collect Downpayment
                </button>
                <small style="display:block;margin-top:5px;color:#666;">
                    Opens payment modal to record customer downpayment for parts
                </small>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" class="btn-primary" style="flex:1;">📦 Submit Order Request</button>
                <button type="button" class="btn-secondary" onclick="closePartsOrderModal()">Cancel</button>
            </div>
        </form>
    `;

    document.getElementById('partsOrderModal').style.display = 'block';
}

function closePartsOrderModal() {
    document.getElementById('partsOrderModal').style.display = 'none';
}

/**
 * Open payment modal for parts downpayment
 */
function openPartsDownpayment(repairId) {
    // Store that we're collecting parts downpayment
    window.partsDownpaymentRepairId = repairId;

    // Open payment modal with special flag
    openPaymentModal(repairId, 'parts-downpayment');
}

/**
 * Submit Parts Order Request
 */
async function submitPartsOrder(e, repairId) {
    e.preventDefault();

    const partName = document.getElementById('orderPartName').value.trim();
    const supplierId = document.getElementById('orderSupplier').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const urgency = document.getElementById('orderUrgency').value;
    const notes = document.getElementById('orderNotes').value.trim();

    if (!partName) {
        alert('Please enter the part name');
        return;
    }

    const repair = window.allRepairs.find(r => r.id === repairId);
    if (!repair) {
        alert('Repair not found');
        return;
    }

    // Get supplier name if selected
    let supplierName = null;
    if (supplierId) {
        const supplier = window.allSuppliers.find(s => s.id === supplierId);
        supplierName = supplier ? (supplier.name || supplier.supplierName) : null;
    }

    const orderData = {
        // Order identification
        orderNumber: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,

        // What's being ordered
        partName: partName,
        quantity: quantity,
        urgency: urgency,
        notes: notes,

        // Supplier info
        supplierId: supplierId || null,
        supplierName: supplierName,

        // Related repair
        repairId: repairId,
        repairDetails: {
            customerName: repair.customerName,
            device: `${repair.brand} ${repair.model}`,
            problem: repair.problem || 'N/A'
        },

        // Requester info
        requestedBy: window.currentUser.uid,
        requestedByName: window.currentUserData.displayName,
        requestedAt: new Date().toISOString(),

        // Status tracking
        status: 'pending', // pending → approved → ordered → received → cancelled

        // Pricing (filled during workflow)
        estimatedPrice: null,
        actualPrice: null,
        priceVariance: null,

        // Workflow tracking
        approvedBy: null,
        approvedByName: null,
        approvedAt: null,
        approvalNotes: null,

        orderedBy: null,
        orderedByName: null,
        orderedAt: null,
        supplierOrderNumber: null,
        estimatedArrival: null,

        receivedBy: null,
        receivedByName: null,
        receivedAt: null,
        receivingNotes: null,

        cancelledBy: null,
        cancelledByName: null,
        cancelledAt: null,
        cancellationReason: null,

        // Downpayment tracking
        paymentId: null, // Links to payment in repairs array
        downpaymentAmount: null,

        // Technician notification
        acknowledgedByTech: false,

        // Workaround flag
        workaroundActive: false,

        deleted: false,
        lastUpdated: new Date().toISOString()
    };

    try {
        utils.showLoading(true);

        // Create order
        const orderRef = await db.ref('partsOrders').push(orderData);
        console.log('✅ Parts order created:', orderRef.key);

        // Update repair status to "Waiting for Parts"
        await db.ref(`repairs/${repairId}`).update({
            status: 'Waiting for Parts',
            waitingForParts: true,
            waitingForPartsSince: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });

        utils.showLoading(false);
        closePartsOrderModal();

        alert(`✅ Parts order request submitted!\n\nOrder #${orderData.orderNumber}\nPart: ${partName}\n\nAdmin will review and place the order.`);

        // Auto-refresh
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error submitting parts order:', error);
        alert('Error submitting order: ' + error.message);
    }
}

/**
 * Enable Workaround - Allow tech to work on other issues while waiting for parts
 */
async function enableWorkaround(repairId) {
    const repair = window.allRepairs.find(r => r.id === repairId);

    if (!repair) {
        alert('Repair not found');
        return;
    }

    if (repair.status !== 'Waiting for Parts') {
        alert('This repair is not waiting for parts');
        return;
    }

    const confirmed = confirm(
        '🔧 Work on Other Issues\n\n' +
        'This will change the repair status to "In Progress (Parts Pending)".\n\n' +
        'You can start working on other aspects of this repair while waiting for the parts to arrive.\n\n' +
        'Continue?'
    );

    if (!confirmed) return;

    try {
        utils.showLoading(true);

        // Update all pending orders for this repair
        const pendingOrders = (window.allPartsOrders || []).filter(o =>
            o.repairId === repairId &&
            ['pending', 'approved', 'ordered'].includes(o.status)
        );

        const updates = {};
        pendingOrders.forEach(order => {
            updates[`partsOrders/${order.id}/workaroundActive`] = true;
        });

        // Update repair status
        updates[`repairs/${repairId}/status`] = 'In Progress (Parts Pending)';
        updates[`repairs/${repairId}/workaroundActive`] = true;
        updates[`repairs/${repairId}/lastUpdated`] = new Date().toISOString();
        updates[`repairs/${repairId}/lastUpdatedBy`] = window.currentUserData.displayName;

        await db.ref().update(updates);

        utils.showLoading(false);
        alert('✅ Status updated!\n\nYou can now work on other issues while parts are pending.');

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error enabling workaround:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Approve Parts Order
 */
async function approvePartsOrder(orderId) {
    const order = (window.allPartsOrders || []).find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    if (order.status !== 'pending') {
        alert('This order is not pending approval');
        return;
    }

    const estimatedPrice = prompt(
        `📦 Approve Parts Order\n\n` +
        `Part: ${order.partName}\n` +
        `Quantity: ${order.quantity}\n` +
        `Urgency: ${order.urgency.toUpperCase()}\n\n` +
        `Enter estimated price per unit (₱):`
    );

    if (estimatedPrice === null) return; // Cancelled

    const price = parseFloat(estimatedPrice);
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price');
        return;
    }

    const approvalNotes = prompt('Admin notes (optional):') || '';

    try {
        utils.showLoading(true);

        await db.ref(`partsOrders/${orderId}`).update({
            status: 'approved',
            estimatedPrice: price,
            totalEstimatedPrice: price * order.quantity,
            approvedBy: window.currentUser.uid,
            approvedByName: window.currentUserData.displayName,
            approvedAt: new Date().toISOString(),
            approvalNotes: approvalNotes,
            lastUpdated: new Date().toISOString()
        });

        utils.showLoading(false);
        alert(`✅ Order approved!\n\nEstimated total: ₱${(price * order.quantity).toFixed(2)}\n\nYou can now contact the supplier and mark it as ordered.`);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error approving order:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Reject Parts Order
 */
async function rejectPartsOrder(orderId) {
    const order = (window.allPartsOrders || []).find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    if (order.status !== 'pending') {
        alert('This order is not pending approval');
        return;
    }

    const reason = prompt(
        `❌ Reject Parts Order\n\n` +
        `Part: ${order.partName}\n` +
        `Requested by: ${order.requestedByName}\n\n` +
        `Enter rejection reason (min 10 chars):`
    );

    if (reason === null) return;

    if (!reason || reason.trim().length < 10) {
        alert('Please enter a rejection reason (minimum 10 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        await db.ref(`partsOrders/${orderId}`).update({
            status: 'cancelled',
            cancelledBy: window.currentUser.uid,
            cancelledByName: window.currentUserData.displayName,
            cancelledAt: new Date().toISOString(),
            cancellationReason: `Rejected by admin: ${reason.trim()}`,
            lastUpdated: new Date().toISOString()
        });

        // Check if repair should go back to previous status
        const activeOrders = (window.allPartsOrders || []).filter(o =>
            o.repairId === order.repairId &&
            o.id !== orderId &&
            ['pending', 'approved', 'ordered'].includes(o.status)
        );

        if (activeOrders.length === 0) {
            // No more active orders, change status back
            const repair = window.allRepairs.find(r => r.id === order.repairId);
            const newStatus = repair?.workaroundActive ? 'In Progress' : 'In Progress';

            await db.ref(`repairs/${order.repairId}`).update({
                status: newStatus,
                waitingForParts: false,
                workaroundActive: false,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            });
        }

        utils.showLoading(false);
        alert('✅ Order rejected');

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error rejecting order:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Mark Parts as Ordered
 */
async function markAsOrdered(orderId) {
    const order = (window.allPartsOrders || []).find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    if (order.status !== 'approved') {
        alert('This order has not been approved yet');
        return;
    }

    const supplierOrderNumber = prompt(
        `📞 Mark as Ordered\n\n` +
        `Part: ${order.partName} (x${order.quantity})\n` +
        `Estimated: ₱${order.estimatedPrice || 0}/unit\n\n` +
        `Enter supplier's order/reference number:`
    );

    if (supplierOrderNumber === null) return;

    const etaInput = prompt(
        `When do you expect it to arrive?\n\n` +
        `Enter date (YYYY-MM-DD) or leave blank:`
    );

    let estimatedArrival = null;
    if (etaInput && etaInput.trim()) {
        estimatedArrival = new Date(etaInput.trim()).toISOString();
    }

    try {
        utils.showLoading(true);

        await db.ref(`partsOrders/${orderId}`).update({
            status: 'ordered',
            supplierOrderNumber: supplierOrderNumber.trim() || 'N/A',
            estimatedArrival: estimatedArrival,
            orderedBy: window.currentUser.uid,
            orderedByName: window.currentUserData.displayName,
            orderedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        });

        utils.showLoading(false);
        alert(`✅ Marked as ordered!\n\nSupplier ref: ${supplierOrderNumber}\n\nNotify technician when parts arrive.`);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error marking as ordered:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Mark Parts as Received
 */
async function markPartsReceived(orderId) {
    const order = (window.allPartsOrders || []).find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    if (order.status !== 'ordered') {
        alert('This order has not been marked as ordered yet');
        return;
    }

    const actualPriceInput = prompt(
        `📦 Parts Received\n\n` +
        `Part: ${order.partName} (x${order.quantity})\n` +
        `Estimated: ₱${order.estimatedPrice || 0}/unit\n\n` +
        `Enter actual price paid per unit (₱):`
    );

    if (actualPriceInput === null) return;

    const actualPrice = parseFloat(actualPriceInput);
    if (isNaN(actualPrice) || actualPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }

    const priceVariance = actualPrice - (order.estimatedPrice || 0);
    const variancePercent = order.estimatedPrice ? ((priceVariance / order.estimatedPrice) * 100).toFixed(1) : 0;

    // Show variance warning
    let varianceMessage = '';
    if (Math.abs(variancePercent) > 10) {
        varianceMessage = `\n\n⚠️ Price variance: ${variancePercent > 0 ? '+' : ''}${variancePercent}%`;
    }

    const receivingNotes = prompt(
        `Receiving notes (optional):${varianceMessage}\n\nCondition, quality, etc.:`
    ) || '';

    try {
        utils.showLoading(true);

        // Update order
        await db.ref(`partsOrders/${orderId}`).update({
            status: 'received',
            actualPrice: actualPrice,
            totalActualPrice: actualPrice * order.quantity,
            priceVariance: priceVariance,
            priceVariancePercent: parseFloat(variancePercent),
            receivedBy: window.currentUser.uid,
            receivedByName: window.currentUserData.displayName,
            receivedAt: new Date().toISOString(),
            receivingNotes: receivingNotes,
            acknowledgedByTech: false, // Trigger notification
            lastUpdated: new Date().toISOString()
        });

        // Auto-create inventory item
        const inventoryData = {
            partName: order.partName,
            supplier: order.supplierName || 'Unknown',
            supplierId: order.supplierId || null,
            quantity: order.quantity,
            unitCost: actualPrice,
            category: 'Parts', // Default category
            notes: `Auto-added from parts order ${order.orderNumber}`,
            linkedOrderId: orderId,
            linkedRepairId: order.repairId,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName,
            lastUpdated: new Date().toISOString(),
            deleted: false
        };

        const inventoryRef = await db.ref('inventory').push(inventoryData);
        console.log('✅ Inventory item created:', inventoryRef.key);

        // Log stock movement
        await db.ref('stockMovements').push({
            itemId: inventoryRef.key,
            partName: order.partName,
            adjustment: order.quantity,
            previousQuantity: 0,
            newQuantity: order.quantity,
            reason: `Received from supplier (Order ${order.orderNumber})`,
            performedBy: window.currentUserData.displayName,
            timestamp: new Date().toISOString()
        });

        // Check if all orders for this repair are completed
        const allRepairOrders = (window.allPartsOrders || []).filter(o =>
            o.repairId === order.repairId && o.id !== orderId
        );

        const stillPending = allRepairOrders.some(o =>
            ['pending', 'approved', 'ordered'].includes(o.status)
        );

        // Update repair status if no more pending orders
        if (!stillPending) {
            const repair = window.allRepairs.find(r => r.id === order.repairId);
            const newStatus = 'In Progress';

            await db.ref(`repairs/${order.repairId}`).update({
                status: newStatus,
                waitingForParts: false,
                workaroundActive: false,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            });
        }

        utils.showLoading(false);
        alert(
            `✅ Parts received and added to inventory!\n\n` +
            `Actual cost: ₱${actualPrice}/unit (Total: ₱${(actualPrice * order.quantity).toFixed(2)})\n` +
            `Variance: ${variancePercent > 0 ? '+' : ''}${variancePercent}%\n\n` +
            `Technician will be notified.`
        );

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error marking parts received:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Cancel Parts Order
 */
async function cancelPartsOrder(orderId) {
    const order = (window.allPartsOrders || []).find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    if (!['pending', 'approved', 'ordered'].includes(order.status)) {
        alert('This order cannot be cancelled');
        return;
    }

    const reason = prompt(
        `🚫 Cancel Parts Order\n\n` +
        `Part: ${order.partName}\n` +
        `Status: ${order.status.toUpperCase()}\n\n` +
        `Enter cancellation reason (min 20 chars):`
    );

    if (reason === null) return;

    if (!reason || reason.trim().length < 20) {
        alert('Please enter a detailed cancellation reason (minimum 20 characters)');
        return;
    }

    try {
        utils.showLoading(true);

        // Update order
        await db.ref(`partsOrders/${orderId}`).update({
            status: 'cancelled',
            cancelledBy: window.currentUser.uid,
            cancelledByName: window.currentUserData.displayName,
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason.trim(),
            lastUpdated: new Date().toISOString()
        });

        // Refund downpayment if exists
        if (order.paymentId) {
            const repair = window.allRepairs.find(r => r.id === order.repairId);
            if (repair && repair.payments) {
                const payment = repair.payments.find(p => p.id === order.paymentId);

                if (payment && payment.amount > 0) {
                    // Create refund payment (negative)
                    const refundPayment = {
                        id: `refund_${Date.now()}`,
                        amount: -payment.amount,
                        method: payment.method,
                        date: new Date().toISOString(),
                        receivedBy: window.currentUser.uid,
                        receivedByName: window.currentUserData.displayName,
                        paymentType: 'parts-downpayment-refund',
                        linkedOrderId: orderId,
                        originalPaymentId: order.paymentId,
                        notes: `Refund: Parts order cancelled - ${reason.trim()}`,
                        remittanceStatus: 'verified' // Auto-verified for refunds
                    };

                    const payments = repair.payments || [];
                    payments.push(refundPayment);

                    await db.ref(`repairs/${order.repairId}/payments`).set(payments);

                    console.log('✅ Downpayment refunded:', payment.amount);
                }
            }
        }

        // Check if repair should go back to previous status
        const activeOrders = (window.allPartsOrders || []).filter(o =>
            o.repairId === order.repairId &&
            o.id !== orderId &&
            ['pending', 'approved', 'ordered'].includes(o.status)
        );

        if (activeOrders.length === 0) {
            // No more active orders
            const repair = window.allRepairs.find(r => r.id === order.repairId);
            const newStatus = 'In Progress';

            await db.ref(`repairs/${order.repairId}`).update({
                status: newStatus,
                waitingForParts: false,
                workaroundActive: false,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: window.currentUserData.displayName
            });
        }

        utils.showLoading(false);

        let message = '✅ Order cancelled';
        if (order.paymentId) {
            message += '\n\n💵 Downpayment has been refunded to customer balance';
        }

        alert(message);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error cancelling order:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Acknowledge Parts Received (Technician)
 */
async function acknowledgePartsReceived(orderId) {
    try {
        await db.ref(`partsOrders/${orderId}`).update({
            acknowledgedByTech: true,
            acknowledgedAt: new Date().toISOString()
        });

        console.log('✅ Parts receipt acknowledged:', orderId);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        console.error('❌ Error acknowledging receipt:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Acknowledge all received parts for technician
 */
async function acknowledgeAllPartsReceived() {
    const unacknowledged = (window.allPartsOrders || []).filter(o =>
        o.requestedBy === window.currentUser.uid &&
        o.status === 'received' &&
        o.acknowledgedByTech === false
    );

    if (unacknowledged.length === 0) {
        alert('No parts to acknowledge');
        return;
    }

    try {
        utils.showLoading(true);

        const updates = {};
        unacknowledged.forEach(order => {
            updates[`partsOrders/${order.id}/acknowledgedByTech`] = true;
            updates[`partsOrders/${order.id}/acknowledgedAt`] = new Date().toISOString();
        });

        await db.ref().update(updates);

        utils.showLoading(false);
        alert(`✅ Acknowledged ${unacknowledged.length} parts delivery(ies)`);

        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }

    } catch (error) {
        utils.showLoading(false);
        console.error('❌ Error acknowledging all:', error);
        alert('Error: ' + error.message);
    }
}

// Export parts ordering functions
window.openPartsOrderModal = openPartsOrderModal;
window.closePartsOrderModal = closePartsOrderModal;
window.openPartsDownpayment = openPartsDownpayment;
window.submitPartsOrder = submitPartsOrder;
window.enableWorkaround = enableWorkaround;
window.approvePartsOrder = approvePartsOrder;
window.rejectPartsOrder = rejectPartsOrder;
window.markAsOrdered = markAsOrdered;
window.markPartsReceived = markPartsReceived;
window.cancelPartsOrder = cancelPartsOrder;
window.acknowledgePartsReceived = acknowledgePartsReceived;
window.acknowledgeAllPartsReceived = acknowledgeAllPartsReceived;

// Export commission adjustment functions
window.setBaselineCommissionRate = setBaselineCommissionRate;
window.getHistoricalCommissionRate = getHistoricalCommissionRate;
window.detectRemittancesNeedingAdjustment = detectRemittancesNeedingAdjustment;
window.stageAdjustments = stageAdjustments;
window.applyApprovedAdjustments = applyApprovedAdjustments;
window.accumulateCommissionAdjustment = accumulateCommissionAdjustment;
window.notifyTechAdjustment = notifyTechAdjustment;
window.clearPendingAdjustment = clearPendingAdjustment;
window.exportAdjustmentLogs = exportAdjustmentLogs;
window.getStorageFilesForCleanup = getStorageFilesForCleanup;
window.cleanupOldAdjustmentLogs = cleanupOldAdjustmentLogs;
