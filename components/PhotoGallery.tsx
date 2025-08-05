import { motion } from 'framer-motion';
import { useState } from 'react';

interface Photo {
  id: string;
  file_path: string;
  alt_text?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  maxPhotos?: number;
  className?: string;
}

export default function PhotoGallery({ 
  photos, 
  maxPhotos = 5, 
  className = "" 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Limit photos to maxPhotos
  const displayPhotos = photos.slice(0, maxPhotos);
  
  if (displayPhotos.length === 0) {
    return null;
  }

  const openLightbox = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const renderPhotoGrid = () => {
    if (displayPhotos.length === 1) {
      // Single photo - full width, more compact
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative h-40 sm:h-44 bg-tea-100 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => openLightbox(displayPhotos[0].file_path)}
        >
          <img
            src={displayPhotos[0].file_path}
            alt={displayPhotos[0].alt_text || 'Spot photo'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>
      );
    }

    if (displayPhotos.length === 2) {
      // Two photos - side by side, more compact
      return (
        <div className="grid grid-cols-2 gap-2">
          {displayPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.02 }}
              className="relative h-28 sm:h-32 bg-tea-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(photo.file_path)}
            >
              <img
                src={photo.file_path}
                alt={photo.alt_text || `Spot photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          ))}
        </div>
      );
    }

    // 3+ photos - main photo + grid, more compact
    const mainPhoto = displayPhotos[0];
    const gridPhotos = displayPhotos.slice(1, 5); // Max 4 additional photos
    
    return (
      <div className="grid grid-cols-4 gap-2 h-40 sm:h-44">
        {/* Main photo - takes up 2 columns */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="col-span-2 relative bg-tea-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openLightbox(mainPhoto.file_path)}
        >
          <img
            src={mainPhoto.file_path}
            alt={mainPhoto.alt_text || 'Main spot photo'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>
        
        {/* Grid of smaller photos */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {gridPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.02 }}
              className="relative bg-tea-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(photo.file_path)}
            >
              <img
                src={photo.file_path}
                alt={photo.alt_text || `Spot photo ${index + 2}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Show count if there are more photos */}
              {index === 3 && photos.length > maxPhotos && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    +{photos.length - maxPhotos}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={className}>
        {renderPhotoGrid()}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Full size photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Close lightbox"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}