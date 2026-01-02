// ===== CHART HELPERS - Simple Canvas-based Charts =====

/**
 * Create a line chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} data - Array of {label, value} objects
 * @param {Object} options - Chart options
 */
function createLineChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = options.padding || 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min/max values
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(0, Math.min(...values));
    const range = maxValue - minValue;
    
    // Calculate scales
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const xStep = chartWidth / (data.length - 1);
    const yScale = chartHeight / range;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = maxValue - (range / 5) * i;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y + 4);
    }
    
    // Draw line
    ctx.strokeStyle = options.lineColor || '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + xStep * index;
        const y = height - padding - (point.value - minValue) * yScale;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = options.pointColor || '#667eea';
    data.forEach((point, index) => {
        const x = padding + xStep * index;
        const y = height - padding - (point.value - minValue) * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        if (data.length <= 10 || index % Math.ceil(data.length / 10) === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(x, height - padding + 15);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(point.label, 0, 0);
            ctx.restore();
        }
    });
    
    // Draw title
    if (options.title) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.title, width / 2, 25);
    }
}

/**
 * Create a bar chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} data - Array of {label, value} objects
 * @param {Object} options - Chart options
 */
function createBarChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = options.padding || 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find max value
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Calculate scales
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    const yScale = chartHeight / maxValue;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw grid lines and Y-axis labels
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = maxValue - (maxValue / 5) * i;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y + 4);
    }
    
    // Draw bars
    data.forEach((item, index) => {
        const x = padding + (barWidth + barSpacing) * index + barSpacing / 2;
        const barHeight = item.value * yScale;
        const y = height - padding - barHeight;
        
        // Bar gradient
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, options.barColor || '#667eea');
        gradient.addColorStop(1, options.barColorEnd || '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Value on top of bar
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(item.value).toLocaleString(), x + barWidth / 2, y - 5);
        
        // Label below bar
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth / 2, height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(item.label, 0, 0);
        ctx.restore();
    });
    
    // Draw title
    if (options.title) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.title, width / 2, 25);
    }
}

/**
 * Create a pie chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} data - Array of {label, value, color} objects
 * @param {Object} options - Chart options
 */
function createPieChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }
    
    // Center and radius
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Draw title
    if (options.title) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.title, centerX, 25);
    }
    
    // Default colors
    const defaultColors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe', 
        '#43e97b', '#fa709a', '#ff9a56', '#feca57'
    ];
    
    // Draw slices
    let currentAngle = -Math.PI / 2; // Start at top
    
    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * Math.PI * 2;
        const color = item.color || defaultColors[index % defaultColors.length];
        
        // Draw slice
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw slice border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw percentage label on slice if big enough
        if (sliceAngle > 0.3) { // Only if slice > ~17 degrees
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            const percentage = ((item.value / total) * 100).toFixed(1);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, labelX, labelY);
        }
        
        currentAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = width - 150;
    let legendY = 50;
    const legendItemHeight = 25;
    
    data.forEach((item, index) => {
        const color = item.color || defaultColors[index % defaultColors.length];
        
        // Color box
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY, 15, 15);
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const percentage = ((item.value / total) * 100).toFixed(1);
        ctx.fillText(`${item.label}: ${percentage}%`, legendX + 20, legendY + 7);
        
        legendY += legendItemHeight;
    });
}

/**
 * Create a horizontal stacked bar chart for budget comparison
 */
function createBudgetComparisonChart(canvasId, budget, actual, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(budget, actual);
    const barHeight = 60;
    const startY = height / 2 - barHeight;
    const barWidth = width - 100;
    const startX = 50;
    
    // Draw budget bar
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(startX, startY, barWidth, barHeight);
    
    // Draw actual bar
    const actualWidth = (actual / maxValue) * barWidth;
    const isOverBudget = actual > budget;
    const gradient = ctx.createLinearGradient(startX, 0, startX + actualWidth, 0);
    
    if (isOverBudget) {
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ee5a6f');
    } else {
        gradient.addColorStop(0, '#51cf66');
        gradient.addColorStop(1, '#37b24d');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, actualWidth, barHeight);
    
    // Draw budget line
    const budgetX = startX + (budget / maxValue) * barWidth;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(budgetX, startY - 10);
    ctx.lineTo(budgetX, startY + barHeight + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // Budget label
    ctx.fillText('Budget', budgetX, startY - 20);
    ctx.font = '12px Arial';
    ctx.fillText(`₱${budget.toLocaleString()}`, budgetX, startY + barHeight + 25);
    
    // Actual label
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = isOverBudget ? '#ff6b6b' : '#51cf66';
    ctx.textAlign = 'left';
    ctx.fillText(`Actual: ₱${actual.toLocaleString()}`, startX, startY + barHeight + 50);
    
    // Variance
    const variance = budget - actual;
    const variancePercent = ((variance / budget) * 100).toFixed(1);
    ctx.font = '14px Arial';
    ctx.fillStyle = variance >= 0 ? '#51cf66' : '#ff6b6b';
    ctx.fillText(
        `${variance >= 0 ? 'Under' : 'Over'} budget by ₱${Math.abs(variance).toLocaleString()} (${Math.abs(variancePercent)}%)`,
        startX,
        startY + barHeight + 70
    );
}

// Export chart functions
window.createLineChart = createLineChart;
window.createBarChart = createBarChart;
window.createPieChart = createPieChart;
window.createBudgetComparisonChart = createBudgetComparisonChart;

console.log('✅ chart-helpers.js loaded');
