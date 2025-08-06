// Device detection utilities

export function isMobileDevice() {
    // Check user agent for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const userAgentMatch = mobileRegex.test(navigator.userAgent);
    
    // Also check screen size as a fallback
    const screenSizeMatch = window.innerWidth < 768 || window.innerHeight < 600;
    
    // Check for touch support
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return userAgentMatch || (screenSizeMatch && touchSupport);
}

// Cache the result to avoid repeated calculations
let cachedIsMobile = null;

export function getIsMobile() {
    if (cachedIsMobile === null) {
        cachedIsMobile = isMobileDevice();
    }
    return cachedIsMobile;
}

// Listen for orientation changes which might affect mobile detection
window.addEventListener('orientationchange', () => {
    cachedIsMobile = null; // Reset cache on orientation change
});