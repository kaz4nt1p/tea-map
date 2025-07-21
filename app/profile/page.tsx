'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityList } from '../../components/ActivityList';
import { ActivityForm } from '../../components/ActivityForm';
import { User, Activity, CreateActivityRequest, UserStats } from '../../lib/types';
import { tokenManager } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, TrendingUp, Users, Settings, Edit3, Loader2 } from 'lucide-react';
import { AvatarImage } from '../../components/AvatarImage';

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
      
      const token = tokenManager.getAccessToken();
      const response = await fetch(`/api/stats/user/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }
      
      const data = await response.json();
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
      const token = tokenManager.getAccessToken();
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center">
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="w-12 h-12 lg:w-16 lg:h-16"
                  fallback={<Users className="w-6 h-6 lg:w-8 lg:h-8 text-white" />}
                />
                <div className="ml-3 lg:ml-4">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {user.display_name || user.username}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600">@{user.username}</p>
                  {user.bio && (
                    <p className="text-sm lg:text-base text-gray-700 mt-1 lg:mt-2">{user.bio}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button
                  onClick={() => setShowActivityForm(true)}
                  className="flex items-center px-3 py-2 lg:px-4 text-sm lg:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Записать сессию</span>
                  <span className="sm:hidden">Записать</span>
                </button>
                
                <button
                  onClick={() => router.push('/profile/settings')}
                  className="flex items-center px-3 py-2 lg:px-4 text-sm lg:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Настройки</span>
                  <span className="sm:hidden">Настр.</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">🍵 Зелёный</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-10 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">62%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">🌿 Улун</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-6 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">38%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">☕ Чёрный</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div className="w-3 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">18%</span>
                    </div>
                  </div>
                </div>
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