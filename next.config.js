/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Tea Map frontend
  images: {
    // Allow images from Cloudinary in production
    domains: ['res.cloudinary.com', 'localhost', 'localhost:3001', 'localhost:3002'],
    // Support modern image formats
    formats: ['image/webp', 'image/avif'],
    // Enable automatic image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable compression
  compress: true,
  // Remove powered by header
  poweredByHeader: false,
  // Disable etags generation to reduce memory usage
  generateEtags: false,
  // HTTP agent options for better connection handling
  httpAgentOptions: {
    keepAlive: true,
  },
  // On demand entries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig