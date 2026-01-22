import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthResponse, UserProfileUpdate, RegisterResponse } from '../types/User';
import * as authApi from '../services/authApi';
import { verifyGooglePhone } from '../services/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse | void>;
  googleSignIn: (credential: string) => Promise<{
    requirePhoneVerification: boolean;
    userId?: string;
    email?: string;
    name?: string;
    user?: User;
    token?: string;
  }>;
  verifyGooglePhone: (data: { userId: string; phone: string }) => Promise<any>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (data: UserProfileUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function - memoized to prevent unnecessary re-renders
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.loginUser(credentials);
      
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Register function - memoized to prevent unnecessary re-renders
  const register = useCallback(async (data: RegisterData): Promise<RegisterResponse | void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.registerUser(data);
      return response; // Return the response for OTP handling
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const googleSignIn = useCallback(async (credential: string): Promise<{
    requirePhoneVerification: boolean;
    userId?: string;
    email?: string;
    name?: string;
    user?: User;
    token?: string;
  }> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.googleSignIn(credential);
      
      if (!response.success) {
        throw new Error(response.message || 'Google sign-in failed');
      }

      // Handle successful login with token
      if (response.data?.token && response.data.user) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        return { 
          requirePhoneVerification: false,
          user,
          token
        };
      }

      // Handle phone verification requirement
      if (response.requirePhoneVerification && response.data) {
        return {
          requirePhoneVerification: true,
          userId: response.data.userId,
          email: response.data.email,
          name: response.data.name
        };
      }

      // Fallback error
      throw new Error('Unexpected response format from server');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Google sign-in failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Logout function - memoized to prevent unnecessary re-renders
  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Load user profile - memoized to prevent unnecessary re-renders
  const loadUser = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.getCurrentUser();
      
      const { user } = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load user';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  // Refresh user data - Added this function
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; // Silently return if no token
      }
      
      const response = await authApi.getCurrentUser();
      const { user } = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error: any) {
      console.error('Error refreshing user data:', error);
      // Don't dispatch error for refresh failures to avoid disrupting user experience
    }
  }, []);

  // Update profile - memoized to prevent unnecessary re-renders
  const updateProfile = useCallback(async (data: UserProfileUpdate): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.updateProfile(data);
      
      const { user } = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  // Clear error function - memoized to prevent unnecessary re-renders
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    refreshUser, // Added this line
    clearError,
    googleSignIn,
    verifyGooglePhone,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};