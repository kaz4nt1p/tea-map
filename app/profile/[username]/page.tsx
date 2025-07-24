'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ActivityList } from '../../../components/ActivityList';
import { User, UserStats } from '../../../lib/types';
import { tokenManager } from '../../../lib/auth';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, TrendingUp, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { AvatarImage } from '../../../components/AvatarImage';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  const isOwnProfile = currentUser?.username === username;

  // Fetch user statistics
  const fetchUserStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const token = tokenManager.getAccessToken();
      console.log('Profile stats fetch - token available:', !!token);
      console.log('Fetching stats for user ID:', userId);
      
      const response = await fetch(`/api/stats/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('Profile stats response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile stats error response:', errorText);
        throw new Error(`Failed to fetch user statistics: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Profile stats received:', data.data);
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      console.error('Error details:', error.message);
      setStatsError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = tokenManager.getAccessToken();
        const response = await fetch(`/api/users/${username}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Пользователь не найден');
          } else {
            setError('Ошибка при загрузке профиля');
          }
          return;
        }

        const userData = await response.json();
        setProfileUser(userData.data);

        // Fetch user statistics
        console.log('Auto-fetching stats for loaded user:', userData.data.id);
        await fetchUserStats(userData.data.id);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Пользователь не найден'}</div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Вернуться назад
          </button>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <AvatarImage
                  src={profileUser.avatar_url}
                  alt={profileUser.display_name || profileUser.username}
                  className="w-16 h-16"
                  fallback={<Users className="w-8 h-8 text-white" />}
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileUser.display_name || profileUser.username}
                  </h1>
                  {profileUser.auth_provider !== 'google' && (
                    <p className="text-gray-600">@{profileUser.username}</p>
                  )}
                  {profileUser.bio && (
                    <p className="text-gray-700 mt-2">{profileUser.bio}</p>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Мой профиль
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={() => profileUser && fetchUserStats(profileUser.id)}
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Эта неделя</h3>
                  <button
                    onClick={() => {
                      console.log('Manual fetch triggered for user:', profileUser?.id);
                      if (profileUser) fetchUserStats(profileUser.id);
                    }}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Обновить статистику
                  </button>
                </div>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm mb-2">{statsError}</p>
                    <button
                      onClick={() => profileUser && fetchUserStats(profileUser.id)}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Попробовать снова
                    </button>
                  </div>
                ) : stats ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Сессии</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">{stats.activitiesThisWeek}</span>
                        <button
                          onClick={() => profileUser && fetchUserStats(profileUser.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                          title="Обновить статистику"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Время за неделю</span>
                      <span className="font-semibold text-green-600">
                        {stats.weeklyDuration !== undefined 
                          ? `${Math.round((stats.weeklyDuration || 0) / 60 * 10) / 10} ч` 
                          : 'Загрузка...'
                        }
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        (raw: {stats.weeklyDuration})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Любимый чай</span>
                      <span className="font-semibold text-green-600">{stats.favoriteTeaType || 'Нет данных'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Статистика не загружена</p>
                    <p className="text-xs text-gray-400">stats object: {JSON.stringify(stats)}</p>
                    <button
                      onClick={() => {
                        console.log('Fallback fetch triggered');
                        if (profileUser) fetchUserStats(profileUser.id);
                      }}
                      className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Загрузить статистику
                    </button>
                  </div>
                )}
              </div>

              {/* Tea Preferences */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Предпочтения в чае</h3>
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
            </div>
          </div>

          {/* Main Content - Activity Timeline */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Чайные сессии {isOwnProfile ? '' : `пользователя ${profileUser.display_name || profileUser.username}`}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Всего: {stats?.totalActivities || 0}</span>
                  <span>•</span>
                  <span>Этот месяц: {stats?.activitiesThisMonth || 0}</span>
                </div>
              </div>
              
              <ActivityList 
                endpoint={`/api/activities/user/${username}`}
                emptyMessage={isOwnProfile ? "У вас пока нет записанных чайных сессий" : "У пользователя пока нет записанных чайных сессий"}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}