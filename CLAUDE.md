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

## Memory Management

### Project Interactions
- To memorize a new key interaction, message or code insight about the Tea Map project
- **New Memory**: To memorize
- Something to memorize