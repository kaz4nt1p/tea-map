'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, ApiResponse, User, TEA_TYPES, MOOD_TYPES } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { activitiesApi } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  Leaf, 
  Cloud,
  Users,
  Edit3,
  Trash2,
  Share2
} from 'lucide-react';
import { AvatarImage } from '../../../components/AvatarImage';
import { CommentSection } from '../../../components/CommentSection';
import { ActivityPhotoGrid } from '../../../components/ActivityPhotoGrid';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const activityId = params.id as string;

  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
  }, [activityId]);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await activitiesApi.getActivityById(activityId);
      setActivity(data.activity as unknown as Activity);
      setIsLiked(data.activity.isLiked || false);
      setLikeCount(data.activity._count?.likes || 0);
      setCommentCount(data.activity._count?.comments || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await activitiesApi.toggleLike(activityId);
      const previousLiked = isLiked;
      setIsLiked(result.liked);
      
      // Update count based on the change in liked state
      if (result.liked && !previousLiked) {
        // User just liked the activity
        setLikeCount(prev => prev + 1);
      } else if (!result.liked && previousLiked) {
        // User just unliked the activity
        setLikeCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error liking activity:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = () => {
    router.push(`/activities/${activityId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту активность?')) {
      return;
    }
    
    try {
      await activitiesApi.deleteActivity(activityId);
      router.push('/profile');
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Ошибка при удалении активности');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity?.title,
          text: activity?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ru 
    });
  };

  const getTeaTypeIcon = (teaType?: string) => {
    if (!teaType) return null;
    
    const teaEmojis: { [key: string]: string } = {
      'green': '🍵',
      'black': '☕',
      'white': '🤍',
      'oolong': '🌿',
      'pu-erh': '🍂',
      'sencha': '🌱',
      'matcha': '🍵',
      'chai': '🫖',
      'herbal': '🌿',
      'other': '🍵'
    };
    
    return teaEmojis[teaType] || '🍵';
  };

  const getTeaTypeLabel = (teaType?: string) => {
    if (!teaType) return '';
    
    const teaTypeInfo = TEA_TYPES.find(t => t.value === teaType);
    return teaTypeInfo ? teaTypeInfo.label : teaType;
  };

  const getMoodLabel = (mood?: string) => {
    if (!mood) return '';
    
    const moodInfo = MOOD_TYPES.find(m => m.value === mood);
    return moodInfo ? moodInfo.label : mood;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка активности...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
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

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Активность не найдена</div>
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

  const isOwner = user?.id === activity.user_id;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 w-full">
          <div className="flex items-center justify-between py-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </button>
            
            <div className="flex items-center space-x-1 min-w-0 flex-shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center px-1.5 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span className="ml-1 hidden xs:inline">Поделиться</span>
              </button>
              
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-1.5 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="ml-1 hidden xs:inline">Редактировать</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-1.5 py-2 text-red-600 hover:text-red-900 rounded-lg hover:bg-red-50 transition-colors text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-1 hidden xs:inline">Удалить</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 w-full min-w-0">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full min-w-0">
          {/* User header */}
          <div className="flex items-center p-4 sm:p-6 border-b border-gray-200 w-full min-w-0">
            <button
              onClick={() => activity.user?.username && router.push(`/profile/${activity.user.username}`)}
              className="hover:opacity-80 transition-opacity"
            >
              <AvatarImage
                src={activity.user?.avatar_url}
                alt={activity.user?.display_name || activity.user?.username || 'User'}
                size="lg"
                fallback={<UserIcon className="w-6 h-6 text-white" />}
              />
            </button>
            <div className="ml-4 min-w-0 flex-1">
              <button
                onClick={() => activity.user?.username && router.push(`/profile/${activity.user.username}`)}
                className="text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors w-full min-w-0"
              >
                <h3 className="font-semibold text-gray-900 truncate">
                  {activity.user?.display_name || activity.user?.username}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {formatTime(activity.created_at)}
                </p>
              </button>
            </div>
            
            {(activity.tea_type || activity.tea_name) && (
              <div className="ml-auto flex items-center text-xs sm:text-sm bg-gray-50 px-2 sm:px-3 py-1 rounded-full max-w-[40%] sm:max-w-none">
                <span className="mr-1 flex-shrink-0">{getTeaTypeIcon(activity.tea_type)}</span>
                <span className="truncate">
                  {activity.tea_name ? (
                    <>
                      <span className="font-medium text-gray-900">{activity.tea_name}</span>
                      {activity.tea_type && (
                        <span className="text-gray-600 ml-1 text-xs hidden sm:inline">({getTeaTypeLabel(activity.tea_type)})</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-700">{getTeaTypeLabel(activity.tea_type)}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Activity content */}
          <div className="p-4 sm:p-6 w-full min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words leading-tight">
              {activity.title}
            </h1>
            
            {activity.description && (
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                {activity.description}
              </p>
            )}
            
            {/* Spot info */}
            {activity.spot && (
              <button
                onClick={() => activity.spot?.id && router.push(`/map?spot=${activity.spot.id}`)}
                className="flex items-start text-gray-600 mb-4 sm:mb-6 hover:text-green-600 transition-colors cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 text-left w-full"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="break-words min-w-0 flex-1">
                  <span className="font-medium text-sm sm:text-base">{activity.spot.name}</span>
                  {activity.spot.address && (
                    <span className="ml-2 text-xs sm:text-sm block sm:inline">• {activity.spot.address}</span>
                  )}
                </div>
              </button>
            )}
            
            {/* Activity metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {activity.duration_minutes && (
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{activity.duration_minutes} минут</span>
                </div>
              )}
              
              {activity.weather_conditions && (
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <Cloud className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{activity.weather_conditions}</span>
                </div>
              )}
              
              {activity.companions && activity.companions.length > 0 && (
                <div className="flex items-start text-gray-600 text-sm sm:text-base">
                  <Users className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-words overflow-wrap-anywhere">{activity.companions.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Mood indicators */}
            {(activity.mood_before || activity.mood_after) && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Настроение</h3>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-8">
                  {activity.mood_before && (
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">До</div>
                      <div className="flex items-center">
                        <span className="mr-2">🧘</span>
                        <span className="text-sm sm:text-base">{getMoodLabel(activity.mood_before)}</span>
                      </div>
                    </div>
                  )}
                  {activity.mood_after && (
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">После</div>
                      <div className="flex items-center">
                        <span className="mr-2">✨</span>
                        <span className="text-sm sm:text-base">{getMoodLabel(activity.mood_after)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tea Information */}
          {(activity.tea_name || activity.tea_type) && (
            <div className="p-4 sm:p-6 border-t border-gray-200 w-full min-w-0">
              <div className="flex items-center text-gray-700 mb-3">
                <span className="text-base sm:text-lg mr-2 flex-shrink-0">{getTeaTypeIcon(activity.tea_type)}</span>
                <h3 className="font-medium text-sm sm:text-base">🍵 Информация о чае</h3>
              </div>
              <div className="space-y-2">
                {activity.tea_name && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Название чая:</span>
                    <div className="text-base sm:text-lg font-bold text-gray-900 break-words overflow-wrap-anywhere">{activity.tea_name}</div>
                  </div>
                )}
                {activity.tea_type && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Тип чая:</span>
                    <div className="text-sm sm:text-base font-medium text-gray-700">{getTeaTypeLabel(activity.tea_type)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity photos */}
          {activity.media && activity.media.length > 0 && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 w-full min-w-0">
              <ActivityPhotoGrid 
                photos={activity.media}
                onPhotoClick={(photoIndex) => {
                  console.log(`Viewed photo ${photoIndex + 1} of activity ${activity.id}`);
                }}
              />
            </div>
          )}

          {/* Taste notes */}
          {activity.taste_notes && (
            <div className="p-4 sm:p-6 bg-gray-50 w-full min-w-0">
              <div className="flex items-center text-gray-700 mb-2">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Заметки о вкусе</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                {activity.taste_notes}
              </p>
            </div>
          )}

          {/* Insights */}
          {activity.insights && (
            <div className="p-4 sm:p-6 border-t border-gray-200 w-full min-w-0">
              <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-2">Размышления</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                {activity.insights}
              </p>
            </div>
          )}

          {/* Tea brewing details */}
          {activity.tea_details && Object.keys(activity.tea_details).length > 0 && (
            <div className="p-4 sm:p-6 bg-amber-50 border-t border-amber-100 w-full min-w-0">
              <div className="flex items-center text-amber-700 mb-3">
                <span className="text-lg mr-2">🫖</span>
                <h3 className="font-medium text-sm sm:text-base">Детали заваривания</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {activity.tea_details.brewing_temperature && (
                  <div>
                    <div className="text-xs sm:text-sm text-amber-600 mb-1">Температура</div>
                    <div className="font-medium text-sm sm:text-base text-amber-800">{activity.tea_details.brewing_temperature}°C</div>
                  </div>
                )}
                {activity.tea_details.steeping_time && (
                  <div>
                    <div className="text-xs sm:text-sm text-amber-600 mb-1">Время заваривания</div>
                    <div className="font-medium text-sm sm:text-base text-amber-800">{activity.tea_details.steeping_time} сек</div>
                  </div>
                )}
                {activity.tea_details.brewing_method && (
                  <div>
                    <div className="text-xs sm:text-sm text-amber-600 mb-1">Метод</div>
                    <div className="font-medium text-sm sm:text-base text-amber-800">{activity.tea_details.brewing_method}</div>
                  </div>
                )}
                {activity.tea_details.tea_origin && (
                  <div>
                    <div className="text-xs sm:text-sm text-amber-600 mb-1">Происхождение</div>
                    <div className="font-medium text-sm sm:text-base text-amber-800">{activity.tea_details.tea_origin}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-t border-gray-200 space-y-4 sm:space-y-0 w-full min-w-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button 
                onClick={handleLike}
                disabled={isLiking || !isAuthenticated}
                className={`flex items-center space-x-2 text-sm transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
                data-testid="like-button"
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
                />
                <span data-testid="like-count">{likeCount}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
                <MessageCircle className="w-5 h-5" />
                <span>{commentCount}</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {new Date(activity.created_at).toLocaleString('ru-RU')}
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection
            activityId={activityId}
            initialComments={activity.comments || []}
            initialCount={commentCount}
            onCommentCountChange={setCommentCount}
            className="px-4 sm:px-6 pb-4 sm:pb-6"
          />
        </div>
      </div>
    </div>
  );
}