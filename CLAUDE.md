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

**Current Status**: 
- Backend API server running on `http://localhost:3002`
- Frontend development server running on `http://localhost:3001`
- Database: PostgreSQL with comprehensive schema for social tea platform
- Authentication: Google OAuth and JWT authentication system implemented
- Activity System: Full Strava-like activity recording and social features implemented
- **Next Phase**: Cloud file upload service and advanced features

### Phase 3 Milestones (Social Tea Activity System) ✅ COMPLETED
1. **JWT Authentication System** ✅ COMPLETED
   - [x] JWT token generation and validation
   - [x] User registration endpoint
   - [x] User login endpoint
   - [x] Password hashing with bcrypt
   - [x] Refresh token mechanism
   - [x] Google OAuth integration
   - [x] Session management with Passport
   - [x] Frontend authentication context
   - [x] Authentication state persistence
   - [x] Protected routes and redirects

2. **Activity Recording System** ✅ COMPLETED
   - [x] Activity creation API endpoints
   - [x] Activity CRUD operations (GET, POST, PUT, DELETE)
   - [x] Tea session metadata handling
   - [x] Activity validation and sanitization
   - [x] Activity by spot endpoint
   - [x] Activity by user endpoint
   - [x] Activity detail pages
   - [x] Activity like/unlike functionality

3. **Social Features** ✅ COMPLETED (Basic Implementation)
   - [x] Activity comments and likes (API ready)
   - [x] User activity feeds
   - [x] Privacy controls (public, friends, private)
   - [ ] Follow/unfollow system (API ready, UI pending)

4. **Frontend Integration** ✅ COMPLETED
   - [x] Update Next.js to consume backend API
   - [x] Replace SQLite calls with API calls
   - [x] Add authentication UI components
   - [x] Implement Google OAuth sign-in
   - [x] Add JWT token management
   - [x] Create authentication context and hooks
   - [x] Add protected route components
   - [x] Implement user menu and profile management
   - [x] Implement activity recording interface
   - [x] Create Dashboard with Strava-like activity feed
   - [x] Create Profile page with user's activity timeline
   - [x] Create Activity detail pages
   - [x] Update navigation to activity-focused structure
   - [x] Fix authentication token handling in API calls
   - [x] Create API proxy routes for frontend-backend communication

5. **File Upload Service** 📋 PLANNED
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

## Recent Updates (Phase 3 Authentication - Complete)

### Google OAuth Authentication Implementation ✅ COMPLETED
- **Google OAuth Strategy**: Implemented with Passport.js for secure authentication
- **JWT Token Management**: Access and refresh tokens with proper expiration handling
- **Session Management**: Express-session middleware for Passport state management
- **Frontend Integration**: React context for authentication state management
- **User Persistence**: Token storage in sessionStorage, user data in localStorage
- **Protected Routes**: Automatic redirects for authenticated/unauthenticated users
- **Error Handling**: Comprehensive OAuth error handling with user-friendly messages

### Authentication Features
- **Google Sign-In**: One-click authentication with Google accounts
- **Token Management**: Secure JWT tokens with refresh mechanism
- **User Profiles**: Automatic user creation and profile management
- **State Persistence**: Authentication state maintained across browser sessions
- **Route Protection**: `/auth` page for guests, `/map` for authenticated users

### Technical Implementation
- **Backend**: Node.js/Express with Passport Google OAuth 2.0 strategy
- **Frontend**: Next.js 15 with React context and custom hooks
- **Database**: PostgreSQL with user authentication tables
- **Security**: JWT tokens, HTTP-only cookies, CORS protection

## Current Project Structure (Phase 3 Authentication Complete)

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

#### Authentication Endpoints
- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/refresh` - Refresh JWT access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback handler

#### Activity Endpoints
- `GET /api/activities` - Get all activities with pagination
- `POST /api/activities` - Create new activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `POST /api/activities/:id/like` - Like/unlike activity
- `GET /api/activities/spot/:spotId` - Get activities for specific spot
- `GET /api/activities/user/:username` - Get activities for specific user

#### Spot Endpoints
- `GET /api/spots` - Get all spots
- `POST /api/spots` - Create new spot
- `GET /api/spots/:id` - Get spot by ID
- `PUT /api/spots/:id` - Update spot
- `DELETE /api/spots/:id` - Delete spot

### Frontend (Next.js) - Updated Architecture ✅ COMPLETED

This section describes the current Next.js implementation that has been updated to consume the backend API with full authentication support.

### Technology Stack

- **Next.js 15** with App Router (`/app` directory)
- **TypeScript** for type safety
- **Leaflet** for interactive maps (client-side only)
- **PostgreSQL** via backend API endpoints
- **JWT Authentication** with Google OAuth integration
- **React Context** for authentication state management
- **Local file storage** for image uploads (legacy - will be migrated)

### Key Architecture Patterns

1. **Client-Side Map Components**: All Leaflet-related code is in client components (`'use client'`) to avoid SSR issues
2. **Backend API Integration**: Frontend consumes backend API endpoints instead of direct database access
3. **Authentication Context**: React context manages authentication state across the application
4. **Protected Routes**: Custom hooks handle authentication-based routing
5. **Token Management**: JWT tokens stored in sessionStorage with automatic refresh

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

### Current Implementation Status (Phase 3 Complete)

**Activity Recording System Features:**
- ✅ Comprehensive activity creation form with tea metadata
- ✅ Spot selection with search functionality
- ✅ Activity timeline and feed components
- ✅ Activity detail pages with full metadata display
- ✅ Activity likes and social interactions
- ✅ User profile pages with activity history
- ✅ Dashboard with Strava-like three-column layout
- ✅ Activity filtering and pagination
- ✅ Rich activity data model with TypeScript interfaces

**Technical Implementation:**
- ✅ Next.js API proxy routes for frontend-backend communication
- ✅ JWT authentication token handling in all API calls
- ✅ Comprehensive error handling and user feedback
- ✅ TypeScript interfaces for Activity, User, Spot, and related entities
- ✅ Date formatting with date-fns library
- ✅ Lucide React icons for consistent UI
- ✅ Responsive design with mobile-friendly components

### File Structure

```
/app/
  /api/
    /activities/route.ts     # Activity API proxy routes
    /spots/route.ts          # Spot CRUD operations
    /upload/route.ts         # Local file upload endpoint
  /dashboard/page.tsx        # Main dashboard with activity feed
  /profile/page.tsx          # User profile with activity timeline
  /activities/[id]/page.tsx  # Individual activity detail pages
  /map/page.tsx             # Map page with spot management
  layout.tsx                 # Root layout with navigation
  page.tsx                   # Home page with redirect to dashboard
/components/
  ActivityCard.tsx          # Activity display component
  ActivityList.tsx          # Activity timeline component
  ActivityForm.tsx          # Activity creation form
  SpotSelector.tsx          # Spot selection with search
  Navigation.tsx            # Main navigation component
  ClientMap.tsx             # Main map component
  SpotForm.tsx              # Add spot form
  SpotModal.tsx             # Spot details with activities
  /auth/
    UserMenu.tsx            # User authentication menu
/lib/
  types.ts                  # TypeScript interfaces for all entities
  auth.ts                   # Authentication token management
  api.ts                    # API utilities and helpers
  spots.ts                  # Spot type definition
/contexts/
  AuthContext.tsx           # Authentication context provider
/hooks/
  useAuth.ts               # Authentication hooks
/public/
  uploads/                  # Local image storage directory
```

### Development Notes

- The application uses Russian language in the UI
- Map defaults to Moscow coordinates (55.751244, 37.618423)
- Tea-themed icons and comprehensive icon system with Lucide React
- Strict TypeScript mode is disabled (`"strict": false`)
- Local file uploads are stored in `public/uploads/` and served statically
- Image uploads support drag-and-drop and URL input fallback
- Comprehensive activity data model with tea-specific metadata
- Strava-inspired design with social features
- Full authentication flow with Google OAuth integration
- API proxy routes handle frontend-backend communication securely

### Next Phase Recommendations

**Phase 4: Advanced Features (Recommended Next Steps)**
1. **Cloud File Upload Service**
   - Implement AWS S3 or Cloudinary integration
   - Add image processing and optimization
   - Support multiple file formats and sizes

2. **Real-time Features**
   - WebSocket integration for live activity updates
   - Real-time notifications for likes and comments
   - Live activity feed updates

3. **Social Features Enhancement**
   - Complete follow/unfollow system UI
   - Activity comments system
   - Activity sharing and social media integration

4. **Performance Optimization**
   - Implement caching with Redis
   - Add database query optimization
   - Implement background job processing

5. **Advanced Analytics**
   - User activity analytics and insights
   - Tea consumption patterns
   - Spot popularity and recommendations

## Memory Management

### Project Interactions
- To memorize a new key interaction, message or code insight about the Tea Map project