"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { tokenManager } from "../lib/auth";
import { X, Plus, Upload, Image as ImageIcon } from "lucide-react";

interface UploadedPhoto {
  url: string;
  publicId: string;
  thumbnail?: string;
}

interface ActivityPhotoUploaderProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
}

export default function ActivityPhotoUploader({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5 
}: ActivityPhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Максимум ${maxPhotos} фотографий разрешено`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} не является изображением`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} слишком большой. Максимум: 10MB`);
        return;
      }
    }

    setUploading(true);
    const uploadPromises = filesToUpload.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = tokenManager.getAccessToken();
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      return {
        url: data.url,
        publicId: data.publicId,
        thumbnail: data.thumbnails?.medium || data.url
      };
    });

    try {
      const uploadedPhotos = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...uploadedPhotos]);
      
      toast.success(`Загружено ${uploadedPhotos.length} фото`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки фотографий');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
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
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Фотографии сессии ({photos.length}/{maxPhotos})
      </label>
      
      {/* Photo Preview Reel */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
        <AnimatePresence>
          {photos.map((photo, index) => (
            <motion.div
              key={photo.publicId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={photo.thumbnail || photo.url}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                aria-label="Удалить фото"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Add Photo Button */}
        {canAddMore && (
          <motion.div
            whileHover={{ scale: uploading ? 1 : 1.02 }}
            whileTap={{ scale: uploading ? 1 : 0.95 }}
            className={`
              flex-shrink-0 w-20 h-20 border-2 border-dashed rounded-lg cursor-pointer 
              flex items-center justify-center transition-all duration-200
              ${dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
              }
              ${uploading ? 'cursor-not-allowed opacity-70' : ''}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            ) : (
              <Plus className="w-6 h-6 text-gray-400" />
            )}
          </motion.div>
        )}
      </div>

      {/* Upload Instructions */}
      {canAddMore && (
        <div className="text-sm text-gray-500 mb-2">
          Нажмите на + или перетащите фото для загрузки. Максимум {maxPhotos} фотографий.
        </div>
      )}

      {/* Full Upload Area (when no photos) */}
      {photos.length === 0 && (
        <motion.div
          whileHover={{ scale: uploading ? 1 : 1.01 }}
          whileTap={{ scale: uploading ? 1 : 0.99 }}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
            }
            ${uploading ? 'cursor-not-allowed opacity-70' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
              <p className="text-green-600 font-medium">Загрузка...</p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                Добавьте фотографии вашей сессии
              </p>
              <p className="text-sm text-gray-500">
                Нажмите или перетащите до {maxPhotos} фото (JPEG, PNG, GIF, WebP, макс. 10MB каждое)
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || !canAddMore}
      />
    </div>
  );
}