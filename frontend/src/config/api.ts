// API Configuration for different environments
const getApiBaseURL = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Try multiple API URL strategies
  const strategies = [];
  
  // Strategy 1: Clacky Preview Environment - Direct backend URL
  if (hostname.includes('clackypaas.com')) {
    // Extract the preview ID from hostname like: 3001-1da9b5ab82d5-web.clackypaas.com
    const match = hostname.match(/^3001-([a-f0-9]+)-web\.clackypaas\.com$/);
    if (match) {
      const previewId = match[1];
      strategies.push(`https://5001-${previewId}-web.clackypaas.com/api`);
    }
    // Fallback: Use Vite proxy as backup
    strategies.push('/api');
  }
  
  // Strategy 2: For local Clacky container environment
  if (hostname.includes('172.17.') || hostname.includes('clacky')) {
    strategies.push('http://172.17.0.45:5001/api');
  }
  
  // Strategy 3: Use exact hostname with port 5001 (for other non-localhost)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('clackypaas.com')) {
    strategies.push(`${protocol}//${hostname}:5001/api`);
  }
  
  // Strategy 4: Default localhost for development
  strategies.push('http://localhost:5001/api');
  
  // Use the first strategy
  const apiUrl = strategies[0];
  
  return apiUrl;
};



export const API_BASE_URL = getApiBaseURL();


export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar'
  }
};