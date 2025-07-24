import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  privacy_level: string;
  created_at: string;
  updated_at?: string;
  _count?: {
    activities: number;
    spots: number;
    followers: number;
    following: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  display_name?: string;
  bio?: string;
}

// Token management - now uses HTTP-only cookies for security
export const tokenManager = {
  // Get access token - now checks if authenticated cookie exists
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    // Check if authentication cookie exists (tokens are in HTTP-only cookies)
    return document.cookie.includes('authenticated=true') ? 'http-only-cookie' : null;
  },

  // Set access token - deprecated, tokens now stored in HTTP-only cookies
  setAccessToken: (token: string): void => {
    // This is now handled by the backend setting HTTP-only cookies
    console.log('Token management now handled by HTTP-only cookies');
  },

  // Get token type - always Bearer for HTTP-only cookie auth
  getTokenType: (): string => {
    return 'Bearer';
  },

  // Set token type - deprecated, always Bearer
  setTokenType: (type: string): void => {
    // This is now handled by the backend
    console.log('Token type is always Bearer with HTTP-only cookies');
  },

  // Clear all tokens - clears authentication cookies and session flags
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    // Clear authentication cookies
    document.cookie = 'authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly';
    
    // Clear local authentication flags
    sessionStorage.removeItem('authSuccess');
    sessionStorage.removeItem('googleOAuthSuccess');
  },

  // Get authorization header - no longer needed with HTTP-only cookies
  getAuthHeader: (): string | null => {
    // HTTP-only cookies are automatically sent with requests
    return null;
  },

  // Save authentication response - updates user data and sets auth flag
  saveAuthResponse: (response: AuthResponse): void => {
    // Tokens are now stored in HTTP-only cookies by the backend
    // Store user data locally and set authentication flag
    userManager.setUser(response.user);
    
    // Set a local flag to indicate successful authentication 
    // This helps with immediate UI updates while cookies are being set
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authSuccess', 'true');
    }
  },

  // Check if user is authenticated - uses authentication cookie or session flag
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const cookieAuth = document.cookie.includes('authenticated=true');
    const authSuccess = sessionStorage.getItem('authSuccess') === 'true';
    const googleOAuthSuccess = sessionStorage.getItem('googleOAuthSuccess') === 'true';
    
    const result = cookieAuth || authSuccess || googleOAuthSuccess;
    
    // Authentication check complete
    
    return result;
  }
};

// User management
const USER_KEY = 'user';

export const userManager = {
  // Get user from localStorage
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Save user to localStorage
  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Clear user from localStorage
  clearUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  // Update user data
  updateUser: (updates: Partial<User>): void => {
    const currentUser = userManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      userManager.setUser(updatedUser);
    }
  }
};

// Authentication utilities
export const authUtils = {
  // Login and save response
  login: (response: AuthResponse): void => {
    tokenManager.saveAuthResponse(response);
    userManager.setUser(response.user);
  },

  // Logout and clear all data
  logout: (): void => {
    tokenManager.clearTokens();
    userManager.clearUser();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const tokenAuth = tokenManager.isAuthenticated();
    const userExists = !!userManager.getUser();
    const result = tokenAuth && userExists;
    
    // User and token authentication check complete
    
    return result;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return userManager.getUser();
  },

  // Update current user
  updateCurrentUser: (updates: Partial<User>): void => {
    userManager.updateUser(updates);
  }
};

// Password validation
export const passwordValidation = {
  validate: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Email validation
export const emailValidation = {
  validate: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Username validation
export const usernameValidation = {
  validate: (username: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!username || username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 30) {
      errors.push('Username must not exceed 30 characters');
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errors.push('Username must contain only letters and numbers');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};