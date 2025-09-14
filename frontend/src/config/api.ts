// API Configuration for different environments
const getApiBaseURL = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Debug logging
  console.log('Current hostname:', hostname);
  console.log('Current protocol:', protocol);
  console.log('Current port:', port);
  console.log('Current href:', window.location.href);
  
  // Try multiple API URL strategies
  const strategies = [];
  
  // Strategy 1: Use exact hostname with port 5001
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    strategies.push(`${protocol}//${hostname}:5001/api`);
  }
  
  // Strategy 2: For Clacky environment, try network IP
  if (hostname.includes('172.17.') || hostname.includes('clacky')) {
    strategies.push('http://172.17.0.45:5001/api');
  }
  
  // Strategy 3: Use relative URL (let browser handle it)
  if (port === '3001' || port === '3000') {
    const backendPort = port === '3001' ? '5001' : '5001';
    strategies.push(`${protocol}//${hostname}:${backendPort}/api`);
  }
  
  // Strategy 4: Default localhost for development
  strategies.push('http://localhost:5001/api');
  
  // Use the first strategy
  const apiUrl = strategies[0];
  console.log('Available strategies:', strategies);
  console.log('Using API URL:', apiUrl);
  
  return apiUrl;
};

// Also create a function to test connectivity
export const testApiConnectivity = async (): Promise<string> => {
  const strategies = [
    'http://172.17.0.45:5001/api',
    `${window.location.protocol}//${window.location.hostname}:5001/api`,
    'http://localhost:5001/api'
  ];
  
  for (const url of strategies) {
    try {
      console.log('Testing API URL:', url);
      const response = await fetch(`${url.replace('/api', '')}/health`, { 
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        console.log('✅ API URL works:', url);
        return url;
      }
    } catch (error) {
      console.log('❌ API URL failed:', url, error);
    }
  }
  
  throw new Error('No working API URL found');
};

export const API_BASE_URL = getApiBaseURL();

// Initialize connectivity test
testApiConnectivity().then(workingUrl => {
  console.log('Confirmed working API URL:', workingUrl);
}).catch(error => {
  console.error('No API connectivity found:', error);
});
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