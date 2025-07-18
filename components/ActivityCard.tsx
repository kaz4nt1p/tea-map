'use client';

import React, { useState } from 'react';
import { Activity, ActivityComment } from '../lib/types';
import { tokenManager } from '../lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, MessageCircle, MapPin, Clock, User, Leaf } from 'lucide-react';
import { AvatarImage } from './AvatarImage';
import { TeaIconFilled } from './TeaIcon';

interface ActivityCardProps {
  activity: Activity;
  onActivityClick?: (activity: Activity) => void;
  onUserClick?: (username: string) => void;
  onSpotClick?: (spotId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onActivityClick,
  onUserClick,
  onSpotClick
}) => {
  const [isLiked, setIsLiked] = useState(activity.is_liked || false);
  const [likeCount, setLikeCount] = useState(activity.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ru 
    });
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`/api/activities/${activity.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const previousLiked = isLiked;
        const newLikedState = responseData.data.liked;
        setIsLiked(newLikedState);
        
        // Update count based on the change in liked state
        if (newLikedState && !previousLiked) {
          // User just liked the activity
          setLikeCount(prev => prev + 1);
        } else if (!newLikedState && previousLiked) {
          // User just unliked the activity
          setLikeCount(prev => prev - 1);
        }
      }
    } catch (error) {
      console.error('Error liking activity:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    onActivityClick?.(activity);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.user?.username) {
      onUserClick?.(activity.user.username);
    }
  };

  const handleSpotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.spot?.id) {
      onSpotClick?.(activity.spot.id);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to activity detail page to view and add comments
    onActivityClick?.(activity);
  };

  const getTeaTypeIcon = (teaType?: string) => {
    if (!teaType) return null;
    
    // Use consistent tea icon for all tea types instead of different emojis
    return <TeaIconFilled size={16} className="text-green-600" />;
  };

  const getTeaTypeLabel = (teaType?: string) => {
    if (!teaType) return '';
    
    const teaLabels: { [key: string]: string } = {
      'green': 'Зелёный чай',
      'black': 'Чёрный чай',
      'white': 'Белый чай',
      'oolong': 'Улун',
      'pu-erh': 'Пуэр',
      'sencha': 'Сенча',
      'matcha': 'Матча',
      'chai': 'Чай',
      'herbal': 'Травяной',
      'other': 'Другое'
    };
    
    return teaLabels[teaType] || teaType;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
      data-testid="activity-card"
    >
      {/* Header with user info */}
      <div className="flex items-center p-4 pb-3">
        <div 
          className="flex items-center flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2"
          onClick={handleUserClick}
        >
          <AvatarImage
            src={activity.user?.avatar_url}
            alt={activity.user?.display_name || activity.user?.username || 'User'}
            size="lg"
            fallback={<User className="w-5 h-5 text-white" />}
          />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">
              {activity.user?.display_name || activity.user?.username}
            </h3>
            <p className="text-sm text-gray-500">
              {formatTime(activity.created_at)}
            </p>
          </div>
        </div>
        
        {/* Tea type indicator */}
        {activity.tea_type && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <span className="mr-1">{getTeaTypeIcon(activity.tea_type)}</span>
            <span>{getTeaTypeLabel(activity.tea_type)}</span>
          </div>
        )}
      </div>

      {/* Activity content */}
      <div className="px-4 pb-3">
        <h4 className="font-semibold text-lg text-gray-900 mb-2">
          {activity.title}
        </h4>
        
        {activity.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {activity.description}
          </p>
        )}
        
        {/* Spot info */}
        {activity.spot && (
          <div 
            className="flex items-center text-sm text-gray-600 mb-3 cursor-pointer hover:text-green-600"
            onClick={handleSpotClick}
          >
            <MapPin className="w-4 h-4 mr-1" />
            <span>{activity.spot.name}</span>
          </div>
        )}
        
        {/* Activity metadata */}
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
          {activity.duration_minutes && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{activity.duration_minutes} мин</span>
            </div>
          )}
          
          {activity.mood_before && (
            <div className="flex items-center">
              <span className="mr-1">🧘</span>
              <span>{activity.mood_before}</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity photo */}
      {activity.media && activity.media.length > 0 && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img 
            src={activity.media[0].file_path} 
            alt={activity.media[0].alt_text || activity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Taste notes */}
      {activity.taste_notes && (
        <div className="px-4 py-3 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Leaf className="w-4 h-4 mr-1" />
            <span className="font-medium">Заметки о вкусе:</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {activity.taste_notes}
          </p>
        </div>
      )}

      {/* Comments Preview */}
      {activity.comments && activity.comments.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="space-y-2">
            {activity.comments.slice(-2).map((comment: ActivityComment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <AvatarImage
                  src={comment.user?.avatar_url}
                  alt={comment.user?.display_name || comment.user?.username || 'User'}
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-gray-900 text-xs">
                      {comment.user?.display_name || comment.user?.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs mt-0.5 line-clamp-2">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            
            {activity.comment_count && activity.comment_count > 2 && (
              <button
                onClick={handleCommentClick}
                className="text-xs text-gray-500 hover:text-gray-700 mt-2"
              >
                Показать все {activity.comment_count} комментариев
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            }`}
            data-testid="like-button"
          >
            <Heart 
              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
            />
            <span data-testid="like-count">{likeCount}</span>
          </button>
          
          <button 
            onClick={handleCommentClick}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{activity.comment_count || 0}</span>
          </button>
        </div>
        
        {/* Weather indicator */}
        {activity.weather_conditions && (
          <div className="text-sm text-gray-500">
            <span>🌤️ {activity.weather_conditions}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;