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

**Phase 3: Social Tea Activity System (📋 Planned)**
- Tea session/activity recording (Strava-style)
- Activity feed with social interactions
- User profiles and following system
- Rich activity details (mood, taste notes, insights)

**Phase 4: Advanced Features (🎯 Future)**
- Real-time WebSocket connections
- Push notification system
- Background job processing
- Advanced search and filtering

**Phase 5: Mobile App (📱 Future)**
- React Native/Flutter mobile app
- Offline sync capabilities
- Native camera integration
- Push notifications

## New Architecture Plan (Target)

### Backend API Server (Node.js/Express)
- **Authentication**: JWT tokens with refresh mechanism
- **Database**: PostgreSQL with Prisma ORM
- **API Endpoints**: RESTful API with versioning (/api/v1/)
- **Real-time**: WebSocket server for live activity feed
- **File Upload**: Cloud storage integration (AWS S3/Cloudinary)
- **Background Jobs**: Bull Queue for processing
- **Push Notifications**: Firebase Cloud Messaging

### Frontend Web App (Next.js)
- **API Consumer**: Calls backend API endpoints
- **Landing Page**: Marketing site (current)
- **Map Interface**: Interactive spot discovery
- **Activity Feed**: Strava-style timeline
- **Profile Management**: User profiles and settings

### Database Schema (PostgreSQL)
- **Users**: Authentication, profiles, preferences
- **Activities**: Tea sessions with rich metadata
- **Spots**: Enhanced location data
- **Social**: Following relationships, interactions
- **Media**: Photo/video attachments
- **Notifications**: Push notification tracking

### Mobile App (Future)
- **React Native/Flutter**: Native mobile app
- **Same API**: Consumes backend API endpoints
- **Native Features**: Camera, GPS, push notifications
- **Offline Sync**: Local data caching

## Implementation Milestones

### Phase 2 Milestones (Backend API Architecture) ✅ COMPLETED
1. **Backend Setup**
   - [x] Project structure planning
   - [x] Node.js/Express server setup
   - [x] PostgreSQL database configuration
   - [x] Prisma ORM integration

2. **Database Design**
   - [x] Users table with authentication
   - [x] Activities table for tea sessions
   - [x] Enhanced spots table
   - [x] Social relationships (following)
   - [x] Media attachments system
   - [x] Comments and likes system
   - [x] Notifications system

3. **Data Migration**
   - [x] SQLite to PostgreSQL migration
   - [x] Data validation and testing
   - [x] 12 spots migrated successfully
   - [x] Default user created

4. **Core API Endpoints**
   - [x] Basic CRUD operations
   - [x] Test endpoints for database validation
   - [x] Activity creation testing
   - [x] User and spot relationship queries

5. **Testing & Validation**
   - [x] Database connection testing
   - [x] Schema validation
   - [x] Test activity creation
   - [x] API endpoint verification

**Current Status**: Backend API server running on `http://localhost:3002`
**Database**: PostgreSQL with comprehensive schema for social tea platform
**Next Phase**: JWT authentication system and frontend integration

### Phase 3 Milestones (Social Tea Activity System) - NEXT PHASE
1. **JWT Authentication System**
   - [ ] JWT token generation and validation
   - [ ] User registration endpoint
   - [ ] User login endpoint
   - [ ] Password hashing with bcrypt
   - [ ] Refresh token mechanism

2. **Activity Recording System**
   - [ ] Activity creation API endpoints
   - [ ] Activity CRUD operations
   - [ ] Tea session metadata handling
   - [ ] Activity validation and sanitization

3. **Social Features**
   - [ ] Follow/unfollow system
   - [ ] Activity comments and likes
   - [ ] User activity feeds
   - [ ] Privacy controls

4. **Frontend Integration**
   - [ ] Update Next.js to consume backend API
   - [ ] Replace SQLite calls with API calls
   - [ ] Add authentication UI components
   - [ ] Implement activity recording interface

5. **File Upload Service**
   - [ ] Cloud storage integration (AWS S3/Cloudinary)
   - [ ] Image processing pipeline
   - [ ] Multiple file formats support

### Phase 4 Milestones (Advanced Features)
- [ ] Real-time WebSocket connections
- [ ] Push notification system
- [ ] Background job processing
- [ ] Advanced analytics

### Phase 5 Milestones (Mobile App)
- [ ] Mobile app development
- [ ] Native features integration
- [ ] Offline sync implementation
- [ ] App store deployment

## Social Tea Activity Features (Strava-Style)

### Core Activity Components
- **Spot**: Where the tea session happened
- **Tea Type**: What tea was consumed (oolong, sencha, pu-erh, etc.)
- **Photo**: Visual of the tea, setup, or environment
- **Mood**: Pre/post session emotional state
- **Taste Notes**: Flavor profile, aroma, mouthfeel
- **Insights**: Personal reflections, mindfulness notes
- **Duration**: How long the session lasted
- **Weather**: Environmental conditions
- **Companions**: Who joined the session

### Activity Feed Features
- Timeline of friends' tea sessions
- Activity cards with rich metadata
- Social interactions (likes, comments, shares)
- Activity detail pages
- Search and filtering capabilities

### User Profile Features
- Activity history and statistics
- Tea preferences and evolution
- Favorite spots and teas
- Social connections (following/followers)
- Personal tea journey insights

## Development Guidelines

### Code Standards
- **TypeScript**: Strict typing for all new code
- **ESLint**: Consistent code formatting
- **Prisma**: Database schema and migrations
- **API Versioning**: All endpoints under /api/v1/
- **Error Handling**: Comprehensive error responses
- **Testing**: Unit tests for business logic

### Security Requirements
- **Authentication**: JWT tokens with secure refresh
- **Authorization**: Role-based access control
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **CORS**: Proper cross-origin configuration
- **Data Privacy**: GDPR-compliant data handling

### Performance Considerations
- **Database Indexing**: Optimize query performance
- **Caching**: Redis for frequently accessed data
- **Image Processing**: Optimize and compress uploads
- **API Pagination**: Limit response sizes
- **Background Jobs**: Async processing for heavy tasks

## Current Project Structure (Phase 2 Complete)

### Backend API Server (`/backend/`)
```
/backend/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration files
├── generated/                     # Generated Prisma client
├── server.js                      # Express API server
├── migrate-sqlite-data.js         # Data migration script
├── .env                          # Environment variables
└── package.json                  # Backend dependencies
```

### Database Schema (PostgreSQL)
- **users**: Authentication, profiles, social features
- **activities**: Tea sessions with rich metadata (Strava-style)
- **spots**: Enhanced location data with creator attribution
- **follows**: Social following relationships
- **media**: Photo/video attachments
- **activity_comments**: Comments on activities
- **activity_likes**: Like system for activities
- **notifications**: Push notification system

### API Endpoints (Available)
- `GET /` - API status and info
- `GET /test-db` - Database connection test
- `GET /api/spots` - Get all spots with creator info
- `GET /api/users` - Get all users with stats
- `POST /api/test-activity` - Create test tea activity

### Frontend (Next.js) - Legacy Architecture

This section describes the current Next.js full-stack implementation that will be updated to consume the backend API.

### Technology Stack

- **Next.js 15** with App Router (`/app` directory)
- **TypeScript** for type safety
- **Leaflet** for interactive maps (client-side only)
- **SQLite** with better-sqlite3 for local database storage
- **Local file storage** for image uploads

### Key Architecture Patterns

1. **Client-Side Map Components**: All Leaflet-related code is in client components (`'use client'`) to avoid SSR issues
2. **API Routes**: RESTful endpoints in `/app/api/` for spots and file uploads
3. **Database Integration**: SQLite database with better-sqlite3 for local data storage
4. **File Upload Flow**: Images uploaded to local storage, file paths stored in SQLite database

### Data Model

The core entity is a `Spot` defined in `lib/spots.ts`:
```typescript
type Spot = {
  id: string;               // UUID
  name: string;
  description: string;
  longDescription: string;
  image: string;           // URL to uploaded image
  lat: number;
  lng: number;
  created_at?: string;     // SQLite timestamp
}
```

### Core Components

- **`components/ClientMap.tsx`**: Main map interface with spot list sidebar, handles user interactions
- **`components/SpotForm.tsx`**: Form for adding new spots with image upload
- **`components/TeaMap.tsx`**: Simple map component (legacy, kept for reference)
- **`app/api/spots/route.ts`**: API endpoints for CRUD operations on spots
- **`app/api/upload/route.ts`**: Local file upload handling
- **`lib/sqlite.ts`**: SQLite database utilities and operations

### Database Schema

The application uses SQLite with a table named `tea_spots` containing:
- `id` (TEXT PRIMARY KEY) - UUID
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `long_description` (TEXT)
- `image` (TEXT)
- `lat` (REAL NOT NULL)
- `lng` (REAL NOT NULL)
- `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)

### Database File

- **Database Location**: `data/spots.db` (auto-created)
- **Database Library**: better-sqlite3 for synchronous operations
- **Data Persistence**: SQLite file is excluded from git (.gitignore)

### File Upload Configuration

- **Upload Directory**: `public/uploads/` (auto-created)
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Max File Size**: 4MB
- **File Naming**: UUID-based unique filenames
- **Serving**: Static files served by Next.js from `public/uploads/`

### Key Implementation Details

1. **Map Initialization**: Leaflet maps are initialized in `useEffect` to avoid SSR conflicts
2. **Spot Interactions**: Clicking map markers or list items centers the map and opens spot details
3. **Random Spot Feature**: "Найти лучший спот" button selects a random spot and navigates to it
4. **Image Upload**: Uses local file storage with drag-and-drop interface and URL fallback
5. **Responsive Design**: Layout adapts with sidebar (28vw) and map area (72vw)

### File Structure

```
/app/
  /api/
    /spots/route.ts          # Spot CRUD operations
    /upload/route.ts         # Local file upload endpoint
  layout.tsx                 # Root layout  
  page.tsx                   # Home page with redirect to map
  /map/page.tsx             # Main map page
/components/
  ClientMap.tsx             # Main map component
  SpotForm.tsx              # Add spot form
  SpotImageUploader.tsx     # Image upload component
  SpotModal.tsx             # Spot details modal
  TeaMap.tsx                # Legacy map component
/lib/
  spots.ts                  # Spot type definition and sample data
  sqlite.ts                 # SQLite database utilities and operations
  supabaseClient.ts         # Supabase client (commented out)
/public/
  uploads/                  # Local image storage directory
```

### Development Notes

- The application uses Russian language in the UI
- Map defaults to Moscow coordinates (55.751244, 37.618423)
- Tea-themed icons from OpenMoji are used throughout
- Strict TypeScript mode is disabled (`"strict": false`)
- Local file uploads are stored in `public/uploads/` and served statically
- Image uploads support drag-and-drop and URL input fallback
- No additional testing framework is configured