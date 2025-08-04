"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import apiClient from "../lib/api";

export default function SpotImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    setUploading(true);
    const uploadPromise = async () => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      onUpload(data.url);
      
      // Log additional Cloudinary metadata for debugging
      if (data.thumbnails) {
        console.log('Cloudinary thumbnails available:', data.thumbnails);
      }
      if (data.publicId) {
        console.log('Cloudinary public ID:', data.publicId);
      }
      
      return data;
    };

    try {
      await toast.promise(uploadPromise(), {
        loading: 'Загрузка изображения...',
        success: 'Изображение успешно загружено!',
        error: ('Ошибка загрузки изображения'),
      });
    } catch (error: any) {
      // Error already handled by toast.promise
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };


  return (
    <div className="mb-3 sm:mb-4">
      <label className="block text-xs sm:text-sm font-medium text-tea-700 mb-2">
        Фото спота
      </label>
      
      <motion.div
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
        className={`
          relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-tea-500 bg-tea-50' 
            : 'border-tea-300 bg-tea-25 hover:border-tea-400 hover:bg-tea-50'
          }
          ${uploading ? 'cursor-not-allowed opacity-70' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Загрузить изображение"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-tea-500 mb-2"></div>
            <p className="text-tea-600 font-medium text-sm sm:text-base">Загрузка...</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-3xl mb-2">📷</div>
            <p className="text-tea-700 font-medium mb-1 text-sm sm:text-base">
              Нажмите или перетащите фото
            </p>
            <p className="text-xs sm:text-sm text-tea-500">
              JPEG, PNG, GIF, WebP (макс. 10MB)
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
