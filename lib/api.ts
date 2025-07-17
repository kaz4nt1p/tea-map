import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { tokenManager, authUtils, AuthResponse, LoginData, RegisterData, User } from './auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refresh token cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authHeader = tokenManager.getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await apiClient.post('/api/auth/refresh');
        const authData: AuthResponse = refreshResponse.data.data;
        
        // Save new tokens
        tokenManager.saveAuthResponse(authData);
        
        // Update user data
        authUtils.updateCurrentUser(authData.user);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = tokenManager.getAuthHeader();
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authUtils.logout();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiError {
  error: string;
  code?: string;
  timestamp: string;
  path: string;
  method: string;
  details?: any[];
}

// Generic API call wrapper
const handleApiCall = async <T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await apiCall();
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError: ApiError = error.response.data;
      throw new Error(apiError.error || 'An error occurred');
    }
    throw error;
  }
};

// Authentication API
export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return handleApiCall(() => apiClient.post('/api/auth/register', data));
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    return handleApiCall(() => apiClient.post('/api/auth/login', data));
  },

  // Logout user
  logout: async (): Promise<void> => {
    return handleApiCall(() => apiClient.post('/api/auth/logout'));
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: User }> => {
    return handleApiCall(() => apiClient.get('/api/auth/me'));
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    return handleApiCall(() => apiClient.post('/api/auth/refresh'));
  }
};

// Spots API
export interface Spot {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  long_description: string;
  latitude: number;
  longitude: number;
  address?: string;
  amenities?: string[];
  accessibility_info?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  activities?: Activity[];
  _count: {
    activities: number;
  };
}

export interface CreateSpotData {
  name: string;
  description?: string;
  long_description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  amenities?: string[];
  accessibility_info?: string;
  image_url?: string;
}

export const spotsApi = {
  // Get all spots
  getSpots: async (): Promise<{ spots: Spot[] }> => {
    return handleApiCall(() => apiClient.get('/api/spots'));
  },

  // Get spot by ID
  getSpotById: async (id: string): Promise<{ spot: Spot }> => {
    return handleApiCall(() => apiClient.get(`/api/spots/${id}`));
  },

  // Create new spot
  createSpot: async (data: CreateSpotData): Promise<{ spot: Spot }> => {
    return handleApiCall(() => apiClient.post('/api/spots', data));
  },

  // Update spot
  updateSpot: async (id: string, data: Partial<CreateSpotData>): Promise<{ spot: Spot }> => {
    return handleApiCall(() => apiClient.put(`/api/spots/${id}`, data));
  },

  // Delete spot
  deleteSpot: async (id: string): Promise<void> => {
    return handleApiCall(() => apiClient.delete(`/api/spots/${id}`));
  },

  // Get spots by user
  getSpotsByUser: async (username: string): Promise<{ spots: Spot[]; user: User }> => {
    return handleApiCall(() => apiClient.get(`/api/spots/user/${username}`));
  }
};

// Activities API
export interface Activity {
  id: string;
  user_id: string;
  spot_id?: string;
  title: string;
  description?: string;
  tea_type?: string;
  tea_details?: any;
  mood_before?: string;
  mood_after?: string;
  taste_notes?: string;
  insights?: string;
  duration_minutes?: number;
  weather_conditions?: string;
  companions?: string[];
  privacy_level: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  spot?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
  media?: any[];
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface CreateActivityData {
  spot_id?: string;
  title: string;
  description?: string;
  tea_type?: string;
  tea_details?: any;
  mood_before?: string;
  mood_after?: string;
  taste_notes?: string;
  insights?: string;
  duration_minutes?: number;
  weather_conditions?: string;
  companions?: string[];
  privacy_level?: string;
}

export interface ActivityFeedResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const activitiesApi = {
  // Get activity feed
  getActivities: async (page = 1, limit = 20): Promise<ActivityFeedResponse> => {
    return handleApiCall(() => apiClient.get('/api/activities', { params: { page, limit } }));
  },

  // Get activity by ID
  getActivityById: async (id: string): Promise<{ activity: Activity }> => {
    return handleApiCall(() => apiClient.get(`/api/activities/${id}`));
  },

  // Create new activity
  createActivity: async (data: CreateActivityData): Promise<{ activity: Activity }> => {
    return handleApiCall(() => apiClient.post('/api/activities', data));
  },

  // Update activity
  updateActivity: async (id: string, data: Partial<CreateActivityData>): Promise<{ activity: Activity }> => {
    return handleApiCall(() => apiClient.put(`/api/activities/${id}`, data));
  },

  // Delete activity
  deleteActivity: async (id: string): Promise<void> => {
    return handleApiCall(() => apiClient.delete(`/api/activities/${id}`));
  },

  // Like/unlike activity
  toggleLike: async (id: string): Promise<{ liked: boolean }> => {
    return handleApiCall(() => apiClient.post(`/api/activities/${id}/like`));
  },

  // Get activities by user
  getActivitiesByUser: async (username: string, page = 1, limit = 20): Promise<ActivityFeedResponse & { user: User }> => {
    return handleApiCall(() => apiClient.get(`/api/activities/user/${username}`, { params: { page, limit } }));
  }
};

// Health check
export const healthApi = {
  // Check API health
  checkHealth: async (): Promise<any> => {
    return handleApiCall(() => apiClient.get('/'));
  }
};

export default apiClient;