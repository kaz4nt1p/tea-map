"use client";
import React, { useState } from 'react';
import { Media } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityPhotoGridProps {
  photos: Media[];
  onPhotoClick?: (photoIndex: number) => void;
}

interface PhotoLightboxProps {
  photos: Media[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <img
          src={photos[activeIndex]?.file_path}
          alt={photos[activeIndex]?.alt_text || 'Activity photo'}
          className="w-full h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ActivityPhotoGrid: React.FC<ActivityPhotoGridProps> = ({
  photos,
  onPhotoClick
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    onPhotoClick?.(index);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  // Single photo
  if (photos.length === 1) {
    return (
      <>
        <div className="aspect-video bg-gray-100 overflow-hidden rounded-lg cursor-pointer">
          <img
            src={photos[0].file_path}
            alt={photos[0].alt_text || 'Activity photo'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onClick={() => handlePhotoClick(0)}
          />
        </div>
        
        <AnimatePresence>
          <PhotoLightbox
            photos={photos}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </AnimatePresence>
      </>
    );
  }

  // Two photos
  if (photos.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-video">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => handlePhotoClick(index)}
            >
              <img
                src={photo.file_path}
                alt={photo.alt_text || `Activity photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        
        <AnimatePresence>
          <PhotoLightbox
            photos={photos}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </AnimatePresence>
      </>
    );
  }

  // Three photos - Strava style: 1 large + 2 small
  if (photos.length === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-video">
          {/* Large photo on left */}
          <div
            className="relative bg-gray-100 cursor-pointer overflow-hidden row-span-2"
            onClick={() => handlePhotoClick(0)}
          >
            <img
              src={photos[0].file_path}
              alt={photos[0].alt_text || 'Activity photo 1'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Two smaller photos stacked on right */}
          {photos.slice(1, 3).map((photo, index) => (
            <div
              key={photo.id}
              className="relative bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => handlePhotoClick(index + 1)}
            >
              <img
                src={photo.file_path}
                alt={photo.alt_text || `Activity photo ${index + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        
        <AnimatePresence>
          <PhotoLightbox
            photos={photos}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </AnimatePresence>
      </>
    );
  }

  // Four photos - 2x2 grid
  if (photos.length === 4) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-video">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => handlePhotoClick(index)}
            >
              <img
                src={photo.file_path}
                alt={photo.alt_text || `Activity photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        
        <AnimatePresence>
          <PhotoLightbox
            photos={photos}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </AnimatePresence>
      </>
    );
  }

  // Five or more photos - Strava style: 2 large + 3 small with "+X more" overlay
  const remainingCount = photos.length - 4;
  
  return (
    <>
      <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden aspect-video">
        {/* Two large photos on top row */}
        {photos.slice(0, 2).map((photo, index) => (
          <div
            key={photo.id}
            className="relative bg-gray-100 cursor-pointer overflow-hidden col-span-2"
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.file_path}
              alt={photo.alt_text || `Activity photo ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
        
        {/* Three smaller photos on bottom row */}
        {photos.slice(2, 5).map((photo, index) => (
          <div
            key={photo.id}
            className="relative bg-gray-100 cursor-pointer overflow-hidden"
            onClick={() => handlePhotoClick(index + 2)}
          >
            <img
              src={photo.file_path}
              alt={photo.alt_text || `Activity photo ${index + 3}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            
            {/* "+X more" overlay on last photo */}
            {index === 2 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </AnimatePresence>
    </>
  );
};

export default ActivityPhotoGrid;