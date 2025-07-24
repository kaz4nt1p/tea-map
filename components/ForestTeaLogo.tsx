import React from 'react';

interface ForestTeaLogoProps {
  className?: string;
  size?: number;
}

export default function ForestTeaLogo({ className = '', size = 40 }: ForestTeaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Forest Background Elements */}
      <circle cx="24" cy="24" r="22" fill="url(#forestGradient)" opacity="0.1" />
      
      {/* Tree/Forest Elements */}
      <path
        d="M8 36 C8 32, 12 30, 16 32 C18 28, 22 29, 24 32 C26 29, 30 28, 32 32 C36 30, 40 32, 40 36 L40 40 L8 40 Z"
        fill="url(#treeGradient)"
        opacity="0.3"
      />
      
      {/* Tea Leaves */}
      <path
        d="M12 18 Q14 16, 16 18 Q18 20, 16 22 Q14 20, 12 18 Z"
        fill="url(#leafGradient)"
        opacity="0.8"
      />
      <path
        d="M30 16 Q32 14, 34 16 Q36 18, 34 20 Q32 18, 30 16 Z"
        fill="url(#leafGradient)"
        opacity="0.8"
      />
      
      {/* Central Tea Ceremony Element - Teapot */}
      <ellipse cx="24" cy="28" rx="8" ry="6" fill="url(#teapotGradient)" />
      <path
        d="M16 28 Q16 24, 20 24 L28 24 Q32 24, 32 28"
        fill="url(#teapotGradient)"
        opacity="0.9"
      />
      
      {/* Teapot Spout */}
      <path
        d="M32 26 Q36 24, 36 28 Q36 30, 34 30"
        stroke="url(#teapotGradient)"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Teapot Handle */}
      <path
        d="M16 26 Q12 24, 12 28 Q12 30, 14 30"
        stroke="url(#teapotGradient)"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Steam/Zen Elements */}
      <path
        d="M20 20 Q22 18, 24 20 Q26 18, 28 20"
        stroke="url(#steamGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M21 16 Q23 14, 25 16 Q27 14, 29 16"
        stroke="url(#steamGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      
      {/* Decorative Tea Leaves Around */}
      <circle cx="18" cy="12" r="2" fill="url(#leafGradient)" opacity="0.6" />
      <circle cx="30" cy="12" r="2" fill="url(#leafGradient)" opacity="0.6" />
      <circle cx="36" cy="20" r="1.5" fill="url(#leafGradient)" opacity="0.4" />
      <circle cx="12" cy="22" r="1.5" fill="url(#leafGradient)" opacity="0.4" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="forestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a9b47" />
          <stop offset="100%" stopColor="#3c6230" />
        </linearGradient>
        
        <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c38" />
          <stop offset="100%" stopColor="#2f4f28" />
        </linearGradient>
        
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7db86d" />
          <stop offset="100%" stopColor="#5a9b47" />
        </linearGradient>
        
        <linearGradient id="teapotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7d7467" />
          <stop offset="100%" stopColor="#5a5248" />
        </linearGradient>
        
        <linearGradient id="steamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d0e8c7" />
          <stop offset="100%" stopColor="#a8d49a" />
        </linearGradient>
      </defs>
    </svg>
  );
}