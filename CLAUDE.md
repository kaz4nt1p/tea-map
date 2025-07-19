# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build the application for production
- `npm start` - Start production server

### Backend (Express API)
- `cd backend && npm run dev` - Start backend API server (port 3002)
- `cd backend && npm start` - Start backend in production mode

### Database
- `cd backend && npx prisma migrate dev` - Run database migrations
- `cd backend && npx prisma generate` - Generate Prisma client
- `cd backend && npx prisma studio` - Open Prisma database browser

## Project Vision & Architecture Evolution

This is a **Tea Map** application evolving into a **Social Tea Activity Platform** - a Strava-like social network for tea enthusiasts to share their tea sessions, discover spots, and connect with other tea lovers.

### Evolution Roadmap

**Phase 1: Current State (✅ Completed)**
- Basic tea spot mapping with Next.js 15 + SQLite
- Interactive map with spot creation and viewing
- Image upload and basic spot management
- Modern landing page with tea ceremony theme

**Phase 2: Backend API Architecture (✅ Completed)**
- Separate Node.js/Express backend API server
- PostgreSQL database with Prisma ORM
- Comprehensive database schema for social features
- Basic REST API endpoints with test functionality
- Data migration from SQLite to PostgreSQL

**Phase 3: Social Tea Activity System (✅ Completed)**
- Tea session/activity recording (Strava-style)
- Activity feed with social interactions
- User profiles and activity timelines
- Rich activity details (mood, taste notes, insights)

**Phase 3.5: UI/UX Enhancements (✅ Completed)**
- Consistent tea icon design system across all components
- Custom branded tea cup icons for map markers
- Fixed profile photo display issues using AvatarImage component
- Auto-refresh functionality for activity feeds
- Improved user navigation and profile access
- Next.js 15 compatibility fixes for async params

**Phase 3.6: Search & Statistics Features (✅ Completed)**
- Server-side spot search with text filtering
- Enhanced SpotSelector with always-visible "Create new spot" button
- Proper spot creation flow requiring map click first
- Clickable popular spots on dashboard
- Real-time community statistics (active users, sessions today, new spots)
- API proxy system for frontend-backend communication
- Next.js router navigation for better UX
- Suspense boundaries for Next.js 15 compatibility

**Phase 3.7: UI/UX Consistency (✅ Completed)**
- Unified header system across all pages (dashboard, profile, map)
- Random spot discovery button for exploring new locations
- Consistent "Tea Map" branding throughout the application
- Removed old "Forest Tea" branding from landing page and navigation
- Improved page layout consistency and user experience

**Phase 3.8: Production Deployment (✅ Completed)**
- Full production deployment to VPS server (77.232.139.160)
- Domain setup with SSL: https://teamap.duckdns.org
- PostgreSQL database with proper OAuth schema
- PM2 process management with auto-restart
- Nginx reverse proxy with SSL termination
- Google OAuth integration with production URLs
- Environment configuration for production vs development
- Database schema migration for OAuth fields (google_id, auth_provider)

**Phase 4: Advanced Features (🎯 Future)**
- Real-time WebSocket connections
- Push notification system
- Background job processing
- Advanced search and filtering with distance-based results
- Map-based spot selection interface
- Favorite and recent spots functionality
- Geographic search with radius filtering

**Phase 5: Mobile App (📱 Future)**
- React Native/Flutter mobile app
- Offline sync capabilities
- Native camera integration
- Push notifications

## Recent Improvements (January 2025)

### Tea Icon Design System
- **Components**: `TeaIcon.tsx`, `TeaMarkerIcon.tsx`
- **Variants**: filled, outlined, marker (with decorative leaves)
- **Colors**: Consistent with ForestTeaLogo brand colors
- **Usage**: Map markers, navigation, activity cards

### Profile & Navigation Fixes
- **Profile Photos**: Fixed using AvatarImage component on activity detail pages
- **Profile Navigation**: Fixed profile button in user dropdown menu
- **Auto-refresh**: Activity feed refreshes after creating new activities
- **Next.js 15**: All API routes updated for async params compatibility

### Search & Statistics Features (Latest)
- **Spot Search**: Server-side search with text filtering on name, description, and address
- **SpotSelector**: Enhanced with always-visible "Create new spot" button
- **Spot Creation Flow**: Users must click map location first, then create spot
- **Popular Spots**: Made clickable on dashboard, navigate to map view
- **Community Stats**: Real-time data showing active users, sessions today, new spots
- **API Architecture**: Frontend-backend proxy system for better data handling

### Technical Improvements
- **Map Markers**: Custom tea cup icons replace OpenMoji leaf icons
- **Icon Consistency**: All tea-related UI elements use unified design
- **Component Reusability**: Modular icon system with multiple variants
- **Performance**: Optimized SVG rendering for map compatibility
- **Type Safety**: Fixed ActivityForm type compatibility issues
- **Navigation**: Next.js router navigation for better UX

## Production Deployment Details

### Live Application
- **Production URL**: https://teamap.duckdns.org
- **Server**: Ubuntu 22.04 VPS (77.232.139.160)
- **Database**: PostgreSQL with Prisma ORM
- **Process Manager**: PM2 with auto-restart on boot
- **Web Server**: Nginx with SSL/TLS termination

### Deployment Commands
```bash
# Frontend production commands
npm run build          # Build for production
npm run start          # Start production server (port 3000)
pm2 start "npm run start" --name "tea-map-frontend"

# Backend production commands  
cd backend
npm run start          # Start backend server (port 3002)
pm2 start "npm run start" --name "tea-map-backend"

# Database operations
npx prisma db push --accept-data-loss  # Update schema
npx prisma generate                    # Regenerate client
```

### Environment Configuration
- **Frontend**: `.env.local` with `NEXT_PUBLIC_BACKEND_URL=https://teamap.duckdns.org`
- **Backend**: `.env` with PostgreSQL connection and OAuth secrets
- **Google OAuth**: Requires production domains in Google Cloud Console:
  - Authorized JavaScript origins: `https://teamap.duckdns.org`
  - Authorized redirect URIs: `https://teamap.duckdns.org/api/auth/google/callback`

### Troubleshooting
- **Database Schema**: Use `npx prisma db push` to sync schema changes
- **OAuth Issues**: Verify Google Cloud Console URLs match production domain
- **Port Configuration**: Frontend runs on 3000, backend on 3002 (not 3001)
- **SSL Issues**: Restart nginx after config changes: `systemctl restart nginx`

## Memory Management

### Project Interactions
- **Production Deployment Completed**: July 19, 2025 - Full deployment with OAuth integration
- **Database Schema Fixed**: Added missing google_id and auth_provider columns for OAuth
- **Domain & SSL**: teamap.duckdns.org configured with Let's Encrypt SSL certificate
- **Google OAuth Setup**: Requires /callback suffix in redirect URIs configuration
- **Process Management**: PM2 configured for auto-restart with saved configuration