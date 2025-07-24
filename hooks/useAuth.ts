'use client';

import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Re-export the useAuth hook from context
export { useAuth } from '../contexts/AuthContext';

// Custom hook for protected routes
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router, isRedirecting]);

  return {
    isAuthenticated,
    isLoading: isLoading || isRedirecting,
    isRedirecting
  };
};

// Custom hook for authenticated routes (redirect to map if already authenticated)
export const useGuestOnly = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, isRedirecting]);

  return {
    isAuthenticated,
    isLoading: isLoading || isRedirecting,
    isRedirecting
  };
};

// Custom hook for authentication state with loading
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized: !isLoading
  };
};

// Custom hook for login/logout actions
export const useAuthActions = () => {
  const { login, register, logout, refreshProfile } = useAuthContext();
  
  return {
    login,
    register,
    logout,
    refreshProfile
  };
};

// Custom hook for user profile management
export const useUserProfile = () => {
  const { user, updateUser, refreshProfile } = useAuthContext();
  
  return {
    user,
    updateUser,
    refreshProfile
  };
};