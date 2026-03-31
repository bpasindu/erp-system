// Centralized API configuration
const getApiBaseUrl = () => {
    // Check if we are running in production (on Render/Cloudflare) or locally
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }
    // Production Render URL
    return 'https://erp-backend-e9tc.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
