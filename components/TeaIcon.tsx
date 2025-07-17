import React from 'react';

interface TeaIconProps {
  className?: string;
  size?: number;
  variant?: 'filled' | 'outlined' | 'marker';
}

export default function TeaIcon({ className = '', size = 24, variant = 'filled' }: TeaIconProps) {
  const isMarker = variant === 'marker';
  const strokeWidth = variant === 'outlined' ? '1.5' : '1';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tea Cup Body */}
      <path
        d="M4 8 C4 8, 4 16, 6 18 C8 20, 16 20, 18 18 C20 16, 20 8, 20 8 L4 8 Z"
        fill={variant === 'outlined' ? 'none' : 'url(#teaCupGradient)'}
        stroke={variant === 'outlined' ? 'currentColor' : 'none'}
        strokeWidth={strokeWidth}
      />
      
      {/* Tea Cup Handle */}
      <path
        d="M20 10 C22 10, 22 14, 20 14"
        stroke={variant === 'outlined' ? 'currentColor' : 'url(#handleGradient)'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Tea Cup Rim */}
      <ellipse
        cx="12"
        cy="8"
        rx="8"
        ry="2"
        fill={variant === 'outlined' ? 'none' : 'url(#rimGradient)'}
        stroke={variant === 'outlined' ? 'currentColor' : 'none'}
        strokeWidth={strokeWidth}
      />
      
      {/* Tea Liquid */}
      <ellipse
        cx="12"
        cy="8.5"
        rx="6.5"
        ry="1.5"
        fill={variant === 'outlined' ? 'none' : 'url(#teaLiquidGradient)'}
        opacity="0.8"
      />
      
      {/* Steam Lines */}
      <path
        d="M8 6 Q9 4, 8 2"
        stroke={variant === 'outlined' ? 'currentColor' : 'url(#steamGradient)'}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M12 6 Q13 4, 12 2"
        stroke={variant === 'outlined' ? 'currentColor' : 'url(#steamGradient)'}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M16 6 Q17 4, 16 2"
        stroke={variant === 'outlined' ? 'currentColor' : 'url(#steamGradient)'}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />
      
      {/* Tea Leaves (only for marker variant) */}
      {isMarker && (
        <>
          <circle cx="6" cy="4" r="1.5" fill="url(#leafGradient)" opacity="0.6" />
          <circle cx="18" cy="4" r="1.5" fill="url(#leafGradient)" opacity="0.6" />
          <circle cx="3" cy="10" r="1" fill="url(#leafGradient)" opacity="0.4" />
          <circle cx="21" cy="12" r="1" fill="url(#leafGradient)" opacity="0.4" />
        </>
      )}
      
      {/* Gradients - matching ForestTeaLogo colors */}
      <defs>
        <linearGradient id="teaCupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7d7467" />
          <stop offset="100%" stopColor="#5a5248" />
        </linearGradient>
        
        <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b6356" />
          <stop offset="100%" stopColor="#4a453e" />
        </linearGradient>
        
        <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8a8174" />
          <stop offset="100%" stopColor="#6b6356" />
        </linearGradient>
        
        <linearGradient id="teaLiquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7db86d" />
          <stop offset="100%" stopColor="#5a9b47" />
        </linearGradient>
        
        <linearGradient id="steamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d0e8c7" />
          <stop offset="100%" stopColor="#a8d49a" />
        </linearGradient>
        
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7db86d" />
          <stop offset="100%" stopColor="#5a9b47" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Export convenience variants
export const TeaIconFilled = (props: Omit<TeaIconProps, 'variant'>) => (
  <TeaIcon {...props} variant="filled" />
);

export const TeaIconOutlined = (props: Omit<TeaIconProps, 'variant'>) => (
  <TeaIcon {...props} variant="outlined" />
);

export const TeaIconMarker = (props: Omit<TeaIconProps, 'variant'>) => (
  <TeaIcon {...props} variant="marker" />
);