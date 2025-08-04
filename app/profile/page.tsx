'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityList } from '../../components/ActivityList';
import { ActivityForm } from '../../components/ActivityForm';
import { CreateActivityRequest, UserStats, TEA_TYPES } from '../../lib/types';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, TrendingUp, Users, Feather, Loader2 } from 'lucide-react';
import { AvatarImage } from '../../components/AvatarImage';
import apiClient, { activitiesApi } from '../../lib/api';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const response = await apiClient.get(`/api/stats/user/${user.id}`);
      const data = response.data;
      
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStatsError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Load user stats when user is available
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  const handleCreateActivity = async (activityData: CreateActivityRequest) => {
    setIsSubmitting(true);
    try {
      const result = await activitiesApi.createActivity(activityData);
      console.log('Activity created successfully:', result);

      setShowActivityForm(false);
      // Refresh user stats and activity list
      fetchUserStats();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Ошибка при создании активности');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="py-6">
            <div className="space-y-4 lg:space-y-0">
              {/* Mobile: Stack vertically with proper spacing */}
              <div className="flex items-center lg:hidden">
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="w-12 h-12"
                  fallback={<Users className="w-6 h-6 text-white" />}
                />
                <div className="ml-3 flex-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user.display_name || user.username}
                  </h1>
                  {user.username && (
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  )}
                  {user.bio && (
                    <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
                  )}
                </div>
              </div>
              
              {/* Mobile: Button row with full width */}
              <div className="flex justify-center lg:hidden">
                <button
                  onClick={() => setShowActivityForm(true)}
                  className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Feather className="w-4 h-4 mr-2" />
                  <span>Записать сессию</span>
                </button>
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden lg:flex lg:items-center lg:justify-between">
                <div className="flex items-center">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.display_name || user.username}
                    className="w-16 h-16"
                    fallback={<Users className="w-8 h-8 text-white" />}
                  />
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.display_name || user.username}
                    </h1>
                    {user.username && (
                      <p className="text-base text-gray-600">@{user.username}</p>
                    )}
                    {user.bio && (
                      <p className="text-base text-gray-700 mt-2">{user.bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="flex items-center px-4 py-2 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Feather className="w-4 h-4 mr-2" />
                    <span>Записать сессию</span>
                  </button>
                
{/*
<button
  onClick={() => router.push('/profile/settings')}
  className="flex items-center px-4 py-2 text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
>
  <Settings className="w-4 h-4 mr-2" />
  <span>Настройки</span>
</button>
*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:space-y-6 lg:gap-0">
              {/* Statistics Cards */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Статистика</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchUserStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Всего сессий</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stats.totalActivities}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Спотов посещено</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stats.totalSpots}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Часов медитации</span>
                      </div>
                      <span className="font-semibold text-gray-900">{Math.floor(stats.totalDuration / 60)}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* This Week */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Эта неделя</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchUserStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : stats ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Сессии</span>
                      <span className="font-semibold text-green-600">{stats.activitiesThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Время</span>
                      <span className="font-semibold text-green-600">{(stats.weeklyDuration / 60).toFixed(1)} ч</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Любимый чай</span>
                      <span className="font-semibold text-green-600">{stats.favoriteTeaType || 'Нет данных'}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Tea Preferences */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Предпочтения в чае</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={fetchUserStats}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : stats?.teaPreferences && stats.teaPreferences.length > 0 ? (
                  <div className="space-y-3">
                    {stats.teaPreferences.map((preference) => {
                      const teaTypeInfo = TEA_TYPES.find(t => t.value === preference.type);
                      const label = teaTypeInfo ? teaTypeInfo.label : preference.type;
                      const emoji = preference.type === 'green' ? '🍵' : 
                                   preference.type === 'oolong' ? '🌿' : 
                                   preference.type === 'black' ? '☕' : '🫖';
                      return (
                        <div key={preference.type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{emoji} {label}</span>
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className="h-2 bg-green-600 rounded-full" 
                                style={{ width: `${Math.min(preference.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{preference.percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Нет данных о предпочтениях в чае</p>
                    <p className="text-gray-400 text-xs mt-1">Записывайте чайные сессии, чтобы увидеть статистику</p>
                  </div>
                )}
              </div>

              {/* Recent Achievements */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Достижения</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm">🏆</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Чайный мастер</div>
                      <div className="text-xs text-gray-500">10 сессий подряд</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm">🗺️</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Исследователь</div>
                      <div className="text-xs text-gray-500">5 новых спотов</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Activity Timeline */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Мои чайные сессии
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Всего: {stats?.totalActivities || 0}</span>
                  <span>•</span>
                  <span>Этот месяц: {stats?.activitiesThisMonth || 0}</span>
                </div>
              </div>
              
              <ActivityList 
                endpoint={`/api/activities/user/${user.username}`}
                emptyMessage="У вас пока нет записанных чайных сессий"
                showPagination={true}
              />
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