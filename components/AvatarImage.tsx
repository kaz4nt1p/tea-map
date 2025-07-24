'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallback,
  size = 'md'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerClasses = className || sizeClasses[size];

  if (imageError || !src) {
    return (
      <div className={`${containerClasses} bg-gradient-to-br from-tea-500 to-sage-600 rounded-full flex items-center justify-center text-white`}>
        {fallback || <User className={`${iconSizes[size]} text-white`} />}
      </div>
    );
  }

  return (
    <div className={`${containerClasses} bg-gradient-to-br from-tea-500 to-sage-600 rounded-full flex items-center justify-center text-white relative overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full rounded-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback || <User className={`${iconSizes[size]} text-white`} />}
        </div>
      )}
    </div>
  );
};

export default AvatarImage;