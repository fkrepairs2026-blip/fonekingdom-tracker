// ===== DAILY ROUTINE MODULE =====

/**
 * Daily Routine Checklist System
 * - Tracks daily/weekly/monthly task completion
 * - Badge/streak system with silent grace days
 * - Holiday seasonal cash rewards
 * - Admin compliance dashboard
 */

// Global state
window.currentUserBadges = null;
window.allDailyRoutineStates = {};
window.shopTaskTemplates = [];
let routineReminderInterval = null;

// ===== FIREBASE OPERATIONS =====

/**
 * Initialize daily routine listeners
 */
function initializeDailyRoutineListeners() {
    const db = firebase.database();
    
    // Listen to shop task templates
    db.ref('shopTaskTemplates').on('value', (snapshot) => {
        const templates = snapshot.val() || {};
        window.shopTaskTemplates = Object.keys(templates).map(key => ({
            id: key,
            ...templates[key]
        })).filter(t => t.isActive);
        
        if (window.currentTabRefresh) {
            setTimeout(() => window.currentTabRefresh(), 400);
        }
    });
    
    // Listen to current user's badges (if technician/cashier)
    if (window.currentUser && ['technician', 'cashier'].includes(window.currentUserData?.role)) {
        db.ref(`routineBadges/${window.currentUser.uid}`).on('value', (snapshot) => {
            window.currentUserBadges = snapshot.val() || {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysCompleted: 0,
                graceUsedThisWeek: { weekStartDate: null, graceDaysUsed: 0 },
                badges: [],
                totalBadgesEarned: 0
            };
        });
    }
}

/**
 * Load daily routine state for a specific date
 */
async function loadDailyRoutineState(userId, dateString) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`dailyRoutineState/${userId}/${dateString}`).once('value');
        return snapshot.val() || { tasks: {}, completionPercentage: 0, lastUpdated: null };
    } catch (error) {
        console.error('Error loading daily routine state:', error);
        return { tasks: {}, completionPercentage: 0, lastUpdated: null };
    }
}

/**
 * Save task completion state
 */
async function saveDailyTaskCompletion(userId, dateString, taskId, completed) {
    try {
        const db = firebase.database();
        const taskData = {
            completed: completed,
            completedAt: completed ? new Date().toISOString() : null
        };
        
        await db.ref(`dailyRoutineState/${userId}/${dateString}/tasks/${taskId}`).set(taskData);
        await db.ref(`dailyRoutineState/${userId}/${dateString}/lastUpdated`).set(new Date().toISOString());
        
        return true;
    } catch (error) {
        console.error('Error saving task completion:', error);
        return false;
    }
}

/**
 * Load user's custom personal tasks
 */
async function loadPersonalTasks(userId) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`userCustomTasks/${userId}`).once('value');
        const tasks = snapshot.val() || {};
        
        return Object.keys(tasks)
            .map(key => ({ id: key, ...tasks[key] }))
            .filter(t => t.isActive);
    } catch (error) {
        console.error('Error loading personal tasks:', error);
        return [];
    }
}

/**
 * Get count of active personal tasks
 */
async function getPersonalTaskCount(userId) {
    const tasks = await loadPersonalTasks(userId);
    return tasks.length;
}

/**
 * Add personal task (max 10)
 */
async function addPersonalTask(title, frequency = 'daily') {
    try {
        const userId = window.currentUser.uid;
        const count = await getPersonalTaskCount(userId);
        
        if (count >= 10) {
            alert('You can only have up to 10 personal tasks. Please delete an existing task first.');
            return false;
        }
        
        const db = firebase.database();
        await db.ref(`userCustomTasks/${userId}`).push({
            title: title,
            description: '',
            frequency: frequency,
            isActive: true,
            createdAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Personal task added!', 'success');
        return true;
    } catch (error) {
        console.error('Error adding personal task:', error);
        alert('Error adding task: ' + error.message);
        return false;
    }
}

/**
 * Edit personal task
 */
async function editPersonalTask(taskId, newTitle, newFrequency) {
    try {
        const userId = window.currentUser.uid;
        const db = firebase.database();
        
        await db.ref(`userCustomTasks/${userId}/${taskId}`).update({
            title: newTitle,
            frequency: newFrequency,
            updatedAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Task updated!', 'success');
        return true;
    } catch (error) {
        console.error('Error editing task:', error);
        alert('Error editing task: ' + error.message);
        return false;
    }
}

/**
 * Delete personal task (soft delete)
 */
async function deletePersonalTask(taskId) {
    try {
        const userId = window.currentUser.uid;
        const db = firebase.database();
        
        await db.ref(`userCustomTasks/${userId}/${taskId}`).update({
            isActive: false,
            deletedAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Task deleted!', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task: ' + error.message);
        return false;
    }
}

/**
 * Add shop template to user's personal tasks
 */
async function addShopTemplateToMyList(templateId) {
    try {
        const userId = window.currentUser.uid;
        const count = await getPersonalTaskCount(userId);
        
        if (count >= 10) {
            alert('You can only have up to 10 personal tasks. Please delete an existing task first.');
            return false;
        }
        
        const template = window.shopTaskTemplates.find(t => t.id === templateId);
        if (!template) {
            alert('Template not found');
            return false;
        }
        
        const db = firebase.database();
        
        // Add to user's personal tasks
        await db.ref(`userCustomTasks/${userId}`).push({
            title: template.title,
            description: template.description || '',
            frequency: template.frequency,
            isActive: true,
            fromTemplate: templateId,
            createdAt: new Date().toISOString()
        });
        
        // Increment template usage count
        await db.ref(`shopTaskTemplates/${templateId}/usedByCount`).transaction((current) => {
            return (current || 0) + 1;
        });
        
        utils.showToast('✅ Task added to your list!', 'success');
        return true;
    } catch (error) {
        console.error('Error adding template to list:', error);
        alert('Error adding task: ' + error.message);
        return false;
    }
}

// ===== TASK FREQUENCY & DUE DATE LOGIC =====

/**
 * Check if a task is due today based on frequency
 */
function isTaskDueToday(task, today = null) {
    if (!today) {
        today = new Date();
    }
    
    const frequency = task.frequency || 'daily';
    
    // Daily tasks always due
    if (frequency === 'daily') {
        return true;
    }
    
    // Weekly tasks due on Mondays
    if (frequency === 'weekly') {
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        return dayOfWeek === 1;
    }
    
    // Monthly tasks due on 1st of month
    if (frequency === 'monthly') {
        const dayOfMonth = today.getDate();
        return dayOfMonth === 1;
    }
    
    return false;
}

/**
 * Get all tasks due today (default + personal + shop templates)
 */
async function getTodaysTasks(userId) {
    const today = new Date();
    
    // Get default tasks from helpContent
    const defaultTasks = window.helpContent?.dailyRoutine?.tasks || [];
    
    // Get personal tasks
    const personalTasks = await loadPersonalTasks(userId);
    
    // Filter by what's due today
    const dueTasks = {
        default: defaultTasks.filter(t => isTaskDueToday(t, today)),
        personal: personalTasks.filter(t => isTaskDueToday(t, today))
    };
    
    return dueTasks;
}

// ===== COMPLETION & PERCENTAGE CALCULATION =====

/**
 * Calculate completion percentage for today's tasks
 */
function calculateCompletionPercentage(tasksState, dueTasks) {
    // Count only mandatory default tasks (personal tasks are optional)
    const mandatoryTasks = dueTasks.default.filter(t => !t.isOptional);
    
    if (mandatoryTasks.length === 0) {
        return 100; // No tasks due = 100%
    }
    
    const completed = mandatoryTasks.filter(t => tasksState[t.id]?.completed).length;
    return Math.round((completed / mandatoryTasks.length) * 100);
}

/**
 * Update task and recalculate completion
 */
async function updateDailyTask(taskId, completed) {
    try {
        const userId = window.currentUser.uid;
        const today = getLocalDateString(new Date());
        
        // Save task completion
        await saveDailyTaskCompletion(userId, today, taskId, completed);
        
        // Reload state and recalculate
        const state = await loadDailyRoutineState(userId, today);
        const dueTasks = await getTodaysTasks(userId);
        const percentage = calculateCompletionPercentage(state.tasks, dueTasks);
        
        // Update percentage in Firebase
        const db = firebase.database();
        await db.ref(`dailyRoutineState/${userId}/${today}/completionPercentage`).set(percentage);
        
        // Update UI
        updateProgressDisplay(percentage);
        
        // Check for badge eligibility if 100%
        if (percentage === 100) {
            await checkBadgeEligibility(userId, percentage);
        }
        
        return true;
    } catch (error) {
        console.error('Error updating task:', error);
        return false;
    }
}

/**
 * Update progress display in modal
 */
function updateProgressDisplay(percentage) {
    const progressBar = document.getElementById('routineProgressBar');
    const progressText = document.getElementById('routineProgressText');
    const progressCircle = document.getElementById('routineProgressCircle');
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    if (progressText) {
        progressText.textContent = percentage + '%';
    }
    
    if (progressCircle) {
        // Update circular progress (SVG circle)
        const circle = progressCircle.querySelector('circle.progress-ring__circle');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }
}

// ===== BADGE & STREAK SYSTEM =====

/**
 * Get current holiday season
 */
function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    
    // Christmas: November - January (11, 12, 1)
    if (month >= 11 || month === 1) {
        return 'Christmas';
    }
    
    // Summer: March - May (3, 4, 5)
    if (month >= 3 && month <= 5) {
        return 'Summer';
    }
    
    // Fiesta: August - September (8, 9)
    if (month >= 8 && month <= 9) {
        return 'Fiesta';
    }
    
    return 'Regular';
}

/**
 * Get week start date (Sunday) in Manila timezone
 */
function getWeekStartDate() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    return getLocalDateString(weekStart);
}

/**
 * Check if grace day is available this week
 */
function checkGraceEligibility(badges) {
    const currentWeekStart = getWeekStartDate();
    const graceData = badges.graceUsedThisWeek || { weekStartDate: null, graceDaysUsed: 0 };
    
    // Reset if new week
    if (graceData.weekStartDate !== currentWeekStart) {
        return { available: true, used: 0 };
    }
    
    // Check if already used grace this week
    return { available: graceData.graceDaysUsed < 1, used: graceData.graceDaysUsed };
}

/**
 * Apply grace day silently
 */
async function applyGraceDay(userId) {
    try {
        const db = firebase.database();
        const currentWeekStart = getWeekStartDate();
        const today = getLocalDateString(new Date());
        
        // Update grace usage
        await db.ref(`routineBadges/${userId}/graceUsedThisWeek`).set({
            weekStartDate: currentWeekStart,
            graceDaysUsed: 1
        });
        
        // Mark today's state as grace day
        await db.ref(`dailyRoutineState/${userId}/${today}/isGraceDay`).set(true);
        
        console.log('🛡️ Grace day applied silently for', today);
        return true;
    } catch (error) {
        console.error('Error applying grace day:', error);
        return false;
    }
}

/**
 * Update streak based on completion
 */
async function updateStreak(userId, completionPct) {
    try {
        const db = firebase.database();
        const badges = window.currentUserBadges || {};
        const today = getLocalDateString(new Date());
        
        // Check if 80%+ completed
        const isCompleted = completionPct >= 80;
        
        // Check grace eligibility
        const grace = checkGraceEligibility(badges);
        
        let newStreak = badges.currentStreak || 0;
        let shouldMaintainStreak = isCompleted;
        
        // If not completed, check if grace available
        if (!isCompleted && grace.available) {
            await applyGraceDay(userId);
            shouldMaintainStreak = true;
        }
        
        if (shouldMaintainStreak) {
            newStreak = (badges.currentStreak || 0) + 1;
            
            // Update streak
            await db.ref(`routineBadges/${userId}`).update({
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, badges.longestStreak || 0),
                totalDaysCompleted: (badges.totalDaysCompleted || 0) + 1,
                lastUpdated: new Date().toISOString()
            });
            
            // Check for streak badges
            await checkStreakBadges(userId, newStreak);
        } else {
            // Streak broken
            console.log('❌ Streak broken - completion:', completionPct);
            await db.ref(`routineBadges/${userId}`).update({
                currentStreak: 0,
                lastUpdated: new Date().toISOString()
            });
        }
        
        return newStreak;
    } catch (error) {
        console.error('Error updating streak:', error);
        return 0;
    }
}

/**
 * Check and award streak badges
 */
async function checkStreakBadges(userId, streak) {
    const badgeThresholds = [
        { days: 3, name: '3-Day Streak' },
        { days: 7, name: '7-Day Streak' },
        { days: 30, name: '30-Day Streak' },
        { days: 90, name: 'Monthly Champion' }
    ];
    
    for (const threshold of badgeThresholds) {
        if (streak === threshold.days) {
            await awardBadge(userId, threshold.name);
        }
    }
}

/**
 * Award badge to user
 */
async function awardBadge(userId, badgeType) {
    try {
        const db = firebase.database();
        const season = getCurrentSeason();
        
        const badgeData = {
            type: badgeType,
            earnedAt: new Date().toISOString(),
            season: season
        };
        
        // Add badge to array
        await db.ref(`routineBadges/${userId}/badges`).push(badgeData);
        
        // Update total badges earned counter
        await db.ref(`routineBadges/${userId}/totalBadgesEarned`).transaction((current) => {
            return (current || 0) + 1;
        });
        
        // Show celebration
        showBadgeCelebration(badgeData);
        
        return true;
    } catch (error) {
        console.error('Error awarding badge:', error);
        return false;
    }
}

/**
 * Check badge eligibility when task completed
 */
async function checkBadgeEligibility(userId, completionPct) {
    if (completionPct === 100) {
        await updateStreak(userId, completionPct);
    }
}

/**
 * Show badge celebration overlay
 */
function showBadgeCelebration(badge) {
    const overlay = document.getElementById('badgeCelebrationOverlay');
    if (!overlay) return;
    
    const badgeName = document.getElementById('celebrationBadgeName');
    
    if (badgeName) badgeName.textContent = badge.type;
    
    overlay.style.display = 'flex';
    
    // Trigger confetti animation (if available)
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 5000);
}

/**
 * Close badge celebration
 */
function closeBadgeCelebration() {
    const overlay = document.getElementById('badgeCelebrationOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===== MODAL DISPLAY & INTERACTION =====

/**
 * Show daily routine modal
 */
async function showDailyRoutineModal() {
    try {
        const userId = window.currentUser.uid;
        const today = getLocalDateString(new Date());
        
        // Load current state
        const state = await loadDailyRoutineState(userId, today);
        const dueTasks = await getTodaysTasks(userId);
        const personalTaskCount = await getPersonalTaskCount(userId);
        
        // Calculate completion
        const percentage = calculateCompletionPercentage(state.tasks, dueTasks);
        
        // Render modal content
        await renderDailyRoutineModal(dueTasks, state.tasks, percentage, personalTaskCount);
        
        // Show modal
        document.getElementById('dailyRoutineModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error showing daily routine modal:', error);
        alert('Error loading daily routine: ' + error.message);
    }
}

/**
 * Render daily routine modal content
 */
async function renderDailyRoutineModal(dueTasks, tasksState, percentage, personalTaskCount) {
    const lang = window.selectedLanguage || 'en';
    const badges = window.currentUserBadges || {};
    
    // Header with progress and streak
    const headerHTML = `
        <div class="routine-header">
            <div class="routine-header-left">
                <h3>📋 ${lang === 'en' ? 'Daily Routine Checklist' : 'Daily Routine Checklist'}</h3>
            </div>
            <div class="routine-header-right">
                <div class="routine-streak">
                    🔥 ${badges.currentStreak || 0} ${lang === 'en' ? 'days' : 'araw'}
                </div>
            </div>
        </div>
        
        <div class="routine-progress-container">
            <div class="routine-progress-bar">
                <div class="routine-progress-fill" id="routineProgressBar" style="width: ${percentage}%"></div>
            </div>
            <div class="routine-progress-text" id="routineProgressText">${percentage}%</div>
        </div>
    `;
    
    // Task tabs (Daily/Weekly/Monthly)
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const isFirstOfMonth = today.getDate() === 1;
    
    const tabsHTML = `
        <div class="routine-tabs">
            <button class="routine-tab active" onclick="switchRoutineTab('daily')">
                ${lang === 'en' ? 'Daily' : 'Araw-araw'}
            </button>
            <button class="routine-tab ${isMonday ? 'has-tasks' : ''}" onclick="switchRoutineTab('weekly')">
                ${lang === 'en' ? 'Weekly' : 'Lingguhan'}
            </button>
            <button class="routine-tab ${isFirstOfMonth ? 'has-tasks' : ''}" onclick="switchRoutineTab('monthly')">
                ${lang === 'en' ? 'Monthly' : 'Buwanan'}
            </button>
        </div>
    `;
    
    // Default tasks
    const defaultTasksHTML = renderTaskList(dueTasks.default, tasksState, 'default', lang);
    
    // Shop templates (optional)
    const shopTemplatesHTML = renderShopTemplates(tasksState, lang);
    
    // Personal tasks
    const personalTasksHTML = renderTaskList(dueTasks.personal, tasksState, 'personal', lang, personalTaskCount);
    
    // Dismiss buttons
    const dismissHTML = `
        <div class="routine-dismiss-buttons">
            <button class="btn-secondary" onclick="dismissRoutineModal(1)">
                ⏰ ${lang === 'en' ? 'Remind in 1 hour' : 'Paalala sa 1 oras'}
            </button>
            <button class="btn-primary" onclick="dismissRoutineModal('today')">
                ✅ ${lang === 'en' ? 'Done for Today' : 'Tapos na'}
            </button>
        </div>
    `;
    
    // Combine all
    const contentHTML = headerHTML + tabsHTML + 
        `<div class="routine-tab-content" id="dailyTabContent">` +
        defaultTasksHTML + shopTemplatesHTML + personalTasksHTML +
        `</div>` + dismissHTML;
    
    document.getElementById('dailyRoutineContent').innerHTML = contentHTML;
}

/**
 * Render task list
 */
function renderTaskList(tasks, tasksState, listType, lang, personalTaskCount = 0) {
    if (!tasks || tasks.length === 0) {
        return '';
    }
    
    const sectionTitle = listType === 'default' 
        ? (lang === 'en' ? 'Required Tasks' : 'Kinakailangang Gawain')
        : (lang === 'en' ? 'My Personal Tasks' : 'Aking Mga Gawain');
    
    let html = `<div class="routine-task-section">`;
    html += `<h4>${sectionTitle}</h4>`;
    
    if (listType === 'personal') {
        html += `<div class="personal-task-counter">${personalTaskCount}/10 tasks</div>`;
    }
    
    html += `<div class="routine-task-list">`;
    
    tasks.forEach(task => {
        const isChecked = tasksState[task.id]?.completed || false;
        const taskTitle = lang === 'en' ? (task.title_en || task.title) : (task.title_tl || task.title);
        const taskDesc = lang === 'en' ? (task.description_en || task.description || '') : (task.description_tl || task.description || '');
        
        html += `
            <label class="routine-task-item ${isChecked ? 'completed' : ''}">
                <input type="checkbox" 
                       ${isChecked ? 'checked' : ''} 
                       onchange="updateDailyTask('${task.id}', this.checked)">
                <div class="task-content">
                    <div class="task-title">${taskTitle}</div>
                    ${taskDesc ? `<div class="task-description">${taskDesc}</div>` : ''}
                </div>
                ${listType === 'personal' ? `
                    <div class="task-actions">
                        <button class="btn-icon" onclick="editPersonalTask('${task.id}'); event.stopPropagation();" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="deletePersonalTask('${task.id}'); event.stopPropagation();" title="Delete">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </label>
        `;
    });
    
    html += `</div>`; // close task-list
    
    // Add task button for personal tasks
    if (listType === 'personal' && personalTaskCount < 10) {
        html += `
            <button class="btn-add-task" onclick="showAddPersonalTaskForm()">
                + ${lang === 'en' ? 'Add Personal Task' : 'Magdagdag ng Gawain'}
            </button>
        `;
    }
    
    html += `</div>`; // close task-section
    
    return html;
}

/**
 * Render shop templates (optional tasks)
 */
function renderShopTemplates(tasksState, lang) {
    const templates = window.shopTaskTemplates || [];
    
    if (templates.length === 0) {
        return '';
    }
    
    let html = `<div class="routine-task-section">`;
    html += `<h4>${lang === 'en' ? 'Optional Shop Tasks' : 'Opsyonal na Gawain'}</h4>`;
    html += `<div class="routine-shop-templates">`;
    
    templates.forEach(template => {
        const title = lang === 'en' ? (template.title_en || template.title) : (template.title_tl || template.title);
        
        html += `
            <div class="shop-template-item">
                <div class="template-info">
                    <div class="template-title">${title}</div>
                    <div class="template-frequency">${template.frequency}</div>
                </div>
                <button class="btn-small" onclick="addShopTemplateToMyList('${template.id}')">
                    + ${lang === 'en' ? 'Add' : 'Idagdag'}
                </button>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    return html;
}

/**
 * Show add personal task form
 */
function showAddPersonalTaskForm() {
    const lang = window.selectedLanguage || 'en';
    const formHTML = `
        <div class="add-task-form" id="addTaskForm">
            <input type="text" 
                   id="newTaskTitle" 
                   placeholder="${lang === 'en' ? 'Task title...' : 'Pangalan ng gawain...'}" 
                   maxlength="100">
            <select id="newTaskFrequency">
                <option value="daily">${lang === 'en' ? 'Daily' : 'Araw-araw'}</option>
                <option value="weekly">${lang === 'en' ? 'Weekly' : 'Lingguhan'}</option>
                <option value="monthly">${lang === 'en' ? 'Monthly' : 'Buwanan'}</option>
            </select>
            <div class="form-buttons">
                <button class="btn-secondary" onclick="hideAddPersonalTaskForm()">
                    ${lang === 'en' ? 'Cancel' : 'Kanselahin'}
                </button>
                <button class="btn-primary" onclick="saveNewPersonalTask()">
                    ${lang === 'en' ? 'Add Task' : 'Idagdag'}
                </button>
            </div>
        </div>
    `;
    
    // Insert form before the add button
    const addButton = document.querySelector('.btn-add-task');
    if (addButton) {
        addButton.insertAdjacentHTML('beforebegin', formHTML);
        addButton.style.display = 'none';
        document.getElementById('newTaskTitle').focus();
    }
}

/**
 * Hide add personal task form
 */
function hideAddPersonalTaskForm() {
    const form = document.getElementById('addTaskForm');
    if (form) {
        form.remove();
    }
    
    const addButton = document.querySelector('.btn-add-task');
    if (addButton) {
        addButton.style.display = 'block';
    }
}

/**
 * Save new personal task
 */
async function saveNewPersonalTask() {
    const title = document.getElementById('newTaskTitle').value.trim();
    const frequency = document.getElementById('newTaskFrequency').value;
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const success = await addPersonalTask(title, frequency);
    if (success) {
        hideAddPersonalTaskForm();
        // Reload modal
        await showDailyRoutineModal();
    }
}

/**
 * Switch between task tabs (Daily/Weekly/Monthly)
 */
function switchRoutineTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.routine-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter tasks by frequency
    // (In this implementation, we show all due tasks in one view)
    // This is a placeholder for future enhancement
    console.log('Switched to tab:', tabName);
}

/**
 * Dismiss routine modal with reminder
 */
function dismissRoutineModal(remindIn) {
    const userId = window.currentUser.uid;
    const today = getLocalDateString(new Date());
    const dismissKey = `routineDismissed_${userId}_${today}`;
    
    const dismissData = {
        timestamp: new Date().toISOString(),
        remindInHours: remindIn
    };
    
    localStorage.setItem(dismissKey, JSON.stringify(dismissData));
    
    // Close modal
    closeDailyRoutineModal();
}

/**
 * Close daily routine modal
 */
function closeDailyRoutineModal() {
    document.getElementById('dailyRoutineModal').style.display = 'none';
}

// ===== REMINDER SYSTEM =====

/**
 * Check if should show routine modal/reminder
 */
async function checkAndShowReminder() {
    try {
        const userId = window.currentUser?.uid;
        if (!userId) return;
        
        const role = window.currentUserData?.role;
        if (!['technician', 'cashier'].includes(role)) return;
        
        // Don't show after 5pm Manila time
        const now = new Date();
        const hours = parseInt(now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false,
            hour: '2-digit'
        }));
        
        if (hours >= 17) {
            return; // After 5pm, stop reminders
        }
        
        const today = getLocalDateString(new Date());
        const dismissKey = `routineDismissed_${userId}_${today}`;
        const dismissData = localStorage.getItem(dismissKey);
        
        // Load today's completion
        const state = await loadDailyRoutineState(userId, today);
        const completionPct = state.completionPercentage || 0;
        
        // If 100% complete, no need to remind
        if (completionPct === 100) {
            return;
        }
        
        // Check if dismissed today
        if (dismissData) {
            const dismissed = JSON.parse(dismissData);
            const dismissedTime = new Date(dismissed.timestamp);
            const hoursSinceDismiss = (Date.now() - dismissedTime.getTime()) / (1000 * 60 * 60);
            
            // If dismissed as "Done for today", don't show again
            if (dismissed.remindInHours === 'today') {
                return;
            }
            
            // Check remind interval
            const remindAfter = dismissed.remindInHours || 1;
            
            if (hoursSinceDismiss < remindAfter) {
                return; // Too soon to remind
            }
            
            // If >4 hours and <50% complete, force modal
            if (hoursSinceDismiss >= 4 && completionPct < 50) {
                await showUrgentRoutineModal();
                return;
            }
            
            // Otherwise show gentle toast
            if (hoursSinceDismiss >= remindAfter) {
                utils.showToast('⏰ Don\'t forget your daily checklist!', 'warning', 8000);
                return;
            }
        }
        
    } catch (error) {
        console.error('Error checking reminder:', error);
    }
}

/**
 * Show urgent routine modal with warning
 */
async function showUrgentRoutineModal() {
    await showDailyRoutineModal();
    
    // Add urgent styling
    const modal = document.getElementById('dailyRoutineModal');
    if (modal) {
        modal.classList.add('urgent');
        
        // Add warning banner
        const content = document.getElementById('dailyRoutineContent');
        if (content) {
            const warning = document.createElement('div');
            warning.className = 'urgent-warning';
            warning.innerHTML = '⚠️ URGENT: Complete checklist to maintain your streak!';
            content.insertBefore(warning, content.firstChild);
        }
    }
}

/**
 * Check if should show daily routine on login
 */
async function checkAndShowDailyRoutine() {
    try {
        const userId = window.currentUser?.uid;
        if (!userId) return;
        
        const role = window.currentUserData?.role;
        if (!['technician', 'cashier'].includes(role)) return;
        
        const today = getLocalDateString(new Date());
        const shownKey = `dailyRoutineShown_${userId}_${today}`;
        
        // Check if already shown today
        if (localStorage.getItem(shownKey) === 'true') {
            return;
        }
        
        // Check if already completed
        const state = await loadDailyRoutineState(userId, today);
        if (state.completionPercentage >= 100) {
            return;
        }
        
        // Check if dismissed as "Done for today"
        const dismissKey = `routineDismissed_${userId}_${today}`;
        const dismissData = localStorage.getItem(dismissKey);
        if (dismissData) {
            const dismissed = JSON.parse(dismissData);
            if (dismissed.remindInHours === 'today') {
                return;
            }
        }
        
        // Show modal after 3 seconds
        setTimeout(() => {
            showDailyRoutineModal();
            localStorage.setItem(shownKey, 'true');
        }, 3000);
        
    } catch (error) {
        console.error('Error checking daily routine:', error);
    }
}

// ===== ADMIN FUNCTIONS =====

/**
 * Get compliance data for all users
 */
async function getAllUsersCompliance(date = null) {
    try {
        if (!date) {
            date = getLocalDateString(new Date());
        }
        
        const users = Object.values(window.allUsers || {})
            .filter(u => u.status === 'active' && ['technician', 'cashier'].includes(u.role));
        
        const complianceData = await Promise.all(
            users.map(async user => {
                const state = await loadDailyRoutineState(user.id, date);
                const badges = await loadUserBadges(user.id);
                
                return {
                    userId: user.id,
                    userName: user.displayName || user.email,
                    role: user.role,
                    completionPercentage: state.completionPercentage || 0,
                    lastUpdated: state.lastUpdated,
                    currentStreak: badges.currentStreak || 0,
                    isGraceDay: state.isGraceDay || false
                };
            })
        );
        
        return complianceData;
    } catch (error) {
        console.error('Error getting compliance data:', error);
        return [];
    }
}

/**
 * Load user badges
 */
async function loadUserBadges(userId) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`routineBadges/${userId}`).once('value');
        return snapshot.val() || {
            currentStreak: 0,
            longestStreak: 0,
            totalDaysCompleted: 0,
            badges: [],
            totalBadgesEarned: 0
        };
    } catch (error) {
        console.error('Error loading badges:', error);
        return { currentStreak: 0, badges: [] };
    }
}

/**
 * Get compliance data for date range
 */
async function getComplianceDataRange(userId, startDate, endDate) {
    try {
        const db = firebase.database();
        const snapshot = await db.ref(`dailyRoutineState/${userId}`)
            .orderByKey()
            .startAt(startDate)
            .endAt(endDate)
            .once('value');
        
        const data = snapshot.val() || {};
        return Object.keys(data).map(date => ({
            date: date,
            ...data[date]
        }));
    } catch (error) {
        console.error('Error getting compliance range:', error);
        return [];
    }
}

/**
 * Calculate weekly trend (7 days)
 */
async function calculateWeeklyTrend(userId) {
    const today = new Date();
    const trend = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        
        const state = await loadDailyRoutineState(userId, dateStr);
        trend.push({
            date: dateStr,
            percentage: state.completionPercentage || 0,
            isGraceDay: state.isGraceDay || false
        });
    }
    
    return trend;
}

/**
 * Calculate monthly stats
 */
async function calculateMonthlyStats(userId) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = getLocalDateString(firstDay);
    const todayStr = getLocalDateString(today);
    
    const data = await getComplianceDataRange(userId, firstDayStr, todayStr);
    const badges = await loadUserBadges(userId);
    
    const avgCompletion = data.length > 0
        ? Math.round(data.reduce((sum, d) => sum + (d.completionPercentage || 0), 0) / data.length)
        : 0;
    
    return {
        avgCompletion: avgCompletion,
        currentStreak: badges.currentStreak || 0,
        longestStreak: badges.longestStreak || 0,
        totalBadges: badges.badges?.length || 0
    };
}

/**
 * Get badge leaderboard
 */
async function getBadgeLeaderboard() {
    try {
        const users = Object.values(window.allUsers || {})
            .filter(u => u.status === 'active' && ['technician', 'cashier'].includes(u.role));
        
        const leaderboard = await Promise.all(
            users.map(async user => {
                const badges = await loadUserBadges(user.id);
                return {
                    userId: user.id,
                    userName: user.displayName || user.email,
                    currentStreak: badges.currentStreak || 0,
                    longestStreak: badges.longestStreak || 0,
                    totalBadges: badges.badges?.length || 0
                };
            })
        );
        
        // Sort by current streak (desc), then longest streak
        leaderboard.sort((a, b) => {
            if (b.currentStreak !== a.currentStreak) {
                return b.currentStreak - a.currentStreak;
            }
            return b.longestStreak - a.longestStreak;
        });
        
        return leaderboard;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

/**
 * Get pending badge payouts for season
 */
async function getPendingBadgePayouts(season = null) {
    try {
        if (!season) {
            season = getCurrentSeason();
        }
        
        const users = Object.values(window.allUsers || {})
            .filter(u => u.status === 'active' && ['technician', 'cashier'].includes(u.role));
        
        const payouts = [];
        
        for (const user of users) {
            const badges = await loadUserBadges(user.id);
            const userBadges = Object.values(badges.badges || {})
                .filter(b => !b.isPaid && b.season === season);
            
            if (userBadges.length > 0) {
                const totalCash = userBadges.reduce((sum, b) => sum + (b.cashValue || 0), 0);
                payouts.push({
                    userId: user.id,
                    userName: user.displayName || user.email,
                    badges: userBadges,
                    totalCash: totalCash
                });
            }
        }
        
        return payouts;
    } catch (error) {
        console.error('Error getting pending payouts:', error);
        return [];
    }
}

/**
 * Approve seasonal payout
 */
async function approveSeasonalPayout(userId, season) {
    try {
        const db = firebase.database();
        const badges = await loadUserBadges(userId);
        
        // Find all unpaid badges for this season
        const badgeUpdates = {};
        let totalPaid = 0;
        
        Object.keys(badges.badges || {}).forEach(badgeId => {
            const badge = badges.badges[badgeId];
            if (!badge.isPaid && badge.season === season) {
                badgeUpdates[`routineBadges/${userId}/badges/${badgeId}/isPaid`] = true;
                badgeUpdates[`routineBadges/${userId}/badges/${badgeId}/paidAt`] = new Date().toISOString();
                totalPaid += badge.cashValue || 0;
            }
        });
        
        // Update total cash paid
        badgeUpdates[`routineBadges/${userId}/totalCashPaid`] = (badges.totalCashPaid || 0) + totalPaid;
        
        await db.ref().update(badgeUpdates);
        
        utils.showToast(`✅ Approved ₱${totalPaid} for ${season} season`, 'success');
        return true;
    } catch (error) {
        console.error('Error approving payout:', error);
        alert('Error approving payout: ' + error.message);
        return false;
    }
}

/**
 * Generate payout report
 */
async function generatePayoutReport(season) {
    const payouts = await getPendingBadgePayouts(season);
    
    let csv = 'User,Badge Type,Earned Date,Cash Value,Season\n';
    
    payouts.forEach(payout => {
        payout.badges.forEach(badge => {
            csv += `"${payout.userName}","${badge.type}","${badge.earnedAt}",${badge.cashValue},"${badge.season}"\n`;
        });
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-report-${season}-${getLocalDateString(new Date())}.csv`;
    a.click();
}

/**
 * Get seasonal payout summary
 */
async function getSeasonalPayoutSummary(season = null) {
    const payouts = await getPendingBadgePayouts(season);
    
    const totalUsers = payouts.length;
    const totalBadges = payouts.reduce((sum, p) => sum + p.badges.length, 0);
    const totalCash = payouts.reduce((sum, p) => sum + p.totalCash, 0);
    
    return {
        season: season || getCurrentSeason(),
        totalUsers: totalUsers,
        totalBadges: totalBadges,
        totalCashAmount: totalCash
    };
}

// ===== SHOP TEMPLATE MANAGEMENT (ADMIN) =====

/**
 * Add shop task template (admin only)
 */
async function addShopTaskTemplate(title, description, frequency) {
    try {
        // Check admin permission
        if (window.currentUserData?.role !== 'admin') {
            alert('Only admins can manage shop templates');
            return false;
        }
        
        const db = firebase.database();
        await db.ref('shopTaskTemplates').push({
            title: title,
            description: description || '',
            frequency: frequency,
            isActive: true,
            usedByCount: 0,
            createdBy: window.currentUserData.displayName,
            createdAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Shop template added!', 'success');
        return true;
    } catch (error) {
        console.error('Error adding template:', error);
        alert('Error adding template: ' + error.message);
        return false;
    }
}

/**
 * Edit shop task template (admin only)
 */
async function editShopTaskTemplate(templateId, title, description, frequency) {
    try {
        if (window.currentUserData?.role !== 'admin') {
            alert('Only admins can manage shop templates');
            return false;
        }
        
        const db = firebase.database();
        await db.ref(`shopTaskTemplates/${templateId}`).update({
            title: title,
            description: description || '',
            frequency: frequency,
            updatedAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Template updated!', 'success');
        return true;
    } catch (error) {
        console.error('Error editing template:', error);
        alert('Error editing template: ' + error.message);
        return false;
    }
}

/**
 * Delete shop task template (admin only, soft delete)
 */
async function deleteShopTaskTemplate(templateId) {
    try {
        if (window.currentUserData?.role !== 'admin') {
            alert('Only admins can manage shop templates');
            return false;
        }
        
        // Check if template is in use
        const template = window.shopTaskTemplates.find(t => t.id === templateId);
        if (template && template.usedByCount > 0) {
            if (!confirm(`This template is used by ${template.usedByCount} users. Delete anyway?`)) {
                return false;
            }
        }
        
        const db = firebase.database();
        await db.ref(`shopTaskTemplates/${templateId}`).update({
            isActive: false,
            deletedAt: new Date().toISOString()
        });
        
        utils.showToast('✅ Template deleted!', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting template:', error);
        alert('Error deleting template: ' + error.message);
        return false;
    }
}

// ===== EXPORT FUNCTIONS TO WINDOW =====

window.initializeDailyRoutineListeners = initializeDailyRoutineListeners;
window.showDailyRoutineModal = showDailyRoutineModal;
window.closeDailyRoutineModal = closeDailyRoutineModal;
window.updateDailyTask = updateDailyTask;
window.dismissRoutineModal = dismissRoutineModal;
window.checkAndShowDailyRoutine = checkAndShowDailyRoutine;
window.checkAndShowReminder = checkAndShowReminder;

window.addPersonalTask = addPersonalTask;
window.editPersonalTask = editPersonalTask;
window.deletePersonalTask = deletePersonalTask;
window.showAddPersonalTaskForm = showAddPersonalTaskForm;
window.hideAddPersonalTaskForm = hideAddPersonalTaskForm;
window.saveNewPersonalTask = saveNewPersonalTask;
window.addShopTemplateToMyList = addShopTemplateToMyList;

window.switchRoutineTab = switchRoutineTab;
window.closeBadgeCelebration = closeBadgeCelebration;

// Admin functions
window.getAllUsersCompliance = getAllUsersCompliance;
window.calculateWeeklyTrend = calculateWeeklyTrend;
window.calculateMonthlyStats = calculateMonthlyStats;
window.getBadgeLeaderboard = getBadgeLeaderboard;
window.getPendingBadgePayouts = getPendingBadgePayouts;
window.approveSeasonalPayout = approveSeasonalPayout;
window.generatePayoutReport = generatePayoutReport;
window.getSeasonalPayoutSummary = getSeasonalPayoutSummary;

window.addShopTaskTemplate = addShopTaskTemplate;
window.editShopTaskTemplate = editShopTaskTemplate;
window.deleteShopTaskTemplate = deleteShopTaskTemplate;

console.log('✅ Daily Routine module loaded');
