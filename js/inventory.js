// ===== INVENTORY MANAGEMENT MODULE =====

/**
 * Global inventory data
 */
window.allInventoryItems = [];
window.allSuppliers = [];
window.stockMovements = [];

/**
 * Load all inventory items from Firebase
 */
async function loadInventory() {
    return new Promise((resolve, reject) => {
        const inventoryRef = db.ref('inventory');
        
        inventoryRef.once('value', (snapshot) => {
            window.allInventoryItems = [];
            
            snapshot.forEach((childSnapshot) => {
                const item = childSnapshot.val();
                item.id = childSnapshot.key;
                window.allInventoryItems.push(item);
            });
            
            console.log('✅ Inventory loaded:', window.allInventoryItems.length, 'items');
            resolve();
        }, (error) => {
            console.error('❌ Error loading inventory:', error);
            reject(error);
        });
    });
}

/**
 * Load all suppliers from Firebase
 */
async function loadSuppliers() {
    return new Promise((resolve, reject) => {
        const suppliersRef = db.ref('suppliers');
        
        suppliersRef.once('value', (snapshot) => {
            window.allSuppliers = [];
            
            snapshot.forEach((childSnapshot) => {
                const supplier = childSnapshot.val();
                supplier.id = childSnapshot.key;
                window.allSuppliers.push(supplier);
            });
            
            console.log('✅ Suppliers loaded:', window.allSuppliers.length, 'suppliers');
            resolve();
        }, (error) => {
            console.error('❌ Error loading suppliers:', error);
            reject(error);
        });
    });
}

/**
 * Load stock movements from Firebase
 */
async function loadStockMovements() {
    return new Promise((resolve, reject) => {
        const movementsRef = db.ref('stockMovements');
        
        movementsRef.orderByChild('timestamp').limitToLast(500).once('value', (snapshot) => {
            window.stockMovements = [];
            
            snapshot.forEach((childSnapshot) => {
                const movement = childSnapshot.val();
                movement.id = childSnapshot.key;
                window.stockMovements.push(movement);
            });
            
            // Sort by timestamp descending (most recent first)
            window.stockMovements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log('✅ Stock movements loaded:', window.stockMovements.length, 'movements');
            resolve();
        }, (error) => {
            console.error('❌ Error loading stock movements:', error);
            reject(error);
        });
    });
}

/**
 * Add new inventory item
 */
async function addInventoryItem(itemData) {
    try {
        utils.showLoading(true);
        
        // Validate required fields
        if (!itemData.partName || !itemData.partNumber || !itemData.category) {
            throw new Error('Part name, part number, and category are required');
        }
        
        // Check for duplicate part number
        const existingItem = window.allInventoryItems.find(item => 
            item.partNumber.toLowerCase() === itemData.partNumber.toLowerCase() && !item.deleted
        );
        
        if (existingItem) {
            throw new Error('Part number already exists');
        }
        
        const newItem = {
            partName: itemData.partName,
            partNumber: itemData.partNumber,
            category: itemData.category,
            brand: itemData.brand || '',
            model: itemData.model || '',
            supplier: itemData.supplier || '',
            quantity: parseInt(itemData.quantity) || 0,
            minStockLevel: parseInt(itemData.minStockLevel) || 5,
            unitCost: parseFloat(itemData.unitCost) || 0,
            sellingPrice: parseFloat(itemData.sellingPrice) || 0,
            location: itemData.location || '',
            notes: itemData.notes || '',
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName,
            deleted: false
        };
        
        const newRef = await db.ref('inventory').push(newItem);
        const itemId = newRef.key;
        
        // Log activity
        await logActivity('inventory_added', {
            itemId: itemId,
            partName: newItem.partName,
            partNumber: newItem.partNumber,
            quantity: newItem.quantity
        });
        
        utils.showLoading(false);
        utils.showToast('success', 'Part Added', `${newItem.partName} has been added to inventory`);
        
        // Reload inventory
        await loadInventory();
        
        // Firebase listener will auto-refresh the page
        
        return itemId;
    } catch (error) {
        utils.showLoading(false);
        console.error('Error adding inventory item:', error);
        alert('Error adding inventory item: ' + error.message);
        throw error;
    }
}

/**
 * Update inventory item
 */
async function updateInventoryItem(itemId, updates) {
    try {
        utils.showLoading(true);
        
        updates.lastUpdated = new Date().toISOString();
        updates.lastUpdatedBy = window.currentUserData.displayName;
        
        await db.ref(`inventory/${itemId}`).update(updates);
        
        // Log activity
        await logActivity('inventory_updated', {
            itemId: itemId,
            updates: updates
        });
        
        utils.showLoading(false);
        utils.showToast('success', 'Part Updated', 'Inventory item has been updated');
        
        // Reload inventory
        await loadInventory();
        
        // Firebase listener will auto-refresh the page
    } catch (error) {
        utils.showLoading(false);
        console.error('Error updating inventory item:', error);
        alert('Error updating inventory item: ' + error.message);
        throw error;
    }
}

/**
 * Delete inventory item (soft delete)
 */
async function deleteInventoryItem(itemId) {
    try {
        const item = window.allInventoryItems.find(i => i.id === itemId);
        
        if (!item) {
            throw new Error('Item not found');
        }
        
        if (!confirm(`Delete ${item.partName}?\n\nThis will mark it as deleted but keep the records.`)) {
            return;
        }
        
        utils.showLoading(true);
        
        await db.ref(`inventory/${itemId}`).update({
            deleted: true,
            deletedAt: new Date().toISOString(),
            deletedBy: window.currentUserData.displayName
        });
        
        // Log activity
        await logActivity('inventory_deleted', {
            itemId: itemId,
            partName: item.partName,
            partNumber: item.partNumber
        });
        
        utils.showLoading(false);
        utils.showToast('success', 'Part Deleted', `${item.partName} has been removed`);
        
        // Reload inventory
        await loadInventory();
        
        // Firebase listener will auto-refresh the page
    } catch (error) {
        utils.showLoading(false);
        console.error('Error deleting inventory item:', error);
        alert('Error deleting inventory item: ' + error.message);
        throw error;
    }
}

/**
 * Adjust stock level (increase or decrease)
 */
async function adjustStock(itemId, adjustment, reason) {
    try {
        utils.showLoading(true);
        
        const item = window.allInventoryItems.find(i => i.id === itemId);
        
        if (!item) {
            throw new Error('Item not found');
        }
        
        const newQuantity = (item.quantity || 0) + adjustment;
        
        if (newQuantity < 0) {
            throw new Error('Cannot reduce stock below zero');
        }
        
        // Update quantity
        await db.ref(`inventory/${itemId}`).update({
            quantity: newQuantity,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: window.currentUserData.displayName
        });
        
        // Log stock movement
        await db.ref('stockMovements').push({
            itemId: itemId,
            partName: item.partName,
            partNumber: item.partNumber,
            adjustment: adjustment,
            previousQuantity: item.quantity,
            newQuantity: newQuantity,
            reason: reason || 'Manual adjustment',
            performedBy: window.currentUserData.displayName,
            timestamp: new Date().toISOString()
        });
        
        // Log activity
        await logActivity('stock_adjusted', {
            itemId: itemId,
            partName: item.partName,
            adjustment: adjustment,
            reason: reason
        });
        
        utils.showLoading(false);
        
        const message = adjustment > 0 
            ? `Added ${adjustment} units to stock` 
            : `Removed ${Math.abs(adjustment)} units from stock`;
        
        utils.showToast('success', 'Stock Adjusted', message);
        
        // Reload inventory
        await loadInventory();
        
        // Firebase listener will auto-refresh the page
    } catch (error) {
        utils.showLoading(false);
        console.error('Error adjusting stock:', error);
        alert('Error adjusting stock: ' + error.message);
        throw error;
    }
}

/**
 * Use part in a repair (decrease stock)
 */
async function usePartInRepair(itemId, quantity, repairId) {
    try {
        const item = window.allInventoryItems.find(i => i.id === itemId);
        
        if (!item) {
            throw new Error('Item not found');
        }
        
        if (item.quantity < quantity) {
            throw new Error(`Not enough stock. Available: ${item.quantity}, Required: ${quantity}`);
        }
        
        // Decrease stock
        await adjustStock(itemId, -quantity, `Used in repair #${repairId}`);
        
        // Record part usage in repair
        await db.ref(`repairs/${repairId}/partsUsed`).push({
            itemId: itemId,
            partName: item.partName,
            partNumber: item.partNumber,
            quantity: quantity,
            unitCost: item.unitCost,
            totalCost: item.unitCost * quantity,
            usedBy: window.currentUserData.displayName,
            usedAt: new Date().toISOString()
        });
        
        return true;
    } catch (error) {
        console.error('Error using part in repair:', error);
        throw error;
    }
}

/**
 * Get low stock items
 */
function getLowStockItems() {
    return window.allInventoryItems.filter(item => 
        !item.deleted && 
        item.quantity <= item.minStockLevel
    );
}

/**
 * Get out of stock items
 */
function getOutOfStockItems() {
    return window.allInventoryItems.filter(item => 
        !item.deleted && 
        item.quantity === 0
    );
}

/**
 * Add new supplier
 */
async function addSupplier(supplierData) {
    try {
        utils.showLoading(true);
        
        if (!supplierData.supplierName) {
            throw new Error('Supplier name is required');
        }
        
        const newSupplier = {
            supplierName: supplierData.supplierName,
            contactPerson: supplierData.contactPerson || '',
            phone: supplierData.phone || '',
            email: supplierData.email || '',
            address: supplierData.address || '',
            notes: supplierData.notes || '',
            createdAt: new Date().toISOString(),
            createdBy: window.currentUserData.displayName,
            deleted: false
        };
        
        const newRef = await db.ref('suppliers').push(newSupplier);
        const supplierId = newRef.key;
        
        utils.showLoading(false);
        utils.showToast('success', 'Supplier Added', `${newSupplier.supplierName} has been added`);
        
        // Reload suppliers
        await loadSuppliers();
        
        // Firebase listener will auto-refresh the page
        
        return supplierId;
    } catch (error) {
        utils.showLoading(false);
        console.error('Error adding supplier:', error);
        alert('Error adding supplier: ' + error.message);
        throw error;
    }
}

/**
 * Update supplier
 */
async function updateSupplier(supplierId, updates) {
    try {
        utils.showLoading(true);
        
        updates.lastUpdated = new Date().toISOString();
        updates.lastUpdatedBy = window.currentUserData.displayName;
        
        await db.ref(`suppliers/${supplierId}`).update(updates);
        
        utils.showLoading(false);
        utils.showToast('success', 'Supplier Updated', 'Supplier information has been updated');
        
        // Reload suppliers
        await loadSuppliers();
        
        // Firebase listener will auto-refresh the page
    } catch (error) {
        utils.showLoading(false);
        console.error('Error updating supplier:', error);
        alert('Error updating supplier: ' + error.message);
        throw error;
    }
}

/**
 * Delete supplier (soft delete)
 */
async function deleteSupplier(supplierId) {
    try {
        const supplier = window.allSuppliers.find(s => s.id === supplierId);
        
        if (!supplier) {
            throw new Error('Supplier not found');
        }
        
        if (!confirm(`Delete ${supplier.supplierName}?\n\nThis will mark it as deleted but keep the records.`)) {
            return;
        }
        
        utils.showLoading(true);
        
        await db.ref(`suppliers/${supplierId}`).update({
            deleted: true,
            deletedAt: new Date().toISOString(),
            deletedBy: window.currentUserData.displayName
        });
        
        utils.showLoading(false);
        utils.showToast('success', 'Supplier Deleted', `${supplier.supplierName} has been removed`);
        
        // Reload suppliers
        await loadSuppliers();
        
        // Firebase listener will auto-refresh the page
    } catch (error) {
        utils.showLoading(false);
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier: ' + error.message);
        throw error;
    }
}

// Export functions to window
window.loadInventory = loadInventory;
window.loadSuppliers = loadSuppliers;
window.loadStockMovements = loadStockMovements;
window.addInventoryItem = addInventoryItem;
window.updateInventoryItem = updateInventoryItem;
window.deleteInventoryItem = deleteInventoryItem;
window.adjustStock = adjustStock;
window.usePartInRepair = usePartInRepair;
window.getLowStockItems = getLowStockItems;
window.getOutOfStockItems = getOutOfStockItems;
window.addSupplier = addSupplier;
window.updateSupplier = updateSupplier;
window.deleteSupplier = deleteSupplier;

