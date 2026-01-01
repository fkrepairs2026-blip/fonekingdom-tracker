# Validation Implementation Guide

## 🎯 How to Add Validation to Your Forms

This guide shows you how to apply the new validation functions to your existing forms.

---

## Example 1: Device Intake Form

**Location:** [js/repairs.js](js/repairs.js) - `submitReceiveDevice` function

### Before (No Validation):
```javascript
async function submitReceiveDevice() {
    try {
        utils.showLoading(true);
        
        const data = {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            // ... more fields
        };
        
        // Save to Firebase
        await db.ref('repairs').push(data);
        
        utils.showLoading(false);
        alert('Device received!');
    } catch (error) {
        utils.showLoading(false);
        alert('Error: ' + error.message);
    }
}
```

### After (With Validation):
```javascript
async function submitReceiveDevice() {
    try {
        // 1. Clear previous errors
        utils.clearValidationErrors('receiveDeviceModal');
        
        // 2. Get form data
        const formData = {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerEmail: document.getElementById('customerEmail').value,
            device: document.getElementById('device').value,
            problem: document.getElementById('problem').value,
            accessories: document.getElementById('accessories').value
        };
        
        // 3. Validate
        const errors = [];
        
        if (!utils.isRequired(formData.customerName)) {
            errors.push({ field: 'customerName', message: 'Customer name is required' });
        }
        
        if (!utils.isRequired(formData.customerPhone)) {
            errors.push({ field: 'customerPhone', message: 'Phone number is required' });
        } else if (!utils.isValidPhone(formData.customerPhone)) {
            errors.push({ field: 'customerPhone', message: 'Invalid phone format (use 09XX-XXX-XXXX)' });
        }
        
        if (formData.customerEmail && !utils.isValidEmail(formData.customerEmail)) {
            errors.push({ field: 'customerEmail', message: 'Invalid email format' });
        }
        
        if (!utils.isRequired(formData.device)) {
            errors.push({ field: 'device', message: 'Device is required' });
        }
        
        if (!utils.isRequired(formData.problem)) {
            errors.push({ field: 'problem', message: 'Problem description is required' });
        }
        
        // 4. Show errors if any
        if (errors.length > 0) {
            errors.forEach(err => utils.showValidationError(err.field, err.message));
            return; // Stop here, don't save
        }
        
        // 5. Sanitize all inputs (XSS protection)
        const sanitizedData = utils.sanitizeObject(formData);
        
        // 6. Save to Firebase
        utils.showLoading(true);
        
        await db.ref('repairs').push({
            ...sanitizedData,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid,
            status: 'Received'
        });
        
        utils.showLoading(false);
        
        // 7. Success feedback
        utils.showSuccess('Device received successfully!');
        
        // Close modal and refresh
        closeReceiveDeviceModal();
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        
    } catch (error) {
        utils.showLoading(false);
        
        // Handle error with friendly message
        const friendlyError = utils.handleFirebaseError(error);
        utils.showError(friendlyError.message);
        
        console.error('Error receiving device:', error);
    }
}
```

---

## Example 2: Payment Form

**Location:** [js/repairs.js](js/repairs.js) - `savePayment` function

### Add This Validation:
```javascript
async function savePayment(repairId) {
    try {
        // Clear previous errors
        utils.clearValidationErrors('paymentModalContent');
        
        // Get form data
        const amount = document.getElementById('paymentAmount').value;
        const method = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('paymentNotes').value;
        
        // Validate
        const errors = [];
        
        if (!utils.isRequired(amount)) {
            errors.push({ field: 'paymentAmount', message: 'Amount is required' });
        } else if (!utils.isValidPrice(amount)) {
            errors.push({ field: 'paymentAmount', message: 'Invalid amount (must be positive number)' });
        } else if (parseFloat(amount) <= 0) {
            errors.push({ field: 'paymentAmount', message: 'Amount must be greater than 0' });
        }
        
        if (!utils.isRequired(method)) {
            errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
        }
        
        // Show errors if any
        if (errors.length > 0) {
            errors.forEach(err => utils.showValidationError(err.field, err.message));
            return;
        }
        
        // Sanitize inputs
        const sanitizedData = {
            amount: parseFloat(amount),
            method: utils.sanitizeString(method),
            notes: utils.sanitizeString(notes),
            date: new Date().toISOString(),
            recordedBy: window.currentUserData.displayName
        };
        
        // Continue with save...
        utils.showLoading(true);
        
        await db.ref(`repairs/${repairId}/payments`).push(sanitizedData);
        
        utils.showLoading(false);
        utils.showSuccess('Payment recorded successfully!');
        
        // Refresh
        closePaymentModal();
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        
    } catch (error) {
        utils.showLoading(false);
        const friendlyError = utils.handleFirebaseError(error);
        utils.showError(friendlyError.message);
        console.error('Error saving payment:', error);
    }
}
```

---

## Example 3: User Creation Form

**Location:** [js/repairs.js](js/repairs.js) - `createUser` function

### Add This Validation:
```javascript
async function createUser() {
    try {
        // Clear previous errors
        utils.clearValidationErrors('userModal');
        
        // Get form data
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const displayName = document.getElementById('userDisplayName').value;
        const role = document.getElementById('userRole').value;
        
        // Validate
        const errors = [];
        
        if (!utils.isRequired(email)) {
            errors.push({ field: 'userEmail', message: 'Email is required' });
        } else if (!utils.isValidEmail(email)) {
            errors.push({ field: 'userEmail', message: 'Invalid email format' });
        }
        
        if (!utils.isRequired(password)) {
            errors.push({ field: 'userPassword', message: 'Password is required' });
        } else if (password.length < 6) {
            errors.push({ field: 'userPassword', message: 'Password must be at least 6 characters' });
        }
        
        if (!utils.isRequired(displayName)) {
            errors.push({ field: 'userDisplayName', message: 'Display name is required' });
        }
        
        if (!utils.isRequired(role)) {
            errors.push({ field: 'userRole', message: 'Role is required' });
        }
        
        // Show errors if any
        if (errors.length > 0) {
            errors.forEach(err => utils.showValidationError(err.field, err.message));
            return;
        }
        
        // Sanitize
        const sanitizedData = {
            email: utils.sanitizeString(email),
            displayName: utils.sanitizeString(displayName),
            role: utils.sanitizeString(role)
        };
        
        // Create user
        utils.showLoading(true);
        
        const userCredential = await auth.createUserWithEmailAndPassword(
            sanitizedData.email, 
            password
        );
        
        // Save user data
        await db.ref(`users/${userCredential.user.uid}`).set({
            ...sanitizedData,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid,
            status: 'active'
        });
        
        utils.showLoading(false);
        utils.showSuccess('User created successfully!');
        
        closeUserModal();
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        
    } catch (error) {
        utils.showLoading(false);
        const friendlyError = utils.handleFirebaseError(error);
        utils.showError(friendlyError.message);
        console.error('Error creating user:', error);
    }
}
```

---

## Example 4: Inventory Item Form

**Location:** [js/inventory.js](js/inventory.js) - `saveInventoryItem` function

### Add This Validation:
```javascript
async function saveInventoryItem() {
    try {
        // Clear previous errors
        utils.clearValidationErrors('inventoryModal');
        
        // Get form data
        const name = document.getElementById('itemName').value;
        const quantity = document.getElementById('itemQuantity').value;
        const price = document.getElementById('itemPrice').value;
        const supplier = document.getElementById('itemSupplier').value;
        
        // Validate
        const errors = [];
        
        if (!utils.isRequired(name)) {
            errors.push({ field: 'itemName', message: 'Item name is required' });
        }
        
        if (!utils.isRequired(quantity)) {
            errors.push({ field: 'itemQuantity', message: 'Quantity is required' });
        } else if (!utils.isValidNumber(quantity, 0)) {
            errors.push({ field: 'itemQuantity', message: 'Invalid quantity (must be 0 or positive)' });
        }
        
        if (!utils.isRequired(price)) {
            errors.push({ field: 'itemPrice', message: 'Price is required' });
        } else if (!utils.isValidPrice(price)) {
            errors.push({ field: 'itemPrice', message: 'Invalid price (must be positive number)' });
        }
        
        // Show errors if any
        if (errors.length > 0) {
            errors.forEach(err => utils.showValidationError(err.field, err.message));
            return;
        }
        
        // Sanitize
        const sanitizedData = {
            name: utils.sanitizeString(name),
            quantity: parseInt(quantity),
            price: parseFloat(price),
            supplier: utils.sanitizeString(supplier)
        };
        
        // Save
        utils.showLoading(true);
        
        await db.ref('inventory').push({
            ...sanitizedData,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser.uid
        });
        
        utils.showLoading(false);
        utils.showSuccess('Inventory item saved successfully!');
        
        closeInventoryModal();
        if (window.currentTabRefresh) {
            window.currentTabRefresh();
        }
        
    } catch (error) {
        utils.showLoading(false);
        const friendlyError = utils.handleFirebaseError(error);
        utils.showError(friendlyError.message);
        console.error('Error saving inventory item:', error);
    }
}
```

---

## 📝 Validation Patterns

### Pattern 1: Required Field
```javascript
if (!utils.isRequired(value)) {
    errors.push({ field: 'fieldId', message: 'Field is required' });
}
```

### Pattern 2: Email
```javascript
if (value && !utils.isValidEmail(value)) {
    errors.push({ field: 'emailField', message: 'Invalid email format' });
}
```

### Pattern 3: Phone
```javascript
if (!utils.isValidPhone(value)) {
    errors.push({ field: 'phoneField', message: 'Invalid phone format' });
}
```

### Pattern 4: Price/Amount
```javascript
if (!utils.isValidPrice(value)) {
    errors.push({ field: 'priceField', message: 'Must be positive number' });
}
```

### Pattern 5: Number Range
```javascript
if (!utils.isValidNumber(value, 1, 100)) {
    errors.push({ field: 'numberField', message: 'Must be between 1 and 100' });
}
```

### Pattern 6: Custom Validation
```javascript
if (value && value.length < 10) {
    errors.push({ field: 'fieldId', message: 'Must be at least 10 characters' });
}
```

---

## 🎨 Testing Validation

### Test in Browser Console:
```javascript
// Test validation functions
utils.isValidEmail('test@example.com'); // true
utils.isValidEmail('invalid'); // false

utils.isValidPhone('09123456789'); // true
utils.isValidPhone('12345'); // false

utils.isValidPrice(100); // true
utils.isValidPrice(-50); // false

utils.sanitizeString('<script>alert("xss")</script>');
// Returns: &lt;script&gt;alert("xss")&lt;/script&gt;

// Test error display
utils.showValidationError('customerName', 'Name is required');
utils.clearValidationErrors('receiveDeviceModal');

// Test toast notifications
utils.showError('This is an error');
utils.showSuccess('This is a success message');
```

---

## ✅ Implementation Checklist

For each form in your app:

```
□ Clear previous errors at start
□ Get all form data
□ Validate each field
□ Show errors if validation fails
□ Sanitize inputs before saving
□ Use try/catch for error handling
□ Show loading indicator during save
□ Hide loading on success/error
□ Use utils.showSuccess for success
□ Use utils.showError for errors
□ Handle Firebase errors with utils.handleFirebaseError
□ Refresh UI after successful save
```

---

## 🚀 Priority Order

**High Priority** (Do First):
1. ✅ Device Intake Form - Most used
2. ✅ Payment Form - Financial security
3. ✅ User Creation - Account security

**Medium Priority** (Do Soon):
4. ✅ Inventory Forms
5. ✅ Supplier Forms
6. ✅ Status Update Forms

**Low Priority** (Do Later):
7. ✅ Search/Filter Forms
8. ✅ Report Forms
9. ✅ Settings Forms

---

## 🆘 Quick Reference

### Common Validation Functions:
- `utils.isRequired(value)` - Check if not empty
- `utils.isValidEmail(email)` - Validate email format
- `utils.isValidPhone(phone)` - Validate Philippine phone
- `utils.isValidNumber(num, min, max)` - Validate number range
- `utils.isValidPrice(price)` - Validate price (≥0)

### Common UI Functions:
- `utils.showValidationError(fieldId, message)` - Show field error
- `utils.clearValidationErrors(containerId)` - Clear all errors
- `utils.showError(message)` - Show error toast
- `utils.showSuccess(message)` - Show success toast
- `utils.handleFirebaseError(error)` - Get friendly error message

### Common Security Functions:
- `utils.sanitizeString(input)` - Clean single string (XSS protection)
- `utils.sanitizeObject(obj)` - Clean all strings in object
- `requireAuth()` - Check if logged in
- `requireAdmin()` - Check if admin
- `hasPermission(action)` - Check specific permission

---

## 💡 Tips

1. **Always sanitize user input** before saving to database
2. **Clear previous errors** before showing new ones
3. **Use try/catch** for all async operations
4. **Hide loading indicator** in both success and error cases
5. **Show friendly error messages** using `utils.handleFirebaseError()`
6. **Test validation** by trying to submit invalid data
7. **Don't over-validate** - balance security with UX

---

**Remember:** Security is not a one-time task. Review and update validation as your app grows! 🔒
