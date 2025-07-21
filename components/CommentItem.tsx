'use client';

import React, { useState } from 'react';
import { ActivityComment } from '../lib/types';
import { AvatarImage } from './AvatarImage';
import { CommentForm } from './CommentForm';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface CommentItemProps {
  comment: ActivityComment;
  currentUserId?: string;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const displayName = comment.user?.display_name || comment.user?.username || 'Unknown User';

  const handleEdit = async (content: string) => {
    try {
      await onEdit(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить комментарий?')) return;
    
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (isDeleting) {
    return (
      <div className="flex items-center space-x-3 py-3 opacity-50">
        <div className="w-8 h-8 bg-sage-200 rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-sage-200 rounded animate-pulse mb-2" />
          <div className="h-3 bg-sage-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2 py-2 group">
      <AvatarImage
        src={comment.user?.avatar_url}
        alt={displayName}
        className="w-6 h-6 flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 text-sm">{displayName}</span>
            <span className="text-gray-500 text-xs">{formatDate(comment.created_at)}</span>
          </div>
          
          {isOwner && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Удалить</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <CommentForm
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialContent={comment.content}
              placeholder="Редактировать комментарий..."
              buttonText="Сохранить"
              showCancel={true}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="mt-1">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default CommentItem;