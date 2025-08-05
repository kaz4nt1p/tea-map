import { motion, AnimatePresence } from 'framer-motion';
import { Spot as SpotLegacy } from '../lib/spots';
import { Spot } from '../lib/types';
import { ActivityList } from './ActivityList';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PhotoGallery from './PhotoGallery';
import SpotEditForm from './SpotEditForm';

export default function SpotModal({
  spot,
  onClose,
  onRecordActivity,
  onSpotUpdated,
}: {
  spot: SpotLegacy | null;
  onClose: () => void;
  onRecordActivity?: (spot: SpotLegacy) => void;
  onSpotUpdated?: (updatedSpot: SpotLegacy) => void;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'activities'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(spot);
  const { user } = useAuth();

  // Update currentSpot when the spot prop changes (e.g., after page refresh)
  useEffect(() => {
    setCurrentSpot(spot);
  }, [spot]);

  const isOwner = user && currentSpot && (currentSpot as any).creator?.id === user.id;

  const convertLegacyToSpot = (legacySpot: SpotLegacy): Spot => ({
    id: legacySpot.id,
    creator_id: (legacySpot as any).creator_id || 'unknown',
    name: legacySpot.name,
    description: legacySpot.description,
    long_description: legacySpot.longDescription,
    latitude: legacySpot.lat,
    longitude: legacySpot.lng,
    address: '',
    image_url: legacySpot.image,
    created_at: legacySpot.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: (legacySpot as any).media
  });

  const convertSpotToLegacy = (spot: Spot): SpotLegacy => ({
    id: spot.id,
    name: spot.name,
    description: spot.description || '',
    longDescription: spot.long_description || '',
    image: spot.image_url || '',
    lat: spot.latitude,
    lng: spot.longitude,
    created_at: spot.created_at
  });

  const handleSaveEdit = (updatedSpot: Spot) => {
    const legacySpot = convertSpotToLegacy(updatedSpot);
    // Make sure we include the media data in the legacy format
    (legacySpot as any).media = updatedSpot.media;
    (legacySpot as any).creator = updatedSpot.creator;
    setCurrentSpot(legacySpot);
    setIsEditing(false);
    
    // Notify parent component about the update
    if (onSpotUpdated) {
      onSpotUpdated(legacySpot);
    }
  };

  const displaySpot = currentSpot || spot;
  
  return (
    <AnimatePresence>
      {displaySpot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Show Edit Form or Normal Content */}
            {isEditing ? (
              <SpotEditForm 
                spot={convertLegacyToSpot(displaySpot)}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                {/* Header */}
                <div className="relative">
                  {((displaySpot as any).media?.length > 0 || displaySpot.image) && (
                    <div className="relative rounded-t-2xl overflow-hidden">
                      <PhotoGallery 
                        photos={
                          (displaySpot as any).media?.map((m: any) => ({
                            id: m.id,
                            file_path: m.file_path,
                            alt_text: m.alt_text || displaySpot.name
                          })) || 
                          (displaySpot.image ? [{
                            id: 'main',
                            file_path: displaySpot.image,
                            alt_text: displaySpot.name
                          }] : [])
                        }
                        maxPhotos={5}
                      />
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors touch-manipulation"
                    aria-label="Закрыть модальное окно"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🍃</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-tea-800 mb-1">
                        {displaySpot.name}
                      </h2>
                      {displaySpot.description && (
                        <p className="text-tea-600 text-xs sm:text-sm">
                          {displaySpot.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'info'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Информация
                    </button>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'activities'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Чайные сессии
                    </button>
                  </div>
                  
                  {/* Tab Content */}
                  {activeTab === 'info' ? (
                    <div>
                      {displaySpot.longDescription && (
                        <div className="mb-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-tea-700 mb-2">Подробности</h3>
                          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                            {displaySpot.longDescription}
                          </p>
                        </div>
                      )}
                      
                      {/* Coordinates */}
                      <div className="bg-tea-50 rounded-lg p-2 sm:p-3 mb-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-tea-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="break-all">
                            {displaySpot.lat.toFixed(6)}, {displaySpot.lng.toFixed(6)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {onRecordActivity && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onRecordActivity(displaySpot)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base"
                          >
                            🍵 Записать сессию здесь
                          </motion.button>
                        )}
                        
                        {/* Edit Button - Only for owners */}
                        {isOwner && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditing(true)}
                            className="px-3 sm:px-4 py-2 bg-tea-100 hover:bg-tea-200 text-tea-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tea-500 focus:ring-offset-2 text-sm sm:text-base w-full sm:w-auto flex justify-center items-center"
                          >
                            ✏️ Редактировать
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                      <ActivityList
                        endpoint={`/api/activities/spot/${displaySpot.id}`}
                        emptyMessage="Пока нет чайных сессий в этом споте"
                        showPagination={false}
                        limit={10}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}