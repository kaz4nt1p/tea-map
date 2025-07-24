#!/bin/bash

# Tea Map Production Environment Setup Script
# This script helps generate secure secrets for production deployment

echo "🍵 Tea Map Production Environment Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Function to generate session secret
generate_session_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

echo -e "${YELLOW}Generating secure secrets...${NC}"

# Generate secrets
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_session_secret)

# Create production environment file
cat > .env.production << EOF
# ==============================================
# TEA MAP BACKEND - PRODUCTION CONFIGURATION
# ==============================================
# Generated on: $(date)

# Database Configuration
# Replace with your production PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:5432/tea_map_prod"
DIRECT_URL="postgresql://username:password@host:5432/tea_map_prod"

# JWT Secrets (GENERATED - KEEP SECURE!)
JWT_SECRET="${JWT_SECRET}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"

# Session Secret (GENERATED - KEEP SECURE!)
SESSION_SECRET="${SESSION_SECRET}"

# Server Configuration
PORT=3002
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL="https://your-domain.com"

# Cloudinary Configuration (Image Upload)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="https://your-domain.com/api/auth/google/callback"

# Security Headers (Production)
ALLOWED_ORIGINS="https://your-domain.com"
SECURITY_HEADERS_ENABLED=true

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Performance Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

EOF

echo -e "${GREEN}✅ Production environment file created: .env.production${NC}"
echo ""
echo -e "${YELLOW}🔐 IMPORTANT SECURITY NOTES:${NC}"
echo -e "${RED}1. NEVER commit .env.production to version control${NC}"
echo -e "${RED}2. Store these secrets securely (password manager, vault, etc.)${NC}"
echo -e "${RED}3. Use different secrets for different environments${NC}"
echo ""
echo -e "${YELLOW}📝 TODO - Update these values in .env.production:${NC}"
echo "   - DATABASE_URL (your production PostgreSQL connection)"
echo "   - FRONTEND_URL (your production domain)"
echo "   - CLOUDINARY_* (your Cloudinary account details)"
echo "   - GOOGLE_* (if using Google OAuth)"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "   1. Update the TODO values in .env.production"
echo "   2. Copy .env.production to your production server"
echo "   3. Set up your production database"
echo "   4. Run database migrations"
echo "   5. Deploy your application"
echo ""
echo -e "${GREEN}Generated secrets are ready for production use!${NC}"