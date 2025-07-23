'use client';

import React, { useState, useEffect } from 'react';
import { ActivityComment } from '../lib/types';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { MessageSquare, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { authUtils } from '../lib/auth';
import { AvatarImage } from './AvatarImage';
import { activitiesApi } from '../lib/api';

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
      
      const response = await activitiesApi.getComments(activityId, pageNum, 10);
      console.log('Comments API response:', response);
      
      // Handle the response structure from activitiesApi
      const commentsData = response.data;
      const paginationData = response.pagination;
      
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
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const response = await activitiesApi.createComment(activityId, content);
      console.log('Comment creation response:', response);
      
      // Handle the response structure from activitiesApi
      const newComment = response.comment;
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
      const response = await activitiesApi.updateComment(activityId, commentId, content);
      console.log('Comment update response:', response);
      
      // Handle the response structure from activitiesApi
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? response.comment : comment
      ));
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await activitiesApi.deleteComment(activityId, commentId);
      console.log('Comment deleted successfully');

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
    <div className={`border-t border-gray-100 ${className}`}>
      {/* Comments Header */}
      <div className="border-b border-gray-100">
        <button
          onClick={toggleExpanded}
          className={`flex items-center justify-between w-full px-6 py-4 text-sm font-medium transition-colors ${
            isExpanded 
              ? 'text-green-700 bg-white' 
              : 'text-gray-600 hover:text-green-600 bg-gray-50/50 hover:bg-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-4 h-4" />
            <span>Комментарии ({totalComments})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Comments Content */}
      {isExpanded && (
        <div className="bg-white">
          {/* Comment Form */}
          {currentUser && (
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-start space-x-3">
                <AvatarImage
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name || currentUser.username}
                  className="w-8 h-8 flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <CommentForm
                    onSubmit={handleCreateComment}
                    isLoading={isLoading}
                    placeholder="Добавьте комментарий..."
                    buttonText="Опубликовать"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && comments.length === 0 ? (
              <div className="px-6 py-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
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
                  <div key={comment.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
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
                  <div className="px-6 py-4 text-center border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Загрузка...' : 'Показать больше комментариев'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center px-6 py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-600">Пока нет комментариев</p>
                {!currentUser && (
                  <p className="text-xs mt-1 text-gray-500">Войдите, чтобы добавить комментарий</p>
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