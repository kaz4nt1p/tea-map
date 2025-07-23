'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityList } from '../../components/ActivityList';
import { ActivityForm } from '../../components/ActivityForm';
import { CreateActivityRequest, DashboardStats, PopularSpot, WeeklyStats, UserStats } from '../../lib/types';
import { Feather, TrendingUp, Users, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AvatarImage } from '../../components/AvatarImage';
import apiClient, { activitiesApi } from '../../lib/api';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    console.log('🔍 Dashboard auth check:', { isLoading, isAuthenticated, user: !!user });
    if (!isLoading && !isAuthenticated) {
      console.log('❌ Dashboard redirecting to /auth');
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router, user]);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  const [userStatsError, setUserStatsError] = useState<string | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      console.log('Fetching dashboard stats...');
      
      const response = await apiClient.get('/api/stats/dashboard');
      const data = response.data;
      
      console.log('Dashboard data received:', data);
      setDashboardStats(data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // More specific error messages
      if (error.code === 'NETWORK_ERROR') {
        setStatsError('Network error - check connection to backend');
      } else if (error.response?.status === 401) {
        setStatsError('Authentication error - please try logging in again');
      } else if (error.response?.status === 500) {
        setStatsError('Server error - please try again later');
      } else {
        setStatsError(`Failed to load statistics: ${error.message}`);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user?.id) {
      console.log('User stats fetch skipped - no user ID');
      return;
    }
    
    try {
      setUserStatsLoading(true);
      setUserStatsError(null);
      
      console.log('User stats fetch - user ID:', user.id);
      
      const response = await apiClient.get(`/api/stats/user/${user.id}`);
      const data = response.data;
      
      console.log('User stats data received:', data);
      setUserStats(data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      
      // More specific error messages
      if (error.code === 'NETWORK_ERROR') {
        setUserStatsError('Network error - check connection to backend');
      } else if (error.response?.status === 401) {
        setUserStatsError('Authentication error - please try logging in again');
      } else if (error.response?.status === 500) {
        setUserStatsError('Server error - please try again later');
      } else {
        setUserStatsError(`Failed to load statistics: ${error.message}`);
      }
    } finally {
      setUserStatsLoading(false);
    }
  };

  // Load dashboard stats when authentication is ready
  useEffect(() => {
    // Wait for authentication to be initialized before fetching stats
    if (!isLoading && isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isLoading, isAuthenticated]);

  // Load user stats when user is available
  useEffect(() => {
    if (user?.id && !isLoading && isAuthenticated) {
      fetchUserStats();
    }
  }, [user?.id, isLoading, isAuthenticated]);

  const handleCreateActivity = async (activityData: CreateActivityRequest) => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating activity with data:', activityData);
      
      const result = await activitiesApi.createActivity(activityData);
      console.log('Activity created successfully:', result);
      
      setShowActivityForm(false);
      // Refresh dashboard stats, user stats, and activity list
      fetchDashboardStats();
      fetchUserStats();
      setActivityRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating activity:', error);
      alert(`Ошибка при создании активности: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication or redirecting
  if (isLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Чайная лента
              </h1>
              <p className="text-gray-600">
                Последние чайные сессии сообщества
              </p>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setShowActivityForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Feather className="w-4 h-4 mr-2" />
                Записать сессию
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* User Profile Card */}
              {isAuthenticated && user && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push('/profile')}
                      className="hover:bg-green-200 transition-colors cursor-pointer rounded-full"
                    >
                      <AvatarImage
                        src={user.avatar_url}
                        alt={user.display_name || user.username}
                        className="w-12 h-12"
                        fallback={<Users className="w-6 h-6 text-white" />}
                      />
                    </button>
                    <div className="ml-4">
                      <button
                        onClick={() => router.push('/profile')}
                        className="text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {user.display_name || user.username}
                        </h3>
                        {user.username && (
                          <p className="text-sm text-gray-500">
                            @{user.username}
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p className="mt-4 text-sm text-gray-600">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    {userStatsLoading ? (
                      <div className="col-span-3 flex justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      </div>
                    ) : userStatsError ? (
                      <div className="col-span-3 text-center py-2">
                        <p className="text-red-600 text-xs mb-1">{userStatsError}</p>
                        <button
                          onClick={fetchUserStats}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          Повторить
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {userStats?.totalActivities || 0}
                          </div>
                          <div className="text-xs text-gray-500">Сессии</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {userStats?.totalSpots || 0}
                          </div>
                          <div className="text-xs text-gray-500">Споты</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">0</div>
                          <div className="text-xs text-gray-500">Друзья</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Быстрые действия
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/map')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <MapPin className="w-4 h-4 mr-3" />
                    Исследовать споты
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Мой профиль
                  </button>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Эта неделя
                </h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchDashboardStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Сессии</span>
                      <span className="text-sm font-semibold text-green-600">
                        {dashboardStats?.weeklyStats.activitiesCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Время</span>
                      <span className="text-sm font-semibold text-green-600">
                        {dashboardStats?.weeklyStats.totalDuration 
                          ? `${Math.round(dashboardStats.weeklyStats.totalDuration / 60 * 10) / 10} ч`
                          : '0 ч'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Новые споты</span>
                      <span className="text-sm font-semibold text-green-600">
                        {dashboardStats?.weeklyStats.newSpots || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityList 
              endpoint="/api/activities"
              emptyMessage="Пока нет активностей в ленте"
              showPagination={true}
              refreshKey={activityRefreshKey}
            />
          </div>

          {/* Right Sidebar - Community Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Popular Spots */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Популярные споты
                </h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchDashboardStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardStats?.popularSpots && dashboardStats.popularSpots.length > 0 ? (
                      dashboardStats.popularSpots.map((spot) => (
                        <button
                          key={spot.id}
                          onClick={() => router.push(`/map?spot=${spot.id}`)}
                          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {spot.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {spot.activityCount} {spot.activityCount === 1 ? 'сессия' : 'сессий'} эта неделя
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Нет популярных спотов на этой неделе</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Сообщество
                </h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="ml-2 text-sm text-gray-600">Загрузка...</span>
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchDashboardStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Активных участников</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboardStats?.communityStats?.activeUsers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Сессий сегодня</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboardStats?.communityStats?.sessionsToday || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Новых спотов</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboardStats?.communityStats?.newSpotsThisWeek || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <ActivityForm
          onSubmit={handleCreateActivity}
          onCancel={() => setShowActivityForm(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}