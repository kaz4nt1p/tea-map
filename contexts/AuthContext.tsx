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
  
  // Authentication state is now stable

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for authentication success/error from Google OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        const errorFromUrl = urlParams.get('error');
        const oauthSuccess = urlParams.get('oauth');
        
        // OAuth parameter detection
        
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
        
        // Handle Google OAuth success redirect
        if (oauthSuccess === 'success') {
          // Set flag to show success notification
          sessionStorage.setItem('googleOAuthSuccess', 'true');
          sessionStorage.setItem('authSuccess', 'true');
          
          // Clean up URL parameters
          const url = new URL(window.location.href);
          url.searchParams.delete('oauth');
          window.history.replaceState({}, '', url.toString());
          
          // Set authentication state immediately
          const storedUser = userManager.getUser();
          
          if (storedUser) {
            setUser(storedUser);
            
            // Show success notification immediately for stored user
            toast.success('Успешный вход через Google!');
            
            // Clear OAuth flag after showing notification
            setTimeout(() => {
              sessionStorage.removeItem('googleOAuthSuccess');
            }, 1000);
            
            setIsLoading(false);
            return;
          } else {
            // Try to fetch user profile if not stored locally
            try {
              const { user: googleUser } = await authApi.getProfile();
              setUser(googleUser);
              userManager.setUser(googleUser);
              
              // Show success notification
              toast.success('Успешный вход через Google!');
              
              // Clear OAuth flag after showing notification
              setTimeout(() => {
                sessionStorage.removeItem('googleOAuthSuccess');
              }, 1000);
              
              setIsLoading(false);
              return;
            } catch (error) {
              console.error('Failed to fetch user profile during OAuth:', error);
            }
          }
        }
        
        // OAuth handling is now done above, continue with normal auth flow
        
        // Check if user is stored locally
        const storedUser = authUtils.getCurrentUser();
        
        // FALLBACK: If we have auth cookie but no user, this might be a fresh OAuth without parameter
        const hasAuthCookie = document.cookie.includes('authenticated=true');
        if (hasAuthCookie && !storedUser && !oauthSuccess) {
          try {
            const { user: googleUser } = await authApi.getProfile();
            setUser(googleUser);
            userManager.setUser(googleUser);
            sessionStorage.setItem('authSuccess', 'true');
            toast.success('Успешный вход через Google!');
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('OAuth fallback failed:', error);
            // Clear invalid cookie
            document.cookie = 'authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        }
        
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
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Provide better feedback for rate limiting
      if (errorMessage.includes('Too many authentication attempts')) {
        errorMessage = 'Слишком много попыток входа. Попробуйте позже или обновите страницу.';
        
        // In development, automatically reset rate limit
        if (process.env.NODE_ENV !== 'production') {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            await fetch(`${backendUrl}/api/auth/reset-rate-limit`, { method: 'POST' });
            errorMessage += ' (Лимит сброшен для разработки)';
          } catch (resetError) {
            console.warn('Failed to reset rate limit:', resetError);
          }
        }
      }
      
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
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      // Provide better feedback for rate limiting
      if (errorMessage.includes('Too many authentication attempts')) {
        errorMessage = 'Слишком много попыток регистрации. Попробуйте позже или обновите страницу.';
        
        // In development, automatically reset rate limit
        if (process.env.NODE_ENV !== 'production') {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            await fetch(`${backendUrl}/api/auth/reset-rate-limit`, { method: 'POST' });
            errorMessage += ' (Лимит сброшен для разработки)';
          } catch (resetError) {
            console.warn('Failed to reset rate limit:', resetError);
          }
        }
      }
      
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