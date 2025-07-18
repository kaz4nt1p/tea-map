'use client';

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  initialContent?: string;
  buttonText?: string;
  showCancel?: boolean;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  placeholder = 'Добавьте комментарий...',
  initialContent = '',
  buttonText = 'Комментировать',
  showCancel = false,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Комментарий не может быть пустым');
      return;
    }

    if (content.length > 1000) {
      setError('Комментарий не может быть длиннее 1000 символов');
      return;
    }

    try {
      setError('');
      await onSubmit(content.trim());
      setContent(''); // Clear form after successful submission
    } catch (error) {
      console.error('Comment submission error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при отправке комментария');
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError('');
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 focus:bg-white transition-colors"
          rows={2}
          disabled={isLoading}
          maxLength={1000}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">
            {content.length}/1000
          </span>
          
          <div className="flex items-center space-x-2">
            {showCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
              >
                Отменить
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <span>{buttonText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;