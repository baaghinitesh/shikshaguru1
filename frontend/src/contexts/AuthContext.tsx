import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType, RegisterFormData, ProfileFormData, ThemePreference } from '@/types';
import { authService } from '@/services/authService';

// Auth State Interface
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INITIALIZE_COMPLETE' };

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  initialized: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'INITIALIZE_COMPLETE':
      return {
        ...state,
        initialized: true,
        loading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      // Check if user has valid token
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error: any) {
      console.error('Auth initialization failed:', error);
      // Clear invalid tokens
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'INITIALIZE_COMPLETE' });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.register(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (data: Partial<ProfileFormData>): Promise<void> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // This would typically call a profile update API endpoint
      // For now, we'll just update the current user data
      if (state.user) {
        const updatedUser: User = {
          ...state.user,
          name: data.name || state.user.name,
          // Add other updatable fields as needed
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const updateTheme = async (theme: Partial<ThemePreference>): Promise<void> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      // This would typically call a theme update API endpoint
      // For now, we'll just update the current user's theme
      if (state.user) {
        const updatedUser: User = {
          ...state.user,
          theme: {
            ...state.user.theme,
            ...theme,
          } as ThemePreference,
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Provide context value
  const value: AuthContextType = {
    user: state.user,
    loading: state.loading,
    login,
    register,
    logout,
    updateProfile,
    updateTheme,
  };

  // Don't render children until auth is initialized
  if (!state.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook to get user data with loading state
export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

// Hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { user } = useAuth();
  return !!user;
};

// Hook to check user role
export const useUserRole = (): 'student' | 'teacher' | 'admin' | null => {
  const { user } = useAuth();
  return user?.role || null;
};

// Hook to check if user has specific role
export const useHasRole = (role: 'student' | 'teacher' | 'admin'): boolean => {
  const { user } = useAuth();
  return user?.role === role;
};

export default AuthContext;