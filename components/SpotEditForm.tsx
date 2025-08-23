import { useState } from 'react';
import { motion } from 'framer-motion';
import SpotImageUploader from './SpotImageUploader';
import PhotoGallery from './PhotoGallery';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';
import { Spot, Media } from '../lib/types';

interface Photo {
  id: string;
  file_path: string;
  alt_text?: string;
}

interface SpotEditFormProps {
  spot: Spot;
  onSave: (updatedSpot: Spot) => void;
  onCancel: () => void;
}

export default function SpotEditForm({ spot, onSave, onCancel }: SpotEditFormProps) {
  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description || '');
  const [longDescription, setLongDescription] = useState(spot.long_description || '');
  const [photos, setPhotos] = useState<string[]>(
    spot.media?.map(m => m.file_path) || (spot.image_url ? [spot.image_url] : [])
  );

  console.log('SpotEditForm initialized with photos:', photos);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhoto = (url: string) => {
    if (photos.length < 5) {
      setPhotos(prev => [...prev, url]);
    } else {
      toast.error('Максимум 5 фотографий для спота');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMovePhotoToFirst = (index: number) => {
    if (index === 0) return; // Already first
    setPhotos(prev => {
      const newPhotos = [...prev];
      const [movedPhoto] = newPhotos.splice(index, 1);
      newPhotos.unshift(movedPhoto);
      return newPhotos;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    try {
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        long_description: longDescription.trim(),
        latitude: spot.latitude,
        longitude: spot.longitude,
        address: spot.address || '',
        amenities: [],
        accessibility_info: '',
        image_url: '', // Legacy field - no longer used, photos go to media table
        media_urls: photos // Send all photos to backend
      };

      console.log('SpotEditForm sending update data:', {
        ...updateData,
        media_urls: updateData.media_urls
      });

      const response = await apiClient.put(`/api/spots/${spot.id}`, updateData);
      
      if (response.data.success && response.data.data?.spot) {
        // Use the actual updated spot data from the backend
        const backendSpot = response.data.data.spot;
        
        const updatedSpot: Spot = {
          ...backendSpot,
          // Ensure we have all required fields with safe access
          amenities: (backendSpot && backendSpot.amenities) || {},
          accessibility_info: (backendSpot && backendSpot.accessibility_info) || '',
          address: (backendSpot && backendSpot.address) || '',
          description: (backendSpot && backendSpot.description) || '',
          long_description: (backendSpot && backendSpot.long_description) || '',
          image_url: (backendSpot && backendSpot.image_url) || '',
          media: (backendSpot && backendSpot.media) || []
        };
        
        onSave(updatedSpot);
        toast.success('Спот успешно обновлен!');
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error('Неверный ответ от сервера');
      }
    } catch (error: any) {
      console.error('Error updating spot:', error);
      toast.error(error.response?.data?.message || 'Ошибка при обновлении спота');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl w-full mx-auto shadow-xl border border-tea-200 flex flex-col"
      style={{ 
        maxHeight: 'inherit',
        height: 'fit-content'
      }}
    >
      <div className="overflow-y-auto flex-1 p-4 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="text-2xl sm:text-3xl mb-2">✏️</div>
          <h2 className="text-lg sm:text-xl font-bold text-tea-800">Редактировать спот</h2>
          <p className="text-xs sm:text-sm text-tea-600 mt-1">Обновите информацию о вашем споте</p>
        </motion.div>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Photos Section */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-tea-700 mb-2">
              Фотографии спота ({photos.length}/5)
            </label>
            
            {/* Current Photos Management */}
            {photos.length > 0 && (
              <div className="mb-3">                
                {/* Photo Management Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-tea-200 hover:border-tea-400 transition-colors"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {/* Delete button */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors shadow-lg opacity-80 group-hover:opacity-100"
                        title="Удалить фото"
                      >
                        ×
                      </motion.button>
                      
                      {/* Make main photo button (for non-first photos) */}
                      {index > 0 && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleMovePhotoToFirst(index)}
                          className="absolute -top-2 -left-2 w-7 h-7 bg-tea-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-tea-700 transition-colors shadow-lg opacity-80 group-hover:opacity-100"
                          title="Сделать главным фото"
                        >
                          ⭐
                        </motion.button>
                      )}
                      
                      {/* Main photo indicator */}
                      {index === 0 && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-tea-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                            Главная
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Photo Management Instructions */}
                {photos.length > 1 && (
                  <div className="bg-tea-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-tea-600 text-center mb-1">
                      <strong>Главное фото</strong> будет отображаться первым в споте
                    </p>
                    <p className="text-xs text-tea-500 text-center">
                      Нажмите ⭐ чтобы сделать фото главным, × чтобы удалить
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Add Photo Upload if under limit */}
            {photos.length < 5 && (
              <SpotImageUploader 
                onUpload={handleAddPhoto} 
                multiple={true}
              />
            )}
          </div>
          
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Например: Уютное кафе у парка"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
            />
          </div>
          
          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
              Краткое описание
            </label>
            <input
              id="description"
              type="text"
              placeholder="Что особенного в этом месте?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400"
            />
          </div>
          
          {/* Long Description Field */}
          <div>
            <label htmlFor="longDescription" className="block text-xs sm:text-sm font-medium text-tea-700 mb-1">
              Подробное описание
            </label>
            <textarea
              id="longDescription"
              placeholder="Расскажите больше о месте, атмосфере, любимых напитках..."
              value={longDescription}
              onChange={e => setLongDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm sm:text-base border border-tea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500 focus:border-transparent transition-colors placeholder-tea-400 resize-vertical"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!name.trim() || isSubmitting}
              className="flex-1 bg-tea-600 hover:bg-tea-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tea-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </div>
              ) : (
                '💾 Сохранить изменения'
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50"
            >
              Отмена
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}