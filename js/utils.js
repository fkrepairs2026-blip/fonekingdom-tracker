// ===== UTILITY FUNCTIONS =====

const utils = {
    /**
     * Compress image to specified max width
     */
    compressImage: async function(file, maxWidth = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Format date and time
     */
    formatDateTime: function(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },
    
    /**
     * Format date only (no time)
     */
    formatDate: function(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    },
    
    /**
     * Get default avatar with initials
     */
    getDefaultAvatar: function(name) {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'
        ];
        
        const colorIndex = name.charCodeAt(0) % colors.length;
        const bgColor = colors[colorIndex];
        
        const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${bgColor}"/>
                <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
                    ${initials}
                </text>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },
    
    /**
     * Show/hide loading indicator
     */
    showLoading: function(show) {
        console.log(`🔄 showLoading called: ${show ? 'SHOW' : 'HIDE'}`);
        
        const loading = document.getElementById('loading');
        if (!loading) {
            console.warn('⚠️ Loading element not found');
            return;
        }
        
        if (show) {
            loading.style.display = 'flex';
            console.log('✅ Loading overlay shown');
        } else {
            // Triple-safe hiding
            loading.style.display = 'none';
            loading.style.visibility = 'hidden';
            loading.style.opacity = '0';
            console.log('✅ Loading overlay FORCE HIDDEN (triple safe)');
            
            // Force browser to recalculate
            void loading.offsetHeight;
        }
    },  // ✅ COMMA ADDED HERE!
    
    /**
     * Calculate days ago
     */
    daysAgo: function(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    },

    /**
     * Time ago (alias for daysAgo)
     */
    timeAgo: function(isoString) {
        return this.daysAgo(isoString);
    },
    
    /**
     * Format currency
     */
    formatCurrency: function(amount) {
        return '₱' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    
    /**
     * Validate email
     */
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Validate phone number (Philippine format)
     */
    isValidPhone: function(phone) {
        const re = /^(09|\+639)\d{9}$/;
        return re.test(phone.replace(/[\s-]/g, ''));
    },
    
    /**
     * Generate random ID
     */
    generateId: function(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * Deep clone object
     */
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Debounce function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Get device and browser information
     */
    getDeviceInfo: function() {
        const ua = navigator.userAgent;
        
        // Detect browser
        let browser = "Unknown";
        let browserVersion = "";
        if (ua.includes("Chrome") && !ua.includes("Edge")) {
            browser = "Chrome";
            const match = ua.match(/Chrome\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Firefox")) {
            browser = "Firefox";
            const match = ua.match(/Firefox\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
            browser = "Safari";
            const match = ua.match(/Version\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Edge")) {
            browser = "Edge";
            const match = ua.match(/Edge\/(\d+)/);
            browserVersion = match ? match[1] : "";
        } else if (ua.includes("Opera") || ua.includes("OPR")) {
            browser = "Opera";
        }
        
        // Detect OS
        let os = "Unknown";
        if (ua.includes("Windows NT 10")) os = "Windows 10/11";
        else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
        else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
        else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
        else if (ua.includes("Mac OS X")) {
            os = "macOS";
            const match = ua.match(/Mac OS X (\d+)[._](\d+)/);
            if (match) os = `macOS ${match[1]}.${match[2]}`;
        } else if (ua.includes("Android")) {
            os = "Android";
            const match = ua.match(/Android (\d+)/);
            if (match) os = `Android ${match[1]}`;
        } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
            os = "iOS";
            const match = ua.match(/OS (\d+)_(\d+)/);
            if (match) os = `iOS ${match[1]}.${match[2]}`;
        } else if (ua.includes("Linux")) {
            os = "Linux";
        }
        
        // Detect device type
        let deviceType = "Desktop";
        if (/Mobile|Android|iPhone|iPod/.test(ua)) {
            deviceType = "Mobile";
        } else if (/Tablet|iPad/.test(ua)) {
            deviceType = "Tablet";
        }
        
        return {
            browser: browserVersion ? `${browser} ${browserVersion}` : browser,
            os: os,
            deviceType: deviceType,
            userAgent: ua,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || navigator.userLanguage,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
};

// Export to global scope
window.utils = utils;

console.log('✅ utils.js loaded');
