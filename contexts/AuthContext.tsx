'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse, LoginData, RegisterData, authUtils, tokenManager, userManager } from '../lib/auth';
import { authApi } from '../lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && authUtils.isAuthenticated();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in URL parameters (Google OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const errorFromUrl = urlParams.get('error');
        
        // Handle OAuth errors
        if (errorFromUrl) {
          console.error('Google OAuth error:', errorFromUrl);
          let errorMessage = 'Ошибка при входе через Google';
          
          switch (errorFromUrl) {
            case 'google_oauth_failed':
              errorMessage = 'Ошибка авторизации Google';
              break;
            case 'no_user':
              errorMessage = 'Не удалось получить данные пользователя';
              break;
            case 'authentication_failed':
              errorMessage = 'Ошибка аутентификации';
              break;
          }
          
          toast.error(errorMessage);
          
          // Clean up URL parameters
          const url = new URL(window.location.href);
          url.searchParams.delete('error');
          window.history.replaceState({}, '', url.toString());
          
          setIsLoading(false);
          return;
        }
        
        if (tokenFromUrl) {
          try {
            // Store the token and get user profile
            tokenManager.setAccessToken(tokenFromUrl);
            tokenManager.setTokenType('Bearer');
            const { user: googleUser } = await authApi.getProfile();
            setUser(googleUser);
            userManager.setUser(googleUser);
            
            // Clean up URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
            
            toast.success('Успешный вход через Google!');
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Google OAuth token processing error:', error);
            toast.error('Ошибка при входе через Google');
            tokenManager.clearTokens();
          }
        }
        
        // Check if user is stored locally
        const storedUser = authUtils.getCurrentUser();
        
        if (storedUser && authUtils.isAuthenticated()) {
          setUser(storedUser);
          
          // Try to refresh profile to ensure it's up to date
          try {
            const { user: updatedUser } = await authApi.getProfile();
            setUser(updatedUser);
            authUtils.updateCurrentUser(updatedUser);
          } catch (error) {
            // If profile refresh fails, keep the stored user
            console.warn('Failed to refresh profile on init:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid authentication state
        authUtils.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authApi.login(data);
      
      // Save authentication data
      authUtils.login(response);
      setUser(response.user);
      
      toast.success('Successfully logged in!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authApi.register(data);
      
      // Save authentication data
      authUtils.login(response);
      setUser(response.user);
      
      toast.success('Successfully registered!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint
      await authApi.logout();
      
      // Clear local authentication state
      authUtils.logout();
      setUser(null);
      
      toast.success('Successfully logged out');
      
      // Redirect to login page
      router.push('/auth');
    } catch (error) {
      // Even if logout API call fails, clear local state
      authUtils.logout();
      setUser(null);
      
      console.error('Logout error:', error);
      toast.error('Logout completed');
      
      // Redirect to login page even on error
      router.push('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (!isAuthenticated) return;
      
      const { user: updatedUser } = await authApi.getProfile();
      setUser(updatedUser);
      authUtils.updateCurrentUser(updatedUser);
    } catch (error) {
      console.error('Profile refresh error:', error);
      // Don't show error toast for profile refresh failures
    }
  };

  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      authUtils.updateCurrentUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};