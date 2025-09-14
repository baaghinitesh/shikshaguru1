import axios from 'axios';
import type { User, ApiResponse, LoginFormData, RegisterFormData } from '@/types';
import { API_BASE_URL, testApiConnectivity } from '@/config/api';

// Create axios instance with base configuration
let currentApiUrl = API_BASE_URL;

const api = axios.create({
  baseURL: currentApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update API base URL dynamically
const updateApiBaseUrl = async () => {
  try {
    const workingUrl = await testApiConnectivity();
    if (workingUrl !== currentApiUrl) {
      currentApiUrl = workingUrl;
      api.defaults.baseURL = workingUrl;
      console.log('🔄 Updated API base URL to:', workingUrl);
    }
  } catch (error) {
    console.error('❌ Failed to find working API URL:', error);
  }
};

// Test connectivity on service initialization
updateApiBaseUrl();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterFormData): Promise<AuthResponse> {
    console.log('🚀 Starting registration process');
    console.log('📊 Registration data:', { ...data, password: '[HIDDEN]' });
    console.log('🌐 Current API base URL:', api.defaults.baseURL);
    
    try {
      // Ensure we have the best API URL before making request
      await updateApiBaseUrl();
      console.log('✅ API URL confirmed:', api.defaults.baseURL);
      
      const requestPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      
      console.log('📤 Sending registration request to:', api.defaults.baseURL + '/auth/register');
      
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', requestPayload);
      
      console.log('📥 Registration response status:', response.status);
      console.log('📊 Registration response data:', response.data);

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('✅ Registration successful, tokens stored');
        return response.data.data;
      } else {
        console.error('❌ Registration failed:', response.data.message);
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If network error, try to find working API URL and retry
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.log('🔄 Network error detected, trying to find working API URL...');
        await updateApiBaseUrl();
        
        // Retry once with new URL
        try {
          console.log('🔄 Retrying registration with URL:', api.defaults.baseURL);
          const retryResponse = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
          });
          
          if (retryResponse.data.success && retryResponse.data.data) {
            const { accessToken, refreshToken } = retryResponse.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('✅ Registration successful on retry');
            return retryResponse.data.data;
          }
        } catch (retryError: any) {
          console.error('💥 Retry also failed:', retryError);
        }
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  /**
   * Login a user
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    console.log('🚀 Starting login process');
    console.log('📊 Login data:', { ...data, password: '[HIDDEN]' });
    console.log('🌐 Current API base URL:', api.defaults.baseURL);
    
    try {
      // Ensure we have the best API URL before making request
      await updateApiBaseUrl();
      console.log('✅ API URL confirmed:', api.defaults.baseURL);
      
      const requestPayload = {
        email: data.email,
        password: data.password,
      };
      
      console.log('📤 Sending login request to:', api.defaults.baseURL + '/auth/login');
      
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', requestPayload);
      
      console.log('📥 Login response status:', response.status);
      console.log('📊 Login response data:', response.data);

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('✅ Login successful, tokens stored');
        return response.data.data;
      } else {
        console.error('❌ Login failed:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If network error, try to find working API URL and retry
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.log('🔄 Network error detected, trying to find working API URL...');
        await updateApiBaseUrl();
        
        // Retry once with new URL
        try {
          console.log('🔄 Retrying login with URL:', api.defaults.baseURL);
          const retryResponse = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
            email: data.email,
            password: data.password,
          });
          
          if (retryResponse.data.success && retryResponse.data.data) {
            const { accessToken, refreshToken } = retryResponse.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('✅ Login successful on retry');
            return retryResponse.data.data;
          }
        } catch (retryError: any) {
          console.error('💥 Retry also failed:', retryError);
        }
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout request fails, we should clear local tokens
      console.error('Logout request failed:', error);
    } finally {
      // Always clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Failed to get user profile');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to get user profile');
      }
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<ApiResponse<{ accessToken: string }>>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken }
      );

      if (response.data.success && response.data.data) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', {
        email: data.email,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to send reset email');
      }
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(`/auth/reset-password/${data.token}`, {
        password: data.password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Password reset failed');
      }
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await api.put<ApiResponse>('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Password change failed');
      }
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await api.get<ApiResponse>(`/auth/verify-email/${token}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Email verification failed');
      }
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/resend-verification');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to resend verification email');
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;