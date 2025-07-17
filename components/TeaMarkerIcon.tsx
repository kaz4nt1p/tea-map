// Tea Marker Icon for Leaflet Maps
// This creates a custom map marker using solid colors (no gradients) for better compatibility

export function createTeaMarkerSVG(size: number = 48): string {
  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Background Circle -->
      <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#5a9b47" stroke-width="2"/>
      
      <!-- Tea Cup Body -->
      <path
        d="M12 20 C12 20, 12 32, 15 36 C18 40, 30 40, 33 36 C36 32, 36 20, 36 20 L12 20 Z"
        fill="#6b6356"
      />
      
      <!-- Tea Cup Handle -->
      <path
        d="M36 24 C40 24, 40 32, 36 32"
        stroke="#5a5248"
        stroke-width="2"
        fill="none"
      />
      
      <!-- Tea Cup Rim -->
      <ellipse
        cx="24"
        cy="20"
        rx="12"
        ry="3"
        fill="#7d7467"
      />
      
      <!-- Tea Liquid -->
      <ellipse
        cx="24"
        cy="21"
        rx="10"
        ry="2.5"
        fill="#7db86d"
        opacity="0.8"
      />
      
      <!-- Steam Lines -->
      <path
        d="M16 16 Q18 12, 16 8"
        stroke="#a8d49a"
        stroke-width="2"
        fill="none"
        opacity="0.7"
        stroke-linecap="round"
      />
      <path
        d="M24 16 Q26 12, 24 8"
        stroke="#a8d49a"
        stroke-width="2"
        fill="none"
        opacity="0.7"
        stroke-linecap="round"
      />
      <path
        d="M32 16 Q34 12, 32 8"
        stroke="#a8d49a"
        stroke-width="2"
        fill="none"
        opacity="0.7"
        stroke-linecap="round"
      />
      
      <!-- Tea Leaves -->
      <circle cx="12" cy="8" r="2" fill="#5a9b47" opacity="0.6" />
      <circle cx="36" cy="8" r="2" fill="#5a9b47" opacity="0.6" />
      <circle cx="6" cy="20" r="1.5" fill="#5a9b47" opacity="0.4" />
      <circle cx="42" cy="24" r="1.5" fill="#5a9b47" opacity="0.4" />
    </svg>
  `;
}

// Create data URL for the marker icon
export function createTeaMarkerDataURL(size: number = 48): string {
  const svg = createTeaMarkerSVG(size);
  // Use URL encoding instead of base64 for better compatibility
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Alternative: Use a reliable tea cup emoji as fallback
export function createTeaEmojiMarkerDataURL(size: number = 48): string {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="white" stroke="#5a9b47" stroke-width="2"/>
      <text x="24" y="32" text-anchor="middle" font-size="20" font-family="Arial, sans-serif">🍵</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Simple tea cup icon with solid colors - no complex paths
export function createSimpleTeaMarkerDataURL(size: number = 48): string {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#5a9b47" stroke-width="2"/>
      
      <!-- Simple tea cup shape -->
      <rect x="14" y="18" width="16" height="16" rx="2" fill="#7d7467"/>
      <rect x="14" y="18" width="16" height="3" fill="#6b6356"/>
      <rect x="16" y="20" width="12" height="2" fill="#7db86d"/>
      
      <!-- Handle -->
      <path d="M30 22 L34 22 L34 28 L30 28" stroke="#5a5248" stroke-width="2" fill="none"/>
      
      <!-- Steam -->
      <circle cx="18" cy="14" r="1" fill="#a8d49a"/>
      <circle cx="22" cy="12" r="1" fill="#a8d49a"/>
      <circle cx="26" cy="14" r="1" fill="#a8d49a"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}