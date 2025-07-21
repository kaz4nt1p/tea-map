// lib/types.ts
// Core data types for the Tea Map application

// User/Profile types
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  privacy_level: 'public' | 'friends' | 'private';
  google_id?: string;
  auth_provider: 'local' | 'google';
  created_at: string;
  updated_at: string;
}

// Activity types
export interface Activity {
  id: string;
  user_id: string;
  spot_id?: string;
  title: string;
  description?: string;
  tea_type?: string;
  tea_name?: string;
  tea_details?: {
    brewing_temperature?: number;
    steeping_time?: number;
    brewing_method?: string;
    tea_origin?: string;
  };
  mood_before?: string;
  mood_after?: string;
  taste_notes?: string;
  insights?: string;
  duration_minutes?: number;
  weather_conditions?: string;
  companions?: string[];
  privacy_level: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  
  // Related data (populated from joins)
  user?: User;
  spot?: Spot;
  media?: Media[];
  comments?: ActivityComment[];
  likes?: ActivityLike[];
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean; // if current user liked this activity
}

// Spot types
export interface Spot {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  long_description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  amenities?: {
    wifi?: boolean;
    parking?: boolean;
    restrooms?: boolean;
    seating?: boolean;
    shelter?: boolean;
  };
  accessibility_info?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Related data (populated from joins)
  creator?: User;
  activities?: Activity[];
  media?: Media[];
  activity_count?: number;
  recent_activities?: Activity[];
}

// Media types
export interface Media {
  id: string;
  user_id: string;
  activity_id?: string;
  spot_id?: string;
  file_path: string;
  file_type: 'image' | 'video';
  file_size: number;
  alt_text?: string;
  created_at: string;
  
  // Related data
  user?: User;
  activity?: Activity;
  spot?: Spot;
}

// Social types
export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
  
  // Related data
  follower?: User;
  following?: User;
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  activity?: Activity;
  user?: User;
}

export interface ActivityLike {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
  
  // Related data
  activity?: Activity;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'like' | 'comment' | 'new_activity' | 'mention';
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
  
  // Related data
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types for creating/updating
export interface CreateActivityRequest {
  spot_id?: string;
  title: string;
  description?: string;
  tea_type?: string;
  tea_name?: string;
  tea_details?: {
    brewing_temperature?: number;
    steeping_time?: number;
    brewing_method?: string;
    tea_origin?: string;
  };
  mood_before?: string;
  mood_after?: string;
  taste_notes?: string;
  insights?: string;
  duration_minutes?: number;
  weather_conditions?: string;
  companions?: string[];
  privacy_level?: 'public' | 'friends' | 'private';
}

export interface CreateSpotRequest {
  name: string;
  description?: string;
  long_description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  amenities?: {
    wifi?: boolean;
    parking?: boolean;
    restrooms?: boolean;
    seating?: boolean;
    shelter?: boolean;
  };
  accessibility_info?: string;
  image_url?: string;
}

// Statistics types
export interface WeeklyStats {
  activitiesCount: number;
  totalDuration: number; // in minutes
  newSpots: number;
}

export interface PopularSpot {
  id: string;
  name: string;
  activityCount: number;
}

export interface DashboardStats {
  weeklyStats: WeeklyStats;
  popularSpots: PopularSpot[];
  communityStats: CommunityStats;
}

export interface CommunityStats {
  activeUsers: number;
  sessionsToday: number;
  newSpotsThisWeek: number;
}

export interface TeaPreference {
  type: string;
  count: number;
  percentage: number;
}

export interface UserStats {
  totalActivities: number;
  totalSpots: number;
  totalDuration: number; // in minutes
  favoriteTeaType: string;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  weeklyDuration: number; // in minutes
  teaPreferences: TeaPreference[];
}

// Tea-specific types
export type TeaType = 
  | 'green'
  | 'black' 
  | 'white'
  | 'oolong'
  | 'pu-erh'
  | 'sencha'
  | 'matcha'
  | 'chai'
  | 'herbal'
  | 'other';

export const TEA_TYPES: { value: TeaType; label: string }[] = [
  { value: 'green', label: 'Зелёный чай' },
  { value: 'black', label: 'Чёрный чай' },
  { value: 'white', label: 'Белый чай' },
  { value: 'oolong', label: 'Улун' },
  { value: 'pu-erh', label: 'Пуэр' },
  { value: 'sencha', label: 'Сенча' },
  { value: 'matcha', label: 'Матча' },
  { value: 'chai', label: 'Чай' },
  { value: 'herbal', label: 'Травяной' },
  { value: 'other', label: 'Другое' }
];

export type MoodType = 'calm' | 'energetic' | 'contemplative' | 'social' | 'focused' | 'relaxed' | 'other';

export const MOOD_TYPES: { value: MoodType; label: string }[] = [
  { value: 'calm', label: 'Спокойствие' },
  { value: 'energetic', label: 'Энергичность' },
  { value: 'contemplative', label: 'Созерцательность' },
  { value: 'social', label: 'Общительность' },
  { value: 'focused', label: 'Сосредоточенность' },
  { value: 'relaxed', label: 'Расслабленность' },
  { value: 'other', label: 'Другое' }
];

// Legacy support - re-export old Spot type for backward compatibility
export type SpotLegacy = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  lat: number;
  lng: number;
  created_at?: string;
};