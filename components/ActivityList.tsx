'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ApiResponse, PaginatedResponse } from '../lib/types';
import { ActivityCard } from './ActivityCard';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import apiClient from '../lib/api';

interface ActivityListProps {
  activities?: Activity[];
  endpoint?: string; // API endpoint to fetch activities
  emptyMessage?: string;
  onActivityClick?: (activity: Activity) => void;
  showPagination?: boolean;
  limit?: number;
  refreshKey?: number; // Key to trigger refresh
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities: initialActivities,
  endpoint,
  emptyMessage = "Пока нет активностей",
  onActivityClick,
  showPagination = true,
  limit = 20,
  refreshKey
}) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();

  // Fetch activities from API
  const fetchActivities = async (pageNum: number = 1, refresh = false) => {
    if (!endpoint) return;
    
    setLoading(pageNum === 1 && !refresh);
    setRefreshing(refresh);
    setError(null);
    
    try {
      console.log('Fetching activities from:', `${endpoint}?page=${pageNum}&limit=${limit}`);
      
      const response = await apiClient.get(`${endpoint}?page=${pageNum}&limit=${limit}`);
      const data = response.data;
      
      console.log('Response data:', data);
      
      if (data.data) {
        console.log('Data structure:', data.data);
        const newActivities = data.data.data;
        console.log('New activities:', newActivities);
        
        if (!newActivities || !Array.isArray(newActivities)) {
          console.error('Invalid activities data:', newActivities);
          throw new Error('Invalid activities data format');
        }
        
        if (pageNum === 1 || refresh) {
          setActivities(newActivities);
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }
        
        setHasMore(pageNum < data.data.pagination.pages);
        setTotalPages(data.data.pagination.pages);
        setPage(pageNum);
      } else {
        console.error('Missing data.data in response:', data);
        throw new Error('Missing data in response');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (endpoint && !initialActivities) {
      fetchActivities(1);
    }
  }, [endpoint]);

  // Auto-refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey && endpoint) {
      fetchActivities(1, true);
    }
  }, [refreshKey]);

  // Refresh activities
  const handleRefresh = () => {
    if (endpoint) {
      fetchActivities(1, true);
    }
  };

  // Load more activities
  const handleLoadMore = () => {
    if (endpoint && hasMore && !loading) {
      fetchActivities(page + 1);
    }
  };

  // Handle activity click
  const handleActivityClick = (activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      router.push(`/activities/${activity.id}`);
      // Ensure scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle user click
  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
    // Ensure scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Handle spot click
  const handleSpotClick = (spotId: string) => {
    router.push(`/map?spot=${spotId}`);
    // Ensure scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (loading && (!activities || activities.length === 0)) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">{emptyMessage}</div>
        {endpoint && (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Обновить
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      {endpoint && (
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      )}

      {/* Activity cards */}
      <div className="space-y-4">
        {activities?.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onActivityClick={handleActivityClick}
            onUserClick={handleUserClick}
            onSpotClick={handleSpotClick}
          />
        ))}
      </div>

      {/* Load more button */}
      {showPagination && hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Загрузка...
              </div>
            ) : (
              'Загрузить ещё'
            )}
          </button>
        </div>
      )}

      {/* Pagination info */}
      {showPagination && totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          Страница {page} из {totalPages}
        </div>
      )}
    </div>
  );
};

export default ActivityList;