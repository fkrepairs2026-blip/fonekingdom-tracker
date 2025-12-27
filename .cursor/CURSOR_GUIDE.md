# 🎯 Using Cursor IDE with Fonekingdom Tracker

## 📚 Documentation Files for Cursor

You have 5 comprehensive documentation files that will help Cursor understand your project:

1. **PROJECT.md** - Complete project overview
2. **FILE_STRUCTURE.md** - File organization & code locations
3. **FEATURES.md** - All features & functionality
4. **CODING_STANDARDS.md** - Code style & best practices
5. **CURSOR_GUIDE.md** - This file

---

## 🚀 Initial Setup

### **Step 1: Clone Repository to Local**

```bash
# Clone your GitHub repo
git clone https://github.com/fkrepairs2026-blip/fonekingdom-tracker.git

# Navigate to project
cd fonekingdom-tracker

# Open in Cursor
cursor .
```

### **Step 2: Place Documentation Files**

```
fonekingdom-tracker/
├── .cursor/              # Create this folder
│   ├── PROJECT.md
│   ├── FILE_STRUCTURE.md
│   ├── FEATURES.md
│   ├── CODING_STANDARDS.md
│   └── CURSOR_GUIDE.md
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── firebase-config.js
    ├── utils.js
    ├── auth.js
    ├── repairs.js
    ├── ui.js
    └── app.js
```

**Create .cursor folder:**
```bash
mkdir .cursor
# Move documentation files here
```

**Add to .gitignore:**
```
.cursor/
```
(So docs don't get committed)

---

## 💡 How to Use Cursor with This Project

### **Cursor's Context Understanding**

Cursor can read your documentation files to understand the project. Here's how:

#### **Method 1: @ Mention Files**
```
In Cursor chat:

@PROJECT.md I want to add a new feature for SMS notifications

@FILE_STRUCTURE.md Where should I add the SMS function?

@FEATURES.md Show me how the warranty system works

@CODING_STANDARDS.md How should I name this new function?
```

#### **Method 2: Natural Language**
```
"Looking at the PROJECT.md, can you help me add...?"

"Based on FILE_STRUCTURE.md, where should the new code go?"

"Following CODING_STANDARDS.md, format this function for me"
```

#### **Method 3: Add to Cursor Rules**
Create `.cursorrules` file in project root:

```
# Project Context
This is a repair shop management system. See PROJECT.md for full details.

# Code Style
Follow CODING_STANDARDS.md for all code changes.

# Architecture
- Vanilla JavaScript (no frameworks)
- Firebase Realtime Database
- Global state in window scope
- See FILE_STRUCTURE.md for organization

# Key Patterns
1. Always export functions: window.functionName = functionName
2. Add auto-refresh after Firebase updates
3. Use utils.showLoading() for async operations
4. Follow role-based access control

# Current Issues to Avoid
- Don't forget commas in utils object
- Always hide loading in catch blocks
- Add null checks for containers
- Export all onclick handler functions
```

---

## 🎨 Common Cursor Workflows

### **Workflow 1: Adding a New Feature**

**Example: Add SMS Notifications**

1. **Ask Cursor to Understand Context**
```
Me: @PROJECT.md @FEATURES.md I want to add SMS notifications 
    when a device is ready for pickup. What's the best approach?

Cursor: Based on your project structure, here's what I recommend:
1. Add SMS function in repairs.js
2. Call it when status changes to "Ready for Pickup"
3. Use a Philippine SMS API like Semaphore or Twilio
4. Store SMS history in Firebase
...
```

2. **Request Code Generation**
```
Me: @FILE_STRUCTURE.md Generate the SMS function following our patterns

Cursor: [Generates code following your standards]
```

3. **Review and Refine**
```
Me: @CODING_STANDARDS.md Make sure this follows our style guide

Cursor: [Adjusts code formatting, naming, error handling]
```

---

### **Workflow 2: Fixing a Bug**

**Example: Payment not refreshing UI**

1. **Describe the Problem**
```
Me: @FILE_STRUCTURE.md When I record a payment, the UI doesn't 
    update until I refresh the browser. The payment is saved to 
    Firebase though.

Cursor: Looking at FILE_STRUCTURE.md, you need to add the 
auto-refresh pattern. In repairs.js, find the savePayment function 
and add...
```

2. **Get Specific Fix**
```
Me: Show me the exact code to add in savePayment function

Cursor: [Provides exact code with line numbers]
```

---

### **Workflow 3: Understanding Existing Code**

**Example: How does warranty system work?**

1. **Ask for Explanation**
```
Me: @FEATURES.md @FILE_STRUCTURE.md Explain how the warranty 
    system works and where the code is located

Cursor: The warranty system has 3 main parts:
1. Release modal (lines 1300-1400 in repairs.js)
2. Warranty tracking (Claimed Units page in ui.js)
3. Warranty claims (lines 1500-1660 in repairs.js)
...
```

2. **Navigate Code**
```
Me: Show me the claimDevice function

Cursor: [Opens repairs.js at line 1453 and highlights function]
```

---

### **Workflow 4: Refactoring**

**Example: Make code more maintainable**

1. **Request Refactor**
```
Me: @CODING_STANDARDS.md This function is too long (200 lines). 
    Can you help me break it into smaller functions?

Cursor: [Suggests breaking into smaller, focused functions]
```

2. **Maintain Patterns**
```
Me: Make sure all new functions follow our export pattern

Cursor: [Adds window.functionName = functionName for each]
```

---

## 🔍 Cursor Features to Use

### **1. Chat with Codebase**
```
Cmd/Ctrl + L - Open chat
@ - Mention files
Cmd/Ctrl + Enter - Send message
```

**Example Questions:**
```
@PROJECT.md What database do we use?
@FILE_STRUCTURE.md Where is the payment logic?
@FEATURES.md How do users request modifications?
Where are all the Firebase queries?
Show me all functions that update payments
```

### **2. Inline Code Generation**
```
Cmd/Ctrl + K - Generate code inline
```

**Example:**
```javascript
// Place cursor here and press Cmd+K
// Type: "Create a function to send SMS notifications"

// Cursor generates:
async function sendSMSNotification(phoneNumber, message) {
  // Implementation following your patterns
}
```

### **3. Code Explanation**
```
Select code → Cmd/Ctrl + L → "Explain this code"
```

### **4. Find & Replace with AI**
```
Cmd/Ctrl + H for find/replace
Use Cursor chat: "Find all occurrences of X and replace with Y"
```

### **5. Auto-Fix Errors**
```
When you see error in console:
Paste error → "Fix this error following our patterns"
```

---

## 📋 Cursor Prompts Library

### **For Adding Features**
```
@PROJECT.md @FEATURES.md I want to add [feature name]. 
1. What's the best approach for our architecture?
2. Where should the code go?
3. What existing patterns should I follow?
```

### **For Debugging**
```
@FILE_STRUCTURE.md I'm getting this error: [paste error]
The issue is in [file name]. Can you help me fix it while 
maintaining our code patterns?
```

### **For Code Review**
```
@CODING_STANDARDS.md Review this code and suggest improvements:
[paste code]

Check for:
1. Style compliance
2. Error handling
3. Null checks
4. Export patterns
5. Auto-refresh
```

### **For Understanding**
```
@PROJECT.md @FILE_STRUCTURE.md I'm new to the codebase. 
Explain how [specific feature] works and show me the relevant code.
```

### **For Refactoring**
```
@CODING_STANDARDS.md This function is [issue]. Can you:
1. Refactor to be more maintainable
2. Follow our naming conventions
3. Add proper error handling
4. Keep the same functionality
```

---

## 🎯 Best Practices for Cursor

### **1. Always Provide Context**
```
❌ Bad:
"Add a button"

✅ Good:
"@FEATURES.md Add a 'Send SMS' button to the For Release page 
that appears only for admin/manager roles"
```

### **2. Reference Documentation**
```
❌ Bad:
"How should I name this?"

✅ Good:
"@CODING_STANDARDS.md How should I name this function that 
calculates warranty expiration?"
```

### **3. Be Specific About Patterns**
```
❌ Bad:
"Create a modal"

✅ Good:
"@FILE_STRUCTURE.md Create a modal following our modal pattern 
(modal HTML in index.html, functions in repairs.js, export to window)"
```

### **4. Request Tests**
```
"After generating this code, show me:
1. How to test it manually
2. Possible edge cases
3. Error scenarios to handle"
```

### **5. Ask for Documentation**
```
"Generate this feature AND update FEATURES.md with the new functionality"
```

---

## 🚨 Common Pitfalls to Avoid

### **1. Not Following Patterns**
```
❌ Cursor generates:
function newFeature() { }

✅ Remind Cursor:
"Don't forget to export: window.newFeature = newFeature"
```

### **2. Missing Auto-Refresh**
```
❌ Cursor generates Firebase update without refresh

✅ Remind Cursor:
"Add auto-refresh after the Firebase update"
```

### **3. Inconsistent Style**
```
❌ Cursor uses different naming

✅ Remind Cursor:
"@CODING_STANDARDS.md Use our naming conventions"
```

### **4. Breaking Changes**
```
Before accepting Cursor's suggestions:
1. Check it doesn't break existing features
2. Verify it maintains backward compatibility
3. Test in all user roles
```

---

## 📊 Cursor Workflow Examples

### **Complete Example: Add Export Feature**

**1. Initial Request**
```
Me: @PROJECT.md @FEATURES.md I want to add an "Export to Excel" 
feature for the repairs list. Only admin and manager should access it.

Cursor: I'll help you add this feature. Based on your architecture:
1. Add button to All Repairs page (ui.js)
2. Create export function in repairs.js
3. Use SheetJS library for Excel generation
4. Follow role-based access control
...
```

**2. Generate UI**
```
Me: @FILE_STRUCTURE.md Add the export button to buildAllRepairsPage

Cursor: [Generates button with role check]
```

**3. Generate Function**
```
Me: @CODING_STANDARDS.md Create the exportToExcel function

Cursor: [Generates function following patterns]
```

**4. Add Library**
```
Me: How do I add SheetJS to the project?

Cursor: Add this to index.html:
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
```

**5. Test**
```
Me: Generate a testing checklist for this feature

Cursor:
☐ Button appears only for admin/manager
☐ Button doesn't show for cashier/tech
☐ Export generates Excel file
☐ All columns present
☐ Dates formatted correctly
☐ Works with filters
```

**6. Document**
```
Me: Update FEATURES.md with this new feature

Cursor: [Adds export feature to documentation]
```

---

## 🎓 Learning from Cursor

### **Ask for Explanations**
```
"Why did you use this pattern instead of X?"
"What are the pros/cons of this approach?"
"How could this be optimized?"
```

### **Request Alternatives**
```
"Show me 3 different ways to implement this"
"What's a simpler approach?"
"What's a more robust approach?"
```

### **Understand Trade-offs**
```
"What are the performance implications?"
"How does this affect maintainability?"
"Are there any security concerns?"
```

---

## ✅ Quick Reference

### **Essential Cursor Commands**
```
Cmd/Ctrl + L     - Open chat
Cmd/Ctrl + K     - Generate code inline
Cmd/Ctrl + /     - Toggle comment
Cmd/Ctrl + D     - Select next occurrence
Cmd/Ctrl + P     - Quick file open
Cmd/Ctrl + Shift + P - Command palette
```

### **Essential @ Mentions**
```
@PROJECT.md        - Project overview
@FILE_STRUCTURE.md - Code organization
@FEATURES.md       - Feature documentation
@CODING_STANDARDS.md - Style guide
@filename.js       - Specific file context
```

### **Essential Prompts**
```
"Following our patterns..."
"@CODING_STANDARDS.md format this..."
"@FILE_STRUCTURE.md where should this go?"
"Explain this code"
"Fix this error"
"Generate tests for this"
"Update documentation"
```

---

## 🎯 Project-Specific Cursor Tips

### **For This Project Specifically:**

1. **Always mention Firebase**
```
"Create a Firebase update following our pattern"
"Add error handling for Firebase operations"
```

2. **Always mention role-based access**
```
"Add role check for admin/manager only"
"What roles should access this feature?"
```

3. **Always consider real-time updates**
```
"Will this trigger the Firebase listener?"
"Does this need auto-refresh?"
```

4. **Always think mobile**
```
"Make this responsive"
"Ensure it works on mobile"
```

5. **Always handle edge cases**
```
"What if payment is null?"
"What if user clicks twice?"
"What if Firebase is offline?"
```

---

## 🚀 Getting Started Right Now

**Step-by-Step:**

1. **Clone repo locally**
2. **Open in Cursor**
3. **Create .cursor folder**
4. **Move documentation files there**
5. **Create .cursorrules file** (use template above)
6. **Try first prompt:**
```
@PROJECT.md Give me an overview of how this application works
```
7. **Start coding with Cursor!**

---

## 📞 When You Need Help

**Ask Cursor:**
```
@PROJECT.md @FILE_STRUCTURE.md @FEATURES.md 
I need help with [specific issue]. Can you:
1. Explain what's happening
2. Show me where the code is
3. Suggest a fix following our patterns
4. Generate the code
5. Update documentation
```

---

This guide will help you use Cursor effectively with your Fonekingdom project! 🎉

**Remember:** Cursor is a powerful assistant, but YOU make the final decisions. Always review generated code and test thoroughly! ✅
