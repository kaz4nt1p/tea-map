'use client';

import React, { useState, useEffect } from 'react';
import { ActivityComment } from '../lib/types';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { authUtils, tokenManager } from '../lib/auth';
import { AvatarImage } from './AvatarImage';

interface CommentSectionProps {
  activityId: string;
  initialComments?: ActivityComment[];
  initialCount?: number;
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  activityId,
  initialComments = [],
  initialCount = 0,
  onCommentCountChange,
  className = ''
}) => {
  const [comments, setComments] = useState<ActivityComment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Pre-opened by default
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(initialCount);

  const currentUser = authUtils.getCurrentUser();

  // Load comments when expanded or on initial load
  useEffect(() => {
    if (isExpanded && comments.length === 0 && initialComments.length === 0) {
      fetchComments();
    }
  }, [isExpanded, initialComments.length]);

  const fetchComments = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const token = tokenManager.getAccessToken();
      const response = await fetch(`/api/activities/${activityId}/comments?page=${pageNum}&limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch comments:', {
          status: response.status,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      console.log('Comments API response:', data);
      
      // Handle the nested response structure from backend
      const responseData = data.data || data;
      const commentsData = responseData.data || responseData;
      const paginationData = responseData.pagination || {};
      
      if (pageNum === 1) {
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } else {
        setComments(prev => [...prev, ...(Array.isArray(commentsData) ? commentsData : [])]);
      }
      
      setHasMore(pageNum < (paginationData.pages || 1));
      setTotalComments(paginationData.total || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async (content: string) => {
    try {
      const token = tokenManager.getAccessToken();
      console.log('Creating comment with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('You must be logged in to comment');
      }
      
      const response = await fetch(`/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Comment creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          token: token ? 'Present' : 'Missing'
        });
        throw new Error(errorData.error || `Failed to create comment (${response.status})`);
      }

      const data = await response.json();
      console.log('Comment creation response:', data);
      
      // Handle the response structure from backend
      const newComment = data.comment || data.data?.comment || data;
      setComments(prev => [...prev, newComment]);
      const newCount = totalComments + 1;
      setTotalComments(newCount);
      onCommentCountChange?.(newCount);
      
      // Expand comments if not already expanded
      if (!isExpanded) {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`/api/activities/${activityId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const data = await response.json();
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? data.comment : comment
      ));
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`/api/activities/${activityId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      const newCount = totalComments - 1;
      setTotalComments(newCount);
      onCommentCountChange?.(newCount);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`border-t border-gray-200 ${className}`}>
      {/* Comments Header */}
      <div className="flex items-center border-b border-gray-200 bg-white">
        <button
          onClick={toggleExpanded}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            isExpanded 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Комментарии ({totalComments})</span>
        </button>
      </div>

      {/* Comments Content */}
      {isExpanded && (
        <div className="bg-white">
          {/* Comment Form */}
          {currentUser && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start space-x-3">
                <AvatarImage
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name || currentUser.username}
                  className="w-6 h-6 flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <CommentForm
                    onSubmit={handleCreateComment}
                    isLoading={isLoading}
                    placeholder="Добавьте комментарий, @ чтобы отметить"
                    buttonText="Опубликовать"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && comments.length === 0 ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <CommentItem
                      comment={comment}
                      currentUserId={currentUser?.id}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      isLoading={isLoading}
                    />
                  </div>
                ))}
                
                {hasMore && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Загрузка...' : 'Показать больше комментариев'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Пока нет комментариев</p>
                {!currentUser && (
                  <p className="text-xs mt-1 text-gray-400">Войдите, чтобы добавить комментарий</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;